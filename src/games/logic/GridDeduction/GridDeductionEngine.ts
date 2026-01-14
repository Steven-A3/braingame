import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export type CellValue = number | null;

export interface GridCell {
  value: CellValue;
  isGiven: boolean;
  isSelected: boolean;
  isError: boolean;
}

export interface GridDeductionLevel {
  size: number;
  grid: GridCell[][];
  solution: number[][];
}

export class GridDeductionEngine extends GameEngine {
  readonly category: GameCategory = 'logic';
  readonly maxLevels = 6;

  private currentLevel: GridDeductionLevel | null = null;
  private selectedCell: { row: number; col: number } | null = null;
  private moveCount = 0;
  private errorCount = 0;

  constructor(config: GameConfig) {
    super(config);
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  generateLevel(): void {
    const level = this.state.level;

    // Grid size: 4x4 for early levels, 6x6 for later
    const size = level <= 3 ? 4 : 6;

    // Generate a valid solved grid
    const solution = this.generateSolvedGrid(size);

    // Create puzzle by removing cells
    const cellsToRemove = this.getCellsToRemove(size, level);
    const grid = this.createPuzzle(solution, cellsToRemove);

    this.currentLevel = { size, grid, solution };
    this.selectedCell = null;
    this.moveCount = 0;
    this.errorCount = 0;
    this.notifyStateChange();
  }

  private generateSolvedGrid(size: number): number[][] {
    const grid: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));

    // Fill grid using backtracking
    this.fillGrid(grid, size);

    return grid;
  }

  private fillGrid(grid: number[][], size: number): boolean {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (grid[row][col] === 0) {
          const numbers = this.rng.shuffle([...Array(size)].map((_, i) => i + 1));

          for (const num of numbers) {
            if (this.isValidPlacement(grid, row, col, num, size)) {
              grid[row][col] = num;

              if (this.fillGrid(grid, size)) {
                return true;
              }

              grid[row][col] = 0;
            }
          }

          return false;
        }
      }
    }
    return true;
  }

  private isValidPlacement(grid: number[][], row: number, col: number, num: number, size: number): boolean {
    // Check row
    for (let c = 0; c < size; c++) {
      if (grid[row][c] === num) return false;
    }

    // Check column
    for (let r = 0; r < size; r++) {
      if (grid[r][col] === num) return false;
    }

    // For 6x6, check 2x3 boxes
    if (size === 6) {
      const boxRowStart = Math.floor(row / 2) * 2;
      const boxColStart = Math.floor(col / 3) * 3;

      for (let r = boxRowStart; r < boxRowStart + 2; r++) {
        for (let c = boxColStart; c < boxColStart + 3; c++) {
          if (grid[r][c] === num) return false;
        }
      }
    }

    // For 4x4, check 2x2 boxes
    if (size === 4) {
      const boxRowStart = Math.floor(row / 2) * 2;
      const boxColStart = Math.floor(col / 2) * 2;

      for (let r = boxRowStart; r < boxRowStart + 2; r++) {
        for (let c = boxColStart; c < boxColStart + 2; c++) {
          if (grid[r][c] === num) return false;
        }
      }
    }

    return true;
  }

  private getCellsToRemove(size: number, level: number): number {
    const totalCells = size * size;
    // Remove more cells as level increases
    const baseRemove = size === 4 ? 8 : 20;
    const levelBonus = (level - 1) * 2;
    return Math.min(baseRemove + levelBonus + this.difficulty, totalCells - size);
  }

  private createPuzzle(solution: number[][], cellsToRemove: number): GridCell[][] {
    const size = solution.length;
    const grid: GridCell[][] = solution.map(row =>
      row.map(value => ({
        value,
        isGiven: true,
        isSelected: false,
        isError: false,
      }))
    );

    // Randomly remove cells
    const positions: { row: number; col: number }[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        positions.push({ row: r, col: c });
      }
    }

    const toRemove = this.rng.shuffle(positions).slice(0, cellsToRemove);

    for (const { row, col } of toRemove) {
      grid[row][col].value = null;
      grid[row][col].isGiven = false;
    }

    return grid;
  }

  getCurrentLevel(): GridDeductionLevel | null {
    return this.currentLevel;
  }

  getSelectedCell(): { row: number; col: number } | null {
    return this.selectedCell;
  }

  getMoveCount(): number {
    return this.moveCount;
  }

  selectCell(row: number, col: number): void {
    if (!this.currentLevel || this.state.status !== 'playing') return;

    const cell = this.currentLevel.grid[row][col];
    if (cell.isGiven) return; // Can't select given cells

    // Deselect previous
    if (this.selectedCell) {
      this.currentLevel.grid[this.selectedCell.row][this.selectedCell.col].isSelected = false;
    }

    // Select new
    cell.isSelected = true;
    this.selectedCell = { row, col };
    this.notifyStateChange();
  }

  handleInput(value: number): void {
    if (!this.currentLevel || !this.selectedCell || this.state.status !== 'playing') return;

    const { row, col } = this.selectedCell;
    const cell = this.currentLevel.grid[row][col];

    if (cell.isGiven) return;

    this.moveCount++;

    const correctValue = this.currentLevel.solution[row][col];

    if (value === correctValue) {
      cell.value = value;
      cell.isError = false;
      this.correct(15);

      // Check if puzzle is complete
      if (this.isPuzzleComplete()) {
        const moveBonus = Math.max(0, 100 - this.moveCount);
        const errorPenalty = this.errorCount * 10;
        this.levelComplete(moveBonus - errorPenalty);
      }
    } else {
      cell.value = value;
      cell.isError = true;
      this.errorCount++;
      this.mistake();
    }

    this.notifyStateChange();
  }

  clearCell(): void {
    if (!this.currentLevel || !this.selectedCell || this.state.status !== 'playing') return;

    const { row, col } = this.selectedCell;
    const cell = this.currentLevel.grid[row][col];

    if (cell.isGiven) return;

    cell.value = null;
    cell.isError = false;
    this.notifyStateChange();
  }

  private isPuzzleComplete(): boolean {
    if (!this.currentLevel) return false;

    for (let r = 0; r < this.currentLevel.size; r++) {
      for (let c = 0; c < this.currentLevel.size; c++) {
        const cell = this.currentLevel.grid[r][c];
        if (cell.value === null || cell.isError) return false;
      }
    }

    return true;
  }
}
