# World Cup 2026 Map — Three.js Cinematic Build v4

This version connects the cinematic map UI to the uploaded dataset.

## Data connected

- `host_cities.csv`: 16 host cities / venues
- `teams.csv`: 48 teams
- `tournament_stages.csv`: 7 tournament stages
- `matches.csv`: 104 matches
- `worldcup2026.db`: inspected and matches the same tables

## Important note

The uploaded `host_cities.csv` contains venue/city/country/region/airport data, but it does **not** contain latitude, longitude, capacity, label offsets, or image paths. To keep the map functional and visual, those fields are merged from the existing cinematic prototype metadata inside the generated `data.js`.

## Replace in your repo

Copy these files into the root of your GitHub repo:

```txt
index.html
styles.css
app.js
data.js
```

Then run:

```bash
git add index.html styles.css app.js data.js
git commit -m "Connect World Cup 2026 dataset to cinematic map"
git push
```

Then hard refresh the GitHub Pages site with `Ctrl + Shift + R`.

## What changed in v4

- Full 104-match schedule is now loaded.
- All 48 teams are loaded from the dataset.
- Group letters and placeholder teams are preserved.
- All 16 host cities are connected to matches.
- Match cards now show match number and match label.
- Knockout bracket now supports Round of 32, Round of 16, Quarterfinals, Semifinals, Third Place Playoff, and Final.
- Three.js atmosphere layer remains active.
- The SVG cinematic map remains functional without external map tiles.
