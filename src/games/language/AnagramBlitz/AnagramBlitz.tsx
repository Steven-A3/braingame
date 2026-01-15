import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnagramBlitzEngine, AnagramBlitzState } from './AnagramBlitzEngine';
import { GameHeader } from '@/components/game/GameHeader';
import { useGameFeedback } from '@/hooks/useGameFeedback';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface AnagramBlitzProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

export function AnagramBlitz({ config, onComplete, onQuit }: AnagramBlitzProps) {
  const engineRef = useRef<AnagramBlitzEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [anagramState, setAnagramState] = useState<AnagramBlitzState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const gameFeedback = useGameFeedback();

  // Initialize engine
  useEffect(() => {
    const engine = new AnagramBlitzEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setAnagramState(engine.getGameState());
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
      setAnagramState(engine.getGameState());
    });

    return () => {
      engine.cleanup();
    };
  }, [config, onComplete]);

  const handleStart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.start();
      setSelectedIndices([]);
    }
  }, []);

  const handleLetterClick = useCallback((index: number) => {
    if (!anagramState || selectedIndices.includes(index)) return;

    gameFeedback.tap();
    const letter = anagramState.letters[index];
    setSelectedIndices(prev => [...prev, index]);

    if (engineRef.current) {
      engineRef.current.handleInput({ type: 'letter', letter });
    }
  }, [anagramState, selectedIndices, gameFeedback]);

  const handleBackspace = useCallback(() => {
    setSelectedIndices(prev => prev.slice(0, -1));
    if (engineRef.current) {
      engineRef.current.handleInput({ type: 'backspace' });
    }
  }, []);

  const handleSubmit = useCallback(() => {
    setSelectedIndices([]);
    if (engineRef.current) {
      const state = engineRef.current.getGameState();
      const isValid = state?.possibleWords.includes(state?.currentInput.toLowerCase() ?? '');
      if (isValid) {
        gameFeedback.correct();
      } else {
        gameFeedback.wrong();
      }
      engineRef.current.handleInput({ type: 'submit' });
    }
  }, [gameFeedback]);

  const handleShuffle = useCallback(() => {
    setSelectedIndices([]);
    if (engineRef.current) {
      engineRef.current.handleInput({ type: 'shuffle' });
    }
  }, []);

  const handleHint = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.handleInput({ type: 'hint' });
    }
  }, []);

  const handleClear = useCallback(() => {
    setSelectedIndices([]);
    // Clear input by backspacing until empty
    if (engineRef.current && anagramState) {
      for (let i = 0; i < anagramState.currentInput.length; i++) {
        engineRef.current.handleInput({ type: 'backspace' });
      }
    }
  }, [anagramState]);

  if (!isReady || !gameState || !anagramState) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Ready screen
  if (gameState.status === 'ready') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <GameHeader
          title="Anagram Blitz"
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
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-2">Anagram Blitz</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Find as many words as you can from the scrambled letters!
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">How to play:</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Tap letters to build words</li>
                <li>• Words must be 3+ letters</li>
                <li>• Longer words = more points!</li>
                <li>• Use hints if you're stuck (3 max)</li>
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

  // Main game UI
  const timerPercent = (anagramState.timeRemaining / anagramState.totalTime) * 100;
  const timerColor = timerPercent > 30 ? 'bg-primary-500' : timerPercent > 10 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Anagram Blitz"
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onQuit}
      />

      <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
        {/* Timer bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>{anagramState.timeRemaining}s</span>
            <span>{anagramState.foundWords.length} words found</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${timerColor}`}
              initial={{ width: '100%' }}
              animate={{ width: `${timerPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Current word display */}
        <div className="mb-4">
          <div className="h-14 bg-slate-800 rounded-xl flex items-center justify-center px-4 border-2 border-slate-700">
            <span className="text-2xl font-bold tracking-wider">
              {anagramState.currentInput.toUpperCase() || (
                <span className="text-slate-600">Tap letters...</span>
              )}
            </span>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {anagramState.feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-center text-sm mt-2 ${
                  anagramState.feedback === 'valid' ? 'text-green-400' :
                  anagramState.feedback === 'duplicate' ? 'text-yellow-400' :
                  anagramState.feedback === 'too-short' ? 'text-yellow-400' :
                  'text-red-400'
                }`}
              >
                {anagramState.feedback === 'valid' && `+${getWordPoints(anagramState.lastWord)} "${anagramState.lastWord}"!`}
                {anagramState.feedback === 'duplicate' && 'Already found!'}
                {anagramState.feedback === 'too-short' && 'Too short! (3+ letters)'}
                {anagramState.feedback === 'invalid' && 'Not a valid word'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint display */}
          {anagramState.hint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm mt-2 text-primary-400"
            >
              Hint: {anagramState.hint.toUpperCase()}
            </motion.div>
          )}
        </div>

        {/* Letter tiles */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {anagramState.letters.map((letter, index) => (
            <motion.button
              key={`${letter}-${index}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleLetterClick(index)}
              disabled={selectedIndices.includes(index)}
              className={`w-12 h-12 rounded-lg text-xl font-bold transition-all ${
                selectedIndices.includes(index)
                  ? 'bg-slate-700 text-slate-500 scale-90'
                  : 'bg-primary-500/20 text-primary-400 border-2 border-primary-500/50 hover:bg-primary-500/30'
              }`}
            >
              {letter}
            </motion.button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={handleClear}
            className="btn-ghost text-sm py-2"
          >
            Clear
          </button>
          <button
            onClick={handleBackspace}
            className="btn-ghost text-sm py-2"
          >
            ← Back
          </button>
          <button
            onClick={handleShuffle}
            className="btn-ghost text-sm py-2"
          >
            🔀 Shuffle
          </button>
          <button
            onClick={handleHint}
            disabled={anagramState.hintsUsed >= anagramState.maxHints}
            className={`btn-ghost text-sm py-2 ${
              anagramState.hintsUsed >= anagramState.maxHints ? 'opacity-50' : ''
            }`}
          >
            💡 {anagramState.maxHints - anagramState.hintsUsed}
          </button>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={anagramState.currentInput.length < 3}
          className={`w-full py-3 rounded-xl text-lg font-bold transition-all ${
            anagramState.currentInput.length >= 3
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-slate-700 text-slate-500'
          }`}
        >
          Submit Word
        </button>

        {/* Found words */}
        <div className="mt-4 flex-1 overflow-y-auto">
          <div className="text-sm text-slate-500 mb-2">
            Found words ({anagramState.foundWords.length}/{anagramState.possibleWords.length} possible):
          </div>
          <div className="flex flex-wrap gap-1">
            {anagramState.foundWords.map((word, index) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm"
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getWordPoints(word: string): number {
  const lengthBonus = [0, 0, 0, 10, 20, 40, 80, 120, 180, 250];
  return lengthBonus[Math.min(word.length, lengthBonus.length - 1)] || 250;
}
