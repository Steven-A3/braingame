import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ReflexTapEngine } from './ReflexTapEngine';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';
import { GameHeader } from '@/components/game/GameHeader';

interface ReflexTapProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onExit: () => void;
}

export function ReflexTap({ config, onComplete, onExit }: ReflexTapProps) {
  const engineRef = useRef<ReflexTapEngine | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [target, setTarget] = useState<ReturnType<ReflexTapEngine['getCurrentTarget']>>(null);
  const [waiting, setWaiting] = useState(false);
  const [progress, setProgress] = useState({ current: 1, total: 8 });
  const [avgReactionTime, setAvgReactionTime] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'early' | null>(null);
  const [instruction, setInstruction] = useState<string>('');

  // Initialize engine
  useEffect(() => {
    const engine = new ReflexTapEngine(config);
    engineRef.current = engine;

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        if (engineRef.current) {
          setTarget(engineRef.current.getCurrentTarget());
          setWaiting(engineRef.current.isWaitingForTarget());
          setProgress(engineRef.current.getTrialProgress());
          setAvgReactionTime(engineRef.current.getAverageReactionTime());
        }
      },
      onComplete: (result) => onComplete(result),
    });

    engine.init().then(() => {
      engine.start();
    });

    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      engineRef.current = null;
    };
  }, [config, onComplete]);

  // Handle delay and target showing
  useEffect(() => {
    if (!engineRef.current || gameState?.status !== 'playing') return;

    if (waiting) {
      setInstruction('Wait for it...');
      const delay = engineRef.current.getRandomDelay();
      delayTimerRef.current = setTimeout(() => {
        engineRef.current?.showTarget();
      }, delay);
    } else if (target) {
      setInstruction(target.isGo ? 'TAP!' : 'DON\'T TAP!');
      const timeout = engineRef.current.getTargetTimeout();
      timeoutTimerRef.current = setTimeout(() => {
        engineRef.current?.handleTimeout();
      }, timeout);
    }

    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, [waiting, target, gameState?.status]);

  const handleTap = useCallback(() => {
    if (!engineRef.current || gameState?.status !== 'playing') return;

    if (waiting) {
      // Tapped too early!
      setFeedback('early');
      engineRef.current.handleInput(true);
    } else if (target) {
      if (target.isGo) {
        setFeedback('correct');
      } else {
        setFeedback('wrong');
      }
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      engineRef.current.handleInput(true);
    }

    setTimeout(() => setFeedback(null), 300);
  }, [waiting, target, gameState?.status]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Reflex Tap"
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onExit}
      />

      {/* Tap area */}
      <div
        className={clsx(
          'flex-1 relative select-none',
          'flex flex-col items-center justify-center',
          feedback === 'correct' && 'bg-green-500/10',
          feedback === 'wrong' && 'bg-red-500/10',
          feedback === 'early' && 'bg-yellow-500/10'
        )}
        onClick={handleTap}
      >
        {/* Instruction */}
        <motion.div
          key={instruction}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'text-2xl font-bold mb-8',
            target?.isGo === true && 'text-green-400',
            target?.isGo === false && 'text-red-400',
            waiting && 'text-slate-400'
          )}
        >
          {instruction}
        </motion.div>

        {/* Target */}
        <AnimatePresence>
          {target && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute rounded-full shadow-lg"
              style={{
                width: target.size,
                height: target.size,
                left: `calc(${target.x * 100}% - ${target.size / 2}px)`,
                top: `calc(${target.y * 100}% - ${target.size / 2}px)`,
                backgroundColor: target.color,
                boxShadow: `0 0 20px ${target.color}`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Waiting indicator */}
        {waiting && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-4 h-4 rounded-full bg-slate-500"
          />
        )}

        {/* Stats */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-sm text-slate-400">
          <div>
            Trial: {progress.current}/{progress.total}
          </div>
          {avgReactionTime > 0 && (
            <div>
              Avg: {avgReactionTime}ms
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-400">Tap</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-400">Don't tap</span>
          </div>
        </div>
      </div>
    </div>
  );
}
