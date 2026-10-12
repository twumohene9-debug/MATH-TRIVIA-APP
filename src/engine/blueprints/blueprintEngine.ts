import { Question, DifficultyTier } from '../../types';
import { PRNG, buildOptions } from '../generators/shared';
import { getCurriculumTopic, getAreaIndexForStage } from '../../data/curriculum1000';
import { getStage, getDifficultyTier } from '../../data/worldsAndStages';
import { generateQuestion } from '../questionGenerators';
import { QuestionDiversityTracker } from './tracker';
import {
  generateArithmeticArchetype,
  generateFractionsDecimalsPercentagesArchetype,
  generateAlgebraRatioArchetype,
  generateGeometryArchetype,
  generateStatisticsProbabilityArchetype,
  generateFinancialAppliedArchetype,
  verifyBlueprintArtifact,
} from './curriculumSystem';
import { generateTopicQuestion } from '../topicQuestionEngine';
import { QuestionType, QuestionBlueprint } from './types';

/**
 * Intelligent Question Generation Engine:
 * Transforms raw stage/topic slots into purposeful, mathematically rigorous,
 * blueprint-driven questions with conceptual duplicate prevention and format rotation.
 */
export function generateIntelligentQuestion(params: {
  stageId: number;
  levelId: number;
  blockId: number;
  questionIndex: number;
  seed: number;
  explicitSubtopic?: number;
  tracker?: QuestionDiversityTracker;
}): Question {
  const { stageId, levelId, blockId, questionIndex, seed, explicitSubtopic, tracker } = params;
  const prng = new PRNG(seed);
  const tier = getDifficultyTier(levelId);
  const qId = `S${stageId}-L${levelId}-B${blockId}-Q${questionIndex + 1}`;

  const blockOffset = ((blockId - 1) * 3) % 10;
  const effectiveSubtopic = explicitSubtopic !== undefined
    ? Math.max(0, Math.min(9, Math.floor(explicitSubtopic)))
    : (questionIndex + blockOffset) % 10;

  const curriculumTopic = getCurriculumTopic(stageId, effectiveSubtopic);
  const areaIdx = getAreaIndexForStage(stageId);

  // Determine preferred QuestionType via Diversity Tracker rotation
  const candidateTypes: QuestionType[] = [
    'direct_calculation',
    'reverse_operation',
    'missing_value',
    'comparison',
    'multi_step',
    'word_problem',
    'error_analysis',
    'reasoning',
  ];
  const preferredType = tracker
    ? tracker.pickPreferredQuestionType(candidateTypes, seed + questionIndex * 31)
    : candidateTypes[(questionIndex + blockId) % candidateTypes.length];

  // 1. Primary: Universal Topic Question Engine specifically tailored to test curriculumTopic.name
  let artifact = generateTopicQuestion({
    topicName: curriculumTopic.name,
    topicArea: curriculumTopic.area,
    topicId: curriculumTopic.id,
    stageId,
    levelId,
    blockId,
    questionIndex,
    difficulty: tier,
    prng,
  });

  // 2. Secondary fallback: domain archetypes
  if (!artifact) {
    if (areaIdx === 0) {
      artifact = generateArithmeticArchetype(curriculumTopic.name, preferredType, tier, prng);
    } else if (areaIdx === 1) {
      artifact = generateFractionsDecimalsPercentagesArchetype(curriculumTopic.name, preferredType, tier, prng);
    } else if (areaIdx === 2) {
      artifact = generateAlgebraRatioArchetype(curriculumTopic.name, preferredType, tier, prng);
    } else if (areaIdx === 4) {
      artifact = generateGeometryArchetype(curriculumTopic.name, preferredType, tier, prng);
    } else if (areaIdx === 8) {
      artifact = generateStatisticsProbabilityArchetype(curriculumTopic.name, preferredType, tier, prng);
    } else if (areaIdx === 9) {
      artifact = generateFinancialAppliedArchetype(curriculumTopic.name, preferredType, tier, prng);
    }
  }

  // If a valid archetype artifact was generated and passes quality checks
  if (artifact && verifyBlueprintArtifact(artifact)) {
    const isDup = tracker ? tracker.isDuplicate(artifact.blueprint, artifact.questionText) : false;
    if (!isDup) {
      const optionCount = stageId <= 50 ? 3 : 4;
      const { options, correctIndex } = buildOptions(artifact.correctAnswer, artifact.rawDistractors, prng, optionCount);
      if (tracker) {
        tracker.record(artifact.blueprint, artifact.questionText);
      }

      return {
        id: qId,
        stageId,
        levelId,
        blockId,
        topic: curriculumTopic.name,
        area: curriculumTopic.area,
        principle: `Topic #${curriculumTopic.id}: ${curriculumTopic.name}`,
        difficulty: tier,
        questionText: artifact.questionText,
        options,
        correctAnswer: artifact.correctAnswer,
        correctIndex,
        solution: {
          given: artifact.given,
          required: artifact.required,
          method: artifact.method,
          steps: artifact.steps,
          conclusion: artifact.conclusion,
          misconceptions: artifact.misconceptions,
        },
        hint: artifact.hint,
        blueprint: artifact.blueprint,
      };
    }
  }

  // Fallback to high-precision stage generator with blueprint metadata synthesis
  const baseQuestion = generateQuestion(stageId, levelId, blockId, questionIndex, seed, effectiveSubtopic);

  const fallbackBlueprint: QuestionBlueprint = {
    mainTopic: curriculumTopic.area,
    subtopic: curriculumTopic.name,
    skill: `Mastery of ${curriculumTopic.name}`,
    questionType: preferredType,
    difficulty: tier,
    mathematicalOperation: 'Standard analytical evaluation',
    representation: 'equation',
    context: 'Mathematical challenge',
    numbersUsed: [stageId, levelId, blockId],
    expectedReasoning: 'Analytical problem solving and concept deduction',
    conceptKey: `TOPIC_${curriculumTopic.id}`,
  };

  if (tracker) {
    tracker.record(fallbackBlueprint, baseQuestion.questionText);
  }

  return {
    ...baseQuestion,
    blueprint: fallbackBlueprint,
  };
}
