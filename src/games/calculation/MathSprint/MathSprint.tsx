import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { MathSprintEngine } from './MathSprintEngine';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';
import { GameHeader } from '@/components/game/GameHeader';

interface MathSprintProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
}

export function MathSprint({ config, onComplete, onExit }: MathSprintProps) {
  const engineRef = useRef<MathSprintEngine | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [problem, setProblem] = useState<ReturnType<MathSprintEngine['getCurrentProblem']>>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [progress, setProgress] = useState({ current: 1, total: 5 });

  // Initialize engine
  useEffect(() => {
    const engine = new MathSprintEngine(config);
    engineRef.current = engine;

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        if (engineRef.current) {
          setProblem(engineRef.current.getCurrentProblem());
          setProgress(engineRef.current.getProblemProgress());
          setInputValue('');
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
        setInputValue('');
        setTimeout(() => setFeedback(null), 300);
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState?.status, problem]);

  const handleNumberPress = useCallback((num: string) => {
    if (inputValue.length < 5) {
      setInputValue((prev) => prev + num);
    }
  }, [inputValue]);

  const handleBackspace = useCallback(() => {
    setInputValue((prev) => prev.slice(0, -1));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!engineRef.current || !problem || !inputValue) return;

    const answer = parseInt(inputValue, 10);
    const isCorrect = answer === problem.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    engineRef.current.handleInput(answer);

    setTimeout(() => setFeedback(null), 300);
  }, [problem, inputValue]);

  if (!gameState || !problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const timeLimit = engineRef.current?.getTimeLimit() || 10000;
  const timePercentage = (timeRemaining / timeLimit) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Math Sprint"
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onExit}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Timer bar */}
        <div className="w-full max-w-sm h-2 bg-slate-700 rounded-full mb-8 overflow-hidden">
          <motion.div
            className={clsx(
              'h-full rounded-full transition-colors',
              timePercentage > 50 ? 'bg-green-500' : timePercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${timePercentage}%` }}
          />
        </div>

        {/* Problem display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={problem.displayString}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-4xl font-bold mb-8 text-center"
          >
            {problem.num1} {problem.operation} {problem.num2} = ?
          </motion.div>
        </AnimatePresence>

        {/* Answer input display */}
        <div
          className={clsx(
            'w-full max-w-sm h-16 bg-slate-800 rounded-xl mb-6 flex items-center justify-center',
            'text-3xl font-bold border-2 transition-colors',
            feedback === 'correct' && 'border-green-500 bg-green-500/10',
            feedback === 'wrong' && 'border-red-500 bg-red-500/10',
            !feedback && 'border-slate-600'
          )}
        >
          {inputValue || <span className="text-slate-500">?</span>}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              onClick={() => handleNumberPress(String(num))}
              className="h-14 rounded-xl bg-slate-700 hover:bg-slate-600 text-xl font-semibold"
              whileTap={{ scale: 0.95 }}
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            onClick={handleBackspace}
            className="h-14 rounded-xl bg-slate-700 hover:bg-slate-600 text-xl"
            whileTap={{ scale: 0.95 }}
          >
            ⌫
          </motion.button>
          <motion.button
            onClick={() => handleNumberPress('0')}
            className="h-14 rounded-xl bg-slate-700 hover:bg-slate-600 text-xl font-semibold"
            whileTap={{ scale: 0.95 }}
          >
            0
          </motion.button>
          <motion.button
            onClick={handleSubmit}
            disabled={!inputValue}
            className={clsx(
              'h-14 rounded-xl text-xl font-semibold',
              inputValue ? 'bg-primary-500 hover:bg-primary-600' : 'bg-slate-600 cursor-not-allowed'
            )}
            whileTap={inputValue ? { scale: 0.95 } : {}}
          >
            ✓
          </motion.button>
        </div>

        {/* Progress */}
        <div className="mt-6 text-slate-400 text-sm">
          Problem {progress.current} of {progress.total}
        </div>
      </div>
    </div>
  );
}
