/**
 * Physics Puzzle Engine
 * Core game logic for breakout-style physics puzzles with portals
 */
// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const PADDLE_SPEED = 8;
const BALL_RADIUS = 8;
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 15;
const GRAVITY = 0.15; // Downward gravity for gravity zones
const PORTAL_COOLDOWN = 200; // ms between portal uses
// ═══════════════════════════════════════════════════════════
// PADDLE MOVEMENT
// ═══════════════════════════════════════════════════════════
export function updatePaddlePosition(paddle, leftPressed, rightPressed, canvasWidth, deltaTime = 1) {
    let newX = paddle.x;
    let vx = 0;
    if (leftPressed && !rightPressed) {
        newX -= PADDLE_SPEED * deltaTime;
        vx = -PADDLE_SPEED;
    }
    else if (rightPressed && !leftPressed) {
        newX += PADDLE_SPEED * deltaTime;
        vx = PADDLE_SPEED;
    }
    // Clamp to canvas bounds
    newX = Math.max(paddle.width / 2, Math.min(canvasWidth - paddle.width / 2, newX));
    return {
        ...paddle,
        x: newX,
        vx,
    };
}
// ═══════════════════════════════════════════════════════════
// BALL PHYSICS
// ═══════════════════════════════════════════════════════════
export function updateBallPosition(ball, gravityZones, deltaTime = 1) {
    let { x, y, vx, vy } = ball;
    // Apply gravity zones
    const activeZone = gravityZones.find((zone) => x >= zone.x &&
        x <= zone.x + zone.width &&
        y >= zone.y &&
        y <= zone.y + zone.height);
    if (activeZone) {
        const gravityForce = GRAVITY * activeZone.strength;
        switch (activeZone.direction) {
            case 'down':
                vy += gravityForce * deltaTime;
                break;
            case 'up':
                vy -= gravityForce * deltaTime;
                break;
            case 'left':
                vx -= gravityForce * deltaTime;
                break;
            case 'right':
                vx += gravityForce * deltaTime;
                break;
        }
    }
    // Update position
    x += vx * deltaTime;
    y += vy * deltaTime;
    return {
        ...ball,
        x,
        y,
        vx,
        vy,
    };
}
// ═══════════════════════════════════════════════════════════
// WALL COLLISIONS
// ═══════════════════════════════════════════════════════════
export function checkWallCollisions(ball, canvasWidth, _canvasHeight) {
    let { x, y, vx, vy } = ball;
    const r = ball.radius;
    // Left/right walls
    if (x - r <= 0) {
        x = r;
        vx = Math.abs(vx);
    }
    else if (x + r >= canvasWidth) {
        x = canvasWidth - r;
        vx = -Math.abs(vx);
    }
    // Top wall
    if (y - r <= 0) {
        y = r;
        vy = Math.abs(vy);
    }
    return {
        ...ball,
        x,
        y,
        vx,
        vy,
    };
}
export function isBallOutOfBounds(ball, canvasHeight) {
    return ball.y - ball.radius > canvasHeight;
}
// ═══════════════════════════════════════════════════════════
// PADDLE COLLISION
// ═══════════════════════════════════════════════════════════
export function checkPaddleCollision(ball, paddle) {
    const ballBottom = ball.y + ball.radius;
    const paddleTop = paddle.y - paddle.height / 2;
    const paddleBottom = paddle.y + paddle.height / 2;
    const paddleLeft = paddle.x - paddle.width / 2;
    const paddleRight = paddle.x + paddle.width / 2;
    // Check if ball is overlapping paddle
    const overlapsX = ball.x >= paddleLeft && ball.x <= paddleRight;
    const overlapsY = ballBottom >= paddleTop && ball.y <= paddleBottom;
    if (overlapsX && overlapsY && ball.vy > 0) {
        return {
            collided: true,
            point: { x: ball.x, y: paddleTop },
            normal: { x: 0, y: -1 },
        };
    }
    return { collided: false };
}
export function applyPaddleBounce(ball, paddle) {
    // Calculate hit position relative to paddle center (-1 to 1)
    const relativeHitPos = (ball.x - paddle.x) / (paddle.width / 2);
    // Base bounce angle
    const maxAngle = Math.PI / 3; // 60 degrees max
    const bounceAngle = relativeHitPos * maxAngle;
    // Calculate new velocity (preserve speed)
    const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
    const vx = Math.sin(bounceAngle) * speed;
    const vy = -Math.cos(bounceAngle) * speed;
    // Add paddle momentum (30% influence)
    const finalVx = vx + paddle.vx * 0.3;
    return {
        ...ball,
        vx: finalVx,
        vy,
        y: paddle.y - paddle.height / 2 - ball.radius, // Position above paddle
    };
}
// ═══════════════════════════════════════════════════════════
// BLOCK COLLISION
// ═══════════════════════════════════════════════════════════
export function checkBlockCollision(ball, block) {
    if (!block.active) {
        return { collided: false };
    }
    // AABB collision detection
    const closestX = Math.max(block.x, Math.min(ball.x, block.x + block.width));
    const closestY = Math.max(block.y, Math.min(ball.y, block.y + block.height));
    const distanceX = ball.x - closestX;
    const distanceY = ball.y - closestY;
    const distanceSquared = distanceX ** 2 + distanceY ** 2;
    if (distanceSquared < ball.radius ** 2) {
        // Determine collision normal
        const centerX = block.x + block.width / 2;
        const centerY = block.y + block.height / 2;
        const dx = ball.x - centerX;
        const dy = ball.y - centerY;
        // Normalize
        const length = Math.sqrt(dx ** 2 + dy ** 2);
        const normal = {
            x: dx / length,
            y: dy / length,
        };
        return {
            collided: true,
            point: { x: closestX, y: closestY },
            normal,
        };
    }
    return { collided: false };
}
export function applyBlockBounce(ball, normal) {
    // Reflect velocity around normal
    const dot = ball.vx * normal.x + ball.vy * normal.y;
    const vx = ball.vx - 2 * dot * normal.x;
    const vy = ball.vy - 2 * dot * normal.y;
    return {
        ...ball,
        vx,
        vy,
    };
}
export function damageBlock(block) {
    if (block.type === 'immovable') {
        return block; // Immovable blocks don't take damage
    }
    const newHealth = block.health - 1;
    return {
        ...block,
        health: newHealth,
        active: newHealth > 0,
    };
}
// ═══════════════════════════════════════════════════════════
// PORTAL MECHANICS
// ═══════════════════════════════════════════════════════════
export function checkPortalCollision(ball, portals, currentTime) {
    // Check portal cooldown
    if (ball.lastPortalTime && currentTime - ball.lastPortalTime < PORTAL_COOLDOWN) {
        return { teleported: false };
    }
    for (const portal of portals) {
        if (!portal.active)
            continue;
        // Check if ball is inside portal
        const dx = ball.x - portal.x;
        const dy = ball.y - portal.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        if (distance <= portal.radius) {
            // Find linked portal
            const exitPortal = portals.find((p) => p.id === portal.linkedTo);
            if (!exitPortal || !exitPortal.active)
                continue;
            // Calculate exit velocity based on portal rotation
            const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
            const exitAngle = exitPortal.rotation;
            const newVx = Math.cos(exitAngle) * speed;
            const newVy = Math.sin(exitAngle) * speed;
            // Position ball at exit portal (slightly outside to prevent re-entry)
            const offsetDistance = exitPortal.radius + ball.radius + 2;
            const newX = exitPortal.x + Math.cos(exitAngle) * offsetDistance;
            const newY = exitPortal.y + Math.sin(exitAngle) * offsetDistance;
            return {
                teleported: true,
                exitPortal,
                newPosition: { x: newX, y: newY },
                newVelocity: { vx: newVx, vy: newVy },
            };
        }
    }
    return { teleported: false };
}
export function applyPortalTeleport(ball, result, currentTime) {
    if (!result.teleported || !result.newPosition || !result.newVelocity) {
        return ball;
    }
    return {
        ...ball,
        x: result.newPosition.x,
        y: result.newPosition.y,
        vx: result.newVelocity.vx,
        vy: result.newVelocity.vy,
        lastPortalUsed: result.exitPortal?.id || undefined,
        lastPortalTime: currentTime,
    };
}
// ═══════════════════════════════════════════════════════════
// BOUNCE PAD MECHANICS
// ═══════════════════════════════════════════════════════════
export function checkBouncePadCollision(ball, bouncePads) {
    for (const pad of bouncePads) {
        // AABB collision
        const ballLeft = ball.x - ball.radius;
        const ballRight = ball.x + ball.radius;
        const ballTop = ball.y - ball.radius;
        const ballBottom = ball.y + ball.radius;
        const overlapsX = ballRight >= pad.x && ballLeft <= pad.x + pad.width;
        const overlapsY = ballBottom >= pad.y && ballTop <= pad.y + pad.height;
        if (overlapsX && overlapsY) {
            return pad;
        }
    }
    return null;
}
export function applyBouncePadEffect(ball, pad) {
    const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2) * pad.power;
    const vx = Math.cos(pad.angle) * speed;
    const vy = Math.sin(pad.angle) * speed;
    return {
        ...ball,
        vx,
        vy,
    };
}
// ═══════════════════════════════════════════════════════════
// LEVEL COMPLETION CHECK
// ═══════════════════════════════════════════════════════════
export function checkLevelComplete(state) {
    const { levelData, blocks, elapsedTime, hits } = state;
    switch (levelData.goal.type) {
        case 'destroy_all':
            return blocks.every((block) => !block.active || block.type === 'immovable');
        case 'destroy_targets':
            return blocks
                .filter((block) => block.type === 'target')
                .every((block) => !block.active);
        case 'time_limit':
            return (elapsedTime <= (levelData.goal.value || 0) &&
                blocks.every((block) => !block.active || block.type === 'immovable'));
        case 'hit_limit':
            return (hits <= (levelData.goal.value || 0) &&
                blocks.every((block) => !block.active || block.type === 'immovable'));
        default:
            return false;
    }
}
// ═══════════════════════════════════════════════════════════
// STAR RATING CALCULATION
// ═══════════════════════════════════════════════════════════
export function calculateStars(state) {
    const { levelData, elapsedTime, hits } = state;
    const { starThresholds } = levelData;
    let stars = 1; // Base completion star
    // Check time threshold
    if (starThresholds.time && elapsedTime <= starThresholds.time) {
        stars = Math.max(stars, 2);
    }
    // Check hits threshold
    if (starThresholds.hits && hits <= starThresholds.hits) {
        stars = Math.max(stars, 2);
    }
    // 3 stars if both thresholds met
    if ((!starThresholds.time || elapsedTime <= starThresholds.time) &&
        (!starThresholds.hits || hits <= starThresholds.hits)) {
        stars = 3;
    }
    return stars;
}
// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════
export function createInitialBall(canvasWidth, canvasHeight, speed = 5) {
    return {
        x: canvasWidth / 2,
        y: canvasHeight - 150,
        vx: speed * (Math.random() > 0.5 ? 1 : -1),
        vy: -speed,
        radius: BALL_RADIUS,
        active: true,
    };
}
export function createPaddle(canvasWidth, canvasHeight) {
    return {
        x: canvasWidth / 2,
        y: canvasHeight - 50,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        vx: 0,
    };
}
