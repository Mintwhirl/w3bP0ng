/**
 * Level Editor Mode Type Definitions
 * Extends physics puzzle types for level creation functionality
 */

import type {
  Block,
  Portal,
  BouncePad,
  GravityZone,
  Level,
  Ball,
  Paddle,
} from '../physics-puzzle/types';

// ═══════════════════════════════════════════════════════════
// EDITOR-SPECIFIC TYPES
// ═══════════════════════════════════════════════════════════

export type EditMode = 'place' | 'delete' | 'select' | 'test';

export type PlaceableObjectType =
  | 'block-normal'
  | 'block-tough'
  | 'block-target'
  | 'block-explosive'
  | 'block-immovable'
  | 'portal-cyan'
  | 'portal-magenta'
  | 'bounce-pad'
  | 'gravity-zone'
  | 'paddle';

export interface EditorTool {
  id: PlaceableObjectType;
  name: string;
  description: string;
  icon: string;
  color?: string;
}

export interface PlacedObject {
  id: string;                    // Unique object identifier
  type: PlaceableObjectType;
  position: { x: number; y: number };
  data: Partial<Block | Portal | BouncePad | GravityZone | Paddle>;
  selected?: boolean;
}

// ═══════════════════════════════════════════════════════════
// EDITOR STATE
// ═══════════════════════════════════════════════════════════

export interface EditorGrid {
  enabled: boolean;
  size: number;                  // Grid cell size (px)
  snap: boolean;                 // Whether to snap to grid
  visible: boolean;              // Whether to show grid lines
}

export interface EditorCamera {
  x: number;
  y: number;
  zoom: number;                  // Zoom level (1.0 = 100%)
}

export interface LevelMetadata {
  id: string;                    // Unique level ID
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  author?: string;
  created: number;               // Timestamp
  modified: number;              // Timestamp
  version: string;               // Version number
}

export interface EditorState {
  // Edit mode and current tool
  mode: EditMode;
  currentTool: PlaceableObjectType;

  // Level being edited
  levelMetadata: LevelMetadata;
  placedObjects: PlacedObject[];

  // Editor preferences
  grid: EditorGrid;
  camera: EditorCamera;

  // Test mode state
  isTestMode: boolean;
  testModeState?: {
    balls: Ball[];
    paddle: Paddle;
    gameStarted: boolean;
  };

  // Canvas dimensions
  canvas: {
    width: number;
    height: number;
  };

  // History for undo/redo
  history: {
    states: EditorState[];
    currentIndex: number;
  };
}

// ═══════════════════════════════════════════════════════════
// EDITOR ACTIONS
// ═══════════════════════════════════════════════════════════

export interface PlaceObjectAction {
  type: 'PLACE_OBJECT';
  objectType: PlaceableObjectType;
  position: { x: number; y: number };
}

export interface DeleteObjectAction {
  type: 'DELETE_OBJECT';
  objectId: string;
}

export interface SelectObjectAction {
  type: 'SELECT_OBJECT';
  objectId: string;
  multiSelect?: boolean;
}

export interface MoveObjectAction {
  type: 'MOVE_OBJECT';
  objectId: string;
  position: { x: number; y: number };
}

export interface UpdateMetadataAction {
  type: 'UPDATE_METADATA';
  metadata: Partial<LevelMetadata>;
}

export interface ToggleTestModeAction {
  type: 'TOGGLE_TEST_MODE';
}

export interface ResetLevelAction {
  type: 'RESET_LEVEL';
}

export type EditorAction =
  | PlaceObjectAction
  | DeleteObjectAction
  | SelectObjectAction
  | MoveObjectAction
  | UpdateMetadataAction
  | ToggleTestModeAction
  | ResetLevelAction;

// ═══════════════════════════════════════════════════════════
// STORAGE TYPES
// ═══════════════════════════════════════════════════════════

export interface CustomLevel {
  metadata: LevelMetadata;
  levelData: Level;
  editorState?: EditorState;     // For continuing editing
}

export interface LevelStorage {
  levels: Record<string, CustomLevel>;  // Keyed by level ID
  metadata: {
    totalLevels: number;
    lastModified: number;
    version: string;
  };
}

// ═══════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface LevelValidator {
  validate(level: CustomLevel): ValidationResult;
}

// ═══════════════════════════════════════════════════════════
// EXPORT/IMPORT
// ═══════════════════════════════════════════════════════════

export interface ExportOptions {
  includeEditorState?: boolean;  // Include editor-specific data
  format?: 'json' | 'compressed';
  pretty?: boolean;              // Pretty print JSON
}

export interface ImportResult {
  success: boolean;
  level?: CustomLevel;
  errors?: string[];
}

// ═══════════════════════════════════════════════════════════
// EDITOR CONFIGURATION
// ═══════════════════════════════════════════════════════════

export const EDITOR_TOOLS: EditorTool[] = [
  {
    id: 'block-normal',
    name: 'Normal Block',
    description: 'Standard breakable block',
    icon: '🟦',
    color: '#3b82f6',
  },
  {
    id: 'block-tough',
    name: 'Tough Block',
    description: 'Takes multiple hits to destroy',
    icon: '🟪',
    color: '#8b5cf6',
  },
  {
    id: 'block-target',
    name: 'Target Block',
    description: 'Must be destroyed to complete level',
    icon: '🎯',
    color: '#ef4444',
  },
  {
    id: 'block-explosive',
    name: 'Explosive Block',
    description: 'Explodes when hit, damages nearby blocks',
    icon: '💥',
    color: '#f97316',
  },
  {
    id: 'block-immovable',
    name: 'Immovable Block',
    description: 'Cannot be destroyed',
    icon: '🗿',
    color: '#6b7280',
  },
  {
    id: 'portal-cyan',
    name: 'Cyan Portal',
    description: 'Teleportation portal entrance',
    icon: '🌀',
    color: '#06b6d4',
  },
  {
    id: 'portal-magenta',
    name: 'Magenta Portal',
    description: 'Teleportation portal exit',
    icon: '🌀',
    color: '#a855f7',
  },
  {
    id: 'bounce-pad',
    name: 'Bounce Pad',
    description: 'Launches ball in specific direction',
    icon: '↗️',
    color: '#10b981',
  },
  {
    id: 'gravity-zone',
    name: 'Gravity Zone',
    description: 'Area with modified gravity',
    icon: '⬇️',
    color: '#fbbf24',
  },
  {
    id: 'paddle',
    name: 'Paddle',
    description: 'Player paddle starting position',
    icon: '🎯',
    color: '#ec4899',
  },
];

// ═══════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════

export const DEFAULT_BLOCK_SIZE = { width: 60, height: 20 };
export const DEFAULT_PORTAL_RADIUS = 20;
export const DEFAULT_BOUNCE_PAD_SIZE = { width: 40, height: 10 };
export const DEFAULT_GRAVITY_ZONE_SIZE = { width: 120, height: 120 };
export const DEFAULT_PADDLE_SIZE = { width: 120, height: 15 };

export const DEFAULT_LEVEL_METADATA: Omit<LevelMetadata, 'id' | 'created' | 'modified'> = {
  name: 'New Level',
  description: 'A custom physics puzzle level',
  difficulty: 1,
  version: '1.0.0',
};

export const DEFAULT_EDITOR_GRID: EditorGrid = {
  enabled: true,
  size: 20,
  snap: true,
  visible: true,
};

export const DEFAULT_EDITOR_CAMERA: EditorCamera = {
  x: 0,
  y: 0,
  zoom: 1.0,
};