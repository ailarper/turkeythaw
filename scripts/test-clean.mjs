import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'scripts/clean_check.png' });
  await browser.close();
  console.log('Saved clean_check.png');
}

main().catch(console.error);

