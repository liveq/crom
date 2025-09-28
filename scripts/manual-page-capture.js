import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function manualPageCapture() {
  console.log('수동 페이지 전환 캡처 모드');
  console.log('====================================\n');

  try {
    // CDP로 기존 브라우저 연결
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();
    let targetPage = null;

    for (const context of contexts) {
      const pages = context.pages();
      for (const page of pages) {
        const url = page.url();
        if (url.includes('cromst.seongnam.go.kr')) {
          targetPage = page;
          console.log('✓ 연결된 페이지:', url);
          break;
        }
      }
    }

    if (!targetPage) {
      console.log('cromst.seongnam.go.kr 페이지를 찾을 수 없습니다.');
      console.log('브라우저에서 직접 열어주세요:');
      console.log('https://cromst.seongnam.go.kr:10005/street/streetTravel');
      return;
    }

    const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');

    console.log('\n지시사항:');
    console.log('1. 브라우저에서 페이지 2 버튼을 클릭하세요');
    console.log('2. 페이지가 완전히 로드되면 Enter를 누르세요');
    console.log('====================================\n');

    console.log('페이지 2로 이동 후 Enter 키를 누르세요...');
    process.stdin.setRawMode(true);
    await new Promise(resolve => process.stdin.once('data', resolve));

    // 페이지 2 캡처
    console.log('\n페이지 2 캡처 시작...');
    const images2 = await targetPage.$$('img');
    let count = 0;

    for (const img of images2) {
      if (count >= 6) break;
      try {
        const box = await img.boundingBox();
        if (box && box.width > 100 && box.height > 100) {
          const isVisible = await img.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return rect.top > 100 && rect.top < window.innerHeight - 100;
          });

          if (isVisible) {
            const outputPath = path.join(imagesDir, `img_travel${7 + count}.jpg`);
            await img.screenshot({ path: outputPath, type: 'jpeg', quality: 90 });
            const stats = await fs.stat(outputPath);
            console.log(`✓ img_travel${7 + count}.jpg (${stats.size} bytes)`);
            count++;
          }
        }
      } catch (err) {
        // 무시
      }
    }

    console.log(`\n페이지 2에서 ${count}개 캡처 완료`);

    console.log('\n====================================');
    console.log('페이지 3으로 이동 후 Enter 키를 누르세요...');
    await new Promise(resolve => process.stdin.once('data', resolve));

    // 페이지 3 캡처
    console.log('\n페이지 3 캡처 시작...');
    const images3 = await targetPage.$$('img');
    count = 0;

    for (const img of images3) {
      if (count >= 6) break;
      try {
        const box = await img.boundingBox();
        if (box && box.width > 100 && box.height > 100) {
          const isVisible = await img.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return rect.top > 100 && rect.top < window.innerHeight - 100;
          });

          if (isVisible) {
            const outputPath = path.join(imagesDir, `img_travel${13 + count}.jpg`);
            await img.screenshot({ path: outputPath, type: 'jpeg', quality: 90 });
            const stats = await fs.stat(outputPath);
            console.log(`✓ img_travel${13 + count}.jpg (${stats.size} bytes)`);
            count++;
          }
        }
      } catch (err) {
        // 무시
      }
    }

    console.log(`\n페이지 3에서 ${count}개 캡처 완료`);

    // 최종 검증
    console.log('\n====================================');
    console.log('최종 검증...\n');

    const files = await fs.readdir(imagesDir);
    const travelImages = files.filter(f => f.startsWith('img_travel')).sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

    // 크기별 그룹화
    const sizeMap = new Map();
    for (const file of travelImages) {
      const stats = await fs.stat(path.join(imagesDir, file));
      if (!sizeMap.has(stats.size)) {
        sizeMap.set(stats.size, []);
      }
      sizeMap.get(stats.size).push(file);
    }

    console.log(`총 이미지: ${travelImages.length}/18`);
    console.log(`고유한 크기: ${sizeMap.size}개`);

    // 중복 확인
    let hasDuplicates = false;
    for (const [size, fileList] of sizeMap.entries()) {
      if (fileList.length > 1) {
        console.log(`⚠️  중복: ${fileList.join(', ')} (${size} bytes)`);
        hasDuplicates = true;
      }
    }

    if (!hasDuplicates) {
      console.log('\n✅ 모든 이미지가 고유합니다! 성공!');
    }

    process.stdin.setRawMode(false);
    process.exit(0);

  } catch (error) {
    console.error('오류:', error.message);
    process.stdin.setRawMode(false);
    process.exit(1);
  }
}

manualPageCapture().catch(console.error);