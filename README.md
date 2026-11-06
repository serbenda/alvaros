# Rush Hour at Álvaro's

A pixel-art arcade game set in **Álvaro's**, a neighbourhood bar. You play as **Blanca**, the heart of the bar, serving coffees, toasts, beers, tapas and set menus before the regulars run out of patience.

The game is available in **English and Spanish** and runs in any mobile or desktop browser, with nothing to install. It is designed to be shared with a QR code at the bar.

## How to play

1. Customers sit at the bar and show their order in a speech bubble.
2. Tap a station (coffee, juice, toast, beer, tapa, menu) to prepare an item. It goes to the tray when it is ready.
3. Tap a customer to hand over the items on your tray that they ordered.
4. Serve full orders quickly for bigger tips. Chain orders without losing anyone to build a combo multiplier (up to x5).
5. When **Pepe Nacho**, the boss, shows up, tips are doubled for a while.
6. Tap an item on the tray to throw it away.
7. If three customers leave angry, the bar closes. How long can you last?

Keyboard (desktop): `1`–`6` stations, `Q W E R` customers, `Z X C V` tray slots, `P` or `Esc` to pause.

## Features

- **Short, tense shifts** that get harder as the day goes on: breakfast, lunch and afternoon, each with its own menu.
- **Combo multiplier** and a "Blanca on fire!" state for long streaks.
- **The team**: Blanca is always available. Mari, Andrea and Alejandro unlock with the total tips earned, each with a different ability.
- **The boss event**: Pepe Nacho drops by to keep an eye on things. Tips are doubled while he is there.
- **Daily challenge**: the same customers and the same twist for every player on a given day (coffee rush, critics in town, local festival…).
- **Regulars album**: every customer type you meet is added to a collection.
- **Records and sharing**: best score, best score of the day, total tips and a share button.
- Chiptune sound effects and vibration, generated in code. No image or audio files.
- Progress is saved in the browser (`localStorage`).

## The team

| Character | Unlocks at | Ability |
| --- | --- | --- |
| Blanca | From the start | +10% tips. Main character. |
| Mari | 150 total tips | Coffee and juice are ready much faster. |
| Andrea | 400 total tips | Customers wait 25% longer. |
| Alejandro | 800 total tips | Bigger tray: room for 4 items. |
| Pepe Nacho (the boss) | Event | Doubles tips while he is around. |

The current looks are placeholders. Each character's look is defined in `js/config.js` and can be adjusted to match the real people.

## Running locally

The game is a static site with ES modules, so it needs to be served over HTTP (opening `index.html` directly from disk will not load the modules).

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Tests

The game rules live in `js/game.js`, which has no DOM dependencies, so they can be tested with Node.js 18+:

```bash
npm test
```

## Deployment

The site is ready for GitHub Pages: in the repository settings, go to **Pages** and publish from the `main` branch, root folder. The `.nojekyll` file makes sure every file is served as is.

## Project structure

```
index.html          Page, menus and screens
css/style.css       Styles for the menus (the game itself is drawn on a canvas)
js/main.js          Entry point: menus, input, game loop, saving progress
js/game.js          Game state and rules (no drawing, testable in Node)
js/renderer.js      Draws the bar on the canvas
js/sprites.js       Pixel art: item icons and characters
js/config.js        Content and tuning: menu, customers, staff, difficulty, daily twists
js/layout.js        Screen positions in logical pixels (180x320)
js/i18n.js          English and Spanish text
js/audio.js         Sound effects with the Web Audio API
js/storage.js       Saved progress in localStorage
js/rng.js           Seeded random numbers for the daily challenge
tests/              Unit tests for the game rules
docs/               Game design notes
```

## Customising

- **Menu and prices**: `ITEMS`, `STATIONS` and `MENUS` in `js/config.js`.
- **Staff and their looks**: `STAFF` and `BOSS` in `js/config.js`.
- **Catchphrases**: `phrases` in `js/i18n.js`, in both languages.
- **Difficulty**: `DIFFICULTY` and `CUSTOMER_TYPES` in `js/config.js`.

See [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) for the design and the roadmap.
