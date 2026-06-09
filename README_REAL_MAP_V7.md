# World Cup 2026 Map — Real Map v7

This version is rebuilt around a minimal real MapLibre map.

## What changed

- Uses a real CARTO/OpenStreetMap basemap.
- Stadium points are drawn directly by MapLibre from longitude/latitude, so the points line up with the map.
- Removed the custom HTML label overlay and the geo-synced Three.js point layer that could drift away from the map.
- Removed always-visible stadium cards/labels. The default map shows only stadium points.
- Hovering a point shows stadium data in a floating card near the cursor.
- Clicking a point opens one floating detail card. Clicking another stadium replaces the old card. Clicking the map closes it.
- Team flags use emoji flags from the uploaded teams dataset.
- Real host-country borders are drawn as linework only from Natural Earth via world-atlas/topojson, with no polygon fill overlay.
- Mobile opens the click card as a bottom sheet.

## Files to replace

Replace these in your GitHub repo root:

```txt
index.html
styles.css
app.js
data.js
```

Then commit and push:

```bash
git add index.html styles.css app.js data.js
git commit -m "Rebuild minimal real map stadium points UI"
git push
```

Hard refresh the site with `Ctrl + Shift + R`.

## Source data

The raw uploaded files are included in `data_sources/`.
