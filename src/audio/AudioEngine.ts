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

export async function ensureAudioStarted(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
      console.log("[AudioEngine] AudioContext resumed");
    } catch (err) {
      console.warn("[AudioEngine] resume() failed:", err);
    }
  }
}

export function unlockAudioOnUserGesture() {
  if (isUnlocked || unlockListenersAdded) return;
  unlockListenersAdded = true;

  const unlock = async () => {
    await ensureAudioStarted();
    isUnlocked = true;
    console.log("[AudioEngine] Audio unlocked by gesture");
    document.removeEventListener("click", unlock);
    document.removeEventListener("keydown", unlock);
    document.removeEventListener("touchstart", unlock);
  };

  document.addEventListener("click", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });
  document.addEventListener("touchstart", unlock, { once: true });
}

export function isAudioReady(): boolean {
  return isUnlocked;
}
