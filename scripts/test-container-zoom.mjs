import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 800 });

  await page.setContent(`
    <!DOCTYPE html>
    <html style="margin: 0; padding: 0; overflow-x: hidden;">
      <head>
        <meta name="viewport" content="width=1440, initial-scale=0.25, maximum-scale=5.0, user-scalable=yes">
        <script>
          (function() {
            function update() {
              var w = window.innerWidth;
              var scale = w < 1440 ? (w / 1440) : 1;
              document.documentElement.style.setProperty('--canvas-zoom', scale);
            }
            update();
            window.addEventListener('resize', update);
          })();
        </script>
        <style>
          .canvas-stage {
            width: 1440px;
            min-width: 1440px;
            zoom: var(--canvas-zoom, 1);
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; overflow-x: hidden;">
        <div id="stage" class="canvas-stage" style="background: red; height: 300px;">
          Canvas Stage
        </div>
      </body>
    </html>
  `);

  const res = await page.evaluate(() => {
    const el = document.getElementById('stage');
    return {
      zoom: window.getComputedStyle(el).zoom,
      rectWidth: el.getBoundingClientRect().width,
      docScrollWidth: document.documentElement.scrollWidth,
    };
  });
  console.log('Result with --canvas-zoom CSS variable:', res);
  await browser.close();
})();
