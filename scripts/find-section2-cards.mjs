import { spawn } from "child_process";

async function findCards() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9249",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pages = await (await fetch("http://127.0.0.1:9249/json/list")).json();
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
        const img = document.querySelector("#dashboard img");
        if (!img) return null;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Scan x=300 from y=500 to 1100
        // Weight track box starts after "Turkey Weight" heading (heading is ~540..580)
        // Let's find dark borders around y=570..680
        // Method box starts after "Thawing Method" heading (heading is ~740..780)
        // Target pill is ~960..1060
        const darkBorders = [];
        for (let y = 520; y <= 1080; y += 2) {
          const p = ctx.getImageData(300, y, 1, 1).data;
          // check if border or change
          darkBorders.push({ y, rgb: [p[0], p[1], p[2]] });
        }

        // Also let's find the orange drumstick icon & snowflake icon bounds:
        // Drumstick icon is orange (r > 200, g < 120, b < 40)
        const orangePixels = [];
        for (let y = 520; y <= 850; y += 2) {
          for (let x = 140; x <= 300; x += 2) {
            const p = ctx.getImageData(x, y, 1, 1).data;
            if (p[0] > 200 && p[1] > 70 && p[1] < 120 && p[2] < 40) {
              orangePixels.push({ x, y });
            }
          }
        }

        const drumstickY = orangePixels.filter(p => p.y < 650);
        const snowflakeY = orangePixels.filter(p => p.y > 650);

        return {
          drumstick: drumstickY.length ? {
            minY: Math.min(...drumstickY.map(p => p.y)),
            maxY: Math.max(...drumstickY.map(p => p.y)),
            topPct: (Math.min(...drumstickY.map(p => p.y)) / img.naturalHeight * 100).toFixed(2) + "%",
            bottomPct: (Math.max(...drumstickY.map(p => p.y)) / img.naturalHeight * 100).toFixed(2) + "%"
          } : null,
          snowflake: snowflakeY.length ? {
            minY: Math.min(...snowflakeY.map(p => p.y)),
            maxY: Math.max(...snowflakeY.map(p => p.y)),
            topPct: (Math.min(...snowflakeY.map(p => p.y)) / img.naturalHeight * 100).toFixed(2) + "%",
            bottomPct: (Math.max(...snowflakeY.map(p => p.y)) / img.naturalHeight * 100).toFixed(2) + "%"
          } : null,
          w: img.naturalWidth,
          h: img.naturalHeight
        };
      })()`,
      returnByValue: true
    });

    console.log("ICON LOCATIONS:", JSON.stringify(evalRes.result.value, null, 2));
  } finally {
    proc.kill();
  }
}

findCards();

