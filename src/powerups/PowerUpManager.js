/**
 * PowerUpManager - Power-up spawn logic, collision detection, and activation
 *
 * Design principles:
 * - Pure spawn calculations (deterministic output)
 * - Configurable power-up types
 * - Growing difficulty over time (power-ups float farther)
 * - Clean collision detection
 */
/**
 * Available power-up configurations
 */
export const POWER_UP_TYPES = [
    { type: 'bigPaddle', color: '#3b82f6', symbol: 'B', duration: 480 }, // 8 seconds
    { type: 'fastBall', color: '#ef4444', symbol: 'F', duration: 360 }, // 6 seconds
    { type: 'multiBall', color: '#f59e0b', symbol: 'M', duration: 600 }, // 10 seconds
    { type: 'shield', color: '#10b981', symbol: 'S', uses: 1 },
];
/**
 * Generate spawn timer for next power-up
 * Returns frames until next spawn (randomized 2-10 seconds)
 */
export function generateSpawnTimer() {
    const minSeconds = 2;
    const maxSeconds = 10;
    const randomSeconds = minSeconds + Math.random() * (maxSeconds - minSeconds);
    return Math.floor(randomSeconds * 60); // Convert to frames (60fps)
}
/**
 * Create a new power-up at random position
 */
export function spawnPowerUp(canvasWidth, canvasHeight, currentTime = Date.now()) {
    // Pick random power-up type
    const randomConfig = POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
    // Random position (avoiding edges)
    const marginX = 150;
    const marginY = 75;
    const x = Math.random() * (canvasWidth - marginX * 2) + marginX;
    const y = Math.random() * (canvasHeight - marginY * 2) + marginY;
    // Floating animation parameters
    const floatOffset = Math.random() * Math.PI * 2;
    const floatSpeed = 0.02 + Math.random() * 0.03;
    const floatRadius = 20 + Math.random() * 15;
    return {
        id: currentTime,
        type: randomConfig.type,
        color: randomConfig.color,
        symbol: randomConfig.symbol,
        x,
        y,
        baseX: x,
        baseY: y,
        rotation: 0,
        floatOffset,
        floatSpeed,
        floatRadius,
        maxFloatRadius: floatRadius,
        spawnTime: currentTime,
    };
}
/**
 * Update power-up animation (rotation and floating)
 * Power-ups grow more difficult to catch over time
 */
export function updatePowerUpAnimation(powerUp, canvasWidth, canvasHeight, currentTime = Date.now()) {
    // Update rotation
    const newRotation = powerUp.rotation + 0.05;
    // Update float offset
    const newFloatOffset = powerUp.floatOffset + powerUp.floatSpeed;
    // Calculate growth (power-ups get harder to catch over time)
    const timeElapsedSeconds = (currentTime - powerUp.spawnTime) / 1000;
    const growthFactor = 1 + timeElapsedSeconds / 10;
    const newFloatRadius = Math.min(powerUp.maxFloatRadius * growthFactor, 80);
    // Calculate floating position
    const floatX = Math.cos(newFloatOffset) * newFloatRadius;
    const floatY = Math.sin(newFloatOffset * 0.7) * newFloatRadius * 0.6;
    let newX = powerUp.baseX + floatX;
    let newY = powerUp.baseY + floatY;
    // Clamp to canvas bounds (with margin)
    const margin = 30 + newFloatRadius;
    newX = Math.max(margin, Math.min(canvasWidth - margin, newX));
    newY = Math.max(margin, Math.min(canvasHeight - margin, newY));
    // Update base position if hitting edges (prevents getting stuck)
    let newBaseX = powerUp.baseX;
    let newBaseY = powerUp.baseY;
    if (newX === margin || newX === canvasWidth - margin) {
        newBaseX = newX;
    }
    if (newY === margin || newY === canvasHeight - margin) {
        newBaseY = newY;
    }
    return {
        ...powerUp,
        x: newX,
        y: newY,
        baseX: newBaseX,
        baseY: newBaseY,
        rotation: newRotation,
        floatOffset: newFloatOffset,
        floatRadius: newFloatRadius,
    };
}
/**
 * Check collision between ball and power-up
 */
export function checkPowerUpCollision(ball, powerUp, powerUpRadius = 20) {
    const dx = ball.x - powerUp.x;
    const dy = ball.y - powerUp.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < ball.radius + powerUpRadius;
}
/**
 * Determine which player gets the power-up based on ball direction
 */
export function getPowerUpOwner(ball) {
    return ball.dx > 0 ? 'right' : 'left';
}
/**
 * Get power-up configuration by type
 */
export function getPowerUpConfig(type) {
    const config = POWER_UP_TYPES.find((p) => p.type === type);
    if (!config) {
        throw new Error(`Unknown power-up type: ${type}`);
    }
    return config;
}
/**
 * Check if spawn timer has expired
 */
export function shouldSpawnPowerUp(spawnTimer, currentPowerUpCount) {
    return spawnTimer <= 0 && currentPowerUpCount === 0;
}
/**
 * Update all power-ups in array
 * Returns new array with updated positions/animations
 */
export function updateAllPowerUps(powerUps, canvasWidth, canvasHeight, currentTime = Date.now()) {
    return powerUps.map((powerUp) => updatePowerUpAnimation(powerUp, canvasWidth, canvasHeight, currentTime));
}
/**
 * Check ball collision with all power-ups
 * Returns the power-up that was hit, or null
 */
export function findCollidingPowerUp(ball, powerUps) {
    for (const powerUp of powerUps) {
        if (checkPowerUpCollision(ball, powerUp)) {
            return powerUp;
        }
    }
    return null;
}
/**
 * Remove a power-up from the list by ID
 */
export function removePowerUp(powerUps, powerUpId) {
    return powerUps.filter((p) => p.id !== powerUpId);
}
