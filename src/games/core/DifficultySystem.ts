/**
 * Difficulty curve system
 * Adjusts difficulty based on day of week and month progression
 */

// Day of week modifiers (0 = Sunday)
const DAY_MODIFIERS: Record<number, number> = {
  0: 0.7,  // Sunday - Easy
  1: 0.8,  // Monday - Easy-Medium
  2: 0.9,  // Tuesday - Medium
  3: 1.0,  // Wednesday - Medium
  4: 1.1,  // Thursday - Medium-Hard
  5: 1.2,  // Friday - Hard
  6: 0.6,  // Saturday - Relaxed
};

/**
 * Calculate difficulty for a given date
 * @param baseDifficulty Base difficulty (1-10)
 * @param date Date to calculate for
 * @returns Adjusted difficulty (1-10)
 */
export function calculateDifficulty(baseDifficulty: number = 5, date: Date = new Date()): number {
  const dayMod = DAY_MODIFIERS[date.getDay()];
  const monthProgress = date.getDate() / 30; // Progress through month (0-1)
  const monthMod = 0.8 + monthProgress * 0.4; // Scale from 0.8 to 1.2

  const adjusted = baseDifficulty * dayMod * monthMod;
  return Math.max(1, Math.min(10, Math.round(adjusted)));
}

/**
 * Get difficulty label for display
 */
export function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return 'Easy';
  if (difficulty <= 4) return 'Medium';
  if (difficulty <= 6) return 'Moderate';
  if (difficulty <= 8) return 'Hard';
  return 'Expert';
}

/**
 * Get difficulty color for display
 */
export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 2) return '#10b981'; // Green
  if (difficulty <= 4) return '#3b82f6'; // Blue
  if (difficulty <= 6) return '#f59e0b'; // Yellow
  if (difficulty <= 8) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

/**
 * Get number of stars (1-5) based on score percentage
 */
export function calculateStars(score: number, maxPossibleScore: number): number {
  const percentage = score / maxPossibleScore;
  if (percentage >= 0.95) return 5;
  if (percentage >= 0.80) return 4;
  if (percentage >= 0.60) return 3;
  if (percentage >= 0.40) return 2;
  return 1;
}

/**
 * Get estimated duration based on game and difficulty
 */
export function getEstimatedDuration(baseMinutes: number, difficulty: number): string {
  const adjusted = baseMinutes * (0.8 + difficulty * 0.05);
  const minutes = Math.round(adjusted);
  return minutes === 1 ? '~1 min' : `~${minutes} min`;
}
