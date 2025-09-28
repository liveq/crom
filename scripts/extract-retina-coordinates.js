import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractWithRetinaCoordinates() {
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  console.log('=== Retina 디스플레이 좌표 보정 추출 ===\n');
  console.log('스크린샷 해상도: 3360x2100 (Retina 2x)\n');

  // Retina 디스플레이를 고려한 2x 좌표
  // 브라우저 컨텐츠 영역은 약 y:125부터 시작 (2x = 250)
  // 각 카드는 약 400x260 크기 (2x)
  // 카드 간격 약 10px (2x = 20)

  const page2Coords = [
    // 첫 번째 줄 (y: 약 250부터)
    { x: 232, y: 125, width: 396, height: 260, output: 'img_travel7.jpg', name: '판교환경생태학습원' },
    { x: 636, y: 125, width: 396, height: 260, output: 'img_travel8.jpg', name: '판교박물관' },
    { x: 1040, y: 125, width: 396, height: 260, output: 'img_travel9.jpg', name: '정자동 카페거리' },

    // 두 번째 줄 (y: 약 570부터)
    { x: 232, y: 568, width: 396, height: 260, output: 'img_travel10.jpg', name: '율동공원' },
    { x: 636, y: 568, width: 396, height: 260, output: 'img_travel11.jpg', name: '탄천변' },
    { x: 1040, y: 568, width: 396, height: 260, output: 'img_travel12.jpg', name: '중앙공원' }
  ];

  const page3Coords = [
    // 첫 번째 줄 (페이지 3은 y 시작점이 약간 다름)
    { x: 232, y: 145, width: 396, height: 260, output: 'img_travel13.jpg', name: '성남아트센터' },
    { x: 636, y: 145, width: 396, height: 260, output: 'img_travel14.jpg', name: '봉국사 대광명전' },
    { x: 1040, y: 145, width: 396, height: 260, output: 'img_travel15.jpg', name: '남한산성' },

    // 두 번째 줄
    { x: 232, y: 580, width: 396, height: 260, output: 'img_travel16.jpg', name: '모란민속 5일장' },
    { x: 636, y: 580, width: 396, height: 260, output: 'img_travel17.jpg', name: '성남시청' }
  ];

  const page2Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 10.24.55.png';
  const page3Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 10.25.10.png';

  // 페이지 2 추출
  console.log('📍 페이지 2 이미지 추출 (Retina 좌표)...\n');
  for (let i = 0; i < page2Coords.length; i++) {
    const coord = page2Coords[i];
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
        .jpeg({ quality: 95 })
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      const row = Math.floor(i / 3) + 1;
      const col = (i % 3) + 1;
      console.log(`   [${row}-${col}] ${coord.output.padEnd(18)} - ${coord.name.padEnd(15)} (${Math.round(stats.size / 1024)}KB)`);
    } catch (error) {
      console.error(`   ✗ ${coord.output}: ${error.message}`);
    }
  }

  // 페이지 3 추출
  console.log('\n📍 페이지 3 이미지 추출 (Retina 좌표)...\n');
  for (let i = 0; i < page3Coords.length; i++) {
    const coord = page3Coords[i];
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
        .jpeg({ quality: 95 })
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      const row = Math.floor(i / 3) + 1;
      const col = (i % 3) + 1;
      console.log(`   [${row}-${col}] ${coord.output.padEnd(18)} - ${coord.name.padEnd(15)} (${Math.round(stats.size / 1024)}KB)`);
    } catch (error) {
      console.error(`   ✗ ${coord.output}: ${error.message}`);
    }
  }

  // img_travel18.jpg 생성 (성남종합운동장)
  console.log('\n📍 img_travel18.jpg 생성...');
  try {
    const dest = path.join(imagesDir, 'img_travel18.jpg');

    // 플레이스홀더 생성 또는 다른 이미지 변형
    await sharp({
      create: {
        width: 391,
        height: 270,
        channels: 3,
        background: { r: 100, g: 100, b: 120 }
      }
    })
    .composite([{
      input: Buffer.from(`
        <svg width="391" height="270" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="28" font-family="Arial">
            성남종합운동장
          </text>
          <text x="50%" y="55%" text-anchor="middle" fill="white" font-size="16" font-family="Arial">
            Seongnam Sports Complex
          </text>
        </svg>
      `),
      top: 0,
      left: 0
    }])
    .jpeg({ quality: 95 })
    .toFile(dest);

    const stats = await fs.stat(dest);
    console.log(`   ✓ img_travel18.jpg - 성남종합운동장 (${Math.round(stats.size / 1024)}KB) [플레이스홀더]`);
  } catch (error) {
    console.error('   ✗ img_travel18.jpg 생성 실패');
  }

  // 최종 검증
  console.log('\n=== 📊 최종 검증 ===\n');
  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel')).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

  console.log(`✅ 총 이미지: ${travelImages.length}/18`);

  // 크기 분석
  const sizeMap = new Map();
  const allSizes = [];

  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    allSizes.push({ file, size: stats.size });

    if (!sizeMap.has(stats.size)) {
      sizeMap.set(stats.size, []);
    }
    sizeMap.get(stats.size).push(file);
  }

  console.log(`✅ 고유한 크기: ${sizeMap.size}/18`);

  // 중복 확인
  const duplicates = [];
  for (const [size, fileList] of sizeMap.entries()) {
    if (fileList.length > 1) {
      duplicates.push({ size, files: fileList });
    }
  }

  if (duplicates.length > 0) {
    console.log('\n⚠️  동일 크기 파일:');
    duplicates.forEach(({ size, files }) => {
      console.log(`   ${Math.round(size / 1024)}KB: ${files.join(', ')}`);
    });
  }

  // 전체 목록
  console.log('\n=== 📂 전체 이미지 목록 ===\n');

  const locations = [
    '망경암', '생태학습원/화장실', '국악원', '영장산 등산로', '신구대학식물원', '남한산성 유원지',
    '판교환경생태학습원', '판교박물관', '정자동 카페거리', '율동공원', '탄천변', '중앙공원',
    '성남아트센터', '봉국사 대광명전', '남한산성', '모란민속 5일장', '성남시청', '성남종합운동장'
  ];

  for (let i = 0; i < 18; i++) {
    if (i % 6 === 0) {
      console.log(`\n페이지 ${Math.floor(i / 6) + 1}:`);
    }

    const file = `img_travel${i + 1}.jpg`;
    const fileData = allSizes.find(f => f.file === file);

    if (fileData) {
      console.log(`  ${file.padEnd(18)} - ${locations[i].padEnd(18)} (${Math.round(fileData.size / 1024)}KB)`);
    }
  }

  console.log('\n✅ Retina 좌표 추출 완료!');
}

extractWithRetinaCoordinates().catch(console.error);