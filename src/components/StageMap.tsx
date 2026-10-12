import React, { useState } from 'react';
import { Lock, CheckCircle2, ChevronRight, Compass } from 'lucide-react';
import { UserProgress } from '../types';
import { WORLDS, STAGES, getWorldForStage } from '../data/worldsAndStages';

interface StageMapProps {
  progress: UserProgress;
  onSelectStage: (stageId: number) => void;
  onBackToHome: () => void;
}

export const StageMap: React.FC<StageMapProps> = ({ progress, onSelectStage, onBackToHome }) => {
  const [selectedWorldId, setSelectedWorldId] = useState<number | 'all'>('all');
  const isBright = progress.settings.theme !== 'royal';

  const filteredStages = STAGES.filter(
    s => selectedWorldId === 'all' || s.worldId === selectedWorldId
  );

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header with breadcrumb */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
          isBright ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <button onClick={onBackToHome} className="hover:text-pink-600 transition-colors cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-pink-600 font-semibold">Stage Map</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold font-display flex items-center gap-2 ${
              isBright ? 'text-[#161c4f]' : 'text-white'
            }`}
          >
            <Compass className="w-6 h-6 text-pink-600" />
            100-Stage Mathematical Journey
          </h1>
        </div>

        {/* Global Progress summary */}
        <div
          className={`flex items-center gap-3 text-xs font-mono-numbers px-4 py-2 rounded-xl border shadow-xs ${
            isBright
              ? 'bg-white border-slate-200 text-slate-700'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}
        >
          <span className={isBright ? 'text-slate-500' : 'text-slate-400'}>Current Stage:</span>
          <span className="text-pink-600 font-bold">Stage {progress.currentStage}</span>
          <span className="text-slate-300">·</span>
          <span className={isBright ? 'text-slate-500' : 'text-slate-400'}>Stages Mastered:</span>
          <span className="text-emerald-600 font-bold">
            {Object.values(progress.completedStages).filter(Boolean).length}/100
          </span>
        </div>
      </div>

      {/* World Segmented Filter Control */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedWorldId('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer shadow-xs ${
            selectedWorldId === 'all'
              ? 'bg-[#161c4f] text-white'
              : isBright
              ? 'bg-white text-slate-600 hover:text-[#161c4f] border border-slate-200 hover:bg-slate-50'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All 10 Worlds
        </button>
        {WORLDS.map(w => (
          <button
            key={w.id}
            onClick={() => setSelectedWorldId(w.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs ${
              selectedWorldId === w.id
                ? 'bg-pink-600 text-white'
                : isBright
                ? 'bg-white text-slate-600 hover:text-[#161c4f] border border-slate-200 hover:bg-slate-50'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{w.badge}</span>
            <span>W{w.id}: {w.title}</span>
          </button>
        ))}
      </div>

      {/* 100 Stages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredStages.map(stage => {
          const world = getWorldForStage(stage.id);
          const isCompleted = !!progress.completedStages[stage.id];
          const isUnlocked =
            progress.settings.explorerMode ||
            progress.unlockedStages[stage.id] ||
            stage.id === 1;
          const isCurrent = progress.currentStage === stage.id;

          let completedLevelsInStage = 0;
          for (let l = 1; l <= 20; l++) {
            if (progress.completedLevels[`${stage.id}_${l}`]) {
              completedLevelsInStage++;
            }
          }
          const stagePct = Math.round((completedLevelsInStage / 20) * 100);

          return (
            <div
              key={stage.id}
              onClick={() => {
                if (isUnlocked) onSelectStage(stage.id);
              }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between relative group shadow-xs ${
                isUnlocked
                  ? isBright
                    ? 'bg-white hover:bg-pink-50/20 border-slate-200 hover:border-pink-300 cursor-pointer'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 cursor-pointer hover:bg-slate-850'
                  : isBright
                  ? 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
                  : 'bg-slate-950/40 border-slate-900 opacity-55 cursor-not-allowed'
              } ${isCurrent ? 'ring-2 ring-pink-500/60' : ''}`}
            >
              {/* Top metadata line */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono-numbers">
                  <span className={`font-bold ${isBright ? 'text-[#161c4f]' : 'text-slate-300'}`}>
                    Stage {stage.id}
                  </span>
                  <span className={isBright ? 'text-slate-300' : 'text-slate-600'}>·</span>
                  <span className={isBright ? 'text-slate-500' : 'text-slate-400'}>W{world.id}</span>
                </div>

                {isCompleted ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mastered
                  </span>
                ) : isUnlocked ? (
                  <span className="text-xs font-mono-numbers font-medium text-pink-600">
                    {completedLevelsInStage}/20 Levels
                  </span>
                ) : (
                  <span className={`flex items-center gap-1 text-xs ${isBright ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div className="mb-3">
                <h3
                  className={`text-sm font-bold transition-colors line-clamp-1 ${
                    isBright
                      ? 'text-[#161c4f] group-hover:text-pink-600'
                      : 'text-white group-hover:text-pink-400'
                  }`}
                >
                  {stage.title}
                </h3>
                <p className={`text-xs line-clamp-2 mt-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                  {stage.description}
                </p>
              </div>

              {/* Subtopic tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {stage.subtopics.slice(0, 2).map((sub, i) => (
                  <span
                    key={i}
                    className={`text-[10px] px-1.5 py-0.5 rounded truncate max-w-[120px] ${
                      isBright
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {sub}
                  </span>
                ))}
                {stage.subtopics.length > 2 && (
                  <span className="text-[10px] text-slate-400 py-0.5">
                    +{stage.subtopics.length - 2}
                  </span>
                )}
              </div>

              {/* Progress bar or prompt */}
              <div>
                <div
                  className={`w-full h-1.5 rounded-full overflow-hidden mb-2 ${
                    isBright ? 'bg-slate-100' : 'bg-slate-950'
                  }`}
                >
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#161c4f] to-pink-500'
                    }`}
                    style={{ width: `${stagePct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono-numbers ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                    {stagePct}%
                  </span>
                  {isUnlocked && (
                    <span className="text-pink-600 group-hover:translate-x-0.5 transition-transform flex items-center font-bold">
                      Enter Stage <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StageMap;
