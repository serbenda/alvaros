# Contributing

Thanks for wanting to help with the Álvaro's Gastrobar game! Ideas, bug reports, lines for the team and new mini-games are all welcome.

## Ways to contribute

- **Report a bug**: open an issue with the *Bug report* template, saying the device and browser.
- **Suggest an idea or a mini-game**: open an issue with the *Idea or new mini-game* template. The best mini-games use a single gesture (tap, hold or drag) and something recognisable from the bar.
- **Send code**: fork the repository, make your change and open a pull request (see below).

Please follow the [code of conduct](CODE_OF_CONDUCT.md).

## Workflow

- Work on the `development` branch and open a pull request to `main`. Nothing is committed directly to `main`.
- Keep commits small and descriptive, in English.
- Code, comments and documentation are in English. Player-facing text lives in `src/core/locales/`, in English and Spanish, and both files must have the same keys.

## Before opening a pull request

```bash
npm run check   # syntax check of every module
npm test        # unit tests
npm start       # serve on http://localhost:8000 and play it
```

CI runs the same checks on every push and pull request. The pull request template has a short checklist.

## Adding a mini-game

1. Create `src/modes/minigames/games/<id>.js` exporting `{ id, who, create(run) }`.
2. Add it to `src/modes/minigames/games/index.js`.
3. Add `mini.<id>.title` and `mini.<id>.sub` to both locale files.
4. Run `npm test` and try it with `?mini=<id>` in the URL.
5. Add it to the table in the README.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full contract.

## Code style

- ES modules, no build step and no runtime dependencies.
- Two-space indentation, single quotes, semicolons (see `.editorconfig`).
- Game rules never touch the DOM; drawing code only reads state.
