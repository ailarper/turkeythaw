import { spawn } from "child_process";

async function testPixel() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9224",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pagesRes = await fetch("http://127.0.0.1:9224/json/list");
    const pages = await pagesRes.json();
    const target = pages.find(p => p.url.includes("localhost:3000"));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    const send = (method, params = {}) => new Promise(res => {
      const curId = id++;
      const handler = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.id === curId) {
          ws.removeEventListener("message", handler);
          res(d.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await send("Runtime.enable");
    const evalRes = await send("Runtime.evaluate", {
      expression: `(() => {
        const img = document.querySelector("#timeline img");
        if (!img) return "No #timeline img found";
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const p = ctx.getImageData(Math.floor(img.naturalWidth / 2), img.naturalHeight - 2, 1, 1).data;
        return { r: p[0], g: p[1], b: p[2], hex: "#" + [p[0], p[1], p[2]].map(x => x.toString(16).padStart(2, "0")).join("") };
      })()`,
      returnByValue: true
    });
    console.log("BOTTOM PIXEL RESULT:", JSON.stringify(evalRes.result.value));
  } catch (err) {
    console.error(err);
  } finally {
    proc.kill();
  }
}

testPixel();

