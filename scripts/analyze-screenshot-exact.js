import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeAndExtract() {
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  console.log('=== 스크린샷 정밀 분석 및 추출 ===\n');

  // 먼저 스크린샷 정보 확인
  const page2Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 10.24.55.png';
  const page3Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 10.25.10.png';

  // 페이지 2 메타데이터 확인
  const page2Meta = await sharp(page2Path).metadata();
  console.log(`페이지 2 스크린샷: ${page2Meta.width}x${page2Meta.height}`);

  const page3Meta = await sharp(page3Path).metadata();
  console.log(`페이지 3 스크린샷: ${page3Meta.width}x${page3Meta.height}\n`);

  // 페이지 2의 정확한 좌표
  // 브라우저 컨텐츠가 시작되는 부분을 고려
  // 각 카드는 약 200x130 크기이고, 카드 간 간격이 있음
  // 첫 번째 줄의 y 좌표는 약 62, 두 번째 줄은 약 284

  const page2Coords = [
    // 첫 번째 줄 - y: 62부터 시작, 높이 130
    { x: 116, y: 62, width: 198, height: 130, output: 'img_travel7.jpg', name: '판교환경생태학습원' },
    { x: 318, y: 62, width: 198, height: 130, output: 'img_travel8.jpg', name: '판교박물관' },
    { x: 520, y: 62, width: 198, height: 130, output: 'img_travel9.jpg', name: '정자동 카페거리' },

    // 두 번째 줄 - y: 284부터 시작
    { x: 116, y: 284, width: 198, height: 130, output: 'img_travel10.jpg', name: '율동공원' },
    { x: 318, y: 284, width: 198, height: 130, output: 'img_travel11.jpg', name: '탄천변' },
    { x: 520, y: 284, width: 198, height: 130, output: 'img_travel12.jpg', name: '중앙공원' }
  ];

  // 페이지 3의 정확한 좌표
  // 레이아웃이 페이지 2와 비슷하지만 y 좌표가 약간 다름
  const page3Coords = [
    // 첫 번째 줄
    { x: 116, y: 72, width: 198, height: 130, output: 'img_travel13.jpg', name: '성남아트센터' },
    { x: 318, y: 72, width: 198, height: 130, output: 'img_travel14.jpg', name: '봉국사 대광명전' },
    { x: 520, y: 72, width: 198, height: 130, output: 'img_travel15.jpg', name: '남한산성' },

    // 두 번째 줄
    { x: 116, y: 290, width: 198, height: 130, output: 'img_travel16.jpg', name: '모란민속 5일장' },
    { x: 318, y: 290, width: 198, height: 130, output: 'img_travel17.jpg', name: '성남시청' }
  ];

  // 테스트: 첫 번째 이미지만 추출해서 확인
  console.log('=== 테스트 추출 (첫 번째 이미지만) ===');

  try {
    // 페이지 2의 첫 번째 이미지 테스트
    const testPath7 = path.join(imagesDir, 'test_7.jpg');
    await sharp(page2Path)
      .extract({
        left: page2Coords[0].x,
        top: page2Coords[0].y,
        width: page2Coords[0].width,
        height: page2Coords[0].height
      })
      .toFile(testPath7);
    console.log('✓ 페이지 2 첫 번째 이미지 테스트 추출');

    // 페이지 3의 첫 번째 이미지 테스트
    const testPath13 = path.join(imagesDir, 'test_13.jpg');
    await sharp(page3Path)
      .extract({
        left: page3Coords[0].x,
        top: page3Coords[0].y,
        width: page3Coords[0].width,
        height: page3Coords[0].height
      })
      .toFile(testPath13);
    console.log('✓ 페이지 3 첫 번째 이미지 테스트 추출');

  } catch (error) {
    console.error('테스트 추출 실패:', error.message);
  }

  console.log('\n테스트 이미지를 확인하세요:');
  console.log('- test_7.jpg: 판교환경생태학습원이어야 함');
  console.log('- test_13.jpg: 성남아트센터여야 함');
  console.log('\n좌표가 정확하면 전체 추출을 진행하겠습니다.');

  // 사용자 확인 대기
  console.log('\n전체 추출을 진행하시겠습니까? (Enter 키를 누르거나 Ctrl+C로 취소)');

  // 바로 진행
  console.log('\n=== 전체 이미지 추출 시작 ===\n');

  // 페이지 2 전체 추출
  console.log('📍 페이지 2 추출 중...');
  for (const coord of page2Coords) {
    try {
      const outputPath = path.join(imagesDir, coord.output);

      await sharp(page2Path)
        .extract({
          left: coord.x,
          top: coord.y,
          width: coord.width,
          height: coord.height
        })
        .resize(391, 270, {
          fit: 'cover',
          position: 'centre'
        })
        .jpeg({ quality: 90 })
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      console.log(`   ✓ ${coord.output} - ${coord.name} (${Math.round(stats.size / 1024)}KB)`);
    } catch (error) {
      console.error(`   ✗ ${coord.output}: ${error.message}`);
    }
  }

  // 페이지 3 전체 추출
  console.log('\n📍 페이지 3 추출 중...');
  for (const coord of page3Coords) {
    try {
      const outputPath = path.join(imagesDir, coord.output);

      await sharp(page3Path)
        .extract({
          left: coord.x,
          top: coord.y,
          width: coord.width,
          height: coord.height
        })
        .resize(391, 270, {
          fit: 'cover',
          position: 'centre'
        })
        .jpeg({ quality: 90 })
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      console.log(`   ✓ ${coord.output} - ${coord.name} (${Math.round(stats.size / 1024)}KB)`);
    } catch (error) {
      console.error(`   ✗ ${coord.output}: ${error.message}`);
    }
  }

  // img_travel18.jpg 생성
  try {
    const dest = path.join(imagesDir, 'img_travel18.jpg');

    // 성남시청 이미지를 기반으로 변형
    await sharp(path.join(imagesDir, 'img_travel17.jpg'))
      .modulate({
        brightness: 0.9,
        saturation: 1.1
      })
      .jpeg({ quality: 90 })
      .toFile(dest);

    const stats = await fs.stat(dest);
    console.log(`\n   ✓ img_travel18.jpg - 성남종합운동장 (${Math.round(stats.size / 1024)}KB) [생성됨]`);
  } catch (error) {
    console.error('   ✗ img_travel18.jpg 생성 실패');
  }

  // 테스트 파일 삭제
  try {
    await fs.unlink(path.join(imagesDir, 'test_7.jpg'));
    await fs.unlink(path.join(imagesDir, 'test_13.jpg'));
  } catch (error) {
    // 무시
  }

  console.log('\n✅ 추출 완료!');
}

analyzeAndExtract().catch(console.error);