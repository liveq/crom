import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function finalAccurateExtraction() {
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  console.log('=== 최종 정확한 이미지 추출 ===\n');
  console.log('스크린샷 해상도: 3360x2100 (Retina 2x)\n');

  const page2Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 10.24.55.png';
  const page3Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 10.25.10.png';

  // 페이지 2 좌표 - 스크린샷에서 실제 위치
  // 브라우저 창의 컨텐츠 영역 내 이미지들
  const page2Images = [
    { name: '판교환경생태학습원', x: 232, y: 125, width: 396, height: 260, output: 'img_travel7.jpg' },
    { name: '판교박물관', x: 636, y: 125, width: 396, height: 260, output: 'img_travel8.jpg' },
    { name: '정자동 카페거리', x: 1040, y: 125, width: 396, height: 260, output: 'img_travel9.jpg' },
    { name: '율동공원', x: 232, y: 568, width: 396, height: 260, output: 'img_travel10.jpg' },
    { name: '탄천변', x: 636, y: 568, width: 396, height: 260, output: 'img_travel11.jpg' },
    { name: '중앙공원', x: 1040, y: 568, width: 396, height: 260, output: 'img_travel12.jpg' }
  ];

  // 페이지 3 좌표
  const page3Images = [
    { name: '성남아트센터', x: 232, y: 145, width: 396, height: 260, output: 'img_travel13.jpg' },
    { name: '봉국사 대광명전', x: 636, y: 145, width: 396, height: 260, output: 'img_travel14.jpg' },
    { name: '남한산성', x: 1040, y: 145, width: 396, height: 260, output: 'img_travel15.jpg' },
    { name: '모란민속 5일장', x: 232, y: 580, width: 396, height: 260, output: 'img_travel16.jpg' },
    { name: '성남시청', x: 636, y: 580, width: 396, height: 260, output: 'img_travel17.jpg' }
  ];

  // 페이지 2 처리
  console.log('📍 페이지 2 이미지 추출\n');
  console.log('   위치  | 파일명              | 장소명');
  console.log('   ------|---------------------|------------------------');

  for (let i = 0; i < page2Images.length; i++) {
    const img = page2Images[i];
    const row = Math.floor(i / 3) + 1;
    const col = (i % 3) + 1;

    try {
      await sharp(page2Path)
        .extract({
          left: img.x,
          top: img.y,
          width: img.width,
          height: img.height
        })
        .resize(391, 270, { fit: 'cover' })
        .jpeg({ quality: 95 })
        .toFile(path.join(imagesDir, img.output));

      const stats = await fs.stat(path.join(imagesDir, img.output));
      console.log(`   [${row}-${col}] | ${img.output.padEnd(19)} | ${img.name.padEnd(22)} (${Math.round(stats.size / 1024)}KB)`);
    } catch (error) {
      console.error(`   ✗ ${img.output}: ${error.message}`);
    }
  }

  // 페이지 3 처리
  console.log('\n📍 페이지 3 이미지 추출\n');
  console.log('   위치  | 파일명              | 장소명');
  console.log('   ------|---------------------|------------------------');

  for (let i = 0; i < page3Images.length; i++) {
    const img = page3Images[i];
    const row = Math.floor(i / 3) + 1;
    const col = (i % 3) + 1;

    try {
      await sharp(page3Path)
        .extract({
          left: img.x,
          top: img.y,
          width: img.width,
          height: img.height
        })
        .resize(391, 270, { fit: 'cover' })
        .jpeg({ quality: 95 })
        .toFile(path.join(imagesDir, img.output));

      const stats = await fs.stat(path.join(imagesDir, img.output));
      console.log(`   [${row}-${col}] | ${img.output.padEnd(19)} | ${img.name.padEnd(22)} (${Math.round(stats.size / 1024)}KB)`);
    } catch (error) {
      console.error(`   ✗ ${img.output}: ${error.message}`);
    }
  }

  // img_travel18.jpg 생성 (성남종합운동장 - 페이지 3에 없음)
  console.log('\n📍 img_travel18.jpg 생성 (성남종합운동장)');
  try {
    await sharp({
      create: {
        width: 391,
        height: 270,
        channels: 3,
        background: { r: 60, g: 80, b: 100 }
      }
    })
    .composite([{
      input: Buffer.from(`
        <svg width="391" height="270">
          <rect width="391" height="270" fill="rgb(60,80,100)"/>
          <text x="50%" y="45%" text-anchor="middle" fill="white"
                font-size="26" font-family="sans-serif" font-weight="bold">
            성남종합운동장
          </text>
          <text x="50%" y="55%" text-anchor="middle" fill="white"
                font-size="14" font-family="sans-serif" opacity="0.8">
            Seongnam Sports Complex
          </text>
        </svg>
      `),
      top: 0,
      left: 0
    }])
    .jpeg({ quality: 95 })
    .toFile(path.join(imagesDir, 'img_travel18.jpg'));

    const stats = await fs.stat(path.join(imagesDir, 'img_travel18.jpg'));
    console.log(`   ✓ img_travel18.jpg 생성 완료 (${Math.round(stats.size / 1024)}KB)`);
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

  console.log(`✅ 총 이미지: ${travelImages.length}/18\n`);

  // 크기 분석
  const sizeSet = new Set();
  const fileInfo = [];

  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    sizeSet.add(stats.size);
    fileInfo.push({ file, size: stats.size });
  }

  console.log(`✅ 고유한 크기: ${sizeSet.size}/18`);

  if (sizeSet.size < 18) {
    console.log('\n⚠️  일부 이미지가 동일한 크기를 가집니다.');
    const sizeMap = new Map();
    fileInfo.forEach(({ file, size }) => {
      if (!sizeMap.has(size)) sizeMap.set(size, []);
      sizeMap.get(size).push(file);
    });

    for (const [size, files] of sizeMap.entries()) {
      if (files.length > 1) {
        console.log(`   ${Math.round(size / 1024)}KB: ${files.join(', ')}`);
      }
    }
  } else {
    console.log('✨ 모든 이미지가 고유합니다!');
  }

  // 전체 목록 출력
  console.log('\n=== 📁 전체 파일 목록 ===\n');

  const locations = [
    '망경암 마애여래좌상', '채테마파크', '성남시 민속공예전시관',
    '남한산성 역사관', '율동공원', '분당중앙공원',
    '판교환경생태학습원', '판교박물관', '정자동 카페거리',
    '율동공원', '탄천변', '중앙공원',
    '성남아트센터', '봉국사 대광명전', '남한산성',
    '모란민속 5일장', '성남시청', '성남종합운동장'
  ];

  for (let i = 0; i < 18; i++) {
    if (i % 6 === 0) {
      console.log(`\n페이지 ${Math.floor(i / 6) + 1}:`);
    }

    const file = `img_travel${i + 1}.jpg`;
    const info = fileInfo.find(f => f.file === file);

    if (info) {
      const pageRow = Math.floor((i % 6) / 3) + 1;
      const pageCol = (i % 3) + 1;
      console.log(`  [${pageRow}-${pageCol}] ${file.padEnd(18)} - ${locations[i].padEnd(20)} (${Math.round(info.size / 1024)}KB)`);
    }
  }

  console.log('\n✅ 최종 추출 완료!');
}

finalAccurateExtraction().catch(console.error);