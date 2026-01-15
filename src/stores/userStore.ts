import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameResult, GameCategory } from '@/games/core/types';
import type { BadgeProgress, Badge } from '@/services/badges';
import { BADGES, calculateBadgeProgress, checkNewBadges } from '@/services/badges';
import { getLevelFromXP } from '@/features/quests/types';

interface UserStats {
  totalGamesPlayed: number;
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: string | null;
  perfectGames: number;
  categoryGames: Record<GameCategory, number>;
}

// Currency and progression
interface UserCurrency {
  coins: number;
  gems: number;
  xp: number;
}

interface UserSettings {
  soundEnabled: boolean;
  reducedMotion: boolean;
  notificationsEnabled: boolean;
}

interface UserState {
  // User profile
  name: string;

  // Onboarding
  hasCompletedOnboarding: boolean;

  // Stats
  stats: UserStats;

  // Game history (last 100 results)
  gameHistory: GameResult[];

  // Today's completion status
  completedToday: boolean;

  // Daily workout
  dailyWorkoutCompleted: boolean;
  dailyWorkoutGames: string[];
  dailyWorkoutProgress: number;

  // Badge system
  earnedBadges: string[];
  badgeProgress: BadgeProgress[];
  newBadges: Badge[];
  hasShared: boolean;
  hasInstalledPWA: boolean;
  playedDates: string[];

  // Settings
  settings: UserSettings;

  // Currency & Progression
  currency: UserCurrency;

  // Actions
  setName: (name: string) => void;
  addCurrency: (coins?: number, gems?: number, xp?: number) => void;
  spendCoins: (amount: number) => boolean;
  spendGems: (amount: number) => boolean;
  getLevel: () => { level: number; currentXP: number; requiredXP: number };
  completeOnboarding: () => void;
  startDailyWorkout: (games: string[]) => void;
  completeDailyWorkoutGame: (gameId: string) => void;
  resetDailyWorkout: () => void;
  recordGameResult: (result: GameResult) => void;
  checkStreak: () => void;
  getStreakStatus: () => {
    current: number;
    isActive: boolean;
    daysUntilLost: number;
  };
  markShared: () => void;
  markPWAInstalled: () => void;
  clearNewBadges: () => void;
  getBadgeProgress: (badgeId: string) => BadgeProgress | undefined;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetAllData: () => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

const initialCategoryGames: Record<GameCategory, number> = {
  memory: 0,
  logic: 0,
  focus: 0,
  calculation: 0,
  language: 0,
  speed: 0,
};

const initialSettings: UserSettings = {
  soundEnabled: true,
  reducedMotion: false,
  notificationsEnabled: false,
};

const initialCurrency: UserCurrency = {
  coins: 0,
  gems: 0,
  xp: 0,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: '',
      hasCompletedOnboarding: false,
      stats: {
        totalGamesPlayed: 0,
        totalScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastPlayDate: null,
        perfectGames: 0,
        categoryGames: { ...initialCategoryGames },
      },
      gameHistory: [],
      completedToday: false,
      dailyWorkoutCompleted: false,
      dailyWorkoutGames: [],
      dailyWorkoutProgress: 0,
      earnedBadges: [],
      badgeProgress: [],
      newBadges: [],
      hasShared: false,
      hasInstalledPWA: false,
      playedDates: [],
      settings: { ...initialSettings },
      currency: { ...initialCurrency },

      setName: (name) => set({ name }),

      addCurrency: (coins = 0, gems = 0, xp = 0) => {
        const state = get();
        set({
          currency: {
            coins: state.currency.coins + coins,
            gems: state.currency.gems + gems,
            xp: state.currency.xp + xp,
          },
        });
      },

      spendCoins: (amount) => {
        const state = get();
        if (state.currency.coins < amount) return false;
        set({
          currency: {
            ...state.currency,
            coins: state.currency.coins - amount,
          },
        });
        return true;
      },

      spendGems: (amount) => {
        const state = get();
        if (state.currency.gems < amount) return false;
        set({
          currency: {
            ...state.currency,
            gems: state.currency.gems - amount,
          },
        });
        return true;
      },

      getLevel: () => {
        const state = get();
        return getLevelFromXP(state.currency.xp);
      },

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      startDailyWorkout: (games) => set({
        dailyWorkoutGames: games,
        dailyWorkoutProgress: 0,
        dailyWorkoutCompleted: false,
      }),

      completeDailyWorkoutGame: (gameId) => {
        const state = get();
        const gameIndex = state.dailyWorkoutGames.indexOf(gameId);
        if (gameIndex === -1) return;

        const newProgress = state.dailyWorkoutProgress + 1;
        const isComplete = newProgress >= state.dailyWorkoutGames.length;

        set({
          dailyWorkoutProgress: newProgress,
          dailyWorkoutCompleted: isComplete,
        });
      },

      resetDailyWorkout: () => set({
        dailyWorkoutGames: [],
        dailyWorkoutProgress: 0,
        dailyWorkoutCompleted: false,
      }),

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

        // Track perfect games (accuracy >= 95%)
        const isPerfect = result.accuracy >= 0.95;
        const newPerfectGames = isPerfect ? state.stats.perfectGames + 1 : state.stats.perfectGames;

        // Track category games
        const newCategoryGames = { ...state.stats.categoryGames };
        newCategoryGames[result.category] = (newCategoryGames[result.category] || 0) + 1;

        // Add to history (keep last 100 results)
        const newHistory = [result, ...state.gameHistory].slice(0, 100);

        // Track played dates (keep unique dates, last 365)
        const newPlayedDates = state.playedDates.includes(today)
          ? state.playedDates
          : [today, ...state.playedDates].slice(0, 365);

        const newStats = {
          totalGamesPlayed: state.stats.totalGamesPlayed + 1,
          totalScore: state.stats.totalScore + result.score,
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastPlayDate: today,
          perfectGames: newPerfectGames,
          categoryGames: newCategoryGames,
        };

        // Calculate badge progress
        const previousProgress = state.badgeProgress;
        const currentProgress = BADGES.map(badge =>
          calculateBadgeProgress(badge, {
            currentStreak: newStreak,
            longestStreak: newLongest,
            totalGamesPlayed: newStats.totalGamesPlayed,
            totalScore: newStats.totalScore,
            perfectGames: newPerfectGames,
            categoryGames: newCategoryGames,
            hasShared: state.hasShared,
            hasInstalledPWA: state.hasInstalledPWA,
            playedDates: newPlayedDates,
          })
        );

        // Check for newly earned badges
        const newlyEarned = checkNewBadges(previousProgress, currentProgress);
        const earnedBadgeIds = currentProgress
          .filter(p => p.earnedAt)
          .map(p => p.badgeId);

        set({
          stats: newStats,
          gameHistory: newHistory,
          completedToday: true,
          playedDates: newPlayedDates,
          badgeProgress: currentProgress,
          earnedBadges: earnedBadgeIds,
          newBadges: newlyEarned.length > 0 ? newlyEarned : state.newBadges,
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

      markShared: () => {
        const state = get();
        if (state.hasShared) return;

        // Recalculate badge progress with shared status
        const newProgress = BADGES.map(badge =>
          calculateBadgeProgress(badge, {
            currentStreak: state.stats.currentStreak,
            longestStreak: state.stats.longestStreak,
            totalGamesPlayed: state.stats.totalGamesPlayed,
            totalScore: state.stats.totalScore,
            perfectGames: state.stats.perfectGames,
            categoryGames: state.stats.categoryGames,
            hasShared: true,
            hasInstalledPWA: state.hasInstalledPWA,
            playedDates: state.playedDates,
          })
        );

        const newlyEarned = checkNewBadges(state.badgeProgress, newProgress);
        const earnedBadgeIds = newProgress
          .filter(p => p.earnedAt)
          .map(p => p.badgeId);

        set({
          hasShared: true,
          badgeProgress: newProgress,
          earnedBadges: earnedBadgeIds,
          newBadges: newlyEarned.length > 0 ? newlyEarned : state.newBadges,
        });
      },

      markPWAInstalled: () => {
        const state = get();
        if (state.hasInstalledPWA) return;

        // Recalculate badge progress with PWA installed status
        const newProgress = BADGES.map(badge =>
          calculateBadgeProgress(badge, {
            currentStreak: state.stats.currentStreak,
            longestStreak: state.stats.longestStreak,
            totalGamesPlayed: state.stats.totalGamesPlayed,
            totalScore: state.stats.totalScore,
            perfectGames: state.stats.perfectGames,
            categoryGames: state.stats.categoryGames,
            hasShared: state.hasShared,
            hasInstalledPWA: true,
            playedDates: state.playedDates,
          })
        );

        const newlyEarned = checkNewBadges(state.badgeProgress, newProgress);
        const earnedBadgeIds = newProgress
          .filter(p => p.earnedAt)
          .map(p => p.badgeId);

        set({
          hasInstalledPWA: true,
          badgeProgress: newProgress,
          earnedBadges: earnedBadgeIds,
          newBadges: newlyEarned.length > 0 ? newlyEarned : state.newBadges,
        });
      },

      clearNewBadges: () => set({ newBadges: [] }),

      getBadgeProgress: (badgeId) => {
        const state = get();
        return state.badgeProgress.find(p => p.badgeId === badgeId);
      },

      updateSettings: (newSettings) => {
        const state = get();
        set({
          settings: { ...state.settings, ...newSettings },
        });
      },

      resetAllData: () => {
        set({
          name: '',
          hasCompletedOnboarding: false,
          stats: {
            totalGamesPlayed: 0,
            totalScore: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastPlayDate: null,
            perfectGames: 0,
            categoryGames: { ...initialCategoryGames },
          },
          gameHistory: [],
          completedToday: false,
          dailyWorkoutCompleted: false,
          dailyWorkoutGames: [],
          dailyWorkoutProgress: 0,
          earnedBadges: [],
          badgeProgress: [],
          newBadges: [],
          hasShared: false,
          hasInstalledPWA: false,
          playedDates: [],
          settings: { ...initialSettings },
          currency: { ...initialCurrency },
        });
      },
    }),
    {
      name: 'daily-brain-user',
      version: 5,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as UserState;
        if (version < 2) {
          // Migrate from version 1 to 2 - add new badge fields
          return {
            ...state,
            earnedBadges: [],
            badgeProgress: [],
            newBadges: [],
            hasShared: false,
            hasInstalledPWA: false,
            playedDates: [],
            stats: {
              ...state.stats,
              perfectGames: 0,
              categoryGames: { ...initialCategoryGames },
            },
          };
        }
        if (version < 3) {
          // Migrate to version 3 - add onboarding and daily workout
          return {
            ...state,
            hasCompletedOnboarding: state.stats?.totalGamesPlayed > 0, // Existing users skip onboarding
            dailyWorkoutCompleted: false,
            dailyWorkoutGames: [],
            dailyWorkoutProgress: 0,
          };
        }
        if (version < 4) {
          // Migrate to version 4 - add settings
          return {
            ...state,
            settings: { ...initialSettings },
          };
        }
        if (version < 5) {
          // Migrate to version 5 - add currency
          // Give existing users starter coins based on their progress
          const bonusCoins = Math.min(state.stats?.totalGamesPlayed || 0, 100) * 5;
          return {
            ...state,
            currency: {
              coins: bonusCoins,
              gems: 0,
              xp: (state.stats?.totalGamesPlayed || 0) * 10,
            },
          };
        }
        return state;
      },
    }
  )
);

function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}
