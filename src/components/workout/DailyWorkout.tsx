import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { GAMES, getGameInfo } from '@/games/registry';
import { getGameSeed } from '@/games/core/SeededRNG';
import { Confetti, EmojiBurst } from '@/components/ui/Confetti';
import { useFeedback } from '@/hooks/useFeedback';
import type { GameCategory } from '@/games/core/types';

const WORKOUT_SIZE = 5;

// Select one game from each category, prioritizing variety
function generateWorkoutGames(seed: number): string[] {
  const categories: GameCategory[] = ['memory', 'logic', 'focus', 'calculation', 'language', 'speed'];
  const selectedGames: string[] = [];

  // Use seed for deterministic selection
  const rng = {
    seed,
    next() {
      this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
      return this.seed / 0x7fffffff;
    },
  };

  // Shuffle categories
  const shuffledCategories = [...categories].sort(() => rng.next() - 0.5);

  // Select one game from each category until we have WORKOUT_SIZE
  for (const category of shuffledCategories) {
    if (selectedGames.length >= WORKOUT_SIZE) break;

    const categoryGames = GAMES.filter((g) => g.category === category);
    if (categoryGames.length > 0) {
      const randomIndex = Math.floor(rng.next() * categoryGames.length);
      selectedGames.push(categoryGames[randomIndex].id);
    }
  }

  return selectedGames;
}

export function DailyWorkout() {
  const navigate = useNavigate();
  const feedback = useFeedback();
  const {
    dailyWorkoutGames,
    dailyWorkoutProgress,
    dailyWorkoutCompleted,
    startDailyWorkout,
    stats,
  } = useUserStore();

  const [showConfetti, setShowConfetti] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const [showIntro, setShowIntro] = useState(true);

  // Generate today's workout
  const todaysSeed = useMemo(() => {
    const today = new Date();
    return getGameSeed('daily-workout', today);
  }, []);

  const workoutGames = useMemo(() => {
    if (dailyWorkoutGames.length > 0) {
      return dailyWorkoutGames;
    }
    return generateWorkoutGames(todaysSeed);
  }, [todaysSeed, dailyWorkoutGames]);

  // Start workout if not already started
  useEffect(() => {
    if (dailyWorkoutGames.length === 0) {
      startDailyWorkout(workoutGames);
    }
  }, [dailyWorkoutGames, workoutGames, startDailyWorkout]);

  const handleStartWorkout = () => {
    feedback.tap();
    setShowIntro(false);
  };

  const handlePlayGame = (gameId: string) => {
    feedback.tap();
    navigate(`/play/${gameId}?workout=true`);
  };

  const handleGoHome = () => {
    feedback.tap();
    navigate('/');
  };

  // Intro screen
  if (showIntro && !dailyWorkoutCompleted && dailyWorkoutProgress === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <div className="p-4">
          <button
            onClick={handleGoHome}
            className="text-slate-400 hover:text-white"
          >
            ← Back
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-sm"
          >
            <div className="text-7xl mb-4">🏋️</div>
            <h1 className="text-2xl font-bold mb-2">Daily Workout</h1>
            <p className="text-slate-400 mb-6">
              Complete 5 curated games to train all areas of your brain!
            </p>

            <div className="card mb-6">
              <h3 className="font-semibold mb-3">Today's Games:</h3>
              <div className="space-y-2">
                {workoutGames.map((gameId) => {
                  const game = getGameInfo(gameId);
                  return (
                    <div
                      key={gameId}
                      className="flex items-center gap-3 text-left"
                    >
                      <span className="text-2xl">{game?.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{game?.name}</div>
                        <div className="text-xs text-slate-500 capitalize">
                          {game?.category}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={handleStartWorkout} className="btn-primary w-full">
              Start Workout
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Trigger celebration on workout completion
  useEffect(() => {
    if (dailyWorkoutCompleted) {
      setShowConfetti(true);
      setShowEmoji(true);
      feedback.achievement();
      const timer = setTimeout(() => {
        setShowConfetti(false);
        setShowEmoji(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [dailyWorkoutCompleted, feedback]);

  // Completion screen
  if (dailyWorkoutCompleted) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <Confetti active={showConfetti} count={80} />
        <EmojiBurst active={showEmoji} emoji="💪" count={10} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-8xl mb-4"
          >
            🏆
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">Workout Complete!</h1>
          <p className="text-slate-400 mb-6">
            Great job! You've completed today's brain workout.
          </p>

          <div className="card mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="text-3xl font-bold text-primary-400"
                >
                  {stats.currentStreak}
                </motion.div>
                <div className="text-xs text-slate-400">Day Streak</div>
              </div>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="text-3xl font-bold text-primary-400"
                >
                  {stats.totalGamesPlayed}
                </motion.div>
                <div className="text-xs text-slate-400">Total Games</div>
              </div>
            </div>
          </div>

          <button onClick={() => { feedback.tap(); handleGoHome(); }} className="btn-primary w-full">
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  // Workout progress screen
  const currentGameId = workoutGames[dailyWorkoutProgress];
  const currentGame = getGameInfo(currentGameId);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={handleGoHome}
          className="text-slate-400 hover:text-white"
        >
          ← Back
        </button>
        <div className="text-sm text-slate-400">
          {dailyWorkoutProgress + 1} of {WORKOUT_SIZE}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-6">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500"
            initial={{ width: 0 }}
            animate={{
              width: `${(dailyWorkoutProgress / WORKOUT_SIZE) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Game cards */}
        <div className="w-full max-w-sm space-y-3 mb-8">
          {workoutGames.map((gameId, idx) => {
            const game = getGameInfo(gameId);
            const isCompleted = idx < dailyWorkoutProgress;
            const isCurrent = idx === dailyWorkoutProgress;

            return (
              <motion.div
                key={gameId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isCompleted
                    ? 'bg-green-500/20 border border-green-500/50'
                    : isCurrent
                    ? 'bg-primary-500/20 border-2 border-primary-500'
                    : 'bg-slate-800 opacity-50'
                }`}
              >
                <div className="text-3xl">
                  {isCompleted ? '✓' : game?.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{game?.name}</div>
                  <div className="text-sm text-slate-400 capitalize">
                    {game?.category}
                  </div>
                </div>
                {isCurrent && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-primary-400 text-sm font-bold"
                  >
                    NEXT
                  </motion.div>
                )}
                {isCompleted && (
                  <div className="text-green-400 text-sm">Done!</div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Play button */}
        <AnimatePresence mode="wait">
          {currentGame && (
            <motion.button
              key={currentGameId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={() => handlePlayGame(currentGameId)}
              className="btn-primary w-full max-w-sm"
            >
              Play {currentGame.name}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
