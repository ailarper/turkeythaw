import { spawn } from "child_process";

async function inspectSeams() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, ["--headless=new", "--remote-debugging-port=9267", "--disable-gpu", "http://localhost:3000"]);
  await new Promise(r => setTimeout(r, 2000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9267/json/list")).json();
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
      expression: `(async () => {
        const loadImg = (src) => new Promise(res => {
          const img = new Image();
          img.src = src;
          img.onload = () => res(img);
        });

        const img1 = await loadImg('/assets/section1_planner_clean.png');
        const img2 = await loadImg('/assets/section2_calculator.png');
        const img3 = await loadImg('/assets/section3_guide.png');
        const img4 = await loadImg('/assets/section4_timeline.png');

        const getRow = (img, y) => {
          const c = document.createElement('canvas');
          c.width = img.naturalWidth;
          c.height = 1;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, -y);
          const data = ctx.getImageData(0, 0, img.naturalWidth, 1).data;
          // sample center 5 pixels
          const mid = Math.floor(img.naturalWidth / 2) * 4;
          return [data[mid], data[mid+1], data[mid+2]];
        };

        const sec1Bottom = getRow(img1, img1.naturalHeight - 1);
        const sec2Top = getRow(img2, 0);
        const sec2Bottom = getRow(img2, img2.naturalHeight - 1);
        const sec3Top = getRow(img3, 0);
        const sec3Bottom = getRow(img3, img3.naturalHeight - 1);
        const sec4Top = getRow(img4, 0);

        const hex = (rgb) => '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');

        return {
          seam1_2: { sec1Bottom: hex(sec1Bottom), sec2Top: hex(sec2Top) },
          seam2_3: { sec2Bottom: hex(sec2Bottom), sec3Top: hex(sec3Top) },
          seam3_4: { sec3Bottom: hex(sec3Bottom), sec4Top: hex(sec4Top) }
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log("SEAM ANALYSIS:", JSON.stringify(res.result ? res.result.value : res, null, 2));
    ws.close();
  } finally {
    proc.kill();
  }
}

inspectSeams().catch(console.error);

