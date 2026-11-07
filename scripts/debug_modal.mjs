import { spawn } from "child_process";
import path from "path";

async function debugModal() {
  const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const tempProfile = path.join(process.cwd(), "scripts", "chrome_test_profile");

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
      if (msg.method === "Runtime.exceptionThrown") {
        console.error("Browser Exception:", msg.params.exceptionDetails);
      }
      if (msg.method === "Runtime.consoleAPICalled") {
        console.log("Browser Console:", msg.params.args.map(a => a.value));
      }
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

    const res = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.includes('Download Kitchen Cheat-Sheet PDF'));
          if (!btn) return { btnFound: false };
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return { btnFound: true };
        })()
      `,
      returnByValue: true
    });
    console.log("Click dispatch:", res.result?.result?.value);

    await new Promise((r) => setTimeout(r, 600));

    const check = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const modalHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('Kitchen Cheat-Sheet'));
          return { modalHeadingFound: !!modalHeading };
        })()
      `,
      returnByValue: true
    });
    console.log("Modal heading check:", check.result?.result?.value);

    ws.close();
  } finally {
    proc.kill();
  }
}

debugModal().catch(console.error);

