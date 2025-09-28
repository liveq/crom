import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractMapData() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const page = await browser.newPage();

  console.log('Navigating to cromst.seongnam.go.kr...');
  await page.goto('https://cromst.seongnam.go.kr/main/main.htm', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // Wait for map to load
  await page.waitForTimeout(3000);

  // Try to find the map container
  const mapData = await page.evaluate(() => {
    const results = {
      svgElements: [],
      imageMapAreas: [],
      canvasElements: [],
      clickableElements: [],
      backgroundImages: []
    };

    // Check for SVG elements
    const svgs = document.querySelectorAll('svg');
    svgs.forEach(svg => {
      results.svgElements.push({
        id: svg.id,
        className: svg.className.baseVal,
        innerHTML: svg.innerHTML.substring(0, 200)
      });
    });

    // Check for image maps
    const areas = document.querySelectorAll('area');
    areas.forEach(area => {
      results.imageMapAreas.push({
        coords: area.coords,
        shape: area.shape,
        href: area.href,
        alt: area.alt,
        title: area.title
      });
    });

    // Check for canvas elements
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      results.canvasElements.push({
        id: canvas.id,
        width: canvas.width,
        height: canvas.height,
        className: canvas.className
      });
    });

    // Find clickable divs with background images
    const allDivs = document.querySelectorAll('div[onclick], div[style*="cursor: pointer"]');
    allDivs.forEach(div => {
      const style = window.getComputedStyle(div);
      if (style.backgroundImage && style.backgroundImage !== 'none') {
        results.clickableElements.push({
          id: div.id,
          className: div.className,
          backgroundImage: style.backgroundImage,
          onclick: div.getAttribute('onclick'),
          position: {
            top: style.top,
            left: style.left,
            width: style.width,
            height: style.height
          }
        });
      }
    });

    // Check for main map image
    const imgs = document.querySelectorAll('img[usemap], img[src*="map"]');
    imgs.forEach(img => {
      results.backgroundImages.push({
        src: img.src,
        usemap: img.useMap,
        alt: img.alt,
        width: img.width,
        height: img.height
      });
    });

    return results;
  });

  console.log('Map data extracted:', mapData);

  // Save the data
  await fs.writeFile(
    path.join(__dirname, 'map-data.json'),
    JSON.stringify(mapData, null, 2)
  );

  // Take screenshot of the map
  await page.screenshot({
    path: path.join(__dirname, 'map-screenshot.png'),
    fullPage: true
  });

  // Try to extract specific map structure
  const mapStructure = await page.evaluate(() => {
    // Look for the main content area
    const mainContent = document.querySelector('#contents, .contents, .map-container, .street-map');
    if (mainContent) {
      return {
        found: true,
        html: mainContent.innerHTML.substring(0, 1000),
        id: mainContent.id,
        className: mainContent.className
      };
    }
    return { found: false };
  });

  console.log('Map structure:', mapStructure);

  // Check for Flash content (old technology)
  const flashContent = await page.evaluate(() => {
    const embeds = document.querySelectorAll('embed, object');
    return Array.from(embeds).map(el => ({
      type: el.type,
      src: el.src || el.data,
      width: el.width,
      height: el.height
    }));
  });

  console.log('Flash/Embed content:', flashContent);

  await browser.close();
  console.log('Data saved to map-data.json and map-screenshot.png');
}

extractMapData().catch(console.error);