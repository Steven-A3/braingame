import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { CardFlipEngine, CardFlipState, Card } from './CardFlipEngine';
import { GameHeader } from '@/components/game/GameHeader';
import { useGameFeedback } from '@/hooks/useGameFeedback';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface CardFlipProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

export function CardFlip({ config, onComplete, onQuit }: CardFlipProps) {
  const engineRef = useRef<CardFlipEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [flipState, setFlipState] = useState<CardFlipState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const feedback = useGameFeedback();

  useEffect(() => {
    const engine = new CardFlipEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setFlipState(engine.getGameState());
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
      setFlipState(engine.getGameState());
    });

    return () => {
      engine.cleanup();
    };
  }, [config, onComplete]);

  const handleStart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.start();
    }
  }, []);

  const handleCardClick = useCallback((cardId: number) => {
    if (engineRef.current) {
      feedback.tap();
      engineRef.current.handleInput(cardId);
    }
  }, [feedback]);

  if (!isReady || !gameState || !flipState) {
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
          title="Card Flip"
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
            <h2 className="text-2xl font-bold mb-2">Card Flip Recall</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Find all matching pairs! Flip two cards at a time to reveal their symbols.
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">How to play:</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Tap cards to flip them over</li>
                <li>• Match pairs of identical symbols</li>
                <li>• Remember card positions!</li>
                <li>• Fewer moves = higher score</li>
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

  const { cols } = flipState.gridSize;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Card Flip"
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onQuit}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Stats */}
        <div className="flex gap-6 mb-4 text-sm">
          <div className="text-slate-400">
            Pairs: <span className="text-primary-400 font-bold">{flipState.matchedPairs}/{flipState.totalPairs}</span>
          </div>
          <div className="text-slate-400">
            Moves: <span className="text-white font-bold">{flipState.moves}</span>
          </div>
        </div>

        {/* Card Grid */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            maxWidth: `${cols * 60 + (cols - 1) * 8}px`,
          }}
        >
          {flipState.cards.map((card) => (
            <GameCard
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id)}
              disabled={!flipState.canFlip || card.isFlipped || card.isMatched}
            />
          ))}
        </div>

        {/* Match feedback */}
        {flipState.lastMatchCorrect !== null && (
          <MatchFeedback isCorrect={flipState.lastMatchCorrect} feedback={feedback} />
        )}
      </div>
    </div>
  );
}

interface GameCardProps {
  card: Card;
  onClick: () => void;
  disabled: boolean;
}

function GameCard({ card, onClick, disabled }: GameCardProps) {
  const isRevealed = card.isFlipped || card.isMatched;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="relative w-14 h-14 perspective-500"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-full h-full"
        initial={false}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Back of card */}
        <div
          className={`absolute inset-0 rounded-lg flex items-center justify-center backface-hidden ${
            card.isMatched
              ? 'bg-green-500/30 border-2 border-green-500/50'
              : 'bg-primary-500/20 border-2 border-primary-500/50'
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-2xl opacity-50">?</span>
        </div>

        {/* Front of card */}
        <div
          className={`absolute inset-0 rounded-lg flex items-center justify-center ${
            card.isMatched
              ? 'bg-green-500/30 border-2 border-green-500'
              : 'bg-slate-700 border-2 border-slate-600'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className="text-2xl">{card.symbol}</span>
        </div>
      </motion.div>
    </motion.button>
  );
}

// Separate component to trigger feedback effect
function MatchFeedback({ isCorrect, feedback }: { isCorrect: boolean; feedback: ReturnType<typeof useGameFeedback> }) {
  useEffect(() => {
    if (isCorrect) {
      feedback.correct();
    } else {
      feedback.wrong();
    }
  }, [isCorrect, feedback]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-4 text-lg font-bold ${
        isCorrect ? 'text-green-400' : 'text-red-400'
      }`}
    >
      {isCorrect ? '✓ Match!' : '✗ Try again'}
    </motion.div>
  );
}
