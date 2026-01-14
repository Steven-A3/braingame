import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface StroopChallenge {
  word: string;
  displayColor: string;
  correctAnswer: string;
  options: string[];
}

const COLORS = [
  { name: 'RED', hex: '#ef4444' },
  { name: 'BLUE', hex: '#3b82f6' },
  { name: 'GREEN', hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' },
  { name: 'ORANGE', hex: '#f97316' },
];

export class ColorStroopEngine extends GameEngine {
  readonly category: GameCategory = 'focus';
  readonly maxLevels = 10;

  private currentChallenge: StroopChallenge | null = null;
  private challengesInLevel = 0;
  private correctInLevel = 0;
  private readonly challengesPerLevel = 5;
  private timeLimit: number = 0;
  private startTime: number = 0;

  constructor(config: GameConfig) {
    super(config);
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  generateLevel(): void {
    this.challengesInLevel = 0;
    this.correctInLevel = 0;
    this.timeLimit = Math.max(3000, 5000 - this.state.level * 200 - this.difficulty * 100);
    this.generateChallenge();
  }

  private generateChallenge(): void {
    // Pick random word (color name)
    const wordColor = this.rng.pick(COLORS);

    // Pick random display color (different from word for Stroop effect)
    // Higher levels have more incongruent trials
    const congruentChance = Math.max(0.1, 0.5 - this.state.level * 0.05);
    let displayColor: typeof wordColor;

    if (this.rng.chance(congruentChance)) {
      displayColor = wordColor; // Congruent (easier)
    } else {
      // Incongruent (harder)
      do {
        displayColor = this.rng.pick(COLORS);
      } while (displayColor.name === wordColor.name);
    }

    // Generate options (always include correct answer)
    const correctAnswer = displayColor.name;
    const otherColors = COLORS.filter((c) => c.name !== correctAnswer);
    const numOptions = Math.min(4, 2 + Math.floor(this.state.level / 3));
    const wrongOptions = this.rng.pickMultiple(otherColors, numOptions - 1);
    const options = this.rng.shuffle([
      correctAnswer,
      ...wrongOptions.map((c) => c.name),
    ]);

    this.currentChallenge = {
      word: wordColor.name,
      displayColor: displayColor.hex,
      correctAnswer,
      options,
    };

    this.startTime = Date.now();
    this.notifyStateChange();
  }

  getCurrentChallenge(): StroopChallenge | null {
    return this.currentChallenge;
  }

  getTimeLimit(): number {
    return this.timeLimit;
  }

  getTimeRemaining(): number {
    return Math.max(0, this.timeLimit - (Date.now() - this.startTime));
  }

  getChallengeProgress(): { current: number; total: number } {
    return { current: this.challengesInLevel + 1, total: this.challengesPerLevel };
  }

  handleInput(answer: string): void {
    if (this.state.status !== 'playing' || !this.currentChallenge) {
      return;
    }

    const isCorrect = answer === this.currentChallenge.correctAnswer;
    const responseTime = Date.now() - this.startTime;

    if (isCorrect) {
      // Bonus points for fast responses
      const timeBonus = Math.max(0, Math.floor((this.timeLimit - responseTime) / 100));
      this.correct(20 + timeBonus);
      this.correctInLevel++;
    } else {
      this.mistake();
    }

    this.challengesInLevel++;

    if (this.state.lives <= 0) {
      return; // Game over handled by mistake()
    }

    if (this.challengesInLevel >= this.challengesPerLevel) {
      // Level complete
      const accuracyBonus = Math.floor((this.correctInLevel / this.challengesPerLevel) * 50);
      this.levelComplete(accuracyBonus);
    } else {
      // Next challenge
      this.generateChallenge();
    }
  }

  handleTimeout(): void {
    if (this.state.status !== 'playing') return;

    this.mistake();
    this.challengesInLevel++;

    if (this.state.lives <= 0) {
      return;
    }

    if (this.challengesInLevel >= this.challengesPerLevel) {
      this.levelComplete(0);
    } else {
      this.generateChallenge();
    }
  }
}
