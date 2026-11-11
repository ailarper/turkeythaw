import puppeteer from 'puppeteer';
import path from 'path';

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:/Users/user/.gemini/antigravity/brain/59fe1592-8af6-4b44-bfdf-c54c1552f4b7';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching visible Chrome browser for iPhone 15 Pro Max (430x932)...');

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: chromePath,
    defaultViewport: {
      width: 430,
      height: 932,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
    args: [
      '--window-size=480,1050',
      '--window-position=100,50',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
    ],
  });

  const pages = await browser.pages();
  const page = pages.length > 0 ? pages[0] : await browser.newPage();
  await page.setViewport({
    width: 430,
    height: 932,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  console.log('[1/5] Hero section displayed. Pausing 2.5s for inspection...');
  await sleep(2500);

  // Smooth scroll to Section 2 (Thaw Calculator)
  console.log('[2/5] Scrolling down to Section 2 (Thaw Calculator)...');
  await page.evaluate(async () => {
    const el = document.getElementById('dashboard') || document.getElementById('calculator');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await sleep(3000);

  // Interact with Weight Selector
  console.log('  Interacting with weight selector (selecting 20 lbs)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#dashboard button, #calculator button'));
    const btn20 = btns.find((b) => b.textContent.trim().startsWith('20'));
    if (btn20) btn20.click();
  });
  await sleep(2000);

  // Interact with Thawing Method
  console.log('  Interacting with method selector (selecting Cold Water Bath)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#dashboard button, #calculator button'));
    const btnWater = btns.find((b) => b.textContent.includes('Cold Water Bath'));
    if (btnWater) btnWater.click();
  });
  await sleep(2500);

  // Scroll down within Section 2 to USDA Danger Zone & FAQ row
  console.log('[3/5] Scrolling to USDA Danger Zone & Kitchen Rescue Quick-FAQ row...');
  await page.evaluate(() => {
    const dangerZone = Array.from(document.querySelectorAll('h3')).find((h) =>
      h.textContent.includes('Danger Zone')
    );
    if (dangerZone) dangerZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await sleep(3500);

  // Scroll down to Section 4 (Battle Board)
  console.log('[4/5] Scrolling down to Section 4 (Cook-Day Battle Board)...');
  await page.evaluate(() => {
    const el = document.getElementById('timeline') || document.getElementById('battle-board');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await sleep(3000);

  // Horizontal swipe through Battle Board cards
  console.log('[5/5] Performing horizontal swipe across Battle Board milestone cards...');
  const scrollTrack = async (targetIndex) => {
    await page.evaluate((idx) => {
      const container = document.querySelector('.overflow-x-auto');
      if (container) {
        const cards = container.querySelectorAll('.snap-center');
        if (cards[idx]) {
          cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }, targetIndex);
    await sleep(2200);
  };

  // Step 2: Oven Entry
  console.log('  Swiping to Step 2: Oven Entry (325°F)...');
  await scrollTrack(1);

  // Step 3: Leave-in Cable Insertion
  console.log('  Swiping to Step 3: Leave-in Cable Insertion...');
  await scrollTrack(2);

  // Step 4: The 165°F Verification
  console.log('  Swiping to Step 4: The 165°F Verification...');
  await scrollTrack(3);

  // Step 5: The Heavy Lift & Rest
  console.log('  Swiping to Step 5: The Heavy Lift & Rest...');
  await scrollTrack(4);

  // Scroll to FAQ & Footer
  console.log('Scrolling to FAQ accordion and Footer...');
  await page.evaluate(() => {
    const faq = document.getElementById('faq');
    if (faq) faq.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await sleep(3000);

  console.log('Tour completed! Keeping the browser preview open for inspection and recording.');
  console.log('Press Ctrl+C in terminal when finished.');

  // Keep process alive so the user can interact/record
  await new Promise(() => {});
}

run().catch((err) => {
  console.error('Error running mobile preview:', err);
  process.exit(1);
});

