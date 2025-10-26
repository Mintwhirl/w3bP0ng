/**
 * RhythmRenderer - Beat-responsive renderer with W3BP0NG aesthetic
 * Renders rhythm mode with pulsing effects synchronized to music
 */
import { W3BP0NG_THEME } from '../../../w3bp0ng-theme.config';
/**
 * Renders expanding concentric rings on each beat
 */
function renderBeatPulse(ctx, beatProgress, intensity, canvasWidth, canvasHeight) {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const maxRadius = Math.max(canvasWidth, canvasHeight);
    // Render 3 expanding rings at different phases
    for (let i = 0; i < 3; i++) {
        const phaseOffset = i * 0.33;
        const progress = (beatProgress + phaseOffset) % 1;
        const radius = progress * maxRadius * 0.6;
        const alpha = (1 - progress) * intensity * 0.4;
        if (alpha > 0.01) {
            ctx.save();
            ctx.strokeStyle = W3BP0NG_THEME.colors.accent_cyan + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 3 * (1 - progress) + 1;
            ctx.shadowBlur = 20 * intensity;
            ctx.shadowColor = W3BP0NG_THEME.colors.accent_cyan;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }
}
/**
 * Renders screen edge glow based on combo/multiplier
 */
function renderComboGlow(ctx, combo, multiplier, canvasWidth, canvasHeight) {
    if (combo === 0)
        return;
    // Color shifts based on multiplier: cyan → violet → magenta
    let glowColor;
    if (multiplier < 2) {
        glowColor = W3BP0NG_THEME.colors.accent_cyan;
    }
    else if (multiplier < 4) {
        glowColor = W3BP0NG_THEME.colors.accent_violet;
    }
    else {
        glowColor = W3BP0NG_THEME.colors.accent_neon;
    }
    const intensity = Math.min(combo / 20, 1);
    ctx.save();
    // Create radial gradient from edges
    const gradient = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, Math.min(canvasWidth, canvasHeight) * 0.3, canvasWidth / 2, canvasHeight / 2, Math.max(canvasWidth, canvasHeight) * 0.7);
    gradient.addColorStop(0, glowColor + '00');
    gradient.addColorStop(1, glowColor + Math.floor(intensity * 255 * 0.3).toString(16).padStart(2, '0'));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
}
/**
 * Renders timing guide for next beat
 */
function renderBeatIndicator(ctx, beatProgress, canvasWidth, canvasHeight) {
    const centerX = canvasWidth / 2;
    const indicatorY = canvasHeight - 60;
    const barWidth = 200;
    const barHeight = 8;
    // Background bar
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(centerX - barWidth / 2, indicatorY, barWidth, barHeight);
    // Progress bar (fills as beat approaches)
    const progress = beatProgress;
    const progressWidth = barWidth * progress;
    const barColor = progress > 0.8 ? W3BP0NG_THEME.colors.accent_cyan : W3BP0NG_THEME.colors.accent_violet;
    ctx.fillStyle = barColor;
    ctx.shadowBlur = progress > 0.8 ? 15 : 5;
    ctx.shadowColor = barColor;
    ctx.fillRect(centerX - barWidth / 2, indicatorY, progressWidth, barHeight);
    // Pulsing indicator dot at the target
    if (progress > 0.8) {
        const pulseScale = 1 + Math.sin(Date.now() / 100) * 0.2;
        ctx.fillStyle = W3BP0NG_THEME.colors.accent_cyan;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(centerX + barWidth / 2, indicatorY + barHeight / 2, 6 * pulseScale, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}
/**
 * Renders background particle field that responds to beat intensity
 */
function renderBackgroundParticles(ctx, beatProgress, intensity, canvasWidth, canvasHeight) {
    const particleCount = 50;
    const beatPulse = Math.sin(beatProgress * Math.PI) * intensity;
    ctx.save();
    for (let i = 0; i < particleCount; i++) {
        // Deterministic positioning based on index
        const x = ((i * 137.508) % canvasWidth);
        const y = ((i * 73.234) % canvasHeight);
        const size = 1 + beatPulse * 2;
        const alpha = 0.2 + beatPulse * 0.3;
        const color = i % 2 === 0 ? W3BP0NG_THEME.colors.accent_cyan : W3BP0NG_THEME.colors.accent_violet;
        ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.shadowBlur = 5 * beatPulse;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}
/**
 * Renders the ball with motion blur trail and pulse glow
 */
function renderBall(ctx, x, y, radius, vx, vy, beatProgress) {
    const speed = Math.sqrt(vx * vx + vy * vy);
    const trailLength = Math.min(speed * 2, 30);
    const beatPulse = 1 + Math.sin(beatProgress * Math.PI) * 0.3;
    ctx.save();
    // Motion blur trail
    if (trailLength > 0) {
        const trailSteps = 8;
        const dx = -vx / speed;
        const dy = -vy / speed;
        for (let i = trailSteps; i > 0; i--) {
            const t = i / trailSteps;
            const trailX = x + dx * trailLength * t;
            const trailY = y + dy * trailLength * t;
            const trailAlpha = (1 - t) * 0.3;
            ctx.fillStyle = W3BP0NG_THEME.colors.accent_cyan + Math.floor(trailAlpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(trailX, trailY, radius * (1 - t * 0.3), 0, Math.PI * 2);
            ctx.fill();
        }
    }
    // Main ball with beat pulse
    ctx.fillStyle = W3BP0NG_THEME.colors.accent_cyan;
    ctx.shadowBlur = 20 * beatPulse;
    ctx.shadowColor = W3BP0NG_THEME.colors.accent_cyan;
    ctx.beginPath();
    ctx.arc(x, y, radius * beatPulse, 0, Math.PI * 2);
    ctx.fill();
    // Inner glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * beatPulse);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.5, W3BP0NG_THEME.colors.accent_cyan);
    gradient.addColorStop(1, W3BP0NG_THEME.colors.accent_cyan + '00');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * beatPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}
/**
 * Renders the paddle with glassmorphic style and beat pulse
 */
function renderPaddle(ctx, x, y, width, height, beatProgress) {
    const beatPulse = Math.sin(beatProgress * Math.PI);
    const glowIntensity = 15 + beatPulse * 10;
    ctx.save();
    // Outer glow
    ctx.shadowBlur = glowIntensity;
    ctx.shadowColor = W3BP0NG_THEME.colors.accent_neon;
    // Glassmorphic background
    ctx.fillStyle = W3BP0NG_THEME.colors.accent_neon + '26'; // 15% opacity
    ctx.fillRect(x, y, width, height);
    // Border with beat pulse
    ctx.strokeStyle = W3BP0NG_THEME.colors.accent_neon;
    ctx.lineWidth = 2 + beatPulse;
    ctx.strokeRect(x, y, width, height);
    // Specular highlight
    const highlightGradient = ctx.createLinearGradient(x, y, x, y + height);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    ctx.fillStyle = highlightGradient;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
}
/**
 * Renders combo/multiplier display
 */
function renderComboDisplay(ctx, combo, multiplier, canvasWidth) {
    if (combo === 0)
        return;
    const centerX = canvasWidth / 2;
    const topY = 100;
    ctx.save();
    // Multiplier color
    let color;
    if (multiplier < 2) {
        color = W3BP0NG_THEME.colors.accent_cyan;
    }
    else if (multiplier < 4) {
        color = W3BP0NG_THEME.colors.accent_violet;
    }
    else {
        color = W3BP0NG_THEME.colors.accent_neon;
    }
    // Combo text
    ctx.font = `bold 36px ${W3BP0NG_THEME.typography.fontFamily.primary}`;
    ctx.fillStyle = color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.textAlign = 'center';
    ctx.fillText(`${combo} COMBO`, centerX, topY);
    // Multiplier
    ctx.font = `bold 24px ${W3BP0NG_THEME.typography.fontFamily.primary}`;
    ctx.fillText(`×${multiplier.toFixed(1)}`, centerX, topY + 35);
    ctx.restore();
}
/**
 * Main render function for rhythm mode
 */
export function renderRhythmGame(ctx, state, beatProgress) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // Calculate beat intensity from state
    const beatIntensity = state.combo > 0 ? Math.min(state.combo / 10, 1) : 0.5;
    // Render layers back to front
    renderBackgroundParticles(ctx, beatProgress, beatIntensity, canvasWidth, canvasHeight);
    renderBeatPulse(ctx, beatProgress, beatIntensity, canvasWidth, canvasHeight);
    renderComboGlow(ctx, state.combo, state.multiplier, canvasWidth, canvasHeight);
    // Render game entities
    renderBall(ctx, state.ball.x, state.ball.y, state.ball.radius, state.ball.vx, state.ball.vy, beatProgress);
    renderPaddle(ctx, state.paddle.x, state.paddle.y, state.paddle.width, state.paddle.height, beatProgress);
    // Render UI elements
    renderBeatIndicator(ctx, beatProgress, canvasWidth, canvasHeight);
    renderComboDisplay(ctx, state.combo, state.multiplier, canvasWidth);
}
