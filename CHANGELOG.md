# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added
- "A Bendi Studios game": a studio-style credit at the foot of the main menu, with a pixel coffee cup and a different funny line each time; tap it and it fills up and opens GitHub Sponsors. Plus the repository's Sponsor button.
- Friendlier help: Blanca says hello and explains each mode in a colour card; the bar instructions fold away.
- Prize codes on the end screen and a staff page (`verify.html`) to check them at the bar.
- Stickers to collect in the album, with a toast when you earn one and a list on the end screen.
- Blanca comments on every result, and a new record gets a celebration.
- Guided first games: slower, the easiest challenges first and an on-screen instruction.
- Adaptive pace: after a miss the mini-games slow down a little.
- Offline play with a service worker.
- Printable A4 poster with a QR code to the game (`poster.html`).
- Visit and play counter with GoatCounter (`partida/alvaros` events).
- Game-style title menu: big play button, mode cards with icons and records, team strip and toolbar, with the living bar in the background.
- Five new mini-games: stack the cups, shoo the fly, put the football on, catch the tips and open the bar (15 in total).
- Curtain transitions, "just in time" and streak messages, bouncing score, ticking clock and music that speeds up.
- Shareable score card image.
- CI workflow, editor config, architecture notes and locale tests.
- Community files: contributing guide, issue templates (bug, idea or new mini-game), pull request template, code of conduct and security policy.
- Proprietary license (all rights reserved).

### Changed
- Stressed Blanca now grits her teeth with red cheeks and an anger mark; before, the frown and the red tint over her face and hair could look like a moustache.
- Softer bar counter: wide wooden panels with a gradient instead of a grid of bright posts.
- Brighter mini-game scenery: bunting garland, warm wall, pictures, a plant, varied bricks and floor tiles, wooden tables with planks and knots, and a counter with a brass rail.
- The title menu is centred on the screen over a warm, striped backdrop.
- Simpler menu: mini-games and chinos up front, the week, rush hour and the daily challenge folded under "More modes".
- The penalty mini-game is replaced by flipping the tortilla, which fits the bar better.
- The bar is now Álvaro's Gastrobar.
- Code reorganised into `src/` by responsibility, with one file per mini-game and shared drawing helpers.
- Bar redesigned after a photo of the real bar.

## 2026-11-06

### Added
- Mini-games mode with ten one-gesture challenges featuring the whole team.
- Chinos against Blanca.
- A week at Álvaro's: one shift per day with stars, relaxed pace and beginner hints.
- The team at work in the bar: Mari, Andrea, Alejandro and Pepe Nacho, with their own lines.
- Full screen, tablet support and an installable web app manifest.
- First playable version: rush hour, daily challenge, regulars album, English and Spanish.
