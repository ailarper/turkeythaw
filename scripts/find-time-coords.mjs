import { spawn } from "child_process";

async function findTimeCoords() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9233",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pagesRes = await fetch("http://127.0.0.1:9233/json/list");
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
        const img = document.querySelector("#timeline img");
        if (!img) return null;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Scan y from 470 to 570 in Card 1 (x: 120 to 500)
        // Find dark pixels (text) in the top area of Card 1
        const darkPixels = [];
        for (let y = 460; y <= 560; y += 4) {
          for (let x = 120; x <= 500; x += 4) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            // dark text: r, g, b < 60
            if (p[0] < 60 && p[1] < 60 && p[2] < 60) {
              darkPixels.push({ x, y });
            }
          }
        }
        if (darkPixels.length === 0) return { count: 0 };
        const minX = Math.min(...darkPixels.map(p => p.x));
        const maxX = Math.max(...darkPixels.map(p => p.x));
        const minY = Math.min(...darkPixels.map(p => p.y));
        const maxY = Math.max(...darkPixels.map(p => p.y));

        return {
          count: darkPixels.length,
          box: {
            minX, maxX, minY, maxY,
            pctLeft: (minX / img.naturalWidth * 100).toFixed(2) + "%",
            pctTop: (minY / img.naturalHeight * 100).toFixed(2) + "%",
            pctWidth: ((maxX - minX) / img.naturalWidth * 100).toFixed(2) + "%",
            pctHeight: ((maxY - minY) / img.naturalHeight * 100).toFixed(2) + "%"
          }
        };
      })()`,
      returnByValue: true
    });

    console.log("TIME STRING BOX IN CARD 1:", JSON.stringify(evalRes.result.value, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    proc.kill();
  }
}

findTimeCoords();

