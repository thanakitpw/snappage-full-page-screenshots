"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/components/language-context";

export interface ScannedPage {
  url: string;
  path: string;
  text: string;
}

interface ScanResultsProps {
  pages: ScannedPage[];
  selectedPages: Set<string>;
  onTogglePage: (url: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCapture: () => void;
  loading: boolean;
}

export function ScanResults({
  pages,
  selectedPages,
  onTogglePage,
  onSelectAll,
  onDeselectAll,
  onCapture,
  loading,
}: ScanResultsProps) {
  const { t } = useLanguage();

  return (
    <div className="mt-6 rounded-lg border bg-white p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-[#1E293B]">
            {t("scanTitle")}
          </h3>
          <Badge variant="secondary">
            {pages.length} {t("scanFound")}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={onSelectAll}
          >
            {t("scanSelectAll")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={onDeselectAll}
          >
            {t("scanDeselectAll")}
          </Button>
        </div>
      </div>

      <ul className="max-h-72 space-y-1 overflow-y-auto">
        {pages.map((page) => (
          <li key={page.url}>
            <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-[#F8FAFC]">
              <Checkbox
                checked={selectedPages.has(page.url)}
                onCheckedChange={() => onTogglePage(page.url)}
                aria-label={`Select ${page.path}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#1E293B]">
                  {page.path}
                </p>
                <p className="truncate text-xs text-gray-500">{page.text}</p>
              </div>
            </label>
          </li>
        ))}
      </ul>

      <Button
        className="mt-4 w-full cursor-pointer bg-[#F97316] text-white hover:bg-[#F97316]/90"
        size="lg"
        disabled={selectedPages.size === 0 || loading}
        onClick={onCapture}
      >
        {t("btnCaptureSelected")} ({selectedPages.size})
      </Button>
    </div>
  );
}
