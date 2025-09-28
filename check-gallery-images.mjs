import { chromium } from 'playwright';

async function checkGalleryImages() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('🔍 Checking gallery images...\n');

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // 갤러리 섹션으로 스크롤
  await page.evaluate(() => {
    document.getElementById('gallery')?.scrollIntoView();
  });

  await page.waitForTimeout(2000);

  // 모든 갤러리 이미지 찾기
  const images = await page.locator('#gallery img').all();

  console.log(`Found ${images.length} images in gallery\n`);

  const brokenImages = [];
  const workingImages = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = await img.getAttribute('src');
    const alt = await img.getAttribute('alt');
    const naturalWidth = await img.evaluate(el => el.naturalWidth);
    const naturalHeight = await img.evaluate(el => el.naturalHeight);

    if (naturalWidth === 0 || naturalHeight === 0) {
      brokenImages.push({ src, alt, index: i + 1 });
      console.log(`❌ Image ${i + 1}: ${src} - NOT LOADING`);
    } else {
      workingImages.push({ src, alt, index: i + 1 });
      console.log(`✅ Image ${i + 1}: ${src} - OK (${naturalWidth}x${naturalHeight})`);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Working images: ${workingImages.length}`);
  console.log(`❌ Broken images: ${brokenImages.length}`);

  if (brokenImages.length > 0) {
    console.log('\n🚨 Broken image paths:');
    brokenImages.forEach(img => {
      console.log(`  - ${img.src}`);
    });
  }

  // 실제 파일 존재 여부 확인
  if (brokenImages.length > 0) {
    console.log('\n🔍 Checking file existence...');
    const { existsSync } = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    for (const img of brokenImages) {
      const filePath = path.join(__dirname, 'public', img.src);
      const exists = existsSync(filePath);
      console.log(`  ${img.src}: ${exists ? '파일 존재 ✓' : '파일 없음 ✗'}`);
    }
  }

  await browser.close();
}

checkGalleryImages().catch(console.error);