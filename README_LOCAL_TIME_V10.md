# World Cup Map V10 — Local Time + Status Fix

This version keeps V9 live mode and fixes match time/status UX.

## Fixed

- Match times are displayed in each visitor's own browser time zone.
- Static kickoff strings with offsets like `2026-06-11 15:00:00-06` are now parsed as real instants.
- Match day grouping is based on the visitor's local date.
- Chronological sorting uses real timestamps, not string dates.
- If API-Football returns `NS` or the static fallback is active, the UI now computes a practical status from kickoff time:
  - before kickoff: Scheduled
  - after kickoff and inside the match window: LIVE
  - after the match window: FT
- This prevents a match that has already started/passed in KSA or any other timezone from still showing as Upcoming.

## Deploy

Copy these files/folders into the repo root:

- index.html
- styles.css
- app.js
- data.js
- api/worldcup.js
- vercel.json

Then commit, push, and redeploy on Vercel.
