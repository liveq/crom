import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 스크린샷에서 각 썸네일의 대략적인 위치 (3x2 그리드)
const thumbnailPositions = [
  // Page 2 (7-12)
  { x: 200, y: 120, width: 360, height: 250, output: 'img_travel7.jpg' },  // 판교환경생태학습원
  { x: 535, y: 120, width: 360, height: 250, output: 'img_travel8.jpg' },  // 판교박물관
  { x: 870, y: 120, width: 360, height: 250, output: 'img_travel9.jpg' },  // 정자동 카페거리
  { x: 200, y: 485, width: 360, height: 250, output: 'img_travel10.jpg' }, // 율동공원
  { x: 535, y: 485, width: 360, height: 250, output: 'img_travel11.jpg' }, // 탄천변
  { x: 870, y: 485, width: 360, height: 250, output: 'img_travel12.jpg' }, // 중앙공원

  // Page 3 (13-18)
  { x: 200, y: 120, width: 360, height: 250, output: 'img_travel13.jpg' }, // 성남아트센터
  { x: 535, y: 120, width: 360, height: 250, output: 'img_travel14.jpg' }, // 봉국사 대광명전
  { x: 870, y: 120, width: 360, height: 250, output: 'img_travel15.jpg' }, // 남한산성
  { x: 200, y: 485, width: 360, height: 250, output: 'img_travel16.jpg' }, // 모란민속 5일장
  { x: 535, y: 485, width: 360, height: 250, output: 'img_travel17.jpg' }, // 성남시청
  // img_travel18.jpg will remain as placeholder or we'll use a duplicate
];

async function extractThumbnailsFromScreenshots() {
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Note: User needs to save screenshots as page2.png and page3.png in the scripts folder
  console.log('Please save the screenshots as:');
  console.log('  - /Volumes/X31/code/crom-memorial/scripts/page2.png');
  console.log('  - /Volumes/X31/code/crom-memorial/scripts/page3.png');
  console.log('\nThen run this script again.');

  try {
    // Process page 2
    const page2Path = path.join(__dirname, 'page2.png');
    const page2Exists = await fs.access(page2Path).then(() => true).catch(() => false);

    if (page2Exists) {
      console.log('\nProcessing page 2...');
      for (let i = 0; i < 6; i++) {
        const pos = thumbnailPositions[i];
        const outputPath = path.join(imagesDir, pos.output);

        await sharp(page2Path)
          .extract({ left: pos.x, top: pos.y, width: pos.width, height: pos.height })
          .jpeg({ quality: 85 })
          .toFile(outputPath);

        console.log(`Extracted ${pos.output}`);
      }
    }

    // Process page 3
    const page3Path = path.join(__dirname, 'page3.png');
    const page3Exists = await fs.access(page3Path).then(() => true).catch(() => false);

    if (page3Exists) {
      console.log('\nProcessing page 3...');
      for (let i = 6; i < 11; i++) {
        const pos = thumbnailPositions[i];
        const outputPath = path.join(imagesDir, pos.output);

        await sharp(page3Path)
          .extract({ left: pos.x, top: pos.y, width: pos.width, height: pos.height })
          .jpeg({ quality: 85 })
          .toFile(outputPath);

        console.log(`Extracted ${pos.output}`);
      }

      // For img_travel18.jpg, copy one of the existing ones or use a specific one
      const source17 = path.join(imagesDir, 'img_travel17.jpg');
      const dest18 = path.join(imagesDir, 'img_travel18.jpg');
      await fs.copyFile(source17, dest18);
      console.log('Created img_travel18.jpg (copy of 17)');
    }

    console.log('\nExtraction complete!');
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nMake sure sharp is installed: npm install sharp');
  }
}

// Alternative: Create thumbnails directly from user-provided screenshots using Playwright
async function extractWithPlaywright() {
  console.log('Opening browser to process screenshots...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Create a simple HTML page to display and crop screenshots
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 20px; background: #333; }
        .info { color: white; margin-bottom: 20px; }
        .screenshots { display: flex; gap: 20px; }
        img { max-width: 100%; }
        .grid-overlay {
          position: absolute;
          border: 2px solid red;
          pointer-events: none;
        }
        .container { position: relative; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="info">
        <h2>Screenshot Processor</h2>
        <p>Please upload the screenshots of page 2 and page 3</p>
        <input type="file" id="page2" accept="image/*">
        <input type="file" id="page3" accept="image/*">
        <button onclick="processImages()">Process</button>
      </div>
      <div class="screenshots">
        <div class="container">
          <canvas id="canvas2"></canvas>
        </div>
        <div class="container">
          <canvas id="canvas3"></canvas>
        </div>
      </div>
      <script>
        function processImages() {
          console.log('Processing images...');
        }
      </script>
    </body>
    </html>
  `);

  console.log('Please use the browser to upload and process screenshots');
  console.log('Keep browser open...');

  // Keep browser open for manual processing
  await page.waitForTimeout(300000);
  await browser.close();
}

// Run the appropriate function
extractThumbnailsFromScreenshots().catch(console.error);