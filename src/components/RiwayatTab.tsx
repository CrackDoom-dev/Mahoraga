import React, { useState } from 'react';
import { WeeklyRecord, DailyRecord } from '../types';
import { formatRupiah, formatTanggalIndo } from '../utils/formatters';
import {
  BarChart3,
  Trash2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  CreditCard,
  PiggyBank,
  FileText,
  Calendar,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface RiwayatTabProps {
  records: WeeklyRecord[];
  dailyRecords?: DailyRecord[];
  onDeleteLastRecord: () => void;
  onDeleteDailyRecord?: (id: string) => void;
  onNavigateToCatat: () => void;
}

export const RiwayatTab: React.FC<RiwayatTabProps> = ({
  records,
  dailyRecords = [],
  onDeleteLastRecord,
  onDeleteDailyRecord,
  onNavigateToCatat,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'harian' | 'mingguan'>(
    dailyRecords.length > 0 && records.length === 0 ? 'harian' : 'harian'
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dailyToDelete, setDailyToDelete] = useState<DailyRecord | null>(null);
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);

  // Newest first for weekly list
  const sortedWeeklyRecords = [...records].sort((a, b) => b.mingguKe - a.mingguKe);
  // Chronological for chart (oldest to newest)
  const chartRecords = [...records].sort((a, b) => a.mingguKe - b.mingguKe).slice(-8);

  // Newest first for daily list
  const sortedDailyRecords = [...dailyRecords].sort((a, b) => b.createdAt - a.createdAt);

  const lastWeeklyRecord = records.length > 0 ? records[records.length - 1] : null;

  // Scaling for chart
  const maxVal = Math.max(
    ...chartRecords.flatMap((r) => [r.modalAwal, r.finis]),
    1000000
  );

  return (
    <div className="space-y-4 pb-24 px-4 pt-1 animate-[fadeIn_0.3s_ease-out]">
      {/* Header Info */}
      <div className="glass-card p-5 rounded-[24px] border border-white/10 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase text-[#8f81ff] tracking-wider font-display">
            Laporan Finansial
          </span>
          <h3 className="text-xl font-extrabold text-[#f2f0ff] mt-0.5 font-display">
            Riwayat Pencatatan
          </h3>
          <p className="text-xs text-[#a7a3c9] mt-1 font-sans">
            {dailyRecords.length} hari & {records.length} minggu tersimpan di database lokal
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7c6cf5]/30 to-[#8f81ff]/20 border border-[#7c6cf5]/40 flex items-center justify-center shrink-0">
          <BarChart3 className="w-6 h-6 text-[#8f81ff]" />
        </div>
      </div>

      {/* Sub-tab Switcher: Harian vs Mingguan */}
      <div className="p-1 rounded-2xl bg-[#15132f] border border-white/10 flex items-center shadow-md">
        <button
          type="button"
          onClick={() => setActiveSubTab('harian')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'harian'
              ? 'bg-gradient-to-r from-emerald-500 to-[#3fc9b0] text-white shadow-md'
              : 'text-[#a7a3c9] hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Harian ({dailyRecords.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('mingguan')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'mingguan'
              ? 'bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] text-white shadow-md'
              : 'text-[#a7a3c9] hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Mingguan ({records.length})</span>
        </button>
      </div>

      {/* ===================== VIEW HARIAN ===================== */}
      {activeSubTab === 'harian' && (
        <div className="space-y-3">
          {sortedDailyRecords.length === 0 ? (
            <div className="glass-card p-8 rounded-[24px] border border-white/10 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-[#a7a3c9]">
                <Clock className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-[#f2f0ff]">
                Belum Ada Catatan Harian
              </h4>
              <p className="text-xs text-[#a7a3c9] mt-1 max-w-xs mx-auto">
                Catat modal dan hasil akhir harianmu sekarang. Cukup 2 input sederhana!
              </p>
              <button
                onClick={onNavigateToCatat}
                className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#3fc9b0] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Mulai Catat Hari Ini
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#a7a3c9]">
                  Log Harian (Modal ➔ Hasil Akhir)
                </h4>
                <span className="text-[11px] text-[#a7a3c9] font-mono">
                  {sortedDailyRecords.length} entri
                </span>
              </div>

              {sortedDailyRecords.map((item) => {
                const isPositive = item.profit >= 0;

                return (
                  <div
                    key={item.id}
                    className="glass-card p-4 rounded-[22px] border border-white/10 flex items-center justify-between shadow-sm hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#f2f0ff] font-mono">
                            {formatRupiah(item.modal)}
                          </span>
                          <span className="text-xs text-[#a7a3c9]">➔</span>
                          <span className="text-xs font-bold text-[#3fc9b0] font-mono">
                            {formatRupiah(item.hasilAkhir)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#a7a3c9]">
                          <span>{formatTanggalIndo(item.tanggal)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div
                          className={`text-xs font-extrabold font-mono flex items-center justify-end gap-0.5 ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          <span>{formatRupiah(item.profit)}</span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono ${
                            isPositive
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-rose-500/15 text-rose-300'
                          }`}
                        >
                          {item.growPersen >= 0 ? `+${item.growPersen}%` : `${item.growPersen}%`}
                        </span>
                      </div>

                      {onDeleteDailyRecord && (
                        <button
                          type="button"
                          onClick={() => setDailyToDelete(item)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                          title="Hapus catatan ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== VIEW MINGGUAN ===================== */}
      {activeSubTab === 'mingguan' && (
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="glass-card p-8 rounded-[24px] border border-white/10 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-[#a7a3c9]">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-[#f2f0ff]">
                Belum Ada Riwayat Mingguan
              </h4>
              <p className="text-xs text-[#a7a3c9] mt-1 max-w-xs mx-auto">
                Catat minggu pertamamu sekarang untuk melihat grafik perbandingan modal dan finis di sini.
              </p>
              <button
                onClick={onNavigateToCatat}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#7c6cf5] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Mulai Catat Minggu 1
              </button>
            </div>
          ) : (
            <>
              {/* Interactive Bar Chart: Modal Awal vs Finis */}
              <div className="glass-card p-4 sm:p-5 rounded-[24px] border border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#f2f0ff]">
                      Modal Awal vs Finis
                    </h4>
                    <span className="text-[10px] text-[#a7a3c9]">
                      {chartRecords.length > 1
                        ? `Perkembangan ${chartRecords.length} minggu terakhir`
                        : 'Minggu 1'}
                    </span>
                  </div>

                  {/* Chart Legend */}
                  <div className="flex items-center gap-3 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#5aa9ff]" />
                      <span className="text-[#a7a3c9]">Modal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#3fc9b0]" />
                      <span className="text-[#a7a3c9]">Finis</span>
                    </div>
                  </div>
                </div>

                {/* Bars Visualization */}
                <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-white/10">
                  {chartRecords.map((r) => {
                    const modalHeight = Math.max(8, (r.modalAwal / maxVal) * 130);
                    const finisHeight = Math.max(8, (r.finis / maxVal) * 130);

                    return (
                      <div
                        key={r.id}
                        className="flex-1 flex flex-col items-center gap-1 max-w-[48px]"
                      >
                        <div className="w-full flex items-end justify-center gap-1 h-36">
                          {/* Modal Bar */}
                          <div
                            className="w-1/2 rounded-t-md bg-[#5aa9ff]/80 hover:bg-[#5aa9ff] transition-all relative group cursor-pointer"
                            style={{ height: `${modalHeight}px` }}
                          >
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block px-1.5 py-0.5 rounded bg-black/80 text-[9px] text-white whitespace-nowrap z-20 pointer-events-none">
                              {formatRupiah(r.modalAwal)}
                            </div>
                          </div>

                          {/* Finis Bar */}
                          <div
                            className="w-1/2 rounded-t-md bg-[#3fc9b0]/80 hover:bg-[#3fc9b0] transition-all relative group cursor-pointer"
                            style={{ height: `${finisHeight}px` }}
                          >
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block px-1.5 py-0.5 rounded bg-black/80 text-[9px] text-white whitespace-nowrap z-20 pointer-events-none">
                              {formatRupiah(r.finis)}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-[#a7a3c9]">
                          M{r.mingguKe}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* List of Weekly Records */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#a7a3c9]">
                    Daftar Catatan Per Minggu
                  </h4>
                  <span className="text-[11px] text-[#a7a3c9] font-mono">
                    {sortedWeeklyRecords.length} entri
                  </span>
                </div>

                {sortedWeeklyRecords.map((record) => {
                  const isPositive = record.profit >= 0;
                  const isExpanded = expandedWeekId === record.id;

                  return (
                    <div
                      key={record.id}
                      className="glass-card rounded-[22px] border border-white/10 overflow-hidden shadow-sm transition-all"
                    >
                      <div
                        onClick={() =>
                          setExpandedWeekId(isExpanded ? null : record.id)
                        }
                        role="button"
                        tabIndex={0}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center shrink-0">
                            <span className="text-[9px] uppercase font-bold text-[#8f81ff]">
                              Minggu
                            </span>
                            <span className="text-sm font-extrabold text-[#f2f0ff]">
                              {record.mingguKe}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#f2f0ff]">
                                {formatRupiah(record.modalAwal)}
                              </span>
                              <span className="text-xs text-[#a7a3c9]">➔</span>
                              <span className="text-xs font-bold text-[#f2f0ff]">
                                {formatRupiah(record.finis)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#a7a3c9]">
                              <Calendar className="w-3 h-3 text-[#5aa9ff]" />
                              <span>{formatTanggalIndo(record.tanggal)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="text-right">
                            <div
                              className={`text-xs font-bold flex items-center justify-end gap-0.5 ${
                                isPositive ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowDownRight className="w-3.5 h-3.5" />
                              )}
                              <span>{formatRupiah(record.profit)}</span>
                            </div>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                isPositive
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-rose-500/15 text-rose-300'
                              }`}
                            >
                              {record.growPersen >= 0
                                ? `+${record.growPersen}%`
                                : `${record.growPersen}%`}
                            </span>
                          </div>

                          <div className="text-[#a7a3c9]">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Breakdown */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-white/[0.02] space-y-2 text-xs animate-[fadeIn_0.2s]">
                          <div className="grid grid-cols-3 gap-2 text-center pt-1">
                            <div className="p-2 rounded-xl bg-white/5">
                              <ShoppingBag className="w-3.5 h-3.5 mx-auto text-[#3fc9b0] mb-1" />
                              <span className="text-[9px] text-[#a7a3c9] block">
                                Kebutuhan
                              </span>
                              <span className="font-semibold text-[11px] text-[#f2f0ff]">
                                {record.kebutuhanTerpenuhi
                                  ? formatRupiah(record.kebutuhanTerpenuhi)
                                  : '-'}
                              </span>
                            </div>

                            <div className="p-2 rounded-xl bg-white/5">
                              <CreditCard className="w-3.5 h-3.5 mx-auto text-[#ffb454] mb-1" />
                              <span className="text-[9px] text-[#a7a3c9] block">
                                Bayar Utang
                              </span>
                              <span className="font-semibold text-[11px] text-[#f2f0ff]">
                                {record.bayarUtang
                                  ? formatRupiah(record.bayarUtang)
                                  : '-'}
                              </span>
                            </div>

                            <div className="p-2 rounded-xl bg-white/5">
                              <PiggyBank className="w-3.5 h-3.5 mx-auto text-[#ff7aa8] mb-1" />
                              <span className="text-[9px] text-[#a7a3c9] block">
                                Tabungan
                              </span>
                              <span className="font-semibold text-[11px] text-[#f2f0ff]">
                                {record.tabunganDisisihkan
                                  ? formatRupiah(record.tabunganDisisihkan)
                                  : '-'}
                              </span>
                            </div>
                          </div>

                          {record.catatan && (
                            <div className="p-2.5 rounded-xl bg-white/5 flex items-start gap-2 mt-2">
                              <FileText className="w-3.5 h-3.5 text-[#8f81ff] shrink-0 mt-0.5" />
                              <p className="text-[11px] text-[#a7a3c9] leading-relaxed">
                                {record.catatan}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Delete Last Record Button */}
              {lastWeeklyRecord && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full min-h-[46px] rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-red-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Entri Terakhir (Minggu {lastWeeklyRecord.mingguKe})</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Confirmation Modal for Weekly Deletion */}
      {showDeleteModal && lastWeeklyRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="w-full max-w-sm glass-card p-6 rounded-[24px] border border-red-500/40 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-center text-[#f2f0ff]">
              Hapus Minggu {lastWeeklyRecord.mingguKe}?
            </h4>
            <p className="text-xs text-[#a7a3c9] text-center mt-2 leading-relaxed">
              Tindakan ini akan menghapus data Minggu {lastWeeklyRecord.mingguKe} (Finis{' '}
              {formatRupiah(lastWeeklyRecord.finis)}). Perhitungan progres akan diperbarui ke minggu sebelumnya.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-[#f2f0ff] hover:bg-white/15 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteLastRecord();
                  setShowDeleteModal(false);
                }}
                className="py-2.5 rounded-xl bg-red-600 text-xs font-semibold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Daily Deletion */}
      {dailyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="w-full max-w-sm glass-card p-6 rounded-[24px] border border-red-500/40 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-center text-[#f2f0ff]">
              Hapus Catatan Harian?
            </h4>
            <p className="text-xs text-[#a7a3c9] text-center mt-2 leading-relaxed">
              Hapus catatan tanggal <strong>{formatTanggalIndo(dailyToDelete.tanggal)}</strong> (Modal {formatRupiah(dailyToDelete.modal)} ➔ Hasil {formatRupiah(dailyToDelete.hasilAkhir)})?
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setDailyToDelete(null)}
                className="py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-[#f2f0ff] hover:bg-white/15 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (onDeleteDailyRecord) {
                    onDeleteDailyRecord(dailyToDelete.id);
                  }
                  setDailyToDelete(null);
                }}
                className="py-2.5 rounded-xl bg-red-600 text-xs font-semibold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
