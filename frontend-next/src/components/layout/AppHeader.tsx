'use client';

import { Menu, Search, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function AppHeader({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-xl">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-6 w-6 text-slate-400" />
      </Button>

      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 z-10" />
          <Input
            type="search"
            placeholder="Search tickets, clients..."
            className="pl-9 bg-slate-900 border-slate-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-400 hover:text-slate-100 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 ring-2 ring-slate-900" />
      </div>
    </header>
  );
}
