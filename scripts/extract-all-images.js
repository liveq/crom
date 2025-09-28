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

async function extractAllImages() {
  console.log('Connecting to Chrome...');
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

  // Navigate to various pages and collect images
  const pages = [
    'https://cromst.seongnam.go.kr:10005/street/street',
    'https://cromst.seongnam.go.kr:10005/street/workplace',
    'https://cromst.seongnam.go.kr:10005/street/food',
    'https://cromst.seongnam.go.kr:10005/street/attractions'
  ];

  const allImages = new Set();

  for (const pageUrl of pages) {
    console.log(`Navigating to ${pageUrl}...`);
    try {
      await targetPage.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await targetPage.waitForTimeout(2000);

      const images = await targetPage.evaluate(() => {
        const imgs = [];
        document.querySelectorAll('img').forEach(img => {
          if (img.src && !img.src.includes('logo') && !img.src.includes('icon')) {
            imgs.push(img.src);
          }
        });

        // Also check background images
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.backgroundImage && style.backgroundImage !== 'none') {
            const match = style.backgroundImage.match(/url\(["']?(.+?)["']?\)/);
            if (match && match[1]) {
              imgs.push(match[1]);
            }
          }
        });

        return imgs;
      });

      images.forEach(img => allImages.add(img));
    } catch (err) {
      console.log(`Error loading ${pageUrl}: ${err.message}`);
    }
  }

  // Download all unique images
  const assetsDir = path.join(__dirname, '..', 'public', 'street-images');
  await fs.mkdir(assetsDir, { recursive: true });

  console.log(`Found ${allImages.size} unique images`);

  for (const imgUrl of allImages) {
    if (imgUrl.startsWith('http')) {
      const filename = imgUrl.split('/').pop().split('?')[0];
      const outputPath = path.join(assetsDir, filename);

      try {
        await downloadFile(imgUrl, outputPath);
        console.log(`Downloaded: ${filename}`);
      } catch (err) {
        console.error(`Failed to download ${filename}: ${err.message}`);
      }
    }
  }

  console.log('All images extracted!');
}

extractAllImages().catch(console.error);