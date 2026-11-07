import { spawn } from "child_process";

async function masterInspect() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9257",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3500));
  try {
    const pages = await (await fetch("http://127.0.0.1:9257/json/list")).json();
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
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const W = img.naturalWidth;
        const H = img.naturalHeight;

        // 1. Weight Track border detection
        // Scan around x: 140..1640, y: 590..720
        // Find top border line: y where pixels at x: 200..1500 are border colored (r,g,b around 220..235)
        // Find bottom border line
        // Find left border line
        // Find right border line
        let wtTop = null, wtBottom = null, wtLeft = null, wtRight = null;
        for (let y = 580; y <= 630; y++) {
          let count = 0;
          for (let x = 300; x <= 1400; x++) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] < 235 && p[1] < 230 && p[2] < 220 && p[0] > 180) count++;
          }
          if (count > 800) { wtTop = y; break; }
        }
        for (let y = 720; y >= 670; y--) {
          let count = 0;
          for (let x = 300; x <= 1400; x++) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] < 235 && p[1] < 230 && p[2] < 220 && p[0] > 180) count++;
          }
          if (count > 800) { wtBottom = y; break; }
        }
        for (let x = 120; x <= 180; x++) {
          let count = 0;
          for (let y = 620; y <= 680; y++) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] < 235 && p[1] < 230 && p[2] < 220 && p[0] > 180) count++;
          }
          if (count > 40) { wtLeft = x; break; }
        }
        for (let x = 1680; x >= 1600; x--) {
          let count = 0;
          for (let y = 620; y <= 680; y++) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] < 235 && p[1] < 230 && p[2] < 220 && p[0] > 180) count++;
          }
          if (count > 40) { wtRight = x; break; }
        }

        // 2. Thawing Method box bounds
        // Starts after y: 790
        let mTop = null, mBottom = null;
        for (let y = 790; y <= 840; y++) {
          let count = 0;
          for (let x = 300; x <= 1400; x++) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] < 240 && p[1] < 230 && p[2] < 220 && p[0] > 180) count++;
          }
          if (count > 600) { mTop = y; break; }
        }
        for (let y = 940; y >= 900; y--) {
          let count = 0;
          for (let x = 300; x <= 1400; x++) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] < 240 && p[1] < 230 && p[2] < 220 && p[0] > 180) count++;
          }
          if (count > 600) { mBottom = y; break; }
        }

        // 3. Target Date/Time pill bounds
        let tTop = null, tBottom = null;
        for (let y = 950; y <= 990; y++) {
          let count = 0;
          for (let x = 300; x <= 1400; x++) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] < 240 && p[1] < 230 && p[2] < 220 && p[0] > 180) count++;
          }
          if (count > 600) { tTop = y; break; }
        }
        for (let y = 1060; y >= 1020; y--) {
          let count = 0;
          for (let x = 300; x <= 1400; x++) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] < 240 && p[1] < 230 && p[2] < 220 && p[0] > 180) count++;
          }
          if (count > 600) { tBottom = y; break; }
        }

        // 4. Start Thawing banner bounds
        let stTop = null, stBottom = null, stLeft = null, stRight = null;
        for (let y = 1060; y <= 1120; y++) {
          let count = 0;
          for (let x = 300; x <= 1400; x++) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            // Orange/peach border or fill
            if (p[0] > 240 && p[1] > 180 && p[1] < 230 && p[2] < 200) count++;
          }
          if (count > 600) { stTop = y; break; }
        }
        for (let y = 1350; y >= 1280; y--) {
          let count = 0;
          for (let x = 300; x <= 1400; x++) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] > 240 && p[1] > 180 && p[1] < 230 && p[2] < 200) count++;
          }
          if (count > 600) { stBottom = y; break; }
        }

        return {
          dimensions: { W, H },
          weightTrack: {
            top: wtTop, bottom: wtBottom, left: wtLeft, right: wtRight,
            pctTop: (wtTop / H * 100).toFixed(2) + "%",
            pctHeight: ((wtBottom - wtTop) / H * 100).toFixed(2) + "%",
            pctLeft: (wtLeft / W * 100).toFixed(2) + "%",
            pctWidth: ((wtRight - wtLeft) / W * 100).toFixed(2) + "%"
          },
          methodBox: {
            top: mTop, bottom: mBottom,
            pctTop: (mTop / H * 100).toFixed(2) + "%",
            pctHeight: ((mBottom - mTop) / H * 100).toFixed(2) + "%"
          },
          targetPill: {
            top: tTop, bottom: tBottom,
            pctTop: (tTop / H * 100).toFixed(2) + "%",
            pctHeight: ((tBottom - tTop) / H * 100).toFixed(2) + "%"
          },
          startThawing: {
            top: stTop, bottom: stBottom,
            pctTop: (stTop / H * 100).toFixed(2) + "%",
            pctHeight: ((stBottom - stTop) / H * 100).toFixed(2) + "%"
          }
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log("PIXEL-PERFECT MEASUREMENTS:", JSON.stringify(evalRes.result.value, null, 2));
  } finally {
    proc.kill();
  }
}

masterInspect();

