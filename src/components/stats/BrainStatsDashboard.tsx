import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RadarChart } from './RadarChart';
import { LineChart, Sparkline } from './LineChart';
import { useUserStore } from '@/stores/userStore';
import { calculateBrainStats, getTrendIcon, getTrendColor, getRankColor } from '@/services/brainStats';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/games/core/types';
import type { GameCategory } from '@/games/core/types';

export function BrainStatsDashboard() {
  const { gameHistory, stats } = useUserStore();

  const brainStats = useMemo(() => {
    return calculateBrainStats(gameHistory);
  }, [gameHistory]);

  const weekLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 7; i >= 0; i--) {
      if (i === 0) labels.push('Now');
      else if (i === 7) labels.push('8w');
      else labels.push(`${i}w`);
    }
    return labels;
  }, []);

  if (stats.totalGamesPlayed === 0) {
    return (
      <div className="p-4">
        <div className="card text-center py-8">
          <div className="text-5xl mb-4">🧠</div>
          <h3 className="text-lg font-semibold mb-2">No Stats Yet</h3>
          <p className="text-slate-400 text-sm">
            Play some games to see your brain stats!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-slate-400">Brain Score</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary-400">
                {brainStats.overallScore}
              </span>
              <span
                className="text-sm font-medium flex items-center gap-1"
                style={{ color: getTrendColor(brainStats.trend) }}
              >
                {getTrendIcon(brainStats.trend)}
                {brainStats.trend}
              </span>
            </div>
          </div>
          <div
            className="text-right px-4 py-2 rounded-lg"
            style={{ backgroundColor: `${getRankColor(brainStats.rank)}20` }}
          >
            <div className="text-xs text-slate-400">Rank</div>
            <div
              className="text-xl font-bold"
              style={{ color: getRankColor(brainStats.rank) }}
            >
              {brainStats.rank}
            </div>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div>
          <div className="text-sm text-slate-400 mb-2">Weekly Progress</div>
          <LineChart
            data={brainStats.weeklyProgress}
            labels={weekLabels}
            height={100}
          />
        </div>
      </motion.div>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="font-semibold mb-4">Category Balance</h3>
        <div className="flex justify-center">
          <RadarChart data={brainStats.categoryScores} size={240} />
        </div>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="font-semibold mb-4">Category Details</h3>
        <div className="space-y-4">
          {brainStats.categoryScores.map((cat, index) => (
            <CategoryRow
              key={cat.category}
              category={cat.category}
              score={cat.score}
              gamesPlayed={cat.gamesPlayed}
              trend={cat.trend}
              percentile={cat.percentile}
              delay={index * 0.05}
              recentScores={getRecentCategoryScores(gameHistory, cat.category)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

interface CategoryRowProps {
  category: GameCategory;
  score: number;
  gamesPlayed: number;
  trend: 'improving' | 'stable' | 'declining';
  percentile: number;
  delay: number;
  recentScores: number[];
}

function CategoryRow({
  category,
  score,
  gamesPlayed,
  trend,
  percentile,
  delay,
  recentScores,
}: CategoryRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3"
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
        style={{ backgroundColor: `${CATEGORY_COLORS[category]}20` }}
      >
        {CATEGORY_ICONS[category]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{CATEGORY_LABELS[category]}</span>
          <span
            className="text-xs"
            style={{ color: getTrendColor(trend) }}
          >
            {getTrendIcon(trend)}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          {gamesPlayed} games played
        </div>
      </div>

      {/* Sparkline */}
      {recentScores.length > 1 && (
        <div className="hidden sm:block">
          <Sparkline
            data={recentScores}
            width={50}
            height={20}
            color={CATEGORY_COLORS[category]}
          />
        </div>
      )}

      {/* Score */}
      <div className="text-right">
        <div
          className="font-bold"
          style={{ color: CATEGORY_COLORS[category] }}
        >
          {score}
        </div>
        <div className="text-xs text-slate-500">
          Top {100 - percentile}%
        </div>
      </div>
    </motion.div>
  );
}

// Helper to get recent scores for a category
function getRecentCategoryScores(
  history: { category: GameCategory; score: number }[],
  category: GameCategory
): number[] {
  return history
    .filter(g => g.category === category)
    .slice(0, 10)
    .map(g => g.score)
    .reverse();
}
