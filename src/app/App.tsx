import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './routes/HomePage';
import { TodayPage } from './routes/TodayPage';
import { GamesPage } from './routes/GamesPage';
import { ProfilePage } from './routes/ProfilePage';
import { GamePlayPage } from './routes/GamePlayPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="/play/:gameId" element={<GamePlayPage />} />
      </Routes>
    </BrowserRouter>
  );
}
