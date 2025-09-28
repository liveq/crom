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

async function extractFoodImages() {
  console.log('Connecting to Chrome to extract food images...');
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

  console.log('Navigating to food page...');
  await targetPage.goto('https://cromst.seongnam.go.kr:10005/street/streetFood', { waitUntil: 'networkidle' });
  await targetPage.waitForTimeout(3000);

  // Extract all food images
  const imageUrls = await targetPage.evaluate(() => {
    const urls = [];

    // Find all food images
    const images = document.querySelectorAll('.food_list1 img, .box img, [src*="img_food"]');
    images.forEach(img => {
      if (img.src && img.src.includes('img_food')) {
        urls.push(img.src);
      }
    });

    // Also find any background images with food
    const elements = document.querySelectorAll('[style*="background"]');
    elements.forEach(el => {
      const style = el.getAttribute('style');
      if (style) {
        const match = style.match(/url\(['"]?([^'")]+img_food[^'")]*)['"]\)/);
        if (match && match[1]) {
          urls.push(match[1]);
        }
      }
    });

    return [...new Set(urls)]; // Remove duplicates
  });

  console.log(`Found ${imageUrls.length} food image URLs`);

  // Expected food image names based on the extracted data
  const expectedImages = [
    'img_food1.jpg', 'img_food2.jpg', 'img_food3.jpg', 'img_food5.jpg', 'img_food6.jpg',
    'img_food9.jpg', 'img_food10.jpg', 'img_food11.jpg', 'img_food12.jpg', 'img_food13.jpg',
    'img_food15.jpg', 'img_food23.jpg', 'img_food24.jpg', 'img_food25.jpg', 'img_food26.jpg',
    'img_food27.jpg', 'img_food28.jpg', 'img_food29.jpg', 'img_food30.jpg', 'img_food32.jpg',
    'img_food37.jpg', 'img_food38.jpg'
  ];

  // Try to construct URLs for missing images
  const baseUrl = 'https://cromst.seongnam.go.kr:10005/images/content/street_food/';
  for (const imageName of expectedImages) {
    const fullUrl = baseUrl + imageName;
    if (!imageUrls.some(url => url.includes(imageName))) {
      imageUrls.push(fullUrl);
    }
  }

  // Create food-images directory
  const imagesDir = path.join(__dirname, '..', 'public', 'food-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Download images
  console.log(`\nDownloading ${imageUrls.length} food images...`);
  let downloadedCount = 0;

  for (const url of imageUrls) {
    if (url.startsWith('http')) {
      try {
        const filename = url.split('/').pop().split('?')[0];
        const outputPath = path.join(imagesDir, filename);

        await downloadFile(url, outputPath);
        downloadedCount++;
        console.log(`Downloaded: ${filename}`);
      } catch (err) {
        console.error(`Failed to download ${url}: ${err.message}`);
      }
    }
  }

  console.log(`\nFood images extraction complete! Downloaded ${downloadedCount} images.`);
}

extractFoodImages().catch(console.error);