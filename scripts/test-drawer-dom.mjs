import { spawn } from 'child_process';

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const proc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9277',
  '--disable-gpu',
  'http://localhost:3000'
]);
await new Promise(r => setTimeout(r, 3500));
try {
  const pages = await (await fetch('http://127.0.0.1:9277/json/list')).json();
  const target = pages.find(p => p.url.includes('localhost:3000'));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (m, p = {}) => new Promise((res, rej) => {
    const curId = id++;
    const h = (msg) => {
      const d = JSON.parse(msg.data);
      if (d.id === curId) {
        ws.removeEventListener('message', h);
        if (d.error) rej(d.error); else res(d.result);
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: curId, method: m, params: p }));
  });
  await send('Runtime.enable');
  const result = await send('Runtime.evaluate', {
    expression: `(async () => {
      // Wait for page hydration
      await new Promise(r => setTimeout(r, 1500));

      const faqBtn = document.querySelector('button[aria-label*="Toggle FAQ: How long can a thawed bird stay"]');
      if (!faqBtn) return { error: 'No faqBtn' };
      faqBtn.click();
      await new Promise(r => setTimeout(r, 600));

      const drawer = Array.from(document.querySelectorAll('div')).find(d => 
        d.className && d.className.includes('bg-[#FFFCF8]') && d.textContent.includes('USDA FAQ Answer')
      );

      return {
        foundDrawer: !!drawer,
        drawerClass: drawer ? drawer.className : null,
        title: drawer ? drawer.querySelector('h4')?.textContent : null,
        badge: drawer ? drawer.querySelector('span')?.textContent : null,
        tabularElements: drawer ? Array.from(drawer.querySelectorAll('.tabular-nums')).map(e => e.textContent) : []
      };
    })()`,
    returnByValue: true,
    awaitPromise: true
  });
  console.log(JSON.stringify(result.result.value, null, 2));
  ws.close();
} finally {
  proc.kill();
}
