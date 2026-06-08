# World Cup 2026 Match Map & Bracket

A GitHub Pages-ready static website for showing World Cup matches on an interactive map and a knockout tree.

## What is included

- Interactive Leaflet + OpenStreetMap venue map
- Filters for team, round, stadium, and search
- Match cards and data table
- Bracket/tree tab for knockout rounds
- Single-file data source in `data.js`
- No backend, no database, no build step

## Important data note

The included fixture data is **sample/placeholder data**, not a complete official schedule. Replace or extend `window.WC_DATA.matches` and `window.WC_DATA.bracketMatches` in `data.js` with the official schedule/results data that you are allowed to use.

Good fields for each match:

```js
{ id: 1, date: "2026-06-11T13:00:00-06:00", round: "Group stage", group: "Group A", team1: "Mexico", team2: "South Africa", stadiumId: "MEX", status: "scheduled" }
```

## Run locally

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload these files to the root of the repo.
3. Go to **Settings → Pages**.
4. Set the source to deploy from your `main` branch and the root folder.
5. Your site will be published at `https://YOUR_USERNAME.github.io/YOUR_REPO/`.

## Files

- `index.html` — page structure and CDN links
- `styles.css` — responsive dark UI
- `data.js` — stadiums, matches, and bracket data
- `app.js` — map, filters, match cards, table, and bracket rendering

## Upgrade ideas

- Add country flags in `/assets/flags/` and show them in match cards.
- Add a CSV-to-JSON importer for fixture updates.
- Add live scores by updating `data.js` after each match.
- Add team route maps showing travel between stadiums.
- Add a custom domain through GitHub Pages.
