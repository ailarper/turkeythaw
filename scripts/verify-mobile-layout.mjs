import puppeteer from 'puppeteer';
import http from 'http';
import path from 'path';
import fs from 'fs';

const PORT = 3344;
const outDir = path.join(process.cwd(), 'out');
const artifactDir = 'C:/Users/user/.gemini/antigravity/brain/59fe1592-8af6-4b44-bfdf-c54c1552f4b7';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';
    else if (!path.extname(reqPath)) {
      if (fs.existsSync(path.join(outDir, reqPath + '.html'))) {
        reqPath += '.html';
      } else if (fs.existsSync(path.join(outDir, reqPath, 'index.html'))) {
        reqPath = path.join(reqPath, 'index.html');
      }
    }

    const filePath = path.join(outDir, reqPath);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

async function run() {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Static server running on http://localhost:${PORT}/ serving ${outDir}`);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const viewports = [
      { name: 'iphone-se-375', width: 375, height: 812 },
      { name: 'iphone-14-390', width: 390, height: 844 },
      { name: 'iphone-15-pro-max-430', width: 430, height: 932 },
      { name: 'desktop-1440', width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      console.log(`\n========================================`);
      console.log(`Testing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });

      // Scroll to dashboard
      const calcEl = (await page.$('#dashboard')) || (await page.$('#mobile-dashboard')) || (await page.$('#calculator'));
      if (calcEl) {
        await calcEl.scrollIntoView();
        await new Promise(r => setTimeout(r, 400));
      }

      // Check card bounding boxes in dashboard
      const analysis = await page.evaluate(() => {
        const dashboard = document.getElementById('dashboard') || document.getElementById('mobile-dashboard') || document.getElementById('calculator');
        if (!dashboard) return { error: 'dashboard not found' };

        const buttons = Array.from(dashboard.querySelectorAll('button')).map(b => ({
          text: b.textContent.trim(),
          rect: {
            top: b.getBoundingClientRect().top,
            bottom: b.getBoundingClientRect().bottom,
            left: b.getBoundingClientRect().left,
            right: b.getBoundingClientRect().right,
            width: b.getBoundingClientRect().width,
            height: b.getBoundingClientRect().height,
          }
        }));

        const cards = Array.from(dashboard.querySelectorAll('.bg-white.rounded-3xl'));
        const primaryCard = cards[0];
        const prepKit = document.getElementById('prep-kit');

        let isStacked = false;
        let prepKitTop = 0;
        let primaryBottom = 0;
        if (primaryCard && prepKit) {
          const r1 = primaryCard.getBoundingClientRect();
          const r2 = prepKit.getBoundingClientRect();
          prepKitTop = r2.top;
          primaryBottom = r1.bottom;
          isStacked = r2.top >= r1.bottom - 5;
        }

        // Check if refrigerator and cold water buttons are stacked
        const fridgeBtn = buttons.find(b => b.text.includes('Refrigerator Thaw'));
        const waterBtn = buttons.find(b => b.text.includes('Cold Water Bath'));
        let methodsStacked = false;
        let waterTop = 0;
        let fridgeBottom = 0;
        if (fridgeBtn && waterBtn) {
          waterTop = waterBtn.rect.top;
          fridgeBottom = fridgeBtn.rect.bottom;
          methodsStacked = waterBtn.rect.top >= fridgeBtn.rect.bottom - 5;
        }

        // Check weight pills
        const weightPills = buttons.filter(b => b.text.match(/^\d+\s*lbs$/));

        // Check Battle Board
        const battleBoard = document.getElementById('battle-board') || document.getElementById('timeline');
        let battleBoardInfo = null;
        if (battleBoard) {
          const bbCards = Array.from(battleBoard.querySelectorAll('.snap-center'));
          battleBoardInfo = {
            cardCount: bbCards.length,
            cardWidths: bbCards.map(c => Math.round(c.getBoundingClientRect().width)),
          };
        }

        // Check horizontal overflow
        const docWidth = document.documentElement.scrollWidth;
        const windowWidth = window.innerWidth;
        const hasOverflow = docWidth > windowWidth;

        return {
          isPrepKitStacked: isStacked,
          primaryBottom,
          prepKitTop,
          isMethodsStacked: methodsStacked,
          fridgeBottom,
          waterTop,
          weightPillsCount: weightPills.length,
          weightPillWidths: weightPills.map(p => ({ text: p.text, w: Math.round(p.rect.width) })),
          battleBoardInfo,
          hasHorizontalOverflow: hasOverflow,
          docWidth,
          windowWidth
        };
      });

      console.log('Analysis result:', JSON.stringify(analysis, null, 2));

      // Take screenshot of calculator
      const screenshotPath = path.join(artifactDir, `mobile_${vp.name}_calculator.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved screenshot to ${screenshotPath}`);

      await page.close();
    }

    await browser.close();
  } finally {
    server.close();
    console.log('Server closed successfully.');
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
