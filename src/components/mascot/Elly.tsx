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
 * - neutral: Default/waiting state - simple dot eyes, curved trunk
 * - happy: Success state - curved happy eyes, raised trunk
 * - encourage: Challenge/failure state - flat eyes, neutral expression
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
              d="M40 50 Q43 47 46 50"
              fill="none"
              stroke="#4a4a4a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M54 50 Q57 47 60 50"
              fill="none"
              stroke="#4a4a4a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        );
      case 'encourage':
        // Flat horizontal eyes (- -)
        return (
          <>
            <line x1="40" y1="50" x2="46" y2="50" stroke="#4a4a4a" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="54" y1="50" x2="60" y2="50" stroke="#4a4a4a" strokeWidth="1.5" strokeLinecap="round" />
          </>
        );
      default:
        // Neutral dot eyes (• •)
        return (
          <>
            <circle cx="43" cy="50" r="1.5" fill="#4a4a4a" />
            <circle cx="57" cy="50" r="1.5" fill="#4a4a4a" />
          </>
        );
    }
  };

  // Trunk expression based on state
  const getTrunk = () => {
    switch (state) {
      case 'happy':
        // Raised trunk
        return (
          <path
            d="M47 55 Q47 62 57 58"
            fill="none"
            stroke="#4a4a4a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      case 'encourage':
        // Slightly droopy trunk
        return (
          <path
            d="M47 55 Q47 65 55 67"
            fill="none"
            stroke="#4a4a4a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      default:
        // Neutral curved trunk
        return (
          <path
            d="M47 55 Q47 65 57 62"
            fill="none"
            stroke="#4a4a4a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
    }
  };

  const svgContent = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left Ear */}
      <ellipse
        cx="30"
        cy="47"
        rx="17"
        ry="15"
        fill="#c4bdb3"
        stroke="#4a4a4a"
        strokeWidth="1.5"
      />
      {/* Left Ear Inner */}
      <path d="M32 37 Q20 42 32 57" fill="#fbcbb2" />

      {/* Right Ear */}
      <ellipse
        cx="70"
        cy="47"
        rx="17"
        ry="15"
        fill="#c4bdb3"
        stroke="#4a4a4a"
        strokeWidth="1.5"
      />
      {/* Right Ear Inner */}
      <path d="M68 37 Q80 42 68 57" fill="#fbcbb2" />

      {/* Body */}
      <rect
        x="37"
        y="55"
        width="26"
        height="20"
        rx="5"
        fill="#c4bdb3"
        stroke="#4a4a4a"
        strokeWidth="1.5"
      />

      {/* Feet */}
      <line x1="42" y1="70" x2="42" y2="75" stroke="#4a4a4a" strokeWidth="1" />
      <line x1="50" y1="70" x2="50" y2="75" stroke="#4a4a4a" strokeWidth="1" />
      <line x1="58" y1="70" x2="58" y2="75" stroke="#4a4a4a" strokeWidth="1" />

      {/* Head */}
      <circle
        cx="50"
        cy="47"
        r="22"
        fill="#c4bdb3"
        stroke="#4a4a4a"
        strokeWidth="1.5"
      />

      {/* Eyes */}
      {getEyes()}

      {/* Trunk */}
      {getTrunk()}
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
