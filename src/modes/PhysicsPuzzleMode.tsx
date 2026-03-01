/**
 * PhysicsPuzzleMode Component
 * Portal-based physics puzzles with breakout-style gameplay
 * Follows W3BP0NG liquid glass synthwave aesthetic
 */

import { W3BP0NG_THEME } from '../../w3bp0ng-theme.config';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import {
  GlassPanel,
  ScoreDisplay,
  TimerDisplay,
  GlassButton,
  PauseOverlay,
  StatsDisplay,
} from '../ui/GlassHUD';
import { renderPuzzleGame } from './physics-puzzle/PuzzleRenderer';
import { getLevel } from './physics-puzzle/levels';
import { listLevels, loadLevel, type CustomLevel } from './level-editor/LevelData';
import {
  updatePaddlePosition,
  updateBallPosition,
  checkWallCollisions,
  isBallOutOfBounds,
  checkPaddleCollision,
  applyPaddleBounce,
  checkBlockCollision,
  applyBlockBounce,
  damageBlock,
  checkPortalCollision,
  applyPortalTeleport,
  checkBouncePadCollision,
  applyBouncePadEffect,
  checkLevelComplete,
  calculateStars,
  createInitialBall,
  createPaddle,
  handleSwapperCollision,
} from './physics-puzzle/PhysicsPuzzleEngine';
import { loadPuzzleProgress, savePuzzleProgress } from '../utils/storage';
import type { PuzzleGameState } from './physics-puzzle/types';
import '../styles/glassmorphism.css';

type GamePhase = 'menu' | 'playing' | 'paused' | 'complete';
type LevelSource = 'builtin' | 'custom';

export function PhysicsPuzzleMode() {
  // ═══════════════════════════════════════════════════════════
  // GLOBAL STATE & THEME
  // ═══════════════════════════════════════════════════════════
  const returnToMenu = useGameStore((state) => state.returnToMenu);

  // ═══════════════════════════════════════════════════════════
  // REFS
  // ═══════════════════════════════════════════════════════════
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<PuzzleGameState | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastFrameTime = useRef<number>(0);

  // ═══════════════════════════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════════════════════════
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [levelSource, setLevelSource] = useState<LevelSource>('builtin');
  const [customLevelName, setCustomLevelName] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('menu');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [displayHits, setDisplayHits] = useState(0);
  const [earnedStars, setEarnedStars] = useState<0 | 1 | 2 | 3>(0);
  const [totalStars, setTotalStars] = useState(0);
  const [availableCustomLevels, setAvailableCustomLevels] = useState<string[]>([]);

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
    if (!canvasRef.current || !currentLevel) return;

    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    // Create game state
    const initialBallSpeed = currentLevel.ballSpeed || 5;
    const ballCount = currentLevel.ballCount || 1;

    const balls = Array.from({ length: ballCount }, () =>
      createInitialBall(width, height, initialBallSpeed)
    );

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
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());

      if (e.key === 'Escape' && gamePhase === 'playing') {
        setGamePhase('paused');
      }

      if (e.key === ' ' && gamePhase === 'playing' && gameStateRef.current) {
        gameStateRef.current.gameStarted = true;
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
    if (!gameStateRef.current || !canvasRef.current) return;

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
    state.paddle = updatePaddlePosition(
      state.paddle,
      leftPressed,
      rightPressed,
      state.canvas.width,
      deltaTime
    );

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
        if (!block) continue;

        const blockHit = checkBlockCollision(ball, block);

        if (blockHit.collided && blockHit.normal) {
          // Handle swapper blocks first
          if (block.type === 'swapper') {
            state.balls[index] = handleSwapperCollision(ball, block);
            // Apply bounce after swapper effect
            state.balls[index] = applyBlockBounce(state.balls[index], blockHit.normal);
            const damagedBlock = damageBlock(block);
            state.blocks[i] = damagedBlock;
          } else {
            // Normal block handling
            state.balls[index] = applyBlockBounce(ball, blockHit.normal);
            const damagedBlock = damageBlock(block);
            state.blocks[i] = damagedBlock;

            // Add score for destroyed blocks
            if (!damagedBlock.active) {
              const points = block.type === 'target' ? 500 : 100;
              state.score += points;
              setDisplayScore(state.score);
            }
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
    renderPuzzleGame(canvasRef.current.getContext('2d')!, state, currentTime);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [currentLevelId]);

  // Start/stop game loop based on phase
  useEffect(() => {
    if (gamePhase === 'playing') {
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
      } else {
        // Switch back to builtin levels
        setLevelSource('builtin');
        setCurrentLevelId(1);
        setCustomLevelName(null);
        setGamePhase('menu');
      }
    } else {
      const nextLevelId = currentLevelId + 1;
      if (getLevel(nextLevelId)) {
        setCurrentLevelId(nextLevelId);
        setGamePhase('menu');
      } else if (availableCustomLevels.length > 0) {
        // Switch to custom levels
        setLevelSource('custom');
        setCustomLevelName(availableCustomLevels[0]);
        setGamePhase('menu');
      }
    }
  };

  const handleSelectCustomLevel = (levelName: string) => {
    setCustomLevelName(levelName);
    setLevelSource('custom');
    setGamePhase('menu');
  };

  const handleSelectBuiltinLevel = (levelId: number) => {
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
    return (
      <div className="cosmic-bg" style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <GlassPanel variant="elevated" neonAccent="magenta">
          <h2 className="text-glow-primary">Level not found</h2>
          <GlassButton onClick={handleExit}>Back to Menu</GlassButton>
        </GlassPanel>
      </div>
    );
  }

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
      {(gamePhase === 'playing' || gamePhase === 'paused') && (
        <>
          <ScoreDisplay
            label="SCORE"
            value={displayScore}
            position="left"
            neonAccent="magenta"
          />
          <TimerDisplay
            time={displayTime}
            label="TIME"
            format="seconds"
          />
          <StatsDisplay
            position="top-right"
            stats={[
              { label: 'Level', value: currentLevelId },
              { label: 'Hits', value: displayHits },
              { label: 'Total ★', value: totalStars },
            ]}
          />
        </>
      )}

      {/* Level Menu */}
      {gamePhase === 'menu' && (
        <GlassPanel
          variant="elevated"
          neonAccent="magenta"
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
            className="text-glow-primary"
            style={{
              fontSize: W3BP0NG_THEME.typography.sizes.heading_xl,
              fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
              margin: 0,
              letterSpacing: '0.1em',
            }}
          >
            {currentLevel.name}
          </h1>

          <p
            className="text-glow-subtle"
            style={{
              fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
              fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
              textAlign: 'center',
              margin: 0,
              maxWidth: '400px',
            }}
          >
            {currentLevel.description}
          </p>

          {/* Level Source Selection */}
          <div
            style={{
              display: 'flex',
              gap: W3BP0NG_THEME.spacing.md,
              marginBottom: W3BP0NG_THEME.spacing.lg,
            }}
          >
            <GlassButton
              onClick={() => handleSelectBuiltinLevel(1)}
              className={levelSource === 'builtin' ? 'active' : ''}
              neonAccent="cyan"
            >
              🏗️ Built-in Levels
            </GlassButton>
            <GlassButton
              onClick={() => availableCustomLevels.length > 0 && handleSelectCustomLevel(availableCustomLevels[0])}
              className={levelSource === 'custom' ? 'active' : ''}
              neonAccent="magenta"
              disabled={availableCustomLevels.length === 0}
            >
              🛠️ Custom Levels ({availableCustomLevels.length})
            </GlassButton>
          </div>

          {/* Level Selection */}
          {levelSource === 'builtin' ? (
            <div
              style={{
                display: 'flex',
                gap: W3BP0NG_THEME.spacing.sm,
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginBottom: W3BP0NG_THEME.spacing.lg,
              }}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((levelId) => {
                const level = getLevel(levelId);
                if (!level) return null;

                return (
                  <GlassButton
                    key={levelId}
                    onClick={() => handleSelectBuiltinLevel(levelId)}
                    className={currentLevelId === levelId ? 'active' : ''}
                    neonAccent="cyan"
                    size="small"
                    style={{ minWidth: '60px' }}
                  >
                    {levelId}
                  </GlassButton>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: W3BP0NG_THEME.spacing.sm,
                maxHeight: '200px',
                overflowY: 'auto',
                marginBottom: W3BP0NG_THEME.spacing.lg,
                width: '100%',
              }}
            >
              {availableCustomLevels.map((levelName) => (
                <GlassButton
                  key={levelName}
                  onClick={() => handleSelectCustomLevel(levelName)}
                  className={customLevelName === levelName ? 'active' : ''}
                  neonAccent="magenta"
                  style={{ justifyContent: 'flex-start' }}
                >
                  📝 {levelName}
                </GlassButton>
              ))}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: W3BP0NG_THEME.spacing.sm,
              fontSize: '2rem',
            }}
          >
            {Array.from({ length: currentLevel?.difficulty || 1 }).map((_, i) => (
              <span key={i} className="text-glow-cyan">
                ◆
              </span>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: W3BP0NG_THEME.spacing.md,
              flexDirection: 'column',
              width: '100%',
            }}
          >
            <GlassButton variant="primary" onClick={handleStartLevel}>
              Start Level
            </GlassButton>
            <GlassButton onClick={handleExit}>Back to Menu</GlassButton>
          </div>
        </GlassPanel>
      )}

      {/* Pause Overlay */}
      {gamePhase === 'paused' && (
        <PauseOverlay onResume={handleResume} onExit={handleExit} />
      )}

      {/* Level Complete */}
      {gamePhase === 'complete' && (
        <GlassPanel
          variant="elevated"
          neonAccent="cyan"
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
            LEVEL COMPLETE!
          </h1>

          <div style={{ fontSize: '4rem', letterSpacing: '0.5rem' }}>
            {Array.from({ length: earnedStars }).map((_, i) => (
              <span key={i} className="text-glow-cyan">
                ★
              </span>
            ))}
            {Array.from({ length: 3 - earnedStars }).map((_, i) => (
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
              <span className="text-glow-cyan">{displayScore}</span>
            </div>
            <div
              className="text-glow-subtle"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
              }}
            >
              <span>Time:</span>
              <span className="text-glow-cyan">{displayTime.toFixed(1)}s</span>
            </div>
            <div
              className="text-glow-subtle"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
              }}
            >
              <span>Hits:</span>
              <span className="text-glow-cyan">{displayHits}</span>
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
            {getLevel(currentLevelId + 1) && (
              <GlassButton variant="primary" onClick={handleNextLevel}>
                Next Level
              </GlassButton>
            )}
            <GlassButton onClick={handleRetry}>Retry Level</GlassButton>
            <GlassButton onClick={handleExit}>Exit to Menu</GlassButton>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}

export default PhysicsPuzzleMode;
