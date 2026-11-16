import puppeteer from 'puppeteer';

const ARTIFACT_DIR = 'C:/Users/user/.gemini/antigravity/brain/59fe1592-8af6-4b44-bfdf-c54c1552f4b7';

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. 1920x1080 Desktop
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/#dashboard', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.getElementById('dashboard')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));

  const dashboard1920 = await page.$('#dashboard');
  if (dashboard1920) {
    await dashboard1920.screenshot({ path: `${ARTIFACT_DIR}/verify_1920_section2.png` });
    console.log('Saved 1920 screenshot');
  }

  // 2. 1440x900 Desktop
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/#dashboard', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.getElementById('dashboard')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));

  const dashboard1440 = await page.$('#dashboard');
  if (dashboard1440) {
    await dashboard1440.screenshot({ path: `${ARTIFACT_DIR}/verify_1440_section2.png` });
    console.log('Saved 1440 screenshot');
  }

  // 3. 390x844 Mobile
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/#dashboard', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.getElementById('dashboard')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));

  const dashboardMobile = await page.$('#dashboard');
  if (dashboardMobile) {
    const box = await dashboardMobile.boundingBox();
    console.log('Mobile box:', box);
    await dashboardMobile.screenshot({ path: `${ARTIFACT_DIR}/verify_390_section2.png` });
    console.log('Saved 390 mobile screenshot');
  }

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
