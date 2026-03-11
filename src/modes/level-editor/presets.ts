import type { CustomLevel, EditorState, PlacedObject } from './types';
import { DEFAULT_BLOCK_SIZE, DEFAULT_EDITOR_GRID, DEFAULT_EDITOR_CAMERA, DEFAULT_PADDLE_SIZE, DEFAULT_PORTAL_RADIUS, DEFAULT_GRAVITY_ZONE_SIZE, DEFAULT_BOUNCE_PAD_SIZE } from './types';

const PRESET_VERSION = '1.0.0';

function createPresetLevel(id: string, name: string, description: string, difficulty: 1|2|3|4|5, objects: PlacedObject[]): CustomLevel {
  const now = Date.now();
  
  const editorState: EditorState = {
    mode: 'select',
    currentTool: 'block-normal',
    levelMetadata: {
      id,
      name,
      description,
      difficulty,
      author: 'W3BP0NG',
      created: now,
      modified: now,
      version: PRESET_VERSION,
    },
    placedObjects: objects,
    grid: DEFAULT_EDITOR_GRID,
    camera: DEFAULT_EDITOR_CAMERA,
    isTestMode: false,
    canvas: { width: 800, height: 600 },
    history: {
      states: [],
      currentIndex: -1,
    },
  };

  // Minimal levelData for compatibility
  const levelData: any = {
    id: 0,
    name,
    description,
    difficulty,
    starThresholds: { time: 120, hits: 50 },
    blocks: objects.filter(o => o.type.startsWith('block-')).map(o => o.data),
    portals: objects.filter(o => o.type.startsWith('portal-')).map(o => o.data),
    goal: { type: 'destroy_targets' },
    ballSpeed: 5,
  };

  return {
    metadata: editorState.levelMetadata,
    levelData,
    editorState,
  };
}

export const PRESET_LEVELS: Record<string, CustomLevel> = {
  'preset_wall': createPresetLevel(
    'preset_wall',
    'The Great Wall',
    'A classic breakout-style challenge with tough blocks.',
    2,
    [
      ...Array.from({ length: 10 }).map((_, i) => ({
        id: `wall_${i}`,
        type: 'block-normal' as const,
        position: { x: 100 + i * 65, y: 100 },
        data: { x: 100 + i * 65, y: 100, ...DEFAULT_BLOCK_SIZE, type: 'normal', health: 1, active: true },
      })),
      {
        id: 'target_1',
        type: 'block-target' as const,
        position: { x: 370, y: 60 },
        data: { x: 370, y: 60, ...DEFAULT_BLOCK_SIZE, type: 'target', health: 1, active: true },
      },
      {
        id: 'paddle_1',
        type: 'paddle' as const,
        position: { x: 400, y: 550 },
        data: { x: 400, y: 550, ...DEFAULT_PADDLE_SIZE, vx: 0 },
      }
    ]
  ),
  'preset_portals': createPresetLevel(
    'preset_portals',
    'Warp Zone',
    'Master the art of teleportation to hit hidden targets.',
    3,
    [
      {
        id: 'p_cyan',
        type: 'portal-cyan' as const,
        position: { x: 200, y: 300 },
        data: { id: 'p_cyan', x: 200, y: 300, radius: DEFAULT_PORTAL_RADIUS, linkedTo: 'p_magenta', color: 'cyan', rotation: 0, active: true },
      },
      {
        id: 'p_magenta',
        type: 'portal-magenta' as const,
        position: { x: 600, y: 300 },
        data: { id: 'p_magenta', x: 600, y: 300, radius: DEFAULT_PORTAL_RADIUS, linkedTo: 'p_cyan', color: 'magenta', rotation: Math.PI, active: true },
      },
      {
        id: 'target_1',
        type: 'block-target' as const,
        position: { x: 600, y: 100 },
        data: { x: 600, y: 100, ...DEFAULT_BLOCK_SIZE, type: 'target', health: 1, active: true },
      },
      {
        id: 'paddle_1',
        type: 'paddle' as const,
        position: { x: 400, y: 550 },
        data: { x: 400, y: 550, ...DEFAULT_PADDLE_SIZE, vx: 0 },
      }
    ]
  ),
  'preset_gravity': createPresetLevel(
    'preset_gravity',
    'Gravity Well',
    'Use gravity zones and bounce pads to navigate the arena.',
    4,
    [
      {
        id: 'g_zone',
        type: 'gravity-zone' as const,
        position: { x: 340, y: 200 },
        data: { x: 340, y: 200, ...DEFAULT_GRAVITY_ZONE_SIZE, strength: 1.5, direction: 'down' },
      },
      {
        id: 'b_pad',
        type: 'bounce-pad' as const,
        position: { x: 380, y: 400 },
        data: { x: 380, y: 400, ...DEFAULT_BOUNCE_PAD_SIZE, angle: -Math.PI / 2, power: 2.0 },
      },
      {
        id: 'target_1',
        type: 'block-target' as const,
        position: { x: 370, y: 50 },
        data: { x: 370, y: 50, ...DEFAULT_BLOCK_SIZE, type: 'target', health: 1, active: true },
      },
      {
        id: 'paddle_1',
        type: 'paddle' as const,
        position: { x: 400, y: 550 },
        data: { x: 400, y: 550, ...DEFAULT_PADDLE_SIZE, vx: 0 },
      }
    ]
  ),
};
