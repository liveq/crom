import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const backupDir = '/Volumes/X31/code/crom-memorial/backup/cromst-seongnam';

const albums = {
  solo: [],
  next: []
};

const parseSoloAlbums = () => {
  const html = fs.readFileSync(path.join(backupDir, 'album_shinhaechul.html'), 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const albumElements = document.querySelectorAll('.album_list1 ul li');

  albumElements.forEach(li => {
    const img = li.querySelector('img');
    const title = li.querySelector('.desc .detail')?.textContent?.trim();
    const year = li.querySelector('.desc .date')?.textContent?.trim();
    const cover = img?.getAttribute('src');

    if (title && year && cover) {
      albums.solo.push({
        title,
        year,
        cover: cover.replace('/images/content/album/', '/images/'),
        artist: '신해철'
      });
    }
  });

  console.log(`신해철 솔로 앨범: ${albums.solo.length}개`);
};

const parseNextAlbums = () => {
  const html = fs.readFileSync(path.join(backupDir, 'album_next.html'), 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const albumElements = document.querySelectorAll('.album_list1 ul li');

  albumElements.forEach(li => {
    const img = li.querySelector('img');
    const title = li.querySelector('.desc .detail')?.textContent?.trim();
    const year = li.querySelector('.desc .date')?.textContent?.trim();
    const cover = img?.getAttribute('src');

    if (title && year && cover) {
      albums.next.push({
        title,
        year,
        cover: cover.replace('/images/content/album/', '/images/'),
        artist: 'N.EX.T'
      });
    }
  });

  console.log(`N.EX.T 앨범: ${albums.next.length}개`);
};

parseSoloAlbums();
parseNextAlbums();

const outputFile = '/Volumes/X31/code/crom-memorial/src/data/albums.json';
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(albums, null, 2), 'utf-8');

console.log(`\n총 ${albums.solo.length + albums.next.length}개 앨범 저장 완료: ${outputFile}`);