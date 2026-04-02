"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, RotateCcw, X } from "lucide-react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-context";

interface ScreenshotResultProps {
  screenshots: { url: string; filename: string }[];
  hostname: string;
  onReset: () => void;
}

export function ScreenshotResult({
  screenshots,
  hostname,
  onReset,
}: ScreenshotResultProps) {
  const { t } = useLanguage();
  const prevUrls = useRef<string[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);

  const isBulk = screenshots.length > 1;

  useEffect(() => {
    const currentUrls = new Set(screenshots.map((s) => s.url));
    prevUrls.current.forEach((url) => {
      if (!currentUrls.has(url)) {
        URL.revokeObjectURL(url);
      }
    });
    prevUrls.current = screenshots.map((s) => s.url);
  }, [screenshots]);

  function downloadSingle(url: string, filename: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }

  async function downloadAsZip() {
    setZipping(true);
    try {
      const zip = new JSZip();
      const folderName = `${hostname}-snappage`;
      const folder = zip.folder(folderName)!;

      for (const s of screenshots) {
        const res = await fetch(s.url);
        const blob = await res.blob();
        folder.file(s.filename, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `${folderName}.zip`;
      a.click();
      URL.revokeObjectURL(zipUrl);
    } catch (err) {
      console.error("ZIP download failed:", err);
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#1E293B]">
          {isBulk ? t("resultTitleBulk") : t("resultTitle")}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer gap-1.5"
          onClick={onReset}
        >
          <RotateCcw className="size-4" />
          {t("btnAnother")}
        </Button>
      </div>

      {isBulk ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {screenshots.map((s, i) => (
              <button
                key={i}
                className="group relative cursor-pointer overflow-hidden rounded-md border transition-shadow duration-150 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                onClick={() => setLightboxUrl(s.url)}
                aria-label={`View screenshot ${i + 1}`}
              >
                <img
                  src={s.url}
                  alt={s.filename}
                  className="h-40 w-full object-cover object-top"
                />
                <div className="absolute inset-0 flex items-end justify-center bg-black/0 pb-2 transition-colors duration-150 group-hover:bg-black/20">
                  <span className="rounded bg-white/90 px-2 py-0.5 text-xs font-medium opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    {s.filename}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <Button
            className="mt-4 w-full cursor-pointer bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90"
            size="lg"
            disabled={zipping}
            onClick={downloadAsZip}
          >
            {zipping ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating ZIP...
              </>
            ) : (
              <>
                <Download className="size-4" />
                {t("btnDownloadAll")} (.zip)
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border">
            <img
              src={screenshots[0].url}
              alt="Screenshot preview"
              className="max-h-[500px] w-full object-contain"
            />
          </div>
          <Button
            className="mt-4 w-full cursor-pointer bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90"
            size="lg"
            onClick={() =>
              downloadSingle(screenshots[0].url, screenshots[0].filename)
            }
          >
            <Download className="size-4" />
            {t("btnDownload")}
          </Button>
        </>
      )}

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute right-4 top-4 cursor-pointer rounded-full bg-white/90 p-1.5 transition-colors duration-150 hover:bg-white"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close preview"
          >
            <X className="size-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="Screenshot full preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
