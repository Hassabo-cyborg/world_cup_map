# V10.3 Updated Data + Production Fixes

This build replaces the old team/source data with the updated uploaded files and keeps the corrected V10 live-ready architecture.

## Included fixes

- Updated teams from `teams(2).csv` / `worldcup2026(2).db`
- Replaced playoff placeholders with the updated teams: Czechia, Bosnia and Herzegovina, Türkiye, Sweden, DR Congo, Iraq
- Corrected Match 100 self-reference from `W95 vs W100` to `W95 vs W96` in the generated website data
- Wider North America default map view
- Less aggressive stadium click zoom
- Stronger timezone-safe status fallback: stale live API/cache labels cannot keep a group-stage match live after the expected end window
- More reliable mobile stadium-card scrolling
- Added missing desktop flag image mappings for the updated teams

## Deployment

Replace the repo files with this package, keep `api/worldcup.js` inside the root-level `api` folder, then redeploy on Vercel.
