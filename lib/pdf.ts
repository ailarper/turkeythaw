/**
 * TurkeyThaw Kitchen Cheat-Sheet & Food Safety Protocol PDF Generator
 * Zero-dependency standards-compliant PDF 1.4 binary generator.
 */

export interface PdfCheatSheetOptions {
  weight?: number;
  method?: 'refrigerator' | 'cold-water';
  dinnerTime?: string;
}

function escapePdfString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function formatTimelineTime(totalMinutes: number): string {
  let m = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(m / 60);
  const mins = m % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
}

export function generateCheatSheetPdf({
  weight = 16,
  method = 'refrigerator',
  dinnerTime = '16:00',
}: PdfCheatSheetOptions = {}): Uint8Array {
  const [dinnerH, dinnerM] = dinnerTime.split(':').map(Number);
  const dinnerMinutes = (dinnerH || 16) * 60 + (dinnerM || 0);

  const t1 = formatTimelineTime(dinnerMinutes - 540); // Tempering (9h before)
  const t2 = formatTimelineTime(dinnerMinutes - 255); // Season & Preheat (4h15m before)
  const t3 = formatTimelineTime(dinnerMinutes - 150); // Roast unstuffed (2h30m before)
  const t4 = formatTimelineTime(dinnerMinutes - 45);  // Temp Check 165°F (45m before)
  const t5 = formatTimelineTime(dinnerMinutes - 40);  // Rest 40 min & Carve (40m before)
  const tDinner = formatTimelineTime(dinnerMinutes);

  const methodName = method === 'refrigerator' ? 'Refrigerator Thaw (<=40°F)' : 'Cold Water Bath (Submerged)';

  const streamOps: string[] = [];

  // Page background: cream-50 (#FAF7F2 -> 0.98 0.97 0.95)
  streamOps.push('0.98 0.97 0.95 rg 0 0 612 792 re f');

  // Top Accent Banner: Obsidian-900 (#1B1A18 -> 0.11 0.10 0.09)
  streamOps.push('0.11 0.10 0.09 rg 36 716 540 48 re f');

  // Brand Name & Subtitle
  streamOps.push('BT /F2 18 Tf 1 1 1 rg 50 738 Td (TURKEYTHAW.COM) Tj ET');
  streamOps.push('BT /F1 10 Tf 0.93 0.35 0.05 rg 215 740 Td (USDA HOLIDAY KITCHEN CHEAT-SHEET) Tj ET');
  streamOps.push('BT /F1 9 Tf 0.8 0.8 0.8 rg 50 724 Td (Official USDA FSIS Conduction Standards | Science-Backed Food Safety) Tj ET');

  // User Dynamic Configuration Card
  streamOps.push('1 1 1 rg 36 654 540 50 re f');
  streamOps.push('0.91 0.87 0.82 RG 1 w 36 654 540 50 re S');
  streamOps.push('BT /F2 11 Tf 0.11 0.10 0.09 rg 48 686 Td (ACTIVE SCHEDULE CONFIGURATION:) Tj ET');
  streamOps.push(`BT /F1 10 Tf 0.27 0.25 0.24 rg 48 668 Td (Selected Weight: ) Tj /F2 10 Tf 0.92 0.35 0.05 rg (${weight} lbs) Tj /F1 10 Tf 0.27 0.25 0.24 rg (   |   Method: ) Tj /F2 10 Tf (${escapePdfString(methodName)}) Tj /F1 10 Tf 0.27 0.25 0.24 rg (   |   Dinner Time: ) Tj /F2 10 Tf (${tDinner}) Tj ET`);

  // SECTION 1: USDA THAWING TABLE
  streamOps.push('BT /F2 12 Tf 0.11 0.10 0.09 rg 36 632 Td (1. USDA THAWING TIME MATRIX) Tj ET');

  // Table Container
  streamOps.push('1 1 1 rg 36 480 540 140 re f');
  streamOps.push('0.91 0.87 0.82 RG 1 w 36 480 540 140 re S');

  // Table Header
  streamOps.push('0.95 0.93 0.89 rg 36 598 540 22 re f');
  streamOps.push('BT /F2 9.5 Tf 0.11 0.10 0.09 rg 48 605 Td (BIRD WEIGHT) Tj 170 605 Td (REFRIGERATOR (<=40 F)) Tj 360 605 Td (COLD WATER BATH (<=40 F)) Tj ET');

  const rows = [
    { w: 12, fridge: '~3 days (72 hrs)', water: '~6 hours' },
    { w: 14, fridge: '~3.5 days (84 hrs)', water: '~7 hours' },
    { w: 16, fridge: '~4 days (96 hrs)', water: '~8 hours' },
    { w: 18, fridge: '~4.5 days (108 hrs)', water: '~9 hours' },
    { w: 20, fridge: '~5 days (120 hrs)', water: '~10 hours' },
    { w: 24, fridge: '~6 days (144 hrs)', water: '~12 hours' },
  ];

  rows.forEach((r, idx) => {
    const y = 578 - idx * 19;
    const isSelected = r.w === weight;
    if (isSelected) {
      streamOps.push(`1.0 0.94 0.90 rg 37 ${y - 4} 538 18 re f`);
    } else if (idx % 2 === 1) {
      streamOps.push(`0.98 0.98 0.97 rg 37 ${y - 4} 538 18 re f`);
    }
    const prefix = isSelected ? '>> ' : '   ';
    const font = isSelected ? '/F2' : '/F1';
    const color = isSelected ? '0.92 0.35 0.05' : '0.27 0.25 0.24';
    streamOps.push(`BT ${font} 9 Tf ${color} rg 48 ${y} Td (${prefix}${r.w} lbs${isSelected ? ' [ACTIVE]' : ''}) Tj 170 ${y} Td (${r.fridge}) Tj 360 ${y} Td (${r.water}) Tj ET`);
  });

  // SECTION 2: CRITICAL FOOD SAFETY TEMPERATURES
  streamOps.push('BT /F2 12 Tf 0.11 0.10 0.09 rg 36 456 Td (2. CRITICAL USDA SAFETY THRESHOLDS) Tj ET');

  // Danger Zone Callout Box
  streamOps.push('1 0.96 0.94 rg 36 376 540 68 re f');
  streamOps.push('0.99 0.73 0.45 RG 1.5 w 36 376 540 68 re S');

  streamOps.push('BT /F2 10 Tf 0.92 0.35 0.05 rg 48 426 Td (USDA DANGER ZONE: 40 F to 140 F (4 C to 60 C)) Tj ET');
  streamOps.push('BT /F1 9 Tf 0.27 0.25 0.24 rg 48 412 Td (Bacteria multiply rapidly between 40 F and 140 F. Never leave raw turkey at room temperature for > 2 hours.) Tj ET');
  streamOps.push('BT /F2 10 Tf 0.11 0.10 0.09 rg 48 396 Td (MANDATORY SAFE INTERNAL TEMP: 165 F (74 C)) Tj ET');
  streamOps.push('BT /F1 9 Tf 0.27 0.25 0.24 rg 48 384 Td (Verify with instant-read probe in 3 spots: innermost thigh, thickest breast, and wing joint. Rest 40 min before carving.) Tj ET');

  // SECTION 3: COOK-DAY TIMELINE BATTLE BOARD
  streamOps.push('BT /F2 12 Tf 0.11 0.10 0.09 rg 36 352 Td (3. COOK-DAY 5-STEP TIMELINE (CALCULATED FOR ' + escapePdfString(tDinner) + ' DINNER)) Tj ET');

  streamOps.push('1 1 1 rg 36 210 540 130 re f');
  streamOps.push('0.91 0.87 0.82 RG 1 w 36 210 540 130 re S');

  const steps = [
    { num: '01', time: t1, title: 'Temper Bird at Room Temp', detail: 'Remove from fridge 60-90 min before roasting to take edge off chill.' },
    { num: '02', time: t2, title: 'Preheat Oven to 325 F & Season', detail: 'Pat skin completely dry with paper towels. Season cavity and tuck wings.' },
    { num: '03', time: t3, title: 'Roast Unstuffed on V-Rack', detail: `Roast unstuffed at 325 F (approx. 13-15 min/lb for ${weight} lbs unstuffed).` },
    { num: '04', time: t4, title: 'Probe Temperature Verification', detail: 'Insert calibrated probe into innermost thigh. Must reach full 165 F.' },
    { num: '05', time: t5, title: 'Rest 40 Minutes & Carve', detail: 'Transfer to cutting board. Resting locks in up to 15% more juice before slicing.' },
  ];

  steps.forEach((st, idx) => {
    const y = 318 - idx * 24;
    streamOps.push(`0.92 0.35 0.05 rg 48 ${y - 2} 18 14 re f`);
    streamOps.push(`BT /F2 8 Tf 1 1 1 rg 52 ${y + 1} Td (${st.num}) Tj ET`);
    streamOps.push(`BT /F2 9.5 Tf 0.92 0.35 0.05 rg 72 ${y + 1} Td (${st.time}) Tj ET`);
    streamOps.push(`BT /F2 9.5 Tf 0.11 0.10 0.09 rg 132 ${y + 1} Td (${escapePdfString(st.title)} - ) Tj /F1 8.5 Tf 0.35 0.33 0.30 rg (${escapePdfString(st.detail)}) Tj ET`);
  });

  // SECTION 4: EMERGENCY PROTOCOL HIGHLIGHT
  streamOps.push('BT /F2 11 Tf 0.11 0.10 0.09 rg 36 188 Td (4. EMERGENCY PROTOCOLS & SAFE FRIDGE STORAGE) Tj ET');
  streamOps.push('1 1 1 rg 36 78 540 98 re f');
  streamOps.push('0.91 0.87 0.82 RG 1 w 36 78 540 98 re S');

  streamOps.push('BT /F2 9 Tf 0.92 0.35 0.05 rg 48 158 Td (Morning Panic Rescue:) Tj /F1 8.5 Tf 0.27 0.25 0.24 rg ( Submerge sealed bird in cold tap water (<=40 F), changing water every 30 min (30 min/lb).) Tj ET');
  streamOps.push('BT /F2 9 Tf 0.92 0.35 0.05 rg 48 142 Td (Roast from Frozen:) Tj /F1 8.5 Tf 0.27 0.25 0.24 rg ( USDA confirmed safe! Roast unstuffed at 325 F for ~50% longer. Remove giblet bag at hr 2.) Tj ET');
  streamOps.push('BT /F2 9 Tf 0.92 0.35 0.05 rg 48 126 Td (Safe Fridge Holding:) Tj /F1 8.5 Tf 0.27 0.25 0.24 rg ( Fully thawed raw turkey holds safely in a <=40 F fridge for 1 to 2 days before cooking.) Tj ET');
  streamOps.push('BT /F1 8 Tf 0.5 0.5 0.5 rg 48 94 Td (Official USDA FSIS Guidelines | Always cook poultry to 165 F verified by instant-read thermometer. | TurkeyThaw.com) Tj ET');

  // Footer bar
  streamOps.push('BT /F1 8 Tf 0.5 0.5 0.5 rg 36 50 Td (Downloaded from TurkeyThaw.com - Official USDA Thanksgiving Thawing & Cook-Day Calculator) Tj ET');
  streamOps.push('BT /F2 8 Tf 0.92 0.35 0.05 rg 500 50 Td (100% USDA Compliant) Tj ET');

  const contentStream = streamOps.join('\n');
  const streamBytes = Buffer.from(contentStream, 'utf-8');

  const objects: string[] = [];
  const addObj = (s: string) => {
    objects.push(s);
    return objects.length;
  };

  addObj('<< /Type /Catalog /Pages 2 0 R >>');
  addObj('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObj('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>');
  addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  addObj(`<< /Length ${streamBytes.length} >>\nstream\n${contentStream}\nendstream`);

  let body = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj, idx) => {
    offsets.push(Buffer.byteLength(body, 'latin1'));
    body += `${idx + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(body, 'latin1');
  body += `xref\n0 ${objects.length + 1}\n`;
  body += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    body += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(body, 'latin1');
}

/**
 * Triggers an immediate browser download of the Kitchen Cheat-Sheet PDF.
 * Never invokes window.print().
 */
export function downloadPdfCheatSheet(options: PdfCheatSheetOptions = {}): void {
  if (typeof window === 'undefined') return;

  try {
    const pdfBytes = generateCheatSheetPdf(options);
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `TurkeyThaw-Kitchen-Cheat-Sheet-${options.weight || 16}lbs.pdf`;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch (err) {
    console.error('Failed client-side PDF generation, falling back to static asset:', err);
    const fallback = document.createElement('a');
    fallback.href = '/TurkeyThaw-Kitchen-Cheat-Sheet.pdf';
    fallback.download = 'TurkeyThaw-Kitchen-Cheat-Sheet.pdf';
    fallback.rel = 'noopener';
    document.body.appendChild(fallback);
    fallback.click();
    fallback.remove();
  }
}
