import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  metadataBase: new URL("https://snappage.bestsolutionscorp.com"),
  alternates: {
    canonical: "https://snappage.bestsolutionscorp.com",
    languages: {
      en: "https://snappage.bestsolutionscorp.com",
      th: "https://snappage.bestsolutionscorp.com?lang=th",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "SnapPage — Free Full-Page Website Screenshot Tool",
    description:
      "Capture full-page screenshots of any website instantly. Choose viewport, format, and download in seconds.",
    url: "https://snappage.bestsolutionscorp.com",
    siteName: "SnapPage",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://snappage.bestsolutionscorp.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "SnapPage — Free Full-Page Website Screenshot Tool",
      },
    ],
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
  url: "https://snappage.bestsolutionscorp.com",
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
        <Analytics />
      </body>
    </html>
  );
}
