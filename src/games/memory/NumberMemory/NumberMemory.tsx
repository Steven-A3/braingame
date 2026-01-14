import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NumberMemoryEngine, NumberMemoryState } from './NumberMemoryEngine';
import { GameHeader } from '@/components/game/GameHeader';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface NumberMemoryProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

export function NumberMemory({ config, onComplete, onQuit }: NumberMemoryProps) {
  const engineRef = useRef<NumberMemoryEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [memoryState, setMemoryState] = useState<NumberMemoryState | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const engine = new NumberMemoryEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setMemoryState(engine.getGameState());
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
      setMemoryState(engine.getGameState());
    });

    return () => {
      engine.cleanup();
    };
  }, [config, onComplete]);

  const handleStart = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    engineRef.current?.handleInput(key);
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!memoryState || memoryState.phase !== 'input') return;

      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeyPress('backspace');
      } else if (e.key === 'Enter') {
        handleKeyPress('submit');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [memoryState, handleKeyPress]);

  if (!isReady || !gameState || !memoryState) {
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
          title="Number Memory"
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
            <h2 className="text-2xl font-bold mb-2">Number Memory</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Memorize the number sequence, then type it back.
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">Level {gameState.level}</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• {memoryState.numberLength} digits to remember</li>
                {memoryState.streak > 0 && (
                  <li>• Current streak: {memoryState.streak}</li>
                )}
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

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Number Memory"
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onQuit}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Streak indicator */}
        {memoryState.streak > 1 && memoryState.phase !== 'feedback' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-bold"
          >
            🔥 {memoryState.streak} streak!
          </motion.div>
        )}

        {/* Show phase - display number */}
        <AnimatePresence mode="wait">
          {memoryState.phase === 'show' && (
            <motion.div
              key="show"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center"
            >
              <div className="text-slate-400 mb-4">Memorize this number</div>
              <div className="bg-slate-800 rounded-2xl px-8 py-6 border-2 border-primary-500">
                <div className="text-4xl md:text-5xl font-mono font-bold tracking-wider">
                  {memoryState.currentNumber}
                </div>
              </div>
              <motion.div
                className="h-1 bg-primary-500 rounded-full mt-4"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: memoryState.displayTime / 1000, ease: 'linear' }}
              />
            </motion.div>
          )}

          {/* Input phase */}
          {memoryState.phase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center w-full max-w-sm"
            >
              <div className="text-slate-400 mb-4">What was the number?</div>

              {/* Input display */}
              <div className="bg-slate-800 rounded-2xl px-8 py-6 border-2 border-slate-700 mb-6">
                <div className="text-4xl font-mono font-bold tracking-wider min-h-[48px]">
                  {memoryState.userInput || (
                    <span className="text-slate-600">_</span>
                  )}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-primary-400"
                  >
                    |
                  </motion.span>
                </div>
              </div>

              {/* Number pad */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num.toString())}
                    className="py-4 text-2xl font-bold bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-xl transition-colors"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => handleKeyPress('backspace')}
                  className="py-4 text-xl bg-slate-700 hover:bg-slate-600 rounded-xl"
                >
                  ⌫
                </button>
                <button
                  onClick={() => handleKeyPress('0')}
                  className="py-4 text-2xl font-bold bg-slate-700 hover:bg-slate-600 rounded-xl"
                >
                  0
                </button>
                <button
                  onClick={() => handleKeyPress('submit')}
                  disabled={memoryState.userInput.length === 0}
                  className="py-4 text-xl bg-primary-500 hover:bg-primary-600 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl"
                >
                  ✓
                </button>
              </div>

              <div className="text-sm text-slate-500">
                {memoryState.userInput.length} / {memoryState.numberLength} digits
              </div>
            </motion.div>
          )}

          {/* Feedback phase */}
          {memoryState.phase === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className={`text-6xl mb-4 ${memoryState.isCorrect ? '' : 'grayscale'}`}>
                {memoryState.isCorrect ? '🎉' : '😔'}
              </div>
              <div className={`text-2xl font-bold mb-4 ${
                memoryState.isCorrect ? 'text-green-400' : 'text-red-400'
              }`}>
                {memoryState.isCorrect ? 'Correct!' : 'Wrong!'}
              </div>

              {!memoryState.isCorrect && (
                <div className="text-slate-400">
                  <div className="mb-2">The number was:</div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {memoryState.currentNumber}
                  </div>
                  <div className="mt-2 text-sm">
                    You entered: <span className="text-red-400">{memoryState.userInput}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
