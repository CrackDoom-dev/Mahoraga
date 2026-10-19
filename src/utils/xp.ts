import { DailyRecord, WeeklyRecord, RankTier } from '../types';
import { ORDERED_TIERS, RANK_THEMES, RankTheme } from './theme';

export interface XpMetrics {
  totalXp: number;
  rawEarnedXp: number;
  decayPenalty: number;
  currentStreak: number;
  streakMultiplier: number; // 1, 1.5, or 2
  unlockedTiers: RankTier[];
  highestUnlockedTier: RankTier;
  activeTier: RankTier;
  activeTheme: RankTheme;
  nextTier?: RankTier;
  nextTheme?: RankTheme;
  xpInTier: number;
  xpNeededForNext: number;
  percentToNext: number;
  isMaxTier: boolean;
  daysSinceLastRecord: number;
}

/**
 * Parses YYYY-MM-DD or ISO string into midnight timestamp in local time
 */
function parseDateToMidnight(dateStr: string): number {
  try {
    const clean = dateStr.slice(0, 10);
    const [y, m, d] = clean.split('-').map(Number);
    if (!y || !m || !d) return new Date(dateStr).setHours(0, 0, 0, 0);
    return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
  } catch {
    return new Date().setHours(0, 0, 0, 0);
  }
}

/**
 * Calculates user's derived XP, streaks, unlocked tiers, and tier progress.
 * Completely deterministic and derived directly from records.
 */
export function calculateXpMetrics(
  dailyRecords: DailyRecord[] = [],
  weeklyRecords: WeeklyRecord[] = [],
  selectedRankOverride?: string,
  isDevUnlocked = false
): XpMetrics {
  // 1. Filter valid daily records (modal > 0 & hasilAkhir >= 0)
  const validDaily = dailyRecords.filter(
    (d) => typeof d.modal === 'number' && d.modal > 0 && typeof d.hasilAkhir === 'number' && d.hasilAkhir >= 0
  );

  // Group by unique calendar date (max 1 daily XP event per unique date)
  const dateMap = new Map<string, DailyRecord>();
  validDaily.forEach((d) => {
    const key = (d.tanggal || new Date(d.createdAt).toISOString()).slice(0, 10);
    if (!dateMap.has(key)) {
      dateMap.set(key, d);
    }
  });

  // Sort unique dates chronologically
  const uniqueDates = Array.from(dateMap.keys()).sort();

  // 2. Compute streak & daily XP with streak multipliers
  let currentStreak = 0;
  let runningDailyXp = 0;
  let lastTimestamp = 0;

  uniqueDates.forEach((dateKey) => {
    const ts = parseDateToMidnight(dateKey);
    if (lastTimestamp === 0) {
      currentStreak = 1;
    } else {
      const diffDays = Math.round((ts - lastTimestamp) / (1000 * 60 * 60 * 24));
      if (diffDays <= 2) {
        // Streak continues (grace period: streak breaks if missed more than 2 days)
        currentStreak += 1;
      } else {
        // Streak breaks
        currentStreak = 1;
      }
    }
    lastTimestamp = ts;

    // Multiplier: 14+ days -> 2.0x, 7+ days -> 1.5x, else 1.0x
    const multiplier = currentStreak >= 14 ? 2.0 : currentStreak >= 7 ? 1.5 : 1.0;
    runningDailyXp += Math.round(20 * multiplier);
  });

  // 3. Weekly records XP (+50 XP per valid weekly record)
  const validWeekly = weeklyRecords.filter(
    (w) => typeof w.modalAwal === 'number' && w.modalAwal > 0 && typeof w.finis === 'number' && w.finis >= 0
  );
  const weeklyXp = validWeekly.length * 50;

  const rawEarnedXp = runningDailyXp + weeklyXp;

  // 4. Inactivity check & decay
  const todayTs = new Date().setHours(0, 0, 0, 0);
  let latestActivityTs = 0;

  if (lastTimestamp > 0) {
    latestActivityTs = lastTimestamp;
  }
  validWeekly.forEach((w) => {
    const wTs = parseDateToMidnight(w.tanggal || new Date().toISOString());
    if (wTs > latestActivityTs) {
      latestActivityTs = wTs;
    }
  });

  let daysSinceLastRecord = 0;
  let decayPenalty = 0;

  if (latestActivityTs > 0) {
    daysSinceLastRecord = Math.max(0, Math.floor((todayTs - latestActivityTs) / (1000 * 60 * 60 * 24)));
    // After 5 days without a record, -10 XP per inactive day beyond day 5
    if (daysSinceLastRecord > 5) {
      decayPenalty = (daysSinceLastRecord - 5) * 10;
    }
  }

  // Active current streak from today's perspective
  let activeStreak = 0;
  if (latestActivityTs > 0) {
    const daysSinceLatest = Math.floor((todayTs - latestActivityTs) / (1000 * 60 * 60 * 24));
    if (daysSinceLatest <= 2) {
      activeStreak = currentStreak;
    } else {
      activeStreak = 0;
    }
  }

  const streakMultiplier = activeStreak >= 14 ? 2.0 : activeStreak >= 7 ? 1.5 : 1.0;

  // 5. Determine earned tier from raw earned XP
  let earnedTierIndex = 0;
  ORDERED_TIERS.forEach((tier, idx) => {
    if (rawEarnedXp >= RANK_THEMES[tier].minXp) {
      earnedTierIndex = idx;
    }
  });
  const highestEarnedTier = ORDERED_TIERS[earnedTierIndex];
  const tierFloorXp = RANK_THEMES[highestEarnedTier].minXp;

  // Total XP decays, but never below the floor of the earned tier
  const totalXp = Math.max(tierFloorXp, rawEarnedXp - decayPenalty);

  // 6. Unlocked tiers (all tiers whose threshold <= totalXp or rawEarnedXp)
  // Rule: Border yang sudah terbuka tidak hilang
  const unlockedTiers = ORDERED_TIERS.filter(
    (tier) => rawEarnedXp >= RANK_THEMES[tier].minXp || isDevUnlocked
  );
  const highestUnlockedTier = highestEarnedTier;

  // 7. Active Tier selection:
  // If user selected an unlocked tier (or dev unlocked all), respect choice; otherwise use highest unlocked
  let activeTier: RankTier = highestUnlockedTier;
  if (selectedRankOverride) {
    const candidate = ORDERED_TIERS.find((t) => t.toLowerCase() === selectedRankOverride.toLowerCase());
    if (candidate) {
      if (isDevUnlocked || unlockedTiers.includes(candidate)) {
        activeTier = candidate;
      }
    }
  }

  const activeTheme = RANK_THEMES[activeTier];
  const nextTier = activeTheme.nextTier;
  const nextTheme = nextTier ? RANK_THEMES[nextTier] : undefined;

  let xpInTier = 0;
  let xpNeededForNext = 0;
  let percentToNext = 100;
  const isMaxTier = !nextTheme;

  if (nextTheme) {
    const tierSpan = nextTheme.minXp - activeTheme.minXp;
    xpInTier = Math.max(0, totalXp - activeTheme.minXp);
    xpNeededForNext = Math.max(0, nextTheme.minXp - totalXp);
    percentToNext = tierSpan > 0 ? Math.min(100, Math.max(0, Math.round((xpInTier / tierSpan) * 100))) : 100;
  }

  return {
    totalXp,
    rawEarnedXp,
    decayPenalty,
    currentStreak: activeStreak,
    streakMultiplier,
    unlockedTiers,
    highestUnlockedTier,
    activeTier,
    activeTheme,
    nextTier,
    nextTheme,
    xpInTier,
    xpNeededForNext,
    percentToNext,
    isMaxTier,
    daysSinceLastRecord,
  };
}
