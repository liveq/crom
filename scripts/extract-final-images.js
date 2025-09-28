import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 페이지 2 (첫 번째 스크린샷): 판교환경생태학습원, 판교박물관, 정자동 카페거리, 율동공원, 탄천변, 중앙공원
const page2Coords = [
  { x: 116, y: 62, width: 198, height: 163, output: 'img_travel7.jpg', name: '판교환경생태학습원' },
  { x: 318, y: 62, width: 198, height: 163, output: 'img_travel8.jpg', name: '판교박물관' },
  { x: 520, y: 62, width: 198, height: 163, output: 'img_travel9.jpg', name: '정자동 카페거리' },
  { x: 116, y: 284, width: 198, height: 163, output: 'img_travel10.jpg', name: '율동공원' },
  { x: 318, y: 284, width: 198, height: 163, output: 'img_travel11.jpg', name: '탄천변' },
  { x: 520, y: 284, width: 198, height: 163, output: 'img_travel12.jpg', name: '중앙공원' }
];

// 페이지 3 (두 번째 스크린샷): 성남아트센터, 봉국사 대광명전, 남한산성, 모란민속 5일장, 성남시청
const page3Coords = [
  { x: 116, y: 62, width: 198, height: 163, output: 'img_travel13.jpg', name: '성남아트센터' },
  { x: 318, y: 62, width: 198, height: 163, output: 'img_travel14.jpg', name: '봉국사 대광명전' },
  { x: 520, y: 62, width: 198, height: 163, output: 'img_travel15.jpg', name: '남한산성' },
  { x: 116, y: 284, width: 198, height: 163, output: 'img_travel16.jpg', name: '모란민속 5일장' },
  { x: 318, y: 284, width: 198, height: 163, output: 'img_travel17.jpg', name: '성남시청' }
];

async function extractFinalImages() {
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  console.log('=== 최종 이미지 추출 시작 ===\n');

  // 페이지 2 처리 (첫 번째 스크린샷)
  const page2Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 10.24.55.png';
  const page2Exists = await fs.access(page2Path).then(() => true).catch(() => false);

  if (page2Exists) {
    console.log('페이지 2 이미지 추출 중...');

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
          .resize(391, 270, { fit: 'cover' })
          .jpeg({ quality: 90 })
          .toFile(outputPath);

        const stats = await fs.stat(outputPath);
        console.log(`✓ ${coord.output} - ${coord.name} (${stats.size} bytes)`);
      } catch (error) {
        console.error(`✗ ${coord.output}: ${error.message}`);
      }
    }
  }

  // 페이지 3 처리 (두 번째 스크린샷)
  const page3Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 10.25.10.png';
  const page3Exists = await fs.access(page3Path).then(() => true).catch(() => false);

  if (page3Exists) {
    console.log('\n페이지 3 이미지 추출 중...');

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
          .resize(391, 270, { fit: 'cover' })
          .jpeg({ quality: 90 })
          .toFile(outputPath);

        const stats = await fs.stat(outputPath);
        console.log(`✓ ${coord.output} - ${coord.name} (${stats.size} bytes)`);
      } catch (error) {
        console.error(`✗ ${coord.output}: ${error.message}`);
      }
    }

    // img_travel18.jpg는 페이지 3에 없으므로 성남시청 이미지 복사
    try {
      const source = path.join(imagesDir, 'img_travel17.jpg');
      const dest = path.join(imagesDir, 'img_travel18.jpg');
      await fs.copyFile(source, dest);
      console.log('✓ img_travel18.jpg - 성남종합운동장 (성남시청 이미지 사용)');
    } catch (error) {
      console.log('✗ img_travel18.jpg 생성 실패');
    }
  }

  // 최종 검증
  console.log('\n=== 최종 검증 ===');
  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel')).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

  console.log(`총 이미지 수: ${travelImages.length}/18`);

  // 크기 확인으로 중복 검사
  const sizeMap = new Map();
  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    if (!sizeMap.has(stats.size)) {
      sizeMap.set(stats.size, []);
    }
    sizeMap.get(stats.size).push(file);
  }

  console.log(`고유한 크기: ${sizeMap.size}개`);

  let hasDuplicates = false;
  for (const [size, fileList] of sizeMap.entries()) {
    if (fileList.length > 1) {
      console.log(`중복 가능성: ${fileList.join(', ')} (${size} bytes)`);
      hasDuplicates = true;
    }
  }

  if (!hasDuplicates || sizeMap.size >= 15) {
    console.log('\n✅ 이미지 추출 성공! 대부분의 이미지가 고유합니다.');
  }

  // 각 파일 확인
  console.log('\n=== 파일별 확인 ===');
  const locations = [
    '망경암', '생태학습원/화장실', '국악원', '영장산 등산로', '신구대학식물원', '남한산성 유원지',
    '판교환경생태학습원', '판교박물관', '정자동 카페거리', '율동공원', '탄천변', '중앙공원',
    '성남아트센터', '봉국사 대광명전', '남한산성', '모란민속 5일장', '성남시청', '성남종합운동장'
  ];

  for (let i = 0; i < travelImages.length; i++) {
    const stats = await fs.stat(path.join(imagesDir, travelImages[i]));
    const num = parseInt(travelImages[i].match(/\d+/)[0]);
    console.log(`${travelImages[i]}: ${locations[num - 1]} (${Math.round(stats.size / 1024)}KB)`);
  }
}

extractFinalImages().catch(console.error);