import fs from 'fs';

function removeNavigationElements() {
  console.log('🔧 네비게이션 버튼 제거 시작...');

  const completeMessagesPath = '/Volumes/X31/code/crom-memorial/src/data/memorialMessages-complete.json';
  const messages = JSON.parse(fs.readFileSync(completeMessagesPath, 'utf-8'));

  console.log(`📄 총 ${messages.length}개 메시지 처리 중...`);

  // 네비게이션 관련 텍스트 패턴들
  const navigationPatterns = [
    '다음 10페이지로 이동',
    '이전 10페이지로 이동',
    '다음페이지',
    '이전페이지',
    '처음페이지',
    '마지막페이지'
  ];

  // 네비게이션 요소가 아닌 유효한 메시지만 필터링
  const validMessages = messages.filter(msg => {
    const content = msg.content.trim();

    // 네비게이션 패턴과 정확히 일치하는지 확인
    const isNavigation = navigationPatterns.some(pattern =>
      content === pattern || content.includes(pattern)
    );

    if (isNavigation) {
      console.log(`❌ 네비게이션 요소 제거: "${content}"`);
      return false;
    }

    // 너무 짧은 메시지도 제거 (5자 이하)
    if (content.length <= 5) {
      console.log(`❌ 너무 짧은 메시지 제거: "${content}"`);
      return false;
    }

    return true;
  });

  console.log(`\\n📊 필터링 결과:`);
  console.log(`  - 원본 메시지: ${messages.length}개`);
  console.log(`  - 제거된 메시지: ${messages.length - validMessages.length}개`);
  console.log(`  - 유효 메시지: ${validMessages.length}개`);

  // 페이지별 통계 다시 확인
  const pageStats = {};
  validMessages.forEach(msg => {
    pageStats[msg.page] = (pageStats[msg.page] || 0) + 1;
  });

  console.log(`\\n📈 정리된 페이지별 메시지 수:`);
  Object.entries(pageStats)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([page, count]) => {
      const expected = (page == 77) ? 3 : 6;
      const status = count === expected ? '✅' : (count > expected ? '⚠️' : '❌');
      console.log(`  페이지 ${page}: ${count}개 (예상: ${expected}개) ${status}`);
    });

  // 서태지 메시지 확인
  const seoTaijiMessages = validMessages.filter(msg =>
    msg.author === '서태지' ||
    msg.content.includes('서태지') ||
    msg.author.includes('서태지')
  );

  console.log(`\\n🎯 서태지 메시지 확인: ${seoTaijiMessages.length}개`);

  // 정리된 메시지 저장
  const finalPath = '/Volumes/X31/code/crom-memorial/src/data/memorialMessages-final.json';
  fs.writeFileSync(finalPath, JSON.stringify(validMessages, null, 2), 'utf-8');
  console.log(`\\n💾 최종 정리된 메시지를 ${finalPath}에 저장했습니다.`);

  // 추모 홈페이지용 메시지도 업데이트
  const memorialMessages = validMessages.map((msg, index) => ({
    id: msg.id || `legacy_${index}`,
    author: msg.author || '익명',
    content: msg.content,
    date: msg.date,
    isLegacy: true
  }));

  const memorialPath = '/Volumes/X31/code/crom-memorial/src/data/memorialMessages.json';
  fs.writeFileSync(memorialPath, JSON.stringify(memorialMessages, null, 2), 'utf-8');
  console.log(`💾 추모 홈페이지용 메시지도 업데이트했습니다.`);

  // 최종 검증
  const expectedTotal = 76 * 6 + 3; // 459개
  console.log(`\\n📊 최종 검증:`);
  console.log(`  - 예상 메시지 수: ${expectedTotal}개`);
  console.log(`  - 실제 메시지 수: ${validMessages.length}개`);
  console.log(`  - 수집률: ${(validMessages.length / expectedTotal * 100).toFixed(1)}%`);

  if (validMessages.length === expectedTotal) {
    console.log(`🎉 정확히 예상한 수만큼 수집되었습니다!`);
  } else if (validMessages.length > expectedTotal) {
    console.log(`⚠️ 예상보다 ${validMessages.length - expectedTotal}개 더 수집되었습니다.`);
  } else {
    console.log(`❌ 예상보다 ${expectedTotal - validMessages.length}개 부족합니다.`);
  }

  return validMessages;
}

removeNavigationElements();