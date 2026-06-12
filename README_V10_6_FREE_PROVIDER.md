# World Cup Map V10.6 — Free Provider Switch

This version removes API-Football as the primary live source because the API-Football free plan blocks season 2026.

## Provider priority

1. `football-data.org` if `FOOTBALLDATA_KEY` exists in Vercel Environment Variables.
2. OpenFootball public JSON from GitHub if no `FOOTBALLDATA_KEY` is configured or football-data.org fails.
3. Optional API-Football fallback only if `APIFOOTBALL_KEY` exists and returns usable 2026 data.
4. Static local dataset if all providers fail.

## Vercel environment variable

Create a free football-data.org account and add this variable in Vercel:

```txt
FOOTBALLDATA_KEY=your_token_here
```

Do not put the token in `app.js` or `index.html`.

## Test endpoints

```txt
/api/worldcup?resource=fixtures&fresh=1
/api/worldcup?resource=coverage&fresh=1
/api/worldcup?resource=standings&fresh=1
```

If `FOOTBALLDATA_KEY` is missing, fixtures should still return OpenFootball public data with provider `openfootball`.

## Notes

- football-data.org is the preferred free API for fixtures/scores.
- OpenFootball is no-key public data. It may not update instantly, but it keeps the app independent and working.
- The site badge now says `Free scores`, `Free public data`, or `Static mode` instead of incorrectly claiming API-Football live access.
