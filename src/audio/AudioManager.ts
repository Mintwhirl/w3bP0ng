/**
 * AudioManager - Procedural sound effects using Web Audio API
 *
 * Design principles:
 * - Pure procedural synthesis (no audio files)
 * - Graceful degradation if AudioContext unavailable
 * - Dynamic sound variations based on game state
 * - Low latency for responsive feedback
 */

export type SoundType = 'paddleHit' | 'wallBounce' | 'powerUp' | 'score' | 'victory';

export interface SoundConfig {
  enabled: boolean;
  volume: number; // 0 to 1
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean;
  private volume: number;

  constructor(config: SoundConfig = { enabled: true, volume: 1.0 }) {
    this.enabled = config.enabled;
    this.volume = Math.max(0, Math.min(1, config.volume));
  }

  /**
   * Initialize AudioContext (must be called after user interaction)
   */
  initialize(): void {
    if (this.audioContext) return;

    try {
      this.audioContext = new AudioContext();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  /**
   * Resume AudioContext if suspended (browser autoplay policy)
   */
  private async resumeContext(): Promise<void> {
    if (!this.audioContext || this.audioContext.state !== 'suspended') return;

    try {
      await this.audioContext.resume();
    } catch (error) {
      console.warn('Failed to resume AudioContext:', error);
    }
  }

  /**
   * Play paddle hit sound with dynamic frequency based on ball speed
   */
  playPaddleHit(ballSpeed: number = 10): void {
    if (!this.enabled || !this.audioContext) return;

    this.resumeContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Create nodes
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filterNode = ctx.createBiquadFilter();

    // Configure filter for sharper attack
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(2000, now);
    filterNode.Q.setValueAtTime(1, now);

    // Dynamic frequency based on ball speed (800-1400 Hz range)
    const baseFreq = 800 + ballSpeed * 30;
    oscillator.frequency.setValueAtTime(baseFreq, now);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, now + 0.1);

    // Sharp attack, quick decay (ADSR envelope)
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3 * this.volume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    // Connect and play
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  /**
   * Play wall bounce sound (softer, lower frequency)
   */
  playWallBounce(): void {
    if (!this.enabled || !this.audioContext) return;

    this.resumeContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Descending "thump" (150 -> 80 Hz)
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.2);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2 * this.volume, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.25);
  }

  /**
   * Play power-up pickup sound (ascending chime)
   */
  playPowerUp(): void {
    if (!this.enabled || !this.audioContext) return;

    this.resumeContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // C major arpeggio: C, E, G, C (octave)
    const frequencies = [523, 659, 784, 1047];

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      const startTime = now + index * 0.1;

      oscillator.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15 * this.volume, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }

  /**
   * Play score point sound (short descending tone)
   */
  playScore(): void {
    if (!this.enabled || !this.audioContext) return;

    this.resumeContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.25 * this.volume, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.35);
  }

  /**
   * Play victory fanfare (ascending major scale)
   */
  playVictory(): void {
    if (!this.enabled || !this.audioContext) return;

    this.resumeContext();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Victory melody: C, E, G, C, E (major chord progression)
    const notes = [523, 659, 784, 1047, 1319];

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      const startTime = now + index * 0.15;

      oscillator.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2 * this.volume, startTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
    });
  }

  /**
   * Enable/disable all sounds
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Set master volume (0 to 1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current enabled state
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Clean up AudioContext
   */
  destroy(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
