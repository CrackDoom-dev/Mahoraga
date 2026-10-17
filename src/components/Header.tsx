import React, { useState } from 'react';
import { Profile } from '../types';
import { getGreeting } from '../utils/formatters';
import { Bell, Search, Info, X, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  profile: Profile;
  weeksCount: number;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
  onSelectChip?: (chip: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  weeksCount,
  onOpenSettings,
  onSelectChip,
}) => {
  const greeting = getGreeting();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Calculate dynamic level & rank based on weekly consistency
  const level = 1 + weeksCount;
  const rank =
    weeksCount === 0
      ? 'F-Rank Pemula'
      : weeksCount < 4
      ? 'E-Rank Pejuang'
      : weeksCount < 8
      ? 'D-Rank Konsisten'
      : weeksCount < 16
      ? 'C-Rank Terencana'
      : weeksCount < 26
      ? 'B-Rank Finansial Stabil'
      : 'A-Rank Mandiri Finansial';

  return (
    <header className="pt-3 pb-2 px-4 select-none">
      {/* Top Bar with Avatar, Greeting, Name, and Quick Icons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with purple gradient glow ring */}
          <div
            onClick={onOpenSettings}
            role="button"
            tabIndex={0}
            className="relative cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#7c6cf5] to-[#ff7aa8] shadow-[0_0_15px_rgba(124,108,245,0.4)] flex items-center justify-center transition-transform group-active:scale-95">
              <div className="w-full h-full rounded-full bg-[#15132f] flex items-center justify-center overflow-hidden text-lg font-bold text-white border border-white/20">
                {profile.avatar && profile.avatar.length > 2 ? (
                  <img
                    src={profile.avatar}
                    alt={profile.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{profile.nama ? profile.nama.charAt(0).toUpperCase() : 'A'}</span>
                )}
              </div>
            </div>
            {/* Online active dot */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#15132f] rounded-full" />
          </div>

          {/* User info */}
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-[#a7a3c9]">
              {greeting}
            </span>
            <h2 className="text-base font-bold text-[#f2f0ff] leading-tight">
              {profile.nama || 'Pengguna'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#7c6cf5]/20 text-[#8f81ff] border border-[#7c6cf5]/30">
                Lv.{level}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-[#a7a3c9] border border-white/10">
                {rank}
              </span>
            </div>
          </div>
        </div>

        {/* Right Icon Actions */}
        <div className="flex items-center gap-2">
          {/* Bell Notifications */}
          <button
            onClick={() => setShowNotificationModal(true)}
            className="w-10 h-10 rounded-full glass-card-interactive flex items-center justify-center relative text-[#f2f0ff] border border-white/10"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4 text-[#a7a3c9]" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#ff7aa8] ring-2 ring-[#15132f]" />
          </button>

          {/* Quick Info / Search */}
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full glass-card-interactive flex items-center justify-center text-[#f2f0ff] border border-white/10"
            aria-label="Cari atau Pengaturan"
          >
            <Search className="w-4 h-4 text-[#a7a3c9]" />
          </button>
        </div>
      </div>

      {/* Quick Action Chips (horizontal scroll matching screenshot) */}
      <div className="flex items-center gap-2 mt-3.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => onSelectChip?.('target')}
          className="px-3.5 py-1.5 rounded-full glass-card-interactive text-xs font-medium text-[#f2f0ff] whitespace-nowrap border border-white/10 flex items-center gap-1.5"
        >
          <Sparkles className="w-3 h-3 text-[#ffb454]" />
          <span>Target Finansial</span>
        </button>
        <button
          onClick={() => onSelectChip?.('kalkulator')}
          className="px-3.5 py-1.5 rounded-full glass-card-interactive text-xs font-medium text-[#f2f0ff] whitespace-nowrap border border-white/10 flex items-center gap-1.5"
        >
          <TrendingUp className="w-3 h-3 text-[#3fc9b0]" />
          <span>Estimasi Cuan</span>
        </button>
        <button
          onClick={() => onSelectChip?.('bantuan')}
          className="px-3.5 py-1.5 rounded-full glass-card-interactive text-xs font-medium text-[#f2f0ff] whitespace-nowrap border border-white/10 flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3 h-3 text-[#8f81ff]" />
          <span>5 Aspek Cuan</span>
        </button>
      </div>

      {/* Announcement Tip Box (inspired by the screenshot reference notification banner) */}
      {showAnnouncement && (
        <div className="mt-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative flex items-start gap-3 transition-all">
          <div className="w-7 h-7 rounded-xl bg-[#7c6cf5]/20 border border-[#7c6cf5]/40 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-[#8f81ff]" />
          </div>
          <div className="flex-1 pr-5">
            <p className="text-xs text-[#f2f0ff] leading-relaxed">
              Catat pemasukan dan pengeluaran tiap minggu. Pantau 5 aspek finansial untuk capai target tujuanmu tepat waktu!
            </p>
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="absolute top-2.5 right-2.5 text-[#a7a3c9] hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="w-full max-w-sm glass-card p-5 rounded-[22px] border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#7c6cf5]" />
                <h3 className="text-sm font-bold text-white">Notifikasi & Tips</h3>
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-[#a7a3c9] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 max-h-72 overflow-y-auto no-scrollbar text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-[#8f81ff] font-semibold block mb-1">
                  🌟 Tips Minggu Ini
                </span>
                <p className="text-[#a7a3c9] leading-relaxed">
                  Konsistensi lebih utama daripada nominal besar. Sisihkan tabungan di awal sebelum belanja konsumtif.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-[#3fc9b0] font-semibold block mb-1">
                  💡 Bebas Gali Lubang
                </span>
                <p className="text-[#a7a3c9] leading-relaxed">
                  Prioritaskan bayar utang dengan bunga tertinggi terlebih dahulu untuk mempercepat kestabilan skor finansialmu.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNotificationModal(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-[#7c6cf5] text-white text-xs font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
