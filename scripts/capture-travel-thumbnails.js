import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureTravelThumbnails() {
  console.log('Starting browser to capture thumbnails...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Create directory
  const imagesDir = path.join(__dirname, '..', 'public', 'attraction-images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Navigate to travel page
  console.log('Navigating to travel page...');
  await page.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel', {
    waitUntil: 'networkidle'
  });
  await page.waitForTimeout(3000);

  let imageIndex = 1;

  // Process 3 pages
  for (let pageNum = 1; pageNum <= 3; pageNum++) {
    console.log(`\n=== Processing Page ${pageNum} ===`);

    // Navigate to specific page if not page 1
    if (pageNum > 1) {
      try {
        // Click on page number
        await page.evaluate((num) => {
          // Try to call go_page function
          if (typeof go_page === 'function') {
            go_page(num);
          } else {
            // Try clicking the page link
            const links = document.querySelectorAll('a');
            for (const link of links) {
              if (link.textContent?.includes(num.toString()) ||
                  link.getAttribute('onclick')?.includes(`go_page(${num})`)) {
                link.click();
                break;
              }
            }
          }
        }, pageNum);

        await page.waitForTimeout(3000);
      } catch (err) {
        console.log(`Could not navigate to page ${pageNum}: ${err.message}`);
      }
    }

    // Find and capture all thumbnails on current page
    const thumbnailSelectors = [
      '.travel_list1 li',
      '.travel_list1 .box',
      '.list_box li',
      'ul.travel_list1 > li'
    ];

    for (const selector of thumbnailSelectors) {
      try {
        const elements = await page.$$(selector);

        if (elements.length > 0) {
          console.log(`Found ${elements.length} items with selector: ${selector}`);

          for (const element of elements) {
            try {
              // Take screenshot of the element
              const outputPath = path.join(imagesDir, `img_travel${imageIndex}.jpg`);

              // Try to find the image within the element first
              const imgElement = await element.$('img');
              if (imgElement) {
                await imgElement.screenshot({ path: outputPath, quality: 80, type: 'jpeg' });
                console.log(`Captured img_travel${imageIndex}.jpg from img element`);
              } else {
                // Capture the whole element if no img found
                await element.screenshot({ path: outputPath, quality: 80, type: 'jpeg' });
                console.log(`Captured img_travel${imageIndex}.jpg from container`);
              }

              imageIndex++;

              if (imageIndex > 18) break; // Max 18 images
            } catch (err) {
              console.log(`Failed to capture element: ${err.message}`);
            }
          }

          break; // Found elements, don't try other selectors
        }
      } catch (err) {
        console.log(`Selector ${selector} failed: ${err.message}`);
      }
    }

    // If no elements found, try to capture visible images directly
    if (imageIndex <= pageNum * 6) {
      console.log('Trying to capture visible images directly...');

      const images = await page.$$('img');
      for (const img of images) {
        try {
          const isVisible = await img.isVisible();
          if (isVisible) {
            const box = await img.boundingBox();
            if (box && box.width > 100 && box.height > 100) {
              const outputPath = path.join(imagesDir, `img_travel${imageIndex}.jpg`);
              await img.screenshot({ path: outputPath, quality: 80, type: 'jpeg' });
              console.log(`Captured img_travel${imageIndex}.jpg directly`);
              imageIndex++;

              if (imageIndex > pageNum * 6) break;
            }
          }
        } catch (err) {
          // Skip errors
        }
      }
    }
  }

  // Fill missing images with placeholder if needed
  while (imageIndex <= 18) {
    console.log(`Creating placeholder for img_travel${imageIndex}.jpg`);

    // Create a simple placeholder image
    await page.setViewportSize({ width: 400, height: 300 });
    await page.setContent(`
      <div style="
        width: 400px;
        height: 300px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        font-weight: bold;
      ">
        관광지 ${imageIndex}
      </div>
    `);

    const outputPath = path.join(imagesDir, `img_travel${imageIndex}.jpg`);
    await page.screenshot({ path: outputPath, quality: 80, type: 'jpeg' });
    imageIndex++;
  }

  console.log('\nCapture complete! Keeping browser open for verification...');
  console.log('You can close the browser when ready.');

  // Keep browser open for manual verification
  await page.waitForTimeout(300000); // 5 minutes
}

captureTravelThumbnails().catch(console.error);