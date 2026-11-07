import { spawn } from "child_process";

async function inspectCalculatorVisuals() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9256",
    "--disable-gpu",
    "--window-size=1920,1080",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3500));
  try {
    const pages = await (await fetch("http://127.0.0.1:9256/json/list")).json();
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

    // Scroll to dashboard
    await send("Runtime.evaluate", {
      expression: `(() => {
        document.getElementById("dashboard").scrollIntoView();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    // Check positions and bounding rects of all interactive elements in #dashboard
    const evalRes = await send("Runtime.evaluate", {
      expression: `(() => {
        const dash = document.getElementById("dashboard");
        const dashRect = dash.getBoundingClientRect();
        const img = dash.querySelector("img");
        const imgRect = img.getBoundingClientRect();

        const elements = Array.from(dash.children[0].children).filter(el => el.tagName !== "IMG").map(el => {
          const r = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            className: el.className ? el.className.slice(0, 40) : "",
            text: el.innerText ? el.innerText.slice(0, 30) : "",
            rect: {
              topRel: (r.top - imgRect.top),
              topPct: ((r.top - imgRect.top) / imgRect.height * 100).toFixed(2) + "%",
              leftRel: (r.left - imgRect.left),
              leftPct: ((r.left - imgRect.left) / imgRect.width * 100).toFixed(2) + "%",
              width: r.width,
              widthPct: (r.width / imgRect.width * 100).toFixed(2) + "%",
              height: r.height,
              heightPct: (r.height / imgRect.height * 100).toFixed(2) + "%"
            }
          };
        });

        return {
          imgDimensions: { w: img.naturalWidth, h: img.naturalHeight },
          imgRendered: { w: imgRect.width, h: imgRect.height },
          elements
        };
      })()`,
      returnByValue: true
    });

    console.log("SECTION 2 OVERLAYS:", JSON.stringify(evalRes.result.value, null, 2));
  } finally {
    proc.kill();
  }
}

inspectCalculatorVisuals();

