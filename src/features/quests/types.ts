import type { GameCategory } from '@/games/core/types';

// Quest requirement types
export type QuestRequirementType =
  | 'games_played'        // Play X games
  | 'total_score'         // Score X points total
  | 'accuracy'            // Get X% accuracy in a game
  | 'category_games'      // Play X games in specific category
  | 'category_variety'    // Play games in X different categories
  | 'perfect_game'        // Get 100% accuracy
  | 'workout_complete'    // Complete daily workout
  | 'streak_maintain'     // Maintain X day streak
  | 'high_score'          // Beat your high score
  | 'combo_streak'        // Get X correct in a row
  | 'speed_run'           // Complete game under X seconds
  | 'level_reach';        // Reach level X in a game

// Quest difficulty affects rewards
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

// Quest time period
export type QuestPeriod = 'daily' | 'weekly';

// Quest requirement definition
export interface QuestRequirement {
  type: QuestRequirementType;
  target: number;
  category?: GameCategory;
  gameId?: string;
}

// Reward definition
export interface QuestReward {
  coins: number;
  xp: number;
  gems?: number;
  streakShield?: boolean;
  badge?: string;
}

// Quest definition
export interface Quest {
  id: string;
  period: QuestPeriod;
  difficulty: QuestDifficulty;
  title: string;
  description: string;
  icon: string;
  requirement: QuestRequirement;
  reward: QuestReward;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  expiresAt: string; // ISO date string
}

// Quest template for generation
export interface QuestTemplate {
  type: QuestRequirementType;
  difficulty: QuestDifficulty;
  titleTemplate: string;
  descriptionTemplate: string;
  icon: string;
  targetRange: [number, number];
  baseReward: QuestReward;
}

// Daily quest slot configuration
export interface DailyQuestSlots {
  easy: number;
  medium: number;
  hard: number;
}

// User quest progress for tracking
export interface QuestProgress {
  gamesPlayed: number;
  gamesPlayedByCategory: Record<GameCategory, number>;
  totalScore: number;
  perfectGames: number;
  workoutsCompleted: number;
  categoriesPlayed: Set<GameCategory>;
  highScoresBeat: number;
  maxCombo: number;
  fastestGame: number; // milliseconds
  maxLevelReached: number;
}

// Quest completion event
export interface QuestCompletionEvent {
  quest: Quest;
  reward: QuestReward;
  timestamp: string;
}

// Reward multipliers based on streak
export const STREAK_MULTIPLIERS: Record<number, number> = {
  0: 1,
  3: 1.1,
  7: 1.25,
  14: 1.5,
  30: 2,
  60: 2.5,
  100: 3,
};

// XP required per level (progressive)
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

// Calculate level from total XP
export function getLevelFromXP(totalXP: number): { level: number; currentXP: number; requiredXP: number } {
  let level = 1;
  let remainingXP = totalXP;

  while (remainingXP >= getXPForLevel(level)) {
    remainingXP -= getXPForLevel(level);
    level++;
  }

  return {
    level,
    currentXP: remainingXP,
    requiredXP: getXPForLevel(level),
  };
}

// Get streak multiplier
export function getStreakMultiplier(streak: number): number {
  const thresholds = Object.keys(STREAK_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of thresholds) {
    if (streak >= threshold) {
      return STREAK_MULTIPLIERS[threshold];
    }
  }

  return 1;
}

// Difficulty colors
export const DIFFICULTY_COLORS: Record<QuestDifficulty, string> = {
  easy: '#22C55E',      // Green
  medium: '#F59E0B',    // Amber
  hard: '#EF4444',      // Red
  legendary: '#A855F7', // Purple
};

// Difficulty labels
export const DIFFICULTY_LABELS: Record<QuestDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  legendary: 'Legendary',
};
