import { DifficultyTier } from '../../types';
import { PRNG, gcd } from '../generators/shared';
import { GeneratedTopicArtifact, makeUniqueDistractors, fmtFrac } from './types';

export function generateRatiosAlgebraTopic(
  topicName: string,
  topicArea: string,
  stageId: number,
  difficulty: DifficultyTier,
  prng: PRNG,
  diffMultiplier: number
): GeneratedTopicArtifact {
  const nameL = topicName.toLowerCase();

  // 1. Solving Linear Equations (Stages 26-28)
  if (nameL.includes('equation') || nameL.includes('linear equation') || nameL.includes('one-step') || nameL.includes('two-step')) {
    if (nameL.includes('bracket')) {
      const a = prng.pick([3, 4, 5, 6]);
      const xAns = prng.int(3, 9);
      const b = prng.int(1, 6);
      const rhs = a * (xAns - b);
      const correctAns = `$x = ${xAns}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Solving linear equations with brackets',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Expand brackets and isolate x',
          representation: 'equation', context: 'Algebra',
          numbersUsed: [a, b, rhs, xAns], expectedReasoning: 'Divide both sides by multiplier, then add constant',
          conceptKey: 'LINEAR_EQUATION_BRACKETS',
        },
        questionText: `Solve the linear equation for $x$:\n\n$$${a}(x - ${b}) = ${rhs}$$`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$x = ${xAns + 2}$`,
          `$x = ${Math.max(1, xAns - 2)}$`,
          `$x = ${xAns + b}$`,
          `$x = ${Math.round(rhs / a)}$`,
        ], prng),
        given: `Equation $${a}(x - ${b}) = ${rhs}$.`,
        required: `Solution for $x$.`,
        method: `Divide both sides by $${a}$, then add $${b}$.`,
        steps: [
          `$x - ${b} = \\dfrac{${rhs}}{${a}} = ${rhs / a}$.`,
          `$x = ${rhs / a} + ${b} = ${xAns}$.`,
        ],
        conclusion: `The solution is $x = ${xAns}$.`,
        hint: `Divide both sides by $${a}$ first, then add $${b}$.`,
      };
    }

    if (nameL.includes('fraction')) {
      const den = prng.pick([3, 4, 5, 6]);
      const xAns = prng.int(4, 12);
      const k = prng.int(2, 7);
      const rhs = xAns + k * den;
      const correctAns = `$x = ${xAns}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Solving linear equations with fractions',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Clear denominator by multiplying',
          representation: 'equation', context: 'Algebra',
          numbersUsed: [den, k, xAns], expectedReasoning: 'Multiply all terms by common denominator to eliminate fraction',
          conceptKey: 'EQUATION_WITH_FRACTIONS',
        },
        questionText: `Solve the equation for $x$:\n\n$$${fmtFrac('x', den)} + ${k} = ${fmtFrac(rhs, den)}$$`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$x = ${xAns + den}$`,
          `$x = ${Math.max(1, xAns - den)}$`,
          `$x = ${xAns * 2}$`,
        ], prng),
        given: `Equation $${fmtFrac('x', den)} + ${k} = ${fmtFrac(rhs, den)}$.`,
        required: `Value of $x$.`,
        method: `Multiply every term by $${den}$ to eliminate the fraction: $x + ${k * den} = ${rhs}$.`,
        steps: [
          `$x + ${k * den} = ${rhs}$.`,
          `$x = ${rhs} - ${k * den} = ${xAns}$.`,
        ],
        conclusion: `The solution is $x = ${xAns}$.`,
        hint: `Multiply through by $${den}$ to clear the fraction.`,
      };
    }

    // Standard two-step equation: ax + b = c
    const a = prng.pick([2, 3, 4, 5, 7]);
    const xAns = prng.int(3, 11);
    const b = prng.int(4, 19);
    const c = a * xAns + b;
    const correctAns = `$x = ${xAns}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Solving two-step linear equation',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'ax + b = c => x = (c - b) / a',
        representation: 'equation', context: 'Algebra',
        numbersUsed: [a, b, c, xAns], expectedReasoning: 'Subtract constant term b, then divide by coefficient a',
        conceptKey: 'TWO_STEP_LINEAR_EQUATION',
      },
      questionText: `Solve the linear equation for $x$:\n\n$$${a}x + ${b} = ${c}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$x = ${xAns + 1}$`,
        `$x = ${Math.max(1, xAns - 1)}$`,
        `$x = ${Math.round((c + b) / a)}$`,
        `$x = ${c - b}$`,
      ], prng),
      given: `Equation $${a}x + ${b} = ${c}$.`,
      required: `Value of $x$.`,
      method: `Subtract $${b}$ from both sides, then divide by $${a}$.`,
      steps: [
        `$${a}x = ${c} - ${b} = ${c - b}$.`,
        `$x = \\dfrac{${c - b}}{${a}} = ${xAns}$.`,
      ],
      conclusion: `The solution is $x = ${xAns}$.`,
      hint: `Subtract $${b}$ from both sides first, then divide by $${a}$.`,
    };
  }

  // 2. Algebraic Expressions: Expanding, Factoring, Like terms (Stages 24, 25)
  if (nameL.includes('expanding') || nameL.includes('removing brackets') || nameL.includes('distributive')) {
    const k = prng.pick([3, 4, 5, 6, 7]);
    const m = prng.int(2, 5);
    const n = prng.int(3, 8);
    const correctAns = `$${k * m}x + ${k * n}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Expanding algebraic brackets using distributive law',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'k(mx + n) = kmx + kn',
        representation: 'equation', context: 'Algebraic manipulation',
        numbersUsed: [k, m, n, k * m, k * n], expectedReasoning: 'Multiply every term inside bracket by external multiplier',
        conceptKey: 'EXPANDING_BRACKETS_DISTRIBUTIVE',
      },
      questionText: `Expand the algebraic expression:\n\n$$${k}(${m}x + ${n})$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${k * m}x + ${n}$`, // forgot to multiply second term
        `$${m}x + ${k * n}$`,
        `$${k * m}x - ${k * n}$`,
      ], prng),
      given: `Expression $${k}(${m}x + ${n})$.`,
      required: `Expanded expression.`,
      method: `Distribute $${k}$: multiply $${k} \\times ${m}x$ and $${k} \\times ${n}$.`,
      steps: [
        `$${k} \\times ${m}x = ${k * m}x$.`,
        `$${k} \\times ${n} = ${k * n}$.`,
        `Combine: $${k * m}x + ${k * n}$.`,
      ],
      conclusion: `$${k}(${m}x + ${n}) = ${k * m}x + ${k * n}$.`,
      hint: `Multiply the number in front by EACH term inside the bracket!`,
    };
  }

  if (nameL.includes('factoring') || nameL.includes('common factor') || nameL.includes('substitution')) {
    if (nameL.includes('substitution') || nameL.includes('evaluating expression')) {
      const a = prng.pick([2, 3, 4, 5]);
      const b = prng.int(3, 9);
      const xVal = prng.int(2, 6);
      const evalAns = a * xVal * xVal - b;
      const correctAns = `$${evalAns}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Evaluating algebraic expression by substitution',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'ax^2 - b substitution',
          representation: 'equation', context: 'Algebra',
          numbersUsed: [a, b, xVal, evalAns], expectedReasoning: 'Substitute variable value into expression following BODMAS',
          conceptKey: 'ALGEBRAIC_SUBSTITUTION_EVALUATION',
        },
        questionText: `Evaluate the expression when $x = ${xVal}$:\n\n$$${a}x^2 - ${b}$$`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$${a * xVal * 2 - b}$`,
          `$${evalAns + b}$`,
          `$${(a * xVal) * (a * xVal) - b}$`,
        ], prng),
        given: `Expression $${a}x^2 - ${b}$, where $x = ${xVal}$.`,
        required: `Numerical value.`,
        method: `Calculate $x^2 = ${xVal}^2 = ${xVal * xVal}$ first, multiply by $${a}$, then subtract $${b}$.`,
        steps: [
          `$${xVal}^2 = ${xVal * xVal}$.`,
          `$${a} \\times ${xVal * xVal} = ${a * xVal * xVal}$.`,
          `$${a * xVal * xVal} - ${b} = ${evalAns}$.`,
        ],
        conclusion: `The value is $${evalAns}$.`,
        hint: `Square $x$ first before multiplying by $${a}$.`,
      };
    }
  }

  // 3. Ratios: Simplifying, Sharing, Unit Rates, Scales (Stages 21-23)
  if (nameL.includes('simplifying ratio') || nameL.includes('equivalent ratio') || nameL.includes('ratio notation') || nameL.includes('ratio table')) {
    const k = prng.pick([3, 4, 5, 6, 7]);
    const rA = prng.pick([2, 3, 4, 5]);
    const rB = prng.pick([5, 7, 9, 11]);
    const rawA = rA * k;
    const rawB = rB * k;
    const correctAns = `$${rA} : ${rB}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Simplifying ratios to lowest terms',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Divide both parts by GCD',
        representation: 'equation', context: 'Ratios',
        numbersUsed: [rawA, rawB, k, rA, rB], expectedReasoning: 'Divide both parts of the ratio by their greatest common divisor',
        conceptKey: 'RATIO_SIMPLIFICATION',
      },
      questionText: `Simplify the ratio to its lowest terms:\n\n$$${rawA} : ${rawB}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${rA + 1} : ${rB}$`,
        `$${rA} : ${rB + 1}$`,
        `$${rawA / 2} : ${rawB / 2}$`,
      ], prng),
      given: `Ratio $${rawA} : ${rawB}$.`,
      required: `Simplest ratio.`,
      method: `Divide both numbers by $\\gcd(${rawA}, ${rawB}) = ${k}$.`,
      steps: [
        `$${rawA} \\div ${k} = ${rA}$.`,
        `$${rawB} \\div ${k} = ${rB}$.`,
      ],
      conclusion: `The simplified ratio is $${rA} : ${rB}$.`,
      hint: `Divide both numbers by their highest common factor ($${k}$).`,
    };
  }

  if (nameL.includes('sharing in a ratio') || nameL.includes('dividing quantities in ratio') || nameL.includes('part-to-part') || nameL.includes('part-to-whole')) {
    const partA = prng.pick([2, 3, 4]);
    const partB = prng.pick([3, 5, 7]);
    const sumParts = partA + partB;
    const multiplier = prng.int(10, 25);
    const totalAmount = sumParts * multiplier;
    const shareA = partA * multiplier;
    const shareB = partB * multiplier;
    const correctAns = `$\\text{GH¢}${shareA}$ and $\\text{GH¢}${shareB}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Dividing quantity in a given ratio',
        questionType: 'word_problem', difficulty, mathematicalOperation: 'Share = (part / totalParts) * Total',
        representation: 'word_problem', context: 'Financial sharing',
        numbersUsed: [partA, partB, totalAmount, shareA, shareB], expectedReasoning: 'Find value of 1 part = Total / (partA + partB), then multiply each',
        conceptKey: 'SHARING_QUANTITY_IN_RATIO',
      },
      questionText: `Share $\\text{GH¢}${totalAmount}$ between Ama and Kwame in the ratio $${partA} : ${partB}$.\n\nHow much does each person receive?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$\\text{GH¢}${shareB}$ and $\\text{GH¢}${shareA}$`, // reversed
        `$\\text{GH¢}${shareA + 10}$ and $\\text{GH¢}${shareB - 10}$`,
        `$\\text{GH¢}${Math.round(totalAmount / 2)}$ and $\\text{GH¢}${Math.round(totalAmount / 2)}$`,
      ], prng),
      given: `Total $= \\text{GH¢}${totalAmount}$, Ratio $= ${partA} : ${partB}$.`,
      required: `Individual shares.`,
      method: `Total parts $= ${partA} + ${partB} = ${sumParts}$. Value of 1 part $= \\text{GH¢}${totalAmount} \\div ${sumParts} = \\text{GH¢}${multiplier}$.`,
      steps: [
        `Ama ($${partA}$ parts) $= ${partA} \\times \\text{GH¢}${multiplier} = \\text{GH¢}${shareA}$.`,
        `Kwame ($${partB}$ parts) $= ${partB} \\times \\text{GH¢}${multiplier} = \\text{GH¢}${shareB}$.`,
      ],
      conclusion: `Ama receives $\\text{GH¢}${shareA}$ and Kwame receives $\\text{GH¢}${shareB}$.`,
      hint: `Add the ratio parts together to find the total parts, then divide the total money by that sum.`,
    };
  }

  // 4. Sequences & Functions (Stages 29, 30)
  if (nameL.includes('sequence') || nameL.includes('function') || nameL.includes('term-to-term') || nameL.includes('position-to-term')) {
    const a1 = prng.int(3, 12);
    const d = prng.pick([3, 4, 5, 7]);
    const n = prng.pick([10, 15, 20]);
    const nthTerm = a1 + (n - 1) * d;
    const correctAns = `$${nthTerm}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Finding n-th term of arithmetic sequence',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'T_n = a + (n - 1)d',
        representation: 'equation', context: 'Arithmetic progressions',
        numbersUsed: [a1, d, n, nthTerm], expectedReasoning: 'Apply formula for n-th term of arithmetic sequence',
        conceptKey: 'ARITHMETIC_SEQUENCE_NTH_TERM',
      },
      questionText: `An arithmetic sequence begins with $${a1}, ${a1 + d}, ${a1 + 2 * d}, \\dots$\n\nFind the $${n}\\text{th}$ term ($T_{${n}}$) of the sequence:`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${a1 + n * d}$`, // forgot n - 1
        `$${nthTerm + d}$`,
        `$${nthTerm - d}$`,
      ], prng),
      given: `First term $a = ${a1}$, common difference $d = ${d}$, $n = ${n}$.`,
      required: `$${n}\\text{th}$ term.`,
      method: `Apply $T_n = a + (n - 1)d$.`,
      steps: [
        `$T_{${n}} = ${a1} + (${n} - 1) \\times ${d}$.`,
        `$T_{${n}} = ${a1} + (${n - 1} \\times ${d}) = ${a1} + ${(n - 1) * d} = ${nthTerm}$.`,
      ],
      conclusion: `The $${n}\\text{th}$ term is $${nthTerm}$.`,
      hint: `Use the formula: First term + (term number - 1) × common difference.`,
    };
  }

  // Default Stage-specific linear algebra fallback
  const m = prng.pick([2, 3, 4]);
  const c = prng.int(5, 15);
  const xVal = prng.int(2, 6);
  const yVal = m * xVal + c;
  const correctAns = `$y = ${yVal}$`;

  return {
    blueprint: {
      mainTopic: topicArea, subtopic: topicName, skill: `Linear evaluation for ${topicName}`,
      questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Linear functional relation',
      representation: 'equation', context: 'Algebra',
      numbersUsed: [m, c, xVal, yVal], expectedReasoning: 'Substitute coordinate into linear relationship',
      conceptKey: `RATIOS_ALGEBRA_STAGE_${stageId}_SKILL`,
    },
    questionText: `If a linear relation is given by $y = ${m}x + ${c}$, what is the value of $y$ when $x = ${xVal}$?`,
    correctAnswer: correctAns,
    rawDistractors: makeUniqueDistractors(correctAns, [
      `$y = ${yVal + m}$`,
      `$y = ${Math.max(1, yVal - m)}$`,
      `$y = ${m * xVal}$`,
    ], prng),
    given: `Equation $y = ${m}x + ${c}$, $x = ${xVal}$.`,
    required: `Value of $y$.`,
    method: `Substitute $x = ${xVal}$: $y = (${m} \\times ${xVal}) + ${c}$.`,
    steps: [
      `$${m} \\times ${xVal} = ${m * xVal}$.`,
      `$${m * xVal} + ${c} = ${yVal}$.`,
    ],
    conclusion: `When $x = ${xVal}$, $y = ${yVal}$.`,
    hint: `Multiply $${m}$ by $${xVal}$, then add $${c}$.`,
  };
}
