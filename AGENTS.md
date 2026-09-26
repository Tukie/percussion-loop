# Repository Guidelines

## Project Structure & Module Organization

This is a Vue 3 percussion sequencer built with Vite. `src/views/HomeView.vue` renders the main screen; reusable controls live in `src/components/`. `src/composable/usePercussionLoop.js` connects the view to the playback controller in `src/controllers/` and storage, sampler, and key mapping services in `src/services/`. Shared Vue behavior also lives in `src/composable/`; routes are in `src/router/`. Styles and images belong in `src/assets/`, audio samples in `public/`, and tests in `tests/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server.
- `npm run build`: create the production bundle in `dist/`.
- `npm test`: run the Node test suite in `tests/`.
- `npm run preview`: serve that bundle locally for a final check.
- `npm run lint`: run ESLint with automatic fixes; review the resulting diff.
- `npm run format`: format files under `src/` with Prettier.

## Coding Style & Naming Conventions

Use two-space indentation, LF line endings, and a final newline, as configured in `.editorconfig`. Prettier specifies single quotes, no semicolons, and a 100-character print width. Follow the existing Vue single-file component pattern and use PascalCase names for components and views (for example, `BPMControl.vue`). Name services `*.service.js` or `*.service.ts`, controllers `*.controller.js`, composables `use*.js`, and variables and functions in camelCase. Use the `@/` alias for imports from `src/`.

## Testing Guidelines

Write `*.test.js` files in `tests/` for pure services and run them with `npm test`. Run `npm run build` after changes, then check affected behavior in the browser with `npm run dev`. For audio or sequence changes, verify playback, tempo changes, and saving/loading sequences; browser audio starts after user interaction.

## Commit & Pull Request Guidelines

Recent commits use short summaries, either imperative descriptions (`Add new tempo service for BPM management`) or prefixes such as `feat:` and `chore:`. Keep each commit focused and describe the user-visible change. In a pull request, summarize the behavior changed, list the checks you ran, link a relevant issue when one exists, and include screenshots for UI changes or reproduction steps for audio behavior.
