import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export type Operation = '+' | '-' | '×' | '÷';

export interface MathProblem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  displayString: string;
}

export class MathSprintEngine extends GameEngine {
  readonly category: GameCategory = 'calculation';
  readonly maxLevels = 10;

  private currentProblem: MathProblem | null = null;
  private problemsInLevel = 0;
  private correctInLevel = 0;
  private readonly problemsPerLevel = 5;
  private timeLimit: number = 0;
  private startTime: number = 0;
  private operations: Operation[] = ['+', '-'];

  constructor(config: GameConfig) {
    super(config);
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  generateLevel(): void {
    this.problemsInLevel = 0;
    this.correctInLevel = 0;

    // Unlock operations based on level
    if (this.state.level >= 3) {
      this.operations = ['+', '-', '×'];
    }
    if (this.state.level >= 6) {
      this.operations = ['+', '-', '×', '÷'];
    }

    // Time limit decreases with level and difficulty
    this.timeLimit = Math.max(5000, 15000 - this.state.level * 500 - this.difficulty * 300);

    this.generateProblem();
  }

  private generateProblem(): void {
    const operation = this.rng.pick(this.operations);
    let num1: number, num2: number, answer: number;

    // Number ranges based on level
    const maxNum = Math.min(10 + this.state.level * 5 + this.difficulty * 3, 99);
    const minNum = Math.max(1, Math.floor(maxNum / 4));

    switch (operation) {
      case '+':
        num1 = this.rng.nextInt(minNum, maxNum);
        num2 = this.rng.nextInt(minNum, maxNum);
        answer = num1 + num2;
        break;

      case '-':
        // Ensure positive result
        num1 = this.rng.nextInt(minNum + 10, maxNum);
        num2 = this.rng.nextInt(minNum, num1);
        answer = num1 - num2;
        break;

      case '×':
        // Keep multiplication manageable
        num1 = this.rng.nextInt(2, Math.min(12, maxNum / 2));
        num2 = this.rng.nextInt(2, Math.min(12, maxNum / 2));
        answer = num1 * num2;
        break;

      case '÷':
        // Generate a valid division problem
        num2 = this.rng.nextInt(2, Math.min(12, maxNum / 2));
        answer = this.rng.nextInt(2, Math.min(12, maxNum / 2));
        num1 = num2 * answer;
        break;
    }

    this.currentProblem = {
      num1,
      num2,
      operation,
      answer,
      displayString: `${num1} ${operation} ${num2} = ?`,
    };

    this.startTime = Date.now();
    this.notifyStateChange();
  }

  getCurrentProblem(): MathProblem | null {
    return this.currentProblem;
  }

  getTimeLimit(): number {
    return this.timeLimit;
  }

  getTimeRemaining(): number {
    return Math.max(0, this.timeLimit - (Date.now() - this.startTime));
  }

  getProblemProgress(): { current: number; total: number } {
    return { current: this.problemsInLevel + 1, total: this.problemsPerLevel };
  }

  handleInput(answer: number): void {
    if (this.state.status !== 'playing' || !this.currentProblem) {
      return;
    }

    const isCorrect = answer === this.currentProblem.answer;
    const responseTime = Date.now() - this.startTime;

    if (isCorrect) {
      // Bonus points for fast responses
      const timeBonus = Math.max(0, Math.floor((this.timeLimit - responseTime) / 200));
      const difficultyBonus = this.currentProblem.operation === '×' || this.currentProblem.operation === '÷' ? 10 : 0;
      this.correct(15 + timeBonus + difficultyBonus);
      this.correctInLevel++;
    } else {
      this.mistake();
    }

    this.problemsInLevel++;

    if (this.state.lives <= 0) {
      return;
    }

    if (this.problemsInLevel >= this.problemsPerLevel) {
      const accuracyBonus = Math.floor((this.correctInLevel / this.problemsPerLevel) * 50);
      this.levelComplete(accuracyBonus);
    } else {
      this.generateProblem();
    }
  }

  handleTimeout(): void {
    if (this.state.status !== 'playing') return;

    this.mistake();
    this.problemsInLevel++;

    if (this.state.lives <= 0) {
      return;
    }

    if (this.problemsInLevel >= this.problemsPerLevel) {
      this.levelComplete(0);
    } else {
      this.generateProblem();
    }
  }
}
