import { jsx as _jsx } from "react/jsx-runtime";
/**
 * ModeTransition Component
 * Smooth fade transitions between game modes
 * Maintains visual continuity with particles and cosmic background
 */
import { useEffect, useState } from 'react';
import '../styles/glassmorphism.css';
/**
 * Wraps mode components with smooth fade transitions
 * Preserves background particles and cosmic atmosphere
 */
export function ModeTransition({ children, mode, duration = 800 }) {
    const [currentMode, setCurrentMode] = useState(mode);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayContent, setDisplayContent] = useState(children);
    useEffect(() => {
        if (mode !== currentMode) {
            // Start fade out
            setIsTransitioning(true);
            // Wait for fade out, then switch content
            const switchTimer = setTimeout(() => {
                setCurrentMode(mode);
                setDisplayContent(children);
            }, duration / 2);
            // Complete fade in
            const completeTimer = setTimeout(() => {
                setIsTransitioning(false);
            }, duration);
            return () => {
                clearTimeout(switchTimer);
                clearTimeout(completeTimer);
            };
        }
        else {
            setDisplayContent(children);
            return undefined;
        }
    }, [mode, currentMode, children, duration]);
    return (_jsx("div", { className: "mode-transition-wrapper", style: {
            opacity: isTransitioning ? 0 : 1,
            transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            width: '100%',
            height: '100%',
        }, children: displayContent }));
}
export default ModeTransition;
