import { W3BP0NG_THEME } from '../../w3bp0ng-theme.config';
import { getActiveTheme } from './ThemeManager';

/**
 * Migration Layer (Shim)
 * Provides backward compatibility while refactoring to the unified system
 */

// Legacy export with warning
export const LegacyTheme = W3BP0NG_THEME;

/**
 * Adapter that maps the NEW unified theme back to the OLD W3BP0NG_THEME structure
 * Use this during the transition period
 */
export function getLegacyMappedTheme() {
  const theme = getActiveTheme();
  
  // Console warning for deprecation
  console.warn('[DEPRECATED] Accessing theme via Legacy Shim. Migrate to UnifiedTheme system.');

  return {
    colors: {
      bg_primary_dark: theme.colors.background_primary,
      bg_primary_light: theme.colors.background_secondary,
      bg_cosmic_overlay: theme.colors.cosmic_overlay,
      accent_neon: theme.colors.neon_primary,
      accent_cyan: theme.colors.neon_secondary,
      accent_violet: theme.colors.neon_tertiary,
      text_primary: theme.colors.text_primary,
      text_secondary: theme.colors.text_secondary,
      text_tertiary: theme.colors.text_tertiary,
      text_glow: theme.colors.text_glow,
      glass_highlight: theme.colors.glass_highlight,
      glass_base: theme.colors.glass_base,
      glass_border: theme.colors.glass_border,
      shadow_neon_magenta: theme.colors.shadow_neon_primary,
      shadow_neon_cyan: theme.colors.shadow_neon_secondary,
      shadow_soft: theme.colors.shadow_soft,
      glow_soft: theme.colors.glow_soft,
      particle_white: theme.colors.particle_primary,
      particle_fade: theme.colors.particle_secondary,
    },
    gradients: theme.gradients,
    typography: theme.typography,
    motion: theme.motion,
    particles: theme.particles,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    blur: theme.blur,
    zIndex: theme.zIndex,
  };
}
