import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fetchMemorialMessages() {
  console.log('크롬 추모 사이트에서 메시지 가져오는 중...');

  const messages = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await axios.get(`https://cromst.seongnam.go.kr/api/v1/articles/1038/comments`, {
        params: {
          page: page,
          per_page: 20
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      if (response.data && response.data.data) {
        const pageMessages = response.data.data.map(item => ({
          author: item.author || '익명',
          content: item.content || item.message || item.text || '',
          createdAt: item.created_at || item.createdAt || new Date().toISOString()
        }));

        messages.push(...pageMessages);
        console.log(`페이지 ${page}: ${pageMessages.length}개 메시지 수집`);

        if (pageMessages.length < 20) {
          hasMore = false;
        } else {
          page++;
        }

        // 너무 빠른 요청 방지
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.log(`페이지 ${page} 요청 실패:`, error.message);
      hasMore = false;
    }

    // 최대 30페이지까지만 (600개 메시지)
    if (page > 30) {
      hasMore = false;
    }
  }

  console.log(`총 ${messages.length}개 메시지 수집 완료`);

  // JSON 파일로 저장
  const outputPath = path.join(__dirname, '../src/data/memorialMessages.json');
  fs.writeFileSync(outputPath, JSON.stringify(messages, null, 2), 'utf-8');
  console.log(`메시지를 ${outputPath}에 저장했습니다`);
}

// HTML 페이지에서 직접 파싱하는 대체 방법
async function fetchFromHTML() {
  console.log('HTML 페이지에서 직접 메시지 추출 중...');

  try {
    const response = await axios.get('https://cromst.seongnam.go.kr/articles/1038', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    const html = response.data;

    // 다양한 패턴으로 메시지 추출 시도
    const patterns = [
      /"author":"([^"]+)","content":"([^"]+)"/g,
      /"name":"([^"]+)","message":"([^"]+)"/g,
      /<div[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/div>[\s\S]*?<div[^>]*class="[^"]*content[^"]*"[^>]*>([^<]+)<\/div>/g,
      /<span[^>]*class="[^"]*writer[^"]*"[^>]*>([^<]+)<\/span>[\s\S]*?<p[^>]*class="[^"]*text[^"]*"[^>]*>([^<]+)<\/p>/g
    ];

    const messages = [];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        messages.push({
          author: match[1].trim(),
          content: match[2].trim()
        });
      }
    }

    // 중복 제거
    const uniqueMessages = Array.from(new Map(
      messages.map(msg => [`${msg.author}-${msg.content}`, msg])
    ).values());

    console.log(`HTML에서 ${uniqueMessages.length}개 메시지 추출`);

    if (uniqueMessages.length > 0) {
      const outputPath = path.join(__dirname, '../src/data/memorialMessages.json');
      fs.writeFileSync(outputPath, JSON.stringify(uniqueMessages, null, 2), 'utf-8');
      console.log(`메시지를 ${outputPath}에 저장했습니다`);
    }

    return uniqueMessages;
  } catch (error) {
    console.error('HTML 파싱 실패:', error.message);
  }
}

// 실행
async function main() {
  // 먼저 API로 시도
  await fetchMemorialMessages();

  // API가 실패하면 HTML 파싱으로 시도
  const messagesPath = path.join(__dirname, '../src/data/memorialMessages.json');
  const currentMessages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));

  if (currentMessages.length < 100) {
    console.log('메시지가 부족합니다. HTML 파싱을 시도합니다...');
    await fetchFromHTML();
  }
}

main().catch(console.error);