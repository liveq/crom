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

async function extractAllTravelData() {
  console.log('Connecting to Chrome to extract travel data...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');

  const contexts = browser.contexts();
  let targetPage = null;

  for (const context of contexts) {
    const pages = context.pages();
    for (const page of pages) {
      const url = page.url();
      if (url.includes('cromst.seongnam.go.kr')) {
        targetPage = page;
        console.log('Found page:', url);
        break;
      }
    }
  }

  if (!targetPage) {
    console.log('Opening new page...');
    const browser2 = await chromium.launch({ headless: false });
    targetPage = await browser2.newPage();
  }

  const allAttractions = [];
  const allImages = new Set();

  // Navigate to travel page
  console.log('Navigating to travel page...');
  await targetPage.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel', { waitUntil: 'networkidle' });
  await targetPage.waitForTimeout(3000);

  // Extract data from all pages by clicking pagination
  for (let pageNum = 1; pageNum <= 3; pageNum++) {
    console.log(`\n=== Extracting Page ${pageNum} ===`);

    // Click on page number if not on page 1
    if (pageNum > 1) {
      try {
        // Try to click pagination
        const clicked = await targetPage.evaluate((num) => {
          // Try different methods
          if (typeof go_page === 'function') {
            go_page(num);
            return 'go_page function';
          }

          // Try clicking link
          const link = document.querySelector(`a[onclick*="go_page(${num})"]`);
          if (link) {
            link.click();
            return 'clicked link';
          }

          // Try hash navigation
          window.location.hash = `#go_page${num}`;
          return 'hash navigation';
        }, pageNum);

        console.log(`Navigation method: ${clicked}`);
        await targetPage.waitForTimeout(2000);
      } catch (err) {
        console.log(`Could not navigate to page ${pageNum}: ${err.message}`);
      }
    }

    // Extract data from current page
    const pageData = await targetPage.evaluate(() => {
      const data = {
        attractions: [],
        images: []
      };

      // Find all list items
      const items = document.querySelectorAll('.travel_list1 li');
      console.log(`Found ${items.length} items on page`);

      items.forEach((item, index) => {
        // Get the anchor tag
        const anchor = item.querySelector('a');

        // Get image - check multiple possibilities
        let imageUrl = '';
        const img = item.querySelector('img');
        if (img) {
          imageUrl = img.src;
        } else {
          // Check for background image in anchor or child elements
          const elements = [anchor, ...item.querySelectorAll('*')];
          for (const el of elements) {
            if (el) {
              const style = window.getComputedStyle(el);
              const bgImage = style.backgroundImage;
              if (bgImage && bgImage !== 'none') {
                const match = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/);
                if (match) {
                  imageUrl = match[1];
                  break;
                }
              }
            }
          }
        }

        // Get title
        const title = item.querySelector('.desc')?.textContent?.trim() ||
                     item.querySelector('strong')?.textContent?.trim() ||
                     item.textContent?.trim() || '';

        if (imageUrl || title) {
          if (!imageUrl.startsWith('http')) {
            imageUrl = 'https://cromst.seongnam.go.kr:10005' + imageUrl;
          }

          data.attractions.push({
            title: title,
            imageUrl: imageUrl,
            pageNumber: -1 // Will be set later
          });

          if (imageUrl) {
            data.images.push(imageUrl);
          }
        }
      });

      // Also look for any travel images on the page
      document.querySelectorAll('img[src*="travel"], img[src*="img_travel"]').forEach(img => {
        data.images.push(img.src);
      });

      return data;
    });

    console.log(`Page ${pageNum}: Found ${pageData.attractions.length} attractions`);

    // Add page number to attractions and store them
    pageData.attractions.forEach(attr => {
      attr.pageNumber = pageNum;
      allAttractions.push(attr);
    });

    pageData.images.forEach(img => allImages.add(img));
  }

  // Expected images for 3 pages (6 per page = 18 total)
  const expectedImages = [];
  for (let i = 1; i <= 18; i++) {
    expectedImages.push(`img_travel${i}.jpg`);
  }

  // Create directory
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Download found images
  console.log(`\nDownloading ${allImages.size} found images...`);
  let downloadedCount = 0;
  let imageIndex = 1;

  for (const imageUrl of allImages) {
    if (imageUrl && imageUrl.startsWith('http')) {
      try {
        let filename = imageUrl.split('/').pop().split('?')[0];
        if (!filename.includes('img_travel')) {
          filename = `img_travel${imageIndex}.jpg`;
        }
        imageIndex++;

        const outputPath = path.join(imagesDir, filename);
        await downloadFile(imageUrl, outputPath);
        downloadedCount++;
        console.log(`Downloaded: ${filename}`);
      } catch (err) {
        console.error(`Failed to download ${imageUrl}: ${err.message}`);
      }
    }
  }

  // Try to download expected images directly
  console.log('\nTrying to download expected images directly...');
  const baseUrl = 'https://cromst.seongnam.go.kr:10005/images/content/street_travel/';

  for (const imageName of expectedImages) {
    const fullUrl = baseUrl + imageName;
    const outputPath = path.join(imagesDir, imageName);

    try {
      await downloadFile(fullUrl, outputPath);
      downloadedCount++;
      console.log(`Downloaded expected: ${imageName}`);
    } catch (err) {
      console.log(`Could not download ${imageName}`);
    }
  }

  // Save all data
  const dataPath = path.join(__dirname, 'all-travel-pages-data.json');
  const finalData = {
    totalAttractions: allAttractions.length,
    totalImages: downloadedCount,
    pages: {
      page1: allAttractions.filter(a => a.pageNumber === 1),
      page2: allAttractions.filter(a => a.pageNumber === 2),
      page3: allAttractions.filter(a => a.pageNumber === 3)
    },
    allAttractions: allAttractions,
    allImages: Array.from(allImages)
  };

  await fs.writeFile(dataPath, JSON.stringify(finalData, null, 2));

  console.log(`\nExtraction complete!`);
  console.log(`- Total attractions: ${allAttractions.length}`);
  console.log(`- Page 1: ${finalData.pages.page1.length} items`);
  console.log(`- Page 2: ${finalData.pages.page2.length} items`);
  console.log(`- Page 3: ${finalData.pages.page3.length} items`);
  console.log(`- Images downloaded: ${downloadedCount}`);
  console.log(`- Data saved to: ${dataPath}`);
}

extractAllTravelData().catch(console.error);