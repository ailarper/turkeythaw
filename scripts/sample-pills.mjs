import { spawn } from "child_process";

async function test() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, ["--headless=new", "--remote-debugging-port=9271", "--disable-gpu", "http://localhost:3000"]);
  await new Promise(r => setTimeout(r, 2000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9271/json/list")).json();
    const target = pages.find(p => p.url.includes("localhost:3000"));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    const send = (m, p = {}) => new Promise(r => {
      const curId = id++;
      const h = (msg) => { const d = JSON.parse(msg.data); if (d.id === curId) { ws.removeEventListener("message", h); r(d.result); } };
      ws.addEventListener("message", h);
      ws.send(JSON.stringify({ id: curId, method: m, params: p }));
    });
    await send("Runtime.enable");
    const res = await send("Runtime.evaluate", {
      expression: `(async () => {
        const img = new Image();
        img.src = '/assets/section4_timeline.png';
        await new Promise(r => img.onload = r);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const sampleDinnerAbove = ctx.getImageData(1200, 375, 1, 1).data;
        const sampleDinnerBelow = ctx.getImageData(1200, 425, 1, 1).data;
        const sampleWeightAbove = ctx.getImageData(1580, 375, 1, 1).data;
        const sampleWeightBelow = ctx.getImageData(1580, 425, 1, 1).data;

        return {
          dinnerAbove: Array.from(sampleDinnerAbove),
          dinnerBelow: Array.from(sampleDinnerBelow),
          weightAbove: Array.from(sampleWeightAbove),
          weightBelow: Array.from(sampleWeightBelow)
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log(JSON.stringify(res.result ? res.result.value : res, null, 2));
    ws.close();
  } finally {
    proc.kill();
  }
}
test();

