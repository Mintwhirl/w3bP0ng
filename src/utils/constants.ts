/**
 * Game constants - central configuration for gameplay
 * Professional practice: Single source of truth for magic numbers
 */

export const GAME_CONFIG = {
  // Canvas defaults
  DEFAULT_CANVAS_WIDTH: 1400,
  DEFAULT_CANVAS_HEIGHT: 700,
  MIN_CANVAS_MARGIN: 80,

  // Physics
  BALL_RADIUS: 8,
  BALL_INITIAL_SPEED_X: 6,
  BALL_INITIAL_SPEED_Y: 3,
  BALL_SPEED_MULTIPLIER: 1.1, // Acceleration per hit
  BALL_MAX_SPEED: 15,
  BALL_MIN_SPEED: 4,

  // Paddles
  PADDLE_WIDTH: 12,
  PADDLE_HEIGHT: 80,
  PADDLE_SPEED: 4.5,
  PADDLE_MARGIN: 40,

  // Game loop
  TARGET_FPS: 60,
  FRAME_TIME_MS: 16.67, // 1000ms / 60fps

  // Scoring
  WINNING_SCORE: 11,

  // Power-ups
  POWER_UP_INITIAL_SPAWN_DELAY: 180, // frames (3 seconds at 60fps)
  POWER_UP_MIN_SPAWN_DELAY: 120, // 2 seconds
  POWER_UP_MAX_SPAWN_DELAY: 480, // 8 seconds
  POWER_UP_RADIUS: 20,
  POWER_UP_GROWTH_FACTOR: 10, // seconds before max size

  // Power-up durations (in frames)
  BIG_PADDLE_DURATION: 480, // 8 seconds
  FAST_BALL_DURATION: 360, // 6 seconds
  MULTI_BALL_DURATION: 600, // 10 seconds

  // Particle system
  MAX_TRAIL_PARTICLES: 100,
  PARTICLE_LIFETIME: 20, // frames

  // Screen shake
  SHAKE_INTENSITY_BASE: 5,
  SHAKE_DURATION_BASE: 10,
  SHAKE_DECAY: 0.9,
} as const;

export const AI_DIFFICULTY = {
  EASY: {
    speed: 5.5,
    reactionTime: 12, // frames
    accuracy: 0.8,
    predictionEnabled: false,
  },
  MEDIUM: {
    speed: 6.5,
    reactionTime: 6,
    accuracy: 0.9,
    predictionEnabled: true,
  },
  HARD: {
    speed: 7.5,
    reactionTime: 2,
    accuracy: 0.98,
    predictionEnabled: true,
  },
} as const;

export const COLORS = {
  // Synthwave palette
  NEON_PINK: '#ed64a6',
  NEON_PURPLE: '#6d28d9',
  NEON_CYAN: '#81ecec',
  NEON_YELLOW: '#fbbf24',

  // Power-up colors
  POWER_BIG_PADDLE: '#3b82f6',
  POWER_FAST_BALL: '#ef4444',
  POWER_MULTI_BALL: '#f59e0b',
  POWER_SHIELD: '#10b981',

  // UI
  GLASS_OVERLAY: 'rgba(255, 255, 255, 0.08)',
  GLASS_BORDER: 'rgba(255, 255, 255, 0.15)',
  SHADOW_DARK: 'rgba(0, 0, 0, 0.3)',
} as const;

export const AUDIO_CONFIG = {
  MASTER_VOLUME: 0.3,
  SFX_VOLUME: 0.8,
  MUSIC_VOLUME: 0.6,

  // Sound frequencies
  PADDLE_HIT_BASE_FREQ: 800,
  WALL_BOUNCE_FREQ: 150,
  SCORE_FREQ: 440,

  // Chiptune scale (C major pentatonic for pleasant melodies)
  CHIPTUNE_SCALE: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
} as const;

export type GameMode = 'classic' | 'physics-puzzle' | 'rhythm' | 'battle-royale' | 'level-editor';
export type Difficulty = keyof typeof AI_DIFFICULTY;
export type PowerUpType = 'bigPaddle' | 'fastBall' | 'multiBall' | 'shield';
