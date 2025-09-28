import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Coordinates for extracting thumbnails from screenshots
// Based on a 3x2 grid layout for each page
const extractionCoords = {
  page2: [
    { x: 335, y: 185, width: 391, height: 270, output: 'img_travel7.jpg' },   // Top-left
    { x: 745, y: 185, width: 391, height: 270, output: 'img_travel8.jpg' },   // Top-middle
    { x: 1155, y: 185, width: 391, height: 270, output: 'img_travel9.jpg' },  // Top-right
    { x: 335, y: 530, width: 391, height: 270, output: 'img_travel10.jpg' },  // Bottom-left
    { x: 745, y: 530, width: 391, height: 270, output: 'img_travel11.jpg' },  // Bottom-middle
    { x: 1155, y: 530, width: 391, height: 270, output: 'img_travel12.jpg' }  // Bottom-right
  ],
  page3: [
    { x: 335, y: 185, width: 391, height: 270, output: 'img_travel13.jpg' },  // Top-left
    { x: 745, y: 185, width: 391, height: 270, output: 'img_travel14.jpg' },  // Top-middle
    { x: 1155, y: 185, width: 391, height: 270, output: 'img_travel15.jpg' }, // Top-right
    { x: 335, y: 530, width: 391, height: 270, output: 'img_travel16.jpg' },  // Bottom-left
    { x: 745, y: 530, width: 391, height: 270, output: 'img_travel17.jpg' },  // Bottom-middle
    { x: 1155, y: 530, width: 391, height: 270, output: 'img_travel18.jpg' }  // Bottom-right
  ]
};

async function extractFromScreenshots() {
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  console.log('=================================');
  console.log('SCREENSHOT EXTRACTION TOOL');
  console.log('=================================');
  console.log('Please provide screenshots as:');
  console.log('  /tmp/page2.png - Screenshot of page 2');
  console.log('  /tmp/page3.png - Screenshot of page 3');
  console.log('=================================\n');

  // Check for screenshots in /tmp
  const tmpPage2 = '/tmp/page2.png';
  const tmpPage3 = '/tmp/page3.png';

  // Also check in scripts directory
  const scriptsPage2 = path.join(__dirname, 'page2.png');
  const scriptsPage3 = path.join(__dirname, 'page3.png');

  let page2Path = null;
  let page3Path = null;

  // Find page 2 screenshot
  if (await fs.access(tmpPage2).then(() => true).catch(() => false)) {
    page2Path = tmpPage2;
    console.log('✅ Found page2.png in /tmp');
  } else if (await fs.access(scriptsPage2).then(() => true).catch(() => false)) {
    page2Path = scriptsPage2;
    console.log('✅ Found page2.png in scripts directory');
  }

  // Find page 3 screenshot
  if (await fs.access(tmpPage3).then(() => true).catch(() => false)) {
    page3Path = tmpPage3;
    console.log('✅ Found page3.png in /tmp');
  } else if (await fs.access(scriptsPage3).then(() => true).catch(() => false)) {
    page3Path = scriptsPage3;
    console.log('✅ Found page3.png in scripts directory');
  }

  // Process page 2 if found
  if (page2Path) {
    console.log('\nProcessing page 2 screenshot...');

    for (const coord of extractionCoords.page2) {
      try {
        const outputPath = path.join(imagesDir, coord.output);

        await sharp(page2Path)
          .extract({
            left: coord.x,
            top: coord.y,
            width: coord.width,
            height: coord.height
          })
          .jpeg({ quality: 85 })
          .toFile(outputPath);

        const stats = await fs.stat(outputPath);
        console.log(`✅ Extracted ${coord.output} (${stats.size} bytes)`);
      } catch (error) {
        console.error(`❌ Failed to extract ${coord.output}: ${error.message}`);
      }
    }
  } else {
    console.log('\n⚠️  Page 2 screenshot not found');
    console.log('Please save screenshot as /tmp/page2.png or scripts/page2.png');
  }

  // Process page 3 if found
  if (page3Path) {
    console.log('\nProcessing page 3 screenshot...');

    for (const coord of extractionCoords.page3) {
      try {
        const outputPath = path.join(imagesDir, coord.output);

        await sharp(page3Path)
          .extract({
            left: coord.x,
            top: coord.y,
            width: coord.width,
            height: coord.height
          })
          .jpeg({ quality: 85 })
          .toFile(outputPath);

        const stats = await fs.stat(outputPath);
        console.log(`✅ Extracted ${coord.output} (${stats.size} bytes)`);
      } catch (error) {
        console.error(`❌ Failed to extract ${coord.output}: ${error.message}`);
      }
    }
  } else {
    console.log('\n⚠️  Page 3 screenshot not found');
    console.log('Please save screenshot as /tmp/page3.png or scripts/page3.png');
  }

  // Verify results
  console.log('\n=== VERIFICATION ===');
  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel')).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

  console.log(`Total travel images: ${travelImages.length}/18`);

  // Check for missing images
  const missing = [];
  for (let i = 1; i <= 18; i++) {
    if (!travelImages.includes(`img_travel${i}.jpg`)) {
      missing.push(`img_travel${i}.jpg`);
    }
  }

  if (missing.length > 0) {
    console.log(`Missing: ${missing.join(', ')}`);
  } else {
    console.log('✅ All 18 images present!');
  }

  // Check for duplicates by file size
  const sizeMap = new Map();
  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    if (!sizeMap.has(stats.size)) {
      sizeMap.set(stats.size, []);
    }
    sizeMap.get(stats.size).push(file);
  }

  console.log(`\nUnique sizes: ${sizeMap.size}`);

  let hasDuplicates = false;
  for (const [size, fileList] of sizeMap.entries()) {
    if (fileList.length > 1) {
      console.log(`Duplicate size (${size} bytes): ${fileList.join(', ')}`);
      hasDuplicates = true;
    }
  }

  if (!hasDuplicates && sizeMap.size >= 12) {
    console.log('✅ Good variety of unique images!');
  }
}

extractFromScreenshots().catch(console.error);