import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface SymbolSprintState {
  targetSymbol: string;
  gridSymbols: { id: number; symbol: string; isTarget: boolean }[];
  gridSize: number;
  targetCount: number;
  tappedCount: number;
  correctTaps: number;
  wrongTaps: number;
  timeRemaining: number;
  totalTime: number;
  roundsCompleted: number;
  roundsInLevel: number;
  feedback: 'correct' | 'wrong' | 'complete' | null;
  streak: number;
}

const SYMBOL_SETS = [
  ['♠', '♣', '♥', '♦'],
  ['★', '☆', '✦', '✧'],
  ['●', '○', '◆', '◇'],
  ['▲', '△', '▼', '▽'],
  ['■', '□', '◼', '◻'],
  ['♪', '♫', '♬', '♩'],
  ['✓', '✗', '✔', '✘'],
  ['→', '←', '↑', '↓'],
  ['α', 'β', 'γ', 'δ'],
  ['Ω', 'Σ', 'Π', 'Δ'],
];

export class SymbolSprintEngine extends GameEngine {
  readonly category: GameCategory = 'speed';
  readonly maxLevels = 10;

  private sprintState: SymbolSprintState;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: GameConfig) {
    super(config);
    this.sprintState = this.createInitialState();
  }

  generateLevel(): void {
    this.startNewRound();
  }

  private createInitialState(): SymbolSprintState {
    return {
      targetSymbol: '',
      gridSymbols: [],
      gridSize: this.getGridSizeForLevel(),
      targetCount: 0,
      tappedCount: 0,
      correctTaps: 0,
      wrongTaps: 0,
      timeRemaining: this.getTimeForLevel(),
      totalTime: this.getTimeForLevel(),
      roundsCompleted: 0,
      roundsInLevel: 6,
      feedback: null,
      streak: 0,
    };
  }

  private getGridSizeForLevel(): number {
    if (this.state.level <= 2) return 4;
    if (this.state.level <= 5) return 5;
    return 6;
  }

  private getTimeForLevel(): number {
    return Math.max(8 - (this.state.level - 1) * 0.5, 4);
  }

  private getTargetRatio(): number {
    // Higher levels = fewer targets (harder to find)
    if (this.state.level <= 3) return 0.3;
    if (this.state.level <= 6) return 0.25;
    return 0.2;
  }

  private startNewRound(): void {
    const gridSize = this.getGridSizeForLevel();
    const totalCells = gridSize * gridSize;
    const targetRatio = this.getTargetRatio();
    const targetCount = Math.max(Math.floor(totalCells * targetRatio), 3);

    // Select a random symbol set
    const symbolSet = SYMBOL_SETS[this.rng.nextInt(0, SYMBOL_SETS.length - 1)];
    const targetSymbol = symbolSet[this.rng.nextInt(0, symbolSet.length - 1)];

    // Create grid
    const gridSymbols: { id: number; symbol: string; isTarget: boolean }[] = [];

    // First, add target symbols
    for (let i = 0; i < targetCount; i++) {
      gridSymbols.push({
        id: i,
        symbol: targetSymbol,
        isTarget: true,
      });
    }

    // Fill rest with non-target symbols
    const otherSymbols = symbolSet.filter((s) => s !== targetSymbol);
    for (let i = targetCount; i < totalCells; i++) {
      gridSymbols.push({
        id: i,
        symbol: otherSymbols[this.rng.nextInt(0, otherSymbols.length - 1)],
        isTarget: false,
      });
    }

    // Shuffle grid
    for (let i = gridSymbols.length - 1; i > 0; i--) {
      const j = this.rng.nextInt(0, i);
      [gridSymbols[i], gridSymbols[j]] = [gridSymbols[j], gridSymbols[i]];
    }

    // Reassign IDs after shuffle
    gridSymbols.forEach((cell, idx) => {
      cell.id = idx;
    });

    this.sprintState = {
      ...this.sprintState,
      targetSymbol,
      gridSymbols,
      gridSize,
      targetCount,
      tappedCount: 0,
      correctTaps: 0,
      wrongTaps: 0,
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
      this.sprintState.timeRemaining -= 0.1;

      if (this.sprintState.timeRemaining <= 0) {
        this.handleTimeout();
      }

      this.notifyStateChange();
    }, 100);
  }

  private handleTimeout(): void {
    this.clearTimers();

    // Calculate performance
    const accuracy = this.sprintState.targetCount > 0
      ? this.sprintState.correctTaps / this.sprintState.targetCount
      : 0;

    if (accuracy < 0.5) {
      this.state.lives--;

      if (this.state.lives <= 0) {
        this.sprintState.feedback = 'wrong';
        this.notifyStateChange();
        this.feedbackTimer = setTimeout(() => {
          this.gameComplete('lose');
        }, 1500);
        return;
      }
    }

    // Score based on correct taps
    const baseScore = this.sprintState.correctTaps * 20;
    const accuracyBonus = accuracy >= 0.8 ? 50 : 0;
    this.state.score += baseScore + accuracyBonus;

    this.sprintState.feedback = 'complete';
    this.sprintState.roundsCompleted++;
    this.notifyStateChange();

    this.feedbackTimer = setTimeout(() => {
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
    this.sprintState = this.createInitialState();
    this.generateLevel();
  }

  handleInput(cellId: number): void {
    if (this.state.status !== 'playing') return;
    if (this.sprintState.feedback !== null) return;

    const cell = this.sprintState.gridSymbols.find((c) => c.id === cellId);
    if (!cell) return;

    // Already tapped (visual change happens on tap)
    if (cell.symbol === '') return;

    this.sprintState.tappedCount++;

    if (cell.isTarget) {
      this.sprintState.correctTaps++;
      this.sprintState.streak++;
      this.sprintState.feedback = 'correct';

      // Small score for each correct tap
      this.state.score += 10 + Math.min(this.sprintState.streak, 5);
    } else {
      this.sprintState.wrongTaps++;
      this.sprintState.streak = 0;
      this.sprintState.feedback = 'wrong';

      // Small penalty
      this.state.score = Math.max(0, this.state.score - 5);
    }

    // Mark as tapped (hide the symbol)
    cell.symbol = '';
    this.notifyStateChange();

    // Quick feedback clear
    this.feedbackTimer = setTimeout(() => {
      this.sprintState.feedback = null;

      // Check if all targets found
      if (this.sprintState.correctTaps >= this.sprintState.targetCount) {
        this.clearTimers();

        // Bonus for finding all
        const timeBonus = Math.floor(this.sprintState.timeRemaining * 10);
        this.state.score += 50 + timeBonus;

        this.sprintState.feedback = 'complete';
        this.sprintState.roundsCompleted++;
        this.notifyStateChange();

        this.feedbackTimer = setTimeout(() => {
          this.advanceRound();
        }, 1000);
      } else {
        this.notifyStateChange();
      }
    }, 150);
  }

  private advanceRound(): void {
    if (this.sprintState.roundsCompleted >= this.sprintState.roundsInLevel) {
      if (this.state.level >= this.state.maxLevel) {
        this.gameComplete('win');
      } else {
        this.state.level++;
        this.sprintState = this.createInitialState();
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

  getGameState(): SymbolSprintState {
    return { ...this.sprintState };
  }

  cleanup(): void {
    this.clearTimers();
  }
}
