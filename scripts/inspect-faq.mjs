import { spawn } from "child_process";

async function inspectFaq() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9232",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pagesRes = await fetch("http://127.0.0.1:9232/json/list");
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
        const timelineImg = document.querySelector("#timeline img");
        const guideImg = document.querySelector("#guide img");
        return {
          timelineNatural: { w: timelineImg.naturalWidth, h: timelineImg.naturalHeight },
          guideNatural: { w: guideImg.naturalWidth, h: guideImg.naturalHeight }
        };
      })()`,
      returnByValue: true
    });
    console.log("FAQ INSPECTION DATA:", JSON.stringify(evalRes.result.value, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    proc.kill();
  }
}

inspectFaq();

