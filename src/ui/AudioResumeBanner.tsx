import { useState, useEffect } from 'react';
import { isAudioReady, ensureAudioStarted, getAudioContextState } from '../audio/AudioEngine';
import { GlassPanel, GlassButton } from './GlassHUD';
import './AudioResumeBanner.css';

export function AudioResumeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check state periodically
    const interval = setInterval(() => {
      const ready = isAudioReady();
      const suspended = getAudioContextState() === 'suspended';

      if (ready) {
        setShow(false);
      } else if (suspended) {
        // Only show after a grace period of 3 seconds to avoid flashing on load
        const timer = setTimeout(() => {
          if (!isAudioReady()) setShow(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleResume = async () => {
    const success = await ensureAudioStarted();
    if (success) {
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <GlassPanel 
      variant="elevated" 
      neonAccent="magenta" 
      className="audio-resume-banner animate-slideUp"
    >
      <div className="audio-resume-content">
        <span className="audio-icon">🔊</span>
        <div className="audio-text">
          <p className="audio-title">AUDIO SUSPENDED</p>
          <p className="audio-desc">Browser blocked autoplay. Tap to enable sound.</p>
        </div>
        <GlassButton 
          variant="primary" 
          onClick={handleResume} 
          className="audio-resume-btn"
        >
          RESUME
        </GlassButton>
      </div>
    </GlassPanel>
  );
}
