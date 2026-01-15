import { useCallback, useRef } from 'react';
import { useFeedback } from './useFeedback';

/**
 * Game-specific feedback hook with additional game helpers
 * Provides correct/wrong feedback with debouncing to prevent spam
 */
export function useGameFeedback() {
  const feedback = useFeedback();
  const lastFeedbackRef = useRef<number>(0);
  const comboCountRef = useRef<number>(0);

  // Debounce feedback to prevent spam (min 50ms between sounds)
  const debounce = useCallback((fn: () => void) => {
    const now = Date.now();
    if (now - lastFeedbackRef.current > 50) {
      lastFeedbackRef.current = now;
      fn();
    }
  }, []);

  // Called when player gets a correct answer
  const correct = useCallback(() => {
    debounce(() => {
      comboCountRef.current += 1;
      // Play combo sound for streaks of 3+
      if (comboCountRef.current >= 3 && comboCountRef.current % 3 === 0) {
        feedback.combo();
      } else {
        feedback.correct();
      }
    });
  }, [feedback, debounce]);

  // Called when player gets a wrong answer
  const wrong = useCallback(() => {
    debounce(() => {
      comboCountRef.current = 0; // Reset combo
      feedback.wrong();
    });
  }, [feedback, debounce]);

  // Called on button/tile tap
  const tap = useCallback(() => {
    debounce(feedback.tap);
  }, [feedback, debounce]);

  // Called when timer is running low (< 3 seconds)
  const timerWarning = useCallback(() => {
    feedback.countdown();
  }, [feedback]);

  // Called when player completes a level
  const levelComplete = useCallback(() => {
    comboCountRef.current = 0;
    feedback.levelUp();
  }, [feedback]);

  // Reset combo counter (call when starting new level)
  const resetCombo = useCallback(() => {
    comboCountRef.current = 0;
  }, []);

  return {
    correct,
    wrong,
    tap,
    timerWarning,
    levelComplete,
    resetCombo,
    // Pass through original feedback methods
    achievement: feedback.achievement,
    complete: feedback.complete,
    streak: feedback.streak,
  };
}
