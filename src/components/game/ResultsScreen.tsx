import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import type { GameResult, GameInfo } from '@/games/core/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/games/core/types';
import { calculateStars } from '@/games/core/DifficultySystem';
import { useUserStore } from '@/stores/userStore';
import {
  generateShareText,
  canShare,
  shareResult,
  copyToClipboard,
} from '@/services/share';
import { Confetti, EmojiBurst } from '@/components/ui/Confetti';
import { useFeedback } from '@/hooks/useFeedback';

interface ResultsScreenProps {
  result: GameResult;
  gameInfo: GameInfo;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function ResultsScreen({ result, gameInfo, onPlayAgain, onGoHome }: ResultsScreenProps) {
  const { stats, markShared, gameHistory } = useUserStore();
  const [showCopied, setShowCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const feedback = useFeedback();

  // Check if this is a personal best
  const isPersonalBest = useMemo(() => {
    const previousBest = gameHistory
      .filter((r) => r.gameId === result.gameId)
      .reduce((max, r) => Math.max(max, r.score), 0);
    return result.score > previousBest && previousBest > 0;
  }, [gameHistory, result.gameId, result.score]);

  // Check if perfect game
  const isPerfect = result.accuracy >= 0.95 && result.levelsCompleted === result.maxLevel;

  // Calculate stars (estimate max score based on levels)
  const maxPossibleScore = result.maxLevel * 200; // Rough estimate
  const stars = calculateStars(result.score, maxPossibleScore);

  // Format duration
  const minutes = Math.floor(result.duration / 60000);
  const seconds = Math.floor((result.duration % 60000) / 1000);
  const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  // Generate share text
  const shareText = generateShareText(result, stats.currentStreak);

  // Trigger celebrations on mount
  useEffect(() => {
    // Animate score counting up
    const duration = 1000;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.floor(result.score * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();

    // Trigger sound and celebration based on performance
    if (isPerfect || isPersonalBest) {
      setShowConfetti(true);
      setShowEmoji(true);
      feedback.achievement();
    } else if (result.levelsCompleted === result.maxLevel) {
      setShowConfetti(true);
      feedback.complete();
    } else {
      feedback.complete();
    }

    // Auto-dismiss confetti
    const timeout = setTimeout(() => {
      setShowConfetti(false);
      setShowEmoji(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isPerfect, isPersonalBest, result.levelsCompleted, result.maxLevel, result.score, feedback]);

  const handleShare = async () => {
    feedback.tap();
    // Mark that user has shared (for badge tracking)
    markShared();

    if (canShare()) {
      const shared = await shareResult({
        title: 'Daily Brain',
        text: shareText,
      });

      if (!shared) {
        // Fallback to clipboard if share was cancelled
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(shareText);
    if (success) {
      setShowCopied(true);
      feedback.correct();
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handlePlayAgainClick = () => {
    feedback.tap();
    onPlayAgain();
  };

  const handleGoHomeClick = () => {
    feedback.tap();
    onGoHome();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      {/* Celebrations */}
      <Confetti active={showConfetti} count={isPerfect ? 100 : 60} />
      <EmojiBurst active={showEmoji} emoji={isPerfect ? '🏆' : '🎉'} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-4"
          >
            {isPerfect ? '🏆' : result.levelsCompleted === result.maxLevel ? '🎉' : '👏'}
          </motion.div>
          <h1 className="text-2xl font-bold mb-1">
            {isPerfect ? 'Perfect!' : result.levelsCompleted === result.maxLevel ? 'Challenge Complete!' : 'Good Effort!'}
          </h1>
          <p className="text-slate-400">
            {gameInfo.name}
          </p>

          {/* Personal Best indicator */}
          {isPersonalBest && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2"
            >
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                ⭐ New Personal Best!
              </span>
            </motion.div>
          )}
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.span
              key={star}
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{
                opacity: 1,
                scale: star <= stars ? [0, 1.3, 1] : 1,
                rotate: 0
              }}
              transition={{
                delay: 0.3 + star * 0.1,
                duration: 0.4,
                type: star <= stars ? 'spring' : 'tween'
              }}
              className={clsx(
                'text-3xl',
                star <= stars ? 'opacity-100' : 'opacity-30'
              )}
            >
              ⭐
            </motion.span>
          ))}
        </div>

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card mb-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <motion.div
                className={clsx(
                  "text-3xl font-bold",
                  isPersonalBest
                    ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent"
                    : "text-primary-400"
                )}
              >
                {animatedScore.toLocaleString()}
              </motion.div>
              <div className="text-sm text-slate-400">Score</div>
            </div>
            <div className="text-center">
              <div className={clsx(
                "text-3xl font-bold",
                result.accuracy >= 0.9 ? "text-green-400" :
                result.accuracy >= 0.7 ? "text-yellow-400" : "text-orange-400"
              )}>
                {Math.round(result.accuracy * 100)}%
              </div>
              <div className="text-sm text-slate-400">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">
                {result.levelsCompleted}/{result.maxLevel}
              </div>
              <div className="text-sm text-slate-400">Levels</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{durationStr}</div>
              <div className="text-sm text-slate-400">Time</div>
            </div>
          </div>
        </motion.div>

        {/* Streak update */}
        {stats.currentStreak > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: 'spring' }}
            className="text-center mb-6"
          >
            <motion.span
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: stats.currentStreak >= 7 ? 2 : 0
              }}
              className="text-2xl mr-2"
            >
              🔥
            </motion.span>
            <span className="text-lg font-semibold">{stats.currentStreak} day streak!</span>
          </motion.div>
        )}

        {/* Category badge */}
        <div className="flex justify-center mb-6">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${CATEGORY_COLORS[result.category]}20`,
              color: CATEGORY_COLORS[result.category],
            }}
          >
            {CATEGORY_ICONS[result.category]} {result.category} +{result.score}
          </motion.span>
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-3"
        >
          <button onClick={handleShare} className="btn-secondary w-full relative">
            <AnimatePresence mode="wait">
              {showCopied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  ✓ Copied to Clipboard!
                </motion.span>
              ) : (
                <motion.span
                  key="share"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  📤 Share Results
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handlePlayAgainClick} className="btn-primary">
              Play Again
            </button>
            <button onClick={handleGoHomeClick} className="btn-ghost">
              Home
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
