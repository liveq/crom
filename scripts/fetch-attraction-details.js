import { chromium } from 'playwright';

async function fetchAttractionDetails() {
  console.log('=== 볼거리 상세 설명 수집 시작 ===\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--lang=ko']
  });
  const page = await browser.newPage();

  const attractions = [];

  try {
    // 페이지 1 접속
    console.log('📍 페이지 1 접속...');
    await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(3000);

    // 페이지 1의 각 이미지 클릭
    console.log('페이지 1 상세 정보 수집 중...\n');

    for (let i = 0; i < 6; i++) {
      try {
        // 이미지 클릭
        const images = await page.$$('.travel_list1 img, .travel_list img, ul li img');

        if (images[i]) {
          await images[i].click();
          await page.waitForTimeout(2000);

          // 팝업에서 정보 추출
          const details = await page.evaluate(() => {
            // 팝업 내용 찾기
            const popup = document.querySelector('.popup, .modal, [class*="detail"], .layer_popup');
            if (popup) {
              const title = popup.querySelector('h2, h3, .title')?.textContent?.trim() || '';
              const description = popup.querySelector('.content, .description, .text, p')?.textContent?.trim() || '';
              return { title, description };
            }

            // 대안: 전체 페이지에서 찾기
            const visibleTexts = Array.from(document.querySelectorAll('*')).filter(el => {
              const style = window.getComputedStyle(el);
              return style.display !== 'none' &&
                     style.visibility !== 'hidden' &&
                     el.offsetWidth > 0 &&
                     el.offsetHeight > 0 &&
                     el.textContent.length > 50;
            });

            if (visibleTexts.length > 0) {
              return {
                title: '',
                description: visibleTexts[0].textContent.trim()
              };
            }

            return null;
          });

          if (details) {
            console.log(`${i + 1}. ${details.title || `장소 ${i + 1}`}`);
            console.log(`   설명: ${details.description.substring(0, 100)}...`);
            attractions.push(details);
          }

          // 팝업 닫기
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);

        }
      } catch (error) {
        console.log(`   ${i + 1}번 이미지 정보 수집 실패:`, error.message);
      }
    }

    // 페이지 2로 이동
    console.log('\n📍 페이지 2로 이동...');
    await page.evaluate(() => {
      if (typeof gopage === 'function') {
        gopage(2);
      }
    });
    await page.waitForTimeout(5000);

    console.log('페이지 2 상세 정보 수집 중...\n');

    for (let i = 0; i < 6; i++) {
      try {
        const images = await page.$$('.travel_list1 img, .travel_list img, ul li img');

        if (images[i]) {
          await images[i].click();
          await page.waitForTimeout(2000);

          const details = await page.evaluate(() => {
            const popup = document.querySelector('.popup, .modal, [class*="detail"], .layer_popup');
            if (popup) {
              const title = popup.querySelector('h2, h3, .title')?.textContent?.trim() || '';
              const description = popup.querySelector('.content, .description, .text, p')?.textContent?.trim() || '';
              return { title, description };
            }
            return null;
          });

          if (details) {
            console.log(`${i + 7}. ${details.title || `장소 ${i + 7}`}`);
            console.log(`   설명: ${details.description.substring(0, 100)}...`);
            attractions.push(details);
          }

          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        }
      } catch (error) {
        console.log(`   ${i + 7}번 이미지 정보 수집 실패:`, error.message);
      }
    }

    // 페이지 3로 이동
    console.log('\n📍 페이지 3로 이동...');
    await page.evaluate(() => {
      if (typeof gopage === 'function') {
        gopage(3);
      }
    });
    await page.waitForTimeout(5000);

    console.log('페이지 3 상세 정보 수집 중...\n');

    for (let i = 0; i < 6; i++) {
      try {
        const images = await page.$$('.travel_list1 img, .travel_list img, ul li img');

        if (images[i]) {
          await images[i].click();
          await page.waitForTimeout(2000);

          const details = await page.evaluate(() => {
            const popup = document.querySelector('.popup, .modal, [class*="detail"], .layer_popup');
            if (popup) {
              const title = popup.querySelector('h2, h3, .title')?.textContent?.trim() || '';
              const description = popup.querySelector('.content, .description, .text, p')?.textContent?.trim() || '';
              return { title, description };
            }
            return null;
          });

          if (details) {
            console.log(`${i + 13}. ${details.title || `장소 ${i + 13}`}`);
            console.log(`   설명: ${details.description.substring(0, 100)}...`);
            attractions.push(details);
          }

          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        }
      } catch (error) {
        console.log(`   ${i + 13}번 이미지 정보 수집 실패:`, error.message);
      }
    }

    console.log(`\n✅ 총 ${attractions.length}개 장소 정보 수집 완료`);

    // 브라우저 열어둠
    console.log('\n브라우저에서 수동 확인 가능합니다.');
    await page.waitForTimeout(300000);

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await browser.close();
  }
}

fetchAttractionDetails().catch(console.error);