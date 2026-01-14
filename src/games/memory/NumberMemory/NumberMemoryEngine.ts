import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface NumberMemoryState {
  currentNumber: string;
  userInput: string;
  phase: 'show' | 'input' | 'feedback';
  displayTime: number;
  numberLength: number;
  isCorrect: boolean | null;
  streak: number;
  maxStreak: number;
}

export class NumberMemoryEngine extends GameEngine {
  readonly category: GameCategory = 'memory';
  readonly maxLevels = 10;

  private memoryState: NumberMemoryState;
  private displayTimer: ReturnType<typeof setTimeout> | null = null;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: GameConfig) {
    super(config);
    this.memoryState = this.createInitialState();
  }

  generateLevel(): void {
    this.startNewRound();
  }

  private createInitialState(): NumberMemoryState {
    return {
      currentNumber: '',
      userInput: '',
      phase: 'show',
      displayTime: this.getDisplayTimeForLevel(),
      numberLength: this.getNumberLengthForLevel(),
      isCorrect: null,
      streak: 0,
      maxStreak: 0,
    };
  }

  private getNumberLengthForLevel(): number {
    // Start with 4 digits, add 1 per level
    return 3 + this.state.level;
  }

  private getDisplayTimeForLevel(): number {
    // Base time + time per digit, decreases slightly with level
    const length = this.getNumberLengthForLevel();
    const baseTime = 1000;
    const perDigit = Math.max(400 - (this.state.level - 1) * 20, 250);
    return baseTime + length * perDigit;
  }

  private generateNumber(): string {
    const length = this.memoryState.numberLength;
    let number = '';

    // First digit can't be 0
    number += this.rng.nextInt(1, 9).toString();

    for (let i = 1; i < length; i++) {
      number += this.rng.nextInt(0, 9).toString();
    }

    return number;
  }

  private startNewRound(): void {
    const numberLength = this.getNumberLengthForLevel();
    this.memoryState.numberLength = numberLength;
    this.memoryState.displayTime = this.getDisplayTimeForLevel();
    this.memoryState.currentNumber = this.generateNumber();
    this.memoryState.userInput = '';
    this.memoryState.phase = 'show';
    this.memoryState.isCorrect = null;

    this.notifyStateChange();

    // Start display timer
    this.displayTimer = setTimeout(() => {
      this.memoryState.phase = 'input';
      this.notifyStateChange();
    }, this.memoryState.displayTime);
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  start(): void {
    this.state.status = 'playing';
    this.state.startTime = Date.now();
    this.memoryState = this.createInitialState();
    this.generateLevel();
  }

  handleInput(input: string): void {
    if (this.state.status !== 'playing') return;
    if (this.memoryState.phase !== 'input') return;

    if (input === 'backspace') {
      this.memoryState.userInput = this.memoryState.userInput.slice(0, -1);
    } else if (input === 'submit') {
      this.checkAnswer();
    } else if (/^\d$/.test(input) && this.memoryState.userInput.length < this.memoryState.numberLength) {
      this.memoryState.userInput += input;
    }

    this.notifyStateChange();
  }

  private checkAnswer(): void {
    const isCorrect = this.memoryState.userInput === this.memoryState.currentNumber;
    this.memoryState.isCorrect = isCorrect;
    this.memoryState.phase = 'feedback';

    if (isCorrect) {
      this.memoryState.streak++;
      this.memoryState.maxStreak = Math.max(this.memoryState.maxStreak, this.memoryState.streak);

      // Score: base + length bonus + streak bonus
      const baseScore = 100;
      const lengthBonus = this.memoryState.numberLength * 10;
      const streakBonus = Math.min(this.memoryState.streak * 15, 75);
      this.state.score += baseScore + lengthBonus + streakBonus;

      this.notifyStateChange();

      this.feedbackTimer = setTimeout(() => {
        if (this.state.level >= this.state.maxLevel) {
          this.gameComplete('win');
        } else {
          this.state.level++;
          this.memoryState = {
            ...this.createInitialState(),
            streak: this.memoryState.streak,
            maxStreak: this.memoryState.maxStreak,
          };
          this.state.status = 'ready';
          this.notifyStateChange();
        }
      }, 1500);
    } else {
      this.memoryState.streak = 0;
      this.state.lives--;

      this.notifyStateChange();

      this.feedbackTimer = setTimeout(() => {
        if (this.state.lives <= 0) {
          this.gameComplete('lose');
        } else {
          // Retry same level
          this.startNewRound();
        }
      }, 2000);
    }
  }

  getGameState(): NumberMemoryState {
    return { ...this.memoryState };
  }

  cleanup(): void {
    if (this.displayTimer) {
      clearTimeout(this.displayTimer);
      this.displayTimer = null;
    }
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = null;
    }
  }
}
