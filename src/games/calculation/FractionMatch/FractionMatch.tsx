import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FractionMatchEngine, FractionMatchState } from './FractionMatchEngine';
import { GameHeader } from '@/components/game/GameHeader';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface FractionMatchProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

export function FractionMatch({ config, onComplete, onQuit }: FractionMatchProps) {
  const engineRef = useRef<FractionMatchEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [matchState, setMatchState] = useState<FractionMatchState | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const engine = new FractionMatchEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setMatchState(engine.getGameState());
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
      setMatchState(engine.getGameState());
    });

    return () => {
      engine.cleanup();
    };
  }, [config, onComplete]);

  const handleStart = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const handleOptionClick = useCallback((optionId: number) => {
    engineRef.current?.handleInput(optionId);
  }, []);

  if (!isReady || !gameState || !matchState) {
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
          title="Fraction Match"
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
            <div className="text-6xl mb-4">⚖️</div>
            <h2 className="text-2xl font-bold mb-2">Fraction Match</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Match equivalent values! Find the fraction, decimal, or percentage that equals the shown value.
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">Level {gameState.level}</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• {matchState.totalTime}s per question</li>
                <li>• {matchState.roundsInLevel} rounds</li>
                <li>• Convert between fractions, decimals, and percentages</li>
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

  const timerPercent = (matchState.timeRemaining / matchState.totalTime) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Fraction Match"
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
            <span>Round {matchState.roundsCompleted + 1}/{matchState.roundsInLevel}</span>
            <span>{matchState.timeRemaining.toFixed(1)}s</span>
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
        {matchState.streak > 1 && !matchState.feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-bold"
          >
            🔥 {matchState.streak} streak!
          </motion.div>
        )}

        {/* Source value */}
        <div className="mb-8">
          <div className="text-sm text-slate-400 mb-2 text-center">Find the equivalent of:</div>
          <motion.div
            key={matchState.sourceValue.display}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-2xl px-10 py-6 border-2 border-primary-500"
          >
            <div className="text-4xl font-bold text-center">{matchState.sourceValue.display}</div>
            <div className="text-sm text-slate-400 text-center mt-2 capitalize">
              ({matchState.sourceValue.type})
            </div>
          </motion.div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
          {matchState.options.map((option, index) => {
            const isCorrect = option.id === matchState.correctOptionId;
            const showCorrect = matchState.feedback && isCorrect;
            const showWrong = matchState.feedback === 'wrong' && !isCorrect;

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionClick(option.id)}
                disabled={!!matchState.feedback}
                className={`py-4 px-6 rounded-xl text-xl font-bold transition-all ${
                  showCorrect
                    ? 'bg-green-500 text-white'
                    : showWrong
                    ? 'bg-slate-800 text-slate-500'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <span>{option.display}</span>
                <span className="text-sm font-normal text-slate-400 ml-2">
                  ({option.type})
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Feedback */}
        {matchState.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 text-xl font-bold ${
              matchState.feedback === 'correct' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {matchState.feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
          </motion.div>
        )}
      </div>
    </div>
  );
}
