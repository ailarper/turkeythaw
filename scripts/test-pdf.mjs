import { spawn } from 'child_process';
import fs from 'fs';

async function testPdf() {
  const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9273',
    '--disable-gpu',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const pages = await (await fetch('http://127.0.0.1:9273/json/list')).json();
    const target = pages.find(p => p.url.includes('localhost:3000'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (m, p = {}) => new Promise((resolve, reject) => {
      const curId = id++;
      const h = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.id === curId) {
          ws.removeEventListener('message', h);
          if (d.error) reject(d.error);
          else resolve(d.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method: m, params: p }));
    });

    await send('Page.enable');
    const pdfRes = await send('Page.printToPDF', {
      printBackground: true,
      preferCSSPageSize: true,
    });

    if (pdfRes && pdfRes.data) {
      console.log('Success! PDF byte length:', Buffer.from(pdfRes.data, 'base64').length);
      fs.writeFileSync('public/TurkeyThaw-Cheat-Sheet.pdf', Buffer.from(pdfRes.data, 'base64'));
      fs.writeFileSync('public/TurkeyThaw-Kitchen-Cheat-Sheet.pdf', Buffer.from(pdfRes.data, 'base64'));
    }
    ws.close();
  } catch (err) {
    console.error('Error generating PDF:', err);
  } finally {
    proc.kill();
  }
}

testPdf();

