# w3bP0ng 🏓

A modern, feature-rich implementation of the classic Pong game with advanced mechanics, AI opponents, and stunning visual effects. Experience the nostalgic arcade game reimagined for 2025 with professional synthwave aesthetics and sophisticated gameplay.

## 🎮 Play Now

**[🚀 Live Demo](https://mintwhirl.github.io/w3bP0ng/)**

## ✨ Features

### 🤖 Advanced AI Opponent
- **3 Difficulty Levels**: Easy, Medium, and Hard
- **Realistic Prediction**: AI calculates ball trajectory with human-like imperfection
- **Adaptive Reaction Times**: Difficulty affects AI response speed and accuracy

### ⚡ Dynamic Ball Physics
- **Paddle Momentum Transfer**: Moving paddles influence ball direction (30% influence)
- **Position-Based Deflection**: Hit location on paddle determines bounce angle
- **Speed Limiting**: Prevents impossible shots while maintaining unpredictability
- **Multi-Ball Physics**: Each ball responds independently to collisions

### 🎁 Power-Up System
- **Big Paddle (B)**: Doubles paddle size for 8 seconds
- **Fast Ball (F)**: 1.5x ball speed for 6 seconds
- **Multi-Ball (M)**: Spawns 2 extra balls for 10 seconds
- **Shield (S)**: One-time protection from scoring

### 🎨 Visual & Audio Experience
- **Synthwave Theme**: Professional 2025 aesthetic with glowing effects
- **Particle Systems**: Ball trails and visual effects
- **Screen Shake**: Satisfying impact feedback
- **Web Audio API**: Procedural sound effects with toggle control
- **Live Debug Panel**: Real-time performance monitoring

### 🎯 Game Mechanics
- **Smart Spawn Timing**: 7-second grace period, then random 5-30 second intervals
- **Growing Challenge**: Power-ups become harder to catch over time
- **V8 Performance Optimization**: Maintains 60fps gameplay
- **Responsive Controls**: Smooth paddle movement with mouse or keyboard

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/Mintwhirl/w3bP0ng.git
cd w3bP0ng

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to play!

### Build for Production
```bash
npm run build
npm run preview
```

## 🎮 How to Play

### Controls
- **Mouse**: Move mouse up/down to control your paddle
- **Keyboard**: Use `W`/`S` or `↑`/`↓` arrow keys
- **Sound**: Click the speaker icon to toggle sound effects

### Objective
- Score points by getting the ball past your opponent's paddle
- Collect power-ups to gain temporary advantages
- First to reach the score limit wins!

### Power-Up Strategy
- **Time your catches**: Power-ups spawn randomly but become harder to catch
- **Use wisely**: Each power-up has different durations and effects
- **Multi-Ball**: Creates chaos but opportunities for multiple points
- **Shield**: Save it for crucial moments when you're about to be scored on

## 🛠️ Tech Stack

- **React 19.1.1**: Modern functional components with hooks
- **Vite**: Lightning-fast development and build tools
- **Tone.js 15.1.22**: Procedural music engine with transport-based sequencing
- **Zustand 5.0.8**: Global state management across game modes
- **HTML5 Canvas 2D**: High-performance game rendering
- **Web Audio API + Tone.js**: Real-time procedural audio and dynamic music themes
- **CSS3**: Advanced styling with glassmorphism effects
- **ESLint**: Code quality and consistency

## 📊 Performance

- **60 FPS Gameplay**: Optimized game loop with requestAnimationFrame
- **V8 Engine Optimizations**: Hot path optimizations for smooth performance
- **Efficient Rendering**: Canvas-based rendering with minimal DOM manipulation
- **Memory Management**: Proper cleanup and object pooling

## 🔧 Development

### Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run code quality checks
```

### Architecture
- **State Management**: Zustand global store (`useGameStore`) with persistent storage
- **Mode Registry**: Centralized mode configuration with lazy-loaded components
- **Dual Theme System**:
  - **`w3bp0ng-theme.config.js`**: Game rendering theme (Canvas 2D colors for paddles, balls, particles)
  - **`src/rendering/types.ts`**: UI theming (CSS variables, backgrounds, glassmorphism)
- **Component Structure**: Per-mode components with shared game engine utilities
- **Animation Loop**: `EngineTicker.ts` centralized timing system with proper cleanup
- **Power-up System**: Modular spawn timers and effect management

## 🎯 Roadmap

### Implemented Features
- 5 game modes: Classic, Physics Puzzle, Rhythm, Battle Royale, Level Editor
- Procedural music engine with dynamic intensity
- Achievement system with toast notifications
- PWA with offline support and installation
- Save data persistence with validation
- Centralized mode registry with lazy-loaded components

### Future Enhancements
- Multiplayer support (WebRTC-based)
- Level sharing platform (import/export custom levels)
- Additional music themes and instruments
- Enhanced particle systems
- Touch controls for mobile devices

## 🤝 Contributing

Contributions are welcome! This project is designed to be a learning experience and showcase of modern web game development.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎨 Credits

- **Synthwave Aesthetic**: Inspired by 80s retro-futurism and neon aesthetics
- **Game Mechanics**: Enhanced version of the classic Atari Pong
- **Audio Design**: Procedural audio and music using Web Audio API + Tone.js
- **Visual Effects**: Custom particle systems and screen shake implementation

## 🌟 Acknowledgments

- Thanks to the React and Vite communities for excellent development tools
- Inspired by classic arcade games and modern indie game design principles
- Built as a demonstration of modern web technologies and game development techniques

---

**Enjoy the game! 🏓** If you like this project, please give it a ⭐ on GitHub!