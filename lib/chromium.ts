import { chromium as playwrightChromium } from "playwright-core";
import chromium from "@sparticuz/chromium-min";

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const;

export type Viewport = keyof typeof VIEWPORTS;
export type Format = "png" | "jpeg";

const CHROMIUM_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar";

export function getViewport(viewport: Viewport) {
  return VIEWPORTS[viewport] || VIEWPORTS.desktop;
}

export async function launchBrowser() {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    return playwrightChromium.launch({ headless: true });
  }

  chromium.setGraphicsMode = false;

  const executablePath = await chromium.executablePath(CHROMIUM_URL);
  return playwrightChromium.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });
}
