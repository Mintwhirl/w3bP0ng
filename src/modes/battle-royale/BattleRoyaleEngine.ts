/**
 * Battle Royale Game Engine
 * 8-player elimination with dynamic tempo and beat-synced finale
 */

import type {
  BattleRoyaleState,
  Player,
  Ball,
  EliminationEvent,
  TempoProgression,
  PaddleConfig
} from './types';

/**
 * Dynamic tempo progression from 100 BPM to 160 BPM
 */
export const BATTLE_TEMPO_PROGRESSION: TempoProgression[] = [
  { startTime: 0, endTime: 30, bpm: 100, intensity: 0.2 },   // Opening phase
  { startTime: 30, endTime: 60, bpm: 110, intensity: 0.3 }, // Early game
  { startTime: 60, endTime: 90, bpm: 120, intensity: 0.4 }, // Mid game
  { startTime: 90, endTime: 120, bpm: 135, intensity: 0.6 }, // Late game
  { startTime: 120, endTime: 150, bpm: 150, intensity: 0.8 }, // Pre-finale
  { startTime: 150, endTime: 180, bpm: 160, intensity: 1.0 }, // Final duel
];

/**
 * Get current tempo configuration based on elapsed time
 */
export function getCurrentTempo(elapsedTime: number): TempoProgression {
  for (const phase of BATTLE_TEMPO_PROGRESSION) {
    if (elapsedTime >= phase.startTime && elapsedTime < phase.endTime) {
      return phase;
    }
  }
  return BATTLE_TEMPO_PROGRESSION[BATTLE_TEMPO_PROGRESSION.length - 1]!;
}

/**
 * Calculate dynamic beat progress for visual effects
 */
export function calculateVisualIntensity(
  elapsedTime: number,
  beatProgress: number
): number {
  const tempo = getCurrentTempo(elapsedTime);
  const baseIntensity = tempo.intensity;
  const beatPulse = Math.sin(beatProgress * Math.PI) * 0.3;
  return Math.min(1.0, baseIntensity + beatPulse);
}

/**
 * Initialize Battle Royale game state
 */
export function createInitialBattleRoyaleState(
  canvasWidth: number,
  canvasHeight: number
): BattleRoyaleState {
  const players: Player[] = [];
  const balls: Ball[] = [];

  const positions = [
    { x: 100, y: 100, angle: 0 },
    { x: canvasWidth - 100, y: 100, angle: Math.PI },
    { x: 100, y: canvasHeight - 100, angle: Math.PI / 2 },
    { x: canvasWidth - 100, y: canvasHeight - 100, angle: -Math.PI / 2 },
    { x: canvasWidth / 2, y: 50, angle: Math.PI / 4 },
    { x: canvasWidth / 2, y: canvasHeight - 50, angle: -Math.PI / 4 },
    { x: 50, y: canvasHeight / 2, angle: Math.PI * 0.75 },
    { x: canvasWidth - 50, y: canvasHeight / 2, angle: -Math.PI * 0.75 },
  ];

  positions.forEach((pos, index) => {
    players.push({
      id: index,
      color: getPlayerColor(index),
      score: 0,
      alive: true,
      isHuman: index === 0, // Player 0 is the human
      paddle: {
        x: pos.x,
        y: pos.y - 40,
        width: 15,
        height: 80,
        speed: 6,
        angle: pos.angle,
        side: getPlayerSide(index) || 'left',
        ai: {
          reactionTime: 300 + Math.random() * 200,
          accuracy: 0.7 + Math.random() * 0.25,
          aggressiveness: 0.5 + Math.random() * 0.4,
        },
      },
    });
  });

  const ballCount = 2;
  for (let i = 0; i < ballCount; i++) {
    balls.push(createBall(canvasWidth, canvasHeight, i));
  }

  return {
    players,
    balls,
    eliminations: [],
    currentTime: 0,
    gamePhase: 'opening',
    playerCount: 8,
    tempoPhase: getCurrentTempo(0),
    visualIntensity: 0.2,
    finalePhase: 'none',
    winner: null,
    elapsedTime: 0,
    canvas: { width: canvasWidth, height: canvasHeight },
  };
}

function getPlayerColor(index: number): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  return colors[index % colors.length]!;
}

function getPlayerSide(index: number): 'left' | 'right' | 'top' | 'bottom' {
  const sides: Array<'left' | 'right' | 'top' | 'bottom'> = ['left', 'right', 'top', 'bottom', 'left', 'right', 'top', 'bottom'];
  return sides[index % sides.length]!;
}

function createBall(canvasWidth: number, canvasHeight: number, index: number): Ball {
  const angle = (index * Math.PI) / 2 + Math.random() * 0.5;
  const speed = 4 + Math.random() * 2;
  return {
    id: index,
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 8,
    speed: speed,
    trail: [],
  };
}

export function updateBattleRoyaleState(
  state: BattleRoyaleState,
  deltaTime: number,
  beatProgress: number
): BattleRoyaleState {
  const newState = { ...state };
  newState.elapsedTime += deltaTime / 60;
  newState.currentTime = newState.elapsedTime;

  const currentTempo = getCurrentTempo(newState.elapsedTime);
  newState.tempoPhase = currentTempo;
  newState.visualIntensity = calculateVisualIntensity(newState.elapsedTime, beatProgress);

  const alivePlayers = newState.players.filter(p => p.alive).length;
  newState.playerCount = alivePlayers;

  if (alivePlayers <= 2 && newState.gamePhase !== 'finale') {
    newState.gamePhase = 'finale';
    newState.finalePhase = 'duel';
  } else if (alivePlayers <= 4 && newState.gamePhase === 'opening') {
    newState.gamePhase = 'midgame';
  }

  newState.balls = updateBalls(newState.balls, newState.canvas, deltaTime);
  newState.players = updateAIPlayers(newState.players, newState.balls, deltaTime);

  const collisionResults = checkCollisions(newState.players, newState.balls);
  newState.eliminations = [...newState.eliminations, ...collisionResults.eliminations];
  newState.players = collisionResults.players;
  newState.balls = collisionResults.balls;

  const finalPlayers = newState.players.filter(p => p.alive);
  if (finalPlayers.length === 1 && !newState.winner) {
    newState.winner = finalPlayers[0]!;
    newState.finalePhase = 'victory';
  }

  return newState;
}

function updateBalls(balls: Ball[], canvas: { width: number; height: number }, deltaTime: number): Ball[] {
  return balls.map(ball => {
    const newBall = { ...ball };
    newBall.x += ball.vx * deltaTime;
    newBall.y += ball.vy * deltaTime;

    if (newBall.x - ball.radius <= 0 || newBall.x + ball.radius >= canvas.width) {
      newBall.vx = -newBall.vx;
    }
    if (newBall.y - ball.radius <= 0 || newBall.y + ball.radius >= canvas.height) {
      newBall.vy = -newBall.vy;
    }

    newBall.trail = [{ x: ball.x, y: ball.y, opacity: 1 }, ...ball.trail.slice(0, 8).map(t => ({ ...t, opacity: t.opacity * 0.8 }))];
    return newBall;
  });
}

function updateAIPlayers(players: Player[], balls: Ball[], deltaTime: number): Player[] {
  return players.map(player => {
    if (!player.alive || player.isHuman) return player;
    const nearestBall = findNearestBall(player.paddle, balls);
    if (!nearestBall) return player;

    const targetY = nearestBall.y;
    const currentY = player.paddle.y;
    let newY = currentY;
    const moveSpeed = player.paddle.speed * deltaTime;

    if (Math.abs(targetY - currentY) > 5) {
      newY += targetY > currentY ? moveSpeed : -moveSpeed;
    }

    return { ...player, paddle: { ...player.paddle, y: Math.max(0, Math.min(800, newY)) } };
  });
}

function findNearestBall(paddle: PaddleConfig, balls: Ball[]): Ball | null {
  if (balls.length === 0) return null;
  return balls.reduce((prev, curr) => 
    Math.hypot(curr.x - paddle.x, curr.y - paddle.y) < Math.hypot(prev.x - paddle.x, prev.y - paddle.y) ? curr : prev
  );
}

function checkCollisions(players: Player[], balls: Ball[]): {
  players: Player[];
  balls: Ball[];
  eliminations: EliminationEvent[];
} {
  const eliminations: EliminationEvent[] = [];
  const updatedPlayers = [...players];
  const updatedBalls = balls.map(ball => {
    const newBall = { ...ball };
    updatedPlayers.forEach((player, playerIdx) => {
      if (!player.alive) return;
      if (checkPaddleBallCollision(newBall, player.paddle)) {
        Object.assign(newBall, bounceBallOffPaddle(newBall, player.paddle));
        updatedPlayers[playerIdx] = { ...player, score: player.score + 10 };
      }
    });
    return newBall;
  });

  // Simplified elimination check
  updatedPlayers.forEach((player, idx) => {
    if (!player.alive) return;
    const offSide = updatedBalls.some(ball => {
      switch(player.paddle.side) {
        case 'left': return ball.x < 0;
        case 'right': return ball.x > 1200;
        case 'top': return ball.y < 0;
        case 'bottom': return ball.y > 800;
        default: return false;
      }
    });
    if (offSide && player.score < 50) {
      updatedPlayers[idx] = { ...player, alive: false };
      eliminations.push({ playerId: player.id, playerColor: player.color, timestamp: Date.now(), eliminationType: 'ball_miss', finalScore: player.score });
    }
  });

  return { players: updatedPlayers, balls: updatedBalls, eliminations };
}

function checkPaddleBallCollision(ball: Ball, paddle: PaddleConfig): boolean {
  return (
    ball.x + ball.radius >= paddle.x &&
    ball.x - ball.radius <= paddle.x + paddle.width &&
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height
  );
}

function bounceBallOffPaddle(ball: Ball, paddle: PaddleConfig): Partial<Ball> {
  const hitPosition = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
  const bounceAngle = hitPosition * Math.PI / 3;
  const speed = Math.hypot(ball.vx, ball.vy) * 1.05;
  return { vx: Math.cos(bounceAngle) * speed * (ball.vx > 0 ? -1 : 1), vy: Math.sin(bounceAngle) * speed };
}

export function getCurrentBPM(elapsedTime: number): number {
  return getCurrentTempo(elapsedTime).bpm;
}

export function isInFinalePhase(state: BattleRoyaleState): boolean {
  return state.gamePhase === 'finale' && state.finalePhase !== 'none';
}

export function getFinaleIntensity(state: BattleRoyaleState): number {
  if (!isInFinalePhase(state)) return 0.3;
  return 0.8 + (state.visualIntensity * 0.2);
}
