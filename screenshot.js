const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.error(`BROWSER NETWORK ERROR: ${response.url()} ${response.status()}`);
    }
  });
  
  console.log("Navigating to http://localhost:3000...");
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log("Page loaded successfully!");
    await page.screenshot({ path: 'screenshot.png' });
    console.log("Screenshot saved to screenshot.png");
  } catch (err) {
    console.error("Navigation failed:", err);
  }
  
  await browser.close();
})();
