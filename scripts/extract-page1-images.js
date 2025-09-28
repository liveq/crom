import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractPage1Images() {
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  console.log('=== 페이지 1 이미지 추출 ===\n');

  const page1Path = '/Users/michaeljack/Desktop/code/스크린샷 2025-09-27 11.20.02.png';

  // 페이지 1 메타데이터 확인
  const metadata = await sharp(page1Path).metadata();
  console.log(`페이지 1 스크린샷: ${metadata.width}x${metadata.height}\n`);

  // 페이지 1 이미지 좌표 (일반 해상도 630x394)
  const page1Images = [
    { name: '망경암 마애여래좌상', x: 0, y: 0, width: 210, height: 160, output: 'img_travel1.jpg' },
    { name: '채테마파크', x: 210, y: 0, width: 210, height: 160, output: 'img_travel2.jpg' },
    { name: '성남시 민속공예전시관', x: 420, y: 0, width: 210, height: 160, output: 'img_travel3.jpg' },
    { name: '신대동 전통명상센터', x: 0, y: 200, width: 210, height: 160, output: 'img_travel4.jpg' },
    { name: '한국잡월드', x: 210, y: 200, width: 210, height: 160, output: 'img_travel5.jpg' },
    { name: '신구대학교식물원', x: 420, y: 200, width: 210, height: 160, output: 'img_travel6.jpg' }
  ];

  console.log('📍 페이지 1 이미지 추출\n');
  console.log('   위치  | 파일명              | 장소명');
  console.log('   ------|---------------------|------------------------');

  for (let i = 0; i < page1Images.length; i++) {
    const img = page1Images[i];
    const row = Math.floor(i / 3) + 1;
    const col = (i % 3) + 1;

    try {
      await sharp(page1Path)
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

  // 검증
  console.log('\n=== 📊 검증 ===\n');
  const files = await fs.readdir(imagesDir);
  const page1Files = files.filter(f => f.match(/img_travel[1-6]\.jpg/)).sort();

  console.log(`✅ 페이지 1 이미지: ${page1Files.length}/6`);

  // 크기 확인
  const sizes = new Set();
  for (const file of page1Files) {
    const stats = await fs.stat(path.join(imagesDir, file));
    sizes.add(stats.size);
  }

  console.log(`✅ 고유한 크기: ${sizes.size}/6`);

  console.log('\n✅ 페이지 1 추출 완료!');
}

extractPage1Images().catch(console.error);