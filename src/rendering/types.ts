/**
 * Rendering type definitions
 * Supports theming and visual variations
 */

export interface GradientStop {
  position: number; // 0 to 1
  hue: number; // 0-360
  saturation: number; // 0-100
  lightness: number; // 0-100
}

export interface Theme {
  id: string;
  name: string;
  background: {
    gradient: GradientStop[];
    animated: boolean;
    animationSpeed: number;
  };
  paddle: {
    left: { color: string; shadowColor: string };
    right: { color: string; shadowColor: string };
  };
  ball: {
    color: string;
    shadowColor: string;
    trailColor: string;
  };
  centerLine: {
    color: string;
    shadowColor: string;
  };
  score: {
    color: string;
    shadowColor: string;
  };
  powerUp: {
    bigPaddle: string;
    fastBall: string;
    multiBall: string;
    shield: string;
  };
}

export interface RenderState {
  ball: {
    x: number;
    y: number;
    radius: number;
    trail: Array<{ x: number; y: number; size: number; life: number }>;
  };
  paddles: {
    left: { x: number; y: number; width: number; height: number };
    right: { x: number; y: number; width: number; height: number };
  };
  score: { left: number; right: number };
  gameWinner: string | null;
  screenShake: { x: number; y: number };
  powerUps: Array<{
    x: number;
    y: number;
    type: string;
    rotation: number;
    color: string;
    symbol: string;
  }>;
  activePowerUps: {
    bigPaddle: { active: boolean; player: string | null };
    multiBall: {
      active: boolean;
      extraBalls: Array<{ x: number; y: number; radius: number }>;
    };
  };
}

/**
 * Default Synthwave Sunset theme
 */
export const DEFAULT_THEME: Theme = {
  id: 'synthwave-sunset',
  name: 'Synthwave Sunset',
  background: {
    gradient: [
      { position: 0, hue: 230, saturation: 45, lightness: 8 },
      { position: 0.5, hue: 250, saturation: 40, lightness: 6 },
      { position: 1, hue: 270, saturation: 50, lightness: 10 },
    ],
    animated: true,
    animationSpeed: 1.0,
  },
  paddle: {
    left: { color: '#ed64a6', shadowColor: 'rgba(237, 100, 166, 0.4)' },
    right: { color: '#6d28d9', shadowColor: 'rgba(109, 40, 217, 0.4)' },
  },
  ball: {
    color: '#81ecec',
    shadowColor: 'rgba(129, 236, 236, 0.5)',
    trailColor: 'rgba(129, 236, 236, 0.7)',
  },
  centerLine: {
    color: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(255, 255, 255, 0.2)',
  },
  score: {
    color: '#ffffff',
    shadowColor: 'rgba(255, 255, 255, 0.3)',
  },
  powerUp: {
    bigPaddle: '#3b82f6',
    fastBall: '#ef4444',
    multiBall: '#f59e0b',
    shield: '#10b981',
  },
};

/**
 * Arctic Glass theme
 */
export const ARCTIC_GLASS_THEME: Theme = {
  id: 'arctic-glass',
  name: 'Arctic Glass',
  background: {
    gradient: [
      { position: 0, hue: 200, saturation: 60, lightness: 10 },
      { position: 0.5, hue: 190, saturation: 50, lightness: 8 },
      { position: 1, hue: 210, saturation: 55, lightness: 12 },
    ],
    animated: true,
    animationSpeed: 0.5,
  },
  paddle: {
    left: { color: '#60a5fa', shadowColor: 'rgba(96, 165, 250, 0.4)' },
    right: { color: '#3b82f6', shadowColor: 'rgba(59, 130, 246, 0.4)' },
  },
  ball: {
    color: '#bfdbfe',
    shadowColor: 'rgba(191, 219, 254, 0.5)',
    trailColor: 'rgba(191, 219, 254, 0.7)',
  },
  centerLine: {
    color: 'rgba(191, 219, 254, 0.3)',
    shadowColor: 'rgba(191, 219, 254, 0.2)',
  },
  score: {
    color: '#bfdbfe',
    shadowColor: 'rgba(191, 219, 254, 0.3)',
  },
  powerUp: {
    bigPaddle: '#60a5fa',
    fastBall: '#3b82f6',
    multiBall: '#93c5fd',
    shield: '#dbeafe',
  },
};

/**
 * Puzzle Mode Theme - Logic & Thinking (Green/Amber)
 */
export const PUZZLE_THEME: Theme = {
  id: 'puzzle-logic',
  name: 'Puzzle Logic',
  background: {
    gradient: [
      { position: 0, hue: 160, saturation: 40, lightness: 8 },
      { position: 0.5, hue: 140, saturation: 35, lightness: 6 },
      { position: 1, hue: 120, saturation: 45, lightness: 10 },
    ],
    animated: true,
    animationSpeed: 0.7,
  },
  paddle: {
    left: { color: '#10b981', shadowColor: 'rgba(16, 185, 129, 0.4)' },
    right: { color: '#f59e0b', shadowColor: 'rgba(245, 158, 11, 0.4)' },
  },
  ball: {
    color: '#34d399',
    shadowColor: 'rgba(52, 211, 153, 0.5)',
    trailColor: 'rgba(52, 211, 153, 0.7)',
  },
  centerLine: {
    color: 'rgba(16, 185, 129, 0.3)',
    shadowColor: 'rgba(16, 185, 129, 0.2)',
  },
  score: {
    color: '#d1fae5',
    shadowColor: 'rgba(209, 250, 229, 0.3)',
  },
  powerUp: {
    bigPaddle: '#10b981',
    fastBall: '#f59e0b',
    multiBall: '#fbbf24',
    shield: '#34d399',
  },
};

/**
 * Rhythm Mode Theme - Music & Energy (Neon Blue/Cyan)
 */
export const RHYTHM_THEME: Theme = {
  id: 'rhythm-beats',
  name: 'Rhythm Beats',
  background: {
    gradient: [
      { position: 0, hue: 200, saturation: 70, lightness: 10 },
      { position: 0.5, hue: 180, saturation: 65, lightness: 8 },
      { position: 1, hue: 190, saturation: 75, lightness: 12 },
    ],
    animated: true,
    animationSpeed: 1.5, // Faster for rhythm energy
  },
  paddle: {
    left: { color: '#06b6d4', shadowColor: 'rgba(6, 182, 212, 0.4)' },
    right: { color: '#3b82f6', shadowColor: 'rgba(59, 130, 246, 0.4)' },
  },
  ball: {
    color: '#22d3ee',
    shadowColor: 'rgba(34, 211, 238, 0.5)',
    trailColor: 'rgba(34, 211, 238, 0.7)',
  },
  centerLine: {
    color: 'rgba(6, 182, 212, 0.3)',
    shadowColor: 'rgba(6, 182, 212, 0.2)',
  },
  score: {
    color: '#a5f3fc',
    shadowColor: 'rgba(165, 243, 252, 0.3)',
  },
  powerUp: {
    bigPaddle: '#06b6d4',
    fastBall: '#3b82f6',
    multiBall: '#22d3ee',
    shield: '#7dd3fc',
  },
};

/**
 * Battle Royale Theme - Intensity & Combat (Red/Orange)
 */
export const BATTLE_THEME: Theme = {
  id: 'battle-intensity',
  name: 'Battle Intensity',
  background: {
    gradient: [
      { position: 0, hue: 0, saturation: 50, lightness: 10 },
      { position: 0.5, hue: 10, saturation: 45, lightness: 8 },
      { position: 1, hue: 20, saturation: 55, lightness: 12 },
    ],
    animated: true,
    animationSpeed: 1.2,
  },
  paddle: {
    left: { color: '#ef4444', shadowColor: 'rgba(239, 68, 68, 0.4)' },
    right: { color: '#f97316', shadowColor: 'rgba(249, 115, 22, 0.4)' },
  },
  ball: {
    color: '#fb923c',
    shadowColor: 'rgba(251, 146, 60, 0.5)',
    trailColor: 'rgba(251, 146, 60, 0.7)',
  },
  centerLine: {
    color: 'rgba(239, 68, 68, 0.3)',
    shadowColor: 'rgba(239, 68, 68, 0.2)',
  },
  score: {
    color: '#fecaca',
    shadowColor: 'rgba(254, 202, 202, 0.3)',
  },
  powerUp: {
    bigPaddle: '#ef4444',
    fastBall: '#f97316',
    multiBall: '#fb923c',
    shield: '#dc2626',
  },
};

/**
 * Editor Mode Theme - Professional & Tools (Cool Gray/Blue)
 */
export const EDITOR_THEME: Theme = {
  id: 'editor-pro',
  name: 'Editor Pro',
  background: {
    gradient: [
      { position: 0, hue: 220, saturation: 20, lightness: 12 },
      { position: 0.5, hue: 210, saturation: 15, lightness: 10 },
      { position: 1, hue: 200, saturation: 25, lightness: 14 },
    ],
    animated: true,
    animationSpeed: 0.5, // Slower for professional feel
  },
  paddle: {
    left: { color: '#64748b', shadowColor: 'rgba(100, 116, 139, 0.4)' },
    right: { color: '#475569', shadowColor: 'rgba(71, 85, 105, 0.4)' },
  },
  ball: {
    color: '#94a3b8',
    shadowColor: 'rgba(148, 163, 184, 0.5)',
    trailColor: 'rgba(148, 163, 184, 0.7)',
  },
  centerLine: {
    color: 'rgba(148, 163, 184, 0.3)',
    shadowColor: 'rgba(148, 163, 184, 0.2)',
  },
  score: {
    color: '#e2e8f0',
    shadowColor: 'rgba(226, 232, 240, 0.3)',
  },
  powerUp: {
    bigPaddle: '#64748b',
    fastBall: '#475569',
    multiBall: '#94a3b8',
    shield: '#cbd5e1',
  },
};

/**
 * All available themes
 */
export const THEMES: Record<string, Theme> = {
  'synthwave-sunset': DEFAULT_THEME,
  'arctic-glass': ARCTIC_GLASS_THEME,
  'puzzle-logic': PUZZLE_THEME,
  'rhythm-beats': RHYTHM_THEME,
  'battle-intensity': BATTLE_THEME,
  'editor-pro': EDITOR_THEME,
};

/**
 * Mode-specific theme mapping
 * Maps game modes to their designated themes
 */
export const MODE_THEMES: Record<string, string> = {
  'menu': 'synthwave-sunset',
  'classic': 'synthwave-sunset',
  'puzzle': 'puzzle-logic',
  'rhythm': 'rhythm-beats',
  'battle-royale': 'battle-intensity',
  'editor': 'editor-pro',
};

/**
 * WCAG AA Contrast Ratio Utilities
 * Ensures accessibility compliance for all themes
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) {
    return null;
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Calculate relative luminance for a color
 * Formula from WCAG 2.1 specification
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
}

/**
 * Calculate contrast ratio between two colors
 * Returns value between 1 (no contrast) and 21 (maximum contrast)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    return 1; // Invalid colors, assume worst case
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 */
export function meetsWCAG_AA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 3.0 : 4.5;
  return ratio >= requiredRatio;
}

/**
 * Validate theme accessibility
 * Returns array of warnings for contrast issues
 */
export function validateThemeAccessibility(theme: Theme): string[] {
  const warnings: string[] = [];
  const darkBackground = '#0a0a14'; // Approximate dark game background

  // Check score text contrast (large text - 3:1 ratio)
  if (!meetsWCAG_AA(theme.score.color, darkBackground, true)) {
    const ratio = getContrastRatio(theme.score.color, darkBackground).toFixed(2);
    warnings.push(`Score text contrast too low: ${ratio}:1 (should be ≥3:1 for large text)`);
  }

  // Note: Ball, paddles, and power-ups are large visual elements
  // They have more flexible contrast requirements
  // Main concern is readability of score/text elements

  return warnings;
}

/**
 * CSS Variables System
 * Apply theme colors as CSS custom properties for UI components
 */

/**
 * Apply theme as CSS variables to document root
 * Enables theme colors in CSS files
 */
export function applyThemeAsCSSVariables(theme: Theme): void {
  const root = document.documentElement;

  // Paddle colors
  root.style.setProperty('--theme-paddle-left', theme.paddle.left.color);
  root.style.setProperty('--theme-paddle-right', theme.paddle.right.color);

  // Ball colors
  root.style.setProperty('--theme-ball', theme.ball.color);
  root.style.setProperty('--theme-ball-trail', theme.ball.trailColor);

  // Score colors
  root.style.setProperty('--theme-score', theme.score.color);

  // Power-up colors
  root.style.setProperty('--theme-powerup-big-paddle', theme.powerUp.bigPaddle);
  root.style.setProperty('--theme-powerup-fast-ball', theme.powerUp.fastBall);
  root.style.setProperty('--theme-powerup-multi-ball', theme.powerUp.multiBall);
  root.style.setProperty('--theme-powerup-shield', theme.powerUp.shield);

  // Background gradient (convert to CSS gradient string)
  const gradientStops = theme.background.gradient
    .map((stop) => `hsl(${stop.hue}, ${stop.saturation}%, ${stop.lightness}%) ${stop.position * 100}%`)
    .join(', ');
  root.style.setProperty('--theme-bg-gradient', `linear-gradient(135deg, ${gradientStops})`);
}
