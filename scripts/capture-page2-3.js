import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function capturePage2and3() {
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

  // Page 2 attractions data
  const page2Data = [
    { name: '판교환경생태학습원', file: 'img_travel7.jpg' },
    { name: '판교박물관', file: 'img_travel8.jpg' },
    { name: '정자동 카페거리', file: 'img_travel9.jpg' },
    { name: '율동공원', file: 'img_travel10.jpg' },
    { name: '탄천변', file: 'img_travel11.jpg' },
    { name: '중앙공원', file: 'img_travel12.jpg' }
  ];

  // Page 3 attractions data
  const page3Data = [
    { name: '성남아트센터', file: 'img_travel13.jpg' },
    { name: '봉국사 대광명전', file: 'img_travel14.jpg' },
    { name: '남한산성', file: 'img_travel15.jpg' },
    { name: '모란민속 5일장', file: 'img_travel16.jpg' },
    { name: '성남시청', file: 'img_travel17.jpg' },
    { name: '성남종합운동장', file: 'img_travel18.jpg' }
  ];

  // Navigate to page 2
  console.log('\nNavigating to page 2...');
  await page.evaluate(() => {
    // Try different methods to go to page 2
    if (typeof go_page === 'function') {
      go_page(2);
    } else {
      // Try hash navigation
      window.location.hash = '#go_page2';
    }
  });
  await page.waitForTimeout(3000);

  // Capture page 2 screenshot
  console.log('Capturing page 2 screenshot...');
  const page2ScreenPath = path.join(imagesDir, 'page2_full.jpg');
  await page.screenshot({ path: page2ScreenPath, fullPage: true, type: 'jpeg', quality: 90 });

  // Try to capture individual elements on page 2
  const items2 = await page.$$('.travel_list1 li, .travel_list li');
  console.log(`Found ${items2.length} items on page 2`);

  for (let i = 0; i < Math.min(items2.length, 6); i++) {
    try {
      const outputPath = path.join(imagesDir, page2Data[i].file);
      await items2[i].screenshot({ path: outputPath, type: 'jpeg', quality: 85 });
      console.log(`Captured ${page2Data[i].file} - ${page2Data[i].name}`);
    } catch (err) {
      console.log(`Failed to capture item ${i}: ${err.message}`);
    }
  }

  // Navigate to page 3
  console.log('\nNavigating to page 3...');
  await page.evaluate(() => {
    if (typeof go_page === 'function') {
      go_page(3);
    } else {
      window.location.hash = '#go_page3';
    }
  });
  await page.waitForTimeout(3000);

  // Capture page 3 screenshot
  console.log('Capturing page 3 screenshot...');
  const page3ScreenPath = path.join(imagesDir, 'page3_full.jpg');
  await page.screenshot({ path: page3ScreenPath, fullPage: true, type: 'jpeg', quality: 90 });

  // Try to capture individual elements on page 3
  const items3 = await page.$$('.travel_list1 li, .travel_list li');
  console.log(`Found ${items3.length} items on page 3`);

  for (let i = 0; i < Math.min(items3.length, 6); i++) {
    try {
      const outputPath = path.join(imagesDir, page3Data[i].file);
      await items3[i].screenshot({ path: outputPath, type: 'jpeg', quality: 85 });
      console.log(`Captured ${page3Data[i].file} - ${page3Data[i].name}`);
    } catch (err) {
      console.log(`Failed to capture item ${i}: ${err.message}`);
    }
  }

  console.log('\nCapture complete! Browser remains open for manual verification.');
  console.log('Full page screenshots saved as page2_full.jpg and page3_full.jpg');
  console.log('You can manually crop these if individual captures failed.');

  // Keep browser open
  await page.waitForTimeout(300000);
  await browser.close();
}

capturePage2and3().catch(console.error);