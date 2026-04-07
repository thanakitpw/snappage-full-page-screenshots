import { NextRequest, NextResponse } from "next/server";
import { launchBrowser, getViewport } from "@/lib/chromium";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { url } = body as { url: string };

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json(
      { error: "URL must start with http:// or https://" },
      { status: 400 }
    );
  }

  let browser = null;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport(getViewport("desktop"));

    await page.goto(url, { timeout: 30000, waitUntil: "domcontentloaded" });
    await page.waitForNetworkIdle({ timeout: 5000 }).catch(() => {});

    const baseUrl = new URL(url);
    const origin = baseUrl.origin;

    // Extract all internal links
    const links = await page.evaluate((origin: string) => {
      const anchors = document.querySelectorAll("a[href]");
      const seen = new Set<string>();
      const results: { url: string; path: string; text: string }[] = [];

      for (const a of anchors) {
        try {
          const href = new URL((a as HTMLAnchorElement).href, document.location.origin);
          if (
            href.origin === origin &&
            href.protocol.startsWith("http") &&
            !seen.has(href.pathname)
          ) {
            seen.add(href.pathname);
            results.push({
              url: href.href,
              path: href.pathname,
              text:
                (a as HTMLAnchorElement).textContent?.trim().substring(0, 100) ||
                href.pathname,
            });
          }
        } catch {
          // Skip invalid URLs
        }
      }

      return results.sort((a, b) => a.path.localeCompare(b.path));
    }, origin);

    const title = await page.title();

    return NextResponse.json({
      scannedUrl: url,
      title,
      pages: [
        { url, path: baseUrl.pathname || "/", text: title || "Home" },
        ...links.filter((l) => l.path !== (baseUrl.pathname || "/")),
      ],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Scan error:", message);

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
      { error: "Failed to scan pages: " + message },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
