import React from 'react';
import { Swords, Trophy, Zap, ChevronLeft, Play, Sparkles, Award, Shield, CheckCircle2 } from 'lucide-react';
import { UserProgress } from '../types';
import MathMasteryLogo from './MathMasteryLogo';

interface ChallengeScreenProps {
  progress: UserProgress;
  onStartChallenge: (level: number) => void;
  onBackToHome: () => void;
}

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({
  progress,
  onStartChallenge,
  onBackToHome,
}) => {
  const isBright = progress.settings.theme !== 'royal';
  const currentLevel = progress.challengeLevel || 1;
  const bestLevel = progress.bestChallengeLevel || 1;
  const completedBlocks = progress.challengeCompletedBlocks || 0;
  const playerName = progress.playerName || 'Mathematician';

  // Determine current tier description
  let tierName = 'Foundation Mixed Challenge';
  let tierDesc = 'Arithmetic, Counting, Basic Geometry, Place Value & Logic';
  let tierColor = 'text-amber-600 bg-amber-50 border-amber-200';

  if (currentLevel >= 6 && currentLevel <= 10) {
    tierName = 'Developing Mixed Challenge';
    tierDesc = 'Fractions, Decimals, Negative Numbers, Linear Equations & Stats';
    tierColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (currentLevel >= 11 && currentLevel <= 15) {
    tierName = 'Advanced Mixed Challenge';
    tierDesc = 'Quadratics, Pythagoras, Circles, Exponents & Multi-Step Algebra';
    tierColor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
  } else if (currentLevel >= 16) {
    tierName = 'Mastery Mixed Challenge';
    tierDesc = 'Calculus, Matrices, Trigonometric Identities, Vectors & Higher Logic';
    tierColor = 'text-purple-700 bg-purple-50 border-purple-200';
  }

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className={`flex items-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl border transition-colors cursor-pointer ${
            isBright
              ? 'border-slate-200 text-slate-600 hover:text-[#161c4f] hover:bg-slate-100'
              : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="flex items-center gap-2 text-xs font-mono-numbers">
          <span className="text-slate-500">Player:</span>
          <span className="font-bold text-pink-600">{playerName}</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div
        className={`rounded-3xl border overflow-hidden shadow-xl relative transition-all ${
          isBright
            ? 'bg-white border-slate-200/90 shadow-indigo-950/10'
            : 'bg-[#12173f] border-indigo-900/60 shadow-black/40'
        }`}
      >
        <div className="theme-stripes-top w-full" />

        <div className="p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-gradient-to-r from-pink-500/10 to-indigo-500/10 border border-pink-300 text-pink-700">
              <Swords className="w-3.5 h-3.5 text-pink-600" />
              <span>Cross-Disciplinary Gauntlet</span>
            </div>

            <h1
              className={`text-3xl sm:text-4xl font-extrabold font-display mb-3 ${
                isBright ? 'text-[#161c4f]' : 'text-white'
              }`}
            >
              The Grand Math Challenge
            </h1>

            <p
              className={`text-sm sm:text-base max-w-xl leading-relaxed mb-6 ${
                isBright ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Test your true mathematical agility! Unlike single-topic stages, each Challenge Block consists of 10 randomized questions drawn from <strong>different mathematical disciplines</strong> in the same round. As you climb upward, the difficulty scales continuously!
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => onStartChallenge(currentLevel)}
                className="px-6 py-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-700 hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-pink-600/25 transition-all flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Challenge Level {currentLevel}</span>
              </button>
            </div>
          </div>

          {/* Right Level Crest Card */}
          <div
            className={`p-6 rounded-2xl border text-center flex flex-col items-center min-w-[240px] ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-indigo-900/80'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-indigo-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-pink-500/30">
              <Trophy className="w-8 h-8 text-white" />
            </div>

            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">
              Current Rank
            </span>
            <span
              className={`text-3xl font-extrabold font-mono-numbers mb-2 ${
                isBright ? 'text-[#161c4f]' : 'text-white'
              }`}
            >
              Level {currentLevel}
            </span>

            <span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold ${tierColor}`}>
              {tierName}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-numbers">
        <div
          className={`p-5 rounded-2xl border ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-900 border-indigo-950'
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Highest Level Conquered</span>
          </div>
          <div
            className={`text-2xl font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}
          >
            Level {bestLevel}
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-900 border-indigo-950'
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Multi-Topic Blocks Cleared</span>
          </div>
          <div
            className={`text-2xl font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}
          >
            {completedBlocks} Blocks
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-900 border-indigo-950'
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Award className="w-4 h-4 text-pink-500" />
            <span>Current Challenge Bonus</span>
          </div>
          <div
            className={`text-2xl font-bold ${isBright ? 'text-pink-600' : 'text-pink-400'}`}
          >
            +300 Pts / Block
          </div>
        </div>
      </div>

      {/* How Challenge Mode Works Explanation */}
      <div
        className={`p-6 rounded-2xl border space-y-3.5 ${
          isBright ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-indigo-950'
        }`}
      >
        <h3
          className={`text-base font-bold font-display flex items-center gap-2 ${
            isBright ? 'text-[#161c4f]' : 'text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-pink-600" />
          Challenge Progression Mechanics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <div
            className={`p-3.5 rounded-xl border ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="font-bold text-pink-600 mb-1">1. Randomized Multi-Topic Pool</div>
            <div>
              Instead of 10 questions on the same stage, every single question in a challenge round comes from a completely different mathematical area (Arithmetic, Geometry, Fractions, Algebra, Sequences, etc.).
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="font-bold text-indigo-600 mb-1">2. Ascending Difficulty Scaling</div>
            <div>
              Levels 1–5 feature foundational cross-topics. Levels 6–10 add rational numbers, rates, and linear algebra. Levels 11–15 introduce higher geometry, quadratics, and trigonometry. Levels 16+ test calculus, matrices, and olympiad logic.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeScreen;
