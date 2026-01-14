import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface Target {
  x: number;
  y: number;
  size: number;
  isGo: boolean; // true = tap, false = don't tap
  color: string;
}

export class ReflexTapEngine extends GameEngine {
  readonly category: GameCategory = 'speed';
  readonly maxLevels = 10;

  private currentTarget: Target | null = null;
  private trialsInLevel = 0;
  private successfulTrials = 0;
  private readonly trialsPerLevel = 8;
  private reactionTimes: number[] = [];
  private targetAppearTime: number = 0;
  private waitingForTarget = false;
  private noGoRatio = 0.2; // 20% no-go trials

  constructor(config: GameConfig) {
    super(config);
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  generateLevel(): void {
    this.trialsInLevel = 0;
    this.successfulTrials = 0;
    this.reactionTimes = [];
    // Increase no-go ratio with level
    this.noGoRatio = Math.min(0.4, 0.15 + this.state.level * 0.03);
    this.prepareNextTrial();
  }

  private prepareNextTrial(): void {
    this.currentTarget = null;
    this.waitingForTarget = true;
    this.notifyStateChange();
  }

  /**
   * Called after random delay to show target
   */
  showTarget(): void {
    if (!this.waitingForTarget) return;

    const isGo = !this.rng.chance(this.noGoRatio);

    // Random position (centered, with padding)
    const padding = 0.2;
    const x = this.rng.nextFloat(padding, 1 - padding);
    const y = this.rng.nextFloat(padding, 1 - padding);

    // Target size decreases with level
    const size = Math.max(60, 100 - this.state.level * 4 - this.difficulty * 2);

    this.currentTarget = {
      x,
      y,
      size,
      isGo,
      color: isGo ? '#22c55e' : '#ef4444', // Green for go, red for no-go
    };

    this.targetAppearTime = Date.now();
    this.waitingForTarget = false;
    this.notifyStateChange();
  }

  getCurrentTarget(): Target | null {
    return this.currentTarget;
  }

  isWaitingForTarget(): boolean {
    return this.waitingForTarget;
  }

  getTrialProgress(): { current: number; total: number } {
    return { current: this.trialsInLevel + 1, total: this.trialsPerLevel };
  }

  getAverageReactionTime(): number {
    if (this.reactionTimes.length === 0) return 0;
    return Math.round(
      this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length
    );
  }

  /**
   * Handle tap anywhere on screen
   */
  handleInput(tapped: boolean): void {
    if (this.state.status !== 'playing') return;

    // Tapped during wait period (too early)
    if (this.waitingForTarget && tapped) {
      this.mistake();
      if (this.state.lives > 0) {
        this.prepareNextTrial();
      }
      return;
    }

    if (!this.currentTarget) return;

    const reactionTime = Date.now() - this.targetAppearTime;

    if (this.currentTarget.isGo) {
      // Go trial
      if (tapped) {
        // Correct tap!
        this.reactionTimes.push(reactionTime);
        const speedBonus = Math.max(0, Math.floor((500 - reactionTime) / 10));
        this.correct(15 + speedBonus);
        this.successfulTrials++;
      } else {
        // Missed (timeout will call this)
        this.mistake();
      }
    } else {
      // No-go trial
      if (tapped) {
        // Wrong - should not have tapped!
        this.mistake();
      } else {
        // Correct inhibition!
        this.correct(20);
        this.successfulTrials++;
      }
    }

    this.trialsInLevel++;

    if (this.state.lives <= 0) return;

    if (this.trialsInLevel >= this.trialsPerLevel) {
      const avgTime = this.getAverageReactionTime();
      const speedBonus = avgTime > 0 ? Math.max(0, Math.floor((400 - avgTime) / 5)) : 0;
      this.levelComplete(speedBonus);
    } else {
      this.prepareNextTrial();
    }
  }

  /**
   * Called when target times out without tap
   */
  handleTimeout(): void {
    if (!this.currentTarget) return;

    if (this.currentTarget.isGo) {
      // Should have tapped - this is a miss
      this.handleInput(false);
    } else {
      // No-go trial - correct to not tap
      this.handleInput(false);
    }
  }

  /**
   * Get random delay before showing target (ms)
   */
  getRandomDelay(): number {
    return this.rng.nextInt(1000, 3000);
  }

  /**
   * Get timeout duration for target (ms)
   */
  getTargetTimeout(): number {
    return Math.max(800, 1500 - this.state.level * 50 - this.difficulty * 30);
  }
}
