import React from 'react';

interface MathMasteryLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  isBright?: boolean;
}

/**
 * Math Mastery Personal Logo Emblem
 * Inspired by the user's personal logo:
 * - Royal Midnight Navy (#161c4f / #1e266d)
 * - Radiant Magenta & Fuchsia (#ec4899 / #db2777)
 * - Electric Indigo & Violet (#4f46e5 / #6366f1)
 * - Geometric Hexagonal Crest with Mathematical Infinity / Möbius curves and M² monogram
 */
export const MathMasteryLogo: React.FC<MathMasteryLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  isBright = true,
}) => {
  const sizeMap = {
    sm: { box: 32, icon: 'w-8 h-8', text: 'text-base', sub: 'text-[10px]' },
    md: { box: 44, icon: 'w-11 h-11', text: 'text-xl', sub: 'text-xs' },
    lg: { box: 64, icon: 'w-16 h-16', text: 'text-2xl sm:text-3xl', sub: 'text-sm' },
    xl: { box: 96, icon: 'w-24 h-24', text: 'text-4xl sm:text-5xl', sub: 'text-base' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* SVG Geometric Crest Logo */}
      <div className={`relative ${dim.icon} shrink-0 select-none group`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Logo Primary Gradient: Deep Royal Navy to Electric Indigo */}
            <linearGradient id="logoNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#161c4f" />
              <stop offset="50%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>

            {/* Logo Magenta Radiant Gradient */}
            <linearGradient id="logoMagentaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>

            {/* Gold Accent for Mastery Star */}
            <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Soft Ambient Glow Filter */}
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ec4899" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Hexagonal Outer Frame */}
          <polygon
            points="50,4 92,27 92,73 50,96 8,73 8,27"
            fill="url(#logoNavyGrad)"
            stroke="url(#logoMagentaGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Geometric Mathematical Lattice Facets */}
          <polygon
            points="50,14 84,33 84,67 50,86 16,67 16,33"
            fill="#0f143a"
            stroke="rgba(236, 72, 153, 0.4)"
            strokeWidth="1.5"
          />

          {/* Dynamic Mathematical Möbius / Ribbon Arc in Radiant Magenta */}
          <path
            d="M26,62 C26,40 50,30 50,50 C50,70 74,60 74,38"
            stroke="url(#logoMagentaGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Opposing Cross Arc in Electric Cyan/Violet */}
          <path
            d="M74,62 C74,40 50,30 50,50 C50,70 26,60 26,38"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="2 3"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />

          {/* Center Monogram: M with superscript 2 (M²) */}
          <text
            x="44"
            y="57"
            fontFamily="'Fraunces', Georgia, serif"
            fontSize="26"
            fontWeight="900"
            fill="#ffffff"
            textAnchor="middle"
          >
            M
          </text>
          <text
            x="64"
            y="43"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="14"
            fontWeight="bold"
            fill="url(#logoGoldGrad)"
          >
            ²
          </text>

          {/* Decorative Corner Stars */}
          <circle cx="50" cy="8" r="2.5" fill="#facc15" />
          <circle cx="90" cy="50" r="2" fill="#ec4899" />
          <circle cx="10" cy="50" r="2" fill="#38bdf8" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-display font-extrabold tracking-tight ${dim.text} ${
                isBright ? 'text-[#161c4f]' : 'text-white'
              }`}
            >
              Math Mastery
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-mono-numbers shadow-xs">
              PRO
            </span>
          </div>
          <span
            className={`font-medium tracking-wide ${dim.sub} ${
              isBright ? 'text-slate-500' : 'text-indigo-200/80'
            }`}
          >
            The Ultimate Mathematics Adventure
          </span>
        </div>
      )}
    </div>
  );
};

export default MathMasteryLogo;
