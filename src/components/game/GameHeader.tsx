import { motion } from 'framer-motion';

interface GameHeaderProps {
  title: string;
  level: number;
  maxLevel: number;
  score: number;
  lives: number;
  maxLives: number;
  onExit: () => void;
}

export function GameHeader({
  title,
  level,
  maxLevel,
  score,
  lives,
  maxLives,
  onExit,
}: GameHeaderProps) {
  return (
    <header className="bg-slate-800/80 backdrop-blur-lg sticky top-0 z-10 safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Exit button */}
        <button
          onClick={onExit}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-700 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title and level */}
        <div className="text-center">
          <h1 className="font-semibold text-lg">{title}</h1>
          <div className="text-sm text-slate-400">
            Level {level}/{maxLevel}
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className="font-bold text-lg text-primary-400">{score.toLocaleString()}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-700">
        <motion.div
          className="h-full bg-primary-500"
          initial={{ width: 0 }}
          animate={{ width: `${(level / maxLevel) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Lives */}
      <div className="absolute right-4 top-16">
        <div className="flex gap-1">
          {Array.from({ length: maxLives }).map((_, i) => (
            <motion.span
              key={i}
              initial={false}
              animate={{
                scale: i < lives ? 1 : 0.8,
                opacity: i < lives ? 1 : 0.3,
              }}
              className="text-lg"
            >
              ❤️
            </motion.span>
          ))}
        </div>
      </div>
    </header>
  );
}
