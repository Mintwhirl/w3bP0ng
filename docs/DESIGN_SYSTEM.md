# W3BP0NG Design System

**Liquid Glass Synthwave Aesthetic**

This document defines the canonical visual language for W3BP0NG. All modes, menus, transitions, and gameplay scenes must follow these guidelines to maintain visual consistency.

---

## 🎨 Aesthetic Baseline

The W3BP0NG experience is built on a **liquid glass synthwave** aesthetic. This creates a cohesive holographic arcade interface where every mode feels like it exists within the same futuristic universe.

### Core Principles

1.  **Deep Cosmic Backgrounds** — Deep gradients with radial light diffusion (e.g., #0b001a → #140033).
2.  **Glassmorphic Surfaces** — Translucent panels with blur, soft edges, and subtle inner/outer glows.
3.  **Neon Accents** — Magenta (#a855f7) and cyan (#22d3ee) edge lighting and shadows.
4.  **Smooth Motion** — Weightless transitions with `cubic-bezier(0.4, 0, 0.2, 1)` easing.
5.  **Layered Depth** — Transparency, backdrop-blur, and layered shadows create spatial depth.
6.  **Consistent Typography** — Orbitron font with neon glow effects.

---

## 🎯 Unified Theme System

**Source of Truth:** `src/theme/UnifiedTheme.ts`  
**Manager:** `src/theme/ThemeManager.ts`  
**CSS Injection:** `src/theme/ThemeCSS.ts`

The theme system handles both **UI (React/HTML)** and **Game (Canvas 2D)** rendering.

### React Components
```tsx
import { useTheme } from '../theme/ThemeManager';

function MyComponent() {
  const theme = useTheme();
  return <div style={{ color: theme.colors.neon_primary }}>...</div>;
}
```

### Vanilla JavaScript / Game Logic
```typescript
import { getActiveTheme, getGameColors } from '../theme/ThemeManager';

const theme = getActiveTheme();
const gameColors = getGameColors(); // Optimized for canvas rendering
```

---

## 🎨 Color System

All colors are available as CSS custom properties prefixed with `--w3b-`.

### Backgrounds & Overlays
| Variable | Value (Sunset) | Description |
|----------|----------------|-------------|
| `--w3b-background-primary` | `#0b001a` | Base background color |
| `--w3b-background-secondary` | `#140033` | Secondary/Gradient end |
| `--w3b-cosmic-overlay` | `rgba(20, 0, 51, 0.8)` | Semi-transparent overlay |

### Neon Accents
| Variable | Value (Sunset) | Description |
|----------|----------------|-------------|
| `--w3b-neon-primary` | `#a855f7` | Magenta - Primary action/brand |
| `--w3b-neon-secondary` | `#22d3ee` | Cyan - Secondary/Information |
| `--w3b-neon-tertiary` | `#8b5cf6` | Soft Violet - Tertiary/Accents |

### Text Colors
| Variable | Value | Description |
|----------|-------|-------------|
| `--w3b-text-primary` | `#ffffff` | Headings and primary text |
| `--w3b-text-secondary` | `#c084fc` | Subtitles and highlighted text |
| `--w3b-text-tertiary` | `rgba(255, 255, 255, 0.7)` | Dimmed/secondary information |

### Glass Surface Tokens
| Variable | Value | Description |
|----------|-------|-------------|
| `--w3b-glass-highlight` | `rgba(255, 255, 255, 0.15)` | Top-left specular highlight |
| `--w3b-glass-base` | `rgba(255, 255, 255, 0.05)` | Surface fill opacity |
| `--w3b-glass-border` | `rgba(255, 255, 255, 0.2)` | Panel border opacity |

---

## 🌈 Gradients

Gradients are used for backgrounds, edges, and overlays.

| Variable | Description |
|----------|-------------|
| `--w3b-gradient-background-main` | Linear vertical gradient for background |
| `--w3b-gradient-background-radial` | Radial glow from the center |
| `--w3b-gradient-glass-overlay` | 135deg gradient for glass surfaces |
| `--w3b-gradient-neon-edge-primary` | Horizontal fade-in/out neon line (Magenta) |
| `--w3b-gradient-neon-edge-secondary` | Horizontal fade-in/out neon line (Cyan) |

---

## 🪩 Glassmorphism Utilities

Use predefined CSS classes from `src/styles/glassmorphism.css`:

### Panel Variants
```tsx
// Standard glass panel (Menu cards, large UI)
<div className="glass-panel">Content</div>

// Elevated (Modals, overlays, active elements)
<div className="glass-elevated">Modal content</div>

// Subtle (HUD elements, small badges)
<div className="glass-subtle">HUD stats</div>
```

### Neon Accent Variants (Glows)
Add these to any glass panel for specific colored glows:
- `.glass-neon-magenta`
- `.glass-neon-cyan`
- `.glass-neon-violet`

### Interactive Elements
```tsx
// Scales and glows on hover
<div className="glass-panel glass-interactive">Hover me</div>

// Standard button with theme font and glow
<button className="glass-button">Click me</button>

// Primary action button (Magenta themed)
<button className="glass-button glass-button-primary">Start Game</button>
```

---

## 📐 Layout & Spacing

### Spacing Tokens
Reference via `theme.spacing.*` or `--w3b-spacing-*`.

- `xs`: `0.25rem` (4px)
- `sm`: `0.5rem` (8px)
- `md`: `1rem` (16px)
- `lg`: `1.5rem` (24px)
- `xl`: `2rem` (32px)
- `2xl`: `3rem` (48px)
- `3xl`: `4rem` (64px)

### Border Radius
Reference via `theme.borderRadius.*` or `--w3b-radius-*`.

- `sm`: `8px`
- `md`: `12px`
- `lg`: `16px`
- `xl`: `20px`
- `2xl`: `24px`
- `full`: `9999px`

### Blur Tokens
Reference via `theme.blur.*` or `--w3b-blur-*`.

- `subtle`: `4px`
- `normal`: `8px`
- `medium`: `10px`
- `strong`: `16px`
- `intense`: `24px`

---

## ✨ Typography

### Font Family
- **Primary:** `Orbitron`, `Courier New`, monospace (Used for UI, Headings, Numbers)
- **Fallback:** `Courier New`, monospace

### Text Glow Effects
| Class | Effect |
|-------|--------|
| `.text-glow-primary` | White text with Magenta glow |
| `.text-glow-subtle` | White text with soft Magenta glow |
| `.text-glow-cyan` | Cyan text with Cyan glow |
| `.text-glow-violet` | Soft violet text with Violet glow |

### Heading Sizes
- `heading_xl`: `3rem` (Mode titles, Victory screen)
- `heading_lg`: `2rem` (Section headers, Menu titles)
- `heading_md`: `1.5rem` (Card titles, HUD labels)
- `body_lg`: `1.125rem` (Primary body text)
- `body_md`: `1rem` (Secondary body text)
- `body_sm`: `0.875rem` (Tertiary text, labels)

---

## 🎞️ Motion & Transitions

### Easing Curves
- **Default:** `cubic-bezier(0.4, 0, 0.2, 1)` (`--w3b-ease`)
- **Ease-In:** `cubic-bezier(0.4, 0, 1, 1)` (`--w3b-ease-in`)
- **Ease-Out:** `cubic-bezier(0, 0, 0.2, 1)` (`--w3b-ease-out`)

### Durations
- `fast`: `0.2s`
- `normal`: `0.3s`
- `slow`: `0.5s`
- `transition`: `0.8s` (Mode switches)

### Animation Classes
| Class | Description |
|-------|-------------|
| `.animate-float` | Gentle vertical oscillation (3s) |
| `.animate-fadeIn` | Smooth opacity entrance (0.8s) |
| `.animate-fadeOut` | Smooth opacity exit (0.8s) |
| `.animate-slideUp` | Fade in and move up (0.5s) |
| `.animate-pulseGlow` | Pulsing drop-shadow glow (2s) |

---

## 🎮 Game Rendering Layer (Canvas)

When rendering inside the canvas, use `theme.game` tokens to ensure consistency with the UI.

### Paddle & Ball
- `theme.game.paddle_left.color`
- `theme.game.paddle_right.color`
- `theme.game.ball.color`
- `theme.game.ball.trail` (RGBA for fading effects)

### Power-Ups
- `theme.game.powerUp.bigPaddle`: Blue (#3b82f6)
- `theme.game.powerUp.fastBall`: Red (#ef4444)
- `theme.game.powerUp.multiBall`: Amber (#f59e0b)
- `theme.game.powerUp.shield`: Green (#10b981)

---

## 🌌 Background Effects

### Cosmic Background
Use the `.cosmic-bg` class for full-screen backgrounds. It applies the theme gradient and a radial center glow.

### Particle Systems
Controlled via `theme.particles.*` and rendered in `ParticleBackground.tsx`.
- **Background:** Sparse, high-opacity particles for depth.
- **Ambient:** Dense, low-opacity particles for atmosphere.

---

## 🎮 HUD Components

Pre-built components in `src/ui/GlassHUD.tsx`:

### GlassPanel
```tsx
import { GlassPanel } from '@ui/GlassHUD';

<GlassPanel variant="panel" neonAccent="magenta">...</GlassPanel>
```

### ScoreDisplay
```tsx
<ScoreDisplay label="SCORE" value={100} position="left" />
```

### AchievementToast
Found in `src/ui/AchievementToast.tsx`. Uses `glass-elevated` and `animate-slideUp`.

---

## ♿ Accessibility: High Contrast Mode

W3BP0NG includes a high-contrast mode for improved accessibility.

- **Class:** `.high-contrast` applied to root.
- **Behavior:**
  - Backgrounds become solid black.
  - Borders become solid 2px white.
  - Text glows and blurs are disabled.
  - Interactive elements use solid colors (White/Black).

---

## 🔄 Mode Transitions

Use `ModeTransition` component for smooth fades between modes:

```tsx
import ModeTransition from '@ui/ModeTransition';

<ModeTransition mode={currentMode} duration={800}>
  <ModeComponent />
</ModeTransition>
```

---

## 🎨 Mode-Specific Color Palettes

Each mode has a designated theme in the `UnifiedTheme` system:

- **Menu / Classic**: `liquid-glass-sunset` (Magenta/Violet/Cyan)
- **Arctic**: `arctic-glass` (Blue/Ice/Cyan)
- **Puzzle Logic**: `puzzle-logic` (Green/Amber/Emerald)
- **High Contrast**: `high-contrast` (Black/White/Yellow)

---

## 🚀 Quick Reference: Common Tokens

| Element | Class / Variable |
|---------|------------------|
| **Background** | `.cosmic-bg` |
| **Panel** | `.glass-panel` |
| **Glow Text** | `.text-glow-primary` |
| **Action Button** | `.glass-button-primary` |
| **Magenta Color** | `var(--w3b-neon-primary)` |
| **Cyan Color** | `var(--w3b-neon-secondary)` |
| **Standard Radius** | `var(--w3b-radius-lg)` |
| **Standard Ease** | `var(--w3b-ease)` |
| **Standard Blur** | `var(--w3b-blur-normal)` |

---

## ✅ Design Checklist for New Features

- [ ] Does it use `useTheme()` for colors?
- [ ] Are all UI containers using a `.glass-*` utility class?
- [ ] is Orbitron font applied to headings?
- [ ] Are transitions using `var(--w3b-ease)`?
- [ ] Does it look good in **High Contrast** mode?
- [ ] Are interactive elements using `.glass-interactive` or `.glass-button`?
