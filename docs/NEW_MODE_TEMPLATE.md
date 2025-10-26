# New Game Mode Template

**Quick start guide for implementing new W3BP0NG game modes**

Use this template to ensure design system compliance.

---

## 📋 Required Imports

```tsx
// Theme configuration
import { W3BP0NG_THEME } from '../w3bp0ng-theme.config.js';

// Hooks
import { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useGameStore } from '@hooks/useGameStore';

// HUD Components (choose what you need)
import {
  GlassPanel,
  ScoreDisplay,
  TimerDisplay,
  ProgressBar,
  GlassButton,
  PauseOverlay,
  StatsDisplay,
} from '@ui/GlassHUD';

// Styles (REQUIRED)
import '../styles/glassmorphism.css';

// Engine modules (as needed)
import { GameRenderer } from '@rendering/GameRenderer';
import { AudioManager } from '@audio/AudioManager';
```

---

## 🎮 Mode Component Template

```tsx
/**
 * [ModeName] Component
 * [Brief description of gameplay]
 */

import { W3BP0NG_THEME } from '../w3bp0ng-theme.config.js';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from '@hooks/useTheme';
import { useGameStore } from '@hooks/useGameStore';
import {
  GlassPanel,
  ScoreDisplay,
  GlassButton,
  PauseOverlay,
} from '@ui/GlassHUD';
import '../styles/glassmorphism.css';

// Game state interface
interface ModeGameState {
  // Define your game-specific state
  score: number;
  level: number;
  // ... other state
}

export function ModeName() {
  // ═══════════════════════════════════════════════════════════
  // GLOBAL STATE & THEME
  // ═══════════════════════════════════════════════════════════
  const theme = useTheme(); // Auto-switches to mode theme
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const returnToMenu = useGameStore((state) => state.returnToMenu);

  // ═══════════════════════════════════════════════════════════
  // GAME STATE (useRef for performance, useState for UI)
  // ═══════════════════════════════════════════════════════════
  const gameStateRef = useRef<ModeGameState>({
    score: 0,
    level: 1,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // REFS FOR MODULES
  // ═══════════════════════════════════════════════════════════
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize renderer
    rendererRef.current = new GameRenderer(canvasRef.current, theme);

    // Initialize audio
    audioManagerRef.current = new AudioManager(soundEnabled);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [theme, soundEnabled]);

  // ═══════════════════════════════════════════════════════════
  // GAME LOOP
  // ═══════════════════════════════════════════════════════════
  const gameLoop = useCallback(() => {
    if (paused) return;

    // Update game state
    updateGame();

    // Render
    renderGame();

    // Continue loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [paused]);

  const updateGame = () => {
    // Game logic here
  };

  const renderGame = () => {
    if (!rendererRef.current) return;
    // Rendering logic here
  };

  // ═══════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════
  const handleStart = () => {
    setGameStarted(true);
    setPaused(false);
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const handlePause = () => {
    setPaused(true);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleResume = () => {
    setPaused(false);
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const handleExit = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    returnToMenu();
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div
      className="cosmic-bg"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />

      {/* HUD */}
      {gameStarted && (
        <>
          <ScoreDisplay
            label="SCORE"
            value={gameStateRef.current.score}
            position="left"
            neonAccent="magenta"
          />
          {/* Add more HUD elements as needed */}
        </>
      )}

      {/* Start Screen */}
      {!gameStarted && (
        <GlassPanel
          variant="elevated"
          neonAccent="magenta"
          className="animate-slideUp"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: W3BP0NG_THEME.spacing['2xl'],
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: W3BP0NG_THEME.spacing.xl,
            minWidth: '400px',
          }}
        >
          <h1
            className="text-glow-primary"
            style={{
              fontSize: W3BP0NG_THEME.typography.sizes.heading_xl,
              fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
              margin: 0,
              letterSpacing: '0.1em',
            }}
          >
            MODE NAME
          </h1>

          <p
            className="text-glow-subtle"
            style={{
              fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
              fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
              textAlign: 'center',
              margin: 0,
            }}
          >
            Mode description goes here
          </p>

          <GlassButton variant="primary" onClick={handleStart}>
            Start Game
          </GlassButton>

          <GlassButton onClick={handleExit}>
            Back to Menu
          </GlassButton>
        </GlassPanel>
      )}

      {/* Pause Overlay */}
      {paused && (
        <PauseOverlay
          onResume={handleResume}
          onExit={handleExit}
        />
      )}
    </div>
  );
}

export default ModeName;
```

---

## ✅ Design System Checklist

Before submitting a new mode, verify:

- [ ] Imports `W3BP0NG_THEME` from `w3bp0ng-theme.config.js`
- [ ] Imports `../styles/glassmorphism.css`
- [ ] Uses `cosmic-bg` class for background
- [ ] All panels use `GlassPanel` or glass utility classes
- [ ] All buttons use `GlassButton`
- [ ] HUD elements use pre-built components from `GlassHUD.tsx`
- [ ] Typography uses `text-glow-*` classes
- [ ] Spacing uses `W3BP0NG_THEME.spacing.*`
- [ ] Font sizes use `W3BP0NG_THEME.typography.sizes.*`
- [ ] Colors reference `W3BP0NG_THEME.colors.*`
- [ ] Transitions use `W3BP0NG_THEME.motion.ease`
- [ ] Animations use predefined classes (`animate-*`)
- [ ] No hardcoded colors, spacing, or motion values
- [ ] Proper cleanup in useEffect return
- [ ] Keyboard controls work (if applicable)

---

## 🎨 Common Patterns

### Glass Panel with Content
```tsx
<GlassPanel
  variant="elevated"
  neonAccent="magenta"
  style={{
    padding: W3BP0NG_THEME.spacing.xl,
    gap: W3BP0NG_THEME.spacing.md,
  }}
>
  <h2 className="text-glow-primary">Title</h2>
  <p className="text-glow-subtle">Description</p>
</GlassPanel>
```

### Positioned HUD Element
```tsx
<ScoreDisplay
  label="SCORE"
  value={score}
  position="left"
  neonAccent="cyan"
/>
```

### Button Group
```tsx
<div style={{
  display: 'flex',
  gap: W3BP0NG_THEME.spacing.md,
  flexDirection: 'column',
}}>
  <GlassButton variant="primary" onClick={handlePrimary}>
    Primary Action
  </GlassButton>
  <GlassButton onClick={handleSecondary}>
    Secondary Action
  </GlassButton>
</div>
```

### Stats Panel
```tsx
<StatsDisplay
  title="STATS"
  position="top-right"
  stats={[
    { label: 'Level', value: level },
    { label: 'Accuracy', value: `${accuracy}%` },
    { label: 'Combo', value: `x${combo}` },
  ]}
/>
```

### Progress Indicator
```tsx
<ProgressBar
  value={health}
  max={100}
  label="Health"
  color="cyan"
  showPercentage={true}
/>
```

### Timer
```tsx
<TimerDisplay
  time={elapsedSeconds}
  label="TIME"
  format="mm:ss"
/>
```

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T: Hardcode colors
```tsx
// WRONG
<div style={{ background: '#a855f7' }}>
```

### ✅ DO: Use theme tokens
```tsx
// CORRECT
<div style={{ background: W3BP0NG_THEME.colors.accent_neon }}>
```

---

### ❌ DON'T: Create custom glass effects
```tsx
// WRONG
<div style={{
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.2)',
}}>
```

### ✅ DO: Use glass utilities
```tsx
// CORRECT
<div className="glass-panel glass-neon-magenta">
```

---

### ❌ DON'T: Custom transitions
```tsx
// WRONG
<div style={{ transition: 'all 0.5s ease-in-out' }}>
```

### ✅ DO: Use theme motion
```tsx
// CORRECT
<div className="transition-smooth">
// or
<div style={{
  transition: `all ${W3BP0NG_THEME.motion.duration.normal} ${W3BP0NG_THEME.motion.ease}`
}}>
```

---

### ❌ DON'T: Custom animations
```tsx
// WRONG - defining new keyframes
@keyframes myFloat {
  0% { transform: translateY(0) }
  100% { transform: translateY(-20px) }
}
```

### ✅ DO: Use predefined animations
```tsx
// CORRECT
<div className="animate-float">
```

---

### ❌ DON'T: Build custom UI components
```tsx
// WRONG - rebuilding a button
<div
  onClick={handleClick}
  style={{
    background: 'rgba(255,255,255,0.05)',
    padding: '12px 24px',
    borderRadius: '12px',
  }}
>
  Click me
</div>
```

### ✅ DO: Use GlassHUD components
```tsx
// CORRECT
<GlassButton variant="primary" onClick={handleClick}>
  Click me
</GlassButton>
```

---

## 📚 Reference Files

- **Theme tokens:** `w3bp0ng-theme.config.js`
- **CSS utilities:** `src/styles/glassmorphism.css`
- **HUD components:** `src/ui/GlassHUD.tsx`
- **Transition component:** `src/ui/ModeTransition.tsx`
- **Complete guide:** `docs/DESIGN_SYSTEM.md`
- **Implementation details:** `docs/DESIGN_SYSTEM_IMPLEMENTATION.md`

---

## 🎯 Next Steps

1. Copy this template
2. Rename component and add game logic
3. Use HUD components for UI
4. Reference theme tokens for all styling
5. Test transitions from main menu
6. Verify design checklist
7. Compare visually to main menu for consistency

**Remember:** Every new mode should feel like it's opening inside the same holographic synthwave arcade interface.
