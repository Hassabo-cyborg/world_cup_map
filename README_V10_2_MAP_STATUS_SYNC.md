# World Cup Map V10.2 — Map + Status Sync Fix

This version fixes the V10.1 issues:

- Wider initial map framing so North America is visible on load/reset.
- Stadium click fly-to is less aggressive.
- Match status fallback is timezone-safe and no longer keeps a group-stage match live for too long.
- If the API/cache is stale and still reports a group game as live after a realistic end window, the UI marks it as FT until the next API refresh confirms the final state.
- Mobile stadium cards keep the match list scrollable inside the card.
- Desktop flags use flag image assets from FlagCDN with emoji fallback.

Deploy on Vercel with `APIFOOTBALL_KEY` set in environment variables.
