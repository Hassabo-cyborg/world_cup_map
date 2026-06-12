# V10.8 Final UX Fix

This build fixes the three major UX problems:

1. Stadium detail cards are now tethered to the selected stadium point on desktop.
   - The card repositions when the map moves/zooms.
   - A visual tether line connects the stadium point to the card.
   - On mobile, the card becomes a bottom sheet and the stadium point remains selected/visible above it.

2. The bracket is rebuilt into a professional round-tab layout.
   - One round is shown at a time.
   - Cards look like scoreboard/bracket matchups.
   - Clicking a match opens a detail panel.
   - Detail panel has a Show on map action.

3. Mobile is refocused on the main product.
   - Map, stadium points, match cards, location, teams, kickoff, score.
   - Secondary legend/map controls are hidden on mobile.
   - Stadium card removes decorative image strip and capacity stats on mobile to make room for the match list.
   - Match lists inside stadium cards scroll safely.
