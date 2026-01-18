// Maps quest title templates to translation keys
const QUEST_TITLE_MAP: Record<string, string> = {
  'Brain Starter': 'quests.names.brainStarter',
  'Point Collector': 'quests.names.pointCollector',
  'Brain Trainer': 'quests.names.brainTrainer',
  'Score Hunter': 'quests.names.scoreHunter',
  'Precision Player': 'quests.names.precisionPlayer',
  'Explorer': 'quests.names.explorer',
  'Workout Warrior': 'quests.names.workoutWarrior',
  'Marathon Mind': 'quests.names.marathonMind',
  'High Achiever': 'quests.names.highAchiever',
  'Sharp Shooter': 'quests.names.sharpShooter',
  'Perfectionist': 'quests.names.perfectionist',
  'Renaissance Mind': 'quests.names.renaissanceMind',
  'Record Breaker': 'quests.names.recordBreaker',
  'Flawless Victory': 'quests.names.flawlessVictory',
  'Master of All': 'quests.names.masterOfAll',
  'Brain Champion': 'quests.names.brainChampion',
  'Unstoppable': 'quests.names.unstoppable',
};

// Category-based titles need special handling
const CATEGORY_TITLE_PATTERNS: { pattern: RegExp; key: string }[] = [
  { pattern: /(.+) Warm-up$/, key: 'quests.names.categoryWarmup' },
  { pattern: /(.+) Focus$/, key: 'quests.names.categoryFocus' },
];

// Quest type to description key mapping
type QuestType = 'games_played' | 'total_score' | 'category_games' | 'accuracy' | 'category_variety' | 'workout_complete' | 'perfect_game' | 'high_score';

const QUEST_DESCRIPTION_MAP: Record<QuestType, string> = {
  'games_played': 'quests.descriptions.playGames',
  'total_score': 'quests.descriptions.scorePoints',
  'category_games': 'quests.descriptions.playCategoryGames',
  'accuracy': 'quests.descriptions.getAccuracy',
  'category_variety': 'quests.descriptions.playCategories',
  'workout_complete': 'quests.descriptions.completeWorkout',
  'perfect_game': 'quests.descriptions.perfectGame',
  'high_score': 'quests.descriptions.beatPersonalBest',
};

export function getQuestTranslationKey(title: string): string | null {
  // Check direct map first
  if (QUEST_TITLE_MAP[title]) {
    return QUEST_TITLE_MAP[title];
  }

  // Check category patterns
  for (const { pattern, key } of CATEGORY_TITLE_PATTERNS) {
    if (pattern.test(title)) {
      return key;
    }
  }

  return null;
}

export function getQuestDescriptionKey(type: string, target: number): string | null {
  const key = QUEST_DESCRIPTION_MAP[type as QuestType];

  // Special case for perfect_game with multiple targets
  if (type === 'perfect_game' && target > 1) {
    return 'quests.descriptions.perfectGames';
  }

  return key || null;
}

export function extractCategoryFromTitle(title: string): string | null {
  for (const { pattern } of CATEGORY_TITLE_PATTERNS) {
    const match = title.match(pattern);
    if (match) {
      return match[1].toLowerCase();
    }
  }
  return null;
}
