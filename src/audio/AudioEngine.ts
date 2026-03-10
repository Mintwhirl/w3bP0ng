import { musicEngine, type MusicTheme } from './MusicEngine';

let audioCtx: AudioContext | null = null;
let unlockListenersAdded = false;
let isUnlocked = false;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log("[AudioEngine] Created AudioContext (suspended)");
  }
  return audioCtx;
}

export function getAudioContextState(): AudioContextState {
  return audioCtx?.state || 'suspended';
}

export async function ensureAudioStarted(): Promise<boolean> {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
      console.log("[AudioEngine] AudioContext resumed");
      return ctx.state === "running";
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
      console.log("[AudioEngine] Audio unlocked by gesture");
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
