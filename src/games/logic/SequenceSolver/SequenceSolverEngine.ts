import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface SequenceItem {
  value: string;
  isHidden: boolean;
}

export interface SequenceSolverState {
  sequence: SequenceItem[];
  options: string[];
  correctOption: string;
  patternType: string;
  timeRemaining: number;
  totalTime: number;
  roundsCompleted: number;
  roundsInLevel: number;
  feedback: 'correct' | 'wrong' | null;
  streak: number;
}

type PatternGenerator = (rng: { nextInt: (min: number, max: number) => number; next: () => number }) => {
  sequence: string[];
  answer: string;
  type: string;
};

export class SequenceSolverEngine extends GameEngine {
  readonly category: GameCategory = 'logic';
  readonly maxLevels = 10;

  private solverState: SequenceSolverState;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: GameConfig) {
    super(config);
    this.solverState = this.createInitialState();
  }

  generateLevel(): void {
    this.startNewRound();
  }

  private createInitialState(): SequenceSolverState {
    return {
      sequence: [],
      options: [],
      correctOption: '',
      patternType: '',
      timeRemaining: this.getTimeForLevel(),
      totalTime: this.getTimeForLevel(),
      roundsCompleted: 0,
      roundsInLevel: 8,
      feedback: null,
      streak: 0,
    };
  }

  private getTimeForLevel(): number {
    return Math.max(20 - (this.state.level - 1) * 1.5, 8);
  }

  private getPatternGenerators(): PatternGenerator[] {
    const level = this.state.level;
    const generators: PatternGenerator[] = [];

    // Basic patterns (all levels)
    generators.push(
      // Arithmetic sequence (add constant)
      (rng) => {
        const start = rng.nextInt(1, 20);
        const step = rng.nextInt(2, 8);
        const length = 5;
        const sequence = Array.from({ length }, (_, i) => (start + step * i).toString());
        const answer = (start + step * length).toString();
        return { sequence, answer, type: 'Arithmetic (+)' };
      },
      // Arithmetic sequence (subtract)
      (rng) => {
        const step = rng.nextInt(2, 6);
        const start = rng.nextInt(step * 6, 50);
        const length = 5;
        const sequence = Array.from({ length }, (_, i) => (start - step * i).toString());
        const answer = (start - step * length).toString();
        return { sequence, answer, type: 'Arithmetic (-)' };
      }
    );

    // Medium patterns (level 3+)
    if (level >= 3) {
      generators.push(
        // Multiplication sequence
        (rng) => {
          const start = rng.nextInt(1, 3);
          const factor = rng.nextInt(2, 3);
          const length = 5;
          const sequence = Array.from({ length }, (_, i) => (start * Math.pow(factor, i)).toString());
          const answer = (start * Math.pow(factor, length)).toString();
          return { sequence, answer, type: 'Geometric (×)' };
        },
        // Square numbers
        (rng) => {
          const start = rng.nextInt(1, 5);
          const length = 5;
          const sequence = Array.from({ length }, (_, i) => (Math.pow(start + i, 2)).toString());
          const answer = Math.pow(start + length, 2).toString();
          return { sequence, answer, type: 'Squares' };
        }
      );
    }

    // Advanced patterns (level 5+)
    if (level >= 5) {
      generators.push(
        // Fibonacci-like
        (rng) => {
          const a = rng.nextInt(1, 5);
          const b = rng.nextInt(1, 5);
          const sequence = [a.toString(), b.toString()];
          let prev = a,
            curr = b;
          for (let i = 2; i < 6; i++) {
            const next = prev + curr;
            sequence.push(next.toString());
            prev = curr;
            curr = next;
          }
          const answer = (prev + curr).toString();
          return { sequence: sequence.slice(0, 5), answer, type: 'Fibonacci-like' };
        },
        // Alternating operation
        (rng) => {
          const start = rng.nextInt(2, 10);
          const add = rng.nextInt(2, 5);
          const mult = 2;
          const sequence = [start.toString()];
          let val = start;
          for (let i = 1; i < 5; i++) {
            if (i % 2 === 1) {
              val += add;
            } else {
              val *= mult;
            }
            sequence.push(val.toString());
          }
          val += add; // Next would be add
          return { sequence, answer: val.toString(), type: 'Alternating' };
        }
      );
    }

    // Expert patterns (level 7+)
    if (level >= 7) {
      generators.push(
        // Prime numbers
        () => {
          const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
          const sequence = primes.slice(0, 5).map((p) => p.toString());
          return { sequence, answer: '13', type: 'Primes' };
        },
        // Triangular numbers
        () => {
          const sequence = [1, 3, 6, 10, 15].map((n) => n.toString());
          return { sequence, answer: '21', type: 'Triangular' };
        }
      );
    }

    return generators;
  }

  private startNewRound(): void {
    const generators = this.getPatternGenerators();
    const generator = generators[this.rng.nextInt(0, generators.length - 1)];
    const { sequence, answer, type } = generator(this.rng);

    // Create sequence items with last one hidden
    const sequenceItems: SequenceItem[] = sequence.map((value) => ({
      value,
      isHidden: false,
    }));
    sequenceItems.push({ value: answer, isHidden: true });

    // Generate distractor options
    const correctNum = parseInt(answer, 10);
    const distractors = new Set<string>();
    distractors.add(answer);

    while (distractors.size < 4) {
      const offset = this.rng.nextInt(-10, 10);
      if (offset === 0) continue;
      const distractor = (correctNum + offset).toString();
      if (parseInt(distractor, 10) > 0) {
        distractors.add(distractor);
      }
    }

    const options = Array.from(distractors);
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = this.rng.nextInt(0, i);
      [options[i], options[j]] = [options[j], options[i]];
    }

    this.solverState = {
      ...this.solverState,
      sequence: sequenceItems,
      options,
      correctOption: answer,
      patternType: type,
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
      this.solverState.timeRemaining -= 0.1;

      if (this.solverState.timeRemaining <= 0) {
        this.handleTimeout();
      }

      this.notifyStateChange();
    }, 100);
  }

  private handleTimeout(): void {
    this.clearTimers();
    this.solverState.feedback = 'wrong';
    this.solverState.streak = 0;
    this.state.lives--;
    this.notifyStateChange();

    if (this.state.lives <= 0) {
      this.feedbackTimer = setTimeout(() => {
        this.gameComplete('lose');
      }, 1500);
      return;
    }

    this.feedbackTimer = setTimeout(() => {
      this.solverState.roundsCompleted++;
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
    this.solverState = this.createInitialState();
    this.generateLevel();
  }

  handleInput(selectedOption: string): void {
    if (this.state.status !== 'playing') return;
    if (this.solverState.feedback !== null) return;

    this.clearTimers();

    if (selectedOption === this.solverState.correctOption) {
      this.solverState.feedback = 'correct';
      this.solverState.streak++;

      // Reveal the hidden number
      const hiddenItem = this.solverState.sequence.find((s) => s.isHidden);
      if (hiddenItem) hiddenItem.isHidden = false;

      // Score calculation
      const baseScore = 100;
      const timeBonus = Math.floor((this.solverState.timeRemaining / this.solverState.totalTime) * 50);
      const streakBonus = Math.min(this.solverState.streak * 10, 50);
      this.state.score += baseScore + timeBonus + streakBonus;
    } else {
      this.solverState.feedback = 'wrong';
      this.solverState.streak = 0;
      this.state.lives--;

      // Reveal the correct answer
      const hiddenItem = this.solverState.sequence.find((s) => s.isHidden);
      if (hiddenItem) hiddenItem.isHidden = false;

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
      this.solverState.roundsCompleted++;
      this.advanceRound();
    }, 1500);
  }

  private advanceRound(): void {
    if (this.solverState.roundsCompleted >= this.solverState.roundsInLevel) {
      if (this.state.level >= this.state.maxLevel) {
        this.gameComplete('win');
      } else {
        this.state.level++;
        this.solverState = this.createInitialState();
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

  getGameState(): SequenceSolverState {
    return { ...this.solverState };
  }

  cleanup(): void {
    this.clearTimers();
  }
}
