# World Cup 2026 Map — Facelift v2

This version fixes the issues from the first facelift pass:

- Stadium markers render on the map by default, including host stadiums that do not have sample matches yet.
- The selected stadium card is no longer a side panel on desktop.
- Hover cards follow the mouse.
- Click cards float on top of the map near the clicked marker.
- On mobile, the clicked stadium card becomes a bottom sheet because floating cards are too tight on small screens.
- `app.js` now has fallback data so the map does not completely die if `data.js` is accidentally malformed.
- `data.js` has been rewritten as valid JavaScript with safe comments.

## Install

Replace these files in your repo root:

```txt
index.html
styles.css
app.js
data.js
```

Then push:

```bash
git add index.html styles.css app.js data.js
git commit -m "Fix cinematic map markers and floating stadium cards"
git push
```

After GitHub Pages redeploys, hard refresh:

```txt
Ctrl + Shift + R
```

If the map still does not show markers, open DevTools Console. The most important error to check is whether `data.js` is still the old broken version.
