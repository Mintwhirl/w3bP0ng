/**
 * Main Menu Component
 * Landing screen with mode selection and settings
 * Optimized for performance, accessibility, and keyboard navigation
 */

import { useState, useCallback, memo, useEffect, useRef } from 'react';
import { useGameStore, GAME_MODES, type GameMode } from '../hooks/useGameStore';
import { checkAchievements } from '../core/achievements';
import { LeftPaddle, RightPaddle } from './DecorativePaddles';
import { EnergyBall } from './EnergyBall';
import { ParticleBackground } from './ParticleBackground';
import AboutCredits from './AboutCredits';
import './MainMenu.css';

const MainMenu = memo(function MainMenu() {
  const setMode = useGameStore((state) => state.setMode);
  const toggleSettingsPanel = useGameStore((state) => state.toggleSettingsPanel);
  const [showAbout, setShowAbout] = useState(false);
  const [activeIndex, setActiveAtindex] = useState(-1);
  const modeCardsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleModeSelect = useCallback((modeId: GameMode, available: boolean) => {
    if (available) {
      setMode(modeId);
    }
  }, [setMode]);

  const toggleAbout = useCallback(() => {
    setShowAbout(prev => !prev);
  }, []);

  // Check achievements on mount
  useEffect(() => {
    checkAchievements();
  }, []);

  // Keyboard navigation for mode cards
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showAbout) return;

    const availableModes = GAME_MODES.filter(m => m.available);
    const availableIndices = GAME_MODES.map((m, i) => m.available ? i : -1).filter(i => i !== -1);
    
    let currentIdx = availableIndices.indexOf(activeIndex);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (currentIdx + 1) % availableIndices.length;
      const targetIdx = availableIndices[nextIdx];
      setActiveAtindex(targetIdx);
      modeCardsRef.current[targetIdx]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIdx = (currentIdx - 1 + availableIndices.length) % availableIndices.length;
      const targetIdx = availableIndices[nextIdx];
      setActiveAtindex(targetIdx);
      modeCardsRef.current[targetIdx]?.focus();
    }
  }, [activeIndex, showAbout]);

  return (
    <div className="main-menu" data-testid="main-menu" onKeyDown={handleKeyDown}>
      {/* Skip Link for Accessibility */}
      <a href="#mode-grid" className="skip-link">Skip to mode selection</a>

      {/* Particle background */}
      <ParticleBackground />

      {/* Decorative elements */}
      <div className="decorative-paddle decorative-paddle--left" aria-hidden="true">
        <LeftPaddle />
      </div>
      <div className="decorative-paddle decorative-paddle--right" aria-hidden="true">
        <RightPaddle />
      </div>
      <div className="floating-ball-container" aria-hidden="true">
        <EnergyBall />
      </div>

      {/* Main Content */}
      <main className="menu-container">
        <header className="menu-header">
          <h1 className="menu-title animate-fadeIn">w3bP0ng</h1>
          <p className="menu-subtitle animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            ARCADE MAYHEM UNLEASHED
          </p>
        </header>

        {/* Mode Selection Grid */}
        <div 
          id="mode-grid" 
          className="mode-grid animate-fadeIn" 
          style={{ animationDelay: '0.4s' }}
          role="list"
          aria-label="Available game modes"
        >
          {GAME_MODES.map((mode, index) => (
            <button
              key={mode.id}
              ref={el => modeCardsRef.current[index] = el}
              className={`mode-card ${!mode.available ? 'mode-card--disabled' : ''} ${activeIndex === index ? 'mode-card--active' : ''}`}
              onClick={() => handleModeSelect(mode.id, mode.available)}
              onFocus={() => setActiveAtindex(index)}
              disabled={!mode.available}
              role="listitem"
              aria-label={`${mode.name} mode. ${mode.description}. ${mode.available ? 'Available' : 'Coming soon'}`}
            >
              <div className="mode-card__icon" aria-hidden="true">{mode.icon}</div>
              <h2 className="mode-card__title">{mode.name}</h2>
              <p className="mode-card__description">{mode.description}</p>
              {!mode.available && (
                <span className="mode-card__badge">Coming Soon</span>
              )}
            </button>
          ))}
        </div>

        {/* Settings Button */}
        <div className="menu-actions animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          <button
            className="settings-button"
            onClick={toggleSettingsPanel}
            aria-label="Open game settings"
          >
            ⚙️ Settings
          </button>
        </div>
      </main>

      {/* About & Credits Modal */}
      <AboutCredits isOpen={showAbout} onClose={toggleAbout} />

      {/* Footer */}
      <footer className="menu-footer animate-fadeIn" style={{ animationDelay: '0.8s' }}>
        <p>
          © 2025 Kevin Stewart. All rights reserved.
          <br />
          <a
            href="https://github.com/mintwhirl/w3bP0ng"
            target="_blank"
            rel="noopener noreferrer"
            className="menu-link"
            aria-label="View source code on GitHub (opens in new tab)"
          >
            View Source on GitHub
          </a>
          <br />
          <button
            onClick={toggleAbout}
            className="menu-link about-button"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={showAbout}
          >
            📋 About & Credits
          </button>
        </p>
      </footer>

      <style>{`
        .skip-link {
          position: absolute;
          top: -40px;
          left: 0;
          background: #a855f7;
          color: white;
          padding: 8px;
          z-index: 100;
          transition: top 0.3s;
          font-family: 'Orbitron', sans-serif;
          text-decoration: none;
          border-radius: 0 0 8px 0;
        }
        .skip-link:focus {
          top: 0;
        }
        .mode-card:focus {
          outline: 3px solid #00ffff;
          outline-offset: 4px;
          transform: translateY(-5px) scale(1.02);
          background: rgba(255, 255, 255, 0.1);
        }
        .mode-card--active {
          border-color: #00ffff !important;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.3) !important;
        }
      `}</style>
    </div>
  );
});

export default MainMenu;
