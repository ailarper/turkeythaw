import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Verify Section 3 Emergency Protocol Drawer (Full Column)
  await page.evaluate(() => {
    window.scrollTo(0, 2162);
    const btn = Array.from(document.querySelectorAll('#guide button')).find(b => b.getAttribute('aria-label')?.includes('Morning Panic'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scripts/verify_fix3_drawer.png' });

  // Close drawer
  await page.evaluate(() => {
    const closeBtn = document.querySelector('#guide [aria-label="Close drawer"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));

  // 2. Verify Section 4 Dinner Time Pill & Ghost Overlays (switch to 17:00)
  await page.evaluate(() => {
    window.scrollTo(0, 3132);
    const sel = document.querySelector('#timeline select');
    if (sel) {
      sel.value = '17:00';
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scripts/verify_fix1_2_timeline.png' });

  // 3. Verify Single Footer at bottom
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: 'scripts/verify_fix4_footer.png' });

  await browser.close();
  console.log('Saved UI fix verification images.');
}

main().catch(console.error);

