import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1500)); // wait for React hydration

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('#guide button')).find(b => b.getAttribute('aria-label')?.includes('Morning Panic'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  const drawerText = await page.evaluate(() => {
    const guide = document.querySelector('#guide');
    return guide ? guide.innerText : '';
  });

  console.log('Includes Do NOT leave turkey?', drawerText.includes('Do NOT leave turkey'));
  await browser.close();
}

main().catch(console.error);
