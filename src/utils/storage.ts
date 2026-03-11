/**
 * Storage Utility Module
 * Typed localStorage helpers for per-mode data persistence
 * Validated with Zod for production safety
 */

import { z } from 'zod';
import type { GameMode } from '../hooks/useGameStore';

// ═══════════════════════════════════════════════════════════
// ZOD SCHEMAS FOR VALIDATION
// ═══════════════════════════════════════════════════════════

export const ScoreSchema = z.object({
  playerScore: z.number(),
  aiScore: z.number(),
  timestamp: z.number(),
  difficulty: z.string().optional(),
});

export const LeaderboardSchema = z.array(ScoreSchema);

export const PuzzleProgressSchema = z.object({
  levelsCompleted: z.array(z.number()),
  starRatings: z.record(z.string(), z.number()),
  totalStars: z.number(),
  lastPlayedLevel: z.number(),
});

export const SavedLevelSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  data: z.unknown(),
});

export const GameSettingsSchema = z.object({
  soundEnabled: z.boolean(),
  currentTheme: z.string(),
  volume: z.number(),
});

// ═══════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

export type Score = z.infer<typeof ScoreSchema>;
export type PuzzleProgress = z.infer<typeof PuzzleProgressSchema>;
export type SavedLevel = z.infer<typeof SavedLevelSchema>;
export type GameSettings = z.infer<typeof GameSettingsSchema>;

// ═══════════════════════════════════════════════════════════
// STORAGE UTILITIES
// ═══════════════════════════════════════════════════════════

const getStorageKey = (mode: GameMode, type: string): string => {
  return `webpong-${mode}-${type}`;
};

function handleStorageError(error: unknown, context: string): void {
  if (error instanceof Error && 
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
    console.error(`CRITICAL: localStorage quota exceeded during ${context}!`);
    try {
      const keys = Object.keys(localStorage);
      const leaderboardKeys = keys.filter(key => key.includes('-leaderboard'));
      leaderboardKeys.forEach(key => localStorage.removeItem(key));
      console.warn('Emergency Cleanup: Removed all leaderboards to free space.');
    } catch (e) {
      console.error('Emergency cleanup failed:', e);
    }
  } else {
    console.error(`Failed ${context}:`, error);
  }
}

/**
 * Leaderboard Management
 */

export function saveLeaderboard(mode: GameMode, scores: Score[]): void {
  try {
    const key = getStorageKey(mode, 'leaderboard');
    localStorage.setItem(key, JSON.stringify(scores));
  } catch (error) {
    handleStorageError(error, `saving leaderboard for ${mode}`);
  }
}

export function loadLeaderboard(mode: GameMode): Score[] {
  try {
    const key = getStorageKey(mode, 'leaderboard');
    const data = localStorage.getItem(key);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    const result = LeaderboardSchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch (error) {
    console.error(`Failed to load leaderboard for ${mode}:`, error);
    return [];
  }
}

export function addScore(mode: GameMode, score: Score, maxEntries: number = 10): void {
  const leaderboard = loadLeaderboard(mode);
  leaderboard.push(score);
  leaderboard.sort((a, b) => b.playerScore - a.playerScore);
  const trimmed = leaderboard.slice(0, maxEntries);
  saveLeaderboard(mode, trimmed);
}

/**
 * Puzzle Progress Management
 */

export function savePuzzleProgress(progress: PuzzleProgress): void {
  try {
    const key = getStorageKey('puzzle', 'progress');
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    handleStorageError(error, 'saving puzzle progress');
  }
}

export function loadPuzzleProgress(): PuzzleProgress {
  const defaultProgress: PuzzleProgress = {
    levelsCompleted: [],
    starRatings: {},
    totalStars: 0,
    lastPlayedLevel: 1,
  };

  try {
    const key = getStorageKey('puzzle', 'progress');
    const data = localStorage.getItem(key);
    if (!data) return defaultProgress;

    const parsed = JSON.parse(data);
    const result = PuzzleProgressSchema.safeParse(parsed);
    return result.success ? result.data : defaultProgress;
  } catch (error) {
    console.error('Failed to load puzzle progress:', error);
    return defaultProgress;
  }
}

/**
 * Level Editor Management
 */

export function saveLevel(level: SavedLevel): void {
  try {
    const levels = loadLevels();
    const existingIndex = levels.findIndex(l => l.id === level.id);

    if (existingIndex >= 0) {
      levels[existingIndex] = level;
    } else {
      levels.push(level);
    }

    const key = getStorageKey('editor', 'levels');
    localStorage.setItem(key, JSON.stringify(levels));
  } catch (error) {
    handleStorageError(error, 'saving custom level');
  }
}

export function loadLevels(): SavedLevel[] {
  try {
    const key = getStorageKey('editor', 'levels');
    const data = localStorage.getItem(key);
    if (!data) return [];

    const parsed = JSON.parse(data);
    const result = z.array(SavedLevelSchema).safeParse(parsed);
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Failed to load levels:', error);
    return [];
  }
}

export function deleteLevel(levelId: string): void {
  try {
    const levels = loadLevels();
    const filtered = levels.filter(l => l.id !== levelId);
    const key = getStorageKey('editor', 'levels');
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (error) {
    handleStorageError(error, 'deleting level');
  }
}

/**
 * Global Settings
 */

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem('webpong-settings', JSON.stringify(settings));
  } catch (error) {
    handleStorageError(error, 'saving settings');
  }
}

export function loadSettings(): GameSettings | null {
  try {
    const data = localStorage.getItem('webpong-settings');
    if (!data) return null;

    const parsed = JSON.parse(data);
    const result = GameSettingsSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
}

/**
 * Cleanup Utilities
 */

export function clearAllData(): void {
  try {
    const keys = Object.keys(localStorage);
    const webPongKeys = keys.filter(key => key.startsWith('webpong-'));
    webPongKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}

export function clearModeData(mode: GameMode): void {
  try {
    const keys = Object.keys(localStorage);
    const modeKeys = keys.filter(key => key.startsWith(`webpong-${mode}-`));
    modeKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error(`Failed to clear data for ${mode}:`, error);
  }
}
