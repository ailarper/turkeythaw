import { spawn } from "child_process";

async function main() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--disable-gpu",
    "about:blank",
  ]);

  // Wait 2s for chrome
  await new Promise((r) => setTimeout(r, 2000));

  try {
    const newTabRes = await fetch("http://127.0.0.1:9222/json/new?http://localhost:3000", { method: "PUT" });
    const tabData = await newTabRes.json();
    console.log("Opened tab:", tabData.id, tabData.url);

    const ws = new WebSocket(tabData.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const reqId = id++;
        callbacks.set(reqId, resolve);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });
    }

    await send("Page.enable");
    await send("Runtime.enable");

    // Wait 3.5 seconds for Next.js client hydration
    await new Promise((r) => setTimeout(r, 3500));

    // Helper to evaluate and return value
    async function evaluate(code) {
      const resp = await send("Runtime.evaluate", {
        expression: code,
        returnByValue: true,
      });
      return resp.result?.result?.value;
    }

    const check1 = await evaluate(`
      (() => {
        const results = {};
        results.sections = ['planner', 'dashboard', 'guide', 'timeline'].map(id => !!document.getElementById(id));
        const buttons = Array.from(document.querySelectorAll('button, a'));
        results.totalInteractive = buttons.length;
        results.hasNavPlanDinner = buttons.some(b => b.getAttribute('aria-label')?.includes('Plan dinner'));
        results.hasAddCalendar = buttons.some(b => b.getAttribute('aria-label')?.includes('+ Add to Calendar'));
        results.hasCheatSheet = buttons.some(b => b.getAttribute('aria-label')?.includes('Download Kitchen Cheat-Sheet PDF'));
        results.hasBackToTop = buttons.some(b => b.getAttribute('aria-label')?.includes('Back to top'));
        
        // Click cheat sheet button
        const cheatSheetBtn = buttons.find(b => b.getAttribute('aria-label')?.includes('Download Kitchen Cheat-Sheet PDF'));
        if (cheatSheetBtn) {
          cheatSheetBtn.click();
        }
        return results;
      })()
    `);
    console.log("1. Initial Sections & Buttons:", check1);

    await new Promise((r) => setTimeout(r, 600));

    const checkModal = await evaluate(`
      (() => {
        const modalText = document.body.innerText;
        return {
          hasModalHeading: modalText.includes("Kitchen Cheat-Sheet & Safety Card"),
          hasTimesTable: modalText.includes("USDA Thawing Times"),
          has165F: modalText.includes("165°F (74°C)"),
        };
      })()
    `);
    console.log("2. Cheat Sheet Modal State:", checkModal);

    const checkPager = await evaluate(`
      (() => {
        const pagerButtons = Array.from(document.querySelectorAll('nav[aria-label="Section Navigation Dock"] button'));
        return {
          pagerCount: pagerButtons.length,
          labels: pagerButtons.map(b => b.textContent?.trim())
        };
      })()
    `);
    console.log("3. Sticky Pager 4-Dot Dock:", checkPager);

    const clickDebug = await evaluate(`
      (() => {
        const debugBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Debug Hotspots'));
        if (debugBtn) {
          debugBtn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log("4. Clicked Debug Hotspots:", clickDebug);

    await new Promise((r) => setTimeout(r, 400));

    const checkDebugState = await evaluate(`
      (() => {
        const redBadges = Array.from(document.querySelectorAll('span')).filter(s => s.className?.includes('bg-red-600'));
        return { redBadgesCount: redBadges.length };
      })()
    `);
    console.log("5. Debug Mode Active Badges:", checkDebugState);

    ws.close();
  } finally {
    proc.kill();
  }
}

main().catch(console.error);
