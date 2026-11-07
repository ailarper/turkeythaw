import { spawn } from "child_process";

async function debugDom() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9243",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pagesRes = await fetch("http://127.0.0.1:9243/json/list");
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

    ws.addEventListener("message", (msg) => {
      const d = JSON.parse(msg.data);
      if (d.method === "Runtime.exceptionThrown") {
        console.error("BROWSER EXCEPTION:", JSON.stringify(d.params, null, 2));
      }
      if (d.method === "Runtime.consoleAPICalled") {
        console.log("BROWSER CONSOLE:", d.params.type, d.params.args.map(a => a.value || a.description));
      }
    });

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Page.navigate", { url: "http://localhost:3000" });
    await new Promise(r => setTimeout(r, 4000));

    const domInfo = await send("Runtime.evaluate", {
      expression: `(() => {
        return {
          title: document.title,
          header: document.querySelector("header") ? document.querySelector("header").outerHTML.slice(0, 300) : "NO HEADER",
          timeline: document.querySelector("#timeline") ? "TIMELINE EXISTS" : "NO TIMELINE",
          bodyTextLength: document.body.innerText.length
        };
      })()`,
      returnByValue: true
    });

    console.log("DOM INFO:", JSON.stringify(domInfo.result.value, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    proc.kill();
  }
}

debugDom();

