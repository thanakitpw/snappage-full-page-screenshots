"use client";

import { Camera, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/components/language-context";
import { localeNames, type Locale } from "@/lib/i18n";

export function Header() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Camera className="size-5 text-[#3B82F6]" />
          <span className="text-lg font-semibold text-[#1E293B]">
            {t("appName")}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Globe className="size-4 text-gray-500" />
          <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
            <SelectTrigger
              className="h-8 w-auto min-w-[100px] cursor-pointer border-none bg-transparent text-sm font-medium shadow-none"
              aria-label="Select language"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(localeNames) as [Locale, string][]).map(
                ([code, name]) => (
                  <SelectItem
                    key={code}
                    value={code}
                    className="cursor-pointer text-sm"
                  >
                    {name}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
