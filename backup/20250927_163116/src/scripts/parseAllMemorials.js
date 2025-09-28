import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const backupDir = '/Volumes/X31/code/crom-memorial/backup/cromst-seongnam';
const outputFile = '/Volumes/X31/code/crom-memorial/src/data/memorialMessages.json';

const memorialFiles = [
  'memorial_letters.html',
  ...Array.from({ length: 11 }, (_, i) => `memorial_page_${i + 1}.html`)
];

const allMessages = [];

memorialFiles.forEach(file => {
  const filePath = path.join(backupDir, file);

  if (!fs.existsSync(filePath)) {
    console.log(`파일 없음: ${file}`);
    return;
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const messageElements = document.querySelectorAll('.memori_list1 ul li');

  messageElements.forEach(li => {
    const content = li.childNodes[0]?.textContent?.trim();
    const infoSpan = li.querySelector('span.info');

    if (!content || !infoSpan) return;

    const infoText = infoSpan.textContent;
    const authorMatch = infoText.match(/😊\s*([^\s]+)/);
    const dateMatch = infoText.match(/🕐\s*(\d{4}-\d{2}-\d{2})/);

    const author = authorMatch ? authorMatch[1] : '익명';
    const date = dateMatch ? dateMatch[1] : '';

    allMessages.push({
      author,
      content,
      date,
      source: file
    });
  });

  console.log(`${file}: ${messageElements.length}개 메시지 파싱`);
});

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(allMessages, null, 2), 'utf-8');

console.log(`\n총 ${allMessages.length}개 추모 메시지 저장 완료: ${outputFile}`);