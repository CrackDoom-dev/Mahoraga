import { RankTier } from '../types';

export interface RankTheme {
  tier: RankTier;
  shortName: string;
  minXp: number;
  nextTier?: RankTier;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  glowRgba: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  conicGradient: string;
  desc: string;
}

export const RANK_THEMES: Record<RankTier, RankTheme> = {
  'F-Rank Pemula': {
    tier: 'F-Rank Pemula',
    shortName: 'F-Rank',
    minXp: 0,
    nextTier: 'E-Rank Pejuang',
    primaryColor: '#cbd5e1',
    secondaryColor: '#94a3b8',
    glowColor: '#e2e8f0',
    glowRgba: 'rgba(203, 213, 225, 0.45)',
    badgeBg: 'bg-slate-500/20',
    badgeText: 'text-slate-300',
    badgeBorder: 'border-slate-400/40',
    conicGradient: 'conic-gradient(from 0deg, #94a3b8, #cbd5e1, #ffffff, #64748b, #94a3b8)',
    desc: 'Deretan mutiara perak halus berputar dengan garis ganda',
  },
  'E-Rank Pejuang': {
    tier: 'E-Rank Pejuang',
    shortName: 'E-Rank',
    minXp: 100,
    nextTier: 'D-Rank Konsisten',
    primaryColor: '#10b981',
    secondaryColor: '#34d399',
    glowColor: '#6ee7b7',
    glowRgba: 'rgba(16, 185, 129, 0.65)',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-400/40',
    conicGradient: 'conic-gradient(from 0deg, #10b981, #34d399, #6ee7b7, #059669, #10b981)',
    desc: 'Karangan daun laurel zamrud melingkar menyala lembut',
  },
  'D-Rank Konsisten': {
    tier: 'D-Rank Konsisten',
    shortName: 'D-Rank',
    minXp: 300,
    nextTier: 'C-Rank Terencana',
    primaryColor: '#06b6d4',
    secondaryColor: '#22d3ee',
    glowColor: '#38bdf8',
    glowRgba: 'rgba(6, 182, 212, 0.7)',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-400/40',
    conicGradient: 'conic-gradient(from 0deg, #06b6d4, #38bdf8, #67e8f9, #0284c7, #06b6d4)',
    desc: 'Ukiran ombak samudra dan spiral cyan mengalir anggun',
  },
  'C-Rank Terencana': {
    tier: 'C-Rank Terencana',
    shortName: 'C-Rank',
    minXp: 700,
    nextTier: 'B-Rank Finansial Stabil',
    primaryColor: '#a855f7',
    secondaryColor: '#c084fc',
    glowColor: '#e9d5ff',
    glowRgba: 'rgba(139, 92, 246, 0.7)',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-400/40',
    conicGradient: 'conic-gradient(from 0deg, #8b5cf6, #c084fc, #e879f9, #6d28d9, #8b5cf6)',
    desc: 'Kelopak kristal kecubung runcing dan bintang berkelip',
  },
  'B-Rank Finansial Stabil': {
    tier: 'B-Rank Finansial Stabil',
    shortName: 'B-Rank',
    minXp: 1300,
    nextTier: 'A-Rank Mandiri Finansial',
    primaryColor: '#f43f5e',
    secondaryColor: '#fb7185',
    glowColor: '#fbbf24',
    glowRgba: 'rgba(244, 63, 94, 0.7)',
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-400/40',
    conicGradient: 'conic-gradient(from 0deg, #f43f5e, #fb7185, #f59e0b, #e11d48, #f43f5e)',
    desc: 'Lidah api delima melingkari cincin menyala berkedip',
  },
  'A-Rank Mandiri Finansial': {
    tier: 'A-Rank Mandiri Finansial',
    shortName: 'A-Rank',
    minXp: 2200,
    nextTier: 'S-Rank Apex Mahoraga',
    primaryColor: '#fbbf24',
    secondaryColor: '#f59e0b',
    glowColor: '#fef08a',
    glowRgba: 'rgba(251, 191, 36, 0.75)',
    badgeBg: 'bg-yellow-500/20',
    badgeText: 'text-yellow-300',
    badgeBorder: 'border-yellow-400/40',
    conicGradient: 'conic-gradient(from 0deg, #f59e0b, #fbbf24, #fef08a, #d97706, #f59e0b)',
    desc: 'Mahkota sinar surya emas murni dengan ukiran filigree',
  },
  'S-Rank Apex Mahoraga': {
    tier: 'S-Rank Apex Mahoraga',
    shortName: 'S-Rank',
    minXp: 3500,
    nextTier: 'Divine Mahoraga',
    primaryColor: '#fbbf24',
    secondaryColor: '#8b5cf6',
    glowColor: '#c084fc',
    glowRgba: 'rgba(124, 108, 245, 0.7)',
    badgeBg: 'bg-amber-500/25',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-400/50',
    conicGradient: 'conic-gradient(from 0deg, #7c6cf5, #ffb454, #ff7aa8, #3fc9b0, #7c6cf5)',
    desc: 'Roda Delapan Mahoraga (8 pedang gagang luar, putaran ganda)',
  },
  'Divine Mahoraga': {
    tier: 'Divine Mahoraga',
    shortName: 'Divine',
    minXp: 5500,
    nextTier: undefined,
    primaryColor: '#e879f9',
    secondaryColor: '#06b6d4',
    glowColor: '#ffffff',
    glowRgba: 'rgba(232, 121, 249, 0.75)',
    badgeBg: 'bg-fuchsia-500/20',
    badgeText: 'text-fuchsia-300',
    badgeBorder: 'border-fuchsia-400/40',
    conicGradient: 'conic-gradient(from 0deg, #ff007f, #7928ca, #0070f3, #00dfd8, #79ffe1, #f5a623, #ff007f)',
    desc: 'Mandala suci berlapis kelopak spektrum ilahi berputar lembut',
  },
};

export const ORDERED_TIERS: RankTier[] = [
  'F-Rank Pemula',
  'E-Rank Pejuang',
  'D-Rank Konsisten',
  'C-Rank Terencana',
  'B-Rank Finansial Stabil',
  'A-Rank Mandiri Finansial',
  'S-Rank Apex Mahoraga',
  'Divine Mahoraga',
];

export const ALL_RANKS: RankTheme[] = ORDERED_TIERS.map((tier) => RANK_THEMES[tier]);

export function getRankTier(rankStr?: string): RankTier {
  if (!rankStr) return 'F-Rank Pemula';
  const lower = rankStr.toLowerCase();
  if (lower.includes('divine')) return 'Divine Mahoraga';
  if (lower.includes('s-rank') || lower.includes('apex')) return 'S-Rank Apex Mahoraga';
  if (lower.includes('a-rank') || lower.includes('mandiri')) return 'A-Rank Mandiri Finansial';
  if (lower.includes('b-rank') || lower.includes('stabil')) return 'B-Rank Finansial Stabil';
  if (lower.includes('c-rank') || lower.includes('terencana')) return 'C-Rank Terencana';
  if (lower.includes('d-rank') || lower.includes('konsisten')) return 'D-Rank Konsisten';
  if (lower.includes('e-rank') || lower.includes('pejuang')) return 'E-Rank Pejuang';
  return 'F-Rank Pemula';
}

export function getRankTheme(rankStr?: string): RankTheme {
  const tier = getRankTier(rankStr);
  return RANK_THEMES[tier] || RANK_THEMES['F-Rank Pemula'];
}
