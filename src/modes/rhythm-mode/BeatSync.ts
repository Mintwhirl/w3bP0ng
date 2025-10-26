/**
 * Beat Synchronization System
 * Handles beat timing, hit accuracy detection, and rhythm tracking
 */

import type { Track, HitAccuracy, BeatTiming } from './types';
import { DEFAULT_BEAT_TIMING } from './types';

/**
 * BeatSync - Core beat synchronization and timing system
 */
export class BeatSync {
  private bpm: number;
  private duration: number;
  private beatTimestamps: number[];
  private timing: BeatTiming;

  constructor(bpm: number, duration: number, timing: BeatTiming = DEFAULT_BEAT_TIMING) {
    this.bpm = bpm;
    this.duration = duration;
    this.timing = timing;
    this.beatTimestamps = this.generateBeatTimestamps();
  }

  /**
   * Generates precise timestamps for all beats in the track
   */
  private generateBeatTimestamps(): number[] {
    const beatInterval = 60000 / this.bpm; // ms per beat
    const totalBeats = Math.floor((this.duration * 1000) / beatInterval);
    const timestamps: number[] = [];

    for (let i = 0; i < totalBeats; i++) {
      timestamps.push(i * beatInterval);
    }

    return timestamps;
  }

  /**
   * Get all beat timestamps for the track
   */
  getBeatTimestamps(): number[] {
    return [...this.beatTimestamps];
  }

  /**
   * Check hit timing accuracy against a specific beat
   */
  checkHitTiming(hitTime: number, currentBeat: number): HitAccuracy {
    if (currentBeat < 0 || currentBeat >= this.beatTimestamps.length) {
      return 'miss';
    }

    const beatTime = this.beatTimestamps[currentBeat];
    if (beatTime === undefined) {
      return 'miss';
    }

    const timeDiff = Math.abs(hitTime - beatTime);

    if (timeDiff <= this.timing.perfect) {
      return 'perfect';
    } else if (timeDiff <= this.timing.good) {
      return 'good';
    } else {
      return 'miss';
    }
  }

  /**
   * Get the current beat index based on elapsed time
   */
  getCurrentBeat(elapsedTime: number): number {
    for (let i = 0; i < this.beatTimestamps.length; i++) {
      const beatTime = this.beatTimestamps[i];
      if (beatTime !== undefined && beatTime >= elapsedTime) {
        return i;
      }
    }
    return Math.max(0, this.beatTimestamps.length - 1);
  }

  /**
   * Get the timestamp of the next beat
   */
  getNextBeatTime(elapsedTime: number): number {
    const currentBeat = this.getCurrentBeat(elapsedTime);
    if (currentBeat < this.beatTimestamps.length && this.beatTimestamps[currentBeat] !== undefined) {
      return this.beatTimestamps[currentBeat];
    }
    return this.beatTimestamps[this.beatTimestamps.length - 1] || 0;
  }

  /**
   * Get beat progress for pulse animations (0-1)
   */
  getBeatProgress(elapsedTime: number): number {
    const currentBeat = this.getCurrentBeat(elapsedTime);

    if (currentBeat === 0) {
      const nextBeatTime = this.beatTimestamps[0];
      if (!nextBeatTime) return 0;
      return Math.min(elapsedTime / nextBeatTime, 1);
    }

    const prevBeatTime = this.beatTimestamps[currentBeat - 1] || 0;
    const nextBeatTime = this.beatTimestamps[currentBeat];
    if (!nextBeatTime) return 1;

    const beatDuration = nextBeatTime - prevBeatTime;
    if (beatDuration === 0) return 0;

    const progress = (elapsedTime - prevBeatTime) / beatDuration;
    return Math.max(0, Math.min(1, progress));
  }

  /**
   * Get total number of beats in the track
   */
  getTotalBeats(): number {
    return this.beatTimestamps.length;
  }

  /**
   * Check if we're within a hit window for the current beat
   */
  isInHitWindow(elapsedTime: number): boolean {
    const currentBeat = this.getCurrentBeat(elapsedTime);
    if (currentBeat >= this.beatTimestamps.length) return false;

    const beatTime = this.beatTimestamps[currentBeat];
    if (beatTime === undefined) return false;

    const timeDiff = Math.abs(elapsedTime - beatTime);

    return timeDiff <= this.timing.good;
  }
}

/**
 * Create a default track for a given difficulty level
 */
export function createDefaultTrack(difficulty: 'easy' | 'normal' | 'hard'): Track {
  const configs = {
    easy: {
      name: 'Synthwave Sunrise',
      bpm: 90,
      duration: 60
    },
    normal: {
      name: 'Neon Pulse',
      bpm: 120,
      duration: 90
    },
    hard: {
      name: 'Cyber Rush',
      bpm: 160,
      duration: 120
    }
  };

  const config = configs[difficulty];
  const beatSync = new BeatSync(config.bpm, config.duration);

  return {
    name: config.name,
    bpm: config.bpm,
    duration: config.duration,
    beats: beatSync.getBeatTimestamps()
  };
}
