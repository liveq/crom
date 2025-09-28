import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CAROUSEL_DIR = path.resolve(__dirname, './public/images/optimized/carousel');
const OUTPUT_DIR = path.resolve(__dirname, './public/images');
const FULL_DIR = path.join(OUTPUT_DIR, 'full');

async function optimizeCarousel() {
  console.log('🚀 Optimizing carousel images...');

  try {
    const files = await fs.readdir(CAROUSEL_DIR);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

    console.log(`📷 Found ${imageFiles.length} carousel images to optimize`);

    for (const file of imageFiles) {
      const basename = path.basename(file, path.extname(file));
      const inputPath = path.join(CAROUSEL_DIR, file);

      // WebP 버전
      await sharp(inputPath)
        .resize(1920, null, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(path.join(FULL_DIR, `${basename}.webp`));

      // JPG 버전
      await sharp(inputPath)
        .resize(1920, null, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(path.join(FULL_DIR, `${basename}.jpg`));

      console.log(`✅ Optimized: ${file}`);
    }

    console.log('\n✨ Carousel optimization complete!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

optimizeCarousel().catch(console.error);