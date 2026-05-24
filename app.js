/**
 * NFL Stats Dashboard - Main JavaScript
 * 
 * This file handles data loading and dynamic content for the dashboard.
 * Currently uses placeholder data; will be replaced with real API calls
 * and GitHub Actions automation in future iterations.
 */

// ==========================================
// Data Storage Objects
// ==========================================

// Sample schedule data
const scheduleData = [
    {
        date: "2025-12-07",
        time: "1:00 PM ET",
        awayTeam: "Kansas City Chiefs",
        awayRecord: "11-1",
        homeTeam: "Los Angeles Chargers",
        homeRecord: "8-4",
        venue: "SoFi Stadium"
    },
    {
        date: "2025-12-07",
        time: "1:00 PM ET",
        awayTeam: "Pittsburgh Steelers",
        awayRecord: "9-3",
        homeTeam: "Cleveland Browns",
        homeRecord: "3-9",
        venue: "Huntington Bank Field"
    },
    {
        date: "2025-12-08",
        time: "4:05 PM ET",
        awayTeam: "Detroit Lions",
        awayRecord: "11-1",
        homeTeam: "Green Bay Packers",
        homeRecord: "9-3",
        venue: "Lambeau Field"
    },
    {
        date: "2025-12-08",
        time: "4:25 PM ET",
        awayTeam: "Buffalo Bills",
        awayRecord: "10-2",
        homeTeam: "Los Angeles Rams",
        homeRecord: "7-5",
        venue: "SoFi Stadium"
    },
    {
        date: "2025-12-08",
        time: "8:20 PM ET",
        awayTeam: "Cincinnati Bengals",
        awayRecord: "5-7",
        homeTeam: "Dallas Cowboys",
        homeRecord: "5-7",
        venue: "AT&T Stadium"
    }
];

// Sample team statistics
const teamStatsData = [
    { rank: 1, team: "Detroit Lions", wins: 11, losses: 1, ties: 0, winPct: ".917", pointsScored: 372, pointsAllowed: 248, differential: 124 },
    { rank: 2, team: "Kansas City Chiefs", wins: 11, losses: 1, ties: 0, winPct: ".917", pointsScored: 315, pointsAllowed: 248, differential: 67 },
    { rank: 3, team: "Buffalo Bills", wins: 10, losses: 2, ties: 0, winPct: ".833", pointsScored: 358, pointsAllowed: 270, differential: 88 },
    { rank: 4, team: "Philadelphia Eagles", wins: 10, losses: 2, ties: 0, winPct: ".833", pointsScored: 314, pointsAllowed: 245, differential: 69 },
    { rank: 5, team: "Green Bay Packers", wins: 9, losses: 3, ties: 0, winPct: ".750", pointsScored: 308, pointsAllowed: 272, differential: 36 },
    { rank: 6, team: "Pittsburgh Steelers", wins: 9, losses: 3, ties: 0, winPct: ".750", pointsScored: 297, pointsAllowed: 251, differential: 46 },
    { rank: 7, team: "Minnesota Vikings", wins: 10, losses: 2, ties: 0, winPct: ".833", pointsScored: 304, pointsAllowed: 232, differential: 72 },
    { rank: 8, team: "Los Angeles Chargers", wins: 8, losses: 4, ties: 0, winPct: ".667", pointsScored: 288, pointsAllowed: 245, differential: 43 },
    { rank: 9, team: "Baltimore Ravens", wins: 8, losses: 5, ties: 0, winPct: ".615", pointsScored: 362, pointsAllowed: 295, differential: 67 },
    { rank: 10, team: "Washington Commanders", wins: 8, losses: 5, ties: 0, winPct: ".615", pointsScored: 325, pointsAllowed: 306, differential: 19 }
];

// Sample quarterback statistics
const qbLeadersData = [
    { rank: 1, name: "Lamar Jackson", team: "BAL", games: 13, completions: 268, attempts: 379, compPct: "70.7%", yards: 3290, tds: 33, ints: 3, rating: 119.2 },
    { rank: 2, name: "Jared Goff", team: "DET", games: 12, completions: 288, attempts: 404, compPct: "71.3%", yards: 3265, tds: 25, ints: 10, rating: 106.8 },
    { rank: 3, name: "Josh Allen", team: "BUF", games: 12, completions: 254, attempts: 388, compPct: "65.5%", yards: 3033, tds: 23, ints: 5, rating: 100.7 },
    { rank: 4, name: "Joe Burrow", team: "CIN", games: 12, completions: 297, attempts: 413, compPct: "71.9%", yards: 3337, tds: 30, ints: 5, rating: 109.9 },
    { rank: 5, name: "Jalen Hurts", team: "PHI", games: 11, completions: 239, attempts: 351, compPct: "68.1%", yards: 2903, tds: 18, ints: 5, rating: 102.9 },
    { rank: 6, name: "Patrick Mahomes", team: "KC", games: 12, completions: 282, attempts: 406, compPct: "69.5%", yards: 3348, tds: 23, ints: 11, rating: 97.4 },
    { rank: 7, name: "Baker Mayfield", team: "TB", games: 12, completions: 283, attempts: 420, compPct: "67.4%", yards: 3290, tds: 28, ints: 12, rating: 99.6 },
    { rank: 8, name: "Sam Darnold", team: "MIN", games: 12, completions: 251, attempts: 370, compPct: "67.8%", yards: 2953, tds: 25, ints: 10, rating: 103.4 },
    { rank: 9, name: "Tua Tagovailoa", team: "MIA", games: 8, completions: 199, attempts: 281, compPct: "70.8%", yards: 2160, tds: 15, ints: 7, rating: 100.4 },
    { rank: 10, name: "Matthew Stafford", team: "LAR", games: 12, completions: 264, attempts: 393, compPct: "67.2%", yards: 2888, tds: 16, ints: 7, rating: 92.5 }
];

// Sample receiver statistics
const receiverLeadersData = [
    { rank: 1, name: "Ja'Marr Chase", team: "CIN", games: 12, receptions: 93, targets: 127, yards: 1319, avg: 14.2, tds: 15, long: 70, ypg: 109.9 },
    { rank: 2, name: "Amon-Ra St. Brown", team: "DET", games: 12, receptions: 84, targets: 110, yards: 945, avg: 11.3, tds: 11, long: 45, ypg: 78.8 },
    { rank: 3, name: "Justin Jefferson", team: "MIN", games: 12, receptions: 79, targets: 112, yards: 1079, avg: 13.7, tds: 8, long: 68, ypg: 89.9 },
    { rank: 4, name: "CeeDee Lamb", team: "DAL", games: 12, receptions: 82, targets: 119, yards: 1005, avg: 12.3, tds: 6, long: 55, ypg: 83.8 },
    { rank: 5, name: "Zay Flowers", team: "BAL", games: 13, receptions: 60, targets: 90, yards: 1047, avg: 17.5, tds: 4, long: 62, ypg: 80.5 },
    { rank: 6, name: "Terry McLaurin", team: "WAS", games: 13, receptions: 68, targets: 105, yards: 982, avg: 14.4, tds: 10, long: 61, ypg: 75.5 },
    { rank: 7, name: "Mike Evans", team: "TB", games: 11, receptions: 57, targets: 96, yards: 850, avg: 14.9, tds: 8, long: 57, ypg: 77.3 },
    { rank: 8, name: "A.J. Brown", team: "PHI", games: 11, receptions: 56, targets: 88, yards: 830, avg: 14.8, tds: 7, long: 67, ypg: 75.5 },
    { rank: 9, name: "George Pickens", team: "PIT", games: 12, receptions: 55, targets: 91, yards: 900, avg: 16.4, tds: 3, long: 74, ypg: 75.0 },
    { rank: 10, name: "Tyreek Hill", team: "MIA", games: 12, receptions: 60, targets: 98, yards: 879, avg: 14.7, tds: 6, long: 80, ypg: 73.3 }
];

// Sample rushing statistics
const rushingLeadersData = [
    { rank: 1, name: "Saquon Barkley", team: "PHI", games: 12, attempts: 255, yards: 1499, avg: 5.9, tds: 11, long: 72, ypg: 124.9, fumbles: 2 },
    { rank: 2, name: "Derrick Henry", team: "BAL", games: 13, attempts: 243, yards: 1407, avg: 5.8, tds: 13, long: 87, ypg: 108.2, fumbles: 1 },
    { rank: 3, name: "Josh Jacobs", team: "GB", games: 12, attempts: 228, yards: 1024, avg: 4.5, tds: 11, long: 58, ypg: 85.3, fumbles: 0 },
    { rank: 4, name: "Jahmyr Gibbs", team: "DET", games: 12, attempts: 176, yards: 1019, avg: 5.8, tds: 11, long: 70, ypg: 84.9, fumbles: 2 },
    { rank: 5, name: "De'Von Achane", team: "MIA", games: 11, attempts: 144, yards: 701, avg: 4.9, tds: 6, long: 50, ypg: 63.7, fumbles: 1 },
    { rank: 6, name: "James Cook", team: "BUF", games: 12, attempts: 165, yards: 757, avg: 4.6, tds: 12, long: 44, ypg: 63.1, fumbles: 0 },
    { rank: 7, name: "Jordan Mason", team: "SF", games: 11, attempts: 161, yards: 789, avg: 4.9, tds: 3, long: 38, ypg: 71.7, fumbles: 1 },
    { rank: 8, name: "Kyren Williams", team: "LAR", games: 11, attempts: 167, yards: 665, avg: 4.0, tds: 11, long: 26, ypg: 60.5, fumbles: 3 },
    { rank: 9, name: "Kenneth Walker III", team: "SEA", games: 11, attempts: 153, yards: 644, avg: 4.2, tds: 8, long: 26, ypg: 58.5, fumbles: 2 },
    { rank: 10, name: "Bijan Robinson", team: "ATL", games: 12, attempts: 172, yards: 840, avg: 4.9, tds: 6, long: 37, ypg: 70.0, fumbles: 1 }
];

// ==========================================
// Table Population Functions
// ==========================================

/**
 * Populate the schedule table with game data
 * Now uses live API data and fetches remaining weeks of the season.
 * During the off-season, shows all available weeks for the selected schedule season.
 */
async function populateScheduleTable() {
    const table = document.getElementById('schedule-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="10" class="loading">Loading schedule data...</td></tr>';

    // Determine if we are in the off-season (Feb–Aug)
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const isOffSeason = currentMonth >= 1 && currentMonth <= 7; // Feb–Aug

    try {
        const allGames = [];
        // Use the dynamically calculated current week from API_CONFIG (defined in api.js)
        const currentWeek = typeof API_CONFIG !== 'undefined' ? API_CONFIG.currentWeek : 1;
        const currentScheduleSeason = typeof API_CONFIG !== 'undefined'
            ? (API_CONFIG.currentScheduleSeason || API_CONFIG.currentSeason)
            : now.getFullYear();
        const finalWeek = 18; // Regular season ends at week 18
        const currentSeasonLabel = `${currentScheduleSeason}-${String(currentScheduleSeason + 1).slice(-2)}`;
        
        // During the off-season, load the full released schedule (all weeks 1–18)
        const startWeek = isOffSeason ? 1 : currentWeek;
        
        console.log(`Loading schedule from Week ${startWeek} to Week ${finalWeek}`);
        
        // Fetch remaining (or all, in off-season) weeks of the season
        for (let week = startWeek; week <= finalWeek; week++) {
            try {
                const weekGames = await NFLAPI.getSchedule(week, currentScheduleSeason);
                if (weekGames && weekGames.length > 0) {
                    // Add week header information to each game
                    weekGames.forEach(game => {
                        game.week = week;
                    });
                    allGames.push(...weekGames);
                }
            } catch (error) {
                console.warn(`Could not load week ${week}:`, error.message);
            }
        }
        
        if (allGames.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No schedule data is currently available for this season. Please check back soon.</td></tr>';
            return;
        }

        const subtitle = document.getElementById('schedule-subtitle');
        const teamFilter = document.getElementById('schedule-team-filter');

        // Populate team filter options
        if (teamFilter) {
            const teams = new Set();
            allGames.forEach(game => {
                teams.add(game.awayTeam);
                teams.add(game.homeTeam);
            });

            const selectedTeam = teamFilter.value;
            teamFilter.innerHTML = '<option value="">All Teams</option>';
            Array.from(teams).sort().forEach(team => {
                const option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                teamFilter.appendChild(option);
            });
            teamFilter.value = selectedTeam;
        }

        const updateScheduleSubtitle = (visibleGamesCount, selectedTeam = '') => {
            if (!subtitle) return;

            let baseText = '';
            if (isOffSeason) {
                baseText = `${currentSeasonLabel} NFL Season — Schedule Released. Showing ${visibleGamesCount} currently available games from Weeks 1-18.`;
            } else if (currentWeek === finalWeek) {
                baseText = `Showing Week ${currentWeek} (Final week of regular season)`;
            } else {
                baseText = `Showing Weeks ${currentWeek}-${finalWeek} (Remaining games of the ${currentScheduleSeason} NFL regular season)`;
            }

            subtitle.textContent = selectedTeam
                ? `${baseText} Filtered to ${selectedTeam} (${visibleGamesCount} games).`
                : baseText;
        };

        const renderScheduleRows = (games) => {
            tbody.innerHTML = '';

            if (!games || games.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="loading">No games found for the selected team.</td></tr>';
                return;
            }

            let lastWeek = null;
            games.forEach(game => {
                // Add week separator row
                if (game.week !== lastWeek) {
                    const weekRow = tbody.insertRow();
                    weekRow.className = 'week-separator';
                    weekRow.innerHTML = `<td colspan="7" style="background-color: var(--primary-color); color: white; font-weight: bold; padding: 0.75rem; text-align: center;">Week ${escapeHtml(game.week)}</td>`;
                    lastWeek = game.week;
                }

                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${escapeHtml(formatDate(game.date))}</td>
                    <td>${escapeHtml(game.time)}</td>
                    <td>${escapeHtml(game.awayTeam)}</td>
                    <td>${escapeHtml(game.awayRecord)}</td>
                    <td>${escapeHtml(game.homeTeam)}</td>
                    <td>${escapeHtml(game.homeRecord)}</td>
                    <td>${escapeHtml(game.venue)}</td>
                `;
            });
        };

        const applyScheduleFilter = () => {
            const selectedTeam = teamFilter ? teamFilter.value : '';
            const filteredGames = selectedTeam
                ? allGames.filter(game => game.awayTeam === selectedTeam || game.homeTeam === selectedTeam)
                : allGames;

            renderScheduleRows(filteredGames);
            updateScheduleSubtitle(filteredGames.length, selectedTeam);
        };

        if (teamFilter) {
            teamFilter.onchange = applyScheduleFilter;
        }

        applyScheduleFilter();

        console.log(`Loaded ${allGames.length} games from weeks ${startWeek}-${finalWeek}`);
    } catch (error) {
        console.error('Error loading schedule:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="loading" style="color: #D50A0A;">Error loading schedule. Please refresh the page to try again.</td></tr>';
    }
}

/**
 * Populate the team statistics table
 * Now uses live API data instead of placeholder data
 */
async function populateTeamStatsTable() {
    const table = document.getElementById('team-stats-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="9" class="loading">Loading team statistics...</td></tr>';

    try {
        // Fetch team stats from API
        const teamStatsData = await NFLAPI.getTeamStats();
        
        if (!teamStatsData || teamStatsData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="loading">No team data available.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        
        teamStatsData.forEach(team => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${escapeHtml(team.rank)}</td>
                <td>${escapeHtml(team.team)}</td>
                <td>${escapeHtml(team.wins)}</td>
                <td>${escapeHtml(team.losses)}</td>
                <td>${escapeHtml(team.ties)}</td>
                <td>${escapeHtml(team.winPct)}</td>
                <td>${escapeHtml(team.pointsScored)}</td>
                <td>${escapeHtml(team.pointsAllowed)}</td>
                <td>${escapeHtml(`${team.differential > 0 ? '+' : ''}${team.differential}`)}</td>
            `;
        });
    } catch (error) {
        console.error('Error loading team stats:', error);
        tbody.innerHTML = '<tr><td colspan="9" class="loading" style="color: #D50A0A;">Error loading team statistics. Please refresh the page to try again.</td></tr>';
    }
}

/**
 * Populate the quarterback leaders table
 * Now uses live API data instead of placeholder data
 */
async function populateQBLeadersTable() {
    const table = document.getElementById('qb-leaders-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="11" class="loading">Loading quarterback statistics...</td></tr>';

    try {
        // Fetch QB stats from API
        const qbLeadersData = await NFLAPI.getQBStats();
        
        if (!qbLeadersData || qbLeadersData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="loading">No quarterback data available.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        
        qbLeadersData.forEach(qb => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${escapeHtml(qb.rank)}</td>
                <td>${escapeHtml(qb.name)}</td>
                <td>${escapeHtml(qb.team)}</td>
                <td>${escapeHtml(qb.games)}</td>
                <td>${escapeHtml(qb.completions)}</td>
                <td>${escapeHtml(qb.attempts)}</td>
                <td>${escapeHtml(qb.compPct)}</td>
                <td>${escapeHtml(qb.yards)}</td>
                <td>${escapeHtml(qb.tds)}</td>
                <td>${escapeHtml(qb.ints)}</td>
                <td>${escapeHtml(qb.rating)}</td>
            `;
        });
    } catch (error) {
        console.error('Error loading QB stats:', error);
        tbody.innerHTML = '<tr><td colspan="11" class="loading" style="color: #D50A0A;">Error loading quarterback statistics. Please refresh the page to try again.</td></tr>';
    }
}

/**
 * Populate the receiver leaders table
 * Now uses live API data instead of placeholder data
 */
async function populateReceiverLeadersTable() {
    const table = document.getElementById('receiver-leaders-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="11" class="loading">Loading receiver statistics...</td></tr>';

    try {
        // Fetch receiver stats from API
        const receiverLeadersData = await NFLAPI.getReceiverStats();
        
        if (!receiverLeadersData || receiverLeadersData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="loading">No receiver data available.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        
        receiverLeadersData.forEach(receiver => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${escapeHtml(receiver.rank)}</td>
                <td>${escapeHtml(receiver.name)}</td>
                <td>${escapeHtml(receiver.team)}</td>
                <td>${escapeHtml(receiver.games)}</td>
                <td>${escapeHtml(receiver.receptions)}</td>
                <td>${escapeHtml(receiver.targets)}</td>
                <td>${escapeHtml(receiver.yards)}</td>
                <td>${escapeHtml(receiver.avg)}</td>
                <td>${escapeHtml(receiver.tds)}</td>
                <td>${escapeHtml(receiver.long)}</td>
                <td>${escapeHtml(receiver.ypg)}</td>
            `;
        });
    } catch (error) {
        console.error('Error loading receiver stats:', error);
        tbody.innerHTML = '<tr><td colspan="11" class="loading" style="color: #D50A0A;">Error loading receiver statistics. Please refresh the page to try again.</td></tr>';
    }
}

/**
 * Populate the rushing leaders table
 * Now uses live API data instead of placeholder data
 */
async function populateRushingLeadersTable() {
    const table = document.getElementById('rushing-leaders-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="11" class="loading">Loading rushing statistics...</td></tr>';

    try {
        // Fetch rushing stats from API
        const rushingLeadersData = await NFLAPI.getRushingStats();
        
        if (!rushingLeadersData || rushingLeadersData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="loading">No rushing data available.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        
        rushingLeadersData.forEach(rusher => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${escapeHtml(rusher.rank)}</td>
                <td>${escapeHtml(rusher.name)}</td>
                <td>${escapeHtml(rusher.team)}</td>
                <td>${escapeHtml(rusher.games)}</td>
                <td>${escapeHtml(rusher.attempts)}</td>
                <td>${escapeHtml(rusher.yards)}</td>
                <td>${escapeHtml(rusher.avg)}</td>
                <td>${escapeHtml(rusher.tds)}</td>
                <td>${escapeHtml(rusher.long)}</td>
                <td>${escapeHtml(rusher.ypg)}</td>
                <td>${escapeHtml(rusher.fumbles)}</td>
            `;
        });
    } catch (error) {
        console.error('Error loading rushing stats:', error);
        tbody.innerHTML = '<tr><td colspan="11" class="loading" style="color: #D50A0A;">Error loading rushing statistics. Please refresh the page to try again.</td></tr>';
    }
}

// ==========================================
// Utility Functions
// ==========================================

/**
 * Format date string to more readable format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Escape HTML special characters to prevent script injection when rendering dynamic content.
 * @param {*} value
 * @returns {string}
 */
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ==========================================
// Initialization
// ==========================================

/**
 * Initialize the dashboard based on current page
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize common features on all pages
    initializeMobileNavigation();
    initializeScrollToTop();
    initializeKeyboardNavigation();
    
    // Determine which page we're on and populate accordingly
    if (document.getElementById('schedule-table')) {
        await populateScheduleTable();
        makeTableSortable('schedule-table');
    }
    
    if (document.getElementById('team-stats-table')) {
        await populateTeamStatsTable();
        makeTableSortable('team-stats-table');
    }
    
    if (document.getElementById('qb-leaders-table')) {
        await populateQBLeadersTable();
        makeTableSortable('qb-leaders-table');
        // Initialize search and filter for QB leaders
        initializeSearch('qb-search', 'qb-leaders-table', 1);
        initializeTeamFilter('qb-team-filter', 'qb-leaders-table', 2);
    }
    
    if (document.getElementById('receiver-leaders-table')) {
        await populateReceiverLeadersTable();
        makeTableSortable('receiver-leaders-table');
        // Initialize search and filter for receivers
        initializeSearch('receiver-search', 'receiver-leaders-table', 1);
        initializeTeamFilter('receiver-team-filter', 'receiver-leaders-table', 2);
    }
    
    if (document.getElementById('rushing-leaders-table')) {
        await populateRushingLeadersTable();
        makeTableSortable('rushing-leaders-table');
        // Initialize search and filter for rushers
        initializeSearch('rushing-search', 'rushing-leaders-table', 1);
        initializeTeamFilter('rushing-team-filter', 'rushing-leaders-table', 2);
    }
    
    // Check if we're on the defensive leaders page
    if (document.getElementById('tackles-leaders-table')) {
        initializeStatTabs();
        await populateDefensiveLeadersTables();
        // Make all defensive tables sortable
        makeTableSortable('tackles-leaders-table');
        makeTableSortable('sacks-leaders-table');
        makeTableSortable('interceptions-leaders-table');
        // Initialize search and filters for each category
        initializeSearch('tackles-search', 'tackles-leaders-table', 1);
        initializeTeamFilter('tackles-team-filter', 'tackles-leaders-table', 2);
        initializeSearch('sacks-search', 'sacks-leaders-table', 1);
        initializeTeamFilter('sacks-team-filter', 'sacks-leaders-table', 2);
        initializeSearch('interceptions-search', 'interceptions-leaders-table', 1);
        initializeTeamFilter('interceptions-team-filter', 'interceptions-leaders-table', 2);
    }
    
    // Check if we're on the special teams page
    if (document.getElementById('kickers-leaders-table')) {
        initializeStatTabs();
        await populateSpecialTeamsTables();
        // Make all special teams tables sortable
        makeTableSortable('kickers-leaders-table');
        makeTableSortable('punters-leaders-table');
        makeTableSortable('returners-leaders-table');
        // Initialize search and filters
        initializeSearch('kickers-search', 'kickers-leaders-table', 1);
        initializeTeamFilter('kickers-team-filter', 'kickers-leaders-table', 2);
        initializeSearch('punters-search', 'punters-leaders-table', 1);
        initializeTeamFilter('punters-team-filter', 'punters-leaders-table', 2);
        initializeSearch('returners-search', 'returners-leaders-table', 1);
        initializeTeamFilter('returners-team-filter', 'returners-leaders-table', 2);
    }
    
    // Check if we're on the league leaders page
    if (document.getElementById('passing-yards-leaders')) {
        await populateLeagueLeaders();
    }
    
    // Check if we're on the playoff picture page
    if (document.querySelector('.playoff-conferences')) {
        await populatePlayoffPicture();
    }
    
    // Check if we're on the standings page
    if (document.getElementById('afc-east-table')) {
        await populateStandingsTables();
        // Make all division tables sortable
        ['afc-east', 'afc-north', 'afc-south', 'afc-west',
         'nfc-east', 'nfc-north', 'nfc-south', 'nfc-west'].forEach(divId => {
            makeTableSortable(`${divId}-table`);
        });
    }

    // Check if we're on the predictions page
    if (document.getElementById('predictions-table')) {
        await populatePredictionsTable();
        makeTableSortable('predictions-table');
        makeTableSortable('predicted-records-table');
    }
});

/**
 * Initialize collapsible mobile navigation menu
 */
function initializeMobileNavigation() {
    const header = document.querySelector('header');
    const nav = document.querySelector('header nav');
    if (!header || !nav) return;

    const navId = nav.id || 'primary-nav';
    nav.id = navId;

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'mobile-nav-toggle';
    toggleButton.setAttribute('aria-controls', navId);
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.textContent = '☰ Menu';

    const headerContainer = header.querySelector('.container') || header;
    const title = headerContainer.querySelector('h1');
    if (title) {
        title.insertAdjacentElement('afterend', toggleButton);
    } else {
        headerContainer.prepend(toggleButton);
    }

    const closeMenu = () => {
        header.classList.remove('mobile-nav-open');
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.textContent = '☰ Menu';
        document.querySelectorAll('.dropdown.active').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    };

    const openMenu = () => {
        header.classList.add('mobile-nav-open');
        toggleButton.setAttribute('aria-expanded', 'true');
        toggleButton.textContent = '✕ Close';
    };

    const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;

    toggleButton.addEventListener('click', () => {
        if (!isMobileViewport()) return;

        if (header.classList.contains('mobile-nav-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    nav.addEventListener('click', (event) => {
        const clickedLink = event.target.closest('a');
        if (!clickedLink || !isMobileViewport()) return;

        const isDropdownToggle = clickedLink.classList.contains('dropbtn');
        if (isDropdownToggle) {
            event.preventDefault();
            const dropdown = clickedLink.closest('.dropdown');
            if (dropdown) {
                dropdown.classList.toggle('active');
            }
            return;
        }

        closeMenu();
    });

    document.addEventListener('click', (event) => {
        if (!isMobileViewport()) return;

        if (!header.contains(event.target)) {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (!isMobileViewport()) {
            closeMenu();
            document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}

/**
 * Format a projected team record.
 * @param {Object} record
 * @returns {string}
 */
function formatProjectedRecord(record) {
    return `${record.wins}-${record.losses}${record.ties ? `-${record.ties}` : ''}`;
}

/**
 * Format a projected win percentage.
 * @param {number} winPct
 * @returns {string}
 */
function formatProjectedWinPct(winPct) {
    return winPct.toFixed(3).replace(/^0(?=\.)/, '');
}

/**
 * Compare projected teams by record.
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
function compareProjectedTeams(a, b) {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (a.losses !== b.losses) return a.losses - b.losses;
    if (a.ties !== b.ties) return a.ties - b.ties;
    return a.team.localeCompare(b.team);
}

/**
 * Load team conference/division metadata for projections.
 * @returns {Promise<Object|null>}
 */
async function fetchPredictionStandingsBase() {
    const fallbackFiles = ['data/standings.json', 'data/archive/2025/standings.json'];

    for (const file of fallbackFiles) {
        try {
            const response = await fetch(file);
            if (!response.ok) continue;
            return await response.json();
        } catch (error) {
            console.warn(`Could not load prediction standings metadata from ${file}:`, error.message);
        }
    }

    return null;
}

/**
 * Build team metadata keyed by team name.
 * @param {Object|null} standingsData
 * @param {string[]} fallbackTeams
 * @returns {Object}
 */
function buildPredictionTeamMetadata(standingsData, fallbackTeams = []) {
    const metadata = {};

    if (standingsData && typeof standingsData === 'object') {
        Object.entries(standingsData).forEach(([divisionKey, teams]) => {
            if (!Array.isArray(teams)) return;

            const [conferenceKey, divisionKeyName] = divisionKey.split('-');
            const conference = conferenceKey ? conferenceKey.toUpperCase() : '—';
            const division = divisionKeyName
                ? `${divisionKeyName.charAt(0).toUpperCase()}${divisionKeyName.slice(1)}`
                : '—';

            teams.forEach(team => {
                metadata[team.team] = {
                    conference,
                    division
                };
            });
        });
    }

    fallbackTeams.forEach(team => {
        if (!metadata[team]) {
            metadata[team] = {
                conference: '—',
                division: '—'
            };
        }
    });

    return metadata;
}

/**
 * Build projected conference/division groupings.
 * @param {Object[]} projectedRecords
 * @returns {Object}
 */
function buildProjectedConferenceData(projectedRecords) {
    const conferenceData = {
        afc: { East: [], North: [], South: [], West: [] },
        nfc: { East: [], North: [], South: [], West: [] }
    };

    projectedRecords.forEach(team => {
        const conferenceKey = team.conference.toLowerCase();
        if (!conferenceData[conferenceKey] || !conferenceData[conferenceKey][team.division]) {
            return;
        }

        conferenceData[conferenceKey][team.division].push(team);
    });

    Object.values(conferenceData).forEach(divisions => {
        Object.values(divisions).forEach(teams => {
            teams.sort(compareProjectedTeams);
        });
    });

    return conferenceData;
}

/**
 * Simulate a conference playoff bracket using projected seeds.
 * @param {Object[]} seeds
 * @param {Function} predictGame
 * @returns {Object|null}
 */
function simulateConferenceChampion(seeds, predictGame) {
    if (!Array.isArray(seeds) || seeds.length < 7) return null;

    const seededTeams = seeds.map((team, index) => ({
        ...team,
        seed: index + 1
    }));

    const pickWinner = (awayTeam, homeTeam) => {
        const { predictedWinner } = predictGame(awayTeam.team, homeTeam.team, {
            awaySeed: awayTeam.seed,
            homeSeed: homeTeam.seed
        });

        return predictedWinner === homeTeam.team ? homeTeam : awayTeam;
    };

    const wildCardWinners = [
        pickWinner(seededTeams[6], seededTeams[1]),
        pickWinner(seededTeams[5], seededTeams[2]),
        pickWinner(seededTeams[4], seededTeams[3])
    ];

    const divisionalTeams = [seededTeams[0], ...wildCardWinners].sort((a, b) => a.seed - b.seed);
    const lowestRemainingSeed = divisionalTeams[divisionalTeams.length - 1];
    const divisionalWinnerOne = pickWinner(lowestRemainingSeed, divisionalTeams[0]);

    const secondaryDivisionalMatchup = divisionalTeams.slice(1, -1).sort((a, b) => a.seed - b.seed);
    const divisionalWinnerTwo = pickWinner(
        secondaryDivisionalMatchup[1],
        secondaryDivisionalMatchup[0]
    );

    const conferenceChampionshipTeams = [divisionalWinnerOne, divisionalWinnerTwo]
        .sort((a, b) => a.seed - b.seed);

    return pickWinner(
        conferenceChampionshipTeams[1],
        conferenceChampionshipTeams[0]
    );
}

/**
 * Map projected playoff outcomes by team.
 * @param {Object} afcSeeds
 * @param {Object} nfcSeeds
 * @param {Object|null} afcChampion
 * @param {Object|null} nfcChampion
 * @param {Object|null} superBowlChampion
 * @returns {Object}
 */
function buildPlayoffOutlook(afcSeeds, nfcSeeds, afcChampion, nfcChampion, superBowlChampion) {
    const playoffOutlook = {};

    afcSeeds.forEach((team, index) => {
        playoffOutlook[team.team] = {
            label: `#${index + 1} AFC Seed`,
            className: 'prediction-status-playoff'
        };
    });

    nfcSeeds.forEach((team, index) => {
        playoffOutlook[team.team] = {
            label: `#${index + 1} NFC Seed`,
            className: 'prediction-status-playoff'
        };
    });

    if (afcChampion) {
        playoffOutlook[afcChampion.team] = {
            label: 'AFC Champion',
            className: 'prediction-status-conference'
        };
    }

    if (nfcChampion) {
        playoffOutlook[nfcChampion.team] = {
            label: 'NFC Champion',
            className: 'prediction-status-conference'
        };
    }

    if (superBowlChampion) {
        playoffOutlook[superBowlChampion.team] = {
            label: 'Super Bowl Champion',
            className: 'prediction-status-champion'
        };
    }

    return playoffOutlook;
}

/**
 * Render prediction summary cards.
 * @param {HTMLElement|null} container
 * @param {Object|null} superBowlWinner
 * @param {Object|null} superBowlRunnerUp
 * @param {string} superBowlBasis
 * @param {Object|null} afcChampion
 * @param {Object|null} nfcChampion
 */
function renderPredictionSummaryCards(container, superBowlWinner, superBowlRunnerUp, superBowlBasis, afcChampion, nfcChampion) {
    if (!container) return;

    if (!superBowlWinner || !afcChampion || !nfcChampion) {
        container.innerHTML = `
            <div class="prediction-summary-card loading-card">
                <span class="prediction-summary-label">Projection unavailable</span>
                <strong class="prediction-summary-team">Unable to build playoff summary</strong>
                <span class="prediction-summary-detail">Projected seeds need a complete schedule and team metadata.</span>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="prediction-summary-card">
            <span class="prediction-summary-label">Projected Super Bowl Champion</span>
            <strong class="prediction-summary-team">${escapeHtml(superBowlWinner.team)}</strong>
            <span class="prediction-summary-detail">Over ${escapeHtml(superBowlRunnerUp?.team || '')} • ${escapeHtml(superBowlBasis)}</span>
        </div>
        <div class="prediction-summary-card">
            <span class="prediction-summary-label">Projected AFC Champion</span>
            <strong class="prediction-summary-team">${escapeHtml(afcChampion.team)}</strong>
            <span class="prediction-summary-detail">#${escapeHtml(afcChampion.seed)} seed • ${escapeHtml(formatProjectedRecord(afcChampion))}</span>
        </div>
        <div class="prediction-summary-card">
            <span class="prediction-summary-label">Projected NFC Champion</span>
            <strong class="prediction-summary-team">${escapeHtml(nfcChampion.team)}</strong>
            <span class="prediction-summary-detail">#${escapeHtml(nfcChampion.seed)} seed • ${escapeHtml(formatProjectedRecord(nfcChampion))}</span>
        </div>
    `;
}

/**
 * Render a projected conference playoff field.
 * @param {HTMLElement|null} container
 * @param {Object[]} seeds
 * @param {string|null} championName
 */
function renderProjectedPlayoffSeeds(container, seeds, championName) {
    if (!container) return;

    if (!Array.isArray(seeds) || seeds.length === 0) {
        container.innerHTML = '<p class="loading">Projected playoff field unavailable.</p>';
        return;
    }

    container.innerHTML = seeds.map((team, index) => `
        <div class="playoff-seed seed-${index + 1}">
            <div class="seed-number">
                <span class="seed-rank">${index + 1}</span>
                ${index === 0 ? '<span class="bye-indicator" title="First Round Bye">⚡</span>' : ''}
            </div>
            <div class="seed-team">
                <span class="team-name">${escapeHtml(team.team)}</span>
                <span class="team-record">${escapeHtml(formatProjectedRecord(team))} • ${escapeHtml(team.division)}</span>
                <span class="team-division">
                    ${team.team === championName ? '<span class="prediction-playoff-note">Projected conference champion</span>' : (team.isDivisionWinner ? `★ ${escapeHtml(team.division)} Champion` : 'Wild Card')}
                </span>
            </div>
        </div>
    `).join('');
}

/**
 * Render projected final records table.
 * @param {HTMLTableSectionElement|null} tbody
 * @param {Object[]} projectedRecords
 * @param {Object} playoffOutlook
 */
function renderProjectedRecordsTable(tbody, projectedRecords, playoffOutlook) {
    if (!tbody) return;

    if (!Array.isArray(projectedRecords) || projectedRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Projected final records unavailable.</td></tr>';
        return;
    }

    tbody.innerHTML = projectedRecords.map(team => {
        const playoffStatus = playoffOutlook[team.team] || {
            label: 'Missed Playoffs',
            className: 'prediction-status-miss'
        };

        return `
            <tr>
                <td>${escapeHtml(team.team)}</td>
                <td>${escapeHtml(team.conference)}</td>
                <td>${escapeHtml(team.division)}</td>
                <td>${escapeHtml(formatProjectedRecord(team))}</td>
                <td>${escapeHtml(formatProjectedWinPct(team.winPct))}</td>
                <td><span class="prediction-status ${escapeHtml(playoffStatus.className)}">${escapeHtml(playoffStatus.label)}</span></td>
            </tr>
        `;
    }).join('');
}

/**
 * Format prediction probability.
 * @param {number|null|undefined} probability
 * @returns {string}
 */
function formatPredictionProbability(probability) {
    if (typeof probability !== 'number' || Number.isNaN(probability)) return '—';
    const bounded = Math.max(0, Math.min(1, probability));
    return `${Math.round(bounded * 100)}%`;
}

/**
 * Build advanced team metrics map and apply opponent-adjusted DVOA-like proxy.
 * @param {Object[]} advancedMetrics
 * @param {Object[]} historicalResults
 * @param {Object} teamRecords
 * @returns {Object}
 */
function buildAdvancedMetricsMap(advancedMetrics, historicalResults, teamRecords) {
    if (!Array.isArray(advancedMetrics) || advancedMetrics.length === 0) return {};

    const metricsMap = {};
    advancedMetrics.forEach(teamMetric => {
        if (teamMetric?.team) {
            metricsMap[teamMetric.team] = { ...teamMetric };
        }
    });

    const opponentStrengthByTeam = {};
    const teamGameCounts = {};

    if (Array.isArray(historicalResults) && historicalResults.length > 0) {
        historicalResults.forEach(game => {
            const awayTeam = game.awayTeam;
            const homeTeam = game.homeTeam;
            const awayOpponentWinPct = teamRecords[homeTeam]?.winPct ?? 0.5;
            const homeOpponentWinPct = teamRecords[awayTeam]?.winPct ?? 0.5;

            opponentStrengthByTeam[awayTeam] = (opponentStrengthByTeam[awayTeam] || 0) + awayOpponentWinPct;
            opponentStrengthByTeam[homeTeam] = (opponentStrengthByTeam[homeTeam] || 0) + homeOpponentWinPct;
            teamGameCounts[awayTeam] = (teamGameCounts[awayTeam] || 0) + 1;
            teamGameCounts[homeTeam] = (teamGameCounts[homeTeam] || 0) + 1;
        });
    }

    const strengthValues = Object.keys(metricsMap).map(teamName => {
        const games = teamGameCounts[teamName] || 0;
        return games > 0 ? (opponentStrengthByTeam[teamName] || 0) / games : 0.5;
    });
    const minStrength = strengthValues.length ? Math.min(...strengthValues) : 0.5;
    const maxStrength = strengthValues.length ? Math.max(...strengthValues) : 0.5;

    Object.entries(metricsMap).forEach(([teamName, teamMetric]) => {
        const games = teamGameCounts[teamName] || 0;
        const opponentStrength = games > 0 ? (opponentStrengthByTeam[teamName] || 0) / games : 0.5;
        const strengthNormalized = maxStrength === minStrength
            ? 0.5
            : (opponentStrength - minStrength) / (maxStrength - minStrength);

        const baseComposite = typeof teamMetric.compositeRating === 'number'
            ? teamMetric.compositeRating
            : (
                (teamMetric.normalized?.offenseScore || 0.5) * 0.34 +
                (teamMetric.normalized?.defenseScore || 0.5) * 0.31 +
                (teamMetric.normalized?.situationalScore || 0.5) * 0.20 +
                (teamMetric.normalized?.dvoaLikeProxy || 0.5) * 0.15
            );

        const dvoaLikeAdjusted = Math.max(0, Math.min(1, baseComposite + ((strengthNormalized - 0.5) * 0.2)));

        metricsMap[teamName] = {
            ...teamMetric,
            opponentContext: {
                opponentWinPctAverage: Number(opponentStrength.toFixed(4)),
                opponentStrengthScore: Number(strengthNormalized.toFixed(4))
            },
            dvoaLikeAdjusted: Number(dvoaLikeAdjusted.toFixed(4))
        };
    });

    return metricsMap;
}

/**
 * Determine key model drivers between two teams.
 * @param {Object} awayMetric
 * @param {Object} homeMetric
 * @returns {string[]}
 */
function getPredictionKeyDrivers(awayMetric, homeMetric) {
    const metrics = [
        { label: 'Offense', away: awayMetric?.normalized?.offenseScore ?? 0.5, home: homeMetric?.normalized?.offenseScore ?? 0.5 },
        { label: 'Defense', away: awayMetric?.normalized?.defenseScore ?? 0.5, home: homeMetric?.normalized?.defenseScore ?? 0.5 },
        { label: 'Situational', away: awayMetric?.normalized?.situationalScore ?? 0.5, home: homeMetric?.normalized?.situationalScore ?? 0.5 },
        { label: 'DVOA-like', away: awayMetric?.dvoaLikeAdjusted ?? awayMetric?.normalized?.dvoaLikeProxy ?? 0.5, home: homeMetric?.dvoaLikeAdjusted ?? homeMetric?.normalized?.dvoaLikeProxy ?? 0.5 }
    ];

    return metrics
        .map(metric => ({
            ...metric,
            diff: Math.abs(metric.home - metric.away),
            leader: metric.home >= metric.away ? 'home' : 'away'
        }))
        .sort((a, b) => b.diff - a.diff)
        .slice(0, 2)
        .map(metric => `${metric.label}: ${metric.leader === 'home' ? 'Home' : 'Away'} edge`);
}

/**
 * Predict a game using advanced metrics.
 * @param {string} awayTeam
 * @param {string} homeTeam
 * @param {Object} metricsMap
 * @param {Object} options
 * @returns {{ predictedWinner: string, basis: string, winProbability: number, keyDrivers: string[] }|null}
 */
function predictWithAdvancedModel(awayTeam, homeTeam, metricsMap, options = {}) {
    const awayMetric = metricsMap[awayTeam];
    const homeMetric = metricsMap[homeTeam];
    if (!awayMetric || !homeMetric) return null;

    const awayRating = awayMetric.dvoaLikeAdjusted ?? awayMetric.compositeRating;
    const homeRating = homeMetric.dvoaLikeAdjusted ?? homeMetric.compositeRating;
    if (typeof awayRating !== 'number' || typeof homeRating !== 'number') return null;

    const homeFieldBoost = options.neutralSite ? 0 : 0.045;
    const ratingDiff = (homeRating + homeFieldBoost) - awayRating;
    const homeWinProbability = 1 / (1 + Math.exp(-ratingDiff * 6));
    const predictedWinner = homeWinProbability >= 0.5 ? homeTeam : awayTeam;
    const winProbability = predictedWinner === homeTeam ? homeWinProbability : 1 - homeWinProbability;

    return {
        predictedWinner,
        basis: 'Advanced efficiency model',
        winProbability,
        keyDrivers: getPredictionKeyDrivers(awayMetric, homeMetric)
    };
}

/**
 * Compare advanced and legacy models on historical results for model selection.
 * @param {Object[]} historicalResults
 * @param {Function} legacyPredictor
 * @param {Function} advancedPredictor
 * @returns {{legacyAccuracy: number, advancedAccuracy: number, advancedCoverage: number, games: number}|null}
 */
function backtestPredictionModels(historicalResults, legacyPredictor, advancedPredictor) {
    if (!Array.isArray(historicalResults) || historicalResults.length === 0) return null;

    let legacyCorrect = 0;
    let advancedCorrect = 0;
    let advancedCoverage = 0;

    historicalResults.forEach(game => {
        const legacy = legacyPredictor(game.awayTeam, game.homeTeam, { skipHeadToHead: true });
        if (legacy?.predictedWinner === game.winner) {
            legacyCorrect += 1;
        }

        const advanced = advancedPredictor(game.awayTeam, game.homeTeam, { neutralSite: false });
        if (advanced) {
            advancedCoverage += 1;
            if (advanced.predictedWinner === game.winner) {
                advancedCorrect += 1;
            }
        }
    });

    const games = historicalResults.length;
    return {
        legacyAccuracy: games > 0 ? legacyCorrect / games : 0,
        advancedAccuracy: advancedCoverage > 0 ? advancedCorrect / advancedCoverage : 0,
        advancedCoverage,
        games
    };
}

/**
 * Populate the predictions table using advanced metrics with legacy fallback.
 */
async function populatePredictionsTable() {
    const table = document.getElementById('predictions-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const projectedRecordsBody = document.querySelector('#predicted-records-table tbody');
    const summaryCards = document.getElementById('predictions-summary-grid');
    const afcPlayoffSeeds = document.getElementById('projected-afc-seeds');
    const nfcPlayoffSeeds = document.getElementById('projected-nfc-seeds');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading predictions...</td></tr>';

    const now = new Date();
    const currentScheduleSeason = typeof API_CONFIG !== 'undefined'
        ? (API_CONFIG.currentScheduleSeason || API_CONFIG.currentSeason)
        : now.getFullYear();
    const historicalSeason = currentScheduleSeason - 1;

    try {
        // Fetch historical results and team records in parallel
        const [historicalResults, teamRecords, standingsData, advancedMetrics] = await Promise.all([
            NFLAPI.getHistoricalResults(historicalSeason),
            NFLAPI.getTeamRecords(historicalSeason),
            fetchPredictionStandingsBase(),
            NFLAPI.getAdvancedTeamMetrics(historicalSeason)
        ]);

        const advancedMetricsMap = buildAdvancedMetricsMap(advancedMetrics, historicalResults, teamRecords);

        // Load all schedule weeks for the upcoming season
        const allGames = [];
        for (let week = 1; week <= 18; week++) {
            try {
                const weekGames = await NFLAPI.getSchedule(week, currentScheduleSeason);
                if (weekGames && weekGames.length > 0) {
                    weekGames.forEach(game => { game.week = week; });
                    allGames.push(...weekGames);
                }
            } catch (error) {
                console.warn(`Could not load schedule week ${week}:`, error.message);
            }
        }

        if (allGames.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">No schedule data available for this season.</td></tr>';
            renderPredictionSummaryCards(summaryCards, null, null, '', null, null);
            renderProjectedRecordsTable(projectedRecordsBody, [], {});
            renderProjectedPlayoffSeeds(afcPlayoffSeeds, [], null);
            renderProjectedPlayoffSeeds(nfcPlayoffSeeds, [], null);
            return;
        }

        const allTeams = new Set(Object.keys(teamRecords));

        // Populate the team filter dropdown
        const teamFilter = document.getElementById('predictions-team-filter');
        if (teamFilter) {
            allGames.forEach(game => {
                allTeams.add(game.awayTeam);
                allTeams.add(game.homeTeam);
            });
            const selectedTeam = teamFilter.value;
            teamFilter.innerHTML = '<option value="">All Teams</option>';
            Array.from(allTeams).sort().forEach(team => {
                const option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                teamFilter.appendChild(option);
            });
            teamFilter.value = selectedTeam;
        }

        /**
         * Predict the winner of a single matchup.
         * @returns {{ predictedWinner: string, basis: string }}
         */
        function predictGameLegacy(awayTeam, homeTeam, options = {}) {
            // Find all head-to-head results between these two teams last season
            const h2h = options.skipHeadToHead
                ? []
                : historicalResults.filter(r =>
                    (r.awayTeam === awayTeam && r.homeTeam === homeTeam) ||
                    (r.awayTeam === homeTeam && r.homeTeam === awayTeam)
                );

            if (h2h.length > 0) {
                const awayWins = h2h.filter(r => r.winner === awayTeam).length;
                const homeWins = h2h.filter(r => r.winner === homeTeam).length;
                if (awayWins !== homeWins) {
                    const favoredAway = awayWins > homeWins;
                    return {
                        predictedWinner: favoredAway ? awayTeam : homeTeam,
                        basis: 'Head-to-head',
                        winProbability: 0.57,
                        keyDrivers: ['Head-to-head edge']
                    };
                }
                // Tied H2H record — fall through to win percentage
            }

            // Compare season win percentages
            const awayRecord = teamRecords[awayTeam];
            const homeRecord = teamRecords[homeTeam];
            const awayPct = awayRecord ? awayRecord.winPct : 0.5;
            const homePct = homeRecord ? homeRecord.winPct : 0.5;

            if (awayPct === homePct && options.neutralSite) {
                const awaySeed = options.awaySeed || Number.MAX_SAFE_INTEGER;
                const homeSeed = options.homeSeed || Number.MAX_SAFE_INTEGER;
                const awayFavored = awaySeed <= homeSeed;

                return {
                    predictedWinner: awayFavored ? awayTeam : homeTeam,
                    basis: h2h.length > 0 ? 'H2H tie → Win % / Seed' : 'Win % / Seed',
                    winProbability: 0.51,
                    keyDrivers: ['Seed tiebreak']
                };
            }

            const denominator = Math.max(awayPct + homePct, 0.0001);
            const homeWinProbability = awayPct === homePct
                ? (options.neutralSite ? 0.5 : 0.54)
                : homePct / denominator;
            const predictedWinner = homePct >= awayPct ? homeTeam : awayTeam;

            return {
                predictedWinner,
                basis: h2h.length > 0 ? 'H2H tie → Win %' : 'Win %',
                winProbability: predictedWinner === homeTeam ? homeWinProbability : 1 - homeWinProbability,
                keyDrivers: ['Season win percentage']
            };
        }

        const advancedPredictor = (awayTeam, homeTeam, options = {}) => (
            predictWithAdvancedModel(awayTeam, homeTeam, advancedMetricsMap, options)
        );

        const backtest = backtestPredictionModels(historicalResults, predictGameLegacy, advancedPredictor);
        const advancedReady = Object.keys(advancedMetricsMap).length > 0;
        const useAdvancedModel = advancedReady &&
            backtest &&
            backtest.advancedCoverage >= Math.max(16, Math.floor(backtest.games * 0.8)) &&
            backtest.advancedAccuracy > backtest.legacyAccuracy;

        function predictGame(awayTeam, homeTeam, options = {}) {
            if (useAdvancedModel) {
                const advancedPrediction = advancedPredictor(awayTeam, homeTeam, options);
                if (advancedPrediction) {
                    return advancedPrediction;
                }
            }
            return predictGameLegacy(awayTeam, homeTeam, options);
        }

        const projectedGames = allGames.map(game => ({
            ...game,
            ...predictGame(game.awayTeam, game.homeTeam)
        }));

        const teamMetadata = buildPredictionTeamMetadata(
            standingsData,
            Array.from(allTeams)
        );

        const projectedRecordMap = {};
        Array.from(allTeams).forEach(team => {
            projectedRecordMap[team] = {
                team,
                wins: 0,
                losses: 0,
                ties: 0,
                conference: teamMetadata[team]?.conference || '—',
                division: teamMetadata[team]?.division || '—'
            };
        });

        projectedGames.forEach(game => {
            if (game.predictedWinner === game.awayTeam) {
                projectedRecordMap[game.awayTeam].wins += 1;
                projectedRecordMap[game.homeTeam].losses += 1;
            } else {
                projectedRecordMap[game.homeTeam].wins += 1;
                projectedRecordMap[game.awayTeam].losses += 1;
            }
        });

        const projectedRecords = Object.values(projectedRecordMap)
            .map(team => ({
                ...team,
                winPct: (team.wins + team.losses + team.ties) > 0
                    ? team.wins / (team.wins + team.losses + team.ties)
                    : 0
            }))
            .sort(compareProjectedTeams);

        const conferenceData = buildProjectedConferenceData(projectedRecords);
        const afcProjection = calculatePlayoffSeeds(conferenceData.afc);
        const nfcProjection = calculatePlayoffSeeds(conferenceData.nfc);

        const afcChampion = simulateConferenceChampion(afcProjection.seeds, predictGame);
        const nfcChampion = simulateConferenceChampion(nfcProjection.seeds, predictGame);

        let superBowlWinner = null;
        let superBowlRunnerUp = null;
        let superBowlBasis = 'Win % / Seed';

        if (afcChampion && nfcChampion) {
            const superBowlPrediction = predictGame(afcChampion.team, nfcChampion.team, {
                neutralSite: true,
                awaySeed: afcChampion.seed,
                homeSeed: nfcChampion.seed
            });

            superBowlWinner = superBowlPrediction.predictedWinner === nfcChampion.team
                ? nfcChampion
                : afcChampion;
            superBowlRunnerUp = superBowlWinner.team === afcChampion.team ? nfcChampion : afcChampion;
            superBowlBasis = superBowlPrediction.basis;
        }

        const playoffOutlook = buildPlayoffOutlook(
            afcProjection.seeds,
            nfcProjection.seeds,
            afcChampion,
            nfcChampion,
            superBowlWinner
        );

        renderPredictionSummaryCards(
            summaryCards,
            superBowlWinner,
            superBowlRunnerUp,
            superBowlBasis,
            afcChampion,
            nfcChampion
        );
        renderProjectedPlayoffSeeds(afcPlayoffSeeds, afcProjection.seeds, afcChampion?.team || null);
        renderProjectedPlayoffSeeds(nfcPlayoffSeeds, nfcProjection.seeds, nfcChampion?.team || null);
        renderProjectedRecordsTable(projectedRecordsBody, projectedRecords, playoffOutlook);

        const renderPredictionRows = (games) => {
            tbody.innerHTML = '';
            if (!games || games.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="loading">No games found for the selected team.</td></tr>';
                return;
            }

            let lastWeek = null;
            games.forEach(game => {
                if (game.week !== lastWeek) {
                    const weekRow = tbody.insertRow();
                    weekRow.className = 'week-separator';
                    weekRow.innerHTML = `<td colspan="8" style="background-color: var(--primary-color); color: white; font-weight: bold; padding: 0.75rem; text-align: center;">Week ${escapeHtml(game.week)}</td>`;
                    lastWeek = game.week;
                }

                const awayWins = game.predictedWinner === game.awayTeam;
                const homeWins = game.predictedWinner === game.homeTeam;

                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${escapeHtml(formatDate(game.date))}</td>
                    <td>${escapeHtml(game.awayTeam)} <span class="prediction-badge ${awayWins ? 'prediction-win' : 'prediction-loss'}">${awayWins ? 'W' : 'L'}</span></td>
                    <td>${escapeHtml(game.homeTeam)} <span class="prediction-badge ${homeWins ? 'prediction-win' : 'prediction-loss'}">${homeWins ? 'W' : 'L'}</span></td>
                    <td>${escapeHtml(game.venue)}</td>
                    <td><strong>${escapeHtml(game.predictedWinner)}</strong></td>
                    <td>${escapeHtml(formatPredictionProbability(game.winProbability))}</td>
                    <td><span class="prediction-basis">${escapeHtml((game.keyDrivers || []).join(' • ') || '—')}</span></td>
                    <td><span class="prediction-basis">${escapeHtml(game.basis)}</span></td>
                `;
            });
        };

        const applyPredictionsFilter = () => {
            const selectedTeam = teamFilter ? teamFilter.value : '';
            const filteredGames = selectedTeam
                ? projectedGames.filter(game => game.awayTeam === selectedTeam || game.homeTeam === selectedTeam)
                : projectedGames;
            renderPredictionRows(filteredGames);
        };

        if (teamFilter) {
            teamFilter.onchange = applyPredictionsFilter;
        }

        const subtitle = document.getElementById('predictions-subtitle');
        if (subtitle) {
            const modelName = useAdvancedModel ? 'Advanced efficiency model' : 'Legacy H2H / Win % model';
            if (backtest) {
                subtitle.textContent = `Predicted outcomes for every ${currentScheduleSeason}-${String(currentScheduleSeason + 1).slice(-2)} regular season game. Active model: ${modelName}. Backtest (${historicalSeason}): advanced ${Math.round(backtest.advancedAccuracy * 100)}% vs legacy ${Math.round(backtest.legacyAccuracy * 100)}%.`;
            } else {
                subtitle.textContent = `Predicted outcomes for every ${currentScheduleSeason}-${String(currentScheduleSeason + 1).slice(-2)} regular season game. Active model: ${modelName}.`;
            }
        }

        applyPredictionsFilter();

        console.log(`Predictions rendered for ${projectedGames.length} games (based on ${historicalSeason} season)`);
    } catch (error) {
        console.error('Error loading predictions:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="loading" style="color: #D50A0A;">Error loading predictions. Please refresh the page to try again.</td></tr>';
        if (projectedRecordsBody) {
            projectedRecordsBody.innerHTML = '<tr><td colspan="6" class="loading" style="color: #D50A0A;">Error loading projected records. Please refresh the page to try again.</td></tr>';
        }
        if (summaryCards) {
            summaryCards.innerHTML = `
                <div class="prediction-summary-card loading-card">
                    <span class="prediction-summary-label">Projection unavailable</span>
                    <strong class="prediction-summary-team">Error loading predictions</strong>
                    <span class="prediction-summary-detail">Please refresh the page to try again.</span>
                </div>
            `;
        }
        if (afcPlayoffSeeds) {
            afcPlayoffSeeds.innerHTML = '<p class="loading" style="color: #D50A0A;">Error loading AFC playoff projection.</p>';
        }
        if (nfcPlayoffSeeds) {
            nfcPlayoffSeeds.innerHTML = '<p class="loading" style="color: #D50A0A;">Error loading NFC playoff projection.</p>';
        }
    }
}

// ==========================================
// Future Enhancement Placeholders
// ==========================================

/**
 * TODO: Implement API data fetching
 * This function will replace hardcoded data with real API calls
 */
function fetchDataFromAPI() {
    // Will be implemented with GitHub Actions automation
    // to fetch real-time NFL data
}

/**
 * TODO: Implement data caching
 * Cache API responses to reduce load times
 */
function cacheData() {
    // Will use localStorage or sessionStorage
    // to cache API responses
}

// ==========================================
// Table Sorting Functionality
// ==========================================

/**
 * Make a table sortable by clicking column headers
 * @param {string} tableId - The ID of the table element
 */
function makeTableSortable(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const headers = table.querySelectorAll('thead th');
    const tbody = table.querySelector('tbody');
    
    headers.forEach((header, columnIndex) => {
        // Skip if header is not sortable (has class 'no-sort')
        if (header.classList.contains('no-sort')) return;
        
        // Add sorting indicator
        header.style.cursor = 'pointer';
        header.title = 'Click to sort';
        
        // Add click event listener
        header.addEventListener('click', () => {
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const currentDirection = header.dataset.sortDirection || 'none';
            const isAscending = currentDirection !== 'asc';
            
            // Remove sort indicators from all headers
            headers.forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
                h.dataset.sortDirection = 'none';
            });
            
            // Add sort indicator to clicked header
            if (isAscending) {
                header.classList.add('sort-asc');
                header.dataset.sortDirection = 'asc';
            } else {
                header.classList.add('sort-desc');
                header.dataset.sortDirection = 'desc';
            }
            
            // Sort rows
            rows.sort((rowA, rowB) => {
                const cellA = rowA.cells[columnIndex]?.textContent.trim() || '';
                const cellB = rowB.cells[columnIndex]?.textContent.trim() || '';
                
                // Try to parse as numbers (handle percentages, decimals, commas)
                const numA = parseFloat(cellA.replace(/[,%+]/g, ''));
                const numB = parseFloat(cellB.replace(/[,%+]/g, ''));
                
                let comparison = 0;
                
                // If both are valid numbers, compare numerically
                if (!isNaN(numA) && !isNaN(numB)) {
                    comparison = numA - numB;
                } 
                // Otherwise compare as strings
                else {
                    comparison = cellA.localeCompare(cellB, undefined, { numeric: true });
                }
                
                return isAscending ? comparison : -comparison;
            });
            
            // Re-append sorted rows
            rows.forEach(row => tbody.appendChild(row));
        });
    });
}

/**
 * Populate standings tables organized by division
 */
async function populateStandingsTables() {
    try {
        // Show loading state
        const divisionIds = [
            'afc-east', 'afc-north', 'afc-south', 'afc-west',
            'nfc-east', 'nfc-north', 'nfc-south', 'nfc-west'
        ];
        
        divisionIds.forEach(divId => {
            const tableBody = document.querySelector(`#${divId}-table tbody`);
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="9" class="loading">Loading...</td></tr>';
            }
        });
        
        // Fetch standings data
        const standings = await fetchStandings();
        
        // Populate each division table
        for (const [divisionKey, teams] of Object.entries(standings)) {
            const tableBody = document.querySelector(`#${divisionKey}-table tbody`);
            if (!tableBody) continue;
            
            if (teams.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="9">No data available</td></tr>';
                continue;
            }
            
            // Create rows for each team
            const rows = teams.map(team => `
                <tr>
                    <td>${escapeHtml(team.team)}</td>
                    <td>${escapeHtml(team.wins)}</td>
                    <td>${escapeHtml(team.losses)}</td>
                    <td>${escapeHtml(team.ties)}</td>
                    <td>${escapeHtml(team.winPct)}</td>
                    <td>${escapeHtml(team.pointsScored)}</td>
                    <td>${escapeHtml(team.pointsAllowed)}</td>
                    <td>${escapeHtml(`${team.differential > 0 ? '+' : ''}${team.differential}`)}</td>
                    <td>${escapeHtml(team.streak)}</td>
                </tr>
            `).join('');
            
            tableBody.innerHTML = rows;
        }
        
        console.log('Standings tables populated successfully');
    } catch (error) {
        console.error('Error populating standings:', error);
        
        // Show error in all tables
        const divisionIds = [
            'afc-east', 'afc-north', 'afc-south', 'afc-west',
            'nfc-east', 'nfc-north', 'nfc-south', 'nfc-west'
        ];
        
        divisionIds.forEach(divId => {
            const tableBody = document.querySelector(`#${divId}-table tbody`);
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="9" class="error">Error loading standings: ${escapeHtml(error.message)}</td></tr>`;
            }
        });
    }
}

/**
 * Initialize sorting for all tables on the page
 */
function initializeTableSorting() {
    // Find all tables with data-sortable attribute or specific IDs
    const sortableTables = [
        'schedule-table',
        'team-stats-table',
        'qb-leaders-table',
        'receiver-leaders-table',
        'rushing-leaders-table',
        'afc-east-table',
        'afc-north-table',
        'afc-south-table',
        'afc-west-table',
        'nfc-east-table',
        'nfc-north-table',
        'nfc-south-table',
        'nfc-west-table'
    ];
    
    sortableTables.forEach(tableId => {
        makeTableSortable(tableId);
    });
}

// ==========================================
// Search and Filter Functions
// ==========================================

/**
 * Initialize search functionality for a table
 * @param {string} searchInputId - ID of the search input
 * @param {string} tableId - ID of the table to search
 * @param {number} nameColumnIndex - Index of the column containing names
 */
function initializeSearch(searchInputId, tableId, nameColumnIndex = 1) {
    const searchInput = document.getElementById(searchInputId);
    const table = document.getElementById(tableId);
    
    if (!searchInput || !table) return;
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        let visibleCount = 0;
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return; // Skip empty rows
            
            const nameCell = cells[nameColumnIndex];
            if (!nameCell) return;
            
            const name = nameCell.textContent.toLowerCase();
            if (name.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        // Show message if no results
        if (visibleCount === 0 && rows.length > 0) {
            const loadingRow = tbody.querySelector('.loading');
            if (!loadingRow) {
                const messageRow = document.createElement('tr');
                messageRow.className = 'no-results';
                const messageCell = document.createElement('td');
                messageCell.colSpan = table.querySelector('thead tr').cells.length;
                messageCell.style.textAlign = 'center';
                messageCell.style.padding = '2rem';
                messageCell.textContent = `No players found matching "${e.target.value}"`;
                messageRow.appendChild(messageCell);
                tbody.appendChild(messageRow);
            }
        } else {
            const noResultsRow = tbody.querySelector('.no-results');
            if (noResultsRow) {
                noResultsRow.remove();
            }
        }
    });
}

/**
 * Initialize team filter functionality for a table
 * @param {string} selectId - ID of the select dropdown
 * @param {string} tableId - ID of the table to filter
 * @param {number} teamColumnIndex - Index of the column containing team abbreviations
 */
function initializeTeamFilter(selectId, tableId, teamColumnIndex = 2) {
    const select = document.getElementById(selectId);
    const table = document.getElementById(tableId);
    
    if (!select || !table) return;
    
    // Populate team filter options from table data
    const populateTeamOptions = () => {
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        const teams = new Set();
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > teamColumnIndex) {
                const team = cells[teamColumnIndex].textContent.trim();
                if (team && team !== 'Team') {
                    teams.add(team);
                }
            }
        });
        
        // Sort teams alphabetically
        const sortedTeams = Array.from(teams).sort();
        
        // Clear existing options (except "All Teams")
        select.innerHTML = '<option value="">All Teams</option>';
        
        // Add team options
        sortedTeams.forEach(team => {
            const option = document.createElement('option');
            option.value = team;
            option.textContent = team;
            select.appendChild(option);
        });
    };
    
    // Filter table by selected team
    select.addEventListener('change', (e) => {
        const selectedTeam = e.target.value;
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return;
            
            const teamCell = cells[teamColumnIndex];
            if (!teamCell) return;
            
            if (selectedTeam === '' || teamCell.textContent.trim() === selectedTeam) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
    
    // Populate options when table data is loaded
    const observer = new MutationObserver(() => {
        const tbody = table.querySelector('tbody');
        if (tbody && tbody.querySelectorAll('tr:not(.loading)').length > 0) {
            populateTeamOptions();
            observer.disconnect();
        }
    });
    
    observer.observe(table, { childList: true, subtree: true });
}

// ==========================================
// Scroll to Top Button
// ==========================================

/**
 * Initialize scroll to top button functionality
 */
function initializeScrollToTop() {
    const scrollBtn = document.getElementById('scroll-to-top');
    if (!scrollBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top when clicked
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Keyboard support (Enter or Space)
    scrollBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}

// ==========================================
// Stat Tabs for Multi-Category Pages
// ==========================================

/**
 * Initialize stat category tabs (for defensive leaders, etc.)
 */
function initializeStatTabs() {
    const tabs = document.querySelectorAll('.stat-tab');
    const sections = document.querySelectorAll('.stat-section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            
            // Remove active class from all tabs and sections
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding section
            tab.classList.add('active');
            const activeSection = document.getElementById(`${category}-section`);
            if (activeSection) {
                activeSection.classList.add('active');
            }
        });
        
        // Keyboard support
        tab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                tab.click();
            }
        });
    });
}

// ==========================================
// Defensive Stats Population
// ==========================================

/**
 * Populate all defensive leaders tables
 */
async function populateDefensiveLeadersTables() {
    // For now, use placeholder data until ESPN API defensive stats are implemented
    populateTacklesLeadersTable();
    populateSacksLeadersTable();
    populateInterceptionsLeadersTable();
}

/**
 * Populate tackles leaders table
 */
function populateTacklesLeadersTable() {
    const tableBody = document.querySelector('#tackles-leaders-table tbody');
    if (!tableBody) return;
    
    // Placeholder data - will be replaced with API data
    const tacklesData = [
        { rank: 1, name: "Bobby Wagner", team: "SEA", games: 13, total: 142, solo: 89, assisted: 53, tfl: 8, sacks: 2.0, avg: 10.9 },
        { rank: 2, name: "Roquan Smith", team: "BAL", games: 13, total: 138, solo: 92, assisted: 46, tfl: 12, sacks: 3.5, avg: 10.6 },
        { rank: 3, name: "Fred Warner", team: "SF", games: 13, total: 135, solo: 85, assisted: 50, tfl: 7, sacks: 1.5, avg: 10.4 },
        { rank: 4, name: "Zaire Franklin", team: "IND", games: 13, total: 128, solo: 78, assisted: 50, tfl: 5, sacks: 1.0, avg: 9.8 },
        { rank: 5, name: "Foyesade Oluokun", team: "JAX", games: 13, total: 125, solo: 81, assisted: 44, tfl: 6, sacks: 0.5, avg: 9.6 },
        { rank: 6, name: "CJ Mosley", team: "NYJ", games: 13, total: 122, solo: 74, assisted: 48, tfl: 9, sacks: 2.5, avg: 9.4 },
        { rank: 7, name: "TJ Edwards", team: "CHI", games: 13, total: 118, solo: 72, assisted: 46, tfl: 4, sacks: 1.0, avg: 9.1 },
        { rank: 8, name: "Devin Lloyd", team: "JAX", games: 13, total: 115, solo: 70, assisted: 45, tfl: 10, sacks: 3.0, avg: 8.8 },
        { rank: 9, name: "Ernest Jones", team: "LAR", games: 13, total: 112, solo: 68, assisted: 44, tfl: 6, sacks: 1.5, avg: 8.6 },
        { rank: 10, name: "Demario Davis", team: "NO", games: 13, total: 110, solo: 67, assisted: 43, tfl: 7, sacks: 2.0, avg: 8.5 }
    ];
    
    const rows = tacklesData.map(player => `
        <tr>
            <td>${player.rank}</td>
            <td>${player.name}</td>
            <td>${player.team}</td>
            <td>${player.games}</td>
            <td>${player.total}</td>
            <td>${player.solo}</td>
            <td>${player.assisted}</td>
            <td>${player.tfl}</td>
            <td>${player.sacks}</td>
            <td>${player.avg}</td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = rows;
}

/**
 * Populate sacks leaders table
 */
function populateSacksLeadersTable() {
    const tableBody = document.querySelector('#sacks-leaders-table tbody');
    if (!tableBody) return;
    
    // Placeholder data
    const sacksData = [
        { rank: 1, name: "TJ Watt", team: "PIT", games: 13, sacks: 14.5, tfl: 18, qbHits: 28, tackles: 52, ff: 4, avg: 1.12 },
        { rank: 2, name: "Myles Garrett", team: "CLE", games: 13, sacks: 13.0, tfl: 16, qbHits: 26, tackles: 48, ff: 3, avg: 1.00 },
        { rank: 3, name: "Micah Parsons", team: "DAL", games: 13, sacks: 12.5, tfl: 15, qbHits: 25, tackles: 55, ff: 5, avg: 0.96 },
        { rank: 4, name: "Maxx Crosby", team: "LV", games: 13, sacks: 11.5, tfl: 14, qbHits: 24, tackles: 60, ff: 2, avg: 0.88 },
        { rank: 5, name: "Nick Bosa", team: "SF", games: 13, sacks: 11.0, tfl: 13, qbHits: 22, tackles: 50, ff: 3, avg: 0.85 },
        { rank: 6, name: "Chris Jones", team: "KC", games: 13, sacks: 10.5, tfl: 12, qbHits: 21, tackles: 45, ff: 2, avg: 0.81 },
        { rank: 7, name: "Danielle Hunter", team: "HOU", games: 13, sacks: 10.0, tfl: 11, qbHits: 20, tackles: 42, ff: 3, avg: 0.77 },
        { rank: 8, name: "Josh Allen", team: "JAX", games: 13, sacks: 9.5, tfl: 10, qbHits: 19, tackles: 38, ff: 1, avg: 0.73 },
        { rank: 9, name: "Rashan Gary", team: "GB", games: 13, sacks: 9.0, tfl: 9, qbHits: 18, tackles: 40, ff: 2, avg: 0.69 },
        { rank: 10, name: "Montez Sweat", team: "CHI", games: 13, sacks: 8.5, tfl: 8, qbHits: 17, tackles: 35, ff: 1, avg: 0.65 }
    ];
    
    const rows = sacksData.map(player => `
        <tr>
            <td>${player.rank}</td>
            <td>${player.name}</td>
            <td>${player.team}</td>
            <td>${player.games}</td>
            <td>${player.sacks}</td>
            <td>${player.tfl}</td>
            <td>${player.qbHits}</td>
            <td>${player.tackles}</td>
            <td>${player.ff}</td>
            <td>${player.avg}</td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = rows;
}

/**
 * Populate interceptions leaders table
 */
function populateInterceptionsLeadersTable() {
    const tableBody = document.querySelector('#interceptions-leaders-table tbody');
    if (!tableBody) return;
    
    // Placeholder data
    const interceptionsData = [
        { rank: 1, name: "DaRon Bland", team: "DAL", games: 13, ints: 7, intYards: 165, intTDs: 3, pd: 12, ff: 2, long: 54 },
        { rank: 2, name: "Trevon Diggs", team: "DAL", games: 13, ints: 6, intYards: 142, intTDs: 2, pd: 15, ff: 1, long: 61 },
        { rank: 3, name: "Devon Witherspoon", team: "SEA", games: 13, ints: 6, intYards: 128, intTDs: 1, pd: 11, ff: 3, long: 48 },
        { rank: 4, name: "Jaylon Johnson", team: "CHI", games: 13, ints: 5, intYards: 115, intTDs: 2, pd: 13, ff: 0, long: 52 },
        { rank: 5, name: "Patrick Surtain II", team: "DEN", games: 13, ints: 5, intYards: 98, intTDs: 1, pd: 14, ff: 1, long: 45 },
        { rank: 6, name: "Sauce Gardner", team: "NYJ", games: 13, ints: 5, intYards: 82, intTDs: 0, pd: 16, ff: 2, long: 38 },
        { rank: 7, name: "CJ Gardner-Johnson", team: "PHI", games: 13, ints: 4, intYards: 105, intTDs: 1, pd: 10, ff: 1, long: 44 },
        { rank: 8, name: "Kerby Joseph", team: "DET", games: 13, ints: 4, intYards: 92, intTDs: 1, pd: 9, ff: 0, long: 42 },
        { rank: 9, name: "Brian Branch", team: "DET", games: 13, ints: 4, intYards: 78, intTDs: 0, pd: 8, ff: 2, long: 36 },
        { rank: 10, name: "Kyle Hamilton", team: "BAL", games: 13, ints: 4, intYards: 65, intTDs: 0, pd: 7, ff: 1, long: 31 }
    ];
    
    const rows = interceptionsData.map(player => `
        <tr>
            <td>${player.rank}</td>
            <td>${player.name}</td>
            <td>${player.team}</td>
            <td>${player.games}</td>
            <td>${player.ints}</td>
            <td>${player.intYards}</td>
            <td>${player.intTDs}</td>
            <td>${player.pd}</td>
            <td>${player.ff}</td>
            <td>${player.long}</td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = rows;
}

// ==========================================
// Special Teams Stats Population
// ==========================================

/**
 * Populate all special teams tables
 */
async function populateSpecialTeamsTables() {
    populateKickersLeadersTable();
    populatePuntersLeadersTable();
    populateReturnersLeadersTable();
}

/**
 * Populate kickers leaders table
 */
function populateKickersLeadersTable() {
    const tableBody = document.querySelector('#kickers-leaders-table tbody');
    if (!tableBody) return;
    
    // Placeholder data
    const kickersData = [
        { rank: 1, name: "Harrison Butker", team: "KC", fgm: 28, fga: 30, fgPct: "93.3%", long: 58, xpm: 45, xpa: 46, points: 129 },
        { rank: 2, name: "Justin Tucker", team: "BAL", fgm: 27, fga: 31, fgPct: "87.1%", long: 61, xpm: 42, xpa: 43, points: 123 },
        { rank: 3, name: "Jake Moody", team: "SF", fgm: 26, fga: 29, fgPct: "89.7%", long: 57, xpm: 44, xpa: 45, points: 122 },
        { rank: 4, name: "Brandon Aubrey", team: "DAL", fgm: 29, fga: 32, fgPct: "90.6%", long: 60, xpm: 35, xpa: 36, points: 122 },
        { rank: 5, name: "Cameron Dicker", team: "LAC", fgm: 25, fga: 28, fgPct: "89.3%", long: 55, xpm: 43, xpa: 44, points: 118 },
        { rank: 6, name: "Jason Myers", team: "SEA", fgm: 24, fga: 27, fgPct: "88.9%", long: 56, xpm: 46, xpa: 47, points: 118 },
        { rank: 7, name: "Tyler Bass", team: "BUF", fgm: 26, fga: 30, fgPct: "86.7%", long: 54, xpm: 40, xpa: 41, points: 118 },
        { rank: 8, name: "Jake Elliott", team: "PHI", fgm: 25, fga: 29, fgPct: "86.2%", long: 59, xpm: 41, xpa: 42, points: 116 },
        { rank: 9, name: "Younghoe Koo", team: "ATL", fgm: 23, fga: 26, fgPct: "88.5%", long: 53, xpm: 44, xpa: 45, points: 113 },
        { rank: 10, name: "Chris Boswell", team: "PIT", fgm: 24, fga: 28, fgPct: "85.7%", long: 57, xpm: 38, xpa: 39, points: 110 }
    ];
    
    const rows = kickersData.map(player => `
        <tr>
            <td>${player.rank}</td>
            <td>${player.name}</td>
            <td>${player.team}</td>
            <td>${player.fgm}</td>
            <td>${player.fga}</td>
            <td>${player.fgPct}</td>
            <td>${player.long}</td>
            <td>${player.xpm}</td>
            <td>${player.xpa}</td>
            <td>${player.points}</td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = rows;
}

/**
 * Populate punters leaders table
 */
function populatePuntersLeadersTable() {
    const tableBody = document.querySelector('#punters-leaders-table tbody');
    if (!tableBody) return;
    
    // Placeholder data
    const puntersData = [
        { rank: 1, name: "Bryan Anger", team: "DAL", punts: 58, yards: 2784, avg: 48.0, netAvg: 42.8, long: 72, inside20: 22, tb: 8 },
        { rank: 2, name: "AJ Cole", team: "LV", punts: 72, yards: 3456, avg: 48.0, netAvg: 42.1, long: 68, inside20: 28, tb: 10 },
        { rank: 3, name: "Jake Bailey", team: "MIA", punts: 65, yards: 3120, avg: 48.0, netAvg: 41.9, long: 70, inside20: 25, tb: 9 },
        { rank: 4, name: "Tommy Townsend", team: "HOU", punts: 60, yards: 2880, avg: 48.0, netAvg: 42.5, long: 69, inside20: 24, tb: 7 },
        { rank: 5, name: "Logan Cooke", team: "JAX", punts: 68, yards: 3264, avg: 48.0, netAvg: 41.7, long: 71, inside20: 26, tb: 11 },
        { rank: 6, name: "Bradley Pinion", team: "ATL", punts: 70, yards: 3360, avg: 48.0, netAvg: 41.5, long: 67, inside20: 27, tb: 12 },
        { rank: 7, name: "Jack Fox", team: "DET", punts: 52, yards: 2496, avg: 48.0, netAvg: 43.2, long: 73, inside20: 20, tb: 6 },
        { rank: 8, name: "Tress Way", team: "WSH", punts: 75, yards: 3600, avg: 48.0, netAvg: 41.3, long: 66, inside20: 29, tb: 13 },
        { rank: 9, name: "Mitch Wishnowsky", team: "SF", punts: 55, yards: 2640, avg: 48.0, netAvg: 42.9, long: 68, inside20: 21, tb: 7 },
        { rank: 10, name: "Ryan Stonehouse", team: "TEN", punts: 78, yards: 3744, avg: 48.0, netAvg: 41.0, long: 70, inside20: 30, tb: 14 }
    ];
    
    const rows = puntersData.map(player => `
        <tr>
            <td>${player.rank}</td>
            <td>${player.name}</td>
            <td>${player.team}</td>
            <td>${player.punts}</td>
            <td>${player.yards}</td>
            <td>${player.avg}</td>
            <td>${player.netAvg}</td>
            <td>${player.long}</td>
            <td>${player.inside20}</td>
            <td>${player.tb}</td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = rows;
}

/**
 * Populate return specialists leaders table
 */
function populateReturnersLeadersTable() {
    const tableBody = document.querySelector('#returners-leaders-table tbody');
    if (!tableBody) return;
    
    // Placeholder data
    const returnersData = [
        { rank: 1, name: "KaVontae Turpin", team: "DAL", kr: 28, krYards: 756, krAvg: 27.0, pr: 22, prYards: 308, prAvg: 14.0, tds: 2 },
        { rank: 2, name: "Derius Davis", team: "LAC", kr: 30, krYards: 780, krAvg: 26.0, pr: 18, prYards: 252, prAvg: 14.0, tds: 1 },
        { rank: 3, name: "DeeJay Dallas", team: "ARI", kr: 32, krYards: 800, krAvg: 25.0, pr: 15, prYards: 195, prAvg: 13.0, tds: 1 },
        { rank: 4, name: "Jamal Agnew", team: "JAX", kr: 25, krYards: 625, krAvg: 25.0, pr: 20, prYards: 280, prAvg: 14.0, tds: 2 },
        { rank: 5, name: "Brandon Powell", team: "MIN", kr: 22, krYards: 550, krAvg: 25.0, pr: 25, prYards: 325, prAvg: 13.0, tds: 1 },
        { rank: 6, name: "Mecole Hardman", team: "NYJ", kr: 27, krYards: 675, krAvg: 25.0, pr: 16, prYards: 208, prAvg: 13.0, tds: 0 },
        { rank: 7, name: "Kalif Raymond", team: "DET", kr: 18, krYards: 450, krAvg: 25.0, pr: 28, prYards: 364, prAvg: 13.0, tds: 1 },
        { rank: 8, name: "Rondale Moore", team: "ATL", kr: 24, krYards: 600, krAvg: 25.0, pr: 19, prYards: 247, prAvg: 13.0, tds: 0 },
        { rank: 9, name: "Richie James", team: "KC", kr: 26, krYards: 650, krAvg: 25.0, pr: 17, prYards: 221, prAvg: 13.0, tds: 1 },
        { rank: 10, name: "Isaiah McKenzie", team: "IND", kr: 20, krYards: 500, krAvg: 25.0, pr: 23, prYards: 299, prAvg: 13.0, tds: 0 }
    ];
    
    const rows = returnersData.map(player => `
        <tr>
            <td>${player.rank}</td>
            <td>${player.name}</td>
            <td>${player.team}</td>
            <td>${player.kr}</td>
            <td>${player.krYards}</td>
            <td>${player.krAvg}</td>
            <td>${player.pr}</td>
            <td>${player.prYards}</td>
            <td>${player.prAvg}</td>
            <td>${player.tds}</td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = rows;
}

// ==========================================
// Keyboard Navigation
// ==========================================

/**
 * Initialize keyboard navigation shortcuts
 */
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Alt+H: Home
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            window.location.href = 'index.html';
        }
        // Alt+S: Schedule
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            window.location.href = 'schedule.html';
        }
        // Alt+T: Standings
        if (e.altKey && e.key === 't') {
            e.preventDefault();
            window.location.href = 'standings.html';
        }
        // Alt+P: Player Stats
        if (e.altKey && e.key === 'p') {
            e.preventDefault();
            window.location.href = 'qb-leaders.html';
        }
        // Escape: Clear search/filters
        if (e.key === 'Escape') {
            const searchInputs = document.querySelectorAll('input[type="text"]');
            searchInputs.forEach(input => input.value = '');
            const selects = document.querySelectorAll('select');
            selects.forEach(select => select.selectedIndex = 0);
            
            // Trigger change events to reset filters
            searchInputs.forEach(input => input.dispatchEvent(new Event('input')));
            selects.forEach(select => select.dispatchEvent(new Event('change')));
        }
    });
}

// Populate league leaders summary page
async function populateLeagueLeaders() {
    // This function aggregates top performers from all categories
    // In a production environment, this would fetch real data from the API
    // For now, we'll use sample data from our existing datasets
    
    // Helper function to create leader list item
    function createLeaderItem(playerName, team, statValue) {
        return `
            <span class="player-name">${escapeHtml(playerName)}<span class="player-team">${escapeHtml(team)}</span></span>
            <span class="stat-value">${escapeHtml(statValue)}</span>
        `;
    }
    
    // Passing Yards Leaders (top 5 from QB data)
    const passingYardsLeaders = [
        { name: "Jared Goff", team: "DET", yards: 3541 },
        { name: "Joe Burrow", team: "CIN", yards: 3337 },
        { name: "Patrick Mahomes", team: "KC", yards: 3348 },
        { name: "Baker Mayfield", team: "TB", yards: 3290 },
        { name: "Josh Allen", team: "BUF", yards: 3033 }
    ];
    
    // Passing TDs Leaders
    const passingTdsLeaders = [
        { name: "Joe Burrow", team: "CIN", tds: 30 },
        { name: "Baker Mayfield", team: "TB", tds: 28 },
        { name: "Sam Darnold", team: "MIN", tds: 25 },
        { name: "Jared Goff", team: "DET", tds: 24 },
        { name: "Josh Allen", team: "BUF", tds: 23 }
    ];
    
    // Rushing Yards Leaders
    const rushingYardsLeaders = [
        { name: "Saquon Barkley", team: "PHI", yards: 1623 },
        { name: "Derrick Henry", team: "BAL", yards: 1474 },
        { name: "Josh Jacobs", team: "GB", yards: 1050 },
        { name: "Jahmyr Gibbs", team: "DET", yards: 1047 },
        { name: "De'Von Achane", team: "MIA", yards: 857 }
    ];
    
    // Rushing TDs Leaders
    const rushingTdsLeaders = [
        { name: "Saquon Barkley", team: "PHI", tds: 11 },
        { name: "Derrick Henry", team: "BAL", tds: 13 },
        { name: "Jahmyr Gibbs", team: "DET", tds: 13 },
        { name: "Josh Jacobs", team: "GB", tds: 9 },
        { name: "James Conner", team: "ARI", tds: 10 }
    ];
    
    // Receiving Yards Leaders
    const receivingYardsLeaders = [
        { name: "Ja'Marr Chase", team: "CIN", yards: 1319 },
        { name: "Justin Jefferson", team: "MIN", yards: 1079 },
        { name: "Zay Flowers", team: "BAL", yards: 1047 },
        { name: "CeeDee Lamb", team: "DAL", yards: 1005 },
        { name: "Terry McLaurin", team: "WAS", yards: 982 }
    ];
    
    // Receptions Leaders
    const receptionsLeaders = [
        { name: "Ja'Marr Chase", team: "CIN", rec: 93 },
        { name: "Amon-Ra St. Brown", team: "DET", rec: 84 },
        { name: "CeeDee Lamb", team: "DAL", rec: 82 },
        { name: "Justin Jefferson", team: "MIN", rec: 79 },
        { name: "Terry McLaurin", team: "WAS", rec: 68 }
    ];
    
    // Tackles Leaders
    const tacklesLeaders = [
        { name: "Bobby Okereke", team: "NYG", tackles: 148 },
        { name: "Zaire Franklin", team: "IND", tackles: 145 },
        { name: "Roquan Smith", team: "BAL", tackles: 138 },
        { name: "Foyesade Oluokun", team: "JAX", tackles: 135 },
        { name: "Demario Davis", team: "NO", tackles: 128 }
    ];
    
    // Sacks Leaders
    const sacksLeaders = [
        { name: "Trey Hendrickson", team: "CIN", sacks: 13.5 },
        { name: "Myles Garrett", team: "CLE", sacks: 12.0 },
        { name: "Josh Allen", team: "JAX", sacks: 10.5 },
        { name: "Dexter Lawrence", team: "NYG", sacks: 9.0 },
        { name: "Chris Jones", team: "KC", sacks: 9.0 }
    ];
    
    // Interceptions Leaders
    const interceptionsLeaders = [
        { name: "Kerby Joseph", team: "DET", ints: 8 },
        { name: "Xavier McKinney", team: "GB", ints: 8 },
        { name: "Brian Branch", team: "DET", ints: 6 },
        { name: "Derek Stingley Jr.", team: "HOU", ints: 6 },
        { name: "Patrick Surtain II", team: "DEN", ints: 5 }
    ];
    
    // Field Goals Leaders
    const fieldGoalsLeaders = [
        { name: "Justin Tucker", team: "BAL", fgm: 28 },
        { name: "Brandon Aubrey", team: "DAL", fgm: 27 },
        { name: "Jake Moody", team: "SF", fgm: 26 },
        { name: "Chris Boswell", team: "PIT", fgm: 25 },
        { name: "Younghoe Koo", team: "ATL", fgm: 24 }
    ];
    
    // Points Scored Leaders (kickers)
    const pointsLeaders = [
        { name: "Justin Tucker", team: "BAL", pts: 118 },
        { name: "Brandon Aubrey", team: "DAL", pts: 115 },
        { name: "Chris Boswell", team: "PIT", pts: 112 },
        { name: "Jake Moody", team: "SF", pts: 110 },
        { name: "Younghoe Koo", team: "ATL", pts: 108 }
    ];
    
    // Return TDs Leaders
    const returnTdsLeaders = [
        { name: "KaVontae Turpin", team: "DAL", tds: 2 },
        { name: "Brandon Aubrey", team: "DAL", tds: 2 },
        { name: "Marvin Mims", team: "DEN", tds: 2 },
        { name: "Jalen Reagor", team: "LAC", tds: 1 },
        { name: "Xavier Gipson", team: "NYJ", tds: 1 }
    ];
    
    // Populate all leader lists
    const populateList = (listId, leaders, statKey) => {
        const list = document.getElementById(listId);
        if (list) {
            list.innerHTML = leaders.map(leader => 
                `<li>${createLeaderItem(leader.name, leader.team, leader[statKey])}</li>`
            ).join('');
        }
    };
    
    populateList('passing-yards-leaders', passingYardsLeaders, 'yards');
    populateList('passing-tds-leaders', passingTdsLeaders, 'tds');
    populateList('rushing-yards-leaders', rushingYardsLeaders, 'yards');
    populateList('rushing-tds-leaders', rushingTdsLeaders, 'tds');
    populateList('receiving-yards-leaders', receivingYardsLeaders, 'yards');
    populateList('receptions-leaders', receptionsLeaders, 'rec');
    populateList('tackles-leaders', tacklesLeaders, 'tackles');
    populateList('sacks-leaders', sacksLeaders, 'sacks');
    populateList('interceptions-leaders', interceptionsLeaders, 'ints');
    populateList('field-goals-leaders', fieldGoalsLeaders, 'fgm');
    populateList('points-leaders', pointsLeaders, 'pts');
    populateList('return-tds-leaders', returnTdsLeaders, 'tds');
}

// Populate playoff picture page
async function populatePlayoffPicture() {
    try {
        // Fetch current standings data
        const standingsData = await fetchStandings();
        
        if (!standingsData) {
            console.error('Failed to fetch standings data for playoff picture');
            return;
        }
        
        // Reorganize standings data by conference
        // fetchStandings returns keys like 'afc-east', 'nfc-west', etc.
        const afcData = {
            East: standingsData['afc-east'] || [],
            North: standingsData['afc-north'] || [],
            South: standingsData['afc-south'] || [],
            West: standingsData['afc-west'] || []
        };
        
        const nfcData = {
            East: standingsData['nfc-east'] || [],
            North: standingsData['nfc-north'] || [],
            South: standingsData['nfc-south'] || [],
            West: standingsData['nfc-west'] || []
        };
        
        // Calculate playoff seeding for each conference
        const afcSeeds = calculatePlayoffSeeds(afcData);
        const nfcSeeds = calculatePlayoffSeeds(nfcData);
        
        // Populate AFC seeds
        populateConferenceSeeds('afc', afcSeeds);
        
        // Populate NFC seeds
        populateConferenceSeeds('nfc', nfcSeeds);
        
    } catch (error) {
        console.error('Error populating playoff picture:', error);
    }
}

// Calculate playoff seeds from standings data
function calculatePlayoffSeeds(conferenceData) {
    // Flatten all division teams into one array with division info
    const allTeams = [];
    
    for (const [divisionName, teams] of Object.entries(conferenceData)) {
        teams.forEach(team => {
            allTeams.push({
                ...team,
                division: divisionName
            });
        });
    }
    
    // Sort by wins (descending), then losses (ascending)
    allTeams.sort((a, b) => {
        if (b.wins !== a.wins) {
            return b.wins - a.wins;
        }
        return a.losses - b.losses;
    });
    
    // Get division winners (best team from each division)
    const divisions = ['East', 'North', 'South', 'West'];
    const divisionWinners = [];
    const wildCardCandidates = [];
    
    divisions.forEach(div => {
        const divisionTeams = allTeams.filter(t => t.division === div);
        if (divisionTeams.length > 0) {
            divisionWinners.push({
                ...divisionTeams[0],
                isDivisionWinner: true
            });
            // Rest are wild card candidates
            divisionTeams.slice(1).forEach(t => wildCardCandidates.push(t));
        }
    });
    
    // Sort division winners by record
    divisionWinners.sort((a, b) => {
        if (b.wins !== a.wins) {
            return b.wins - a.wins;
        }
        return a.losses - b.losses;
    });
    
    // Sort wild card candidates by record
    wildCardCandidates.sort((a, b) => {
        if (b.wins !== a.wins) {
            return b.wins - a.wins;
        }
        return a.losses - b.losses;
    });
    
    // Top 3 wild cards make playoffs
    const wildCards = wildCardCandidates.slice(0, 3).map(t => ({
        ...t,
        isWildCard: true
    }));
    
    // Seeds 1-4 are division winners, 5-7 are wild cards
    const playoffTeams = [...divisionWinners, ...wildCards];
    
    // In the hunt are next 3 teams
    const inTheHunt = wildCardCandidates.slice(3, 6);
    
    return {
        seeds: playoffTeams.slice(0, 7),
        inTheHunt: inTheHunt
    };
}

// Populate conference seeds in the UI
function populateConferenceSeeds(conference, seedsData) {
    const { seeds, inTheHunt } = seedsData;
    
    // Find all playoff seed elements for this conference
    const conferenceElement = document.querySelector(
        `.conference-playoff .${conference}-header`
    )?.closest('.conference-playoff');
    
    if (!conferenceElement) return;
    
    // Populate seeds 1-7
    seeds.forEach((team, index) => {
        const seedElement = conferenceElement.querySelector(
            `.playoff-seed[data-seed="${index + 1}"]`
        );
        
        if (seedElement) {
            const teamElement = seedElement.querySelector('.seed-team');
            
            if (teamElement) {
                teamElement.classList.remove('loading');
                
                let divisionBadge = '';
                if (team.isDivisionWinner) {
                    divisionBadge = `<span class="team-division">★ ${escapeHtml(team.division)} Champion</span>`;
                } else if (team.isWildCard) {
                    divisionBadge = `<span class="team-division">Wild Card</span>`;
                }
                
                teamElement.innerHTML = `
                    <span class="team-name">${escapeHtml(team.team || team.name)}</span>
                    <span class="team-record">${escapeHtml(`${team.wins}-${team.losses}-${team.ties || 0}`)}</span>
                    ${divisionBadge}
                `;
            }
        }
    });
    
    // Populate "In The Hunt" teams
    const huntContainer = conferenceElement.querySelector('.hunt-teams');
    if (huntContainer && inTheHunt.length > 0) {
        huntContainer.innerHTML = inTheHunt.map(team => `
            <div class="hunt-team">
                <span class="team-name">${escapeHtml(team.team || team.name)}</span>
                <span class="team-record">(${escapeHtml(`${team.wins}-${team.losses}-${team.ties || 0}`)})</span>
            </div>
        `).join('');
    } else if (huntContainer) {
        huntContainer.innerHTML = '<span style="color: #999;">No teams currently in the hunt</span>';
    }
}
