import React, { useState, useEffect } from 'react';
import { User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import MathMasteryLogo from './MathMasteryLogo';

interface NameEntryModalProps {
  currentName: string;
  isOpen: boolean;
  onSaveName: (name: string) => void;
  onClose?: () => void;
  isBright?: boolean;
}

export const NameEntryModal: React.FC<NameEntryModalProps> = ({
  currentName,
  isOpen,
  onSaveName,
  onClose,
  isBright = true,
}) => {
  const [nameInput, setNameInput] = useState<string>(currentName || '');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setNameInput(currentName || '');
      setError('');
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError('Please enter your name or nickname to proceed.');
      return;
    }
    if (trimmed.length > 25) {
      setError('Name must be 25 characters or fewer.');
      return;
    }
    setError('');
    onSaveName(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border transition-all ${
          isBright
            ? 'bg-white border-slate-200/90 text-slate-900 shadow-indigo-950/15'
            : 'bg-[#12173f] border-indigo-900/70 text-white shadow-black/50'
        }`}
      >
        {/* Top Accent Stripe */}
        <div className="theme-stripes-top w-full" />

        <div className="p-6 sm:p-7 text-center flex flex-col items-center">
          <MathMasteryLogo size="md" isBright={isBright} className="mb-3" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 bg-pink-100 text-pink-700 border border-pink-200">
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            <span>Mathematician Profile</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold font-display mb-1.5">
            {currentName ? 'Update Your Name' : 'Welcome to Math Mastery!'}
          </h3>

          <p
            className={`text-xs sm:text-sm max-w-sm mb-5 leading-relaxed ${
              isBright ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Please enter your name or title. You will be addressed personally across all 100 stages, challenges, certificates, and achievements!
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4 text-pink-500" />
              </div>
              <input
                type="text"
                autoFocus
                value={nameInput}
                onChange={e => {
                  setNameInput(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter your name (e.g. Alex, Euler, Ada)"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/40 transition-colors ${
                  isBright
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                    : 'bg-slate-900/80 border-indigo-900/80 text-white placeholder-slate-500 focus:bg-slate-900'
                }`}
                maxLength={25}
              />
            </div>

            {error && (
              <p className="text-xs text-rose-500 font-semibold text-left flex items-center gap-1">
                {error}
              </p>
            )}

            <div className="flex items-center gap-2 pt-2">
              {currentName && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                    isBright
                      ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-700 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{currentName ? 'Save Name' : 'Begin Adventure'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div
            className={`mt-4 pt-3 border-t w-full text-[11px] flex items-center justify-center gap-1.5 ${
              isBright ? 'border-slate-100 text-slate-400' : 'border-slate-800 text-slate-500'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Saved securely in your local browser profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NameEntryModal;
