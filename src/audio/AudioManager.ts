/**
 * AudioManager - Procedural sound effects using Web Audio API
 *
 * Design principles:
 * - Pure procedural synthesis (no audio files)
 * - Graceful degradation if AudioContext unavailable
 * - Dynamic sound variations based on game state
 * - Low latency for responsive feedback
 */

import { getAudioContext, getAudioSettings } from './AudioEngine';

export type SoundType = 'paddleHit' | 'wallBounce' | 'powerUp' | 'score' | 'victory';

export interface SoundConfig {
  enabled: boolean;
  volume: number; // 0 to 1
}

export class AudioManager {
  private enabled: boolean;
  private volume: number;

  constructor(config: SoundConfig = { enabled: true, volume: 1.0 }) {
    this.enabled = config.enabled;
    this.volume = Math.max(0, Math.min(1, config.volume));
  }

  /**
   * Initialize - now just a placeholder as we use shared context
   */
  initialize(): void {
    // Shared context used now
  }

  /**
   * Play paddle hit sound (Square wave chiptune)
   */
  playPaddleHit(ballSpeed: number = 10): void {
    const settings = getAudioSettings();
    if (!this.enabled || !settings.soundEnabled) return;

    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'square';
    const baseFreq = 400 + ballSpeed * 20;
    oscillator.frequency.setValueAtTime(baseFreq, now);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.1);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.1 * this.volume * settings.masterVolume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  /**
   * Play wall bounce sound (Lower square wave)
   */
  playWallBounce(): void {
    const settings = getAudioSettings();
    if (!this.enabled || !settings.soundEnabled) return;

    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08 * this.volume * settings.masterVolume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  /**
   * Play power-up pickup sound (Ascending square wave arpeggio)
   */
  playPowerUp(): void {
    const settings = getAudioSettings();
    if (!this.enabled || !settings.soundEnabled) return;

    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const freqs = [600, 800, 1200];
    freqs.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const time = now + i * 0.05;

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, time);

      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.05 * this.volume * settings.masterVolume, time + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(time);
      oscillator.stop(time + 0.1);
    });
  }

  /**
   * Play score point sound
   */
  playScore(): void {
    const settings = getAudioSettings();
    if (!this.enabled || !settings.soundEnabled) return;

    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.25);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.12 * this.volume * settings.masterVolume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  /**
   * Play victory fanfare
   */
  playVictory(): void {
    const settings = getAudioSettings();
    if (!this.enabled || !settings.soundEnabled) return;

    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const time = now + i * 0.1;

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, time);

      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.1 * this.volume * settings.masterVolume, time + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(time);
      oscillator.stop(time + 0.4);
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
   * Clean up
   */
  destroy(): void {
    // No longer closing shared context here
  }
}
