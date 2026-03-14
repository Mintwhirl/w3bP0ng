/**
 * Settings Panel Component
 * Modal panel for game settings (sound, theme, accessibility)
 * Optimized for performance and accessibility
 */

import { memo, useEffect } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { THEMES } from '../theme/UnifiedTheme';
import { useFocusTrap } from '../hooks/useFocusTrap';
import './SettingsPanel.css';

const THEME_OPTIONS = Object.keys(THEMES).filter(id => !['synthwave-sunset', 'rhythm-beats', 'battle-intensity', 'editor-pro'].includes(id));

const SettingsPanel = memo(function SettingsPanel() {
  const {
    settingsPanelOpen,
    soundEnabled,
    currentTheme,
    reducedMotion,
    toggleSound,
    setTheme,
    updateSettings,
    toggleSettingsPanel
  } = useGameStore();

  // Focus trap for modal accessibility
  const containerRef = useFocusTrap(settingsPanelOpen);

  // Escape key support
  useEffect(() => {
    if (!settingsPanelOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        toggleSettingsPanel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [settingsPanelOpen, toggleSettingsPanel]);

  if (!settingsPanelOpen) {
    return null;
  }

  return (
    <div 
      className="settings-overlay" 
      onClick={toggleSettingsPanel}
      role="presentation"
    >
      <div
        ref={containerRef as any}
        className="settings-panel animate-slideUp"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="settings-title"
        aria-modal="true"
      >
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

        <div className="settings-content">
          {/* Audio Section */}
          <section className="settings-section" aria-labelledby="audio-heading">
            <h3 id="audio-heading" className="settings-section-title">Audio</h3>
            <div className="settings-row">
              <span className="settings-label" id="sfx-label">Sound Effects</span>
              <button
                className={`toggle-button ${soundEnabled ? 'toggle-button--on' : 'toggle-button--off'}`}
                onClick={toggleSound}
                aria-labelledby="sfx-label"
                aria-pressed={soundEnabled}
                role="switch"
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
          </section>

          {/* Accessibility Section */}
          <section className="settings-section" aria-labelledby="access-heading">
            <h3 id="access-heading" className="settings-section-title">Accessibility</h3>
            <div className="settings-row">
              <span className="settings-label" id="motion-label">Reduced Motion</span>
              <button
                className={`toggle-button ${reducedMotion ? 'toggle-button--on' : 'toggle-button--off'}`}
                onClick={() => updateSettings({ reducedMotion: !reducedMotion })}
                aria-labelledby="motion-label"
                aria-pressed={reducedMotion}
                role="switch"
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
            <p className="settings-hint">Reduces visual noise and slows down background animations.</p>
          </section>

          {/* Theme Section */}
          <section className="settings-section" aria-labelledby="theme-heading">
            <h3 id="theme-heading" className="settings-section-title">Visual Theme</h3>
            <div className="theme-selector" role="radiogroup" aria-labelledby="theme-heading">
              {THEME_OPTIONS.map((themeId) => {
                const theme = THEMES[themeId];
                if (!theme) return null;
                const isActive = currentTheme === themeId;

                return (
                  <button
                    key={themeId}
                    className={`theme-option ${isActive ? 'theme-option--active' : ''} ${themeId === 'high-contrast' ? 'theme-option--hc' : ''}`}
                    onClick={() => setTheme(themeId)}
                    aria-label={`Select ${theme.name} theme`}
                    aria-checked={isActive}
                    role="radio"
                  >
                    <div className="theme-preview" style={{
                      background: themeId === 'high-contrast' 
                        ? '#000' 
                        : `linear-gradient(135deg, ${theme.game.paddle_left.color}, ${theme.game.paddle_right.color})`,
                      border: themeId === 'high-contrast' ? '2px solid #fff' : 'none'
                    }} aria-hidden="true"></div>
                    <span className="theme-name">{theme.name}</span>
                    {isActive && <span className="theme-checkmark" aria-hidden="true">✓</span>}
                  </button>
                );
              })}
            </div>
          </section>

          <footer className="settings-footer">
            <p className="settings-info">
              <strong>w3bP0ng v0.1.0</strong>
              <br />
              A modern multi-mode web game showcasing professional TypeScript, React, and WebGL development.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
});

export default SettingsPanel;
