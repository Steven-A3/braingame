import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface SetCard {
  id: number;
  shape: 'circle' | 'square' | 'triangle';
  color: 'red' | 'blue' | 'green';
  count: 1 | 2 | 3;
  fill: 'solid' | 'striped' | 'empty';
  isSelected: boolean;
}

export interface SetFinderState {
  cards: SetCard[];
  selectedCards: number[];
  validSets: number[][];
  setsFound: number;
  setsNeeded: number;
  timeRemaining: number;
  totalTime: number;
  feedback: 'correct' | 'wrong' | null;
  streak: number;
  hintUsed: boolean;
}

export class SetFinderEngine extends GameEngine {
  readonly category: GameCategory = 'logic';
  readonly maxLevels = 10;

  private setFinderState: SetFinderState;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: GameConfig) {
    super(config);
    this.setFinderState = this.createInitialState();
  }

  generateLevel(): void {
    this.startNewRound();
  }

  private createInitialState(): SetFinderState {
    return {
      cards: [],
      selectedCards: [],
      validSets: [],
      setsFound: 0,
      setsNeeded: this.getSetsNeededForLevel(),
      timeRemaining: this.getTimeForLevel(),
      totalTime: this.getTimeForLevel(),
      feedback: null,
      streak: 0,
      hintUsed: false,
    };
  }

  private getTimeForLevel(): number {
    return Math.max(90 - (this.state.level - 1) * 5, 45);
  }

  private getSetsNeededForLevel(): number {
    return Math.min(3 + Math.floor(this.state.level / 2), 8);
  }

  private getCardCount(): number {
    // More cards at higher levels
    if (this.state.level <= 3) return 9;
    if (this.state.level <= 6) return 12;
    return 15;
  }

  private generateAllCards(): SetCard[] {
    const shapes: SetCard['shape'][] = ['circle', 'square', 'triangle'];
    const colors: SetCard['color'][] = ['red', 'blue', 'green'];
    const counts: SetCard['count'][] = [1, 2, 3];
    const fills: SetCard['fill'][] = ['solid', 'striped', 'empty'];

    const allCards: SetCard[] = [];
    let id = 0;

    for (const shape of shapes) {
      for (const color of colors) {
        for (const count of counts) {
          for (const fill of fills) {
            allCards.push({
              id: id++,
              shape,
              color,
              count,
              fill,
              isSelected: false,
            });
          }
        }
      }
    }

    return allCards;
  }

  private isValidSet(cards: SetCard[]): boolean {
    if (cards.length !== 3) return false;

    // For each attribute, must be all same or all different
    const checkAttribute = <T>(values: T[]): boolean => {
      const unique = new Set(values);
      return unique.size === 1 || unique.size === 3;
    };

    return (
      checkAttribute(cards.map((c) => c.shape)) &&
      checkAttribute(cards.map((c) => c.color)) &&
      checkAttribute(cards.map((c) => c.count)) &&
      checkAttribute(cards.map((c) => c.fill))
    );
  }

  private findAllValidSets(cards: SetCard[]): number[][] {
    const validSets: number[][] = [];

    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          if (this.isValidSet([cards[i], cards[j], cards[k]])) {
            validSets.push([cards[i].id, cards[j].id, cards[k].id]);
          }
        }
      }
    }

    return validSets;
  }

  private startNewRound(): void {
    const cardCount = this.getCardCount();
    const allCards = this.generateAllCards();

    // Shuffle all cards
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = this.rng.nextInt(0, i);
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    // Select cards ensuring at least one valid set exists
    let selectedCards: SetCard[] = [];
    let validSets: number[][] = [];

    // Try to find a good set of cards
    for (let attempt = 0; attempt < 100; attempt++) {
      // Shuffle again
      for (let i = allCards.length - 1; i > 0; i--) {
        const j = this.rng.nextInt(0, i);
        [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
      }

      selectedCards = allCards.slice(0, cardCount).map((card, idx) => ({
        ...card,
        id: idx,
        isSelected: false,
      }));

      validSets = this.findAllValidSets(selectedCards);

      // Need at least as many sets as required
      if (validSets.length >= this.setFinderState.setsNeeded) {
        break;
      }
    }

    this.setFinderState = {
      ...this.setFinderState,
      cards: selectedCards,
      selectedCards: [],
      validSets,
      setsFound: 0,
      setsNeeded: this.getSetsNeededForLevel(),
      timeRemaining: this.getTimeForLevel(),
      totalTime: this.getTimeForLevel(),
      feedback: null,
      hintUsed: false,
    };

    this.notifyStateChange();
    this.startTimer();
  }

  private startTimer(): void {
    this.clearTimers();

    this.timerInterval = setInterval(() => {
      this.setFinderState.timeRemaining -= 0.1;

      if (this.setFinderState.timeRemaining <= 0) {
        this.handleTimeout();
      }

      this.notifyStateChange();
    }, 100);
  }

  private handleTimeout(): void {
    this.clearTimers();
    this.state.lives--;
    this.notifyStateChange();

    if (this.state.lives <= 0) {
      this.feedbackTimer = setTimeout(() => {
        this.gameComplete('lose');
      }, 1500);
      return;
    }

    this.feedbackTimer = setTimeout(() => {
      if (this.state.level >= this.state.maxLevel) {
        this.gameComplete('win');
      } else {
        this.state.level++;
        this.setFinderState = this.createInitialState();
        this.state.status = 'ready';
        this.notifyStateChange();
      }
    }, 1500);
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  start(): void {
    this.state.status = 'playing';
    this.state.startTime = Date.now();
    this.setFinderState = this.createInitialState();
    this.generateLevel();
  }

  handleInput(input: { type: 'select' | 'hint'; cardId?: number }): void {
    if (this.state.status !== 'playing') return;

    if (input.type === 'hint') {
      this.handleHint();
      return;
    }

    if (input.type === 'select' && input.cardId !== undefined) {
      this.handleCardSelect(input.cardId);
    }
  }

  private handleHint(): void {
    if (this.setFinderState.hintUsed) return;
    if (this.setFinderState.validSets.length === 0) return;

    this.setFinderState.hintUsed = true;

    // Highlight one card from a valid set
    const validSet = this.setFinderState.validSets[0];
    const hintCardId = validSet[0];
    const card = this.setFinderState.cards.find((c) => c.id === hintCardId);
    if (card) {
      card.isSelected = true;
      this.setFinderState.selectedCards = [hintCardId];
    }

    this.notifyStateChange();
  }

  private handleCardSelect(cardId: number): void {
    if (this.setFinderState.feedback !== null) return;

    const card = this.setFinderState.cards.find((c) => c.id === cardId);
    if (!card) return;

    // Toggle selection
    if (card.isSelected) {
      card.isSelected = false;
      this.setFinderState.selectedCards = this.setFinderState.selectedCards.filter(
        (id) => id !== cardId
      );
    } else {
      card.isSelected = true;
      this.setFinderState.selectedCards.push(cardId);
    }

    this.notifyStateChange();

    // Check if 3 cards selected
    if (this.setFinderState.selectedCards.length === 3) {
      this.checkSet();
    }
  }

  private checkSet(): void {
    const selectedCards = this.setFinderState.selectedCards
      .map((id) => this.setFinderState.cards.find((c) => c.id === id))
      .filter((c): c is SetCard => c !== undefined);

    if (this.isValidSet(selectedCards)) {
      this.handleCorrectSet();
    } else {
      this.handleWrongSet();
    }
  }

  private handleCorrectSet(): void {
    this.setFinderState.feedback = 'correct';
    this.setFinderState.streak++;
    this.setFinderState.setsFound++;

    // Score calculation
    const baseScore = 100;
    const streakBonus = Math.min(this.setFinderState.streak * 15, 75);
    const hintPenalty = this.setFinderState.hintUsed ? 25 : 0;
    this.state.score += Math.max(baseScore + streakBonus - hintPenalty, 50);

    // Remove the valid set from tracking
    const selectedSet = [...this.setFinderState.selectedCards].sort((a, b) => a - b);
    this.setFinderState.validSets = this.setFinderState.validSets.filter(
      (set) => {
        const sortedSet = [...set].sort((a, b) => a - b);
        return !(
          sortedSet[0] === selectedSet[0] &&
          sortedSet[1] === selectedSet[1] &&
          sortedSet[2] === selectedSet[2]
        );
      }
    );

    this.notifyStateChange();

    this.feedbackTimer = setTimeout(() => {
      // Deselect cards
      this.setFinderState.cards.forEach((c) => (c.isSelected = false));
      this.setFinderState.selectedCards = [];
      this.setFinderState.feedback = null;
      this.setFinderState.hintUsed = false;

      // Check if level complete
      if (this.setFinderState.setsFound >= this.setFinderState.setsNeeded) {
        this.clearTimers();
        if (this.state.level >= this.state.maxLevel) {
          this.gameComplete('win');
        } else {
          this.state.level++;
          this.setFinderState = this.createInitialState();
          this.state.status = 'ready';
        }
      }

      this.notifyStateChange();
    }, 1000);
  }

  private handleWrongSet(): void {
    this.setFinderState.feedback = 'wrong';
    this.setFinderState.streak = 0;
    this.state.lives--;

    this.notifyStateChange();

    if (this.state.lives <= 0) {
      this.clearTimers();
      this.feedbackTimer = setTimeout(() => {
        this.gameComplete('lose');
      }, 1500);
      return;
    }

    this.feedbackTimer = setTimeout(() => {
      // Deselect cards
      this.setFinderState.cards.forEach((c) => (c.isSelected = false));
      this.setFinderState.selectedCards = [];
      this.setFinderState.feedback = null;
      this.notifyStateChange();
    }, 1000);
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

  getGameState(): SetFinderState {
    return { ...this.setFinderState };
  }

  cleanup(): void {
    this.clearTimers();
  }
}
