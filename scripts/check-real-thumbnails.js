import { chromium } from 'playwright';

async function checkRealThumbnails() {
  console.log('Connecting to Chrome to check real thumbnails...');
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
    await targetPage.goto('https://cromst.seongnam.go.kr:10005/street/streetTravel', { waitUntil: 'networkidle' });
  }

  console.log('Extracting thumbnail URLs from page...');

  const thumbnails = await targetPage.evaluate(() => {
    const results = [];

    // Find all images in the travel list
    const images = document.querySelectorAll('.travel_list1 img, .travel_list img, img[src*="travel"]');
    images.forEach(img => {
      if (img.src) {
        results.push({
          src: img.src,
          alt: img.alt,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayed: img.offsetWidth > 0 && img.offsetHeight > 0
        });
      }
    });

    // Check background images
    const elements = document.querySelectorAll('.travel_list1 li, .travel_list li, [style*="background"]');
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const bgImage = style.backgroundImage;
      if (bgImage && bgImage !== 'none' && bgImage.includes('url')) {
        const match = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/);
        if (match) {
          results.push({
            src: match[1],
            type: 'background',
            element: el.className
          });
        }
      }
    });

    // Check inline styles
    const inlineElements = document.querySelectorAll('[style*="background"]');
    inlineElements.forEach(el => {
      const style = el.getAttribute('style');
      if (style) {
        const match = style.match(/background.*url\(['"]?([^'")]+)['"]?\)/);
        if (match) {
          results.push({
            src: match[1],
            type: 'inline-style',
            element: el.className
          });
        }
      }
    });

    return results;
  });

  console.log('\nFound thumbnails:');
  thumbnails.forEach((thumb, index) => {
    console.log(`${index + 1}. ${thumb.src}`);
    if (thumb.displayed !== undefined) {
      console.log(`   Displayed: ${thumb.displayed}, Size: ${thumb.naturalWidth}x${thumb.naturalHeight}`);
    }
  });

  // Try different URL patterns
  const urlPatterns = [
    '/images/content/street_travel/',
    '/images/content/travel/',
    '/images/travel/',
    '/upload/travel/',
    '/upload/street/travel/'
  ];

  console.log('\nTrying different URL patterns...');
  for (const pattern of urlPatterns) {
    const testUrl = `https://cromst.seongnam.go.kr:10005${pattern}img_travel1.jpg`;
    try {
      const response = await targetPage.evaluate(async (url) => {
        try {
          const res = await fetch(url, { method: 'HEAD' });
          return { status: res.status, ok: res.ok, url: url };
        } catch (err) {
          return { error: err.message, url: url };
        }
      }, testUrl);

      console.log(`Pattern ${pattern}: ${response.status || response.error}`);
    } catch (err) {
      console.log(`Pattern ${pattern}: Failed - ${err.message}`);
    }
  }
}

checkRealThumbnails().catch(console.error);