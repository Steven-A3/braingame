import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface FractionValue {
  id: number;
  display: string;
  value: number;
  type: 'fraction' | 'decimal' | 'percent';
}

export interface FractionMatchState {
  sourceValue: FractionValue;
  options: FractionValue[];
  correctOptionId: number;
  timeRemaining: number;
  totalTime: number;
  roundsCompleted: number;
  roundsInLevel: number;
  feedback: 'correct' | 'wrong' | null;
  streak: number;
}

// Common fraction/decimal/percent equivalents
const EQUIVALENTS = [
  { fraction: '1/2', decimal: 0.5, percent: 50 },
  { fraction: '1/4', decimal: 0.25, percent: 25 },
  { fraction: '3/4', decimal: 0.75, percent: 75 },
  { fraction: '1/3', decimal: 0.333, percent: 33 },
  { fraction: '2/3', decimal: 0.667, percent: 67 },
  { fraction: '1/5', decimal: 0.2, percent: 20 },
  { fraction: '2/5', decimal: 0.4, percent: 40 },
  { fraction: '3/5', decimal: 0.6, percent: 60 },
  { fraction: '4/5', decimal: 0.8, percent: 80 },
  { fraction: '1/8', decimal: 0.125, percent: 12.5 },
  { fraction: '3/8', decimal: 0.375, percent: 37.5 },
  { fraction: '5/8', decimal: 0.625, percent: 62.5 },
  { fraction: '7/8', decimal: 0.875, percent: 87.5 },
  { fraction: '1/10', decimal: 0.1, percent: 10 },
  { fraction: '3/10', decimal: 0.3, percent: 30 },
  { fraction: '7/10', decimal: 0.7, percent: 70 },
  { fraction: '9/10', decimal: 0.9, percent: 90 },
  { fraction: '1/6', decimal: 0.167, percent: 17 },
  { fraction: '5/6', decimal: 0.833, percent: 83 },
];

export class FractionMatchEngine extends GameEngine {
  readonly category: GameCategory = 'calculation';
  readonly maxLevels = 10;

  private matchState: FractionMatchState;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: GameConfig) {
    super(config);
    this.matchState = this.createInitialState();
  }

  generateLevel(): void {
    this.startNewRound();
  }

  private createInitialState(): FractionMatchState {
    return {
      sourceValue: { id: 0, display: '', value: 0, type: 'fraction' },
      options: [],
      correctOptionId: -1,
      timeRemaining: this.getTimeForLevel(),
      totalTime: this.getTimeForLevel(),
      roundsCompleted: 0,
      roundsInLevel: 10,
      feedback: null,
      streak: 0,
    };
  }

  private getTimeForLevel(): number {
    return Math.max(12 - (this.state.level - 1), 5);
  }

  private getOptionCount(): number {
    if (this.state.level <= 3) return 3;
    if (this.state.level <= 6) return 4;
    return 5;
  }

  private startNewRound(): void {
    const optionCount = this.getOptionCount();

    // Pick a random equivalent set
    const equivalentIndex = this.rng.nextInt(0, EQUIVALENTS.length - 1);
    const equivalent = EQUIVALENTS[equivalentIndex];

    // Decide source type based on level
    const types: ('fraction' | 'decimal' | 'percent')[] = ['fraction', 'decimal', 'percent'];
    const sourceTypeIndex = this.rng.nextInt(0, types.length - 1);
    const sourceType = types[sourceTypeIndex];

    // Pick a different target type
    const targetTypes = types.filter((t) => t !== sourceType);
    const targetType = targetTypes[this.rng.nextInt(0, targetTypes.length - 1)];

    // Create source value
    const sourceValue: FractionValue = {
      id: 0,
      display: this.formatValue(equivalent, sourceType),
      value: equivalent.decimal,
      type: sourceType,
    };

    // Create correct option
    const correctOption: FractionValue = {
      id: 1,
      display: this.formatValue(equivalent, targetType),
      value: equivalent.decimal,
      type: targetType,
    };

    // Create distractor options
    const distractors: FractionValue[] = [];
    const usedIndices = new Set([equivalentIndex]);

    while (distractors.length < optionCount - 1) {
      const idx = this.rng.nextInt(0, EQUIVALENTS.length - 1);
      if (usedIndices.has(idx)) continue;
      usedIndices.add(idx);

      const distractor = EQUIVALENTS[idx];
      distractors.push({
        id: distractors.length + 2,
        display: this.formatValue(distractor, targetType),
        value: distractor.decimal,
        type: targetType,
      });
    }

    // Combine and shuffle options
    const options = [correctOption, ...distractors];
    for (let i = options.length - 1; i > 0; i--) {
      const j = this.rng.nextInt(0, i);
      [options[i], options[j]] = [options[j], options[i]];
    }

    // Reassign IDs after shuffle
    options.forEach((opt, idx) => {
      opt.id = idx;
    });

    const correctOptionId = options.findIndex((o) => o.value === equivalent.decimal);

    this.matchState = {
      ...this.matchState,
      sourceValue,
      options,
      correctOptionId,
      timeRemaining: this.getTimeForLevel(),
      totalTime: this.getTimeForLevel(),
      feedback: null,
    };

    this.notifyStateChange();
    this.startTimer();
  }

  private formatValue(
    equivalent: { fraction: string; decimal: number; percent: number },
    type: 'fraction' | 'decimal' | 'percent'
  ): string {
    switch (type) {
      case 'fraction':
        return equivalent.fraction;
      case 'decimal':
        return equivalent.decimal.toString();
      case 'percent':
        return `${equivalent.percent}%`;
    }
  }

  private startTimer(): void {
    this.clearTimers();

    this.timerInterval = setInterval(() => {
      this.matchState.timeRemaining -= 0.1;

      if (this.matchState.timeRemaining <= 0) {
        this.handleTimeout();
      }

      this.notifyStateChange();
    }, 100);
  }

  private handleTimeout(): void {
    this.clearTimers();
    this.matchState.feedback = 'wrong';
    this.matchState.streak = 0;
    this.state.lives--;
    this.notifyStateChange();

    if (this.state.lives <= 0) {
      this.feedbackTimer = setTimeout(() => {
        this.gameComplete('lose');
      }, 1500);
      return;
    }

    this.feedbackTimer = setTimeout(() => {
      this.matchState.roundsCompleted++;
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
    this.matchState = this.createInitialState();
    this.generateLevel();
  }

  handleInput(optionId: number): void {
    if (this.state.status !== 'playing') return;
    if (this.matchState.feedback !== null) return;

    this.clearTimers();

    if (optionId === this.matchState.correctOptionId) {
      this.matchState.feedback = 'correct';
      this.matchState.streak++;

      // Score calculation
      const baseScore = 100;
      const timeBonus = Math.floor((this.matchState.timeRemaining / this.matchState.totalTime) * 50);
      const streakBonus = Math.min(this.matchState.streak * 10, 50);
      this.state.score += baseScore + timeBonus + streakBonus;
    } else {
      this.matchState.feedback = 'wrong';
      this.matchState.streak = 0;
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
      this.matchState.roundsCompleted++;
      this.advanceRound();
    }, 1200);
  }

  private advanceRound(): void {
    if (this.matchState.roundsCompleted >= this.matchState.roundsInLevel) {
      if (this.state.level >= this.state.maxLevel) {
        this.gameComplete('win');
      } else {
        this.state.level++;
        this.matchState = this.createInitialState();
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

  getGameState(): FractionMatchState {
    return { ...this.matchState };
  }

  cleanup(): void {
    this.clearTimers();
  }
}
