import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-2 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-[slideDown_0.3s_ease-out]">
      <div className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-lg flex items-center gap-2 border border-amber-400">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <WifiOff className="w-3.5 h-3.5" />
        <span>Mode Offline — Semua data tersimpan lokal di HP</span>

      </div>

    </div>

  );
};

