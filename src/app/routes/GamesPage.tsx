import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GAMES } from '@/games/registry';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/games/core/types';
import type { GameCategory } from '@/games/core/types';

const CATEGORIES: GameCategory[] = ['memory', 'logic', 'focus', 'calculation', 'language', 'speed'];

export function GamesPage() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <header className="mb-6 pt-4">
        <h1 className="text-2xl font-bold">Game Library</h1>
        <p className="text-slate-400 text-sm">All brain training games</p>
      </header>

      {/* Category sections */}
      {CATEGORIES.map((category) => {
        const categoryGames = GAMES.filter((g) => g.category === category);
        if (categoryGames.length === 0) return null;

        return (
          <div key={category} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{CATEGORY_ICONS[category]}</span>
              <h2
                className="font-semibold"
                style={{ color: CATEGORY_COLORS[category] }}
              >
                {CATEGORY_LABELS[category]}
              </h2>
            </div>

            <div className="space-y-2">
              {categoryGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/play/${game.id}`}
                    className="card flex items-center gap-4 hover:bg-slate-700/50 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${CATEGORY_COLORS[category]}20` }}
                    >
                      {game.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{game.name}</h3>
                      <p className="text-sm text-slate-400">{game.description}</p>
                    </div>
                    <div className="text-slate-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
