/**
 * Storage Utility Module
 * Typed localStorage helpers for per-mode data persistence
 */

import type { GameMode } from '../hooks/useGameStore';

/**
 * Leaderboard score entry
 */
export interface Score {
  playerScore: number;
  aiScore: number;
  timestamp: number;
  difficulty?: string;
}

/**
 * Puzzle mode progress data
 */
export interface PuzzleProgress {
  levelsCompleted: number[];
  starRatings: Record<number, number>; // levelId -> stars (1-3)
  totalStars: number;
  lastPlayedLevel: number;
}

/**
 * Level editor saved level
 */
export interface SavedLevel {
  id: string;
  name: string;
  createdAt: number;
  data: unknown; // Level-specific data structure
}

/**
 * Storage keys generator
 */
const getStorageKey = (mode: GameMode, type: string): string => {
  return `webpong-${mode}-${type}`;
};

/**
 * Helper to handle QuotaExceededError
 */
function handleStorageError(error: unknown, context: string): void {
  if (error instanceof Error && 
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
    console.error(`CRITICAL: localStorage quota exceeded during ${context}! Cleanup required.`);
    // Try to clear some less important data
    try {
      // Clear all leaderboards as an emergency measure
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
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Failed to load leaderboard for ${mode}:`, error);
    return [];
  }
}

export function addScore(mode: GameMode, score: Score, maxEntries: number = 10): void {
  const leaderboard = loadLeaderboard(mode);
  leaderboard.push(score);

  // Sort by player score descending
  leaderboard.sort((a, b) => b.playerScore - a.playerScore);

  // Keep only top entries
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
  try {
    const key = getStorageKey('puzzle', 'progress');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {
      levelsCompleted: [],
      starRatings: {},
      totalStars: 0,
      lastPlayedLevel: 1,
    };
  } catch (error) {
    console.error('Failed to load puzzle progress:', error);
    return {
      levelsCompleted: [],
      starRatings: {},
      totalStars: 0,
      lastPlayedLevel: 1,
    };
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
    return data ? JSON.parse(data) : [];
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

export interface GameSettings {
  soundEnabled: boolean;
  currentTheme: string;
  volume: number;
}

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
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
}

/**
 * Clear all data (for testing or reset functionality)
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
