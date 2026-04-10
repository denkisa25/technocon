import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotsDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Find next available screenshot number
const existing = fs.readdirSync(screenshotsDir)
  .filter(f => f.startsWith('screenshot-') && f.endsWith('.png'))
  .map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0'))
  .filter(n => !isNaN(n));

const nextN = existing.length > 0 ? Math.max(...existing) + 1 : 1;
const filename = label
  ? `screenshot-${nextN}-${label}.png`
  : `screenshot-${nextN}.png`;
const outputPath = path.join(screenshotsDir, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();

// Block external CDN requests so networkidle never hangs
await page.setRequestInterception(true);
page.on('request', req => {
  const u = req.url();
  if (u.includes('fonts.googleapis.com') || u.includes('fonts.gstatic.com') || u.includes('cdn.tailwindcss.com')) {
    req.abort();
  } else {
    req.continue();
  }
});

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

// Force all scroll-reveal elements visible (IntersectionObserver doesn't fire headlessly)
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('vis', 'visible'));
});

// Allow CSS transitions to settle
await new Promise(r => setTimeout(r, 800));

await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Saved: ${outputPath}`);
