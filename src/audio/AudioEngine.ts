import * as Tone from 'tone';
import { musicEngine, type MusicTheme } from './MusicEngine';

let audioCtx: AudioContext | null = null;
let unlockListenersAdded = false;
let isUnlocked = false;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Link Tone.js to this specific context immediately
    Tone.setContext(audioCtx);
    console.log("[AudioEngine] Created AudioContext and linked Tone.js");
  }
  return audioCtx;
}

export function getAudioContextState(): AudioContextState {
  return audioCtx?.state || 'suspended';
}

export async function ensureAudioStarted(): Promise<boolean> {
  const ctx = getAudioContext();
  
  // Start Tone.js (handles context resume internally if linked)
  await Tone.start();
  
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
      console.log("[AudioEngine] AudioContext resumed");
    } catch (err) {
      console.warn("[AudioEngine] resume() failed:", err);
      return false;
    }
  }
  return ctx.state === "running";
}

export function unlockAudioOnUserGesture() {
  if (isUnlocked || unlockListenersAdded) return;
  unlockListenersAdded = true;

  const unlock = async () => {
    const success = await ensureAudioStarted();
    if (success) {
      isUnlocked = true;
      console.log("[AudioEngine] Audio & Tone.js unlocked by gesture");
      // Trigger a tiny silent sound to "prime" the speakers on iOS
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(0.1);

      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    }
  };

  document.addEventListener("click", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });
  document.addEventListener("touchstart", unlock, { once: true });
}

export function isAudioReady(): boolean {
  return isUnlocked && audioCtx?.state === "running";
}

export interface AudioSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  masterVolume: number;
}

let currentSettings: AudioSettings = {
  soundEnabled: true,
  musicEnabled: true,
  masterVolume: 0.7,
};

export function getAudioSettings(): AudioSettings {
  return { ...currentSettings };
}

export function updateAudioSettings(settings: Partial<AudioSettings>): void {
  currentSettings = { ...currentSettings, ...settings };
  console.log("[AudioEngine] Audio settings updated:", currentSettings);
  
  if (currentSettings.musicEnabled) {
    musicEngine.setVolume(currentSettings.masterVolume);
  } else {
    musicEngine.setVolume(0);
  }
}

/**
 * Sets the audio theme (music/ambience)
 */
export function setAudioTheme(themeId: string, _crossfade: boolean = true, bpm?: number) {
  console.log(`[AudioEngine] Setting audio theme to: ${themeId}`);
  
  if (!currentSettings.musicEnabled || !isAudioReady()) {
    musicEngine.stop();
    return;
  }

  // Map theme strings to MusicTheme type
  const themeMap: Record<string, MusicTheme> = {
    'main': 'main',
    'classic': 'classic',
    'puzzle': 'puzzle',
    'rhythm': 'rhythm',
    'battle': 'battle',
    'editor': 'editor'
  };

  const theme = themeMap[themeId] || 'none';
  musicEngine.setTheme(theme, bpm);
}

/**
 * Maps ball speed to music intensity (BPM and filter brightness)
 */
export function setMusicIntensity(speed: number) {
  if (!currentSettings.musicEnabled || !isAudioReady()) return;
  musicEngine.setIntensity(speed);
}
