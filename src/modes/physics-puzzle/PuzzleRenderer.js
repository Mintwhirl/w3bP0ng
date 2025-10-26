/**
 * PuzzleRenderer - Renders physics puzzle game with W3BP0NG aesthetic
 * Uses theme colors and glassmorphic effects
 */
import { W3BP0NG_THEME } from '../../../w3bp0ng-theme.config';
/**
 * Renders the complete puzzle game state
 */
export function renderPuzzleGame(ctx, state, currentTime) {
    const { canvas } = ctx;
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Render gravity zones first (underneath everything)
    state.gravityZones.forEach(zone => renderGravityZone(ctx, zone, currentTime));
    // Render bounce pads
    state.bouncePads.forEach(pad => renderBouncePad(ctx, pad));
    // Render portals
    state.portals.forEach(portal => renderPortal(ctx, portal, currentTime));
    // Render blocks
    state.blocks.forEach(block => renderBlock(ctx, block));
    // Render paddle
    renderPaddle(ctx, state.paddle);
    // Render balls with trails
    state.balls.forEach(ball => renderBall(ctx, ball));
}
function renderBlock(ctx, block) {
    if (!block.active)
        return;
    const { x, y, width, height, type, health } = block;
    // Determine color based on type
    let baseColor;
    let glowColor;
    switch (type) {
        case 'tough':
            baseColor = W3BP0NG_THEME.colors.accent_neon;
            glowColor = W3BP0NG_THEME.colors.accent_neon;
            break;
        case 'explosive':
            baseColor = '#ff0066';
            glowColor = '#ff0066';
            break;
        case 'target':
            baseColor = '#ffff00';
            glowColor = '#ffff00';
            break;
        case 'immovable':
            baseColor = '#666666';
            glowColor = '#999999';
            break;
        default: // 'normal'
            baseColor = W3BP0NG_THEME.colors.accent_cyan;
            glowColor = W3BP0NG_THEME.colors.accent_cyan;
    }
    ctx.save();
    // Outer glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = glowColor;
    // Translucent fill
    ctx.fillStyle = baseColor + '40';
    ctx.fillRect(x, y, width, height);
    // Border with gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, baseColor + 'cc');
    gradient.addColorStop(1, baseColor + '66');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    // Highlight on top edge
    ctx.shadowBlur = 0;
    ctx.strokeStyle = baseColor + 'ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 1);
    ctx.lineTo(x + width, y + 1);
    ctx.stroke();
    // Show health for tough blocks
    if (type === 'tough' && health > 1) {
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 16px ${W3BP0NG_THEME.typography.fontFamily.primary}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(health.toString(), x + width / 2, y + height / 2);
    }
    ctx.restore();
}
function renderPortal(ctx, portal, currentTime) {
    if (!portal.active)
        return;
    const { x, y, radius, color } = portal;
    // Map portal colors to theme
    const colorMap = {
        cyan: W3BP0NG_THEME.colors.accent_cyan,
        magenta: W3BP0NG_THEME.colors.accent_neon,
        green: '#00ff88',
        orange: '#ff8800',
    };
    const portalColor = colorMap[color] || W3BP0NG_THEME.colors.accent_neon;
    ctx.save();
    // Rotating glow effect
    const rotation = (currentTime * 0.002) % (Math.PI * 2);
    // Outer glow (pulsing)
    const pulseIntensity = 0.7 + Math.sin(currentTime * 0.003) * 0.3;
    ctx.shadowBlur = 30 * pulseIntensity;
    ctx.shadowColor = portalColor;
    // Outer ring
    ctx.strokeStyle = portalColor + '80';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    // Inner swirl (rotating)
    ctx.shadowBlur = 20;
    for (let i = 0; i < 3; i++) {
        const angle = rotation + (i * Math.PI * 2) / 3;
        const swirlRadius = radius * 0.6;
        ctx.strokeStyle = portalColor + 'cc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * swirlRadius * 0.3, y + Math.sin(angle) * swirlRadius * 0.3, swirlRadius, angle, angle + Math.PI / 2);
        ctx.stroke();
    }
    // Center core
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.4);
    coreGradient.addColorStop(0, portalColor + 'ff');
    coreGradient.addColorStop(0.5, portalColor + '80');
    coreGradient.addColorStop(1, portalColor + '00');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}
function renderBouncePad(ctx, pad) {
    const { x, y, width, height, angle } = pad;
    const padColor = W3BP0NG_THEME.colors.accent_cyan;
    ctx.save();
    // Glassmorphic pad
    ctx.shadowBlur = 15;
    ctx.shadowColor = padColor;
    ctx.fillStyle = padColor + '40';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = padColor + 'cc';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    // Directional arrow
    ctx.shadowBlur = 0;
    ctx.fillStyle = padColor + 'ff';
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const arrowLength = Math.min(width, height) * 0.6;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -arrowLength / 2);
    ctx.lineTo(-arrowLength / 4, arrowLength / 2);
    ctx.lineTo(0, arrowLength / 3);
    ctx.lineTo(arrowLength / 4, arrowLength / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();
}
function renderGravityZone(ctx, zone, currentTime) {
    const { x, y, width, height, strength } = zone;
    ctx.save();
    // Subtle overlay
    const overlayColor = strength > 0
        ? W3BP0NG_THEME.colors.accent_neon
        : W3BP0NG_THEME.colors.accent_cyan;
    ctx.fillStyle = overlayColor + '10';
    ctx.fillRect(x, y, width, height);
    // Border
    ctx.strokeStyle = overlayColor + '40';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);
    // Particle effect
    const particleCount = 8;
    const time = currentTime * 0.001;
    ctx.fillStyle = overlayColor + '60';
    for (let i = 0; i < particleCount; i++) {
        const px = x + (Math.sin(time + i) * 0.5 + 0.5) * width;
        const py = y + ((time * strength * 20 + i * height / particleCount) % height);
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}
function renderPaddle(ctx, paddle) {
    const { x, y, width, height } = paddle;
    const paddleColor = W3BP0NG_THEME.colors.accent_neon;
    ctx.save();
    // Center the paddle rendering
    const renderX = x - width / 2;
    const renderY = y - height / 2;
    // Outer glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = paddleColor;
    // Glassmorphic background
    const bgGradient = ctx.createLinearGradient(renderX, renderY, renderX, renderY + height);
    bgGradient.addColorStop(0, paddleColor + '60');
    bgGradient.addColorStop(1, paddleColor + '20');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(renderX, renderY, width, height);
    // Border gradient
    const borderGradient = ctx.createLinearGradient(renderX, renderY, renderX, renderY + height);
    borderGradient.addColorStop(0, paddleColor + 'ff');
    borderGradient.addColorStop(1, paddleColor + '80');
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 2;
    ctx.strokeRect(renderX, renderY, width, height);
    // Top highlight
    ctx.shadowBlur = 0;
    ctx.strokeStyle = paddleColor + 'ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(renderX, renderY + 1);
    ctx.lineTo(renderX + width, renderY + 1);
    ctx.stroke();
    ctx.restore();
}
function renderBall(ctx, ball) {
    if (!ball.active)
        return;
    const { x, y, radius, vx, vy } = ball;
    const ballColor = W3BP0NG_THEME.colors.accent_cyan;
    ctx.save();
    // Trail effect (motion blur)
    const speed = Math.sqrt(vx ** 2 + vy ** 2);
    if (speed > 0) {
        const trailLength = Math.min(speed * 2, 30);
        const angle = Math.atan2(vy, vx);
        const trailGradient = ctx.createLinearGradient(x - Math.cos(angle) * trailLength, y - Math.sin(angle) * trailLength, x, y);
        trailGradient.addColorStop(0, ballColor + '00');
        trailGradient.addColorStop(1, ballColor + '40');
        ctx.fillStyle = trailGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
        ctx.fill();
    }
    // Outer glow
    ctx.shadowBlur = 25;
    ctx.shadowColor = ballColor;
    // Ball gradient
    const ballGradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
    ballGradient.addColorStop(0, ballColor + 'ff');
    ballGradient.addColorStop(0.7, ballColor + 'cc');
    ballGradient.addColorStop(1, ballColor + '66');
    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    // Specular highlight
    ctx.shadowBlur = 0;
    const highlightGradient = ctx.createRadialGradient(x - radius * 0.4, y - radius * 0.4, 0, x - radius * 0.4, y - radius * 0.4, radius * 0.6);
    highlightGradient.addColorStop(0, '#ffffff80');
    highlightGradient.addColorStop(1, '#ffffff00');
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}
