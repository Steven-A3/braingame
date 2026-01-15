import type { Quest, QuestTemplate, DailyQuestSlots } from './types';
import type { GameCategory } from '@/games/core/types';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/games/core/types';
import {
  getTemplatesByDifficulty,
  formatTemplateString,
} from './questTemplates';

// Seeded random number generator for consistent daily quests
function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Get seed for today's date
function getTodaySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

// Get end of day timestamp
function getEndOfDay(): string {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return endOfDay.toISOString();
}

// Shuffle array with seeded random
function shuffleArray<T>(array: T[], random: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Pick random item from array
function pickRandom<T>(array: T[], random: () => number): T {
  return array[Math.floor(random() * array.length)];
}

// Pick random number in range
function pickInRange(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

// Default quest slot configuration
const DEFAULT_QUEST_SLOTS: DailyQuestSlots = {
  easy: 2,
  medium: 2,
  hard: 1,
};

// Categories for random selection
const CATEGORIES: GameCategory[] = ['memory', 'logic', 'focus', 'calculation', 'language', 'speed'];

// Generate a single quest from template
function generateQuestFromTemplate(
  template: QuestTemplate,
  random: () => number,
  questIndex: number,
  forcedCategory?: GameCategory
): Quest {
  const target = pickInRange(template.targetRange[0], template.targetRange[1], random);
  const category = forcedCategory || (template.type === 'category_games' ? pickRandom(CATEGORIES, random) : undefined);

  const categoryLabel = category ? CATEGORY_LABELS[category] : '';
  const categoryIcon = category ? CATEGORY_ICONS[category] : '';

  const title = formatTemplateString(template.titleTemplate, {
    target,
    category: categoryLabel,
    categoryIcon,
  });

  const description = formatTemplateString(template.descriptionTemplate, {
    target,
    category: categoryLabel.toLowerCase(),
    categoryIcon,
  });

  const icon = template.icon === '{categoryIcon}' && category
    ? CATEGORY_ICONS[category]
    : template.icon;

  // Scale rewards slightly based on target
  const targetMultiplier = target / template.targetRange[0];
  const scaledReward = {
    coins: Math.floor(template.baseReward.coins * targetMultiplier),
    xp: Math.floor(template.baseReward.xp * targetMultiplier),
    gems: template.baseReward.gems ? Math.floor(template.baseReward.gems * targetMultiplier) : undefined,
  };

  return {
    id: `quest_${getTodaySeed()}_${questIndex}`,
    period: 'daily',
    difficulty: template.difficulty,
    title,
    description,
    icon,
    requirement: {
      type: template.type,
      target,
      category,
    },
    reward: scaledReward,
    progress: 0,
    target,
    completed: false,
    claimed: false,
    expiresAt: getEndOfDay(),
  };
}

// Generate daily quests
export function generateDailyQuests(
  slots: DailyQuestSlots = DEFAULT_QUEST_SLOTS,
  userLevel: number = 1
): Quest[] {
  const seed = getTodaySeed();
  const random = seededRandom(seed);
  const quests: Quest[] = [];
  let questIndex = 0;

  // Track used quest types to avoid duplicates
  const usedTypes = new Set<string>();

  // Generate quests for each difficulty slot (excluding legendary which is handled separately)
  const difficulties = ['easy', 'medium', 'hard'] as const;

  for (const difficulty of difficulties) {
    const count = slots[difficulty] as number;
    const templates = shuffleArray(getTemplatesByDifficulty(difficulty), random);

    let generated = 0;
    for (const template of templates) {
      if (generated >= count) break;

      // Create unique key for this quest type
      const typeKey = template.type === 'category_games'
        ? `${template.type}_${template.difficulty}`
        : template.type;

      // Skip if we already have this type (unless it's category-specific)
      if (usedTypes.has(typeKey) && template.type !== 'category_games') {
        continue;
      }

      const quest = generateQuestFromTemplate(template, random, questIndex++);
      quests.push(quest);
      usedTypes.add(typeKey);
      generated++;
    }
  }

  // Add legendary quest for higher level users (level 5+)
  if (userLevel >= 5) {
    const legendaryTemplates = shuffleArray(getTemplatesByDifficulty('legendary'), random);
    if (legendaryTemplates.length > 0) {
      const legendaryQuest = generateQuestFromTemplate(
        legendaryTemplates[0],
        random,
        questIndex++
      );
      quests.push(legendaryQuest);
    }
  }

  return quests;
}

// Check if quests need to be regenerated (new day)
export function shouldRegenerateQuests(existingQuests: Quest[]): boolean {
  if (existingQuests.length === 0) return true;

  const now = new Date();
  const firstQuestExpiry = new Date(existingQuests[0].expiresAt);

  return now >= firstQuestExpiry;
}

// Get time remaining until quest reset
export function getTimeUntilReset(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const diff = endOfDay.getTime() - now.getTime();

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

// Format time until reset as string
export function formatTimeUntilReset(): string {
  const { hours, minutes } = getTimeUntilReset();
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
