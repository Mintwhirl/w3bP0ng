/**
 * Save Data Manager
 * Unified persistent state management for W3BP0NG
 * Handles achievements, progress, settings, and statistics
 */

// ═══════════════════════════════════════════════════════════
// STORAGE CONFIGURATION
// ═══════════════════════════════════════════════════════════

const STORAGE_KEY = 'w3bp0ng_save';
const STORAGE_VERSION = '1.0.0';
const BACKUP_KEY = 'w3bp0ng_save_backup';

// ═══════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

export interface AchievementProgress {
  id: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number; // For multi-step achievements
  maxProgress?: number;
}

export interface SaveData {
  // Version and metadata
  version: string;
  lastSaved: number;
  playTime: number; // Total playtime in milliseconds

  // Player progress
  puzzleProgress: {
    unlockedLevels: number;
    completedLevels: number[];
    levelStars: Record<number, 0 | 1 | 2 | 3>;
    totalStars: number;
  };

  rhythmProgress: {
    highScores: Record<string, number>;
    bestCombo: number;
    perfectSongs: string[];
  };

  battleRoyaleProgress: {
    totalWins: number;
    totalGames: number;
    bestKillStreak: number;
    totalEliminations: number;
  };

  // Achievements
  achievements: Record<string, AchievementProgress>;

  // Settings
  settings: {
    soundEnabled: boolean;
    musicVolume: number;
    sfxVolume: number;
    currentTheme: string;
    showFPS: boolean;
    showParticles: boolean;
  };

  // Statistics
  stats: {
    totalGamesPlayed: number;
    totalBallHits: number;
    totalBlocksDestroyed: number;
    favoriteMode: string;
    longestSession: number;
    sessionsPlayed: number;
  };

  // Custom levels data
  customLevels: {
    created: number;
    totalPlays: number;
    published: number;
  };
}

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

export function loadSaveData(): SaveData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createDefaultSaveData();
    }

    const data = JSON.parse(stored) as SaveData;

    // Validate and migrate data
    return migrateSaveData(data);
  } catch (error) {
    console.error('Failed to load save data:', error);

    // Try to restore from backup
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        const backupData = JSON.parse(backup) as SaveData;
        saveSaveData(backupData);
        return backupData;
      }
    } catch (backupError) {
      console.error('Failed to restore backup:', backupError);
    }

    // Fallback to default data
    return createDefaultSaveData();
  }
}

export function saveSaveData(data: SaveData): boolean {
  try {
    // Update last saved timestamp
    data.lastSaved = Date.now();

    // Create backup before saving
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      localStorage.setItem(BACKUP_KEY, current);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save data:', error);
    return false;
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
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Failed to export save data:', error);
    return null;
  }
}

export function importSaveData(jsonData: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonData) as SaveData & { exportedAt?: string; exportVersion?: string };

    // Basic validation
    if (!data.version || !data.puzzleProgress || !data.settings) {
      return { success: false, error: 'Invalid save data format' };
    }

    // Migrate imported data
    const migratedData = migrateSaveData(data);

    const success = saveSaveData(migratedData);
    if (success) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to save imported data' };
    }
  } catch (error) {
    console.error('Failed to import save data:', error);
    return { success: false, error: 'Invalid JSON format' };
  }
}

// ═══════════════════════════════════════════════════════════
// DATA MIGRATION
// ═══════════════════════════════════════════════════════════

function migrateSaveData(data: any): SaveData {
  const defaultData = createDefaultSaveData();

  // If version matches current, merge with defaults
  if (data.version === STORAGE_VERSION) {
    return {
      ...defaultData,
      ...data,
      settings: {
        ...defaultData.settings,
        ...data.settings,
      },
    };
  }

  // Migration logic for different versions would go here
  const migratedData: SaveData = {
    ...defaultData,
    version: STORAGE_VERSION,
    lastSaved: Date.now(),
  };

  // Preserve existing data where possible
  if (data.puzzleProgress) {
    migratedData.puzzleProgress = { ...defaultData.puzzleProgress, ...data.puzzleProgress };
  }

  if (data.rhythmProgress) {
    migratedData.rhythmProgress = { ...defaultData.rhythmProgress, ...data.rhythmProgress };
  }

  if (data.battleRoyaleProgress) {
    migratedData.battleRoyaleProgress = {
      ...defaultData.battleRoyaleProgress,
      ...data.battleRoyaleProgress
    };
  }

  if (data.achievements) {
    migratedData.achievements = { ...data.achievements };
  }

  if (data.settings) {
    migratedData.settings = { ...defaultData.settings, ...data.settings };
  }

  if (data.stats) {
    migratedData.stats = { ...defaultData.stats, ...data.stats };
  }

  if (data.customLevels) {
    migratedData.customLevels = { ...defaultData.customLevels, ...data.customLevels };
  }

  return migratedData;
}

// ═══════════════════════════════════════════════════════════
// PROGRESS UPDATERS
// ═══════════════════════════════════════════════════════════

export function updatePuzzleProgress(
  levelId: number,
  stars: 0 | 1 | 2 | 3,
  time?: number
): boolean {
  try {
    const data = loadSaveData();

    // Update level completion and stars
    if (!data.puzzleProgress.completedLevels.includes(levelId)) {
      data.puzzleProgress.completedLevels.push(levelId);
    }

    const currentStars = data.puzzleProgress.levelStars[levelId] || 0;
    if (stars > currentStars) {
      data.puzzleProgress.levelStars[levelId] = stars;
      data.puzzleProgress.totalStars = data.puzzleProgress.totalStars + (stars - currentStars);
    }

    // Unlock next level
    const nextLevel = levelId + 1;
    if (data.puzzleProgress.unlockedLevels < nextLevel) {
      data.puzzleProgress.unlockedLevels = nextLevel;
    }

    return saveSaveData(data);
  } catch (error) {
    console.error('Failed to update puzzle progress:', error);
    return false;
  }
}

export function updateRhythmScore(songId: string, score: number, combo: number): boolean {
  try {
    const data = loadSaveData();

    // Update high score
    const currentHighScore = data.rhythmProgress.highScores[songId] || 0;
    if (score > currentHighScore) {
      data.rhythmProgress.highScores[songId] = score;
    }

    // Update best combo
    if (combo > data.rhythmProgress.bestCombo) {
      data.rhythmProgress.bestCombo = combo;
    }

    // Check for perfect score (100% accuracy)
    if (combo >= 100) { // Assuming combo represents accuracy percentage
      if (!data.rhythmProgress.perfectSongs.includes(songId)) {
        data.rhythmProgress.perfectSongs.push(songId);
      }
    }

    return saveSaveData(data);
  } catch (error) {
    console.error('Failed to update rhythm score:', error);
    return false;
  }
}

export function updateBattleRoyaleStats(won: boolean, eliminations: number, killStreak: number): boolean {
  try {
    const data = loadSaveData();

    data.battleRoyaleProgress.totalGames++;
    if (won) {
      data.battleRoyaleProgress.totalWins++;
    }

    data.battleRoyaleProgress.totalEliminations += eliminations;

    if (killStreak > data.battleRoyaleProgress.bestKillStreak) {
      data.battleRoyaleProgress.bestKillStreak = killStreak;
    }

    return saveSaveData(data);
  } catch (error) {
    console.error('Failed to update battle royale stats:', error);
    return false;
  }
}

export function updateCustomLevelStats(): boolean {
  try {
    const data = loadSaveData();
    data.customLevels.created++;
    return saveSaveData(data);
  } catch (error) {
    console.error('Failed to update custom level stats:', error);
    return false;
  }
}

export function updateSettings(settings: Partial<SaveData['settings']>): boolean {
  try {
    const data = loadSaveData();
    data.settings = { ...data.settings, ...settings };
    return saveSaveData(data);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return false;
  }
}

export function incrementPlayTime(deltaTime: number): boolean {
  try {
    const data = loadSaveData();
    data.playTime += deltaTime;
    return saveSaveData(data);
  } catch (error) {
    console.error('Failed to update play time:', error);
    return false;
  }
}

export function updateSessionStats(
  mode: string,
  ballHits: number,
  blocksDestroyed: number
): boolean {
  try {
    const data = loadSaveData();

    data.stats.totalGamesPlayed++;
    data.stats.totalBallHits += ballHits;
    data.stats.totalBlocksDestroyed += blocksDestroyed;
    data.stats.sessionsPlayed++;

    // Update favorite mode
    // Simple heuristic: most recently played mode becomes favorite
    data.stats.favoriteMode = mode;

    return saveSaveData(data);
  } catch (error) {
    console.error('Failed to update session stats:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

export function getSaveDataInfo(): {
  saveExists: boolean;
  lastSaved: string;
  fileSize: string;
  totalStars: number;
  achievementsUnlocked: number;
  totalAchievements: number;
} {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        saveExists: false,
        lastSaved: 'Never',
        fileSize: '0 B',
        totalStars: 0,
        achievementsUnlocked: 0,
        totalAchievements: 0,
      };
    }

    const data = JSON.parse(stored) as SaveData;
    const fileSize = new Blob([stored]).size;
    const achievementsUnlocked = Object.values(data.achievements).filter(a => a.unlocked).length;

    return {
      saveExists: true,
      lastSaved: new Date(data.lastSaved).toLocaleString(),
      fileSize: formatFileSize(fileSize),
      totalStars: data.puzzleProgress.totalStars,
      achievementsUnlocked,
      totalAchievements: Object.keys(data.achievements).length,
    };
  } catch (error) {
    console.error('Failed to get save data info:', error);
    return {
      saveExists: false,
      lastSaved: 'Never',
      fileSize: '0 B',
      totalStars: 0,
      achievementsUnlocked: 0,
      totalAchievements: 0,
    };
  }
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatPlayTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export function getCompletionPercentage(): {
  puzzle: number;
  rhythm: number;
  battleRoyale: number;
  overall: number;
} {
  const data = loadSaveData();

  // Puzzle completion (based on stars)
  const puzzleTotalStars = 30; // 10 levels * 3 stars max
  const puzzleCompletion = Math.min(100, (data.puzzleProgress.totalStars / puzzleTotalStars) * 100);

  // Rhythm completion (based on perfect songs)
  const rhythmTotalSongs = 5; // Assumed total songs
  const rhythmCompletion = (data.rhythmProgress.perfectSongs.length / rhythmTotalSongs) * 100;

  // Battle Royale completion (based on wins)
  const battleRoyaleGoal = 50; // Target wins
  const battleRoyaleCompletion = Math.min(100, (data.battleRoyaleProgress.totalWins / battleRoyaleGoal) * 100);

  // Overall completion
  const overall = (puzzleCompletion + rhythmCompletion + battleRoyaleCompletion) / 3;

  return {
    puzzle: Math.round(puzzleCompletion),
    rhythm: Math.round(rhythmCompletion),
    battleRoyale: Math.round(battleRoyaleCompletion),
    overall: Math.round(overall),
  };
}

// ═══════════════════════════════════════════════════════════
// AUTO-SAVE SYSTEM
// ═══════════════════════════════════════════════════════════

let autoSaveInterval: number | null = null;
let lastAutoSave = Date.now();

export function startAutoSave(): void {
  stopAutoSave(); // Clear any existing interval

  autoSaveInterval = window.setInterval(() => {
    const now = Date.now();
    if (now - lastAutoSave >= 30000) { // Auto-save every 30 seconds
      try {
        const data = loadSaveData();
        saveSaveData(data);
        lastAutoSave = now;
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  }, 5000); // Check every 5 seconds
}

export function stopAutoSave(): void {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

export function forceAutoSave(): boolean {
  try {
    const data = loadSaveData();
    const success = saveSaveData(data);
    if (success) {
      lastAutoSave = Date.now();
    }
    return success;
  } catch (error) {
    console.error('Force auto-save failed:', error);
    return false;
  }
}

// Start auto-save when module loads
if (typeof window !== 'undefined') {
  startAutoSave();

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    forceAutoSave();
  });
}