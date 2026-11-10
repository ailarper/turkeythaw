import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('main');
  await page.screenshot({ path: 'scripts/hero_preview.png' });
  await browser.close();
  console.log('Saved hero_preview.png');
}

main().catch(console.error);

