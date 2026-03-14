/**
 * Battle Royale Renderer
 * 8-player elimination arena with BeatSync-integrated dynamic finale effects
 */

import { getActiveTheme } from '../../theme/ThemeManager';
import type {
  BattleRoyaleState,
  BattleRoyaleRenderState,
  Player,
  Ball,
  VisualEffects,
} from './types';

/**
 * Render Battle Royale arena with dynamic beat-synchronized effects
 */
export function renderBattleRoyale(
  ctx: CanvasRenderingContext2D,
  state: BattleRoyaleRenderState
): void {
  try {
    if (!ctx || !state) {
      console.warn('[BattleRoyaleRenderer] Missing context or state');
      return;
    }

    const canvas = ctx.canvas;
    if (!canvas || typeof canvas.width !== 'number' || typeof canvas.height !== 'number') {
      console.warn('[BattleRoyaleRenderer] Invalid canvas');
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Validate canvas dimensions
    if (width <= 0 || height <= 0) {
      console.warn('[BattleRoyaleRenderer] Invalid canvas dimensions:', { width, height });
      return;
    }

    // Clear canvas
    try {
      ctx.clearRect(0, 0, width, height);
    } catch (error) {
      console.error('[BattleRoyaleRenderer] Failed to clear canvas:', error);
      return;
    }

    // Render in layers: background -> arena -> players -> balls -> effects
    try {
      renderBackground(ctx, width, height, state.visualEffects);
    } catch (error) {
      console.error('[BattleRoyaleRenderer] Failed to render background:', error);
    }

    try {
      renderArena(ctx, width, height, state.game, state.beatProgress);
    } catch (error) {
      console.error('[BattleRoyaleRenderer] Failed to render arena:', error);
    }

    try {
      renderPlayers(ctx, state.game?.players || []);
    } catch (error) {
      console.error('[BattleRoyaleRenderer] Failed to render players:', error);
    }

    try {
      renderBalls(ctx, state.game?.balls || []);
    } catch (error) {
      console.error('[BattleRoyaleRenderer] Failed to render balls:', error);
    }

    try {
      renderDynamicEffects(ctx, state);
    } catch (error) {
      console.error('[BattleRoyaleRenderer] Failed to render dynamic effects:', error);
    }

    try {
      renderHUD(ctx, state);
    } catch (error) {
      console.error('[BattleRoyaleRenderer] Failed to render HUD:', error);
    }
  } catch (error) {
    console.error('[BattleRoyaleRenderer] Critical rendering error:', error);
  }
}

/**
 * Render cosmic background with beat-modulated particles
 */
function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  effects: VisualEffects
): void {
  const theme = getActiveTheme();
  // Base cosmic gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, theme.colors.background_primary);
  gradient.addColorStop(1, theme.colors.background_secondary);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Beat-synchronized particle field
  renderBeatSyncedParticles(ctx, width, height, effects.particleIntensity, effects.beatProgress);
}

/**
 * Render particle field that responds to beat intensity
 */
function renderBeatSyncedParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number,
  beatProgress: number
): void {
  const theme = getActiveTheme();
  const particleCount = 60;
  const pulseAmount = Math.sin(beatProgress * Math.PI) * intensity;

  ctx.save();

  for (let i = 0; i < particleCount; i++) {
    // Deterministic particle positioning
    const x = ((i * 137.508) % width);
    const y = ((i * 73.234) % height);

    // Beat-modulated properties
    const baseSize = 1 + (i % 3) * 0.5;
    const size = baseSize * (1 + pulseAmount * 0.8);
    const baseAlpha = 0.2 + (i % 4) * 0.1;
    const alpha = baseAlpha * (1 + pulseAmount * 0.6);

    // Color cycling based on beat
    const colorProgress = (i / particleCount + beatProgress * 0.1) % 1;
    const color = colorProgress < 0.5 ? theme.colors.neon_secondary : theme.colors.neon_tertiary;

    ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.shadowBlur = 5 * (1 + pulseAmount);
    ctx.shadowColor = color;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Render arena with neon edges and beat pulsing
 */
function renderArena(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _state: BattleRoyaleState, // State parameter for future use
  beatProgress: number
): void {
  const theme = getActiveTheme();
  const centerX = width / 2;
  const centerY = height / 2;
  const arenaRadius = Math.min(width, height) * 0.4;

  // Beat pulse effect
  const pulseScale = 1 + Math.sin(beatProgress * Math.PI) * 0.02;
  const radius = arenaRadius * pulseScale;

  // Arena boundary with neon glow
  ctx.save();

  // Outer glow layer
  ctx.strokeStyle = theme.colors.neon_primary;
  ctx.lineWidth = 4 + Math.sin(beatProgress * Math.PI * 2) * 2;
  ctx.shadowBlur = 20 + Math.sin(beatProgress * Math.PI) * 10;
  ctx.shadowColor = theme.colors.neon_primary;

  // Draw octagonal arena
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();

  // Inner glass panel
  ctx.strokeStyle = theme.colors.glass_border + '40';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.stroke();

  ctx.restore();
}

/**
 * Render all players with elimination effects
 */
function renderPlayers(ctx: CanvasRenderingContext2D, players: Player[]): void {
  try {
    if (!Array.isArray(players)) {
      console.warn('[BattleRoyaleRenderer] Invalid players array');
      return;
    }

    players.forEach((player, index) => {
      try {
        if (!player) {
          console.warn(`[BattleRoyaleRenderer] Invalid player at index ${index}`);
          return;
        }

        if (player.alive) {
          renderPaddle(ctx, player);
        } else {
          renderEliminatedPaddle(ctx, player);
        }
      } catch (error) {
        console.error(`[BattleRoyaleRenderer] Failed to render player ${index}:`, error);
      }
    });
  } catch (error) {
    console.error('[BattleRoyaleRenderer] Failed to render players:', error);
  }
}

/**
 * Render active paddle with neon glow
 */
function renderPaddle(ctx: CanvasRenderingContext2D, player: Player): void {
  const paddle = player.paddle;

  ctx.save();

  // Neon glow effect
  ctx.shadowBlur = 15;
  ctx.shadowColor = player.color;

  // Glassmorphic paddle
  ctx.fillStyle = player.color + '40'; // 25% opacity
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // Neon border
  ctx.strokeStyle = player.color;
  ctx.lineWidth = 2;
  ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // Specular highlight
  const highlightGradient = ctx.createLinearGradient(
    paddle.x, paddle.y,
    paddle.x, paddle.y + paddle.height
  );
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = highlightGradient;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  ctx.restore();
}

/**
 * Render eliminated paddle with glass fracture effect
 */
function renderEliminatedPaddle(ctx: CanvasRenderingContext2D, player: Player): void {
  const paddle = player.paddle;

  ctx.save();
  ctx.globalAlpha = 0.3;

  // Glass fracture effect
  ctx.strokeStyle = player.color + '60';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 5]);

  // Draw fractured lines
  for (let i = 0; i < 3; i++) {
    const startX = paddle.x + Math.random() * paddle.width;
    const startY = paddle.y + Math.random() * paddle.height;
    const endX = paddle.x + Math.random() * paddle.width;
    const endY = paddle.y + Math.random() * paddle.height;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  // Fading paddle
  ctx.fillStyle = player.color + '20';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  ctx.restore();
}

/**
 * Render balls with motion trails
 */
function renderBalls(ctx: CanvasRenderingContext2D, balls: Ball[]): void {
  try {
    if (!Array.isArray(balls)) {
      console.warn('[BattleRoyaleRenderer] Invalid balls array');
      return;
    }

    balls.forEach((ball, index) => {
      try {
        if (!ball) {
          console.warn(`[BattleRoyaleRenderer] Invalid ball at index ${index}`);
          return;
        }

        renderBall(ctx, ball);
      } catch (error) {
        console.error(`[BattleRoyaleRenderer] Failed to render ball ${index}:`, error);
      }
    });
  } catch (error) {
    console.error('[BattleRoyaleRenderer] Failed to render balls:', error);
  }
}

/**
 * Render ball with motion trail
 */
function renderBall(ctx: CanvasRenderingContext2D, ball: Ball): void {
  const theme = getActiveTheme();
  // Render trail first
  ball.trail.forEach((point, index) => {
    const alpha = point.opacity * (index / ball.trail.length);
    const size = ball.radius * (1 - index / ball.trail.length * 0.5);

    ctx.fillStyle = theme.colors.neon_secondary + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Main ball
  ctx.save();

  // Neon glow
  ctx.shadowBlur = 20;
  ctx.shadowColor = theme.colors.neon_secondary;

  // Ball body
  ctx.fillStyle = theme.colors.neon_secondary;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  // Inner highlight
  const highlightGradient = ctx.createRadialGradient(
    ball.x - ball.radius * 0.3,
    ball.y - ball.radius * 0.3,
    0,
    ball.x,
    ball.y,
    ball.radius
  );
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  highlightGradient.addColorStop(0.5, theme.colors.neon_secondary + 'CC');
  highlightGradient.addColorStop(1, theme.colors.neon_secondary + '00');

  ctx.fillStyle = highlightGradient;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render dynamic effects synchronized to beat
 */
function renderDynamicEffects(
  ctx: CanvasRenderingContext2D,
  state: BattleRoyaleRenderState
): void {
  const { visualEffects, beatProgress, game } = state;

  // Screen edge glow based on intensity
  if (visualEffects.glowIntensity > 0.5) {
    renderScreenGlow(ctx, visualEffects.glowIntensity, beatProgress);
  }

  // Finale pulse effects
  if (game.gamePhase === 'finale' && game.finalePhase !== 'none') {
    renderFinalePulse(ctx, beatProgress, visualEffects.pulseIntensity);
  }

  // Note: Screen shake and camera zoom would be applied via CSS transform in the React component
}

/**
 * Render screen edge glow effect
 */
function renderScreenGlow(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  beatProgress: number
): void {
  const theme = getActiveTheme();
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.save();

  // Pulsing radial gradient from edges
  const pulseIntensity = Math.sin(beatProgress * Math.PI) * 0.3 + 0.7;
  const glowColor = theme.colors.neon_primary;

  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.3,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.7
  );

  gradient.addColorStop(0, glowColor + '00');
  gradient.addColorStop(0.7, glowColor + '00');
  gradient.addColorStop(1, glowColor + Math.floor(intensity * pulseIntensity * 255 * 0.3).toString(16).padStart(2, '0'));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}

/**
 * Render finale pulse effect for final duel
 */
function renderFinalePulse(
  ctx: CanvasRenderingContext2D,
  beatProgress: number,
  intensity: number
): void {
  const theme = getActiveTheme();
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.save();

  // Expanding pulse rings
  for (let i = 0; i < 4; i++) {
    const phase = (beatProgress + i * 0.25) % 1;
    const radius = phase * Math.max(width, height) * 0.6;
    const alpha = (1 - phase) * intensity * 0.5;

    if (alpha > 0.01) {
      ctx.strokeStyle = theme.colors.neon_secondary + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 3 * (1 - phase);
      ctx.shadowBlur = 15 * intensity;
      ctx.shadowColor = theme.colors.neon_secondary;

      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Render HUD elements
 */
function renderHUD(
  ctx: CanvasRenderingContext2D,
  state: BattleRoyaleRenderState
): void {
  const theme = getActiveTheme();
  const { game } = state;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.save();

  // Players remaining counter
  const aliveCount = game.players.filter(p => p.alive).length;
  ctx.font = `bold 24px ${theme.typography.fontFamily.primary}`;
  ctx.fillStyle = theme.colors.text_primary;
  ctx.shadowBlur = 10;
  ctx.shadowColor = theme.colors.neon_secondary;
  ctx.textAlign = 'center';
  ctx.fillText(`Players: ${aliveCount}`, width / 2, 40);

  // Current tempo indicator
  const tempo = game.tempoPhase.bpm;
  ctx.font = `16px ${theme.typography.fontFamily.primary}`;
  ctx.fillStyle = theme.colors.text_secondary;
  ctx.shadowColor = theme.colors.neon_tertiary;
  ctx.fillText(`${tempo} BPM`, width / 2, 65);

  // Game phase indicator
  let phaseText = '';
  switch (game.gamePhase) {
    case 'opening': phaseText = 'CHAOS BEGINS'; break;
    case 'midgame': phaseText = 'SURVIVAL'; break;
    case 'finale':
      if (game.finalePhase === 'duel') phaseText = 'FINAL DUEL';
      if (game.finalePhase === 'victory') phaseText = 'VICTORY!';
      break;
  }

  if (phaseText) {
    ctx.font = `bold 32px ${theme.typography.fontFamily.primary}`;
    ctx.fillStyle = theme.colors.neon_primary;
    ctx.shadowBlur = 20;
    ctx.shadowColor = theme.colors.neon_primary;
    ctx.fillText(phaseText, width / 2, height - 40);
  }

  ctx.restore();
}

/**
 * Calculate visual effects based on game state and beat progress
 */
export function calculateVisualEffects(
  state: BattleRoyaleState,
  beatProgress: number
): VisualEffects {
  const baseIntensity = state.visualIntensity;
  const beatPulse = Math.sin(beatProgress * Math.PI);

  return {
    particleIntensity: Math.min(1.0, baseIntensity + beatPulse * 0.3),
    glowIntensity: state.gamePhase === 'finale' ? 0.8 : baseIntensity * 0.5,
    pulseIntensity: beatPulse * baseIntensity,
    screenShakeIntensity: state.gamePhase === 'finale' ? 0.6 : baseIntensity * 0.2,
    cameraZoom: state.gamePhase === 'finale' ? 1.2 + baseIntensity * 0.3 : 1.0,
    beatProgress: beatProgress,
  };
}

/**
 * Create render state for frame rendering
 */
export function createRenderState(
  game: BattleRoyaleState,
  beatProgress: number
): BattleRoyaleRenderState {
  const visualEffects = calculateVisualEffects(game, beatProgress);

  // Calculate current rankings
  const sortedPlayers = [...game.players]
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      player,
      rank: index + 1,
      eliminationTime: !player.alive ? game.eliminations.find(e => e.playerId === player.id)?.timestamp : undefined as number | undefined,
    }));

  return {
    game,
    visualEffects,
    beatProgress,
    currentPlayerRanking: sortedPlayers,
  };
}
