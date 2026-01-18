import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { getDailyChallenge } from '@/services/dailyContent';
import { useUserStore } from '@/stores/userStore';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/games/core/types';
import { getDifficultyLabel } from '@/games/core/DifficultySystem';
import { StreakDisplay } from '@/components/ui/StreakDisplay';
import { DailyQuests, useQuestStore } from '@/features/quests';

export function HomePage() {
  const { t } = useTranslation();
  const { stats, completedToday, checkStreak, currency, getLevel } = useUserStore();
  const { initializeQuests } = useQuestStore();
  const dailyChallenge = getDailyChallenge();
  const levelInfo = getLevel();

  // Get translated game name and description
  const gameName = t(`games.names.${dailyChallenge.game.id}`, { defaultValue: dailyChallenge.game.name });
  const gameDescription = t(`games.descriptions.${dailyChallenge.game.id}`, { defaultValue: dailyChallenge.game.description });
  const categoryName = t(`games.categories.${dailyChallenge.game.category}`, { defaultValue: dailyChallenge.game.category });

  // Check streak and initialize quests on mount
  useEffect(() => {
    checkStreak();
    initializeQuests();
  }, [checkStreak, initializeQuests]);

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header with Level and Currency */}
      <header className="flex items-center justify-between mb-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t('app.name')}</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-purple-400 font-medium">
              {t('common.level')} {levelInfo.level}
            </span>
            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(levelInfo.currentXP / levelInfo.requiredXP) * 100}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-lg">
            <span>🪙</span>
            <span className="font-medium text-yellow-400">{currency.coins}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-lg">
            <span>💎</span>
            <span className="font-medium text-cyan-400">{currency.gems}</span>
          </div>
        </div>
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
            <h2 className="text-xl font-bold mb-1">{gameName}</h2>
            <p className="text-slate-400 text-sm mb-2">
              {gameDescription}
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
                {CATEGORY_ICONS[dailyChallenge.game.category]} {categoryName}
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
          {completedToday ? `✓ ${t('results.playAgain')}` : `▶ ${t('games.play')}`}
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
              <div className="font-semibold">{t('home.dailyWorkout')}</div>
              <div className="text-xs text-slate-400">{t('home.workoutSubtitle')}</div>
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
              <div className="font-semibold">{t('nav.leaderboard')}</div>
              <div className="text-xs text-slate-400">{t('home.leaderboardSubtitle')}</div>
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
              <div className="font-semibold">{t('nav.progress')}</div>
              <div className="text-xs text-slate-400">{t('home.progressSubtitle')}</div>
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
              <div className="font-semibold">{t('nav.settings')}</div>
              <div className="text-xs text-slate-400">{t('home.settingsSubtitle')}</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Daily Quests */}
      <div className="mb-6">
        <DailyQuests compact maxDisplay={3} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-primary-400">
            {stats.totalGamesPlayed}
          </div>
          <div className="text-xs text-slate-400">{t('progress.totalGames')}</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-primary-400">
            {stats.longestStreak}
          </div>
          <div className="text-xs text-slate-400">{t('progress.bestStreak')}</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-primary-400">
            {stats.totalScore.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">{t('common.score')}</div>
        </div>
      </div>

      {/* Theme of the month */}
      <div className="text-center text-slate-500 text-sm pb-4">
        {dailyChallenge.theme}
      </div>
    </div>
  );
}
