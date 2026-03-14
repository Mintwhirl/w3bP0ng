# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: W3BP0NG Game

A professional, feature-rich implementation of Pong with advanced game mechanics, AI opponents, and sophisticated procedural audio. This has evolved from a simple learning project into a high-quality indie game prototype.

### Core Features
- **Liquid Glass Synthwave Aesthetic** — Professional 2026 holographic arcade interface
- **Unified Theme System** — Centralized design tokens for UI and Canvas rendering
- **Advanced AI Opponent** — 3 difficulty levels with realistic prediction and reaction times
- **Dynamic Ball Physics** — Paddle momentum affects ball trajectory for skill-based gameplay
- **Power-up System** — 4 unique power-ups with custom visuals and strategic timing
- **Procedural Chiptune Engine** — SNES/GameBoy style multi-track music using Tone.js
- **Dynamic Music Intensity** — Tempo and "crunch" react in real-time to game speed
- **V8 Performance Optimization** — Hot path optimizations for 60fps gameplay

## 🎨 Design System

**W3BP0NG follows a strict "Liquid Glass Synthwave" aesthetic.**

All modes, menus, transitions, and UI must visually match the Main Menu's holographic arcade interface. See `docs/DESIGN_SYSTEM.md` for complete guidelines.

### Design System Files
- `src/theme/UnifiedTheme.ts` — Single source of truth for all visual tokens
- `src/theme/ThemeManager.ts` — Zustand store for active theme and mode mapping
- `src/theme/ThemeCSS.ts` — Logic for applying theme tokens as CSS variables
- `src/styles/glassmorphism.css` — Reusable glass panel utilities
- `src/ui/GlassHUD.tsx` — Pre-built HUD components
- `src/ui/ModeTransition.tsx` — Smooth mode transitions

### Development Patterns
- **Themes**: Use `useTheme()` hook for React or `getActiveTheme()` for logic.
- **Audio**: Use `setAudioTheme(themeId)` and `setMusicIntensity(speed)`.
- **State**: Use `useGameStore` (Zustand) for global settings and mode selection.
- **Rendering**: `GameRenderer.ts` handles all Canvas 2D rendering using theme colors.

## Development Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview production build locally
- `npx vitest` - Run unit tests

## Tech Stack
- **React 19** with hooks and functional components
- **Vite 6** for fast development and building
- **Tone.js 15** for procedural audio and music
- **Zustand 5** for state and theme management
- **HTML5 Canvas 2D** for high-performance game rendering
- **TypeScript 5** for type safety across the project

## Project Status ✅

### Completed Phases
- ✅ **Phase 1: Foundation Refactor** — Extracted core physics, collision, and AI modules.
- ✅ **Phase 2: Visual Overhaul** — Implemented Liquid Glass aesthetic and components.
- ✅ **Phase 3: Mode Expansion** — Added 5 unique game modes (Classic, Puzzle, Rhythm, Battle Royale, Editor).
- ✅ **Phase 4: Audio Overhaul** — Created procedural chiptune engine with dynamic intensity.
- ✅ **Phase 5: Theme Consolidation** — Unified dual theme systems into a single architecture.

### Current Status
The project is in a high-quality prototype state with all core systems integrated and performing at 60fps. Visuals and audio are synchronized into a cohesive "Liquid Glass Synthwave" experience.
