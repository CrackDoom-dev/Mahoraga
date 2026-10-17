import React, { useEffect, useState } from 'react';
import { Profile, ProgressMetrics, WeeklyRecord } from '../types';
import { formatRupiah, formatTanggalIndo } from '../utils/formatters';
import {
  TrendingUp,
  Award,
  Calendar,
  Clock,
  PlusCircle,
  ChevronRight,
  ShieldAlert,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';

interface BerandaTabProps {
  profile: Profile;
  metrics: ProgressMetrics;
  records: WeeklyRecord[];
  onNavigateToCatat: () => void;
  onNavigateToRiwayat: () => void;
  onOpenTargetModal?: () => void;
}

export const BerandaTab: React.FC<BerandaTabProps> = ({
  profile,
  metrics,
  records,
  onNavigateToCatat,
  onNavigateToRiwayat,
}) => {
  const hasData = records.length > 0;
  const targetYear = profile.tanggalTarget?.tahun || new Date().getFullYear();

  // Animation values for smooth count up
  const [animatedOverall, setAnimatedOverall] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = metrics.overall;
    if (start === end) {
      setAnimatedOverall(end);
      return;
    }
    const duration = 600;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setAnimatedOverall(end);
        clearInterval(timer);
      } else {
        setAnimatedOverall(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [metrics.overall]);

  // 5 Aspect definitions with exact prompt colors
  const aspects = [
    {
      id: 'income',
      label: 'Income konsisten',
      color: '#8f81ff',
      percent: metrics.incomeKonsisten,
      desc: 'Rata-rata profit 4 minggu terakhir',
    },
    {
      id: 'kebutuhan',
      label: 'Kebutuhan tercukupi',
      color: '#3fc9b0',
      percent: metrics.kebutuhanTercukupi,
      desc: 'Pemenuhan kebutuhan pokok mingguan',
    },
    {
      id: 'stabil',
      label: 'Pengeluaran stabil',
      color: '#5aa9ff',
      percent: metrics.pengeluaranStabil,
      desc: 'Konsistensi alokasi modal antar minggu',
    },
    {
      id: 'utang',
      label: 'Lepas dari gali lubang',
      color: '#ffb454',
      percent: metrics.lepasGaliLubang,
      desc: 'Pelunasan dan bebas jeratan utang',
    },
    {
      id: 'tabungan',
      label: 'Tabungan',
      color: '#ff7aa8',
      percent: metrics.tabungan,
      desc: 'Akumulasi dana simpanan & darurat',
    },
  ];

  // SVG Big 5-Segment Progress Circle parameters
  const R = 85;
  const C = 2 * Math.PI * R; // ~534.07
  const segmentFraction = 1 / 5; // 20% of circle = 72 deg
  const gapAngle = 4; // 4 degrees gap
  const slotAngle = 72 - gapAngle; // 68 degrees available per segment
  const slotLength = (slotAngle / 360) * C; // Length of the slot track (~100.8)

  // State to control showing only the graphic card by default vs all details
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-4 pb-24 px-4 pt-1 animate-[fadeIn_0.3s_ease-out]">
      {/* 1. Main 5-Segment Progress Card (Shown by default as in screenshot) */}
      <div className="glass-card p-5 sm:p-6 rounded-[24px] border border-white/10 shadow-xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#7c6cf5]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#3fc9b0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center justify-between gap-5 relative z-10">
          {/* Big 5-Segment Circle */}
          <div className="relative w-52 h-52 shrink-0 flex items-center justify-center my-1">
            <svg
              className="w-52 h-52 transform -rotate-90"
              viewBox="0 0 220 220"
            >
              <defs>
                <filter id="segmentGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {aspects.map((aspect, index) => {
                const startAngle = index * 72 + gapAngle / 2;
                const filledLength = (aspect.percent / 100) * slotLength;

                return (
                  <g key={aspect.id} transform={`rotate(${startAngle} 110 110)`}>
                    {/* Background slot track */}
                    <circle
                      cx="110"
                      cy="110"
                      r={R}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="15"
                      strokeDasharray={`${slotLength} ${C - slotLength}`}
                      strokeLinecap="round"
                    />

                    {/* Filled progress segment */}
                    {aspect.percent > 0 && (
                      <circle
                        cx="110"
                        cy="110"
                        r={R}
                        fill="none"
                        stroke={aspect.color}
                        strokeWidth="15"
                        strokeDasharray={`${filledLength} ${C - filledLength}`}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                        filter="url(#segmentGlow)"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span className="text-3xl font-extrabold text-[#f2f0ff] tracking-tight">
                {animatedOverall}%
              </span>
              <span className="text-[11px] font-medium text-[#a7a3c9] uppercase tracking-wider mt-0.5">
                {hasData ? 'tercapai' : 'belum ada data'}
              </span>
            </div>
          </div>

          {/* Target Title & 5 Aspects Progress List */}
          <div className="w-full flex flex-col justify-center pt-1">
            <div className="mb-3">
              <span className="text-[11px] font-semibold text-[#8f81ff] uppercase tracking-wider block">
                Target {targetYear}
              </span>
              <h3 className="text-base font-bold text-[#f2f0ff] leading-snug">
                Progres menuju target {targetYear}
              </h3>
            </div>

            {/* Aspects Mini Legend list */}
            <div className="space-y-1.5">
              {aspects.map((aspect) => (
                <div
                  key={aspect.id}
                  className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5 border border-white/5 text-xs hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: aspect.color }}
                    />
                    <span className="text-[#f2f0ff] font-medium text-xs">
                      {aspect.label}
                    </span>
                  </div>
                  <span
                    className="font-bold text-xs"
                    style={{ color: aspect.color }}
                  >
                    {aspect.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button (V) to show / hide all details as requested */}
      <div className="flex justify-center pt-0.5 pb-1">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-5 py-2.5 rounded-full glass-card-interactive flex items-center gap-2 text-xs font-bold text-[#8f81ff] border border-[#7c6cf5]/30 shadow-lg hover:bg-[#7c6cf5]/15 active:scale-95 transition-all group"
          aria-expanded={showDetails}
          aria-label="Lihat Semua Detail"
        >
          <span>{showDetails ? 'Sembunyikan Detail' : 'Lihat Semua Detail'}</span>
          <div className="w-6 h-6 rounded-full bg-[#7c6cf5]/20 group-hover:bg-[#7c6cf5] text-white flex items-center justify-center font-bold text-xs transition-colors">
            {showDetails ? '∧' : '∨'}
          </div>
        </button>
      </div>

      {/* Conditionally rendered details when (V) is clicked */}
      {showDetails && (
        <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
          {/* 2. Target Tujuan Card */}
          <div className="glass-card p-4 sm:p-5 rounded-[22px] border border-white/10 shadow-lg relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7c6cf5]/30 to-[#8f81ff]/20 border border-[#7c6cf5]/40 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-[#8f81ff]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#a7a3c9] tracking-wider block">
                    Target Tujuan
                  </span>
                  <h4 className="text-sm font-bold text-[#f2f0ff] mt-0.5 leading-snug">
                    {profile.targetTujuan || 'Belum ditentukan'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-[#a7a3c9]">
                    <Calendar className="w-3.5 h-3.5 text-[#5aa9ff]" />
                    <span>
                      {profile.tanggalTarget
                        ? `${profile.tanggalTarget.tanggal}/${profile.tanggalTarget.bulan}/${profile.tanggalTarget.tahun}`
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sisa Hari Badge */}
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-right shrink-0">
                <div className="flex items-center gap-1 text-[10px] text-[#ffb454] font-semibold justify-end">
                  <Clock className="w-3 h-3" />
                  <span>Sisa Waktu</span>
                </div>
                <div className="text-sm font-extrabold text-[#f2f0ff] mt-0.5">
                  {metrics.daysRemaining}{' '}
                  <span className="text-[10px] font-normal text-[#a7a3c9]">hari</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Ringkasan Finansial or "Catat minggu pertama" */}
          {!hasData ? (
            <div className="glass-card p-6 rounded-[24px] border border-[#7c6cf5]/30 text-center relative overflow-hidden shadow-xl bg-gradient-to-b from-white/5 to-white/[0.02]">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#7c6cf5] to-[#8f81ff] flex items-center justify-center shadow-[0_0_24px_rgba(124,108,245,0.4)] mb-3">
                <PlusCircle className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-base font-bold text-[#f2f0ff]">
                Mulai Perjalanan Cuanmu
              </h4>
              <p className="text-xs text-[#a7a3c9] mt-1 max-w-xs mx-auto leading-relaxed">
                Belum ada data tercatat. Masukkan modal awal dan finis minggu pertamamu untuk mengaktifkan seluruh indikator target.
              </p>
              <button
                onClick={onNavigateToCatat}
                className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] text-white text-xs font-bold shadow-[0_4px_16px_rgba(124,108,245,0.4)] active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Catat Minggu Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Total Profit Card */}
              <div className="glass-card p-4 rounded-[22px] border border-white/10 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[#a7a3c9] mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      Total Profit
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        metrics.totalProfit >= 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {metrics.totalProfit >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`text-base font-extrabold tracking-tight ${
                      metrics.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatRupiah(metrics.totalProfit)}
                  </div>
                </div>
                <span className="text-[10px] text-[#a7a3c9] mt-2 block">
                  Dari {records.length} minggu tercatat
                </span>
              </div>

              {/* Rata-rata Grow Per Minggu */}
              <div className="glass-card p-4 rounded-[22px] border border-white/10 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[#a7a3c9] mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      Rata-rata Grow
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        metrics.avgGrow >= 0
                          ? 'bg-[#3fc9b0]/20 text-[#3fc9b0]'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div
                    className={`text-base font-extrabold tracking-tight ${
                      metrics.avgGrow >= 0 ? 'text-[#3fc9b0]' : 'text-rose-400'
                    }`}
                  >
                    {metrics.avgGrow >= 0 ? `+${metrics.avgGrow}%` : `${metrics.avgGrow}%`}
                  </div>
                </div>
                <span className="text-[10px] text-[#a7a3c9] mt-2 block">
                  Pertumbuhan per minggu
                </span>
              </div>
            </div>
          )}

          {/* 4. Section "Per aspek" (5 Cincin Kecil) */}
          <div className="glass-card p-4 sm:p-5 rounded-[24px] border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-sm font-bold text-[#f2f0ff]">
                Per Aspek Finansial
              </h4>
              <span className="text-[11px] text-[#8f81ff] font-medium">
                5 Pilar Cuan
              </span>
            </div>

            <div className="space-y-3">
              {aspects.map((aspect) => {
                const smallR = 15;
                const smallC = 2 * Math.PI * smallR; // ~94.2
                const smallDash = (aspect.percent / 100) * smallC;

                return (
                  <div
                    key={aspect.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Small Ring SVG */}
                      <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                        <svg className="w-10 h-10 transform -rotate-90">
                          <circle
                            cx="20"
                            cy="20"
                            r={smallR}
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeWidth="3.5"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r={smallR}
                            fill="none"
                            stroke={aspect.color}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray={`${smallDash} ${smallC - smallDash}`}
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#f2f0ff]">
                          {aspect.percent}%
                        </span>
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-[#f2f0ff]">
                          {aspect.label}
                        </h5>
                        <p className="text-[10px] text-[#a7a3c9] mt-0.5">
                          {aspect.desc}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: aspect.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Quick Activity Footer CTA */}
          {hasData && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-[#f2f0ff]">
                Riwayat Pencatatan
              </span>
              <button
                onClick={onNavigateToRiwayat}
                className="text-xs text-[#8f81ff] font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

