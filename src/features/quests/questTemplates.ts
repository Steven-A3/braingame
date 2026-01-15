import type { QuestTemplate, QuestDifficulty } from './types';
import type { GameCategory } from '@/games/core/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/games/core/types';

// All quest templates organized by type
export const QUEST_TEMPLATES: QuestTemplate[] = [
  // === EASY QUESTS ===
  {
    type: 'games_played',
    difficulty: 'easy',
    titleTemplate: 'Brain Starter',
    descriptionTemplate: 'Play {target} game(s)',
    icon: '🎮',
    targetRange: [1, 2],
    baseReward: { coins: 10, xp: 15 },
  },
  {
    type: 'total_score',
    difficulty: 'easy',
    titleTemplate: 'Point Collector',
    descriptionTemplate: 'Score {target} points total',
    icon: '⭐',
    targetRange: [100, 200],
    baseReward: { coins: 15, xp: 20 },
  },
  {
    type: 'category_games',
    difficulty: 'easy',
    titleTemplate: '{category} Warm-up',
    descriptionTemplate: 'Play 1 {category} game',
    icon: '{categoryIcon}',
    targetRange: [1, 1],
    baseReward: { coins: 10, xp: 15 },
  },

  // === MEDIUM QUESTS ===
  {
    type: 'games_played',
    difficulty: 'medium',
    titleTemplate: 'Brain Trainer',
    descriptionTemplate: 'Play {target} games',
    icon: '🧠',
    targetRange: [3, 5],
    baseReward: { coins: 25, xp: 35 },
  },
  {
    type: 'total_score',
    difficulty: 'medium',
    titleTemplate: 'Score Hunter',
    descriptionTemplate: 'Score {target} points total',
    icon: '🎯',
    targetRange: [300, 500],
    baseReward: { coins: 30, xp: 40 },
  },
  {
    type: 'accuracy',
    difficulty: 'medium',
    titleTemplate: 'Precision Player',
    descriptionTemplate: 'Get {target}% accuracy in a game',
    icon: '🎯',
    targetRange: [80, 85],
    baseReward: { coins: 25, xp: 30 },
  },
  {
    type: 'category_variety',
    difficulty: 'medium',
    titleTemplate: 'Explorer',
    descriptionTemplate: 'Play games in {target} different categories',
    icon: '🗺️',
    targetRange: [2, 3],
    baseReward: { coins: 30, xp: 40 },
  },
  {
    type: 'category_games',
    difficulty: 'medium',
    titleTemplate: '{category} Focus',
    descriptionTemplate: 'Play {target} {category} games',
    icon: '{categoryIcon}',
    targetRange: [2, 3],
    baseReward: { coins: 25, xp: 35 },
  },
  {
    type: 'workout_complete',
    difficulty: 'medium',
    titleTemplate: 'Workout Warrior',
    descriptionTemplate: 'Complete the daily workout',
    icon: '🏋️',
    targetRange: [1, 1],
    baseReward: { coins: 40, xp: 50 },
  },

  // === HARD QUESTS ===
  {
    type: 'games_played',
    difficulty: 'hard',
    titleTemplate: 'Marathon Mind',
    descriptionTemplate: 'Play {target} games',
    icon: '🏃',
    targetRange: [7, 10],
    baseReward: { coins: 50, xp: 70 },
  },
  {
    type: 'total_score',
    difficulty: 'hard',
    titleTemplate: 'High Achiever',
    descriptionTemplate: 'Score {target} points total',
    icon: '🏆',
    targetRange: [800, 1200],
    baseReward: { coins: 60, xp: 80 },
  },
  {
    type: 'accuracy',
    difficulty: 'hard',
    titleTemplate: 'Sharp Shooter',
    descriptionTemplate: 'Get {target}% accuracy in a game',
    icon: '💎',
    targetRange: [90, 95],
    baseReward: { coins: 50, xp: 60 },
  },
  {
    type: 'perfect_game',
    difficulty: 'hard',
    titleTemplate: 'Perfectionist',
    descriptionTemplate: 'Get 100% accuracy in any game',
    icon: '✨',
    targetRange: [1, 1],
    baseReward: { coins: 75, xp: 100 },
  },
  {
    type: 'category_variety',
    difficulty: 'hard',
    titleTemplate: 'Renaissance Mind',
    descriptionTemplate: 'Play games in {target} different categories',
    icon: '🌟',
    targetRange: [4, 5],
    baseReward: { coins: 55, xp: 70 },
  },
  {
    type: 'high_score',
    difficulty: 'hard',
    titleTemplate: 'Record Breaker',
    descriptionTemplate: 'Beat your personal best in any game',
    icon: '📈',
    targetRange: [1, 1],
    baseReward: { coins: 60, xp: 75 },
  },

  // === LEGENDARY QUESTS ===
  {
    type: 'perfect_game',
    difficulty: 'legendary',
    titleTemplate: 'Flawless Victory',
    descriptionTemplate: 'Get {target} perfect games (100% accuracy)',
    icon: '👑',
    targetRange: [2, 3],
    baseReward: { coins: 150, xp: 200, gems: 5 },
  },
  {
    type: 'category_variety',
    difficulty: 'legendary',
    titleTemplate: 'Master of All',
    descriptionTemplate: 'Play games in all 6 categories',
    icon: '🎓',
    targetRange: [6, 6],
    baseReward: { coins: 100, xp: 150, gems: 3 },
  },
  {
    type: 'total_score',
    difficulty: 'legendary',
    titleTemplate: 'Brain Champion',
    descriptionTemplate: 'Score {target} points in one day',
    icon: '🏅',
    targetRange: [2000, 3000],
    baseReward: { coins: 200, xp: 250, gems: 10 },
  },
  {
    type: 'games_played',
    difficulty: 'legendary',
    titleTemplate: 'Unstoppable',
    descriptionTemplate: 'Play {target} games in one day',
    icon: '🔥',
    targetRange: [15, 20],
    baseReward: { coins: 175, xp: 225, gems: 7 },
  },
];

// Get templates filtered by difficulty
export function getTemplatesByDifficulty(difficulty: QuestDifficulty): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => t.difficulty === difficulty);
}

// Get category-specific templates
export function getCategoryTemplates(): { template: QuestTemplate; category: GameCategory }[] {
  const categoryTemplates = QUEST_TEMPLATES.filter(
    (t) => t.type === 'category_games'
  );

  const categories: GameCategory[] = ['memory', 'logic', 'focus', 'calculation', 'language', 'speed'];
  const result: { template: QuestTemplate; category: GameCategory }[] = [];

  for (const template of categoryTemplates) {
    for (const category of categories) {
      result.push({ template, category });
    }
  }

  return result;
}

// Format template strings with values
export function formatTemplateString(
  template: string,
  values: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}

// Get icon for category quest
export function getCategoryQuestIcon(category: GameCategory): string {
  return CATEGORY_ICONS[category];
}

// Get label for category
export function getCategoryLabel(category: GameCategory): string {
  return CATEGORY_LABELS[category];
}
