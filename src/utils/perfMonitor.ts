/**
 * Performance Monitor Utility
 * Tracks FPS, frame time, memory usage, and object counts
 * Now with secure DOM updates and ticker optimization
 */

import { ticker, TickerGroup } from '../engine/EngineTicker';

interface PerfConfig {
  enabled: boolean;
  updateInterval: number; // ms
  warningFPS: number;
  criticalFPS: number;
  showMemory: boolean;
  showObjects: boolean;
}

interface PerfStats {
  fps: number;
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  frameTime: number;
  memoryUsage: number;
  objectCount: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private config: PerfConfig = {
    enabled: true,
    updateInterval: 500,
    warningFPS: 45,
    criticalFPS: 30,
    showMemory: true,
    showObjects: true,
  };

  private stats: PerfStats = {
    fps: 0,
    averageFPS: 0,
    minFPS: 60,
    maxFPS: 0,
    frameTime: 0,
    memoryUsage: 0,
    objectCount: 0,
  };

  private frameCount: number = 0;
  private lastUpdate: number = 0;
  private fpsHistory: number[] = [];
  private isRunning: boolean = false;
  private overlayElement: HTMLDivElement | null = null;
  private unregisterTicker: (() => void) | null = null;
  
  // DOM elements for secure updates
  private fpsValueElement: HTMLSpanElement | null = null;
  private avgFpsValueElement: HTMLSpanElement | null = null;
  private frameTimeValueElement: HTMLSpanElement | null = null;
  private objectCountValueElement: HTMLSpanElement | null = null;
  private memoryValueElement: HTMLSpanElement | null = null;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  start(config?: Partial<PerfConfig>): void {
    if (this.isRunning) return;
    
    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (this.config.enabled && import.meta.env.MODE !== 'test') {
      this.createOverlay();
      this.isRunning = true;
      this.unregisterTicker = ticker.register('perf-monitor', (time, deltaTime) => this.tick(time, deltaTime), TickerGroup.MONITOR);
      console.log('📊 Performance Monitor started');
    }
  }

  stop(): void {
    this.isRunning = false;
    if (this.unregisterTicker) {
      this.unregisterTicker();
      this.unregisterTicker = null;
    }
    if (this.overlayElement) {
      this.overlayElement.style.display = 'none';
    }
  }

  toggle(): void {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }

  private tick(time: number, deltaTime: number): void {
    this.frameCount++;

    // Update FPS calculation
    if (time - this.lastUpdate >= this.config.updateInterval) {
      this.stats.fps = Math.round((this.frameCount * 1000) / (time - this.lastUpdate));
      this.stats.frameTime = deltaTime;
      
      // Update history and stats
      this.fpsHistory.push(this.stats.fps);
      if (this.fpsHistory.length > 20) this.fpsHistory.shift();
      
      this.stats.averageFPS = Math.round(
        this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
      );
      
      if (this.stats.fps < this.stats.minFPS && this.stats.fps > 0) {
        this.stats.minFPS = this.stats.fps;
      }
      if (this.stats.fps > this.stats.maxFPS) {
        this.stats.maxFPS = this.stats.fps;
      }

      // Get memory usage if available
      if (this.config.showMemory && (performance as any).memory) {
        this.stats.memoryUsage = (performance as any).memory.usedJSHeapSize;
      }

      this.updateOverlay();
      
      // Reset counters
      this.frameCount = 0;
      this.lastUpdate = time;
    }
  }

  setObjectCount(count: number): void {
    this.stats.objectCount = count;
  }

  private createOverlay(): void {
    if (this.overlayElement) {
      this.overlayElement.style.display = 'block';
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'perf-monitor-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '10px',
      left: '10px',
      padding: '12px',
      background: 'rgba(15, 5, 25, 0.85)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(168, 85, 247, 0.4)',
      borderRadius: '8px',
      color: '#ffffff',
      fontFamily: "'Orbitron', 'JetBrains Mono', monospace",
      fontSize: '11px',
      zIndex: '9999',
      pointerEvents: 'none',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5), 0 0 10px rgba(168, 85, 247, 0.2)',
      minWidth: '160px',
    });

    const title = document.createElement('div');
    title.textContent = '📊 PERFORMANCE';
    title.style.color = '#a855f7';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '8px';
    title.style.letterSpacing = '1px';
    overlay.appendChild(title);

    const createStatRow = (label: string, labelColor: string) => {
      const row = document.createElement('div');
      row.style.marginBottom = '4px';
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';

      const labelSpan = document.createElement('span');
      labelSpan.textContent = label;
      labelSpan.style.color = labelColor;
      labelSpan.style.marginRight = '8px';

      const valueSpan = document.createElement('span');
      valueSpan.style.color = '#ffffff';
      valueSpan.textContent = '-';

      row.appendChild(labelSpan);
      row.appendChild(valueSpan);
      return { row, valueSpan };
    };

    const fpsRow = createStatRow('FPS', '#10b981');
    this.fpsValueElement = fpsRow.valueSpan;
    overlay.appendChild(fpsRow.row);

    const avgFpsRow = createStatRow('AVG', '#8b5cf6');
    this.avgFpsValueElement = avgFpsRow.valueSpan;
    overlay.appendChild(avgFpsRow.row);

    const frameTimeRow = createStatRow('FRAME', '#22d3ee');
    this.frameTimeValueElement = frameTimeRow.valueSpan;
    overlay.appendChild(frameTimeRow.row);

    if (this.config.showObjects) {
      const objectsRow = createStatRow('OBJECTS', '#f59e0b');
      this.objectCountValueElement = objectsRow.valueSpan;
      overlay.appendChild(objectsRow.row);
    }

    if (this.config.showMemory && (performance as any).memory) {
      const memoryRow = createStatRow('MEMORY', '#ec4899');
      this.memoryValueElement = memoryRow.valueSpan;
      overlay.appendChild(memoryRow.row);
    }

    document.body.appendChild(overlay);
    this.overlayElement = overlay;
  }

  private updateOverlay(): void {
    if (!this.overlayElement) return;

    const fpsColor = this.stats.fps < this.config.criticalFPS ? '#ef4444' :
                   this.stats.fps < this.config.warningFPS ? '#f97316' : '#10b981';

    if (this.fpsValueElement) {
      this.fpsValueElement.textContent = this.stats.fps.toString();
      this.fpsValueElement.style.color = fpsColor;
    }

    if (this.avgFpsValueElement) {
      this.avgFpsValueElement.textContent = this.stats.averageFPS.toString();
    }

    if (this.frameTimeValueElement) {
      this.frameTimeValueElement.textContent = `${this.stats.frameTime.toFixed(1)}ms`;
    }

    if (this.objectCountValueElement) {
      this.objectCountValueElement.textContent = this.stats.objectCount.toString();
    }

    if (this.memoryValueElement) {
      const memoryMB = Math.round(this.stats.memoryUsage / 1024 / 1024 * 10) / 10;
      this.memoryValueElement.textContent = `${memoryMB}MB`;
    }
  }
}

export const perfMonitor = PerformanceMonitor.getInstance();

export function startPerformanceMonitoring(config?: Partial<PerfConfig>): void {
  perfMonitor.start(config);
}

export function togglePerformanceOverlay(): void {
  perfMonitor.toggle();
}

export function updatePerfObjectCount(count: number): void {
  perfMonitor.setObjectCount(count);
}
