import { useState, useEffect, useCallback } from 'react';
import {
  initA2HS,
  getA2HSState,
  subscribeA2HS,
  showInstallPrompt,
  shouldShowInstallPrompt,
  isIOSDevice,
  isStandalone,
} from '@/services/a2hs';
import { useUserStore } from '@/stores/userStore';

interface UseA2HSResult {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  shouldPrompt: boolean;
  showPrompt: () => Promise<boolean>;
  dismissPrompt: () => void;
}

// Track session start time
const sessionStart = Date.now();

export function useA2HS(): UseA2HSResult {
  const [state, setState] = useState(getA2HSState());
  const [dismissed, setDismissed] = useState(false);
  const { stats, playedDates, markPWAInstalled } = useUserStore();

  // Initialize A2HS on mount
  useEffect(() => {
    initA2HS();

    // Subscribe to state changes
    const unsubscribe = subscribeA2HS(() => {
      setState(getA2HSState());
    });

    // Check if already standalone
    if (isStandalone()) {
      markPWAInstalled();
    }

    return unsubscribe;
  }, [markPWAInstalled]);

  // Calculate if we should show prompt
  const shouldPrompt = !dismissed && shouldShowInstallPrompt({
    totalGamesPlayed: stats.totalGamesPlayed,
    currentStreak: stats.currentStreak,
    daysVisited: playedDates.length,
    sessionDuration: Date.now() - sessionStart,
  });

  const showPrompt = useCallback(async () => {
    const result = await showInstallPrompt();
    if (result) {
      markPWAInstalled();
    }
    return result;
  }, [markPWAInstalled]);

  const dismissPrompt = useCallback(() => {
    setDismissed(true);
    // Store dismissal in localStorage to not show again this session
    try {
      localStorage.setItem('a2hs-dismissed', Date.now().toString());
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Check if previously dismissed recently
  useEffect(() => {
    try {
      const dismissedAt = localStorage.getItem('a2hs-dismissed');
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        // Don't show again for 7 days
        if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
          setDismissed(true);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  return {
    isInstallable: state.isInstallable,
    isInstalled: state.isInstalled,
    isIOS: isIOSDevice(),
    shouldPrompt,
    showPrompt,
    dismissPrompt,
  };
}
