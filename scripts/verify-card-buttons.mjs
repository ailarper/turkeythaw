import { spawn } from "child_process";

async function verifyCardButtons() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9241",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pagesRes = await fetch("http://127.0.0.1:9241/json/list");
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

        // Scan button 1 (Add to Calendar) - dark background button
        // Scan button 2 (Download .ICS) - light button with border
        const darkPixels = [];
        for (let y = 1100; y <= 1300; y += 2) {
          for (let x = 800; x <= 1600; x += 2) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            // very dark button fill
            if (p[0] < 30 && p[1] < 30 && p[2] < 30) {
              darkPixels.push({ x, y });
            }
          }
        }
        const b1MinX = Math.min(...darkPixels.map(p => p.x));
        const b1MaxX = Math.max(...darkPixels.map(p => p.x));
        const b1MinY = Math.min(...darkPixels.map(p => p.y));
        const b1MaxY = Math.max(...darkPixels.map(p => p.y));

        return {
          btn1: {
            minX: b1MinX, maxX: b1MaxX, minY: b1MinY, maxY: b1MaxY,
            left: (b1MinX / img.naturalWidth * 100).toFixed(2) + "%",
            top: (b1MinY / img.naturalHeight * 100).toFixed(2) + "%",
            width: ((b1MaxX - b1MinX) / img.naturalWidth * 100).toFixed(2) + "%",
            height: ((b1MaxY - b1MinY) / img.naturalHeight * 100).toFixed(2) + "%"
          }
        };
      })()`,
      returnByValue: true
    });

    console.log("CALCULATOR BUTTON 1:", JSON.stringify(evalRes.result.value, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    proc.kill();
  }
}

verifyCardButtons();

