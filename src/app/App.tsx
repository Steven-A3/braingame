import { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './routes/HomePage';
import { TodayPage } from './routes/TodayPage';
import { GamesPage } from './routes/GamesPage';
import { ProfilePage } from './routes/ProfilePage';
import { GamePlayPage } from './routes/GamePlayPage';
import { QuestsPage } from './routes/QuestsPage';
import { Onboarding } from '@/components/onboarding';
import { DailyWorkout } from '@/components/workout';
import { Leaderboard } from '@/components/leaderboard';
import { Settings } from '@/components/settings';
import { ProgressCharts } from '@/components/charts';
import { UpdatePrompt } from '@/components/pwa';
import { useUserStore } from '@/stores/userStore';
import { checkReferralCode } from '@/services/referral';

// Loading component for i18n
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const hasCompletedOnboarding = useUserStore((state) => state.hasCompletedOnboarding);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return <>{children}</>;
}

export function App() {
  const { ready } = useTranslation();

  // Check for referral code in URL on mount
  useEffect(() => {
    checkReferralCode();
  }, []);

  // Wait for i18n to be ready
  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <BrowserRouter>
        <OnboardingGuard>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/today" element={<TodayPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="/play/:gameId" element={<GamePlayPage />} />
            <Route path="/workout" element={<DailyWorkout />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/progress" element={<ProgressCharts />} />
            <Route path="/quests" element={<QuestsPage />} />
          </Routes>
        </OnboardingGuard>
        <UpdatePrompt />
      </BrowserRouter>
    </Suspense>
  );
}
