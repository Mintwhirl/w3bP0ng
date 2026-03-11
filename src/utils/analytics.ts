import { z } from 'zod';

/**
 * Analytics Utility
 * Handles tracking events, performance metrics, and user behavior
 * Now with Zod validation and robust error handling
 */

export type AnalyticsEventType = 
  | 'session_start' 
  | 'session_end' 
  | 'mode_start' 
  | 'mode_end' 
  | 'achievement_unlock'
  | 'error'
  | 'performance_metric'
  | 'ui_interaction';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  data: Record<string, any>;
  context: {
    url: string;
    userAgent: string;
    resolution: string;
  };
}

const AnalyticsEventSchema = z.object({
  type: z.string(),
  timestamp: z.number(),
  data: z.record(z.string(), z.any()),
  context: z.object({
    url: z.string(),
    userAgent: z.string(),
    resolution: z.string(),
  }),
});

const AnalyticsEventsSchema = z.array(AnalyticsEventSchema);

const GameModeSchema = z.enum(['title', 'menu', 'classic', 'puzzle', 'rhythm', 'battle-royale', 'editor']);

class Analytics {
  private static instance: Analytics;
  private isEnabled: boolean = true;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initSession();
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initSession(): void {
    this.trackEvent('session_start', {
      sessionId: this.sessionId,
      startMode: this.getStartMode(),
    });

    // Track session end on unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.trackEvent('session_end', {
          sessionId: this.sessionId,
          duration: Date.now() - parseInt(this.sessionId.split('_')[1] || '0'),
        });
      });
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  trackEvent(type: AnalyticsEventType, data: Record<string, any> = {}): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      data,
      context: {
        url: window.location.href,
        userAgent: this.getUserAgent(),
        resolution: this.getScreenResolution(),
      },
    };

    console.log(`[Analytics] ${type}:`, event);

    // Store in localStorage for later batch processing
    this.storeEvent(event);
  }

  private storeEvent(event: AnalyticsEvent): void {
    try {
      const storedEvents = this.getStoredEvents();
      storedEvents.push(event);

      // Keep only last 1000 events to prevent storage bloat
      if (storedEvents.length > 1000) {
        storedEvents.splice(0, storedEvents.length - 1000);
      }

      try {
        localStorage.setItem('w3bp0ng_analytics', JSON.stringify(storedEvents));
      } catch (quotaError) {
        if (quotaError instanceof Error && 
            (quotaError.name === 'QuotaExceededError' || quotaError.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          // If full, trim more aggressively
          console.warn('Analytics storage full, trimming to 100 events');
          localStorage.setItem('w3bp0ng_analytics', JSON.stringify(storedEvents.slice(-100)));
        }
      }
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  private getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('w3bp0ng_analytics');
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      const result = AnalyticsEventsSchema.safeParse(parsed);
      return result.success ? (result.data as AnalyticsEvent[]) : [];
    } catch (error) {
      console.warn('Failed to load analytics events:', error);
      return [];
    }
  }

  // ════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ════════════════════════════════════════════════════════════

  private getStartMode(): string {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const modeParam = urlParams.get('mode');
      
      // Sanitize URL parameter using Zod
      const result = GameModeSchema.safeParse(modeParam);
      return result.success ? result.data : 'title';
    } catch (e) {
      return 'title';
    }
  }

  private getScreenResolution(): string {
    return `${window.screen.width}x${window.screen.height}`;
  }

  private getUserAgent(): string {
    return navigator.userAgent;
  }
}

export const analytics = Analytics.getInstance();

// Convenience wrappers
export function trackInteraction(componentId: string, action: string, metadata: any = {}): void {
  analytics.trackEvent('ui_interaction', { componentId, action, ...metadata });
}

export function trackError(message: string, stack?: string, metadata: any = {}): void {
  analytics.trackEvent('error', { message, stack, ...metadata });
}

export function trackPerformance(metric: string, value: number, metadata: any = {}): void {
  analytics.trackEvent('performance_metric', { metric, value, ...metadata });
}
