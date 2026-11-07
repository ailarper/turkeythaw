import { spawn } from "child_process";

async function inspectBoxes() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9248",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9248/json/list")).json();
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

        // Find the weight track box border around y: 560..690, x: 140..1640
        // Find the method box border around y: 760..940, x: 140..1640
        // Find the "Target Ready Date & Time" pill around y: 950..1060, x: 140..1640
        // Let's scan y at x=500 for border color changes
        const yProfile = [];
        for (let y = 500; y <= 1100; y += 4) {
          const p = ctx.getImageData(300, y, 1, 1).data;
          yProfile.push({ y, pctY: (y / img.naturalHeight * 100).toFixed(2) + "%", rgb: [p[0], p[1], p[2]] });
        }
        return {
          w: img.naturalWidth,
          h: img.naturalHeight,
          yProfile
        };
      })()`,
      returnByValue: true
    });

    console.log("IMAGE INFO:", JSON.stringify(evalRes.result.value, null, 2));
  } finally {
    proc.kill();
  }
}

inspectBoxes();
