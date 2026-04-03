import chromium from "@sparticuz/chromium-min";
import puppeteer, { type Browser } from "puppeteer-core";

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const;

export type Viewport = keyof typeof VIEWPORTS;
export type Format = "png" | "jpeg";

const CHROMIUM_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar";

// Cache executable path across warm invocations
let cachedPath: string | null = null;

export function getViewport(viewport: Viewport) {
  return VIEWPORTS[viewport] || VIEWPORTS.desktop;
}

export async function launchBrowser(): Promise<Browser> {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    // Dev: use full puppeteer with bundled chromium
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteerFull = require("puppeteer");
    return puppeteerFull.launch({ headless: true }) as Promise<Browser>;
  }

  // Production: use @sparticuz/chromium-min with cached path
  if (!cachedPath) {
    cachedPath = await chromium.executablePath(CHROMIUM_URL);
  }

  return puppeteer.launch({
    args: chromium.args,
    executablePath: cachedPath,
    headless: true,
  });
}
