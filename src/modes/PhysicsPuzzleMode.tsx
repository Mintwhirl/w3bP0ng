/**
 * PhysicsPuzzleMode Component
 * Portal-based physics puzzles with breakout-style gameplay
 * Follows W3BP0NG liquid glass synthwave aesthetic
 * Optimized with centralized ticker and robust save management
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
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
import { getLevel, LEVELS } from './physics-puzzle/levels';
import { loadLevel } from './level-editor/LevelData';
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
import { updatePuzzleProgress, loadSaveData } from '../utils/saveManager';
import { checkAchievements } from '../core/achievements';
import { ticker, TickerGroup } from '../engine/EngineTicker';
import { setAudioTheme } from '../audio/AudioEngine';
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
  const keysPressed = useRef<Set<string>>(new Set());

  // ═══════════════════════════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════════════════════════
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [levelSource, setLevelSource] = useState<LevelSource>('builtin');
  const [gamePhase, setGamePhase] = useState<GamePhase>('menu');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [displayHits, setDisplayHits] = useState(0);
  const [earnedStars, setEarnedStars] = useState<0 | 1 | 2 | 3>(0);
  const [totalStars, setTotalStars] = useState(0);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [levelStars, setLevelStars] = useState<Record<string, number>>({});

  // Load current level (builtin or custom)
  const currentLevel = useMemo(() => 
    levelSource === 'custom'
      ? loadLevel('Imported')?.levelData // Simplified for now
      : getLevel(currentLevelId),
    [levelSource, currentLevelId]
  );

  // ═══════════════════════════════════════════════════════════
  // LOAD PROGRESS
  // ═══════════════════════════════════════════════════════════
  const refreshProgress = useCallback(() => {
    const saveData = loadSaveData();
    setTotalStars(saveData.puzzleProgress.totalStars);
    setUnlockedLevels(saveData.puzzleProgress.unlockedLevels);
    setLevelStars(saveData.puzzleProgress.levelStars);
  }, []);

  // Sync music with game phase
  useEffect(() => {
    if (gamePhase === 'playing') {
      setAudioTheme('puzzle');
    } else if (gamePhase === 'paused' || gamePhase === 'complete') {
      setAudioTheme('none');
    } else {
      setAudioTheme('main');
    }

    return () => {
      if (gamePhase === 'playing') setAudioTheme('none');
    };
  }, [gamePhase]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  // ═══════════════════════════════════════════════════════════
  // INITIALIZE GAME STATE
  // ═══════════════════════════════════════════════════════════
  const initializeLevel = useCallback(() => {
    if (!canvasRef.current || !currentLevel) return;

    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

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
      blocks: [...currentLevel.blocks.map(b => ({ ...b }))], // Deep copy blocks
      portals: [...currentLevel.portals.map(p => ({ ...p }))],
      bouncePads: currentLevel.bouncePads ? [...currentLevel.bouncePads] : [],
      gravityZones: currentLevel.gravityZones ? [...currentLevel.gravityZones] : [],
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
  }, [currentLevel]);

  // ═══════════════════════════════════════════════════════════
  // TICKER INTEGRATION (GAME LOOP)
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    initializeLevel();
    const id = `puzzle-loop-${Math.random().toString(36).substr(2, 9)}`;
    
    // Small delay to ensure initializeLevel has finished and ref is populated
    const timer = setTimeout(() => {
      ticker.register(id, (currentTime, deltaTime) => {
        if (!gameStateRef.current || !canvasRef.current) return;
        const state = gameStateRef.current;

        // Update elapsed time
        if (state.gameStarted) {
          state.elapsedTime += deltaTime / 1000;
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
          deltaTime / 16.67 // Scale to standard frame
        );

        // Update balls
        state.balls.forEach((ball, index) => {
          if (!state.gameStarted) {
            ball.x = state.paddle.x;
            ball.y = state.paddle.y - state.paddle.height / 2 - ball.radius - 2;
            return;
          }

          state.balls[index] = updateBallPosition(ball, state.gravityZones, deltaTime / 16.67);
          state.balls[index] = checkWallCollisions(ball, state.canvas.width, state.canvas.height);

          if (isBallOutOfBounds(ball, state.canvas.height)) {
            ball.active = false;
          }

          const paddleHit = checkPaddleCollision(ball, state.paddle);
          if (paddleHit.collided) {
            state.balls[index] = applyPaddleBounce(ball, state.paddle);
            state.hits++;
            setDisplayHits(state.hits);
          }

          for (let i = 0; i < state.blocks.length; i++) {
            const block = state.blocks[i];
            if (!block || !block.active) continue;

            const blockHit = checkBlockCollision(ball, block);
            if (blockHit.collided && blockHit.normal) {
              if (block.type === 'swapper') {
                state.balls[index] = handleSwapperCollision(ball, block);
                state.balls[index] = applyBlockBounce(state.balls[index], blockHit.normal);
                state.blocks[i] = damageBlock(block);
              } else {
                state.balls[index] = applyBlockBounce(ball, blockHit.normal);
                const damagedBlock = damageBlock(block);
                state.blocks[i] = damagedBlock;
                if (!damagedBlock.active) {
                  state.score += (block.type === 'target' ? 500 : 100);
                  setDisplayScore(state.score);
                }
              }
              break;
            }
          }

          const portalResult = checkPortalCollision(ball, state.portals, currentTime);
          if (portalResult.teleported) {
            state.balls[index] = applyPortalTeleport(ball, portalResult, currentTime);
          }

          const bouncePad = checkBouncePadCollision(ball, state.bouncePads);
          if (bouncePad) {
            state.balls[index] = applyBouncePadEffect(ball, bouncePad);
          }
        });

        state.balls = state.balls.filter(b => b.active);

        // Check level complete
        if (checkLevelComplete(state)) {
          const stars = calculateStars(state);
          setEarnedStars(stars);
          updatePuzzleProgress(currentLevelId, stars);
          checkAchievements();
          refreshProgress();
          setGamePhase('complete');
          return;
        }

        // Check failure
        if (state.balls.length === 0 && state.gameStarted) {
          state.levelFailed = true;
          setGamePhase('menu');
        }

        // Render
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) renderPuzzleGame(ctx, state, currentTime);
      }, TickerGroup.GAME);
    }, 50);

    return () => {
      clearTimeout(timer);
      ticker.unregister(id);
    };
  }, [gamePhase, currentLevelId, refreshProgress, initializeLevel]);

  // ═══════════════════════════════════════════════════════════
  // CONTROLS
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      if (e.key === 'Escape' && gamePhase === 'playing') setGamePhase('paused');
      if (e.key === ' ' && gamePhase === 'playing' && gameStateRef.current) {
        gameStateRef.current.gameStarted = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gamePhase]);

  // ═══════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════
  const handleStartLevel = () => { setGamePhase('playing'); };
  const handleResume = () => { setGamePhase('playing'); };
  const handleRetry = () => { setGamePhase('menu'); };
  
  const handleExit = () => {
    ticker.resumeGroup(TickerGroup.GAME);
    returnToMenu();
  };

  const handleNextLevel = () => {
    const nextLevelId = currentLevelId + 1;
    if (getLevel(nextLevelId)) {
      setCurrentLevelId(nextLevelId);
      setGamePhase('menu');
    } else {
      handleExit();
    }
  };

  const handleSelectLevel = (id: number) => {
    if (id <= unlockedLevels) {
      setCurrentLevelId(id);
      setLevelSource('builtin');
      setGamePhase('menu');
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  if (!currentLevel) {
    return <div className="cosmic-bg full-bleed">Level Not Found</div>;
  }

  return (
    <div className="physics-puzzle-mode cosmic-bg full-bleed">
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="game-canvas"
        style={{ display: gamePhase === 'playing' || gamePhase === 'paused' ? 'block' : 'none' }}
      />

      {/* HUD */}
      {(gamePhase === 'playing' || gamePhase === 'paused') && (
        <>
          <ScoreDisplay label="SCORE" value={displayScore} position="left" neonAccent="magenta" />
          <TimerDisplay time={displayTime} label="TIME" />
          <StatsDisplay
            position="top-right"
            stats={[
              { label: 'Level', value: currentLevelId },
              { label: 'Hits', value: displayHits },
              { label: 'Total Stars', value: totalStars },
            ]}
          />
        </>
      )}

      {/* Level Selection Menu */}
      {gamePhase === 'menu' && (
        <GlassPanel variant="elevated" neonAccent="magenta" className="level-menu animate-slideUp">
          <h1 className="text-glow-primary">{currentLevel.name}</h1>
          <p className="text-glow-subtle">{currentLevel.description}</p>

          <div className="level-grid">
            {LEVELS.map((level) => {
              const isUnlocked = level.id <= unlockedLevels;
              const stars = levelStars[level.id.toString()] || 0;
              
              return (
                <button
                  key={level.id}
                  onClick={() => handleSelectLevel(level.id)}
                  className={`level-card ${isUnlocked ? 'unlocked' : 'locked'} ${currentLevelId === level.id ? 'active' : ''}`}
                  disabled={!isUnlocked}
                  aria-label={`Level ${level.id}: ${level.name}. ${isUnlocked ? `${stars} stars earned` : 'Locked'}`}
                >
                  <span className="level-number">{level.id}</span>
                  {isUnlocked ? (
                    <div className="level-stars">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={i < stars ? 'star-filled' : 'star-empty'}>
                          {i < stars ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="lock-icon">🔒</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="menu-actions">
            <GlassButton variant="primary" onClick={handleStartLevel} size="large">
              START MISSION
            </GlassButton>
            <GlassButton onClick={handleExit}>ABORT</GlassButton>
          </div>
        </GlassPanel>
      )}

      {gamePhase === 'paused' && <PauseOverlay onResume={handleResume} onExit={handleExit} />}

      {/* Completion Screen */}
      {gamePhase === 'complete' && (
        <GlassPanel variant="elevated" neonAccent="cyan" className="completion-panel animate-fadeIn">
          <h1 className="text-glow-primary animate-pulseGlow">OBJECTIVE COMPLETE</h1>
          
          <div className="earned-stars">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={i < earnedStars ? 'star-pop' : 'star-dim'}>
                {i < earnedStars ? '★' : '☆'}
              </span>
            ))}
          </div>

          <div className="final-stats">
            <div className="stat-row"><span>Final Score</span><span className="val">{displayScore}</span></div>
            <div className="stat-row"><span>Time Taken</span><span className="val">{displayTime.toFixed(1)}s</span></div>
            <div className="stat-row"><span>Total Hits</span><span className="val">{displayHits}</span></div>
          </div>

          <div className="menu-actions">
            <GlassButton variant="primary" onClick={handleNextLevel}>NEXT SECTOR</GlassButton>
            <GlassButton onClick={handleRetry}>RETRY</GlassButton>
            <GlassButton onClick={handleExit}>EXIT</GlassButton>
          </div>
        </GlassPanel>
      )}

      <style>{`
        .level-menu, .completion-panel {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          min-width: 500px;
          padding: 40px !important;
          text-align: center;
        }
        .level-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
          margin: 30px 0;
        }
        .level-card {
          aspect-ratio: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: white;
        }
        .level-card.unlocked:hover {
          background: rgba(168, 85, 247, 0.2);
          border-color: #a855f7;
          transform: translateY(-5px);
        }
        .level-card.active {
          border-color: #00ffff;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
          background: rgba(0, 255, 255, 0.1);
        }
        .level-card.locked {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(0, 0, 0, 0.3);
        }
        .level-number {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem;
          font-weight: bold;
        }
        .level-stars {
          font-size: 0.8rem;
          color: #f59e0b;
          margin-top: 5px;
        }
        .star-filled { color: #f59e0b; text-shadow: 0 0 5px #f59e0b; }
        .menu-actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
          width: 100%;
        }
        .earned-stars {
          font-size: 5rem;
          margin: 20px 0;
          display: flex;
          gap: 10px;
        }
        .star-pop {
          color: #00ffff;
          text-shadow: 0 0 20px #00ffff;
          animation: achievementPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .star-dim { opacity: 0.2; color: white; }
        .final-stats {
          width: 100%;
          margin-bottom: 30px;
        }
        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 1.1rem;
        }
        .stat-row .val { color: #00ffff; font-family: 'JetBrains Mono', monospace; }
      `}</style>
    </div>
  );
}

export default PhysicsPuzzleMode;
