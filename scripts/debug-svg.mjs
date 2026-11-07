import { spawn } from "child_process";

async function test() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, ["--headless=new", "--remote-debugging-port=9264", "--disable-gpu", "http://localhost:3000"]);
  await new Promise(r => setTimeout(r, 2000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9264/json/list")).json();
    const target = pages.find(p => p.url.includes("localhost:3000"));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    const send = (m, p = {}) => new Promise((resolve) => {
      const curId = id++;
      const h = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.id === curId) { ws.removeEventListener("message", h); resolve(d.result); }
      };
      ws.addEventListener("message", h);
      ws.send(JSON.stringify({ id: curId, method: m, params: p }));
    });
    await send("Runtime.enable");
    const res = await send("Runtime.evaluate", {
      expression: `(() => {
        const header = document.querySelector('header');
        const svg = header ? header.querySelector('svg') : null;
        if (!svg) return { error: 'No svg in header', headerHtml: header ? header.innerHTML : 'No header' };
        const rect = svg.getBoundingClientRect();
        return {
          outerHtml: svg.outerHTML,
          rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
          computedDisplay: window.getComputedStyle(svg).display,
          computedVisibility: window.getComputedStyle(svg).visibility
        };
      })()`,
      returnByValue: true
    });
    console.log(JSON.stringify(res.result ? res.result.value : res, null, 2));
    ws.close();
  } finally {
    proc.kill();
  }
}
test();

