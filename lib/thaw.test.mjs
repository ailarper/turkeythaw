import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFridgeThawHours,
  calculateColdWaterThawHours,
  calculateFridgeStartTime,
  calculateThaw,
  formatDuration,
  formatVerdictDate,
  getNextThanksgiving,
} from './thaw.ts';

test('Acceptance Test 1: 15 lb, Nov 26 12:00 PM -> 80h -> Monday, Nov 23, 4:00 AM', () => {
  const weight = 15;
  const thawHours = calculateFridgeThawHours(weight);
  assert.equal(thawHours, 80, `Expected 80 hours for 15 lb, got ${thawHours}`);

  // Construct Thanksgiving 2026 at 12:00 PM local
  const cookingStart = new Date(2026, 10, 26, 12, 0, 0, 0);
  const startTime = calculateFridgeStartTime(cookingStart, thawHours);

  assert.equal(startTime.getFullYear(), 2026);
  assert.equal(startTime.getMonth(), 10); // November
  assert.equal(startTime.getDate(), 23); // Nov 23
  assert.equal(startTime.getHours(), 4); // 4:00 AM
  assert.equal(startTime.getMinutes(), 0); // 00 minutes

  const formattedVerdict = formatVerdictDate(startTime);
  assert.equal(formattedVerdict, 'Monday, Nov 23 at 4:00 AM');
});

test('Acceptance Test 2: 20 lb -> 106h 40m -> start rounded earlier to :15', () => {
  const weight = 20;
  const thawHours = calculateFridgeThawHours(weight);
  // (20 / 4.5) * 24 = 106.66666666666667 hours = 106 hours, 40 minutes
  const duration = formatDuration(thawHours);
  assert.equal(duration.hours, 10);
  assert.equal(duration.minutes, 40);
  assert.equal(duration.days, 4); // 4 days, 10 hours, 40 mins = 106h 40m

  const cookingStart = new Date(2026, 10, 26, 12, 0, 0, 0);
  const startTime = calculateFridgeStartTime(cookingStart, thawHours);

  // 12:00 PM - 106h 40m = Nov 22 at 01:20:00 AM.
  // Rounded EARLIER to nearest 15 minutes is Nov 22 at 01:15:00 AM!
  assert.equal(startTime.getMinutes(), 15, `Expected minutes rounded earlier to :15, got :${startTime.getMinutes()}`);
  assert.equal(startTime.getHours(), 1);
  assert.equal(startTime.getDate(), 22);
  assert.equal(startTime.getMonth(), 10);
  assert.equal(startTime.getFullYear(), 2026);

  const formattedVerdict = formatVerdictDate(startTime);
  assert.equal(formattedVerdict, 'Sunday, Nov 22 at 1:15 AM');
});

test('Acceptance Test 3: 12 lb -> 64h', () => {
  const weight = 12;
  const thawHours = calculateFridgeThawHours(weight);
  // (12 / 4.5) * 24 = (8/3) * 24 = 64 hours
  assert.equal(thawHours, 64, `Expected 64 hours for 12 lb, got ${thawHours}`);

  const duration = formatDuration(thawHours);
  assert.equal(duration.text, '2 days, 16 hours');
});

test('Acceptance Test 4: 15 lb cold water -> 7h 30m', () => {
  const weight = 15;
  const coldHours = calculateColdWaterThawHours(weight);
  assert.equal(coldHours, 7.5, `Expected 7.5 hours for 15 lb, got ${coldHours}`);

  const duration = formatDuration(coldHours);
  assert.equal(duration.text, '7 hours, 30 minutes');
});

test('Acceptance Test 5: A past start time triggers the rescue card', () => {
  // Let cooking start time be in 10 hours from now
  const now = new Date(2026, 10, 26, 10, 0, 0); // 10:00 AM
  const cookingStart = new Date(2026, 10, 26, 16, 0, 0); // 4:00 PM (6 hours later)
  const weight = 20; // 20 lb needs 106h 40m, so start time is 4 days ago!

  const result = calculateThaw({
    weightInLb: weight,
    cookingStartTime: cookingStart,
    brineBufferHours: 0,
    now: now,
  });

  assert.equal(result.isFridgeStartInPast, true, 'isFridgeStartInPast should be true');
});
