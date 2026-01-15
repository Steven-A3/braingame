import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { getDailyChallenge } from '@/services/dailyContent';
import { useUserStore } from '@/stores/userStore';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/games/core/types';
import { getDifficultyLabel } from '@/games/core/DifficultySystem';
import { StreakDisplay } from '@/components/ui/StreakDisplay';
import { BannerAd } from '@/components/ads/AdUnit';

export function HomePage() {
  const { stats, completedToday, checkStreak } = useUserStore();
  const dailyChallenge = getDailyChallenge();

  // Check streak on mount
  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header */}
      <header className="text-center mb-6 pt-4">
        <h1 className="text-2xl font-bold mb-1">Daily Brain</h1>
        <p className="text-slate-400 text-sm">A new game every day</p>
      </header>

      {/* Streak display */}
      <StreakDisplay
        currentStreak={stats.currentStreak}
        completedToday={completedToday}
      />

      {/* Today's Challenge Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-6"
      >
        {/* Theme badge */}
        {dailyChallenge.isSpecialDay && (
          <div className="mb-3">
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
              ✨ {dailyChallenge.specialDayName}
            </span>
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Game icon */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${CATEGORY_COLORS[dailyChallenge.game.category]}20` }}
          >
            {dailyChallenge.game.icon}
          </div>

          {/* Game info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{dailyChallenge.game.name}</h2>
            <p className="text-slate-400 text-sm mb-2">
              {dailyChallenge.game.description}
            </p>

            {/* Meta info */}
            <div className="flex gap-3 text-xs">
              <span
                className="px-2 py-1 rounded-full"
                style={{
                  backgroundColor: `${CATEGORY_COLORS[dailyChallenge.game.category]}20`,
                  color: CATEGORY_COLORS[dailyChallenge.game.category],
                }}
              >
                {CATEGORY_ICONS[dailyChallenge.game.category]} {dailyChallenge.game.category}
              </span>
              <span className="px-2 py-1 bg-slate-700 rounded-full text-slate-300">
                {dailyChallenge.game.duration}
              </span>
              <span className="px-2 py-1 bg-slate-700 rounded-full text-slate-300">
                {getDifficultyLabel(dailyChallenge.difficulty)}
              </span>
            </div>
          </div>
        </div>

        {/* Play button */}
        <Link
          to={`/play/${dailyChallenge.game.id}`}
          className={clsx(
            'btn-primary w-full mt-6 text-center block',
            completedToday && 'bg-green-600 hover:bg-green-700'
          )}
        >
          {completedToday ? '✓ Play Again' : '▶ Play Now'}
        </Link>
      </motion.div>

      {/* Daily Workout & Leaderboard */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Link
          to="/workout"
          className="card hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏋️</div>
            <div>
              <div className="font-semibold">Daily Workout</div>
              <div className="text-xs text-slate-400">5 curated games</div>
            </div>
          </div>
        </Link>
        <Link
          to="/leaderboard"
          className="card hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏆</div>
            <div>
              <div className="font-semibold">Leaderboard</div>
              <div className="text-xs text-slate-400">Your best scores</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Progress & Settings */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link
          to="/progress"
          className="card hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">📊</div>
            <div>
              <div className="font-semibold">Progress</div>
              <div className="text-xs text-slate-400">Charts & trends</div>
            </div>
          </div>
        </Link>
        <Link
          to="/settings"
          className="card hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚙️</div>
            <div>
              <div className="font-semibold">Settings</div>
              <div className="text-xs text-slate-400">Preferences</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-primary-400">
            {stats.totalGamesPlayed}
          </div>
          <div className="text-xs text-slate-400">Games Played</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-primary-400">
            {stats.longestStreak}
          </div>
          <div className="text-xs text-slate-400">Best Streak</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-primary-400">
            {stats.totalScore.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">Total Score</div>
        </div>
      </div>

      {/* Ad Banner */}
      <BannerAd className="mb-6" />

      {/* Theme of the month */}
      <div className="text-center text-slate-500 text-sm">
        {dailyChallenge.theme}
      </div>
    </div>
  );
}
