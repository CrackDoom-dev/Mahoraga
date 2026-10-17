import React from 'react';
import { Home, PlusCircle, BarChart3, Settings } from 'lucide-react';

export type TabKey = 'beranda' | 'catat' | 'riwayat' | 'pengaturan';

interface BottomNavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { key: TabKey; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'beranda', label: 'Beranda', icon: Home },
    { key: 'catat', label: 'Catat', icon: PlusCircle },
    { key: 'riwayat', label: 'Riwayat', icon: BarChart3 },
    { key: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 flex justify-center px-4 pointer-events-none select-none">
      {/* Floating pill navigation */}
      <nav
        aria-label="Navigasi Bawah"
        className="pointer-events-auto flex items-center justify-around gap-2 px-3 py-2 rounded-full bg-[#15132f]/85 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-sm"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative min-h-[46px] min-w-[54px] px-3 py-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-tr from-[#7c6cf5] to-[#8f81ff] text-white shadow-[0_4px_16px_rgba(124,108,245,0.4)]'
                  : 'text-[#a7a3c9] hover:text-[#f2f0ff] hover:bg-white/5'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
              />
              <span
                className={`text-[9px] font-semibold transition-all ${
                  isActive ? 'opacity-100 font-bold' : 'opacity-80'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
