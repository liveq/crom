import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function testCrawlPage77() {
  console.log('🔍 77페이지에서 서태지 메시지 테스트 크롤링 시작...');

  // 다양한 페이징 방식 시도
  const attempts = [
    {
      name: '기본 page 파라미터',
      url: 'https://cromst.seongnam.go.kr:10005/community/memorial',
      params: { page: 77 }
    },
    {
      name: 'p 파라미터',
      url: 'https://cromst.seongnam.go.kr:10005/community/memorial',
      params: { p: 77 }
    },
    {
      name: 'URL에 직접 포함',
      url: 'https://cromst.seongnam.go.kr:10005/community/memorial?page=77',
      params: {}
    },
    {
      name: 'offset 방식 (76*6=456부터)',
      url: 'https://cromst.seongnam.go.kr:10005/community/memorial',
      params: { offset: 456, limit: 6 }
    },
    {
      name: 'start 방식',
      url: 'https://cromst.seongnam.go.kr:10005/community/memorial',
      params: { start: 456 }
    }
  ];

  for (const attempt of attempts) {
    try {
      console.log(`\n🔄 ${attempt.name} 시도 중: ${attempt.url}`);
      console.log(`   파라미터: ${JSON.stringify(attempt.params)}`);

      const response = await axios.get(attempt.url, {
        params: attempt.params,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000
      });

      console.log(`✅ HTTP 응답 코드: ${response.status}`);
      console.log(`📄 HTML 길이: ${response.data.length} bytes`);

      const $ = cheerio.load(response.data);

      // 페이지 번호나 페이징 정보 확인
      const pageInfo = $('.page-info, .current-page, .pagination .active, .paging .on').text().trim();
      console.log(`📄 페이지 정보: ${pageInfo || '없음'}`);

      // 페이징 관련 모든 요소 확인
      const paginationElements = $('.pagination, .paging, .page').html();
      if (paginationElements) {
        console.log(`🔢 페이징 요소 발견`);
      }

      // 다양한 CSS 선택자로 메시지 찾기 시도
      const selectors = [
        '.content li',
        '.memorial-message',
        '.message-content',
        '.comment-content',
        '.board-content',
        '.content',
        '.message',
        'tr td',
        '.list-item',
        'article',
        'li',
        '.board-list li',
        '.comment-list li'
      ];

      let foundMessages = [];
      let allMessages = [];

      for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`🔍 "${selector}" 선택자로 ${elements.length}개 요소 발견`);

          elements.each((i, element) => {
            const text = $(element).text().trim();
            if (text && text.length > 10) {
              allMessages.push({
                selector: selector,
                text: text.substring(0, 200),
                index: i
              });

              // 서태지 관련 키워드로 검색 (다양한 변형 포함)
              if (text.includes('서태지') || text.includes('해철') || text.includes('마왕') ||
                  text.includes('Seo Taiji') || text.includes('서태지와 아이들')) {
                foundMessages.push({
                  selector: selector,
                  text: text,
                  html: $(element).html(),
                  attemptName: attempt.name
                });
              }
            }
          });
        }
      }

      console.log(`📊 이 페이지에서 전체 메시지 ${allMessages.length}개 발견`);

      if (foundMessages.length > 0) {
        console.log(`🎉 서태지 관련 메시지 ${foundMessages.length}개 발견!`);
        foundMessages.forEach((msg, idx) => {
          console.log(`\n📝 메시지 ${idx + 1} (${msg.attemptName}):`);
          console.log(`선택자: ${msg.selector}`);
          console.log(`내용: ${msg.text.substring(0, 300)}...`);
        });

        // 테스트 결과 저장
        fs.writeFileSync(
          '/Volumes/X31/code/crom-memorial/page77-seo-taiji-found.json',
          JSON.stringify(foundMessages, null, 2),
          'utf-8'
        );
        console.log('\n💾 서태지 메시지를 page77-seo-taiji-found.json에 저장했습니다.');
        return foundMessages; // 성공시 즉시 종료
      } else {
        console.log(`❌ 이 방법으로는 서태지 메시지를 찾지 못했습니다.`);

        if (allMessages.length > 0) {
          console.log(`📋 발견된 메시지 샘플 (처음 3개):`);
          allMessages.slice(0, 3).forEach((msg, idx) => {
            console.log(`  ${idx + 1}. [${msg.selector}] ${msg.text}...`);
          });
        }

        // 디버깅을 위해 HTML 저장
        const debugFileName = `/Volumes/X31/code/crom-memorial/debug-${attempt.name.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
        fs.writeFileSync(debugFileName, response.data, 'utf-8');
        console.log(`🔧 디버깅용 HTML 저장: ${debugFileName}`);
      }

      // 다음 시도를 위해 잠깐 대기
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ ${attempt.name} 실패:`, error.message);

      if (error.response) {
        console.error(`HTTP 상태: ${error.response.status}`);
      }

      if (error.code === 'ENOTFOUND') {
        console.error('DNS 해상도 실패');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('연결 거부됨');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('시간 초과');
      }

      // 다음 시도 계속
      continue;
    }
  }

  console.log('\n❌ 모든 시도가 실패했습니다. 서태지 메시지를 77페이지에서 찾을 수 없습니다.');
  console.log('💡 사이트 구조가 다르거나 페이징 방식이 다를 수 있습니다.');
}

testCrawlPage77();