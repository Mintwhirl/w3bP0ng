/**
 * useTheme Hook
 * Automatically switches themes based on current game mode
 */

import { useEffect, useMemo } from 'react';
import { useGameStore } from './useGameStore';
import { THEMES, MODE_THEMES, applyThemeAsCSSVariables, type Theme } from '../rendering/types';

/**
 * Hook to get and apply the current theme based on game mode
 * Automatically switches themes when mode changes
 * Applies theme as CSS variables for UI components
 */
export function useTheme(): Theme {
  const currentMode = useGameStore((state) => state.currentMode);
  const currentTheme = useGameStore((state) => state.currentTheme);

  // Determine which theme to use
  // Priority: Manual selection > Mode-specific > Default
  const theme = useMemo((): Theme => {
    const defaultTheme = THEMES['synthwave-sunset'];
    if (!defaultTheme) throw new Error('Default theme not found');

    // If user manually selected a theme in settings, use that
    // Only override with mode-specific if we're in menu or if theme is default
    if (currentTheme && currentTheme !== 'synthwave-sunset' && currentMode === 'menu') {
      return THEMES[currentTheme] || defaultTheme;
    }

    // Use mode-specific theme
    const modeThemeId = MODE_THEMES[currentMode];
    return modeThemeId ? (THEMES[modeThemeId] ?? defaultTheme) : defaultTheme;
  }, [currentMode, currentTheme]);

  // Apply theme as CSS variables whenever theme changes
  useEffect(() => {
    applyThemeAsCSSVariables(theme);
  }, [theme]);

  return theme;
}

/**
 * Hook to get the theme ID for the current mode
 * Useful for displaying theme name in UI
 */
export function useCurrentThemeId(): string {
  const currentMode = useGameStore((state) => state.currentMode);
  const currentTheme = useGameStore((state) => state.currentTheme);

  if (currentTheme && currentMode === 'menu') {
    return currentTheme;
  }

  return MODE_THEMES[currentMode] || 'synthwave-sunset';
}
