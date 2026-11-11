import puppeteer from 'puppeteer';
import http from 'http';
import path from 'path';
import fs from 'fs';

const PORT = 3388;
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
      { name: 'custom-400', width: 400, height: 800 },
      { name: 'iphone-15-pro-max-430', width: 430, height: 932 },
      { name: 'ipad-768', width: 768, height: 1024 },
      { name: 'desktop-1440', width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      console.log(`\n========================================`);
      console.log(`Testing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });

      // Check stage edge-to-edge metrics
      const report = await page.evaluate(() => {
        const stage = document.getElementById('canvas-stage');
        if (!stage) return { error: 'canvas-stage element not found' };

        const rect = stage.getBoundingClientRect();
        const docScrollWidth = document.documentElement.scrollWidth;
        const windowWidth = window.innerWidth;
        const fillsEdgeToEdge = Math.round(rect.left) === 0 && (Math.round(rect.width) === windowWidth || (windowWidth >= 1440 && Math.round(rect.width) === 1440));

        // Check if any horizontal overflow exists
        const hasHorizontalOverflow = docScrollWidth > windowWidth;

        // Check calculator buttons inside stage
        const dashboard = document.getElementById('dashboard');
        const fridgeBtn = Array.from(dashboard?.querySelectorAll('button') || []).find((b) =>
          b.textContent.includes('Refrigerator Thaw')
        );
        const waterBtn = Array.from(dashboard?.querySelectorAll('button') || []).find((b) =>
          b.textContent.includes('Cold Water Bath')
        );

        let methodsCollide = false;
        let fridgeRect = null;
        let waterRect = null;
        if (fridgeBtn && waterBtn) {
          const rF = fridgeBtn.getBoundingClientRect();
          const rW = waterBtn.getBoundingClientRect();
          fridgeRect = { left: Math.round(rF.left), right: Math.round(rF.right), width: Math.round(rF.width) };
          waterRect = { left: Math.round(rW.left), right: Math.round(rW.right), width: Math.round(rW.width) };
          methodsCollide = rF.right > rW.left;
        }

        // Check timeline dinner selector and bird weight
        const timeline = document.getElementById('timeline');
        const dinnerSelectEl = timeline?.querySelector('select')?.parentElement;
        const birdPillBtn = Array.from(timeline?.querySelectorAll('button') || []).find((b) =>
          b.textContent.includes('lbs')
        );

        let timelinePillsOverlap = false;
        if (dinnerSelectEl && birdPillBtn) {
          const rD = dinnerSelectEl.getBoundingClientRect();
          const rB = birdPillBtn.getBoundingClientRect();
          timelinePillsOverlap = !(rD.right < rB.left || rD.left > rB.right);
        }

        return {
          windowWidth,
          docScrollWidth,
          stageRectLeft: Math.round(rect.left),
          stageRectWidth: Math.round(rect.width),
          stageRectRight: Math.round(rect.right),
          fillsEdgeToEdge,
          hasHorizontalOverflow,
          methodsCollide,
          fridgeRect,
          waterRect,
          timelinePillsOverlap,
          computedZoom: window.getComputedStyle(stage).zoom,
        };
      });

      console.log('Report:', JSON.stringify(report, null, 2));

      // Scroll to dashboard
      const dashboardEl = await page.$('#dashboard');
      if (dashboardEl) {
        await dashboardEl.scrollIntoView();
        await new Promise((r) => setTimeout(r, 400));
        const screenshotPath = path.join(artifactDir, `stage_${vp.name}_sec2_calculator.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`Saved screenshot: ${screenshotPath}`);
      }

      await page.close();
    }

    await browser.close();
  } finally {
    server.close();
    console.log('Server closed successfully.');
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

