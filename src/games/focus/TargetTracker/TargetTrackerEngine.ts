import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isTarget: boolean;
  isSelected: boolean;
}

export type GamePhase = 'highlight' | 'tracking' | 'select' | 'feedback';

export interface TargetTrackerState {
  balls: Ball[];
  phase: GamePhase;
  targetCount: number;
  totalBalls: number;
  correctSelections: number;
  roundsInLevel: number;
  currentRound: number;
  highlightTimeRemaining: number;
  trackingTimeRemaining: number;
  selectionsRemaining: number;
}

export class TargetTrackerEngine extends GameEngine {
  readonly category: GameCategory = 'focus';
  readonly maxLevels = 10;

  private gameState: TargetTrackerState = {
    balls: [],
    phase: 'highlight',
    targetCount: 3,
    totalBalls: 8,
    correctSelections: 0,
    roundsInLevel: 3,
    currentRound: 0,
    highlightTimeRemaining: 3000,
    trackingTimeRemaining: 5000,
    selectionsRemaining: 3,
  };

  private animationFrame: number | null = null;
  private phaseTimer: ReturnType<typeof setTimeout> | null = null;
  private lastTime: number = 0;

  constructor(config: GameConfig) {
    super(config);
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  private getLevelConfig(level: number): { targets: number; total: number; speed: number; rounds: number } {
    const configs = [
      { targets: 2, total: 6, speed: 1, rounds: 3 },
      { targets: 3, total: 8, speed: 1, rounds: 3 },
      { targets: 3, total: 10, speed: 1.2, rounds: 3 },
      { targets: 4, total: 10, speed: 1.2, rounds: 4 },
      { targets: 4, total: 12, speed: 1.4, rounds: 4 },
      { targets: 5, total: 12, speed: 1.4, rounds: 4 },
      { targets: 5, total: 14, speed: 1.6, rounds: 4 },
      { targets: 5, total: 16, speed: 1.6, rounds: 5 },
      { targets: 6, total: 16, speed: 1.8, rounds: 5 },
      { targets: 6, total: 18, speed: 2.0, rounds: 5 },
    ];
    return configs[Math.min(level - 1, configs.length - 1)];
  }

  generateLevel(): void {
    const config = this.getLevelConfig(this.state.level);

    this.gameState = {
      balls: [],
      phase: 'highlight',
      targetCount: config.targets,
      totalBalls: config.total,
      correctSelections: 0,
      roundsInLevel: config.rounds,
      currentRound: 0,
      highlightTimeRemaining: 3000,
      trackingTimeRemaining: Math.max(4000, 7000 - this.state.level * 300),
      selectionsRemaining: config.targets,
    };

    this.startRound();
  }

  private startRound(): void {
    this.gameState.currentRound++;
    const config = this.getLevelConfig(this.state.level);

    // Create balls
    const balls: Ball[] = [];
    const targetIndices = new Set<number>();

    // Randomly select targets
    while (targetIndices.size < config.targets) {
      targetIndices.add(this.rng.nextInt(0, config.total - 1));
    }

    // Create all balls
    for (let i = 0; i < config.total; i++) {
      // Random position (avoiding edges)
      const x = 50 + this.rng.next() * 200;
      const y = 50 + this.rng.next() * 200;

      // Random velocity
      const angle = this.rng.next() * Math.PI * 2;
      const speed = (0.5 + this.rng.next() * 0.5) * config.speed;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      balls.push({
        id: i,
        x,
        y,
        vx,
        vy,
        isTarget: targetIndices.has(i),
        isSelected: false,
      });
    }

    this.gameState.balls = balls;
    this.gameState.phase = 'highlight';
    this.gameState.highlightTimeRemaining = 3000;
    this.gameState.selectionsRemaining = config.targets;
    this.gameState.correctSelections = 0;

    this.notifyStateChange();

    // Start highlight phase
    this.startHighlightPhase();
  }

  private startHighlightPhase(): void {
    // Show targets for 3 seconds
    this.phaseTimer = setTimeout(() => {
      this.gameState.phase = 'tracking';
      this.gameState.trackingTimeRemaining = Math.max(4000, 7000 - this.state.level * 300);
      this.notifyStateChange();
      this.startTrackingPhase();
    }, 3000);

    // Start animation
    this.startAnimation();
  }

  private startTrackingPhase(): void {
    // Balls move around, user tracks mentally
    this.phaseTimer = setTimeout(() => {
      this.gameState.phase = 'select';
      this.notifyStateChange();
      // Animation continues during selection
    }, this.gameState.trackingTimeRemaining);
  }

  private startAnimation(): void {
    this.lastTime = performance.now();

    const animate = (time: number) => {
      if (this.state.status !== 'playing') return;

      const dt = (time - this.lastTime) / 16; // Normalize to ~60fps
      this.lastTime = time;

      // Update ball positions
      for (const ball of this.gameState.balls) {
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        // Bounce off walls (300x300 area)
        if (ball.x < 20 || ball.x > 280) {
          ball.vx = -ball.vx;
          ball.x = Math.max(20, Math.min(280, ball.x));
        }
        if (ball.y < 20 || ball.y > 280) {
          ball.vy = -ball.vy;
          ball.y = Math.max(20, Math.min(280, ball.y));
        }
      }

      this.notifyStateChange();
      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  handleInput(ballId: number): void {
    if (this.state.status !== 'playing' || this.gameState.phase !== 'select') return;

    const ball = this.gameState.balls.find(b => b.id === ballId);
    if (!ball || ball.isSelected) return;

    ball.isSelected = true;
    this.gameState.selectionsRemaining--;

    if (ball.isTarget) {
      this.gameState.correctSelections++;
    }

    this.notifyStateChange();

    // Check if all selections made
    if (this.gameState.selectionsRemaining === 0) {
      this.evaluateRound();
    }
  }

  private evaluateRound(): void {
    this.gameState.phase = 'feedback';
    this.notifyStateChange();

    // Stop animation during feedback
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    const correct = this.gameState.correctSelections;
    const total = this.gameState.targetCount;

    // Score based on accuracy
    if (correct === total) {
      this.correct(50 + this.state.level * 10);
    } else if (correct > 0) {
      this.correct(Math.floor((correct / total) * 30));
    } else {
      this.mistake();
    }

    // Wait then proceed
    this.phaseTimer = setTimeout(() => {
      if (this.state.status !== 'playing') return;

      if (this.state.lives <= 0) {
        // Game over handled by mistake()
        return;
      }

      if (this.gameState.currentRound >= this.gameState.roundsInLevel) {
        // Level complete
        this.levelComplete(0);
      } else {
        // Next round
        this.startRound();
      }
    }, 1500);
  }

  getGameState(): TargetTrackerState {
    return {
      ...this.gameState,
      balls: this.gameState.balls.map(b => ({ ...b })),
    };
  }

  cleanup(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }
  }
}
