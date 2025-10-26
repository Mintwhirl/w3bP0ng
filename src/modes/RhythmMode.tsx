/**
 * RhythmMode Component
 * Beat-synchronized Pong with combo system
 * Follows W3BP0NG liquid glass synthwave aesthetic
 */

import { W3BP0NG_THEME } from '../../w3bp0ng-theme.config';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@hooks/useGameStore';
import {
  GlassPanel,
  ScoreDisplay,
  StatsDisplay,
  GlassButton,
  PauseOverlay,
} from '@ui/GlassHUD';
import { renderRhythmGame } from './rhythm-mode/RhythmRenderer';
import { BeatSync, createDefaultTrack } from './rhythm-mode/BeatSync';
import {
  updatePaddle,
  updateBall,
  checkWallCollisions,
  checkPaddleCollision,
  applyPaddleBounce,
  createInitialRhythmState,
  processHit,
  resetBall,
} from './rhythm-mode/RhythmEngine';
import type { RhythmGameState } from './rhythm-mode/types';
import '../styles/glassmorphism.css';

type GamePhase = 'menu' | 'playing' | 'paused' | 'complete';
type Difficulty = 'easy' | 'normal' | 'hard';

export function RhythmMode() {
  // ═══════════════════════════════════════════════════════════
  // GLOBAL STATE
  // ═══════════════════════════════════════════════════════════
  const returnToMenu = useGameStore((state) => state.returnToMenu);

  // ═══════════════════════════════════════════════════════════
  // REFS
  // ═══════════════════════════════════════════════════════════
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<RhythmGameState | null>(null);
  const beatSyncRef = useRef<BeatSync | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastFrameTime = useRef<number>(0);

  // ═══════════════════════════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════════════════════════
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [gamePhase, setGamePhase] = useState<GamePhase>('menu');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayCombo, setDisplayCombo] = useState(0);

  // ═══════════════════════════════════════════════════════════
  // INITIALIZE GAME
  // ═══════════════════════════════════════════════════════════
  const initializeGame = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const track = createDefaultTrack(difficulty);

    // Create beat sync
    beatSyncRef.current = new BeatSync(track.bpm, track.duration);

    // Create game state
    gameStateRef.current = createInitialRhythmState(
      canvas.width,
      canvas.height,
      track
    );

    setDisplayScore(0);
    setDisplayCombo(0);
    lastFrameTime.current = performance.now();
  }, [difficulty]);

  // ═══════════════════════════════════════════════════════════
  // KEYBOARD CONTROLS
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

    const handleKeyUp = (e: KeyboardEvent) => {
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
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameStateRef.current || !beatSyncRef.current || !canvasRef.current) return;

    const state = gameStateRef.current;
    const beatSync = beatSyncRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deltaTime = Math.min((currentTime - lastFrameTime.current) / 16.67, 2);
    lastFrameTime.current = currentTime;

    // Update elapsed time (ms)
    state.elapsedTime += (deltaTime / 60) * 1000;

    // Get beat progress
    const beatProgress = beatSync.getBeatProgress(state.elapsedTime);
    const currentBeat = beatSync.getCurrentBeat(state.elapsedTime);

    // Update paddle
    const upPressed = keysPressed.current.has('w') || keysPressed.current.has('arrowup');
    const downPressed = keysPressed.current.has('s') || keysPressed.current.has('arrowdown');
    state.paddle = updatePaddle(state.paddle, upPressed, downPressed, canvas.height, deltaTime);

    // Update ball
    state.ball = updateBall(state.ball, deltaTime);
    state.ball = checkWallCollisions(state.ball, canvas.width, canvas.height);

    // Check paddle collision
    if (checkPaddleCollision(state.ball, state.paddle)) {
      // Evaluate timing
      const hitAccuracy = beatSync.checkHitTiming(state.elapsedTime, currentBeat);

      // Process hit
      gameStateRef.current = processHit(state, hitAccuracy);
      const updatedState = gameStateRef.current;

      // Apply bounce
      updatedState.ball = applyPaddleBounce(updatedState.ball, updatedState.paddle);

      // Update display
      setDisplayScore(updatedState.score);
      setDisplayCombo(updatedState.combo);
    }

    // Check if ball went off left edge (miss)
    if (state.ball.x + state.ball.radius < 0) {
      state.ball = resetBall(canvas.width, canvas.height);
      state.combo = 0;
      state.missedBeats++;
      setDisplayCombo(0);
    }

    // Check track completion
    if (state.elapsedTime >= state.track.duration * 1000) {
      setGamePhase('complete');
      return;
    }

    // Render
    renderRhythmGame(ctx, state, beatProgress);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Start/stop game loop
  useEffect(() => {
    if (gamePhase === 'playing') {
      initializeGame();
      lastFrameTime.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
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
  const calculateAccuracy = (): number => {
    if (!gameStateRef.current) return 0;
    const state = gameStateRef.current;
    const totalHits = state.perfectHits + state.goodHits + state.missedBeats;
    if (totalHits === 0) return 0;
    return Math.round(((state.perfectHits + state.goodHits) / totalHits) * 100);
  };

  const calculateStars = (): 0 | 1 | 2 | 3 => {
    const accuracy = calculateAccuracy();
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    if (accuracy >= 50) return 1;
    return 0;
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div
      className="cosmic-bg"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '100%',
          maxHeight: '100%',
          display: gamePhase === 'playing' || gamePhase === 'paused' ? 'block' : 'none',
        }}
      />

      {/* HUD */}
      {(gamePhase === 'playing' || gamePhase === 'paused') && gameStateRef.current && (
        <>
          <ScoreDisplay
            label="SCORE"
            value={displayScore}
            position="left"
            neonAccent="cyan"
          />
          <StatsDisplay
            position="top-right"
            stats={[
              { label: 'Combo', value: `×${displayCombo}` },
              { label: 'Perfect', value: gameStateRef.current.perfectHits },
              { label: 'Good', value: gameStateRef.current.goodHits },
              { label: 'Miss', value: gameStateRef.current.missedBeats },
            ]}
          />
        </>
      )}

      {/* Menu */}
      {gamePhase === 'menu' && (
        <GlassPanel
          variant="elevated"
          neonAccent="cyan"
          className="animate-slideUp"
          style={{
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
          }}
        >
          <h1
            className="text-glow-primary animate-pulseGlow"
            style={{
              fontSize: W3BP0NG_THEME.typography.sizes.heading_xl,
              fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
              margin: 0,
            }}
          >
            RHYTHM MODE
          </h1>

          <p
            className="text-glow-subtle"
            style={{
              fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
              fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
              textAlign: 'center',
              margin: 0,
            }}
          >
            Hit the ball on beat to build combos!
          </p>

          <div style={{ display: 'flex', gap: W3BP0NG_THEME.spacing.md }}>
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
              <GlassButton
                key={diff}
                variant={difficulty === diff ? 'primary' : 'secondary'}
                onClick={() => setDifficulty(diff)}
              >
                {diff.toUpperCase()}
              </GlassButton>
            ))}
          </div>

          <p
            className="text-glow-cyan"
            style={{
              fontSize: W3BP0NG_THEME.typography.sizes.body_md,
              fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
            }}
          >
            {difficulty === 'easy' && '90 BPM • 60s'}
            {difficulty === 'normal' && '120 BPM • 90s'}
            {difficulty === 'hard' && '160 BPM • 120s'}
          </p>

          <div
            style={{
              display: 'flex',
              gap: W3BP0NG_THEME.spacing.md,
              flexDirection: 'column',
              width: '100%',
            }}
          >
            <GlassButton variant="primary" onClick={handleStart}>
              Start (Space)
            </GlassButton>
            <GlassButton onClick={handleExit}>Back to Menu</GlassButton>
          </div>
        </GlassPanel>
      )}

      {/* Pause */}
      {gamePhase === 'paused' && (
        <PauseOverlay onResume={handleResume} onExit={handleExit} />
      )}

      {/* Complete */}
      {gamePhase === 'complete' && gameStateRef.current && (
        <GlassPanel
          variant="elevated"
          neonAccent="magenta"
          className="animate-fadeIn"
          style={{
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
          }}
        >
          <h1
            className="text-glow-primary animate-pulseGlow"
            style={{
              fontSize: W3BP0NG_THEME.typography.sizes.heading_xl,
              fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
              margin: 0,
            }}
          >
            PERFORMANCE COMPLETE!
          </h1>

          <div style={{ fontSize: '4rem', letterSpacing: '0.5rem' }}>
            {Array.from({ length: calculateStars() }).map((_, i) => (
              <span key={i} className="text-glow-cyan">
                ★
              </span>
            ))}
            {Array.from({ length: 3 - calculateStars() }).map((_, i) => (
              <span key={i} style={{ opacity: 0.3 }}>
                ☆
              </span>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: W3BP0NG_THEME.spacing.sm,
              width: '100%',
            }}
          >
            <div
              className="text-glow-subtle"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
              }}
            >
              <span>Score:</span>
              <span className="text-glow-cyan">{displayScore.toLocaleString()}</span>
            </div>
            <div
              className="text-glow-subtle"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
              }}
            >
              <span>Accuracy:</span>
              <span className="text-glow-cyan">{calculateAccuracy()}%</span>
            </div>
            <div
              className="text-glow-subtle"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
              }}
            >
              <span>Max Combo:</span>
              <span className="text-glow-cyan">×{gameStateRef.current.combo}</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: W3BP0NG_THEME.spacing.md,
              flexDirection: 'column',
              width: '100%',
              marginTop: W3BP0NG_THEME.spacing.lg,
            }}
          >
            <GlassButton variant="primary" onClick={handleRetry}>
              Retry
            </GlassButton>
            <GlassButton onClick={handleExit}>Exit to Menu</GlassButton>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}

export default RhythmMode;
