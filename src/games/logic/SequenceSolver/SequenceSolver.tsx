import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { SequenceSolverEngine, SequenceSolverState } from './SequenceSolverEngine';
import { GameHeader } from '@/components/game/GameHeader';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface SequenceSolverProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

export function SequenceSolver({ config, onComplete, onQuit }: SequenceSolverProps) {
  const engineRef = useRef<SequenceSolverEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [solverState, setSolverState] = useState<SequenceSolverState | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const engine = new SequenceSolverEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setSolverState(engine.getGameState());
      },
      onComplete: (result) => {
        engine.cleanup();
        onComplete(result);
      },
    });

    engineRef.current = engine;

    engine.init().then(() => {
      setIsReady(true);
      setGameState(engine.getState());
      setSolverState(engine.getGameState());
    });

    return () => {
      engine.cleanup();
    };
  }, [config, onComplete]);

  const handleStart = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const handleOptionClick = useCallback((option: string) => {
    engineRef.current?.handleInput(option);
  }, []);

  if (!isReady || !gameState || !solverState) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (gameState.status === 'ready') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <GameHeader
          title="Sequence Solver"
          level={gameState.level}
          maxLevel={gameState.maxLevel}
          score={gameState.score}
          lives={gameState.lives}
          maxLives={gameState.maxLives}
          onExit={onQuit}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🔢</div>
            <h2 className="text-2xl font-bold mb-2">Sequence Solver</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Find the pattern and predict the next number in the sequence!
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">Level {gameState.level}</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• {solverState.totalTime}s per puzzle</li>
                <li>• {solverState.roundsInLevel} rounds</li>
                <li>• Find arithmetic, geometric, and special patterns</li>
              </ul>
            </div>

            <button onClick={handleStart} className="btn-primary w-full">
              Start Level {gameState.level}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const timerPercent = (solverState.timeRemaining / solverState.totalTime) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Sequence Solver"
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onQuit}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Timer */}
        <div className="w-full max-w-sm mb-4">
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Round {solverState.roundsCompleted + 1}/{solverState.roundsInLevel}</span>
            <span>{solverState.timeRemaining.toFixed(1)}s</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-colors ${
                timerPercent > 50 ? 'bg-primary-500' : timerPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        {solverState.streak > 1 && !solverState.feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-bold"
          >
            🔥 {solverState.streak} streak!
          </motion.div>
        )}

        {/* Sequence display */}
        <div className="mb-8">
          <div className="text-sm text-slate-400 mb-4 text-center">Find the next number:</div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {solverState.sequence.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`w-14 h-14 flex items-center justify-center rounded-xl text-xl font-bold ${
                  item.isHidden
                    ? 'bg-primary-500/20 border-2 border-primary-500 border-dashed text-primary-400'
                    : 'bg-slate-700'
                }`}
              >
                {item.isHidden ? '?' : item.value}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {solverState.options.map((option, index) => {
            const isCorrect = option === solverState.correctOption;
            const showCorrect = solverState.feedback && isCorrect;
            const showWrong = solverState.feedback === 'wrong' && !isCorrect;

            return (
              <motion.button
                key={option}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOptionClick(option)}
                disabled={!!solverState.feedback}
                className={`py-4 px-6 rounded-xl text-2xl font-bold transition-all ${
                  showCorrect
                    ? 'bg-green-500 text-white'
                    : showWrong
                    ? 'bg-slate-800 text-slate-500'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {option}
              </motion.button>
            );
          })}
        </div>

        {/* Feedback */}
        {solverState.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <div className={`text-xl font-bold ${
              solverState.feedback === 'correct' ? 'text-green-400' : 'text-red-400'
            }`}>
              {solverState.feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              Pattern: {solverState.patternType}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
