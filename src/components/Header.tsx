import React from 'react';
import { BrainCircuitIcon, SettingsIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="bg-primary-500 dark:bg-slate-800 shadow-md transition-colors">
      <div className="container mx-auto max-w-2xl px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
            <BrainCircuitIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
              <span className="hidden sm:inline">Remember Me</span>
              <span className="sm:hidden">Remember</span>
            </h1>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <ThemeToggle />
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            aria-label="Settings"
          >
            <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};