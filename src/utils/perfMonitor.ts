/**
 * Performance Monitor
 * Real-time FPS, render time, and object count monitoring
 */

// ═════════════════════════════════════════════════════════
// PERFORMANCE CONFIGURATION
// ═════════════════════════════════════════════════════════

export interface PerformanceStats {
  fps: number;
  averageFPS: number;
  frameTime: number;
  averageFrameTime: number;
  objectCount: number;
  memoryUsage: number;
  renderCalls: number;
  physicsTime: number;
}

export interface PerformanceConfig {
  enabled: boolean;
  showOverlay: boolean;
  updateInterval: number;
  historySize: number;
  logToConsole: boolean;
  warningFPS: number;
  criticalFPS: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private config: PerformanceConfig = {
    enabled: true,
    showOverlay: false,
    updateInterval: 500, // Update overlay every 500ms
    historySize: 60, // Keep 60 frames of history
    logToConsole: false,
    warningFPS: 45,
    criticalFPS: 30,
  };

  // Performance tracking
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;
  private frameHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private renderCalls = 0;
  private lastUpdateTime = 0;
  private overlayElement: HTMLElement | null = null;
  private updateTimer: ReturnType<typeof setInterval> | null = null;
  
  // Performance stats
  private stats: PerformanceStats = {
    fps: 0,
    averageFPS: 0,
    frameTime: 0,
    averageFrameTime: 0,
    objectCount: 0,
    memoryUsage: 0,
    renderCalls: 0,
    physicsTime: 0,
  };

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // ═════════════════════════════════════════════════════════
  // MONITORING CONTROL
  // ═════════════════════════════════════════════════════════

  start(): void {
    if (!this.config.enabled) return;

    this.lastTime = performance.now();
    this.frameCount = 0;
    this.lastUpdateTime = 0;

    // Setup overlay
    if (this.config.showOverlay) {
      this.createOverlay();
      this.startOverlayUpdates();
    }

    // Setup keyboard shortcut (F3)
    this.setupKeyboardShortcuts();

    // Start main monitoring loop
    requestAnimationFrame(this.frame.bind(this));

    console.log('📊 Performance Monitor started');
  }

  stop(): void {
    this.config.enabled = false;

    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }

    console.log('📊 Performance Monitor stopped');
  }

  toggle(): void {
    this.config.showOverlay = !this.config.showOverlay;

    if (this.config.showOverlay) {
      this.createOverlay();
      this.startOverlayUpdates();
    } else {
      this.hideOverlay();
    }
  }

  // ═════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═════════════════════════════════════════════════════════

  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update overlay visibility if changed
    if (newConfig.showOverlay !== undefined) {
      if (newConfig.showOverlay) {
        this.createOverlay();
        this.startOverlayUpdates();
      } else {
        this.hideOverlay();
      }
    }
  }

  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  // ═════════════════════════════════════════════════════════
  // FRAME MONITORING
  // ═════════════════════════════════════════════════════════

  private frame = (currentTime: number): void => {
    if (!this.config.enabled) return;

    const deltaTime = currentTime - this.lastTime;
    this.frameCount++;
    this.renderCalls++;

    // Calculate FPS
    this.fps = Math.round(1000 / deltaTime);
    this.frameHistory.push(this.fps);

    if (this.frameHistory.length > this.config.historySize) {
      this.frameHistory.shift();
    }

    // Calculate average FPS
    this.stats.fps = this.fps;
    this.stats.averageFPS = Math.round(
      this.frameHistory.reduce((sum, fps) => sum + fps, 0) / this.frameHistory.length
    );

    // Track frame time
    const frameTime = deltaTime;
    this.frameTimeHistory.push(frameTime);

    if (this.frameTimeHistory.length > this.config.historySize) {
      this.frameTimeHistory.shift();
    }

    this.stats.frameTime = frameTime;
    this.stats.averageFrameTime =
      this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / this.frameTimeHistory.length;

    this.stats.renderCalls = this.renderCalls;

    // Log warnings if enabled
    if (this.config.logToConsole) {
      if (this.fps < this.config.criticalFPS) {
        console.warn(`🚨 CRITICAL FPS: ${this.fps}`);
      } else if (this.fps < this.config.warningFPS) {
        console.warn(`⚠️  Low FPS: ${this.fps}`);
      }
    }

    // Update memory usage periodically
    if (this.frameCount % 60 === 0) { // Every second at 60fps
      this.updateMemoryUsage();
    }

    this.lastTime = currentTime;

    // Continue monitoring
    if (this.config.enabled) {
      requestAnimationFrame(this.frame.bind(this));
    }
  }

  // ═════════════════════════════════════════════════════════
  // OVERLAY MANAGEMENT
  // ═════════════════════════════════════════════════════════

  private createOverlay(): void {
    if (this.overlayElement) return;

    this.overlayElement = document.createElement('div');
    this.overlayElement.id = 'performance-overlay';
    this.overlayElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(11, 0, 26, 0.9);
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 8px;
      padding: 15px;
      font-family: 'Orbitron', monospace;
      font-size: 12px;
      color: #ffffff;
      z-index: 10000;
      backdrop-filter: blur(5px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      min-width: 200px;
    `;

    this.updateOverlayContent();
    document.body.appendChild(this.overlayElement);
  }

  private hideOverlay(): void {
    if (this.overlayElement) {
      this.overlayElement.style.display = 'none';
    }
    }

  private updateOverlayContent(): void {
    if (!this.overlayElement) return;

    const fpsColor = this.stats.fps < this.config.criticalFPS ? '#ef4444' :
                   this.stats.fps < this.config.warningFPS ? '#f97316' : '#10b981';

    const memoryMB = Math.round(this.stats.memoryUsage / 1024 / 1024 * 100) / 100;

    this.overlayElement.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="color: #a855f7; font-weight: bold; margin-bottom: 5px;">
          📊 PERFORMANCE MONITOR
        </div>
        <div>
          <span style="color: ${fpsColor}">FPS:</span>
          <span style="color: #ffffff;"> ${this.stats.fps} (avg: ${this.stats.averageFPS})</span>
        </div>
        <div>
          <span style="color: #22d3ee;">Frame:</span>
          <span style="color: #ffffff;"> ${this.stats.frameTime.toFixed(1)}ms</span>
        </div>
        <div>
          <span style="color: #10b981;">Objects:</span>
          <span style="color: #ffffff;"> ${this.stats.objectCount}</span>
        </div>
        <div>
          <span style="color: #f59e0b;">Memory:</span>
          <span style="color: #ffffff;"> ${memoryMB}MB</span>
        </div>
        <div>
          <span style="color: #ec4899;">Draws:</span>
          <span style="color: #ffffff;"> ${this.stats.renderCalls}</span>
        </div>
        ${this.stats.physicsTime > 0 ? `
        <div>
          <span style="color: #8b5cf6;">Physics:</span>
          <span style="color: #ffffff;"> ${this.stats.physicsTime.toFixed(1)}ms</span>
        </div>
        ` : ''}
      </div>
      <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 10px; color: rgba(255,255,255,0.6);">
        Press F3 to toggle
      </div>
    `;
  }

  private startOverlayUpdates(): void {
    if (this.updateTimer) return;

    this.updateTimer = setInterval(() => {
      this.updateOverlayContent();
    }, this.config.updateInterval);
  }

  private stopOverlayUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  // ═════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═════════════════════════════════════════════════════════

  private updateMemoryUsage(): void {
    if ((performance as any).memory) {
      this.stats.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
  }

  private setupKeyboardShortcuts(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F3') {
        event.preventDefault();
        this.toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
  }

  // ═════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════

  updateObjectCount(count: number): void {
    this.stats.objectCount = count;
  }

  updatePhysicsTime(time: number): void {
    this.stats.physicsTime = time;
  }

  incrementRenderCalls(): void {
    this.stats.renderCalls++;
  }

  getStats(): PerformanceStats {
    return { ...this.stats };
  }

  getMetrics(): {
    fpsStatus: 'good' | 'warning' | 'critical';
    frameTimeStatus: 'good' | 'warning' | 'critical';
    memoryStatus: 'good' | 'warning' | 'critical';
    overallScore: number;
  } {
    const fpsStatus = this.stats.fps >= this.config.warningFPS ? 'good' :
                      this.stats.fps >= this.config.criticalFPS ? 'warning' : 'critical';

    const frameTimeStatus = this.stats.averageFrameTime <= 16.67 ? 'good' : // 60fps
                          this.stats.averageFrameTime <= 33.33 ? 'warning' : 'critical'; // 30fps

    // Memory status (arbitrary thresholds)
    const memoryMB = this.stats.memoryUsage / 1024 / 1024;
    const memoryStatus = memoryMB <= 100 ? 'good' :
                       memoryMB <= 200 ? 'warning' : 'critical';

    // Calculate overall score (0-100)
    const fpsScore = Math.max(0, Math.min(100, (this.stats.averageFPS / 60) * 100));
    const frameScore = Math.max(0, Math.min(100, ((33.33 - this.stats.averageFrameTime) / 33.33) * 100));
    const memoryScore = Math.max(0, Math.min(100, ((200 - memoryMB) / 200) * 100));

    const overallScore = Math.round((fpsScore + frameScore + memoryScore) / 3);

    return {
      fpsStatus,
      frameTimeStatus,
      memoryStatus,
      overallScore,
    };
  }

  // Export performance data
  exportData(): string {
    const data = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      config: this.config,
      metrics: this.getMetrics(),
      system: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        cores: navigator.hardwareConcurrency,
        memory: (navigator as any).deviceMemory,
      },
    };

    return JSON.stringify(data, null, 2);
  }

  // Reset counters
  resetCounters(): void {
    this.frameCount = 0;
    this.renderCalls = 0;
    this.frameHistory = [];
    this.frameTimeHistory = [];
  }

  // Cleanup
  dispose(): void {
    this.stop();
    this.hideOverlay();
  }
}

// ═════════════════════════════════════════════════════════
// GLOBAL INSTANCE AND EXPORTS
// ═════════════════════════════════════════════════════════

export const perfMonitor = PerformanceMonitor.getInstance();

// Convenience functions
export function startPerformanceMonitoring(): void {
  perfMonitor.start();
}

export function stopPerformanceMonitoring(): void {
  perfMonitor.stop();
}

export function updateObjectCount(count: number): void {
  perfMonitor.updateObjectCount(count);
}

export function updatePhysicsTime(time: number): void {
  perfMonitor.updatePhysicsTime(time);
}

export function getPerformanceStats(): PerformanceStats {
  return perfMonitor.getStats();
}

export function togglePerformanceOverlay(): void {
  perfMonitor.toggle();
}

// Development helper
export function logPerformanceMetrics(label: string): void {
  const stats = getPerformanceStats();
  const metrics = perfMonitor.getMetrics();

  console.group(`📊 Performance Metrics: ${label}`);
  console.log('FPS:', stats.fps, '(Average:', stats.averageFPS + ')');
  console.log('Frame Time:', stats.frameTime.toFixed(2) + 'ms', '(Average:', stats.averageFrameTime.toFixed(2) + 'ms)');
  console.log('Object Count:', stats.objectCount);
  console.log('Memory Usage:', (stats.memoryUsage / 1024 / 1024).toFixed(2) + 'MB');
  console.log('Render Calls:', stats.renderCalls);
  console.log('Overall Score:', metrics.overallScore + '/100');
  console.log('FPS Status:', metrics.fpsStatus);
  console.groupEnd();
}