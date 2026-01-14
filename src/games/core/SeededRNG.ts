/**
 * Seeded Random Number Generator using Mulberry32 algorithm
 * Ensures all players get the same puzzle on the same day
 */
export class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate random float between min and max
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Pick random item from array
   */
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Pick n random items from array (without replacement)
   */
  pickMultiple<T>(array: T[], n: number): T[] {
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, Math.min(n, array.length));
  }

  /**
   * Return true with given probability (0-1)
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

/**
 * Generate daily seed from date
 * All users playing on the same day get the same seed
 */
export function getDailySeed(date: Date = new Date()): number {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const daysSinceEpoch = Math.floor(utcDate.getTime() / 86400000);
  return daysSinceEpoch;
}

/**
 * Generate seed for specific game on specific date
 */
export function getGameSeed(gameId: string, date: Date = new Date()): number {
  const dailySeed = getDailySeed(date);
  const gameHash = hashString(gameId);
  return hashCombine(dailySeed, gameHash);
}

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Combine two hash values
 */
function hashCombine(a: number, b: number): number {
  return a ^ (b + 0x9e3779b9 + (a << 6) + (a >> 2));
}

/**
 * Get formatted date string for display
 */
export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}
