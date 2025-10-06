/**
 * Settings Panel Component
 * Modal panel for game settings (sound, theme, etc.)
 */

import { useGameStore } from '../hooks/useGameStore';
import { THEMES } from '../rendering/types';
import './SettingsPanel.css';

export default function SettingsPanel() {
  const { settingsPanelOpen, soundEnabled, currentTheme, toggleSound, setTheme, toggleSettingsPanel } = useGameStore();

  if (!settingsPanelOpen) {
    return null;
  }

  const themeOptions = Object.keys(THEMES);

  return (
    <div className="settings-overlay" onClick={toggleSettingsPanel}>
      <div
        className="settings-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="settings-title"
        aria-modal="true"
      >
        {/* Header */}
        <header className="settings-header">
          <h2 id="settings-title" className="settings-title">Settings</h2>
          <button
            className="settings-close"
            onClick={toggleSettingsPanel}
            aria-label="Close settings"
          >
            ✕
          </button>
        </header>

        {/* Settings Content */}
        <div className="settings-content">
          {/* Sound Toggle */}
          <div className="settings-section">
            <h3 className="settings-section-title">Audio</h3>
            <label className="settings-toggle">
              <span className="settings-label">Sound Effects</span>
              <button
                className={`toggle-button ${soundEnabled ? 'toggle-button--on' : 'toggle-button--off'}`}
                onClick={toggleSound}
                aria-label={`Sound ${soundEnabled ? 'enabled' : 'disabled'}`}
                aria-pressed={soundEnabled}
              >
                <span className="toggle-slider"></span>
              </button>
            </label>
          </div>

          {/* Theme Selection */}
          <div className="settings-section">
            <h3 className="settings-section-title">Visual Theme</h3>
            <div className="theme-selector">
              {themeOptions.map((themeId) => {
                const theme = THEMES[themeId];
                const isActive = currentTheme === themeId;

                return (
                  <button
                    key={themeId}
                    className={`theme-option ${isActive ? 'theme-option--active' : ''}`}
                    onClick={() => setTheme(themeId)}
                    aria-label={`Select ${theme.name} theme`}
                    aria-pressed={isActive}
                  >
                    <div className="theme-preview" style={{
                      background: `linear-gradient(135deg, ${theme.paddle.left.color}, ${theme.paddle.right.color})`
                    }}></div>
                    <span className="theme-name">{theme.name}</span>
                    {isActive && <span className="theme-checkmark">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Section */}
          <div className="settings-section">
            <h3 className="settings-section-title">About</h3>
            <p className="settings-info">
              <strong>w3bP0ng v0.1.0</strong>
              <br />
              A modern multi-mode web game showcasing professional TypeScript, React, and WebGL development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
