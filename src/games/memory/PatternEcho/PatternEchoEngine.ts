import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface Tile {
  row: number;
  col: number;
}

export interface PatternEchoLevel {
  gridSize: number;
  sequence: Tile[];
  timePerTile: number;
}

export class PatternEchoEngine extends GameEngine {
  readonly category: GameCategory = 'memory';
  readonly maxLevels = 8;

  private currentLevel: PatternEchoLevel | null = null;
  private playerSequence: Tile[] = [];
  private sequenceIndex = 0;
  private isShowingSequence = false;

  constructor(config: GameConfig) {
    super(config);
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  generateLevel(): void {
    const level = this.state.level;

    // Grid size increases with level: 3x3 -> 4x4 -> 5x5
    const gridSize = Math.min(3 + Math.floor((level - 1) / 3), 5);

    // Sequence length increases with level and difficulty
    const baseLength = 2 + level;
    const sequenceLength = Math.min(baseLength + Math.floor(this.difficulty / 3), 12);

    // Time per tile decreases with difficulty
    const timePerTile = Math.max(400, 800 - this.difficulty * 30 - level * 20);

    // Generate random sequence
    const sequence: Tile[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push({
        row: this.rng.nextInt(0, gridSize - 1),
        col: this.rng.nextInt(0, gridSize - 1),
      });
    }

    this.currentLevel = { gridSize, sequence, timePerTile };
    this.playerSequence = [];
    this.sequenceIndex = 0;
    this.isShowingSequence = true;
  }

  getCurrentLevel(): PatternEchoLevel | null {
    return this.currentLevel;
  }

  isShowingPattern(): boolean {
    return this.isShowingSequence;
  }

  getCurrentSequenceIndex(): number {
    return this.sequenceIndex;
  }

  getPlayerProgress(): number {
    return this.playerSequence.length;
  }

  getRequiredLength(): number {
    return this.currentLevel?.sequence.length || 0;
  }

  /**
   * Called when sequence display is complete
   */
  onSequenceComplete(): void {
    this.isShowingSequence = false;
    this.notifyStateChange();
  }

  handleInput(tile: Tile): void {
    if (this.state.status !== 'playing' || this.isShowingSequence || !this.currentLevel) {
      return;
    }

    const expectedTile = this.currentLevel.sequence[this.playerSequence.length];

    if (tile.row === expectedTile.row && tile.col === expectedTile.col) {
      // Correct!
      this.playerSequence.push(tile);
      this.correct(10);

      if (this.playerSequence.length === this.currentLevel.sequence.length) {
        // Level complete!
        const timeBonus = Math.max(0, 50 - Math.floor(
          (Date.now() - (this.state.startTime || 0)) / 1000
        ));
        this.levelComplete(timeBonus);
      }
    } else {
      // Wrong!
      this.mistake();

      // Reset sequence if still alive
      if (this.state.lives > 0) {
        this.playerSequence = [];
        this.isShowingSequence = true;
        this.notifyStateChange();
      }
    }
  }
}
