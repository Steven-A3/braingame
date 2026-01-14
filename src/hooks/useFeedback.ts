import { useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';
import { playSound, initAudio } from '@/services/audio';
import * as haptics from '@/services/haptics';

type FeedbackType =
  | 'tap'
  | 'correct'
  | 'wrong'
  | 'complete'
  | 'achievement'
  | 'streak'
  | 'countdown'
  | 'levelUp'
  | 'combo'
  | 'selection';

export function useFeedback() {
  const soundEnabled = useUserStore((state) => state.settings.soundEnabled);

  const feedback = useCallback(
    (type: FeedbackType) => {
      // Always try haptics (respects device capability)
      switch (type) {
        case 'tap':
        case 'selection':
          haptics.lightTap();
          break;
        case 'correct':
        case 'combo':
          haptics.selectionVibrate();
          break;
        case 'wrong':
          haptics.errorVibrate();
          break;
        case 'complete':
        case 'levelUp':
          haptics.successVibrate();
          break;
        case 'achievement':
        case 'streak':
          haptics.impactVibrate();
          break;
        case 'countdown':
          haptics.lightTap();
          break;
      }

      // Play sound if enabled
      if (soundEnabled) {
        if (type === 'selection') {
          playSound('tap');
        } else {
          playSound(type);
        }
      }
    },
    [soundEnabled]
  );

  // Convenience methods
  const tap = useCallback(() => feedback('tap'), [feedback]);
  const correct = useCallback(() => feedback('correct'), [feedback]);
  const wrong = useCallback(() => feedback('wrong'), [feedback]);
  const complete = useCallback(() => feedback('complete'), [feedback]);
  const achievement = useCallback(() => feedback('achievement'), [feedback]);
  const streak = useCallback(() => feedback('streak'), [feedback]);
  const countdown = useCallback(() => feedback('countdown'), [feedback]);
  const levelUp = useCallback(() => feedback('levelUp'), [feedback]);
  const combo = useCallback(() => feedback('combo'), [feedback]);
  const selection = useCallback(() => feedback('selection'), [feedback]);

  // Initialize audio context on first interaction
  const init = useCallback(() => {
    initAudio();
  }, []);

  return {
    feedback,
    tap,
    correct,
    wrong,
    complete,
    achievement,
    streak,
    countdown,
    levelUp,
    combo,
    selection,
    init,
  };
}

// Simple hook for just playing sounds (for components that don't need haptics)
export function useSound() {
  const soundEnabled = useUserStore((state) => state.settings.soundEnabled);

  const play = useCallback(
    (
      sound:
        | 'tap'
        | 'correct'
        | 'wrong'
        | 'complete'
        | 'achievement'
        | 'streak'
        | 'countdown'
        | 'levelUp'
        | 'combo'
    ) => {
      if (soundEnabled) {
        playSound(sound);
      }
    },
    [soundEnabled]
  );

  return { play, enabled: soundEnabled };
}
