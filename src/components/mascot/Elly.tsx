import { motion } from 'framer-motion';

export type EllyState = 'neutral' | 'happy' | 'encourage';

interface EllyProps {
  state?: EllyState;
  size?: number;
  className?: string;
  animate?: boolean;
}

/**
 * Elly - The Daily Brain mascot elephant
 *
 * States:
 * - neutral: Default/waiting state - simple dot eyes, gentle smile
 * - happy: Success state - curved happy eyes, raised smile
 * - encourage: Challenge/failure state - flat eyes, neutral mouth (patiently waiting)
 */
export function Elly({ state = 'neutral', size = 50, className = '', animate = true }: EllyProps) {
  // Eye expressions based on state
  const getEyes = () => {
    switch (state) {
      case 'happy':
        // Curved happy eyes (^_^)
        return (
          <>
            <path
              d="M16 22 Q18 20 20 22"
              fill="none"
              stroke="#4a4a4a"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M30 22 Q32 20 34 22"
              fill="none"
              stroke="#4a4a4a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        );
      case 'encourage':
        // Flat horizontal eyes (- -)
        return (
          <>
            <line x1="15" y1="22" x2="21" y2="22" stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" />
            <line x1="29" y1="22" x2="35" y2="22" stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      default:
        // Neutral dot eyes (• •)
        return (
          <>
            <circle cx="18" cy="22" r="2" fill="#4a4a4a" />
            <circle cx="32" cy="22" r="2" fill="#4a4a4a" />
          </>
        );
    }
  };

  // Mouth expression based on state
  const getMouth = () => {
    switch (state) {
      case 'happy':
        // Wider smile
        return (
          <path
            d="M20 38 Q25 42 30 38"
            fill="none"
            stroke="#4a4a4a"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      case 'encourage':
        // Nearly horizontal line
        return (
          <path
            d="M21 39 Q25 40 29 39"
            fill="none"
            stroke="#4a4a4a"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      default:
        // Gentle smile
        return (
          <path
            d="M21 38 Q25 41 29 38"
            fill="none"
            stroke="#4a4a4a"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
    }
  };

  const svgContent = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left Ear */}
      <ellipse
        cx="8"
        cy="18"
        rx="7"
        ry="10"
        fill="#d4ccc4"
        stroke="#4a4a4a"
        strokeWidth="1.5"
      />
      {/* Left Ear Inner */}
      <ellipse cx="8" cy="18" rx="4" ry="6" fill="#f5c6c6" />

      {/* Right Ear */}
      <ellipse
        cx="42"
        cy="18"
        rx="7"
        ry="10"
        fill="#d4ccc4"
        stroke="#4a4a4a"
        strokeWidth="1.5"
      />
      {/* Right Ear Inner */}
      <ellipse cx="42" cy="18" rx="4" ry="6" fill="#f5c6c6" />

      {/* Head */}
      <ellipse
        cx="25"
        cy="24"
        rx="16"
        ry="14"
        fill="#d4ccc4"
        stroke="#4a4a4a"
        strokeWidth="1.5"
      />

      {/* Trunk */}
      <path
        d="M22 30 Q22 36 25 36 Q28 36 28 30"
        fill="#d4ccc4"
        stroke="#4a4a4a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Eyes */}
      {getEyes()}

      {/* Mouth */}
      {getMouth()}

      {/* Feet/Bottom */}
      <rect x="15" y="44" width="20" height="5" rx="2" fill="#d4ccc4" stroke="#4a4a4a" strokeWidth="1" />
      <line x1="20" y1="44" x2="20" y2="49" stroke="#4a4a4a" strokeWidth="0.5" />
      <line x1="25" y1="44" x2="25" y2="49" stroke="#4a4a4a" strokeWidth="0.5" />
      <line x1="30" y1="44" x2="30" y2="49" stroke="#4a4a4a" strokeWidth="0.5" />
    </svg>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ width: size, height: size }}
      >
        {svgContent}
      </motion.div>
    );
  }

  return svgContent;
}

// Preset sizes for common use cases
export const EllySmall = (props: Omit<EllyProps, 'size'>) => <Elly size={32} {...props} />;
export const EllyMedium = (props: Omit<EllyProps, 'size'>) => <Elly size={50} {...props} />;
export const EllyLarge = (props: Omit<EllyProps, 'size'>) => <Elly size={80} {...props} />;
export const EllyXLarge = (props: Omit<EllyProps, 'size'>) => <Elly size={120} {...props} />;
