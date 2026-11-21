import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/user/.gemini/antigravity/brain/59fe1592-8af6-4b44-bfdf-c54c1552f4b7';

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Desktop 1440x900 - Page 1 (Top Hero Planner & Floating Navbar)
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: `${ARTIFACT_DIR}/verify_1440_page1_hero.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('Saved Page 1 (Hero Planner) screenshot');

  // 2. Desktop 1440x900 - Page 2 (Section 2 / Dashboard Calculator)
  const dashboard1440 = await page.$('#dashboard');
  if (dashboard1440) {
    await page.evaluate(() => {
      document.getElementById('dashboard')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 600));
    await dashboard1440.screenshot({ path: `${ARTIFACT_DIR}/verify_1440_section2.png` });
    console.log('Saved Section 2 (Calculator) screenshot');
  }

  // 3. Mobile 390x844 - Page 1 & Section 2
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/#dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const dashboardMobile = await page.$('#dashboard');
  if (dashboardMobile) {
    await dashboardMobile.screenshot({ path: `${ARTIFACT_DIR}/verify_390_section2.png` });
    console.log('Saved mobile screenshot');
  }

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
