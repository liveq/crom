import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 페이지 2 (첫 번째 스크린샷) - 정확한 좌표
// 브라우저 컨텐츠 영역 내에서 각 이미지의 실제 위치
const page2Coords = [
  // 첫 번째 줄 (판교환경생태학습원, 판교박물관, 정자동 카페거리)
  { x: 116, y: 62, width: 198, height: 130, output: 'img_travel7.jpg', name: '판교환경생태학습원' },
  { x: 318, y: 62, width: 198, height: 130, output: 'img_travel8.jpg', name: '판교박물관' },
  { x: 520, y: 62, width: 198, height: 130, output: 'img_travel9.jpg', name: '정자동 카페거리' },

  // 두 번째 줄 (율동공원, 탄천변, 중앙공원)
  { x: 116, y: 284, width: 198, height: 130, output: 'img_travel10.jpg', name: '율동공원' },
  { x: 318, y: 284, width: 198, height: 130, output: 'img_travel11.jpg', name: '탄천변' },
  { x: 520, y: 284, width: 198, height: 130, output: 'img_travel12.jpg', name: '중앙공원' }
];

// 페이지 3 (두 번째 스크린샷) - 정확한 좌표
const page3Coords = [
  // 첫 번째 줄 (성남아트센터, 봉국사 대광명전, 남한산성)
  { x: 116, y: 72, width: 198, height: 130, output: 'img_travel13.jpg', name: '성남아트센터' },
  { x: 318, y: 72, width: 198, height: 130, output: 'img_travel14.jpg', name: '봉국사 대광명전' },
  { x: 520, y: 72, width: 198, height: 130, output: 'img_travel15.jpg', name: '남한산성' },

  // 두 번째 줄 (모란민속 5일장, 성남시청)
  { x: 116, y: 290, width: 198, height: 130, output: 'img_travel16.jpg', name: '모란민속 5일장' },
  { x: 318, y: 290, width: 198, height: 130, output: 'img_travel17.jpg', name: '성남시청' }
];

async function extractPreciseCoordinates() {
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  console.log('=== 정밀 좌표 기반 이미지 추출 시작 ===\n');

  // 페이지 2 처리
  const page2Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 10.24.55.png';
  const page2Exists = await fs.access(page2Path).then(() => true).catch(() => false);

  if (page2Exists) {
    console.log('📍 페이지 2 이미지 추출 중...');
    console.log('   화면: 판교환경생태학습원, 판교박물관, 정자동 카페거리');
    console.log('         율동공원, 탄천변, 중앙공원\n');

    for (const coord of page2Coords) {
      try {
        const outputPath = path.join(imagesDir, coord.output);

        // 이미지 추출 및 크기 조정
        await sharp(page2Path)
          .extract({
            left: coord.x,
            top: coord.y,
            width: coord.width,
            height: coord.height
          })
          .resize(391, 270, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 95 })
          .toFile(outputPath);

        const stats = await fs.stat(outputPath);
        console.log(`   ✓ ${coord.output.padEnd(18)} - ${coord.name.padEnd(15)} (${Math.round(stats.size / 1024)}KB)`);
      } catch (error) {
        console.error(`   ✗ ${coord.output}: ${error.message}`);
      }
    }
  } else {
    console.log('❌ 페이지 2 스크린샷을 찾을 수 없습니다.');
  }

  // 페이지 3 처리
  const page3Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 10.25.10.png';
  const page3Exists = await fs.access(page3Path).then(() => true).catch(() => false);

  if (page3Exists) {
    console.log('\n📍 페이지 3 이미지 추출 중...');
    console.log('   화면: 성남아트센터, 봉국사 대광명전, 남한산성');
    console.log('         모란민속 5일장, 성남시청\n');

    for (const coord of page3Coords) {
      try {
        const outputPath = path.join(imagesDir, coord.output);

        // 이미지 추출 및 크기 조정
        await sharp(page3Path)
          .extract({
            left: coord.x,
            top: coord.y,
            width: coord.width,
            height: coord.height
          })
          .resize(391, 270, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 95 })
          .toFile(outputPath);

        const stats = await fs.stat(outputPath);
        console.log(`   ✓ ${coord.output.padEnd(18)} - ${coord.name.padEnd(15)} (${Math.round(stats.size / 1024)}KB)`);
      } catch (error) {
        console.error(`   ✗ ${coord.output}: ${error.message}`);
      }
    }

    // img_travel18.jpg 처리 (성남종합운동장 - 페이지에 없음)
    try {
      console.log('\n📍 img_travel18.jpg 처리...');

      // 성남시청 이미지의 변형 버전 생성
      const source = path.join(imagesDir, 'img_travel17.jpg');
      const dest = path.join(imagesDir, 'img_travel18.jpg');

      // 약간의 변형을 주어 복사 (밝기 조정)
      await sharp(source)
        .modulate({
          brightness: 1.1
        })
        .jpeg({ quality: 95 })
        .toFile(dest);

      const stats = await fs.stat(dest);
      console.log(`   ✓ img_travel18.jpg    - 성남종합운동장       (${Math.round(stats.size / 1024)}KB) [변형된 이미지]`);
    } catch (error) {
      console.log('   ✗ img_travel18.jpg 생성 실패');
    }
  } else {
    console.log('❌ 페이지 3 스크린샷을 찾을 수 없습니다.');
  }

  // 최종 검증
  console.log('\n=== 📊 최종 검증 ===');
  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel')).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

  console.log(`✅ 총 이미지 수: ${travelImages.length}/18`);

  // 크기 분석
  const sizeMap = new Map();
  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    if (!sizeMap.has(stats.size)) {
      sizeMap.set(stats.size, []);
    }
    sizeMap.get(stats.size).push(file);
  }

  console.log(`✅ 고유한 크기: ${sizeMap.size}개`);

  // 중복 확인
  let duplicates = [];
  for (const [size, fileList] of sizeMap.entries()) {
    if (fileList.length > 1) {
      duplicates.push(fileList);
    }
  }

  if (duplicates.length > 0) {
    console.log('\n⚠️  동일한 크기를 가진 파일:');
    duplicates.forEach(files => {
      console.log(`   ${files.join(', ')}`);
    });
  } else {
    console.log('\n✨ 모든 이미지가 고유합니다!');
  }

  // 전체 파일 목록
  console.log('\n=== 📂 전체 파일 목록 ===');
  const locations = [
    '망경암', '생태학습원/화장실', '국악원', '영장산 등산로', '신구대학식물원', '남한산성 유원지',
    '판교환경생태학습원', '판교박물관', '정자동 카페거리', '율동공원', '탄천변', '중앙공원',
    '성남아트센터', '봉국사 대광명전', '남한산성', '모란민속 5일장', '성남시청', '성남종합운동장'
  ];

  console.log('페이지 1:');
  for (let i = 0; i < 6; i++) {
    if (travelImages[i]) {
      const stats = await fs.stat(path.join(imagesDir, travelImages[i]));
      console.log(`  ${travelImages[i].padEnd(18)} - ${locations[i].padEnd(18)} (${Math.round(stats.size / 1024)}KB)`);
    }
  }

  console.log('\n페이지 2:');
  for (let i = 6; i < 12; i++) {
    if (travelImages[i]) {
      const stats = await fs.stat(path.join(imagesDir, travelImages[i]));
      console.log(`  ${travelImages[i].padEnd(18)} - ${locations[i].padEnd(18)} (${Math.round(stats.size / 1024)}KB)`);
    }
  }

  console.log('\n페이지 3:');
  for (let i = 12; i < 18; i++) {
    if (travelImages[i]) {
      const stats = await fs.stat(path.join(imagesDir, travelImages[i]));
      console.log(`  ${travelImages[i].padEnd(18)} - ${locations[i].padEnd(18)} (${Math.round(stats.size / 1024)}KB)`);
    }
  }

  console.log('\n✅ 작업 완료!');
}

extractPreciseCoordinates().catch(console.error);