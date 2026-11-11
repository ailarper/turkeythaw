import puppeteer from 'puppeteer';
import http from 'http';
import path from 'path';
import fs from 'fs';

const PORT = 3355;
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
      { name: 'ipad-768', width: 768, height: 1024 },
      { name: 'desktop-1440', width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      console.log(`\n========================================`);
      console.log(`Testing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });

      // Scroll to dashboard (Section 2)
      const dashboard = await page.$('#dashboard');
      if (dashboard) {
        await dashboard.scrollIntoView();
        await new Promise((r) => setTimeout(r, 400));
      }

      const report = await page.evaluate(() => {
        const dashboardEl = document.getElementById('dashboard');
        const timelineEl = document.getElementById('timeline');

        // Check horizontal document overflow
        const docWidth = document.documentElement.scrollWidth;
        const windowWidth = window.innerWidth;
        const hasHorizontalOverflow = docWidth > windowWidth;

        // Check weight pills
        const weightButtons = Array.from(dashboardEl?.querySelectorAll('button') || []).filter((b) =>
          b.textContent.match(/^\d+\s*lbs$/)
        );

        const weightPillsData = weightButtons.map((b) => {
          const rect = b.getBoundingClientRect();
          return {
            text: b.textContent.trim(),
            rect: { left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) },
          };
        });

        // Check method buttons
        const fridgeBtn = Array.from(dashboardEl?.querySelectorAll('button') || []).find((b) =>
          b.textContent.includes('Refrigerator Thaw')
        );
        const waterBtn = Array.from(dashboardEl?.querySelectorAll('button') || []).find((b) =>
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

        // Check Timeline Dinner selector & bird weight pill
        const dinnerSelectEl = timelineEl?.querySelector('select')?.parentElement;
        const birdPillBtn = Array.from(timelineEl?.querySelectorAll('button') || []).find((b) =>
          b.textContent.includes('lbs')
        );

        let timelinePillsOverlap = false;
        let dinnerRect = null;
        let birdRect = null;
        if (dinnerSelectEl && birdPillBtn) {
          const rD = dinnerSelectEl.getBoundingClientRect();
          const rB = birdPillBtn.getBoundingClientRect();
          dinnerRect = { left: Math.round(rD.left), right: Math.round(rD.right) };
          birdRect = { left: Math.round(rB.left), right: Math.round(rB.right) };
          timelinePillsOverlap = !(rD.right < rB.left || rD.left > rB.right);
        }

        return {
          viewport: { width: windowWidth, height: window.innerHeight },
          hasHorizontalOverflow,
          docWidth,
          weightPillsCount: weightButtons.length,
          weightPillsData,
          methodsCollide,
          fridgeRect,
          waterRect,
          timelinePillsOverlap,
          dinnerRect,
          birdRect,
        };
      });

      console.log('Verification Report:', JSON.stringify(report, null, 2));

      // Capture screenshot of section 2
      const calcScreenshot = path.join(artifactDir, `scaling_${vp.name}_sec2_calculator.png`);
      await page.screenshot({ path: calcScreenshot, fullPage: false });
      console.log(`Saved Section 2 screenshot: ${calcScreenshot}`);

      // Scroll to Section 4
      const timeline = await page.$('#timeline');
      if (timeline) {
        await timeline.scrollIntoView();
        await new Promise((r) => setTimeout(r, 400));
        const timelineScreenshot = path.join(artifactDir, `scaling_${vp.name}_sec4_timeline.png`);
        await page.screenshot({ path: timelineScreenshot, fullPage: false });
        console.log(`Saved Section 4 screenshot: ${timelineScreenshot}`);
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

