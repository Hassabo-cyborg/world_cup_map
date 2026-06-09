# World Cup 2026 Map — Real Map V6

This version fixes the UI/UX issues from V5:

- Removed the hand-drawn country polygon overlays.
- Added real USA / Mexico / Canada country border outlines from Natural Earth via `world-atlas` + `topojson-client`.
- Kept the real MapLibre + CARTO dark monochrome basemap.
- Kept the Three.js atmosphere and glow layer.
- Added label collision handling so stadium labels do not overlap badly.
- Reduced label/card scale for a cleaner professional map.
- Hover cards no longer appear over an open detail card.
- Clicking another stadium replaces the previous card cleanly.
- Clicking the map closes the selected stadium card.
- Opening filters or switching views closes the active stadium card.
- Mobile still uses a bottom sheet for the detail card.

Replace your repo root files with:

```txt
index.html
styles.css
app.js
data.js
```

Then run:

```bash
git add index.html styles.css app.js data.js
git commit -m "Fix real map borders labels and card UX"
git push
```
