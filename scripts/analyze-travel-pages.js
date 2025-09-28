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

async function analyzeTravelPages() {
  console.log('Starting browser to analyze travel pages...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const allAttractions = [];
  const allImages = new Set();

  // Try different URL patterns
  const urlPatterns = [
    'https://cromst.seongnam.go.kr:10005/street/streetTravel',
    'https://cromst.seongnam.go.kr:10005/street/streetTravel#go_page1',
    'https://cromst.seongnam.go.kr:10005/street/streetTravel#go_page2',
    'https://cromst.seongnam.go.kr:10005/street/streetTravel#go_page3'
  ];

  for (const url of urlPatterns) {
    console.log(`\nNavigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Try to find and click pagination if exists
    const pageData = await page.evaluate((currentUrl) => {
      const data = {
        url: currentUrl,
        attractions: [],
        images: [],
        pagination: null,
        pageStructure: {}
      };

      // Check for pagination
      const paginationSelectors = [
        '.paging', '.pagination', '[class*="page"]',
        'a[href*="#go_page"]', '[onclick*="go_page"]',
        '.page_num', '.page-link'
      ];

      for (const selector of paginationSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          data.pagination = {
            selector: selector,
            count: elements.length,
            links: Array.from(elements).map(el => ({
              text: el.textContent?.trim(),
              href: el.getAttribute('href'),
              onclick: el.getAttribute('onclick')
            }))
          };
          break;
        }
      }

      // Find travel items with various selectors
      const itemSelectors = [
        '.travel_list1 li',
        '.travel_list1 .box',
        '.list_box li',
        '.travel_item',
        'ul.travel_list1 > li',
        '[class*="travel"] li'
      ];

      let items = [];
      for (const selector of itemSelectors) {
        items = document.querySelectorAll(selector);
        if (items.length > 0) {
          console.log(`Found ${items.length} items with selector: ${selector}`);
          data.pageStructure.itemSelector = selector;
          break;
        }
      }

      // Extract data from items
      items.forEach((item, index) => {
        const link = item.querySelector('a');
        const img = item.querySelector('img');
        const title = item.querySelector('.tit, .title, .desc, h3, h4, strong');

        let imageUrl = '';
        if (img) {
          imageUrl = img.src;
        } else {
          // Check for background image
          const bgElement = item.querySelector('[style*="background"]');
          if (bgElement) {
            const style = bgElement.getAttribute('style');
            const match = style?.match(/url\(['"]?([^'")]+)['"]?\)/);
            if (match) {
              imageUrl = match[1];
            }
          }
        }

        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = 'https://cromst.seongnam.go.kr:10005' + imageUrl;
        }

        const attraction = {
          index: index + 1,
          title: title?.textContent?.trim() || '',
          imageUrl: imageUrl,
          link: link?.getAttribute('href') || '',
          onclick: link?.getAttribute('onclick') || ''
        };

        if (attraction.title || attraction.imageUrl) {
          data.attractions.push(attraction);
          if (imageUrl) data.images.push(imageUrl);
        }
      });

      // Find all images on page
      document.querySelectorAll('img').forEach(img => {
        if (img.src && (img.src.includes('travel') || img.src.includes('img_travel'))) {
          data.images.push(img.src);
        }
      });

      return data;
    }, url);

    console.log(`Page ${url.split('#go_page')[1] || '1'} data:`, pageData);

    // Store unique attractions
    pageData.attractions.forEach(attr => {
      if (!allAttractions.some(a => a.title === attr.title)) {
        allAttractions.push(attr);
      }
    });

    // Store unique images
    pageData.images.forEach(img => allImages.add(img));

    // If we found pagination links, try to click them
    if (pageData.pagination && pageData.pagination.links) {
      for (const link of pageData.pagination.links) {
        if (link.onclick && link.onclick.includes('go_page')) {
          console.log(`Found pagination onclick: ${link.onclick}`);
          try {
            await page.evaluate((onclick) => {
              eval(onclick);
            }, link.onclick);
            await page.waitForTimeout(2000);

            // Extract data after clicking
            const afterClickData = await page.evaluate(() => {
              const items = document.querySelectorAll('.travel_list1 li, .travel_list1 .box');
              return Array.from(items).map(item => {
                const img = item.querySelector('img');
                const title = item.querySelector('.tit, .desc, strong');
                return {
                  title: title?.textContent?.trim(),
                  imageUrl: img?.src
                };
              });
            });

            console.log(`After clicking ${link.text}:`, afterClickData.length, 'items');
            afterClickData.forEach(item => {
              if (item.imageUrl) allImages.add(item.imageUrl);
              if (item.title && !allAttractions.some(a => a.title === item.title)) {
                allAttractions.push(item);
              }
            });
          } catch (err) {
            console.log(`Could not execute onclick: ${err.message}`);
          }
        }
      }
    }
  }

  // Create images directory
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Download all found images
  console.log(`\nFound ${allImages.size} unique images to download`);
  let downloadedCount = 0;
  let imageIndex = 1;

  for (const imageUrl of allImages) {
    if (imageUrl && imageUrl.startsWith('http')) {
      try {
        let filename = imageUrl.split('/').pop().split('?')[0];
        if (!filename.includes('img_travel')) {
          filename = `img_travel${imageIndex}.jpg`;
          imageIndex++;
        }
        const outputPath = path.join(imagesDir, filename);

        await downloadFile(imageUrl, outputPath);
        downloadedCount++;
        console.log(`Downloaded: ${filename}`);
      } catch (err) {
        console.error(`Failed to download ${imageUrl}: ${err.message}`);
      }
    }
  }

  // Save all attractions data
  const dataPath = path.join(__dirname, 'all-travel-data.json');
  await fs.writeFile(dataPath, JSON.stringify({
    total: allAttractions.length,
    attractions: allAttractions,
    images: Array.from(allImages)
  }, null, 2));

  console.log(`\nAnalysis complete!`);
  console.log(`- Total attractions found: ${allAttractions.length}`);
  console.log(`- Total images downloaded: ${downloadedCount}`);
  console.log(`- Data saved to: ${dataPath}`);

  // Keep browser open for manual inspection
  console.log('\nKeeping browser open for manual inspection...');
  console.log('You can manually navigate through pages to verify.');
}

analyzeTravelPages().catch(console.error);