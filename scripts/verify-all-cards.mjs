import { spawn } from "child_process";

async function verifyAll5Cards() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9234",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pagesRes = await fetch("http://127.0.0.1:9234/json/list");
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
        const img = document.querySelector("#timeline img");
        if (!img) return null;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Find the dark pixels for each card around y: 510..555
        // Card centers are roughly: Card 1 ~ 306px, Card 2 ~ 818px, Card 3 ~ 1330px, Card 4 ~ 1842px, Card 5 ~ 2354px
        const cards = [
          { name: "Step 1", minX: 150, maxX: 450 },
          { name: "Step 2", minX: 660, maxX: 960 },
          { name: "Step 3", minX: 1170, maxX: 1470 },
          { name: "Step 4", minX: 1680, maxX: 1980 },
          { name: "Step 5", minX: 2190, maxX: 2490 }
        ];

        return cards.map(c => {
          const dark = [];
          for (let y = 512; y <= 555; y += 2) {
            for (let x = c.minX; x <= c.maxX; x += 2) {
              const p = ctx.getImageData(x, y, 1, 1).data;
              if (p[0] < 60 && p[1] < 60 && p[2] < 60) {
                dark.push({ x, y });
              }
            }
          }
          if (dark.length === 0) return { name: c.name, count: 0 };
          const minX = Math.min(...dark.map(p => p.x));
          const maxX = Math.max(...dark.map(p => p.x));
          const minY = Math.min(...dark.map(p => p.y));
          const maxY = Math.max(...dark.map(p => p.y));
          return {
            name: c.name,
            left: (minX / img.naturalWidth * 100).toFixed(2) + "%",
            top: (minY / img.naturalHeight * 100).toFixed(2) + "%",
            width: ((maxX - minX) / img.naturalWidth * 100).toFixed(2) + "%",
            height: ((maxY - minY) / img.naturalHeight * 100).toFixed(2) + "%"
          };
        });
      })()`,
      returnByValue: true
    });

    console.log("ALL 5 TIME POSITIONS:", JSON.stringify(evalRes.result.value, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    proc.kill();
  }
}

verifyAll5Cards();

