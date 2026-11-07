import { spawn } from "child_process";
import fs from "fs";

async function findCloche() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9250",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9250/json/list")).json();
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

    // Load section1_planner.png and section4_timeline.png into canvas to find the cloche logo
    const evalRes = await send("Runtime.evaluate", {
      expression: `(async () => {
        // Load original planner.png
        const img = new Image();
        img.src = "/assets/section1_planner.png";
        await new Promise(r => img.onload = r);

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Find orange pixels near top left (y: 20..90, x: 50..300)
        const orange = [];
        for (let y = 15; y <= 95; y++) {
          for (let x = 50; x <= 250; x++) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] > 180 && p[1] > 60 && p[1] < 140 && p[2] < 50) {
              orange.push({ x, y });
            }
          }
        }

        // Also check section4_timeline.png footer logo
        const img4 = new Image();
        img4.src = "/assets/section4_timeline.png";
        await new Promise(r => img4.onload = r);
        const c4 = document.createElement("canvas");
        c4.width = img4.naturalWidth;
        c4.height = img4.naturalHeight;
        const ctx4 = c4.getContext("2d");
        ctx4.drawImage(img4, 0, 0);

        const orange4 = [];
        for (let y = 1340; y <= 1460; y++) {
          for (let x = 50; x <= 250; x++) {
            const p = ctx4.getImageData(x, y, 1, 1).data;
            if (p[0] > 180 && p[1] > 60 && p[1] < 140 && p[2] < 50) {
              orange4.push({ x, y });
            }
          }
        }

        return {
          plannerImgSize: { w: img.naturalWidth, h: img.naturalHeight },
          plannerOrange: orange.length ? {
            count: orange.length,
            minX: Math.min(...orange.map(p => p.x)),
            maxX: Math.max(...orange.map(p => p.x)),
            minY: Math.min(...orange.map(p => p.y)),
            maxY: Math.max(...orange.map(p => p.y))
          } : null,
          timelineImgSize: { w: img4.naturalWidth, h: img4.naturalHeight },
          timelineOrange: orange4.length ? {
            count: orange4.length,
            minX: Math.min(...orange4.map(p => p.x)),
            maxX: Math.max(...orange4.map(p => p.x)),
            minY: Math.min(...orange4.map(p => p.y)),
            maxY: Math.max(...orange4.map(p => p.y))
          } : null
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log("CLOCHE LOGO COORDS:", JSON.stringify(evalRes.result.value, null, 2));
  } finally {
    proc.kill();
  }
}

findCloche();

