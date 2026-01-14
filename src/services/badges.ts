import type { GameCategory } from '@/games/core/types';

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'streak' | 'mastery' | 'special' | 'social';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: BadgeRequirement;
  secret?: boolean;
}

export type BadgeRequirement =
  | { type: 'streak'; days: number }
  | { type: 'games_played'; count: number }
  | { type: 'category_games'; category: GameCategory; count: number }
  | { type: 'perfect_score'; count: number }
  | { type: 'total_score'; score: number }
  | { type: 'time_played'; category: 'early_bird' | 'night_owl' }
  | { type: 'special_day'; day: string }
  | { type: 'first_share' }
  | { type: 'install_pwa' };

export interface BadgeProgress {
  badgeId: string;
  current: number;
  target: number;
  earnedAt?: string;
}

// Badge rarity colors
export const BADGE_RARITY_COLORS: Record<BadgeRarity, string> = {
  common: '#9CA3AF',      // gray-400
  uncommon: '#22C55E',    // green-500
  rare: '#3B82F6',        // blue-500
  epic: '#A855F7',        // purple-500
  legendary: '#F59E0B',   // amber-500
};

// All badges in the game
export const BADGES: Badge[] = [
  // Streak badges
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    requirement: { type: 'streak', days: 7 },
  },
  {
    id: 'streak-14',
    name: 'Fortnight Fighter',
    description: 'Maintain a 14-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'uncommon',
    requirement: { type: 'streak', days: 14 },
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'rare',
    requirement: { type: 'streak', days: 30 },
  },
  {
    id: 'streak-60',
    name: 'Brain Builder',
    description: 'Maintain a 60-day streak',
    icon: '💪',
    category: 'streak',
    rarity: 'epic',
    requirement: { type: 'streak', days: 60 },
  },
  {
    id: 'streak-90',
    name: 'Dedication Champion',
    description: 'Maintain a 90-day streak',
    icon: '🏆',
    category: 'streak',
    rarity: 'epic',
    requirement: { type: 'streak', days: 90 },
  },
  {
    id: 'streak-180',
    name: 'Half-Year Hero',
    description: 'Maintain a 180-day streak',
    icon: '⭐',
    category: 'streak',
    rarity: 'legendary',
    requirement: { type: 'streak', days: 180 },
  },
  {
    id: 'streak-365',
    name: 'Year of Wisdom',
    description: 'Maintain a 365-day streak',
    icon: '👑',
    category: 'streak',
    rarity: 'legendary',
    requirement: { type: 'streak', days: 365 },
  },

  // Category mastery badges
  {
    id: 'mastery-memory',
    name: 'Memory Maven',
    description: 'Play 50 memory games',
    icon: '🧠',
    category: 'mastery',
    rarity: 'rare',
    requirement: { type: 'category_games', category: 'memory', count: 50 },
  },
  {
    id: 'mastery-logic',
    name: 'Logic Legend',
    description: 'Play 50 logic games',
    icon: '🧩',
    category: 'mastery',
    rarity: 'rare',
    requirement: { type: 'category_games', category: 'logic', count: 50 },
  },
  {
    id: 'mastery-focus',
    name: 'Focus Force',
    description: 'Play 50 focus games',
    icon: '🎯',
    category: 'mastery',
    rarity: 'rare',
    requirement: { type: 'category_games', category: 'focus', count: 50 },
  },
  {
    id: 'mastery-calculation',
    name: 'Calculation King',
    description: 'Play 50 calculation games',
    icon: '🔢',
    category: 'mastery',
    rarity: 'rare',
    requirement: { type: 'category_games', category: 'calculation', count: 50 },
  },
  {
    id: 'mastery-language',
    name: 'Language Luminary',
    description: 'Play 50 language games',
    icon: '📝',
    category: 'mastery',
    rarity: 'rare',
    requirement: { type: 'category_games', category: 'language', count: 50 },
  },
  {
    id: 'mastery-speed',
    name: 'Speed Specialist',
    description: 'Play 50 speed games',
    icon: '⚡',
    category: 'mastery',
    rarity: 'rare',
    requirement: { type: 'category_games', category: 'speed', count: 50 },
  },

  // Games played badges
  {
    id: 'games-10',
    name: 'Getting Started',
    description: 'Play 10 games',
    icon: '🎮',
    category: 'mastery',
    rarity: 'common',
    requirement: { type: 'games_played', count: 10 },
  },
  {
    id: 'games-50',
    name: 'Regular Player',
    description: 'Play 50 games',
    icon: '🎮',
    category: 'mastery',
    rarity: 'uncommon',
    requirement: { type: 'games_played', count: 50 },
  },
  {
    id: 'games-100',
    name: 'Century Club',
    description: 'Play 100 games',
    icon: '💯',
    category: 'mastery',
    rarity: 'rare',
    requirement: { type: 'games_played', count: 100 },
  },
  {
    id: 'games-500',
    name: 'Brain Athlete',
    description: 'Play 500 games',
    icon: '🏅',
    category: 'mastery',
    rarity: 'epic',
    requirement: { type: 'games_played', count: 500 },
  },

  // Score badges
  {
    id: 'score-10k',
    name: 'Score Seeker',
    description: 'Earn 10,000 total points',
    icon: '📊',
    category: 'mastery',
    rarity: 'common',
    requirement: { type: 'total_score', score: 10000 },
  },
  {
    id: 'score-50k',
    name: 'Point Master',
    description: 'Earn 50,000 total points',
    icon: '📊',
    category: 'mastery',
    rarity: 'uncommon',
    requirement: { type: 'total_score', score: 50000 },
  },
  {
    id: 'score-100k',
    name: 'High Scorer',
    description: 'Earn 100,000 total points',
    icon: '🌟',
    category: 'mastery',
    rarity: 'rare',
    requirement: { type: 'total_score', score: 100000 },
  },

  // Perfect score badges
  {
    id: 'perfect-1',
    name: 'Perfect Start',
    description: 'Get a perfect score on any game',
    icon: '✨',
    category: 'mastery',
    rarity: 'uncommon',
    requirement: { type: 'perfect_score', count: 1 },
  },
  {
    id: 'perfect-10',
    name: 'Perfectionist',
    description: 'Get 10 perfect scores',
    icon: '💎',
    category: 'mastery',
    rarity: 'epic',
    requirement: { type: 'perfect_score', count: 10 },
  },

  // Special time badges
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a game before 7 AM',
    icon: '🌅',
    category: 'special',
    rarity: 'uncommon',
    requirement: { type: 'time_played', category: 'early_bird' },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a game after 11 PM',
    icon: '🦉',
    category: 'special',
    rarity: 'uncommon',
    requirement: { type: 'time_played', category: 'night_owl' },
  },

  // Special day badges
  {
    id: 'pi-day',
    name: 'Pi Day Champion',
    description: 'Play on March 14th (Pi Day)',
    icon: '🥧',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'special_day', day: '03-14' },
    secret: true,
  },
  {
    id: 'new-year',
    name: 'New Year New Brain',
    description: 'Play on New Year\'s Day',
    icon: '🎉',
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'special_day', day: '01-01' },
    secret: true,
  },

  // Social badges
  {
    id: 'first-share',
    name: 'Social Brain',
    description: 'Share your first result',
    icon: '📤',
    category: 'social',
    rarity: 'common',
    requirement: { type: 'first_share' },
  },
  {
    id: 'pwa-install',
    name: 'Home Screen Hero',
    description: 'Install Daily Brain as an app',
    icon: '📱',
    category: 'social',
    rarity: 'uncommon',
    requirement: { type: 'install_pwa' },
  },
];

// Get badge by ID
export function getBadge(id: string): Badge | undefined {
  return BADGES.find(b => b.id === id);
}

// Get all badges in a category
export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return BADGES.filter(b => b.category === category);
}

// Get all badges of a rarity
export function getBadgesByRarity(rarity: BadgeRarity): Badge[] {
  return BADGES.filter(b => b.rarity === rarity);
}

// Calculate progress for a badge based on user stats
export function calculateBadgeProgress(
  badge: Badge,
  stats: {
    currentStreak: number;
    longestStreak: number;
    totalGamesPlayed: number;
    totalScore: number;
    perfectGames: number;
    categoryGames: Record<GameCategory, number>;
    hasShared: boolean;
    hasInstalledPWA: boolean;
    playedDates: string[];
  }
): BadgeProgress {
  const requirement = badge.requirement;
  let current = 0;
  let target = 1;

  switch (requirement.type) {
    case 'streak':
      current = stats.longestStreak;
      target = requirement.days;
      break;
    case 'games_played':
      current = stats.totalGamesPlayed;
      target = requirement.count;
      break;
    case 'category_games':
      current = stats.categoryGames[requirement.category] || 0;
      target = requirement.count;
      break;
    case 'total_score':
      current = stats.totalScore;
      target = requirement.score;
      break;
    case 'perfect_score':
      current = stats.perfectGames;
      target = requirement.count;
      break;
    case 'time_played':
      // Check if any played date falls in the right time window
      // This is typically tracked separately when a game completes
      current = 0; // Would need to track this in the store
      target = 1;
      break;
    case 'special_day':
      // Check if user played on the special day
      current = stats.playedDates.some(d => d.endsWith(requirement.day)) ? 1 : 0;
      target = 1;
      break;
    case 'first_share':
      current = stats.hasShared ? 1 : 0;
      target = 1;
      break;
    case 'install_pwa':
      current = stats.hasInstalledPWA ? 1 : 0;
      target = 1;
      break;
  }

  return {
    badgeId: badge.id,
    current: Math.min(current, target),
    target,
    earnedAt: current >= target ? new Date().toISOString() : undefined,
  };
}

// Check if a badge is newly earned
export function checkNewBadges(
  previousProgress: BadgeProgress[],
  currentProgress: BadgeProgress[]
): Badge[] {
  const newBadges: Badge[] = [];

  for (const current of currentProgress) {
    const previous = previousProgress.find(p => p.badgeId === current.badgeId);

    // Badge is newly earned if it wasn't earned before but is now
    if (current.earnedAt && (!previous || !previous.earnedAt)) {
      const badge = getBadge(current.badgeId);
      if (badge) {
        newBadges.push(badge);
      }
    }
  }

  return newBadges;
}

// Sort badges by rarity (legendary first) and then by category
export function sortBadges(badges: Badge[]): Badge[] {
  const rarityOrder: Record<BadgeRarity, number> = {
    legendary: 0,
    epic: 1,
    rare: 2,
    uncommon: 3,
    common: 4,
  };

  return [...badges].sort((a, b) => {
    const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    return a.category.localeCompare(b.category);
  });
}
