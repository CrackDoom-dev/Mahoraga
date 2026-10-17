import React, { useState, useEffect, useMemo } from 'react';
import {
  Profile,
  FinanceTargets,
  WeeklyRecord,
  AppSettings,
} from './types';
import {
  loadProfile,
  saveProfile,
  loadTargets,
  saveTargets,
  loadRecords,
  saveRecords,
  loadSettings,
  saveSettings,
  clearAllData,
  DEFAULT_TARGETS,
  DEFAULT_SETTINGS,
} from './utils/db';
import { calculateProgress } from './utils/calculations';
import { usePWA } from './hooks/usePWA';

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

export default function App() {
  const pwa = usePWA();

  // App initialization states
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [targets, setTargets] = useState<FinanceTargets>(DEFAULT_TARGETS);
  const [records, setRecords] = useState<WeeklyRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Navigation state
  const [activeTab, setActiveTab] = useState<TabKey>('beranda');

  // Background reload trigger
  const [bgReloadTrigger, setBgReloadTrigger] = useState(0);

  // Quick action modal state
  const [activeChip, setActiveChip] = useState<string | null>(null);

  // Load state on startup
  useEffect(() => {
    const savedProfile = loadProfile();
    const savedTargets = loadTargets();
    const savedRecords = loadRecords();
    const savedSettings = loadSettings();

    setProfile(savedProfile);
    setTargets(savedTargets);
    setRecords(savedRecords);
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

  // Calculate metrics reactively
  const metrics = useMemo(() => {
    return calculateProgress(records, targets, profile);
  }, [records, targets, profile]);

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

  const handleRestoreData = (backup: {
    profil: Profile;
    targets: FinanceTargets;
    records: WeeklyRecord[];
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
        {/* Sticky App Header */}
        <Header
          profile={profile}
          weeksCount={records.length}
          onOpenSettings={() => setActiveTab('pengaturan')}
          onSelectChip={(chip) => setActiveChip(chip)}
        />

        {/* Tab View Container */}
        <main className="flex-1 overflow-y-auto no-scrollbar pt-1">
          {activeTab === 'beranda' && (
            <BerandaTab
              profile={profile}
              metrics={metrics}
              records={records}
              onNavigateToCatat={() => setActiveTab('catat')}
              onNavigateToRiwayat={() => setActiveTab('riwayat')}
            />
          )}

          {activeTab === 'catat' && (
            <CatatTab
              records={records}
              onSaveWeek={handleSaveWeek}
              onSuccessRedirect={() => setActiveTab('beranda')}
            />
          )}

          {activeTab === 'riwayat' && (
            <RiwayatTab
              records={records}
              onDeleteLastRecord={handleDeleteLastRecord}
              onNavigateToCatat={() => setActiveTab('catat')}
            />
          )}

          {activeTab === 'pengaturan' && (
            <PengaturanTab
              profile={profile}
              targets={targets}
              settings={settings}
              records={records}
              onUpdateProfile={handleUpdateProfile}
              onUpdateTargets={handleUpdateTargets}
              onUpdateSettings={handleUpdateSettings}
              onRestoreData={handleRestoreData}
              onResetAllData={handleResetAllData}
              onReloadCustomBg={() => setBgReloadTrigger((c) => c + 1)}
              pwa={pwa}
            />
          )}
        </main>

        {/* Floating Pill Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
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
