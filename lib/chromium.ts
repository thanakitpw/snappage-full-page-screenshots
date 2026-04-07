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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteerFull = require("puppeteer");
    return puppeteerFull.launch({ headless: true }) as Promise<Browser>;
  }

  if (!cachedPath) {
    cachedPath = await chromium.executablePath(CHROMIUM_URL);
  }

  // Clean up /tmp to prevent disk space exhaustion on warm invocations
  const fs = await import("fs");
  const tmpFiles = fs.readdirSync("/tmp").filter(
    (f) => f.startsWith("puppeteer") || f.startsWith("core.") || f.startsWith(".com.google")
  );
  for (const f of tmpFiles) {
    try { fs.rmSync(`/tmp/${f}`, { recursive: true, force: true }); } catch {}
  }

  return puppeteer.launch({
    args: [
      ...chromium.args,
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-sync",
      "--disable-translate",
      "--no-first-run",
      "--safebrowsing-disable-auto-update",
      "--js-flags=--max-old-space-size=512",
    ],
    executablePath: cachedPath,
    headless: true,
    protocolTimeout: 50000,
  });
}
