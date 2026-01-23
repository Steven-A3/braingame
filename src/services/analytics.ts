// Google Analytics 4 tracking service
// Replace G-XXXXXXXXXX with your actual GA4 Measurement ID in index.html

declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'set',
      action: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

// Check if gtag is available
function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

// Core event tracking function
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (!isGtagAvailable()) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, params);
    }
    return;
  }

  window.gtag('event', eventName, params);
}

// ============================================
// PAGE TRACKING
// ============================================

export function trackPageView(pagePath: string, pageTitle?: string): void {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

// ============================================
// GAME EVENTS
// ============================================

export function trackGameStart(gameId: string, category: string): void {
  trackEvent('game_start', {
    game_id: gameId,
    game_category: category,
  });
}

export function trackGameComplete(
  gameId: string,
  category: string,
  score: number,
  accuracy: number,
  duration: number,
  levelsCompleted: number
): void {
  trackEvent('game_complete', {
    game_id: gameId,
    game_category: category,
    score,
    accuracy: Math.round(accuracy * 100),
    duration_seconds: Math.round(duration / 1000),
    levels_completed: levelsCompleted,
  });
}

export function trackGameQuit(gameId: string, category: string): void {
  trackEvent('game_quit', {
    game_id: gameId,
    game_category: category,
  });
}

// ============================================
// QUEST EVENTS
// ============================================

export function trackQuestComplete(
  questId: string,
  questTitle: string,
  difficulty: string,
  coinsEarned: number,
  xpEarned: number
): void {
  trackEvent('quest_complete', {
    quest_id: questId,
    quest_title: questTitle,
    quest_difficulty: difficulty,
    coins_earned: coinsEarned,
    xp_earned: xpEarned,
  });
}

export function trackQuestClaimed(
  questId: string,
  coinsEarned: number,
  xpEarned: number,
  gemsEarned?: number
): void {
  trackEvent('quest_reward_claimed', {
    quest_id: questId,
    coins_earned: coinsEarned,
    xp_earned: xpEarned,
    gems_earned: gemsEarned || 0,
  });
}

// ============================================
// PROGRESSION EVENTS
// ============================================

export function trackLevelUp(newLevel: number, totalXP: number): void {
  trackEvent('level_up', {
    new_level: newLevel,
    total_xp: totalXP,
  });
}

export function trackStreakMilestone(streakDays: number): void {
  trackEvent('streak_milestone', {
    streak_days: streakDays,
  });
}

export function trackBadgeEarned(badgeId: string, badgeName: string): void {
  trackEvent('badge_earned', {
    badge_id: badgeId,
    badge_name: badgeName,
  });
}

// ============================================
// WORKOUT EVENTS
// ============================================

export function trackWorkoutStart(): void {
  trackEvent('workout_start');
}

export function trackWorkoutComplete(
  gamesPlayed: number,
  totalScore: number
): void {
  trackEvent('workout_complete', {
    games_played: gamesPlayed,
    total_score: totalScore,
  });
}

// ============================================
// ENGAGEMENT EVENTS
// ============================================

export function trackShare(
  platform: string,
  contentType: 'game_result' | 'referral' | 'achievement'
): void {
  trackEvent('share', {
    method: platform,
    content_type: contentType,
  });
}

export function trackShareButtonClick(): void {
  trackEvent('share_button_click', {
    event_category: 'share',
  });
}

export function trackShareQrSave(): void {
  trackEvent('share_qr_save', {
    event_category: 'share',
    method: 'qr_code',
  });
}

export function trackShareNative(method: string): void {
  trackEvent('share_native', {
    event_category: 'share',
    method,
  });
}

export function trackReferral(referralCode: string): void {
  trackEvent('referral_signup', {
    referral_code: referralCode,
  });
}

export function trackReferralCodeCopied(): void {
  trackEvent('referral_code_copied', {
    event_category: 'referral',
  });
}

export function trackReferralLinkShared(): void {
  trackEvent('referral_link_shared', {
    event_category: 'referral',
  });
}

// ============================================
// PWA EVENTS
// ============================================

export function trackPWAInstall(): void {
  trackEvent('pwa_install');
}

export function trackPwaUpdatePrompted(): void {
  trackEvent('pwa_update_prompted', {
    event_category: 'pwa',
  });
}

export function trackPwaUpdateAccepted(): void {
  trackEvent('pwa_update_accepted', {
    event_category: 'pwa',
  });
}

export function trackPwaUpdateDismissed(): void {
  trackEvent('pwa_update_dismissed', {
    event_category: 'pwa',
  });
}

// ============================================
// ONBOARDING EVENTS
// ============================================

export function trackOnboardingStart(): void {
  trackEvent('onboarding_start', {
    event_category: 'onboarding',
  });
}

export function trackOnboardingComplete(language: string): void {
  trackEvent('onboarding_complete', {
    event_category: 'onboarding',
    language,
  });
}

export function trackLanguageSelected(language: string, source: 'onboarding' | 'settings'): void {
  trackEvent('language_selected', {
    event_category: 'settings',
    language,
    source,
  });
}

// ============================================
// NAVIGATION EVENTS
// ============================================

export function trackCategoryLandingView(category: string, slug: string): void {
  trackEvent('category_landing_view', {
    event_category: 'navigation',
    category,
    page_slug: slug,
  });
}

export function trackGameCardClick(gameId: string, category: string, location: string): void {
  trackEvent('game_card_click', {
    event_category: 'navigation',
    game_id: gameId,
    game_category: category,
    location,
  });
}

// ============================================
// USER PROPERTY EVENTS
// ============================================

export function setUserProperties(properties: {
  user_level?: number;
  total_games_played?: number;
  current_streak?: number;
  coins?: number;
}): void {
  if (!isGtagAvailable()) return;

  window.gtag('set', 'user_properties', properties);
}

// ============================================
// E-COMMERCE / MONETIZATION
// ============================================

export function trackAdImpression(adSlot: string, adFormat: string): void {
  trackEvent('ad_impression', {
    ad_slot: adSlot,
    ad_format: adFormat,
  });
}

export function trackAdClick(adSlot: string): void {
  trackEvent('ad_click', {
    ad_slot: adSlot,
  });
}

// ============================================
// ERROR TRACKING
// ============================================

export function trackError(
  errorMessage: string,
  errorSource?: string
): void {
  trackEvent('exception', {
    description: errorMessage,
    fatal: false,
    error_source: errorSource,
  });
}

// ============================================
// TIMING EVENTS
// ============================================

export function trackTiming(
  category: string,
  variable: string,
  timeMs: number
): void {
  trackEvent('timing_complete', {
    name: variable,
    value: timeMs,
    event_category: category,
  });
}
