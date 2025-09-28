import { chromium } from 'playwright';

async function checkDeployment() {
  const browser = await chromium.launch({
    headless: true
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Console 에러 수집
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 네트워크 실패 요청 수집
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()
      });
    });

    console.log('1. 메인 페이지 접속 테스트...');
    const response = await page.goto('https://liveq.github.io/crom/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   - 응답 상태: ${response.status()}`);

    // 스크린샷 저장
    await page.screenshot({ path: 'main-page.png', fullPage: true });
    console.log('   - 스크린샷 저장: main-page.png');

    // 메인 섹션 확인
    console.log('\n2. 메인 컨텐츠 확인...');
    const heroSection = await page.$('.hero-section');
    console.log(`   - Hero 섹션: ${heroSection ? '✓ 있음' : '✗ 없음'}`);

    const aboutSection = await page.$('.about-section');
    console.log(`   - About 섹션: ${aboutSection ? '✓ 있음' : '✗ 없음'}`);

    const memorialSection = await page.$('.memorial-section');
    console.log(`   - Memorial 섹션: ${memorialSection ? '✓ 있음' : '✗ 없음'}`);

    // 이미지 로딩 확인
    console.log('\n3. 이미지 로딩 상태...');
    const images = await page.$$eval('img', imgs =>
      imgs.map(img => ({
        src: img.src,
        loaded: img.complete && img.naturalHeight !== 0
      }))
    );

    const loadedImages = images.filter(img => img.loaded);
    const failedImages = images.filter(img => !img.loaded);

    console.log(`   - 총 이미지: ${images.length}개`);
    console.log(`   - 로드 성공: ${loadedImages.length}개`);
    console.log(`   - 로드 실패: ${failedImages.length}개`);

    if (failedImages.length > 0) {
      console.log('\n   실패한 이미지 URL:');
      failedImages.slice(0, 5).forEach(img => {
        console.log(`     - ${img.src}`);
      });
    }

    // 네비게이션 메뉴 테스트
    console.log('\n4. 네비게이션 메뉴 테스트...');
    const navItems = await page.$$('.nav-item');
    console.log(`   - 네비게이션 항목 수: ${navItems.length}`);

    // Gallery 페이지 테스트
    console.log('\n5. Gallery 페이지 이동 테스트...');
    await page.click('a[href="/crom/gallery"]');
    await page.waitForTimeout(2000);

    const galleryImages = await page.$$('.gallery-item img');
    console.log(`   - Gallery 이미지 수: ${galleryImages.length}`);

    // Gallery 이미지 로딩 확인
    const galleryImageStatus = await page.$$eval('.gallery-item img', imgs =>
      imgs.slice(0, 3).map(img => ({
        src: img.src,
        loaded: img.complete && img.naturalHeight !== 0
      }))
    );

    galleryImageStatus.forEach((img, idx) => {
      console.log(`   - Gallery 이미지 ${idx + 1}: ${img.loaded ? '✓' : '✗'} ${img.src}`);
    });

    await page.screenshot({ path: 'gallery-page.png', fullPage: true });
    console.log('   - Gallery 스크린샷 저장: gallery-page.png');

    // 콘솔 에러 출력
    if (consoleErrors.length > 0) {
      console.log('\n6. 콘솔 에러:');
      consoleErrors.forEach(error => {
        console.log(`   - ${error}`);
      });
    } else {
      console.log('\n6. 콘솔 에러: 없음');
    }

    // 네트워크 실패 요청 출력
    if (failedRequests.length > 0) {
      console.log('\n7. 실패한 네트워크 요청:');
      failedRequests.slice(0, 10).forEach(req => {
        console.log(`   - ${req.url}`);
        console.log(`     실패 이유: ${req.failure().errorText}`);
      });
    } else {
      console.log('\n7. 실패한 네트워크 요청: 없음');
    }

  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

checkDeployment();