import { spawn } from "child_process";

async function inspectPill() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, ["--headless=new", "--remote-debugging-port=9270", "--disable-gpu", "http://localhost:3000"]);
  await new Promise(r => setTimeout(r, 2000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9270/json/list")).json();
    const target = pages.find(p => p.url.includes("localhost:3000"));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    const send = (m, p = {}) => new Promise((resolve) => {
      const curId = id++;
      const h = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.id === curId) { ws.removeEventListener("message", h); resolve(d.result); }
      };
      ws.addEventListener("message", h);
      ws.send(JSON.stringify({ id: curId, method: m, params: p }));
    });
    await send("Runtime.enable");

    const res = await send("Runtime.evaluate", {
      expression: `(async () => {
        // Load original section4_timeline.png
        const img = new Image();
        img.src = '/assets/section4_timeline.png';
        await new Promise(r => img.onload = r);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Scan row y = 400 across x from 900 to 1800
        const row400 = [];
        for (let x = 950; x <= 1700; x += 5) {
          const [r, g, b] = ctx.getImageData(x, 400, 1, 1).data;
          row400.push({ x, rgb: [r, g, b] });
        }

        // Also find where the text "4:00 PM" starts and ends:
        // Black text: r < 60, g < 60, b < 60
        // Find x range between 1100 and 1400 where dark pixels exist
        const textPixels = [];
        for (let y = 380; y <= 425; y++) {
          for (let x = 1100; x <= 1400; x++) {
            const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
            if (r < 70 && g < 70 && b < 70) {
              textPixels.push({ x, y });
            }
          }
        }

        const tMinX = Math.min(...textPixels.map(p => p.x));
        const tMaxX = Math.max(...textPixels.map(p => p.x));
        const tMinY = Math.min(...textPixels.map(p => p.y));
        const tMaxY = Math.max(...textPixels.map(p => p.y));

        // Chevron is further right. Let's find where the chevron is:
        const chevronPixels = [];
        for (let y = 380; y <= 425; y++) {
          for (let x = tMaxX + 15; x <= 1450; x++) {
            const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
            if (r < 90 && g < 90 && b < 90) {
              chevronPixels.push({ x, y });
            }
          }
        }

        // Weight pill text around x=1480..1650
        const wtPixels = [];
        for (let y = 380; y <= 425; y++) {
          for (let x = 1450; x <= 1680; x++) {
            const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
            // Orange text or dark text
            if ((r > 200 && g > 70 && b < 50) || (r < 70 && g < 70 && b < 70)) {
              wtPixels.push({ x, y });
            }
          }
        }

        return {
          text4pm: {
            tMinX, tMaxX, tMinY, tMaxY,
            chevronMinX: chevronPixels.length ? Math.min(...chevronPixels.map(p => p.x)) : null
          },
          weightText: {
            minX: wtPixels.length ? Math.min(...wtPixels.map(p => p.x)) : null,
            maxX: wtPixels.length ? Math.max(...wtPixels.map(p => p.x)) : null,
            minY: wtPixels.length ? Math.min(...wtPixels.map(p => p.y)) : null,
            maxY: wtPixels.length ? Math.max(...wtPixels.map(p => p.y)) : null,
          }
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log("PILL DETAILS:", JSON.stringify(res.result ? res.result.value : res, null, 2));
    ws.close();
  } finally {
    proc.kill();
  }
}

inspectPill().catch(console.error);

