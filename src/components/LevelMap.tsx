import React, { useState } from 'react';
import { ChevronLeft, Play, CheckCircle2, Lock } from 'lucide-react';
import { UserProgress } from '../types';
import { getStage, getWorldForStage, getDifficultyTier, getBlockQuestionCountForStage } from '../data/worldsAndStages';

interface LevelMapProps {
  stageId: number;
  initialLevelId?: number;
  progress: UserProgress;
  onSelectBlock: (stageId: number, levelId: number, blockId: number) => void;
  onBackToStageMap: () => void;
  onSelectLevel?: (levelId: number) => void;
}

export const LevelMap: React.FC<LevelMapProps> = ({
  stageId,
  initialLevelId,
  progress,
  onSelectBlock,
  onBackToStageMap,
  onSelectLevel,
}) => {
  const stage = getStage(stageId);
  const world = getWorldForStage(stageId);
  const isBright = progress.settings.theme !== 'royal';
  const questionsPerBlock = getBlockQuestionCountForStage(stageId);
  const questionsPerLevel = questionsPerBlock * 10;

  // Respect initialLevelId if provided, otherwise default to currentLevel if on this stage, or Level 1
  const [selectedLevelId, setSelectedLevelId] = useState<number>(() => {
    if (initialLevelId && initialLevelId >= 1 && initialLevelId <= 20) {
      return initialLevelId;
    }
    return progress.currentStage === stageId ? progress.currentLevel : 1;
  });

  React.useEffect(() => {
    if (initialLevelId && initialLevelId >= 1 && initialLevelId <= 20) {
      setSelectedLevelId(initialLevelId);
    }
  }, [initialLevelId]);

  const blocks = Array.from({ length: 10 }, (_, i) => i + 1);
  const levels = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header & Breadcrumb */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
          isBright ? 'border-slate-200' : 'border-slate-800'
        }`}
      >
        <div>
          <button
            onClick={onBackToStageMap}
            className={`flex items-center gap-1 text-xs transition-colors mb-2 cursor-pointer ${
              isBright ? 'text-slate-500 hover:text-pink-600' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to 100-Stage Map
          </button>
          <div className="flex items-center gap-2 text-xs font-bold mb-1 text-pink-600">
            <span>{world.badge} World {world.id}: {world.title}</span>
            <span>·</span>
            <span>Stage {stage.id}</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold font-display ${
              isBright ? 'text-[#161c4f]' : 'text-white'
            }`}
          >
            {stage.title}
          </h1>
          <p className={`text-sm max-w-2xl mt-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
            {stage.description}
          </p>
        </div>

        {/* Level Tier Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-medium">
            L1–5: Foundation
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            L6–10: Developing
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-medium">
            L11–15: Advanced
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 border border-pink-200 font-medium">
            L16–20: Mastery
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 20 Levels Grid */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
              Select a Level (20 Levels)
            </span>
            <span className={`font-mono-numbers ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              1 Level = 10 Blocks = {questionsPerLevel} Questions
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {levels.map(levelNum => {
              const tier = getDifficultyTier(levelNum);
              const isLevelCompleted = !!progress.completedLevels[`${stageId}_${levelNum}`];

              let completedBlocksCount = 0;
              for (let b = 1; b <= 10; b++) {
                if (progress.completedBlocks[`${stageId}_${levelNum}_${b}`]) {
                  completedBlocksCount++;
                }
              }

              const isSelected = selectedLevelId === levelNum;
              const isUnlocked =
                progress.settings.explorerMode ||
                levelNum === 1 ||
                progress.completedLevels[`${stageId}_${levelNum - 1}`] ||
                (progress.currentStage === stageId && levelNum <= progress.currentLevel);

              return (
                <button
                  key={levelNum}
                  onClick={() => {
                    if (isUnlocked) {
                      setSelectedLevelId(levelNum);
                      onSelectLevel?.(levelNum);
                    }
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer shadow-xs ${
                    isSelected
                      ? isBright
                        ? 'bg-pink-50/70 border-pink-500 ring-2 ring-pink-500/40'
                        : 'bg-pink-950/30 border-pink-500 ring-2 ring-pink-500/40'
                      : isUnlocked
                      ? isBright
                        ? 'bg-white hover:bg-slate-50 border-slate-200'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                      : isBright
                      ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold font-mono-numbers ${
                        isBright ? 'text-[#161c4f]' : 'text-white'
                      }`}
                    >
                      L{levelNum}
                    </span>
                    {isLevelCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : !isUnlocked ? (
                      <Lock className="w-3 h-3 text-slate-400" />
                    ) : null}
                  </div>

                  <div className="text-[10px] uppercase tracking-wider text-pink-600 font-bold mb-2">
                    {tier}
                  </div>

                  <div className={`text-[11px] font-mono-numbers ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                    {completedBlocksCount}/10 Blocks
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: 10 Blocks for the Selected Level */}
        <div
          className={`border rounded-3xl p-5 flex flex-col justify-between shadow-xl ${
            isBright ? 'bg-white border-slate-200/90' : 'bg-[#12173f] border-indigo-900/60'
          }`}
        >
          <div>
            <div
              className={`flex items-center justify-between border-b pb-3 mb-4 ${
                isBright ? 'border-slate-200' : 'border-slate-800'
              }`}
            >
              <div>
                <span className="text-xs text-pink-600 font-bold uppercase tracking-wider">
                  Level {selectedLevelId} · {getDifficultyTier(selectedLevelId)}
                </span>
                <h2 className={`text-lg font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
                  10 Progression Blocks
                </h2>
              </div>
              <span
                className={`text-xs font-mono-numbers px-2.5 py-1 rounded-full border ${
                  isBright
                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                {questionsPerBlock} Qs / Block
              </span>
            </div>

            <div className="space-y-2">
              {blocks.map(blockNum => {
                const blockKey = `${stageId}_${selectedLevelId}_${blockNum}`;
                const isBlockDone = !!progress.completedBlocks[blockKey];
                const isCurrentBlock =
                  progress.currentStage === stageId &&
                  progress.currentLevel === selectedLevelId &&
                  progress.currentBlock === blockNum;

                let rowStyle = isBright
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300';

                if (isBlockDone) {
                  rowStyle = isBright
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300';
                } else if (isCurrentBlock) {
                  rowStyle = isBright
                    ? 'bg-pink-50/50 border-pink-200 text-pink-900'
                    : 'bg-pink-950/20 border-pink-800/50 text-pink-200';
                }

                return (
                  <div
                    key={blockNum}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-colors shadow-xs ${rowStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono-numbers font-bold ${
                          isBright
                            ? 'bg-[#161c4f] text-white'
                            : 'bg-slate-900 border border-slate-800 text-white'
                        }`}
                      >
                        {blockNum}
                      </span>
                      <div>
                        <div className={`text-xs font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
                          Block {blockNum}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono-numbers">
                          {isBlockDone ? `Completed (${questionsPerBlock}/${questionsPerBlock})` : `${questionsPerBlock} Questions`}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectBlock(stageId, selectedLevelId, blockNum)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                        isBlockDone
                          ? isBright
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-pink-600 hover:bg-pink-500 text-white shadow-pink-600/20'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      {isBlockDone ? 'Replay' : 'Start'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className={`mt-4 pt-3 border-t text-[11px] ${
              isBright ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
            }`}
          >
            Rule: Answer all {questionsPerBlock} questions in a block correctly to conquer it. If you miss a question, a full worked solution appears and you can retry with fresh numbers!
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
