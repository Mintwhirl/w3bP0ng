/**
 * Floating Energy Ball
 * Gentle orbital motion for visual interest
 * Memoized and ticker-optimized
 */

import { useEffect, useState, memo } from 'react';
import { ticker, TickerGroup } from '../engine/EngineTicker';

export const EnergyBall = memo(function EnergyBall() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Skip in tests
    if (import.meta.env.MODE === 'test') return;

    const startTime = performance.now();

    const id = `energy-ball-${Math.random().toString(36).substr(2, 9)}`;
    
    return ticker.register(id, (time) => {
      const elapsed = (time - startTime) / 1000;

      // Gentle orbital motion using sine/cosine
      const x = Math.sin(elapsed * 0.5) * 60;
      const y = Math.cos(elapsed * 0.7) * 40;

      setPosition({ x, y });
    }, TickerGroup.UI);
  }, []);

  return (
    <div
      className="energy-ball"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
      aria-hidden="true"
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="ballGradient" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#4facfe" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7873f5" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Core ball */}
        <circle cx="60" cy="60" r="28" fill="url(#ballGradient)" opacity="0.9" />

        {/* Outer glow rings */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="#7873f5"
          opacity="0.05"
        />
        <circle
          cx="60"
          cy="60"
          r="56"
          stroke="#4facfe"
          strokeWidth="1.2"
          opacity="0.15"
        />
      </svg>
    </div>
  );
});
