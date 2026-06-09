# World Cup 2026 Map — Real Map Cinematic v5

This version replaces the custom SVG-only map with a real MapLibre map using CARTO/OpenStreetMap raster tiles, while keeping the cinematic style direction:

- Dark monochrome real basemap
- Deep green/off-white identity
- Gold, electric blue, and FIFA blue accents
- Three.js WebGL glow layer synced to stadium locations
- Animated pulse stadium markers
- Always-visible stadium labels with connector lines
- Hover card follows the mouse
- Click card floats over the map near the selected stadium
- Mobile card becomes a bottom sheet
- Filters, matches, and bracket still work
- Dataset connected from the uploaded CSV/SQLite files

## Replace these files in the repo root

```txt
index.html
styles.css
app.js
data.js
```

The raw source data is included in `data_sources/` for reference.

## Deployment

This still works on GitHub Pages. It uses external CDNs for:

- MapLibre GL JS
- Three.js
- Google Fonts
- CARTO/OpenStreetMap basemap tiles

No Mapbox token or paid API key is required.
