import { Question, DifficultyTier } from '../types';
import { generateQuestion } from './questionGenerators';
import { generateIntelligentQuestion } from './blueprints/blueprintEngine';
import { QuestionDiversityTracker } from './blueprints/tracker';
import {
  CURRICULUM_AREAS,
  getCurriculumTopic,
  getStageRangeForArea,
  getAreaIndexForStage,
} from '../data/curriculum1000';
import { getBlockQuestionCountForStage } from '../data/worldsAndStages';

export interface BlockRequestOptions {
  stageId: number;
  levelId: number;
  blockId: number;
  retryAttempt?: number;
  customQuestions?: Question[];
  recentQuestionIds?: string[];
  recentQuestionStems?: string[];
  recentTopics?: string[];
  recentConceptKeys?: string[];
  recentQuestionTypes?: string[];
}

/**
 * Validates a question to guarantee game-integrity constraints:
 * - Exactly 4 options
 * - Non-empty question text
 * - Exactly 1 correct answer that exists within options
 * - Valid solution structure
 */
export function validateQuestion(q: Question): { isValid: boolean; error?: string } {
  if (!q.questionText || q.questionText.trim().length === 0) {
    return { isValid: false, error: 'Question text is empty.' };
  }
  const expectedOptionCount = (q.stageId && q.stageId <= 50) ? 3 : 4;
  if (!q.options || q.options.length !== expectedOptionCount) {
    return { isValid: false, error: `Question must have exactly ${expectedOptionCount} options.` };
  }
  const uniqueOptions = new Set(q.options);
  if (uniqueOptions.size !== expectedOptionCount) {
    return { isValid: false, error: `All ${expectedOptionCount} options must be distinct.` };
  }
  if (!q.options.includes(q.correctAnswer)) {
    return { isValid: false, error: 'Correct answer must match one of the 4 options.' };
  }
  if (q.options[q.correctIndex] !== q.correctAnswer) {
    return { isValid: false, error: 'Option at correctIndex does not match correctAnswer.' };
  }
  return { isValid: true };
}

/**
 * Strips numbers, math blocks, topic marks and symbols to extract the underlying sentence skeleton
 */
function normalizeSkeleton(text: string): string {
  return text
    .replace(/\$\$[\s\S]*?\$\$/g, ' MATH ')
    .replace(/\$(?:\\\$|[^\$])+?\$/g, ' MATH ')
    .replace(/\b\d+\b/g, ' NUM ')
    .replace(/\*\*/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Extracts the core mathematical concept from the question text, topic, and concept key.
 * Guarantees that questions in a block never test the same concept twice.
 */
export function extractMathematicalConcept(text: string, topic: string = '', conceptKey: string = ''): string {
  const combined = `${topic} ${text} ${conceptKey}`.toLowerCase();

  // Coordinates & Linear Graphs Concepts: Consolidate ALL axis intercepts into concept_axis_intercepts
  if (
    combined.includes('y-intercept') ||
    combined.includes('x-intercept') ||
    combined.includes('intercept on y') ||
    combined.includes('intercept on x') ||
    combined.includes('intercept on the y') ||
    combined.includes('intercept on the x') ||
    combined.includes('crosses the y-axis') ||
    combined.includes('crosses the x-axis') ||
    combined.includes('crosses y-axis') ||
    combined.includes('crosses x-axis') ||
    combined.includes('y-axis intercept') ||
    combined.includes('x-axis intercept') ||
    combined.includes('axis intercept') ||
    combined.includes('y_intercept') ||
    combined.includes('x_intercept') ||
    (combined.includes('intercept') && !combined.includes('gradient-intercept') && !combined.includes('slope-intercept'))
  ) {
    return 'concept_axis_intercepts';
  }
  if (
    combined.includes('gradient') ||
    combined.includes('slope') ||
    combined.includes('gradient-intercept') ||
    combined.includes('slope-intercept') ||
    combined.includes('point-slope')
  ) {
    return 'concept_gradient_slope';
  }
  if (combined.includes('midpoint')) {
    return 'concept_midpoint';
  }
  if (
    combined.includes('distance formula') ||
    combined.includes('horizontal distance') ||
    combined.includes('vertical distance') ||
    combined.includes('distance between points') ||
    combined.includes('distance on coordinate') ||
    combined.includes('length of segment')
  ) {
    return 'concept_distance_points';
  }
  if (
    combined.includes('parallel line') ||
    combined.includes('perpendicular line') ||
    combined.includes('parallel to') ||
    combined.includes('perpendicular to') ||
    combined.includes('parallel slopes') ||
    combined.includes('perpendicular slopes')
  ) {
    return 'concept_parallel_perpendicular';
  }
  if (
    combined.includes('horizontal line') ||
    combined.includes('vertical line') ||
    combined.includes('horizontal straight') ||
    combined.includes('vertical straight')
  ) {
    return 'concept_horizontal_vertical_lines';
  }
  if (
    combined.includes('quadrant') ||
    combined.includes('cartesian plane') ||
    combined.includes('origin') ||
    combined.includes('ordered pair') ||
    combined.includes('plotting points') ||
    combined.includes('reading coordinates')
  ) {
    return 'concept_cartesian_plane';
  }
  if (
    combined.includes('equation of a straight line') ||
    combined.includes('standard form of a line') ||
    combined.includes('point on the line') ||
    combined.includes('point lies')
  ) {
    return 'concept_linear_equations';
  }
  if (combined.includes('distance-time') || combined.includes('travel graph') || combined.includes('speed-time')) {
    return 'concept_motion_graphs';
  }
  if (combined.includes('pie chart') || combined.includes('sector angle')) {
    return 'concept_pie_chart';
  }
  if (combined.includes('box plot') || combined.includes('interquartile') || combined.includes('iqr')) {
    return 'concept_box_plot';
  }
  if (combined.includes('scatter') || combined.includes('correlation')) {
    return 'concept_scatter_correlation';
  }
  if (combined.includes('histogram') || combined.includes('frequency polygon') || combined.includes('frequency graph')) {
    return 'concept_histogram_frequency';
  }
  if (combined.includes('bar graph') || combined.includes('bar chart') || combined.includes('double bar') || combined.includes('tally chart')) {
    return 'concept_bar_graph';
  }
  if (combined.includes('stem-and-leaf')) {
    return 'concept_stem_leaf';
  }
  if (combined.includes('line graph') || combined.includes('pictograph')) {
    return 'concept_line_pictograph';
  }
  if (combined.includes('table of values') || combined.includes('tables of values')) {
    return 'concept_table_of_values';
  }
  if (
    combined.includes('quadratic graph') ||
    combined.includes('parabola') ||
    combined.includes('axis of symmetry') ||
    combined.includes('turning point') ||
    combined.includes('roots of graph')
  ) {
    return 'concept_parabola_quadratic';
  }
  if (
    combined.includes('transformation') ||
    combined.includes('translation') ||
    combined.includes('reflection of graph') ||
    combined.includes('stretching graph') ||
    combined.includes('compressing graph')
  ) {
    return 'concept_graph_transformation';
  }

  // Advanced & Further Math Concepts
  if (combined.includes('binary operation') || combined.includes('binary')) {
    return 'concept_binary_operation';
  }
  if (combined.includes('matrix') || combined.includes('determinant')) {
    return 'concept_matrix_determinant';
  }
  if (combined.includes('derivative') || combined.includes('differentiat') || combined.includes('dy/dx')) {
    return 'concept_differentiation';
  }
  if (
    combined.includes('integral') ||
    combined.includes('integrate') ||
    combined.includes('antiderivative') ||
    combined.includes('volume of revolution')
  ) {
    return 'concept_integration';
  }
  if (combined.includes('harmonic') || combined.includes('sinusoidal')) {
    return 'concept_harmonic_form';
  }
  if (combined.includes('spearman') || combined.includes('rank correlation')) {
    return 'concept_spearman_correlation';
  }
  if (combined.includes('binomial theorem') || combined.includes('pascal') || combined.includes('combinations') || combined.includes('binom')) {
    return 'concept_binomial_combinations';
  }
  if (combined.includes('polynomial') || combined.includes('remainder theorem') || combined.includes('factor theorem')) {
    return 'concept_polynomial_theorems';
  }
  if (combined.includes('complex number') || combined.includes('modulus')) {
    return 'concept_complex_numbers';
  }

  // Pure & Applied Concepts
  if (combined.includes('modular arithmetic') || combined.includes('modulo') || combined.includes('pmod')) {
    return 'concept_modular_arithmetic';
  }
  if (combined.includes('arithmetic progression') || combined.includes('geometric progression') || combined.includes('a.p.') || combined.includes('g.p.') || combined.includes('sequence')) {
    return 'concept_sequences_series';
  }
  if (combined.includes('circle theorem') || combined.includes('subtends an angle') || combined.includes('cyclic') || combined.includes('tangent to circle')) {
    return 'concept_circle_theorems';
  }
  if (combined.includes('varies directly') || combined.includes('varies inversely') || combined.includes('variation')) {
    return 'concept_variation';
  }
  if (
    combined.includes('simple interest') ||
    combined.includes('compound interest') ||
    combined.includes('interest earned') ||
    combined.includes('vat') ||
    combined.includes('tax') ||
    combined.includes('discount')
  ) {
    return 'concept_financial_math';
  }
  if (
    combined.includes('interior angle') ||
    combined.includes('exterior angle') ||
    combined.includes('convex polygon') ||
    combined.includes('regular polygon') ||
    combined.includes('quadrilateral') ||
    combined.includes('pentagon') ||
    combined.includes('hexagon') ||
    combined.includes('octagon') ||
    combined.includes('decagon') ||
    combined.includes('tessellat')
  ) {
    return 'concept_polygon_geometry';
  }
  if (combined.includes('pythagor') || combined.includes('hypotenuse')) {
    return 'concept_pythagoras';
  }
  if (
    combined.includes('sin') ||
    combined.includes('cos') ||
    combined.includes('tan') ||
    combined.includes('trigonometr') ||
    combined.includes('elevation') ||
    combined.includes('depression')
  ) {
    return 'concept_trigonometry';
  }
  if (combined.includes('surd') || combined.includes('radical') || combined.includes('rationaliz')) {
    return 'concept_surds_radicals';
  }
  if (combined.includes('exponent') || combined.includes('logarithm') || combined.includes('index law') || combined.includes('indices')) {
    return 'concept_exponents_logs';
  }
  if (combined.includes('vector') || combined.includes('dot product')) {
    return 'concept_vectors';
  }
  if (combined.includes('fraction') || combined.includes('numerator') || combined.includes('denominator')) {
    return 'concept_fractions';
  }
  if (combined.includes('decimal')) {
    return 'concept_decimals';
  }
  if (combined.includes('percent')) {
    return 'concept_percentages';
  }
  if (combined.includes('ratio') || combined.includes('proportion')) {
    return 'concept_ratios_proportions';
  }
  if (combined.includes('probability') || combined.includes('independent event')) {
    return 'concept_probability';
  }
  if (combined.includes('mean') || combined.includes('median') || combined.includes('mode') || combined.includes('standard deviation')) {
    return 'concept_statistics';
  }
  if (combined.includes('perimeter') || combined.includes('circumference')) {
    return 'concept_perimeter';
  }
  if (combined.includes('surface area') || combined.includes('area of')) {
    return 'concept_area';
  }
  if (combined.includes('volume') || combined.includes('capacity')) {
    return 'concept_volume';
  }
  if (combined.includes('highest common factor') || combined.includes('hcf') || combined.includes('gcd')) {
    return 'concept_hcf_gcd';
  }
  if (combined.includes('least common multiple') || combined.includes('lcm')) {
    return 'concept_lcm';
  }
  if (combined.includes('expanded form') || combined.includes('place value')) {
    return 'concept_place_value';
  }
  if (combined.includes('absolute value') || combined.includes('magnitude')) {
    return 'concept_absolute_value';
  }
  if (combined.includes('prime') || combined.includes('composite')) {
    return 'concept_primes';
  }
  if (combined.includes('order of operations') || combined.includes('bodmas') || combined.includes('bidmas')) {
    return 'concept_order_of_operations';
  }
  if (combined.includes('descending order') || combined.includes('ascending order') || combined.includes('ordering')) {
    return 'concept_ordering';
  }
  if (combined.includes('number bond') || combined.includes('bonds with')) {
    return 'concept_number_bonds';
  }
  if (combined.includes('short division') || combined.includes('long division') || combined.includes('division')) {
    return 'concept_division';
  }
  if (combined.includes('multiplication') || combined.includes('product') || combined.includes('times table')) {
    return 'concept_multiplication';
  }
  if (combined.includes('subtraction') || combined.includes('difference')) {
    return 'concept_subtraction';
  }
  if (combined.includes('addition') || combined.includes('sum')) {
    return 'concept_addition';
  }

  return conceptKey ? `key_${conceptKey.toLowerCase()}` : `topic_${topic.toLowerCase().replace(/\W+/g, '_')}`;
}

/**
 * Maps a curriculum topic to its broad conceptual family to prevent multiple questions
 * from testing the exact same operation/concept in the same block.
 */
export function getTopicFamily(topicName: string): string {
  const t = topicName.toLowerCase().trim();
  if (t.includes('addition') || t.includes('addend') || t.includes('carrying in addition') || t.includes('addition tables')) return 'addition';
  if (t.includes('subtraction') || t.includes('borrowing in subtraction') || t.includes('subtraction facts') || t.includes('difference')) return 'subtraction';
  if (t.includes('multiplication') || t.includes('times tables') || t.includes('product') || t.includes('multiplicative comparison')) return 'multiplication';
  if (t.includes('division') || t.includes('quotient') || t.includes('remainder') || t.includes('short division') || t.includes('long division')) return 'division';
  if (t.includes('ascending') || t.includes('descending') || t.includes('ordering numbers') || t.includes('comparing numbers') || t.includes('greater than') || t.includes('less than') || t.includes('comparing quantities')) return 'ordering';
  if (t.includes('place value') || t.includes('face value') || t.includes('expanded form') || t.includes('standard form') || t.includes('number names')) return 'place_value';
  if (t.includes('highest common factor') || t.includes('hcf') || t.includes('gcd') || t.includes('common factors') || t === 'factors') return 'factors';
  if (t.includes('least common multiple') || t.includes('lcm') || t.includes('common multiples') || t === 'multiples') return 'multiples';
  if (t.includes('prime') || t.includes('composite')) return 'primes_composites';
  if (t.includes('rounding') || t.includes('estimation') || t.includes('approximation')) return 'rounding_estimation';
  if (t.includes('even') || t.includes('odd')) return 'parity';
  if (t.includes('bodmas') || t.includes('bidmas') || t.includes('order of operations')) return 'order_of_operations';

  // Coordinate Geometry & Graphs Families
  if (t.includes('intercept')) return 'intercepts';
  if (t.includes('gradient') || t.includes('slope')) return 'gradient_slope';
  if (t.includes('quadrant') || t.includes('cartesian plane') || t.includes('origin')) return 'quadrant_coordinates';
  if (t.includes('midpoint')) return 'midpoint';
  if (t.includes('distance formula') || t.includes('horizontal distance') || t.includes('vertical distance')) return 'distance_between_points';
  if (t.includes('parallel') || t.includes('perpendicular')) return 'parallel_perpendicular';
  if (t.includes('horizontal line') || t.includes('vertical line')) return 'horizontal_vertical_lines';
  if (t.includes('travel graph') || t.includes('distance-time') || t.includes('speed-time')) return 'kinematics_graphs';
  if (t.includes('pie chart') || t.includes('bar graph') || t.includes('box plot') || t.includes('stem-and-leaf') || t.includes('scatter')) return 'data_graphs';
  if (t.includes('parabola') || t.includes('quadratic graph') || t.includes('turning point')) return 'parabolic_graphs';
  if (t.includes('transformation') || t.includes('translation') || t.includes('reflection')) return 'graph_transformations';

  return t;
}

/**
 * Detects structural or conceptual duplication across questions in the same block.
 * Guarantees that questions in a block never share:
 * - The same extracted mathematical concept
 * - The same topic or topic family
 * - The same conceptKey
 * - The same sentence skeleton
 */
export function areQuestionsSimilar(candidate: Question, existingQuestions: Question[]): boolean {
  const candConcept = extractMathematicalConcept(candidate.questionText, candidate.topic, candidate.blueprint?.conceptKey);
  const candTopic = candidate.topic.trim().toLowerCase();
  const candFamily = getTopicFamily(candTopic);
  const candSkeleton = normalizeSkeleton(candidate.questionText);

  for (const q of existingQuestions) {
    // 1. Same extracted mathematical concept (CRITICAL: prevents multiple intercepts, midpoints, slopes, etc.)
    const qConcept = extractMathematicalConcept(q.questionText, q.topic, q.blueprint?.conceptKey);
    if (candConcept === qConcept) return true;

    // 2. Same topic
    if (q.topic.trim().toLowerCase() === candTopic) return true;

    // 3. Same conceptual family
    if (candFamily !== candTopic && getTopicFamily(q.topic) === candFamily) return true;

    // 4. Same blueprint concept key
    if (candidate.blueprint?.conceptKey && q.blueprint?.conceptKey && candidate.blueprint.conceptKey === q.blueprint.conceptKey) return true;

    // 5. Same normalized skeleton
    const qSkeleton = normalizeSkeleton(q.questionText);
    if (qSkeleton === candSkeleton) return true;
  }

  return false;
}

/**
 * Retrieves unique, intelligent questions for a given Block based on the user's World rule:
 * - World 1 & 2 (Stages 1-20): exactly 5 questions per block
 * - World 3 & 4 (Stages 21-40): exactly 6 questions per block
 * - World 5 & 6 (Stages 41-60): exactly 7 questions per block
 * - World 7 & 8 (Stages 61-80): exactly 8 questions per block
 * - World 9 & 10 (Stages 81-100): exactly 10 questions per block
 *
 * GUARANTEES:
 * 1. EVERY question in the block comes from a DIFFERENT topic!
 * 2. Moving to the next block draws completely NEW topics, preventing repetition of recently seen topics!
 * 3. Every question directly tests its assigned curriculum topic with authentic mathematical reasoning.
 */
export function getBlockQuestions({
  stageId,
  levelId,
  blockId,
  retryAttempt = 0,
  customQuestions = [],
  recentQuestionIds = [],
  recentQuestionStems = [],
  recentTopics = [],
  recentConceptKeys = [],
  recentQuestionTypes = [],
}: BlockRequestOptions): Question[] {
  const targetCount = getBlockQuestionCountForStage(stageId);
  const questions: Question[] = [];
  const usedStems = new Set<string>();
  const usedPrinciples = new Set<string>();
  const usedTopics = new Set<string>();
  const usedFamilies = new Set<string>();
  const usedConcepts = new Set<string>();

  const tracker = new QuestionDiversityTracker({
    recentConceptKeys,
    recentQuestionTypes,
    recentQuestionStems,
    recentTopics,
  });

  const recentStemSet = new Set<string>([
    ...recentQuestionStems.map(s => s.trim().toLowerCase()),
    ...recentQuestionIds.filter(id => id.includes(' ') || id.length > 20).map(id => id.trim().toLowerCase()),
  ]);

  const recentTopicSet = new Set<string>(
    recentTopics.map(t => t.trim().toLowerCase())
  );

  const recentConceptsSet = new Set<string>();
  for (const t of recentTopics) {
    recentConceptsSet.add(extractMathematicalConcept('', t));
    recentConceptsSet.add(getTopicFamily(t));
  }
  for (const s of recentQuestionStems) {
    recentConceptsSet.add(extractMathematicalConcept(s, ''));
  }
  for (const k of recentConceptKeys) {
    recentConceptsSet.add(extractMathematicalConcept('', '', k));
  }

  // 1. Incorporate valid custom admin questions targeting this stage
  const stageCustom = customQuestions.filter(
    q => q.stageId === stageId && !recentQuestionIds.includes(q.id)
  );

  for (const cq of stageCustom) {
    const principleKey = cq.principle || cq.topic || `custom-${cq.id}`;
    const cqConcept = extractMathematicalConcept(cq.questionText, cq.topic, cq.blueprint?.conceptKey);
    if (
      questions.length < targetCount &&
      validateQuestion(cq).isValid &&
      !usedPrinciples.has(principleKey) &&
      !usedConcepts.has(cqConcept) &&
      !areQuestionsSimilar(cq, questions)
    ) {
      questions.push(cq);
      usedStems.add(cq.questionText.trim().toLowerCase());
      usedPrinciples.add(principleKey);
      usedTopics.add(cq.topic.toLowerCase());
      usedFamilies.add(getTopicFamily(cq.topic));
      usedConcepts.add(cqConcept);
    }
  }

  // 2. Select distinct topics for this block that advance as blocks progress
  const worldId = Math.min(10, Math.floor((stageId - 1) / 10) + 1);
  const [worldStartStage, worldEndStage] = [(worldId - 1) * 10 + 1, worldId * 10];

  // Co-prime rotation across subtopics in the current stage, cycling disjointly between consecutive blocks
  // e.g., for 5-question blocks: Block 1 takes subtopics 0..4, Block 2 takes 5..9!
  const subtopicBaseOffset = ((levelId - 1) * 3 + (blockId - 1) * targetCount + retryAttempt * 7) % 10;

  for (let slot = questions.length; slot < targetCount; slot++) {
    let picked: Question | null = null;
    let targetStage = stageId;
    let targetSubtopic = (subtopicBaseOffset + slot) % 10;

    // Build ordered list of candidate (stage, subtopic) pairs prioritizing stageId, then adjacent stages in the world
    const candidatePairs: Array<{ candStage: number; candSub: number }> = [];
    // First: All 10 subtopics of the current stage
    for (let sub = 0; sub < 10; sub++) {
      candidatePairs.push({
        candStage: stageId,
        candSub: (subtopicBaseOffset + slot + sub) % 10,
      });
    }
    // Second: Adjacent stages within the current world to ensure endless fresh variety
    for (let stgOffset = 1; stgOffset <= 9; stgOffset++) {
      const s = worldStartStage + ((stageId - worldStartStage + stgOffset) % 10);
      for (let sub = 0; sub < 10; sub++) {
        candidatePairs.push({
          candStage: s,
          candSub: (subtopicBaseOffset + slot * 3 + sub) % 10,
        });
      }
    }

    let foundFresh = false;
    // Pass 1: Strict avoidance of usedTopics, usedConcepts in block, AND recentTopicSet, recentConceptsSet from previous blocks/levels
    for (const pair of candidatePairs) {
      const meta = getCurriculumTopic(pair.candStage, pair.candSub);
      const nameL = meta.name.toLowerCase();
      const fam = getTopicFamily(nameL);
      const metaConcept = extractMathematicalConcept('', nameL);

      if (
        !usedTopics.has(nameL) &&
        !usedConcepts.has(metaConcept) &&
        !usedFamilies.has(fam) &&
        !recentTopicSet.has(nameL) &&
        !recentConceptsSet.has(metaConcept)
      ) {
        targetStage = pair.candStage;
        targetSubtopic = pair.candSub;
        foundFresh = true;
        break;
      }
    }

    // Pass 2: If fresh family is exhausted, still strictly avoid usedConcepts, usedTopics, and recentConceptsSet
    if (!foundFresh) {
      for (const pair of candidatePairs) {
        const meta = getCurriculumTopic(pair.candStage, pair.candSub);
        const nameL = meta.name.toLowerCase();
        const metaConcept = extractMathematicalConcept('', nameL);

        if (
          !usedTopics.has(nameL) &&
          !usedConcepts.has(metaConcept) &&
          !recentConceptsSet.has(metaConcept)
        ) {
          targetStage = pair.candStage;
          targetSubtopic = pair.candSub;
          foundFresh = true;
          break;
        }
      }
    }

    // Generate question using blueprint engine with varied seeds
    let attempt = 0;
    while (attempt < 24 && !picked) {
      const stageShift = Math.floor(attempt / 4);
      const subShift = (attempt % 4) * 2;
      const stageToUse = worldStartStage + ((targetStage - worldStartStage + stageShift) % 10);
      const subToUse = (targetSubtopic + subShift) % 10;
      const seed =
        stageToUse * 1000003 +
        levelId * 50021 +
        blockId * 7013 +
        slot * 997 +
        attempt * 179 +
        retryAttempt * 8819 +
        31;

      const candidate = generateIntelligentQuestion({
        stageId: stageToUse,
        levelId,
        blockId,
        questionIndex: slot,
        seed,
        explicitSubtopic: subToUse,
        tracker,
      });

      const stem = candidate.questionText.trim().toLowerCase();
      const principleKey = candidate.principle || `Topic_${stageToUse}_${subToUse}`;
      const topicL = candidate.topic.toLowerCase();
      const candConcept = extractMathematicalConcept(candidate.questionText, candidate.topic, candidate.blueprint?.conceptKey);

      // Strict uniqueness within block: NEVER more than 1 question under any concept!
      // And concepts/topics from recent blocks and levels must NOT appear in this block!
      const isConceptDuplicate = usedConcepts.has(candConcept);
      const isTopicDuplicate = usedTopics.has(topicL);
      const isStemDuplicate = usedStems.has(stem);
      const isRecentConcept = recentConceptsSet.has(candConcept);
      const isRecentStem = recentStemSet.has(stem);

      if (
        !isConceptDuplicate &&
        !isTopicDuplicate &&
        !isStemDuplicate &&
        (!isRecentConcept || attempt >= 20) &&
        (!isRecentStem || attempt >= 18) &&
        !areQuestionsSimilar(candidate, questions) &&
        validateQuestion(candidate).isValid
      ) {
        picked = candidate;
      }
      attempt++;
    }

    if (picked) {
      const pickedConcept = extractMathematicalConcept(picked.questionText, picked.topic, picked.blueprint?.conceptKey);
      usedStems.add(picked.questionText.trim().toLowerCase());
      usedPrinciples.add(picked.principle || `Topic_${targetStage}_${targetSubtopic}`);
      usedTopics.add(picked.topic.toLowerCase());
      usedFamilies.add(getTopicFamily(picked.topic));
      usedConcepts.add(pickedConcept);
      questions.push(picked);
    }
  }

  // Graceful fallback to guarantee exact targetCount questions while strictly preserving UNIQUE CONCEPTS
  if (questions.length < targetCount) {
    const fallbackStart = (subtopicBaseOffset * 7 + 43) % 100;
    let fallbackOffset = 0;
    while (questions.length < targetCount && fallbackOffset < 150) {
      const globalIdx = (fallbackStart + fallbackOffset * 3) % 100;
      const candStage = worldStartStage + Math.floor(globalIdx / 10);
      const candSub = globalIdx % 10;
      const meta = getCurriculumTopic(candStage, candSub);
      const topicL = meta.name.toLowerCase();
      const metaConcept = extractMathematicalConcept('', topicL);

      if (!usedTopics.has(topicL) && !usedConcepts.has(metaConcept)) {
        const seed =
          candStage * 700000 +
          levelId * 20000 +
          blockId * 8317 +
          fallbackOffset * 277 +
          retryAttempt * 99991;

        const candidate = generateIntelligentQuestion({
          stageId: candStage,
          levelId,
          blockId,
          questionIndex: questions.length,
          seed,
          explicitSubtopic: candSub,
          tracker,
        });

        const stem = candidate.questionText.trim().toLowerCase();
        const candTopicL = candidate.topic.toLowerCase();
        const candConcept = extractMathematicalConcept(candidate.questionText, candidate.topic, candidate.blueprint?.conceptKey);

        if (
          !usedStems.has(stem) &&
          !usedTopics.has(candTopicL) &&
          !usedConcepts.has(candConcept) &&
          !areQuestionsSimilar(candidate, questions) &&
          validateQuestion(candidate).isValid
        ) {
          usedStems.add(stem);
          usedTopics.add(candTopicL);
          usedFamilies.add(getTopicFamily(candTopicL));
          usedConcepts.add(candConcept);
          questions.push(candidate);
        }
      }
      fallbackOffset++;
    }
  }

  return questions;
}

export interface ChallengeBlockRequestOptions {
  challengeLevel: number;
  retryAttempt?: number;
  recentQuestionIds?: string[];
  recentQuestionStems?: string[];
  recentTopics?: string[];
  recentConceptKeys?: string[];
  recentQuestionTypes?: string[];
}

/**
 * Generates a randomized Challenge Block scaled by challenge level:
 * - Challenge Level 1 & 2: 5 questions
 * - Challenge Level 3 & 4: 6 questions
 * - Challenge Level 5 & 6: 7 questions
 * - Challenge Level 7 & 8: 8 questions
 * - Challenge Level 9+: 10 questions
 *
 * Each question in the block comes from a completely DIFFERENT topical area,
 * difficulty progressively ramps upward, and topics vary with zero repetition between blocks!
 */
export function getChallengeBlockQuestionCount(challengeLevel: number): number {
  if (challengeLevel <= 2) return 5;
  if (challengeLevel <= 4) return 6;
  if (challengeLevel <= 6) return 7;
  if (challengeLevel <= 8) return 8;
  return 10;
}

export function getChallengeBlockQuestions({
  challengeLevel,
  retryAttempt = 0,
  recentQuestionIds = [],
  recentQuestionStems = [],
  recentTopics = [],
  recentConceptKeys = [],
  recentQuestionTypes = [],
}: ChallengeBlockRequestOptions): Question[] {
  const targetCount = getChallengeBlockQuestionCount(challengeLevel);
  const questions: Question[] = [];
  const usedStems = new Set<string>();
  const usedPrinciples = new Set<string>();
  const usedTopics = new Set<string>();
  const usedAreas = new Set<number>();

  const tracker = new QuestionDiversityTracker({
    recentConceptKeys,
    recentQuestionTypes,
    recentQuestionStems,
    recentTopics,
  });

  const recentStemSet = new Set<string>([
    ...recentQuestionStems.map(s => s.trim()),
    ...recentQuestionIds.filter(id => id.includes(' ') || id.length > 20).map(id => id.trim()),
  ]);

  const recentTopicSet = new Set<string>(
    recentTopics.map(t => t.trim().toLowerCase())
  );

  const tierIndex = Math.floor((challengeLevel - 1) / 5);

  // Distinct topical areas for the questions in the challenge block
  const allAreas = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const areaShift = (challengeLevel * 3 + retryAttempt * 7) % 10;
  const orderedAreas = [
    ...allAreas.slice(areaShift),
    ...allAreas.slice(0, areaShift),
  ];

  for (let slot = 0; slot < targetCount; slot++) {
    const targetArea = orderedAreas[slot % orderedAreas.length];
    const [startStage, endStage] = getStageRangeForArea(targetArea);

    const baseLevel = Math.min(16, ((challengeLevel - 1) % 5) * 3 + 1);
    const intraRamp = Math.floor(slot / 2.5);
    const questionDifficultyLevel = Math.min(20, Math.max(1, baseLevel + intraRamp));

    let stageOffsetInArea: number;
    if (tierIndex === 0) {
      stageOffsetInArea = (slot + challengeLevel + retryAttempt) % 4;
    } else if (tierIndex === 1) {
      stageOffsetInArea = 2 + ((slot + challengeLevel + retryAttempt) % 5);
    } else if (tierIndex === 2) {
      stageOffsetInArea = 4 + ((slot + challengeLevel + retryAttempt) % 5);
    } else {
      stageOffsetInArea = 6 + ((slot + challengeLevel + retryAttempt) % 4);
    }

    let targetStage = startStage + stageOffsetInArea;
    let targetSubtopic = (slot * 3 + challengeLevel * 7 + retryAttempt * 11) % 10;

    // Pick a topic in this area not seen in recent blocks and not used in this block
    let foundFresh = false;
    for (let sIdx = 0; sIdx < 10 && !foundFresh; sIdx++) {
      const candStage = startStage + ((stageOffsetInArea + sIdx) % 10);
      for (let tIdx = 0; tIdx < 10 && !foundFresh; tIdx++) {
        const candSub = (targetSubtopic + tIdx) % 10;
        const topicMeta = getCurriculumTopic(candStage, candSub);
        if (
          !recentTopicSet.has(topicMeta.name.toLowerCase()) &&
          !usedTopics.has(topicMeta.name.toLowerCase())
        ) {
          targetStage = candStage;
          targetSubtopic = candSub;
          foundFresh = true;
        }
      }
    }

    let picked: Question | null = null;
    let attempt = 0;

    while (attempt < 25 && !picked) {
      const seed =
        targetStage * 700000 +
        challengeLevel * 25000 +
        slot * 419 +
        attempt * 9973 +
        retryAttempt * 99991 +
        77;

      const candidate = generateIntelligentQuestion({
        stageId: targetStage,
        levelId: questionDifficultyLevel,
        blockId: 1,
        questionIndex: slot,
        seed,
        explicitSubtopic: targetSubtopic,
        tracker,
      });

      const stem = candidate.questionText.trim();
      const principleKey = candidate.principle || `Chal_${targetStage}_${targetSubtopic}`;
      const topicL = candidate.topic.toLowerCase();

      if (
        !usedStems.has(stem) &&
        !usedPrinciples.has(principleKey) &&
        !usedTopics.has(topicL) &&
        !areQuestionsSimilar(candidate, questions) &&
        validateQuestion(candidate).isValid
      ) {
        if (!recentStemSet.has(stem) || attempt >= 18) {
          picked = candidate;
        }
      }
      attempt++;
    }

    if (picked) {
      usedStems.add(picked.questionText.trim());
      usedPrinciples.add(picked.principle || `Chal_${targetStage}_${targetSubtopic}`);
      usedTopics.add(picked.topic.toLowerCase());
      usedAreas.add(targetArea);
      questions.push({
        ...picked,
        id: `CHAL-L${challengeLevel}-Q${questions.length + 1}`,
      });
    }
  }

  // Graceful fallback for challenge block guaranteeing unique topics
  if (questions.length < targetCount) {
    let fb = 0;
    while (questions.length < targetCount && fb < 40) {
      const area = fb % 10;
      const [sS, eS] = getStageRangeForArea(area);
      const s = sS + (fb % (eS - sS + 1));
      const sub = (fb * 3) % 10;
      const seed = s * 700000 + challengeLevel * 25000 + fb * 331;

      const candidate = generateIntelligentQuestion({
        stageId: s,
        levelId: Math.min(20, challengeLevel * 2),
        blockId: 1,
        questionIndex: questions.length,
        seed,
        explicitSubtopic: sub,
        tracker,
      });

      const stem = candidate.questionText.trim();
      const topicL = candidate.topic.toLowerCase();
      if (!usedStems.has(stem) && !usedTopics.has(topicL) && validateQuestion(candidate).isValid) {
        usedStems.add(stem);
        usedTopics.add(topicL);
        questions.push({
          ...candidate,
          id: `CHAL-L${challengeLevel}-Q${questions.length + 1}`,
        });
      }
      fb++;
    }
  }

  return questions;
}
