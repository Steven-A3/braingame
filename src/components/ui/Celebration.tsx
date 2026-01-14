import { useState, useEffect, useCallback } from 'react';
import { Confetti, EmojiBurst, StreakFire, ScorePop } from './Confetti';
import { useFeedback } from '@/hooks/useFeedback';

type CelebrationType =
  | 'gameComplete'
  | 'personalBest'
  | 'achievement'
  | 'streak'
  | 'workoutComplete'
  | 'levelUp';

interface CelebrationState {
  type: CelebrationType | null;
  score?: number;
  streak?: number;
  isPersonalBest?: boolean;
}

interface CelebrationProps {
  celebration: CelebrationState;
  onComplete?: () => void;
}

export function Celebration({ celebration, onComplete }: CelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const feedback = useFeedback();

  useEffect(() => {
    if (!celebration.type) return;

    // Trigger appropriate celebrations based on type
    switch (celebration.type) {
      case 'gameComplete':
        setShowScore(true);
        feedback.complete();
        if (celebration.isPersonalBest) {
          setShowConfetti(true);
          setTimeout(() => feedback.achievement(), 500);
        }
        break;

      case 'personalBest':
        setShowConfetti(true);
        setShowScore(true);
        feedback.achievement();
        break;

      case 'achievement':
        setShowConfetti(true);
        setShowEmoji(true);
        feedback.achievement();
        break;

      case 'streak':
        setShowStreak(true);
        setShowConfetti(true);
        feedback.streak();
        break;

      case 'workoutComplete':
        setShowConfetti(true);
        setShowEmoji(true);
        feedback.complete();
        setTimeout(() => feedback.achievement(), 300);
        break;

      case 'levelUp':
        setShowConfetti(true);
        feedback.levelUp();
        break;
    }

    // Auto-dismiss after animation
    const timeout = setTimeout(() => {
      setShowConfetti(false);
      setShowEmoji(false);
      setShowScore(false);
      setShowStreak(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [celebration, feedback, onComplete]);

  return (
    <>
      <Confetti active={showConfetti} count={celebration.isPersonalBest ? 80 : 50} />
      <EmojiBurst
        active={showEmoji}
        emoji={celebration.type === 'workoutComplete' ? '💪' : '🎉'}
      />
      <ScorePop
        score={celebration.score || 0}
        show={showScore}
        isPersonalBest={celebration.isPersonalBest}
      />
      <StreakFire streak={celebration.streak || 0} show={showStreak} />
    </>
  );
}

// Hook for triggering celebrations
export function useCelebration() {
  const [celebration, setCelebration] = useState<CelebrationState>({ type: null });

  const celebrate = useCallback((type: CelebrationType, options?: Partial<CelebrationState>) => {
    setCelebration({ type, ...options });
  }, []);

  const clear = useCallback(() => {
    setCelebration({ type: null });
  }, []);

  return {
    celebration,
    celebrate,
    clear,
    Celebration: () => <Celebration celebration={celebration} onComplete={clear} />,
  };
}

// Pre-built celebration triggers
export function useGameCompleteCelebration() {
  const { celebrate, Celebration, clear } = useCelebration();

  const triggerGameComplete = useCallback(
    (score: number, isPersonalBest: boolean = false) => {
      celebrate('gameComplete', { score, isPersonalBest });
    },
    [celebrate]
  );

  return { triggerGameComplete, Celebration, clear };
}

export function useStreakCelebration() {
  const { celebrate, Celebration, clear } = useCelebration();

  const triggerStreak = useCallback(
    (streak: number) => {
      if (streak >= 3 && streak % 5 === 0) {
        // Celebrate every 5 days starting from 5
        celebrate('streak', { streak });
      }
    },
    [celebrate]
  );

  return { triggerStreak, Celebration, clear };
}
