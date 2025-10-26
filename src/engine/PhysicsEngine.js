/**
 * PhysicsEngine - Pure physics calculations for ball and paddle movement
 *
 * Design principles:
 * - Pure functions (no side effects)
 * - Fully testable without browser
 * - Performance optimized for 60fps
 * - Type-safe with TypeScript
 */
import { DEFAULT_PHYSICS_CONFIG } from './types';
/**
 * Reset ball to center with randomized velocity
 */
export function resetBall(canvasWidth, canvasHeight, initialSpeedX = 6, initialSpeedY = 3) {
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
export function updateBallPosition(ball, speedMultiplier = 1) {
    return {
        x: ball.x + ball.dx * speedMultiplier,
        y: ball.y + ball.dy * speedMultiplier,
    };
}
/**
 * Check if ball collides with top or bottom walls
 */
export function checkWallCollision(ball, canvasHeight) {
    return ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvasHeight;
}
/**
 * Handle ball bounce off wall (reverse Y velocity)
 */
export function bounceOffWall(ball) {
    return { dy: -ball.dy };
}
/**
 * Check if ball is out of bounds (scored)
 */
export function checkBallOutOfBounds(ball, canvasWidth) {
    if (ball.x < 0)
        return 'left';
    if (ball.x > canvasWidth)
        return 'right';
    return null;
}
/**
 * Calculate ball speed (magnitude of velocity vector)
 */
export function calculateBallSpeed(ball) {
    return Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
}
/**
 * Apply speed limits to ball velocity
 * Ensures ball doesn't get too fast or too slow
 */
export function applySpeedLimits(ball, config = DEFAULT_PHYSICS_CONFIG) {
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
export function calculatePaddleBounce(ball, paddleY, paddleHeight, paddleVelocity, config = DEFAULT_PHYSICS_CONFIG) {
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
export function predictBallY(ball, targetX, canvasHeight) {
    if (ball.dx === 0)
        return ball.y;
    const timeToReach = (targetX - ball.x) / ball.dx;
    let predictedY = ball.y + ball.dy * timeToReach;
    // Simulate bounces off walls
    while (predictedY < 0 || predictedY > canvasHeight) {
        if (predictedY < 0) {
            predictedY = -predictedY;
        }
        else if (predictedY > canvasHeight) {
            predictedY = 2 * canvasHeight - predictedY;
        }
    }
    return predictedY;
}
/**
 * Calculate new paddle position with bounds checking
 */
export function updatePaddlePosition(currentY, movement, paddleHeight, canvasHeight) {
    const newY = currentY + movement;
    return Math.max(0, Math.min(canvasHeight - paddleHeight, newY));
}
/**
 * Calculate paddle velocity (for momentum transfer)
 */
export function calculatePaddleVelocity(currentY, previousY) {
    return currentY - previousY;
}
/**
 * Add chaos effect to ball (random velocity nudge)
 * Used for special power-ups or game modes
 */
export function applyChaosEffect(ball, intensity = 2) {
    return {
        dx: ball.dx + (Math.random() - 0.5) * intensity,
        dy: ball.dy + (Math.random() - 0.5) * intensity,
    };
}
