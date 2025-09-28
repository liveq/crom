/**
 * 성남시 추모 사이트 HTML 파일에서 추모 메시지 파싱
 */

import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const backupDir = '/Volumes/X31/code/crom-memorial/backup/cromst-seongnam';
const outputFile = path.join(backupDir, 'parsed_messages.json');

// HTML 파일에서 메시지 추출
function parseMemorialMessages(htmlContent) {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;

  const messages = [];

  // 성남시 사이트의 실제 구조: memori_list1 안의 li 요소들
  const messageElements = document.querySelectorAll('.memori_list1 ul li, .memori_list ul li');

  messageElements.forEach(element => {
    // li의 첫 번째 텍스트 노드가 메시지 내용
    const contentNode = element.firstChild;
    let content = '';

    // 텍스트 노드들만 추출 (span.info 전까지)
    for (let node of element.childNodes) {
      if (node.nodeType === 3) { // TEXT_NODE
        content += node.textContent.trim() + ' ';
      } else if (node.nodeName === 'SPAN' && node.classList?.contains('info')) {
        break;
      }
    }

    content = content.trim();

    // 작성자와 날짜 정보는 span.info 안에 있음
    const infoElement = element.querySelector('.info');
    let writer = '익명';
    let date = new Date().toISOString();

    if (infoElement) {
      const infoText = infoElement.textContent;

      // 작성자 추출 (스마일 아이콘 뒤)
      const writerMatch = infoText.match(/😊\s*([^\s]+)|fa-smile.*?([^\s]+)/);
      if (writerMatch) {
        writer = writerMatch[1] || writerMatch[2] || '익명';
      } else {
        // 아이콘 없이 바로 이름이 오는 경우
        const parts = infoText.trim().split(/\s+/);
        if (parts.length > 0) {
          writer = parts[0];
        }
      }

      // 날짜 추출 (시계 아이콘 뒤 또는 숫자-숫자-숫자 패턴)
      const dateMatch = infoText.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        date = dateMatch[1];
      }
    }

    if (content && content.length > 5) {
      messages.push({
        writer: writer.trim(),
        content: content,
        date: date,
        source: 'seongnam_backup',
        originalSite: 'cromst.seongnam.go.kr'
      });
    }
  });

  return messages;
}

// 모든 HTML 파일 처리
async function parseAllHtmlFiles() {
  const allMessages = [];

  // memorial_letters.html 파싱
  try {
    const lettersHtml = fs.readFileSync(path.join(backupDir, 'memorial_letters.html'), 'utf-8');
    const letterMessages = parseMemorialMessages(lettersHtml);
    allMessages.push(...letterMessages);
    console.log(`memorial_letters.html에서 ${letterMessages.length}개 메시지 추출`);
  } catch (err) {
    console.log('memorial_letters.html 파싱 중 오류:', err.message);
  }

  // memorial_letters_page 파일들 파싱
  for (let i = 1; i <= 20; i++) {
    const fileName = `memorial_letters_page_${i}.html`;
    const filePath = path.join(backupDir, fileName);

    if (fs.existsSync(filePath)) {
      try {
        const html = fs.readFileSync(filePath, 'utf-8');
        const messages = parseMemorialMessages(html);
        allMessages.push(...messages);
        console.log(`${fileName}에서 ${messages.length}개 메시지 추출`);
      } catch (err) {
        console.log(`${fileName} 파싱 중 오류:`, err.message);
      }
    }
  }

  // 중복 제거
  const uniqueMessages = [];
  const seenContents = new Set();

  for (const msg of allMessages) {
    const key = msg.content.substring(0, 50); // 처음 50자로 중복 체크
    if (!seenContents.has(key)) {
      seenContents.add(key);
      uniqueMessages.push(msg);
    }
  }

  // JSON 파일로 저장
  fs.writeFileSync(outputFile, JSON.stringify(uniqueMessages, null, 2), 'utf-8');

  console.log('\n=== 파싱 완료 ===');
  console.log(`총 ${uniqueMessages.length}개의 고유한 메시지 추출됨`);
  console.log(`저장 위치: ${outputFile}`);

  // 샘플 출력
  console.log('\n=== 샘플 메시지 (처음 3개) ===');
  uniqueMessages.slice(0, 3).forEach((msg, idx) => {
    console.log(`\n[${idx + 1}] ${msg.writer}`);
    console.log(`내용: ${msg.content.substring(0, 100)}...`);
    console.log(`날짜: ${msg.date}`);
  });

  return uniqueMessages;
}

// 실행
parseAllHtmlFiles().catch(console.error);