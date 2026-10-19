import { WeeklyRecord, DailyRecord, FinanceTargets, ProgressMetrics, Profile } from '../types';
import { getDaysRemaining } from './formatters';

function clamp(value: number, min = 0, max = 100): number {
  if (isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function calculateProgress(
  records: WeeklyRecord[],
  dailyRecords: DailyRecord[] = [],
  targets: FinanceTargets,
  profile: Profile | null
): ProgressMetrics {
  const sortedWeekly = [...records].sort((a, b) => a.mingguKe - b.mingguKe);
  const sortedDaily = [...dailyRecords].sort((a, b) => a.createdAt - b.createdAt);

  const weeklyCount = sortedWeekly.length;
  const dailyCount = sortedDaily.length;
  const totalCount = weeklyCount + dailyCount;

  if (totalCount === 0) {
    return {
      incomeKonsisten: 0,
      kebutuhanTercukupi: 0,
      pengeluaranStabil: 0,
      lepasGaliLubang: 0,
      tabungan: 0,
      overall: 0,
      totalProfit: 0,
      avgGrow: 0,
      daysRemaining: profile ? getDaysRemaining(profile.tanggalTarget) : 0,
      dailyCount: 0,
      weeklyCount: 0,
    };
  }

  // 1. Income Konsisten
  // Mengintegrasikan catatan harian (modal & hasil akhir) dan mingguan
  let incomeKonsisten = 0;
  let dailyIncomeScore = 0;
  let weeklyIncomeScore = 0;

  if (dailyCount > 0) {
    const last7Daily = sortedDaily.slice(-7);
    const sumDailyProfit = last7Daily.reduce((acc, d) => acc + (d.hasilAkhir - d.modal), 0);
    const avgDailyProfit = sumDailyProfit / last7Daily.length;
    if (targets.incomePerHari > 0) {
      dailyIncomeScore = clamp((avgDailyProfit / targets.incomePerHari) * 100);
    }
  }

  if (weeklyCount > 0) {
    const last4Weekly = sortedWeekly.slice(-4);
    const sumProfitLast4 = last4Weekly.reduce((acc, r) => acc + (r.finis - r.modalAwal), 0);
    const avgProfitLast4 = sumProfitLast4 / last4Weekly.length;
    const targetWeeklyIncome = (targets.incomePerHari || 0) * 7;
    if (targetWeeklyIncome > 0) {
      weeklyIncomeScore = clamp((avgProfitLast4 / targetWeeklyIncome) * 100);
    }
  }

  if (dailyCount > 0 && weeklyCount > 0) {
    incomeKonsisten = (dailyIncomeScore * 0.5) + (weeklyIncomeScore * 0.5);
  } else if (dailyCount > 0) {
    incomeKonsisten = dailyIncomeScore;
  } else {
    incomeKonsisten = weeklyIncomeScore;
  }

  // 2. Kebutuhan Tercukupi
  let kebutuhanTercukupi = 0;
  if (weeklyCount > 0) {
    const last4 = sortedWeekly.slice(-4);
    const sumKebutuhanLast4 = last4.reduce((acc, r) => acc + (r.kebutuhanTerpenuhi || 0), 0);
    const avgKebutuhanLast4 = sumKebutuhanLast4 / last4.length;
    if (targets.kebutuhanPerMinggu > 0) {
      kebutuhanTercukupi = clamp((avgKebutuhanLast4 / targets.kebutuhanPerMinggu) * 100);
    }
  } else if (dailyCount > 0 && targets.incomePerHari > 0) {
    // Estimasi kebutuhan tercukupi dari konsistensi surplus profit harian
    const avgDailySurplus = sortedDaily.reduce((acc, d) => acc + Math.max(0, d.hasilAkhir - d.modal), 0) / dailyCount;
    const dailyTargetNeeded = (targets.kebutuhanPerMinggu || 500000) / 7;
    kebutuhanTercukupi = clamp((avgDailySurplus / dailyTargetNeeded) * 100);
  }

  // 3. Pengeluaran Stabil
  // Dihitung dari stabilitas modal harian dan mingguan (Koefisien Variasi Modal)
  let pengeluaranStabil = 0;
  const stabilityScores: number[] = [];

  if (dailyCount >= 2) {
    const dailyModals = sortedDaily.map((d) => d.modal);
    const meanDailyModal = dailyModals.reduce((a, b) => a + b, 0) / dailyCount;
    if (meanDailyModal > 0) {
      const variance = dailyModals.reduce((acc, m) => acc + Math.pow(m - meanDailyModal, 2), 0) / dailyCount;
      const stdDev = Math.sqrt(variance);
      const cv = (stdDev / meanDailyModal) * 100;
      stabilityScores.push(clamp(100 - cv));
    }
  }

  if (weeklyCount >= 2) {
    const weeklyModals = sortedWeekly.map((r) => r.modalAwal);
    const meanWeeklyModal = weeklyModals.reduce((a, b) => a + b, 0) / weeklyCount;
    if (meanWeeklyModal > 0) {
      const variance = weeklyModals.reduce((acc, m) => acc + Math.pow(m - meanWeeklyModal, 2), 0) / weeklyCount;
      const stdDev = Math.sqrt(variance);
      const cv = (stdDev / meanWeeklyModal) * 100;
      stabilityScores.push(clamp(100 - cv));
    }
  }

  if (stabilityScores.length > 0) {
    pengeluaranStabil = stabilityScores.reduce((a, b) => a + b, 0) / stabilityScores.length;
  } else if (totalCount === 1) {
    pengeluaranStabil = 50; // Skor baseline 1 catatan awal
  }

  // 4. Lepas dari Gali Lubang
  let lepasGaliLubang = 0;
  const totalBayarUtangWeekly = sortedWeekly.reduce((acc, r) => acc + (r.bayarUtang || 0), 0);
  if (targets.totalUtang > 0) {
    lepasGaliLubang = clamp((totalBayarUtangWeekly / targets.totalUtang) * 100);
  } else {
    // Jika tidak ada utang, aspek ini otomatis 100% bebas gali lubang!
    lepasGaliLubang = 100;
  }

  // 5. Tabungan
  let tabungan = 0;
  const totalDisisihkanWeekly = sortedWeekly.reduce((acc, r) => acc + (r.tabunganDisisihkan || 0), 0);
  // Tambahkan akumulasi profit harian positif sebagai kontribusi pertumbuhan tabungan jika belum dialokasikan mingguan
  const totalDailyProfit = sortedDaily.reduce((acc, d) => acc + Math.max(0, d.hasilAkhir - d.modal), 0);
  const totalAsetTabungan = totalDisisihkanWeekly + (weeklyCount === 0 ? totalDailyProfit : 0);

  if (targets.targetTabungan > 0) {
    tabungan = clamp((totalAsetTabungan / targets.targetTabungan) * 100);
  }

  // Progres Roda Mahoraga Keseluruhan = Rata-rata 5 pilar adaptif
  const overall = Math.round(
    (incomeKonsisten + kebutuhanTercukupi + pengeluaranStabil + lepasGaliLubang + tabungan) / 5
  );

  // Total Profit Gabungan (Harian + Mingguan)
  const totalProfitWeekly = sortedWeekly.reduce((acc, r) => acc + (r.finis - r.modalAwal), 0);
  const totalProfitDaily = sortedDaily.reduce((acc, d) => acc + (d.hasilAkhir - d.modal), 0);
  const totalProfit = totalProfitWeekly + totalProfitDaily;

  // Rata-rata Pertumbuhan (Grow)
  const allGrows: number[] = [];
  sortedWeekly.forEach((r) => {
    if (r.modalAwal > 0) {
      allGrows.push(((r.finis / r.modalAwal) - 1) * 100);
    }
  });
  sortedDaily.forEach((d) => {
    if (d.modal > 0) {
      allGrows.push(((d.hasilAkhir / d.modal) - 1) * 100);
    }
  });

  const avgGrow = allGrows.length > 0
    ? Number((allGrows.reduce((a, b) => a + b, 0) / allGrows.length).toFixed(1))
    : 0;

  return {
    incomeKonsisten: Math.round(incomeKonsisten),
    kebutuhanTercukupi: Math.round(kebutuhanTercukupi),
    pengeluaranStabil: Math.round(pengeluaranStabil),
    lepasGaliLubang: Math.round(lepasGaliLubang),
    tabungan: Math.round(tabungan),
    overall,
    totalProfit,
    avgGrow,
    daysRemaining: profile ? getDaysRemaining(profile.tanggalTarget) : 0,
    dailyCount,
    weeklyCount,
  };
}
