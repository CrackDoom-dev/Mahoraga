import React, { useState, useEffect } from 'react';
import { WeeklyRecord } from '../types';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CatatTabProps {
  records: WeeklyRecord[];
  onSaveWeek: (newRecord: WeeklyRecord) => void;
  onSuccessRedirect: () => void;
}

export const CatatTab: React.FC<CatatTabProps> = ({
  records,
  onSaveWeek,
  onSuccessRedirect,
}) => {
  // Current week number is total existing records + 1
  const currentWeekNumber = records.length + 1;
  const previousRecord = records.length > 0 ? records[records.length - 1] : null;

  // Initial modal awal: from previous week finish, or empty if week 1
  const [modalAwalInput, setModalAwalInput] = useState<string>(
    previousRecord ? previousRecord.finis.toString() : ''
  );
  const [finisInput, setFinisInput] = useState<string>('');
  const [kebutuhanInput, setKebutuhanInput] = useState<string>('');
  const [bayarUtangInput, setBayarUtangInput] = useState<string>('');
  const [tabunganInput, setTabunganInput] = useState<string>('');
  const [catatanInput, setCatatanInput] = useState<string>('');

  const [errors, setErrors] = useState<{ modalAwal?: string; finis?: string }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Live parsed numbers
  const modalAwal = parseRupiahInput(modalAwalInput);
  const finis = parseRupiahInput(finisInput);
  const kebutuhan = parseRupiahInput(kebutuhanInput);
  const bayarUtang = parseRupiahInput(bayarUtangInput);
  const tabungan = parseRupiahInput(tabunganInput);

  // Live calculation
  const liveProfit = finis - modalAwal;
  const liveGrow =
    modalAwal > 0 && finisInput ? ((finis / modalAwal) - 1) * 100 : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { modalAwal?: string; finis?: string } = {};

    if (!modalAwal || modalAwal <= 0) {
      newErrors.modalAwal = 'Modal awal harus lebih besar dari 0.';
    }

    if (!finisInput || finis < 0) {
      newErrors.finis = 'Finis akhir minggu wajib diisi.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const newRecord: WeeklyRecord = {
      id: `week_${Date.now()}`,
      mingguKe: currentWeekNumber,
      tanggal: new Date().toISOString(),
      modalAwal,
      finis,
      profit: liveProfit,
      growPersen: Number(liveGrow.toFixed(1)),
      kebutuhanTerpenuhi: kebutuhan || undefined,
      bayarUtang: bayarUtang || undefined,
      tabunganDisisihkan: tabungan || undefined,
      catatan: catatanInput.trim() || undefined,
    };

    onSaveWeek(newRecord);

    // Confetti celebration if profit is positive!
    if (liveProfit > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#7c6cf5', '#3fc9b0', '#ffb454', '#ff7aa8'],
        });
      } catch {
        // Safe fallback
      }
    }

    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      onSuccessRedirect();
    }, 1300);
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-1 animate-[fadeIn_0.3s_ease-out]">
      {/* Header Info */}
      <div className="glass-card p-5 rounded-[24px] border border-white/10 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase text-[#8f81ff] tracking-wider">
            Input Keuangan Mingguan
          </span>
          <h3 className="text-xl font-extrabold text-[#f2f0ff] mt-0.5">
            Minggu {currentWeekNumber}
          </h3>
          <p className="text-xs text-[#a7a3c9] mt-1">
            {previousRecord
              ? `Modal otomatis disinkronkan dari finis Minggu ${previousRecord.mingguKe}`
              : 'Minggu pertama: masukkan modal awal dan hasil finismu'}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7c6cf5]/30 to-[#8f81ff]/20 border border-[#7c6cf5]/40 flex items-center justify-center shrink-0">
          <Wallet className="w-6 h-6 text-[#8f81ff]" />
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSave} className="space-y-3.5">
        {/* Modal Awal */}
        <div className="glass-card p-4 rounded-[22px] border border-white/10 shadow-md">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#a7a3c9] mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#5aa9ff]" />
              Modal Awal / Pengeluaran Awal <span className="text-red-400">*</span>
            </span>
            <span className="text-[10px] lowercase text-[#8f81ff]">
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
              if (errors.modalAwal) setErrors({ ...errors, modalAwal: undefined });
            }}
            placeholder="Rp0"
            className={`w-full min-h-[48px] px-4 rounded-xl bg-white/5 border text-sm text-[#f2f0ff] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7c6cf5] transition-all ${
              errors.modalAwal ? 'border-red-400 bg-red-400/5' : 'border-white/10'
            }`}
          />
          {errors.modalAwal && (
            <p className="text-xs text-red-400 mt-1 pl-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.modalAwal}
            </p>
          )}
        </div>

        {/* Finis Akhir Minggu */}
        <div className="glass-card p-4 rounded-[22px] border border-white/10 shadow-md">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#a7a3c9] mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#3fc9b0]" />
              Finis Akhir Minggu <span className="text-red-400">*</span>
            </span>
            <span className="text-[10px] lowercase text-[#3fc9b0]">
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
              if (errors.finis) setErrors({ ...errors, finis: undefined });
            }}
            placeholder="Rp0"
            className={`w-full min-h-[48px] px-4 rounded-xl bg-white/5 border text-sm text-[#f2f0ff] font-semibold focus:outline-none focus:ring-2 focus:ring-[#7c6cf5] transition-all ${
              errors.finis ? 'border-red-400 bg-red-400/5' : 'border-white/10'
            }`}
          />
          {errors.finis && (
            <p className="text-xs text-red-400 mt-1 pl-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.finis}
            </p>
          )}
        </div>

        {/* Live Calculation Preview Card */}
        {modalAwal > 0 && finisInput && (
          <div className="glass-card p-4 rounded-[20px] border border-white/15 bg-white/[0.04] grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#a7a3c9] block">
                Estimasi Profit
              </span>
              <div
                className={`text-base font-extrabold mt-0.5 ${
                  liveProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatRupiah(liveProfit)}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#a7a3c9] block">
                Pertumbuhan (Grow)
              </span>
              <div
                className={`text-base font-extrabold mt-0.5 ${
                  liveGrow >= 0 ? 'text-[#3fc9b0]' : 'text-rose-400'
                }`}
              >
                {liveGrow >= 0 ? `+${liveGrow.toFixed(1)}%` : `${liveGrow.toFixed(1)}%`}
              </div>
            </div>
          </div>
        )}

        {/* Optional Fields Container */}
        <div className="glass-card p-4 rounded-[22px] border border-white/10 space-y-3.5">
          <span className="text-xs font-bold text-[#f2f0ff] block border-b border-white/10 pb-2">
            Rincian Alokasi (Opsional)
          </span>

          {/* Kebutuhan Harian Terpenuhi */}
          <div>
            <label className="block text-xs font-semibold text-[#a7a3c9] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#3fc9b0]" />
                Kebutuhan Harian Terpenuhi
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

          {/* Bayar Utang */}
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

          {/* Disisihkan ke Tabungan */}
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

          {/* Catatan / Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-[#a7a3c9] mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#a7a3c9]" />
              Catatan Minggu Ini
            </label>
            <input
              type="text"
              value={catatanInput}
              onChange={(e) => setCatatanInput(e.target.value)}
              placeholder="Contoh: Gaji cair, ada pengeluaran servis motor"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f2f0ff] focus:outline-none focus:ring-2 focus:ring-[#7c6cf5]"
            />
          </div>
        </div>

        {/* Tombol Simpan Minggu Ini */}
        <button
          type="submit"
          className="w-full min-h-[50px] flex items-center justify-center gap-2 rounded-2xl font-bold text-white bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] shadow-[0_4px_20px_rgba(124,108,245,0.4)] active:scale-[0.98] transition-all hover:brightness-110"
        >
          <Sparkles className="w-4 h-4" />
          <span>Simpan Minggu Ini</span>
        </button>
      </form>

      {/* Animated Success Checkmark Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="glass-card p-6 rounded-[24px] border border-[#7c6cf5]/40 shadow-2xl flex flex-col items-center text-center animate-[scaleUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-9 h-9 text-emerald-400 animate-[bounce_0.5s]" />
            </div>
            <h4 className="text-base font-bold text-[#f2f0ff]">
              Minggu {currentWeekNumber} Tersimpan!
            </h4>
            <p className="text-xs text-[#a7a3c9] mt-1">
              Data berhasil diperbarui. Mengalihkan ke Beranda...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
