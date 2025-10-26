
@sessions/CLAUDE.sessions.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Web Pong Game

A modern, feature-rich implementation of Pong with advanced game mechanics, AI opponents, and dynamic physics. This has evolved from a simple learning project into a potentially marketable indie game.

### Current Features
- **Muted synthwave visual theme** - Professional 2025 aesthetic with glowing effects
- **Advanced AI opponent** - 3 difficulty levels with realistic prediction and reaction times
- **Dynamic ball physics** - Paddle momentum affects ball trajectory for skill-based gameplay
- **Power-up system** - 4 unique power-ups with custom drawn visuals and strategic timing
- **Screen shake effects** - Satisfying visual feedback on impacts
- **Particle systems** - Ball trails and visual effects
- **Smart spawn timing** - 7-second grace period, then random 5-30 second intervals
- **Growing challenge** - Power-ups become harder to catch over time
- **Web Audio API sound system** - Procedural sound effects with toggle control
- **V8 Performance optimization** - Hot path optimizations for 60fps gameplay
- **Live debug panel** - Real-time performance monitoring and V8 status

### Power-Up System
- **Big Paddle (B)**: Doubles paddle size for 8 seconds
- **Fast Ball (F)**: 1.5x ball speed for 6 seconds  
- **Multi-Ball (M)**: Spawns 2 extra balls for 10 seconds
- **Shield (S)**: One-time protection from scoring

### Game Mechanics
- **Paddle momentum transfer** - Moving paddles affect ball angle (30% influence)
- **Position-based deflection** - Hit location on paddle determines bounce angle
- **Speed limiting** - Prevents impossible shots while maintaining unpredictability
- **Multi-ball physics** - Each ball responds independently to collisions

### Development Approach
- User-driven feature development with developer expertise
- Focus on "game juice" and modern indie game feel
- Iterative improvement with immediate testing and feedback

## 🎨 Design System

**W3BP0NG follows a strict "Liquid Glass Synthwave" aesthetic.**

All modes, menus, transitions, and UI must visually match the Main Menu's holographic arcade interface. See `docs/DESIGN_SYSTEM.md` for complete guidelines.

### Key Design Principles
1. **Deep cosmic backgrounds** — Violet-blue gradients (#0b001a → #140033)
2. **Glassmorphism** — Translucent panels with blur and soft edges
3. **Neon accents** — Magenta (#a855f7) and cyan (#22d3ee) only
4. **Smooth motion** — cubic-bezier(0.4, 0, 0.2, 1) easing everywhere
5. **Typography** — Orbitron font with neon glow
6. **Depth** — Layering through transparency, blur, and shadows

### Design System Files
- `w3bp0ng-theme.config.js` — Theme tokens and configuration
- `src/styles/glassmorphism.css` — Reusable glass panel utilities
- `src/ui/GlassHUD.tsx` — Pre-built HUD components
- `src/ui/ModeTransition.tsx` — Smooth mode transitions
- `docs/DESIGN_SYSTEM.md` — Complete design guidelines

### When Creating New Modes
**Always:**
- Import `W3BP0NG_THEME` for colors, spacing, motion
- Use `glassmorphism.css` classes (`glass-panel`, `glass-button`, etc.)
- Apply `cosmic-bg` class for backgrounds
- Use pre-built HUD components from `GlassHUD.tsx`
- Follow cubic-bezier easing for all transitions
- Match the visual feel of the Main Menu

**Never:**
- Hardcode colors (always reference theme)
- Use harsh borders or solid backgrounds
- Introduce new fonts or design patterns
- Break the holographic continuity

## Development Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint code quality checks
- `npm run preview` - Preview production build locally

## Tech Stack
- **React 19** with hooks and functional components
- **Vite** for fast development and hot reload
- **HTML5 Canvas** for high-performance game rendering
- **ESLint** for code quality
- **CSS3** with glassmorphism and gradient effects

## Architecture Notes
- **gameStateRef** - Main game state using useRef for 60fps performance
- **Component structure** - Single PongGame component with all game logic
- **Animation loop** - requestAnimationFrame with proper cleanup
- **Power-up system** - Modular with spawn timers and effect management
- **AI system** - Predictive with difficulty-based imperfection

## Development Roadmap

**For detailed planning, see `PROJECT_ROADMAP.md`**

### Completed Phases ✅

#### Phase 0: Professional Foundation (Complete)
- ✅ TypeScript setup with strict mode
- ✅ Vitest, Zustand, PixiJS, Tone.js installed
- ✅ GitHub Actions CI/CD pipeline
- ✅ Project structure and documentation

#### Phase 1: Foundation Refactor (Complete)
- ✅ Extracted 7 core modules (PhysicsEngine, CollisionDetector, GameRenderer, AudioManager, AIController, PowerUpManager, Type System)
- ✅ 214 tests with 100% coverage
- ✅ Professional code structure (<250 lines per file)

#### Phase 2: Integration & Bug Fixes (Complete)
- ✅ Migrated PongGame.jsx → PongGame.tsx
- ✅ Integrated all extracted modules
- ✅ Fixed critical bugs (blank screen, AI jittering)
- ✅ Removed old monolithic code
- ✅ 214/214 tests passing

### Current Focus: Phase 3 - Visual Overhaul

**Goal:** Transform basic visuals into "Liquid Glass Synthwave" aesthetic

**Tasks:**
1. Liquid Glass UI components (frosted glass, specular highlights)
2. PixiJS WebGL particle system (chromatic aberration trails)
3. Dynamic color system (mode-specific palettes)
4. Main menu + mode selector
5. Screen transitions

### Future Phases

**Phase 4:** Audio Enhancement (Tone.js procedural music)
**Phase 5:** New Game Modes (Physics Puzzles, Rhythm, Battle Royale, Level Editor)
**Phase 6:** Polish & Production (accessibility, optimization, cosmetics)

### Completed Features
- ✅ Modular TypeScript architecture
- ✅ 100% test coverage (214 tests)
- ✅ Advanced AI with 3 difficulty levels
- ✅ Dynamic ball physics with momentum transfer
- ✅ Power-up system (4 types)
- ✅ Web Audio API sound effects
- ✅ Theme system for visual variations
- ✅ CI/CD pipeline with quality gates