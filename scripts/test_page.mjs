// scripts/test_page.mjs
async function testPage() {
  const res = await fetch("http://localhost:3000");
  if (!res.ok) {
    console.error(`Failed to fetch page: ${res.status}`);
    process.exit(1);
  }

  const html = await res.text();

  const sections = ["planner", "dashboard", "guide", "timeline"];
  for (const s of sections) {
    if (!html.includes(`id="${s}"`)) {
      console.error(`Missing section id="${s}"`);
      process.exit(1);
    }
  }

  const images = ["planner.png", "dashboard.png", "guide.png", "timeline.png"];
  for (const img of images) {
    if (!html.includes(img)) {
      console.error(`Missing image ${img}`);
      process.exit(1);
    }
  }

  // Check interactive elements / hotspots
  const expectedLabels = [
    "USDA Safety Guidance 165°F Pill",
    "+ Add to Calendar (Google Calendar)",
    "Download .ICS Calendar File",
    "ThermoPop 2 Instant-Read",
    "DOT Oven Probe Thermometer",
    "Heavy Roasting Pan with V-Rack",
    "Food-Safe Leakproof Thaw Bags",
    "Stainless Steel Turkey Lifters",
    "Download Kitchen Cheat-Sheet PDF",
    "Sync Reminders (.ICS Download)",
    "Back to top",
  ];

  for (const label of expectedLabels) {
    if (!html.includes(label)) {
      console.error(`Missing expected hotspot label: ${label}`);
      process.exit(1);
    }
  }

  console.log("ALL TESTS PASSED! HTML contains all 4 sections, 4 assets, and all interactive hotspot components.");
}

testPage().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

