import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

interface StreakDisplayProps {
  currentStreak: number;
  completedToday: boolean;
}

export function StreakDisplay({ currentStreak, completedToday }: StreakDisplayProps) {
  const { t, i18n } = useTranslation();

  // Generate last 7 days
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push({
      date,
      dayName: date.toLocaleDateString(i18n.language, { weekday: 'short' }).charAt(0).toUpperCase(),
      isToday: i === 0,
      isPast: i > 0,
    });
  }

  if (currentStreak === 0 && !completedToday) {
    return (
      <div className="card mb-6 text-center py-6">
        <div className="text-slate-400 mb-2">{t('home.streak', { defaultValue: 'Start your streak today!' })}</div>
        <div className="text-4xl">🔥</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.span
            className="text-4xl flame-glow"
            animate={completedToday ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            🔥
          </motion.span>
          <div>
            <div className="text-3xl font-bold">{currentStreak}</div>
            <div className="text-sm text-slate-400">{t('common.days', { defaultValue: 'day streak' })}</div>
          </div>
        </div>

        {completedToday && (
          <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
            ✓ {t('home.completedToday')}
          </div>
        )}
      </div>

      {/* Week calendar */}
      <div className="flex justify-between">
        {days.map(({ date, dayName, isToday, isPast }, index) => {
          // For simplicity, mark days as completed if within streak range
          const daysAgo = 6 - index;
          const isCompleted = completedToday
            ? daysAgo < currentStreak
            : daysAgo > 0 && daysAgo <= currentStreak;

          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <span className="text-xs text-slate-500">{dayName}</span>
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                  isToday && completedToday && 'bg-green-500 text-white',
                  isToday && !completedToday && 'bg-primary-500/30 border-2 border-primary-500',
                  !isToday && isCompleted && 'bg-green-500/20 text-green-400',
                  !isToday && !isCompleted && isPast && 'bg-slate-700 text-slate-500'
                )}
              >
                {isCompleted || (isToday && completedToday) ? '✓' : date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
