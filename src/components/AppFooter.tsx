import React from 'react';
import { Sparkles, HelpCircle, ChevronRight } from 'lucide-react';

interface AppFooterProps {
  onOpenAuthor: () => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({ onOpenAuthor }) => {
  return (
    <footer
      className="w-full bg-[#f6ad0a] text-[#0b0f2a] py-2.5 px-4 sm:px-6 md:px-8 border-t border-amber-600/30 relative z-20 shadow-inner select-none transition-colors"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-[13px]">
        {/* Left Side: Brand, Scripture Copyright, Designer & Version Pill */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1.5 font-bold tracking-tight text-center md:text-left">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#0b0f2a] fill-[#0b0f2a]/15 shrink-0" />
            <span className="font-display font-extrabold text-[#0b0f2a]">
              &copy; 2026 - The joy of the Lord is my strength. All rights reserved.
            </span>
          </div>

          <span className="text-[#0b0f2a]/70 font-black hidden sm:inline" aria-hidden="true">
            •
          </span>

          <span className="font-display font-extrabold text-[#0b0f2a]">
            Designed by <span className="underline decoration-[#0b0f2a]/40 decoration-1 underline-offset-2">Bismark Twum, MPhil</span>
          </span>

          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-extrabold bg-[#0b0f2a] text-[#fbbf24] shadow-xs tracking-wide"
            title="Math Mastery Version 2.5.0"
          >
            v2.5.0
          </span>
        </div>

        {/* Right Side: About the Author Button matching user specifications */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAuthor}
            title="Biography & Profile of Bismark Twum"
            aria-label="About the Author: Bismark Twum"
            className="group px-4 py-1.5 sm:py-2 rounded-full bg-[#0b0f2a] hover:bg-[#161c4f] text-[#fbbf24] hover:text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-black/10 transition-all cursor-pointer active:scale-98"
          >
            <HelpCircle className="w-4 h-4 text-[#fbbf24] group-hover:scale-110 transition-transform shrink-0" />
            <span className="tracking-tight font-sans">About the Author</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#fbbf24] group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
