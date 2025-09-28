import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureCorrectPages() {
  console.log('Opening browser to capture page 2 and 3 thumbnails...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Navigate to travel page
  console.log('Navigating to travel page...');
  await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel', {
    waitUntil: 'networkidle'
  });
  await page.waitForTimeout(3000);

  // Navigate to page 2
  console.log('\nNavigating to page 2...');
  await page.evaluate(() => {
    // Correct function name: gopage not go_page
    if (typeof gopage === 'function') {
      gopage(2);
      console.log('Called gopage(2)');
    } else {
      // Try clicking the page 2 link
      const links = document.querySelectorAll('a');
      for (const link of links) {
        if (link.onclick && link.onclick.toString().includes('gopage(2)')) {
          link.click();
          console.log('Clicked page 2 link');
          break;
        }
      }
    }
  });
  await page.waitForTimeout(3000);

  // Capture all visible images on page 2
  console.log('Capturing page 2 thumbnails...');
  let imageIndex = 7;

  const images2 = await page.$$('img');
  for (const img of images2) {
    try {
      const isVisible = await img.isVisible();
      const box = await img.boundingBox();

      if (isVisible && box && box.width > 100 && box.height > 100 && imageIndex <= 12) {
        const outputPath = path.join(imagesDir, `img_travel${imageIndex}.jpg`);
        await img.screenshot({ path: outputPath, type: 'jpeg', quality: 85 });
        console.log(`Captured img_travel${imageIndex}.jpg`);
        imageIndex++;
      }
    } catch (err) {
      // Skip errors
    }
  }

  // Navigate to page 3
  console.log('\nNavigating to page 3...');
  await page.evaluate(() => {
    if (typeof gopage === 'function') {
      gopage(3);
      console.log('Called gopage(3)');
    } else {
      const links = document.querySelectorAll('a');
      for (const link of links) {
        if (link.onclick && link.onclick.toString().includes('gopage(3)')) {
          link.click();
          console.log('Clicked page 3 link');
          break;
        }
      }
    }
  });
  await page.waitForTimeout(3000);

  // Capture all visible images on page 3
  console.log('Capturing page 3 thumbnails...');
  imageIndex = 13;

  const images3 = await page.$$('img');
  for (const img of images3) {
    try {
      const isVisible = await img.isVisible();
      const box = await img.boundingBox();

      if (isVisible && box && box.width > 100 && box.height > 100 && imageIndex <= 18) {
        const outputPath = path.join(imagesDir, `img_travel${imageIndex}.jpg`);
        await img.screenshot({ path: outputPath, type: 'jpeg', quality: 85 });
        console.log(`Captured img_travel${imageIndex}.jpg`);
        imageIndex++;
      }
    } catch (err) {
      // Skip errors
    }
  }

  console.log('\nCapture complete!');

  // Check what we have
  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel')).sort();
  console.log(`\nTotal travel images: ${travelImages.length}`);

  // Keep browser open for manual capture if needed
  console.log('\nBrowser remains open for manual capture if needed.');
  await page.waitForTimeout(300000);
  await browser.close();
}

captureCorrectPages().catch(console.error);