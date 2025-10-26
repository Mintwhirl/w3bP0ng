/**
 * Level Editor Mode Type Definitions
 * Extends physics puzzle types for level creation functionality
 */
// ═══════════════════════════════════════════════════════════
// EDITOR CONFIGURATION
// ═══════════════════════════════════════════════════════════
export const EDITOR_TOOLS = [
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
export const DEFAULT_LEVEL_METADATA = {
    name: 'New Level',
    description: 'A custom physics puzzle level',
    difficulty: 1,
    version: '1.0.0',
};
export const DEFAULT_EDITOR_GRID = {
    enabled: true,
    size: 20,
    snap: true,
    visible: true,
};
export const DEFAULT_EDITOR_CAMERA = {
    x: 0,
    y: 0,
    zoom: 1.0,
};
