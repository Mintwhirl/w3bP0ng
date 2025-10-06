/**
 * GameRenderer Tests
 * Testing instantiation, theme management, and error handling
 * Note: Visual rendering is tested manually/visually
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameRenderer } from '../GameRenderer';
import { DEFAULT_THEME, ARCTIC_GLASS_THEME } from '../types';
import type { RenderState } from '../types';

// Mock canvas for testing
function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  return canvas;
}

describe('GameRenderer', () => {
  let canvas: HTMLCanvasElement;
  let renderer: GameRenderer;

  beforeEach(() => {
    canvas = createMockCanvas();
    renderer = new GameRenderer(canvas);
  });

  describe('constructor', () => {
    it('should create renderer with canvas', () => {
      expect(renderer).toBeInstanceOf(GameRenderer);
    });

    it('should throw error if canvas context fails', () => {
      const badCanvas = {
        getContext: () => null,
      } as unknown as HTMLCanvasElement;

      expect(() => new GameRenderer(badCanvas)).toThrow(
        'Failed to get 2D rendering context'
      );
    });

    it('should initialize with default theme', () => {
      const theme = renderer.getTheme();

      expect(theme.id).toBe('synthwave-sunset');
    });

    it('should initialize with custom theme', () => {
      const customRenderer = new GameRenderer(canvas, ARCTIC_GLASS_THEME);
      const theme = customRenderer.getTheme();

      expect(theme.id).toBe('arctic-glass');
    });
  });

  describe('setTheme', () => {
    it('should change theme', () => {
      renderer.setTheme(ARCTIC_GLASS_THEME);
      const theme = renderer.getTheme();

      expect(theme.id).toBe('arctic-glass');
    });

    it('should allow switching back to default theme', () => {
      renderer.setTheme(ARCTIC_GLASS_THEME);
      renderer.setTheme(DEFAULT_THEME);
      const theme = renderer.getTheme();

      expect(theme.id).toBe('synthwave-sunset');
    });
  });

  describe('getTheme', () => {
    it('should return current theme', () => {
      const theme = renderer.getTheme();

      expect(theme).toBeDefined();
      expect(theme.id).toBeDefined();
      expect(theme.name).toBeDefined();
    });
  });

  describe('clear', () => {
    it('should call clearRect on canvas context', () => {
      // Just verify method exists and doesn't throw
      expect(() => renderer.clear()).not.toThrow();
    });
  });

  describe('render', () => {
    let mockState: RenderState;

    beforeEach(() => {
      mockState = {
        ball: {
          x: 400,
          y: 300,
          radius: 8,
          trail: [
            { x: 395, y: 300, size: 2, life: 15 },
            { x: 390, y: 300, size: 1.5, life: 10 },
          ],
        },
        paddles: {
          left: { x: 40, y: 260, width: 12, height: 80 },
          right: { x: 748, y: 260, width: 12, height: 80 },
        },
        score: { left: 3, right: 2 },
        gameWinner: null,
        screenShake: { x: 0, y: 0 },
        powerUps: [
          {
            x: 400,
            y: 200,
            type: 'bigPaddle',
            rotation: 0.5,
            color: '#3b82f6',
            symbol: 'B',
          },
        ],
        activePowerUps: {
          bigPaddle: { active: false, player: null },
          multiBall: { active: false, extraBalls: [] },
        },
      };
    });

    it('should render without errors', () => {
      expect(() => renderer.render(mockState)).not.toThrow();
    });

    it('should handle screen shake transform', () => {
      const shakeState = {
        ...mockState,
        screenShake: { x: 5, y: -3 },
      };

      expect(() => renderer.render(shakeState)).not.toThrow();
    });

    it('should render with game winner', () => {
      const winState = {
        ...mockState,
        gameWinner: 'left',
      };

      expect(() => renderer.render(winState)).not.toThrow();
    });

    it('should render with big paddle power-up active', () => {
      const bigPaddleState = {
        ...mockState,
        activePowerUps: {
          bigPaddle: { active: true, player: 'left' },
          multiBall: { active: false, extraBalls: [] },
        },
      };

      expect(() => renderer.render(bigPaddleState)).not.toThrow();
    });

    it('should render with multi-ball active', () => {
      const multiBallState = {
        ...mockState,
        activePowerUps: {
          bigPaddle: { active: false, player: null },
          multiBall: {
            active: true,
            extraBalls: [
              { x: 450, y: 300, radius: 6 },
              { x: 350, y: 300, radius: 6 },
            ],
          },
        },
      };

      expect(() => renderer.render(multiBallState)).not.toThrow();
    });

    it('should render multiple power-ups', () => {
      const multiPowerUpState = {
        ...mockState,
        powerUps: [
          { x: 300, y: 200, type: 'bigPaddle', rotation: 0, color: '#3b82f6', symbol: 'B' },
          { x: 500, y: 400, type: 'fastBall', rotation: 1, color: '#ef4444', symbol: 'F' },
          { x: 400, y: 300, type: 'multiBall', rotation: 0.5, color: '#f59e0b', symbol: 'M' },
          { x: 600, y: 150, type: 'shield', rotation: 2, color: '#10b981', symbol: 'S' },
        ],
      };

      expect(() => renderer.render(multiPowerUpState)).not.toThrow();
    });

    it('should handle empty particle trail', () => {
      const noTrailState = {
        ...mockState,
        ball: {
          ...mockState.ball,
          trail: [],
        },
      };

      expect(() => renderer.render(noTrailState)).not.toThrow();
    });

    it('should handle zero score', () => {
      const zeroScoreState = {
        ...mockState,
        score: { left: 0, right: 0 },
      };

      expect(() => renderer.render(zeroScoreState)).not.toThrow();
    });

    it('should gracefully handle rendering errors', () => {
      // Force an error by making context unavailable
      const ctx = canvas.getContext('2d');
      const originalFillRect = ctx!.fillRect;
      ctx!.fillRect = function() {
        throw new Error('Forced rendering error');
      };

      // Should not throw, should render fallback
      expect(() => renderer.render(mockState)).not.toThrow();

      // Restore
      ctx!.fillRect = originalFillRect;
    });
  });

  describe('theme variations', () => {
    it('should render with Arctic Glass theme', () => {
      renderer.setTheme(ARCTIC_GLASS_THEME);

      const mockState: RenderState = {
        ball: { x: 400, y: 300, radius: 8, trail: [] },
        paddles: {
          left: { x: 40, y: 260, width: 12, height: 80 },
          right: { x: 748, y: 260, width: 12, height: 80 },
        },
        score: { left: 5, right: 3 },
        gameWinner: null,
        screenShake: { x: 0, y: 0 },
        powerUps: [],
        activePowerUps: {
          bigPaddle: { active: false, player: null },
          multiBall: { active: false, extraBalls: [] },
        },
      };

      expect(() => renderer.render(mockState)).not.toThrow();
    });
  });
});
