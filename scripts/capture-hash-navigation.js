import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureWithHashNavigation() {
  console.log('Starting capture with hash navigation...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Navigate directly to page 2 using hash
  console.log('\n=== PAGE 2 ===');
  console.log('Navigating to: https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage2');
  await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage2', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // Wait for content to load
  await page.waitForTimeout(5000);

  // Capture page 2 images (7-12)
  console.log('Capturing page 2 images...');
  const page2Count = await captureVisibleImages(page, 7);
  console.log(`Captured ${page2Count} images from page 2`);

  // Navigate to page 3 using hash
  console.log('\n=== PAGE 3 ===');
  console.log('Navigating to: https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage3');
  await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage3', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // Wait for content to load
  await page.waitForTimeout(5000);

  // Capture page 3 images (13-18)
  console.log('Capturing page 3 images...');
  const page3Count = await captureVisibleImages(page, 13);
  console.log(`Captured ${page3Count} images from page 3`);

  // Verify results
  await verifyCaptures(imagesDir);

  console.log('\nCapture complete! Browser remains open for verification.');
  await page.waitForTimeout(300000);
  await browser.close();
}

async function captureVisibleImages(page, startIndex) {
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  let capturedCount = 0;
  const maxImages = 6;

  try {
    // Wait a bit more to ensure images are loaded
    await page.waitForTimeout(2000);

    // Get all images in the main content area
    const images = await page.$$eval('img', (imgs, startIdx) => {
      return imgs.map((img, index) => {
        const rect = img.getBoundingClientRect();
        const src = img.src;

        // Filter for travel images in the main content area
        const isTravel = src && (
          src.includes('travel') ||
          src.includes('Travel') ||
          src.includes('cromst')
        );

        const isVisible = rect.width > 100 &&
                         rect.height > 100 &&
                         rect.top > 100 &&
                         rect.top < window.innerHeight - 100;

        return {
          index,
          src,
          isVisible,
          isTravel,
          width: rect.width,
          height: rect.height,
          top: rect.top
        };
      }).filter(img => img.isVisible && img.isTravel);
    }, startIndex);

    console.log(`Found ${images.length} visible travel images`);

    // Capture the filtered images
    const imageElements = await page.$$('img');

    for (const imgInfo of images) {
      if (capturedCount >= maxImages) break;

      try {
        const img = imageElements[imgInfo.index];
        const outputPath = path.join(imagesDir, `img_travel${startIndex + capturedCount}.jpg`);

        await img.screenshot({
          path: outputPath,
          type: 'jpeg',
          quality: 85
        });

        const stats = await fs.stat(outputPath);
        console.log(`Captured img_travel${startIndex + capturedCount}.jpg (${stats.size} bytes)`);
        capturedCount++;
      } catch (err) {
        console.log(`Failed to capture image at index ${imgInfo.index}`);
      }
    }

    // If we didn't get enough, try alternative approach
    if (capturedCount < maxImages) {
      console.log('Trying alternative capture method...');

      // Get images by specific selectors
      const travelImages = await page.$$('.travel_list1 img, .travel_list img, ul li img');

      for (const img of travelImages) {
        if (capturedCount >= maxImages) break;

        try {
          const isVisible = await img.isVisible();
          const box = await img.boundingBox();

          if (isVisible && box && box.width > 100 && box.height > 100) {
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
    console.error('Error capturing images:', error.message);
  }

  return capturedCount;
}

async function verifyCaptures(imagesDir) {
  console.log('\n=== VERIFICATION ===');

  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel')).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

  console.log(`Total travel images: ${travelImages.length}/18`);

  // Check file sizes for duplicates
  const sizeMap = new Map();
  const sizeDetails = [];

  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    const size = stats.size;
    sizeDetails.push({ file, size });

    if (!sizeMap.has(size)) {
      sizeMap.set(size, []);
    }
    sizeMap.get(size).push(file);
  }

  // Show all file sizes
  console.log('\nFile sizes:');
  sizeDetails.forEach(({ file, size }) => {
    console.log(`${file}: ${size} bytes`);
  });

  // Check for duplicates
  console.log('\nDuplicate check:');
  let hasDuplicates = false;
  for (const [size, fileList] of sizeMap.entries()) {
    if (fileList.length > 1) {
      console.log(`⚠️  Same size (${size} bytes): ${fileList.join(', ')}`);
      hasDuplicates = true;
    }
  }

  if (!hasDuplicates) {
    console.log('✅ No duplicates - all images are unique!');
  }

  // Check for missing images
  const missing = [];
  for (let i = 1; i <= 18; i++) {
    const filename = `img_travel${i}.jpg`;
    if (!travelImages.includes(filename)) {
      missing.push(filename);
    }
  }

  if (missing.length > 0) {
    console.log(`\n⚠️  Missing images: ${missing.join(', ')}`);
  } else {
    console.log('\n✅ All 18 images present!');
  }
}

captureWithHashNavigation().catch(console.error);