/**
 * Floating Energy Ball
 * Gentle orbital motion for visual interest
 */

import { useEffect, useState } from 'react';

export function EnergyBall() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let startTime = Date.now();
    let animationFrameId: number;

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      // Gentle orbital motion using sine/cosine
      const x = Math.sin(elapsed * 0.5) * 60;
      const y = Math.cos(elapsed * 0.7) * 40;

      setPosition({ x, y });
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
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
}
