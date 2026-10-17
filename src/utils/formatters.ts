/**
 * Indonesian Rupiah and Date formatting utilities
 */

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp0';
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return isNegative ? `-Rp${formatted}` : `Rp${formatted}`;
}

export function parseRupiahInput(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const clean = value.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatTanggalIndo(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '-';
  const tgl = date.getDate();
  const bln = NAMA_BULAN[date.getMonth()];
  const thn = date.getFullYear();
  return `${tgl} ${bln} ${thn}`;
}

export function getDaysRemaining(target: { tanggal: number; bulan: number; tahun: number }): number {
  if (!target || !target.tanggal || !target.bulan || !target.tahun) return 0;
  // target.bulan is 1-indexed in form (1 = Januari)
  const targetDate = new Date(target.tahun, target.bulan - 1, target.tanggal);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) {
    return 'Selamat Pagi';
  } else if (hour >= 11 && hour < 15) {
    return 'Selamat Siang';
  } else if (hour >= 15 && hour < 18) {
    return 'Selamat Sore';
  } else {
    return 'Selamat Malam';
  }
}
