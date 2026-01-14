import { motion, AnimatePresence } from 'framer-motion';
import { useA2HS } from '@/hooks/useA2HS';
import { getIOSInstallInstructions } from '@/services/a2hs';

export function InstallPrompt() {
  const { isInstallable, isInstalled, isIOS, shouldPrompt, showPrompt, dismissPrompt } = useA2HS();

  // Don't render if not installable, already installed, or shouldn't prompt
  if (!isInstallable || isInstalled || !shouldPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 left-4 right-4 z-40"
      >
        <div className="bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-700">
          <div className="flex items-start gap-3">
            <div className="text-3xl">📱</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white mb-1">
                Add to Home Screen
              </h3>
              <p className="text-sm text-slate-400">
                Install Daily Brain for quick access and offline play
              </p>
            </div>
            <button
              onClick={dismissPrompt}
              className="text-slate-400 hover:text-white p-1"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>

          {isIOS ? (
            <IOSInstructions />
          ) : (
            <div className="mt-4 flex gap-2">
              <button
                onClick={async () => {
                  await showPrompt();
                }}
                className="flex-1 btn-primary"
              >
                Install App
              </button>
              <button
                onClick={dismissPrompt}
                className="btn-ghost"
              >
                Later
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function IOSInstructions() {
  const instructions = getIOSInstallInstructions();

  return (
    <div className="mt-4">
      <div className="text-xs text-slate-500 mb-2">To install:</div>
      <ol className="space-y-2">
        {instructions.map((step, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center flex-shrink-0">
              {index + 1}
            </span>
            <span className="text-slate-300">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Banner variant for less intrusive prompt
export function InstallBanner() {
  const { isInstallable, isInstalled, shouldPrompt, showPrompt, dismissPrompt } = useA2HS();

  if (!isInstallable || isInstalled || !shouldPrompt) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-primary-500/10 border-b border-primary-500/20"
    >
      <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span>📱</span>
          <span className="text-primary-400">Install Daily Brain for offline access</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={showPrompt}
            className="text-sm font-medium text-primary-400 hover:text-primary-300"
          >
            Install
          </button>
          <button
            onClick={dismissPrompt}
            className="text-slate-500 hover:text-slate-300 text-sm"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
}
