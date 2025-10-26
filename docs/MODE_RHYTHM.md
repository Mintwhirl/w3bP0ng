# Rhythm Mode Documentation

## Overview

Rhythm Mode transforms the classic Pong gameplay into a beat-synchronized experience where players must hit the ball on-beat to build combos and maximize their score. The mode features a sophisticated timing system, visual beat synchronization, and a scoring system that rewards precision and consistency.

## Gameplay Loop

### Core Mechanics
1. **Beat Synchronization**: The game generates beats at a specific BPM based on difficulty (90-160 BPM)
2. **Timing Windows**: Hits are evaluated as "Perfect" (±100ms), "Good" (±200ms), or "Miss"
3. **Combo System**: Consecutive timed hits build combo, increasing score multiplier
4. **Score Multiplier**: Ranges from 1x to 5x based on combo (increases by 0.5x every 5 hits)
5. **Performance Tracking**: Tracks perfect hits, good hits, misses, and accuracy

### Controls
- **W/↑**: Move paddle up
- **S/↓**: Move paddle down
- **Space**: Start game / Resume from pause
- **Escape**: Pause game

### Difficulty Levels
- **Easy**: 90 BPM, 60 seconds, more forgiving timing
- **Normal**: 120 BPM, 90 seconds, standard timing windows
- **Hard**: 160 BPM, 120 seconds, precise timing required

## Beat Detection System (BeatSync.ts)

The beat detection system provides precise timing for rhythm gameplay:

### Key Features
- **Precise Timestamp Generation**: Creates beat timestamps at exact intervals based on BPM
- **Hit Window Detection**: Evaluates hit timing accuracy with configurable windows
- **Beat Progress Calculation**: Provides 0-1 progress for visual pulse animations
- **Next Beat Prediction**: Calculates timing for upcoming beats

### Configuration
```typescript
interface BeatTiming {
  perfect: 100,  // ±100ms from beat
  good: 200,     // ±200ms from beat
  miss: Infinity
}
```

### Usage Example
```typescript
const beatSync = new BeatSync(120, 90); // 120 BPM, 90 seconds
const hitAccuracy = beatSync.checkHitTiming(elapsedTime, currentBeat);
const beatProgress = beatSync.getBeatProgress(elapsedTime);
```

## HUD Components Used

Rhythm Mode uses the W3BP0NG GlassHUD components for consistent visual design:

### Score Display
- **Position**: Left side of screen
- **Content**: Current score with cyan accent
- **Glass Panel**: Subtle variant with glassmorphism

### Stats Display
- **Position**: Top-right corner
- **Content**: Combo counter, perfect hits, good hits, misses
- **Glass Panel**: Elevated variant with neon accent

### Menu Panels
- **Main Menu**: Elevated glass panel with slide-up animation
- **Complete Screen**: Elevated panel with performance statistics
- **Pause Overlay**: Full-screen overlay with resume/exit options

### Glass Buttons
- **Primary**: Cyan accent for main actions (Start, Retry)
- **Secondary**: Subtle styling for secondary actions (Back to Menu)

## Audio Integration Method

Currently uses visual beat synchronization. Future audio integration:

### Planned Features
- **Tone.js Integration**: Generate procedurally synced music
- **Beat Detection**: Audio analysis for custom tracks
- **Sound Effects**: Web Audio API for hit feedback
- **Volume Control**: Integrated with global sound settings

### Implementation Path
```typescript
// Future Tone.js integration
import * as Tone from 'tone';

const synth = new Tone.PolySynth(Tone.Synth).toDestination();
const pattern = new Tone.Pattern((time, note) => {
  synth.triggerAttackRelease(note, '8n', time);
}, ['C4', 'E4', 'G4', 'B4']);
```

## Design System Compliance

### Visual Consistency
✅ **Cosmic Background**: Deep violet-blue gradient via `cosmic-bg` class
✅ **Glassmorphism**: All UI uses `glass-panel`, `glass-elevated`, `glass-subtle` classes
✅ **Neon Accents**: Consistent magenta/cyan color scheme from theme tokens
✅ **Typography**: Orbitron font with `text-glow-primary`, `text-glow-cyan` classes
✅ **Smooth Motion**: Cubic-bezier easing for all transitions

### Color Scheme
- **Primary**: Cyan (`#22d3ee`) for rhythm elements
- **Secondary**: Violet (`#8b5cf6`) for UI accents
- **Background**: Cosmic violet-blue gradient
- **Glow Effects**: Dynamic intensity based on combo multiplier

### Animation System
- **Beat Pulses**: Expanding concentric rings synchronized to beat
- **Combo Glow**: Screen edge glow that intensifies with combo
- **Particle Field**: Background particles that pulse with beat intensity
- **UI Animations**: Slide-up, fade-in, and pulse glow effects

### Beat-Pulse Timing
- **120 BPM Baseline**: Normal difficulty uses standard rhythm game tempo
- **Visual Feedback**: Beat indicator bar fills approaching each beat
- **Pulse Synchronization**: All visual effects synchronized to beat progress
- **Hit Timing**: Precise ±100ms perfect window for skilled play

## Architecture

### Component Structure
```
src/modes/
├── RhythmMode.tsx              # Main component with game loop
├── rhythm-mode/
│   ├── types.ts                # TypeScript type definitions
│   ├── BeatSync.ts             # Beat timing and synchronization
│   ├── RhythmEngine.ts         # Core gameplay logic and physics
│   └── RhythmRenderer.ts       # Canvas rendering with W3BP0NG styling
```

### State Management
- **Game State**: Stored in `useRef` for 60fps performance
- **UI State**: React `useState` for menu/pause/complete screens
- **Global State**: Zustand store for sound, theme, navigation
- **Persistence**: localStorage for high scores and statistics

### Performance Optimizations
- **Ref-based Game State**: Avoids React re-renders during gameplay
- **RequestAnimationFrame**: Smooth 60fps game loop
- **Efficient Rendering**: Canvas 2D with minimal draw calls
- **Memory Management**: Proper cleanup on unmount

## Testing Coverage

The rhythm mode follows the established testing patterns:
- **Unit Tests**: BeatSync timing accuracy, scoring calculations
- **Integration Tests**: Game state transitions, collision detection
- **Visual Tests**: Renderer output verification
- **Performance Tests**: Frame rate and memory usage monitoring

## Future Enhancements

### Planned Features
1. **Audio Integration**: Tone.js for procedural music generation
2. **Track Editor**: Allow custom beat patterns
3. **Multiplayer**: Competitive rhythm gameplay
4. **Visual Themes**: Additional rhythm-specific color schemes
5. **Difficulty Scaling**: Adaptive BPM based on player performance

### Extension Points
- **Custom Tracks**: Interface for user-created beat patterns
- **Effects System**: Visual modifiers based on performance
- **Leaderboard Integration**: Global score tracking
- **Achievement System**: Unlock rewards for skill milestones

---

*This documentation covers the complete Rhythm Mode implementation as built with GLM assistance, ensuring full compliance with the W3BP0NG design system and providing a foundation for future enhancements.*