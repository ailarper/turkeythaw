import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1000));

  const client = await page.target().createCDPSession();

  const t0 = Date.now();
  for (let i = 0; i < 20; i++) {
    const { data } = await client.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 85,
      fromSurface: true
    });
    const buf = Buffer.from(data, 'base64');
  }
  const elapsed = Date.now() - t0;
  console.log(`CDP 20 frames took ${elapsed}ms (${(elapsed / 20).toFixed(1)}ms per frame)`);
  console.log(`CDP Projected 1080 frames: ${(1080 * elapsed / 20 / 1000).toFixed(1)}s`);

  await browser.close();
}

main().catch(console.error);

