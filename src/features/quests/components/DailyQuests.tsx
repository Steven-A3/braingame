import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuestStore } from '../questStore';
import { useUserStore } from '@/stores/userStore';
import { QuestCard } from './QuestCard';
import { formatTimeUntilReset } from '../questGenerator';
import { useFeedback } from '@/hooks/useFeedback';

interface DailyQuestsProps {
  compact?: boolean;
  maxDisplay?: number;
}

export function DailyQuests({ compact = false, maxDisplay = 3 }: DailyQuestsProps) {
  const { quests, initializeQuests, claimReward, claimAllRewards, getTotalRewards } = useQuestStore();
  const { currency, getLevel } = useUserStore();
  const [timeLeft, setTimeLeft] = useState(formatTimeUntilReset());
  const feedback = useFeedback();

  const levelInfo = getLevel();
  const totalRewards = getTotalRewards();
  const hasUnclaimedRewards = totalRewards.coins > 0 || totalRewards.xp > 0;

  // Initialize quests on mount
  useEffect(() => {
    initializeQuests();
  }, [initializeQuests]);

  // Update timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeUntilReset());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sort quests: unclaimed completed first, then by difficulty
  const sortedQuests = [...quests].sort((a, b) => {
    // Unclaimed completed first
    if (a.completed && !a.claimed && !(b.completed && !b.claimed)) return -1;
    if (b.completed && !b.claimed && !(a.completed && !a.claimed)) return 1;
    // Then incomplete
    if (!a.completed && b.completed) return -1;
    if (!b.completed && a.completed) return 1;
    return 0;
  });

  const displayQuests = compact ? sortedQuests.slice(0, maxDisplay) : sortedQuests;
  const completedCount = quests.filter((q) => q.completed).length;
  const claimedCount = quests.filter((q) => q.claimed).length;

  const handleClaimAll = () => {
    feedback.achievement();
    claimAllRewards();
  };

  if (compact) {
    return (
      <div className="card">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="font-semibold">Daily Quests</h3>
              <p className="text-xs text-slate-400">
                {completedCount}/{quests.length} completed • Resets in {timeLeft}
              </p>
            </div>
          </div>
          {hasUnclaimedRewards && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClaimAll}
              className="px-3 py-1.5 bg-yellow-500 text-black text-xs font-bold rounded-lg"
            >
              Claim All
            </motion.button>
          )}
        </div>

        {/* Quest list */}
        <div className="space-y-2">
          {displayQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              compact
              onClaim={() => claimReward(quest.id)}
            />
          ))}
        </div>

        {/* View all link */}
        {quests.length > maxDisplay && (
          <Link
            to="/quests"
            className="block text-center text-sm text-primary-400 hover:text-primary-300 mt-3 pt-3 border-t border-slate-700/50"
          >
            View all {quests.length} quests →
          </Link>
        )}
      </div>
    );
  }

  // Full page view
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="p-4 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Daily Quests</h1>
              <p className="text-sm text-slate-400">
                Resets in {timeLeft}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Level {levelInfo.level}</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-yellow-400">🪙 {currency.coins}</span>
                <span className="text-cyan-400">💎 {currency.gems}</span>
              </div>
            </div>
          </div>

          {/* XP Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">XP Progress</span>
              <span className="text-purple-400">
                {levelInfo.currentXP}/{levelInfo.requiredXP}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(levelInfo.currentXP / levelInfo.requiredXP) * 100}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </div>

          {/* Progress summary */}
          <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '0 126' }}
                    animate={{
                      strokeDasharray: `${(completedCount / quests.length) * 126} 126`,
                    }}
                    transition={{ duration: 0.8 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{completedCount}/{quests.length}</span>
                </div>
              </div>
              <div>
                <div className="font-medium">Quest Progress</div>
                <div className="text-sm text-slate-400">
                  {claimedCount} rewards claimed
                </div>
              </div>
            </div>

            {hasUnclaimedRewards && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleClaimAll}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl text-sm"
              >
                Claim All
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Quest list */}
      <div className="p-4 max-w-lg mx-auto space-y-4">
        <AnimatePresence mode="popLayout">
          {sortedQuests.map((quest, index) => (
            <motion.div
              key={quest.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <QuestCard
                quest={quest}
                onClaim={() => claimReward(quest.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {quests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">No Quests Available</h3>
            <p className="text-slate-400">Check back tomorrow for new quests!</p>
          </div>
        )}
      </div>
    </div>
  );
}
