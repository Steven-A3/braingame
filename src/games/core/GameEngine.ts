import { SeededRNG } from './SeededRNG';
import type { GameConfig, GameState, GameResult, GameProgress, GameCategory } from './types';

export interface GameCallbacks {
  onStateChange?: (state: GameState) => void;
  onProgress?: (progress: GameProgress) => void;
  onComplete?: (result: GameResult) => void;
}

/**
 * Base class for all brain training games
 */
export abstract class GameEngine {
  protected seed: number;
  protected rng: SeededRNG;
  protected difficulty: number;
  protected gameId: string;
  protected state: GameState;
  protected progressHistory: GameProgress[] = [];
  protected callbacks: GameCallbacks = {};

  // Abstract properties to be defined by each game
  abstract readonly category: GameCategory;
  abstract readonly maxLevels: number;

  constructor(config: GameConfig) {
    this.seed = config.seed;
    this.rng = new SeededRNG(config.seed);
    this.difficulty = config.difficulty;
    this.gameId = config.gameId;
    this.state = this.getInitialState();
  }

  protected getInitialState(): GameState {
    return {
      status: 'loading',
      score: 0,
      level: 1,
      maxLevel: this.maxLevels,
      lives: 3,
      maxLives: 3,
      startTime: null,
      endTime: null,
      accuracy: 1,
    };
  }

  /**
   * Set callbacks for game events
   */
  setCallbacks(callbacks: GameCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * Initialize the game - must be called before start
   */
  abstract init(): Promise<void>;

  /**
   * Generate level data for current level
   */
  abstract generateLevel(): void;

  /**
   * Handle user input during gameplay
   */
  abstract handleInput(input: unknown): void;

  /**
   * Start the game
   */
  start(): void {
    this.state.status = 'playing';
    this.state.startTime = Date.now();
    this.generateLevel();
    this.notifyStateChange();
  }

  /**
   * Pause the game
   */
  pause(): void {
    if (this.state.status === 'playing') {
      this.state.status = 'paused';
      this.notifyStateChange();
    }
  }

  /**
   * Resume the game
   */
  resume(): void {
    if (this.state.status === 'paused') {
      this.state.status = 'playing';
      this.notifyStateChange();
    }
  }

  /**
   * Complete a level successfully
   */
  protected levelComplete(bonusScore: number = 0): void {
    this.state.score += this.calculateLevelScore() + bonusScore;
    this.recordProgress();

    if (this.state.level >= this.state.maxLevel) {
      this.gameComplete('win');
    } else {
      this.state.level++;
      this.generateLevel();
      this.notifyStateChange();
    }
  }

  /**
   * Handle a mistake
   */
  protected mistake(): void {
    this.state.lives--;
    this.updateAccuracy(false);

    if (this.state.lives <= 0) {
      this.gameComplete('lose');
    } else {
      this.notifyStateChange();
    }
  }

  /**
   * Handle a correct action
   */
  protected correct(points: number = 10): void {
    this.state.score += points;
    this.updateAccuracy(true);
    this.notifyStateChange();
  }

  /**
   * End the game
   */
  protected gameComplete(result: 'win' | 'lose'): void {
    this.state.status = 'completed';
    this.state.endTime = Date.now();
    this.recordProgress();

    const gameResult: GameResult = {
      gameId: this.gameId,
      date: new Date().toISOString().split('T')[0],
      score: this.state.score,
      duration: (this.state.endTime - (this.state.startTime || 0)),
      accuracy: this.state.accuracy,
      levelsCompleted: result === 'win' ? this.state.maxLevel : this.state.level - 1,
      maxLevel: this.state.maxLevel,
      category: this.category,
    };

    this.notifyStateChange();
    this.callbacks.onComplete?.(gameResult);
  }

  /**
   * Calculate score for completing current level
   */
  protected calculateLevelScore(): number {
    const baseScore = 100;
    const levelMultiplier = 1 + (this.state.level - 1) * 0.1;
    const difficultyBonus = this.difficulty * 10;
    return Math.round(baseScore * levelMultiplier + difficultyBonus);
  }

  /**
   * Update running accuracy
   */
  private correctCount = 0;
  private totalAttempts = 0;

  protected updateAccuracy(correct: boolean): void {
    this.totalAttempts++;
    if (correct) this.correctCount++;
    this.state.accuracy = this.totalAttempts > 0
      ? this.correctCount / this.totalAttempts
      : 1;
  }

  /**
   * Record progress snapshot
   */
  protected recordProgress(): void {
    const progress: GameProgress = {
      level: this.state.level,
      score: this.state.score,
      lives: this.state.lives,
      accuracy: this.state.accuracy,
      timestamp: Date.now() - (this.state.startTime || 0),
    };
    this.progressHistory.push(progress);
    this.callbacks.onProgress?.(progress);
  }

  /**
   * Notify state change
   */
  protected notifyStateChange(): void {
    this.callbacks.onStateChange?.({ ...this.state });
  }

  /**
   * Get difficulty-scaled value
   */
  protected scaleByDifficulty(base: number, perLevel: number): number {
    return base + (this.difficulty - 1) * perLevel;
  }
}
