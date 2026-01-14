import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface EstimationQuestion {
  expression: string;
  actualAnswer: number;
  options: number[];
  difficulty: number;
}

export interface EstimationStationState {
  currentQuestion: EstimationQuestion | null;
  questionIndex: number;
  questionsInLevel: number;
  timeRemaining: number;
  totalTime: number;
  correctAnswers: number;
  streak: number;
  maxStreak: number;
  feedback: 'correct' | 'close' | 'wrong' | null;
  lastAccuracy: number;
  showingQuestion: boolean;
}

type OperationType = '+' | '-' | '×' | '÷';

export class EstimationStationEngine extends GameEngine {
  readonly category: GameCategory = 'calculation';
  readonly maxLevels = 10;

  private estimationState: EstimationStationState;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private questionTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(config: GameConfig) {
    super(config);
    this.estimationState = this.createInitialState();
  }

  generateLevel(): void {
    // Level generation is handled by nextQuestion()
  }

  private createInitialState(): EstimationStationState {
    return {
      currentQuestion: null,
      questionIndex: 0,
      questionsInLevel: this.getQuestionsForLevel(),
      timeRemaining: this.getTimeForLevel(),
      totalTime: this.getTimeForLevel(),
      correctAnswers: 0,
      streak: 0,
      maxStreak: 0,
      feedback: null,
      lastAccuracy: 0,
      showingQuestion: false,
    };
  }

  private getQuestionsForLevel(): number {
    // More questions at higher levels
    return 8 + Math.floor(this.state.level / 2);
  }

  private getTimeForLevel(): number {
    // Time per question decreases slightly at higher levels
    const baseTime = 10;
    const reduction = Math.min(this.state.level - 1, 4);
    return baseTime - reduction;
  }

  private getDifficultyConfig() {
    const level = this.state.level;

    if (level <= 2) {
      return {
        operations: ['+', '-'] as OperationType[],
        minNumber: 5,
        maxNumber: 50,
        multiTerms: false,
        percentageRange: 20, // How close to actual answer options can be
      };
    } else if (level <= 4) {
      return {
        operations: ['+', '-', '×'] as OperationType[],
        minNumber: 10,
        maxNumber: 100,
        multiTerms: false,
        percentageRange: 15,
      };
    } else if (level <= 6) {
      return {
        operations: ['+', '-', '×', '÷'] as OperationType[],
        minNumber: 10,
        maxNumber: 200,
        multiTerms: false,
        percentageRange: 12,
      };
    } else if (level <= 8) {
      return {
        operations: ['+', '-', '×', '÷'] as OperationType[],
        minNumber: 20,
        maxNumber: 500,
        multiTerms: true,
        percentageRange: 10,
      };
    } else {
      return {
        operations: ['+', '-', '×', '÷'] as OperationType[],
        minNumber: 50,
        maxNumber: 1000,
        multiTerms: true,
        percentageRange: 8,
      };
    }
  }

  private generateQuestion(): EstimationQuestion {
    const config = this.getDifficultyConfig();
    const operation = config.operations[this.rng.nextInt(0, config.operations.length - 1)];

    let expression: string;
    let actualAnswer: number;

    if (config.multiTerms && this.rng.next() > 0.5) {
      // Multi-term expression
      const result = this.generateMultiTermExpression(config);
      expression = result.expression;
      actualAnswer = result.answer;
    } else {
      // Two-term expression
      const result = this.generateTwoTermExpression(operation, config);
      expression = result.expression;
      actualAnswer = result.answer;
    }

    // Round the actual answer for cleaner numbers
    actualAnswer = Math.round(actualAnswer);

    // Generate distractor options
    const options = this.generateOptions(actualAnswer, config.percentageRange);

    return {
      expression,
      actualAnswer,
      options,
      difficulty: this.state.level,
    };
  }

  private generateTwoTermExpression(
    operation: OperationType,
    config: { minNumber: number; maxNumber: number }
  ): { expression: string; answer: number } {
    let a: number, b: number, answer: number;

    switch (operation) {
      case '+':
        a = this.rng.nextInt(config.minNumber, config.maxNumber);
        b = this.rng.nextInt(config.minNumber, config.maxNumber);
        answer = a + b;
        return { expression: `${a} + ${b}`, answer };

      case '-':
        a = this.rng.nextInt(config.minNumber, config.maxNumber);
        b = this.rng.nextInt(config.minNumber, Math.min(a, config.maxNumber));
        answer = a - b;
        return { expression: `${a} - ${b}`, answer };

      case '×':
        // Keep multiplication reasonable
        a = this.rng.nextInt(2, Math.min(30, config.maxNumber / 10));
        b = this.rng.nextInt(2, Math.min(30, config.maxNumber / 10));
        answer = a * b;
        return { expression: `${a} × ${b}`, answer };

      case '÷':
        // Ensure clean division
        b = this.rng.nextInt(2, 20);
        answer = this.rng.nextInt(config.minNumber / 5, config.maxNumber / 5);
        a = b * answer;
        return { expression: `${a} ÷ ${b}`, answer };

      default:
        return { expression: '0', answer: 0 };
    }
  }

  private generateMultiTermExpression(
    config: { minNumber: number; maxNumber: number; operations: OperationType[] }
  ): { expression: string; answer: number } {
    // Generate 3-term expression
    const a = this.rng.nextInt(config.minNumber / 2, config.maxNumber / 3);
    const b = this.rng.nextInt(config.minNumber / 2, config.maxNumber / 3);
    const c = this.rng.nextInt(config.minNumber / 2, config.maxNumber / 3);

    const op1 = this.rng.next() > 0.5 ? '+' : '-';
    const op2 = this.rng.next() > 0.5 ? '+' : '-';

    let answer: number;
    if (op1 === '+' && op2 === '+') {
      answer = a + b + c;
    } else if (op1 === '+' && op2 === '-') {
      answer = a + b - c;
    } else if (op1 === '-' && op2 === '+') {
      answer = a - b + c;
    } else {
      answer = a - b - c;
    }

    return { expression: `${a} ${op1} ${b} ${op2} ${c}`, answer: Math.abs(answer) };
  }

  private generateOptions(actualAnswer: number, percentageRange: number): number[] {
    const options: number[] = [actualAnswer];

    // Generate 3 distractor options
    while (options.length < 4) {
      const deviation = Math.max(5, Math.floor(actualAnswer * (percentageRange / 100)));
      const offset = this.rng.nextInt(-deviation, deviation);

      // Avoid zero, negative, and duplicate options
      const option = actualAnswer + offset;
      if (option > 0 && !options.includes(option) && option !== actualAnswer) {
        options.push(option);
      }
    }

    // Shuffle options
    return this.shuffleArray(options);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.rng.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  start(): void {
    this.state.status = 'playing';
    this.estimationState = this.createInitialState();
    this.nextQuestion();
    this.notifyStateChange();
  }

  private nextQuestion(): void {
    if (this.estimationState.questionIndex >= this.estimationState.questionsInLevel) {
      this.endLevel();
      return;
    }

    this.estimationState.currentQuestion = this.generateQuestion();
    this.estimationState.showingQuestion = true;
    this.estimationState.timeRemaining = this.getTimeForLevel();
    this.estimationState.totalTime = this.getTimeForLevel();
    this.estimationState.feedback = null;

    // Start countdown timer
    this.startTimer();

    this.notifyStateChange();
  }

  private startTimer(): void {
    this.clearTimers();

    this.timerInterval = setInterval(() => {
      this.estimationState.timeRemaining -= 0.1;

      if (this.estimationState.timeRemaining <= 0) {
        this.handleTimeout();
      }

      this.notifyStateChange();
    }, 100);
  }

  private handleTimeout(): void {
    this.clearTimers();

    // Timeout counts as wrong
    this.estimationState.feedback = 'wrong';
    this.estimationState.streak = 0;
    this.state.lives--;

    if (this.state.lives <= 0) {
      this.endGame();
      return;
    }

    this.questionTimeout = setTimeout(() => {
      this.estimationState.questionIndex++;
      this.nextQuestion();
    }, 1000);
  }

  handleInput(selectedAnswer: number): void {
    if (this.state.status !== 'playing' || !this.estimationState.currentQuestion) return;
    if (!this.estimationState.showingQuestion) return;

    this.clearTimers();

    const actual = this.estimationState.currentQuestion.actualAnswer;
    const accuracy = Math.abs(selectedAnswer - actual) / actual;

    this.estimationState.lastAccuracy = Math.round((1 - accuracy) * 100);

    if (selectedAnswer === actual) {
      // Exact match
      this.handleCorrect(true);
    } else if (accuracy <= 0.1) {
      // Within 10% - close enough
      this.handleClose();
    } else {
      // Wrong
      this.handleWrong();
    }
  }

  private handleCorrect(exact: boolean): void {
    this.estimationState.feedback = 'correct';
    this.estimationState.correctAnswers++;
    this.estimationState.streak++;
    this.estimationState.maxStreak = Math.max(
      this.estimationState.maxStreak,
      this.estimationState.streak
    );

    // Score calculation
    const baseScore = 100;
    const timeBonus = Math.floor(
      (this.estimationState.timeRemaining / this.estimationState.totalTime) * 50
    );
    const streakBonus = Math.min(this.estimationState.streak * 10, 50);
    const exactBonus = exact ? 25 : 0;

    this.state.score += baseScore + timeBonus + streakBonus + exactBonus;

    this.advanceToNextQuestion();
  }

  private handleClose(): void {
    this.estimationState.feedback = 'close';
    this.estimationState.correctAnswers++;
    // Reset streak on close answers
    this.estimationState.streak = 0;

    // Partial score
    const baseScore = 50;
    const timeBonus = Math.floor(
      (this.estimationState.timeRemaining / this.estimationState.totalTime) * 25
    );

    this.state.score += baseScore + timeBonus;

    this.advanceToNextQuestion();
  }

  private handleWrong(): void {
    this.estimationState.feedback = 'wrong';
    this.estimationState.streak = 0;
    this.state.lives--;

    if (this.state.lives <= 0) {
      this.endGame();
      return;
    }

    this.advanceToNextQuestion();
  }

  private advanceToNextQuestion(): void {
    this.notifyStateChange();

    this.questionTimeout = setTimeout(() => {
      this.estimationState.questionIndex++;
      this.nextQuestion();
    }, 1200);
  }

  private endLevel(): void {
    // Level completion bonus
    const completionBonus = this.estimationState.correctAnswers * 50;
    const perfectBonus = this.estimationState.correctAnswers === this.estimationState.questionsInLevel ? 200 : 0;
    this.state.score += completionBonus + perfectBonus;

    if (this.state.level >= this.state.maxLevel) {
      this.endGame();
      return;
    }

    // Advance to next level
    this.state.level++;
    this.state.status = 'ready';
    this.estimationState = this.createInitialState();
    this.notifyStateChange();
  }

  private endGame(): void {
    this.clearTimers();
    this.gameComplete(this.state.lives > 0 ? 'win' : 'lose');
  }

  private clearTimers(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.questionTimeout) {
      clearTimeout(this.questionTimeout);
      this.questionTimeout = null;
    }
  }

  getGameState(): EstimationStationState {
    return { ...this.estimationState };
  }

  cleanup(): void {
    this.clearTimers();
  }
}
