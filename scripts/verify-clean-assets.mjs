vimport { spawn } from "child_process";
import fs from "fs";

async function verifyCleanAssets() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9269",
    "--disable-gpu",
    "--window-size=1920,1080",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const pages = await (await fetch("http://127.0.0.1:9269/json/list")).json();
    const target = pages.find(p => p.url.includes("localhost:3000"));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (m, p = {}) => new Promise((resolve, reject) => {
      const curId = id++;
      const h = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.id === curId) {
          ws.removeEventListener("message", h);
          if (d.error) reject(d.error);
          else resolve(d.result);
        }
      };
      ws.addEventListener("message", h);
      ws.send(JSON.stringify({ id: curId, method: m, params: p }));
    });

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Page.navigate", { url: "http://localhost:3000" });

    // Wait for hydration
    for (let i = 0; i < 20; i++) {
      const check = await send("Runtime.evaluate", {
        expression: `Boolean(document.querySelector("#dashboard") && document.querySelector("#timeline"))`,
        returnByValue: true
      });
      if (check.result.value) break;
      await new Promise(r => setTimeout(r, 500));
    }
    await new Promise(r => setTimeout(r, 1200));

    // TEST 1: Capture Seam between Section 1 and Section 2
    await send("Runtime.evaluate", {
      expression: `(() => {
        const s2 = document.getElementById("dashboard");
        if (s2) {
          const rect = s2.getBoundingClientRect();
          window.scrollTo(0, window.scrollY + rect.top - 200);
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 800));
    const shotSeam = await send("Page.captureScreenshot", {
      format: "png",
      clip: { x: 0, y: 100, width: 1920, height: 400, scale: 1 }
    });
    fs.writeFileSync("public/clean_assets_seam1_2.png", Buffer.from(shotSeam.data, "base64"));
    console.log("✓ Saved public/clean_assets_seam1_2.png");

    // TEST 2: Section 2 - Select 20 lbs, 6:00 PM Target Time, Cold Water Bath
    await send("Runtime.evaluate", {
      expression: `(() => {
        document.getElementById("dashboard").scrollIntoView({ behavior: "instant" });
        
        // Select 20 lbs
        const btn20 = Array.from(document.querySelectorAll("#dashboard button")).find(b => b.textContent.trim() === "20 lbs");
        if (btn20) btn20.click();

        // Select 6:00 PM target
        const select = document.querySelector("#dashboard select[aria-label='Target Ready Date and Time']");
        if (select) {
          select.value = "18:00";
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    // Check DOM text & styling in Section 2
    const evalSec2 = await send("Runtime.evaluate", {
      expression: `(() => {
        const dashboard = document.querySelector("#dashboard");
        const targetDiv = dashboard.querySelector("div[style*='left: 10.5%']");
        const thawSpan = dashboard.querySelector("span[class*='whitespace-nowrap']");
        
        // Check for any opaque background patches
        const bgPatches = Array.from(dashboard.querySelectorAll("div")).filter(d => {
          const bg = window.getComputedStyle(d).backgroundColor;
          return bg.includes("249, 239, 230") || bg.includes("255, 241, 228") || bg.includes("250, 247, 242");
        });

        return {
          targetText: targetDiv ? targetDiv.textContent.trim() : null,
          targetBg: targetDiv ? window.getComputedStyle(targetDiv).backgroundColor : null,
          thawText: thawSpan ? thawSpan.textContent.trim() : null,
          thawBg: thawSpan ? window.getComputedStyle(thawSpan).backgroundColor : null,
          opaqueBgPatchesCount: bgPatches.length
        };
      })()`,
      returnByValue: true
    });
    console.log("Section 2 Interactive State:", JSON.stringify(evalSec2.result.value, null, 2));

    const shotDashboard = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("public/clean_assets_calculator_6pm.png", Buffer.from(shotDashboard.data, "base64"));
    console.log("✓ Saved public/clean_assets_calculator_6pm.png");

    // TEST 3: Section 4 - Select Dinner Time 6:00 PM
    await send("Runtime.evaluate", {
      expression: `(() => {
        document.getElementById("timeline").scrollIntoView({ behavior: "instant" });
        const select = document.querySelector("#timeline select[aria-label='Dinner Time Selector']");
        if (select) {
          select.value = "18:00";
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    const evalSec4 = await send("Runtime.evaluate", {
      expression: `(() => {
        const timeline = document.querySelector("#timeline");
        const dinnerDiv = timeline.querySelector("div[style*='left: 26.0%']");
        const weightSpan = timeline.querySelector("button[aria-label*='Bird Weight'] span:not(.sr-only)");

        return {
          dinnerLabel: dinnerDiv ? dinnerDiv.textContent.trim() : null,
          dinnerBg: dinnerDiv ? window.getComputedStyle(dinnerDiv).backgroundColor : null,
          weightLabel: weightSpan ? weightSpan.textContent.trim() : null,
          weightBg: weightSpan ? window.getComputedStyle(weightSpan).backgroundColor : null
        };
      })()`,
      returnByValue: true
    });
    console.log("Section 4 Timeline State:", JSON.stringify(evalSec4.result.value, null, 2));

    const shotTimeline = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("public/clean_assets_timeline_dinner.png", Buffer.from(shotTimeline.data, "base64"));
    console.log("✓ Saved public/clean_assets_timeline_dinner.png");

    ws.close();
    console.log("Verification finished successfully!");
  } finally {
    proc.kill();
  }
}

verifyCleanAssets().catch(console.error);
