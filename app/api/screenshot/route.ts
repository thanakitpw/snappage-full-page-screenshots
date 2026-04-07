import { NextRequest, NextResponse } from "next/server";
import { launchBrowser, getViewport, type Viewport, type Format } from "@/lib/chromium";
import type { Page } from "puppeteer-core";

export const maxDuration = 60;

// Dismiss common popups, cookie banners, and modal overlays
async function dismissPopups(page: Page) {
  // Step 1: Press Escape
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 500));

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
      const btn = await page.$$(`xpath/.//button[contains(text(),"${text}")] | .//a[contains(text(),"${text}")]`);
      if (btn.length > 0) {
        const isVisible = await btn[0].boundingBox();
        if (isVisible) {
          await btn[0].click();
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    } catch {
      // Ignore
    }
  }

  // Step 3: Try common close button selectors
  const closeSelectors = [
    '[data-dismiss]', '[data-close]', '.btn-close', '.close-btn',
    '[aria-label="Close"]', '[aria-label="close"]',
  ];

  for (const selector of closeSelectors) {
    try {
      const el = await page.$(selector);
      if (el) {
        const box = await el.boundingBox();
        if (box) {
          await el.click();
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    } catch {
      // Ignore
    }
  }

  // Step 4: Escape again
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 300));

  // Step 5: Inject CSS to hide all overlays
  await page.addStyleTag({
    content: `
      [role="dialog"], [role="alertdialog"], [aria-modal="true"],
      [class*="modal" i], [class*="popup" i], [class*="overlay" i],
      [class*="cookie" i], [class*="consent" i], [class*="gdpr" i],
      [class*="subscribe" i], [class*="newsletter" i], [class*="backdrop" i],
      [class*="lightbox" i], [class*="interstitial" i], [class*="toast" i],
      [class*="promo" i],
      [id*="modal" i], [id*="popup" i], [id*="overlay" i],
      [id*="cookie" i], [id*="consent" i], [id*="gdpr" i],
      [id*="banner" i], [id*="newsletter" i], [id*="subscribe" i] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      html, body {
        overflow: visible !important;
        position: static !important;
      }
    `,
  });

  // Step 6: JS fallback for fixed elements
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("*")) {
      const style = window.getComputedStyle(el);
      if (style.position !== "fixed" && style.position !== "sticky") continue;
      const tag = el.tagName.toLowerCase();
      if (tag === "nav" || tag === "header") continue;

      const rect = el.getBoundingClientRect();
      const zIndex = parseInt(style.zIndex || "0", 10);

      if (rect.width >= window.innerWidth * 0.9 && rect.height >= window.innerHeight * 0.9) {
        (el as HTMLElement).style.setProperty("display", "none", "important");
      } else if (zIndex > 50 && rect.width > 200 && rect.height > 150) {
        (el as HTMLElement).style.setProperty("display", "none", "important");
      } else if (rect.bottom >= window.innerHeight - 10 && rect.width > window.innerWidth * 0.5 && rect.height < 300) {
        (el as HTMLElement).style.setProperty("display", "none", "important");
      }
    }
  });

  await new Promise((r) => setTimeout(r, 200));
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

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json(
      { error: "URL must start with http:// or https://" },
      { status: 400 }
    );
  }

  const vp = getViewport(viewport);
  if (!vp) {
    return NextResponse.json(
      { error: "Viewport must be desktop, tablet, or mobile" },
      { status: 400 }
    );
  }

  if (!["png", "jpeg"].includes(format)) {
    return NextResponse.json(
      { error: "Format must be png or jpeg" },
      { status: 400 }
    );
  }

  const safeDelay = Math.min(Math.max(Number(delay) || 0, 0), 10000);

  let browser = null;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport(vp);

    await page.goto(url, { timeout: 30000, waitUntil: "domcontentloaded" });
    // Soft wait for network idle — don't block if the page has long-polling
    await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {});

    if (safeDelay > 0) {
      await new Promise((r) => setTimeout(r, safeDelay));
    }

    await dismissPopups(page);

    const screenshotBuffer = await page.screenshot({
      fullPage,
      type: format,
    });

    const contentType = format === "png" ? "image/png" : "image/jpeg";
    const extension = format === "png" ? "png" : "jpg";

    return new NextResponse(Buffer.from(screenshotBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="screenshot.${extension}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Screenshot error:", message);

    if (message.includes("Timeout") || message.includes("timeout")) {
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
