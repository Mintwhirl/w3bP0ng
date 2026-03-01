/**
 * ModeTransition Component
 * Simplified fade transitions between game modes
 */

import { useEffect, useState, type ReactNode } from 'react';
import '../styles/glassmorphism.css';

interface ModeTransitionProps {
  children: ReactNode;
  mode: string;
  duration?: number;
}

export function ModeTransition({ children, mode, duration = 400 }: ModeTransitionProps) {
  const [opacity, setOpacity] = useState(1);
  const [currentContent, setCurrentContent] = useState(children);

  useEffect(() => {
    // Simple transition: fade out, change content, fade in
    setOpacity(0);

    const timer = setTimeout(() => {
      setCurrentContent(children);
      setOpacity(1);
    }, duration / 2);

    return () => clearTimeout(timer);
  }, [children, duration]);

  return (
    <div
      className="mode-transition-wrapper"
      style={{
        opacity,
        transition: `opacity ${duration / 2}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        width: '100%',
        height: '100%',
      }}
    >
      {currentContent}
    </div>
  );
}

export default ModeTransition;
