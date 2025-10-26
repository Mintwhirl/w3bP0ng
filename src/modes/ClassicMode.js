import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * ClassicMode Component
 * Traditional Pong with AI, power-ups, and dynamic physics
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { GameRenderer } from '../rendering/GameRenderer';
import { AudioManager } from '../audio/AudioManager';
import { useTheme } from '../hooks/useTheme';
import { computeAIMove, } from '../ai/AIController';
import { resetBall, updateBallPosition, checkWallCollision, bounceOffWall, checkBallOutOfBounds, updatePaddlePosition, calculatePaddleVelocity, calculatePaddleBounce, applySpeedLimits, } from '../engine/PhysicsEngine';
import { checkBallPaddleCollision as checkCollision, } from '../engine/CollisionDetector';
import { spawnPowerUp, updatePowerUpAnimation, generateSpawnTimer, shouldSpawnPowerUp, getPowerUpOwner, getPowerUpConfig, findCollidingPowerUp, removePowerUp, } from '../powerups/PowerUpManager';
const PongGame = () => {
    console.log('PongGame component rendering...');
    const canvasRef = useRef(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(true);
    const [aiDifficulty, setAiDifficulty] = useState('medium');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboardMode, setLeaderboardMode] = useState('gameEnd');
    const [playerName, setPlayerName] = useState('');
    const [leaderboardScores, setLeaderboardScores] = useState([]);
    const animationFrameRef = useRef(null);
    // Get current theme (auto-switches based on game mode)
    const theme = useTheme();
    // Module instances
    const rendererRef = useRef(null);
    const audioManagerRef = useRef(null);
    // Performance monitoring
    const performanceMetrics = useRef({
        lastFrameTime: performance.now(),
        frameCount: 0,
    });
    const getInitialCanvasSize = () => ({
        width: Math.min(1400, window.innerWidth - 80),
        height: Math.min(700, window.innerHeight - 300),
    });
    const gameStateRef = useRef({
        ball: {
            x: 0,
            y: 0,
            dx: 4,
            dy: 3,
            radius: 8,
            trail: [],
        },
        paddles: {
            left: { x: 40, y: 0, width: 12, height: 80, speed: 4.5, prevY: 0, velocity: 0 },
            right: { x: 0, y: 0, width: 12, height: 80, speed: 4.5, prevY: 0, velocity: 0 },
        },
        canvas: getInitialCanvasSize(),
        keys: {},
        touch: {
            leftPaddle: { active: false, startY: 0, currentY: 0 },
            rightPaddle: { active: false, startY: 0, currentY: 0 },
        },
        score: { left: 0, right: 0 },
        gameWinner: null,
        ai: {
            enabled: true,
            difficulty: 'medium',
            targetY: 0,
            reactionDelay: 0,
            lastReactionTime: 0,
        },
        screenShake: {
            x: 0,
            y: 0,
            intensity: 0,
            duration: 0,
        },
        powerUps: [],
        activePowerUps: {
            bigPaddle: { active: false, timeLeft: 0, player: null },
            fastBall: { active: false, timeLeft: 0 },
            multiBall: { active: false, timeLeft: 0, extraBalls: [] },
            shield: { active: false, uses: 0, player: null },
        },
        powerUpSpawnTimer: 420, // 7 seconds initial grace period
        gameStartTime: 0,
        session: {
            rallies: 0,
            longestRally: 0,
            totalHits: 0,
            sessionsPlayed: 0,
            playTime: 0,
            lastBreakSuggestion: 0,
        },
        achievements: {
            firstWin: false,
            rally10: false,
            rally25: false,
            rally50: false,
            speedDemon: false,
            powerUpMaster: false,
            quickReflexes: false,
        },
        progressBar: {
            currentXP: 0,
            level: 1,
            xpToNext: 100,
        },
    });
    const initializeGamePositions = useCallback(() => {
        const gameState = gameStateRef.current;
        const canvasSize = gameState.canvas;
        // Center ball
        gameState.ball.x = canvasSize.width / 2;
        gameState.ball.y = canvasSize.height / 2;
        // Position paddles
        gameState.paddles.left.y = (canvasSize.height - gameState.paddles.left.height) / 2;
        gameState.paddles.right.x = canvasSize.width - 40 - gameState.paddles.right.width;
        gameState.paddles.right.y = (canvasSize.height - gameState.paddles.right.height) / 2;
        // Set AI target
        gameState.ai.targetY = canvasSize.height / 2;
        // Update prev positions
        gameState.paddles.left.prevY = gameState.paddles.left.y;
        gameState.paddles.right.prevY = gameState.paddles.right.y;
    }, []);
    // Screen shake helper
    const addScreenShake = useCallback((intensity = 5, duration = 10) => {
        const gameState = gameStateRef.current;
        gameState.screenShake.intensity = intensity;
        gameState.screenShake.duration = duration;
    }, []);
    const updateScreenShake = useCallback(() => {
        const shake = gameStateRef.current.screenShake;
        if (shake.duration > 0) {
            shake.x = (Math.random() - 0.5) * shake.intensity;
            shake.y = (Math.random() - 0.5) * shake.intensity;
            shake.duration--;
            shake.intensity *= 0.9;
        }
        else {
            shake.x = 0;
            shake.y = 0;
            shake.intensity = 0;
        }
    }, []);
    // Level up check
    const checkLevelUp = useCallback(() => {
        const gameState = gameStateRef.current;
        const progress = gameState.progressBar;
        if (progress.currentXP >= progress.xpToNext) {
            progress.level++;
            progress.currentXP -= progress.xpToNext;
            progress.xpToNext = Math.floor(progress.xpToNext * 1.5);
            addScreenShake(10, 20);
        }
    }, [addScreenShake]);
    // Power-up activation
    const activatePowerUp = useCallback((powerUp, player) => {
        const gameState = gameStateRef.current;
        const config = getPowerUpConfig(powerUp.type);
        switch (powerUp.type) {
            case 'bigPaddle':
                gameState.activePowerUps.bigPaddle = {
                    active: true,
                    timeLeft: config.duration || 480,
                    player,
                };
                break;
            case 'fastBall':
                gameState.activePowerUps.fastBall = {
                    active: true,
                    timeLeft: config.duration || 360,
                };
                break;
            case 'multiBall':
                if (!gameState.activePowerUps.multiBall.active) {
                    gameState.activePowerUps.multiBall = {
                        active: true,
                        timeLeft: config.duration || 600,
                        extraBalls: [
                            {
                                x: gameState.ball.x + 50,
                                y: gameState.ball.y,
                                dx: -gameState.ball.dx + (Math.random() - 0.5) * 2,
                                dy: gameState.ball.dy + (Math.random() - 0.5) * 2,
                                radius: 6,
                                trail: [],
                            },
                            {
                                x: gameState.ball.x - 50,
                                y: gameState.ball.y,
                                dx: -gameState.ball.dx + (Math.random() - 0.5) * 2,
                                dy: gameState.ball.dy + (Math.random() - 0.5) * 2,
                                radius: 6,
                                trail: [],
                            },
                        ],
                    };
                }
                break;
            case 'shield':
                gameState.activePowerUps.shield = {
                    active: true,
                    uses: config.uses || 1,
                    player,
                };
                break;
        }
        gameState.powerUps = removePowerUp(gameState.powerUps, powerUp.id);
        gameState.powerUpSpawnTimer = generateSpawnTimer();
        audioManagerRef.current?.playPowerUp();
        addScreenShake(8, 15);
    }, [addScreenShake]);
    // Reset ball using extracted module
    const handleResetBall = useCallback(() => {
        const gameState = gameStateRef.current;
        const newBall = resetBall(gameState.canvas.width, gameState.canvas.height, 6, 3);
        // Merge the reset ball with existing properties
        gameState.ball.x = newBall.x;
        gameState.ball.y = newBall.y;
        gameState.ball.dx = newBall.dx;
        gameState.ball.dy = newBall.dy;
        gameState.ball.trail = [];
    }, []);
    // Reset game
    const resetGame = useCallback(() => {
        const gameState = gameStateRef.current;
        gameState.score.left = 0;
        gameState.score.right = 0;
        gameState.gameWinner = null;
        gameState.powerUps = [];
        gameState.powerUpSpawnTimer = 420; // 7 second grace period
        gameState.activePowerUps = {
            bigPaddle: { active: false, timeLeft: 0, player: null },
            fastBall: { active: false, timeLeft: 0 },
            multiBall: { active: false, timeLeft: 0, extraBalls: [] },
            shield: { active: false, uses: 0, player: null },
        };
        gameState.session.sessionsPlayed++;
        gameState.session.rallies = 0;
        gameState.gameStartTime = Date.now();
        const now = Date.now();
        if (gameState.session.sessionsPlayed > 0 && gameState.session.sessionsPlayed % 8 === 0) {
            if (now - gameState.session.lastBreakSuggestion > 1200000) {
                gameState.session.lastBreakSuggestion = now;
                console.log("Consider taking a short break! 🌟");
            }
        }
        handleResetBall();
    }, [handleResetBall]);
    // Main game update logic
    const updateGame = useCallback(() => {
        const gameState = gameStateRef.current;
        const { ball, canvas, paddles, keys } = gameState;
        // Reset game with R key
        if (keys['r'] || keys['R']) {
            resetGame();
            keys['r'] = false;
            keys['R'] = false;
        }
        if (gameState.gameWinner)
            return;
        updateScreenShake();
        // Power-up spawning using extracted module
        gameState.powerUpSpawnTimer--;
        if (shouldSpawnPowerUp(gameState.powerUpSpawnTimer, gameState.powerUps.length)) {
            const newPowerUp = spawnPowerUp(canvas.width, canvas.height);
            gameState.powerUps.push(newPowerUp);
            gameState.powerUpSpawnTimer = generateSpawnTimer();
        }
        // Update power-up animations using extracted module
        gameState.powerUps = gameState.powerUps.map((powerUp) => updatePowerUpAnimation(powerUp, canvas.width, canvas.height));
        // Update active power-up timers
        Object.keys(gameState.activePowerUps).forEach((key) => {
            const powerUp = gameState.activePowerUps[key];
            if (powerUp.active && 'timeLeft' in powerUp && powerUp.timeLeft !== undefined) {
                powerUp.timeLeft--;
                if (powerUp.timeLeft <= 0) {
                    powerUp.active = false;
                    if (key === 'multiBall') {
                        powerUp.extraBalls = [];
                    }
                }
            }
        });
        // Left paddle movement
        paddles.left.prevY = paddles.left.y;
        if (keys['w'] || keys['W']) {
            paddles.left.y = updatePaddlePosition(paddles.left.y, -paddles.left.speed, paddles.left.height, canvas.height);
        }
        if (keys['s'] || keys['S']) {
            paddles.left.y = updatePaddlePosition(paddles.left.y, paddles.left.speed, paddles.left.height, canvas.height);
        }
        if (gameState.touch.leftPaddle.active) {
            const touchDelta = gameState.touch.leftPaddle.currentY - gameState.touch.leftPaddle.startY;
            const newY = paddles.left.y + touchDelta * 0.8;
            paddles.left.y = updatePaddlePosition(newY, 0, paddles.left.height, canvas.height);
            gameState.touch.leftPaddle.startY = gameState.touch.leftPaddle.currentY;
        }
        paddles.left.velocity = calculatePaddleVelocity(paddles.left.y, paddles.left.prevY);
        // Right paddle movement (AI or manual)
        paddles.right.prevY = paddles.right.y;
        if (!gameState.ai.enabled) {
            if (keys['ArrowUp']) {
                paddles.right.y = updatePaddlePosition(paddles.right.y, -paddles.right.speed, paddles.right.height, canvas.height);
            }
            if (keys['ArrowDown']) {
                paddles.right.y = updatePaddlePosition(paddles.right.y, paddles.right.speed, paddles.right.height, canvas.height);
            }
            if (gameState.touch.rightPaddle.active) {
                const touchDelta = gameState.touch.rightPaddle.currentY - gameState.touch.rightPaddle.startY;
                const newY = paddles.right.y + touchDelta * 0.8;
                paddles.right.y = updatePaddlePosition(newY, 0, paddles.right.height, canvas.height);
                gameState.touch.rightPaddle.startY = gameState.touch.rightPaddle.currentY;
            }
        }
        else {
            // Use extracted AI functions
            const aiState = {
                targetY: gameState.ai.targetY,
                lastReactionTime: gameState.ai.lastReactionTime,
            };
            const result = computeAIMove(ball, paddles.right, aiState, canvas.height, gameState.ai.difficulty, Date.now());
            paddles.right.y = result.newPaddleY;
            // Update AI state
            gameState.ai.targetY = result.newAIState.targetY;
            gameState.ai.lastReactionTime = result.newAIState.lastReactionTime;
        }
        paddles.right.velocity = calculatePaddleVelocity(paddles.right.y, paddles.right.prevY);
        // Ball movement with speed multiplier
        const speedMultiplier = gameState.activePowerUps.fastBall.active ? 1.5 : 1;
        const updatedBall = updateBallPosition(ball, speedMultiplier);
        gameState.ball.x = updatedBall.x;
        gameState.ball.y = updatedBall.y;
        // Multi-ball movement
        if (gameState.activePowerUps.multiBall.active) {
            gameState.activePowerUps.multiBall.extraBalls.forEach((extraBall) => {
                const updated = updateBallPosition(extraBall, speedMultiplier);
                extraBall.x = updated.x;
                extraBall.y = updated.y;
                // Update trail
                extraBall.trail.push({ x: extraBall.x, y: extraBall.y, size: Math.random() * 2 + 1, life: 15 });
                extraBall.trail = extraBall.trail.filter((p) => {
                    p.life--;
                    p.size *= 0.95;
                    return p.life > 0;
                });
            });
        }
        // Check for power-up collision using extracted module
        const collidedPowerUp = findCollidingPowerUp(ball, gameState.powerUps);
        if (collidedPowerUp) {
            const player = getPowerUpOwner(ball);
            activatePowerUp(collidedPowerUp, player);
        }
        // Update ball trail
        ball.trail.push({ x: ball.x, y: ball.y, size: Math.random() * 3 + 2, life: 20 });
        ball.trail = ball.trail.filter((p) => {
            p.life--;
            p.size *= 0.95;
            return p.life > 0;
        });
        // Wall collision using extracted module
        if (checkWallCollision(ball, canvas.height)) {
            const bouncedBall = bounceOffWall(ball);
            gameState.ball.dy = bouncedBall.dy;
            audioManagerRef.current?.playWallBounce();
            addScreenShake(3, 6);
        }
        // Paddle collision using extracted module
        const leftPaddleMultiplier = gameState.activePowerUps.bigPaddle.active && gameState.activePowerUps.bigPaddle.player === 'left' ? 2 : 1;
        const rightPaddleMultiplier = gameState.activePowerUps.bigPaddle.active && gameState.activePowerUps.bigPaddle.player === 'right' ? 2 : 1;
        if (ball.dx < 0 && checkCollision(ball, paddles.left, leftPaddleMultiplier)) {
            const bouncedBall = calculatePaddleBounce(ball, paddles.left.y, paddles.left.height, paddles.left.velocity);
            // Update ball velocities
            gameState.ball.dx = bouncedBall.dx;
            gameState.ball.dy = bouncedBall.dy;
            // Apply speed limits
            const limited = applySpeedLimits(gameState.ball);
            gameState.ball.dx = limited.dx;
            gameState.ball.dy = limited.dy;
            gameState.ball.x = paddles.left.x + paddles.left.width + ball.radius;
            // Rally tracking
            gameState.session.rallies++;
            gameState.session.totalHits++;
            gameState.session.longestRally = Math.max(gameState.session.longestRally, gameState.session.rallies);
            gameState.progressBar.currentXP += 5;
            // Achievement checks
            if (gameState.session.rallies === 10 && !gameState.achievements.rally10) {
                gameState.achievements.rally10 = true;
                gameState.progressBar.currentXP += 50;
            }
            const ballSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            audioManagerRef.current?.playPaddleHit(ballSpeed);
            addScreenShake(8, 15);
        }
        if (ball.dx > 0 && checkCollision(ball, paddles.right, rightPaddleMultiplier)) {
            const bouncedBall = calculatePaddleBounce(ball, paddles.right.y, paddles.right.height, paddles.right.velocity);
            // Update ball velocities
            gameState.ball.dx = bouncedBall.dx;
            gameState.ball.dy = bouncedBall.dy;
            // Apply speed limits
            const limited = applySpeedLimits(gameState.ball);
            gameState.ball.dx = limited.dx;
            gameState.ball.dy = limited.dy;
            gameState.ball.x = paddles.right.x - ball.radius;
            // Rally tracking
            gameState.session.rallies++;
            gameState.session.totalHits++;
            gameState.session.longestRally = Math.max(gameState.session.longestRally, gameState.session.rallies);
            gameState.progressBar.currentXP += 5;
            // Achievement checks
            if (gameState.session.rallies === 10 && !gameState.achievements.rally10) {
                gameState.achievements.rally10 = true;
                gameState.progressBar.currentXP += 50;
            }
            const ballSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            audioManagerRef.current?.playPaddleHit(ballSpeed);
            addScreenShake(8, 15);
        }
        // Multi-ball collisions
        if (gameState.activePowerUps.multiBall.active) {
            gameState.activePowerUps.multiBall.extraBalls.forEach((extraBall) => {
                if (checkWallCollision(extraBall, canvas.height)) {
                    extraBall.dy = -extraBall.dy;
                    audioManagerRef.current?.playWallBounce();
                }
                if (extraBall.dx < 0 && checkCollision(extraBall, paddles.left, leftPaddleMultiplier)) {
                    const bouncedBall = calculatePaddleBounce(extraBall, paddles.left.y, paddles.left.height, paddles.left.velocity);
                    extraBall.dx = Math.abs(bouncedBall.dx);
                    extraBall.dy = bouncedBall.dy;
                    extraBall.x = paddles.left.x + paddles.left.width + extraBall.radius;
                    audioManagerRef.current?.playPaddleHit();
                }
                if (extraBall.dx > 0 && checkCollision(extraBall, paddles.right, rightPaddleMultiplier)) {
                    const bouncedBall = calculatePaddleBounce(extraBall, paddles.right.y, paddles.right.height, paddles.right.velocity);
                    extraBall.dx = -Math.abs(bouncedBall.dx);
                    extraBall.dy = bouncedBall.dy;
                    extraBall.x = paddles.right.x - extraBall.radius;
                    audioManagerRef.current?.playPaddleHit();
                }
            });
        }
        // Check out of bounds using extracted module
        const outOfBounds = checkBallOutOfBounds(ball, canvas.width);
        if (outOfBounds === 'left') {
            gameState.score.right++;
            audioManagerRef.current?.playScore();
            if (gameState.session.rallies >= 5) {
                gameState.progressBar.currentXP += gameState.session.rallies * 2;
            }
            gameState.session.rallies = 0;
            handleResetBall();
        }
        else if (outOfBounds === 'right') {
            gameState.score.left++;
            audioManagerRef.current?.playScore();
            if (gameState.session.rallies >= 5) {
                gameState.progressBar.currentXP += gameState.session.rallies * 2;
            }
            gameState.session.rallies = 0;
            handleResetBall();
        }
        // Check for winner
        if (gameState.score.left >= 11) {
            gameState.gameWinner = 'left';
            audioManagerRef.current?.playVictory();
            if (!gameState.achievements.firstWin) {
                gameState.achievements.firstWin = true;
                gameState.progressBar.currentXP += 200;
            }
            const gameTime = Date.now() - gameState.gameStartTime;
            if (gameTime < 120000 && !gameState.achievements.quickReflexes) {
                gameState.achievements.quickReflexes = true;
                gameState.progressBar.currentXP += 150;
            }
            gameState.progressBar.currentXP += 100;
            if (gameState.score.left > gameState.score.right) {
                setLeaderboardMode('gameEnd');
                setShowLeaderboard(true);
            }
        }
        else if (gameState.score.right >= 11) {
            gameState.gameWinner = 'right';
            audioManagerRef.current?.playVictory();
            if (!gameState.ai.enabled && gameState.score.right > gameState.score.left) {
                setLeaderboardMode('gameEnd');
                setShowLeaderboard(true);
            }
        }
        checkLevelUp();
    }, [
        resetGame,
        updateScreenShake,
        activatePowerUp,
        handleResetBall,
        addScreenShake,
        checkLevelUp,
    ]);
    // Leaderboard functions
    const loadLeaderboard = useCallback(() => {
        try {
            const saved = localStorage.getItem('pong-leaderboard');
            return saved ? JSON.parse(saved) : [];
        }
        catch (error) {
            console.warn('Failed to load leaderboard:', error);
            return [];
        }
    }, []);
    const saveLeaderboard = useCallback((scores) => {
        try {
            localStorage.setItem('pong-leaderboard', JSON.stringify(scores));
            setLeaderboardScores(scores);
        }
        catch (error) {
            console.warn('Failed to save leaderboard:', error);
        }
    }, []);
    const addScore = useCallback((name, playerScore, aiScore, difficulty) => {
        const newScore = {
            id: Date.now(),
            name: name || 'Anonymous',
            playerScore,
            aiScore,
            difficulty: aiEnabled ? difficulty : 'vs Human',
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
        };
        const currentScores = loadLeaderboard();
        const updatedScores = [...currentScores, newScore]
            .sort((a, b) => b.playerScore - a.playerScore)
            .slice(0, 10);
        saveLeaderboard(updatedScores);
        return updatedScores;
    }, [loadLeaderboard, saveLeaderboard, aiEnabled]);
    // Load leaderboard on mount
    useEffect(() => {
        const scores = loadLeaderboard();
        setLeaderboardScores(scores);
    }, [loadLeaderboard]);
    // Initialize canvas and modules
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        // Set canvas dimensions
        canvas.width = gameStateRef.current.canvas.width;
        canvas.height = gameStateRef.current.canvas.height;
        // Initialize game positions
        initializeGamePositions();
        // Initialize modules
        try {
            rendererRef.current = new GameRenderer(canvas);
            audioManagerRef.current = new AudioManager();
            audioManagerRef.current.initialize();
            console.log('Modules initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize modules:', error);
        }
        // Draw initial state
        if (rendererRef.current) {
            const gameState = gameStateRef.current;
            const renderState = {
                ball: {
                    x: gameState.ball.x,
                    y: gameState.ball.y,
                    radius: gameState.ball.radius,
                    trail: [],
                },
                paddles: {
                    left: {
                        x: gameState.paddles.left.x,
                        y: gameState.paddles.left.y,
                        width: gameState.paddles.left.width,
                        height: gameState.paddles.left.height,
                    },
                    right: {
                        x: gameState.paddles.right.x,
                        y: gameState.paddles.right.y,
                        width: gameState.paddles.right.width,
                        height: gameState.paddles.right.height,
                    },
                },
                score: gameState.score,
                gameWinner: null,
                screenShake: { x: 0, y: 0 },
                powerUps: [],
                activePowerUps: {
                    bigPaddle: { active: false, player: null },
                    multiBall: { active: false, extraBalls: [] },
                },
            };
            rendererRef.current.render(renderState);
        }
        // Keyboard event handlers
        const handleKeyDown = (e) => {
            gameStateRef.current.keys[e.key] = true;
        };
        const handleKeyUp = (e) => {
            gameStateRef.current.keys[e.key] = false;
        };
        // Touch event handlers
        const handleTouchStart = (e) => {
            e.preventDefault();
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const rect = canvas.getBoundingClientRect();
            Array.from(e.touches).forEach((touch) => {
                const touchX = touch.clientX - rect.left;
                const touchY = touch.clientY - rect.top;
                if (touchX < canvas.width / 2) {
                    gameStateRef.current.touch.leftPaddle = {
                        active: true,
                        startY: touchY,
                        currentY: touchY,
                    };
                }
                else {
                    gameStateRef.current.touch.rightPaddle = {
                        active: true,
                        startY: touchY,
                        currentY: touchY,
                    };
                }
            });
        };
        const handleTouchMove = (e) => {
            e.preventDefault();
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const rect = canvas.getBoundingClientRect();
            Array.from(e.touches).forEach((touch) => {
                const touchX = touch.clientX - rect.left;
                const touchY = touch.clientY - rect.top;
                if (touchX < canvas.width / 2 && gameStateRef.current.touch.leftPaddle.active) {
                    gameStateRef.current.touch.leftPaddle.currentY = touchY;
                }
                else if (touchX >= canvas.width / 2 && gameStateRef.current.touch.rightPaddle.active) {
                    gameStateRef.current.touch.rightPaddle.currentY = touchY;
                }
            });
        };
        const handleTouchEnd = (e) => {
            e.preventDefault();
            gameStateRef.current.touch.leftPaddle.active = false;
            gameStateRef.current.touch.rightPaddle.active = false;
        };
        // Add event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
        // Handle window resize
        const handleResize = () => {
            const newCanvasSize = getInitialCanvasSize();
            const gameState = gameStateRef.current;
            gameState.canvas.width = newCanvasSize.width;
            gameState.canvas.height = newCanvasSize.height;
            canvas.width = newCanvasSize.width;
            canvas.height = newCanvasSize.height;
            initializeGamePositions();
            // Redraw
            if (rendererRef.current) {
                rendererRef.current.clear();
            }
        };
        window.addEventListener('resize', handleResize);
        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, [initializeGamePositions]);
    // Render function - extracted so it can be called separately
    const renderGame = useCallback(() => {
        if (!rendererRef.current)
            return;
        const gameState = gameStateRef.current;
        // Convert power-ups to render format
        const renderPowerUps = gameState.powerUps.map((p) => ({
            x: p.x,
            y: p.y,
            type: p.type,
            rotation: p.rotation,
            color: p.color,
            symbol: p.symbol,
        }));
        const renderState = {
            ball: {
                x: gameState.ball.x,
                y: gameState.ball.y,
                radius: gameState.ball.radius,
                trail: gameState.ball.trail,
            },
            paddles: {
                left: {
                    x: gameState.paddles.left.x,
                    y: gameState.paddles.left.y,
                    width: gameState.paddles.left.width,
                    height: gameState.paddles.left.height,
                },
                right: {
                    x: gameState.paddles.right.x,
                    y: gameState.paddles.right.y,
                    width: gameState.paddles.right.width,
                    height: gameState.paddles.right.height,
                },
            },
            score: gameState.score,
            gameWinner: gameState.gameWinner,
            screenShake: gameState.screenShake,
            powerUps: renderPowerUps,
            activePowerUps: {
                bigPaddle: gameState.activePowerUps.bigPaddle,
                multiBall: {
                    active: gameState.activePowerUps.multiBall.active,
                    extraBalls: gameState.activePowerUps.multiBall.extraBalls.map((b) => ({
                        x: b.x,
                        y: b.y,
                        radius: b.radius,
                    })),
                },
            },
        };
        rendererRef.current.render(renderState);
    }, []);
    // Game loop
    const gameLoop = useCallback(() => {
        try {
            if (!gameStarted || !gameStateRef.current)
                return;
            const metrics = performanceMetrics.current;
            const now = performance.now();
            // Limit to 60fps
            if (now - metrics.lastFrameTime < 16.67) {
                animationFrameRef.current = requestAnimationFrame(gameLoop);
                return;
            }
            // Update game state
            updateGame();
            // Render
            renderGame();
            // Memory management
            metrics.frameCount++;
            metrics.lastFrameTime = now;
            if (metrics.frameCount % 3600 === 0) {
                const gameState = gameStateRef.current;
                if (gameState.ball.trail.length > 100) {
                    gameState.ball.trail = gameState.ball.trail.slice(-50);
                }
            }
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        }
        catch (error) {
            console.error('Game loop error:', error);
            setGameStarted(false);
        }
    }, [gameStarted, updateGame, renderGame]);
    // Start/stop game loop
    useEffect(() => {
        if (gameStarted) {
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        }
        else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gameStarted, gameLoop]);
    // Toggle AI
    const toggleAI = () => {
        const newAiEnabled = !aiEnabled;
        setAiEnabled(newAiEnabled);
        gameStateRef.current.ai.enabled = newAiEnabled;
    };
    // Change difficulty
    const changeDifficulty = (difficulty) => {
        setAiDifficulty(difficulty);
        gameStateRef.current.ai.difficulty = difficulty;
    };
    // Sync React state with gameState
    useEffect(() => {
        gameStateRef.current.ai.enabled = aiEnabled;
        gameStateRef.current.ai.difficulty = aiDifficulty;
        audioManagerRef.current?.setEnabled(soundEnabled);
    }, [aiEnabled, aiDifficulty, soundEnabled]);
    // Update renderer theme when theme changes
    useEffect(() => {
        if (rendererRef.current && theme) {
            rendererRef.current.setTheme(theme);
        }
    }, [theme]);
    return (_jsxs("div", { className: `pong-game-container ${window.innerWidth < 1000 ? 'pong-game-container-mobile' : ''}`, children: [_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("canvas", { ref: canvasRef, className: "pong-canvas", role: "img", "aria-label": `Pong game. Score: ${gameStateRef.current?.score?.left || 0} to ${gameStateRef.current?.score?.right || 0}. ${gameStarted ? 'Game active' : 'Game paused'}. ${gameStateRef.current?.gameWinner ? `Winner: ${gameStateRef.current.gameWinner === 'left' ? 'Player' : 'Opponent'}` : ''}`, tabIndex: 0, onKeyDown: (e) => {
                            if (e.key === ' ') {
                                e.preventDefault();
                                setGameStarted(!gameStarted);
                            }
                        }, "aria-describedby": "game-instructions" }), _jsxs("div", { id: "game-instructions", className: "sr-only", children: ["Use W and S keys to control left paddle, Up and Down arrows for right paddle. Space to start/pause. Current level: ", gameStateRef.current?.progressBar?.level || 1, ".", gameStateRef.current?.session?.rallies > 0 && `Current rally: ${gameStateRef.current.session.rallies} hits.`] }), _jsxs("div", { className: "controls-container", children: [_jsxs("div", { className: "ai-controls", children: [_jsx("button", { onClick: toggleAI, className: `button ${aiEnabled ? 'button-ai-on' : 'button-ai-off'}`, "aria-label": `AI opponent ${aiEnabled ? 'enabled' : 'disabled'}. Click to ${aiEnabled ? 'disable' : 'enable'} AI`, "aria-pressed": aiEnabled, children: aiEnabled ? 'AI: ON' : 'AI: OFF' }), aiEnabled && (_jsxs(_Fragment, { children: [_jsx("label", { className: "difficulty-label", children: "DIFFICULTY:" }), ['easy', 'medium', 'hard'].map((diff) => (_jsx("button", { onClick: () => changeDifficulty(diff), className: `difficulty-button ${aiDifficulty === diff ? 'difficulty-button-active' : 'difficulty-button-inactive'}`, children: diff.toUpperCase() }, diff)))] }))] }), _jsx("p", { className: `controls-text ${window.innerWidth < 600 ? 'controls-text-mobile' : ''}`, children: window.innerWidth < 600 ? (_jsxs(_Fragment, { children: ["TOUCH: ", _jsx("span", { style: { color: '#ed64a6' }, children: "LEFT SIDE" }), " |", ' ', _jsx("span", { style: { color: '#81ecec' }, children: aiEnabled ? 'AI' : 'RIGHT SIDE' })] })) : (_jsxs(_Fragment, { children: ["LEFT: ", _jsx("span", { style: { color: '#ed64a6' }, children: "WASD" }), " | RIGHT:", ' ', _jsx("span", { style: { color: '#81ecec' }, children: aiEnabled ? 'AI' : 'ARROW KEYS' })] })) }), _jsxs("div", { className: `button-container ${window.innerWidth < 600 ? 'button-container-mobile' : ''}`, children: [_jsx("button", { onClick: () => setGameStarted(!gameStarted), className: `button start-pause-button ${window.innerWidth < 600 ? 'start-pause-button-mobile' : ''} ${gameStarted ? 'pause-button' : 'start-button'}`, "aria-label": gameStarted ? 'Pause game (Spacebar)' : 'Start game (Spacebar)', "aria-describedby": "game-status", autoFocus: !gameStarted, children: gameStarted ? 'PAUSE' : 'START GAME' }), _jsxs("div", { id: "game-status", className: "sr-only", children: ["Game is currently ", gameStarted ? 'running' : 'stopped', ".", gameStateRef.current?.gameWinner &&
                                                `Game over. ${gameStateRef.current.gameWinner === 'left' ? 'Player' : 'Opponent'} wins.`] }), _jsx("button", { onClick: () => setSoundEnabled(!soundEnabled), className: `button sound-button ${window.innerWidth < 600 ? 'sound-button-mobile' : ''} ${soundEnabled ? 'sound-on-button' : 'sound-off-button'}`, "aria-label": `Sound effects ${soundEnabled ? 'enabled' : 'disabled'}. Click to ${soundEnabled ? 'disable' : 'enable'} sound`, "aria-pressed": soundEnabled, children: soundEnabled ? 'SOUND ON' : 'SOUND OFF' }), _jsxs("button", { onClick: () => {
                                            setLeaderboardMode('view');
                                            setShowLeaderboard(true);
                                        }, className: `button leaderboard-button ${window.innerWidth < 600 ? 'leaderboard-button-mobile' : ''}`, children: [_jsx("div", { className: "leaderboard-icon", children: "L" }), "LEADERBOARD"] })] })] }), _jsxs("div", { className: "progress-container", children: [_jsxs("div", { className: "progress-bar-wrapper", children: [_jsx("div", { className: "progress-bar-bg", children: _jsx("div", { className: "progress-bar-fill", style: {
                                                width: `${((gameStateRef.current?.progressBar?.currentXP || 0) / (gameStateRef.current?.progressBar?.xpToNext || 100)) * 100}%`,
                                            } }) }), _jsxs("div", { className: "progress-text", children: ["Level ", gameStateRef.current?.progressBar?.level || 1, " \u2022 ", gameStateRef.current?.progressBar?.currentXP || 0, "/", gameStateRef.current?.progressBar?.xpToNext || 100, " XP"] })] }), _jsxs("div", { className: "achievements-row", children: [gameStateRef.current?.achievements?.rally10 && _jsx("span", { className: "achievement-badge", children: "Rally Master" }), gameStateRef.current?.achievements?.speedDemon && _jsx("span", { className: "achievement-badge", children: "Speed Demon" }), gameStateRef.current?.achievements?.firstWin && _jsx("span", { className: "achievement-badge", children: "First Victory" }), gameStateRef.current?.achievements?.quickReflexes && (_jsx("span", { className: "achievement-badge", children: "Quick Reflexes" }))] })] })] }), showLeaderboard && (_jsx("div", { className: "leaderboard-modal", children: _jsxs("div", { className: `leaderboard-content ${window.innerWidth < 600 ? 'leaderboard-content-mobile' : ''}`, children: [leaderboardMode === 'gameEnd' ? (_jsxs("div", { className: "leaderboard-game-end", children: [_jsxs("div", { className: "leaderboard-title", children: [_jsx("div", { className: "leaderboard-title-icon", children: "V" }), "GAME OVER!", _jsx("div", { className: "leaderboard-title-star", children: "\u2605" })] }), _jsxs("p", { className: "leaderboard-final-score", children: ["Final Score: ", gameStateRef.current?.score?.left || 0, " - ", gameStateRef.current?.score?.right || 0] }), _jsx("input", { type: "text", placeholder: "Enter your name", value: playerName, onChange: (e) => setPlayerName(e.target.value), className: "leaderboard-input", maxLength: 20 }), _jsxs("div", { className: "leaderboard-button-container", children: [_jsxs("button", { onClick: () => {
                                                const playerScore = gameStateRef.current?.gameWinner === 'left'
                                                    ? gameStateRef.current?.score?.left
                                                    : gameStateRef.current?.score?.right;
                                                const aiScore = gameStateRef.current?.gameWinner === 'left'
                                                    ? gameStateRef.current?.score?.right
                                                    : gameStateRef.current?.score?.left;
                                                addScore(playerName, playerScore || 0, aiScore || 0, aiDifficulty);
                                                setShowLeaderboard(false);
                                                setPlayerName('');
                                            }, className: "leaderboard-save-button", children: [_jsx("div", { className: "leaderboard-save-icon", children: "S" }), "SAVE SCORE"] }), _jsxs("button", { onClick: () => {
                                                setShowLeaderboard(false);
                                                setPlayerName('');
                                            }, className: "leaderboard-skip-button", children: [_jsx("div", { className: "leaderboard-skip-icon", children: "\u2715" }), "SKIP"] })] })] })) : (_jsxs("div", { className: "leaderboard-view", children: [_jsxs("div", { className: "leaderboard-view-title", children: [_jsx("div", { className: "leaderboard-icon", children: "L" }), "LEADERBOARD"] }), _jsx("button", { onClick: () => setShowLeaderboard(false), className: "leaderboard-close-button", children: "CLOSE" })] })), _jsxs("div", { style: { marginTop: '25px' }, children: [_jsxs("div", { className: "top-scores-title", children: [_jsx("div", { className: "top-scores-icon", children: "1" }), "TOP SCORES", _jsx("div", { className: "top-scores-icon-2", children: "2" })] }), leaderboardScores.length === 0 ? (_jsx("p", { className: "no-scores", children: "No scores yet. Be the first!" })) : (_jsx("div", { style: { fontSize: '12px' }, children: leaderboardScores.map((score, index) => {
                                        const getRankBadge = (rank) => {
                                            const badges = {
                                                0: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', icon: '1' },
                                                1: { bg: 'linear-gradient(135deg, #c0c0c0, #a0a0a0)', color: '#fff', icon: '2' },
                                                2: { bg: 'linear-gradient(135deg, #cd7f32, #b86f28)', color: '#fff', icon: '3' },
                                            };
                                            return (badges[rank] || {
                                                bg: 'linear-gradient(135deg, #4b5563, #374151)',
                                                color: '#e5e7eb',
                                                icon: (rank + 1).toString(),
                                            });
                                        };
                                        const badge = getRankBadge(index);
                                        return (_jsxs("div", { className: `score-entry ${index < 3 ? 'score-entry-top' : 'score-entry-normal'}`, children: [_jsxs("div", { className: "score-rank", children: [_jsx("div", { className: `rank-badge ${index < 3 ? 'rank-badge-top' : 'rank-badge-normal'}`, style: { background: badge.bg, color: badge.color }, children: badge.icon }), _jsx("span", { className: `score-name ${index < 3 ? 'score-name-top' : 'score-name-normal'}`, children: score.name })] }), _jsxs("div", { className: "score-value", children: [_jsxs("div", { className: `score-points ${index < 3 ? 'score-points-top' : 'score-points-normal'}`, children: [score.playerScore, " pts"] }), _jsxs("div", { className: "score-difficulty", children: ["vs ", score.difficulty] })] })] }, score.id));
                                    }) }))] })] }) }))] }));
};
/**
 * ClassicMode wrapper component
 * Wraps PongGame with title for App.tsx compatibility
 */
const ClassicMode = () => {
    return (_jsxs(_Fragment, { children: [_jsx("h1", { children: "Web Pong" }), _jsx(PongGame, {})] }));
};
export default ClassicMode;
