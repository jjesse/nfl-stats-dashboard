// Run: node --test scripts/validate-odds.test.js
const test = require('node:test');
const assert = require('node:assert');
const { currentWeek, checkMissingWeek } = require('./validate-odds.js');

// Week N kicks off Thursday 2026-09-10 + 7*(N-1) days, 00:20 UTC Fri (TNF), Sunday games after.
const base = Date.parse('2026-09-11T00:20:00Z');
const day = 86400000;
const schedule = [];
for (let n = 1; n <= 18; n++) {
    for (const off of [0, 3 * day - 7 * 3600000, 4 * day]) { // Thu night, Sun 1pm ET-ish, Mon night
        schedule.push({ season: { year: 2026, type: 2 }, week: { number: n }, date: new Date(base + (n - 1) * 7 * day + off).toISOString() });
    }
}
schedule.push({ season: { year: 2026, type: 1 }, week: { number: 3 }, date: '2026-08-28T00:00:00Z' }); // preseason ignored
const firstKick = n => new Date(base + (n - 1) * 7 * day);
const snap = n => ({ season: 2026, week: n });

test('mid-season: Week 7 played -> current week is 7, not 1', () => {
    const now = new Date('2026-10-27T18:00:00Z'); // Tuesday after Week 7
    assert.strictEqual(currentWeek(schedule, now).week, 7);
});

test('rejected run (Week 7 saved, Thursday of Week 7) now passes', () => {
    const now = new Date(firstKick(7).getTime() - 6 * 3600000); // Thu 2pm ET before TNF
    assert.strictEqual(currentWeek(schedule, now).week, 6);
    assert.strictEqual(checkMissingWeek([snap(7)], schedule, now), null);
});

test('Thursday run saves upcoming week before its games start (Week 8, Oct 29)', () => {
    const now = new Date('2026-10-29T18:09:00Z');
    assert.strictEqual(currentWeek(schedule, now).week, 7);
    assert.strictEqual(checkMissingWeek([snap(8)], schedule, now), null);
    assert.strictEqual(checkMissingWeek([snap(7), snap(8)], schedule, now), null);
});

test('current week kicked off with no snapshot for it or later -> fails', () => {
    const now = new Date(firstKick(8).getTime() + 3600000);
    assert.match(checkMissingWeek([snap(7)], schedule, now), /week 8/);
    assert.strictEqual(checkMissingWeek([snap(8)], schedule, now), null);
});

test('before the first kickoff the earliest week is current and nothing fails', () => {
    const now = new Date('2026-09-01T00:00:00Z');
    assert.strictEqual(currentWeek(schedule, now).week, 1);
    assert.strictEqual(checkMissingWeek([], schedule, now), null);
    assert.strictEqual(checkMissingWeek([snap(1)], schedule, now), null);
});

test('no saves yet this season, offseason, or bad input never fail', () => {
    const now = new Date('2026-10-27T18:00:00Z');
    assert.strictEqual(checkMissingWeek([{ season: 2025, week: 18 }], schedule, now), null);
    assert.strictEqual(currentWeek([], now), null);
    assert.strictEqual(checkMissingWeek([snap(7)], [], now), null);
    assert.strictEqual(checkMissingWeek([snap(7)], null, now), null);
});

test('after the final week, current week stays 18', () => {
    assert.strictEqual(currentWeek(schedule, new Date('2027-02-01T00:00:00Z')).week, 18);
});
