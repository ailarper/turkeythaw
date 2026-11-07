import { spawn } from "child_process";

async function inspectStartThawing() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9247",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9247/json/list")).json();
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

        // Banner spans y: ~1070 to 1320
        // Sample background color in the text column at x: 600, 700, 800, 900
        const samples = [];
        for (let x = 500; x <= 1100; x += 100) {
          const p = ctx.getImageData(x, 1150, 1, 1).data;
          samples.push({
            x,
            pctX: (x / img.naturalWidth * 100).toFixed(2) + "%",
            rgb: [p[0], p[1], p[2]],
            hex: "#" + [p[0], p[1], p[2]].map(v => v.toString(16).padStart(2, '0')).join('')
          });
        }
        return { w: img.naturalWidth, h: img.naturalHeight, samples };
      })()`,
      returnByValue: true
    });

    console.log("BANNER SAMPLES:", JSON.stringify(evalRes.result.value, null, 2));
  } finally {
    proc.kill();
  }
}

inspectStartThawing();

