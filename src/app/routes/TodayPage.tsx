import { Navigate } from 'react-router-dom';
import { getDailyChallenge } from '@/services/dailyContent';

export function TodayPage() {
  const dailyChallenge = getDailyChallenge();
  return <Navigate to={`/play/${dailyChallenge.game.id}`} replace />;
}
