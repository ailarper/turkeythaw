import fs from 'fs';

const code = fs.readFileSync('app/page.tsx', 'utf8');
const lines = code.split('\n');
lines.forEach((l, i) => {
  if (l.includes('Morning Panic') || l.includes('activeEmergency') || l.includes('selectedDinner') || l.includes('dinnerTime') || l.includes('expanded') || l.includes('Battle Board') || l.includes('Calculate')) {
    console.log(`${i+1}: ${l.trim().slice(0, 120)}`);
  }
});

