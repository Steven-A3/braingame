import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface ChainNumber {
  id: number;
  value: number;
  isUsed: boolean;
  isSelected: boolean;
}

export interface NumberChainState {
  numbers: ChainNumber[];
  target: number;
  currentValue: number;
  operations: string[];
  selectedNumber: number | null;
  pendingOperation: '+' | '-' | '×' | '÷' | null;
  roundsCompleted: number;
  roundsInLevel: number;
  timeRemaining: number;
  totalTime: number;
  feedback: 'correct' | 'wrong' | null;
  history: { value: number; operation: string }[];
}

export class NumberChainEngine extends GameEngine {
  readonly category: GameCategory = 'calculation';
  readonly maxLevels = 10;

  private chainState: NumberChainState;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: GameConfig) {
    super(config);
    this.chainState = this.createInitialState();
  }

  generateLevel(): void {
    this.startNewRound();
  }

  private createInitialState(): NumberChainState {
    return {
      numbers: [],
      target: 0,
      currentValue: 0,
      operations: this.getOperationsForLevel(),
      selectedNumber: null,
      pendingOperation: null,
      roundsCompleted: 0,
      roundsInLevel: 6,
      timeRemaining: this.getTimeForLevel(),
      totalTime: this.getTimeForLevel(),
      feedback: null,
      history: [],
    };
  }

  private getOperationsForLevel(): string[] {
    const level = this.state.level;
    if (level <= 2) return ['+', '-'];
    if (level <= 5) return ['+', '-', '×'];
    return ['+', '-', '×', '÷'];
  }

  private getTimeForLevel(): number {
    return Math.max(45 - (this.state.level - 1) * 3, 20);
  }

  private getNumberCount(): number {
    return Math.min(4 + Math.floor(this.state.level / 3), 6);
  }

  private startNewRound(): void {
    const count = this.getNumberCount();
    const operations = this.getOperationsForLevel();

    // Generate a solvable puzzle
    const { numbers, target, startValue } = this.generatePuzzle(count, operations);

    this.chainState = {
      ...this.chainState,
      numbers,
      target,
      currentValue: startValue,
      operations,
      selectedNumber: null,
      pendingOperation: null,
      timeRemaining: this.getTimeForLevel(),
      totalTime: this.getTimeForLevel(),
      feedback: null,
      history: [{ value: startValue, operation: 'Start' }],
    };

    this.notifyStateChange();
    this.startTimer();
  }

  private generatePuzzle(count: number, operations: string[]): {
    numbers: ChainNumber[];
    target: number;
    startValue: number;
  } {
    // Start with a random starting value
    const startValue = this.rng.nextInt(5, 15);
    let current = startValue;

    // Generate numbers and operations to create a valid chain
    const usedNumbers: number[] = [];
    const chainOps: { num: number; op: string }[] = [];

    for (let i = 0; i < count - 1; i++) {
      const op = operations[this.rng.nextInt(0, operations.length - 1)];
      let num: number;

      switch (op) {
        case '+':
          num = this.rng.nextInt(2, 20);
          current += num;
          break;
        case '-':
          num = this.rng.nextInt(2, Math.min(current - 1, 15));
          current -= num;
          break;
        case '×':
          num = this.rng.nextInt(2, 5);
          current *= num;
          break;
        case '÷':
          // Find a divisor
          const divisors = [2, 3, 4, 5].filter((d) => current % d === 0 && current / d >= 2);
          if (divisors.length > 0) {
            num = divisors[this.rng.nextInt(0, divisors.length - 1)];
            current /= num;
          } else {
            // Fallback to addition
            num = this.rng.nextInt(2, 10);
            current += num;
          }
          break;
        default:
          num = this.rng.nextInt(2, 10);
          current += num;
      }

      usedNumbers.push(num);
      chainOps.push({ num, op });
    }

    const target = current;

    // Create shuffled number array (including start value and operation numbers)
    const allNumbers = [startValue, ...usedNumbers];

    // Shuffle
    for (let i = allNumbers.length - 1; i > 0; i--) {
      const j = this.rng.nextInt(0, i);
      [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
    }

    const numbers: ChainNumber[] = allNumbers.map((value, index) => ({
      id: index,
      value,
      isUsed: false,
      isSelected: false,
    }));

    // Mark start value as used
    const startIndex = numbers.findIndex((n) => n.value === startValue && !n.isUsed);
    if (startIndex !== -1) {
      numbers[startIndex].isUsed = true;
    }

    return { numbers, target, startValue };
  }

  private startTimer(): void {
    this.clearTimers();

    this.timerInterval = setInterval(() => {
      this.chainState.timeRemaining -= 0.1;

      if (this.chainState.timeRemaining <= 0) {
        this.handleTimeout();
      }

      this.notifyStateChange();
    }, 100);
  }

  private handleTimeout(): void {
    this.clearTimers();
    this.chainState.feedback = 'wrong';
    this.state.lives--;
    this.notifyStateChange();

    if (this.state.lives <= 0) {
      this.feedbackTimer = setTimeout(() => {
        this.gameComplete('lose');
      }, 1500);
      return;
    }

    this.feedbackTimer = setTimeout(() => {
      this.chainState.roundsCompleted++;
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
    this.chainState = this.createInitialState();
    this.generateLevel();
  }

  handleInput(input: { type: 'number' | 'operation' | 'undo'; value?: number | string }): void {
    if (this.state.status !== 'playing') return;
    if (this.chainState.feedback !== null) return;

    if (input.type === 'operation') {
      this.chainState.pendingOperation = input.value as '+' | '-' | '×' | '÷';
      this.notifyStateChange();
      return;
    }

    if (input.type === 'undo' && this.chainState.history.length > 1) {
      // Undo last operation
      const lastEntry = this.chainState.history.pop();
      if (lastEntry) {
        // Find and restore the used number
        const lastNum = this.chainState.numbers.find(
          (n) => n.isUsed && n.value === this.getLastUsedNumberValue()
        );
        if (lastNum) {
          lastNum.isUsed = false;
        }
        this.chainState.currentValue = this.chainState.history[this.chainState.history.length - 1].value;
        this.chainState.pendingOperation = null;
      }
      this.notifyStateChange();
      return;
    }

    if (input.type === 'number' && this.chainState.pendingOperation) {
      const number = this.chainState.numbers.find((n) => n.id === input.value && !n.isUsed);
      if (!number) return;

      let newValue = this.chainState.currentValue;
      const op = this.chainState.pendingOperation;

      switch (op) {
        case '+':
          newValue += number.value;
          break;
        case '-':
          newValue -= number.value;
          break;
        case '×':
          newValue *= number.value;
          break;
        case '÷':
          if (number.value !== 0 && this.chainState.currentValue % number.value === 0) {
            newValue /= number.value;
          } else {
            // Invalid division
            return;
          }
          break;
      }

      number.isUsed = true;
      this.chainState.currentValue = newValue;
      this.chainState.history.push({ value: newValue, operation: `${op} ${number.value}` });
      this.chainState.pendingOperation = null;

      // Check if target reached
      if (newValue === this.chainState.target) {
        this.handleCorrect();
        return;
      }

      // Check if all numbers used without reaching target
      const unusedCount = this.chainState.numbers.filter((n) => !n.isUsed).length;
      if (unusedCount === 0 && newValue !== this.chainState.target) {
        this.handleWrong();
        return;
      }

      this.notifyStateChange();
    }
  }

  private getLastUsedNumberValue(): number {
    const history = this.chainState.history;
    if (history.length < 2) return 0;
    const lastOp = history[history.length - 1].operation;
    const match = lastOp.match(/[+\-×÷]\s*(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private handleCorrect(): void {
    this.clearTimers();
    this.chainState.feedback = 'correct';

    // Score calculation
    const baseScore = 100;
    const timeBonus = Math.floor((this.chainState.timeRemaining / this.chainState.totalTime) * 50);
    const efficiencyBonus = Math.max(0, (this.chainState.numbers.length - this.chainState.history.length) * 10);
    this.state.score += baseScore + timeBonus + efficiencyBonus;

    this.notifyStateChange();

    this.feedbackTimer = setTimeout(() => {
      this.chainState.roundsCompleted++;
      this.advanceRound();
    }, 1500);
  }

  private handleWrong(): void {
    this.clearTimers();
    this.chainState.feedback = 'wrong';
    this.state.lives--;
    this.notifyStateChange();

    if (this.state.lives <= 0) {
      this.feedbackTimer = setTimeout(() => {
        this.gameComplete('lose');
      }, 1500);
      return;
    }

    this.feedbackTimer = setTimeout(() => {
      this.chainState.roundsCompleted++;
      this.advanceRound();
    }, 1500);
  }

  private advanceRound(): void {
    if (this.chainState.roundsCompleted >= this.chainState.roundsInLevel) {
      if (this.state.level >= this.state.maxLevel) {
        this.gameComplete('win');
      } else {
        this.state.level++;
        this.chainState = this.createInitialState();
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

  getGameState(): NumberChainState {
    return { ...this.chainState };
  }

  cleanup(): void {
    this.clearTimers();
  }
}
