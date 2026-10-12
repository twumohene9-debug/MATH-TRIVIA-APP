import React, { useState } from 'react';
import { Volume2, VolumeX, Settings, HelpCircle, Compass, Award, BarChart2, Shield, Sun, Moon, Swords, User, Edit3, Menu, X, BookOpen } from 'lucide-react';
import { UserProgress } from '../types';
import MathMasteryLogo from './MathMasteryLogo';
import PWAInstallButton from './PWAInstallButton';

export type ScreenView = 'home' | 'stagemap' | 'levelmap' | 'game' | 'progress' | 'achievements' | 'admin' | 'challenge' | 'parts';

interface TopBarProps {
  currentView: ScreenView;
  onNavigate: (view: ScreenView) => void;
  progress: UserProgress;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenNameModal?: () => void;
  onToggleSound: () => void;
  onToggleTimed: (isTimed: boolean) => void;
  onToggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onNavigate,
  progress,
  onOpenSettings,
  onOpenHelp,
  onOpenNameModal,
  onToggleSound,
  onToggleTimed,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isBright = progress.settings.theme !== 'royal';
  const playerName = progress.playerName || 'Mathematician';

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors ${
        isBright
          ? 'bg-white/95 border-slate-200 shadow-xs'
          : 'bg-[#0f1438]/95 border-indigo-950/80'
      }`}
    >
      {/* Decorative top stripe from logo */}
      <div className="theme-stripes-top w-full" />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5">
        {/* Zone 1: Single text element wordmark with logo */}
        <button
          onClick={() => onNavigate('home')}
          className="text-left group cursor-pointer focus:outline-none flex items-center gap-2.5"
        >
          <MathMasteryLogo size="sm" isBright={isBright} />
          <span
            className={`text-lg sm:text-xl font-extrabold tracking-tight font-display transition-colors ${
              isBright ? 'text-[#161c4f] group-hover:text-pink-600' : 'text-white group-hover:text-pink-400'
            }`}
          >
            Math Mastery
          </span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors cursor-pointer ${
              currentView === 'home'
                ? isBright
                  ? 'text-pink-600 font-bold border-b-2 border-pink-600 pb-0.5'
                  : 'text-pink-400 font-bold border-b-2 border-pink-400 pb-0.5'
                : isBright
                ? 'text-slate-600 hover:text-[#161c4f]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('stagemap')}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'stagemap' || currentView === 'levelmap'
                ? isBright
                  ? 'text-pink-600 font-bold border-b-2 border-pink-600 pb-0.5'
                  : 'text-pink-400 font-bold border-b-2 border-pink-400 pb-0.5'
                : isBright
                ? 'text-slate-600 hover:text-[#161c4f]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            Stage Map
          </button>
          <button
            onClick={() => onNavigate('parts')}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'parts'
                ? isBright
                  ? 'text-pink-600 font-bold border-b-2 border-pink-600 pb-0.5'
                  : 'text-pink-400 font-bold border-b-2 border-pink-400 pb-0.5'
                : isBright
                ? 'text-slate-600 hover:text-[#161c4f]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            10 Parts Quiz
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
              Open
            </span>
          </button>
          <button
            onClick={() => onNavigate('challenge')}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'challenge'
                ? isBright
                  ? 'text-pink-600 font-bold border-b-2 border-pink-600 pb-0.5'
                  : 'text-pink-400 font-bold border-b-2 border-pink-400 pb-0.5'
                : isBright
                ? 'text-slate-600 hover:text-[#161c4f]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Swords className="w-4 h-4 text-pink-500" />
            Challenge
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono-numbers bg-pink-100 text-pink-700 font-bold border border-pink-200">
              Lvl {progress.challengeLevel || 1}
            </span>
          </button>
          <button
            onClick={() => onNavigate('progress')}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'progress'
                ? isBright
                  ? 'text-pink-600 font-bold border-b-2 border-pink-600 pb-0.5'
                  : 'text-pink-400 font-bold border-b-2 border-pink-400 pb-0.5'
                : isBright
                ? 'text-slate-600 hover:text-[#161c4f]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Progress
          </button>
          <button
            onClick={() => onNavigate('achievements')}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'achievements'
                ? isBright
                  ? 'text-pink-600 font-bold border-b-2 border-pink-600 pb-0.5'
                  : 'text-pink-400 font-bold border-b-2 border-pink-400 pb-0.5'
                : isBright
                ? 'text-slate-600 hover:text-[#161c4f]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            Badges
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'admin'
                ? isBright
                  ? 'text-pink-600 font-bold border-b-2 border-pink-600 pb-0.5'
                  : 'text-pink-400 font-bold border-b-2 border-pink-400 pb-0.5'
                : isBright
                ? 'text-slate-600 hover:text-[#161c4f]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Direct Segmented Toggle for Timed / Untimed (120s) - visible on md+ */}
          <div
            className={`hidden md:flex items-center p-0.5 rounded-lg border ${
              isBright
                ? 'bg-slate-100 border-slate-200'
                : 'bg-slate-900 border-indigo-900/60'
            }`}
          >
            <button
              onClick={() => onToggleTimed(false)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                !progress.settings.isTimed
                  ? isBright
                    ? 'bg-[#161c4f] text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : isBright
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Untimed
            </button>
            <button
              onClick={() => onToggleTimed(true)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                progress.settings.isTimed
                  ? 'bg-pink-600 text-white shadow-xs'
                  : isBright
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              120s Timed
            </button>
          </div>

          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            title={isBright ? 'Switch to Royal Indigo Mode' : 'Switch to Joyful Bright Mode'}
            className={`p-2 rounded-lg transition-colors cursor-pointer border ${
              isBright
                ? 'text-slate-600 hover:text-[#161c4f] hover:bg-slate-100 border-slate-200'
                : 'text-slate-300 hover:text-white hover:bg-indigo-950 border-indigo-900/60'
            }`}
            aria-label="Toggle theme"
          >
            {isBright ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={progress.settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className={`p-2 rounded-lg transition-colors cursor-pointer border ${
              isBright
                ? 'text-slate-600 hover:text-[#161c4f] hover:bg-slate-100 border-slate-200'
                : 'text-slate-300 hover:text-white hover:bg-indigo-950 border-indigo-900/60'
            }`}
            aria-label="Toggle Sound"
          >
            {progress.settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-pink-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Player Name Profile Button - on larger screens */}
          {onOpenNameModal && (
            <button
              onClick={onOpenNameModal}
              title={`Mathematician: ${playerName}. Click to change name.`}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                isBright
                  ? 'bg-slate-50 hover:bg-pink-50 border-slate-200 text-slate-700 hover:text-pink-600 hover:border-pink-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-indigo-900/60 text-slate-300 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 text-pink-600 shrink-0" />
              <span className="max-w-[90px] sm:max-w-[120px] truncate">{progress.playerName || 'Name'}</span>
              <Edit3 className="w-3 h-3 text-slate-400 shrink-0" />
            </button>
          )}

          {/* PWA In-App Install Button */}
          <PWAInstallButton isBright={isBright} />

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="Settings"
            className={`hidden sm:flex p-2 rounded-lg transition-colors cursor-pointer border ${
              isBright
                ? 'text-slate-600 hover:text-[#161c4f] hover:bg-slate-100 border-slate-200'
                : 'text-slate-300 hover:text-white hover:bg-indigo-950 border-indigo-900/60'
            }`}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Mobile Menu Hamburger Trigger */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className={`md:hidden p-2 rounded-lg transition-colors cursor-pointer border ${
              isBright
                ? 'text-slate-600 hover:text-[#161c4f] hover:bg-slate-100 border-slate-200'
                : 'text-slate-300 hover:text-white hover:bg-indigo-950 border-indigo-900/60'
            }`}
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t px-4 py-4 space-y-3 transition-colors ${
            isBright ? 'bg-white border-slate-200' : 'bg-[#0f1438] border-indigo-950'
          }`}
        >
          {/* User profile card & name change */}
          {onOpenNameModal && (
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenNameModal();
              }}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                isBright ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-indigo-900/60 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center font-bold text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold">{playerName}</div>
                  <div className="text-[10px] text-slate-500">Tap to edit name</div>
                </div>
              </div>
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}

          {/* Timed mode toggle on mobile */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-slate-500">Timer Mode:</span>
            <div
              className={`flex items-center p-0.5 rounded-lg border ${
                isBright ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-indigo-900/60'
              }`}
            >
              <button
                onClick={() => onToggleTimed(false)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  !progress.settings.isTimed
                    ? isBright
                      ? 'bg-[#161c4f] text-white'
                      : 'bg-indigo-600 text-white'
                    : 'text-slate-500'
                }`}
              >
                Untimed
              </button>
              <button
                onClick={() => onToggleTimed(true)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  progress.settings.isTimed
                    ? 'bg-pink-600 text-white'
                    : 'text-slate-500'
                }`}
              >
                120s Timed
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('home');
              }}
              className={`p-2.5 rounded-xl border text-left font-semibold transition-colors ${
                currentView === 'home'
                  ? 'bg-pink-50 border-pink-300 text-pink-700'
                  : isBright
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('stagemap');
              }}
              className={`p-2.5 rounded-xl border text-left font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'stagemap' || currentView === 'levelmap'
                  ? 'bg-pink-50 border-pink-300 text-pink-700'
                  : isBright
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-pink-600" />
              Stage Map
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('parts');
              }}
              className={`p-2.5 rounded-xl border text-left font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'parts'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : isBright
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              10 Parts Quiz
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('challenge');
              }}
              className={`p-2.5 rounded-xl border text-left font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'challenge'
                  ? 'bg-pink-50 border-pink-300 text-pink-700'
                  : isBright
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-pink-600" />
              Challenges
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('progress');
              }}
              className={`p-2.5 rounded-xl border text-left font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'progress'
                  ? 'bg-pink-50 border-pink-300 text-pink-700'
                  : isBright
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-pink-600" />
              Progress
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('achievements');
              }}
              className={`p-2.5 rounded-xl border text-left font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'achievements'
                  ? 'bg-pink-50 border-pink-300 text-pink-700'
                  : isBright
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-pink-600" />
              Badges
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('admin');
              }}
              className={`p-2.5 rounded-xl border text-left font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'admin'
                  ? 'bg-pink-50 border-pink-300 text-pink-700'
                  : isBright
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-pink-600" />
              Admin
            </button>
          </div>

          {/* Quick Help & Settings button row */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenHelp();
              }}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300"
            >
              <HelpCircle className="w-3.5 h-3.5 text-pink-600" />
              How to Play
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSettings();
              }}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300"
            >
              <Settings className="w-3.5 h-3.5 text-pink-600" />
              Settings
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;
