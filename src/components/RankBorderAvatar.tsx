import React, { useId } from 'react';
import { RankTier } from '../types';
import { getRankTier, getRankTheme, ALL_RANKS, RANK_THEMES } from '../utils/theme';

export { getRankTier, getRankTheme, ALL_RANKS };

export interface RankBorderAvatarProps {
  avatar?: string;
  nama?: string;
  rank?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  level?: number;
  showLevelBadge?: boolean;
  sparkleEffect?: boolean;
  className?: string;
  onClick?: () => void;
}

export function getRankBadgeColor(rankStr?: string): { bg: string; text: string; border: string } {
  const theme = getRankTheme(rankStr);
  return { bg: theme.badgeBg, text: theme.badgeText, border: theme.badgeBorder };
}

// Helper to convert polar coordinates (radius, degrees) to Cartesian (x, y)
const polarToCart = (r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return {
    x: +(100 + r * Math.cos(rad)).toFixed(2),
    y: +(100 + r * Math.sin(rad)).toFixed(2),
  };
};

export const RankBorderAvatar: React.FC<RankBorderAvatarProps> = ({
  avatar,
  nama = 'User',
  rank,
  size = 'md',
  level,
  showLevelBadge = false,
  sparkleEffect = false,
  className = '',
  onClick,
}) => {
  const rawId = useId();
  const uid = `rba_${rawId.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const tier = getRankTier(rank);

  // Responsive dimensions for outer container
  const dimMap = {
    xs: 'w-10 h-10',
    sm: 'w-13 h-13',
    md: 'w-18 h-18',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };
  const boxDim = dimMap[size] || dimMap.md;

  const initial = (nama && nama.trim() ? nama.trim().charAt(0) : 'M').toUpperCase();

  // Render SVG Layers according to Rank
  const renderRankOrnament = () => {
    switch (tier) {
      /* ========================================================
       * 1. F-RANK: PERAK (Mutiara kecil, garis ganda, kilau menyapu)
       * ======================================================== */
      case 'F-Rank Pemula': {
        const pearlCount = 24;
        const pearls = Array.from({ length: pearlCount }).map((_, i) => {
          const angle = (i * 360) / pearlCount;
          const pos = polarToCart(78, angle);
          const shine = polarToCart(76.8, angle - 12);
          return (
            <g key={`pearl_${i}`}>
              <circle cx={pos.x} cy={pos.y} r="3.2" fill={`url(#${uid}_silverPearl)`} stroke="#cbd5e1" strokeWidth="0.6" />
              <circle cx={shine.x} cy={shine.y} r="1" fill="#ffffff" opacity="0.9" />
            </g>
          );
        });

        return (
          <>
            <defs>
              <linearGradient id={`${uid}_silverGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#cbd5e1" />
                <stop offset="70%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              <radialGradient id={`${uid}_silverPearl`} cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#e2e8f0" />
                <stop offset="85%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </radialGradient>
              <radialGradient id={`${uid}_silverAura`} cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="#94a3b8" stopOpacity="0" />
                <stop offset="88%" stopColor="#cbd5e1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Soft Ambient Silver Aura */}
            <circle cx="100" cy="100" r="88" fill={`url(#${uid}_silverAura)`} className="animate-pulse-glow" />

            {/* Lapisan Ornamen Luar Berputar Pelan: Garis Ganda Tipis & Deretan Mutiara */}
            <g className="animate-spin-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              {/* Outer Double Fine Rings */}
              <circle cx="100" cy="100" r="85" fill="none" stroke={`url(#${uid}_silverGrad)`} strokeWidth="1.2" strokeDasharray="3 2" />
              <circle cx="100" cy="100" r="82.5" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
              <circle cx="100" cy="100" r="74.5" fill="none" stroke="#94a3b8" strokeWidth="0.8" />
              <circle cx="100" cy="100" r="72" fill="none" stroke={`url(#${uid}_silverGrad)`} strokeWidth="1.2" />

              {/* Mutiara melingkar */}
              {pearls}

              {/* 4 Cardinal filigree nodes */}
              {[0, 90, 180, 270].map((deg) => {
                const p = polarToCart(88, deg);
                return (
                  <path
                    key={`node_${deg}`}
                    d={`M ${p.x} ${p.y} L ${polarToCart(93, deg).x} ${polarToCart(93, deg).y}`}
                    stroke="#ffffff"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>

            {/* Lapisan Dalam Berputar Berlawanan Arah: Filigree Beaded Cable */}
            <g className="animate-spin-reverse-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              <circle cx="100" cy="100" r="60" fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 2" />
              <circle cx="100" cy="100" r="56" fill="none" stroke={`url(#${uid}_silverGrad)`} strokeWidth="1" />
              {Array.from({ length: 16 }).map((_, i) => {
                const pos = polarToCart(58, (i * 360) / 16);
                return <circle key={`dot_${i}`} cx={pos.x} cy={pos.y} r="1.3" fill="#ffffff" />;
              })}
            </g>

            {/* Lapisan Kilau Menyapu Pelan (Sparkle layer) */}
            <g className="animate-pulse-glow" style={{ willChange: 'opacity' }}>
              {[45, 135, 225, 315].map((deg) => {
                const p = polarToCart(84, deg);
                return (
                  <path
                    key={`spk_${deg}`}
                    d={`M ${p.x} ${p.y - 4} Q ${p.x} ${p.y} ${p.x + 4} ${p.y} Q ${p.x} ${p.y} ${p.x} ${p.y + 4} Q ${p.x} ${p.y} ${p.x - 4} ${p.y} Z`}
                    fill="#ffffff"
                    opacity="0.85"
                  />
                );
              })}
            </g>
          </>
        );
      }

      /* ========================================================
       * 2. E-RANK: ZAMRUD (Karangan daun laurel melingkar, daun bergoyang & menyala)
       * ======================================================== */
      case 'E-Rank Pejuang': {
        const leafCount = 14;
        const laurelPairs = Array.from({ length: leafCount }).map((_, i) => {
          const baseAngle = (i * 360) / leafCount;
          // Outer curved leaf
          const pStem = polarToCart(74, baseAngle);
          const pTipOuter = polarToCart(89, baseAngle + 12);
          const pCtrlOuter1 = polarToCart(86, baseAngle + 3);
          const pCtrlOuter2 = polarToCart(78, baseAngle + 10);
          // Inner curved leaf
          const pTipInner = polarToCart(63, baseAngle + 10);
          const pCtrlInner1 = polarToCart(67, baseAngle + 2);
          const pCtrlInner2 = polarToCart(70, baseAngle + 8);

          const berry = polarToCart(74, baseAngle + 16);

          return (
            <g key={`laurel_${i}`}>
              {/* Outer Leaf */}
              <path
                d={`M ${pStem.x} ${pStem.y} C ${pCtrlOuter1.x} ${pCtrlOuter1.y} ${pCtrlOuter2.x} ${pCtrlOuter2.y} ${pTipOuter.x} ${pTipOuter.y} C ${pCtrlOuter2.x - 1} ${pCtrlOuter2.y} ${pStem.x} ${pStem.y + 2} ${pStem.x} ${pStem.y} Z`}
                fill={`url(#${uid}_emeraldGrad)`}
                stroke="#047857"
                strokeWidth="0.5"
              />
              {/* Leaf center spine */}
              <path d={`M ${pStem.x} ${pStem.y} L ${pTipOuter.x} ${pTipOuter.y}`} stroke="#6ee7b7" strokeWidth="0.6" opacity="0.8" />

              {/* Inner Leaf */}
              <path
                d={`M ${pStem.x} ${pStem.y} C ${pCtrlInner1.x} ${pCtrlInner1.y} ${pCtrlInner2.x} ${pCtrlInner2.y} ${pTipInner.x} ${pTipInner.y} C ${pCtrlInner2.x + 1} ${pCtrlInner2.y} ${pStem.x} ${pStem.y - 1} ${pStem.x} ${pStem.y} Z`}
                fill={`url(#${uid}_emeraldGradLight)`}
                stroke="#047857"
                strokeWidth="0.5"
              />

              {/* Golden emerald berry */}
              <circle cx={berry.x} cy={berry.y} r="2" fill="#fbbf24" stroke="#047857" strokeWidth="0.5" />
              <circle cx={berry.x - 0.5} cy={berry.y - 0.5} r="0.6" fill="#ffffff" />
            </g>
          );
        });

        return (
          <>
            <defs>
              <linearGradient id={`${uid}_emeraldGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id={`${uid}_emeraldGradLight`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="60%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#065f46" />
              </linearGradient>
              <radialGradient id={`${uid}_emeraldAura`} cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="85%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Glowing Emerald Aura */}
            <circle cx="100" cy="100" r="90" fill={`url(#${uid}_emeraldAura)`} className="animate-pulse-glow" />

            {/* Lapisan Luar: Karangan Daun Laurel Melingkar */}
            <g className="animate-spin-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              {/* Circular Laurel Stem Ring */}
              <circle cx="100" cy="100" r="74" fill="none" stroke="#059669" strokeWidth="1.5" />
              {laurelPairs}
            </g>

            {/* Lapisan Dalam Berputar Berlawanan Arah: Twining Emerald Vine */}
            <g className="animate-spin-reverse-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              <circle cx="100" cy="100" r="57" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
              {Array.from({ length: 12 }).map((_, i) => {
                const pos = polarToCart(57, (i * 360) / 12);
                return <circle key={`bud_${i}`} cx={pos.x} cy={pos.y} r="1.5" fill="#34d399" />;
              })}
            </g>

            {/* Shimmer / Leaf Sway Sparkles */}
            <g className="animate-pulse-glow" style={{ willChange: 'opacity' }}>
              {[30, 120, 210, 300].map((deg) => {
                const p = polarToCart(86, deg);
                return <circle key={`glow_${deg}`} cx={p.x} cy={p.y} r="1.5" fill="#a7f3d0" />;
              })}
            </g>
          </>
        );
      }

      /* ========================================================
       * 3. D-RANK: CYAN (Ukiran ombak dan spiral mengalir, garis halus)
       * ======================================================== */
      case 'D-Rank Konsisten': {
        const waveCount = 8;
        const waves = Array.from({ length: waveCount }).map((_, i) => {
          const a0 = (i * 360) / waveCount;
          const a1 = a0 + 22;
          const a2 = a0 + 38;
          const pStart = polarToCart(68, a0);
          const pCrest = polarToCart(91, a1);
          const pCurl = polarToCart(79, a2);
          const pBase = polarToCart(68, a2);
          const bead = polarToCart(83, a2 - 4);

          return (
            <g key={`wave_${i}`}>
              {/* Main Rolling Ocean Wave Crest */}
              <path
                d={`M ${pStart.x} ${pStart.y} C ${polarToCart(78, a0 + 10).x} ${polarToCart(78, a0 + 10).y} ${polarToCart(86, a1 - 4).x} ${polarToCart(86, a1 - 4).y} ${pCrest.x} ${pCrest.y} C ${polarToCart(90, a1 + 8).x} ${polarToCart(90, a1 + 8).y} ${polarToCart(82, a2).x} ${polarToCart(82, a2).y} ${pCurl.x} ${pCurl.y} Q ${polarToCart(74, a2 - 6).x} ${polarToCart(74, a2 - 6).y} ${pBase.x} ${pBase.y} Z`}
                fill={`url(#${uid}_cyanWaveGrad)`}
                stroke="#0891b2"
                strokeWidth="0.8"
              />
              {/* Foam spray droplet */}
              <circle cx={bead.x} cy={bead.y} r="2" fill="#cffafe" />
              <path
                d={`M ${polarToCart(72, a0 + 6).x} ${polarToCart(72, a0 + 6).y} Q ${polarToCart(82, a1).x} ${polarToCart(82, a1).y} ${polarToCart(84, a1 + 6).x} ${polarToCart(84, a1 + 6).y}`}
                fill="none"
                stroke="#67e8f9"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            </g>
          );
        });

        return (
          <>
            <defs>
              <linearGradient id={`${uid}_cyanWaveGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="45%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
              <radialGradient id={`${uid}_cyanAura`} cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0" />
                <stop offset="85%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Glowing Cyan Aura */}
            <circle cx="100" cy="100" r="90" fill={`url(#${uid}_cyanAura)`} className="animate-pulse-glow" />

            {/* Lapisan Luar: Ukiran Ombak Mengalir Berputar Pelan */}
            <g className="animate-spin-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              <circle cx="100" cy="100" r="69" fill="none" stroke="#0891b2" strokeWidth="1.2" />
              {waves}
            </g>

            {/* Lapisan Dalam Berputar Berlawanan: 8 Water Spirals */}
            <g className="animate-spin-reverse-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              <circle cx="100" cy="100" r="56" fill="none" stroke="#22d3ee" strokeWidth="0.8" strokeDasharray="4 2" />
              {Array.from({ length: 8 }).map((_, i) => {
                const deg = (i * 360) / 8;
                const p1 = polarToCart(58, deg);
                const p2 = polarToCart(63, deg + 14);
                return (
                  <path
                    key={`spiral_${i}`}
                    d={`M ${p1.x} ${p1.y} Q ${polarToCart(64, deg + 7).x} ${polarToCart(64, deg + 7).y} ${p2.x} ${p2.y}`}
                    fill="none"
                    stroke="#a5f3fc"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>

            {/* Water Flow Shimmer */}
            <g className="animate-pulse-glow" style={{ willChange: 'opacity' }}>
              {[0, 90, 180, 270].map((deg) => {
                const p = polarToCart(88, deg);
                return <circle key={`drop_${deg}`} cx={p.x} cy={p.y} r="1.6" fill="#ffffff" />;
              })}
            </g>
          </>
        );
      }

      /* ========================================================
       * 4. C-RANK: KECUBUNG (Kelopak kristal runcing, bintang kecil berkelip)
       * ======================================================== */
      case 'C-Rank Terencana': {
        const facetCount = 12;
        const crystalFacets = Array.from({ length: facetCount }).map((_, i) => {
          const aCenter = (i * 360) / facetCount;
          const aLeft = aCenter - 15;
          const aRight = aCenter + 15;
          const pTip = polarToCart(93, aCenter);
          const pValleyLeft = polarToCart(68, aLeft);
          const pValleyRight = polarToCart(68, aRight);
          const pMidBase = polarToCart(64, aCenter);

          return (
            <g key={`crystal_${i}`}>
              {/* Left facet (light highlight) */}
              <polygon
                points={`${pTip.x},${pTip.y} ${pValleyLeft.x},${pValleyLeft.y} ${pMidBase.x},${pMidBase.y}`}
                fill={`url(#${uid}_amethystLight)`}
                stroke="#6d28d9"
                strokeWidth="0.5"
              />
              {/* Right facet (rich shadow) */}
              <polygon
                points={`${pTip.x},${pTip.y} ${pValleyRight.x},${pValleyRight.y} ${pMidBase.x},${pMidBase.y}`}
                fill={`url(#${uid}_amethystDark)`}
                stroke="#5b21b6"
                strokeWidth="0.5"
              />
              {/* Crystal ridge line */}
              <line x1={pTip.x} y1={pTip.y} x2={pMidBase.x} y2={pMidBase.y} stroke="#e9d5ff" strokeWidth="0.8" opacity="0.9" />
              {/* Pointed jewel bead on tip */}
              <circle cx={pTip.x} cy={pTip.y} r="1.5" fill="#f5d0fe" />
            </g>
          );
        });

        return (
          <>
            <defs>
              <linearGradient id={`${uid}_amethystLight`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e9d5ff" />
                <stop offset="40%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id={`${uid}_amethystDark`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="60%" stopColor="#6d28d9" />
                <stop offset="100%" stopColor="#4c1d95" />
              </linearGradient>
              <radialGradient id={`${uid}_amethystAura`} cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="#7c3aed" stopOpacity="0" />
                <stop offset="85%" stopColor="#a855f7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Glowing Amethyst Aura */}
            <circle cx="100" cy="100" r="92" fill={`url(#${uid}_amethystAura)`} className="animate-pulse-glow" />

            {/* Lapisan Luar: 12 Kelopak Kristal Runcing Berputar Pelan */}
            <g className="animate-spin-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              <circle cx="100" cy="100" r="68" fill="none" stroke="#7c3aed" strokeWidth="1.2" />
              {crystalFacets}
            </g>

            {/* Lapisan Dalam Berputar Berlawanan: Cincin Kristal Oktagonal */}
            <g className="animate-spin-reverse-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              <circle cx="100" cy="100" r="56" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="3 2" />
              {Array.from({ length: 12 }).map((_, i) => {
                const pos = polarToCart(58, (i * 360) / 12);
                return <circle key={`gem_${i}`} cx={pos.x} cy={pos.y} r="1.6" fill="#f3e8ff" stroke="#7c3aed" strokeWidth="0.5" />;
              })}
            </g>

            {/* Bintang-Bintang Kecil Berkelip (Twinkling Stars) */}
            <g className="animate-pulse-glow" style={{ willChange: 'opacity' }}>
              {Array.from({ length: 8 }).map((_, i) => {
                const deg = (i * 360) / 8 + 22.5;
                const p = polarToCart(86, deg);
                return (
                  <path
                    key={`star_${i}`}
                    d={`M ${p.x} ${p.y - 4.5} Q ${p.x} ${p.y} ${p.x + 4.5} ${p.y} Q ${p.x} ${p.y} ${p.x} ${p.y + 4.5} Q ${p.x} ${p.y} ${p.x - 4.5} ${p.y} Z`}
                    fill="#ffffff"
                    opacity="0.9"
                  />
                );
              })}
            </g>
          </>
        );
      }

      /* ========================================================
       * 5. B-RANK: DELIMA (Lidah api mengelilingi cincin, nyala berkedip)
       * ======================================================== */
      case 'B-Rank Finansial Stabil': {
        const flameCount = 12;
        const flames = Array.from({ length: flameCount }).map((_, i) => {
          const aCenter = (i * 360) / flameCount;
          const isMajor = i % 2 === 0;
          const reach = isMajor ? 95 : 84;
          const aLeft = aCenter - 14;
          const aRight = aCenter + 14;
          const pBaseL = polarToCart(68, aLeft);
          const pBaseR = polarToCart(68, aRight);
          const pTip = polarToCart(reach, aCenter + (isMajor ? 4 : -3));
          const pCurl1 = polarToCart(82, aCenter - 6);
          const pCurl2 = polarToCart(80, aCenter + 8);

          return (
            <g key={`flame_${i}`}>
              {/* Outer licking flame tongue */}
              <path
                d={`M ${pBaseL.x} ${pBaseL.y} C ${pCurl1.x} ${pCurl1.y} ${polarToCart(reach - 6, aCenter - 4).x} ${polarToCart(reach - 6, aCenter - 4).y} ${pTip.x} ${pTip.y} C ${pCurl2.x} ${pCurl2.y} ${polarToCart(74, aRight - 2).x} ${polarToCart(74, aRight - 2).y} ${pBaseR.x} ${pBaseR.y} Z`}
                fill={`url(#${uid}_rubyFlame)`}
                stroke="#9f1239"
                strokeWidth="0.6"
              />
              {/* Inner hotter core flame */}
              <path
                d={`M ${polarToCart(70, aLeft + 4).x} ${polarToCart(70, aLeft + 4).y} Q ${polarToCart(80, aCenter).x} ${polarToCart(80, aCenter).y} ${polarToCart(reach - 8, aCenter + 2).x} ${polarToCart(reach - 8, aCenter + 2).y} Q ${polarToCart(76, aCenter + 4).x} ${polarToCart(76, aCenter + 4).y} ${polarToCart(70, aRight - 4).x} ${polarToCart(70, aRight - 4).y} Z`}
                fill={`url(#${uid}_amberCore)`}
                opacity="0.9"
              />
            </g>
          );
        });

        return (
          <>
            <defs>
              <linearGradient id={`${uid}_rubyFlame`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="35%" stopColor="#f43f5e" />
                <stop offset="75%" stopColor="#be123c" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>
              <linearGradient id={`${uid}_amberCore`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="60%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <radialGradient id={`${uid}_rubyAura`} cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="#be123c" stopOpacity="0" />
                <stop offset="85%" stopColor="#f43f5e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Glowing Flame Aura */}
            <circle cx="100" cy="100" r="92" fill={`url(#${uid}_rubyAura)`} className="animate-pulse-glow" />

            {/* Lapisan Luar: 12 Lidah Api Berputar Pelan */}
            <g className="animate-spin-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              <circle cx="100" cy="100" r="69" fill="none" stroke="#be123c" strokeWidth="1.5" />
              {flames}
            </g>

            {/* Lapisan Dalam Berputar Berlawanan: Cincin Api Berkedip */}
            <g className="animate-spin-reverse-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              <circle cx="100" cy="100" r="56" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 2" />
              {Array.from({ length: 8 }).map((_, i) => {
                const deg = (i * 360) / 8;
                const p1 = polarToCart(58, deg);
                const p2 = polarToCart(63, deg + 12);
                return (
                  <path
                    key={`ember_${i}`}
                    d={`M ${p1.x} ${p1.y} Q ${polarToCart(65, deg + 6).x} ${polarToCart(65, deg + 6).y} ${p2.x} ${p2.y}`}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>

            {/* Floating Ember Sparks */}
            <g className="animate-pulse-glow" style={{ willChange: 'opacity' }}>
              {[15, 75, 135, 195, 255, 315].map((deg) => {
                const p = polarToCart(89, deg);
                return <circle key={`spark_${deg}`} cx={p.x} cy={p.y} r="1.5" fill="#fef08a" />;
              })}
            </g>
          </>
        );
      }

      /* ========================================================
       * 6. A-RANK: EMAS (Mahkota sinar matahari dengan ukiran filigree, kilau menyapu)
       * ======================================================== */
      case 'A-Rank Mandiri Finansial': {
        const crownRays = Array.from({ length: 16 }).map((_, i) => {
          const aCenter = (i * 360) / 16;
          const isMajor = i % 2 === 0;
          const reach = isMajor ? 96 : 84;
          const pTip = polarToCart(reach, aCenter);
          const pBaseL = polarToCart(70, aCenter - 9);
          const pBaseR = polarToCart(70, aCenter + 9);
          const pArchL = polarToCart(78, aCenter - 5);
          const pArchR = polarToCart(78, aCenter + 5);

          return (
            <g key={`sunray_${i}`}>
              {/* Solar Crown Spearhead / Fleur Ray */}
              <path
                d={`M ${pBaseL.x} ${pBaseL.y} C ${pArchL.x} ${pArchL.y} ${polarToCart(reach - 10, aCenter - 4).x} ${polarToCart(reach - 10, aCenter - 4).y} ${pTip.x} ${pTip.y} C ${polarToCart(reach - 10, aCenter + 4).x} ${polarToCart(reach - 10, aCenter + 4).y} ${pArchR.x} ${pArchR.y} ${pBaseR.x} ${pBaseR.y} Z`}
                fill={`url(#${uid}_goldGrad)`}
                stroke="#b45309"
                strokeWidth="0.6"
              />
              {/* Center filigree ridge line */}
              <line x1={pTip.x} y1={pTip.y} x2={polarToCart(70, aCenter).x} y2={polarToCart(70, aCenter).y} stroke="#fef08a" strokeWidth="0.8" />
              {/* Pearl on tip */}
              <circle cx={pTip.x} cy={pTip.y} r={isMajor ? 2.5 : 1.8} fill="#ffffff" stroke="#d97706" strokeWidth="0.6" />
            </g>
          );
        });

        return (
          <>
            <defs>
              <linearGradient id={`${uid}_goldGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="25%" stopColor="#fde68a" />
                <stop offset="55%" stopColor="#f59e0b" />
                <stop offset="85%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>
              <radialGradient id={`${uid}_goldAura`} cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="#d97706" stopOpacity="0" />
                <stop offset="85%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Glowing Golden Solar Aura */}
            <circle cx="100" cy="100" r="92" fill={`url(#${uid}_goldAura)`} className="animate-pulse-glow" />

            {/* Lapisan Luar: Mahkota Sinar Matahari Filigree Berputar Pelan */}
            <g className="animate-spin-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              {/* Scalloped Filigree Arch Ring */}
              <circle cx="100" cy="100" r="70" fill="none" stroke={`url(#${uid}_goldGrad)`} strokeWidth="1.8" />
              {crownRays}
            </g>

            {/* Lapisan Dalam Berputar Berlawanan: Tali Filigree & Butir Emas */}
            <g className="animate-spin-reverse-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              <circle cx="100" cy="100" r="59" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx="100" cy="100" r="55.5" fill="none" stroke="#fbbf24" strokeWidth="0.8" />
              {Array.from({ length: 16 }).map((_, i) => {
                const pos = polarToCart(59, (i * 360) / 16);
                return <circle key={`gdot_${i}`} cx={pos.x} cy={pos.y} r="1.4" fill="#fef08a" stroke="#b45309" strokeWidth="0.4" />;
              })}
            </g>

            {/* Shimmering Golden Sun Glint */}
            <g className="animate-pulse-glow" style={{ willChange: 'opacity' }}>
              {[0, 90, 180, 270].map((deg) => {
                const p = polarToCart(88, deg);
                return (
                  <path
                    key={`gstar_${deg}`}
                    d={`M ${p.x} ${p.y - 5} Q ${p.x} ${p.y} ${p.x + 5} ${p.y} Q ${p.x} ${p.y} ${p.x} ${p.y + 5} Q ${p.x} ${p.y} ${p.x - 5} ${p.y} Z`}
                    fill="#ffffff"
                  />
                );
              })}
            </g>
          </>
        );
      }

      /* ========================================================
       * 7. S-RANK: RODA DELAPAN MAHORAGA (8 Pedang menancap di cincin dengan gagang di luar, emas & ungu)
       * ======================================================== */
      case 'S-Rank Apex Mahoraga': {
        const swordAngles = [0, 45, 90, 135, 180, 225, 270, 315];

        const swords = swordAngles.map((deg, i) => {
          // Sword geometry anchored at degree:
          // The blade pierces the wheel rim (from r=62 to r=76).
          // The crossguard (gagang luar) is at r=77.
          // The grip (tsuka) extends outward from r=79 to r=88.
          // The pommel (kashira ring) is at r=89 to r=97.
          const rad = (deg * Math.PI) / 180;
          const perpRad = rad + Math.PI / 2;

          const pBladeTip = polarToCart(63, deg);
          const pCrossguardCenter = polarToCart(77, deg);
          const pCrossguardL = {
            x: pCrossguardCenter.x + 6.5 * Math.cos(perpRad),
            y: pCrossguardCenter.y + 6.5 * Math.sin(perpRad),
          };
          const pCrossguardR = {
            x: pCrossguardCenter.x - 6.5 * Math.cos(perpRad),
            y: pCrossguardCenter.y - 6.5 * Math.sin(perpRad),
          };

          const pGripEnd = polarToCart(88, deg);
          const pPommelCenter = polarToCart(92.5, deg);

          return (
            <g key={`sword_${i}`}>
              {/* Double-edged Sacred Sword Blade piercing the wheel */}
              <polygon
                points={`${pBladeTip.x},${pBladeTip.y} ${polarToCart(76, deg - 2.5).x},${polarToCart(76, deg - 2.5).y} ${polarToCart(76, deg + 2.5).x},${polarToCart(76, deg + 2.5).y}`}
                fill={`url(#${uid}_swordBlade)`}
                stroke="#6d28d9"
                strokeWidth="0.6"
              />
              {/* Blade center fuller / groove */}
              <line x1={pBladeTip.x} y1={pBladeTip.y} x2={pCrossguardCenter.x} y2={pCrossguardCenter.y} stroke="#fef08a" strokeWidth="0.8" />

              {/* Crossguard (Gagang Luar - Quillon) */}
              <polygon
                points={`${pCrossguardL.x},${pCrossguardL.y} ${pCrossguardR.x},${pCrossguardR.y} ${polarToCart(79, deg).x},${polarToCart(79, deg).y}`}
                fill={`url(#${uid}_mahoragaGold)`}
                stroke="#4c1d95"
                strokeWidth="0.6"
              />
              {/* Gem on center of crossguard */}
              <circle cx={pCrossguardCenter.x} cy={pCrossguardCenter.y} r="1.6" fill="#7c3aed" stroke="#fbbf24" strokeWidth="0.4" />

              {/* Sword Grip / Handle (Gagang Luar) */}
              <line
                x1={pCrossguardCenter.x}
                y1={pCrossguardCenter.y}
                x2={pGripEnd.x}
                y2={pGripEnd.y}
                stroke="#4c1d95"
                strokeWidth="2.8"
                strokeLinecap="square"
              />
              <line
                x1={pCrossguardCenter.x}
                y1={pCrossguardCenter.y}
                x2={pGripEnd.x}
                y2={pGripEnd.y}
                stroke="#fbbf24"
                strokeWidth="2.8"
                strokeDasharray="1.5 1.5"
                strokeLinecap="square"
              />

              {/* Pommel Ring (Cincin Ujung Gagang Mahoraga) */}
              <circle cx={pPommelCenter.x} cy={pPommelCenter.y} r="3.6" fill="none" stroke={`url(#${uid}_mahoragaGold)`} strokeWidth="1.6" />
              <circle cx={pPommelCenter.x} cy={pPommelCenter.y} r="1.2" fill="#7c3aed" />
            </g>
          );
        });

        return (
          <>
            <defs>
              <linearGradient id={`${uid}_mahoragaGold`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="30%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id={`${uid}_swordBlade`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#c4b5fd" />
                <stop offset="80%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#4c1d95" />
              </linearGradient>
              <linearGradient id={`${uid}_mahoragaPurple`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#3b0764" />
              </linearGradient>
              <radialGradient id={`${uid}_mahoragaAura`} cx="50%" cy="50%" r="50%">
                <stop offset="55%" stopColor="#7c3aed" stopOpacity="0" />
                <stop offset="82%" stopColor="#7c3aed" stopOpacity="0.45" />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Glowing Cosmic Aura */}
            <circle cx="100" cy="100" r="94" fill={`url(#${uid}_mahoragaAura)`} className="animate-pulse-glow" />

            {/* LAPISAN 1: Roda Delapan Mahoraga & 8 Pedang (Clockwise Spin) */}
            <g className="animate-spin-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              {/* Sacred Dharmachakra Wheel Outer Heavy Rim */}
              <circle cx="100" cy="100" r="76" fill="none" stroke={`url(#${uid}_mahoragaGold)`} strokeWidth="3" />
              <circle cx="100" cy="100" r="70" fill="none" stroke={`url(#${uid}_mahoragaPurple)`} strokeWidth="4" />
              <circle cx="100" cy="100" r="66" fill="none" stroke={`url(#${uid}_mahoragaGold)`} strokeWidth="1.5" />

              {/* 8 Golden Wheel Studs on the rim */}
              {swordAngles.map((deg) => {
                const p = polarToCart(70, deg + 22.5);
                return <circle key={`stud_${deg}`} cx={p.x} cy={p.y} r="2" fill={`url(#${uid}_mahoragaGold)`} stroke="#4c1d95" strokeWidth="0.5" />;
              })}

              {/* 8 Pedang Menancap dengan Gagang di Luar */}
              {swords}
            </g>

            {/* LAPISAN 2: Sacred Inner Hub & Runes (Counter-Clockwise Spin) */}
            <g className="animate-spin-reverse-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              {/* Inner Rim & 8 Spokes */}
              <circle cx="100" cy="100" r="63" fill="none" stroke={`url(#${uid}_mahoragaGold)`} strokeWidth="1.5" />
              <circle cx="100" cy="100" r="54" fill="none" stroke={`url(#${uid}_mahoragaPurple)`} strokeWidth="1.2" />

              {swordAngles.map((deg) => {
                const p1 = polarToCart(54, deg);
                const p2 = polarToCart(63, deg);
                return <line key={`spoke_${deg}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#fbbf24" strokeWidth="1.2" />;
              })}
            </g>

            {/* Divine Mahoraga Shimmering Flash */}
            <g className="animate-pulse-glow" style={{ willChange: 'opacity' }}>
              {[0, 90, 180, 270].map((deg) => {
                const p = polarToCart(92, deg + 22.5);
                return <circle key={`mspark_${deg}`} cx={p.x} cy={p.y} r="2" fill="#fef08a" />;
              })}
            </g>
          </>
        );
      }

      /* ========================================================
       * 8. DIVINE MAHORAGA: MANDALA BERLAPIS KELOPAK (Spektrum warna ilahi)
       * ======================================================== */
      case 'Divine Mahoraga': {
        const outerPetalCount = 16;
        const outerMandalaPetals = Array.from({ length: outerPetalCount }).map((_, i) => {
          const aCenter = (i * 360) / outerPetalCount;
          const aL = aCenter - 11;
          const aR = aCenter + 11;
          const pTip = polarToCart(96, aCenter);
          const pBaseL = polarToCart(68, aL);
          const pBaseR = polarToCart(68, aR);
          const pMidL = polarToCart(82, aCenter - 8);
          const pMidR = polarToCart(82, aCenter + 8);

          return (
            <g key={`dpetal_${i}`}>
              {/* Scalloped Lotus Petal Arch */}
              <path
                d={`M ${pBaseL.x} ${pBaseL.y} Q ${pMidL.x} ${pMidL.y} ${pTip.x} ${pTip.y} Q ${pMidR.x} ${pMidR.y} ${pBaseR.x} ${pBaseR.y} Z`}
                fill={`url(#${uid}_spectrumGrad)`}
                stroke="#ffffff"
                strokeWidth="0.6"
                opacity="0.9"
              />
              {/* Inner lace teardrop filigree */}
              <path
                d={`M ${polarToCart(74, aCenter).x} ${polarToCart(74, aCenter).y} Q ${polarToCart(84, aCenter).x} ${polarToCart(84, aCenter).y} ${polarToCart(88, aCenter).x} ${polarToCart(88, aCenter).y}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
              <circle cx={pTip.x} cy={pTip.y} r="1.6" fill="#ffffff" />
            </g>
          );
        });

        const innerPetalCount = 8;
        const innerPetals = Array.from({ length: innerPetalCount }).map((_, i) => {
          const aCenter = (i * 360) / innerPetalCount;
          const aL = aCenter - 22;
          const aR = aCenter + 22;
          const pTip = polarToCart(68, aCenter);
          const pBaseL = polarToCart(54, aL);
          const pBaseR = polarToCart(54, aR);

          return (
            <path
              key={`inpet_${i}`}
              d={`M ${pBaseL.x} ${pBaseL.y} Q ${polarToCart(62, aCenter - 10).x} ${polarToCart(62, aCenter - 10).y} ${pTip.x} ${pTip.y} Q ${polarToCart(62, aCenter + 10).x} ${polarToCart(62, aCenter + 10).y} ${pBaseR.x} ${pBaseR.y} Z`}
              fill={`url(#${uid}_spectrumGrad)`}
              stroke="#ffffff"
              strokeWidth="0.6"
              opacity="0.85"
            />
          );
        });

        return (
          <>
            <defs>
              <linearGradient id={`${uid}_spectrumGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="25%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="75%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <radialGradient id={`${uid}_divineAura`} cx="50%" cy="50%" r="50%">
                <stop offset="55%" stopColor="#c084fc" stopOpacity="0" />
                <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Glowing Divine Spectrum Aura */}
            <circle cx="100" cy="100" r="95" fill={`url(#${uid}_divineAura)`} className="animate-pulse-glow" />

            {/* LAPISAN 1: Mandala 16 Kelopak Berputar Pelan dengan Spektrum Pelangi */}
            <g className="animate-spin-smooth animate-rainbow" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              <circle cx="100" cy="100" r="69" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" />
              {outerMandalaPetals}
            </g>

            {/* LAPISAN 2: Mandala Kelopak Dalam Berputar Berlawanan Arah */}
            <g className="animate-spin-reverse-smooth" style={{ transformOrigin: '100px 100px', willChange: 'transform' }}>
              <circle cx="100" cy="100" r="54" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
              {innerPetals}
            </g>

            {/* Celestial Stars Sparkle */}
            <g className="animate-pulse-glow" style={{ willChange: 'opacity' }}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const p = polarToCart(90, deg);
                return <circle key={`divspark_${deg}`} cx={p.x} cy={p.y} r="1.6" fill="#ffffff" />;
              })}
            </g>
          </>
        );
      }
    }
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative inline-flex items-center justify-center select-none ${boxDim} ${
        sparkleEffect
          ? 'ring-4 ring-amber-400/90 ring-offset-2 ring-offset-[#15132f] rounded-full animate-pulse shadow-[0_0_24px_rgba(251,191,36,0.85)]'
          : ''
      } ${
        onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
      } ${className}`}
      title={tier}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-md overflow-visible"
        style={{ willChange: 'transform' }}
      >
        <defs>
          {/* Circular Clip for Center 1:1 Photo (Radius 50) */}
          <clipPath id={`${uid}_photoClip`}>
            <circle cx="100" cy="100" r="50" />
          </clipPath>

          {/* Central Bezel Gradient */}
          <linearGradient id={`${uid}_centerBezel`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* ========================================================
         * 1. THE LAYERED ORNAMENT SYSTEM (Specific per Rank)
         * ======================================================== */}
        {renderRankOrnament()}

        {/* ========================================================
         * 2. CENTRAL PHOTO BASE / MATTING & 1:1 IMAGE
         * ======================================================== */}
        {/* Dark Background behind photo */}
        <circle cx="100" cy="100" r="50" fill="#121028" />

        {/* The Clipped Profile Photo or Initial */}
        <g clipPath={`url(#${uid}_photoClip)`}>
          {avatar && avatar.trim().length > 2 ? (
            <image
              href={avatar}
              x="50"
              y="50"
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <>
              <circle cx="100" cy="100" r="50" fill="#181534" />
              <text
                x="100"
                y="112"
                textAnchor="middle"
                fill="#f2f0ff"
                fontSize="38"
                fontWeight="800"
                fontFamily="Space Grotesk, system-ui, sans-serif"
                style={{ userSelect: 'none' }}
              >
                {initial}
              </text>
            </>
          )}
        </g>

        {/* Inner Bezel Ring Framing the 1:1 Photo */}
        <circle
          cx="100"
          cy="100"
          r="50"
          fill="none"
          stroke={`url(#${uid}_centerBezel)`}
          strokeWidth="2.5"
        />
        <circle
          cx="100"
          cy="100"
          r="51.5"
          fill="none"
          stroke="#000000"
          strokeWidth="1"
          opacity="0.45"
        />
      </svg>

      {/* Online indicator / Level indicator */}
      {showLevelBadge && typeof level === 'number' && (
        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono bg-[#15132f] text-emerald-400 border border-emerald-400/50 shadow-md z-20">
          Lv.{level}
        </span>
      )}
    </div>
  );
};
