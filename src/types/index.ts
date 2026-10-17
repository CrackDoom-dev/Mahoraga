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
  rank?: string;
}

export interface FinanceTargets {
  incomePerHari: number;      // default: 100000
  kebutuhanPerMinggu: number; // default: 500000
  totalUtang: number;         // default: 0
  targetTabungan: number;     // default: 10000000
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
}
