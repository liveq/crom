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

async function extractTravelImages() {
  console.log('Connecting to Chrome to extract travel images...');
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
    await targetPage.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel', { waitUntil: 'networkidle' });
  }

  console.log('Current URL:', await targetPage.url());

  // Try different selectors to find travel items
  const travelData = await targetPage.evaluate(() => {
    const attractions = [];
    const images = [];

    // Try multiple selectors
    const selectors = [
      '.travel_list1 .box',
      '.travel_list .box',
      '[class*="travel"] .box',
      '.box',
      '.item',
      '[class*="list"] [class*="box"]'
    ];

    let items = null;
    for (const selector of selectors) {
      items = document.querySelectorAll(selector);
      if (items.length > 0) {
        console.log(`Found ${items.length} items with selector: ${selector}`);
        break;
      }
    }

    // Find all images on the page
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
      if (img.src && (img.src.includes('travel') || img.src.includes('img_travel'))) {
        images.push(img.src);
      }
    });

    // Check for background images
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      const bgImage = style.backgroundImage;
      if (bgImage && bgImage !== 'none' && bgImage.includes('travel')) {
        const match = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/);
        if (match) {
          images.push(match[1]);
        }
      }
    });

    // Parse the actual content structure
    if (items && items.length > 0) {
      items.forEach((item, index) => {
        // Try to find image
        let imageUrl = '';
        const imgEl = item.querySelector('img');
        if (imgEl) {
          imageUrl = imgEl.src;
        } else {
          const style = item.getAttribute('style') || '';
          const match = style.match(/url\(['"]?([^'")]+)['"]?\)/);
          if (match) {
            imageUrl = match[1];
          }
        }

        // Try to find text
        const titleEl = item.querySelector('.tit, .title, .desc, h3, h4, .name');
        const textEl = item.querySelector('.text, .content, p');

        attractions.push({
          index: index + 1,
          imageUrl: imageUrl,
          title: titleEl?.textContent?.trim() || '',
          text: textEl?.textContent?.trim() || '',
          html: item.innerHTML.substring(0, 200) // For debugging
        });
      });
    }

    // Return page structure for debugging
    return {
      attractions,
      images: [...new Set(images)], // Remove duplicates
      pageTitle: document.title,
      hasContent: document.body.innerHTML.length > 1000,
      bodyClasses: document.body.className,
      mainContent: document.querySelector('.content, .main, [class*="container"]')?.className || 'not found'
    };
  });

  console.log('Page data:', JSON.stringify(travelData, null, 2));

  // Expected travel images based on pattern
  const expectedImages = [
    'img_travel1.jpg', 'img_travel2.jpg', 'img_travel3.jpg',
    'img_travel4.jpg', 'img_travel5.jpg', 'img_travel6.jpg'
  ];

  // Create attraction-images directory
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Try to download found images
  console.log(`\nDownloading ${travelData.images.length} found images...`);
  let downloadedCount = 0;

  for (const imageUrl of travelData.images) {
    if (imageUrl && imageUrl.startsWith('http')) {
      try {
        const filename = imageUrl.split('/').pop().split('?')[0];
        const outputPath = path.join(imagesDir, filename);

        await downloadFile(imageUrl, outputPath);
        downloadedCount++;
        console.log(`Downloaded: ${filename}`);
      } catch (err) {
        console.error(`Failed to download ${imageUrl}: ${err.message}`);
      }
    }
  }

  // Try constructing URLs for expected images
  const baseUrl = 'https://cromst.seongnam.go.kr:10005/images/content/street_travel/';
  for (const imageName of expectedImages) {
    const fullUrl = baseUrl + imageName;
    try {
      const outputPath = path.join(imagesDir, imageName);
      await downloadFile(fullUrl, outputPath);
      downloadedCount++;
      console.log(`Downloaded expected: ${imageName}`);
    } catch (err) {
      console.log(`Could not download expected image ${imageName}`);
    }
  }

  console.log(`\nTravel images extraction complete! Downloaded ${downloadedCount} images.`);
}

extractTravelImages().catch(console.error);