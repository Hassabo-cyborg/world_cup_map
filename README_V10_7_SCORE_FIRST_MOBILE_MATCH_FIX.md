# V10.7 — Score-first + match-to-map + mobile parity

This build keeps the V10.6 free-provider system and adds UX fixes requested after deployment:

- Bigger score display, especially for finished matches.
- Match cards in the Matches tab are now clickable.
- Clicking a match switches to the Map, flies to the correct stadium, selects the point, and opens the stadium card focused on that match.
- Mobile Matches view now shows the same core information as desktop: teams, score/status, local kickoff time, venue, city/country, and a clear Show on map action.
- Mobile stadium cards have stronger internal scrolling so the match list remains usable near screen edges.
- The map default/reset view is zoomed further out to show the North American host context.
- Bracket click handler is explicitly bound.

Deploy on Vercel after replacing files and committing the changes.
