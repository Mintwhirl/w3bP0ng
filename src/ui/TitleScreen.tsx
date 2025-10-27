/**
 * Title Screen Component
 * Animated logo reveal with "Press Start" shimmer button
 * Implements W3BP0NG liquid glass synthwave aesthetic
 */

import React, { useState, useEffect, useCallback } from 'react';
import { unlockAudioOnUserGesture, isAudioReady } from '../audio/AudioEngine';
import { GlassPanel, GlassButton } from './GlassHUD';
import { ParticleBackground } from './ParticleBackground';
import { useGameStore } from '../hooks/useGameStore';
import { checkAchievements } from '../core/achievements';
import { incrementPlayTime } from '../utils/saveManager';
import '../styles/glassmorphism.css';

export default function TitleScreen({ onStart }: { onStart?: () => void }) {
  const { setMode } = useGameStore();
  const [ready, setReady] = useState(isAudioReady());
  const [showButton, setShowButton] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [particlesActive, setParticlesActive] = useState(false);

  // Animation sequence

  useEffect(() => {
    unlockAudioOnUserGesture();
    const t = setInterval(() => setReady(isAudioReady()), 250);

    // Show the start button after the initial animation sequence
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500); // 1.5s delay to match the logo reveal animation

    return () => {
      clearInterval(t);
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

  const handleStart = useCallback(() => {
    setFadeOut(true);
    if (onStart) {
      onStart();
    } else {
      setMode('menu');
    }
  }, [setMode, onStart]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Any key press starts the game
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      event.preventDefault();
      handleStart();
    }
  }, [handleStart]);

  const handleClick = useCallback(() => {
    handleStart();
  }, [handleStart]);

  // Global keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
    };
  }, [handleKeyPress, handleClick]);

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
                <span className={`button-text ${isHovering ? 'shimmer' : ''}`}>
                  {ready ? 'Press Start' : 'Click to Enable Audio'}
                </span>
                {isHovering && (
                  <div className="button-glow animate-pulse-glow" />
                )}
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
            <span className="separator">â€¢</span>
            <span className="build-info">GLM Build Verified</span>
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
          background: linear-gradient(135deg, #0b001a 0%, #140033 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: opacity 1s ease-in-out;
        }

        .title-screen.fade-out {
          opacity: 0;
        }

        .title-container {
          position: relative;
          z-index: 10;
        }

        .title-panel {
          padding: 60px 80px;
          text-align: center;
          min-width: 500px;
          backdrop-filter: blur(20px);
          background: rgba(11, 0, 26, 0.8);
          border: 2px solid rgba(168, 85, 247, 0.3);
          box-shadow:
            0 0 50px rgba(168, 85, 247, 0.2),
            inset 0 0 20px rgba(34, 211, 238, 0.1);
        }

        .logo-container {
          position: relative;
          margin-bottom: 20px;
        }

        .game-title {
          font-family: 'Orbitron', monospace;
          font-size: 4.5rem;
          font-weight: 900;
          letter-spacing: 0.2em;
          margin: 0;
          padding: 0;
          color: #ffffff;
          text-transform: uppercase;
          text-shadow:
            0 0 20px rgba(168, 85, 247, 0.8),
            0 0 40px rgba(168, 85, 247, 0.4);
        }

        .highlight {
          color: #22d3ee;
          position: relative;
          display: inline-block;
        }

        .highlight::after {
          content: '';
          position: absolute;
          top: -5px;
          left: -10px;
          right: -10px;
          bottom: -5px;
          background: radial-gradient(ellipse at center, rgba(34, 211, 238, 0.3) 0%, transparent 70%);
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .title-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120%;
          height: 120%;
          background: radial-gradient(circle at center, rgba(168, 85, 247, 0.4) 0%, transparent 60%);
          pointer-events: none;
        }

        .game-subtitle {
          font-family: 'Orbitron', monospace;
          font-size: 1rem;
          letter-spacing: 0.3em;
          margin: 20px 0 0 0;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
        }

        .start-button-container {
          margin: 40px 0 30px 0;
        }

        .start-button {
          position: relative;
          padding: 20px 60px;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
          border: 2px solid rgba(34, 211, 238, 0.5);
          color: #ffffff;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .start-button:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%);
          border-color: rgba(34, 211, 238, 0.8);
          box-shadow:
            0 10px 30px rgba(34, 211, 238, 0.3),
            0 0 20px rgba(34, 211, 238, 0.2);
        }

        .button-text {
          position: relative;
          z-index: 2;
        }

        .button-text.shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }

        .button-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, rgba(34, 211, 238, 0.6) 0%, transparent 70%);
          pointer-events: none;
        }

        .keyboard-prompt {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 20px;
        }

        .version-info {
          position: absolute;
          bottom: -40px;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .separator {
          opacity: 0.5;
        }

        .decorative-elements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .floating-orb {
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(168, 85, 247, 0.2));
          filter: blur(1px);
        }

        .orb-1 {
          top: 20%;
          left: 15%;
        }

        .orb-2 {
          top: 70%;
          right: 20%;
        }

        .orb-3 {
          bottom: 25%;
          left: 10%;
        }

        /* Animations */
        @keyframes logo-reveal {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
            filter: blur(10px);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1) translateY(-5px);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          20%, 100% {
            left: 100%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }

        /* Animation classes */
        .animate-logo-reveal {
          animation: logo-reveal 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1.5s forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s forwards;
          opacity: 0;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delay {
          animation: float 6s ease-in-out infinite 2s;
        }

        .animate-float-delay-2 {
          animation: float 6s ease-in-out infinite 4s;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .title-panel {
            padding: 40px 30px;
            min-width: 350px;
          }

          .game-title {
            font-size: 3rem;
          }

          .game-subtitle {
            font-size: 0.8rem;
          }

          .start-button {
            padding: 15px 40px;
            font-size: 1.1rem;
          }

          .floating-orb {
            width: 40px;
            height: 40px;
          }
        }

        @media (max-width: 480px) {
          .title-panel {
            padding: 30px 20px;
            min-width: 280px;
          }

          .game-title {
            font-size: 2.5rem;
            letter-spacing: 0.1em;
          }

          .game-subtitle {
            font-size: 0.7rem;
            letter-spacing: 0.2em;
          }

          .start-button {
            padding: 12px 30px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

