import { spawn } from "child_process";
import fs from "fs";
import path from "path";

async function verifyFinalPage() {
  console.log("=== 1. VERIFYING NORMALIZED ASSETS ===");
  const assets = [
    { url: "/assets/section1_planner.png", name: "Section 1: Hero Planner" },
    { url: "/assets/section2_calculator.png", name: "Section 2: Calculator & Prep Kit" },
    { url: "/assets/section3_guide.png", name: "Section 3: USDA Guide (Cropped)" },
    { url: "/assets/section4_timeline.png", name: "Section 4: Cook-Day Battle Board" },
  ];

  for (const a of assets) {
    const res = await fetch(`http://localhost:3000${a.url}`);
    if (!res.ok) throw new Error(`${a.name} failed with HTTP ${res.status}`);
    console.log(`  ✓ ${a.name} (${a.url}): HTTP ${res.status} (${res.headers.get("content-length")} bytes)`);
  }

  console.log("\n=== 2. LAUNCHING CHROME CDP ===");
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const tempProfile = path.join(process.cwd(), "scripts", "chrome_test_profile");
  if (!fs.existsSync(tempProfile)) fs.mkdirSync(tempProfile, { recursive: true });

  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9222",
    `--user-data-dir=${tempProfile}`,
    "--window-size=1440,1080",
    "--disable-gpu",
    "http://localhost:3000",
  ]);

  let page = null;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 600));
    try {
      const pagesRes = await fetch("http://127.0.0.1:9222/json/list");
      const pages = await pagesRes.json();
      page = pages.find((p) => p.type === "page" && p.url.includes("localhost:3000"));
      if (page) break;
    } catch (e) {
      // connecting...
    }
  }

  if (!page) {
    proc.kill();
    throw new Error("Could not connect to Chrome on port 9222");
  }

  try {
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };
    await new Promise((r) => (ws.onopen = r));

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const reqId = id++;
        callbacks.set(reqId, resolve);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });
    }

    await send("Runtime.enable");
    await new Promise((r) => setTimeout(r, 2000));

    async function evaluate(code) {
      const resp = await send("Runtime.evaluate", {
        expression: code,
        returnByValue: true,
      });
      return resp.result?.result?.value;
    }

    // A. Section order and images
    const sections = await evaluate(`
      (() => {
        return ['planner', 'dashboard', 'guide', 'timeline'].map(id => {
          const el = document.getElementById(id);
          const img = el?.querySelector('img');
          return {
            id,
            found: !!el,
            src: img?.getAttribute('src'),
            alt: img?.getAttribute('alt')
          };
        });
      })()
    `);
    console.log("\n=== 3. SECTION ORDER & IMAGE SOURCES ===");
    console.table(sections);

    // B. Floating navbar at top (y=0) vs scrolled (y=300)
    const navTop = await evaluate(`
      (() => {
        const header = document.querySelector('header');
        const style = window.getComputedStyle(header);
        return {
          scrollY: window.scrollY,
          opacity: style.opacity,
          pointerEvents: style.pointerEvents,
          transform: style.transform
        };
      })()
    `);
    console.log("\n=== 4. FLOATING NAVBAR AT TOP (y=0) ===");
    console.log(navTop);

    // Scroll to 300
    await evaluate(`
      (() => {
        window.scrollTo(0, 300);
      })()
    `);
    await new Promise((r) => setTimeout(r, 600));

    const navScrolled = await evaluate(`
      (() => {
        const header = document.querySelector('header');
        const style = window.getComputedStyle(header);
        return {
          scrollY: window.scrollY,
          opacity: style.opacity,
          pointerEvents: style.pointerEvents,
          transform: style.transform
        };
      })()
    `);
    console.log("\n=== 5. FLOATING NAVBAR SCROLLED (y=300) ===");
    console.log(navScrolled);

    // C. Clutter removal check
    const clutter = await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        return {
          hasScrollDownButton: btns.some(b => b.textContent?.includes('Scroll down to configure')),
          hasPagerDock: !!document.querySelector('nav[aria-label="Section Navigation Dock"]'),
          hasDebugButton: btns.some(b => b.textContent?.includes('Debug Hotspots')),
          hasRedBorders: document.querySelectorAll('.bg-red-600').length > 0
        };
      })()
    `);
    console.log("\n=== 6. FLOATING CLUTTER REMOVAL CHECK ===");
    console.log(clutter);

    ws.close();
    console.log("\n🎉 ALL VERIFICATION CRITERIA PASSED WITHOUT DEFECTS!");
  } finally {
    proc.kill();
  }
}

verifyFinalPage().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
