import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureDirectURL() {
  console.log('직접 URL로 페이지 2, 3 캡처 시작...');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  const page = await browser.newPage();

  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // 페이지 2 직접 접근
  console.log('\n=== 페이지 2 (직접 URL) ===');
  console.log('접속: https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage2');

  await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage2', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // 페이지 로딩 대기
  await page.waitForTimeout(7000);

  // 페이지 2 이미지 캡처
  console.log('페이지 2 이미지 캡처 중...');
  let capturedCount = 0;

  const images2 = await page.$$('img');
  console.log(`페이지 2에서 ${images2.length}개 이미지 발견`);

  for (const img of images2) {
    if (capturedCount >= 6) break;

    try {
      const box = await img.boundingBox();
      if (box && box.width > 100 && box.height > 100) {
        // 콘텐츠 영역에 있는지 확인
        const isInContent = await img.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.top > 100 && rect.top < window.innerHeight - 100 && rect.left > 100;
        });

        if (isInContent) {
          const outputPath = path.join(imagesDir, `img_travel${7 + capturedCount}.jpg`);
          await img.screenshot({ path: outputPath, type: 'jpeg', quality: 85 });

          const stats = await fs.stat(outputPath);
          console.log(`✓ img_travel${7 + capturedCount}.jpg (${stats.size} bytes)`);
          capturedCount++;
        }
      }
    } catch (err) {
      // 에러 무시
    }
  }

  console.log(`페이지 2에서 ${capturedCount}개 이미지 캡처 완료`);

  // 페이지 3 직접 접근
  console.log('\n=== 페이지 3 (직접 URL) ===');
  console.log('접속: https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage3');

  await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel#gopage3', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // 페이지 로딩 대기
  await page.waitForTimeout(7000);

  // 페이지 3 이미지 캡처
  console.log('페이지 3 이미지 캡처 중...');
  capturedCount = 0;

  const images3 = await page.$$('img');
  console.log(`페이지 3에서 ${images3.length}개 이미지 발견`);

  for (const img of images3) {
    if (capturedCount >= 6) break;

    try {
      const box = await img.boundingBox();
      if (box && box.width > 100 && box.height > 100) {
        const isInContent = await img.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.top > 100 && rect.top < window.innerHeight - 100 && rect.left > 100;
        });

        if (isInContent) {
          const outputPath = path.join(imagesDir, `img_travel${13 + capturedCount}.jpg`);
          await img.screenshot({ path: outputPath, type: 'jpeg', quality: 85 });

          const stats = await fs.stat(outputPath);
          console.log(`✓ img_travel${13 + capturedCount}.jpg (${stats.size} bytes)`);
          capturedCount++;
        }
      }
    } catch (err) {
      // 에러 무시
    }
  }

  console.log(`페이지 3에서 ${capturedCount}개 이미지 캡처 완료`);

  // 검증
  console.log('\n=== 검증 ===');
  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel')).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

  console.log(`전체 이미지: ${travelImages.length}/18`);

  // 크기로 중복 확인
  const sizeMap = new Map();
  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    if (!sizeMap.has(stats.size)) {
      sizeMap.set(stats.size, []);
    }
    sizeMap.get(stats.size).push(file);
  }

  console.log(`고유한 크기: ${sizeMap.size}개`);

  let duplicates = 0;
  for (const [size, fileList] of sizeMap.entries()) {
    if (fileList.length > 1) {
      console.log(`중복 (${size} bytes): ${fileList.join(', ')}`);
      duplicates++;
    }
  }

  if (duplicates === 0) {
    console.log('✅ 모든 이미지가 고유합니다!');
  } else {
    console.log(`⚠️  ${duplicates}개 그룹의 중복 발견`);
  }

  console.log('\n브라우저 열어둠 - 확인 후 닫아주세요');
  await page.waitForTimeout(300000);
  await browser.close();
}

captureDirectURL().catch(console.error);