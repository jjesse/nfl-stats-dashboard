#!/usr/bin/env node

/**
 * NFL Stats Data Fetcher
 * 
 * This script fetches NFL statistics from ESPN's public API and saves them
 * as JSON files for GitHub Actions automation.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// TLS certificate verification must remain enabled.

/**
 * Calculate the current NFL season year based on the current date
 * NFL season starts in September and runs through early January of the following year
 * The season is identified by the year it starts (e.g., 2025 season runs Sept 2025 - Jan 2026)
 * @returns {number} Current NFL season year (e.g., 2025 for the 2025-2026 season)
 */
function getCurrentNFLSeason() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11 (0 = January)
    
    // NFL regular season typically starts in early September
    // If we're in January through August, the season year is the previous calendar year
    // If we're in September through December, the season year is the current calendar year
    // For example:
    // - January 3, 2026 -> 2025 season (2025-2026)
    // - September 4, 2025 -> 2025 season (2025-2026)
    // - December 30, 2025 -> 2025 season (2025-2026)
    
    if (currentMonth >= 0 && currentMonth <= 7) {
        // January (0) through August (7) - use previous year
        const seasonYear = currentYear - 1;
        console.log(`Current date: ${now.toISOString()}, NFL season: ${seasonYear}-${currentYear}`);
        return seasonYear;
    } else {
        // September (8) through December (11) - use current year
        console.log(`Current date: ${now.toISOString()}, NFL season: ${currentYear}-${currentYear + 1}`);
        return currentYear;
    }
}

/**
 * Calculate the schedule season year.
 * Starting in May (when the next season schedule is released), use the upcoming season year.
 * @returns {number} Season year to use for schedule fetching
 */
function getCurrentNFLScheduleSeason() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const scheduleReleaseMonth = 4; // May

    if (currentMonth >= scheduleReleaseMonth && currentMonth <= 7) {
        console.log(`Current date: ${now.toISOString()}, schedule season: ${currentYear}-${currentYear + 1}`);
        return currentYear;
    }

    return getCurrentNFLSeason();
}

/**
 * Calculate the current NFL week based on the current date
 * The NFL regular season runs from Week 1 (early September) to Week 18 (early January)
 * @returns {number} Current NFL week (1-18 for regular season, 18 for playoffs/offseason)
 */
function getCurrentNFLWeek(seasonYear = getCurrentNFLSeason()) {
    const now = new Date();
    
    // NFL regular season typically starts the first Thursday after Labor Day (first Monday in September)
    // For simplicity, we'll use a fixed start date in early September
    // This should be updated each year, but will work for most cases
    const seasonStart = new Date(`${seasonYear}-09-04T00:00:00-04:00`); // Early September EDT
    const regularSeasonEnd = new Date(`${seasonYear + 1}-01-10T23:59:59-05:00`); // Early January EST
    
    // If before season starts, return 1 (show Week 1 games)
    if (now < seasonStart) {
        console.log('Before season start - defaulting to Week 1');
        return 1;
    }
    
    // If after regular season ends, return 18 (show final week or playoffs)
    if (now > regularSeasonEnd) {
        console.log('After regular season - defaulting to Week 18');
        return 18;
    }
    
    // Calculate weeks since season start
    // Each week is 7 days, starting Thursday
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    const timeSinceStart = now - seasonStart;
    const weeksSinceStart = Math.floor(timeSinceStart / millisecondsPerWeek);
    
    // Week number is 1-based (Week 1, Week 2, etc.)
    const currentWeek = Math.min(weeksSinceStart + 1, 18);
    
    console.log(`Current NFL week calculated: ${currentWeek}`);
    return currentWeek;
}

const API_CONFIG = {
    baseUrl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
    coreUrl: 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl',
    timeout: 10000,
    currentSeason: getCurrentNFLSeason(), // Stats season (active/completed)
    currentScheduleSeason: getCurrentNFLScheduleSeason() // Schedule season supports preseason release window
};

/**
 * Make an HTTPS GET request
 */
function fetchUrl(url, redirectsLeft = 5) {
    // ESPN's Core API returns $ref links as http://; this helper only speaks https,
    // so upgrade them (ESPN serves the same resources over https).
    if (typeof url === 'string' && url.startsWith('http://')) {
        url = 'https://' + url.slice('http://'.length);
    }
    return new Promise((resolve, reject) => {
        let req;
        try {
        req = https.get(url, { timeout: API_CONFIG.timeout }, (res) => {
            // Follow redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume();
                if (redirectsLeft <= 0) {
                    reject(new Error(`Too many redirects for ${url}`));
                    return;
                }
                const next = new URL(res.headers.location, url).toString();
                resolve(fetchUrl(next, redirectsLeft - 1));
                return;
            }
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode} from ${url}`));
                }
            });
        });
        
        req.on('error', (err) => {
            reject(new Error(`Request failed for ${url}: ${err.message}`));
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error(`Request timeout for ${url}`));
        });
        } catch (err) {
            reject(new Error(`Request failed for ${url}: ${err.message}`));
        }
    });
}

/**
 * Fetch schedule for remaining weeks of the season
 */
async function fetchSchedule() {
    console.log('Fetching schedule data...');
    const year = API_CONFIG.currentScheduleSeason;
    const currentWeek = getCurrentNFLWeek(year);
    const finalWeek = 18; // Regular season ends at week 18
    const weeks = [];
    
    // Save the full regular season (weeks 1-18) so pages that need past weeks
    // (predictions, results) can read saved data instead of calling ESPN from the browser.
    for (let week = 1; week <= finalWeek; week++) {
        weeks.push(week);
    }
    
    console.log(`Fetching weeks 1-${finalWeek} for ${year} season (current week ${currentWeek})`);
    const allGames = [];
    
    for (const week of weeks) {
        try {
            const url = `${API_CONFIG.baseUrl}/scoreboard?dates=${year}&seasontype=2&week=${week}`;
            const data = await fetchUrl(url);
            
            if (data.events) {
                allGames.push(...data.events);
            }
            
            console.log(`  ✓ Week ${week}: ${data.events?.length || 0} games`);
        } catch (error) {
            console.error(`  ✗ Week ${week}: ${error.message}`);
        }
    }
    
    console.log(`Total games fetched: ${allGames.length}`);
    return allGames;
}

/**
 * Fetch team standings data
 */
async function fetchStandings() {
    console.log('Fetching standings data...');
    
    const divisions = {
        'afc-east': { name: 'AFC East', teams: [2, 15, 17, 20] },       // Bills, Dolphins, Patriots, Jets
        'afc-north': { name: 'AFC North', teams: [33, 4, 5, 23] },      // Ravens, Bengals, Browns, Steelers
        'afc-south': { name: 'AFC South', teams: [34, 11, 30, 10] },    // Texans, Colts, Jaguars, Titans
        'afc-west': { name: 'AFC West', teams: [7, 12, 13, 24] },       // Broncos, Chiefs, Raiders, Chargers
        'nfc-east': { name: 'NFC East', teams: [6, 19, 21, 28] },       // Cowboys, Giants, Eagles, Commanders
        'nfc-north': { name: 'NFC North', teams: [3, 8, 9, 16] },       // Bears, Lions, Packers, Vikings
        'nfc-south': { name: 'NFC South', teams: [1, 29, 18, 27] },     // Falcons, Panthers, Saints, Buccaneers
        'nfc-west': { name: 'NFC West', teams: [22, 14, 25, 26] }       // Cardinals, Rams, 49ers, Seahawks
    };
    
    const standings = {};

    // ESPN occasionally returns {} for a single team, or the request fails outright
    // (e.g. "socket hang up"). Retry once, then reuse that team's row from the
    // previously saved standings (marked reused: true) so one bad response can't
    // drop a team (or fail the whole data refresh).
    const TEAM_ABBR = {
        1: 'ATL', 2: 'BUF', 3: 'CHI', 4: 'CIN', 5: 'CLE', 6: 'DAL', 7: 'DEN', 8: 'DET',
        9: 'GB', 10: 'TEN', 11: 'IND', 12: 'KC', 13: 'LV', 14: 'LAR', 15: 'MIA', 16: 'MIN',
        17: 'NE', 18: 'NO', 19: 'NYG', 20: 'NYJ', 21: 'PHI', 22: 'ARI', 23: 'PIT', 24: 'LAC',
        25: 'SF', 26: 'SEA', 27: 'TB', 28: 'WSH', 29: 'CAR', 30: 'JAX', 33: 'BAL', 34: 'HOU'
    };
    let previousStandings = {};
    try {
        previousStandings = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'standings.json'), 'utf8'));
    } catch (e) {
        previousStandings = {};
    }
    const previousRow = (divisionKey, teamId) => (previousStandings[divisionKey] || [])
        .find(row => row && row.team && row.abbreviation === TEAM_ABBR[teamId]);
    
    for (const [divisionKey, divisionInfo] of Object.entries(divisions)) {
        standings[divisionKey] = [];
        
        for (const teamId of divisionInfo.teams) {
            try {
                const url = `${API_CONFIG.baseUrl}/teams/${teamId}`;
                let team = null;
                let problem = 'empty ESPN response';
                for (let attempt = 1; attempt <= 2 && !team; attempt++) {
                    if (attempt > 1) await new Promise(resolve => setTimeout(resolve, 1500));
                    try {
                        const teamData = await fetchUrl(url);
                        const t = (teamData && teamData.team) || teamData;
                        if (t && t.displayName) team = t;
                        else problem = 'empty ESPN response';
                    } catch (err) {
                        problem = err.message;
                    }
                }
                if (!team) {
                    const prev = previousRow(divisionKey, teamId);
                    if (prev) {
                        console.warn(`  ⚠ Team ${teamId} (${TEAM_ABBR[teamId]}): ${problem} (after retry), reusing last saved row`);
                        standings[divisionKey].push({ ...prev, reused: true });
                    } else {
                        console.error(`  ✗ Team ${teamId} (${TEAM_ABBR[teamId]}): ${problem} (after retry) and no saved row`);
                    }
                    continue;
                }
                
                const record = team.record?.items?.[0] || {};
                const stats = record.stats || [];
                
                const getStat = (name) => {
                    const stat = stats.find(s => s.name === name);
                    return stat ? stat.value : 0;
                };
                
                const wins = getStat('wins') || 0;
                const losses = getStat('losses') || 0;
                const ties = getStat('ties') || 0;
                const total = wins + losses + ties;
                const winPct = total > 0 ? (wins / total).toFixed(3) : '.000';
                const streak = getStat('streak') || 0;
                
                standings[divisionKey].push({
                    team: team.displayName,
                    abbreviation: team.abbreviation,
                    wins,
                    losses,
                    ties,
                    winPct,
                    pointsScored: getStat('pointsFor') || 0,
                    pointsAllowed: getStat('pointsAgainst') || 0,
                    differential: getStat('pointDifferential') || 0,
                    streak: streak > 0 ? `W${Math.abs(streak)}` : streak < 0 ? `L${Math.abs(streak)}` : '-'
                });
            } catch (error) {
                console.error(`  ✗ Team ${teamId}: ${error.message}`);
            }
        }
        
        // Sort by win percentage
        standings[divisionKey].sort((a, b) => parseFloat(b.winPct) - parseFloat(a.winPct));
        console.log(`  ✓ ${divisionInfo.name}: ${standings[divisionKey].length} teams`);
    }
    
    return standings;
}

/**
 * Fetch team stats
 */
async function fetchTeamStats(standings = {}) {
    // ESPN's site API /standings endpoint now returns only a "fullViewLink" stub
    // (no children/entries), which silently produced an empty list. Build team
    // stats from the per-team standings we already fetched instead.
    console.log('Building team stats from standings...');
    const allTeams = Object.values(standings || {})
        .filter(Array.isArray)
        .flat()
        .filter(t => t && t.team)
        .map(t => ({
            team: t.team,
            abbreviation: t.abbreviation,
            wins: t.wins,
            losses: t.losses,
            ties: t.ties,
            winPct: t.winPct,
            pointsScored: t.pointsScored,
            pointsAllowed: t.pointsAllowed,
            differential: t.differential,
            ...(t.reused ? { reused: true } : {})
        }))
        .sort((x, y) => (parseFloat(y.winPct) - parseFloat(x.winPct)) || (y.differential - x.differential))
        .map((t, i) => ({ rank: i + 1, ...t }));

    if (allTeams.length === 0) {
        console.error('  ✗ No teams available to build team stats');
    } else {
        console.log(`  ✓ Built stats for ${allTeams.length} teams`);
    }
    return allTeams;
}

/**
 * Build normalized advanced team metrics from team standings data.
 * Phase 1 uses available efficiency proxies and placeholders for future EPA/CPOE integrations.
 * @param {Array} teamStats
 * @param {number} season
 * @returns {Object}
 */
function buildAdvancedMetricsDataset(teamStats = [], season = API_CONFIG.currentSeason) {
    const teams = Array.isArray(teamStats) ? teamStats : [];

    const toNumber = (value, fallback = 0) => {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    const baseTeams = teams.map(team => {
        const wins = toNumber(team.wins, 0);
        const losses = toNumber(team.losses, 0);
        const ties = toNumber(team.ties, 0);
        const gamesPlayed = Math.max(wins + losses + ties, 1);
        const winPct = toNumber(team.winPct, gamesPlayed > 0 ? wins / gamesPlayed : 0);
        const pointsFor = toNumber(team.pointsScored, 0);
        const pointsAgainst = toNumber(team.pointsAllowed, 0);
        const pointDifferential = toNumber(team.differential, pointsFor - pointsAgainst);

        const offensePpg = pointsFor / gamesPlayed;
        const defensePpgAllowed = pointsAgainst / gamesPlayed;
        const pointDiffPerGame = pointDifferential / gamesPlayed;

        // Phase 1 efficiency proxies based on available public standings data
        const epaPerPlayProxy = pointDiffPerGame / 10;
        const successRateProxy = Math.min(Math.max(0.5 + (pointDiffPerGame / 80), 0), 1);
        const redZoneEfficiencyProxy = Math.min(Math.max(0.45 + ((offensePpg - defensePpgAllowed) / 140), 0), 1);
        const pressureRateProxy = Math.min(Math.max(0.18 + (Math.max(pointDiffPerGame, -14) / 140), 0.05), 0.4);
        const cpoeProxy = Math.max(Math.min(pointDiffPerGame / 2.5, 8), -8);

        return {
            team: team.team,
            abbreviation: team.abbreviation || '',
            wins,
            losses,
            ties,
            gamesPlayed,
            raw: {
                winPct,
                pointsFor,
                pointsAgainst,
                pointDifferential,
                offensePpg,
                defensePpgAllowed,
                pointDiffPerGame,
                epaPerPlay: null,
                epaPerPlayProxy,
                successRate: null,
                successRateProxy,
                cpoe: null,
                cpoeProxy,
                pressureRate: null,
                pressureRateProxy,
                redZoneEfficiency: null,
                redZoneEfficiencyProxy,
                opponentStrength: null
            }
        };
    });

    if (baseTeams.length === 0) {
        return {
            version: 'phase1-v1',
            season,
            generatedAt: new Date().toISOString(),
            notes: 'No team stats available to build advanced metrics.',
            teams: []
        };
    }

    const minMax = (values) => ({
        min: Math.min(...values),
        max: Math.max(...values)
    });

    const normalize = (value, range, invert = false) => {
        if (range.max === range.min) return 0.5;
        const rawScore = (value - range.min) / (range.max - range.min);
        return invert ? 1 - rawScore : rawScore;
    };

    const offenseRange = minMax(baseTeams.map(team => team.raw.offensePpg));
    const defenseRange = minMax(baseTeams.map(team => team.raw.defensePpgAllowed));
    const diffRange = minMax(baseTeams.map(team => team.raw.pointDiffPerGame));
    const winPctRange = minMax(baseTeams.map(team => team.raw.winPct));
    const redZoneRange = minMax(baseTeams.map(team => team.raw.redZoneEfficiencyProxy));
    const pressureRange = minMax(baseTeams.map(team => team.raw.pressureRateProxy));

    const normalizedTeams = baseTeams.map(team => {
        const offenseScore = (
            normalize(team.raw.offensePpg, offenseRange) * 0.55 +
            normalize(team.raw.pointDiffPerGame, diffRange) * 0.45
        );

        const defenseScore = (
            normalize(team.raw.defensePpgAllowed, defenseRange, true) * 0.65 +
            normalize(team.raw.pointDiffPerGame, diffRange) * 0.35
        );

        const situationalScore = (
            normalize(team.raw.redZoneEfficiencyProxy, redZoneRange) * 0.45 +
            normalize(team.raw.pressureRateProxy, pressureRange) * 0.25 +
            normalize(team.raw.winPct, winPctRange) * 0.30
        );

        const dvoaLikeProxy = (
            normalize(team.raw.pointDiffPerGame, diffRange) * 0.45 +
            normalize(team.raw.winPct, winPctRange) * 0.35 +
            offenseScore * 0.20
        );

        const compositeRating = (
            offenseScore * 0.34 +
            defenseScore * 0.31 +
            situationalScore * 0.20 +
            dvoaLikeProxy * 0.15
        );

        return {
            ...team,
            normalized: {
                offenseScore: Number(offenseScore.toFixed(4)),
                defenseScore: Number(defenseScore.toFixed(4)),
                situationalScore: Number(situationalScore.toFixed(4)),
                dvoaLikeProxy: Number(dvoaLikeProxy.toFixed(4))
            },
            compositeRating: Number(compositeRating.toFixed(4))
        };
    }).sort((a, b) => b.compositeRating - a.compositeRating)
      .map((team, index) => ({
          ...team,
          rank: index + 1
      }));

    return {
        version: 'phase1-v1',
        season,
        generatedAt: new Date().toISOString(),
        modelDescription: 'Weighted efficiency model using public standings-derived proxies; EPA/CPOE placeholders included for Phase 2.',
        teams: normalizedTeams
    };
}

/**
 * Fetch player stats (QB, Receivers, Rushers)
 * Uses ESPN's Core API leaders endpoint which returns all categories at once
 */
async function fetchPlayerStats() {
    console.log('Fetching player stats...');
    
    const playerStats = {
        qb: [],
        receivers: [],
        rushers: []
    };
    
    try {
        // Try the Core API leaders endpoint first - this gives all categories in one call
        const url = `${API_CONFIG.coreUrl}/seasons/${API_CONFIG.currentSeason}/types/2/leaders?limit=15`;
        console.log(`  Fetching player stats from: ${url}`);
        
        const data = await fetchUrl(url);
        
        if (!data || !data.categories || !Array.isArray(data.categories)) {
            throw new Error('Invalid response structure from API');
        }
        
        // Process each category from the response
        for (const category of data.categories) {
            const categoryName = category.name;
            
            // Map ESPN category names to our keys
            let targetKey = null;
            if (categoryName === 'passingYards' || categoryName === 'passing') {
                targetKey = 'qb';
            } else if (categoryName === 'receivingYards' || categoryName === 'receiving') {
                targetKey = 'receivers';
            } else if (categoryName === 'rushingYards' || categoryName === 'rushing') {
                targetKey = 'rushers';
            }
            
            // Only process categories we care about
            if (!targetKey || !category.leaders || !Array.isArray(category.leaders)) {
                continue;
            }
            
            console.log(`  Processing ${category.displayName || categoryName}...`);
            
            // Fetch detailed info for each leader in this category
            const leaders = category.leaders.slice(0, 15);
            for (let i = 0; i < leaders.length; i++) {
                const leader = leaders[i];
                
                try {
                    // Fetch athlete data
                    if (!leader.athlete || !leader.athlete.$ref) {
                        console.warn(`    ⚠ Leader ${i + 1} missing athlete reference`);
                        continue;
                    }
                    
                    const athleteData = await fetchUrl(leader.athlete.$ref);
                    const athleteName = athleteData.displayName || athleteData.fullName || 'Unknown';
                    
                    // Get team info
                    let teamAbbr = 'N/A';
                    if (leader.team && leader.team.$ref) {
                        try {
                            const teamData = await fetchUrl(leader.team.$ref);
                            teamAbbr = teamData.abbreviation || 'N/A';
                        } catch (teamError) {
                            console.warn(`    ⚠ Failed to fetch team for ${athleteName}`);
                        }
                    }
                    
                    // Get detailed statistics
                    let detailedStats = {};
                    if (leader.statistics && leader.statistics.$ref) {
                        try {
                            const statsData = await fetchUrl(leader.statistics.$ref);
                            // Extract stats from splits.categories
                            if (statsData.splits && statsData.splits.categories) {
                                const statsCategory = statsData.splits.categories.find(cat => 
                                    cat.name === targetKey || 
                                    (targetKey === 'qb' && cat.name === 'passing') ||
                                    (targetKey === 'receivers' && cat.name === 'receiving') ||
                                    (targetKey === 'rushers' && cat.name === 'rushing')
                                );
                                if (statsCategory && statsCategory.stats) {
                                    // Convert stats array to object
                                    statsCategory.stats.forEach(stat => {
                                        detailedStats[stat.name] = stat.value;
                                    });
                                }
                            }
                        } catch (statsError) {
                            console.warn(`    ⚠ Failed to fetch detailed stats for ${athleteName}`);
                        }
                    }
                    
                    // Transform the data based on category
                    let playerData = {
                        rank: i + 1,
                        name: athleteName,
                        team: teamAbbr
                    };
                    
                    if (targetKey === 'qb') {
                        playerData = {
                            ...playerData,
                            games: Math.round(detailedStats.gamesPlayed || detailedStats.teamGamesPlayed || 0),
                            completions: Math.round(detailedStats.completions || 0),
                            attempts: Math.round(detailedStats.passingAttempts || 0),
                            compPct: (detailedStats.completionPct || 0).toFixed(1) + '%',
                            yards: Math.round(leader.value || 0),
                            tds: Math.round(detailedStats.passingTouchdowns || 0),
                            ints: Math.round(detailedStats.interceptions || 0),
                            rating: (detailedStats.quarterbackRating || detailedStats.QBRating || 0).toFixed(1)
                        };
                    } else if (targetKey === 'receivers') {
                        playerData = {
                            ...playerData,
                            games: Math.round(detailedStats.gamesPlayed || detailedStats.teamGamesPlayed || 0),
                            receptions: Math.round(detailedStats.receptions || 0),
                            targets: Math.round(detailedStats.receivingTargets || 0),
                            yards: Math.round(leader.value || 0),
                            avg: (detailedStats.yardsPerReception || detailedStats.avgYards || 0).toFixed(1),
                            tds: Math.round(detailedStats.receivingTouchdowns || 0),
                            long: Math.round(detailedStats.longReception || 0),
                            ypg: (detailedStats.receivingYardsPerGame || detailedStats.yardsPerGame || 0).toFixed(1)
                        };
                    } else if (targetKey === 'rushers') {
                        playerData = {
                            ...playerData,
                            games: Math.round(detailedStats.gamesPlayed || detailedStats.teamGamesPlayed || 0),
                            attempts: Math.round(detailedStats.rushingAttempts || 0),
                            yards: Math.round(leader.value || 0),
                            avg: (detailedStats.yardsPerRushAttempt || detailedStats.avgYards || 0).toFixed(1),
                            tds: Math.round(detailedStats.rushingTouchdowns || 0),
                            long: Math.round(detailedStats.longRushing || 0),
                            ypg: (detailedStats.rushingYardsPerGame || detailedStats.yardsPerGame || 0).toFixed(1),
                            fumbles: Math.round(detailedStats.rushingFumbles || detailedStats.fumblesLost || 0)
                        };
                    }
                    
                    playerStats[targetKey].push(playerData);
                    
                } catch (leaderError) {
                    console.error(`    ✗ Error processing leader ${i + 1}: ${leaderError.message}`);
                }
            }
            
            console.log(`  ✓ ${category.displayName || categoryName}: ${playerStats[targetKey].length} players fetched`);
        }
        
    } catch (error) {
        console.error(`  ✗ Core API failed: ${error.message}`);
        const fallbackSeason = Math.max(API_CONFIG.currentSeason - 1, 2002);
        console.warn(`  Trying to fetch data using ${fallbackSeason} season as fallback...`);
        
        // Try previous completed season as fallback if current season data is unavailable
        try {
            const fallbackUrl = `${API_CONFIG.coreUrl}/seasons/${fallbackSeason}/types/2/leaders?limit=15`;
            console.log(`  Fetching from fallback: ${fallbackUrl}`);
            
            const fallbackData = await fetchUrl(fallbackUrl);
            
            if (fallbackData && fallbackData.categories && Array.isArray(fallbackData.categories)) {
                // Process categories using fallback season data
                // Note: Logic is intentionally duplicated here to keep fallback handling isolated and maintainable
                for (const category of fallbackData.categories) {
                    const categoryName = category.name;
                    let targetKey = null;
                    
                    if (categoryName === 'passingYards' || categoryName === 'passing') {
                        targetKey = 'qb';
                    } else if (categoryName === 'receivingYards' || categoryName === 'receiving') {
                        targetKey = 'receivers';
                    } else if (categoryName === 'rushingYards' || categoryName === 'rushing') {
                        targetKey = 'rushers';
                    }
                    
                    if (!targetKey || !category.leaders || !Array.isArray(category.leaders)) {
                        continue;
                    }
                    
                    console.log(`  Processing ${category.displayName || categoryName} from ${fallbackSeason} season...`);
                    
                    const leaders = category.leaders.slice(0, 15);
                    // Process up to 15 leaders (consistent with primary API limit)
                    for (let i = 0; i < leaders.length; i++) {
                        const leader = leaders[i];
                        
                        try {
                            if (!leader.athlete || !leader.athlete.$ref) continue;
                            
                            const athleteData = await fetchUrl(leader.athlete.$ref);
                            const athleteName = athleteData.displayName || athleteData.fullName || 'Unknown';
                            
                            let teamAbbr = 'N/A';
                            if (leader.team && leader.team.$ref) {
                                try {
                                    const teamData = await fetchUrl(leader.team.$ref);
                                    teamAbbr = teamData.abbreviation || 'N/A';
                                } catch (teamError) {
                                    // Team data is optional; continue with 'N/A' if fetch fails
                                    console.warn(`    ⚠ Failed to fetch team data in fallback`);
                                }
                            }
                            
                            let detailedStats = {};
                            if (leader.statistics && leader.statistics.$ref) {
                                try {
                                    const statsData = await fetchUrl(leader.statistics.$ref);
                                    if (statsData.splits && statsData.splits.categories) {
                                        const statsCategory = statsData.splits.categories.find(cat => 
                                            cat.name === targetKey || 
                                            (targetKey === 'qb' && cat.name === 'passing') ||
                                            (targetKey === 'receivers' && cat.name === 'receiving') ||
                                            (targetKey === 'rushers' && cat.name === 'rushing')
                                        );
                                        if (statsCategory && statsCategory.stats) {
                                            statsCategory.stats.forEach(stat => {
                                                detailedStats[stat.name] = stat.value;
                                            });
                                        }
                                    }
                                } catch (statsError) {
                                    // Detailed stats are optional; continue with basic data if fetch fails
                                    console.warn(`    ⚠ Failed to fetch detailed stats in fallback`);
                                }
                            }
                            
                            let playerData = {
                                rank: i + 1,
                                name: athleteName,
                                team: teamAbbr
                            };
                            
                            if (targetKey === 'qb') {
                                playerData = {
                                    ...playerData,
                                    games: Math.round(detailedStats.gamesPlayed || detailedStats.teamGamesPlayed || 0),
                                    completions: Math.round(detailedStats.completions || 0),
                                    attempts: Math.round(detailedStats.passingAttempts || 0),
                                    compPct: (detailedStats.completionPct || 0).toFixed(1) + '%',
                                    yards: Math.round(leader.value || 0),
                                    tds: Math.round(detailedStats.passingTouchdowns || 0),
                                    ints: Math.round(detailedStats.interceptions || 0),
                                    rating: (detailedStats.quarterbackRating || detailedStats.QBRating || 0).toFixed(1)
                                };
                            } else if (targetKey === 'receivers') {
                                playerData = {
                                    ...playerData,
                                    games: Math.round(detailedStats.gamesPlayed || detailedStats.teamGamesPlayed || 0),
                                    receptions: Math.round(detailedStats.receptions || 0),
                                    targets: Math.round(detailedStats.receivingTargets || 0),
                                    yards: Math.round(leader.value || 0),
                                    avg: (detailedStats.yardsPerReception || detailedStats.avgYards || 0).toFixed(1),
                                    tds: Math.round(detailedStats.receivingTouchdowns || 0),
                                    long: Math.round(detailedStats.longReception || 0),
                                    ypg: (detailedStats.receivingYardsPerGame || detailedStats.yardsPerGame || 0).toFixed(1)
                                };
                            } else if (targetKey === 'rushers') {
                                playerData = {
                                    ...playerData,
                                    games: Math.round(detailedStats.gamesPlayed || detailedStats.teamGamesPlayed || 0),
                                    attempts: Math.round(detailedStats.rushingAttempts || 0),
                                    yards: Math.round(leader.value || 0),
                                    avg: (detailedStats.yardsPerRushAttempt || detailedStats.avgYards || 0).toFixed(1),
                                    tds: Math.round(detailedStats.rushingTouchdowns || 0),
                                    long: Math.round(detailedStats.longRushing || 0),
                                    ypg: (detailedStats.rushingYardsPerGame || detailedStats.yardsPerGame || 0).toFixed(1),
                                    fumbles: Math.round(detailedStats.rushingFumbles || detailedStats.fumblesLost || 0)
                                };
                            }
                            
                            playerStats[targetKey].push(playerData);
                            
                        } catch (leaderProcessError) {
                            // Individual player processing errors in fallback are expected and acceptable
                            // Log warning to aid in debugging but continue processing remaining players
                            console.warn(`    ⚠ Error processing player ${i + 1} in fallback: ${leaderProcessError.message}`);
                        }
                    }
                    
                    console.log(`  ✓ ${category.displayName || categoryName}: ${playerStats[targetKey].length} players (${fallbackSeason} data)`);
                }
            }
        } catch (fallbackError) {
            console.error(`  ✗ Fallback to ${fallbackSeason} also failed: ${fallbackError.message}`);
        }
    }
    
    // Check if we got any data
    const totalPlayers = Object.values(playerStats).reduce((sum, arr) => sum + arr.length, 0);
    if (totalPlayers === 0) {
        console.warn('  ⚠ WARNING: No player stats fetched from ESPN API');
        console.warn('  The player-stats.json file will contain empty arrays');
        console.warn('  The website will show "No data available" message');
    } else {
        console.log(`  ✓ Total players fetched: ${totalPlayers} (QB: ${playerStats.qb.length}, Receivers: ${playerStats.receivers.length}, Rushers: ${playerStats.rushers.length})`);
    }
    
    return playerStats;
}

/**
 * ESPN "statistics by athlete" endpoint (server-side only; browsers are blocked by CORS).
 * One record carries every stat group (general, defensive, kicking, punting, returning,
 * scoring...), plus the player's name, team abbreviation and headshot.
 */
const STATS_BY_ATHLETE_URL = 'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/statistics/byathlete';

/** ESPN sometimes hands out http:// asset links; the site is https, so upgrade them (mixed content). */
function toHttps(url) {
    return typeof url === 'string' && url.startsWith('http://') ? 'https://' + url.slice('http://'.length) : (url || '');
}

/** ESPN's stats endpoints occasionally return an empty body or a 400; retry a couple of times. */
async function fetchWithRetry(url, attempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await fetchUrl(url);
        } catch (error) {
            lastError = error;
            if (attempt < attempts) {
                await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
            }
        }
    }
    throw lastError;
}

/**
 * Fetch athletes from the by-athlete stats endpoint and flatten each one to
 * { name, team, position, headshot, stats: { 'group.statName': value } }.
 * @param {Object} params - category / sort / limit query params
 * @param {number} maxPages - pages to walk (each page holds up to `limit` athletes)
 */
async function fetchAthleteStats(params = {}, maxPages = 1) {
    const athletes = [];
    for (let page = 1; page <= maxPages; page++) {
        const query = new URLSearchParams({
            season: String(API_CONFIG.currentSeason),
            seasontype: '2',
            limit: '50',
            ...params,
            page: String(page)
        });
        const data = await fetchWithRetry(`${STATS_BY_ATHLETE_URL}?${query.toString()}`);
        if (!data || !Array.isArray(data.athletes) || !Array.isArray(data.categories)) {
            throw new Error('Invalid by-athlete response structure');
        }
        const groupNames = {};
        data.categories.forEach(c => { groupNames[c.name] = c.names || []; });

        for (const entry of data.athletes) {
            const athlete = entry.athlete || {};
            const stats = {};
            (entry.categories || []).forEach(group => {
                const names = groupNames[group.name] || [];
                (group.values || []).forEach((value, i) => {
                    if (names[i] && value !== null && value !== undefined) {
                        stats[`${group.name}.${names[i]}`] = value;
                    }
                });
            });
            athletes.push({
                name: athlete.displayName || athlete.fullName || 'Unknown',
                team: athlete.teamShortName || (athlete.teams && athlete.teams[0] && athlete.teams[0].abbreviation) || 'N/A',
                position: (athlete.position && athlete.position.abbreviation) || '',
                headshot: toHttps(athlete.headshot && athlete.headshot.href),
                stats
            });
        }
        const pages = (data.pagination && data.pagination.pages) || 1;
        if (page >= pages) break;
    }
    return athletes;
}

/** Load a previously saved data file (used to reuse sections when ESPN returns nothing). */
function loadSavedFile(filename) {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', filename), 'utf8'));
    } catch (e) {
        return null;
    }
}

/**
 * Keep a freshly fetched list, or reuse the last saved one if ESPN returned nothing
 * (same idea as the per-team standings guard), so one bad response can't blank a page.
 */
function keepOrReuse(label, fresh, previous, reused) {
    if (Array.isArray(fresh) && fresh.length > 0) return fresh;
    if (Array.isArray(previous) && previous.length > 0) {
        console.warn(`  ⚠ ${label}: no data from ESPN, reusing last saved list (${previous.length})`);
        reused.push(label);
        return previous;
    }
    console.error(`  ✗ ${label}: no data from ESPN and nothing saved to reuse`);
    return [];
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const round1 = (v) => Math.round(num(v) * 10) / 10;

/** Sort by a value (desc), keep entries with value > 0, take the top `limit`, and rank them. */
function topBy(list, valueFn, limit, tieFn = () => 0) {
    return list
        .filter(p => valueFn(p) > 0)
        .sort((a, b) => (valueFn(b) - valueFn(a)) || (tieFn(b) - tieFn(a)) || a.name.localeCompare(b.name))
        .slice(0, limit)
        .map((p, i) => ({ rank: i + 1, ...p }));
}

/**
 * Fetch defensive leaders: tackles, sacks, interceptions, forced fumbles, passes defended.
 * ESPN can't sort by forced fumbles, so walk every defender (a few pages) and rank locally.
 */
async function fetchDefensiveStats() {
    console.log('Fetching defensive stats...');
    const previous = loadSavedFile('defensive-stats.json') || {};
    const reused = [];
    let defenders = [];
    try {
        const raw = await fetchAthleteStats({ category: 'defense', sort: 'defensive.totalTackles:desc', limit: '500' }, 5);
        defenders = raw.map(a => {
            const s = a.stats;
            const games = Math.round(num(s['general.gamesPlayed']));
            const totalTackles = Math.round(num(s['defensive.totalTackles']));
            return {
                name: a.name,
                team: a.team,
                position: a.position,
                headshot: a.headshot,
                games,
                totalTackles,
                soloTackles: Math.round(num(s['defensive.soloTackles'])),
                assistTackles: Math.round(num(s['defensive.assistTackles'])),
                tacklesForLoss: Math.round(num(s['defensive.tacklesForLoss'])),
                sacks: round1(s['defensive.sacks']),
                interceptions: Math.round(num(s['defensiveinterceptions.interceptions'])),
                interceptionYards: Math.round(num(s['defensiveinterceptions.interceptionYards'])),
                interceptionTouchdowns: Math.round(num(s['defensiveinterceptions.interceptionTouchdowns'])),
                passesDefended: Math.round(num(s['defensive.passesDefended'])),
                forcedFumbles: Math.round(num(s['general.fumblesForced'])),
                fumblesRecovered: Math.round(num(s['general.fumblesRecovered'])),
                tacklesPerGame: games > 0 ? round1(totalTackles / games) : 0
            };
        });
        console.log(`  ✓ ${defenders.length} defenders fetched`);
    } catch (error) {
        console.error(`  ✗ Defensive stats failed: ${error.message}`);
    }

    const LIMIT = 25;
    const result = {
        season: API_CONFIG.currentSeason,
        generatedAt: new Date().toISOString(),
        tackles: keepOrReuse('defense.tackles', topBy(defenders, p => p.totalTackles, LIMIT, p => p.soloTackles), previous.tackles, reused),
        sacks: keepOrReuse('defense.sacks', topBy(defenders, p => p.sacks, LIMIT, p => p.tacklesForLoss), previous.sacks, reused),
        interceptions: keepOrReuse('defense.interceptions', topBy(defenders, p => p.interceptions, LIMIT, p => p.interceptionYards), previous.interceptions, reused),
        forcedFumbles: keepOrReuse('defense.forcedFumbles', topBy(defenders, p => p.forcedFumbles, LIMIT, p => p.fumblesRecovered), previous.forcedFumbles, reused),
        passesDefended: keepOrReuse('defense.passesDefended', topBy(defenders, p => p.passesDefended, LIMIT, p => p.interceptions), previous.passesDefended, reused)
    };
    if (reused.length) result.reused = reused;
    console.log(`  ✓ Defensive lists: tackles ${result.tackles.length}, sacks ${result.sacks.length}, INT ${result.interceptions.length}, FF ${result.forcedFumbles.length}, PD ${result.passesDefended.length}`);
    return result;
}

/**
 * Fetch special teams leaders: kickers (FG), punters, kick/punt returners.
 * ESPN's default (qualified) lists are used, sorted server-side.
 */
async function fetchSpecialTeamsStats() {
    console.log('Fetching special teams stats...');
    const previous = loadSavedFile('special-teams.json') || {};
    const reused = [];
    const LIMIT = 25;

    let kickers = [];
    try {
        const raw = await fetchAthleteStats({ sort: 'kicking.fieldGoalsMade:desc', limit: '50' });
        kickers = topBy(raw.map(a => {
            const s = a.stats;
            return {
                name: a.name, team: a.team, position: a.position, headshot: a.headshot,
                games: Math.round(num(s['general.gamesPlayed'])),
                fgm: Math.round(num(s['kicking.fieldGoalsMade'])),
                fga: Math.round(num(s['kicking.fieldGoalAttempts'])),
                fgPct: round1(s['kicking.fieldGoalPct']),
                long: Math.round(num(s['kicking.longFieldGoalMade'])),
                fgm50: Math.round(num(s['kicking.fieldGoalsMade50'])),
                xpm: Math.round(num(s['kicking.extraPointsMade'])),
                xpa: Math.round(num(s['kicking.extraPointAttempts'])),
                points: Math.round(num(s['scoring.totalPoints']))
            };
        }), p => p.fgm, LIMIT, p => p.fgPct);
        console.log(`  ✓ Kickers: ${kickers.length}`);
    } catch (error) {
        console.error(`  ✗ Kickers failed: ${error.message}`);
    }

    let punters = [];
    try {
        const raw = await fetchAthleteStats({ sort: 'punting.grossAvgPuntYards:desc', limit: '50' });
        punters = topBy(raw.map(a => {
            const s = a.stats;
            return {
                name: a.name, team: a.team, position: a.position, headshot: a.headshot,
                games: Math.round(num(s['general.gamesPlayed'])),
                punts: Math.round(num(s['punting.punts'])),
                yards: Math.round(num(s['punting.puntYards'])),
                avg: round1(s['punting.grossAvgPuntYards']),
                netAvg: round1(s['punting.netAvgPuntYards']),
                long: Math.round(num(s['punting.longPunt'])),
                inside20: Math.round(num(s['punting.puntsInside20'])),
                touchbacks: Math.round(num(s['punting.touchbacks']))
            };
        }), p => p.avg, LIMIT, p => p.punts);
        console.log(`  ✓ Punters: ${punters.length}`);
    } catch (error) {
        console.error(`  ✗ Punters failed: ${error.message}`);
    }

    // Returners: merge the kick-return and punt-return leader lists, rank by total return yards
    let returners = [];
    try {
        const byKey = new Map();
        for (const sort of ['returning.kickReturnYards:desc', 'returning.puntReturnYards:desc']) {
            const raw = await fetchAthleteStats({ sort, limit: '50' });
            raw.forEach(a => byKey.set(`${a.name}|${a.team}`, a));
        }
        returners = topBy([...byKey.values()].map(a => {
            const s = a.stats;
            const krYards = Math.round(num(s['returning.kickReturnYards']));
            const prYards = Math.round(num(s['returning.puntReturnYards']));
            return {
                name: a.name, team: a.team, position: a.position, headshot: a.headshot,
                games: Math.round(num(s['general.gamesPlayed'])),
                kr: Math.round(num(s['returning.kickReturns'])),
                krYards,
                krAvg: round1(s['returning.yardsPerKickReturn']),
                krLong: Math.round(num(s['returning.longKickReturn'])),
                pr: Math.round(num(s['returning.puntReturns'])),
                prYards,
                prAvg: round1(s['returning.yardsPerPuntReturn']),
                prLong: Math.round(num(s['returning.longPuntReturn'])),
                tds: Math.round(num(s['returning.kickReturnTouchdowns']) + num(s['returning.puntReturnTouchdowns'])),
                totalYards: krYards + prYards
            };
        }), p => p.totalYards, LIMIT, p => p.tds);
        console.log(`  ✓ Returners: ${returners.length}`);
    } catch (error) {
        console.error(`  ✗ Returners failed: ${error.message}`);
    }

    const result = {
        season: API_CONFIG.currentSeason,
        generatedAt: new Date().toISOString(),
        kickers: keepOrReuse('specialTeams.kickers', kickers, previous.kickers, reused),
        punters: keepOrReuse('specialTeams.punters', punters, previous.punters, reused),
        returners: keepOrReuse('specialTeams.returners', returners, previous.returners, reused)
    };
    if (reused.length) result.reused = reused;
    return result;
}

/**
 * Build the League Leaders summary (top 5 per category).
 * Yardage leaders come from the same player-stats data the QB/receiver/rushing pages use,
 * defensive and kicking leaders from the lists above, the rest from ESPN's by-athlete sorts.
 */
async function fetchLeagueLeaders(playerStats = {}, defensive = {}, specialTeams = {}) {
    console.log('Building league leaders...');
    const previous = (loadSavedFile('league-leaders.json') || {}).categories || {};
    const reused = [];
    const TOP = 5;
    const pick = (list, valueKey) => (Array.isArray(list) ? list : [])
        .filter(p => num(p[valueKey]) > 0)
        .slice(0, TOP)
        .map((p, i) => ({ rank: i + 1, name: p.name, team: p.team, value: p[valueKey] }));

    const sortedFromEspn = async (sort, statKey) => {
        try {
            const raw = await fetchAthleteStats({ sort: `${sort}:desc`, limit: '10' });
            return topBy(raw.map(a => ({ name: a.name, team: a.team, value: num(a.stats[statKey]) })), p => p.value, TOP)
                .map(p => ({ rank: p.rank, name: p.name, team: p.team, value: Math.round(p.value * 10) / 10 }));
        } catch (error) {
            console.error(`  ✗ League leaders ${sort} failed: ${error.message}`);
            return [];
        }
    };

    const fresh = {
        passingYards: { label: 'Passing Yards', leaders: pick(playerStats.qb, 'yards') },
        rushingYards: { label: 'Rushing Yards', leaders: pick(playerStats.rushers, 'yards') },
        receivingYards: { label: 'Receiving Yards', leaders: pick(playerStats.receivers, 'yards') },
        totalTouchdowns: { label: 'Total Touchdowns', leaders: await sortedFromEspn('scoring.totalTouchdowns', 'scoring.totalTouchdowns') },
        sacks: { label: 'Sacks', leaders: pick(defensive.sacks, 'sacks') },
        interceptions: { label: 'Interceptions', leaders: pick(defensive.interceptions, 'interceptions') },
        passingTouchdowns: { label: 'Passing TDs', leaders: await sortedFromEspn('passing.passingTouchdowns', 'passing.passingTouchdowns') },
        rushingTouchdowns: { label: 'Rushing TDs', leaders: await sortedFromEspn('rushing.rushingTouchdowns', 'rushing.rushingTouchdowns') },
        receptions: { label: 'Receptions', leaders: await sortedFromEspn('receiving.receptions', 'receiving.receptions') },
        totalTackles: { label: 'Tackles', leaders: pick(defensive.tackles, 'totalTackles') },
        fieldGoals: { label: 'Field Goals Made', leaders: pick(specialTeams.kickers, 'fgm') },
        totalPoints: { label: 'Points Scored', leaders: await sortedFromEspn('scoring.totalPoints', 'scoring.totalPoints') }
    };

    const categories = {};
    for (const [key, cat] of Object.entries(fresh)) {
        categories[key] = {
            label: cat.label,
            leaders: keepOrReuse(`leagueLeaders.${key}`, cat.leaders, previous[key] && previous[key].leaders, reused)
        };
    }
    const result = { season: API_CONFIG.currentSeason, generatedAt: new Date().toISOString(), categories };
    if (reused.length) result.reused = reused;
    console.log(`  ✓ League leaders: ${Object.values(categories).filter(c => c.leaders.length > 0).length}/${Object.keys(categories).length} categories filled`);
    return result;
}

/**
 * Save data to JSON file
 */
function saveToFile(filename, data) {
    const dataDir = path.join(__dirname, '..', 'data');
    
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filepath = path.join(dataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`✓ Saved to ${filename}`);
}

/**
 * Main execution
 */
async function main() {
    console.log('='.repeat(50));
    console.log('NFL Stats Data Fetcher');
    console.log(`Started: ${new Date().toISOString()}`);
    console.log('='.repeat(50));
    console.log();
    
    try {
        // Fetch all data
        const schedule = await fetchSchedule();
        console.log();
        
        const standings = await fetchStandings();
        console.log();
        
        const teamStats = await fetchTeamStats(standings);
        console.log();

        const advancedMetrics = buildAdvancedMetricsDataset(teamStats, API_CONFIG.currentSeason);
        console.log(`  ✓ Advanced metrics generated for ${advancedMetrics.teams.length} teams`);
        console.log();
        
        const playerStats = await fetchPlayerStats();
        console.log();

        const defensiveStats = await fetchDefensiveStats();
        console.log();

        const specialTeams = await fetchSpecialTeamsStats();
        console.log();

        const leagueLeaders = await fetchLeagueLeaders(playerStats, defensiveStats, specialTeams);
        console.log();
        
        // Save to files
        console.log('Saving data files...');
        saveToFile('schedule.json', schedule);
        saveToFile('standings.json', standings);
        saveToFile('team-stats.json', teamStats);
        saveToFile('advanced-metrics.json', advancedMetrics);
        saveToFile('player-stats.json', playerStats);
        saveToFile('defensive-stats.json', defensiveStats);
        saveToFile('special-teams.json', specialTeams);
        saveToFile('league-leaders.json', leagueLeaders);
        
        // Save metadata
        const metadata = {
            lastUpdated: new Date().toISOString(),
            recordCount: {
                schedule: schedule.length,
                standings: Object.keys(standings).length,
                reusedTeams: Object.values(standings).flat().filter(t => t && t.reused).map(t => t.abbreviation),
                teamStats: teamStats.length,
                advancedMetrics: advancedMetrics.teams?.length || 0,
                playerStats: {
                    qb: playerStats.qb?.length || 0,
                    receivers: playerStats.receivers?.length || 0,
                    rushers: playerStats.rushers?.length || 0
                },
                defensiveStats: {
                    tackles: defensiveStats.tackles.length,
                    sacks: defensiveStats.sacks.length,
                    interceptions: defensiveStats.interceptions.length,
                    forcedFumbles: defensiveStats.forcedFumbles.length,
                    passesDefended: defensiveStats.passesDefended.length
                },
                specialTeams: {
                    kickers: specialTeams.kickers.length,
                    punters: specialTeams.punters.length,
                    returners: specialTeams.returners.length
                },
                leagueLeaders: Object.values(leagueLeaders.categories).filter(c => c.leaders.length > 0).length
            }
        };
        saveToFile('metadata.json', metadata);
        
        console.log();
        console.log('='.repeat(50));
        console.log('✓ Data fetch completed successfully');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error();
        console.error('='.repeat(50));
        console.error('✗ Error:', error.message);
        console.error('='.repeat(50));
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, fetchSchedule, fetchStandings, fetchTeamStats, fetchPlayerStats, fetchDefensiveStats, fetchSpecialTeamsStats, fetchLeagueLeaders, buildAdvancedMetricsDataset };
