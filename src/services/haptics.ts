/**
 * Haptics Service - Provides tactile feedback using Vibration API
 * Falls back gracefully on unsupported devices
 */

type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'error'
  | 'warning'
  | 'selection'
  | 'impact';

// Vibration patterns (in milliseconds)
const patterns: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 30], // Short, pause, longer
  error: [50, 30, 50, 30, 50], // Triple buzz
  warning: [30, 50, 30], // Double tap
  selection: 15,
  impact: [5, 10, 40], // Build-up impact
};

function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

export function vibrate(type: HapticType): void {
  if (!canVibrate()) return;

  try {
    navigator.vibrate(patterns[type]);
  } catch {
    // Silently fail - vibration is non-essential
  }
}

// Convenience functions
export function lightTap(): void {
  vibrate('light');
}

export function mediumTap(): void {
  vibrate('medium');
}

export function heavyTap(): void {
  vibrate('heavy');
}

export function successVibrate(): void {
  vibrate('success');
}

export function errorVibrate(): void {
  vibrate('error');
}

export function warningVibrate(): void {
  vibrate('warning');
}

export function selectionVibrate(): void {
  vibrate('selection');
}

export function impactVibrate(): void {
  vibrate('impact');
}

// Stop any ongoing vibration
export function stopVibration(): void {
  if (canVibrate()) {
    navigator.vibrate(0);
  }
}

// Custom pattern support
export function customVibrate(pattern: number | number[]): void {
  if (!canVibrate()) return;

  try {
    navigator.vibrate(pattern);
  } catch {
    // Silently fail
  }
}
