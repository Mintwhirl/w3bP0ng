import { create } from 'zustand';
import { UnifiedTheme, THEMES, LIQUID_GLASS_SUNSET } from './UnifiedTheme';
import { applyThemeCSS } from './ThemeCSS';
import { useGameStore, type GameMode } from '../hooks/useGameStore';

interface ThemeState {
  activeTheme: UnifiedTheme;
  setTheme: (themeId: string) => void;
  syncWithMode: (mode: GameMode, selectedThemeId: string) => void;
}

/**
 * Mode-to-Theme Mapping
 */
export const MODE_THEMES: Record<string, string> = {
  'menu': 'liquid-glass-sunset',
  'classic': 'liquid-glass-sunset',
  'puzzle': 'puzzle-logic',
  'rhythm': 'liquid-glass-sunset', // TODO: Implement dedicated Rhythm Beats
  'battle-royale': 'liquid-glass-sunset', // TODO: Implement dedicated Battle Intensity
  'editor': 'liquid-glass-sunset', // TODO: Implement dedicated Editor Pro
};

/**
 * Global Theme Store (Zustand)
 * Manages the active theme and handles application to CSS and subsystems
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  activeTheme: THEMES['liquid-glass-sunset'] || LIQUID_GLASS_SUNSET,
  
  setTheme: (themeId: string) => {
    const theme = THEMES[themeId] || LIQUID_GLASS_SUNSET;
    set({ activeTheme: theme });
    applyThemeCSS(theme);
  },

  syncWithMode: (mode: GameMode, selectedThemeId: string) => {
    // If user manually selected a theme in settings, use that in menu
    if (selectedThemeId && selectedThemeId !== 'synthwave-sunset' && selectedThemeId !== 'liquid-glass-sunset' && mode === 'menu') {
       get().setTheme(selectedThemeId);
       return;
    }

    // Use mode-specific theme
    const modeThemeId = MODE_THEMES[mode];
    get().setTheme(modeThemeId || 'liquid-glass-sunset');
  }
}));

// Initialize subscription to GameStore
useGameStore.subscribe((state) => {
  useThemeStore.getState().syncWithMode(state.currentMode, state.currentTheme);
});

/**
 * Helper to get the active theme outside of React components
 */
export function getActiveTheme(): UnifiedTheme {
  return useThemeStore.getState().activeTheme;
}

/**
 * Helper to get game-specific colors outside of React components
 */
export function getGameColors(): UnifiedTheme['game'] {
  return useThemeStore.getState().activeTheme.game;
}

/**
 * Helper to set the theme from anywhere
 */
export function setTheme(themeId: string): void {
  useThemeStore.getState().setTheme(themeId);
}

/**
 * React hook for theme subscription
 */
export const useTheme = () => useThemeStore((state) => state.activeTheme);
