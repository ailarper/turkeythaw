import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    document.documentElement.style.background = '#FAF6EE';
    document.body.style.background = '#FAF6EE';
    document.body.style.perspective = '1200px';

    const footer = document.querySelector('footer');
    footer.style.paddingBottom = '240px'; // ensure dark background extends to bottom

    const main = document.querySelector('main');
    // For pullback, pivot from bottom center
    main.style.transformOrigin = '50% 100%';
    main.style.transform = 'translate3d(0, -3232px, 0) scale(0.96) rotateX(6deg)';
  });

  await page.screenshot({ path: 'scripts/test_footer_pivot.png' });
  await browser.close();
  console.log('Saved test_footer_pivot.png');
}

main().catch(console.error);

