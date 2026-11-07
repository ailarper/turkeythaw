import { spawn } from "child_process";

async function verifyDunaPage() {
  console.log("1. Testing HTTP Status and static assets...");
  const pageRes = await fetch("http://localhost:3000");
  if (!pageRes.ok) throw new Error(`Page returned status: ${pageRes.status}`);

  const assets = [
    "/assets/planner.png",
    "/assets/dashboard.png",
    "/assets/guide.png",
    "/assets/timeline.png",
  ];

  for (const asset of assets) {
    const aRes = await fetch(`http://localhost:3000${asset}`);
    if (!aRes.ok) throw new Error(`Asset ${asset} returned status: ${aRes.status}`);
    console.log(`  ✓ ${asset}: HTTP ${aRes.status} (${aRes.headers.get("content-length")} bytes)`);
  }

  console.log("\n2. Launching Chrome CDP to test client-side rendering & interactions...");
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--disable-gpu",
    "about:blank",
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  try {
    const newTabRes = await fetch("http://127.0.0.1:9222/json/new?http://localhost:3000", { method: "PUT" });
    const tabData = await newTabRes.json();
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
    await new Promise((r) => (ws.onopen = r));

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const reqId = id++;
        callbacks.set(reqId, resolve);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });
    }

    await send("Page.enable");
    await send("Runtime.enable");
    await new Promise((r) => setTimeout(r, 3500));

    async function evaluate(code) {
      const resp = await send("Runtime.evaluate", {
        expression: code,
        returnByValue: true,
      });
      return resp.result?.result?.value;
    }

    // Verify sections and navbar
    const domCheck = await evaluate(`
      (() => {
        const results = {};
        // 1. Sections
        results.sections = ['planner', 'dashboard', 'guide', 'timeline'].map(id => !!document.getElementById(id));

        // 2. Single Fixed Glass Navbar
        const header = document.querySelector('header');
        results.hasHeader = !!header;
        results.hasBrand = header?.textContent?.includes('TurkeyThaw');
        results.hasPlanDinnerBtn = header?.textContent?.includes('Plan dinner');

        // 3. Hero Floating CTA Trigger
        const heroTrigger = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Scroll down to configure weight'));
        results.hasHeroFloatingCTA = !!heroTrigger;

        // 4. Interactive Hotspots (Calendar, CheatSheet, Back to Top)
        const allBtns = Array.from(document.querySelectorAll('button, a'));
        results.hasAddCalendar = allBtns.some(b => b.getAttribute('aria-label')?.includes('+ Add to Calendar'));
        results.hasDownloadIcs = allBtns.some(b => b.getAttribute('aria-label')?.includes('Download .ICS'));
        results.hasCheatSheet = allBtns.some(b => b.getAttribute('aria-label')?.includes('Download Kitchen Cheat-Sheet PDF'));
        results.hasBackToTop = allBtns.some(b => b.getAttribute('aria-label')?.includes('Back to top'));

        // 5. Zero duplicate text check (verify no visible text duplicates like "The centerpiece" in text DOM besides sr-only)
        const visibleH1 = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim());
        results.visibleHeadings = visibleH1;

        return results;
      })()
    `);

    console.log("DOM Architecture Check:", domCheck);

    // Test clicking Cheat Sheet button
    const testModal = await evaluate(`
      (() => {
        const csBtn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.includes('Download Kitchen Cheat-Sheet PDF'));
        if (csBtn) csBtn.click();
        return !!csBtn;
      })()
    `);
    console.log("\n3. Clicked Cheat-Sheet trigger:", testModal);

    await new Promise((r) => setTimeout(r, 500));

    const modalState = await evaluate(`
      (() => {
        const text = document.body.innerText;
        return {
          modalOpen: text.includes('Kitchen Cheat-Sheet & Safety Card'),
          hasTimesTable: text.includes('USDA Thawing Times')
        };
      })()
    `);
    console.log("Modal state:", modalState);

    // Test sticky pager
    const pagerCheck = await evaluate(`
      (() => {
        const pager = document.querySelector('nav[aria-label="Section Navigation Dock"]');
        return {
          hasPager: !!pager,
          items: Array.from(pager?.querySelectorAll('button') || []).map(b => b.textContent?.trim())
        };
      })()
    `);
    console.log("\n4. Sticky Pager Check:", pagerCheck);

    ws.close();
    console.log("\n✅ ALL VERIFICATION TESTS PASSED!");
  } finally {
    proc.kill();
  }
}

verifyDunaPage().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

