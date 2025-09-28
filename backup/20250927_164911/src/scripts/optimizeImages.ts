import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.resolve(__dirname, '../../../backup/images');
const OUTPUT_DIR = path.resolve(__dirname, '../../public/images');
const THUMBNAIL_DIR = path.join(OUTPUT_DIR, 'thumbnails');
const FULL_DIR = path.join(OUTPUT_DIR, 'full');

// 썸네일: 300x200, WebP 품질 80
// 풀사이즈: 최대 1920px, WebP 품질 85, JPG 품질 85

async function ensureDirectories() {
  await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
  await fs.mkdir(FULL_DIR, { recursive: true });
}

async function optimizeImage(inputPath: string, filename: string) {
  const basename = path.basename(filename, path.extname(filename));

  try {
    // 썸네일 생성 (WebP + JPG)
    await sharp(inputPath)
      .resize(300, 200, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(path.join(THUMBNAIL_DIR, `${basename}.webp`));

    await sharp(inputPath)
      .resize(300, 200, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80 })
      .toFile(path.join(THUMBNAIL_DIR, `${basename}.jpg`));

    // 풀사이즈 생성 (WebP + JPG)
    await sharp(inputPath)
      .resize(1920, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toFile(path.join(FULL_DIR, `${basename}.webp`));

    await sharp(inputPath)
      .resize(1920, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(path.join(FULL_DIR, `${basename}.jpg`));

    console.log(`✅ Optimized: ${filename}`);
  } catch (error) {
    console.error(`❌ Failed: ${filename}`, error);
  }
}

async function processAllImages() {
  console.log('🚀 Starting image optimization...');
  console.log(`📁 Source: ${BACKUP_DIR}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);

  await ensureDirectories();

  // backup/images 폴더의 모든 이미지 처리
  const files = await fs.readdir(BACKUP_DIR);
  const imageFiles = files.filter(file =>
    /\.(jpg|jpeg|png)$/i.test(file)
  );

  console.log(`📷 Found ${imageFiles.length} images to optimize`);

  // 병렬로 5개씩 처리 (메모리 관리)
  const batchSize = 5;
  for (let i = 0; i < imageFiles.length; i += batchSize) {
    const batch = imageFiles.slice(i, i + batchSize);
    await Promise.all(
      batch.map(file =>
        optimizeImage(
          path.join(BACKUP_DIR, file),
          file
        )
      )
    );
    console.log(`Progress: ${Math.min(i + batchSize, imageFiles.length)}/${imageFiles.length}`);
  }

  // public/images의 기존 이미지도 처리
  const publicImages = await fs.readdir(OUTPUT_DIR);
  const publicImageFiles = publicImages.filter(file =>
    /\.(jpg|jpeg|png)$/i.test(file) &&
    !['thumbnails', 'full'].includes(file)
  );

  console.log(`\n📷 Found ${publicImageFiles.length} existing images to optimize`);

  for (let i = 0; i < publicImageFiles.length; i += batchSize) {
    const batch = publicImageFiles.slice(i, i + batchSize);
    await Promise.all(
      batch.map(file =>
        optimizeImage(
          path.join(OUTPUT_DIR, file),
          file
        )
      )
    );
    console.log(`Progress: ${Math.min(i + batchSize, publicImageFiles.length)}/${publicImageFiles.length}`);
  }

  console.log('\n✨ Image optimization complete!');

  // 결과 통계
  const thumbnailsWebP = await fs.readdir(THUMBNAIL_DIR).then(files => files.filter(f => f.endsWith('.webp')));
  const thumbnailsJPG = await fs.readdir(THUMBNAIL_DIR).then(files => files.filter(f => f.endsWith('.jpg')));
  const fullWebP = await fs.readdir(FULL_DIR).then(files => files.filter(f => f.endsWith('.webp')));
  const fullJPG = await fs.readdir(FULL_DIR).then(files => files.filter(f => f.endsWith('.jpg')));

  console.log('\n📊 Results:');
  console.log(`  Thumbnails: ${thumbnailsWebP.length} WebP, ${thumbnailsJPG.length} JPG`);
  console.log(`  Full size: ${fullWebP.length} WebP, ${fullJPG.length} JPG`);
}

processAllImages().catch(console.error);