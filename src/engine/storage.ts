import { UserProgress, Question } from '../types';
import { checkAchievements } from './achievements';

const STORAGE_KEY_PROGRESS = 'math_mastery_user_progress_v1';
const STORAGE_KEY_CUSTOM_QUESTIONS = 'math_mastery_custom_questions_v1';

export const DEFAULT_PROGRESS: UserProgress = {
  playerName: '',
  currentStage: 1,
  currentLevel: 1,
  currentBlock: 1,
  completedBlocks: {},
  completedLevels: {},
  completedStages: {},
  unlockedStages: { 1: true },
  challengeLevel: 1,
  challengeCompletedBlocks: 0,
  bestChallengeLevel: 1,
  stats: {
    totalAttempted: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalPoints: 0,
    bestStreak: 0,
    currentStreak: 0,
    totalTimeSeconds: 0,
    hintsUsed: 0,
  },
  recentQuestionIds: [],
  recentQuestionStems: [],
  recentTopics: [],
  recentConceptKeys: [],
  recentQuestionTypes: [],
  unlockedAchievements: [],
  settings: {
    isTimed: false, // Default is Untimed as requested
    soundEnabled: true,
    explorerMode: false,
    theme: 'bright', // Joyful bright theme inspired by personal logo
  },
};

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    const loadedSettings = parsed.settings || {};
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      playerName: parsed.playerName || '',
      challengeLevel: parsed.challengeLevel || 1,
      challengeCompletedBlocks: parsed.challengeCompletedBlocks || 0,
      bestChallengeLevel: parsed.bestChallengeLevel || 1,
      recentQuestionStems: parsed.recentQuestionStems || [],
      recentTopics: parsed.recentTopics || [],
      recentConceptKeys: parsed.recentConceptKeys || [],
      recentQuestionTypes: parsed.recentQuestionTypes || [],
      stats: { ...DEFAULT_PROGRESS.stats, ...(parsed.stats || {}) },
      settings: {
        ...DEFAULT_PROGRESS.settings,
        ...loadedSettings,
        // Ensure default isTimed is false if not explicitly set by user recently
        isTimed: typeof loadedSettings.isTimed === 'boolean' ? loadedSettings.isTimed : false,
        theme: loadedSettings.theme || 'bright',
      },
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progress to localStorage', err);
  }
}

export function recordQuestionResult(
  prev: UserProgress,
  isCorrect: boolean,
  timeTaken: number,
  points: number,
  qId: string,
  questionStem?: string,
  questionTopic?: string,
  conceptKey?: string,
  questionType?: string
): { updated: UserProgress; newAchievements: string[] } {
  const currentStems = prev.recentQuestionStems || [];
  const updatedStems = questionStem
    ? [questionStem.trim(), ...currentStems.filter(s => s !== questionStem.trim())].slice(0, 50)
    : currentStems;

  const currentTopics = prev.recentTopics || [];
  const updatedTopics = questionTopic
    ? [questionTopic.trim(), ...currentTopics.filter(t => t.trim().toLowerCase() !== questionTopic.trim().toLowerCase())].slice(0, 30)
    : currentTopics;

  const currentConcepts = prev.recentConceptKeys || [];
  const updatedConcepts = conceptKey
    ? [conceptKey.trim(), ...currentConcepts.filter(c => c !== conceptKey.trim())].slice(0, 50)
    : currentConcepts;

  const currentTypes = prev.recentQuestionTypes || [];
  const updatedTypes = questionType
    ? [questionType.trim(), ...currentTypes.filter(t => t !== questionType.trim())].slice(0, 20)
    : currentTypes;

  const updated: UserProgress = {
    ...prev,
    stats: {
      ...prev.stats,
      totalAttempted: prev.stats.totalAttempted + 1,
      totalCorrect: isCorrect ? prev.stats.totalCorrect + 1 : prev.stats.totalCorrect,
      totalIncorrect: !isCorrect ? prev.stats.totalIncorrect + 1 : prev.stats.totalIncorrect,
      totalPoints: prev.stats.totalPoints + points,
      currentStreak: isCorrect ? prev.stats.currentStreak + 1 : 0,
      bestStreak: isCorrect
        ? Math.max(prev.stats.bestStreak, prev.stats.currentStreak + 1)
        : prev.stats.bestStreak,
      totalTimeSeconds: prev.stats.totalTimeSeconds + Math.max(0, timeTaken),
    },
    recentQuestionIds: [qId, ...prev.recentQuestionIds.slice(0, 49)],
    recentQuestionStems: updatedStems,
    recentTopics: updatedTopics,
    recentConceptKeys: updatedConcepts,
    recentQuestionTypes: updatedTypes,
  };

  const newAchievements = checkAchievements(updated);
  if (newAchievements.length > 0) {
    updated.unlockedAchievements = [...updated.unlockedAchievements, ...newAchievements];
  }

  saveProgress(updated);
  return { updated, newAchievements };
}

export function markBlockCompleted(
  prev: UserProgress,
  stageId: number,
  levelId: number,
  blockId: number,
  blockTopics?: string[],
  blockConcepts?: string[],
  blockStems?: string[]
): {
  updated: UserProgress;
  levelCompleted: boolean;
  stageCompleted: boolean;
  newAchievements: string[];
} {
  const blockKey = `${stageId}_${levelId}_${blockId}`;
  const updatedCompletedBlocks = { ...prev.completedBlocks, [blockKey]: true };

  // Check if all 10 blocks in this level are completed
  let allBlocksDone = true;
  for (let b = 1; b <= 10; b++) {
    if (!updatedCompletedBlocks[`${stageId}_${levelId}_${b}`]) {
      allBlocksDone = false;
      break;
    }
  }

  const levelKey = `${stageId}_${levelId}`;
  const updatedCompletedLevels = {
    ...prev.completedLevels,
    ...(allBlocksDone ? { [levelKey]: true } : {}),
  };

  // Check if all 20 levels in this stage are completed
  let allLevelsDone = true;
  for (let l = 1; l <= 20; l++) {
    if (!updatedCompletedLevels[`${stageId}_${l}`]) {
      allLevelsDone = false;
      break;
    }
  }

  const updatedCompletedStages = {
    ...prev.completedStages,
    ...(allLevelsDone ? { [stageId]: true } : {}),
  };

  // Unlock next stage if this stage is completed, or next level in progression
  const updatedUnlockedStages = { ...prev.unlockedStages };
  if (allLevelsDone && stageId < 100) {
    updatedUnlockedStages[stageId + 1] = true;
  }

  // Compute next current position
  let nextStage = stageId;
  let nextLevel = levelId;
  let nextBlock = blockId < 10 ? blockId + 1 : 1;

  if (blockId === 10) {
    if (levelId < 20) {
      nextLevel = levelId + 1;
    } else if (stageId < 100) {
      nextStage = stageId + 1;
      nextLevel = 1;
    }
  }

  const currentTopics = prev.recentTopics || [];
  const updatedTopics = blockTopics && blockTopics.length > 0
    ? Array.from(new Set([...blockTopics.map(t => t.trim()), ...currentTopics])).slice(0, 40)
    : currentTopics;

  const currentConcepts = prev.recentConceptKeys || [];
  const updatedConcepts = blockConcepts && blockConcepts.length > 0
    ? Array.from(new Set([...blockConcepts.map(c => c.trim()), ...currentConcepts])).slice(0, 50)
    : currentConcepts;

  const currentStems = prev.recentQuestionStems || [];
  const updatedStems = blockStems && blockStems.length > 0
    ? Array.from(new Set([...blockStems.map(s => s.trim()), ...currentStems])).slice(0, 50)
    : currentStems;

  const updated: UserProgress = {
    ...prev,
    currentStage: nextStage,
    currentLevel: nextLevel,
    currentBlock: nextBlock,
    completedBlocks: updatedCompletedBlocks,
    completedLevels: updatedCompletedLevels,
    completedStages: updatedCompletedStages,
    unlockedStages: updatedUnlockedStages,
    recentTopics: updatedTopics,
    recentConceptKeys: updatedConcepts,
    recentQuestionStems: updatedStems,
  };

  const newAchievements = checkAchievements(updated);
  if (newAchievements.length > 0) {
    updated.unlockedAchievements = [...updated.unlockedAchievements, ...newAchievements];
  }

  saveProgress(updated);
  return {
    updated,
    levelCompleted: allBlocksDone,
    stageCompleted: allLevelsDone,
    newAchievements,
  };
}

export function markChallengeBlockCompleted(
  prev: UserProgress,
  level: number,
  blockTopics?: string[],
  blockConcepts?: string[],
  blockStems?: string[]
): { updated: UserProgress; newAchievements: string[] } {
  const nextLevel = level + 1;
  const currentTopics = prev.recentTopics || [];
  const updatedTopics = blockTopics && blockTopics.length > 0
    ? Array.from(new Set([...blockTopics.map(t => t.trim()), ...currentTopics])).slice(0, 40)
    : currentTopics;

  const currentConcepts = prev.recentConceptKeys || [];
  const updatedConcepts = blockConcepts && blockConcepts.length > 0
    ? Array.from(new Set([...blockConcepts.map(c => c.trim()), ...currentConcepts])).slice(0, 50)
    : currentConcepts;

  const currentStems = prev.recentQuestionStems || [];
  const updatedStems = blockStems && blockStems.length > 0
    ? Array.from(new Set([...blockStems.map(s => s.trim()), ...currentStems])).slice(0, 50)
    : currentStems;

  const updated: UserProgress = {
    ...prev,
    challengeLevel: nextLevel,
    challengeCompletedBlocks: (prev.challengeCompletedBlocks || 0) + 1,
    bestChallengeLevel: Math.max(prev.bestChallengeLevel || 1, nextLevel),
    recentTopics: updatedTopics,
    recentConceptKeys: updatedConcepts,
    recentQuestionStems: updatedStems,
    stats: {
      ...prev.stats,
      totalPoints: prev.stats.totalPoints + 300,
    },
  };
  const newAchievements = checkAchievements(updated);
  if (newAchievements.length > 0) {
    updated.unlockedAchievements = [...updated.unlockedAchievements, ...newAchievements];
  }
  saveProgress(updated);
  return { updated, newAchievements };
}

export function recordPartQuizCompleted(
  prev: UserProgress,
  partId: number,
  points: number,
  score: number,
  topicsSeen: string[] = [],
  conceptsSeen: string[] = [],
  stemsSeen: string[] = []
): { updated: UserProgress; newAchievements: string[] } {
  const currentPartMap = prev.partProgress || {};
  const prevPartData = currentPartMap[partId] || { completedQuizzes: 0, totalPoints: 0, bestScore: 0 };

  const updatedPartMap = {
    ...currentPartMap,
    [partId]: {
      completedQuizzes: prevPartData.completedQuizzes + 1,
      totalPoints: prevPartData.totalPoints + points,
      bestScore: Math.max(prevPartData.bestScore, score),
    },
  };

  const currentTopics = prev.recentTopics || [];
  const updatedTopics = topicsSeen && topicsSeen.length > 0
    ? Array.from(new Set([...topicsSeen.map(t => t.trim()), ...currentTopics])).slice(0, 40)
    : currentTopics;

  const currentConcepts = prev.recentConceptKeys || [];
  const updatedConcepts = conceptsSeen && conceptsSeen.length > 0
    ? Array.from(new Set([...conceptsSeen.map(c => c.trim()), ...currentConcepts])).slice(0, 50)
    : currentConcepts;

  const currentStems = prev.recentQuestionStems || [];
  const updatedStems = stemsSeen && stemsSeen.length > 0
    ? Array.from(new Set([...stemsSeen.map(s => s.trim()), ...currentStems])).slice(0, 50)
    : currentStems;

  const updated: UserProgress = {
    ...prev,
    partProgress: updatedPartMap,
    recentTopics: updatedTopics,
    recentConceptKeys: updatedConcepts,
    recentQuestionStems: updatedStems,
    stats: {
      ...prev.stats,
      totalPoints: prev.stats.totalPoints + points,
    },
  };

  const newAchievements = checkAchievements(updated);
  if (newAchievements.length > 0) {
    updated.unlockedAchievements = [...updated.unlockedAchievements, ...newAchievements];
  }

  saveProgress(updated);
  return { updated, newAchievements };
}

export function loadCustomQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_QUESTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_QUESTIONS, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save custom questions', err);
  }
}

export function exportSaveData(): string {
  const progress = loadProgress();
  const custom = loadCustomQuestions();
  return JSON.stringify({ progress, customQuestions: custom, exportedAt: new Date().toISOString() }, null, 2);
}

export function importSaveData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.progress) {
      saveProgress(data.progress);
    }
    if (Array.isArray(data.customQuestions)) {
      saveCustomQuestions(data.customQuestions);
    }
    return true;
  } catch {
    return false;
  }
}

export function resetSaveData(): UserProgress {
  const fresh = { ...DEFAULT_PROGRESS };
  saveProgress(fresh);
  return fresh;
}
