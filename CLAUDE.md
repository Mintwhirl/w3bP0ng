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