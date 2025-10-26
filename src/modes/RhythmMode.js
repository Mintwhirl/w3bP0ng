import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * RhythmMode Component
 * Beat-synchronized Pong with combo system
 * Follows W3BP0NG liquid glass synthwave aesthetic
 */
import { W3BP0NG_THEME } from '../../w3bp0ng-theme.config';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@hooks/useGameStore';
import { GlassPanel, ScoreDisplay, StatsDisplay, GlassButton, PauseOverlay, } from '@ui/GlassHUD';
import { renderRhythmGame } from './rhythm-mode/RhythmRenderer';
import { BeatSync, createDefaultTrack } from './rhythm-mode/BeatSync';
import { updatePaddle, updateBall, checkWallCollisions, checkPaddleCollision, applyPaddleBounce, createInitialRhythmState, processHit, resetBall, } from './rhythm-mode/RhythmEngine';
import '../styles/glassmorphism.css';
export function RhythmMode() {
    // ═══════════════════════════════════════════════════════════
    // GLOBAL STATE
    // ═══════════════════════════════════════════════════════════
    const returnToMenu = useGameStore((state) => state.returnToMenu);
    // ═══════════════════════════════════════════════════════════
    // REFS
    // ═══════════════════════════════════════════════════════════
    const canvasRef = useRef(null);
    const gameStateRef = useRef(null);
    const beatSyncRef = useRef(null);
    const animationFrameRef = useRef(null);
    const keysPressed = useRef(new Set());
    const lastFrameTime = useRef(0);
    // ═══════════════════════════════════════════════════════════
    // UI STATE
    // ═══════════════════════════════════════════════════════════
    const [difficulty, setDifficulty] = useState('normal');
    const [gamePhase, setGamePhase] = useState('menu');
    const [displayScore, setDisplayScore] = useState(0);
    const [displayCombo, setDisplayCombo] = useState(0);
    // ═══════════════════════════════════════════════════════════
    // INITIALIZE GAME
    // ═══════════════════════════════════════════════════════════
    const initializeGame = useCallback(() => {
        try {
            if (!canvasRef.current) {
                console.error('[RhythmMode] Canvas reference not available');
                return;
            }
            const canvas = canvasRef.current;
            // Validate canvas dimensions
            if (!canvas.width || !canvas.height || canvas.width <= 0 || canvas.height <= 0) {
                console.error('[RhythmMode] Invalid canvas dimensions:', { width: canvas.width, height: canvas.height });
                return;
            }
            const track = createDefaultTrack(difficulty);
            // Validate track data
            if (!track || track.bpm <= 0 || track.duration <= 0) {
                console.error('[RhythmMode] Invalid track data:', track);
                return;
            }
            // Create beat sync
            beatSyncRef.current = new BeatSync(track.bpm, track.duration);
            // Create game state
            gameStateRef.current = createInitialRhythmState(canvas.width, canvas.height, track);
            // Validate initial game state
            if (!gameStateRef.current) {
                throw new Error('[RhythmMode] Failed to create initial game state');
            }
            setDisplayScore(0);
            setDisplayCombo(0);
            lastFrameTime.current = performance.now();
            console.log('[RhythmMode] Game initialized successfully', {
                difficulty,
                canvasSize: { width: canvas.width, height: canvas.height },
                trackInfo: { bpm: track.bpm, duration: track.duration }
            });
        }
        catch (error) {
            console.error('[RhythmMode] Failed to initialize game:', error);
            setGamePhase('menu');
        }
    }, [difficulty]);
    // ═══════════════════════════════════════════════════════════
    // KEYBOARD CONTROLS
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        const handleKeyDown = (e) => {
            keysPressed.current.add(e.key.toLowerCase());
            if (e.key === 'Escape' && gamePhase === 'playing') {
                setGamePhase('paused');
            }
            if (e.key === ' ') {
                e.preventDefault();
                if (gamePhase === 'menu') {
                    setGamePhase('playing');
                }
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
        try {
            if (!gameStateRef.current || !beatSyncRef.current || !canvasRef.current) {
                console.warn('[RhythmMode] Game loop missing references');
                return;
            }
            const state = gameStateRef.current;
            const beatSync = beatSyncRef.current;
            const canvas = canvasRef.current;
            // Validate canvas context
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('[RhythmMode] Failed to get 2D context');
                return;
            }
            // Validate and calculate delta time
            if (typeof currentTime !== 'number' || currentTime <= 0 || !lastFrameTime.current) {
                console.warn('[RhythmMode] Invalid currentTime or missing lastFrameTime');
                lastFrameTime.current = currentTime || performance.now();
                return;
            }
            const deltaTime = Math.min((currentTime - lastFrameTime.current) / 16.67, 2);
            if (deltaTime < 0 || deltaTime > 10) {
                console.warn('[RhythmMode] Abnormal deltaTime:', deltaTime);
                lastFrameTime.current = currentTime;
                return;
            }
            lastFrameTime.current = currentTime;
            // Update elapsed time (ms)
            state.elapsedTime += (deltaTime / 60) * 1000;
            // Get beat progress
            const beatProgress = beatSync.getBeatProgress(state.elapsedTime);
            const currentBeat = beatSync.getCurrentBeat(state.elapsedTime);
            // Update paddle with validation
            const upPressed = keysPressed.current.has('w') || keysPressed.current.has('arrowup');
            const downPressed = keysPressed.current.has('s') || keysPressed.current.has('arrowdown');
            try {
                state.paddle = updatePaddle(state.paddle, upPressed, downPressed, canvas.height, deltaTime);
            }
            catch (error) {
                console.error('[RhythmMode] Failed to update paddle:', error);
                return;
            }
            // Update ball with validation
            try {
                state.ball = updateBall(state.ball, deltaTime);
                state.ball = checkWallCollisions(state.ball, canvas.width, canvas.height);
            }
            catch (error) {
                console.error('[RhythmMode] Failed to update ball:', error);
                return;
            }
            // Check paddle collision
            try {
                if (checkPaddleCollision(state.ball, state.paddle)) {
                    // Evaluate timing
                    const hitAccuracy = beatSync.checkHitTiming(state.elapsedTime, currentBeat);
                    // Process hit
                    gameStateRef.current = processHit(state, hitAccuracy);
                    // Apply bounce
                    const bouncedBall = applyPaddleBounce(gameStateRef.current.ball, gameStateRef.current.paddle);
                    gameStateRef.current.ball = bouncedBall;
                    // Update display with validation
                    if (gameStateRef.current && typeof gameStateRef.current.score === 'number') {
                        setDisplayScore(gameStateRef.current.score);
                        setDisplayCombo(gameStateRef.current.combo || 0);
                    }
                }
            }
            catch (error) {
                console.error('[RhythmMode] Failed to process paddle collision:', error);
            }
            // Check if ball went off left edge (miss)
            try {
                if (state.ball && state.ball.x + state.ball.radius < 0) {
                    state.ball = resetBall(canvas.width, canvas.height);
                    state.combo = 0;
                    state.missedBeats = (state.missedBeats || 0) + 1;
                    setDisplayCombo(0);
                }
            }
            catch (error) {
                console.error('[RhythmMode] Failed to handle miss:', error);
            }
            // Check track completion
            try {
                if (state.track && typeof state.elapsedTime === 'number' && state.elapsedTime >= state.track.duration * 1000) {
                    console.log('[RhythmMode] Track completed');
                    setGamePhase('complete');
                    return;
                }
            }
            catch (error) {
                console.error('[RhythmMode] Failed to check track completion:', error);
            }
            // Render with error handling
            try {
                renderRhythmGame(ctx, state, beatProgress);
            }
            catch (error) {
                console.error('[RhythmMode] Failed to render game:', error);
                // Continue game loop even if rendering fails
            }
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        }
        catch (error) {
            console.error('[RhythmMode] Critical error in game loop:', error);
            // Try to recover by resetting game phase
            setGamePhase('menu');
        }
    }, []);
    // Start/stop game loop
    useEffect(() => {
        if (gamePhase === 'playing') {
            // Small delay to ensure state is set before first frame
            setTimeout(() => {
                initializeGame();
                lastFrameTime.current = performance.now();
                animationFrameRef.current = requestAnimationFrame(gameLoop);
            }, 0);
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
    }, [gamePhase, gameLoop, initializeGame]);
    // ═══════════════════════════════════════════════════════════
    // EVENT HANDLERS
    // ═══════════════════════════════════════════════════════════
    const handleStart = () => {
        setGamePhase('playing');
    };
    const handleResume = () => {
        lastFrameTime.current = performance.now();
        setGamePhase('playing');
    };
    const handleRetry = () => {
        setGamePhase('menu');
    };
    const handleExit = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        returnToMenu();
    };
    // Calculate stats
    const calculateAccuracy = () => {
        if (!gameStateRef.current)
            return 0;
        const state = gameStateRef.current;
        const totalHits = state.perfectHits + state.goodHits + state.missedBeats;
        if (totalHits === 0)
            return 0;
        return Math.round(((state.perfectHits + state.goodHits) / totalHits) * 100);
    };
    const calculateStars = () => {
        const accuracy = calculateAccuracy();
        if (accuracy >= 90)
            return 3;
        if (accuracy >= 70)
            return 2;
        if (accuracy >= 50)
            return 1;
        return 0;
    };
    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════
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
                } }), (gamePhase === 'playing' || gamePhase === 'paused') && gameStateRef.current && (_jsxs(_Fragment, { children: [_jsx(ScoreDisplay, { label: "SCORE", value: displayScore, position: "left", neonAccent: "cyan" }), _jsx(StatsDisplay, { position: "top-right", stats: [
                            { label: 'Combo', value: `×${displayCombo}` },
                            { label: 'Perfect', value: gameStateRef.current.perfectHits },
                            { label: 'Good', value: gameStateRef.current.goodHits },
                            { label: 'Miss', value: gameStateRef.current.missedBeats },
                        ] })] })), gamePhase === 'menu' && (_jsxs(GlassPanel, { variant: "elevated", neonAccent: "cyan", className: "animate-slideUp", style: {
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
                }, children: [_jsx("h1", { className: "text-glow-primary animate-pulseGlow", style: {
                            fontSize: W3BP0NG_THEME.typography.sizes.heading_xl,
                            fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
                            margin: 0,
                        }, children: "RHYTHM MODE" }), _jsx("p", { className: "text-glow-subtle", style: {
                            fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
                            fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
                            textAlign: 'center',
                            margin: 0,
                        }, children: "Hit the ball on beat to build combos!" }), _jsx("div", { style: { display: 'flex', gap: W3BP0NG_THEME.spacing.md }, children: ['easy', 'normal', 'hard'].map((diff) => (_jsx(GlassButton, { variant: difficulty === diff ? 'primary' : 'secondary', onClick: () => setDifficulty(diff), children: diff.toUpperCase() }, diff))) }), _jsxs("p", { className: "text-glow-cyan", style: {
                            fontSize: W3BP0NG_THEME.typography.sizes.body_md,
                            fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
                        }, children: [difficulty === 'easy' && '90 BPM • 60s', difficulty === 'normal' && '120 BPM • 90s', difficulty === 'hard' && '160 BPM • 120s'] }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: W3BP0NG_THEME.spacing.md,
                            flexDirection: 'column',
                            width: '100%',
                        }, children: [_jsx(GlassButton, { variant: "primary", onClick: handleStart, children: "Start (Space)" }), _jsx(GlassButton, { onClick: handleExit, children: "Back to Menu" })] })] })), gamePhase === 'paused' && (_jsx(PauseOverlay, { onResume: handleResume, onExit: handleExit })), gamePhase === 'complete' && gameStateRef.current && (_jsxs(GlassPanel, { variant: "elevated", neonAccent: "magenta", className: "animate-fadeIn", style: {
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
                        }, children: "PERFORMANCE COMPLETE!" }), _jsxs("div", { style: { fontSize: '4rem', letterSpacing: '0.5rem' }, children: [Array.from({ length: calculateStars() }).map((_, i) => (_jsx("span", { className: "text-glow-cyan", children: "\u2605" }, i))), Array.from({ length: 3 - calculateStars() }).map((_, i) => (_jsx("span", { style: { opacity: 0.3 }, children: "\u2606" }, i)))] }), _jsxs("div", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: W3BP0NG_THEME.spacing.sm,
                            width: '100%',
                        }, children: [_jsxs("div", { className: "text-glow-subtle", style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
                                }, children: [_jsx("span", { children: "Score:" }), _jsx("span", { className: "text-glow-cyan", children: displayScore.toLocaleString() })] }), _jsxs("div", { className: "text-glow-subtle", style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
                                }, children: [_jsx("span", { children: "Accuracy:" }), _jsxs("span", { className: "text-glow-cyan", children: [calculateAccuracy(), "%"] })] }), _jsxs("div", { className: "text-glow-subtle", style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
                                }, children: [_jsx("span", { children: "Max Combo:" }), _jsxs("span", { className: "text-glow-cyan", children: ["\u00D7", gameStateRef.current.combo] })] })] }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: W3BP0NG_THEME.spacing.md,
                            flexDirection: 'column',
                            width: '100%',
                            marginTop: W3BP0NG_THEME.spacing.lg,
                        }, children: [_jsx(GlassButton, { variant: "primary", onClick: handleRetry, children: "Retry" }), _jsx(GlassButton, { onClick: handleExit, children: "Exit to Menu" })] })] }))] }));
}
export default RhythmMode;
