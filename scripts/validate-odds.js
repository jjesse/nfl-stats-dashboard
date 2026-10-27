#!/usr/bin/env node
/**
 * Validate data/odds.json (weekly betting favorites saved by scripts/fetch-odds.js).
 * Usage: node scripts/validate-odds.js [dataDir]
 *
 * Always: valid JSON and every saved game has the expected fields.
 * Missing-week rule: the current week (highest regular-season week in schedule.json with a
 * game already kicked off; VALIDATE_NOW overrides now) must have a snapshot (or a later
 * week must) once its first game has kicked off - but only after favorites
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
/**
 * Current week = the highest regular-season week with a game that has already kicked off
 * (kickoff <= now). Before the season's first kickoff it is the earliest week.
 * Returns null if there are no regular-season games (offseason).
 */
function currentWeek(schedule, now) {
    const regular = (Array.isArray(schedule) ? schedule : [])
        .filter(e => e.season?.type === 2 && e.week?.number && !Number.isNaN(Date.parse(e.date)));
    if (!regular.length) return null;
    const season = regular[0].season.year;
    const kicked = regular.filter(e => Date.parse(e.date) <= now.getTime());
    const week = kicked.length
        ? Math.max(...kicked.map(e => e.week.number))
        : Math.min(...regular.map(e => e.week.number));
    const firstKickoff = new Date(Math.min(...regular.filter(e => e.week.number === week).map(e => Date.parse(e.date))));
    return { season, week, firstKickoff };
}

/**
 * Returns an error string or null. Once favorites have been saved this season and the
 * current week has kicked off, there must be a snapshot for that week or a later one
 * (Thursday runs save the upcoming week before its games start; a missed past week can't
 * be fetched anymore, so it doesn't block later weeks).
 */
function checkMissingWeek(weeks, schedule, now) {
    const cur = currentWeek(schedule, now);
    if (!cur || !Array.isArray(weeks)) return null;
    const { season, week, firstKickoff } = cur;
    const started = weeks.some(w => w.season === season);
    const have = weeks.some(w => w.season === season && w.week >= week);
    if (started && now >= firstKickoff && !have) {
        return `no favorites saved for ${season} week ${week} (first kickoff ${firstKickoff.toISOString()}); re-run "Save Weekly Favorites"`;
    }
    return null;
}

if (require.main === module) {
let schedule = [];
try { schedule = JSON.parse(fs.readFileSync(path.join(dataDir, 'schedule.json'), 'utf8')); } catch (e) { /* validate-data.js reports this */ }
const missing = checkMissingWeek(weeks, schedule, now);
if (missing) fail(missing);

if (errors.length) {
    console.error('✗ Odds validation failed:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
}
console.log(`✓ Odds validation passed (${Array.isArray(weeks) ? weeks.length : 0} saved week(s))`);
}

module.exports = { currentWeek, checkMissingWeek };
