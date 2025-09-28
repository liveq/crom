import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function connectAndExtract() {
  console.log('Connecting to Chrome on port 9222...');

  // Connect to existing Chrome instance
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  console.log('Connected to Chrome!');

  const contexts = browser.contexts();
  console.log(`Found ${contexts.length} contexts`);

  // Get all pages
  let targetPage = null;
  for (const context of contexts) {
    const pages = context.pages();
    for (const page of pages) {
      const url = page.url();
      console.log(`Page URL: ${url}`);
      if (url.includes('cromst.seongnam.go.kr')) {
        targetPage = page;
        console.log('Found the street page!');
        break;
      }
    }
  }

  if (!targetPage) {
    console.log('신해철 거리 페이지를 찾을 수 없습니다.');
    return;
  }

  console.log('신해철 거리 페이지를 찾았습니다! 데이터 추출 중...');

  // Wait for content to load
  await targetPage.waitForTimeout(2000);

  // Extract map structure
  const mapData = await targetPage.evaluate(() => {
    const results = {
      pageTitle: document.title,
      url: window.location.href,
      images: [],
      clickableAreas: [],
      mapStructure: null,
      svgContent: null,
      canvasInfo: null
    };

    // Find all images
    document.querySelectorAll('img').forEach(img => {
      results.images.push({
        src: img.src,
        alt: img.alt,
        useMap: img.useMap,
        width: img.width,
        height: img.height,
        className: img.className,
        id: img.id
      });
    });

    // Find image map areas
    document.querySelectorAll('area').forEach(area => {
      results.clickableAreas.push({
        shape: area.shape,
        coords: area.coords,
        href: area.href,
        alt: area.alt,
        title: area.title,
        onclick: area.getAttribute('onclick'),
        id: area.id
      });
    });

    // Find map elements
    const mapElement = document.querySelector('map');
    if (mapElement) {
      results.mapStructure = {
        name: mapElement.name,
        id: mapElement.id,
        areas: Array.from(mapElement.areas).map(area => ({
          shape: area.shape,
          coords: area.coords,
          href: area.href,
          alt: area.alt,
          title: area.title,
          onclick: area.getAttribute('onclick')
        }))
      };
    }

    // Check for SVG
    const svg = document.querySelector('svg');
    if (svg) {
      results.svgContent = {
        viewBox: svg.getAttribute('viewBox'),
        width: svg.getAttribute('width'),
        height: svg.getAttribute('height'),
        innerHTML: svg.innerHTML.substring(0, 1000)
      };
    }

    // Check for Canvas
    const canvas = document.querySelector('canvas');
    if (canvas) {
      results.canvasInfo = {
        width: canvas.width,
        height: canvas.height,
        id: canvas.id,
        className: canvas.className
      };
    }

    // Check for Flash or other embedded content
    const embeds = document.querySelectorAll('embed, object');
    results.embeds = Array.from(embeds).map(el => ({
      type: el.type,
      src: el.src || el.data,
      width: el.width,
      height: el.height
    }));

    // Get all divs with background images or onclick handlers
    const interactiveDivs = document.querySelectorAll('div[onclick], div[style*="background"]');
    results.interactiveDivs = [];
    interactiveDivs.forEach(div => {
      const style = window.getComputedStyle(div);
      if (div.onclick || style.backgroundImage !== 'none') {
        results.interactiveDivs.push({
          id: div.id,
          className: div.className,
          onclick: div.getAttribute('onclick'),
          backgroundImage: style.backgroundImage,
          position: {
            top: style.top,
            left: style.left,
            width: style.width,
            height: style.height
          }
        });
      }
    });

    return results;
  });

  console.log('Extracted data:', JSON.stringify(mapData, null, 2));

  // Try to get the page HTML structure
  const pageStructure = await targetPage.evaluate(() => {
    const main = document.querySelector('#wrap, #container, .container, .main-content, .street-map');
    if (main) {
      return main.outerHTML.substring(0, 5000);
    }
    return document.body.innerHTML.substring(0, 5000);
  });

  // Save all data
  const allData = {
    ...mapData,
    pageStructureHTML: pageStructure
  };

  await fs.writeFile(
    path.join(__dirname, 'street-map-data.json'),
    JSON.stringify(allData, null, 2)
  );

  // Take screenshot
  await targetPage.screenshot({
    path: path.join(__dirname, 'street-map-screenshot.png'),
    fullPage: true
  });

  console.log('데이터가 저장되었습니다!');
  console.log('- street-map-data.json');
  console.log('- street-map-screenshot.png');

  // Keep connection for further inspection
  console.log('\n추가 분석을 위해 연결을 유지합니다...');

  // Check for specific street map elements
  const streetMapInfo = await targetPage.evaluate(() => {
    // Look for specific street map container
    const possibleContainers = [
      document.querySelector('.street_map'),
      document.querySelector('#street_map'),
      document.querySelector('[class*="map"]'),
      document.querySelector('[id*="map"]')
    ].filter(Boolean);

    return possibleContainers.map(el => ({
      tagName: el.tagName,
      id: el.id,
      className: el.className,
      innerHTML: el.innerHTML.substring(0, 500)
    }));
  });

  console.log('\nStreet map containers found:', streetMapInfo);
}

connectAndExtract().catch(console.error);