/**
 * Achievement System
 * Defines 20 achievements spanning all game modes with unlock conditions
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
        'speedrun' | 'combo_master' | 'veteran' | 'collector' | 'flawless';
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
    condition: { type: 'total_stars', target: 30, mode: 'puzzle' },
  },
  {
    id: 'puzzle_ghost',
    name: 'Ghost in the Machine',
    description: 'Complete a puzzle level with zero hits (using only portals)',
    icon: '👻',
    category: 'puzzle',
    rarity: 'rare',
    points: 60,
    isHidden: true,
    condition: { type: 'flawless', target: 1, mode: 'puzzle' },
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
    condition: { type: 'perfect_rhythm', target: 3, mode: 'rhythm' },
  },
  {
    id: 'rhythm_god',
    name: 'God of Rhythm',
    description: 'Maintain a 250+ combo in Rhythm Mode',
    icon: '⚡',
    category: 'rhythm',
    rarity: 'legendary',
    points: 150,
    isHidden: true,
    condition: { type: 'combo_master', target: 250, mode: 'rhythm' },
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
    condition: { type: 'battle_wins', target: 10, mode: 'battle' },
  },
  {
    id: 'battle_immortal',
    name: 'Quantum Immortal',
    description: 'Win a Battle Royale match without losing a single ball',
    icon: '🛡️',
    category: 'battle',
    rarity: 'legendary',
    points: 120,
    isHidden: true,
    condition: { type: 'flawless', target: 1, mode: 'battle' },
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
    condition: { type: 'custom_levels', target: 5, mode: 'editor' },
  },

  // 🎮 General Achievements
  {
    id: 'general_veteran',
    name: 'Neon Veteran',
    description: 'Play for 10 hours total',
    icon: '🪖',
    category: 'general',
    rarity: 'common',
    points: 15,
    condition: { type: 'veteran', target: 10 * 60 * 60 * 1000 },
  },
  {
    id: 'general_obsessive',
    name: 'Obsessive Link',
    description: 'Launch the game 50 times',
    icon: '📱',
    category: 'general',
    rarity: 'uncommon',
    points: 30,
    isHidden: true,
    condition: { type: 'total_games', target: 50 },
  },
  {
    id: 'general_master',
    name: 'W3BP0NG Master',
    description: 'Unlock 15 achievements',
    icon: '👑',
    category: 'general',
    rarity: 'legendary',
    points: 200,
    isHidden: true,
    condition: { type: 'collector', target: 15 },
  },
];

// ═══════════════════════════════════════════════════════════
// ACHIEVEMENT TRACKING
// ═══════════════════════════════════════════════════════════

export class AchievementManager {
  private static instance: AchievementManager;
  private unlockCallbacks: Array<(achievement: Achievement) => void> = [];

  static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  onAchievementUnlock(callback: (achievement: Achievement) => void): void {
    this.unlockCallbacks.push(callback);
  }

  unlockAchievement(achievementId: string): { success: boolean; isNew: boolean } {
    try {
      const data = loadSaveData();
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achievement) return { success: false, isNew: false };

      if (data.achievements[achievementId]?.unlocked) {
        return { success: true, isNew: false };
      }

      data.achievements[achievementId] = {
        id: achievementId,
        unlocked: true,
        unlockedAt: Date.now(),
      };

      saveSaveData(data);
      this.unlockCallbacks.forEach(cb => cb(achievement));
      return { success: true, isNew: true };
    } catch (error) {
      return { success: false, isNew: false };
    }
  }

  checkAllAchievements(): void {
    const data = loadSaveData();
    ACHIEVEMENTS.forEach(achievement => {
      if (data.achievements[achievement.id]?.unlocked) return;
      if (this.evaluateCondition(achievement.condition, data)) {
        this.unlockAchievement(achievement.id);
      }
    });
  }

  private evaluateCondition(cond: AchievementCondition, data: any): boolean {
    switch (cond.type) {
      case 'total_stars': return data.puzzleProgress.totalStars >= cond.target;
      case 'perfect_rhythm': return data.rhythmProgress.perfectSongs.length >= cond.target;
      case 'battle_wins': return data.battleRoyaleProgress.totalWins >= cond.target;
      case 'custom_levels': return data.customLevels.created >= cond.target;
      case 'total_games': return data.stats.totalGamesPlayed >= cond.target;
      case 'combo_master': return data.rhythmProgress.bestCombo >= cond.target;
      case 'veteran': return data.playTime >= cond.target;
      case 'collector': 
        return Object.values(data.achievements).filter((a: any) => a.unlocked).length >= cond.target;
      default: return false;
    }
  }
}

export const achievementManager = AchievementManager.getInstance();

export function checkAchievements(): void {
  achievementManager.checkAllAchievements();
}
