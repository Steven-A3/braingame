import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface SearchItem {
  id: number;
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
  color: string;
  rotation: number;
  isTarget: boolean;
}

export interface VisualSearchState {
  items: SearchItem[];
  gridSize: number;
  targetIndex: number;
  timeRemaining: number;
  totalTime: number;
  roundsCompleted: number;
  roundsInLevel: number;
  feedback: 'correct' | 'wrong' | null;
  streak: number;
}

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
const SHAPES: SearchItem['shape'][] = ['circle', 'square', 'triangle', 'diamond'];

export class VisualSearchEngine extends GameEngine {
  readonly category: GameCategory = 'focus';
  readonly maxLevels = 10;

  private searchState: VisualSearchState;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: GameConfig) {
    super(config);
    this.searchState = this.createInitialState();
  }

  generateLevel(): void {
    this.startNewRound();
  }

  private createInitialState(): VisualSearchState {
    return {
      items: [],
      gridSize: this.getGridSizeForLevel(),
      targetIndex: -1,
      timeRemaining: this.getTimeForLevel(),
      totalTime: this.getTimeForLevel(),
      roundsCompleted: 0,
      roundsInLevel: 8,
      feedback: null,
      streak: 0,
    };
  }

  private getGridSizeForLevel(): number {
    // 3x3 → 4x4 → 5x5 → 6x6
    if (this.state.level <= 2) return 3;
    if (this.state.level <= 4) return 4;
    if (this.state.level <= 7) return 5;
    return 6;
  }

  private getTimeForLevel(): number {
    // Decrease time as level increases
    return Math.max(15 - (this.state.level - 1), 6);
  }

  private getDifferenceType(): 'color' | 'shape' | 'rotation' | 'both' {
    const level = this.state.level;
    if (level <= 2) return 'color';
    if (level <= 4) return this.rng.next() > 0.5 ? 'color' : 'shape';
    if (level <= 7) {
      const rand = this.rng.next();
      if (rand < 0.33) return 'color';
      if (rand < 0.66) return 'shape';
      return 'rotation';
    }
    return 'both';
  }

  private startNewRound(): void {
    const gridSize = this.getGridSizeForLevel();
    const totalItems = gridSize * gridSize;
    const differenceType = this.getDifferenceType();

    // Base properties for all items
    const baseShape = SHAPES[this.rng.nextInt(0, SHAPES.length - 1)];
    const baseColor = COLORS[this.rng.nextInt(0, COLORS.length - 1)];
    const baseRotation = 0;

    // Create items
    const items: SearchItem[] = [];
    for (let i = 0; i < totalItems; i++) {
      items.push({
        id: i,
        shape: baseShape,
        color: baseColor,
        rotation: baseRotation,
        isTarget: false,
      });
    }

    // Select random target
    const targetIndex = this.rng.nextInt(0, totalItems - 1);
    items[targetIndex].isTarget = true;

    // Make target different
    if (differenceType === 'color' || differenceType === 'both') {
      const otherColors = COLORS.filter((c) => c !== baseColor);
      items[targetIndex].color = otherColors[this.rng.nextInt(0, otherColors.length - 1)];
    }

    if (differenceType === 'shape' || differenceType === 'both') {
      const otherShapes = SHAPES.filter((s) => s !== baseShape);
      items[targetIndex].shape = otherShapes[this.rng.nextInt(0, otherShapes.length - 1)];
    }

    if (differenceType === 'rotation') {
      items[targetIndex].rotation = this.rng.nextInt(1, 3) * 90;
    }

    this.searchState = {
      ...this.searchState,
      items,
      gridSize,
      targetIndex,
      timeRemaining: this.getTimeForLevel(),
      totalTime: this.getTimeForLevel(),
      feedback: null,
    };

    this.notifyStateChange();
    this.startTimer();
  }

  private startTimer(): void {
    this.clearTimers();

    this.timerInterval = setInterval(() => {
      this.searchState.timeRemaining -= 0.1;

      if (this.searchState.timeRemaining <= 0) {
        this.handleTimeout();
      }

      this.notifyStateChange();
    }, 100);
  }

  private handleTimeout(): void {
    this.clearTimers();
    this.searchState.feedback = 'wrong';
    this.searchState.streak = 0;
    this.state.lives--;
    this.notifyStateChange();

    if (this.state.lives <= 0) {
      this.feedbackTimer = setTimeout(() => {
        this.gameComplete('lose');
      }, 1500);
      return;
    }

    this.feedbackTimer = setTimeout(() => {
      this.searchState.roundsCompleted++;
      this.advanceRound();
    }, 1500);
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  start(): void {
    this.state.status = 'playing';
    this.state.startTime = Date.now();
    this.searchState = this.createInitialState();
    this.generateLevel();
  }

  handleInput(itemId: number): void {
    if (this.state.status !== 'playing') return;
    if (this.searchState.feedback !== null) return;

    this.clearTimers();

    const item = this.searchState.items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.isTarget) {
      this.searchState.feedback = 'correct';
      this.searchState.streak++;

      // Score: base + time bonus + streak bonus
      const baseScore = 100;
      const timeBonus = Math.floor((this.searchState.timeRemaining / this.searchState.totalTime) * 50);
      const streakBonus = Math.min(this.searchState.streak * 10, 50);
      this.state.score += baseScore + timeBonus + streakBonus;
    } else {
      this.searchState.feedback = 'wrong';
      this.searchState.streak = 0;
      this.state.lives--;

      if (this.state.lives <= 0) {
        this.notifyStateChange();
        this.feedbackTimer = setTimeout(() => {
          this.gameComplete('lose');
        }, 1500);
        return;
      }
    }

    this.notifyStateChange();

    this.feedbackTimer = setTimeout(() => {
      this.searchState.roundsCompleted++;
      this.advanceRound();
    }, 1000);
  }

  private advanceRound(): void {
    if (this.searchState.roundsCompleted >= this.searchState.roundsInLevel) {
      if (this.state.level >= this.state.maxLevel) {
        this.gameComplete('win');
      } else {
        this.state.level++;
        this.searchState = this.createInitialState();
        this.state.status = 'ready';
        this.notifyStateChange();
      }
    } else {
      this.startNewRound();
    }
  }

  private clearTimers(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = null;
    }
  }

  getGameState(): VisualSearchState {
    return { ...this.searchState };
  }

  cleanup(): void {
    this.clearTimers();
  }
}
