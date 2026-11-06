# Architecture

The game is a static web app: plain HTML, CSS and JavaScript ES modules, with no build step and no dependencies. It runs from any static host (GitHub Pages) and the game rules can be tested in Node.js.

## Folder structure

```
index.html              Page and menu screens (HTML)
manifest.webmanifest    Web app manifest, so it opens full screen from the home screen
css/style.css           Styles for the menus; the game itself is drawn on a canvas
assets/icons/           App icons

src/
  main.js               Entry point: menus, input, game loop, saved progress
  config.js             Game content and tuning: menu, customers, staff, days, difficulty

  core/                 Building blocks with no game logic
    layout.js           Screen positions in logical pixels (180x320)
    i18n.js             Translation lookup
    locales/en.js       English text
    locales/es.js       Spanish text
    audio.js            Sound effects and music with the Web Audio API
    storage.js          Saved progress in localStorage
    rng.js              Seeded random numbers (daily challenge)

  graphics/
    sprites.js          Pixel art: item icons and characters
    draw.js             Drawing primitives shared by every mode

  modes/
    minigames/          Mini-games mode
      run.js            The run engine: lives, speed, phases, input
      render.js         Draws a run: intro, result, speed-up screen, top bar
      scenes.js         Shared scenery (room, table, counter) and random helpers
      games/            One file per mini-game, listed in games/index.js
    chinos/
      chinos.js         Chinos against Blanca: rules, Blanca's call, drawing
    bar/
      game.js           Bar shifts (week and rush hour): rules, no drawing
      renderer.js       Draws the bar: scenery, customers, team, effects, HUD

  ui/
    fullscreen.js       Full-screen helpers
    logo.js             The bar's sign, used on the title screen and the score card
    share.js            Shareable score card image

tests/                  Unit tests (node --test), no browser needed
docs/                   Design notes, architecture and screenshots
```

## Principles

- **Rules and drawing are separate.** `game.js`, `run.js` and the chinos rules never touch the DOM, so they run in Node and are covered by tests. Renderers only read state.
- **Logical pixels.** Everything is drawn in a 180x320 coordinate space. `main.js` scales the canvas to the screen and device pixel ratio, so it stays sharp from phones to tablets.
- **Content lives in data.** Menu items, customers, the team, the days of the week and difficulty are in `config.js`; text is in `core/locales/`. Changing content rarely needs code changes.
- **One mini-game, one file.** Each file in `modes/minigames/games/` exports `{ id, who, create(run) }`. `create` returns an object with `dur`, `update(dt)`, `down(x, y)`, optionally `up` and `move`, and `draw(ctx, now, run, t)`. It sets `result` to `'win'` or `'lose'`. Time is already scaled by the run speed.
- **Events, not callbacks everywhere.** Game logic emits events (`complete`, `miniWin`, `gameover`…); `main.js` turns them into sounds, vibration and screens.

## Adding a mini-game

1. Create `src/modes/minigames/games/<id>.js` exporting the definition.
2. Add it to `src/modes/minigames/games/index.js`.
3. Add `mini.<id>.title` and `mini.<id>.sub` to both locale files.
4. Run `npm test`: the tests check that every mini-game ends without input and has text in both languages.
5. Try it with `?mini=<id>` in the URL.
