import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface WordItem {
  id: number;
  word: string;
  category: string;
  isPlaced: boolean;
}

export interface CategoryBucket {
  name: string;
  words: string[];
  capacity: number;
}

export interface WordCategoriesState {
  words: WordItem[];
  categories: CategoryBucket[];
  currentWord: WordItem | null;
  timeRemaining: number;
  totalTime: number;
  correctPlacements: number;
  totalPlacements: number;
  feedback: 'correct' | 'wrong' | null;
  streak: number;
  roundsCompleted: number;
  roundsInLevel: number;
}

const CATEGORY_DATA: { category: string; words: string[] }[] = [
  { category: 'Animals', words: ['dog', 'cat', 'lion', 'eagle', 'shark', 'whale', 'tiger', 'bear', 'wolf', 'fox', 'deer', 'rabbit'] },
  { category: 'Fruits', words: ['apple', 'banana', 'orange', 'grape', 'mango', 'peach', 'pear', 'cherry', 'lemon', 'lime', 'plum', 'melon'] },
  { category: 'Colors', words: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white', 'gray', 'gold'] },
  { category: 'Countries', words: ['France', 'Japan', 'Brazil', 'Egypt', 'India', 'Canada', 'Italy', 'Spain', 'China', 'Mexico', 'Kenya', 'Peru'] },
  { category: 'Sports', words: ['soccer', 'tennis', 'golf', 'hockey', 'boxing', 'skiing', 'surfing', 'cricket', 'rugby', 'cycling', 'swimming', 'running'] },
  { category: 'Vehicles', words: ['car', 'truck', 'bus', 'train', 'plane', 'boat', 'bike', 'taxi', 'van', 'subway', 'tram', 'ferry'] },
  { category: 'Furniture', words: ['chair', 'table', 'desk', 'bed', 'sofa', 'shelf', 'lamp', 'mirror', 'drawer', 'bench', 'stool', 'cabinet'] },
  { category: 'Weather', words: ['sunny', 'rainy', 'cloudy', 'windy', 'stormy', 'foggy', 'snowy', 'humid', 'cold', 'warm', 'hot', 'freezing'] },
  { category: 'Emotions', words: ['happy', 'sad', 'angry', 'scared', 'excited', 'nervous', 'calm', 'proud', 'shy', 'brave', 'tired', 'bored'] },
  { category: 'Tools', words: ['hammer', 'saw', 'drill', 'wrench', 'pliers', 'screwdriver', 'level', 'tape', 'chisel', 'clamp', 'file', 'knife'] },
  { category: 'Clothing', words: ['shirt', 'pants', 'dress', 'jacket', 'shoes', 'socks', 'hat', 'scarf', 'gloves', 'belt', 'coat', 'shorts'] },
  { category: 'Music', words: ['piano', 'guitar', 'drums', 'violin', 'flute', 'trumpet', 'bass', 'cello', 'harp', 'saxophone', 'clarinet', 'tuba'] },
];

export class WordCategoriesEngine extends GameEngine {
  readonly category: GameCategory = 'language';
  readonly maxLevels = 10;

  private categoriesState: WordCategoriesState;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: GameConfig) {
    super(config);
    this.categoriesState = this.createInitialState();
  }

  generateLevel(): void {
    this.startNewRound();
  }

  private createInitialState(): WordCategoriesState {
    return {
      words: [],
      categories: [],
      currentWord: null,
      timeRemaining: this.getTimeForLevel(),
      totalTime: this.getTimeForLevel(),
      correctPlacements: 0,
      totalPlacements: 0,
      feedback: null,
      streak: 0,
      roundsCompleted: 0,
      roundsInLevel: 3,
    };
  }

  private getTimeForLevel(): number {
    return Math.max(60 - (this.state.level - 1) * 3, 30);
  }

  private getCategoryCount(): number {
    if (this.state.level <= 3) return 2;
    if (this.state.level <= 6) return 3;
    return 4;
  }

  private getWordsPerCategory(): number {
    return Math.min(4 + Math.floor(this.state.level / 3), 6);
  }

  private startNewRound(): void {
    const categoryCount = this.getCategoryCount();
    const wordsPerCategory = this.getWordsPerCategory();

    // Select random categories
    const shuffledCategories = [...CATEGORY_DATA];
    for (let i = shuffledCategories.length - 1; i > 0; i--) {
      const j = this.rng.nextInt(0, i);
      [shuffledCategories[i], shuffledCategories[j]] = [shuffledCategories[j], shuffledCategories[i]];
    }

    const selectedCategories = shuffledCategories.slice(0, categoryCount);

    // Create category buckets
    const categories: CategoryBucket[] = selectedCategories.map((cat) => ({
      name: cat.category,
      words: [],
      capacity: wordsPerCategory,
    }));

    // Create word items
    const words: WordItem[] = [];
    let wordId = 0;

    selectedCategories.forEach((cat) => {
      // Shuffle words within category
      const shuffledWords = [...cat.words];
      for (let i = shuffledWords.length - 1; i > 0; i--) {
        const j = this.rng.nextInt(0, i);
        [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
      }

      // Take required number of words
      shuffledWords.slice(0, wordsPerCategory).forEach((word) => {
        words.push({
          id: wordId++,
          word,
          category: cat.category,
          isPlaced: false,
        });
      });
    });

    // Shuffle all words
    for (let i = words.length - 1; i > 0; i--) {
      const j = this.rng.nextInt(0, i);
      [words[i], words[j]] = [words[j], words[i]];
    }

    this.categoriesState = {
      ...this.categoriesState,
      words,
      categories,
      currentWord: words.find((w) => !w.isPlaced) || null,
      timeRemaining: this.getTimeForLevel(),
      totalTime: this.getTimeForLevel(),
      correctPlacements: 0,
      totalPlacements: words.length,
      feedback: null,
    };

    this.notifyStateChange();
    this.startTimer();
  }

  private startTimer(): void {
    this.clearTimers();

    this.timerInterval = setInterval(() => {
      this.categoriesState.timeRemaining -= 0.1;

      if (this.categoriesState.timeRemaining <= 0) {
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
      this.categoriesState.roundsCompleted++;
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
    this.categoriesState = this.createInitialState();
    this.generateLevel();
  }

  handleInput(categoryName: string): void {
    if (this.state.status !== 'playing') return;
    if (this.categoriesState.feedback !== null) return;
    if (!this.categoriesState.currentWord) return;

    const currentWord = this.categoriesState.currentWord;
    const targetCategory = this.categoriesState.categories.find((c) => c.name === categoryName);

    if (!targetCategory) return;

    if (currentWord.category === categoryName) {
      // Correct placement
      this.categoriesState.feedback = 'correct';
      this.categoriesState.streak++;
      this.categoriesState.correctPlacements++;

      currentWord.isPlaced = true;
      targetCategory.words.push(currentWord.word);

      // Score calculation
      const baseScore = 50;
      const streakBonus = Math.min(this.categoriesState.streak * 5, 25);
      this.state.score += baseScore + streakBonus;
    } else {
      // Wrong placement
      this.categoriesState.feedback = 'wrong';
      this.categoriesState.streak = 0;
      this.state.lives--;

      currentWord.isPlaced = true; // Still mark as placed to move on

      if (this.state.lives <= 0) {
        this.clearTimers();
        this.notifyStateChange();
        this.feedbackTimer = setTimeout(() => {
          this.gameComplete('lose');
        }, 1500);
        return;
      }
    }

    this.notifyStateChange();

    this.feedbackTimer = setTimeout(() => {
      this.categoriesState.feedback = null;

      // Find next unplaced word
      const nextWord = this.categoriesState.words.find((w) => !w.isPlaced);

      if (nextWord) {
        this.categoriesState.currentWord = nextWord;
        this.notifyStateChange();
      } else {
        // Round complete
        this.clearTimers();

        // Bonus for completing round
        const accuracy = this.categoriesState.correctPlacements / this.categoriesState.totalPlacements;
        const completionBonus = Math.round(accuracy * 100);
        this.state.score += completionBonus;

        this.categoriesState.roundsCompleted++;
        this.advanceRound();
      }
    }, 800);
  }

  private advanceRound(): void {
    if (this.categoriesState.roundsCompleted >= this.categoriesState.roundsInLevel) {
      if (this.state.level >= this.state.maxLevel) {
        this.gameComplete('win');
      } else {
        this.state.level++;
        this.categoriesState = this.createInitialState();
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

  getGameState(): WordCategoriesState {
    return { ...this.categoriesState };
  }

  cleanup(): void {
    this.clearTimers();
  }
}
