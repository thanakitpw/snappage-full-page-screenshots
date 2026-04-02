"use client";

import { useLanguage } from "@/components/language-context";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 text-center">
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-[#1E293B] sm:text-4xl">
        {t("heroTitle")}
      </h1>
      <p className="text-base text-gray-500 sm:text-lg">{t("heroSubtitle")}</p>
    </section>
  );
}
