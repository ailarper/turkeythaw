import { spawn } from "child_process";

async function verifyAll7Fixes() {
  console.log("Starting Chrome Headless CDP Verification for All 7 Fixes...");
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9254",
    "--disable-gpu",
    "--window-size=1920,1080",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3500));

  try {
    const pagesRes = await fetch("http://127.0.0.1:9254/json/list");
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
    await send("Page.navigate", { url: "http://localhost:3000" });
    await new Promise(r => setTimeout(r, 4000));

    // TEST 1: Bug 1 - Calendar Buttons Transparency & Zero Shadow
    const b1 = await send("Runtime.evaluate", {
      expression: `(() => {
        const addBtn = document.querySelector("button[aria-label='Add Turkey Thaw to Google Calendar']");
        const icsBtn = document.querySelector("button[aria-label='Download Turkey Thaw .ICS Calendar File']");
        return {
          addBg: addBtn ? window.getComputedStyle(addBtn).backgroundColor : null,
          icsBg: icsBtn ? window.getComputedStyle(icsBtn).backgroundColor : null,
          addShadow: addBtn ? window.getComputedStyle(addBtn).boxShadow : null,
          icsShadow: icsBtn ? window.getComputedStyle(icsBtn).boxShadow : null,
          addBorder: addBtn ? window.getComputedStyle(addBtn).borderWidth : null
        };
      })()`,
      returnByValue: true
    });
    console.log("1. Bug 1 Calendar Buttons Style:", JSON.stringify(b1.result.value, null, 2));

    // TEST 2: Bug 2 - Zero HTML overlay on Danger Zone bar
    const b2 = await send("Runtime.evaluate", {
      expression: `(() => {
        const dangerBtn = document.querySelector("button[aria-label*='USDA Danger Zone']");
        const gradientBars = Array.from(document.querySelectorAll("#dashboard div")).filter(el => {
          const cls = el.className || "";
          return typeof cls === "string" && cls.includes("bg-gradient");
        });
        return {
          dangerBtnBg: dangerBtn ? window.getComputedStyle(dangerBtn).backgroundColor : null,
          gradientBarsCount: gradientBars.length
        };
      })()`,
      returnByValue: true
    });
    console.log("2. Bug 2 Danger Zone Bar Overlay:", JSON.stringify(b2.result.value, null, 2));

    // TEST 3: Bug 3 - Start Thawing Text Patch position & background
    // Click 14 lbs button
    await send("Runtime.evaluate", {
      expression: `(() => {
        const btn14 = Array.from(document.querySelectorAll("#dashboard button")).find(b => b.textContent.trim() === "14 lbs");
        if (btn14) btn14.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    const b3 = await send("Runtime.evaluate", {
      expression: `(() => {
        const dashboard = document.querySelector("#dashboard");
        // Find text patch container with #F9EFE6
        const patch = Array.from(dashboard.querySelectorAll("div")).find(d => {
          const cls = d.className || "";
          return typeof cls === "string" && cls.includes("bg-[#F9EFE6]");
        });
        return {
          hasPatch: !!patch,
          style: patch ? patch.getAttribute("style") : null,
          bgColor: patch ? window.getComputedStyle(patch).backgroundColor : null,
          text: patch ? patch.innerText.replace(/\\n+/g, " | ") : null
        };
      })()`,
      returnByValue: true
    });
    console.log("3. Bug 3 Start Thawing Card Patch (14 lbs):", JSON.stringify(b3.result.value, null, 2));

    // TEST 4: Bug 4 - Weight Track & Method Selector Heights and Single-Line weights
    const b4 = await send("Runtime.evaluate", {
      expression: `(() => {
        const dashboard = document.querySelector("#dashboard");
        const weightTrack = Array.from(dashboard.querySelectorAll("div")).find(d => d.style && d.style.top && d.style.top.includes("39"));
        const methodSelector = Array.from(dashboard.querySelectorAll("div")).find(d => d.style && d.style.top && d.style.top.includes("52"));
        const weightButtons = Array.from(weightTrack ? weightTrack.querySelectorAll("button") : []).map(b => b.innerText.trim());
        return {
          weightTrackTop: weightTrack ? weightTrack.style.top : null,
          methodSelectorTop: methodSelector ? methodSelector.style.top : null,
          weightButtonsText: weightButtons
        };
      })()`,
      returnByValue: true
    });
    console.log("4. Bug 4 Weight Track & Method Selector Alignment:", JSON.stringify(b4.result.value, null, 2));

    // TEST 5: Bug 5 - Target Ready Date & Time Dropdown
    const b5 = await send("Runtime.evaluate", {
      expression: `(() => {
        const targetSelect = document.querySelector("select[aria-label='Target Ready Date and Time']");
        const initialVal = targetSelect ? targetSelect.value : null;
        if (targetSelect) {
          targetSelect.value = "16:00";
          targetSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
        return {
          initialVal,
          updatedVal: targetSelect ? targetSelect.value : null
        };
      })()`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 600));

    const b5Schedule = await send("Runtime.evaluate", {
      expression: `(() => {
        const patch = Array.from(document.querySelectorAll("#dashboard div")).find(d => {
          const cls = d.className || "";
          return typeof cls === "string" && cls.includes("bg-[#F9EFE6]");
        });
        return {
          updatedScheduleText: patch ? patch.innerText.replace(/\\n+/g, " | ") : null
        };
      })()`,
      returnByValue: true
    });
    console.log("5. Bug 5 Target Time Dropdown & Schedule Update:", JSON.stringify({ ...b5.result.value, ...b5Schedule.result.value }, null, 2));

    // TEST 6: Bug 6 - FAQ & Modal Typography
    // Click Emergency 1
    await send("Runtime.evaluate", {
      expression: `(() => {
        const btn = document.querySelector("button[aria-label*='Morning Panic']");
        if (btn) btn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    const b6 = await send("Runtime.evaluate", {
      expression: `(() => {
        const drawer = document.querySelector("#guide .shadow-xl");
        const heading = drawer ? drawer.querySelector("h4") : null;
        const body = drawer ? drawer.querySelector("p") : null;
        return {
          headingClass: heading ? heading.className : null,
          headingLetterSpacing: heading ? window.getComputedStyle(heading).letterSpacing : null,
          bodyColor: body ? window.getComputedStyle(body).color : null
        };
      })()`,
      returnByValue: true
    });
    console.log("6. Bug 6 Typography Styles:", JSON.stringify(b6.result.value, null, 2));

    // TEST 7: Bug 7 - Illustrated Cloche Logo Everywhere
    const b7 = await send("Runtime.evaluate", {
      expression: `(() => {
        const navImg = document.querySelector("header button img");
        const footerImg = document.querySelector("footer img");
        const iconLinks = Array.from(document.querySelectorAll("link[rel*='icon']")).map(l => ({
          rel: l.getAttribute("rel"),
          href: l.getAttribute("href")
        }));
        return {
          navImgSrc: navImg ? navImg.getAttribute("src") : null,
          footerImgSrc: footerImg ? footerImg.getAttribute("src") : null,
          iconLinks
        };
      })()`,
      returnByValue: true
    });
    console.log("7. Bug 7 Cloche Logo & Browser Favicon:", JSON.stringify(b7.result.value, null, 2));

  } finally {
    proc.kill();
  }
}

verifyAll7Fixes();
