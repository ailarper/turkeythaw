import { spawn } from "child_process";

async function scanSection2() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9258",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9258/json/list")).json();
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

        // Scan along y=640 (inside weight track) from x=100 to 1800
        // Weight track background is light cream #FAF7F2 (r > 245, g > 240, b > 235)
        // Background outside weight track is white (255, 255, 255)
        // Border is darker (r < 235)
        const row640 = [];
        for (let x = 120; x <= 1700; x += 4) {
          const p = ctx.getImageData(x, 640, 1, 1).data;
          row640.push({ x, rgb: [p[0], p[1], p[2]] });
        }
        const wtBorders = row640.filter(p => p.rgb[0] < 235 && p.rgb[1] < 230);

        // Scan along y=850 (inside method boxes) from x=100 to 1800
        const row850 = [];
        for (let x = 120; x <= 1700; x += 4) {
          const p = ctx.getImageData(x, 850, 1, 1).data;
          row850.push({ x, rgb: [p[0], p[1], p[2]] });
        }

        // Scan along x=400 from y=750 to 1350 to get vertical boundaries
        const col400 = [];
        for (let y = 750; y <= 1350; y += 4) {
          const p = ctx.getImageData(400, y, 1, 1).data;
          col400.push({ y, rgb: [p[0], p[1], p[2]] });
        }

        return {
          W, H,
          wtBorders: {
            first: wtBorders[0],
            last: wtBorders[wtBorders.length - 1],
            count: wtBorders.length
          },
          col400Samples: col400.filter(p => p.y % 20 === 0)
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log("SCAN RESULT:", JSON.stringify(evalRes.result.value, null, 2));
  } finally {
    proc.kill();
  }
}

scanSection2();

