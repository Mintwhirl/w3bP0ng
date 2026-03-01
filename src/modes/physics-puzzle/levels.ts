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
// LEVEL 6: RICOCHET ALLEY
// Advanced ricochet mechanics with strategic angle shots
// ═══════════════════════════════════════════════════════════

export const LEVEL_6: Level = {
  id: 6,
  name: 'Ricochet Alley',
  description: 'Master the art of angle shots and ricochets',
  difficulty: 4,

  starThresholds: {
    time: 45,
    hits: 25,
  },

  blocks: [
    // Strategic tough blocks requiring ricochets
    { x: 250, y: 120, width: 40, height: 40, type: 'tough', health: 3, active: true },
    { x: 350, y: 160, width: 60, height: 30, type: 'tough', health: 2, active: true },
    { x: 450, y: 120, width: 40, height: 40, type: 'tough', health: 3, active: true },
    { x: 550, y: 160, width: 60, height: 30, type: 'tough', health: 2, active: true },
    { x: 650, y: 120, width: 40, height: 40, type: 'tough', health: 3, active: true },
    { x: 750, y: 160, width: 60, height: 30, type: 'tough', health: 2, active: true },
    { x: 850, y: 120, width: 40, height: 40, type: 'tough', health: 3, active: true },

    // Target blocks in hard-to-reach positions
    { x: 300, y: 220, width: 50, height: 25, type: 'target', health: 1, active: true },
    { x: 500, y: 220, width: 50, height: 25, type: 'target', health: 1, active: true },
    { x: 700, y: 220, width: 50, height: 25, type: 'target', health: 1, active: true },

    // Explosive blocks for chain reactions
    { x: 400, y: 280, width: 80, height: 30, type: 'explosive', health: 1, active: true },
    { x: 600, y: 280, width: 80, height: 30, type: 'explosive', health: 1, active: true },
  ],

  portals: [
    { id: 'portal-6-1', x: 200, y: 200, radius: 25, linkedTo: 'portal-6-2', color: 'cyan', rotation: Math.PI / 4, active: true },
    { id: 'portal-6-2', x: 800, y: 200, radius: 25, linkedTo: 'portal-6-1', color: 'cyan', rotation: -Math.PI / 4, active: true },
  ],

  bouncePads: [
    { x: 150, y: 350, width: 60, height: 15, angle: -Math.PI / 3, power: 2.0 },
    { x: 850, y: 350, width: 60, height: 15, angle: -2 * Math.PI / 3, power: 2.0 },
  ],

  goal: {
    type: 'destroy_all',
  },

  ballSpeed: 6,
};

// ═══════════════════════════════════════════════════════════
// LEVEL 7: SWAPPER'S DELIGHT
// Introduction of swapper blocks that change ball properties
// ═══════════════════════════════════════════════════════════

export const LEVEL_7: Level = {
  id: 7,
  name: "Swapper's Delight",
  description: 'Swapper blocks will change your ball properties - use them wisely!',
  difficulty: 5,

  starThresholds: {
    time: 60,
    hits: 30,
  },

  blocks: [
    // Normal blocks surrounding swappers
    { x: 200, y: 100, width: 50, height: 30, type: 'normal', health: 1, active: true },
    { x: 300, y: 100, width: 50, height: 30, type: 'normal', health: 1, active: true },
    { x: 400, y: 100, width: 50, height: 30, type: 'normal', health: 1, active: true },
    { x: 500, y: 100, width: 50, height: 30, type: 'normal', health: 1, active: true },
    { x: 600, y: 100, width: 50, height: 30, type: 'normal', health: 1, active: true },
    { x: 700, y: 100, width: 50, height: 30, type: 'normal', health: 1, active: true },
    { x: 800, y: 100, width: 50, height: 30, type: 'normal', health: 1, active: true },
    { x: 900, y: 100, width: 50, height: 30, type: 'normal', health: 1, active: true },

    // First row of swapper blocks
    { x: 250, y: 150, width: 60, height: 35, type: 'swapper', health: 2, active: true, color: '#ff6ec4' },
    { x: 450, y: 150, width: 60, height: 35, type: 'swapper', health: 2, active: true, color: '#22d3ee' },
    { x: 650, y: 150, width: 60, height: 35, type: 'swapper', health: 2, active: true, color: '#ff6ec4' },
    { x: 850, y: 150, width: 60, height: 35, type: 'swapper', health: 2, active: true, color: '#22d3ee' },

    // Tough blocks that require swapper benefits
    { x: 300, y: 220, width: 70, height: 30, type: 'tough', health: 4, active: true },
    { x: 500, y: 220, width: 70, height: 30, type: 'tough', health: 4, active: true },
    { x: 700, y: 220, width: 70, height: 30, type: 'tough', health: 4, active: true },

    // Target blocks requiring precision
    { x: 350, y: 280, width: 40, height: 25, type: 'target', health: 1, active: true },
    { x: 550, y: 280, width: 40, height: 25, type: 'target', health: 1, active: true },
    { x: 750, y: 280, width: 40, height: 25, type: 'target', health: 1, active: true },

    // Explosive blocks for clearing paths
    { x: 200, y: 330, width: 100, height: 30, type: 'explosive', health: 1, active: true },
    { x: 800, y: 330, width: 100, height: 30, type: 'explosive', health: 1, active: true },
  ],

  portals: [
    { id: 'portal-7-1', x: 100, y: 200, radius: 30, linkedTo: 'portal-7-3', color: 'magenta', rotation: 0, active: true },
    { id: 'portal-7-2', x: 950, y: 200, radius: 30, linkedTo: 'portal-7-4', color: 'green', rotation: Math.PI, active: true },
    { id: 'portal-7-3', x: 550, y: 150, radius: 25, linkedTo: 'portal-7-1', color: 'magenta', rotation: Math.PI / 2, active: true },
    { id: 'portal-7-4', x: 550, y: 350, radius: 25, linkedTo: 'portal-7-2', color: 'green', rotation: -Math.PI / 2, active: true },
  ],

  goal: {
    type: 'destroy_all',
  },

  ballSpeed: 5.5,
};

// ═══════════════════════════════════════════════════════════
// LEVEL 8: THE GAUNTLET
// Final challenge combining all mechanics
// ═══════════════════════════════════════════════════════════

export const LEVEL_8: Level = {
  id: 8,
  name: 'The Gauntlet',
  description: 'The ultimate test - all mechanics combined in one epic level',
  difficulty: 5,

  starThresholds: {
    time: 90,
    hits: 40,
  },

  blocks: [
    // Top layer - immovable fortress
    { x: 200, y: 80, width: 80, height: 30, type: 'immovable', health: 999, active: true },
    { x: 400, y: 80, width: 80, height: 30, type: 'immovable', health: 999, active: true },
    { x: 600, y: 80, width: 80, height: 30, type: 'immovable', health: 999, active: true },
    { x: 800, y: 80, width: 80, height: 30, type: 'immovable', health: 999, active: true },

    // Second layer - swapper blocks for power-ups
    { x: 250, y: 130, width: 60, height: 35, type: 'swapper', health: 3, active: true, color: '#ff6ec4' },
    { x: 450, y: 130, width: 60, height: 35, type: 'swapper', health: 3, active: true, color: '#22d3ee' },
    { x: 650, y: 130, width: 60, height: 35, type: 'swapper', health: 3, active: true, color: '#ff6ec4' },
    { x: 850, y: 130, width: 60, height: 35, type: 'swapper', health: 3, active: true, color: '#22d3ee' },

    // Third layer - tough blockers
    { x: 300, y: 180, width: 50, height: 30, type: 'tough', health: 5, active: true },
    { x: 400, y: 180, width: 50, height: 30, type: 'tough', health: 5, active: true },
    { x: 500, y: 180, width: 50, height: 30, type: 'tough', health: 5, active: true },
    { x: 600, y: 180, width: 50, height: 30, type: 'tough', health: 5, active: true },
    { x: 700, y: 180, width: 50, height: 30, type: 'tough', health: 5, active: true },
    { x: 800, y: 180, width: 50, height: 30, type: 'tough', health: 5, active: true },

    // Fourth layer - explosive chains
    { x: 225, y: 230, width: 70, height: 30, type: 'explosive', health: 1, active: true },
    { x: 425, y: 230, width: 70, height: 30, type: 'explosive', health: 1, active: true },
    { x: 625, y: 230, width: 70, height: 30, type: 'explosive', health: 1, active: true },
    { x: 825, y: 230, width: 70, height: 30, type: 'explosive', health: 1, active: true },

    // Fifth layer - target blocks requiring precision
    { x: 350, y: 280, width: 40, height: 25, type: 'target', health: 1, active: true },
    { x: 450, y: 280, width: 40, height: 25, type: 'target', health: 1, active: true },
    { x: 550, y: 280, width: 40, height: 25, type: 'target', health: 1, active: true },
    { x: 650, y: 280, width: 40, height: 25, type: 'target', health: 1, active: true },
    { x: 750, y: 280, width: 40, height: 25, type: 'target', health: 1, active: true },

    // Bottom layer - normal blockers for cleanup
    { x: 200, y: 330, width: 60, height: 30, type: 'normal', health: 2, active: true },
    { x: 300, y: 330, width: 60, height: 30, type: 'normal', health: 2, active: true },
    { x: 700, y: 330, width: 60, height: 30, type: 'normal', health: 2, active: true },
    { x: 800, y: 330, width: 60, height: 30, type: 'normal', health: 2, active: true },
  ],

  portals: [
    // Strategic portal network
    { id: 'portal-8-1', x: 100, y: 150, radius: 30, linkedTo: 'portal-8-4', color: 'cyan', rotation: Math.PI / 4, active: true },
    { id: 'portal-8-2', x: 900, y: 150, radius: 30, linkedTo: 'portal-8-5', color: 'magenta', rotation: 3 * Math.PI / 4, active: true },
    { id: 'portal-8-3', x: 100, y: 300, radius: 30, linkedTo: 'portal-8-6', color: 'green', rotation: -Math.PI / 4, active: true },
    { id: 'portal-8-4', x: 300, y: 255, radius: 25, linkedTo: 'portal-8-1', color: 'cyan', rotation: Math.PI, active: true },
    { id: 'portal-8-5', x: 700, y: 255, radius: 25, linkedTo: 'portal-8-2', color: 'magenta', rotation: Math.PI, active: true },
    { id: 'portal-8-6', x: 500, y: 205, radius: 25, linkedTo: 'portal-8-3', color: 'green', rotation: Math.PI / 2, active: true },
  ],

  bouncePads: [
    { x: 150, y: 380, width: 80, height: 15, angle: -Math.PI / 3, power: 2.5 },
    { x: 850, y: 380, width: 80, height: 15, angle: -2 * Math.PI / 3, power: 2.5 },
  ],

  gravityZones: [
    { x: 400, y: 250, width: 200, height: 100, strength: -0.3, direction: 'up' },
  ],

  goal: {
    type: 'destroy_all',
  },

  ballSpeed: 5,
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
  LEVEL_6,
  LEVEL_7,
  LEVEL_8,
];

export function getLevel(levelId: number): Level | null {
  return LEVELS.find((level) => level.id === levelId) || null;
}

export function getTotalLevels(): number {
  return LEVELS.length;
}
