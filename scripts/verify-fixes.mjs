import { spawn } from 'child_process';
import fs from 'fs';

async function verifyAll() {
  const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9274',
    '--disable-gpu',
    '--window-size=1440,900',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  try {
    const pages = await (await fetch('http://127.0.0.1:9274/json/list')).json();
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

    await send('Runtime.enable');
    await send('Page.enable');

    console.log('--- Waiting for React hydration ---');
    await send('Runtime.evaluate', {
      expression: `new Promise(resolve => {
        const check = () => {
          if (document.querySelector('button[aria-label="Download Turkey Thaw .ICS Calendar File"]')) {
            resolve(true);
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      })`,
      awaitPromise: true
    });

    console.log('--- TEST 1: Instrument window.print & anchor downloads ---');
    const setupRes = await send('Runtime.evaluate', {
      expression: `(() => {
        window.__printCalls = 0;
        window.print = () => { window.__printCalls++; };
        window.__downloads = [];
        
        const origCreate = document.createElement.bind(document);
        document.createElement = function(tag) {
          const el = origCreate(tag);
          if (tag.toLowerCase() === 'a') {
            const origClick = el.click.bind(el);
            el.click = function() {
              window.__downloads.push({
                href: el.href,
                download: el.download
              });
              return origClick();
            };
          }
          return el;
        };
        return true;
      })()`,
      returnByValue: true
    });
    console.log('Instrumentation setup:', setupRes.result.value);

    console.log('\n--- TEST 2: Select 14 lbs and test Section 2 "Download .ICS" ---');
    const icsTestRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        // Click 14 lbs button
        const btn14 = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('14 lbs'));
        if (btn14) btn14.click();
        await new Promise(r => setTimeout(r, 400));

        // Click Section 2 "Download .ICS" button
        const icsBtn = document.querySelector('button[aria-label=\"Download Turkey Thaw .ICS Calendar File\"]');
        if (!icsBtn) return { error: 'ICS button not found' };
        icsBtn.click();
        await new Promise(r => setTimeout(r, 300));

        const lastDl = window.__downloads[window.__downloads.length - 1];
        let icsText = null;
        let eventCount = 0;
        if (lastDl && lastDl.href) {
          const resp = await fetch(lastDl.href);
          icsText = await resp.text();
          eventCount = (icsText.match(/BEGIN:VEVENT/g) || []).length;
        }

        return {
          lastDownload: lastDl,
          eventCount,
          hasVCalendar: icsText && icsText.includes('BEGIN:VCALENDAR') && icsText.includes('END:VCALENDAR'),
          printCalls: window.__printCalls,
          downloadCount: window.__downloads.length
        };
      })()`,
      returnByValue: true,
      awaitPromise: true
    });
    console.log('Section 2 Download .ICS result:', JSON.stringify(icsTestRes.result.value, null, 2));

    console.log('\n--- TEST 3: Test Section 3 "Download Kitchen Cheat-Sheet PDF" direct download ---');
    const pdfDirectRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        const pdfBtn = document.querySelector('button[aria-label=\"Download Kitchen Cheat-Sheet PDF\"]');
        if (!pdfBtn) return { error: 'PDF button not found' };
        pdfBtn.click();
        await new Promise(r => setTimeout(r, 300));

        const lastDl = window.__downloads[window.__downloads.length - 1];
        return {
          lastDownload: lastDl,
          printCalls: window.__printCalls,
          downloadCount: window.__downloads.length
        };
      })()`,
      returnByValue: true,
      awaitPromise: true
    });
    console.log('Section 3 Direct PDF result:', JSON.stringify(pdfDirectRes.result.value, null, 2));

    console.log('\n--- TEST 4: Test Section 3 "Sync Reminders" ---');
    const syncRemindersRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        const syncBtn = document.querySelector('button[aria-label=\"Sync Reminders to Calendar\"]');
        if (!syncBtn) return { error: 'Sync button not found' };
        syncBtn.click();
        await new Promise(r => setTimeout(r, 300));

        const lastDl = window.__downloads[window.__downloads.length - 1];
        return {
          lastDownload: lastDl,
          printCalls: window.__printCalls,
          downloadCount: window.__downloads.length
        };
      })()`,
      returnByValue: true,
      awaitPromise: true
    });
    console.log('Section 3 Sync Reminders result:', JSON.stringify(syncRemindersRes.result.value, null, 2));

    console.log('\n--- TEST 5: Verify Section 3 Emergency Protocol trigger styles & drawer ---');
    const emergencyRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        const trigger = document.querySelector('button[aria-label=\"Toggle Emergency Protocol: Morning Panic: Still Frozen?\"]');
        if (!trigger) return { error: 'Emergency trigger not found' };
        
        const triggerClasses = trigger.className;
        const triggerComputedBg = window.getComputedStyle(trigger).backgroundColor;

        // Click trigger to expand drawer
        trigger.click();
        await new Promise(r => setTimeout(r, 400));

        // Find expanded drawer
        const drawer = document.querySelector('.z-30.bg-\\[\\#FFFCF8\\]');
        if (!drawer) return { error: 'Drawer not found after click' };

        const title = drawer.querySelector('h4');
        const badge = drawer.querySelector('span');
        const body = drawer.querySelector('p');

        const drawerStyle = {
          className: drawer.className,
          computedBg: window.getComputedStyle(drawer).backgroundColor,
          computedBorder: window.getComputedStyle(drawer).borderColor,
          left: drawer.style.left,
          width: drawer.style.width,
          titleClass: title ? title.className : null,
          badgeClass: badge ? badge.className : null,
          bodyClass: body ? body.className : null,
          hasTabularNums: !!drawer.querySelector('.tabular-nums'),
          tabularContent: Array.from(drawer.querySelectorAll('.tabular-nums')).map(el => el.textContent)
        };

        return { triggerClasses, triggerComputedBg, drawerStyle };
      })()`,
      returnByValue: true,
      awaitPromise: true
    });
    console.log('Section 3 Emergency Protocol verification:', JSON.stringify(emergencyRes.result.value, null, 2));

    // Capture screenshot of expanded Emergency drawer
    console.log('\nCapturing screenshot of Section 3 expanded Emergency drawer...');
    await send('Runtime.evaluate', {
      expression: `document.getElementById('guide').scrollIntoView({ behavior: 'instant', block: 'center' })`
    });
    await new Promise(r => setTimeout(r, 500));
    const ss1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\user\\.gemini\\antigravity\\brain\\59fe1592-8af6-4b44-bfdf-c54c1552f4b7\\verified_section3_alpha_drawer.png', Buffer.from(ss1.data, 'base64'));
    console.log('Saved verified_section3_alpha_drawer.png');

    console.log('\n--- TEST 6: Verify Section 4 FAQ trigger styles & drawer ---');
    // First close emergency drawer
    await send('Runtime.evaluate', {
      expression: `(() => {
        const closeBtn = document.querySelector('.z-30.bg-\\\\[\\\\#FFFCF8\\\\] button[aria-label=\"Close drawer\"]');
        if (closeBtn) closeBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 300));
    const faqRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        const trigger = document.querySelector('button[aria-label*=\"Toggle FAQ: How long can a thawed bird stay\"]');
        if (!trigger) return { error: 'FAQ trigger not found' };
        
        const triggerClasses = trigger.className;
        const triggerComputedBg = window.getComputedStyle(trigger).backgroundColor;

        // Click trigger to expand drawer
        trigger.click();
        await new Promise(r => setTimeout(r, 400));

        // Find expanded drawer
        const drawer = document.querySelector('.z-30.bg-\\[\\#FFFCF8\\]');
        if (!drawer) return { error: 'FAQ Drawer not found after click' };

        const title = drawer.querySelector('h4');
        const badge = drawer.querySelector('span');
        const body = drawer.querySelector('p');

        const drawerStyle = {
          className: drawer.className,
          computedBg: window.getComputedStyle(drawer).backgroundColor,
          computedBorder: window.getComputedStyle(drawer).borderColor,
          left: drawer.style.left,
          width: drawer.style.width,
          titleClass: title ? title.className : null,
          badgeClass: badge ? badge.className : null,
          bodyClass: body ? body.className : null,
          hasTabularNums: !!drawer.querySelector('.tabular-nums'),
          tabularContent: Array.from(drawer.querySelectorAll('.tabular-nums')).map(el => el.textContent)
        };

        return { triggerClasses, triggerComputedBg, drawerStyle };
      })()`,
      returnByValue: true,
      awaitPromise: true
    });
    console.log('Section 4 FAQ verification:', JSON.stringify(faqRes.result.value, null, 2));

    // Capture screenshot of expanded FAQ drawer
    console.log('\nCapturing screenshot of Section 4 expanded FAQ drawer...');
    await send('Runtime.evaluate', {
      expression: `document.getElementById('timeline').scrollIntoView({ behavior: 'instant', block: 'center' })`
    });
    await new Promise(r => setTimeout(r, 500));
    const ss2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\user\\.gemini\\antigravity\\brain\\59fe1592-8af6-4b44-bfdf-c54c1552f4b7\\verified_section4_faq_drawer.png', Buffer.from(ss2.data, 'base64'));
    console.log('Saved verified_section4_faq_drawer.png');

    console.log('\n--- TEST 7: Test CheatSheetModal with Active Weight & Direct Download ---');
    const modalRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        // Open modal via banner hotspot
        const bannerHotspot = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('Open Cheat Sheet'));
        if (bannerHotspot) bannerHotspot.click();
        await new Promise(r => setTimeout(r, 400));

        // Verify active weight in modal
        const modal = document.querySelector('.fixed.inset-0.z-50');
        if (!modal) return { error: 'Modal not opened' };

        const activeTag = modal.querySelector('span.uppercase');
        const activeText = activeTag ? activeTag.parentElement.textContent.trim() : null;

        // Click download button inside modal
        const dlBtn = modal.querySelector('button[aria-label=\"Download Kitchen Cheat-Sheet PDF\"]');
        if (!dlBtn) return { error: 'Modal download button not found' };
        dlBtn.click();
        await new Promise(r => setTimeout(r, 300));

        const lastDl = window.__downloads[window.__downloads.length - 1];
        return {
          modalFound: true,
          activeText,
          lastDownload: lastDl,
          printCalls: window.__printCalls
        };
      })()`,
      returnByValue: true,
      awaitPromise: true
    });
    console.log('CheatSheetModal result:', JSON.stringify(modalRes.result.value, null, 2));

    // Capture screenshot of open CheatSheetModal
    const ss3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\user\\.gemini\\antigravity\\brain\\59fe1592-8af6-4b44-bfdf-c54c1552f4b7\\verified_modal_active_weight.png', Buffer.from(ss3.data, 'base64'));
    console.log('Saved verified_modal_active_weight.png');

    ws.close();
  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    proc.kill();
  }
}

verifyAll();
