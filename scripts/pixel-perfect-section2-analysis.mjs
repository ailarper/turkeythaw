import { spawn } from "child_process";

async function analyze() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9261",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 2000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9261/json/list")).json();
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
        img.src = "/assets/section2_calculator.png";
        await new Promise(r => img.onload = r);

        const canvas = document.createElement("canvas");
        const W = canvas.width = img.naturalWidth;
        const H = canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // 1. Method 1 (Refrigerator) and Method 2 (Cold Water)
        // Find x bounds of Card 1 at y = 850
        let m1Left = 160;
        let m1Right = 0;
        for (let x = 165; x < 1000; x++) {
          const [r, g, b] = ctx.getImageData(x, 850, 1, 1).data;
          // check where card 1 ends (white gap between card 1 and 2)
          if (r > 250 && g > 250 && b > 250) {
            m1Right = x;
            break;
          }
        }
        let m2Left = 0;
        for (let x = m1Right; x < 1200; x++) {
          const [r, g, b] = ctx.getImageData(x, 850, 1, 1).data;
          // where card 2 starts (non-white border)
          if (r < 240 || g < 240 || b < 240) {
            m2Left = x;
            break;
          }
        }
        let m2Right = 0;
        for (let x = 1650; x > m2Left; x--) {
          const [r, g, b] = ctx.getImageData(x, 850, 1, 1).data;
          if (r < 240 || g < 240 || b < 240) {
            m2Right = x;
            break;
          }
        }

        // Find vertical bounds of Method cards:
        let mTop = 0, mBottom = 0;
        for (let y = 780; y < 820; y++) {
          const [r, g, b] = ctx.getImageData(200, y, 1, 1).data;
          if (r < 240 || g < 240 || b < 240) {
            mTop = y;
            break;
          }
        }
        for (let y = 920; y > 880; y--) {
          const [r, g, b] = ctx.getImageData(200, y, 1, 1).data;
          if (r < 240 || g < 240 || b < 240) {
            mBottom = y;
            break;
          }
        }

        // 2. Target Date & Time dropdown
        // Find y bounds around y=980..1040 at x=200
        let tTop = 0, tBottom = 0;
        for (let y = 960; y < 1020; y++) {
          const [r, g, b] = ctx.getImageData(200, y, 1, 1).data;
          if (r < 245 && g < 240) {
            tTop = y;
            break;
          }
        }
        for (let y = 1060; y > 1000; y--) {
          const [r, g, b] = ctx.getImageData(200, y, 1, 1).data;
          if (r < 245 && g < 240) {
            tBottom = y;
            break;
          }
        }
        let tLeft = 0, tRight = 0;
        for (let x = 120; x < 300; x++) {
          const [r, g, b] = ctx.getImageData(x, Math.floor((tTop + tBottom)/2), 1, 1).data;
          if (r < 245 && g < 240) {
            tLeft = x;
            break;
          }
        }
        let sTop = 1114, sBottom = 1290, sLeft = 196;
        for (let x = 1650; x > 800; x--) {
          const [r, g, b] = ctx.getImageData(x, 1008, 1, 1).data;
          if (r < 240 && g < 240 && b < 240) {
            tRight = x;
            break;
          }
        }
        for (let x = 1650; x > 800; x--) {
          const [r, g, b] = ctx.getImageData(x, 1200, 1, 1).data;
          if (r > 235 && g > 180 && g < 230 && b < 220) {
            sRight = x;
            break;
          }
        }

        const pct = (val, total) => (val / total * 100).toFixed(2) + "%";

        return {
          W, H,
          method: {
            top: mTop, bottom: mBottom,
            pctTop: pct(mTop, H),
            pctHeight: pct(mBottom - mTop, H),
            card1: { left: m1Left, right: m1Right, pctLeft: pct(m1Left, W), pctWidth: pct(m1Right - m1Left, W) },
            card2: { left: m2Left, right: m2Right, pctLeft: pct(m2Left, W), pctWidth: pct(m2Right - m2Left, W) }
          },
          targetPill: {
            left: tLeft, right: tRight, top: tTop, bottom: tBottom,
            pctLeft: pct(tLeft, W), pctWidth: pct(tRight - tLeft, W),
            pctTop: pct(tTop, H), pctHeight: pct(tBottom - tTop, H)
          },
          startThawing: {
            left: sLeft, right: sRight, top: sTop, bottom: sBottom,
            pctLeft: pct(sLeft, W), pctWidth: pct(sRight - sLeft, W),
            pctTop: pct(sTop, H), pctHeight: pct(sBottom - sTop, H)
          }
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log("EXACT MEASUREMENTS:", JSON.stringify(evalRes.result, null, 2));
    ws.close();
  } finally {
    proc.kill();
  }
}

analyze().catch(console.error);
