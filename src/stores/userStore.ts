import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameResult } from '@/games/core/types';

interface UserStats {
  totalGamesPlayed: number;
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: string | null;
}

interface UserState {
  // User profile
  name: string;

  // Stats
  stats: UserStats;

  // Game history (last 30 days)
  gameHistory: GameResult[];

  // Today's completion status
  completedToday: boolean;

  // Actions
  setName: (name: string) => void;
  recordGameResult: (result: GameResult) => void;
  checkStreak: () => void;
  getStreakStatus: () => {
    current: number;
    isActive: boolean;
    daysUntilLost: number;
  };
}

const getToday = () => new Date().toISOString().split('T')[0];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: '',
      stats: {
        totalGamesPlayed: 0,
        totalScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastPlayDate: null,
      },
      gameHistory: [],
      completedToday: false,

      setName: (name) => set({ name }),

      recordGameResult: (result) => {
        const state = get();
        const today = getToday();
        const lastPlayDate = state.stats.lastPlayDate;

        // Calculate streak
        let newStreak = state.stats.currentStreak;

        if (lastPlayDate === today) {
          // Already played today, no streak change
        } else if (lastPlayDate === getYesterday()) {
          // Consecutive day - increment streak
          newStreak += 1;
        } else if (!lastPlayDate) {
          // First time playing
          newStreak = 1;
        } else {
          // Streak broken - start fresh
          newStreak = 1;
        }

        const newLongest = Math.max(state.stats.longestStreak, newStreak);

        // Add to history (keep last 100 results)
        const newHistory = [result, ...state.gameHistory].slice(0, 100);

        set({
          stats: {
            totalGamesPlayed: state.stats.totalGamesPlayed + 1,
            totalScore: state.stats.totalScore + result.score,
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastPlayDate: today,
          },
          gameHistory: newHistory,
          completedToday: true,
        });
      },

      checkStreak: () => {
        const state = get();
        const today = getToday();
        const yesterday = getYesterday();
        const lastPlayDate = state.stats.lastPlayDate;

        // Check if streak should be reset
        if (lastPlayDate && lastPlayDate !== today && lastPlayDate !== yesterday) {
          // Streak broken
          set({
            stats: {
              ...state.stats,
              currentStreak: 0,
            },
          });
        }

        // Update completedToday
        set({
          completedToday: lastPlayDate === today,
        });
      },

      getStreakStatus: () => {
        const state = get();
        const today = getToday();
        const lastPlayDate = state.stats.lastPlayDate;

        const isActive = lastPlayDate === today;
        const current = state.stats.currentStreak;

        // Calculate days until streak is lost
        let daysUntilLost = 0;
        if (lastPlayDate === today) {
          daysUntilLost = 2; // Today + tomorrow
        } else if (lastPlayDate === getYesterday()) {
          daysUntilLost = 1; // Must play today
        }

        return { current, isActive, daysUntilLost };
      },
    }),
    {
      name: 'daily-brain-user',
      version: 1,
    }
  )
);

function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}
