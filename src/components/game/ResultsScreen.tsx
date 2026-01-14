import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { GameResult, GameInfo } from '@/games/core/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/games/core/types';
import { calculateStars } from '@/games/core/DifficultySystem';
import { useUserStore } from '@/stores/userStore';

interface ResultsScreenProps {
  result: GameResult;
  gameInfo: GameInfo;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export function ResultsScreen({ result, gameInfo, onPlayAgain, onGoHome }: ResultsScreenProps) {
  const { stats } = useUserStore();

  // Calculate stars (estimate max score based on levels)
  const maxPossibleScore = result.maxLevel * 200; // Rough estimate
  const stars = calculateStars(result.score, maxPossibleScore);

  // Format duration
  const minutes = Math.floor(result.duration / 60000);
  const seconds = Math.floor((result.duration % 60000) / 1000);
  const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  // Generate share text
  const shareText = generateShareText(result, gameInfo, stars);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Brain',
          text: shareText,
        });
      } catch (e) {
        // User cancelled or error
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
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
            {result.levelsCompleted === result.maxLevel ? '🎉' : '👏'}
          </motion.div>
          <h1 className="text-2xl font-bold mb-1">
            {result.levelsCompleted === result.maxLevel ? 'Challenge Complete!' : 'Good Effort!'}
          </h1>
          <p className="text-slate-400">
            {gameInfo.name}
          </p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.span
              key={star}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + star * 0.1 }}
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
              <div className="text-3xl font-bold text-primary-400">
                {result.score.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mb-6"
          >
            <span className="text-2xl mr-2">🔥</span>
            <span className="text-lg font-semibold">{stats.currentStreak} day streak!</span>
          </motion.div>
        )}

        {/* Category badge */}
        <div className="flex justify-center mb-6">
          <span
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${CATEGORY_COLORS[result.category]}20`,
              color: CATEGORY_COLORS[result.category],
            }}
          >
            {CATEGORY_ICONS[result.category]} {result.category} +{result.score}
          </span>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button onClick={handleShare} className="btn-secondary w-full">
            📤 Share Results
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={onPlayAgain} className="btn-primary">
              Play Again
            </button>
            <button onClick={onGoHome} className="btn-ghost">
              Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function generateShareText(result: GameResult, gameInfo: GameInfo, stars: number): string {
  const starEmojis = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  const accuracyEmoji = result.accuracy >= 0.9 ? '🎯' : result.accuracy >= 0.7 ? '✅' : '💪';

  return `Daily Brain - ${gameInfo.name}
${result.date}

${starEmojis}
Score: ${result.score.toLocaleString()}
${accuracyEmoji} ${Math.round(result.accuracy * 100)}% accuracy

Play at dailybrain.app`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    // Could show a toast notification here
    alert('Copied to clipboard!');
  });
}
