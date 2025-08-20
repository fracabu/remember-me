import React from 'react';
import { BrainCircuitIcon, SettingsIcon } from './icons';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="bg-brand-primary shadow-md">
      <div className="container mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <BrainCircuitIcon className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Remember Me
            </h1>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          aria-label="Settings"
        >
          <SettingsIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};