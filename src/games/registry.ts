import type { GameCategory, GameInfo } from './core/types';

/**
 * Registry of all available games
 */
export const GAMES: GameInfo[] = [
  // Memory (4 games)
  {
    id: 'pattern-echo',
    name: 'Pattern Echo',
    category: 'memory',
    description: 'Watch the sequence and repeat it',
    duration: '~3 min',
    icon: '🔮',
  },
  {
    id: 'card-flip',
    name: 'Card Flip',
    category: 'memory',
    description: 'Match pairs of cards',
    duration: '~3 min',
    icon: '🃏',
  },
  {
    id: 'spatial-recall',
    name: 'Spatial Recall',
    category: 'memory',
    description: 'Remember positions on a grid',
    duration: '~3 min',
    icon: '🧠',
  },
  {
    id: 'number-memory',
    name: 'Number Memory',
    category: 'memory',
    description: 'Memorize number sequences',
    duration: '~3 min',
    icon: '🔢',
  },

  // Logic (3 games)
  {
    id: 'grid-deduction',
    name: 'Grid Deduction',
    category: 'logic',
    description: 'Fill the grid using logic',
    duration: '~4 min',
    icon: '🧩',
  },
  {
    id: 'sequence-solver',
    name: 'Sequence Solver',
    category: 'logic',
    description: 'Find the pattern and predict next',
    duration: '~3 min',
    icon: '📊',
  },
  {
    id: 'set-finder',
    name: 'Set Finder',
    category: 'logic',
    description: 'Find matching attribute sets',
    duration: '~4 min',
    icon: '🎴',
  },

  // Focus (3 games)
  {
    id: 'color-stroop',
    name: 'Color Stroop',
    category: 'focus',
    description: 'Name the color, not the word',
    duration: '~2 min',
    icon: '🎨',
  },
  {
    id: 'target-tracker',
    name: 'Target Tracker',
    category: 'focus',
    description: 'Track multiple moving targets',
    duration: '~3 min',
    icon: '🎯',
  },
  {
    id: 'visual-search',
    name: 'Visual Search',
    category: 'focus',
    description: 'Find the odd one out',
    duration: '~2 min',
    icon: '🔍',
  },

  // Calculation (4 games)
  {
    id: 'math-sprint',
    name: 'Math Sprint',
    category: 'calculation',
    description: 'Solve equations quickly',
    duration: '~3 min',
    icon: '➕',
  },
  {
    id: 'estimation-station',
    name: 'Estimation Station',
    category: 'calculation',
    description: 'Quick number estimation',
    duration: '~2 min',
    icon: '🎲',
  },
  {
    id: 'number-chain',
    name: 'Number Chain',
    category: 'calculation',
    description: 'Chain operations to hit target',
    duration: '~3 min',
    icon: '🔗',
  },
  {
    id: 'fraction-match',
    name: 'Fraction Match',
    category: 'calculation',
    description: 'Match equivalent values',
    duration: '~2 min',
    icon: '⚖️',
  },

  // Language (3 games)
  {
    id: 'word-morph',
    name: 'Word Morph',
    category: 'language',
    description: 'Transform words letter by letter',
    duration: '~4 min',
    icon: '📝',
  },
  {
    id: 'anagram-blitz',
    name: 'Anagram Blitz',
    category: 'language',
    description: 'Find words from scrambled letters',
    duration: '~2 min',
    icon: '🔤',
  },
  {
    id: 'word-categories',
    name: 'Word Categories',
    category: 'language',
    description: 'Sort words into categories',
    duration: '~3 min',
    icon: '📂',
  },

  // Speed (3 games)
  {
    id: 'reflex-tap',
    name: 'Reflex Tap',
    category: 'speed',
    description: 'Test your reaction time',
    duration: '~2 min',
    icon: '⚡',
  },
  {
    id: 'speed-match',
    name: 'Speed Match',
    category: 'speed',
    description: 'N-back memory challenge',
    duration: '~3 min',
    icon: '💨',
  },
  {
    id: 'symbol-sprint',
    name: 'Symbol Sprint',
    category: 'speed',
    description: 'Rapid symbol matching',
    duration: '~2 min',
    icon: '🏃',
  },
];

export const GAMES_BY_ID = new Map(GAMES.map((g) => [g.id, g]));

export const GAMES_BY_CATEGORY: Record<GameCategory, GameInfo[]> = {
  memory: GAMES.filter((g) => g.category === 'memory'),
  logic: GAMES.filter((g) => g.category === 'logic'),
  focus: GAMES.filter((g) => g.category === 'focus'),
  calculation: GAMES.filter((g) => g.category === 'calculation'),
  language: GAMES.filter((g) => g.category === 'language'),
  speed: GAMES.filter((g) => g.category === 'speed'),
};

/**
 * Get game info by ID
 */
export function getGameInfo(gameId: string): GameInfo | undefined {
  return GAMES_BY_ID.get(gameId);
}

/**
 * Get games by category
 */
export function getGamesByCategory(category: GameCategory): GameInfo[] {
  return GAMES_BY_CATEGORY[category] || [];
}
