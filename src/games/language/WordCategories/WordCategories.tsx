import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordCategoriesEngine, WordCategoriesState } from './WordCategoriesEngine';
import { GameHeader } from '@/components/game/GameHeader';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface WordCategoriesProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

export function WordCategories({ config, onComplete, onQuit }: WordCategoriesProps) {
  const engineRef = useRef<WordCategoriesEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [categoriesState, setCategoriesState] = useState<WordCategoriesState | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const engine = new WordCategoriesEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setCategoriesState(engine.getGameState());
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
      setCategoriesState(engine.getGameState());
    });

    return () => {
      engine.cleanup();
    };
  }, [config, onComplete]);

  const handleStart = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const handleCategoryClick = useCallback((categoryName: string) => {
    engineRef.current?.handleInput(categoryName);
  }, []);

  if (!isReady || !gameState || !categoriesState) {
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
          title="Word Categories"
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
            <div className="text-6xl mb-4">📂</div>
            <h2 className="text-2xl font-bold mb-2">Word Categories</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Sort words into their correct categories as fast as you can!
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">Level {gameState.level}</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• {categoriesState.categories.length || 2} categories</li>
                <li>• {categoriesState.totalTime}s time limit</li>
                <li>• {categoriesState.roundsInLevel} rounds</li>
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

  const timerPercent = (categoriesState.timeRemaining / categoriesState.totalTime) * 100;
  const placed = categoriesState.words.filter((w) => w.isPlaced).length;
  const total = categoriesState.words.length;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Word Categories"
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onQuit}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Timer & Progress */}
        <div className="w-full max-w-sm mb-4">
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Words: {placed}/{total}</span>
            <span>{Math.ceil(categoriesState.timeRemaining)}s</span>
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
        {categoriesState.streak > 2 && !categoriesState.feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-bold"
          >
            🔥 {categoriesState.streak} streak!
          </motion.div>
        )}

        {/* Current word */}
        <AnimatePresence mode="wait">
          {categoriesState.currentWord && (
            <motion.div
              key={categoriesState.currentWord.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`mb-8 px-8 py-4 rounded-2xl text-2xl font-bold ${
                categoriesState.feedback === 'correct'
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : categoriesState.feedback === 'wrong'
                  ? 'bg-red-500/20 border-2 border-red-500'
                  : 'bg-slate-800 border-2 border-primary-500'
              }`}
            >
              {categoriesState.currentWord.word}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category buckets */}
        <div className="w-full max-w-md grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(categoriesState.categories.length, 2)}, 1fr)` }}>
          {categoriesState.categories.map((category) => (
            <motion.button
              key={category.name}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick(category.name)}
              disabled={!!categoriesState.feedback}
              className="p-4 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors text-left"
            >
              <div className="font-bold text-lg mb-2">{category.name}</div>
              <div className="text-xs text-slate-400 mb-2">
                {category.words.length}/{category.capacity}
              </div>
              <div className="flex flex-wrap gap-1">
                {category.words.map((word, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 bg-slate-600 rounded"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Feedback */}
        {categoriesState.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 text-lg font-bold ${
              categoriesState.feedback === 'correct' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {categoriesState.feedback === 'correct' ? '✓ Correct!' : `✗ Wrong! It was ${categoriesState.currentWord?.category}`}
          </motion.div>
        )}
      </div>
    </div>
  );
}
