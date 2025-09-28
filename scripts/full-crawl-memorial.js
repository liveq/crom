import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function fullCrawlMemorial() {
  console.log('🚀 전체 추모 메시지 크롤링 시작 (459개 메시지 예상)...');

  const baseUrl = 'https://cromst.seongnam.go.kr:10005/community/memorial';
  const allMessages = [];
  const duplicateCheck = new Set();

  // 다양한 페이징 접근 방식 시도
  const paginationMethods = [
    // 1. 기본 page 파라미터 방식 (1-77페이지)
    { name: 'URL 파라미터', getUrl: (page) => `${baseUrl}?page=${page}` },
    { name: 'p 파라미터', getUrl: (page) => `${baseUrl}?p=${page}` },

    // 2. offset 방식 (6개씩)
    { name: 'offset 방식', getUrl: (page) => `${baseUrl}?offset=${(page-1)*6}&limit=6` },

    // 3. start 방식
    { name: 'start 방식', getUrl: (page) => `${baseUrl}?start=${(page-1)*6}` },
  ];

  for (const method of paginationMethods) {
    console.log(`\\n🔄 ${method.name} 방식으로 크롤링 시도...`);
    const foundMessages = [];
    let consecutiveEmptyPages = 0;
    const maxEmptyPages = 5; // 연속 5페이지가 비어있으면 중단

    for (let page = 1; page <= 77; page++) {
      try {
        const url = method.getUrl(page);
        console.log(`📄 페이지 ${page} 크롤링: ${url}`);

        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
            'Referer': baseUrl
          },
          timeout: 30000
        });

        const $ = cheerio.load(response.data);

        // 현재 페이지 정보 확인
        const currentPageInfo = $('.pagination .active, .paging .on').text().trim();
        console.log(`  현재 페이지: ${currentPageInfo || '미확인'}`);

        // 메시지 추출
        const pageMessages = [];
        $('.content li').each((i, element) => {
          const $el = $(element);
          const text = $el.text().trim();

          // 작성자와 날짜 정보 추출
          const authorElement = $el.find('.info i.fa-smile-o').parent().text().trim();
          const dateElement = $el.find('.info i.fa-clock-o').parent().text().trim();

          // 정규식으로 작성자와 날짜 분리
          const authorMatch = authorElement.match(/([^\\s]+)\\s*$/);
          const dateMatch = dateElement.match(/(\\d{4}-\\d{2}-\\d{2})\\s*$/);

          const author = authorMatch ? authorMatch[1] : '익명';
          const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

          // 메시지 내용에서 작성자/날짜 정보 제거
          let content = text.replace(/\\s*글 삭제하기\\s*$/, '');
          content = content.replace(/\\s+[^\\s]+\\s+\\d{4}-\\d{2}-\\d{2}\\s*$/, '');
          content = content.trim();

          if (content && content.length > 10) {
            const messageKey = `${author}-${content.substring(0, 50)}`;

            if (!duplicateCheck.has(messageKey)) {
              duplicateCheck.add(messageKey);

              const message = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
          console.log(`    ❌ 이 페이지에서 메시지를 찾을 수 없습니다. (연속 빈 페이지: ${consecutiveEmptyPages})`);

          if (consecutiveEmptyPages >= maxEmptyPages && page > 10) {
            console.log(`    🛑 연속 ${maxEmptyPages}페이지가 비어있어서 이 방식은 중단합니다.`);
            break;
          }
        } else {
          consecutiveEmptyPages = 0;
          console.log(`    ✅ ${pageMessages.length}개 메시지 발견`);
        }

        // 요청 간 간격
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`    ❌ 페이지 ${page} 크롤링 실패:`, error.message);

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          console.log('    🛑 네트워크 오류로 인해 이 방식은 중단합니다.');
          break;
        }

        // 일시적 오류는 계속 진행
        continue;
      }
    }

    console.log(`\\n📊 ${method.name} 방식 결과: ${foundMessages.length}개 메시지 수집`);

    if (foundMessages.length > 0) {
      allMessages.push(...foundMessages);

      // 이 방식이 성공했다면 다른 방식은 시도하지 않음
      if (foundMessages.length > 50) { // 충분히 많은 메시지를 찾았다면
        console.log(`✅ ${method.name} 방식이 성공적으로 작동합니다. 다른 방식은 건너뜁니다.`);
        break;
      }
    }
  }

  // 중복 제거 (한 번 더 확실하게)
  const uniqueMessages = [];
  const finalDuplicateCheck = new Set();

  for (const msg of allMessages) {
    const key = `${msg.author}-${msg.content.substring(0, 100)}`;
    if (!finalDuplicateCheck.has(key)) {
      finalDuplicateCheck.add(key);
      uniqueMessages.push(msg);
    }
  }

  console.log(`\\n🎉 총 ${uniqueMessages.length}개의 고유 메시지를 수집했습니다.`);

  // 작성자별 통계
  const authorStats = {};
  uniqueMessages.forEach(msg => {
    authorStats[msg.author] = (authorStats[msg.author] || 0) + 1;
  });

  console.log('\\n📊 작성자별 통계:');
  Object.entries(authorStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([author, count]) => {
      console.log(`  ${author}: ${count}개 메시지`);
    });

  // 서태지 관련 메시지 검색
  const seoTaijiMessages = uniqueMessages.filter(msg =>
    msg.content.includes('서태지') ||
    msg.author.includes('서태지') ||
    msg.content.includes('Seo Taiji') ||
    msg.content.includes('서태지와 아이들')
  );

  if (seoTaijiMessages.length > 0) {
    console.log(`\\n🎯 서태지 관련 메시지 ${seoTaijiMessages.length}개 발견:`);
    seoTaijiMessages.forEach((msg, idx) => {
      console.log(`  ${idx + 1}. [${msg.author}] ${msg.content.substring(0, 100)}...`);
    });
  } else {
    console.log('\\n❌ 서태지 관련 메시지를 찾지 못했습니다.');
  }

  // 결과 저장
  const outputPath = '/Volumes/X31/code/crom-memorial/src/data/memorialMessages-full.json';
  fs.writeFileSync(outputPath, JSON.stringify(uniqueMessages, null, 2), 'utf-8');
  console.log(`\\n💾 전체 메시지를 ${outputPath}에 저장했습니다.`);

  // 서태지 메시지만 별도 저장 (있는 경우)
  if (seoTaijiMessages.length > 0) {
    const seoTaijiPath = '/Volumes/X31/code/crom-memorial/seo-taiji-messages.json';
    fs.writeFileSync(seoTaijiPath, JSON.stringify(seoTaijiMessages, null, 2), 'utf-8');
    console.log(`💾 서태지 메시지를 ${seoTaijiPath}에 저장했습니다.`);
  }

  // 통계 정보
  console.log('\\n📈 최종 통계:');
  console.log(`  - 총 메시지 수: ${uniqueMessages.length}개`);
  console.log(`  - 예상 메시지 수: 459개`);
  console.log(`  - 수집률: ${(uniqueMessages.length / 459 * 100).toFixed(1)}%`);

  const dateRange = uniqueMessages.map(m => m.date).sort();
  if (dateRange.length > 0) {
    console.log(`  - 날짜 범위: ${dateRange[0]} ~ ${dateRange[dateRange.length - 1]}`);
  }

  return uniqueMessages;
}

fullCrawlMemorial().catch(console.error);