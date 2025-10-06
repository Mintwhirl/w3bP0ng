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
 * All available themes
 */
export const THEMES: Record<string, Theme> = {
  'synthwave-sunset': DEFAULT_THEME,
  'arctic-glass': ARCTIC_GLASS_THEME,
};
