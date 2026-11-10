import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    const main = document.querySelector('main');
    document.documentElement.style.background = '#FAF6EE';
    document.body.style.background = '#FAF6EE';
    document.body.style.perspective = '1200px';

    main.style.transformOrigin = '50% 500px'; // center of viewport
    main.style.transform = 'translate3d(0, -1081px, 0) scale(1.0) rotateX(0deg)';
  });

  await page.screenshot({ path: 'scripts/test_main_translate.png' });
  await browser.close();
  console.log('Saved test_main_translate.png');
}

main().catch(console.error);

