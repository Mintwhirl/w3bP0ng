/**
 * Global game state management using Zustand
 * Manages UI state, settings, and game mode selection
 */
import { create } from 'zustand';
/**
 * Game mode configurations
 */
export const GAME_MODES = [
    {
        id: 'classic',
        name: 'Classic Mode',
        description: 'Traditional Pong with AI, power-ups, and dynamic physics',
        available: true,
        icon: '🎮',
    },
    {
        id: 'puzzle',
        name: 'Physics Puzzle',
        description: 'Breakout meets Portal - Solve geometric challenges',
        available: true,
        icon: '🧩',
    },
    {
        id: 'rhythm',
        name: 'Rhythm Mode',
        description: 'Hit the ball on-beat for combos and score multipliers',
        available: true,
        icon: '🎵',
    },
    {
        id: 'battle-royale',
        name: 'Battle Royale',
        description: '8-player elimination - Last one standing wins',
        available: true,
        icon: '⚔️',
    },
    {
        id: 'editor',
        name: 'Level Editor',
        description: 'Create and share custom puzzle levels',
        available: true,
        icon: '🛠️',
    },
];
/**
 * Create Zustand store
 */
export const useGameStore = create((set) => ({
    // Initial state
    currentMode: 'title',
    soundEnabled: true,
    currentTheme: 'synthwave-sunset',
    settingsPanelOpen: false,
    // Actions
    setMode: (mode) => set({ currentMode: mode }),
    toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    setTheme: (themeId) => set({ currentTheme: themeId }),
    toggleSettingsPanel: () => set((state) => ({
        settingsPanelOpen: !state.settingsPanelOpen
    })),
    returnToMenu: () => set({ currentMode: 'menu', settingsPanelOpen: false }),
}));
