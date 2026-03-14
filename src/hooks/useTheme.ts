/**
 * useTheme Hook (Legacy Wrapper)
 * Automatically switches themes based on current game mode
 * Now wraps the new Unified Theme System
 */

import { useTheme as useNewTheme } from '../theme/ThemeManager';
import { UnifiedTheme } from '../theme/UnifiedTheme';

/**
 * Hook to get and apply the current theme based on game mode
 * Automatically switches themes when mode changes
 * Applies theme as CSS variables for UI components
 */
export function useTheme(): UnifiedTheme {
  return useNewTheme();
}

/**
 * Hook to get the theme ID for the current mode
 * Useful for displaying theme name in UI
 */
export function useCurrentThemeId(): string {
  const theme = useNewTheme();
  return theme.id;
}
