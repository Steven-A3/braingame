import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function UpdatePrompt() {
  const { t } = useTranslation();

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every hour
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleClose = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🚀</div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">
                  {t('pwa.updateAvailable', 'Update Available')}
                </h3>
                <p className="text-sm text-slate-400 mb-3">
                  {t('pwa.updateMessage', 'A new version is ready. Update now for the latest features!')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                  >
                    {t('pwa.updateNow', 'Update Now')}
                  </button>
                  <button
                    onClick={handleClose}
                    className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl transition-colors"
                  >
                    {t('pwa.later', 'Later')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
