const fs = require('fs');
const path = require('path');

async function runE2E() {
  console.log("Starting Real E2E Verification with maxImages and maxReviews...");
  const targetUrl = "https://www.google.com/maps/place/Empire+State+Building/@40.7484405,-73.9856644,17z/data=!3m1!4b1!4m6!3m5!1s0x89c259a9b3117469:0xd134e199a405a163!8m2!3d40.7484405!4d-73.9856644!16zL20vMDJuZHA";
  console.log("Target URL: " + targetUrl);
  
  // Trigger scrape with explicit limits
  const scrapeRes = await fetch("http://localhost:3000/api/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: targetUrl, maxImages: 10, maxReviews: 10 })
  });
  
  const scrapeData = await scrapeRes.json();
  console.log("Scrape API Response:", scrapeData);
  
  if (!scrapeData.success) {
    console.error("Scrape failed!", scrapeData);
    return;
  }
  
  const folderName = scrapeData.folder;
  const folderPath = path.join(__dirname, "downloads", folderName);
  
  console.log("\n--- 1. CREATED FOLDER PATH ---");
  console.log(folderPath);
  
  console.log("\n--- 2. FOLDER CONTENTS ---");
  console.log(fs.readdirSync(folderPath));
  
  console.log("\n--- 3. BUSINESS.JSON ---");
  console.log(fs.readFileSync(path.join(folderPath, "business.json"), "utf8"));
  
  console.log("\n--- 4. REVIEWS.JSON ---");
  const reviews = JSON.parse(fs.readFileSync(path.join(folderPath, "reviews.json"), "utf8"));
  console.log(`Extracted ${reviews.length} reviews:`, JSON.stringify(reviews.slice(0, 2), null, 2));
  
  console.log("\n--- 5. DOWNLOAD-REPORT.JSON ---");
  const report = JSON.parse(fs.readFileSync(path.join(folderPath, "download-report.json"), "utf8"));
  console.log(JSON.stringify(report, null, 2));
  
  console.log("\n--- 6. NUMBER OF BUSINESS IMAGES DOWNLOADED ---");
  console.log(report.businessImagesDownloaded);
  
  console.log("\n--- 7. NUMBER OF REVIEW IMAGES DOWNLOADED ---");
  console.log(report.reviewImagesDownloaded);
  
  console.log("\n--- 8. CONFIRM IMAGES ON DISK ---");
  const businessImagesDir = path.join(folderPath, "images");
  const reviewImagesDir = path.join(folderPath, "review-images");
  
  const actualBusinessImages = fs.existsSync(businessImagesDir) ? fs.readdirSync(businessImagesDir).length : 0;
  const actualReviewImages = fs.existsSync(reviewImagesDir) ? fs.readdirSync(reviewImagesDir).length : 0;
  
  console.log(`Expected Business Images: ${report.businessImagesDownloaded}, Found on disk: ${actualBusinessImages}`);
  console.log(`Expected Review Images: ${report.reviewImagesDownloaded}, Found on disk: ${actualReviewImages}`);
  
  console.log("\n--- 9. VERIFY ZIP FILE EXISTS ---");
  const zipPath = path.join(__dirname, "downloads", `${folderName}.zip`);
  console.log("ZIP Path: " + zipPath);
  console.log("ZIP Exists? " + fs.existsSync(zipPath));
  if (fs.existsSync(zipPath)) {
    console.log("ZIP File Size: " + (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2) + " MB");
  }
}

runE2E();
