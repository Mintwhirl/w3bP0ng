# w3bP0ng 🏓

A modern, feature-rich implementation of the classic Pong game with advanced mechanics, AI opponents, and stunning visual effects. Experience the nostalgic arcade game reimagined for 2026 with professional synthwave aesthetics and sophisticated procedural audio.

## 🎮 Play Now

**[🚀 Live Demo](https://webpong.vercel.app)**

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
- **Liquid Glass Aesthetic**: Professional aesthetic with glowing effects and glassmorphism
- **Unified Theme System**: Centralized design tokens for UI and Canvas rendering
- **Procedural Chiptune Engine**: SNES/GameBoy style multi-track music using Tone.js
- **Dynamic Music Intensity**: Tempo and "crunch" react in real-time to game speed
- **Screen Shake**: Satisfying impact feedback

### 🎯 Game Mechanics
- **5 Unique Modes**: Classic, Physics Puzzle, Rhythm, Battle Royale, Level Editor
- **Smart Spawn Timing**: 7-second grace period, then random 5-30 second intervals
- **V8 Performance Optimization**: Maintains 60fps gameplay
- **Responsive Controls**: Smooth paddle movement with keyboard, mouse, or touch

## 🚀 Getting Started

### Prerequisites
- Node.js (v22 or higher)
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
- **Keyboard**: Use `W`/`S` keys
- **Touch**: Slide on left or right side of the screen
- **Restart**: Press `R` to restart the game
- **Pause**: Press `Space` to toggle pause

### Objective
- Score points by getting the ball past your opponent's paddle
- Collect power-ups to gain temporary advantages
- First to reach 11 points wins in Classic mode!

## 🛠️ Tech Stack

- **React 19**: Modern functional components with hooks
- **Vite 6**: Lightning-fast development and build tools
- **Tone.js 15**: Procedural music engine with multi-track synthesis
- **Zustand 5**: Global state management across game modes and themes
- **HTML5 Canvas 2D**: High-performance game rendering
- **TypeScript 5**: Type-safe development across the entire codebase
- **CSS3**: Advanced styling with glassmorphism and neon glow effects

## 📊 Performance

- **60 FPS Gameplay**: Optimized game loop with centralized `EngineTicker`
- **V8 Engine Optimizations**: Hot path optimizations for smooth performance
- **Efficient Rendering**: Canvas-based rendering with minimal DOM manipulation
- **Lazy Loading**: Game modes are loaded on-demand to reduce initial bundle size

## 🔧 Architecture

- **Unified Theme System**: Single source of truth for all visual tokens in `src/theme/`
- **Mode Registry**: Centralized mode configuration with lazy-loaded components
- **Procedural Audio**: Logic-driven music and SFX that react to game state
- **Physics Engine**: Custom 2D physics with collision detection and momentum
- **Persistence**: Game state and settings saved to local storage with Zod validation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Enjoy the game! 🏓** If you like this project, please give it a ⭐ on GitHub!
