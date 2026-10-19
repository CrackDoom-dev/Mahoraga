import React, { useState, useEffect, useMemo } from 'react';
import {
  Profile,
  FinanceTargets,
  WeeklyRecord,
  DailyRecord,
  AppSettings,
} from './types';
import {
  loadProfile,
  saveProfile,
  loadTargets,
  saveTargets,
  loadRecords,
  saveRecords,
  loadDailyRecords,
  saveDailyRecords,
  loadSettings,
  saveSettings,
  clearAllData,
  DEFAULT_TARGETS,
  DEFAULT_SETTINGS,
} from './utils/db';
import { calculateProgress } from './utils/calculations';
import { calculateXpMetrics } from './utils/xp';
import { ORDERED_TIERS } from './utils/theme';
import { usePWA } from './hooks/usePWA';
import { motion, AnimatePresence } from 'motion/react';

// Components
import { SplashScreen } from './components/SplashScreen';
import { OnboardingProfile } from './components/OnboardingProfile';
import { Header } from './components/Header';
import { BerandaTab } from './components/BerandaTab';
import { CatatTab } from './components/CatatTab';
import { RiwayatTab } from './components/RiwayatTab';
import { PengaturanTab } from './components/PengaturanTab';
import { BottomNavigation, TabKey } from './components/BottomNavigation';
import { BackgroundLayer } from './components/BackgroundLayer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { QuickActionModals } from './components/QuickActionModals';

const TAB_ORDER: TabKey[] = ['beranda', 'catat', 'riwayat', 'pengaturan'];

export default function App() {
  const pwa = usePWA();
  const mainRef = React.useRef<HTMLElement>(null);

  // App initialization states
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [targets, setTargets] = useState<FinanceTargets>(DEFAULT_TARGETS);
  const [records, setRecords] = useState<WeeklyRecord[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Navigation state with silky smooth directional tracking
  const [activeTab, setActiveTab] = useState<TabKey>('beranda');
  const [direction, setDirection] = useState<number>(0);

  const handleTabChange = (newTab: TabKey) => {
    if (newTab === activeTab) return;
    const oldIndex = TAB_ORDER.indexOf(activeTab);
    const newIndex = TAB_ORDER.indexOf(newTab);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setActiveTab(newTab);
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  };

  // Background reload trigger
  const [bgReloadTrigger, setBgReloadTrigger] = useState(0);

  // Quick action modal state
  const [activeChip, setActiveChip] = useState<string | null>(null);

  // Load state on startup
  useEffect(() => {
    const savedProfile = loadProfile();
    const savedTargets = loadTargets();
    const savedRecords = loadRecords();
    const savedDaily = loadDailyRecords();
    const savedSettings = loadSettings();

    setProfile(savedProfile);
    setTargets(savedTargets);
    setRecords(savedRecords);
    setDailyRecords(savedDaily);
    setSettings(savedSettings);
  }, []);

  // Sync theme with document element
  useEffect(() => {
    const root = document.documentElement;
    let effectiveTheme = settings.themeMode;
    if (settings.themeMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }

    if (effectiveTheme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }

    // Update CSS custom properties
    root.style.setProperty('--card-blur', `${settings.cardBlur}px`);
    root.style.setProperty('--overlay-opacity', `${settings.overlayOpacity / 100}`);
  }, [settings.themeMode, settings.cardBlur, settings.overlayOpacity]);

  // Calculate metrics reactively based on both daily & weekly records
  const metrics = useMemo(() => {
    return calculateProgress(records, dailyRecords, targets, profile);
  }, [records, dailyRecords, targets, profile]);

  // Derived XP metrics and unlocked tiers directly derived from records
  const isDevUnlocked = typeof window !== 'undefined' && localStorage.getItem('mahoraga_rank_unlocked') === 'true';
  const xpMetrics = useMemo(() => {
    return calculateXpMetrics(dailyRecords, records, profile?.rank, isDevUnlocked);
  }, [dailyRecords, records, profile?.rank, isDevUnlocked]);

  // One-time tier up celebration trigger (in-place sparkle on avatar and XP bar, no banners)
  const [isCelebratingTier, setIsCelebratingTier] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const currentHighest = xpMetrics.highestUnlockedTier;
    const lastSeen = profile.lastSeenTier;

    if (!lastSeen) {
      // First initialization: set lastSeenTier to current earned tier without celebratory burst
      const updated = { ...profile, lastSeenTier: currentHighest };
      saveProfile(updated);
      setProfile(updated);
      return;
    }

    if (currentHighest !== lastSeen) {
      const oldIdx = ORDERED_TIERS.indexOf(lastSeen);
      const newIdx = ORDERED_TIERS.indexOf(currentHighest);
      if (newIdx > oldIdx) {
        // Unlocked a higher tier!
        setIsCelebratingTier(true);
        const timer = setTimeout(() => {
          setIsCelebratingTier(false);
        }, 3500);

        const updated = { ...profile, lastSeenTier: currentHighest };
        saveProfile(updated);
        setProfile(updated);

        return () => clearTimeout(timer);
      }
    }
  }, [xpMetrics.highestUnlockedTier, profile]);

  // Handlers
  const handleOnboardingComplete = (newProfile: Profile) => {
    saveProfile(newProfile);
    setProfile(newProfile);
    setActiveTab('beranda');
  };

  const handleUpdateProfile = (updated: Profile) => {
    saveProfile(updated);
    setProfile(updated);
  };

  const handleUpdateTargets = (updated: FinanceTargets) => {
    saveTargets(updated);
    setTargets(updated);
  };

  const handleUpdateSettings = (updated: AppSettings) => {
    saveSettings(updated);
    setSettings(updated);
  };

  const handleSaveWeek = (newRecord: WeeklyRecord) => {
    const updated = [...records, newRecord];
    saveRecords(updated);
    setRecords(updated);
  };

  const handleDeleteLastRecord = () => {
    if (records.length === 0) return;
    const updated = records.slice(0, -1);
    saveRecords(updated);
    setRecords(updated);
  };

  const handleSaveDaily = (newDaily: DailyRecord) => {
    const updated = [...dailyRecords, newDaily];
    saveDailyRecords(updated);
    setDailyRecords(updated);
  };

  const handleDeleteDailyRecord = (id: string) => {
    const updated = dailyRecords.filter((d) => d.id !== id);
    saveDailyRecords(updated);
    setDailyRecords(updated);
  };

  const handleRestoreData = (backup: {
    profil: Profile;
    targets: FinanceTargets;
    records: WeeklyRecord[];
    dailyRecords?: DailyRecord[];
    settings?: AppSettings;
  }) => {
    if (backup.profil) {
      saveProfile(backup.profil);
      setProfile(backup.profil);
    }
    if (backup.targets) {
      saveTargets(backup.targets);
      setTargets(backup.targets);
    }
    if (Array.isArray(backup.records)) {
      saveRecords(backup.records);
      setRecords(backup.records);
    }
    if (Array.isArray(backup.dailyRecords)) {
      saveDailyRecords(backup.dailyRecords);
      setDailyRecords(backup.dailyRecords);
    }
    if (backup.settings) {
      saveSettings(backup.settings);
      setSettings(backup.settings);
    }
  };

  const handleResetAllData = () => {
    clearAllData();
    setProfile(null);
    setTargets(DEFAULT_TARGETS);
    setRecords([]);
    setDailyRecords([]);
    setSettings(DEFAULT_SETTINGS);
    setBgReloadTrigger((c) => c + 1);
    setActiveTab('beranda');
  };

  // 1. Splash Screen
  if (isAppLoading) {
    return <SplashScreen onFinish={() => setIsAppLoading(false)} />;
  }

  // 2. Onboarding: if profile does not exist yet
  if (!profile) {
    return <OnboardingProfile onComplete={handleOnboardingComplete} />;
  }

  // 3. Main Application Dashboard
  return (
    <div className="min-h-screen w-full relative flex justify-center bg-transparent text-[#f2f0ff]">
      {/* Background layer (Image/GIF/Video or Gradient) */}
      <BackgroundLayer
        settings={settings}
        reloadTrigger={bgReloadTrigger}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator isOnline={pwa.isOnline} />

      {/* Mobile-first centered frame (potret focused) */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative z-10">
        {/* Clean Sticky App Header with Synchronized Rank Avatar */}
        <Header
          profile={profile}
          weeksCount={records.length}
          dailyCount={dailyRecords.length}
          xpMetrics={xpMetrics}
          isCelebratingTier={isCelebratingTier}
          onOpenSettings={() => handleTabChange('pengaturan')}
          onSelectChip={(chip) => setActiveChip(chip)}
        />

        {/* Tab View Container with Silky Smooth Directional Transitions */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto no-scrollbar pt-1 relative"
        >
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? 16 : dir < 0 ? -16 : 0,
                  opacity: 0,
                  scale: 0.996,
                }),
                center: {
                  x: 0,
                  opacity: 1,
                  scale: 1,
                  transition: {
                    x: { type: 'spring', stiffness: 420, damping: 36 },
                    opacity: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                    scale: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                  },
                },
                exit: (dir: number) => ({
                  x: dir > 0 ? -16 : dir < 0 ? 16 : 0,
                  opacity: 0,
                  scale: 0.996,
                  transition: {
                    x: { type: 'spring', stiffness: 420, damping: 36 },
                    opacity: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
                    scale: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
                  },
                }),
              }}
              className="w-full"
            >
              {activeTab === 'beranda' && (
                <BerandaTab
                  profile={profile}
                  metrics={metrics}
                  records={records}
                  dailyRecords={dailyRecords}
                  xpMetrics={xpMetrics}
                  onNavigateToCatat={() => handleTabChange('catat')}
                  onNavigateToRiwayat={() => handleTabChange('riwayat')}
                />
              )}

              {activeTab === 'catat' && (
                <CatatTab
                  records={records}
                  dailyRecords={dailyRecords}
                  onSaveWeek={handleSaveWeek}
                  onSaveDaily={handleSaveDaily}
                  onSuccessRedirect={() => handleTabChange('beranda')}
                />
              )}

              {activeTab === 'riwayat' && (
                <RiwayatTab
                  records={records}
                  dailyRecords={dailyRecords}
                  onDeleteLastRecord={handleDeleteLastRecord}
                  onDeleteDailyRecord={handleDeleteDailyRecord}
                  onNavigateToCatat={() => handleTabChange('catat')}
                />
              )}

              {activeTab === 'pengaturan' && (
                <PengaturanTab
                  profile={profile}
                  targets={targets}
                  settings={settings}
                  records={records}
                  dailyRecords={dailyRecords}
                  xpMetrics={xpMetrics}
                  onUpdateProfile={handleUpdateProfile}
                  onUpdateTargets={handleUpdateTargets}
                  onUpdateSettings={handleUpdateSettings}
                  onRestoreData={handleRestoreData}
                  onResetAllData={handleResetAllData}
                  onReloadCustomBg={() => setBgReloadTrigger((c) => c + 1)}
                  pwa={pwa}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Pill Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Quick Chip Modals (Target, Kalkulator, Bantuan) */}
        <QuickActionModals
          activeChip={activeChip}
          onClose={() => setActiveChip(null)}
          targets={targets}
          onUpdateTargets={handleUpdateTargets}
        />
      </div>
    </div>
  );
}
