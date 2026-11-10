import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const TOTAL_DURATION_SEC = 18.0;
const FPS = 60;
const TOTAL_FRAMES = Math.round(TOTAL_DURATION_SEC * FPS); // 1080 frames
const WIDTH = 1920;
const HEIGHT = 1080;

const OUTPUT_DIR = path.resolve('public/exports');
const OUTPUT_VIDEO = path.join(OUTPUT_DIR, 'turkeythaw-motion-16x9.mp4');
const OUTPUT_POSTER = path.join(OUTPUT_DIR, 'turkeythaw-motion-16x9.jpg');

const MUSIC_PATH = path.resolve('tools/brag/skills/brag/assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3');
const SFX = {
  click1: path.resolve('tools/brag/skills/brag/assets/sfx/interface/click_001.ogg'),
  switch1: path.resolve('tools/brag/skills/brag/assets/sfx/interface/switch_001.ogg'),
  click2: path.resolve('tools/brag/skills/brag/assets/sfx/interface/click_002.ogg'),
  drop1: path.resolve('tools/brag/skills/brag/assets/sfx/interface/drop_001.ogg'),
  drop2: path.resolve('tools/brag/skills/brag/assets/sfx/interface/drop_002.ogg'),
  click3: path.resolve('tools/brag/skills/brag/assets/sfx/interface/click_003.ogg'),
  bong1: path.resolve('tools/brag/skills/brag/assets/sfx/interface/bong_001.ogg'),
};

async function main() {
  console.log('=== TurkeyThaw 16:9 True 3D Camera Motion Recording Reel ===');
  console.log(`Duration: ${TOTAL_DURATION_SEC}s @ ${FPS} FPS (${TOTAL_FRAMES} frames)`);
  console.log(`Resolution: ${WIDTH}x${HEIGHT} (16:9 widescreen)`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. Launch Puppeteer Headless Chrome
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--force-device-scale-factor=1',
      '--font-render-hinting=none',
      '--enable-font-antialiasing'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await page.waitForSelector('main');
  await new Promise(r => setTimeout(r, 1500));
  console.log('Page ready.');

  // 2. Inject 3D Camera Rig & High-End Simulated Cursor
  await page.evaluate(() => {
    // Style root as dark studio stage with 3D perspective
    document.documentElement.style.background = '#141312';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.background = '#141312';
    document.body.style.overflow = 'hidden';
    document.body.style.perspective = '1400px';

    const main = document.querySelector('main');
    if (!main) return;
    main.style.willChange = 'transform';
    main.style.transformStyle = 'preserve-3d';
    main.style.boxShadow = '0 30px 100px rgba(0,0,0,0.7)';
    main.style.transformOrigin = '0 0';

    // Simulated cursor
    const cursor = document.createElement('div');
    cursor.id = '__motion_cursor';
    cursor.innerHTML = `
      <svg width="34" height="34" viewBox="0 0 28 28" fill="none" style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));">
        <path d="M4 2L22 13.5L13.5 15.5L8.5 24.5L4 2Z" fill="#1B1A18" stroke="#FFFFFF" stroke-width="2.2" stroke-linejoin="round"/>
      </svg>
      <div id="__motion_ripple" style="
        position: absolute;
        top: 3px;
        left: 4px;
        width: 46px;
        height: 46px;
        border-radius: 50%;
        border: 2.5px solid #EA580C;
        background: rgba(234, 88, 12, 0.35);
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
      transform: translate3d(960px, 540px, 0);
      will-change: transform;
    `;
    document.body.appendChild(cursor);

    function easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function lerp(a, b, p) {
      return a + (b - a) * p;
    }

    window.__triggered = {};

    window.__seekToTime = function(t) {
      let targetX = 960;
      let targetY = 540;
      let scale = 1.0;
      let rotX = 0;
      let rotY = 0;

      let cx = 960;
      let cy = 540;

      // -------------------------------------------------------------
      // Shot 1 (0.0s – 3.5s) | Isometric Hero Reveal
      // -------------------------------------------------------------
      if (t < 2.2) {
        const p = easeInOutCubic(t / 2.2);
        targetX = lerp(1200, 960, p);
        targetY = lerp(420, 620, p);
        scale = 1.35;
        rotX = 8.0;
        rotY = -6.0;

        cx = lerp(1100, 960, p);
        cy = lerp(500, 540, p);
      } else if (t < 3.5) {
        const p = easeInOutCubic((t - 2.2) / 1.3);
        targetX = lerp(960, 1358, p);
        targetY = lerp(620, 180, p);
        scale = lerp(1.35, 1.25, p);
        rotX = lerp(8.0, 5.0, p);
        rotY = lerp(-6.0, -3.0, p);

        cx = lerp(960, 960, p);
        cy = lerp(540, 540, p);
      }
      // -------------------------------------------------------------
      // Shot 2 (3.5s – 7.8s) | Macro Close-Up on Weight & Method
      // -------------------------------------------------------------
      else if (t < 4.8) {
        const p = easeInOutCubic((t - 3.5) / 1.3);
        targetX = lerp(1358, 580, p);
        targetY = lerp(180, 1530, p);
        scale = lerp(1.25, 1.68, p);
        rotX = lerp(5.0, 6.0, p);
        rotY = lerp(-3.0, 5.0, p);

        cx = 960;
        cy = 540;
      } else if (t < 6.4) {
        // Tight focus on Turkey Weight track
        targetX = 580;
        targetY = 1530;
        scale = 1.68;
        rotX = 6.0;
        rotY = 5.0;

        cx = 960;
        cy = 540;
      } else if (t < 7.8) {
        // Pan down to Cold Water Bath & Start Thawing
        const p = easeInOutCubic((t - 6.4) / 1.4);
        targetX = 580;
        targetY = lerp(1530, 1720, p);
        scale = 1.68;
        rotX = 6.0;
        rotY = 5.0;

        cx = 960;
        cy = 540;
      }
      // -------------------------------------------------------------
      // Transition & Section 3 Showcase (7.8s – 9.8s) | Full-Column Drawer
      // -------------------------------------------------------------
      else if (t < 8.5) {
        const p = easeInOutCubic((t - 7.8) / 0.7);
        targetX = lerp(580, 1350, p);
        targetY = lerp(1720, 2620, p);
        scale = lerp(1.68, 1.48, p);
        rotX = lerp(6.0, 7.0, p);
        rotY = lerp(5.0, -5.0, p);

        cx = 960;
        cy = 540;
      } else if (t < 9.8) {
        targetX = 1350;
        targetY = 2620;
        scale = 1.48;
        rotX = 7.0;
        rotY = -5.0;

        if (t < 9.4) {
          cx = 960;
          cy = 540;
        } else {
          // Move cursor to close button [X]
          const p = easeInOutCubic((t - 9.4) / 0.4);
          cx = lerp(960, 1150, p);
          cy = lerp(540, 420, p);
        }
      }
      // -------------------------------------------------------------
      // Shot 3 (9.8s – 14.0s) | Macro Pan Across 5-Step Battle Board
      // -------------------------------------------------------------
      else if (t < 10.8) {
        const p = easeInOutCubic((t - 9.8) / 1.0);
        targetX = lerp(1350, 850, p);
        targetY = lerp(2620, 3400, p);
        scale = lerp(1.48, 1.52, p);
        rotX = lerp(7.0, 10.0, p);
        rotY = lerp(-5.0, -8.0, p);

        cx = 960;
        cy = 540;
      } else if (t < 12.0) {
        // Dinner Time switch to 5:00 PM
        targetX = 850;
        targetY = 3400;
        scale = 1.52;
        rotX = 10.0;
        rotY = -8.0;

        cx = 960;
        cy = 540;
      } else if (t < 14.0) {
        // Macro pan across all 5 Cook-Day Battle Board cards
        const p = easeInOutCubic((t - 12.0) / 2.0);
        targetX = lerp(350, 1550, p);
        targetY = 3560;
        scale = 1.52;
        rotX = 10.0;
        rotY = -8.0;

        cx = lerp(850, 1200, p);
        cy = 540;
      }
      // -------------------------------------------------------------
      // Shot 4 (14.0s – 18.0s) | Clean Studio Finale
      // -------------------------------------------------------------
      else if (t < 16.5) {
        const p = easeInOutCubic((t - 14.0) / 2.5);
        targetX = lerp(1550, 960, p);
        targetY = lerp(3560, 3720, p);
        scale = lerp(1.52, 0.90, p);
        rotX = lerp(10.0, 6.0, p);
        rotY = lerp(-8.0, 0.0, p);

        cx = lerp(1200, 960, p);
        cy = lerp(540, 840, p);
      } else {
        // Final Freeze Frame
        targetX = 960;
        targetY = 3720;
        scale = 0.90;
        rotX = 6.0;
        rotY = 0.0;

        cx = 960;
        cy = 840;
      }

      // Apply True 3D Camera Transformation
      main.style.transform = `translate3d(960px, 540px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(4)}) translate3d(${-targetX.toFixed(1)}px, ${-targetY.toFixed(1)}px, 0)`;

      // Position simulated cursor
      cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;

      // -------------------------------------------------------------
      // Click Ripple & Sound Cues Timestamps
      // -------------------------------------------------------------
      const ripple = document.getElementById('__motion_ripple');
      let clickAt = -1;
      if (t >= 3.2 && t < 3.7) clickAt = 3.2;      // Hero "Plan dinner ->"
      else if (t >= 5.8 && t < 6.3) clickAt = 5.8; // Weight 20 lbs
      else if (t >= 7.0 && t < 7.5) clickAt = 7.0; // Cold Water Bath
      else if (t >= 8.5 && t < 9.0) clickAt = 8.5; // Emergency Card 1 open
      else if (t >= 9.5 && t < 10.0) clickAt = 9.5;// Emergency Card 1 close
      else if (t >= 10.8 && t < 11.3) clickAt = 10.8;// Dinner Time to 5:00 PM

      if (clickAt > 0 && ripple) {
        const rp = (t - clickAt) / 0.4;
        if (rp <= 1) {
          const rScale = rp * 2.2;
          const rOpacity = (1 - rp) * 0.95;
          ripple.style.transform = `translate(-50%, -50%) scale(${rScale.toFixed(2)})`;
          ripple.style.opacity = rOpacity.toFixed(2);
        } else {
          ripple.style.opacity = '0';
        }
      } else if (ripple) {
        ripple.style.opacity = '0';
      }

      // -------------------------------------------------------------
      // Timed Interactive State Triggers
      // -------------------------------------------------------------
      if (t >= 5.8 && !window.__triggered['5.8']) {
        window.__triggered['5.8'] = true;
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '20 lbs');
        if (btn) btn.click();
      }
      if (t >= 7.0 && !window.__triggered['7.0']) {
        window.__triggered['7.0'] = true;
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cold Water Bath'));
        if (btn) btn.click();
      }
      if (t >= 8.5 && !window.__triggered['8.5']) {
        window.__triggered['8.5'] = true;
        const btn = Array.from(document.querySelectorAll('#guide button')).find(b => b.getAttribute('aria-label')?.includes('Morning Panic'));
        if (btn) btn.click();
      }
      if (t >= 9.5 && !window.__triggered['9.5']) {
        window.__triggered['9.5'] = true;
        const closeBtn = document.querySelector('#guide [aria-label="Close drawer"]') || Array.from(document.querySelectorAll('#guide button')).find(b => b.getAttribute('aria-label')?.includes('Morning Panic'));
        if (closeBtn) closeBtn.click();
      }
      if (t >= 10.8 && !window.__triggered['10.8']) {
        window.__triggered['10.8'] = true;
        const sel = document.querySelector('#timeline select');
        if (sel) {
          sel.value = '17:00';
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    };
  });

  // 3. Setup FFmpeg Process with Synchronized Audio Mix
  console.log('Spawning FFmpeg encoder process...');
  const filterComplex = [
    `[1:a]atrim=0:18,asetpts=PTS-STARTPTS,afade=t=in:ss=0:d=1.5,afade=t=out:st=16.5:d=1.5,volume=0.35[bgm];`,
    `[2:a]adelay=3200|3200,volume=0.85[sfx1];`,
    `[3:a]adelay=5800|5800,volume=0.90[sfx2];`,
    `[4:a]adelay=7000|7000,volume=0.90[sfx3];`,
    `[5:a]adelay=8500|8500,volume=0.90[sfx4];`,
    `[6:a]adelay=9500|9500,volume=0.80[sfx5];`,
    `[7:a]adelay=10800|10800,volume=0.90[sfx6];`,
    `[8:a]adelay=16500|16500,volume=0.85[sfx7];`,
    `[bgm][sfx1][sfx2][sfx3][sfx4][sfx5][sfx6][sfx7]amix=inputs=8:duration=first:dropout_transition=2[aout]`
  ].join('');

  const ffmpegArgs = [
    '-f', 'image2pipe',
    '-framerate', String(FPS),
    '-i', '-',
    '-i', MUSIC_PATH,
    '-i', SFX.click1,
    '-i', SFX.switch1,
    '-i', SFX.click2,
    '-i', SFX.drop1,
    '-i', SFX.drop2,
    '-i', SFX.click3,
    '-i', SFX.bong1,
    '-filter_complex', filterComplex,
    '-map', '0:v',
    '-map', '[aout]',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '17',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-t', String(TOTAL_DURATION_SEC),
    '-y', OUTPUT_VIDEO
  ];

  const ffmpeg = spawn('ffmpeg', ffmpegArgs);

  ffmpeg.stderr.on('data', d => {
    const msg = d.toString();
    if (msg.includes('Error') || msg.includes('fatal')) {
      console.error('FFmpeg stderr:', msg.trim());
    }
  });

  const ffmpegFinished = new Promise((resolve, reject) => {
    ffmpeg.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with error code ${code}`));
    });
  });

  // 4. Capture Frames Deterministically at 60 FPS
  console.log(`Starting deterministic 3D camera capture of ${TOTAL_FRAMES} frames...`);
  const startTime = Date.now();

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const t = frame / FPS;

    await page.evaluate((currT) => window.__seekToTime(currT), t);

    const frameBuf = await page.screenshot({
      type: 'jpeg',
      quality: 92
    });

    // Save poster image on final freeze frame
    if (frame === TOTAL_FRAMES - 1) {
      fs.writeFileSync(OUTPUT_POSTER, frameBuf);
      console.log(`Saved poster image: ${OUTPUT_POSTER}`);
    }

    // Stream buffer to FFmpeg stdin with backpressure handling
    const canWrite = ffmpeg.stdin.write(frameBuf);
    if (!canWrite) {
      await new Promise(r => ffmpeg.stdin.once('drain', r));
    }

    if (frame % 60 === 0 || frame === TOTAL_FRAMES - 1) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const pct = ((frame / TOTAL_FRAMES) * 100).toFixed(1);
      const fpsReal = (frame / ((Date.now() - startTime) / 1000)).toFixed(1);
      console.log(`Frame ${frame}/${TOTAL_FRAMES} (${pct}%) | t=${t.toFixed(2)}s | Elapsed: ${elapsed}s (${fpsReal} fps)`);
    }
  }

  console.log('All 3D frames captured! Closing FFmpeg stdin and finishing encoding...');
  ffmpeg.stdin.end();

  await ffmpegFinished;
  console.log(`FFmpeg encoding complete! Output saved to: ${OUTPUT_VIDEO}`);

  await browser.close();
  console.log('=== True 3D Camera Motion Recording Completed Successfully! ===');
}

main().catch(err => {
  console.error('Recording failed:', err);
  process.exit(1);
});
