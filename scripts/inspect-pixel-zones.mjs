import { spawn } from "child_process";

async function inspect() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, ["--headless=new", "--remote-debugging-port=9265", "--disable-gpu", "http://localhost:3000"]);
  await new Promise(r => setTimeout(r, 2000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9265/json/list")).json();
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

    // 1. Inspect Section 2
    const resSec2 = await send("Runtime.evaluate", {
      expression: `(async () => {
        const img = new Image();
        img.src = '/assets/section2_calculator.png';
        await new Promise(r => img.onload = r);
        const canvas = document.createElement('canvas');
        const W = canvas.width = img.naturalWidth;
        const H = canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // 1. White card bounds in Section 2 (around x=120..1700, y=500..1400)
        // Find right edge of the main left white card:
        // Inside the white card, pixels are pure white (255,255,255).
        // Let's scan horizontally at y=720 from x=1400 to 1700
        let whiteCardRight = 0;
        for (let x = 1400; x <= 1700; x++) {
          const [r, g, b] = ctx.getImageData(x, 720, 1, 1).data;
          // White card ends when background changes from white/card
          if (r > 250 && g > 250 && b > 250) {
            whiteCardRight = x;
          }
        }

        // 2. Target Ready Date & Time text: "Thanksgiving Day, 1:00 PM"
        // In pill at y=960..1056, x=163..1600
        // Find dark text pixels inside the pill:
        const targetTextPixels = [];
        for (let y = 970; y <= 1045; y++) {
          // calendar icon is roughly x=180..260, chevron is roughly x > 1400
          for (let x = 270; x <= 1400; x++) {
            const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
            if (r < 70 && g < 70 && b < 70) {
              targetTextPixels.push({ x, y });
            }
          }
        }
        const tMinX = Math.min(...targetTextPixels.map(p => p.x));
        const tMaxX = Math.max(...targetTextPixels.map(p => p.x));
        const tMinY = Math.min(...targetTextPixels.map(p => p.y));
        const tMaxY = Math.max(...targetTextPixels.map(p => p.y));

        // Sample pill interior background:
        const tBg = ctx.getImageData(tMinX + 10, tMinY - 10, 1, 1).data;

        // 3. START THAWING Date/Time text: "Sunday, Nov 22 • 9:00 AM"
        const thawTextPixels = [];
        for (let y = 1145; y <= 1215; y++) {
          for (let x = 500; x <= 1150; x++) {
            const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
            if (r < 60 && g < 60 && b < 60) {
              thawTextPixels.push({ x, y });
            }
          }
        }
        const stMinX = Math.min(...thawTextPixels.map(p => p.x));
        const stMaxX = Math.max(...thawTextPixels.map(p => p.x));
        const stMinY = Math.min(...thawTextPixels.map(p => p.y));
        const stMaxY = Math.max(...thawTextPixels.map(p => p.y));

        // Sample peach card background above and below this text
        const stBgAbove = ctx.getImageData(stMinX + 20, stMinY - 8, 1, 1).data;
        const stBgBelow = ctx.getImageData(stMinX + 20, stMaxY + 8, 1, 1).data;

        // 4. Weight track bounds and content
        // x: 161..1572, y: 604..677
        const wtLeft = 161, wtRight = 1572, wtTop = 604, wtBottom = 677;

        return {
          W, H,
          whiteCardRight,
          whiteCardRightPct: (whiteCardRight / W * 100).toFixed(2) + '%',
          targetText: {
            minX: tMinX, maxX: tMaxX, minY: tMinY, maxY: tMaxY,
            pctLeft: (tMinX / W * 100).toFixed(2) + '%',
            pctWidth: ((tMaxX - tMinX) / W * 100).toFixed(2) + '%',
            pctTop: (tMinY / H * 100).toFixed(2) + '%',
            pctHeight: ((tMaxY - tMinY) / H * 100).toFixed(2) + '%',
            bgHex: '#' + [tBg[0], tBg[1], tBg[2]].map(c => c.toString(16).padStart(2, '0')).join('')
          },
          thawText: {
            minX: stMinX, maxX: stMaxX, minY: stMinY, maxY: stMaxY,
            pctLeft: (stMinX / W * 100).toFixed(2) + '%',
            pctWidth: ((stMaxX - stMinX) / W * 100).toFixed(2) + '%',
            pctTop: (stMinY / H * 100).toFixed(2) + '%',
            pctHeight: ((stMaxY - stMinY) / H * 100).toFixed(2) + '%',
            bgAboveHex: '#' + [stBgAbove[0], stBgAbove[1], stBgAbove[2]].map(c => c.toString(16).padStart(2, '0')).join(''),
            bgBelowHex: '#' + [stBgBelow[0], stBgBelow[1], stBgBelow[2]].map(c => c.toString(16).padStart(2, '0')).join('')
          }
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log("SECTION 2 ANALYSIS:", JSON.stringify(resSec2 ? (resSec2.result ? resSec2.result.value : resSec2) : null, null, 2));

    // 2. Inspect Section 4
    const resSec4 = await send("Runtime.evaluate", {
      expression: `(async () => {
        const img = new Image();
        img.src = '/assets/section4_timeline.png';
        await new Promise(r => img.onload = r);
        const canvas = document.createElement('canvas');
        const W = canvas.width = img.naturalWidth;
        const H = canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Find "Dinner Time: 4:00 PM" pill and "16 lbs" pill in Section 4 header
        // Usually located between y=100 and y=400
        const topBg = ctx.getImageData(Math.floor(W / 2), 50, 1, 1).data;
        const midBg = ctx.getImageData(1000, 240, 1, 1).data;

        return {
          W, H,
          topBgHex: '#' + [topBg[0], topBg[1], topBg[2]].map(c => c.toString(16).padStart(2, '0')).join(''),
          midBgHex: '#' + [midBg[0], midBg[1], midBg[2]].map(c => c.toString(16).padStart(2, '0')).join('')
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log("SECTION 4 ANALYSIS:", JSON.stringify(resSec4 ? (resSec4.result ? resSec4.result.value : resSec4) : null, null, 2));

    ws.close();
  } finally {
    proc.kill();
  }
}
inspect().catch(console.error);
