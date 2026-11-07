import { spawn } from "child_process";

async function inspectTimeline() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9231",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pagesRes = await fetch("http://127.0.0.1:9231/json/list");
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

        // Natural width: 2752, natural height: 1536
        // Card 1 is roughly left: 3.6% to 20.8%, top: 28.8% to 67.6%
        // In px: left: 99px to 572px, top: 442px to 1038px
        // Let's find where the orange step circle is and where the time string is
        // Let's scan y from 445 to 550 across x from 110 to 560
        const samples = [];
        for (let y = 450; y <= 550; y += 20) {
          for (let x = 120; x <= 450; x += 50) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            const hex = "#" + [p[0], p[1], p[2]].map(n => n.toString(16).padStart(2, "0")).join("");
            samples.push({ x, y, hex, pctX: (x/img.naturalWidth*100).toFixed(2) + "%", pctY: (y/img.naturalHeight*100).toFixed(2) + "%" });
          }
        }

        // Also check the background of the card (it's white: #ffffff)
        const pInsideCard = ctx.getImageData(250, 520, 1, 1).data;

        return {
          cardBg: "#" + [pInsideCard[0], pInsideCard[1], pInsideCard[2]].map(n => n.toString(16).padStart(2, "0")).join(""),
          samples: samples.filter(s => s.hex.startsWith("#ea") || s.hex.startsWith("#f9") || s.hex.startsWith("#ff"))
        };
      })()`,
      returnByValue: true
    });

    console.log("TIMELINE CARD DATA:", JSON.stringify(evalRes.result.value, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    proc.kill();
  }
}

inspectTimeline();

