import React, { useState } from 'react';
import { X, Volume2, Clock, Compass, Download, Upload, Trash2, CheckCircle2, Palette } from 'lucide-react';
import { UserProgress } from '../types';
import { exportSaveData, importSaveData, resetSaveData, saveProgress } from '../engine/storage';
import { sounds } from '../engine/soundEffects';

interface SettingsModalProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  progress,
  onUpdateProgress,
  onClose,
}) => {
  const [importJson, setImportJson] = useState<string>('');
  const [showImportBox, setShowImportBox] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [resetConfirm, setResetConfirm] = useState<boolean>(false);
  const isBright = progress.settings.theme !== 'royal';

  const handleToggleTimed = () => {
    const updated: UserProgress = {
      ...progress,
      settings: { ...progress.settings, isTimed: !progress.settings.isTimed },
    };
    saveProgress(updated);
    onUpdateProgress(updated);
  };

  const handleToggleTheme = () => {
    const nextTheme = progress.settings.theme === 'royal' ? 'bright' : 'royal';
    const updated: UserProgress = {
      ...progress,
      settings: { ...progress.settings, theme: nextTheme },
    };
    saveProgress(updated);
    onUpdateProgress(updated);
  };

  const handleToggleSound = () => {
    const nextState = !progress.settings.soundEnabled;
    sounds.enabled = nextState;
    const updated: UserProgress = {
      ...progress,
      settings: { ...progress.settings, soundEnabled: nextState },
    };
    saveProgress(updated);
    onUpdateProgress(updated);
  };

  const handleToggleExplorer = () => {
    const updated: UserProgress = {
      ...progress,
      settings: { ...progress.settings, explorerMode: !progress.settings.explorerMode },
    };
    saveProgress(updated);
    onUpdateProgress(updated);
  };

  const handleExport = () => {
    const dataStr = exportSaveData();
    navigator.clipboard.writeText(dataStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleImportSubmit = () => {
    if (!importJson.trim()) return;
    const success = importSaveData(importJson);
    if (success) {
      window.location.reload();
    } else {
      alert('Invalid JSON format.');
    }
  };

  const handleReset = () => {
    const fresh = resetSaveData();
    onUpdateProgress(fresh);
    setResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className={`border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 ${
          isBright ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#12173f] border-indigo-900/60 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b pb-3 mb-5 ${
            isBright ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <h2 className={`text-lg font-bold font-display ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
            Adventure Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isBright ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-3.5 text-xs">
          {/* Timed Mode Toggle (120s vs Untimed) */}
          <div
            className={`flex items-center justify-between p-3.5 rounded-2xl border ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-pink-600" />
              <div>
                <span className={`font-bold block ${isBright ? 'text-[#161c4f]' : 'text-slate-200'}`}>
                  Timed Mode (120 Seconds)
                </span>
                <span className="text-[11px] text-slate-500">
                  {progress.settings.isTimed
                    ? '120 seconds per question active'
                    : 'Disabled by default (Untimed / Relaxed)'}
                </span>
              </div>
            </div>
            <button
              onClick={handleToggleTimed}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                progress.settings.isTimed ? 'bg-pink-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-xs ${
                  progress.settings.isTimed ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Theme Palette Toggle */}
          <div
            className={`flex items-center justify-between p-3.5 rounded-2xl border ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4 text-indigo-600" />
              <div>
                <span className={`font-bold block ${isBright ? 'text-[#161c4f]' : 'text-slate-200'}`}>
                  Theme Style
                </span>
                <span className="text-[11px] text-slate-500">
                  {isBright ? 'Joyful Bright (Logo inspired)' : 'Royal Deep Navy'}
                </span>
              </div>
            </div>
            <button
              onClick={handleToggleTheme}
              className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer border ${
                isBright
                  ? 'bg-[#161c4f] text-white border-slate-700'
                  : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              {isBright ? 'Switch to Dark' : 'Switch to Bright'}
            </button>
          </div>

          {/* Sound Toggle */}
          <div
            className={`flex items-center justify-between p-3.5 rounded-2xl border ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-pink-600" />
              <div>
                <span className={`font-bold block ${isBright ? 'text-[#161c4f]' : 'text-slate-200'}`}>
                  Audio Cues & Fanfares
                </span>
                <span className="text-[11px] text-slate-500">
                  Offline Web Audio synthesized tones
                </span>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                progress.settings.soundEnabled ? 'bg-pink-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-xs ${
                  progress.settings.soundEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Explorer Mode Toggle */}
          <div
            className={`flex items-center justify-between p-3.5 rounded-2xl border ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Compass className="w-4 h-4 text-purple-600" />
              <div>
                <span className={`font-bold block ${isBright ? 'text-[#161c4f]' : 'text-slate-200'}`}>
                  Explorer Mode
                </span>
                <span className="text-[11px] text-slate-500">
                  Unlock all 100 stages for free review
                </span>
              </div>
            </div>
            <button
              onClick={handleToggleExplorer}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                progress.settings.explorerMode ? 'bg-purple-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-xs ${
                  progress.settings.explorerMode ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Data Backup & Portability */}
          <div className={`pt-2 border-t space-y-2 ${isBright ? 'border-slate-200' : 'border-slate-800'}`}>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Data Backup & Sync
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isBright
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-300'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowImportBox(prev => !prev)}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isBright
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-slate-300'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>
            </div>

            {showImportBox && (
              <div className="space-y-2 pt-2 animate-fadeIn">
                <textarea
                  rows={3}
                  placeholder="Paste exported backup JSON here..."
                  value={importJson}
                  onChange={e => setImportJson(e.target.value)}
                  className={`w-full border rounded-xl p-2.5 font-mono text-[11px] ${
                    isBright ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
                <button
                  onClick={handleImportSubmit}
                  className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Restore Progress
                </button>
              </div>
            )}
          </div>

          {/* Reset progress */}
          <div className={`pt-2 border-t ${isBright ? 'border-slate-200' : 'border-slate-800'}`}>
            {resetConfirm ? (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <p className="text-rose-800 text-[11px] font-medium">
                  Are you sure? This will reset all completed stages, blocks, streaks, and points.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                className="w-full py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Game Progress
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
