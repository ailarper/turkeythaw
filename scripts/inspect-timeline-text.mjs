import { spawn } from "child_process";

async function inspectTimelineText() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9237",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pagesRes = await fetch("http://127.0.0.1:9237/json/list");
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

        // Find clusters of dark pixels in y: 360..430
        const darkPixels = [];
        for (let y = 360; y <= 430; y += 2) {
          for (let x = 700; x <= 1800; x += 2) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] < 80 && p[1] < 80 && p[2] < 80) {
              darkPixels.push({ x, y });
            }
          }
        }
        // Group by x ranges
        const clusters = [];
        let cur = [];
        for (let x = 700; x <= 1800; x += 2) {
          const inCol = darkPixels.filter(p => p.x === x);
          if (inCol.length > 0) {
            cur.push(x);
          } else if (cur.length > 0) {
            if (cur[cur.length - 1] - cur[0] > 10) {
              clusters.push({ startX: cur[0], endX: cur[cur.length - 1] });
            }
            cur = [];
          }
        }
        return {
          clusters,
          w: img.naturalWidth,
          h: img.naturalHeight
        };
      })()`,
      returnByValue: true
    });

    console.log("CLUSTERS IN HEADER:", JSON.stringify(evalRes.result.value, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    proc.kill();
  }
}

inspectTimelineText();

