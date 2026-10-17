import React, { useState, useRef } from 'react';
import {
  Profile,
  FinanceTargets,
  AppSettings,
  WeeklyRecord,
} from '../types';
import { formatRupiah, parseRupiahInput, NAMA_BULAN } from '../utils/formatters';
import { saveBackgroundBlob, deleteBackgroundBlob, getBackgroundBlob } from '../utils/db';
import { cropImageToPortrait } from '../utils/imageCropper';
import { exportStaticBundle } from '../utils/exportStaticPackage';
import {
  User,
  Target,
  Sun,
  Moon,
  Laptop,
  Image,
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
} from 'lucide-react';

interface PengaturanTabProps {
  profile: Profile;
  targets: FinanceTargets;
  settings: AppSettings;
  records: WeeklyRecord[];
  onUpdateProfile: (profile: Profile) => void;
  onUpdateTargets: (targets: FinanceTargets) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onRestoreData: (backup: {
    profil: Profile;
    targets: FinanceTargets;
    records: WeeklyRecord[];
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
  onUpdateProfile,
  onUpdateTargets,
  onUpdateSettings,
  onRestoreData,
  onResetAllData,
  onReloadCustomBg,
  pwa,
}) => {
  // Profile edit state
  const [nama, setNama] = useState(profile.nama);
  const [targetTujuan, setTargetTujuan] = useState(profile.targetTujuan);
  const [tanggal, setTanggal] = useState(profile.tanggalTarget?.tanggal || 1);
  const [bulan, setBulan] = useState(profile.tanggalTarget?.bulan || 1);
  const [tahun, setTahun] = useState(profile.tanggalTarget?.tahun || new Date().getFullYear() + 1);

  // Targets edit state
  const [incomeInput, setIncomeInput] = useState(targets.incomePerHari.toString());
  const [kebutuhanInput, setKebutuhanInput] = useState(targets.kebutuhanPerMinggu.toString());
  const [utangInput, setUtangInput] = useState(targets.totalUtang.toString());
  const [tabunganInput, setTabunganInput] = useState(targets.targetTabungan.toString());

  // Appearance
  const [overlayOpacity, setOverlayOpacity] = useState(settings.overlayOpacity);
  const [cardBlur, setCardBlur] = useState(settings.cardBlur);

  // Toast / feedback messages
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetModalStep1, setShowResetModalStep1] = useState(false);
  const [showResetModalStep2, setShowResetModalStep2] = useState(false);
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Mode Developer state (keyword: MAHORAGA)
  const [isDevUnlocked, setIsDevUnlocked] = useState(() => {
    return localStorage.getItem('cuanminggu_dev_unlocked') === 'true';
  });
  const [devKeyInput, setDevKeyInput] = useState('');
  const [devKeyError, setDevKeyError] = useState<string | null>(null);

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

  // Handle Mode Developer Unlock
  const handleUnlockDevMode = (e: React.FormEvent) => {
    e.preventDefault();
    if (devKeyInput.trim().toUpperCase() === 'MAHORAGA') {
      setIsDevUnlocked(true);
      localStorage.setItem('cuanminggu_dev_unlocked', 'true');
      setDevKeyInput('');
      setDevKeyError(null);
      showToast('Mode Developer Berhasil Dibuka!');
    } else {
      setDevKeyError('Kata kunci salah! Petunjuk: MAHORAGA');
    }
  };

  const handleLockDevMode = () => {
    setIsDevUnlocked(false);
    localStorage.removeItem('cuanminggu_dev_unlocked');
    showToast('Mode Developer Dikunci Kembali.');
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

  // Handle slider adjustments
  const handleOverlayChange = (val: number) => {
    setOverlayOpacity(val);
    onUpdateSettings({ ...settings, overlayOpacity: val });
  };

  const handleBlurChange = (val: number) => {
    setCardBlur(val);
    onUpdateSettings({ ...settings, cardBlur: val });
  };

  // Handle custom background upload (IndexedDB Blob) with Auto-Crop
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

      // Auto-crop static image to 9:16 mobile portrait ratio
      if (isImage && file.type !== 'image/gif' && autoCrop916) {
        blobToSave = await cropImageToPortrait(file, 1080, 1920);
      }

      await saveBackgroundBlob(blobToSave, isVideo ? 'video' : 'image');

      // Update thumbnail preview
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

  // Remove custom background
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
      version: 1,
      exportDate: new Date().toISOString(),
      profil: profile,
      targets,
      records,
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
        if (parsed.profil && parsed.targets && Array.isArray(parsed.records)) {
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

  // Export static bundle zip for static hosting & APK
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

  return (
    <div className="space-y-4 pb-28 px-4 pt-1 animate-[fadeIn_0.3s_ease-out]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#7c6cf5] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-[fadeIn_0.2s]">
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
            Kelola profil, target keuangan, tema, dan backup lokal HP
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
              className="px-3.5 py-2 rounded-xl bg-[#7c6cf5] text-white text-xs font-bold shrink-0 hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              Pasang
            </button>
          ) : pwa.isIOS ? (
            <button
              onClick={() => setShowIOSInstallGuide(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold shrink-0 hover:bg-white/20"
            >
              Panduan iOS
            </button>
          ) : null}
        </div>
      )}

      {/* 1. Edit Profil */}
      <div className="glass-card p-4 sm:p-5 rounded-[24px] border border-white/10 shadow-lg">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#a7a3c9] mb-3 flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-[#7c6cf5]" />
          <span>Profil Pengguna</span>
        </h4>

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
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#f2f0ff] transition-all"
          >
            Simpan Perubahan Profil
          </button>
        </form>
      </div>

      {/* Mode Developer Security Card */}
      <div className={`glass-card p-4 sm:p-5 rounded-[24px] border transition-all ${
        isDevUnlocked
          ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent shadow-lg'
          : 'border-[#7c6cf5]/30 bg-gradient-to-br from-[#7c6cf5]/10 via-transparent to-red-500/5 shadow-xl'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
              isDevUnlocked
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}>
              {isDevUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#f2f0ff]">Mode Developer</h4>
                <span className={`w-2 h-2 rounded-full ${
                  isDevUnlocked ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`} />
              </div>
              <span className={`text-[10px] font-semibold ${
                isDevUnlocked ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {isDevUnlocked ? 'Parameter Terbuka & Aktif' : 'Terkunci (Perlu Kata Kunci)'}
              </span>
            </div>
          </div>

          {isDevUnlocked ? (
            <button
              onClick={handleLockDevMode}
              className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Kunci</span>
            </button>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#a7a3c9]">
              Proteksi
            </span>
          )}
        </div>

        {!isDevUnlocked ? (
          <div>
            <p className="text-xs text-[#a7a3c9] leading-relaxed mb-3">
              Parameter pengaturan (Target rumus finansial, mode tema, background kustom, backup, dan reset) terkunci. Masukkan kata kunci untuk membuka parameter.
            </p>

            <form onSubmit={handleUnlockDevMode} className="space-y-2.5">
              <div className="relative">
                <input
                  type="text"
                  value={devKeyInput}
                  onChange={(e) => {
                    setDevKeyInput(e.target.value);
                    if (devKeyError) setDevKeyError(null);
                  }}
                  placeholder="Masukkan kata kunci..."
                  className="w-full min-h-[46px] pl-10 pr-4 rounded-xl bg-white/5 border border-white/15 text-xs text-[#f2f0ff] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7c6cf5]"
                />
                <KeyRound className="w-4 h-4 text-[#7c6cf5] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {devKeyError && (
                <p className="text-xs text-red-400 font-medium pl-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{devKeyError}</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Buka Kunci Mode Developer</span>
              </button>
            </form>
          </div>
        ) : (
          <p className="text-xs text-emerald-300 leading-relaxed">
            Akses penuh terbuka. Anda sekarang dapat menyesuaikan seluruh target rumus finansial, background kustom, backup data, dan pengaturan sistem di bawah ini.
          </p>
        )}
      </div>

      {/* Parameter Settings Locked or Unlocked */}
      {!isDevUnlocked ? (
        <div className="glass-card p-6 rounded-[24px] border border-white/10 text-center space-y-2 opacity-75">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#a7a3c9]">
            <Lock className="w-6 h-6" />
          </div>
          <h5 className="text-sm font-bold text-[#f2f0ff]">
            Parameter Pengaturan Terkunci
          </h5>
          <p className="text-xs text-[#a7a3c9] max-w-xs mx-auto leading-relaxed">
            Target finansial, tema tampilan, background kustom, backup, dan reset disembunyikan. Masukkan kata kunci pada kartu <strong>Mode Developer</strong> di atas untuk membuka.
          </p>
        </div>
      ) : (
        <>
          {/* 2. Target Keuangan */}
      <div className="glass-card p-4 sm:p-5 rounded-[24px] border border-white/10 shadow-lg">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#a7a3c9] mb-3 flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-[#3fc9b0]" />
          <span>Target Finansial (Dasar Rumus)</span>
        </h4>

        <form onSubmit={handleSaveTargets} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-[#a7a3c9] mb-1 flex items-center justify-between">
              <span>Income Target Per Hari</span>
              <span className="text-[10px] text-[#8f81ff]">
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
              <span className="text-[10px] text-[#3fc9b0]">
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
              <span className="text-[10px] text-[#ffb454]">
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
              <span className="text-[10px] text-[#ff7aa8]">
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
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#f2f0ff] transition-all"
          >
            Simpan Target Finansial
          </button>
        </form>
      </div>

      {/* 3. Mode Tampilan */}
      <div className="glass-card p-4 sm:p-5 rounded-[24px] border border-white/10 shadow-lg">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#a7a3c9] mb-3">
          Mode Tampilan
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`py-2.5 px-3 rounded-xl flex flex-col items-center gap-1.5 text-xs font-semibold border transition-all ${
              settings.themeMode === 'dark'
                ? 'bg-[#7c6cf5] text-white border-[#7c6cf5] shadow-lg shadow-[#7c6cf5]/30'
                : 'bg-white/5 border-white/10 text-[#a7a3c9] hover:bg-white/10'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Malam</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`py-2.5 px-3 rounded-xl flex flex-col items-center gap-1.5 text-xs font-semibold border transition-all ${
              settings.themeMode === 'light'
                ? 'bg-[#7c6cf5] text-white border-[#7c6cf5] shadow-lg shadow-[#7c6cf5]/30'
                : 'bg-white/5 border-white/10 text-[#a7a3c9] hover:bg-white/10'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Terang</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`py-2.5 px-3 rounded-xl flex flex-col items-center gap-1.5 text-xs font-semibold border transition-all ${
              settings.themeMode === 'system'
                ? 'bg-[#7c6cf5] text-white border-[#7c6cf5] shadow-lg shadow-[#7c6cf5]/30'
                : 'bg-white/5 border-white/10 text-[#a7a3c9] hover:bg-white/10'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Sistem</span>
          </button>
        </div>
      </div>

      {/* 4. Background Kustom (Feature 5 from prompt with Auto-Crop 9:16) */}
      <div className="glass-card p-4 sm:p-5 rounded-[24px] border border-white/10 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#a7a3c9] flex items-center gap-2">
            <Image className="w-3.5 h-3.5 text-[#ff7aa8]" />
            <span>Background Kustom (Foto / GIF / Video)</span>
          </h4>
          {settings.hasCustomBg && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              Aktif
            </span>
          )}
        </div>

        {/* Live Wallpaper Preview Thumbnail Box */}
        {settings.hasCustomBg && activeBgPreviewUrl ? (
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5">
            {/* Phone-aspect thumbnail preview */}
            <div className="w-14 h-24 rounded-xl overflow-hidden border border-[#7c6cf5]/40 shadow-md relative bg-black shrink-0">
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
                  alt="Pratinjau Wallpaper"
                  className="w-full h-full object-cover"
                />
              )}
              {/* Subtle glass reflection on phone frame */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>

            <div className="flex-1 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#8f81ff] block">
                Wallpaper Sedang Digunakan
              </span>
              <p className="text-xs font-semibold text-[#f2f0ff]">
                {activeBgType === 'video' ? 'Video Animasi Background' : 'Foto (9:16 Pas Layar HP)'}
              </p>
              <p className="text-[10px] text-[#a7a3c9] leading-tight">
                Tampil di seluruh layar di balik kartu transparan.
              </p>
            </div>
          </div>
        ) : null}

        {/* Warning as required in section 5 */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Foto otomatis dicrop ke rasio 9:16 agar pas dengan layar HP tanpa melar. Untuk video/GIF, disarankan resolusi 720p ke bawah agar hemat baterai.
          </p>
        </div>

        {/* Auto Crop 9:16 Toggle Button */}
        <button
          type="button"
          onClick={() => setAutoCrop916(!autoCrop916)}
          className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
            autoCrop916
              ? 'bg-[#7c6cf5]/20 border-[#7c6cf5]/50 text-[#8f81ff]'
              : 'bg-white/5 border-white/10 text-[#a7a3c9]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-[#7c6cf5]" />
            <span>Potong Otomatis (9:16 Pas Layar HP)</span>
          </div>
          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
            autoCrop916 ? 'bg-[#7c6cf5] text-white' : 'border border-white/20'
          }`}>
            {autoCrop916 && <Check className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Upload File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            disabled={isProcessingBg}
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7c6cf5] to-[#8f81ff] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>{isProcessingBg ? 'Memproses...' : 'Pilih Foto / Video'}</span>
          </button>

          {settings.hasCustomBg ? (
            <button
              type="button"
              onClick={handleRemoveBackground}
              className="py-2.5 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-semibold text-red-400 transition-all active:scale-95"
            >
              Hapus Background
            </button>
          ) : (
            <div className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/5 text-center text-xs text-[#a7a3c9]">
              Default Gradasi
            </div>
          )}
        </div>

        {/* Sliders for darkness & blur */}
        <div className="space-y-3 pt-2">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-[#a7a3c9] mb-1">
              <span>Kegelapan Lapisan Overlay</span>
              <span>{overlayOpacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={overlayOpacity}
              onChange={(e) => handleOverlayChange(Number(e.target.value))}
              className="w-full accent-[#7c6cf5] h-1.5 rounded-lg bg-white/10"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-medium text-[#a7a3c9] mb-1">
              <span>Tingkat Blur Kartu Kaca</span>
              <span>{cardBlur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={cardBlur}
              onChange={(e) => handleBlurChange(Number(e.target.value))}
              className="w-full accent-[#7c6cf5] h-1.5 rounded-lg bg-white/10"
            />
          </div>
        </div>
      </div>

      {/* 5. Backup & Restore */}
      <div className="glass-card p-4 sm:p-5 rounded-[24px] border border-white/10 shadow-lg space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#a7a3c9] flex items-center gap-2">
          <Download className="w-3.5 h-3.5 text-[#5aa9ff]" />
          <span>Backup & Pulihkan Data</span>
        </h4>
        <p className="text-[11px] text-[#a7a3c9] leading-relaxed">
          Semua catatan mingguan, profil, dan target tersimpan aman di HP. Unduh file cadangan untuk berjaga-jaga atau pindah perangkat.
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
            className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#f2f0ff] flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-[#3fc9b0]" />
            <span>Ekspor JSON</span>
          </button>

          <button
            type="button"
            onClick={() => importFileRef.current?.click()}
            className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#f2f0ff] flex items-center justify-center gap-1.5 transition-all"
          >
            <Upload className="w-4 h-4 text-[#8f81ff]" />
            <span>Impor JSON</span>
          </button>
        </div>
      </div>

      {/* 6. Download Standalone Static Bundle (Section 9 of Prompt) */}
      <div className="glass-card p-4 sm:p-5 rounded-[24px] border border-[#7c6cf5]/30 shadow-lg space-y-2.5 bg-gradient-to-r from-[#7c6cf5]/10 to-transparent">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#8f81ff]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#f2f0ff]">
            Unduh Paket Statis Siap APK / Hosting
          </h4>
        </div>
        <p className="text-[11px] text-[#a7a3c9] leading-relaxed">
          Sesuai instruksi file, unduh paket lengkap berisi file HTML, CSS, JS, manifest, dan README untuk diunggah ke hosting atau diubah menjadi file APK Android via PWABuilder.
        </p>
        <button
          type="button"
          disabled={isExportingZip}
          onClick={handleExportZip}
          className="w-full py-2.5 rounded-xl bg-[#7c6cf5] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>{isExportingZip ? 'Menyiapkan ZIP...' : 'Unduh File ZIP Mandiri'}</span>
        </button>
      </div>

      {/* 7. Reset Semua Data */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowResetModalStep1(true)}
          className="w-full min-h-[46px] rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-red-500/20"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Semua Data Aplikasi</span>
        </button>
      </div>
        </>
      )}

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
              Apakah Anda yakin ingin menghapus seluruh data catatan mingguan, profil, dan target keuangan?
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowResetModalStep1(false)}
                className="py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-[#f2f0ff]"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowResetModalStep1(false);
                  setShowResetModalStep2(true);
                }}
                className="py-2.5 rounded-xl bg-amber-600 text-xs font-semibold text-white shadow-lg"
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
              Tindakan ini permanen dan tidak dapat dibatalkan. Semua data akan terhapus dan kembali ke tampilan awal pembuatan profil.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowResetModalStep2(false)}
                className="py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-[#f2f0ff]"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowResetModalStep2(false);
                  onResetAllData();
                }}
                className="py-2.5 rounded-xl bg-red-600 text-xs font-semibold text-white shadow-lg shadow-red-600/40 hover:bg-red-700"
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
              1. Ketuk ikon <strong>Bagikan / Share</strong> (kotak panah ke atas) di bar bawah Safari.<br />
              2. Gulir ke bawah lalu pilih <strong>Add to Home Screen</strong> (Tambahkan ke Layar Utama).<br />
              3. Ketuk <strong>Add</strong> di kanan atas.
            </p>
            <button
              onClick={() => setShowIOSInstallGuide(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-white"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
