import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('main');

  console.log('Testing interactive triggers...');

  // Trigger 1: Click 20 lbs
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '20 lbs');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 200));

  // Verify weight changed
  const weightText = await page.evaluate(() => {
    const banner = document.querySelector('#dashboard');
    return banner ? banner.innerText.slice(0, 300) : '';
  });
  console.log('20 lbs clicked, text snippet:', weightText.includes('20') ? 'FOUND 20' : 'NO 20');

  // Trigger 2: Click Cold Water Bath
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cold Water Bath'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 200));

  // Trigger 3: Open Emergency Protocol 1
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('#guide button')).find(b => b.getAttribute('aria-label')?.includes('Morning Panic'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 200));
  const drawerOpen = await page.evaluate(() => {
    return !!document.querySelector('#guide [aria-label="Close drawer"]');
  });
  console.log('Emergency Drawer Open:', drawerOpen);

  // Close drawer
  await page.evaluate(() => {
    const closeBtn = document.querySelector('#guide [aria-label="Close drawer"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 200));
  const drawerClosed = await page.evaluate(() => {
    return !document.querySelector('#guide [aria-label="Close drawer"]');
  });
  console.log('Emergency Drawer Closed:', drawerClosed);

  // Trigger 4: Change Dinner Time in Section 4
  await page.evaluate(() => {
    const sel = document.querySelector('#timeline select');
    if (sel) {
      sel.value = '17:00';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 200));
  const dinnerLabel = await page.evaluate(() => {
    const selDiv = document.querySelector('#timeline select')?.parentElement;
    return selDiv ? selDiv.innerText.trim() : '';
  });
  console.log('Dinner Time Changed to:', dinnerLabel);

  await browser.close();
}

main().catch(console.error);

