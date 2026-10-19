import React, { useState, useEffect, useMemo, useRef } from 'react';
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

const TAB_ORDER: TabKey[] = ['beranda', 'catat', 'riwayat', 'pengaturan'];

export default function App() {
  const pwa = usePWA();

  const [isAppLoading, setIsAppLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [targets, setTargets] = useState<FinanceTargets>(() => loadTargets());
  const [records, setRecords] = useState<WeeklyRecord[]>(() => loadRecords());
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>(() => loadDailyRecords());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const [activeTab, setActiveTab] = useState<TabKey>('beranda');

  const handleTabChange = (newTab: TabKey) => {
    setActiveTab(newTab);
  };

  const [bgReloadTrigger, setBgReloadTrigger] = useState(0);

  useEffect(() => {
    setProfile(loadProfile());
    setTargets(loadTargets());
    setRecords(loadRecords());
    setDailyRecords(loadDailyRecords());
    setSettings(loadSettings());
  }, []);

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

    root.style.setProperty('--card-blur', `${settings.cardBlur}px`);
    root.style.setProperty('--overlay-opacity', `${settings.overlayOpacity / 100}`);
  }, [settings.themeMode, settings.cardBlur, settings.overlayOpacity]);

  const metrics = useMemo(() => {
    return calculateProgress(records, dailyRecords, targets, profile);
  }, [records, dailyRecords, targets, profile]);

  const isDevUnlocked = typeof window !== 'undefined' && localStorage.getItem('mahoraga_rank_unlocked') === 'true';
  const xpMetrics = useMemo(() => {
    return calculateXpMetrics(dailyRecords, records, profile?.rank, isDevUnlocked);
  }, [dailyRecords, records, profile?.rank, isDevUnlocked]);

  const [isCelebratingTier, setIsCelebratingTier] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const currentHighest = xpMetrics.highestUnlockedTier;
    const lastSeen = profile.lastSeenTier;

    if (!lastSeen) {

      const updated = { ...profile, lastSeenTier: currentHighest };
      saveProfile(updated);
      setProfile(updated);
      return;
    }

    if (currentHighest !== lastSeen) {
      const oldIdx = ORDERED_TIERS.indexOf(lastSeen);
      const newIdx = ORDERED_TIERS.indexOf(currentHighest);
      if (newIdx > oldIdx) {

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

  if (!isAppLoading && !profile) {
    return <OnboardingProfile onComplete={handleOnboardingComplete} />;
  }

  if (isAppLoading && !profile) {
    return <SplashScreen onFinish={() => setIsAppLoading(false)} />;
  }

  return (
    <div className={`min-h-screen w-full relative flex justify-center bg-transparent ${settings.themeMode === 'light' ? 'text-slate-900' : 'text-[#f2f0ff]'}`}>

      {isAppLoading && (
        <SplashScreen onFinish={() => setIsAppLoading(false)} />
      )}

      <BackgroundLayer
        settings={settings}
        reloadTrigger={bgReloadTrigger}
      />

      <OfflineIndicator isOnline={pwa.isOnline} />

      <div className="w-full max-w-md min-h-screen flex flex-col relative z-10">

        {profile && (
          <Header
            profile={profile}
            weeksCount={records.length}
            dailyCount={dailyRecords.length}
            xpMetrics={xpMetrics}
            isCelebratingTier={isCelebratingTier}
            onOpenSettings={() => handleTabChange('pengaturan')}
          />
        )}

        <main className="flex-1 relative w-full overflow-hidden">
          {profile && TAB_ORDER.map((tab) => {
            const isActive = activeTab === tab;

            return (
              <div
                key={tab}
                id={`tab-scroll-${tab
}`}
                role="tabpanel"
                aria-hidden={!isActive}
                className={`tab-viewport absolute inset-0 overflow-y-auto no-scrollbar pt-1 ${                  isActive ? 'tab-active' : 'tab-inactive'

}`}
              >
                {tab === 'beranda' && (
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

                {tab === 'catat' && (
                  <CatatTab
                    records={records}
                    dailyRecords={dailyRecords}
                    onSaveWeek={handleSaveWeek}
                    onSaveDaily={handleSaveDaily}
                    onSuccessRedirect={() => handleTabChange('beranda')}
                  />
                )}

                {tab === 'riwayat' && (
                  <RiwayatTab
                    records={records}
                    dailyRecords={dailyRecords}
                    onDeleteLastRecord={handleDeleteLastRecord}
                    onDeleteDailyRecord={handleDeleteDailyRecord}
                    onNavigateToCatat={() => handleTabChange('catat')}
                  />
                )}

                {tab === 'pengaturan' && (
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
                  />
                )}
              </div>

            );
          })}
        </main>

        <BottomNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

    </div>

  );
}

