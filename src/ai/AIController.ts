/**
 * AIController - Intelligent AI opponent with configurable difficulty
 *
 * Design principles:
 * - Pure calculations (no side effects)
 * - Difficulty-based imperfection for realism
 * - Ball prediction for advanced AI
 * - Reaction delays to simulate human response
 */

import type { Ball, Paddle } from '../engine/types';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface AIConfig {
  speed: number; // Paddle movement speed (pixels/frame)
  reactionTime: number; // Frames to wait before reacting
  accuracy: number; // 0-1, higher = more accurate
  predictionEnabled: boolean; // Use ball trajectory prediction
}

export interface AIState {
  targetY: number; // Where AI is trying to move paddle
  lastReactionTime: number; // Timestamp of last reaction
}

/**
 * Get AI configuration for difficulty level
 */
export function getAIConfig(difficulty: AIDifficulty): AIConfig {
  switch (difficulty) {
    case 'easy':
      return {
        speed: 5.5,
        reactionTime: 12, // ~200ms delay
        accuracy: 0.8, // 20% inaccurate
        predictionEnabled: false, // Only tracks current position
      };

    case 'medium':
      return {
        speed: 6.5,
        reactionTime: 6, // ~100ms delay
        accuracy: 0.9, // 10% inaccurate
        predictionEnabled: true, // Uses prediction
      };

    case 'hard':
      return {
        speed: 7.5,
        reactionTime: 2, // ~33ms delay (very fast)
        accuracy: 0.98, // 2% inaccurate (nearly perfect)
        predictionEnabled: true,
      };

    default:
      return getAIConfig('medium');
  }
}

/**
 * Predict where ball will be when it reaches paddle X position
 * Simulates wall bounces for accurate prediction
 */
export function predictBallPosition(
  ball: Ball,
  targetX: number,
  canvasHeight: number
): number {
  if (ball.dx === 0) return ball.y;

  const timeToReach = (targetX - ball.x) / ball.dx;
  let predictedY = ball.y + ball.dy * timeToReach;

  // Simulate wall bounces
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
 * Calculate AI target position with intentional inaccuracy
 */
export function calculateAITarget(
  ball: Ball,
  paddle: Paddle,
  canvasHeight: number,
  config: AIConfig
): number {
  let targetY: number;

  if (config.predictionEnabled) {
    // Predict where ball will be
    targetY = predictBallPosition(ball, paddle.x, canvasHeight);
  } else {
    // Simple tracking (just follow current position)
    targetY = ball.y;
  }

  // Add inaccuracy (higher accuracy = less random error)
  const maxError = (1 - config.accuracy) * 50;
  const error = (Math.random() - 0.5) * maxError;
  targetY += error;

  // Clamp to valid range
  return Math.max(0, Math.min(canvasHeight, targetY));
}

/**
 * Calculate AI paddle movement for this frame
 * Returns new Y position
 */
export function updateAIPaddle(
  paddle: Paddle,
  targetY: number,
  canvasHeight: number,
  config: AIConfig
): number {
  const paddleCenter = paddle.y + paddle.height / 2;
  const difference = targetY - paddleCenter;

  // Dead zone - don't move if close enough (prevents jitter)
  if (Math.abs(difference) < 2) {
    return paddle.y;
  }

  // Move towards target at AI speed
  let newY = paddle.y;

  if (difference < 0) {
    newY = Math.max(0, paddle.y - config.speed);
  } else {
    newY = Math.min(canvasHeight - paddle.height, paddle.y + config.speed);
  }

  return newY;
}

/**
 * Check if AI should react (based on reaction delay)
 */
export function shouldReact(
  currentTime: number,
  lastReactionTime: number,
  config: AIConfig
): boolean {
  const timeSinceLastReaction = currentTime - lastReactionTime;
  const reactionDelayMs = config.reactionTime * 16.67; // Convert frames to ms (60fps)

  return timeSinceLastReaction > reactionDelayMs;
}

/**
 * Check if ball is moving towards AI paddle
 */
export function isBallApproaching(ball: Ball, paddleX: number): boolean {
  // If paddle is on right side, ball needs positive dx (moving right)
  // If paddle is on left side, ball needs negative dx (moving left)
  const isRightPaddle = paddleX > 400; // Assuming 800px canvas width
  return isRightPaddle ? ball.dx > 0 : ball.dx < 0;
}

/**
 * Complete AI update logic
 * Returns new AI state and paddle position
 */
export function computeAIMove(
  ball: Ball,
  paddle: Paddle,
  aiState: AIState,
  canvasHeight: number,
  difficulty: AIDifficulty,
  currentTime: number
): { newAIState: AIState; newPaddleY: number } {
  const config = getAIConfig(difficulty);

  // Only react if ball is approaching
  if (!isBallApproaching(ball, paddle.x)) {
    return {
      newAIState: aiState,
      newPaddleY: paddle.y,
    };
  }

  // Check if enough time has passed to react
  if (!shouldReact(currentTime, aiState.lastReactionTime, config)) {
    // Still moving towards previous target
    const newY = updateAIPaddle(paddle, aiState.targetY, canvasHeight, config);
    return {
      newAIState: aiState,
      newPaddleY: newY,
    };
  }

  // Time to recalculate target
  const newTarget = calculateAITarget(ball, paddle, canvasHeight, config);
  const newY = updateAIPaddle(paddle, newTarget, canvasHeight, config);

  return {
    newAIState: {
      targetY: newTarget,
      lastReactionTime: currentTime,
    },
    newPaddleY: newY,
  };
}
