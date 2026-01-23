import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

const SITE_URL = 'https://dailybrain.one';

export function ShareButton() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // Preload Elly image
  const [ellyImage, setEllyImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/soft_happy_elli.svg';
    img.onload = () => setEllyImage(img);
  }, []);

  const handleSaveQRCode = useCallback(async () => {
    if (!qrContainerRef.current) return;

    setIsSaving(true);

    try {
      // Create a canvas to combine QR code with title and branding
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const padding = 40;
      const titleHeight = 80;
      const footerHeight = 50;
      const qrSize = 280;

      canvas.width = qrSize + padding * 2;
      canvas.height = qrSize + titleHeight + footerHeight + padding * 2;

      // Background - dark theme
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add rounded border
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 20);
      ctx.stroke();

      // Title text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Daily Brain', canvas.width / 2, padding + 30);

      // Subtitle
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(t('share.scanToPlay', 'Scan to play free brain games!'), canvas.width / 2, padding + 55);

      // Get QR code canvas
      const qrCanvas = qrContainerRef.current.querySelector('canvas');
      if (qrCanvas) {
        // Draw white background for QR code
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(padding, titleHeight + padding, qrSize, qrSize, 12);
        ctx.fill();

        // Draw QR code
        ctx.drawImage(qrCanvas, padding, titleHeight + padding, qrSize, qrSize);

        // Draw Elly in center of QR code
        if (ellyImage) {
          const ellySize = 60;
          const ellyX = padding + (qrSize - ellySize) / 2;
          const ellyY = titleHeight + padding + (qrSize - ellySize) / 2;

          // White circle background for Elly
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ellyX + ellySize / 2, ellyY + ellySize / 2, ellySize / 2 + 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.drawImage(ellyImage, ellyX, ellyY, ellySize, ellySize);
        }
      }

      // Footer - website URL
      ctx.fillStyle = '#64748b';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('dailybrain.one', canvas.width / 2, canvas.height - padding + 10);

      // Convert to blob and trigger download
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'daily-brain-qr.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsSaving(false);
      }, 'image/png');

    } catch (error) {
      console.error('Failed to save QR code:', error);
      setIsSaving(false);
    }
  }, [ellyImage, t]);

  return (
    <>
      {/* Floating Share Button */}
      <motion.button
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        aria-label={t('share.share', 'Share')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-700 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">{t('share.shareApp', 'Share Daily Brain')}</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {t('share.scanToPlay', 'Scan to play free brain games!')}
                </p>
              </div>

              {/* QR Code Container */}
              <div
                ref={qrContainerRef}
                className="bg-white rounded-xl p-4 relative mx-auto"
                style={{ width: 'fit-content' }}
              >
                <QRCodeCanvas
                  value={SITE_URL}
                  size={220}
                  level="H" // High error correction for logo overlay
                  marginSize={2}
                  imageSettings={{
                    src: '/soft_happy_elli.svg',
                    x: undefined,
                    y: undefined,
                    height: 50,
                    width: 50,
                    excavate: true,
                  }}
                />
              </div>

              {/* URL Display */}
              <div className="text-center mt-4 mb-4">
                <span className="text-slate-400 text-sm">dailybrain.one</span>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveQRCode}
                disabled={isSaving}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('share.saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('share.saveImage', 'Save QR Code Image')}
                  </>
                )}
              </button>

              {/* Native Share (if available) */}
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={() => {
                    navigator.share({
                      title: 'Daily Brain - Free Brain Games',
                      text: t('share.shareText', 'Train your brain with free games!'),
                      url: SITE_URL,
                    }).catch(() => {});
                  }}
                  className="w-full py-3 px-4 rounded-xl border border-slate-600 text-slate-300 font-medium mt-3 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {t('share.shareOther', 'Share via...')}
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                aria-label={t('common.close', 'Close')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
