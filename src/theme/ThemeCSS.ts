import { UnifiedTheme } from './UnifiedTheme';

/**
 * Apply theme tokens as CSS custom properties to the document root
 */
export function applyThemeCSS(theme: UnifiedTheme): void {
  const root = document.documentElement;

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-${key.replace(/_/g, '-')}`, value);
  });

  // Gradients
  Object.entries(theme.gradients).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-gradient-${key.replace(/_/g, '-')}`, value);
  });

  // Typography
  root.style.setProperty('--w3b-font-primary', theme.typography.fontFamily.primary);
  root.style.setProperty('--w3b-font-fallback', theme.typography.fontFamily.fallback);
  
  Object.entries(theme.typography.textGlow).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-text-glow-${key}`, value);
  });

  Object.entries(theme.typography.sizes).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-font-size-${key.replace(/_/g, '-')}`, value);
  });

  // Motion
  root.style.setProperty('--w3b-ease', theme.motion.ease);
  root.style.setProperty('--w3b-ease-in', theme.motion.easeIn);
  root.style.setProperty('--w3b-ease-out', theme.motion.easeOut);
  
  Object.entries(theme.motion.duration).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-duration-${key}`, value);
  });

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-spacing-${key}`, value);
  });

  // Border Radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-radius-${key}`, value);
  });

  // Blur
  Object.entries(theme.blur).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-blur-${key}`, value);
  });

  // Z-Index
  Object.entries(theme.zIndex).forEach(([key, value]) => {
    root.style.setProperty(`--w3b-z-${key}`, value.toString());
  });

  // GAME-SPECIFIC CSS VARIABLES (for backward compatibility and CSS-based rendering)
  root.style.setProperty('--theme-paddle-left', theme.game.paddle_left.color);
  root.style.setProperty('--theme-paddle-right', theme.game.paddle_right.color);
  root.style.setProperty('--theme-ball', theme.game.ball.color);
  root.style.setProperty('--theme-ball-trail', theme.game.ball.trail);
  root.style.setProperty('--theme-score', theme.game.score.color);
  root.style.setProperty('--theme-powerup-big-paddle', theme.game.powerUp.bigPaddle);
  root.style.setProperty('--theme-powerup-fast-ball', theme.game.powerUp.fastBall);
  root.style.setProperty('--theme-powerup-multi-ball', theme.game.powerUp.multiBall);
  root.style.setProperty('--theme-powerup-shield', theme.game.powerUp.shield);

  // Background Gradient
  const gradientStops = theme.game.background.gradient
    .map((stop) => `hsl(${stop.hue}, ${stop.saturation}%, ${stop.lightness}%) ${stop.position * 100}%`)
    .join(', ');
  root.style.setProperty('--theme-bg-gradient', `linear-gradient(135deg, ${gradientStops})`);
}

/**
 * Remove theme-specific CSS variables (optional)
 */
export function removeThemeCSS(): void {
  // Usually not needed as applying a new theme overwrites the old one
}
