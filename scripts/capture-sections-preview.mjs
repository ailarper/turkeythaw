import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('main');

  // Section 2
  await page.evaluate(() => window.scrollTo(0, 1081));
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'scripts/sec2_preview.png' });

  // Section 3
  await page.evaluate(() => window.scrollTo(0, 2162));
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'scripts/sec3_preview.png' });

  // Section 4
  await page.evaluate(() => window.scrollTo(0, 3132));
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'scripts/sec4_preview.png' });

  await browser.close();
  console.log('Saved section previews.');
}

main().catch(console.error);

