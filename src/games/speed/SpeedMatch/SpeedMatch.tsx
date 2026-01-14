import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeedMatchEngine, SpeedMatchState, ShapeType, ColorType } from './SpeedMatchEngine';
import { GameHeader } from '@/components/game/GameHeader';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface SpeedMatchProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

const SHAPE_PATHS: Record<ShapeType, string> = {
  circle: 'M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10',
  square: 'M15,15 L85,15 L85,85 L15,85 Z',
  triangle: 'M50,10 L90,85 L10,85 Z',
  diamond: 'M50,5 L95,50 L50,95 L5,50 Z',
  star: 'M50,5 L61,35 L95,35 L68,57 L79,90 L50,70 L21,90 L32,57 L5,35 L39,35 Z',
  hexagon: 'M50,5 L90,27 L90,73 L50,95 L10,73 L10,27 Z',
};

const COLOR_VALUES: Record<ColorType, string> = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#EAB308',
  purple: '#A855F7',
  orange: '#F97316',
};

export function SpeedMatch({ config, onComplete, onQuit }: SpeedMatchProps) {
  const engineRef = useRef<SpeedMatchEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [matchState, setMatchState] = useState<SpeedMatchState | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize engine
  useEffect(() => {
    const engine = new SpeedMatchEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setMatchState(engine.getGameState());
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
      setMatchState(engine.getGameState());
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

  const handleMatch = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.handleInput('match');
    }
  }, []);

  const handleNoMatch = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.handleInput('no-match');
    }
  }, []);

  if (!isReady || !gameState || !matchState) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Ready screen
  if (gameState.status === 'ready') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <GameHeader
          title="Speed Match"
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
            <h2 className="text-2xl font-bold mb-2">Speed Match</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Does the current shape & position match what you saw{' '}
              <span className="text-primary-400 font-bold">{matchState.nBack} step{matchState.nBack > 1 ? 's' : ''}</span> ago?
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">How to play:</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Watch shapes appear in a 3x3 grid</li>
                <li>• Tap <span className="text-green-400">MATCH</span> if the shape AND position match {matchState.nBack} back</li>
                <li>• Tap <span className="text-red-400">NO MATCH</span> otherwise</li>
                <li>• Be quick! Faster responses = more points</li>
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

  // Main game UI
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title={`${matchState.nBack}-Back`}
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onQuit}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Progress indicator */}
        <div className="w-full max-w-xs mb-4">
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Round {matchState.currentRound}/{matchState.roundsInLevel}</span>
            <span>{matchState.correctInLevel} correct</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500"
              initial={{ width: 0 }}
              animate={{ width: `${(matchState.currentRound / matchState.roundsInLevel) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* N-back indicator */}
        <div className="text-center mb-4">
          <span className="text-sm text-slate-500">Does it match</span>
          <span className="text-lg font-bold text-primary-400 mx-2">{matchState.nBack}</span>
          <span className="text-sm text-slate-500">step{matchState.nBack > 1 ? 's' : ''} ago?</span>
        </div>

        {/* 3x3 Grid */}
        <div className="relative w-64 h-64 mb-8">
          <div className="grid grid-cols-3 gap-2 w-full h-full">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-lg border-2 border-slate-700 flex items-center justify-center"
              >
                <AnimatePresence>
                  {matchState.showingStimulus &&
                   matchState.currentStimulus &&
                   matchState.currentStimulus.position === index && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-14 h-14"
                    >
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path
                          d={SHAPE_PATHS[matchState.currentStimulus.shape]}
                          fill={COLOR_VALUES[matchState.currentStimulus.color]}
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Feedback overlay */}
          <AnimatePresence>
            {matchState.feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`absolute inset-0 flex items-center justify-center rounded-xl ${
                  matchState.feedback === 'correct'
                    ? 'bg-green-500/20'
                    : matchState.feedback === 'incorrect'
                    ? 'bg-red-500/20'
                    : 'bg-yellow-500/20'
                }`}
              >
                <span className="text-4xl">
                  {matchState.feedback === 'correct' ? '✓' :
                   matchState.feedback === 'incorrect' ? '✗' : '⏱'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Response buttons */}
        <div className="flex gap-4 w-full max-w-xs">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleNoMatch}
            disabled={!matchState.waitingForResponse}
            className={`flex-1 py-4 rounded-xl text-lg font-bold transition-colors ${
              matchState.waitingForResponse
                ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50 active:bg-red-500/40'
                : 'bg-slate-800 text-slate-600 border-2 border-slate-700'
            }`}
          >
            NO MATCH
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleMatch}
            disabled={!matchState.waitingForResponse}
            className={`flex-1 py-4 rounded-xl text-lg font-bold transition-colors ${
              matchState.waitingForResponse
                ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50 active:bg-green-500/40'
                : 'bg-slate-800 text-slate-600 border-2 border-slate-700'
            }`}
          >
            MATCH
          </motion.button>
        </div>

        {/* Response time */}
        {matchState.responseTime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-sm text-slate-500"
          >
            Response: {matchState.responseTime}ms
          </motion.div>
        )}
      </div>
    </div>
  );
}
