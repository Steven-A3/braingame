import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

// Common 4-letter words for the game
const WORD_LIST = [
  'able', 'acid', 'aged', 'also', 'area', 'army', 'away', 'baby', 'back', 'ball',
  'band', 'bank', 'base', 'bath', 'bear', 'beat', 'been', 'beer', 'bell', 'belt',
  'best', 'bill', 'bird', 'blow', 'blue', 'boat', 'body', 'bomb', 'bond', 'bone',
  'book', 'boom', 'born', 'boss', 'both', 'bowl', 'bulk', 'burn', 'bush', 'busy',
  'call', 'calm', 'came', 'camp', 'card', 'care', 'case', 'cash', 'cast', 'cell',
  'chat', 'chip', 'city', 'club', 'coal', 'coat', 'code', 'cold', 'come', 'cook',
  'cool', 'cope', 'copy', 'core', 'cost', 'dark', 'data', 'date', 'dawn', 'days',
  'dead', 'deal', 'dear', 'debt', 'deep', 'deny', 'desk', 'dial', 'diet', 'dirt',
  'disc', 'disk', 'does', 'done', 'door', 'dose', 'down', 'draw', 'drew', 'drop',
  'drug', 'dual', 'duke', 'dust', 'duty', 'each', 'earn', 'ease', 'east', 'easy',
  'edge', 'else', 'even', 'ever', 'evil', 'exam', 'exit', 'face', 'fact', 'fail',
  'fair', 'fall', 'fame', 'farm', 'fast', 'fate', 'fear', 'feed', 'feel', 'feet',
  'fell', 'felt', 'file', 'fill', 'film', 'find', 'fine', 'fire', 'firm', 'fish',
  'five', 'flat', 'flow', 'food', 'foot', 'ford', 'form', 'fort', 'four', 'free',
  'from', 'fuel', 'full', 'fund', 'gain', 'game', 'gate', 'gave', 'gear', 'gene',
  'gift', 'girl', 'give', 'glad', 'goal', 'goes', 'gold', 'golf', 'gone', 'good',
  'gray', 'grew', 'grey', 'grow', 'gulf', 'hair', 'half', 'hall', 'hand', 'hang',
  'hard', 'harm', 'hate', 'have', 'head', 'hear', 'heat', 'held', 'hell', 'help',
  'here', 'hero', 'high', 'hill', 'hire', 'hold', 'hole', 'holy', 'home', 'hope',
  'host', 'hour', 'huge', 'hung', 'hunt', 'hurt', 'idea', 'inch', 'into', 'iron',
  'item', 'jack', 'jane', 'jean', 'john', 'join', 'jump', 'jury', 'just', 'keen',
  'keep', 'kent', 'kept', 'kick', 'kill', 'kind', 'king', 'knee', 'knew', 'know',
  'lack', 'lady', 'laid', 'lake', 'land', 'lane', 'last', 'late', 'lead', 'left',
  'lend', 'less', 'life', 'lift', 'like', 'line', 'link', 'list', 'live', 'load',
  'loan', 'lock', 'logo', 'long', 'look', 'lord', 'lose', 'loss', 'lost', 'love',
  'luck', 'made', 'mail', 'main', 'make', 'male', 'many', 'mark', 'mass', 'mate',
  'meal', 'mean', 'meat', 'meet', 'mile', 'milk', 'mill', 'mind', 'mine', 'miss',
  'mode', 'mood', 'moon', 'more', 'most', 'move', 'much', 'must', 'name', 'near',
  'neck', 'need', 'news', 'next', 'nice', 'nine', 'none', 'nose', 'note', 'okay',
  'once', 'only', 'onto', 'open', 'oral', 'over', 'pace', 'pack', 'page', 'paid',
  'pain', 'pair', 'pale', 'palm', 'park', 'part', 'pass', 'past', 'path', 'peak',
  'pick', 'pine', 'pink', 'pipe', 'plan', 'play', 'plot', 'plug', 'plus', 'poem',
  'poet', 'poll', 'pool', 'poor', 'port', 'post', 'pull', 'pure', 'push', 'race',
  'rain', 'rank', 'rare', 'rate', 'read', 'real', 'rear', 'rely', 'rent', 'rest',
  'rice', 'rich', 'ride', 'ring', 'rise', 'risk', 'road', 'rock', 'role', 'roll',
  'roof', 'room', 'root', 'rose', 'rule', 'rush', 'safe', 'said', 'sake', 'sale',
  'salt', 'same', 'sand', 'save', 'seat', 'seek', 'seem', 'seen', 'self', 'sell',
  'send', 'sent', 'ship', 'shop', 'shot', 'show', 'shut', 'sick', 'side', 'sign',
  'site', 'size', 'skin', 'slip', 'slow', 'snow', 'soft', 'soil', 'sold', 'sole',
  'some', 'song', 'soon', 'sort', 'soul', 'spot', 'star', 'stay', 'step', 'stop',
  'such', 'suit', 'sure', 'take', 'tale', 'talk', 'tall', 'tank', 'tape', 'task',
  'team', 'tell', 'tend', 'term', 'test', 'text', 'than', 'that', 'them', 'then',
  'they', 'thin', 'this', 'thus', 'till', 'time', 'tiny', 'told', 'tone', 'took',
  'tool', 'tour', 'town', 'tree', 'trip', 'true', 'tune', 'turn', 'twin', 'type',
  'unit', 'upon', 'used', 'user', 'vary', 'vast', 'very', 'vice', 'view', 'vote',
  'wage', 'wait', 'wake', 'walk', 'wall', 'want', 'warm', 'wash', 'wave', 'ways',
  'weak', 'wear', 'week', 'well', 'went', 'were', 'west', 'what', 'when', 'whom',
  'wide', 'wife', 'wild', 'will', 'wind', 'wine', 'wing', 'wire', 'wise', 'wish',
  'with', 'wood', 'word', 'wore', 'work', 'worn', 'wrap', 'yard', 'yeah', 'year',
  'your', 'zero', 'zone'
];

// Pre-computed word connections
const WORD_SET = new Set(WORD_LIST);

export interface WordMorphLevel {
  startWord: string;
  targetWord: string;
  optimalSteps: number;
  currentWord: string;
  moves: string[];
}

export class WordMorphEngine extends GameEngine {
  readonly category: GameCategory = 'language';
  readonly maxLevels = 8;

  private currentLevel: WordMorphLevel | null = null;

  constructor(config: GameConfig) {
    super(config);
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  generateLevel(): void {
    const level = this.state.level;

    // Find a valid word pair with a path
    const { start, end, steps } = this.findWordPair(level);

    this.currentLevel = {
      startWord: start,
      targetWord: end,
      optimalSteps: steps,
      currentWord: start,
      moves: [start],
    };

    this.notifyStateChange();
  }

  private findWordPair(level: number): { start: string; end: string; steps: number } {
    // Target path length based on level
    const targetSteps = Math.min(2 + Math.floor(level / 2), 5);

    // Try multiple times to find a good pair
    for (let attempt = 0; attempt < 50; attempt++) {
      const start = this.rng.pick(WORD_LIST);
      const result = this.findWordAtDistance(start, targetSteps);

      if (result) {
        return { start, end: result.word, steps: result.distance };
      }
    }

    // Fallback to a known good pair
    const fallbacks = [
      { start: 'cold', end: 'warm', steps: 4 },
      { start: 'head', end: 'tail', steps: 4 },
      { start: 'love', end: 'hate', steps: 3 },
      { start: 'dark', end: 'light', steps: 5 },
    ];

    return this.rng.pick(fallbacks);
  }

  private findWordAtDistance(start: string, targetDistance: number): { word: string; distance: number } | null {
    const visited = new Map<string, number>();
    const queue: { word: string; distance: number }[] = [{ word: start, distance: 0 }];
    visited.set(start, 0);

    const candidates: { word: string; distance: number }[] = [];

    while (queue.length > 0 && candidates.length < 10) {
      const current = queue.shift()!;

      if (current.distance === targetDistance) {
        candidates.push(current);
        continue;
      }

      if (current.distance > targetDistance) continue;

      // Find neighbors
      const neighbors = this.getNeighbors(current.word);

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.set(neighbor, current.distance + 1);
          queue.push({ word: neighbor, distance: current.distance + 1 });
        }
      }
    }

    return candidates.length > 0 ? this.rng.pick(candidates) : null;
  }

  private getNeighbors(word: string): string[] {
    const neighbors: string[] = [];
    const letters = 'abcdefghijklmnopqrstuvwxyz';

    for (let i = 0; i < word.length; i++) {
      for (const letter of letters) {
        if (letter !== word[i]) {
          const newWord = word.slice(0, i) + letter + word.slice(i + 1);
          if (WORD_SET.has(newWord)) {
            neighbors.push(newWord);
          }
        }
      }
    }

    return neighbors;
  }

  getCurrentLevel(): WordMorphLevel | null {
    return this.currentLevel;
  }

  getValidMoves(): string[] {
    if (!this.currentLevel) return [];
    return this.getNeighbors(this.currentLevel.currentWord);
  }

  handleInput(word: string): void {
    if (!this.currentLevel || this.state.status !== 'playing') return;

    const lowerWord = word.toLowerCase().trim();

    // Check if it's a valid word
    if (!WORD_SET.has(lowerWord)) {
      // Invalid word - don't count as mistake, just reject
      return;
    }

    // Check if it's one letter different from current word
    if (!this.isOneLetterDifferent(this.currentLevel.currentWord, lowerWord)) {
      return;
    }

    // Check if already used
    if (this.currentLevel.moves.includes(lowerWord)) {
      return;
    }

    // Valid move!
    this.currentLevel.moves.push(lowerWord);
    this.currentLevel.currentWord = lowerWord;
    this.correct(20);

    // Check if reached target
    if (lowerWord === this.currentLevel.targetWord) {
      const stepsUsed = this.currentLevel.moves.length - 1;
      const efficiency = this.currentLevel.optimalSteps / stepsUsed;
      const bonus = Math.round(efficiency * 50);
      this.levelComplete(bonus);
    }

    this.notifyStateChange();
  }

  private isOneLetterDifferent(word1: string, word2: string): boolean {
    if (word1.length !== word2.length) return false;

    let differences = 0;
    for (let i = 0; i < word1.length; i++) {
      if (word1[i] !== word2[i]) differences++;
    }

    return differences === 1;
  }

  undoMove(): void {
    if (!this.currentLevel || this.currentLevel.moves.length <= 1) return;

    this.currentLevel.moves.pop();
    this.currentLevel.currentWord = this.currentLevel.moves[this.currentLevel.moves.length - 1];
    this.notifyStateChange();
  }
}
