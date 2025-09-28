import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath).catch(() => {});
      reject(err);
    });
  });
}

async function extractWorkplace() {
  const browser = await chromium.launch({
    headless: false
  });

  const page = await browser.newPage();

  console.log('Navigating to workplace page...');
  await page.goto('https://cromst.seongnam.go.kr:10005/street/workplace', {
    waitUntil: 'networkidle'
  });

  await page.waitForTimeout(3000);

  // Extract all content and images
  const workplaceData = await page.evaluate(() => {
    const result = {
      title: document.querySelector('h1, h2, .title')?.innerText || '신해철 작업실',
      content: [],
      images: [],
      videos: []
    };

    // Get main content
    const contentArea = document.querySelector('.content, .container, main, #content');
    if (contentArea) {
      result.content.push(contentArea.innerHTML);
    }

    // Get all images
    document.querySelectorAll('img').forEach(img => {
      if (img.src && !img.src.includes('logo') && !img.src.includes('icon')) {
        result.images.push({
          src: img.src,
          alt: img.alt,
          title: img.title
        });
      }
    });

    // Get videos/iframes
    document.querySelectorAll('iframe, video').forEach(media => {
      result.videos.push({
        src: media.src,
        type: media.tagName.toLowerCase()
      });
    });

    return result;
  });

  // Save data
  await fs.writeFile(
    path.join(__dirname, 'workplace-data.json'),
    JSON.stringify(workplaceData, null, 2)
  );

  // Download images
  const assetsDir = path.join(__dirname, '..', 'public', 'workplace-assets');
  await fs.mkdir(assetsDir, { recursive: true });

  for (const img of workplaceData.images) {
    try {
      const filename = img.src.split('/').pop();
      const outputPath = path.join(assetsDir, filename);
      await downloadFile(img.src, outputPath);
      console.log(`Downloaded: ${filename}`);
    } catch (err) {
      console.error(`Failed to download image: ${err.message}`);
    }
  }

  // Take full page screenshot
  await page.screenshot({
    path: path.join(__dirname, 'workplace-screenshot.png'),
    fullPage: true
  });

  console.log('Workplace data extracted successfully!');
  await browser.close();
}

extractWorkplace().catch(console.error);