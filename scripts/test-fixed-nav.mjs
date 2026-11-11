import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 800 });

  await page.setContent(`
    <!DOCTYPE html>
    <html style="overflow-x: hidden; margin: 0; padding: 0;">
      <head>
        <style>
          .stage {
            width: 1440px;
            min-width: 1440px;
            zoom: 0.277778;
            background: #f0f0f0;
            height: 3000px;
          }
          .fixed-nav {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 800px;
            height: 60px;
            background: rgba(0,0,0,0.8);
            color: white;
            z-index: 100;
          }
        </style>
      </head>
      <body style="overflow-x: hidden; margin: 0; padding: 0;">
        <div class="stage">
          <div class="fixed-nav" id="nav">Fixed Navbar</div>
          <div style="padding-top: 100px;">Content below</div>
        </div>
      </body>
    </html>
  `);

  const res = await page.evaluate(() => {
    const el = document.getElementById('nav');
    const r0 = el.getBoundingClientRect();
    window.scrollTo(0, 500);
    const r1 = el.getBoundingClientRect();
    return {
      top0: r0.top,
      width0: r0.width,
      top1: r1.top,
      width1: r1.width,
    };
  });
  console.log('Nav rect values:', res);

  await browser.close();
})();
