import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function manualCapture() {
  console.log('Connecting to Chrome via CDP...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');

  const contexts = browser.contexts();
  let targetPage = null;

  for (const context of contexts) {
    const pages = context.pages();
    for (const page of pages) {
      const url = page.url();
      if (url.includes('cromst.seongnam.go.kr') && url.includes('streetTravel')) {
        targetPage = page;
        console.log('Found travel page:', url);
        break;
      }
    }
  }

  if (!targetPage) {
    console.log('Please navigate to: https://cromst.seongnam.go.kr:10005/street/streetTravel');
    return;
  }

  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');

  console.log('\n=================================');
  console.log('MANUAL CAPTURE MODE');
  console.log('=================================');
  console.log('Instructions:');
  console.log('1. Make sure you are on page 2 of the travel section');
  console.log('2. Press Enter to capture page 2 images');
  console.log('3. Then manually click page 3');
  console.log('4. Press Enter again to capture page 3 images');
  console.log('=================================\n');

  // Wait for user to be ready on page 2
  console.log('Navigate to PAGE 2 and press Enter when ready...');
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  console.log('Capturing page 2 images...');

  // Get all visible images
  const visibleImages2 = await targetPage.evaluate(() => {
    const images = document.querySelectorAll('img');
    const visible = [];
    images.forEach((img, index) => {
      const rect = img.getBoundingClientRect();
      if (rect.width > 100 && rect.height > 100 && rect.top >= 0 && rect.left >= 0) {
        visible.push({
          index,
          src: img.src,
          width: rect.width,
          height: rect.height
        });
      }
    });
    return visible;
  });

  console.log(`Found ${visibleImages2.length} visible images on page 2`);

  // Capture page 2 images (7-12)
  const images2 = await targetPage.$$('img');
  let captured = 0;
  for (let i = 0; i < images2.length && captured < 6; i++) {
    try {
      const box = await images2[i].boundingBox();
      if (box && box.width > 100 && box.height > 100) {
        const outputPath = path.join(imagesDir, `img_travel${captured + 7}.jpg`);
        await images2[i].screenshot({ path: outputPath, type: 'jpeg', quality: 85 });
        console.log(`Captured img_travel${captured + 7}.jpg`);
        captured++;
      }
    } catch (err) {
      // Skip
    }
  }

  console.log('\nNavigate to PAGE 3 and press Enter when ready...');
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  console.log('Capturing page 3 images...');

  // Get all visible images
  const visibleImages3 = await targetPage.evaluate(() => {
    const images = document.querySelectorAll('img');
    const visible = [];
    images.forEach((img, index) => {
      const rect = img.getBoundingClientRect();
      if (rect.width > 100 && rect.height > 100 && rect.top >= 0 && rect.left >= 0) {
        visible.push({
          index,
          src: img.src,
          width: rect.width,
          height: rect.height
        });
      }
    });
    return visible;
  });

  console.log(`Found ${visibleImages3.length} visible images on page 3`);

  // Capture page 3 images (13-18)
  const images3 = await targetPage.$$('img');
  captured = 0;
  for (let i = 0; i < images3.length && captured < 6; i++) {
    try {
      const box = await images3[i].boundingBox();
      if (box && box.width > 100 && box.height > 100) {
        const outputPath = path.join(imagesDir, `img_travel${captured + 13}.jpg`);
        await images3[i].screenshot({ path: outputPath, type: 'jpeg', quality: 85 });
        console.log(`Captured img_travel${captured + 13}.jpg`);
        captured++;
      }
    } catch (err) {
      // Skip
    }
  }

  console.log('\n=== Capture Complete ===');

  // Verify files
  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel')).sort();

  console.log('\nFile sizes (to check for duplicates):');
  const sizes = {};
  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    const size = stats.size;
    console.log(`${file}: ${size} bytes`);

    if (!sizes[size]) {
      sizes[size] = [];
    }
    sizes[size].push(file);
  }

  console.log('\nDuplicate check:');
  for (const [size, files] of Object.entries(sizes)) {
    if (files.length > 1) {
      console.log(`Same size (${size}): ${files.join(', ')}`);
    }
  }

  process.exit(0);
}

manualCapture().catch(console.error);