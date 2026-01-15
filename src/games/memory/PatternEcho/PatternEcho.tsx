import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { PatternEchoEngine, type Tile } from './PatternEchoEngine';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';
import { GameHeader } from '@/components/game/GameHeader';
import { useGameFeedback } from '@/hooks/useGameFeedback';

interface PatternEchoProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
}

export function PatternEcho({ config, onComplete, onExit }: PatternEchoProps) {
  const engineRef = useRef<PatternEchoEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTile, setActiveTile] = useState<Tile | null>(null);
  const [showingSequence, setShowingSequence] = useState(false);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [gridSize, setGridSize] = useState(3);
  const [playerTapped, setPlayerTapped] = useState<Tile | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const feedback = useGameFeedback();

  // Initialize engine
  useEffect(() => {
    const engine = new PatternEchoEngine(config);
    engineRef.current = engine;

    engine.setCallbacks({
      onStateChange: (state) => setGameState(state),
      onComplete: (result) => onComplete(result),
    });

    engine.init().then(() => {
      engine.start();
    });

    return () => {
      engineRef.current = null;
    };
  }, [config, onComplete]);

  // Update UI state from engine
  useEffect(() => {
    if (!engineRef.current) return;

    const engine = engineRef.current;
    const level = engine.getCurrentLevel();

    if (level) {
      setGridSize(level.gridSize);
      setShowingSequence(engine.isShowingPattern());

      if (engine.isShowingPattern()) {
        playSequence(level.sequence, level.timePerTile);
      }
    }
  }, [gameState?.level]);

  // Play the sequence animation
  const playSequence = useCallback(async (sequence: Tile[], timePerTile: number) => {
    setShowingSequence(true);

    for (let i = 0; i < sequence.length; i++) {
      setCurrentSequenceIndex(i);
      setActiveTile(sequence[i]);
      await sleep(timePerTile);
      setActiveTile(null);
      await sleep(150); // Gap between tiles
    }

    setShowingSequence(false);
    engineRef.current?.onSequenceComplete();
  }, []);

  // Handle tile tap
  const handleTileTap = useCallback((row: number, col: number) => {
    if (!engineRef.current || showingSequence) return;

    const tile = { row, col };
    setPlayerTapped(tile);

    // Visual feedback
    const level = engineRef.current.getCurrentLevel();
    if (level) {
      const expected = level.sequence[engineRef.current.getPlayerProgress()];
      const correct = expected.row === row && expected.col === col;
      setIsCorrect(correct);

      // Audio/haptic feedback
      if (correct) {
        feedback.correct();
      } else {
        feedback.wrong();
      }
    }

    engineRef.current.handleInput(tile);

    // Reset visual feedback
    setTimeout(() => {
      setPlayerTapped(null);
      setIsCorrect(null);
    }, 200);
  }, [showingSequence, feedback]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const engine = engineRef.current;
  const progress = engine ? engine.getPlayerProgress() : 0;
  const required = engine ? engine.getRequiredLength() : 0;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Pattern Echo"
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onExit}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Status message */}
        <div className="mb-6 h-8 text-center">
          {showingSequence ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-primary-400 font-medium"
            >
              Watch the pattern... ({currentSequenceIndex + 1}/{required})
            </motion.div>
          ) : (
            <div className="text-slate-300">
              Your turn! ({progress}/{required})
            </div>
          )}
        </div>

        {/* Grid */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            width: `min(90vw, ${gridSize * 80}px)`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            const isActive = activeTile?.row === row && activeTile?.col === col;
            const isTapped = playerTapped?.row === row && playerTapped?.col === col;

            return (
              <motion.button
                key={index}
                onClick={() => handleTileTap(row, col)}
                disabled={showingSequence}
                className={clsx(
                  'aspect-square rounded-xl transition-all duration-150',
                  'border-2 game-tile',
                  isActive && 'bg-primary-500 border-primary-400 shadow-lg shadow-primary-500/50',
                  isTapped && isCorrect === true && 'bg-green-500 border-green-400',
                  isTapped && isCorrect === false && 'bg-red-500 border-red-400',
                  !isActive && !isTapped && 'bg-slate-700 border-slate-600 hover:bg-slate-600',
                  showingSequence && 'cursor-not-allowed'
                )}
                whileTap={{ scale: 0.95 }}
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
              />
            );
          })}
        </div>

        {/* Progress dots */}
        <div className="mt-8 flex gap-1.5">
          {Array.from({ length: required }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                'w-2 h-2 rounded-full transition-colors',
                i < progress
                  ? 'bg-primary-500'
                  : i === currentSequenceIndex && showingSequence
                  ? 'bg-primary-400'
                  : 'bg-slate-600'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
