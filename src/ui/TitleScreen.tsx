/**
 * Title Screen Component
 * Animated logo reveal with "Press Start" shimmer button
 * Implements W3BP0NG liquid glass synthwave aesthetic
 */

import { useState, useEffect, useCallback } from 'react';
import { unlockAudioOnUserGesture, ensureAudioStarted } from '../audio/AudioEngine';
import { GlassPanel, GlassButton } from './GlassHUD';
import { ParticleBackground } from './ParticleBackground';
import { useGameStore } from '../hooks/useGameStore';
import { checkAchievements } from '../core/achievements';
import { incrementPlayTime } from '../utils/saveManager';
import '../styles/glassmorphism.css';

export default function TitleScreen({ onStart }: { onStart?: () => void }) {
  const { setMode } = useGameStore();
  const [showButton, setShowButton] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Basic unlock listener for global context
    unlockAudioOnUserGesture();

    // Show the start button after the initial animation sequence
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500); // 1.5s delay to match the logo reveal animation

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Track play time while on title screen
  useEffect(() => {
    const interval = setInterval(() => {
      incrementPlayTime(100); // Add 100ms every 100ms
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Check for any achievement unlocks
  useEffect(() => {
    checkAchievements();
  }, []);

  const handleStart = useCallback(async () => {
    // Critical: Ensure audio is started on this user gesture
    await ensureAudioStarted();
    
    setFadeOut(true);
    // Allow animation to play before switching mode
    setTimeout(() => {
      if (onStart) {
        onStart();
      } else {
        setMode('menu');
      }
    }, 800);
  }, [setMode, onStart]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Any key press starts the game
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      event.preventDefault();
      handleStart();
    }
  }, [handleStart]);

  // Global keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className={`title-screen ${fadeOut ? 'fade-out' : ''}`}>
      {/* Particle Background */}
      <ParticleBackground />

      {/* Main Title Container */}
      <div className="title-container">
        <GlassPanel
          variant="subtle"
          neonAccent="magenta"
          className="title-panel"
        >
          {/* Logo */}
          <div className="logo-container">
            <h1 className="game-title animate-logo-reveal">
              w3b<span className="highlight">P</span>0ng
            </h1>
            <div className="title-glow animate-pulse-glow" />
          </div>

          {/* Subtitle */}
          <p className="game-subtitle animate-fade-in-delay">
            ARCADE MAYHEM UNLEASHED
          </p>

          {/* Start Button */}
          {showButton && (
            <div className="start-button-container animate-slide-up">
              <GlassButton
                neonAccent="cyan"
                variant="primary"
                className="start-button"
                onClick={handleStart}
              >
                <span className="button-text">
                  ENTER THE VOID
                </span>
              </GlassButton>

              {/* Keyboard prompt */}
              <p className="keyboard-prompt animate-fade-in-delay-2">
                Press ENTER or click to begin
              </p>
            </div>
          )}

          {/* Version info */}
          <div className="version-info animate-fade-in-delay-3">
            <span className="version-text">v1.0.0</span>
            <span className="separator">•</span>
            <span className="build-info">NEURAL LINK ACTIVE</span>
          </div>
        </GlassPanel>

        {/* Decorative elements */}
        <div className="decorative-elements">
          <div className="floating-orb orb-1 animate-float" />
          <div className="floating-orb orb-2 animate-float-delay" />
          <div className="floating-orb orb-3 animate-float-delay-2" />
        </div>
      </div>

      <style>{`
        .title-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #0b001a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: opacity 0.8s ease-in-out;
          z-index: 9999;
        }

        .title-screen.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        .title-container {
          position: relative;
          z-index: 10;
        }

        .title-panel {
          padding: 60px 80px;
          text-align: center;
          min-width: 550px;
          background: rgba(11, 0, 26, 0.7) !important;
          border: 1px solid rgba(168, 85, 247, 0.3) !important;
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.5) !important;
        }

        .logo-container {
          position: relative;
          margin-bottom: 10px;
        }

        .game-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 5rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          margin: 0;
          color: #ffffff;
          text-transform: uppercase;
          text-shadow: 0 0 20px rgba(168, 85, 247, 0.8);
        }

        .highlight {
          color: #00ffff;
          text-shadow: 0 0 30px #00ffff;
        }

        .game-subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          letter-spacing: 0.5em;
          margin: 15px 0 0 0;
          color: #a855f7;
          text-transform: uppercase;
          opacity: 0.8;
        }

        .start-button-container {
          margin: 50px 0 20px 0;
        }

        .start-button {
          min-width: 300px;
          height: 60px;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem !important;
          letter-spacing: 4px !important;
        }

        .keyboard-prompt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 20px;
          letter-spacing: 2px;
        }

        .version-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: rgba(168, 85, 247, 0.5);
          margin-top: 40px;
          letter-spacing: 1px;
        }

        .floating-orb {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(0, 255, 255, 0.4), transparent);
          filter: blur(20px);
          z-index: -1;
        }

        .orb-1 { top: -10%; left: -10%; background: radial-gradient(circle, rgba(255, 0, 255, 0.3), transparent); }
        .orb-2 { bottom: -10%; right: -10%; background: radial-gradient(circle, rgba(0, 255, 255, 0.3), transparent); }

        @keyframes logo-reveal {
          from { opacity: 0; transform: scale(0.9); filter: blur(10px); }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }

        .animate-logo-reveal {
          animation: logo-reveal 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .animate-fade-in-delay {
          animation: fadeIn 1s ease-out 0.5s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fadeIn 1s ease-out 1.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-3 {
          animation: fadeIn 1s ease-out 1.5s forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.8s forwards;
          opacity: 0;
        }

        @media (max-width: 768px) {
          .title-panel { min-width: 90%; padding: 40px 20px; }
          .game-title { font-size: 3rem; }
          .game-subtitle { font-size: 0.7rem; letter-spacing: 0.3em; }
        }
      `}</style>
    </div>
  );
}
