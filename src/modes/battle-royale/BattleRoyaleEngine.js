/**
 * Battle Royale Game Engine
 * 8-player elimination with dynamic tempo and beat-synced finale
 */
/**
 * Dynamic tempo progression from 100 BPM to 160 BPM
 */
export const BATTLE_TEMPO_PROGRESSION = [
    { startTime: 0, endTime: 30, bpm: 100, intensity: 0.2 }, // Opening phase
    { startTime: 30, endTime: 60, bpm: 110, intensity: 0.3 }, // Early game
    { startTime: 60, endTime: 90, bpm: 120, intensity: 0.4 }, // Mid game
    { startTime: 90, endTime: 120, bpm: 135, intensity: 0.6 }, // Late game
    { startTime: 120, endTime: 150, bpm: 150, intensity: 0.8 }, // Pre-finale
    { startTime: 150, endTime: 180, bpm: 160, intensity: 1.0 }, // Final duel
];
/**
 * Get current tempo configuration based on elapsed time
 */
export function getCurrentTempo(elapsedTime) {
    for (const phase of BATTLE_TEMPO_PROGRESSION) {
        if (elapsedTime >= phase.startTime && elapsedTime < phase.endTime) {
            return phase;
        }
    }
    return BATTLE_TEMPO_PROGRESSION[BATTLE_TEMPO_PROGRESSION.length - 1]; // Non-null assertion
}
/**
 * Calculate dynamic beat progress for visual effects
 */
export function calculateVisualIntensity(elapsedTime, beatProgress) {
    const tempo = getCurrentTempo(elapsedTime);
    // Combine tempo intensity with beat pulse
    const baseIntensity = tempo.intensity;
    const beatPulse = Math.sin(beatProgress * Math.PI) * 0.3;
    return Math.min(1.0, baseIntensity + beatPulse);
}
/**
 * Initialize Battle Royale game state
 */
export function createInitialBattleRoyaleState(canvasWidth, canvasHeight) {
    try {
        // Input validation
        if (typeof canvasWidth !== 'number' || typeof canvasHeight !== 'number' ||
            canvasWidth <= 0 || canvasHeight <= 0) {
            throw new Error(`[BattleRoyaleEngine] Invalid canvas dimensions: ${canvasWidth}x${canvasHeight}`);
        }
        const players = [];
        const balls = [];
        // Create 8 players positioned around the arena
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
        // Validate positions are within canvas bounds
        positions.forEach((pos, index) => {
            if (pos.x < 0 || pos.x > canvasWidth || pos.y < 0 || pos.y > canvasHeight) {
                throw new Error(`[BattleRoyaleEngine] Invalid player ${index} position: ${pos.x},${pos.y} for canvas ${canvasWidth}x${canvasHeight}`);
            }
        });
        // Create players with AI-controlled paddles
        positions.forEach((pos, index) => {
            try {
                players.push({
                    id: index,
                    color: getPlayerColor(index),
                    score: 0,
                    alive: true,
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
                            accuracy: Math.max(0.1, Math.min(1.0, 0.7 + Math.random() * 0.25)),
                            aggressiveness: Math.max(0.1, Math.min(1.0, 0.5 + Math.random() * 0.4)),
                        },
                    },
                });
            }
            catch (error) {
                console.error(`[BattleRoyaleEngine] Failed to create player ${index}:`, error);
                throw new Error(`[BattleRoyaleEngine] Player creation failed at index ${index}: ${error}`);
            }
        });
        // Validate players array
        if (players.length === 0) {
            throw new Error('[BattleRoyaleEngine] No players were created');
        }
        // Start with 2 balls
        const ballCount = 2;
        for (let i = 0; i < ballCount; i++) {
            try {
                const ball = createBall(canvasWidth, canvasHeight, i);
                if (ball) {
                    balls.push(ball);
                }
            }
            catch (error) {
                console.error(`[BattleRoyaleEngine] Failed to create ball ${i}:`, error);
                // Continue with other balls
            }
        }
        // Validate balls array
        if (balls.length === 0) {
            throw new Error('[BattleRoyaleEngine] No balls were created');
        }
        const initialState = {
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
        console.log('[BattleRoyaleEngine] Initial state created successfully', {
            playerCount: players.length,
            ballCount: balls.length,
            canvasSize: { width: canvasWidth, height: canvasHeight }
        });
        return initialState;
    }
    catch (error) {
        console.error('[BattleRoyaleEngine] Failed to create initial battle royale state:', error);
        throw new Error(`[BattleRoyaleEngine] State initialization failed: ${error}`);
    }
}
/**
 * Get player color based on index
 */
function getPlayerColor(index) {
    const colors = [
        '#FF6B6B', // Red
        '#4ECDC4', // Green
        '#45B7D1', // Blue
        '#96CEB4', // Teal
        '#FECA57', // Yellow
        '#DDA0DD', // Plum
        '#98D8C8', // Mint
        '#F7DC6F', // Yellow-green
    ];
    return colors[index % colors.length]; // Non-null assertion
}
/**
 * Get player paddle side based on index
 */
function getPlayerSide(index) {
    if (typeof index !== 'number' || index < 0) {
        return 'left'; // Default fallback
    }
    const sides = [
        'left', 'right', 'top', 'bottom', 'left', 'right', 'top', 'bottom'
    ];
    return sides[index % sides.length]; // Non-null assertion
}
/**
 * Create a new ball with position and velocity
 */
function createBall(canvasWidth, canvasHeight, index) {
    try {
        // Input validation
        if (typeof canvasWidth !== 'number' || typeof canvasHeight !== 'number' ||
            typeof index !== 'number' || canvasWidth <= 0 || canvasHeight <= 0) {
            throw new Error(`[BattleRoyaleEngine] Invalid createBall parameters: width=${canvasWidth}, height=${canvasHeight}, index=${index}`);
        }
        const angle = (index * Math.PI) / 2 + Math.random() * 0.5;
        const speed = Math.max(1, Math.min(10, 4 + Math.random() * 2)); // Clamp speed between 1-10
        // Calculate position within canvas bounds
        const x = Math.max(50, Math.min(canvasWidth - 50, canvasWidth / 2 + Math.random() * 100 - 50));
        const y = Math.max(50, Math.min(canvasHeight - 50, canvasHeight / 2 + Math.random() * 100 - 50));
        const ball = {
            id: index,
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 8,
            speed: speed,
            trail: [], // Motion trail for visual effects
        };
        // Validate the created ball
        if (!ball.x || !ball.y || !isFinite(ball.vx) || !isFinite(ball.vy)) {
            throw new Error(`[BattleRoyaleEngine] Invalid ball values created: ${JSON.stringify(ball)}`);
        }
        return ball;
    }
    catch (error) {
        console.error(`[BattleRoyaleEngine] Failed to create ball ${index}:`, error);
        // Return a safe default ball
        return {
            id: index,
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            vx: 3,
            vy: 3,
            radius: 8,
            speed: 3,
            trail: [],
        };
    }
}
/**
 * Update Battle Royale game state
 */
export function updateBattleRoyaleState(state, deltaTime, beatProgress) {
    const newState = { ...state };
    // Update elapsed time
    newState.elapsedTime += deltaTime / 60; // Convert to seconds
    newState.currentTime = newState.elapsedTime;
    // Update tempo and intensity
    const currentTempo = getCurrentTempo(newState.elapsedTime);
    newState.tempoPhase = currentTempo || BATTLE_TEMPO_PROGRESSION[0]; // Fallback to first tempo
    newState.visualIntensity = calculateVisualIntensity(newState.elapsedTime, beatProgress);
    // Update game phase based on player count
    const alivePlayers = newState.players.filter(p => p.alive).length;
    newState.playerCount = alivePlayers;
    if (alivePlayers <= 2 && newState.gamePhase !== 'finale') {
        newState.gamePhase = 'finale';
        newState.finalePhase = 'duel';
    }
    else if (alivePlayers <= 4 && newState.gamePhase === 'opening') {
        newState.gamePhase = 'midgame';
    }
    // Update balls
    newState.balls = updateBalls(newState.balls, newState.canvas, deltaTime);
    // Update AI players
    newState.players = updateAIPlayers(newState.players, newState.balls, deltaTime);
    // Check collisions and eliminations
    const collisionResults = checkCollisions(newState.players, newState.balls);
    newState.eliminations = [...newState.eliminations, ...collisionResults.eliminations];
    newState.players = collisionResults.players;
    newState.balls = collisionResults.balls;
    // Check for winner
    const finalPlayers = newState.players.filter(p => p.alive);
    if (finalPlayers.length === 1 && !newState.winner && finalPlayers[0]) {
        newState.winner = finalPlayers[0];
        newState.finalePhase = 'victory';
    }
    return newState;
}
/**
 * Update ball positions and handle wall bouncing
 */
function updateBalls(balls, canvas, deltaTime) {
    try {
        // Input validation
        if (!Array.isArray(balls)) {
            console.warn('[BattleRoyaleEngine] Invalid balls array in updateBalls');
            return [];
        }
        if (!canvas || typeof canvas.width !== 'number' || typeof canvas.height !== 'number' ||
            canvas.width <= 0 || canvas.height <= 0) {
            console.error('[BattleRoyaleEngine] Invalid canvas in updateBalls:', canvas);
            return balls;
        }
        if (typeof deltaTime !== 'number' || deltaTime < 0 || deltaTime > 10) {
            console.warn('[BattleRoyaleEngine] Invalid deltaTime:', deltaTime);
            return balls;
        }
        return balls.map((ball, index) => {
            try {
                // Validate ball structure
                if (!ball || typeof ball.x !== 'number' || typeof ball.y !== 'number' ||
                    typeof ball.vx !== 'number' || typeof ball.vy !== 'number' ||
                    typeof ball.radius !== 'number' || ball.radius <= 0) {
                    console.warn(`[BattleRoyaleEngine] Invalid ball at index ${index}:`, ball);
                    return ball; // Return original ball if invalid
                }
                const newBall = { ...ball };
                // Update position with bounds checking
                newBall.x += ball.vx * deltaTime;
                newBall.y += ball.vy * deltaTime;
                // Prevent infinite velocity
                if (!isFinite(newBall.x) || !isFinite(newBall.y)) {
                    console.warn(`[BattleRoyaleEngine] Non-finite position for ball ${index}, resetting`);
                    return ball;
                }
                // Wall collisions with proper bounds checking
                const minX = ball.radius;
                const maxX = canvas.width - ball.radius;
                const minY = ball.radius;
                const maxY = canvas.height - ball.radius;
                if (newBall.x - ball.radius <= 0 || newBall.x + ball.radius >= canvas.width) {
                    newBall.vx = -newBall.vx;
                    newBall.x = Math.max(minX, Math.min(maxX, newBall.x));
                }
                if (newBall.y - ball.radius <= 0 || newBall.y + ball.radius >= canvas.height) {
                    newBall.vy = -newBall.vy;
                    newBall.y = Math.max(minY, Math.min(maxY, newBall.y));
                }
                // Update trail for visual effects with array bounds checking
                const trailSlice = Array.isArray(ball.trail) ? ball.trail.slice(0, 8) : [];
                newBall.trail = [
                    { x: ball.x, y: ball.y, opacity: 1 },
                    ...trailSlice.map(t => ({
                        x: t?.x || ball.x,
                        y: t?.y || ball.y,
                        opacity: Math.max(0, Math.min(1, (t?.opacity || 0.5) * 0.8))
                    }))
                ];
                return newBall;
            }
            catch (error) {
                console.error(`[BattleRoyaleEngine] Failed to update ball ${index}:`, error);
                return ball; // Return original ball on error
            }
        });
    }
    catch (error) {
        console.error('[BattleRoyaleEngine] Critical error in updateBalls:', error);
        return balls; // Return original array on critical error
    }
}
/**
 * Update AI-controlled players
 */
function updateAIPlayers(players, balls, deltaTime) {
    try {
        // Input validation
        if (!Array.isArray(players)) {
            console.warn('[BattleRoyaleEngine] Invalid players array in updateAIPlayers');
            return [];
        }
        if (!Array.isArray(balls)) {
            console.warn('[BattleRoyaleEngine] Invalid balls array in updateAIPlayers');
            return players;
        }
        if (typeof deltaTime !== 'number' || deltaTime < 0 || deltaTime > 10) {
            console.warn('[BattleRoyaleEngine] Invalid deltaTime in updateAIPlayers:', deltaTime);
            return players;
        }
        return players.map((player, index) => {
            try {
                // Validate player structure
                if (!player || !player.paddle) {
                    console.warn(`[BattleRoyaleEngine] Invalid player at index ${index}`);
                    return player;
                }
                if (!player.alive)
                    return player;
                // Find nearest ball
                const nearestBall = findNearestBall(player.paddle, balls);
                if (!nearestBall)
                    return player;
                // Validate paddle properties
                if (typeof player.paddle.y !== 'number' || typeof player.paddle.speed !== 'number') {
                    console.warn(`[BattleRoyaleEngine] Invalid paddle properties for player ${index}`);
                    return player;
                }
                // AI decision making with validation
                const ai = player.paddle.ai;
                if (!ai || typeof ai.accuracy !== 'number') {
                    console.warn(`[BattleRoyaleEngine] Invalid AI configuration for player ${index}`);
                    return player;
                }
                const targetY = Math.max(0, Math.min(800, nearestBall.y)); // Bounds check target
                const currentY = player.paddle.y;
                // Add some imperfection based on AI accuracy with bounds checking
                const clampedAccuracy = Math.max(0.1, Math.min(1.0, ai.accuracy));
                const errorMargin = (1 - clampedAccuracy) * 50;
                const targetWithError = Math.max(0, Math.min(800, targetY + (Math.random() - 0.5) * errorMargin));
                // Move paddle toward target with validation
                let newY = currentY;
                const moveSpeed = Math.max(0, Math.min(20, player.paddle.speed * deltaTime)); // Clamp speed
                if (Math.abs(targetWithError - currentY) > 5) {
                    if (targetWithError > currentY) {
                        newY = Math.min(currentY + moveSpeed, targetWithError);
                    }
                    else {
                        newY = Math.max(currentY - moveSpeed, targetWithError);
                    }
                }
                // Ensure new position is within bounds
                newY = Math.max(0, Math.min(800, newY));
                return {
                    ...player,
                    paddle: {
                        ...player.paddle,
                        y: newY,
                    },
                };
            }
            catch (error) {
                console.error(`[BattleRoyaleEngine] Failed to update AI player ${index}:`, error);
                return player; // Return original player on error
            }
        });
    }
    catch (error) {
        console.error('[BattleRoyaleEngine] Critical error in updateAIPlayers:', error);
        return players; // Return original array on critical error
    }
}
/**
 * Find nearest ball to a paddle
 */
function findNearestBall(paddle, balls) {
    try {
        // Input validation
        if (!paddle || typeof paddle.x !== 'number' || typeof paddle.y !== 'number') {
            console.warn('[BattleRoyaleEngine] Invalid paddle in findNearestBall:', paddle);
            return null;
        }
        if (!Array.isArray(balls) || balls.length === 0) {
            return null;
        }
        // Find first valid ball as starting point
        let nearest = null;
        let minDistance = Infinity;
        for (let i = 0; i < balls.length; i++) {
            const ball = balls[i];
            // Validate ball structure
            if (!ball || typeof ball.x !== 'number' || typeof ball.y !== 'number') {
                console.warn(`[BattleRoyaleEngine] Invalid ball at index ${i} in findNearestBall`);
                continue;
            }
            const distance = Math.hypot(ball.x - paddle.x, ball.y - paddle.y);
            // Validate distance
            if (!isFinite(distance) || distance < 0) {
                console.warn(`[BattleRoyaleEngine] Invalid distance calculation for ball ${i}: ${distance}`);
                continue;
            }
            if (distance < minDistance) {
                minDistance = distance;
                nearest = ball;
            }
        }
        return nearest;
    }
    catch (error) {
        console.error('[BattleRoyaleEngine] Error in findNearestBall:', error);
        return null;
    }
}
/**
 * Check collisions and handle eliminations
 */
function checkCollisions(players, balls) {
    try {
        // Input validation
        if (!Array.isArray(players)) {
            console.warn('[BattleRoyaleEngine] Invalid players array in checkCollisions');
            return { players: [], balls: [], eliminations: [] };
        }
        if (!Array.isArray(balls)) {
            console.warn('[BattleRoyaleEngine] Invalid balls array in checkCollisions');
            return { players, balls, eliminations: [] };
        }
        const eliminations = [];
        const updatedPlayers = [...players];
        // Bounds checking for arrays
        if (players.length === 0 || balls.length === 0) {
            return { players, balls, eliminations: [] };
        }
        balls.forEach((ball, ballIndex) => {
            try {
                // Validate ball
                if (!ball || typeof ball.x !== 'number' || typeof ball.y !== 'number') {
                    console.warn(`[BattleRoyaleEngine] Invalid ball at index ${ballIndex}`);
                    return;
                }
                players.forEach((player, playerIndex) => {
                    try {
                        // Validate player bounds
                        if (playerIndex < 0 || playerIndex >= players.length) {
                            console.warn(`[BattleRoyaleEngine] Player index out of bounds: ${playerIndex}`);
                            return;
                        }
                        // Validate player structure
                        if (!player || !player.paddle) {
                            console.warn(`[BattleRoyaleEngine] Invalid player at index ${playerIndex}`);
                            return;
                        }
                        if (!player.alive)
                            return;
                        const paddle = player.paddle;
                        // Check paddle-ball collision
                        if (checkPaddleBallCollision(ball, paddle)) {
                            // Bounce ball with bounds checking
                            if (ballIndex >= 0 && ballIndex < balls.length) {
                                balls[ballIndex] = bounceBallOffPaddle(ball, paddle);
                            }
                            // Increment player score with bounds checking
                            if (playerIndex >= 0 && playerIndex < updatedPlayers.length) {
                                updatedPlayers[playerIndex] = {
                                    ...player,
                                    score: Math.max(0, player.score + 10), // Ensure score doesn't go negative
                                };
                            }
                        }
                    }
                    catch (error) {
                        console.error(`[BattleRoyaleEngine] Error processing player ${playerIndex}:`, error);
                    }
                });
            }
            catch (error) {
                console.error(`[BattleRoyaleEngine] Error processing ball ${ballIndex}:`, error);
            }
        });
        // Check for eliminations (ball going off player's side)
        const updatedBalls = balls.filter(ball => {
            if (!ball)
                return true; // Remove invalid balls
            let shouldRemoveBall = false;
            updatedPlayers.forEach((player, index) => {
                try {
                    // Validate player bounds
                    if (index < 0 || index >= updatedPlayers.length) {
                        return;
                    }
                    if (!player.alive || !player.paddle)
                        return;
                    const paddle = player.paddle;
                    let isEliminated = false;
                    // Validate ball properties
                    if (typeof ball.x !== 'number' || typeof ball.y !== 'number' || typeof ball.radius !== 'number') {
                        console.warn('[BattleRoyaleEngine] Invalid ball properties in elimination check');
                        shouldRemoveBall = true;
                        return;
                    }
                    // Check if ball went off player's defending side with bounds checking
                    switch (paddle.side) {
                        case 'left':
                            isEliminated = ball.x + ball.radius < 0;
                            break;
                        case 'right':
                            isEliminated = ball.x - ball.radius > (paddle.x || 0) + (paddle.width || 0);
                            break;
                        case 'top':
                            isEliminated = ball.y - ball.radius > (paddle.y || 0) + (paddle.height || 0);
                            break;
                        case 'bottom':
                            isEliminated = ball.y + ball.radius < 0;
                            break;
                        default:
                            console.warn(`[BattleRoyaleEngine] Unknown paddle side: ${paddle.side}`);
                            return;
                    }
                    if (isEliminated && player.score < 50) { // Eliminate if score too low
                        if (index >= 0 && index < updatedPlayers.length) {
                            updatedPlayers[index] = { ...player, alive: false };
                            eliminations.push({
                                playerId: player.id,
                                playerColor: player.color,
                                timestamp: Date.now(),
                                eliminationType: 'ball_miss',
                                finalScore: player.score,
                            });
                        }
                    }
                }
                catch (error) {
                    console.error(`[BattleRoyaleEngine] Error in elimination check for player ${index}:`, error);
                }
            });
            return !shouldRemoveBall;
        });
        return {
            players: updatedPlayers,
            balls: updatedBalls,
            eliminations,
        };
    }
    catch (error) {
        console.error('[BattleRoyaleEngine] Critical error in checkCollisions:', error);
        return { players, balls: [], eliminations: [] };
    }
}
/**
 * Check collision between ball and paddle
 */
function checkPaddleBallCollision(ball, paddle) {
    try {
        // Input validation
        if (!ball || !paddle) {
            console.warn('[BattleRoyaleEngine] Invalid inputs to checkPaddleBallCollision');
            return false;
        }
        // Validate ball properties
        if (typeof ball.x !== 'number' || typeof ball.y !== 'number' ||
            typeof ball.radius !== 'number' || ball.radius <= 0) {
            console.warn('[BattleRoyaleEngine] Invalid ball properties in checkPaddleBallCollision:', ball);
            return false;
        }
        // Validate paddle properties
        if (typeof paddle.x !== 'number' || typeof paddle.y !== 'number' ||
            typeof paddle.width !== 'number' || typeof paddle.height !== 'number' ||
            paddle.width <= 0 || paddle.height <= 0) {
            console.warn('[BattleRoyaleEngine] Invalid paddle properties in checkPaddleBallCollision:', paddle);
            return false;
        }
        const ballLeft = ball.x - ball.radius;
        const ballRight = ball.x + ball.radius;
        const ballTop = ball.y - ball.radius;
        const ballBottom = ball.y + ball.radius;
        const paddleLeft = paddle.x;
        const paddleRight = paddle.x + paddle.width;
        const paddleTop = paddle.y;
        const paddleBottom = paddle.y + paddle.height;
        return (ballRight >= paddleLeft &&
            ballLeft <= paddleRight &&
            ballBottom >= paddleTop &&
            ballTop <= paddleBottom);
    }
    catch (error) {
        console.error('[BattleRoyaleEngine] Error in checkPaddleBallCollision:', error);
        return false;
    }
}
/**
 * Bounce ball off paddle with angle based on hit position
 */
function bounceBallOffPaddle(ball, paddle) {
    try {
        // Input validation
        if (!ball || !paddle) {
            console.warn('[BattleRoyaleEngine] Invalid inputs to bounceBallOffPaddle');
            return ball || { x: 0, y: 0, vx: 0, vy: 0, radius: 8, speed: 5, trail: [], id: 0 };
        }
        // Validate ball properties
        if (typeof ball.x !== 'number' || typeof ball.y !== 'number' ||
            typeof ball.vx !== 'number' || typeof ball.vy !== 'number' ||
            typeof ball.radius !== 'number' || ball.radius <= 0) {
            console.warn('[BattleRoyaleEngine] Invalid ball properties in bounceBallOffPaddle:', ball);
            return ball;
        }
        // Validate paddle properties
        if (typeof paddle.x !== 'number' || typeof paddle.y !== 'number' ||
            typeof paddle.width !== 'number' || typeof paddle.height !== 'number' ||
            paddle.width <= 0 || paddle.height <= 0) {
            console.warn('[BattleRoyaleEngine] Invalid paddle properties in bounceBallOffPaddle:', paddle);
            return ball;
        }
        // Calculate hit position with bounds checking
        const paddleCenterY = paddle.y + paddle.height / 2;
        const hitPosition = Math.max(-1, Math.min(1, (ball.y - paddleCenterY) / (paddle.height / 2)));
        const bounceAngle = hitPosition * Math.PI / 3; // Max 60 degree angle
        const speed = Math.max(1, Math.min(20, Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)));
        const newVx = Math.cos(bounceAngle) * speed * 1.05; // Slight speed increase
        const newVy = Math.sin(bounceAngle) * speed * 1.05;
        // Validate new velocity
        if (!isFinite(newVx) || !isFinite(newVy)) {
            console.warn('[BattleRoyaleEngine] Invalid calculated velocity in bounceBallOffPaddle');
            return ball;
        }
        return {
            ...ball,
            vx: newVx,
            vy: newVy,
            trail: Array.isArray(ball.trail) ? ball.trail : [], // Preserve trail with validation
        };
    }
    catch (error) {
        console.error('[BattleRoyaleEngine] Error in bounceBallOffPaddle:', error);
        return ball || { x: 0, y: 0, vx: 0, vy: 0, radius: 8, speed: 5, trail: [], id: 0 };
    }
}
/**
 * Get current BPM for audio synchronization
 */
export function getCurrentBPM(elapsedTime) {
    return getCurrentTempo(elapsedTime).bpm;
}
/**
 * Check if finale phase is active
 */
export function isInFinalePhase(state) {
    return state.gamePhase === 'finale' && state.finalePhase !== 'none';
}
/**
 * Get finale intensity for visual effects (0.8 - 1.0)
 */
export function getFinaleIntensity(state) {
    if (!isInFinalePhase(state))
        return 0.3;
    return 0.8 + (state.visualIntensity * 0.2);
}
