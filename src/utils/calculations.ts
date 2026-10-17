import { WeeklyRecord, FinanceTargets, ProgressMetrics, Profile } from '../types';
import { getDaysRemaining } from './formatters';

function clamp(value: number, min = 0, max = 100): number {
  if (isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function calculateProgress(
  records: WeeklyRecord[],
  targets: FinanceTargets,
  profile: Profile | null
): ProgressMetrics {
  // Sort records by mingguKe ascending
  const sorted = [...records].sort((a, b) => a.mingguKe - b.mingguKe);
  const count = sorted.length;

  if (count === 0) {
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
    };
  }

  // 1. Income konsisten
  // Rata-rata profit (finis - modal) maksimal 4 minggu terakhir / (target income per hari x 7)
  const last4 = sorted.slice(-4);
  const sumProfitLast4 = last4.reduce((acc, r) => acc + (r.finis - r.modalAwal), 0);
  const avgProfitLast4 = sumProfitLast4 / last4.length;
  const targetWeeklyIncome = (targets.incomePerHari || 0) * 7;
  let incomeKonsisten = 0;
  if (targetWeeklyIncome > 0) {
    incomeKonsisten = clamp((avgProfitLast4 / targetWeeklyIncome) * 100);
  }

  // 2. Kebutuhan tercukupi
  // Rata-rata 'kebutuhan terpenuhi' 4 minggu terakhir / target kebutuhan per minggu
  const sumKebutuhanLast4 = last4.reduce((acc, r) => acc + (r.kebutuhanTerpenuhi || 0), 0);
  const avgKebutuhanLast4 = sumKebutuhanLast4 / last4.length;
  let kebutuhanTercukupi = 0;
  if (targets.kebutuhanPerMinggu > 0) {
    kebutuhanTercukupi = clamp((avgKebutuhanLast4 / targets.kebutuhanPerMinggu) * 100);
  }

  // 3. Pengeluaran stabil
  // 100 - koefisien variasi modal antar minggu (butuh minimal 2 minggu data, jika kurang tampilkan 0%)
  let pengeluaranStabil = 0;
  if (count >= 2) {
    const modals = sorted.map((r) => r.modalAwal);
    const meanModal = modals.reduce((acc, m) => acc + m, 0) / count;
    if (meanModal > 0) {
      const variance =
        modals.reduce((acc, m) => acc + Math.pow(m - meanModal, 2), 0) / count;
      const stdDev = Math.sqrt(variance);
      const cv = (stdDev / meanModal) * 100; // Koefisien Variasi in %
      pengeluaranStabil = clamp(100 - cv);
    }
  }

  // 4. Lepas dari gali lubang
  // Total bayar utang / total utang
  let lepasGaliLubang = 0;
  const totalBayarUtang = sorted.reduce((acc, r) => acc + (r.bayarUtang || 0), 0);
  if (targets.totalUtang > 0) {
    lepasGaliLubang = clamp((totalBayarUtang / targets.totalUtang) * 100);
  }

  // 5. Tabungan
  // Total disisihkan / target tabungan
  let tabungan = 0;
  const totalDisisihkan = sorted.reduce((acc, r) => acc + (r.tabunganDisisihkan || 0), 0);
  if (targets.targetTabungan > 0) {
    tabungan = clamp((totalDisisihkan / targets.targetTabungan) * 100);
  }

  // Progres keseluruhan = rata-rata kelima aspek
  const overall = Math.round(
    (incomeKonsisten + kebutuhanTercukupi + pengeluaranStabil + lepasGaliLubang + tabungan) / 5
  );

  // Total profit = sum(finis - modal)
  const totalProfit = sorted.reduce((acc, r) => acc + (r.finis - r.modalAwal), 0);

  // Rata-rata grow = rata-rata persen (finis/modal - 1) semua minggu
  const sumGrow = sorted.reduce((acc, r) => {
    const grow = r.modalAwal > 0 ? ((r.finis / r.modalAwal) - 1) * 100 : 0;
    return acc + grow;
  }, 0);
  const avgGrow = Number((sumGrow / count).toFixed(1));

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
  };
}
