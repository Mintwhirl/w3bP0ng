import { z } from 'zod';
import { obfuscate, deobfuscate } from './CryptoUtils';

/**
 * Save Data Manager
 * Unified persistent state management for W3BP0NG
 * Handles achievements, progress, settings, and statistics
 * Now with Zod validation and data protection
 */

// ═══════════════════════════════════════════════════════════
// STORAGE CONFIGURATION
// ═══════════════════════════════════════════════════════════

const STORAGE_KEY = 'w3bp0ng_save_v2'; // Bump version for encrypted format
const STORAGE_VERSION = '1.0.0';
const BACKUP_KEY = 'w3bp0ng_save_backup';
const LEGACY_KEY = 'w3bp0ng_save'; // Keep for migration

// ═══════════════════════════════════════════════════════════
// ZOD SCHEMAS FOR VALIDATION
// ═══════════════════════════════════════════════════════════

export const AchievementProgressSchema = z.object({
  id: z.string(),
  unlocked: z.boolean(),
  unlockedAt: z.number().optional(),
  progress: z.number().optional(),
  maxProgress: z.number().optional(),
});

export const SaveDataSchema = z.object({
  version: z.string(),
  lastSaved: z.number(),
  playTime: z.number(),

  puzzleProgress: z.object({
    unlockedLevels: z.number(),
    completedLevels: z.array(z.number()),
    levelStars: z.record(z.string(), z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])),
    totalStars: z.number(),
  }),

  rhythmProgress: z.object({
    highScores: z.record(z.string(), z.number()),
    bestCombo: z.number(),
    perfectSongs: z.array(z.string()),
  }),

  battleRoyaleProgress: z.object({
    totalWins: z.number(),
    totalGames: z.number(),
    bestKillStreak: z.number(),
    totalEliminations: z.number(),
  }),

  achievements: z.record(z.string(), AchievementProgressSchema),

  settings: z.object({
    soundEnabled: z.boolean(),
    musicVolume: z.number().min(0).max(1),
    sfxVolume: z.number().min(0).max(1),
    currentTheme: z.string(),
    showFPS: z.boolean(),
    showParticles: z.boolean(),
    reducedMotion: z.boolean().default(false),
  }),

  stats: z.object({
    totalGamesPlayed: z.number(),
    totalBallHits: z.number(),
    totalBlocksDestroyed: z.number(),
    favoriteMode: z.string(),
    longestSession: z.number(),
    sessionsPlayed: z.number(),
  }),

  customLevels: z.object({
    created: z.number(),
    totalPlays: z.number(),
    published: z.number(),
  }),
});

// ═══════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

export type AchievementProgress = z.infer<typeof AchievementProgressSchema>;
export type SaveData = z.infer<typeof SaveDataSchema>;

// ═══════════════════════════════════════════════════════════
// DEFAULT SAVE DATA
// ═══════════════════════════════════════════════════════════

function createDefaultSaveData(): SaveData {
  return {
    version: STORAGE_VERSION,
    lastSaved: Date.now(),
    playTime: 0,

    puzzleProgress: {
      unlockedLevels: 1,
      completedLevels: [],
      levelStars: {},
      totalStars: 0,
    },

    rhythmProgress: {
      highScores: {},
      bestCombo: 0,
      perfectSongs: [],
    },

    battleRoyaleProgress: {
      totalWins: 0,
      totalGames: 0,
      bestKillStreak: 0,
      totalEliminations: 0,
    },

    achievements: {},

    settings: {
      soundEnabled: true,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      currentTheme: 'synthwave-sunset',
      showFPS: false,
      showParticles: true,
      reducedMotion: false,
    },

    stats: {
      totalGamesPlayed: 0,
      totalBallHits: 0,
      totalBlocksDestroyed: 0,
      favoriteMode: '',
      longestSession: 0,
      sessionsPlayed: 0,
    },

    customLevels: {
      created: 0,
      totalPlays: 0,
      published: 0,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// STORAGE OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Load and validate save data with automatic migration and decryption
 */
export function loadSaveData(): SaveData {
  try {
    // 1. Try modern protected storage
    let stored = localStorage.getItem(STORAGE_KEY);
    let rawData: any = null;

    if (stored) {
      const decrypted = deobfuscate(stored);
      try {
        rawData = JSON.parse(decrypted);
      } catch (e) {
        console.warn('Modern save corrupted, trying backup');
      }
    }

    // 2. Fallback to backup if modern failed
    if (!rawData) {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        try {
          rawData = JSON.parse(deobfuscate(backup));
        } catch (e) {
          console.warn('Backup also corrupted');
        }
      }
    }

    // 3. Migration from legacy unencrypted format
    if (!rawData) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        try {
          rawData = JSON.parse(legacy);
          console.log('Migrated legacy save data to protected format');
        } catch (e) {
          console.warn('Legacy data invalid');
        }
      }
    }

    // 4. Validate and potentially migrate schema
    if (!rawData) {
      return createDefaultSaveData();
    }

    const result = SaveDataSchema.safeParse(rawData);
    if (!result.success) {
      console.warn('Save data validation failed, attempting migration:', result.error);
      const migrated = migrateSaveData(rawData);
      // Save migrated version immediately
      saveSaveData(migrated);
      return migrated;
    }

    return result.data;
  } catch (error) {
    console.error('Critical failure in loadSaveData:', error);
    return createDefaultSaveData();
  }
}

/**
 * Save data with validation and protection
 */
export function saveSaveData(data: SaveData): boolean {
  try {
    data.lastSaved = Date.now();

    // Validate
    const result = SaveDataSchema.safeParse(data);
    if (!result.success) {
      console.error('Refusing to save invalid data:', result.error);
      return false;
    }

    const jsonString = JSON.stringify(result.data);
    const protectedData = obfuscate(jsonString);

    // Create backup
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      try {
        localStorage.setItem(BACKUP_KEY, current);
      } catch (e) {
        console.warn('Quota exceeded for backup');
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY, protectedData);
      return true;
    } catch (quotaError) {
      if (quotaError instanceof Error && 
          (quotaError.name === 'QuotaExceededError' || quotaError.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.error('CRITICAL: localStorage quota exceeded! Cleaning up.');
        handleQuotaExceeded();
      }
      return false;
    }
  } catch (error) {
    console.error('Failed to save data:', error);
    return false;
  }
}

function handleQuotaExceeded(): void {
  try {
    localStorage.removeItem(BACKUP_KEY);
    localStorage.removeItem(LEGACY_KEY); // Remove old legacy data to free space
    console.log('Cleanup: Removed old formats to free space');
  } catch (e) {
    console.error('Emergency cleanup failed:', e);
  }
}

export function resetSaveData(): boolean {
  try {
    const defaultData = createDefaultSaveData();
    return saveSaveData(defaultData);
  } catch (error) {
    console.error('Failed to reset save data:', error);
    return false;
  }
}

export function exportSaveData(): string | null {
  try {
    const data = loadSaveData();
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      exportVersion: STORAGE_VERSION,
      integrity: 'protected'
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Failed to export save data:', error);
    return null;
  }
}

export function importSaveData(jsonData: string): { success: boolean; error?: string } {
  try {
    const rawData = JSON.parse(jsonData);

    if (!rawData || typeof rawData !== 'object') {
      return { success: false, error: 'Invalid save data format' };
    }

    const migratedData = migrateSaveData(rawData);
    const result = SaveDataSchema.safeParse(migratedData);
    
    if (!result.success) {
      return { success: false, error: 'Imported data failed validation' };
    }

    const success = saveSaveData(result.data);
    return success ? { success: true } : { success: false, error: 'Failed to write to storage' };
  } catch (error) {
    console.error('Failed to import save data:', error);
    return { success: false, error: 'Invalid JSON format' };
  }
}

function migrateSaveData(data: any): SaveData {
  const defaultData = createDefaultSaveData();

  if (!data || typeof data !== 'object') {
    return defaultData;
  }

  const migratedData: SaveData = {
    ...defaultData,
    version: typeof data.version === 'string' ? data.version : STORAGE_VERSION,
    lastSaved: typeof data.lastSaved === 'number' ? data.lastSaved : Date.now(),
    playTime: typeof data.playTime === 'number' ? data.playTime : 0,
  };

  // Merge categories with defaults
  const merge = (target: string) => {
    if (data[target] && typeof data[target] === 'object') {
      (migratedData as any)[target] = { ...(defaultData as any)[target], ...data[target] };
    }
  };

  ['puzzleProgress', 'rhythmProgress', 'battleRoyaleProgress', 'settings', 'stats', 'customLevels'].forEach(merge);

  if (data.achievements && typeof data.achievements === 'object') {
    const achievements: Record<string, AchievementProgress> = {};
    Object.entries(data.achievements).forEach(([id, prog]: [string, any]) => {
      if (prog && typeof prog === 'object' && typeof prog.unlocked === 'boolean') {
        achievements[id] = {
          id: prog.id || id,
          unlocked: prog.unlocked,
          unlockedAt: prog.unlockedAt,
          progress: prog.progress,
          maxProgress: prog.maxProgress
        };
      }
    });
    migratedData.achievements = achievements;
  }

  return migratedData;
}

// ═══════════════════════════════════════════════════════════
// PROGRESS UPDATERS
// ═══════════════════════════════════════════════════════════

export function updatePuzzleProgress(levelId: number, stars: 0 | 1 | 2 | 3): boolean {
  const data = loadSaveData();
  if (!data.puzzleProgress.completedLevels.includes(levelId)) {
    data.puzzleProgress.completedLevels.push(levelId);
  }
  const currentStars = data.puzzleProgress.levelStars[levelId.toString()] || 0;
  if (stars > currentStars) {
    data.puzzleProgress.levelStars[levelId.toString()] = stars;
    data.puzzleProgress.totalStars += (stars - currentStars);
  }
  if (data.puzzleProgress.unlockedLevels < levelId + 1) {
    data.puzzleProgress.unlockedLevels = levelId + 1;
  }
  return saveSaveData(data);
}

export function updateRhythmScore(songId: string, score: number, combo: number): boolean {
  const data = loadSaveData();
  const currentHighScore = data.rhythmProgress.highScores[songId] || 0;
  if (score > currentHighScore) data.rhythmProgress.highScores[songId] = score;
  if (combo > data.rhythmProgress.bestCombo) data.rhythmProgress.bestCombo = combo;
  if (combo >= 100 && !data.rhythmProgress.perfectSongs.includes(songId)) {
    data.rhythmProgress.perfectSongs.push(songId);
  }
  return saveSaveData(data);
}

export function updateBattleRoyaleStats(won: boolean, eliminations: number, killStreak: number): boolean {
  const data = loadSaveData();
  data.battleRoyaleProgress.totalGames++;
  if (won) data.battleRoyaleProgress.totalWins++;
  data.battleRoyaleProgress.totalEliminations += eliminations;
  if (killStreak > data.battleRoyaleProgress.bestKillStreak) data.battleRoyaleProgress.bestKillStreak = killStreak;
  return saveSaveData(data);
}

export function updateCustomLevelStats(): boolean {
  const data = loadSaveData();
  data.customLevels.created++;
  return saveSaveData(data);
}

export function updateSettings(settings: Partial<SaveData['settings']>): boolean {
  const data = loadSaveData();
  data.settings = { ...data.settings, ...settings } as SaveData['settings'];
  return saveSaveData(data);
}

export function incrementPlayTime(deltaTime: number): boolean {
  const data = loadSaveData();
  data.playTime += deltaTime;
  return saveSaveData(data);
}

export function updateSessionStats(mode: string, ballHits: number, blocksDestroyed: number): boolean {
  const data = loadSaveData();
  data.stats.totalGamesPlayed++;
  data.stats.totalBallHits += ballHits;
  data.stats.totalBlocksDestroyed += blocksDestroyed;
  data.stats.sessionsPlayed++;
  data.stats.favoriteMode = mode;
  return saveSaveData(data);
}

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

export function getSaveDataInfo() {
  const data = loadSaveData();
  const stored = localStorage.getItem(STORAGE_KEY) || '';
  const achievementsUnlocked = Object.values(data.achievements).filter(a => a.unlocked).length;

  return {
    saveExists: !!localStorage.getItem(STORAGE_KEY),
    lastSaved: new Date(data.lastSaved).toLocaleString(),
    fileSize: formatFileSize(new Blob([stored]).size),
    totalStars: data.puzzleProgress.totalStars,
    achievementsUnlocked,
    totalAchievements: 12, // Fixed target
  };
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB'];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

export function getCompletionPercentage() {
  const data = loadSaveData();
  const puzzle = Math.min(100, (data.puzzleProgress.totalStars / 30) * 100);
  const rhythm = (data.rhythmProgress.perfectSongs.length / 5) * 100;
  const br = Math.min(100, (data.battleRoyaleProgress.totalWins / 50) * 100);
  return {
    puzzle: Math.round(puzzle),
    rhythm: Math.round(rhythm),
    battleRoyale: Math.round(br),
    overall: Math.round((puzzle + rhythm + br) / 3),
  };
}

// ═══════════════════════════════════════════════════════════
// AUTO-SAVE SYSTEM
// ═══════════════════════════════════════════════════════════

let autoSaveInterval: number | null = null;
let lastAutoSave = Date.now();

export function startAutoSave(): void {
  stopAutoSave();
  autoSaveInterval = window.setInterval(() => {
    const now = Date.now();
    if (now - lastAutoSave >= 30000) {
      forceAutoSave();
      lastAutoSave = now;
    }
  }, 5000);
}

export function stopAutoSave(): void {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

export function forceAutoSave(): boolean {
  return saveSaveData(loadSaveData());
}

if (typeof window !== 'undefined') {
  startAutoSave();
  window.addEventListener('beforeunload', forceAutoSave);
}
