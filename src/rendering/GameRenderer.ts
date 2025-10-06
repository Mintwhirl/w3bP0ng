/**
 * GameRenderer - Professional Canvas 2D rendering system
 *
 * Design principles:
 * - Clean separation from game logic
 * - Theme-based visual variations
 * - Performance optimized (minimize state changes)
 * - Supports screen shake and effects
 * - Apple Liquid Glass aesthetic
 */

import type { Theme, RenderState } from './types';
import { DEFAULT_THEME } from './types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private theme: Theme;
  private startTime: number;

  constructor(canvas: HTMLCanvasElement, theme: Theme = DEFAULT_THEME) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;
    this.theme = theme;
    this.startTime = performance.now();
  }

  /**
   * Change the current theme
   */
  setTheme(theme: Theme): void {
    this.theme = theme;
  }

  /**
   * Main render function - draws entire game state
   */
  render(state: RenderState): void {
    try {
      const { screenShake } = state;

      // Apply screen shake transform
      this.ctx.save();
      this.ctx.translate(screenShake.x, screenShake.y);

      // Render in order (back to front)
      this.renderBackground();
      this.renderCenterLine();
      this.renderScores(state.score);
      this.renderParticles(state.ball.trail);
      this.renderPaddles(state.paddles, state.activePowerUps.bigPaddle);
      this.renderPowerUps(state.powerUps);
      this.renderBall(state.ball, state.gameWinner);

      if (state.activePowerUps.multiBall.active) {
        this.renderMultiBalls(state.activePowerUps.multiBall.extraBalls);
      }

      if (state.gameWinner) {
        this.renderWinMessage(state.gameWinner);
      }

      // Restore transform
      this.ctx.restore();
    } catch (error) {
      console.error('Rendering error:', error);
      this.renderFallback();
    }
  }

  /**
   * Render animated gradient background
   */
  private renderBackground(): void {
    const { gradient, animated, animationSpeed } = this.theme.background;

    const gradientObj = this.ctx.createLinearGradient(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    if (animated) {
      const time = (performance.now() - this.startTime) * 0.001 * animationSpeed;
      const sinTime = Math.sin(time);
      const cosTime = Math.cos(time);
      const halfSinTime = Math.sin(time * 0.5);

      gradient.forEach((stop) => {
        const hueShift =
          stop.position === 0
            ? sinTime * 5
            : stop.position === 0.5
            ? cosTime * 5
            : halfSinTime * 5;

        gradientObj.addColorStop(
          stop.position,
          `hsl(${stop.hue + hueShift}, ${stop.saturation}%, ${stop.lightness}%)`
        );
      });
    } else {
      gradient.forEach((stop) => {
        gradientObj.addColorStop(
          stop.position,
          `hsl(${stop.hue}, ${stop.saturation}%, ${stop.lightness}%)`
        );
      });
    }

    this.ctx.fillStyle = gradientObj;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render center dividing line
   */
  private renderCenterLine(): void {
    const centerX = this.canvas.width * 0.5;

    this.ctx.save();
    this.ctx.shadowColor = this.theme.centerLine.shadowColor;
    this.ctx.shadowBlur = 4;
    this.ctx.setLineDash([8, 16]);
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, 0);
    this.ctx.lineTo(centerX, this.canvas.height);
    this.ctx.strokeStyle = this.theme.centerLine.color;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Render scores
   */
  private renderScores(score: { left: number; right: number }): void {
    const quarterX = this.canvas.width * 0.25;
    const threeQuarterX = this.canvas.width * 0.75;

    this.ctx.save();
    this.ctx.shadowColor = this.theme.score.shadowColor;
    this.ctx.shadowBlur = 8;
    this.ctx.fillStyle = this.theme.score.color;
    this.ctx.font = 'bold 64px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(score.left.toString(), quarterX, 80);
    this.ctx.fillText(score.right.toString(), threeQuarterX, 80);
    this.ctx.restore();
  }

  /**
   * Render ball trail particles
   */
  private renderParticles(
    trail: Array<{ x: number; y: number; size: number; life: number }>
  ): void {
    this.ctx.save();
    trail.forEach((particle, index) => {
      const alpha = (index / trail.length) * 0.5;
      this.ctx.globalAlpha = alpha;
      this.ctx.shadowColor = this.theme.ball.shadowColor;
      this.ctx.shadowBlur = 8;
      this.ctx.fillStyle = this.theme.ball.trailColor;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  /**
   * Render paddles with power-up effects
   */
  private renderPaddles(
    paddles: {
      left: { x: number; y: number; width: number; height: number };
      right: { x: number; y: number; width: number; height: number };
    },
    bigPaddlePowerUp: { active: boolean; player: string | null }
  ): void {
    this.renderPaddle(
      paddles.left,
      'left',
      this.theme.paddle.left,
      bigPaddlePowerUp
    );
    this.renderPaddle(
      paddles.right,
      'right',
      this.theme.paddle.right,
      bigPaddlePowerUp
    );
  }

  /**
   * Render single paddle
   */
  private renderPaddle(
    paddle: { x: number; y: number; width: number; height: number },
    player: string,
    colors: { color: string; shadowColor: string },
    bigPaddlePowerUp: { active: boolean; player: string | null }
  ): void {
    this.ctx.save();

    const isBig = bigPaddlePowerUp.active && bigPaddlePowerUp.player === player;
    const paddleHeight = isBig ? paddle.height * 2 : paddle.height;
    const paddleY = isBig ? paddle.y - paddle.height / 2 : paddle.y;

    // Outer glow
    this.ctx.shadowColor = colors.shadowColor;
    this.ctx.shadowBlur = isBig ? 20 : 12;
    this.ctx.fillStyle = colors.color;
    this.ctx.fillRect(paddle.x - 1, paddleY - 1, paddle.width + 2, paddleHeight + 2);

    // Inner core (liquid glass effect)
    this.ctx.shadowBlur = isBig ? 8 : 4;
    this.ctx.fillStyle = '#f3f4f6';
    this.ctx.fillRect(paddle.x, paddleY, paddle.width, paddleHeight);

    this.ctx.restore();
  }

  /**
   * Render main ball
   */
  private renderBall(
    ball: { x: number; y: number; radius: number },
    gameWinner: string | null
  ): void {
    if (gameWinner) return; // Don't render ball when game is over

    this.ctx.save();

    // Outer glow
    this.ctx.shadowColor = this.theme.ball.shadowColor;
    this.ctx.shadowBlur = 15;
    this.ctx.fillStyle = this.theme.ball.color;
    this.ctx.beginPath();
    this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner core (liquid glass effect)
    this.ctx.shadowBlur = 3;
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.beginPath();
    this.ctx.arc(ball.x, ball.y, ball.radius * 0.6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * Render multi-ball power-up balls
   */
  private renderMultiBalls(
    extraBalls: Array<{ x: number; y: number; radius: number }>
  ): void {
    const multiBallColor = this.theme.powerUp.multiBall;

    extraBalls.forEach((extraBall) => {
      this.ctx.save();

      // Outer glow
      this.ctx.shadowColor = `${multiBallColor}80`; // Add alpha
      this.ctx.shadowBlur = 15;
      this.ctx.fillStyle = multiBallColor;
      this.ctx.beginPath();
      this.ctx.arc(extraBall.x, extraBall.y, extraBall.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Inner core
      this.ctx.shadowBlur = 3;
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.beginPath();
      this.ctx.arc(
        extraBall.x,
        extraBall.y,
        extraBall.radius * 0.6,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  /**
   * Render floating power-ups
   */
  private renderPowerUps(
    powerUps: Array<{
      x: number;
      y: number;
      type: string;
      rotation: number;
      color: string;
      symbol: string;
    }>
  ): void {
    powerUps.forEach((powerUp) => {
      this.ctx.save();
      this.ctx.translate(powerUp.x, powerUp.y);
      this.ctx.rotate(powerUp.rotation);

      // Outer glow
      this.ctx.shadowColor = powerUp.color;
      this.ctx.shadowBlur = 25;
      this.ctx.fillStyle = powerUp.color;
      this.ctx.fillRect(-18, -18, 36, 36);

      // Inner bright core
      this.ctx.shadowBlur = 8;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(-15, -15, 30, 30);

      // Draw symbol
      this.drawPowerUpSymbol(powerUp.type, powerUp.color);

      this.ctx.restore();
    });
  }

  /**
   * Draw power-up symbol
   */
  private drawPowerUpSymbol(type: string, color: string): void {
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';

    switch (type) {
      case 'bigPaddle':
        this.ctx.fillRect(-2, -12, 4, 24);
        this.ctx.beginPath();
        this.ctx.moveTo(-6, -8);
        this.ctx.lineTo(0, -14);
        this.ctx.lineTo(6, -8);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(-6, 8);
        this.ctx.lineTo(0, 14);
        this.ctx.lineTo(6, 8);
        this.ctx.stroke();
        break;

      case 'fastBall':
        this.ctx.beginPath();
        this.ctx.arc(2, 0, 4, 0, Math.PI * 2);
        this.ctx.fill();
        for (let i = 0; i < 3; i++) {
          this.ctx.beginPath();
          this.ctx.moveTo(-12 + i * 2, -6 + i * 6);
          this.ctx.lineTo(-8 + i * 2, -6 + i * 6);
          this.ctx.stroke();
        }
        break;

      case 'multiBall':
        this.ctx.beginPath();
        this.ctx.arc(-6, -3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(6, -3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(0, 6, 3, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case 'shield':
        this.ctx.beginPath();
        this.ctx.moveTo(0, -12);
        this.ctx.lineTo(-8, -6);
        this.ctx.lineTo(-8, 6);
        this.ctx.lineTo(0, 12);
        this.ctx.lineTo(8, 6);
        this.ctx.lineTo(8, -6);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -8);
        this.ctx.lineTo(0, 8);
        this.ctx.moveTo(-6, 0);
        this.ctx.lineTo(6, 0);
        this.ctx.stroke();
        break;
    }
  }

  /**
   * Render win message
   */
  private renderWinMessage(winner: string): void {
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
    this.ctx.shadowBlur = 20;
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.font = 'bold 36px "Courier New", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      `${winner.toUpperCase()} PLAYER WINS!`,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.ctx.font = 'bold 18px "Courier New", monospace';
    this.ctx.fillText(
      'Press R to restart',
      this.canvas.width / 2,
      this.canvas.height / 2 + 50
    );
    this.ctx.restore();
  }

  /**
   * Fallback rendering if main render fails
   */
  private renderFallback(): void {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'Game temporarily unavailable',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return this.theme;
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
