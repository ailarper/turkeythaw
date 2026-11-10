import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const TOTAL_DURATION_SEC = 18.0;
const FPS = 60;
const TOTAL_FRAMES = Math.round(TOTAL_DURATION_SEC * FPS); // 1080 frames

const ROOT_DIR = path.resolve('.');
const OUTPUT_DIR = path.resolve('public/exports');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Subtle click audio assets only (no stock music!)
const SFX_CLICK1 = path.resolve('tools/brag/skills/brag/assets/sfx/interface/click_001.ogg');
const SFX_CLICK2 = path.resolve('tools/brag/skills/brag/assets/sfx/interface/click_002.ogg');

function buildFfmpegArgs(outputVideo) {
  const filterComplex = [
    `[1:a]volume=0[silent];`,
    `[2:a]adelay=3000|3000,volume=0.15[sfx1];`,
    `[3:a]adelay=4800|4800,volume=0.15[sfx2];`,
    `[2:a]adelay=6000|6000,volume=0.15[sfx3];`,
    `[3:a]adelay=9600|9600,volume=0.15[sfx4];`,
    `[2:a]adelay=11200|11200,volume=0.15[sfx5];`,
    `[silent][sfx1][sfx2][sfx3][sfx4][sfx5]amix=inputs=6:duration=first[aout]`
  ].join('');

  return [
    '-f', 'image2pipe',
    '-framerate', String(FPS),
    '-i', '-',
    '-f', 'lavfi',
    '-t', String(TOTAL_DURATION_SEC),
    '-i', 'anullsrc=r=48000:cl=stereo',
    '-i', SFX_CLICK1,
    '-i', SFX_CLICK2,
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
    '-y', outputVideo
  ];
}

async function renderReel(browser, { name, mode, width, height, outputVideo, outputPoster, rootVideoCopy, rootPosterCopy }) {
  console.log(`\n======================================================`);
  console.log(`Starting Render: ${name}`);
  console.log(`Format: ${width}x${height} (${mode}) @ ${FPS} FPS (${TOTAL_FRAMES} frames)`);
  console.log(`Output: ${outputVideo}`);
  console.log(`======================================================`);

  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });

  const url = `http://localhost:3000/reel?mode=${mode}`;
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof window.__setReelTime === 'function');
  await new Promise(r => setTimeout(r, 1500));
  console.log('Page ready and real website mounted inside stage.');

  const ffmpegArgs = buildFfmpegArgs(outputVideo);
  const ffmpeg = spawn('ffmpeg', ffmpegArgs);

  ffmpeg.stderr.on('data', d => {
    const msg = d.toString();
    if (msg.includes('Error') || msg.includes('fatal')) {
      console.error(`[${name} FFmpeg Error]:`, msg.trim());
    }
  });

  const ffmpegFinished = new Promise((resolve, reject) => {
    ffmpeg.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with error code ${code}`));
    });
  });

  console.log(`Capturing ${TOTAL_FRAMES} frames deterministically...`);
  const startTime = Date.now();

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const t = frame / FPS;

    await page.evaluate((currT) => window.__setReelTime(currT), t);

    const frameBuf = await page.screenshot({
      type: 'jpeg',
      quality: 92
    });

    // Save poster image on final frame
    if (frame === TOTAL_FRAMES - 1) {
      fs.writeFileSync(outputPoster, frameBuf);
      if (rootPosterCopy) fs.writeFileSync(rootPosterCopy, frameBuf);
      console.log(`Saved poster image: ${outputPoster}`);
    }

    // Write to FFmpeg stdin with backpressure drain handling
    const canWrite = ffmpeg.stdin.write(frameBuf);
    if (!canWrite) {
      await new Promise(r => ffmpeg.stdin.once('drain', r));
    }

    if (frame % 120 === 0 || frame === TOTAL_FRAMES - 1) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const pct = ((frame / TOTAL_FRAMES) * 100).toFixed(1);
      const fpsReal = (frame / ((Date.now() - startTime) / 1000)).toFixed(1);
      console.log(`[${name}] Frame ${frame}/${TOTAL_FRAMES} (${pct}%) | t=${t.toFixed(2)}s | Elapsed: ${elapsed}s (${fpsReal} fps)`);
    }
  }

  console.log(`Finished capturing all frames for ${name}. Finalizing FFmpeg encoding...`);
  ffmpeg.stdin.end();
  await ffmpegFinished;
  console.log(`✓ Completed: ${outputVideo}`);

  if (rootVideoCopy) {
    fs.copyFileSync(outputVideo, rootVideoCopy);
    console.log(`✓ Copied to root: ${rootVideoCopy}`);
  }

  await page.close();
}

async function main() {
  console.log('=== TurkeyThaw Real Website Macro Stage Reel Pipeline ===');
  console.log(`Total Duration: ${TOTAL_DURATION_SEC}s @ ${FPS} FPS`);

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

  // 1. Render 9:16 Vertical Reel (1080x1920)
  await renderReel(browser, {
    name: '9:16 Vertical Reel (Real Website)',
    mode: '9x16',
    width: 1080,
    height: 1920,
    outputVideo: path.join(OUTPUT_DIR, 'turkeythaw-claude-reel-9x16.mp4'),
    outputPoster: path.join(OUTPUT_DIR, 'turkeythaw-claude-reel-9x16.jpg'),
    rootVideoCopy: path.join(ROOT_DIR, 'turkeythaw-claude-reel-9x16.mp4'),
    rootPosterCopy: path.join(ROOT_DIR, 'turkeythaw-claude-reel-9x16.jpg')
  });

  // 2. Render 16:9 Landscape Stage (1920x1080)
  await renderReel(browser, {
    name: '16:9 Landscape Stage (Real Website)',
    mode: '16x9',
    width: 1920,
    height: 1080,
    outputVideo: path.join(OUTPUT_DIR, 'turkeythaw-claude-stage-16x9.mp4'),
    outputPoster: path.join(OUTPUT_DIR, 'turkeythaw-claude-stage-16x9.jpg'),
    rootVideoCopy: path.join(ROOT_DIR, 'turkeythaw-claude-stage-16x9.mp4'),
    rootPosterCopy: path.join(ROOT_DIR, 'turkeythaw-claude-stage-16x9.jpg')
  });

  await browser.close();
  console.log('\n=== All Real Website Stage Renders Finished Successfully! ===');
}

main().catch(err => {
  console.error('Real Website Reel Recording Failed:', err);
  process.exit(1);
});
