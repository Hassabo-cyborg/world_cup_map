# V10.9 — Mobile app feel + secondary travel context

This build keeps V10.8's tethered stadium card and professional bracket direction, but restores a more native mobile-app feeling:

- Mobile stadium card is a stronger bottom sheet with handle, better scrolling, and restored core stadium stats.
- Match cards remain tap-first and still open the correct stadium on the map.
- Travel/distance information is back as secondary context only.
- Selecting a match/stadium draws a subtle dotted travel route on the map between the previous/current/next host venues.
- Stadium cards include a collapsible **Travel context** section with straight-line km/mi estimates.
- Cache-busting query strings were added to `styles.css`, `data.js`, and `app.js` so mobile browsers load the newest build.
