import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { GridDeductionEngine } from './GridDeductionEngine';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';
import { GameHeader } from '@/components/game/GameHeader';
import { useGameFeedback } from '@/hooks/useGameFeedback';

interface GridDeductionProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
}

export function GridDeduction({ config, onComplete, onExit }: GridDeductionProps) {
  const engineRef = useRef<GridDeductionEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [level, setLevel] = useState<ReturnType<GridDeductionEngine['getCurrentLevel']>>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const feedback = useGameFeedback();

  // Initialize engine
  useEffect(() => {
    const engine = new GridDeductionEngine(config);
    engineRef.current = engine;

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        if (engineRef.current) {
          setLevel(engineRef.current.getCurrentLevel());
          setSelectedCell(engineRef.current.getSelectedCell());
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

  const handleCellClick = useCallback((row: number, col: number) => {
    feedback.tap();
    engineRef.current?.selectCell(row, col);
  }, [feedback]);

  const handleNumberInput = useCallback((num: number) => {
    feedback.tap();
    engineRef.current?.handleInput(num);
  }, [feedback]);

  const handleClear = useCallback(() => {
    engineRef.current?.clearCell();
  }, []);

  if (!gameState || !level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const { size, grid } = level;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Grid Deduction"
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
          Fill the grid so each row, column{size === 6 ? ', and box' : ''} has {size === 4 ? '1-4' : '1-6'}
        </div>

        {/* Grid */}
        <div
          className={clsx(
            'grid gap-0.5 bg-slate-600 p-0.5 rounded-lg',
            size === 4 ? 'grid-cols-4' : 'grid-cols-6'
          )}
          style={{ width: `min(90vw, ${size * 52}px)` }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;

              // Box borders for visual grouping
              const boxBorderRight = size === 4
                ? colIndex === 1
                : colIndex === 2;
              const boxBorderBottom = size === 4
                ? rowIndex === 1
                : rowIndex === 1 || rowIndex === 3;

              return (
                <motion.button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  disabled={cell.isGiven}
                  className={clsx(
                    'aspect-square flex items-center justify-center text-lg font-bold',
                    'transition-colors duration-100',
                    cell.isGiven && 'bg-slate-700 text-slate-300',
                    !cell.isGiven && !isSelected && 'bg-slate-800 hover:bg-slate-700',
                    isSelected && 'bg-primary-500/30 ring-2 ring-primary-500',
                    cell.isError && 'bg-red-500/20 text-red-400',
                    !cell.isGiven && cell.value && !cell.isError && 'text-primary-400',
                    boxBorderRight && 'border-r-2 border-slate-500',
                    boxBorderBottom && 'border-b-2 border-slate-500'
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  {cell.value || ''}
                </motion.button>
              );
            })
          )}
        </div>

        {/* Number input */}
        <div className="mt-6 flex gap-2">
          {[...Array(size)].map((_, i) => (
            <motion.button
              key={i + 1}
              onClick={() => handleNumberInput(i + 1)}
              disabled={!selectedCell}
              className={clsx(
                'w-11 h-11 rounded-lg font-bold text-lg',
                'transition-colors duration-100',
                selectedCell
                  ? 'bg-slate-700 hover:bg-slate-600 active:bg-primary-500'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              )}
              whileTap={selectedCell ? { scale: 0.95 } : {}}
            >
              {i + 1}
            </motion.button>
          ))}
          <motion.button
            onClick={handleClear}
            disabled={!selectedCell}
            className={clsx(
              'w-11 h-11 rounded-lg font-bold',
              'transition-colors duration-100',
              selectedCell
                ? 'bg-slate-700 hover:bg-slate-600'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            )}
            whileTap={selectedCell ? { scale: 0.95 } : {}}
          >
            ✕
          </motion.button>
        </div>

        {/* Move counter */}
        <div className="mt-4 text-slate-500 text-sm">
          Moves: {engineRef.current?.getMoveCount() || 0}
        </div>
      </div>
    </div>
  );
}
