import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureCDPDirect() {
  console.log('CDP 연결로 직접 캡처 시도...');

  try {
    // CDP로 기존 브라우저에 연결
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();
    let targetPage = null;

    // 이미 열려있는 페이지 찾기
    for (const context of contexts) {
      const pages = context.pages();
      for (const page of pages) {
        const url = page.url();
        if (url.includes('cromst.seongnam.go.kr')) {
          targetPage = page;
          console.log('찾은 페이지:', url);
          break;
        }
      }
    }

    if (!targetPage) {
      console.log('cromst.seongnam.go.kr 페이지를 찾을 수 없습니다.');
      console.log('브라우저에서 https://cromst.seongnam.go.kr:10005/street/streetTravel 열어주세요.');
      return;
    }

    const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');

    // 페이지 2로 이동
    console.log('\n=== 페이지 2 캡처 ===');
    await targetPage.evaluate(() => {
      // 정확한 함수명 사용
      if (typeof gopage === 'function') {
        gopage(2);
      }
    });

    await targetPage.waitForTimeout(5000);

    // 페이지 2 이미지 캡처
    let capturedCount = 0;
    const images2 = await targetPage.$$('img');

    for (const img of images2) {
      try {
        const box = await img.boundingBox();
        if (box && box.width > 100 && box.height > 100) {
          const isInContent = await img.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return rect.top > 100 && rect.top < window.innerHeight - 100;
          });

          if (isInContent && capturedCount < 6) {
            const outputPath = path.join(imagesDir, `img_travel${7 + capturedCount}.jpg`);
            await img.screenshot({ path: outputPath, type: 'jpeg', quality: 85 });

            const stats = await fs.stat(outputPath);
            console.log(`캡처: img_travel${7 + capturedCount}.jpg (${stats.size} bytes)`);
            capturedCount++;
          }
        }
      } catch (err) {
        // 건너뛰기
      }
    }

    // 페이지 3로 이동
    console.log('\n=== 페이지 3 캡처 ===');
    await targetPage.evaluate(() => {
      if (typeof gopage === 'function') {
        gopage(3);
      }
    });

    await targetPage.waitForTimeout(5000);

    // 페이지 3 이미지 캡처
    capturedCount = 0;
    const images3 = await targetPage.$$('img');

    for (const img of images3) {
      try {
        const box = await img.boundingBox();
        if (box && box.width > 100 && box.height > 100) {
          const isInContent = await img.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return rect.top > 100 && rect.top < window.innerHeight - 100;
          });

          if (isInContent && capturedCount < 6) {
            const outputPath = path.join(imagesDir, `img_travel${13 + capturedCount}.jpg`);
            await img.screenshot({ path: outputPath, type: 'jpeg', quality: 85 });

            const stats = await fs.stat(outputPath);
            console.log(`캡처: img_travel${13 + capturedCount}.jpg (${stats.size} bytes)`);
            capturedCount++;
          }
        }
      } catch (err) {
        // 건너뛰기
      }
    }

    // 검증
    console.log('\n=== 검증 ===');
    const files = await fs.readdir(imagesDir);
    const travelImages = files.filter(f => f.startsWith('img_travel'));

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
        console.log(`중복 (${size} bytes): ${fileList.join(', ')}`);
      }
    }

    console.log('\n완료!');
    process.exit(0);

  } catch (error) {
    console.error('오류:', error.message);
    console.log('\nChrome이 디버그 모드로 실행 중인지 확인하세요:');
    console.log('google-chrome --remote-debugging-port=9222');
  }
}

captureCDPDirect().catch(console.error);