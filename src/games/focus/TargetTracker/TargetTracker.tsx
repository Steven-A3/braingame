import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { TargetTrackerEngine, TargetTrackerState, Ball } from './TargetTrackerEngine';
import { GameHeader } from '@/components/game/GameHeader';
import { useGameFeedback } from '@/hooks/useGameFeedback';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface TargetTrackerProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

export function TargetTracker({ config, onComplete, onQuit }: TargetTrackerProps) {
  const engineRef = useRef<TargetTrackerEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [trackerState, setTrackerState] = useState<TargetTrackerState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const feedback = useGameFeedback();

  useEffect(() => {
    const engine = new TargetTrackerEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setTrackerState(engine.getGameState());
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
      setTrackerState(engine.getGameState());
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

  const handleBallClick = useCallback((ballId: number) => {
    if (engineRef.current) {
      const state = engineRef.current.getGameState();
      const ball = state?.balls.find(b => b.id === ballId);
      if (ball?.isTarget) {
        feedback.correct();
      } else {
        feedback.wrong();
      }
      engineRef.current.handleInput(ballId);
    }
  }, [feedback]);

  if (!isReady || !gameState || !trackerState) {
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
          title="Target Tracker"
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
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2">Target Tracker</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Track the highlighted balls as they move around! Test your divided attention.
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">How to play:</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Watch which balls light up (targets)</li>
                <li>• Track them as all balls start moving</li>
                <li>• When balls stop, tap the targets</li>
                <li>• Find all targets to score!</li>
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

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Target Tracker"
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
          <div className="text-sm text-slate-400 mb-1">
            Round {trackerState.currentRound}/{trackerState.roundsInLevel}
          </div>
          <div className={`text-lg font-bold ${
            trackerState.phase === 'highlight' ? 'text-yellow-400' :
            trackerState.phase === 'tracking' ? 'text-blue-400' :
            trackerState.phase === 'select' ? 'text-green-400' :
            'text-white'
          }`}>
            {trackerState.phase === 'highlight' && `Watch the targets! (${trackerState.targetCount})`}
            {trackerState.phase === 'tracking' && 'Track the targets...'}
            {trackerState.phase === 'select' && `Tap the targets (${trackerState.selectionsRemaining} left)`}
            {trackerState.phase === 'feedback' && (
              trackerState.correctSelections === trackerState.targetCount
                ? '✓ Perfect!'
                : `${trackerState.correctSelections}/${trackerState.targetCount} correct`
            )}
          </div>
        </div>

        {/* Game area */}
        <div className="relative w-[300px] h-[300px] bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700">
          {trackerState.balls.map((ball) => (
            <TrackerBall
              key={ball.id}
              ball={ball}
              phase={trackerState.phase}
              onClick={() => handleBallClick(ball.id)}
            />
          ))}
        </div>

        {/* Feedback scores */}
        {trackerState.phase === 'feedback' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <div className={`text-2xl font-bold ${
              trackerState.correctSelections === trackerState.targetCount
                ? 'text-green-400'
                : trackerState.correctSelections > 0
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}>
              {trackerState.correctSelections === trackerState.targetCount && '🎯 Perfect tracking!'}
              {trackerState.correctSelections > 0 && trackerState.correctSelections < trackerState.targetCount && '🎯 Good job!'}
              {trackerState.correctSelections === 0 && '😅 Keep practicing!'}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface TrackerBallProps {
  ball: Ball;
  phase: string;
  onClick: () => void;
}

function TrackerBall({ ball, phase, onClick }: TrackerBallProps) {
  const showAsTarget = phase === 'highlight' && ball.isTarget;
  const showAsSelected = ball.isSelected;
  const showResult = phase === 'feedback';
  const canClick = phase === 'select' && !ball.isSelected;

  let bgColor = 'bg-slate-600';
  let borderColor = 'border-slate-500';

  if (showAsTarget) {
    bgColor = 'bg-yellow-500';
    borderColor = 'border-yellow-400';
  } else if (showResult && ball.isSelected) {
    if (ball.isTarget) {
      bgColor = 'bg-green-500';
      borderColor = 'border-green-400';
    } else {
      bgColor = 'bg-red-500';
      borderColor = 'border-red-400';
    }
  } else if (showResult && ball.isTarget && !ball.isSelected) {
    bgColor = 'bg-yellow-500/50';
    borderColor = 'border-yellow-400/50';
  } else if (showAsSelected) {
    bgColor = 'bg-primary-500';
    borderColor = 'border-primary-400';
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={!canClick}
      className={`absolute w-10 h-10 rounded-full border-2 transition-colors ${bgColor} ${borderColor} ${
        canClick ? 'cursor-pointer hover:scale-110' : 'cursor-default'
      }`}
      style={{
        left: ball.x - 20,
        top: ball.y - 20,
      }}
      whileTap={canClick ? { scale: 0.9 } : undefined}
    >
      {showResult && ball.isTarget && (
        <span className="text-white text-lg">
          {ball.isSelected ? '✓' : '!'}
        </span>
      )}
    </motion.button>
  );
}
