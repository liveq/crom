import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 페이지 3 (두 번째 스크린샷) - 성남아트센터, 봉국사, 남한산성, 모란민속5일장, 성남시청
const page3Coords = [
  { x: 116, y: 72, width: 198, height: 140, output: 'img_travel13.jpg', name: '성남아트센터' },
  { x: 318, y: 72, width: 198, height: 140, output: 'img_travel14.jpg', name: '봉국사 대광명전' },
  { x: 520, y: 72, width: 198, height: 140, output: 'img_travel15.jpg', name: '남한산성' },
  { x: 116, y: 290, width: 198, height: 140, output: 'img_travel16.jpg', name: '모란민속 5일장' },
  { x: 318, y: 290, width: 198, height: 140, output: 'img_travel17.jpg', name: '성남시청' }
];

async function extractPage3Correct() {
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');

  console.log('=== 페이지 3 이미지 재추출 ===\n');

  // 페이지 3 처리 (두 번째 스크린샷)
  const page3Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 10.25.10.png';
  const page3Exists = await fs.access(page3Path).then(() => true).catch(() => false);

  if (page3Exists) {
    console.log('페이지 3 이미지 추출 중...\n');

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

    // img_travel18.jpg 처리 - 성남종합운동장이 없으므로 별도 처리
    try {
      // 성남시청 이미지를 복사하거나 플레이스홀더 생성
      const source = path.join(imagesDir, 'img_travel17.jpg');
      const dest = path.join(imagesDir, 'img_travel18.jpg');

      // 먼저 기존 img_travel18 삭제
      await fs.unlink(dest).catch(() => {});

      // 플레이스홀더 이미지 생성 (검은 배경에 텍스트)
      await sharp({
        create: {
          width: 391,
          height: 270,
          channels: 3,
          background: { r: 50, g: 50, b: 50 }
        }
      })
      .composite([{
        input: Buffer.from(`<svg width="391" height="270">
          <text x="50%" y="50%" text-anchor="middle" dy="0.3em"
                fill="white" font-size="24" font-family="sans-serif">
            성남종합운동장
          </text>
        </svg>`),
        top: 0,
        left: 0
      }])
      .jpeg({ quality: 90 })
      .toFile(dest);

      const stats = await fs.stat(dest);
      console.log(`✓ img_travel18.jpg - 성남종합운동장 (플레이스홀더, ${stats.size} bytes)`);
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

  console.log(`총 이미지 수: ${travelImages.length}/18\n`);

  // 파일 크기로 고유성 확인
  const sizeMap = new Map();
  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    if (!sizeMap.has(stats.size)) {
      sizeMap.set(stats.size, []);
    }
    sizeMap.get(stats.size).push(file);
  }

  console.log(`고유한 크기: ${sizeMap.size}개\n`);

  // 모든 파일 목록
  const locations = [
    '망경암', '생태학습원/화장실', '국악원', '영장산 등산로', '신구대학식물원', '남한산성 유원지',
    '판교환경생태학습원', '판교박물관', '정자동 카페거리', '율동공원', '탄천변', '중앙공원',
    '성남아트센터', '봉국사 대광명전', '남한산성', '모란민속 5일장', '성남시청', '성남종합운동장'
  ];

  console.log('=== 모든 이미지 목록 ===');
  for (let i = 0; i < travelImages.length; i++) {
    const stats = await fs.stat(path.join(imagesDir, travelImages[i]));
    const num = parseInt(travelImages[i].match(/\d+/)[0]);
    console.log(`${travelImages[i]}: ${locations[num - 1]} (${Math.round(stats.size / 1024)}KB)`);
  }

  console.log('\n✅ 페이지 3 이미지 재추출 완료!');
}

extractPage3Correct().catch(console.error);