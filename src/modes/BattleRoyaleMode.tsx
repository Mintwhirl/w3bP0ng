/**
 * BattleRoyaleMode Component
 * 8-player elimination with BeatSync-integrated dynamic tempo finale
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
import { renderBattleRoyale, createRenderState } from './battle-royale/BattleRoyaleRenderer';
import { BeatSync } from './rhythm-mode/BeatSync';
import {
  createInitialBattleRoyaleState,
  updateBattleRoyaleState,
  getCurrentBPM,
  isInFinalePhase,
  getFinaleIntensity,
} from './battle-royale/BattleRoyaleEngine';
import type { BattleRoyaleState } from './battle-royale/types';
import '../styles/glassmorphism.css';

type GamePhase = 'menu' | 'playing' | 'paused' | 'complete';

export function BattleRoyaleMode() {
  // ═══════════════════════════════════════════════════════════
  // GLOBAL STATE
  // ═══════════════════════════════════════════════════════════
  const returnToMenu = useGameStore((state) => state.returnToMenu);

  // ═══════════════════════════════════════════════════════════
  // REFS
  // ═══════════════════════════════════════════════════════════
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<BattleRoyaleState | null>(null);
  const beatSyncRef = useRef<BeatSync | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastFrameTime = useRef<number>(0);

  // ═══════════════════════════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════════════════════════
  const [gamePhase, setGamePhase] = useState<GamePhase>('menu');
    const [playersAlive, setPlayersAlive] = useState(8);
  const [currentBPM, setCurrentBPM] = useState(100);
  const [finaleIntensity, setFinaleIntensity] = useState(0.3);

  // ═══════════════════════════════════════════════════════════
  // INITIALIZE GAME
  // ═══════════════════════════════════════════════════════════
  const initializeGame = useCallback(() => {
    try {
      if (!canvasRef.current) {
        console.error('[BattleRoyaleMode] Canvas reference not available');
        return;
      }

      const canvas = canvasRef.current;

      // Validate canvas dimensions
      if (!canvas.width || !canvas.height || canvas.width <= 0 || canvas.height <= 0) {
        console.error('[BattleRoyaleMode] Invalid canvas dimensions:', { width: canvas.width, height: canvas.height });
        return;
      }

      // Create beat sync with initial tempo (100 BPM)
      try {
        beatSyncRef.current = new BeatSync(100, 180); // 3 minute max duration
      } catch (error) {
        console.error('[BattleRoyaleMode] Failed to create BeatSync:', error);
        return;
      }

      // Create initial game state
      try {
        gameStateRef.current = createInitialBattleRoyaleState(canvas.width, canvas.height);
      } catch (error) {
        console.error('[BattleRoyaleMode] Failed to create initial game state:', error);
        return;
      }

      // Validate game state was created successfully
      if (!gameStateRef.current || !gameStateRef.current.players || gameStateRef.current.players.length === 0) {
        throw new Error('[BattleRoyaleMode] Failed to create valid game state');
      }

      setPlayersAlive(8);
      setCurrentBPM(100);
      setFinaleIntensity(0.3);
      lastFrameTime.current = performance.now();

      console.log('[BattleRoyaleMode] Game initialized successfully', {
        canvasSize: { width: canvas.width, height: canvas.height },
        playerCount: gameStateRef.current.players.length,
        initialBPM: 100
      });
    } catch (error) {
      console.error('[BattleRoyaleMode] Failed to initialize game:', error);
      setGamePhase('menu');
    }
  }, []);

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
    try {
      if (!gameStateRef.current || !beatSyncRef.current || !canvasRef.current) {
        console.warn('[BattleRoyaleMode] Game loop missing references');
        return;
      }

      const state = gameStateRef.current;
      const beatSync = beatSyncRef.current;
      const canvas = canvasRef.current;

      // Validate canvas context
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('[BattleRoyaleMode] Failed to get 2D context');
        return;
      }

      // Validate and calculate delta time
      if (typeof currentTime !== 'number' || currentTime <= 0 || !lastFrameTime.current) {
        console.warn('[BattleRoyaleMode] Invalid currentTime or missing lastFrameTime');
        lastFrameTime.current = currentTime || performance.now();
        return;
      }

      const deltaTime = Math.min((currentTime - lastFrameTime.current) / 16.67, 2);
      if (deltaTime < 0 || deltaTime > 10) {
        console.warn('[BattleRoyaleMode] Abnormal deltaTime:', deltaTime);
        lastFrameTime.current = currentTime;
        return;
      }
      lastFrameTime.current = currentTime;

      // Update elapsed time (ms)
      state.elapsedTime += deltaTime * 16.67;

      // Dynamic tempo progression
      try {
        const newBPM = getCurrentBPM(state.elapsedTime);
        if (typeof newBPM === 'number' && newBPM > 0 && newBPM !== beatSync.currentBPM) {
          // Update beat sync with new tempo
          beatSyncRef.current = new BeatSync(newBPM, 180);
          setCurrentBPM(newBPM);
        }
      } catch (error) {
        console.error('[BattleRoyaleMode] Failed to update tempo:', error);
      }

      // Get beat progress for visual effects
      let beatProgress = 0;
      try {
        beatProgress = beatSync.getBeatProgress(state.elapsedTime);
      } catch (error) {
        console.error('[BattleRoyaleMode] Failed to get beat progress:', error);
      }

      // Update game state
      try {
        const updatedState = updateBattleRoyaleState(state, deltaTime, beatProgress);
        if (updatedState) {
          gameStateRef.current = updatedState;

          // Update UI displays with validation
          if (updatedState.players && Array.isArray(updatedState.players)) {
            const aliveCount = updatedState.players.filter(p => p && p.alive).length;
            setPlayersAlive(aliveCount);
          }

          // Update finale intensity
          const currentFinaleIntensity = getFinaleIntensity(updatedState);
          if (typeof currentFinaleIntensity === 'number') {
            setFinaleIntensity(currentFinaleIntensity);
          }

          // Check for game completion
          if (updatedState.winner) {
            console.log('[BattleRoyaleMode] Winner determined:', updatedState.winner);
            setGamePhase('complete');
            return;
          }

          // Create render state
          const renderState = createRenderState(updatedState, beatProgress);
          if (renderState) {
            // Apply CSS transforms for dynamic effects
            applyDynamicEffects(renderState.visualEffects, canvas);

            // Render game
            renderBattleRoyale(ctx, renderState);
          }
        }
      } catch (error) {
        console.error('[BattleRoyaleMode] Failed to update game state:', error);
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } catch (error) {
      console.error('[BattleRoyaleMode] Critical error in game loop:', error);
      // Try to recover by resetting game phase
      setGamePhase('menu');
    }
  }, []);

  // Apply dynamic CSS effects (screen shake, zoom)
  const applyDynamicEffects = (effects: any, canvas: HTMLCanvasElement) => {
    const { screenShakeIntensity, cameraZoom } = effects;

    // Screen shake effect
    if (screenShakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * screenShakeIntensity * 10;
      const shakeY = (Math.random() - 0.5) * screenShakeIntensity * 10;
      canvas.style.transform = `translate(${shakeX}px, ${shakeY}px) scale(${cameraZoom})`;
    } else {
      canvas.style.transform = `scale(${cameraZoom})`;
    }
  };

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
      // Reset CSS transforms
      if (canvasRef.current) {
        canvasRef.current.style.transform = 'scale(1.0)';
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
  // ═════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════
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
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* HUD */}
      {(gamePhase === 'playing' || gamePhase === 'paused') && (
        <>
          <ScoreDisplay
            label="PLAYERS"
            value={playersAlive}
            position="left"
            neonAccent={isInFinalePhase(gameStateRef.current || {} as any) ? 'magenta' : 'cyan'}
          />
          <StatsDisplay
            position="top-right"
            stats={[
              { label: 'BPM', value: currentBPM },
              { label: 'Tempo', value: getTempoPhase(currentBPM) },
              { label: 'Intensity', value: `${Math.round(finaleIntensity * 100)}%` },
            ]}
          />
          {isInFinalePhase(gameStateRef.current || {} as any) && (
            <GlassPanel
              variant="elevated"
              neonAccent="magenta"
              className="animate-pulseGlow"
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: W3BP0NG_THEME.spacing.md,
                textAlign: 'center',
              }}
            >
              <div
                className="text-glow-primary"
                style={{
                  fontSize: W3BP0NG_THEME.typography.sizes.heading_md,
                  fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
                  margin: 0,
                }}
              >
                {gameStateRef.current?.finalePhase === 'duel' ? 'FINAL DUEL' : 'VICTORY ROYALE'}
              </div>
            </GlassPanel>
          )}
        </>
      )}

      {/* Menu */}
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
            className="text-glow-primary animate-pulseGlow"
            style={{
              fontSize: W3BP0NG_THEME.typography.sizes.heading_xl,
              fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
              margin: 0,
            }}
          >
            BATTLE ROYALE
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
            8-Player Elimination Chaos
          </p>

          <div
            className="text-glow-cyan"
            style={{
              fontSize: W3BP0NG_THEME.typography.sizes.body_md,
              fontFamily: W3BP0NG_THEME.typography.fontFamily.primary,
              textAlign: 'center',
            }}
          >
            <div>🔥 Dynamic Tempo: 100 → 160 BPM</div>
            <div>🎵 Beat-Synced Visual Effects</div>
            <div>⚡ Final Duel Intensifies</div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: W3BP0NG_THEME.spacing.md,
              flexDirection: 'column',
              width: '100%',
            }}
          >
            <GlassButton variant="primary" onClick={handleStart}>
              Start Battle (Space)
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
      {gamePhase === 'complete' && gameStateRef.current && gameStateRef.current.winner && (
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
            ROYALE VICTORY!
          </h1>

          <div style={{ fontSize: '4rem', marginBottom: W3BP0NG_THEME.spacing.lg }}>
            <span
              className="text-glow-magenta"
              style={{
                textShadow: `0 0 20px ${gameStateRef.current.winner.color}`,
              }}
            >
              👑
            </span>
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
              <span>Winner:</span>
              <span className="text-glow-cyan">Player {gameStateRef.current.winner.id + 1}</span>
            </div>
            <div
              className="text-glow-subtle"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
              }}
            >
              <span>Final Score:</span>
              <span className="text-glow-cyan">{gameStateRef.current.winner.score}</span>
            </div>
            <div
              className="text-glow-subtle"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: W3BP0NG_THEME.typography.sizes.body_lg,
              }}
            >
              <span>Max Tempo:</span>
              <span className="text-glow-cyan">{currentBPM} BPM</span>
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
              New Battle
            </GlassButton>
            <GlassButton onClick={handleExit}>Exit to Menu</GlassButton>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}

// Helper function to get tempo phase description
function getTempoPhase(bpm: number): string {
  if (bpm <= 100) return 'CALM';
  if (bpm <= 110) return 'WARMING';
  if (bpm <= 120) return 'INTENSE';
  if (bpm <= 135) return 'CHAOS';
  if (bpm <= 150) return 'FINALE';
  return 'MAXIMUM';
}

export default BattleRoyaleMode;