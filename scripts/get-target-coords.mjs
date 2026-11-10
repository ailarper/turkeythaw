import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1500));

  const coords = await page.evaluate(() => {
    // 1. Hero CTA (Plan dinner -> in navbar)
    const planDinnerBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Plan dinner'));
    const r1 = planDinnerBtn?.getBoundingClientRect();

    // 2. Section 2 (scroll to 1081)
    window.scrollTo(0, 1081);
    const weight20Btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '20 lbs');
    const r2 = weight20Btn?.getBoundingClientRect();

    const coldWaterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cold Water Bath'));
    const r3 = coldWaterBtn?.getBoundingClientRect();

    // 3. Section 3 (scroll to 2162)
    window.scrollTo(0, 2162);
    const emBtn = Array.from(document.querySelectorAll('#guide button')).find(b => b.getAttribute('aria-label')?.includes('Morning Panic'));
    const r4 = emBtn?.getBoundingClientRect();

    // 4. Section 4 (scroll to 3132)
    window.scrollTo(0, 3132);
    const dinnerSel = document.querySelector('#timeline select');
    const r5 = dinnerSel?.getBoundingClientRect();

    // 5. Footer (scroll to 3232)
    window.scrollTo(0, 3232);
    const footerLogo = document.querySelector('footer svg, footer [aria-label*="TurkeyThaw"], footer');
    const r6 = footerLogo?.getBoundingClientRect();

    return {
      heroPlanDinner: r1 ? { x: r1.x + r1.width / 2, y: r1.y + r1.height / 2 } : null,
      sec2Weight20: r2 ? { x: r2.x + r2.width / 2, y: r2.y + r2.height / 2 } : null,
      sec2ColdWater: r3 ? { x: r3.x + r3.width / 2, y: r3.y + r3.height / 2 } : null,
      sec3Emergency1: r4 ? { x: r4.x + r4.width / 2, y: r4.y + r4.height / 2 } : null,
      sec4DinnerTime: r5 ? { x: r5.x + r5.width / 2, y: r5.y + r5.height / 2 } : null,
      footer: r6 ? { x: r6.x + r6.width / 2, y: r6.y + r6.height / 2 } : null
    };
  });

  console.log('Target coordinates in viewport:');
  console.log(JSON.stringify(coords, null, 2));

  await browser.close();
}

main().catch(console.error);

