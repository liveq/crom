import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function postBasedCrawl() {
  console.log('🚀 POST 방식 cPage 파라미터로 전체 추모 메시지 크롤링 시작...');
  console.log('📝 발견한 페이징 메커니즘: POST /community/memorial with cPage parameter');

  const baseUrl = 'https://cromst.seongnam.go.kr:10005/community/memorial';
  const allMessages = [];
  const duplicateCheck = new Set();
  const maxPages = 77; // 사용자 확인: 77페이지까지 존재

  console.log(`📄 총 ${maxPages}페이지 크롤링 예정 (예상 459개 메시지)...`);

  for (let page = 1; page <= maxPages; page++) {
    try {
      console.log(`\\n📄 페이지 ${page}/${maxPages} 크롤링 중...`);

      // POST 데이터로 cPage 파라미터 전송
      const postData = new URLSearchParams({
        'cPage': page.toString()
      });

      const response = await axios.post(baseUrl, postData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Referer': baseUrl,
          'Origin': 'https://cromst.seongnam.go.kr:10005',
          'Cache-Control': 'no-cache'
        },
        timeout: 30000,
        maxRedirects: 5
      });

      console.log(`  ✅ HTTP ${response.status} (${response.data.length} bytes)`);

      const $ = cheerio.load(response.data);

      // 현재 페이지 번호 확인
      const activePage = $('.pagination .active a, .paging .on').text().trim();
      const hiddenCPage = $('input[name="cPage"], input[id="cPage"]').val();

      console.log(`  📍 활성 페이지: ${activePage}, 숨겨진 cPage: ${hiddenCPage}`);

      // 메시지 추출
      const pageMessages = [];
      $('.content li').each((i, element) => {
        const $el = $(element);
        const rawText = $el.text().trim();

        if (rawText.length < 10) return; // 너무 짧은 텍스트 제외

        // '글 삭제하기' 버튼 텍스트 제거
        let cleanText = rawText.replace(/\\s*글 삭제하기\\s*$/g, '').trim();

        // 작성자와 날짜 정보 추출 (정규식으로 더 정확하게)
        const authorDatePattern = /\\s+([^\\s]+)\\s+(\\d{4}-\\d{2}-\\d{2})\\s*$/;
        const match = cleanText.match(authorDatePattern);

        let author = '익명';
        let date = new Date().toISOString().split('T')[0];
        let content = cleanText;

        if (match) {
          author = match[1];
          date = match[2];
          content = cleanText.replace(authorDatePattern, '').trim();
        }

        // 유효한 컨텐츠만 수집
        if (content && content.length > 5) {
          const messageKey = `${author}-${content.substring(0, 150)}`;

          if (!duplicateCheck.has(messageKey)) {
            duplicateCheck.add(messageKey);

            const message = {
              id: `legacy_${page}_${i}_${Date.now()}`,
              author: author,
              content: content,
              date: date,
              page: page,
              crawlMethod: 'POST_cPage',
              isLegacy: true,
              createdAt: new Date().toISOString()
            };

            pageMessages.push(message);
            allMessages.push(message);

            // 서태지 관련 메시지 즉시 알림
            if (content.includes('서태지') || author.includes('서태지')) {
              console.log(`  🎯 서태지 메시지 발견! 페이지 ${page} - [${author}] ${content.substring(0, 100)}...`);
            }

            console.log(`    ✓ [${author}] ${content.substring(0, 60)}...`);
          }
        }
      });

      if (pageMessages.length > 0) {
        console.log(`  ✅ 페이지 ${page}: ${pageMessages.length}개 메시지 수집`);
      } else {
        console.log(`  ❌ 페이지 ${page}: 메시지 없음`);

        // 연속 빈 페이지 처리 (10페이지 이후부터만 적용)
        if (page > 10) {
          console.log(`    ⚠️ 페이지 ${page}에서 메시지가 없습니다. 계속 진행...`);
        }
      }

      // 77페이지인 경우 특별 분석
      if (page === 77) {
        console.log(`\\n🔍 마지막 페이지(77) 특별 분석:`);
        console.log(`  - 전체 li 요소: ${$('.content li').length}개`);
        console.log(`  - 수집된 메시지: ${pageMessages.length}개`);

        if (pageMessages.length > 0) {
          const firstMsg = pageMessages[0];
          console.log(`  - 첫 번째 메시지: [${firstMsg.author}] ${firstMsg.content.substring(0, 100)}...`);

          // 서태지 메시지를 찾는 경우
          const seoTaijiMsg = pageMessages.find(msg =>
            msg.content.includes('서태지') || msg.author.includes('서태지')
          );

          if (seoTaijiMsg) {
            console.log(`  🎯 77페이지에서 서태지 메시지 발견: [${seoTaijiMsg.author}] ${seoTaijiMsg.content}`);
          } else {
            console.log(`  ❌ 77페이지에서 서태지 메시지를 찾지 못했습니다.`);
          }
        }
      }

      // 요청 간 간격 (서버 부하 방지)
      await new Promise(resolve => setTimeout(resolve, 1200));

    } catch (error) {
      console.error(`  ❌ 페이지 ${page} 오류:`, error.message);

      if (error.response?.status === 404) {
        console.log(`    🔚 페이지 ${page}가 존재하지 않습니다. 크롤링 종료.`);
        break;
      }

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.log(`    🛑 네트워크 오류가 발생했습니다. 크롤링 중단.`);
        break;
      }

      // 일시적 오류인 경우 계속 진행
      console.log(`    ⚠️ 일시적 오류로 판단, 계속 진행합니다.`);
      continue;
    }
  }

  console.log(`\\n🎉 크롤링 완료! 총 ${allMessages.length}개 메시지 수집`);

  // 서태지 관련 메시지 검색
  const seoTaijiMessages = allMessages.filter(msg =>
    msg.content.includes('서태지') ||
    msg.author.includes('서태지') ||
    msg.content.includes('Seo Taiji') ||
    msg.content.includes('서태지와 아이들') ||
    msg.content.includes('서태지와아이들')
  );

  if (seoTaijiMessages.length > 0) {
    console.log(`\\n🎯 서태지 관련 메시지 ${seoTaijiMessages.length}개 발견:`);
    seoTaijiMessages.forEach((msg, idx) => {
      console.log(`  ${idx + 1}. 페이지 ${msg.page} [${msg.author}] (${msg.date})`);
      console.log(`     ${msg.content.substring(0, 200)}...\\n`);
    });

    // 서태지 메시지만 별도 저장
    const seoTaijiPath = '/Volumes/X31/code/crom-memorial/seo-taiji-messages-found.json';
    fs.writeFileSync(seoTaijiPath, JSON.stringify(seoTaijiMessages, null, 2), 'utf-8');
    console.log(`💾 서태지 메시지를 ${seoTaijiPath}에 저장했습니다.`);
  } else {
    console.log('\\n❌ 서태지 관련 메시지를 찾지 못했습니다.');
    console.log('💡 추가 검색 키워드를 시도해보겠습니다...');

    // 확장 검색
    const extendedSearch = allMessages.filter(msg =>
      msg.content.toLowerCase().includes('seo') ||
      msg.content.includes('태지') ||
      msg.author.toLowerCase().includes('seo') ||
      msg.author.includes('태지')
    );

    if (extendedSearch.length > 0) {
      console.log(`🔍 확장 검색 결과 ${extendedSearch.length}개 발견:`);
      extendedSearch.slice(0, 5).forEach(msg => {
        console.log(`  - [${msg.author}] ${msg.content.substring(0, 100)}...`);
      });
    }
  }

  // 전체 메시지 저장
  const outputPath = '/Volumes/X31/code/crom-memorial/src/data/memorialMessages-complete.json';
  fs.writeFileSync(outputPath, JSON.stringify(allMessages, null, 2), 'utf-8');
  console.log(`\\n💾 전체 메시지를 ${outputPath}에 저장했습니다.`);

  // 통계 정보
  console.log('\\n📊 최종 통계:');
  console.log(`  - 수집된 메시지: ${allMessages.length}개`);
  console.log(`  - 예상 메시지: 459개 (76*6+3)`);
  console.log(`  - 수집률: ${(allMessages.length / 459 * 100).toFixed(1)}%`);

  // 페이지별 통계
  const pageStats = {};
  allMessages.forEach(msg => {
    pageStats[msg.page] = (pageStats[msg.page] || 0) + 1;
  });

  console.log('\\n📈 페이지별 메시지 수:');
  Object.entries(pageStats)
    .sort(([a], [b]) => Number(a) - Number(b))
    .slice(0, 10)
    .forEach(([page, count]) => {
      console.log(`  페이지 ${page}: ${count}개`);
    });

  // 작성자 통계
  const authorStats = {};
  allMessages.forEach(msg => {
    authorStats[msg.author] = (authorStats[msg.author] || 0) + 1;
  });

  console.log('\\n👤 주요 작성자 (상위 15명):');
  Object.entries(authorStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .forEach(([author, count]) => {
      console.log(`  ${author}: ${count}개`);
    });

  return allMessages;
}

postBasedCrawl().catch(console.error);