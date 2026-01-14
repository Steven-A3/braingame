import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

// Shape types for n-back stimuli
export type ShapeType = 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'hexagon';
export type ColorType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Stimulus {
  shape: ShapeType;
  color: ColorType;
  position: number; // 0-8 for 3x3 grid
}

export interface SpeedMatchState {
  nBack: number;
  currentStimulus: Stimulus | null;
  stimulusHistory: Stimulus[];
  showingStimulus: boolean;
  waitingForResponse: boolean;
  isMatch: boolean;
  roundsInLevel: number;
  currentRound: number;
  correctInLevel: number;
  responseTime: number | null;
  feedback: 'correct' | 'incorrect' | 'timeout' | null;
}

const SHAPES: ShapeType[] = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon'];
const COLORS: ColorType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export class SpeedMatchEngine extends GameEngine {
  readonly category: GameCategory = 'speed';
  readonly maxLevels = 10;

  private gameState: SpeedMatchState = {
    nBack: 1,
    currentStimulus: null,
    stimulusHistory: [],
    showingStimulus: false,
    waitingForResponse: false,
    isMatch: false,
    roundsInLevel: 10,
    currentRound: 0,
    correctInLevel: 0,
    responseTime: null,
    feedback: null,
  };

  private stimulusTimeout: ReturnType<typeof setTimeout> | null = null;
  private responseTimeout: ReturnType<typeof setTimeout> | null = null;
  private feedbackTimeout: ReturnType<typeof setTimeout> | null = null;
  private stimulusStartTime: number = 0;

  constructor(config: GameConfig) {
    super(config);
  }

  async init(): Promise<void> {
    // Initialize game state
    this.gameState = {
      nBack: 1,
      currentStimulus: null,
      stimulusHistory: [],
      showingStimulus: false,
      waitingForResponse: false,
      isMatch: false,
      roundsInLevel: this.calculateRoundsForLevel(1),
      currentRound: 0,
      correctInLevel: 0,
      responseTime: null,
      feedback: null,
    };
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  private calculateRoundsForLevel(level: number): number {
    // More rounds as levels progress
    return 8 + level * 2;
  }

  private calculateNBack(level: number): number {
    // Level 1-3: 1-back, Level 4-6: 2-back, Level 7-9: 3-back, Level 10: 4-back
    if (level <= 3) return 1;
    if (level <= 6) return 2;
    if (level <= 9) return 3;
    return 4;
  }

  generateLevel(): void {
    const nBack = this.calculateNBack(this.state.level);

    this.gameState = {
      ...this.gameState,
      nBack,
      currentStimulus: null,
      stimulusHistory: [],
      showingStimulus: false,
      waitingForResponse: false,
      isMatch: false,
      roundsInLevel: this.calculateRoundsForLevel(this.state.level),
      currentRound: 0,
      correctInLevel: 0,
      responseTime: null,
      feedback: null,
    };

    this.notifyStateChange();

    // Start first stimulus after a brief delay
    setTimeout(() => this.showNextStimulus(), 1000);
  }

  private generateStimulus(forceMatch?: boolean): Stimulus {
    const history = this.gameState.stimulusHistory;
    const nBack = this.gameState.nBack;

    // If we have enough history and should create a match
    if (history.length >= nBack && forceMatch) {
      // Return the item from n positions ago
      return { ...history[history.length - nBack] };
    }

    // Generate random stimulus
    const shape = SHAPES[this.rng.nextInt(0, SHAPES.length - 1)];
    const color = COLORS[this.rng.nextInt(0, COLORS.length - 1)];
    const position = this.rng.nextInt(0, 8);

    return { shape, color, position };
  }

  private checkIsMatch(stimulus: Stimulus): boolean {
    const history = this.gameState.stimulusHistory;
    const nBack = this.gameState.nBack;

    if (history.length < nBack) return false;

    const nBackStimulus = history[history.length - nBack];

    // Match if shape AND position are the same (dual n-back style)
    return stimulus.shape === nBackStimulus.shape &&
           stimulus.position === nBackStimulus.position;
  }

  private showNextStimulus(): void {
    if (this.state.status !== 'playing') return;

    // Check if level complete
    if (this.gameState.currentRound >= this.gameState.roundsInLevel) {
      this.completeLevelCheck();
      return;
    }

    // Decide if this should be a match (~30% match rate for good difficulty)
    const shouldBeMatch = this.gameState.stimulusHistory.length >= this.gameState.nBack &&
                          this.rng.next() < 0.3;

    const stimulus = this.generateStimulus(shouldBeMatch);
    const isMatch = this.checkIsMatch(stimulus);

    this.gameState = {
      ...this.gameState,
      currentStimulus: stimulus,
      showingStimulus: true,
      waitingForResponse: true,
      isMatch,
      currentRound: this.gameState.currentRound + 1,
      responseTime: null,
      feedback: null,
    };

    this.stimulusStartTime = Date.now();
    this.notifyStateChange();

    // Hide stimulus after display time (varies by n-back level)
    const displayTime = Math.max(1500 - this.gameState.nBack * 200, 800);

    this.stimulusTimeout = setTimeout(() => {
      this.gameState.showingStimulus = false;
      this.notifyStateChange();
    }, displayTime);

    // Set response timeout
    const responseWindow = Math.max(2500 - this.gameState.nBack * 300, 1500);

    this.responseTimeout = setTimeout(() => {
      if (this.gameState.waitingForResponse) {
        this.handleTimeout();
      }
    }, responseWindow);
  }

  private handleTimeout(): void {
    // Timeout counts as incorrect only if it was a match
    if (this.gameState.isMatch) {
      this.mistake();
      this.gameState.feedback = 'timeout';
    } else {
      // No response on non-match is correct (user correctly didn't press)
      this.correct(5);
      this.gameState.correctInLevel++;
      this.gameState.feedback = 'correct';
    }

    this.gameState.waitingForResponse = false;
    this.finalizeRound();
  }

  handleInput(input: 'match' | 'no-match'): void {
    if (!this.gameState.waitingForResponse || this.state.status !== 'playing') return;

    // Clear timeouts
    if (this.responseTimeout) {
      clearTimeout(this.responseTimeout);
      this.responseTimeout = null;
    }

    const responseTime = Date.now() - this.stimulusStartTime;
    this.gameState.responseTime = responseTime;
    this.gameState.waitingForResponse = false;

    // Add current stimulus to history before evaluating
    if (this.gameState.currentStimulus) {
      this.gameState.stimulusHistory.push(this.gameState.currentStimulus);
    }

    const userSaysMatch = input === 'match';
    const isCorrect = userSaysMatch === this.gameState.isMatch;

    if (isCorrect) {
      // Bonus points for fast responses
      const speedBonus = Math.max(0, Math.floor((2000 - responseTime) / 100));
      this.correct(10 + speedBonus);
      this.gameState.correctInLevel++;
      this.gameState.feedback = 'correct';
    } else {
      this.mistake();
      this.gameState.feedback = 'incorrect';
    }

    this.finalizeRound();
  }

  private finalizeRound(): void {
    this.notifyStateChange();

    // Show feedback briefly, then next stimulus
    this.feedbackTimeout = setTimeout(() => {
      this.gameState.feedback = null;

      // Add to history if not already added (for timeout cases)
      if (this.gameState.currentStimulus &&
          !this.gameState.stimulusHistory.includes(this.gameState.currentStimulus)) {
        this.gameState.stimulusHistory.push(this.gameState.currentStimulus);
      }

      // Keep history limited to what we need
      const maxHistory = this.gameState.nBack + 5;
      if (this.gameState.stimulusHistory.length > maxHistory) {
        this.gameState.stimulusHistory = this.gameState.stimulusHistory.slice(-maxHistory);
      }

      this.showNextStimulus();
    }, 500);
  }

  private completeLevelCheck(): void {
    // Need 70% correct to pass level
    const accuracy = this.gameState.correctInLevel / this.gameState.roundsInLevel;

    if (accuracy >= 0.7) {
      this.levelComplete(Math.floor(accuracy * 50));
    } else {
      // Failed level
      this.gameComplete('lose');
    }
  }

  getGameState(): SpeedMatchState {
    return { ...this.gameState };
  }

  // Clean up timeouts
  cleanup(): void {
    if (this.stimulusTimeout) clearTimeout(this.stimulusTimeout);
    if (this.responseTimeout) clearTimeout(this.responseTimeout);
    if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
  }
}
