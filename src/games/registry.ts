import type { GameCategory, GameInfo } from './core/types';

/**
 * Registry of all available games
 */
export const GAMES: GameInfo[] = [
  // Memory
  {
    id: 'pattern-echo',
    name: 'Pattern Echo',
    category: 'memory',
    description: 'Watch the sequence and repeat it',
    duration: '~3 min',
    icon: '🔮',
  },

  // Logic
  {
    id: 'grid-deduction',
    name: 'Grid Deduction',
    category: 'logic',
    description: 'Fill the grid using logic',
    duration: '~4 min',
    icon: '🧩',
  },

  // Focus
  {
    id: 'color-stroop',
    name: 'Color Stroop',
    category: 'focus',
    description: 'Name the color, not the word',
    duration: '~2 min',
    icon: '🎨',
  },

  // Calculation
  {
    id: 'math-sprint',
    name: 'Math Sprint',
    category: 'calculation',
    description: 'Solve equations quickly',
    duration: '~3 min',
    icon: '🔢',
  },

  // Language
  {
    id: 'word-morph',
    name: 'Word Morph',
    category: 'language',
    description: 'Transform words letter by letter',
    duration: '~4 min',
    icon: '📝',
  },

  // Speed
  {
    id: 'reflex-tap',
    name: 'Reflex Tap',
    category: 'speed',
    description: 'Test your reaction time',
    duration: '~2 min',
    icon: '⚡',
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
