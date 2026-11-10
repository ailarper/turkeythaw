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
    // Style root as dark studio stage
    document.documentElement.style.background = '#141312';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.background = '#141312';
    document.body.style.overflow = 'hidden';
    document.body.style.perspective = '1400px';

    const main = document.querySelector('main');
    if (!main) return;
    main.style.willChange = 'transform';
    main.style.transformStyle = 'preserve-3d';
    main.style.boxShadow = '0 30px 100px rgba(0,0,0,0.6)';

    window.__setCamera = function({ scrollY, scale, rotateX, rotateY, focusX, focusY, panX = 0 }) {
      main.style.transformOrigin = `${focusX}px ${focusY}px`;
      main.style.transform = `translate3d(${-panX}px, ${-scrollY}px, 0) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
  });

  // Shot 1: Isometric Hero Reveal
  await page.evaluate(() => {
    window.__setCamera({
      scrollY: 0,
      scale: 1.35,
      rotateX: 8,
      rotateY: -6,
      focusX: 1100,
      focusY: 400
    });
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'scripts/test_shot1_hero.png' });

  // Shot 2: Macro Close-up on Weight & Calculator
  await page.evaluate(() => {
    window.__setCamera({
      scrollY: 1081,
      scale: 1.68,
      rotateX: 6,
      rotateY: 5,
      focusX: 520,
      focusY: 480
    });
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'scripts/test_shot2_weight_macro.png' });

  // Shot 2.5: Section 3 Emergency Protocol Drawer
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('#guide button')).find(b => b.getAttribute('aria-label')?.includes('Morning Panic'));
    if (btn) btn.click();
    window.__setCamera({
      scrollY: 2162,
      scale: 1.45,
      rotateX: 7,
      rotateY: -5,
      focusX: 1350,
      focusY: 550
    });
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'scripts/test_shot2_5_emergency_macro.png' });

  // Shot 3: Macro Pan Across 5-Step Battle Board
  await page.evaluate(() => {
    const sel = document.querySelector('#timeline select');
    if (sel) {
      sel.value = '17:00';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    window.__setCamera({
      scrollY: 3132,
      scale: 1.52,
      rotateX: 10,
      rotateY: -8,
      focusX: 960,
      focusY: 350
    });
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'scripts/test_shot3_battleboard_macro.png' });

  // Shot 4: Clean Studio Finale Pullback
  await page.evaluate(() => {
    window.__setCamera({
      scrollY: 3132,
      scale: 0.92,
      rotateX: 6,
      rotateY: 0,
      focusX: 960,
      focusY: 600
    });
  });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: 'scripts/test_shot4_studio_finale.png' });

  await browser.close();
  console.log('Saved 3D camera test frames.');
}

main().catch(console.error);
