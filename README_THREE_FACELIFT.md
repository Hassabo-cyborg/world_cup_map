# World Cup 2026 Map — Three.js Cinematic Facelift v3

This version replaces the old tile-map look with a custom cinematic SVG/WebGL map interface.

## What changed

- Uses **Three.js** for the WebGL atmosphere, ambient particles, cursor glow, and stadium glow sprites.
- Uses a custom **SVG map** styled like a dark premium sports/data visualization.
- Removes dependency on Leaflet tiles for this prototype so the visual identity is fully controlled.
- Stadium markers are always visible and interactive.
- Hover cards float beside the mouse.
- Click cards float above the map beside the selected stadium on desktop.
- On mobile, the click card becomes a bottom sheet.
- Filters, matches view, bracket view, dark/light mode, routes, and marker states are included.

## Files to replace

Copy these files into your GitHub repo root and replace the old ones:

```txt
index.html
styles.css
app.js
data.js
```

## Run locally

Open `index.html` directly, or use a local static server:

```bash
python -m http.server 8000
```

Then open:

```txt
http://localhost:8000
```

## Push to GitHub Pages

```bash
git add index.html styles.css app.js data.js
git commit -m "Add Three.js cinematic map facelift"
git push
```

Then hard refresh the published site:

```txt
Ctrl + Shift + R
```

## Data note

The fixture data is still sample prototype data. The UI is ready for real stadium, match, flag, date, weather, and image data later.

## Stadium images

Optional images can be added here:

```txt
assets/stadiums/
```

Example:

```txt
assets/stadiums/mexico-city.jpg
assets/stadiums/los-angeles.jpg
assets/stadiums/new-york-new-jersey.jpg
```

If images are missing, the cards still work with styled placeholders.
