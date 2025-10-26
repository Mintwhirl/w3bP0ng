# Task: ModeFrame Layout Refactor

Summary
- Refactor layout by introducing a `ModeFrame` wrapper component for full‑bleed game views instead of toggling the `.App` full‑bleed flag.
- Purpose: unify layout across all modes and prepare for mobile adaptation (safe area, aspect ratio, orientation, scaling).

Motivation
- Current solution applies a full‑bleed state to `.App`, which couples page chrome with in‑game layout.
- A dedicated wrapper makes in‑game constraints explicit, reduces CSS coupling, and simplifies future mobile work.

Proposed Design
- New component: `src/ui/ModeFrame.tsx`
  - Provides full‑viewport container; centers canvas; manages overflow; exposes slots for HUD overlays.
  - Props: `children`, `className`, optional `backgroundClass` (e.g., `cosmic-bg`).
  - Applies positioning/z‑index to ensure HUD overlays always render above the canvas.
- Modes wrap their content with `<ModeFrame>...</ModeFrame>` and remove local container hacks.
- App keeps `.App` as standard card layout for menus/settings; modes do not rely on `.App` layout state.

Acceptance Criteria
- All five modes render inside `ModeFrame` and occupy 100vw/100vh without relying on `.App.full-bleed`.
- HUD overlays remain correctly layered; no clipping.
- No regressions in transitions (ModeTransition) or SettingsPanel layering.
- Mobile prep: `ModeFrame` exposes a CSS hook for safe‑area insets and orientation messaging.

Implementation Steps
- Create `src/ui/ModeFrame.tsx` with minimal CSS (inline or `glassmorphism.css` hook):
  - Wrapper div: fixed, top/left 0, width/height 100vw/100vh, overflow hidden.
  - Inner stage: absolute centered transform for canvas; responsive max‑width/max‑height.
- Update each mode component to wrap its canvas/HUD in `ModeFrame`.
- Update `src/App.tsx` to stop adding `.App.full-bleed` once all modes are migrated.
- Light test pass locally (dev + build).

Risks / Notes
- Ensure `ModeTransition` reads/writes opacity on `ModeFrame` or an outer wrapper.
- SettingsPanel should remain above `ModeFrame` via z‑index.

Tracking
- Label: `mek`
- Branch: `feature/modeframe-refactor`
- PR title: `mek: ModeFrame layout refactor for full‑bleed modes`
