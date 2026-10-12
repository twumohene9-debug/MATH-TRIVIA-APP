import React, { useState, useEffect, useCallback } from 'react';
import { UserProgress } from './types';
import { loadProgress, saveProgress } from './engine/storage';
import { sounds } from './engine/soundEffects';
import TopBar, { ScreenView } from './components/TopBar';
import HomeScreen from './components/HomeScreen';
import StageMap from './components/StageMap';
import LevelMap from './components/LevelMap';
import GamePlayer from './components/GamePlayer';
import ChallengeScreen from './components/ChallengeScreen';
import NameEntryModal from './components/NameEntryModal';
import ProgressDashboard from './components/ProgressDashboard';
import AchievementsView from './components/AchievementsView';
import AdminStudio from './components/AdminStudio';
import SettingsModal from './components/SettingsModal';
import HowToPlayModal from './components/HowToPlayModal';
import OfflineIndicator from './components/OfflineIndicator';
import AppFooter from './components/AppFooter';
import AboutAuthorModal from './components/AboutAuthorModal';
import CurriculumPartsHub from './components/CurriculumPartsHub';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress());
  const [currentView, setCurrentView] = useState<ScreenView>('home');
  const [activeStageId, setActiveStageId] = useState<number>(progress.currentStage);
  const [activeLevelId, setActiveLevelId] = useState<number>(progress.currentLevel);
  const [activeBlockId, setActiveBlockId] = useState<number>(progress.currentBlock);

  // Challenge Gauntlet states
  const [isChallengeMode, setIsChallengeMode] = useState<boolean>(false);
  const [activeChallengeLevel, setActiveChallengeLevel] = useState<number>(progress.challengeLevel || 1);

  // 10-Part Open Curriculum states
  const [activeCurriculumPartId, setActiveCurriculumPartId] = useState<number | null>(null);
  const [activeCurriculumUnitId, setActiveCurriculumUnitId] = useState<string | undefined>(undefined);
  const [activeCurriculumUnitName, setActiveCurriculumUnitName] = useState<string | undefined>(undefined);
  const [partQuizSeed, setPartQuizSeed] = useState<number>(0);

  // Modal states
  const [showNameModal, setShowNameModal] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showAuthorModal, setShowAuthorModal] = useState<boolean>(false);

  // Sync sound setting on mount
  useEffect(() => {
    sounds.enabled = progress.settings.soundEnabled;
  }, [progress.settings.soundEnabled]);

  const handleUpdateProgress = useCallback((updated: UserProgress) => {
    setProgress(updated);
    saveProgress(updated);
  }, []);

  const handleSaveName = useCallback((name: string) => {
    setProgress(prev => {
      const updated: UserProgress = {
        ...prev,
        playerName: name,
      };
      saveProgress(updated);
      return updated;
    });
    setShowNameModal(false);
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      action();
    }
  }, [pendingAction]);

  const ensurePlayerName = useCallback((onConfirmed: () => void) => {
    if (!progress.playerName || progress.playerName.trim() === '') {
      setPendingAction(() => onConfirmed);
      setShowNameModal(true);
    } else {
      onConfirmed();
    }
  }, [progress.playerName]);

  const handleToggleSound = useCallback(() => {
    setProgress(prev => {
      const nextState = !prev.settings.soundEnabled;
      sounds.enabled = nextState;
      const updated: UserProgress = {
        ...prev,
        settings: { ...prev.settings, soundEnabled: nextState },
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const handleToggleTimed = useCallback((isTimed: boolean) => {
    setProgress(prev => {
      const updated: UserProgress = {
        ...prev,
        settings: { ...prev.settings, isTimed },
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const handleToggleTheme = useCallback(() => {
    setProgress(prev => {
      const nextTheme = prev.settings.theme === 'royal' ? 'bright' : 'royal';
      const updated: UserProgress = {
        ...prev,
        settings: { ...prev.settings, theme: nextTheme },
      };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const handleNextBlock = useCallback(() => {
    let nextStage = activeStageId;
    let nextLevel = activeLevelId;
    let nextBlock = activeBlockId + 1;

    if (nextBlock > 10) {
      nextBlock = 1;
      nextLevel += 1;
      if (nextLevel > 20) {
        nextLevel = 1;
        nextStage = Math.min(100, nextStage + 1);
      }
    }
    setActiveStageId(nextStage);
    setActiveLevelId(nextLevel);
    setActiveBlockId(nextBlock);
  }, [activeStageId, activeLevelId, activeBlockId]);

  const handleContinueGame = useCallback(() => {
    ensurePlayerName(() => {
      setIsChallengeMode(false);
      setActiveCurriculumPartId(null);
      setActiveCurriculumUnitId(undefined);
      setActiveCurriculumUnitName(undefined);
      setActiveStageId(progress.currentStage);
      setActiveLevelId(progress.currentLevel);
      setActiveBlockId(progress.currentBlock);
      setCurrentView('game');
    });
  }, [ensurePlayerName, progress.currentStage, progress.currentLevel, progress.currentBlock]);

  const handleSelectStage = useCallback((stageId: number) => {
    setActiveStageId(stageId);
    setActiveLevelId(progress.currentStage === stageId ? progress.currentLevel : 1);
    setCurrentView('levelmap');
  }, [progress.currentStage, progress.currentLevel]);

  const handleSelectBlock = useCallback((sId: number, lId: number, bId: number) => {
    ensurePlayerName(() => {
      setIsChallengeMode(false);
      setActiveCurriculumPartId(null);
      setActiveCurriculumUnitId(undefined);
      setActiveCurriculumUnitName(undefined);
      setActiveStageId(sId);
      setActiveLevelId(lId);
      setActiveBlockId(bId);
      setCurrentView('game');
    });
  }, [ensurePlayerName]);

  const handleStartChallenge = useCallback((level: number) => {
    ensurePlayerName(() => {
      setIsChallengeMode(true);
      setActiveCurriculumPartId(null);
      setActiveCurriculumUnitId(undefined);
      setActiveCurriculumUnitName(undefined);
      setActiveChallengeLevel(level);
      setCurrentView('game');
    });
  }, [ensurePlayerName]);

  const handleStartPartQuiz = useCallback((partId: number, unitId?: string, unitName?: string) => {
    ensurePlayerName(() => {
      setIsChallengeMode(false);
      setActiveCurriculumPartId(partId);
      setActiveCurriculumUnitId(unitId);
      setActiveCurriculumUnitName(unitName);
      setPartQuizSeed(Date.now());
      setCurrentView('game');
    });
  }, [ensurePlayerName]);

  const isBright = progress.settings.theme !== 'royal';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors relative math-grid-pattern ${
        isBright
          ? 'bg-[#f4f7fc] text-slate-900 selection:bg-pink-500/20 selection:text-pink-900'
          : 'bg-[#0f143a] text-slate-100 selection:bg-pink-500/30 selection:text-pink-200'
      }`}
    >
      {/* Decorative ambient background glowing auras inspired by personal logo */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse-glow ${
            isBright ? 'bg-pink-500/10' : 'bg-pink-500/20'
          }`}
        />
        <div
          className={`absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse-glow ${
            isBright ? 'bg-indigo-600/10' : 'bg-indigo-600/25'
          }`}
          style={{ animationDelay: '3s' }}
        />
        <div
          className={`absolute bottom-0 left-1/3 w-[450px] h-[450px] rounded-full blur-3xl ${
            isBright ? 'bg-sky-400/8' : 'bg-sky-500/15'
          }`}
        />
      </div>

      {/* Universal Top Navigation Contract */}
      <TopBar
        currentView={currentView}
        onNavigate={view => setCurrentView(view)}
        progress={progress}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHelp={() => setShowHelp(true)}
        onOpenNameModal={() => setShowNameModal(true)}
        onToggleSound={handleToggleSound}
        onToggleTimed={handleToggleTimed}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full relative z-10">
        {currentView === 'home' && (
          <HomeScreen
            progress={progress}
            onNavigate={view => setCurrentView(view)}
            onContinue={handleContinueGame}
            onSelectStage={handleSelectStage}
            onOpenSettings={() => setShowSettings(true)}
            onOpenHelp={() => setShowHelp(true)}
            onOpenNameModal={() => setShowNameModal(true)}
          />
        )}

        {currentView === 'stagemap' && (
          <StageMap
            progress={progress}
            onSelectStage={handleSelectStage}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'levelmap' && (
          <LevelMap
            stageId={activeStageId}
            initialLevelId={activeLevelId}
            progress={progress}
            onSelectBlock={handleSelectBlock}
            onBackToStageMap={() => setCurrentView('stagemap')}
            onSelectLevel={lId => setActiveLevelId(lId)}
          />
        )}

        {currentView === 'challenge' && (
          <ChallengeScreen
            progress={progress}
            onStartChallenge={handleStartChallenge}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'parts' && (
          <CurriculumPartsHub
            progress={progress}
            onBackToHome={() => setCurrentView('home')}
            onStartPartQuiz={handleStartPartQuiz}
            onSwitchToWorlds={() => setCurrentView('stagemap')}
          />
        )}

        {currentView === 'game' && (
          <GamePlayer
            key={`game-${
              activeCurriculumPartId
                ? `part-${activeCurriculumPartId}-${activeCurriculumUnitId || 'all'}-${partQuizSeed}`
                : isChallengeMode
                ? `chal-${activeChallengeLevel}`
                : `${activeStageId}-${activeLevelId}-${activeBlockId}`
            }`}
            stageId={isChallengeMode ? activeChallengeLevel : (activeCurriculumPartId ? activeCurriculumPartId : activeStageId)}
            levelId={activeLevelId}
            blockId={activeBlockId}
            progress={progress}
            isChallengeMode={isChallengeMode}
            curriculumPartId={activeCurriculumPartId || undefined}
            curriculumUnitId={activeCurriculumUnitId}
            curriculumUnitName={activeCurriculumUnitName}
            onUpdateProgress={handleUpdateProgress}
            onNextBlock={handleNextBlock}
            onNextPartQuiz={() => setPartQuizSeed(Date.now())}
            onExit={() => {
              if (activeCurriculumPartId) {
                setCurrentView('parts');
              } else if (isChallengeMode) {
                setCurrentView('challenge');
              } else {
                setCurrentView('levelmap');
              }
            }}
            onToggleTimed={handleToggleTimed}
            onNextChallenge={() => {
              setActiveChallengeLevel(prev => prev + 1);
            }}
          />
        )}

        {currentView === 'progress' && (
          <ProgressDashboard
            progress={progress}
            onBack={() => setCurrentView('home')}
            onSelectStage={handleSelectStage}
          />
        )}

        {currentView === 'achievements' && (
          <AchievementsView
            progress={progress}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'admin' && (
          <AdminStudio onBack={() => setCurrentView('home')} />
        )}
      </main>

      {/* Global Branded Footer on All Pages */}
      <AppFooter onOpenAuthor={() => setShowAuthorModal(true)} />

      {/* Modal Dialogs */}
      {showNameModal && (
        <NameEntryModal
          isOpen={showNameModal}
          currentName={progress.playerName}
          isBright={isBright}
          onSaveName={handleSaveName}
          onClose={() => {
            setShowNameModal(false);
            setPendingAction(null);
          }}
        />
      )}

      {showSettings && (
        <SettingsModal
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHelp && (
        <HowToPlayModal onClose={() => setShowHelp(false)} />
      )}

      {showAuthorModal && (
        <AboutAuthorModal
          isOpen={showAuthorModal}
          onClose={() => setShowAuthorModal(false)}
          isBright={isBright}
        />
      )}

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}
