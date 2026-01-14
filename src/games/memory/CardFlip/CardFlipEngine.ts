import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export type CardSymbol = '🍎' | '🍊' | '🍋' | '🍇' | '🍓' | '🍒' | '🥝' | '🍑' | '🌟' | '🌙' | '💎' | '🔷' | '🔶' | '🟣' | '🟢' | '🔴';

export interface Card {
  id: number;
  symbol: CardSymbol;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface CardFlipState {
  cards: Card[];
  flippedCards: number[];
  matchedPairs: number;
  totalPairs: number;
  moves: number;
  canFlip: boolean;
  lastMatchCorrect: boolean | null;
  gridSize: { rows: number; cols: number };
}

const ALL_SYMBOLS: CardSymbol[] = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑', '🌟', '🌙', '💎', '🔷', '🔶', '🟣', '🟢', '🔴'];

export class CardFlipEngine extends GameEngine {
  readonly category: GameCategory = 'memory';
  readonly maxLevels = 10;

  private gameState: CardFlipState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    moves: 0,
    canFlip: true,
    lastMatchCorrect: null,
    gridSize: { rows: 2, cols: 2 },
  };

  private flipTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(config: GameConfig) {
    super(config);
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  private getGridSize(level: number): { rows: number; cols: number; pairs: number } {
    // Progressive grid sizes
    const grids = [
      { rows: 2, cols: 2, pairs: 2 },   // Level 1: 4 cards
      { rows: 2, cols: 3, pairs: 3 },   // Level 2: 6 cards
      { rows: 2, cols: 4, pairs: 4 },   // Level 3: 8 cards
      { rows: 3, cols: 4, pairs: 6 },   // Level 4: 12 cards
      { rows: 4, cols: 4, pairs: 8 },   // Level 5: 16 cards
      { rows: 4, cols: 5, pairs: 10 },  // Level 6: 20 cards
      { rows: 4, cols: 6, pairs: 12 },  // Level 7: 24 cards
      { rows: 5, cols: 6, pairs: 15 },  // Level 8: 30 cards
      { rows: 6, cols: 6, pairs: 18 },  // Level 9: 36 cards (use 16 symbols, some repeat)
      { rows: 6, cols: 6, pairs: 18 },  // Level 10: Same but fewer moves allowed
    ];
    return grids[Math.min(level - 1, grids.length - 1)];
  }

  generateLevel(): void {
    const { rows, cols, pairs } = this.getGridSize(this.state.level);

    // Select symbols for this level
    const symbols = this.rng.shuffle([...ALL_SYMBOLS]).slice(0, pairs);

    // Create pairs of cards
    let cards: Card[] = [];
    let id = 0;

    for (const symbol of symbols) {
      cards.push({ id: id++, symbol, isFlipped: false, isMatched: false });
      cards.push({ id: id++, symbol, isFlipped: false, isMatched: false });
    }

    // Shuffle cards
    cards = this.rng.shuffle(cards);

    this.gameState = {
      cards,
      flippedCards: [],
      matchedPairs: 0,
      totalPairs: pairs,
      moves: 0,
      canFlip: true,
      lastMatchCorrect: null,
      gridSize: { rows, cols },
    };

    this.notifyStateChange();
  }

  handleInput(cardId: number): void {
    if (this.state.status !== 'playing' || !this.gameState.canFlip) return;

    const cardIndex = this.gameState.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = this.gameState.cards[cardIndex];

    // Can't flip already flipped or matched cards
    if (card.isFlipped || card.isMatched) return;

    // Can't flip more than 2 cards
    if (this.gameState.flippedCards.length >= 2) return;

    // Flip the card
    card.isFlipped = true;
    this.gameState.flippedCards.push(cardId);
    this.gameState.lastMatchCorrect = null;

    // Check for match if 2 cards flipped
    if (this.gameState.flippedCards.length === 2) {
      this.gameState.moves++;
      this.gameState.canFlip = false;
      this.checkMatch();
    }

    this.notifyStateChange();
  }

  private checkMatch(): void {
    const [id1, id2] = this.gameState.flippedCards;
    const card1 = this.gameState.cards.find(c => c.id === id1)!;
    const card2 = this.gameState.cards.find(c => c.id === id2)!;

    const isMatch = card1.symbol === card2.symbol;

    this.flipTimeout = setTimeout(() => {
      if (isMatch) {
        // Mark as matched
        card1.isMatched = true;
        card2.isMatched = true;
        this.gameState.matchedPairs++;
        this.gameState.lastMatchCorrect = true;

        // Score based on level and efficiency
        const efficiencyBonus = Math.max(0, 20 - this.gameState.moves) * 2;
        this.correct(25 + efficiencyBonus);

        // Check if level complete
        if (this.gameState.matchedPairs === this.gameState.totalPairs) {
          this.completeLevelWithBonus();
          return;
        }
      } else {
        // Flip cards back
        card1.isFlipped = false;
        card2.isFlipped = false;
        this.gameState.lastMatchCorrect = false;
        this.updateAccuracy(false);
      }

      this.gameState.flippedCards = [];
      this.gameState.canFlip = true;
      this.notifyStateChange();
    }, 800);
  }

  private completeLevelWithBonus(): void {
    // Calculate bonus based on efficiency (fewer moves = better)
    const optimalMoves = this.gameState.totalPairs; // Perfect memory
    const efficiency = optimalMoves / this.gameState.moves;
    const bonus = Math.floor(efficiency * 100);

    this.levelComplete(bonus);
  }

  getGameState(): CardFlipState {
    return {
      ...this.gameState,
      cards: this.gameState.cards.map(c => ({ ...c })),
    };
  }

  cleanup(): void {
    if (this.flipTimeout) {
      clearTimeout(this.flipTimeout);
      this.flipTimeout = null;
    }
  }
}
