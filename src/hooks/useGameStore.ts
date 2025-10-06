/**
 * Global game state management using Zustand
 * Manages UI state, settings, and game mode selection
 */

import { create } from 'zustand';

/**
 * Available game modes
 */
export type GameMode = 'menu' | 'classic' | 'puzzle' | 'rhythm' | 'battle-royale' | 'editor';

/**
 * Game mode metadata for UI display
 */
export interface GameModeInfo {
  id: GameMode;
  name: string;
  description: string;
  available: boolean;
  icon: string; // emoji icon
}

/**
 * Global game store state
 */
interface GameStore {
  // Current game mode
  currentMode: GameMode;

  // User settings
  soundEnabled: boolean;
  currentTheme: string;

  // UI state
  settingsPanelOpen: boolean;

  // Actions
  setMode: (mode: GameMode) => void;
  toggleSound: () => void;
  setTheme: (themeId: string) => void;
  toggleSettingsPanel: () => void;
  returnToMenu: () => void;
}

/**
 * Game mode configurations
 */
export const GAME_MODES: GameModeInfo[] = [
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
    available: false,
    icon: '🧩',
  },
  {
    id: 'rhythm',
    name: 'Rhythm Mode',
    description: 'Hit the ball on-beat for combos and score multipliers',
    available: false,
    icon: '🎵',
  },
  {
    id: 'battle-royale',
    name: 'Battle Royale',
    description: '8-player elimination - Last one standing wins',
    available: false,
    icon: '⚔️',
  },
  {
    id: 'editor',
    name: 'Level Editor',
    description: 'Create and share custom puzzle levels',
    available: false,
    icon: '🛠️',
  },
];

/**
 * Create Zustand store
 */
export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  currentMode: 'menu',
  soundEnabled: true,
  currentTheme: 'synthwave-sunset',
  settingsPanelOpen: false,

  // Actions
  setMode: (mode: GameMode) => set({ currentMode: mode }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  setTheme: (themeId: string) => set({ currentTheme: themeId }),

  toggleSettingsPanel: () => set((state) => ({
    settingsPanelOpen: !state.settingsPanelOpen
  })),

  returnToMenu: () => set({ currentMode: 'menu', settingsPanelOpen: false }),
}));
