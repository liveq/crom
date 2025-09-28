import fs from 'fs';

function fixAuthorParsing() {
  console.log('🔧 작성자 정보 파싱 수정 시작...');

  // 전체 메시지 파일 읽기
  const completeMessagesPath = '/Volumes/X31/code/crom-memorial/src/data/memorialMessages-complete.json';
  const messages = JSON.parse(fs.readFileSync(completeMessagesPath, 'utf-8'));

  console.log(`📄 총 ${messages.length}개 메시지 처리 중...`);

  const fixedMessages = messages.map(msg => {
    const content = msg.content;

    // 작성자와 날짜가 메시지 내용에 포함되어 있는 경우 처리
    if (content.includes('서태지') && content.includes('2018-02-09')) {
      // 서태지 메시지 특별 처리
      const cleanContent = content
        .replace(/\s*글 삭제하기\s*$/g, '')
        .replace(/\s+서태지\s+2018-02-09\s*$/, '')
        .trim();

      return {
        ...msg,
        author: '서태지',
        content: cleanContent,
        date: '2018-02-09'
      };
    }

    // 일반 메시지에서 작성자/날짜 추출 개선
    const authorDatePattern = /\s+([^\s]+)\s+(\d{4}-\d{2}-\d{2})\s*$/;
    const match = content.match(authorDatePattern);

    if (match) {
      const author = match[1];
      const date = match[2];
      const cleanContent = content.replace(authorDatePattern, '').replace(/\s*글 삭제하기\s*$/g, '').trim();

      return {
        ...msg,
        author: author,
        content: cleanContent,
        date: date
      };
    }

    return msg;
  });

  // 서태지 메시지만 추출
  const seoTaijiMessages = fixedMessages.filter(msg =>
    msg.author === '서태지' ||
    msg.content.includes('서태지') ||
    msg.author.includes('서태지')
  );

  console.log(`🎯 서태지 관련 메시지 ${seoTaijiMessages.length}개 발견:`);
  seoTaijiMessages.forEach((msg, idx) => {
    console.log(`  ${idx + 1}. 페이지 ${msg.page} [${msg.author}] (${msg.date})`);
    console.log(`     내용: ${msg.content.substring(0, 200)}...\\n`);
  });

  // 수정된 전체 메시지 저장
  fs.writeFileSync(completeMessagesPath, JSON.stringify(fixedMessages, null, 2), 'utf-8');
  console.log(`💾 수정된 전체 메시지를 ${completeMessagesPath}에 저장했습니다.`);

  // 수정된 서태지 메시지 저장
  if (seoTaijiMessages.length > 0) {
    const seoTaijiPath = '/Volumes/X31/code/crom-memorial/seo-taiji-messages-corrected.json';
    fs.writeFileSync(seoTaijiPath, JSON.stringify(seoTaijiMessages, null, 2), 'utf-8');
    console.log(`💾 수정된 서태지 메시지를 ${seoTaijiPath}에 저장했습니다.`);
  }

  // 추모 홈페이지에서 사용할 형태로 변환
  const memorialMessages = fixedMessages.map((msg, index) => ({
    id: msg.id || `legacy_${index}`,
    author: msg.author || '익명',
    content: msg.content,
    date: msg.date,
    isLegacy: true
  }));

  // 기존 추모 메시지 파일 업데이트
  const memorialPath = '/Volumes/X31/code/crom-memorial/src/data/memorialMessages.json';
  fs.writeFileSync(memorialPath, JSON.stringify(memorialMessages, null, 2), 'utf-8');
  console.log(`💾 추모 홈페이지용 메시지를 ${memorialPath}에 저장했습니다.`);

  console.log('\\n📊 최종 정리 완료:');
  console.log(`  - 전체 메시지: ${fixedMessages.length}개`);
  console.log(`  - 서태지 메시지: ${seoTaijiMessages.length}개`);

  // 작성자 통계 (상위 20명)
  const authorStats = {};
  fixedMessages.forEach(msg => {
    const author = msg.author || '익명';
    authorStats[author] = (authorStats[author] || 0) + 1;
  });

  console.log('\\n👤 주요 작성자 (상위 20명):');
  Object.entries(authorStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .forEach(([author, count]) => {
      console.log(`  ${author}: ${count}개`);
    });

  return fixedMessages;
}

fixAuthorParsing().catch(console.error);