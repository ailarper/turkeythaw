import { spawn } from "child_process";
import fs from "fs";

async function captureFinalScreenshots() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9255",
    "--disable-gpu",
    "--window-size=1920,1080",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3500));

  try {
    const pagesRes = await fetch("http://127.0.0.1:9255/json/list");
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

    // 1. Screenshot of Section 1 + Navbar Logo
    const snap1 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("public/final_7fixes_navbar_logo.png", Buffer.from(snap1.data, "base64"));
    console.log("Saved public/final_7fixes_navbar_logo.png");

    // 2. Scroll to Section 2, click 14 lbs, select 4:00 PM target
    await send("Runtime.evaluate", {
      expression: `(() => {
        document.getElementById("dashboard").scrollIntoView();
        const btn14 = Array.from(document.querySelectorAll("#dashboard button")).find(b => b.textContent.trim() === "14 lbs");
        if (btn14) btn14.click();
        const targetSelect = document.querySelector("select[aria-label='Target Ready Date and Time']");
        if (targetSelect) {
          targetSelect.value = "16:00";
          targetSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 1200));
    const snap2 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("public/final_7fixes_calculator_14lbs.png", Buffer.from(snap2.data, "base64"));
    console.log("Saved public/final_7fixes_calculator_14lbs.png");

    // 3. Scroll to Section 3 and open Emergency Drawer
    await send("Runtime.evaluate", {
      expression: `(() => {
        document.getElementById("guide").scrollIntoView();
        const btn = document.querySelector("button[aria-label*='Morning Panic']");
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1200));
    const snap3 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("public/final_7fixes_faq_drawer.png", Buffer.from(snap3.data, "base64"));
    console.log("Saved public/final_7fixes_faq_drawer.png");

    // 4. Open CheatSheetModal
    await send("Runtime.evaluate", {
      expression: `(() => {
        const modalBtn = document.querySelector("button[aria-label='Download Kitchen Cheat-Sheet PDF']");
        if (modalBtn) modalBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1200));
    const snap4 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("public/final_7fixes_modal.png", Buffer.from(snap4.data, "base64"));
    console.log("Saved public/final_7fixes_modal.png");

  } finally {
    proc.kill();
  }
}

captureFinalScreenshots();
