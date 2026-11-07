import { spawn } from "child_process";

async function inspectCalculatorCardArea() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9240",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pagesRes = await fetch("http://127.0.0.1:9240/json/list");
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

    const evalRes = await send("Runtime.evaluate", {
      expression: `(() => {
        const img = document.querySelector("#dashboard img");
        if (!img) return null;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Scan card area around x: 100..1600, y: 1060..1330
        const darkPixels = [];
        for (let y = 1060; y <= 1330; y += 4) {
          for (let x = 800; x <= 1650; x += 4) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] < 40 && p[1] < 40 && p[2] < 40) {
              darkPixels.push({ x, y });
            }
          }
        }
        return {
          totalDark: darkPixels.length,
          minX: darkPixels.length ? Math.min(...darkPixels.map(p => p.x)) : null,
          maxX: darkPixels.length ? Math.max(...darkPixels.map(p => p.x)) : null,
          minY: darkPixels.length ? Math.min(...darkPixels.map(p => p.y)) : null,
          maxY: darkPixels.length ? Math.max(...darkPixels.map(p => p.y)) : null,
          w: img.naturalWidth,
          h: img.naturalHeight
        };
      })()`,
      returnByValue: true
    });

    console.log("CALCULATOR CARD BUTTON AREA:", JSON.stringify(evalRes.result.value, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    proc.kill();
  }
}

inspectCalculatorCardArea();
