import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractConstructionPage() {
  console.log('Connecting to Chrome to extract 준공과정 page content...');
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

  console.log('Navigating to 준공과정 page...');
  await targetPage.goto('https://cromst.seongnam.go.kr:10005/street/streetAtoz', { waitUntil: 'networkidle' });
  await targetPage.waitForTimeout(3000);

  const content = await targetPage.evaluate(() => {
    const result = {};

    // Get main title and subtitle
    const titleEl = document.querySelector('.sub_title, .page-title, h2');
    if (titleEl) result.title = titleEl.textContent.trim();

    const subtitleEl = document.querySelector('.sub_desc, .page-subtitle');
    if (subtitleEl) result.subtitle = subtitleEl.textContent.trim();

    // Extract timeline/process items
    result.timeline = [];

    // Check for timeline structures
    const timelineItems = document.querySelectorAll('.timeline_item, .process_item, .atoz_item, .history_item');
    if (timelineItems.length > 0) {
      timelineItems.forEach(item => {
        const entry = {};

        // Date/Year
        const dateEl = item.querySelector('.date, .year, .timeline_date, .atoz_date');
        if (dateEl) entry.date = dateEl.textContent.trim();

        // Title
        const titleEl = item.querySelector('.title, .atoz_title, .timeline_title, h3, h4');
        if (titleEl) entry.title = titleEl.textContent.trim();

        // Description
        const descEl = item.querySelector('.desc, .description, .atoz_desc, .timeline_desc, p');
        if (descEl) entry.description = descEl.textContent.trim();

        if (entry.date || entry.title) {
          result.timeline.push(entry);
        }
      });
    }

    // Alternative: Look for definition lists or tables
    if (result.timeline.length === 0) {
      const dlElements = document.querySelectorAll('dl');
      dlElements.forEach(dl => {
        const dts = dl.querySelectorAll('dt');
        const dds = dl.querySelectorAll('dd');

        for (let i = 0; i < dts.length; i++) {
          result.timeline.push({
            date: dts[i]?.textContent.trim(),
            description: dds[i]?.textContent.trim()
          });
        }
      });
    }

    // Look for any list structures
    if (result.timeline.length === 0) {
      const listSections = document.querySelectorAll('.content_section, .sub_section, .atoz_section');
      listSections.forEach(section => {
        const items = section.querySelectorAll('li');
        items.forEach(item => {
          const text = item.textContent.trim();
          if (text) {
            // Try to parse date and content
            const match = text.match(/^(\d{4}년.*?)\s*[-:]\s*(.*)$/);
            if (match) {
              result.timeline.push({
                date: match[1],
                description: match[2]
              });
            } else {
              result.timeline.push({ description: text });
            }
          }
        });
      });
    }

    // Extract all text content for analysis
    result.allTexts = [];
    const allTextElements = document.querySelectorAll('.sub_content p, .sub_content li, .sub_content h3, .sub_content h4, .content_area p, .content_area li');
    allTextElements.forEach(el => {
      const text = el.textContent.trim();
      if (text && text.length > 10) {
        result.allTexts.push(text);
      }
    });

    // Extract any images
    result.images = [];
    const images = document.querySelectorAll('.sub_content img, .content_area img');
    images.forEach(img => {
      if (img.src && !img.src.includes('icon') && !img.src.includes('logo')) {
        result.images.push({
          src: img.src,
          alt: img.alt || ''
        });
      }
    });

    return result;
  });

  // Save the extracted content
  const outputPath = path.join(__dirname, 'construction-content.json');
  await fs.writeFile(outputPath, JSON.stringify(content, null, 2));

  console.log('\nExtracted content saved to construction-content.json');
  console.log('Timeline items:', content.timeline?.length || 0);
  console.log('Text elements:', content.allTexts?.length || 0);
  console.log('Images:', content.images?.length || 0);

  // Also log the content for immediate review
  if (content.timeline && content.timeline.length > 0) {
    console.log('\nTimeline content:');
    content.timeline.forEach((item, i) => {
      console.log(`${i + 1}. ${item.date || ''} - ${item.title || ''} ${item.description || ''}`);
    });
  }

  if (content.allTexts && content.allTexts.length > 0) {
    console.log('\nText content found:');
    content.allTexts.forEach((text, i) => {
      console.log(`${i + 1}. ${text.substring(0, 100)}...`);
    });
  }

  return content;
}

extractConstructionPage().catch(console.error);