# Repository Guidelines

This guide helps contributors work effectively in this project.

## Project Structure & Modules
- Source code: `src/` organized by domain: `engine/`, `rendering/`, `audio/`, `ai/`, `modes/`, `powerups/`, `ui/`, `hooks/`, `utils/`.
- Entry points: `src/App.tsx`, `src/main.jsx`; public assets in `public/`.
- Tests: `src/__tests__/` and per‑module `__tests__/` folders (e.g., `src/engine/__tests__/`).
- Build output: `dist/`. Config: `vite.config.ts`, `vitest.config.ts`, `tsconfig*.json`, `eslint.config.js`.

## Build, Test, and Development
- `npm run dev` — Start Vite dev server.
- `npm run build` — Production build to `dist/`.
- `npm run preview` — Serve built app locally.
- `npm run lint` — ESLint across repo.
- `npm run type-check` — TypeScript check (no emit).
- `npm run test` / `test:ui` — Run Vitest (CLI or UI).
- `npm run test:coverage` — Generate coverage (v8 provider).
- Useful: `npm run analyze`, `npm run optimize`, `npm run build:strict`.

## Coding Style & Naming
- Language: TypeScript preferred (`.ts/.tsx`); ESM imports; React functional components.
- Indentation: 2 spaces; include semicolons; single quotes or project default.
- Exports: favor named exports; colocate types in `types.ts` where applicable.
- Paths: use aliases (e.g., `@engine/...`, `@utils/...`).
- If editing mirrored `.js` files, keep TS/JS behavior aligned.

## Testing Guidelines
- Framework: Vitest + Testing Library (`jsdom` env, setup in `src/test/setup.ts`).
- Naming: `*.test.ts`, `*.test.tsx` (or `.js/.jsx`) under `src/__tests__/` or module `__tests__/`.
- Aim to maintain coverage (`npm run test:coverage`); prefer pure logic tests for `engine/` and `utils/`.

## Commit & Pull Requests
- Commit style: Conventional Commits (e.g., `feat:`, `fix:`, `docs:`, `chore:`). Emojis are allowed but optional.
- PR checklist:
  - Clear description, scope, and rationale; link issues.
  - Include screenshots/GIFs for UI changes.
  - Run and pass: `lint`, `type-check`, `test:coverage`, and a local `build`.
  - Keep PRs focused and small where possible.

## Security & Configuration
- Do not commit secrets. Use `.env.local`; see `.env.example` for keys.
- Deployment targets: Vercel (`vercel.json`) and GitHub Pages (`scripts/deploy-simple.js`). Build locally before deploying.

## Architecture Notes
- Core game logic is in `engine/` (pure, testable). Rendering lives in `rendering/`; audio in `audio/`; game modes in `modes/`.
- Prefer pure functions for physics/AI; UI integrates via React components in `ui/`.

