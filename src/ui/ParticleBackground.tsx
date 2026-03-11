/**
 * Particle Background Canvas
 * Subtle particle field for depth - low CPU usage
 * Ticker-optimized and memoized
 */

import { useEffect, useRef, memo } from 'react';
import { ticker, TickerGroup } from '../engine/EngineTicker';

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  style: string;
}

export const ParticleBackground = memo(function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Skip in tests
    if (import.meta.env.MODE === 'test') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = canvas.clientWidth);
    let height = (canvas.height = canvas.clientHeight);

    const PARTICLE_DENSITY = 80000;
    const count = Math.max(8, Math.min(50, Math.round((width * height) / PARTICLE_DENSITY)));

    const particles: Particle[] = Array.from({ length: count }, () => {
      const alpha = 0.05 + Math.random() * 0.15;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.4,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        alpha,
        style: `rgba(255, 255, 255, ${alpha.toFixed(2)})`,
      };
    });

    const tickerId = `particles-${Math.random().toString(36).substr(2, 9)}`;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Group particles by drawing in a single path where possible
      // Since they have subtle alpha variations, we'll use a constant color with globalAlpha
      // or just accept the alpha variations but draw more efficiently
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Draw particle - using individual beginPath for varying alpha
        // But we could optimize by grouping into 3-4 alpha buckets if needed
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    };

    const handleResize = () => {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const unregister = ticker.register(tickerId, draw, TickerGroup.BACKGROUND);

    return () => {
      unregister();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      aria-hidden="true"
    />
  );
});
