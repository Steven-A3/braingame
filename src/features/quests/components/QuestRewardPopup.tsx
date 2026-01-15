import { motion, AnimatePresence } from 'framer-motion';
import type { Quest } from '../types';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../types';
import { useFeedback } from '@/hooks/useFeedback';
import { useEffect } from 'react';

interface QuestRewardPopupProps {
  quest: Quest | null;
  onClaim: () => void;
  onClose: () => void;
}

export function QuestRewardPopup({ quest, onClaim, onClose }: QuestRewardPopupProps) {
  const feedback = useFeedback();

  useEffect(() => {
    if (quest) {
      feedback.achievement();
    }
  }, [quest, feedback]);

  const handleClaim = () => {
    feedback.tap();
    onClaim();
  };

  return (
    <AnimatePresence>
      {quest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={onClose}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 50,
                  rotate: 0,
                }}
                animate={{
                  y: -50,
                  rotate: 360,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                }}
                className="absolute text-2xl"
              >
                {['⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div
              className="absolute -inset-1 rounded-3xl opacity-30 blur-xl"
              style={{
                background: `linear-gradient(to bottom right, ${DIFFICULTY_COLORS[quest.difficulty]}, transparent)`,
              }}
            />

            <div className="relative">
              {/* Quest completed banner */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
              >
                <span
                  className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${DIFFICULTY_COLORS[quest.difficulty]}30`,
                    color: DIFFICULTY_COLORS[quest.difficulty],
                  }}
                >
                  {DIFFICULTY_LABELS[quest.difficulty]} Quest Complete!
                </span>
              </motion.div>

              {/* Icon with animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center mb-4"
              >
                <span className="text-7xl">{quest.icon}</span>
              </motion.div>

              {/* Quest title */}
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-center mb-2"
              >
                {quest.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-slate-400 text-center mb-6"
              >
                {quest.description}
              </motion.p>

              {/* Rewards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-800/50 rounded-2xl p-4 mb-6"
              >
                <div className="text-xs text-slate-400 text-center mb-3 uppercase tracking-wider">
                  Your Rewards
                </div>
                <div className="flex items-center justify-center gap-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: 'spring' }}
                    className="text-center"
                  >
                    <div className="text-3xl mb-1">🪙</div>
                    <div className="text-xl font-bold text-yellow-400">
                      +{quest.reward.coins}
                    </div>
                    <div className="text-xs text-slate-400">Coins</div>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring' }}
                    className="text-center"
                  >
                    <div className="text-3xl mb-1">⭐</div>
                    <div className="text-xl font-bold text-purple-400">
                      +{quest.reward.xp}
                    </div>
                    <div className="text-xs text-slate-400">XP</div>
                  </motion.div>

                  {quest.reward.gems && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9, type: 'spring' }}
                      className="text-center"
                    >
                      <div className="text-3xl mb-1">💎</div>
                      <div className="text-xl font-bold text-cyan-400">
                        +{quest.reward.gems}
                      </div>
                      <div className="text-xs text-slate-400">Gems</div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Claim button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClaim}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 text-black font-bold text-lg rounded-2xl shadow-lg shadow-yellow-500/30 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                />
                <span className="relative">✨ Claim Reward</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
