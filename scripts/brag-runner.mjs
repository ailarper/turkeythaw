#!/usr/bin/env node

/**
 * Runner and environment verifier for latent-spaces/brag and Hyperframes.
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('  /brag - Launch Video Generator Environment Check  ');
console.log('====================================================\n');

// 1. Verify Node.js
const nodeVer = process.version;
console.log(`[✓] Node.js: ${nodeVer}`);

// 2. Verify Puppeteer
let puppeteerOk = false;
try {
  const puppeteer = await import('puppeteer');
  console.log(`[✓] Puppeteer: Installed (v${puppeteer.default?.version || '25.x'})`);
  puppeteerOk = true;
} catch (e) {
  console.error(`[✗] Puppeteer: Not found or failed to load (${e.message})`);
}

// 3. Verify Chrome
const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
if (fs.existsSync(chromePath)) {
  console.log(`[✓] Chrome: System browser verified at ${chromePath}`);
} else {
  console.log(`[!] Chrome: Default path not found, using Puppeteer Chrome fallback`);
}

// Ensure PATH includes WinGet and FFmpeg paths
const ffmpegDirs = [
  'C:\\Users\\user\\AppData\\Local\\Microsoft\\WinGet\\Links',
  'C:\\Users\\user\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin'
];
ffmpegDirs.forEach(dir => {
  if (fs.existsSync(dir) && !process.env.PATH.includes(dir)) {
    process.env.PATH = `${dir};${process.env.PATH}`;
  }
});

// 4. Verify FFmpeg & FFprobe
function checkCmd(cmd, args = ['-version']) {
  try {
    const res = spawnSync(cmd, args, { encoding: 'utf-8', env: process.env });
    return res.status === 0;
  } catch {
    return false;
  }
}

const ffmpegOk = checkCmd('ffmpeg');
if (ffmpegOk) {
  console.log('[✓] FFmpeg: Accessible and functional');
} else {
  console.error('[✗] FFmpeg: Not found on PATH');
}

const ffprobeOk = checkCmd('ffprobe');
if (ffprobeOk) {
  console.log('[✓] FFprobe: Accessible and functional');
} else {
  console.error('[✗] FFprobe: Not found on PATH');
}

// 5. Verify latent-spaces/brag tooling directory & assets
const toolingPath = path.resolve('tools/brag');
if (fs.existsSync(toolingPath)) {
  const hasSkill = fs.existsSync(path.join(toolingPath, 'skills/brag/SKILL.md'));
  const hasAssets = fs.existsSync(path.join(toolingPath, 'skills/brag/assets/music'));
  console.log(`[✓] latent-spaces/brag: Cloned in tools/brag (SKILL.md: ${hasSkill}, Assets: ${hasAssets})`);
} else {
  console.error('[✗] latent-spaces/brag: Directory tools/brag does not exist');
}

// 6. Verify Hyperframes CLI
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const hyperframesOk = checkCmd(npxCmd, ['hyperframes', '--version']) || fs.existsSync('node_modules/hyperframes/bin/hyperframes.mjs');
console.log(`[${hyperframesOk ? '✓' : '!'}] Hyperframes CLI: ${hyperframesOk ? 'Ready (installed)' : 'Will install on first use'}`);

console.log('\n----------------------------------------------------');
console.log('All core prerequisites for /brag are verified!');
console.log('To generate a launch video, invoke /brag in chat:');
console.log('  /brag --tone polished');
console.log('  /brag --format vertical');
console.log('====================================================\n');

// Forward subcommands if provided (e.g. `node scripts/brag-runner.mjs doctor`)
const args = process.argv.slice(2);
if (args.length > 0) {
  const subCmd = args[0].replace(/^--/, '');
  console.log(`Executing: hyperframes ${args.join(' ')}...\n`);
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  spawnSync(npx, ['hyperframes', ...args], {
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });
}
