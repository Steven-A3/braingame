import type { GameCategory, GameInfo } from '@/games/core/types';
import { getDailySeed, getGameSeed } from '@/games/core/SeededRNG';
import { calculateDifficulty } from '@/games/core/DifficultySystem';
import { GAMES, GAMES_BY_CATEGORY } from '@/games/registry';

/**
 * Monthly themes with focus categories
 */
const MONTHLY_THEMES: Record<number, { theme: string; focus: GameCategory }> = {
  1: { theme: 'New Beginnings', focus: 'memory' },
  2: { theme: 'Love & Connection', focus: 'language' },
  3: { theme: 'Growth & Spring', focus: 'logic' },
  4: { theme: 'Clarity & Focus', focus: 'focus' },
  5: { theme: 'Mental Agility', focus: 'speed' },
  6: { theme: 'Summer Sharpness', focus: 'calculation' },
  7: { theme: 'Creative Thinking', focus: 'language' },
  8: { theme: 'Back to Basics', focus: 'memory' },
  9: { theme: 'Analytical September', focus: 'logic' },
  10: { theme: 'Autumn Awareness', focus: 'focus' },
  11: { theme: 'Gratitude & Recall', focus: 'memory' },
  12: { theme: 'Year in Review', focus: 'calculation' },
};

/**
 * Weekly rotation - each day focuses on a category
 */
const WEEKLY_ROTATION: Record<number, GameCategory> = {
  0: 'memory',      // Sunday
  1: 'memory',      // Monday
  2: 'logic',       // Tuesday
  3: 'focus',       // Wednesday
  4: 'calculation', // Thursday
  5: 'speed',       // Friday
  6: 'language',    // Saturday
};

/**
 * Special days override
 */
const SPECIAL_DAYS: { month: number; day: number; name: string; gameId?: string }[] = [
  { month: 1, day: 1, name: 'New Year Challenge' },
  { month: 3, day: 14, name: 'Pi Day Math Blitz', gameId: 'math-sprint' },
  { month: 7, day: 4, name: 'Independence Speed', gameId: 'reflex-tap' },
  { month: 10, day: 31, name: 'Halloween Memory', gameId: 'pattern-echo' },
  { month: 12, day: 25, name: 'Holiday Challenge' },
];

export interface DailyChallenge {
  date: string;
  game: GameInfo;
  seed: number;
  difficulty: number;
  theme: string;
  isSpecialDay: boolean;
  specialDayName?: string;
}

/**
 * Get today's challenge
 */
export function getDailyChallenge(date: Date = new Date()): DailyChallenge {
  const dateStr = date.toISOString().split('T')[0];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = date.getDay();

  // Check for special day
  const specialDay = SPECIAL_DAYS.find(
    (sd) => sd.month === month && sd.day === day
  );

  // Get game for today
  let game: GameInfo;

  if (specialDay?.gameId) {
    game = GAMES.find((g) => g.id === specialDay.gameId) || GAMES[0];
  } else {
    // Use weekly rotation category
    const category = WEEKLY_ROTATION[dayOfWeek];
    const categoryGames = GAMES_BY_CATEGORY[category];

    // Use daily seed to pick consistently
    const dailySeed = getDailySeed(date);
    const gameIndex = dailySeed % categoryGames.length;
    game = categoryGames[gameIndex] || GAMES[0];
  }

  // Get theme
  const monthlyTheme = MONTHLY_THEMES[month];
  const theme = specialDay?.name || monthlyTheme?.theme || 'Daily Challenge';

  // Calculate difficulty
  const difficulty = calculateDifficulty(5, date);

  // Get seed for this game
  const seed = getGameSeed(game.id, date);

  return {
    date: dateStr,
    game,
    seed,
    difficulty,
    theme,
    isSpecialDay: !!specialDay,
    specialDayName: specialDay?.name,
  };
}

/**
 * Get challenge for a specific date
 */
export function getChallengeForDate(dateStr: string): DailyChallenge {
  return getDailyChallenge(new Date(dateStr));
}

/**
 * Get upcoming challenges (for preview)
 */
export function getUpcomingChallenges(days: number = 7): DailyChallenge[] {
  const challenges: DailyChallenge[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    challenges.push(getDailyChallenge(date));
  }

  return challenges;
}
