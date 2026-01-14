import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { SetFinderEngine, SetFinderState, SetCard } from './SetFinderEngine';
import { GameHeader } from '@/components/game/GameHeader';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface SetFinderProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

function CardDisplay({ card, onClick, disabled }: { card: SetCard; onClick: () => void; disabled: boolean }) {
  const colors = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
  };

  const renderShape = (index: number) => {
    const size = 20;
    const fill = card.fill === 'solid' ? colors[card.color] : 'none';
    const stroke = colors[card.color];
    const strokeDasharray = card.fill === 'striped' ? '3,2' : 'none';

    switch (card.shape) {
      case 'circle':
        return (
          <circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={2}
            strokeDasharray={strokeDasharray}
          />
        );
      case 'square':
        return (
          <rect
            key={index}
            x={2}
            y={2}
            width={size - 4}
            height={size - 4}
            fill={fill}
            stroke={stroke}
            strokeWidth={2}
            strokeDasharray={strokeDasharray}
          />
        );
      case 'triangle':
        return (
          <polygon
            key={index}
            points={`${size / 2},2 ${size - 2},${size - 2} 2,${size - 2}`}
            fill={fill}
            stroke={stroke}
            strokeWidth={2}
            strokeDasharray={strokeDasharray}
          />
        );
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all ${
        card.isSelected
          ? 'bg-primary-500/30 border-2 border-primary-500'
          : 'bg-slate-700 hover:bg-slate-600 border-2 border-transparent'
      }`}
    >
      <div className="flex gap-1 items-center justify-center min-w-[60px] min-h-[28px]">
        {Array.from({ length: card.count }).map((_, i) => (
          <svg key={i} width={20} height={20} viewBox="0 0 20 20">
            {renderShape(i)}
          </svg>
        ))}
      </div>
    </motion.button>
  );
}

export function SetFinder({ config, onComplete, onQuit }: SetFinderProps) {
  const engineRef = useRef<SetFinderEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [finderState, setFinderState] = useState<SetFinderState | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const engine = new SetFinderEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setFinderState(engine.getGameState());
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
      setFinderState(engine.getGameState());
    });

    return () => {
      engine.cleanup();
    };
  }, [config, onComplete]);

  const handleStart = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const handleCardClick = useCallback((cardId: number) => {
    engineRef.current?.handleInput({ type: 'select', cardId });
  }, []);

  const handleHint = useCallback(() => {
    engineRef.current?.handleInput({ type: 'hint' });
  }, []);

  if (!isReady || !gameState || !finderState) {
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
          title="Set Finder"
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
            <div className="text-6xl mb-4">🃏</div>
            <h2 className="text-2xl font-bold mb-2">Set Finder</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Find sets of 3 cards where each attribute is either all the same or all different!
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">Rules:</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Shape: all same OR all different</li>
                <li>• Color: all same OR all different</li>
                <li>• Count: all same OR all different</li>
                <li>• Fill: all same OR all different</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-slate-700">
                <span className="text-primary-400">Level {gameState.level}:</span> Find {finderState.setsNeeded} sets
              </div>
            </div>

            <button onClick={handleStart} className="btn-primary w-full">
              Start Level {gameState.level}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const timerPercent = (finderState.timeRemaining / finderState.totalTime) * 100;
  const cols = finderState.cards.length <= 9 ? 3 : finderState.cards.length <= 12 ? 4 : 5;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Set Finder"
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
            <span>Sets: {finderState.setsFound}/{finderState.setsNeeded}</span>
            <span>{Math.ceil(finderState.timeRemaining)}s</span>
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
        {finderState.streak > 1 && !finderState.feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-bold"
          >
            🔥 {finderState.streak} streak!
          </motion.div>
        )}

        {/* Selection count */}
        <div className="mb-4 text-sm text-slate-400">
          Selected: {finderState.selectedCards.length}/3
        </div>

        {/* Card grid */}
        <div
          className="grid gap-2 mb-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {finderState.cards.map((card) => (
            <CardDisplay
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id)}
              disabled={!!finderState.feedback}
            />
          ))}
        </div>

        {/* Hint button */}
        <button
          onClick={handleHint}
          disabled={finderState.hintUsed || finderState.validSets.length === 0}
          className="text-sm px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg"
        >
          💡 Hint {finderState.hintUsed && '(used)'}
        </button>

        {/* Feedback */}
        {finderState.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 text-xl font-bold ${
              finderState.feedback === 'correct' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {finderState.feedback === 'correct' ? '✓ Valid Set!' : '✗ Not a Set!'}
          </motion.div>
        )}
      </div>
    </div>
  );
}
