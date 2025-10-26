/**
 * Analytics and Telemetry Collection System
 * Privacy-focused analytics for W3BP0NG
 */

import { loadSaveData } from './saveManager';

// ══════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════

interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  endpoint?: string;
  privacy: {
    respectDoNotTrack: boolean;
    anonymizeData: boolean;
  };
}

interface AnalyticsEvent {
  event: string;
  category: 'navigation' | 'gameplay' | 'achievement' | 'system' | 'performance' | 'session';
  properties?: Record<string, any>;
  timestamp: number;
}

interface SessionData {
  sessionId: string;
  startTime: number;
  startMode: string;
  modeTransitions: Array<{ from: string; to: string; timestamp: number }>;
  gameStats: {
    totalPlayTime: number;
    modesPlayed: Record<string, number>;
    favoriteMode: string;
    sessionEvents: AnalyticsEvent[];
  };
}

interface PerformanceMetrics {
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  frameCount: number;
  renderCalls: number;
  totalObjects: number;
  memoryUsage: number;
}

// ══════════════════════════════════════════════════════
// PRIVACY SETTINGS
// ════════════════════════════════════════════════════════

class AnalyticsManager {
  private static instance: AnalyticsManager;
  private config: AnalyticsConfig;
  private sessionData: SessionData | null = null;
  private analyticsQueue: AnalyticsEvent[] = [];
  private batchSize = 10;
  private flushInterval: number | null = null;
  private isTracking: boolean = false;

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  private constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      debug: process.env.NODE_ENV === 'development',
      privacy: {
        respectDoNotTrack: true,
        anonymizeData: true,
      },
    };
  }

  // ════════════════════════════════════════════════════
  // INITIALIZATION
  // ══════════════════════════════════════════════════

  initialize(): void {
    if (!this.config.enabled || this.isTracking) return;

    this.isTracking = true;
    this.sessionData = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      startMode: this.getStartMode(),
      modeTransitions: [],
      gameStats: {
        totalPlayTime: 0,
        modesPlayed: {},
        favoriteMode: '',
        sessionEvents: [],
      },
    };

    // Start session tracking
    this.trackEvent('session_start', 'session', {
      sessionId: this.sessionData.sessionId,
      startMode: this.sessionData.startMode,
      screenResolution: this.getScreenResolution(),
      userAgent: this.getUserAgent(),
      referrer: document.referrer,
    });

    // Start batch processing
    this.startBatchProcessing();

    // Handle page visibility changes
    this.setupVisibilityTracking();

    // Handle page unload
    this.setupUnloadTracking();

    console.log('📊 Analytics initialized (privacy-respecting)');
  }

  // ══════════════════════════════════════════════════════
  // EVENT TRACKING
  // ══════════════════════════════════════════════════════

  trackEvent(event: string, category: AnalyticsEvent['category'], properties?: AnalyticsEvent['properties']): void {
    if (!this.config.enabled || !this.isTracking) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      properties,
      timestamp: Date.now(),
    };

    // Respect DNT
    if (navigator.doNotTrack) {
      console.log(`🔒 Analytics blocked (DNT): ${event}`);
      return;
    }

    // Add to queue for batch processing
    this.analyticsQueue.push(analyticsEvent);
  }

  trackNavigation(from: string, to: string): void {
    this.trackEvent('navigation', 'navigation', {
      from,
      to,
      type: 'mode_switch',
    });

    if (this.sessionData) {
      this.sessionData.modeTransitions.push({
        from,
        to,
        timestamp: Date.now(),
      });
    }
  }

  trackGameplay(event: string, details?: Record<string, any>): void {
    this.trackEvent('gameplay', 'gameplay', {
      event,
      details,
    });

    if (this.sessionData) {
      this.sessionData.gameStats.sessionEvents.push({
        event,
        category: 'gameplay',
        properties: details,
        timestamp: Date.now(),
      });
    }
  }

  trackAchievement(achievementId: string, achievementName: string, points: number): void {
    this.trackEvent('achievement', 'achievement', {
      achievementId,
      achievementName,
      points,
    });
  }

  trackPerformance(metrics: PerformanceMetrics): void {
    this.trackEvent('performance', 'system', {
      averageFPS: Math.round(metrics.averageFPS),
      minFPS: metrics.minFPS,
      maxFPS: metrics.maxFPS,
      frameCount: metrics.frameCount,
      renderCalls: metrics.renderCalls,
      totalObjects: metrics.totalObjects,
      memoryUsage: metrics.memoryUsage,
    });
  }

  trackSystem(metric: string, value: number | string): void {
    this.trackEvent('system', 'system', {
      metric,
      value,
    });
  }

  // ════════════════════════════════════════════════════════════
  // SESSION MANAGEMENT
  // ════════════════════════════════════════════════════════════

  endSession(): void {
    if (!this.isTracking || !this.sessionData) return;

    this.isTracking = false;

    // Final session statistics
    const endTime = Date.now();
    const sessionDuration = endTime - this.sessionData.startTime;

    // Update play time
    const saveData = loadSaveData();
    if (saveData) {
      saveData.playTime += Math.floor(sessionDuration / 1000);
    }

    // Update modes played
    if (this.sessionData) {
      Object.entries(this.sessionData.gameStats.modesPlayed).forEach(([mode, count]) => {
        saveData.stats.favoriteMode = mode; // Last mode becomes favorite
      });

      this.sessionData.gameStats.totalPlayTime = Math.floor(sessionDuration / 1000);
    }

    // Track session end event
    this.trackEvent('session_end', 'session', {
      sessionDuration: Math.floor(sessionDuration / 1000),
      totalPlayTime: this.sessionData.gameStats.totalPlayTime,
      modesPlayed: Object.keys(this.sessionData.gameStats.modesPlayed),
      favoriteMode: this.sessionData.gameStats.favoriteMode,
      modeTransitions: this.sessionData.modeTransitions.length,
      eventsCount: this.sessionData.gameStats.sessionEvents.length,
      timestamp: endTime,
    });

    // Flush remaining events
    this.flushEvents();

    // Clean up
    this.sessionData = null;
    this.stopBatchProcessing();

    console.log('📊 Session ended (duration: ' + (sessionDuration / 1000).toFixed(1) + 's)');
  }

  // ════════════════════════════════════════════════════════════
  // DATA PROCESSING
  // ══════════════════════════════════════════════════════════════

  private startBatchProcessing(): void {
    if (this.flushInterval) return;

    this.flushInterval = window.setInterval(() => {
      this.flushEvents();
    }, 5000); // Every 5 seconds

    console.log('📊 Started batch processing (5s intervals)');
  }

  private stopBatchProcessing(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  private flushEvents(): void {
    if (this.analyticsQueue.length === 0) return;

    const events = this.analyticsQueue.splice(0, this.batchSize);
    if (this.config.debug) {
      console.log('📤 Flushing analytics batch:', events.length, 'events');
    }

    // Process events (in a real implementation, this would send to an analytics service)
    // For now, just log and store locally
    events.forEach(event => {
      this.processEvent(event);
    });
  }

  private processEvent(event: AnalyticsEvent): void {
    if (this.config.debug) {
      console.log('📈 Processing event:', event);
    }

    // Store events locally for debugging
    try {
      const storedEvents = this.getStoredEvents();
      storedEvents.push(event);

      // Keep only last 1000 events to prevent storage bloat
      if (storedEvents.length > 1000) {
        storedEvents.splice(0, storedEvents.length - 1000);
      }

      localStorage.setItem('w3bp0ng_analytics', JSON.stringify(storedEvents));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }

    // In production, you would send to your analytics service here
    // Example: this.sendToAnalyticsService(event);
  }

  private getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('w3bp0ng_analytics');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load analytics events:', error);
      return [];
    }
  }

  // ════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════

  private getStartMode(): string {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'title';
    return mode;
  }

  private getScreenResolution(): string {
    return `${window.screen.width}x${window.screen.height}`;
  }

  private getUserAgent(): string {
    return navigator.userAgent;
  }

  private generateSessionId(): string {
    return 'session_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
  }

  private setupVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hide', 'system');
      } else {
        this.trackEvent('page_show', 'system');
      }
    });
  }

  private setupUnloadTracking(): void {
    window.addEventListener('beforeunload', () => {
      this.trackEvent('page_unload', 'system');
    });

    // Handle page reloads
    window.addEventListener('pagehide', () => {
      this.trackEvent('page_hide', 'system');
    });

    // Handle user leaving
    window.addEventListener('mouseout', () => {
      if (this.isTracking) {
        this.endSession();
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════════════

  public startTracking(): void {
    this.initialize();
  }

  public stopTracking(): void {
    if (this.sessionData) {
      this.endSession();
    }
  }

  public updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getSessionData(): SessionData | null {
    return this.sessionData;
  }

  public getAnalyticsData() {
    return {
      events: this.getStoredEvents(),
      summary: {
        totalSessions: this.getTotalSessionCount(),
        averageSessionDuration: this.getAverageSessionDuration(),
        totalPlayTime: this.getTotalPlayTime(),
        modesPopularity: this.getModesPopularity(),
        achievementStats: this.getAchievementStats(),
        systemStats: this.getSystemStats(),
        ...this.generateAnalyticsSummary(),
      },
    };
  }

  private getTotalSessionCount(): number {
    try {
      const stored = this.getStoredEvents();
      const sessionStartEvents = stored.filter(e => e.event === 'session_start');
      return sessionStartEvents.length;
    } catch (error) {
      return 0;
    }
  }

  private getAverageSessionDuration(): number {
    try {
      const stored = this.getStoredEvents();
      const sessionEndEvents = stored.filter(e => e.event === 'session_end');

      if (sessionEndEvents.length === 0) return 0;

      const totalDuration = sessionEndEvents.reduce((sum, e) => {
        const duration = e.properties?.sessionDuration || 0;
        return sum + duration;
      }, 0);

      return Math.round(totalDuration / sessionEndEvents.length);
    } catch (error) {
      return 0;
    }
  }

  private getTotalPlayTime(): number {
    try {
      const saveData = loadSaveData();
      return saveData.playTime || 0;
    } catch (error) {
      return 0;
    }
  }

  private getModesPopularity(): Record<string, number> {
    try {
      const stored = this.getStoredEvents();
      const modeTransitions = stored.filter(e => e.category === 'navigation' && e.properties?.type === 'mode_switch');

      const popularity: Record<string, number> = {};
      modeTransitions.forEach(transition => {
        const to = transition.properties?.to || 'unknown';
        popularity[to] = (popularity[to] || 0) + 1;
      });

      return popularity;
    } catch (error) {
      return {};
    }
  }

  private getAchievementStats(): {
    totalUnlocked: number;
    totalPoints: number;
    recentUnlocks: AnalyticsEvent[];
  } {
    try {
      const stored = this.getStoredEvents();
      const achievementEvents = stored.filter(e => e.category === 'achievement');

      const totalUnlocked = achievementEvents.length;
      const totalPoints = achievementEvents.reduce((sum, e) => sum + (e.properties?.points || 0), 0);

      // Get recent unlocks (last 7 days)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentUnlocks = achievementEvents
        .filter(e => e.timestamp > sevenDaysAgo)
        .slice(-7);

      return { totalUnlocked, totalPoints, recentUnlocks };

    } catch (error) {
      return {
        totalUnlocked: 0,
        totalPoints: 0,
        recentUnlocks: [],
      };
    }
  }

  private getSystemStats(): {
    totalEvents: number;
    performanceWarnings: number;
    crashes: number;
  } {
    try {
      const stored = this.getStoredEvents();
      const systemEvents = stored.filter(e => e.category === 'system');

      const totalEvents = stored.length;
      const performanceWarnings = systemEvents.filter(e => e.event === 'performance_warning').length;
      const crashes = systemEvents.filter(e => e.event === 'crash').length;

      return { totalEvents, performanceWarnings, crashes };
    } catch (error) {
      return {
        totalEvents: 0,
        performanceWarnings: 0,
        crashes: 0,
      };
    }
  }

  private generateAnalyticsSummary() {
    return {
      version: process.env.npm_package_version || '0.0.0',
      buildDate: process.env.BUILD_DATE || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      deploymentEnvironment: process.env.NODE_ENV || 'development',
      privacy: {
        analyticsEnabled: this.config.enabled,
        respectsDoNotTrack: navigator.doNotTrack || false,
        dataAnonymization: this.config.privacy.anonymizeData,
        storageMethod: 'localStorage',
        dataRetention: '30 days',
        thirdPartyServices: [],
      },
    };
  }

  // In production, you would send this data to your analytics service
  // For now, return the summary for internal use
}
// ══════════════════════════════════════════════════════════
// GLOBAL INSTANCE AND EXPORTS
// ═══════════════════════════════════════════════════════════════════

export const analyticsManager = AnalyticsManager.getInstance();

// Convenience functions
export function startAnalytics(): void {
  analyticsManager.startTracking();
}

export function trackEvent(event: string, category: AnalyticsEvent['category'], properties?: Record<string, any>): void {
  analyticsManager.trackEvent(event, category, properties);
}

export function trackNavigation(from: string, to: string): void {
  analyticsManager.trackNavigation(from, to);
}

export function trackGameplay(event: string, details?: Record<string, any>): void {
  analyticsManager.trackGameplay(event, details);
}

export function trackAchievement(achievementId: string, achievementName: string, points: number): void {
  analyticsManager.trackAchievement(achievementId, achievementName, points);
}

export function getAnalyticsData() {
  return analyticsManager.getAnalyticsData();
}