# W3BP0NG Design System

**Liquid Glass Synthwave Aesthetic**

This document defines the canonical visual language for W3BP0NG. All modes, menus, transitions, and gameplay scenes must follow these guidelines to maintain visual consistency.

---

## 🎨 Aesthetic Baseline

The W3BP0NG experience is built on a **liquid glass synthwave** aesthetic inspired by the main menu. This creates a cohesive holographic arcade interface where every mode feels like it exists within the same futuristic universe.

### Core Principles

1. **Deep Cosmic Backgrounds** — Violet-blue gradients (#0b001a → #140033) with subtle light diffusion
2. **Glassmorphic Surfaces** — Translucent panels with blur, soft edges, and subtle glows
3. **Neon Accents** — Magenta (#a855f7) and cyan (#22d3ee) edge lighting
4. **Smooth Motion** — Weightless transitions with cubic-bezier easing
5. **Layered Depth** — Transparency, blur, and shadow create spatial depth
6. **Consistent Typography** — Orbitron font with subtle neon glow

---

## 🎯 Theme Configuration

**Import the theme:** `w3bp0ng-theme.config.js`

```javascript
import { W3BP0NG_THEME } from './w3bp0ng-theme.config.js';
```

All design tokens (colors, spacing, motion, gradients) are defined in this file. **Never hardcode values** — always reference the theme configuration.

---

## 🎨 Color System

### Background Colors
```css
--w3b-bg-primary-dark: #0b001a
--w3b-bg-primary-light: #140033
--w3b-bg-cosmic-overlay: rgba(20, 0, 51, 0.8)
```

### Neon Accents
```css
--w3b-accent-neon: #a855f7      /* Magenta - Primary */
--w3b-accent-cyan: #22d3ee       /* Cyan - Secondary */
--w3b-accent-violet: #8b5cf6     /* Soft Violet */
```

### Text Colors
```css
--w3b-text-primary: #ffffff
--w3b-text-secondary: #c084fc    /* Soft violet */
--w3b-text-tertiary: rgba(255, 255, 255, 0.7)
```

### Glass Surface Layers
```css
--w3b-glass-highlight: rgba(255, 255, 255, 0.15)
--w3b-glass-base: rgba(255, 255, 255, 0.05)
--w3b-glass-border: rgba(255, 255, 255, 0.2)
```

**Usage Example:**
```tsx
<div style={{ background: W3BP0NG_THEME.colors.glass_base }}>
  Glass panel content
</div>
```

---

## 🪩 Glassmorphism Utilities

Use predefined CSS classes from `src/styles/glassmorphism.css`:

### Panel Variants
```tsx
import 'src/styles/glassmorphism.css';

// Standard glass panel
<div className="glass-panel">Content</div>

// Elevated (modals, overlays)
<div className="glass-elevated">Modal content</div>

// Subtle (HUD elements)
<div className="glass-subtle">HUD stats</div>
```

### Neon Accent Variants
```tsx
// Add neon glow to panels
<div className="glass-panel glass-neon-magenta">Magenta glow</div>
<div className="glass-panel glass-neon-cyan">Cyan glow</div>
<div className="glass-panel glass-neon-violet">Violet glow</div>
```

### Interactive Elements
```tsx
// Buttons with hover effects
<button className="glass-button">Click me</button>
<button className="glass-button glass-button-primary">Primary action</button>

// Generic interactive elements
<div className="glass-panel glass-interactive">
  Hover for scale + glow
</div>
```

---

## 📐 Layout & Spacing

Use consistent spacing values from the theme:

```javascript
W3BP0NG_THEME.spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
}
```

```tsx
<div style={{ padding: W3BP0NG_THEME.spacing.lg }}>
  Consistent padding
</div>
```

---

## ✨ Typography

### Font Family
```css
font-family: 'Orbitron', 'Courier New', monospace;
```

### Text Glow Effects
```tsx
// Primary glow (magenta)
<h1 className="text-glow-primary">Heading</h1>

// Subtle glow
<p className="text-glow-subtle">Subtitle</p>

// Cyan glow
<span className="text-glow-cyan">Value: 42</span>

// Violet glow
<span className="text-glow-violet">Secondary text</span>
```

### Heading Sizes
```javascript
heading_xl: '3rem',      // Mode titles
heading_lg: '2rem',      // Section headers
heading_md: '1.5rem',    // Card titles
body_lg: '1.125rem',     // Primary text
body_md: '1rem',         // Secondary text
body_sm: '0.875rem',     // Tertiary text
```

---

## 🎞️ Motion & Transitions

All animations use the same easing curve for consistency:

```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Animation Classes
```tsx
// Float effect (3s infinite)
<div className="animate-float">Floating element</div>

// Fade in (0.8s)
<div className="animate-fadeIn">Fade in on mount</div>

// Slide up (0.5s)
<div className="animate-slideUp">Slide up entrance</div>

// Pulse glow (2s infinite)
<div className="animate-pulseGlow">Pulsing glow</div>
```

### Transition Utilities
```tsx
// Smooth transition (0.3s)
<div className="transition-smooth">Hover me</div>

// Slow transition (0.5s)
<div className="transition-slow">Slower change</div>

// Mode transition (0.8s)
<div className="transition-mode">Mode switch fade</div>
```

### Hover Effects
Standard hover behavior:
- **Scale:** 1.03
- **Brightness:** 1.1
- **Glow intensity:** 1.5x

```tsx
<div className="glass-interactive">
  Scales to 1.03 and glows on hover
</div>
```

---

## 🌌 Particle & Background Effects

### Cosmic Background
```tsx
<div className="cosmic-bg">
  {/* Deep violet-blue gradient + radial glow */}
</div>
```

This applies:
- Linear gradient: #0b001a → #140033
- Radial glow overlay centered at 50% 50%

### Particle Systems
Defined in `W3BP0NG_THEME.particles`:

**Background particles:**
- Count: 50
- Opacity: 0.3–0.9
- Size: 1–3px
- Blur: 2px
- Blend mode: screen

**Ambient particles:**
- Count: 100
- Opacity: 0.1–0.5
- Size: 0.5–2px
- Blur: 1px
- Blend mode: screen

Use `ParticleBackground.tsx` component from the main menu as reference.

---

## 🎮 HUD Components

Import pre-built HUD components from `src/ui/GlassHUD.tsx`:

### Glass Panel
```tsx
import { GlassPanel } from '@ui/GlassHUD';

<GlassPanel variant="panel" neonAccent="magenta">
  Content
</GlassPanel>
```

**Variants:** `panel`, `elevated`, `subtle`
**Neon accents:** `magenta`, `cyan`, `violet`, `none`

### Score Display
```tsx
import { ScoreDisplay } from '@ui/GlassHUD';

<ScoreDisplay
  label="SCORE"
  value={1234}
  neonAccent="magenta"
  position="left"
/>
```

**Positions:** `left`, `right`, `center`

### Timer Display
```tsx
import { TimerDisplay } from '@ui/GlassHUD';

<TimerDisplay
  time={120}
  label="TIME"
  format="mm:ss"
/>
```

**Formats:** `seconds`, `mm:ss`, `ms`

### Progress Bar
```tsx
import { ProgressBar } from '@ui/GlassHUD';

<ProgressBar
  value={75}
  max={100}
  label="Health"
  color="cyan"
  showPercentage={true}
/>
```

### Glass Button
```tsx
import { GlassButton } from '@ui/GlassHUD';

<GlassButton variant="primary" onClick={handleClick}>
  Start Game
</GlassButton>
```

**Variants:** `primary`, `secondary`

### Pause Overlay
```tsx
import { PauseOverlay } from '@ui/GlassHUD';

<PauseOverlay
  onResume={() => setPaused(false)}
  onExit={() => returnToMenu()}
  title="PAUSED"
/>
```

### Stats Display
```tsx
import { StatsDisplay } from '@ui/GlassHUD';

<StatsDisplay
  title="STATS"
  position="top-right"
  stats={[
    { label: 'Accuracy', value: '94%' },
    { label: 'Combo', value: 'x12' },
    { label: 'Speed', value: '1.5x' },
  ]}
/>
```

---

## 🔄 Mode Transitions

Use `ModeTransition` component for smooth fades between modes:

```tsx
import ModeTransition from '@ui/ModeTransition';

<ModeTransition mode={currentMode} duration={800}>
  <ModeComponent />
</ModeTransition>
```

**Features:**
- Smooth cross-fade (default 800ms)
- Preserves cosmic background and particles
- No hard cuts or black screens
- Uses cubic-bezier easing

---

## 🧩 UX Continuity Guidelines

### When Creating New Modes

1. **Import theme configuration**
   ```tsx
   import { W3BP0NG_THEME } from '../w3bp0ng-theme.config.js';
   import '../styles/glassmorphism.css';
   ```

2. **Use cosmic background**
   ```tsx
   <div className="cosmic-bg">
     {/* Your mode content */}
   </div>
   ```

3. **Apply glassmorphism to all UI**
   - Menus: `glass-panel` or `glass-elevated`
   - HUD: `glass-subtle`
   - Buttons: `glass-button`

4. **Match lighting and glow**
   - Use only theme colors (#a855f7, #22d3ee, #8b5cf6)
   - Apply `text-glow-*` classes to text
   - Add `glass-neon-*` for panel accents

5. **Consistent motion**
   - Always use `cubic-bezier(0.4, 0, 0.2, 1)`
   - Apply `transition-smooth` or `transition-slow`
   - Use predefined animations (`animate-float`, `animate-fadeIn`, etc.)

6. **Preserve depth**
   - Layer UI with `z-index` from `W3BP0NG_THEME.zIndex`
   - Use blur and transparency for depth perception
   - Avoid harsh borders or solid backgrounds

7. **Typography consistency**
   - Use Orbitron for headings and UI
   - Apply text glow effects
   - Follow size hierarchy from theme

---

## 🎨 Mode-Specific Color Palettes

While maintaining the core aesthetic, each mode has a designated theme:

- **Menu**: Synthwave Sunset (magenta/violet)
- **Classic**: Synthwave Sunset (magenta/violet)
- **Physics Puzzle**: Puzzle Logic (green/amber)
- **Rhythm**: Rhythm Beats (neon blue/cyan)
- **Battle Royale**: Battle Intensity (red/orange)
- **Level Editor**: Editor Pro (cool gray/blue)

**Important:** Mode-specific palettes should still use the same glassmorphism, blur, and motion patterns. Only primary accent colors change.

---

## ✅ Design Checklist for New Modes

Before completing a new mode, verify:

- [ ] Cosmic background applied (`cosmic-bg`)
- [ ] All UI uses glass panel classes
- [ ] Typography uses Orbitron with text glow
- [ ] Transitions use cubic-bezier easing
- [ ] Hover effects scale to 1.03 and add glow
- [ ] Colors reference theme configuration
- [ ] HUD elements use pre-built components
- [ ] Particles maintain slow drift speed
- [ ] No harsh lighting or solid backgrounds
- [ ] Spacing uses theme tokens
- [ ] Visual comparison to MainMenu shows consistency

---

## 📦 Import Examples

### Complete Mode Setup

```tsx
import { useRef, useEffect, useState } from 'react';
import { W3BP0NG_THEME } from '../w3bp0ng-theme.config.js';
import { useTheme } from '@hooks/useTheme';
import { useGameStore } from '@hooks/useGameStore';
import {
  GlassPanel,
  ScoreDisplay,
  GlassButton,
  PauseOverlay,
} from '@ui/GlassHUD';
import '../styles/glassmorphism.css';

export function MyNewMode() {
  const theme = useTheme(); // Auto-switches to mode theme
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);

  return (
    <div className="cosmic-bg" style={{ width: '100vw', height: '100vh' }}>
      {/* HUD */}
      <ScoreDisplay label="SCORE" value={score} position="left" />

      {/* Game content */}
      <GlassPanel
        variant="elevated"
        neonAccent="magenta"
        className="animate-slideUp"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: W3BP0NG_THEME.spacing.xl,
        }}
      >
        <h1 className="text-glow-primary">My New Mode</h1>
        <GlassButton variant="primary" onClick={() => {}}>
          Start
        </GlassButton>
      </GlassPanel>

      {/* Pause overlay */}
      {paused && (
        <PauseOverlay
          onResume={() => setPaused(false)}
          onExit={() => useGameStore.getState().returnToMenu()}
        />
      )}
    </div>
  );
}
```

---

## 🚀 Quick Reference

| Element | Class/Component | Usage |
|---------|----------------|-------|
| Background | `cosmic-bg` | Full-screen cosmic gradient |
| Panel | `glass-panel` | Standard UI container |
| Elevated panel | `glass-elevated` | Modals, important UI |
| Subtle panel | `glass-subtle` | HUD elements |
| Button | `glass-button` | Interactive buttons |
| Primary button | `glass-button-primary` | Call-to-action |
| Text glow | `text-glow-primary` | Headings with magenta glow |
| Cyan glow | `text-glow-cyan` | Values with cyan glow |
| Float animation | `animate-float` | Gentle vertical motion |
| Fade in | `animate-fadeIn` | Entrance animation |
| Slide up | `animate-slideUp` | Bottom-to-top entrance |
| Pulse glow | `animate-pulseGlow` | Attention-grabbing glow |
| Smooth transition | `transition-smooth` | 0.3s transitions |
| Interactive | `glass-interactive` | Hover scale + glow |

---

## 🎯 Summary

> Every new mode should feel like it's opening *inside* the same holographic synthwave arcade interface — not a separate game. The user must never feel a visual transition or tonal break between the Main Menu and the new mode.

**Core mantra:** Consistent colors, consistent motion, consistent depth, consistent glow.

Follow this design system religiously, and W3BP0NG will maintain its cohesive, professional, AAA indie game aesthetic across all modes.
