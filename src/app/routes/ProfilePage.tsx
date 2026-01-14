import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/games/core/types';
import type { GameCategory } from '@/games/core/types';

export function ProfilePage() {
  const { stats, gameHistory } = useUserStore();

  // Calculate category stats
  const categoryStats = calculateCategoryStats(gameHistory);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <header className="mb-6 pt-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-slate-400 text-sm">Your brain training stats</p>
      </header>

      {/* Main stats */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Overall Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatItem label="Games Played" value={stats.totalGamesPlayed} />
          <StatItem label="Total Score" value={stats.totalScore.toLocaleString()} />
          <StatItem label="Current Streak" value={`${stats.currentStreak} days`} icon="🔥" />
          <StatItem label="Best Streak" value={`${stats.longestStreak} days`} icon="🏆" />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Category Performance</h2>
        <div className="space-y-3">
          {(Object.keys(CATEGORY_LABELS) as GameCategory[]).map((category) => {
            const catStats = categoryStats[category];
            const maxScore = Math.max(...Object.values(categoryStats).map(s => s.avgScore || 0), 1);
            const percentage = catStats.avgScore ? (catStats.avgScore / maxScore) * 100 : 0;

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span>{CATEGORY_ICONS[category]}</span>
                    <span className="text-sm">{CATEGORY_LABELS[category]}</span>
                  </div>
                  <span className="text-sm text-slate-400">
                    {catStats.gamesPlayed} games
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent games */}
      <div className="card">
        <h2 className="font-semibold mb-4">Recent Games</h2>
        {gameHistory.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">
            No games played yet. Start playing to see your history!
          </p>
        ) : (
          <div className="space-y-2">
            {gameHistory.slice(0, 5).map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span>{CATEGORY_ICONS[result.category]}</span>
                  <div>
                    <div className="text-sm font-medium">{result.gameId}</div>
                    <div className="text-xs text-slate-400">{result.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary-400">
                    {result.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">
                    {Math.round(result.accuracy * 100)}% accuracy
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string | number; icon?: string }) {
  return (
    <div className="text-center p-3 bg-slate-700/50 rounded-lg">
      <div className="text-2xl font-bold text-primary-400 flex items-center justify-center gap-1">
        {icon && <span className="text-xl">{icon}</span>}
        {value}
      </div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function calculateCategoryStats(history: { category: GameCategory; score: number }[]) {
  const stats: Record<GameCategory, { gamesPlayed: number; totalScore: number; avgScore: number }> = {
    memory: { gamesPlayed: 0, totalScore: 0, avgScore: 0 },
    logic: { gamesPlayed: 0, totalScore: 0, avgScore: 0 },
    focus: { gamesPlayed: 0, totalScore: 0, avgScore: 0 },
    calculation: { gamesPlayed: 0, totalScore: 0, avgScore: 0 },
    language: { gamesPlayed: 0, totalScore: 0, avgScore: 0 },
    speed: { gamesPlayed: 0, totalScore: 0, avgScore: 0 },
  };

  for (const result of history) {
    const cat = stats[result.category];
    cat.gamesPlayed++;
    cat.totalScore += result.score;
  }

  for (const category of Object.keys(stats) as GameCategory[]) {
    const cat = stats[category];
    cat.avgScore = cat.gamesPlayed > 0 ? cat.totalScore / cat.gamesPlayed : 0;
  }

  return stats;
}
