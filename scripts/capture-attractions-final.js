import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureAttractionsFinal() {
  console.log('Starting final attraction capture process...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Navigate to travel page
  console.log('Navigating to travel page...');
  await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // Wait for page to fully load
  await page.waitForTimeout(5000);

  // First capture page 1 to verify we're on the right page
  console.log('\n=== PAGE 1 (Verification) ===');
  const page1Images = await capturePageImages(page, 1, 1);
  console.log(`Captured ${page1Images} images from page 1`);

  // Navigate to page 2
  console.log('\n=== PAGE 2 ===');
  console.log('Attempting to navigate to page 2...');

  // Multiple attempts to go to page 2
  const page2Success = await navigateToPage(page, 2);
  if (page2Success) {
    await page.waitForTimeout(5000);
    const page2Images = await capturePageImages(page, 2, 7);
    console.log(`Captured ${page2Images} images from page 2`);
  } else {
    console.log('Failed to navigate to page 2 automatically');
  }

  // Navigate to page 3
  console.log('\n=== PAGE 3 ===');
  console.log('Attempting to navigate to page 3...');

  const page3Success = await navigateToPage(page, 3);
  if (page3Success) {
    await page.waitForTimeout(5000);
    const page3Images = await capturePageImages(page, 3, 13);
    console.log(`Captured ${page3Images} images from page 3`);
  } else {
    console.log('Failed to navigate to page 3 automatically');
  }

  // Verify captured files
  console.log('\n=== VERIFICATION ===');
  await verifyImages(imagesDir);

  console.log('\nBrowser remains open for manual verification or re-capture');
  console.log('If automatic capture failed:');
  console.log('1. Manually click page 2 or 3');
  console.log('2. Run manual-capture.js in another terminal');

  await page.waitForTimeout(300000);
  await browser.close();
}

async function navigateToPage(page, pageNum) {
  try {
    // Method 1: Direct function call with correct name
    const result1 = await page.evaluate((num) => {
      if (typeof gopage === 'function') {
        gopage(num);
        return true;
      }
      return false;
    }, pageNum);

    if (result1) {
      console.log(`Successfully called gopage(${pageNum})`);
      return true;
    }

    // Method 2: Click on page number link
    const clicked = await page.evaluate((num) => {
      const links = document.querySelectorAll('a');
      for (const link of links) {
        if (link.textContent === String(num) ||
            (link.onclick && link.onclick.toString().includes(`gopage(${num})`))) {
          link.click();
          return true;
        }
      }
      return false;
    }, pageNum);

    if (clicked) {
      console.log(`Successfully clicked page ${pageNum} link`);
      return true;
    }

    // Method 3: Find and trigger pagination elements
    const pagination = await page.evaluate((num) => {
      // Look for pagination container
      const paginations = document.querySelectorAll('.pagination, .paging, [class*="page"]');
      for (const pag of paginations) {
        const pageLinks = pag.querySelectorAll('a, button, span');
        for (const link of pageLinks) {
          if (link.textContent === String(num)) {
            if (link.click) link.click();
            else if (link.onclick) link.onclick();
            return true;
          }
        }
      }
      return false;
    }, pageNum);

    if (pagination) {
      console.log(`Successfully triggered pagination for page ${pageNum}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error navigating to page ${pageNum}:`, error.message);
    return false;
  }
}

async function capturePageImages(page, pageNum, startIndex) {
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  let capturedCount = 0;

  try {
    // Get all images on the page
    const images = await page.$$('img');
    console.log(`Found ${images.length} total images on page ${pageNum}`);

    // Filter and capture visible travel images
    for (const img of images) {
      if (capturedCount >= 6) break;

      try {
        const isVisible = await img.isVisible();
        const box = await img.boundingBox();

        // Check if it's a significant image (not icon/logo)
        if (isVisible && box && box.width > 100 && box.height > 100) {
          // Check if it's in the main content area
          const isInContent = await img.evaluate(el => {
            const rect = el.getBoundingClientRect();
            // Check if image is in the main content area (not header/footer)
            return rect.top > 100 && rect.top < window.innerHeight - 100;
          });

          if (isInContent) {
            const outputPath = path.join(imagesDir, `img_travel${startIndex + capturedCount}.jpg`);
            await img.screenshot({
              path: outputPath,
              type: 'jpeg',
              quality: 85
            });

            // Get file size for verification
            const stats = await fs.stat(outputPath);
            console.log(`Captured img_travel${startIndex + capturedCount}.jpg (${stats.size} bytes)`);
            capturedCount++;
          }
        }
      } catch (err) {
        // Skip errors for individual images
      }
    }

    // If we didn't get enough images, try alternative selectors
    if (capturedCount < 6) {
      console.log('Trying alternative selectors...');
      const travelItems = await page.$$('.travel_list1 li img, .travel_list img, [class*="travel"] img');

      for (const img of travelItems) {
        if (capturedCount >= 6) break;

        try {
          const isVisible = await img.isVisible();
          if (isVisible) {
            const outputPath = path.join(imagesDir, `img_travel${startIndex + capturedCount}.jpg`);
            await img.screenshot({
              path: outputPath,
              type: 'jpeg',
              quality: 85
            });

            const stats = await fs.stat(outputPath);
            console.log(`Captured img_travel${startIndex + capturedCount}.jpg (${stats.size} bytes)`);
            capturedCount++;
          }
        } catch (err) {
          // Skip
        }
      }
    }

  } catch (error) {
    console.error(`Error capturing images for page ${pageNum}:`, error.message);
  }

  return capturedCount;
}

async function verifyImages(imagesDir) {
  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel')).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

  console.log(`\nTotal travel images: ${travelImages.length}`);

  // Check file sizes to detect duplicates
  const sizeMap = new Map();
  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    const size = stats.size;

    if (!sizeMap.has(size)) {
      sizeMap.set(size, []);
    }
    sizeMap.get(size).push(file);
  }

  // Report duplicates
  console.log('\nDuplicate analysis:');
  let hasDuplicates = false;
  for (const [size, files] of sizeMap.entries()) {
    if (files.length > 1) {
      console.log(`Same size (${size} bytes): ${files.join(', ')}`);
      hasDuplicates = true;
    }
  }

  if (!hasDuplicates) {
    console.log('No duplicates detected - all images appear unique!');
  }

  // Check for missing images
  console.log('\nMissing images check:');
  for (let i = 1; i <= 18; i++) {
    const filename = `img_travel${i}.jpg`;
    if (!travelImages.includes(filename)) {
      console.log(`Missing: ${filename}`);
    }
  }
}

captureAttractionsFinal().catch(console.error);