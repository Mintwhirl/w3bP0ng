/**
 * RhythmMode Component
 * Beat-synchronized Pong with combo system
 * Optimized with centralized ticker, responsive sizing, and audio integration
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import {
  GlassPanel,
  ScoreDisplay,
  StatsDisplay,
  GlassButton,
  PauseOverlay,
} from '../ui/GlassHUD';
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
import { ticker, TickerGroup } from '../engine/EngineTicker';
import { updateRhythmScore, loadSaveData } from '../utils/saveManager';
import { checkAchievements } from '../core/achievements';
import { isAudioReady } from '../audio/AudioEngine';
import { AudioManager } from '../audio/AudioManager';
import type { RhythmGameState } from './rhythm-mode/types';
import '../styles/glassmorphism.css';

type GamePhase = 'menu' | 'playing' | 'paused' | 'complete';
type Difficulty = 'easy' | 'normal' | 'hard';

export function RhythmMode() {
  const returnToMenu = useGameStore((state) => state.returnToMenu);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<RhythmGameState | null>(null);
  const beatSyncRef = useRef<BeatSync | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [gamePhase, setGamePhase] = useState<GamePhase>('menu');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayCombo, setDisplayCombo] = useState(0);
  const [lastHitRating, setLastHitRating] = useState<{ rating: string; id: number } | null>(null);
  const [highScore, setHighScore] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(isAudioReady());

  // Initialize AudioManager
  useEffect(() => {
    const manager = new AudioManager();
    manager.initialize();
    audioManagerRef.current = manager;
  }, []);

  // Poll for audio unlock
  useEffect(() => {
    if (audioUnlocked) return;
    const interval = setInterval(() => {
      if (isAudioReady()) {
        setAudioUnlocked(true);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [audioUnlocked]);

  // Load high score
  useEffect(() => {
    const data = loadSaveData();
    const currentTrack = createDefaultTrack(difficulty);
    setHighScore(data.rhythmProgress.highScores[currentTrack.id] || 0);
  }, [difficulty]);

  const updateCanvasSize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const { width, height } = container.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    
    if (gameStateRef.current) {
      gameStateRef.current.canvas.width = width;
      gameStateRef.current.canvas.height = height;
    }
  }, []);

  const initializeGame = useCallback(() => {
    if (!containerRef.current) return;
    
    // Ensure size is set before state creation
    updateCanvasSize();
    const { width, height } = containerRef.current.getBoundingClientRect();

    const track = createDefaultTrack(difficulty);
    beatSyncRef.current = new BeatSync(track.bpm, track.duration);
    gameStateRef.current = createInitialRhythmState(width, height, track);
    
    setDisplayScore(0);
    setDisplayCombo(0);
    setLastHitRating(null);
  }, [difficulty, updateCanvasSize]);

  // Handle Resize
  useEffect(() => {
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  // Ticker management
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    // Use requestAnimationFrame to ensure container has rendered its actual size
    const initId = requestAnimationFrame(() => {
      initializeGame();
      
      const tickerId = `rhythm-loop-${Math.random().toString(36).substr(2, 9)}`;
      
      ticker.register(tickerId, (_currentTime, deltaTime) => {
        const state = gameStateRef.current;
        const beatSync = beatSyncRef.current;
        const canvas = canvasRef.current;
        if (!state || !beatSync || !canvas) return;

        // Update elapsed time
        state.elapsedTime += deltaTime;

        const beatProgress = beatSync.getBeatProgress(state.elapsedTime);
        const currentBeat = beatSync.getCurrentBeat(state.elapsedTime);

        // Controls
        const upPressed = keysPressed.current.has('w') || keysPressed.current.has('arrowup');
        const downPressed = keysPressed.current.has('s') || keysPressed.current.has('arrowdown');
        state.paddle = updatePaddle(state.paddle, upPressed, downPressed, canvas.height, deltaTime / 16.67);

        // Physics
        state.ball = updateBall(state.ball, deltaTime / 16.67);
        state.ball = checkWallCollisions(state.ball, canvas.width, canvas.height);

        // Hit processing
        if (checkPaddleCollision(state.ball, state.paddle)) {
          const accuracy = beatSync.checkHitTiming(state.elapsedTime, currentBeat);
          const newState = processHit(state, accuracy);
          newState.ball = applyPaddleBounce(newState.ball, newState.paddle);
          gameStateRef.current = newState;
          
          setDisplayScore(newState.score);
          setDisplayCombo(newState.combo);
          setLastHitRating({ rating: accuracy.toUpperCase(), id: Date.now() });

          // Play Audio
          if (accuracy === 'perfect') {
            audioManagerRef.current?.playPowerUp(); // Use powerup sound for perfect hits
          } else if (accuracy === 'good') {
            audioManagerRef.current?.playPaddleHit(8);
          }
        }

        // Miss processing
        if (state.ball.x + state.ball.radius < 0) {
          state.ball = resetBall(canvas.width, canvas.height);
          state.combo = 0;
          state.missedBeats = (state.missedBeats || 0) + 1;
          setDisplayCombo(0);
          setLastHitRating({ rating: 'MISS', id: Date.now() });
          
          audioManagerRef.current?.playScore(); // Miss sound
        }

        // Track completion
        if (state.elapsedTime >= state.track.duration * 1000) {
          updateRhythmScore(state.track.id, state.score, state.combo);
          checkAchievements();
          setGamePhase('complete');
          audioManagerRef.current?.playVictory();
          return;
        }

        // Render
        const ctx = canvas.getContext('2d');
        if (ctx) renderRhythmGame(ctx, state, beatProgress);
      }, TickerGroup.GAME);

      return () => ticker.unregister(tickerId);
    });

    return () => cancelAnimationFrame(initId);
  }, [gamePhase, initializeGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      if (e.key === 'Escape' && gamePhase === 'playing') setGamePhase('paused');
      if (e.key === ' ' && gamePhase === 'menu' && audioUnlocked) {
        setGamePhase('playing');
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gamePhase, audioUnlocked]);

  const handleStart = () => {
    setGamePhase('playing');
  };

  const handleExit = () => { 
    ticker.resumeGroup(TickerGroup.GAME); 
    returnToMenu(); 
  };

  const calculateAccuracy = () => {
    if (!gameStateRef.current) return 0;
    const { perfectHits, goodHits, missedBeats } = gameStateRef.current;
    const total = perfectHits + goodHits + missedBeats;
    return total === 0 ? 0 : Math.round(((perfectHits + goodHits) / total) * 100);
  };

  return (
    <div className="rhythm-mode-container" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className="rhythm-canvas"
        style={{ display: gamePhase === 'playing' || gamePhase === 'paused' ? 'block' : 'none' }} 
      />

      {/* HUD */}
      {(gamePhase === 'playing' || gamePhase === 'paused') && gameStateRef.current && (
        <div className="rhythm-hud">
          <ScoreDisplay label="SCORE" value={displayScore} position="left" neonAccent="cyan" />
          <div className="combo-container">
            <span className="combo-value">×{displayCombo}</span>
            <span className="combo-label">COMBO</span>
          </div>
          {lastHitRating && (
            <div key={lastHitRating.id} className={`hit-rating ${lastHitRating.rating.toLowerCase()}`}>
              {lastHitRating.rating}
            </div>
          )}
          <StatsDisplay position="top-right" stats={[
            { label: 'Perfect', value: gameStateRef.current.perfectHits },
            { label: 'Good', value: gameStateRef.current.goodHits },
            { label: 'High Score', value: highScore },
          ]} />
        </div>
      )}

      {/* Menu */}
      {gamePhase === 'menu' && (
        <div className="overlay-wrapper">
          <GlassPanel variant="elevated" neonAccent="cyan" className="rhythm-menu animate-slideUp">
            <h1 className="text-glow-primary">RHYTHM BEATS</h1>
            <p className="text-glow-subtle">Sync your hits with the pulse</p>
            
            <div className="difficulty-sel">
              {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
                <GlassButton key={d} variant={difficulty === d ? 'primary' : 'secondary'} onClick={() => setDifficulty(d)}>
                  {d.toUpperCase()}
                </GlassButton>
              ))}
            </div>
            
            <p className="track-info">
              {difficulty === 'easy' && 'Chill Vibes • 90 BPM'}
              {difficulty === 'normal' && 'Synth Pulse • 120 BPM'}
              {difficulty === 'hard' && 'Cyber Overdrive • 160 BPM'}
            </p>

            <div className="menu-actions">
              {!audioUnlocked ? (
                <p className="audio-warning">Please click anywhere to enable audio first</p>
              ) : (
                <GlassButton variant="primary" onClick={handleStart} size="large">
                  START PERFORMANCE
                </GlassButton>
              )}
              <GlassButton onClick={handleExit}>EXIT</GlassButton>
            </div>
          </GlassPanel>
        </div>
      )}

      {gamePhase === 'paused' && <PauseOverlay onResume={() => setGamePhase('playing')} onExit={handleExit} />}

      {/* Complete */}
      {gamePhase === 'complete' && gameStateRef.current && (
        <div className="overlay-wrapper">
          <GlassPanel variant="elevated" neonAccent="magenta" className="completion-panel animate-fadeIn">
            <h1 className="text-glow-primary">PERFORMANCE COMPLETE</h1>
            <div className="final-stats">
              <div className="stat-row"><span>Final Score</span><span className="val">{displayScore.toLocaleString()}</span></div>
              <div className="stat-row"><span>Accuracy</span><span className="val">{calculateAccuracy()}%</span></div>
              <div className="stat-row"><span>Max Combo</span><span className="val">×{gameStateRef.current.combo}</span></div>
            </div>
            <div className="menu-actions">
              <GlassButton variant="primary" onClick={handleStart}>REPLAY</GlassButton>
              <GlassButton onClick={handleExit}>EXIT</GlassButton>
            </div>
          </GlassPanel>
        </div>
      )}

      <style>{`
        .rhythm-mode-container {
          width: 100%;
          height: 100%;
          position: relative;
          background: #0b001a;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rhythm-canvas {
          max-width: 100%;
          max-height: 100%;
          box-shadow: 0 0 40px rgba(168, 85, 247, 0.2);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 8px;
        }
        .overlay-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 100;
        }
        .overlay-wrapper > * {
          pointer-events: auto;
        }
        .combo-container {
          position: absolute;
          left: 50%;
          top: 100px;
          transform: translateX(-50%);
          text-align: center;
          pointer-events: none;
        }
        .combo-value {
          display: block;
          font-family: 'Orbitron', sans-serif;
          font-size: 3rem;
          color: #00ffff;
          text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }
        .combo-label { font-size: 0.8rem; letter-spacing: 4px; opacity: 0.7; }
        .hit-rating {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Orbitron', sans-serif;
          font-size: 4rem;
          font-weight: bold;
          pointer-events: none;
          animation: hitRatingPop 0.5s ease-out forwards;
        }
        .perfect { color: #00ffff; text-shadow: 0 0 20px #00ffff; }
        .good { color: #a855f7; text-shadow: 0 0 15px #a855f7; }
        .miss { color: #ef4444; text-shadow: 0 0 15px #ef4444; }
        @keyframes hitRatingPop {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -150%) scale(1); opacity: 0; }
        }
        .difficulty-sel { display: flex; gap: 15px; margin: 25px 0; justify-content: center; }
        .track-info { color: #00ffff; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; text-align: center; }
        .audio-warning { color: #f87171; margin-bottom: 20px; font-size: 0.9rem; font-weight: bold; text-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
        .rhythm-menu, .completion-panel { 
          padding: 40px !important; 
          text-align: center;
          min-width: 450px;
        }
        .menu-actions { display: flex; flex-direction: column; gap: 15px; }
        .final-stats { margin: 20px 0; }
        .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .stat-row .val { color: #00ffff; font-family: 'JetBrains Mono', monospace; }
      `}</style>
    </div>
  );
}

export default RhythmMode;
