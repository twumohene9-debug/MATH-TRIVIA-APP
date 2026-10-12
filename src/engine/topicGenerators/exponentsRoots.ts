import { DifficultyTier } from '../../types';
import { PRNG } from '../generators/shared';
import { GeneratedTopicArtifact, makeUniqueDistractors, fmtFrac } from './types';

export function generateExponentsRootsTopic(
  topicName: string,
  topicArea: string,
  stageId: number,
  difficulty: DifficultyTier,
  prng: PRNG,
  diffMultiplier: number
): GeneratedTopicArtifact {
  const nameL = topicName.toLowerCase();

  // 1. Negative exponents (Stage 32)
  if (nameL.includes('negative exponent')) {
    const base = prng.pick([2, 3, 4, 5, 6, 7]);
    const exp = prng.pick([2, 3]);
    const pVal = Math.pow(base, exp);
    const correctAns = `$${fmtFrac(1, pVal)}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Negative exponent law',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'a^(-n) = 1 / (a^n)',
        representation: 'equation', context: 'Laws of indices',
        numbersUsed: [base, exp, pVal], expectedReasoning: 'A negative exponent denotes the reciprocal of the positive power',
        conceptKey: 'NEGATIVE_EXPONENTS_LAW',
      },
      questionText: `Express the term with a negative exponent in standard fraction form:\n\n$$${base}^{-${exp}}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$-${pVal}$`,
        `$-${fmtFrac(1, pVal)}$`,
        `$${fmtFrac(1, base * exp)}$`,
      ], prng),
      given: `Expression $${base}^{-${exp}}$.`,
      required: `Fraction form.`,
      method: `Apply the negative index rule: $a^{-n} = \\dfrac{1}{a^n}$.`,
      steps: [
        `$${base}^{-${exp}} = \\dfrac{1}{${base}^{${exp}}}$.`,
        `$${base}^{${exp}} = ${pVal}$, so the fraction is $\\dfrac{1}{${pVal}}$.`,
      ],
      conclusion: `$${base}^{-${exp}} = ${fmtFrac(1, pVal)}$.`,
      hint: `A negative power means 1 over that positive power!`,
    };
  }

  // 2. Fractional Exponents & Roots (Stages 31, 33)
  if (nameL.includes('fractional exponent') || nameL.includes('cube root') || nameL.includes('square root') || nameL.includes('radicals')) {
    if (nameL.includes('cube root')) {
      const bases = [8, 27, 64, 125, 216];
      const b = prng.pick(bases);
      const root = Math.round(Math.cbrt(b));
      const correctAns = `$${root}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Evaluating cube root',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'cbrt(x)',
          representation: 'equation', context: 'Radicals',
          numbersUsed: [b, root], expectedReasoning: 'Find the integer whose cube equals b',
          conceptKey: 'CUBE_ROOT_EVALUATION',
        },
        questionText: `Evaluate the cube root expression:\n\n$$\\sqrt[3]{${b}}$$`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$${root + 1}$`,
          `$${Math.max(1, root - 1)}$`,
          `$${Math.round(b / 3)}$`,
        ], prng),
        given: `Expression $\\sqrt[3]{${b}}$.`,
        required: `Cube root.`,
        method: `Identify the number $r$ such that $r \\times r \\times r = ${b}$.`,
        steps: [`$${root}^3 = ${root} \\times ${root} \\times ${root} = ${b}$.`],
        conclusion: `$\\sqrt[3]{${b}} = ${root}$.`,
        hint: `What number multiplied by itself 3 times equals $${b}$?`,
      };
    }

    if (nameL.includes('simplifying radicals') || nameL.includes('radical notation')) {
      const insideSquare = prng.pick([4, 9, 16, 25, 36]);
      const rootOut = Math.round(Math.sqrt(insideSquare));
      const insidePrime = prng.pick([2, 3, 5, 7]);
      const totalInside = insideSquare * insidePrime;
      const correctAns = `$${rootOut}\\sqrt{${insidePrime}}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Simplifying radicals (surds)',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'sqrt(a^2 * b) = a * sqrt(b)',
          representation: 'equation', context: 'Radicals',
          numbersUsed: [totalInside, insideSquare, rootOut, insidePrime], expectedReasoning: 'Factor out the largest perfect square from under the radical',
          conceptKey: 'SIMPLIFYING_RADICALS_SURDS',
        },
        questionText: `Simplify the radical into simplest surd form ($a\\sqrt{b}$):\n\n$$\\sqrt{${totalInside}}$$`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$${rootOut + 1}\\sqrt{${insidePrime}}$`,
          `$${insideSquare}\\sqrt{${insidePrime}}$`,
          `$${rootOut}\\sqrt{${insidePrime + 1}}$`,
        ], prng),
        given: `Radical $\\sqrt{${totalInside}}$.`,
        required: `Simplified surd.`,
        method: `Factor into a perfect square and a prime factor: $${totalInside} = ${insideSquare} \\times ${insidePrime}$.`,
        steps: [
          `$\\sqrt{${totalInside}} = \\sqrt{${insideSquare} \\times ${insidePrime}}$.`,
          `$\\sqrt{${insideSquare}} \\times \\sqrt{${insidePrime}} = ${rootOut}\\sqrt{${insidePrime}}$.`,
        ],
        conclusion: `$\\sqrt{${totalInside}} = ${rootOut}\\sqrt{${insidePrime}}$.`,
        hint: `Find the largest perfect square that divides $${totalInside}$.`,
      };
    }

    // Square root evaluation
    const root = prng.pick([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    const sq = root * root;
    const correctAns = `$${root}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Evaluating square root of perfect square',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'sqrt(x)',
        representation: 'equation', context: 'Radicals',
        numbersUsed: [sq, root], expectedReasoning: 'Find the positive number whose square equals x',
        conceptKey: 'SQUARE_ROOT_PERFECT_SQUARE',
      },
      questionText: `Evaluate the square root of the perfect square:\n\n$$\\sqrt{${sq}}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${root + 1}$`,
        `$${root - 1}$`,
        `$${Math.round(sq / 2)}$`,
      ], prng),
      given: `Square root $\\sqrt{${sq}}$.`,
      required: `Numerical value.`,
      method: `Identify the integer whose square is $${sq}$.`,
      steps: [`$${root}^2 = ${root} \\times ${root} = ${sq}$.`],
      conclusion: `$\\sqrt{${sq}} = ${root}$.`,
      hint: `What number multiplied by itself gives $${sq}$?`,
    };
  }

  // 3. Scientific Notation (Stage 32, 33)
  if (nameL.includes('scientific notation') || nameL.includes('standard form exponents')) {
    const m = prng.pick([2.4, 3.5, 4.8, 6.2, 7.5, 8.1]);
    const exp = prng.pick([4, 5, 6, 7]);
    const fullNum = m * Math.pow(10, exp);
    const correctAns = `$${m} \\times 10^{${exp}}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Scientific notation conversion',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Standard form A * 10^n',
        representation: 'equation', context: 'Applied notation',
        numbersUsed: [m, exp, fullNum], expectedReasoning: 'A * 10^n where 1 <= A < 10',
        conceptKey: 'SCIENTIFIC_NOTATION_FORM',
      },
      questionText: `Convert the number $${fullNum.toLocaleString()}$ into standard scientific notation ($A \\times 10^n$):`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${m} \\times 10^{${exp + 1}}$`,
        `$${(m * 10).toFixed(0)} \\times 10^{${exp - 1}}$`,
        `$${m} \\times 10^{${exp - 1}}$`,
      ], prng),
      given: `Number $${fullNum.toLocaleString()}$.`,
      required: `Scientific notation.`,
      method: `Shift the decimal point so $1 \\le A < 10$ and count power of 10.`,
      steps: [
        `Shift decimal point left by $${exp}$ places to obtain $${m}$.`,
        `Multiply by $10^{${exp}}$.`,
      ],
      conclusion: `$${fullNum.toLocaleString()} = ${m} \\times 10^{${exp}}$.`,
      hint: `Move the decimal point until only one non-zero digit is to the left of the decimal point.`,
    };
  }

  // 4. Laws of Exponents: Quotient Rule & Power of a Power (Stage 32)
  if (nameL.includes('quotient rule') || nameL.includes('division rule')) {
    const base = prng.pick([2, 3, 5, 7, 'x']);
    const m = prng.int(7, 12);
    const n = prng.int(3, 6);
    const diff = m - n;
    const correctAns = `$${base}^{${diff}}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Quotient rule of exponents',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'a^m / a^n = a^(m - n)',
        representation: 'equation', context: 'Laws of indices',
        numbersUsed: [m, n, diff], expectedReasoning: 'Subtract exponents when dividing powers with the same base',
        conceptKey: 'EXPONENTS_QUOTIENT_RULE',
      },
      questionText: `Simplify using the quotient rule of exponents:\n\n$$${fmtFrac(`${base}^{${m}}`, `${base}^{${n}}`)}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${base}^{${m + n}}$`, // added exponents instead
        `$${base}^{${Math.round(m / n)}}$`, // divided exponents
        `$${base}^{${diff + 1}}$`,
      ], prng),
      given: `Expression $${fmtFrac(`${base}^{${m}}`, `${base}^{${n}}`)}$.`,
      required: `Simplified single power.`,
      method: `Subtract powers: $a^m \\div a^n = a^{m-n}$.`,
      steps: [`$${m} - ${n} = ${diff}$.`, `Result $= ${base}^{${diff}}$.`],
      conclusion: `The expression simplifies to $${base}^{${diff}}$.`,
      hint: `When dividing powers with the same base, SUBTRACT the exponents!`,
    };
  }

  if (nameL.includes('power-of-a-power') || nameL.includes('power of a power')) {
    const base = prng.pick([2, 3, 5, 'y']);
    const p1 = prng.int(2, 4);
    const p2 = prng.int(3, 5);
    const prod = p1 * p2;
    const correctAns = `$${base}^{${prod}}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Power-of-a-power rule of exponents',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: '(a^m)^n = a^(mn)',
        representation: 'equation', context: 'Laws of indices',
        numbersUsed: [p1, p2, prod], expectedReasoning: 'Multiply exponents when raising a power to another power',
        conceptKey: 'POWER_OF_A_POWER_RULE',
      },
      questionText: `Simplify using the power of a power rule:\n\n$$(${base}^{${p1}})^{${p2}}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${base}^{${p1 + p2}}$`, // added instead
        `$${base}^{${prod + 1}}$`,
        `$${base}^{${Math.pow(p1, p2)}}$`,
      ], prng),
      given: `Expression $(${base}^{${p1}})^{${p2}}$.`,
      required: `Single power.`,
      method: `Multiply exponents: $(a^m)^n = a^{m \\times n}$.`,
      steps: [`$${p1} \\times ${p2} = ${prod}$.`, `Result $= ${base}^{${prod}}$.`],
      conclusion: `$(${base}^{${p1}})^{${p2}} = ${base}^{${prod}}$.`,
      hint: `Multiply the inside exponent by the outside exponent!`,
    };
  }

  // 5. Divisibility Rules & Fibonacci & Sequences (Stages 35, 36)
  if (nameL.includes('fibonacci')) {
    const fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    const idx = prng.pick([5, 6, 7, 8, 9]);
    const term = fib[idx];
    const prev1 = fib[idx - 1];
    const prev2 = fib[idx - 2];
    const correctAns = `$${term}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Fibonacci sequence next term rule',
        questionType: 'pattern_recognition', difficulty, mathematicalOperation: 'F(n) = F(n-1) + F(n-2)',
        representation: 'list', context: 'Famous sequences',
        numbersUsed: [prev2, prev1, term], expectedReasoning: 'Each term in Fibonacci sequence is sum of the two preceding terms',
        conceptKey: 'FIBONACCI_SEQUENCE_TERM',
      },
      questionText: `Find the next number in the Fibonacci sequence:\n\n$$${fib[idx - 3]},\\; ${prev2},\\; ${prev1},\\; \\underline{\\quad ? \\quad}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${term + 1}$`,
        `$${term - 1}$`,
        `$${prev1 * 2}$`,
      ], prng),
      given: `Preceding terms $${prev2}$ and $${prev1}$.`,
      required: `Next term.`,
      method: `Add the two previous numbers together: $${prev2} + ${prev1} = ${term}$.`,
      steps: [`$${prev2} + ${prev1} = ${term}$.`],
      conclusion: `The next Fibonacci number is $${term}$.`,
      hint: `Add the last two numbers together to get the next one!`,
    };
  }

  // Zero exponent & Negative exponents (Stage 32)
  if (nameL.includes('zero exponent')) {
    const b = prng.pick([5, 8, 12, 27, 99]);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Zero exponent rule a^0 = 1',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'a^0 = 1',
        representation: 'equation', context: 'Laws of indices',
        numbersUsed: [b, 1], expectedReasoning: 'Any non-zero real number raised to power 0 equals exactly 1',
        conceptKey: 'ZERO_EXPONENT_RULE',
      },
      questionText: `According to the zero exponent rule, evaluate the expression:\n\n$$${b}^0$$`,
      correctAnswer: `$1$`,
      rawDistractors: [`$0$`, `$${b}$`, `$-1$`],
      given: `Expression $${b}^0$.`,
      required: `Value.`,
      method: `For any non-zero base $a$, $a^0 = 1$.`,
      steps: [`$${b}^0 = 1$.`],
      conclusion: `$${b}^0 = 1$.`,
      hint: `Any non-zero number to the power of 0 always equals 1!`,
    };
  }

  if (nameL.includes('negative exponent')) {
    const b = prng.pick([2, 3, 4, 5]);
    const exp = prng.pick([1, 2, 3]);
    const correctAns = `$${fmtFrac(1, `${b}^{${exp}}`)}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Negative exponent rule a^(-n) = 1 / a^n',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'a^(-n) = 1/a^n',
        representation: 'equation', context: 'Laws of indices',
        numbersUsed: [b, exp], expectedReasoning: 'A negative exponent denotes the reciprocal with a positive exponent',
        conceptKey: 'NEGATIVE_EXPONENT_RECIPROCAL_RULE',
      },
      questionText: `Express the following power with a positive exponent:\n\n$$${b}^{-${exp}}$$`,
      correctAnswer: correctAns,
      rawDistractors: [
        `$-${b}^{${exp}}$`,
        `$-${exp * b}$`,
        `$${fmtFrac(exp, b)}$`,
      ],
      given: `Expression $${b}^{-${exp}}$.`,
      required: `Equivalent form with positive exponent.`,
      method: `Apply negative index rule: $a^{-n} = \\dfrac{1}{a^n}$.`,
      steps: [`$${b}^{-${exp}} = \\dfrac{1}{${b}^{${exp}}}$.`],
      conclusion: `The expression equals $\\dfrac{1}{${b}^{${exp}}}$.`,
      hint: `A negative power flips into the denominator with a positive power.`,
    };
  }

  // Divisibility rules (Stage 35)
  if (nameL.includes('divisibility')) {
    if (nameL.includes('3') || nameL.includes('9')) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Divisibility rule for 3 and 9',
          questionType: 'reasoning', difficulty, mathematicalOperation: 'Sum of digits divisibility test',
          representation: 'definition', context: 'Divisibility tests',
          numbersUsed: [3, 9], expectedReasoning: 'A number is divisible by 3 (or 9) if the sum of its digits is divisible by 3 (or 9)',
          conceptKey: 'DIVISIBILITY_RULE_3_AND_9',
        },
        questionText: `What is the mathematical divisibility rule for $3$?`,
        correctAnswer: `A whole number is divisible by $3$ if the sum of its digits is divisible by $3$`,
        rawDistractors: [
          `The number must end in $3, 6,$ or $9$`,
          `The number must be an odd number`,
          `The last two digits must be divisible by $3$`,
        ],
        given: `Divisibility by 3 test.`,
        required: `Rule statement.`,
        method: `If the sum of digits is a multiple of $3$, the entire number is divisible by $3$.`,
        steps: [`Add all the digits: if the sum is divisible by $3$, the number is divisible by $3$.`],
        conclusion: `The sum of digits must be divisible by 3.`,
        hint: `Add up all the digits in the number and check if that sum is in the 3 times table.`,
      };
    }
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Divisibility rule for 5',
        questionType: 'reasoning', difficulty, mathematicalOperation: 'Final digit divisibility test',
        representation: 'definition', context: 'Divisibility tests',
        numbersUsed: [5], expectedReasoning: 'A number is divisible by 5 if and only if its last digit is 0 or 5',
        conceptKey: 'DIVISIBILITY_RULE_FOR_5',
      },
      questionText: `Which condition guarantees that an integer is divisible by $5$?`,
      correctAnswer: `Its final digit must be either $0$ or $5$`,
      rawDistractors: [
        `The sum of all its digits must equal $5$`,
        `The number must be an odd multiple of $5$ only`,
        `Its first digit must be $5$`,
      ],
      given: `Divisibility by 5.`,
      required: `Condition.`,
      method: `Multiples of $5$ always terminate in $0$ or $5$.`,
      steps: [`Last digit must be $0$ or $5$.`],
      conclusion: `The last digit is 0 or 5.`,
      hint: `Look at the last digit of the number.`,
    };
  }

  // Triangular numbers & Sequences (Stage 36, 39)
  if (nameL.includes('triangular')) {
    const n = prng.pick([4, 5, 6, 7]);
    const tVal = (n * (n + 1)) / 2;
    const correctAns = `$${tVal}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Calculating triangular numbers T_n = n(n+1)/2',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'T_n = n(n+1)/2',
        representation: 'equation', context: 'Figurate numbers',
        numbersUsed: [n, tVal], expectedReasoning: 'Triangular number formula T_n = n(n+1)/2',
        conceptKey: 'TRIANGULAR_NUMBER_CALC',
      },
      questionText: `What is the $${n}\\text{th}$ triangular number ($T_{${n}}$)?\n\n(Recall the sequence: $1, 3, 6, 10, \\dots$)`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${tVal + n}$`, `$${tVal - n}$`, `$${n * n}$`], prng),
      given: `Term $n = ${n}$.`,
      required: `$T_{${n}}$.`,
      method: `$T_n = \\dfrac{n(n + 1)}{2} = \\dfrac{${n}(${n + 1})}{2} = ${tVal}$.`,
      steps: [
        `$${n} \\times ${n + 1} = ${n * (n + 1)}$.`,
        `$\\dfrac{${n * (n + 1)}}{2} = ${tVal}$.`,
      ],
      conclusion: `The $${n}\\text{th}$ triangular number is $${tVal}$.`,
      hint: `Use the formula: $\\dfrac{n(n + 1)}{2}$.`,
    };
  }

  if (nameL.includes('common difference') || nameL.includes('arithmetic progression') || nameL.includes('arithmetic sequence')) {
    const a1 = prng.int(4, 15);
    const d = prng.pick([3, 4, 5, 7, 8]);
    const terms = [a1, a1 + d, a1 + 2 * d, a1 + 3 * d];
    const correctAns = `$${d}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Finding common difference of arithmetic sequence',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'd = a_(n+1) - a_n',
        representation: 'list', context: 'Arithmetic progressions',
        numbersUsed: [...terms, d], expectedReasoning: 'Subtract any term from the subsequent term to find d',
        conceptKey: 'COMMON_DIFFERENCE_AP_CALC',
      },
      questionText: `What is the common difference ($d$) of the arithmetic progression:\n\n$$${terms.join(',\\; ')},\\; \\dots$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${d + 1}$`, `$${Math.max(1, d - 1)}$`, `$${a1}$`], prng),
      given: `Arithmetic sequence $${terms.join(', ')}$.`,
      required: `Common difference $d$.`,
      method: `$d = a_2 - a_1 = ${terms[1]} - ${terms[0]} = ${d}$.`,
      steps: [`$${terms[1]} - ${terms[0]} = ${d}$.`],
      conclusion: `The common difference is $${d}$.`,
      hint: `Subtract the first number from the second number.`,
    };
  }

  if (nameL.includes('absolute-value') || nameL.includes('absolute value equations')) {
    const c = prng.int(2, 6);
    const k = prng.int(4, 9);
    const sol1 = c + k;
    const sol2 = c - k;
    const correctAns = `$x = ${sol1}$ or $x = ${sol2}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Solving linear absolute value equation |x - c| = k',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'x - c = +-k',
        representation: 'equation', context: 'Algebraic equations',
        numbersUsed: [c, k, sol1, sol2], expectedReasoning: '|x - c| = k implies x - c = k or x - c = -k',
        conceptKey: 'ABSOLUTE_VALUE_EQUATION_SOLVE',
      },
      questionText: `Solve the absolute value equation for $x$:\n\n$$|x - ${c}| = ${k}$$`,
      correctAnswer: correctAns,
      rawDistractors: [
        `$x = ${sol1}$ only`,
        `$x = ${k}$ or $x = -${k}$`,
        `$x = ${sol1 + 1}$ or $x = ${sol2 - 1}$`,
      ],
      given: `Equation $|x - ${c}| = ${k}$.`,
      required: `Solutions for $x$.`,
      method: `Split into two linear equations: $x - ${c} = ${k} \\implies x = ${sol1}$, and $x - ${c} = -${k} \\implies x = ${sol2}$.`,
      steps: [
        `Case 1: $x - ${c} = ${k} \\implies x = ${k} + ${c} = ${sol1}$.`,
        `Case 2: $x - ${c} = -${k} \\implies x = -${k} + ${c} = ${sol2}$.`,
      ],
      conclusion: `$x = ${sol1}$ or $x = ${sol2}$.`,
      hint: `Remember that the expression inside the absolute value bars can equal positive $${k}$ or negative $-${k}$.`,
    };
  }

  // Default Exponents Product Rule
  const base = prng.pick([2, 3, 5, 7]);
  const p1 = prng.int(2, 5);
  const p2 = prng.int(3, 6);
  const pSum = p1 + p2;
  const correctAns = `$${base}^{${pSum}}$`;

  return {
    blueprint: {
      mainTopic: topicArea, subtopic: topicName, skill: `Index rule for ${topicName}`,
      questionType: 'direct_calculation', difficulty, mathematicalOperation: 'a^m * a^n = a^(m+n)',
      representation: 'equation', context: 'Laws of indices',
      numbersUsed: [base, p1, p2, pSum], expectedReasoning: 'When multiplying powers with the same base, add exponents',
      conceptKey: `EXPONENTS_STAGE_${stageId}_SKILL`,
    },
    questionText: `Simplify the exponential expression using the product rule of indices:\n\n$$${base}^{${p1}} \\times ${base}^{${p2}}$$`,
    correctAnswer: correctAns,
    rawDistractors: makeUniqueDistractors(correctAns, [
      `$${base}^{${p1 * p2}}$`,
      `$${base * base}^{${pSum}}$`,
      `$${base}^{${pSum + 1}}$`,
    ], prng),
    given: `Expression $${base}^{${p1}} \\times ${base}^{${p2}}$.`,
    required: `Simplified single power.`,
    method: `Keep the base identical and add exponents: $a^m \\times a^n = a^{m+n}$.`,
    steps: [`Add exponents: $${p1} + ${p2} = ${pSum}$. Single power: $${base}^{${pSum}}$.`],
    conclusion: `The expression simplifies to $${base}^{${pSum}}$.`,
    hint: `When bases are the same, ADD the exponents!`,
  };
}
