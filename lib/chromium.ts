import { chromium as playwrightChromium } from "playwright-core";
import chromium from "@sparticuz/chromium";

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const;

export type Viewport = keyof typeof VIEWPORTS;
export type Format = "png" | "jpeg";

export function getViewport(viewport: Viewport) {
  return VIEWPORTS[viewport] || VIEWPORTS.desktop;
}

export async function launchBrowser() {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    // Local development: use system chromium
    return playwrightChromium.launch({ headless: true });
  }

  // Production (Vercel): use @sparticuz/chromium
  const executablePath = await chromium.executablePath();
  return playwrightChromium.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });
}
