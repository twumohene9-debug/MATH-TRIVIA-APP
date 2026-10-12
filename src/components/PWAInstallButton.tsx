import React, { useState } from 'react';
import { Download, Share2, X, CheckCircle, Smartphone } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'prominent' | 'card';
  isBright?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact',
  isBright = true,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'prominent') {
      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-pink-600/20 hover:opacity-95 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
        </button>
      );
    }

    if (variant === 'card') {
      return (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
            isBright
              ? 'bg-gradient-to-r from-indigo-50/70 to-pink-50/60 border-indigo-200 text-slate-800'
              : 'bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border-indigo-900/60 text-slate-100'
          } ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-pink-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold leading-tight">Install Math Mastery App</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Play offline anytime on your home screen</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>
      );
    }

    // Default compact button (in TopBar / Navbar)
    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        title="Install Math Mastery on this device"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-xs ${
          isBright
            ? 'bg-white hover:bg-slate-50 text-indigo-700 border-indigo-200 shadow-indigo-100'
            : 'bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border-indigo-800/80 shadow-black/20'
        } ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-pink-600" />
        <span className="hidden sm:inline">Install</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="Install Math Mastery on iPhone or iPad"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
            isBright
              ? 'bg-white hover:bg-slate-50 text-indigo-700 border-indigo-200'
              : 'bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border-indigo-800/80'
          } ${className}`}
        >
          <Share2 className="w-3.5 h-3.5 text-pink-600" />
          <span className="hidden sm:inline">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div
              className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl border ${
                isBright ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#12173f] border-indigo-900 text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold font-display">Install on iOS / Safari</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="w-5 h-5 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    Tap the <strong>Share</strong> button <Share2 className="w-3 h-3 inline mx-0.5 text-pink-600" /> in the bottom toolbar of Safari.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="w-5 h-5 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="w-5 h-5 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    Tap <strong>Add</strong> in the top-right corner. The app will launch like a native application!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  const [showDesktopGuide, setShowDesktopGuide] = useState(false);

  // Fallback for browsers where beforeinstallprompt hasn't fired yet or desktop browser
  return (
    <>
      <button
        onClick={() => setShowDesktopGuide(true)}
        title="Install Math Mastery"
        className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
          isBright
            ? 'bg-white hover:bg-slate-50 text-indigo-700 border-indigo-200'
            : 'bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border-indigo-800/80'
        } ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-pink-600" />
        <span className="hidden sm:inline">Install</span>
      </button>

      {showDesktopGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div
            className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl border ${
              isBright ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#12173f] border-indigo-900 text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold font-display">Install Math Mastery</h3>
              </div>
              <button
                onClick={() => setShowDesktopGuide(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="w-5 h-5 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <p>
                  Look at the right side of your browser's <strong>address bar</strong> (URL bar).
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="w-5 h-5 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </div>
                <p>
                  Click the <strong>Install App</strong> icon (or choose <strong>Install Math Mastery</strong> in the browser menu).
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="w-5 h-5 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <p>
                  Confirm <strong>Install</strong> to launch Math Mastery in its own window offline!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDesktopGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95 transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallButton;
