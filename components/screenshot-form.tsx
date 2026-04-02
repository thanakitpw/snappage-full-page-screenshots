"use client";

import { useState, useCallback } from "react";
import { Camera, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/components/language-context";
import { ScanResults, type ScannedPage } from "@/components/scan-results";
import { ScreenshotResult } from "@/components/screenshot-result";

type Mode = "quick" | "scan";
type Viewport = "desktop" | "tablet" | "mobile";
type Format = "png" | "jpeg";

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function ScreenshotForm() {
  const { t } = useLanguage();

  // Form state
  const [url, setUrl] = useState("");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [format, setFormat] = useState<Format>("png");
  const [delay, setDelay] = useState(0);

  // Mode & results state
  const [mode, setMode] = useState<Mode>("quick");
  const [scanResults, setScanResults] = useState<ScannedPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [screenshots, setScreenshots] = useState<
    { url: string; filename: string }[]
  >([]);
  const [targetHostname, setTargetHostname] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");

  const resetResults = useCallback(() => {
    setScreenshots([]);
    setScanResults([]);
    setSelectedPages(new Set());
    setMode("quick");
    setError("");
  }, []);

  function validateUrl(): string | null {
    if (!url.trim()) return t("errorUrlRequired");
    const normalized = normalizeUrl(url);
    if (!isValidUrl(normalized)) return t("errorUrlInvalid");
    return null;
  }

  async function captureScreenshot(targetUrl: string): Promise<Blob> {
    const res = await fetch("/api/screenshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: targetUrl,
        viewport,
        format,
        delay,
        fullPage: true,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    return res.blob();
  }

  async function handleQuickCapture() {
    const validationError = validateUrl();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const normalized = normalizeUrl(url);
      const blob = await captureScreenshot(normalized);
      const blobUrl = URL.createObjectURL(blob);
      const hostname = new URL(normalized).hostname;
      setTargetHostname(hostname);
      setScreenshots([
        { url: blobUrl, filename: `${hostname}-screenshot.${format}` },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to capture screenshot");
    } finally {
      setLoading(false);
    }
  }

  async function handleScan() {
    const validationError = validateUrl();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    setMode("scan");
    setScanResults([]);
    setSelectedPages(new Set());

    try {
      const normalized = normalizeUrl(url);
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setScanResults(data.pages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan pages");
      setMode("quick");
    } finally {
      setLoading(false);
    }
  }

  async function handleCaptureSelected() {
    if (selectedPages.size === 0) {
      setError(t("errorNoPages"));
      return;
    }

    setError("");
    setLoading(true);

    const selected = scanResults.filter((p) => selectedPages.has(p.url));
    const total = selected.length;
    setLoadingProgress({ current: 0, total });

    const results: { url: string; filename: string }[] = [];

    try {
      const normalized = normalizeUrl(url);
      const hostname = new URL(normalized).hostname;
      setTargetHostname(hostname);

      for (let i = 0; i < selected.length; i++) {
        setLoadingProgress({ current: i + 1, total });
        const page = selected[i];
        const blob = await captureScreenshot(page.url);
        const blobUrl = URL.createObjectURL(blob);
        const safePath = page.path.replace(/\//g, "_").replace(/^_/, "") || "home";
        results.push({
          url: blobUrl,
          filename: `${safePath}.${format}`,
        });
      }
      setScreenshots(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to capture screenshots");
    } finally {
      setLoading(false);
      setLoadingProgress({ current: 0, total: 0 });
    }
  }

  function togglePage(pageUrl: string) {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageUrl)) {
        next.delete(pageUrl);
      } else {
        next.add(pageUrl);
      }
      return next;
    });
  }

  function selectAllPages() {
    setSelectedPages(new Set(scanResults.map((p) => p.url)));
  }

  function deselectAllPages() {
    setSelectedPages(new Set());
  }

  // Show results if we have screenshots
  if (screenshots.length > 0) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4">
        <ScreenshotResult screenshots={screenshots} hostname={targetHostname} onReset={resetResults} />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        {/* URL Input */}
        <div className="mb-4">
          <label
            htmlFor="url-input"
            className="mb-1.5 block text-sm font-medium text-[#1E293B]"
          >
            {t("labelUrl")}
          </label>
          <Input
            id="url-input"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuickCapture();
            }}
            className="h-11 text-base"
            aria-invalid={!!error}
          />
          {error && (
            <p className="mt-1.5 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Options row */}
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Viewport */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1E293B]">
              {t("labelViewport")}
            </label>
            <Select value={viewport} onValueChange={(v) => setViewport(v as Viewport)}>
              <SelectTrigger className="w-full cursor-pointer" aria-label={t("labelViewport")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop" className="cursor-pointer">
                  {t("optDesktop")}
                </SelectItem>
                <SelectItem value="tablet" className="cursor-pointer">
                  {t("optTablet")}
                </SelectItem>
                <SelectItem value="mobile" className="cursor-pointer">
                  {t("optMobile")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1E293B]">
              {t("labelFormat")}
            </label>
            <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
              <SelectTrigger className="w-full cursor-pointer" aria-label={t("labelFormat")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png" className="cursor-pointer">
                  PNG
                </SelectItem>
                <SelectItem value="jpeg" className="cursor-pointer">
                  JPEG
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delay */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1E293B]">
              {t("labelDelay")}
            </label>
            <Select
              value={String(delay)}
              onValueChange={(v) => setDelay(Number(v))}
            >
              <SelectTrigger className="w-full cursor-pointer" aria-label={t("labelDelay")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0" className="cursor-pointer">
                  {t("optNoDelay")}
                </SelectItem>
                <SelectItem value="1000" className="cursor-pointer">
                  1s
                </SelectItem>
                <SelectItem value="3000" className="cursor-pointer">
                  3s
                </SelectItem>
                <SelectItem value="5000" className="cursor-pointer">
                  5s
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action buttons */}
        <Button
          className="w-full cursor-pointer bg-[#F97316] text-white hover:bg-[#F97316]/90"
          size="lg"
          disabled={loading}
          onClick={handleQuickCapture}
        >
          {loading && mode === "quick" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("loadingText")}
            </>
          ) : (
            <>
              <Camera className="size-4" />
              {t("btnCapture")}
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="mt-2 w-full cursor-pointer border-[#60A5FA] text-[#3B82F6] hover:bg-[#3B82F6]/5"
          size="lg"
          disabled={loading}
          onClick={handleScan}
        >
          {loading && mode === "scan" && scanResults.length === 0 ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("scanLoading")}
            </>
          ) : (
            <>
              <Search className="size-4" />
              {t("btnScan")}
            </>
          )}
        </Button>

        {/* Loading progress for bulk capture */}
        {loading && loadingProgress.total > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            <Loader2 className="mx-auto mb-1 size-5 animate-spin text-[#3B82F6]" />
            {t("loadingBulk")} {loadingProgress.current} {t("loadingOf")}{" "}
            {loadingProgress.total}
          </div>
        )}
      </div>

      {/* Scan results */}
      {mode === "scan" && scanResults.length > 0 && (
        <ScanResults
          pages={scanResults}
          selectedPages={selectedPages}
          onTogglePage={togglePage}
          onSelectAll={selectAllPages}
          onDeselectAll={deselectAllPages}
          onCapture={handleCaptureSelected}
          loading={loading}
        />
      )}
    </section>
  );
}
