import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { WordMorphEngine } from './WordMorphEngine';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';
import { GameHeader } from '@/components/game/GameHeader';

interface WordMorphProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
}

export function WordMorph({ config, onComplete, onExit }: WordMorphProps) {
  const engineRef = useRef<WordMorphEngine | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [level, setLevel] = useState<ReturnType<WordMorphEngine['getCurrentLevel']>>(null);
  const [inputValue, setInputValue] = useState('');
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'valid' | 'invalid' | null>(null);

  // Initialize engine
  useEffect(() => {
    const engine = new WordMorphEngine(config);
    engineRef.current = engine;

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        if (engineRef.current) {
          setLevel(engineRef.current.getCurrentLevel());
          setValidMoves(engineRef.current.getValidMoves());
        }
      },
      onComplete: (result) => onComplete(result),
    });

    engine.init().then(() => {
      engine.start();
    });

    return () => {
      engineRef.current = null;
    };
  }, [config, onComplete]);

  const handleSubmit = useCallback(() => {
    if (!engineRef.current || !inputValue.trim()) return;

    const prevMoves = level?.moves.length || 0;
    engineRef.current.handleInput(inputValue);
    const newMoves = engineRef.current.getCurrentLevel()?.moves.length || 0;

    if (newMoves > prevMoves) {
      setFeedback('valid');
      setInputValue('');
    } else {
      setFeedback('invalid');
    }

    setTimeout(() => setFeedback(null), 300);
  }, [inputValue, level]);

  const handleUndo = useCallback(() => {
    engineRef.current?.undoMove();
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);

  if (!gameState || !level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Word Morph"
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onExit}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Target display */}
        <div className="mb-8 text-center">
          <div className="text-slate-400 text-sm mb-2">Transform</div>
          <div className="flex items-center gap-4 text-2xl font-bold">
            <span className="text-primary-400">{level.startWord.toUpperCase()}</span>
            <span className="text-slate-500">→</span>
            <span className="text-green-400">{level.targetWord.toUpperCase()}</span>
          </div>
          <div className="text-slate-500 text-xs mt-2">
            Optimal: {level.optimalSteps} steps
          </div>
        </div>

        {/* Word chain */}
        <div className="mb-6 flex flex-wrap justify-center gap-2 max-w-sm">
          <AnimatePresence>
            {level.moves.map((word, index) => (
              <motion.div
                key={`${word}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={clsx(
                  'px-3 py-1.5 rounded-lg font-mono text-lg font-bold',
                  index === 0 && 'bg-primary-500/20 text-primary-400',
                  index > 0 && index < level.moves.length - 1 && 'bg-slate-700 text-slate-300',
                  index === level.moves.length - 1 && index > 0 && 'bg-yellow-500/20 text-yellow-400'
                )}
              >
                {word.toUpperCase()}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Current progress indicator */}
          {level.currentWord !== level.targetWord && (
            <div className="text-slate-500 flex items-center">
              <span className="mx-2">→</span>
              <span className="text-green-400 font-mono font-bold">
                {level.targetWord.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="w-full max-w-xs mb-4">
          <div
            className={clsx(
              'flex items-center bg-slate-800 rounded-xl overflow-hidden border-2 transition-colors',
              feedback === 'valid' && 'border-green-500',
              feedback === 'invalid' && 'border-red-500',
              !feedback && 'border-slate-600 focus-within:border-primary-500'
            )}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toLowerCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter next word..."
              maxLength={4}
              className="flex-1 bg-transparent px-4 py-3 text-lg font-mono uppercase outline-none"
              autoComplete="off"
              autoCapitalize="off"
            />
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className={clsx(
                'px-4 py-3 font-semibold transition-colors',
                inputValue.trim()
                  ? 'bg-primary-500 hover:bg-primary-600 text-white'
                  : 'bg-slate-700 text-slate-500'
              )}
            >
              →
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleUndo}
            disabled={level.moves.length <= 1}
            className={clsx(
              'btn-ghost text-sm',
              level.moves.length <= 1 && 'opacity-50 cursor-not-allowed'
            )}
          >
            ↩ Undo
          </button>
          <button
            onClick={() => setShowHint(!showHint)}
            className="btn-ghost text-sm"
          >
            💡 Hint
          </button>
        </div>

        {/* Hints */}
        <AnimatePresence>
          {showHint && validMoves.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 text-center"
            >
              <div className="text-slate-400 text-sm mb-2">Valid next words:</div>
              <div className="flex flex-wrap justify-center gap-2">
                {validMoves.slice(0, 6).map((word) => (
                  <button
                    key={word}
                    onClick={() => {
                      setInputValue(word);
                      inputRef.current?.focus();
                    }}
                    className="px-2 py-1 bg-slate-700 rounded text-sm font-mono hover:bg-slate-600"
                  >
                    {word}
                  </button>
                ))}
                {validMoves.length > 6 && (
                  <span className="px-2 py-1 text-slate-500 text-sm">
                    +{validMoves.length - 6} more
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps counter */}
        <div className="mt-6 text-slate-500 text-sm">
          Steps: {level.moves.length - 1}
        </div>
      </div>
    </div>
  );
}
