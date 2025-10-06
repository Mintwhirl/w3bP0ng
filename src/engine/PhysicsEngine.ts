/**
 * PhysicsEngine - Pure physics calculations for ball and paddle movement
 *
 * Design principles:
 * - Pure functions (no side effects)
 * - Fully testable without browser
 * - Performance optimized for 60fps
 * - Type-safe with TypeScript
 */

import type { Ball, PhysicsConfig } from './types';
import { DEFAULT_PHYSICS_CONFIG } from './types';

/**
 * Reset ball to center with randomized velocity
 */
export function resetBall(
  canvasWidth: number,
  canvasHeight: number,
  initialSpeedX: number = 6,
  initialSpeedY: number = 3
): Pick<Ball, 'x' | 'y' | 'dx' | 'dy'> {
  return {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    dx: Math.random() > 0.5 ? initialSpeedX : -initialSpeedX,
    dy: (Math.random() * (initialSpeedY * 2) - initialSpeedY) * 0.8,
  };
}

/**
 * Update ball position based on velocity and speed multiplier
 */
export function updateBallPosition(
  ball: Ball,
  speedMultiplier: number = 1
): Pick<Ball, 'x' | 'y'> {
  return {
    x: ball.x + ball.dx * speedMultiplier,
    y: ball.y + ball.dy * speedMultiplier,
  };
}

/**
 * Check if ball collides with top or bottom walls
 */
export function checkWallCollision(
  ball: Ball,
  canvasHeight: number
): boolean {
  return ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvasHeight;
}

/**
 * Handle ball bounce off wall (reverse Y velocity)
 */
export function bounceOffWall(ball: Ball): Pick<Ball, 'dy'> {
  return { dy: -ball.dy };
}

/**
 * Check if ball is out of bounds (scored)
 */
export function checkBallOutOfBounds(
  ball: Ball,
  canvasWidth: number
): 'left' | 'right' | null {
  if (ball.x < 0) return 'left';
  if (ball.x > canvasWidth) return 'right';
  return null;
}

/**
 * Calculate ball speed (magnitude of velocity vector)
 */
export function calculateBallSpeed(ball: Ball): number {
  return Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
}

/**
 * Apply speed limits to ball velocity
 * Ensures ball doesn't get too fast or too slow
 */
export function applySpeedLimits(
  ball: Ball,
  config: PhysicsConfig = DEFAULT_PHYSICS_CONFIG
): Pick<Ball, 'dx' | 'dy'> {
  const currentSpeed = calculateBallSpeed(ball);

  if (currentSpeed < config.minBallSpeed) {
    const speedMultiplier = config.minBallSpeed / currentSpeed;
    return {
      dx: ball.dx * speedMultiplier,
      dy: ball.dy * speedMultiplier,
    };
  }

  if (currentSpeed > config.maxBallSpeed) {
    const speedMultiplier = config.maxBallSpeed / currentSpeed;
    return {
      dx: ball.dx * speedMultiplier,
      dy: ball.dy * speedMultiplier,
    };
  }

  return { dx: ball.dx, dy: ball.dy };
}

/**
 * Calculate ball velocity after paddle collision
 * Includes paddle momentum transfer and position-based angle
 */
export function calculatePaddleBounce(
  ball: Ball,
  paddleY: number,
  paddleHeight: number,
  paddleVelocity: number,
  config: PhysicsConfig = DEFAULT_PHYSICS_CONFIG
): Pick<Ball, 'dx' | 'dy'> {
  // Reverse horizontal direction
  let newDx = -ball.dx;
  let newDy = ball.dy;

  // Apply progressive acceleration
  newDx *= config.ballSpeedMultiplier;
  newDy *= config.ballSpeedMultiplier;

  // Add paddle momentum
  newDy += paddleVelocity * config.paddleInfluence;

  // Position-based deflection (hit location affects angle)
  const paddleCenterY = paddleY + paddleHeight / 2;
  const hitPosition = (ball.y - paddleCenterY) / (paddleHeight / 2);
  newDy += hitPosition * config.bounceAngleFactor;

  // Optional chaos factor for unpredictability
  if (Math.random() < config.chaosChance) {
    newDy += (Math.random() - 0.5) * config.chaosIntensity;
  }

  // Clamp Y velocity to prevent extreme angles
  newDy = Math.max(-config.maxBallSpeed, Math.min(config.maxBallSpeed, newDy));

  return { dx: newDx, dy: newDy };
}

/**
 * Predict where ball will be when it reaches a specific X coordinate
 * Used for AI prediction
 */
export function predictBallY(
  ball: Ball,
  targetX: number,
  canvasHeight: number
): number {
  if (ball.dx === 0) return ball.y;

  const timeToReach = (targetX - ball.x) / ball.dx;
  let predictedY = ball.y + ball.dy * timeToReach;

  // Simulate bounces off walls
  while (predictedY < 0 || predictedY > canvasHeight) {
    if (predictedY < 0) {
      predictedY = -predictedY;
    } else if (predictedY > canvasHeight) {
      predictedY = 2 * canvasHeight - predictedY;
    }
  }

  return predictedY;
}

/**
 * Calculate new paddle position with bounds checking
 */
export function updatePaddlePosition(
  currentY: number,
  movement: number,
  paddleHeight: number,
  canvasHeight: number
): number {
  const newY = currentY + movement;
  return Math.max(0, Math.min(canvasHeight - paddleHeight, newY));
}

/**
 * Calculate paddle velocity (for momentum transfer)
 */
export function calculatePaddleVelocity(
  currentY: number,
  previousY: number
): number {
  return currentY - previousY;
}

/**
 * Add chaos effect to ball (random velocity nudge)
 * Used for special power-ups or game modes
 */
export function applyChaosEffect(
  ball: Ball,
  intensity: number = 2
): Pick<Ball, 'dx' | 'dy'> {
  return {
    dx: ball.dx + (Math.random() - 0.5) * intensity,
    dy: ball.dy + (Math.random() - 0.5) * intensity,
  };
}
