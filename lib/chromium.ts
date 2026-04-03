import { chromium as playwrightChromium } from "playwright-core";
import chromium from "@sparticuz/chromium-min";

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const;

export type Viewport = keyof typeof VIEWPORTS;
export type Format = "png" | "jpeg";

// Chromium binary hosted on GitHub releases (must match installed @sparticuz/chromium-min version)
const CHROMIUM_URL =
  "https://github.com/nicosomb/chromium-pack/releases/download/v143.0.0/chromium-v143.0.0-pack.tar";

export function getViewport(viewport: Viewport) {
  return VIEWPORTS[viewport] || VIEWPORTS.desktop;
}

export async function launchBrowser() {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    // Local development: use system chromium installed via npx playwright install
    return playwrightChromium.launch({ headless: true });
  }

  // Production (Vercel): download chromium from CDN at runtime
  const executablePath = await chromium.executablePath(CHROMIUM_URL);
  return playwrightChromium.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });
}
