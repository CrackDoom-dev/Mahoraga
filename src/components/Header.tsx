import React from 'react';
import { Profile } from '../types';
import { getGreeting } from '../utils/formatters';
import { Search, Sparkles, TrendingUp, ShieldCheck, Flame, Zap } from 'lucide-react';
import { RankBorderAvatar } from './RankBorderAvatar';
import { XpMetrics } from '../utils/xp';

interface HeaderProps {
  profile: Profile;
  weeksCount: number;
  dailyCount?: number;
  xpMetrics: XpMetrics;
  isCelebratingTier?: boolean;
  onOpenSettings?: () => void;
  onSelectChip?: (chip: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  weeksCount,
  dailyCount = 0,
  xpMetrics,
  isCelebratingTier = false,
  onOpenSettings,
  onSelectChip,
}) => {
  const greeting = getGreeting();

  const totalEntries = weeksCount + Math.floor(dailyCount / 3);
  const level = profile.level || (1 + totalEntries);

  const theme = xpMetrics.activeTheme;

  return (
    <header className="pt-3 pb-2 px-4 select-none">
      {/* Top Bar with Avatar, Greeting, Name, and Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Synchronized Animated Moving Rank Border Avatar */}
          <RankBorderAvatar
            avatar={profile.avatar}
            nama={profile.nama}
            rank={xpMetrics.activeTier}
            size="md"
            level={level}
            showLevelBadge
            sparkleEffect={isCelebratingTier}
            onClick={onOpenSettings}
            className="hover:scale-105 transition-transform"
          />

          {/* User info */}
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-[#a7a3c9]">
              {greeting}
            </span>
            <h2 className="text-base font-bold font-display text-[#f2f0ff] leading-tight tracking-tight">
              {profile.nama || 'Pengguna'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-[#7c6cf5]/20 text-[#8f81ff] border border-[#7c6cf5]/30">
                Lv.{level}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-display border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                {theme.tier}
              </span>
            </div>
          </div>
        </div>

        {/* Right Icon Actions: Clean & Minimal */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full glass-card-interactive flex items-center justify-center text-[#f2f0ff] border border-white/10 active:scale-95 transition-transform cursor-pointer"
            aria-label="Cari atau Pengaturan"
            title="Buka Pengaturan & Rank"
          >
            <Search className="w-4 h-4 text-[#a7a3c9] hover:text-white" />
          </button>
        </div>
      </div>

      {/* Sleek XP Progress Bar & Streak Indicator */}
      <div className={`mt-3 p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md transition-all ${
        isCelebratingTier ? 'ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.4)]' : ''
      }`}>
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shadow-sm"
              style={{ backgroundColor: theme.primaryColor }}
            />
            <span className="font-bold text-[#f2f0ff] font-display">
              {xpMetrics.totalXp} XP
            </span>
            <span className="text-[10px] text-[#a7a3c9]">
              {xpMetrics.isMaxTier
                ? '• Tingkat Tertinggi'
                : `• Sisa ${xpMetrics.xpNeededForNext} XP ke ${xpMetrics.nextTheme?.shortName}`}
            </span>
          </div>

          {/* Streak indicator */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
              xpMetrics.currentStreak > 0
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-white/5 border-white/10 text-[#a7a3c9]'
            }`}
          >
            <Flame className={`w-3 h-3 ${xpMetrics.currentStreak > 0 ? 'text-amber-400 animate-pulse' : 'text-gray-400'}`} />
            <span>
              {xpMetrics.currentStreak > 0
                ? `${xpMetrics.currentStreak} Hari Streak ${xpMetrics.streakMultiplier > 1 ? `(${xpMetrics.streakMultiplier}x)` : ''}`
                : 'Belum Ada Streak'}
            </span>
          </div>
        </div>

        {/* Dynamic XP Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${xpMetrics.percentToNext}%`,
              background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
              boxShadow: `0 0 10px ${theme.primaryColor}`,
            }}
          />
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="flex items-center gap-2 mt-2.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => onSelectChip?.('target')}
          className="px-3.5 py-1.5 rounded-full glass-card-interactive text-xs font-medium text-[#f2f0ff] whitespace-nowrap border border-white/10 flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-[#ffb454]" />
          <span>Target Finansial</span>
        </button>
        <button
          onClick={() => onSelectChip?.('kalkulator')}
          className="px-3.5 py-1.5 rounded-full glass-card-interactive text-xs font-medium text-[#f2f0ff] whitespace-nowrap border border-white/10 flex items-center gap-1.5 cursor-pointer"
        >
          <TrendingUp className="w-3 h-3 text-[#3fc9b0]" />
          <span>Estimasi Cuan</span>
        </button>
        <button
          onClick={() => onSelectChip?.('bantuan')}
          className="px-3.5 py-1.5 rounded-full glass-card-interactive text-xs font-medium text-[#f2f0ff] whitespace-nowrap border border-white/10 flex items-center gap-1.5 cursor-pointer"
        >
          <ShieldCheck className="w-3 h-3 text-[#8f81ff]" />
          <span>5 Pilar Cuan</span>
        </button>
      </div>
    </header>
  );
};
