import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface GridCell {
  id: number;
  row: number;
  col: number;
  isTarget: boolean;
  isSelected: boolean;
  showFeedback: 'correct' | 'wrong' | null;
}

export interface SpatialRecallState {
  grid: GridCell[];
  gridSize: number;
  targetCount: number;
  phase: 'memorize' | 'recall' | 'feedback';
  memorizeTime: number;
  selectedCount: number;
  correctCount: number;
  roundsCompleted: number;
  roundsInLevel: number;
}

export class SpatialRecallEngine extends GameEngine {
  readonly category: GameCategory = 'memory';
  readonly maxLevels = 10;

  private spatialState: SpatialRecallState;
  private memorizeTimer: ReturnType<typeof setTimeout> | null = null;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: GameConfig) {
    super(config);
    this.spatialState = this.createInitialState();
  }

  generateLevel(): void {
    this.startNewRound();
  }

  private createInitialState(): SpatialRecallState {
    return {
      grid: [],
      gridSize: this.getGridSizeForLevel(),
      targetCount: this.getTargetCountForLevel(),
      phase: 'memorize',
      memorizeTime: this.getMemorizeTimeForLevel(),
      selectedCount: 0,
      correctCount: 0,
      roundsCompleted: 0,
      roundsInLevel: this.getRoundsForLevel(),
    };
  }

  private getGridSizeForLevel(): number {
    // 3x3 → 4x4 → 5x5 → 6x6
    if (this.state.level <= 2) return 3;
    if (this.state.level <= 4) return 4;
    if (this.state.level <= 7) return 5;
    return 6;
  }

  private getTargetCountForLevel(): number {
    // Start with 3, increase gradually
    return Math.min(3 + Math.floor((this.state.level - 1) / 2), 9);
  }

  private getMemorizeTimeForLevel(): number {
    // More time for larger grids, less as levels increase
    const baseTime = 2000;
    const gridBonus = (this.getGridSizeForLevel() - 3) * 500;
    const levelPenalty = Math.min((this.state.level - 1) * 100, 500);
    return baseTime + gridBonus - levelPenalty;
  }

  private getRoundsForLevel(): number {
    return 5;
  }

  private startNewRound(): void {
    const gridSize = this.getGridSizeForLevel();
    const targetCount = this.getTargetCountForLevel();
    const totalCells = gridSize * gridSize;

    // Create grid
    const grid: GridCell[] = [];
    for (let i = 0; i < totalCells; i++) {
      grid.push({
        id: i,
        row: Math.floor(i / gridSize),
        col: i % gridSize,
        isTarget: false,
        isSelected: false,
        showFeedback: null,
      });
    }

    // Randomly select target cells
    const indices = Array.from({ length: totalCells }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = this.rng.nextInt(0, i);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    for (let i = 0; i < targetCount; i++) {
      grid[indices[i]].isTarget = true;
    }

    this.spatialState = {
      ...this.spatialState,
      grid,
      gridSize,
      targetCount,
      phase: 'memorize',
      memorizeTime: this.getMemorizeTimeForLevel(),
      selectedCount: 0,
      correctCount: 0,
    };

    this.notifyStateChange();

    // Start memorize timer
    this.memorizeTimer = setTimeout(() => {
      this.spatialState.phase = 'recall';
      this.notifyStateChange();
    }, this.spatialState.memorizeTime);
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  start(): void {
    this.state.status = 'playing';
    this.state.startTime = Date.now();
    this.spatialState = this.createInitialState();
    this.generateLevel();
  }

  handleInput(cellId: number): void {
    if (this.state.status !== 'playing') return;
    if (this.spatialState.phase !== 'recall') return;

    const cell = this.spatialState.grid.find((c) => c.id === cellId);
    if (!cell || cell.isSelected) return;

    cell.isSelected = true;
    this.spatialState.selectedCount++;

    if (cell.isTarget) {
      this.spatialState.correctCount++;
      cell.showFeedback = 'correct';
    } else {
      cell.showFeedback = 'wrong';
    }

    this.notifyStateChange();

    // Check if all selections made
    if (this.spatialState.selectedCount >= this.spatialState.targetCount) {
      this.endRound();
    }
  }

  private endRound(): void {
    this.spatialState.phase = 'feedback';

    // Show all targets
    this.spatialState.grid.forEach((cell) => {
      if (cell.isTarget && !cell.isSelected) {
        cell.showFeedback = 'wrong'; // Missed target
      }
    });

    this.notifyStateChange();

    // Calculate score
    const accuracy = this.spatialState.correctCount / this.spatialState.targetCount;
    const baseScore = Math.round(accuracy * 100);
    const perfectBonus = accuracy === 1 ? 50 : 0;
    this.state.score += baseScore + perfectBonus;

    // Lose a life if accuracy is below 50%
    if (accuracy < 0.5) {
      this.state.lives--;
      if (this.state.lives <= 0) {
        this.feedbackTimer = setTimeout(() => {
          this.gameComplete('lose');
        }, 1500);
        return;
      }
    }

    this.spatialState.roundsCompleted++;

    this.feedbackTimer = setTimeout(() => {
      if (this.spatialState.roundsCompleted >= this.spatialState.roundsInLevel) {
        // Level complete
        if (this.state.level >= this.state.maxLevel) {
          this.gameComplete('win');
        } else {
          this.state.level++;
          this.spatialState = this.createInitialState();
          this.state.status = 'ready';
          this.notifyStateChange();
        }
      } else {
        // Next round
        this.startNewRound();
      }
    }, 1500);
  }

  getGameState(): SpatialRecallState {
    return { ...this.spatialState };
  }

  cleanup(): void {
    if (this.memorizeTimer) {
      clearTimeout(this.memorizeTimer);
      this.memorizeTimer = null;
    }
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = null;
    }
  }
}
