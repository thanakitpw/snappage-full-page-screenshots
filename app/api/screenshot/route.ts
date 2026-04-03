import { NextRequest, NextResponse } from "next/server";
import { launchBrowser, getViewport, type Viewport, type Format } from "@/lib/chromium";
import type { Page } from "playwright-core";

export const maxDuration = 60;

// Dismiss common popups, cookie banners, and modal overlays
async function dismissPopups(page: Page) {
  // Step 1: Press Escape to close any modal that listens to keyboard
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  // Step 2: Try clicking common dismiss buttons
  const dismissTexts = [
    "Accept", "Accept All", "Accept all", "Accept Cookies",
    "Got it", "I agree", "OK", "Allow", "Allow all",
    "Close", "Dismiss", "No thanks", "Not now", "Maybe later",
    "Continue", "Agree", "Confirm",
    "ยอมรับ", "ปิด", "ตกลง", "ยอมรับทั้งหมด",
  ];

  for (const text of dismissTexts) {
    try {
      const btn = page.locator(`button:has-text("${text}"), a:has-text("${text}")`).first();
      if (await btn.isVisible({ timeout: 150 })) {
        await btn.click({ timeout: 500 });
        await page.waitForTimeout(200);
      }
    } catch {
      // Ignore
    }
  }

  // Also try common close button selectors
  const closeSelectors = [
    '[data-dismiss]', '[data-close]', '.btn-close', '.close-btn',
    '[aria-label="Close"]', '[aria-label="close"]',
    '[role="dialog"] button', '[role="alertdialog"] button',
  ];

  for (const selector of closeSelectors) {
    try {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 150 })) {
        await btn.click({ timeout: 500 });
        await page.waitForTimeout(200);
      }
    } catch {
      // Ignore
    }
  }

  // Step 3: Escape again in case new modals appeared
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // Step 4: Nuclear option — inject CSS to forcefully hide ALL overlays
  await page.addStyleTag({
    content: `
      /* Hide all fixed/sticky positioned elements that are likely overlays */
      [role="dialog"],
      [role="alertdialog"],
      [aria-modal="true"],
      [class*="modal" i],
      [class*="popup" i],
      [class*="overlay" i],
      [class*="cookie" i],
      [class*="consent" i],
      [class*="gdpr" i],
      [class*="banner" i][style*="fixed"],
      [class*="notification" i][style*="fixed"],
      [class*="subscribe" i],
      [class*="newsletter" i],
      [class*="backdrop" i],
      [class*="lightbox" i],
      [class*="interstitial" i],
      [class*="dialog" i]:not(dialog),
      [class*="toast" i],
      [class*="promo" i],
      [id*="modal" i],
      [id*="popup" i],
      [id*="overlay" i],
      [id*="cookie" i],
      [id*="consent" i],
      [id*="gdpr" i],
      [id*="banner" i],
      [id*="newsletter" i],
      [id*="subscribe" i] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* Reset body overflow in case modal locked scrolling */
      html, body {
        overflow: visible !important;
        position: static !important;
      }
    `,
  });

  // Step 5: JS fallback — hide any remaining fixed elements covering the viewport
  await page.evaluate(() => {
    const allElements = document.querySelectorAll("*");
    for (const el of allElements) {
      const style = window.getComputedStyle(el);
      if (style.position !== "fixed" && style.position !== "sticky") continue;

      const tag = el.tagName.toLowerCase();
      // Skip nav/header — those are likely legitimate fixed navbars
      if (tag === "nav" || tag === "header") continue;

      const rect = el.getBoundingClientRect();
      const zIndex = parseInt(style.zIndex || "0", 10);

      // Full-screen backdrop
      if (
        rect.width >= window.innerWidth * 0.9 &&
        rect.height >= window.innerHeight * 0.9
      ) {
        (el as HTMLElement).style.setProperty("display", "none", "important");
        continue;
      }

      // Large centered element with high z-index = popup
      if (
        zIndex > 50 &&
        rect.width > 200 &&
        rect.height > 150 &&
        rect.left > 0 &&
        rect.top > 0
      ) {
        (el as HTMLElement).style.setProperty("display", "none", "important");
        continue;
      }

      // Bottom banners (cookie bars, etc)
      if (
        rect.bottom >= window.innerHeight - 10 &&
        rect.width > window.innerWidth * 0.5 &&
        rect.height < 300
      ) {
        (el as HTMLElement).style.setProperty("display", "none", "important");
      }
    }
  });

  await page.waitForTimeout(200);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    url,
    viewport = "desktop",
    format = "png",
    delay = 0,
    fullPage = true,
  } = body as {
    url: string;
    viewport: Viewport;
    format: Format;
    delay: number;
    fullPage: boolean;
  };

  // Validate URL
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json(
      { error: "URL must start with http:// or https://" },
      { status: 400 }
    );
  }

  // Validate viewport
  const vp = getViewport(viewport);
  if (!vp) {
    return NextResponse.json(
      { error: "Viewport must be desktop, tablet, or mobile" },
      { status: 400 }
    );
  }

  // Validate format
  if (!["png", "jpeg"].includes(format)) {
    return NextResponse.json(
      { error: "Format must be png or jpeg" },
      { status: 400 }
    );
  }

  // Validate delay
  const safeDelay = Math.min(Math.max(Number(delay) || 0, 0), 10000);

  let browser = null;

  try {
    browser = await launchBrowser();
    const context = await browser.newContext({ viewport: vp });
    const page = await context.newPage();

    await page.goto(url, { timeout: 45000, waitUntil: "load" });
    // Wait for network to settle, but don't hang on long-polling connections
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

    if (safeDelay > 0) {
      await page.waitForTimeout(safeDelay);
    }

    // Dismiss popups, then inject CSS to nuke remaining overlays right before screenshot
    await dismissPopups(page);

    const screenshotBuffer = await page.screenshot({
      fullPage,
      type: format,
    });

    const contentType = format === "png" ? "image/png" : "image/jpeg";
    const extension = format === "png" ? "png" : "jpg";

    return new NextResponse(new Uint8Array(screenshotBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="screenshot.${extension}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Screenshot error:", message);

    if (message.includes("Timeout")) {
      return NextResponse.json(
        { error: "Page load timed out after 30 seconds" },
        { status: 504 }
      );
    }

    if (
      message.includes("net::ERR_NAME_NOT_RESOLVED") ||
      message.includes("net::ERR_CONNECTION_REFUSED")
    ) {
      return NextResponse.json(
        { error: "Could not reach the website. Please check the URL." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to take screenshot: " + message },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
