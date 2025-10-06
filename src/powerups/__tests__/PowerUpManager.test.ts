/**
 * PowerUpManager Tests
 * Testing power-up spawn logic, collision detection, and animations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { Ball } from '../../engine/types';
import type { PowerUp } from '../PowerUpManager';
import {
  POWER_UP_TYPES,
  generateSpawnTimer,
  spawnPowerUp,
  updatePowerUpAnimation,
  checkPowerUpCollision,
  getPowerUpOwner,
  getPowerUpConfig,
  shouldSpawnPowerUp,
  updateAllPowerUps,
  findCollidingPowerUp,
  removePowerUp,
} from '../PowerUpManager';

describe('PowerUpManager', () => {
  const canvasWidth = 800;
  const canvasHeight = 600;

  describe('POWER_UP_TYPES', () => {
    it('should define all 4 power-up types', () => {
      expect(POWER_UP_TYPES).toHaveLength(4);
    });

    it('should have bigPaddle type', () => {
      const bigPaddle = POWER_UP_TYPES.find((p) => p.type === 'bigPaddle');
      expect(bigPaddle).toBeDefined();
      expect(bigPaddle?.color).toBe('#3b82f6');
      expect(bigPaddle?.symbol).toBe('B');
      expect(bigPaddle?.duration).toBe(480);
    });

    it('should have fastBall type', () => {
      const fastBall = POWER_UP_TYPES.find((p) => p.type === 'fastBall');
      expect(fastBall).toBeDefined();
      expect(fastBall?.color).toBe('#ef4444');
      expect(fastBall?.symbol).toBe('F');
      expect(fastBall?.duration).toBe(360);
    });

    it('should have multiBall type', () => {
      const multiBall = POWER_UP_TYPES.find((p) => p.type === 'multiBall');
      expect(multiBall).toBeDefined();
      expect(multiBall?.color).toBe('#f59e0b');
      expect(multiBall?.symbol).toBe('M');
      expect(multiBall?.duration).toBe(600);
    });

    it('should have shield type', () => {
      const shield = POWER_UP_TYPES.find((p) => p.type === 'shield');
      expect(shield).toBeDefined();
      expect(shield?.color).toBe('#10b981');
      expect(shield?.symbol).toBe('S');
      expect(shield?.uses).toBe(1);
    });
  });

  describe('generateSpawnTimer', () => {
    it('should return a positive number', () => {
      const timer = generateSpawnTimer();
      expect(timer).toBeGreaterThan(0);
    });

    it('should return frames in reasonable range (2-10 seconds)', () => {
      const timer = generateSpawnTimer();
      expect(timer).toBeGreaterThanOrEqual(120); // 2 seconds * 60fps
      expect(timer).toBeLessThanOrEqual(600); // 10 seconds * 60fps
    });

    it('should generate random values', () => {
      const timers = Array.from({ length: 20 }, () => generateSpawnTimer());
      const uniqueTimers = new Set(timers);
      expect(uniqueTimers.size).toBeGreaterThan(1);
    });
  });

  describe('spawnPowerUp', () => {
    it('should create a power-up with all required properties', () => {
      const powerUp = spawnPowerUp(canvasWidth, canvasHeight, 1000);

      expect(powerUp).toHaveProperty('id');
      expect(powerUp).toHaveProperty('type');
      expect(powerUp).toHaveProperty('color');
      expect(powerUp).toHaveProperty('symbol');
      expect(powerUp).toHaveProperty('x');
      expect(powerUp).toHaveProperty('y');
      expect(powerUp).toHaveProperty('baseX');
      expect(powerUp).toHaveProperty('baseY');
      expect(powerUp).toHaveProperty('rotation');
      expect(powerUp).toHaveProperty('floatOffset');
      expect(powerUp).toHaveProperty('floatSpeed');
      expect(powerUp).toHaveProperty('floatRadius');
      expect(powerUp).toHaveProperty('maxFloatRadius');
      expect(powerUp).toHaveProperty('spawnTime');
    });

    it('should spawn within canvas bounds (with margin)', () => {
      const powerUp = spawnPowerUp(canvasWidth, canvasHeight);

      expect(powerUp.x).toBeGreaterThanOrEqual(150);
      expect(powerUp.x).toBeLessThanOrEqual(canvasWidth - 150);
      expect(powerUp.y).toBeGreaterThanOrEqual(75);
      expect(powerUp.y).toBeLessThanOrEqual(canvasHeight - 75);
    });

    it('should set base position equal to initial position', () => {
      const powerUp = spawnPowerUp(canvasWidth, canvasHeight);

      expect(powerUp.baseX).toBe(powerUp.x);
      expect(powerUp.baseY).toBe(powerUp.y);
    });

    it('should use provided timestamp as spawn time and ID', () => {
      const timestamp = 12345;
      const powerUp = spawnPowerUp(canvasWidth, canvasHeight, timestamp);

      expect(powerUp.spawnTime).toBe(timestamp);
      expect(powerUp.id).toBe(timestamp);
    });

    it('should select random power-up type', () => {
      const powerUps = Array.from({ length: 20 }, () =>
        spawnPowerUp(canvasWidth, canvasHeight)
      );
      const types = new Set(powerUps.map((p) => p.type));

      expect(types.size).toBeGreaterThan(1);
    });

    it('should initialize rotation to 0', () => {
      const powerUp = spawnPowerUp(canvasWidth, canvasHeight);
      expect(powerUp.rotation).toBe(0);
    });

    it('should randomize float parameters', () => {
      const powerUp1 = spawnPowerUp(canvasWidth, canvasHeight, 1000);
      const powerUp2 = spawnPowerUp(canvasWidth, canvasHeight, 2000);

      // At least some float parameters should be different
      const different =
        powerUp1.floatOffset !== powerUp2.floatOffset ||
        powerUp1.floatSpeed !== powerUp2.floatSpeed ||
        powerUp1.floatRadius !== powerUp2.floatRadius;

      expect(different).toBe(true);
    });
  });

  describe('updatePowerUpAnimation', () => {
    let powerUp: PowerUp;

    beforeEach(() => {
      powerUp = spawnPowerUp(canvasWidth, canvasHeight, 1000);
    });

    it('should increment rotation', () => {
      const updated = updatePowerUpAnimation(powerUp, canvasWidth, canvasHeight, 1100);

      expect(updated.rotation).toBeGreaterThan(powerUp.rotation);
      expect(updated.rotation).toBeCloseTo(0.05, 2);
    });

    it('should update float offset', () => {
      const updated = updatePowerUpAnimation(powerUp, canvasWidth, canvasHeight, 1100);

      expect(updated.floatOffset).toBeGreaterThan(powerUp.floatOffset);
    });

    it('should increase float radius over time', () => {
      const updated1s = updatePowerUpAnimation(powerUp, canvasWidth, canvasHeight, 2000);
      const updated5s = updatePowerUpAnimation(powerUp, canvasWidth, canvasHeight, 6000);

      expect(updated5s.floatRadius).toBeGreaterThan(updated1s.floatRadius);
    });

    it('should cap float radius at 80', () => {
      // Simulate 100 seconds later
      const updated = updatePowerUpAnimation(
        powerUp,
        canvasWidth,
        canvasHeight,
        101000
      );

      expect(updated.floatRadius).toBeLessThanOrEqual(80);
    });

    it('should update position based on float animation', () => {
      const updated = updatePowerUpAnimation(powerUp, canvasWidth, canvasHeight, 1100);

      // Position should change due to floating
      const moved = updated.x !== powerUp.x || updated.y !== powerUp.y;
      expect(moved).toBe(true);
    });

    it('should clamp position to canvas bounds', () => {
      // Create power-up at edge
      const edgePowerUp: PowerUp = {
        ...powerUp,
        baseX: 50,
        baseY: 50,
        floatOffset: 0,
        floatRadius: 100, // Large radius to force out of bounds
      };

      const updated = updatePowerUpAnimation(
        edgePowerUp,
        canvasWidth,
        canvasHeight,
        2000
      );

      const margin = 30 + updated.floatRadius;
      expect(updated.x).toBeGreaterThanOrEqual(margin);
      expect(updated.x).toBeLessThanOrEqual(canvasWidth - margin);
      expect(updated.y).toBeGreaterThanOrEqual(margin);
      expect(updated.y).toBeLessThanOrEqual(canvasHeight - margin);
    });

    it('should update base position when hitting edges', () => {
      const edgePowerUp: PowerUp = {
        ...powerUp,
        baseX: 50,
        baseY: 50,
        floatOffset: 0,
        floatRadius: 100,
      };

      const updated = updatePowerUpAnimation(
        edgePowerUp,
        canvasWidth,
        canvasHeight,
        2000
      );

      const margin = 30 + updated.floatRadius;

      // If X hit edge, baseX should update
      if (updated.x === margin || updated.x === canvasWidth - margin) {
        expect(updated.baseX).toBe(updated.x);
      }

      // If Y hit edge, baseY should update
      if (updated.y === margin || updated.y === canvasHeight - margin) {
        expect(updated.baseY).toBe(updated.y);
      }
    });
  });

  describe('checkPowerUpCollision', () => {
    it('should detect collision when ball touches power-up', () => {
      const ball: Ball = {
        x: 400,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const powerUp: PowerUp = {
        ...spawnPowerUp(canvasWidth, canvasHeight),
        x: 400,
        y: 300,
      };

      const collision = checkPowerUpCollision(ball, powerUp);
      expect(collision).toBe(true);
    });

    it('should not detect collision when ball is far away', () => {
      const ball: Ball = {
        x: 100,
        y: 100,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const powerUp: PowerUp = {
        ...spawnPowerUp(canvasWidth, canvasHeight),
        x: 700,
        y: 500,
      };

      const collision = checkPowerUpCollision(ball, powerUp);
      expect(collision).toBe(false);
    });

    it('should detect collision at edge of collision radius', () => {
      const ball: Ball = {
        x: 400,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const powerUp: PowerUp = {
        ...spawnPowerUp(canvasWidth, canvasHeight),
        x: 400,
        y: 300 + 27, // Just at edge (8 + 20 - 1)
      };

      const collision = checkPowerUpCollision(ball, powerUp);
      expect(collision).toBe(true);
    });

    it('should respect custom power-up radius', () => {
      const ball: Ball = {
        x: 400,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const powerUp: PowerUp = {
        ...spawnPowerUp(canvasWidth, canvasHeight),
        x: 400,
        y: 340, // Distance = 40
      };

      const noCollision = checkPowerUpCollision(ball, powerUp, 20);
      expect(noCollision).toBe(false);

      const collision = checkPowerUpCollision(ball, powerUp, 50);
      expect(collision).toBe(true);
    });
  });

  describe('getPowerUpOwner', () => {
    it('should return right when ball moving right', () => {
      const ball: Ball = {
        x: 400,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      expect(getPowerUpOwner(ball)).toBe('right');
    });

    it('should return left when ball moving left', () => {
      const ball: Ball = {
        x: 400,
        y: 300,
        dx: -5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      expect(getPowerUpOwner(ball)).toBe('left');
    });

    it('should handle dx = 0 (returns left)', () => {
      const ball: Ball = {
        x: 400,
        y: 300,
        dx: 0,
        dy: 5,
        radius: 8,
        trail: [],
      };

      expect(getPowerUpOwner(ball)).toBe('left');
    });
  });

  describe('getPowerUpConfig', () => {
    it('should return config for bigPaddle', () => {
      const config = getPowerUpConfig('bigPaddle');
      expect(config.type).toBe('bigPaddle');
      expect(config.duration).toBe(480);
    });

    it('should return config for fastBall', () => {
      const config = getPowerUpConfig('fastBall');
      expect(config.type).toBe('fastBall');
      expect(config.duration).toBe(360);
    });

    it('should return config for multiBall', () => {
      const config = getPowerUpConfig('multiBall');
      expect(config.type).toBe('multiBall');
      expect(config.duration).toBe(600);
    });

    it('should return config for shield', () => {
      const config = getPowerUpConfig('shield');
      expect(config.type).toBe('shield');
      expect(config.uses).toBe(1);
    });

    it('should throw for unknown type', () => {
      expect(() => getPowerUpConfig('invalid' as any)).toThrow(
        'Unknown power-up type: invalid'
      );
    });
  });

  describe('shouldSpawnPowerUp', () => {
    it('should return true when timer expired and no power-ups', () => {
      const should = shouldSpawnPowerUp(0, 0);
      expect(should).toBe(true);
    });

    it('should return false when timer not expired', () => {
      const should = shouldSpawnPowerUp(100, 0);
      expect(should).toBe(false);
    });

    it('should return false when power-ups already exist', () => {
      const should = shouldSpawnPowerUp(0, 1);
      expect(should).toBe(false);
    });

    it('should return false when timer not expired and power-ups exist', () => {
      const should = shouldSpawnPowerUp(100, 1);
      expect(should).toBe(false);
    });

    it('should handle negative timer (considered expired)', () => {
      const should = shouldSpawnPowerUp(-10, 0);
      expect(should).toBe(true);
    });
  });

  describe('updateAllPowerUps', () => {
    it('should update all power-ups in array', () => {
      const powerUps: PowerUp[] = [
        spawnPowerUp(canvasWidth, canvasHeight, 1000),
        spawnPowerUp(canvasWidth, canvasHeight, 1100),
        spawnPowerUp(canvasWidth, canvasHeight, 1200),
      ];

      const updated = updateAllPowerUps(powerUps, canvasWidth, canvasHeight, 2000);

      expect(updated).toHaveLength(3);
      updated.forEach((powerUp, index) => {
        expect(powerUp.rotation).toBeGreaterThan(powerUps[index]!.rotation);
      });
    });

    it('should return empty array for empty input', () => {
      const updated = updateAllPowerUps([], canvasWidth, canvasHeight);
      expect(updated).toEqual([]);
    });

    it('should not mutate original array', () => {
      const powerUps: PowerUp[] = [spawnPowerUp(canvasWidth, canvasHeight, 1000)];
      const original = { ...powerUps[0]! };

      updateAllPowerUps(powerUps, canvasWidth, canvasHeight, 2000);

      expect(powerUps[0]).toEqual(original);
    });
  });

  describe('findCollidingPowerUp', () => {
    it('should find power-up that ball collides with', () => {
      const ball: Ball = {
        x: 400,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const powerUps: PowerUp[] = [
        { ...spawnPowerUp(canvasWidth, canvasHeight, 1000), x: 100, y: 100 },
        { ...spawnPowerUp(canvasWidth, canvasHeight, 1100), x: 400, y: 300 }, // Collision
        { ...spawnPowerUp(canvasWidth, canvasHeight, 1200), x: 700, y: 500 },
      ];

      const colliding = findCollidingPowerUp(ball, powerUps);

      expect(colliding).not.toBeNull();
      expect(colliding?.id).toBe(1100);
    });

    it('should return null when no collision', () => {
      const ball: Ball = {
        x: 400,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const powerUps: PowerUp[] = [
        { ...spawnPowerUp(canvasWidth, canvasHeight, 1000), x: 100, y: 100 },
        { ...spawnPowerUp(canvasWidth, canvasHeight, 1100), x: 700, y: 500 },
      ];

      const colliding = findCollidingPowerUp(ball, powerUps);

      expect(colliding).toBeNull();
    });

    it('should return first colliding power-up if multiple', () => {
      const ball: Ball = {
        x: 400,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const powerUps: PowerUp[] = [
        { ...spawnPowerUp(canvasWidth, canvasHeight, 1000), x: 400, y: 300 },
        { ...spawnPowerUp(canvasWidth, canvasHeight, 1100), x: 400, y: 300 },
      ];

      const colliding = findCollidingPowerUp(ball, powerUps);

      expect(colliding?.id).toBe(1000);
    });

    it('should return null for empty array', () => {
      const ball: Ball = {
        x: 400,
        y: 300,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const colliding = findCollidingPowerUp(ball, []);

      expect(colliding).toBeNull();
    });
  });

  describe('removePowerUp', () => {
    it('should remove power-up with matching ID', () => {
      const powerUps: PowerUp[] = [
        spawnPowerUp(canvasWidth, canvasHeight, 1000),
        spawnPowerUp(canvasWidth, canvasHeight, 1100),
        spawnPowerUp(canvasWidth, canvasHeight, 1200),
      ];

      const filtered = removePowerUp(powerUps, 1100);

      expect(filtered).toHaveLength(2);
      expect(filtered.find((p) => p.id === 1100)).toBeUndefined();
      expect(filtered.find((p) => p.id === 1000)).toBeDefined();
      expect(filtered.find((p) => p.id === 1200)).toBeDefined();
    });

    it('should return unchanged array if ID not found', () => {
      const powerUps: PowerUp[] = [
        spawnPowerUp(canvasWidth, canvasHeight, 1000),
        spawnPowerUp(canvasWidth, canvasHeight, 1100),
      ];

      const filtered = removePowerUp(powerUps, 9999);

      expect(filtered).toHaveLength(2);
    });

    it('should return empty array for empty input', () => {
      const filtered = removePowerUp([], 1000);
      expect(filtered).toEqual([]);
    });

    it('should not mutate original array', () => {
      const powerUps: PowerUp[] = [
        spawnPowerUp(canvasWidth, canvasHeight, 1000),
        spawnPowerUp(canvasWidth, canvasHeight, 1100),
      ];
      const originalLength = powerUps.length;

      removePowerUp(powerUps, 1100);

      expect(powerUps).toHaveLength(originalLength);
    });
  });
});
