# World Cup 2026 Map — Real Map v8

This version keeps the clean real MapLibre map and stadium-only points, then upgrades the schedule and bracket UX.

## Changes

- Matches are sorted chronologically by kickoff, not by random display order.
- The Matches view is grouped by match day.
- The Bracket view is ESPN-inspired: stage tabs, horizontal bracket columns, clickable match nodes, and a details panel.
- Bracket placeholders are expanded into readable language.
  - `1L` = winner of Group L
  - `2B` = runner-up of Group B
  - `3EHIJK` = one of the qualified third-place teams from Groups E/H/I/J/K
  - `W79` = winner of Match 79
  - `RU101` = loser/runner-up of Match 101, used for the third-place match path
- Team flags use emoji flags.
- Venue card match lists are chronological.
- The uploaded CSV had an impossible self-reference in Match 100: `W95 vs W100`. This version fixes it to `W95 vs W96` so the bracket path can work logically.

## Files to replace

Replace these files in the repo root:

- `index.html`
- `styles.css`
- `app.js`
- `data.js`

Then commit and push.
