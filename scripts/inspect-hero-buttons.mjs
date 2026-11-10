import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('main');

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a')).map(el => {
      const r = el.getBoundingClientRect();
      return {
        text: el.innerText.replace(/\n/g, ' ').trim(),
        aria: el.getAttribute('aria-label'),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
      };
    }).filter(b => b.rect.y < 1080);
  });

  console.log(JSON.stringify(buttons, null, 2));
  await browser.close();
}

main().catch(console.error);

