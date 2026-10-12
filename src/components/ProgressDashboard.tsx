import React from 'react';
import { BarChart2, Zap, Target, Clock, Trophy, ChevronLeft } from 'lucide-react';
import { UserProgress } from '../types';
import { WORLDS } from '../data/worldsAndStages';

interface ProgressDashboardProps {
  progress: UserProgress;
  onBack: () => void;
  onSelectStage: (stageId: number) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  onBack,
  onSelectStage,
}) => {
  const { stats } = progress;
  const isBright = progress.settings.theme !== 'royal';

  const accuracy =
    stats.totalAttempted > 0 ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100) : 0;

  const totalStagesCompleted = Object.values(progress.completedStages).filter(Boolean).length;
  const totalLevelsCompleted = Object.values(progress.completedLevels).filter(Boolean).length;
  const totalBlocksCompleted = Object.values(progress.completedBlocks).filter(Boolean).length;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b pb-4 ${
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
            <BarChart2 className="w-6 h-6 text-pink-600" />
            Mathematical Statistics & Progress
          </h1>
        </div>
      </div>

      {/* High-level KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          className={`border rounded-3xl p-5 shadow-xs ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className={`text-xs mb-1 flex items-center justify-between ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>Total Points</span>
            <Trophy className="w-4 h-4 text-pink-600" />
          </div>
          <div className={`text-2xl font-bold font-mono-numbers ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
            {stats.totalPoints.toLocaleString()}
          </div>
        </div>

        <div
          className={`border rounded-3xl p-5 shadow-xs ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className={`text-xs mb-1 flex items-center justify-between ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>Accuracy</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono-numbers">
            {accuracy}%
          </div>
          <div className={`text-[11px] mt-1 font-mono-numbers ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            {stats.totalCorrect} / {stats.totalAttempted} correct
          </div>
        </div>

        <div
          className={`border rounded-3xl p-5 shadow-xs ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className={`text-xs mb-1 flex items-center justify-between ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>Best Streak</span>
            <Zap className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-2xl font-bold text-pink-600 font-mono-numbers">
            {stats.bestStreak}
          </div>
          <div className={`text-[11px] mt-1 font-mono-numbers ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            Current: {stats.currentStreak} 🔥
          </div>
        </div>

        <div
          className={`border rounded-3xl p-5 shadow-xs ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className={`text-xs mb-1 flex items-center justify-between ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>Time in Journey</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className={`text-2xl font-bold font-mono-numbers ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
            {formatTime(stats.totalTimeSeconds)}
          </div>
        </div>
      </div>

      {/* Structural Progression Details */}
      <div
        className={`border rounded-3xl p-6 shadow-xs ${
          isBright ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <h2 className={`text-lg font-bold mb-4 font-display ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
          Structure Completion
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-numbers">
          <div
            className={`p-4 rounded-2xl border ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <span className="text-xs text-slate-500 block mb-1">Stages Mastered</span>
            <div className="text-xl font-bold text-pink-600">
              {totalStagesCompleted} <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden mt-2 ${isBright ? 'bg-slate-200' : 'bg-slate-900'}`}>
              <div
                className="bg-pink-600 h-full"
                style={{ width: `${(totalStagesCompleted / 100) * 100}%` }}
              />
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <span className="text-xs text-slate-500 block mb-1">Levels Cleared</span>
            <div className="text-xl font-bold text-indigo-700">
              {totalLevelsCompleted} <span className="text-xs text-slate-400">/ 2,000</span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden mt-2 ${isBright ? 'bg-slate-200' : 'bg-slate-900'}`}>
              <div
                className="bg-indigo-600 h-full"
                style={{ width: `${(totalLevelsCompleted / 2000) * 100}%` }}
              />
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <span className="text-xs text-slate-500 block mb-1">Blocks Solved</span>
            <div className={`text-xl font-bold ${isBright ? 'text-[#161c4f]' : 'text-purple-400'}`}>
              {totalBlocksCompleted} <span className="text-xs text-slate-400">/ 20,000</span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden mt-2 ${isBright ? 'bg-slate-200' : 'bg-slate-900'}`}>
              <div
                className="bg-[#161c4f] h-full"
                style={{ width: `${(totalBlocksCompleted / 20000) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mastery by World */}
      <div
        className={`border rounded-3xl p-6 shadow-xs ${
          isBright ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <h2 className={`text-lg font-bold mb-4 font-display ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
          Mastery Across the 10 Worlds
        </h2>
        <div className="space-y-3">
          {WORLDS.map(world => {
            const stagesInWorld = Array.from(
              { length: world.stageRange[1] - world.stageRange[0] + 1 },
              (_, i) => world.stageRange[0] + i
            );
            const completedCount = stagesInWorld.filter(s => progress.completedStages[s]).length;
            const pct = Math.round((completedCount / 10) * 100);

            return (
              <div
                key={world.id}
                onClick={() => onSelectStage(world.stageRange[0])}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer shadow-xs ${
                  isBright
                    ? 'bg-slate-50 hover:bg-pink-50/30 border-slate-200 hover:border-pink-300'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{world.badge}</span>
                  <div>
                    <div className={`text-sm font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
                      World {world.id}: {world.title}
                    </div>
                    <div className="text-xs text-slate-500 font-mono-numbers">
                      Stages {world.stageRange[0]}–{world.stageRange[1]}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-32 h-2 rounded-full overflow-hidden hidden sm:block ${isBright ? 'bg-slate-200' : 'bg-slate-900'}`}>
                    <div
                      className="bg-gradient-to-r from-[#161c4f] to-pink-600 h-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono-numbers text-pink-600 font-bold w-12 text-right">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
