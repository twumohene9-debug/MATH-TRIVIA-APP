import { Achievement, UserProgress } from '../types';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_correct',
    title: 'First Correct Answer',
    description: 'Solve your very first mathematical question correctly.',
    category: 'progression',
    badgeIcon: '🎯',
  },
  {
    id: 'first_block',
    title: 'First Block Conquered',
    description: 'Successfully complete all 10 questions in a single block.',
    category: 'progression',
    badgeIcon: '🧱',
  },
  {
    id: 'first_level',
    title: 'First Level Cleared',
    description: 'Complete all 10 blocks in a level (100 questions).',
    category: 'progression',
    badgeIcon: '⭐',
  },
  {
    id: 'first_stage',
    title: 'First Stage Mastered',
    description: 'Complete all 20 levels in Stage 1.',
    category: 'progression',
    badgeIcon: '🌟',
  },
  {
    id: 'streak_10',
    title: 'Hot Streak',
    description: 'Answer 10 questions correctly in a row.',
    category: 'streak',
    badgeIcon: '🔥',
  },
  {
    id: 'streak_25',
    title: 'Unstoppable Mind',
    description: 'Achieve a consecutive correct answer streak of 25.',
    category: 'streak',
    badgeIcon: '⚡',
  },
  {
    id: 'hundred_correct',
    title: 'Centurion of Math',
    description: 'Accumulate 100 correct answers across your adventure.',
    category: 'accuracy',
    badgeIcon: '💯',
  },
  {
    id: 'five_hundred_correct',
    title: 'Grand Reckoner',
    description: 'Accumulate 500 correct answers.',
    category: 'accuracy',
    badgeIcon: '🎖️',
  },
  {
    id: 'thousand_correct',
    title: 'Millennium Thinker',
    description: 'Answer 1,000 mathematical questions correctly.',
    category: 'accuracy',
    badgeIcon: '🏛️',
  },
  {
    id: 'speed_solver',
    title: 'Speed Solver',
    description: 'Complete a timed block with over 50% time remaining on average.',
    category: 'speed',
    badgeIcon: '⏱️',
  },
  {
    id: 'stages_10',
    title: 'Number Foundations Master',
    description: 'Complete all 10 stages of World 1.',
    category: 'world',
    badgeIcon: '🏔️',
  },
  {
    id: 'stages_25',
    title: 'Quarter Century',
    description: 'Conquer 25 full stages in your journey.',
    category: 'world',
    badgeIcon: '🚀',
  },
  {
    id: 'stages_50',
    title: 'Halfway to Infinity',
    description: 'Complete 50 stages across the mathematical realms.',
    category: 'world',
    badgeIcon: '🌌',
  },
  {
    id: 'stages_75',
    title: 'High Altitude Theorist',
    description: 'Conquer 75 stages of increasingly sophisticated mathematics.',
    category: 'world',
    badgeIcon: '🌠',
  },
  {
    id: 'stages_100',
    title: '100 Stages Complete',
    description: 'Conquer all 100 stages of the mathematical odyssey.',
    category: 'world',
    badgeIcon: '🏆',
  },
  {
    id: 'algebra_master',
    title: 'Algebra Master',
    description: 'Master the Algebraic World (Stages 31–40).',
    category: 'mastery',
    badgeIcon: '📐',
  },
  {
    id: 'geometry_master',
    title: 'Geometry Master',
    description: 'Master the Geometry & Measurement World (Stages 41–50).',
    category: 'mastery',
    badgeIcon: '📏',
  },
  {
    id: 'statistics_master',
    title: 'Statistics Master',
    description: 'Master data analysis, distributions, and spread in World 6.',
    category: 'mastery',
    badgeIcon: '📊',
  },
  {
    id: 'calculus_master',
    title: 'Calculus Master',
    description: 'Conquer limits, derivatives, and integrals in Higher Math (World 9).',
    category: 'mastery',
    badgeIcon: '∫',
  },
  {
    id: 'number_theory_master',
    title: 'Number Theory Master',
    description: 'Conquer modular arithmetic and primes in Stage 94.',
    category: 'mastery',
    badgeIcon: '🗝️',
  },
  {
    id: 'mathematical_explorer',
    title: 'Mathematical Explorer',
    description: 'Attempt problems across 5 different mathematical worlds.',
    category: 'progression',
    badgeIcon: '🧭',
  },
  {
    id: 'ultimate_problem_solver',
    title: 'Ultimate Problem Solver',
    description: 'Complete Stage 99 — Ultimate Mathematics Challenge.',
    category: 'mastery',
    badgeIcon: '💎',
  },
  {
    id: 'mathematical_master',
    title: 'MATHEMATICAL MASTER',
    description: 'Conquer Stage 100 and attain the supreme crown of Mathematics.',
    category: 'mastery',
    badgeIcon: '👑',
  },
];

/**
 * Checks UserProgress against all achievements and returns newly unlocked IDs.
 */
export function checkAchievements(progress: UserProgress): string[] {
  const currentUnlocked = new Set(progress.unlockedAchievements);
  const newlyUnlocked: string[] = [];

  const completedStagesCount = Object.values(progress.completedStages).filter(Boolean).length;
  const completedBlocksCount = Object.values(progress.completedBlocks).filter(Boolean).length;
  const completedLevelsCount = Object.values(progress.completedLevels).filter(Boolean).length;

  const conditions: Record<string, boolean> = {
    first_correct: progress.stats.totalCorrect >= 1,
    first_block: completedBlocksCount >= 1,
    first_level: completedLevelsCount >= 1,
    first_stage: !!progress.completedStages[1],
    streak_10: progress.stats.bestStreak >= 10,
    streak_25: progress.stats.bestStreak >= 25,
    hundred_correct: progress.stats.totalCorrect >= 100,
    five_hundred_correct: progress.stats.totalCorrect >= 500,
    thousand_correct: progress.stats.totalCorrect >= 1000,
    stages_10: completedStagesCount >= 10,
    stages_25: completedStagesCount >= 25,
    stages_50: completedStagesCount >= 50,
    stages_75: completedStagesCount >= 75,
    stages_100: completedStagesCount >= 100,
    algebra_master: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40].every(s => progress.completedStages[s]),
    geometry_master: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50].every(s => progress.completedStages[s]),
    statistics_master: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60].every(s => progress.completedStages[s]),
    calculus_master: [81, 82, 83, 84, 85].every(s => progress.completedStages[s]),
    number_theory_master: !!progress.completedStages[94],
    mathematical_explorer: completedStagesCount >= 5,
    ultimate_problem_solver: !!progress.completedStages[99],
    mathematical_master: !!progress.completedStages[100],
  };

  for (const [id, isMet] of Object.entries(conditions)) {
    if (isMet && !currentUnlocked.has(id)) {
      newlyUnlocked.push(id);
    }
  }

  return newlyUnlocked;
}
