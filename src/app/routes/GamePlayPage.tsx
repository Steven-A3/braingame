import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getGameInfo } from '@/games/registry';
import { calculateDifficulty } from '@/games/core/DifficultySystem';
import { getGameSeed } from '@/games/core/SeededRNG';
import { useUserStore } from '@/stores/userStore';
import type { GameConfig, GameResult } from '@/games/core/types';
import { ResultsScreen } from '@/components/game/ResultsScreen';

// Game components (lazy loaded in production, direct imports for simplicity)
// Memory
import { PatternEcho } from '@/games/memory/PatternEcho';
import { CardFlip } from '@/games/memory/CardFlip';
import { SpatialRecall } from '@/games/memory/SpatialRecall';
import { NumberMemory } from '@/games/memory/NumberMemory';
// Logic
import { GridDeduction } from '@/games/logic/GridDeduction';
import { SequenceSolver } from '@/games/logic/SequenceSolver';
import { SetFinder } from '@/games/logic/SetFinder';
// Focus
import { ColorStroop } from '@/games/focus/ColorStroop';
import { TargetTracker } from '@/games/focus/TargetTracker';
import { VisualSearch } from '@/games/focus/VisualSearch';
// Calculation
import { MathSprint } from '@/games/calculation/MathSprint';
import { EstimationStation } from '@/games/calculation/EstimationStation';
import { NumberChain } from '@/games/calculation/NumberChain';
import { FractionMatch } from '@/games/calculation/FractionMatch';
// Language
import { WordMorph } from '@/games/language/WordMorph';
import { AnagramBlitz } from '@/games/language/AnagramBlitz';
import { WordCategories } from '@/games/language/WordCategories';
// Speed
import { ReflexTap } from '@/games/speed/ReflexTap';
import { SpeedMatch } from '@/games/speed/SpeedMatch';
import { SymbolSprint } from '@/games/speed/SymbolSprint';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GAME_COMPONENTS: Record<string, React.ComponentType<any>> = {
  // Memory
  'pattern-echo': PatternEcho,
  'card-flip': CardFlip,
  'spatial-recall': SpatialRecall,
  'number-memory': NumberMemory,
  // Logic
  'grid-deduction': GridDeduction,
  'sequence-solver': SequenceSolver,
  'set-finder': SetFinder,
  // Focus
  'color-stroop': ColorStroop,
  'target-tracker': TargetTracker,
  'visual-search': VisualSearch,
  // Calculation
  'math-sprint': MathSprint,
  'estimation-station': EstimationStation,
  'number-chain': NumberChain,
  'fraction-match': FractionMatch,
  // Language
  'word-morph': WordMorph,
  'anagram-blitz': AnagramBlitz,
  'word-categories': WordCategories,
  // Speed
  'reflex-tap': ReflexTap,
  'speed-match': SpeedMatch,
  'symbol-sprint': SymbolSprint,
};

export function GamePlayPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWorkout = searchParams.get('workout') === 'true';

  const recordGameResult = useUserStore((state) => state.recordGameResult);
  const completeDailyWorkoutGame = useUserStore((state) => state.completeDailyWorkoutGame);

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

    // Track workout progress if in workout mode
    if (isWorkout && gameId) {
      completeDailyWorkoutGame(gameId);
    }
  }, [recordGameResult, isWorkout, gameId, completeDailyWorkoutGame]);

  const handleExit = useCallback(() => {
    if (isWorkout) {
      navigate('/workout');
    } else {
      navigate('/');
    }
  }, [navigate, isWorkout]);

  const handlePlayAgain = useCallback(() => {
    // In workout mode, go back to workout instead of playing again
    if (isWorkout) {
      navigate('/workout');
    } else {
      setShowResults(false);
      setGameResult(null);
    }
  }, [isWorkout, navigate]);

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
            onQuit={handleExit}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
