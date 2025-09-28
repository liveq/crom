import fs from 'fs';
import path from 'path';

const imagesDir = '/Volumes/X31/code/crom-memorial/public/images';
const outputFile = '/Volumes/X31/code/crom-memorial/src/data/galleryImages.json';

const imageFiles = fs.readdirSync(imagesDir)
  .filter(file => file.endsWith('.jpg') && !file.includes('album') && !file.includes('hero'))
  .map(file => `/images/${file}`);

const galleryData = {
  street: imageFiles.filter(f => f.includes('area') || f.includes('street')),
  photos: imageFiles.filter(f => !f.includes('area') && !f.includes('street'))
};

fs.writeFileSync(outputFile, JSON.stringify(galleryData, null, 2), 'utf-8');

console.log(`갤러리 이미지 분류 완료:`);
console.log(`- 거리 행사: ${galleryData.street.length}개`);
console.log(`- 일반 사진: ${galleryData.photos.length}개`);
console.log(`총 ${imageFiles.length}개 저장: ${outputFile}`);