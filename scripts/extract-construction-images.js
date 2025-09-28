import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath).catch(() => {});
      reject(err);
    });
  });
}

async function extractConstructionImages() {
  console.log('Connecting to Chrome to extract construction images...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');

  const contexts = browser.contexts();
  let targetPage = null;

  for (const context of contexts) {
    const pages = context.pages();
    for (const page of pages) {
      const url = page.url();
      if (url.includes('cromst.seongnam.go.kr')) {
        targetPage = page;
        break;
      }
    }
  }

  if (!targetPage) {
    console.log('Page not found. Opening new one...');
    const browser2 = await chromium.launch({ headless: false });
    targetPage = await browser2.newPage();
  }

  console.log('Navigating to construction page...');
  await targetPage.goto('https://cromst.seongnam.go.kr:10005/street/streetAtoz', { waitUntil: 'networkidle' });
  await targetPage.waitForTimeout(3000);

  // Extract image URLs from the page
  const imageUrls = await targetPage.evaluate(() => {
    const urls = [];

    // Find all images in the construction timeline
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src && (
        img.src.includes('atoz') ||
        img.src.includes('construction') ||
        img.src.includes('week') ||
        img.src.includes('section')
      )) {
        urls.push(img.src);
      }
    });

    // Also check for background images in slideshow or gallery elements
    const elements = document.querySelectorAll('[style*="background-image"]');
    elements.forEach(el => {
      const style = el.getAttribute('style');
      const match = style.match(/url\(['"]?([^'")]+)['"]?\)/);
      if (match && match[1] && (
        match[1].includes('atoz') ||
        match[1].includes('construction')
      )) {
        urls.push(match[1]);
      }
    });

    return [...new Set(urls)]; // Remove duplicates
  });

  console.log(`Found ${imageUrls.length} construction image URLs`);

  // Try clicking through sections to reveal more images
  const sections = [1, 2, 3, 4];
  const weeks = [1, 2, 3, 4];

  for (const section of sections) {
    for (const week of weeks) {
      try {
        // Try to click section buttons
        await targetPage.evaluate((s) => {
          const btns = document.querySelectorAll(`button:has-text("${s}구간"), [data-section="${s}"]`);
          if (btns.length > 0) btns[0].click();
        }, section);

        await targetPage.waitForTimeout(1000);

        // Try to click week buttons
        await targetPage.evaluate((w) => {
          const btns = document.querySelectorAll(`button:has-text("${w}주"), [data-week="${w}"]`);
          if (btns.length > 0) btns[0].click();
        }, week);

        await targetPage.waitForTimeout(1000);

        // Extract images after navigation
        const moreUrls = await targetPage.evaluate(() => {
          const urls = [];
          document.querySelectorAll('img').forEach(img => {
            if (img.src && !img.src.includes('logo') && !img.src.includes('icon')) {
              urls.push(img.src);
            }
          });
          return urls;
        });

        moreUrls.forEach(url => {
          if (!imageUrls.includes(url)) {
            imageUrls.push(url);
          }
        });

        console.log(`Section ${section}, Week ${week}: Found ${moreUrls.length} images`);
      } catch (err) {
        console.log(`Could not navigate to Section ${section}, Week ${week}`);
      }
    }
  }

  // Create construction-images directory
  const imagesDir = path.join(__dirname, '..', 'public', 'construction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Download images
  console.log(`\nDownloading ${imageUrls.length} images...`);
  for (const url of imageUrls) {
    if (url.startsWith('http')) {
      try {
        const filename = url.split('/').pop().split('?')[0];
        const outputPath = path.join(imagesDir, filename);

        await downloadFile(url, outputPath);
        console.log(`Downloaded: ${filename}`);
      } catch (err) {
        console.error(`Failed to download ${url}: ${err.message}`);
      }
    }
  }

  console.log('\nConstruction images extraction complete!');
}

extractConstructionImages().catch(console.error);