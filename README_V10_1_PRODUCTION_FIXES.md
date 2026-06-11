# World Cup 2026 Map — V10.1 Production Polish

This patch builds on V10 and fixes deployment-level UX issues:

- Wider default map view so North America is visible on load/reset.
- Stadium points stay locked to real MapLibre coordinates.
- Mobile stadium detail card is now a fixed bottom sheet with reliable internal scrolling.
- The match list inside the stadium card uses its own scroll area and does not fight the map gestures.
- Desktop/mobile card sizing is more stable.
- Flag emojis now render through Twemoji SVG flag images when possible, so flags display correctly on Windows/desktop as well as mobile.
- API-Football live-ready backend remains unchanged and still keeps the key private through `APIFOOTBALL_KEY`.

Deploy the full folder contents to the repo root, then redeploy on Vercel.
