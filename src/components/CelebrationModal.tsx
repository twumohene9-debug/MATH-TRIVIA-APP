import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, ArrowRight, CheckCircle2, Award } from 'lucide-react';
import { UserProgress } from '../types';

export type CelebrationType = 'block' | 'level' | 'stage' | 'game_complete' | 'challenge' | 'part';

interface CelebrationModalProps {
  type: CelebrationType;
  stageId: number;
  levelId: number;
  blockId: number;
  scoreGained: number;
  totalQuestions?: number;
  progress: UserProgress;
  onNext: () => void;
  onViewLevelMap: () => void;
  partTitle?: string;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  type,
  stageId,
  levelId,
  blockId,
  scoreGained,
  totalQuestions,
  progress,
  onNext,
  onViewLevelMap,
}) => {
  const isBright = progress.settings.theme !== 'royal';
  const playerName = progress.playerName || 'Mathematician';

  useEffect(() => {
    if (type === 'game_complete') {
      const duration = 3500;
      const end = Date.now() + duration;
      const interval: NodeJS.Timeout = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        confetti({
          startVelocity: 35,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() * 0.5 },
        });
      }, 300);
      return () => clearInterval(interval);
    } else if (type === 'stage' || type === 'challenge') {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
      });
    } else {
      confetti({
        particleCount: 45,
        spread: 50,
        origin: { y: 0.65 },
      });
    }
  }, [type]);

  const accuracy =
    progress.stats.totalAttempted > 0
      ? Math.round((progress.stats.totalCorrect / progress.stats.totalAttempted) * 100)
      : 100;

  if (type === 'game_complete') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <div
          className={`border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 text-center my-4 ${
            isBright ? 'bg-white border-amber-300 text-slate-900' : 'bg-[#12173f] border-amber-500/80 text-white'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white mx-auto flex items-center justify-center mb-3 text-2xl shadow-lg shadow-amber-500/30">
            👑
          </div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-bold mb-1">
            Ultimate Victory · {playerName}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display mb-2">
            MATHEMATICAL MASTERY ACHIEVED!
          </h2>
          <p className={`text-xs max-w-sm mx-auto mb-4 ${isBright ? 'text-slate-600' : 'text-slate-300'}`}>
            Congratulations, <strong className="text-pink-600">{playerName}</strong>! You have conquered all 100 stages and 20,000 blocks!
          </p>

          <div className="grid grid-cols-4 gap-2 bg-slate-100/80 p-3 rounded-xl border border-slate-200 mb-4 font-mono-numbers text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-500">Points</div>
              <div className="text-sm font-bold text-amber-600">{progress.stats.totalPoints.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Accuracy</div>
              <div className="text-sm font-bold text-emerald-600">{accuracy}%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Streak</div>
              <div className="text-sm font-bold text-slate-800">{progress.stats.bestStreak}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Stages</div>
              <div className="text-sm font-bold text-indigo-600">100 / 100</div>
            </div>
          </div>

          <button
            onClick={onViewLevelMap}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Claim Ultimate Master Trophy
          </button>
        </div>
      </div>
    );
  }

  // Compact, reduced-height popup box with high-visibility icon
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full max-w-[330px] rounded-2xl overflow-hidden shadow-2xl border text-center transition-all ${
          isBright
            ? 'bg-white border-slate-200/90 text-slate-900 shadow-indigo-950/15'
            : 'bg-[#12173f] border-indigo-900/80 text-white shadow-black/50'
        }`}
      >
        {/* Top Accent Stripe */}
        <div className="theme-stripes-top w-full" />

        <div className="p-3.5 sm:p-4 flex flex-col items-center">
          {/* Ultra-high-contrast compact icon badge */}
          <div className="mb-2">
            {type === 'stage' ? (
              <div className="w-11 h-11 rounded-xl bg-[#161c4f] border-2 border-pink-400 text-amber-300 flex items-center justify-center shadow-md shadow-pink-500/20">
                <Trophy className="w-5 h-5 text-amber-300 fill-amber-400/40" />
              </div>
            ) : type === 'level' ? (
              <div className="w-11 h-11 rounded-xl bg-[#161c4f] border-2 border-amber-400 text-amber-400 flex items-center justify-center shadow-md shadow-amber-500/25">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            ) : type === 'challenge' ? (
              <div className="w-11 h-11 rounded-xl bg-[#161c4f] border-2 border-rose-400 text-pink-400 flex items-center justify-center shadow-md shadow-rose-500/25">
                <Award className="w-5 h-5 text-pink-400" />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-xl bg-[#161c4f] border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            )}
          </div>

          <p className="text-[10px] uppercase tracking-wider font-extrabold text-pink-600 mb-0.5">
            {type === 'stage'
              ? 'Stage Mastered!'
              : type === 'level'
              ? 'Level Cleared!'
              : type === 'challenge'
              ? 'Gauntlet Conquered!'
              : type === 'part'
              ? 'Curriculum Quiz Conquered!'
              : 'Block Conquered!'}
          </p>

          <h3 className="text-base sm:text-lg font-extrabold font-display leading-tight mb-1">
            {type === 'stage'
              ? `Stage ${stageId} Conquered`
              : type === 'level'
              ? `Level ${levelId} Complete!`
              : type === 'challenge'
              ? `Challenge Level ${stageId} Won!`
              : type === 'part'
              ? `Part ${stageId} Quiz Mastered!`
              : `Block ${blockId} Cleared`}
          </h3>

          <p
            className={`text-xs max-w-[270px] mx-auto mb-2.5 leading-snug line-clamp-2 ${
              isBright ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            {type === 'stage'
              ? `Outstanding, ${playerName}! Stage ${stageId} mastered!`
              : type === 'level'
              ? `Brilliant deduction, ${playerName}! Level ${levelId} finished!`
              : type === 'challenge'
              ? `Epic solving, ${playerName}! Challenge Level ${stageId} completed!`
              : type === 'part'
              ? `Spectacular work, ${playerName}! Curriculum Part ${stageId} completed!`
              : `Flawless work, ${playerName}! ${totalQuestions || 10}/${totalQuestions || 10} questions solved!`}
          </p>

          {/* Compact single-row stats pill */}
          <div
            className={`w-full flex items-center justify-center gap-3 py-1.5 px-3 rounded-lg border mb-3 font-mono-numbers text-xs ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-indigo-900/60'
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500">Points:</span>
              <span className="font-bold text-pink-600">+{scoreGained}</span>
            </div>
            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500">Streak:</span>
              <span className="font-bold text-emerald-600">{progress.stats.currentStreak} 🔥</span>
            </div>
          </div>

          {/* Compact Actions */}
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={onViewLevelMap}
              className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                isBright
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  : 'border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {type === 'challenge' ? 'Challenges' : 'Level Map'}
            </button>
            <button
              onClick={onNext}
              className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-pink-600 to-indigo-700 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>
                {type === 'stage'
                  ? 'Next Stage'
                  : type === 'level'
                  ? 'Next Level'
                  : type === 'challenge'
                  ? 'Next'
                  : 'Next Block'}
              </span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelebrationModal;
