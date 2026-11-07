import { spawn } from "child_process";

async function inspectSec4() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, ["--headless=new", "--remote-debugging-port=9266", "--disable-gpu", "http://localhost:3000"]);
  await new Promise(r => setTimeout(r, 2000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9266/json/list")).json();
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
        const img = new Image();
        img.src = '/assets/section4_timeline.png';
        await new Promise(r => img.onload = r);
        const canvas = document.createElement('canvas');
        const W = canvas.width = img.naturalWidth;
        const H = canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Scan around y = 0.245 * H = 376px, x = 0.37 * W = 1018px to 1600px
        // Find Dinner Time text and pill
        const dinnerPillPixels = [];
        for (let y = 340; y <= 420; y++) {
          for (let x = 950; x <= 1650; x++) {
            const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
            if (r < 60 && g < 60 && b < 60) {
              dinnerPillPixels.push({ x, y });
            }
          }
        }

        // Sample background of the pill interior vs canvas background
        const canvasBg = ctx.getImageData(800, 380, 1, 1).data;
        const pillBg = ctx.getImageData(1250, 380, 1, 1).data;
        const weightPillBg = ctx.getImageData(1550, 380, 1, 1).data;

        return {
          W, H,
          canvasBgHex: '#' + [canvasBg[0], canvasBg[1], canvasBg[2]].map(c => c.toString(16).padStart(2, '0')).join(''),
          pillBgHex: '#' + [pillBg[0], pillBg[1], pillBg[2]].map(c => c.toString(16).padStart(2, '0')).join(''),
          weightPillBgHex: '#' + [weightPillBg[0], weightPillBg[1], weightPillBg[2]].map(c => c.toString(16).padStart(2, '0')).join(''),
          minX: Math.min(...dinnerPillPixels.map(p => p.x)),
          maxX: Math.max(...dinnerPillPixels.map(p => p.x)),
          minY: Math.min(...dinnerPillPixels.map(p => p.y)),
          maxY: Math.max(...dinnerPillPixels.map(p => p.y)),
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log("SECTION 4 PILL ANALYSIS:", JSON.stringify(res.result ? res.result.value : res, null, 2));
    ws.close();
  } finally {
    proc.kill();
  }
}

inspectSec4().catch(console.error);

