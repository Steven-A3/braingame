import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import type { Quest } from '../types';
import { DIFFICULTY_COLORS } from '../types';
import { useFeedback } from '@/hooks/useFeedback';
import { getQuestTranslationKey, getQuestDescriptionKey, extractCategoryFromTitle } from '../questTranslations';

interface QuestCardProps {
  quest: Quest;
  onClaim?: () => void;
  compact?: boolean;
}

export function QuestCard({ quest, onClaim, compact = false }: QuestCardProps) {
  const { t } = useTranslation();
  const feedback = useFeedback();
  const progress = Math.min(quest.progress / quest.target, 1);
  const isClaimable = quest.completed && !quest.claimed;

  // Translate quest title
  const titleKey = getQuestTranslationKey(quest.title);
  const categoryFromTitle = extractCategoryFromTitle(quest.title);
  const categoryKey = quest.requirement.category || categoryFromTitle;
  const categoryName = categoryKey ? t(`games.categories.${categoryKey}`) : '';
  const translatedTitle = titleKey ? t(titleKey, { category: categoryName }) : quest.title;

  // Translate quest description
  const descKey = getQuestDescriptionKey(quest.requirement.type, quest.target);
  const translatedDescription = descKey
    ? t(descKey, { target: quest.target, category: categoryName })
    : quest.description;

  // Translate difficulty
  const translatedDifficulty = t(`quests.difficulty.${quest.difficulty}`);

  const handleClaim = () => {
    if (isClaimable && onClaim) {
      feedback.achievement();
      onClaim();
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={clsx(
          'flex items-center gap-3 p-3 rounded-xl bg-slate-800/50',
          isClaimable && 'ring-2 ring-yellow-500/50 bg-yellow-500/10'
        )}
      >
        <span className="text-2xl">{quest.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{translatedTitle}</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={clsx(
                  'h-full rounded-full',
                  quest.completed ? 'bg-green-500' : 'bg-primary-500'
                )}
              />
            </div>
            <span className="text-xs text-slate-400">
              {quest.progress}/{quest.target}
            </span>
          </div>
        </div>
        {isClaimable && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleClaim}
            className="px-3 py-1.5 bg-yellow-500 text-black text-xs font-bold rounded-lg"
          >
            {t('quests.claim')}
          </motion.button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={clsx(
        'relative p-4 rounded-2xl bg-slate-800/80 border border-slate-700/50 overflow-hidden',
        isClaimable && 'ring-2 ring-yellow-500 bg-gradient-to-br from-yellow-500/10 to-orange-500/10'
      )}
    >
      {/* Difficulty indicator */}
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-10"
        style={{
          background: `radial-gradient(circle at top right, ${DIFFICULTY_COLORS[quest.difficulty]}, transparent)`,
        }}
      />

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="text-4xl">{quest.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and difficulty badge */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{translatedTitle}</h3>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${DIFFICULTY_COLORS[quest.difficulty]}20`,
                color: DIFFICULTY_COLORS[quest.difficulty],
              }}
            >
              {translatedDifficulty}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400 mb-3">{translatedDescription}</p>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{t('quests.progress')}</span>
              <span className={quest.completed ? 'text-green-400' : 'text-slate-300'}>
                {quest.progress}/{quest.target}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={clsx(
                  'h-full rounded-full transition-colors',
                  quest.completed
                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                    : 'bg-gradient-to-r from-primary-500 to-primary-400'
                )}
              />
            </div>
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">🪙</span>
              <span className="text-sm font-medium">{quest.reward.coins}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-purple-400">⭐</span>
              <span className="text-sm font-medium">{quest.reward.xp} XP</span>
            </div>
            {quest.reward.gems && (
              <div className="flex items-center gap-1">
                <span className="text-cyan-400">💎</span>
                <span className="text-sm font-medium">{quest.reward.gems}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claim button */}
      {isClaimable && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClaim}
          className="w-full mt-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl shadow-lg shadow-yellow-500/25"
        >
          ✨ {t('quests.claimReward')}
        </motion.button>
      )}

      {/* Completed checkmark */}
      {quest.claimed && (
        <div className="absolute top-3 right-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
          >
            <span className="text-white text-lg">✓</span>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
