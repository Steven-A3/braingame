export type GameCategory = 'memory' | 'logic' | 'focus' | 'calculation' | 'language' | 'speed';

export type GameStatus = 'loading' | 'ready' | 'playing' | 'paused' | 'completed';

export interface GameConfig {
  seed: number;
  difficulty: number;
  gameId: string;
}

export interface GameState {
  status: GameStatus;
  score: number;
  level: number;
  maxLevel: number;
  lives: number;
  maxLives: number;
  startTime: number | null;
  endTime: number | null;
  accuracy: number;
}

export interface GameResult {
  gameId: string;
  date: string;
  score: number;
  duration: number;
  accuracy: number;
  levelsCompleted: number;
  maxLevel: number;
  category: GameCategory;
}

export interface GameProgress {
  level: number;
  score: number;
  lives: number;
  accuracy: number;
  timestamp: number;
}

export interface GameInfo {
  id: string;
  name: string;
  category: GameCategory;
  description: string;
  duration: string;
  icon: string;
}

export const CATEGORY_COLORS: Record<GameCategory, string> = {
  memory: '#8b5cf6',
  logic: '#10b981',
  focus: '#f59e0b',
  calculation: '#3b82f6',
  language: '#ec4899',
  speed: '#ef4444',
};

export const CATEGORY_ICONS: Record<GameCategory, string> = {
  memory: '🧠',
  logic: '🧩',
  focus: '👁️',
  calculation: '🔢',
  language: '📚',
  speed: '⚡',
};

export const CATEGORY_LABELS: Record<GameCategory, string> = {
  memory: 'Memory',
  logic: 'Logic',
  focus: 'Focus',
  calculation: 'Calculation',
  language: 'Language',
  speed: 'Speed',
};
