/**
 * Physics Puzzle Mode Type Definitions
 * Defines level structure, block types, portals, and game state
 */

// ═══════════════════════════════════════════════════════════
// BLOCK TYPES
// ═══════════════════════════════════════════════════════════

export type BlockType = 'normal' | 'tough' | 'explosive' | 'target' | 'immovable';

export interface Block {
  x: number;           // X position (px)
  y: number;           // Y position (px)
  width: number;       // Block width
  height: number;      // Block height
  type: BlockType;
  health: number;      // Hits required to destroy
  active: boolean;     // Whether block is still in play
  color?: string;      // Optional custom color (defaults to type color)
}

// ═══════════════════════════════════════════════════════════
// PORTAL SYSTEM
// ═══════════════════════════════════════════════════════════

export type PortalColor = 'cyan' | 'magenta' | 'green' | 'orange';

export interface Portal {
  id: string;          // Unique identifier
  x: number;           // Center X position
  y: number;           // Center Y position
  radius: number;      // Portal radius
  linkedTo: string;    // ID of connected portal
  color: PortalColor;
  rotation: number;    // Rotation in radians (affects exit angle)
  active: boolean;
}

// ═══════════════════════════════════════════════════════════
// SPECIAL ELEMENTS
// ═══════════════════════════════════════════════════════════

export interface BouncePad {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;       // Bounce direction (radians)
  power: number;       // Bounce multiplier (1.5 = 50% faster)
}

export interface GravityZone {
  x: number;
  y: number;
  width: number;
  height: number;
  strength: number;    // Gravity multiplier (-1 = reverse, 0.5 = half)
  direction: 'down' | 'up' | 'left' | 'right';
}

// ═══════════════════════════════════════════════════════════
// LEVEL DEFINITION
// ═══════════════════════════════════════════════════════════

export interface LevelGoal {
  type: 'destroy_all' | 'destroy_targets' | 'time_limit' | 'hit_limit';
  value?: number;      // For time_limit (seconds) or hit_limit (number of hits)
}

export interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;

  // Star thresholds
  starThresholds: {
    time?: number;     // Max time for 3 stars (seconds)
    hits?: number;     // Max hits for 3 stars
  };

  // Layout
  blocks: Block[];
  portals: Portal[];
  bouncePads?: BouncePad[];
  gravityZones?: GravityZone[];

  // Win condition
  goal: LevelGoal;

  // Ball settings
  ballSpeed?: number;  // Initial ball speed (default: 5)
  ballCount?: number;  // Number of balls (default: 1)
}

// ═══════════════════════════════════════════════════════════
// GAME STATE
// ═══════════════════════════════════════════════════════════

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
  lastPortalUsed?: string | undefined;  // Prevent portal loops
  lastPortalTime?: number | undefined;  // Timestamp of last portal use
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;  // Velocity for momentum transfer
}

export interface PuzzleGameState {
  // Current level
  currentLevel: number;
  levelData: Level;

  // Entities
  paddle: Paddle;
  balls: Ball[];
  blocks: Block[];
  portals: Portal[];
  bouncePads: BouncePad[];
  gravityZones: GravityZone[];

  // Game stats
  score: number;
  hits: number;        // Total paddle hits
  elapsedTime: number; // Seconds since level start

  // State flags
  gameStarted: boolean;
  levelComplete: boolean;
  levelFailed: boolean;

  // Canvas
  canvas: {
    width: number;
    height: number;
  };
}

// ═══════════════════════════════════════════════════════════
// PROGRESS & SAVE DATA
// ═══════════════════════════════════════════════════════════

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  stars: 0 | 1 | 2 | 3;
  bestTime?: number;
  bestHits?: number;
}

export interface PuzzleProgress {
  unlockedLevels: number;      // Highest unlocked level
  levelProgress: LevelProgress[];
  totalStars: number;
}

// ═══════════════════════════════════════════════════════════
// COLLISION RESULTS
// ═══════════════════════════════════════════════════════════

export interface CollisionResult {
  collided: boolean;
  normal?: { x: number; y: number };  // Collision normal vector
  point?: { x: number; y: number };   // Collision point
}

export interface PortalResult {
  teleported: boolean;
  exitPortal?: Portal;
  newPosition?: { x: number; y: number };
  newVelocity?: { vx: number; vy: number };
}
