import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, HelpCircle, ArrowLeft, Zap, ShieldCheck, Swords, BookOpen } from 'lucide-react';
import { Question, UserProgress } from '../types';
import { getBlockQuestions, getChallengeBlockQuestions, extractMathematicalConcept } from '../engine/questionBank';
import { getCurriculumPartBlockQuestions } from '../engine/partQuestionEngine';
import {
  recordQuestionResult,
  markBlockCompleted,
  markChallengeBlockCompleted,
  recordPartQuizCompleted,
  loadCustomQuestions,
} from '../engine/storage';
import { sounds } from '../engine/soundEffects';
import { getStage } from '../data/worldsAndStages';
import { getCurriculumPart } from '../data/curriculumParts';
import MathText from '../engine/mathRenderer';
import WorkedSolutionModal from './WorkedSolutionModal';
import CelebrationModal, { CelebrationType } from './CelebrationModal';

interface GamePlayerProps {
  stageId: number;
  levelId: number;
  blockId: number;
  progress: UserProgress;
  isChallengeMode?: boolean;
  curriculumPartId?: number;
  curriculumUnitId?: string;
  curriculumUnitName?: string;
  onUpdateProgress: (updated: UserProgress) => void;
  onExit: () => void;
  onToggleTimed?: (isTimed: boolean) => void;
  onNextChallenge?: () => void;
  onNextBlock?: () => void;
  onNextPartQuiz?: () => void;
}

export const GamePlayer: React.FC<GamePlayerProps> = ({
  stageId,
  levelId,
  blockId,
  progress,
  isChallengeMode = false,
  curriculumPartId,
  curriculumUnitId,
  curriculumUnitName,
  onUpdateProgress,
  onExit,
  onToggleTimed,
  onNextChallenge,
  onNextBlock,
  onNextPartQuiz,
}) => {
  const [retryAttempt, setRetryAttempt] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<{ qId: string; text: string } | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect' | 'timeout'>('idle');
  const [encouragementText, setEncouragementText] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [celebrationState, setCelebrationState] = useState<{
    show: boolean;
    type: CelebrationType;
    scoreGained: number;
  }>({ show: false, type: 'block', scoreGained: 0 });

  const playerName = progress.playerName || 'Mathematician';

  // Encouragements personalized with the player's name
  const ENCOURAGING_MESSAGES = [
    `Excellent, ${playerName}!`,
    `Brilliant thinking, ${playerName}!`,
    `Sharply solved, ${playerName}!`,
    `Great deduction, ${playerName}!`,
    `Flawless calculation, ${playerName}!`,
    `Mathematical mastery, ${playerName}!`,
    `Keep going, ${playerName}!`,
    `Well solved, ${playerName}!`,
  ];

  // Timer states (fixed 120s per question)
  const isTimed = progress.settings.isTimed;
  const timeLimit = 120;
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const hasTimedOutRef = useRef<boolean>(false);
  const questionsRef = useRef(questions);
  questionsRef.current = questions;

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // CRITICAL FIX: Ensure clean alternatives without ANY previous highlight when question advances
  useEffect(() => {
    setSelectedOption(null);
    setFeedbackState('idle');
    setShowHint(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [currentIndex]);

  const handleTimeout = useCallback(() => {
    if (hasTimedOutRef.current) return;
    hasTimedOutRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setFeedbackState('timeout');
    sounds.playIncorrect();

    const currentQ = questionsRef.current[currentIndexRef.current];
    if (currentQ) {
      const { updated } = recordQuestionResult(
        progressRef.current,
        false,
        120,
        0,
        currentQ.id,
        currentQ.questionText,
        currentQ.topic,
        currentQ.blueprint?.conceptKey,
        currentQ.blueprint?.questionType
      );
      onUpdateProgress(updated);
    }

    setShowSolutionModal(true);
  }, [onUpdateProgress]);

  // Load questions for this block
  const loadBlock = useCallback(() => {
    let loaded: Question[];
    if (curriculumPartId) {
      loaded = getCurriculumPartBlockQuestions({
        partId: curriculumPartId,
        unitId: curriculumUnitId,
        questionCount: 5,
        seed: Date.now() + retryAttempt * 777 + curriculumPartId * 419,
        recentQuestionIds: progressRef.current.recentQuestionIds,
        recentQuestionStems: progressRef.current.recentQuestionStems || [],
        recentTopics: progressRef.current.recentTopics || [],
        recentConceptKeys: progressRef.current.recentConceptKeys || [],
      });
    } else if (isChallengeMode) {
      loaded = getChallengeBlockQuestions({
        challengeLevel: stageId,
        retryAttempt,
        recentQuestionIds: progressRef.current.recentQuestionIds,
        recentQuestionStems: progressRef.current.recentQuestionStems || [],
        recentTopics: progressRef.current.recentTopics || [],
        recentConceptKeys: progressRef.current.recentConceptKeys || [],
        recentQuestionTypes: progressRef.current.recentQuestionTypes || [],
      });
    } else {
      const custom = loadCustomQuestions();
      loaded = getBlockQuestions({
        stageId,
        levelId,
        blockId,
        retryAttempt,
        customQuestions: custom,
        recentQuestionIds: progressRef.current.recentQuestionIds,
        recentQuestionStems: progressRef.current.recentQuestionStems || [],
        recentTopics: progressRef.current.recentTopics || [],
        recentConceptKeys: progressRef.current.recentConceptKeys || [],
        recentQuestionTypes: progressRef.current.recentQuestionTypes || [],
      });
    }
    setQuestions(loaded);
    setCurrentIndex(0);
    setSelectedOption(null);
    setFeedbackState('idle');
    setShowHint(false);
    setShowSolutionModal(false);
    setTimeLeft(120);
    hasTimedOutRef.current = false;
    startTimeRef.current = Date.now();
  }, [stageId, levelId, blockId, retryAttempt, isChallengeMode, curriculumPartId, curriculumUnitId]);

  useEffect(() => {
    loadBlock();
  }, [loadBlock]);

  // Handle timer countdown (120s per question)
  useEffect(() => {
    if (!isTimed || feedbackState !== 'idle' || questions.length === 0 || showSolutionModal) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    hasTimedOutRef.current = false;
    setTimeLeft(120);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setTimeout(() => {
            handleTimeout();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimed, feedbackState, questions.length, showSolutionModal, currentIndex, handleTimeout]);

  const handleOptionSelect = (optionText: string) => {
    if (feedbackState !== 'idle') return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const currentQ = questions[currentIndex];
    setSelectedOption({ qId: currentQ.id, text: optionText });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const isCorrect = optionText === currentQ.correctAnswer;
    const timeTaken = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    if (isCorrect) {
      setFeedbackState('correct');
      sounds.playCorrect();

      // Points formula: 100 base + streak bonus + speed bonus
      const streakBonus = Math.min(200, progress.stats.currentStreak * 15);
      const speedBonus = isTimed ? Math.max(0, timeLeft * 4) : 0;
      const points = 100 + streakBonus + speedBonus;

      // Pick varied encouraging message personalized with name
      const msg = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
      setEncouragementText(msg);

      const currentQConcept = extractMathematicalConcept(
        currentQ.questionText,
        currentQ.topic,
        currentQ.blueprint?.conceptKey
      );
      const { updated } = recordQuestionResult(
        progress,
        true,
        timeTaken,
        points,
        currentQ.id,
        currentQ.questionText,
        currentQ.topic,
        currentQConcept,
        currentQ.blueprint?.questionType || currentQ.topic
      );
      onUpdateProgress(updated);

      // Auto-advance or trigger block complete
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setSelectedOption(null);
          setFeedbackState('idle');
          setShowHint(false);
          setTimeLeft(120);
          hasTimedOutRef.current = false;
          startTimeRef.current = Date.now();
          (document.activeElement as HTMLElement)?.blur();
        } else {
          // Block Conquered!
          sounds.playBlockComplete();
          const blockTopics = questionsRef.current.map(q => q.topic);
          const blockConcepts = questionsRef.current.map(q =>
            extractMathematicalConcept(q.questionText, q.topic, q.blueprint?.conceptKey)
          );
          const blockStems = questionsRef.current.map(q => q.questionText);

          if (curriculumPartId) {
            const { updated: finalProgress } = recordPartQuizCompleted(
              updated,
              curriculumPartId,
              points * questions.length,
              points * questions.length,
              blockTopics,
              blockConcepts,
              blockStems
            );
            onUpdateProgress(finalProgress);
            setCelebrationState({
              show: true,
              type: 'part',
              scoreGained: points * questions.length,
            });
          } else if (isChallengeMode) {
            const { updated: finalProgress } = markChallengeBlockCompleted(
              updated,
              stageId,
              blockTopics,
              blockConcepts,
              blockStems
            );
            onUpdateProgress(finalProgress);
            setCelebrationState({
              show: true,
              type: 'challenge',
              scoreGained: points * questions.length + 300,
            });
          } else {
            const { updated: finalProgress, levelCompleted, stageCompleted } = markBlockCompleted(
              updated,
              stageId,
              levelId,
              blockId,
              blockTopics,
              blockConcepts,
              blockStems
            );
            onUpdateProgress(finalProgress);

            let cType: CelebrationType = 'block';
            if (stageId === 100 && stageCompleted) {
              cType = 'game_complete';
            } else if (stageCompleted) {
              cType = 'stage';
              sounds.playStageComplete();
            } else if (levelCompleted) {
              cType = 'level';
              sounds.playLevelComplete();
            }

            setCelebrationState({
              show: true,
              type: cType,
              scoreGained: points * questions.length,
            });
          }
        }
      }, 700);
    } else {
      // Incorrect answer
      setFeedbackState('incorrect');
      sounds.playIncorrect();

      const currentQConcept = extractMathematicalConcept(
        currentQ.questionText,
        currentQ.topic,
        currentQ.blueprint?.conceptKey
      );
      const { updated } = recordQuestionResult(
        progress,
        false,
        timeTaken,
        0,
        currentQ.id,
        currentQ.questionText,
        currentQ.topic,
        currentQConcept,
        currentQ.blueprint?.questionType || currentQ.topic
      );
      onUpdateProgress(updated);

      setTimeout(() => {
        setShowSolutionModal(true);
      }, 500);
    }
  };

  const handleRetryBlock = () => {
    setShowSolutionModal(false);
    setSelectedOption(null);
    setFeedbackState('idle');
    setRetryAttempt(prev => prev + 1);
  };

  const handleNextFromCelebration = () => {
    setCelebrationState({ show: false, type: 'block', scoreGained: 0 });
    setSelectedOption(null);
    setFeedbackState('idle');
    setRetryAttempt(0);
    if (curriculumPartId) {
      if (onNextPartQuiz) {
        onNextPartQuiz();
      } else {
        onExit();
      }
    } else if (isChallengeMode) {
      if (onNextChallenge) {
        onNextChallenge();
      } else {
        onExit();
      }
    } else {
      if (onNextBlock) {
        onNextBlock();
      } else {
        onExit();
      }
    }
  };

  const isBright = progress.settings.theme !== 'royal';

  if (questions.length === 0) {
    return (
      <div
        className={`min-h-[60vh] flex flex-col items-center justify-center p-6 font-mono-numbers gap-3 ${
          isBright ? 'text-[#161c4f]' : 'text-white'
        }`}
      >
        <div className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
        <span className="text-sm font-semibold">Generating mathematical challenges...</span>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const stageInfo = !isChallengeMode ? getStage(stageId) : null;
  const optionLetters = ['A', 'B', 'C', 'D'];

  // Timer visual progress (120s max)
  const isUrgent = isTimed && timeLeft <= 20;

  return (
    <div className="min-h-full py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col justify-between">
      {/* Top Hud */}
      <div>
        <div
          className={`flex items-center justify-between border-b pb-3 mb-4 ${
            isBright ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <button
            onClick={onExit}
            className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
              isBright ? 'text-slate-600 hover:text-[#161c4f]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            {curriculumPartId ? 'Exit Curriculum Quiz' : isChallengeMode ? 'Exit Challenge' : 'Exit Block'}
          </button>

          <div className="flex items-center gap-2 text-xs font-mono-numbers">
            <span className={isBright ? 'text-pink-600 font-bold' : 'text-pink-400 font-bold'}>
              {curriculumPartId
                ? `Part ${curriculumPartId}`
                : isChallengeMode
                ? `Challenge Level ${stageId}`
                : `Stage ${stageId}`}
            </span>
            <span className={isBright ? 'text-slate-300' : 'text-slate-600'}>·</span>
            <span className={isBright ? 'text-slate-700 font-medium' : 'text-slate-300 font-medium'}>
              {curriculumPartId
                ? (curriculumUnitName || `Open Curriculum Quiz`)
                : isChallengeMode
                ? 'Multi-Topic Gauntlet'
                : `Level ${levelId}`}
            </span>
            <span className={isBright ? 'text-slate-300' : 'text-slate-600'}>·</span>
            <span className={isBright ? 'text-slate-700 font-medium' : 'text-slate-300 font-medium'}>
              {`Q${currentIndex + 1}/${questions.length}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-1 text-xs font-mono-numbers font-bold px-2.5 py-1 rounded-lg border ${
                isBright
                  ? 'bg-pink-50 border-pink-200 text-pink-700'
                  : 'bg-pink-950/40 border-pink-900/50 text-pink-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              {progress.stats.currentStreak}
            </span>
          </div>
        </div>

        {/* Dynamic Progress Segment Tracker matching exact question count per block */}
        <div className="flex items-center gap-1.5 mb-6">
          {Array.from({ length: questions.length }).map((_, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-500'
                    : isCurrent
                    ? 'bg-pink-600 ring-2 ring-pink-400/40'
                    : isBright
                    ? 'bg-slate-200'
                    : 'bg-slate-800'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Question Card - Unique Key per question ensures clean mount */}
      <div
        key={`card-${currentQuestion.id}`}
        className={`rounded-3xl backdrop-blur-md shadow-xl relative overflow-hidden mb-6 border transition-colors ${
          isBright
            ? 'bg-white border-slate-200/90 shadow-indigo-950/5'
            : 'bg-[#12173f] border-indigo-900/60 shadow-black/40'
        }`}
      >
        {/* Navy & Magenta Accent Stripe from logo */}
        <div className="theme-stripes-top w-full" />

        <div className="p-6 sm:p-8">
          {/* Question Header & Timer Bar */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-xs font-mono-numbers">
              <span className={`font-bold ${isBright ? 'text-[#161c4f]' : 'text-white'}`}>
                Q{currentIndex + 1} of {questions.length}
              </span>
              <span aria-hidden="true" className={isBright ? 'text-slate-300' : 'text-slate-600'}>
                ·
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold truncate max-w-[340px] ${
                  isBright
                    ? 'bg-pink-50 text-pink-700 border border-pink-200'
                    : 'bg-pink-950/40 text-pink-300 border border-pink-900/50'
                }`}
                title={currentQuestion.area ? `${currentQuestion.area} · ${currentQuestion.topic}` : currentQuestion.topic}
              >
                {currentQuestion.area ? (
                  <>
                    <span className="opacity-75 font-normal">{currentQuestion.area}:</span>{' '}
                    <span className="font-bold">{currentQuestion.topic}</span>
                  </>
                ) : (
                  <span>Topic: {currentQuestion.topic}</span>
                )}
              </span>
            </div>

            {/* Timer Display and On-the-fly Toggle */}
            <div className="flex items-center gap-2">
              {isTimed ? (
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-numbers font-bold border transition-colors ${
                      isUrgent
                        ? 'bg-rose-50 border-rose-500 text-rose-600 animate-pulse'
                        : isBright
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-slate-900 border-indigo-900 text-slate-300'
                    }`}
                  >
                    <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-500' : 'text-pink-600'}`} />
                    <span>{timeLeft}s / 120s</span>
                  </div>
                  {onToggleTimed && (
                    <button
                      onClick={() => onToggleTimed(false)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-colors ${
                        isBright
                          ? 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title="Switch to untimed mode"
                    >
                      Make Untimed
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono-numbers px-2.5 py-1 rounded-full border ${
                      isBright
                        ? 'bg-slate-100 border-slate-200 text-slate-600'
                        : 'bg-slate-900 border-indigo-900 text-slate-400'
                    }`}
                  >
                    Untimed Mode
                  </span>
                  {onToggleTimed && (
                    <button
                      onClick={() => onToggleTimed(true)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 font-semibold cursor-pointer transition-colors"
                      title="Enable 120-second timer challenge"
                    >
                      + 120s Timer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Question Content */}
          <div className="my-6">
            <div
              className={`text-lg sm:text-xl md:text-2xl font-medium leading-relaxed font-sans ${
                isBright ? 'text-[#161c4f]' : 'text-white'
              }`}
            >
              <MathText text={currentQuestion.questionText} />
            </div>
          </div>

          {/* Positive Encouragement Toast */}
          {feedbackState === 'correct' && (
            <div className="my-3 py-2 px-4 rounded-xl bg-emerald-50 border border-emerald-400 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {encouragementText}
            </div>
          )}

          {/* Hint Box (Disabled for Challenges) */}
          {!isChallengeMode && showHint && (
            <div
              className={`my-3 p-3.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
                isBright
                  ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                  : 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200'
              }`}
            >
              <span className={`font-semibold block mb-1 ${isBright ? 'text-indigo-800' : 'text-indigo-300'}`}>
                Mathematical Guide:
              </span>
              <MathText text={currentQuestion.hint} />
            </div>
          )}

          {/* Interactive Alternatives: 3 options (A, B, C) for Stages 1-50, 4 options (A, B, C, D) for Stages 51-100 */}
          <div
            key={`qopts-${currentIndex}-${currentQuestion.id}`}
            className={`grid gap-3.5 mt-6 ${
              currentQuestion.options.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2'
            }`}
          >
            {currentQuestion.options.map((optText, idx) => {
              const letter = optionLetters[idx];
              const isSelected =
                feedbackState !== 'idle' &&
                selectedOption?.qId === currentQuestion.id &&
                selectedOption.text === optText;
              const isCorrect = feedbackState !== 'idle' && optText === currentQuestion.correctAnswer;

              let buttonStyle = isBright
                ? 'bg-slate-50/90 border-slate-200 text-slate-800 hover:border-pink-500 hover:bg-pink-50/30'
                : 'bg-slate-900/80 border-indigo-950 text-slate-200 hover:border-pink-500/60 hover:bg-slate-850';

              if (feedbackState === 'correct' && isCorrect) {
                buttonStyle =
                  'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/50';
              } else if ((feedbackState === 'incorrect' || feedbackState === 'timeout') && isCorrect) {
                buttonStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950';
              } else if (feedbackState === 'incorrect' && isSelected && !isCorrect) {
                buttonStyle = 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/50';
              }

              return (
                <button
                  key={`btn-${currentIndex}-${currentQuestion.id}-opt-${idx}`}
                  disabled={feedbackState !== 'idle'}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    handleOptionSelect(optText);
                  }}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all duration-150 cursor-pointer disabled:cursor-default shadow-xs outline-none focus:outline-none ${buttonStyle}`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 font-mono-numbers ${
                      isBright
                        ? 'bg-[#161c4f] text-white shadow-xs'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base font-medium flex-1 overflow-x-auto">
                    <MathText text={optText} inline />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Hint & Controls */}
      <div
        className={`flex items-center justify-between gap-3 text-xs ${
          isBright ? 'text-slate-500' : 'text-slate-400'
        }`}
      >
        {!isChallengeMode ? (
          <button
            onClick={() => setShowHint(prev => !prev)}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors cursor-pointer border ${
              isBright
                ? 'hover:bg-slate-100 text-slate-600 hover:text-[#161c4f] border-slate-200'
                : 'hover:bg-slate-900 text-slate-400 hover:text-pink-300 border-indigo-900/50'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-pink-600" />
            {showHint ? 'Hide Hint' : 'Request Hint'}
          </button>
        ) : (
          <div />
        )}

        <span className={`font-mono-numbers text-[11px] ${isBright ? 'text-slate-400' : 'text-slate-500'}`}>
          Question ID: {currentQuestion.id}
        </span>
      </div>

      {/* Worked Solution Modal (Triggered on wrong answer or timeout) */}
      {showSolutionModal && (
        <WorkedSolutionModal
          question={currentQuestion}
          userSelectedOption={selectedOption?.text || null}
          isTimeout={feedbackState === 'timeout'}
          playerName={playerName}
          onRetry={handleRetryBlock}
          onExit={onExit}
        />
      )}

      {/* Celebration Modal (Triggered on block/level/stage completion) */}
      {celebrationState.show && (
        <CelebrationModal
          type={celebrationState.type}
          stageId={stageId}
          levelId={levelId}
          blockId={blockId}
          scoreGained={celebrationState.scoreGained}
          totalQuestions={questions.length}
          progress={progress}
          onNext={handleNextFromCelebration}
          onViewLevelMap={onExit}
        />
      )}
    </div>
  );
};

export default GamePlayer;
