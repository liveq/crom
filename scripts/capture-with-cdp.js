import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureWithCDP() {
  console.log('Connecting to Chrome via CDP...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');

  const contexts = browser.contexts();
  let targetPage = null;

  for (const context of contexts) {
    const pages = context.pages();
    for (const page of pages) {
      const url = page.url();
      if (url.includes('cromst.seongnam.go.kr')) {
        targetPage = page;
        console.log('Found existing page:', url);
        break;
      }
    }
  }

  if (!targetPage) {
    console.log('Opening new page...');
    const browser2 = await chromium.launch({ headless: false });
    targetPage = await browser2.newPage();
  }

  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');

  // Navigate to travel page
  console.log('Navigating to travel page...');
  await targetPage.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel', {
    waitUntil: 'networkidle'
  });
  await targetPage.waitForTimeout(3000);

  // Navigate to page 2 and capture
  console.log('\n=== Page 2 ===');
  console.log('Clicking page 2...');

  // Try to click page 2 button directly
  try {
    await targetPage.click('text="2"');
  } catch (e) {
    console.log('Direct click failed, trying evaluate...');
    await targetPage.evaluate(() => {
      // Try gopage function
      if (typeof gopage === 'function') {
        gopage(2);
      }
    });
  }

  await targetPage.waitForTimeout(4000);

  console.log('Capturing page 2 images...');
  const images2 = await targetPage.$$('.travel_list1 img, img[src*="travel"]');
  console.log(`Found ${images2.length} images on page 2`);

  let capturedCount = 0;
  for (let i = 0; i < Math.min(images2.length, 6); i++) {
    try {
      const isVisible = await images2[i].isVisible();
      if (isVisible) {
        const outputPath = path.join(imagesDir, `img_travel${i + 7}.jpg`);
        await images2[i].screenshot({ path: outputPath, type: 'jpeg', quality: 85 });
        console.log(`Captured img_travel${i + 7}.jpg`);
        capturedCount++;
      }
    } catch (err) {
      console.log(`Failed to capture image ${i + 7}: ${err.message}`);
    }
  }

  // Navigate to page 3 and capture
  console.log('\n=== Page 3 ===');
  console.log('Clicking page 3...');

  try {
    await targetPage.click('text="3"');
  } catch (e) {
    console.log('Direct click failed, trying evaluate...');
    await targetPage.evaluate(() => {
      if (typeof gopage === 'function') {
        gopage(3);
      }
    });
  }

  await targetPage.waitForTimeout(4000);

  console.log('Capturing page 3 images...');
  const images3 = await targetPage.$$('.travel_list1 img, img[src*="travel"]');
  console.log(`Found ${images3.length} images on page 3`);

  capturedCount = 0;
  for (let i = 0; i < Math.min(images3.length, 6); i++) {
    try {
      const isVisible = await images3[i].isVisible();
      if (isVisible) {
        const outputPath = path.join(imagesDir, `img_travel${i + 13}.jpg`);
        await images3[i].screenshot({ path: outputPath, type: 'jpeg', quality: 85 });
        console.log(`Captured img_travel${i + 13}.jpg`);
        capturedCount++;
      }
    } catch (err) {
      console.log(`Failed to capture image ${i + 13}: ${err.message}`);
    }
  }

  console.log('\n=== Capture Complete ===');

  // Verify all files
  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel')).sort();
  console.log(`Total images: ${travelImages.length}`);

  // Check file sizes to verify they're different
  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    console.log(`${file}: ${stats.size} bytes`);
  }

  console.log('\nKeeping browser open for manual verification...');
}

captureWithCDP().catch(console.error);