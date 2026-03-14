/**
 * Unified Theme System
 * Single source of truth for all visual design (UI and Game)
 */

export interface UnifiedTheme {
  id: string;
  name: string;

  // UI Layer
  colors: {
    // Backgrounds
    background_primary: string;
    background_secondary: string;
    background_gradient: string;
    cosmic_overlay: string;

    // Neon accents
    neon_primary: string;
    neon_secondary: string;
    neon_tertiary: string;

    // Text colors
    text_primary: string;
    text_secondary: string;
    text_tertiary: string;
    text_glow: string;

    // Glass surfaces
    glass_highlight: string;
    glass_base: string;
    glass_border: string;

    // Shadows and glows
    shadow_neon_primary: string;
    shadow_neon_secondary: string;
    shadow_soft: string;
    glow_soft: string;

    // Particle system
    particle_primary: string;
    particle_secondary: string;
  };

  // Gradients
  gradients: {
    background_main: string;
    background_radial: string;
    glass_overlay: string;
    neon_edge_primary: string;
    neon_edge_secondary: string;
  };

  // Game Rendering Layer (Canvas 2D)
  game: {
    background: {
      gradient: Array<{ position: number; hue: number; saturation: number; lightness: number }>;
      animated: boolean;
      animationSpeed: number;
    };
    // Paddles
    paddle_left: { color: string; shadow: string };
    paddle_right: { color: string; shadow: string };

    // Ball
    ball: { color: string; trail: string; shadow: string };

    // Center line
    centerLine: { color: string; shadow: string };

    // Score
    score: { color: string; shadow: string };

    // Power-ups
    powerUp: {
      bigPaddle: string;
      fastBall: string;
      multiBall: string;
      shield: string;
    };

    // Special elements (puzzle mode)
    special?: {
      portal: string;
      gravityWell: string;
      bouncePad: string;
      swapperBlock: string;
    };
  };

  // Typography
  typography: {
    fontFamily: { primary: string; fallback: string };
    textGlow: {
      primary: string;
      subtle: string;
      accent: string;
    };
    sizes: {
      heading_xl: string;
      heading_lg: string;
      heading_md: string;
      body_lg: string;
      body_md: string;
      body_sm: string;
    };
  };

  // Motion
  motion: {
    ease: string;
    easeIn: string;
    easeOut: string;
    duration: {
      fast: string;
      normal: string;
      slow: string;
      transition: string;
    };
    hover: {
      scale: number;
      brightness: number;
      glowIntensity: number;
    };
  };

  // Particles
  particles: {
    background: {
      count: number;
      opacity: { min: number; max: number };
      size: { min: number; max: number };
      blur: string;
      blendMode: string;
      speed: string;
    };
    ambient: {
      count: number;
      opacity: { min: number; max: number };
      size: { min: number; max: number };
      blur: string;
      blendMode: string;
      speed: string;
    };
  };

  // Spacing
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };

  // Borders & shadows
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };
  blur: {
    subtle: string;
    normal: string;
    medium: string;
    strong: string;
    intense: string;
  };

  // Z-index layers
  zIndex: {
    background: number;
    particles: number;
    game: number;
    hud: number;
    menu: number;
    modal: number;
    settings: number;
    tooltip: number;
  };
}

/**
 * Shared base tokens (from w3bp0ng-theme.config.js)
 */
const BASE_TOKENS = {
  typography: {
    fontFamily: {
      primary: 'Orbitron, "Courier New", monospace',
      fallback: '"Courier New", monospace',
    },
    sizes: {
      heading_xl: '3rem',
      heading_lg: '2rem',
      heading_md: '1.5rem',
      body_lg: '1.125rem',
      body_md: '1rem',
      body_sm: '0.875rem',
    },
  },
  motion: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    duration: {
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s',
      transition: '0.8s',
    },
    hover: {
      scale: 1.03,
      brightness: 1.1,
      glowIntensity: 1.5,
    },
  },
  particles: {
    background: {
      count: 50,
      opacity: { min: 0.3, max: 0.9 },
      size: { min: 1, max: 3 },
      blur: '2px',
      blendMode: 'screen',
      speed: 'slow',
    },
    ambient: {
      count: 100,
      opacity: { min: 0.1, max: 0.5 },
      size: { min: 0.5, max: 2 },
      blur: '1px',
      blendMode: 'screen',
      speed: 'very-slow',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },
  blur: {
    subtle: '4px',
    normal: '8px',
    medium: '10px',
    strong: '16px',
    intense: '24px',
  },
  zIndex: {
    background: 0,
    particles: 1,
    game: 10,
    hud: 50,
    menu: 100,
    modal: 200,
    settings: 300,
    tooltip: 400,
  },
};

/**
 * LIQUID GLASS SUNSET (Canonical Theme)
 */
export const LIQUID_GLASS_SUNSET: UnifiedTheme = {
  id: 'liquid-glass-sunset',
  name: 'Liquid Glass Sunset',
  ...BASE_TOKENS,
  colors: {
    background_primary: '#0b001a',
    background_secondary: '#140033',
    background_gradient: 'linear-gradient(180deg, #0b001a 0%, #140033 100%)',
    cosmic_overlay: 'rgba(20, 0, 51, 0.8)',
    neon_primary: '#a855f7',
    neon_secondary: '#22d3ee',
    neon_tertiary: '#8b5cf6',
    text_primary: '#ffffff',
    text_secondary: '#c084fc',
    text_tertiary: 'rgba(255, 255, 255, 0.7)',
    text_glow: 'rgba(168, 85, 247, 0.6)',
    glass_highlight: 'rgba(255, 255, 255, 0.15)',
    glass_base: 'rgba(255, 255, 255, 0.05)',
    glass_border: 'rgba(255, 255, 255, 0.2)',
    shadow_neon_primary: '0 0 20px rgba(168, 85, 247, 0.5)',
    shadow_neon_secondary: '0 0 20px rgba(34, 211, 238, 0.5)',
    shadow_soft: '0 8px 32px rgba(0, 0, 0, 0.3)',
    glow_soft: '0 0 10px rgba(168, 85, 247, 0.3)',
    particle_primary: 'rgba(255, 255, 255, 0.9)',
    particle_secondary: 'rgba(255, 255, 255, 0.3)',
  },
  gradients: {
    background_main: 'linear-gradient(180deg, #0b001a 0%, #140033 100%)',
    background_radial: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
    glass_overlay: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
    neon_edge_primary: 'linear-gradient(90deg, transparent, #a855f7, transparent)',
    neon_edge_secondary: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
  },
  game: {
    background: {
      gradient: [
        { position: 0, hue: 230, saturation: 45, lightness: 8 },
        { position: 0.5, hue: 250, saturation: 40, lightness: 6 },
        { position: 1, hue: 270, saturation: 50, lightness: 10 },
      ],
      animated: true,
      animationSpeed: 1.0,
    },
    paddle_left: { color: '#ed64a6', shadow: 'rgba(237, 100, 166, 0.4)' },
    paddle_right: { color: '#6d28d9', shadow: 'rgba(109, 40, 217, 0.4)' },
    ball: { color: '#81ecec', shadow: 'rgba(129, 236, 236, 0.5)', trail: 'rgba(129, 236, 236, 0.7)' },
    centerLine: { color: 'rgba(255, 255, 255, 0.3)', shadow: 'rgba(255, 255, 255, 0.2)' },
    score: { color: '#ffffff', shadow: 'rgba(255, 255, 255, 0.3)' },
    powerUp: {
      bigPaddle: '#3b82f6',
      fastBall: '#ef4444',
      multiBall: '#f59e0b',
      shield: '#10b981',
    },
  },
  typography: {
    ...BASE_TOKENS.typography,
    textGlow: {
      primary: '0 0 10px rgba(168, 85, 247, 0.6)',
      subtle: '0 0 5px rgba(168, 85, 247, 0.3)',
      accent: '0 0 10px rgba(34, 211, 238, 0.6)',
    },
  },
};

/**
 * ARCTIC GLASS
 */
export const ARCTIC_GLASS: UnifiedTheme = {
  id: 'arctic-glass',
  name: 'Arctic Glass',
  ...BASE_TOKENS,
  colors: {
    background_primary: '#0a192f',
    background_secondary: '#112240',
    background_gradient: 'linear-gradient(180deg, #0a192f 0%, #112240 100%)',
    cosmic_overlay: 'rgba(10, 25, 47, 0.8)',
    neon_primary: '#60a5fa',
    neon_secondary: '#bfdbfe',
    neon_tertiary: '#3b82f6',
    text_primary: '#ffffff',
    text_secondary: '#a5f3fc',
    text_tertiary: 'rgba(255, 255, 255, 0.7)',
    text_glow: 'rgba(96, 165, 250, 0.6)',
    glass_highlight: 'rgba(255, 255, 255, 0.2)',
    glass_base: 'rgba(255, 255, 255, 0.1)',
    glass_border: 'rgba(255, 255, 255, 0.3)',
    shadow_neon_primary: '0 0 20px rgba(96, 165, 250, 0.5)',
    shadow_neon_secondary: '0 0 20px rgba(191, 219, 254, 0.5)',
    shadow_soft: '0 8px 32px rgba(0, 0, 0, 0.4)',
    glow_soft: '0 0 10px rgba(96, 165, 250, 0.3)',
    particle_primary: 'rgba(255, 255, 255, 0.9)',
    particle_secondary: 'rgba(255, 255, 255, 0.4)',
  },
  gradients: {
    background_main: 'linear-gradient(180deg, #0a192f 0%, #112240 100%)',
    background_radial: 'radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.1) 0%, transparent 70%)',
    glass_overlay: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
    neon_edge_primary: 'linear-gradient(90deg, transparent, #60a5fa, transparent)',
    neon_edge_secondary: 'linear-gradient(90deg, transparent, #bfdbfe, transparent)',
  },
  game: {
    background: {
      gradient: [
        { position: 0, hue: 200, saturation: 60, lightness: 10 },
        { position: 0.5, hue: 190, saturation: 50, lightness: 8 },
        { position: 1, hue: 210, saturation: 55, lightness: 12 },
      ],
      animated: true,
      animationSpeed: 0.5,
    },
    paddle_left: { color: '#60a5fa', shadow: 'rgba(96, 165, 250, 0.4)' },
    paddle_right: { color: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.4)' },
    ball: { color: '#bfdbfe', shadow: 'rgba(191, 219, 254, 0.5)', trail: 'rgba(191, 219, 254, 0.7)' },
    centerLine: { color: 'rgba(191, 219, 254, 0.3)', shadow: 'rgba(191, 219, 254, 0.2)' },
    score: { color: '#bfdbfe', shadow: 'rgba(191, 219, 254, 0.3)' },
    powerUp: {
      bigPaddle: '#60a5fa',
      fastBall: '#3b82f6',
      multiBall: '#93c5fd',
      shield: '#dbeafe',
    },
  },
  typography: {
    ...BASE_TOKENS.typography,
    textGlow: {
      primary: '0 0 10px rgba(96, 165, 250, 0.6)',
      subtle: '0 0 5px rgba(96, 165, 250, 0.3)',
      accent: '0 0 10px rgba(191, 219, 254, 0.6)',
    },
  },
};

/**
 * PUZZLE LOGIC
 */
export const PUZZLE_LOGIC: UnifiedTheme = {
  id: 'puzzle-logic',
  name: 'Puzzle Logic',
  ...BASE_TOKENS,
  colors: {
    background_primary: '#062016',
    background_secondary: '#0b2e1f',
    background_gradient: 'linear-gradient(180deg, #062016 0%, #0b2e1f 100%)',
    cosmic_overlay: 'rgba(6, 32, 22, 0.8)',
    neon_primary: '#10b981',
    neon_secondary: '#f59e0b',
    neon_tertiary: '#34d399',
    text_primary: '#ffffff',
    text_secondary: '#d1fae5',
    text_tertiary: 'rgba(255, 255, 255, 0.7)',
    text_glow: 'rgba(16, 185, 129, 0.6)',
    glass_highlight: 'rgba(255, 255, 255, 0.15)',
    glass_base: 'rgba(255, 255, 255, 0.05)',
    glass_border: 'rgba(255, 255, 255, 0.2)',
    shadow_neon_primary: '0 0 20px rgba(16, 185, 129, 0.5)',
    shadow_neon_secondary: '0 0 20px rgba(245, 158, 11, 0.5)',
    shadow_soft: '0 8px 32px rgba(0, 0, 0, 0.3)',
    glow_soft: '0 0 10px rgba(16, 185, 129, 0.3)',
    particle_primary: 'rgba(16, 185, 129, 0.9)',
    particle_secondary: 'rgba(16, 185, 129, 0.3)',
  },
  gradients: {
    background_main: 'linear-gradient(180deg, #062016 0%, #0b2e1f 100%)',
    background_radial: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
    glass_overlay: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
    neon_edge_primary: 'linear-gradient(90deg, transparent, #10b981, transparent)',
    neon_edge_secondary: 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
  },
  game: {
    background: {
      gradient: [
        { position: 0, hue: 160, saturation: 40, lightness: 8 },
        { position: 0.5, hue: 140, saturation: 35, lightness: 6 },
        { position: 1, hue: 120, saturation: 45, lightness: 10 },
      ],
      animated: true,
      animationSpeed: 0.7,
    },
    paddle_left: { color: '#10b981', shadow: 'rgba(16, 185, 129, 0.4)' },
    paddle_right: { color: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.4)' },
    ball: { color: '#34d399', shadow: 'rgba(52, 211, 153, 0.5)', trail: 'rgba(52, 211, 153, 0.7)' },
    centerLine: { color: 'rgba(16, 185, 129, 0.3)', shadow: 'rgba(16, 185, 129, 0.2)' },
    score: { color: '#d1fae5', shadow: 'rgba(209, 250, 229, 0.3)' },
    powerUp: {
      bigPaddle: '#10b981',
      fastBall: '#f59e0b',
      multiBall: '#fbbf24',
      shield: '#34d399',
    },
  },
  typography: {
    ...BASE_TOKENS.typography,
    textGlow: {
      primary: '0 0 10px rgba(16, 185, 129, 0.6)',
      subtle: '0 0 5px rgba(16, 185, 129, 0.3)',
      accent: '0 0 10px rgba(245, 158, 11, 0.6)',
    },
  },
};

/**
 * HIGH CONTRAST (AAA)
 */
export const HIGH_CONTRAST: UnifiedTheme = {
  id: 'high-contrast',
  name: 'High Contrast (AAA)',
  ...BASE_TOKENS,
  colors: {
    background_primary: '#000000',
    background_secondary: '#000000',
    background_gradient: 'linear-gradient(180deg, #000000 0%, #000000 100%)',
    cosmic_overlay: 'rgba(0, 0, 0, 0.9)',
    neon_primary: '#ffffff',
    neon_secondary: '#ffff00',
    neon_tertiary: '#00ffff',
    text_primary: '#ffffff',
    text_secondary: '#ffffff',
    text_tertiary: '#ffffff',
    text_glow: 'none',
    glass_highlight: 'none',
    glass_base: 'none',
    glass_border: '2px solid #ffffff',
    shadow_neon_primary: 'none',
    shadow_neon_secondary: 'none',
    shadow_soft: 'none',
    glow_soft: 'none',
    particle_primary: '#ffffff',
    particle_secondary: '#ffffff',
  },
  gradients: {
    background_main: 'linear-gradient(180deg, #000000 0%, #000000 100%)',
    background_radial: 'none',
    glass_overlay: 'none',
    neon_edge_primary: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
    neon_edge_secondary: 'linear-gradient(90deg, transparent, #ffff00, transparent)',
  },
  game: {
    background: {
      gradient: [
        { position: 0, hue: 0, saturation: 0, lightness: 0 },
        { position: 1, hue: 0, saturation: 0, lightness: 0 },
      ],
      animated: false,
      animationSpeed: 0,
    },
    paddle_left: { color: '#ffffff', shadow: 'transparent' },
    paddle_right: { color: '#ffffff', shadow: 'transparent' },
    ball: { color: '#ffffff', shadow: 'transparent', trail: 'rgba(255, 255, 255, 0.5)' },
    centerLine: { color: '#ffffff', shadow: 'transparent' },
    score: { color: '#ffffff', shadow: 'transparent' },
    powerUp: {
      bigPaddle: '#ffffff',
      fastBall: '#ffffff',
      multiBall: '#ffffff',
      shield: '#ffffff',
    },
  },
  typography: {
    ...BASE_TOKENS.typography,
    textGlow: {
      primary: 'none',
      subtle: 'none',
      accent: 'none',
    },
  },
};

/**
 * All available themes
 */
export const THEMES: Record<string, UnifiedTheme> = {
  'liquid-glass-sunset': LIQUID_GLASS_SUNSET,
  'arctic-glass': ARCTIC_GLASS,
  'puzzle-logic': PUZZLE_LOGIC,
  'high-contrast': HIGH_CONTRAST,
  // For compatibility with old system
  'synthwave-sunset': LIQUID_GLASS_SUNSET,
  'rhythm-beats': LIQUID_GLASS_SUNSET, // TODO: Implement dedicated Rhythm Beats
  'battle-intensity': LIQUID_GLASS_SUNSET, // TODO: Implement dedicated Battle Intensity
  'editor-pro': LIQUID_GLASS_SUNSET, // TODO: Implement dedicated Editor Pro
};

export interface ThemeExport {
  ui: UnifiedTheme;
  game: UnifiedTheme['game'];
}

export function createThemeExport(theme: UnifiedTheme): ThemeExport {
  return {
    ui: theme,
    game: theme.game,
  };
}

export default THEMES;
