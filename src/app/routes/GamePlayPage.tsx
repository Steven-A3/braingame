import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getGameInfo } from '@/games/registry';
import { getDailyChallenge } from '@/services/dailyContent';
import { calculateDifficulty } from '@/games/core/DifficultySystem';
import { getGameSeed } from '@/games/core/SeededRNG';
import { useUserStore } from '@/stores/userStore';
import type { GameConfig, GameResult } from '@/games/core/types';
import { ResultsScreen } from '@/components/game/ResultsScreen';

// Game components (lazy loaded in production, direct imports for simplicity)
import { PatternEcho } from '@/games/memory/PatternEcho';
import { ColorStroop } from '@/games/focus/ColorStroop';
import { MathSprint } from '@/games/calculation/MathSprint';
import { ReflexTap } from '@/games/speed/ReflexTap';
import { GridDeduction } from '@/games/logic/GridDeduction';
import { WordMorph } from '@/games/language/WordMorph';

const GAME_COMPONENTS: Record<string, React.ComponentType<{
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
}>> = {
  'pattern-echo': PatternEcho,
  'color-stroop': ColorStroop,
  'math-sprint': MathSprint,
  'reflex-tap': ReflexTap,
  'grid-deduction': GridDeduction,
  'word-morph': WordMorph,
};

export function GamePlayPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const recordGameResult = useUserStore((state) => state.recordGameResult);

  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const gameInfo = gameId ? getGameInfo(gameId) : null;

  // Get game config
  const config: GameConfig = useMemo(() => {
    const today = new Date();
    return {
      gameId: gameId || '',
      seed: getGameSeed(gameId || '', today),
      difficulty: calculateDifficulty(5, today),
    };
  }, [gameId]);

  const handleComplete = useCallback((result: GameResult) => {
    setGameResult(result);
    setShowResults(true);
    recordGameResult(result);
  }, [recordGameResult]);

  const handleExit = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handlePlayAgain = useCallback(() => {
    setShowResults(false);
    setGameResult(null);
  }, []);

  // Game not found
  if (!gameId || !gameInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">🎮</div>
        <h1 className="text-xl font-bold mb-2">Game Not Found</h1>
        <p className="text-slate-400 mb-6">This game doesn't exist or isn't available yet.</p>
        <button onClick={handleExit} className="btn-primary">
          Go Home
        </button>
      </div>
    );
  }

  // Game component not implemented yet
  const GameComponent = GAME_COMPONENTS[gameId];
  if (!GameComponent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">{gameInfo.icon}</div>
        <h1 className="text-xl font-bold mb-2">{gameInfo.name}</h1>
        <p className="text-slate-400 mb-6">Coming soon!</p>
        <button onClick={handleExit} className="btn-primary">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showResults && gameResult ? (
        <motion.div
          key="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ResultsScreen
            result={gameResult}
            gameInfo={gameInfo}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleExit}
          />
        </motion.div>
      ) : (
        <motion.div
          key="game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen"
        >
          <GameComponent
            config={config}
            onComplete={handleComplete}
            onExit={handleExit}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
