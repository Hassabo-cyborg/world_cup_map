# V10.5 API-Football Free Plan Fix

This build fixes the issue where API-Football returned HTTP 200 but the payload contained `errors.plan` because the free plan cannot access season 2026.

Changes:
- Backend treats API-Football plan errors as `ok:false` static fallback, not live data.
- Frontend also detects payload errors as a safety layer.
- The status badge says `Static · API locked` instead of falsely saying live.
- Existing static dataset remains functional.
- Mexico vs South Africa is patched as FT 2-0 in the static dataset based on published match reports.

For true automatic live scores in 2026, switch to a provider/free plan that actually grants 2026 World Cup scores, or upgrade API-Football to a plan that unlocks season 2026.
