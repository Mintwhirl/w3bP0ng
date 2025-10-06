/**
 * AIController Tests
 * Testing AI difficulty configurations, ball prediction, and movement logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { Ball, Paddle } from '../../engine/types';
import type { AIState } from '../AIController';
import {
  getAIConfig,
  predictBallPosition,
  calculateAITarget,
  updateAIPaddle,
  shouldReact,
  isBallApproaching,
  computeAIMove,
} from '../AIController';

describe('AIController', () => {
  describe('getAIConfig', () => {
    it('should return easy configuration', () => {
      const config = getAIConfig('easy');

      expect(config.speed).toBe(5.5);
      expect(config.reactionTime).toBe(12);
      expect(config.accuracy).toBe(0.8);
      expect(config.predictionEnabled).toBe(false);
    });

    it('should return medium configuration', () => {
      const config = getAIConfig('medium');

      expect(config.speed).toBe(6.5);
      expect(config.reactionTime).toBe(6);
      expect(config.accuracy).toBe(0.9);
      expect(config.predictionEnabled).toBe(true);
    });

    it('should return hard configuration', () => {
      const config = getAIConfig('hard');

      expect(config.speed).toBe(7.5);
      expect(config.reactionTime).toBe(2);
      expect(config.accuracy).toBe(0.98);
      expect(config.predictionEnabled).toBe(true);
    });

    it('should default to medium for invalid difficulty', () => {
      const config = getAIConfig('invalid' as any);

      expect(config.speed).toBe(6.5);
      expect(config.reactionTime).toBe(6);
    });
  });

  describe('predictBallPosition', () => {
    it('should predict straight horizontal ball path', () => {
      const ball: Ball = {
        x: 100,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const predicted = predictBallPosition(ball, 700, 600);

      expect(predicted).toBe(300);
    });

    it('should predict diagonal ball path without bounces', () => {
      const ball: Ball = {
        x: 100,
        y: 300,
        dx: 5,
        dy: 2,
        radius: 8,
        trail: [],
      };

      const predicted = predictBallPosition(ball, 700, 600);

      // Time to reach = (700-100)/5 = 120 frames
      // Y = 300 + 2*120 = 540
      expect(predicted).toBe(540);
    });

    it('should handle ball moving away (dx = 0)', () => {
      const ball: Ball = {
        x: 400,
        y: 300,
        dx: 0,
        dy: 5,
        radius: 8,
        trail: [],
      };

      const predicted = predictBallPosition(ball, 700, 600);

      expect(predicted).toBe(300);
    });

    it('should simulate top wall bounce', () => {
      const ball: Ball = {
        x: 100,
        y: 50,
        dx: 5,
        dy: -3,
        radius: 8,
        trail: [],
      };

      const predicted = predictBallPosition(ball, 700, 600);

      // Ball will hit top and bounce
      expect(predicted).toBeGreaterThanOrEqual(0);
      expect(predicted).toBeLessThanOrEqual(600);
    });

    it('should simulate bottom wall bounce', () => {
      const ball: Ball = {
        x: 100,
        y: 550,
        dx: 5,
        dy: 3,
        radius: 8,
        trail: [],
      };

      const predicted = predictBallPosition(ball, 700, 600);

      // Ball will hit bottom and bounce
      expect(predicted).toBeGreaterThanOrEqual(0);
      expect(predicted).toBeLessThanOrEqual(600);
    });

    it('should handle multiple bounces', () => {
      const ball: Ball = {
        x: 100,
        y: 500,
        dx: 2,
        dy: 10, // Very high dy, will bounce many times
        radius: 8,
        trail: [],
      };

      const predicted = predictBallPosition(ball, 700, 600);

      expect(predicted).toBeGreaterThanOrEqual(0);
      expect(predicted).toBeLessThanOrEqual(600);
    });

    it('should handle negative target X (ball moving left)', () => {
      const ball: Ball = {
        x: 600,
        y: 300,
        dx: -5,
        dy: 2,
        radius: 8,
        trail: [],
      };

      const predicted = predictBallPosition(ball, 100, 600);

      expect(predicted).toBeGreaterThanOrEqual(0);
      expect(predicted).toBeLessThanOrEqual(600);
    });
  });

  describe('calculateAITarget', () => {
    const canvasHeight = 600;

    it('should use prediction when enabled (medium/hard)', () => {
      const ball: Ball = {
        x: 100,
        y: 300,
        dx: 5,
        dy: 3,
        radius: 8,
        trail: [],
      };
      const paddle: Paddle = {
        x: 700,
        y: 260,
        width: 12,
        height: 80,
        speed: 6.5,
        prevY: 260,
        velocity: 0,
      };
      const config = getAIConfig('medium');

      const target = calculateAITarget(ball, paddle, canvasHeight, config);

      // Target should be somewhere reasonable (with some inaccuracy)
      expect(target).toBeGreaterThanOrEqual(0);
      expect(target).toBeLessThanOrEqual(canvasHeight);
    });

    it('should follow current position when prediction disabled (easy)', () => {
      const ball: Ball = {
        x: 100,
        y: 300,
        dx: 5,
        dy: 3,
        radius: 8,
        trail: [],
      };
      const paddle: Paddle = {
        x: 700,
        y: 260,
        width: 12,
        height: 80,
        speed: 5.5,
        prevY: 260,
        velocity: 0,
      };
      const config = getAIConfig('easy');

      const target = calculateAITarget(ball, paddle, canvasHeight, config);

      // Should be close to ball.y (300) with some inaccuracy
      expect(target).toBeGreaterThan(200);
      expect(target).toBeLessThan(400);
    });

    it('should add inaccuracy based on accuracy setting', () => {
      const ball: Ball = {
        x: 100,
        y: 300,
        dx: 5,
        dy: 0, // Straight path for predictability
        radius: 8,
        trail: [],
      };
      const paddle: Paddle = {
        x: 700,
        y: 260,
        width: 12,
        height: 80,
        speed: 7.5,
        prevY: 260,
        velocity: 0,
      };

      // Run multiple times to check randomness
      const targets: number[] = [];
      const config = getAIConfig('hard');

      for (let i = 0; i < 20; i++) {
        const target = calculateAITarget(ball, paddle, canvasHeight, config);
        targets.push(target);
      }

      // Should have some variation (not all the same)
      const uniqueTargets = new Set(targets);
      expect(uniqueTargets.size).toBeGreaterThan(1);
    });

    it('should clamp target to valid range', () => {
      const ball: Ball = {
        x: 100,
        y: 50,
        dx: 5,
        dy: -20, // Extreme angle
        radius: 8,
        trail: [],
      };
      const paddle: Paddle = {
        x: 700,
        y: 260,
        width: 12,
        height: 80,
        speed: 6.5,
        prevY: 260,
        velocity: 0,
      };
      const config = getAIConfig('medium');

      const target = calculateAITarget(ball, paddle, canvasHeight, config);

      expect(target).toBeGreaterThanOrEqual(0);
      expect(target).toBeLessThanOrEqual(canvasHeight);
    });
  });

  describe('updateAIPaddle', () => {
    const canvasHeight = 600;

    it('should move paddle up towards target', () => {
      const paddle: Paddle = {
        x: 700,
        y: 300,
        width: 12,
        height: 80,
        speed: 6.5,
        prevY: 300,
        velocity: 0,
      };
      const config = getAIConfig('medium');
      const targetY = 100; // Above current position

      const newY = updateAIPaddle(paddle, targetY, canvasHeight, config);

      expect(newY).toBeLessThan(paddle.y);
      expect(newY).toBeCloseTo(300 - 6.5, 1);
    });

    it('should move paddle down towards target', () => {
      const paddle: Paddle = {
        x: 700,
        y: 100,
        width: 12,
        height: 80,
        speed: 6.5,
        prevY: 100,
        velocity: 0,
      };
      const config = getAIConfig('medium');
      const targetY = 400; // Below current position

      const newY = updateAIPaddle(paddle, targetY, canvasHeight, config);

      expect(newY).toBeGreaterThan(paddle.y);
      expect(newY).toBeCloseTo(100 + 6.5, 1);
    });

    it('should not move if within dead zone', () => {
      const paddle: Paddle = {
        x: 700,
        y: 300,
        width: 12,
        height: 80,
        speed: 6.5,
        prevY: 300,
        velocity: 0,
      };
      const config = getAIConfig('medium');
      const targetY = 340; // Paddle center (300 + 80/2 = 340) - within dead zone

      const newY = updateAIPaddle(paddle, targetY, canvasHeight, config);

      expect(newY).toBe(paddle.y);
    });

    it('should clamp to top boundary', () => {
      const paddle: Paddle = {
        x: 700,
        y: 3,
        width: 12,
        height: 80,
        speed: 6.5,
        prevY: 3,
        velocity: 0,
      };
      const config = getAIConfig('medium');
      const targetY = -100; // Way above screen

      const newY = updateAIPaddle(paddle, targetY, canvasHeight, config);

      expect(newY).toBe(0);
    });

    it('should clamp to bottom boundary', () => {
      const paddle: Paddle = {
        x: 700,
        y: 515,
        width: 12,
        height: 80,
        speed: 6.5,
        prevY: 515,
        velocity: 0,
      };
      const config = getAIConfig('medium');
      const targetY = 900; // Way below screen

      const newY = updateAIPaddle(paddle, targetY, canvasHeight, config);

      expect(newY).toBe(520); // 600 - 80
    });

    it('should respect AI speed from config', () => {
      const paddle: Paddle = {
        x: 700,
        y: 300,
        width: 12,
        height: 80,
        speed: 6.5,
        prevY: 300,
        velocity: 0,
      };
      const easyConfig = getAIConfig('easy');
      const hardConfig = getAIConfig('hard');
      const targetY = 100;

      const newYEasy = updateAIPaddle(paddle, targetY, canvasHeight, easyConfig);
      const newYHard = updateAIPaddle(paddle, targetY, canvasHeight, hardConfig);

      // Hard should move faster than easy
      expect(300 - newYHard).toBeGreaterThan(300 - newYEasy);
    });
  });

  describe('shouldReact', () => {
    it('should return true when enough time has passed', () => {
      const currentTime = 1000;
      const lastReactionTime = 0;
      const config = getAIConfig('medium'); // 6 frames = ~100ms

      const should = shouldReact(currentTime, lastReactionTime, config);

      expect(should).toBe(true);
    });

    it('should return false when not enough time has passed', () => {
      const currentTime = 50;
      const lastReactionTime = 0;
      const config = getAIConfig('medium'); // 6 frames = ~100ms

      const should = shouldReact(currentTime, lastReactionTime, config);

      expect(should).toBe(false);
    });

    it('should have different thresholds for different difficulties', () => {
      const currentTime = 80;
      const lastReactionTime = 0;

      const easyShould = shouldReact(currentTime, lastReactionTime, getAIConfig('easy'));
      const hardShould = shouldReact(currentTime, lastReactionTime, getAIConfig('hard'));

      // Hard AI reacts faster, so should be true
      expect(hardShould).toBe(true);
      // Easy AI is slower, so should be false
      expect(easyShould).toBe(false);
    });
  });

  describe('isBallApproaching', () => {
    it('should return true when ball approaches right paddle', () => {
      const ball: Ball = {
        x: 300,
        y: 300,
        dx: 5, // Moving right
        dy: 0,
        radius: 8,
        trail: [],
      };
      const paddleX = 750; // Right side

      const approaching = isBallApproaching(ball, paddleX);

      expect(approaching).toBe(true);
    });

    it('should return false when ball moves away from right paddle', () => {
      const ball: Ball = {
        x: 600,
        y: 300,
        dx: -5, // Moving left
        dy: 0,
        radius: 8,
        trail: [],
      };
      const paddleX = 750; // Right side

      const approaching = isBallApproaching(ball, paddleX);

      expect(approaching).toBe(false);
    });

    it('should return true when ball approaches left paddle', () => {
      const ball: Ball = {
        x: 500,
        y: 300,
        dx: -5, // Moving left
        dy: 0,
        radius: 8,
        trail: [],
      };
      const paddleX = 40; // Left side

      const approaching = isBallApproaching(ball, paddleX);

      expect(approaching).toBe(true);
    });

    it('should return false when ball moves away from left paddle', () => {
      const ball: Ball = {
        x: 100,
        y: 300,
        dx: 5, // Moving right
        dy: 0,
        radius: 8,
        trail: [],
      };
      const paddleX = 40; // Left side

      const approaching = isBallApproaching(ball, paddleX);

      expect(approaching).toBe(false);
    });
  });

  describe('computeAIMove', () => {
    const canvasHeight = 600;
    let ball: Ball;
    let paddle: Paddle;
    let aiState: AIState;

    beforeEach(() => {
      ball = {
        x: 200,
        y: 300,
        dx: 5,
        dy: 2,
        radius: 8,
        trail: [],
      };

      paddle = {
        x: 750,
        y: 260,
        width: 12,
        height: 80,
        speed: 6.5,
        prevY: 260,
        velocity: 0,
      };

      aiState = {
        targetY: 300,
        lastReactionTime: 0,
      };
    });

    it('should not move when ball is moving away', () => {
      ball.dx = -5; // Ball moving left, away from right paddle

      const result = computeAIMove(ball, paddle, aiState, canvasHeight, 'medium', 1000);

      expect(result.newPaddleY).toBe(paddle.y);
      expect(result.newAIState).toEqual(aiState);
    });

    it('should update target when enough time has passed', () => {
      const result = computeAIMove(ball, paddle, aiState, canvasHeight, 'medium', 1000);

      expect(result.newAIState.lastReactionTime).toBe(1000);
      expect(result.newAIState.targetY).not.toBe(aiState.targetY);
    });

    it('should continue towards old target if reaction time not met', () => {
      const result = computeAIMove(ball, paddle, aiState, canvasHeight, 'medium', 50);

      // Should keep old target
      expect(result.newAIState.lastReactionTime).toBe(0);
      expect(result.newAIState.targetY).toBe(300);
    });

    it('should move paddle towards target', () => {
      aiState.targetY = 100; // Target above current position

      const result = computeAIMove(ball, paddle, aiState, canvasHeight, 'medium', 50);

      expect(result.newPaddleY).toBeLessThan(paddle.y);
    });

    it('should respect difficulty settings', () => {
      const easyResult = computeAIMove(ball, paddle, aiState, canvasHeight, 'easy', 1000);
      const hardResult = computeAIMove(ball, paddle, aiState, canvasHeight, 'hard', 1000);

      // Both should have updated, but potentially different targets due to accuracy
      expect(easyResult.newAIState.lastReactionTime).toBe(1000);
      expect(hardResult.newAIState.lastReactionTime).toBe(1000);
    });

    it('should handle multiple sequential updates', () => {
      // Set ball to extreme position to force movement
      ball.y = 500; // Far from paddle center
      ball.dy = 5;

      aiState.targetY = 100; // Target far from current position

      let currentAIState = aiState;
      let currentPaddleY = paddle.y;
      let currentTime = 0;

      // Simulate 5 frames
      for (let i = 0; i < 5; i++) {
        currentTime += 16.67;
        const tempPaddle = { ...paddle, y: currentPaddleY };

        const result = computeAIMove(
          ball,
          tempPaddle,
          currentAIState,
          canvasHeight,
          'medium',
          currentTime
        );

        currentAIState = result.newAIState;
        currentPaddleY = result.newPaddleY;
      }

      // Paddle should have moved towards target
      expect(currentPaddleY).toBeLessThan(paddle.y);
    });
  });
});
