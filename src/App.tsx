/**
 * Main App Component
 * Orchestrates game flow using a registry-based mode strategy
 * Implements smooth transitions following W3BP0NG liquid glass synthwave aesthetic
 * Optimized with centralized configuration and lazy loading
 */

import React, { Suspense, useMemo } from 'react';
import { useGameStore, type GameMode } from './hooks/useGameStore';
import { usePWA } from './hooks/usePWA';
import ModeTransition from './ui/ModeTransition';
import SettingsPanel from './ui/SettingsPanel';
import LoadingScreen from './ui/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { GlassPanel, GlassButton } from './ui/GlassHUD';
import { AchievementToast } from './ui/AchievementToast';
import { AudioResumeBanner } from './ui/AudioResumeBanner';
import { startPerformanceMonitoring } from './utils/perfMonitor';
import { isAudioReady, setAudioTheme, unlockAudioOnUserGesture } from './audio/AudioEngine';
import { getModeConfig, type GameModeId } from './modes/ModeRegistry';

import './App.css';
import { setTheme } from './theme/ThemeManager';

function App() {
  const currentModeId = useGameStore((state) => state.currentMode) as GameModeId;
  const currentThemeId = useGameStore((state) => state.currentTheme);
  const reducedMotion = useGameStore((state) => state.reducedMotion);
  const setMode = useGameStore((state) => state.setMode);
  const { isInstallable, isOffline, isServiceWorkerUpdated, installPWA, reloadPage } = usePWA();

  // Resolve current mode configuration from registry
  const modeConfig = useMemo(() => getModeConfig(currentModeId), [currentModeId]);

  // Initialize systems on mount
  React.useEffect(() => {
    startPerformanceMonitoring();
    unlockAudioOnUserGesture();
  }, []);

  // Reactive Theme Application
  React.useEffect(() => {
    setTheme(currentThemeId);
  }, [currentThemeId]);


  // Reactive Reduced Motion Application
  React.useEffect(() => {
    if (reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  }, [reducedMotion]);

  // Sync audio theme with current mode
  React.useEffect(() => {
    if (!isAudioReady()) return;
    setAudioTheme(modeConfig.audioTheme, false);
  }, [modeConfig.audioTheme, isAudioReady()]);

  // Manage body classes for global styling
  React.useEffect(() => {
    const gameModeCls = 'game-mode';
    const hcCls = 'high-contrast';

    if (modeConfig.isGame) {
      document.body.classList.add(gameModeCls);
    } else {
      document.body.classList.remove(gameModeCls);
    }

    if (currentModeId === 'high-contrast' || (useGameStore.getState().currentTheme === 'high-contrast')) {
      document.body.classList.add(hcCls);
    } else {
      document.body.classList.remove(hcCls);
    }

    return () => {
      document.body.classList.remove(gameModeCls);
      document.body.classList.remove(hcCls);
    };
  }, [modeConfig.isGame, currentModeId, useGameStore((state) => state.currentTheme)]);

  const ModeComponent = modeConfig.component;

  return (
    <ErrorBoundary>
      <div className={`App cosmic-bg ${modeConfig.isGame ? 'full-bleed' : ''}`}>
        
        {/* PWA Notifications & Utility Banners */}
        <div className="pwa-notifications">
          {isInstallable && currentModeId === 'menu' && (
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

        {/* Global HUD Layers */}
        <AchievementToast />
        <AudioResumeBanner />

        {/* Dynamic Mode Content */}
        <Suspense fallback={<LoadingScreen />}>
          <ModeTransition mode={currentModeId}>
            <ModeComponent 
              onStart={currentModeId === 'title' ? () => setMode('menu') : undefined} 
            />
          </ModeTransition>
        </Suspense>

        {/* Global Settings & Modals */}
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
