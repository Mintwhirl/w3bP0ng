import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import '../styles/glassmorphism.css';
export function GlassPanel({ children, variant = 'panel', neonAccent = 'none', className = '', style = {}, }) {
    const variantClass = `glass-${variant}`;
    const accentClass = neonAccent !== 'none' ? `glass-neon-${neonAccent}` : '';
    return (_jsx("div", { className: `${variantClass} ${accentClass} ${className}`.trim(), style: style, children: children }));
}
export function ScoreDisplay({ label, value, neonAccent = 'magenta', position = 'center', }) {
    const positionStyles = {
        left: { left: '2rem', top: '2rem' },
        right: { right: '2rem', top: '2rem' },
        center: { left: '50%', top: '2rem', transform: 'translateX(-50%)' },
    };
    return (_jsxs(GlassPanel, { variant: "subtle", neonAccent: neonAccent, style: {
            position: 'absolute',
            ...positionStyles[position],
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: 50,
        }, children: [_jsx("div", { className: "text-glow-subtle", style: {
                    fontSize: '0.875rem',
                    fontFamily: 'Orbitron, "Courier New", monospace',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }, children: label }), _jsx("div", { className: "text-glow-primary", style: {
                    fontSize: '2rem',
                    fontFamily: 'Orbitron, "Courier New", monospace',
                    fontWeight: 700,
                }, children: value })] }));
}
export function TimerDisplay({ time, label = 'TIME', format = 'seconds' }) {
    const formatTime = (t) => {
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
    return (_jsxs(GlassPanel, { variant: "subtle", neonAccent: "cyan", style: {
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
        }, children: [_jsx("div", { className: "text-glow-subtle", style: {
                    fontSize: '0.875rem',
                    fontFamily: 'Orbitron, "Courier New", monospace',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }, children: label }), _jsx("div", { className: "text-glow-cyan", style: {
                    fontSize: '2rem',
                    fontFamily: 'Orbitron, "Courier New", monospace',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                }, children: formatTime(time) })] }));
}
export function ProgressBar({ value, max, label, color = 'magenta', showPercentage = false, }) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const colorMap = {
        magenta: '#a855f7',
        cyan: '#22d3ee',
        violet: '#8b5cf6',
    };
    return (_jsxs(GlassPanel, { variant: "subtle", style: {
            padding: '0.75rem 1rem',
            minWidth: '200px',
        }, children: [label && (_jsxs("div", { className: "text-glow-subtle", style: {
                    fontSize: '0.75rem',
                    fontFamily: 'Orbitron, "Courier New", monospace',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                }, children: [label, showPercentage && ` ${Math.round(percentage)}%`] })), _jsx("div", { style: {
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                }, children: _jsx("div", { style: {
                        width: `${percentage}%`,
                        height: '100%',
                        background: colorMap[color],
                        boxShadow: `0 0 10px ${colorMap[color]}`,
                        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderRadius: '4px',
                    } }) })] }));
}
export function GlassButton({ children, onClick, variant = 'secondary', disabled = false, className = '', neonAccent = 'none', size = 'medium', title, style = {}, }) {
    const variantClass = variant === 'primary' ? 'glass-button-primary' : '';
    const sizeClass = size !== 'medium' ? `glass-button-${size}` : '';
    const accentClass = neonAccent !== 'none' ? `glass-neon-${neonAccent}` : '';
    return (_jsx("button", { className: `glass-button ${variantClass} ${sizeClass} ${accentClass} ${className}`.trim(), onClick: onClick, disabled: disabled, title: title, style: {
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
            ...style,
        }, children: children }));
}
export function PauseOverlay({ onResume, onExit, title = 'PAUSED' }) {
    return (_jsx("div", { className: "hud-overlay animate-fadeIn", children: _jsxs("div", { style: {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
            }, children: [_jsx("h1", { className: "text-glow-primary animate-pulseGlow", style: {
                        fontSize: '4rem',
                        fontFamily: 'Orbitron, "Courier New", monospace',
                        fontWeight: 700,
                        margin: 0,
                        letterSpacing: '0.1em',
                    }, children: title }), _jsxs(GlassPanel, { variant: "elevated", neonAccent: "magenta", style: {
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        minWidth: '300px',
                    }, className: "animate-slideUp", children: [_jsx(GlassButton, { variant: "primary", onClick: onResume, children: "Resume" }), _jsx(GlassButton, { onClick: onExit, children: "Exit to Menu" })] })] }) }));
}
export function StatsDisplay({ stats, title, position = 'top-right' }) {
    const positionStyles = {
        'top-left': { top: '2rem', left: '2rem' },
        'top-right': { top: '2rem', right: '2rem' },
        'bottom-left': { bottom: '2rem', left: '2rem' },
        'bottom-right': { bottom: '2rem', right: '2rem' },
    };
    return (_jsxs(GlassPanel, { variant: "subtle", style: {
            position: 'absolute',
            ...positionStyles[position],
            padding: '1rem 1.5rem',
            minWidth: '200px',
            zIndex: 50,
        }, children: [title && (_jsx("div", { className: "text-glow-primary", style: {
                    fontSize: '1rem',
                    fontFamily: 'Orbitron, "Courier New", monospace',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                }, children: title })), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' }, children: stats.map((stat, index) => (_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.875rem',
                        fontFamily: 'Orbitron, "Courier New", monospace',
                    }, children: [_jsx("span", { className: "text-glow-subtle", style: { opacity: 0.8 }, children: stat.label }), _jsx("span", { className: "text-glow-cyan", style: { fontWeight: 600 }, children: stat.value })] }, index))) })] }));
}
