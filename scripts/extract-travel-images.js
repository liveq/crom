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
  console.log('Starting browser to extract travel attraction images...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to travel page...');
  await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  await page.waitForTimeout(3000);

  // Extract all travel data and images
  const travelData = await page.evaluate(() => {
    const attractions = [];

    // Find all travel items
    const items = document.querySelectorAll('.travel_list .box');

    items.forEach((item, index) => {
      const imgElement = item.querySelector('img');
      const titleElement = item.querySelector('.desc');

      // Extract background image from style attribute if no img element
      let imageUrl = '';
      if (imgElement) {
        imageUrl = imgElement.src;
      } else {
        const bgElement = item.querySelector('[style*="background"]');
        if (bgElement) {
          const style = bgElement.getAttribute('style');
          const match = style.match(/url\(['"]?([^'")]+)['"]?\)/);
          if (match) {
            imageUrl = match[1];
            if (!imageUrl.startsWith('http')) {
              imageUrl = 'https://cromst.seongnam.go.kr:10005' + imageUrl;
            }
          }
        }
      }

      // Get overlay information when hovering
      const overlayTitle = item.querySelector('.bg .tit')?.textContent?.trim() || '';
      const overlayText = item.querySelector('.bg .text')?.textContent?.trim() || '';
      const bottomTitle = titleElement?.textContent?.trim() || '';

      attractions.push({
        id: index + 1,
        name: overlayTitle || bottomTitle || `Attraction ${index + 1}`,
        description: overlayText || '',
        imageUrl: imageUrl,
        bottomTitle: bottomTitle
      });
    });

    // Also check for any images with travel in the filename
    const allImages = document.querySelectorAll('img[src*="travel"], img[src*="img_travel"]');
    const additionalImages = [];
    allImages.forEach(img => {
      if (!attractions.some(a => a.imageUrl === img.src)) {
        additionalImages.push(img.src);
      }
    });

    return { attractions, additionalImages };
  });

  console.log(`Found ${travelData.attractions.length} attractions`);
  console.log('Attractions data:', JSON.stringify(travelData.attractions, null, 2));

  // Create attraction-images directory
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Download images
  console.log(`\nDownloading attraction images...`);
  let downloadedCount = 0;

  for (const attraction of travelData.attractions) {
    if (attraction.imageUrl && attraction.imageUrl.startsWith('http')) {
      try {
        const urlObj = new URL(attraction.imageUrl);
        const filename = `img_travel${attraction.id}.jpg`;
        const outputPath = path.join(imagesDir, filename);

        await downloadFile(attraction.imageUrl, outputPath);
        downloadedCount++;
        console.log(`Downloaded: ${filename} - ${attraction.name}`);
      } catch (err) {
        console.error(`Failed to download ${attraction.imageUrl}: ${err.message}`);
      }
    }
  }

  // Download additional images
  for (const imageUrl of travelData.additionalImages) {
    if (imageUrl && imageUrl.startsWith('http')) {
      try {
        const filename = imageUrl.split('/').pop().split('?')[0];
        const outputPath = path.join(imagesDir, filename);

        await downloadFile(imageUrl, outputPath);
        downloadedCount++;
        console.log(`Downloaded additional: ${filename}`);
      } catch (err) {
        console.error(`Failed to download ${imageUrl}: ${err.message}`);
      }
    }
  }

  // Save attraction data to JSON for reference
  const dataPath = path.join(__dirname, 'travel-data.json');
  await fs.writeFile(dataPath, JSON.stringify(travelData.attractions, null, 2));
  console.log(`\nSaved attraction data to ${dataPath}`);

  console.log(`\nTravel images extraction complete! Downloaded ${downloadedCount} images.`);

  await browser.close();
}

extractTravelImages().catch(console.error);