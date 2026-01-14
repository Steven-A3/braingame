// Add-to-Home-Screen (A2HS) Manager
// Captures the beforeinstallprompt event and provides smart timing for the install prompt

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface A2HSState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  isInstalled: boolean;
  promptShown: boolean;
  installDeclined: boolean;
}

// Singleton state
const state: A2HSState = {
  deferredPrompt: null,
  isInstallable: false,
  isInstalled: false,
  promptShown: false,
  installDeclined: false,
};

// Listeners
const listeners: Set<() => void> = new Set();

// Initialize A2HS manager
export function initA2HS(): void {
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    state.isInstalled = true;
    notifyListeners();
    return;
  }

  // iOS Safari detection
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  if (isIOS && isSafari && !state.isInstalled) {
    // iOS needs manual A2HS, but we can still show a prompt
    state.isInstallable = true;
    notifyListeners();
  }

  // Capture the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

  // Track when the app is installed
  window.addEventListener('appinstalled', handleAppInstalled);
}

function handleBeforeInstallPrompt(event: Event): void {
  // Prevent the mini-infobar from appearing on mobile
  event.preventDefault();

  // Store the event for later use
  state.deferredPrompt = event as BeforeInstallPromptEvent;
  state.isInstallable = true;

  notifyListeners();
}

function handleAppInstalled(): void {
  state.isInstalled = true;
  state.deferredPrompt = null;
  state.isInstallable = false;

  notifyListeners();
}

// Show the install prompt
export async function showInstallPrompt(): Promise<boolean> {
  if (!state.deferredPrompt) {
    return false;
  }

  try {
    // Show the browser's install prompt
    await state.deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await state.deferredPrompt.userChoice;

    state.promptShown = true;

    if (outcome === 'accepted') {
      state.deferredPrompt = null;
      state.isInstallable = false;
      return true;
    } else {
      state.installDeclined = true;
      return false;
    }
  } catch (error) {
    console.error('Install prompt error:', error);
    return false;
  } finally {
    notifyListeners();
  }
}

// Get current A2HS state
export function getA2HSState(): Readonly<A2HSState> {
  return { ...state };
}

// Subscribe to state changes
export function subscribeA2HS(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(): void {
  listeners.forEach(callback => callback());
}

// Check if we should show the install prompt based on user engagement
export function shouldShowInstallPrompt(stats: {
  totalGamesPlayed: number;
  currentStreak: number;
  daysVisited: number;
  sessionDuration: number; // in ms
}): boolean {
  // Don't show if already installed or declined
  if (state.isInstalled || state.installDeclined || state.promptShown) {
    return false;
  }

  // Don't show if not installable
  if (!state.isInstallable) {
    return false;
  }

  // Behavioral triggers (meet at least 2 conditions)
  let conditionsMet = 0;

  // 3+ games played
  if (stats.totalGamesPlayed >= 3) conditionsMet++;

  // 2+ day streak
  if (stats.currentStreak >= 2) conditionsMet++;

  // 2+ days visited (would need to track this)
  if (stats.daysVisited >= 2) conditionsMet++;

  // 2+ minute session
  if (stats.sessionDuration >= 120000) conditionsMet++;

  return conditionsMet >= 2;
}

// Get iOS install instructions
export function getIOSInstallInstructions(): string[] {
  return [
    'Tap the Share button in Safari',
    'Scroll down and tap "Add to Home Screen"',
    'Tap "Add" to confirm',
  ];
}

// Check if the device is iOS
export function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Check if running in standalone mode (installed)
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error - navigator.standalone is iOS-specific
    window.navigator.standalone === true
  );
}
