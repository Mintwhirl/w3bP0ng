import { useState, useEffect, useCallback } from 'react';
import { GlassPanel } from './GlassHUD';
import { achievementManager, type Achievement } from '../core/achievements';

/**
 * AchievementToast - Global notification system for achievements
 * Follows liquid glass aesthetic with neon animations
 */
export function AchievementToast() {
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = useCallback((achievement: Achievement) => {
    setActiveAchievement(achievement);
    setIsVisible(true);

    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setActiveAchievement(null), 500); // Clear after fade out
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    achievementManager.onAchievementUnlock(showNotification);
  }, [showNotification]);

  if (!activeAchievement) return null;

  return (
    <div className={`achievement-toast-container ${isVisible ? 'visible' : 'hidden'}`}>
      <GlassPanel variant="elevated" neonAccent="magenta" className="achievement-panel">
        <div className="achievement-icon">{activeAchievement.icon}</div>
        <div className="achievement-details">
          <p className="achievement-label">ACHIEVEMENT UNLOCKED</p>
          <h3 className="achievement-name">{activeAchievement.name}</h3>
          <p className="achievement-desc">{activeAchievement.description}</p>
        </div>
        <div className="achievement-points">+{activeAchievement.points}</div>
      </GlassPanel>

      <style>{`
        .achievement-toast-container {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%) translateY(150%);
          z-index: 9999;
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          pointer-events: none;
        }
        .achievement-toast-container.visible {
          transform: translateX(-50%) translateY(0);
        }
        .achievement-panel {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 15px 25px !important;
          min-width: 400px;
          border-left: 4px solid #ff00ff !important;
        }
        .achievement-icon {
          font-size: 2.5rem;
          filter: drop-shadow(0 0 10px rgba(255, 0, 255, 0.5));
        }
        .achievement-details {
          flex: 1;
          text-align: left;
        }
        .achievement-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: #ff00ff;
          margin: 0;
          letter-spacing: 2px;
        }
        .achievement-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem;
          margin: 2px 0;
          color: #ffffff;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
        }
        .achievement-desc {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
        .achievement-points {
          font-family: 'Orbitron', sans-serif;
          color: #00ffff;
          font-weight: bold;
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
}
