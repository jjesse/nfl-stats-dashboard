#!/usr/bin/env node
/**
 * Validate generated files in data/ so empty or malformed data never ships.
 * Usage: node scripts/validate-data.js [dataDir]
 * Exits 1 with a list of problems if any check fails. No dependencies.
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(process.argv[2] || path.join(__dirname, '..', 'data'));
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

function load(file) {
    const p = path.join(dataDir, file);
    if (!fs.existsSync(p)) { fail(file, 'missing'); return undefined; }
    try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
    catch (e) { fail(file, `invalid JSON (${e.message})`); return undefined; }
}

function requireKeys(file, label, obj, keys) {
    for (const k of keys) {
        if (obj == null || obj[k] === undefined || obj[k] === null || obj[k] === '') {
            fail(file, `${label} missing "${k}"`);
        }
    }
}

// player-stats.json: qb / receivers / rushers each non-empty
const players = load('player-stats.json');
if (players !== undefined) {
    for (const cat of ['qb', 'receivers', 'rushers']) {
        const list = players && players[cat];
        if (!Array.isArray(list) || list.length === 0) {
            fail('player-stats.json', `"${cat}" is empty`);
        } else {
            list.forEach((p, i) => requireKeys('player-stats.json', `${cat}[${i}]`, p, ['name', 'team', 'yards']));
        }
    }
}

// standings.json: 8 divisions, each with teams
const DIVISIONS = ['afc-east', 'afc-north', 'afc-south', 'afc-west', 'nfc-east', 'nfc-north', 'nfc-south', 'nfc-west'];
const standings = load('standings.json');
if (standings !== undefined) {
    for (const div of DIVISIONS) {
        const teams = standings && standings[div];
        if (!Array.isArray(teams) || teams.length === 0) {
            fail('standings.json', `division "${div}" has no teams`);
        } else {
            teams.forEach((t, i) => requireKeys('standings.json', `${div}[${i}]`, t, ['team', 'abbreviation', 'wins', 'losses']));
        }
    }
}

// team-stats.json: non-empty array with key fields
const teamStats = load('team-stats.json');
if (teamStats !== undefined) {
    if (!Array.isArray(teamStats) || teamStats.length === 0) {
        fail('team-stats.json', 'is empty');
    } else {
        teamStats.forEach((t, i) => requireKeys('team-stats.json', `[${i}]`, t, ['team', 'abbreviation', 'wins', 'losses', 'winPct']));
    }
}

// advanced-metrics.json: { teams: [...] } non-empty with key fields
const advanced = load('advanced-metrics.json');
if (advanced !== undefined) {
    const teams = advanced && advanced.teams;
    if (!Array.isArray(teams) || teams.length === 0) {
        fail('advanced-metrics.json', '"teams" is empty');
    } else {
        teams.forEach((t, i) => requireKeys('advanced-metrics.json', `teams[${i}]`, t, ['team', 'abbreviation', 'raw']));
    }
}

// schedule.json: must be a valid array (may legitimately be short late in season)
const schedule = load('schedule.json');
if (schedule !== undefined) {
    if (!Array.isArray(schedule) || schedule.length === 0) {
        fail('schedule.json', 'is empty');
    } else {
        schedule.forEach((e, i) => requireKeys('schedule.json', `[${i}]`, e, ['id', 'date', 'competitions']));
    }
}

// Leaders pages: each list non-empty, every row has a name, team and its ranking stat.
// Only the shape is checked (no minimum counts or value ranges), so a quiet week can't fail it.
function checkLists(file, obj, lists) {
    if (obj == null || typeof obj !== 'object') { fail(file, 'is not an object'); return; }
    for (const [list, statKey] of Object.entries(lists)) {
        const rows = obj[list];
        if (!Array.isArray(rows) || rows.length === 0) {
            fail(file, `"${list}" is empty`);
        } else {
            rows.forEach((r, i) => requireKeys(file, `${list}[${i}]`, r, ['name', 'team', statKey]));
        }
    }
}

const defensive = load('defensive-stats.json');
if (defensive !== undefined) {
    checkLists('defensive-stats.json', defensive, {
        tackles: 'totalTackles', sacks: 'sacks', interceptions: 'interceptions',
        forcedFumbles: 'forcedFumbles', passesDefended: 'passesDefended'
    });
}

const specialTeams = load('special-teams.json');
if (specialTeams !== undefined) {
    checkLists('special-teams.json', specialTeams, { kickers: 'fgm', punters: 'avg', returners: 'totalYards' });
}

const leagueLeaders = load('league-leaders.json');
if (leagueLeaders !== undefined) {
    const categories = leagueLeaders && leagueLeaders.categories;
    if (categories == null || typeof categories !== 'object') {
        fail('league-leaders.json', 'missing "categories"');
    } else {
        // The six headline categories must be filled; the extra cards may be empty.
        for (const key of ['passingYards', 'rushingYards', 'receivingYards', 'totalTouchdowns', 'sacks', 'interceptions']) {
            const leaders = categories[key] && categories[key].leaders;
            if (!Array.isArray(leaders) || leaders.length === 0) {
                fail('league-leaders.json', `category "${key}" is empty`);
            } else {
                leaders.forEach((r, i) => requireKeys('league-leaders.json', `${key}[${i}]`, r, ['name', 'team', 'value']));
            }
        }
    }
}

if (errors.length) {
    console.error(`✗ Data validation failed (${errors.length} problem${errors.length === 1 ? '' : 's'}) in ${dataDir}:`);
    errors.slice(0, 50).forEach(e => console.error(`  - ${e}`));
    if (errors.length > 50) console.error(`  ...and ${errors.length - 50} more`);
    process.exit(1);
}
console.log(`✓ Data validation passed for ${dataDir}`);
