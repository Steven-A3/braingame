import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { Badge, BadgeProgress, BadgeRarity } from '@/services/badges';
import { BADGE_RARITY_COLORS } from '@/services/badges';

interface BadgeCardProps {
  badge: Badge;
  progress?: BadgeProgress;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  onClick?: () => void;
}

const RARITY_LABELS: Record<BadgeRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export function BadgeCard({
  badge,
  progress,
  size = 'medium',
  showProgress = true,
  onClick,
}: BadgeCardProps) {
  const isEarned = progress?.earnedAt != null;
  const progressPercent = progress
    ? Math.min((progress.current / progress.target) * 100, 100)
    : 0;

  const sizeClasses = {
    small: 'p-2 w-16',
    medium: 'p-3 w-24',
    large: 'p-4 w-32',
  };

  const iconSizes = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-4xl',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={clsx(
        'relative rounded-xl flex flex-col items-center text-center cursor-pointer transition-all',
        sizeClasses[size],
        isEarned
          ? 'bg-slate-700/80'
          : 'bg-slate-800/50 opacity-60 grayscale',
        onClick && 'hover:bg-slate-700'
      )}
      style={{
        borderWidth: 2,
        borderColor: isEarned ? BADGE_RARITY_COLORS[badge.rarity] : 'transparent',
      }}
    >
      {/* Rarity glow effect for earned badges */}
      {isEarned && (
        <div
          className="absolute inset-0 rounded-xl blur-md opacity-20"
          style={{ backgroundColor: BADGE_RARITY_COLORS[badge.rarity] }}
        />
      )}

      {/* Badge icon */}
      <div
        className={clsx(
          iconSizes[size],
          'relative z-10',
          !isEarned && 'opacity-50'
        )}
      >
        {badge.icon}
      </div>

      {/* Badge name */}
      {size !== 'small' && (
        <div className="mt-1 text-xs font-medium truncate w-full relative z-10">
          {badge.secret && !isEarned ? '???' : badge.name}
        </div>
      )}

      {/* Progress bar */}
      {showProgress && !isEarned && size !== 'small' && (
        <div className="w-full mt-2 relative z-10">
          <div className="h-1 bg-slate-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {progress?.current || 0}/{progress?.target || 0}
          </div>
        </div>
      )}

      {/* Rarity indicator */}
      {size === 'large' && (
        <div
          className="text-[10px] mt-1 font-medium relative z-10"
          style={{ color: BADGE_RARITY_COLORS[badge.rarity] }}
        >
          {RARITY_LABELS[badge.rarity]}
        </div>
      )}
    </motion.div>
  );
}

// Badge notification popup
interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
}

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="bg-slate-800 rounded-2xl p-6 max-w-xs mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-sm text-slate-400 mb-2">Achievement Unlocked!</div>

        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl mb-3"
        >
          {badge.icon}
        </motion.div>

        <h3
          className="text-xl font-bold mb-1"
          style={{ color: BADGE_RARITY_COLORS[badge.rarity] }}
        >
          {badge.name}
        </h3>

        <p className="text-sm text-slate-400 mb-4">
          {badge.description}
        </p>

        <div
          className="inline-block px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${BADGE_RARITY_COLORS[badge.rarity]}20`,
            color: BADGE_RARITY_COLORS[badge.rarity],
          }}
        >
          {RARITY_LABELS[badge.rarity]}
        </div>

        <button
          onClick={onClose}
          className="block w-full mt-4 btn-primary"
        >
          Awesome!
        </button>
      </motion.div>
    </motion.div>
  );
}

// Badge list with categories
interface BadgeListProps {
  badges: Badge[];
  progressMap: Map<string, BadgeProgress>;
  onBadgeClick?: (badge: Badge) => void;
}

export function BadgeList({ badges, progressMap, onBadgeClick }: BadgeListProps) {
  const earnedBadges = badges.filter(b => progressMap.get(b.id)?.earnedAt);
  const unearnedBadges = badges.filter(b => !progressMap.get(b.id)?.earnedAt);

  return (
    <div className="space-y-6">
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-3">
            Earned ({earnedBadges.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map(badge => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                progress={progressMap.get(badge.id)}
                size="medium"
                showProgress={false}
                onClick={() => onBadgeClick?.(badge)}
              />
            ))}
          </div>
        </div>
      )}

      {unearnedBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-3">
            In Progress ({unearnedBadges.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {unearnedBadges.map(badge => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                progress={progressMap.get(badge.id)}
                size="medium"
                onClick={() => onBadgeClick?.(badge)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
