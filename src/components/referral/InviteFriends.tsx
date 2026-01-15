import { useState } from 'react';
import { motion } from 'framer-motion';
import { getReferralLink, generateReferralShareText, getReferralStats } from '@/services/referral';
import { useFeedback } from '@/hooks/useFeedback';

export function InviteFriends() {
  const [copied, setCopied] = useState(false);
  const feedback = useFeedback();
  const referralLink = getReferralLink();
  const shareText = generateReferralShareText();
  const stats = getReferralStats();

  const handleCopyLink = async () => {
    feedback.tap();
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      feedback.correct();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = referralLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      feedback.correct();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    feedback.tap();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Brain - Brain Training Games',
          text: shareText,
          url: referralLink,
        });
      } catch (error) {
        // User cancelled or error
        if (error instanceof Error && error.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareTwitter = () => {
    feedback.tap();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareWhatsApp = () => {
    feedback.tap();
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">🎁</div>
        <div>
          <h3 className="font-semibold text-lg">Invite Friends</h3>
          <p className="text-sm text-slate-400">Share Daily Brain with your friends</p>
        </div>
      </div>

      {/* Referral Stats */}
      {stats.count > 0 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🎉</span>
            <span className="text-green-400 font-medium">
              {stats.count} friend{stats.count !== 1 ? 's' : ''} joined!
            </span>
          </div>
        </div>
      )}

      {/* Referral Link */}
      <div className="bg-slate-800 rounded-lg p-3 mb-4">
        <p className="text-xs text-slate-400 mb-1">Your referral link</p>
        <div className="flex items-center gap-2">
          <code className="text-sm text-primary-400 flex-1 truncate">
            {referralLink}
          </code>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="flex-1 btn-primary"
        >
          📤 Share
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleShareTwitter}
          className="p-3 bg-black hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Share on X"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleShareWhatsApp}
          className="p-3 bg-[#25D366] hover:bg-[#20BD5A] rounded-lg transition-colors"
          aria-label="Share on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </motion.button>
      </div>

      {/* Referral Code */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          Your code: <span className="font-mono text-slate-400">{stats.code}</span>
        </p>
      </div>
    </div>
  );
}
