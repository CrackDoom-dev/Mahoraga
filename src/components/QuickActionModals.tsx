import React, { useState } from 'react';
import { FinanceTargets } from '../types';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';
import { X, Sparkles, TrendingUp, ShieldCheck, Calculator } from 'lucide-react';

interface QuickActionModalsProps {
  activeChip: string | null;
  onClose: () => void;
  targets: FinanceTargets;
  onUpdateTargets: (targets: FinanceTargets) => void;
}

export const QuickActionModals: React.FC<QuickActionModalsProps> = ({
  activeChip,
  onClose,
  targets,
  onUpdateTargets,
}) => {
  // Simulator state
  const [simModal, setSimModal] = useState('2000000');
  const [simFinis, setSimFinis] = useState('2600000');

  const parsedSimModal = parseRupiahInput(simModal);
  const parsedSimFinis = parseRupiahInput(simFinis);
  const simProfit = parsedSimFinis - parsedSimModal;
  const simGrow =
    parsedSimModal > 0 ? ((parsedSimFinis / parsedSimModal) - 1) * 100 : 0;

  if (!activeChip) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s]">
      <div className="w-full max-w-sm glass-card p-5 rounded-[24px] border border-white/20 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a7a3c9] hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal: Target Finansial */}
        {activeChip === 'target' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Sparkles className="w-4 h-4 text-[#ffb454]" />
              <h3 className="text-sm font-bold text-white">Target Finansial Anda</h3>
            </div>
            <p className="text-xs text-[#a7a3c9] leading-relaxed">
              Target ini digunakan sebagai pembagi rumus untuk mengukur 5 pilar progres finansialmu.
            </p>
            <div className="space-y-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between">
                <span className="text-[#a7a3c9]">Target Income/Hari:</span>
                <span className="font-bold text-[#8f81ff]">
                  {formatRupiah(targets.incomePerHari)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between">
                <span className="text-[#a7a3c9]">Target Kebutuhan/Minggu:</span>
                <span className="font-bold text-[#3fc9b0]">
                  {formatRupiah(targets.kebutuhanPerMinggu)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between">
                <span className="text-[#a7a3c9]">Target Pelunasan Utang:</span>
                <span className="font-bold text-[#ffb454]">
                  {formatRupiah(targets.totalUtang)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between">
                <span className="text-[#a7a3c9]">Target Tabungan:</span>
                <span className="font-bold text-[#ff7aa8]">
                  {formatRupiah(targets.targetTabungan)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-4 py-2.5 rounded-xl bg-[#7c6cf5] text-white text-xs font-semibold"
            >
              Tutup & Lanjutkan
            </button>
          </div>
        )}

        {/* Modal: Estimasi Cuan (Kalkulator) */}
        {activeChip === 'kalkulator' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Calculator className="w-4 h-4 text-[#3fc9b0]" />
              <h3 className="text-sm font-bold text-white">Kalkulator Simulasi Cuan</h3>
            </div>
            <p className="text-xs text-[#a7a3c9] leading-relaxed">
              Uji potensi keuntungan dan persentase pertumbuhan sebelum mencatat minggu berjalan.
            </p>

            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block text-[11px] text-[#a7a3c9] mb-1">
                  Rencana Modal Awal
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatRupiah(parsedSimModal)}
                  onChange={(e) => setSimModal(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#a7a3c9] mb-1">
                  Target Finis Akhir Minggu
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatRupiah(parsedSimFinis)}
                  onChange={(e) => setSimFinis(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              {/* Result box */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-[10px] text-[#a7a3c9] block">
                    Potensi Profit
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      simProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatRupiah(simProfit)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#a7a3c9] block">
                    Pertumbuhan (Grow)
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      simGrow >= 0 ? 'text-[#3fc9b0]' : 'text-rose-400'
                    }`}
                  >
                    {simGrow >= 0 ? `+${simGrow.toFixed(1)}%` : `${simGrow.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-3 py-2.5 rounded-xl bg-[#7c6cf5] text-white text-xs font-semibold"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Modal: 5 Aspek Cuan */}
        {activeChip === 'bantuan' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#8f81ff]" />
              <h3 className="text-sm font-bold text-white">Panduan 5 Pilar Finansial</h3>
            </div>
            <div className="space-y-2 text-[11px] max-h-72 overflow-y-auto no-scrollbar pr-1">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="font-bold text-[#8f81ff] block">
                  1. Income Konsisten (#8f81ff)
                </span>
                <p className="text-[#a7a3c9] mt-0.5 leading-relaxed">
                  Rata-rata profit 4 minggu terakhir dibagi (target income/hari × 7).
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="font-bold text-[#3fc9b0] block">
                  2. Kebutuhan Tercukupi (#3fc9b0)
                </span>
                <p className="text-[#a7a3c9] mt-0.5 leading-relaxed">
                  Rata-rata kebutuhan terpenuhi 4 minggu dibagi target kebutuhan per minggu.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="font-bold text-[#5aa9ff] block">
                  3. Pengeluaran Stabil (#5aa9ff)
                </span>
                <p className="text-[#a7a3c9] mt-0.5 leading-relaxed">
                  100 dikurangi koefisien variasi modal. Butuh minimal 2 minggu data.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="font-bold text-[#ffb454] block">
                  4. Lepas dari Gali Lubang (#ffb454)
                </span>
                <p className="text-[#a7a3c9] mt-0.5 leading-relaxed">
                  Total bayar utang yang sudah dicatat dibagi target total utang.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="font-bold text-[#ff7aa8] block">
                  5. Tabungan (#ff7aa8)
                </span>
                <p className="text-[#a7a3c9] mt-0.5 leading-relaxed">
                  Total dana yang disisihkan ke tabungan dibagi target tabungan.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-3 py-2.5 rounded-xl bg-[#7c6cf5] text-white text-xs font-semibold"
            >
              Saya Mengerti
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
