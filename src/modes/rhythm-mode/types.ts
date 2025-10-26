/**
 * Rhythm Mode Type Definitions
 * Defines all TypeScript types for rhythm-based Pong gameplay
 */

/**
 * Hit accuracy classification based on timing precision
 */
export type HitAccuracy = 'perfect' | 'good' | 'miss';

/**
 * Timing windows for hit accuracy (in milliseconds)
 */
export interface BeatTiming {
  /** Perfect hit window: ±100ms from beat */
  perfect: number;
  /** Good hit window: ±200ms from beat */
  good: number;
  /** Miss window: anything outside good window */
  miss: number;
}

/**
 * Musical track definition with beat timing data
 */
export interface Track {
  /** Display name of the track */
  name: string;
  /** Beats per minute */
  bpm: number;
  /** Track duration in seconds */
  duration: number;
  /** Precise timestamps for each beat (in milliseconds) */
  beats: number[];
}

/**
 * Ball entity
 */
export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
}

/**
 * Paddle entity
 */
export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  vy: number;
}

/**
 * Complete game state for Rhythm Mode
 */
export interface RhythmGameState {
  /** Ball entity with position, velocity, size */
  ball: Ball;
  /** Player paddle entity */
  paddle: Paddle;
  /** Current score (accumulated from hits) */
  score: number;
  /** Current combo streak count */
  combo: number;
  /** Score multiplier based on combo (1x to 5x) */
  multiplier: number;
  /** Index of the current beat in the track */
  beatIndex: number;
  /** Count of perfect-timing hits */
  perfectHits: number;
  /** Count of good-timing hits */
  goodHits: number;
  /** Count of missed beats */
  missedBeats: number;
  /** Total elapsed time in milliseconds */
  elapsedTime: number;
  /** Whether the game is currently running */
  isPlaying: boolean;
  /** The active track being played */
  track: Track;
  /** Canvas dimensions */
  canvas: {
    width: number;
    height: number;
  };
}

/**
 * Persistent statistics for Rhythm Mode (saved to storage)
 */
export interface RhythmStats {
  /** Highest combo achieved */
  bestCombo: number;
  /** Percentage of perfect hits (0-100) */
  perfectHitRate: number;
  /** Highest score achieved */
  highScore: number;
  /** Total games played */
  gamesPlayed: number;
  /** Average accuracy across all games */
  averageAccuracy: number;
}

/**
 * Default timing windows (in milliseconds)
 */
export const DEFAULT_BEAT_TIMING: BeatTiming = {
  perfect: 100, // ±100ms
  good: 200,    // ±200ms
  miss: Infinity
};
