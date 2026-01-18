import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export type AdFormat = 'horizontal' | 'vertical' | 'rectangle' | 'auto';

interface AdUnitProps {
  slot: string;
  format?: AdFormat;
  className?: string;
  responsive?: boolean;
}

// Ad slot configurations for different placements
export const AD_SLOTS = {
  // Between games / results screen
  RESULTS_BANNER: '1234567890', // Replace with actual slot ID from AdSense
  // Home page
  HOME_BANNER: '1234567891',
  // Games list
  GAMES_LIST: '1234567892',
  // Workout completion
  WORKOUT_COMPLETE: '1234567893',
} as const;

// Format to style mapping
const formatStyles: Record<AdFormat, React.CSSProperties> = {
  horizontal: {
    display: 'block',
    width: '100%',
    height: '90px',
  },
  vertical: {
    display: 'block',
    width: '160px',
    height: '600px',
  },
  rectangle: {
    display: 'block',
    width: '300px',
    height: '250px',
  },
  auto: {
    display: 'block',
    width: '100%',
    height: 'auto',
  },
};

export function AdUnit({ slot, format = 'auto', className = '', responsive = true }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // Only load ad once
    if (isAdLoaded.current) return;

    // Check if AdSense script is loaded
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isAdLoaded.current = true;
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, []);

  // Don't render ads in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`bg-slate-800/50 border border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-500 text-sm ${className}`}
        style={formatStyles[format]}
      >
        Ad Placeholder ({format})
      </div>
    );
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={responsive ? { display: 'block' } : formatStyles[format]}
        data-ad-client="ca-pub-9348297343583989"
        data-ad-slot={slot}
        data-ad-format={responsive ? 'auto' : format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

// Wrapper component for result screen ads
export function ResultsAd() {
  return (
    <div className="my-4 px-4">
      <AdUnit
        slot={AD_SLOTS.RESULTS_BANNER}
        format="horizontal"
        responsive={true}
        className="max-w-sm mx-auto"
      />
    </div>
  );
}

// Wrapper component for in-feed ads (games list)
export function InFeedAd() {
  return (
    <div className="my-2">
      <AdUnit
        slot={AD_SLOTS.GAMES_LIST}
        format="auto"
        responsive={true}
      />
    </div>
  );
}

// Wrapper component for banner ads
export function BannerAd({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <AdUnit
        slot={AD_SLOTS.HOME_BANNER}
        format="horizontal"
        responsive={true}
      />
    </div>
  );
}
