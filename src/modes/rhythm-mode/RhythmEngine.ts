/**
 * Rhythm Mode Game Engine
 * Core gameplay logic for rhythm-based Pong
 */

import type { Ball, Paddle, RhythmGameState, HitAccuracy, Track } from './types';

/**
 * Calculate new combo value based on hit accuracy
 */
export function calculateCombo(hitAccuracy: HitAccuracy, currentCombo: number): number {
  if (hitAccuracy === 'miss') {
    return 0;
  }
  return currentCombo + 1;
}

/**
 * Calculate score multiplier based on combo
 * Base multiplier is 1x, increases by 0.5x for every 5 combo, max 5x
 */
export function calculateMultiplier(combo: number): number {
  const baseMultiplier = 1.0;
  const bonusMultiplier = Math.floor(combo / 5) * 0.5;
  return Math.min(5.0, baseMultiplier + bonusMultiplier);
}

/**
 * Calculate score points for a hit
 */
export function calculateScore(hitAccuracy: HitAccuracy, multiplier: number): number {
  const baseScores = {
    perfect: 100,
    good: 50,
    miss: 0
  };

  return Math.floor(baseScores[hitAccuracy] * multiplier);
}

/**
 * Update ball position
 */
export function updateBall(ball: Ball, deltaTime: number = 1): Ball {
  return {
    ...ball,
    x: ball.x + ball.vx * deltaTime,
    y: ball.y + ball.vy * deltaTime
  };
}

/**
 * Check wall collisions and bounce ball
 */
export function checkWallCollisions(ball: Ball, canvasWidth: number, canvasHeight: number): Ball {
  let { x, y, vx, vy } = ball;
  const r = ball.radius;

  // Left/right walls
  if (x - r <= 0) {
    x = r;
    vx = Math.abs(vx);
  } else if (x + r >= canvasWidth) {
    x = canvasWidth - r;
    vx = -Math.abs(vx);
  }

  // Top/bottom walls
  if (y - r <= 0) {
    y = r;
    vy = Math.abs(vy);
  } else if (y + r >= canvasHeight) {
    y = canvasHeight - r;
    vy = -Math.abs(vy);
  }

  return {
    ...ball,
    x,
    y,
    vx,
    vy
  };
}

/**
 * Check if paddle hit occurred
 */
export function checkPaddleCollision(ball: Ball, paddle: Paddle): boolean {
  const ballLeft = ball.x - ball.radius;
  const ballRight = ball.x + ball.radius;
  const ballTop = ball.y - ball.radius;
  const ballBottom = ball.y + ball.radius;

  const paddleLeft = paddle.x;
  const paddleRight = paddle.x + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  return (
    ballRight >= paddleLeft &&
    ballLeft <= paddleRight &&
    ballBottom >= paddleTop &&
    ballTop <= paddleBottom &&
    ball.vx < 0 // Ball moving toward paddle
  );
}

/**
 * Apply paddle bounce
 */
export function applyPaddleBounce(ball: Ball, paddle: Paddle): Ball {
  // Calculate hit position on paddle (-1 to 1)
  const hitY = ball.y - (paddle.y + paddle.height / 2);
  const relativeHitPos = hitY / (paddle.height / 2);

  // Apply angle based on hit position
  const maxAngle = Math.PI / 3; // 60 degrees
  const bounceAngle = relativeHitPos * maxAngle;

  const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
  const vx = Math.abs(Math.cos(bounceAngle) * speed);
  const vy = Math.sin(bounceAngle) * speed;

  return {
    ...ball,
    vx,
    vy,
    x: paddle.x + paddle.width + ball.radius + 1 // Position outside paddle
  };
}

/**
 * Update paddle position
 */
export function updatePaddle(
  paddle: Paddle,
  upPressed: boolean,
  downPressed: boolean,
  canvasHeight: number,
  deltaTime: number = 1
): Paddle {
  let newY = paddle.y;

  if (upPressed && !downPressed) {
    newY -= paddle.speed * deltaTime;
  } else if (downPressed && !upPressed) {
    newY += paddle.speed * deltaTime;
  }

  // Clamp to canvas bounds
  newY = Math.max(0, Math.min(canvasHeight - paddle.height, newY));

  return {
    ...paddle,
    y: newY,
    vy: newY - paddle.y
  };
}

/**
 * Create initial rhythm game state
 */
export function createInitialRhythmState(
  canvasWidth: number,
  canvasHeight: number,
  track: Track
): RhythmGameState {
  const paddleWidth = 20;
  const paddleHeight = 100;
  const ballRadius = 8;

  return {
    ball: {
      x: canvasWidth - 100,
      y: canvasHeight / 2,
      vx: -5,
      vy: 0,
      radius: ballRadius,
      speed: 5
    },
    paddle: {
      x: 50,
      y: canvasHeight / 2 - paddleHeight / 2,
      width: paddleWidth,
      height: paddleHeight,
      speed: 8,
      vy: 0
    },
    score: 0,
    combo: 0,
    multiplier: 1.0,
    beatIndex: 0,
    perfectHits: 0,
    goodHits: 0,
    missedBeats: 0,
    elapsedTime: 0,
    isPlaying: false,
    track,
    canvas: {
      width: canvasWidth,
      height: canvasHeight
    }
  };
}

/**
 * Process a paddle hit and update game state accordingly
 */
export function processHit(state: RhythmGameState, hitAccuracy: HitAccuracy): RhythmGameState {
  const newCombo = calculateCombo(hitAccuracy, state.combo);
  const newMultiplier = calculateMultiplier(newCombo);
  const scoreGained = calculateScore(hitAccuracy, newMultiplier);

  return {
    ...state,
    combo: newCombo,
    multiplier: newMultiplier,
    score: state.score + scoreGained,
    perfectHits: state.perfectHits + (hitAccuracy === 'perfect' ? 1 : 0),
    goodHits: state.goodHits + (hitAccuracy === 'good' ? 1 : 0),
    missedBeats: state.missedBeats + (hitAccuracy === 'miss' ? 1 : 0)
  };
}

/**
 * Reset ball to center after miss
 */
export function resetBall(canvasWidth: number, canvasHeight: number): Ball {
  return {
    x: canvasWidth - 100,
    y: canvasHeight / 2,
    vx: -5,
    vy: (Math.random() - 0.5) * 4,
    radius: 8,
    speed: 5
  };
}
