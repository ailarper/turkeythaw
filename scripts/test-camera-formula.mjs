import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await page.waitForSelector('main');
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    document.documentElement.style.background = '#141312';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.background = '#141312';
    document.body.style.overflow = 'hidden';
    document.body.style.perspective = '1400px';

    const main = document.querySelector('main');
    main.style.willChange = 'transform';
    main.style.transformStyle = 'preserve-3d';
    main.style.boxShadow = '0 30px 100px rgba(0,0,0,0.7)';
    main.style.transformOrigin = '0 0';

    window.__setCamera3D = function(targetX, targetY, scale, rotX, rotY) {
      main.style.transform = `translate3d(960px, 540px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale}) translate3d(${-targetX}px, ${-targetY}px, 0)`;
    };
  });

  // Test 1: Hero Turkey
  await page.evaluate(() => window.__setCamera3D(1150, 480, 1.35, 8, -6));
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'scripts/camera_shot1_hero.png' });

  // Test 2: Section 2 Weight Selector Close-Up
  await page.evaluate(() => {
    // Click 20 lbs
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '20 lbs');
    if (btn) btn.click();
    window.__setCamera3D(580, 1530, 1.68, 6, 5);
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'scripts/camera_shot2_weight_macro.png' });

  // Test 3: Section 3 Emergency Protocol Drawer Close-Up
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('#guide button')).find(b => b.getAttribute('aria-label')?.includes('Morning Panic'));
    if (btn) btn.click();
    window.__setCamera3D(1450, 2700, 1.48, 7, -6);
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'scripts/camera_shot2_5_emergency_macro.png' });

  // Test 4: Section 4 Battle Board Dinner Time & Cards
  await page.evaluate(() => {
    const sel = document.querySelector('#timeline select');
    if (sel) {
      sel.value = '17:00';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    window.__setCamera3D(960, 3600, 1.45, 10, -7);
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'scripts/camera_shot3_battleboard_macro.png' });

  // Test 5: Studio Finale Pullback
  await page.evaluate(() => {
    window.__setCamera3D(960, 3700, 0.88, 6, 0);
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'scripts/camera_shot4_studio_finale.png' });

  await browser.close();
  console.log('Saved all camera test shots!');
}

main().catch(console.error);

