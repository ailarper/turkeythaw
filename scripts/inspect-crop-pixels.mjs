import { spawn } from "child_process";
import fs from "fs";

async function inspectCrop() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9252",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9252/json/list")).json();
    const target = pages.find(p => p.url.includes("localhost:3000"));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const curId = id++;
      const handler = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.id === curId) {
          ws.removeEventListener("message", handler);
          if (d.error) reject(d.error);
          else resolve(d.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await send("Page.enable");
    await send("Runtime.enable");

    const evalRes = await send("Runtime.evaluate", {
      expression: `(async () => {
        const img = new Image();
        img.src = "/assets/section1_planner.png";
        await new Promise(r => img.onload = r);

        // Scan tightly around the cloche icon at x: 60..125, y: 30..75
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Find non-background pixels:
        // Background is light cream/beige: r > 240, g > 240, b > 235
        const iconPixels = [];
        for (let y = 30; y <= 75; y++) {
          for (let x = 60; x <= 125; x++) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            const isBg = p[0] > 245 && p[1] > 242 && p[2] > 235;
            if (!isBg) {
              iconPixels.push({ x, y, r: p[0], g: p[1], b: p[2], a: p[3] });
            }
          }
        }

        const minX = Math.min(...iconPixels.map(p => p.x));
        const maxX = Math.max(...iconPixels.map(p => p.x));
        const minY = Math.min(...iconPixels.map(p => p.y));
        const maxY = Math.max(...iconPixels.map(p => p.y));
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;

        // Create transparent PNG with transparent background
        const outCanvas = document.createElement("canvas");
        outCanvas.width = w;
        outCanvas.height = h;
        const outCtx = outCanvas.getContext("2d");
        const imgData = outCtx.createImageData(w, h);

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const p = ctx.getImageData(minX + x, minY + y, 1, 1).data;
            const idx = (y * w + x) * 4;
            // Check if background pixel
            const isBg = p[0] > 244 && p[1] > 240 && p[2] > 235;
            if (isBg) {
              imgData.data[idx] = 0;
              imgData.data[idx+1] = 0;
              imgData.data[idx+2] = 0;
              imgData.data[idx+3] = 0; // transparent
            } else {
              imgData.data[idx] = p[0];
              imgData.data[idx+1] = p[1];
              imgData.data[idx+2] = p[2];
              imgData.data[idx+3] = 255;
            }
          }
        }
        outCtx.putImageData(imgData, 0, 0);

        return {
          minX, maxX, minY, maxY, w, h,
          pngData: outCanvas.toDataURL("image/png")
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    const res = evalRes.result.value;
    console.log("CROP BOUNDS:", { minX: res.minX, maxX: res.maxX, minY: res.minY, maxY: res.maxY, w: res.w, h: res.h });
    const base64 = res.pngData.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync("public/assets/logo-cloche.png", Buffer.from(base64, "base64"));
    fs.writeFileSync("public/icon.png", Buffer.from(base64, "base64"));
    console.log("Successfully generated public/assets/logo-cloche.png and public/icon.png!");
  } finally {
    proc.kill();
  }
}

inspectCrop();

