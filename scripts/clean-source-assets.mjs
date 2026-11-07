import { spawn } from "child_process";
import fs from "fs";

async function cleanSourceAssets() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9268",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const pages = await (await fetch("http://127.0.0.1:9268/json/list")).json();
    const target = pages.find(p => p.url.includes("localhost:3000"));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (m, p = {}) => new Promise((resolve, reject) => {
      const curId = id++;
      const h = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.id === curId) {
          ws.removeEventListener("message", h);
          if (d.error) reject(d.error);
          else resolve(d.result);
        }
      };
      ws.addEventListener("message", h);
      ws.send(JSON.stringify({ id: curId, method: m, params: p }));
    });

    await send("Runtime.enable");

    console.log("1. Cleaning section2_calculator.png ...");
    const cleanSec2Res = await send("Runtime.evaluate", {
      expression: `(async () => {
        const img = new Image();
        img.src = '/assets/section2_calculator.png';
        await new Promise(r => img.onload = r);

        const canvas = document.createElement('canvas');
        const W = canvas.width = img.naturalWidth;
        const H = canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // A. Top Seam Feathering (y=0..28) smoothly blending from #FAF6EE into image
        // Target top color: rgb(250, 246, 238)
        const targetR = 250, targetG = 246, targetB = 238;
        const seamImgData = ctx.getImageData(0, 0, W, 28);
        for (let y = 0; y < 28; y++) {
          const t = y / 28; // 0 at top, 1 at y=28
          for (let x = 0; x < W; x++) {
            const idx = (y * W + x) * 4;
            const origR = seamImgData.data[idx];
            const origG = seamImgData.data[idx + 1];
            const origB = seamImgData.data[idx + 2];
            seamImgData.data[idx] = Math.round(targetR * (1 - t) + origR * t);
            seamImgData.data[idx + 1] = Math.round(targetG * (1 - t) + origG * t);
            seamImgData.data[idx + 2] = Math.round(targetB * (1 - t) + origB * t);
          }
        }
        ctx.putImageData(seamImgData, 0, 0);

        // B. Weight Track Interior (x: 165..1568, y: 604..684)
        // Completely erases all baked-in text and the 16 lbs orange pill including bottom edge
        const trackSample = ctx.getImageData(200, 640, 1, 1).data;
        const tR = trackSample[0], tG = trackSample[1], tB = trackSample[2];
        const wtImgData = ctx.getImageData(165, 604, 1568 - 165, 684 - 604);
        for (let i = 0; i < wtImgData.data.length; i += 4) {
          wtImgData.data[i] = tR;
          wtImgData.data[i + 1] = tG;
          wtImgData.data[i + 2] = tB;
          wtImgData.data[i + 3] = 255;
        }
        ctx.putImageData(wtImgData, 165, 604);

        // C. Method Cards Area (x: 160..1572, y: 780..915)
        // Clean out baked-in green border / tint by filling with surrounding card white
        // White card background is pure white: rgb(255, 255, 255)
        const methodImgData = ctx.getImageData(160, 780, 1572 - 160, 915 - 780);
        for (let i = 0; i < methodImgData.data.length; i += 4) {
          methodImgData.data[i] = 255;
          methodImgData.data[i + 1] = 255;
          methodImgData.data[i + 2] = 255;
          methodImgData.data[i + 3] = 255;
        }
        ctx.putImageData(methodImgData, 160, 780);

        // D. Target Ready Date & Time pill (x: 260..700, y: 968..1045)
        // Sample exact interior pixel on each row at x=720 (clean pill interior)
        for (let y = 968; y <= 1045; y++) {
          const sample = ctx.getImageData(720, y, 1, 1).data;
          const sR = sample[0], sG = sample[1], sB = sample[2];
          const rowData = ctx.getImageData(260, y, 700 - 260, 1);
          for (let i = 0; i < rowData.data.length; i += 4) {
            rowData.data[i] = sR;
            rowData.data[i + 1] = sG;
            rowData.data[i + 2] = sB;
            rowData.data[i + 3] = 255;
          }
          ctx.putImageData(rowData, 260, y);
        }

        // E. START THAWING middle date row (x: 535..1170, y: 1148..1212)
        // Linear vertical interpolation between clean scanline y=1145 (above) and y=1215 (below)
        const scanAbove = ctx.getImageData(535, 1145, 1170 - 535, 1).data;
        const scanBelow = ctx.getImageData(535, 1215, 1170 - 535, 1).data;
        const thawPatch = ctx.getImageData(535, 1148, 1170 - 535, 1212 - 1148);
        const patchW = 1170 - 535;
        const patchH = 1212 - 1148;
        for (let py = 0; py < patchH; py++) {
          const actualY = 1148 + py;
          const t = (actualY - 1145) / (1215 - 1145);
          for (let px = 0; px < patchW; px++) {
            const aboveIdx = px * 4;
            const aR = scanAbove[aboveIdx], aG = scanAbove[aboveIdx + 1], aB = scanAbove[aboveIdx + 2];
            const bR = scanBelow[aboveIdx], bG = scanBelow[aboveIdx + 1], bB = scanBelow[aboveIdx + 2];

            const idx = (py * patchW + px) * 4;
            thawPatch.data[idx] = Math.round(aR * (1 - t) + bR * t);
            thawPatch.data[idx + 1] = Math.round(aG * (1 - t) + bG * t);
            thawPatch.data[idx + 2] = Math.round(aB * (1 - t) + bB * t);
            thawPatch.data[idx + 3] = 255;
          }
        }
        ctx.putImageData(thawPatch, 535, 1148);

        return canvas.toDataURL("image/png");
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    if (cleanSec2Res.result.value && cleanSec2Res.result.value.startsWith("data:image/png;base64,")) {
      const b64 = cleanSec2Res.result.value.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync("public/assets/section2_calculator_clean.png", Buffer.from(b64, "base64"));
      console.log("✓ Saved public/assets/section2_calculator_clean.png (" + Math.round(b64.length * 0.75 / 1024) + " KB)");
    } else {
      console.error("Failed to clean section 2:", cleanSec2Res.result);
    }

    console.log("2. Cleaning section4_timeline.png ...");
    const cleanSec4Res = await send("Runtime.evaluate", {
      expression: `(async () => {
        const img = new Image();
        img.src = '/assets/section4_timeline.png';
        await new Promise(r => img.onload = r);

        const canvas = document.createElement('canvas');
        const W = canvas.width = img.naturalWidth;
        const H = canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // A. Dinner Time dropdown pill text (4:00 PM) around x: 1090..1340, y: 385..420
        // Cleanly inpaint by interpolating between clean scanlines at y=375 and y=428
        const dinnerAbove = ctx.getImageData(1090, 375, 1340 - 1090, 1).data;
        const dinnerBelow = ctx.getImageData(1090, 428, 1340 - 1090, 1).data;
        const dinnerPatch = ctx.getImageData(1090, 385, 1340 - 1090, 420 - 385);
        const dW = 1340 - 1090;
        const dH = 420 - 385;
        for (let py = 0; py < dH; py++) {
          const actualY = 385 + py;
          const t = (actualY - 375) / (428 - 375);
          for (let px = 0; px < dW; px++) {
            const idxA = px * 4;
            const aR = dinnerAbove[idxA], aG = dinnerAbove[idxA + 1], aB = dinnerAbove[idxA + 2];
            const bR = dinnerBelow[idxA], bG = dinnerBelow[idxA + 1], bB = dinnerBelow[idxA + 2];
            const idx = (py * dW + px) * 4;
            dinnerPatch.data[idx] = Math.round(aR * (1 - t) + bR * t);
            dinnerPatch.data[idx + 1] = Math.round(aG * (1 - t) + bG * t);
            dinnerPatch.data[idx + 2] = Math.round(aB * (1 - t) + bB * t);
            dinnerPatch.data[idx + 3] = 255;
          }
        }
        ctx.putImageData(dinnerPatch, 1090, 385);

        // B. Bird Weight pill text (16 lbs) around x: 1510..1665, y: 385..420
        const wtAbove = ctx.getImageData(1510, 375, 1665 - 1510, 1).data;
        const wtBelow = ctx.getImageData(1510, 428, 1665 - 1510, 1).data;
        const wtPatch = ctx.getImageData(1510, 385, 1665 - 1510, 420 - 385);
        const wW = 1665 - 1510;
        const wH = 420 - 385;
        for (let py = 0; py < wH; py++) {
          const actualY = 385 + py;
          const t = (actualY - 375) / (428 - 375);
          for (let px = 0; px < wW; px++) {
            const idxA = px * 4;
            const aR = wtAbove[idxA], aG = wtAbove[idxA + 1], aB = wtAbove[idxA + 2];
            const bR = wtBelow[idxA], bG = wtBelow[idxA + 1], bB = wtBelow[idxA + 2];
            const idx = (py * wW + px) * 4;
            wtPatch.data[idx] = Math.round(aR * (1 - t) + bR * t);
            wtPatch.data[idx + 1] = Math.round(aG * (1 - t) + bG * t);
            wtPatch.data[idx + 2] = Math.round(aB * (1 - t) + bB * t);
            wtPatch.data[idx + 3] = 255;
          }
        }
        ctx.putImageData(wtPatch, 1510, 385);

        return canvas.toDataURL("image/png");
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    if (cleanSec4Res.result.value && cleanSec4Res.result.value.startsWith("data:image/png;base64,")) {
      const b64 = cleanSec4Res.result.value.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync("public/assets/section4_timeline_clean.png", Buffer.from(b64, "base64"));
      console.log("✓ Saved public/assets/section4_timeline_clean.png (" + Math.round(b64.length * 0.75 / 1024) + " KB)");
    } else {
      console.error("Failed to clean section 4:", cleanSec4Res.result);
    }

    ws.close();
    console.log("Source asset cleaning completed successfully!");
  } finally {
    proc.kill();
  }
}

cleanSourceAssets().catch(console.error);
