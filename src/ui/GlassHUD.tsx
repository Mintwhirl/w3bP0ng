/**
 * GlassHUD Components
 * Reusable HUD elements with glassmorphism styling
 * Follows W3BP0NG liquid glass synthwave aesthetic
 */

import { type ReactNode, type CSSProperties } from 'react';
import '../styles/glassmorphism.css';

// ═══════════════════════════════════════════════════════════
// BASE HUD PANEL
// ═══════════════════════════════════════════════════════════

interface GlassPanelProps {
  children: ReactNode;
  variant?: 'panel' | 'elevated' | 'subtle';
  neonAccent?: 'magenta' | 'cyan' | 'violet' | 'none';
  className?: string;
  style?: CSSProperties;
}

export function GlassPanel({
  children,
  variant = 'panel',
  neonAccent = 'none',
  className = '',
  style = {},
}: GlassPanelProps) {
  const variantClass = `glass-${variant}`;
  const accentClass = neonAccent !== 'none' ? `glass-neon-${neonAccent}` : '';

  return (
    <div
      className={`${variantClass} ${accentClass} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SCORE DISPLAY
// ═══════════════════════════════════════════════════════════

interface ScoreDisplayProps {
  label: string;
  value: number | string;
  neonAccent?: 'magenta' | 'cyan' | 'violet';
  position?: 'left' | 'right' | 'center';
}

export function ScoreDisplay({
  label,
  value,
  neonAccent = 'magenta',
  position = 'center',
}: ScoreDisplayProps) {
  const positionStyles: Record<string, CSSProperties> = {
    left: { left: '2rem', top: '2rem' },
    right: { right: '2rem', top: '2rem' },
    center: { left: '50%', top: '2rem', transform: 'translateX(-50%)' },
  };

  return (
    <GlassPanel
      variant="subtle"
      neonAccent={neonAccent}
      style={{
        position: 'absolute',
        ...positionStyles[position],
        padding: '1rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 50,
      }}
    >
      <div
        className="text-glow-subtle"
        style={{
          fontSize: '0.875rem',
          fontFamily: 'Orbitron, "Courier New", monospace',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        className="text-glow-primary"
        style={{
          fontSize: '2rem',
          fontFamily: 'Orbitron, "Courier New", monospace',
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </GlassPanel>
  );
}

// ═══════════════════════════════════════════════════════════
// TIMER DISPLAY
// ═══════════════════════════════════════════════════════════

interface TimerDisplayProps {
  time: number;
  label?: string;
  format?: 'seconds' | 'mm:ss' | 'ms';
}

export function TimerDisplay({ time, label = 'TIME', format = 'seconds' }: TimerDisplayProps) {
  const formatTime = (t: number): string => {
    switch (format) {
      case 'mm:ss': {
        const minutes = Math.floor(t / 60);
        const seconds = Math.floor(t % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      case 'ms': {
        const minutes = Math.floor(t / 60000);
        const seconds = Math.floor((t % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      case 'seconds':
      default:
        return Math.floor(time).toString();
    }
  };

  return (
    <GlassPanel
      variant="subtle"
      neonAccent="cyan"
      style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '1rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 50,
      }}
    >
      <div
        className="text-glow-subtle"
        style={{
          fontSize: '0.875rem',
          fontFamily: 'Orbitron, "Courier New", monospace',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        className="text-glow-cyan"
        style={{
          fontSize: '2rem',
          fontFamily: 'Orbitron, "Courier New", monospace',
          fontWeight: 700,
          letterSpacing: '0.05em',
        }}
      >
        {formatTime(time)}
      </div>
    </GlassPanel>
  );
}

// ═══════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: 'magenta' | 'cyan' | 'violet';
  showPercentage?: boolean;
}

export function ProgressBar({
  value,
  max,
  label,
  color = 'magenta',
  showPercentage = false,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorMap = {
    magenta: '#a855f7',
    cyan: '#22d3ee',
    violet: '#8b5cf6',
  };

  return (
    <GlassPanel
      variant="subtle"
      style={{
        padding: '0.75rem 1rem',
        minWidth: '200px',
      }}
    >
      {label && (
        <div
          className="text-glow-subtle"
          style={{
            fontSize: '0.75rem',
            fontFamily: 'Orbitron, "Courier New", monospace',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {label}
          {showPercentage && ` ${Math.round(percentage)}%`}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: colorMap[color],
            boxShadow: `0 0 10px ${colorMap[color]}`,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '4px',
          }}
        />
      </div>
    </GlassPanel>
  );
}

// ═══════════════════════════════════════════════════════════
// BUTTON
// ═══════════════════════════════════════════════════════════

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
}

export function GlassButton({
  children,
  onClick,
  variant = 'secondary',
  disabled = false,
  className = '',
}: GlassButtonProps) {
  const variantClass = variant === 'primary' ? 'glass-button-primary' : '';

  return (
    <button
      className={`glass-button ${variantClass} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// PAUSE OVERLAY
// ═══════════════════════════════════════════════════════════

interface PauseOverlayProps {
  onResume: () => void;
  onExit: () => void;
  title?: string;
}

export function PauseOverlay({ onResume, onExit, title = 'PAUSED' }: PauseOverlayProps) {
  return (
    <div className="hud-overlay animate-fadeIn">
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <h1
          className="text-glow-primary animate-pulseGlow"
          style={{
            fontSize: '4rem',
            fontFamily: 'Orbitron, "Courier New", monospace',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '0.1em',
          }}
        >
          {title}
        </h1>

        <GlassPanel
          variant="elevated"
          neonAccent="magenta"
          style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            minWidth: '300px',
          }}
          className="animate-slideUp"
        >
          <GlassButton variant="primary" onClick={onResume}>
            Resume
          </GlassButton>
          <GlassButton onClick={onExit}>Exit to Menu</GlassButton>
        </GlassPanel>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STATS DISPLAY
// ═══════════════════════════════════════════════════════════

interface StatItemProps {
  label: string;
  value: string | number;
}

interface StatsDisplayProps {
  stats: StatItemProps[];
  title?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function StatsDisplay({ stats, title, position = 'top-right' }: StatsDisplayProps) {
  const positionStyles: Record<string, CSSProperties> = {
    'top-left': { top: '2rem', left: '2rem' },
    'top-right': { top: '2rem', right: '2rem' },
    'bottom-left': { bottom: '2rem', left: '2rem' },
    'bottom-right': { bottom: '2rem', right: '2rem' },
  };

  return (
    <GlassPanel
      variant="subtle"
      style={{
        position: 'absolute',
        ...positionStyles[position],
        padding: '1rem 1.5rem',
        minWidth: '200px',
        zIndex: 50,
      }}
    >
      {title && (
        <div
          className="text-glow-primary"
          style={{
            fontSize: '1rem',
            fontFamily: 'Orbitron, "Courier New", monospace',
            fontWeight: 600,
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {title}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.875rem',
              fontFamily: 'Orbitron, "Courier New", monospace',
            }}
          >
            <span className="text-glow-subtle" style={{ opacity: 0.8 }}>
              {stat.label}
            </span>
            <span className="text-glow-cyan" style={{ fontWeight: 600 }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
