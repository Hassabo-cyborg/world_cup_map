# World Cup 2026 Map — V9 Live-ready

This version keeps the V8 visual system and adds a safe live-data layer.

## What changed

- The frontend still loads the static World Cup 2026 dataset first.
- The browser calls only `/api/worldcup?resource=fixtures`.
- The Vercel serverless function privately calls API-Football.
- Your API key is never placed in `app.js`, `data.js`, or the browser.
- Fixtures are cached for 20 minutes at the CDN layer.
- Standings are ready at `/api/worldcup?resource=standings` and cached for 2 hours.
- Events are ready at `/api/worldcup?resource=events&fixture=FIXTURE_ID` and cached for 5 minutes.
- If the API key is missing, the app automatically stays in Static mode and still works.

## Required Vercel environment variable

Name:

```txt
APIFOOTBALL_KEY
```

Value:

```txt
your API-Football key
```

Add it in Vercel:

Project → Settings → Environment Variables → Add New

## Local testing

Install Vercel CLI:

```bash
npm i -g vercel
```

Run locally:

```bash
vercel dev
```

Use this local env file if you want to test the API proxy locally:

```txt
.env.local
APIFOOTBALL_KEY=your_key_here
```

Do not commit `.env.local`.

## API endpoints inside this project

```txt
/api/worldcup?resource=fixtures
/api/worldcup?resource=standings
/api/worldcup?resource=coverage
/api/worldcup?resource=events&fixture=123456
```

The frontend should never call `https://v3.football.api-sports.io` directly.

## Free-plan request strategy

- Fixtures: one API-Football request every 20 minutes.
- Standings: one request every 2 hours.
- Events: only when a specific match detail is opened later.

This is designed to stay under 100 requests/day in normal use.
