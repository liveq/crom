import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:5173');

  // 신해철 거리 섹션으로 이동
  await page.evaluate(() => {
    const element = document.getElementById('street-gallery');
    if (element) element.scrollIntoView();
  });

  await page.waitForTimeout(2000);

  // 지도 컨테이너 찾기
  const mapContainer = await page.locator('.mapContainer').first();

  if (mapContainer) {
    // 컨테이너 정보 가져오기
    const containerInfo = await mapContainer.evaluate(el => {
      const styles = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        overflow: styles.overflow,
        overflowX: styles.overflowX,
        overflowY: styles.overflowY,
        maxWidth: styles.maxWidth,
        scrollWidth: el.scrollWidth,
        scrollHeight: el.scrollHeight,
        clientWidth: el.clientWidth,
        clientHeight: el.clientHeight,
        scrollLeft: el.scrollLeft,
        canScroll: el.scrollWidth > el.clientWidth
      };
    });

    console.log('Container Info:', containerInfo);

    // Inner 요소 정보
    const mapInner = await page.locator('.mapInner').first();
    const innerInfo = await mapInner.evaluate(el => {
      const styles = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        actualWidth: styles.width,
        position: styles.position
      };
    });

    console.log('Inner Info:', innerInfo);

    // 부모 컨테이너 확인
    const parentInfo = await page.evaluate(() => {
      const container = document.querySelector('[class*="container"]');
      if (container) {
        const styles = window.getComputedStyle(container);
        return {
          maxWidth: styles.maxWidth,
          width: container.offsetWidth,
          overflow: styles.overflow
        };
      }
      return null;
    });

    console.log('Parent Container Info:', parentInfo);

    // 스크롤 시도
    await mapContainer.evaluate(el => {
      el.scrollLeft = 500;
    });

    await page.waitForTimeout(1000);

    const scrolledPosition = await mapContainer.evaluate(el => el.scrollLeft);
    console.log('Scrolled to:', scrolledPosition);

    // 문제 분석
    console.log('\n=== 문제 분석 ===');
    if (containerInfo.canScroll) {
      console.log('✓ 스크롤 가능한 상태');
    } else {
      console.log('✗ 스크롤 불가능 - 컨테이너 너비가 콘텐츠보다 큼');
      console.log(`  컨테이너: ${containerInfo.clientWidth}px, 콘텐츠: ${containerInfo.scrollWidth}px`);
    }
  }

  await page.waitForTimeout(3000);
  await browser.close();
})();