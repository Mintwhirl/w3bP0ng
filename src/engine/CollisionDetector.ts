/**
 * CollisionDetector - Geometric collision detection algorithms
 *
 * Design principles:
 * - Pure functions (no side effects)
 * - Optimized for performance (AABB, circle-rect tests)
 * - Supports power-up modifications (big paddle)
 * - Fully testable without rendering
 */

import type { Ball, Paddle, Vector2D } from './types';

/**
 * Rectangle definition for collision detection
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Circle definition for collision detection
 */
export interface Circle {
  x: number;
  y: number;
  radius: number;
}

/**
 * Collision result with normal vector for physics response
 */
export interface CollisionInfo {
  collided: boolean;
  penetrationDepth?: number;
  normal?: Vector2D; // Unit vector pointing away from collision surface
  contactPoint?: Vector2D;
}

/**
 * Check collision between circle (ball) and rectangle (paddle)
 * Uses closest point algorithm for accurate detection
 *
 * @param circle - Ball as circle
 * @param rect - Paddle as rectangle
 * @returns Collision information
 */
export function checkCircleRectCollision(
  circle: Circle,
  rect: Rectangle
): CollisionInfo {
  // Find closest point on rectangle to circle center
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  // Calculate distance from circle center to closest point
  const distanceX = circle.x - closestX;
  const distanceY = circle.y - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  // Check if distance is less than radius (collision)
  const collided = distanceSquared <= circle.radius * circle.radius;

  if (!collided) {
    return { collided: false };
  }

  // Calculate collision details
  const distance = Math.sqrt(distanceSquared);
  const penetrationDepth = circle.radius - distance;

  // Calculate normal vector (direction to push ball out)
  let normalX = distanceX;
  let normalY = distanceY;

  if (distance > 0) {
    normalX /= distance;
    normalY /= distance;
  } else {
    // Circle center exactly on rectangle - default to horizontal normal
    normalX = circle.x < rect.x + rect.width / 2 ? -1 : 1;
    normalY = 0;
  }

  return {
    collided: true,
    penetrationDepth,
    normal: { x: normalX, y: normalY },
    contactPoint: { x: closestX, y: closestY },
  };
}

/**
 * Check collision between ball and paddle
 * Handles power-up modifications (big paddle)
 *
 * @param ball - Ball object
 * @param paddle - Paddle object
 * @param paddleSizeMultiplier - Size multiplier from power-ups (default: 1)
 * @returns True if collision detected
 */
export function checkBallPaddleCollision(
  ball: Ball,
  paddle: Paddle,
  paddleSizeMultiplier: number = 1
): boolean {
  const paddleHeight = paddle.height * paddleSizeMultiplier;
  const paddleY =
    paddleSizeMultiplier > 1
      ? paddle.y - (paddleHeight - paddle.height) / 2
      : paddle.y;

  const circle: Circle = {
    x: ball.x,
    y: ball.y,
    radius: ball.radius,
  };

  const rect: Rectangle = {
    x: paddle.x,
    y: paddleY,
    width: paddle.width,
    height: paddleHeight,
  };

  const result = checkCircleRectCollision(circle, rect);
  return result.collided;
}

/**
 * Check collision between ball and power-up (both circles)
 *
 * @param ball - Ball object
 * @param powerUpX - Power-up X position
 * @param powerUpY - Power-up Y position
 * @param powerUpRadius - Power-up radius
 * @returns True if collision detected
 */
export function checkBallPowerUpCollision(
  ball: Ball,
  powerUpX: number,
  powerUpY: number,
  powerUpRadius: number
): boolean {
  const dx = ball.x - powerUpX;
  const dy = ball.y - powerUpY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const combinedRadius = ball.radius + powerUpRadius;

  return distance < combinedRadius;
}

/**
 * Check collision between two circles
 * General purpose circle-circle collision
 *
 * @param circle1 - First circle
 * @param circle2 - Second circle
 * @returns Collision information
 */
export function checkCircleCircleCollision(
  circle1: Circle,
  circle2: Circle
): CollisionInfo {
  const dx = circle2.x - circle1.x;
  const dy = circle2.y - circle1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const combinedRadius = circle1.radius + circle2.radius;

  const collided = distance < combinedRadius;

  if (!collided) {
    return { collided: false };
  }

  const penetrationDepth = combinedRadius - distance;

  // Normal points from circle1 to circle2
  let normalX = dx;
  let normalY = dy;

  if (distance > 0) {
    normalX /= distance;
    normalY /= distance;
  } else {
    // Circles exactly overlapping - default normal
    normalX = 1;
    normalY = 0;
  }

  return {
    collided: true,
    penetrationDepth,
    normal: { x: normalX, y: normalY },
  };
}

/**
 * Check if point is inside rectangle
 * Used for click detection, UI interactions
 *
 * @param pointX - Point X coordinate
 * @param pointY - Point Y coordinate
 * @param rect - Rectangle to check
 * @returns True if point is inside rectangle
 */
export function isPointInRect(
  pointX: number,
  pointY: number,
  rect: Rectangle
): boolean {
  return (
    pointX >= rect.x &&
    pointX <= rect.x + rect.width &&
    pointY >= rect.y &&
    pointY <= rect.y + rect.height
  );
}

/**
 * Check if point is inside circle
 * Used for click detection, power-up targeting
 *
 * @param pointX - Point X coordinate
 * @param pointY - Point Y coordinate
 * @param circle - Circle to check
 * @returns True if point is inside circle
 */
export function isPointInCircle(
  pointX: number,
  pointY: number,
  circle: Circle
): boolean {
  const dx = pointX - circle.x;
  const dy = pointY - circle.y;
  const distanceSquared = dx * dx + dy * dy;
  return distanceSquared <= circle.radius * circle.radius;
}

/**
 * Get AABB (Axis-Aligned Bounding Box) from circle
 * Useful for broad-phase collision detection
 *
 * @param circle - Circle to get bounds from
 * @returns Rectangle bounding box
 */
export function getCircleBounds(circle: Circle): Rectangle {
  return {
    x: circle.x - circle.radius,
    y: circle.y - circle.radius,
    width: circle.radius * 2,
    height: circle.radius * 2,
  };
}

/**
 * Check if two AABBs overlap
 * Fast broad-phase collision check
 *
 * @param rect1 - First rectangle
 * @param rect2 - Second rectangle
 * @returns True if rectangles overlap
 */
export function checkAABBCollision(
  rect1: Rectangle,
  rect2: Rectangle
): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Calculate distance between two points
 * Helper function for distance-based checks
 *
 * @param x1 - First point X
 * @param y1 - First point Y
 * @param x2 - Second point X
 * @param y2 - Second point Y
 * @returns Distance between points
 */
export function getDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate squared distance (faster, no sqrt)
 * Use when you only need to compare distances
 *
 * @param x1 - First point X
 * @param y1 - First point Y
 * @param x2 - Second point X
 * @param y2 - Second point Y
 * @returns Squared distance between points
 */
export function getDistanceSquared(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}
