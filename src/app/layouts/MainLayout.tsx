import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/ui/BottomNav';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
