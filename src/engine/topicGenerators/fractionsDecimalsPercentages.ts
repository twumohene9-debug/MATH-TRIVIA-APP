import { DifficultyTier } from '../../types';
import { PRNG, gcd, generateNumericalDistractors } from '../generators/shared';
import { GeneratedTopicArtifact, makeUniqueDistractors, fmtFrac, fmtMixed, sample } from './types';

export function generateFractionsDecimalsPercentagesTopic(
  topicName: string,
  topicArea: string,
  stageId: number,
  difficulty: DifficultyTier,
  prng: PRNG,
  diffMultiplier: number
): GeneratedTopicArtifact {
  const nameL = topicName.toLowerCase();

  // 1. Improper to Mixed conversion
  if (nameL.includes('improper fraction') || (nameL.includes('converting') && nameL.includes('mixed'))) {
    const den = prng.pick([3, 4, 5, 6, 7, 8, 9, 11]);
    const whole = prng.int(2, 6);
    const num = prng.int(1, den - 1);
    const impNum = whole * den + num;
    const correctAns = `$${fmtMixed(whole, num, den)}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Converting improper fraction to mixed number',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Division with remainder',
        representation: 'equation', context: 'Fractions conversion',
        numbersUsed: [impNum, den, whole, num], expectedReasoning: 'Quotient gives whole part, remainder gives numerator',
        conceptKey: 'IMPROPER_TO_MIXED_CONVERSION',
      },
      questionText: `Convert the improper fraction into a mixed number in simplest form:\n\n$$${fmtFrac(impNum, den)}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${fmtMixed(whole + 1, num, den)}$`,
        `$${fmtMixed(whole, Math.max(1, den - num), den)}$`,
        `$${fmtMixed(Math.max(1, whole - 1), num, den)}$`,
        `$${fmtMixed(whole, num + 1, den)}$`,
      ], prng),
      given: `Improper fraction $${fmtFrac(impNum, den)}$.`,
      required: `Equivalent mixed number.`,
      method: `Divide $${impNum}$ by $${den}$: the integer quotient gives the whole number, and the remainder forms the fraction numerator.`,
      steps: [
        `$${impNum} \\div ${den} = ${whole}$ with remainder $${num}$.`,
        `Write as mixed number: $${fmtMixed(whole, num, den)}$.`,
      ],
      conclusion: `$${fmtFrac(impNum, den)} = ${fmtMixed(whole, num, den)}$.`,
      hint: `Divide $${impNum}$ by $${den}$. The quotient is the whole number and the remainder goes on top.`,
    };
  }

  // 2. Unit fractions / Proper fractions
  if (nameL.includes('unit fraction') || nameL.includes('proper fraction')) {
    if (nameL.includes('unit fraction')) {
      const dens = [2, 3, 4, 5, 8, 10];
      const selected = sample(prng, dens, 4).sort((a, b) => a - b);
      const greatest = selected[0]; // smaller denominator = larger fraction
      const correctAns = `$${fmtFrac(1, greatest)}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Unit fraction comparison',
          questionType: 'comparison', difficulty, mathematicalOperation: 'Reciprocal ordering',
          representation: 'list', context: 'Fraction magnitude',
          numbersUsed: selected, expectedReasoning: 'For unit fractions, a smaller denominator represents a strictly larger fraction',
          conceptKey: 'UNIT_FRACTION_COMPARISON',
        },
        questionText: `Which of the following unit fractions has the greatest mathematical value?`,
        correctAnswer: correctAns,
        rawDistractors: selected.slice(1).map(d => `$${fmtFrac(1, d)}$`),
        given: `Unit fractions: ${selected.map(d => `$${fmtFrac(1, d)}$`).join(', ')}.`,
        required: `The greatest unit fraction.`,
        method: `A unit fraction has numerator 1. The smaller the denominator, the larger each piece.`,
        steps: [
          `Denominators: ${selected.join(', ')}.`,
          `Smallest denominator is $${greatest}$, so $${fmtFrac(1, greatest)}$ is the greatest.`,
        ],
        conclusion: `The greatest fraction is $${fmtFrac(1, greatest)}$.`,
        hint: `Think of sharing a pizza: sharing among fewer people gives each person a bigger piece!`,
      };
    }
  }

  // 3. Equivalent Fractions
  if (nameL.includes('equivalent fraction') || nameL.includes('equivalent proportions') || nameL.includes('ratio equivalence')) {
    const baseNum = prng.pick([2, 3, 4, 5]);
    const baseDen = prng.pick([5, 7, 9, 11]);
    const k = prng.pick([3, 4, 5, 6]);
    const eqDen = baseDen * k;
    const ansN = baseNum * k;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Finding missing numerator in equivalent fraction',
        questionType: 'missing_value', difficulty, mathematicalOperation: 'Proportional scaling',
        representation: 'equation', context: 'Fraction scaling',
        numbersUsed: [baseNum, baseDen, eqDen, ansN], expectedReasoning: 'Multiply numerator by the same scale factor as the denominator',
        conceptKey: 'EQUIVALENT_FRACTIONS_SCALING',
      },
      questionText: `Find the missing numerator $n$ in the equivalent fraction relationship:\n\n$$${fmtFrac(baseNum, baseDen)} = ${fmtFrac('n', eqDen)}$$`,
      correctAnswer: `$n = ${ansN}$`,
      rawDistractors: makeUniqueDistractors(`$n = ${ansN}$`, [
        `$n = ${ansN + 2}$`,
        `$n = ${Math.max(1, ansN - 2)}$`,
        `$n = ${baseNum * (k + 1)}$`,
        `$n = ${eqDen - baseDen}$`,
      ], prng),
      given: `$${fmtFrac(baseNum, baseDen)} = ${fmtFrac('n', eqDen)}$.`,
      required: `Value of $n$.`,
      method: `Identify multiplier $k = ${eqDen} \\div ${baseDen} = ${k}$, then compute $n = ${baseNum} \\times ${k}$.`,
      steps: [
        `Scale factor: $${eqDen} \\div ${baseDen} = ${k}$.`,
        `Multiply numerator: $n = ${baseNum} \\times ${k} = ${ansN}$.`,
      ],
      conclusion: `$n = ${ansN}$, so $${fmtFrac(baseNum, baseDen)} = ${fmtFrac(ansN, eqDen)}$.`,
      hint: `What number did the bottom get multiplied by? Multiply the top by that exact same number.`,
    };
  }

  // 4. Simplifying / Reducing Fractions
  if (nameL.includes('simplifying fraction') || nameL.includes('reducing fraction') || nameL.includes('simplest form')) {
    const k = prng.pick([3, 4, 6, 7, 8, 9]);
    const sNum = prng.pick([2, 3, 4, 5, 7]);
    const sDen = prng.pick([9, 11, 13, 15, 17]);
    const bigNum = sNum * k;
    const bigDen = sDen * k;
    const correctAns = `$${fmtFrac(sNum, sDen)}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Reducing fraction to lowest terms',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Dividing by GCD',
        representation: 'equation', context: 'Fraction simplification',
        numbersUsed: [bigNum, bigDen, k, sNum, sDen], expectedReasoning: 'Divide numerator and denominator by their greatest common factor',
        conceptKey: 'SIMPLIFYING_FRACTIONS_GCD',
      },
      questionText: `Reduce the fraction to its simplest form (lowest terms):\n\n$$${fmtFrac(bigNum, bigDen)}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${fmtFrac(sNum + 1, sDen)}$`,
        `$${fmtFrac(sNum, sDen + 2)}$`,
        `$${fmtFrac(bigNum / 2, bigDen / 2)}$`,
      ], prng),
      given: `Fraction $${fmtFrac(bigNum, bigDen)}$.`,
      required: `Simplest form.`,
      method: `Divide both numerator and denominator by $\\gcd(${bigNum}, ${bigDen}) = ${k}$.`,
      steps: [
        `$\\gcd(${bigNum}, ${bigDen}) = ${k}$.`,
        `$${bigNum} \\div ${k} = ${sNum}$, and $${bigDen} \\div ${k} = ${sDen}$.`,
      ],
      conclusion: `The simplest form is $${fmtFrac(sNum, sDen)}$.`,
      hint: `Divide both the top and the bottom by their greatest common factor ($${k}$).`,
    };
  }

  // 5. Fraction of a Quantity
  if (nameL.includes('fraction of a quantity') || nameL.includes('fraction of a number') || nameL.includes('fraction of a')) {
    const den = prng.pick([4, 5, 6, 8, 10]);
    const num = prng.pick([3, 5, 7]).toString() < den.toString() ? prng.int(2, den - 1) : 3;
    const mult = prng.int(6, 18);
    const total = den * mult;
    const ans = num * mult;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Fraction of a quantity calculation',
        questionType: 'word_problem', difficulty, mathematicalOperation: '(num / den) * total',
        representation: 'word_problem', context: 'Applied fractions',
        numbersUsed: [num, den, total, ans], expectedReasoning: 'Divide total by denominator, then multiply by numerator',
        conceptKey: 'FRACTION_OF_QUANTITY_CALCULATION',
      },
      questionText: `Calculate $${fmtFrac(num, den)}$ of $${total}\\text{ kg}$:`,
      correctAnswer: `$${ans}\\text{ kg}$`,
      rawDistractors: makeUniqueDistractors(`$${ans}\\text{ kg}$`, [
        `$${ans + mult}\\text{ kg}$`,
        `$${Math.max(1, ans - mult)}\\text{ kg}$`,
        `$${num * den}\\text{ kg}$`,
        `$${ans + 5}\\text{ kg}$`,
      ], prng),
      given: `Fraction $${fmtFrac(num, den)}$, Total quantity $= ${total}\\text{ kg}$.`,
      required: `Resulting amount.`,
      method: `Divide $${total}$ by $${den}$ to find one part, then multiply by $${num}$.`,
      steps: [
        `$${total} \\div ${den} = ${mult}\\text{ kg}$.`,
        `$${num} \\times ${mult} = ${ans}\\text{ kg}$.`,
      ],
      conclusion: `$${fmtFrac(num, den)}$ of $${total}\\text{ kg} = ${ans}\\text{ kg}$.`,
      hint: `Divide by the bottom number, then multiply the result by the top number.`,
    };
  }

  // 6. Multiplication & Division of Fractions
  if (nameL.includes('multiplication of fraction') || nameL.includes('multiplying fraction')) {
    const n1 = prng.int(2, 5);
    const d1 = prng.pick([7, 9, 11]);
    const n2 = prng.int(3, 5);
    const d2 = prng.pick([8, 10, 13]);
    const rawN = n1 * n2;
    const rawD = d1 * d2;
    const g = gcd(rawN, rawD);
    const finalN = rawN / g;
    const finalD = rawD / g;
    const correctAns = `$${fmtFrac(finalN, finalD)}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Multiplication of fractions',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: '(a/b) * (c/d) = (ac)/(bd)',
        representation: 'equation', context: 'Fraction arithmetic',
        numbersUsed: [n1, d1, n2, d2, finalN, finalD], expectedReasoning: 'Multiply numerators together and denominators together, then reduce',
        conceptKey: 'FRACTION_MULTIPLICATION',
      },
      questionText: `Multiply and simplify to lowest terms:\n\n$$${fmtFrac(n1, d1)} \\times ${fmtFrac(n2, d2)}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${fmtFrac(finalN + 1, finalD)}$`,
        `$${fmtFrac(n1 + n2, d1 + d2)}$`, // common error: adding instead of multiplying
        `$${fmtFrac(finalN, finalD + 2)}$`,
      ], prng),
      given: `Product $${fmtFrac(n1, d1)} \\times ${fmtFrac(n2, d2)}$.`,
      required: `Simplified product.`,
      method: `Multiply tops and bottoms: $\\dfrac{${n1} \\times ${n2}}{${d1} \\times ${d2}} = ${fmtFrac(rawN, rawD)}$, then simplify.`,
      steps: [
        `$${n1} \\times ${n2} = ${rawN}$.`,
        `$${d1} \\times ${d2} = ${rawD}$.`,
        `Simplify by $\\gcd(${rawN}, ${rawD}) = ${g}$: $${fmtFrac(finalN, finalD)}$.`,
      ],
      conclusion: `The product is $${fmtFrac(finalN, finalD)}$.`,
      hint: `Multiply straight across: top times top, and bottom times bottom!`,
    };
  }

  if (nameL.includes('division of fraction') || nameL.includes('dividing fraction') || nameL.includes('reciprocal')) {
    const n1 = prng.int(2, 5);
    const d1 = prng.pick([7, 9]);
    const n2 = prng.int(3, 4);
    const d2 = prng.pick([5, 8]);
    const rawN = n1 * d2;
    const rawD = d1 * n2;
    const g = gcd(rawN, rawD);
    const finalN = rawN / g;
    const finalD = rawD / g;
    const correctAns = `$${fmtFrac(finalN, finalD)}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Division of fractions via reciprocal',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: '(a/b) / (c/d) = (a/b) * (d/c)',
        representation: 'equation', context: 'Fraction arithmetic',
        numbersUsed: [n1, d1, n2, d2, finalN, finalD], expectedReasoning: 'Multiply by the reciprocal of the divisor',
        conceptKey: 'FRACTION_DIVISION_RECIPROCAL',
      },
      questionText: `Evaluate and simplify to lowest terms:\n\n$$${fmtFrac(n1, d1)} \\div ${fmtFrac(n2, d2)}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${fmtFrac(n1 * n2, d1 * d2)}$`, // multiplied directly without flipping
        `$${fmtFrac(finalN + 1, finalD)}$`,
        `$${fmtFrac(finalN, finalD + 1)}$`,
      ], prng),
      given: `Expression $${fmtFrac(n1, d1)} \\div ${fmtFrac(n2, d2)}$.`,
      required: `Quotient in simplest form.`,
      method: `Keep, Change, Flip: multiply by the reciprocal $${fmtFrac(d2, n2)}$.`,
      steps: [
        `Reciprocal of divisor: $${fmtFrac(d2, n2)}$.`,
        `Multiply: $${fmtFrac(n1, d1)} \\times ${fmtFrac(d2, n2)} = ${fmtFrac(rawN, rawD)}$.`,
        `Simplify: $${fmtFrac(finalN, finalD)}$.`,
      ],
      conclusion: `The result is $${fmtFrac(finalN, finalD)}$.`,
      hint: `Keep the first fraction, change division to multiplication, and flip the second fraction!`,
    };
  }

  // 7. Decimals (Place value, addition, multiplication, conversion) (Stages 14-15)
  if (nameL.includes('decimal') || nameL.includes('tenths') || nameL.includes('hundredths') || nameL.includes('recurring')) {
    if (nameL.includes('recurring') || nameL.includes('terminating')) {
      const correctAns = `$\\dfrac{1}{3}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Recurring decimals classification',
          questionType: 'identification', difficulty, mathematicalOperation: 'Decimal expansion analysis',
          representation: 'definition', context: 'Rational numbers',
          numbersUsed: [1, 3, 0.333], expectedReasoning: 'Fractions whose reduced denominator contains prime factors other than 2 or 5 produce recurring decimals',
          conceptKey: 'RECURRING_DECIMALS_ANALYSIS',
        },
        questionText: `Which of the following fractions converts to an infinitely recurring decimal?`,
        correctAnswer: correctAns,
        rawDistractors: [`$\\dfrac{1}{2}$`, `$\\dfrac{3}{4}$`, `$\\dfrac{2}{5}$`],
        given: `Fractions: $\\dfrac{1}{3}, \\dfrac{1}{2}, \\dfrac{3}{4}, \\dfrac{2}{5}$.`,
        required: `Fraction with recurring decimal expansion.`,
        method: `Check prime factors of denominator: only powers of 2 and 5 terminate; factor 3 creates a recurring decimal $0.333\\dots$.`,
        steps: [
          `$\\dfrac{1}{2} = 0.5$ (terminating).`,
          `$\\dfrac{3}{4} = 0.75$ (terminating).`,
          `$\\dfrac{2}{5} = 0.4$ (terminating).`,
          `$\\dfrac{1}{3} = 0.\\overline{3}$ (recurring).`,
        ],
        conclusion: `$\\dfrac{1}{3}$ is recurring.`,
        hint: `Divide each fraction: which one goes on forever without stopping?`,
      };
    }

    // Decimal addition / multiplication
    const a = prng.pick([3.45, 6.78, 12.35, 4.82]);
    const b = prng.pick([2.65, 5.25, 7.85, 3.19]);
    const sum = parseFloat((a + b).toFixed(2));
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Decimal addition with decimal point alignment',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Column decimal addition',
        representation: 'equation', context: 'Decimals arithmetic',
        numbersUsed: [a, b, sum], expectedReasoning: 'Align decimal points vertically and carry across place values',
        conceptKey: 'DECIMAL_ADDITION',
      },
      questionText: `Evaluate the decimal addition:\n\n$$${a} + ${b}$$`,
      correctAnswer: `$${sum}$`,
      rawDistractors: makeUniqueDistractors(`$${sum}$`, [
        `$${(sum + 0.1).toFixed(2)}$`,
        `$${(sum - 0.1).toFixed(2)}$`,
        `$${(sum + 1).toFixed(2)}$`,
        `$${(sum + 0.01).toFixed(2)}$`,
      ], prng),
      given: `Addends $${a}$ and $${b}$.`,
      required: `Sum.`,
      method: `Align decimal points and add hundredths, tenths, and whole numbers.`,
      steps: [`$${a} + ${b} = ${sum}$.`],
      conclusion: `The sum is $${sum}$.`,
      hint: `Make sure the decimal points line up vertically!`,
    };
  }

  // 8. Percentages (Increase, decrease, percent of quantity, reverse percentage) (Stages 16-18)
  if (nameL.includes('percentage') || nameL.includes('percent')) {
    if (nameL.includes('increase') || nameL.includes('decrease') || nameL.includes('change')) {
      const isInc = !nameL.includes('decrease');
      const orig = prng.pick([50, 80, 120, 200, 250]);
      const pct = prng.pick([15, 20, 25, 30, 40]);
      const change = (orig * pct) / 100;
      const finalPrice = isInc ? orig + change : orig - change;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: `Percentage ${isInc ? 'increase' : 'decrease'} calculation`,
          questionType: 'direct_calculation', difficulty, mathematicalOperation: '(change / orig) * 100%',
          representation: 'word_problem', context: 'Applied percentage change',
          numbersUsed: [orig, finalPrice, change, pct], expectedReasoning: 'Divide absolute change by original quantity, then multiply by 100%',
          conceptKey: isInc ? 'PERCENTAGE_INCREASE' : 'PERCENTAGE_DECREASE',
        },
        questionText: `The price of an item changes from $\\text{GH¢}${orig}$ to $\\text{GH¢}${finalPrice}$.\n\nWhat is the percentage ${isInc ? 'increase' : 'decrease'}?`,
        correctAnswer: `$${pct}\\%$`,
        rawDistractors: makeUniqueDistractors(`$${pct}\\%$`, [
          `$${pct + 5}\\%$`,
          `$${Math.max(5, pct - 5)}\\%$`,
          `$${Math.round((change / finalPrice) * 100)}\\%$`,
        ], prng),
        given: `Original $= \\text{GH¢}${orig}$, New $= \\text{GH¢}${finalPrice}$.`,
        required: `Percentage ${isInc ? 'increase' : 'decrease'}.`,
        method: `$\\text{Percentage Change} = \\dfrac{\\text{Difference}}{\\text{Original}} \\times 100\\%$.`,
        steps: [
          `Difference $= |${finalPrice} - ${orig}| = \\text{GH¢}${change}$.`,
          `Fraction: $\\dfrac{${change}}{${orig}} = ${change / orig}$.`,
          `Multiply by $100\\%$: $${change / orig} \\times 100\\% = ${pct}\\%$.`,
        ],
        conclusion: `The percentage ${isInc ? 'increase' : 'decrease'} is $${pct}\\%$.`,
        hint: `Find the change amount, divide by the ORIGINAL value, then multiply by 100%.`,
      };
    }

    // Percent of a quantity
    const pct = prng.pick([15, 20, 25, 35, 45, 60, 75]);
    const total = prng.pick([80, 120, 160, 240, 300, 400]);
    const ans = (pct * total) / 100;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Finding percentage of a quantity',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: '(P / 100) * total',
        representation: 'equation', context: 'Percentages',
        numbersUsed: [pct, total, ans], expectedReasoning: 'Convert percent to fraction over 100 and multiply by total',
        conceptKey: 'PERCENT_OF_QUANTITY',
      },
      questionText: `Calculate $${pct}\\%$ of $${total}$:`,
      correctAnswer: `$${ans}$`,
      rawDistractors: makeUniqueDistractors(`$${ans}$`, [
        `$${ans + 10}$`,
        `$${Math.max(5, ans - 10)}$`,
        `$${ans * 2}$`,
      ], prng),
      given: `Percentage $${pct}\\%$, Base $${total}$.`,
      required: `Value.`,
      method: `$\\dfrac{${pct}}{100} \\times ${total} = ${ans}$.`,
      steps: [
        `$${pct}\\% = \\dfrac{${pct}}{100} = ${pct / 100}$.`,
        `$${pct / 100} \\times ${total} = ${ans}$.`,
      ],
      conclusion: `$${pct}\\%$ of $${total} = ${ans}$.`,
      hint: `Convert $${pct}\\%$ to $\\dfrac{${pct}}{100}$, then multiply by $${total}$.`,
    };
  }

  // Default fraction addition / subtraction
  const d1 = prng.pick([3, 4, 5]);
  const d2 = prng.pick([6, 8, 10]);
  const n1 = 1;
  const n2 = 1;
  const commonDen = (d1 * d2) / gcd(d1, d2);
  const sumN = n1 * (commonDen / d1) + n2 * (commonDen / d2);
  const g = gcd(sumN, commonDen);
  const fN = sumN / g;
  const fD = commonDen / g;
  const correctAns = `$${fmtFrac(fN, fD)}$`;

  return {
    blueprint: {
      mainTopic: topicArea, subtopic: topicName, skill: `Operations on ${topicName}`,
      questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Fraction addition with LCD',
      representation: 'equation', context: 'Fractions',
      numbersUsed: [d1, d2, fN, fD], expectedReasoning: 'Convert to common denominator, add numerators, then simplify',
      conceptKey: `FRACTIONS_DECIMALS_STAGE_${stageId}_SKILL`,
    },
    questionText: `Evaluate and simplify the fraction sum:\n\n$$${fmtFrac(n1, d1)} + ${fmtFrac(n2, d2)}$$`,
    correctAnswer: correctAns,
    rawDistractors: makeUniqueDistractors(correctAns, [
      `$${fmtFrac(n1 + n2, d1 + d2)}$`, // added bottoms
      `$${fmtFrac(fN + 1, fD)}$`,
      `$${fmtFrac(fN, fD + 2)}$`,
    ], prng),
    given: `Addends $${fmtFrac(n1, d1)}$ and $${fmtFrac(n2, d2)}$.`,
    required: `Sum in lowest terms.`,
    method: `Find common denominator $\\text{LCM}(${d1}, ${d2}) = ${commonDen}$ and add numerators.`,
    steps: [
      `Common denominator is $${commonDen}$.`,
      `Sum $= ${fmtFrac(sumN, commonDen)} = ${fmtFrac(fN, fD)}$.`,
    ],
    conclusion: `The simplified sum is $${fmtFrac(fN, fD)}$.`,
    hint: `Find a common denominator before adding the numerators!`,
  };
}
