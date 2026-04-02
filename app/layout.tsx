import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { LanguageProvider } from "@/components/language-context";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SnapPage — Free Full-Page Website Screenshot Tool",
  description:
    "Capture full-page screenshots of any website instantly. Choose viewport size, format, scan for all pages, and download in seconds. Free and open source.",
  keywords: [
    "screenshot",
    "website screenshot",
    "full page screenshot",
    "capture website",
    "web screenshot tool",
    "free screenshot",
    "snappage",
  ],
  metadataBase: new URL("https://snappage.app"),
  alternates: {
    canonical: "https://snappage.app",
    languages: {
      en: "https://snappage.app",
      th: "https://snappage.app?lang=th",
    },
  },
  openGraph: {
    title: "SnapPage — Free Full-Page Website Screenshot Tool",
    description:
      "Capture full-page screenshots of any website instantly. Choose viewport, format, and download in seconds.",
    url: "https://snappage.app",
    siteName: "SnapPage",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapPage — Free Full-Page Website Screenshot Tool",
    description:
      "Capture full-page screenshots of any website instantly. Free and open source.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SnapPage",
  url: "https://snappage.app",
  description:
    "Free tool to capture full-page screenshots of any website. Choose viewport, format, scan pages, and download instantly.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSansThai.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col"
        style={{
          fontFamily:
            'Helvetica, "Helvetica Neue", Arial, var(--font-noto-thai), sans-serif',
        }}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
