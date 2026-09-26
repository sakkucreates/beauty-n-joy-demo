import { chromium, BrowserContext } from "playwright";
import fs from "fs";
import path from "path";

export interface ScrapedReview {
  "Author Name": string | null;
  Rating: number | null;
  Comment: string;
  reviewImageUrls?: string[];
}

export interface ScrapedBusinessData {
  businessName: string | null;
  rating: number | null;
  reviewCount: number | null;
  address: string | null;
  phone: string | null;
  category: string | null;
  website: string | null;
  hours: string | null;
  latitude: number | null;
  longitude: number | null;
  businessImageUrls: string[];
  rawBusinessImageUrls: string[];
  reviews: ScrapedReview[];
  reviewImageUrls: string[];
  previewCandidateCount?: number;
  completeCandidateCount?: number;
  completeEntryFound?: boolean;
  completeEntryClicked?: boolean;
  completeGalleryDetected?: boolean;
  galleryViewerType?: string;
  galleryContainerSelector?: string;
  photoCategoriesCount?: number;
  activePhotoCategory?: string;
  initialCompletePhotosCount?: number;
  initialVisiblePhotoCount?: number;
  uniqueGalleryPhotosDiscovered?: number;
  totalScrollAttempts?: number;
  totalNavigationClicks?: number;
  maxScrollPosition?: number;
  galleryEndEvidence?: string;
  galleryExhausted?: boolean;
  galleryOpened?: boolean;
  galleryContainerIdentified?: boolean;
}

/**
 * Normalizes a raw business name into a safe, deterministic directory name.
 * Example: "Beauty & Blush" -> "BeautyBlush"
 */
export function normalizeBusinessName(name: string | null | undefined): string {
  if (!name || typeof name !== "string") return "";

  const words = name
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "";

  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

/**
 * Downloads an image using Playwright's browser context request context.
 * Enforces session headers, User-Agent, Referer, and verifies buffer.length > 0 to prevent 0-byte files.
 */
export async function downloadImageWithContext(
  context: BrowserContext,
  url: string,
  destPath: string,
  userAgent: string
): Promise<{ success: boolean; bytes: number }> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await context.request.get(url, {
        headers: {
          Referer: "https://www.google.com/",
          "User-Agent": userAgent,
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
        timeout: 20000,
      });

      if (response.ok()) {
        const buffer = await response.body();
        if (buffer && buffer.length > 0) {
          fs.writeFileSync(destPath, buffer);
          return { success: true, bytes: buffer.length };
        }
      }
    } catch (err: any) {
      if (attempt === 3) {
        console.error(`[GoogleMaps] Playwright context download error for ${url}:`, err.message || err);
      }
    }

    // Fallback to standard Node fetch if browser context request failed
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": userAgent,
          Referer: "https://www.google.com/",
        },
      });
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        if (buffer && buffer.length > 0) {
          fs.writeFileSync(destPath, buffer);
          return { success: true, bytes: buffer.length };
        }
      }
    } catch (err: any) {
      if (attempt === 3) {
        console.error(`[GoogleMaps] Fallback fetch download error for ${url}:`, err.message || err);
      }
    }

    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return { success: false, bytes: 0 };
}

/**
 * Validates and filters photo URLs, excluding logos, profile avatars, UI icons, and placeholders.
 */
export function isValidBusinessPhotoUrl(u: string | null): string | null {
  if (!u || typeof u !== "string" || u.length < 25) return null;
  if (
    u.startsWith("data:") ||
    u.includes("cleardot") ||
    u.includes("favicon") ||
    u.includes("mapslogo") ||
    u.includes("staticmap") ||
    (u.endsWith(".png") && u.includes("google"))
  )
    return null;

  // Exclude profile logos & avatars: /a/, /a-/, /user/, avatar, logo, =s32, =s48, =s60, =s120
  if (
    u.includes("/a/") ||
    u.includes("/a-/") ||
    u.includes("/user/") ||
    u.includes("avatar") ||
    u.includes("logo") ||
    u.includes("google-acc") ||
    u.includes("google-account") ||
    u.includes("=s32") ||
    u.includes("=s48") ||
    u.includes("=s60") ||
    u.includes("=s120")
  )
    return null;

  // Accept valid google place photos on googleusercontent, ggpht, or streetviewpixels
  if (
    u.includes("googleusercontent.com") ||
    u.includes("ggpht.com") ||
    u.includes("streetviewpixels")
  ) {
    if (u.includes("googleusercontent.com") || u.includes("ggpht.com")) {
      return u.replace(/=w\d+-h\d+.*$/, "=s1600").replace(/=s\d+.*$/, "=s1600");
    }
    return u;
  }

  return null;
}

/**
 * Robust local Google Maps scraper using Playwright Chromium.
 */
export async function scrapeGoogleMaps(
  url: string,
  maxImages: number = 50,
  maxReviews: number = 50,
  browserContextRef?: { context: BrowserContext; userAgent: string; close?: () => Promise<void> }
): Promise<ScrapedBusinessData> {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--lang=en-US",
    ],
  });

  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent,
    locale: "en-US",
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (browserContextRef) {
    browserContextRef.context = context;
    browserContextRef.userAgent = userAgent;
  }

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  const page = await context.newPage();

  try {
    console.log(`[GoogleMaps] Navigating to: ${url}`);

    // 1. Navigate & follow redirects
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 35000 });
    } catch (err: any) {
      throw new Error(`Could not load Google Maps page: ${err.message || "Timeout/Navigation error"}`);
    }

    // 2. Handle Google Consent popup if encountered
    try {
      const consentBtn = page.locator(
        'button[aria-label*="Accept"], button:has-text("Accept all"), form[action*="consent"] button, button:has-text("I agree")'
      );
      if ((await consentBtn.count()) > 0) {
        await consentBtn.first().click();
        await page.waitForTimeout(2000);
      }
    } catch {
      // Ignore consent click error if not present
    }

    // Check if place detail panel (Overview or Reviews tab) loaded directly from input URL
    let hasPlaceDetails =
      (await page
        .locator('button[role="tab"]:has-text("Overview"), button[role="tab"]:has-text("Reviews"), div[role="tab"]:has-text("Overview")')
        .count()) > 0;

    if (!hasPlaceDetails) {
      console.log("[GoogleMaps] Place detail panel not loaded from input URL. Attempting search fallback...");
      const urlMatch = url.match(/\/place\/([^/@?]+)/) || url.match(/query=([^&]+)/);
      let query = urlMatch ? decodeURIComponent(urlMatch[1].replace(/\+/g, " ")) : "";
      if (!query) {
        const parts = url.split("/");
        const placeIdx = parts.indexOf("place");
        if (placeIdx !== -1 && parts[placeIdx + 1]) {
          query = decodeURIComponent(parts[placeIdx + 1].replace(/\+/g, " "));
        }
      }
      if (query) {
        const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
        console.log(`[GoogleMaps] Fallback navigating to search URL: ${searchUrl}`);
        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 35000 }).catch(() => {});
        await page.waitForTimeout(4000);
      }
    }

    // Wait for main panel, place title, or result list to load
    await page.waitForSelector("h1, div[role=\"main\"], div.Nv2pk", { timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // If search result list view is present, click first non-sponsored place card to expand place detail panel
    try {
      const placeCardCandidates = page.locator('a[href*="/maps/place/"], div.Nv2pk a, a.hfA2B');
      const cardCount = await placeCardCandidates.count();
      for (let i = 0; i < cardCount; i++) {
        const card = placeCardCandidates.nth(i);
        if (await card.isVisible().catch(() => false)) {
          const txt = (await card.innerText().catch(() => "")).toLowerCase();
          const parentTxt = (await card.evaluate((el) => el.parentElement?.innerText || "").catch(() => "")).toLowerCase();
          if (!txt.includes("sponsored") && !parentTxt.includes("sponsored")) {
            await card.click().catch(() => {});
            await page.waitForTimeout(3500);
            break;
          }
        }
      }
    } catch {}

    const finalUrl = page.url();
    console.log(`[GoogleMaps] Business page loaded`);

    // Validate Google Maps location
    if (!finalUrl.includes("google.com/maps") && !finalUrl.includes("maps.google.com")) {
      throw new Error("Could not load Google Maps page. Navigated URL is not a valid Google Maps location.");
    }

    // 3. Extract Coordinates (Latitude & Longitude)
    let latitude: number | null = null;
    let longitude: number | null = null;

    const urlCoordsMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (urlCoordsMatch) {
      latitude = parseFloat(urlCoordsMatch[1]);
      longitude = parseFloat(urlCoordsMatch[2]);
    } else {
      const dataCoordsMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (dataCoordsMatch) {
        latitude = parseFloat(dataCoordsMatch[1]);
        longitude = parseFloat(dataCoordsMatch[2]);
      }
    }

    // 4. Extract Business Name
    let businessName: string | null = null;
    const h1Els = await page.locator("h1").allInnerTexts().catch(() => []);
    for (const txt of h1Els) {
      const trimmed = txt.trim();
      if (
        trimmed &&
        trimmed.toLowerCase() !== "results" &&
        trimmed.toLowerCase() !== "search results" &&
        !trimmed.toLowerCase().includes("sponsored") &&
        !trimmed.toLowerCase().includes("google maps")
      ) {
        businessName = trimmed;
        break;
      }
    }

    if (!businessName) {
      const title = await page.title();
      if (title && !title.toLowerCase().startsWith("google maps")) {
        businessName = title.replace(/\s*-\s*Google Maps\s*/i, "").trim();
      }
    }

    if (!businessName) {
      const urlMatch = finalUrl.match(/\/place\/([^/@?]+)/);
      if (urlMatch) {
        try {
          businessName = decodeURIComponent(urlMatch[1].replace(/\+/g, " "));
        } catch {
          businessName = urlMatch[1].replace(/\+/g, " ");
        }
      }
    }

    // 5. Extract Rating & Review Count
    const ratingReviewData = await page.evaluate(() => {
      let r: number | null = null;
      let rc: number | null = null;

      const ariaElements = Array.from(document.querySelectorAll("[aria-label]"));
      for (const el of ariaElements) {
        const aria = el.getAttribute("aria-label") || "";
        if (r === null) {
          const m = aria.match(/(\d\.\d)\s*stars?/i);
          if (m) r = parseFloat(m[1]);
        }
        if (rc === null) {
          const m = aria.match(/([\d,]+)\s*reviews?/i);
          if (m) rc = parseInt(m[1].replace(/,/g, ""), 10);
        }
      }

      if (r === null) {
        const ratingSpan = document.querySelector(
          "div.F7L8fd span[aria-hidden=\"true\"], span.ce3T27, span.fontDisplayLarge, span.MW4fe3"
        );
        if (ratingSpan) {
          const val = parseFloat((ratingSpan as HTMLElement).innerText.trim());
          if (!isNaN(val) && val >= 1 && val <= 5) r = val;
        }
      }

      if (rc === null) {
        const countSpan = document.querySelector("button[jsaction*=\"review\"] span, span.F7L8fd, span.EHPhf, span.UY7F9");
        if (countSpan) {
          const m = (countSpan as HTMLElement).innerText.match(/([\d,]+)/);
          if (m) rc = parseInt(m[1].replace(/,/g, ""), 10);
        }
      }

      return { rating: r, reviewCount: rc };
    });

    // 6. Extract Address, Phone, Category, Website, Opening Hours
    const details = await page.evaluate(() => {
      let address: string | null = null;
      let phone: string | null = null;
      let category: string | null = null;
      let website: string | null = null;
      let hours: string | null = null;

      const catBtn = document.querySelector("button[jsaction*=\"category\"]");
      if (catBtn) {
        category = (catBtn as HTMLElement).innerText.trim();
      } else {
        const catSpan = document.querySelector("button.DkEaL, span.DkEaL, div.Nv2pk .W4Efsd");
        if (catSpan) {
          const txt = (catSpan as HTMLElement).innerText.trim();
          if (txt && !txt.includes("·") && !txt.includes("Closed") && !txt.includes("Open")) {
            category = txt;
          }
        }
      }

      const itemBtns = Array.from(document.querySelectorAll("[data-item-id]"));
      for (const btn of itemBtns) {
        const itemId = btn.getAttribute("data-item-id") || "";
        const text = ((btn as HTMLElement).innerText || "").trim();
        const aria = btn.getAttribute("aria-label") || "";

        if (itemId === "address" || itemId.includes("address")) {
          address = text.replace(/^[\n\s]+/, "").trim() || aria.replace(/^Address:\s*/i, "").trim() || null;
        } else if (itemId.startsWith("phone")) {
          phone = text.replace(/^[\n\s]+/, "").trim() || aria.replace(/^Phone:\s*/i, "").trim() || null;
        } else if (itemId === "authority") {
          website =
            text.replace(/^[\n\s]+/, "").trim() ||
            btn.getAttribute("href") ||
            aria.replace(/^Website:\s*/i, "").trim() ||
            null;
        } else if (itemId.includes("oh") || aria.toLowerCase().includes("hours")) {
          hours = aria || text || null;
        }
      }

      return { address, phone, category, website, hours };
    });

    // --- 7. DEDICATED REVIEWS & REVIEW PHOTO EXTRACTION FLOW (RUNS FIRST ON OVERVIEW PANEL) ---
    let reviews: ScrapedReview[] = [];
    const globalReviewImagesSet = new Set<string>();
    let reviewsSectionOpened = false;

    if (maxReviews > 0) {
      console.log("[GoogleMaps] Locating Reviews section on Overview panel...");

      // Wait for main tab bar / Reviews tab to render in DOM
      await page
        .waitForSelector('button[role="tab"]:has-text("Reviews"), button[jsaction*="pane.review"], button:has-text("Reviews"), div[role="tab"]:has-text("Reviews")', { timeout: 7000 })
        .catch(() => {});

      // Click Reviews tab directly on main panel with retries
      const reviewSelectors = [
        'button[role="tab"]:has-text("Reviews")',
        'button[role="tab"]:has-text("reviews")',
        'button[jsaction*="pane.review"]',
        'button[jsaction*="review"]',
        'button[data-tab-index="1"]',
        'button[aria-label*="Reviews"]',
        'button[aria-label*="reviews"]',
        'button:has-text("Reviews")',
        'button:has-text("reviews")',
        'div[role="tab"]:has-text("Reviews")',
        'span:has-text("Reviews")',
      ];

      for (let retry = 0; retry < 3; retry++) {
        for (const sel of reviewSelectors) {
          const btn = page.locator(sel).first();
          if ((await btn.count()) > 0) {
            await btn.click({ force: true }).catch(() => {});
            await page.waitForTimeout(2500);
            reviewsSectionOpened = true;
            break;
          }
        }
        if (reviewsSectionOpened) break;
        await page.waitForTimeout(1000);
      }

      if (!reviewsSectionOpened) {
        reviewsSectionOpened = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll('button[role="tab"], button[jsaction*="review"], button[data-tab-index="1"], button, div[role="tab"]'));
          for (const el of els) {
            const txt = (el as HTMLElement).innerText || el.getAttribute('aria-label') || '';
            if (txt && (txt.toLowerCase().includes('reviews') || txt.toLowerCase().includes('review'))) {
              (el as HTMLElement).click();
              return true;
            }
          }
          return false;
        }).catch(() => false);
        if (reviewsSectionOpened) {
          await page.waitForTimeout(2500);
        }
      }

      console.log(`[GoogleMaps] Reviews section opened: ${reviewsSectionOpened}`);

      if (reviewsSectionOpened) {
        await page
          .waitForSelector("div[data-review-id], div.jftiEf, div.jJCo2e, div.WMwTyd", { timeout: 8000 })
          .catch(() => {});

        const scrollCount = Math.min(10, Math.ceil(maxReviews / 4));
        for (let i = 0; i < scrollCount; i++) {
          await page.evaluate(() => {
            const containers = Array.from(
              document.querySelectorAll('div.m6QEwb, div.DxyBCb, div[role="region"], div[role="main"], div.DkEaL, div[role="dialog"]')
            );
            for (const c of containers) {
              if (c.scrollHeight > c.clientHeight + 10) {
                c.scrollTop += 1800;
                c.dispatchEvent(new Event('scroll', { bubbles: true }));
              }
            }
          }).catch(() => {});
          await page.mouse.wheel(0, 1500).catch(() => {});
          await page.keyboard.press("PageDown").catch(() => {});
          await page.waitForTimeout(650);
        }

        const reviewExtractResult = await page.evaluate(
          ({ limit }) => {
            const reviewEls = Array.from(
              document.querySelectorAll(
                "div[data-review-id], div.jftiEf, div.jJCo2e, div.gws-localreviews__google-review, div.WMwTyd, div.W3Lvq, div.G1570b, div.MyWfle, div[role=\"article\"]"
              )
            );

            const resultList: ScrapedReview[] = [];
            const seenKeys = new Set<string>();

            function cleanReviewImg(u: string | null): string | null {
              if (!u || typeof u !== "string" || u.length < 20) return null;
              if (
                u.startsWith("data:") ||
                u.includes("cleardot") ||
                u.includes("favicon") ||
                u.includes("/a/") ||
                u.includes("/a-/") ||
                u.includes("avatar") ||
                u.includes("/user/") ||
                u.includes("google-acc") ||
                u.includes("=s32") ||
                u.includes("=s48") ||
                u.includes("=s60")
              )
                return null;
              if (u.includes("googleusercontent.com") || u.includes("ggpht.com")) {
                return u.replace(/=w\d+-h\d+.*$/, "=s1600").replace(/=s\d+.*$/, "=s1600");
              }
              return null;
            }

            for (const el of reviewEls) {
              if (resultList.length >= limit) break;

              const authorEl = el.querySelector(".d4r55, .TSZ13b, .X43p2b, .fontTitleMedium, button[data-href*=\"contrib\"]");
              let author = authorEl ? (authorEl as HTMLElement).innerText.trim() : null;
              if (!author) {
                author = el.getAttribute("aria-label") || null;
              }

              let ratingVal: number | null = null;
              const ratingEl = el.querySelector('span[role="img"][aria-label*="star"], span[aria-label*="stars"], span.kvMYJc');
              if (ratingEl) {
                const aria = ratingEl.getAttribute("aria-label") || "";
                const m = aria.match(/(\d+(\.\d+)?)/);
                if (m) ratingVal = parseFloat(m[1]);
              }

              const commentEl = el.querySelector(".wiI7pd, .wiC3df, .MyWfle, .K838ce, span.break-word, .rNbW2d, .zTiZ1c");
              const comment = commentEl ? (commentEl as HTMLElement).innerText.trim() : "";

              const revImgs: string[] = [];
              const imgEls = Array.from(
                el.querySelectorAll(
                  'button.Tya61d img, button[aria-label*="photo"] img, button[aria-label*="Photo"] img, img[src*="googleusercontent.com"], img[src*="ggpht.com"]'
                )
              );
              for (const img of imgEls) {
                const src = (img as HTMLImageElement).getAttribute("src") || (img as HTMLImageElement).currentSrc;
                const cleaned = cleanReviewImg(src);
                if (cleaned) {
                  revImgs.push(cleaned);
                }
              }

              const dedupeKey = `${author || ""}_${ratingVal}_${comment.slice(0, 30)}`;
              if ((author || comment || ratingVal !== null) && !seenKeys.has(dedupeKey)) {
                seenKeys.add(dedupeKey);
                resultList.push({
                  "Author Name": author,
                  Rating: ratingVal,
                  Comment: comment,
                  reviewImageUrls: Array.from(new Set(revImgs)),
                });
              }
            }

            return resultList;
          },
          { limit: maxReviews }
        );

        reviews = reviewExtractResult;
        for (const rev of reviews) {
          if (rev.reviewImageUrls) {
            for (const imgUrl of rev.reviewImageUrls) {
              globalReviewImagesSet.add(imgUrl);
            }
          }
        }
      }
    }

    const reviewImageUrls = Array.from(globalReviewImagesSet).slice(0, maxReviews);
    console.log(`[GoogleMaps] Reviews extracted: ${reviews.length}`);
    console.log(`[GoogleMaps] Review image URLs found: ${reviewImageUrls.length}`);

    // --- 8. DEDICATED BUSINESS PHOTO EXTRACTION FLOW (RUNS SECOND) ---
    const rawBusinessImageUrlsSet = new Set<string>();
    const filteredBusinessImageUrlsSet = new Set<string>();
    let previewCandidateCount = 0;
    let completeCandidateCount = 0;
    let completeEntryFound = false;
    let completeEntryClicked = false;
    let completeGalleryDetected = false;
    let galleryViewerType = "unknown";
    let galleryContainerSelector = "unknown";
    let photoCategoriesCount = 0;
    let activePhotoCategory = "All";
    let initialCompletePhotosCount = 0;
    let initialVisiblePhotoCount = 0;
    let totalScrollAttempts = 0;
    let totalNavigationClicks = 0;
    let maxScrollPosition = 0;
    let galleryExhausted = false;
    let galleryEndEvidence = "";

    const isAllPhotosMode = maxImages <= 0 || maxImages === Infinity || maxImages === undefined || maxImages === null;

    console.log("Photo scrape configuration:", {
      maxImages,
      allPhotos: isAllPhotosMode,
      allPhotosMode: isAllPhotosMode,
    });

    // Return to Overview tab if Reviews tab was opened
    if (reviewsSectionOpened) {
      console.log("[GoogleMaps] Returning to Overview tab before Business Photos extraction...");
      const overviewSelectors = [
        'button[role="tab"]:has-text("Overview")',
        'button[role="tab"]:has-text("overview")',
        'button[data-tab-index="0"]',
        'div[role="tab"]:has-text("Overview")',
        'button:has-text("Overview")',
      ];
      for (const sel of overviewSelectors) {
        const btn = page.locator(sel).first();
        if ((await btn.count()) > 0 && (await btn.isVisible().catch(() => false))) {
          await btn.click({ force: true }).catch(() => {});
          await page.waitForTimeout(2000);
          break;
        }
      }
    }

    // 1. Candidate Button Inspection
    previewCandidateCount = await page
      .locator(
        'button[jsaction*="heroHeaderImage"], button[aria-label*="Photo of"], button:has-text("See photos")'
      )
      .count();

    // Wait for header image pack / photos button to render in DOM
    await page
      .waitForSelector('button[jsaction*="imagepack.button"], button:has-text("Photos"), button[role="tab"]:has-text("Photos")', { timeout: 6000 })
      .catch(() => {});

    // Complete entry point candidates: imagepack buttons or tabs, EXCLUDING Street View and Add photos
    const completeCandidatesLocator = page.locator(
      'button[jsaction*="imagepack.button"], button:has-text("Photos"), button[role="tab"]:has-text("Photos"), button[data-tab-index="2"]'
    );

    completeCandidateCount = await completeCandidatesLocator.count();
    console.log(`[GoogleMaps] Preview candidate buttons found: ${previewCandidateCount}`);
    console.log(`[GoogleMaps] Complete gallery candidate buttons found: ${completeCandidateCount}`);

    // Find the specific complete gallery entry button (e.g. matching "55+ Photos" or "Photos")
    let completeEntryButton = null;
    const count = await completeCandidatesLocator.count();
    for (let i = 0; i < count; i++) {
      const btn = completeCandidatesLocator.nth(i);
      if (await btn.isVisible().catch(() => false)) {
        const text = (await btn.innerText().catch(() => "")).trim();
        const aria = (await btn.getAttribute("aria-label").catch(() => "")) || "";
        const combined = `${text} ${aria}`;

        if (
          combined.includes("Street View") ||
          combined.includes("Add photos") ||
          combined.includes("Add a photo") ||
          combined.toLowerCase().includes("review") ||
          /Photo \d+ of/i.test(combined)
        ) {
          continue;
        }

        // Prioritize button with explicit photo count e.g. "55+ Photos" or "55 Photos"
        if (/\d+\+?\s*Photos/i.test(text) || /\d+\+?\s*Photos/i.test(aria)) {
          completeEntryButton = btn;
          completeEntryFound = true;
          console.log(`[GoogleMaps] Selected explicit photo count entry button: "${text || aria}"`);
          break;
        }
      }
    }

    if (!completeEntryButton && count > 0) {
      // Fallback check: non-StreetView button with text containing "Photos" in imagepack or tab
      for (let i = 0; i < count; i++) {
        const btn = completeCandidatesLocator.nth(i);
        if (await btn.isVisible().catch(() => false)) {
          const text = (await btn.innerText().catch(() => "")).trim();
          const aria = (await btn.getAttribute("aria-label").catch(() => "")) || "";
          const combined = `${text} ${aria}`;
          if (
            !combined.includes("Street View") &&
            !combined.includes("Add photos") &&
            !combined.toLowerCase().includes("review") &&
            !/Photo \d+ of/i.test(combined) &&
            (text.toLowerCase().includes("photos") || aria.toLowerCase().includes("photos"))
          ) {
            completeEntryButton = btn;
            completeEntryFound = true;
            console.log(`[GoogleMaps] Selected fallback photo entry button: "${text || aria}"`);
            break;
          }
        }
      }
    }

    console.log(`[GoogleMaps] Complete entry point found: ${completeEntryFound}`);

    // Click complete entry point button
    if (completeEntryButton) {
      await completeEntryButton.click().catch(() => {});
      await page.waitForTimeout(3500);
      completeEntryClicked = true;
      totalNavigationClicks++;
    } else {
      // Fallback click on any available photo button
      const fallbackSel = [
        'button[jsaction*="imagepack.button"]',
        'button[role="tab"]:has-text("Photos")',
        'button[data-tab-index="2"]',
        'button:has-text("See photos")',
        'button[aria-label*="Photo of"]',
      ];
      for (const sel of fallbackSel) {
        const btn = page.locator(sel).first();
        if ((await btn.count()) > 0 && (await btn.isVisible().catch(() => false))) {
          const text = (await btn.innerText().catch(() => "")).trim();
          if (!text.includes("Street View") && !text.includes("Add photos")) {
            await btn.click().catch(() => {});
            await page.waitForTimeout(3500);
            completeEntryClicked = true;
            totalNavigationClicks++;
            break;
          }
        }
      }
    }

    console.log(`[GoogleMaps] Complete entry point clicked: ${completeEntryClicked}`);

    // Take debug screenshot
    try {
      const debugDir = path.join(process.cwd(), "debug");
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }
      await page.screenshot({ path: path.join(debugDir, "google-maps-complete-gallery.png") });
      console.log(`[GoogleMaps] Debug screenshot saved to debug/google-maps-complete-gallery.png`);
    } catch (err: any) {
      console.error(`[GoogleMaps] Failed to save debug screenshot:`, err.message || err);
    }

    // Detect complete gallery container & viewer details
    const containerDetails = await page.evaluate(() => {
      const selCandidates = [
        "div.m6QEwb.DxyBCb",
        "div.DxyBCb",
        'div.m6QEwb[role="region"]',
        "div.UL7Qtf",
        'div[role="dialog"]'
      ];
      for (const sel of selCandidates) {
        const el = document.querySelector(sel);
        if (el && el.querySelectorAll('img, div[style*="background-image"], div[data-photo-index]').length > 0) {
          return {
            detected: true,
            selector: sel,
            viewerType: sel.includes("dialog") ? "imagepack-dialog" : "side-panel-gallery"
          };
        }
      }
      return { detected: false, selector: "none", viewerType: "unknown" };
    });

    completeGalleryDetected = containerDetails.detected;
    galleryViewerType = containerDetails.viewerType;
    galleryContainerSelector = containerDetails.selector;

    console.log(`[GoogleMaps] Complete gallery container identified: ${completeGalleryDetected} (${galleryContainerSelector}, type: ${galleryViewerType})`);

    // Discover Photo Category Tabs inside gallery viewer
    await page.waitForSelector('button[role="tab"], button[jsaction*="category"], button.g205bf, div[role="tablist"] button, div.m6QEwb button, button.hD92vf', { timeout: 4000 }).catch(() => {});
    const discoveredTabNames: string[] = await page.evaluate(() => {
      const tabs = Array.from(
        document.querySelectorAll(
          'button[role="tab"], button[jsaction*="category"], button.g205bf, div[role="tablist"] button, div.m6QEwb button, button.hD92vf'
        )
      );
      const names = tabs
        .map((t) => {
          const raw = (t as HTMLElement).innerText || t.getAttribute("aria-label") || "";
          return raw.split("\n")[0].replace(/\s*\d+.*$/, "").trim();
        })
        .filter((txt) => {
          if (!txt || txt.length > 25) return false;
          const l = txt.toLowerCase();
          return (
            l === "all" ||
            l.includes("latest") ||
            l.includes("video") ||
            l.includes("inside") ||
            l.includes("exterior") ||
            l.includes("owner") ||
            l.includes("street view") ||
            l.includes("360")
          );
        });
      return Array.from(new Set(names));
    });

    photoCategoriesCount = discoveredTabNames.length;
    activePhotoCategory = discoveredTabNames[0] || "All";
    console.log(`[GoogleMaps] Discovered category tabs (${photoCategoriesCount}):`, discoveredTabNames);

    // Initial Photos Count
    const initialRawImgs = await page.evaluate(() => {
      const urls: string[] = [];
      const els = Array.from(
        document.querySelectorAll(
          'img, button[aria-label*="photo"], div[style*="background-image"], div[data-photo-index]'
        )
      );
      for (const el of els) {
        if (el.tagName === "IMG") {
          const img = el as HTMLImageElement;
          const src = img.getAttribute("src") || img.currentSrc || img.getAttribute("data-src");
          if (src) urls.push(src);
        } else {
          const bg =
            window.getComputedStyle(el).backgroundImage || (el as HTMLElement).style.backgroundImage || "";
          const m = bg.match(/url\(["']?(https?:[^"']+)["']?\)/);
          if (m) urls.push(m[1]);
        }
      }
      return urls;
    });

    for (const rUrl of initialRawImgs) {
      rawBusinessImageUrlsSet.add(rUrl);
      const cleaned = isValidBusinessPhotoUrl(rUrl);
      if (cleaned) filteredBusinessImageUrlsSet.add(cleaned);
    }

    initialVisiblePhotoCount = initialRawImgs.length;
    initialCompletePhotosCount = filteredBusinessImageUrlsSet.size;
    console.log(`[GoogleMaps] Initial visible photo elements: ${initialVisiblePhotoCount}, unique photos: ${initialCompletePhotosCount}`);

    // Tab-by-Tab Exhaustive Category Traversal & Scrolling
    const categoryTabsToProcess = discoveredTabNames.length > 0 
      ? discoveredTabNames.filter((t) => !t.includes("Street View") && !t.includes("Add photos") && !t.includes("360"))
      : ["All"];

    const tabsTraversed: string[] = [];

    for (const tabName of categoryTabsToProcess) {
      if (!isAllPhotosMode && filteredBusinessImageUrlsSet.size >= maxImages) break;

      console.log(`[GoogleMaps] --- Traversing Category Tab: "${tabName}" ---`);
      tabsTraversed.push(tabName);

      if (tabName !== "All" && discoveredTabNames.length > 1) {
        try {
          const tabBtn = page.locator(`button[role="tab"]:has-text("${tabName}"), button:has-text("${tabName}")`).first();
          if ((await tabBtn.count()) > 0 && (await tabBtn.isVisible().catch(() => false))) {
            await tabBtn.click().catch(() => {});
            await page.waitForTimeout(2500);
            totalNavigationClicks++;
            activePhotoCategory = tabName;
          }
        } catch (err: any) {
          console.log(`[GoogleMaps] Could not click category tab "${tabName}":`, err.message || err);
        }
      }

      let consecutiveNoNewAttempts = 0;
      const maxScrollAttemptsPerTab = isAllPhotosMode ? 45 : Math.min(25, Math.ceil(maxImages / 2));

      for (let attempt = 1; attempt <= maxScrollAttemptsPerTab; attempt++) {
        totalScrollAttempts++;

        const scrollRes = await page.evaluate(() => {
          const containers = Array.from(
            document.querySelectorAll('div.DxyBCb, div.m6QErb.DxyBCb, div.m6QEwb, div[role="region"], div[role="dialog"]')
          );
          let anyScrolled = false;
          let maxPos = 0;
          let atBottom = false;
          let containerHeight = 0;

          for (const c of containers) {
            if (c.scrollHeight > c.clientHeight + 10) {
              const prevTop = c.scrollTop;
              c.scrollTop += 1200;
              c.dispatchEvent(new Event('scroll', { bubbles: true }));
              if (c.scrollTop > prevTop) anyScrolled = true;
              if (c.scrollTop > maxPos) maxPos = c.scrollTop;
              containerHeight = c.scrollHeight;
              if (c.scrollTop + c.clientHeight >= c.scrollHeight - 50) {
                atBottom = true;
              }
            }
          }
          return { scrolled: anyScrolled, maxPos, atBottom, containerHeight };
        }).catch(() => ({ scrolled: false, maxPos: 0, atBottom: false, containerHeight: 0 }));

        // Send keyboard and mouse wheel dispatches
        await page.mouse.wheel(0, 1500).catch(() => {});
        await page.evaluate(() => {
          const galleryEl = document.querySelector('div.m6QEwb img, div[role="region"] img, button[aria-label*="photo"]');
          if (galleryEl) (galleryEl as HTMLElement).focus();
        }).catch(() => {});

        await page.keyboard.press("PageDown").catch(() => {});
        await page.keyboard.press("ArrowDown").catch(() => {});

        if (scrollRes.maxPos > maxScrollPosition) {
          maxScrollPosition = scrollRes.maxPos;
        }

        await page.waitForTimeout(800);

        const stepRawImgs = await page.evaluate(() => {
          const urls: string[] = [];
          const els = Array.from(
            document.querySelectorAll(
              'img, button[aria-label*="photo"], div[style*="background-image"], div[data-photo-index]'
            )
          );
          for (const el of els) {
            if (el.tagName === "IMG") {
              const img = el as HTMLImageElement;
              const src = img.getAttribute("src") || img.currentSrc || img.getAttribute("data-src");
              if (src) urls.push(src);
            } else {
              const bg =
                window.getComputedStyle(el).backgroundImage || (el as HTMLElement).style.backgroundImage || "";
              const m = bg.match(/url\(["']?(https?:[^"']+)["']?\)/);
              if (m) urls.push(m[1]);
            }
          }
          return urls;
        });

        const sizeBefore = filteredBusinessImageUrlsSet.size;
        for (const rUrl of stepRawImgs) {
          rawBusinessImageUrlsSet.add(rUrl);
          const cleaned = isValidBusinessPhotoUrl(rUrl);
          if (cleaned) {
            filteredBusinessImageUrlsSet.add(cleaned);
          }
        }
        const sizeAfter = filteredBusinessImageUrlsSet.size;

        if (sizeAfter > sizeBefore) {
          consecutiveNoNewAttempts = 0;
        } else {
          consecutiveNoNewAttempts++;
        }

        console.log(
          `[GoogleMaps] Tab "${tabName}" scroll attempt ${attempt}: ${sizeAfter} unique photo URLs found (pos: ${scrollRes.maxPos}/${scrollRes.containerHeight}px)`
        );

        // Target image limit check in capped mode
        if (!isAllPhotosMode && sizeAfter >= maxImages) {
          break;
        }

        // Exhaustion check per tab
        const maxNoNewAttempts = isAllPhotosMode ? 10 : 5;
        if (consecutiveNoNewAttempts >= maxNoNewAttempts && (!scrollRes.scrolled || scrollRes.atBottom)) {
          console.log(`[GoogleMaps] Tab "${tabName}" exhausted after ${attempt} scroll attempts.`);
          break;
        }
      }
    }

    // If in all-photos mode (or if target limit not reached), also navigate through the gallery viewer using ArrowRight / Next button
    const targetPhotosCount = isAllPhotosMode ? 300 : maxImages;
    if (filteredBusinessImageUrlsSet.size < targetPhotosCount) {
      console.log(`[GoogleMaps] Initiating viewer ArrowRight traversal to discover all gallery photos... (current count: ${filteredBusinessImageUrlsSet.size})`);
      
      // Scroll containers back to top so first thumbnail is visible in viewport
      await page.evaluate(() => {
        const containers = Array.from(document.querySelectorAll('div.DxyBCb, div.m6QErb.DxyBCb, div.m6QEwb'));
        for (const c of containers) {
          c.scrollTop = 0;
        }
      }).catch(() => {});
      await page.waitForTimeout(500);

      // Click first thumbnail to open main viewer
      const thumbnailLocator = page.locator(
        'div.DxyBCb a.MIgS0d, div.DxyBCb a[aria-label*="Photo"], div.DxyBCb a[jsaction*="gallery"], div.DxyBCb button[aria-label*="photo"], div.DxyBCb img, div.DxyBCb div[data-photo-index]'
      ).first();
      if ((await thumbnailLocator.count()) > 0) {
        await thumbnailLocator.click({ force: true }).catch(() => {});
        await page.waitForTimeout(1500);
        totalNavigationClicks++;

        let viewerNoNewCount = 0;
        const maxViewerSteps = isAllPhotosMode ? 100 : Math.min(100, maxImages * 2);

        for (let step = 1; step <= maxViewerSteps; step++) {
          if (!isAllPhotosMode && filteredBusinessImageUrlsSet.size >= maxImages) break;

          const stepImgs = await page.evaluate(() => {
            const urls: string[] = [];
            const els = Array.from(
              document.querySelectorAll(
                'div[role="dialog"] img, img, button[aria-label*="photo"], div[style*="background-image"], div[data-photo-index]'
              )
            );
            for (const el of els) {
              if (el.tagName === "IMG") {
                const img = el as HTMLImageElement;
                const src = img.getAttribute("src") || img.currentSrc || img.getAttribute("data-src");
                if (src) urls.push(src);
              } else {
                const bg =
                  window.getComputedStyle(el).backgroundImage || (el as HTMLElement).style.backgroundImage || "";
                const m = bg.match(/url\(["']?(https?:[^"']+)["']?\)/);
                if (m) urls.push(m[1]);
              }
            }
            return urls;
          });

          const sizeBefore = filteredBusinessImageUrlsSet.size;
          for (const rUrl of stepImgs) {
            rawBusinessImageUrlsSet.add(rUrl);
            const cleaned = isValidBusinessPhotoUrl(rUrl);
            if (cleaned) {
              filteredBusinessImageUrlsSet.add(cleaned);
            }
          }
          const sizeAfter = filteredBusinessImageUrlsSet.size;

          if (sizeAfter > sizeBefore) {
            viewerNoNewCount = 0;
          } else {
            viewerNoNewCount++;
          }

          if (step % 5 === 0 || sizeAfter > sizeBefore) {
            console.log(`[GoogleMaps] Viewer step ${step}: ${sizeAfter} unique photos discovered`);
          }

          if (viewerNoNewCount >= 15) {
            console.log(`[GoogleMaps] Viewer traversal completed (no new photos for 15 consecutive steps at ${sizeAfter} photos).`);
            break;
          }

          // Press ArrowRight to move to next photo in viewer
          await page.keyboard.press("ArrowRight").catch(() => {});
          
          // Also try clicking next photo button if available
          const nextBtn = page.locator('button[aria-label*="Next photo"], button[jsaction*="next"]').first();
          if ((await nextBtn.count()) > 0 && (await nextBtn.isVisible().catch(() => false))) {
            await nextBtn.click().catch(() => {});
          }

          await page.waitForTimeout(300);
        }
      }
    }

    galleryExhausted = true;
    galleryEndEvidence = `Gallery fully exhausted after traversing ${tabsTraversed.length} category tab(s) (${tabsTraversed.join(", ")}). Total scroll attempts: ${totalScrollAttempts}, Max scroll position: ${maxScrollPosition}px, Navigation clicks: ${totalNavigationClicks}. Final unique business photos discovered: ${filteredBusinessImageUrlsSet.size}.`;

    console.log(`[GoogleMaps] ${galleryEndEvidence}`);

    const rawBusinessImageUrls = Array.from(rawBusinessImageUrlsSet);
    const businessImageUrls = isAllPhotosMode
      ? Array.from(filteredBusinessImageUrlsSet)
      : Array.from(filteredBusinessImageUrlsSet).slice(0, maxImages);

    console.log(`[GoogleMaps] Gallery image elements found: ${rawBusinessImageUrlsSet.size}`);
    console.log(`[GoogleMaps] Raw image URLs found: ${rawBusinessImageUrlsSet.size}`);
    console.log(`[GoogleMaps] Filtered business image URLs: ${filteredBusinessImageUrlsSet.size}`);
    console.log(`[GoogleMaps] Final business image URLs: ${businessImageUrls.length}`);

    if (!businessName && !details.address && !ratingReviewData.rating) {
      throw new Error("Business information could not be extracted from the Google Maps page.");
    }

    return {
      businessName,
      rating: ratingReviewData.rating,
      reviewCount: ratingReviewData.reviewCount,
      address: details.address,
      phone: details.phone,
      category: details.category,
      website: details.website,
      hours: details.hours,
      latitude,
      longitude,
      businessImageUrls,
      rawBusinessImageUrls,
      reviews,
      reviewImageUrls,
      previewCandidateCount,
      completeCandidateCount,
      completeEntryFound,
      completeEntryClicked,
      completeGalleryDetected,
      galleryViewerType,
      galleryContainerSelector,
      photoCategoriesCount,
      activePhotoCategory,
      initialCompletePhotosCount,
      initialVisiblePhotoCount,
      uniqueGalleryPhotosDiscovered: businessImageUrls.length,
      totalScrollAttempts,
      totalNavigationClicks,
      maxScrollPosition,
      galleryEndEvidence,
      galleryExhausted,
      galleryOpened: completeEntryClicked,
      galleryContainerIdentified: completeGalleryDetected,
    };
  } catch (err: any) {
    if (err.message && (err.message.includes("Could not load") || err.message.includes("Business information"))) {
      throw err;
    }
    throw new Error(`Browser/scraping error: ${err.message || "An error occurred during local scraping"}`);
  } finally {
    if (!browserContextRef) {
      await browser.close().catch(() => {});
    }
  }
}
