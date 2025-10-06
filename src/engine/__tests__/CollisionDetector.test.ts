/**
 * CollisionDetector Tests
 * Testing geometric collision algorithms
 */

import { describe, it, expect } from 'vitest';
import {
  checkCircleRectCollision,
  checkBallPaddleCollision,
  checkBallPowerUpCollision,
  checkCircleCircleCollision,
  isPointInRect,
  isPointInCircle,
  getCircleBounds,
  checkAABBCollision,
  getDistance,
  getDistanceSquared,
  type Circle,
  type Rectangle,
} from '../CollisionDetector';
import type { Ball, Paddle } from '../types';

describe('CollisionDetector', () => {
  describe('checkCircleRectCollision', () => {
    it('should detect collision when circle overlaps rectangle', () => {
      const circle: Circle = { x: 50, y: 50, radius: 10 };
      const rect: Rectangle = { x: 45, y: 45, width: 20, height: 20 };

      const result = checkCircleRectCollision(circle, rect);

      expect(result.collided).toBe(true);
    });

    it('should not detect collision when circle is away from rectangle', () => {
      const circle: Circle = { x: 100, y: 100, radius: 10 };
      const rect: Rectangle = { x: 0, y: 0, width: 20, height: 20 };

      const result = checkCircleRectCollision(circle, rect);

      expect(result.collided).toBe(false);
    });

    it('should detect collision when circle touches rectangle edge', () => {
      const circle: Circle = { x: 30, y: 10, radius: 10 };
      const rect: Rectangle = { x: 0, y: 0, width: 20, height: 20 };

      const result = checkCircleRectCollision(circle, rect);

      expect(result.collided).toBe(true);
    });

    it('should calculate penetration depth on collision', () => {
      const circle: Circle = { x: 25, y: 10, radius: 10 };
      const rect: Rectangle = { x: 0, y: 0, width: 20, height: 20 };

      const result = checkCircleRectCollision(circle, rect);

      expect(result.collided).toBe(true);
      expect(result.penetrationDepth).toBeGreaterThan(0);
    });

    it('should calculate normal vector on collision', () => {
      const circle: Circle = { x: 30, y: 10, radius: 10 };
      const rect: Rectangle = { x: 0, y: 0, width: 20, height: 20 };

      const result = checkCircleRectCollision(circle, rect);

      expect(result.collided).toBe(true);
      expect(result.normal).toBeDefined();
      if (result.normal) {
        // Normal should be unit vector
        const magnitude = Math.sqrt(
          result.normal.x ** 2 + result.normal.y ** 2
        );
        expect(magnitude).toBeCloseTo(1, 5);
      }
    });

    it('should handle circle center inside rectangle', () => {
      const circle: Circle = { x: 10, y: 10, radius: 5 };
      const rect: Rectangle = { x: 0, y: 0, width: 20, height: 20 };

      const result = checkCircleRectCollision(circle, rect);

      expect(result.collided).toBe(true);
    });
  });

  describe('checkBallPaddleCollision', () => {
    it('should detect collision between ball and paddle', () => {
      const ball: Ball = {
        x: 50,
        y: 100,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };
      const paddle: Paddle = {
        x: 40,
        y: 80,
        width: 12,
        height: 80,
        speed: 4.5,
        prevY: 80,
        velocity: 0,
      };

      const collided = checkBallPaddleCollision(ball, paddle);

      expect(collided).toBe(true);
    });

    it('should not detect collision when ball is away from paddle', () => {
      const ball: Ball = {
        x: 200,
        y: 100,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };
      const paddle: Paddle = {
        x: 40,
        y: 80,
        width: 12,
        height: 80,
        speed: 4.5,
        prevY: 80,
        velocity: 0,
      };

      const collided = checkBallPaddleCollision(ball, paddle);

      expect(collided).toBe(false);
    });

    it('should handle big paddle power-up (2x size)', () => {
      const ball: Ball = {
        x: 50,
        y: 40, // Above normal paddle range
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };
      const paddle: Paddle = {
        x: 40,
        y: 80,
        width: 12,
        height: 80,
        speed: 4.5,
        prevY: 80,
        velocity: 0,
      };

      // Without power-up - no collision
      const normalCollision = checkBallPaddleCollision(ball, paddle, 1);
      expect(normalCollision).toBe(false);

      // With 2x power-up - collision
      const bigPaddleCollision = checkBallPaddleCollision(ball, paddle, 2);
      expect(bigPaddleCollision).toBe(true);
    });

    it('should detect collision at paddle top edge', () => {
      const ball: Ball = {
        x: 46,
        y: 80,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };
      const paddle: Paddle = {
        x: 40,
        y: 80,
        width: 12,
        height: 80,
        speed: 4.5,
        prevY: 80,
        velocity: 0,
      };

      const collided = checkBallPaddleCollision(ball, paddle);

      expect(collided).toBe(true);
    });

    it('should detect collision at paddle bottom edge', () => {
      const ball: Ball = {
        x: 46,
        y: 160,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };
      const paddle: Paddle = {
        x: 40,
        y: 80,
        width: 12,
        height: 80,
        speed: 4.5,
        prevY: 80,
        velocity: 0,
      };

      const collided = checkBallPaddleCollision(ball, paddle);

      expect(collided).toBe(true);
    });
  });

  describe('checkBallPowerUpCollision', () => {
    it('should detect collision when ball touches power-up', () => {
      const ball: Ball = {
        x: 100,
        y: 100,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const collided = checkBallPowerUpCollision(ball, 110, 100, 20);

      expect(collided).toBe(true);
    });

    it('should not detect collision when ball is far from power-up', () => {
      const ball: Ball = {
        x: 100,
        y: 100,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      const collided = checkBallPowerUpCollision(ball, 200, 200, 20);

      expect(collided).toBe(false);
    });

    it('should handle exact distance edge case', () => {
      const ball: Ball = {
        x: 100,
        y: 100,
        dx: 5,
        dy: 0,
        radius: 8,
        trail: [],
      };

      // Distance exactly equals combined radius
      const collided = checkBallPowerUpCollision(ball, 128, 100, 20);

      expect(collided).toBe(false); // Uses < not <=
    });
  });

  describe('checkCircleCircleCollision', () => {
    it('should detect collision between overlapping circles', () => {
      const circle1: Circle = { x: 100, y: 100, radius: 10 };
      const circle2: Circle = { x: 105, y: 100, radius: 10 };

      const result = checkCircleCircleCollision(circle1, circle2);

      expect(result.collided).toBe(true);
    });

    it('should not detect collision between separated circles', () => {
      const circle1: Circle = { x: 100, y: 100, radius: 10 };
      const circle2: Circle = { x: 200, y: 100, radius: 10 };

      const result = checkCircleCircleCollision(circle1, circle2);

      expect(result.collided).toBe(false);
    });

    it('should calculate penetration depth', () => {
      const circle1: Circle = { x: 100, y: 100, radius: 10 };
      const circle2: Circle = { x: 110, y: 100, radius: 10 };

      const result = checkCircleCircleCollision(circle1, circle2);

      expect(result.collided).toBe(true);
      expect(result.penetrationDepth).toBe(10); // 20 combined - 10 distance
    });

    it('should calculate normal vector', () => {
      const circle1: Circle = { x: 100, y: 100, radius: 10 };
      const circle2: Circle = { x: 110, y: 100, radius: 10 };

      const result = checkCircleCircleCollision(circle1, circle2);

      expect(result.collided).toBe(true);
      expect(result.normal).toBeDefined();
      if (result.normal) {
        // Normal should point from circle1 to circle2
        expect(result.normal.x).toBeGreaterThan(0);
        expect(result.normal.y).toBe(0);
      }
    });

    it('should handle exactly overlapping circles', () => {
      const circle1: Circle = { x: 100, y: 100, radius: 10 };
      const circle2: Circle = { x: 100, y: 100, radius: 10 };

      const result = checkCircleCircleCollision(circle1, circle2);

      expect(result.collided).toBe(true);
      expect(result.normal).toBeDefined();
    });
  });

  describe('isPointInRect', () => {
    it('should return true for point inside rectangle', () => {
      const rect: Rectangle = { x: 0, y: 0, width: 100, height: 100 };

      expect(isPointInRect(50, 50, rect)).toBe(true);
    });

    it('should return false for point outside rectangle', () => {
      const rect: Rectangle = { x: 0, y: 0, width: 100, height: 100 };

      expect(isPointInRect(150, 150, rect)).toBe(false);
    });

    it('should return true for point on rectangle edge', () => {
      const rect: Rectangle = { x: 0, y: 0, width: 100, height: 100 };

      expect(isPointInRect(100, 50, rect)).toBe(true);
      expect(isPointInRect(50, 100, rect)).toBe(true);
    });

    it('should return true for point at rectangle corner', () => {
      const rect: Rectangle = { x: 0, y: 0, width: 100, height: 100 };

      expect(isPointInRect(0, 0, rect)).toBe(true);
      expect(isPointInRect(100, 100, rect)).toBe(true);
    });
  });

  describe('isPointInCircle', () => {
    it('should return true for point inside circle', () => {
      const circle: Circle = { x: 100, y: 100, radius: 50 };

      expect(isPointInCircle(100, 100, circle)).toBe(true); // Center
      expect(isPointInCircle(120, 100, circle)).toBe(true); // Inside
    });

    it('should return false for point outside circle', () => {
      const circle: Circle = { x: 100, y: 100, radius: 50 };

      expect(isPointInCircle(200, 100, circle)).toBe(false);
    });

    it('should return true for point on circle edge', () => {
      const circle: Circle = { x: 100, y: 100, radius: 50 };

      expect(isPointInCircle(150, 100, circle)).toBe(true);
    });
  });

  describe('getCircleBounds', () => {
    it('should return bounding box for circle', () => {
      const circle: Circle = { x: 100, y: 100, radius: 50 };

      const bounds = getCircleBounds(circle);

      expect(bounds.x).toBe(50);
      expect(bounds.y).toBe(50);
      expect(bounds.width).toBe(100);
      expect(bounds.height).toBe(100);
    });
  });

  describe('checkAABBCollision', () => {
    it('should detect overlapping rectangles', () => {
      const rect1: Rectangle = { x: 0, y: 0, width: 100, height: 100 };
      const rect2: Rectangle = { x: 50, y: 50, width: 100, height: 100 };

      expect(checkAABBCollision(rect1, rect2)).toBe(true);
    });

    it('should not detect separated rectangles', () => {
      const rect1: Rectangle = { x: 0, y: 0, width: 100, height: 100 };
      const rect2: Rectangle = { x: 200, y: 0, width: 100, height: 100 };

      expect(checkAABBCollision(rect1, rect2)).toBe(false);
    });

    it('should detect touching rectangles', () => {
      const rect1: Rectangle = { x: 0, y: 0, width: 100, height: 100 };
      const rect2: Rectangle = { x: 100, y: 0, width: 100, height: 100 };

      expect(checkAABBCollision(rect1, rect2)).toBe(false); // Touching but not overlapping
    });
  });

  describe('getDistance', () => {
    it('should calculate distance between two points', () => {
      const distance = getDistance(0, 0, 3, 4);

      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('should return 0 for same point', () => {
      const distance = getDistance(100, 100, 100, 100);

      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const distance = getDistance(-3, -4, 0, 0);

      expect(distance).toBe(5);
    });
  });

  describe('getDistanceSquared', () => {
    it('should calculate squared distance', () => {
      const distSq = getDistanceSquared(0, 0, 3, 4);

      expect(distSq).toBe(25); // 3² + 4² = 25
    });

    it('should be faster than getDistance (no sqrt)', () => {
      // This is a conceptual test - squared distance avoids expensive sqrt
      const distSq = getDistanceSquared(0, 0, 100, 100);

      expect(distSq).toBe(20000);
    });

    it('should return 0 for same point', () => {
      const distSq = getDistanceSquared(100, 100, 100, 100);

      expect(distSq).toBe(0);
    });
  });
});
