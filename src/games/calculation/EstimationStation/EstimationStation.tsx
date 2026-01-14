import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EstimationStationEngine, EstimationStationState } from './EstimationStationEngine';
import { GameHeader } from '@/components/game/GameHeader';
import type { GameConfig, GameState, GameResult } from '@/games/core/types';

interface EstimationStationProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

export function EstimationStation({ config, onComplete, onQuit }: EstimationStationProps) {
  const engineRef = useRef<EstimationStationEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [estimationState, setEstimationState] = useState<EstimationStationState | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize engine
  useEffect(() => {
    const engine = new EstimationStationEngine(config);

    engine.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        setEstimationState(engine.getGameState());
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
      setEstimationState(engine.getGameState());
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

  const handleAnswer = useCallback((answer: number) => {
    if (engineRef.current) {
      engineRef.current.handleInput(answer);
    }
  }, []);

  if (!isReady || !gameState || !estimationState) {
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
          title="Estimation Station"
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
            <h2 className="text-2xl font-bold mb-2">Estimation Station</h2>
            <p className="text-slate-400 mb-6 max-w-xs">
              Quickly estimate the answer! You don't need exact math - trust your instincts.
            </p>

            <div className="card mb-6 text-left">
              <h3 className="font-semibold mb-2">How to play:</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• See a math expression</li>
                <li>• Pick the closest answer</li>
                <li>• Exact answers = bonus points!</li>
                <li>• Speed matters - faster = more points</li>
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
  const timerPercent = (estimationState.timeRemaining / estimationState.totalTime) * 100;
  const timerColor = timerPercent > 50 ? 'bg-primary-500' : timerPercent > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <GameHeader
        title="Estimation Station"
        level={gameState.level}
        maxLevel={gameState.maxLevel}
        score={gameState.score}
        lives={gameState.lives}
        maxLives={gameState.maxLives}
        onExit={onQuit}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Progress */}
        <div className="w-full max-w-sm mb-4">
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Question {estimationState.questionIndex + 1}/{estimationState.questionsInLevel}</span>
            <span>{estimationState.correctAnswers} correct</span>
          </div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-slate-500"
              animate={{ width: `${((estimationState.questionIndex) / estimationState.questionsInLevel) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer bar */}
        <div className="w-full max-w-sm mb-6">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${timerColor} transition-colors`}
              animate={{ width: `${timerPercent}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="text-center text-sm text-slate-500 mt-1">
            {estimationState.timeRemaining.toFixed(1)}s
          </div>
        </div>

        {/* Streak indicator */}
        {estimationState.streak > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-bold"
          >
            🔥 {estimationState.streak} streak!
          </motion.div>
        )}

        {/* Expression display */}
        <AnimatePresence mode="wait">
          {estimationState.currentQuestion && (
            <motion.div
              key={estimationState.questionIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="mb-8"
            >
              <div className="bg-slate-800 rounded-2xl px-8 py-6 border-2 border-slate-700">
                <div className="text-4xl font-bold text-center tracking-wider">
                  {estimationState.currentQuestion.expression}
                </div>
                <div className="text-center text-slate-500 mt-2">= ?</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer options */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {estimationState.currentQuestion?.options.map((option, index) => (
            <motion.button
              key={`${estimationState.questionIndex}-${option}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(option)}
              disabled={!!estimationState.feedback}
              className={`py-4 px-6 rounded-xl text-2xl font-bold transition-all ${
                estimationState.feedback
                  ? option === estimationState.currentQuestion?.actualAnswer
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-700 text-slate-500'
                  : 'bg-slate-700 hover:bg-slate-600 active:bg-slate-500'
              }`}
            >
              {option.toLocaleString()}
            </motion.button>
          ))}
        </div>

        {/* Feedback overlay */}
        <AnimatePresence>
          {estimationState.feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-center"
            >
              <div className={`text-2xl font-bold ${
                estimationState.feedback === 'correct' ? 'text-green-400' :
                estimationState.feedback === 'close' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {estimationState.feedback === 'correct' && '✓ Correct!'}
                {estimationState.feedback === 'close' && '≈ Close enough!'}
                {estimationState.feedback === 'wrong' && '✗ Wrong!'}
              </div>
              {estimationState.currentQuestion && estimationState.feedback !== 'correct' && (
                <div className="text-sm text-slate-400 mt-1">
                  Answer: {estimationState.currentQuestion.actualAnswer.toLocaleString()}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
