/**
 * EngineTicker - Centralized requestAnimationFrame management
 * 
 * Performance design:
 * - Consolidates multiple rAF loops into a single master ticker
 * - Reduces CPU overhead and context switching
 * - Provides consistent deltaTime to all subscribers
 * - Allows pausing groups of animations (e.g. UI vs Game)
 * - Supports accessibility (Reduced Motion)
 */

export type TickerListener = (time: number, deltaTime: number) => void;

export enum TickerGroup {
  GAME = 'game',
  UI = 'ui',
  BACKGROUND = 'background',
  MONITOR = 'monitor'
}

interface ListenerEntry {
  callback: TickerListener;
  group: TickerGroup;
  active: boolean;
}

class EngineTicker {
  private static instance: EngineTicker;
  private listeners: Map<string, ListenerEntry> = new Map();
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private pausedGroups: Set<TickerGroup> = new Set();
  
  // Accessibility
  private reducedMotion: boolean = false;

  private constructor() {
    // Check initial user preference
    if (typeof window !== 'undefined') {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  static getInstance(): EngineTicker {
    if (!EngineTicker.instance) {
      EngineTicker.instance = new EngineTicker();
    }
    return EngineTicker.instance;
  }

  setReducedMotion(enabled: boolean): void {
    this.reducedMotion = enabled;
  }

  register(id: string, callback: TickerListener, group: TickerGroup = TickerGroup.UI): () => void {
    this.listeners.set(id, { callback, group, active: true });
    
    if (!this.isRunning && import.meta.env.MODE !== 'test') {
      this.start();
    }

    return () => this.unregister(id);
  }

  unregister(id: string): void {
    this.listeners.delete(id);
    if (this.listeners.size === 0) {
      this.stop();
    }
  }

  pause(): void { this.isPaused = true; }
  resume(): void { 
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  pauseGroup(group: TickerGroup): void { this.pausedGroups.add(group); }
  resumeGroup(group: TickerGroup): void { this.pausedGroups.delete(group); }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private tick = (time: number): void => {
    if (!this.isRunning) return;

    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    if (!this.isPaused) {
      // In reduced motion mode, we slow down background/UI animations significantly
      // Game logic remains consistent but visual effects should honor the setting
      
      const cappedDelta = Math.min(deltaTime, 100);

      this.listeners.forEach((entry) => {
        if (entry.active && !this.pausedGroups.has(entry.group)) {
          let effectiveDelta = cappedDelta;
          
          // Apply reduction to secondary animations
          if (this.reducedMotion && 
              (entry.group === TickerGroup.BACKGROUND || entry.group === TickerGroup.UI)) {
            effectiveDelta *= 0.2; // Slow down visual noise by 80%
          }

          try {
            entry.callback(time, effectiveDelta);
          } catch (e) {
            console.error(`Error in ticker listener:`, e);
          }
        }
      });
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };
}

export const ticker = EngineTicker.getInstance();
