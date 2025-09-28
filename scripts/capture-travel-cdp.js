import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureTravelWithCDP() {
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

  // Create directory
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Navigate to travel page
  console.log('Navigating to travel page...');
  await targetPage.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel', {
    waitUntil: 'networkidle'
  });
  await targetPage.waitForTimeout(3000);

  let capturedCount = 0;

  // Process each page manually
  for (let pageNum = 1; pageNum <= 3; pageNum++) {
    console.log(`\n=== Page ${pageNum} ===`);

    if (pageNum === 2) {
      console.log('Navigating to page 2...');
      // Try multiple methods to go to page 2
      try {
        await targetPage.evaluate(() => {
          // Method 1: Direct function call
          if (typeof go_page === 'function') {
            go_page(2);
            return 'go_page called';
          }
          // Method 2: Find and click link
          const link = document.querySelector('a[href*="#go_page2"]');
          if (link) {
            link.click();
            return 'link clicked';
          }
          // Method 3: Hash navigation
          window.location.hash = '#go_page2';
          return 'hash changed';
        });
      } catch (err) {
        console.log('Page 2 navigation attempt:', err.message);
      }
      await targetPage.waitForTimeout(3000);
    } else if (pageNum === 3) {
      console.log('Navigating to page 3...');
      try {
        await targetPage.evaluate(() => {
          if (typeof go_page === 'function') {
            go_page(3);
            return 'go_page called';
          }
          const link = document.querySelector('a[href*="#go_page3"]');
          if (link) {
            link.click();
            return 'link clicked';
          }
          window.location.hash = '#go_page3';
          return 'hash changed';
        });
      } catch (err) {
        console.log('Page 3 navigation attempt:', err.message);
      }
      await targetPage.waitForTimeout(3000);
    }

    // Capture visible images on current page
    console.log(`Capturing images from page ${pageNum}...`);

    const images = await targetPage.$$('.travel_list1 img, .travel_list img, .list_box img, img[src*="travel"], img[src*="img_travel"]');

    console.log(`Found ${images.length} image elements`);

    for (let i = 0; i < images.length && capturedCount < pageNum * 6; i++) {
      try {
        const isVisible = await images[i].isVisible();
        const box = await images[i].boundingBox();

        if (isVisible && box && box.width > 50) {
          capturedCount++;
          const outputPath = path.join(imagesDir, `img_travel${capturedCount}.jpg`);
          await images[i].screenshot({ path: outputPath, quality: 85, type: 'jpeg' });
          console.log(`Captured img_travel${capturedCount}.jpg`);
        }
      } catch (err) {
        console.log(`Failed to capture image ${i}: ${err.message}`);
      }
    }

    // If not enough images, try capturing list items
    if (capturedCount < pageNum * 6) {
      console.log('Trying to capture list items...');
      const listItems = await targetPage.$$('.travel_list1 li, .travel_list li, .list_box li');

      for (let i = 0; i < listItems.length && capturedCount < pageNum * 6; i++) {
        try {
          const isVisible = await listItems[i].isVisible();
          if (isVisible) {
            capturedCount++;
            const outputPath = path.join(imagesDir, `img_travel${capturedCount}.jpg`);
            await listItems[i].screenshot({ path: outputPath, quality: 85, type: 'jpeg' });
            console.log(`Captured img_travel${capturedCount}.jpg from list item`);
          }
        } catch (err) {
          console.log(`Failed to capture list item ${i}: ${err.message}`);
        }
      }
    }
  }

  console.log(`\nTotal captured: ${capturedCount} images`);

  // Check what we got
  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel'));
  console.log(`\nFiles in directory: ${travelImages.length}`);
  travelImages.forEach(f => console.log(`  - ${f}`));

  console.log('\nDone! Browser remains open for manual capture if needed.');
}

captureTravelWithCDP().catch(console.error);