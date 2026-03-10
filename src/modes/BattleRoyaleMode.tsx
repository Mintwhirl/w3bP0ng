/**
 * BattleRoyaleMode Component
 * 8-player elimination with BeatSync-integrated dynamic tempo finale
 * Optimized with centralized ticker and secure save management
 */

import { W3BP0NG_THEME } from '../../w3bp0ng-theme.config';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import {
  GlassPanel,
  ScoreDisplay,
  StatsDisplay,
  GlassButton,
  PauseOverlay,
} from '../ui/GlassHUD';
import { renderBattleRoyale, createRenderState } from './battle-royale/BattleRoyaleRenderer';
import { BeatSync } from './rhythm-mode/BeatSync';
import {
  createInitialBattleRoyaleState,
  updateBattleRoyaleState,
  getCurrentBPM,
  isInFinalePhase,
  getFinaleIntensity,
} from './battle-royale/BattleRoyaleEngine';
import { updateBattleRoyaleStats, loadSaveData } from '../utils/saveManager';
import { checkAchievements } from '../core/achievements';
import { ticker, TickerGroup } from '../engine/EngineTicker';
import type { BattleRoyaleState } from './battle-royale/types';
import '../styles/glassmorphism.css';

type GamePhase = 'menu' | 'playing' | 'paused' | 'complete';

export function BattleRoyaleMode() {
  const returnToMenu = useGameStore((state) => state.returnToMenu);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<BattleRoyaleState | null>(null);
  const beatSyncRef = useRef<BeatSync | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  
  const [gamePhase, setGamePhase] = useState<GamePhase>('menu');
  const [playersAlive, setPlayersAlive] = useState(8);
  const [currentBPM, setCurrentBPM] = useState(100);
  const [finaleIntensity, setFinaleIntensity] = useState(0.3);
  const [bestKillStreak, setBestKillStreak] = useState(0);

  // Load persistence
  useEffect(() => {
    const data = loadSaveData();
    setBestKillStreak(data.battleRoyaleProgress.bestKillStreak);
  }, []);

  const initializeGame = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    beatSyncRef.current = new BeatSync(100, 180);
    gameStateRef.current = createInitialBattleRoyaleState(canvas.width, canvas.height);
    
    setPlayersAlive(8);
    setCurrentBPM(100);
    setFinaleIntensity(0.3);
  }, []);

  useEffect(() => {
    if (gamePhase !== 'playing') return;

    initializeGame();
    const id = `battle-loop-${Math.random().toString(36).substr(2, 9)}`;
    
    const unregister = ticker.register(id, (currentTime, deltaTime) => {
      if (!gameStateRef.current || !beatSyncRef.current || !canvasRef.current) return;
      const state = gameStateRef.current;
      const beatSync = beatSyncRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Update time
      state.elapsedTime += deltaTime;

      // Dynamic BPM
      const newBPM = getCurrentBPM(state.elapsedTime);
      if (newBPM !== beatSync.currentBPM) {
        beatSyncRef.current = new BeatSync(newBPM, 180);
        setCurrentBPM(newBPM);
      }

      const beatProgress = beatSync.getBeatProgress(state.elapsedTime);

      // Engine Update
      const updatedState = updateBattleRoyaleState(state, deltaTime / 16.67, beatProgress);
      gameStateRef.current = updatedState;

      // UI Updates
      const aliveCount = updatedState.players.filter(p => p.alive).length;
      setPlayersAlive(aliveCount);
      setFinaleIntensity(getFinaleIntensity(updatedState));

      // Win Condition
      if (updatedState.winner) {
        // Save stats securely
        const isPlayerWinner = updatedState.winner.isPlayer;
        // In this mode, let's assume player is index 0 for stats
        const player = updatedState.players[0];
        updateBattleRoyaleStats(isPlayerWinner, player.score, 0); // Simplified for now
        setGamePhase('complete');
        return;
      }

      // Effects & Rendering
      const renderState = createRenderState(updatedState, beatProgress);
      applyDynamicEffects(renderState.visualEffects, canvas);
      renderBattleRoyale(ctx, renderState);
    }, TickerGroup.GAME);

    return () => {
      unregister();
      if (canvasRef.current) canvasRef.current.style.transform = 'scale(1)';
    };
  }, [gamePhase, initializeGame]);

  const applyDynamicEffects = (effects: any, canvas: HTMLCanvasElement) => {
    const { screenShakeIntensity, cameraZoom } = effects;
    if (screenShakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * screenShakeIntensity * 10;
      const sy = (Math.random() - 0.5) * screenShakeIntensity * 10;
      canvas.style.transform = `translate(${sx}px, ${sy}px) scale(${cameraZoom})`;
    } else {
      canvas.style.transform = `scale(${cameraZoom})`;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      if (e.key === 'Escape' && gamePhase === 'playing') setGamePhase('paused');
      if (e.key === ' ' && gamePhase === 'menu') setGamePhase('playing');
    };
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gamePhase]);

  const handleExit = () => { ticker.resumeGroup(TickerGroup.GAME); returnToMenu(); };

  return (
    <div className="battle-royale-mode cosmic-bg full-bleed">
      <canvas ref={canvasRef} width={1200} height={800} className="game-canvas"
        style={{ display: gamePhase === 'playing' || gamePhase === 'paused' ? 'block' : 'none', transition: 'transform 0.1s ease-out' }} />

      {/* HUD */}
      {(gamePhase === 'playing' || gamePhase === 'paused') && (
        <>
          <ScoreDisplay label="ALIVE" value={playersAlive} position="left" neonAccent={playersAlive <= 2 ? 'magenta' : 'cyan'} />
          <StatsDisplay position="top-right" stats={[
            { label: 'BPM', value: currentBPM },
            { label: 'Intensity', value: `${Math.round(finaleIntensity * 100)}%` },
            { label: 'Best', value: bestKillStreak },
          ]} />
          {playersAlive <= 2 && (
            <div className="finale-banner animate-pulseGlow">FINAL DUEL</div>
          )}
        </>
      )}

      {/* Menu */}
      {gamePhase === 'menu' && (
        <GlassPanel variant="elevated" neonAccent="magenta" className="battle-menu animate-slideUp">
          <h1 className="text-glow-primary">BATTLE ROYALE</h1>
          <p className="text-glow-subtle">8-Player Cyber Elimination</p>
          <div className="features-list">
            <div>🔥 Shrinking Play Area</div>
            <div>⚡ 100 → 160 BPM Tempo</div>
            <div>👑 Last One Standing Wins</div>
          </div>
          <div className="menu-actions">
            <GlassButton variant="primary" onClick={() => setGamePhase('playing')}>ENTER ARENA</GlassButton>
            <GlassButton onClick={handleExit}>EXIT</GlassButton>
          </div>
        </GlassPanel>
      )}

      {gamePhase === 'paused' && <PauseOverlay onResume={() => setGamePhase('playing')} onExit={handleExit} />}

      {/* Complete */}
      {gamePhase === 'complete' && gameStateRef.current?.winner && (
        <GlassPanel variant="elevated" neonAccent="magenta" className="completion-panel animate-fadeIn">
          <h1 className="text-glow-primary">ARENA CONQUERED</h1>
          <div className="winner-icon" style={{ color: gameStateRef.current.winner.color }}>👑</div>
          <div className="final-stats">
            <div className="stat-row"><span>Winner</span><span className="val">Player {gameStateRef.current.winner.id + 1}</span></div>
            <div className="stat-row"><span>Final BPM</span><span className="val">{currentBPM}</span></div>
          </div>
          <div className="menu-actions">
            <GlassButton variant="primary" onClick={() => setGamePhase('playing')}>RE-ENTER</GlassButton>
            <GlassButton onClick={handleExit}>EXIT</GlassButton>
          </div>
        </GlassPanel>
      )}

      <style>{`
        .battle-menu, .completion-panel { padding: 40px !important; text-align: center; }
        .features-list { margin: 25px 0; color: #ff00ff; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; }
        .finale-banner {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Orbitron', sans-serif;
          font-size: 2rem;
          color: #ff00ff;
          text-shadow: 0 0 20px #ff00ff;
        }
        .winner-icon { font-size: 5rem; margin: 20px 0; }
      `}</style>
    </div>
  );
}

export default BattleRoyaleMode;
