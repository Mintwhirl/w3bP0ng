/**
 * Achievement System
 * Defines 12 achievements spanning all game modes with unlock conditions
 */

import { AchievementProgress, saveSaveData, loadSaveData } from '../utils/saveManager';

// ═══════════════════════════════════════════════════════════
// ACHIEVEMENT DEFINITIONS
// ═══════════════════════════════════════════════════════════

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'puzzle' | 'rhythm' | 'battle' | 'editor' | 'general';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  points: number;
  isHidden?: boolean;
  condition: AchievementCondition;
}

export interface AchievementCondition {
  type: 'total_stars' | 'perfect_rhythm' | 'battle_wins' | 'custom_levels' |
        'play_all_modes' | 'total_games' | 'total_hits' | 'first_win' |
        'speedrun' | 'combo_master' | 'veteran' | 'collector';
  target: number;
  mode?: 'puzzle' | 'rhythm' | 'battle' | 'editor' | 'classic';
}

export const ACHIEVEMENTS: Achievement[] = [
  // 🧩 Puzzle Mode Achievements
  {
    id: 'puzzle_prodigy',
    name: 'Puzzle Prodigy',
    description: 'Earn 3 stars on all Physics Puzzle levels',
    icon: '🧩',
    category: 'puzzle',
    rarity: 'legendary',
    points: 100,
    condition: {
      type: 'total_stars',
      target: 30, // 10 levels * 3 stars
      mode: 'puzzle',
    },
  },
  {
    id: 'puzzle_speedrunner',
    name: 'Portal Speedrunner',
    description: 'Complete any 5 puzzle levels in under 60 seconds total',
    icon: '⚡',
    category: 'puzzle',
    rarity: 'rare',
    points: 50,
    condition: {
      type: 'speedrun',
      target: 5,
      mode: 'puzzle',
    },
  },

  // 🎵 Rhythm Mode Achievements
  {
    id: 'rhythm_perfectionist',
    name: 'Rhythm Perfectionist',
    description: 'Get 100% accuracy on 3 different songs',
    icon: '🎵',
    category: 'rhythm',
    rarity: 'rare',
    points: 75,
    condition: {
      type: 'perfect_rhythm',
      target: 3,
      mode: 'rhythm',
    },
  },
  {
    id: 'rhythm_combo_master',
    name: 'Combo Master',
    description: 'Achieve a 100-hit combo in Rhythm Mode',
    icon: '🔥',
    category: 'rhythm',
    rarity: 'uncommon',
    points: 30,
    condition: {
      type: 'combo_master',
      target: 100,
      mode: 'rhythm',
    },
  },

  // ⚔️ Battle Royale Achievements
  {
    id: 'battle_survivor',
    name: 'Ultimate Survivor',
    description: 'Win 10 Battle Royale matches',
    icon: '⚔️',
    category: 'battle',
    rarity: 'uncommon',
    points: 40,
    condition: {
      type: 'battle_wins',
      target: 10,
      mode: 'battle',
    },
  },
  {
    id: 'battle_eliminator',
    name: 'Elimination King',
    description: 'Eliminate 50 opponents in Battle Royale',
    icon: '👑',
    category: 'battle',
    rarity: 'common',
    points: 25,
    condition: {
      type: 'total_hits',
      target: 50,
      mode: 'battle',
    },
  },

  // 🛠️ Level Editor Achievements
  {
    id: 'editor_architect',
    name: 'Level Architect',
    description: 'Create and save 5 custom levels',
    icon: '🛠️',
    category: 'editor',
    rarity: 'common',
    points: 20,
    condition: {
      type: 'custom_levels',
      target: 5,
      mode: 'editor',
    },
  },
  {
    id: 'editor_maestro',
    name: 'Level Maestro',
    description: 'Create a level that gets played 50 times by others',
    icon: '🏗️',
    category: 'editor',
    rarity: 'legendary',
    points: 150,
    isHidden: true,
    condition: {
      type: 'custom_levels',
      target: 50,
      mode: 'editor',
    },
  },

  // 🎮 General Achievements
  {
    id: 'general_explorer',
    name: 'Game Explorer',
    description: 'Play all 5 game modes at least once',
    icon: '🎮',
    category: 'general',
    rarity: 'uncommon',
    points: 35,
    condition: {
      type: 'play_all_modes',
      target: 5,
    },
  },
  {
    id: 'general_veteran',
    name: 'Neon Veteran',
    description: 'Play for 10 hours total',
    icon: '🪖',
    category: 'general',
    rarity: 'common',
    points: 15,
    condition: {
      type: 'veteran',
      target: 10 * 60 * 60 * 1000, // 10 hours in milliseconds
    },
  },
  {
    id: 'general_collector',
    name: 'Star Collector',
    description: 'Earn 100 total stars across all modes',
    icon: '⭐',
    category: 'general',
    rarity: 'uncommon',
    points: 40,
    condition: {
      type: 'total_stars',
      target: 100,
    },
  },
  {
    id: 'general_master',
    name: 'W3BP0NG Master',
    description: 'Unlock all other achievements',
    icon: '👑',
    category: 'general',
    rarity: 'legendary',
    points: 200,
    isHidden: true,
    condition: {
      type: 'collector',
      target: 11, // All other achievements
    },
  },
];

// ═══════════════════════════════════════════════════════════
// ACHIEVEMENT TRACKING
// ═══════════════════════════════════════════════════════════

export class AchievementManager {
  private static instance: AchievementManager;
  private unlockCallbacks: Array<(achievement: Achievement, isNew: boolean) => void> = [];
  private lastProgressCheck = 0;

  static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  // Register callback for achievement notifications
  onAchievementUnlock(callback: (achievement: Achievement, isNew: boolean) => void): void {
    this.unlockCallbacks.push(callback);
  }

  // Check if achievement is unlocked
  isAchievementUnlocked(achievementId: string): boolean {
    const data = loadSaveData();
    return data.achievements[achievementId]?.unlocked || false;
  }

  // Get achievement progress
  getAchievementProgress(achievementId: string): AchievementProgress | null {
    const data = loadSaveData();
    return data.achievements[achievementId] || null;
  }

  // Unlock achievement
  unlockAchievement(achievementId: string): { success: boolean; isNew: boolean } {
    try {
      const data = loadSaveData();
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);

      if (!achievement) {
        console.error(`Achievement not found: ${achievementId}`);
        return { success: false, isNew: false };
      }

      const currentProgress = data.achievements[achievementId];
      const isCurrentlyUnlocked = currentProgress?.unlocked || false;

      if (isCurrentlyUnlocked) {
        return { success: true, isNew: false }; // Already unlocked
      }

      // Mark as unlocked
      const newProgress: AchievementProgress = {
        id: achievementId,
        unlocked: true,
        unlockedAt: Date.now(),
        progress: undefined,
        maxProgress: undefined,
      };

      data.achievements[achievementId] = newProgress;
      saveSaveData(data);

      // Trigger callbacks
      this.unlockCallbacks.forEach(callback => {
        callback(achievement, true);
      });

      console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
      return { success: true, isNew: true };
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      return { success: false, isNew: false };
    }
  }

  // Update achievement progress
  updateProgress(
    achievementId: string,
    current: number,
    max: number
  ): { success: boolean; progress: number; justUnlocked: boolean } {
    try {
      const data = loadSaveData();
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);

      if (!achievement) {
        console.error(`Achievement not found: ${achievementId}`);
        return { success: false, progress: 0, justUnlocked: false };
      }

      const currentProgress = data.achievements[achievementId];
      const isCurrentlyUnlocked = currentProgress?.unlocked || false;

      if (isCurrentlyUnlocked) {
        return { success: true, progress: max, justUnlocked: false };
      }

      const progressPercentage = Math.min(current, max);
      const justUnlocked = progressPercentage >= max;

      const newProgress: AchievementProgress = {
        id: achievementId,
        unlocked: justUnlocked,
        unlockedAt: justUnlocked ? Date.now() : undefined,
        progress: progressPercentage,
        maxProgress: max,
      };

      data.achievements[achievementId] = newProgress;
      saveSaveData(data);

      if (justUnlocked) {
        this.unlockCallbacks.forEach(callback => {
          callback(achievement, true);
        });
        console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
      }

      return {
        success: true,
        progress: progressPercentage,
        justUnlocked,
      };
    } catch (error) {
      console.error('Failed to update achievement progress:', error);
      return { success: false, progress: 0, justUnlocked: false };
    }
  }

  // Check all achievements for unlocks
  checkAllAchievements(): void {
    const now = Date.now();

    // Throttle progress checks to once per second
    if (now - this.lastProgressCheck < 1000) {
      return;
    }
    this.lastProgressCheck = now;

    const data = loadSaveData();

    ACHIEVEMENTS.forEach(achievement => {
      const currentProgress = data.achievements[achievement.id];
      if (currentProgress?.unlocked) {
        return; // Skip already unlocked achievements
      }

      const shouldUnlock = this.evaluateAchievementCondition(achievement.condition, data);

      if (shouldUnlock) {
        this.unlockAchievement(achievement.id);
      }
    });
  }

  // Evaluate achievement condition
  private evaluateAchievementCondition(condition: AchievementCondition, data: any): boolean {
    switch (condition.type) {
      case 'total_stars':
        if (condition.mode === 'puzzle') {
          return data.puzzleProgress.totalStars >= condition.target;
        }
        return data.stats.totalStars >= condition.target;

      case 'perfect_rhythm':
        return data.rhythmProgress.perfectSongs.length >= condition.target;

      case 'battle_wins':
        return data.battleRoyaleProgress.totalWins >= condition.target;

      case 'custom_levels':
        if (condition.mode === 'editor') {
          return data.customLevels.created >= condition.target;
        }
        return false;

      case 'play_all_modes':
        const modesPlayed = new Set([
          data.stats.favoriteMode ? 'classic' : null,
          data.puzzleProgress.completedLevels.length > 0 ? 'puzzle' : null,
          data.rhythmProgress.highScores && Object.keys(data.rhythmProgress.highScores).length > 0 ? 'rhythm' : null,
          data.battleRoyaleProgress.totalGames > 0 ? 'battle' : null,
          data.customLevels.created > 0 ? 'editor' : null,
        ]);
        return modesPlayed.size >= condition.target;

      case 'total_games':
        return data.stats.totalGamesPlayed >= condition.target;

      case 'total_hits':
        return data.stats.totalBallHits >= condition.target;

      case 'first_win':
        return data.battleRoyaleProgress.totalWins > 0 ||
               data.puzzleProgress.completedLevels.length > 0 ||
               Object.keys(data.rhythmProgress.highScores).some(songId => data.rhythmProgress.highScores[songId] > 0);

      case 'speedrun':
        return data.stats.fastestCompletions >= condition.target;

      case 'combo_master':
        return data.rhythmProgress.bestCombo >= condition.target;

      case 'veteran':
        return data.playTime >= condition.target;

      case 'collector':
        const unlockedCount = Object.values(data.achievements).filter(a => a.unlocked).length;
        return unlockedCount >= condition.target;

      default:
        return false;
    }
  }

  // Get achievement statistics
  getAchievementStats(): {
    total: number;
    unlocked: number;
    percentage: number;
    totalPoints: number;
    earnedPoints: number;
    byCategory: Record<string, { total: number; unlocked: number }>;
    byRarity: Record<string, { total: number; unlocked: number }>;
  } {
    const data = loadSaveData();
    const unlockedAchievements = Object.values(data.achievements).filter(a => a.unlocked);

    const stats = {
      total: ACHIEVEMENTS.length,
      unlocked: unlockedAchievements.length,
      percentage: Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100),
      totalPoints: ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0),
      earnedPoints: unlockedAchievements.reduce((sum, a) => {
        const achievement = ACHIEVEMENTS.find(ach => ach.id === a.id);
        return sum + (achievement?.points || 0);
      }, 0),
      byCategory: {} as Record<string, { total: number; unlocked: number }>,
      byRarity: {} as Record<string, { total: number; unlocked: number }>,
    };

    // Calculate category stats
    ACHIEVEMENTS.forEach(achievement => {
      if (!stats.byCategory[achievement.category]) {
        stats.byCategory[achievement.category] = { total: 0, unlocked: 0 };
      }
      stats.byCategory[achievement.category].total++;

      if (data.achievements[achievement.id]?.unlocked) {
        stats.byCategory[achievement.category].unlocked++;
      }
    });

    // Calculate rarity stats
    ACHIEVEMENTS.forEach(achievement => {
      if (!stats.byRarity[achievement.rarity]) {
        stats.byRarity[achievement.rarity] = { total: 0, unlocked: 0 };
      }
      stats.byRarity[achievement.rarity].total++;

      if (data.achievements[achievement.id]?.unlocked) {
        stats.byRarity[achievement.rarity].unlocked++;
      }
    });

    return stats;
  }

  // Get achievements by category
  getAchievementsByCategory(category?: string): Achievement[] {
    if (category) {
      return ACHIEVEMENTS.filter(a => a.category === category);
    }
    return ACHIEVEMENTS;
  }

  // Get locked achievements
  getLockedAchievements(): Achievement[] {
    const data = loadSaveData();
    return ACHIEVEMENTS.filter(a => !data.achievements[a.id]?.unlocked);
  }

  // Get recently unlocked achievements
  getRecentlyUnlocked(days: number = 7): Array<{ achievement: Achievement; unlockedAt: number }> {
    const data = loadSaveData();
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    return Object.entries(data.achievements)
      .filter(([_, progress]) => progress.unlocked && progress.unlockedAt && progress.unlockedAt > cutoffTime)
      .map(([id, progress]) => ({
        achievement: ACHIEVEMENTS.find(a => a.id === id)!,
        unlockedAt: progress.unlockedAt!,
      }))
      .sort((a, b) => b.unlockedAt - a.unlockedAt);
  }
}

// ═══════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS
// ═══════════════════════════════════════════════════════════

export const achievementManager = AchievementManager.getInstance();

// Easy-to-use functions for common achievement triggers
export function unlockAchievement(achievementId: string): boolean {
  return achievementManager.unlockAchievement(achievementId).success;
}

export function checkAchievements(): void {
  achievementManager.checkAllAchievements();
}

export function getAchievementStats() {
  return achievementManager.getAchievementStats();
}