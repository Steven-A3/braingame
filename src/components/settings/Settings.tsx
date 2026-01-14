import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';

export function Settings() {
  const navigate = useNavigate();
  const {
    settings,
    updateSettings,
    stats,
    resetAllData,
  } = useUserStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const handleExportData = () => {
    const state = useUserStore.getState();
    const exportData = {
      exportDate: new Date().toISOString(),
      name: state.name,
      stats: state.stats,
      gameHistory: state.gameHistory,
      earnedBadges: state.earnedBadges,
      settings: state.settings,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-brain-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 2000);
  };

  const handleResetData = () => {
    resetAllData();
    setShowResetConfirm(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="p-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-white"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Preferences */}
        <div className="card">
          <h2 className="font-semibold mb-4">Preferences</h2>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔊</span>
              <div>
                <div className="font-medium">Sound Effects</div>
                <div className="text-sm text-slate-400">
                  Play sounds during games
                </div>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.soundEnabled}
              onChange={(enabled) => updateSettings({ soundEnabled: enabled })}
            />
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <div className="font-medium">Reduced Motion</div>
                <div className="text-sm text-slate-400">
                  Minimize animations
                </div>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.reducedMotion}
              onChange={(enabled) => updateSettings({ reducedMotion: enabled })}
            />
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <div className="font-medium">Daily Reminders</div>
                <div className="text-sm text-slate-400">
                  Get notified to train
                </div>
              </div>
            </div>
            <ToggleSwitch
              enabled={settings.notificationsEnabled}
              onChange={(enabled) =>
                updateSettings({ notificationsEnabled: enabled })
              }
            />
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <h2 className="font-semibold mb-4">Data Management</h2>

          {/* Stats summary */}
          <div className="bg-slate-800 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-400">
                  {stats.totalGamesPlayed}
                </div>
                <div className="text-xs text-slate-400">Games Played</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-400">
                  {stats.currentStreak}
                </div>
                <div className="text-xs text-slate-400">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors mb-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📤</span>
              <div className="text-left">
                <div className="font-medium">Export Data</div>
                <div className="text-sm text-slate-400">
                  Download your progress
                </div>
              </div>
            </div>
            <span className="text-slate-400">→</span>
          </button>

          {/* Reset button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗑️</span>
              <div className="text-left">
                <div className="font-medium text-red-400">Reset All Data</div>
                <div className="text-sm text-red-400/70">
                  This cannot be undone
                </div>
              </div>
            </div>
            <span className="text-red-400">→</span>
          </button>
        </div>

        {/* About */}
        <div className="card">
          <h2 className="font-semibold mb-4">About</h2>
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Total Games</span>
              <span className="text-white">20</span>
            </div>
            <div className="flex justify-between">
              <span>Categories</span>
              <span className="text-white">6</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset confirmation modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold mb-2">Reset All Data?</h3>
                <p className="text-slate-400 mb-6">
                  This will permanently delete all your progress, stats, badges,
                  and game history. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetData}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export success toast */}
      <AnimatePresence>
        {showExportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 mx-auto max-w-sm bg-green-500 text-white p-4 rounded-xl text-center font-medium shadow-lg"
          >
            Data exported successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Toggle switch component
function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? 'bg-primary-500' : 'bg-slate-600'
      }`}
    >
      <motion.div
        className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full"
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
