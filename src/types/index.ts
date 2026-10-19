export type RankTier =
  | 'F-Rank Pemula'
  | 'E-Rank Pejuang'
  | 'D-Rank Konsisten'
  | 'C-Rank Terencana'
  | 'B-Rank Finansial Stabil'
  | 'A-Rank Mandiri Finansial'
  | 'S-Rank Apex Mahoraga'
  | 'Divine Mahoraga';

export interface Profile {
  nama: string;
  targetTujuan: string;
  tanggalTarget: {
    tanggal: number;
    bulan: number;
    tahun: number;
  };
  avatar?: string;
  level?: number;
  rank?: RankTier | string;
  customRank?: string;
  isRankManual?: boolean;
  lastSeenTier?: RankTier;
}

export interface FinanceTargets {
  incomePerHari: number;      // default: 100000
  kebutuhanPerMinggu: number; // default: 500000
  totalUtang: number;         // default: 0
  targetTabungan: number;     // default: 10000000
}

export interface DailyRecord {
  id: string;
  tanggal: string; // ISO string or YYYY-MM-DD
  modal: number;
  hasilAkhir: number;
  profit: number; // hasilAkhir - modal
  growPersen: number; // ((hasilAkhir / modal) - 1) * 100
  createdAt: number;
}

export interface WeeklyRecord {
  id: string;
  mingguKe: number;
  tanggal: string; // ISO string
  modalAwal: number;
  finis: number;
  profit: number; // finis - modalAwal
  growPersen: number; // ((finis / modalAwal) - 1) * 100
  kebutuhanTerpenuhi?: number;
  bayarUtang?: number;
  tabunganDisisihkan?: number;
  catatan?: string;
}

export interface AppSettings {
  themeMode: 'dark' | 'light' | 'system';
  overlayOpacity: number; // 0 to 90
  cardBlur: number; // 0 to 25
  hasCustomBg: boolean;
  customBgType: 'image' | 'video' | 'none';
}

export interface ProgressMetrics {
  incomeKonsisten: number;    // 0-100%
  kebutuhanTercukupi: number;  // 0-100%
  pengeluaranStabil: number;   // 0-100%
  lepasGaliLubang: number;     // 0-100%
  tabungan: number;            // 0-100%
  overall: number;             // 0-100%
  totalProfit: number;
  avgGrow: number;
  daysRemaining: number;
  dailyCount: number;
  weeklyCount: number;
}
