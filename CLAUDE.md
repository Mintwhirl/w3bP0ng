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

## Next Development Phases

### Phase 1: Mobile Support (Current Focus)
1. **Touch Controls** - Implement touch/swipe for paddle movement
2. **Responsive Canvas** - Adapt game area to different screen sizes
3. **Mobile UI** - Touch-friendly buttons and layout adjustments
4. **Performance on Mobile** - Ensure 60fps on mobile devices

### Phase 2: Enhanced Game Modes
1. **Tournament Mode** - Best of 3/5 matches with brackets
2. **Time Attack** - Score as many points as possible in 60 seconds
3. **Survival Mode** - Increasingly difficult AI with power-up challenges
4. **Local Leaderboard** - Track high scores with localStorage

### Phase 3: Advanced Features
1. **Background Music** - Synthwave soundtrack with volume control
2. **Particle Effects Enhancement** - More visual polish and screen effects
3. **WebGL Renderer** - Upgrade from Canvas2D for advanced visual effects
4. **PWA Features** - Service worker, offline capability, app-like experience

### Phase 4: Production Ready
1. **Code Organization** - Split large component into modules
2. **Deployment Strategy** - Build pipeline and hosting setup
3. **Performance Profiling** - Real device testing and optimization
4. **Accessibility** - Keyboard navigation and screen reader support

### Completed Features
- ✅ Sound system with Web Audio API
- ✅ V8 performance optimizations
- ✅ Live debug panel with metrics
- ✅ Professional UI with synthwave theme