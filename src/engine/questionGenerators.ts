import { Question, DifficultyTier } from '../types';
import { getStage, getDifficultyTier } from '../data/worldsAndStages';
import { generateWorld1 } from './generators/world1';
import { generateComplementaryQuestion } from './generators/complementary';

import { PRNG, buildOptions } from './generators/shared';
import { getCurriculumTopic } from '../data/curriculum1000';

// Greatest common divisor helper
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

// Generate unique, valid distractors around a numerical target
// Generate unique, valid distractors around a numerical target
function generateNumericalDistractors(
  target: number,
  prng: PRNG,
  isInteger = true,
  allowNegative = false,
  stepSize = 1
): [number, number, number] {
  const set = new Set<number>();
  const deltas = [stepSize, -stepSize, stepSize * 2, -stepSize * 2, 1, -1, 2, -2, 5, -5];

  let attempts = 0;
  while (set.size < 3 && attempts < 50) {
    attempts++;
    const choice = prng.pick(['delta', 'offset', 'step']);
    let candidate = target;

    if (choice === 'delta') {
      const d = prng.pick(deltas);
      candidate = target + d;
    } else if (choice === 'step') {
      candidate = target + prng.int(1, 3) * (prng.next() > 0.5 ? 1 : -1) * (stepSize || 1);
    } else {
      const offset = prng.int(1, 4) * (prng.next() > 0.5 ? 1 : -1);
      candidate = target + offset;
    }

    if (isInteger) candidate = Math.round(candidate);
    else candidate = parseFloat(candidate.toFixed(2));

    if (!allowNegative && candidate < 0) {
      candidate = Math.abs(candidate) + 1;
    }

    if (candidate !== target && !isNaN(candidate) && isFinite(candidate)) {
      set.add(candidate);
    }
  }

  let fallbackDelta = stepSize || 2;
  while (set.size < 3) {
    let val = target + fallbackDelta;
    if (!allowNegative && val < 0) val = target + Math.abs(fallbackDelta);
    if (val !== target) set.add(val);
    fallbackDelta += 2;
  }

  const arr = Array.from(set).slice(0, 3);
  return [arr[0], arr[1], arr[2]];
}

// Generates distractors for sequences ensuring NO terms already visible in the sequence are reused
function generateSequenceDistractors(
  target: number,
  sequenceTerms: number[],
  stepSize: number,
  prng: PRNG
): string[] {
  const forbidden = new Set<number>([target, ...sequenceTerms]);
  const candidates: number[] = [
    target + stepSize,
    target - stepSize,
    target + stepSize * 2,
    target - stepSize * 2,
    target + 1,
    target - 1,
    target + 2,
    target - 2,
    target + (stepSize > 1 ? stepSize - 1 : 3),
    target + stepSize + 1,
    target + 5,
    target - 5,
    target + 10,
    target - 10,
  ];

  const valid: number[] = [];
  for (const c of candidates) {
    if (c > 0 && !forbidden.has(c) && !valid.includes(c)) {
      valid.push(c);
      if (valid.length >= 3) break;
    }
  }

  let fallback = target + (stepSize || 2) + 3;
  while (valid.length < 3) {
    if (fallback > 0 && !forbidden.has(fallback) && !valid.includes(fallback)) {
      valid.push(fallback);
    }
    fallback += 2;
  }

  return valid.slice(0, 3).map(v => `$${v}$`);
}


/**
 * Main Question Generator supporting all 100 Stages with 4 Level Tiers.
 * Produces mathematically rigorous questions formatted with LaTeX notation,
 * full worked solutions, plausible distractors, and helpful hints.
 */
export function generateQuestion(
  stageId: number,
  levelId: number,
  blockId: number,
  questionIndex: number,
  customSeed?: number,
  explicitSubtopic?: number
): Question {
  const seed = customSeed ?? (stageId * 100000 + levelId * 1000 + blockId * 50 + questionIndex * 7 + 1337);
  const prng = new PRNG(seed);
  const stage = getStage(stageId);
  const tier = getDifficultyTier(levelId);
  const qId = `S${stageId}-L${levelId}-B${blockId}-Q${questionIndex + 1}`;

  // Multiplier scales difficulty with level tier
  const tierMultiplier = tier === 'foundation' ? 1 : tier === 'developing' ? 2 : tier === 'advanced' ? 3 : 5;

  let questionText = '';
  let correctAnswer = '';
  let rawDistractors: string[] = [];
  let given = '';
  let required = '';
  let method = '';
  let steps: string[] = [];
  let conclusion = '';
  let hint = '';
  let misconceptions: string[] = [];

  // Guaranteed Unique Principle Rotation:
  // In any 10-question block (questionIndex 0..9), effectiveSubtopic produces
  // 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 with zero repetition of any principle in that block!
  // And blockOffset rotates by 3 every block, providing fresh sequencing and variety.
  const blockOffset = ((blockId - 1) * 3) % 10;
  const effectiveSubtopic = explicitSubtopic !== undefined
    ? Math.max(0, Math.min(9, Math.floor(explicitSubtopic)))
    : (questionIndex + blockOffset) % 10;
  const curriculumTopic = getCurriculumTopic(stageId, effectiveSubtopic);

  // WORLD 1 (Stages 1-10): Handled by world1.ts which provides 10 distinct subtopics
  if (stageId >= 1 && stageId <= 10) {
    const draft = generateWorld1({
      stageId,
      levelId,
      blockId,
      questionIndex,
      subtopicIndex: effectiveSubtopic,
      prng,
      tierMultiplier,
      tier,
      stage,
    });
    const optionCount = stageId <= 50 ? 3 : 4;
    const { options, correctIndex } = buildOptions(draft.correctAnswer, draft.rawDistractors, prng, optionCount);
    return {
      id: qId,
      stageId,
      levelId,
      blockId,
      topic: curriculumTopic.name,
      area: curriculumTopic.area,
      principle: `Topic #${curriculumTopic.id}: ${curriculumTopic.name}`,
      difficulty: tier,
      questionText: draft.questionText,
      options,
      correctAnswer: draft.correctAnswer,
      correctIndex,
      solution: {
        given: draft.given,
        required: draft.required,
        method: draft.method,
        steps: draft.steps,
        conclusion: draft.conclusion,
        misconceptions: draft.misconceptions,
      },
      hint: draft.hint,
    };
  }

  // Stages 11 to 92 and 96 to 99 (where effectiveSubtopic >= 5):
  // Handled by complementary.ts which provides subtopics 5, 6, 7, 8, 9!
  if (stageId >= 11 && stageId !== 93 && stageId !== 94 && stageId !== 95 && stageId !== 100 && effectiveSubtopic >= 5) {
    const draft = generateComplementaryQuestion({
      stageId,
      levelId,
      blockId,
      questionIndex,
      subtopicIndex: effectiveSubtopic,
      prng,
      tierMultiplier,
      tier,
      stage,
    });
    const optionCount = stageId <= 50 ? 3 : 4;
    const { options, correctIndex } = buildOptions(draft.correctAnswer, draft.rawDistractors, prng, optionCount);
    return {
      id: qId,
      stageId,
      levelId,
      blockId,
      topic: curriculumTopic.name,
      area: curriculumTopic.area,
      principle: `Topic #${curriculumTopic.id}: ${curriculumTopic.name}`,
      difficulty: tier,
      questionText: draft.questionText,
      options,
      correctAnswer: draft.correctAnswer,
      correctIndex,
      solution: {
        given: draft.given,
        required: draft.required,
        method: draft.method,
        steps: draft.steps,
        conclusion: draft.conclusion,
        misconceptions: draft.misconceptions,
      },
      hint: draft.hint,
    };
  }

  // ==========================================
  // WORLD 1: NUMBER FOUNDATIONS (Stages 1-10)
  // ==========================================
  if (stageId === 1) {
    // Numbers & Counting (Curriculum pillars: Patterns/Sequences, Recognition, Counting, Comparing, Ordering)
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // 1. Rigorous Arithmetic Sequences & Patterns
      const patternKind = prng.pick(['forward', 'backward', 'missing_middle']);
      const step = prng.pick([2, 3, 4, 5, 10]);
      const base = prng.pick([4, 6, 8, 11, 15, 20, 25, 30]) + (tierMultiplier - 1) * 12;

      if (patternKind === 'forward') {
        const seq = [base, base + step, base + step * 2, base + step * 3];
        const target = base + step * 4;
        questionText = `Find the next number that completes this arithmetic sequence:\n\n$$${seq.join(', \\quad ')}, \\quad \\mathbf{?}$$`;
        correctAnswer = `$${target}$`;
        rawDistractors = generateSequenceDistractors(target, seq, step, prng);
        given = `Sequence: $${seq.join(', \\; ')}$ with consecutive terms.`;
        required = `The fifth term that follows $${seq[3]}$.`;
        method = `Find the constant common difference ($d = a_{n+1} - a_n$) and add it to the last term.`;
        steps = [
          `Find the step difference between terms: $${seq[1]} - ${seq[0]} = ${step}$.`,
          `Verify consistency: $${seq[2]} - ${seq[1]} = ${step}$ and $${seq[3]} - ${seq[2]} = ${step}$.`,
          `The constant rule is: add $${step}$ to each term.`,
          `Calculate the next term: $${seq[3]} + ${step} = ${target}$.`,
        ];
        conclusion = `The next number in the sequence is $${target}$.`;
        hint = `Calculate the difference between adjacent terms: $${seq[1]} - ${seq[0]}$. Then add that same difference to $${seq[3]}$.`;
      } else if (patternKind === 'backward') {
        const top = base + step * 5;
        const seq = [top, top - step, top - step * 2, top - step * 3];
        const target = top - step * 4;
        questionText = `Find the next number in this decreasing countdown sequence:\n\n$$${seq.join(', \\quad ')}, \\quad \\mathbf{?}$$`;
        correctAnswer = `$${target}$`;
        rawDistractors = generateSequenceDistractors(target, seq, step, prng);
        given = `Decreasing sequence: $${seq.join(', \\; ')}$.`;
        required = `The next number in the pattern.`;
        method = `Determine the subtraction rate between consecutive terms: $${seq[0]} - ${seq[1]} = ${step}$.`;
        steps = [
          `Find step size: $${seq[0]} - ${seq[1]} = ${step}$.`,
          `Verify: $${seq[1]} - ${seq[2]} = ${step}$ and $${seq[2]} - ${seq[3]} = ${step}$.`,
          `Subtract $${step}$ from the last term: $${seq[3]} - ${step} = ${target}$.`,
        ];
        conclusion = `The next number in the sequence is $${target}$.`;
        hint = `The sequence decreases by $${step}$ at each step. Subtract $${step}$ from $${seq[3]}$.`;
      } else {
        // missing_middle
        const t1 = base;
        const t2 = base + step;
        const target = base + step * 2;
        const t4 = base + step * 3;
        const t5 = base + step * 4;
        const visibleTerms = [t1, t2, t4, t5];
        questionText = `Determine the missing number in this sequence:\n\n$$${t1}, \\quad ${t2}, \\quad \\mathbf{?}, \\quad ${t4}, \\quad ${t5}$$`;
        correctAnswer = `$${target}$`;
        rawDistractors = generateSequenceDistractors(target, visibleTerms, step, prng);
        given = `Sequence: $${t1}, ${t2}, \\; [\\,?], \\; ${t4}, ${t5}$.`;
        required = `The third term of the sequence.`;
        method = `Find the step size $d = ${t2} - ${t1} = ${step}$, then add $${step}$ to the second term.`;
        steps = [
          `Find the common difference: $${t2} - ${t1} = ${step}$.`,
          `Add $${step}$ to the second term: $${t2} + ${step} = ${target}$.`,
          `Check: $${target} + ${step} = ${t4}$, which matches the following term!`,
        ];
        conclusion = `The missing number is $${target}$.`;
        hint = `Find the jump size between the first two terms ($${t2} - ${t1}$), then add it to $${t2}$.`;
      }
    } else if (subtopicIndex === 1) {
      // 2. Standard Base-10 Expanded Notation
      const tensDigit = prng.int(2, 9);
      const onesDigit = prng.int(1, 9);
      const val = tensDigit * 10 + onesDigit;

      const askExpandedToNum = prng.next() > 0.5;
      if (askExpandedToNum) {
        questionText = `Evaluate the expanded base-$10$ numerical expression:\n\n$$(${tensDigit} \\times 10) + ${onesDigit}$$`;
        correctAnswer = `$${val}$`;
        const d1 = tensDigit * 100 + onesDigit;
        const d2 = onesDigit * 10 + tensDigit;
        const d3 = tensDigit + onesDigit;
        rawDistractors = [`$${d1}$`, `$${d2}$`, `$${d3}$`];
        given = `Expression $(${tensDigit} \\times 10) + ${onesDigit}$.`;
        required = `Standard integer value.`;
        method = `Multiply the tens digit by $10$ and add the units digit: $${tensDigit} \\times 10 = ${tensDigit * 10}$, then add $${onesDigit}$.`;
        steps = [
          `Tens component: $${tensDigit} \\times 10 = ${tensDigit * 10}$.`,
          `Units component: $${onesDigit}$.`,
          `Sum: $${tensDigit * 10} + ${onesDigit} = ${val}$.`,
        ];
        conclusion = `The value of the expression is $${val}$.`;
        hint = `Multiply $${tensDigit} \\times 10$ first, then add $${onesDigit}$.`;
      } else {
        questionText = `Which equation expresses the integer $${val}$ in standard expanded base-$10$ form?`;
        correctAnswer = `$${tensDigit} \\times 10 + ${onesDigit}$`;
        rawDistractors = [
          `$${tensDigit} \\times 100 + ${onesDigit}$`,
          `$${onesDigit} \\times 10 + ${tensDigit}$`,
          `$${tensDigit} + ${onesDigit}$`,
        ];
        given = `Integer $${val}$.`;
        required = `Standard base-$10$ decomposition.`;
        method = `The tens digit has positional weight $10^1 = 10$, and the units digit has positional weight $10^0 = 1$.`;
        steps = [
          `Identify place values: $${tensDigit}$ in the tens column represents $${tensDigit} \\times 10$.`,
          `$${onesDigit}$ in the units column represents $${onesDigit}$.`,
          `Combined: $${tensDigit} \\times 10 + ${onesDigit}$.`,
        ];
        conclusion = `$${val} = ${tensDigit} \\times 10 + ${onesDigit}$.`;
        hint = `Break $${val}$ into its tens place ($${tensDigit} \\times 10$) and units place ($${onesDigit}$).`;
      }
    } else if (subtopicIndex === 2) {
      // 3. Consecutive Integers & Successors
      const num = prng.int(15, 95);
      const target = num + 1;
      questionText = `If $n = ${num}$, what is the value of the next consecutive integer $n + 1$?`;
      correctAnswer = `$${target}$`;
      rawDistractors = [`$${num - 1}$`, `$${num + 2}$`, `$${num + 10}$`];
      given = `Integer $n = ${num}$.`;
      required = `Consecutive successor $n + 1$.`;
      method = `Substitute $n = ${num}$ into $n + 1$.`;
      steps = [
        `Given $n = ${num}$.`,
        `Compute $${num} + 1 = ${target}$.`,
      ];
      conclusion = `The next consecutive integer is $${target}$.`;
      hint = `Consecutive integers increase by $1$. Calculate $${num} + 1$.`;
    } else if (subtopicIndex === 3) {
      // 4. Standard Inequalities
      const n1 = prng.int(20, 85);
      const diff = prng.pick([3, 5, 8, 12, 15]);
      const n2 = n1 + diff; // n2 > n1

      questionText = `Determine which inequality statement is mathematically valid:`;
      correctAnswer = `$${n2} > ${n1}$`;
      rawDistractors = [
        `$${n1} > ${n2}$`,
        `$${n2} < ${n1}$`,
        `$${n1} = ${n2}$`,
      ];
      given = `Integers $${n1}$ and $${n2}$.`;
      required = `The valid inequality comparison.`;
      method = `Since $${n2} - ${n1} = ${diff} > 0$, $${n2}$ is strictly greater than $${n1}$ ($${n2} > ${n1}$).`;
      steps = [
        `Compare values: $${n2}$ is larger than $${n1}$.`,
        `The inequality symbol "$>$" denotes "strictly greater than": $${n2} > ${n1}$.`,
      ];
      conclusion = `$${n2} > ${n1}$ is the valid statement.`;
      hint = `The open side of the inequality symbol always faces the larger quantity.`;
    } else {
      // 5. Strictly Ascending Order
      const a = prng.int(10, 25);
      const b = a + prng.int(5, 12);
      const c = b + prng.int(6, 14);
      const d = c + prng.int(7, 16);

      questionText = `Which expression arranges the set $\\{ ${a}, \\; ${c}, \\; ${b}, \\; ${d} \\}$ in strictly ascending order (from least to greatest)?`;
      correctAnswer = `$${a},\\; ${b},\\; ${c},\\; ${d}$`;
      rawDistractors = [
        `$${a},\\; ${c},\\; ${b},\\; ${d}$`,
        `$${d},\\; ${c},\\; ${b},\\; ${a}$`,
        `$${b},\\; ${a},\\; ${d},\\; ${c}$`,
      ];
      given = `Set of four integers: $\\{ ${a}, ${b}, ${c}, ${d} \\}$.`;
      required = `Chain of strict inequalities in ascending order.`;
      method = `Sort from least to greatest: $${a} < ${b} < ${c} < ${d}$.`;
      steps = [
        `Smallest element: $${a}$.`,
        `Second element: $${b}$ (since $${a} < ${b}$).`,
        `Third element: $${c}$ (since $${b} < ${c}$).`,
        `Largest element: $${d}$ (since $${c} < ${d}$).`,
      ];
      conclusion = `$${a} < ${b} < ${c} < ${d}$.`;
      hint = `Find the smallest number first and verify that each subsequent number is strictly greater.`;
    }
  } else if (stageId === 2) {
    // Place Value: 4 diverse archetypes to guarantee uniqueness across block
    const subtopicIndex = (questionIndex + (blockId % 4)) % 4;
    const d3 = prng.int(1, 9);
    const d2 = prng.pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => d !== d3));
    const d1 = prng.pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => d !== d3 && d !== d2));
    const d0 = prng.pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => d !== d3 && d !== d2 && d !== d1));
    const num = d3 * 1000 + d2 * 100 + d1 * 10 + d0;

    if (subtopicIndex === 0) {
      const target = d2 * 100;
      questionText = `In the integer $${num.toLocaleString()}$, what is the place value of the digit $${d2}$?`;
      correctAnswer = `$${target}$`;
      rawDistractors = [`$${d2}$`, `$${d2 * 10}$`, `$${d2 * 1000}$`];
      given = `The integer $${num.toLocaleString()}$.`;
      required = `The place value of the digit $${d2}$.`;
      method = `Identify the position of digit $${d2}$ (hundreds column), then multiply by its positional weight ($10^2 = 100$).`;
      steps = [
        `Units: $${d0}$, Tens: $${d1} \\times 10 = ${d1 * 10}$, Hundreds: $${d2} \\times 100 = ${target}$.`,
        `Therefore, the digit $${d2}$ represents $${target}$.`,
      ];
      conclusion = `The place value is $${target}$.`;
      hint = `Notice which column the digit occupies: units, tens, hundreds, or thousands?`;
    } else if (subtopicIndex === 1) {
      questionText = `Evaluate this expanded base-$10$ expression into a single standard integer:\n\n$$(${d3} \\times 1000) + (${d2} \\times 100) + (${d1} \\times 10) + ${d0}$$`;
      correctAnswer = `$${num}$`;
      const alt1 = d2 * 1000 + d3 * 100 + d1 * 10 + d0;
      const alt2 = d3 * 1000 + d1 * 100 + d2 * 10 + d0;
      const alt3 = d3 * 100 + d2 * 10 + d1 + d0;
      rawDistractors = [`$${alt1}$`, `$${alt2}$`, `$${alt3}$`];
      given = `Expanded base-$10$ terms: $${d3} \\times 1000$, $${d2} \\times 100$, $${d1} \\times 10$, and $${d0}$.`;
      required = `Combined standard integer.`;
      method = `Compute each place-value product and sum them together.`;
      steps = [
        `Thousands: $${d3} \\times 1000 = ${d3 * 1000}$.`,
        `Hundreds: $${d2} \\times 100 = ${d2 * 100}$.`,
        `Tens: $${d1} \\times 10 = ${d1 * 10}$, Units: $${d0}$.`,
        `Sum: $${d3 * 1000} + ${d2 * 100} + ${d1 * 10} + ${d0} = ${num}$.`,
      ];
      conclusion = `The standard integer is $${num}$.`;
      hint = `Combine the thousands, hundreds, tens, and units places together.`;
    } else if (subtopicIndex === 2) {
      const places = [
        { name: 'thousands', digit: d3 },
        { name: 'hundreds', digit: d2 },
        { name: 'tens', digit: d1 },
        { name: 'units', digit: d0 },
      ];
      const chosen = prng.pick(places);
      questionText = `In the four-digit integer $${num.toLocaleString()}$, which digit occupies the ${chosen.name} place?`;
      correctAnswer = `$${chosen.digit}$`;
      const otherDigits = [d3, d2, d1, d0].filter(d => d !== chosen.digit);
      rawDistractors = otherDigits.slice(0, 3).map(d => `$${d}$`);
      given = `Integer $${num.toLocaleString()}$.`;
      required = `Digit occupying the ${chosen.name} place.`;
      method = `Read place values from right to left: units ($10^0$), tens ($10^1$), hundreds ($10^2$), thousands ($10^3$).`;
      steps = [
        `Thousands digit: $${d3}$, Hundreds digit: $${d2}$, Tens digit: $${d1}$, Units digit: $${d0}$.`,
        `The ${chosen.name} place is occupied by $${chosen.digit}$.`,
      ];
      conclusion = `The digit in the ${chosen.name} place is $${chosen.digit}$.`;
      hint = `Recall the place values: Units is rightmost, followed by Tens, Hundreds, and Thousands.`;
    } else {
      const tensVal = d1 * 10;
      const targetRatio = 10;
      questionText = `In the integer $${num.toLocaleString()}$, how many times greater is the positional value of the tens digit ($${tensVal}$) than if that same digit $${d1}$ were in the units place ($${d1}$)?`;
      correctAnswer = `$${targetRatio}$`;
      rawDistractors = [`$100$`, `$1$`, `$1000$`];
      given = `Digit $${d1}$ in tens place ($${tensVal}$) vs units place ($${d1}$).`;
      required = `Ratio between consecutive base-$10$ columns.`;
      method = `Divide the higher place value by the lower place value: $\\frac{${tensVal}}{${d1}} = 10$.`;
      steps = [
        `Positional value in tens column: $${tensVal}$.`,
        `Positional value in units column: $${d1}$.`,
        `Ratio: $\\frac{${tensVal}}{${d1}} = 10$.`,
      ];
      conclusion = `Each column in base-$10$ is $10$ times greater than the column to its immediate right.`;
      hint = `Our number system is base-$10$, meaning each step to the left multiplies the positional value by $10$.`;
    }
  } else if (stageId === 3) {
    // Addition: 5 diverse archetypes (direct sum, missing addend, word problem, 3-term sum, balance)
    const subtopicIndex = effectiveSubtopic % 5;
    const a = prng.int(25, 140) * tierMultiplier;
    const b = prng.int(20, 110) * tierMultiplier;
    const sum = a + b;

    if (subtopicIndex === 0) {
      questionText = `Calculate the sum:\n\n$$${a} + ${b}$$`;
      correctAnswer = `$${sum}$`;
      const dist = generateNumericalDistractors(sum, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Addends $${a}$ and $${b}$.`;
      required = `Sum $${a} + ${b}$.`;
      method = `Perform column addition: align place values and regroup if column total reaches 10.`;
      steps = [`$${a} + ${b} = ${sum}$.`];
      conclusion = `The sum is $${sum}$.`;
      hint = `Add units column first, carry any tens into the tens column.`;
    } else if (subtopicIndex === 1) {
      questionText = `Find the unknown value $x$ that satisfies the equation:\n\n$$${a} + x = ${sum}$$`;
      correctAnswer = `$${b}$`;
      const dist = generateNumericalDistractors(b, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Equation $${a} + x = ${sum}$.`;
      required = `Missing addend $x$.`;
      method = `Subtract $${a}$ from both sides: $x = ${sum} - ${a}$.`;
      steps = [`$x = ${sum} - ${a} = ${b}$.`];
      conclusion = `$x = ${b}$.`;
      hint = `Subtract $${a}$ from the total $${sum}$.`;
    } else if (subtopicIndex === 2) {
      questionText = `A school library received $${a}$ mathematics textbooks on Monday and $${b}$ science journals on Tuesday. How many books did the library receive altogether?`;
      correctAnswer = `$${sum}$`;
      const dist = generateNumericalDistractors(sum, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$${a}$ textbooks and $${b}$ journals.`;
      required = `Total book collection received.`;
      method = `Combine both quantities: $\\text{Total} = ${a} + ${b}$.`;
      steps = [`$${a} + ${b} = ${sum}$.`];
      conclusion = `The library received $${sum}$ books in total.`;
      hint = `Add the textbooks and journals together.`;
    } else if (subtopicIndex === 3) {
      const c = prng.int(10, 45) * tierMultiplier;
      const total3 = a + b + c;
      questionText = `Evaluate the three-term sum:\n\n$$${a} + ${b} + ${c}$$`;
      correctAnswer = `$${total3}$`;
      const dist = generateNumericalDistractors(total3, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Terms $${a}$, $${b}$, and $${c}$.`;
      required = `Three-term sum.`;
      method = `Use associative property: sum the first two numbers ($${a} + ${b} = ${sum}$), then add $${c}$.`;
      steps = [
        `First part: $${a} + ${b} = ${sum}$.`,
        `Second part: $${sum} + ${c} = ${total3}$.`,
      ];
      conclusion = `The sum is $${total3}$.`;
      hint = `Add the first two numbers, then add the third number.`;
    } else {
      const bal = prng.int(15, 60) * tierMultiplier;
      const missing = sum - bal;
      questionText = `Find the value of $n$ that balances this equation:\n\n$$${a} + ${b} = ${bal} + n$$`;
      correctAnswer = `$${missing}$`;
      const dist = generateNumericalDistractors(missing, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Equation $${a} + ${b} = ${bal} + n$.`;
      required = `Balancing term $n$.`;
      method = `Compute the left side ($${a} + ${b} = ${sum}$), then subtract $${bal}$ to isolate $n$.`;
      steps = [
        `Left-hand side: $${a} + ${b} = ${sum}$.`,
        `Solve: $n = ${sum} - ${bal} = ${missing}$.`,
      ];
      conclusion = `$n = ${missing}$.`;
      hint = `Find the sum of the left side, then subtract $${bal}$.`;
    }
  } else if (stageId === 4) {
    // Subtraction: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const b = prng.int(25, 140) * tierMultiplier;
    const diff = prng.int(15, 90) * tierMultiplier;
    const a = b + diff;

    if (subtopicIndex === 0) {
      questionText = `Evaluate the difference:\n\n$$${a} - ${b}$$`;
      correctAnswer = `$${diff}$`;
      const dist = generateNumericalDistractors(diff, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Minuend $${a}$ and subtrahend $${b}$.`;
      required = `Difference $${a} - ${b}$.`;
      method = `Decompose or regroup across place values to compute $${a} - ${b}$.`;
      steps = [`$${a} - ${b} = ${diff}$.`];
      conclusion = `The difference is $${diff}$.`;
      hint = `Check your result by adding $${diff} + ${b}$ to see if you get $${a}$.`;
    } else if (subtopicIndex === 1) {
      questionText = `Solve for the unknown $x$ in the equation:\n\n$$x - ${b} = ${diff}$$`;
      correctAnswer = `$${a}$`;
      const dist = generateNumericalDistractors(a, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Equation $x - ${b} = ${diff}$.`;
      required = `Value of $x$.`;
      method = `Add $${b}$ to both sides: $x = ${diff} + ${b}$.`;
      steps = [`$x = ${diff} + ${b} = ${a}$.`];
      conclusion = `$x = ${a}$.`;
      hint = `To find the original number before subtraction, add $${b}$ and $${diff}$.`;
    } else if (subtopicIndex === 2) {
      questionText = `A warehouse had $${a}$ solar calculators in stock. After dispatching $${b}$ calculators to regional schools, how many calculators remain in inventory?`;
      correctAnswer = `$${diff}$`;
      const dist = generateNumericalDistractors(diff, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Initial quantity $${a}$, dispatched $${b}$.`;
      required = `Remaining calculators.`;
      method = `Subtract dispatched items from stock: $\\text{Remaining} = ${a} - ${b}$.`;
      steps = [`$${a} - ${b} = ${diff}$.`];
      conclusion = `$${diff}$ calculators remain in stock.`;
      hint = `Deduct the dispatched quantity from the initial stock.`;
    } else if (subtopicIndex === 3) {
      questionText = `By how much is the number $${a}$ strictly greater than the number $${b}$?`;
      correctAnswer = `$${diff}$`;
      const dist = generateNumericalDistractors(diff, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Numbers $${a}$ and $${b}$.`;
      required = `Excess of $${a}$ over $${b}$.`;
      method = `Subtract smaller from larger: $${a} - ${b} = ${diff}$.`;
      steps = [`$${a} - ${b} = ${diff}$.`];
      conclusion = `$${a}$ is greater than $${b}$ by $${diff}$.`;
      hint = `Find the arithmetic difference between the two numbers.`;
    } else {
      const c = prng.int(5, 25);
      const finalDiff = diff - c;
      questionText = `Compute the consecutive subtraction:\n\n$$${a} - ${b} - ${c}$$`;
      correctAnswer = `$${finalDiff}$`;
      const dist = generateNumericalDistractors(finalDiff, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $${a} - ${b} - ${c}$.`;
      required = `Final net value.`;
      method = `Work left to right: first $${a} - ${b} = ${diff}$, then $${diff} - ${c} = ${finalDiff}$.`;
      steps = [
        `Step 1: $${a} - ${b} = ${diff}$.`,
        `Step 2: $${diff} - ${c} = ${finalDiff}$.`,
      ];
      conclusion = `The value is $${finalDiff}$.`;
      hint = `Subtract $${b}$ first, then subtract $${c}$ from the result.`;
    }
  } else if (stageId === 5) {
    // Multiplication: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const a = prng.int(4, 14) * (tier === 'mastery' ? 2 : 1);
    const b = prng.int(3, 12) * (tier === 'mastery' ? 2 : 1);
    const prod = a * b;

    if (subtopicIndex === 0) {
      questionText = `Calculate the product:\n\n$$${a} \\times ${b}$$`;
      correctAnswer = `$${prod}$`;
      const dist = generateNumericalDistractors(prod, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Factors $${a}$ and $${b}$.`;
      required = `Product $${a} \\times ${b}$.`;
      method = `Multiply the factors: $${a} \\times ${b} = ${prod}$.`;
      steps = [`$${a} \\times ${b} = ${prod}$.`];
      conclusion = `The product is $${prod}$.`;
      hint = `Recall the multiplication table or break $${b}$ into tens and units.`;
    } else if (subtopicIndex === 1) {
      questionText = `Solve for the unknown factor $n$ in the equation:\n\n$$${a} \\times n = ${prod}$$`;
      correctAnswer = `$${b}$`;
      const dist = generateNumericalDistractors(b, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Equation $${a} \\times n = ${prod}$.`;
      required = `Unknown factor $n$.`;
      method = `Divide both sides by $${a}$: $n = \\frac{${prod}}{${a}}$.`;
      steps = [`$n = \\frac{${prod}}{${a}} = ${b}$.`];
      conclusion = `$n = ${b}$.`;
      hint = `Divide $${prod}$ by $${a}$.`;
    } else if (subtopicIndex === 2) {
      questionText = `A local bakery prepares $${a}$ trays of cupcakes. If each tray holds exactly $${b}$ cupcakes, how many cupcakes are prepared in total?`;
      correctAnswer = `$${prod}$`;
      const dist = generateNumericalDistractors(prod, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$${a}$ trays, each holding $${b}$ cupcakes.`;
      required = `Total cupcake count.`;
      method = `Apply multiplication as repeated equal groups: $\\text{Total} = ${a} \\times ${b}$.`;
      steps = [`$${a} \\times ${b} = ${prod}$.`];
      conclusion = `The bakery prepared $${prod}$ cupcakes.`;
      hint = `Multiply the number of trays by the number per tray.`;
    } else if (subtopicIndex === 3) {
      const c = prng.int(2, 6);
      const distSum = b + c;
      const distProd = a * distSum;
      questionText = `Evaluate using the distributive property: $${a} \\times (${b} + ${c})$:\n\n$$(${a} \\times ${b}) + (${a} \\times ${c})$$`;
      correctAnswer = `$${distProd}$`;
      const dist = generateNumericalDistractors(distProd, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $${a} \\times (${b} + ${c})$.`;
      required = `Evaluated product.`;
      method = `Compute inside parentheses first: $${b} + ${c} = ${distSum}$, then multiply: $${a} \\times ${distSum} = ${distProd}$.`;
      steps = [
        `Distributive expansion: $(${a} \\times ${b}) + (${a} \\times ${c}) = ${a * b} + ${a * c}$.`,
        `Sum: $${a * b} + ${a * c} = ${distProd}$.`,
      ];
      conclusion = `The value is $${distProd}$.`;
      hint = `Multiply $${a}$ by each term inside the bracket or add inside first.`;
    } else {
      const c = prng.int(2, 4);
      const total3 = a * b * c;
      questionText = `Evaluate the product of three factors:\n\n$$${a} \\times ${b} \\times ${c}$$`;
      correctAnswer = `$${total3}$`;
      const dist = generateNumericalDistractors(total3, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Factors $${a}$, $${b}$, and $${c}$.`;
      required = `Three-factor product.`;
      method = `Multiply the first two factors: $${a} \\times ${b} = ${prod}$, then multiply by $${c}$: $${prod} \\times ${c} = ${total3}$.`;
      steps = [
        `Step 1: $${a} \\times ${b} = ${prod}$.`,
        `Step 2: $${prod} \\times ${c} = ${total3}$.`,
      ];
      conclusion = `The product is $${total3}$.`;
      hint = `Multiply the first two numbers, then multiply the result by $${c}$.`;
    }
  } else if (stageId === 6) {
    // Division: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const divisor = prng.int(4, 12);
    const quotient = prng.int(6, 25) * tierMultiplier;
    const dividend = divisor * quotient;

    if (subtopicIndex === 0) {
      questionText = `Compute the exact quotient:\n\n$$${dividend} \\div ${divisor}$$`;
      correctAnswer = `$${quotient}$`;
      const dist = generateNumericalDistractors(quotient, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Dividend $${dividend}$, Divisor $${divisor}$.`;
      required = `Exact quotient $${dividend} \\div ${divisor}$.`;
      method = `Divide $${dividend}$ by $${divisor}$: how many groups of $${divisor}$ are in $${dividend}$?`;
      steps = [`$${dividend} \\div ${divisor} = ${quotient}$ because $${divisor} \\times ${quotient} = ${dividend}$.`];
      conclusion = `The quotient is $${quotient}$.`;
      hint = `Think: what number multiplied by $${divisor}$ gives $${dividend}$?`;
    } else if (subtopicIndex === 1) {
      const remainder = prng.int(1, divisor - 1);
      const remDividend = dividend + remainder;
      questionText = `When $${remDividend}$ is divided by $${divisor}$, what is the integer remainder $r$?`;
      correctAnswer = `$${remainder}$`;
      const validRemainders: number[] = [];
      validRemainders.push(0);
      for (let r = 1; r < divisor; r++) {
        if (r !== remainder) validRemainders.push(r);
      }
      const shuffledRems = prng.shuffle(validRemainders);
      rawDistractors = [
        `$${shuffledRems[0]}$`,
        `$${shuffledRems[1]}$`,
        `$${shuffledRems[2]}$`,
      ];
      given = `Dividend $${remDividend}$, Divisor $${divisor}$.`;
      required = `Remainder $r$ ($0 \\le r < ${divisor}$).`;
      method = `Find largest multiple of $${divisor}$: $${divisor} \\times ${quotient} = ${dividend}$. Remainder is $${remDividend} - ${dividend} = ${remainder}$.`;
      steps = [
        `Highest multiple: $${divisor} \\times ${quotient} = ${dividend}$.`,
        `Remainder: $${remDividend} - ${dividend} = ${remainder}$.`,
      ];
      conclusion = `The remainder is $${remainder}$.`;
      hint = `Subtract the largest multiple of $${divisor}$ from $${remDividend}$.`;
    } else if (subtopicIndex === 2) {
      questionText = `Find the unknown value $x$ in the division equation:\n\n$$x \\div ${divisor} = ${quotient}$$`;
      correctAnswer = `$${dividend}$`;
      const dist = generateNumericalDistractors(dividend, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Equation $x \\div ${divisor} = ${quotient}$.`;
      required = `Dividend $x$.`;
      method = `Inverse operation of division is multiplication: $x = ${quotient} \\times ${divisor}$.`;
      steps = [`$x = ${quotient} \\times ${divisor} = ${dividend}$.`];
      conclusion = `$x = ${dividend}$.`;
      hint = `Multiply the quotient $${quotient}$ by the divisor $${divisor}$.`;
    } else if (subtopicIndex === 3) {
      questionText = `A teacher divides $${dividend}$ stickers equally among $${divisor}$ students. How many stickers does each student receive?`;
      correctAnswer = `$${quotient}$`;
      const dist = generateNumericalDistractors(quotient, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$${dividend}$ stickers, $${divisor}$ students.`;
      required = `Stickers per student.`;
      method = `Equal sharing division: $\\frac{${dividend}}{${divisor}} = ${quotient}$.`;
      steps = [`$${dividend} \\div ${divisor} = ${quotient}$.`];
      conclusion = `Each student receives $${quotient}$ stickers.`;
      hint = `Divide total stickers by the number of students.`;
    } else {
      questionText = `Which of the following numbers is evenly divisible by $${divisor}$ without a remainder?`;
      correctAnswer = `$${dividend}$`;
      const wrong1 = dividend + 1;
      const wrong2 = dividend - 1;
      const wrong3 = dividend + 2;
      rawDistractors = [`$${wrong1}$`, `$${wrong2}$`, `$${wrong3}$`];
      given = `Divisor $${divisor}$.`;
      required = `Number evenly divisible by $${divisor}$.`;
      method = `Test divisibility: $${dividend} = ${divisor} \\times ${quotient}$ leaves remainder 0.`;
      steps = [
        `$${dividend} \\div ${divisor} = ${quotient}$ (exact).`,
        `The other options leave non-zero remainders.`,
      ];
      conclusion = `$${dividend}$ is divisible by $${divisor}$.`;
    }
  } else if (stageId === 7) {
    // Factors & Multiples: 5 diverse archetypes (GCF, LCM, Prime factorization, Prime identification, Factor count)
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const p1 = prng.pick([2, 3, 5]);
      const p2 = prng.pick([7, 11, 13]);
      const g = prng.pick([2, 3, 4, 6]);
      const num1 = p1 * g;
      const num2 = p2 * g;
      const ansGcd = g;
      questionText = `Find the greatest common factor (GCF) of $${num1}$ and $${num2}$.`;
      correctAnswer = `$${ansGcd}$`;
      const dist = generateNumericalDistractors(ansGcd, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Numbers $${num1}$ and $${num2}$.`;
      required = `Greatest Common Factor $\\gcd(${num1}, ${num2})$.`;
      method = `Express both numbers as prime factorizations and take the product of common prime powers.`;
      steps = [
        `Factor $${num1} = ${ansGcd} \\times ${num1 / ansGcd}$.`,
        `Factor $${num2} = ${ansGcd} \\times ${num2 / ansGcd}$.`,
        `Since $\\gcd(${num1 / ansGcd}, ${num2 / ansGcd}) = 1$, the GCF is $${ansGcd}$.`,
      ];
      conclusion = `$\\text{GCF}(${num1}, ${num2}) = ${ansGcd}$.`;
      hint = `List all numbers that divide both $${num1}$ and $${num2}$ without leaving a remainder.`;
    } else if (subtopicIndex === 1) {
      const a = prng.pick([4, 6, 8, 9, 10]);
      const b = prng.pick([6, 8, 12, 15].filter(x => x !== a));
      const g = gcd(a, b);
      const lcm = (a * b) / g;
      questionText = `Find the least common multiple (LCM) of $${a}$ and $${b}$.`;
      correctAnswer = `$${lcm}$`;
      const dist = generateNumericalDistractors(lcm, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Integers $${a}$ and $${b}$.`;
      required = `Least Common Multiple $\\text{LCM}(${a}, ${b})$.`;
      method = `Use relationship: $\\text{LCM}(a, b) = \\frac{a \\times b}{\\gcd(a, b)}$.`;
      steps = [
        `Find $\\gcd(${a}, ${b}) = ${g}$.`,
        `Calculate LCM: $\\frac{${a} \\times ${b}}{${g}} = \\frac{${a * b}}{${g}} = ${lcm}$.`,
      ];
      conclusion = `$\\text{LCM}(${a}, ${b}) = ${lcm}$.`;
      hint = `List positive multiples of each number until you find the smallest one they share.`;
    } else if (subtopicIndex === 2) {
      const primes = [
        { num: 24, text: '2^3 \\times 3', wrong: ['2^2 \\times 6', '2 \\times 12', '3^2 \\times 2'] },
        { num: 36, text: '2^2 \\times 3^2', wrong: ['2^3 \\times 3', '4 \\times 9', '2 \\times 3^3'] },
        { num: 40, text: '2^3 \\times 5', wrong: ['2^2 \\times 10', '4 \\times 10', '2^4 \\times 5'] },
        { num: 60, text: '2^2 \\times 3 \\times 5', wrong: ['2^3 \\times 3 \\times 5', '4 \\times 15', '2 \\times 3^2 \\times 5'] },
        { num: 72, text: '2^3 \\times 3^2', wrong: ['2^2 \\times 3^3', '8 \\times 9', '2^4 \\times 3'] },
      ];
      const item = prng.pick(primes);
      questionText = `Which expression gives the prime factorization of $${item.num}$ in standard index form?`;
      correctAnswer = `$${item.text}$`;
      rawDistractors = item.wrong.map(w => `$${w}$`);
      given = `Integer $${item.num}$.`;
      required = `Prime factorization in index form.`;
      method = `Repeatedly divide by the smallest prime factors until only prime factors remain.`;
      steps = [
        `Break down $${item.num}$ into prime factors.`,
        `Group like primes using exponents: $${item.text}$.`,
      ];
      conclusion = `$${item.num} = ${item.text}$.`;
      hint = `Every factor in a prime factorization must be a prime number (e.g. 2, 3, 5).`;
    } else if (subtopicIndex === 3) {
      const primePool = [17, 19, 23, 29, 31, 37, 41, 43, 47];
      const compositePool = [21, 25, 27, 33, 35, 39, 45, 49, 51];
      const correctPrime = prng.pick(primePool);
      const distComposites = prng.shuffle(compositePool).slice(0, 3);
      questionText = `Which of the following numbers is a prime number?`;
      correctAnswer = `$${correctPrime}$`;
      rawDistractors = distComposites.map(c => `$${c}$`);
      given = `Set of four positive integers.`;
      required = `The unique prime number.`;
      method = `A prime number has exactly two distinct positive divisors: 1 and itself.`;
      steps = [
        `Check divisors of $${correctPrime}$: only $1$ and $${correctPrime}$ divide it evenly.`,
        `The other options are composite because they have additional factors.`,
      ];
      conclusion = `$${correctPrime}$ is the prime number.`;
      hint = `Recall: A prime number cannot be divided evenly by any number other than 1 and itself.`;
    } else {
      const factorData = [
        { n: 12, factors: [1, 2, 3, 4, 6, 12], count: 6 },
        { n: 16, factors: [1, 2, 4, 8, 16], count: 5 },
        { n: 18, factors: [1, 2, 3, 6, 9, 18], count: 6 },
        { n: 20, factors: [1, 2, 4, 5, 10, 20], count: 6 },
        { n: 24, factors: [1, 2, 3, 4, 6, 8, 12, 24], count: 8 },
      ];
      const fItem = prng.pick(factorData);
      questionText = `How many distinct positive factors does the integer $${fItem.n}$ have?`;
      correctAnswer = `$${fItem.count}$`;
      const dist = generateNumericalDistractors(fItem.count, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Integer $${fItem.n}$.`;
      required = `Total count of positive divisors.`;
      method = `List all factor pairs that multiply to $${fItem.n}$.`;
      steps = [
        `Factor pairs: $\\{${fItem.factors.join(', ')}\\}$.`,
        `Total count: $${fItem.count}$ factors.`,
      ];
      conclusion = `$${fItem.n}$ has $${fItem.count}$ positive factors.`;
      hint = `List all pairs of whole numbers that multiply together to make $${fItem.n}$.`;
    }
  } else if (stageId === 8) {
    // Number Properties: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const base = prng.int(6, 20);
      const sq = base * base;
      questionText = `Evaluate the square of the integer $${base}$ ($${base}^2$):\n\n$$${base}^2$$`;
      correctAnswer = `$${sq}$`;
      const dist = generateNumericalDistractors(sq, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Base integer $${base}$.`;
      required = `Value of $${base}^2 = ${base} \\times ${base}$.`;
      method = `Multiply $${base}$ by itself.`;
      steps = [`$${base} \\times ${base} = ${sq}$.`];
      conclusion = `$${base}^2 = ${sq}$.`;
      hint = `Multiply the number by itself.`;
    } else if (subtopicIndex === 1) {
      const root = prng.int(5, 15);
      const sq = root * root;
      questionText = `Find the principal square root:\n\n$$\\sqrt{${sq}}$$`;
      correctAnswer = `$${root}$`;
      const dist = generateNumericalDistractors(root, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Radicand $${sq}$.`;
      required = `Square root $\\sqrt{${sq}}$.`;
      method = `Determine which positive number squared yields $${sq}$.`;
      steps = [`Since $${root}^2 = ${sq}$, $\\sqrt{${sq}} = ${root}$.`];
      conclusion = `$\\sqrt{${sq}} = ${root}$.`;
      hint = `What positive number multiplied by itself equals $${sq}$?`;
    } else if (subtopicIndex === 2) {
      const cubeBase = prng.int(2, 6);
      const cubeVal = cubeBase * cubeBase * cubeBase;
      questionText = `Evaluate the cube of $${cubeBase}$ ($${cubeBase}^3$):\n\n$$${cubeBase}^3$$`;
      correctAnswer = `$${cubeVal}$`;
      const dist = generateNumericalDistractors(cubeVal, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Base $${cubeBase}$.`;
      required = `Cube $${cubeBase}^3 = ${cubeBase} \\times ${cubeBase} \\times ${cubeBase}$.`;
      method = `Multiply $${cubeBase}$ by itself three times.`;
      steps = [
        `$${cubeBase} \\times ${cubeBase} = ${cubeBase * cubeBase}$.`,
        `$${cubeBase * cubeBase} \\times ${cubeBase} = ${cubeVal}$.`,
      ];
      conclusion = `$${cubeBase}^3 = ${cubeVal}$.`;
      hint = `Multiply $${cubeBase}$ three times: $${cubeBase} \\times ${cubeBase} \\times ${cubeBase}$.`;
    } else if (subtopicIndex === 3) {
      questionText = `If $n$ is any odd integer, which of the following algebraic expressions must always result in an even integer?`;
      correctAnswer = `$2n$`;
      rawDistractors = [`$n + 2$`, `$n^2$`, `$2n + 1$`];
      given = `Odd integer $n = 2k + 1$.`;
      required = `Expression guaranteed to be even.`;
      method = `Any integer multiplied by $2$ produces a multiple of $2$, which is by definition even.`;
      steps = [
        `$2n = 2(2k + 1)$, which is divisible by $2$, so it is always even.`,
        `$n + 2$ remains odd; $n^2$ is odd; $2n + 1$ is always odd.`,
      ];
      conclusion = `$2n$ is always even.`;
      hint = `Multiplying any integer by 2 always yields an even number.`;
    } else {
      const a = prng.int(12, 50);
      const b = prng.int(10, 40);
      questionText = `Which arithmetic axiom states that $${a} + ${b} = ${b} + ${a}$?`;
      correctAnswer = `Commutative Property of Addition`;
      rawDistractors = [
        `Associative Property of Addition`,
        `Distributive Property`,
        `Additive Identity Property`,
      ];
      given = `Equation $${a} + ${b} = ${b} + ${a}$.`;
      required = `Name of mathematical axiom.`;
      method = `The commutative law states that changing the order of operands does not change the sum.`;
      steps = [
        `Order of terms is swapped without changing total.`,
        `This is the Commutative Property of Addition.`,
      ];
      conclusion = `Commutative Property of Addition.`;
      hint = `Think of "commuting" or moving positions: order doesn't affect the sum.`;
    }
  } else if (stageId === 9) {
    // Order of Operations: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const a = prng.int(3, 8);
    const b = prng.int(2, 6);
    const c = prng.int(2, 5);

    if (subtopicIndex === 0) {
      const d = prng.int(1, Math.max(1, a + b * c - 2));
      const ans = a + b * c - d;
      questionText = `Evaluate using order of operations (PEMDAS/BODMAS):\n\n$$${a} + ${b} \\times ${c} - ${d}$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $${a} + ${b} \\times ${c} - ${d}$.`;
      required = `Evaluated numerical result.`;
      method = `Multiplication takes precedence over addition and subtraction.`;
      steps = [
        `Multiply first: $${b} \\times ${c} = ${b * c}$.`,
        `Substitute: $${a} + ${b * c} - ${d}$.`,
        `Calculate left to right: $${a + b * c} - ${d} = ${ans}$.`,
      ];
      conclusion = `The value is $${ans}$.`;
      hint = `Always perform multiplication before addition or subtraction!`;
    } else if (subtopicIndex === 1) {
      const ans = (a + b) * c;
      questionText = `Evaluate with brackets priority:\n\n$$(${a} + ${b}) \\times ${c}$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $(${a} + ${b}) \\times ${c}$.`;
      required = `Evaluated value.`;
      method = `Operations inside brackets take highest precedence.`;
      steps = [
        `Evaluate inside brackets first: $${a} + ${b} = ${a + b}$.`,
        `Multiply: $${a + b} \\times ${c} = ${ans}$.`,
      ];
      conclusion = `The value is $${ans}$.`;
      hint = `Compute what is inside the parentheses first!`;
    } else if (subtopicIndex === 2) {
      const base = prng.int(2, 4);
      const mult = prng.int(2, 5);
      const addVal = prng.int(3, 10);
      const ans = base * base + mult * addVal;
      questionText = `Evaluate the expression containing exponents and multiplication:\n\n$$${base}^2 + ${mult} \\times ${addVal}$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $${base}^2 + ${mult} \\times ${addVal}$.`;
      required = `Final result.`;
      method = `Exponents first, then multiplication, then addition.`;
      steps = [
        `Evaluate exponent: $${base}^2 = ${base * base}$.`,
        `Evaluate product: $${mult} \\times ${addVal} = ${mult * addVal}$.`,
        `Add results: $${base * base} + ${mult * addVal} = ${ans}$.`,
      ];
      conclusion = `The value is $${ans}$.`;
      hint = `Evaluate the power first, then the multiplication, and finish with the addition.`;
    } else if (subtopicIndex === 3) {
      const div = prng.pick([2, 3, 4]);
      const num = div * prng.int(3, 8);
      const ans = a * b - num / div;
      questionText = `Evaluate the mixed operations expression:\n\n$$(${a} \\times ${b}) - (${num} \\div ${div})$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $(${a} \\times ${b}) - (${num} \\div ${div})$.`;
      required = `Evaluated value.`;
      method = `Evaluate each bracketed expression first, then perform the subtraction.`;
      steps = [
        `First bracket: $${a} \\times ${b} = ${a * b}$.`,
        `Second bracket: $${num} \\div ${div} = ${num / div}$.`,
        `Subtract: $${a * b} - ${num / div} = ${ans}$.`,
      ];
      conclusion = `The value is $${ans}$.`;
      hint = `Work out each set of parentheses first, then subtract.`;
    } else {
      const k = prng.int(2, 4);
      const ans = a + b * (c + k);
      questionText = `Evaluate the nested expression:\n\n$$${a} + ${b} \\times (${c} + ${k})$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $${a} + ${b} \\times (${c} + ${k})$.`;
      required = `Evaluated result.`;
      method = `Parentheses first, then multiplication by $${b}$, then addition of $${a}$.`;
      steps = [
        `Parentheses: $${c} + ${k} = ${c + k}$.`,
        `Multiplication: $${b} \\times ${c + k} = ${b * (c + k)}$.`,
        `Addition: $${a} + ${b * (c + k)} = ${ans}$.`,
      ];
      conclusion = `The result is $${ans}$.`;
      hint = `Add inside the brackets first, then multiply, then add $${a}$.`;
    }
  } else if (stageId === 10) {
    // Number Foundations Challenge: 5 diverse synthesis archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const a = prng.int(3, 8);
    const b = prng.int(2, 5);
    const c = prng.int(2, 4);

    if (subtopicIndex === 0) {
      const val = a * b + Math.pow(c, 2);
      questionText = `Evaluate the multi-step expression:\n\n$$${a} \\times ${b} + ${c}^2$$`;
      correctAnswer = `$${val}$`;
      const dist = generateNumericalDistractors(val, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $${a} \\times ${b} + ${c}^2$.`;
      required = `Final simplified value.`;
      method = `Exponents first, then multiplication, then addition.`;
      steps = [
        `Evaluate exponent: $${c}^2 = ${c * c}$.`,
        `Evaluate multiplication: $${a} \\times ${b} = ${a * b}$.`,
        `Add results: $${a * b} + ${c * c} = ${val}$.`,
      ];
      conclusion = `The result is $${val}$.`;
      hint = `Remember PEMDAS: Parentheses, Exponents, Multiplication & Division, Addition & Subtraction.`;
    } else if (subtopicIndex === 1) {
      const total = a * (b + c) - 2;
      questionText = `Solve for the numerical value:\n\n$$${a} \\times (${b} + ${c}) - 2$$`;
      correctAnswer = `$${total}$`;
      const dist = generateNumericalDistractors(total, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $${a} \\times (${b} + ${c}) - 2$.`;
      required = `Evaluated integer.`;
      method = `Brackets first: $${b} + ${c} = ${b + c}$, then multiply by $${a}$, then subtract $2$.`;
      steps = [
        `Brackets: $${b} + ${c} = ${b + c}$.`,
        `Multiply: $${a} \\times ${b + c} = ${a * (b + c)}$.`,
        `Subtract 2: $${a * (b + c)} - 2 = ${total}$.`,
      ];
      conclusion = `The value is $${total}$.`;
      hint = `Work from inside the parentheses outwards.`;
    } else if (subtopicIndex === 2) {
      const targetSum = a * b;
      questionText = `What number $x$ makes this arithmetic statement true?\n\n$$${a} \\times ${b} = x + ${c}$$`;
      const xVal = targetSum - c;
      correctAnswer = `$${xVal}$`;
      const dist = generateNumericalDistractors(xVal, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Equation $${a} \\times ${b} = x + ${c}$.`;
      required = `Value of $x$.`;
      method = `Compute the left side ($${a} \\times ${b} = ${targetSum}$), then subtract $${c}$.`;
      steps = [
        `Left-hand side: $${a} \\times ${b} = ${targetSum}$.`,
        `$x = ${targetSum} - ${c} = ${xVal}$.`,
      ];
      conclusion = `$x = ${xVal}$.`;
      hint = `Calculate the multiplication on the left, then subtract $${c}$.`;
    } else if (subtopicIndex === 3) {
      const p1 = prng.int(10, 25);
      const p2 = prng.int(10, 25);
      const diffSq = (p1 + p2) * (p1 - p2 > 0 ? p1 - p2 : 1);
      questionText = `Evaluate the difference between the sum and difference product:\n\n$$(${p1} + ${p2}) \\times (${Math.max(p1, p2)} - ${Math.min(p1, p2)})$$`;
      const ansVal = (p1 + p2) * Math.abs(p1 - p2);
      correctAnswer = `$${ansVal}$`;
      const dist = generateNumericalDistractors(ansVal, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Terms $${p1}$ and $${p2}$.`;
      required = `Evaluated product of sum and positive difference.`;
      method = `Evaluate each bracket, then multiply.`;
      steps = [
        `Sum: $${p1} + ${p2} = ${p1 + p2}$.`,
        `Difference: $${Math.max(p1, p2)} - ${Math.min(p1, p2)} = ${Math.abs(p1 - p2)}$.`,
        `Product: $${p1 + p2} \\times ${Math.abs(p1 - p2)} = ${ansVal}$.`,
      ];
      conclusion = `The value is $${ansVal}$.`;
      hint = `Evaluate both parentheses first, then multiply their results.`;
    } else {
      const base = prng.int(4, 9);
      const sqVal = base * base;
      const ansVal = sqVal - (a + b);
      questionText = `Compute:\n\n$$${base}^2 - (${a} + ${b})$$`;
      correctAnswer = `$${ansVal}$`;
      const dist = generateNumericalDistractors(ansVal, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $${base}^2 - (${a} + ${b})$.`;
      required = `Net value.`;
      method = `Square $${base}$ ($${sqVal}$), sum $${a} + ${b}$ ($${a + b}$), then subtract.`;
      steps = [
        `Square: $${base}^2 = ${sqVal}$.`,
        `Brackets: $${a} + ${b} = ${a + b}$.`,
        `Subtract: $${sqVal} - ${a + b} = ${ansVal}$.`,
      ];
      conclusion = `The value is $${ansVal}$.`;
      hint = `Find $${base}^2$, add $${a} + ${b}$, and then subtract.`;
    }
  }

  // ==========================================
  // WORLD 2: NUMERICAL MASTERY (Stages 11-20)
  // ==========================================
  else if (stageId === 11 || stageId === 12) {
    // Integers & Negative Numbers: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const x = prng.int(5, 20) * (prng.next() > 0.5 ? 1 : -1);
    const y = prng.int(3, 18) * (prng.next() > 0.5 ? 1 : -1);

    if (subtopicIndex === 0) {
      const ans = x - y;
      questionText = `Evaluate the subtraction of signed integers:\n\n$$(${x}) - (${y})$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng, true, true);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Operation $(${x}) - (${y})$.`;
      required = `Net integer result.`;
      method = `Subtracting a number is equivalent to adding its opposite: $a - (-b) = a + b$.`;
      steps = [
        `Rewrite: $${x} ${y < 0 ? `+ ${Math.abs(y)}` : `- ${y}`}$.`,
        `Calculate: $${ans}$.`,
      ];
      conclusion = `The answer is $${ans}$.`;
      hint = `Remember: subtracting a negative number is equivalent to adding a positive number.`;
    } else if (subtopicIndex === 1) {
      const ans = x + y;
      questionText = `Compute the sum of directed numbers:\n\n$$(${x}) + (${y})$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng, true, true);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $(${x}) + (${y})$.`;
      required = `Sum of directed numbers.`;
      method = `Combine values taking their signs into account.`;
      steps = [`$(${x}) + (${y}) = ${ans}$.`];
      conclusion = `The sum is $${ans}$.`;
      hint = `If signs are the same, add and keep the sign; if different, subtract the smaller magnitude from the larger.`;
    } else if (subtopicIndex === 2) {
      const prod = x * y;
      questionText = `Calculate the product of signed integers:\n\n$$(${x}) \\times (${y})$$`;
      correctAnswer = `$${prod}$`;
      const dist = generateNumericalDistractors(prod, prng, true, true);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Factors $(${x})$ and $(${y})$.`;
      required = `Product.`;
      method = `Sign rules: $(+) \\times (+) = (+)$, $(-) \\times (-) = (+)$, $(+) \\times (-) = (-)$.`;
      steps = [
        `Magnitudes: $|${x}| \\times |${y}| = ${Math.abs(prod)}$.`,
        `Sign: ${x * y >= 0 ? 'same signs result in positive' : 'different signs result in negative'}.`,
        `Result: $${prod}$.`,
      ];
      conclusion = `The product is $${prod}$.`;
      hint = `Multiplying two numbers with the same sign gives a positive; different signs give a negative.`;
    } else if (subtopicIndex === 3) {
      const aVal = prng.int(-15, -2);
      const bVal = prng.int(3, 15);
      const diff = Math.abs(aVal - bVal);
      questionText = `Find the absolute difference (distance on the number line) between $${aVal}$ and $${bVal}$:\n\n$$|(${aVal}) - (${bVal})|$$`;
      correctAnswer = `$${diff}$`;
      const dist = generateNumericalDistractors(diff, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Numbers $${aVal}$ and $${bVal}$.`;
      required = `Distance $|(${aVal}) - (${bVal})|$.`;
      method = `Compute difference inside: $${aVal} - ${bVal} = ${aVal - bVal}$, then apply absolute value.`;
      steps = [
        `Inside: $${aVal} - ${bVal} = ${aVal - bVal}$.`,
        `Absolute value: $|${aVal - bVal}| = ${diff}$.`,
      ];
      conclusion = `The distance is $${diff}$ units.`;
      hint = `Absolute value measures geometric distance, which is always non-negative.`;
    } else {
      const temp1 = prng.int(-10, -1);
      const temp2 = prng.int(5, 20);
      const rise = temp2 - temp1;
      questionText = `At sunrise the temperature in a mountain valley was $${temp1}^\\circ\\text{C}$. By midday, the temperature rose to $${temp2}^\\circ\\text{C}$. What was the temperature increase?`;
      correctAnswer = `$${rise}^\\circ\\text{C}$`;
      const dist = generateNumericalDistractors(rise, prng);
      rawDistractors = dist.map(d => `$${d}^\\circ\\text{C}$`);
      given = `Initial temp $${temp1}^\\circ\\text{C}$, Final temp $${temp2}^\\circ\\text{C}$.`;
      required = `Net temperature change.`;
      method = `$\\Delta T = T_{\\text{final}} - T_{\\text{initial}} = ${temp2} - (${temp1})$.`;
      steps = [
        `$\\Delta T = ${temp2} - (${temp1}) = ${temp2} + ${Math.abs(temp1)} = ${rise}^\\circ\\text{C}$.`,
      ];
      conclusion = `The temperature rose by $${rise}^\\circ\\text{C}$.`;
      hint = `Subtract the starting temperature from the final midday temperature.`;
    }
  } else if (stageId === 13 || stageId === 14) {
    // Fractions & Fraction Operations: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const n1 = prng.int(1, 4);
      const d1 = prng.pick([3, 4, 5]);
      const n2 = prng.int(1, 3);
      const d2 = prng.pick([2, 3, 5]);
      const num = n1 * n2;
      const den = d1 * d2;
      const g = gcd(num, den);
      const simNum = num / g;
      const simDen = den / g;
      questionText = `Multiply and simplify to lowest terms:\n\n$$\\frac{${n1}}{${d1}} \\times \\frac{${n2}}{${d2}}$$`;
      correctAnswer = simDen === 1 ? `$${simNum}$` : `$\\frac{${simNum}}{${simDen}}$`;
      const fracDistractors = new Set<string>();
      const alt1 = `$\\frac{${simNum + 1}}{${simDen}}$`;
      if (alt1 !== correctAnswer) fracDistractors.add(alt1);
      const alt2 = simNum > 1 ? `$\\frac{${simNum - 1}}{${simDen}}$` : `$\\frac{${simNum}}{${simDen + 2}}$`;
      if (alt2 !== correctAnswer) fracDistractors.add(alt2);
      const alt3 = `$\\frac{${n1 + n2}}{${d1 + d2}}$`;
      if (alt3 !== correctAnswer) fracDistractors.add(alt3);
      const alt4 = `$\\frac{1}{${simDen}}$`;
      if (alt4 !== correctAnswer) fracDistractors.add(alt4);
      rawDistractors = Array.from(fracDistractors).slice(0, 3);
      given = `Fractions $\\frac{${n1}}{${d1}}$ and $\\frac{${n2}}{${d2}}$.`;
      required = `Product in simplest form.`;
      method = `Multiply numerators together and denominators together, then divide by $\\gcd$.`;
      steps = [
        `Numerator: $${n1} \\times ${n2} = ${num}$.`,
        `Denominator: $${d1} \\times ${d2} = ${den}$.`,
        `Simplest form: $\\frac{${simNum}}{${simDen}}$.`,
      ];
      conclusion = `The product is ${correctAnswer}.`;
      hint = `Multiply top by top and bottom by bottom!`;
    } else if (subtopicIndex === 1) {
      const d1 = prng.pick([2, 3, 4]);
      const d2 = prng.pick([3, 5].filter(x => x !== d1));
      const n1 = 1;
      const n2 = 1;
      const commDen = d1 * d2;
      const sumNum = n1 * d2 + n2 * d1;
      const g = gcd(sumNum, commDen);
      const simNum = sumNum / g;
      const simDen = commDen / g;
      questionText = `Add the fractions with unlike denominators:\n\n$$\\frac{1}{${d1}} + \\frac{1}{${d2}}$$`;
      correctAnswer = `$\\frac{${simNum}}{${simDen}}$`;
      const distSet = new Set<string>();
      distSet.add(`$\\frac{2}{${d1 + d2}}$`);
      distSet.add(`$\\frac{${simNum + 1}}{${simDen}}$`);
      distSet.add(`$\\frac{1}{${commDen}}$`);
      rawDistractors = Array.from(distSet).filter(x => x !== correctAnswer).slice(0, 3);
      given = `Fractions $\\frac{1}{${d1}}$ and $\\frac{1}{${d2}}$.`;
      required = `Sum in lowest terms.`;
      method = `Find common denominator $${commDen}$, rewrite fractions, and add numerators.`;
      steps = [
        `$\\frac{1}{${d1}} = \\frac{${d2}}{${commDen}}$ and $\\frac{1}{${d2}} = \\frac{${d1}}{${commDen}}$.`,
        `Sum: $\\frac{${d2} + ${d1}}{${commDen}} = \\frac{${sumNum}}{${commDen}}$.`,
        `Simplest form: $\\frac{${simNum}}{${simDen}}$.`,
      ];
      conclusion = `The sum is $\\frac{${simNum}}{${simDen}}$.`;
      hint = `Do not add the denominators! Find a common denominator first.`;
    } else if (subtopicIndex === 2) {
      const d = prng.pick([3, 4, 5]);
      const n1 = prng.int(2, d - 1);
      const n2 = 1;
      const diffNum = n1 - n2;
      questionText = `Evaluate the fraction subtraction:\n\n$$\\frac{${n1}}{${d}} - \\frac{${n2}}{${d}}$$`;
      correctAnswer = `$\\frac{${diffNum}}{${d}}$`;
      rawDistractors = [
        `$\\frac{${n1 + n2}}{${d}}$`,
        `$\\frac{${diffNum}}{${d * 2}}$`,
        `$\\frac{1}{${d}}$`,
      ].filter(x => x !== correctAnswer);
      while (rawDistractors.length < 3) rawDistractors.push(`$\\frac{${diffNum + 2}}{${d}}$`);
      given = `Fractions $\\frac{${n1}}{${d}}$ and $\\frac{${n2}}{${d}}$.`;
      required = `Difference.`;
      method = `Denominators are already identical: subtract numerators directly.`;
      steps = [`$\\frac{${n1} - ${n2}}{${d}} = \\frac{${diffNum}}{${d}}$.`];
      conclusion = `The difference is $\\frac{${diffNum}}{${d}}$.`;
      hint = `Keep the same denominator and subtract the top numbers.`;
    } else if (subtopicIndex === 3) {
      const a = prng.int(1, 3);
      const b = prng.pick([2, 3, 5]);
      const c = 1;
      const d = prng.pick([2, 4]);
      const num = a * d;
      const den = b * c;
      const g = gcd(num, den);
      const simNum = num / g;
      const simDen = den / g;
      questionText = `Divide fractions by multiplying by the reciprocal:\n\n$$\\frac{${a}}{${b}} \\div \\frac{${c}}{${d}}$$`;
      correctAnswer = simDen === 1 ? `$${simNum}$` : `$\\frac{${simNum}}{${simDen}}$`;
      rawDistractors = [
        `$\\frac{${a * c}}{${b * d}}$`,
        `$\\frac{${simNum + 1}}{${simDen}}$`,
        `$\\frac{${simDen}}{${simNum}}$`,
      ].filter(x => x !== correctAnswer);
      while (rawDistractors.length < 3) rawDistractors.push(`$\\frac{1}{${simDen}}$`);
      given = `Division $\\frac{${a}}{${b}} \\div \\frac{${c}}{${d}}$.`;
      required = `Quotient in simplest terms.`;
      method = `Invert the divisor and multiply: $\\frac{${a}}{${b}} \\times \\frac{${d}}{${c}}$.`;
      steps = [
        `Reciprocal of divisor: $\\frac{${d}}{${c}}$.`,
        `Multiply: $\\frac{${a} \\times ${d}}{${b} \\times ${c}} = \\frac{${num}}{${den}}$.`,
        `Lowest terms: ${correctAnswer}.`,
      ];
      conclusion = `The quotient is ${correctAnswer}.`;
      hint = `Keep the first fraction, flip the second fraction, and multiply!`;
    } else {
      const k = prng.pick([2, 3, 4]);
      const a = prng.int(1, 4);
      const b = prng.pick([5, 7, 9]);
      const top = a * k;
      const bot = b * k;
      questionText = `Reduce the fraction to lowest terms (simplest form):\n\n$$\\frac{${top}}{${bot}}$$`;
      correctAnswer = `$\\frac{${a}}{${b}}$`;
      rawDistractors = [
        `$\\frac{${a + 1}}{${b}}$`,
        `$\\frac{${top / 2}}{${bot / 2}}$`,
        `$\\frac{${a}}{${b + 1}}$`,
      ].filter(x => x !== correctAnswer);
      while (rawDistractors.length < 3) rawDistractors.push(`$\\frac{1}{${b}}$`);
      given = `Fraction $\\frac{${top}}{${bot}}$.`;
      required = `Simplified lowest terms.`;
      method = `Divide both numerator and denominator by their greatest common factor $\\gcd(${top}, ${bot}) = ${k}$.`;
      steps = [
        `$\\gcd(${top}, ${bot}) = ${k}$.`,
        `$\\frac{${top} \\div ${k}}{${bot} \\div ${k}} = \\frac{${a}}{${b}}$.`,
      ];
      conclusion = `The fraction in simplest form is $\\frac{${a}}{${b}}$.`;
      hint = `Find the highest common factor of both numbers and divide numerator and denominator by it.`;
    }
  } else if (stageId === 15 || stageId === 16) {
    // Decimals & Decimal Operations: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const a = prng.int(12, 75) / 10;
      const b = prng.int(15, 60) / 10;
      const sum = parseFloat((a + b).toFixed(1));
      questionText = `Compute the decimal sum:\n\n$$${a.toFixed(1)} + ${b.toFixed(1)}$$`;
      correctAnswer = `$${sum.toFixed(1)}$`;
      const deltas = [0.1, -0.1, 0.2, -0.2, 1.0, -1.0, 0.5];
      const decDistractors = new Set<string>();
      for (const d of prng.shuffle(deltas)) {
        const cand = parseFloat((sum + d).toFixed(1));
        if (cand > 0 && cand !== sum) decDistractors.add(`$${cand.toFixed(1)}$`);
        if (decDistractors.size >= 3) break;
      }
      rawDistractors = Array.from(decDistractors);
      given = `Decimals $${a.toFixed(1)}$ and $${b.toFixed(1)}$.`;
      required = `Sum.`;
      method = `Align decimal points vertically and add column by column.`;
      steps = [`$${a.toFixed(1)} + ${b.toFixed(1)} = ${sum.toFixed(1)}$.`];
      conclusion = `The sum is $${sum.toFixed(1)}$.`;
      hint = `Keep decimal points aligned vertically.`;
    } else if (subtopicIndex === 1) {
      const a = prng.int(45, 95) / 10;
      const b = prng.int(12, 38) / 10;
      const diff = parseFloat((a - b).toFixed(1));
      questionText = `Evaluate the decimal subtraction:\n\n$$${a.toFixed(1)} - ${b.toFixed(1)}$$`;
      correctAnswer = `$${diff.toFixed(1)}$`;
      const deltas = [0.1, -0.1, 0.2, -0.2, 1.0, -1.0];
      const decDistractors = new Set<string>();
      for (const d of prng.shuffle(deltas)) {
        const cand = parseFloat((diff + d).toFixed(1));
        if (cand > 0 && cand !== diff) decDistractors.add(`$${cand.toFixed(1)}$`);
        if (decDistractors.size >= 3) break;
      }
      rawDistractors = Array.from(decDistractors);
      given = `Decimals $${a.toFixed(1)}$ and $${b.toFixed(1)}$.`;
      required = `Difference.`;
      method = `Align decimal points and subtract tenths then units.`;
      steps = [`$${a.toFixed(1)} - ${b.toFixed(1)} = ${diff.toFixed(1)}$.`];
      conclusion = `The difference is $${diff.toFixed(1)}$.`;
      hint = `Line up the decimal points and borrow if necessary.`;
    } else if (subtopicIndex === 2) {
      const a = prng.int(2, 8);
      const b = prng.pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.2]);
      const prod = parseFloat((a * b).toFixed(2));
      questionText = `Calculate the decimal product:\n\n$$${a} \\times ${b}$$`;
      correctAnswer = `$${prod}$`;
      const dist = generateNumericalDistractors(prod, prng, false, false, 0.2);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Factors $${a}$ and $${b}$.`;
      required = `Product.`;
      method = `Multiply as integers, then position the decimal point.`;
      steps = [`$${a} \\times ${b} = ${prod}$.`];
      conclusion = `The product is $${prod}$.`;
      hint = `Multiply the whole numbers and count the decimal places.`;
    } else if (subtopicIndex === 3) {
      const fracPair = prng.pick([
        { frac: '\\frac{1}{4}', dec: '0.25', wrong: ['0.4', '0.2', '0.5'] },
        { frac: '\\frac{1}{2}', dec: '0.5', wrong: ['0.2', '0.05', '0.25'] },
        { frac: '\\frac{3}{4}', dec: '0.75', wrong: ['0.34', '0.7', '0.65'] },
        { frac: '\\frac{1}{5}', dec: '0.2', wrong: ['0.5', '0.15', '0.02'] },
        { frac: '\\frac{2}{5}', dec: '0.4', wrong: ['0.25', '0.2', '0.45'] },
      ]);
      questionText = `Convert the fraction $${fracPair.frac}$ to its standard decimal equivalent:`;
      correctAnswer = `$${fracPair.dec}$`;
      rawDistractors = fracPair.wrong.map(w => `$${w}$`);
      given = `Fraction $${fracPair.frac}$.`;
      required = `Decimal representation.`;
      method = `Divide the numerator by the denominator.`;
      steps = [`Divide numerator by denominator to obtain $${fracPair.dec}$.`];
      conclusion = `$${fracPair.frac} = ${fracPair.dec}$.`;
      hint = `Divide the top number by the bottom number.`;
    } else {
      const val = (prng.int(105, 995) / 100);
      const rounded = val.toFixed(1);
      questionText = `Round the decimal $${val.toFixed(2)}$ to one decimal place (nearest tenth):`;
      correctAnswer = `$${rounded}$`;
      const distSet = new Set<string>();
      distSet.add(`$${(parseFloat(rounded) + 0.1).toFixed(1)}$`);
      distSet.add(`$${(parseFloat(rounded) - 0.1).toFixed(1)}$`);
      distSet.add(`$${Math.round(val)}$`);
      rawDistractors = Array.from(distSet).filter(x => x !== correctAnswer).slice(0, 3);
      given = `Decimal $${val.toFixed(2)}$.`;
      required = `Rounded to nearest tenth.`;
      method = `Look at the hundredths digit: if $\\ge 5$, round up; if $< 5$, keep unchanged.`;
      steps = [`Rounding $${val.toFixed(2)}$ to one decimal place yields $${rounded}$.`];
      conclusion = `The rounded value is $${rounded}$.`;
      hint = `Check the second decimal digit: if 5 or more, round up!`;
    }
  } else if (stageId === 17) {
    // Percentages: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const pct = prng.pick([10, 15, 20, 25, 30, 40, 50, 75]);
      const total = prng.int(4, 20) * 10;
      const ans = (pct / 100) * total;
      questionText = `Find $${pct}\\%$ of $${total}$.`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Percentage $${pct}\\%$ of base quantity $${total}$.`;
      required = `Resulting value.`;
      method = `$\\frac{${pct}}{100} \\times ${total} = ${ans}$.`;
      steps = [`$\\frac{${pct}}{100} \\times ${total} = ${ans}$.`];
      conclusion = `$${pct}\\%$ of $${total}$ is $${ans}$.`;
      hint = `Multiply the quantity by the percentage and divide by 100.`;
    } else if (subtopicIndex === 1) {
      const pct = prng.pick([10, 20, 25, 50]);
      const initial = prng.pick([40, 60, 80, 100, 120]);
      const increaseAmt = (pct / 100) * initial;
      const finalAmt = initial + increaseAmt;
      questionText = `Increase the quantity $${initial}$ by $${pct}\\%$:`;
      correctAnswer = `$${finalAmt}$`;
      const dist = generateNumericalDistractors(finalAmt, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Original $${initial}$, percentage increase $${pct}\\%$.`;
      required = `Increased quantity.`;
      method = `Compute increase amount: $\\frac{${pct}}{100} \\times ${initial} = ${increaseAmt}$, then add to $${initial}$.`;
      steps = [
        `Increase: $\\frac{${pct}}{100} \\times ${initial} = ${increaseAmt}$.`,
        `New amount: $${initial} + ${increaseAmt} = ${finalAmt}$.`,
      ];
      conclusion = `The new value is $${finalAmt}$.`;
      hint = `Calculate the percentage value and add it to the original amount.`;
    } else if (subtopicIndex === 2) {
      const pct = prng.pick([10, 20, 25, 30]);
      const initial = prng.pick([50, 60, 80, 100, 120]);
      const decreaseAmt = (pct / 100) * initial;
      const finalAmt = initial - decreaseAmt;
      questionText = `Decrease the quantity $${initial}$ by $${pct}\\%$:`;
      correctAnswer = `$${finalAmt}$`;
      const dist = generateNumericalDistractors(finalAmt, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Original $${initial}$, percentage decrease $${pct}\\%$.`;
      required = `Reduced quantity.`;
      method = `Compute decrease amount and deduct from original: $${initial} - ${decreaseAmt} = ${finalAmt}$.`;
      steps = [
        `Decrease: $\\frac{${pct}}{100} \\times ${initial} = ${decreaseAmt}$.`,
        `New amount: $${initial} - ${decreaseAmt} = ${finalAmt}$.`,
      ];
      conclusion = `The reduced value is $${finalAmt}$.`;
      hint = `Calculate the discount/decrease amount and subtract it from the initial value.`;
    } else if (subtopicIndex === 3) {
      const whole = prng.pick([20, 25, 50, 100, 200]);
      const part = prng.pick([5, 10, 15, 25]);
      const pct = (part / whole) * 100;
      questionText = `Express $${part}$ as a percentage of $${whole}$:`;
      correctAnswer = `$${pct}\\%$`;
      const dist = generateNumericalDistractors(pct, prng);
      rawDistractors = dist.map(d => `$${d}\\%$`);
      given = `Part $${part}$, Whole $${whole}$.`;
      required = `Percentage representation.`;
      method = `$\\text{Percentage} = \\frac{\\text{Part}}{\\text{Whole}} \\times 100\\% = \\frac{${part}}{${whole}} \\times 100\\%$.`;
      steps = [
        `Fraction: $\\frac{${part}}{${whole}}$.`,
        `Multiply by 100: $\\frac{${part}}{${whole}} \\times 100 = ${pct}\\%$.`,
      ];
      conclusion = `$${part}$ is $${pct}\\%$ of $${whole}$.`;
      hint = `Divide the part by the whole and multiply by 100.`;
    } else {
      const items = prng.pick([
        { frac: '\\frac{1}{2}', pct: '50\\%' },
        { frac: '\\frac{1}{4}', pct: '25\\%' },
        { frac: '\\frac{3}{4}', pct: '75\\%' },
        { frac: '\\frac{1}{5}', pct: '20\\%' },
        { frac: '\\frac{1}{10}', pct: '10\\%' },
      ]);
      questionText = `What is the standard percentage equivalent of the fraction $${items.frac}$?`;
      correctAnswer = `$${items.pct}$`;
      rawDistractors = [`$${parseInt(items.pct, 10) + 10}\\%$`, `$${Math.max(5, parseInt(items.pct, 10) - 10)}\\%$`, `$${parseInt(items.pct, 10) + 5}\\%$`];
      given = `Fraction $${items.frac}$.`;
      required = `Percentage form.`;
      method = `Multiply the fraction by $100\\%$.`;
      steps = [`$${items.frac} \\times 100\\% = ${items.pct}$.`];
      conclusion = `$${items.frac} = ${items.pct}$.`;
      hint = `Multiply the fraction by 100 to find the percentage.`;
    }
  } else if (stageId === 18 || stageId === 19) {
    // Ratios & Proportions: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const r1 = prng.int(2, 5);
      const r2 = prng.int(3, 7);
      const multiplier = prng.int(3, 10);
      const totalParts = r1 + r2;
      const totalAmt = totalParts * multiplier;
      const share1 = r1 * multiplier;
      const smaller = Math.min(share1, r2 * multiplier);
      questionText = `Divide $\\text{\\$} ${totalAmt}$ in the ratio $${r1} : ${r2}$. What is the value of the smaller share?`;
      correctAnswer = `$\\text{\\$} ${smaller}$`;
      const dist = generateNumericalDistractors(smaller, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `Total $\\text{\\$} ${totalAmt}$, ratio $${r1} : ${r2}$.`;
      required = `Smaller share.`;
      method = `Total parts: $${r1} + ${r2} = ${totalParts}$, 1 part $= \\frac{${totalAmt}}{${totalParts}} = ${multiplier}$, smaller share $= ${Math.min(r1, r2)} \\times ${multiplier}$.`;
      steps = [
        `Total parts: $${r1} + ${r2} = ${totalParts}$.`,
        `Value per part: $\\frac{${totalAmt}}{${totalParts}} = ${multiplier}$.`,
        `Smaller share: $${Math.min(r1, r2)} \\times ${multiplier} = ${smaller}$.`,
      ];
      conclusion = `The smaller share is $\\text{\\$} ${smaller}$.`;
      hint = `Sum the parts of the ratio first, then find the value of one part.`;
    } else if (subtopicIndex === 1) {
      const g = prng.pick([2, 3, 4, 5]);
      const s1 = prng.int(2, 5);
      const s2 = prng.int(3, 7);
      const r1 = s1 * g;
      const r2 = s2 * g;
      questionText = `Simplify the ratio to simplest integer form:\n\n$$${r1} : ${r2}$$`;
      correctAnswer = `$${s1} : ${s2}$`;
      rawDistractors = [
        `$${s1 + 1} : ${s2}$`,
        `$${s1} : ${s2 + 1}$`,
        `$${s2} : ${s1}$`,
      ];
      given = `Ratio $${r1} : ${r2}$.`;
      required = `Simplest form.`;
      method = `Divide both parts of the ratio by $\\gcd(${r1}, ${r2}) = ${g}$.`;
      steps = [
        `$\\gcd(${r1}, ${r2}) = ${g}$.`,
        `Divide both sides by $${g}$: $\\frac{${r1}}{${g}} : \\frac{${r2}}{${g}} = ${s1} : ${s2}$.`,
      ];
      conclusion = `The simplified ratio is $${s1} : ${s2}$.`;
      hint = `Divide both numbers in the ratio by their greatest common factor.`;
    } else if (subtopicIndex === 2) {
      const rate = prng.int(3, 8);
      const count = prng.int(4, 9);
      const totalCost = rate * count;
      questionText = `If $${count}$ notebooks cost $\\text{\\$} ${totalCost}$ in total, what is the unit price per notebook?`;
      correctAnswer = `$\\text{\\$} ${rate}$`;
      const dist = generateNumericalDistractors(rate, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `$${count}$ notebooks cost $\\text{\\$} ${totalCost}$.`;
      required = `Unit price.`;
      method = `$\\text{Unit Price} = \\frac{\\text{Total Cost}}{\\text{Quantity}} = \\frac{${totalCost}}{${count}} = ${rate}$.`;
      steps = [`$\\frac{${totalCost}}{${count}} = ${rate}$.`];
      conclusion = `Each notebook costs $\\text{\\$} ${rate}$.`;
      hint = `Divide the total cost by the number of notebooks.`;
    } else if (subtopicIndex === 3) {
      const a = prng.int(2, 6);
      const b = prng.int(3, 8);
      const k = prng.int(2, 5);
      const c = a * k;
      const d = b * k;
      questionText = `Solve for $x$ in the proportional equation:\n\n$$\\frac{x}{${b}} = \\frac{${c}}{${d}}$$`;
      correctAnswer = `$x = ${a}$`;
      rawDistractors = [`$x = ${a + 1}$`, `$x = ${a - 1}$`, `$x = ${c}$`];
      given = `Proportion $\\frac{x}{${b}} = \\frac{${c}}{${d}}$.`;
      required = `Value of unknown $x$.`;
      method = `Cross multiply or scale: $x = \\frac{${c} \\times ${b}}{${d}} = ${a}$.`;
      steps = [`$x = \\frac{${c} \\times ${b}}{${d}} = ${a}$.`];
      conclusion = `$x = ${a}$.`;
      hint = `Cross-multiply or find the scale factor between denominators.`;
    } else {
      const w1 = prng.pick([2, 3, 4, 5]);
      const d1 = prng.pick([6, 8, 10, 12]);
      const totalWork = w1 * d1;
      const validW2 = [2, 3, 4, 6, 8].filter(w => w !== w1 && totalWork % w === 0);
      const w2 = validW2.length > 0 ? prng.pick(validW2) : w1 * 2;
      const d2 = totalWork / w2;
      questionText = `If $${w1}$ workers take $${d1}$ days to complete a painting project, how many days will $${w2}$ workers take at the same constant work rate? (Inverse Proportion)`;
      correctAnswer = `$${d2}\\text{ days}$`;
      rawDistractors = [`$${d1}\\text{ days}$`, `$${d2 + 2}\\text{ days}$`, `$${Math.max(1, d2 - 1)}\\text{ days}$`];
      given = `$${w1}$ workers $\\to$ $${d1}$ days.`;
      required = `Days for $${w2}$ workers.`;
      method = `In inverse proportion, product of workers and days is constant: $W_1 \\times D_1 = W_2 \\times D_2$.`;
      steps = [
        `Constant work $= ${w1} \\times ${d1} = ${totalWork}\\text{ worker-days}$.`,
        `Time for ${w2} workers $= \\frac{${totalWork}}{${w2}} = ${d2}\\text{ days}$.`,
      ];
      conclusion = `${w2} workers take $${d2}\\text{ days}$.`;
      hint = `More workers means less time: multiply workers by days to find total work, then divide by the new worker count.`;
    }
  } else if (stageId === 20) {
    // Numerical Mastery Challenge: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const pct = prng.pick([20, 25, 50]);
      const amt = prng.int(40, 160);
      const inc = amt * (1 + pct / 100);
      questionText = `An item priced at $\\text{\\$} ${amt}$ is increased by $${pct}\\%$. What is the new price?`;
      correctAnswer = `$\\text{\\$} ${inc}$`;
      const dist = generateNumericalDistractors(inc, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `Original price $\\text{\\$} ${amt}$, percentage increase $${pct}\\%$.`;
      required = `Final price after increase.`;
      method = `Multiplier method: $\\text{New Price} = \\text{Original} \\times (1 + \\frac{${pct}}{100})$.`;
      steps = [
        `Increase amount: $\\frac{${pct}}{100} \\times ${amt} = ${amt * (pct / 100)}$.`,
        `New price: $${amt} + ${amt * (pct / 100)} = ${inc}$.`,
      ];
      conclusion = `The new price is $\\text{\\$} ${inc}$.`;
      hint = `Add the dollar increase to the original price.`;
    } else if (subtopicIndex === 1) {
      const a = prng.int(2, 6);
      const b = 0.5;
      const c = prng.int(1, 4);
      const ans = a * b + c;
      questionText = `Evaluate the combined fraction and decimal expression:\n\n$$${a} \\times \\frac{1}{2} + ${c}$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $${a} \\times \\frac{1}{2} + ${c}$.`;
      required = `Evaluated numerical value.`;
      method = `Multiply first: $${a} \\times \\frac{1}{2} = ${a / 2}$, then add $${c}$.`;
      steps = [
        `$${a} \\times \\frac{1}{2} = ${a / 2}$.`,
        `$${a / 2} + ${c} = ${ans}$.`,
      ];
      conclusion = `The value is $${ans}$.`;
      hint = `Multiply $${a}$ by $\\frac{1}{2}$ first, then add $${c}$.`;
    } else if (subtopicIndex === 2) {
      const x = prng.int(-10, -2);
      const y = prng.int(3, 8);
      const ans = Math.abs(x) + y;
      questionText = `Evaluate the expression involving absolute value:\n\n$$|${x}| + ${y}$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $|${x}| + ${y}$.`;
      required = `Resulting sum.`;
      method = `Absolute value $|${x}| = ${Math.abs(x)}$, then sum with $${y}$.`;
      steps = [
        `$|${x}| = ${Math.abs(x)}$.`,
        `$${Math.abs(x)} + ${y} = ${ans}$.`,
      ];
      conclusion = `The value is $${ans}$.`;
      hint = `The absolute value of a negative number becomes positive.`;
    } else if (subtopicIndex === 3) {
      const cp = prng.pick([50, 80, 100, 120, 200, 250]);
      const pctProfit = prng.pick([10, 15, 20, 25, 30, 40, 50]);
      const profit = (cp * pctProfit) / 100;
      const sp = cp + profit;
      questionText = `A watch bought for $\\text{\\$} ${cp}$ is sold for $\\text{\\$} ${sp}$. What is the percentage profit?`;
      correctAnswer = `$${pctProfit}\\%$`;
      rawDistractors = [`$${pctProfit + 5}\\%$`, `$${Math.max(5, pctProfit - 5)}\\%$`, `$${pctProfit * 2}\\%$`];
      given = `Cost price $\\text{\\$} ${cp}$, Selling price $\\text{\\$} ${sp}$.`;
      required = `Percentage profit.`;
      method = `$\\text{Profit}\\% = \\frac{\\text{Profit}}{\\text{Cost Price}} \\times 100\\% = \\frac{${profit}}{${cp}} \\times 100\\% = ${pctProfit}\\%$.`;
      steps = [`$\\frac{${sp} - ${cp}}{${cp}} \\times 100\\% = ${pctProfit}\\%$.`];
      conclusion = `The profit is $${pctProfit}\\%$.`;
      hint = `Find the dollar profit and divide by the cost price, then multiply by 100.`;
    } else {
      const setVariants = [
        { items: ['\\frac{1}{2}', '0.6', '45\\%', '\\frac{3}{5}'], best: '0.6', desc: '0.6 = \\frac{3}{5} = 0.60 > 0.50, 0.45' },
        { items: ['\\frac{3}{4}', '0.70', '80\\%', '\\frac{7}{10}'], best: '80\\%', desc: '80\\% = 0.80 > 0.75, 0.70' },
        { items: ['\\frac{2}{5}', '0.35', '50\\%', '\\frac{1}{4}'], best: '50\\%', desc: '50\\% = 0.50 > 0.40, 0.35, 0.25' },
        { items: ['\\frac{4}{5}', '0.85', '75\\%', '\\frac{7}{8}'], best: '\\frac{7}{8}', desc: '\\frac{7}{8} = 0.875 > 0.85, 0.80, 0.75' },
        { items: ['\\frac{1}{3}', '0.30', '35\\%', '\\frac{1}{4}'], best: '35\\%', desc: '35\\% = 0.35 > 0.333, 0.30, 0.25' },
      ];
      const sv = prng.pick(setVariants);
      questionText = `Which of the following numbers is the greatest in value?\n\n$$${sv.items.join(', \\quad ')}$$`;
      correctAnswer = `$${sv.best}$`;
      rawDistractors = sv.items.filter(x => x !== sv.best).map(x => `$${x}$`);
      given = `Numbers: ${sv.items.join(', ')}.`;
      required = `Greatest single value.`;
      method = `Convert all numbers to standard decimal form to compare magnitudes.`;
      steps = [`Decimals comparison: ${sv.desc}.`];
      conclusion = `$${sv.best}$ is the greatest.`;
      hint = `Convert all fractions and percentages into decimals to easily compare them.`;
    }
  }

  // ==========================================
  // WORLD 3: APPLIED MATHEMATICS (Stages 21-30)
  // ==========================================
  else if (stageId === 21 || stageId === 22) {
    // Profit & Loss: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const cp = prng.pick([40, 50, 60, 80, 100, 120, 150, 180, 200, 250]);

    if (subtopicIndex === 0) {
      const profitPct = prng.pick([10, 20, 25, 30, 50]);
      const profitAmt = (cp * profitPct) / 100;
      const sp = cp + profitAmt;
      questionText = `A retailer purchases merchandise for $\\text{\\$} ${cp}$ and sells it at a $${profitPct}\\%$ profit. What is the selling price?`;
      correctAnswer = `$\\text{\\$} ${sp}$`;
      const dist = generateNumericalDistractors(sp, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `Cost price $CP = \\text{\\$} ${cp}$, Profit $= ${profitPct}\\%$.`;
      required = `Selling price $SP$.`;
      method = `$SP = CP \\times (1 + \\frac{\\text{Profit}\\%}{100})$.`;
      steps = [
        `Profit amount: $\\frac{${profitPct}}{100} \\times ${cp} = \\text{\\$} ${profitAmt}$.`,
        `Selling price: $${cp} + ${profitAmt} = \\text{\\$} ${sp}$.`,
      ];
      conclusion = `The selling price is $\\text{\\$} ${sp}$.`;
      hint = `Add the profit percentage amount to the original cost price.`;
    } else if (subtopicIndex === 1) {
      const lossPct = prng.pick([10, 20, 25]);
      const lossAmt = (cp * lossPct) / 100;
      const sp = cp - lossAmt;
      questionText = `An item bought for $\\text{\\$} ${cp}$ is sold at a loss of $${lossPct}\\%$. What is the final selling price?`;
      correctAnswer = `$\\text{\\$} ${sp}$`;
      const dist = generateNumericalDistractors(sp, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `Cost price $CP = \\text{\\$} ${cp}$, Loss $= ${lossPct}\\%$.`;
      required = `Selling price $SP$.`;
      method = `$SP = CP \\times (1 - \\frac{\\text{Loss}\\%}{100})$.`;
      steps = [
        `Loss amount: $\\frac{${lossPct}}{100} \\times ${cp} = \\text{\\$} ${lossAmt}$.`,
        `Selling price: $${cp} - ${lossAmt} = \\text{\\$} ${sp}$.`,
      ];
      conclusion = `The selling price is $\\text{\\$} ${sp}$.`;
      hint = `Calculate the loss amount and subtract it from the cost price.`;
    } else if (subtopicIndex === 2) {
      const profitPct = prng.pick([15, 20, 25, 40, 50]);
      const profitAmt = (cp * profitPct) / 100;
      const sp = cp + profitAmt;
      questionText = `An item with a cost price of $\\text{\\$} ${cp}$ is sold for $\\text{\\$} ${sp}$. What percentage profit was made?`;
      correctAnswer = `$${profitPct}\\%$`;
      const dist = generateNumericalDistractors(profitPct, prng);
      rawDistractors = dist.map(d => `$${d}\\%$`);
      given = `Cost price $CP = \\text{\\$} ${cp}$, Selling price $SP = \\text{\\$} ${sp}$.`;
      required = `Percentage profit.`;
      method = `$\\text{Profit}\\% = \\frac{SP - CP}{CP} \\times 100\\% = \\frac{${profitAmt}}{${cp}} \\times 100\\%$.`;
      steps = [
        `Dollar profit: $${sp} - ${cp} = \\text{\\$} ${profitAmt}$.`,
        `Percentage: $\\frac{${profitAmt}}{${cp}} \\times 100\\% = ${profitPct}\\%$.`,
      ];
      conclusion = `The profit is $${profitPct}\\%$.`;
      hint = `Divide the dollar gain by the original cost price and multiply by 100.`;
    } else if (subtopicIndex === 3) {
      const profitPct = 25;
      const cost = prng.pick([40, 80, 120, 160]);
      const sp = cost * 1.25;
      questionText = `A trader sells a bicycle for $\\text{\\$} ${sp}$, making a $25\\%$ profit on the purchase price. What was the original cost price?`;
      correctAnswer = `$\\text{\\$} ${cost}$`;
      const dist = generateNumericalDistractors(cost, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `Selling price $\\text{\\$} ${sp}$, Profit margin $= 25\\%$.`;
      required = `Cost price $CP$.`;
      method = `$CP = \\frac{SP}{1 + 0.25} = \\frac{${sp}}{1.25}$.`;
      steps = [`$CP = \\frac{${sp}}{1.25} = \\text{\\$} ${cost}$.`];
      conclusion = `The cost price was $\\text{\\$} ${cost}$.`;
      hint = `Divide the selling price by 1.25.`;
    } else {
      const count = prng.int(5, 12);
      const unitCost = prng.pick([8, 12, 15, 20]);
      const totalCost = count * unitCost;
      const totalRevenue = count * (unitCost + 5);
      const grossProfit = totalRevenue - totalCost;
      questionText = `A merchant buys $${count}$ jackets for $\\text{\\$} ${unitCost}$ each and sells all of them for a total revenue of $\\text{\\$} ${totalRevenue}$. What total gross profit was earned?`;
      correctAnswer = `$\\text{\\$} ${grossProfit}$`;
      const dist = generateNumericalDistractors(grossProfit, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `$${count}$ units at $\\text{\\$} ${unitCost}$ cost, total revenue $\\text{\\$} ${totalRevenue}$.`;
      required = `Gross profit.`;
      method = `$\\text{Profit} = \\text{Total Revenue} - \\text{Total Cost} = ${totalRevenue} - (${count} \\times ${unitCost})$.`;
      steps = [
        `Total cost: $${count} \\times ${unitCost} = \\text{\\$} ${totalCost}$.`,
        `Gross profit: $${totalRevenue} - ${totalCost} = \\text{\\$} ${grossProfit}$.`,
      ];
      conclusion = `The gross profit was $\\text{\\$} ${grossProfit}$.`;
      hint = `Subtract total cost from total sales revenue.`;
    }
  } else if (stageId === 23) {
    // Discounts & Markups: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const marked = prng.pick([50, 60, 80, 100, 120, 150, 200, 240]);

    if (subtopicIndex === 0) {
      const discPct = prng.pick([10, 20, 25, 30, 50]);
      const disc = (discPct / 100) * marked;
      const salePrice = marked - disc;
      questionText = `An item marked at $\\text{\\$} ${marked}$ has a discount of $${discPct}\\%$. Find the sale price:`;
      correctAnswer = `$\\text{\\$} ${salePrice}$`;
      const dist = generateNumericalDistractors(salePrice, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `Marked price $\\text{\\$} ${marked}$, discount $${discPct}\\%$.`;
      required = `Sale price.`;
      method = `$\\text{Sale Price} = ${marked} \\times (1 - \\frac{${discPct}}{100})$.`;
      steps = [
        `Discount: $\\frac{${discPct}}{100} \\times ${marked} = \\text{\\$} ${disc}$.`,
        `Sale price: $${marked} - ${disc} = \\text{\\$} ${salePrice}$.`,
      ];
      conclusion = `The sale price is $\\text{\\$} ${salePrice}$.`;
      hint = `Subtract the discount amount from the marked price.`;
    } else if (subtopicIndex === 1) {
      const discPct = prng.pick([10, 15, 20, 25]);
      const disc = (discPct / 100) * marked;
      questionText = `A store offers a $${discPct}\\%$ discount on an electronic gadget with a marked price of $\\text{\\$} ${marked}$. How much money does the customer save?`;
      correctAnswer = `$\\text{\\$} ${disc}$`;
      const dist = generateNumericalDistractors(disc, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `Marked price $\\text{\\$} ${marked}$, discount $${discPct}\\%$.`;
      required = `Discount savings amount.`;
      method = `Savings $= \\frac{${discPct}}{100} \\times ${marked} = \\text{\\$} ${disc}$.`;
      steps = [`$\\frac{${discPct}}{100} \\times ${marked} = \\text{\\$} ${disc}$.`];
      conclusion = `The customer saves $\\text{\\$} ${disc}$.`;
      hint = `Find the discount percentage of the marked price.`;
    } else if (subtopicIndex === 2) {
      const markupPct = prng.pick([20, 25, 30, 50]);
      const cost = prng.pick([40, 60, 80, 100]);
      const markup = (markupPct / 100) * cost;
      const retail = cost + markup;
      questionText = `A boutique purchases handbags for $\\text{\\$} ${cost}$ wholesale and marks them up by $${markupPct}\\%$ for retail. What is the retail price?`;
      correctAnswer = `$\\text{\\$} ${retail}$`;
      const dist = generateNumericalDistractors(retail, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `Wholesale cost $\\text{\\$} ${cost}$, markup $${markupPct}\\%$.`;
      required = `Retail price.`;
      method = `$\\text{Retail} = ${cost} \\times (1 + \\frac{${markupPct}}{100}) = \\text{\\$} ${retail}$.`;
      steps = [`$${cost} + (${cost} \\times \\frac{${markupPct}}{100}) = \\text{\\$} ${retail}$.`];
      conclusion = `The retail price is $\\text{\\$} ${retail}$.`;
      hint = `Add the markup amount to the wholesale cost.`;
    } else if (subtopicIndex === 3) {
      const taxRate = prng.pick([5, 8, 10]);
      const base = prng.pick([50, 100, 150, 200]);
      const taxAmt = (taxRate / 100) * base;
      const total = base + taxAmt;
      questionText = `If sales tax is $${taxRate}\\%$ on a purchase of $\\text{\\$} ${base}$, what is the total amount payable including tax?`;
      correctAnswer = `$\\text{\\$} ${total}$`;
      const dist = generateNumericalDistractors(total, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `Subtotal $\\text{\\$} ${base}$, sales tax $${taxRate}\\%$.`;
      required = `Total with tax.`;
      method = `$\\text{Total} = ${base} + (${base} \\times \\frac{${taxRate}}{100})$.`;
      steps = [
        `Tax: $\\frac{${taxRate}}{100} \\times ${base} = \\text{\\$} ${taxAmt}$.`,
        `Total: $${base} + ${taxAmt} = \\text{\\$} ${total}$.`,
      ];
      conclusion = `Total payable is $\\text{\\$} ${total}$.`;
      hint = `Compute the sales tax and add it to the subtotal.`;
    } else {
      const disc = prng.pick([10, 15, 20, 25, 30, 40, 50]);
      const original = prng.pick([50, 80, 100, 120, 150, 200]);
      const sale = original * (1 - disc / 100);
      questionText = `An item originally priced at $\\text{\\$} ${original}$ is reduced to $\\text{\\$} ${sale}$ during a clearance sale. What is the discount percentage?`;
      correctAnswer = `$${disc}\\%$`;
      rawDistractors = [`$${disc + 5}\\%$`, `$${Math.max(5, disc - 5)}\\%$`, `$${disc * 2}\\%$`];
      given = `Original $\\text{\\$} ${original}$, sale price $\\text{\\$} ${sale}$.`;
      required = `Discount percentage.`;
      method = `$\\frac{${original} - ${sale}}{${original}} \\times 100\\% = ${disc}\\%$.`;
      steps = [`$\\frac{${original - sale}}{${original}} \\times 100\\% = ${disc}\\%$.`];
      conclusion = `The discount was $${disc}\\%$.`;
      hint = `Subtract sale price from original price and divide by original price.`;
    }
  } else if (stageId === 24) {
    // Simple Interest: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const p = prng.int(5, 20) * 100;
    const r = prng.pick([4, 5, 6, 8, 10]);
    const t = prng.int(2, 5);
    const interest = (p * r * t) / 100;

    if (subtopicIndex === 0) {
      questionText = `Calculate the simple interest on a principal of $\\text{\\$} ${p}$ at $${r}\\%$ per annum for $${t}$ years:`;
      correctAnswer = `$\\text{\\$} ${interest}$`;
      const dist = generateNumericalDistractors(interest, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `Principal $P = \\text{\\$} ${p}$, rate $r = ${r}\\%$, time $t = ${t}$ years.`;
      required = `Simple Interest $I$.`;
      method = `$I = \\frac{P \\times r \\times t}{100}$.`;
      steps = [`$I = \\frac{${p} \\times ${r} \\times ${t}}{100} = \\text{\\$} ${interest}$.`];
      conclusion = `Simple interest is $\\text{\\$} ${interest}$.`;
      hint = `Use the standard formula $I = \\frac{Prt}{100}$.`;
    } else if (subtopicIndex === 1) {
      const totalAccrued = p + interest;
      questionText = `What is the total accumulated amount ($A = P + I$) when $\\text{\\$} ${p}$ is invested at $${r}\\%$ simple interest for $${t}$ years?`;
      correctAnswer = `$\\text{\\$} ${totalAccrued}$`;
      const dist = generateNumericalDistractors(totalAccrued, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `Principal $P = \\text{\\$} ${p}$, Interest $I = \\text{\\$} ${interest}$.`;
      required = `Total amount $A$.`;
      method = `$A = P + I = ${p} + ${interest} = \\text{\\$} ${totalAccrued}$.`;
      steps = [`$A = ${p} + ${interest} = \\text{\\$} ${totalAccrued}$.`];
      conclusion = `Total accumulated amount is $\\text{\\$} ${totalAccrued}$.`;
      hint = `Add the simple interest earned to the original principal.`;
    } else if (subtopicIndex === 2) {
      questionText = `A sum of money invested at $${r}\\%$ simple interest for $${t}$ years earns exactly $\\text{\\$} ${interest}$ in interest. What was the principal invested?`;
      correctAnswer = `$\\text{\\$} ${p}$`;
      const dist = generateNumericalDistractors(p, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `Interest $I = \\text{\\$} ${interest}$, rate $r = ${r}\\%$, time $t = ${t}$ years.`;
      required = `Principal $P$.`;
      method = `$P = \\frac{100 \\times I}{r \\times t} = \\frac{100 \\times ${interest}}{${r} \\times ${t}}$.`;
      steps = [`$P = \\frac{${100 * interest}}{${r * t}} = \\text{\\$} ${p}$.`];
      conclusion = `The principal was $\\text{\\$} ${p}$.`;
      hint = `Rearrange the interest formula: $P = \\frac{100I}{rt}$.`;
    } else if (subtopicIndex === 3) {
      questionText = `How many years ($t$) does it take for a principal of $\\text{\\$} ${p}$ to earn $\\text{\\$} ${interest}$ at an annual simple interest rate of $${r}\\%$?`;
      correctAnswer = `$${t}\\text{ years}$`;
      rawDistractors = [`$${t + 1}\\text{ years}$`, `$${t - 1 > 0 ? t - 1 : t + 2}\\text{ years}$`, `$${t + 2}\\text{ years}$`];
      given = `Principal $P = \\text{\\$} ${p}$, Interest $I = \\text{\\$} ${interest}$, Rate $r = ${r}\\%$.`;
      required = `Time period $t$.`;
      method = `$t = \\frac{100 \\times I}{P \\times r} = \\frac{100 \\times ${interest}}{${p} \\times ${r}}$.`;
      steps = [`$t = \\frac{${100 * interest}}{${p * r}} = ${t}\\text{ years}$.`];
      conclusion = `The time period is $${t}\\text{ years}$.`;
      hint = `Solve for time: $t = \\frac{100I}{Pr}$.`;
    } else {
      questionText = `At what annual simple interest rate ($r$) will a deposit of $\\text{\\$} ${p}$ earn $\\text{\\$} ${interest}$ in $${t}$ years?`;
      correctAnswer = `$${r}\\%$`;
      const dist = generateNumericalDistractors(r, prng);
      rawDistractors = dist.map(d => `$${d}\\%$`);
      given = `Principal $P = \\text{\\$} ${p}$, Interest $I = \\text{\\$} ${interest}$, time $t = ${t}$ years.`;
      required = `Interest rate $r$.`;
      method = `$r = \\frac{100 \\times I}{P \\times t}$.`;
      steps = [`$r = \\frac{${100 * interest}}{${p * t}} = ${r}\\%$.`];
      conclusion = `The rate is $${r}\\%$.`;
      hint = `Rearrange the formula to solve for rate: $r = \\frac{100I}{Pt}$.`;
    }
  } else if (stageId === 25) {
    // Compound Interest: 5 diverse archetypes fully randomized
    const subtopicIndex = effectiveSubtopic % 5;
    const p = prng.pick([1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000]);
    const rPct = prng.pick([5, 10, 20]);
    const factor = 1 + rPct / 100;

    if (subtopicIndex === 0) {
      const amount = Math.round(p * factor * factor);
      questionText = `Find the accumulated compound amount when $\\text{\\$} ${p.toLocaleString()}$ is invested at $${rPct}\\%$ per annum compound interest for $2$ years:`;
      correctAnswer = `$\\text{\\$} ${amount.toLocaleString()}$`;
      const dist = generateNumericalDistractors(amount, prng, true, false, 50);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d.toLocaleString()}$`);
      given = `Principal $P = \\text{\\$} ${p.toLocaleString()}$, rate $r = ${rPct}\\%$, time $t = 2$ years.`;
      required = `Total compound value $A = P(1 + r)^2$.`;
      method = `$A = ${p} \\times (${factor})^2 = \\text{\\$} ${amount.toLocaleString()}$.`;
      steps = [
        `Year 1: $${p} \\times ${factor} = \\text{\\$} ${Math.round(p * factor).toLocaleString()}$.`,
        `Year 2: $${Math.round(p * factor)} \\times ${factor} = \\text{\\$} ${amount.toLocaleString()}$.`,
      ];
      conclusion = `Total accumulated amount is $\\text{\\$} ${amount.toLocaleString()}$.`;
      hint = `Multiply the principal by $(1 + \\frac{r}{100})$ for each year.`;
    } else if (subtopicIndex === 1) {
      const amount = Math.round(p * factor * factor);
      const compoundInterest = amount - p;
      questionText = `What is the total compound interest earned on $\\text{\\$} ${p.toLocaleString()}$ at $${rPct}\\%$ per annum compounded annually for $2$ years?`;
      correctAnswer = `$\\text{\\$} ${compoundInterest.toLocaleString()}$`;
      const dist = generateNumericalDistractors(compoundInterest, prng, true, false, 25);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d.toLocaleString()}$`);
      given = `Principal $\\text{\\$} ${p.toLocaleString()}$, final value $\\text{\\$} ${amount.toLocaleString()}$.`;
      required = `Compound interest earned $CI = A - P$.`;
      method = `$CI = ${amount} - ${p} = \\text{\\$} ${compoundInterest.toLocaleString()}$.`;
      steps = [`$CI = ${amount.toLocaleString()} - ${p.toLocaleString()} = \\text{\\$} ${compoundInterest.toLocaleString()}$.`];
      conclusion = `The compound interest is $\\text{\\$} ${compoundInterest.toLocaleString()}$.`;
      hint = `Subtract the initial principal from the accumulated sum.`;
    } else if (subtopicIndex === 2) {
      const simpleI = (p * rPct * 2) / 100;
      const compA = Math.round(p * factor * factor);
      const compI = compA - p;
      const diff = compI - simpleI;
      questionText = `What is the difference between compound interest and simple interest on $\\text{\\$} ${p.toLocaleString()}$ at $${rPct}\\%$ per annum for $2$ years?`;
      correctAnswer = `$\\text{\\$} ${diff.toLocaleString()}$`;
      const dist = generateNumericalDistractors(diff, prng, true, false, 5);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d.toLocaleString()}$`);
      given = `Principal $\\text{\\$} ${p.toLocaleString()}$, rate $${rPct}\\%$, time $2$ years.`;
      required = `Difference $CI - SI$.`;
      method = `$SI = \\text{\\$} ${simpleI.toLocaleString()}$, $CI = \\text{\\$} ${compI.toLocaleString()}$, $\\text{Diff} = ${compI} - ${simpleI} = \\text{\\$} ${diff.toLocaleString()}$.`;
      steps = [
        `Simple interest: $SI = \\frac{${p} \\times ${rPct} \\times 2}{100} = \\text{\\$} ${simpleI.toLocaleString()}$.`,
        `Compound interest: $CI = \\text{\\$} ${compI.toLocaleString()}$.`,
        `Difference: $${compI.toLocaleString()} - ${simpleI.toLocaleString()} = \\text{\\$} ${diff.toLocaleString()}$.`,
      ];
      conclusion = `The difference is $\\text{\\$} ${diff.toLocaleString()}$.`;
      hint = `Find simple interest and compound interest separately, then subtract.`;
    } else if (subtopicIndex === 3) {
      const initial = prng.pick([10000, 12000, 15000, 20000, 25000, 30000]);
      const depPct = prng.pick([10, 20]);
      const depMult = 1 - depPct / 100;
      const y2 = Math.round(initial * depMult * depMult);
      questionText = `A company equipment purchased for $\\text{\\$} ${initial.toLocaleString()}$ depreciates at $${depPct}\\%$ per year. What is its value after $2$ years?`;
      correctAnswer = `$\\text{\\$} ${y2.toLocaleString()}$`;
      const dist = generateNumericalDistractors(y2, prng, true, false, 200);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d.toLocaleString()}$`);
      given = `Initial $\\text{\\$} ${initial.toLocaleString()}$, annual depreciation $${depPct}\\%$.`;
      required = `Value after $2$ years.`;
      method = `$V = ${initial} \\times (${depMult})^2 = \\text{\\$} ${y2.toLocaleString()}$.`;
      steps = [
        `Year 1: $${initial} \\times ${depMult} = \\text{\\$} ${Math.round(initial * depMult).toLocaleString()}$.`,
        `Year 2: $${Math.round(initial * depMult)} \\times ${depMult} = \\text{\\$} ${y2.toLocaleString()}$.`,
      ];
      conclusion = `Depreciated value is $\\text{\\$} ${y2.toLocaleString()}$.`;
      hint = `Multiply the current value by $(1 - \\frac{\\text{rate}}{100})$ for each year.`;
    } else {
      const annualR = prng.int(3, 15);
      const factorVal = (1 + annualR / 100).toFixed(2);
      questionText = `Which factor represents annual compounding growth at an interest rate of $r = ${annualR}\\%$ per annum?`;
      correctAnswer = `$${factorVal}$`;
      rawDistractors = [`$${(annualR / 100).toFixed(2)}$`, `$${(1 + annualR / 10).toFixed(2)}$`, `$${(1 + annualR / 1000).toFixed(3)}$`];
      given = `Annual compounding rate $${annualR}\\%$.`;
      required = `Compounding growth multiplier $1 + \\frac{r}{100}$.`;
      method = `$1 + \\frac{${annualR}}{100} = 1 + ${(annualR / 100).toFixed(2)} = ${factorVal}$.`;
      steps = [`$1 + \\frac{${annualR}}{100} = ${factorVal}$.`];
      conclusion = `The growth multiplier is $${factorVal}$.`;
      hint = `Add the decimal equivalent of the rate to 1.`;
    }
  } else if (stageId === 26) {
    // Speed, Distance & Time: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const speed = prng.pick([40, 50, 60, 75, 80, 90, 100, 120]);
    const time = prng.pick([2, 3, 4, 5, 6]);
    const dist = speed * time;

    if (subtopicIndex === 0) {
      questionText = `A vehicle travels at an average speed of $${speed}\\text{ km/h}$ for $${time}\\text{ hours}$. What total distance does it cover?`;
      correctAnswer = `$${dist}\\text{ km}$`;
      const dDist = generateNumericalDistractors(dist, prng);
      rawDistractors = dDist.map(d => `$${d}\\text{ km}$`);
      given = `Speed $s = ${speed}\\text{ km/h}$, Time $t = ${time}\\text{ h}$.`;
      required = `Distance $d$.`;
      method = `$d = s \\times t = ${speed} \\times ${time} = ${dist}\\text{ km}$.`;
      steps = [`$d = ${speed} \\times ${time} = ${dist}\\text{ km}$.`];
      conclusion = `The vehicle covers $${dist}\\text{ km}$.`;
      hint = `Distance equals speed multiplied by time.`;
    } else if (subtopicIndex === 1) {
      questionText = `A high-speed train travels a distance of $${dist}\\text{ km}$ in exactly $${time}\\text{ hours}$. What is its average speed?`;
      correctAnswer = `$${speed}\\text{ km/h}$`;
      const sDist = generateNumericalDistractors(speed, prng);
      rawDistractors = sDist.map(d => `$${d}\\text{ km/h}$`);
      given = `Distance $d = ${dist}\\text{ km}$, Time $t = ${time}\\text{ h}$.`;
      required = `Speed $s$.`;
      method = `$s = \\frac{d}{t} = \\frac{${dist}}{${time}} = ${speed}\\text{ km/h}$.`;
      steps = [`$s = \\frac{${dist}}{${time}} = ${speed}\\text{ km/h}$.`];
      conclusion = `The speed is $${speed}\\text{ km/h}$.`;
      hint = `Divide total distance by time taken.`;
    } else if (subtopicIndex === 2) {
      questionText = `How many hours will it take an airplane cruising at $${speed}\\text{ km/h}$ to travel a distance of $${dist}\\text{ km}$?`;
      correctAnswer = `$${time}\\text{ hours}$`;
      rawDistractors = [`$${time + 1}\\text{ hours}$`, `$${Math.max(1, time - 1)}\\text{ hours}$`, `$${time + 2}\\text{ hours}$`];
      given = `Distance $d = ${dist}\\text{ km}$, Speed $s = ${speed}\\text{ km/h}$.`;
      required = `Time $t$.`;
      method = `$t = \\frac{d}{s} = \\frac{${dist}}{${speed}} = ${time}\\text{ h}$.`;
      steps = [`$t = \\frac{${dist}}{${speed}} = ${time}\\text{ hours}$.`];
      conclusion = `The journey takes $${time}\\text{ hours}$.`;
      hint = `Divide distance by speed.`;
    } else if (subtopicIndex === 3) {
      const msFactor = prng.pick([10, 15, 20, 25, 30]);
      const kmh = msFactor * 3.6;
      questionText = `Convert a speed of $${kmh}\\text{ km/h}$ into meters per second ($\\text{m/s}$):`;
      correctAnswer = `$${msFactor}\\text{ m/s}$`;
      rawDistractors = [`$${msFactor + 5}\\text{ m/s}$`, `$${Math.max(1, msFactor - 5)}\\text{ m/s}$`, `$${msFactor + 2}\\text{ m/s}$`];
      given = `Speed $${kmh}\\text{ km/h}$.`;
      required = `Speed in $\\text{m/s}$.`;
      method = `Multiply by conversion factor $\\frac{5}{18}$: $${kmh} \\times \\frac{5}{18} = ${msFactor}\\text{ m/s}$.`;
      steps = [`$${kmh} \\times \\frac{5}{18} = ${msFactor}\\text{ m/s}$.`];
      conclusion = `$${kmh}\\text{ km/h} = ${msFactor}\\text{ m/s}$.`;
      hint = `Multiply the km/h speed by $\\frac{5}{18}$ or divide by 3.6.`;
    } else {
      const d1 = prng.pick([40, 50, 60, 80]);
      const t1 = prng.pick([1, 2]);
      const d2 = prng.pick([60, 90, 120, 150]);
      const t2 = prng.pick([2, 3]);
      const totalD = d1 + d2;
      const totalT = t1 + t2;
      const avg = Math.round(totalD / totalT);
      questionText = `A motorist drives $${d1}\\text{ km}$ in the first $${t1}\\text{ hour}${t1 > 1 ? 's' : ''}$ and $${d2}\\text{ km}$ in the next $${t2}\\text{ hours}$. What is the overall average speed?`;
      correctAnswer = `$${avg}\\text{ km/h}$`;
      const dist = generateNumericalDistractors(avg, prng);
      rawDistractors = dist.map(d => `$${d}\\text{ km/h}$`);
      given = `Leg 1: $${d1}\\text{ km}$ in $${t1}\\text{ h}$; Leg 2: $${d2}\\text{ km}$ in $${t2}\\text{ h}$.`;
      required = `Average speed.`;
      method = `$\\text{Average Speed} = \\frac{\\text{Total Distance}}{\\text{Total Time}} = \\frac{${d1} + ${d2}}{${t1} + ${t2}} = ${avg}\\text{ km/h}$.`;
      steps = [`$\\frac{${totalD}\\text{ km}}{${totalT}\\text{ h}} = ${avg}\\text{ km/h}$.`];
      conclusion = `Average speed is $${avg}\\text{ km/h}$.`;
      hint = `Divide the entire distance by the entire elapsed time.`;
    }
  } else if (stageId === 27) {
    // Work & Rate Problems: 5 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Pick pairs where 1/a + 1/b = 1/c has nice integers
      const pairs = [
        { a: 6, b: 3, c: 2 },
        { a: 12, b: 4, c: 3 },
        { a: 12, b: 6, c: 4 },
        { a: 20, b: 5, c: 4 },
        { a: 15, b: 10, c: 6 },
        { a: 8, b: 8, c: 4 },
        { a: 30, b: 6, c: 5 },
      ];
      const p = prng.pick(pairs);
      const name1 = prng.pick(['Worker A', 'Technician K', 'Alice', 'David', 'Marcus']);
      const name2 = prng.pick(['Worker B', 'Technician M', 'Bob', 'Elena', 'Sarah']);
      questionText = `${name1} takes $${p.a}$ hours to complete a job alone. ${name2} takes $${p.b}$ hours alone. Working together, how many hours will they take?`;
      correctAnswer = `$${p.c}\\text{ hours}$`;
      rawDistractors = [`$${p.c + 1}\\text{ hours}$`, `$${Math.max(1, p.c - 1)}\\text{ hours}$`, `$${(p.a + p.b) / 2}\\text{ hours}$`];
      given = `Rates: ${name1} $= \\frac{1}{${p.a}}$, ${name2} $= \\frac{1}{${p.b}}$.`;
      required = `Combined time $T$.`;
      method = `$\\frac{1}{T} = \\frac{1}{${p.a}} + \\frac{1}{${p.b}} = \\frac{1}{${p.c}} \\implies T = ${p.c}\\text{ hours}$.`;
      steps = [
        `Combined rate: $\\frac{1}{${p.a}} + \\frac{1}{${p.b}} = \\frac{1}{${p.c}}\\text{ job/h}$.`,
        `Invert rate: $T = ${p.c}\\text{ hours}$.`,
      ];
      conclusion = `Together they complete the job in $${p.c}\\text{ hours}$.`;
      hint = `Add their hourly work rates $\\frac{1}{${p.a}} + \\frac{1}{${p.b}}$ and invert the sum.`;
    } else if (subtopicIndex === 1) {
      const pipePairs = [
        { a: 4, b: 12, c: 3 },
        { a: 6, b: 12, c: 4 },
        { a: 10, b: 15, c: 6 },
        { a: 3, b: 6, c: 2 },
        { a: 5, b: 20, c: 4 },
      ];
      const p = prng.pick(pipePairs);
      questionText = `Pipe A fills a reservoir in $${p.a}$ hours, while Pipe B fills it in $${p.b}$ hours. If both pipes operate simultaneously, how many hours will it take to fill the reservoir?`;
      correctAnswer = `$${p.c}\\text{ hours}$`;
      rawDistractors = [`$${p.c + 2}\\text{ hours}$`, `$${p.c + 1}\\text{ hours}$`, `$${Math.max(1, p.c - 1)}\\text{ hours}$`];
      given = `Inlet rates: $\\frac{1}{${p.a}}$ and $\\frac{1}{${p.b}}$.`;
      required = `Combined filling time.`;
      method = `$\\frac{1}{T} = \\frac{1}{${p.a}} + \\frac{1}{${p.b}} = \\frac{1}{${p.c}} \\implies T = ${p.c}\\text{ hours}$.`;
      steps = [
        `Sum of filling rates: $\\frac{1}{${p.a}} + \\frac{1}{${p.b}} = \\frac{1}{${p.c}}$.`,
        `Time required: $${p.c}\\text{ hours}$.`,
      ];
      conclusion = `The reservoir fills in $${p.c}\\text{ hours}$.`;
      hint = `Sum the hourly filling rates and take the reciprocal.`;
    } else if (subtopicIndex === 2) {
      const totalDays = prng.pick([8, 10, 12, 15, 20]);
      const daysWorked = prng.pick([2, 3, 4, 5].filter(d => d < totalDays));
      const g = gcd(daysWorked, totalDays);
      const numFrac = daysWorked / g;
      const denFrac = totalDays / g;
      questionText = `If an artisan takes $${totalDays}$ days to craft a specialized item alone, what fraction of the work is completed in $${daysWorked}$ days at a constant daily rate?`;
      correctAnswer = `$\\frac{${numFrac}}{${denFrac}}$`;
      rawDistractors = [
        `$\\frac{${totalDays - daysWorked}}{${totalDays}}$`,
        `$\\frac{1}{${daysWorked}}$`,
        `$\\frac{${numFrac + 1}}{${denFrac}}$`,
      ];
      given = `Total required time $= ${totalDays}$ days, elapsed time $= ${daysWorked}$ days.`;
      required = `Fraction completed.`;
      method = `$\\text{Work} = \\frac{\\text{Days Worked}}{\\text{Total Days}} = \\frac{${daysWorked}}{${totalDays}} = \\frac{${numFrac}}{${denFrac}}$.`;
      steps = [`$\\frac{${daysWorked}}{${totalDays}} = \\frac{${numFrac}}{${denFrac}}$.`];
      conclusion = `$\\frac{${numFrac}}{${denFrac}}$ of the work is completed.`;
      hint = `Divide the days worked by total days needed and simplify.`;
    } else if (subtopicIndex === 3) {
      const soloPairs = [
        { combined: 4, soloA: 6, soloB: 12 },
        { combined: 3, soloA: 4, soloB: 12 },
        { combined: 6, soloA: 10, soloB: 15 },
        { combined: 4, soloA: 5, soloB: 20 },
      ];
      const p = prng.pick(soloPairs);
      questionText = `Crew members A and B together can complete a project in $${p.combined}$ days. If A works alone in $${p.soloA}$ days, how many days does B require working alone?`;
      correctAnswer = `$${p.soloB}\\text{ days}$`;
      rawDistractors = [`$${p.soloB - 2}\\text{ days}$`, `$${p.soloB + 3}\\text{ days}$`, `$${p.soloA + p.combined}\\text{ days}$`];
      given = `Combined rate $= \\frac{1}{${p.combined}}$, A's rate $= \\frac{1}{${p.soloA}}$.`;
      required = `B's solo time.`;
      method = `$\\frac{1}{t_B} = \\frac{1}{${p.combined}} - \\frac{1}{${p.soloA}} = \\frac{1}{${p.soloB}} \\implies t_B = ${p.soloB}\\text{ days}$.`;
      steps = [`$\\frac{1}{${p.combined}} - \\frac{1}{${p.soloA}} = \\frac{1}{${p.soloB}} \\implies t_B = ${p.soloB}\\text{ days}$.`];
      conclusion = `B needs $${p.soloB}\\text{ days}$ working alone.`;
      hint = `Subtract A's rate from the combined rate to find B's solo rate.`;
    } else {
      const r1 = prng.pick([10, 12, 15, 20]);
      const r2 = prng.pick([15, 18, 25, 30]);
      const r3 = prng.pick([20, 25, 30, 35]);
      const minutes = prng.pick([2, 3, 4, 5]);
      const totalRate = r1 + r2 + r3;
      const totalPages = totalRate * minutes;
      questionText = `Three printers A, B, and C output at constant speeds of $${r1}, ${r2},$ and $${r3}$ pages per minute. How many total pages do all three produce operating together for $${minutes}$ minutes?`;
      correctAnswer = `$${totalPages}\\text{ pages}$`;
      const dist = generateNumericalDistractors(totalPages, prng, true, false, 20);
      rawDistractors = dist.map(d => `$${d}\\text{ pages}$`);
      given = `Speeds $${r1}, ${r2}, ${r3}\\text{ ppm}$, duration $${minutes}\\text{ min}$.`;
      required = `Total output pages.`;
      method = `$\\text{Total Rate} = ${r1} + ${r2} + ${r3} = ${totalRate}\\text{ ppm}$. In $${minutes}$ minutes: $${totalRate} \\times ${minutes} = ${totalPages}\\text{ pages}$.`;
      steps = [
        `Combined rate: $${r1} + ${r2} + ${r3} = ${totalRate}\\text{ ppm}$.`,
        `Total pages: $${totalRate} \\times ${minutes} = ${totalPages}\\text{ pages}$.`,
      ];
      conclusion = `They produce $${totalPages}\\text{ pages}$.`;
      hint = `Sum the individual rates and multiply by the number of minutes.`;
    }
  } else if (stageId === 28 || stageId === 29 || stageId === 30) {
    // Mixtures & Real-World Modeling: 5 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const v1 = prng.pick([10, 20, 30, 40]);
      const c1 = prng.pick([10, 15, 20]);
      const v2 = prng.pick([20, 30, 40, 50]);
      const c2 = prng.pick([25, 30, 40]);
      const pure1 = (v1 * c1) / 100;
      const pure2 = (v2 * c2) / 100;
      const totalV = v1 + v2;
      const netPct = Math.round(((pure1 + pure2) / totalV) * 100);
      questionText = `$${v1}\\text{ L}$ of a $${c1}\\%$ saline solution is mixed with $${v2}\\text{ L}$ of a $${c2}\\%$ saline solution. What is the saline concentration of the combined mixture?`;
      correctAnswer = `$${netPct}\\%$`;
      rawDistractors = [`$${netPct + 4}\\%$`, `$${Math.max(1, netPct - 4)}\\%$`, `$${Math.round((c1 + c2) / 2)}\\%$`];
      given = `Sol 1: $${v1}\\text{ L}$ at $${c1}\\%$; Sol 2: $${v2}\\text{ L}$ at $${c2}\\%$.`;
      required = `Net concentration percentage.`;
      method = `$\\text{Concentration} = \\frac{\\text{Total pure solute}}{\\text{Total volume}} \\times 100\\%$.`;
      steps = [
        `Solute from Sol 1: $\\frac{${c1}}{100} \\times ${v1} = ${pure1.toFixed(1)}\\text{ L}$.`,
        `Solute from Sol 2: $\\frac{${c2}}{100} \\times ${v2} = ${pure2.toFixed(1)}\\text{ L}$.`,
        `Total solute: ${(pure1 + pure2).toFixed(1)}\\text{ L}$ in $${totalV}\\text{ L}$ solution.`,
        `Concentration: $\\frac{${(pure1 + pure2).toFixed(1)}}{${totalV}} \\times 100\\% \\approx ${netPct}\\%$.`,
      ];
      conclusion = `The resulting mixture is $${netPct}\\%$ saline.`;
      hint = `Find total liters of pure solute and divide by total combined liquid volume.`;
    } else if (subtopicIndex === 1) {
      const origV = prng.pick([10, 20, 30]);
      const origPct = prng.pick([40, 50, 60]);
      const targetPct = origPct / 2;
      const addedWater = origV; // halving the concentration always requires adding the same volume of pure water!
      questionText = `How much pure water must be added to $${origV}\\text{ L}$ of a $${origPct}\\%$ juice blend to dilute it to a $${targetPct}\\%$ juice concentration?`;
      correctAnswer = `$${addedWater}\\text{ L}$`;
      rawDistractors = [`$${addedWater / 2}\\text{ L}$`, `$${addedWater + 5}\\text{ L}$`, `$${addedWater * 2}\\text{ L}$`];
      given = `$${origV}\\text{ L}$ at $${origPct}\\%$ juice, target $${targetPct}\\%$.`;
      required = `Water to add $W$.`;
      method = `Pure juice remains constant: $\\frac{${origPct}}{100} \\times ${origV} = ${(origV * origPct) / 100}\\text{ L}$. To halve concentration from $${origPct}\\%$ to $${targetPct}\\%$, volume must double: $W = ${addedWater}\\text{ L}$.`;
      steps = [
        `Pure juice $= ${(origV * origPct) / 100}\\text{ L}$.`,
        `Target volume: $\\frac{${(origV * origPct) / 100}}{${targetPct / 100}} = ${origV * 2}\\text{ L}$.`,
        `Water added: $${origV * 2} - ${origV} = ${addedWater}\\text{ L}$.`,
      ];
      conclusion = `$${addedWater}\\text{ L}$ of pure water must be added.`;
      hint = `To halve the concentration of a mixture, you must double its total volume.`;
    } else if (subtopicIndex === 2) {
      const p1 = prng.pick([30, 40, 50]);
      const p2 = prng.pick([70, 80, 90]);
      const avgP = (p1 + p2) / 2;
      questionText = `An alloy containing $${p1}\\%$ silver is blended with an equal mass of alloy containing $${p2}\\%$ silver. What is the silver content of the newly formed alloy?`;
      correctAnswer = `$${avgP}\\%$`;
      rawDistractors = [`$${avgP - 5}\\%$`, `$${avgP + 5}\\%$`, `$${p1}\\%$`];
      given = `Equal masses of $${p1}\\%$ and $${p2}\\%$ alloys.`;
      required = `Average purity.`;
      method = `Equal masses mean simple arithmetic average: $\\frac{${p1} + ${p2}}{2} = ${avgP}\\%$.`;
      steps = [`$\\frac{${p1}\\% + ${p2}\\%}{2} = ${avgP}\\%$.`];
      conclusion = `The resulting alloy is $${avgP}\\%$ silver.`;
      hint = `Since the quantities mixed are equal in mass, take the simple average of both percentages.`;
    } else if (subtopicIndex === 3) {
      const fixed = prng.pick([15, 20, 25, 30, 35]);
      const perKm = prng.pick([2, 3, 4, 5]);
      const km = prng.pick([8, 10, 12, 15, 20]);
      const totalCost = fixed + perKm * km;
      questionText = `A transport service charges a fixed flag fall of $\\text{\\$} ${fixed}$ plus $\\text{\\$} ${perKm}$ per kilometer. What is the total fare for a trip of $${km}\\text{ km}$?`;
      correctAnswer = `$\\text{\\$} ${totalCost}$`;
      const dist = generateNumericalDistractors(totalCost, prng);
      rawDistractors = dist.map(d => `$\\text{\\$} ${d}$`);
      given = `Base fee $\\text{\\$} ${fixed}$, rate $\\text{\\$} ${perKm}/\\text{km}$, distance $${km}\\text{ km}$.`;
      required = `Total fare $C = ${fixed} + ${perKm}x$.`;
      method = `$C = ${fixed} + (${perKm} \\times ${km}) = ${fixed} + ${perKm * km} = \\text{\\$} ${totalCost}$.`;
      steps = [`$${fixed} + (${perKm} \\times ${km}) = \\text{\\$} ${totalCost}$.`];
      conclusion = `The fare is $\\text{\\$} ${totalCost}$.`;
      hint = `Multiply distance by rate per km and add the fixed fee.`;
    } else {
      const fixedCost = prng.pick([400, 500, 600, 800, 1000]);
      const unitCost = prng.pick([10, 15, 20, 25]);
      const margin = prng.pick([15, 20, 25, 40]);
      const sellPrice = unitCost + margin;
      const breakEven = fixedCost / margin;
      questionText = `A production plant has fixed daily operational costs of $\\text{\\$} ${fixedCost}$ and unit production costs of $\\text{\\$} ${unitCost}$ per item. If items sell for $\\text{\\$} ${sellPrice}$ each, what is the break-even volume of items?`;
      correctAnswer = `$${breakEven}\\text{ items}$`;
      rawDistractors = [`$${breakEven + 5}\\text{ items}$`, `$${Math.max(1, breakEven - 5)}\\text{ items}$`, `$${breakEven + 10}\\text{ items}$`];
      given = `Fixed cost $\\text{\\$} ${fixedCost}$, unit cost $\\text{\\$} ${unitCost}$, selling price $\\text{\\$} ${sellPrice}$.`;
      required = `Break-even volume $N$.`;
      method = `$\\text{Contribution Margin} = ${sellPrice} - ${unitCost} = \\text{\\$} ${margin}/\\text{unit}$. $\\text{Break-even} = \\frac{${fixedCost}}{${margin}} = ${breakEven}\\text{ items}$.`;
      steps = [
        `Contribution margin per unit: $${sellPrice} - ${unitCost} = \\text{\\$} ${margin}$.`,
        `Break-even point: $\\frac{${fixedCost}}{${margin}} = ${breakEven}\\text{ units}$.`,
      ];
      conclusion = `The break-even point is $${breakEven}\\text{ items}$.`;
      hint = `Divide fixed costs by the profit margin per unit ($${sellPrice} - ${unitCost}$).`;
    }
  }

  // ==========================================
  // WORLD 4: ALGEBRA (Stages 31-40)
  // ==========================================
  else if (stageId === 31 || stageId === 32 || stageId === 33) {
    // Algebraic Expressions & Simplification: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const c1 = prng.int(2, 6);
      const c2 = prng.int(3, 8);
      const c3 = prng.int(3, 7);
      const sumX = c1 + c2;
      const coeffY = c3 - 2;
      const yTerm = coeffY === 0 ? '' : coeffY > 0 ? ` + ${coeffY}y` : ` - ${Math.abs(coeffY)}y`;
      questionText = `Simplify by collecting like terms:\n\n$$${c1}x + ${c3}y + ${c2}x - 2y$$`;
      correctAnswer = `$${sumX}x${yTerm}$`;
      rawDistractors = [
        `$${sumX + 1}x${yTerm}$`,
        `$${c1 + c2 + c3}xy$`,
        `$${sumX}x + ${c3 + 2}y$`,
      ];
      given = `Expression $${c1}x + ${c3}y + ${c2}x - 2y$.`;
      required = `Simplified algebraic expression.`;
      method = `Group identical variable terms and sum their numerical coefficients.`;
      steps = [
        `$x$-terms: $(${c1} + ${c2})x = ${sumX}x$.`,
        `$y$-terms: $(${c3} - 2)y = ${coeffY}y$.`,
        `Combine: $${sumX}x${yTerm}$.`,
      ];
      conclusion = `Simplified form: $${sumX}x${yTerm}$.`;
      hint = `Combine like terms with the same variable.`;
    } else if (subtopicIndex === 1) {
      const a = prng.int(2, 5);
      const b = prng.int(2, 6);
      const p1 = prng.int(1, 3);
      const p2 = prng.int(1, 3);
      const coeff = a * b;
      const power = p1 + p2;
      questionText = `Multiply the algebraic monomials and apply index laws:\n\n$$(${a}x^${p1}) \\times (${b}x^${p2})$$`;
      correctAnswer = `$${coeff}x^${power}$`;
      rawDistractors = [
        `$${a + b}x^${power}$`,
        `$${coeff}x^${p1 * p2}$`,
        `$${coeff}x^${power + 1}$`,
      ];
      given = `Monomials $${a}x^${p1}$ and $${b}x^${p2}$.`;
      required = `Simplified product.`;
      method = `Multiply numerical coefficients ($${a} \\times ${b} = ${coeff}$) and add exponents ($x^{${p1} + ${p2}} = x^${power}$).`;
      steps = [
        `Coefficients: $${a} \\times ${b} = ${coeff}$.`,
        `Exponents: $x^${p1} \\times x^${p2} = x^{${p1}+${p2}} = x^${power}$.`,
        `Product: $${coeff}x^${power}$.`,
      ];
      conclusion = `The product is $${coeff}x^${power}$.`;
      hint = `Multiply coefficients and add exponents of like variables.`;
    } else if (subtopicIndex === 2) {
      const k = prng.int(2, 6);
      const m = prng.int(3, 8);
      questionText = `Which algebraic expression correctly translates the verbal phrase: "$${m}$ less than $${k}$ times a number $x$"?`;
      correctAnswer = `$${k}x - ${m}$`;
      rawDistractors = [
        `$${m} - ${k}x$`,
        `$${k}(x - ${m})$`,
        `$\\frac{x - ${m}}{${k}}$`,
      ];
      given = `Phrase: "$${m}$ less than $${k}$ times $x$".`;
      required = `Algebraic expression.`;
      method = `"$${k}$ times $x$" is $${k}x$; "$${m}$ less than" means subtract $${m}$: $${k}x - ${m}$.`;
      steps = [
        `"$${k}$ times $x$" $= ${k}x$.`,
        `"$${m}$ less than" $= ${k}x - ${m}$.`,
      ];
      conclusion = `The expression is $${k}x - ${m}$.`;
      hint = `"Less than" indicates subtraction from the multiplied quantity.`;
    } else if (subtopicIndex === 3) {
      const a = prng.int(2, 5);
      const b = prng.int(2, 5);
      const c = prng.int(3, 7);
      const ab = a * b;
      const ac = a * c;
      questionText = `Expand the bracket using the distributive law:\n\n$$${a}(${b}x + ${c})$$`;
      correctAnswer = `$${ab}x + ${ac}$`;
      rawDistractors = [
        `$${ab}x + ${c}$`,
        `$${a + b}x + ${a + c}$`,
        `$${ab}x - ${ac}$`,
      ];
      given = `Expression $${a}(${b}x + ${c})$.`;
      required = `Expanded polynomial.`;
      method = `Multiply the outer factor $${a}$ by each term inside: $${a} \\times ${b}x + ${a} \\times ${c}$.`;
      steps = [`$${a}(${b}x + ${c}) = ${ab}x + ${ac}$.`];
      conclusion = `Expanded form: $${ab}x + ${ac}$.`;
      hint = `Multiply the term outside the parentheses by every term inside.`;
    } else {
      const p = prng.int(3, 7);
      const q = prng.int(1, 4);
      const r = prng.int(5, 12);
      const s = prng.int(2, 6);
      const diffX = p - q;
      const sumC = r + s;
      questionText = `Simplify the expression by combining variables and constants:\n\n$$${p}x + ${r} - ${q}x + ${s}$$`;
      correctAnswer = `$${diffX}x + ${sumC}$`;
      rawDistractors = [
        `$${p + q}x + ${sumC}$`,
        `$${diffX}x + ${r - s}$`,
        `$${diffX + sumC}x$`,
      ];
      given = `Expression $${p}x + ${r} - ${q}x + ${s}$.`;
      required = `Simplified form.`;
      method = `Group variable terms $(${p} - ${q})x$ and constant terms $${r} + ${s}$.`;
      steps = [
        `Variable terms: $(${p} - ${q})x = ${diffX}x$.`,
        `Constant terms: $${r} + ${s} = ${sumC}$.`,
        `Result: $${diffX}x + ${sumC}$.`,
      ];
      conclusion = `Simplified form: $${diffX}x + ${sumC}$.`;
      hint = `Combine like terms together: $x$-terms with $x$-terms, and numbers with numbers.`;
    }
  } else if (stageId === 34) {
    // Substitution: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const xVal = prng.int(2, 5);
      const a = prng.int(2, 4);
      const b = prng.int(3, 8);
      const ans = a * (xVal * xVal) - b;
      questionText = `If $x = ${xVal}$, evaluate the quadratic expression:\n\n$$${a}x^2 - ${b}$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $${a}x^2 - ${b}$, $x = ${xVal}$.`;
      required = `Numerical value.`;
      method = `Square $x$ first: $(${xVal})^2 = ${xVal * xVal}$, multiply by $${a}$, then subtract $${b}$.`;
      steps = [
        `Square: $(${xVal})^2 = ${xVal * xVal}$.`,
        `Multiply: $${a} \\times ${xVal * xVal} = ${a * xVal * xVal}$.`,
        `Subtract: $${a * xVal * xVal} - ${b} = ${ans}$.`,
      ];
      conclusion = `The value is $${ans}$.`;
      hint = `Square the value of $x$ before multiplying by $${a}$.`;
    } else if (subtopicIndex === 1) {
      const xVal = prng.int(-4, -1);
      const a = prng.int(2, 5);
      const b = prng.int(3, 8);
      const ans = a * xVal + b;
      questionText = `Evaluate the linear expression for negative $x = ${xVal}$:\n\n$$${a}x + ${b}$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng, true, true);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Expression $${a}x + ${b}$, $x = ${xVal}$.`;
      required = `Numerical value.`;
      method = `Multiply $${a} \\times (${xVal}) = ${a * xVal}$, then add $${b}$.`;
      steps = [
        `$${a} \\times (${xVal}) = ${a * xVal}$.`,
        `$${a * xVal} + ${b} = ${ans}$.`,
      ];
      conclusion = `The value is $${ans}$.`;
      hint = `Be careful with negative signs when multiplying.`;
    } else if (subtopicIndex === 2) {
      const aVal = prng.int(2, 5);
      const bVal = prng.int(3, 6);
      const ans = 3 * aVal + 2 * bVal;
      questionText = `If $a = ${aVal}$ and $b = ${bVal}$, find the value of the two-variable expression:\n\n$$3a + 2b$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$a = ${aVal}$, $b = ${bVal}$.`;
      required = `Value of $3a + 2b$.`;
      method = `Substitute both values: $3(${aVal}) + 2(${bVal})$.`;
      steps = [
        `$3 \\times ${aVal} = ${3 * aVal}$.`,
        `$2 \\times ${bVal} = ${2 * bVal}$.`,
        `Sum: $${3 * aVal} + ${2 * bVal} = ${ans}$.`,
      ];
      conclusion = `The value is $${ans}$.`;
      hint = `Replace $a$ and $b$ with their given numerical values.`;
    } else if (subtopicIndex === 3) {
      const x = prng.int(3, 7);
      const ans = x * x - 2 * x;
      questionText = `Evaluate the polynomial function for $x = ${x}$:\n\n$$f(x) = x^2 - 2x$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Function $f(x) = x^2 - 2x$, input $x = ${x}$.`;
      required = `Output $f(${x})$.`;
      method = `Substitute $x = ${x}$: $(${x})^2 - 2(${x}) = ${x * x} - ${2 * x} = ${ans}$.`;
      steps = [
        `$(${x})^2 = ${x * x}$.`,
        `$2 \\times ${x} = ${2 * x}$.`,
        `$${x * x} - ${2 * x} = ${ans}$.`,
      ];
      conclusion = `$f(${x}) = ${ans}$.`;
      hint = `Evaluate each term at $x = ${x}$ and subtract.`;
    } else {
      const u = prng.int(5, 15);
      const a = prng.int(2, 5);
      const t = prng.int(2, 4);
      const v = u + a * t;
      questionText = `Using the kinematic formula $v = u + at$, calculate final velocity $v$ when initial velocity $u = ${u}\\text{ m/s}$, acceleration $a = ${a}\\text{ m/s}^2$, and time $t = ${t}\\text{ s}$:`;
      correctAnswer = `$${v}\\text{ m/s}$`;
      const dist = generateNumericalDistractors(v, prng);
      rawDistractors = dist.map(d => `$${d}\\text{ m/s}$`);
      given = `$u = ${u}$, $a = ${a}$, $t = ${t}$.`;
      required = `Velocity $v$.`;
      method = `$v = u + at = ${u} + (${a} \\times ${t}) = ${u} + ${a * t} = ${v}\\text{ m/s}$.`;
      steps = [`$v = ${u} + (${a} \\times ${t}) = ${v}\\text{ m/s}$.`];
      conclusion = `$v = ${v}\\text{ m/s}$.`;
      hint = `Multiply acceleration by time first, then add initial velocity.`;
    }
  } else if (stageId === 35) {
    // Linear Equations: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const m = prng.int(2, 6);
      const sol = prng.int(2, 9);
      const c = prng.int(3, 15);
      const rhs = m * sol + c;
      questionText = `Solve the two-step linear equation for $x$:\n\n$$${m}x + ${c} = ${rhs}$$`;
      correctAnswer = `$x = ${sol}$`;
      rawDistractors = [`$x = ${sol + 1}$`, `$x = ${Math.max(1, sol - 1)}$`, `$x = ${sol + 2}$`];
      given = `Equation $${m}x + ${c} = ${rhs}$.`;
      required = `Unknown $x$.`;
      method = `Subtract $${c}$ then divide by $${m}$.`;
      steps = [
        `$${m}x = ${rhs} - ${c} = ${rhs - c}$.`,
        `$x = \\frac{${rhs - c}}{${m}} = ${sol}$.`,
      ];
      conclusion = `$x = ${sol}$.`;
      hint = `Subtract $${c}$ from both sides, then divide by $${m}$.`;
    } else if (subtopicIndex === 1) {
      const sol = prng.int(2, 8);
      const a = prng.int(4, 7);
      const c = prng.int(1, 3); // a > c
      const d = prng.int(2, 10);
      const b = (c * sol + d) - (a * sol); // to make ax + b = cx + d balance
      // Let's formulate cleanly: (a - c) * sol = d - b
      const diffCoeff = a - c;
      const bVal = 5;
      const dVal = bVal + diffCoeff * sol;
      questionText = `Solve the linear equation with variables on both sides for $x$:\n\n$$${a}x + ${bVal} = ${c}x + ${dVal}$$`;
      correctAnswer = `$x = ${sol}$`;
      rawDistractors = [`$x = ${sol + 1}$`, `$x = ${Math.max(1, sol - 1)}$`, `$x = ${sol + 2}$`];
      given = `Equation $${a}x + ${bVal} = ${c}x + ${dVal}$.`;
      required = `Value of $x$.`;
      method = `Subtract $${c}x$ from both sides, then subtract $${bVal}$, and divide by $${diffCoeff}$.`;
      steps = [
        `$(${a} - ${c})x = ${dVal} - ${bVal} \\implies ${diffCoeff}x = ${dVal - bVal}$.`,
        `$x = \\frac{${dVal - bVal}}{${diffCoeff}} = ${sol}$.`,
      ];
      conclusion = `$x = ${sol}$.`;
      hint = `Gather all $x$-terms on the left side and all numbers on the right side.`;
    } else if (subtopicIndex === 2) {
      const a = prng.int(2, 5);
      const sol = prng.int(2, 8);
      const b = prng.int(1, 6);
      const rhs = a * (sol + b);
      questionText = `Solve the equation containing brackets:\n\n$$${a}(x + ${b}) = ${rhs}$$`;
      correctAnswer = `$x = ${sol}$`;
      rawDistractors = [`$x = ${sol + 1}$`, `$x = ${Math.max(1, sol - 1)}$`, `$x = ${sol + 2}$`];
      given = `Equation $${a}(x + ${b}) = ${rhs}$.`;
      required = `Solution $x$.`;
      method = `Divide both sides by $${a}$: $x + ${b} = \\frac{${rhs}}{${a}}$, then subtract $${b}$.`;
      steps = [
        `$x + ${b} = \\frac{${rhs}}{${a}} = ${rhs / a}$.`,
        `$x = ${rhs / a} - ${b} = ${sol}$.`,
      ];
      conclusion = `$x = ${sol}$.`;
      hint = `Divide both sides by $${a}$ first, then subtract $${b}$.`;
    } else if (subtopicIndex === 3) {
      const a = prng.int(3, 7);
      const sol = prng.int(4, 9);
      const rhs = sol;
      const num = a * sol;
      questionText = `Solve the fractional linear equation:\n\n$$\\frac{x}{${a}} = ${rhs}$$`;
      correctAnswer = `$x = ${num}$`;
      const dist = generateNumericalDistractors(num, prng);
      rawDistractors = dist.map(d => `$x = ${d}$`);
      given = `Equation $\\frac{x}{${a}} = ${rhs}$.`;
      required = `Unknown $x$.`;
      method = `Multiply both sides by denominator $${a}$: $x = ${rhs} \\times ${a}$.`;
      steps = [`$x = ${rhs} \\times ${a} = ${num}$.`];
      conclusion = `$x = ${num}$.`;
      hint = `Multiply both sides of the equation by $${a}$.`;
    } else {
      const cost = prng.int(3, 8);
      const total = prng.int(25, 60);
      const fixed = total % cost;
      const count = Math.floor((total - fixed) / cost);
      questionText = `If $${cost}x + ${fixed} = ${total}$, what is the value of $x$?`;
      correctAnswer = `$x = ${count}$`;
      rawDistractors = [`$x = ${count + 1}$`, `$x = ${Math.max(1, count - 1)}$`, `$x = ${count + 2}$`];
      given = `Equation $${cost}x + ${fixed} = ${total}$.`;
      required = `Solution $x$.`;
      method = `Subtract $${fixed}$ and divide by $${cost}$.`;
      steps = [
        `$${cost}x = ${total - fixed}$.`,
        `$x = \\frac{${total - fixed}}{${cost}} = ${count}$.`,
      ];
      conclusion = `$x = ${count}$.`;
      hint = `Subtract $${fixed}$ from $${total}$, then divide by $${cost}$.`;
    }
  } else if (stageId === 36) {
    // Linear Inequalities: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const a = prng.int(2, 5);
    const bound = prng.int(2, 8);

    if (subtopicIndex === 0) {
      const b = prng.int(1, 9);
      const rhs = a * bound + b;
      questionText = `Solve the inequality for $x$:\n\n$$${a}x + ${b} < ${rhs}$$`;
      correctAnswer = `$x < ${bound}$`;
      rawDistractors = [`$x > ${bound}$`, `$x < ${bound + 1}$`, `$x \\le ${bound}$`];
      given = `Inequality $${a}x + ${b} < ${rhs}$.`;
      required = `Solution range.`;
      method = `Subtract $${b}$ and divide by positive $${a}$.`;
      steps = [
        `$${a}x < ${rhs - b}$.`,
        `$x < \\frac{${rhs - b}}{${a}} = ${bound}$.`,
      ];
      conclusion = `$x < ${bound}$.`;
      hint = `Isolate $x$ just like an equation since $${a}$ is positive.`;
    } else if (subtopicIndex === 1) {
      const b = prng.int(2, 8);
      const rhs = a * bound - b;
      questionText = `Solve the inequality with strict greater than:\n\n$$${a}x - ${b} > ${rhs}$$`;
      correctAnswer = `$x > ${bound}$`;
      rawDistractors = [`$x < ${bound}$`, `$x > ${bound + 1}$`, `$x \\ge ${bound}$`];
      given = `Inequality $${a}x - ${b} > ${rhs}$.`;
      required = `Solution range.`;
      method = `Add $${b}$ to both sides and divide by $${a}$.`;
      steps = [
        `$${a}x > ${rhs + b}$.`,
        `$x > ${bound}$.`,
      ];
      conclusion = `$x > ${bound}$.`;
      hint = `Add $${b}$ to the right side, then divide by $${a}$.`;
    } else if (subtopicIndex === 2) {
      // Negative coefficient sign flip
      const negA = -a;
      const b = prng.int(1, 6);
      const rhs = negA * bound + b;
      questionText = `Solve the inequality (remember the sign flip when dividing by a negative):\n\n$$-${a}x + ${b} \\le ${rhs}$$`;
      correctAnswer = `$x \\ge ${bound}$`;
      rawDistractors = [`$x \\le ${bound}$`, `$x > ${bound}$`, `$x \\ge ${bound + 1}$`];
      given = `Inequality $-${a}x + ${b} \\le ${rhs}$.`;
      required = `Solution range.`;
      method = `Subtract $${b}$, then divide by $-${a}$ and flip the inequality direction: $\\le$ becomes $\\ge$.`;
      steps = [
        `$-${a}x \\le ${rhs - b}$.`,
        `Divide by $-${a}$ and reverse direction: $x \\ge ${bound}$.`,
      ];
      conclusion = `$x \\ge ${bound}$.`;
      hint = `When you divide both sides of an inequality by a negative number, flip the inequality sign!`;
    } else if (subtopicIndex === 3) {
      questionText = `What is the largest integer that satisfies the inequality $x < ${bound}$?`;
      const maxInt = bound - 1;
      correctAnswer = `$${maxInt}$`;
      rawDistractors = [`$${bound}$`, `$${bound + 1}$`, `$${maxInt - 1}$`];
      given = `Inequality $x < ${bound}$.`;
      required = `Maximum integer value of $x$.`;
      method = `Since $x$ must be strictly less than $${bound}$, the greatest integer is $${bound} - 1 = ${maxInt}$.`;
      steps = [
        `$x$ cannot equal $${bound}$.`,
        `The largest integer strictly below $${bound}$ is $${maxInt}$.`,
      ];
      conclusion = `The largest integer is $${maxInt}$.`;
      hint = `The inequality is strict ($<$), so $x$ cannot equal $${bound}$.`;
    } else {
      questionText = `Solve the simple linear inequality:\n\n$$x + ${a} \\ge ${bound + a}$$`;
      correctAnswer = `$x \\ge ${bound}$`;
      rawDistractors = [`$x \\le ${bound}$`, `$x > ${bound}$`, `$x \\ge ${bound + 1}$`];
      given = `Inequality $x + ${a} \\ge ${bound + a}$.`;
      required = `Solution range.`;
      method = `Subtract $${a}$ from both sides.`;
      steps = [`$x \\ge ${bound + a} - ${a} \\implies x \\ge ${bound}$.`];
      conclusion = `$x \\ge ${bound}$.`;
      hint = `Subtract $${a}$ from both sides.`;
    }
  } else if (stageId === 37) {
    // Expanding & Factorization: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const p = prng.int(2, 6);
    const q = prng.int(2, 6);

    if (subtopicIndex === 0) {
      const b = p + q;
      const c = p * q;
      questionText = `Factor the quadratic trinomial completely:\n\n$$x^2 + ${b}x + ${c}$$`;
      correctAnswer = `$(x + ${p})(x + ${q})$`;
      rawDistractors = [
        `$(x - ${p})(x - ${q})$`,
        `$(x + ${p + 1})(x + ${Math.max(1, q - 1)})$`,
        `$(x + ${c})(x + 1)$`,
      ];
      given = `Trinomial $x^2 + ${b}x + ${c}$.`;
      required = `Factored form.`;
      method = `Find two numbers multiplying to $${c}$ and adding to $${b}$.`;
      steps = [
        `Product $= ${c}$, Sum $= ${b}$.`,
        `Numbers: $${p}$ and $${q}$.`,
        `Factorization: $(x + ${p})(x + ${q})$.`,
      ];
      conclusion = `Factored form: $(x + ${p})(x + ${q})$.`;
      hint = `Find two numbers that multiply to $${c}$ and add up to $${b}$.`;
    } else if (subtopicIndex === 1) {
      const a = prng.int(2, 9);
      const sq = a * a;
      questionText = `Factor the difference of two squares:\n\n$$x^2 - ${sq}$$`;
      correctAnswer = `$(x - ${a})(x + ${a})$`;
      rawDistractors = [
        `$(x - ${a})^2$`,
        `$(x + ${a})^2$`,
        `$(x - ${sq})(x + 1)$`,
      ];
      given = `Binomial $x^2 - ${sq}$.`;
      required = `Factored form via $a^2 - b^2 = (a-b)(a+b)$.`;
      method = `Identify square root of $${sq} = ${a}$, then write $(x - ${a})(x + ${a})$.`;
      steps = [
        `$\\sqrt{${sq}} = ${a}$.`,
        `$x^2 - ${sq} = (x - ${a})(x + ${a})$.`,
      ];
      conclusion = `$(x - ${a})(x + ${a})$.`;
      hint = `Use the difference of squares identity: $x^2 - a^2 = (x-a)(x+a)$.`;
    } else if (subtopicIndex === 2) {
      const k = prng.int(2, 6);
      const m = prng.int(2, 7);
      const km = k * m;
      questionText = `Factor out the greatest common monomial factor:\n\n$$${k}x^2 + ${km}x$$`;
      correctAnswer = `$${k}x(x + ${m})$`;
      rawDistractors = [
        `$x(${k}x + ${km})$`,
        `$${k}(x^2 + ${m}x)$`,
        `$${k}x(x - ${m})$`,
      ];
      given = `Expression $${k}x^2 + ${km}x$.`;
      required = `Factored form.`;
      method = `Identify common monomial factor $${k}x$ and factor it out: $${k}x(x + ${m})$.`;
      steps = [
        `Common factor: $${k}x$.`,
        `Dividing terms gives $(x + ${m})$.`,
        `Result: $${k}x(x + ${m})$.`,
      ];
      conclusion = `$${k}x(x + ${m})$.`;
      hint = `Look for the highest number and variable power shared by both terms.`;
    } else if (subtopicIndex === 3) {
      const a = prng.int(2, 5);
      const b = prng.int(2, 5);
      const sum = a + b;
      const prod = a * b;
      questionText = `Expand the binomial product using FOIL:\n\n$$(x + ${a})(x + ${b})$$`;
      correctAnswer = `$x^2 + ${sum}x + ${prod}$`;
      rawDistractors = [
        `$x^2 + ${prod}x + ${sum}$`,
        `$x^2 + ${sum}x - ${prod}$`,
        `$x^2 + ${a + b + 1}x + ${prod}$`,
      ];
      given = `Binomial product $(x + ${a})(x + ${b})$.`;
      required = `Standard trinomial.`;
      method = `FOIL: $x^2 + ${b}x + ${a}x + (${a} \\times ${b}) = x^2 + ${sum}x + ${prod}$.`;
      steps = [`$x^2 + (${a} + ${b})x + (${a} \\times ${b}) = x^2 + ${sum}x + ${prod}$.`];
      conclusion = `$x^2 + ${sum}x + ${prod}$.`;
      hint = `First, Outside, Inside, Last (FOIL).`;
    } else {
      const a = prng.int(2, 6);
      const sq = a * a;
      const mid = 2 * a;
      questionText = `Expand the perfect square binomial:\n\n$$(x + ${a})^2$$`;
      correctAnswer = `$x^2 + ${mid}x + ${sq}$`;
      rawDistractors = [
        `$x^2 + ${sq}$`,
        `$x^2 + ${a}x + ${sq}$`,
        `$x^2 + ${mid}x + ${a}$`,
      ];
      given = `$(x + ${a})^2$.`;
      required = `Expanded trinomial.`;
      method = `Identity $(x + a)^2 = x^2 + 2ax + a^2$.`;
      steps = [`$x^2 + 2(${a})x + ${a}^2 = x^2 + ${mid}x + ${sq}$.`];
      conclusion = `$x^2 + ${mid}x + ${sq}$.`;
      hint = `Remember the middle term: $2ab$. Don't just square the two terms!`;
    }
  } else if (stageId === 38) {
    // Algebraic Fractions: 5 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic % 5;
    const a = prng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    if (subtopicIndex === 0) {
      questionText = `Simplify the algebraic fraction by difference of squares:\n\n$$\\frac{x^2 - ${a * a}}{x - ${a}}$$`;
      correctAnswer = `$x + ${a}$`;
      rawDistractors = [`$x - ${a}$`, `$x^2 - ${a}$`, `$\\frac{x + ${a}}{2}$`];
      given = `Fraction $\\frac{x^2 - ${a * a}}{x - ${a}}$ ($x \\ne ${a}$).`;
      required = `Simplified expression.`;
      method = `Factor numerator $(x - ${a})(x + ${a})$ and cancel common factor $(x - ${a})$.`;
      steps = [
        `$\\frac{(x - ${a})(x + ${a})}{x - ${a}} = x + ${a}$.`,
      ];
      conclusion = `Result is $x + ${a}$.`;
      hint = `Factor the numerator as a difference of squares.`;
    } else if (subtopicIndex === 1) {
      questionText = `Simplify the rational expression:\n\n$$\\frac{x^2 - ${a * a}}{x + ${a}}$$`;
      correctAnswer = `$x - ${a}$`;
      rawDistractors = [`$x + ${a}$`, `$x^2 + ${a}$`, `$x - 1$`];
      given = `Fraction $\\frac{x^2 - ${a * a}}{x + ${a}}$.`;
      required = `Simplified expression.`;
      method = `$\\frac{(x - ${a})(x + ${a})}{x + ${a}} = x - ${a}$.`;
      steps = [`Cancel $(x + ${a})$ to get $x - ${a}$.`];
      conclusion = `Result is $x - ${a}$.`;
      hint = `Factor $x^2 - ${a * a}$ and cancel $(x + ${a})$.`;
    } else if (subtopicIndex === 2) {
      const k = prng.int(2, 6);
      const coeff = k * a;
      questionText = `Simplify the monomial algebraic fraction:\n\n$$\\frac{${coeff}x^3}{${k}x}$$`;
      correctAnswer = `$${a}x^2$`;
      rawDistractors = [`$${a}x^3$`, `$${a}x$`, `$${coeff}x^2$`];
      given = `Fraction $\\frac{${coeff}x^3}{${k}x}$.`;
      required = `Simplified term.`;
      method = `Divide coefficients $\\frac{${coeff}}{${k}} = ${a}$ and subtract exponents $x^{3 - 1} = x^2$.`;
      steps = [`$\\frac{${coeff}}{${k}} = ${a}$ and $\\frac{x^3}{x} = x^2 \\implies ${a}x^2$.`];
      conclusion = `Result is $${a}x^2$.`;
      hint = `Divide the numbers and subtract the exponents of $x$.`;
    } else if (subtopicIndex === 3) {
      const c1 = prng.int(1, 5);
      const c2 = prng.int(2, 6);
      const totalC = c1 + c2;
      questionText = `Add the algebraic fractions with a common denominator:\n\n$$\\frac{${c1 === 1 ? '' : c1}x}{${a}} + \\frac{${c2}x}{${a}}$$`;
      correctAnswer = `$\\frac{${totalC}x}{${a}}$`;
      rawDistractors = [`$\\frac{${totalC}x}{${2 * a}}$`, `$\\frac{${c1 * c2}x}{${a}}$`, `$\\frac{${totalC}x^2}{${a}}$`];
      given = `Fractions $\\frac{${c1 === 1 ? '' : c1}x}{${a}}$ and $\\frac{${c2}x}{${a}}$.`;
      required = `Combined sum.`;
      method = `Add numerators over common denominator: $\\frac{${c1}x + ${c2}x}{${a}} = \\frac{${totalC}x}{${a}}$.`;
      steps = [`$\\frac{${c1}x + ${c2}x}{${a}} = \\frac{${totalC}x}{${a}}$.`];
      conclusion = `Sum is $\\frac{${totalC}x}{${a}}$.`;
      hint = `Denominators are already identical; just add the numerators.`;
    } else {
      const isMinus = prng.pick([true, false]);
      const ansVal = isMinus ? a : -a;
      questionText = `For what real value of $x$ is the algebraic fraction undefined?\n\n$$\\frac{5x + 1}{x ${isMinus ? `- ${a}` : `+ ${a}`}}$$`;
      correctAnswer = `$x = ${ansVal}$`;
      rawDistractors = [`$x = ${-ansVal}$`, `$x = 0$`, `$x = 1$`];
      given = `Fraction $\\frac{5x + 1}{x ${isMinus ? `- ${a}` : `+ ${a}`}}$.`;
      required = `Value making denominator zero.`;
      method = `Division by zero is undefined: set $x ${isMinus ? `- ${a}` : `+ ${a}`} = 0 \\implies x = ${ansVal}$.`;
      steps = [`$x ${isMinus ? `- ${a}` : `+ ${a}`} = 0 \\implies x = ${ansVal}$.`];
      conclusion = `Undefined when $x = ${ansVal}$.`;
      hint = `A fraction is undefined when its denominator equals zero.`;
    }
  } else if (stageId === 39 || stageId === 40) {
    // Simultaneous Equations & Algebra Challenge: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const x = prng.int(1, 5);
    const y = prng.int(1, 5);

    if (subtopicIndex === 0) {
      const eq1 = x + y;
      const eq2 = 2 * x - y;
      questionText = `Solve the system of linear equations for $x$:\n\n$$\\begin{cases} x + y = ${eq1} \\\\ 2x - y = ${eq2} \\end{cases}$$`;
      correctAnswer = `$x = ${x}$`;
      rawDistractors = [`$x = ${x + 1}$`, `$x = ${Math.max(1, x - 1)}$`, `$x = ${y}$`];
      given = `System: $x + y = ${eq1}$, $2x - y = ${eq2}$.`;
      required = `Value of $x$.`;
      method = `Add both equations to eliminate $y$: $3x = ${eq1 + eq2} \\implies x = ${x}$.`;
      steps = [
        `$(x + y) + (2x - y) = ${eq1} + ${eq2} \\implies 3x = ${eq1 + eq2}$.`,
        `$x = \\frac{${eq1 + eq2}}{3} = ${x}$.`,
      ];
      conclusion = `$x = ${x}$.`;
      hint = `Add the two equations together to cancel out the $y$ terms.`;
    } else if (subtopicIndex === 1) {
      const eq1 = x + y;
      const eq2 = x - y;
      questionText = `Solve the system for the value of $y$:\n\n$$\\begin{cases} x + y = ${eq1} \\\\ x - y = ${eq2} \\end{cases}$$`;
      correctAnswer = `$y = ${y}$`;
      const dist = generateNumericalDistractors(y, prng);
      rawDistractors = dist.map(d => `$y = ${d}$`);
      given = `System: $x + y = ${eq1}$, $x - y = ${eq2}$.`;
      required = `Value of $y$.`;
      method = `Subtract the second equation from the first: $2y = ${eq1 - eq2} \\implies y = ${y}$.`;
      steps = [
        `$(x + y) - (x - y) = ${eq1} - ${eq2}$.`,
        `$2y = ${eq1 - eq2} \\implies y = ${y}$.`,
      ];
      conclusion = `$y = ${y}$.`;
      hint = `Subtract the second equation from the first to eliminate $x$.`;
    } else if (subtopicIndex === 2) {
      const k = 2;
      const yVal = k * x;
      const sum = x + yVal;
      questionText = `Solve for $x$ using substitution:\n\n$$\\begin{cases} y = ${k}x \\\\ x + y = ${sum} \\end{cases}$$`;
      correctAnswer = `$x = ${x}$`;
      rawDistractors = [`$x = ${x + 1}$`, `$x = ${Math.max(1, x - 1)}$`, `$x = ${yVal}$`];
      given = `$y = ${k}x$, $x + y = ${sum}$.`;
      required = `Value of $x$.`;
      method = `Substitute $y = ${k}x$ into the second equation: $x + ${k}x = ${sum} \\implies ${k + 1}x = ${sum} \\implies x = ${x}$.`;
      steps = [
        `Substitute $y$: $x + ${k}x = ${sum}$.`,
        `$${k + 1}x = ${sum} \\implies x = ${x}$.`,
      ];
      conclusion = `$x = ${x}$.`;
      hint = `Replace $y$ with $${k}x$ in the second equation.`;
    } else if (subtopicIndex === 3) {
      const adult = prng.pick([8, 10, 12, 14, 15]);
      const child = prng.pick([4, 5, 6, 7]);
      const aCount = prng.int(1, 4);
      const cCount = prng.int(1, 5);
      const totalTickets = aCount + cCount;
      const totalCost = aCount * adult + cCount * child;
      questionText = `An adult ticket costs $\\text{\\$} ${adult}$ and a child ticket costs $\\text{\\$} ${child}$. A group buys $${totalTickets}$ tickets for a total of $\\text{\\$} ${totalCost}$. How many adult tickets were purchased?`;
      correctAnswer = `$${aCount}\\text{ adult ${aCount === 1 ? 'ticket' : 'tickets'}}$`;
      rawDistractors = [
        `$${aCount + 1}\\text{ adult tickets}$`,
        `$${Math.max(1, aCount - 1)}\\text{ adult ${Math.max(1, aCount - 1) === 1 ? 'ticket' : 'tickets'}}$`,
        `$${cCount}\\text{ adult ${cCount === 1 ? 'ticket' : 'tickets'}}$`,
      ];
      given = `Adult price $\\text{\\$} ${adult}$, child price $\\text{\\$} ${child}$, total tickets $${totalTickets}$, total cost $\\text{\\$} ${totalCost}$.`;
      required = `Number of adult tickets.`;
      method = `Let $a$ be adult tickets: $${adult}a + ${child}(${totalTickets} - a) = ${totalCost} \\implies ${adult - child}a + ${child * totalTickets} = ${totalCost} \\implies ${adult - child}a = ${totalCost - child * totalTickets} \\implies a = ${aCount}$.`;
      steps = [
        `Equation: $${adult}a + ${child}(${totalTickets} - a) = ${totalCost}$.`,
        `$${adult - child}a = ${totalCost - child * totalTickets} \\implies a = ${aCount}$.`,
      ];
      conclusion = `They purchased $${aCount}$ adult ${aCount === 1 ? 'ticket' : 'tickets'}.`;
      hint = `Set up an equation with $a$ for adult tickets and $(${totalTickets} - a)$ for child tickets.`;
    } else {
      const r1 = prng.int(1, 4);
      const r2 = prng.int(1, 4);
      const sum = r1 + r2;
      const prod = r1 * r2;
      questionText = `Find the roots of the quadratic equation by factoring:\n\n$$x^2 - ${sum}x + ${prod} = 0$$`;
      correctAnswer = `$x = ${Math.min(r1, r2)} \\text{ or } x = ${Math.max(r1, r2)}$`;
      rawDistractors = [
        `$x = -${r1} \\text{ or } x = -${r2}$`,
        `$x = ${r1 + 1} \\text{ or } x = ${r2 + 1}$`,
        `$x = 0 \\text{ or } x = ${sum}$`,
      ];
      given = `Quadratic $x^2 - ${sum}x + ${prod} = 0$.`;
      required = `Roots of equation.`;
      method = `Factor as $(x - ${r1})(x - ${r2}) = 0$, giving roots $x = ${r1}$ and $x = ${r2}$.`;
      steps = [
        `Factor: $(x - ${r1})(x - ${r2}) = 0$.`,
        `Roots: $x = ${r1}$ and $x = ${r2}$.`,
      ];
      conclusion = `The roots are $x = ${r1}$ and $x = ${r2}$.`;
      hint = `Factor into $(x - p)(x - q) = 0$ and set each factor to zero.`;
    }
  }

  // ==========================================
  // WORLD 5: GEOMETRY & MEASUREMENT (Stages 41-50)
  // ==========================================
  else if (stageId === 41) {
    // Lines & Angles: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const angle = prng.int(25, 75);

    if (subtopicIndex === 0) {
      const comp = 90 - angle;
      questionText = `What is the complement of an angle measuring $${angle}^\\circ$?`;
      correctAnswer = `$${comp}^\\circ$`;
      const supp = 180 - angle;
      rawDistractors = [`$${supp}^\\circ$`, `$${comp + 10}^\\circ$`, `$${Math.max(10, comp - 10)}^\\circ$`];
      given = `Angle measuring $${angle}^\\circ$.`;
      required = `Complementary angle.`;
      method = `Complementary angles add to $90^\\circ$: $\\theta = 90^\\circ - ${angle}^\\circ = ${comp}^\\circ$.`;
      steps = [`$90^\\circ - ${angle}^\\circ = ${comp}^\\circ$.`];
      conclusion = `The complement is $${comp}^\\circ$.`;
      hint = `Complementary angles sum to $90^\\circ$.`;
    } else if (subtopicIndex === 1) {
      const supp = 180 - angle;
      questionText = `What is the supplement of an angle measuring $${angle}^\\circ$?`;
      correctAnswer = `$${supp}^\\circ$`;
      const comp = 90 - angle;
      rawDistractors = [`$${comp}^\\circ$`, `$${supp + 15}^\\circ$`, `$${supp - 15}^\\circ$`];
      given = `Angle measuring $${angle}^\\circ$.`;
      required = `Supplementary angle.`;
      method = `Supplementary angles add to $180^\\circ$: $\\theta = 180^\\circ - ${angle}^\\circ = ${supp}^\\circ$.`;
      steps = [`$180^\\circ - ${angle}^\\circ = ${supp}^\\circ$.`];
      conclusion = `The supplement is $${supp}^\\circ$.`;
      hint = `Supplementary angles sum to $180^\\circ$.`;
    } else if (subtopicIndex === 2) {
      questionText = `Two straight intersecting lines form vertically opposite angles. If one angle measures $${angle}^\\circ$, what is the measure of the angle opposite to it?`;
      correctAnswer = `$${angle}^\\circ$`;
      rawDistractors = [`$${180 - angle}^\\circ$`, `$${90 - angle}^\\circ$`, `$${2 * angle}^\\circ$`];
      given = `One of two vertically opposite angles measures $${angle}^\\circ$.`;
      required = `Opposite angle measure.`;
      method = `Vertically opposite angles are always congruent (equal).`;
      steps = [`Vertically opposite angles are equal: $\\theta = ${angle}^\\circ$.`];
      conclusion = `The measure is $${angle}^\\circ$.`;
      hint = `Vertically opposite angles are always equal.`;
    } else if (subtopicIndex === 3) {
      const k = prng.int(2, 4);
      // angles on a straight line: x + k*x = 180 => (k+1)*x = 180
      const x = Math.round(180 / (k + 1));
      const rest = 180 - x;
      questionText = `Two adjacent angles on a straight line are in the ratio $1 : ${k}$. What is the measure of the smaller angle?`;
      correctAnswer = `$${x}^\\circ$`;
      rawDistractors = [`$${rest}^\\circ$`, `$${x + 10}^\\circ$`, `$${Math.max(10, x - 10)}^\\circ$`];
      given = `Angles on a straight line in ratio $1 : ${k}$.`;
      required = `Smaller angle measure.`;
      method = `Angles on a straight line sum to $180^\\circ$: $x + ${k}x = 180^\\circ \\implies ${k + 1}x = 180^\\circ \\implies x = ${x}^\\circ$.`;
      steps = [`$${k + 1}x = 180^\\circ \\implies x = ${x}^\\circ$.`];
      conclusion = `The smaller angle is $${x}^\\circ$.`;
      hint = `Angles on a straight line add up to $180^\\circ$.`;
    } else {
      questionText = `Two parallel lines are cut by a transversal. If an alternate interior angle measures $${angle}^\\circ$, what is the measure of its corresponding alternate interior angle?`;
      correctAnswer = `$${angle}^\\circ$`;
      rawDistractors = [`$${180 - angle}^\\circ$`, `$${90}^\\circ$`, `$${angle + 20}^\\circ$`];
      given = `Alternate interior angle of $${angle}^\\circ$ between parallel lines.`;
      required = `Alternate interior angle.`;
      method = `Alternate interior angles between parallel lines are congruent (equal).`;
      steps = [`Alternate interior angles are equal: $\\theta = ${angle}^\\circ$.`];
      conclusion = `The angle is $${angle}^\\circ$.`;
      hint = `Parallel lines cut by a transversal create equal alternate interior angles.`;
    }
  } else if (stageId === 42) {
    // Triangles: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const a1 = prng.int(40, 75);
      const a2 = prng.int(35, 75);
      const a3 = 180 - (a1 + a2);
      questionText = `Two angles in a triangle measure $${a1}^\\circ$ and $${a2}^\\circ$. What is the measure of the third angle?`;
      correctAnswer = `$${a3}^\\circ$`;
      const dist = generateNumericalDistractors(a3, prng);
      rawDistractors = dist.map(d => `$${d}^\\circ$`);
      given = `Angles $${a1}^\\circ$ and $${a2}^\\circ$.`;
      required = `Third angle.`;
      method = `Angles in a triangle sum to $180^\\circ$: $180^\\circ - (${a1}^\\circ + ${a2}^\\circ) = ${a3}^\\circ$.`;
      steps = [
        `Sum of known: $${a1}^\\circ + ${a2}^\\circ = ${a1 + a2}^\\circ$.`,
        `Third angle: $180^\\circ - ${a1 + a2}^\\circ = ${a3}^\\circ$.`,
      ];
      conclusion = `The third angle is $${a3}^\\circ$.`;
      hint = `The interior angles of any triangle always add up to $180^\\circ$.`;
    } else if (subtopicIndex === 1) {
      const vertex = prng.pick([40, 50, 70, 80, 100]);
      const baseAngle = (180 - vertex) / 2;
      questionText = `In an isosceles triangle, the vertex angle measures $${vertex}^\\circ$. What is the measure of each base angle?`;
      correctAnswer = `$${baseAngle}^\\circ$`;
      rawDistractors = [`$${180 - vertex}^\\circ$`, `$${vertex}^\\circ$`, `$${baseAngle + 10}^\\circ$`];
      given = `Isosceles triangle with vertex angle $${vertex}^\\circ$.`;
      required = `Each base angle.`;
      method = `Base angles are equal: $\\frac{180^\\circ - ${vertex}^\\circ}{2} = ${baseAngle}^\\circ$.`;
      steps = [
        `Sum of base angles: $180^\\circ - ${vertex}^\\circ = ${180 - vertex}^\\circ$.`,
        `Each base angle: $\\frac{${180 - vertex}^\\circ}{2} = ${baseAngle}^\\circ$.`,
      ];
      conclusion = `Each base angle is $${baseAngle}^\\circ$.`;
      hint = `The two base angles of an isosceles triangle are equal.`;
    } else if (subtopicIndex === 2) {
      const a = prng.int(30, 60);
      const b = prng.int(40, 70);
      const ext = a + b;
      questionText = `In a triangle, two opposite interior angles measure $${a}^\\circ$ and $${b}^\\circ$. What is the measure of the exterior angle adjacent to the third vertex?`;
      correctAnswer = `$${ext}^\\circ$`;
      rawDistractors = [`$${180 - ext}^\\circ$`, `$${ext + 15}^\\circ$`, `$${ext - 15}^\\circ$`];
      given = `Interior opposite angles $${a}^\\circ$ and $${b}^\\circ$.`;
      required = `Exterior angle.`;
      method = `Exterior Angle Theorem: An exterior angle equals the sum of its two opposite interior angles.`;
      steps = [`$${a}^\\circ + ${b}^\\circ = ${ext}^\\circ$.`];
      conclusion = `The exterior angle is $${ext}^\\circ$.`;
      hint = `The exterior angle equals the sum of the two opposite interior angles.`;
    } else if (subtopicIndex === 3) {
      const s = prng.int(5, 18);
      const perim = 3 * s;
      questionText = `An equilateral triangle has a perimeter of $${perim}\\text{ cm}$. What is the length of each side?`;
      correctAnswer = `$${s}\\text{ cm}$`;
      rawDistractors = [`$${s + 2}\\text{ cm}$`, `$${Math.max(1, s - 2)}\\text{ cm}$`, `$${perim}\\text{ cm}$`];
      given = `Equilateral triangle with perimeter $P = ${perim}\\text{ cm}$.`;
      required = `Side length $s$.`;
      method = `An equilateral triangle has 3 equal sides: $s = \\frac{P}{3} = \\frac{${perim}}{3} = ${s}\\text{ cm}$.`;
      steps = [`$s = \\frac{${perim}}{3} = ${s}\\text{ cm}$.`];
      conclusion = `Each side is $${s}\\text{ cm}$.`;
      hint = `Divide the total perimeter by 3.`;
    } else {
      const mode = prng.pick(['interior', 'two_interior', 'exterior', 'perimeter_angle']);
      const side = prng.int(4, 15);
      if (mode === 'two_interior') {
        questionText = `What is the sum of any two interior angles in an equilateral triangle?`;
        correctAnswer = `$120^\\circ$`;
        rawDistractors = [`$60^\\circ$`, `$90^\\circ$`, `$180^\\circ$`];
        given = `Two interior angles of an equilateral triangle.`;
        required = `Sum of the two angles.`;
        method = `Each angle is $60^\\circ$: $60^\\circ + 60^\\circ = 120^\\circ$.`;
        steps = [`$60^\\circ + 60^\\circ = 120^\\circ$.`];
        conclusion = `The sum is $120^\\circ$.`;
        hint = `Each interior angle is $60^\\circ$. Add two of them together.`;
      } else if (mode === 'exterior') {
        questionText = `What is the measure of each exterior angle of any regular equilateral triangle?`;
        correctAnswer = `$120^\\circ$`;
        rawDistractors = [`$60^\\circ$`, `$90^\\circ$`, `$150^\\circ$`];
        given = `Exterior angle of an equilateral triangle.`;
        required = `Exterior angle measure.`;
        method = `Interior and exterior angles form a linear pair: $180^\\circ - 60^\\circ = 120^\\circ$.`;
        steps = [`$180^\\circ - 60^\\circ = 120^\\circ$.`];
        conclusion = `Each exterior angle is $120^\\circ$.`;
        hint = `Subtract the $60^\\circ$ interior angle from $180^\\circ$.`;
      } else if (mode === 'perimeter_angle') {
        questionText = `In an equilateral triangle with side length $${side}\\text{ cm}$, what is the measure of each interior angle?`;
        correctAnswer = `$60^\\circ$`;
        rawDistractors = [`$${side * 10}^\\circ$`, `$90^\\circ$`, `$45^\\circ$`];
        given = `Equilateral triangle with side length $${side}\\text{ cm}$.`;
        required = `Interior angle measure.`;
        method = `The interior angles of all equilateral triangles are always $60^\\circ$, independent of side length.`;
        steps = [`Angle measure is always $\\frac{180^\\circ}{3} = 60^\\circ$.`];
        conclusion = `Each interior angle is $60^\\circ$.`;
        hint = `Side length does not change the angles of an equilateral triangle: they are always $60^\\circ$.`;
      } else {
        questionText = `What is the measure of each interior angle in any equilateral triangle?`;
        correctAnswer = `$60^\\circ$`;
        rawDistractors = [`$90^\\circ$`, `$45^\\circ$`, `$120^\\circ$`];
        given = `Equilateral triangle with 3 equal angles.`;
        required = `Angle measure.`;
        method = `All 3 angles are equal and sum to $180^\\circ$: $\\frac{180^\\circ}{3} = 60^\\circ$.`;
        steps = [`$\\frac{180^\\circ}{3} = 60^\\circ$.`];
        conclusion = `Each angle is $60^\\circ$.`;
        hint = `Divide $180^\\circ$ equally by 3.`;
      }
    }
  } else if (stageId === 43) {
    // Quadrilaterals: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const a1 = prng.int(70, 110);
      const a2 = prng.int(65, 105);
      const a3 = prng.int(75, 115);
      const a4 = 360 - (a1 + a2 + a3);
      questionText = `Three interior angles of a quadrilateral measure $${a1}^\\circ$, $${a2}^\\circ$, and $${a3}^\\circ$. What is the measure of the fourth angle?`;
      correctAnswer = `$${a4}^\\circ$`;
      const dist = generateNumericalDistractors(a4, prng);
      rawDistractors = dist.map(d => `$${d}^\\circ$`);
      given = `Angles $${a1}^\\circ$, $${a2}^\\circ$, and $${a3}^\\circ$.`;
      required = `Fourth interior angle.`;
      method = `The 4 interior angles of any quadrilateral sum to $360^\\circ$.`;
      steps = [
        `Sum of 3 angles: $${a1}^\\circ + ${a2}^\\circ + ${a3}^\\circ = ${a1 + a2 + a3}^\\circ$.`,
        `Fourth angle: $360^\\circ - ${a1 + a2 + a3}^\\circ = ${a4}^\\circ$.`,
      ];
      conclusion = `The fourth angle is $${a4}^\\circ$.`;
      hint = `All quadrilaterals have interior angles adding to $360^\\circ$.`;
    } else if (subtopicIndex === 1) {
      const base = prng.int(6, 15);
      const height = prng.int(4, 12);
      const area = base * height;
      questionText = `Find the area of a parallelogram with base $b = ${base}\\text{ cm}$ and perpendicular height $h = ${height}\\text{ cm}$.`;
      correctAnswer = `$${area}\\text{ cm}^2$`;
      rawDistractors = [`$${2 * (base + height)}\\text{ cm}^2$`, `$${0.5 * area}\\text{ cm}^2$`, `$${area + 10}\\text{ cm}^2$`];
      given = `Parallelogram with $b = ${base}\\text{ cm}$, $h = ${height}\\text{ cm}$.`;
      required = `Area $A$.`;
      method = `Area formula for parallelogram: $A = b \\times h$.`;
      steps = [`$A = ${base} \\times ${height} = ${area}\\text{ cm}^2$.`];
      conclusion = `The area is $${area}\\text{ cm}^2$.`;
      hint = `The area of a parallelogram is simply base $\\times$ height.`;
    } else if (subtopicIndex === 2) {
      const a = prng.int(4, 10);
      const b = prng.int(12, 18);
      const h = prng.int(4, 8);
      const area = 0.5 * (a + b) * h;
      questionText = `Calculate the area of a trapezoid with parallel sides $a = ${a}\\text{ cm}$, $b = ${b}\\text{ cm}$, and height $h = ${h}\\text{ cm}$.`;
      correctAnswer = `$${area}\\text{ cm}^2$`;
      rawDistractors = [`$${(a + b) * h}\\text{ cm}^2$`, `$${area + 8}\\text{ cm}^2$`, `$${Math.max(10, area - 8)}\\text{ cm}^2$`];
      given = `Trapezoid parallel sides $a = ${a}\\text{ cm}$, $b = ${b}\\text{ cm}$, height $h = ${h}\\text{ cm}$.`;
      required = `Area.`;
      method = `Trapezoid area formula: $A = \\frac{a + b}{2} \\times h$.`;
      steps = [
        `Average of bases: $\\frac{${a} + ${b}}{2} = ${0.5 * (a + b)}$.`,
        `Multiply by height: $${0.5 * (a + b)} \\times ${h} = ${area}\\text{ cm}^2$.`,
      ];
      conclusion = `The area is $${area}\\text{ cm}^2$.`;
      hint = `Use $A = \\frac{a + b}{2} \\times h$.`;
    } else if (subtopicIndex === 3) {
      const d1 = prng.pick([6, 8, 10, 12]);
      const d2 = prng.pick([4, 6, 8, 14]);
      const area = 0.5 * d1 * d2;
      questionText = `A rhombus has diagonals of lengths $d_1 = ${d1}\\text{ cm}$ and $d_2 = ${d2}\\text{ cm}$. Find its area.`;
      correctAnswer = `$${area}\\text{ cm}^2$`;
      rawDistractors = [`$${d1 * d2}\\text{ cm}^2$`, `$${d1 + d2}\\text{ cm}^2$`, `$${area + 6}\\text{ cm}^2$`];
      given = `Rhombus with diagonals $d_1 = ${d1}\\text{ cm}$, $d_2 = ${d2}\\text{ cm}$.`;
      required = `Area.`;
      method = `Area of a rhombus: $A = \\frac{1}{2} d_1 d_2$.`;
      steps = [`$A = \\frac{1}{2} \\times ${d1} \\times ${d2} = ${area}\\text{ cm}^2$.`];
      conclusion = `The area is $${area}\\text{ cm}^2$.`;
      hint = `Rhombus area is half the product of its diagonals.`;
    } else {
      const angle = prng.int(55, 85);
      const opp = angle;
      const adj = 180 - angle;
      questionText = `In a parallelogram, one interior angle measures $${angle}^\\circ$. What is the measure of the adjacent consecutive angle?`;
      correctAnswer = `$${adj}^\\circ$`;
      rawDistractors = [`$${opp}^\\circ$`, `$${90}^\\circ$`, `$${adj + 10}^\\circ$`];
      given = `Parallelogram angle $${angle}^\\circ$.`;
      required = `Adjacent angle.`;
      method = `Consecutive angles in a parallelogram are supplementary (sum to $180^\\circ$): $180^\\circ - ${angle}^\\circ = ${adj}^\\circ$.`;
      steps = [`$180^\\circ - ${angle}^\\circ = ${adj}^\\circ$.`];
      conclusion = `The adjacent angle is $${adj}^\\circ$.`;
      hint = `Consecutive angles between parallel lines add to $180^\\circ$.`;
    }
  } else if (stageId === 44) {
    // Polygons: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const n = prng.pick([5, 6, 8, 10, 12]);
    const names: Record<number, string> = { 5: 'pentagon', 6: 'hexagon', 8: 'octagon', 10: 'decagon', 12: 'dodecagon' };

    if (subtopicIndex === 0) {
      const sum = (n - 2) * 180;
      questionText = `What is the sum of the interior angles of a convex $${names[n]}$ ($${n}$ sides)?`;
      correctAnswer = `$${sum}^\\circ$`;
      const dist = generateNumericalDistractors(sum, prng);
      rawDistractors = dist.map(d => `$${d}^\\circ$`);
      given = `Convex polygon with $n = ${n}$ sides.`;
      required = `Interior angle sum.`;
      method = `Apply formula: $S = (n - 2) \\times 180^\\circ$.`;
      steps = [
        `$S = (${n} - 2) \\times 180^\\circ = ${n - 2} \\times 180^\\circ = ${sum}^\\circ$.`,
      ];
      conclusion = `The sum is $${sum}^\\circ$.`;
      hint = `Use the formula $(n - 2) \\times 180^\\circ$.`;
    } else if (subtopicIndex === 1) {
      const regularN = prng.pick([5, 6, 8]);
      const sum = (regularN - 2) * 180;
      const each = sum / regularN;
      questionText = `What is the measure of each interior angle in a regular $${names[regularN]}$?`;
      correctAnswer = `$${each}^\\circ$`;
      rawDistractors = [`$${360 / regularN}^\\circ$`, `$${each + 12}^\\circ$`, `$${each - 12}^\\circ$`];
      given = `Regular $${names[regularN]}$ ($n = ${regularN}$).`;
      required = `Each interior angle.`;
      method = `Each interior angle is $\\frac{(n - 2) \\times 180^\\circ}{n}$.`;
      steps = [
        `Total sum: $(${regularN} - 2) \\times 180^\\circ = ${sum}^\\circ$.`,
        `Divide by $${regularN}$: $\\frac{${sum}^\\circ}{${regularN}} = ${each}^\\circ$.`,
      ];
      conclusion = `Each interior angle is $${each}^\\circ$.`;
      hint = `Divide the total interior angle sum by the number of sides.`;
    } else if (subtopicIndex === 2) {
      questionText = `What is the sum of the exterior angles of ANY convex polygon with $${n}$ sides?`;
      correctAnswer = `$360^\\circ$`;
      rawDistractors = [`$${(n - 2) * 180}^\\circ$`, `$180^\\circ$`, `$${n * 180}^\\circ$`];
      given = `Convex polygon with $n = ${n}$ sides.`;
      required = `Sum of exterior angles.`;
      method = `The sum of exterior angles of any convex polygon is always $360^\\circ$, regardless of side count.`;
      steps = [`Exterior angle sum for any convex polygon is identically $360^\\circ$.`];
      conclusion = `The sum is $360^\\circ$.`;
      hint = `The exterior angles of any polygon always make one full turn ($360^\\circ$).`;
    } else if (subtopicIndex === 3) {
      const regularN = prng.pick([5, 6, 8, 10]);
      const ext = 360 / regularN;
      questionText = `What is the measure of each exterior angle of a regular $${names[regularN]}$ ($${regularN}$ sides)?`;
      correctAnswer = `$${ext}^\\circ$`;
      rawDistractors = [`$${180 - ext}^\\circ$`, `$${ext + 6}^\\circ$`, `$${Math.max(10, ext - 6)}^\\circ$`];
      given = `Regular $${names[regularN]}$ with $n = ${regularN}$.`;
      required = `Each exterior angle.`;
      method = `Each exterior angle is $\\frac{360^\\circ}{n} = \\frac{360^\\circ}{${regularN}} = ${ext}^\\circ$.`;
      steps = [`$\\frac{360^\\circ}{${regularN}} = ${ext}^\\circ$.`];
      conclusion = `Each exterior angle is $${ext}^\\circ$.`;
      hint = `Divide $360^\\circ$ by the number of sides $n$.`;
    } else {
      const diagN = prng.pick([5, 6, 7, 8]);
      const diags = (diagN * (diagN - 3)) / 2;
      questionText = `How many total diagonals does a convex polygon with $${diagN}$ sides have?`;
      correctAnswer = `$${diags}$`;
      rawDistractors = [`$${diagN * (diagN - 3)}$`, `$${diags + 3}$`, `$${Math.max(2, diags - 3)}$`];
      given = `Polygon with $n = ${diagN}$ sides.`;
      required = `Number of diagonals.`;
      method = `Diagonal formula: $D = \\frac{n(n - 3)}{2}$.`;
      steps = [
        `$D = \\frac{${diagN}(${diagN} - 3)}{2} = \\frac{${diagN} \\times ${diagN - 3}}{2} = ${diags}$.`,
      ];
      conclusion = `It has $${diags}$ diagonals.`;
      hint = `Use the formula $D = \\frac{n(n - 3)}{2}$.`;
    }
  } else if (stageId === 45) {
    // Perimeter & Area: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const base = prng.int(6, 20);
      const height = prng.int(4, 16);
      const area = 0.5 * base * height;
      questionText = `Find the area of a triangle with base $b = ${base}\\text{ cm}$ and height $h = ${height}\\text{ cm}$.`;
      correctAnswer = `$${area}\\text{ cm}^2$`;
      const dist = generateNumericalDistractors(area, prng);
      rawDistractors = dist.map(d => `$${d}\\text{ cm}^2$`);
      given = `Base $b = ${base}\\text{ cm}$, height $h = ${height}\\text{ cm}$.`;
      required = `Area.`;
      method = `Area formula: $A = \\frac{1}{2} b h$.`;
      steps = [`$A = \\frac{1}{2} \\times ${base} \\times ${height} = ${area}\\text{ cm}^2$.`];
      conclusion = `The area is $${area}\\text{ cm}^2$.`;
      hint = `Multiply base by height, then divide by 2.`;
    } else if (subtopicIndex === 1) {
      const l = prng.int(8, 25);
      const w = prng.int(4, 15);
      const p = 2 * (l + w);
      questionText = `Find the perimeter of a rectangle with length $l = ${l}\\text{ m}$ and width $w = ${w}\\text{ m}$.`;
      correctAnswer = `$${p}\\text{ m}$`;
      rawDistractors = [`$${l * w}\\text{ m}$`, `$${l + w}\\text{ m}$`, `$${p + 4}\\text{ m}$`];
      given = `Length $l = ${l}\\text{ m}$, width $w = ${w}\\text{ m}$.`;
      required = `Perimeter.`;
      method = `Perimeter formula: $P = 2(l + w)$.`;
      steps = [`$P = 2(${l} + ${w}) = 2(${l + w}) = ${p}\\text{ m}$.`];
      conclusion = `The perimeter is $${p}\\text{ m}$.`;
      hint = `Perimeter is $2 \\times (\\text{length} + \\text{width})$.`;
    } else if (subtopicIndex === 2) {
      const side = prng.int(5, 15);
      const area = side * side;
      questionText = `A square has an area of $${area}\\text{ cm}^2$. What is its perimeter?`;
      const perim = 4 * side;
      correctAnswer = `$${perim}\\text{ cm}$`;
      rawDistractors = [`$${side}\\text{ cm}$`, `$${2 * side}\\text{ cm}$`, `$${perim + 8}\\text{ cm}$`];
      given = `Square area $A = ${area}\\text{ cm}^2$.`;
      required = `Perimeter $P$.`;
      method = `Side length $s = \\sqrt{${area}} = ${side}\\text{ cm}$. Perimeter $P = 4s = 4(${side}) = ${perim}\\text{ cm}$.`;
      steps = [
        `Side: $s = \\sqrt{${area}} = ${side}\\text{ cm}$.`,
        `Perimeter: $P = 4 \\times ${side} = ${perim}\\text{ cm}$.`,
      ];
      conclusion = `The perimeter is $${perim}\\text{ cm}$.`;
      hint = `Take the square root to find side length, then multiply by 4.`;
    } else if (subtopicIndex === 3) {
      const l = prng.int(6, 12);
      const w = prng.int(4, 8);
      const h = prng.int(3, 6);
      // L-shape compound area: rectangle 1 + rectangle 2
      const area1 = l * w;
      const area2 = h * 3;
      const totalArea = area1 + area2;
      questionText = `A compound shape is formed by two non-overlapping rectangles of dimensions $${l}\\text{ cm} \\times ${w}\\text{ cm}$ and $${h}\\text{ cm} \\times 3\\text{ cm}$. What is the total area?`;
      correctAnswer = `$${totalArea}\\text{ cm}^2$`;
      rawDistractors = [`$${area1}\\text{ cm}^2$`, `$${totalArea + 6}\\text{ cm}^2$`, `$${Math.max(10, totalArea - 6)}\\text{ cm}^2$`];
      given = `Two rectangles: $${l} \\times ${w}$ and $${h} \\times 3$.`;
      required = `Total combined area.`;
      method = `Sum individual areas: $A_1 = ${l} \\times ${w} = ${area1}$, $A_2 = ${h} \\times 3 = ${area2}$. Total $= ${area1} + ${area2} = ${totalArea}\\text{ cm}^2$.`;
      steps = [`$${area1} + ${area2} = ${totalArea}\\text{ cm}^2$.`];
      conclusion = `Total area is $${totalArea}\\text{ cm}^2$.`;
      hint = `Add the areas of the two component rectangles together.`;
    } else {
      const p = prng.pick([24, 32, 40, 48]);
      const s = p / 4;
      const a = s * s;
      questionText = `A square garden has a perimeter of $${p}\\text{ m}$. What is its area?`;
      correctAnswer = `$${a}\\text{ m}^2$`;
      rawDistractors = [`$${p}\\text{ m}^2$`, `$${2 * p}\\text{ m}^2$`, `$${a - 10}\\text{ m}^2$`];
      given = `Square perimeter $P = ${p}\\text{ m}$.`;
      required = `Area $A$.`;
      method = `Side $s = \\frac{P}{4} = ${s}\\text{ m}$. Area $A = s^2 = ${s}^2 = ${a}\\text{ m}^2$.`;
      steps = [
        `Side: $s = \\frac{${p}}{4} = ${s}\\text{ m}$.`,
        `Area: $A = ${s}^2 = ${a}\\text{ m}^2$.`,
      ];
      conclusion = `The area is $${a}\\text{ m}^2$.`;
      hint = `Divide perimeter by 4 to get side length, then square it.`;
    }
  } else if (stageId === 46) {
    // Circles & Sectors: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;
    const r = prng.int(3, 12);

    if (subtopicIndex === 0) {
      questionText = `What is the exact circumference of a circle with radius $r = ${r}\\text{ cm}$?`;
      correctAnswer = `$${2 * r}\\pi\\text{ cm}$`;
      rawDistractors = [`$${r * r}\\pi\\text{ cm}$`, `$${r}\\pi\\text{ cm}$`, `$${4 * r}\\pi\\text{ cm}$`];
      given = `Radius $r = ${r}\\text{ cm}$.`;
      required = `Circumference $C$.`;
      method = `Formula: $C = 2\\pi r$.`;
      steps = [`$C = 2 \\times \\pi \\times ${r} = ${2 * r}\\pi\\text{ cm}$.`];
      conclusion = `The circumference is $${2 * r}\\pi\\text{ cm}$.`;
      hint = `Circumference formula is $C = 2\\pi r$.`;
    } else if (subtopicIndex === 1) {
      questionText = `Find the exact area of a circle with radius $r = ${r}\\text{ cm}$.`;
      correctAnswer = `$${r * r}\\pi\\text{ cm}^2$`;
      rawDistractors = [`$${2 * r}\\pi\\text{ cm}^2$`, `$${2 * r * r}\\pi\\text{ cm}^2$`, `$${(r + 1) * (r + 1)}\\pi\\text{ cm}^2$`];
      given = `Radius $r = ${r}\\text{ cm}$.`;
      required = `Area $A$.`;
      method = `Formula: $A = \\pi r^2$.`;
      steps = [`$A = \\pi (${r})^2 = ${r * r}\\pi\\text{ cm}^2$.`];
      conclusion = `The area is $${r * r}\\pi\\text{ cm}^2$.`;
      hint = `Circle area formula is $A = \\pi r^2$.`;
    } else if (subtopicIndex === 2) {
      const d = 2 * r;
      questionText = `A circle has a diameter of $d = ${d}\\text{ cm}$. What is its area in terms of $\\pi$?`;
      correctAnswer = `$${r * r}\\pi\\text{ cm}^2$`;
      rawDistractors = [`$${d * d}\\pi\\text{ cm}^2$`, `$${d}\\pi\\text{ cm}^2$`, `$${2 * d}\\pi\\text{ cm}^2$`];
      given = `Diameter $d = ${d}\\text{ cm}$.`;
      required = `Area in terms of $\\pi$.`;
      method = `Radius is half the diameter: $r = \\frac{${d}}{2} = ${r}\\text{ cm}$. Area $A = \\pi r^2 = ${r * r}\\pi\\text{ cm}^2$.`;
      steps = [
        `Radius: $r = \\frac{${d}}{2} = ${r}\\text{ cm}$.`,
        `Area: $A = \\pi (${r})^2 = ${r * r}\\pi\\text{ cm}^2$.`,
      ];
      conclusion = `The area is $${r * r}\\pi\\text{ cm}^2$.`;
      hint = `Halve the diameter first to get the radius, then square it and multiply by $\\pi$.`;
    } else if (subtopicIndex === 3) {
      // Semicircle area
      const evenR = 2 * prng.int(2, 6);
      const halfArea = (evenR * evenR) / 2;
      questionText = `Find the exact area of a semicircle with radius $r = ${evenR}\\text{ cm}$.`;
      correctAnswer = `$${halfArea}\\pi\\text{ cm}^2$`;
      rawDistractors = [`$${evenR * evenR}\\pi\\text{ cm}^2$`, `$${evenR}\\pi\\text{ cm}^2$`, `$${2 * halfArea}\\pi\\text{ cm}^2$`];
      given = `Semicircle with radius $r = ${evenR}\\text{ cm}$.`;
      required = `Semicircle area.`;
      method = `A semicircle is half of a full circle: $A = \\frac{1}{2} \\pi r^2 = \\frac{1}{2} \\pi (${evenR})^2 = ${halfArea}\\pi\\text{ cm}^2$.`;
      steps = [`$A = \\frac{1}{2} \\pi (${evenR * evenR}) = ${halfArea}\\pi\\text{ cm}^2$.`];
      conclusion = `The area is $${halfArea}\\pi\\text{ cm}^2$.`;
      hint = `Calculate full circle area and divide by 2.`;
    } else {
      // Arc length for quarter circle (90 degrees)
      const fourR = 4 * prng.int(1, 4);
      const arc = fourR / 2;
      questionText = `A sector has a central angle of $90^\\circ$ in a circle of radius $r = ${fourR}\\text{ cm}$. What is the exact length of its curved arc?`;
      correctAnswer = `$${arc}\\pi\\text{ cm}$`;
      rawDistractors = [`$${2 * fourR}\\pi\\text{ cm}$`, `$${fourR}\\pi\\text{ cm}$`, `$${arc / 2}\\pi\\text{ cm}$`];
      given = `Angle $\\theta = 90^\\circ$, radius $r = ${fourR}\\text{ cm}$.`;
      required = `Arc length.`;
      method = `Arc length $L = \\frac{90^\\circ}{360^\\circ} \\times 2\\pi r = \\frac{1}{4} (2\\pi \\times ${fourR}) = ${arc}\\pi\\text{ cm}$.`;
      steps = [
        `Fraction: $\\frac{90^\\circ}{360^\\circ} = \\frac{1}{4}$.`,
        `Arc: $\\frac{1}{4} \\times 2\\pi (${fourR}) = ${arc}\\pi\\text{ cm}$.`,
      ];
      conclusion = `The arc length is $${arc}\\pi\\text{ cm}$.`;
      hint = `A $90^\\circ$ sector represents $\\frac{1}{4}$ of the full circle's circumference.`;
    }
  } else if (stageId === 47) {
    // 3D Shapes & Surface Area: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const s = prng.int(3, 10);
      const sa = 6 * s * s;
      questionText = `Find the total surface area of a cube with edge length $s = ${s}\\text{ cm}$.`;
      correctAnswer = `$${sa}\\text{ cm}^2$`;
      rawDistractors = [`$${s * s * s}\\text{ cm}^2$`, `$${4 * s * s}\\text{ cm}^2$`, `$${sa + 12}\\text{ cm}^2$`];
      given = `Cube side $s = ${s}\\text{ cm}$.`;
      required = `Total surface area.`;
      method = `A cube has 6 congruent square faces: $A = 6s^2$.`;
      steps = [`$A = 6 \\times ${s}^2 = 6 \\times ${s * s} = ${sa}\\text{ cm}^2$.`];
      conclusion = `The surface area is $${sa}\\text{ cm}^2$.`;
      hint = `Multiply the area of one face ($s^2$) by 6.`;
    } else if (subtopicIndex === 1) {
      const l = prng.int(3, 8);
      const w = prng.int(2, 6);
      const h = prng.int(2, 5);
      const sa = 2 * (l * w + l * h + w * h);
      questionText = `Find the total surface area of a rectangular prism with dimensions $l = ${l}\\text{ cm}$, $w = ${w}\\text{ cm}$, and $h = ${h}\\text{ cm}$.`;
      correctAnswer = `$${sa}\\text{ cm}^2$`;
      rawDistractors = [`$${l * w * h}\\text{ cm}^2$`, `$${sa / 2}\\text{ cm}^2$`, `$${sa + 10}\\text{ cm}^2$`];
      given = `Prism with $l = ${l}$, $w = ${w}$, $h = ${h}$.`;
      required = `Surface area.`;
      method = `Formula: $A = 2(lw + lh + wh)$.`;
      steps = [
        `Pairs: $lw = ${l * w}$, $lh = ${l * h}$, $wh = ${w * h}$.`,
        `Sum: ${l * w} + ${l * h} + ${w * h} = ${l * w + l * h + w * h}$.`,
        `$2 \\times (${l * w + l * h + w * h}) = ${sa}\\text{ cm}^2$.`,
      ];
      conclusion = `Total surface area is $${sa}\\text{ cm}^2$.`;
      hint = `Add the areas of the 3 pairs of opposite rectangular faces.`;
    } else if (subtopicIndex === 2) {
      // Euler's formula: V - E + F = 2
      const solid = prng.pick([
        { name: 'cube', v: 8, e: 12, f: 6 },
        { name: 'triangular prism', v: 6, e: 9, f: 5 },
        { name: 'square pyramid', v: 5, e: 8, f: 5 },
        { name: 'octahedron', v: 6, e: 12, f: 8 },
      ]);
      questionText = `According to Euler's formula ($V - E + F = 2$), how many edges ($E$) does a polyhedron have if it has $V = ${solid.v}$ vertices and $F = ${solid.f}$ faces?`;
      correctAnswer = `$${solid.e}$`;
      rawDistractors = [`$${solid.e + 2}$`, `$${Math.max(4, solid.e - 2)}$`, `$${solid.v + solid.f}$`];
      given = `Polyhedron with $V = ${solid.v}$ vertices, $F = ${solid.f}$ faces.`;
      required = `Number of edges $E$.`;
      method = `Euler's formula: $V - E + F = 2 \\implies E = V + F - 2$.`;
      steps = [`$E = ${solid.v} + ${solid.f} - 2 = ${solid.v + solid.f} - 2 = ${solid.e}$.`];
      conclusion = `It has $${solid.e}$ edges.`;
      hint = `Rearrange Euler's formula to solve for $E$: $E = V + F - 2$.`;
    } else if (subtopicIndex === 3) {
      const r = prng.int(2, 6);
      const h = prng.int(4, 10);
      const lateral = 2 * r * h;
      questionText = `What is the exact lateral (curved) surface area of a cylinder with radius $r = ${r}\\text{ cm}$ and height $h = ${h}\\text{ cm}$?`;
      correctAnswer = `$${lateral}\\pi\\text{ cm}^2$`;
      rawDistractors = [`$${r * r * h}\\pi\\text{ cm}^2$`, `$${2 * r * r}\\pi\\text{ cm}^2$`, `$${(lateral / 2)}\\pi\\text{ cm}^2$`];
      given = `Cylinder radius $r = ${r}\\text{ cm}$, height $h = ${h}\\text{ cm}$.`;
      required = `Lateral area $A_L$.`;
      method = `Lateral area of cylinder: $A_L = 2\\pi r h$.`;
      steps = [`$A_L = 2\\pi (${r})(${h}) = ${lateral}\\pi\\text{ cm}^2$.`];
      conclusion = `The lateral area is $${lateral}\\pi\\text{ cm}^2$.`;
      hint = `Curved surface area equals the circumference times height: $2\\pi r h$.`;
    } else {
      const solids = [
        { name: 'triangular pyramid (tetrahedron)', faces: 4, edges: 6, vertices: 4, desc: '1 triangular base and 3 triangular sides' },
        { name: 'rectangular pyramid', faces: 5, edges: 8, vertices: 5, desc: '1 rectangular base and 4 triangular sides' },
        { name: 'pentagonal pyramid', faces: 6, edges: 10, vertices: 6, desc: '1 pentagonal base and 5 triangular sides' },
        { name: 'hexagonal pyramid', faces: 7, edges: 12, vertices: 7, desc: '1 hexagonal base and 6 triangular sides' },
        { name: 'triangular prism', faces: 5, edges: 9, vertices: 6, desc: '2 triangular bases and 3 rectangular sides' },
        { name: 'rectangular prism (cuboid)', faces: 6, edges: 12, vertices: 8, desc: '6 rectangular faces' },
        { name: 'pentagonal prism', faces: 7, edges: 15, vertices: 10, desc: '2 pentagonal bases and 5 rectangular sides' },
      ];
      const sol = prng.pick(solids);
      const askProp = prng.pick(['faces', 'edges', 'vertices'] as const);
      const count = sol[askProp];
      questionText = `How many total ${askProp} does a ${sol.name} have?`;
      correctAnswer = `$${count}\\text{ ${askProp}}$`;
      rawDistractors = [
        `$${count + 2}\\text{ ${askProp}}$`,
        `$${Math.max(3, count - 1)}\\text{ ${askProp}}$`,
        `$${count + (askProp === 'edges' ? 4 : 1)}\\text{ ${askProp}}$`,
      ];
      given = `3D polyhedron: ${sol.name}.`;
      required = `Total ${askProp} count.`;
      method = `For a ${sol.name} (${sol.desc}): total count of ${askProp} is $${count}$.`;
      steps = [`A ${sol.name} has $${sol.faces}$ faces, $${sol.edges}$ edges, and $${sol.vertices}$ vertices.`];
      conclusion = `It has $${count}$ ${askProp}.`;
      hint = `Consider the base shape and how the lateral faces or sides connect.`;
    }
  } else if (stageId === 48) {
    // Pythagorean Theorem: 5 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic % 5;
    const baseTriples = [
      [3, 4, 5],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
      [9, 40, 41],
      [12, 35, 37],
      [20, 21, 29],
    ];
    const scale = prng.pick([1, 2, 3, 4]);
    const baseT = prng.pick(baseTriples);
    const triple = [baseT[0] * scale, baseT[1] * scale, baseT[2] * scale];
    const unit = prng.pick(['\\text{ cm}', '\\text{ m}', '\\text{ mm}', '\\text{ ft}']);

    if (subtopicIndex === 0) {
      questionText = `In a right-angled triangle, the perpendicular legs measure $${triple[0]}${unit}$ and $${triple[1]}${unit}$. Find the length of the hypotenuse $c$.`;
      correctAnswer = `$${triple[2]}${unit}$`;
      rawDistractors = [`$${triple[0] + triple[1]}${unit}$`, `$${triple[2] + scale}${unit}$`, `$${Math.max(1, triple[2] - scale)}${unit}$`];
      given = `Legs $a = ${triple[0]}$, $b = ${triple[1]}$.`;
      required = `Hypotenuse $c$.`;
      method = `Pythagorean theorem: $c = \\sqrt{a^2 + b^2}$.`;
      steps = [
        `$c^2 = ${triple[0]}^2 + ${triple[1]}^2 = ${triple[0] * triple[0]} + ${triple[1] * triple[1]} = ${triple[2] * triple[2]}$.`,
        `$c = \\sqrt{${triple[2] * triple[2]}} = ${triple[2]}${unit}$.`,
      ];
      conclusion = `Hypotenuse is $${triple[2]}${unit}$.`;
      hint = `Use $a^2 + b^2 = c^2$.`;
    } else if (subtopicIndex === 1) {
      questionText = `In a right triangle, the hypotenuse is $c = ${triple[2]}${unit}$ and one leg is $a = ${triple[0]}${unit}$. What is the length of the other leg $b$?`;
      correctAnswer = `$${triple[1]}${unit}$`;
      rawDistractors = [`$${triple[2] - triple[0]}${unit}$`, `$${triple[1] + scale * 2}${unit}$`, `$${Math.max(1, triple[1] - scale * 2)}${unit}$`];
      given = `Hypotenuse $c = ${triple[2]}$, leg $a = ${triple[0]}$.`;
      required = `Leg $b$.`;
      method = `Rearrange Pythagorean theorem: $b = \\sqrt{c^2 - a^2}$.`;
      steps = [
        `$b^2 = ${triple[2]}^2 - ${triple[0]}^2 = ${triple[2] * triple[2]} - ${triple[0] * triple[0]} = ${triple[1] * triple[1]}$.`,
        `$b = \\sqrt{${triple[1] * triple[1]}} = ${triple[1]}${unit}$.`,
      ];
      conclusion = `The leg length is $${triple[1]}${unit}$.`;
      hint = `Subtract the square of the known leg from the square of the hypotenuse.`;
    } else if (subtopicIndex === 2) {
      const w = triple[0];
      const h = triple[1];
      const diag = triple[2];
      questionText = `A rectangular screen has a width of $${w}${unit}$ and a height of $${h}${unit}$. What is the diagonal length of the screen?`;
      correctAnswer = `$${diag}${unit}$`;
      rawDistractors = [`$${w + h}\\text{ inches}$`, `$${diag + 2}\\text{ inches}$`, `$${diag - 2}\\text{ inches}$`];
      given = `Rectangle dimensions $w = ${w}$, $h = ${h}$.`;
      required = `Diagonal length $d$.`;
      method = `Diagonal forms a right triangle with width and height: $d = \\sqrt{w^2 + h^2}$.`;
      steps = [`$d = \\sqrt{${w}^2 + ${h}^2} = \\sqrt{${diag * diag}} = ${diag}\\text{ inches}$.`];
      conclusion = `The diagonal is $${diag}\\text{ inches}$.`;
      hint = `The diagonal of a rectangle is the hypotenuse of a right triangle.`;
    } else if (subtopicIndex === 3) {
      const dx = triple[0];
      const dy = triple[1];
      const dist = triple[2];
      questionText = `Find the distance between the origin $(0, 0)$ and the point $(${dx}, ${dy})$.`;
      correctAnswer = `$${dist}$`;
      rawDistractors = [`$${dx + dy}$`, `$${dist + 1}$`, `$${dist - 1}$`];
      given = `Points $(0, 0)$ and $(${dx}, ${dy})$.`;
      required = `Distance $d$.`;
      method = `Distance formula: $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} = \\sqrt{${dx}^2 + ${dy}^2} = ${dist}$.`;
      steps = [`$d = \\sqrt{${dx}^2 + ${dy}^2} = \\sqrt{${dist * dist}} = ${dist}$.`];
      conclusion = `The distance is $${dist}$.`;
      hint = `Use the distance formula $d = \\sqrt{\\Delta x^2 + \\Delta y^2}$.`;
    } else {
      const targetHyp = triple[2];
      questionText = `Which of the following triples of side lengths forms a valid right-angled triangle with hypotenuse $c = ${targetHyp}$?`;
      correctAnswer = `$${triple[0]}, ${triple[1]}, ${triple[2]}$`;
      rawDistractors = [
        `$${triple[0]}, ${triple[1]}, ${triple[2] + 1}$`,
        `$${triple[0] + 1}, ${triple[1]}, ${triple[2]}$`,
        `$${triple[0]}, ${triple[1] + 1}, ${triple[2] - 1}$`,
      ];
      given = `Sets of 3 side lengths.`;
      required = `Valid Pythagorean triple.`;
      method = `Verify $a^2 + b^2 = c^2$: $${triple[0]}^2 + ${triple[1]}^2 = ${triple[0] * triple[0]} + ${triple[1] * triple[1]} = ${triple[2] * triple[2]} = ${triple[2]}^2$.`;
      steps = [`$${triple[0]}^2 + ${triple[1]}^2 = ${triple[2]}^2$ holds true.`];
      conclusion = `$${triple[0]}, ${triple[1]}, ${triple[2]}$ forms a right triangle.`;
      hint = `Check which triple satisfies $a^2 + b^2 = c^2$.`;
    }
  } else if (stageId === 49) {
    // Volume of Solids: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const s = prng.int(3, 8);
      const v = s * s * s;
      questionText = `Find the volume of a cube with edge length $s = ${s}\\text{ cm}$.`;
      correctAnswer = `$${v}\\text{ cm}^3$`;
      rawDistractors = [`$${6 * s * s}\\text{ cm}^3$`, `$${3 * s}\\text{ cm}^3$`, `$${v + 15}\\text{ cm}^3$`];
      given = `Cube edge $s = ${s}\\text{ cm}$.`;
      required = `Volume $V$.`;
      method = `Volume formula: $V = s^3$.`;
      steps = [`$V = (${s})^3 = ${s} \\times ${s} \\times ${s} = ${v}\\text{ cm}^3$.`];
      conclusion = `The volume is $${v}\\text{ cm}^3$.`;
      hint = `Cube the side length: $V = s^3$.`;
    } else if (subtopicIndex === 1) {
      const l = prng.int(4, 9);
      const w = prng.int(3, 6);
      const h = prng.int(2, 5);
      const v = l * w * h;
      questionText = `Calculate the volume of a rectangular prism with length $l = ${l}\\text{ cm}$, width $w = ${w}\\text{ cm}$, and height $h = ${h}\\text{ cm}$.`;
      correctAnswer = `$${v}\\text{ cm}^3$`;
      const dist = generateNumericalDistractors(v, prng);
      rawDistractors = dist.map(d => `$${d}\\text{ cm}^3$`);
      given = `Dimensions $l = ${l}$, $w = ${w}$, $h = ${h}$.`;
      required = `Volume $V$.`;
      method = `Formula: $V = l \\times w \\times h$.`;
      steps = [`$V = ${l} \\times ${w} \\times ${h} = ${v}\\text{ cm}^3$.`];
      conclusion = `The volume is $${v}\\text{ cm}^3$.`;
      hint = `Multiply length $\\times$ width $\\times$ height.`;
    } else if (subtopicIndex === 2) {
      const r = prng.int(2, 6);
      const h = prng.int(3, 8);
      const vCoeff = r * r * h;
      questionText = `What is the exact volume of a cylinder with base radius $r = ${r}\\text{ cm}$ and height $h = ${h}\\text{ cm}$?`;
      correctAnswer = `$${vCoeff}\\pi\\text{ cm}^3$`;
      rawDistractors = [`$${2 * r * h}\\pi\\text{ cm}^3$`, `$${r * h}\\pi\\text{ cm}^3$`, `$${2 * vCoeff}\\pi\\text{ cm}^3$`];
      given = `Cylinder radius $r = ${r}\\text{ cm}$, height $h = ${h}\\text{ cm}$.`;
      required = `Volume in terms of $\\pi$.`;
      method = `Cylinder volume: $V = \\pi r^2 h$.`;
      steps = [`$V = \\pi (${r})^2 (${h}) = \\pi (${r * r}) (${h}) = ${vCoeff}\\pi\\text{ cm}^3$.`];
      conclusion = `The volume is $${vCoeff}\\pi\\text{ cm}^3$.`;
      hint = `Multiply base area ($\\pi r^2$) by height.`;
    } else if (subtopicIndex === 3) {
      const r = prng.pick([3, 6, 9]);
      const h = prng.pick([4, 5, 8]);
      const coneV = (r * r * h) / 3;
      questionText = `Find the exact volume of a cone with radius $r = ${r}\\text{ cm}$ and perpendicular height $h = ${h}\\text{ cm}$.`;
      correctAnswer = `$${coneV}\\pi\\text{ cm}^3$`;
      rawDistractors = [`$${r * r * h}\\pi\\text{ cm}^3$`, `$${2 * coneV}\\pi\\text{ cm}^3$`, `$${coneV / 2}\\pi\\text{ cm}^3$`];
      given = `Cone with $r = ${r}\\text{ cm}$, $h = ${h}\\text{ cm}$.`;
      required = `Volume in terms of $\\pi$.`;
      method = `Cone volume is one-third of cylinder: $V = \\frac{1}{3} \\pi r^2 h$.`;
      steps = [`$V = \\frac{1}{3} \\pi (${r})^2 (${h}) = \\frac{${r * r * h}}{3}\\pi = ${coneV}\\pi\\text{ cm}^3$.`];
      conclusion = `The volume is $${coneV}\\pi\\text{ cm}^3$.`;
      hint = `A cone's volume is $\\frac{1}{3} \\pi r^2 h$.`;
    } else {
      const r = prng.pick([3, 6]);
      const sphereV = (4 * Math.pow(r, 3)) / 3;
      questionText = `What is the exact volume of a sphere with radius $r = ${r}\\text{ cm}$?`;
      correctAnswer = `$${sphereV}\\pi\\text{ cm}^3$`;
      rawDistractors = [`$${4 * r * r}\\pi\\text{ cm}^3$`, `$${r * r * r}\\pi\\text{ cm}^3$`, `$${sphereV / 2}\\pi\\text{ cm}^3$`];
      given = `Sphere with radius $r = ${r}\\text{ cm}$.`;
      required = `Volume.`;
      method = `Sphere volume formula: $V = \\frac{4}{3}\\pi r^3$.`;
      steps = [`$V = \\frac{4}{3}\\pi (${r})^3 = \\frac{4 \\times ${r * r * r}}{3}\\pi = ${sphereV}\\pi\\text{ cm}^3$.`];
      conclusion = `The volume is $${sphereV}\\pi\\text{ cm}^3$.`;
      hint = `Use the sphere volume formula $V = \\frac{4}{3}\\pi r^3$.`;
    }
  } else if (stageId === 50) {
    // Geometry Master Challenge: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const k = prng.int(2, 4);
      const origArea = prng.int(6, 20);
      const newArea = origArea * k * k;
      questionText = `Two similar polygons have a linear scale factor of $k = ${k}$. If the smaller polygon has an area of $${origArea}\\text{ cm}^2$, what is the area of the larger polygon?`;
      correctAnswer = `$${newArea}\\text{ cm}^2$`;
      rawDistractors = [`$${origArea * k}\\text{ cm}^2$`, `$${origArea * Math.pow(k, 3)}\\text{ cm}^2$`, `$${newArea + 8}\\text{ cm}^2$`];
      given = `Scale factor $k = ${k}$, original area $= ${origArea}\\text{ cm}^2$.`;
      required = `New area.`;
      method = `Area scales by $k^2$: $A_2 = A_1 \\times k^2 = ${origArea} \\times ${k * k} = ${newArea}\\text{ cm}^2$.`;
      steps = [
        `Area factor: $k^2 = ${k}^2 = ${k * k}$.`,
        `New area: $${origArea} \\times ${k * k} = ${newArea}\\text{ cm}^2$.`,
      ];
      conclusion = `The area is $${newArea}\\text{ cm}^2$.`;
      hint = `Area scales by the square of the linear scale factor: $k^2$.`;
    } else if (subtopicIndex === 1) {
      const k = prng.int(2, 3);
      const origVol = prng.int(4, 12);
      const newVol = origVol * Math.pow(k, 3);
      questionText = `Two similar geometric solids have a linear scale factor of $k = ${k}$. If the smaller solid has a volume of $${origVol}\\text{ cm}^3$, what is the volume of the larger solid?`;
      correctAnswer = `$${newVol}\\text{ cm}^3$`;
      rawDistractors = [`$${origVol * k}\\text{ cm}^3$`, `$${origVol * k * k}\\text{ cm}^3$`, `$${newVol + 10}\\text{ cm}^3$`];
      given = `Scale factor $k = ${k}$, original volume $= ${origVol}\\text{ cm}^3$.`;
      required = `Scaled volume.`;
      method = `Volume scales by the cube of the scale factor: $V_2 = V_1 \\times k^3 = ${origVol} \\times ${k * k * k} = ${newVol}\\text{ cm}^3$.`;
      steps = [
        `Volume factor: $k^3 = ${k}^3 = ${k * k * k}$.`,
        `New volume: $${origVol} \\times ${k * k * k} = ${newVol}\\text{ cm}^3$.`,
      ];
      conclusion = `The scaled volume is $${newVol}\\text{ cm}^3$.`;
      hint = `Volume scales with $k^3$, not $k$ or $k^2$.`;
    } else if (subtopicIndex === 2) {
      // Shaded region: Square minus inscribed circle
      const side = 2 * prng.int(3, 7);
      const r = side / 2;
      const sqArea = side * side;
      const circAreaCoeff = r * r;
      questionText = `A circle of radius $r = ${r}\\text{ cm}$ is inscribed inside a square of side $s = ${side}\\text{ cm}$. What is the exact area of the region outside the circle but inside the square?`;
      correctAnswer = `$${sqArea} - ${circAreaCoeff}\\pi\\text{ cm}^2$`;
      rawDistractors = [
        `$${circAreaCoeff}\\pi - ${sqArea}\\text{ cm}^2$`,
        `$${sqArea} - ${2 * r}\\pi\\text{ cm}^2$`,
        `$${sqArea / 2}\\text{ cm}^2$`,
      ];
      given = `Square of side $${side}\\text{ cm}$, inscribed circle radius $r = ${r}\\text{ cm}$.`;
      required = `Area of region between square and circle.`;
      method = `Subtract circle area from square area: $\\text{Area} = s^2 - \\pi r^2 = ${side}^2 - \\pi (${r})^2 = ${sqArea} - ${circAreaCoeff}\\pi$.`;
      steps = [`$A_{\\text{square}} = ${sqArea}$, $A_{\\text{circle}} = ${circAreaCoeff}\\pi \\implies ${sqArea} - ${circAreaCoeff}\\pi\\text{ cm}^2$.`];
      conclusion = `The area is $${sqArea} - ${circAreaCoeff}\\pi\\text{ cm}^2$.`;
      hint = `Subtract the circle's area from the total area of the square.`;
    } else if (subtopicIndex === 3) {
      // 3D space diagonal of rectangular box
      const triples3D = [
        [1, 2, 2, 3],
        [2, 3, 6, 7],
        [1, 4, 8, 9],
        [4, 4, 7, 9],
        [2, 6, 9, 11],
        [6, 6, 7, 11],
        [2, 10, 11, 15],
      ];
      const [l, w, h, diag] = prng.pick(triples3D);
      questionText = `A rectangular box has dimensions $${l}\\text{ m} \\times ${w}\\text{ m} \\times ${h}\\text{ m}$. What is the length of the longest rod that can fit completely inside the box (the space diagonal)?`;
      correctAnswer = `$${diag}\\text{ m}$`;
      rawDistractors = [
        `$${diag + 2}\\text{ m}$`,
        `$${l + w + h}\\text{ m}$`,
        `$${Math.max(1, diag - 2)}\\text{ m}$`,
      ];
      given = `Box dimensions $${l}, ${w}, ${h}$.`;
      required = `Space diagonal $d$.`;
      method = `3D Pythagorean theorem: $d = \\sqrt{l^2 + w^2 + h^2} = \\sqrt{${l}^2 + ${w}^2 + ${h}^2} = \\sqrt{${l * l + w * w + h * h}} = ${diag}\\text{ m}$.`;
      steps = [`$d = \\sqrt{${l * l} + ${w * w} + ${h * h}} = \\sqrt{${diag * diag}} = ${diag}\\text{ m}$.`];
      conclusion = `The diagonal length is $${diag}\\text{ m}$.`;
      hint = `Extend the Pythagorean theorem to 3 dimensions: $d = \\sqrt{l^2 + w^2 + h^2}$.`;
    } else {
      // Ladder against wall
      const ladderTriples = [
        [5, 3, 4],
        [10, 6, 8],
        [13, 5, 12],
        [15, 9, 12],
        [17, 8, 15],
        [20, 12, 16],
        [25, 7, 24],
        [26, 10, 24],
      ];
      const [ladder, wallDist, height] = prng.pick(ladderTriples);
      questionText = `A $${ladder}\\text{ m}$ ladder leans against a vertical wall. If the foot of the ladder is $${wallDist}\\text{ m}$ from the base of the wall, how high up the wall does the ladder reach?`;
      correctAnswer = `$${height}\\text{ m}$`;
      rawDistractors = [
        `$${height + 2}\\text{ m}$`,
        `$${Math.max(1, height - 2)}\\text{ m}$`,
        `$${ladder - wallDist}\\text{ m}$`,
      ];
      given = `Ladder length $c = ${ladder}\\text{ m}$, base distance $a = ${wallDist}\\text{ m}$.`;
      required = `Height on wall $b$.`;
      method = `Pythagorean theorem: $b = \\sqrt{c^2 - a^2} = \\sqrt{${ladder}^2 - ${wallDist}^2} = \\sqrt{${ladder * ladder - wallDist * wallDist}} = ${height}\\text{ m}$.`;
      steps = [`$b = \\sqrt{${ladder * ladder} - ${wallDist * wallDist}} = \\sqrt{${height * height}} = ${height}\\text{ m}$.`];
      conclusion = `The ladder reaches $${height}\\text{ m}$ up the wall.`;
      hint = `The ladder is the hypotenuse; find the missing leg using $b = \\sqrt{c^2 - a^2}$.`;
    }
  }

  // ==========================================
  // WORLD 6: STATISTICS & PROBABILITY (Stages 51-60)
  // ==========================================
  else if (stageId === 51 || stageId === 52 || stageId === 53) {
    // Data Handling & Representation: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const total = prng.pick([36, 72, 120, 180, 360]);
      const freq = prng.pick([9, 18, 30, 45]);
      const angle = (freq / total) * 360;
      questionText = `In a pie chart representing $${total}$ students, $${freq}$ students chose Mathematics as their favorite subject. What central angle represents this sector?`;
      correctAnswer = `$${angle}^\\circ$`;
      const dist = generateNumericalDistractors(angle, prng);
      rawDistractors = dist.map(d => `$${d}^\\circ$`);
      given = `Total frequency $N = ${total}$, category frequency $f = ${freq}$.`;
      required = `Sector angle $\\theta$.`;
      method = `Sector angle formula: $\\theta = \\frac{f}{N} \\times 360^\\circ$.`;
      steps = [
        `Fraction: $\\frac{${freq}}{${total}}$.`,
        `Multiply by $360^\\circ$: $\\frac{${freq}}{${total}} \\times 360^\\circ = ${angle}^\\circ$.`,
      ];
      conclusion = `The sector angle is $${angle}^\\circ$.`;
      hint = `Sector angle is $\\frac{\\text{category count}}{\\text{total count}} \\times 360^\\circ$.`;
    } else if (subtopicIndex === 1) {
      const f1 = prng.int(4, 12);
      const f2 = prng.int(5, 14);
      const f3 = prng.int(3, 10);
      const total = f1 + f2 + f3;
      const relFreqPct = Math.round((f1 / total) * 100);
      questionText = `A survey records frequencies for three categories: Category A has $${f1}$, Category B has $${f2}$, and Category C has $${f3}$. What is the total sample size $N$?`;
      correctAnswer = `$${total}$`;
      rawDistractors = [`$${total + 5}$`, `$${total - 3}$`, `$${f1 + f2}$`];
      given = `Frequencies: $f_A = ${f1}$, $f_B = ${f2}$, $f_C = ${f3}$.`;
      required = `Total sample size $N$.`;
      method = `Sum all category frequencies: $N = \\sum f_i$.`;
      steps = [`$N = ${f1} + ${f2} + ${f3} = ${total}$.`];
      conclusion = `Total sample size is $${total}$.`;
      hint = `Sum the frequencies of all categories.`;
    } else if (subtopicIndex === 2) {
      const minVal = prng.int(10, 25);
      const maxVal = minVal + prng.int(15, 35);
      const classWidth = 5;
      const classCount = Math.ceil((maxVal - minVal) / classWidth);
      questionText = `A continuous dataset has a minimum value of $${minVal}$ and a maximum value of $${maxVal}$. What is the range of this data?`;
      const range = maxVal - minVal;
      correctAnswer = `$${range}$`;
      rawDistractors = [`$${range + classWidth}$`, `$${Math.max(5, range - classWidth)}$`, `$${maxVal}$`];
      given = `$\\text{Min} = ${minVal}$, $\\text{Max} = ${maxVal}$.`;
      required = `Range.`;
      method = `Range formula: $\\text{Range} = \\text{Maximum} - \\text{Minimum}$.`;
      steps = [`$${maxVal} - ${minVal} = ${range}$.`];
      conclusion = `The range is $${range}$.`;
      hint = `Subtract the minimum value from the maximum value.`;
    } else if (subtopicIndex === 3) {
      const lower = prng.pick([10, 20, 30, 40]);
      const upper = lower + 10;
      const midpoint = (lower + upper) / 2;
      questionText = `What is the midpoint (class mark) of the interval $[${lower}, ${upper})$?`;
      correctAnswer = `$${midpoint}$`;
      rawDistractors = [`$${lower + 2}$`, `$${upper - 2}$`, `$${upper - lower}$`];
      given = `Class interval $[${lower}, ${upper})$.`;
      required = `Class midpoint.`;
      method = `Class midpoint formula: $M = \\frac{\\text{Lower} + \\text{Upper}}{2}$.`;
      steps = [`$M = \\frac{${lower} + ${upper}}{2} = \\frac{${lower + upper}}{2} = ${midpoint}$.`];
      conclusion = `The midpoint is $${midpoint}$.`;
      hint = `Add lower and upper bounds, then divide by 2.`;
    } else {
      const totalDegrees = 360;
      const angle = prng.pick([30, 45, 60, 90, 120]);
      const pct = Math.round((angle / totalDegrees) * 100);
      questionText = `In a pie chart, a sector has a central angle of $${angle}^\\circ$. What percentage of the entire circle does this sector represent?`;
      correctAnswer = `$${(angle / 360 * 100).toFixed(1).replace(/\\.0$/, '')}\\%$`;
      const val = (angle / 360 * 100);
      rawDistractors = [
        `$${(val + 10).toFixed(1).replace(/\\.0$/, '')}\\%$`,
        `$${Math.max(5, val - 10).toFixed(1).replace(/\\.0$/, '')}\\%$`,
        `$${(angle / 2).toFixed(1).replace(/\\.0$/, '')}\\%$`,
      ];
      given = `Sector angle $\\theta = ${angle}^\\circ$.`;
      required = `Percentage representation.`;
      method = `Percentage $= \\frac{\\theta}{360^\\circ} \\times 100\\%$.`;
      steps = [
        `$\\frac{${angle}^\\circ}{360^\\circ} = \\frac{1}{${360 / angle}}$.`,
        `$\\frac{1}{${360 / angle}} \\times 100\\% = ${(angle / 360 * 100).toFixed(1).replace(/\\.0$/, '')}\\%$.`,
      ];
      conclusion = `The sector represents ${(angle / 360 * 100).toFixed(1).replace(/\\.0$/, '')}%.`;
      hint = `Divide the angle by $360^\\circ$ and multiply by 100%.`;
    }
  } else if (stageId === 54 || stageId === 55) {
    // Measures of Central Tendency: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Mean
      const nums = [prng.int(4, 10), prng.int(5, 12), prng.int(6, 14), prng.int(7, 16)];
      const sum4 = nums.reduce((a, b) => a + b, 0);
      const targetMean = Math.round(sum4 / 4) + prng.int(1, 3);
      const fifth = targetMean * 5 - sum4;
      const allNums = [...nums, fifth].sort((a, b) => a - b);
      questionText = `Find the arithmetic mean of the dataset: $$${allNums.join(', ')}$$`;
      correctAnswer = `$${targetMean}$`;
      const dist = generateNumericalDistractors(targetMean, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Dataset $\\{${allNums.join(', ')}\\}$.`;
      required = `Arithmetic mean $\\bar{x}$.`;
      method = `Sum all values and divide by the count $n = 5$: $\\bar{x} = \\frac{\\sum x}{n}$.`;
      steps = [
        `Sum: $${allNums.join(' + ')} = ${targetMean * 5}$.`,
        `Divide by $5$: $\\frac{${targetMean * 5}}{5} = ${targetMean}$.`,
      ];
      conclusion = `The mean is $${targetMean}$.`;
      hint = `Add up all numbers and divide by 5.`;
    } else if (subtopicIndex === 1) {
      // Median (odd number of items)
      const base = prng.int(5, 20);
      const raw = [base, base + 2, base + 5, base + 8, base + 12];
      const shuffled = [...raw].sort(() => prng.next() - 0.5);
      const median = raw[2];
      questionText = `Find the median of the following dataset: $$${shuffled.join(', ')}$$`;
      correctAnswer = `$${median}$`;
      rawDistractors = [`$${raw[1]}$`, `$${raw[3]}$`, `$${Math.round((raw[0] + raw[4]) / 2)}$`];
      given = `Values: $\\{${shuffled.join(', ')}\\}$.`;
      required = `Median.`;
      method = `Order data in ascending order: the median is the middle value (${(raw.length + 1) / 2}-th value).`;
      steps = [
        `Sort: $${raw.join(', ')}$.`,
        `Middle element ($3^{\\text{rd}}$ item): $${median}$.`,
      ];
      conclusion = `The median is $${median}$.`;
      hint = `Sort the numbers first and pick the middle value.`;
    } else if (subtopicIndex === 2) {
      // Median (even number of items)
      const base = prng.int(4, 15);
      const raw = [base, base + 2, base + 4, base + 6, base + 10, base + 14];
      const shuffled = [...raw].sort(() => prng.next() - 0.5);
      const medVal = (raw[2] + raw[3]) / 2;
      questionText = `Find the median of the 6 data points: $$${shuffled.join(', ')}$$`;
      correctAnswer = `$${medVal}$`;
      rawDistractors = [`$${raw[2]}$`, `$${raw[3]}$`, `$${medVal + 1}$`];
      given = `Data points $\\{${shuffled.join(', ')}\\}$.`;
      required = `Median.`;
      method = `For an even count, sort and average the two central values: $\\frac{x_{n/2} + x_{n/2+1}}{2}$.`;
      steps = [
        `Sort: $${raw.join(', ')}$.`,
        `Two middle values: $${raw[2]}$ and $${raw[3]}$.`,
        `Average: $\\frac{${raw[2]} + ${raw[3]}}{2} = ${medVal}$.`,
      ];
      conclusion = `The median is $${medVal}$.`;
      hint = `Sort the data, then average the two middle numbers.`;
    } else if (subtopicIndex === 3) {
      // Mode
      const modeVal = prng.int(3, 15);
      const other1 = modeVal + 2;
      const other2 = modeVal - 1;
      const other3 = modeVal + 5;
      const list = [modeVal, other1, modeVal, other2, modeVal, other3].sort(() => prng.next() - 0.5);
      questionText = `Identify the mode of the dataset: $$${list.join(', ')}$$`;
      correctAnswer = `$${modeVal}$`;
      rawDistractors = [`$${other1}$`, `$${other2}$`, `$${other3}$`];
      given = `Dataset $\\{${list.join(', ')}\\}$.`;
      required = `Mode.`;
      method = `The mode is the value that appears with the highest frequency.`;
      steps = [
        `Count frequencies: $${modeVal}$ appears $3$ times, others appear $1$ time each.`,
      ];
      conclusion = `The mode is $${modeVal}$.`;
      hint = `Find the number that appears most frequently.`;
    } else {
      // Missing value given mean
      const a = prng.int(5, 15);
      const b = prng.int(10, 20);
      const c = prng.int(8, 18);
      const targetMean = Math.round((a + b + c) / 3) + prng.int(1, 3);
      const x = 4 * targetMean - (a + b + c);
      questionText = `The mean of four numbers $${a}$, $${b}$, $${c}$, and $x$ is $${targetMean}$. What is the value of $x$?`;
      correctAnswer = `$x = ${x}$`;
      const dist = generateNumericalDistractors(x, prng);
      rawDistractors = dist.map(d => `$x = ${d}$`);
      given = `Numbers $${a}, ${b}, ${c}, x$ with mean $${targetMean}$.`;
      required = `Value of $x$.`;
      method = `Total sum $= 4 \\times \\text{mean} = 4 \\times ${targetMean} = ${4 * targetMean}$. Solve for $x$: $x = ${4 * targetMean} - (${a} + ${b} + ${c})$.`;
      steps = [
        `Total sum: $4 \\times ${targetMean} = ${4 * targetMean}$.`,
        `Sum of 3 known: $${a} + ${b} + ${c} = ${a + b + c}$.`,
        `$x = ${4 * targetMean} - ${a + b + c} = ${x}$.`,
      ];
      conclusion = `$x = ${x}$.`;
      hint = `Multiply the mean by 4 to get the total sum, then subtract the three known numbers.`;
    }
  } else if (stageId === 56) {
    // Measures of Dispersion & Box Plots: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const q1 = prng.int(12, 25);
      const iqr = prng.int(8, 20);
      const q3 = q1 + iqr;
      questionText = `In a dataset, the lower quartile is $Q_1 = ${q1}$ and the upper quartile is $Q_3 = ${q3}$. What is the interquartile range (IQR)?`;
      correctAnswer = `$${iqr}$`;
      rawDistractors = [`$${q1 + q3}$`, `$${iqr + 4}$`, `$${Math.max(2, iqr - 4)}$`];
      given = `$Q_1 = ${q1}$, $Q_3 = ${q3}$.`;
      required = `Interquartile range $\\text{IQR}$.`;
      method = `$\\text{IQR} = Q_3 - Q_1 = ${q3} - ${q1} = ${iqr}$.`;
      steps = [`$\\text{IQR} = ${q3} - ${q1} = ${iqr}$.`];
      conclusion = `The IQR is $${iqr}$.`;
      hint = `Interquartile range is Upper Quartile minus Lower Quartile ($Q_3 - Q_1$).`;
    } else if (subtopicIndex === 1) {
      const q3 = prng.int(30, 50);
      const iqr = prng.int(10, 16);
      const fence = q3 + 1.5 * iqr;
      questionText = `According to the $1.5 \\times \\text{IQR}$ rule, what is the upper outlier boundary if $Q_3 = ${q3}$ and $\\text{IQR} = ${iqr}$?`;
      correctAnswer = `$${fence}$`;
      rawDistractors = [`$${q3 + iqr}$`, `$${fence + 5}$`, `$${fence - 5}$`];
      given = `$Q_3 = ${q3}$, $\\text{IQR} = ${iqr}$.`;
      required = `Upper boundary for outliers.`;
      method = `Upper fence formula: $\\text{Upper Fence} = Q_3 + 1.5 \\times \\text{IQR}$.`;
      steps = [
        `$1.5 \\times \\text{IQR} = 1.5 \\times ${iqr} = ${1.5 * iqr}$.`,
        `$Q_3 + 1.5 \\times \\text{IQR} = ${q3} + ${1.5 * iqr} = ${fence}$.`,
      ];
      conclusion = `The upper boundary is $${fence}$.`;
      hint = `Add $1.5 \\times \\text{IQR}$ to $Q_3$.`;
    } else if (subtopicIndex === 2) {
      const variance = prng.pick([4, 9, 16, 25, 36, 49, 64, 81, 100]);
      const sd = Math.sqrt(variance);
      questionText = `If the variance of a dataset is $\\sigma^2 = ${variance}$, what is the standard deviation $\\sigma$?`;
      correctAnswer = `$${sd}$`;
      rawDistractors = [`$${variance * 2}$`, `$${variance / 2}$`, `$${sd + 2}$`];
      given = `Variance $\\sigma^2 = ${variance}$.`;
      required = `Standard deviation $\\sigma$.`;
      method = `Standard deviation is the positive square root of variance: $\\sigma = \\sqrt{\\sigma^2}$.`;
      steps = [`$\\sigma = \\sqrt{${variance}} = ${sd}$.`];
      conclusion = `The standard deviation is $${sd}$.`;
      hint = `Standard deviation is the square root of variance.`;
    } else if (subtopicIndex === 3) {
      const sd = prng.int(2, 8);
      const variance = sd * sd;
      questionText = `If the standard deviation of a dataset is $s = ${sd}$, what is the sample variance $s^2$?`;
      correctAnswer = `$${variance}$`;
      rawDistractors = [`$${2 * sd}$`, `$${variance + 4}$`, `$${Math.max(1, variance - 4)}$`];
      given = `Standard deviation $s = ${sd}$.`;
      required = `Variance $s^2$.`;
      method = `Variance is the square of the standard deviation: $s^2 = (${sd})^2 = ${variance}$.`;
      steps = [`$s^2 = ${sd}^2 = ${variance}$.`];
      conclusion = `The variance is $${variance}$.`;
      hint = `Square the standard deviation to get the variance.`;
    } else {
      const qMode = prng.pick(['pct_iqr', 'pct_below_q1', 'pct_above_q3', 'sample_count']);
      if (qMode === 'pct_iqr') {
        questionText = `What percentage of data in any continuous distribution lies between the first quartile ($Q_1$) and the third quartile ($Q_3$)?`;
        correctAnswer = `$50\\%$`;
        rawDistractors = [`$25\\%$`, `$75\\%$`, `$68\\%$`];
        given = `Quartiles $Q_1$ ($25\\text{th}$ percentile) and $Q_3$ ($75\\text{th}$ percentile).`;
        required = `Percentage of data between $Q_1$ and $Q_3$.`;
        method = `The interquartile range spans from the $25\\text{th}$ to the $75\\text{th}$ percentile: $75\\% - 25\\% = 50\\%$.`;
        steps = [`$75\\% - 25\\% = 50\\%$.`];
        conclusion = `Exactly $50\\%$ of the data lies in this range.`;
        hint = `The middle 50% of any distribution lies between $Q_1$ and $Q_3$.`;
      } else if (qMode === 'pct_below_q1') {
        questionText = `What percentage of data in an ordered dataset lies strictly below the lower quartile ($Q_1$)?`;
        correctAnswer = `$25\\%$`;
        rawDistractors = [`$50\\%$`, `$75\\%$`, `$10\\%$`];
        given = `Lower quartile $Q_1$.`;
        required = `Percentage below $Q_1$.`;
        method = `The lower quartile $Q_1$ defines the $25\\text{th}$ percentile: exactly $25\\%$ lies below it.`;
        steps = [`$Q_1 = 25\\text{th percentile} \\implies 25\\%$.`];
        conclusion = `Exactly $25\\%$ of values lie below $Q_1$.`;
        hint = `The first quartile divides the bottom one-fourth (25%) of data.`;
      } else if (qMode === 'pct_above_q3') {
        questionText = `What percentage of data in an ordered dataset lies strictly above the upper quartile ($Q_3$)?`;
        correctAnswer = `$25\\%$`;
        rawDistractors = [`$75\\%$`, `$50\\%$`, `$20\\%$`];
        given = `Upper quartile $Q_3$.`;
        required = `Percentage above $Q_3$.`;
        method = `The upper quartile $Q_3$ marks the $75\\text{th}$ percentile: $100\\% - 75\\% = 25\\%$ lies above it.`;
        steps = [`$100\\% - 75\\% = 25\\%$.`];
        conclusion = `Exactly $25\\%$ of values lie above $Q_3$.`;
        hint = `Since 75% of data is below $Q_3$, 25% remains above it.`;
      } else {
        const nSample = prng.pick([80, 120, 160, 200, 240, 300, 400]);
        const count = nSample * 0.5;
        questionText = `In a dataset of $N = ${nSample}$ observations, approximately how many data values fall within the interquartile range ($Q_1$ to $Q_3$)?`;
        correctAnswer = `$${count}$`;
        rawDistractors = [`$${nSample * 0.25}$`, `$${nSample * 0.75}$`, `$${count + 15}$`];
        given = `Sample size $N = ${nSample}$, IQR contains $50\\%$ of data.`;
        required = `Expected count in IQR.`;
        method = `The interquartile range holds $50\\%$ of all observations: $0.50 \\times ${nSample} = ${count}$.`;
        steps = [`$0.50 \\times ${nSample} = ${count}$.`];
        conclusion = `Approximately $${count}$ observations.`;
        hint = `Multiply the sample size by 50% (or divide by 2).`;
      }
    }
  } else if (stageId === 57 || stageId === 58) {
    // Basic & Advanced Probability: 5 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const red = prng.int(3, 9);
      const blue = prng.int(4, 10);
      const total = red + blue;
      const g = gcd(red, total);
      questionText = `A bag contains $${red}$ red marbles and $${blue}$ blue marbles. What is the probability of randomly drawing a red marble?`;
      correctAnswer = `$\\frac{${red / g}}{${total / g}}$`;
      rawDistractors = [`$\\frac{${blue}}{${total}}$`, `$\\frac{${red}}{${blue}}$`, `$\\frac{1}{${total}}$`];
      given = `$${red}$ red, $${blue}$ blue, total $= ${total}$.`;
      required = `$P(\\text{Red})$.`;
      method = `$P(E) = \\frac{\\text{favorable}}{\\text{total}} = \\frac{${red}}{${total}}$.`;
      steps = [`$\\frac{${red}}{${total}} = \\frac{${red / g}}{${total / g}}$.`];
      conclusion = `Probability is $\\frac{${red / g}}{${total / g}}$.`;
      hint = `Divide the number of red marbles by the total number of marbles.`;
    } else if (subtopicIndex === 1) {
      const dieEvents = [
        { desc: 'a prime number', ans: '\\frac{1}{2}', dist: ['\\frac{1}{3}', '\\frac{2}{3}', '\\frac{1}{6}'], fav: '\\{2, 3, 5\\}', num: 3 },
        { desc: 'an even number', ans: '\\frac{1}{2}', dist: ['\\frac{1}{3}', '\\frac{2}{3}', '\\frac{1}{4}'], fav: '\\{2, 4, 6\\}', num: 3 },
        { desc: 'an odd number', ans: '\\frac{1}{2}', dist: ['\\frac{1}{3}', '\\frac{2}{3}', '\\frac{5}{6}'], fav: '\\{1, 3, 5\\}', num: 3 },
        { desc: 'a number strictly greater than 4', ans: '\\frac{1}{3}', dist: ['\\frac{1}{2}', '\\frac{2}{3}', '\\frac{1}{6}'], fav: '\\{5, 6\\}', num: 2 },
        { desc: 'a multiple of 3', ans: '\\frac{1}{3}', dist: ['\\frac{1}{2}', '\\frac{1}{6}', '\\frac{2}{3}'], fav: '\\{3, 6\\}', num: 2 },
        { desc: 'a number strictly less than 3', ans: '\\frac{1}{3}', dist: ['\\frac{1}{2}', '\\frac{2}{3}', '\\frac{1}{6}'], fav: '\\{1, 2\\}', num: 2 },
        { desc: 'a number divisible by 2 or 3', ans: '\\frac{2}{3}', dist: ['\\frac{1}{2}', '\\frac{1}{3}', '\\frac{5}{6}'], fav: '\\{2, 3, 4, 6\\}', num: 4 },
        { desc: 'a number strictly greater than 1', ans: '\\frac{5}{6}', dist: ['\\frac{1}{2}', '\\frac{2}{3}', '\\frac{1}{6}'], fav: '\\{2, 3, 4, 5, 6\\}', num: 5 },
      ];
      const de = prng.pick(dieEvents);
      questionText = `When rolling a single fair 6-sided die, what is the probability of rolling ${de.desc}?`;
      correctAnswer = `$${de.ans}$`;
      rawDistractors = de.dist.map(d => `$${d}$`);
      given = `Die outcomes $\\{1, 2, 3, 4, 5, 6\\}$, target: ${de.desc}.`;
      required = `Probability.`;
      method = `Favorable outcomes: $${de.fav}$ ($${de.num}$ out of 6). $P = \\frac{${de.num}}{6} = ${de.ans}$.`;
      steps = [`Favorable outcomes: $${de.fav} \\implies P = \\frac{${de.num}}{6} = ${de.ans}$.`];
      conclusion = `Probability is $${de.ans}$.`;
      hint = `Count favorable outcomes out of 6 possible faces.`;
    } else if (subtopicIndex === 2) {
      const pRain = prng.pick([15, 20, 25, 30, 35, 40, 45, 60, 65, 70, 75, 80, 85]);
      const pNoRain = 100 - pRain;
      questionText = `If the probability of rain tomorrow is $${pRain}\\%$, what is the probability that it will NOT rain tomorrow?`;
      correctAnswer = `$${pNoRain}\\%$`;
      rawDistractors = [`$${pRain}\\%$`, `$${(pNoRain + 10) % 100}\\%$`, `$${Math.abs(pNoRain - 15)}\\%$`];
      given = `$P(E) = ${pRain}\\%$.`;
      required = `Complementary probability $P(E')$.`;
      method = `Complement rule: $P(E') = 100\\% - P(E) = 100\\% - ${pRain}\\% = ${pNoRain}\\%$.`;
      steps = [`$100\\% - ${pRain}\\% = ${pNoRain}\\%$.`];
      conclusion = `The probability is $${pNoRain}\\%$.`;
      hint = `The probability of an event and its complement always sum to 100% (or 1).`;
    } else if (subtopicIndex === 3) {
      const coinEvents = [
        { q: 'Two fair coins are flipped simultaneously. What is the probability of getting at least one Head?', ans: '\\frac{3}{4}', dist: ['\\frac{1}{2}', '\\frac{1}{4}', '1'], steps: 'Sample space: {HH, HT, TH, TT}. Favorable: {HH, HT, TH} (3 of 4).' },
        { q: 'Two fair coins are flipped simultaneously. What is the probability of getting exactly one Head?', ans: '\\frac{1}{2}', dist: ['\\frac{1}{4}', '\\frac{3}{4}', '1'], steps: 'Favorable: {HT, TH} (2 of 4) = 1/2.' },
        { q: 'Two fair coins are flipped simultaneously. What is the probability of getting two Heads?', ans: '\\frac{1}{4}', dist: ['\\frac{1}{2}', '\\frac{3}{4}', '\\frac{1}{8}'], steps: 'Favorable: {HH} (1 of 4).' },
        { q: 'Two fair coins are flipped simultaneously. What is the probability of getting two Tails?', ans: '\\frac{1}{4}', dist: ['\\frac{1}{2}', '\\frac{3}{4}', '0'], steps: 'Favorable: {TT} (1 of 4).' },
        { q: 'Three fair coins are tossed. What is the probability of getting all Heads?', ans: '\\frac{1}{8}', dist: ['\\frac{1}{4}', '\\frac{3}{8}', '\\frac{1}{2}'], steps: 'Total outcomes = 2^3 = 8. Favorable: {HHH} (1 of 8).' },
        { q: 'Three fair coins are tossed. What is the probability of getting at least one Head?', ans: '\\frac{7}{8}', dist: ['\\frac{3}{8}', '\\frac{5}{8}', '\\frac{3}{4}'], steps: 'Complement of no heads: 1 - P(TTT) = 1 - 1/8 = 7/8.' },
      ];
      const ce = prng.pick(coinEvents);
      questionText = ce.q;
      correctAnswer = `$${ce.ans}$`;
      rawDistractors = ce.dist.map(d => `$${d}$`);
      given = `Independent coin tosses.`;
      required = `Probability.`;
      method = ce.steps;
      steps = [ce.steps];
      conclusion = `Probability is $${ce.ans}$.`;
      hint = `List the equally likely outcomes or use the complement rule.`;
    } else {
      // Expected frequency
      const n = prng.pick([30, 60, 90, 120, 150, 180, 210, 240, 300]);
      const exp6 = n / 6;
      questionText = `A fair 6-sided die is rolled $${n}$ times. What is the expected number of times a $6$ will be rolled?`;
      correctAnswer = `$${exp6}$`;
      const dist = generateNumericalDistractors(exp6, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Number of trials $n = ${n}$, probability $p = \\frac{1}{6}$.`;
      required = `Expected value $E(X)$.`;
      method = `Expected value formula: $E(X) = n \\times p = ${n} \\times \\frac{1}{6} = ${exp6}$.`;
      steps = [`$E(X) = ${n} \\times \\frac{1}{6} = ${exp6}$.`];
      conclusion = `Expected occurrences $= ${exp6}$.`;
      hint = `Multiply the total number of rolls by the probability of rolling a 6 ($\frac{1}{6}$).`;
    }
  } else if (stageId === 59) {
    // Compound Events & Venn Diagrams: 5 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Venn diagram addition rule: P(A union B) = P(A) + P(B) - P(A intersect B)
      const pA = prng.pick([0.40, 0.50, 0.60]);
      const pB = prng.pick([0.30, 0.35, 0.45]);
      const pBoth = prng.pick([0.10, 0.15, 0.20]);
      const pUnion = +(pA + pB - pBoth).toFixed(2);
      questionText = `In a student body, $P(A) = ${pA.toFixed(2)}$ participate in Athletics and $P(B) = ${pB.toFixed(2)}$ in Band. If $P(A \\cap B) = ${pBoth.toFixed(2)}$ participate in both, what is $P(A \\cup B)$?`;
      correctAnswer = `$${pUnion.toFixed(2)}$`;
      const dist = generateNumericalDistractors(pUnion, prng, false, false, 0.1);
      rawDistractors = dist.map(d => `$${d.toFixed(2)}$`);
      given = `$P(A) = ${pA.toFixed(2)}$, $P(B) = ${pB.toFixed(2)}$, $P(A \\cap B) = ${pBoth.toFixed(2)}$.`;
      required = `$P(A \\cup B)$.`;
      method = `Addition rule: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = ${pA.toFixed(2)} + ${pB.toFixed(2)} - ${pBoth.toFixed(2)} = ${pUnion.toFixed(2)}$.`;
      steps = [`$${pA.toFixed(2)} + ${pB.toFixed(2)} - ${pBoth.toFixed(2)} = ${pUnion.toFixed(2)}$.`];
      conclusion = `$P(A \\cup B) = ${pUnion.toFixed(2)}$.`;
      hint = `Add individual probabilities and subtract the joint probability.`;
    } else if (subtopicIndex === 1) {
      // Independent events multiplication: P(A and B) = P(A) * P(B)
      const dieFace = prng.int(1, 6);
      const coinSide = prng.pick(['Heads', 'Tails']);
      questionText = `A fair coin is tossed and a fair 6-sided die is rolled. What is the probability of obtaining ${coinSide} AND rolling a $${dieFace}$?`;
      correctAnswer = `$\\frac{1}{12}$`;
      rawDistractors = [`$\\frac{1}{6}$`, `$\\frac{1}{8}$`, `$\\frac{5}{12}$`];
      given = `Independent trials: Coin (${coinSide}) and die ($${dieFace}$).`;
      required = `$P(${coinSide} \\cap ${dieFace})$.`;
      method = `Independent events: $P(A \\cap B) = P(A) \\times P(B) = \\frac{1}{2} \\times \\frac{1}{6} = \\frac{1}{12}$.`;
      steps = [`$\\frac{1}{2} \\times \\frac{1}{6} = \\frac{1}{12}$.`];
      conclusion = `The probability is $\\frac{1}{12}$.`;
      hint = `Multiply the probability of the coin toss by the probability of the die result.`;
    } else if (subtopicIndex === 2) {
      const red = prng.pick([3, 4]);
      const blue = prng.pick([2, 3]);
      const total = red + blue;
      const num = red * (red - 1);
      const den = total * (total - 1);
      const g = gcd(num, den);
      const sNum = num / g;
      const sDen = den / g;
      questionText = `A container holds $${red}$ red counters and $${blue}$ blue counters. If two counters are randomly drawn without replacement, what is the probability that both counters are red?`;
      correctAnswer = `$\\frac{${sNum}}{${sDen}}$`;
      rawDistractors = [
        `$\\frac{${red * red}}{${total * total}}$`,
        `$\\frac{${sNum + 1}}{${sDen}}$`,
        `$\\frac{1}{2}$`,
      ];
      given = `$${red}$ red, $${blue}$ blue, total $= ${total}$. Dependent sequential draws.`;
      required = `$P(R_1 \\cap R_2)$.`;
      method = `$P(R_1 \\cap R_2) = \\frac{${red}}{${total}} \\times \\frac{${red - 1}}{${total - 1}} = \\frac{${num}}{${den}} = \\frac{${sNum}}{${sDen}}$.`;
      steps = [
        `Draw 1: $\\frac{${red}}{${total}}$.`,
        `Draw 2: $\\frac{${red - 1}}{${total - 1}}$.`,
        `Product: $\\frac{${sNum}}{${sDen}}$.`,
      ];
      conclusion = `Probability is $\\frac{${sNum}}{${sDen}}$.`;
      hint = `Both the numerator and denominator decrease by 1 for the second draw.`;
    } else if (subtopicIndex === 3) {
      const targetSums = [
        { sum: 7, ways: 6, frac: '\\frac{1}{6}' },
        { sum: 8, ways: 5, frac: '\\frac{5}{36}' },
        { sum: 9, ways: 4, frac: '\\frac{1}{9}' },
        { sum: 10, ways: 3, frac: '\\frac{1}{12}' },
        { sum: 11, ways: 2, frac: '\\frac{1}{18}' },
        { sum: 12, ways: 1, frac: '\\frac{1}{36}' },
      ];
      const item = prng.pick(targetSums);
      questionText = `When rolling two standard 6-sided dice, what is the probability that the sum of the two uppermost faces equals $${item.sum}$?`;
      correctAnswer = `$${item.frac}$`;
      rawDistractors = [`$\\frac{${item.ways + 1}}{36}$`, `$\\frac{1}{6}$`, `$\\frac{${Math.max(1, item.ways - 1)}}{36}$`];
      given = `Two standard dice, target sum $= ${item.sum}$.`;
      required = `Probability of sum.`;
      method = `There are $36$ total outcomes. Exactly $${item.ways}$ combinations sum to $${item.sum}$. $\\frac{${item.ways}}{36} = ${item.frac}$.`;
      steps = [`$${item.ways}$ favorable outcomes out of $36$: $${item.frac}$.`];
      conclusion = `Probability is $${item.frac}$.`;
      hint = `Count the ordered pairs $(d_1, d_2)$ that sum to $${item.sum}$ out of 36.`;
    } else {
      const total = prng.pick([30, 40, 50, 60]);
      const setA = Math.round(total * 0.6);
      const setB = Math.round(total * 0.5);
      const both = Math.round(total * 0.25);
      const neither = total - (setA + setB - both);
      questionText = `In a surveyed group of $${total}$ people, $${setA}$ own a bicycle, $${setB}$ own a skateboard, and $${both}$ own both. How many people own NEITHER?`;
      correctAnswer = `$${neither}$`;
      const dist = generateNumericalDistractors(neither, prng, true, false, 2);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Total $N = ${total}$, Bicycle $A = ${setA}$, Skateboard $B = ${setB}$, Both $= ${both}$.`;
      required = `Neither count.`;
      method = `At least one: $|A \\cup B| = ${setA} + ${setB} - ${both} = ${setA + setB - both}$. Neither $= ${total} - ${setA + setB - both} = ${neither}$.`;
      steps = [
        `Either: $${setA} + ${setB} - ${both} = ${setA + setB - both}$.`,
        `Neither: $${total} - ${setA + setB - both} = ${neither}$.`,
      ];
      conclusion = `$${neither}$ people own neither.`;
      hint = `Find those owning at least one ($A + B - \\text{Both}$) and subtract from $${total}$.`;
    }
  } else if (stageId === 60) {
    // Statistics & Probability Master Challenge: 5 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Empirical rule (68-95-99.7)
      const mean = prng.pick([50, 80, 100, 120, 200, 500]);
      const sd = prng.pick([5, 10, 15, 20]);
      const k = prng.pick([1, 2, 3]);
      const lower = mean - k * sd;
      const upper = mean + k * sd;
      const pct = k === 1 ? '68\\%' : k === 2 ? '95\\%' : '99.7\\%';
      questionText = `In a normally distributed dataset with mean $\\mu = ${mean}$ and standard deviation $\\sigma = ${sd}$, approximately what percentage of data values falls between $${lower}$ and $${upper}$?`;
      correctAnswer = `$${pct}$`;
      rawDistractors = ['$50\\%$', '$75\\%$', '$90\\%$'];
      given = `Normal distribution $\\mu = ${mean}$, $\\sigma = ${sd}$, bounds $[${lower}, ${upper}] = [\\mu - ${k}\\sigma, \\mu + ${k}\\sigma]$.`;
      required = `Percentage inside interval.`;
      method = `Empirical Rule: $1\\sigma \\to 68\\%$, $2\\sigma \\to 95\\%$, $3\\sigma \\to 99.7\\%$. Here $k = ${k}$, so $P \\approx ${pct}$.`;
      steps = [`$[${lower}, ${upper}]$ is exactly $\\mu \\pm ${k}\\sigma$, which contains approximately $${pct}$.`];
      conclusion = `Approximately $${pct}$.`;
      hint = `Identify how many standard deviations away from the mean the boundaries are.`;
    } else if (subtopicIndex === 1) {
      // Combined mean of two groups
      const n1 = prng.pick([10, 12, 15]);
      const m1 = prng.pick([60, 70, 75]);
      const n2 = prng.pick([10, 15, 20]);
      const m2 = prng.pick([80, 85, 90]);
      const totalSum = n1 * m1 + n2 * m2;
      const totalN = n1 + n2;
      const combMean = (totalSum / totalN).toFixed(1);
      questionText = `Group A has $${n1}$ candidates averaging $${m1}$ marks. Group B has $${n2}$ candidates averaging $${m2}$ marks. What is the combined mean score across all $${totalN}$ candidates?`;
      correctAnswer = `$${combMean}$`;
      const numVal = parseFloat(combMean);
      const dist = generateNumericalDistractors(numVal, prng, false, false, 2);
      rawDistractors = dist.map(d => `$${d.toFixed(1)}$`);
      given = `Group A: $n_1 = ${n1}, \\bar{x}_1 = ${m1}$; Group B: $n_2 = ${n2}, \\bar{x}_2 = ${m2}$.`;
      required = `Combined weighted mean $\\bar{x}$.`;
      method = `$\\bar{x} = \\frac{(${n1} \\times ${m1}) + (${n2} \\times ${m2})}{${totalN}} = \\frac{${totalSum}}{${totalN}} = ${combMean}$.`;
      steps = [`$\\frac{${totalSum}}{${totalN}} = ${combMean}$.`];
      conclusion = `Combined mean is $${combMean}$.`;
      hint = `Find the grand total marks from both groups and divide by total candidate count.`;
    } else if (subtopicIndex === 2) {
      // Conditional probability P(A|B) = P(A and B) / P(B)
      const pB = prng.pick([0.40, 0.50, 0.60, 0.80]);
      const condP = prng.pick([0.20, 0.25, 0.30, 0.40, 0.50]);
      const pAB = +(pB * condP).toFixed(2);
      questionText = `For two dependent events $A$ and $B$, $P(A \\cap B) = ${pAB.toFixed(2)}$ and $P(B) = ${pB.toFixed(2)}$. What is the conditional probability $P(A \\mid B)$?`;
      correctAnswer = `$${condP.toFixed(2)}$`;
      const dist = generateNumericalDistractors(condP, prng, false, false, 0.05);
      rawDistractors = dist.map(d => `$${d.toFixed(2)}$`);
      given = `$P(A \\cap B) = ${pAB.toFixed(2)}$, $P(B) = ${pB.toFixed(2)}$.`;
      required = `$P(A \\mid B)$.`;
      method = `$P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{${pAB.toFixed(2)}}{${pB.toFixed(2)}} = ${condP.toFixed(2)}$.`;
      steps = [`$P(A \\mid B) = \\frac{${pAB.toFixed(2)}}{${pB.toFixed(2)}} = ${condP.toFixed(2)}$.`];
      conclusion = `$P(A \\mid B) = ${condP.toFixed(2)}$.`;
      hint = `Divide joint probability $P(A \\cap B)$ by the condition probability $P(B)$.`;
    } else if (subtopicIndex === 3) {
      const win = prng.pick([10, 15, 20]);
      const lose = prng.pick([2, 4, 5]);
      const pWin = prng.pick([0.20, 0.25, 0.30]);
      const pLose = +(1 - pWin).toFixed(2);
      const ev = +(win * pWin - lose * pLose).toFixed(2);
      const sign = ev >= 0 ? '+' : '';
      questionText = `In a carnival contest, players have a $${Math.round(pWin * 100)}\\%$ chance to win $\\text{\\$} ${win}$ and a $${Math.round(pLose * 100)}\\%$ chance to lose $\\text{\\$} ${lose}$. What is the expected net value $E(X)$ per game?`;
      correctAnswer = `$${sign}\\text{\\$} ${ev.toFixed(2)}$`;
      rawDistractors = [
        `$+\\text{\\$} ${(ev + 2).toFixed(2)}$`,
        `$-\\text{\\$} ${Math.abs(ev - 1.5).toFixed(2)}$`,
        `$\\text{\\$} 0.00$`,
      ];
      given = `Win $\\text{\\$} ${win}$ ($p = ${pWin}$), Lose $\\text{\\$} ${lose}$ ($p = ${pLose}$).`;
      required = `Expected payoff $E(X)$.`;
      method = `$E(X) = (${win} \\times ${pWin}) + (-${lose} \\times ${pLose}) = ${(win * pWin).toFixed(2)} - ${(lose * pLose).toFixed(2)} = ${sign}${ev.toFixed(2)}$.`;
      steps = [`$(${win} \\times ${pWin}) - (${lose} \\times ${pLose}) = ${sign}${ev.toFixed(2)}$.`];
      conclusion = `Expected return is $${sign}\\text{\\$} ${ev.toFixed(2)}$ per play.`;
      hint = `Sum each outcome multiplied by its corresponding probability.`;
    } else {
      const n = prng.pick([7, 8, 9, 10]);
      const r = 3;
      const perm = n * (n - 1) * (n - 2);
      questionText = `In how many distinct ways can $1^{\\text{st}}$, $2^{\\text{nd}}$, and $3^{\\text{rd}}$ podium awards be assigned among $${n}$ competing athletes?`;
      correctAnswer = `$${perm}$`;
      const comb = perm / 6;
      rawDistractors = [`$${comb}$`, `$${n * 3}$`, `$${perm + 20}$`];
      given = `$${n}$ athletes, $3$ ordered ranked places.`;
      required = `Permutations $P(${n}, 3)$.`;
      method = `Because order matters, use permutations: $P(${n}, 3) = ${n} \\times ${n - 1} \\times ${n - 2} = ${perm}$.`;
      steps = [`$${n} \\times ${n - 1} \\times ${n - 2} = ${perm}$.`];
      conclusion = `There are $${perm}$ possible podium finishes.`;
      hint = `Since 1st, 2nd, and 3rd are distinct ranks, compute $P(n, 3) = n(n-1)(n-2)$.`;
    }
  }

  // ==========================================
  // WORLD 7: FUNCTIONS & COORDINATES (Stages 61-70)
  // ==========================================
  else if (stageId === 61) {
    // Coordinates, Midpoint & Distance: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Distance
      const x1 = prng.int(1, 4);
      const y1 = prng.int(1, 4);
      const dx = 3;
      const dy = 4;
      const x2 = x1 + dx;
      const y2 = y1 + dy;
      questionText = `Find the Euclidean distance between points $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`;
      correctAnswer = `$5$`;
      rawDistractors = [`$7$`, `$6$`, `$4$`];
      given = `Points $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`;
      required = `Distance $d$.`;
      method = `Distance formula: $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$.`;
      steps = [`$d = \\sqrt{(${x2} - ${x1})^2 + (${y2} - ${y1})^2} = \\sqrt{9 + 16} = 5$.`];
      conclusion = `Distance is $5$ units.`;
      hint = `Apply the distance formula $d = \\sqrt{\\Delta x^2 + \\Delta y^2}$.`;
    } else if (subtopicIndex === 1) {
      // Midpoint
      const x1 = 2 * prng.int(1, 5);
      const x2 = 2 * prng.int(3, 8);
      const y1 = 2 * prng.int(1, 5);
      const y2 = 2 * prng.int(2, 7);
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      questionText = `Find the coordinates of the midpoint of the line segment joining $P(${x1}, ${y1})$ and $Q(${x2}, ${y2})$.`;
      correctAnswer = `$(${mx}, ${my})$`;
      rawDistractors = [`$(${mx + 1}, ${my})$`, `$(${mx}, ${my - 1})$`, `$(${x2 - x1}, ${y2 - y1})$`];
      given = `Points $P(${x1}, ${y1})$, $Q(${x2}, ${y2})$.`;
      required = `Midpoint $M$.`;
      method = `Midpoint formula: $M = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)$.`;
      steps = [
        `$x_m = \\frac{${x1} + ${x2}}{2} = ${mx}$.`,
        `$y_m = \\frac{${y1} + ${y2}}{2} = ${my}$.`,
      ];
      conclusion = `Midpoint is $(${mx}, ${my})$.`;
      hint = `Average the $x$-coordinates and average the $y$-coordinates.`;
    } else if (subtopicIndex === 2) {
      // Missing endpoint
      const mx = prng.int(2, 7);
      const my = prng.int(3, 8);
      const x1 = prng.int(0, 4);
      const y1 = prng.int(0, 4);
      const x2 = 2 * mx - x1;
      const y2 = 2 * my - y1;
      questionText = `The midpoint of line segment $AB$ is $M(${mx}, ${my})$. If point $A$ has coordinates $(${x1}, ${y1})$, find the coordinates of point $B$.`;
      correctAnswer = `$(${x2}, ${y2})$`;
      rawDistractors = [`$(${x2 + 2}, ${y2})$`, `$(${x2}, ${y2 - 2})$`, `$(${mx + x1}, ${my + y1})$`];
      given = `Midpoint $M(${mx}, ${my})$, Endpoint $A(${x1}, ${y1})$.`;
      required = `Endpoint $B(x_2, y_2)$.`;
      method = `$x_2 = 2x_m - x_1 = 2(${mx}) - ${x1} = ${x2}$; $y_2 = 2y_m - y_1 = 2(${my}) - ${y1} = ${y2}$.`;
      steps = [
        `$x_2 = 2(${mx}) - ${x1} = ${x2}$.`,
        `$y_2 = 2(${my}) - ${y1} = ${y2}$.`,
      ];
      conclusion = `Point $B$ is $(${x2}, ${y2})$.`;
      hint = `Double the midpoint coordinates and subtract the coordinates of $A$.`;
    } else if (subtopicIndex === 3) {
      // Reflection
      const x = prng.int(2, 7);
      const y = prng.int(3, 8);
      questionText = `What are the coordinates of point $P(${x}, ${y})$ after a reflection across the $x$-axis?`;
      correctAnswer = `$(${x}, -${y})$`;
      rawDistractors = [`$(-${x}, ${y})$`, `$(-${x}, -${y})$`, `$(${y}, ${x})$`];
      given = `Point $P(${x}, ${y})$, reflection line: $x$-axis.`;
      required = `Reflected point $P'$.`;
      method = `Reflection across the $x$-axis preserves the $x$-coordinate and negates the $y$-coordinate: $(x, y) \\to (x, -y)$.`;
      steps = [`$(${x}, ${y}) \\to (${x}, -${y})$.`];
      conclusion = `Reflected coordinates: $(${x}, -${y})$.`;
      hint = `Reflecting over the $x$-axis flips the sign of the $y$-coordinate only.`;
    } else {
      // Quadrant identification
      const x = -prng.int(2, 8);
      const y = prng.int(2, 8);
      questionText = `In which quadrant of the Cartesian coordinate plane does the point $(${x}, ${y})$ lie?`;
      correctAnswer = `$\\text{Quadrant II}$`;
      rawDistractors = [`$\\text{Quadrant I}$`, `$\\text{Quadrant III}$`, `$\\text{Quadrant IV}$`];
      given = `Coordinates $x = ${x} < 0$, $y = ${y} > 0$.`;
      required = `Quadrant designation.`;
      method = `Quadrant I: $(+,+)$, Quadrant II: $(-,+)$, Quadrant III: $(-,-)$, Quadrant IV: $(+,-)$.`;
      steps = [`Since $x < 0$ and $y > 0$, the point lies in Quadrant II.`];
      conclusion = `It lies in Quadrant II.`;
      hint = `Negative $x$ and positive $y$ corresponds to the top-left quadrant (Quadrant II).`;
    }
  } else if (stageId === 62 || stageId === 63) {
    // Gradient & Straight Line Equations: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Slope between two points
      const x1 = 1;
      const y1 = prng.int(2, 6);
      const m = prng.pick([2, 3, 4, -2, -3]);
      const x2 = 3;
      const y2 = y1 + m * (x2 - x1);
      questionText = `Calculate the slope (gradient) of the line passing through points $(1, ${y1})$ and $(3, ${y2})$.`;
      correctAnswer = `$m = ${m}$`;
      rawDistractors = [`$m = ${-m}$`, `$m = ${m + 1}$`, `$m = ${m - 1}$`];
      given = `Points $(1, ${y1})$ and $(3, ${y2})$.`;
      required = `Gradient $m$.`;
      method = `$m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{${y2} - ${y1}}{3 - 1} = \\frac{${y2 - y1}}{2} = ${m}$.`;
      steps = [`$m = \\frac{${y2 - y1}}{2} = ${m}$.`];
      conclusion = `$m = ${m}$.`;
      hint = `Slope is $\\frac{\\Delta y}{\\Delta x}$.`;
    } else if (subtopicIndex === 1) {
      // Perpendicular slope
      const m = prng.pick([2, 3, 4, 5]);
      questionText = `What is the slope of any line perpendicular to the line $y = ${m}x - 7$?`;
      correctAnswer = `$-\\frac{1}{${m}}$`;
      rawDistractors = [`$\\frac{1}{${m}}$`, `$m = -${m}$`, `$m = ${m}$`];
      given = `Line with slope $m_1 = ${m}$.`;
      required = `Perpendicular slope $m_2$.`;
      method = `Perpendicular lines have negative reciprocal slopes: $m_1 \\cdot m_2 = -1 \\implies m_2 = -\\frac{1}{m_1} = -\\frac{1}{${m}}$.`;
      steps = [`$m_2 = -\\frac{1}{${m}}$.`];
      conclusion = `Perpendicular slope is $-\\frac{1}{${m}}$.`;
      hint = `Take the negative reciprocal: flip the fraction and negate the sign.`;
    } else if (subtopicIndex === 2) {
      // X-intercept
      const m = prng.int(2, 5);
      const c = prng.int(2, 6) * m;
      const xInt = c / m;
      questionText = `Find the $x$-intercept of the linear equation: $$y = ${m}x - ${c}$$`;
      correctAnswer = `$(${xInt}, 0)$`;
      rawDistractors = [`$(0, -${c})$`, `$(${xInt + 1}, 0)$`, `$(-${xInt}, 0)$`];
      given = `Equation $y = ${m}x - ${c}$.`;
      required = `$x$-intercept.`;
      method = `Set $y = 0$: $0 = ${m}x - ${c} \\implies ${m}x = ${c} \\implies x = ${xInt}$.`;
      steps = [`$0 = ${m}x - ${c} \\implies x = ${xInt}$.`];
      conclusion = `$x$-intercept is $(${xInt}, 0)$.`;
      hint = `Set $y = 0$ and solve for $x$.`;
    } else if (subtopicIndex === 3) {
      // Parallel line equation
      const m = prng.int(2, 5);
      const y0 = prng.int(1, 6);
      questionText = `Which line is PARALLEL to $y = ${m}x + 8$ and passes through the point $(0, ${y0})$?`;
      correctAnswer = `$y = ${m}x + ${y0}$`;
      rawDistractors = [
        `$y = -${m}x + ${y0}$`,
        `$y = \\frac{1}{${m}}x + ${y0}$`,
        `$y = ${m}x - 8$`,
      ];
      given = `Reference line $y = ${m}x + 8$, point $(0, ${y0})$.`;
      required = `Parallel line equation.`;
      method = `Parallel lines share identical slopes: $m = ${m}$. With $y$-intercept $(0, ${y0})$, equation is $y = ${m}x + ${y0}$.`;
      steps = [`Slope $m = ${m}$, intercept $c = ${y0} \\implies y = ${m}x + ${y0}$.`];
      conclusion = `$y = ${m}x + ${y0}$.`;
      hint = `Parallel lines must have the exact same slope $m$.`;
    } else {
      // Standard form to slope-intercept form
      const m = prng.pick([2, 3, 4]);
      const c = prng.pick([3, 5, 7]);
      questionText = `Rewrite the linear equation $2y - ${2 * m}x = ${2 * c}$ into slope-intercept form ($y = mx + c$):`;
      correctAnswer = `$y = ${m}x + ${c}$`;
      rawDistractors = [
        `$y = -${m}x + ${c}$`,
        `$y = ${2 * m}x + ${2 * c}$`,
        `$y = ${m}x - ${c}$`,
      ];
      given = `Equation $2y - ${2 * m}x = ${2 * c}$.`;
      required = `Slope-intercept form $y = mx + c$.`;
      method = `Add ${2 * m}x to both sides: $2y = ${2 * m}x + ${2 * c}$. Then divide by 2: $y = ${m}x + ${c}$.`;
      steps = [
        `$2y = ${2 * m}x + ${2 * c}$.`,
        `$y = ${m}x + ${c}$.`,
      ];
      conclusion = `The slope-intercept equation is $y = ${m}x + ${c}$.`;
      hint = `Isolate $y$ on the left side by adding the $x$ term and dividing through by 2.`;
    }
  } else if (stageId === 64) {
    // Function Notation & Domain/Range: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Evaluate composite function
      const a = prng.int(2, 4);
      const gVal = a * a;
      const ans = 2 * gVal + 3;
      questionText = `Given $f(x) = 2x + 3$ and $g(x) = x^2$, evaluate the composite function $f(g(${a}))$.`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$f(x) = 2x + 3$, $g(x) = x^2$, input $x = ${a}$.`;
      required = `$f(g(${a}))$.`;
      method = `Evaluate inside first: $g(${a}) = ${a}^2 = ${gVal}$. Then $f(${gVal}) = 2(${gVal}) + 3 = ${ans}$.`;
      steps = [
        `$g(${a}) = ${a}^2 = ${gVal}$.`,
        `$f(${gVal}) = 2(${gVal}) + 3 = ${ans}$.`,
      ];
      conclusion = `$f(g(${a})) = ${ans}$.`;
      hint = `Calculate $g(${a})$ first, then substitute that result into $f(x)$.`;
    } else if (subtopicIndex === 1) {
      // Domain restriction
      const c = prng.int(3, 9);
      questionText = `What is the domain of the real-valued function: $$f(x) = \\frac{1}{x - ${c}}$$`;
      correctAnswer = `$x \\ne ${c}$ (all real numbers except $${c}$)`;
      rawDistractors = [
        `$x \\ge ${c}$`,
        `$x > 0$`,
        `$x \\ne -${c}$`,
      ];
      given = `Function $f(x) = \\frac{1}{x - ${c}}$.`;
      required = `Domain.`;
      method = `Division by zero is undefined: set denominator $x - ${c} \\ne 0 \\implies x \\ne ${c}$.`;
      steps = [`$x - ${c} = 0 \\implies x = ${c}$ is excluded.`];
      conclusion = `Domain is all reals except $x = ${c}$.`;
      hint = `The denominator cannot equal zero.`;
    } else if (subtopicIndex === 2) {
      // Inverse function
      const m = prng.int(2, 5);
      const b = prng.int(1, 6);
      questionText = `Find the inverse function $f^{-1}(x)$ for the linear function: $$f(x) = ${m}x + ${b}$$`;
      correctAnswer = `$f^{-1}(x) = \\frac{x - ${b}}{${m}}$`;
      rawDistractors = [
        `$f^{-1}(x) = \\frac{x + ${b}}{${m}}$`,
        `$f^{-1}(x) = ${m}x - ${b}$`,
        `$f^{-1}(x) = \\frac{1}{${m}x + ${b}}$`,
      ];
      given = `$f(x) = ${m}x + ${b}$.`;
      required = `Inverse $f^{-1}(x)$.`;
      method = `Let $y = ${m}x + ${b}$. Swap variables: $x = ${m}y + ${b} \\implies ${m}y = x - ${b} \\implies y = \\frac{x - ${b}}{${m}}$.`;
      steps = [`$x = ${m}y + ${b} \\implies y = \\frac{x - ${b}}{${m}}$.`];
      conclusion = `$f^{-1}(x) = \\frac{x - ${b}}{${m}}$.`;
      hint = `Replace $f(x)$ with $y$, swap $x$ and $y$, and solve for $y$.`;
    } else if (subtopicIndex === 3) {
      // Solve for input given output
      const m = prng.int(3, 6);
      const c = prng.int(2, 8);
      const target = prng.int(20, 40);
      const x = 5;
      const out = m * x + c;
      questionText = `If $f(x) = ${m}x + ${c}$, for what value of $x$ does $f(x) = ${out}$?`;
      correctAnswer = `$x = ${x}$`;
      rawDistractors = [`$x = ${x + 1}$`, `$x = ${x - 1}$`, `$x = ${x + 2}$`];
      given = `$f(x) = ${m}x + ${c} = ${out}$.`;
      required = `Value of $x$.`;
      method = `$${m}x + ${c} = ${out} \\implies ${m}x = ${out - c} \\implies x = ${x}$.`;
      steps = [`$${m}x = ${out - c} \\implies x = ${x}$.`];
      conclusion = `$x = ${x}$.`;
      hint = `Set $f(x)$ equal to $${out}$ and solve for $x$.`;
    } else {
      // Range of quadratic
      const k = prng.int(2, 8);
      questionText = `What is the range of the quadratic function: $$f(x) = x^2 + ${k}$$ for all real $x$?`;
      correctAnswer = `$f(x) \\ge ${k}$`;
      rawDistractors = [`$f(x) > 0$`, `$f(x) \\le ${k}$`, `$\\text{All real numbers}$`];
      given = `$f(x) = x^2 + ${k}$.`;
      required = `Range of $f(x)$.`;
      method = `Since $x^2 \\ge 0$ for all real $x$, the minimum value is $0 + ${k} = ${k}$. Thus $f(x) \\ge ${k}$.`;
      steps = [`$x^2 \\ge 0 \\implies x^2 + ${k} \\ge ${k}$.`];
      conclusion = `Range is $[${k}, \\infty)$ or $f(x) \\ge ${k}$.`;
      hint = `Since $x^2$ is never negative, what is the smallest value $x^2 + ${k}$ can take?`;
    }
  } else if (stageId === 65) {
    // Quadratic Functions & Graphs: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Vertex x-coordinate
      const b = 2 * prng.int(2, 6);
      const h = b / 2;
      questionText = `What is the $x$-coordinate of the vertex of the parabola: $$y = x^2 - ${b}x + 7$$`;
      correctAnswer = `$x = ${h}$`;
      rawDistractors = [`$x = -${h}$`, `$x = ${b}$`, `$x = 7$`];
      given = `Parabola $y = x^2 - ${b}x + 7$.`;
      required = `Vertex $x$-coordinate.`;
      method = `Vertex formula: $x_v = -\\frac{b}{2a} = -\\frac{-${b}}{2(1)} = ${h}$.`;
      steps = [`$x_v = \\frac{${b}}{2} = ${h}$.`];
      conclusion = `Vertex $x = ${h}$.`;
      hint = `Use the axis of symmetry formula $x = -\\frac{b}{2a}$.`;
    } else if (subtopicIndex === 1) {
      // Roots by factoring
      const r1 = prng.int(1, 4);
      const r2 = prng.int(2, 6);
      const sum = r1 + r2;
      const prod = r1 * r2;
      questionText = `Find the zeros of the quadratic function: $$f(x) = x^2 - ${sum}x + ${prod}$$`;
      correctAnswer = `$x = ${Math.min(r1, r2)}, \\; x = ${Math.max(r1, r2)}$`;
      rawDistractors = [
        `$x = -${r1}, \\; x = -${r2}$`,
        `$x = ${r1 + 1}, \\; x = ${r2 + 1}$`,
        `$x = 0, \\; x = ${sum}$`,
      ];
      given = `$f(x) = x^2 - ${sum}x + ${prod} = 0$.`;
      required = `Zeros of $f(x)$.`;
      method = `Factor: $(x - ${r1})(x - ${r2}) = 0 \\implies x = ${r1}$ or $x = ${r2}$.`;
      steps = [`Factor into $(x - ${r1})(x - ${r2}) = 0$.`];
      conclusion = `Zeros are $x = ${r1}$ and $x = ${r2}$.`;
      hint = `Find two numbers that multiply to $${prod}$ and add up to $-${sum}$.`;
    } else if (subtopicIndex === 2) {
      // Discriminant and nature of roots
      const deltaType = prng.pick(['zero', 'positive', 'negative']);
      let aQuad = 1;
      let bQuad = 6;
      let cQuad = 9;
      let natureStr = '';
      let deltaVal = 0;
      if (deltaType === 'zero') {
        const root = prng.pick([2, 3, 4, 5]);
        bQuad = 2 * root;
        cQuad = root * root;
        deltaVal = 0;
        natureStr = `\\text{Exactly one real repeated root (}\\Delta = 0\\text{)}`;
      } else if (deltaType === 'positive') {
        const rA = prng.int(1, 3);
        const rB = rA + prng.int(1, 4);
        bQuad = rA + rB;
        cQuad = rA * rB;
        deltaVal = bQuad * bQuad - 4 * aQuad * cQuad;
        natureStr = `\\text{Two distinct real roots (}\\Delta > 0\\text{)}`;
      } else {
        bQuad = prng.pick([2, 4]);
        cQuad = bQuad * bQuad + prng.int(1, 5);
        deltaVal = bQuad * bQuad - 4 * aQuad * cQuad;
        natureStr = `\\text{Two complex conjugate roots (}\\Delta < 0\\text{)}`;
      }
      questionText = `What is the nature of the roots of the quadratic equation $x^2 - ${bQuad}x + ${cQuad} = 0$ based on its discriminant $\\Delta$?`;
      correctAnswer = `$${natureStr}$`;
      rawDistractors = [
        `\\text{Exactly one real repeated root (}\\Delta = 0\\text{)}`,
        `\\text{Two distinct real roots (}\\Delta > 0\\text{)}`,
        `\\text{Two complex conjugate roots (}\\Delta < 0\\text{)}`,
      ].filter(ans => ans !== natureStr).map(ans => `$${ans}$`);
      rawDistractors.push(`$\\text{Infinite real solutions}$`);
      rawDistractors = rawDistractors.slice(0, 3);
      given = `Equation $x^2 - ${bQuad}x + ${cQuad} = 0$.`;
      required = `Nature of roots.`;
      method = `Discriminant $\\Delta = b^2 - 4ac = (-${bQuad})^2 - 4(1)(${cQuad}) = ${deltaVal}$. ${deltaVal > 0 ? 'Since $\\Delta > 0$, there are two distinct real roots.' : deltaVal === 0 ? 'Since $\\Delta = 0$, there is exactly one repeated real root.' : 'Since $\\Delta < 0$, there are two complex conjugate roots.'}`;
      steps = [`$\\Delta = ${bQuad * bQuad} - ${4 * cQuad} = ${deltaVal}$.`];
      conclusion = `${natureStr}.`;
      hint = `Evaluate $\\Delta = b^2 - 4ac$. Check whether $\\Delta > 0$, $\\Delta = 0$, or $\\Delta < 0$.`;
    } else if (subtopicIndex === 3) {
      // Direction of opening and extremum
      const aLeading = prng.pick([-5, -4, -3, -2, 2, 3, 4, 5]);
      const bLin = prng.int(2, 6);
      const cConst = prng.int(1, 5);
      const opensUp = aLeading > 0;
      questionText = `Does the parabola defined by $y = ${aLeading}x^2 + ${bLin}x - ${cConst}$ open upwards or downwards, and does it have a maximum or minimum at its vertex?`;
      correctAnswer = opensUp
        ? `$\\text{Opens upwards with a minimum}$`
        : `$\\text{Opens downwards with a maximum}$`;
      rawDistractors = opensUp
        ? [
            `$\\text{Opens downwards with a maximum}$`,
            `$\\text{Opens upwards with a maximum}$`,
            `$\\text{Opens downwards with a minimum}$`,
          ]
        : [
            `$\\text{Opens upwards with a minimum}$`,
            `$\\text{Opens upwards with a maximum}$`,
            `$\\text{Opens downwards with a minimum}$`,
          ];
      given = `Parabola with leading coefficient $a = ${aLeading}$.`;
      required = `Opening direction and extremum type.`;
      method = opensUp
        ? `Since leading coefficient $a = ${aLeading} > 0$, the parabola opens upwards and has a minimum at its vertex.`
        : `Since leading coefficient $a = ${aLeading} < 0$, the parabola opens downwards and has a maximum at its vertex.`;
      steps = [
        opensUp
          ? `$a = ${aLeading} > 0 \\implies \\text{opens upwards (minimum)}$.`
          : `$a = ${aLeading} < 0 \\implies \\text{opens downwards (maximum)}$.`,
      ];
      conclusion = correctAnswer;
      hint = `The sign of $a$ determines the direction: positive opens upwards (minimum), negative opens downwards (maximum).`;
    } else {
      // Function evaluation on quadratic curve
      const a = prng.pick([2, 3]);
      const b = prng.pick([3, 4]);
      const c = prng.int(1, 6);
      const xInput = 2;
      const ans = a * (xInput * xInput) - b * xInput + c;
      questionText = `For the quadratic function $f(x) = ${a}x^2 - ${b}x + ${c}$, calculate the value of $f(${xInput})$:`;
      correctAnswer = `$${ans}$`;
      rawDistractors = [`$${ans + 4}$`, `$${ans - 2}$`, `$${ans + 2}$`];
      given = `Function $f(x) = ${a}x^2 - ${b}x + ${c}$, input $x = ${xInput}$.`;
      required = `Value of $f(${xInput})$.`;
      method = `Substitute $x = ${xInput}$ into the expression: $f(${xInput}) = ${a}(${xInput}^2) - ${b}(${xInput}) + ${c}$.`;
      steps = [
        `$f(${xInput}) = ${a}(4) - ${b * xInput} + ${c} = ${4 * a} - ${b * xInput} + ${c} = ${ans}$.`,
      ];
      conclusion = `$f(${xInput}) = ${ans}$.`;
      hint = `Substitute $x = ${xInput}$ into each term and compute following order of operations.`;
    }
  } else if (stageId >= 66 && stageId <= 70) {
    // Advanced Functions, Transformations & Mastery: 5 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Horizontal translation
      const h = prng.int(2, 9);
      const isRight = prng.pick([true, false]);
      questionText = `How is the graph of $g(x) = f(x ${isRight ? `- ${h}` : `+ ${h}`})$ transformed relative to the graph of $f(x)$?`;
      correctAnswer = isRight ? `$\\text{Shifted ${h} units to the right}$` : `$\\text{Shifted ${h} units to the left}$`;
      rawDistractors = [
        isRight ? `$\\text{Shifted ${h} units to the left}$` : `$\\text{Shifted ${h} units to the right}$`,
        `$\\text{Shifted ${h} units upwards}$`,
        `$\\text{Shifted ${h} units downwards}$`,
      ];
      given = `Transformation $g(x) = f(x ${isRight ? `- ${h}` : `+ ${h}`})$.`;
      required = `Geometric shift description.`;
      method = isRight
        ? `Replacing $x$ with $x - ${h}$ shifts the graph horizontally to the right by ${h} units.`
        : `Replacing $x$ with $x + ${h}$ shifts the graph horizontally to the left by ${h} units.`;
      steps = [`$f(x ${isRight ? `- ${h}` : `+ ${h}`})$ shifts the graph ${h} units ${isRight ? 'right' : 'left'}.`];
      conclusion = correctAnswer;
      hint = `Inside the function argument: minus shifts right, plus shifts left.`;
    } else if (subtopicIndex === 1) {
      // Vertical translation
      const k = prng.int(2, 12);
      const isUp = prng.pick([true, false]);
      questionText = `How is the graph of $g(x) = f(x) ${isUp ? `+ ${k}` : `- ${k}`}$ obtained from the graph of $f(x)$?`;
      correctAnswer = isUp ? `$\\text{Shifted ${k} units upwards}$` : `$\\text{Shifted ${k} units downwards}$`;
      rawDistractors = [
        isUp ? `$\\text{Shifted ${k} units downwards}$` : `$\\text{Shifted ${k} units upwards}$`,
        `$\\text{Shifted ${k} units to the right}$`,
        `$\\text{Shifted ${k} units to the left}$`,
      ];
      given = `Transformation $g(x) = f(x) ${isUp ? `+ ${k}` : `- ${k}`}$.`;
      required = `Shift direction.`;
      method = `Adding/subtracting a constant outside the function shifts the graph vertically.`;
      steps = [`$f(x) ${isUp ? `+ ${k}` : `- ${k}`}$ shifts the graph ${k} units ${isUp ? 'up' : 'down'}.`];
      conclusion = correctAnswer;
      hint = `Adding a positive constant shifts UP; subtracting shifts DOWN.`;
    } else if (subtopicIndex === 2) {
      // Even / Odd function
      const symmetryCases = [
        { q: 'A function satisfies $f(-x) = -f(x)$ for all $x$ in its domain. What type of function is $f(x)$?', ans: '\\text{Odd function (origin symmetry)}', dist: ['\\text{Even function (y-axis symmetry)}', '\\text{Periodic function}', '\\text{Linear function}'] },
        { q: 'A function satisfies $f(-x) = f(x)$ for all $x$ in its domain. What type of function is $f(x)$?', ans: '\\text{Even function (y-axis symmetry)}', dist: ['\\text{Odd function (origin symmetry)}', '\\text{One-to-one function}', '\\text{Inverse function}'] },
        { q: 'Classify the symmetry of the polynomial function: $$f(x) = x^4 + 3x^2 - 5$$', ans: '\\text{Even function (symmetric about the y-axis)}', dist: ['\\text{Odd function (origin symmetry)}', '\\text{Neither even nor odd}', '\\text{Rotational symmetry}'] },
        { q: 'Classify the symmetry of the cubic function: $$f(x) = x^3 - 7x$$', ans: '\\text{Odd function (symmetric about the origin)}', dist: ['\\text{Even function (y-axis symmetry)}', '\\text{Neither even nor odd}', '\\text{Translational symmetry}'] },
        { q: 'Classify the symmetry of the trigonometric function $f(x) = \\cos(x)$:', ans: '\\text{Even function (symmetric about the y-axis)}', dist: ['\\text{Odd function (origin symmetry)}', '\\text{Neither even nor odd}', '\\text{Linear function}'] },
        { q: 'Classify the symmetry of the trigonometric function $f(x) = \\sin(x)$:', ans: '\\text{Odd function (symmetric about the origin)}', dist: ['\\text{Even function (y-axis symmetry)}', '\\text{Neither even nor odd}', '\\text{Exponential function}'] },
      ];
      const sc = prng.pick(symmetryCases);
      questionText = sc.q;
      correctAnswer = `$${sc.ans}$`;
      rawDistractors = sc.dist.map(d => `$${d}$`);
      given = `Function definition.`;
      required = `Symmetry classification.`;
      method = `Check $f(-x)$: equals $f(x) \\implies$ even; equals $-f(x) \\implies$ odd.`;
      steps = [`Evaluating at $-x$ yields: $${sc.ans}$.`];
      conclusion = `$${sc.ans}$.`;
      hint = `Even functions: $f(-x) = f(x)$ (y-axis symmetry). Odd functions: $f(-x) = -f(x)$ (origin symmetry).`;
    } else if (subtopicIndex === 3) {
      // Horizontal asymptote of rational function
      const a = prng.int(2, 9);
      const b = prng.int(2, 8);
      const c = prng.int(1, 9);
      const d = prng.int(1, 9);
      questionText = `Find the horizontal asymptote of the rational function: $$f(x) = \\frac{${a}x + ${c}}{${b}x - ${d}}$$ as $x \\to \\pm\\infty$.`;
      correctAnswer = `$y = \\frac{${a}}{${b}}$`;
      rawDistractors = [`$y = 0$`, `$y = \\frac{${c}}{${d}}$`, `$y = ${a * b}$`];
      given = `Function $f(x) = \\frac{${a}x + ${c}}{${b}x - ${d}}$.`;
      required = `Horizontal asymptote.`;
      method = `For rational functions with equal degrees in numerator and denominator, the horizontal asymptote is the ratio of leading coefficients: $y = \\frac{${a}}{${b}}$.`;
      steps = [`$\\lim_{x \\to \\infty} \\frac{${a}x + ${c}}{${b}x - ${d}} = \\frac{${a}}{${b}}$.`];
      conclusion = `Horizontal asymptote is $y = \\frac{${a}}{${b}}$.`;
      hint = `Take the ratio of the coefficients of the highest power of $x$ ($\frac{${a}}{${b}}$).`;
    } else {
      // Exponential base evaluation
      const base = prng.pick([2, 3, 4, 5, 10]);
      const exp = base >= 5 ? prng.int(2, 3) : prng.int(2, 5);
      const val = Math.pow(base, exp);
      questionText = `If $f(x) = ${base}^x$, what is the value of $f(${exp})$?`;
      correctAnswer = `$${val}$`;
      const dist = generateNumericalDistractors(val, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Exponential function $f(x) = ${base}^x$, input $x = ${exp}$.`;
      required = `Value of $f(${exp})$.`;
      method = `$f(${exp}) = ${base}^{${exp}} = ${val}$.`;
      steps = [`$${base}^{${exp}} = ${val}$.`];
      conclusion = `$f(${exp}) = ${val}$.`;
    }
  }

  // ==========================================
  // WORLD 8: TRIGONOMETRY & ADVANCED ALGEBRA (Stages 71-80)
  // ==========================================
  else if (stageId === 71 || stageId === 72) {
    // Trigonometric Ratios & Right Triangles: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Special exact values (9 diverse ratios)
      const specialValues = [
        { func: '\\sin(30^\\circ)', ans: '\\frac{1}{2}', dist: ['\\frac{\\sqrt{3}}{2}', '\\frac{\\sqrt{2}}{2}', '1'], deg: 30 },
        { func: '\\cos(30^\\circ)', ans: '\\frac{\\sqrt{3}}{2}', dist: ['\\frac{1}{2}', '\\frac{\\sqrt{2}}{2}', '\\frac{1}{\\sqrt{3}}'], deg: 30 },
        { func: '\\tan(30^\\circ)', ans: '\\frac{\\sqrt{3}}{3}', dist: ['\\sqrt{3}', '1', '\\frac{1}{2}'], deg: 30 },
        { func: '\\sin(45^\\circ)', ans: '\\frac{\\sqrt{2}}{2}', dist: ['\\frac{1}{2}', '\\frac{\\sqrt{3}}{2}', '1'], deg: 45 },
        { func: '\\cos(45^\\circ)', ans: '\\frac{\\sqrt{2}}{2}', dist: ['\\frac{1}{2}', '\\frac{\\sqrt{3}}{2}', '\\frac{1}{\\sqrt{3}}'], deg: 45 },
        { func: '\\tan(45^\\circ)', ans: '1', dist: ['\\sqrt{3}', '\\frac{\\sqrt{3}}{3}', '\\frac{1}{2}'], deg: 45 },
        { func: '\\sin(60^\\circ)', ans: '\\frac{\\sqrt{3}}{2}', dist: ['\\frac{1}{2}', '\\frac{\\sqrt{2}}{2}', '1'], deg: 60 },
        { func: '\\cos(60^\\circ)', ans: '\\frac{1}{2}', dist: ['\\frac{\\sqrt{3}}{2}', '\\frac{\\sqrt{2}}{2}', '\\frac{1}{\\sqrt{3}}'], deg: 60 },
        { func: '\\tan(60^\\circ)', ans: '\\sqrt{3}', dist: ['\\frac{\\sqrt{3}}{3}', '1', '\\frac{1}{2}'], deg: 60 },
      ];
      const sv = prng.pick(specialValues);
      questionText = `What is the exact value of $${sv.func}$?`;
      correctAnswer = `$${sv.ans}$`;
      rawDistractors = sv.dist.map(d => `$${d}$`);
      given = `Expression $${sv.func}$.`;
      required = `Exact trigonometric value.`;
      method = `From standard reference triangles ($30^\\circ-60^\\circ-90^\\circ$ or $45^\\circ-45^\\circ-90^\\circ$).`;
      steps = [`Standard special angle value: $${sv.func} = ${sv.ans}$.`];
      conclusion = `$${sv.func} = ${sv.ans}$.`;
      hint = `Recall the special right triangle ratios: sides $1 - \\sqrt{3} - 2$ or $1 - 1 - \\sqrt{2}$.`;
    } else if (subtopicIndex === 1) {
      // SOH: find opposite side given hypotenuse and sin(30)
      const hyp = 2 * prng.int(4, 25);
      const opp = hyp / 2;
      questionText = `In a right triangle with an acute angle of $30^\\circ$, the hypotenuse is $c = ${hyp}\\text{ cm}$. What is the length of the opposite side?`;
      correctAnswer = `$${opp}\\text{ cm}$`;
      rawDistractors = [`$${hyp}\\text{ cm}$`, `$${opp + 2}\\text{ cm}$`, `$${Math.round(hyp * 0.866)}\\text{ cm}$`];
      given = `Angle $\\theta = 30^\\circ$, hypotenuse $c = ${hyp}\\text{ cm}$.`;
      required = `Opposite side length.`;
      method = `$\\sin(30^\\circ) = \\frac{\\text{opposite}}{\\text{hypotenuse}} = \\frac{1}{2} \\implies \\text{opposite} = \\frac{1}{2} \\times ${hyp} = ${opp}\\text{ cm}$.`;
      steps = [`$\\text{opposite} = ${hyp} \\times \\sin(30^\\circ) = ${hyp} \\times \\frac{1}{2} = ${opp}\\text{ cm}$.`];
      conclusion = `The opposite side is $${opp}\\text{ cm}$.`;
      hint = `In a $30^\\circ$ right triangle, the opposite leg is always half of the hypotenuse.`;
    } else if (subtopicIndex === 2) {
      // TOA: tangent definition
      const opp = prng.int(2, 12);
      const adj = prng.int(3, 15);
      questionText = `In a right triangle, the side opposite angle $\\theta$ is $${opp}\\text{ cm}$ and the adjacent side is $${adj}\\text{ cm}$. What is $\\tan(\\theta)$?`;
      const g = gcd(opp, adj);
      correctAnswer = `$\\frac{${opp / g}}{${adj / g}}$`;
      rawDistractors = [`$\\frac{${adj / g}}{${opp / g}}$`, `$\\frac{${opp}}{${opp + adj}}$`, `$\\frac{${opp / g}}{10}$`];
      given = `Opposite $= ${opp}$, Adjacent $= ${adj}$.`;
      required = `$\\tan(\\theta)$.`;
      method = `$\\tan(\\theta) = \\frac{\\text{Opposite}}{\\text{Adjacent}} = \\frac{${opp}}{${adj}}$.`;
      steps = [`$\\tan(\\theta) = \\frac{${opp}}{${adj}} = \\frac{${opp / g}}{${adj / g}}$.`];
      conclusion = `$\\tan(\\theta) = \\frac{${opp / g}}{${adj / g}}$.`;
      hint = `Remember TOA: $\\tan(\\theta) = \\frac{\\text{Opposite}}{\\text{Adjacent}}$.`;
    } else if (subtopicIndex === 3) {
      // Angle of elevation
      const dist = prng.pick([15, 20, 25, 30, 35, 40, 50, 60, 75, 80, 100, 120, 150]);
      questionText = `From a point on level ground $${dist}\\text{ m}$ from the base of a vertical tower, the angle of elevation to the top is $45^\\circ$. What is the height of the tower?`;
      correctAnswer = `$${dist}\\text{ m}$`;
      rawDistractors = [`$${2 * dist}\\text{ m}$`, `$${Math.round(dist * 0.707)}\\text{ m}$`, `$${Math.round(dist * 1.414)}\\text{ m}$`];
      given = `Adjacent distance $= ${dist}\\text{ m}$, elevation angle $= 45^\\circ$.`;
      required = `Height $h$.`;
      method = `$\\tan(45^\\circ) = \\frac{h}{${dist}} \\implies 1 = \\frac{h}{${dist}} \\implies h = ${dist}\\text{ m}$.`;
      steps = [`$h = ${dist} \\times \\tan(45^\\circ) = ${dist} \\times 1 = ${dist}\\text{ m}$.`];
      conclusion = `The height is $${dist}\\text{ m}$.`;
      hint = `Since $\\tan(45^\\circ) = 1$, the height equals the horizontal distance to the tower!`;
    } else {
      // Radian to degrees
      const radItems = [
        { rad: '\\frac{\\pi}{6}', deg: 30 },
        { rad: '\\frac{\\pi}{4}', deg: 45 },
        { rad: '\\frac{\\pi}{3}', deg: 60 },
        { rad: '\\frac{\\pi}{2}', deg: 90 },
        { rad: '\\frac{2\\pi}{3}', deg: 120 },
        { rad: '\\frac{3\\pi}{4}', deg: 135 },
      ];
      const item = prng.pick(radItems);
      questionText = `Convert $${item.rad}\\text{ radians}$ to degrees.`;
      correctAnswer = `$${item.deg}^\\circ$`;
      rawDistractors = [`$${item.deg + 15}^\\circ$`, `$${Math.max(15, item.deg - 15)}^\\circ$`, `$${item.deg + 30}^\\circ$`];
      given = `Angle $${item.rad}\\text{ rad}$.`;
      required = `Degrees.`;
      method = `Multiply by $\\frac{180^\\circ}{\\pi}$: $${item.rad} \\times \\frac{180^\\circ}{\\pi} = ${item.deg}^\\circ$.`;
      steps = [`$${item.rad} \\times \\frac{180^\\circ}{\\pi} = ${item.deg}^\\circ$.`];
      conclusion = `Equivalent to $${item.deg}^\\circ$.`;
      hint = `Substitute $\\pi = 180^\\circ$.`;
    }
  } else if (stageId === 73 || stageId === 74) {
    // Exponents, Surds & Logarithms: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Fractional exponent
      const val = prng.pick([8, 27, 64, 125]);
      const cubeRoot = Math.round(Math.pow(val, 1 / 3));
      questionText = `Evaluate the fractional exponent expression: $$${val}^{\\frac{1}{3}}$$`;
      correctAnswer = `$${cubeRoot}$`;
      rawDistractors = [`$${cubeRoot * 2}$`, `$${Math.round(val / 3)}$`, `$${cubeRoot + 1}$`];
      given = `Power $${val}^{1/3}$.`;
      required = `Value.`;
      method = `$x^{1/3} = \\sqrt[3]{x}$. Since $${cubeRoot}^3 = ${val}$, the answer is $${cubeRoot}$.`;
      steps = [`$\\sqrt[3]{${val}} = ${cubeRoot}$.`];
      conclusion = `Value is $${cubeRoot}$.`;
      hint = `An exponent of $\\frac{1}{3}$ is the cube root.`;
    } else if (subtopicIndex === 1) {
      // Simplify surd sqrt(a^2 * b)
      const a = prng.pick([2, 3, 4, 5]);
      const b = prng.pick([2, 3, 5, 7]);
      const product = a * a * b;
      questionText = `Simplify the radical into standard form $a\\sqrt{b}$: $$\\sqrt{${product}}$$`;
      correctAnswer = `$${a}\\sqrt{${b}}$`;
      rawDistractors = [`$${b}\\sqrt{${a}}$`, `$${a * 2}\\sqrt{${b}}$`, `$${product / 2}$`];
      given = `Radical $\\sqrt{${product}}$.`;
      required = `Simplified radical.`;
      method = `$\\sqrt{${product}} = \\sqrt{${a * a} \\times ${b}} = \\sqrt{${a * a}} \\times \\sqrt{${b}} = ${a}\\sqrt{${b}}$.`;
      steps = [`$\\sqrt{${a}^2 \\cdot ${b}} = ${a}\\sqrt{${b}}$.`];
      conclusion = `$${a}\\sqrt{${b}}$.`;
      hint = `Find the largest perfect square factor inside the square root.`;
    } else if (subtopicIndex === 2) {
      // Basic log evaluation
      const base = prng.pick([2, 3, 5, 10]);
      const power = prng.int(2, 4);
      const val = Math.pow(base, power);
      questionText = `Evaluate the logarithm: $$\\log_{${base}}(${val})$$`;
      correctAnswer = `$${power}$`;
      rawDistractors = [`$${power + 1}$`, `$${Math.max(1, power - 1)}$`, `$${base}$`];
      given = `Logarithm $\\log_{${base}}(${val})$.`;
      required = `Exponent value.`;
      method = `$\\log_b(x) = y \\iff b^y = x$. Since $${base}^{${power}} = ${val}$, $\\log_{${base}}(${val}) = ${power}$.`;
      steps = [`$${base}^{${power}} = ${val} \\implies \\log_{${base}}(${val}) = ${power}$.`];
      conclusion = `The value is $${power}$.`;
      hint = `Ask yourself: to what power must ${base} be raised to get ${val}?`;
    } else if (subtopicIndex === 3) {
      // Rationalize denominator
      const c = prng.pick([2, 3, 5]);
      questionText = `Rationalize the denominator of the fraction: $$\\frac{${c}}{\\sqrt{${c}}}$$`;
      correctAnswer = `$\\sqrt{${c}}$`;
      rawDistractors = [`$\\frac{1}{\\sqrt{${c}}}$`, `$${c}$`, `$${c}\\sqrt{${c}}$`];
      given = `Fraction $\\frac{${c}}{\\sqrt{${c}}}$.`;
      required = `Rationalized form.`;
      method = `Multiply numerator and denominator by $\\sqrt{${c}}$: $\\frac{${c}\\sqrt{${c}}}{(\\sqrt{${c}})^2} = \\frac{${c}\\sqrt{${c}}}{${c}} = \\sqrt{${c}}$.`;
      steps = [`$\\frac{${c}\\sqrt{${c}}}{${c}} = \\sqrt{${c}}$.`];
      conclusion = `Result is $\\sqrt{${c}}$.`;
      hint = `Multiply top and bottom by $\\sqrt{${c}}$ to clear the radical from the bottom.`;
    } else {
      // Logarithm laws and evaluations
      const logMode = prng.pick(['product', 'quotient', 'power', 'eval']);
      const base = prng.pick([2, 3, 5, 10]);
      if (logMode === 'product') {
        questionText = `According to the product law of logarithms, the expression $\\log_{${base}}(a) + \\log_{${base}}(b)$ is identically equal to:`;
        correctAnswer = `$\\log_{${base}}(ab)$`;
        rawDistractors = [
          `$\\log_{${base}}(a + b)$`,
          `$\\frac{\\log_{${base}}(a)}{\\log_{${base}}(b)}$`,
          `$\\log_{${base}}(a^b)$`,
        ];
        given = `Sum of logarithms $\\log_{${base}}(a) + \\log_{${base}}(b)$.`;
        required = `Single logarithm.`;
        method = `Product law of logarithms: $\\log_b(x) + \\log_b(y) = \\log_b(xy)$.`;
        steps = [`$\\log_{${base}}(a) + \\log_{${base}}(b) = \\log_{${base}}(ab)$.`];
        conclusion = `$\\log_{${base}}(ab)$.`;
        hint = `Adding logarithms with the same base corresponds to multiplying their arguments.`;
      } else if (logMode === 'quotient') {
        questionText = `According to the quotient law of logarithms, the expression $\\log_{${base}}(a) - \\log_{${base}}(b)$ is identically equal to:`;
        correctAnswer = `$\\log_{${base}}\\left(\\frac{a}{b}\\right)$`;
        rawDistractors = [
          `$\\frac{\\log_{${base}}(a)}{\\log_{${base}}(b)}$`,
          `$\\log_{${base}}(a - b)$`,
          `$\\log_{${base}}(a) \\cdot \\log_{${base}}(b)$`,
        ];
        given = `Difference of logarithms $\\log_{${base}}(a) - \\log_{${base}}(b)$.`;
        required = `Single logarithm.`;
        method = `Quotient law of logarithms: $\\log_b(x) - \\log_b(y) = \\log_b(x/y)$.`;
        steps = [`$\\log_{${base}}(a) - \\log_{${base}}(b) = \\log_{${base}}(a/b)$.`];
        conclusion = `$\\log_{${base}}\\left(\\frac{a}{b}\\right)$.`;
        hint = `Subtracting logarithms with the same base corresponds to dividing their arguments.`;
      } else if (logMode === 'power') {
        const exp = prng.int(2, 6);
        questionText = `According to the power law of logarithms, the expression $\\log_{${base}}(x^{${exp}})$ simplifies to:`;
        correctAnswer = `$${exp}\\log_{${base}}(x)$`;
        rawDistractors = [
          `$(\\log_{${base}}(x))^{${exp}}$`,
          `$\\log_{${base}}(${exp}x)$`,
          `$\\frac{\\log_{${base}}(x)}{${exp}}$`,
        ];
        given = `Logarithmic power $\\log_{${base}}(x^{${exp}})$.`;
        required = `Equivalent expression.`;
        method = `Power law of logarithms: $\\log_b(x^k) = k \\log_b(x)$.`;
        steps = [`$\\log_{${base}}(x^{${exp}}) = ${exp}\\log_{${base}}(x)$.`];
        conclusion = `$${exp}\\log_{${base}}(x)$.`;
        hint = `The exponent inside the logarithm comes to the front as a multiplier.`;
      } else {
        const p = prng.int(2, 4);
        const val = Math.pow(base, p);
        questionText = `Evaluate the exact value of the logarithm: $$\\log_{${base}}(${val})$$`;
        correctAnswer = `$${p}$`;
        rawDistractors = [`$${p + 1}$`, `$${Math.max(1, p - 1)}$`, `$${base}$`];
        given = `Logarithm $\\log_{${base}}(${val})$.`;
        required = `Evaluated integer.`;
        method = `Since $${base}^{${p}} = ${val}$, by definition $\\log_{${base}}(${val}) = ${p}$.`;
        steps = [`$${base}^{${p}} = ${val} \\implies \\log_{${base}}(${val}) = ${p}$.`];
        conclusion = `The value is $${p}$.`;
        hint = `Ask yourself: to what power must $${base}$ be raised to get $${val}$?`;
      }
    }
  } else if (stageId === 75) {
    // Trig Identities & Equations: 5 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const k = prng.int(2, 20);
      questionText = `Simplify the trigonometric expression for all real values of $\\theta$: $$${k}\\sin^2(\\theta) + ${k}\\cos^2(\\theta)$$`;
      correctAnswer = `$${k}$`;
      rawDistractors = [`$${k * 2}$`, `$1$`, `$${k}\\tan^2(\\theta)$`];
      given = `$${k}\\sin^2(\\theta) + ${k}\\cos^2(\\theta)$.`;
      required = `Simplified value.`;
      method = `Factor out $${k}$: $${k}(\\sin^2(\\theta) + \\cos^2(\\theta)) = ${k}(1) = ${k}$.`;
      steps = [
        `Factor out $${k}$: $${k}(\\sin^2\\theta + \\cos^2\\theta)$.`,
        `By Pythagorean identity, $\\sin^2\\theta + \\cos^2\\theta = 1$.`,
        `$${k} \\times 1 = ${k}$.`,
      ];
      conclusion = `Value is $${k}$.`;
      hint = `Factor out $${k}$ and use the identity $\\sin^2\\theta + \\cos^2\\theta = 1$.`;
    } else if (subtopicIndex === 1) {
      const k = prng.int(2, 20);
      questionText = `Which expression is identically equivalent to $$\\frac{${k}\\sin(\\theta)}{\\cos(\\theta)}$$ for all angles where $\\cos(\\theta) \\ne 0$?`;
      correctAnswer = `$${k}\\tan(\\theta)$`;
      rawDistractors = [`$${k}\\cot(\\theta)$`, `$\\tan(${k}\\theta)$`, `$${k}$`];
      given = `Quotient $\\frac{${k}\\sin(\\theta)}{\\cos(\\theta)}$.`;
      required = `Equivalent trigonometric form.`;
      method = `Since $\\frac{\\sin\\theta}{\\cos\\theta} = \\tan\\theta$, $k \\frac{\\sin\\theta}{\\cos\\theta} = ${k}\\tan\\theta$.`;
      steps = [`$${k} \\times \\frac{\\sin\\theta}{\\cos\\theta} = ${k}\\tan(\\theta)$.`];
      conclusion = `It equals $${k}\\tan(\\theta)$.`;
      hint = `Recall that $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$.`;
    } else if (subtopicIndex === 2) {
      const eqOptions = [
        { func: '\\sin(\\theta)', val: '\\frac{1}{2}', deg: 30 },
        { func: '\\cos(\\theta)', val: '\\frac{1}{2}', deg: 60 },
        { func: '\\sin(\\theta)', val: '\\frac{\\sqrt{2}}{2}', deg: 45 },
        { func: '\\cos(\\theta)', val: '\\frac{\\sqrt{2}}{2}', deg: 45 },
        { func: '\\tan(\\theta)', val: '1', deg: 45 },
        { func: '\\cos(\\theta)', val: '\\frac{\\sqrt{3}}{2}', deg: 30 },
        { func: '\\sin(\\theta)', val: '\\frac{\\sqrt{3}}{2}', deg: 60 },
        { func: '\\tan(\\theta)', val: '\\sqrt{3}', deg: 60 },
        { func: '\\tan(\\theta)', val: '\\frac{\\sqrt{3}}{3}', deg: 30 },
        { func: '\\sin(\\theta)', val: '1', deg: 90 },
      ];
      const eq = prng.pick(eqOptions);
      questionText = `Solve the trigonometric equation for acute angle $\\theta$ ($0^\\circ \\le \\theta \\le 90^\\circ$): $$${eq.func} = ${eq.val}$$`;
      correctAnswer = `$\\theta = ${eq.deg}^\\circ$`;
      rawDistractors = [
        `$\\theta = ${eq.deg === 30 ? 60 : 30}^\\circ$`,
        `$\\theta = ${eq.deg === 45 ? 60 : 45}^\\circ$`,
        `$\\theta = 90^\\circ$`,
      ];
      given = `Equation $${eq.func} = ${eq.val}$ for acute $\\theta$.`;
      required = `Angle $\\theta$.`;
      method = `From standard trigonometric table of special acute angles, $\\theta = ${eq.deg}^\\circ$.`;
      steps = [`$${eq.func} = ${eq.val} \\implies \\theta = ${eq.deg}^\\circ$.`];
      conclusion = `$\\theta = ${eq.deg}^\\circ$.`;
      hint = `Recall which acute standard angle gives $${eq.val}$.`;
    } else if (subtopicIndex === 3) {
      const k = prng.int(2, 20);
      const coeff = 2 * k;
      questionText = `By the double-angle identity, the expression $$${k}\\sin(2\\theta)$$ is identically equal to:`;
      correctAnswer = `$${coeff}\\sin(\\theta)\\cos(\\theta)$`;
      rawDistractors = [
        `$${k}\\sin^2(\\theta) - ${k}\\cos^2(\\theta)$`,
        `$${k}\\sin(\\theta)\\cos(\\theta)$`,
        `$${coeff}\\cos(2\\theta)$`,
      ];
      given = `Double-angle term $${k}\\sin(2\\theta)$.`;
      required = `Expanded identity.`;
      method = `$\\sin(2\\theta) = 2\\sin(\\theta)\\cos(\\theta) \\implies ${k}\\sin(2\\theta) = ${coeff}\\sin(\\theta)\\cos(\\theta)$.`;
      steps = [`$${k}(2\\sin\\theta\\cos\\theta) = ${coeff}\\sin(\\theta)\\cos(\\theta)$.`];
      conclusion = `$${coeff}\\sin(\\theta)\\cos(\\theta)$.`;
      hint = `Recall the double-angle formula $\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta$.`;
    } else {
      const k = prng.int(2, 20);
      questionText = `According to Pythagorean identities, what does the expression $$${k} + ${k}\\tan^2(\\theta)$$ simplify to?`;
      correctAnswer = `$${k}\\sec^2(\\theta)$`;
      rawDistractors = [`$${k}\\csc^2(\\theta)$`, `$${k}\\sin^2(\\theta)$`, `$${k}\\cot^2(\\theta)$`];
      given = `Expression $${k} + ${k}\\tan^2(\\theta)$.`;
      required = `Simplified identity form.`;
      method = `Factor out $${k}$: $${k}(1 + \\tan^2(\\theta)) = ${k}\\sec^2(\\theta)$.`;
      steps = [
        `$${k}(1 + \\tan^2\\theta)$.`,
        `$1 + \\tan^2\\theta = \\sec^2\\theta$.`,
        `$${k}\\sec^2(\\theta)$.`,
      ];
      conclusion = `$${k}\\sec^2(\\theta)$.`;
      hint = `Factor out $${k}$ and use $1 + \\tan^2\\theta = \\sec^2\\theta$.`;
    }
  } else if (stageId === 76) {
    // Sequences: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Arithmetic n-th term
      const a1 = prng.int(3, 9);
      const d = prng.int(2, 6);
      const n = prng.pick([10, 12, 15, 20]);
      const termN = a1 + (n - 1) * d;
      questionText = `An arithmetic sequence has first term $a_1 = ${a1}$ and common difference $d = ${d}$. Find the $${n}\\text{-th}$ term $a_{${n}}$.`;
      correctAnswer = `$${termN}$`;
      const dist = generateNumericalDistractors(termN, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$a_1 = ${a1}$, $d = ${d}$, $n = ${n}$.`;
      required = `Term $a_{${n}}$.`;
      method = `$a_n = a_1 + (n - 1)d = ${a1} + (${n} - 1)(${d}) = ${termN}$.`;
      steps = [`$a_{${n}} = ${a1} + ${n - 1}(${d}) = ${termN}$.`];
      conclusion = `$a_{${n}} = ${termN}$.`;
      hint = `Use $a_n = a_1 + (n - 1)d$.`;
    } else if (subtopicIndex === 1) {
      // Geometric n-th term
      const a1 = prng.int(2, 5);
      const r = prng.pick([2, 3]);
      const n = prng.pick([4, 5]);
      const termN = a1 * Math.pow(r, n - 1);
      questionText = `A geometric sequence has first term $a_1 = ${a1}$ and common ratio $r = ${r}$. Find the $${n}\\text{-th}$ term $a_{${n}}$.`;
      correctAnswer = `$${termN}$`;
      const dist = generateNumericalDistractors(termN, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$a_1 = ${a1}$, $r = ${r}$, $n = ${n}$.`;
      required = `Term $a_{${n}}$.`;
      method = `$a_n = a_1 \\cdot r^{n-1} = ${a1} \\times ${r}^{${n - 1}} = ${termN}$.`;
      steps = [`$a_{${n}} = ${a1} \\times ${Math.pow(r, n - 1)} = ${termN}$.`];
      conclusion = `$a_{${n}} = ${termN}$.`;
      hint = `Use $a_n = a_1 \\cdot r^{n - 1}$.`;
    } else if (subtopicIndex === 2) {
      // Find common difference
      const a1 = prng.int(4, 10);
      const d = prng.int(3, 7);
      const a4 = a1 + 3 * d;
      questionText = `In an arithmetic sequence, $a_1 = ${a1}$ and $a_4 = ${a4}$. What is the common difference $d$?`;
      correctAnswer = `$d = ${d}$`;
      rawDistractors = [`$d = ${d + 1}$`, `$d = ${Math.max(1, d - 1)}$`, `$d = ${a4 - a1}$`];
      given = `$a_1 = ${a1}$, $a_4 = ${a4}$.`;
      required = `Common difference $d$.`;
      method = `$a_4 = a_1 + 3d \\implies 3d = ${a4} - ${a1} = ${a4 - a1} \\implies d = \\frac{${a4 - a1}}{3} = ${d}$.`;
      steps = [`$3d = ${a4 - a1} \\implies d = ${d}$.`];
      conclusion = `$d = ${d}$.`;
      hint = `Subtract $a_1$ from $a_4$ and divide by $3$.`;
    } else if (subtopicIndex === 3) {
      // Find common ratio
      const a1 = prng.int(2, 6);
      const r = prng.pick([2, 3, 4]);
      const a2 = a1 * r;
      const a3 = a2 * r;
      questionText = `Find the common ratio $r$ of the geometric sequence: $$${a1}, ${a2}, ${a3}, \\dots$$`;
      correctAnswer = `$r = ${r}$`;
      rawDistractors = [`$r = ${r + 1}$`, `$r = ${a2 - a1}$`, `$r = ${r * 2}$`];
      given = `Sequence: $${a1}, ${a2}, ${a3}$.`;
      required = `Common ratio $r$.`;
      method = `$r = \\frac{a_{n+1}}{a_n} = \\frac{${a2}}{${a1}} = ${r}$.`;
      steps = [`$r = \\frac{${a2}}{${a1}} = ${r}$.`];
      conclusion = `$r = ${r}$.`;
      hint = `Divide any term by the previous term.`;
    } else {
      // Find position n of a known term
      const a1 = 5;
      const d = 4;
      const n = prng.pick([6, 7, 8, 10]);
      const an = a1 + (n - 1) * d;
      questionText = `Which term in the arithmetic sequence $5, 9, 13, 17, \\dots$ is equal to $${an}$?`;
      correctAnswer = `$n = ${n}$`;
      rawDistractors = [`$n = ${n + 1}$`, `$n = ${n - 1}$`, `$n = ${n + 2}$`];
      given = `Sequence $a_1 = 5, d = 4$, target term $= ${an}$.`;
      required = `Term index $n$.`;
      method = `$a_n = 5 + (n - 1)(4) = ${an} \\implies 4(n - 1) = ${an - 5} \\implies n - 1 = ${(an - 5) / 4} \\implies n = ${n}$.`;
      steps = [`$4(n - 1) = ${an - 5} \\implies n = ${n}$.`];
      conclusion = `It is the $${n}\\text{th}$ term.`;
      hint = `Set $a_1 + (n - 1)d = ${an}$ and solve for $n$.`;
    }
  } else if (stageId >= 77 && stageId <= 80) {
    // Series, Advanced Trigonometry & Challenge: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Arithmetic series sum
      const n = prng.pick([8, 10, 12]);
      const a1 = prng.int(2, 6);
      const d = prng.int(2, 4);
      const an = a1 + (n - 1) * d;
      const sum = (n / 2) * (a1 + an);
      questionText = `Find the sum of the first $${n}$ terms of the arithmetic series with $a_1 = ${a1}$ and common difference $d = ${d}$.`;
      correctAnswer = `$${sum}$`;
      const dist = generateNumericalDistractors(sum, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$a_1 = ${a1}$, $d = ${d}$, $n = ${n}$.`;
      required = `Sum $S_{${n}}$.`;
      method = `$S_n = \\frac{n}{2}(2a_1 + (n - 1)d) = \\frac{${n}}{2}(${2 * a1} + ${(n - 1) * d}) = ${sum}$.`;
      steps = [`$S_{${n}} = \\frac{${n}}{2}(${2 * a1} + ${(n - 1) * d}) = ${sum}$.`];
      conclusion = `$S_{${n}} = ${sum}$.`;
      hint = `Use $S_n = \\frac{n}{2}[2a_1 + (n - 1)d]$.`;
    } else if (subtopicIndex === 1) {
      // Infinite geometric series sum
      const a = prng.pick([6, 9, 12, 18]);
      const rStr = '1/3';
      const sum = a / (1 - 1 / 3); // a / (2/3) = 1.5 * a
      questionText = `Find the sum of the convergent infinite geometric series with first term $a = ${a}$ and common ratio $r = \\frac{1}{3}$.`;
      correctAnswer = `$${sum}$`;
      const dist = generateNumericalDistractors(sum, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$a = ${a}$, $r = \\frac{1}{3}$.`;
      required = `Sum $S_\\infty$.`;
      method = `$S_\\infty = \\frac{a}{1 - r} = \\frac{${a}}{1 - 1/3} = \\frac{${a}}{2/3} = ${sum}$.`;
      steps = [`$S_\\infty = \\frac{${a}}{2/3} = ${sum}$.`];
      conclusion = `$S_\\infty = ${sum}$.`;
      hint = `Use the infinite series formula $S_\\infty = \\frac{a}{1 - r}$.`;
    } else if (subtopicIndex === 2) {
      // Triangle area via sine
      const a = prng.int(6, 12);
      const b = prng.int(8, 14);
      // C = 30 degrees => sin(30) = 0.5 => Area = 0.5 * a * b * 0.5 = 0.25 * a * b
      const area = 0.25 * a * b;
      questionText = `Find the area of a triangle having adjacent sides $a = ${a}\\text{ cm}$, $b = ${b}\\text{ cm}$, and included angle $C = 30^\\circ$.`;
      correctAnswer = `$${area}\\text{ cm}^2$`;
      rawDistractors = [`$${2 * area}\\text{ cm}^2$`, `$${a * b}\\text{ cm}^2$`, `$${area + 5}\\text{ cm}^2$`];
      given = `$a = ${a}$, $b = ${b}$, $C = 30^\\circ$.`;
      required = `Area $A$.`;
      method = `$A = \\frac{1}{2}ab\\sin(C) = \\frac{1}{2}(${a})(${b})\\sin(30^\\circ) = \\frac{1}{2}(${a * b})\\left(\\frac{1}{2}\\right) = ${area}\\text{ cm}^2$.`;
      steps = [`$A = \\frac{1}{2} \\times ${a} \\times ${b} \\times \\frac{1}{2} = ${area}\\text{ cm}^2$.`];
      conclusion = `The area is $${area}\\text{ cm}^2$.`;
      hint = `Apply $A = \\frac{1}{2}ab\\sin(C)$ where $\\sin(30^\\circ) = 0.5$.`;
    } else if (subtopicIndex === 3) {
      // Sine rule dynamic problem or identity
      const mode = prng.pick(['solve_side', 'formula_ratio', 'circumradius']);
      if (mode === 'solve_side') {
        const aSide = prng.pick([6, 8, 10, 12, 14]);
        const sinVal = prng.pick([
          { sinA: '\\frac{1}{2}', sinB: '\\frac{1}{3}', bAns: Math.round((aSide * (1/3)) / 0.5) },
          { sinA: '\\frac{1}{2}', sinB: '\\frac{\\sqrt{2}}{2}', bAns: Math.round(aSide * 1.414) },
          { sinA: '0.5', sinB: '0.8', bAns: Math.round((aSide * 0.8) / 0.5) },
        ]);
        questionText = `In $\\triangle ABC$, side $a = ${aSide}\\text{ cm}$, $\\sin(A) = ${sinVal.sinA}$, and $\\sin(B) = ${sinVal.sinB}$. By the Law of Sines, calculate the approximate length of side $b$:`;
        correctAnswer = `$b \\approx ${sinVal.bAns}\\text{ cm}$`;
        rawDistractors = [
          `$b \\approx ${sinVal.bAns + 3}\\text{ cm}$`,
          `$b \\approx ${Math.max(2, sinVal.bAns - 3)}\\text{ cm}$`,
          `$b \\approx ${aSide}\\text{ cm}$`,
        ];
        given = `$a = ${aSide}$, $\\sin(A) = ${sinVal.sinA}$, $\\sin(B) = ${sinVal.sinB}$.`;
        required = `Side length $b$.`;
        method = `Law of Sines: $\\frac{a}{\\sin(A)} = \\frac{b}{\\sin(B)} \\implies b = \\frac{a \\sin(B)}{\\sin(A)}$.`;
        steps = [`$b = \\frac{${aSide} \\times ${sinVal.sinB}}{${sinVal.sinA}} \\approx ${sinVal.bAns}$.`];
        conclusion = `$b \\approx ${sinVal.bAns}\\text{ cm}$.`;
        hint = `Set up the ratio $\\frac{a}{\\sin(A)} = \\frac{b}{\\sin(B)}$ and solve for $b$.`;
      } else if (mode === 'circumradius') {
        const sideVal = prng.pick([5, 8, 10, 12]);
        questionText = `In any circumscribed triangle $\\triangle ABC$ with circumradius $R$, what is the relationship between side $a$ and opposite angle $A$?`;
        correctAnswer = `$\\frac{a}{\\sin(A)} = 2R$`;
        rawDistractors = [`$\\frac{a}{\\sin(A)} = R$`, `$a\\sin(A) = 2R$`, `$\\frac{a}{\\cos(A)} = 2R$`];
        given = `Extended Law of Sines with circumradius $R$.`;
        required = `Ratio relation.`;
        method = `The extended Law of Sines states $\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$.`;
        steps = [`$\\frac{a}{\\sin(A)} = 2R$.`];
        conclusion = `$\\frac{a}{\\sin(A)} = 2R$.`;
        hint = `The ratio $\\frac{a}{\\sin(A)}$ equals the circumdiameter $2R$.`;
      } else {
        const letters = prng.pick([
          { a: 'a', b: 'b', c: 'c', A: 'A', B: 'B', C: 'C' },
          { a: 'p', b: 'q', c: 'r', A: 'P', B: 'Q', C: 'R' },
          { a: 'x', b: 'y', c: 'z', A: 'X', B: 'Y', C: 'Z' },
        ]);
        questionText = `According to the Law of Sines, in $\\triangle ${letters.A}${letters.B}${letters.C}$ with sides $${letters.a}, ${letters.b}, ${letters.c}$, which identity is universally valid?`;
        correctAnswer = `$\\frac{${letters.a}}{\\sin(${letters.A})} = \\frac{${letters.b}}{\\sin(${letters.B})} = \\frac{${letters.c}}{\\sin(${letters.C})}$`;
        rawDistractors = [
          `$${letters.a}\\sin(${letters.A}) = ${letters.b}\\sin(${letters.B})$`,
          `$\\frac{${letters.a}}{\\cos(${letters.A})} = \\frac{${letters.b}}{\\cos(${letters.B})}$`,
          `$${letters.a}^2 = ${letters.b}^2 + ${letters.c}^2$`,
        ];
        given = `Triangle $\\triangle ${letters.A}${letters.B}${letters.C}$.`;
        required = `Law of Sines identity.`;
        method = `Ratio of each side to the sine of its opposite angle is constant: $\\frac{${letters.a}}{\\sin(${letters.A})} = \\frac{${letters.b}}{\\sin(${letters.B})} = \\frac{${letters.c}}{\\sin(${letters.C})}$.`;
        steps = [`Identity: $\\frac{${letters.a}}{\\sin(${letters.A})} = \\frac{${letters.b}}{\\sin(${letters.B})} = \\frac{${letters.c}}{\\sin(${letters.C})}$.`];
        conclusion = correctAnswer;
        hint = `Side divided by sine of opposite angle is invariant across all vertices.`;
      }
    } else {
      // Cosine rule dynamic calculation or rearranged formula
      const mode = prng.pick(['calculate_c', 'solve_cosC', 'formula_variant']);
      if (mode === 'calculate_c') {
        const a = prng.pick([3, 4, 5, 6]);
        const b = prng.pick([4, 5, 6, 8]);
        // Angle C = 60 degrees => cos(60) = 0.5 => c^2 = a^2 + b^2 - 2ab(0.5) = a^2 + b^2 - ab
        const cSq = a * a + b * b - a * b;
        questionText = `In $\\triangle ABC$, sides $a = ${a}$ and $b = ${b}$, with included angle $C = 60^\\circ$ (where $\\cos(60^\\circ) = 0.5$). Using the Law of Cosines, find the value of $c^2$:`;
        correctAnswer = `$c^2 = ${cSq}$`;
        rawDistractors = [`$c^2 = ${a * a + b * b}$`, `$c^2 = ${cSq + a * b}$`, `$c^2 = ${Math.max(1, cSq - 4)}$`];
        given = `$a = ${a}, b = ${b}, C = 60^\\circ, \\cos(60^\\circ) = 0.5$.`;
        required = `Value of $c^2$.`;
        method = `$c^2 = a^2 + b^2 - 2ab\\cos(C) = ${a * a} + ${b * b} - 2(${a})(${b})(0.5) = ${a * a + b * b} - ${a * b} = ${cSq}$.`;
        steps = [`$c^2 = ${a * a} + ${b * b} - ${a * b} = ${cSq}$.`];
        conclusion = `$c^2 = ${cSq}$.`;
        hint = `Substitute $a$, $b$, and $\\cos(60^\\circ) = 0.5$ into $c^2 = a^2 + b^2 - 2ab\\cos(C)$.`;
      } else if (mode === 'solve_cosC') {
        questionText = `By rearranging the Law of Cosines, how is $\\cos(C)$ expressed in terms of triangle sides $a, b, c$?`;
        correctAnswer = `$\\cos(C) = \\frac{a^2 + b^2 - c^2}{2ab}$`;
        rawDistractors = [
          `$\\cos(C) = \\frac{a^2 + b^2 + c^2}{2ab}$`,
          `$\\cos(C) = \\frac{c^2 - a^2 - b^2}{2ab}$`,
          `$\\cos(C) = \\frac{a + b - c}{2ab}$`,
        ];
        given = `Law of Cosines $c^2 = a^2 + b^2 - 2ab\\cos(C)$.`;
        required = `Expression for $\\cos(C)$.`;
        method = `Isolate $\\cos(C)$: $2ab\\cos(C) = a^2 + b^2 - c^2 \\implies \\cos(C) = \\frac{a^2 + b^2 - c^2}{2ab}$.`;
        steps = [`$\\cos(C) = \\frac{a^2 + b^2 - c^2}{2ab}$.`];
        conclusion = `$\\cos(C) = \\frac{a^2 + b^2 - c^2}{2ab}$.`;
        hint = `Move $2ab\\cos(C)$ to one side and divide by $2ab$.`;
      } else {
        const letters = prng.pick([
          { target: 'c', adj1: 'a', adj2: 'b', Ang: 'C' },
          { target: 'a', adj1: 'b', adj2: 'c', Ang: 'A' },
          { target: 'b', adj1: 'a', adj2: 'c', Ang: 'B' },
        ]);
        questionText = `By the Law of Cosines, side $${letters.target}$ of a triangle with adjacent sides $${letters.adj1}, ${letters.adj2}$ and included angle $${letters.Ang}$ satisfies:`;
        correctAnswer = `$${letters.target}^2 = ${letters.adj1}^2 + ${letters.adj2}^2 - 2${letters.adj1}${letters.adj2}\\cos(${letters.Ang})$`;
        rawDistractors = [
          `$${letters.target}^2 = ${letters.adj1}^2 + ${letters.adj2}^2 + 2${letters.adj1}${letters.adj2}\\cos(${letters.Ang})$`,
          `$${letters.target}^2 = ${letters.adj1}^2 + ${letters.adj2}^2 - 2${letters.adj1}${letters.adj2}\\sin(${letters.Ang})$`,
          `$${letters.target} = ${letters.adj1} + ${letters.adj2} - \\cos(${letters.Ang})$`,
        ];
        given = `Triangle with sides $${letters.adj1}, ${letters.adj2}$ and angle $${letters.Ang}$.`;
        required = `Law of Cosines formula for $${letters.target}$.`;
        method = `Law of Cosines: $${letters.target}^2 = ${letters.adj1}^2 + ${letters.adj2}^2 - 2${letters.adj1}${letters.adj2}\\cos(${letters.Ang})$.`;
        steps = [`Formula: $${letters.target}^2 = ${letters.adj1}^2 + ${letters.adj2}^2 - 2${letters.adj1}${letters.adj2}\\cos(${letters.Ang})$.`];
        conclusion = correctAnswer;
        hint = `Adjustment term is $-2(\\text{adjacent sides})\\cos(\\text{included angle})$.`;
      }
    }
  }

  // ==========================================
  // WORLD 9: HIGHER MATHEMATICS (Stages 81-90)
  // ==========================================
  else if (stageId === 81) {
    // Limits & Continuity: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // 0/0 factor difference of squares
      const a = prng.int(2, 6);
      const ans = 2 * a;
      questionText = `Evaluate the algebraic limit: $$\\lim_{x \\to ${a}} \\frac{x^2 - ${a * a}}{x - ${a}}$$`;
      correctAnswer = `$${ans}$`;
      rawDistractors = [`$0$`, `$\\infty$`, `$${a}$`];
      given = `Limit $\\lim_{x \\to ${a}} \\frac{x^2 - ${a * a}}{x - ${a}}$.`;
      required = `Limit value.`;
      method = `Direct substitution gives $\\frac{0}{0}$. Factor numerator: $(x - ${a})(x + ${a})$. Cancel $(x - ${a})$ and substitute $x = ${a}$: ${a} + ${a} = ${ans}$.`;
      steps = [
        `Factor: $\\frac{(x - ${a})(x + ${a})}{x - ${a}} = x + ${a}$.`,
        `Substitute: ${a} + ${a} = ${ans}.`,
      ];
      conclusion = `The limit is $${ans}$.`;
      hint = `Factor the numerator as a difference of squares $(x - a)(x + a)$ and cancel $(x - a)$.`;
    } else if (subtopicIndex === 1) {
      // Limit at infinity of rational function
      const a = prng.int(2, 6);
      const b = prng.int(2, 5);
      questionText = `Evaluate the limit as $x$ approaches infinity: $$\\lim_{x \\to \\infty} \\frac{${a}x^2 + 5}{${b}x^2 - 3x}$$`;
      correctAnswer = `$\\frac{${a}}{${b}}$`;
      rawDistractors = [`$0$`, `$\\infty$`, `$-\\frac{5}{3}$`];
      given = `Rational limit as $x \\to \\infty$.`;
      required = `Limit value.`;
      method = `Divide numerator and denominator by highest power $x^2$: $\\lim_{x \\to \\infty} \\frac{${a} + 5/x^2}{${b} - 3/x} = \\frac{${a}}{${b}}$.`;
      steps = [`Leading coefficients ratio: $\\frac{${a}}{${b}}$.`];
      conclusion = `The limit is $\\frac{${a}}{${b}}$.`;
      hint = `When degrees are equal, the limit at infinity is the ratio of the leading coefficients.`;
    } else if (subtopicIndex === 2) {
      // Direct substitution polynomial limit
      const c = prng.int(2, 5);
      const val = prng.int(1, 4);
      const ans = c * val * val - 3 * val + 2;
      questionText = `Evaluate the continuous polynomial limit: $$\\lim_{x \\to ${val}} (${c}x^2 - 3x + 2)$$`;
      correctAnswer = `$${ans}$`;
      const dist = generateNumericalDistractors(ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Limit $\\lim_{x \\to ${val}} (${c}x^2 - 3x + 2)$.`;
      required = `Limit value.`;
      method = `Polynomials are continuous everywhere; evaluate directly by substituting $x = ${val}$.`;
      steps = [`$${c}(${val})^2 - 3(${val}) + 2 = ${c * val * val} - ${3 * val} + 2 = ${ans}$.`];
      conclusion = `The limit is $${ans}$.`;
      hint = `Polynomial functions are continuous; simply plug in $x = ${val}$.`;
    } else if (subtopicIndex === 3) {
      // Fundamental trig limit with multiplier
      const k = prng.pick([2, 3, 4, 5, 6, 7]);
      questionText = `Evaluate the fundamental trigonometric limit: $$\\lim_{x \\to 0} \\frac{\\sin(${k}x)}{x}$$ (where $x$ is in radians)`;
      correctAnswer = `$${k}$`;
      rawDistractors = [`$1$`, `$0$`, `$\\frac{1}{${k}}$`];
      given = `Limit $\\lim_{x \\to 0} \\frac{\\sin(${k}x)}{x}$.`;
      required = `Limit value.`;
      method = `Using the standard limit $\\lim_{u\\to 0}\\frac{\\sin u}{u} = 1$: $\\lim_{x \\to 0} \\frac{\\sin(${k}x)}{x} = ${k} \\cdot \\lim_{x \\to 0} \\frac{\\sin(${k}x)}{${k}x} = ${k}(1) = ${k}$.`;
      steps = [`$\\lim_{x \\to 0} \\frac{\\sin(${k}x)}{x} = ${k} \\times 1 = ${k}$.`];
      conclusion = `The limit is $${k}$.`;
      hint = `Multiply numerator and denominator by $${k}$ to match the standard limit $\\frac{\\sin(${k}x)}{${k}x} \\to 1$.`;
    } else {
      // One-sided limit / removable singularity
      const a = prng.int(2, 5);
      questionText = `For the function $f(x) = \\frac{|x - ${a}|}{x - ${a}}$, evaluate the right-hand limit: $$\\lim_{x \\to ${a}^+} f(x)$$`;
      correctAnswer = `$1$`;
      rawDistractors = [`$-1$`, `$0$`, `$\\text{Does not exist}$`];
      given = `$f(x) = \\frac{|x - ${a}|}{x - ${a}}$, right-hand limit as $x \\to ${a}^+$.`;
      required = `Limit.`;
      method = `For $x > ${a}$, $x - ${a} > 0 \\implies |x - ${a}| = x - ${a}$. Thus $f(x) = \\frac{x - ${a}}{x - ${a}} = 1$.`;
      steps = [`For $x > ${a}$: $\\frac{x - ${a}}{x - ${a}} = 1$.`];
      conclusion = `The right-hand limit is $1$.`;
      hint = `When approaching from the right ($x > ${a}$), $|x - ${a}| = +(x - ${a})$.`;
    }
  } else if (stageId === 82 || stageId === 83) {
    // Differential Calculus: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Power Rule
      const c = prng.int(2, 5);
      const p = prng.int(3, 5);
      const newCoeff = c * p;
      const newPow = p - 1;
      questionText = `Find the derivative using the Power Rule: $$\\frac{d}{dx} \\left[ ${c}x^{${p}} \\right]$$`;
      correctAnswer = `$${newCoeff}x^{${newPow}}$`;
      rawDistractors = [`$${c}x^{${newPow}}$`, `$${newCoeff}x^{${p}}$`, `$${c * p}x^{${p + 1}}$`];
      given = `$f(x) = ${c}x^{${p}}$.`;
      required = `$f'(x)$.`;
      method = `$\\frac{d}{dx}[a x^n] = a n x^{n-1} = ${c} \\times ${p} x^{${p} - 1} = ${newCoeff}x^{${newPow}}$.`;
      steps = [`$${c} \\times ${p} x^{${newPow}} = ${newCoeff}x^{${newPow}}$.`];
      conclusion = `$f'(x) = ${newCoeff}x^{${newPow}}$.`;
      hint = `Multiply the coefficient by the power, then subtract 1 from the power.`;
    } else if (subtopicIndex === 1) {
      // Derivative evaluated at a point (slope of tangent)
      const a = prng.int(2, 4);
      const x0 = prng.int(1, 3);
      // f(x) = a x^2, f'(x) = 2a x, f'(x0) = 2a x0
      const slope = 2 * a * x0;
      questionText = `Find the slope of the tangent line to the curve $y = ${a}x^2$ at the point where $x = ${x0}$.`;
      correctAnswer = `$m = ${slope}$`;
      const dist = generateNumericalDistractors(slope, prng);
      rawDistractors = dist.map(d => `$m = ${d}$`);
      given = `Curve $y = ${a}x^2$, point $x = ${x0}$.`;
      required = `Tangent slope $f'(${x0})$.`;
      method = `Compute derivative $f'(x) = 2(${a})x = ${2 * a}x$. Evaluate at $x = ${x0}$: $f'(${x0}) = ${2 * a}(${x0}) = ${slope}$.`;
      steps = [
        `$f'(x) = ${2 * a}x$.`,
        `$f'(${x0}) = ${2 * a}(${x0}) = ${slope}$.`,
      ];
      conclusion = `The slope is $m = ${slope}$.`;
      hint = `Differentiate to find $f'(x)$, then plug in $x = ${x0}$.`;
    } else if (subtopicIndex === 2) {
      // Chain Rule
      const n = prng.pick([3, 4]);
      const k = prng.pick([2, 5]);
      questionText = `Differentiate the composite function using the Chain Rule: $$f(x) = (${k}x + 1)^{${n}}$$`;
      correctAnswer = `$${n * k}(${k}x + 1)^{${n - 1}}$`;
      rawDistractors = [
        `$${n}(${k}x + 1)^{${n - 1}}$`,
        `$${k}(${k}x + 1)^{${n - 1}}$`,
        `$${n * k}x^{${n - 1}}$`,
      ];
      given = `$f(x) = (${k}x + 1)^{${n}}$.`;
      required = `Derivative $f'(x)$.`;
      method = `Chain Rule: $\\frac{d}{dx}[u^n] = n u^{n-1} \\cdot u'$. Here $u = ${k}x + 1$, so $u' = ${k}$. $f'(x) = ${n}(${k}x + 1)^{${n - 1}} \\cdot ${k} = ${n * k}(${k}x + 1)^{${n - 1}}$.`;
      steps = [`$f'(x) = ${n}(${k}x + 1)^{${n - 1}} \\times ${k} = ${n * k}(${k}x + 1)^{${n - 1}}$.`];
      conclusion = `$f'(x) = ${n * k}(${k}x + 1)^{${n - 1}}$.`;
      hint = `Differentiate the outside power, then multiply by the derivative of the inside ($${k}$).`;
    } else if (subtopicIndex === 3) {
      // Second derivative
      const a = prng.int(2, 5);
      // f(x) = a x^3 => f'(x) = 3a x^2 => f''(x) = 6a x
      questionText = `Find the second derivative $f''(x)$ of the function: $$f(x) = ${a}x^3$$`;
      correctAnswer = `$${6 * a}x$`;
      rawDistractors = [`$${3 * a}x^2$`, `$${6 * a}$`, `$${a}x$`];
      given = `$f(x) = ${a}x^3$.`;
      required = `Second derivative $f''(x)$.`;
      method = `First derivative: $f'(x) = 3(${a})x^2 = ${3 * a}x^2$. Second derivative: $f''(x) = 2(${3 * a})x = ${6 * a}x$.`;
      steps = [
        `$f'(x) = ${3 * a}x^2$.`,
        `$f''(x) = \\frac{d}{dx}[${3 * a}x^2] = ${6 * a}x$.`,
      ];
      conclusion = `$f''(x) = ${6 * a}x$.`;
      hint = `Differentiate twice using the power rule.`;
    } else {
      // Product Rule
      const mode = prng.pick(['applied', 'formula']);
      if (mode === 'applied') {
        const p = prng.pick([2, 3, 4]);
        questionText = `Using the Product Rule, find the derivative of $h(x) = x^{${p}} \\sin(x)$:`;
        correctAnswer = `$${p}x^{${p - 1}}\\sin(x) + x^{${p}}\\cos(x)$`;
        rawDistractors = [
          `$${p}x^{${p - 1}}\\cos(x)$`,
          `$${p}x^{${p - 1}}\\sin(x) - x^{${p}}\\cos(x)$`,
          `$x^{${p}}\\cos(x)$`,
        ];
        given = `Product $h(x) = x^{${p}}\\sin(x)$.`;
        required = `Derivative $h'(x)$.`;
        method = `Product Rule: $(uv)' = u'v + uv'$. Here $u = x^{${p}} \\implies u' = ${p}x^{${p - 1}}$, and $v = \\sin(x) \\implies v' = \\cos(x)$.`;
        steps = [`$h'(x) = ${p}x^{${p - 1}}\\sin(x) + x^{${p}}\\cos(x)$.`];
        conclusion = `$${p}x^{${p - 1}}\\sin(x) + x^{${p}}\\cos(x)$.`;
        hint = `Differentiate the first term ($${p}x^{${p - 1}}$) times the second, plus the first times the derivative of the second ($\\cos x$).`;
      } else {
        const letters = prng.pick([
          { u: 'u', v: 'v' },
          { u: 'f', v: 'g' },
        ]);
        questionText = `By the Product Rule of differentiation, what is the derivative of the product $h(x) = ${letters.u}(x) \\cdot ${letters.v}(x)$?`;
        correctAnswer = `$${letters.u}'(x)${letters.v}(x) + ${letters.u}(x)${letters.v}'(x)$`;
        rawDistractors = [
          `$${letters.u}'(x)${letters.v}'(x)$`,
          `$${letters.u}'(x)${letters.v}(x) - ${letters.u}(x)${letters.v}'(x)$`,
          `$\\frac{${letters.u}'(x)}{${letters.v}'(x)}$`,
        ];
        given = `Product $h(x) = ${letters.u}(x)${letters.v}(x)$.`;
        required = `Product Rule formula.`;
        method = `The Product Rule states $(${letters.u}${letters.v})' = ${letters.u}'${letters.v} + ${letters.u}${letters.v}'$.`;
        steps = [`$\\frac{d}{dx}[${letters.u}${letters.v}] = ${letters.u}'${letters.v} + ${letters.u}${letters.v}'$.`];
        conclusion = `$${letters.u}'(x)${letters.v}(x) + ${letters.u}(x)${letters.v}'(x)$.`;
        hint = `Derivative of the first times second, plus first times derivative of the second.`;
      }
    }
  } else if (stageId === 84 || stageId === 85) {
    // Integral Calculus: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Definite integral
      const c = 2 * prng.int(1, 5);
      const upper = prng.int(2, 8);
      const val = (c / 2) * upper * upper;
      questionText = `Evaluate the definite integral: $$\\int_0^{${upper}} ${c}x \\, dx$$`;
      correctAnswer = `$${val}$`;
      const dist = generateNumericalDistractors(val, prng, true, false, 4);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Integral $\\int_0^{${upper}} ${c}x \\, dx$.`;
      required = `Definite integral value.`;
      method = `Antiderivative of $${c}x$ is $${c / 2 === 1 ? '' : c / 2}x^2$. By FTC: $[${c / 2 === 1 ? '' : c / 2}x^2]_0^{${upper}} = ${c / 2}(${upper})^2 - 0 = ${val}$.`;
      steps = [
        `Antiderivative: $${c / 2 === 1 ? '' : c / 2}x^2$.`,
        `Evaluate at limits: $${val} - 0 = ${val}$.`,
      ];
      conclusion = `The value is $${val}$.`;
      hint = `Antiderivative of $${c}x$ is $${c / 2 === 1 ? '' : c / 2}x^2$; evaluate at upper limit minus lower limit.`;
    } else if (subtopicIndex === 1) {
      // Indefinite integral of polynomial
      const coeff = prng.int(1, 12);
      const a = coeff * 3;
      questionText = `Find the indefinite integral: $$\\int ${a}x^2 \\, dx$$`;
      correctAnswer = `$${coeff === 1 ? '' : coeff}x^3 + C$`;
      rawDistractors = [`$${a}x^3 + C$`, `$${2 * a}x + C$`, `$\\frac{${a}}{2}x^2 + C$`];
      given = `Integrand $${a}x^2$.`;
      required = `Antiderivative.`;
      method = `Power Rule for integrals: $\\int a x^n dx = a \\frac{x^{n+1}}{n+1} + C = ${a} \\frac{x^3}{3} + C = ${coeff === 1 ? '' : coeff}x^3 + C$.`;
      steps = [`$\\frac{${a}}{3}x^3 + C = ${coeff === 1 ? '' : coeff}x^3 + C$.`];
      conclusion = `$${coeff === 1 ? '' : coeff}x^3 + C$.`;
      hint = `Raise the power to 3 and divide the coefficient by 3. Don't forget $+ C$!`;
    } else if (subtopicIndex === 2) {
      // Area under curve y = x^2 from 0 to k (k multiple of 3)
      const k = 3 * prng.int(1, 8);
      const area = Math.round((k * k * k) / 3);
      questionText = `Find the exact area under the parabola $y = x^2$ above the $x$-axis from $x = 0$ to $x = ${k}$.`;
      correctAnswer = `$${area}$`;
      const dist = generateNumericalDistractors(area, prng, true, false, 6);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Curve $y = x^2$, interval $[0, ${k}]$.`;
      required = `Area $A = \\int_0^{${k}} x^2 \\, dx$.`;
      method = `$\\int_0^{${k}} x^2 dx = \\left[ \\frac{x^3}{3} \\right]_0^{${k}} = \\frac{${k}^3}{3} - 0 = \\frac{${k * k * k}}{3} = ${area}$.`;
      steps = [
        `Antiderivative: $\\frac{x^3}{3}$.`,
        `$\\frac{${k}^3}{3} = \\frac{${k * k * k}}{3} = ${area}$.`,
      ];
      conclusion = `The area is $${area}$ square units.`;
      hint = `Integrate $x^2$ to get $\\frac{x^3}{3}$ and plug in $x = ${k}$.`;
    } else if (subtopicIndex === 3) {
      // Integral of k/x
      const k = prng.int(2, 25);
      questionText = `What is the indefinite antiderivative: $$\\int \\frac{${k}}{x} \\, dx \\quad (x > 0)$$`;
      correctAnswer = `$${k}\\ln(x) + C$`;
      rawDistractors = [`$-\\frac{${k}}{x^2} + C$`, `$${k}e^x + C$`, `$\\ln(x) + C$`];
      given = `Integrand $\\frac{${k}}{x}$ for $x > 0$.`;
      required = `Indefinite integral.`;
      method = `Factor constant: $\\int \\frac{${k}}{x} dx = ${k} \\int \\frac{1}{x} dx = ${k}\\ln(x) + C$.`;
      steps = [`$${k} \\int \\frac{1}{x} dx = ${k}\\ln(x) + C$.`];
      conclusion = `$${k}\\ln(x) + C$.`;
      hint = `Factor out the constant $${k}$; the integral of $\\frac{1}{x}$ is $\\ln(x)$.`;
    } else {
      // Integral of a * e^x
      const a = prng.int(2, 25);
      questionText = `Evaluate the definite integral: $$\\int_0^1 ${a}e^x \\, dx$$`;
      correctAnswer = `$${a}(e - 1)$`;
      rawDistractors = [`$${a}e$`, `$${a}$`, `$${a}(e + 1)$`];
      given = `Integral $\\int_0^1 ${a}e^x \\, dx$.`;
      required = `Definite integral value.`;
      method = `Antiderivative of ${a}e^x is ${a}e^x$. $[${a}e^x]_0^1 = ${a}e^1 - ${a}e^0 = ${a}(e - 1)$.`;
      steps = [`$[${a}e^x]_0^1 = ${a}(e - 1)$.`];
      conclusion = `$${a}(e - 1)$.`;
      hint = `The antiderivative of $e^x$ is $e^x$; factor out $${a}$ and evaluate $e^1 - e^0$.`;
    }
  } else if (stageId === 86) {
    // Vectors & Spatial Geometry: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Dot product
      const u1 = prng.int(1, 4);
      const u2 = prng.int(2, 5);
      const v1 = prng.int(1, 4);
      const v2 = prng.int(2, 5);
      const dot = u1 * v1 + u2 * v2;
      questionText = `Compute the dot product $\\vec{u} \\cdot \\vec{v}$ for vectors $\\vec{u} = \\begin{pmatrix} ${u1} \\\\ ${u2} \\end{pmatrix}$ and $\\vec{v} = \\begin{pmatrix} ${v1} \\\\ ${v2} \\end{pmatrix}$.`;
      correctAnswer = `$${dot}$`;
      const dist = generateNumericalDistractors(dot, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$\\vec{u} = (${u1}, ${u2})^T$, $\\vec{v} = (${v1}, ${v2})^T$.`;
      required = `Dot product $\\vec{u} \\cdot \\vec{v}$.`;
      method = `$\\vec{u} \\cdot \\vec{v} = u_x v_x + u_y v_y = (${u1})(${v1}) + (${u2})(${v2}) = ${dot}$.`;
      steps = [`$${u1 * v1} + ${u2 * v2} = ${dot}$.`];
      conclusion = `$\\vec{u} \\cdot \\vec{v} = ${dot}$.`;
      hint = `Multiply the $x$-components and $y$-components, then add them together.`;
    } else if (subtopicIndex === 1) {
      // Vector Magnitude
      const pyth = prng.pick([
        { x: 3, y: 4, m: 5 },
        { x: 6, y: 8, m: 10 },
        { x: 5, y: 12, m: 13 },
        { x: 8, y: 15, m: 17 },
        { x: 7, y: 24, m: 25 },
        { x: 9, y: 12, m: 15 },
      ]);
      questionText = `Find the magnitude (length) of the 2D vector $\\vec{v} = \\begin{pmatrix} ${pyth.x} \\\\ ${pyth.y} \\end{pmatrix}$.`;
      correctAnswer = `$${pyth.m}$`;
      rawDistractors = [`$${pyth.x + pyth.y}$`, `$${pyth.m * 2}$`, `$${pyth.m * pyth.m}$`];
      given = `Vector $\\vec{v} = (${pyth.x}, ${pyth.y})^T$.`;
      required = `Magnitude $||\\vec{v}||$.`;
      method = `$||\\vec{v}|| = \\sqrt{x^2 + y^2} = \\sqrt{${pyth.x}^2 + ${pyth.y}^2} = \\sqrt{${pyth.x * pyth.x} + ${pyth.y * pyth.y}} = ${pyth.m}$.`;
      steps = [`$\\sqrt{${pyth.x * pyth.x} + ${pyth.y * pyth.y}} = ${pyth.m}$.`];
      conclusion = `Magnitude is $${pyth.m}$.`;
      hint = `Use the Pythagorean formula $||\\vec{v}|| = \\sqrt{x^2 + y^2}$.`;
    } else if (subtopicIndex === 2) {
      // Perpendicular vectors dot product = 0 or missing orthogonal component
      const mode = prng.pick(['concept', 'find_k']);
      if (mode === 'find_k') {
        const u1 = prng.pick([2, 3, 4]);
        const u2 = prng.pick([3, 5, 6]);
        questionText = `Given orthogonal vectors $\\vec{u} = \\begin{pmatrix} ${u1} \\\\ ${u2} \\end{pmatrix}$ and $\\vec{v} = \\begin{pmatrix} ${-u2} \\\\ k \\end{pmatrix}$, find the value of $k$ such that $\\vec{u} \\perp \\vec{v}$:`;
        correctAnswer = `$k = ${u1}$`;
        rawDistractors = [`$k = ${-u1}$`, `$k = ${u2}$`, `$k = 0$`];
        given = `$\\vec{u} = (${u1}, ${u2})^T$, $\\vec{v} = (${-u2}, k)^T$, $\\vec{u} \\cdot \\vec{v} = 0$.`;
        required = `Value of $k$.`;
        method = `$\\vec{u} \\cdot \\vec{v} = (${u1})(${-u2}) + (${u2})(k) = -${u1 * u2} + ${u2}k = 0 \\implies k = ${u1}$.`;
        steps = [`-${u1 * u2} + ${u2}k = 0 \\implies k = ${u1}$.`];
        conclusion = `$k = ${u1}$.`;
        hint = `Compute the dot product, set it equal to 0, and solve for $k$.`;
      } else {
        questionText = `If two non-zero vectors $\\vec{u}$ and $\\vec{v}$ are perpendicular (orthogonal), what is the value of their dot product $\\vec{u} \\cdot \\vec{v}$?`;
        correctAnswer = `$0$`;
        rawDistractors = [`$1$`, `$-1$`, `$\\text{Undefined}$`];
        given = `Orthogonal vectors $\\vec{u} \\perp \\vec{v}$.`;
        required = `Value of $\\vec{u} \\cdot \\vec{v}$.`;
        method = `$\\vec{u} \\cdot \\vec{v} = ||\\vec{u}|| \\cdot ||\\vec{v}|| \\cos(90^\\circ) = 0$ because $\\cos(90^\\circ) = 0$.`;
        steps = [`$\\cos(90^\\circ) = 0 \\implies \\vec{u} \\cdot \\vec{v} = 0$.`];
        conclusion = `The dot product is $0$.`;
        hint = `Two vectors are perpendicular if and only if their dot product equals zero.`;
      }
    } else if (subtopicIndex === 3) {
      // Vector addition
      const u1 = prng.int(1, 5);
      const u2 = prng.int(2, 6);
      const v1 = prng.int(1, 5);
      const v2 = prng.int(2, 6);
      questionText = `Add the vectors $\\vec{u} = \\begin{pmatrix} ${u1} \\\\ ${u2} \\end{pmatrix}$ and $\\vec{v} = \\begin{pmatrix} ${v1} \\\\ ${v2} \\end{pmatrix}$.`;
      correctAnswer = `$\\begin{pmatrix} ${u1 + v1} \\\\ ${u2 + v2} \\end{pmatrix}$`;
      rawDistractors = [
        `$\\begin{pmatrix} ${u1 * v1} \\\\ ${u2 * v2} \\end{pmatrix}$`,
        `$\\begin{pmatrix} ${u1 + v1 + 1} \\\\ ${u2 + v2} \\end{pmatrix}$`,
        `$\\begin{pmatrix} ${u1 - v1} \\\\ ${u2 - v2} \\end{pmatrix}$`,
      ];
      given = `Vectors $\\vec{u} = (${u1}, ${u2})^T$, $\\vec{v} = (${v1}, ${v2})^T$.`;
      required = `Vector sum $\\vec{u} + \\vec{v}$.`;
      method = `Add corresponding components: $(u_x + v_x, u_y + v_y)^T$.`;
      steps = [`$(${u1} + ${v1}, ${u2} + ${v2})^T = (${u1 + v1}, ${u2 + v2})^T$.`];
      conclusion = `$\\vec{u} + \\vec{v} = (${u1 + v1}, ${u2 + v2})^T$.`;
      hint = `Add the top numbers together and add the bottom numbers together.`;
    } else {
      // 3D vector magnitude
      const trip = prng.pick([
        { x: 1, y: 2, z: 2, m: 3 },
        { x: 2, y: 3, z: 6, m: 7 },
        { x: 1, y: 4, z: 8, m: 9 },
        { x: 4, y: 4, z: 7, m: 9 },
        { x: 2, y: 6, z: 9, m: 11 },
        { x: 6, y: 6, z: 7, m: 11 },
      ]);
      questionText = `What is the magnitude of the 3D vector $\\vec{r} = \\begin{pmatrix} ${trip.x} \\\\ ${trip.y} \\\\ ${trip.z} \\end{pmatrix}$?`;
      correctAnswer = `$${trip.m}$`;
      rawDistractors = [`$${trip.x + trip.y + trip.z}$`, `$${trip.m * 2}$`, `$${trip.m * trip.m}$`];
      given = `Vector $\\vec{r} = (${trip.x}, ${trip.y}, ${trip.z})^T$.`;
      required = `Magnitude.`;
      method = `$||\\vec{r}|| = \\sqrt{${trip.x}^2 + ${trip.y}^2 + ${trip.z}^2} = \\sqrt{${trip.x * trip.x} + ${trip.y * trip.y} + ${trip.z * trip.z}} = ${trip.m}$.`;
      steps = [`$\\sqrt{${trip.x * trip.x + trip.y * trip.y + trip.z * trip.z}} = ${trip.m}$.`];
      conclusion = `Magnitude is $${trip.m}$.`;
      hint = `Square all three components, add them, and take the square root.`;
    }
  } else if (stageId === 87 || stageId === 88) {
    // Matrices & Linear Algebra: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // 2x2 Determinant
      const a = prng.int(2, 5);
      const b = prng.int(1, 4);
      const c = prng.int(1, 4);
      const d = prng.int(2, 5);
      const det = a * d - b * c;
      questionText = `Calculate the determinant of the $2 \\times 2$ matrix: $$\\det \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}$$`;
      correctAnswer = `$${det}$`;
      const dist = generateNumericalDistractors(det, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Matrix $A = \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}$.`;
      required = `Determinant $\\det(A)$.`;
      method = `$\\det(A) = ad - bc = (${a})(${d}) - (${b})(${c}) = ${a * d} - ${b * c} = ${det}$.`;
      steps = [`$${a * d} - ${b * c} = ${det}$.`];
      conclusion = `$\\det(A) = ${det}$.`;
      hint = `Multiply the main diagonal elements and subtract the product of the off-diagonal elements ($ad - bc$).`;
    } else if (subtopicIndex === 1) {
      // Trace of matrix
      const a = prng.int(2, 6);
      const d = prng.int(3, 7);
      const trace = a + d;
      questionText = `Find the trace (sum of diagonal entries) of the matrix: $$\\text{Tr} \\begin{pmatrix} ${a} & 5 \\\\ -2 & ${d} \\end{pmatrix}$$`;
      correctAnswer = `$${trace}$`;
      rawDistractors = [`$${a * d}$`, `$${trace + 2}$`, `$${Math.max(1, trace - 2)}$`];
      given = `Matrix with diagonal entries $${a}$ and $${d}$.`;
      required = `Trace.`;
      method = `The trace is the sum of main diagonal elements: $\\text{Tr}(A) = a_{11} + a_{22} = ${a} + ${d} = ${trace}$.`;
      steps = [`$${a} + ${d} = ${trace}$.`];
      conclusion = `The trace is $${trace}$.`;
      hint = `Add the top-left and bottom-right entries.`;
    } else if (subtopicIndex === 2) {
      // Identity matrix property or calculation
      const mode = prng.pick(['multiplication', 'concept']);
      if (mode === 'multiplication') {
        const a1 = prng.int(1, 5);
        const a2 = prng.int(2, 6);
        const a3 = prng.int(1, 4);
        const a4 = prng.int(2, 5);
        questionText = `For matrix $A = \\begin{pmatrix} ${a1} & ${a2} \\\\ ${a3} & ${a4} \\end{pmatrix}$ and identity $I = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$, compute the product $A \\cdot I$:`;
        correctAnswer = `$\\begin{pmatrix} ${a1} & ${a2} \\\\ ${a3} & ${a4} \\end{pmatrix}$`;
        rawDistractors = [
          `$\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$`,
          `$\\begin{pmatrix} ${a1 + 1} & ${a2} \\\\ ${a3} & ${a4 + 1} \\end{pmatrix}$`,
          `$\\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix}$`,
        ];
        given = `Matrix $A$ and identity $I$.`;
        required = `Product $A \\cdot I$.`;
        method = `Multiplying any matrix $A$ by the identity matrix $I$ leaves $A$ unchanged: $A \\cdot I = A$.`;
        steps = [`$A \\cdot I = A = \\begin{pmatrix} ${a1} & ${a2} \\\\ ${a3} & ${a4} \\end{pmatrix}$.`];
        conclusion = `$\\begin{pmatrix} ${a1} & ${a2} \\\\ ${a3} & ${a4} \\end{pmatrix}$.`;
        hint = `The identity matrix $I$ acts as the number 1 in matrix algebra.`;
      } else {
        questionText = `If $I$ is the $2 \\times 2$ identity matrix and $A$ is any $2 \\times 2$ matrix, what does the product $A \\cdot I$ equal?`;
        correctAnswer = `$A$`;
        rawDistractors = [`$I$`, `$0$`, `$A^2$`];
        given = `Identity matrix $I$, arbitrary matrix $A$.`;
        required = `Matrix product $A \\cdot I$.`;
        method = `The identity matrix acts as the multiplicative identity in matrix algebra: $A \\cdot I = I \\cdot A = A$.`;
        steps = [`$A \\cdot I = A$.`];
        conclusion = `$A \\cdot I = A$.`;
        hint = `The identity matrix $I$ acts like the number 1 in scalar multiplication.`;
      }
    } else if (subtopicIndex === 3) {
      // Singular matrix condition
      const triple = prng.pick([
        { a: 2, b: 4, c: 3, x: 6 },
        { a: 3, b: 6, c: 2, x: 4 },
        { a: 2, b: 3, c: 4, x: 6 },
        { a: 4, b: 8, c: 3, x: 6 },
        { a: 3, b: 9, c: 2, x: 6 },
        { a: 5, b: 10, c: 4, x: 8 },
        { a: 2, b: 6, c: 5, x: 15 },
      ]);
      questionText = `For what value of $x$ is the matrix singular (non-invertible)? $$\\begin{pmatrix} ${triple.a} & ${triple.b} \\\\ ${triple.c} & x \\end{pmatrix}$$`;
      correctAnswer = `$x = ${triple.x}$`;
      rawDistractors = [`$x = ${triple.x + 2}$`, `$x = ${Math.max(1, triple.x - 2)}$`, `$x = 0$`];
      given = `Matrix with unknown $x$, singular condition.`;
      required = `Value of $x$ where $\\det = 0$.`;
      method = `A matrix is singular when $\\det(A) = 0$: $(${triple.a})x - (${triple.b})(${triple.c}) = 0 \\implies ${triple.a}x = ${triple.b * triple.c} \\implies x = ${triple.x}$.`;
      steps = [`$${triple.a}x - ${triple.b * triple.c} = 0 \\implies x = ${triple.x}$.`];
      conclusion = `$x = ${triple.x}$.`;
      hint = `Set the determinant $ad - bc = 0$ and solve for $x$.`;
    } else {
      // Scalar multiplication
      const k = prng.int(2, 4);
      const m11 = 2, m12 = -1, m21 = 3, m22 = 0;
      questionText = `Find the scalar multiple: $$${k} \\begin{pmatrix} 2 & -1 \\\\ 3 & 0 \\end{pmatrix}$$`;
      correctAnswer = `$\\begin{pmatrix} ${k * 2} & ${-k} \\\\ ${k * 3} & 0 \\end{pmatrix}$`;
      rawDistractors = [
        `$\\begin{pmatrix} ${2} & ${-1} \\\\ ${3} & 0 \\end{pmatrix}$`,
        `$\\begin{pmatrix} ${k * 2} & ${-1} \\\\ ${3} & 0 \\end{pmatrix}$`,
        `$\\begin{pmatrix} ${k + 2} & ${k - 1} \\\\ ${k + 3} & ${k} \\end{pmatrix}$`,
      ];
      given = `Scalar $k = ${k}$, Matrix $\\begin{pmatrix} 2 & -1 \\\\ 3 & 0 \\end{pmatrix}$.`;
      required = `Scalar product matrix.`;
      method = `Multiply every individual element by scalar $${k}$.`;
      steps = [`Multiply each entry by $${k}$.`];
      conclusion = `Result is $\\begin{pmatrix} ${k * 2} & ${-k} \\\\ ${k * 3} & 0 \\end{pmatrix}$.`;
      hint = `Multiply every number inside the matrix by $${k}$.`;
    }
  } else if (stageId === 89 || stageId === 90) {
    // Complex Numbers & Advanced Analysis: 5 diverse archetypes
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Powers of i
      const p = prng.int(13, 27);
      const mod4 = p % 4;
      const ansMap: Record<number, string> = { 0: '$1$', 1: '$i$', 2: '$-1$', 3: '$-i$' };
      questionText = `Evaluate the imaginary power: $$i^{${p}}$$ where $i = \\sqrt{-1}$.`;
      correctAnswer = ansMap[mod4];
      rawDistractors = Object.values(ansMap).filter(val => val !== correctAnswer);
      given = `Power $i^{${p}}$.`;
      required = `Simplified complex value.`;
      method = `Powers of $i$ cycle modulo 4: $i^0 = 1, i^1 = i, i^2 = -1, i^3 = -i$. Remainder of $${p} \\div 4$ is $${mod4}$.`;
      steps = [`$${p} = 4(${Math.floor(p / 4)}) + ${mod4} \\implies i^{${p}} = i^{${mod4}} = ${correctAnswer.replace(/\\$/g, '')}$.`];
      conclusion = `$i^{${p}} = ${correctAnswer.replace(/\\$/g, '')}$.`;
      hint = `Divide the power by 4 and look at the remainder: remainder 0 gives 1, 1 gives $i$, 2 gives $-1$, 3 gives $-i$.`;
    } else if (subtopicIndex === 1) {
      // Modulus of complex number
      const pyth = prng.pick([
        { a: 3, b: 4, m: 5 },
        { a: 6, b: 8, m: 10 },
        { a: 5, b: 12, m: 13 },
        { a: 8, b: 15, m: 17 },
        { a: 7, b: 24, m: 25 },
        { a: 9, b: 12, m: 15 },
      ]);
      const sign = prng.pick(['+', '-']);
      questionText = `What is the modulus $|z|$ of the complex number $z = ${pyth.a} ${sign} ${pyth.b}i$?`;
      correctAnswer = `$${pyth.m}$`;
      rawDistractors = [`$${pyth.a + pyth.b}$`, `$${pyth.m * 2}$`, `$${pyth.m * pyth.m}$`];
      given = `Complex number $z = ${pyth.a} ${sign} ${pyth.b}i$.`;
      required = `Modulus $|z|$.`;
      method = `$|a + bi| = \\sqrt{a^2 + b^2} = \\sqrt{${pyth.a}^2 + (${sign === '-' ? '-' : ''}${pyth.b})^2} = \\sqrt{${pyth.a * pyth.a + pyth.b * pyth.b}} = ${pyth.m}$.`;
      steps = [`$\\sqrt{${pyth.a * pyth.a} + ${pyth.b * pyth.b}} = ${pyth.m}$.`];
      conclusion = `$|z| = ${pyth.m}$.`;
      hint = `Modulus formula: $|a + bi| = \\sqrt{a^2 + b^2}$.`;
    } else if (subtopicIndex === 2) {
      // Complex Conjugate
      const a = prng.int(2, 6);
      const b = prng.int(3, 7);
      questionText = `What is the complex conjugate of $z = ${a} + ${b}i$?`;
      correctAnswer = `$${a} - ${b}i$`;
      rawDistractors = [`$-${a} + ${b}i$`, `$-${a} - ${b}i$`, `$${b} + ${a}i$`];
      given = `$z = ${a} + ${b}i$.`;
      required = `Conjugate $\\bar{z}$.`;
      method = `The complex conjugate negates the imaginary part: $\\overline{a + bi} = a - bi$.`;
      steps = [`$\\overline{${a} + ${b}i} = ${a} - ${b}i$.`];
      conclusion = `Conjugate is $${a} - ${b}i$.`;
      hint = `Flip the sign of the imaginary part ($i$ term) only.`;
    } else if (subtopicIndex === 3) {
      // Complex multiplication
      const x1 = prng.int(1, 3);
      const y1 = prng.int(1, 3);
      const x2 = prng.int(2, 4);
      const y2 = prng.int(1, 3);
      const realAns = x1 * x2 - y1 * y2;
      const imagAns = x1 * y2 + y1 * x2;
      const signStr = imagAns >= 0 ? `+ ${imagAns}i` : `- ${Math.abs(imagAns)}i`;
      questionText = `Multiply the complex numbers: $$(${x1 === 1 ? '' : x1}${x1 === 1 ? '1 + ' : ' + '}${y1 === 1 ? 'i' : `${y1}i`})(${x2} + ${y2 === 1 ? 'i' : `${y2}i`})$$`;
      correctAnswer = `$${realAns} ${signStr}$`;
      rawDistractors = [
        `$${x1 * x2} + ${y1 * y2}i$`,
        `$${realAns + 2} ${signStr}$`,
        `$${realAns} - ${imagAns}i$`,
      ];
      given = `Product of two complex numbers.`;
      required = `Simplified complex form $a + bi$.`;
      method = `FOIL expansion: $(${x1})(${x2}) + (${x1})(${y2}i) + (${y1}i)(${x2}) + (${y1}i)(${y2}i) = ${x1 * x2} + ${imagAns}i + ${y1 * y2}i^2 = ${realAns} ${signStr}$.`;
      steps = [
        `Expand: $${x1 * x2} + ${x1 * y2}i + ${y1 * x2}i + ${y1 * y2}i^2$.`,
        `Substitute $i^2 = -1$: $${x1 * x2} - ${y1 * y2} + ${imagAns}i = ${realAns} ${signStr}$.`,
      ];
      conclusion = `$${realAns} ${signStr}$.`;
      hint = `Expand with FOIL and substitute $i^2 = -1$.`;
    } else {
      // Complex addition
      const a = prng.int(2, 5);
      const b = prng.int(1, 4);
      const c = prng.int(3, 6);
      const d = prng.int(2, 5);
      questionText = `Add the complex numbers: $$(${a} + ${b}i) + (${c} + ${d}i)$$`;
      correctAnswer = `$${a + c} + ${b + d}i$`;
      rawDistractors = [
        `$${a * c} + ${b * d}i$`,
        `$${a + c} - ${b + d}i$`,
        `$${a + c + 1} + ${b + d}i$`,
      ];
      given = `Sum $(${a} + ${b}i) + (${c} + ${d}i)$.`;
      required = `Simplified form.`;
      method = `Add real parts and imaginary parts separately: $(${a} + ${c}) + (${b} + ${d})i = ${a + c} + ${b + d}i$.`;
      steps = [`$(${a} + ${c}) + (${b} + ${d})i = ${a + c} + ${b + d}i$.`];
      conclusion = `$${a + c} + ${b + d}i$.`;
      hint = `Combine real parts together and imaginary parts together.`;
    }
  }

  // ==========================================
  // WORLD 10: ULTIMATE MATHEMATICAL MASTERY (Stages 91-100)
  // ==========================================
  else if (stageId === 91 || stageId === 92) {
    // Advanced Algebraic Reasoning & Multi-step Problems: 5 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      const mode = prng.pick(['plus', 'minus', 'cube']);
      const k = prng.pick([3, 4, 5, 6, 7, 8, 9, 10]);
      if (mode === 'plus') {
        const ans = k * k - 2;
        questionText = `If $x + \\frac{1}{x} = ${k}$, determine the exact value of $x^2 + \\frac{1}{x^2}$.`;
        correctAnswer = `$${ans}$`;
        const dist = generateNumericalDistractors(ans, prng);
        rawDistractors = dist.map(d => `$${d}$`);
        given = `Equation $x + \\frac{1}{x} = ${k}$.`;
        required = `Value of $x^2 + \\frac{1}{x^2}$.`;
        method = `Square both sides: $\\left(x + \\frac{1}{x}\\right)^2 = x^2 + 2 + \\frac{1}{x^2} = ${k}^2 = ${k * k}$. Thus $x^2 + \\frac{1}{x^2} = ${k * k} - 2 = ${ans}$.`;
        steps = [
          `Square: $\\left(x + \\frac{1}{x}\\right)^2 = ${k}^2 = ${k * k}$.`,
          `Expand: $x^2 + 2 + \\frac{1}{x^2} = ${k * k}$.`,
          `Subtract 2: $x^2 + \\frac{1}{x^2} = ${ans}$.`,
        ];
        conclusion = `$x^2 + \\frac{1}{x^2} = ${ans}$.`;
        hint = `Square both sides and subtract 2.`;
      } else if (mode === 'minus') {
        const ans = k * k + 2;
        questionText = `If $x - \\frac{1}{x} = ${k}$, determine the exact value of $x^2 + \\frac{1}{x^2}$.`;
        correctAnswer = `$${ans}$`;
        const dist = generateNumericalDistractors(ans, prng);
        rawDistractors = dist.map(d => `$${d}$`);
        given = `Equation $x - \\frac{1}{x} = ${k}$.`;
        required = `Value of $x^2 + \\frac{1}{x^2}$.`;
        method = `Square both sides: $\\left(x - \\frac{1}{x}\\right)^2 = x^2 - 2 + \\frac{1}{x^2} = ${k}^2 = ${k * k}$. Thus $x^2 + \\frac{1}{x^2} = ${k * k} + 2 = ${ans}$.`;
        steps = [
          `Square: $\\left(x - \\frac{1}{x}\\right)^2 = ${k}^2 = ${k * k}$.`,
          `Expand: $x^2 - 2 + \\frac{1}{x^2} = ${k * k}$.`,
          `Add 2: $x^2 + \\frac{1}{x^2} = ${ans}$.`,
        ];
        conclusion = `$x^2 + \\frac{1}{x^2} = ${ans}$.`;
        hint = `Square both sides and add 2.`;
      } else {
        const ans = k * k * k - 3 * k;
        questionText = `If $x + \\frac{1}{x} = ${k}$, find the exact value of $x^3 + \\frac{1}{x^3}$.`;
        correctAnswer = `$${ans}$`;
        const dist = generateNumericalDistractors(ans, prng);
        rawDistractors = dist.map(d => `$${d}$`);
        given = `$x + \\frac{1}{x} = ${k}$.`;
        required = `$x^3 + \\frac{1}{x^3}$.`;
        method = `Cube identity: $x^3 + \\frac{1}{x^3} = \\left(x + \\frac{1}{x}\\right)^3 - 3\\left(x + \\frac{1}{x}\\right) = ${k}^3 - 3(${k}) = ${ans}$.`;
        steps = [`$${k}^3 - 3(${k}) = ${k * k * k} - ${3 * k} = ${ans}$.`];
        conclusion = `$x^3 + \\frac{1}{x^3} = ${ans}$.`;
        hint = `Use the identity $(x + 1/x)^3 - 3(x + 1/x)$.`;
      }
    } else if (subtopicIndex === 1) {
      // Symmetric system x + y = s, xy = p
      const s = prng.pick([6, 7, 8, 9, 10, 11, 12, 13, 14]);
      const maxP = Math.floor((s * s) / 4);
      const p = prng.int(3, Math.min(20, maxP));
      const target = prng.pick(['sumOfSquares', 'diffOfSquares']);
      if (target === 'sumOfSquares') {
        const ans = s * s - 2 * p;
        questionText = `If $x + y = ${s}$ and $xy = ${p}$, find the value of $x^2 + y^2$.`;
        correctAnswer = `$${ans}$`;
        const dist = generateNumericalDistractors(ans, prng);
        rawDistractors = dist.map(d => `$${d}$`);
        given = `$x + y = ${s}$, $xy = ${p}$.`;
        required = `$x^2 + y^2$.`;
        method = `Identity: $x^2 + y^2 = (x + y)^2 - 2xy = (${s})^2 - 2(${p}) = ${s * s} - ${2 * p} = ${ans}$.`;
        steps = [`$(${s})^2 - 2(${p}) = ${s * s} - ${2 * p} = ${ans}$.`];
        conclusion = `$x^2 + y^2 = ${ans}$.`;
        hint = `Use the identity $x^2 + y^2 = (x + y)^2 - 2xy$.`;
      } else {
        const ans = s * s - 4 * p;
        questionText = `If $x + y = ${s}$ and $xy = ${p}$, calculate the value of $(x - y)^2$.`;
        correctAnswer = `$${ans}$`;
        const dist = generateNumericalDistractors(ans, prng);
        rawDistractors = dist.map(d => `$${d}$`);
        given = `$x + y = ${s}$, $xy = ${p}$.`;
        required = `$(x - y)^2$.`;
        method = `Identity: $(x - y)^2 = (x + y)^2 - 4xy = (${s})^2 - 4(${p}) = ${s * s} - ${4 * p} = ${ans}$.`;
        steps = [`$(${s})^2 - 4(${p}) = ${s * s} - ${4 * p} = ${ans}$.`];
        conclusion = `$(x - y)^2 = ${ans}$.`;
        hint = `Use the identity $(x - y)^2 = (x + y)^2 - 4xy$.`;
      }
    } else if (subtopicIndex === 2) {
      // Sum or difference of cubes
      const isMinus = prng.pick([true, false]);
      const a = prng.int(3, 8);
      const b = prng.int(1, Math.min(a - 1, 4));
      if (isMinus) {
        const ans = Math.pow(a, 3) - Math.pow(b, 3);
        questionText = `Evaluate the difference of cubes: $$${a}^3 - ${b}^3$$`;
        correctAnswer = `$${ans}$`;
        const dist = generateNumericalDistractors(ans, prng);
        rawDistractors = dist.map(d => `$${d}$`);
        given = `$${a}^3 - ${b}^3$.`;
        required = `Difference value.`;
        method = `Formula: $a^3 - b^3 = (a - b)(a^2 + ab + b^2) = ${ans}$.`;
        steps = [`$${a}^3 = ${a * a * a}$, $${b}^3 = ${b * b * b} \\implies ${a * a * a} - ${b * b * b} = ${ans}$.`];
        conclusion = `The value is $${ans}$.`;
        hint = `Compute $${a}^3 - ${b}^3$.`;
      } else {
        const ans = Math.pow(a, 3) + Math.pow(b, 3);
        questionText = `Evaluate the sum of cubes: $$${a}^3 + ${b}^3$$`;
        correctAnswer = `$${ans}$`;
        const dist = generateNumericalDistractors(ans, prng);
        rawDistractors = dist.map(d => `$${d}$`);
        given = `$${a}^3 + ${b}^3$.`;
        required = `Sum value.`;
        method = `Formula: $a^3 + b^3 = (a + b)(a^2 - ab + b^2) = ${ans}$.`;
        steps = [`$${a * a * a} + ${b * b * b} = ${ans}$.`];
        conclusion = `The value is $${ans}$.`;
        hint = `Compute $${a}^3 + ${b}^3$.`;
      }
    } else if (subtopicIndex === 3) {
      // Telescoping sum
      const nVals = [20, 24, 49, 50, 75, 99, 100, 199, 999];
      const N = prng.pick(nVals);
      questionText = `Evaluate the telescoping sum: $$\\sum_{k=1}^{${N}} \\left( \\frac{1}{k} - \\frac{1}{k+1} \\right)$$`;
      correctAnswer = `$\\frac{${N}}{${N + 1}}$`;
      rawDistractors = [`$1$`, `$\\frac{1}{${N + 1}}$`, `$\\frac{${N - 1}}{${N}}$`];
      given = `Sum $\\sum_{k=1}^{${N}} \\left(\\frac{1}{k} - \\frac{1}{k+1}\\right)$.`;
      required = `Exact simplified value.`;
      method = `All intermediate terms cancel: $\\left(1 - \\frac{1}{2}\\right) + \\dots + \\left(\\frac{1}{${N}} - \\frac{1}{${N + 1}}\\right) = 1 - \\frac{1}{${N + 1}} = \\frac{${N}}{${N + 1}}$.`;
      steps = [
        `Telescoping cancellation leaves: $1 - \\frac{1}{${N + 1}}$.`,
        `$1 - \\frac{1}{${N + 1}} = \\frac{${N}}{${N + 1}}$.`,
      ];
      conclusion = `The sum is $\\frac{${N}}{${N + 1}}$.`;
      hint = `Notice that all intermediate terms cancel, leaving $1 - \\frac{1}{N+1}$.`;
    } else {
      // Completing the square in two variables (minimum of x^2 + y^2 - 2hx + 2ky + C)
      const h = prng.int(1, 5);
      const k = prng.int(1, 5);
      const m = prng.int(1, 12);
      const C = h * h + k * k + m;
      questionText = `Find the minimum real value attained by the multivariable expression: $$f(x, y) = x^2 + y^2 - ${2 * h}x + ${2 * k}y + ${C}$$`;
      correctAnswer = `$${m}$`;
      const dist = generateNumericalDistractors(m, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Function $f(x, y) = x^2 + y^2 - ${2 * h}x + ${2 * k}y + ${C}$.`;
      required = `Minimum value.`;
      method = `Complete the square: $(x - ${h})^2 - ${h * h} + (y + ${k})^2 - ${k * k} + ${C} = (x - ${h})^2 + (y + ${k})^2 + ${m}$. Minimum is $${m}$.`;
      steps = [
        `$x^2 - ${2 * h}x = (x - ${h})^2 - ${h * h}$.`,
        `$y^2 + ${2 * k}y = (y + ${k})^2 - ${k * k}$.`,
        `$f(x, y) = (x - ${h})^2 + (y + ${k})^2 + (${C} - ${h * h + k * k}) = (x - ${h})^2 + (y + ${k})^2 + ${m}$.`,
        `Since squares are $\\ge 0$, minimum is $${m}$ at $(${h}, -${k})$.`,
      ];
      conclusion = `The minimum value is $${m}$.`;
      hint = `Complete the square for $x$ and $y$ separately.`;
    }
  } else if (stageId === 93) {
    // Mathematical Logic & Set Theory: 10 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic;

    if (subtopicIndex === 0) {
      const vars = prng.pick([
        { p: 'P', q: 'Q' },
        { p: 'A', q: 'B' },
        { p: 'R', q: 'S' },
        { p: 'X', q: 'Y' },
        { p: 'M', q: 'N' },
        { p: 'U', q: 'V' },
        { p: 'H', q: 'K' },
      ]);
      const mode = prng.pick(['contrapositive', 'converse', 'inverse']);
      if (mode === 'contrapositive') {
        questionText = `Which logical statement is logically equivalent to the conditional statement: $$${vars.p} \\implies ${vars.q}$$`;
        correctAnswer = `$\\neg ${vars.q} \\implies \\neg ${vars.p}$`;
        rawDistractors = [`$${vars.q} \\implies ${vars.p}$`, `$\\neg ${vars.p} \\implies \\neg ${vars.q}$`, `$${vars.p} \\land \\neg ${vars.q}$`];
        given = `Conditional $${vars.p} \\implies ${vars.q}$.`;
        required = `Logically equivalent statement.`;
        method = `A conditional statement is always logically equivalent to its contrapositive: $(${vars.p} \\implies ${vars.q}) \\equiv (\\neg ${vars.q} \\implies \\neg ${vars.p})$.`;
        steps = [`Contrapositive: negate and swap both hypothesis and conclusion: $\\neg ${vars.q} \\implies \\neg ${vars.p}$.`];
        conclusion = `$\\neg ${vars.q} \\implies \\neg ${vars.p}$.`;
        hint = `A conditional statement is always equivalent to its contrapositive.`;
      } else if (mode === 'converse') {
        questionText = `What is the converse of the conditional statement: $$${vars.p} \\implies ${vars.q}$$`;
        correctAnswer = `$${vars.q} \\implies ${vars.p}$`;
        rawDistractors = [`$\\neg ${vars.q} \\implies \\neg ${vars.p}$`, `$\\neg ${vars.p} \\implies \\neg ${vars.q}$`, `$${vars.p} \\iff ${vars.q}$`];
        given = `Conditional $${vars.p} \\implies ${vars.q}$.`;
        required = `Converse of the statement.`;
        method = `The converse of $p \\implies q$ is formed by interchanging hypothesis and conclusion: $q \\implies p$.`;
        steps = [`Swap hypothesis and conclusion: $${vars.q} \\implies ${vars.p}$.`];
        conclusion = `$${vars.q} \\implies ${vars.p}$.`;
        hint = `The converse interchanges hypothesis and conclusion without negating.`;
      } else {
        questionText = `What is the inverse of the conditional statement: $$${vars.p} \\implies ${vars.q}$$`;
        correctAnswer = `$\\neg ${vars.p} \\implies \\neg ${vars.q}$`;
        rawDistractors = [`$\\neg ${vars.q} \\implies \\neg ${vars.p}$`, `$${vars.q} \\implies ${vars.p}$`, `$\\neg ${vars.q} \\land ${vars.p}$`];
        given = `Conditional $${vars.p} \\implies ${vars.q}$.`;
        required = `Inverse of the statement.`;
        method = `The inverse of $p \\implies q$ negates both terms without swapping: $\\neg p \\implies \\neg q$.`;
        steps = [`Negate both terms: $\\neg ${vars.p} \\implies \\neg ${vars.q}$.`];
        conclusion = `$\\neg ${vars.p} \\implies \\neg ${vars.q}$.`;
        hint = `The inverse negates both hypothesis and conclusion without swapping.`;
      }
    } else if (subtopicIndex === 1) {
      const deMorganRule = prng.pick(['and', 'or', 'implication', 'doubleNegation']);
      if (deMorganRule === 'and') {
        questionText = `By De Morgan's Laws of propositional logic, the negation $\\neg(P \\land Q)$ is logically equivalent to:`;
        correctAnswer = `$\\neg P \\lor \\neg Q$`;
        rawDistractors = [`$\\neg P \\land \\neg Q$`, `$P \\lor Q$`, `$\\neg P \\implies \\neg Q$`];
        given = `Expression $\\neg(P \\land Q)$.`;
        required = `Equivalent disjunction.`;
        method = `De Morgan's First Law: the negation of a conjunction is the disjunction of the negations.`;
        steps = [`$\\neg(P \\land Q) \\equiv \\neg P \\lor \\neg Q$.`];
        conclusion = `$\\neg P \\lor \\neg Q$.`;
        hint = `Negating an AND statement turns it into an OR of the negated terms.`;
      } else if (deMorganRule === 'or') {
        questionText = `By De Morgan's Laws of propositional logic, the negation $\\neg(P \\lor Q)$ is logically equivalent to:`;
        correctAnswer = `$\\neg P \\land \\neg Q$`;
        rawDistractors = [`$\\neg P \\lor \\neg Q$`, `$P \\land Q$`, `$\\neg(P \\implies Q)$`];
        given = `Expression $\\neg(P \\lor Q)$.`;
        required = `Equivalent conjunction.`;
        method = `De Morgan's Second Law: the negation of a disjunction is the conjunction of the negations.`;
        steps = [`$\\neg(P \\lor Q) \\equiv \\neg P \\land \\neg Q$.`];
        conclusion = `$\\neg P \\land \\neg Q$.`;
        hint = `Negating an OR statement turns it into an AND of the negated terms.`;
      } else if (deMorganRule === 'implication') {
        questionText = `Which expression is logically equivalent to the negation of a conditional statement, $\\neg(P \\implies Q)$?`;
        correctAnswer = `$P \\land \\neg Q$`;
        rawDistractors = [`$\\neg P \\implies \\neg Q$`, `$\\neg P \\lor Q$`, `$P \\lor \\neg Q$`];
        given = `Negation $\\neg(P \\implies Q)$.`;
        required = `Equivalent form.`;
        method = `Since $P \\implies Q \\equiv \\neg P \\lor Q$, its negation is $\\neg(\\neg P \\lor Q) \\equiv P \\land \\neg Q$.`;
        steps = [
          `Express implication as disjunction: $P \\implies Q \\equiv \\neg P \\lor Q$.`,
          `Apply De Morgan's Law: $\\neg(\\neg P \\lor Q) \\equiv P \\land \\neg Q$.`,
        ];
        conclusion = `$P \\land \\neg Q$.`;
        hint = `A conditional is false only when the antecedent is true and the consequent is false.`;
      } else {
        questionText = `According to the Double Negation Law of classical propositional logic, $\\neg(\\neg P)$ simplifies to:`;
        correctAnswer = `$P$`;
        rawDistractors = [`$\\neg P$`, `$P \\lor \\neg P$`, `$\\text{Contradiction}$`];
        given = `Double negation $\\neg(\\neg P)$.`;
        required = `Simplified proposition.`;
        method = `In classical logic, the negation of a negation yields the original truth value: $\\neg(\\neg P) \\equiv P$.`;
        steps = [`$\\neg(\\neg P) \\equiv P$.`];
        conclusion = `$P$.`;
        hint = `Two negations cancel each other out in classical logic.`;
      }
    } else if (subtopicIndex === 2) {
      const combos = [
        { p: false, q: true, ans: 'True' },
        { p: true, q: false, ans: 'False' },
        { p: false, q: false, ans: 'True' },
        { p: true, q: true, ans: 'True' },
      ];
      const c = prng.pick(combos);
      const pStr = c.p ? 'True' : 'False';
      const qStr = c.q ? 'True' : 'False';
      questionText = `What is the truth value of the implication $P \\implies Q$ when $P$ is ${pStr} and $Q$ is ${qStr}?`;
      correctAnswer = `$\\text{${c.ans}}$`;
      rawDistractors = [c.ans === 'True' ? '$\\text{False}$' : '$\\text{True}$', '$\\text{Undefined}$', '$\\text{Contingency}$'];
      given = `Truth assignment: $P = \\text{${pStr}}$, $Q = \\text{${qStr}}$.`;
      required = `Truth value of $P \\implies Q$.`;
      method = `An implication is only False when True implies False; in all other three assignments it is True.`;
      steps = [`${pStr} $\\implies$ ${qStr} evaluates to ${c.ans}.`];
      conclusion = `The truth value is ${c.ans}.`;
      hint = `An implication $P \\implies Q$ is only false when $P$ is True and $Q$ is False.`;
    } else if (subtopicIndex === 3) {
      const stmts = [
        { orig: 'All prime numbers are odd', neg: 'There exists at least one prime number that is not odd' },
        { orig: 'Every square is an equilateral triangle', neg: 'There exists a square that is not an equilateral triangle' },
        { orig: 'All continuous functions are differentiable', neg: 'There exists at least one continuous function that is not differentiable' },
        { orig: 'For every real number $x$, $x^2 > 0$', neg: 'There exists a real number $x$ such that $x^2 \\le 0$' },
        { orig: 'Every integer is divisible by 2', neg: 'There exists an integer that is not divisible by 2' },
        { orig: 'All triangles have an interior angle sum of 180 degrees', neg: 'There exists a triangle whose interior angle sum is not 180 degrees' },
        { orig: 'Every convergent sequence of real numbers is bounded', neg: 'There exists a convergent sequence of real numbers that is unbounded' },
        { orig: 'For all positive integers $n$, $2^n > n$', neg: 'There exists a positive integer $n$ such that $2^n \\le n$' },
        { orig: 'All real numbers have a real multiplicative inverse', neg: 'There exists a real number with no real multiplicative inverse' },
        { orig: 'Every bounded monotone sequence converges', neg: 'There exists a bounded monotone sequence that diverges' },
      ];
      const s = prng.pick(stmts);
      questionText = `What is the formal logical negation of the universal statement: "${s.orig}"?`;
      correctAnswer = `$\\text{${s.neg}.}$`;
      rawDistractors = [
        `$\\text{No elements satisfy this condition.}$`,
        `$\\text{All elements strictly violate this condition.}$`,
        `$\\text{The statement is vacuously false.}$`,
      ];
      given = `Universal statement: "${s.orig}".`;
      required = `Logical negation.`;
      method = `The negation of $\\forall x, P(x)$ is $\\exists x, \\neg P(x)$.`;
      steps = [`$\\neg(\\forall x, P(x)) \\equiv \\exists x, \\neg P(x)$.`];
      conclusion = `${s.neg}.`;
      hint = `The negation of "all" is "there exists at least one counterexample".`;
    } else if (subtopicIndex === 4) {
      const terms = [
        { term: 'Tautology', desc: 'ALWAYS true in every possible row of its truth table' },
        { term: 'Contradiction', desc: 'ALWAYS false in every possible row of its truth table' },
        { term: 'Contingency', desc: 'TRUE in at least one truth assignment and FALSE in at least one other' },
      ];
      const t = prng.pick(terms);
      questionText = `In formal mathematical logic, a proposition that is ${t.desc} is termed a:`;
      correctAnswer = `$\\text{${t.term}}$`;
      rawDistractors = terms.filter(x => x.term !== t.term).map(x => `$\\text{${x.term}}$`);
      rawDistractors.push('$\\text{Axiom}$');
      given = `Definition of propositional truth table profile.`;
      required = `Mathematical term.`;
      method = `A formula identically true is a tautology; identically false is a contradiction; variable truth is a contingency.`;
      steps = [`Matches definition of: ${t.term}.`];
      conclusion = `It is a ${t.term}.`;
      hint = `Recall definitions: tautology (always true), contradiction (always false), contingency (neither).`;
    } else if (subtopicIndex === 5) {
      // Biconditional truth values
      const bCombos = [
        { p: true, q: true, ans: 'True' },
        { p: true, q: false, ans: 'False' },
        { p: false, q: true, ans: 'False' },
        { p: false, q: false, ans: 'True' },
      ];
      const bc = prng.pick(bCombos);
      const pStr = bc.p ? 'True' : 'False';
      const qStr = bc.q ? 'True' : 'False';
      questionText = `Evaluate the truth value of the biconditional statement $P \\iff Q$ when $P$ is ${pStr} and $Q$ is ${qStr}:`;
      correctAnswer = `$\\text{${bc.ans}}$`;
      rawDistractors = [bc.ans === 'True' ? '$\\text{False}$' : '$\\text{True}$', '$\\text{Contradiction}$', '$\\text{Undefined}$'];
      given = `Biconditional $P \\iff Q$ with $P = \\text{${pStr}}$ and $Q = \\text{${qStr}}$.`;
      required = `Truth value.`;
      method = `A biconditional $P \\iff Q$ is True if and only if both propositions share identical truth values.`;
      steps = [`Since $P$ and $Q$ have ${bc.p === bc.q ? 'the same' : 'different'} truth values, $P \\iff Q$ is ${bc.ans}.`];
      conclusion = `The biconditional is ${bc.ans}.`;
      hint = `A biconditional is True when both sides have matching truth values.`;
    } else if (subtopicIndex === 6) {
      // Conjunction / Disjunction / XOR
      const op = prng.pick(['and', 'or', 'xor']);
      const pVal = prng.pick([true, false]);
      const qVal = prng.pick([true, false]);
      const pStr = pVal ? 'True' : 'False';
      const qStr = qVal ? 'True' : 'False';
      let symbol = '';
      let ans = '';
      let ruleName = '';
      if (op === 'and') {
        symbol = 'P \\land Q';
        ans = pVal && qVal ? 'True' : 'False';
        ruleName = 'conjunction (AND)';
      } else if (op === 'or') {
        symbol = 'P \\lor Q';
        ans = pVal || qVal ? 'True' : 'False';
        ruleName = 'disjunction (OR)';
      } else {
        symbol = 'P \\oplus Q';
        ans = pVal !== qVal ? 'True' : 'False';
        ruleName = 'exclusive OR (XOR)';
      }
      questionText = `Find the truth value of the ${ruleName} $$${symbol}$$ given that $P$ is ${pStr} and $Q$ is ${qStr}:`;
      correctAnswer = `$\\text{${ans}}$`;
      rawDistractors = [ans === 'True' ? '$\\text{False}$' : '$\\text{True}$', '$\\text{Tautology}$', '$\\text{Contingency}$'];
      given = `$P = \\text{${pStr}}$, $Q = \\text{${qStr}}$, operation: $${symbol}$.`;
      required = `Truth value.`;
      method = `Apply the definition of the logical operator.`;
      steps = [`${pStr} evaluated with operator gives ${ans}.`];
      conclusion = `The statement evaluates to ${ans}.`;
      hint = `Recall the truth condition for this logical connective.`;
    } else if (subtopicIndex === 7) {
      // Material Implication equivalence
      const vars = prng.pick([
        { p: 'P', q: 'Q' },
        { p: 'A', q: 'B' },
        { p: 'R', q: 'S' },
        { p: 'X', q: 'Y' },
      ]);
      questionText = `Using material implication equivalence, the conditional $${vars.p} \\implies ${vars.q}$ is logically identical to:`;
      correctAnswer = `$\\neg ${vars.p} \\lor ${vars.q}$`;
      rawDistractors = [`$${vars.p} \\land \\neg ${vars.q}$`, `$\\neg ${vars.p} \\land ${vars.q}$`, `$\\neg ${vars.q} \\lor ${vars.p}$`];
      given = `Conditional $${vars.p} \\implies ${vars.q}$.`;
      required = `Equivalent disjunctive normal form.`;
      method = `By the law of material implication, $p \\implies q \\equiv \\neg p \\lor q$.`;
      steps = [`$${vars.p} \\implies ${vars.q} \\equiv \\neg ${vars.p} \\lor ${vars.q}$.`];
      conclusion = `$\\neg ${vars.p} \\lor ${vars.q}$.`;
      hint = `Material implication: "if p then q" means either p is false or q is true.`;
    } else if (subtopicIndex === 8) {
      // Set Theory: Inclusion-Exclusion for 2 sets
      const nA = prng.int(20, 50);
      const nB = prng.int(20, 50);
      const nBoth = prng.int(5, Math.min(nA, nB) - 5);
      const nUnion = nA + nB - nBoth;
      questionText = `For two finite sets $A$ and $B$, $|A| = ${nA}$, $|B| = ${nB}$, and $|A \\cap B| = ${nBoth}$. Find the cardinality of their union, $|A \\cup B|$:`;
      correctAnswer = `$${nUnion}$`;
      const dist = generateNumericalDistractors(nUnion, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$|A| = ${nA}$, $|B| = ${nB}$, $|A \\cap B| = ${nBoth}$.`;
      required = `$|A \\cup B|$.`;
      method = `Use the Principle of Inclusion-Exclusion: $|A \\cup B| = |A| + |B| - |A \\cap B|$.`;
      steps = [
        `$|A \\cup B| = ${nA} + ${nB} - ${nBoth}$.`,
        `$|A \\cup B| = ${nA + nB} - ${nBoth} = ${nUnion}$.`,
      ];
      conclusion = `$|A \\cup B| = ${nUnion}$.`;
      hint = `Add the sizes of both sets and subtract the elements in their intersection to avoid double-counting.`;
    } else {
      // Power set cardinality
      const n = prng.pick([3, 4, 5, 6, 7]);
      const card = Math.pow(2, n);
      questionText = `If a set $S$ contains exactly $${n}$ distinct elements, what is the cardinality of its power set, $|\\mathcal{P}(S)|$?`;
      correctAnswer = `$${card}$`;
      const dist = generateNumericalDistractors(card, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Set $S$ with $|S| = ${n}$.`;
      required = `Cardinality of power set $|\\mathcal{P}(S)|$.`;
      method = `The power set of a set with $n$ elements has $2^n$ subsets.`;
      steps = [`$|\\mathcal{P}(S)| = 2^{${n}} = ${card}$.`];
      conclusion = `$|\\mathcal{P}(S)| = ${card}$.`;
      hint = `Every element has 2 choices (in or out of a subset): $2^n$.`;
    }
  } else if (stageId === 94) {
    // Number Theory & Modular Arithmetic: 10 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic;

    if (subtopicIndex === 0) {
      // Linear congruence: 2x = b (mod m) with odd modulus
      const m = prng.pick([5, 7, 11, 13, 17, 19]);
      const rem = prng.int(1, m - 1);
      const rhs = (rem * 2) % m;
      questionText = `Find the unique integer $x \\in \\{0, 1, \\dots, ${m - 1}\\}$ satisfying the linear congruence: $$2x \\equiv ${rhs} \\pmod{${m}}$$`;
      correctAnswer = `$x = ${rem}$`;
      rawDistractors = [`$x = ${(rem + 1) % m}$`, `$x = ${(rem + 2) % m}$`, `$x = ${(rem - 1 + m) % m}$`];
      given = `Congruence $2x \\equiv ${rhs} \\pmod{${m}}$.`;
      required = `Solution for $x$.`;
      method = `Since $\\gcd(2, ${m}) = 1$, 2 has a unique modular inverse modulo ${m}. Solution is $x = ${rem}$.`;
      steps = [`$2(${rem}) = ${2 * rem} \\equiv ${rhs} \\pmod{${m}}$.`];
      conclusion = `$x = ${rem}$.`;
      hint = `Check which integer multiplied by 2 gives remainder ${rhs} modulo ${m}.`;
    } else if (subtopicIndex === 1) {
      // Fermat's Little Theorem
      const p = prng.pick([7, 11, 13, 17, 19, 23]);
      const a = prng.pick([2, 3, 5, 7, 10]);
      questionText = `By Fermat's Little Theorem, if $p = ${p}$ is prime and $\\gcd(${a}, ${p}) = 1$, what is the remainder of $${a}^{${p - 1}}$ when divided by $${p}$?`;
      correctAnswer = `$1$`;
      rawDistractors = [`$0$`, `$${a}$`, `$${p - 1}$`];
      given = `Prime $p = ${p}$, base $a = ${a}$.`;
      required = `Value of $${a}^{${p - 1}} \\pmod{${p}}$.`;
      method = `Fermat's Little Theorem states $a^{p-1} \\equiv 1 \\pmod{p}$ for any prime $p$ coprime to $a$.`;
      steps = [`$${a}^{${p} - 1} = ${a}^{${p - 1}} \\equiv 1 \\pmod{${p}}$.`];
      conclusion = `The remainder is $1$.`;
      hint = `Fermat's Little Theorem: $a^{p-1} \\equiv 1 \\pmod p$ for prime $p$.`;
    } else if (subtopicIndex === 2) {
      // Divisor count formula
      const cases = [
        { n: 24, fact: '2^3 \\times 3^1', d: 8, exp: '(3+1)(1+1)' },
        { n: 36, fact: '2^2 \\times 3^2', d: 9, exp: '(2+1)(2+1)' },
        { n: 48, fact: '2^4 \\times 3^1', d: 10, exp: '(4+1)(1+1)' },
        { n: 60, fact: '2^2 \\times 3^1 \\times 5^1', d: 12, exp: '(2+1)(1+1)(1+1)' },
        { n: 72, fact: '2^3 \\times 3^2', d: 12, exp: '(3+1)(2+1)' },
        { n: 84, fact: '2^2 \\times 3^1 \\times 7^1', d: 12, exp: '(2+1)(1+1)(1+1)' },
        { n: 96, fact: '2^5 \\times 3^1', d: 12, exp: '(5+1)(1+1)' },
        { n: 100, fact: '2^2 \\times 5^2', d: 9, exp: '(2+1)(2+1)' },
        { n: 108, fact: '2^2 \\times 3^3', d: 12, exp: '(2+1)(3+1)' },
        { n: 120, fact: '2^3 \\times 3^1 \\times 5^1', d: 16, exp: '(3+1)(1+1)(1+1)' },
      ];
      const item = prng.pick(cases);
      questionText = `Determine the total number of positive integer divisors of $${item.n}$.`;
      correctAnswer = `$${item.d}$`;
      const dist = generateNumericalDistractors(item.d, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Number $${item.n}$.`;
      required = `Number of positive divisors $d(${item.n})$.`;
      method = `Prime factorization: $${item.n} = ${item.fact}$. Divisor count formula: $d(n) = ${item.exp} = ${item.d}$.`;
      steps = [
        `Prime factorization: $${item.n} = ${item.fact}$.`,
        `$d(${item.n}) = ${item.exp} = ${item.d}$.`,
      ];
      conclusion = `$${item.n}$ has $${item.d}$ positive divisors.`;
      hint = `Factorize into primes and multiply incremented exponents: $\\prod(e_i + 1)$.`;
    } else if (subtopicIndex === 3) {
      // Modular exponentiation
      const modCases = [
        { base: 2, exp: 5, m: 7, ans: 4 },
        { base: 3, exp: 4, m: 5, ans: 1 },
        { base: 2, exp: 6, m: 9, ans: 1 },
        { base: 5, exp: 3, m: 7, ans: 6 },
        { base: 2, exp: 7, m: 11, ans: 7 },
        { base: 3, exp: 5, m: 8, ans: 3 },
        { base: 4, exp: 3, m: 9, ans: 1 },
        { base: 2, exp: 8, m: 13, ans: 9 },
      ];
      const mc = prng.pick(modCases);
      questionText = `Compute the exact value of the modular power: $$${mc.base}^{${mc.exp}} \\pmod{${mc.m}}$$`;
      correctAnswer = `$${mc.ans}$`;
      const dist = generateNumericalDistractors(mc.ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Power $${mc.base}^{${mc.exp}} \\pmod{${mc.m}}$.`;
      required = `Remainder.`;
      method = `Evaluate the power and find the remainder modulo ${mc.m}.`;
      steps = [`$${mc.base}^{${mc.exp}} = ${Math.pow(mc.base, mc.exp)} \\equiv ${mc.ans} \\pmod{${mc.m}}$.`];
      conclusion = `The remainder is $${mc.ans}$.`;
      hint = `Compute $${mc.base}^{${mc.exp}}$ and take the remainder modulo ${mc.m}.`;
    } else if (subtopicIndex === 4) {
      // GCD via Euclidean Algorithm
      const gcdPairs = [
        { a: 84, b: 36, gcd: 12, s1: '84 = 2(36) + 12', s2: '36 = 3(12) + 0' },
        { a: 96, b: 54, gcd: 6, s1: '96 = 1(54) + 42', s2: '54 = 1(42) + 12', s3: '42 = 3(12) + 6', s4: '12 = 2(6) + 0' },
        { a: 105, b: 45, gcd: 15, s1: '105 = 2(45) + 15', s2: '45 = 3(15) + 0' },
        { a: 140, b: 52, gcd: 4, s1: '140 = 2(52) + 36', s2: '52 = 1(36) + 16', s3: '36 = 2(16) + 4', s4: '16 = 4(4) + 0' },
        { a: 180, b: 75, gcd: 15, s1: '180 = 2(75) + 30', s2: '75 = 2(30) + 15', s3: '30 = 2(15) + 0' },
        { a: 132, b: 48, gcd: 12, s1: '132 = 2(48) + 36', s2: '48 = 1(36) + 12', s3: '36 = 3(12) + 0' },
        { a: 210, b: 45, gcd: 15, s1: '210 = 4(45) + 30', s2: '45 = 1(30) + 15', s3: '30 = 2(15) + 0' },
        { a: 252, b: 105, gcd: 21, s1: '252 = 2(105) + 42', s2: '105 = 2(42) + 21', s3: '42 = 2(21) + 0' },
      ];
      const gp = prng.pick(gcdPairs);
      questionText = `Find the greatest common divisor $\\gcd(${gp.a}, ${gp.b})$ using the Euclidean Algorithm:`;
      correctAnswer = `$${gp.gcd}$`;
      const dist = generateNumericalDistractors(gp.gcd, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Integers $${gp.a}$ and $${gp.b}$.`;
      required = `$\\gcd(${gp.a}, ${gp.b})$.`;
      method = `Perform successive Euclidean divisions until remainder is zero.`;
      steps = [`$${gp.s1}$.`, `$${gp.s2}$.`, `Last non-zero remainder $= ${gp.gcd}$.`];
      conclusion = `$\\gcd(${gp.a}, ${gp.b}) = ${gp.gcd}$.`;
      hint = `Successively divide the larger by the smaller and take the remainder until 0.`;
    } else if (subtopicIndex === 5) {
      // Euler's Totient function
      const totients = [
        { n: 8, phi: 4, reason: 'Coprime integers: 1, 3, 5, 7' },
        { n: 9, phi: 6, reason: '9(1 - 1/3) = 6' },
        { n: 10, phi: 4, reason: '10(1 - 1/2)(1 - 1/5) = 4' },
        { n: 12, phi: 4, reason: '12(1 - 1/2)(1 - 1/3) = 4' },
        { n: 14, phi: 6, reason: '14(1 - 1/2)(1 - 1/7) = 6' },
        { n: 15, phi: 8, reason: '15(1 - 1/3)(1 - 1/5) = 8' },
        { n: 18, phi: 6, reason: '18(1 - 1/2)(1 - 1/3) = 6' },
        { n: 20, phi: 8, reason: '20(1 - 1/2)(1 - 1/5) = 8' },
      ];
      const tf = prng.pick(totients);
      questionText = `Evaluate Euler's totient function $\\phi(${tf.n})$ (the count of positive integers up to $${tf.n}$ coprime to $${tf.n}$):`;
      correctAnswer = `$${tf.phi}$`;
      const dist = generateNumericalDistractors(tf.phi, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Number $n = ${tf.n}$.`;
      required = `$\\phi(${tf.n})$.`;
      method = `Euler's product formula: $\\phi(n) = n \\prod_{p | n} (1 - 1/p)$.`;
      steps = [`Calculation: ${tf.reason} $\\implies \\phi(${tf.n}) = ${tf.phi}$.`];
      conclusion = `$\\phi(${tf.n}) = ${tf.phi}$.`;
      hint = `Count numbers $1 \\le k \\le ${tf.n}$ with $\\gcd(k, ${tf.n}) = 1$.`;
    } else if (subtopicIndex === 6) {
      // Wilson's Theorem
      const wp = prng.pick([5, 7, 11, 13]);
      questionText = `According to Wilson's Theorem, what is the remainder when $(${wp} - 1)! = ${wp - 1}!$ is divided by the prime $p = ${wp}$?`;
      correctAnswer = `$${wp - 1}$`;
      rawDistractors = [`$1$`, `$0$`, `$${Math.floor(wp / 2)}$`];
      given = `Prime $p = ${wp}$.`;
      required = `Value of $(${wp} - 1)! \\pmod{${wp}}$.`;
      method = `Wilson's Theorem states $(p - 1)! \\equiv -1 \\equiv p - 1 \\pmod{p}$ for every prime $p$.`;
      steps = [`$(${wp} - 1)! \\equiv -1 \\equiv ${wp - 1} \\pmod{${wp}}$.`];
      conclusion = `The remainder is $${wp - 1}$.`;
      hint = `Wilson's Theorem: $(p-1)! \\equiv -1 \\pmod p$.`;
    } else if (subtopicIndex === 7) {
      // Modular inverse
      const invPairs = [
        { a: 3, m: 7, inv: 5 }, // 3*5 = 15 = 1 mod 7
        { a: 2, m: 9, inv: 5 }, // 2*5 = 10 = 1 mod 9
        { a: 3, m: 11, inv: 4 }, // 3*4 = 12 = 1 mod 11
        { a: 4, m: 13, inv: 10 }, // 4*10 = 40 = 1 mod 13
        { a: 5, m: 11, inv: 9 }, // 5*9 = 45 = 1 mod 11
        { a: 7, m: 12, inv: 7 }, // 7*7 = 49 = 1 mod 12
      ];
      const ip = prng.pick(invPairs);
      questionText = `Find the unique modular multiplicative inverse of $${ip.a}$ modulo $${ip.m}$ (solve $${ip.a}x \\equiv 1 \\pmod{${ip.m}}$ for $0 \\le x < ${ip.m}$):`;
      correctAnswer = `$x = ${ip.inv}$`;
      rawDistractors = [`$x = ${(ip.inv + 1) % ip.m}$`, `$x = ${(ip.inv + 2) % ip.m}$`, `$x = ${(ip.inv - 1 + ip.m) % ip.m}$`];
      given = `Congruence $${ip.a}x \\equiv 1 \\pmod{${ip.m}}$.`;
      required = `Modular inverse $x$.`;
      method = `Check $x$ such that $${ip.a} \\times x$ leaves remainder 1 when divided by ${ip.m}.`;
      steps = [`$${ip.a} \\times ${ip.inv} = ${ip.a * ip.inv} = ${Math.floor((ip.a * ip.inv) / ip.m)} \\times ${ip.m} + 1 \\equiv 1 \\pmod{${ip.m}}$.`];
      conclusion = `$x = ${ip.inv}$.`;
      hint = `Find $x$ where $(${ip.a} \\cdot x) \\% ${ip.m} == 1$.`;
    } else if (subtopicIndex === 8) {
      // Sum of divisors sigma(n)
      const sigmas = [
        { n: 12, sum: 28, div: '1, 2, 3, 4, 6, 12' },
        { n: 18, sum: 39, div: '1, 2, 3, 6, 9, 18' },
        { n: 20, sum: 42, div: '1, 2, 4, 5, 10, 20' },
        { n: 24, sum: 60, div: '1, 2, 3, 4, 6, 8, 12, 24' },
        { n: 28, sum: 56, div: '1, 2, 4, 7, 14, 28 (perfect number sum = 2n)' },
      ];
      const sg = prng.pick(sigmas);
      questionText = `Find the sum of all positive divisors $\\sigma(${sg.n})$ of the integer $${sg.n}$:`;
      correctAnswer = `$${sg.sum}$`;
      const dist = generateNumericalDistractors(sg.sum, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Number $n = ${sg.n}$.`;
      required = `Sum of divisors $\\sigma(${sg.n})$.`;
      method = `List or use the formula $\\sigma(n) = \\prod \\frac{p^{a+1} - 1}{p - 1}$.`;
      steps = [`Divisors of ${sg.n}: ${sg.div}. Sum $= ${sg.sum}$.`];
      conclusion = `$\\sigma(${sg.n}) = ${sg.sum}$.`;
      hint = `Sum all positive integers that evenly divide ${sg.n}.`;
    } else {
      // Parity and Divisibility Rules
      const k = prng.pick([3, 4, 7, 8, 9]);
      questionText = `An integer is divisible by $${k === 9 ? '9' : k === 3 ? '3' : '4'}$ if and only if:`;
      if (k === 9 || k === 3) {
        correctAnswer = `$\\text{The sum of its digits is divisible by ${k}}$`;
        rawDistractors = [
          `$\\text{Its last digit is divisible by ${k}}$`,
          `$\\text{Its last two digits are divisible by ${k}}$`,
          `$\\text{It is an even number}$`,
        ];
      } else {
        correctAnswer = `$\\text{The number formed by its last two digits is divisible by 4}$`;
        rawDistractors = [
          `$\\text{The sum of its digits is divisible by 4}$`,
          `$\\text{Its last digit is an even number}$`,
          `$\\text{The alternating sum of its digits is 0}$`,
        ];
      }
      given = `Divisibility test for $${k === 9 ? 9 : k === 3 ? 3 : 4}$.`;
      required = `Condition for divisibility.`;
      method = `Base-10 positional properties dictate modular divisibility rules.`;
      steps = [`$10 \\equiv 1 \\pmod 9$ and $10 \\equiv 1 \\pmod 3$ leads to digit sum test; $100 \\equiv 0 \\pmod 4$ leads to last two digits test.`];
      conclusion = `${correctAnswer}.`;
      hint = `Recall the classic divisibility rule for this integer.`;
    }
  } else if (stageId === 95) {
    // Advanced Combinatorics: 10 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic;

    if (subtopicIndex === 0) {
      // Combinations nCr
      const n = prng.pick([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      const nCr = (n * (n - 1)) / 2;
      questionText = `How many distinct $2$-person subcommittees can be formed from an active committee of $${n}$ members? (Evaluate $\\binom{${n}}{2}$)`;
      correctAnswer = `$${nCr}$`;
      const dist = generateNumericalDistractors(nCr, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$n = ${n}, r = 2$.`;
      required = `$\\binom{${n}}{2}$.`;
      method = `$\\binom{n}{2} = \\frac{n(n - 1)}{2} = \\frac{${n}(${n - 1})}{2} = ${nCr}$.`;
      steps = [`$\\frac{${n} \\times ${n - 1}}{2} = ${nCr}$.`];
      conclusion = `There are $${nCr}$ distinct subcommittees.`;
      hint = `Order does not matter: use combinations $\\binom{n}{2} = \\frac{n(n-1)}{2}$.`;
    } else if (subtopicIndex === 1) {
      // Circular Permutations (n-1)!
      const n = prng.pick([4, 5, 6, 7, 8]);
      let fact = 1;
      for (let i = 1; i <= n - 1; i++) fact *= i;
      questionText = `In how many distinct arrangements can $${n}$ diplomats be seated around a circular conference table (where rotational shifts are considered identical)?`;
      correctAnswer = `$${fact}$`;
      const dist = generateNumericalDistractors(fact, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$${n}$ diplomats around a circular table.`;
      required = `Circular permutations $(n - 1)!$.`;
      method = `Circular permutation formula: $P_{\\text{circ}} = (n - 1)! = (${n} - 1)! = ${fact}$.`;
      steps = [`$(${n} - 1)! = ${fact}$.`];
      conclusion = `There are $${fact}$ ways.`;
      hint = `Fix one person's position to eliminate rotational symmetry: $(n - 1)!$.`;
    } else if (subtopicIndex === 2) {
      // Stars and Bars / partitions
      const k = prng.pick([3, 4, 5, 6, 7, 8, 9]);
      const solCount = ((k + 2) * (k + 1)) / 2; // C(k + 3 - 1, 3 - 1) = C(k + 2, 2)
      questionText = `Using Stars and Bars, how many non-negative integer solutions exist for the equation: $$x_1 + x_2 + x_3 = ${k} \\quad (x_i \\ge 0)$$`;
      correctAnswer = `$${solCount}$`;
      const dist = generateNumericalDistractors(solCount, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Equation $x_1 + x_2 + x_3 = ${k}$ with $x_i \\in \\mathbb{N}_0$.`;
      required = `Number of non-negative solutions.`;
      method = `Stars and bars formula for non-negative integers: $\\binom{n + k - 1}{k - 1} = \\binom{${k} + 3 - 1}{3 - 1} = \\binom{${k + 2}}{2} = ${solCount}$.`;
      steps = [
        `$\\binom{${k} + 2}{2} = \\frac{${k + 2} \\times ${k + 1}}{2} = ${solCount}$.`,
      ];
      conclusion = `There are $${solCount}$ solutions.`;
      hint = `Use the Stars and Bars formula $\\binom{n + k - 1}{k - 1}$.`;
    } else if (subtopicIndex === 3) {
      // Pigeonhole Principle
      const colors = prng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const minSocks = colors + 1;
      questionText = `According to the Pigeonhole Principle, what is the minimum number of socks that must be drawn from a drawer containing $${colors}$ distinct sock colors to guarantee at least one matching pair?`;
      correctAnswer = `$${minSocks}\\text{ socks}$`;
      rawDistractors = [`$${colors}\\text{ socks}$`, `$${minSocks + 2}\\text{ socks}$`, `$${2 * colors}\\text{ socks}$`];
      given = `$${colors}$ sock colors (pigeonholes $= ${colors}$).`;
      required = `Minimum draws to guarantee matching pair.`;
      method = `With $k = ${colors}$ colors, drawing $k + 1 = ${minSocks}$ items guarantees at least two items of the same color by the Pigeonhole Principle.`;
      steps = [`$k + 1 = ${colors} + 1 = ${minSocks}$.`];
      conclusion = `Must draw at least $${minSocks}$ socks.`;
      hint = `If there are $${colors}$ colors, drawing $${minSocks}$ items guarantees at least two share a color.`;
    } else if (subtopicIndex === 4) {
      // Permutations with repetition (palindromic / anagram words)
      const wordList = [
        { word: 'LEVEL', ans: 30, formula: '\\frac{5!}{2! \\times 2!} = 30' },
        { word: 'RADAR', ans: 30, formula: '\\frac{5!}{2! \\times 2!} = 30' },
        { word: 'KAYAK', ans: 30, formula: '\\frac{5!}{2! \\times 2!} = 30' },
        { word: 'DEED', ans: 6, formula: '\\frac{4!}{2! \\times 2!} = 6' },
        { word: 'NOON', ans: 6, formula: '\\frac{4!}{2! \\times 2!} = 6' },
        { word: 'REFER', ans: 30, formula: '\\frac{5!}{2! \\times 2!} = 30' },
        { word: 'BANANA', ans: 60, formula: '\\frac{6!}{3! \\times 2!} = 60' },
        { word: 'SUCCESS', ans: 420, formula: '\\frac{7!}{3! \\times 2!} = 420' },
        { word: 'CHEESE', ans: 120, formula: '\\frac{6!}{3!} = 120' },
        { word: 'ALGEBRA', ans: 2520, formula: '\\frac{7!}{2!} = 2520' },
      ];
      const w = prng.pick(wordList);
      questionText = `How many distinct anagrams (arrangements) can be formed using all the letters of the word "${w.word}"?`;
      correctAnswer = `$${w.ans}$`;
      const dist = generateNumericalDistractors(w.ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Word "${w.word}".`;
      required = `Distinct permutations.`;
      method = `Multinomial coefficient formula: $${w.formula}$.`;
      steps = [`Formula: $${w.formula}$.`];
      conclusion = `There are $${w.ans}$ distinct arrangements.`;
      hint = `Divide total letter factorial by the factorials of repeated letters.`;
    } else if (subtopicIndex === 5) {
      // Permutations P(n, 2)
      const n = prng.pick([5, 6, 7, 8, 9, 10]);
      const pAns = n * (n - 1);
      questionText = `In a competitive race of $${n}$ sprinters, in how many distinct ways can the Gold and Silver medals be awarded? (Evaluate $P(${n}, 2)$)`;
      correctAnswer = `$${pAns}$`;
      const dist = generateNumericalDistractors(pAns, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$n = ${n}, r = 2$ ordered selections.`;
      required = `$P(${n}, 2)$.`;
      method = `Permutation formula: $P(n, r) = \\frac{n!}{(n - r)!} = ${n} \\times ${n - 1} = ${pAns}$.`;
      steps = [`$${n} \\times ${n - 1} = ${pAns}$.`];
      conclusion = `There are $${pAns}$ distinct medal award outcomes.`;
      hint = `Order matters for medals: calculate $n \\times (n - 1)$.`;
    } else if (subtopicIndex === 6) {
      // Combinations nC3
      const n = prng.pick([5, 6, 7, 8, 9, 10]);
      const c3Ans = (n * (n - 1) * (n - 2)) / 6;
      questionText = `How many different $3$-person project teams can be chosen from a group of $${n}$ candidates? (Evaluate $\\binom{${n}}{3}$)`;
      correctAnswer = `$${c3Ans}$`;
      const dist = generateNumericalDistractors(c3Ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$n = ${n}, r = 3$.`;
      required = `$\\binom{${n}}{3}$.`;
      method = `$\\binom{n}{3} = \\frac{n(n - 1)(n - 2)}{3!} = \\frac{${n} \\times ${n - 1} \\times ${n - 2}}{6} = ${c3Ans}$.`;
      steps = [`$\\frac{${n} \\times ${n - 1} \\times ${n - 2}}{6} = ${c3Ans}$.`];
      conclusion = `There are $${c3Ans}$ possible teams.`;
      hint = `Calculate $\\frac{n(n-1)(n-2)}{3!}$.`;
    } else if (subtopicIndex === 7) {
      // Handshake Problem
      const n = prng.pick([6, 8, 10, 12, 14, 16, 20]);
      const handshakes = (n * (n - 1)) / 2;
      questionText = `At a networking summit with $${n}$ delegates, every person shakes hands with every other person exactly once. How many total handshakes occur?`;
      correctAnswer = `$${handshakes}$`;
      const dist = generateNumericalDistractors(handshakes, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$${n}$ delegates shaking hands pairwise.`;
      required = `Total handshakes.`;
      method = `Each handshake is a pair of delegates: $\\binom{${n}}{2} = \\frac{${n}(${n - 1})}{2} = ${handshakes}$.`;
      steps = [`$\\frac{${n} \\times ${n - 1}}{2} = ${handshakes}$.`];
      conclusion = `There are $${handshakes}$ handshakes.`;
      hint = `Every pair shakes hands once: use the combination formula $\\binom{n}{2}$.`;
    } else if (subtopicIndex === 8) {
      // Derangements formula D_n
      const derange = prng.pick([
        { n: 3, ans: 2, desc: '!3 = 3!(1 - 1/1! + 1/2! - 1/3!) = 6(1/2 - 1/6) = 2' },
        { n: 4, ans: 9, desc: '!4 = 24(1/2 - 1/6 + 1/24) = 12 - 4 + 1 = 9' },
        { n: 5, ans: 44, desc: '!5 = 120(1/2 - 1/6 + 1/24 - 1/120) = 60 - 20 + 5 - 1 = 44' },
      ]);
      questionText = `What is the number of derangements (permutations where no element appears in its original position) of a set of $${derange.n}$ distinct items (denoted $!${derange.n}$)?`;
      correctAnswer = `$${derange.ans}$`;
      const dist = generateNumericalDistractors(derange.ans, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `Set of $${derange.n}$ elements.`;
      required = `Derangements $!${derange.n}$.`;
      method = `Derangement formula: $!n = n! \\sum_{k=0}^n \\frac{(-1)^k}{k!}$.`;
      steps = [`$!${derange.n} = ${derange.desc}$.`];
      conclusion = `There are $${derange.ans}$ derangements.`;
      hint = `Recall the derangement values: !3 = 2, !4 = 9, !5 = 44.`;
    } else {
      // Pascal's Identity
      const n = prng.pick([6, 7, 8, 9]);
      const k = prng.pick([2, 3, 4]);
      questionText = `According to Pascal's Identity, which single combination expression is strictly equal to: $$^{${n}}\\text{C}_{${k}} + ^{${n}}\\text{C}_{${k + 1}}$$`;
      correctAnswer = `$^{${n + 1}}\\text{C}_{${k + 1}}$`;
      rawDistractors = [
        `$^{${n}}\\text{C}_{${k + 2}}$`,
        `$^{${n + 1}}\\text{C}_{${k}}$`,
        `$^{${n + 2}}\\text{C}_{${k + 1}}$`,
      ];
      given = `Sum of combinations $^{${n}}\\text{C}_{${k}} + ^{${n}}\\text{C}_{${k + 1}}$.`;
      required = `Single simplified combination term.`;
      method = `Pascal's Identity states: $^{n}\\text{C}_{k} + ^{n}\\text{C}_{k+1} = ^{n+1}\\text{C}_{k+1}$.`;
      steps = [`$^{${n}}\\text{C}_{${k}} + ^{${n}}\\text{C}_{${k + 1}} = ^{${n + 1}}\\text{C}_{${k + 1}}$.`];
      conclusion = `The equivalent expression is $^{${n + 1}}\\text{C}_{${k + 1}}$.`;
      hint = `Pascal's Identity: $^{n}\\text{C}_{k} + ^{n}\\text{C}_{k+1} = ^{n+1}\\text{C}_{k+1}$. Add $1$ to the top index and take the greater bottom index.`;
    }
  } else if (stageId === 96) {
    // Mathematical Modelling (Exponential Growth & Decay): 5 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // Doubling culture
      const initialPop = prng.pick([50, 80, 100, 150, 200]);
      const doublingHours = prng.pick([2, 3, 4]);
      const periods = 3;
      const totalHours = doublingHours * periods;
      const finalPop = initialPop * 8;
      questionText = `A bacterial colony doubles every $${doublingHours}$ hours. If the initial count is $N_0 = ${initialPop}$, what is the population after $${totalHours}$ hours?`;
      correctAnswer = `$${finalPop}$`;
      const dist = generateNumericalDistractors(finalPop, prng);
      rawDistractors = dist.map(d => `$${d}$`);
      given = `$N_0 = ${initialPop}$, doubling period $= ${doublingHours}\\text{ h}$, total time $= ${totalHours}\\text{ h}$.`;
      required = `Final population.`;
      method = `Number of doubling cycles $k = \\frac{${totalHours}}{${doublingHours}} = 3$. $N = ${initialPop} \\times 2^3 = ${finalPop}$.`;
      steps = [`$N = ${initialPop} \\times 8 = ${finalPop}$.`];
      conclusion = `The population is $${finalPop}$.`;
      hint = `Calculate the number of doubling periods, then multiply initial population by $2^k$.`;
    } else if (subtopicIndex === 1) {
      // Radioactive Half-life decay
      const initialMass = prng.pick([80, 120, 160, 200, 240]);
      const halfLifeDays = prng.pick([4, 5, 8, 10]);
      const totalDays = halfLifeDays * 2;
      const finalMass = initialMass / 4;
      questionText = `A radioactive isotope has a half-life of $${halfLifeDays}$ days. If a sample initially contains $${initialMass}\\text{ g}$, how much remains after $${totalDays}$ days?`;
      correctAnswer = `$${finalMass}\\text{ g}$`;
      rawDistractors = [`$${initialMass / 2}\\text{ g}$`, `$${finalMass + 5}\\text{ g}$`, `$${Math.max(2, finalMass - 5)}\\text{ g}$`];
      given = `Initial mass $M_0 = ${initialMass}\\text{ g}$, half-life $= ${halfLifeDays}\\text{ d}$, elapsed time $= ${totalDays}\\text{ d}$.`;
      required = `Remaining mass.`;
      method = `Number of half-lives is $\\frac{${totalDays}}{${halfLifeDays}} = 2$. Remaining mass $= ${initialMass} \\times \\left(\\frac{1}{2}\\right)^2 = \\frac{${initialMass}}{4} = ${finalMass}\\text{ g}$.`;
      steps = [`$M = ${initialMass} \\times \\frac{1}{4} = ${finalMass}\\text{ g}$.`];
      conclusion = `$${finalMass}\\text{ g}$ remains.`;
      hint = `Two half-lives mean the mass is halved twice (divided by 4).`;
    } else if (subtopicIndex === 2) {
      // Continuous compound growth formula or balance
      const mode = prng.pick(['balance', 'definition']);
      if (mode === 'balance') {
        const p = prng.pick([1000, 2000, 3000, 5000]);
        const rPct = prng.pick([4, 5, 6, 8]);
        const t = prng.pick([2, 3, 5]);
        const rDec = (rPct * t) / 100;
        questionText = `An investment of $\\text{\\$} ${p}$ grows continuously at an annual interest rate of $${rPct}\\%$. Express the total account balance after $${t}$ years:`;
        correctAnswer = `$${p}e^{${rDec}}$`;
        rawDistractors = [
          `$${p}(1 + ${rPct / 100})^{${t}}$`,
          `$${p}e^{${rPct * t}}$`,
          `$${p}(${rPct * t})$`,
        ];
        given = `Principal $P = \\text{\\$} ${p}$, rate $r = ${rPct}\\% = ${rPct / 100}$, time $t = ${t}\\text{ years}$.`;
        required = `Continuous growth balance.`;
        method = `Continuous compounding formula: $A(t) = P e^{rt} = ${p} e^{(${rPct / 100})(${t})} = ${p} e^{${rDec}}$.`;
        steps = [`$A = ${p} e^{${rDec}}$.`];
        conclusion = `$${p}e^{${rDec}}$.`;
        hint = `Apply $A(t) = P e^{rt}$ with decimal rate $r$.`;
      } else {
        const baseModels = [
          { name: 'Euler\'s number $e$', approx: '2.71828', symbol: 'e' },
          { name: 'Natural exponential base $e$', approx: '2.71828', symbol: 'e' },
        ];
        const bm = prng.pick(baseModels);
        questionText = `In continuous exponential compounding modeled by $A(t) = P ${bm.symbol}^{rt}$, what does the mathematical constant $${bm.symbol}$ represent?`;
        correctAnswer = `$\\text{Euler's number (base of natural logarithm } \\approx ${bm.approx}\\text{)}$`;
        rawDistractors = [
          `$\\text{The annual percentage interest rate}$`,
          `$\\text{The elapsed time in years}$`,
          `$\\text{The principal capital investment}$`,
        ];
        given = `Continuous compound formula $A(t) = P ${bm.symbol}^{rt}$.`;
        required = `Definition of constant $${bm.symbol}$.`;
        method = `In calculus and modeling, $e = \\lim_{n\\to\\infty} (1 + 1/n)^n \\approx 2.71828$ is Euler's number.`;
        steps = [`$e \\approx 2.71828$ is Euler's mathematical constant.`];
        conclusion = `Euler's number $\\approx 2.71828$.`;
        hint = `The letter $e$ in exponential models stands for Euler's constant $\\approx 2.718$.`;
      }
    } else if (subtopicIndex === 3) {
      // Newton's law of cooling concept with variable ambient temp
      const tEnv = prng.pick([18, 20, 22, 25]);
      questionText = `According to Newton's Law of Cooling in an ambient room at $${tEnv}^\\circ\\text{C}$, the rate of temperature change of an object $\\frac{dT}{dt}$ is directly proportional to:`;
      correctAnswer = `$(T - ${tEnv}^\\circ\\text{C})$`;
      rawDistractors = [
        `$(T + ${tEnv}^\\circ\\text{C})$`,
        `$T^2$`,
        `$\\frac{1}{T - ${tEnv}^\\circ\\text{C}}$`,
      ];
      given = `Newton's Law with ambient temperature $T_{\\text{env}} = ${tEnv}^\\circ\\text{C}$.`;
      required = `Proportional temperature differential.`;
      method = `$\\frac{dT}{dt} = -k(T - T_{\\text{env}}) = -k(T - ${tEnv})$.`;
      steps = [`Rate is proportional to $(T - ${tEnv})$.`];
      conclusion = `Proportional to $(T - ${tEnv}^\\circ\\text{C})$.`;
      hint = `Rate of cooling is proportional to the difference between object temperature $T$ and room temperature.`;
    } else {
      // Logistic growth carrying capacity
      const L = prng.pick([400, 500, 600, 800, 1000, 1200, 1500, 2000, 2500]);
      questionText = `In the logistic growth model $P(t) = \\frac{${L}}{1 + 9e^{-0.5t}}$, what is the limiting carrying capacity of the environment as $t \\to \\infty$?`;
      correctAnswer = `$${L}$`;
      rawDistractors = [`$${L / 10}$`, `$${L * 2}$`, `$9$`];
      given = `Logistic function $P(t) = \\frac{${L}}{1 + 9e^{-0.5t}}$.`;
      required = `Carrying capacity (asymptotic maximum).`;
      method = `As $t \\to \\infty$, $e^{-0.5t} \\to 0$, so $\\lim_{t\\to\\infty} P(t) = \\frac{${L}}{1 + 0} = ${L}$.`;
      steps = [
        `$e^{-0.5t} \\to 0$ as $t \\to \\infty$.`,
        `$P(\\infty) = \\frac{${L}}{1 + 0} = ${L}$.`,
      ];
      conclusion = `Carrying capacity is $${L}$.`;
      hint = `As $t$ becomes very large, the exponential decay term in the denominator approaches 0.`;
    }
  } else if (stageId === 97 || stageId === 98 || stageId === 99) {
    // Competition & Extreme Math: 5 diverse archetypes fully parameterized
    const subtopicIndex = effectiveSubtopic % 5;

    if (subtopicIndex === 0) {
      // AM-GM Inequality minimum of x + k^2/x
      const k = prng.pick([2, 3, 4, 5, 6]);
      const ksq = k * k;
      const minVal = 2 * k;
      questionText = `For positive real numbers $x > 0$, by the AM-GM Inequality, what is the minimum possible value of: $$f(x) = x + \\frac{${ksq}}{x}$$`;
      correctAnswer = `$${minVal}$`;
      rawDistractors = [`$${ksq}$`, `$${k}$`, `$${minVal + 2}$`];
      given = `Function $f(x) = x + \\frac{${ksq}}{x}$ for $x > 0$.`;
      required = `Minimum value via AM-GM.`;
      method = `By AM-GM: $\\frac{x + \\frac{${ksq}}{x}}{2} \\ge \\sqrt{x \\cdot \\frac{${ksq}}{x}} = \\sqrt{${ksq}} = ${k} \\implies x + \\frac{${ksq}}{x} \\ge ${minVal}$.`;
      steps = [`$x + \\frac{${ksq}}{x} \\ge 2\\sqrt{${ksq}} = ${minVal}$. Equality holds when $x = ${k}$.`];
      conclusion = `Minimum value is $${minVal}$.`;
      hint = `Apply AM-GM: $a + b \\ge 2\\sqrt{ab}$.`;
    } else if (subtopicIndex === 1) {
      // Cauchy-Schwarz Inequality
      const letters = prng.pick([
        { a: 'a', b: 'b', x: 'x', y: 'y' },
        { a: 'u_1', b: 'u_2', x: 'v_1', y: 'v_2' },
      ]);
      questionText = `By the Cauchy-Schwarz Inequality, for any real numbers $${letters.a}, ${letters.b}, ${letters.x}, ${letters.y}$, what lower bound is placed on $(${letters.a}^2 + ${letters.b}^2)(${letters.x}^2 + ${letters.y}^2)$?`;
      correctAnswer = `$(${letters.a}${letters.x} + ${letters.b}${letters.y})^2$`;
      rawDistractors = [
        `$${letters.a}${letters.x} + ${letters.b}${letters.y}$`,
        `$2(${letters.a}${letters.x} + ${letters.b}${letters.y})$`,
        `$${letters.a}^2 ${letters.x}^2 + ${letters.b}^2 ${letters.y}^2$`,
      ];
      given = `Cauchy-Schwarz Inequality for $2$-dimensional vectors.`;
      required = `Bound expression.`;
      method = `Cauchy-Schwarz states $(\\vec{u} \\cdot \\vec{v})^2 \\le ||\\vec{u}||^2 ||\\vec{v}||^2$.`;
      steps = [`$(${letters.a}^2 + ${letters.b}^2)(${letters.x}^2 + ${letters.y}^2) \\ge (${letters.a}${letters.x} + ${letters.b}${letters.y})^2$.`];
      conclusion = `Bound is $(${letters.a}${letters.x} + ${letters.b}${letters.y})^2$.`;
      hint = `Cauchy-Schwarz states $(\\vec{u}\\cdot\\vec{v})^2 \\le ||\\vec{u}||^2 ||\\vec{v}||^2$.`;
    } else if (subtopicIndex === 2) {
      // Functional equation: f(x + y) = f(x) + f(y)
      const c = prng.pick([2, 3, 4, 5]);
      const m = prng.pick([3, 4, 5, 6, 7]);
      const ans = c * m;
      questionText = `If a continuous function satisfies Cauchy's functional equation $f(x + y) = f(x) + f(y)$ for all real numbers and $f(1) = ${c}$, what is $f(${m})$?`;
      correctAnswer = `$${ans}$`;
      rawDistractors = [`$${c + m}$`, `$${Math.pow(c, m)}$`, `$${ans + 2}$`];
      given = `Continuous $f(x+y) = f(x)+f(y)$, $f(1) = ${c}$.`;
      required = `Value of $f(${m})$.`;
      method = `Continuous solutions to Cauchy's additive equation are linear: $f(x) = cx$. Since $f(1) = ${c}$, $f(x) = ${c}x$. Thus $f(${m}) = ${c}(${m}) = ${ans}$.`;
      steps = [
        `$f(x) = cx \\implies f(1) = c = ${c}$.`,
        `$f(${m}) = ${c} \\times ${m} = ${ans}$.`,
      ];
      conclusion = `$f(${m}) = ${ans}$.`;
      hint = `Continuous additive functions are linear ($f(x) = cx$).`;
    } else if (subtopicIndex === 3) {
      // Parity invariant
      const kOdd = prng.pick([3, 5, 7]);
      questionText = `If $${kOdd}$ odd integers are added together, what is the parity of their sum?`;
      correctAnswer = `$\\text{Strictly Odd}$`;
      rawDistractors = [
        `$\\text{Strictly Even}$`,
        `$\\text{Even if positive, odd if negative}$`,
        `$\\text{Depends on the specific integers}$`,
      ];
      given = `Sum of $${kOdd}$ odd integers.`;
      required = `Parity of sum.`;
      method = `The sum of an odd number ($${kOdd}$) of odd integers is always odd, because $(2k_1 + 1) + \\dots + (2k_{${kOdd}} + 1) = 2\\sum k_i + ${kOdd}$ is odd.`;
      steps = [`An odd number of odd terms always sums to an odd number.`];
      conclusion = `The sum is strictly odd.`;
      hint = `Adding an odd count of odd numbers yields an odd sum.`;
    } else {
      // Triangle inequality in competitive math
      const mode = prng.pick(['bound_max', 'bound_min', 'identity']);
      if (mode === 'bound_max') {
        const m1 = prng.int(3, 8);
        const m2 = prng.int(4, 9);
        const maxVal = m1 + m2;
        questionText = `If complex numbers $z_1$ and $z_2$ have moduli $|z_1| = ${m1}$ and $|z_2| = ${m2}$, what is the maximum possible value of $|z_1 + z_2|$?`;
        correctAnswer = `$${maxVal}$`;
        rawDistractors = [`$${Math.abs(m1 - m2)}$`, `$${m1 * m2}$`, `$${Math.round(Math.sqrt(m1 * m1 + m2 * m2))}$`];
        given = `$|z_1| = ${m1}, |z_2| = ${m2}$.`;
        required = `Maximum $|z_1 + z_2|$.`;
        method = `By the Triangle Inequality: $|z_1 + z_2| \\le |z_1| + |z_2| = ${m1} + ${m2} = ${maxVal}$.`;
        steps = [`$|z_1 + z_2| \\le ${m1} + ${m2} = ${maxVal}$.`];
        conclusion = `The maximum value is $${maxVal}$.`;
        hint = `By the triangle inequality, the maximum of $|z_1 + z_2|$ is the sum of their individual magnitudes.`;
      } else if (mode === 'bound_min') {
        const m1 = prng.int(7, 12);
        const m2 = prng.int(2, 6);
        const minVal = m1 - m2;
        questionText = `If complex numbers $z_1$ and $z_2$ have moduli $|z_1| = ${m1}$ and $|z_2| = ${m2}$, what is the minimum possible value of $|z_1 - z_2|$?`;
        correctAnswer = `$${minVal}$`;
        rawDistractors = [`$${m1 + m2}$`, `$0$`, `$${Math.round(Math.sqrt(m1 * m1 + m2 * m2))}$`];
        given = `$|z_1| = ${m1}, |z_2| = ${m2}$.`;
        required = `Minimum $|z_1 - z_2|$.`;
        method = `By the Reverse Triangle Inequality: $|z_1 - z_2| \\ge ||z_1| - |z_2|| = |${m1} - ${m2}| = ${minVal}$.`;
        steps = [`$|z_1 - z_2| \\ge ${m1} - ${m2} = ${minVal}$.`];
        conclusion = `The minimum value is $${minVal}$.`;
        hint = `Use the reverse triangle inequality: $|z_1 - z_2| \\ge ||z_1| - |z_2||$.`;
      } else {
        questionText = `Which inequality holds for all complex numbers $z_1, z_2$ by the Triangle Inequality?`;
        correctAnswer = `$|z_1 + z_2| \\le |z_1| + |z_2|$`;
        rawDistractors = [
          `$|z_1 + z_2| = |z_1| + |z_2|$`,
          `$|z_1 + z_2| \\ge |z_1| + |z_2|$`,
          `$|z_1 + z_2| \\le |z_1| \\cdot |z_2|$`,
        ];
        given = `Complex numbers $z_1, z_2$.`;
        required = `Triangle inequality statement.`;
        method = `The length of any side of a triangle cannot exceed the sum of the lengths of the other two sides: $|z_1 + z_2| \\le |z_1| + |z_2|$.`;
        steps = [`$|z_1 + z_2| \\le |z_1| + |z_2|$.`];
        conclusion = `$|z_1 + z_2| \\le |z_1| + |z_2|$.`;
        hint = `The direct path between two points is always shorter than or equal to any detour.`;
      }
    }
  } else {
    // STAGE 100: MATHEMATICAL MASTERY (The Pinnacle Challenge)
    // 12 Master Puzzles parameterized with PRNG so each block has fresh, unique questions!
    const subtopicIndex = effectiveSubtopic % 12;
    if (subtopicIndex === 0) {
      // Euler's identity variants
      const v = prng.pick([
        { q: "If $e^{i\\pi} + 1 = 0$, what is the exact value of $\\ln(-1)$ in the principal branch of complex logarithms?", ans: "$i\\pi$", dist: ["$0$", "$-1$", "$\\pi$"], exp: "\\ln(-1) = i\\pi" },
        { q: "Evaluate $e^{i\\pi/2}$ using Euler's formula $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$:", ans: "$i$", dist: ["$-i$", "$1$", "$-1$"], exp: "\\cos(\\pi/2) + i\\sin(\\pi/2) = i" },
        { q: "Evaluate $e^{i 2\\pi}$ using Euler's formula:", ans: "$1$", dist: ["$-1$", "$0$", "$i$"], exp: "\\cos(2\\pi) + i\\sin(2\\pi) = 1" },
        { q: "What is the principal value of $\\ln(i)$?", ans: "$\\frac{i\\pi}{2}$", dist: ["$i\\pi$", "$-\\frac{i\\pi}{2}$", "$1$"], exp: "\\ln(i) = \\frac{i\\pi}{2}" }
      ]);
      questionText = v.q;
      correctAnswer = v.ans;
      rawDistractors = v.dist;
      method = `Euler's formula: ${v.exp}.`;
      steps = [`${v.exp}.`];
    } else if (subtopicIndex === 1) {
      // Infinite geometric series
      const a = prng.pick([1, 2, 3, 4, 6, 8, 9]);
      const rChoice = prng.pick([
        { rNum: 0.5, rStr: "\\frac{1}{2}" },
        { rNum: 2/3, rStr: "\\frac{2}{3}" },
        { rNum: 1/3, rStr: "\\frac{1}{3}" },
        { rNum: 3/4, rStr: "\\frac{3}{4}" },
      ]);
      const S = Math.round(a / (1 - rChoice.rNum));
      questionText = `Find the sum of the infinite geometric series: $$\\sum_{n=0}^{\\infty} ${a} \\left(${rChoice.rStr}\\right)^n$$`;
      correctAnswer = `$${S}$`;
      rawDistractors = generateNumericalDistractors(S, prng).map(d => `$${d}$`);
      method = `Formula $S = \\frac{a}{1 - r} = \\frac{${a}}{1 - ${rChoice.rStr}} = ${S}$.`;
      steps = [`$S = \\frac{${a}}{1 - ${rChoice.rStr}} = ${S}$.`];
    } else if (subtopicIndex === 2) {
      // Area between curves y = kx and y = x^2
      const k = prng.pick([1, 2, 3, 4]);
      const num = k * k * k;
      const g = gcd(num, 6);
      const fracStr = (6 / g === 1) ? `${num / g}` : `\\frac{${num / g}}{${6 / g}}`;
      questionText = `What is the area of the region enclosed between the curves $y = x^2$ and $y = ${k === 1 ? 'x' : `${k}x`}$?`;
      correctAnswer = `$${fracStr}$`;
      rawDistractors = [`$${k}$`, `$${k * k}$`, `$\\frac{${k}}{2}$`];
      method = `Area $= \\int_0^{${k}} (${k === 1 ? 'x' : `${k}x`} - x^2) dx = \\left[ \\frac{${k}x^2}{2} - \\frac{x^3}{3} \\right]_0^{${k}} = ${fracStr}$.`;
      steps = [`$\\int_0^{${k}} (${k === 1 ? 'x' : `${k}x`} - x^2) dx = ${fracStr}$.`];
    } else if (subtopicIndex === 3) {
      // Divisors count
      const numOptions = [
        { n: 120, fact: '2^3 \\times 3^1 \\times 5^1', d: 16 },
        { n: 180, fact: '2^2 \\times 3^2 \\times 5^1', d: 18 },
        { n: 240, fact: '2^4 \\times 3^1 \\times 5^1', d: 20 },
        { n: 360, fact: '2^3 \\times 3^2 \\times 5^1', d: 24 },
        { n: 480, fact: '2^5 \\times 3^1 \\times 5^1', d: 24 },
        { n: 600, fact: '2^3 \\times 3^1 \\times 5^2', d: 24 },
        { n: 720, fact: '2^4 \\times 3^2 \\times 5^1', d: 30 },
      ];
      const ch = prng.pick(numOptions);
      questionText = `Determine the number of positive integer divisors of $${ch.n}$.`;
      correctAnswer = `$${ch.d}$`;
      rawDistractors = [`$${ch.d - 4}$`, `$${ch.d + 6}$`, `$${ch.d + 12}$`];
      method = `Prime factorization $${ch.n} = ${ch.fact}$. Divisor formula gives $${ch.d}$.`;
      steps = [`$d(${ch.n}) = ${ch.d}$.`];
    } else if (subtopicIndex === 4) {
      // Definite integral using symmetry
      const k = prng.pick([3, 5]);
      questionText = `Evaluate the definite integral using symmetry: $$\\int_{-\\pi}^{\\pi} \\sin^{${k}}(x) \\, dx$$`;
      correctAnswer = `$0$`;
      rawDistractors = [`$2$`, `$\\pi$`, `$-1$`];
      method = `The integrand $\\sin^{${k}}(x)$ is an odd function. The integral of any odd function over $[-a, a]$ is identically $0$.`;
      steps = [`$\\int_{-\\pi}^\\pi \\sin^{${k}}(x) dx = 0$.`];
    } else if (subtopicIndex === 5) {
      // Remainder modular exponentiation
      const b = prng.pick([2, 3]);
      const mod = prng.pick([3, 5, 7]);
      const exp = prng.pick([50, 100, 200]);
      let rem = 1;
      let cur = b % mod;
      let e = exp;
      while (e > 0) {
        if (e % 2 === 1) rem = (rem * cur) % mod;
        cur = (cur * cur) % mod;
        e = Math.floor(e / 2);
      }
      questionText = `What is the remainder when $${b}^{${exp}}$ is divided by $${mod}$?`;
      correctAnswer = `$${rem}$`;
      rawDistractors = [0, 1, 2, 3, 4].filter(x => x !== rem && x < mod).slice(0, 3).map(x => `$${x}$`);
      method = `Compute $${b}^{${exp}} \\pmod{${mod}}$ using modular arithmetic: remainder is $${rem}$.`;
      steps = [`$${b}^{${exp}} \\equiv ${rem} \\pmod{${mod}}$.`];
    } else if (subtopicIndex === 6) {
      // Logarithmic equation
      const base = prng.pick([2, 3]);
      const sumVal = prng.pick([3, 6, 9]);
      const ansX = Math.pow(base, Math.round(sumVal * 2 / 3));
      questionText = `Solve for the real value of $x$ satisfying: $$\\log_{${base}}(x) + \\log_{${base * base}}(x) = ${sumVal}$$`;
      correctAnswer = `$x = ${ansX}$`;
      rawDistractors = [`$x = ${ansX * base}$`, `$x = ${Math.max(1, Math.round(ansX / base))}$`, `$x = ${ansX + 2}$`];
      method = `Change base: $\\log_{${base*base}}(x) = \\frac{1}{2}\\log_{${base}}(x)$. $\\frac{3}{2}\\log_{${base}}(x) = ${sumVal} \\implies \\log_{${base}}(x) = ${sumVal * 2 / 3} \\implies x = ${ansX}$.`;
      steps = [`$x = ${ansX}$.`];
    } else if (subtopicIndex === 7) {
      // Vieta's formulas
      const r1 = prng.int(1, 3);
      const r2 = prng.int(2, 4);
      const r3 = prng.int(3, 5);
      const sumRoots = r1 + r2 + r3;
      const bCoeff = -sumRoots;
      questionText = `By Vieta's formulas, find the sum of all roots of the cubic equation: $$x^3 ${bCoeff < 0 ? `- ${Math.abs(bCoeff)}` : `+ ${bCoeff}`}x^2 + 14x - 8 = 0$$`;
      correctAnswer = `$${sumRoots}$`;
      rawDistractors = [`$${-sumRoots}$`, `$${sumRoots + 2}$`, `$${Math.max(1, sumRoots - 3)}$`];
      method = `Vieta's formula: sum of roots $= -\\frac{b}{a} = -(${bCoeff}) = ${sumRoots}$.`;
      steps = [`$r_1 + r_2 + r_3 = ${sumRoots}$.`];
    } else if (subtopicIndex === 8) {
      // Determinant
      const a = prng.int(2, 6);
      const d = prng.int(2, 6);
      const b = prng.int(1, 5);
      const c = prng.int(1, 5);
      const det = a * d - b * c;
      questionText = `Find the value of the $2 \\times 2$ determinant: $$\\begin{vmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{vmatrix}$$`;
      correctAnswer = `$${det}$`;
      rawDistractors = generateNumericalDistractors(det, prng).map(x => `$${x}$`);
      method = `$ad - bc = (${a} \\times ${d}) - (${b} \\times ${c}) = ${det}$.`;
      steps = [`$(${a} \\times ${d}) - (${b} \\times ${c}) = ${det}$.`];
    } else if (subtopicIndex === 9) {
      // Gaussian integral variation
      const k = prng.pick([1, 4, 9, 16]);
      const sqrtK = Math.sqrt(k);
      questionText = `What is the exact value of the Gaussian probability integral: $$\\int_{-\\infty}^{\\infty} e^{-${k === 1 ? '' : k}x^2} \\, dx$$`;
      correctAnswer = k === 1 ? `$\\sqrt{\\pi}$` : `$\\frac{\\sqrt{\\pi}}{${sqrtK}}$`;
      rawDistractors = [`$\\pi$`, `$1$`, `$\\frac{\\pi}{${sqrtK}}$`];
      method = `$\\int_{-\\infty}^\\infty e^{-k x^2} dx = \\sqrt{\\frac{\\pi}{k}} = ${correctAnswer.slice(1, -1)}$.`;
      steps = [`$\\int_{-\\infty}^\\infty e^{-${k}x^2} dx = ${correctAnswer.slice(1, -1)}$.`];
    } else if (subtopicIndex === 10) {
      // Logarithmic differentiation variants
      const v = prng.pick([
        { func: 'x^x', at: 'x = 1', ans: '$1$', dist: ['$0$', '$e$', '$2$'], steps: '\\frac{d}{dx}[x^x] = x^x(\\ln x + 1). \\text{ At } x=1: 1^1(0 + 1) = 1.' },
        { func: 'x^{2x}', at: 'x = 1', ans: '$2$', dist: ['$1$', '$e^2$', '$4$'], steps: '\\frac{d}{dx}[x^{2x}] = x^{2x}(2\\ln x + 2). \\text{ At } x=1: 1^2(0 + 2) = 2.' },
        { func: 'x^{\\ln x}', at: 'x = e', ans: '$2$', dist: ['$1$', '$e$', '$0$'], steps: '\\frac{d}{dx}[e^{(\\ln x)^2}] = x^{\\ln x} \\cdot \\frac{2\\ln x}{x}. \\text{ At } x=e: e^1 \\cdot \\frac{2(1)}{e} = 2.' },
        { func: '2^x', at: 'x = 0', ans: '$\\ln(2)$', dist: ['$1$', '$2$', '$0$'], steps: '\\frac{d}{dx}[2^x] = 2^x \\ln(2). \\text{ At } x=0: 2^0 \\ln(2) = \\ln(2).' },
      ]);
      questionText = `Find the exact derivative of $f(x) = ${v.func}$ evaluated at $${v.at}$.`;
      correctAnswer = v.ans;
      rawDistractors = v.dist;
      method = `Logarithmic differentiation: ${v.steps}`;
      steps = [`${v.steps}`];
    } else {
      // Regular polygon interior angles
      const n = prng.pick([5, 6, 8, 10, 12]);
      const sum = (n - 2) * 180;
      questionText = `Calculate the sum of the interior angles of a regular convex polygon with $${n}$ sides:`;
      correctAnswer = `$${sum}^\\circ$`;
      rawDistractors = [`$${sum - 180}^\\circ$`, `$${sum + 180}^\\circ$`, `$${sum + 360}^\\circ$`];
      method = `$(n - 2) \\times 180^\\circ = (${n} - 2) \\times 180^\\circ = ${sum}^\\circ$.`;
      steps = [`$(${n} - 2) \\times 180^\\circ = ${sum}^\\circ$.`];
    }
    given = `Stage 100 Pinnacle Challenge.`;
    required = `Rigorous analytical deduction.`;
    conclusion = `The verified master solution is ${correctAnswer}.`;
    hint = `Apply core fundamental theorems of advanced mathematics.`;
  }

  const optionCount = stageId <= 50 ? 3 : 4;
  const { options, correctIndex } = buildOptions(correctAnswer, rawDistractors, prng, optionCount);

  return {
    id: qId,
    stageId,
    levelId,
    blockId,
    topic: curriculumTopic.name,
    area: curriculumTopic.area,
    principle: `Topic #${curriculumTopic.id}: ${curriculumTopic.name}`,
    difficulty: tier,
    questionText,
    options,
    correctAnswer,
    correctIndex,
    solution: {
      given,
      required,
      method,
      steps,
      conclusion,
      misconceptions,
    },
    hint,
  };
}
