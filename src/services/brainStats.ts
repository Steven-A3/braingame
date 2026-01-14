import type { GameCategory, GameResult } from '@/games/core/types';
import { CATEGORY_LABELS } from '@/games/core/types';

export interface CategoryScore {
  category: GameCategory;
  score: number;
  gamesPlayed: number;
  trend: 'improving' | 'stable' | 'declining';
  percentile: number;
}

export interface BrainStats {
  overallScore: number;
  categoryScores: CategoryScore[];
  trend: 'improving' | 'stable' | 'declining';
  weeklyProgress: number[];
  rank: string;
}

// Score thresholds for ranks
const RANKS = [
  { min: 900, label: 'Master' },
  { min: 800, label: 'Diamond' },
  { min: 700, label: 'Platinum' },
  { min: 600, label: 'Gold' },
  { min: 500, label: 'Silver' },
  { min: 0, label: 'Bronze' },
];

// Calculate brain stats from game history
export function calculateBrainStats(gameHistory: GameResult[]): BrainStats {
  const categoryScores = calculateCategoryScores(gameHistory);
  const overallScore = calculateOverallScore(categoryScores);
  const trend = calculateOverallTrend(gameHistory);
  const weeklyProgress = calculateWeeklyProgress(gameHistory);
  const rank = getRankForScore(overallScore);

  return {
    overallScore,
    categoryScores,
    trend,
    weeklyProgress,
    rank,
  };
}

function calculateCategoryScores(history: GameResult[]): CategoryScore[] {
  const categories: GameCategory[] = ['memory', 'logic', 'focus', 'calculation', 'language', 'speed'];

  return categories.map(category => {
    const categoryGames = history.filter(g => g.category === category);
    const recentGames = categoryGames.slice(0, 20); // Last 20 games in category

    if (recentGames.length === 0) {
      return {
        category,
        score: 0,
        gamesPlayed: 0,
        trend: 'stable' as const,
        percentile: 0,
      };
    }

    // Calculate weighted average score (recent games weighted more)
    const weightedScore = recentGames.reduce((sum, game, index) => {
      const weight = 1 / (index + 1); // Newer games have higher weight
      return sum + game.score * weight;
    }, 0);

    const totalWeight = recentGames.reduce((sum, _, index) => sum + 1 / (index + 1), 0);
    const avgScore = weightedScore / totalWeight;

    // Normalize score to 0-1000 scale (assuming max score per game is ~500)
    const normalizedScore = Math.min(Math.round((avgScore / 300) * 1000), 1000);

    // Calculate trend
    const trend = calculateCategoryTrend(recentGames);

    // Calculate percentile (simplified - would need population data in real app)
    const percentile = Math.min(Math.round(normalizedScore / 10), 99);

    return {
      category,
      score: normalizedScore,
      gamesPlayed: categoryGames.length,
      trend,
      percentile,
    };
  });
}

function calculateCategoryTrend(games: GameResult[]): 'improving' | 'stable' | 'declining' {
  if (games.length < 4) return 'stable';

  const recentAvg = games.slice(0, 3).reduce((sum, g) => sum + g.score, 0) / 3;
  const olderAvg = games.slice(3, 6).reduce((sum, g) => sum + g.score, 0) / Math.min(games.length - 3, 3);

  const diff = recentAvg - olderAvg;
  const threshold = olderAvg * 0.1; // 10% change threshold

  if (diff > threshold) return 'improving';
  if (diff < -threshold) return 'declining';
  return 'stable';
}

function calculateOverallScore(categoryScores: CategoryScore[]): number {
  const activeCategories = categoryScores.filter(c => c.gamesPlayed > 0);

  if (activeCategories.length === 0) return 0;

  // Weighted average - categories with more games have more weight
  const totalWeight = activeCategories.reduce((sum, c) => sum + Math.min(c.gamesPlayed, 20), 0);
  const weightedSum = activeCategories.reduce(
    (sum, c) => sum + c.score * Math.min(c.gamesPlayed, 20),
    0
  );

  return Math.round(weightedSum / totalWeight);
}

function calculateOverallTrend(history: GameResult[]): 'improving' | 'stable' | 'declining' {
  if (history.length < 10) return 'stable';

  const recentAvg = history.slice(0, 5).reduce((sum, g) => sum + g.score, 0) / 5;
  const olderAvg = history.slice(5, 10).reduce((sum, g) => sum + g.score, 0) / 5;

  const diff = recentAvg - olderAvg;
  const threshold = olderAvg * 0.1;

  if (diff > threshold) return 'improving';
  if (diff < -threshold) return 'declining';
  return 'stable';
}

function calculateWeeklyProgress(history: GameResult[]): number[] {
  const weeks: number[] = [];
  const now = new Date();

  for (let i = 0; i < 8; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);

    const weekGames = history.filter(g => {
      const gameDate = new Date(g.date);
      return gameDate >= weekStart && gameDate < weekEnd;
    });

    const weekScore = weekGames.length > 0
      ? Math.round(weekGames.reduce((sum, g) => sum + g.score, 0) / weekGames.length)
      : 0;

    weeks.unshift(weekScore);
  }

  return weeks;
}

function getRankForScore(score: number): string {
  for (const rank of RANKS) {
    if (score >= rank.min) {
      return rank.label;
    }
  }
  return 'Bronze';
}

// Get trend icon
export function getTrendIcon(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return '↑';
    case 'declining': return '↓';
    default: return '→';
  }
}

// Get trend color
export function getTrendColor(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving': return '#22C55E'; // green-500
    case 'declining': return '#EF4444'; // red-500
    default: return '#94A3B8'; // slate-400
  }
}

// Get rank color
export function getRankColor(rank: string): string {
  switch (rank) {
    case 'Master': return '#F59E0B'; // amber-500
    case 'Diamond': return '#06B6D4'; // cyan-500
    case 'Platinum': return '#A855F7'; // purple-500
    case 'Gold': return '#EAB308'; // yellow-500
    case 'Silver': return '#9CA3AF'; // gray-400
    default: return '#CD7F32'; // bronze
  }
}

// Format category label for display
export function formatCategoryLabel(category: GameCategory): string {
  return CATEGORY_LABELS[category];
}
