/**
 * Main Menu Component
 * Landing screen with mode selection and settings
 */

import { useState, useCallback } from 'react';
import { useGameStore, GAME_MODES, type GameMode } from '../hooks/useGameStore';
import { LeftPaddle, RightPaddle } from './DecorativePaddles';
import { EnergyBall } from './EnergyBall';
import { ParticleBackground } from './ParticleBackground';
import AboutCredits from './AboutCredits';
import './MainMenu.css';

export default function MainMenu() {
  const { setMode, toggleSettingsPanel } = useGameStore();
  const [showAbout, setShowAbout] = useState(false);

  const handleModeSelect = useCallback((modeId: GameMode, available: boolean) => {
    if (available) {
      setMode(modeId);
    }
  }, [setMode]);

  const toggleAbout = useCallback(() => {
    setShowAbout(prev => !prev);
  }, []);

  return (
    <div className="main-menu">
      {/* Particle background */}
      <ParticleBackground />

      {/* Left decorative paddle */}
      <div className="decorative-paddle decorative-paddle--left" aria-hidden="true">
        <LeftPaddle />
      </div>

      {/* Right decorative paddle */}
      <div className="decorative-paddle decorative-paddle--right" aria-hidden="true">
        <RightPaddle />
      </div>

      {/* Floating energy ball */}
      <div className="floating-ball-container" aria-hidden="true">
        <EnergyBall />
      </div>
      {/* Header */}
      <header className="menu-header">
        <h1 className="menu-title">w3bP0ng</h1>
        <p className="menu-subtitle">ARCADE MAYHEM UNLEASHED</p>
      </header>

      {/* Mode Selection Grid */}
      <div className="mode-grid">
        {GAME_MODES.map((mode) => (
          <button
            key={mode.id}
            className={`mode-card ${!mode.available ? 'mode-card--disabled' : ''}`}
            onClick={() => handleModeSelect(mode.id, mode.available)}
            disabled={!mode.available}
            aria-label={`${mode.name} - ${mode.available ? 'Available' : 'Coming Soon'}`}
          >
            <div className="mode-card__icon">{mode.icon}</div>
            <h2 className="mode-card__title">{mode.name}</h2>
            <p className="mode-card__description">{mode.description}</p>
            {!mode.available && (
              <span className="mode-card__badge">Coming Soon</span>
            )}
          </button>
        ))}
      </div>

      {/* Settings Button */}
      <button
        className="settings-button"
        onClick={toggleSettingsPanel}
        aria-label="Open settings"
      >
        ⚙️ Settings
      </button>

      {/* About & Credits Modal */}
      <AboutCredits isOpen={showAbout} onClose={toggleAbout} />

      {/* Footer */}
      <footer className="menu-footer">
        <p>
          © 2025 Kevin Stewart. All rights reserved.
          <br />
          <a
            href="https://github.com/mintwhirl/w3bP0ng"
            target="_blank"
            rel="noopener noreferrer"
            className="menu-link"
          >
            View Source on GitHub
          </a>
          <br />
          <button
            onClick={toggleAbout}
            className="menu-link about-button"
            type="button"
          >
            📋 About & Credits
          </button>
        </p>
      </footer>
    </div>
  );
}
