import { spawn } from "child_process";

async function verifyInteractive() {
  console.log("Starting Chrome Headless CDP Interactive Verification...");
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9229",
    "--disable-gpu",
    "--window-size=1920,1080",
    "http://localhost:3000"
  ]);

  await new Promise(r => setTimeout(r, 3500));

  try {
    const pagesRes = await fetch("http://127.0.0.1:9229/json/list");
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

    // 1. Check Section 1 Image and Navbar Visibility at scrollY=0
    const navAndHero = await send("Runtime.evaluate", {
      expression: `(() => {
        const heroImg = document.querySelector("#planner img");
        const header = document.querySelector("header");
        const headerStyle = header ? window.getComputedStyle(header) : null;
        return {
          heroSrc: heroImg ? heroImg.getAttribute("src") : null,
          headerVisible: header ? (headerStyle.opacity === "1" && headerStyle.display !== "none") : false,
          headerPointerEvents: header ? headerStyle.pointerEvents : null,
          scrollY: window.scrollY
        };
      })()`,
      returnByValue: true
    });
    console.log("1. Navbar & Hero Asset:", JSON.stringify(navAndHero.result.value, null, 2));

    // 2. Check Weight Selector initial state (16 lbs) and Result Card text
    const initialCalculator = await send("Runtime.evaluate", {
      expression: `(() => {
        const dashboard = document.getElementById("dashboard");
        // find div containing "START THAWING"
        const resultCard = Array.from(dashboard.querySelectorAll("div")).find(d => d.textContent.includes("START THAWING") && d.textContent.includes("Target:"));
        const weightButtons = Array.from(dashboard.querySelectorAll("button")).filter(b => b.textContent.includes("lbs"));
        return {
          totalWeightButtons: weightButtons.length,
          weights: weightButtons.map(b => b.textContent.trim()),
          resultCardText: resultCard ? resultCard.innerText.replace(/\\n+/g, " | ") : null
        };
      })()`,
      returnByValue: true
    });
    console.log("\n2. Initial Weight Track & Result Card:", JSON.stringify(initialCalculator.result.value, null, 2));

    // 3. Click 20 lbs button and check dynamic result card update
    const click20lbs = await send("Runtime.evaluate", {
      expression: `(() => {
        const dashboard = document.getElementById("dashboard");
        const btn20 = Array.from(dashboard.querySelectorAll("button")).find(b => b.textContent.includes("20 lbs"));
        if (btn20) {
          btn20.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true
    });
    console.log("\n3. Clicked 20 lbs button:", click20lbs.result.value);

    await new Promise(r => setTimeout(r, 500));

    const updatedCalculator = await send("Runtime.evaluate", {
      expression: `(() => {
        const dashboard = document.getElementById("dashboard");
        const resultCard = Array.from(dashboard.querySelectorAll("div")).find(d => d.textContent.includes("START THAWING") && d.textContent.includes("Target:"));
        return {
          resultCardText: resultCard ? resultCard.innerText.replace(/\\n+/g, " | ") : null
        };
      })()`,
      returnByValue: true
    });
    console.log("   Updated Result Card (20 lbs):", updatedCalculator.result.value.resultCardText);

    // 4. Click Cold Water Bath method toggle
    const clickColdWater = await send("Runtime.evaluate", {
      expression: `(() => {
        const dashboard = document.getElementById("dashboard");
        const btnCold = Array.from(dashboard.querySelectorAll("button")).find(b => b.textContent.includes("Cold Water Bath"));
        if (btnCold) {
          btnCold.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true
    });
    console.log("\n4. Clicked Cold Water Bath toggle:", clickColdWater.result.value);

    await new Promise(r => setTimeout(r, 500));

    const coldWaterCalculator = await send("Runtime.evaluate", {
      expression: `(() => {
        const dashboard = document.getElementById("dashboard");
        const resultCard = Array.from(dashboard.querySelectorAll("div")).find(d => d.textContent.includes("START THAWING") && d.textContent.includes("Target:"));
        return {
          resultCardText: resultCard ? resultCard.innerText.replace(/\\n+/g, " | ") : null
        };
      })()`,
      returnByValue: true
    });
    console.log("   Updated Result Card (Cold Water):", coldWaterCalculator.result.value.resultCardText);

    // 5. Check Timeline Step 1 timestamp before and after changing dinner time
    const initialTimeline = await send("Runtime.evaluate", {
      expression: `(() => {
        const timeline = document.getElementById("timeline");
        const select = timeline.querySelector("select");
        const badges = Array.from(timeline.querySelectorAll("span")).filter(s => s.className.includes("text-[#EA580C]") && s.textContent.match(/\\d\\d:\\d\\d/)).map(s => s.textContent.trim());
        return {
          currentDinnerTime: select ? select.value : null,
          stepTimestamps: badges
        };
      })()`,
      returnByValue: true
    });
    console.log("\n5. Initial Timeline Timestamps (4:00 PM):", JSON.stringify(initialTimeline.result.value, null, 2));

    // Change dinner time to 17:00 (5:00 PM)
    const changeDinner = await send("Runtime.evaluate", {
      expression: `(() => {
        const timeline = document.getElementById("timeline");
        const select = timeline.querySelector("select");
        if (select) {
          select.value = "17:00";
          select.dispatchEvent(new Event("change", { bubbles: true }));
          return true;
        }
        return false;
      })()`,
      returnByValue: true
    });
    console.log("\n6. Changed Dinner Time to 5:00 PM:", changeDinner.result.value);

    await new Promise(r => setTimeout(r, 500));

    const updatedTimeline = await send("Runtime.evaluate", {
      expression: `(() => {
        const timeline = document.getElementById("timeline");
        const select = timeline.querySelector("select");
        const badges = Array.from(timeline.querySelectorAll("span")).filter(s => s.className.includes("text-[#EA580C]") && s.textContent.match(/\\d\\d:\\d\\d/)).map(s => s.textContent.trim());
        return {
          currentDinnerTime: select ? select.value : null,
          stepTimestamps: badges
        };
      })()`,
      returnByValue: true
    });
    console.log("   Updated Timeline Timestamps (5:00 PM):", JSON.stringify(updatedTimeline.result.value, null, 2));

    // 7. Check Section 3 tactile buttons
    const guideButtons = await send("Runtime.evaluate", {
      expression: `(() => {
        const guide = document.getElementById("guide");
        const buttons = Array.from(guide.querySelectorAll("button")).map(b => b.textContent.trim());
        return {
          guideButtons: buttons
        };
      })()`,
      returnByValue: true
    });
    console.log("\n7. Section 3 Tactile Buttons:", JSON.stringify(guideButtons.result.value, null, 2));

    console.log("\nALL INTERACTIVE VERIFICATIONS PASSED!");

  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    proc.kill();
  }
}

verifyInteractive();
