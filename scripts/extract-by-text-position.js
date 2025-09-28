import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractByTextPosition() {
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  console.log('=== 텍스트 위치 기준 이미지 추출 ===\n');
  console.log('방법: 각 장소명 텍스트의 왼쪽 끝을 기준으로 상단 이미지 영역 추출\n');

  const page2Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 10.24.55.png';
  const page3Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 10.25.10.png';

  // 페이지 2의 텍스트 위치 (Retina 2x 좌표)
  // 각 장소명 텍스트의 대략적인 시작 위치를 기준으로 함
  // 텍스트 위에서 약 280px 위가 이미지 시작점
  const page2TextPositions = [
    // 첫 번째 줄 - 텍스트 y 위치: 약 430px
    {
      textX: 232,  // "판교환경생태학습원" 텍스트 시작 x
      textY: 430,  // 텍스트 y 위치
      name: '판교환경생태학습원',
      output: 'img_travel7.jpg'
    },
    {
      textX: 636,  // "판교박물관" 텍스트 시작 x
      textY: 430,
      name: '판교박물관',
      output: 'img_travel8.jpg'
    },
    {
      textX: 1040, // "정자동 카페거리" 텍스트 시작 x
      textY: 430,
      name: '정자동 카페거리',
      output: 'img_travel9.jpg'
    },

    // 두 번째 줄 - 텍스트 y 위치: 약 870px
    {
      textX: 232,  // "율동공원" 텍스트 시작 x
      textY: 870,
      name: '율동공원',
      output: 'img_travel10.jpg'
    },
    {
      textX: 636,  // "탄천변" 텍스트 시작 x
      textY: 870,
      name: '탄천변',
      output: 'img_travel11.jpg'
    },
    {
      textX: 1040, // "중앙공원" 텍스트 시작 x
      textY: 870,
      name: '중앙공원',
      output: 'img_travel12.jpg'
    }
  ];

  // 페이지 3의 텍스트 위치
  const page3TextPositions = [
    // 첫 번째 줄 - 텍스트 y 위치: 약 450px
    {
      textX: 232,  // "성남아트센터" 텍스트 시작 x
      textY: 450,
      name: '성남아트센터',
      output: 'img_travel13.jpg'
    },
    {
      textX: 636,  // "봉국사 대광명전" 텍스트 시작 x
      textY: 450,
      name: '봉국사 대광명전',
      output: 'img_travel14.jpg'
    },
    {
      textX: 1040, // "남한산성" 텍스트 시작 x
      textY: 450,
      name: '남한산성',
      output: 'img_travel15.jpg'
    },

    // 두 번째 줄 - 텍스트 y 위치: 약 890px
    {
      textX: 232,  // "모란민속 5일장" 텍스트 시작 x
      textY: 890,
      name: '모란민속 5일장',
      output: 'img_travel16.jpg'
    },
    {
      textX: 636,  // "성남시청" 텍스트 시작 x
      textY: 890,
      name: '성남시청',
      output: 'img_travel17.jpg'
    }
  ];

  // 이미지 추출 함수
  async function extractImageFromTextPosition(imagePath, textPos, index) {
    // 텍스트 위치에서 이미지 영역 계산
    // 이미지는 텍스트 위 약 280-300px 위에 위치
    // 이미지 크기는 약 396x260 (Retina 2x)

    const imageX = textPos.textX;
    const imageY = textPos.textY - 305;  // 텍스트 위 305px
    const imageWidth = 396;
    const imageHeight = 260;

    const outputPath = path.join(imagesDir, textPos.output);

    try {
      await sharp(imagePath)
        .extract({
          left: imageX,
          top: imageY,
          width: imageWidth,
          height: imageHeight
        })
        .resize(391, 270, {
          fit: 'cover',
          position: 'centre'
        })
        .jpeg({ quality: 95 })
        .toFile(outputPath);

      const stats = await fs.stat(outputPath);
      const position = `[${Math.floor(index / 3) + 1}-${(index % 3) + 1}]`;
      console.log(`   ${position} ${textPos.output.padEnd(18)} - ${textPos.name.padEnd(15)} (${Math.round(stats.size / 1024)}KB)`);
      return true;
    } catch (error) {
      console.error(`   ✗ ${textPos.output}: ${error.message}`);
      return false;
    }
  }

  // 페이지 2 처리
  console.log('📍 페이지 2: 텍스트 위치 기준 추출\n');
  console.log('   텍스트 → 이미지 (텍스트 위 305px)\n');

  for (let i = 0; i < page2TextPositions.length; i++) {
    await extractImageFromTextPosition(page2Path, page2TextPositions[i], i);
  }

  // 페이지 3 처리
  console.log('\n📍 페이지 3: 텍스트 위치 기준 추출\n');
  console.log('   텍스트 → 이미지 (텍스트 위 305px)\n');

  for (let i = 0; i < page3TextPositions.length; i++) {
    await extractImageFromTextPosition(page3Path, page3TextPositions[i], i);
  }

  // img_travel18.jpg 생성
  console.log('\n📍 img_travel18.jpg 생성...');
  try {
    const dest = path.join(imagesDir, 'img_travel18.jpg');

    // 간단한 플레이스홀더
    await sharp({
      create: {
        width: 391,
        height: 270,
        channels: 3,
        background: { r: 80, g: 90, b: 100 }
      }
    })
    .composite([{
      input: Buffer.from(`
        <svg width="391" height="270">
          <text x="50%" y="50%" text-anchor="middle" fill="white"
                font-size="24" font-family="sans-serif">
            성남종합운동장
          </text>
        </svg>
      `),
      top: 0,
      left: 0
    }])
    .jpeg({ quality: 95 })
    .toFile(dest);

    console.log(`   ✓ img_travel18.jpg - 성남종합운동장 [생성됨]`);
  } catch (error) {
    console.error('   ✗ img_travel18.jpg 생성 실패');
  }

  // 검증
  console.log('\n=== 📊 검증 결과 ===\n');
  const files = await fs.readdir(imagesDir);
  const travelImages = files.filter(f => f.startsWith('img_travel')).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

  console.log(`✅ 총 이미지: ${travelImages.length}/18`);

  // 크기 분석
  const sizeMap = new Map();
  for (const file of travelImages) {
    const stats = await fs.stat(path.join(imagesDir, file));
    if (!sizeMap.has(stats.size)) {
      sizeMap.set(stats.size, 0);
    }
    sizeMap.set(stats.size, sizeMap.get(stats.size) + 1);
  }

  console.log(`✅ 고유한 파일 크기: ${sizeMap.size}개`);

  // 위치별 정리
  console.log('\n=== 📍 추출 방법 설명 ===');
  console.log('각 장소명 텍스트의 왼쪽 끝 x 좌표를 기준으로');
  console.log('텍스트 위 305px 지점에서 396x260 영역을 추출');
  console.log('\n예시:');
  console.log('  "판교환경생태학습원" 텍스트가 (232, 430)에 있으면');
  console.log('  → 이미지는 (232, 125)에서 추출 [430 - 305 = 125]');

  console.log('\n✅ 텍스트 기준 추출 완료!');
}

extractByTextPosition().catch(console.error);