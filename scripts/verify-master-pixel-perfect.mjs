import { spawn } from "child_process";
import fs from "fs";

async function runVerification() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9263",
    "--disable-gpu",
    "--window-size=1920,1080",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3000));
  try {
    // 1. Verify /icon.svg
    const iconRes = await fetch("http://localhost:3000/icon.svg");
    console.log("Icon HTTP Status:", iconRes.status, "Content-Type:", iconRes.headers.get("content-type"));
    const iconSvg = await iconRes.text();
    console.log("Icon SVG snippet:", iconSvg.substring(0, 100));

    const pages = await (await fetch("http://127.0.0.1:9263/json/list")).json();
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
    await send("DOM.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Navigate and wait for page hydration
    await send("Page.navigate", { url: "http://localhost:3000" });
    
    // Poll until header is rendered
    for (let i = 0; i < 20; i++) {
      const check = await send("Runtime.evaluate", {
        expression: `Boolean(document.querySelector("header svg") && document.querySelector("#dashboard"))`,
        returnByValue: true
      });
      if (check.result.value) {
        console.log(`Page fully loaded and header svg ready after ${i * 500}ms`);
        break;
      }
      await new Promise(r => setTimeout(r, 500));
    }
    await new Promise(r => setTimeout(r, 1000));

    // Capture Navbar Logo
    const evalHeaderSvg = await send("Runtime.evaluate", {
      expression: `(() => {
        const svg = document.querySelector("header svg");
        const header = document.querySelector("header");
        const rect = svg ? svg.getBoundingClientRect() : null;
        return {
          svgFound: Boolean(svg),
          svgRect: rect,
          svgHtml: svg ? svg.outerHTML : null
        };
      })()`,
      returnByValue: true
    });
    console.log("Navbar SVG check:", evalHeaderSvg.result.value);

    const clipNav = { x: 440, y: 15, width: 320, height: 75, scale: 1 };
    const shotNav = await send("Page.captureScreenshot", { format: "png", clip: clipNav });
    fs.writeFileSync("public/pixel_perfect_navbar_logo.png", Buffer.from(shotNav.data, "base64"));
    console.log("Saved public/pixel_perfect_navbar_logo.png");

    // 1. Scroll to section 2 calculator
    await send("Runtime.evaluate", {
      expression: `(() => {
        const el = document.getElementById("dashboard");
        if (el) el.scrollIntoView({ behavior: "instant" });
      })()`
    });
    await new Promise(r => setTimeout(r, 1500));

    // Click 14 lbs button
    const clickRes = await send("Runtime.evaluate", {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll("#dashboard button"));
        const btn14 = btns.find(b => b.textContent && b.textContent.includes("14 lbs"));
        if (btn14) {
          btn14.click();
          return "Clicked 14 lbs";
        }
        return "14 lbs button not found";
      })()`,
      returnByValue: true
    });
    console.log("Weight click result:", clickRes.result.value);

    await new Promise(r => setTimeout(r, 800));

    // Capture Section 2 Calculator with 14 lbs active and Start Thawing card
    const snapDashboard = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("public/pixel_perfect_calculator_14lbs.png", Buffer.from(snapDashboard.data, "base64"));
    console.log("Saved public/pixel_perfect_calculator_14lbs.png");

    // 2. Scroll to Footer
    await send("Runtime.evaluate", {
      expression: `(() => {
        const footer = document.querySelector("footer");
        if (footer) footer.scrollIntoView({ behavior: "instant" });
      })()`
    });

    await new Promise(r => setTimeout(r, 1500));

    const snapFooter = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("public/pixel_perfect_footer_logo.png", Buffer.from(snapFooter.data, "base64"));
    console.log("Saved public/pixel_perfect_footer_logo.png");

    ws.close();
    console.log("Verification completed successfully!");
  } finally {
    proc.kill();
  }
}

runVerification().catch(console.error);
