#!/usr/bin/env node
/**
 * Save this week's betting favorites (moneyline + point spread) to data/odds.json.
 *
 * Runs Thursday afternoon (see .github/workflows/update-odds.yml), before picks lock,
 * so the lines are frozen at pick time. Once a week's snapshot is saved it is never
 * overwritten (pass --force to replace it). Earlier weeks are kept so the Tuesday
 * picks scorecard can compare our picks to "just take the favorite".
 *
 * Data only: no odds are shown anywhere on the site.
 *
 * Env: ODDS_API_KEY (The Odds API, https://the-odds-api.com). Missing key = log and
 * leave data/odds.json unchanged (exit 0).
 * Test hooks: ODDS_FIXTURE=<odds json file>, ESPN_FIXTURE=<scoreboard json file>,
 * ODDS_FILE=<output path>.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(process.env.ODDS_FILE || path.join(__dirname, '..', 'data', 'odds.json'));
const COIN_FLIP_SPREAD = 1; // |spread| <= 1 point is treated as a coin flip
const PREFERRED_BOOKS = ['draftkings', 'fanduel', 'betmgm', 'williamhill_us', 'betrivers'];

function getJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'nfl-stats-dashboard' } }, res => {
            let body = '';
            res.on('data', c => { body += c; });
            res.on('end', () => {
                if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
                try { resolve({ data: JSON.parse(body), headers: res.headers }); } catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

const readFixture = f => ({ data: JSON.parse(fs.readFileSync(f, 'utf8')), headers: {} });

function loadExisting() {
    if (!fs.existsSync(OUT)) return { weeks: [] };
    try {
        const d = JSON.parse(fs.readFileSync(OUT, 'utf8'));
        if (Array.isArray(d)) return { weeks: [] }; // old format from the removed odds feature
        return { weeks: Array.isArray(d.weeks) ? d.weeks : [] };
    } catch (e) {
        throw new Error(`data/odds.json is not valid JSON, refusing to overwrite: ${e.message}`);
    }
}

function pickBook(bookmakers) {
    const usable = (bookmakers || []).filter(b => (b.markets || []).some(m => m.key === 'h2h'));
    for (const key of PREFERRED_BOOKS) {
        const b = usable.find(x => x.key === key);
        if (b) return b;
    }
    return usable[0] || null;
}

function summarizeGame(odds, espnGames) {
    const book = pickBook(odds.bookmakers);
    const market = k => book && (book.markets || []).find(m => m.key === k);
    const price = (m, team) => { const o = m && m.outcomes.find(x => x.name === team); return o ? o : null; };
    const h2h = market('h2h');
    const spreads = market('spreads');
    const espn = espnGames.find(g => g.homeName === odds.home_team && g.awayName === odds.away_team);
    const abbr = name => (espn && (name === espn.homeName ? espn.home : espn.away)) || name;

    const ml = { home: price(h2h, odds.home_team)?.price ?? null, away: price(h2h, odds.away_team)?.price ?? null };
    const sp = { home: price(spreads, odds.home_team)?.point ?? null, away: price(spreads, odds.away_team)?.point ?? null };

    // Favorite: negative spread wins; fall back to the lower moneyline.
    let side = null;
    if (sp.home != null && sp.home !== 0) side = sp.home < 0 ? 'home' : 'away';
    else if (sp.home == null && ml.home != null && ml.away != null && ml.home !== ml.away) side = ml.home < ml.away ? 'home' : 'away';

    const spread = side ? sp[side] : (sp.home != null ? 0 : null); // favorite's line, e.g. -3.5
    const coinFlip = side === null || (spread != null && Math.abs(spread) <= COIN_FLIP_SPREAD);
    const game = {
        espnId: espn ? espn.id : null,
        oddsId: odds.id,
        home: abbr(odds.home_team),
        away: abbr(odds.away_team),
        kickoff: odds.commence_time,
        favorite: side ? abbr(side === 'home' ? odds.home_team : odds.away_team) : null,
        spread,
        coinFlip,
        moneyline: ml,
        source: book ? `The Odds API (${book.key})` : 'The Odds API (no bookmaker lines)',
    };
    if (side === null) game.note = book ? "pick'em: no favorite" : 'no lines available';
    else if (coinFlip) game.note = `coin flip: spread within ${COIN_FLIP_SPREAD} point`;
    return game;
}

async function main() {
    const force = process.argv.includes('--force');
    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey && !process.env.ODDS_FIXTURE) {
        console.warn('⚠ ODDS_API_KEY not set - skipping favorites; data/odds.json left unchanged');
        return;
    }
    const existing = loadExisting();

    // Current week and games from ESPN (gives week number, game ids, abbreviations).
    const sb = process.env.ESPN_FIXTURE ? readFixture(process.env.ESPN_FIXTURE)
        : await getJson('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
    const season = sb.data.season?.year;
    const seasonType = sb.data.season?.type;
    const week = sb.data.week?.number;
    if (seasonType !== 2 || !season || !week) {
        console.log(`Not regular season (season type ${seasonType}) - nothing to save`);
        return;
    }
    if (!force && existing.weeks.some(w => w.season === season && w.week === week)) {
        console.log(`Week ${week} ${season} snapshot already saved - lines are frozen, not overwriting`);
        return;
    }
    const espnGames = (sb.data.events || []).map(e => {
        const c = e.competitions?.[0]?.competitors || [];
        const h = c.find(x => x.homeAway === 'home')?.team || {};
        const a = c.find(x => x.homeAway === 'away')?.team || {};
        return { id: e.id, date: e.date, home: h.abbreviation, away: a.abbreviation, homeName: h.displayName, awayName: a.displayName };
    });
    if (espnGames.length === 0) { console.log('No games on the ESPN scoreboard - nothing to save'); return; }

    const res = process.env.ODDS_FIXTURE ? readFixture(process.env.ODDS_FIXTURE)
        : await getJson(`https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=${encodeURIComponent(apiKey)}&regions=us&markets=h2h,spreads&oddsFormat=american`);
    if (res.headers['x-requests-remaining']) console.log(`ℹ Odds API requests remaining: ${res.headers['x-requests-remaining']}`);

    // Keep only this week's games (match by teams; the API also lists later weeks).
    const games = (res.data || [])
        .filter(o => espnGames.some(g => g.homeName === o.home_team && g.awayName === o.away_team))
        .map(o => summarizeGame(o, espnGames));
    if (games.length === 0) {
        console.warn(`⚠ No odds matched week ${week} games - data/odds.json left unchanged`);
        return;
    }

    const snapshot = { season, week, fetchedAt: new Date().toISOString(), games };
    const weeks = existing.weeks.filter(w => !(w.season === season && w.week === week)).concat(snapshot)
        .sort((x, y) => x.season - y.season || x.week - y.week);
    fs.writeFileSync(OUT, JSON.stringify({ weeks }, null, 2) + '\n');
    const fav = games.filter(g => g.favorite && !g.coinFlip).length;
    console.log(`✓ Saved week ${week} ${season}: ${games.length}/${espnGames.length} games, ${fav} favorites, ${games.length - fav} coin flips/pick'em`);
}

if (require.main === module) {
    main().catch(e => {
        // Never wipe saved weeks on an API error; fail so the run is visibly red.
        console.error(`✗ Failed to save favorites: ${e.message}`);
        process.exit(1);
    });
}
module.exports = { summarizeGame, main };
