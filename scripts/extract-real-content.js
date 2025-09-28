import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractRealContent() {
  console.log('Connecting to Chrome to extract real content...');
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
    console.log('Page not found. Opening new one...');
    const browser2 = await chromium.launch({ headless: false });
    targetPage = await browser2.newPage();
  }

  const realContent = {};

  // Extract 먹거리 (Food Guide) content
  console.log('Extracting 먹거리 content...');
  await targetPage.goto('https://cromst.seongnam.go.kr:10005/street/food', { waitUntil: 'networkidle' });
  await targetPage.waitForTimeout(2000);

  realContent.food = await targetPage.evaluate(() => {
    const content = {};

    // Extract all text content from the page
    const textElements = document.querySelectorAll('.sub_section p, .sub_section li, .sub_section h3, .sub_section h4');
    content.texts = Array.from(textElements).map(el => el.textContent.trim()).filter(text => text);

    // Extract any contact information
    const contactInfo = document.querySelector('.contact_info');
    if (contactInfo) {
      content.contact = contactInfo.textContent.trim();
    }

    return content;
  });

  // Extract 볼거리 (Attractions) content
  console.log('Extracting 볼거리 content...');
  await targetPage.goto('https://cromst.seongnam.go.kr:10005/street/attractions', { waitUntil: 'networkidle' });
  await targetPage.waitForTimeout(2000);

  realContent.attractions = await targetPage.evaluate(() => {
    const content = {};

    // Extract all text content from the page
    const textElements = document.querySelectorAll('.sub_section p, .sub_section li, .sub_section h3, .sub_section h4');
    content.texts = Array.from(textElements).map(el => el.textContent.trim()).filter(text => text);

    // Extract any contact information
    const contactInfo = document.querySelector('.contact_info');
    if (contactInfo) {
      content.contact = contactInfo.textContent.trim();
    }

    return content;
  });

  // Extract 찾아오시는길 (Directions) content
  console.log('Extracting 찾아오시는길 content...');
  await targetPage.goto('https://cromst.seongnam.go.kr:10005/street/directions', { waitUntil: 'networkidle' });
  await targetPage.waitForTimeout(2000);

  realContent.directions = await targetPage.evaluate(() => {
    const content = {};

    // Extract address
    const addressElements = document.querySelectorAll('.address, .location');
    content.address = Array.from(addressElements).map(el => el.textContent.trim()).filter(text => text);

    // Extract transportation info
    const transportElements = document.querySelectorAll('.transport_info p, .transport_info li');
    content.transportation = Array.from(transportElements).map(el => el.textContent.trim()).filter(text => text);

    // Extract all other text content
    const textElements = document.querySelectorAll('.sub_section p, .sub_section li');
    content.texts = Array.from(textElements).map(el => el.textContent.trim()).filter(text => text);

    return content;
  });

  // Extract 준공과정 (Construction) content
  console.log('Extracting 준공과정 content...');
  await targetPage.goto('https://cromst.seongnam.go.kr:10005/street/construction', { waitUntil: 'networkidle' });
  await targetPage.waitForTimeout(2000);

  realContent.construction = await targetPage.evaluate(() => {
    const content = {};

    // Extract timeline/history information
    const timelineElements = document.querySelectorAll('.timeline_item, .history_item, .process_item');
    content.timeline = Array.from(timelineElements).map(el => el.textContent.trim()).filter(text => text);

    // Extract all text content
    const textElements = document.querySelectorAll('.sub_section p, .sub_section li, .sub_section h3');
    content.texts = Array.from(textElements).map(el => el.textContent.trim()).filter(text => text);

    return content;
  });

  // Save the extracted content
  const outputPath = path.join(__dirname, 'real-content.json');
  await fs.writeFile(outputPath, JSON.stringify(realContent, null, 2));

  console.log('Real content extracted and saved to real-content.json');
  console.log('\nExtracted content summary:');
  console.log('- 먹거리:', realContent.food?.texts?.length || 0, 'text elements');
  console.log('- 볼거리:', realContent.attractions?.texts?.length || 0, 'text elements');
  console.log('- 찾아오시는길:', realContent.directions?.texts?.length || 0, 'text elements');
  console.log('- 준공과정:', realContent.construction?.texts?.length || 0, 'text elements');

  return realContent;
}

extractRealContent().catch(console.error);