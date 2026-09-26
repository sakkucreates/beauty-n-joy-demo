import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { scrapeGoogleMaps, downloadImageWithContext } from "@/lib/googleMapsScraper";

// Helper to get file extension or default to .jpg
function getExt(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    const ext = path.extname(parsed.pathname);
    if (ext && ext.length <= 5 && /^\.[a-zA-Z0-9]+$/.test(ext)) {
      return ext;
    }
    return ".jpg";
  } catch {
    return ".jpg";
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url, maxImages: reqMaxImages, maxReviews: reqMaxReviews, allPhotos: reqAllPhotos } = body || {};

    // 1. URL Validation
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL provided." }, { status: 400 });
    }

    const validPatterns = [
      "google.com/maps",
      "maps.google.com",
      "maps.app.goo.gl",
      "goo.gl/maps",
    ];

    if (!validPatterns.some((pattern) => url.includes(pattern))) {
      return NextResponse.json(
        { error: "Invalid Google Maps URL. Please provide a valid Google Maps link." },
        { status: 400 }
      );
    }

    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    const isAllMode =
      reqAllPhotos === true ||
      reqMaxImages === 0 ||
      reqMaxImages === "0" ||
      reqMaxImages === "all" ||
      reqMaxImages === null ||
      reqMaxImages === undefined;

    // Configure image and review limits
    const envMaxReviews = parseInt(process.env.MAX_REVIEW_IMAGES || "50", 10);
    const envMaxImages = parseInt(process.env.MAX_BUSINESS_IMAGES || "50", 10);

    let maxReviews = typeof reqMaxReviews === "number" ? reqMaxReviews : envMaxReviews;
    let maxImages = isAllMode ? 0 : (typeof reqMaxImages === "number" ? reqMaxImages : envMaxImages);

    // Safety clamp
    maxReviews = Math.max(0, Math.min(500, maxReviews));
    if (!isAllMode) {
      maxImages = Math.max(0, Math.min(500, maxImages));
    }

    console.log("[API /scrape] Incoming payload:", { reqMaxImages, reqMaxReviews, reqAllPhotos });
    console.log("[API /scrape] Calculated mode:", { isAllMode, maxImages, maxReviews });

    // 2. Call Local Playwright Scraper
    const browserContextRef: any = { context: null, userAgent: "" };
    try {
      const scrapedData = await scrapeGoogleMaps(finalUrl, maxImages, maxReviews, browserContextRef);

      const businessName = scrapedData.businessName || "Unknown_Business";
      
      // Clean folder name to prevent filesystem issues
      const safeBusinessName = businessName.replace(/[^a-zA-Z0-9 _-]/g, "").trim() || "Google_Business";

      // Generate fresh output folder name with timestamp
      const now = new Date();
      const timestamp =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0") +
        "_" +
        String(now.getHours()).padStart(2, "0") +
        "-" +
        String(now.getMinutes()).padStart(2, "0") +
        "-" +
        String(now.getSeconds()).padStart(2, "0");

      const folderName = `${safeBusinessName}_${timestamp}`;
      const downloadsDir = path.join(process.cwd(), "downloads");
      const businessDir = path.join(downloadsDir, folderName);

      // Create directories
      const imagesDir = path.join(businessDir, "images");
      const reviewImagesDir = path.join(businessDir, "review-images");

      fs.mkdirSync(businessDir, { recursive: true });
      fs.mkdirSync(imagesDir, { recursive: true });
      fs.mkdirSync(reviewImagesDir, { recursive: true });

      // 3. Save raw-response.json
      fs.writeFileSync(
        path.join(businessDir, "raw-response.json"),
        JSON.stringify(scrapedData, null, 2)
      );

      // 4. Save business.json
      const businessJson = {
        "Business Name": scrapedData.businessName,
        "Rating": scrapedData.rating,
        "Review Count": scrapedData.reviewCount,
        "Address": scrapedData.address,
        "Phone": scrapedData.phone,
        "Category": scrapedData.category,
        "Website": scrapedData.website,
        "Hours": scrapedData.hours,
        "Latitude": scrapedData.latitude,
        "Longitude": scrapedData.longitude,
      };
      fs.writeFileSync(
        path.join(businessDir, "business.json"),
        JSON.stringify(businessJson, null, 2)
      );

      // 5. Save reviews.json
      const reviewsJson = scrapedData.reviews.map((rev) => ({
        "Author Name": rev["Author Name"],
        "Rating": rev.Rating,
        "Comment": rev.Comment,
      }));
      fs.writeFileSync(
        path.join(businessDir, "reviews.json"),
        JSON.stringify(reviewsJson, null, 2)
      );

      // 6. Image Downloading Phase for THIS SCRAPE
      let businessImagesFound = 0;
      let businessImagesDownloaded = 0;
      let reviewImagesFound = 0;
      let reviewImagesDownloaded = 0;
      const failedDownloads: string[] = [];

      // Deduplicate business images for THIS SCRAPE in memory
      const businessImageUrlsSet = new Set<string>();
      for (const imgUrl of scrapedData.businessImageUrls) {
        if (imgUrl) businessImageUrlsSet.add(imgUrl);
      }
      const businessImageUrls = isAllMode
        ? Array.from(businessImageUrlsSet)
        : Array.from(businessImageUrlsSet).slice(0, maxImages);
      businessImagesFound = businessImageUrls.length;

      // Deduplicate review images for THIS SCRAPE in memory
      const reviewImageUrlsSet = new Set<string>();
      for (const rImg of scrapedData.reviewImageUrls) {
        if (rImg) reviewImageUrlsSet.add(rImg);
      }
      for (const rev of scrapedData.reviews) {
        if (rev.reviewImageUrls) {
          for (const rImg of rev.reviewImageUrls) {
            if (rImg) reviewImageUrlsSet.add(rImg);
          }
        }
      }
      const reviewImageUrls = Array.from(reviewImageUrlsSet).slice(0, maxReviews);
      reviewImagesFound = reviewImageUrls.length;

      // Download Business Images via Playwright Context
      for (let i = 0; i < businessImageUrls.length; i++) {
        const imgUrl = businessImageUrls[i];
        const filename = `image${String(i + 1).padStart(3, "0")}${getExt(imgUrl)}`;
        const destPath = path.join(imagesDir, filename);

        console.log(`[GoogleMaps] Downloading business image ${i + 1}/${businessImageUrls.length}`);
        let dlRes = { success: false, bytes: 0 };
        if (browserContextRef.context) {
          dlRes = await downloadImageWithContext(
            browserContextRef.context,
            imgUrl,
            destPath,
            browserContextRef.userAgent
          );
        }

        if (dlRes.success && fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
          const bytes = fs.statSync(destPath).size;
          businessImagesDownloaded++;
          console.log(`[GoogleMaps] Downloaded successfully: ${filename} (${bytes} bytes)`);
        } else {
          console.log(`[GoogleMaps] Download failed for business image ${filename}`);
          failedDownloads.push(imgUrl);
        }
      }

      // Download Review Images via Playwright Context
      for (let i = 0; i < reviewImageUrls.length; i++) {
        const imgUrl = reviewImageUrls[i];
        const filename = `review-image${String(i + 1).padStart(3, "0")}${getExt(imgUrl)}`;
        const destPath = path.join(reviewImagesDir, filename);

        console.log(`[GoogleMaps] Downloading review image ${i + 1}/${reviewImageUrls.length}`);
        let dlRes = { success: false, bytes: 0 };
        if (browserContextRef.context) {
          dlRes = await downloadImageWithContext(
            browserContextRef.context,
            imgUrl,
            destPath,
            browserContextRef.userAgent
          );
        }

        if (dlRes.success && fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
          const bytes = fs.statSync(destPath).size;
          reviewImagesDownloaded++;
          console.log(`[GoogleMaps] Downloaded successfully: ${filename} (${bytes} bytes)`);
        } else {
          console.log(`[GoogleMaps] Download failed for review image ${filename}`);
          failedDownloads.push(imgUrl);
        }
      }

      console.log(`[GoogleMaps] Business images downloaded: ${businessImagesDownloaded}/${businessImagesFound}`);
      console.log(`[GoogleMaps] Review images downloaded: ${reviewImagesDownloaded}/${reviewImagesFound}`);

      console.log("\n=============================================");
      console.log("=== Google Maps Scraper Diagnostic Output ===");
      console.log(`Business Name: ${scrapedData.businessName}`);
      console.log(`Output Directory: ${businessDir}`);
      console.log(`Complete entry point found: ${scrapedData.completeEntryFound ?? false}`);
      console.log(`Complete entry point clicked: ${scrapedData.completeEntryClicked ?? false}`);
      console.log(`Complete gallery container identified: ${scrapedData.completeGalleryDetected ?? false}`);
      console.log(`Gallery Viewer Type: ${scrapedData.galleryViewerType ?? "unknown"}`);
      console.log(`Gallery Container Selector: ${scrapedData.galleryContainerSelector ?? "unknown"}`);
      console.log(`Initial visible photos: ${scrapedData.initialVisiblePhotoCount ?? 0}`);
      console.log(`Initial unique photos: ${scrapedData.initialCompletePhotosCount ?? 0}`);
      console.log(`Total navigation clicks: ${scrapedData.totalNavigationClicks ?? 0}`);
      console.log(`Total scroll attempts: ${scrapedData.totalScrollAttempts ?? 0}`);
      console.log(`Maximum scroll position: ${scrapedData.maxScrollPosition ?? 0}`);
      console.log(`Unique gallery photos discovered: ${businessImagesFound}`);
      console.log(`Gallery end evidence: ${scrapedData.galleryEndEvidence ?? ""}`);
      console.log(`Gallery exhausted: ${scrapedData.galleryExhausted ?? false}`);
      console.log(`Photos downloaded: ${businessImagesDownloaded}`);
      console.log(`Failed downloads: ${failedDownloads.length}`);
      console.log("=============================================\n");

      // 7. Write download-report.json
      const reportData = {
        businessName: scrapedData.businessName,
        outputDirectory: businessDir,
        completeEntryFound: scrapedData.completeEntryFound ?? false,
        completeEntryClicked: scrapedData.completeEntryClicked ?? false,
        completeGalleryDetected: scrapedData.completeGalleryDetected ?? false,
        galleryViewerType: scrapedData.galleryViewerType ?? "unknown",
        galleryContainerSelector: scrapedData.galleryContainerSelector ?? "unknown",
        initialVisiblePhotoCount: scrapedData.initialVisiblePhotoCount ?? 0,
        initialCompletePhotosCount: scrapedData.initialCompletePhotosCount ?? 0,
        totalNavigationClicks: scrapedData.totalNavigationClicks ?? 0,
        totalScrollAttempts: scrapedData.totalScrollAttempts ?? 0,
        maxScrollPosition: scrapedData.maxScrollPosition ?? 0,
        uniqueGalleryPhotosDiscovered: businessImagesFound,
        galleryEndEvidence: scrapedData.galleryEndEvidence ?? "",
        galleryExhausted: scrapedData.galleryExhausted ?? false,
        photosDownloaded: businessImagesDownloaded,
        failedDownloads,
        previewCandidateCount: scrapedData.previewCandidateCount ?? 0,
        completeCandidateCount: scrapedData.completeCandidateCount ?? 0,
        photoCategoriesCount: scrapedData.photoCategoriesCount ?? 0,
        activePhotoCategory: scrapedData.activePhotoCategory ?? "All",
        galleryOpened: scrapedData.completeEntryClicked ?? false,
        galleryContainerIdentified: scrapedData.completeGalleryDetected ?? false,
        businessImagesFound,
        businessImagesDownloaded,
        reviewImagesFound,
        reviewImagesDownloaded,
      };
      fs.writeFileSync(
        path.join(businessDir, "download-report.json"),
        JSON.stringify(reportData, null, 2)
      );

      // 8. Create ZIP archive for this scrape
      const AdmZip = require("adm-zip");
      const zip = new AdmZip();
      zip.addLocalFolder(businessDir);
      zip.writeZip(path.join(downloadsDir, `${folderName}.zip`));

      return NextResponse.json({
        success: true,
        folder: folderName,
        diagnostics: reportData,
      });
    } finally {
      if (browserContextRef.close) {
        await browserContextRef.close();
      }
    }
  } catch (error: any) {
    console.error("[GoogleMaps] Local Scraping Error:", error);
    const errorMsg = error.message || "An error occurred during local scraping.";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
