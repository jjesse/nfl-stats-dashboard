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

// Disable SSL verification for systems with certificate issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
 * Calculate the current NFL week based on the current date
 * The NFL regular season runs from Week 1 (early September) to Week 18 (early January)
 * @returns {number} Current NFL week (1-18 for regular season, 18 for playoffs/offseason)
 */
function getCurrentNFLWeek() {
    const now = new Date();
    const seasonYear = getCurrentNFLSeason();
    
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
    currentSeason: getCurrentNFLSeason() // Dynamically calculated based on current date
};

/**
 * Make an HTTPS GET request
 */
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { timeout: API_CONFIG.timeout }, (res) => {
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
    });
}

/**
 * Fetch schedule for remaining weeks of the season
 */
async function fetchSchedule() {
    console.log('Fetching schedule data...');
    const year = API_CONFIG.currentSeason;
    const currentWeek = getCurrentNFLWeek();
    const finalWeek = 18; // Regular season ends at week 18
    const weeks = [];
    
    // Build array of weeks from current week to end of season
    for (let week = currentWeek; week <= finalWeek; week++) {
        weeks.push(week);
    }
    
    console.log(`Fetching weeks ${currentWeek}-${finalWeek} for ${year} season`);
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
    
    for (const [divisionKey, divisionInfo] of Object.entries(divisions)) {
        standings[divisionKey] = [];
        
        for (const teamId of divisionInfo.teams) {
            try {
                const url = `${API_CONFIG.baseUrl}/teams/${teamId}`;
                const teamData = await fetchUrl(url);
                const team = teamData.team || teamData;
                
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
async function fetchTeamStats() {
    console.log('Fetching team stats...');
    
    try {
        const url = `${API_CONFIG.baseUrl}/standings`;
        const data = await fetchUrl(url);
        
        const allTeams = [];
        
        if (data.children) {
            for (const conference of data.children) {
                if (conference.standings?.entries) {
                    for (const entry of conference.standings.entries) {
                        const team = entry.team;
                        const stats = entry.stats || [];
                        
                        const getStat = (name) => {
                            const stat = stats.find(s => s.name === name);
                            return stat ? stat.value : 0;
                        };
                        
                        allTeams.push({
                            team: team.displayName,
                            abbreviation: team.abbreviation,
                            wins: getStat('wins'),
                            losses: getStat('losses'),
                            ties: getStat('ties'),
                            winPct: getStat('winPercent').toFixed(3),
                            pointsScored: getStat('pointsFor'),
                            pointsAllowed: getStat('pointsAgainst'),
                            differential: getStat('pointDifferential')
                        });
                    }
                }
            }
        }
        
        console.log(`  ✓ Fetched ${allTeams.length} teams`);
        return allTeams;
    } catch (error) {
        console.error(`  ✗ ${error.message}`);
        return [];
    }
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
        console.warn('  Trying to fetch data using 2024 season as fallback...');
        
        // Try 2024 season as fallback since 2025 might not have data yet
        try {
            const fallbackUrl = `${API_CONFIG.coreUrl}/seasons/2024/types/2/leaders?limit=15`;
            console.log(`  Fetching from fallback: ${fallbackUrl}`);
            
            const fallbackData = await fetchUrl(fallbackUrl);
            
            if (fallbackData && fallbackData.categories && Array.isArray(fallbackData.categories)) {
                // Process categories (same logic as above)
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
                    
                    console.log(`  Processing ${category.displayName || categoryName} from 2024 season...`);
                    
                    const leaders = category.leaders.slice(0, 15);
                    for (let i = 0; i < leaders.length && i < 10; i++) { // Limit to 10 for fallback
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
                            // Continue processing remaining players even if one fails
                        }
                    }
                    
                    console.log(`  ✓ ${category.displayName || categoryName}: ${playerStats[targetKey].length} players (2024 data)`);
                }
            }
        } catch (fallbackError) {
            console.error(`  ✗ Fallback to 2024 also failed: ${fallbackError.message}`);
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
 * Fetch betting odds from The Odds API
 */
async function fetchOdds() {
    console.log('Fetching betting odds...');
    
    const apiKey = process.env.ODDS_API_KEY;
    
    if (!apiKey) {
        console.warn('  ⚠ ODDS_API_KEY not found - skipping odds fetch');
        console.warn('  Set ODDS_API_KEY in GitHub Secrets to enable odds data');
        return null;
    }
    
    try {
        const url = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`;
        const data = await fetchUrl(url);
        
        console.log(`  ✓ Odds fetched for ${data.length || 0} games`);
        
        // Check remaining requests
        if (data.length > 0) {
            console.log(`  ℹ API requests used: Check response headers for remaining quota`);
        }
        
        return data;
    } catch (error) {
        console.error(`  ✗ Failed to fetch odds: ${error.message}`);
        return null;
    }
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
        
        const teamStats = await fetchTeamStats();
        console.log();
        
        const playerStats = await fetchPlayerStats();
        console.log();
        
        const odds = await fetchOdds();
        console.log();
        
        // Save to files
        console.log('Saving data files...');
        saveToFile('schedule.json', schedule);
        saveToFile('standings.json', standings);
        saveToFile('team-stats.json', teamStats);
        saveToFile('player-stats.json', playerStats);
        
        if (odds) {
            saveToFile('odds.json', odds);
        }
        
        // Save metadata
        const metadata = {
            lastUpdated: new Date().toISOString(),
            recordCount: {
                schedule: schedule.length,
                standings: Object.keys(standings).length,
                teamStats: teamStats.length,
                playerStats: {
                    qb: playerStats.qb?.length || 0,
                    receivers: playerStats.receivers?.length || 0,
                    rushers: playerStats.rushers?.length || 0
                },
                odds: odds ? odds.length : 0
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

module.exports = { main, fetchSchedule, fetchStandings, fetchTeamStats, fetchPlayerStats, fetchOdds };
