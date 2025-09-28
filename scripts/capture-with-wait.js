import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureWithProperWait() {
  console.log('Starting capture with proper page change detection...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // First go to page 1 to get baseline
  console.log('\n=== PAGE 1 (Baseline) ===');
  await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel', {
    waitUntil: 'networkidle'
  });
  await page.waitForTimeout(3000);

  // Get first image src from page 1 as reference
  const page1FirstImageSrc = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    for (const img of imgs) {
      if (img.width > 100 && img.height > 100) {
        return img.src;
      }
    }
    return null;
  });
  console.log('Page 1 first image src:', page1FirstImageSrc);

  // Navigate to page 2
  console.log('\n=== PAGE 2 ===');
  await page.evaluate(() => {
    if (typeof gopage === 'function') {
      gopage(2);
    }
  });

  // Wait for page content to change
  console.log('Waiting for page 2 content to load...');
  await page.waitForFunction(
    (oldSrc) => {
      const imgs = document.querySelectorAll('img');
      for (const img of imgs) {
        if (img.width > 100 && img.height > 100) {
          return img.src !== oldSrc;
        }
      }
      return false;
    },
    page1FirstImageSrc,
    { timeout: 10000 }
  ).catch(() => {
    console.log('Page content did not change, trying alternative method...');
  });

  await page.waitForTimeout(3000);

  // Capture page 2
  const page2FirstImageSrc = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    for (const img of imgs) {
      if (img.width > 100 && img.height > 100) {
        return img.src;
      }
    }
    return null;
  });
  console.log('Page 2 first image src:', page2FirstImageSrc);

  if (page2FirstImageSrc === page1FirstImageSrc) {
    console.log('WARNING: Page 2 shows same content as page 1!');
    console.log('Trying direct URL navigation...');

    await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage2', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(5000);
  }

  console.log('Capturing page 2 images...');
  await capturePageImages(page, 2, 7);

  // Navigate to page 3
  console.log('\n=== PAGE 3 ===');
  await page.evaluate(() => {
    if (typeof gopage === 'function') {
      gopage(3);
    }
  });

  // Wait for page content to change
  console.log('Waiting for page 3 content to load...');
  await page.waitForFunction(
    (oldSrc) => {
      const imgs = document.querySelectorAll('img');
      for (const img of imgs) {
        if (img.width > 100 && img.height > 100) {
          return img.src !== oldSrc;
        }
      }
      return false;
    },
    page2FirstImageSrc,
    { timeout: 10000 }
  ).catch(() => {
    console.log('Page content did not change, trying alternative method...');
  });

  await page.waitForTimeout(3000);

  // Check if content changed
  const page3FirstImageSrc = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    for (const img of imgs) {
      if (img.width > 100 && img.height > 100) {
        return img.src;
      }
    }
    return null;
  });
  console.log('Page 3 first image src:', page3FirstImageSrc);

  if (page3FirstImageSrc === page2FirstImageSrc) {
    console.log('WARNING: Page 3 shows same content as page 2!');
    console.log('Trying direct URL navigation...');

    await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage3', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(5000);
  }

  console.log('Capturing page 3 images...');
  await capturePageImages(page, 3, 13);

  // Verify
  await verifyImages(imagesDir);

  console.log('\nBrowser remains open. If pages are not changing:');
  console.log('1. Manually click page 2 and 3 links');
  console.log('2. Run manual-capture.js to capture when ready');

  await page.waitForTimeout(300000);
  await browser.close();
}

async function capturePageImages(page, pageNum, startIndex) {
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  let captured = 0;

  // Get all visible travel images
  const imageData = await page.evaluate(() => {
    const images = [];
    const imgs = document.querySelectorAll('img');

    imgs.forEach((img, index) => {
      const rect = img.getBoundingClientRect();
      if (rect.width > 100 && rect.height > 100 && rect.top > 50 && rect.top < window.innerHeight - 50) {
        images.push({
          index,
          src: img.src,
          width: rect.width,
          height: rect.height
        });
      }
    });

    return images;
  });

  console.log(`Found ${imageData.length} visible images on page ${pageNum}`);

  const allImages = await page.$$('img');

  for (const imgInfo of imageData) {
    if (captured >= 6) break;

    try {
      const img = allImages[imgInfo.index];
      const outputPath = path.join(imagesDir, `img_travel${startIndex + captured}.jpg`);

      await img.screenshot({
        path: outputPath,
        type: 'jpeg',
        quality: 85
      });

      const stats = await fs.stat(outputPath);
      console.log(`Captured img_travel${startIndex + captured}.jpg (${stats.size} bytes) - ${imgInfo.src.split('/').pop()}`);
      captured++;
    } catch (err) {
      console.log(`Failed to capture image ${startIndex + captured}`);
    }
  }

  return captured;
}

async function verifyImages(imagesDir) {
  console.log('\n=== VERIFICATION ===');

  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel')).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

  // Group by size
  const sizeMap = new Map();
  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    if (!sizeMap.has(stats.size)) {
      sizeMap.set(stats.size, []);
    }
    sizeMap.get(stats.size).push(file);
  }

  // Report unique sizes
  console.log(`\nUnique image sizes: ${sizeMap.size}`);

  // Check for exact duplicates
  let duplicateGroups = 0;
  for (const [size, files] of sizeMap.entries()) {
    if (files.length > 1) {
      console.log(`Duplicate (${size} bytes): ${files.join(', ')}`);
      duplicateGroups++;
    }
  }

  if (duplicateGroups === 0) {
    console.log('✅ All images are unique!');
  } else {
    console.log(`⚠️  Found ${duplicateGroups} groups of duplicate images`);
  }
}

captureWithProperWait().catch(console.error);