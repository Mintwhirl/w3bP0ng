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

const isTest = import.meta.env.MODE === 'test';

export function ModeTransition({ children, mode: _mode, duration = 400 }: ModeTransitionProps) {
  // In tests, we don't want any delay or extra state updates for content
  const [opacity, setOpacity] = useState(isTest ? 1 : 1);
  const [currentContent, setCurrentContent] = useState(children);

  useEffect(() => {
    if (isTest) {
      setCurrentContent(children);
      return;
    }

    // Simple transition: fade out, change content, fade in
    setOpacity(0);

    const timer = setTimeout(() => {
      setCurrentContent(children);
      setOpacity(1);
    }, duration / 2);

    return () => clearTimeout(timer);
  }, [children, duration]);

  if (isTest) {
    return <div className="mode-transition-wrapper-test">{children}</div>;
  }

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
