import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './routes/HomePage';
import { TodayPage } from './routes/TodayPage';
import { GamesPage } from './routes/GamesPage';
import { ProfilePage } from './routes/ProfilePage';
import { GamePlayPage } from './routes/GamePlayPage';
import { Onboarding } from '@/components/onboarding';
import { DailyWorkout } from '@/components/workout';
import { Leaderboard } from '@/components/leaderboard';
import { Settings } from '@/components/settings';
import { ProgressCharts } from '@/components/charts';
import { useUserStore } from '@/stores/userStore';
import { checkReferralCode } from '@/services/referral';

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const hasCompletedOnboarding = useUserStore((state) => state.hasCompletedOnboarding);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return <>{children}</>;
}

export function App() {
  // Check for referral code in URL on mount
  useEffect(() => {
    checkReferralCode();
  }, []);

  return (
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
        </Routes>
      </OnboardingGuard>
    </BrowserRouter>
  );
}
