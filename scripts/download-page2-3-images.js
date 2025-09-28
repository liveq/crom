import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadPage2and3Images() {
  console.log('페이지 2, 3 이미지 직접 다운로드 시작...');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // 페이지 2 접속
  console.log('\n=== 페이지 2 접속 ===');
  console.log('URL: https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage2');

  await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage2', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // 페이지 로딩 대기
  await page.waitForTimeout(5000);

  // 페이지 2 이미지 다운로드 (7-12)
  console.log('페이지 2 이미지 다운로드 중...');

  const page2Images = await page.$$eval('img', imgs => {
    return imgs
      .filter(img => img.width > 100 && img.height > 100 && img.getBoundingClientRect().top > 100)
      .map(img => img.src);
  });

  console.log(`페이지 2에서 ${page2Images.length}개 이미지 URL 발견`);

  // 각 이미지 다운로드
  for (let i = 0; i < Math.min(page2Images.length, 6); i++) {
    if (page2Images[i]) {
      try {
        const response = await page.goto(page2Images[i]);
        const buffer = await response.body();
        const outputPath = path.join(imagesDir, `img_travel${7 + i}.jpg`);
        await fs.writeFile(outputPath, buffer);
        console.log(`✓ img_travel${7 + i}.jpg 다운로드 완료`);
      } catch (err) {
        console.log(`✗ img_travel${7 + i}.jpg 다운로드 실패: ${err.message}`);
      }
    }
  }

  // 페이지 3 접속
  console.log('\n=== 페이지 3 접속 ===');
  console.log('URL: https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage3');

  await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage3', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  await page.waitForTimeout(5000);

  // 페이지 3 이미지 다운로드 (13-18)
  console.log('페이지 3 이미지 다운로드 중...');

  const page3Images = await page.$$eval('img', imgs => {
    return imgs
      .filter(img => img.width > 100 && img.height > 100 && img.getBoundingClientRect().top > 100)
      .map(img => img.src);
  });

  console.log(`페이지 3에서 ${page3Images.length}개 이미지 URL 발견`);

  for (let i = 0; i < Math.min(page3Images.length, 6); i++) {
    if (page3Images[i]) {
      try {
        const response = await page.goto(page3Images[i]);
        const buffer = await response.body();
        const outputPath = path.join(imagesDir, `img_travel${13 + i}.jpg`);
        await fs.writeFile(outputPath, buffer);
        console.log(`✓ img_travel${13 + i}.jpg 다운로드 완료`);
      } catch (err) {
        console.log(`✗ img_travel${13 + i}.jpg 다운로드 실패: ${err.message}`);
      }
    }
  }

  // 검증
  console.log('\n=== 최종 확인 ===');
  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel')).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

  console.log(`총 이미지: ${travelImages.length}/18`);

  // 파일 크기 확인
  const sizeMap = new Map();
  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    if (!sizeMap.has(stats.size)) {
      sizeMap.set(stats.size, []);
    }
    sizeMap.get(stats.size).push(file);
  }

  console.log(`고유한 크기: ${sizeMap.size}개`);

  for (const [size, fileList] of sizeMap.entries()) {
    if (fileList.length > 1) {
      console.log(`중복 가능성: ${fileList.join(', ')} (${size} bytes)`);
    }
  }

  console.log('\n완료! 브라우저 확인 후 닫아주세요.');
  await page.waitForTimeout(300000);
  await browser.close();
}

downloadPage2and3Images().catch(console.error);