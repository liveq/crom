import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function testCrawlPage77() {
  console.log('🔍 77페이지에서 서태지 메시지 테스트 크롤링 시작...');

  try {
    // 다양한 페이징 방식 시도
    const attempts = [
      {
        url: 'https://cromst.seongnam.go.kr:10005/community/memorial',
        params: { page: 77 }
      },
      {
        url: 'https://cromst.seongnam.go.kr:10005/community/memorial',
        params: { p: 77 }
      },
      {
        url: 'https://cromst.seongnam.go.kr:10005/community/memorial?page=77',
        params: {}
      },
      {
        url: 'https://cromst.seongnam.go.kr:10005/community/memorial/77',
        params: {}
      }
    ];

    for (const attempt of attempts) {
      console.log(`\n🔄 시도 중: ${attempt.url} ${JSON.stringify(attempt.params)}`);

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

    // 다양한 CSS 선택자로 메시지 찾기 시도
    const selectors = [
      '.memorial-message',
      '.message-content',
      '.comment-content',
      '.board-content',
      '.content',
      '.message',
      'tr td',
      '.list-item',
      'article',
      'p'
    ];

    let foundMessages = [];

    for (const selector of selectors) {
      const elements = $(selector);
      console.log(`🔍 "${selector}" 선택자로 ${elements.length}개 요소 발견`);

      elements.each((i, element) => {
        const text = $(element).text().trim();
        if (text && text.length > 10 && (text.includes('서태지') || text.includes('해철') || text.includes('마왕'))) {
          foundMessages.push({
            selector: selector,
            text: text,
            html: $(element).html()
          });
        }
      });
    }

    if (foundMessages.length > 0) {
      console.log(`🎉 서태지 관련 메시지 ${foundMessages.length}개 발견!`);
      foundMessages.forEach((msg, idx) => {
        console.log(`\n📝 메시지 ${idx + 1}:`);
        console.log(`선택자: ${msg.selector}`);
        console.log(`내용: ${msg.text.substring(0, 200)}...`);
      });

      // 테스트 결과 저장
      fs.writeFileSync(
        '/Volumes/X31/code/crom-memorial/test-crawl-result.json',
        JSON.stringify(foundMessages, null, 2),
        'utf-8'
      );
      console.log('\n💾 테스트 결과를 test-crawl-result.json에 저장했습니다.');
    } else {
      console.log('❌ 서태지 관련 메시지를 찾지 못했습니다.');

      // 페이지 전체 HTML 일부 저장 (디버깅용)
      fs.writeFileSync(
        '/Volumes/X31/code/crom-memorial/page77-debug.html',
        response.data,
        'utf-8'
      );
      console.log('🔧 디버깅을 위해 page77-debug.html에 전체 HTML을 저장했습니다.');
    }

  } catch (error) {
    console.error('❌ 크롤링 실패:', error.message);

    if (error.response) {
      console.error(`HTTP 상태: ${error.response.status}`);
      console.error(`응답 헤더:`, error.response.headers);
    }

    if (error.code === 'ENOTFOUND') {
      console.error('DNS 해상도 실패 - 도메인이 존재하지 않거나 접근할 수 없습니다.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('연결 거부됨 - 서버가 응답하지 않습니다.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('시간 초과 - 서버 응답이 느립니다.');
    }
  }
}

testCrawlPage77();