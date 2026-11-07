import { spawn } from "child_process";

async function verifyAllFixes() {
  console.log("Starting Chrome Headless CDP Complete Verification...");
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9242",
    "--disable-gpu",
    "--window-size=1920,1080",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3500));

  try {
    const pagesRes = await fetch("http://127.0.0.1:9242/json/list");
    const pages = await pagesRes.json();
    const target = pages.find(p => p.url.includes("localhost:3000"));
    if (!target) throw new Error("Could not find localhost:3000 tab");

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

    // Wait for Page.loadEventFired or navigate
    const loadPromise = new Promise(resolve => {
      const loadHandler = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.method === "Page.loadEventFired") {
          ws.removeEventListener("message", loadHandler);
          resolve();
        }
      };
      ws.addEventListener("message", loadHandler);
    });

    await send("Page.navigate", { url: "http://localhost:3000" });
    await Promise.race([loadPromise, new Promise(r => setTimeout(r, 6000))]);
    await new Promise(r => setTimeout(r, 2000));

    // Check page URL
    const urlCheck = await send("Runtime.evaluate", {
      expression: "window.location.href",
      returnByValue: true
    });
    console.log("Current page URL:", urlCheck.result.value);

    // TEST 1: Toast notifications deleted
    const toastCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const allText = document.body.innerText;
        const toastEls = Array.from(document.querySelectorAll("div")).filter(el => {
          const cls = el.className || "";
          return typeof cls === "string" && cls.includes("fixed top-20 right-6");
        });
        return {
          toastElementCount: toastEls.length
        };
      })()`,
      returnByValue: true
    });
    console.log("1. Toast Element Count:", toastCheck.result.value.toastElementCount);

    // TEST 2: Navbar & Footer Logo
    const logoCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const navLogo = document.querySelector("header button div");
        const navSvg = navLogo ? navLogo.querySelector("svg") : null;
        const navPath = navSvg ? navSvg.querySelector("path") : null;
        const footerLogo = document.querySelector("footer div div");
        return {
          navLogoBg: navLogo ? window.getComputedStyle(navLogo).backgroundColor : null,
          hasNavSvg: !!navSvg,
          navPathD: navPath ? navPath.getAttribute("d") : null,
          hasFooterLogo: !!footerLogo
        };
      })()`,
      returnByValue: true
    });
    console.log("2. Navbar & Footer Logo:", JSON.stringify(logoCheck.result.value, null, 2));

    // TEST 3: Section 4 at default dinnerTime 16:00 (Rule 2 check: ZERO patches)
    const timelineDefault = await send("Runtime.evaluate", {
      expression: `(() => {
        const timeline = document.querySelector("#timeline");
        const patches = Array.from(timeline.querySelectorAll("div")).filter(el => {
          const style = el.getAttribute("style") || "";
          return style.includes("33.0%") || (el.className && el.className.includes("bg-white") && style.includes("top"));
        });
        const darkBadges = Array.from(timeline.querySelectorAll("div")).filter(el => {
          const cls = el.className || "";
          return typeof cls === "string" && cls.includes("bg-[#252525]");
        });
        return {
          defaultPatchesCount: patches.length,
          darkBadgesCount: darkBadges.length
        };
      })()`,
      returnByValue: true
    });
    console.log("3. Timeline Default (16:00) Patches & Badges:", JSON.stringify(timelineDefault.result.value, null, 2));

    // TEST 4: Section 4 when dinnerTime changes to 17:00 (Rule 2 check: Exactly 5 patches)
    const timelineChanged = await send("Runtime.evaluate", {
      expression: `(() => {
        const select = document.querySelector("#timeline select");
        if (!select) return { error: "No select found" };
        select.value = "17:00";
        select.dispatchEvent(new Event("change", { bubbles: true }));
        return { value: select.value };
      })()`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 600));

    const timelinePatchesAfterChange = await send("Runtime.evaluate", {
      expression: `(() => {
        const timeline = document.querySelector("#timeline");
        const patches = Array.from(timeline.querySelectorAll("div")).filter(el => {
          const style = el.getAttribute("style") || "";
          return style.includes("top: 33.0%") || style.includes("top: 33%");
        });
        return {
          count: patches.length,
          patches: patches.map(p => ({
            text: p.innerText.trim(),
            style: p.getAttribute("style")
          }))
        };
      })()`,
      returnByValue: true
    });
    console.log("4. Timeline Patches at 17:00:", JSON.stringify(timelinePatchesAfterChange.result.value, null, 2));

    // TEST 5: Section 3 Emergency Accordions (Strict Rule 1 check)
    const emergencyBefore = await send("Runtime.evaluate", {
      expression: `(() => {
        const drawers = Array.from(document.querySelectorAll("#guide div")).filter(el => {
          const cls = el.className || "";
          return typeof cls === "string" && cls.includes("shadow-xl");
        });
        return { drawersBefore: drawers.length };
      })()`,
      returnByValue: true
    });
    console.log("5a. Emergency Drawers Before Click:", emergencyBefore.result.value.drawersBefore);

    // Click Emergency 1 trigger
    await send("Runtime.evaluate", {
      expression: `(() => {
        const btn = document.querySelector("button[aria-label*='Morning Panic']");
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 500));

    const emergencyAfter = await send("Runtime.evaluate", {
      expression: `(() => {
        const drawer = document.querySelector("#guide .shadow-xl");
        return {
          hasDrawer: !!drawer,
          badge: drawer ? drawer.querySelector("span")?.innerText : null,
          title: drawer ? drawer.querySelector("h4")?.innerText : null
        };
      })()`,
      returnByValue: true
    });
    console.log("5b. Emergency Drawer After Click:", JSON.stringify(emergencyAfter.result.value, null, 2));

    // Close Emergency 1
    await send("Runtime.evaluate", {
      expression: `(() => {
        const closeBtn = document.querySelector("#guide .shadow-xl button[aria-label='Close drawer']");
        if (closeBtn) closeBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    // TEST 6: Section 4 FAQ Accordions (Strict Rule 1 check)
    const faqBefore = await send("Runtime.evaluate", {
      expression: `(() => {
        const drawers = Array.from(document.querySelectorAll("#timeline div")).filter(el => {
          const cls = el.className || "";
          return typeof cls === "string" && cls.includes("shadow-xl");
        });
        return { faqDrawersBefore: drawers.length };
      })()`,
      returnByValue: true
    });
    console.log("6a. FAQ Drawers Before Click:", faqBefore.result.value.faqDrawersBefore);

    // Click FAQ 1 trigger
    await send("Runtime.evaluate", {
      expression: `(() => {
        const btn = document.querySelector("button[aria-label*='thawed bird stay']");
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 500));

    const faqAfter = await send("Runtime.evaluate", {
      expression: `(() => {
        const drawer = document.querySelector("#timeline .shadow-xl");
        return {
          hasDrawer: !!drawer,
          badge: drawer ? drawer.querySelector("span")?.innerText : null,
          question: drawer ? drawer.querySelector("h4")?.innerText : null
        };
      })()`,
      returnByValue: true
    });
    console.log("6b. FAQ Drawer After Click:", JSON.stringify(faqAfter.result.value, null, 2));

    // TEST 7: Section 3 Transparent Buttons (No ghosting)
    const s3Buttons = await send("Runtime.evaluate", {
      expression: `(() => {
        const pdfBtn = document.querySelector("button[aria-label='Download Kitchen Cheat-Sheet PDF']");
        const syncBtn = document.querySelector("button[aria-label='Sync Reminders to Calendar']");
        return {
          pdfBg: pdfBtn ? window.getComputedStyle(pdfBtn).backgroundColor : null,
          syncBg: syncBtn ? window.getComputedStyle(syncBtn).backgroundColor : null,
          pdfBorder: pdfBtn ? window.getComputedStyle(pdfBtn).borderWidth : null,
          syncBorder: syncBtn ? window.getComputedStyle(syncBtn).borderWidth : null
        };
      })()`,
      returnByValue: true
    });
    console.log("7. Section 3 Buttons Transparency:", JSON.stringify(s3Buttons.result.value, null, 2));

    // TEST 8: Favicon links in document head
    const faviconCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const icons = Array.from(document.querySelectorAll("link[rel*='icon']")).map(l => ({
          rel: l.getAttribute("rel"),
          href: l.getAttribute("href")
        }));
        return { icons };
      })()`,
      returnByValue: true
    });
    console.log("8. Favicon Link Elements:", JSON.stringify(faviconCheck.result.value, null, 2));

  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    proc.kill();
  }
}

verifyAllFixes();
