#!/usr/bin/env node
/**
 * Validate data/odds.json (weekly betting favorites saved by scripts/fetch-odds.js).
 * Usage: node scripts/validate-odds.js [dataDir]
 *
 * Always: valid JSON and every saved game has the expected fields.
 * Missing-week rule: the current week (lowest regular-season week in schedule.json)
 * must have a snapshot once its first game has kicked off - but only after favorites
 * have started being saved this season. So it never fails in the offseason (no
 * regular-season games), before the first Thursday run, or if ODDS_API_KEY was never set.
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(process.argv[2] || path.join(__dirname, '..', 'data'));
const now = process.env.VALIDATE_NOW ? new Date(process.env.VALIDATE_NOW) : new Date();
const errors = [];
const fail = m => errors.push(`odds.json: ${m}`);

let odds;
try { odds = JSON.parse(fs.readFileSync(path.join(dataDir, 'odds.json'), 'utf8')); }
catch (e) { fail(`missing or invalid JSON (${e.message})`); }

const weeks = odds && !Array.isArray(odds) ? odds.weeks : [];
if (odds && !Array.isArray(odds) && !Array.isArray(weeks)) fail('"weeks" is not an array');

for (const w of Array.isArray(weeks) ? weeks : []) {
    const label = `${w.season} week ${w.week}`;
    if (!Number.isInteger(w.season) || !Number.isInteger(w.week)) fail(`snapshot missing season/week`);
    if (!w.fetchedAt) fail(`${label} missing "fetchedAt"`);
    if (!Array.isArray(w.games) || w.games.length === 0) { fail(`${label} has no games`); continue; }
    w.games.forEach((g, i) => {
        for (const k of ['home', 'away', 'kickoff', 'source']) if (!g[k]) fail(`${label} games[${i}] missing "${k}"`);
        if (typeof g.coinFlip !== 'boolean') fail(`${label} games[${i}] missing "coinFlip"`);
        if (g.favorite == null && !g.note) fail(`${label} games[${i}] has no favorite and no note`);
        if (g.favorite != null && g.favorite !== g.home && g.favorite !== g.away) fail(`${label} games[${i}] favorite is not home or away`);
    });
}

// Missing-week rule
let schedule = [];
try { schedule = JSON.parse(fs.readFileSync(path.join(dataDir, 'schedule.json'), 'utf8')); } catch (e) { /* validate-data.js reports this */ }
const regular = (Array.isArray(schedule) ? schedule : []).filter(e => e.season?.type === 2 && e.week?.number);
if (regular.length && Array.isArray(weeks)) {
    const season = regular[0].season.year;
    const week = Math.min(...regular.map(e => e.week.number));
    const firstKickoff = new Date(Math.min(...regular.filter(e => e.week.number === week).map(e => Date.parse(e.date))));
    const started = weeks.some(w => w.season === season);
    const have = weeks.some(w => w.season === season && w.week === week);
    if (started && now > firstKickoff && !have) {
        fail(`no favorites saved for ${season} week ${week} (first kickoff ${firstKickoff.toISOString()}); re-run "Save Weekly Favorites"`);
    }
}

if (errors.length) {
    console.error('✗ Odds validation failed:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
}
console.log(`✓ Odds validation passed (${Array.isArray(weeks) ? weeks.length : 0} saved week(s))`);
