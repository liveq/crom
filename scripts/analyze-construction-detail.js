import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeConstructionDetail() {
  console.log('Connecting to Chrome for detailed analysis...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');

  const contexts = browser.contexts();
  let targetPage = null;

  for (const context of contexts) {
    const pages = context.pages();
    for (const page of pages) {
      const url = page.url();
      if (url.includes('cromst.seongnam.go.kr')) {
        targetPage = page;
        break;
      }
    }
  }

  if (!targetPage) {
    console.log('Opening new page...');
    const browser2 = await chromium.launch({ headless: false });
    targetPage = await browser2.newPage();
  }

  console.log('Navigating to construction page...');
  await targetPage.goto('https://cromst.seongnam.go.kr:10005/street/streetAtoz', { waitUntil: 'networkidle' });
  await targetPage.waitForTimeout(3000);

  // Inject console logging
  await targetPage.evaluate(() => {
    console.log('==== PAGE STRUCTURE ANALYSIS ====');

    // Find main container
    const mainContainer = document.querySelector('.sub_section, .atoz_container, .content_area');
    console.log('Main container:', mainContainer?.className);

    // Find section buttons/tabs
    const sectionButtons = document.querySelectorAll('button, .tab, .section_btn, [onclick]');
    console.log(`Found ${sectionButtons.length} interactive buttons`);

    sectionButtons.forEach((btn, i) => {
      console.log(`Button ${i}: text="${btn.textContent.trim()}", onclick="${btn.getAttribute('onclick')}"`);
    });

    // Find image containers
    const imageContainers = document.querySelectorAll('.img_box, .photo_area, .slide_container, .gallery');
    console.log(`Found ${imageContainers.length} image containers`);

    // Find navigation arrows
    const navButtons = document.querySelectorAll('.prev, .next, .arrow, [class*="btn_prev"], [class*="btn_next"]');
    console.log(`Found ${navButtons.length} navigation buttons`);
  });

  // Analyze the interactive structure
  const structure = await targetPage.evaluate(() => {
    const result = {
      sections: [],
      navigation: {},
      images: {},
      layout: {}
    };

    // Analyze section structure
    const sections = document.querySelectorAll('[class*="section"], [class*="area"], .tab_content');
    sections.forEach((section, i) => {
      const sectionData = {
        index: i,
        className: section.className,
        images: []
      };

      // Find images in this section
      const images = section.querySelectorAll('img');
      images.forEach(img => {
        if (img.src) {
          sectionData.images.push({
            src: img.src,
            alt: img.alt,
            width: img.width,
            height: img.height
          });
        }
      });

      result.sections.push(sectionData);
    });

    // Check for slideshow/carousel functionality
    const slideshow = document.querySelector('.slideshow, .carousel, .slider, [class*="slide"]');
    if (slideshow) {
      result.navigation.hasSlideshow = true;
      result.navigation.slideshowClass = slideshow.className;
    }

    // Check for thumbnail navigation
    const thumbnails = document.querySelectorAll('.thumb, .thumbnail, [class*="thumb"]');
    if (thumbnails.length > 0) {
      result.navigation.hasThumbnails = true;
      result.navigation.thumbnailCount = thumbnails.length;
    }

    // Get layout details
    const mainContent = document.querySelector('.sub_content, .content_area, main');
    if (mainContent) {
      const styles = window.getComputedStyle(mainContent);
      result.layout = {
        width: styles.width,
        padding: styles.padding,
        display: styles.display
      };
    }

    return result;
  });

  console.log('\n==== STRUCTURE ANALYSIS ====');
  console.log('Sections found:', structure.sections.length);
  console.log('Has slideshow:', structure.navigation.hasSlideshow);
  console.log('Has thumbnails:', structure.navigation.hasThumbnails);

  // Try clicking through sections to understand interaction
  console.log('\n==== TESTING INTERACTIONS ====');

  // Look for area/section buttons
  const buttons = await targetPage.$$('button, [onclick], .tab_btn');
  console.log(`Found ${buttons.length} clickable elements`);

  for (let i = 0; i < Math.min(buttons.length, 5); i++) {
    try {
      const text = await buttons[i].textContent();
      console.log(`\nClicking button ${i}: "${text?.trim()}"`);

      await buttons[i].click();
      await targetPage.waitForTimeout(1500);

      // Check what changed
      const visibleImages = await targetPage.evaluate(() => {
        const imgs = document.querySelectorAll('img:not([style*="display: none"])');
        return Array.from(imgs).map(img => ({
          src: img.src.split('/').pop(),
          visible: img.offsetParent !== null
        }));
      });

      console.log(`Visible images after click:`, visibleImages.length);
    } catch (err) {
      console.log(`Could not click button ${i}: ${err.message}`);
    }
  }

  // Extract the actual implementation details
  const implementation = await targetPage.evaluate(() => {
    const details = {
      containerStructure: '',
      buttonTypes: [],
      imageDisplay: '',
      navigationMethod: ''
    };

    // Get main container structure
    const container = document.querySelector('.sub_content, .atoz_wrap, .content_wrap');
    if (container) {
      details.containerStructure = container.innerHTML.substring(0, 500);
    }

    // Identify button implementation
    const btns = document.querySelectorAll('button, [onclick]');
    btns.forEach(btn => {
      if (btn.onclick || btn.getAttribute('onclick')) {
        details.buttonTypes.push({
          text: btn.textContent.trim(),
          onclick: btn.getAttribute('onclick') || 'has event listener'
        });
      }
    });

    // Check image display method
    const imgContainers = document.querySelectorAll('[class*="img"], [class*="photo"]');
    if (imgContainers.length > 0) {
      details.imageDisplay = imgContainers[0].className;
    }

    return details;
  });

  // Save detailed analysis
  const outputPath = path.join(__dirname, 'construction-detailed-analysis.json');
  await fs.writeFile(outputPath, JSON.stringify({
    structure,
    implementation,
    timestamp: new Date().toISOString()
  }, null, 2));

  console.log('\n==== ANALYSIS COMPLETE ====');
  console.log('Saved to construction-detailed-analysis.json');

  return { structure, implementation };
}

analyzeConstructionDetail().catch(console.error);