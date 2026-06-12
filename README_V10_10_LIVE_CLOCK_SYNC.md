# V10.10 Live Clock Sync Fix

This build fixes live match timing so all visitors see the same match state regardless of local timezone.

Key fixes:
- Absolute kickoff times are parsed once and compared to Date.now().
- If the free provider does not mark a match live, the UI still shows LIVE during the real match window.
- Status updates locally every 30 seconds without spending API requests.
- Football data is matched by match number first, which fixes provider/static schedule mismatches.
- Team aliases added for South Korea/Korea Republic, Czechia/Czech Republic, Türkiye/Turkey, and Bosnia and Herzegovina.
- Network refresh uses the cached backend every 5 minutes; browser clock refresh handles live timing between API calls.
