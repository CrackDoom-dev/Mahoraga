import React, { useEffect, useState } from 'react';
import { Profile, ProgressMetrics, WeeklyRecord, DailyRecord } from '../types';
import { formatRupiah } from '../utils/formatters';
import { XpMetrics } from '../utils/xp';
import {
  TrendingUp,
  Award,
  Calendar,
  Clock,
  PlusCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BerandaTabProps {
  profile: Profile;
  metrics: ProgressMetrics;
  records: WeeklyRecord[];
  dailyRecords?: DailyRecord[];
  xpMetrics: XpMetrics;
  onNavigateToCatat: () => void;
  onNavigateToRiwayat: () => void;
  onOpenTargetModal?: () => void;
}

const BerandaTabComponent: React.FC<BerandaTabProps> = ({
  profile,
  metrics,
  records,
  dailyRecords = [],
  xpMetrics,
  onNavigateToCatat,
  onNavigateToRiwayat,
}) => {
  const hasData = records.length > 0 || dailyRecords.length > 0;
  const targetYear = profile.tanggalTarget?.tahun || new Date().getFullYear();
  const theme = xpMetrics.activeTheme;

  const prevOverallRef = React.useRef(metrics.overall);
  const [animOverall, setAnimOverall] = useState(metrics.overall);

  useEffect(() => {
    const fromVal = prevOverallRef.current;
    const toVal = metrics.overall;
    prevOverallRef.current = toVal;

    if (fromVal === toVal) {
      setAnimOverall(toVal);
      return;
    }

    const duration = 750;
    const startTime = performance.now();
    let rafId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      const ease = 1 - Math.pow(1 - progress, 3);
      const val = fromVal + (toVal - fromVal) * ease;
      setAnimOverall(val);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setAnimOverall(toVal);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [metrics.overall]);

  const aspects = [
    {
      id: 'income',
      label: 'Income konsisten',
      color: '#8f81ff',
      percent: metrics.incomeKonsisten,
      desc: 'Profit harian & mingguan vs target income',
    },
    {
      id: 'kebutuhan',
      label: 'Kebutuhan tercukupi',
      color: '#3fc9b0',
      percent: metrics.kebutuhanTercukupi,
      desc: 'Pemenuhan kebutuhan pokok finansial',
    },
    {
      id: 'stabil',
      label: 'Pengeluaran stabil',
      color: '#5aa9ff',
      percent: metrics.pengeluaranStabil,
      desc: 'Stabilitas modal harian & alokasi',
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

  const R = 80;
  const C = 2 * Math.PI * R;
  const arcOffset = C - (animOverall / 100) * C;

  const tipAngleDeg = -90 + (animOverall / 100) * 360;
  const tipAngleRad = (tipAngleDeg * Math.PI) / 180;
  const tipX = +(110 + R * Math.cos(tipAngleRad)).toFixed(2);
  const tipY = +(110 + R * Math.sin(tipAngleRad)).toFixed(2);

  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-4 pb-24 px-4 pt-1 animate-[fadeIn_0.3s_ease-out]">

      <div className="glass-card p-6 sm:p-7 rounded-[26px] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">

        <div
          className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: `${theme.primaryColor
}25` }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: `${theme.secondaryColor
}20` }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-display font-semibold mb-3">
            <Sparkles className="w-3 h-3" style={{ color: theme.primaryColor }} />
            <span className="text-[#f2f0ff]">Target {targetYear}</span>

            <span
              className="text-[10px] font-bold px-2 py-0.2 rounded-full border ml-1"
              style={{
                backgroundColor: theme.badgeBg.replace('bg-', ''),
                color: theme.primaryColor,
                borderColor: `${theme.primaryColor
}40`,
              }}
            >
              {theme.shortName}
            </span>

            {dailyRecords.length > 0 && (
              <span className="text-[10px] text-emerald-400 font-mono ml-0.5">
                • {dailyRecords.length} Hari
              </span>

            )}
          </div>

          <div className="relative w-60 h-60 shrink-0 flex items-center justify-center my-1 select-none">

            <div className="absolute inset-0 animate-spin-smooth pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 220 220">
                <defs>
                  <filter id="rodaOuterGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                </defs>

                <circle
                  cx="110"
                  cy="110"
                  r="101"
                  fill="none"
                  stroke={theme.primaryColor}
                  strokeWidth="1.2"
                  strokeDasharray="4 6"
                  opacity="0.4"
                  style={{ transition: 'stroke 0.5s ease' }}
                />
                <circle
                  cx="110"
                  cy="110"
                  r="95"
                  fill="none"
                  stroke={theme.secondaryColor}
                  strokeWidth="0.8"
                  opacity="0.25"
                  style={{ transition: 'stroke 0.5s ease' }}
                />

                {Array.from({ length: 8 }).map((_, i) => {
                  const rad = (i * 45 * Math.PI) / 180;
                  const x = +(110 + 101 * Math.cos(rad)).toFixed(2);
                  const y = +(110 + 101 * Math.sin(rad)).toFixed(2);
                  const innerX = +(110 + 91 * Math.cos(rad)).toFixed(2);
                  const innerY = +(110 + 91 * Math.sin(rad)).toFixed(2);
                  return (
                    <g key={`spoke_node_${i
}`}>
                      <line
                        x1={innerX}
                        y1={innerY}
                        x2={x}
                        y2={y}
                        stroke={theme.primaryColor}
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        opacity="0.5"
                        style={{ transition: 'stroke 0.5s ease' }}
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="2.8"
                        fill={theme.primaryColor}
                        filter="url(#rodaOuterGlow)"
                        style={{ transition: 'fill 0.5s ease' }}
                      />
                      <circle cx={x} cy={y} r="1.1" fill="#ffffff" opacity="0.9" />
                    </g>

                  );
                })}
              </svg>

            </div>

            <svg
              className="w-full h-full relative z-10"
              viewBox="0 0 220 220"
            >
              <defs>
                <linearGradient id="rodaArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={theme.primaryColor} style={{ transition: 'stop-color 0.5s ease' }} />
                  <stop offset="60%" stopColor={theme.secondaryColor} style={{ transition: 'stop-color 0.5s ease' }} />
                  <stop offset="100%" stopColor={theme.glowColor} style={{ transition: 'stop-color 0.5s ease' }} />
                </linearGradient>

                <filter id="rodaGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

              </defs>

              <circle
                cx="110"
                cy="110"
                r={R}
                fill="none"
                className="wheel-track"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {Array.from({ length: 5 }).map((_, i) => {
                const rad = ((i * 72 - 90) * Math.PI) / 180;
                const x = +(110 + R * Math.cos(rad)).toFixed(2);
                const y = +(110 + R * Math.sin(rad)).toFixed(2);
                return (
                  <circle
                    key={`pillar_div_${i}`}
                    cx={x}
                    cy={y}
                    r="1.8"
                    className="wheel-pillar-dot"
                    fill="rgba(255, 255, 255, 0.25)"
                  />
                );
              })}

              {animOverall > 0 && (
                <circle
                  cx="110"
                  cy="110"
                  r={R}
                  fill="none"
                  stroke="url(#rodaArcGrad)"
                  strokeWidth="14"
                  strokeDasharray={C}
                  strokeDashoffset={arcOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 110 110)"
                  filter="url(#rodaGlow)"
                  style={{
                    transition: 'stroke 0.5s ease',
                    willChange: 'stroke-dashoffset',
                  }}
                />
              )}

              {animOverall > 0 && (
                <g filter="url(#rodaGlow)">
                  <circle
                    cx={tipX}
                    cy={tipY}
                    r="7"
                    fill={theme.glowColor}
                    opacity="0.4"
                    style={{ transition: 'fill 0.5s ease' }}
                  />
                  <circle
                    cx={tipX}
                    cy={tipY}
                    r="4.5"
                    fill={theme.primaryColor}
                    style={{ transition: 'fill 0.5s ease' }}
                  />
                  <circle cx={tipX} cy={tipY} r="2.2" fill="#ffffff" />
                </g>

              )}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none z-20">
              <span className="text-4xl font-extrabold font-mono text-[#f2f0ff] tracking-tight tabular-nums">
                {Math.round(animOverall)}%
              </span>

              <span className="text-[11px] font-semibold font-display text-[#a7a3c9] uppercase tracking-wider mt-0.5">
                {hasData ? 'tercapai' : 'belum ada data'}
              </span>

              <span
                className="text-[10px] font-bold font-display px-2.5 py-0.5 rounded-full mt-1 border"
                style={{
                  backgroundColor: `${theme.primaryColor
}18`,
                  borderColor: `${theme.primaryColor
}35`,
                  color: theme.primaryColor,
                  transition: 'color 0.5s ease, background-color 0.5s ease, border-color 0.5s ease',
                }}
              >
                {theme.tier}
              </span>

            </div>

          </div>

        </div>

      </div>

      <div className="flex justify-center pt-1 pb-1">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-5 py-2.5 rounded-full glass-card-interactive flex items-center gap-2.5 text-xs font-display font-bold text-[#8f81ff] border border-[#7c6cf5]/40 shadow-[0_4px_20px_rgba(124,108,245,0.25)] hover:bg-[#7c6cf5]/20 active:scale-95 transition-all group cursor-pointer"
          aria-expanded={showDetails}
          aria-label="Lihat Semua Detail"
        >
          <span>{showDetails ? 'Sembunyikan Detail' : 'Lihat Semua Detail'}</span>

          <div className="w-6 h-6 rounded-full bg-[#7c6cf5]/30 group-hover:bg-[#7c6cf5] text-white flex items-center justify-center font-bold text-xs transition-colors shadow-inner">
            <motion.span
              animate={{ rotate: showDetails ? 180 : 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              ∨
            </motion.span>

          </div>

        </button>

      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -12 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 overflow-hidden pt-1"
          >

            <div className="glass-card p-5 rounded-[22px] border border-white/10 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8f81ff] font-display tracking-wider block">
                    Adaptasi Finansial
                  </span>

                  <h4 className="text-sm font-bold font-display text-[#f2f0ff]">
                    5 Pilar Core Mahoraga
                  </h4>

                </div>

                <span className="text-xs font-mono font-bold text-[#8f81ff] px-2 py-0.5 rounded-full bg-[#7c6cf5]/15 border border-[#7c6cf5]/30 tabular-nums">
                  {Math.round(animOverall)}% Total
                </span>

              </div>

              <div className="space-y-2">
                {aspects.map((aspect) => (
                  <div
                    key={aspect.id}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: aspect.color }}
                        />
                        <span className="text-[#f2f0ff] font-medium font-sans">
                          {aspect.label}
                        </span>

                      </div>

                      <span
                        className="font-mono font-bold text-xs"
                        style={{ color: aspect.color }}
                      >
                        {aspect.percent}%
                      </span>

                    </div>

                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${aspect.percent
}%`,
                          backgroundColor: aspect.color,
                        }}
                      />
                    </div>

                    <span className="text-[10px] text-[#a7a3c9] mt-1 block">
                      {aspect.desc}
                    </span>

                  </div>

                ))}
              </div>

            </div>

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
                          ? `${profile.tanggalTarget.tanggal
}/${profile.tanggalTarget.bulan
}/${profile.tanggalTarget.tahun
}`
                          : '-'}
                      </span>

                    </div>

                  </div>

                </div>

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

            {!hasData ? (
              <div className="glass-card p-6 rounded-[24px] border border-[#7c6cf5]/30 text-center relative overflow-hidden shadow-xl bg-gradient-to-b from-white/5 to-white/[0.02]">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#7c6cf5] to-[#8f81ff] flex items-center justify-center shadow-[0_0_24px_rgba(124,108,245,0.4)] mb-3">
                  <PlusCircle className="w-7 h-7 text-white" />
                </div>

                <h4 className="text-base font-bold text-[#f2f0ff]">
                  Mulai Perjalanan Finansialmu
                </h4>

                <p className="text-xs text-[#a7a3c9] mt-1 max-w-xs mx-auto leading-relaxed">
                  Catat harian (modal & hasil akhir) atau mingguan untuk mengaktifkan seluruh indikator target dan parameter lingkaran.
                </p>

                <button
                  onClick={onNavigateToCatat}
                  className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] text-white text-xs font-bold shadow-[0_4px_16px_rgba(124,108,245,0.4)] active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Catat Sekarang</span>

                </button>

              </div>

            ) : (
              <div className="grid grid-cols-2 gap-3">

                <div className="glass-card p-4 rounded-[22px] border border-white/10 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[#a7a3c9] mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        Total Profit
                      </span>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${                          metrics.totalProfit >= 0
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
                      className={`text-base font-extrabold tracking-tight tabular-nums ${                        metrics.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'

}`}
                    >
                      {formatRupiah(metrics.totalProfit)}
                    </div>

                  </div>

                  <span className="text-[10px] text-[#a7a3c9] mt-2 block">
                    {dailyRecords.length > 0 && `${dailyRecords.length
} hari `}
                    {records.length > 0 && `${records.length
} minggu`}
                  </span>

                </div>

                <div className="glass-card p-4 rounded-[22px] border border-white/10 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[#a7a3c9] mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        Rata-rata Grow
                      </span>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${                          metrics.avgGrow >= 0
                            ? 'bg-[#3fc9b0]/20 text-[#3fc9b0]'
                            : 'bg-rose-500/20 text-rose-400'

}`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>

                    </div>

                    <div
                      className={`text-base font-extrabold tracking-tight tabular-nums ${                        metrics.avgGrow >= 0 ? 'text-[#3fc9b0]' : 'text-rose-400'

}`}
                    >
                      {metrics.avgGrow >= 0 ? `+${metrics.avgGrow
}%` : `${metrics.avgGrow
}%`}
                    </div>

                  </div>

                  <span className="text-[10px] text-[#a7a3c9] mt-2 block">
                    Pertumbuhan kumulatif
                  </span>

                </div>

              </div>

            )}

            {hasData && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-[#f2f0ff]">
                  Riwayat & Laporan
                </span>

                <button
                  onClick={onNavigateToRiwayat}
                  className="text-xs text-[#8f81ff] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>Lihat Semua</span>

                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

              </div>

            )}
          </motion.div>

        )}
      </AnimatePresence>

    </div>

  );
};

export const BerandaTab = React.memo(BerandaTabComponent);
BerandaTab.displayName = 'BerandaTab';

