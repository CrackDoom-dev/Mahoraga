import React from 'react';
import { Home, PlusCircle, BarChart3, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export type TabKey = 'beranda' | 'catat' | 'riwayat' | 'pengaturan';

interface BottomNavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = React.memo(({
  activeTab,
  onTabChange,
}) => {
  const tabs: { key: TabKey; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'beranda', label: 'Beranda', icon: Home },
    { key: 'catat', label: 'Catat', icon: PlusCircle },
    { key: 'riwayat', label: 'Riwayat', icon: BarChart3 },
    { key: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  const activeIndex = Math.max(0, tabs.findIndex((t) => t.key === activeTab));

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 flex justify-center px-3 pb-[max(env(safe-area-inset-bottom),12px)] pointer-events-none select-none"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
      }}
    >
      <nav
        aria-label="Navigasi Bawah"
        className="pointer-events-auto relative flex items-center justify-between p-1 rounded-[22px] bg-[#15132f]/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.65)] w-full max-w-sm"
      >
        <motion.div
          aria-hidden="true"
          className="absolute top-1 bottom-1 rounded-[18px] bg-gradient-to-tr from-[#7c6cf5] to-[#8f81ff] shadow-[0_4px_16px_rgba(124,108,245,0.4)] pointer-events-none z-0"
          style={{
            width: 'calc((100% - 8px) / 4)',
            left: 4,
          }}
          animate={{
            x: `${activeIndex * 100
}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 35,
            mass: 0.8,
          }}
        />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`relative z-10 flex-1 py-1.5 min-h-[42px] rounded-[18px] flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'text-white'
                  : 'text-[#a7a3c9] hover:text-[#f2f0ff]'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center"
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span
                className={`text-[9px] font-semibold leading-none transition-all ${
                  isActive ? 'opacity-100 font-bold' : 'opacity-75'
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
});

BottomNavigation.displayName = 'BottomNavigation';

