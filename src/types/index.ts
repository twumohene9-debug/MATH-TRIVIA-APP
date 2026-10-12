export type DifficultyTier = 'foundation' | 'developing' | 'advanced' | 'mastery';

export interface World {
  id: number; // 1 to 10
  title: string;
  stageRange: [number, number]; // [1, 10], [11, 20], etc.
  themeColor: string;
  accentColor: string;
  description: string;
  badge: string;
}

export interface Stage {
  id: number; // 1 to 100
  worldId: number; // 1 to 10
  title: string;
  description: string;
  subtopics: string[];
}

export interface WorkedSolution {
  given?: string;
  required?: string;
  method?: string;
  steps: string[];
  conclusion: string;
  misconceptions?: string[];
}

export interface Question {
  id: string;
  stageId: number;
  levelId: number;
  blockId: number;
  topic: string;
  area?: string;
  principle?: string; // Mathematical principle, formula, or archetype identifier
  difficulty: DifficultyTier;
  questionText: string;
  options: string[]; // exactly 3 options for stages 1-50, 4 options for stages 51-100
  correctAnswer: string;
  correctIndex: number; // 0, 1, 2, or 3
  solution: WorkedSolution;
  hint: string;
  isCustom?: boolean;
  blueprint?: {
    mainTopic: string;
    subtopic: string;
    skill: string;
    questionType: string;
    difficulty: DifficultyTier;
    mathematicalOperation: string;
    representation: string;
    context: string;
    numbersUsed: number[];
    expectedReasoning: string;
    conceptKey: string;
  };
}

export interface UserStats {
  totalAttempted: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalPoints: number;
  bestStreak: number;
  currentStreak: number;
  totalTimeSeconds: number;
  hintsUsed: number;
}

export interface UserSettings {
  isTimed: boolean;
  soundEnabled: boolean;
  explorerMode: boolean; // Allows unlocking all stages for free exploration/testing
  theme: 'bright' | 'royal';
  adminPassword?: string;
}

export interface PartProgress {
  completedQuizzes: number;
  totalPoints: number;
  bestScore: number;
}

export interface UserProgress {
  playerName: string;
  currentStage: number;
  currentLevel: number;
  currentBlock: number;
  completedBlocks: Record<string, boolean>; // key: `${stage}_${level}_${block}`
  completedLevels: Record<string, boolean>; // key: `${stage}_${level}`
  completedStages: Record<number, boolean>; // key: stageId
  unlockedStages: Record<number, boolean>;
  challengeLevel: number;
  challengeCompletedBlocks: number;
  bestChallengeLevel: number;
  partProgress?: Record<number, PartProgress>; // 10 Parts open curriculum tracking
  stats: UserStats;
  recentQuestionIds: string[];
  recentQuestionStems?: string[];
  recentTopics?: string[];
  recentConceptKeys?: string[];
  recentQuestionTypes?: string[];
  unlockedAchievements: string[];
  settings: UserSettings;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'progression' | 'streak' | 'accuracy' | 'mastery' | 'world' | 'speed';
  badgeIcon: string;
  unlockedAt?: string;
}
