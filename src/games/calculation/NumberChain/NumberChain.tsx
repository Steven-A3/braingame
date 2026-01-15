import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { NumberChainEngine, NumberChainState } from './NumberChainEngine';
import { GameHeader } from '@/components/game/GameHeader';
import { useGameFeedback } from '@/hooks/useGameFeedback';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface NumberChainProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

export function NumberChain({ config, onComplete, onQuit }: NumberChainProps) {
  const engineRef = useRef<NumberChainEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [chainState, setChainState] = useState<NumberChainState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const gameFeedback = useGameFeedback();

  useEffect(() => {
    const engine = new NumberChainEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setChainState(engine.getGameState());
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
      setChainState(engine.getGameState());
    });

    return () => {
      engine.cleanup();
    };
  }, [config, onComplete]);

  const handleStart = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const handleOperation = useCallback((op: string) => {
    gameFeedback.tap();
    engineRef.current?.handleInput({ type: 'operation', value: op });
  }, [gameFeedback]);

  const handleNumber = useCallback((id: number) => {
    gameFeedback.tap();
    engineRef.current?.handleInput({ type: 'number', value: id });
  }, [gameFeedback]);

  const handleUndo = useCallback(() => {
    engineRef.current?.handleInput({ type: 'undo' });
  }, []);

  if (!isReady || !gameState || !chainState) {
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
          title="Number Chain"
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
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-2xl font-bold mb-2">Number Chain</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Use operations to chain numbers and reach the target!
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">Level {gameState.level}</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Operations: {chainState.operations.join(' ')}</li>
                <li>• {chainState.totalTime}s per puzzle</li>
                <li>• {chainState.roundsInLevel} rounds</li>
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

  const timerPercent = (chainState.timeRemaining / chainState.totalTime) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Number Chain"
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
            <span>Round {chainState.roundsCompleted + 1}/{chainState.roundsInLevel}</span>
            <span>{chainState.timeRemaining.toFixed(1)}s</span>
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

        {/* Target */}
        <div className="mb-6 text-center">
          <div className="text-sm text-slate-400 mb-1">Target</div>
          <div className="text-4xl font-bold text-primary-400">{chainState.target}</div>
        </div>

        {/* Current value */}
        <div className="mb-6">
          <motion.div
            key={chainState.currentValue}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-5xl font-bold ${
              chainState.currentValue === chainState.target ? 'text-green-400' : 'text-white'
            }`}
          >
            {chainState.currentValue}
          </motion.div>
        </div>

        {/* Pending operation indicator */}
        {chainState.pendingOperation && (
          <div className="mb-4 px-4 py-2 bg-primary-500/20 rounded-lg">
            <span className="text-primary-400 font-bold">
              {chainState.currentValue} {chainState.pendingOperation} ?
            </span>
          </div>
        )}

        {/* Operations */}
        <div className="flex gap-2 mb-6">
          {chainState.operations.map((op) => (
            <motion.button
              key={op}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOperation(op)}
              className={`w-14 h-14 rounded-xl text-2xl font-bold transition-colors ${
                chainState.pendingOperation === op
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {op}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleUndo}
            disabled={chainState.history.length <= 1}
            className="w-14 h-14 rounded-xl text-xl bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600"
          >
            ↩
          </motion.button>
        </div>

        {/* Available numbers */}
        <div className="flex flex-wrap gap-3 justify-center max-w-xs">
          {chainState.numbers.map((num) => (
            <motion.button
              key={num.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumber(num.id)}
              disabled={num.isUsed || !chainState.pendingOperation}
              className={`w-16 h-16 rounded-xl text-2xl font-bold transition-all ${
                num.isUsed
                  ? 'bg-slate-800 text-slate-600'
                  : chainState.pendingOperation
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-slate-700 opacity-50'
              }`}
            >
              {num.value}
            </motion.button>
          ))}
        </div>

        {/* History */}
        <div className="mt-6 text-sm text-slate-500">
          {chainState.history.map((h, i) => (
            <span key={i}>
              {i > 0 && ' → '}
              {h.operation === 'Start' ? h.value : `${h.operation} = ${h.value}`}
            </span>
          ))}
        </div>

        {/* Feedback */}
        {chainState.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 text-xl font-bold ${
              chainState.feedback === 'correct' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {chainState.feedback === 'correct' ? '✓ Target reached!' : '✗ Try again!'}
          </motion.div>
        )}
      </div>
    </div>
  );
}
