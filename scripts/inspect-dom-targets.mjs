import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('main');

  const info = await page.evaluate(() => {
    const results = {};

    // 1. Hero CTA button
    const heroBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
      el.textContent.includes('Calculate') || el.textContent.includes('Thaw Schedule')
    );
    if (heroBtn) {
      const rect = heroBtn.getBoundingClientRect();
      results.heroBtn = {
        text: heroBtn.textContent.trim(),
        tag: heroBtn.tagName,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom }
      };
    }

    // 2. Section 2 elements
    // Weight buttons (12, 14, 16, 18, 20, 22, 24)
    const weightButtons = Array.from(document.querySelectorAll('button')).filter(el => 
      /\b(12|14|16|18|20|22|24)\s*lbs\b/i.test(el.textContent)
    ).map(el => {
      const rect = el.getBoundingClientRect();
      return { text: el.textContent.trim(), rect: { x: rect.x, y: rect.y + window.scrollY, width: rect.width, height: rect.height } };
    });
    results.weightButtons = weightButtons;

    // Method buttons (Refrigerator Thaw, Cold Water Bath)
    const methodButtons = Array.from(document.querySelectorAll('button, div[role="button"]')).filter(el => 
      el.textContent.includes('Refrigerator') || el.textContent.includes('Cold Water')
    ).map(el => {
      const rect = el.getBoundingClientRect();
      return { text: el.textContent.trim(), rect: { x: rect.x, y: rect.y + window.scrollY, width: rect.width, height: rect.height } };
    });
    results.methodButtons = methodButtons;

    // 3. Section 3 Emergency Card 1 ("Morning Panic")
    const emCard = Array.from(document.querySelectorAll('button, div[role="button"], div')).find(el => 
      el.textContent.includes('Morning Panic') || el.textContent.includes('Still Frozen')
    );
    if (emCard) {
      // Find the clickable interactive container
      let target = emCard;
      while (target && target.tagName !== 'BUTTON' && !target.getAttribute('onclick') && !target.className.includes('cursor-pointer') && target.parentElement) {
        if (target.parentElement.tagName === 'MAIN') break;
        target = target.parentElement;
      }
      const rect = (target || emCard).getBoundingClientRect();
      results.emCard = {
        text: emCard.textContent.slice(0, 50).trim(),
        rect: { x: rect.x, y: rect.y + window.scrollY, width: rect.width, height: rect.height }
      };
    }

    // 4. Section 4 Dinner Time dropdown / select
    const dinnerSelect = document.querySelector('select');
    if (dinnerSelect) {
      const rect = dinnerSelect.getBoundingClientRect();
      results.dinnerSelect = {
        name: dinnerSelect.name || dinnerSelect.id,
        value: dinnerSelect.value,
        options: Array.from(dinnerSelect.options).map(o => o.value),
        rect: { x: rect.x, y: rect.y + window.scrollY, width: rect.width, height: rect.height }
      };
    }

    // Section bounding rects
    results.sections = Array.from(document.querySelectorAll('section, div[id]')).filter(s => s.id).map(s => {
      const rect = s.getBoundingClientRect();
      return { id: s.id, y: rect.y + window.scrollY, height: rect.height };
    });

    // Total page height
    results.totalHeight = document.documentElement.scrollHeight;

    return results;
  });

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
}

main().catch(console.error);

