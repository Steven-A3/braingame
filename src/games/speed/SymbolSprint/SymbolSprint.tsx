import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { SymbolSprintEngine, SymbolSprintState } from './SymbolSprintEngine';
import { GameHeader } from '@/components/game/GameHeader';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface SymbolSprintProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

export function SymbolSprint({ config, onComplete, onQuit }: SymbolSprintProps) {
  const engineRef = useRef<SymbolSprintEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [sprintState, setSprintState] = useState<SymbolSprintState | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const engine = new SymbolSprintEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setSprintState(engine.getGameState());
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
      setSprintState(engine.getGameState());
    });

    return () => {
      engine.cleanup();
    };
  }, [config, onComplete]);

  const handleStart = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const handleCellTap = useCallback((cellId: number) => {
    engineRef.current?.handleInput(cellId);
  }, []);

  if (!isReady || !gameState || !sprintState) {
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
          title="Symbol Sprint"
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
            <div className="text-6xl mb-4">⚡</div>
            <h2 className="text-2xl font-bold mb-2">Symbol Sprint</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Tap all matching symbols as fast as you can! Be careful not to tap the wrong ones.
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">Level {gameState.level}</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• {sprintState.gridSize}x{sprintState.gridSize} grid</li>
                <li>• {sprintState.totalTime}s per round</li>
                <li>• {sprintState.roundsInLevel} rounds</li>
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

  const timerPercent = (sprintState.timeRemaining / sprintState.totalTime) * 100;
  const cellSize = Math.min(56, 300 / sprintState.gridSize);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Symbol Sprint"
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
            <span>Round {sprintState.roundsCompleted + 1}/{sprintState.roundsInLevel}</span>
            <span>{sprintState.timeRemaining.toFixed(1)}s</span>
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

        {/* Target indicator */}
        <div className="mb-6 text-center">
          <div className="text-sm text-slate-400 mb-1">Find all:</div>
          <div className="text-5xl">{sprintState.targetSymbol}</div>
          <div className="text-sm text-slate-500 mt-1">
            {sprintState.correctTaps}/{sprintState.targetCount} found
          </div>
        </div>

        {/* Streak indicator */}
        {sprintState.streak > 2 && sprintState.feedback !== 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-bold"
          >
            🔥 {sprintState.streak} streak!
          </motion.div>
        )}

        {/* Symbol grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${sprintState.gridSize}, ${cellSize}px)`,
          }}
        >
          {sprintState.gridSymbols.map((cell) => (
            <motion.button
              key={cell.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleCellTap(cell.id)}
              disabled={cell.symbol === '' || sprintState.feedback === 'complete'}
              className={`flex items-center justify-center rounded-lg text-2xl transition-all ${
                cell.symbol === ''
                  ? 'bg-slate-800 text-slate-700'
                  : 'bg-slate-700 hover:bg-slate-600 active:bg-slate-500'
              }`}
              style={{ width: cellSize, height: cellSize }}
            >
              {cell.symbol}
            </motion.button>
          ))}
        </motion.div>

        {/* Round complete feedback */}
        {sprintState.feedback === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <div className="text-xl font-bold text-green-400">
              {sprintState.correctTaps >= sprintState.targetCount
                ? '✓ All found!'
                : `Found ${sprintState.correctTaps}/${sprintState.targetCount}`}
            </div>
            {sprintState.wrongTaps > 0 && (
              <div className="text-sm text-red-400 mt-1">
                {sprintState.wrongTaps} wrong tap{sprintState.wrongTaps > 1 ? 's' : ''}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
