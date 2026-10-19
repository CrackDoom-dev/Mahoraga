import React, { useState, useRef } from 'react';
import {
  Profile,
  FinanceTargets,
  AppSettings,
  WeeklyRecord,
  DailyRecord,
  RankTier,
} from '../types';
import { formatRupiah, parseRupiahInput, NAMA_BULAN } from '../utils/formatters';
import { saveBackgroundBlob, deleteBackgroundBlob, getBackgroundBlob } from '../utils/db';
import { cropImageToPortrait, cropImageToSquareDataUrl } from '../utils/imageCropper';
import { exportStaticBundle } from '../utils/exportStaticPackage';
import {
  RankBorderAvatar,
  ALL_RANKS,
  getRankTier,
  getRankBadgeColor,
} from './RankBorderAvatar';
import {
  User,
  Target,
  Sun,
  Moon,
  Laptop,
  Image as ImageIcon,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Package,
  Smartphone,
  Info,
  Calendar,
  Lock,
  Unlock,
  KeyRound,
  Crop,
  Check,
  FileText,
  Copy,
  Sparkles,
  Camera,
  ChevronDown,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { XpMetrics } from '../utils/xp';
import { RANK_THEMES } from '../utils/theme';

interface PengaturanTabProps {
  profile: Profile;
  targets: FinanceTargets;
  settings: AppSettings;
  records: WeeklyRecord[];
  dailyRecords?: DailyRecord[];
  xpMetrics: XpMetrics;
  onUpdateProfile: (profile: Profile) => void;
  onUpdateTargets: (targets: FinanceTargets) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onRestoreData: (backup: {
    profil: Profile;
    targets: FinanceTargets;
    records: WeeklyRecord[];
    dailyRecords?: DailyRecord[];
    settings?: AppSettings;
  }) => void;
  onResetAllData: () => void;
  onReloadCustomBg: () => void;
  pwa: {
    isInstallable: boolean;
    isInstalled: boolean;
    isIOS: boolean;
    triggerInstall: () => Promise<boolean>;
  };
}

export const PengaturanTab: React.FC<PengaturanTabProps> = ({
  profile,
  targets,
  settings,
  records,
  dailyRecords = [],
  xpMetrics,
  onUpdateProfile,
  onUpdateTargets,
  onUpdateSettings,
  onRestoreData,
  onResetAllData,
  onReloadCustomBg,
  pwa,
}) => {
  // Accordion active sections: allow expanding/collapsing sections smoothly
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    profile: true,
    rank: true,
    targets: false,
    appearance: false,
    backup: false,
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Profile form state
  const [nama, setNama] = useState(profile.nama);
  const [targetTujuan, setTargetTujuan] = useState(profile.targetTujuan);
  const [tanggal, setTanggal] = useState(profile.tanggalTarget?.tanggal || 1);
  const [bulan, setBulan] = useState(profile.tanggalTarget?.bulan || 1);
  const [tahun, setTahun] = useState(profile.tanggalTarget?.tahun || new Date().getFullYear() + 1);

  // Targets form state
  const [incomeInput, setIncomeInput] = useState(targets.incomePerHari.toString());
  const [kebutuhanInput, setKebutuhanInput] = useState(targets.kebutuhanPerMinggu.toString());
  const [utangInput, setUtangInput] = useState(targets.totalUtang.toString());
  const [tabunganInput, setTabunganInput] = useState(targets.targetTabungan.toString());

  // Appearance
  const [overlayOpacity, setOverlayOpacity] = useState(settings.overlayOpacity);
  const [cardBlur, setCardBlur] = useState(settings.cardBlur);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetModalStep1, setShowResetModalStep1] = useState(false);
  const [showResetModalStep2, setShowResetModalStep2] = useState(false);
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const [isCopiedReadme, setIsCopiedReadme] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // === FITUR RANK & KUNCI MAHORAGA ===
  // Key requirement: "tambahkan setingan fitur rank (kalau mau set ini wajib memasukan kunci. Kuncinya MAHORAGA)"
  const [isRankUnlocked, setIsRankUnlocked] = useState(() => {
    return localStorage.getItem('mahoraga_rank_unlocked') === 'true';
  });
  const [rankKeyInput, setRankKeyInput] = useState('');
  const [rankKeyError, setRankKeyError] = useState<string | null>(null);

  // Avatar file input ref & uploading state
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isCroppingAvatar, setIsCroppingAvatar] = useState(false);

  // Background Auto-crop & preview states
  const [autoCrop916, setAutoCrop916] = useState(true);
  const [activeBgPreviewUrl, setActiveBgPreviewUrl] = useState<string | null>(null);
  const [activeBgType, setActiveBgType] = useState<'image' | 'video' | null>(null);
  const [isProcessingBg, setIsProcessingBg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Load active background preview thumbnail
  React.useEffect(() => {
    let url: string | null = null;
    async function loadThumb() {
      if (!settings.hasCustomBg) {
        setActiveBgPreviewUrl(null);
        setActiveBgType(null);
        return;
      }
      const res = await getBackgroundBlob();
      if (res && res.blob) {
        url = URL.createObjectURL(res.blob);
        setActiveBgPreviewUrl(url);
        setActiveBgType(res.type);
      } else {
        setActiveBgPreviewUrl(null);
        setActiveBgType(null);
      }
    }
    loadThumb();
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [settings.hasCustomBg]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Handle Unlock Rank Feature with MAHORAGA key
  const handleUnlockRank = (e: React.FormEvent) => {
    e.preventDefault();
    if (rankKeyInput.trim().toUpperCase() === 'MAHORAGA') {
      setIsRankUnlocked(true);
      localStorage.setItem('mahoraga_rank_unlocked', 'true');
      setRankKeyInput('');
      setRankKeyError(null);
      showToast('Kunci MAHORAGA Berhasil! Fitur Rank & Bingkai Terbuka.');
    } else {
      setRankKeyError('Kata kunci salah! Kuncinya: MAHORAGA');
    }
  };

  const handleLockRank = () => {
    setIsRankUnlocked(false);
    localStorage.removeItem('mahoraga_rank_unlocked');
    showToast('Fitur Rank Dikunci Kembali.');
  };

  // Change Rank selection
  const handleSelectRank = (selectedTier: RankTier) => {
    const updated: Profile = {
      ...profile,
      rank: selectedTier,
      isRankManual: true,
    };
    onUpdateProfile(updated);
    showToast(`Border rank diubah ke ${selectedTier}!`);
  };

  const handleResetRankToAuto = () => {
    const updated: Profile = {
      ...profile,
      rank: undefined,
      isRankManual: false,
    };
    onUpdateProfile(updated);
    showToast('Rank dikembalikan ke mode otomatis (sesuai konsistensi catatan).');
  };

  // Handle Avatar Change & Auto-Crop to 1:1 circle
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Pilih file gambar untuk foto profil.');
      return;
    }

    setIsCroppingAvatar(true);
    try {
      // Auto-crop to 1:1 square centered
      const croppedDataUrl = await cropImageToSquareDataUrl(file, 512);

      const updated: Profile = {
        ...profile,
        avatar: croppedDataUrl,
      };
      onUpdateProfile(updated);
      showToast('Foto profil otomatis dipotong 1:1 pas bingkai & tersimpan!');
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses foto profil.');
    } finally {
      setIsCroppingAvatar(false);
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    const updated: Profile = {
      ...profile,
      avatar: undefined,
    };
    onUpdateProfile(updated);
    showToast('Foto profil dihapus, kembali ke inisial huruf.');
  };

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Profile = {
      ...profile,
      nama: nama.trim() || 'Pengguna',
      targetTujuan: targetTujuan.trim() || 'Target Finansial',
      tanggalTarget: {
        tanggal: Number(tanggal),
        bulan: Number(bulan),
        tahun: Number(tahun),
      },
    };
    onUpdateProfile(updated);
    showToast('Profil berhasil disimpan!');
  };

  // Save financial targets
  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: FinanceTargets = {
      incomePerHari: parseRupiahInput(incomeInput),
      kebutuhanPerMinggu: parseRupiahInput(kebutuhanInput),
      totalUtang: parseRupiahInput(utangInput),
      targetTabungan: parseRupiahInput(tabunganInput),
    };
    onUpdateTargets(updated);
    showToast('Target keuangan berhasil diperbarui!');
  };

  // Handle theme mode change
  const handleThemeChange = (mode: 'dark' | 'light' | 'system') => {
    const updated: AppSettings = { ...settings, themeMode: mode };
    onUpdateSettings(updated);
    showToast(`Mode tampilan diubah ke ${mode}!`);
  };

  const handleOverlayChange = (val: number) => {
    setOverlayOpacity(val);
    onUpdateSettings({ ...settings, overlayOpacity: val });
  };

  const handleBlurChange = (val: number) => {
    setCardBlur(val);
    onUpdateSettings({ ...settings, cardBlur: val });
  };

  // Handle custom background upload (IndexedDB Blob)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      showToast('Pilih file gambar, GIF, atau video.');
      return;
    }

    setIsProcessingBg(true);
    try {
      let blobToSave: Blob = file;

      if (isImage && file.type !== 'image/gif' && autoCrop916) {
        blobToSave = await cropImageToPortrait(file, 1080, 1920);
      }

      await saveBackgroundBlob(blobToSave, isVideo ? 'video' : 'image');

      if (activeBgPreviewUrl) URL.revokeObjectURL(activeBgPreviewUrl);
      const newPreview = URL.createObjectURL(blobToSave);
      setActiveBgPreviewUrl(newPreview);
      setActiveBgType(isVideo ? 'video' : 'image');

      onUpdateSettings({
        ...settings,
        hasCustomBg: true,
        customBgType: isVideo ? 'video' : 'image',
      });
      onReloadCustomBg();

      showToast(
        isVideo
          ? 'Video background berhasil dipasang!'
          : autoCrop916
          ? 'Foto otomatis dipotong pas 9:16 layar HP & terpasang!'
          : 'Foto background berhasil dipasang!'
      );
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses dan menyimpan background.');
    } finally {
      setIsProcessingBg(false);
      e.target.value = '';
    }
  };

  const handleRemoveBackground = async () => {
    await deleteBackgroundBlob();
    if (activeBgPreviewUrl) URL.revokeObjectURL(activeBgPreviewUrl);
    setActiveBgPreviewUrl(null);
    setActiveBgType(null);
    onUpdateSettings({
      ...settings,
      hasCustomBg: false,
      customBgType: 'none',
    });
    onReloadCustomBg();
    showToast('Background kustom telah dihapus.');
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const backupData = {
      version: 2,
      exportDate: new Date().toISOString(),
      profil: profile,
      targets,
      records,
      dailyRecords,
      settings: {
        themeMode: settings.themeMode,
        overlayOpacity: settings.overlayOpacity,
        cardBlur: settings.cardBlur,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `backup-cuanminggu-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON berhasil diunduh!');
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.profil && parsed.targets) {
          onRestoreData(parsed);
          showToast('Data backup berhasil dipulihkan!');
        } else {
          showToast('Format file backup tidak valid.');
        }
      } catch {
        showToast('Gagal membaca file backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      await exportStaticBundle();
      showToast('Paket statis PWA berhasil diunduh!');
    } catch (err) {
      console.error(err);
      showToast('Gagal membuat paket ZIP.');
    } finally {
      setIsExportingZip(false);
    }
  };

  const currentRank = profile.rank || 'F-Rank Pemula';
  const badgeStyle = getRankBadgeColor(currentRank);

  return (
    <div className="space-y-4 pb-28 px-4 pt-1 animate-[fadeIn_0.3s_ease-out]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-[fadeIn_0.2s]">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="glass-card p-5 rounded-[24px] border border-white/10 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase text-[#8f81ff] tracking-wider">
            Pengaturan & Personalisasi
          </span>
          <h3 className="text-xl font-extrabold text-[#f2f0ff] mt-0.5">
            Preferensi Akun
          </h3>
          <p className="text-xs text-[#a7a3c9] mt-1">
            Ubah foto profil, atur border rank bergerak, rumus target, dan tema
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7c6cf5]/30 to-[#8f81ff]/20 border border-[#7c6cf5]/40 flex items-center justify-center shrink-0">
          <Sliders className="w-6 h-6 text-[#8f81ff]" />
        </div>
      </div>

      {/* PWA Install Banner */}
      {!pwa.isInstalled && (
        <div className="glass-card p-4 rounded-[22px] border border-[#7c6cf5]/40 shadow-lg bg-gradient-to-r from-[#7c6cf5]/15 to-transparent flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7c6cf5] flex items-center justify-center text-white shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#f2f0ff]">
                Pasang ke Layar HP (APK/PWA)
              </h4>
              <p className="text-[10px] text-[#a7a3c9] mt-0.5">
                Buka instan tanpa browser, bekerja 100% offline
              </p>
            </div>
          </div>

          {pwa.isInstallable ? (
            <button
              onClick={pwa.triggerInstall}
              className="px-3.5 py-2 rounded-xl bg-[#7c6cf5] text-white text-xs font-bold shrink-0 hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Pasang
            </button>
          ) : pwa.isIOS ? (
            <button
              onClick={() => setShowIOSInstallGuide(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold shrink-0 hover:bg-white/20 cursor-pointer"
            >
              Panduan iOS
            </button>
          ) : null}
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. SEKSI PROFIL & FOTO (DENGAN BORDER BERGERAK & AUTO-CROP 1:1) */}
      {/* ============================================================== */}
      <div className="glass-card rounded-[24px] border border-white/10 shadow-lg overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('profile')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7c6cf5]/20 border border-[#7c6cf5]/40 flex items-center justify-center text-[#8f81ff]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#f2f0ff] flex items-center gap-2">
                <span>Foto & Profil Pengguna</span>
                <span className={`text-[10px] px-2 py-0.2 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                  {currentRank}
                </span>
              </h4>
              <p className="text-[11px] text-[#a7a3c9]">
                Ganti foto (auto-crop 1:1), nama, dan target tujuan
              </p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: openSections.profile ? 180 : 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#a7a3c9]"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        <AnimatePresence>
          {openSections.profile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="px-4 pb-5 sm:px-5 space-y-4 border-t border-white/5 pt-4"
            >
              {/* Profile Avatar Card with Synchronized Moving Border */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                {/* Live Synchronized Border Avatar */}
                <div className="relative shrink-0">
                  <RankBorderAvatar
                    avatar={profile.avatar}
                    nama={profile.nama}
                    rank={currentRank}
                    size="xl"
                    level={profile.level || (1 + records.length)}
                    showLevelBadge
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#8f81ff] tracking-wider block">
                    Bingkai Profil Bergerak ({currentRank})
                  </span>
                  <p className="text-xs text-[#a7a3c9] leading-relaxed">
                    Foto otomatis dicrop ke ukuran 1:1 lingkaran agar pas di dalam bingkai tanpa gepeng atau melar.
                  </p>

                  {/* Hidden file input for Avatar */}
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isCroppingAvatar}
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isCroppingAvatar ? 'Memotong 1:1...' : 'Ubah Foto Profil'}</span>
                    </button>

                    {profile.avatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus Foto</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#a7a3c9] mb-1">
                    Nama
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f2f0ff] focus:outline-none focus:ring-2 focus:ring-[#7c6cf5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#a7a3c9] mb-1">
                    Target Tujuan
                  </label>
                  <input
                    type="text"
                    value={targetTujuan}
                    onChange={(e) => setTargetTujuan(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f2f0ff] focus:outline-none focus:ring-2 focus:ring-[#7c6cf5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#a7a3c9] mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#5aa9ff]" />
                    Tanggal Target
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={tanggal}
                      onChange={(e) => setTanggal(Number(e.target.value))}
                      className="w-full min-h-[42px] px-2 rounded-xl bg-[#15132f] border border-white/10 text-xs text-[#f2f0ff]"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          Tgl {d}
                        </option>
                      ))}
                    </select>

                    <select
                      value={bulan}
                      onChange={(e) => setBulan(Number(e.target.value))}
                      className="w-full min-h-[42px] px-2 rounded-xl bg-[#15132f] border border-white/10 text-xs text-[#f2f0ff]"
                    >
                      {NAMA_BULAN.map((m, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <select
                      value={tahun}
                      onChange={(e) => setTahun(Number(e.target.value))}
                      className="w-full min-h-[42px] px-2 rounded-xl bg-[#15132f] border border-white/10 text-xs text-[#f2f0ff]"
                    >
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#f2f0ff] transition-all cursor-pointer"
                >
                  Simpan Perubahan Profil
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================================== */}
      {/* 2. FITUR SETINGAN RANK (KUNCI: MAHORAGA) & BORDER SESUAI RANK */}
      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* 2. FITUR SETINGAN RANK & BORDER AVATAR OTOMATIS XP */}
      {/* ============================================================== */}
      <div className="glass-card rounded-[24px] border border-[#7c6cf5]/30 bg-gradient-to-br from-[#7c6cf5]/10 via-transparent to-amber-500/5 shadow-xl transition-all overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('rank')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl border border-[#7c6cf5]/40 bg-[#7c6cf5]/20 flex items-center justify-center text-[#8f81ff] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#f2f0ff] flex items-center gap-2">
                <span>Border Avatar & Rank Mahoraga</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h4>
              <p className="text-[11px] font-medium text-emerald-400">
                {xpMetrics.totalXp} XP • {currentRank} {isRankUnlocked ? '(Override MAHORAGA)' : '(Sistem XP Otomatis)'}
              </p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: openSections.rank ? 180 : 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#a7a3c9]"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        <AnimatePresence>
          {openSections.rank && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="px-4 pb-5 sm:px-5 space-y-4 border-t border-white/5 pt-4"
            >
              {/* Status & Mode Switch */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8f81ff] tracking-wider block">
                      Status Border & XP
                    </span>
                    <span className="text-xs font-bold text-[#f2f0ff] block mt-0.5">
                      Border Aktif: {currentRank}
                    </span>
                    <span className="text-[11px] text-[#a7a3c9]">
                      Total: <span className="text-white font-mono font-bold">{xpMetrics.totalXp} XP</span> • Tier Alami: <span className="text-emerald-300 font-bold">{xpMetrics.highestUnlockedTier}</span>
                    </span>
                  </div>

                  {profile.isRankManual && (
                    <button
                      type="button"
                      onClick={handleResetRankToAuto}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[10px] font-semibold transition-all cursor-pointer border border-white/10"
                    >
                      Reset ke Otomatis
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-[#a7a3c9] leading-snug">
                  Border terbuka otomatis dari catatan Anda (+20 XP harian, +50 XP mingguan, bonus streak hingga 2x). Border yang sudah terbuka bebas Anda pilih kapan saja tanpa kunci.
                </p>
              </div>

              {/* Optional MAHORAGA Master Key Override */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-[#f2f0ff]">
                      Kunci Override MAHORAGA (Opsional)
                    </span>
                  </div>

                  {isRankUnlocked && (
                    <button
                      type="button"
                      onClick={handleLockRank}
                      className="px-2 py-0.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-semibold hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      Kunci Kembali
                    </button>
                  )}
                </div>

                {isRankUnlocked ? (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                    <Unlock className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Semua 8 rank terbuka manual melalui kunci MAHORAGA.</span>
                  </div>
                ) : (
                  <form onSubmit={handleUnlockRank} className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={rankKeyInput}
                        onChange={(e) => {
                          setRankKeyInput(e.target.value);
                          if (rankKeyError) setRankKeyError(null);
                        }}
                        placeholder="Masukkan kunci MAHORAGA..."
                        className="flex-1 min-h-[40px] px-3 rounded-xl bg-white/5 border border-white/15 text-xs text-[#f2f0ff] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7c6cf5]"
                      />
                      <button
                        type="submit"
                        className="px-3.5 min-h-[40px] rounded-xl bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        Buka Semua
                      </button>
                    </div>

                    {rankKeyError && (
                      <p className="text-xs text-red-400 font-medium pl-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{rankKeyError}</span>
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Daftar Semua 8 Rank dengan Status Terbuka/Terkunci & Live Preview */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto no-scrollbar pr-0.5">
                {ALL_RANKS.map((r) => {
                  const isUnlocked = isRankUnlocked || xpMetrics.unlockedTiers.includes(r.tier);
                  const isSelected = currentRank === r.tier;
                  const neededXp = Math.max(0, r.minXp - xpMetrics.totalXp);

                  return (
                    <div
                      key={r.tier}
                      onClick={() => handleSelectRank(r.tier)}
                      role="button"
                      tabIndex={0}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 border-[#7c6cf5] shadow-lg shadow-[#7c6cf5]/20 ring-1 ring-[#7c6cf5]'
                          : isUnlocked
                          ? 'bg-white/[0.03] border-white/10 hover:bg-white/5'
                          : 'bg-white/[0.01] border-white/5 opacity-65 hover:opacity-85'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Live Miniature Moving Border Preview */}
                        <div className="shrink-0">
                          <RankBorderAvatar
                            avatar={profile.avatar}
                            nama={profile.nama}
                            rank={r.tier}
                            size="sm"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-[#f2f0ff]">
                              {r.tier}
                            </span>
                            {isSelected ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-white">
                                Aktif
                              </span>
                            ) : isUnlocked ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#7c6cf5]/30 text-[#8f81ff] border border-[#7c6cf5]/40">
                                Terbuka
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                Butuh {r.minXp} XP
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#a7a3c9] mt-0.5 leading-snug">
                            {r.desc}
                          </p>
                          {!isUnlocked && (
                            <p className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                              Kurang {neededXp} XP lagi
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full border border-[#7c6cf5] bg-[#7c6cf5] text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : isUnlocked ? (
                          <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center hover:border-white/50" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
                            <Lock className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================================== */}
      {/* 3. TARGET FINANSIAL (DASAR RUMUS MAHORAGA) */}
      {/* ============================================================== */}
      <div className="glass-card rounded-[24px] border border-white/10 shadow-lg overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('targets')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#f2f0ff]">
                Target Finansial (Dasar Rumus)
              </h4>
              <p className="text-[11px] text-[#a7a3c9]">
                Penentu persentase capaian roda 5 aspek Mahoraga
              </p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: openSections.targets ? 180 : 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#a7a3c9]"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        <AnimatePresence>
          {openSections.targets && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="px-4 pb-5 sm:px-5 space-y-3.5 border-t border-white/5 pt-4"
            >
              <form onSubmit={handleSaveTargets} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#a7a3c9] mb-1 flex items-center justify-between">
                    <span>Income Target Per Hari</span>
                    <span className="text-[10px] text-[#8f81ff] font-mono">
                      {formatRupiah(parseRupiahInput(incomeInput))}
                    </span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatRupiah(parseRupiahInput(incomeInput))}
                    onChange={(e) => setIncomeInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f2f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#a7a3c9] mb-1 flex items-center justify-between">
                    <span>Kebutuhan Target Per Minggu</span>
                    <span className="text-[10px] text-[#3fc9b0] font-mono">
                      {formatRupiah(parseRupiahInput(kebutuhanInput))}
                    </span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatRupiah(parseRupiahInput(kebutuhanInput))}
                    onChange={(e) => setKebutuhanInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f2f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#a7a3c9] mb-1 flex items-center justify-between">
                    <span>Total Utang yang Harus Dilunasi</span>
                    <span className="text-[10px] text-[#ffb454] font-mono">
                      {formatRupiah(parseRupiahInput(utangInput))}
                    </span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatRupiah(parseRupiahInput(utangInput))}
                    onChange={(e) => setUtangInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f2f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#a7a3c9] mb-1 flex items-center justify-between">
                    <span>Target Akumulasi Tabungan</span>
                    <span className="text-[10px] text-[#ff7aa8] font-mono">
                      {formatRupiah(parseRupiahInput(tabunganInput))}
                    </span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatRupiah(parseRupiahInput(tabunganInput))}
                    onChange={(e) => setTabunganInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f2f0ff]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#f2f0ff] transition-all cursor-pointer"
                >
                  Simpan Target Finansial
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================================== */}
      {/* 4. MODE TAMPILAN & BACKGROUND WALLPAPER */}
      {/* ============================================================== */}
      <div className="glass-card rounded-[24px] border border-white/10 shadow-lg overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('appearance')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#f2f0ff]">
                Mode Tampilan & Wallpaper
              </h4>
              <p className="text-[11px] text-[#a7a3c9]">
                Tema gelap/terang, wallpaper HP 9:16, kegelapan & blur kaca
              </p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: openSections.appearance ? 180 : 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#a7a3c9]"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        <AnimatePresence>
          {openSections.appearance && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="px-4 pb-5 sm:px-5 space-y-4 border-t border-white/5 pt-4"
            >
              {/* Theme buttons */}
              <div>
                <label className="block text-xs font-semibold text-[#a7a3c9] mb-2">
                  Tema Sistem
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                      settings.themeMode === 'dark'
                        ? 'bg-[#7c6cf5] text-white border-[#7c6cf5] shadow-lg shadow-[#7c6cf5]/30'
                        : 'bg-white/5 border-white/10 text-[#a7a3c9] hover:bg-white/10'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Malam</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                      settings.themeMode === 'light'
                        ? 'bg-[#7c6cf5] text-white border-[#7c6cf5] shadow-lg shadow-[#7c6cf5]/30'
                        : 'bg-white/5 border-white/10 text-[#a7a3c9] hover:bg-white/10'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Terang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange('system')}
                    className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                      settings.themeMode === 'system'
                        ? 'bg-[#7c6cf5] text-white border-[#7c6cf5] shadow-lg shadow-[#7c6cf5]/30'
                        : 'bg-white/5 border-white/10 text-[#a7a3c9] hover:bg-white/10'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Sistem</span>
                  </button>
                </div>
              </div>

              {/* Wallpaper upload */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#a7a3c9]">
                    Background Kustom (Foto / GIF / Video)
                  </label>
                  {settings.hasCustomBg && (
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                      Aktif
                    </span>
                  )}
                </div>

                {settings.hasCustomBg && activeBgPreviewUrl && (
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <div className="w-12 h-20 rounded-xl overflow-hidden border border-[#7c6cf5]/40 shadow-md relative bg-black shrink-0">
                      {activeBgType === 'video' ? (
                        <video
                          src={activeBgPreviewUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={activeBgPreviewUrl}
                          alt="Wallpaper"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-[#8f81ff] block">
                        Wallpaper Aktif
                      </span>
                      <p className="text-xs font-bold text-[#f2f0ff]">
                        {activeBgType === 'video' ? 'Video Animasi HP' : 'Foto Layar 9:16'}
                      </p>
                      <p className="text-[10px] text-[#a7a3c9]">
                        Menghiasi latar belakang di balik kartu kaca.
                      </p>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="hidden"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isProcessingBg}
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isProcessingBg ? 'Memproses...' : 'Pilih Foto / Video'}</span>
                  </button>

                  {settings.hasCustomBg ? (
                    <button
                      type="button"
                      onClick={handleRemoveBackground}
                      className="py-2.5 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-semibold text-red-400 transition-all active:scale-95 cursor-pointer"
                    >
                      Hapus Wallpaper
                    </button>
                  ) : (
                    <div className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/5 text-center text-xs text-[#a7a3c9]">
                      Default Gradasi
                    </div>
                  )}
                </div>

                {/* Sliders */}
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-[#a7a3c9] mb-1">
                      <span>Kegelapan Lapisan Overlay</span>
                      <span className="font-mono">{overlayOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={overlayOpacity}
                      onChange={(e) => handleOverlayChange(Number(e.target.value))}
                      className="w-full accent-[#7c6cf5] h-1.5 rounded-lg bg-white/10 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-[#a7a3c9] mb-1">
                      <span>Tingkat Blur Kartu Kaca</span>
                      <span className="font-mono">{cardBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={cardBlur}
                      onChange={(e) => handleBlurChange(Number(e.target.value))}
                      className="w-full accent-[#7c6cf5] h-1.5 rounded-lg bg-white/10 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================================== */}
      {/* 5. BACKUP & PEMULIHAN DATA */}
      {/* ============================================================== */}
      <div className="glass-card rounded-[24px] border border-white/10 shadow-lg overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('backup')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#f2f0ff]">
                Cadangan & Pemulihan Data
              </h4>
              <p className="text-[11px] text-[#a7a3c9]">
                Ekspor/impor file JSON & unduh paket mandiri ZIP
              </p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: openSections.backup ? 180 : 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#a7a3c9]"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        <AnimatePresence>
          {openSections.backup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="px-4 pb-5 sm:px-5 space-y-3 border-t border-white/5 pt-4"
            >
              <p className="text-[11px] text-[#a7a3c9] leading-relaxed">
                Semua catatan harian & mingguan tersimpan di HP. Unduh file cadangan untuk berjaga-jaga atau pindah perangkat.
              </p>

              <input
                type="file"
                ref={importFileRef}
                onChange={handleImportBackup}
                accept=".json,application/json"
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#f2f0ff] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#3fc9b0]" />
                  <span>Ekspor JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => importFileRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#f2f0ff] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#8f81ff]" />
                  <span>Impor JSON</span>
                </button>
              </div>

              {/* Unduh Paket Statis ZIP */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isExportingZip}
                  onClick={handleExportZip}
                  className="w-full py-2.5 rounded-xl bg-[#7c6cf5] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>{isExportingZip ? 'Menyiapkan ZIP...' : 'Unduh File ZIP Mandiri (Siap Hosting & APK)'}</span>
                </button>
              </div>

              {/* Tombol GitHub Trending README */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowReadmeModal(true)}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#a7a3c9] hover:text-[#f2f0ff] text-xs font-medium border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#ffb454]" />
                  <span>Lihat Dokumentasi README.md</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================================== */}
      {/* 6. RESET DATA APLIKASI */}
      {/* ============================================================== */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowResetModalStep1(true)}
          className="w-full min-h-[46px] rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-red-500/20 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Semua Data Aplikasi</span>
        </button>
      </div>

      {/* Reset Confirmation Step 1 */}
      {showResetModalStep1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="w-full max-w-sm glass-card p-6 rounded-[24px] border border-red-500/40 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-center text-[#f2f0ff]">
              Konfirmasi Langkah 1 dari 2
            </h4>
            <p className="text-xs text-[#a7a3c9] text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus seluruh data catatan harian, mingguan, profil, dan target keuangan?
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowResetModalStep1(false)}
                className="py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-[#f2f0ff] cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowResetModalStep1(false);
                  setShowResetModalStep2(true);
                }}
                className="py-2.5 rounded-xl bg-amber-600 text-xs font-semibold text-white shadow-lg cursor-pointer"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Step 2 */}
      {showResetModalStep2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="w-full max-w-sm glass-card p-6 rounded-[24px] border border-red-500/60 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/30 border border-red-500/60 flex items-center justify-center mx-auto mb-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-center text-red-400">
              Peringatan Akhir!
            </h4>
            <p className="text-xs text-[#a7a3c9] text-center mt-2 leading-relaxed">
              Tindakan ini permanen. Semua data akan dihapus dan kembali ke tampilan awal pembuatan profil.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowResetModalStep2(false)}
                className="py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-[#f2f0ff] cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowResetModalStep2(false);
                  onResetAllData();
                }}
                className="py-2.5 rounded-xl bg-red-600 text-xs font-semibold text-white shadow-lg shadow-red-600/40 hover:bg-red-700 cursor-pointer"
              >
                Hapus Semuanya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Install Guide Modal */}
      {showIOSInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s]">
          <div className="w-full max-w-sm glass-card p-6 rounded-[24px] border border-white/20 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-2">
              Pasang di iPhone / iPad
            </h4>
            <p className="text-xs text-[#a7a3c9] leading-relaxed mb-4">
              1. Ketuk ikon <strong>Bagikan / Share</strong> (kotak panah ke atas) di bar Safari.<br />
              2. Gulir ke bawah lalu pilih <strong>Add to Home Screen</strong> (Tambahkan ke Layar Utama).<br />
              3. Ketuk <strong>Add</strong> di kanan atas.
            </p>
            <button
              onClick={() => setShowIOSInstallGuide(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-white cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* GitHub Trending README Preview Modal */}
      {showReadmeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s]">
          <div className="w-full max-w-md max-h-[88vh] glass-card p-5 sm:p-6 rounded-[28px] border border-white/20 shadow-2xl flex flex-col overflow-hidden bg-[#0e0d22]/95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8f81ff]" />
                <h4 className="text-sm font-bold text-white font-display">
                  README.md (Mahoraga Core)
                </h4>
              </div>
              <button
                onClick={() => setShowReadmeModal(false)}
                className="text-[#a7a3c9] hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-3 font-sans text-xs">
              <div className="p-3.5 rounded-2xl bg-[#15132f] border border-white/10 text-center">
                <div className="text-[11px] font-mono text-[#ffb454] font-bold">
                  ⚡ 八握剣 異戒神将 魔虚羅 ⚡
                </div>
                <div className="text-[10px] text-[#a7a3c9] font-mono mt-0.5">
                  Package ID: <span className="text-[#8f81ff] font-bold">com.MahorgaCore.Rija</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-[#a7a3c9]">FITUR HARIAN</span>
                  <span className="text-emerald-400 font-bold">MODAL & HASIL</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-[#a7a3c9]">DEV KEY</span>
                  <span className="text-[#ff7aa8] font-bold">MAHORAGA</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-[#a7a3c9]">FRAMEWORK</span>
                  <span className="text-[#5aa9ff] font-bold">REACT + VITE</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-[#a7a3c9]">STORAGE</span>
                  <span className="text-[#3fc9b0] font-bold">INDEXEDDB</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <h5 className="text-[11px] font-bold text-[#8f81ff]">
                  Sistem Border Rank & Animasi Bergerak
                </h5>
                <p className="text-[10px] text-[#a7a3c9] leading-relaxed">
                  Setiap rank (F hingga Divine Mahoraga) memiliki border berputar dengan CSS GPU-accelerated. Buka kunci dengan kata sandi <strong>MAHORAGA</strong> untuk memilih rank dan bingkai bebas.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const readmeText = `# CORE MAHORAGA (八握剣 異戒神将 魔虚羅)\nPackage ID: com.MahorgaCore.Rija\nKunci: MAHORAGA\nFitur: Pencatatan Harian (Modal & Hasil Akhir), Mingguan, Border Rank Bergerak, Auto Crop 1:1 Foto Profil.`;
                  navigator.clipboard.writeText(readmeText);
                  setIsCopiedReadme(true);
                  showToast('Teks README.md disalin!');
                  setTimeout(() => setIsCopiedReadme(false), 2000);
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {isCopiedReadme ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedReadme ? 'Tersalin!' : 'Salin Teks README'}</span>
              </button>
              <button
                onClick={() => setShowReadmeModal(false)}
                className="py-2.5 px-5 rounded-xl bg-[#7c6cf5] text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer font-display"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
