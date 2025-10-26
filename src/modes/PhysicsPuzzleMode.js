import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * PhysicsPuzzleMode Component
 * Portal-based physics puzzles with breakout-style gameplay
 * Follows W3BP0NG liquid glass synthwave aesthetic
 */
import { W3BP0NG_THEME } from '../../w3bp0ng-theme.config';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { GlassPanel, ScoreDisplay, TimerDisplay, GlassButton, PauseOverlay, StatsDisplay, } from '../ui/GlassHUD';
import { renderPuzzleGame } from './physics-puzzle/PuzzleRenderer';
import { getLevel } from './physics-puzzle/levels';
import { listLevels, loadLevel } from './level-editor/LevelData';
import { updatePaddlePosition, updateBallPosition, checkWallCollisions, isBallOutOfBounds, checkPaddleCollision, applyPaddleBounce, checkBlockCollision, applyBlockBounce, damageBlock, checkPortalCollision, applyPortalTeleport, checkBouncePadCollision, applyBouncePadEffect, checkLevelComplete, calculateStars, createInitialBall, createPaddle, } from './physics-puzzle/PhysicsPuzzleEngine';
import { loadPuzzleProgress, savePuzzleProgress } from '../utils/storage';
import '../styles/glassmorphism.css';
export function PhysicsPuzzleMode() {
    // ═══════════════════════════════════════════════════════════
    // GLOBAL STATE & THEME
    // ═══════════════════════════════════════════════════════════
    const returnToMenu = useGameStore((state) => state.returnToMenu);
    // ═══════════════════════════════════════════════════════════
    // REFS
    // ═══════════════════════════════════════════════════════════
    const canvasRef = useRef(null);
    const gameStateRef = useRef(null);
    const animationFrameRef = useRef(null);
    const keysPressed = useRef(new Set());
    const lastFrameTime = useRef(0);
    // ═══════════════════════════════════════════════════════════
    // UI STATE
    // ═══════════════════════════════════════════════════════════
    const [currentLevelId, setCurrentLevelId] = useState(1);
    const [levelSource, setLevelSource] = useState('builtin');
    const [customLevelName, setCustomLevelName] = useState(null);
    const [gamePhase, setGamePhase] = useState('menu');
    const [displayScore, setDisplayScore] = useState(0);
    const [displayTime, setDisplayTime] = useState(0);
    const [displayHits, setDisplayHits] = useState(0);
    const [earnedStars, setEarnedStars] = useState(0);
    const [totalStars, setTotalStars] = useState(0);
    const [availableCustomLevels, setAvailableCustomLevels] = useState([]);
    // Load current level (builtin or custom)
    const currentLevel = levelSource === 'custom' && customLevelName
        ? loadLevel(customLevelName)?.levelData
        : getLevel(currentLevelId);
    // Load custom levels list
    useEffect(() => {
        const customLevels = listLevels().map(level => level.name);
        setAvailableCustomLevels(customLevels);
    }, []);
    // ═══════════════════════════════════════════════════════════
    // LOAD PROGRESS ON MOUNT
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        const progress = loadPuzzleProgress();
        setTotalStars(progress.totalStars);
    }, []);
    // ═══════════════════════════════════════════════════════════
    // INITIALIZE GAME STATE
    // ═══════════════════════════════════════════════════════════
    const initializeLevel = useCallback(() => {
        if (!canvasRef.current || !currentLevel)
            return;
        const canvas = canvasRef.current;
        const width = canvas.width;
        const height = canvas.height;
        // Create game state
        const initialBallSpeed = currentLevel.ballSpeed || 5;
        const ballCount = currentLevel.ballCount || 1;
        const balls = Array.from({ length: ballCount }, () => createInitialBall(width, height, initialBallSpeed));
        gameStateRef.current = {
            currentLevel: currentLevel.id,
            levelData: currentLevel,
            paddle: createPaddle(width, height),
            balls,
            blocks: [...currentLevel.blocks],
            portals: [...currentLevel.portals],
            bouncePads: currentLevel.bouncePads || [],
            gravityZones: currentLevel.gravityZones || [],
            score: 0,
            hits: 0,
            elapsedTime: 0,
            gameStarted: false,
            levelComplete: false,
            levelFailed: false,
            canvas: { width, height },
        };
        setDisplayScore(0);
        setDisplayTime(0);
        setDisplayHits(0);
        lastFrameTime.current = performance.now();
    }, [currentLevel]);
    // ═══════════════════════════════════════════════════════════
    // KEYBOARD CONTROLS
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        const handleKeyDown = (e) => {
            keysPressed.current.add(e.key.toLowerCase());
            if (e.key === 'Escape' && gamePhase === 'playing') {
                setGamePhase('paused');
            }
            if (e.key === ' ' && gamePhase === 'playing' && gameStateRef.current) {
                gameStateRef.current.gameStarted = true;
            }
        };
        const handleKeyUp = (e) => {
            keysPressed.current.delete(e.key.toLowerCase());
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gamePhase]);
    // ═══════════════════════════════════════════════════════════
    // GAME LOOP
    // ═══════════════════════════════════════════════════════════
    const gameLoop = useCallback((currentTime) => {
        if (!gameStateRef.current || !canvasRef.current)
            return;
        const state = gameStateRef.current;
        const deltaTime = Math.min((currentTime - lastFrameTime.current) / 16.67, 2);
        lastFrameTime.current = currentTime;
        // Update elapsed time
        if (state.gameStarted) {
            state.elapsedTime += deltaTime / 60;
            setDisplayTime(state.elapsedTime);
        }
        // Update paddle
        const leftPressed = keysPressed.current.has('arrowleft') || keysPressed.current.has('a');
        const rightPressed = keysPressed.current.has('arrowright') || keysPressed.current.has('d');
        state.paddle = updatePaddlePosition(state.paddle, leftPressed, rightPressed, state.canvas.width, deltaTime);
        // Update balls
        state.balls.forEach((ball, index) => {
            if (!state.gameStarted) {
                // Keep ball on paddle before launch
                ball.x = state.paddle.x;
                ball.y = state.paddle.y - state.paddle.height / 2 - ball.radius - 2;
                return;
            }
            // Update position with gravity zones
            state.balls[index] = updateBallPosition(ball, state.gravityZones, deltaTime);
            // Wall collisions
            state.balls[index] = checkWallCollisions(ball, state.canvas.width, state.canvas.height);
            // Check if ball fell off screen
            if (isBallOutOfBounds(ball, state.canvas.height)) {
                ball.active = false;
            }
            // Paddle collision
            const paddleHit = checkPaddleCollision(ball, state.paddle);
            if (paddleHit.collided) {
                state.balls[index] = applyPaddleBounce(ball, state.paddle);
                state.hits++;
                setDisplayHits(state.hits);
            }
            // Block collisions
            for (let i = 0; i < state.blocks.length; i++) {
                const block = state.blocks[i];
                if (!block)
                    continue;
                const blockHit = checkBlockCollision(ball, block);
                if (blockHit.collided && blockHit.normal) {
                    state.balls[index] = applyBlockBounce(ball, blockHit.normal);
                    const damagedBlock = damageBlock(block);
                    state.blocks[i] = damagedBlock;
                    // Add score
                    if (!damagedBlock.active) {
                        const points = block.type === 'target' ? 500 : 100;
                        state.score += points;
                        setDisplayScore(state.score);
                    }
                    break; // Only one collision per frame
                }
            }
            // Portal collisions
            const portalResult = checkPortalCollision(ball, state.portals, currentTime);
            if (portalResult.teleported) {
                state.balls[index] = applyPortalTeleport(ball, portalResult, currentTime);
            }
            // Bounce pad collisions
            const bouncePad = checkBouncePadCollision(ball, state.bouncePads);
            if (bouncePad) {
                state.balls[index] = applyBouncePadEffect(ball, bouncePad);
            }
        });
        // Remove inactive balls
        state.balls = state.balls.filter((ball) => ball.active);
        // Check level complete
        if (checkLevelComplete(state)) {
            const stars = calculateStars(state);
            setEarnedStars(stars);
            setGamePhase('complete');
            // Save progress
            const progress = loadPuzzleProgress();
            const existingStars = progress.starRatings[currentLevelId] || 0;
            const bestStars = Math.max(existingStars, stars);
            progress.starRatings[currentLevelId] = bestStars;
            if (!progress.levelsCompleted.includes(currentLevelId)) {
                progress.levelsCompleted.push(currentLevelId);
            }
            // Recalculate total stars
            progress.totalStars = Object.values(progress.starRatings).reduce((sum, s) => sum + s, 0);
            setTotalStars(progress.totalStars);
            savePuzzleProgress(progress);
            return;
        }
        // Check level failed (all balls lost)
        if (state.balls.length === 0 && state.gameStarted) {
            state.levelFailed = true;
            setGamePhase('menu');
        }
        // Render
        renderPuzzleGame(canvasRef.current.getContext('2d'), state, currentTime);
        animationFrameRef.current = requestAnimationFrame(gameLoop);
    }, [currentLevelId]);
    // Start/stop game loop based on phase
    useEffect(() => {
        if (gamePhase === 'playing') {
            lastFrameTime.current = performance.now();
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        }
        else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [gamePhase, gameLoop]);
    // ═══════════════════════════════════════════════════════════
    // EVENT HANDLERS
    // ═══════════════════════════════════════════════════════════
    const handleStartLevel = () => {
        initializeLevel();
        setGamePhase('playing');
    };
    const handleResume = () => {
        lastFrameTime.current = performance.now();
        setGamePhase('playing');
    };
    const handleRetry = () => {
        initializeLevel();
        setGamePhase('menu');
    };
    const handleNextLevel = () => {
        if (levelSource === 'custom') {
            // Try next custom level, otherwise go back to builtin
            const currentIndex = availableCustomLevels.indexOf(customLevelName || '');
            if (currentIndex >= 0 && currentIndex < availableCustomLevels.length - 1) {
                setCustomLevelName(availableCustomLevels[currentIndex + 1]);
                setGamePhase('menu');
            }
            else {
                // Switch back to builtin levels
                setLevelSource('builtin');
                setCurrentLevelId(1);
                setCustomLevelName(null);
                setGamePhase('menu');
            }
        }
        else {
            const nextLevelId = currentLevelId + 1;
            if (getLevel(nextLevelId)) {
                setCurrentLevelId(nextLevelId);
                setGamePhase('menu');
            }
            else if (availableCustomLevels.length > 0) {
                // Switch to custom levels
                setLevelSource('custom');
                setCustomLevelName(availableCustomLevels[0]);
                setGamePhase('menu');
            }
        }
    };
    const handleSelectCustomLevel = (levelName) => {
        setCustomLevelName(levelName);
        setLevelSource('custom');
        setGamePhase('menu');
    };
    const handleSelectBuiltinLevel = (levelId) => {
        setCurrentLevelId(levelId);
        setLevelSource('builtin');
        setCustomLevelName(null);
        setGamePhase('menu');
    };
    const handleExit = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        returnToMenu();
    };
    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════
    if (!currentLevel) {
        return (_jsx("div", { className: "cosmic-bg", style: { width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsxs(GlassPanel, { variant: "elevated", neonAccent: "magenta", children: [_jsx("h2", { className: "text-glow-primary", children: "Level not found" }), _jsx(GlassButton, { onClick: handleExit, children: "Back to Menu" })] }) }));
    }
    return (_jsxs("div", { className: "cosmic-bg", style: {
            width: '100vw',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
        }, children: [_jsx("canvas", { ref: canvasRef, width: 1200, height: 800, style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: gamePhase === 'playing' || gamePhase === 'paused' ? 'block' : 'none',
                } }), (gamePhase === 'playing' || gamePhase === 'paused') && (_jsxs(_Fragment, { children: [_jsx(ScoreDisplay, { label: "SCORE", value: displayScore, position: "left", neonAccent: "magenta" }), _jsx(TimerDisplay, { time: displayTime, label: "TIME", format: "seconds" }), _jsx(StatsDisplay, { position: "top-right", stats: [
                            { label: 'Level', value: currentLevelId },
                            { label: 'Hits', value: displayHits },
                            { label: 'Total ★', value: totalStars },
                        ] })] })), gamePhase === 'menu' && (_jsxs(GlassPanel, { variant: "elevated", neonAccent: "magenta", className: "animate-slideUp", style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: W3BP0NG_THEME.spacing['2xl'],
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: W3BP0NG_THEME.spacing.xl,
                    minWidth: '500px',
                }, children: [_jsx("h1", { className: "text-glow-primary", style: {
                            fontSize: W3BP0NG_THEME.typography.sizes.heading_xl,
                            fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
                            margin: 0,
                            letterSpacing: '0.1em',
                        }, children: currentLevel.name }), _jsx("p", { className: "text-glow-subtle", style: {
                            fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
                            fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
                            textAlign: 'center',
                            margin: 0,
                            maxWidth: '400px',
                        }, children: currentLevel.description }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: W3BP0NG_THEME.spacing.md,
                            marginBottom: W3BP0NG_THEME.spacing.lg,
                        }, children: [_jsx(GlassButton, { onClick: () => handleSelectBuiltinLevel(1), className: levelSource === 'builtin' ? 'active' : '', neonAccent: "cyan", children: "\uD83C\uDFD7\uFE0F Built-in Levels" }), _jsxs(GlassButton, { onClick: () => availableCustomLevels.length > 0 && handleSelectCustomLevel(availableCustomLevels[0]), className: levelSource === 'custom' ? 'active' : '', neonAccent: "magenta", disabled: availableCustomLevels.length === 0, children: ["\uD83D\uDEE0\uFE0F Custom Levels (", availableCustomLevels.length, ")"] })] }), levelSource === 'builtin' ? (_jsx("div", { style: {
                            display: 'flex',
                            gap: W3BP0NG_THEME.spacing.sm,
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            marginBottom: W3BP0NG_THEME.spacing.lg,
                        }, children: Array.from({ length: 10 }, (_, i) => i + 1).map((levelId) => {
                            const level = getLevel(levelId);
                            if (!level)
                                return null;
                            return (_jsx(GlassButton, { onClick: () => handleSelectBuiltinLevel(levelId), className: currentLevelId === levelId ? 'active' : '', neonAccent: "cyan", size: "small", style: { minWidth: '60px' }, children: levelId }, levelId));
                        }) })) : (_jsx("div", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: W3BP0NG_THEME.spacing.sm,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            marginBottom: W3BP0NG_THEME.spacing.lg,
                            width: '100%',
                        }, children: availableCustomLevels.map((levelName) => (_jsxs(GlassButton, { onClick: () => handleSelectCustomLevel(levelName), className: customLevelName === levelName ? 'active' : '', neonAccent: "magenta", style: { justifyContent: 'flex-start' }, children: ["\uD83D\uDCDD ", levelName] }, levelName))) })), _jsx("div", { style: {
                            display: 'flex',
                            gap: W3BP0NG_THEME.spacing.sm,
                            fontSize: '2rem',
                        }, children: Array.from({ length: currentLevel?.difficulty || 1 }).map((_, i) => (_jsx("span", { className: "text-glow-cyan", children: "\u25C6" }, i))) }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: W3BP0NG_THEME.spacing.md,
                            flexDirection: 'column',
                            width: '100%',
                        }, children: [_jsx(GlassButton, { variant: "primary", onClick: handleStartLevel, children: "Start Level" }), _jsx(GlassButton, { onClick: handleExit, children: "Back to Menu" })] })] })), gamePhase === 'paused' && (_jsx(PauseOverlay, { onResume: handleResume, onExit: handleExit })), gamePhase === 'complete' && (_jsxs(GlassPanel, { variant: "elevated", neonAccent: "cyan", className: "animate-fadeIn", style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: W3BP0NG_THEME.spacing['3xl'],
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: W3BP0NG_THEME.spacing.xl,
                    minWidth: '500px',
                }, children: [_jsx("h1", { className: "text-glow-primary animate-pulseGlow", style: {
                            fontSize: W3BP0NG_THEME.typography.sizes.heading_xl,
                            fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
                            margin: 0,
                        }, children: "LEVEL COMPLETE!" }), _jsxs("div", { style: { fontSize: '4rem', letterSpacing: '0.5rem' }, children: [Array.from({ length: earnedStars }).map((_, i) => (_jsx("span", { className: "text-glow-cyan", children: "\u2605" }, i))), Array.from({ length: 3 - earnedStars }).map((_, i) => (_jsx("span", { style: { opacity: 0.3 }, children: "\u2606" }, i)))] }), _jsxs("div", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: W3BP0NG_THEME.spacing.sm,
                            width: '100%',
                        }, children: [_jsxs("div", { className: "text-glow-subtle", style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
                                }, children: [_jsx("span", { children: "Score:" }), _jsx("span", { className: "text-glow-cyan", children: displayScore })] }), _jsxs("div", { className: "text-glow-subtle", style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
                                }, children: [_jsx("span", { children: "Time:" }), _jsxs("span", { className: "text-glow-cyan", children: [displayTime.toFixed(1), "s"] })] }), _jsxs("div", { className: "text-glow-subtle", style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
                                }, children: [_jsx("span", { children: "Hits:" }), _jsx("span", { className: "text-glow-cyan", children: displayHits })] })] }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: W3BP0NG_THEME.spacing.md,
                            flexDirection: 'column',
                            width: '100%',
                            marginTop: W3BP0NG_THEME.spacing.lg,
                        }, children: [getLevel(currentLevelId + 1) && (_jsx(GlassButton, { variant: "primary", onClick: handleNextLevel, children: "Next Level" })), _jsx(GlassButton, { onClick: handleRetry, children: "Retry Level" }), _jsx(GlassButton, { onClick: handleExit, children: "Exit to Menu" })] })] }))] }));
}
export default PhysicsPuzzleMode;
