import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { BADGES, sortBadges } from '@/services/badges';
import type { Badge, BadgeProgress } from '@/services/badges';
import { BadgeNotification, BadgeList } from '@/components/ui/BadgeCard';
import { BrainStatsDashboard } from '@/components/stats/BrainStatsDashboard';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/games/core/types';
import type { GameCategory } from '@/games/core/types';

type TabType = 'stats' | 'badges' | 'history';

export function ProfilePage() {
  const { t } = useTranslation();
  const { stats, gameHistory, earnedBadges, badgeProgress, newBadges, clearNewBadges } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [showBadgeModal, setShowBadgeModal] = useState<Badge | null>(null);
  const [showNewBadge, setShowNewBadge] = useState<Badge | null>(null);

  // Show new badge notification
  useEffect(() => {
    if (newBadges.length > 0) {
      setShowNewBadge(newBadges[0]);
    }
  }, [newBadges]);

  const handleCloseBadgeNotification = () => {
    setShowNewBadge(null);
    clearNewBadges();
  };

  // Create progress map
  const progressMap = useMemo(() => {
    const map = new Map<string, BadgeProgress>();
    badgeProgress.forEach(p => map.set(p.badgeId, p));
    return map;
  }, [badgeProgress]);

  // Sorted badges
  const sortedBadges = useMemo(() => sortBadges(BADGES), []);

  const tabLabels: Record<TabType, string> = {
    stats: t('profile.stats'),
    badges: t('profile.badges'),
    history: t('profile.history'),
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <header className="mb-6 pt-4">
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
        <p className="text-slate-400 text-sm">{t('profile.subtitle')}</p>
      </header>

      {/* Quick stats */}
      <div className="card mb-6">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-400">{stats.totalGamesPlayed}</div>
            <div className="text-xs text-slate-500">{t('profile.games')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-400 flex items-center justify-center gap-1">
              <span className="text-lg">🔥</span>
              {stats.currentStreak}
            </div>
            <div className="text-xs text-slate-500">{t('profile.streak')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-400">{earnedBadges.length}</div>
            <div className="text-xs text-slate-500">{t('profile.badges')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-400">
              {Math.round(stats.totalScore / 1000)}k
            </div>
            <div className="text-xs text-slate-500">{t('profile.points')}</div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 bg-slate-800 rounded-xl p-1">
        {(['stats', 'badges', 'history'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-primary-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <BrainStatsDashboard />
          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{t('profile.achievements')}</h3>
                <span className="text-sm text-slate-400">
                  {earnedBadges.length}/{BADGES.length}
                </span>
              </div>
              <BadgeList
                badges={sortedBadges}
                progressMap={progressMap}
                onBadgeClick={(badge) => setShowBadgeModal(badge)}
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <HistoryTab gameHistory={gameHistory} t={t} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge detail modal */}
      <AnimatePresence>
        {showBadgeModal && (
          <BadgeDetailModal
            badge={showBadgeModal}
            progress={progressMap.get(showBadgeModal.id)}
            onClose={() => setShowBadgeModal(null)}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* New badge notification */}
      <AnimatePresence>
        {showNewBadge && (
          <BadgeNotification
            badge={showNewBadge}
            onClose={handleCloseBadgeNotification}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// History tab component
function HistoryTab({ gameHistory, t }: { gameHistory: { category: GameCategory; score: number; gameId: string; date: string; accuracy: number }[]; t: (key: string, options?: Record<string, unknown>) => string }) {
  if (gameHistory.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="text-5xl mb-4">📜</div>
        <h3 className="text-lg font-semibold mb-2">{t('profile.noHistoryYet')}</h3>
        <p className="text-slate-400 text-sm">
          {t('profile.startPlaying')}
        </p>
      </div>
    );
  }

  // Group by date
  const groupedHistory = gameHistory.reduce((acc, result) => {
    const date = result.date.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(result);
    return acc;
  }, {} as Record<string, typeof gameHistory>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedHistory).slice(0, 7).map(([date, games]) => (
        <div key={date} className="card">
          <div className="text-sm text-slate-400 mb-3">
            {formatDate(date, t)}
          </div>
          <div className="space-y-2">
            {games.map((result, index) => (
              <div
                key={`${date}-${index}`}
                className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${CATEGORY_COLORS[result.category]}20` }}
                  >
                    {CATEGORY_ICONS[result.category]}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{t(`games.names.${result.gameId}`, { defaultValue: formatGameName(result.gameId) })}</div>
                    <div className="text-xs text-slate-500">
                      {t(`games.categories.${result.category}`)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary-400">
                    {result.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    {Math.round(result.accuracy * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Badge detail modal
function BadgeDetailModal({
  badge,
  progress,
  onClose,
  t,
}: {
  badge: Badge;
  progress?: BadgeProgress;
  onClose: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const isEarned = progress?.earnedAt != null;
  const progressPercent = progress
    ? Math.min((progress.current / progress.target) * 100, 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-2xl p-6 max-w-xs mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className={`text-6xl mb-3 ${!isEarned && 'grayscale opacity-50'}`}>
            {badge.icon}
          </div>
          <h3 className="text-xl font-bold mb-1">
            {badge.secret && !isEarned ? t('profile.secretBadge') : badge.name}
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            {badge.secret && !isEarned ? t('profile.secretBadgeHint') : badge.description}
          </p>

          {/* Progress */}
          {!isEarned && (
            <div className="mb-4">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-sm text-slate-400 mt-2">
                {progress?.current || 0} / {progress?.target || 0}
              </div>
            </div>
          )}

          {/* Earned date */}
          {isEarned && progress?.earnedAt && (
            <div className="text-sm text-slate-500 mb-4">
              {t('profile.earnedOn', { date: formatDate(progress.earnedAt.split('T')[0], t) })}
            </div>
          )}

          <button onClick={onClose} className="btn-ghost w-full">
            {t('common.close')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper functions
function formatDate(dateStr: string, t: (key: string) => string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) return t('common.today');
  if (dateStr === yesterday.toISOString().split('T')[0]) return t('common.yesterday');

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatGameName(gameId: string): string {
  return gameId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
