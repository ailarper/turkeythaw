import { spawn } from "child_process";

async function testInteractions() {
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
    await new Promise((r) => setTimeout(r, 3000));

    async function evaluate(code) {
      const resp = await send("Runtime.evaluate", {
        expression: code,
        returnByValue: true,
      });
      return resp.result?.result?.value;
    }

    // Check external affiliate links targets and URLs
    const affiliateLinks = await evaluate(`
      (() => {
        const links = Array.from(document.querySelectorAll('a[target="_blank"]'));
        return links.map(a => ({
          href: a.href,
          label: a.getAttribute('aria-label'),
          rel: a.rel
        }));
      })()
    `);
    console.log("External affiliate & resource links count:", affiliateLinks.length);
    console.log("Sample links:", affiliateLinks.slice(0, 5));

    // Test weight pill click and toast feedback
    const toastCheck = await evaluate(`
      (() => {
        const p18 = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.includes('Weight 18 lbs'));
        if (p18) p18.click();
        return { clicked18: !!p18 };
      })()
    `);
    console.log("Clicked 18 lbs weight pill:", toastCheck);

    await new Promise((r) => setTimeout(r, 300));

    const toastVisible = await evaluate(`
      (() => {
        const toast = Array.from(document.querySelectorAll('div')).find(d => d.textContent?.includes('Selected 18 lbs bird'));
        return { toastFound: !!toast, text: toast?.textContent?.trim() };
      })()
    `);
    console.log("Toast feedback:", toastVisible);

    ws.close();
  } finally {
    proc.kill();
  }
}

testInteractions().catch(console.error);

