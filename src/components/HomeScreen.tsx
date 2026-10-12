import React from 'react';
import { Play, Compass, BarChart2, Award, Settings, HelpCircle, Shield, ChevronRight, Zap, Target, Clock, Swords, User, Edit3, Sparkles, BookOpen } from 'lucide-react';
import { UserProgress } from '../types';
import { WORLDS, getStage, getWorldForStage } from '../data/worldsAndStages';
import { ScreenView } from './TopBar';
import MathMasteryLogo from './MathMasteryLogo';
import PWAInstallButton from './PWAInstallButton';

interface HomeScreenProps {
  progress: UserProgress;
  onNavigate: (view: ScreenView) => void;
  onContinue: () => void;
  onSelectStage: (stageId: number) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenNameModal?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  onNavigate,
  onContinue,
  onSelectStage,
  onOpenSettings,
  onOpenHelp,
  onOpenNameModal,
}) => {
  const currentStageInfo = getStage(progress.currentStage);
  const currentWorld = getWorldForStage(progress.currentStage);
  const isBright = progress.settings.theme !== 'royal';
  const playerName = progress.playerName || 'Mathematician';

  // Overall progression calculations
  const totalStagesCompleted = Object.values(progress.completedStages).filter(Boolean).length;
  const totalLevelsCompleted = Object.values(progress.completedLevels).filter(Boolean).length;
  const totalBlocksCompleted = Object.values(progress.completedBlocks).filter(Boolean).length;

  // Approximate total completion percentage (20,000 blocks)
  const overallPercentage = Math.min(
    100,
    Math.max(0, parseFloat(((totalBlocksCompleted / 20000) * 100).toFixed(2)))
  );
  const accuracy =
    progress.stats.totalAttempted > 0
      ? Math.round((progress.stats.totalCorrect / progress.stats.totalAttempted) * 100)
      : 0;

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-10">
      {/* Hero Header with Logo */}
      <section className="text-center relative pt-4 pb-2 flex flex-col items-center">
        <MathMasteryLogo size="lg" isBright={isBright} className="mb-4" />

        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-pink-100 text-pink-700 border border-pink-200">
            <span>⚡ 100-Stage Mathematics Adventure</span>
          </div>

          {/* Interactive Player Name Tag */}
          <button
            onClick={onOpenNameModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              isBright
                ? 'bg-white hover:bg-pink-50 border-slate-200 text-slate-800 hover:border-pink-300'
                : 'bg-slate-900 hover:bg-slate-800 border-indigo-900/60 text-slate-200 hover:border-pink-500'
            }`}
            title="Click to change your player name"
          >
            <User className="w-3.5 h-3.5 text-pink-600" />
            <span>Mathematician: <strong className="text-pink-600">{playerName}</strong></span>
            <Edit3 className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        <h1
          className={`text-4xl sm:text-6xl font-extrabold tracking-tight font-display mb-3 ${
            isBright ? 'text-[#161c4f]' : 'text-white'
          }`}
        >
          Math Mastery
        </h1>
        <p
          className={`max-w-2xl mx-auto text-base sm:text-lg font-normal leading-relaxed ${
            isBright ? 'text-slate-600' : 'text-slate-300'
          }`}
        >
          Welcome, <strong className="text-pink-600 font-semibold">{playerName}</strong>! Embark on an epic journey across 10 mathematical worlds, 100 stages, 2,000 levels, and over 140,000 questions — from basic number foundations to supreme higher mathematics.
        </p>

        {/* Hierarchy stats and current timer mode */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4 text-xs font-mono-numbers">
          <span className="px-2.5 py-1 rounded-md bg-slate-100/90 text-slate-700 border border-slate-200 font-semibold">
            100 Stages · 2,000 Levels · 20,000 Blocks
          </span>
          <button
            onClick={onOpenSettings}
            className={`px-3 py-1 rounded-md font-semibold cursor-pointer border flex items-center gap-1.5 transition-colors ${
              progress.settings.isTimed
                ? 'bg-pink-50 border-pink-300 text-pink-700'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}
            title="Click to change timer mode in settings"
          >
            <Clock className="w-3.5 h-3.5" />
            {progress.settings.isTimed ? 'Mode: 120s Timed' : 'Mode: Untimed (Relaxed)'}
          </button>
        </div>
      </section>

      {/* Prominent Current Position Card with Logo Stripe */}
      <section
        className={`border rounded-3xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden shadow-xl ${
          isBright
            ? 'bg-white border-slate-200/90 shadow-indigo-950/5'
            : 'bg-[#12173f] border-indigo-900/60 shadow-black/40'
        }`}
      >
        <div className="theme-stripes-top absolute top-0 left-0 right-0 w-full" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-bold mb-2 text-pink-600">
              <span>{currentWorld.badge} World {currentWorld.id}: {currentWorld.title}</span>
              <span aria-hidden="true">·</span>
              <span>Stage {progress.currentStage} of 100</span>
            </div>
            <h2
              className={`text-2xl sm:text-3xl font-bold mb-2 font-display ${
                isBright ? 'text-[#161c4f]' : 'text-white'
              }`}
            >
              {currentStageInfo.title}
            </h2>
            <p className={`text-sm max-w-xl mb-4 ${isBright ? 'text-slate-600' : 'text-slate-300'}`}>
              {currentStageInfo.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono-numbers">
              <div
                className={`px-3 py-1.5 rounded-lg border ${
                  isBright
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-950/60 border-slate-800 text-slate-200'
                }`}
              >
                <span className={isBright ? 'text-slate-500' : 'text-slate-400'}>Current Position:</span>{' '}
                <span className="font-semibold text-pink-600">
                  Level {progress.currentLevel}/20 · Block {progress.currentBlock}/10
                </span>
              </div>
              <div
                className={`px-3 py-1.5 rounded-lg border ${
                  isBright
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-950/60 border-slate-800 text-slate-200'
                }`}
              >
                <span className={isBright ? 'text-slate-500' : 'text-slate-400'}>Overall Progress:</span>{' '}
                <span className="font-bold text-[#161c4f]">{overallPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onContinue}
              className="px-6 py-3.5 bg-gradient-to-r from-[#161c4f] to-indigo-900 text-white hover:opacity-95 font-bold text-sm rounded-xl shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              Continue Game
            </button>
            <button
              onClick={() => onNavigate('parts')}
              className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4" />
              10 Open Parts
            </button>
            <button
              onClick={() => onNavigate('challenge')}
              className="px-5 py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white font-semibold text-sm rounded-xl shadow-md shadow-pink-600/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Swords className="w-4 h-4" />
              Challenge Mode
            </button>
            <button
              onClick={() => onNavigate('stagemap')}
              className={`px-4 py-3.5 border font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                isBright
                  ? 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  : 'border-slate-700 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              Stage Map
            </button>
          </div>
        </div>
      </section>

      {/* 10-Part Open Curriculum Hub Feature Card (100% Unlocked) */}
      <section
        className={`border rounded-3xl p-6 sm:p-7 backdrop-blur-sm relative overflow-hidden shadow-lg transition-all ${
          isBright
            ? 'bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 border-emerald-200/80 shadow-emerald-900/5'
            : 'bg-gradient-to-r from-emerald-950/20 via-teal-950/30 to-slate-900/40 border-emerald-900/50 shadow-black/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/25">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">
                <span>🔓 10 Open Curriculum Parts</span>
                <span className="font-mono-numbers px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px]">
                  Zero Gates · 100% Unlocked
                </span>
              </div>
              <h3 className={`text-xl font-extrabold font-display ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
                10-Part Open Curriculum Hub
              </h3>
              <p className={`text-xs max-w-xl ${isBright ? 'text-slate-600' : 'text-slate-300'}`}>
                Unlike the sequential 10 Mathematical Worlds adventure where each world unlocks after the previous one, all 10 Curriculum Parts are completely open and unlocked from day one! Practice any part freely from Primary Foundations to WASSCE Elective & Further Mathematics.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('parts')}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" />
            Enter 10 Open Parts
          </button>
        </div>
      </section>

      {/* Grand Challenge Mode Feature Card */}
      <section
        className={`border rounded-3xl p-6 sm:p-7 backdrop-blur-sm relative overflow-hidden shadow-lg transition-all ${
          isBright
            ? 'bg-gradient-to-r from-pink-500/5 via-rose-500/5 to-indigo-500/5 border-pink-200/80 shadow-pink-900/5'
            : 'bg-gradient-to-r from-pink-950/20 via-indigo-950/30 to-purple-950/20 border-pink-900/50 shadow-black/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-pink-600/25">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-pink-600 mb-1 uppercase tracking-wider">
                <span>⚡ Cross-Disciplinary Gauntlet</span>
                <span className="font-mono-numbers px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 text-[10px]">
                  Level {progress.challengeLevel || 1}
                </span>
              </div>
              <h3 className={`text-xl font-extrabold font-display ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
                Randomized Mixed-Topic Challenge
              </h3>
              <p className={`text-xs max-w-xl ${isBright ? 'text-slate-600' : 'text-slate-300'}`}>
                Unlike single-topic stages, each Challenge Block consists of randomized questions drawn from completely different topical areas with escalating difficulty!
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('challenge')}
            className="px-5 py-3 bg-gradient-to-r from-pink-600 to-indigo-700 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-600/20 flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <Swords className="w-4 h-4" />
            Play Challenge Gauntlet
          </button>
        </div>
      </section>

      {/* PWA Install Promotion Banner */}
      <PWAInstallButton variant="card" isBright={isBright} />

      {/* Main Navigation Hub */}
      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <button
          onClick={() => onNavigate('parts')}
          className={`p-4 border rounded-2xl transition-all text-left flex flex-col justify-between group cursor-pointer shadow-xs ${
            isBright
              ? 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300'
              : 'bg-emerald-950/20 hover:bg-emerald-900/40 border-emerald-900/60 hover:border-emerald-800'
          }`}
        >
          <BookOpen className="w-6 h-6 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
          <div>
            <div className={`text-sm font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
              10 Curriculum Parts
            </div>
            <div className={`text-xs font-semibold text-emerald-600 dark:text-emerald-400`}>
              All 10 Open
            </div>
          </div>
        </button>
        <button
          onClick={() => onNavigate('stagemap')}
          className={`p-4 border rounded-2xl transition-all text-left flex flex-col justify-between group cursor-pointer shadow-xs ${
            isBright
              ? 'bg-white hover:bg-pink-50/30 border-slate-200 hover:border-pink-300'
              : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Compass className="w-6 h-6 text-pink-600 mb-3 group-hover:scale-110 transition-transform" />
          <div>
            <div className={`text-sm font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
              Stage Map
            </div>
            <div className={`text-xs ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              100 Stages
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('challenge')}
          className={`p-4 border rounded-2xl transition-all text-left flex flex-col justify-between group cursor-pointer shadow-xs ${
            isBright
              ? 'bg-white hover:bg-pink-50/30 border-slate-200 hover:border-pink-300'
              : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Swords className="w-6 h-6 text-rose-600 mb-3 group-hover:scale-110 transition-transform" />
          <div>
            <div className={`text-sm font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
              Challenge
            </div>
            <div className={`text-xs ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Lvl {progress.challengeLevel || 1} Gauntlet
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('progress')}
          className={`p-4 border rounded-2xl transition-all text-left flex flex-col justify-between group cursor-pointer shadow-xs ${
            isBright
              ? 'bg-white hover:bg-pink-50/30 border-slate-200 hover:border-pink-300'
              : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <BarChart2 className="w-6 h-6 text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
          <div>
            <div className={`text-sm font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
              My Progress
            </div>
            <div className={`text-xs ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              {totalStagesCompleted} Stages Won
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('achievements')}
          className={`p-4 border rounded-2xl transition-all text-left flex flex-col justify-between group cursor-pointer shadow-xs ${
            isBright
              ? 'bg-white hover:bg-pink-50/30 border-slate-200 hover:border-pink-300'
              : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Award className="w-6 h-6 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
          <div>
            <div className={`text-sm font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
              Achievements
            </div>
            <div className={`text-xs ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              {progress.unlockedAchievements.length} Badges
            </div>
          </div>
        </button>

        <button
          onClick={onOpenSettings}
          className={`p-4 border rounded-2xl transition-all text-left flex flex-col justify-between group cursor-pointer shadow-xs ${
            isBright
              ? 'bg-white hover:bg-pink-50/30 border-slate-200 hover:border-pink-300'
              : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Settings className="w-6 h-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
          <div>
            <div className={`text-sm font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
              Settings
            </div>
            <div className={`text-xs ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Timer & Sound
            </div>
          </div>
        </button>

        <button
          onClick={onOpenHelp}
          className={`p-4 border rounded-2xl transition-all text-left flex flex-col justify-between group cursor-pointer shadow-xs ${
            isBright
              ? 'bg-white hover:bg-pink-50/30 border-slate-200 hover:border-pink-300'
              : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <HelpCircle className="w-6 h-6 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
          <div>
            <div className={`text-sm font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
              How to Play
            </div>
            <div className={`text-xs ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Rules & Guide
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('admin')}
          className={`p-4 border rounded-2xl transition-all text-left flex flex-col justify-between group cursor-pointer shadow-xs ${
            isBright
              ? 'bg-white hover:bg-pink-50/30 border-slate-200 hover:border-pink-300'
              : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Shield className="w-6 h-6 text-rose-600 mb-3 group-hover:scale-110 transition-transform" />
          <div>
            <div className={`text-sm font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
              Admin Studio
            </div>
            <div className={`text-xs ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Question Tools
            </div>
          </div>
        </button>
      </section>

      {/* Stats Summary Bar */}
      <section
        className={`grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl border shadow-sm ${
          isBright ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-800/60'
        }`}
      >
        <div>
          <div className={`text-xs mb-1 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            Total Points
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold font-mono-numbers ${
              isBright ? 'text-[#161c4f]' : 'text-white'
            }`}
          >
            {progress.stats.totalPoints.toLocaleString()}
          </div>
        </div>
        <div>
          <div className={`text-xs mb-1 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            Accuracy
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono-numbers">
            {accuracy}%
          </div>
        </div>
        <div>
          <div className={`text-xs mb-1 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            Best Streak
          </div>
          <div className="text-xl sm:text-2xl font-bold text-pink-600 font-mono-numbers flex items-center gap-1">
            <Zap className="w-5 h-5 fill-pink-500 text-pink-500" />
            {progress.stats.bestStreak}
          </div>
        </div>
        <div>
          <div className={`text-xs mb-1 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            Blocks Solved
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-700 font-mono-numbers flex items-center gap-1">
            <Target className="w-5 h-5 text-indigo-600" />
            {totalBlocksCompleted.toLocaleString()}
          </div>
        </div>
      </section>

      {/* 10 Mathematical Worlds Overview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-lg font-bold font-display ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
              The 10 Mathematical Worlds
            </h3>
            <p className={`text-xs ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Your path through 100 progressive stages of mathematical depth
            </p>
          </div>
          <button
            onClick={() => onNavigate('stagemap')}
            className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
          >
            View Map <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {WORLDS.map(world => {
            const isCurrentWorld = currentWorld.id === world.id;
            const stagesInWorld = Array.from(
              { length: world.stageRange[1] - world.stageRange[0] + 1 },
              (_, i) => world.stageRange[0] + i
            );
            const completedInWorld = stagesInWorld.filter(s => progress.completedStages[s]).length;
            const worldPct = Math.round((completedInWorld / 10) * 100);
            const isUnlocked =
              progress.settings.explorerMode ||
              stagesInWorld.some(s => progress.unlockedStages[s] || s === 1);

            return (
              <div
                key={world.id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectStage(world.stageRange[0]);
                  }
                }}
                className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between shadow-xs ${
                  isUnlocked
                    ? isBright
                      ? 'bg-white hover:bg-pink-50/20 border-slate-200 hover:border-pink-300 cursor-pointer'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 cursor-pointer hover:bg-slate-850'
                    : isBright
                    ? 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
                    : 'bg-slate-950/40 border-slate-900/60 opacity-60 cursor-not-allowed'
                } ${isCurrentWorld ? 'ring-2 ring-pink-500/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{world.badge}</span>
                    <div>
                      <h4 className={`text-sm font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
                        World {world.id}: {world.title}
                      </h4>
                      <span className={`text-xs font-mono-numbers ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                        Stages {world.stageRange[0]}–{world.stageRange[1]}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono-numbers font-semibold text-pink-600">
                    {completedInWorld}/10 Stages
                  </span>
                </div>

                <p className={`text-xs line-clamp-2 mb-3 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                  {world.description}
                </p>

                {/* Progress track */}
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isBright ? 'bg-slate-100' : 'bg-slate-950'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-[#161c4f] to-pink-600 transition-all duration-500"
                    style={{ width: `${worldPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
