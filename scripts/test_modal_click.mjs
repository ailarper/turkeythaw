import { spawn } from "child_process";
import fs from "fs";
import path from "path";

async function verifyFinalPage() {
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

  await new Promise((r) => setTimeout(r, 4000));

  try {
    const pagesRes = await fetch("http://127.0.0.1:9222/json/list");
    const pages = await pagesRes.json();
    const page = pages.find((p) => p.type === "page" && p.url.includes("localhost:3000"));
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

    // Scroll to Guide section, click cheat sheet button, and inspect modal
    const testClick = await evaluate(`
      (() => {
        const csBtn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.includes('Download Kitchen Cheat-Sheet PDF'));
        if (csBtn) {
          csBtn.scrollIntoView();
          csBtn.click();
          return { foundAndClicked: true };
        }
        return { foundAndClicked: false };
      })()
    `);
    console.log("Trigger modal result:", testClick);

    await new Promise((r) => setTimeout(r, 600));

    const modalState = await evaluate(`
      (() => {
        const text = document.body.innerText;
        return {
          isOpen: text.includes('Kitchen Cheat-Sheet & Safety Card'),
          hasUSDAThawingTimes: text.includes('USDA Thawing Times')
        };
      })()
    `);
    console.log("Modal state after click:", modalState);

    ws.close();
  } finally {
    proc.kill();
  }
}

verifyFinalPage().catch(console.error);

