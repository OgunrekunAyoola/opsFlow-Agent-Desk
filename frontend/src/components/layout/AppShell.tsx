import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell() {
  return (
    <div className="min-h-screen bg-page flex">
      <Sidebar />
      <main className="flex-1 md:ml-72 transition-all p-4 md:p-0">
        <TopBar />
        <div className="px-8 pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
