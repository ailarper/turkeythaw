import { spawn } from "child_process";

async function inspectClocheDetails() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9253",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9253/json/list")).json();
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
        img.src = "/assets/logo-cloche.png";
        await new Promise(r => img.onload = r);
        return {
          w: img.width,
          h: img.height
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log("CLOCHE IMAGE:", JSON.stringify(evalRes.result.value, null, 2));
  } finally {
    proc.kill();
  }
}

inspectClocheDetails();

