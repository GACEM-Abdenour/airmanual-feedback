import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <header className="h-16 flex-shrink-0 border-b border-borderMain bg-surface flex items-center px-6">
          <div className="flex-1">
            {/* Search could go here */}
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium">
              AE
            </div>
          </div>
        </header>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
