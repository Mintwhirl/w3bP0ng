/**
 * Tests for rendering type definitions and theme utilities
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_THEME,
  ARCTIC_GLASS_THEME,
  PUZZLE_THEME,
  RHYTHM_THEME,
  BATTLE_THEME,
  EDITOR_THEME,
  THEMES,
  MODE_THEMES,
  getContrastRatio,
  meetsWCAG_AA,
  validateThemeAccessibility,
  applyThemeAsCSSVariables,
  type Theme,
} from '../types';

describe('Theme Definitions', () => {
  describe('DEFAULT_THEME (Synthwave Sunset)', () => {
    it('should have correct id and name', () => {
      expect(DEFAULT_THEME.id).toBe('synthwave-sunset');
      expect(DEFAULT_THEME.name).toBe('Synthwave Sunset');
    });

    it('should have animated background with correct speed', () => {
      expect(DEFAULT_THEME.background.animated).toBe(true);
      expect(DEFAULT_THEME.background.animationSpeed).toBe(1.0);
    });

    it('should have gradient with 3 stops', () => {
      expect(DEFAULT_THEME.background.gradient).toHaveLength(3);
      expect(DEFAULT_THEME.background.gradient[0]?.position).toBe(0);
      expect(DEFAULT_THEME.background.gradient[2]?.position).toBe(1);
    });

    it('should have distinct paddle colors', () => {
      expect(DEFAULT_THEME.paddle.left.color).toBe('#ed64a6');
      expect(DEFAULT_THEME.paddle.right.color).toBe('#6d28d9');
    });

    it('should have all required power-up colors', () => {
      expect(DEFAULT_THEME.powerUp.bigPaddle).toBeDefined();
      expect(DEFAULT_THEME.powerUp.fastBall).toBeDefined();
      expect(DEFAULT_THEME.powerUp.multiBall).toBeDefined();
      expect(DEFAULT_THEME.powerUp.shield).toBeDefined();
    });
  });

  describe('ARCTIC_GLASS_THEME', () => {
    it('should have correct id and name', () => {
      expect(ARCTIC_GLASS_THEME.id).toBe('arctic-glass');
      expect(ARCTIC_GLASS_THEME.name).toBe('Arctic Glass');
    });

    it('should have slower animation speed for calmer feel', () => {
      expect(ARCTIC_GLASS_THEME.background.animationSpeed).toBe(0.5);
    });

    it('should use blue color palette', () => {
      expect(ARCTIC_GLASS_THEME.paddle.left.color).toBe('#60a5fa');
      expect(ARCTIC_GLASS_THEME.paddle.right.color).toBe('#3b82f6');
      expect(ARCTIC_GLASS_THEME.ball.color).toBe('#bfdbfe');
    });
  });

  describe('PUZZLE_THEME', () => {
    it('should have correct id and name', () => {
      expect(PUZZLE_THEME.id).toBe('puzzle-logic');
      expect(PUZZLE_THEME.name).toBe('Puzzle Logic');
    });

    it('should use green/amber color palette', () => {
      expect(PUZZLE_THEME.paddle.left.color).toBe('#10b981');
      expect(PUZZLE_THEME.paddle.right.color).toBe('#f59e0b');
    });

    it('should have medium animation speed', () => {
      expect(PUZZLE_THEME.background.animationSpeed).toBe(0.7);
    });
  });

  describe('RHYTHM_THEME', () => {
    it('should have correct id and name', () => {
      expect(RHYTHM_THEME.id).toBe('rhythm-beats');
      expect(RHYTHM_THEME.name).toBe('Rhythm Beats');
    });

    it('should use cyan/blue color palette', () => {
      expect(RHYTHM_THEME.paddle.left.color).toBe('#06b6d4');
      expect(RHYTHM_THEME.paddle.right.color).toBe('#3b82f6');
    });

    it('should have fast animation speed for energy', () => {
      expect(RHYTHM_THEME.background.animationSpeed).toBe(1.5);
    });
  });

  describe('BATTLE_THEME', () => {
    it('should have correct id and name', () => {
      expect(BATTLE_THEME.id).toBe('battle-intensity');
      expect(BATTLE_THEME.name).toBe('Battle Intensity');
    });

    it('should use red/orange color palette', () => {
      expect(BATTLE_THEME.paddle.left.color).toBe('#ef4444');
      expect(BATTLE_THEME.paddle.right.color).toBe('#f97316');
    });

    it('should have appropriate animation speed', () => {
      expect(BATTLE_THEME.background.animationSpeed).toBe(1.2);
    });
  });

  describe('EDITOR_THEME', () => {
    it('should have correct id and name', () => {
      expect(EDITOR_THEME.id).toBe('editor-pro');
      expect(EDITOR_THEME.name).toBe('Editor Pro');
    });

    it('should use cool gray/blue color palette', () => {
      expect(EDITOR_THEME.paddle.left.color).toBe('#64748b');
      expect(EDITOR_THEME.paddle.right.color).toBe('#475569');
    });

    it('should have slow animation speed for professional feel', () => {
      expect(EDITOR_THEME.background.animationSpeed).toBe(0.5);
    });
  });
});

describe('Theme Registry', () => {
  describe('THEMES record', () => {
    it('should contain all 6 themes', () => {
      expect(Object.keys(THEMES)).toHaveLength(6);
    });

    it('should map theme IDs to theme objects', () => {
      expect(THEMES['synthwave-sunset']).toBe(DEFAULT_THEME);
      expect(THEMES['arctic-glass']).toBe(ARCTIC_GLASS_THEME);
      expect(THEMES['puzzle-logic']).toBe(PUZZLE_THEME);
      expect(THEMES['rhythm-beats']).toBe(RHYTHM_THEME);
      expect(THEMES['battle-intensity']).toBe(BATTLE_THEME);
      expect(THEMES['editor-pro']).toBe(EDITOR_THEME);
    });

    it('should have all themes with unique IDs', () => {
      const ids = Object.values(THEMES).map((theme) => theme.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(6);
    });
  });

  describe('MODE_THEMES mapping', () => {
    it('should map menu mode to synthwave-sunset', () => {
      expect(MODE_THEMES['menu']).toBe('synthwave-sunset');
    });

    it('should map classic mode to synthwave-sunset', () => {
      expect(MODE_THEMES['classic']).toBe('synthwave-sunset');
    });

    it('should map puzzle mode to puzzle-logic', () => {
      expect(MODE_THEMES['puzzle']).toBe('puzzle-logic');
    });

    it('should map rhythm mode to rhythm-beats', () => {
      expect(MODE_THEMES['rhythm']).toBe('rhythm-beats');
    });

    it('should map battle-royale mode to battle-intensity', () => {
      expect(MODE_THEMES['battle-royale']).toBe('battle-intensity');
    });

    it('should map editor mode to editor-pro', () => {
      expect(MODE_THEMES['editor']).toBe('editor-pro');
    });

    it('should map all modes to valid theme IDs', () => {
      Object.values(MODE_THEMES).forEach((themeId) => {
        expect(THEMES[themeId]).toBeDefined();
      });
    });
  });
});

describe('WCAG AA Contrast Utilities', () => {
  describe('getContrastRatio', () => {
    it('should return 21 for black vs white (maximum contrast)', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should return 1 for same colors (no contrast)', () => {
      const ratio = getContrastRatio('#ffffff', '#ffffff');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should be commutative (order does not matter)', () => {
      const ratio1 = getContrastRatio('#ed64a6', '#0a0a14');
      const ratio2 = getContrastRatio('#0a0a14', '#ed64a6');
      expect(ratio1).toBeCloseTo(ratio2, 2);
    });

    it('should handle hex colors without # prefix', () => {
      const ratio1 = getContrastRatio('#ffffff', '#000000');
      const ratio2 = getContrastRatio('ffffff', '000000');
      expect(ratio1).toBeCloseTo(ratio2, 2);
    });

    it('should return 1 for invalid colors', () => {
      const ratio = getContrastRatio('not-a-color', '#ffffff');
      expect(ratio).toBe(1);
    });
  });

  describe('meetsWCAG_AA', () => {
    it('should pass for black text on white background (normal text)', () => {
      expect(meetsWCAG_AA('#000000', '#ffffff', false)).toBe(true);
    });

    it('should fail for low contrast combinations', () => {
      expect(meetsWCAG_AA('#cccccc', '#ffffff', false)).toBe(false);
    });

    it('should use 4.5:1 ratio for normal text', () => {
      // #767676 vs #ffffff has ratio of 4.54:1 (just passes)
      expect(meetsWCAG_AA('#767676', '#ffffff', false)).toBe(true);
      // #777777 vs #ffffff has ratio of 4.48:1 (just fails)
      expect(meetsWCAG_AA('#777777', '#ffffff', false)).toBe(false);
    });

    it('should use 3:1 ratio for large text', () => {
      // #949494 vs #ffffff has ratio of ~3.05:1 (passes for large text)
      expect(meetsWCAG_AA('#949494', '#ffffff', true)).toBe(true);
      // Should still fail for normal text
      expect(meetsWCAG_AA('#949494', '#ffffff', false)).toBe(false);
    });
  });

  describe('validateThemeAccessibility', () => {
    it('should return no warnings for DEFAULT_THEME', () => {
      const warnings = validateThemeAccessibility(DEFAULT_THEME);
      expect(warnings).toHaveLength(0);
    });

    it('should return no warnings for PUZZLE_THEME', () => {
      const warnings = validateThemeAccessibility(PUZZLE_THEME);
      expect(warnings).toHaveLength(0);
    });

    it('should return no warnings for RHYTHM_THEME', () => {
      const warnings = validateThemeAccessibility(RHYTHM_THEME);
      expect(warnings).toHaveLength(0);
    });

    it('should return no warnings for BATTLE_THEME', () => {
      const warnings = validateThemeAccessibility(BATTLE_THEME);
      expect(warnings).toHaveLength(0);
    });

    it('should return no warnings for EDITOR_THEME', () => {
      const warnings = validateThemeAccessibility(EDITOR_THEME);
      expect(warnings).toHaveLength(0);
    });

    it('should warn for theme with low score contrast', () => {
      const lowContrastTheme: Theme = {
        ...DEFAULT_THEME,
        score: {
          color: '#333333', // Very dark gray on dark background
          shadowColor: 'rgba(51, 51, 51, 0.3)',
        },
      };

      const warnings = validateThemeAccessibility(lowContrastTheme);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain('Score text contrast too low');
    });
  });
});

describe('CSS Variables System', () => {
  describe('applyThemeAsCSSVariables', () => {
    it('should set paddle color variables', () => {
      applyThemeAsCSSVariables(DEFAULT_THEME);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--theme-paddle-left')).toBe('#ed64a6');
      expect(root.style.getPropertyValue('--theme-paddle-right')).toBe('#6d28d9');
    });

    it('should set ball color variables', () => {
      applyThemeAsCSSVariables(DEFAULT_THEME);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--theme-ball')).toBe('#81ecec');
      expect(root.style.getPropertyValue('--theme-ball-trail')).toBe('rgba(129, 236, 236, 0.7)');
    });

    it('should set score color variable', () => {
      applyThemeAsCSSVariables(DEFAULT_THEME);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--theme-score')).toBe('#ffffff');
    });

    it('should set power-up color variables', () => {
      applyThemeAsCSSVariables(DEFAULT_THEME);

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--theme-powerup-big-paddle')).toBe('#3b82f6');
      expect(root.style.getPropertyValue('--theme-powerup-fast-ball')).toBe('#ef4444');
      expect(root.style.getPropertyValue('--theme-powerup-multi-ball')).toBe('#f59e0b');
      expect(root.style.getPropertyValue('--theme-powerup-shield')).toBe('#10b981');
    });

    it('should set background gradient variable', () => {
      applyThemeAsCSSVariables(DEFAULT_THEME);

      const root = document.documentElement;
      const gradient = root.style.getPropertyValue('--theme-bg-gradient');
      expect(gradient).toContain('linear-gradient');
      expect(gradient).toContain('hsl(');
    });

    it('should update variables when theme changes', () => {
      applyThemeAsCSSVariables(DEFAULT_THEME);
      let root = document.documentElement;
      expect(root.style.getPropertyValue('--theme-paddle-left')).toBe('#ed64a6');

      applyThemeAsCSSVariables(ARCTIC_GLASS_THEME);
      root = document.documentElement;
      expect(root.style.getPropertyValue('--theme-paddle-left')).toBe('#60a5fa');
    });

    it('should work for all theme variants', () => {
      const themes = [
        DEFAULT_THEME,
        ARCTIC_GLASS_THEME,
        PUZZLE_THEME,
        RHYTHM_THEME,
        BATTLE_THEME,
        EDITOR_THEME,
      ];

      themes.forEach((theme) => {
        applyThemeAsCSSVariables(theme);
        const root = document.documentElement;
        expect(root.style.getPropertyValue('--theme-paddle-left')).toBe(theme.paddle.left.color);
        expect(root.style.getPropertyValue('--theme-ball')).toBe(theme.ball.color);
      });
    });
  });
});

describe('Theme Structure Validation', () => {
  it('should have all required properties in each theme', () => {
    Object.values(THEMES).forEach((theme) => {
      // Required top-level properties
      expect(theme.id).toBeDefined();
      expect(theme.name).toBeDefined();
      expect(theme.background).toBeDefined();
      expect(theme.paddle).toBeDefined();
      expect(theme.ball).toBeDefined();
      expect(theme.centerLine).toBeDefined();
      expect(theme.score).toBeDefined();
      expect(theme.powerUp).toBeDefined();

      // Background properties
      expect(theme.background.gradient).toBeInstanceOf(Array);
      expect(theme.background.gradient.length).toBeGreaterThan(0);
      expect(theme.background.animated).toBeDefined();
      expect(theme.background.animationSpeed).toBeGreaterThan(0);

      // Paddle properties
      expect(theme.paddle.left.color).toBeDefined();
      expect(theme.paddle.left.shadowColor).toBeDefined();
      expect(theme.paddle.right.color).toBeDefined();
      expect(theme.paddle.right.shadowColor).toBeDefined();

      // Ball properties
      expect(theme.ball.color).toBeDefined();
      expect(theme.ball.shadowColor).toBeDefined();
      expect(theme.ball.trailColor).toBeDefined();

      // Power-up properties
      expect(theme.powerUp.bigPaddle).toBeDefined();
      expect(theme.powerUp.fastBall).toBeDefined();
      expect(theme.powerUp.multiBall).toBeDefined();
      expect(theme.powerUp.shield).toBeDefined();
    });
  });

  it('should have valid gradient stops', () => {
    Object.values(THEMES).forEach((theme) => {
      theme.background.gradient.forEach((stop) => {
        expect(stop.position).toBeGreaterThanOrEqual(0);
        expect(stop.position).toBeLessThanOrEqual(1);
        expect(stop.hue).toBeGreaterThanOrEqual(0);
        expect(stop.hue).toBeLessThanOrEqual(360);
        expect(stop.saturation).toBeGreaterThanOrEqual(0);
        expect(stop.saturation).toBeLessThanOrEqual(100);
        expect(stop.lightness).toBeGreaterThanOrEqual(0);
        expect(stop.lightness).toBeLessThanOrEqual(100);
      });
    });
  });
});
