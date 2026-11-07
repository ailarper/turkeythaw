import { spawn } from "child_process";

async function inspect() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9227",
    "--disable-gpu",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    const pagesRes = await fetch("http://127.0.0.1:9227/json/list");
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
    await new Promise(r => setTimeout(r, 4000));

    const pageState = await send("Runtime.evaluate", {
      expression: `(() => {
        return {
          href: location.href,
          title: document.title,
          images: Array.from(document.querySelectorAll("img")).map(i => ({ id: i.parentElement?.parentElement?.id, src: i.src, naturalWidth: i.naturalWidth, naturalHeight: i.naturalHeight }))
        };
      })()`,
      returnByValue: true
    });
    console.log("PAGE STATE:", JSON.stringify(pageState.result.value, null, 2));

    // 1. Planner Top Dimensions & Color
    const plannerInfo = await send("Runtime.evaluate", {
      expression: `(() => {
        const img = document.querySelector("#planner img");
        if (!img) return null;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Sample top header strip (y: 0 to 90px in natural coords)
        const topSamples = [];
        for (let y = 5; y <= 90; y += 15) {
          const p = ctx.getImageData(Math.floor(img.naturalWidth / 2), y, 1, 1).data;
          topSamples.push({ y, hex: "#" + [p[0], p[1], p[2]].map(x => x.toString(16).padStart(2, "0")).join("") });
        }

        // Check where the hero sky background begins under the baked-in navbar
        const skySamples = [];
        for (let y = 80; y <= 160; y += 10) {
          const p = ctx.getImageData(Math.floor(img.naturalWidth / 2), y, 1, 1).data;
          skySamples.push({ y, hex: "#" + [p[0], p[1], p[2]].map(x => x.toString(16).padStart(2, "0")).join("") });
        }

        return {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          topSamples,
          skySamples
        };
      })()`,
      returnByValue: true
    });
    console.log("PLANNER INFO:\n", JSON.stringify(plannerInfo.result.value, null, 2));

    // 2. Dashboard Weight Selector & Start Thawing card info
    const dashboardInfo = await send("Runtime.evaluate", {
      expression: `(() => {
        const img = document.querySelector("#dashboard img");
        if (!img) return null;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Sample around weight selector (approx top 38% - 44%, left 5% - 58%)
        const yCoord = Math.floor(img.naturalHeight * 0.41);
        const pTrack = ctx.getImageData(Math.floor(img.naturalWidth * 0.06), yCoord, 1, 1).data;
        const pActivePill = ctx.getImageData(Math.floor(img.naturalWidth * 0.28), yCoord, 1, 1).data; // ~16 lbs
        const pCardBg = ctx.getImageData(Math.floor(img.naturalWidth * 0.20), Math.floor(img.naturalHeight * 0.75), 1, 1).data;

        return {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          trackSample: "#" + [pTrack[0], pTrack[1], pTrack[2]].map(x => x.toString(16).padStart(2, "0")).join(""),
          activePillSample: "#" + [pActivePill[0], pActivePill[1], pActivePill[2]].map(x => x.toString(16).padStart(2, "0")).join(""),
          cardBgSample: "#" + [pCardBg[0], pCardBg[1], pCardBg[2]].map(x => x.toString(16).padStart(2, "0")).join("")
        };
      })()`,
      returnByValue: true
    });
    console.log("DASHBOARD INFO:\n", JSON.stringify(dashboardInfo.result.value, null, 2));

    // 3. Timeline Step Cards
    const timelineInfo = await send("Runtime.evaluate", {
      expression: `(() => {
        const img = document.querySelector("#timeline img");
        if (!img) return null;
        return {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        };
      })()`,
      returnByValue: true
    });
    console.log("TIMELINE INFO:\n", JSON.stringify(timelineInfo.result.value, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    proc.kill();
  }
}

inspect();
