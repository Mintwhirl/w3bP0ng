/**
 * Level Editor Engine
 * Handles level creation, object placement, and editor logic
 */
import { EDITOR_TOOLS, DEFAULT_BLOCK_SIZE, DEFAULT_PORTAL_RADIUS, DEFAULT_BOUNCE_PAD_SIZE, DEFAULT_GRAVITY_ZONE_SIZE, DEFAULT_PADDLE_SIZE, DEFAULT_LEVEL_METADATA, DEFAULT_EDITOR_GRID, DEFAULT_EDITOR_CAMERA, } from './types';
// ═══════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════
export function createInitialEditorState(canvasWidth, canvasHeight) {
    const now = Date.now();
    return {
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
}
// ═══════════════════════════════════════════════════════════
// OBJECT PLACEMENT
// ═══════════════════════════════════════════════════════════
export function placeObject(state, tool, position) {
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
function createPlacedObject(tool, position) {
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
                },
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
                },
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
                },
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
                },
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
                },
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
                },
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
                },
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
                },
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
                },
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
                },
            };
        default:
            throw new Error(`Unknown object type: ${tool}`);
    }
}
// ═══════════════════════════════════════════════════════════
// OBJECT MANIPULATION
// ═══════════════════════════════════════════════════════════
export function deleteObject(state, objectId) {
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
export function selectObject(state, objectId, multiSelect = false) {
    const newObjects = state.placedObjects.map(obj => ({
        ...obj,
        selected: multiSelect ? (obj.selected || obj.id === objectId) : obj.id === objectId,
    }));
    return {
        ...state,
        placedObjects: newObjects,
    };
}
export function moveObject(state, objectId, newPosition) {
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
export function snapToGrid(position, grid) {
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
function checkObjectOverlap(newObject, existingObjects) {
    const bounds = getObjectBounds(newObject);
    return existingObjects.some(obj => {
        const existingBounds = getObjectBounds(obj);
        return (bounds.left < existingBounds.right &&
            bounds.right > existingBounds.left &&
            bounds.top < existingBounds.bottom &&
            bounds.bottom > existingBounds.top);
    });
}
function getObjectBounds(obj) {
    const { position, type, data } = obj;
    if (type.startsWith('block-')) {
        const block = data;
        return {
            left: block.x,
            right: block.x + block.width,
            top: block.y,
            bottom: block.y + block.height,
        };
    }
    if (type.startsWith('portal-')) {
        const portal = data;
        return {
            left: portal.x - portal.radius,
            right: portal.x + portal.radius,
            top: portal.y - portal.radius,
            bottom: portal.y + portal.radius,
        };
    }
    if (type === 'bounce-pad') {
        const pad = data;
        return {
            left: pad.x,
            right: pad.x + pad.width,
            top: pad.y,
            bottom: pad.y + pad.height,
        };
    }
    if (type === 'gravity-zone') {
        const zone = data;
        return {
            left: zone.x,
            right: zone.x + zone.width,
            top: zone.y,
            bottom: zone.y + zone.height,
        };
    }
    if (type === 'paddle') {
        const paddle = data;
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
export function validateLevel(level) {
    const errors = [];
    const warnings = [];
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
    if (levelData.paddle) {
        if (levelData.paddle.y < levelData.canvas.height * 0.5) {
            warnings.push('Paddle is positioned high on the screen - players may expect it at the bottom');
        }
    }
    // Check if objects are within canvas bounds
    const canvas = levelData.canvas;
    levelData.blocks.forEach((block, index) => {
        if (block.x < 0 || block.x + block.width > canvas.width ||
            block.y < 0 || block.y + block.height > canvas.height) {
            errors.push(`Block ${index + 1} is outside canvas bounds`);
        }
    });
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
// ═══════════════════════════════════════════════════════════
// LEVEL CONVERSION
// ═══════════════════════════════════════════════════════════
export function editorStateToLevel(editorState) {
    const blocks = [];
    const portals = [];
    const bouncePads = [];
    const gravityZones = [];
    let paddle;
    // Group objects by type
    editorState.placedObjects.forEach(obj => {
        switch (obj.type) {
            case 'block-normal':
            case 'block-tough':
            case 'block-target':
            case 'block-explosive':
            case 'block-immovable':
                blocks.push(obj.data);
                break;
            case 'portal-cyan':
            case 'portal-magenta':
                portals.push(obj.data);
                break;
            case 'bounce-pad':
                bouncePads.push(obj.data);
                break;
            case 'gravity-zone':
                gravityZones.push(obj.data);
                break;
            case 'paddle':
                paddle = obj.data;
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
    const goal = {
        type: targetBlocks.length > 0 ? 'destroy_targets' : 'destroy_all',
    };
    return {
        id: 0, // Custom levels use string IDs
        name: editorState.levelMetadata.name,
        description: editorState.levelMetadata.description,
        difficulty: editorState.levelMetadata.difficulty,
        starThresholds: {
            time: 120, // Default 2 minutes
            hits: 50, // Default 50 hits
        },
        blocks,
        portals,
        bouncePads,
        gravityZones,
        goal,
        ballSpeed: 5,
    };
}
export function levelToCustomLevel(level, editorState) {
    return {
        metadata: editorState.levelMetadata,
        levelData: level,
        editorState,
    };
}
// ═══════════════════════════════════════════════════════════
// HISTORY MANAGEMENT
// ═══════════════════════════════════════════════════════════
function addToHistory(state) {
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
export function undo(state) {
    if (state.history.currentIndex <= 0) {
        return state;
    }
    const newIndex = state.history.currentIndex - 1;
    return {
        ...state.history.states[newIndex],
        history: {
            ...state.history,
            currentIndex: newIndex,
        },
    };
}
export function redo(state) {
    if (state.history.currentIndex >= state.history.states.length - 1) {
        return state;
    }
    const newIndex = state.history.currentIndex + 1;
    return {
        ...state.history.states[newIndex],
        history: {
            ...state.history,
            currentIndex: newIndex,
        },
    };
}
// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════
function generateId() {
    return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
export function getToolInfo(toolId) {
    return EDITOR_TOOLS.find(tool => tool.id === toolId);
}
export function canPlaceObject(tool, state) {
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
export function getObjectsAtPosition(position, objects) {
    return objects.filter(obj => {
        const bounds = getObjectBounds(obj);
        return position.x >= bounds.left &&
            position.x <= bounds.right &&
            position.y >= bounds.top &&
            position.y <= bounds.bottom;
    });
}
