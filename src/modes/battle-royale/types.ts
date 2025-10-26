/**
 * Battle Royale Mode Type Definitions
 * 8-player elimination with dynamic tempo and beat-synced finale
 */

// Removed unused GameState import

/**
 * Player paddle configuration
 */
export interface PaddleConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  angle: number;        // Rotation angle for perimeter positioning
  side: 'left' | 'right' | 'top' | 'bottom';
  ai: {
    reactionTime: number;     // milliseconds
    accuracy: number;         // 0.0 - 1.0
    aggressiveness: number;    // 0.0 - 1.0
  };
}


/**
 * Player state
 */
export interface Player {
  id: number;
  color: string;
  score: number;
  alive: boolean;
  paddle: PaddleConfig;
}

/**
 * Ball with motion trail
 */
export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  trail: Array<{ x: number; y: number; opacity: number }>;
}

/**
 * Elimination event
 */
export interface EliminationEvent {
  playerId: number;
  playerColor: string;
  timestamp: number;
  eliminationType: 'ball_miss' | 'timeout' | 'domination';
  finalScore: number;
}

/**
 * Finale phase types
 */
export type FinalePhase = 'none' | 'duel' | 'victory';

/**
 * Game phase progression
 */
export type GamePhase = 'opening' | 'midgame' | 'finale';

/**
 * Tempo progression phase
 */
export interface TempoProgression {
  startTime: number;      // When this phase begins (seconds)
  endTime: number;        // When this phase ends (seconds)
  bpm: number;           // Beats per minute
  intensity: number;      // Visual intensity multiplier (0.1 - 1.0)
}

/**
 * Complete Battle Royale game state
 */
export interface BattleRoyaleState {
  /** All players in the match */
  players: Player[];

  /** All balls in play */
  balls: Ball[];

  /** Elimination history for display */
  eliminations: EliminationEvent[];

  /** Current game time in seconds */
  currentTime: number;

  /** Current game phase */
  gamePhase: GamePhase;

  /** Number of players still alive */
  playerCount: number;

  /** Current tempo configuration */
  tempoPhase: TempoProgression;

  /** Visual intensity for effects (0.0 - 1.0) */
  visualIntensity: number;

  /** Finale phase if active */
  finalePhase: FinalePhase;

  /** Winner of the match */
  winner: Player | null;

  /** Total elapsed time */
  elapsedTime: number;

  /** Canvas dimensions */
  canvas: {
    width: number;
    height: number;
  };
}

/**
 * Arena configuration
 */
export interface ArenaConfig {
  shape: 'circle' | 'octagon' | 'hexagon';
  radius: number;        // Arena radius from center
  centerRadius: number;   // Safe zone in center
}

/**
 * Battle Royale game settings
 */
export interface BattleRoyaleSettings {
  maxPlayers: 8;
  initialBalls: 2;
  maxBalls: 4;
  eliminationScore: 50;  // Score threshold to avoid elimination
  matchDuration: 180;    // 3 minutes max
  enablePowerUps: boolean;
  arena: ArenaConfig;
}

/**
 * Visual effects configuration
 */
export interface VisualEffects {
  particleIntensity: number;    // 0.0 - 1.0
  glowIntensity: number;       // 0.0 - 1.0
  pulseIntensity: number;      // 0.0 - 1.0
  screenShakeIntensity: number; // 0.0 - 1.0
  cameraZoom: number;          // 1.0 - 1.5
  beatProgress: number;        // 0.0 - 1.0 for beat synchronization
}

/**
 * Battle Royale specific rendering state
 */
export interface BattleRoyaleRenderState {
  game: BattleRoyaleState;
  visualEffects: VisualEffects;
  beatProgress: number;       // 0.0 - 1.0 for beat synchronization
  currentPlayerRanking: Array<{
    player: Player;
    rank: number;
    eliminationTime: number | undefined;
  }>;
}

/**
 * Battle statistics for end-game screen
 */
export interface BattleStats {
  totalTime: number;
  eliminations: EliminationEvent[];
  finalRanking: Array<{
    playerId: number;
    playerColor: string;
    finalScore: number;
    rank: number;
    survivalTime: number;
  }>;
  winner: Player;
  mostEliminations: number;
  longestSurvival: number;
}