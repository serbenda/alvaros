# Contributing

## Workflow

- Work on the `development` branch and open a pull request to `main`.
- Keep commits small and descriptive, in English.
- Code, comments and documentation are in English. Player-facing text lives in `src/core/locales/` in English and Spanish, and both files must have the same keys.

## Before opening a pull request

```bash
npm run check   # syntax check of every module
npm test        # unit tests
npm start       # serve locally on http://localhost:8000 and play it
```

CI runs the same checks on every push and pull request.

## Code style

- ES modules, no build step and no runtime dependencies.
- Two-space indentation, single quotes, semicolons (see `.editorconfig`).
- Game rules never touch the DOM; drawing code only reads state. See `docs/ARCHITECTURE.md`.
