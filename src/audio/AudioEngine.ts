import { useEffect, useState } from "react";

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log("[AudioEngine] AudioContext created");
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
      console.warn("[AudioEngine] resume() failed", err);
    }
  }
}

export function useAudioInit() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const unlock = async () => {
      await ensureAudioStarted();
      setReady(true);
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    };
    document.addEventListener("click", unlock);
    document.addEventListener("keydown", unlock);
    document.addEventListener("touchstart", unlock);
    return () => {
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    };
  }, []);
  return ready;
}

