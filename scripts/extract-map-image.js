import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// HTTPS 다운로드 함수
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

async function extractMapAssets() {
  console.log('Connecting to Chrome on port 9222...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  console.log('Connected!');

  const contexts = browser.contexts();
  let targetPage = null;

  for (const context of contexts) {
    const pages = context.pages();
    for (const page of pages) {
      const url = page.url();
      if (url.includes('cromst.seongnam.go.kr')) {
        targetPage = page;
        console.log('Found street page!');
        break;
      }
    }
  }

  if (!targetPage) {
    console.log('신해철 거리 페이지를 찾을 수 없습니다.');
    return;
  }

  // Extract all image sources and map structure
  const mapData = await targetPage.evaluate(() => {
    const results = {
      mapBackground: null,
      mapElements: [],
      styles: {},
      html: ''
    };

    // Get the map container
    const mapContainer = document.querySelector('.map');
    if (mapContainer) {
      results.html = mapContainer.outerHTML;

      // Get computed styles
      const styles = window.getComputedStyle(mapContainer);
      results.styles = {
        background: styles.background,
        backgroundImage: styles.backgroundImage,
        width: styles.width,
        height: styles.height
      };

      // Get all child elements with positions
      const locations = mapContainer.querySelectorAll('.location > span');
      locations.forEach(loc => {
        const link = loc.querySelector('a');
        const locStyles = window.getComputedStyle(loc);

        results.mapElements.push({
          className: loc.className,
          position: {
            position: locStyles.position,
            top: locStyles.top,
            left: locStyles.left,
            width: locStyles.width,
            height: locStyles.height
          },
          link: {
            href: link?.href,
            text: link?.innerText,
            dataModal: link?.getAttribute('data-modal'),
            className: link?.className
          }
        });
      });
    }

    // Check for background images in CSS
    const styleSheets = Array.from(document.styleSheets);
    const backgroundRules = [];

    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule.cssText && rule.cssText.includes('background')) {
            backgroundRules.push(rule.cssText);
          }
        });
      } catch(e) {}
    });

    results.cssRules = backgroundRules;

    return results;
  });

  // Save the extracted data
  await fs.writeFile(
    path.join(__dirname, 'map-structure.json'),
    JSON.stringify(mapData, null, 2)
  );

  // Try to extract CSS files
  const cssFiles = await targetPage.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    return links.map(link => link.href).filter(href => href.includes('street'));
  });

  console.log('Found CSS files:', cssFiles);

  // Extract inline styles and background images
  const backgroundImages = await targetPage.evaluate(() => {
    const images = [];

    // Check all elements for background images
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.backgroundImage && style.backgroundImage !== 'none') {
        const match = style.backgroundImage.match(/url\(["']?(.+?)["']?\)/);
        if (match) {
          images.push({
            element: el.className || el.id || el.tagName,
            url: match[1]
          });
        }
      }
    });

    return images;
  });

  console.log('Background images found:', backgroundImages);

  // Create directories for assets
  const assetsDir = path.join(__dirname, '..', 'public', 'street-assets');
  await fs.mkdir(assetsDir, { recursive: true });

  // Download background images
  for (const img of backgroundImages) {
    if (img.url.startsWith('http')) {
      const filename = img.url.split('/').pop();
      const outputPath = path.join(assetsDir, filename);

      try {
        await downloadFile(img.url, outputPath);
        console.log(`Downloaded: ${filename}`);
      } catch (err) {
        console.error(`Failed to download ${filename}:`, err.message);
      }
    }
  }

  console.log('Map structure saved to map-structure.json');
  console.log('Assets saved to public/street-assets/');
}

extractMapAssets().catch(console.error);