import { spawn } from "child_process";
import fs from "fs";

async function cropCloche() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9251",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9251/json/list")).json();
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
        // Crop from planner.png
        const img = new Image();
        img.src = "/assets/section1_planner.png";
        await new Promise(r => img.onload = r);

        // Crop bounding box around x: 60..125, y: 30..75
        const c1 = document.createElement("canvas");
        const cropW = 68;
        const cropH = 46;
        c1.width = cropW;
        c1.height = cropH;
        const ctx1 = c1.getContext("2d");
        ctx1.drawImage(img, 60, 30, cropW, cropH, 0, 0, cropW, cropH);

        // Also check if there's an orange cloche icon elsewhere in hero
        return {
          plannerCropData: c1.toDataURL("image/png")
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    const dataUrl = evalRes.result.value.plannerCropData;
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync("public/assets/test_cloche_crop.png", Buffer.from(base64, "base64"));
    console.log("Saved public/assets/test_cloche_crop.png");
  } finally {
    proc.kill();
  }
}

cropCloche();

