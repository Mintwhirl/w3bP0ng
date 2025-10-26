/**
 * Physics Puzzle Mode - Level Definitions
 * Handcrafted levels with increasing complexity
 */

import type { Level } from './types';

// ═══════════════════════════════════════════════════════════
// LEVEL 1: INTRODUCTION
// Basic breakout mechanics - no portals
// ═══════════════════════════════════════════════════════════

export const LEVEL_1: Level = {
  id: 1,
  name: 'First Contact',
  description: 'Clear all blocks to proceed',
  difficulty: 1,

  starThresholds: {
    time: 30,
    hits: 15,
  },

  blocks: [
    // Top row
    { x: 300, y: 150, width: 60, height: 30, type: 'normal', health: 1, active: true },
    { x: 380, y: 150, width: 60, height: 30, type: 'normal', health: 1, active: true },
    { x: 460, y: 150, width: 60, height: 30, type: 'normal', health: 1, active: true },
    { x: 540, y: 150, width: 60, height: 30, type: 'normal', health: 1, active: true },
    { x: 620, y: 150, width: 60, height: 30, type: 'normal', health: 1, active: true },
    { x: 700, y: 150, width: 60, height: 30, type: 'normal', health: 1, active: true },
    { x: 780, y: 150, width: 60, height: 30, type: 'normal', health: 1, active: true },
    { x: 860, y: 150, width: 60, height: 30, type: 'normal', health: 1, active: true },

    // Second row
    { x: 340, y: 200, width: 60, height: 30, type: 'normal', health: 1, active: true },
    { x: 420, y: 200, width: 60, height: 30, type: 'normal', health: 1, active: true },
    { x: 500, y: 200, width: 60, height: 30, type: 'target', health: 1, active: true },
    { x: 580, y: 200, width: 60, height: 30, type: 'target', health: 1, active: true },
    { x: 660, y: 200, width: 60, height: 30, type: 'target', health: 1, active: true },
    { x: 740, y: 200, width: 60, height: 30, type: 'normal', health: 1, active: true },
    { x: 820, y: 200, width: 60, height: 30, type: 'normal', health: 1, active: true },
  ],

  portals: [],

  goal: {
    type: 'destroy_all',
  },
};

// ═══════════════════════════════════════════════════════════
// LEVEL 2: PORTAL BASICS
// Introduction to cyan/magenta portal pair
// ═══════════════════════════════════════════════════════════

export const LEVEL_2: Level = {
  id: 2,
  name: 'Portal Prototype',
  description: 'Use portals to reach hidden blocks',
  difficulty: 2,

  starThresholds: {
    time: 45,
    hits: 20,
  },

  blocks: [
    // Left wall (protected)
    { x: 100, y: 200, width: 60, height: 30, type: 'target', health: 1, active: true },
    { x: 100, y: 250, width: 60, height: 30, type: 'target', health: 1, active: true },
    { x: 100, y: 300, width: 60, height: 30, type: 'target', health: 1, active: true },

    // Center blocks
    { x: 500, y: 150, width: 60, height: 30, type: 'normal', health: 1, active: true },
    { x: 580, y: 150, width: 60, height: 30, type: 'normal', health: 1, active: true },
    { x: 660, y: 150, width: 60, height: 30, type: 'normal', health: 1, active: true },

    // Barrier (tough blocks)
    { x: 250, y: 200, width: 40, height: 150, type: 'immovable', health: 999, active: true },
  ],

  portals: [
    {
      id: 'cyan-1',
      x: 600,
      y: 400,
      radius: 30,
      linkedTo: 'magenta-1',
      color: 'cyan',
      rotation: 0,
      active: true,
    },
    {
      id: 'magenta-1',
      x: 180,
      y: 250,
      radius: 30,
      linkedTo: 'cyan-1',
      color: 'magenta',
      rotation: Math.PI,  // Face left
      active: true,
    },
  ],

  goal: {
    type: 'destroy_targets',
  },
};

// ═══════════════════════════════════════════════════════════
// LEVEL 3: MOMENTUM CHALLENGE
// Fast ball with bounce pads
// ═══════════════════════════════════════════════════════════

export const LEVEL_3: Level = {
  id: 3,
  name: 'Velocity Vault',
  description: 'Use bounce pads to gain speed',
  difficulty: 2,

  starThresholds: {
    time: 40,
    hits: 25,
  },

  blocks: [
    // Top cluster
    { x: 500, y: 100, width: 50, height: 30, type: 'tough', health: 2, active: true },
    { x: 570, y: 100, width: 50, height: 30, type: 'target', health: 1, active: true },
    { x: 640, y: 100, width: 50, height: 30, type: 'tough', health: 2, active: true },

    // Side barriers
    { x: 200, y: 250, width: 40, height: 100, type: 'normal', health: 1, active: true },
    { x: 960, y: 250, width: 40, height: 100, type: 'normal', health: 1, active: true },
  ],

  portals: [],

  bouncePads: [
    { x: 300, y: 500, width: 100, height: 20, angle: -Math.PI / 4, power: 1.5 },
    { x: 800, y: 500, width: 100, height: 20, angle: -3 * Math.PI / 4, power: 1.5 },
  ],

  goal: {
    type: 'destroy_all',
  },

  ballSpeed: 6,
};

// ═══════════════════════════════════════════════════════════
// LEVEL 4: PORTAL CHAIN
// Multiple portal pairs
// ═══════════════════════════════════════════════════════════

export const LEVEL_4: Level = {
  id: 4,
  name: 'Quantum Cascade',
  description: 'Master portal chaining',
  difficulty: 3,

  starThresholds: {
    time: 60,
    hits: 30,
  },

  blocks: [
    // Quadrant 1 (top-left)
    { x: 150, y: 100, width: 50, height: 30, type: 'target', health: 1, active: true },
    { x: 220, y: 100, width: 50, height: 30, type: 'normal', health: 1, active: true },

    // Quadrant 2 (top-right)
    { x: 930, y: 100, width: 50, height: 30, type: 'target', health: 1, active: true },
    { x: 1000, y: 100, width: 50, height: 30, type: 'normal', health: 1, active: true },

    // Quadrant 3 (bottom-left)
    { x: 150, y: 600, width: 50, height: 30, type: 'target', health: 1, active: true },
    { x: 220, y: 600, width: 50, height: 30, type: 'normal', health: 1, active: true },

    // Quadrant 4 (bottom-right)
    { x: 930, y: 600, width: 50, height: 30, type: 'target', health: 1, active: true },
    { x: 1000, y: 600, width: 50, height: 30, type: 'normal', health: 1, active: true },

    // Center barrier
    { x: 550, y: 300, width: 100, height: 200, type: 'immovable', health: 999, active: true },
  ],

  portals: [
    // Cyan pair (bottom-center to top-left)
    {
      id: 'cyan-A',
      x: 600,
      y: 700,
      radius: 30,
      linkedTo: 'cyan-B',
      color: 'cyan',
      rotation: -Math.PI / 2,
      active: true,
    },
    {
      id: 'cyan-B',
      x: 200,
      y: 200,
      radius: 30,
      linkedTo: 'cyan-A',
      color: 'cyan',
      rotation: Math.PI / 2,
      active: true,
    },

    // Magenta pair (top-right to bottom-left)
    {
      id: 'magenta-A',
      x: 1000,
      y: 200,
      radius: 30,
      linkedTo: 'magenta-B',
      color: 'magenta',
      rotation: Math.PI,
      active: true,
    },
    {
      id: 'magenta-B',
      x: 200,
      y: 600,
      radius: 30,
      linkedTo: 'magenta-A',
      color: 'magenta',
      rotation: 0,
      active: true,
    },
  ],

  goal: {
    type: 'destroy_targets',
  },
};

// ═══════════════════════════════════════════════════════════
// LEVEL 5: GRAVITY WELL
// Reverse gravity challenge
// ═══════════════════════════════════════════════════════════

export const LEVEL_5: Level = {
  id: 5,
  name: 'Inverted Reality',
  description: 'Gravity works differently here',
  difficulty: 3,

  starThresholds: {
    time: 50,
    hits: 35,
  },

  blocks: [
    // Floor blocks (will be hit from below)
    { x: 300, y: 100, width: 60, height: 30, type: 'target', health: 1, active: true },
    { x: 380, y: 100, width: 60, height: 30, type: 'tough', health: 2, active: true },
    { x: 460, y: 100, width: 60, height: 30, type: 'target', health: 1, active: true },
    { x: 540, y: 100, width: 60, height: 30, type: 'tough', health: 2, active: true },
    { x: 620, y: 100, width: 60, height: 30, type: 'target', health: 1, active: true },
    { x: 700, y: 100, width: 60, height: 30, type: 'tough', health: 2, active: true },
    { x: 780, y: 100, width: 60, height: 30, type: 'target', health: 1, active: true },
    { x: 860, y: 100, width: 60, height: 30, type: 'tough', health: 2, active: true },

    // Side blocks
    { x: 200, y: 300, width: 50, height: 40, type: 'normal', health: 1, active: true },
    { x: 950, y: 300, width: 50, height: 40, type: 'normal', health: 1, active: true },
  ],

  portals: [],

  gravityZones: [
    // Reverse gravity zone (upper half of screen)
    {
      x: 0,
      y: 0,
      width: 1200,
      height: 400,
      strength: -1,
      direction: 'up',
    },
  ],

  goal: {
    type: 'destroy_targets',
  },
};

// ═══════════════════════════════════════════════════════════
// LEVEL COLLECTION
// ═══════════════════════════════════════════════════════════

export const LEVELS: Level[] = [
  LEVEL_1,
  LEVEL_2,
  LEVEL_3,
  LEVEL_4,
  LEVEL_5,
];

export function getLevel(levelId: number): Level | null {
  return LEVELS.find((level) => level.id === levelId) || null;
}

export function getTotalLevels(): number {
  return LEVELS.length;
}
