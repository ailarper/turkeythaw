import puppeteer from 'puppeteer';
import fs from 'fs';

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1500));

  // Inject motion driver
  await page.evaluate(() => {
    // Stage styling for 3D camera
    document.documentElement.style.background = '#FAF6EE';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.perspective = '1200px';
    document.body.style.background = '#FAF6EE';
    document.body.style.transformOrigin = '50% 50%';
    document.body.style.boxShadow = '0 30px 100px rgba(27,26,24,0.15)';

    // Cursor element
    const cursor = document.createElement('div');
    cursor.id = '__motion_cursor';
    cursor.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 28 28" fill="none" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.35));">
        <path d="M4 2L22 13.5L13.5 15.5L8.5 24.5L4 2Z" fill="#1B1A18" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
      </svg>
      <div id="__motion_ripple" style="
        position: absolute;
        top: 3px;
        left: 4px;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 2.5px solid #EA580C;
        background: rgba(234, 88, 12, 0.25);
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
        pointer-events: none;
      "></div>
    `;
    cursor.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      z-index: 9999999;
      pointer-events: none;
      transform: translate3d(960px, 600px, 0);
      will-change: transform;
    `;
    document.body.appendChild(cursor);

    function easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    window.__triggered = {};

    window.__seekToTime = function(t) {
      // 1. ScrollY
      let scrollY = 0;
      if (t < 3.5) {
        scrollY = 0;
      } else if (t < 5.2) {
        const p = (t - 3.5) / 1.7;
        scrollY = 0 + 1081 * easeInOutCubic(p);
      } else if (t < 8.0) {
        scrollY = 1081;
      } else if (t < 9.4) {
        const p = (t - 8.0) / 1.4;
        scrollY = 1081 + (2162 - 1081) * easeInOutCubic(p);
      } else if (t < 10.9) {
        scrollY = 2162;
      } else if (t < 12.0) {
        const p = (t - 10.9) / 1.1;
        scrollY = 2162 + (3132 - 2162) * easeInOutCubic(p);
      } else if (t < 13.5) {
        scrollY = 3132;
      } else if (t < 15.2) {
        const p = (t - 13.5) / 1.7;
        scrollY = 3132 + (3232 - 3132) * easeInOutCubic(p);
      } else {
        scrollY = 3232;
      }

      window.scrollTo(0, scrollY);

      // 2. Camera Scale & rotateX
      let scale = 1.0;
      let rotateX = 0;

      if (t < 3.0) {
        scale = 1.0 + 0.03 * easeInOutCubic(t / 3.0);
        rotateX = 0;
      } else if (t < 3.5) {
        scale = 1.03;
        rotateX = 0;
      } else if (t < 5.2) {
        const p = (t - 3.5) / 1.7;
        scale = 1.03 - 0.03 * easeInOutCubic(p);
        rotateX = 4.0 * Math.sin(p * Math.PI);
      } else if (t < 8.0) {
        scale = 1.0;
        rotateX = 0;
      } else if (t < 9.4) {
        const p = (t - 8.0) / 1.4;
        scale = 1.0;
        rotateX = 3.5 * Math.sin(p * Math.PI);
      } else if (t < 10.9) {
        scale = 1.0;
        rotateX = 0;
      } else if (t < 12.0) {
        const p = (t - 10.9) / 1.1;
        scale = 1.0;
        rotateX = 3.5 * Math.sin(p * Math.PI);
      } else if (t < 14.5) {
        scale = 1.0;
        rotateX = 0;
      } else if (t < 17.0) {
        const p = (t - 14.5) / 2.5;
        scale = 1.0 - 0.04 * easeInOutCubic(p);
        rotateX = 6.0 * easeInOutCubic(p);
      } else {
        scale = 0.96;
        rotateX = 6.0;
      }

      document.body.style.transform = `scale(${scale.toFixed(4)}) rotateX(${rotateX.toFixed(3)}deg)`;

      // 3. Cursor Position (x, y)
      let cx = 960, cy = 600;
      if (t < 1.0) {
        const p = t / 1.0;
        cx = 960 + (1150 - 960) * easeInOutCubic(p);
        cy = 600 + (350 - 600) * easeInOutCubic(p);
      } else if (t < 2.8) {
        const p = (t - 1.0) / 1.8;
        cx = 1150 + (1358 - 1150) * easeInOutCubic(p);
        cy = 350 + (51 - 350) * easeInOutCubic(p);
      } else if (t < 3.5) {
        cx = 1358; cy = 51;
      } else if (t < 5.2) {
        const p = (t - 3.5) / 1.7;
        cx = 1358 + (854 - 1358) * easeInOutCubic(p);
        cy = 51 + (451 - 51) * easeInOutCubic(p);
      } else if (t < 6.2) {
        cx = 854; cy = 451;
      } else if (t < 7.2) {
        const p = (t - 6.2) / 1.0;
        cx = 854 + (859 - 854) * easeInOutCubic(p);
        cy = 451 + (595 - 451) * easeInOutCubic(p);
      } else if (t < 8.0) {
        cx = 859; cy = 595;
      } else if (t < 9.4) {
        const p = (t - 8.0) / 1.4;
        cx = 859 + (1504 - 859) * easeInOutCubic(p);
        cy = 595 + (497 - 595) * easeInOutCubic(p);
      } else if (t < 10.8) {
        cx = 1504; cy = 497;
      } else if (t < 11.9) {
        const p = (t - 10.8) / 1.1;
        cx = 1504 + (848 - 1504) * easeInOutCubic(p);
        cy = 497 + (281 - 497) * easeInOutCubic(p);
      } else if (t < 13.0) {
        cx = 848; cy = 281;
      } else if (t < 15.5) {
        const p = (t - 13.0) / 2.5;
        cx = 848 + (960 - 848) * easeInOutCubic(p);
        cy = 281 + (920 - 281) * easeInOutCubic(p);
      } else {
        cx = 960; cy = 920;
      }

      cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;

      // 4. Click ripple & Triggers
      const ripple = document.getElementById('__motion_ripple');
      let clickAt = -1;
      if (t >= 3.2 && t < 3.7) clickAt = 3.2;
      else if (t >= 6.0 && t < 6.5) clickAt = 6.0;
      else if (t >= 7.3 && t < 7.8) clickAt = 7.3;
      else if (t >= 9.6 && t < 10.1) clickAt = 9.6;
      else if (t >= 10.8 && t < 11.3) clickAt = 10.8;
      else if (t >= 12.0 && t < 12.5) clickAt = 12.0;

      if (clickAt > 0 && ripple) {
        const rp = (t - clickAt) / 0.4;
        if (rp <= 1) {
          const rScale = rp * 2.2;
          const rOpacity = (1 - rp) * 0.9;
          ripple.style.transform = `translate(-50%, -50%) scale(${rScale.toFixed(2)})`;
          ripple.style.opacity = rOpacity.toFixed(2);
        } else {
          ripple.style.opacity = '0';
        }
      } else if (ripple) {
        ripple.style.opacity = '0';
      }

      // Triggers
      if (t >= 6.0 && !window.__triggered['6.0']) {
        window.__triggered['6.0'] = true;
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '20 lbs');
        if (btn) btn.click();
      }
      if (t >= 7.3 && !window.__triggered['7.3']) {
        window.__triggered['7.3'] = true;
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cold Water Bath'));
        if (btn) btn.click();
      }
      if (t >= 9.6 && !window.__triggered['9.6']) {
        window.__triggered['9.6'] = true;
        const btn = Array.from(document.querySelectorAll('#guide button')).find(b => b.getAttribute('aria-label')?.includes('Morning Panic'));
        if (btn) btn.click();
      }
      if (t >= 10.8 && !window.__triggered['10.8']) {
        window.__triggered['10.8'] = true;
        const closeBtn = document.querySelector('#guide [aria-label="Close drawer"]') || Array.from(document.querySelectorAll('#guide button')).find(b => b.getAttribute('aria-label')?.includes('Morning Panic'));
        if (closeBtn) closeBtn.click();
      }
      if (t >= 12.0 && !window.__triggered['12.0']) {
        window.__triggered['12.0'] = true;
        const sel = document.querySelector('#timeline select');
        if (sel) {
          sel.value = '17:00';
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    };
  });

  const testTimes = [
    { t: 0.0, name: 'frame_0_hero' },
    { t: 3.2, name: 'frame_3_2_hero_click' },
    { t: 6.1, name: 'frame_6_1_weight_20' },
    { t: 7.4, name: 'frame_7_4_cold_water' },
    { t: 9.8, name: 'frame_9_8_emergency_open' },
    { t: 12.1, name: 'frame_12_1_dinner_recalc' },
    { t: 16.5, name: 'frame_16_5_footer_pullback' }
  ];

  for (const item of testTimes) {
    await page.evaluate((t) => window.__seekToTime(t), item.t);
    await new Promise(r => setTimeout(r, 100));
    await page.screenshot({ path: `scripts/${item.name}.png` });
    console.log(`Captured ${item.name} at t=${item.t}s`);
  }

  await browser.close();
  console.log('All test frames captured!');
}

main().catch(console.error);

