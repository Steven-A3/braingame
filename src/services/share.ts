import type { GameResult } from '@/games/core/types';
import { CATEGORY_ICONS } from '@/games/core/types';

export interface ShareData {
  title: string;
  text: string;
  url?: string;
}

// Score thresholds for stars
function getStars(score: number, maxScore: number = 500): number {
  const percentage = score / maxScore;
  if (percentage >= 0.9) return 5;
  if (percentage >= 0.7) return 4;
  if (percentage >= 0.5) return 3;
  if (percentage >= 0.3) return 2;
  return 1;
}

// Generate star emoji string
function getStarEmojis(stars: number): string {
  return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
}

// Generate accuracy bar
function getAccuracyBar(accuracy: number): string {
  const filled = Math.round(accuracy * 5);
  return '🟩'.repeat(filled) + '⬜'.repeat(5 - filled);
}

// Generate Wordle-style share text for a single game
export function generateShareText(result: GameResult, streak: number): string {
  const stars = getStars(result.score);
  const accuracyBar = getAccuracyBar(result.accuracy);
  const categoryIcon = CATEGORY_ICONS[result.category];
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const lines = [
    `🧠 Daily Brain - ${dateStr}`,
    '',
    `${categoryIcon} ${formatGameName(result.gameId)}`,
    `${getStarEmojis(stars)}`,
    '',
    `Score: ${result.score.toLocaleString()}`,
    `Accuracy: ${accuracyBar}`,
    `🔥 ${streak} day streak`,
    '',
    'https://dailybrain.one',
  ];

  return lines.join('\n');
}

// Generate share text for daily summary (multiple games)
export function generateDailySummaryText(
  results: GameResult[],
  streak: number,
  totalScore: number
): string {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Category performance grid
  const categoryGrid = results.map(r => {
    const stars = getStars(r.score);
    return `${CATEGORY_ICONS[r.category]} ${'🟩'.repeat(Math.min(stars, 5))}${'⬜'.repeat(5 - Math.min(stars, 5))}`;
  });

  const lines = [
    `🧠 Daily Brain - ${dateStr}`,
    '',
    ...categoryGrid,
    '',
    `Total: ${totalScore.toLocaleString()} pts`,
    `🔥 ${streak} day streak`,
    '',
    'https://dailybrain.one',
  ];

  return lines.join('\n');
}

// Check if Web Share API is available
export function canShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

// Check if clipboard is available
export function canCopyToClipboard(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.clipboard;
}

// Share using Web Share API
export async function shareResult(data: ShareData): Promise<boolean> {
  if (!canShare()) {
    return false;
  }

  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url,
    });
    return true;
  } catch (error) {
    // User cancelled or share failed
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Share failed:', error);
    }
    return false;
  }
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!canCopyToClipboard()) {
    // Fallback for older browsers
    return fallbackCopy(text);
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Copy failed:', error);
    return fallbackCopy(text);
  }
}

// Fallback copy method using textarea
function fallbackCopy(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

// Helper function to format game name
function formatGameName(gameId: string): string {
  return gameId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate a share image (returns data URL)
// This creates a simple canvas-based share image
export async function generateShareImage(
  result: GameResult,
  streak: number
): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 400, 400);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Daily Brain', 200, 50);

    // Date
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    ctx.fillStyle = '#94A3B8';
    ctx.font = '16px system-ui';
    ctx.fillText(dateStr, 200, 80);

    // Score
    ctx.fillStyle = '#818CF8';
    ctx.font = 'bold 64px system-ui';
    ctx.fillText(result.score.toLocaleString(), 200, 180);

    // Game name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px system-ui';
    ctx.fillText(formatGameName(result.gameId), 200, 230);

    // Stars
    const stars = getStars(result.score);
    ctx.font = '32px system-ui';
    ctx.fillText(getStarEmojis(stars), 200, 280);

    // Streak
    ctx.fillStyle = '#F97316';
    ctx.font = '20px system-ui';
    ctx.fillText(`🔥 ${streak} day streak`, 200, 330);

    // URL
    ctx.fillStyle = '#64748B';
    ctx.font = '14px system-ui';
    ctx.fillText('dailybrain.one', 200, 380);

    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}
