import { spawn } from 'child_process';

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const proc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9271',
  '--disable-gpu',
  'http://localhost:3000'
]);
await new Promise(r => setTimeout(r, 2000));
try {
  const pages = await (await fetch('http://127.0.0.1:9271/json/list')).json();
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
      const img = new Image();
      img.src = '/assets/section3_guide.png';
      await new Promise(r => img.onload = r);
      const canvas = document.createElement('canvas');
      const W = canvas.width = img.naturalWidth;
      const H = canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Card 1 starts with text "Morning Panic" or "Thanksgiving Morning Panic"
      // Let's find border lines. The cards typically have a border with darker color like #E5DCD2 or a box shadow.
      // Let's find for each of the 3 cards where the top, bottom, left, right borders are.
      // Card 1 is roughly y = 45% to 56%
      // Card 2 is roughly y = 59% to 70%
      // Card 3 is roughly y = 73% to 84%
      // Let's find the exact left and right at y = 50%, 65%, 78%
      function findHorizontalBounds(y) {
        let left = -1, right = -1;
        // Search from 55% to 98%
        for (let x = Math.round(W * 0.55); x <= Math.round(W * 0.98); x++) {
          const p = ctx.getImageData(x, y, 1, 1).data;
          // Look for border pixel or inside card transition
          // Page bg is around #FAF6F0 (250, 246, 240)
          // Card border is darker or card bg is whiter (#FFFFFF)
        }
      }

      // Let's log horizontal slices across x from 60% to 98% at y = 45.5% * H, 46.0% * H, 50.0% * H
      const row46 = [];
      const y46 = Math.round(H * 0.46);
      for (let pX = 58; pX <= 98; pX += 0.5) {
        const x = Math.round(W * pX / 100);
        const p = ctx.getImageData(x, y46, 1, 1).data;
        row46.push({ pX: pX + '%', x, hex: '#' + [p[0], p[1], p[2]].map(v => v.toString(16).padStart(2, '0')).join('') });
      }

      return { W, H, row46: row46.filter(r => r.x % 20 === 0 || r.pX === '60%' || r.pX === '60.5%' || r.pX === '61%' || r.pX === '61.2%' || r.pX === '96%' || r.pX === '96.2%' || r.pX === '96.5%' || r.pX === '97%') };
    })()`,
    returnByValue: true,
    awaitPromise: true
  });
  console.log(JSON.stringify(result.result.value, null, 2));
  ws.close();
} finally {
  proc.kill();
}
