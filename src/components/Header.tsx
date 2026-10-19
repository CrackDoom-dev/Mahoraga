import React, { useState, useRef, useEffect } from 'react';
import { Profile } from '../types';
import { getGreeting } from '../utils/formatters';
import { Search, Flame } from 'lucide-react';
import { RankBorderAvatar } from './RankBorderAvatar';
import { XpMetrics } from '../utils/xp';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  profile: Profile;
  weeksCount: number;
  dailyCount?: number;
  xpMetrics: XpMetrics;
  isCelebratingTier?: boolean;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  profile,
  weeksCount,
  dailyCount = 0,
  xpMetrics,
  isCelebratingTier = false,
  onOpenSettings,
}) => {
  const greeting = getGreeting();
  const totalEntries = weeksCount + Math.floor(dailyCount / 3);
  const level = profile.level || (1 + totalEntries);
  const theme = xpMetrics.activeTheme;

  const [showXpPopover, setShowXpPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showXpPopover) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowXpPopover(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showXpPopover]);

  return (
    <header
      className="pb-1 px-4 select-none relative z-30"
      style={{
        paddingTop: 'calc(var(--safe-area-inset-top, env(safe-area-inset-top, 0px)) + 0.5rem)',
      }}
    >

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">

          <RankBorderAvatar
            avatar={profile.avatar}
            nama={profile.nama}
            rank={xpMetrics.activeTier}
            size="md"
            level={level}
            showLevelBadge
            sparkleEffect={isCelebratingTier}
            onClick={onOpenSettings}
            className="hover:scale-105 transition-transform shrink-0"
          />

          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-[#a7a3c9] leading-tight">
              {greeting}
            </span>

            <div className="flex items-center gap-2 mt-0.5 relative" ref={popoverRef}>
              <h2 className="text-base font-bold font-display text-[#f2f0ff] leading-none tracking-tight">
                {profile.nama || 'Pengguna'}
              </h2>

              <button
                type="button"
                onClick={() => setShowXpPopover((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/10 active:scale-95 transition-all cursor-pointer ${                  isCelebratingTier ? 'ring-2 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]' : ''

}`}
                title="Tekan untuk info progres XP & streak"
                aria-expanded={showXpPopover}
                aria-label="Lihat progres XP"
              >

                <div className="w-[76px] h-2 rounded-full bg-white/10 overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(6, Math.min(100, xpMetrics.percentToNext))
}%`,
                      backgroundColor: theme.primaryColor,
                      boxShadow: `0 0 6px ${theme.primaryColor
}`,
                    }}
                  />
                </div>

                <span className="text-[10px] font-mono font-bold text-white tracking-tight leading-none">
                  {xpMetrics.totalXp} XP
                </span>

                {xpMetrics.currentStreak > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-amber-300 ml-0.5 leading-none">
                    <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400 animate-pulse" />
                    <span>{xpMetrics.currentStreak}</span>

                  </span>

                )}
              </button>

              <AnimatePresence>
                {showXpPopover && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 6 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute left-0 top-full mt-2 z-50 w-60 p-3 rounded-2xl bg-[#15132f]/95 border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl text-left select-none pointer-events-auto"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#f2f0ff] font-display flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: theme.primaryColor }} />
                        {theme.tier}
                      </span>

                      <span className="font-mono text-[11px] font-bold text-white">
                        {xpMetrics.totalXp} XP
                      </span>

                    </div>

                    <p className="text-[10px] text-[#a7a3c9] leading-snug">
                      {xpMetrics.isMaxTier
                        ? 'Tingkat tertinggi Mahoraga telah tercapai!'
                        : `Sisa ${xpMetrics.xpNeededForNext
} XP lagi menuju ${xpMetrics.nextTheme?.shortName
}`}
                    </p>

                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden my-2">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${xpMetrics.percentToNext
}%`,
                          backgroundColor: theme.primaryColor,
                          boxShadow: `0 0 8px ${theme.primaryColor
}`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#a7a3c9] pt-1 border-t border-white/5">
                      <span className="flex items-center gap-1">
                        <Flame className={`w-3 h-3 ${xpMetrics.currentStreak > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-400'
}`} />
                        <span>
                          {xpMetrics.currentStreak > 0
                            ? `${xpMetrics.currentStreak
} Hari Streak`
                            : 'Belum Ada Streak'}
                        </span>

                      </span>

                      {xpMetrics.streakMultiplier > 1 && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[9px]">
                          Bonus {xpMetrics.streakMultiplier}x XP
                        </span>

                      )}
                    </div>

                  </motion.div>

                )}
              </AnimatePresence>

            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-[#7c6cf5]/20 text-[#8f81ff] border border-[#7c6cf5]/30 leading-none">
                Lv.{level}
              </span>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-display border leading-none ${theme.badgeBg
} ${theme.badgeText
} ${theme.badgeBorder
}`}>
                {theme.tier}
              </span>

            </div>

          </div>

        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full glass-card-interactive flex items-center justify-center text-[#f2f0ff] border border-white/10 active:scale-95 transition-transform cursor-pointer"
            aria-label="Pengaturan & Rank"
            title="Buka Pengaturan & Rank"
          >
            <Search className="w-4 h-4 text-[#a7a3c9] hover:text-white" />
          </button>

        </div>

      </div>

    </header>

  );
});

Header.displayName = 'Header';

