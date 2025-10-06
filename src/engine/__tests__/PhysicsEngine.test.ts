/**
 * PhysicsEngine Tests
 * Testing strategy: Pure functions = easy to test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetBall,
  updateBallPosition,
  checkWallCollision,
  bounceOffWall,
  checkBallOutOfBounds,
  calculateBallSpeed,
  applySpeedLimits,
  calculatePaddleBounce,
  predictBallY,
  updatePaddlePosition,
  calculatePaddleVelocity,
  applyChaosEffect,
} from '../PhysicsEngine';
import type { Ball } from '../types';
import { DEFAULT_PHYSICS_CONFIG } from '../types';

describe('PhysicsEngine', () => {
  describe('resetBall', () => {
    it('should place ball at center of canvas', () => {
      const result = resetBall(800, 600);

      expect(result.x).toBe(400);
      expect(result.y).toBe(300);
    });

    it('should give ball initial horizontal velocity', () => {
      const result = resetBall(800, 600, 6, 3);

      expect(Math.abs(result.dx)).toBe(6);
    });

    it('should randomize horizontal direction', () => {
      const results = Array.from({ length: 20 }, () => resetBall(800, 600));
      const directions = results.map((r) => Math.sign(r.dx));

      // Should have both positive and negative (statistically very unlikely to fail)
      expect(directions.some((d) => d > 0)).toBe(true);
      expect(directions.some((d) => d < 0)).toBe(true);
    });

    it('should give ball vertical velocity within range', () => {
      const result = resetBall(800, 600, 6, 3);

      // dy should be between -2.4 and 2.4 (3 * 0.8 = 2.4)
      expect(result.dy).toBeGreaterThanOrEqual(-2.4);
      expect(result.dy).toBeLessThanOrEqual(2.4);
    });
  });

  describe('updateBallPosition', () => {
    it('should update ball position based on velocity', () => {
      const ball: Ball = {
        x: 100,
        y: 100,
        dx: 5,
        dy: 3,
        radius: 8,
        trail: [],
      };

      const result = updateBallPosition(ball, 1);

      expect(result.x).toBe(105);
      expect(result.y).toBe(103);
    });

    it('should apply speed multiplier correctly', () => {
      const ball: Ball = {
        x: 100,
        y: 100,
        dx: 5,
        dy: 3,
        radius: 8,
        trail: [],
      };

      const result = updateBallPosition(ball, 1.5);

      expect(result.x).toBe(107.5);
      expect(result.y).toBe(104.5);
    });

    it('should handle negative velocities', () => {
      const ball: Ball = {
        x: 100,
        y: 100,
        dx: -5,
        dy: -3,
        radius: 8,
        trail: [],
      };

      const result = updateBallPosition(ball, 1);

      expect(result.x).toBe(95);
      expect(result.y).toBe(97);
    });
  });

  describe('checkWallCollision', () => {
    it('should detect collision with top wall', () => {
      const ball: Ball = {
        x: 100,
        y: 5,
        dx: 0,
        dy: -3,
        radius: 8,
        trail: [],
      };

      expect(checkWallCollision(ball, 600)).toBe(true);
    });

    it('should detect collision with bottom wall', () => {
      const ball: Ball = {
        x: 100,
        y: 595,
        dx: 0,
        dy: 3,
        radius: 8,
        trail: [],
      };

      expect(checkWallCollision(ball, 600)).toBe(true);
    });

    it('should not detect collision when ball is in bounds', () => {
      const ball: Ball = {
        x: 100,
        y: 300,
        dx: 0,
        dy: 3,
        radius: 8,
        trail: [],
      };

      expect(checkWallCollision(ball, 600)).toBe(false);
    });
  });

  describe('bounceOffWall', () => {
    it('should reverse Y velocity', () => {
      const ball: Ball = {
        x: 100,
        y: 5,
        dx: 5,
        dy: -3,
        radius: 8,
        trail: [],
      };

      const result = bounceOffWall(ball);

      expect(result.dy).toBe(3);
    });
  });

  describe('checkBallOutOfBounds', () => {
    it('should detect ball going left', () => {
      const ball: Ball = {
        x: -5,
        y: 300,
        dx: -5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      expect(checkBallOutOfBounds(ball, 800)).toBe('left');
    });

    it('should detect ball going right', () => {
      const ball: Ball = {
        x: 805,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      expect(checkBallOutOfBounds(ball, 800)).toBe('right');
    });

    it('should return null when ball is in bounds', () => {
      const ball: Ball = {
        x: 400,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      expect(checkBallOutOfBounds(ball, 800)).toBe(null);
    });
  });

  describe('calculateBallSpeed', () => {
    it('should calculate speed from velocity components', () => {
      const ball: Ball = {
        x: 0,
        y: 0,
        dx: 3,
        dy: 4,
        radius: 8,
        trail: [],
      };

      // 3-4-5 triangle
      expect(calculateBallSpeed(ball)).toBe(5);
    });

    it('should return 0 for stationary ball', () => {
      const ball: Ball = {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        radius: 8,
        trail: [],
      };

      expect(calculateBallSpeed(ball)).toBe(0);
    });
  });

  describe('applySpeedLimits', () => {
    it('should not change speed if within limits', () => {
      const ball: Ball = {
        x: 0,
        y: 0,
        dx: 5,
        dy: 5,
        radius: 8,
        trail: [],
      };

      const result = applySpeedLimits(ball);

      expect(result.dx).toBe(5);
      expect(result.dy).toBe(5);
    });

    it('should boost slow ball to minimum speed', () => {
      const ball: Ball = {
        x: 0,
        y: 0,
        dx: 1,
        dy: 1,
        radius: 8,
        trail: [],
      };

      const result = applySpeedLimits(ball);
      const newSpeed = Math.sqrt(result.dx ** 2 + result.dy ** 2);

      expect(newSpeed).toBeCloseTo(DEFAULT_PHYSICS_CONFIG.minBallSpeed, 1);
    });

    it('should cap fast ball to maximum speed', () => {
      const ball: Ball = {
        x: 0,
        y: 0,
        dx: 20,
        dy: 20,
        radius: 8,
        trail: [],
      };

      const result = applySpeedLimits(ball);
      const newSpeed = Math.sqrt(result.dx ** 2 + result.dy ** 2);

      expect(newSpeed).toBeCloseTo(DEFAULT_PHYSICS_CONFIG.maxBallSpeed, 1);
    });
  });

  describe('calculatePaddleBounce', () => {
    it('should reverse horizontal direction', () => {
      const ball: Ball = {
        x: 50,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const result = calculatePaddleBounce(ball, 260, 80, 0);

      expect(Math.sign(result.dx)).toBe(-1);
    });

    it('should apply speed multiplier', () => {
      const ball: Ball = {
        x: 50,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const result = calculatePaddleBounce(ball, 260, 80, 0);

      expect(Math.abs(result.dx)).toBeGreaterThan(5);
    });

    it('should transfer paddle momentum', () => {
      const ball: Ball = {
        x: 50,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const resultUp = calculatePaddleBounce(ball, 260, 80, -5);
      const resultDown = calculatePaddleBounce(ball, 260, 80, 5);

      // Moving up should reduce dy, moving down should increase dy
      expect(resultUp.dy).toBeLessThan(resultDown.dy);
    });

    it('should apply hit position angle', () => {
      const ball: Ball = {
        x: 50,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const centerHit = calculatePaddleBounce(ball, 260, 80, 0); // Hit at paddle center (y=300)
      ball.y = 270; // Hit near top
      const topHit = calculatePaddleBounce(ball, 260, 80, 0);

      // Top hit should have more upward angle
      expect(topHit.dy).toBeLessThan(centerHit.dy);
    });
  });

  describe('predictBallY', () => {
    it('should predict ball position at target X', () => {
      const ball: Ball = {
        x: 100,
        y: 300,
        dx: 5,
        dy: 3,
        radius: 8,
        trail: [],
      };

      const predictedY = predictBallY(ball, 200, 600);

      // Time to reach 200: (200-100)/5 = 20 frames
      // Y change: 3 * 20 = 60
      expect(predictedY).toBe(360);
    });

    it('should handle wall bounces in prediction', () => {
      const ball: Ball = {
        x: 100,
        y: 50,
        dx: 5,
        dy: -10,
        radius: 8,
        trail: [],
      };

      const predictedY = predictBallY(ball, 200, 600);

      // Should predict bounce off top wall
      expect(predictedY).toBeGreaterThan(0);
      expect(predictedY).toBeLessThan(600);
    });

    it('should return current Y if ball has no horizontal velocity', () => {
      const ball: Ball = {
        x: 100,
        y: 300,
        dx: 0,
        dy: 5,
        radius: 8,
        trail: [],
      };

      const predictedY = predictBallY(ball, 200, 600);

      expect(predictedY).toBe(300);
    });
  });

  describe('updatePaddlePosition', () => {
    it('should update paddle position by movement', () => {
      const newY = updatePaddlePosition(100, 5, 80, 600);

      expect(newY).toBe(105);
    });

    it('should prevent paddle from going above top', () => {
      const newY = updatePaddlePosition(5, -10, 80, 600);

      expect(newY).toBe(0);
    });

    it('should prevent paddle from going below bottom', () => {
      const newY = updatePaddlePosition(550, 100, 80, 600);

      expect(newY).toBe(520); // 600 - 80 = 520
    });
  });

  describe('calculatePaddleVelocity', () => {
    it('should calculate positive velocity for downward movement', () => {
      const velocity = calculatePaddleVelocity(105, 100);

      expect(velocity).toBe(5);
    });

    it('should calculate negative velocity for upward movement', () => {
      const velocity = calculatePaddleVelocity(95, 100);

      expect(velocity).toBe(-5);
    });

    it('should return 0 for no movement', () => {
      const velocity = calculatePaddleVelocity(100, 100);

      expect(velocity).toBe(0);
    });
  });

  describe('applyChaosEffect', () => {
    it('should modify ball velocity', () => {
      const ball: Ball = {
        x: 100,
        y: 100,
        dx: 5,
        dy: 3,
        radius: 8,
        trail: [],
      };

      const result = applyChaosEffect(ball, 2);

      // Should be different (statistically almost certain)
      const isDifferent = result.dx !== ball.dx || result.dy !== ball.dy;
      expect(isDifferent).toBe(true);
    });

    it('should apply chaos within intensity range', () => {
      const ball: Ball = {
        x: 100,
        y: 100,
        dx: 5,
        dy: 3,
        radius: 8,
        trail: [],
      };

      const intensity = 2;
      const result = applyChaosEffect(ball, intensity);

      // Changes should be within +/- intensity
      expect(result.dx).toBeGreaterThanOrEqual(ball.dx - intensity);
      expect(result.dx).toBeLessThanOrEqual(ball.dx + intensity);
      expect(result.dy).toBeGreaterThanOrEqual(ball.dy - intensity);
      expect(result.dy).toBeLessThanOrEqual(ball.dy + intensity);
    });
  });
});
