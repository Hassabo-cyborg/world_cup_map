# V10.4 Final Production Fix

Fixes included:

- Wider default map camera so the full North America host region is visible.
- Stadium click zoom is now mild and keeps regional context.
- Match status logic no longer invents LIVE only from the clock.
- API-Football terminal states (FT/AET/PEN) are trusted.
- Stale LIVE responses are downgraded after a hard match-end safety window.
- Manual refresh uses `fresh=1` to bypass the Vercel/API proxy cache.
- API proxy now uses dynamic fixture caching: shorter during active match windows, longer otherwise.
- Mobile and desktop use the same data/components; mobile only converts the detail card into a touch-safe bottom sheet.
- Live status badge and refresh button included in `index.html`.

After deploying, test:

`/api/worldcup?resource=fixtures&fresh=1`

Then hard-refresh the main site.
