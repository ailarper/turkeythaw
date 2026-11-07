import { spawn } from "child_process";
import fs from "fs";

async function patchPlannerSky() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9228",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pagesRes = await fetch("http://127.0.0.1:9228/json/list");
    const pages = await pagesRes.json();
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
    await send("Page.navigate", { url: "http://localhost:3000" });
    await new Promise(r => setTimeout(r, 3000));

    const patchResult = await send("Runtime.evaluate", {
      expression: `(() => {
        const img = document.querySelector("#planner img");
        if (!img) return "No img";
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // We want to patch the navbar region (y=0 to y=78)
        // Let's sample the clean sky row at y=82 across the width
        // For each column x, we can smoothly extend the sky color from y=82 up to y=0
        const skyRow = ctx.getImageData(0, 82, img.naturalWidth, 1).data;
        const skyRow2 = ctx.getImageData(0, 100, img.naturalWidth, 1).data;

        const imgData = ctx.getImageData(0, 0, img.naturalWidth, 80);
        for (let y = 0; y < 80; y++) {
          // Subtle upward tint: the sky at y=0 is slightly warmer/lighter than y=82
          const factor = (80 - y) / 80;
          for (let x = 0; x < img.naturalWidth; x++) {
            const idxSky = x * 4;
            const rSky = skyRow[idxSky];
            const gSky = skyRow[idxSky + 1];
            const bSky = skyRow[idxSky + 2];

            // slightly lighter at the very top edge
            const r = Math.min(255, Math.round(rSky + factor * 6));
            const g = Math.min(255, Math.round(gSky + factor * 6));
            const b = Math.min(255, Math.round(bSky + factor * 2));

            const idx = (y * img.naturalWidth + x) * 4;
            imgData.data[idx] = r;
            imgData.data[idx + 1] = g;
            imgData.data[idx + 2] = b;
            imgData.data[idx + 3] = 255;
          }
        }
        ctx.putImageData(imgData, 0, 0);

        return canvas.toDataURL("image/png");
      })()`,
      returnByValue: true
    });

    if (patchResult.result.value.startsWith("data:image/png;base64,")) {
      const base64 = patchResult.result.value.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync("public/assets/section1_planner_clean.png", Buffer.from(base64, "base64"));
      console.log("Successfully created public/assets/section1_planner_clean.png!");
    } else {
      console.error("Failed:", patchResult.result.value);
    }
  } catch (err) {
    console.error(err);
  } finally {
    proc.kill();
  }
}

patchPlannerSky();

