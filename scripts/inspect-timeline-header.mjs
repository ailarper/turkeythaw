import { spawn } from "child_process";

async function inspectTimelineHeader() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9236",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pagesRes = await fetch("http://127.0.0.1:9236/json/list");
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

        // Search for text in the subheader area y: 350..420
        const darkPixels = [];
        for (let y = 340; y <= 420; y += 2) {
          for (let x = 800; x <= 1800; x += 2) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] < 80 && p[1] < 80 && p[2] < 80) {
              darkPixels.push({ x, y });
            }
          }
        }
        return { count: darkPixels.length, minX: Math.min(...darkPixels.map(p => p.x)), maxX: Math.max(...darkPixels.map(p => p.x)), minY: Math.min(...darkPixels.map(p => p.y)), maxY: Math.max(...darkPixels.map(p => p.y)) };
      })()`,
      returnByValue: true
    });

    console.log("TIMELINE HEADER TEXT BOX:", JSON.stringify(evalRes.result.value, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    proc.kill();
  }
}

inspectTimelineHeader();
