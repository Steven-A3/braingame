import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { SpatialRecallEngine, SpatialRecallState } from './SpatialRecallEngine';
import { GameHeader } from '@/components/game/GameHeader';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface SpatialRecallProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

export function SpatialRecall({ config, onComplete, onQuit }: SpatialRecallProps) {
  const engineRef = useRef<SpatialRecallEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [spatialState, setSpatialState] = useState<SpatialRecallState | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const engine = new SpatialRecallEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setSpatialState(engine.getGameState());
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
      setSpatialState(engine.getGameState());
    });

    return () => {
      engine.cleanup();
    };
  }, [config, onComplete]);

  const handleStart = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const handleCellClick = useCallback((cellId: number) => {
    engineRef.current?.handleInput(cellId);
  }, []);

  if (!isReady || !gameState || !spatialState) {
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
          title="Spatial Recall"
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
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-2xl font-bold mb-2">Spatial Recall</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Memorize the highlighted positions, then tap to recall them.
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">Level {gameState.level}</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• {spatialState.gridSize}x{spatialState.gridSize} grid</li>
                <li>• {spatialState.targetCount} positions to remember</li>
                <li>• {spatialState.roundsInLevel} rounds</li>
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

  const cellSize = Math.min(60, 280 / spatialState.gridSize);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Spatial Recall"
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onQuit}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Phase indicator */}
        <div className="mb-4 text-center">
          <div className={`text-lg font-bold ${
            spatialState.phase === 'memorize' ? 'text-yellow-400' :
            spatialState.phase === 'recall' ? 'text-primary-400' :
            'text-slate-400'
          }`}>
            {spatialState.phase === 'memorize' && '👀 Memorize!'}
            {spatialState.phase === 'recall' && '🎯 Tap the positions!'}
            {spatialState.phase === 'feedback' && 'Results'}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            Round {spatialState.roundsCompleted + 1} of {spatialState.roundsInLevel}
          </div>
        </div>

        {/* Progress bar for memorize phase */}
        {spatialState.phase === 'memorize' && (
          <div className="w-full max-w-xs mb-4">
            <motion.div
              className="h-2 bg-yellow-500 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: spatialState.memorizeTime / 1000, ease: 'linear' }}
            />
          </div>
        )}

        {/* Selection counter */}
        {spatialState.phase === 'recall' && (
          <div className="mb-4 text-slate-400">
            Selected: {spatialState.selectedCount} / {spatialState.targetCount}
          </div>
        )}

        {/* Grid */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${spatialState.gridSize}, ${cellSize}px)`,
          }}
        >
          {spatialState.grid.map((cell) => {
            const showTarget = spatialState.phase === 'memorize' && cell.isTarget;
            const showMissed = spatialState.phase === 'feedback' && cell.isTarget && !cell.isSelected;

            let bgColor = 'bg-slate-700';
            if (showTarget) bgColor = 'bg-primary-500';
            if (cell.showFeedback === 'correct') bgColor = 'bg-green-500';
            if (cell.showFeedback === 'wrong' && cell.isSelected) bgColor = 'bg-red-500';
            if (showMissed) bgColor = 'bg-yellow-500/50';

            return (
              <motion.button
                key={cell.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCellClick(cell.id)}
                disabled={spatialState.phase !== 'recall' || cell.isSelected}
                className={`rounded-lg transition-colors ${bgColor}`}
                style={{ width: cellSize, height: cellSize }}
                initial={showTarget ? { scale: 1 } : {}}
                animate={showTarget ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </div>

        {/* Feedback summary */}
        {spatialState.phase === 'feedback' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <div className={`text-xl font-bold ${
              spatialState.correctCount === spatialState.targetCount ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {spatialState.correctCount} / {spatialState.targetCount} correct
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
