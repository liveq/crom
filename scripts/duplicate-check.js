import fs from 'fs';

function checkDuplicates() {
  console.log('🔍 중복 메시지 검사 시작...');

  const completeMessagesPath = '/Volumes/X31/code/crom-memorial/src/data/memorialMessages-complete.json';
  const messages = JSON.parse(fs.readFileSync(completeMessagesPath, 'utf-8'));

  console.log(`📄 총 ${messages.length}개 메시지 검사 중...`);

  // 중복 검사용 맵
  const duplicateMap = new Map();
  const duplicates = [];
  const uniqueMessages = [];

  messages.forEach((msg, index) => {
    // 작성자 + 내용 앞 100자로 중복 키 생성
    const key = `${msg.author}-${msg.content.substring(0, 100)}`;

    if (duplicateMap.has(key)) {
      // 중복 발견
      const originalIndex = duplicateMap.get(key);
      duplicates.push({
        original: messages[originalIndex],
        duplicate: msg,
        originalIndex: originalIndex,
        duplicateIndex: index
      });
      console.log(`🔄 중복 발견: [${msg.author}] ${msg.content.substring(0, 50)}...`);
    } else {
      duplicateMap.set(key, index);
      uniqueMessages.push(msg);
    }
  });

  console.log(`\\n📊 중복 검사 결과:`);
  console.log(`  - 전체 메시지: ${messages.length}개`);
  console.log(`  - 중복 메시지: ${duplicates.length}개`);
  console.log(`  - 고유 메시지: ${uniqueMessages.length}개`);

  if (duplicates.length > 0) {
    console.log(`\\n🔍 발견된 중복 메시지들:`);
    duplicates.forEach((dup, idx) => {
      console.log(`  ${idx + 1}. 페이지 ${dup.original.page} vs 페이지 ${dup.duplicate.page}`);
      console.log(`     [${dup.original.author}] ${dup.original.content.substring(0, 80)}...\\n`);
    });
  }

  // 페이지별 메시지 수 통계
  const pageStats = {};
  uniqueMessages.forEach(msg => {
    pageStats[msg.page] = (pageStats[msg.page] || 0) + 1;
  });

  console.log(`\\n📈 페이지별 고유 메시지 수:`);
  Object.entries(pageStats)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([page, count]) => {
      const expected = (page == 1) ? 6 : (page == 77) ? 3 : 6;
      const status = count === expected ? '✅' : (count > expected ? '⚠️' : '❌');
      console.log(`  페이지 ${page}: ${count}개 (예상: ${expected}개) ${status}`);
    });

  // 중복 제거된 메시지 저장
  if (duplicates.length > 0) {
    const cleanedPath = '/Volumes/X31/code/crom-memorial/src/data/memorialMessages-cleaned.json';
    fs.writeFileSync(cleanedPath, JSON.stringify(uniqueMessages, null, 2), 'utf-8');
    console.log(`\\n💾 중복 제거된 메시지를 ${cleanedPath}에 저장했습니다.`);

    // 기존 메시지 파일도 업데이트
    const memorialPath = '/Volumes/X31/code/crom-memorial/src/data/memorialMessages.json';
    const memorialMessages = uniqueMessages.map((msg, index) => ({
      id: msg.id || `legacy_${index}`,
      author: msg.author || '익명',
      content: msg.content,
      date: msg.date,
      isLegacy: true
    }));

    fs.writeFileSync(memorialPath, JSON.stringify(memorialMessages, null, 2), 'utf-8');
    console.log(`💾 추모 홈페이지용 메시지도 업데이트했습니다.`);
  }

  // 최종 검증
  const expectedTotal = 76 * 6 + 3; // 459개
  console.log(`\\n📊 최종 검증:`);
  console.log(`  - 예상 메시지 수: ${expectedTotal}개`);
  console.log(`  - 실제 고유 메시지: ${uniqueMessages.length}개`);
  console.log(`  - 수집률: ${(uniqueMessages.length / expectedTotal * 100).toFixed(1)}%`);

  if (uniqueMessages.length === expectedTotal) {
    console.log(`🎉 정확히 예상한 수만큼 수집되었습니다!`);
  } else if (uniqueMessages.length > expectedTotal) {
    console.log(`⚠️ 예상보다 ${uniqueMessages.length - expectedTotal}개 더 수집되었습니다.`);
  } else {
    console.log(`❌ 예상보다 ${expectedTotal - uniqueMessages.length}개 부족합니다.`);
  }

  return uniqueMessages;
}

checkDuplicates();