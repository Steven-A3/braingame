// Simple referral system
// In production, this would connect to a backend to track referrals

const REFERRAL_STORAGE_KEY = 'dailybrain_referral';
const REFERRAL_CODE_KEY = 'dailybrain_referral_code';

interface ReferralData {
  code: string;
  referredBy: string | null;
  referralCount: number;
  createdAt: string;
}

// Generate a unique referral code based on timestamp and random string
export function generateReferralCode(): string {
  const existing = localStorage.getItem(REFERRAL_CODE_KEY);
  if (existing) return existing;

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DB';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  localStorage.setItem(REFERRAL_CODE_KEY, code);
  return code;
}

// Get referral data
export function getReferralData(): ReferralData {
  const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  const data: ReferralData = {
    code: generateReferralCode(),
    referredBy: null,
    referralCount: 0,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data));
  return data;
}

// Save referral data
function saveReferralData(data: ReferralData): void {
  localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data));
}

// Check if user was referred (call on app init)
export function checkReferralCode(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');

  if (refCode && refCode.length >= 6) {
    const data = getReferralData();

    // Only set if not already referred and not self-referral
    if (!data.referredBy && refCode !== data.code) {
      data.referredBy = refCode;
      saveReferralData(data);

      // Track referral event (could send to analytics)
      console.log('User referred by:', refCode);
    }

    // Clean up URL
    const url = new URL(window.location.href);
    url.searchParams.delete('ref');
    window.history.replaceState({}, '', url.toString());
  }
}

// Increment referral count (would be called by backend in production)
export function incrementReferralCount(): void {
  const data = getReferralData();
  data.referralCount++;
  saveReferralData(data);
}

// Get the referral link
export function getReferralLink(): string {
  const code = generateReferralCode();
  return `https://dailybrain.one/?ref=${code}`;
}

// Get referral stats
export function getReferralStats(): { code: string; count: number; referredBy: string | null } {
  const data = getReferralData();
  return {
    code: data.code,
    count: data.referralCount,
    referredBy: data.referredBy,
  };
}

// Generate share text for referral
export function generateReferralShareText(): string {
  const link = getReferralLink();
  return `🧠 Train your brain with Daily Brain! Play 20+ free brain games daily and improve your memory, focus, and speed.\n\n${link}`;
}
