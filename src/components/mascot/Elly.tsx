import { motion } from 'framer-motion';

export type EllyState = 'neutral' | 'happy' | 'encourage';

interface EllyProps {
  state?: EllyState;
  size?: number;
  className?: string;
  animate?: boolean;
}

// Map states to SVG file paths
const ELLY_IMAGES: Record<EllyState, string> = {
  neutral: '/neutral_smile_elli.svg',
  happy: '/soft_happy_elli.svg',
  encourage: '/gentle_encourage_elli.svg',
};

/**
 * Elly - The Daily Brain mascot elephant
 *
 * States:
 * - neutral: Default/waiting state - friendly smile
 * - happy: Success state - soft happy expression
 * - encourage: Challenge/failure state - gentle encouraging look
 */
export function Elly({ state = 'neutral', size = 50, className = '', animate = true }: EllyProps) {
  const imageSrc = ELLY_IMAGES[state];

  const imageContent = (
    <img
      src={imageSrc}
      alt={`Elly the elephant - ${state}`}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ width: size, height: size }}
      >
        {imageContent}
      </motion.div>
    );
  }

  return imageContent;
}

// Preset sizes for common use cases
export const EllySmall = (props: Omit<EllyProps, 'size'>) => <Elly size={32} {...props} />;
export const EllyMedium = (props: Omit<EllyProps, 'size'>) => <Elly size={50} {...props} />;
export const EllyLarge = (props: Omit<EllyProps, 'size'>) => <Elly size={80} {...props} />;
export const EllyXLarge = (props: Omit<EllyProps, 'size'>) => <Elly size={120} {...props} />;
