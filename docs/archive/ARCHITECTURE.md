# w3bP0ng Architecture Documentation

## Overview

w3bP0ng is a professional-grade web game built with modern web technologies, designed as a portfolio piece demonstrating production-quality code, test coverage, and game development best practices.

**Core Philosophy:**
- Modular, testable architecture
- Separation of concerns (engine vs. rendering vs. game logic)
- Performance-first design (60fps target)
- Scalable for multiple game modes
- TypeScript for type safety

---

## Technology Stack

### Core Framework
- **React 19** - UI framework with hooks
- **TypeScript 5.9** - Static typing and developer experience
- **Vite 7** - Build tool and dev server
- **Zustand 5** - Lightweight state management

### Game Libraries
- **PixiJS 8** - WebGL rendering engine for particle effects
- **Tone.js 15** - Web Audio API framework for procedural music
- **GSAP 3** - Animation library for UI transitions

### Testing & Quality
- **Vitest 3** - Unit testing framework
- **React Testing Library 16** - Component testing
- **Happy DOM** - Lightweight DOM for tests
- **ESLint** - Code quality enforcement
- **GitHub Actions** - CI/CD pipeline
- **Lighthouse CI** - Performance auditing

---

## Project Structure

```
w3bP0ng/
├── src/
│   ├── engine/           # Core game engine (physics, collisions, game loop)
│   ├── rendering/        # Visual systems (canvas, particles, effects)
│   ├── audio/            # Sound systems (SFX, music generation)
│   ├── ai/               # AI opponent logic
│   ├── modes/            # Game mode implementations
│   ├── ui/               # React UI components
│   ├── powerups/         # Power-up system
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utilities and constants
│   └── test/             # Testing utilities
├── .github/workflows/    # CI/CD configuration
├── docs/                 # Documentation
└── dist/                 # Build output
```

---

## Architecture Layers

### Layer 1: Game Engine (Pure Logic)

**Responsibilities:**
- Physics calculations (velocity, collision detection)
- Game state management (scores, timers)
- Game loop orchestration
- No direct DOM/Canvas manipulation
- Fully testable without browser

**Key Modules:**
- `PhysicsEngine.ts` - Ball physics, paddle movement
- `CollisionDetector.ts` - Collision detection algorithms
- `GameLoop.ts` - RequestAnimationFrame management

**Design Pattern:** Functional programming with immutable updates

```typescript
// Example: Pure physics calculation
export function calculateBallPosition(
  ball: Ball,
  deltaTime: number
): Ball {
  return {
    ...ball,
    x: ball.x + ball.dx * deltaTime,
    y: ball.y + ball.dy * deltaTime,
  };
}
```

### Layer 2: Rendering System (Visual Output)

**Responsibilities:**
- Canvas 2D rendering
- PixiJS particle systems
- Visual effects (screen shake, trails)
- Theme application
- No game logic

**Key Modules:**
- `GameRenderer.ts` - Main canvas rendering
- `ParticleSystem.ts` - PixiJS particle effects
- `LiquidGlassEffects.ts` - UI visual treatments

**Design Pattern:** Observer pattern (reacts to game state changes)

```typescript
// Example: Rendering decoupled from logic
export class GameRenderer {
  render(gameState: GameState): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground(gameState.theme);
    this.drawPaddles(gameState.paddles);
    this.drawBall(gameState.ball);
  }
}
```

### Layer 3: Audio System (Sound Output)

**Responsibilities:**
- Procedural sound effects with Web Audio API
- Dynamic music generation with Tone.js
- Audio context management
- Volume controls

**Key Modules:**
- `AudioManager.ts` - Sound effect orchestration
- `ChiptuneGenerator.ts` - Procedural music with Tone.js

**Design Pattern:** Factory pattern for sound creation

### Layer 4: Game Modes (Gameplay Variations)

**Responsibilities:**
- Mode-specific rules and mechanics
- Level data (for puzzle mode)
- Win conditions
- Uses engine + rendering layers

**Key Modules:**
- `ClassicMode.ts` - Traditional Pong
- `PhysicsPuzzleMode.ts` - Puzzle challenges
- `RhythmMode.ts` - Beat-matching gameplay
- `BattleRoyaleMode.ts` - 8-player elimination
- `LevelEditorMode.ts` - Create/share levels

**Design Pattern:** Strategy pattern (interchangeable game modes)

### Layer 5: UI Components (React Layer)

**Responsibilities:**
- User controls (menus, settings)
- HUD displays
- Mode selection
- Non-game visuals

**Key Modules:**
- `MainMenu.tsx` - Entry point
- `ModeSelector.tsx` - Game mode picker
- `HUD.tsx` - In-game UI overlay
- `SettingsPanel.tsx` - Options

**Design Pattern:** Component composition

---

## State Management Strategy

### Game State (Performance-Critical)
**Managed by:** React `useRef`
**Reason:** Avoid re-renders during 60fps game loop

```typescript
const gameStateRef = useRef<GameState>({
  ball: { x: 0, y: 0, dx: 4, dy: 3, radius: 8 },
  paddles: { left: {...}, right: {...} },
  score: { left: 0, right: 0 },
  // ... high-frequency update data
});
```

### UI State (User Interactions)
**Managed by:** Zustand store
**Reason:** Predictable, testable, React-friendly

```typescript
// useGameStore.ts
export const useGameStore = create<GameStore>((set) => ({
  gameMode: 'classic',
  soundEnabled: true,
  theme: 'synthwave-sunset',
  setGameMode: (mode) => set({ gameMode: mode }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}));
```

**When to use what:**
- **useRef**: Ball position, paddle velocity, particle arrays
- **Zustand**: Game mode, settings, leaderboard, UI visibility
- **useState**: Local component state (input fields, hover states)

---

## Performance Optimizations

### 1. Game Loop Efficiency
- Single `requestAnimationFrame` per frame
- Delta time for consistent physics across frame rates
- Early exit if game paused

### 2. Rendering Optimizations
- Canvas dirty region tracking (only redraw changed areas)
- Object pooling for particles (reuse instead of create/destroy)
- PixiJS for GPU-accelerated particle effects

### 3. Memory Management
- Particle trail size limits
- Cleanup on unmount
- Avoid closures in hot paths

### 4. Bundle Optimization
- Code splitting (vendor chunks: React, game libs)
- Tree shaking (only import used functions)
- Lazy loading for game modes

**Performance Budgets:**
- JavaScript bundle: <400KB gzipped
- Initial load: <2s on 3G
- Frame time: <16ms (60fps)
- Lighthouse Performance: >85

---

## Testing Strategy

### Unit Tests (Engine Layer)
Test pure functions in isolation

```typescript
// PhysicsEngine.test.ts
describe('calculateBallPosition', () => {
  it('should update ball position based on velocity', () => {
    const ball = { x: 100, y: 100, dx: 5, dy: 3 };
    const result = calculateBallPosition(ball, 1);
    expect(result.x).toBe(105);
    expect(result.y).toBe(103);
  });
});
```

### Integration Tests (Mode Layer)
Test mode logic with mocked engine

### Component Tests (UI Layer)
Test user interactions and rendering

```typescript
// MainMenu.test.tsx
test('clicking Classic Mode starts game', async () => {
  render(<MainMenu />);
  const classicButton = screen.getByText('Classic Mode');
  await userEvent.click(classicButton);
  expect(useGameStore.getState().gameMode).toBe('classic');
});
```

### E2E Tests (Future)
Playwright for full game flow testing

**Coverage Target:** >80% for engine, >60% for UI

---

## CI/CD Pipeline

**GitHub Actions Workflow:**

1. **Quality Checks** (on every commit)
   - TypeScript type check (`tsc --noEmit`)
   - ESLint code quality
   - Vitest unit tests
   - Coverage report upload

2. **Build Verification**
   - Production build
   - Bundle size check (<512KB)
   - Upload build artifacts

3. **Performance Audit** (on main branch)
   - Lighthouse CI
   - Performance score >85
   - Accessibility score >90

4. **Deployment**
   - Vercel auto-deploys from main
   - Preview deployments for PRs

**Quality Gates:**
- All tests must pass
- No TypeScript errors
- ESLint warnings allowed, errors block
- Bundle size warnings at 400KB, errors at 512KB

---

## Data Flow

### Typical Frame (60fps loop):

```
1. Input → Update Game State (useGameLogic)
   ├─ Keyboard/Touch events
   ├─ AI calculations
   └─ Physics updates

2. Game State → Collision Detection
   ├─ Ball vs. Paddles
   ├─ Ball vs. Walls
   └─ Ball vs. Power-ups

3. Collisions → Audio Triggers
   ├─ Play sound effects
   └─ Update music layers

4. Game State → Renderer
   ├─ Canvas 2D draw
   ├─ PixiJS particle update
   └─ UI state updates (if needed)

5. requestAnimationFrame → Next Frame
```

### User Action Flow:

```
User clicks "Rhythm Mode"
  ↓
Zustand store updates
  ↓
React re-renders ModeSelector
  ↓
Mode component initializes
  ↓
Loads mode-specific assets
  ↓
Starts game loop
```

---

## Theme System Architecture

**Theme Definition:**
```typescript
type Theme = {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: GradientStops[];
  };
  particles: ParticleConfig;
  audio: AudioTheme;
};
```

**Theme Application:**
1. User selects theme in settings
2. Zustand store updates `currentTheme`
3. Renderer reads theme for color palette
4. PixiJS updates particle colors
5. CSS variables update for UI
6. Audio manager adjusts music layers

**Built-in Themes:**
- Synthwave Sunset (default)
- Arctic Glass
- Cyberpunk Alley
- Forest Twilight
- (+ mode-specific themes)

---

## Extension Points

### Adding a New Game Mode:

1. Create `src/modes/NewMode.ts`
2. Implement `GameMode` interface
3. Define mode-specific rules
4. Add to `ModeSelector.tsx`
5. Write tests in `NewMode.test.ts`

### Adding a New Power-up:

1. Define type in `constants.ts`
2. Add spawn logic in `PowerUpManager.ts`
3. Implement effect in `useGameLogic.ts`
4. Add visual in `GameRenderer.ts`
5. Add sound in `AudioManager.ts`

### Adding a New Theme:

1. Define theme object in `themes.ts`
2. Add to theme selector UI
3. Update renderer color mappings
4. Add theme-specific particle textures (if custom)

---

## Security & Privacy

- No user data collection
- No external API calls (except CDN for libraries)
- LocalStorage only for:
  - Leaderboard (top 10 scores)
  - User settings (theme, sound prefs)
  - Custom levels (player-created)
- No authentication required
- No analytics without explicit consent

---

## Browser Compatibility

**Target:** Modern evergreen browsers (2024+)

**Required APIs:**
- Canvas 2D Context
- Web Audio API
- requestAnimationFrame
- LocalStorage
- ES2020 features

**Tested:**
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

**Graceful Degradation:**
- Web Audio API unavailable → Mute mode
- PixiJS unsupported → Canvas-only particles
- Touch unsupported → Keyboard/mouse only

---

## Future Architectural Considerations

### Multiplayer (Out of Scope - Documented)
If adding real-time multiplayer:
- WebRTC for P2P (low latency)
- WebSockets for server-authoritative (cheat prevention)
- Rollback netcode for prediction
- Separate server repository

### Backend Integration
If adding level sharing backend:
- RESTful API for level CRUD
- S3/CDN for level JSON storage
- Moderation system for community content
- Separate backend repository (Node.js/Go)

### Mobile App
If wrapping as native app:
- Capacitor for iOS/Android
- Adjust touch controls for native feel
- Platform-specific performance tuning

---

## Developer Onboarding

**Getting Started:**
1. Read this document
2. Review `MASTER_GAME_PLAN.md` for roadmap
3. Run `npm install && npm run dev`
4. Make a small change in `ClassicMode.ts`
5. Run `npm test` to see tests
6. Check `src/engine/PhysicsEngine.ts` as example

**Code Style:**
- Follow TypeScript strict mode
- Use functional programming where possible
- Avoid mutations in hot paths
- Document non-obvious logic
- Write tests for new features

**Commit Convention:**
```
feat: Add rhythm mode music sync
fix: Correct ball collision detection edge case
refactor: Extract AudioManager from PongGame
test: Add PhysicsEngine collision tests
docs: Update architecture for theme system
```

---

## Questions & Answers

**Q: Why useRef for game state instead of useState?**
A: useState triggers re-renders. At 60fps, that's 3,600 renders per minute. useRef updates synchronously without re-renders, perfect for high-frequency data.

**Q: Why PixiJS instead of just Canvas 2D?**
A: PixiJS uses WebGL for GPU-accelerated rendering. For particle effects (1000+ particles), WebGL is 10-100x faster than Canvas 2D.

**Q: Why Zustand over Redux?**
A: Smaller bundle (2KB vs 8KB), simpler API, no boilerplate. Perfect for games where state isn't deeply nested. Industry standard for web games.

**Q: Why Vitest instead of Jest?**
A: Vitest is designed for Vite, uses same config, 10x faster for large test suites. Same API as Jest (easy migration).

**Q: Can this run offline?**
A: Not yet (requires service worker for PWA). Planned for Phase 3.

---

**Last Updated:** 2025-10-05
**Document Version:** 1.0.0
**Maintained By:** Senior Developer
