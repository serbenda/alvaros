# Rush Hour at Álvaro's

A pixel-art arcade game set in **Álvaro's**, a neighbourhood bar. You play as **Blanca**, the heart of the bar, serving coffees, toasts, beers, tapas and set menus before the regulars run out of patience.

The game is available in **English and Spanish** and runs in any mobile or desktop browser, with nothing to install. It is designed to be shared with a QR code at the bar.

## How to play

1. Customers sit at the bar and show what they want in a speech bubble.
2. Tap a station (coffee, juice, toast, beer, tapa, menu) to prepare it. When it is ready it goes to the tray.
3. Tap the customer to hand it over. A customer you can serve glows green.
4. Serve quickly for bigger tips, and chain orders to build a combo multiplier.

Keyboard (desktop): `1`–`6` stations, `Q W E R` customers, `Z X C V` tray slots, `P` or `Esc` to pause.

## Game modes

- **A week at Álvaro's** (main mode, for everyone): one shift per day, from Monday to Sunday. Monday only has coffee and toast and a pointing hand shows what to tap; each day adds new items and a bit more pace. Shifts always end (90–120 seconds), customers who get tired just leave without a tip, and each day earns 1 to 3 stars. One star opens the next day.
- **Rush hour** (competitive): endless, with 3 lives and a growing pace. Pepe Nacho, the boss, shows up and doubles the tips for a while.
- **Daily challenge**: rush hour with the same customers and the same twist for every player on a given day.

## Features

- Designed to be fun for children and older players: relaxed pace, no losing on weekdays, visual hints and big, clear buttons.
- Live bar scene based on the real Álvaro's: white walls, light wood, mustard and mauve armchairs, copper lamps, sunflowers, a TV with football and a window onto the street.
- Customers walk in, enjoy their order at the counter and walk out; dishes fly from the tray; machines fill up while preparing.
- **The team at work**: Mari, Andrea, Alejandro and the boss Pepe Nacho appear in the bar and help in their own way.
- **Goals on TV**: the customers cheer and get a bit more patient.
- Cheerful background music.
- Regulars album, records, total tips and a share button.
- English and Spanish, chiptune sound effects and vibration, all generated in code.
- Progress is saved in the browser (`localStorage`).

## The team

You play as **Blanca**, the heart of the bar. The rest of the team works alongside her:

| Character | Role in the game |
| --- | --- |
| Blanca | The player. Prepares and serves everything. |
| Mari | Goes between the coffee machine and the counter: coffee and juice come out faster. |
| Andrea | Looks after the customers: now and then she chats with the one who has waited longest and gives them back patience. |
| Alejandro | Strolls around checking his gold watch and now and then takes a dish from Blanca's tray to the customer who ordered it. |
| Pepe Nacho | The boss. He comes in often, strolls around with his clipboard and, while he is there, tips are doubled. |

Everyone is in the bar every day, moving around and doing their things.

The looks are placeholders except for what we know: Blanca is blonde, Alejandro wears a gold watch and Pepe Nacho has black hair. They are defined in `js/config.js` (`PLAYER`, `HELPERS` and `BOSS`).

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
- **The team and their looks**: `PLAYER`, `HELPERS` and `BOSS` in `js/config.js`.
- **Catchphrases**: `phrases` in `js/i18n.js`, in both languages.
- **Days of the week and star targets**: `WEEK` in `js/config.js`.
- **Rush hour difficulty**: `DIFFICULTY` and `CUSTOMER_TYPES` in `js/config.js`.

See [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) for the design and the roadmap.
