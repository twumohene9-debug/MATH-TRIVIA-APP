import React, { useState } from 'react';
import { Award, ChevronLeft, CheckCircle2, Lock } from 'lucide-react';
import { UserProgress } from '../types';
import { ALL_ACHIEVEMENTS } from '../engine/achievements';

interface AchievementsViewProps {
  progress: UserProgress;
  onBack: () => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ progress, onBack }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const isBright = progress.settings.theme !== 'royal';

  const unlockedSet = new Set(progress.unlockedAchievements);

  const filtered = ALL_ACHIEVEMENTS.filter(ach => {
    const isUnlocked = unlockedSet.has(ach.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
          isBright ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <div>
          <button
            onClick={onBack}
            className={`flex items-center gap-1 text-xs transition-colors mb-2 cursor-pointer ${
              isBright ? 'text-slate-500 hover:text-pink-600' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Adventure
          </button>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold font-display flex items-center gap-2 ${
              isBright ? 'text-[#161c4f]' : 'text-white'
            }`}
          >
            <Award className="w-6 h-6 text-pink-600" />
            Mathematical Hall of Badges
          </h1>
          <p className={`text-xs mt-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
            Earn prestigious accolades as you ascend through 100 mathematical stages
          </p>
        </div>

        {/* Filter buttons */}
        <div
          className={`flex items-center gap-1.5 p-1 rounded-2xl border self-start sm:self-auto shadow-xs ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#161c4f] text-white shadow-xs'
                : isBright
                ? 'text-slate-600 hover:text-[#161c4f]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({ALL_ACHIEVEMENTS.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'unlocked'
                ? 'bg-pink-600 text-white shadow-xs'
                : isBright
                ? 'text-slate-600 hover:text-[#161c4f]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unlocked ({unlockedSet.size})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'locked'
                ? isBright
                  ? 'bg-slate-200 text-slate-800 shadow-xs'
                  : 'bg-slate-800 text-white'
                : isBright
                ? 'text-slate-600 hover:text-[#161c4f]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Locked ({ALL_ACHIEVEMENTS.length - unlockedSet.size})
          </button>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(ach => {
          const isUnlocked = unlockedSet.has(ach.id);

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
                isUnlocked
                  ? isBright
                    ? 'bg-white border-pink-200 shadow-md ring-1 ring-pink-500/20'
                    : 'bg-slate-900/90 border-slate-700 shadow-md ring-1 ring-pink-500/20'
                  : isBright
                  ? 'bg-slate-100/60 border-slate-200 opacity-60'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                      isUnlocked
                        ? isBright
                          ? 'bg-pink-50 border-pink-200'
                          : 'bg-pink-950/40 border-pink-500/30'
                        : isBright
                        ? 'bg-slate-200 border-slate-300 grayscale'
                        : 'bg-slate-900 border-slate-800 grayscale'
                    }`}
                  >
                    {ach.badgeIcon}
                  </div>

                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Unlocked
                    </span>
                  ) : (
                    <span className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border ${
                      isBright
                        ? 'bg-slate-200/80 text-slate-500 border-slate-300'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}>
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </div>

                <h3 className={`text-sm font-bold mb-1 ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
                  {ach.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                  {ach.description}
                </p>
              </div>

              <div
                className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-bold uppercase tracking-wider ${
                  isBright ? 'border-slate-100 text-slate-400' : 'border-slate-800 text-slate-500'
                }`}
              >
                <span>{ach.category}</span>
                {isUnlocked && <span className="text-pink-600">Achieved</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsView;
