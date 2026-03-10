import React from 'react';
import { GlassPanel } from './GlassHUD';

/**
 * LoadingScreen Component
 * A themed fallback for React.lazy/Suspense
 * Follows the liquid glass synthwave aesthetic
 */
const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen-container">
      <GlassPanel variant="elevated" neonAccent="cyan" className="loading-panel">
        <div className="loader-orbit">
          <div className="loader-core"></div>
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
        </div>
        <div className="loading-text">
          INITIALIZING NEURAL LINK<span>...</span>
        </div>
        <div className="loading-subtext">LOADING COSMIC ASSETS</div>
        <div className="loading-progress-track">
          <div className="loading-progress-fill"></div>
        </div>
      </GlassPanel>

      <style>{`
        .loading-screen-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0b001a;
          z-index: 10000;
        }

        .loading-panel {
          padding: 3rem !important;
          text-align: center;
          min-width: 320px;
        }

        .loader-orbit {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
        }

        .loader-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 12px;
          height: 12px;
          background: #00ffff;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 15px #00ffff;
          animation: core-pulse 1.5s ease-in-out infinite;
        }

        .loader-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 2px solid transparent;
          border-top-color: #a855f7;
          border-radius: 50%;
          animation: ring-rotate 2s linear infinite;
        }

        .loader-ring:nth-child(3) {
          border-top-color: #ff00ff;
          animation-direction: reverse;
          animation-duration: 1.5s;
          transform: scale(0.8);
        }

        .loading-text {
          color: #ffffff;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          letter-spacing: 2px;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }

        .loading-text span {
          animation: text-blink 1s steps(4) infinite;
        }

        .loading-subtext {
          color: #a855f7;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          margin-bottom: 1.5rem;
          opacity: 0.8;
        }

        .loading-progress-track {
          width: 100%;
          height: 4px;
          background: rgba(168, 85, 247, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .loading-progress-fill {
          width: 30%;
          height: 100%;
          background: linear-gradient(90deg, #a855f7, #00ffff);
          animation: progress-slide 2s ease-in-out infinite;
        }

        @keyframes core-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
        }

        @keyframes ring-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes text-blink {
          0% { content: '.'; }
          33% { content: '..'; }
          66% { content: '...'; }
        }

        @keyframes progress-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
