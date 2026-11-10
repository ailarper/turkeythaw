import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('main');

  // Inject Cursor & Style
  await page.evaluate(() => {
    // Add cursor element
    const cursor = document.createElement('div');
    cursor.id = '__motion_cursor';
    cursor.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
        <path d="M4 2L22 13.5L13.5 15.5L8.5 24.5L4 2Z" fill="#1B1A18" stroke="white" stroke-width="2" stroke-linejoin="round"/>
      </svg>
      <div id="__motion_ripple" style="
        position: absolute;
        top: 2px;
        left: 4px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #EA580C;
        background: rgba(234, 88, 12, 0.2);
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      "></div>
    `;
    cursor.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      z-index: 999999;
      pointer-events: none;
      transform: translate3d(500px, 400px, 0);
    `;
    document.body.appendChild(cursor);

    // Camera test
    document.documentElement.style.perspective = '1200px';
    document.body.style.transformOrigin = '50% 50%';
    document.body.style.transform = 'scale(0.98) rotateX(4deg)';
    document.body.style.background = '#FAF6EE';
  });

  await page.screenshot({ path: 'scripts/test_motion_frame.png' });
  await browser.close();
  console.log('Saved test_motion_frame.png');
}

main().catch(console.error);

