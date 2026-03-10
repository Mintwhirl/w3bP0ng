/**
 * Level Editor Engine
 * Handles level creation, object placement, and editor logic
 */

import type {
  EditorState,
  PlaceableObjectType,
  PlacedObject,
  EditorTool,
  CustomLevel,
  ValidationResult,
} from './types';
import type {
  Level,
  Block,
  Portal,
  BouncePad,
  GravityZone,
  Paddle,
  LevelGoal,
} from '../physics-puzzle/types';
import {
  EDITOR_TOOLS,
  DEFAULT_BLOCK_SIZE,
  DEFAULT_PORTAL_RADIUS,
  DEFAULT_BOUNCE_PAD_SIZE,
  DEFAULT_GRAVITY_ZONE_SIZE,
  DEFAULT_PADDLE_SIZE,
  DEFAULT_LEVEL_METADATA,
  DEFAULT_EDITOR_GRID,
  DEFAULT_EDITOR_CAMERA,
} from './types';

// ═══════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════

export function createInitialEditorState(canvasWidth: number, canvasHeight: number): EditorState {
  const now = Date.now();

  const initialState: EditorState = {
    mode: 'place',
    currentTool: 'block-normal',
    levelMetadata: {
      ...DEFAULT_LEVEL_METADATA,
      id: generateId(),
      created: now,
      modified: now,
    },
    placedObjects: [],
    grid: DEFAULT_EDITOR_GRID,
    camera: DEFAULT_EDITOR_CAMERA,
    isTestMode: false,
    canvas: { width: canvasWidth, height: canvasHeight },
    history: {
      states: [],
      currentIndex: -1,
    },
  };

  return {
    ...initialState,
    history: {
      states: [initialState],
      currentIndex: 0,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// OBJECT PLACEMENT
// ═══════════════════════════════════════════════════════════

export function placeObject(
  state: EditorState,
  tool: PlaceableObjectType,
  position: { x: number; y: number }
): EditorState {
  const gridPos = snapToGrid(position, state.grid);
  const newObject = createPlacedObject(tool, gridPos);

  // Check for overlapping objects
  const overlaps = checkObjectOverlap(newObject, state.placedObjects);
  if (overlaps) {
    return state; // Don't place overlapping objects
  }

  const newState = {
    ...state,
    placedObjects: [...state.placedObjects, newObject],
    levelMetadata: {
      ...state.levelMetadata,
      modified: Date.now(),
    },
  };

  return addToHistory(newState);
}

function createPlacedObject(
  tool: PlaceableObjectType,
  position: { x: number; y: number }
): PlacedObject {
  const id = generateId();

  switch (tool) {
    case 'block-normal':
      return {
        id,
        type: tool,
        position,
        data: {
          x: position.x,
          y: position.y,
          ...DEFAULT_BLOCK_SIZE,
          type: 'normal',
          health: 1,
          active: true,
        } as Block,
      };

    case 'block-tough':
      return {
        id,
        type: tool,
        position,
        data: {
          x: position.x,
          y: position.y,
          ...DEFAULT_BLOCK_SIZE,
          type: 'tough',
          health: 3,
          active: true,
        } as Block,
      };

    case 'block-target':
      return {
        id,
        type: tool,
        position,
        data: {
          x: position.x,
          y: position.y,
          ...DEFAULT_BLOCK_SIZE,
          type: 'target',
          health: 1,
          active: true,
        } as Block,
      };

    case 'block-explosive':
      return {
        id,
        type: tool,
        position,
        data: {
          x: position.x,
          y: position.y,
          ...DEFAULT_BLOCK_SIZE,
          type: 'explosive',
          health: 1,
          active: true,
        } as Block,
      };

    case 'block-immovable':
      return {
        id,
        type: tool,
        position,
        data: {
          x: position.x,
          y: position.y,
          ...DEFAULT_BLOCK_SIZE,
          type: 'immovable',
          health: 999,
          active: true,
        } as Block,
      };

    case 'portal-cyan':
      return {
        id,
        type: tool,
        position,
        data: {
          id,
          x: position.x,
          y: position.y,
          radius: DEFAULT_PORTAL_RADIUS,
          linkedTo: '', // Will be set when matching portal is placed
          color: 'cyan',
          rotation: 0,
          active: true,
        } as Portal,
      };

    case 'portal-magenta':
      return {
        id,
        type: tool,
        position,
        data: {
          id,
          x: position.x,
          y: position.y,
          radius: DEFAULT_PORTAL_RADIUS,
          linkedTo: '', // Will be set when matching portal is placed
          color: 'magenta',
          rotation: Math.PI, // Point opposite direction by default
          active: true,
        } as Portal,
      };

    case 'bounce-pad':
      return {
        id,
        type: tool,
        position,
        data: {
          x: position.x,
          y: position.y,
          ...DEFAULT_BOUNCE_PAD_SIZE,
          angle: -Math.PI / 4, // 45-degree upward bounce
          power: 1.5,
        } as BouncePad,
      };

    case 'gravity-zone':
      return {
        id,
        type: tool,
        position,
        data: {
          x: position.x,
          y: position.y,
          ...DEFAULT_GRAVITY_ZONE_SIZE,
          strength: 1.0,
          direction: 'down',
        } as GravityZone,
      };

    case 'paddle':
      return {
        id,
        type: tool,
        position,
        data: {
          x: position.x,
          y: position.y,
          ...DEFAULT_PADDLE_SIZE,
          vx: 0,
        } as Paddle,
      };

    default:
      throw new Error(`Unknown object type: ${tool}`);
  }
}

// ═══════════════════════════════════════════════════════════
// OBJECT MANIPULATION
// ═══════════════════════════════════════════════════════════

export function deleteObject(state: EditorState, objectId: string): EditorState {
  const newObjects = state.placedObjects.filter(obj => obj.id !== objectId);

  const newState = {
    ...state,
    placedObjects: newObjects,
    levelMetadata: {
      ...state.levelMetadata,
      modified: Date.now(),
    },
  };

  return addToHistory(newState);
}

export function selectObject(
  state: EditorState,
  objectId: string,
  multiSelect: boolean = false
): EditorState {
  const newObjects = state.placedObjects.map(obj => ({
    ...obj,
    selected: multiSelect ? (obj.selected || obj.id === objectId) : obj.id === objectId,
  }));

  return {
    ...state,
    placedObjects: newObjects,
  };
}

export function moveObject(
  state: EditorState,
  objectId: string,
  newPosition: { x: number; y: number }
): EditorState {
  const gridPos = snapToGrid(newPosition, state.grid);

  const newObjects = state.placedObjects.map(obj => {
    if (obj.id === objectId) {
      return {
        ...obj,
        position: gridPos,
        data: {
          ...obj.data,
          x: gridPos.x,
          y: gridPos.y,
        },
      };
    }
    return obj;
  });

  const newState = {
    ...state,
    placedObjects: newObjects,
    levelMetadata: {
      ...state.levelMetadata,
      modified: Date.now(),
    },
  };

  return addToHistory(newState);
}

// ═══════════════════════════════════════════════════════════
// GRID SNAP
// ═══════════════════════════════════════════════════════════

export function snapToGrid(
  position: { x: number; y: number },
  grid: { size: number; snap: boolean }
): { x: number; y: number } {
  if (!grid.snap) {
    return position;
  }

  return {
    x: Math.round(position.x / grid.size) * grid.size,
    y: Math.round(position.y / grid.size) * grid.size,
  };
}

// ═══════════════════════════════════════════════════════════
// COLLISION/OVERLAP DETECTION
// ═══════════════════════════════════════════════════════════

function checkObjectOverlap(
  newObject: PlacedObject,
  existingObjects: PlacedObject[]
): boolean {
  const bounds = getObjectBounds(newObject);

  return existingObjects.some(obj => {
    const existingBounds = getObjectBounds(obj);
    return (
      bounds.left < existingBounds.right &&
      bounds.right > existingBounds.left &&
      bounds.top < existingBounds.bottom &&
      bounds.bottom > existingBounds.top
    );
  });
}

function getObjectBounds(obj: PlacedObject): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} {
  const { position, type, data } = obj;

  if (type.startsWith('block-')) {
    const block = data as Block;
    return {
      left: block.x,
      right: block.x + block.width,
      top: block.y,
      bottom: block.y + block.height,
    };
  }

  if (type.startsWith('portal-')) {
    const portal = data as Portal;
    return {
      left: portal.x - portal.radius,
      right: portal.x + portal.radius,
      top: portal.y - portal.radius,
      bottom: portal.y + portal.radius,
    };
  }

  if (type === 'bounce-pad') {
    const pad = data as BouncePad;
    return {
      left: pad.x,
      right: pad.x + pad.width,
      top: pad.y,
      bottom: pad.y + pad.height,
    };
  }

  if (type === 'gravity-zone') {
    const zone = data as GravityZone;
    return {
      left: zone.x,
      right: zone.x + zone.width,
      top: zone.y,
      bottom: zone.y + zone.height,
    };
  }

  if (type === 'paddle') {
    const paddle = data as Paddle;
    return {
      left: paddle.x - paddle.width / 2,
      right: paddle.x + paddle.width / 2,
      top: paddle.y - paddle.height / 2,
      bottom: paddle.y + paddle.height / 2,
    };
  }

  // Default bounds
  return {
    left: position.x - 20,
    right: position.x + 20,
    top: position.y - 20,
    bottom: position.y + 20,
  };
}

// ═══════════════════════════════════════════════════════════
// LEVEL VALIDATION
// ═══════════════════════════════════════════════════════════

export function validateLevel(level: CustomLevel): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { levelData } = level;

  // Check if level has a name
  if (!level.metadata.name || level.metadata.name.trim() === '') {
    errors.push('Level must have a name');
  }

  // Check if there's at least one target block
  const targetBlocks = levelData.blocks.filter(block => block.type === 'target');
  if (targetBlocks.length === 0) {
    warnings.push('Level has no target blocks - consider adding objectives');
  }

  // Check portal pairs
  const cyanPortals = levelData.portals.filter(p => p.color === 'cyan');
  const magentaPortals = levelData.portals.filter(p => p.color === 'magenta');
  if (cyanPortals.length !== magentaPortals.length) {
    errors.push('Portal count mismatch: cyan and magenta portals must be paired');
  }

  // Check if paddle is in reasonable position
  if (levelData.paddle && levelData.canvas) {
    if (levelData.paddle.y < levelData.canvas.height * 0.5) {
      warnings.push('Paddle is positioned high on the screen - players may expect it at the bottom');
    }
  }

  // Check if objects are within canvas bounds
  const canvas = levelData.canvas;
  if (canvas) {
    levelData.blocks.forEach((block, index) => {
      if (block.x < 0 || block.x + block.width > canvas.width ||
          block.y < 0 || block.y + block.height > canvas.height) {
        errors.push(`Block ${index + 1} is outside canvas bounds`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ═══════════════════════════════════════════════════════════
// LEVEL CONVERSION
// ═══════════════════════════════════════════════════════════

export function editorStateToLevel(editorState: EditorState): Level {
  const blocks: Block[] = [];
  const portals: Portal[] = [];
  const bouncePads: BouncePad[] = [];
  const gravityZones: GravityZone[] = [];

  // Group objects by type
  editorState.placedObjects.forEach(obj => {
    switch (obj.type) {
      case 'block-normal':
      case 'block-tough':
      case 'block-target':
      case 'block-explosive':
      case 'block-immovable':
        blocks.push(obj.data as Block);
        break;

      case 'portal-cyan':
      case 'portal-magenta':
        portals.push(obj.data as Portal);
        break;

      case 'bounce-pad':
        bouncePads.push(obj.data as BouncePad);
        break;

      case 'gravity-zone':
        gravityZones.push(obj.data as GravityZone);
        break;

      case 'paddle':
        // Paddle data is stored separately in editorState
        break;
    }
  });

  // Link portals (pair cyan with magenta)
  const cyanPortals = portals.filter(p => p.color === 'cyan');
  const magentaPortals = portals.filter(p => p.color === 'magenta');

  cyanPortals.forEach((cyan, index) => {
    if (magentaPortals[index]) {
      cyan.linkedTo = magentaPortals[index].id;
      magentaPortals[index].linkedTo = cyan.id;
    }
  });

  // Determine goal based on placed objects
  const targetBlocks = blocks.filter(b => b.type === 'target');
  const goal: LevelGoal = {
    type: targetBlocks.length > 0 ? 'destroy_targets' : 'destroy_all',
  };

  return {
    id: 0, // Custom levels use string IDs
    name: editorState.levelMetadata.name,
    description: editorState.levelMetadata.description,
    difficulty: editorState.levelMetadata.difficulty,
    starThresholds: {
      time: 120, // Default 2 minutes
      hits: 50,   // Default 50 hits
    },
    blocks,
    portals,
    bouncePads,
    gravityZones,
    goal,
    ballSpeed: 5,
  };
}

export function levelToCustomLevel(level: Level, editorState: EditorState): CustomLevel {
  return {
    metadata: editorState.levelMetadata,
    levelData: level,
    editorState,
  };
}

// ═══════════════════════════════════════════════════════════
// HISTORY MANAGEMENT
// ═══════════════════════════════════════════════════════════

function addToHistory(state: EditorState): EditorState {
  const maxHistorySize = 50;
  const newStates = [...state.history.states.slice(0, state.history.currentIndex + 1), state];

  // Limit history size
  if (newStates.length > maxHistorySize) {
    newStates.shift();
  }

  return {
    ...state,
    history: {
      states: newStates,
      currentIndex: newStates.length - 1,
    },
  };
}

export function undo(state: EditorState): EditorState {
  if (state.history.currentIndex <= 0) {
    return state;
  }

  const newIndex = state.history.currentIndex - 1;
  const previousState = state.history.states[newIndex];
  if (!previousState) return state;

  return {
    ...previousState,
    mode: previousState.mode,
    currentTool: previousState.currentTool,
    levelMetadata: previousState.levelMetadata,
    placedObjects: previousState.placedObjects,
    grid: previousState.grid,
    camera: previousState.camera,
    isTestMode: previousState.isTestMode,
    canvas: previousState.canvas,
    history: {
      ...state.history,
      currentIndex: newIndex,
    },
  };
}

export function redo(state: EditorState): EditorState {
  if (state.history.currentIndex >= state.history.states.length - 1) {
    return state;
  }

  const newIndex = state.history.currentIndex + 1;
  const nextState = state.history.states[newIndex];
  if (!nextState) return state;

  return {
    ...nextState,
    mode: nextState.mode,
    currentTool: nextState.currentTool,
    levelMetadata: nextState.levelMetadata,
    placedObjects: nextState.placedObjects,
    grid: nextState.grid,
    camera: nextState.camera,
    isTestMode: nextState.isTestMode,
    canvas: nextState.canvas,
    history: {
      ...state.history,
      currentIndex: newIndex,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════

function generateId(): string {
  return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getToolInfo(toolId: PlaceableObjectType): EditorTool | undefined {
  return EDITOR_TOOLS.find(tool => tool.id === toolId);
}

export function canPlaceObject(tool: PlaceableObjectType, state: EditorState): boolean {
  // Limit certain object types
  const placedCount = state.placedObjects.filter(obj => obj.type === tool).length;

  switch (tool) {
    case 'paddle':
      return placedCount === 0; // Only one paddle allowed
    case 'portal-cyan':
    case 'portal-magenta':
      return placedCount < 5; // Max 5 portals of each color
    default:
      return true;
  }
}

export function getObjectsAtPosition(
  position: { x: number; y: number },
  objects: PlacedObject[]
): PlacedObject[] {
  return objects.filter(obj => {
    const bounds = getObjectBounds(obj);
    return position.x >= bounds.left &&
           position.x <= bounds.right &&
           position.y >= bounds.top &&
           position.y <= bounds.bottom;
  });
}