import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function hashBasedCrawl() {
  console.log('🚀 해시 기반 페이징으로 전체 추모 메시지 크롤링 시작...');
  console.log('📝 사용자 확인 정보: #gopage1 ~ #gopage77 형태의 해시 라우팅');

  const baseUrl = 'https://cromst.seongnam.go.kr:10005/community/memorial';
  const allMessages = [];
  const duplicateCheck = new Set();

  // 해시 기반 URL 방식들 시도
  const hashMethods = [
    // 1. 해시 프래그먼트 방식
    { name: 'gopage 해시', getUrl: (page) => `${baseUrl}#gopage${page}` },
    { name: 'page 해시', getUrl: (page) => `${baseUrl}#page${page}` },

    // 2. 해시를 쿼리로 변환 시도
    { name: 'gopage 쿼리', getUrl: (page) => `${baseUrl}?gopage=${page}` },
    { name: 'hash 쿼리', getUrl: (page) => `${baseUrl}?hash=gopage${page}` },
  ];

  for (const method of hashMethods) {
    console.log(`\n🔄 ${method.name} 방식으로 크롤링 시도...`);
    const foundMessages = [];
    let consecutiveEmptyPages = 0;
    const maxEmptyPages = 3;

    for (let page = 1; page <= 77; page++) {
      try {
        const url = method.getUrl(page);
        console.log(`📄 페이지 ${page}/${77} 크롤링: ${url}`);

        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            'Referer': baseUrl,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          timeout: 30000
        });

        const $ = cheerio.load(response.data);

        // 현재 페이지 번호 확인 (다양한 방법으로)
        const currentPageIndicators = [
          $('.pagination .active a').text().trim(),
          $('.paging .on').text().trim(),
          $('.current-page').text().trim(),
          $('input[name="currentPage"]').val(),
          $('input[name="page"]').val()
        ].filter(Boolean);

        const currentPage = currentPageIndicators[0] || '미확인';
        console.log(`  📍 현재 페이지 표시: ${currentPage}`);

        // 페이지가 실제로 바뀌었는지 확인
        const pageChanged = currentPage == page || currentPage === '미확인';

        // 메시지 추출
        const pageMessages = [];
        $('.content li').each((i, element) => {
          const $el = $(element);
          const fullText = $el.text().trim();

          // '글 삭제하기' 버튼 텍스트 제거
          let content = fullText.replace(/\s*글 삭제하기\s*$/, '').trim();

          // 작성자와 날짜 정보 추출 (맨 뒤에서 추출)
          const infoPattern = /\s+([^\s]+)\s+(\d{4}-\d{2}-\d{2})\s*$/;
          const infoMatch = content.match(infoPattern);

          let author = '익명';
          let date = new Date().toISOString().split('T')[0];

          if (infoMatch) {
            author = infoMatch[1];
            date = infoMatch[2];
            content = content.replace(infoPattern, '').trim();
          }

          if (content && content.length > 10) {
            const messageKey = `${author}-${content.substring(0, 100)}`;

            if (!duplicateCheck.has(messageKey)) {
              duplicateCheck.add(messageKey);

              const message = {
                id: `msg_${page}_${i}_${Date.now()}`,
                author: author,
                content: content,
                date: date,
                page: page,
                method: method.name,
                isLegacy: true
              };

              pageMessages.push(message);
              foundMessages.push(message);

              console.log(`    ✓ [${author}] ${content.substring(0, 50)}...`);
            }
          }
        });

        if (pageMessages.length === 0) {
          consecutiveEmptyPages++;
          console.log(`    ❌ 메시지 없음 (연속 빈 페이지: ${consecutiveEmptyPages})`);

          if (consecutiveEmptyPages >= maxEmptyPages && page > 5) {
            console.log(`    🛑 연속 ${maxEmptyPages}페이지가 비어있어서 이 방식은 중단합니다.`);
            break;
          }
        } else {
          consecutiveEmptyPages = 0;
          console.log(`    ✅ ${pageMessages.length}개 메시지 발견`);
        }

        // 특별히 서태지 메시지 체크
        const seoTaijiInPage = pageMessages.filter(msg =>
          msg.content.includes('서태지') ||
          msg.author.includes('서태지') ||
          msg.content.includes('Seo Taiji')
        );

        if (seoTaijiInPage.length > 0) {
          console.log(`    🎯 이 페이지에서 서태지 관련 메시지 ${seoTaijiInPage.length}개 발견!`);
        }

        // 페이지 77에서는 특별히 더 자세히 확인
        if (page === 77) {
          console.log(`    🔍 페이지 77 특별 분석:`);
          console.log(`      - HTML 길이: ${response.data.length} bytes`);
          console.log(`      - 전체 li 요소: ${$('.content li').length}개`);
          console.log(`      - 메시지 수: ${pageMessages.length}개`);

          if (pageMessages.length > 0) {
            console.log(`      - 첫 번째 메시지 작성자: ${pageMessages[0].author}`);
            console.log(`      - 첫 번째 메시지 내용: ${pageMessages[0].content.substring(0, 100)}...`);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (error) {
        console.error(`    ❌ 페이지 ${page} 오류:`, error.message);
        continue;
      }
    }

    console.log(`\n📊 ${method.name} 결과: ${foundMessages.length}개 메시지 수집`);

    if (foundMessages.length > 0) {
      allMessages.push(...foundMessages);

      // 충분한 메시지를 찾았다면 다른 방법은 시도하지 않음
      if (foundMessages.length > 100) {
        console.log(`✅ ${method.name} 방식이 효과적입니다. 다른 방법은 건너뜁니다.`);
        break;
      }
    }
  }

  // 중복 제거
  const uniqueMessages = [];
  const finalCheck = new Set();

  for (const msg of allMessages) {
    const key = `${msg.author}-${msg.content.substring(0, 100)}`;
    if (!finalCheck.has(key)) {
      finalCheck.add(key);
      uniqueMessages.push(msg);
    }
  }

  console.log(`\n🎉 총 ${uniqueMessages.length}개의 고유 메시지 수집 완료`);

  // 서태지 메시지 검색
  const seoTaijiMessages = uniqueMessages.filter(msg =>
    msg.content.includes('서태지') ||
    msg.author.includes('서태지') ||
    msg.content.includes('Seo Taiji') ||
    msg.content.includes('서태지와 아이들')
  );

  if (seoTaijiMessages.length > 0) {
    console.log(`\n🎯 서태지 관련 메시지 ${seoTaijiMessages.length}개 발견:`);
    seoTaijiMessages.forEach((msg, idx) => {
      console.log(`  ${idx + 1}. 페이지 ${msg.page} [${msg.author}] ${msg.content.substring(0, 200)}...`);
    });

    const seoTaijiPath = '/Volumes/X31/code/crom-memorial/seo-taiji-found.json';
    fs.writeFileSync(seoTaijiPath, JSON.stringify(seoTaijiMessages, null, 2), 'utf-8');
    console.log(`💾 서태지 메시지를 ${seoTaijiPath}에 저장했습니다.`);
  } else {
    console.log('\n❌ 서태지 관련 메시지를 찾지 못했습니다.');
    console.log('💡 가능한 원인:');
    console.log('   - 메시지가 다른 페이지에 있을 수 있음');
    console.log('   - 작성자 이름이 다를 수 있음 (예: 서태지와아이들, SeoTaiji 등)');
    console.log('   - JavaScript 기반 페이징이 크롤러로 접근 불가능할 수 있음');
  }

  // 결과 저장
  const outputPath = '/Volumes/X31/code/crom-memorial/src/data/memorialMessages-crawled.json';
  fs.writeFileSync(outputPath, JSON.stringify(uniqueMessages, null, 2), 'utf-8');
  console.log(`\n💾 전체 메시지를 ${outputPath}에 저장했습니다.`);

  // 통계
  console.log('\n📈 최종 크롤링 통계:');
  console.log(`  - 수집된 메시지: ${uniqueMessages.length}개`);
  console.log(`  - 예상 메시지: 459개 (76*6+3)`);
  console.log(`  - 수집률: ${(uniqueMessages.length / 459 * 100).toFixed(1)}%`);

  // 작성자 통계 (상위 10명)
  const authorStats = {};
  uniqueMessages.forEach(msg => {
    authorStats[msg.author] = (authorStats[msg.author] || 0) + 1;
  });

  console.log('\n👤 주요 작성자:');
  Object.entries(authorStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([author, count]) => {
      console.log(`  ${author}: ${count}개`);
    });

  return uniqueMessages;
}

hashBasedCrawl().catch(console.error);