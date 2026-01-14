import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ColorStroopEngine } from './ColorStroopEngine';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';
import { GameHeader } from '@/components/game/GameHeader';

interface ColorStroopProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
}

export function ColorStroop({ config, onComplete, onExit }: ColorStroopProps) {
  const engineRef = useRef<ColorStroopEngine | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [challenge, setChallenge] = useState<ReturnType<ColorStroopEngine['getCurrentChallenge']>>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [progress, setProgress] = useState({ current: 1, total: 5 });

  // Initialize engine
  useEffect(() => {
    const engine = new ColorStroopEngine(config);
    engineRef.current = engine;

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        if (engineRef.current) {
          setChallenge(engineRef.current.getCurrentChallenge());
          setProgress(engineRef.current.getChallengeProgress());
        }
      },
      onComplete: (result) => onComplete(result),
    });

    engine.init().then(() => {
      engine.start();
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      engineRef.current = null;
    };
  }, [config, onComplete]);

  // Timer effect
  useEffect(() => {
    if (!engineRef.current || gameState?.status !== 'playing') return;

    timerRef.current = setInterval(() => {
      const remaining = engineRef.current?.getTimeRemaining() || 0;
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        engineRef.current?.handleTimeout();
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 300);
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState?.status, challenge]);

  const handleAnswer = useCallback((answer: string) => {
    if (!engineRef.current || !challenge) return;

    const isCorrect = answer === challenge.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    engineRef.current.handleInput(answer);

    setTimeout(() => setFeedback(null), 300);
  }, [challenge]);

  if (!gameState || !challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const timeLimit = engineRef.current?.getTimeLimit() || 5000;
  const timePercentage = (timeRemaining / timeLimit) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Color Stroop"
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onExit}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Instructions */}
        <div className="mb-4 text-slate-400 text-sm text-center">
          What COLOR is this word displayed in?
        </div>

        {/* Timer bar */}
        <div className="w-full max-w-sm h-2 bg-slate-700 rounded-full mb-8 overflow-hidden">
          <motion.div
            className={clsx(
              'h-full rounded-full',
              timePercentage > 50 ? 'bg-green-500' : timePercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${timePercentage}%` }}
          />
        </div>

        {/* Challenge word */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${challenge.word}-${challenge.displayColor}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={clsx(
              'text-6xl font-bold mb-12 transition-transform',
              feedback === 'correct' && 'scale-110',
              feedback === 'wrong' && 'shake'
            )}
            style={{ color: challenge.displayColor }}
          >
            {challenge.word}
          </motion.div>
        </AnimatePresence>

        {/* Feedback overlay */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={clsx(
              'absolute inset-0 pointer-events-none flex items-center justify-center',
              feedback === 'correct' ? 'bg-green-500/10' : 'bg-red-500/10'
            )}
          />
        )}

        {/* Answer options */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {challenge.options.map((option) => (
            <motion.button
              key={option}
              onClick={() => handleAnswer(option)}
              className={clsx(
                'py-4 px-6 rounded-xl font-semibold text-lg',
                'bg-slate-700 hover:bg-slate-600 active:scale-95',
                'transition-all duration-150'
              )}
              whileTap={{ scale: 0.95 }}
            >
              {option}
            </motion.button>
          ))}
        </div>

        {/* Progress */}
        <div className="mt-8 text-slate-400 text-sm">
          Challenge {progress.current} of {progress.total}
        </div>
      </div>

      <style>{`
        .shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}
