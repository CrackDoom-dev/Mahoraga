import React, { useState } from 'react';
import { WeeklyRecord, DailyRecord } from '../types';
import { formatRupiah, parseRupiahInput, formatTanggalIndo } from '../utils/formatters';
import {
  Wallet,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  PiggyBank,
  ShoppingBag,
  FileText,
  AlertCircle,
  Sparkles,
  Calendar,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CatatTabProps {
  records: WeeklyRecord[];
  dailyRecords?: DailyRecord[];
  onSaveWeek: (newRecord: WeeklyRecord) => void;
  onSaveDaily: (newRecord: DailyRecord) => void;
  onSuccessRedirect: () => void;
}

const CatatTabComponent: React.FC<CatatTabProps> = ({
  records,
  dailyRecords = [],
  onSaveWeek,
  onSaveDaily,
  onSuccessRedirect,
}) => {

  const [mode, setMode] = useState<'harian' | 'mingguan'>('harian');

  const todayStr = new Date().toISOString().slice(0, 10);
  const [dailyTanggal, setDailyTanggal] = useState<string>(todayStr);
  const [dailyModalInput, setDailyModalInput] = useState<string>('');
  const [dailyHasilAkhirInput, setDailyHasilAkhirInput] = useState<string>('');
  const [dailyErrors, setDailyErrors] = useState<{ modal?: string; hasilAkhir?: string }>({});

  const currentWeekNumber = records.length + 1;
  const previousRecord = records.length > 0 ? records[records.length - 1] : null;

  const [modalAwalInput, setModalAwalInput] = useState<string>(
    previousRecord ? previousRecord.finis.toString() : ''
  );
  const [finisInput, setFinisInput] = useState<string>('');
  const [kebutuhanInput, setKebutuhanInput] = useState<string>('');
  const [bayarUtangInput, setBayarUtangInput] = useState<string>('');
  const [tabunganInput, setTabunganInput] = useState<string>('');
  const [catatanInput, setCatatanInput] = useState<string>('');
  const [weeklyErrors, setWeeklyErrors] = useState<{ modalAwal?: string; finis?: string }>({});

  const [showSuccessModal, setShowSuccessModal] = useState<{ show: boolean; title: string }>({
    show: false,
    title: '',
  });

  const dailyModal = parseRupiahInput(dailyModalInput);
  const dailyHasilAkhir = parseRupiahInput(dailyHasilAkhirInput);
  const dailyProfit = dailyHasilAkhir - dailyModal;
  const dailyGrow = dailyModal > 0 && dailyHasilAkhirInput ? ((dailyHasilAkhir / dailyModal) - 1) * 100 : 0;

  const modalAwal = parseRupiahInput(modalAwalInput);
  const finis = parseRupiahInput(finisInput);
  const kebutuhan = parseRupiahInput(kebutuhanInput);
  const bayarUtang = parseRupiahInput(bayarUtangInput);
  const tabungan = parseRupiahInput(tabunganInput);
  const weeklyProfit = finis - modalAwal;
  const weeklyGrow = modalAwal > 0 && finisInput ? ((finis / modalAwal) - 1) * 100 : 0;

  const handleSaveDaily = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { modal?: string; hasilAkhir?: string } = {};

    if (!dailyModal || dailyModal <= 0) {
      errs.modal = 'Modal hari ini wajib diisi dan lebih dari 0.';
    }

    if (!dailyHasilAkhirInput || dailyHasilAkhir < 0) {
      errs.hasilAkhir = 'Hasil akhir hari ini wajib diisi.';
    }

    setDailyErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const newDaily: DailyRecord = {
      id: `daily_${Date.now()
}`,
      tanggal: dailyTanggal,
      modal: dailyModal,
      hasilAkhir: dailyHasilAkhir,
      profit: dailyProfit,
      growPersen: Number(dailyGrow.toFixed(1)),
      createdAt: Date.now(),
    };

    onSaveDaily(newDaily);

    if (dailyProfit > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#7c6cf5', '#3fc9b0', '#ffb454', '#ff7aa8'],
        });
      } catch {

      }
    }

    setShowSuccessModal({
      show: true,
      title: 'Catatan Harian Tersimpan!',
    });

    setTimeout(() => {
      setShowSuccessModal({ show: false, title: '' });
      onSuccessRedirect();
    }, 1200);
  };

  const handleSaveWeekly = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { modalAwal?: string; finis?: string } = {};

    if (!modalAwal || modalAwal <= 0) {
      errs.modalAwal = 'Modal awal harus lebih besar dari 0.';
    }

    if (!finisInput || finis < 0) {
      errs.finis = 'Finis akhir minggu wajib diisi.';
    }

    setWeeklyErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const newRecord: WeeklyRecord = {
      id: `week_${Date.now()
}`,
      mingguKe: currentWeekNumber,
      tanggal: new Date().toISOString(),
      modalAwal,
      finis,
      profit: weeklyProfit,
      growPersen: Number(weeklyGrow.toFixed(1)),
      kebutuhanTerpenuhi: kebutuhan || undefined,
      bayarUtang: bayarUtang || undefined,
      tabunganDisisihkan: tabungan || undefined,
      catatan: catatanInput.trim() || undefined,
    };

    onSaveWeek(newRecord);

    if (weeklyProfit > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#7c6cf5', '#3fc9b0', '#ffb454', '#ff7aa8'],
        });
      } catch {

      }
    }

    setShowSuccessModal({
      show: true,
      title: `Minggu ${currentWeekNumber
} Tersimpan!`,
    });

    setTimeout(() => {
      setShowSuccessModal({ show: false, title: '' });
      onSuccessRedirect();
    }, 1200);
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-1 animate-[fadeIn_0.3s_ease-out]">

      <div className="p-1 rounded-2xl bg-[#15132f] border border-white/10 flex items-center shadow-lg">
        <button
          type="button"
          onClick={() => setMode('harian')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${            mode === 'harian'
              ? 'bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] text-white shadow-md'
              : 'text-[#a7a3c9] hover:text-white'

}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Catat Harian (Modal & Hasil)</span>

        </button>

        <button
          type="button"
          onClick={() => setMode('mingguan')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${            mode === 'mingguan'
              ? 'bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] text-white shadow-md'
              : 'text-[#a7a3c9] hover:text-white'

}`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Catat Mingguan</span>

        </button>

      </div>

      {mode === 'harian' ? (

        <div className="space-y-3.5">

          <div className="glass-card p-5 rounded-[24px] border border-white/10 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider font-display flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Input Keuangan Harian
              </span>

              <h3 className="text-xl font-extrabold text-[#f2f0ff] mt-0.5 font-display">
                Catatan Per Hari
              </h3>

              <p className="text-xs text-[#a7a3c9] mt-1 font-sans">
                Khusus 2 opsi: masukkan modal & hasil akhir. Langsung tersinkronisasi ke persentase roda lingkaran.
              </p>

            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/30 to-[#3fc9b0]/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-[#3fc9b0]" />
            </div>

          </div>

          <form onSubmit={handleSaveDaily} className="space-y-3.5">

            <div className="glass-card p-3.5 rounded-[20px] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#5aa9ff]">
                  <Calendar className="w-4 h-4" />
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#a7a3c9] block">
                    Tanggal Catatan
                  </span>

                  <span className="text-xs font-bold text-[#f2f0ff]">
                    {formatTanggalIndo(dailyTanggal)}
                  </span>

                </div>

              </div>

              <input
                type="date"
                value={dailyTanggal}
                onChange={(e) => setDailyTanggal(e.target.value)}
                className="bg-[#15132f] border border-white/10 text-xs text-[#f2f0ff] rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#7c6cf5]"
              />
            </div>

            <div className="glass-card p-4 rounded-[22px] border border-white/10 shadow-md">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#a7a3c9] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#5aa9ff]" />
                  1. Modal Hari Ini <span className="text-red-400">*</span>

                </span>

                <span className="text-[10px] text-[#8f81ff] font-mono">
                  {dailyModal > 0 ? formatRupiah(dailyModal) : ''}
                </span>

              </label>

              <input
                type="text"
                inputMode="numeric"
                value={dailyModalInput ? formatRupiah(dailyModal) : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setDailyModalInput(raw);
                  if (dailyErrors.modal) setDailyErrors({ ...dailyErrors, modal: undefined });
                }}
                placeholder="Rp0"
                className={`w-full min-h-[48px] px-4 rounded-xl bg-white/5 border text-sm text-[#f2f0ff] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7c6cf5] transition-all ${                  dailyErrors.modal ? 'border-red-400 bg-red-400/5' : 'border-white/10'

}`}
              />
              {dailyErrors.modal && (
                <p className="text-xs text-red-400 mt-1 pl-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {dailyErrors.modal}
                </p>

              )}
            </div>

            <div className="glass-card p-4 rounded-[22px] border border-white/10 shadow-md">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#a7a3c9] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#3fc9b0]" />
                  2. Hasil Akhir Hari Ini <span className="text-red-400">*</span>

                </span>

                <span className="text-[10px] text-[#3fc9b0] font-mono">
                  {dailyHasilAkhir > 0 ? formatRupiah(dailyHasilAkhir) : ''}
                </span>

              </label>

              <input
                type="text"
                inputMode="numeric"
                value={dailyHasilAkhirInput ? formatRupiah(dailyHasilAkhir) : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setDailyHasilAkhirInput(raw);
                  if (dailyErrors.hasilAkhir) setDailyErrors({ ...dailyErrors, hasilAkhir: undefined });
                }}
                placeholder="Rp0"
                className={`w-full min-h-[48px] px-4 rounded-xl bg-white/5 border text-sm text-[#f2f0ff] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7c6cf5] transition-all ${                  dailyErrors.hasilAkhir ? 'border-red-400 bg-red-400/5' : 'border-white/10'

}`}
              />
              {dailyErrors.hasilAkhir && (
                <p className="text-xs text-red-400 mt-1 pl-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {dailyErrors.hasilAkhir}
                </p>

              )}
            </div>

            {dailyModal > 0 && dailyHasilAkhirInput && (
              <div className="glass-card p-4 rounded-[20px] border border-white/15 bg-white/[0.04] grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#a7a3c9] block">
                    Profit Hari Ini
                  </span>

                  <div
                    className={`text-base font-extrabold mt-0.5 font-mono ${                      dailyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'

}`}
                  >
                    {formatRupiah(dailyProfit)}
                  </div>

                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#a7a3c9] block">
                    Pertumbuhan (Grow)
                  </span>

                  <div
                    className={`text-base font-extrabold mt-0.5 font-mono ${                      dailyGrow >= 0 ? 'text-[#3fc9b0]' : 'text-rose-400'

}`}
                  >
                    {dailyGrow >= 0 ? `+${dailyGrow.toFixed(1)
}%` : `${dailyGrow.toFixed(1)
}%`}
                  </div>

                </div>

              </div>

            )}

            <button
              type="submit"
              className="w-full min-h-[50px] flex items-center justify-center gap-2 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 via-[#3fc9b0] to-[#7c6cf5] shadow-[0_4px_20px_rgba(63,201,176,0.35)] active:scale-[0.98] transition-all hover:brightness-110 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simpan Catatan Harian</span>

            </button>

          </form>

        </div>

      ) : (

        <div className="space-y-3.5">

          <div className="glass-card p-5 rounded-[24px] border border-white/10 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-[#8f81ff] tracking-wider font-display">
                Input Keuangan Mingguan
              </span>

              <h3 className="text-xl font-extrabold text-[#f2f0ff] mt-0.5 font-display">
                Minggu {currentWeekNumber}
              </h3>

              <p className="text-xs text-[#a7a3c9] mt-1 font-sans">
                {previousRecord
                  ? `Modal otomatis disinkronkan dari finis Minggu ${previousRecord.mingguKe
}`
                  : 'Minggu pertama: masukkan modal awal dan hasil finismu'}
              </p>

            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7c6cf5]/30 to-[#8f81ff]/20 border border-[#7c6cf5]/40 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6 text-[#8f81ff]" />
            </div>

          </div>

          <form onSubmit={handleSaveWeekly} className="space-y-3.5">

            <div className="glass-card p-4 rounded-[22px] border border-white/10 shadow-md">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#a7a3c9] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#5aa9ff]" />
                  Modal Awal / Pengeluaran Awal <span className="text-red-400">*</span>

                </span>

                <span className="text-[10px] text-[#8f81ff]">
                  {modalAwal > 0 ? formatRupiah(modalAwal) : ''}
                </span>

              </label>

              <input
                type="text"
                inputMode="numeric"
                value={modalAwalInput ? formatRupiah(modalAwal) : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setModalAwalInput(raw);
                  if (weeklyErrors.modalAwal) setWeeklyErrors({ ...weeklyErrors, modalAwal: undefined });
                }}
                placeholder="Rp0"
                className={`w-full min-h-[48px] px-4 rounded-xl bg-white/5 border text-sm text-[#f2f0ff] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7c6cf5] transition-all ${                  weeklyErrors.modalAwal ? 'border-red-400 bg-red-400/5' : 'border-white/10'

}`}
              />
              {weeklyErrors.modalAwal && (
                <p className="text-xs text-red-400 mt-1 pl-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {weeklyErrors.modalAwal}
                </p>

              )}
            </div>

            <div className="glass-card p-4 rounded-[22px] border border-white/10 shadow-md">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#a7a3c9] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#3fc9b0]" />
                  Finis Akhir Minggu <span className="text-red-400">*</span>

                </span>

                <span className="text-[10px] text-[#3fc9b0]">
                  {finis > 0 ? formatRupiah(finis) : ''}
                </span>

              </label>

              <input
                type="text"
                inputMode="numeric"
                value={finisInput ? formatRupiah(finis) : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setFinisInput(raw);
                  if (weeklyErrors.finis) setWeeklyErrors({ ...weeklyErrors, finis: undefined });
                }}
                placeholder="Rp0"
                className={`w-full min-h-[48px] px-4 rounded-xl bg-white/5 border text-sm text-[#f2f0ff] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7c6cf5] transition-all ${                  weeklyErrors.finis ? 'border-red-400 bg-red-400/5' : 'border-white/10'

}`}
              />
              {weeklyErrors.finis && (
                <p className="text-xs text-red-400 mt-1 pl-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {weeklyErrors.finis}
                </p>

              )}
            </div>

            {modalAwal > 0 && finisInput && (
              <div className="glass-card p-4 rounded-[20px] border border-white/15 bg-white/[0.04] grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#a7a3c9] block">
                    Estimasi Profit
                  </span>

                  <div
                    className={`text-base font-extrabold mt-0.5 font-mono ${                      weeklyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'

}`}
                  >
                    {formatRupiah(weeklyProfit)}
                  </div>

                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#a7a3c9] block">
                    Pertumbuhan (Grow)
                  </span>

                  <div
                    className={`text-base font-extrabold mt-0.5 font-mono ${                      weeklyGrow >= 0 ? 'text-[#3fc9b0]' : 'text-rose-400'

}`}
                  >
                    {weeklyGrow >= 0 ? `+${weeklyGrow.toFixed(1)
}%` : `${weeklyGrow.toFixed(1)
}%`}
                  </div>

                </div>

              </div>

            )}

            <div className="glass-card p-4 rounded-[22px] border border-white/10 space-y-3.5">
              <span className="text-xs font-bold text-[#f2f0ff] block border-b border-white/10 pb-2">
                Rincian Alokasi (Opsional)
              </span>

              <div>
                <label className="block text-xs font-semibold text-[#a7a3c9] mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#3fc9b0]" />
                    Kebutuhan Pokok Terpenuhi
                  </span>

                  {kebutuhan > 0 && (
                    <span className="text-[10px] text-[#3fc9b0]">
                      {formatRupiah(kebutuhan)}
                    </span>

                  )}
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={kebutuhanInput ? formatRupiah(kebutuhan) : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setKebutuhanInput(raw);
                  }}
                  placeholder="Contoh: Rp350.000"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f2f0ff] focus:outline-none focus:ring-2 focus:ring-[#7c6cf5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a7a3c9] mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#ffb454]" />
                    Bayar Utang
                  </span>

                  {bayarUtang > 0 && (
                    <span className="text-[10px] text-[#ffb454]">
                      {formatRupiah(bayarUtang)}
                    </span>

                  )}
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={bayarUtangInput ? formatRupiah(bayarUtang) : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setBayarUtangInput(raw);
                  }}
                  placeholder="Contoh: Rp200.000"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f2f0ff] focus:outline-none focus:ring-2 focus:ring-[#7c6cf5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a7a3c9] mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <PiggyBank className="w-3.5 h-3.5 text-[#ff7aa8]" />
                    Disisihkan ke Tabungan
                  </span>

                  {tabungan > 0 && (
                    <span className="text-[10px] text-[#ff7aa8]">
                      {formatRupiah(tabungan)}
                    </span>

                  )}
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={tabunganInput ? formatRupiah(tabungan) : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setTabunganInput(raw);
                  }}
                  placeholder="Contoh: Rp150.000"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f2f0ff] focus:outline-none focus:ring-2 focus:ring-[#7c6cf5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a7a3c9] mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#a7a3c9]" />
                  Catatan Minggu Ini
                </label>

                <input
                  type="text"
                  value={catatanInput}
                  onChange={(e) => setCatatanInput(e.target.value)}
                  placeholder="Contoh: Profit konsisten, pengeluaran terkendali"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f2f0ff] focus:outline-none focus:ring-2 focus:ring-[#7c6cf5]"
                />
              </div>

            </div>

            <button
              type="submit"
              className="w-full min-h-[50px] flex items-center justify-center gap-2 rounded-2xl font-bold text-white bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] shadow-[0_4px_20px_rgba(124,108,245,0.4)] active:scale-[0.98] transition-all hover:brightness-110 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simpan Minggu Ini</span>

            </button>

          </form>

        </div>

      )}

      {showSuccessModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="glass-card p-6 rounded-[24px] border border-[#7c6cf5]/40 shadow-2xl flex flex-col items-center text-center animate-[scaleUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-9 h-9 text-emerald-400 animate-[bounce_0.5s]" />
            </div>

            <h4 className="text-base font-bold text-[#f2f0ff]">
              {showSuccessModal.title}
            </h4>

            <p className="text-xs text-[#a7a3c9] mt-1">
              Data berhasil tersinkron ke parameter roda Mahoraga. Mengalihkan ke Beranda...
            </p>

          </div>

        </div>

      )}
    </div>

  );
};

export const CatatTab = React.memo(CatatTabComponent);
CatatTab.displayName = 'CatatTab';

