import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Quest, QuestProgress } from './types';
import type { GameCategory, GameResult } from '@/games/core/types';
import { generateDailyQuests, shouldRegenerateQuests } from './questGenerator';
import { useUserStore } from '@/stores/userStore';

interface QuestState {
  // Current quests
  quests: Quest[];

  // Today's progress tracking
  todayProgress: QuestProgress;

  // Last generation date
  lastGenerationDate: string | null;

  // Pending rewards to show
  pendingRewards: Quest[];

  // Actions
  initializeQuests: () => void;
  updateQuestProgress: (result: GameResult) => void;
  markWorkoutComplete: () => void;
  claimReward: (questId: string) => void;
  claimAllRewards: () => void;
  clearPendingRewards: () => void;
  getCompletedQuests: () => Quest[];
  getActiveQuests: () => Quest[];
  getTotalRewards: () => { coins: number; xp: number; gems: number };
}

const getToday = () => new Date().toISOString().split('T')[0];

const initialProgress: QuestProgress = {
  gamesPlayed: 0,
  gamesPlayedByCategory: {
    memory: 0,
    logic: 0,
    focus: 0,
    calculation: 0,
    language: 0,
    speed: 0,
  },
  totalScore: 0,
  perfectGames: 0,
  workoutsCompleted: 0,
  categoriesPlayed: new Set(),
  highScoresBeat: 0,
  maxCombo: 0,
  fastestGame: Infinity,
  maxLevelReached: 0,
};

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      quests: [],
      todayProgress: { ...initialProgress, categoriesPlayed: new Set() },
      lastGenerationDate: null,
      pendingRewards: [],

      initializeQuests: () => {
        const state = get();
        const today = getToday();

        // Check if we need to generate new quests
        if (state.lastGenerationDate !== today || shouldRegenerateQuests(state.quests)) {
          const userStore = useUserStore.getState();
          const userLevel = userStore.getLevel().level;
          const newQuests = generateDailyQuests(undefined, userLevel);

          set({
            quests: newQuests,
            lastGenerationDate: today,
            todayProgress: { ...initialProgress, categoriesPlayed: new Set() },
            pendingRewards: [],
          });
        }
      },

      updateQuestProgress: (result: GameResult) => {
        const state = get();
        const userStore = useUserStore.getState();

        // Update today's progress
        const newCategoriesPlayed = new Set(state.todayProgress.categoriesPlayed);
        newCategoriesPlayed.add(result.category);

        const newGamesPlayedByCategory = { ...state.todayProgress.gamesPlayedByCategory };
        newGamesPlayedByCategory[result.category] = (newGamesPlayedByCategory[result.category] || 0) + 1;

        // Check for high score beat
        const previousBest = userStore.gameHistory
          .filter((r) => r.gameId === result.gameId)
          .reduce((max, r) => Math.max(max, r.score), 0);
        const beatHighScore = result.score > previousBest && previousBest > 0;

        const newProgress: QuestProgress = {
          gamesPlayed: state.todayProgress.gamesPlayed + 1,
          gamesPlayedByCategory: newGamesPlayedByCategory,
          totalScore: state.todayProgress.totalScore + result.score,
          perfectGames: state.todayProgress.perfectGames + (result.accuracy >= 0.95 ? 1 : 0),
          workoutsCompleted: state.todayProgress.workoutsCompleted,
          categoriesPlayed: newCategoriesPlayed,
          highScoresBeat: state.todayProgress.highScoresBeat + (beatHighScore ? 1 : 0),
          maxCombo: Math.max(state.todayProgress.maxCombo, result.levelsCompleted),
          fastestGame: Math.min(state.todayProgress.fastestGame, result.duration),
          maxLevelReached: Math.max(state.todayProgress.maxLevelReached, result.levelsCompleted),
        };

        // Update quest progress
        const updatedQuests = state.quests.map((quest) => {
          if (quest.completed) return quest;

          let newQuestProgress = quest.progress;

          switch (quest.requirement.type) {
            case 'games_played':
              newQuestProgress = newProgress.gamesPlayed;
              break;
            case 'total_score':
              newQuestProgress = newProgress.totalScore;
              break;
            case 'accuracy':
              if (result.accuracy * 100 >= quest.requirement.target) {
                newQuestProgress = quest.target;
              }
              break;
            case 'category_games':
              if (quest.requirement.category === result.category) {
                newQuestProgress = newGamesPlayedByCategory[result.category] || 0;
              }
              break;
            case 'category_variety':
              newQuestProgress = newCategoriesPlayed.size;
              break;
            case 'perfect_game':
              if (result.accuracy >= 0.95) {
                newQuestProgress = newProgress.perfectGames;
              }
              break;
            case 'high_score':
              if (beatHighScore) {
                newQuestProgress = newProgress.highScoresBeat;
              }
              break;
            case 'level_reach':
              newQuestProgress = Math.max(newQuestProgress, result.levelsCompleted);
              break;
          }

          const isNowCompleted = newQuestProgress >= quest.target;

          return {
            ...quest,
            progress: Math.min(newQuestProgress, quest.target),
            completed: isNowCompleted,
          };
        });

        // Find newly completed quests
        const newlyCompleted = updatedQuests.filter(
          (q) => q.completed && !q.claimed && !state.quests.find((sq) => sq.id === q.id)?.completed
        );

        set({
          quests: updatedQuests,
          todayProgress: newProgress,
          pendingRewards: [...state.pendingRewards, ...newlyCompleted],
        });
      },

      markWorkoutComplete: () => {
        const state = get();

        const newProgress = {
          ...state.todayProgress,
          workoutsCompleted: state.todayProgress.workoutsCompleted + 1,
        };

        const updatedQuests = state.quests.map((quest) => {
          if (quest.completed || quest.requirement.type !== 'workout_complete') return quest;

          const isNowCompleted = newProgress.workoutsCompleted >= quest.target;

          return {
            ...quest,
            progress: newProgress.workoutsCompleted,
            completed: isNowCompleted,
          };
        });

        const newlyCompleted = updatedQuests.filter(
          (q) => q.completed && !q.claimed && !state.quests.find((sq) => sq.id === q.id)?.completed
        );

        set({
          quests: updatedQuests,
          todayProgress: newProgress,
          pendingRewards: [...state.pendingRewards, ...newlyCompleted],
        });
      },

      claimReward: (questId: string) => {
        const state = get();
        const quest = state.quests.find((q) => q.id === questId);

        if (!quest || !quest.completed || quest.claimed) return;

        // Add rewards to user store
        const userStore = useUserStore.getState();
        userStore.addCurrency(
          quest.reward.coins,
          quest.reward.gems || 0,
          quest.reward.xp
        );

        // Mark as claimed
        const updatedQuests = state.quests.map((q) =>
          q.id === questId ? { ...q, claimed: true } : q
        );

        // Remove from pending
        const updatedPending = state.pendingRewards.filter((q) => q.id !== questId);

        set({
          quests: updatedQuests,
          pendingRewards: updatedPending,
        });
      },

      claimAllRewards: () => {
        const state = get();
        const userStore = useUserStore.getState();

        // Calculate total rewards
        let totalCoins = 0;
        let totalGems = 0;
        let totalXP = 0;

        const updatedQuests = state.quests.map((quest) => {
          if (quest.completed && !quest.claimed) {
            totalCoins += quest.reward.coins;
            totalGems += quest.reward.gems || 0;
            totalXP += quest.reward.xp;
            return { ...quest, claimed: true };
          }
          return quest;
        });

        // Add all rewards at once
        if (totalCoins > 0 || totalGems > 0 || totalXP > 0) {
          userStore.addCurrency(totalCoins, totalGems, totalXP);
        }

        set({
          quests: updatedQuests,
          pendingRewards: [],
        });
      },

      clearPendingRewards: () => set({ pendingRewards: [] }),

      getCompletedQuests: () => {
        return get().quests.filter((q) => q.completed);
      },

      getActiveQuests: () => {
        return get().quests.filter((q) => !q.completed);
      },

      getTotalRewards: () => {
        const completedUnclaimed = get().quests.filter((q) => q.completed && !q.claimed);
        return completedUnclaimed.reduce(
          (acc, q) => ({
            coins: acc.coins + q.reward.coins,
            xp: acc.xp + q.reward.xp,
            gems: acc.gems + (q.reward.gems || 0),
          }),
          { coins: 0, xp: 0, gems: 0 }
        );
      },
    }),
    {
      name: 'daily-brain-quests',
      version: 1,
      // Custom serialization to handle Set
      partialize: (state) => ({
        quests: state.quests,
        lastGenerationDate: state.lastGenerationDate,
        todayProgress: {
          ...state.todayProgress,
          categoriesPlayed: Array.from(state.todayProgress.categoriesPlayed),
        },
        pendingRewards: state.pendingRewards,
      }),
      // Custom merge to restore Set
      merge: (persistedState, currentState) => {
        const persisted = persistedState as typeof currentState & {
          todayProgress: { categoriesPlayed: GameCategory[] };
        };
        return {
          ...currentState,
          ...persisted,
          todayProgress: {
            ...currentState.todayProgress,
            ...persisted.todayProgress,
            categoriesPlayed: new Set(persisted.todayProgress?.categoriesPlayed || []),
          },
        };
      },
    }
  )
);
