# TODO List - NFL Stats Dashboard

This document tracks the development roadmap for the NFL Stats Dashboard (live at https://nfl.jessefamily.cloud).

**Priority order (October 2026):**
1. Reliability: every page reads saved `data/*.json` first
2. Testing (Phase 9)
3. Betting odds: decide whether to bring it back, then finish it
4. Phase 6 (trimmed): power rankings, season archives, weekly picks page
5. Later: Phases 7, 8 and 10

---

## 1. 🛡️ Reliability: Saved Data First (Phase 3 follow-up) — Priority: Highest

ESPN's APIs mostly block browser requests (no CORS headers, `http://` links that trigger mixed-content errors). Pages must render from the saved JSON written by the Tuesday data workflow and use live ESPN only as a fallback.

- [x] GitHub Actions workflow with scheduled data updates (Tuesdays 6 AM ET)
- [x] Data fetching script (`scripts/fetch-data.js`) storing JSON in `data/`
- [x] Automated deployment pipeline, status badge, AUTOMATION.md
- [x] Player stats populate again (ESPN `http://` links) — #29
- [x] Standings page loads saved standings first — #30
- [x] Team stats and advanced metrics populate; Team Stats page reads saved file — #31
- [x] Data workflow refuses to commit empty or malformed data — #32
- [ ] Every page reads saved data first, live ESPN fallback only, error message instead of blank tables — #33 (open)
- [ ] Save the full 18-week schedule so predictions don't call ESPN for past weeks — #33 (open)
- [ ] Guard against ESPN returning `{}` for a single team (seen for CIN on Oct 15) — #33 (open)
- [ ] Replace hardcoded sample data on Defensive Leaders, Special Teams and League Leaders with fetched data

## 2. 🧪 Testing & Quality (Phase 9) — Priority: High

- [x] CI data check on every PR and push to main (`scripts/validate-data.js`) — #32
- [ ] Unit tests for `scripts/fetch-data.js` (season/week math, standings parsing, empty-response handling) using recorded ESPN fixtures
- [ ] Page-load smoke check in CI: serve the site, load every page headlessly, fail on console errors or empty tables
- [ ] Run the smoke check against the live site after each deploy
- [ ] Accessibility audit (WCAG 2.1)
- [ ] Cross-browser / mobile spot checks

## 3. 🎰 Betting Odds — Priority: Medium (decision needed)

**Status (Oct 15, 2026):** The odds feature was removed from the app in May 2026 (issue #18, commit `fee633f`). There is no `fetchOdds()` in `scripts/fetch-data.js`, the schedule page has no odds columns, and `data/odds.json` is an empty list. The `ODDS_API_KEY` GitHub secret is still configured (it shows as masked in workflow logs) and is still passed to the data workflow, but nothing reads it.

- [ ] Decide whether to bring odds back (it was deliberately removed in #18)
- [ ] If yes: restore `fetchOdds()` (The Odds API, `americanfootball_nfl`) in the data workflow, saving to `data/odds.json`
- [ ] Restore the schedule-page odds toggle (spread, moneyline, total) reading only from `data/odds.json`
- [ ] Keep the disclaimers (informational only, 21+, responsible gambling links)
- [ ] Add `odds.json` to the data check once it's populated (empty is allowed today)
- [ ] If no: remove `ODDS_API_KEY` from the workflow and repo secrets, and delete `data/odds.json`

## 4. 🚀 Advanced Features (Phase 6, trimmed) — Priority: Medium

- [ ] Power rankings page (built from saved standings and advanced metrics)
- [ ] Historical season archives page (browse `data/archive/<season>/`, archive each season automatically)
- [ ] **Weekly picks page** (new), from the NFL Weekly Picks Google Sheet:
  - [ ] Season record (every game counts; ties count as losses)
  - [ ] Weekly pick cards (pick, confidence, result)
  - [ ] Record by confidence level (High / Med / Low)
  - [ ] Export path from the sheet to `data/picks.json` (fetched by the workflow, not the browser)

## 5. 🔜 Later

### Phase 7: UI/UX Enhancements — Priority: Low
Cheap wins first: **dark mode toggle** and **team logos in tables** (ESPN logo URLs).
- [ ] Dark mode toggle
- [ ] Team logos in tables
- [ ] Theme customization (team colors)
- [ ] Tooltips for stat abbreviations
- [ ] Skeleton loading screens
- [ ] Charts and graphs
- [ ] PWA manifest / offline support

### Phase 8: Performance Optimization — Priority: Low
- [ ] Minify CSS and JavaScript
- [ ] Optimize table rendering for large datasets
- [ ] Service worker caching
- [ ] Core Web Vitals review

### Phase 10: Documentation & Community — Priority: Low
- [ ] CONTRIBUTING.md
- [ ] Issue and pull request templates
- [ ] CHANGELOG.md
- [ ] Clean up stale root docs (several describe old fixes and the removed odds feature)

---

## ✅ Completed Phases

- **Phase 1: Initial Setup** — all pages, responsive CSS, navigation, README/TODO
- **Phase 2: Data Integration** — ESPN API module (`api.js`), error handling, loading states, caching
- **Phase 4: Enhanced Interactivity** — sorting, search/filter, team filter, scroll-to-top, keyboard and ARIA support
- **Phase 5: Additional Statistics Pages** — Defensive Leaders, Special Teams, League Leaders, Playoff Picture (note: the first three still use sample data, see Reliability)

## 💡 Ideas (not scheduled)

- **Fantasy football projections** (moved from Phase 6)
- **Injury reports** (moved from Phase 6)
- Player comparison tool
- Team depth charts
- Export data to CSV
- Live game updates during games
- Notifications when a favorite team plays
- Bracket / playoff predictor
- Draft tracker

## 🐛 Known Issues

- Pages other than Standings and Team Stats still try ESPN from the browser before the saved data; predictions logs ~96 CORS errors and schedule ~39 (fixed by #33, open).
- `data/schedule.json` only covers the current week onward, so predictions can't show earlier 2026 weeks from saved data (fixed by #33).
- ESPN returned `{}` for CIN's team endpoint on Oct 15; without the #33 guard the next data refresh would fail the data check and not commit.
- Defensive Leaders, Special Teams and League Leaders show hardcoded sample data, not 2026 stats.
- Predictions use 2025 advanced metrics from `data/archive/2025/` rather than the current season.
- `data/odds.json` is empty and the odds feature is removed (see Betting Odds).

## 📊 Progress Tracking

Counts are checkboxes in this file.

- **Reliability**: 7/11 (64%)
- **Testing (Phase 9)**: 1/6 (17%)
- **Betting Odds**: 0/6 (0%) — waiting on the keep/remove decision
- **Phase 6 (trimmed)**: 0/7 (0%)
- **Phases 7 / 8 / 10**: 0/7, 0/4, 0/4
- **Overall (open roadmap)**: 8/45 (18%), plus Phases 1, 2, 4 and 5 complete

---

**Last Updated**: October 15, 2026

**Recent Changes (Oct 15, 2026)**:
- ✅ #29 Player stats populate again: `fetchUrl` upgrades ESPN `http://` links to `https://` and follows redirects
- ✅ #30 Standings page loads saved `data/standings.json` first (ESPN blocks browser requests)
- ✅ #31 Team stats and advanced metrics built from per-team standings (ESPN's `/standings` endpoint returns only a stub); Team Stats page reads the saved file
- ✅ #32 Data validation check on every PR and push to main; the data workflow fails instead of committing empty data
- 🚧 #33 Saved data first on every page, full-season schedule, empty-team guard (open)
- 🔄 Roadmap reprioritized: reliability, testing, odds decision, trimmed Phase 6 with a weekly picks page
