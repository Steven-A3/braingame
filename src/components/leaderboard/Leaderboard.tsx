import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { getGameInfo } from '@/games/registry';
import type { GameCategory, GameResult } from '@/games/core/types';

type TimeFilter = 'today' | 'week' | 'allTime';

export function Leaderboard() {
  const navigate = useNavigate();
  const { gameHistory, stats, name } = useUserStore();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('allTime');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // Filter results by time
  const filteredResults = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    return gameHistory.filter((result) => {
      if (timeFilter === 'today') {
        return result.date === today;
      }
      if (timeFilter === 'week') {
        return result.date >= weekAgoStr;
      }
      return true;
    });
  }, [gameHistory, timeFilter]);

  // Personal best scores per game
  const personalBests = useMemo(() => {
    const bests: Record<string, GameResult> = {};

    filteredResults.forEach((result) => {
      if (!bests[result.gameId] || result.score > bests[result.gameId].score) {
        bests[result.gameId] = result;
      }
    });

    return Object.values(bests)
      .sort((a, b) => b.score - a.score)
      .map((result, idx) => {
        const game = getGameInfo(result.gameId);
        return {
          rank: idx + 1,
          gameId: result.gameId,
          gameName: game?.name || result.gameId,
          gameIcon: game?.icon || '🎮',
          score: result.score,
          date: result.date,
          category: result.category,
        };
      });
  }, [filteredResults]);

  // Game-specific leaderboard (all scores for selected game)
  const gameLeaderboard = useMemo(() => {
    if (!selectedGame) return [];

    return filteredResults
      .filter((result) => result.gameId === selectedGame)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((result, idx) => {
        const game = getGameInfo(result.gameId);
        return {
          rank: idx + 1,
          gameId: result.gameId,
          gameName: game?.name || result.gameId,
          gameIcon: game?.icon || '🎮',
          score: result.score,
          date: result.date,
          category: result.category,
        };
      });
  }, [filteredResults, selectedGame]);

  // Category stats
  const categoryStats = useMemo(() => {
    const categories: GameCategory[] = ['memory', 'logic', 'focus', 'calculation', 'language', 'speed'];

    return categories.map((category) => {
      const categoryResults = filteredResults.filter((r) => r.category === category);
      const totalScore = categoryResults.reduce((sum, r) => sum + r.score, 0);
      const avgScore = categoryResults.length > 0 ? Math.round(totalScore / categoryResults.length) : 0;
      const bestScore = categoryResults.length > 0 ? Math.max(...categoryResults.map((r) => r.score)) : 0;

      return {
        category,
        gamesPlayed: categoryResults.length,
        totalScore,
        avgScore,
        bestScore,
      };
    });
  }, [filteredResults]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleGoHome}
            className="text-slate-400 hover:text-white"
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold">Leaderboard</h1>
          <div className="w-12" /> {/* Spacer */}
        </div>

        {/* Time filter */}
        <div className="flex gap-2">
          {(['today', 'week', 'allTime'] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === filter
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {filter === 'today' && 'Today'}
              {filter === 'week' && 'This Week'}
              {filter === 'allTime' && 'All Time'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Overall stats card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary-500/20 flex items-center justify-center text-2xl">
              🏆
            </div>
            <div>
              <div className="font-bold text-lg">{name || 'Brain Trainer'}</div>
              <div className="text-sm text-slate-400">
                {filteredResults.length} games played
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-400">
                {filteredResults.reduce((sum, r) => sum + r.score, 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">Total Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-400">
                {filteredResults.length > 0
                  ? Math.round(
                      filteredResults.reduce((sum, r) => sum + r.score, 0) /
                        filteredResults.length
                    )
                  : 0}
              </div>
              <div className="text-xs text-slate-400">Avg Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-400">
                {stats.currentStreak}
              </div>
              <div className="text-xs text-slate-400">Day Streak</div>
            </div>
          </div>
        </motion.div>

        {/* Category breakdown */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-400 mb-3">
            BY CATEGORY
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {categoryStats.map((cat) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800 rounded-xl p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {cat.category === 'memory' && '🔮'}
                    {cat.category === 'logic' && '🧩'}
                    {cat.category === 'focus' && '🎨'}
                    {cat.category === 'calculation' && '➕'}
                    {cat.category === 'language' && '📝'}
                    {cat.category === 'speed' && '⚡'}
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {cat.category}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {cat.gamesPlayed} games • Best: {cat.bestScore}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Personal bests */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-400 mb-3">
            PERSONAL BESTS
          </h2>

          {personalBests.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2">🎮</div>
              <p>Play some games to see your scores here!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {personalBests.slice(0, 10).map((entry, idx) => (
                <motion.div
                  key={`${entry.gameId}-${entry.date}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setSelectedGame(entry.gameId);
                  }}
                  className="flex items-center gap-3 bg-slate-800 rounded-xl p-3 cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      entry.rank === 1
                        ? 'bg-yellow-500 text-yellow-900'
                        : entry.rank === 2
                        ? 'bg-slate-400 text-slate-900'
                        : entry.rank === 3
                        ? 'bg-orange-600 text-orange-100'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {entry.rank}
                  </div>

                  {/* Game info */}
                  <div className="text-2xl">{entry.gameIcon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{entry.gameName}</div>
                    <div className="text-xs text-slate-500">{entry.date}</div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="font-bold text-primary-400">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">pts</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Game-specific leaderboard modal */}
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {getGameInfo(selectedGame)?.icon}
                  </span>
                  <h3 className="font-bold">
                    {getGameInfo(selectedGame)?.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="text-sm text-slate-400 mb-4">Your Top Scores</div>

              {gameLeaderboard.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  No scores yet for this game
                </div>
              ) : (
                <div className="space-y-2">
                  {gameLeaderboard.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-slate-800 rounded-lg p-3"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          entry.rank === 1
                            ? 'bg-yellow-500 text-yellow-900'
                            : entry.rank === 2
                            ? 'bg-slate-400 text-slate-900'
                            : entry.rank === 3
                            ? 'bg-orange-600 text-orange-100'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {entry.rank}
                      </div>
                      <div className="flex-1 text-sm text-slate-400">
                        {entry.date}
                      </div>
                      <div className="font-bold text-primary-400">
                        {entry.score.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => navigate(`/play/${selectedGame}`)}
                className="btn-primary w-full mt-4"
              >
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
