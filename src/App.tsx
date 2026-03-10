/**
 * Main App Component
 * Routes between menu and game modes based on Zustand state
 * Implements smooth transitions following W3BP0NG liquid glass synthwave aesthetic
 * Optimized with React.lazy and Suspense for code splitting
 */

import React, { Suspense, lazy } from 'react';
import { useGameStore } from './hooks/useGameStore';
import { usePWA } from './hooks/usePWA';
import ModeTransition from './ui/ModeTransition';
import SettingsPanel from './ui/SettingsPanel';
import LoadingScreen from './ui/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { GlassPanel, GlassButton } from './ui/GlassHUD';
import { AchievementToast } from './ui/AchievementToast';
import { startPerformanceMonitoring } from './utils/perfMonitor';
import { isAudioReady, setAudioTheme } from './audio/AudioEngine';

import './App.css';
import './styles/glassmorphism.css';

// ═══════════════════════════════════════════════════════════
// LAZY COMPONENTS (Code Splitting)
// ═══════════════════════════════════════════════════════════

const TitleLazy = lazy(() => import('./ui/TitleScreen'));
const MenuLazy = lazy(() => import('./ui/MainMenu'));
const ClassicLazy = lazy(() => import('./components/PongGame'));
const PuzzleLazy = lazy(() => import('./modes/PhysicsPuzzleMode'));
const RhythmLazy = lazy(() => import('./modes/RhythmMode'));
const BattleLazy = lazy(() => import('./modes/BattleRoyaleMode'));
const EditorLazy = lazy(() => import('./modes/LevelEditorMode'));

function App() {
  const currentMode = useGameStore((state) => state.currentMode);
  const setMode = useGameStore((state) => state.setMode);
  const { isInstallable, isOffline, isServiceWorkerUpdated, installPWA, reloadPage } = usePWA();

  // Initialize systems on mount
  React.useEffect(() => {
    startPerformanceMonitoring();
  }, []);

  // Handle audio theme changes
  React.useEffect(() => {
    if (!isAudioReady()) return;

    const themeMap: Record<string, string> = {
      title: 'main',
      menu: 'main',
      classic: 'classic',
      puzzle: 'puzzle',
      rhythm: 'rhythm',
      'battle-royale': 'battle',
      editor: 'editor',
    };

    const theme = themeMap[currentMode];
    if (theme) {
      setAudioTheme(theme, false);
    }
  }, [currentMode]);

  const isGameMode = currentMode !== 'title' && currentMode !== 'menu';
  
  React.useEffect(() => {
    const cls = 'game-mode';
    if (isGameMode) {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
    return () => document.body.classList.remove(cls);
  }, [isGameMode]);

  const renderMode = () => {
    switch (currentMode) {
      case 'title':
        return <TitleLazy onStart={() => setMode('menu')} />;
      case 'menu':
        return <MenuLazy />;
      case 'classic':
        return <ClassicLazy />;
      case 'puzzle':
        return <PuzzleLazy />;
      case 'rhythm':
        return <RhythmLazy />;
      case 'battle-royale':
        return <BattleLazy />;
      case 'editor':
        return <EditorLazy />;
      default:
        return <MenuLazy />;
    }
  };

  return (
    <ErrorBoundary>
      <div className={`App cosmic-bg ${isGameMode ? 'full-bleed' : ''}`}>
        {/* PWA Notifications */}
        <div className="pwa-notifications">
          {isInstallable && currentMode === 'menu' && (
            <GlassPanel variant="subtle" neonAccent="cyan" className="pwa-banner animate-slideUp">
              <div className="pwa-content">
                <span className="pwa-icon">🚀</span>
                <div className="pwa-text">
                  <p className="pwa-title">INSTALL W3BP0NG</p>
                  <p className="pwa-desc">Play full-screen and offline</p>
                </div>
                <GlassButton variant="primary" onClick={installPWA} className="pwa-btn">INSTALL</GlassButton>
              </div>
            </GlassPanel>
          )}

          {isOffline && (
            <div className="offline-badge animate-fadeIn">
              <span>⚠️ OFFLINE MODE</span>
            </div>
          )}

          {isServiceWorkerUpdated && (
            <GlassPanel variant="elevated" neonAccent="magenta" className="update-banner animate-slideUp">
              <p>New version available!</p>
              <GlassButton variant="primary" onClick={reloadPage}>RELOAD</GlassButton>
            </GlassPanel>
          )}
        </div>

        {/* Global Achievement UI */}
        <AchievementToast />

        <Suspense fallback={<LoadingScreen />}>
          <ModeTransition mode={currentMode}>
            {renderMode()}
          </ModeTransition>
        </Suspense>
        <SettingsPanel />
      </div>

      <style>{`
        .pwa-notifications {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }
        .pwa-notifications > * {
          pointer-events: auto;
        }
        .pwa-banner {
          padding: 12px 20px !important;
          min-width: 280px;
        }
        .pwa-content {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .pwa-icon {
          font-size: 1.5rem;
        }
        .pwa-text {
          flex: 1;
          text-align: left;
        }
        .pwa-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          color: #00ffff;
          margin: 0;
          letter-spacing: 1px;
        }
        .pwa-desc {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 2px 0 0 0;
        }
        .pwa-btn {
          padding: 6px 12px !important;
          font-size: 0.7rem !important;
        }
        .offline-badge {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
          padding: 4px 12px;
          border-radius: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          backdrop-filter: blur(4px);
          align-self: flex-end;
        }
        .update-banner {
          padding: 15px !important;
          text-align: center;
        }
      `}</style>
    </ErrorBoundary>
  );
}

export default App;
