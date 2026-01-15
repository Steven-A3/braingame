import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { VisualSearchEngine, VisualSearchState, SearchItem } from './VisualSearchEngine';
import { GameHeader } from '@/components/game/GameHeader';
import { useGameFeedback } from '@/hooks/useGameFeedback';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface VisualSearchProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

function ShapeComponent({ item, size, showFeedback }: { item: SearchItem; size: number; showFeedback: boolean }) {
  const { shape, color, rotation, isTarget } = item;

  let borderColor = 'transparent';
  if (showFeedback && isTarget) {
    borderColor = '#22c55e';
  }

  const commonStyle = {
    transform: `rotate(${rotation}deg)`,
  };

  const renderShape = () => {
    switch (shape) {
      case 'circle':
        return (
          <div
            style={{
              ...commonStyle,
              width: size * 0.7,
              height: size * 0.7,
              backgroundColor: color,
              borderRadius: '50%',
            }}
          />
        );
      case 'square':
        return (
          <div
            style={{
              ...commonStyle,
              width: size * 0.65,
              height: size * 0.65,
              backgroundColor: color,
              borderRadius: 4,
            }}
          />
        );
      case 'triangle':
        return (
          <div
            style={{
              ...commonStyle,
              width: 0,
              height: 0,
              borderLeft: `${size * 0.35}px solid transparent`,
              borderRight: `${size * 0.35}px solid transparent`,
              borderBottom: `${size * 0.6}px solid ${color}`,
            }}
          />
        );
      case 'diamond':
        return (
          <div
            style={{
              ...commonStyle,
              width: size * 0.5,
              height: size * 0.5,
              backgroundColor: color,
              transform: `rotate(${rotation + 45}deg)`,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
        border: `3px solid ${borderColor}`,
        borderRadius: 8,
      }}
    >
      {renderShape()}
    </div>
  );
}

export function VisualSearch({ config, onComplete, onQuit }: VisualSearchProps) {
  const engineRef = useRef<VisualSearchEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [searchState, setSearchState] = useState<VisualSearchState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const feedback = useGameFeedback();

  useEffect(() => {
    const engine = new VisualSearchEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setSearchState(engine.getGameState());
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
      setSearchState(engine.getGameState());
    });

    return () => {
      engine.cleanup();
    };
  }, [config, onComplete]);

  const handleStart = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const handleItemClick = useCallback((itemId: number) => {
    const state = engineRef.current?.getGameState();
    const item = state?.items.find(i => i.id === itemId);
    if (item?.isTarget) {
      feedback.correct();
    } else {
      feedback.wrong();
    }
    engineRef.current?.handleInput(itemId);
  }, [feedback]);

  if (!isReady || !gameState || !searchState) {
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
          title="Visual Search"
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
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">Visual Search</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Find the odd one out! Tap the item that's different from the rest.
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">Level {gameState.level}</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• {searchState.gridSize}x{searchState.gridSize} grid</li>
                <li>• {searchState.totalTime}s time limit</li>
                <li>• {searchState.roundsInLevel} rounds</li>
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

  const cellSize = Math.min(56, 280 / searchState.gridSize);
  const timerPercent = (searchState.timeRemaining / searchState.totalTime) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Visual Search"
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onQuit}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Progress & Timer */}
        <div className="w-full max-w-xs mb-4">
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Round {searchState.roundsCompleted + 1}/{searchState.roundsInLevel}</span>
            <span>{searchState.timeRemaining.toFixed(1)}s</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full transition-colors ${
                timerPercent > 50 ? 'bg-primary-500' : timerPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        {searchState.streak > 1 && !searchState.feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-bold"
          >
            🔥 {searchState.streak} streak!
          </motion.div>
        )}

        {/* Instruction */}
        <div className="text-slate-400 mb-4 text-sm">
          Find the different one!
        </div>

        {/* Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${searchState.gridSize}, ${cellSize}px)`,
          }}
        >
          {searchState.items.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleItemClick(item.id)}
              disabled={searchState.feedback !== null}
              className="bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ShapeComponent
                item={item}
                size={cellSize}
                showFeedback={searchState.feedback !== null}
              />
            </motion.button>
          ))}
        </motion.div>

        {/* Feedback */}
        {searchState.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 text-xl font-bold ${
              searchState.feedback === 'correct' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {searchState.feedback === 'correct' ? '✓ Found it!' : '✗ Wrong!'}
          </motion.div>
        )}
      </div>
    </div>
  );
}
