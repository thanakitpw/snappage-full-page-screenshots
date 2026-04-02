"use client";

import { useLanguage } from "@/components/language-context";

export function Footer() {
  const { t } = useLanguage();
  const powered = t("footerPowered");

  return (
    <footer className="border-t py-6 text-center text-sm text-gray-400">
      <p>
        © 2026 SnapPage.{" "}
        {powered && <>{powered} </>}
        <a
          href="https://www.bestsolutionscorp.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer text-gray-500 underline transition-colors duration-150 hover:text-[#3B82F6]"
        >
          {t("footerCompany")}
        </a>
      </p>
    </footer>
  );
}
