import { DifficultyTier } from '../../types';
import { PRNG, gcd, lcm, generateNumericalDistractors } from '../generators/shared';
import { GeneratedTopicArtifact, makeUniqueDistractors, sample } from './types';

export function generateNumberSenseTopic(
  topicName: string,
  topicArea: string,
  stageId: number,
  difficulty: DifficultyTier,
  prng: PRNG,
  diffMultiplier: number
): GeneratedTopicArtifact {
  const nameL = topicName.toLowerCase();

  // =========================================================================
  // STAGE 1: BASIC NUMBER TYPES & SETS (Topics 1 - 10)
  // =========================================================================

  // 1. Even numbers
  // 1. Even numbers
  if (nameL.includes('even number') || nameL.includes('even-number') || nameL === 'even numbers') {
    const isAlgebraic = prng.next() > 0.4;
    if (isAlgebraic) {
      const vars = ['n', 'k', 'm', 'p', 'x'];
      const v = prng.pick(vars);
      const shift = prng.pick([0, 2, 4, 6]);
      const correctAns = shift === 0 ? `$2${v}$` : `$2${v} + ${shift}$`;
      const distractors = shift === 0
        ? [`$2${v} + 1$`, `$${v} + 1$`, `$2${v} - 1$`]
        : [`$2${v} + 1$`, `$${v} + ${shift}$`, `$2${v} - 3$`];
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Algebraic definition of even numbers',
          questionType: 'reasoning', difficulty, mathematicalOperation: '2n divisibility',
          representation: 'algebraic_form', context: 'Number theory',
          numbersUsed: [2, shift], expectedReasoning: 'Any multiple of 2 (or 2n + 2k) is always an even number',
          conceptKey: `EVEN_NUMBER_ALGEBRAIC_${v}_${shift}`,
        },
        questionText: `If $${v}$ represents any integer, which algebraic expression always evaluates to an even number?`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, distractors, prng),
        given: `Integer variable $${v}$.`,
        required: `Expression that is always even.`,
        method: `An even number is defined as any multiple of $2$. Since $2${v}$ is divisible by $2$, ${shift === 0 ? `$2${v}$` : `$2${v} + ${shift}$`} is always even.`,
        steps: [
          `Multiplication of any integer by $2$ produces an exact multiple of $2$.`,
          `Therefore, ${correctAns} is always even.`,
        ],
        conclusion: `${correctAns} is always an even number.`,
        hint: `An even number is any multiple of 2 (divisible by 2 with no remainder).`,
      };
    } else {
      const base = prng.int(10, 80) * 2;
      const evenVal = base + prng.pick([2, 4, 6, 8]);
      const oddVals = [evenVal + 1, evenVal - 1, evenVal + 3];
      const allVals = prng.shuffle([evenVal, ...oddVals]);
      const correctAns = `$${evenVal}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Identifying even numbers',
          questionType: 'identification', difficulty, mathematicalOperation: 'Divisibility by 2',
          representation: 'list', context: 'Arithmetic properties',
          numbersUsed: [evenVal, ...oddVals], expectedReasoning: 'Even numbers end in 0, 2, 4, 6, or 8 and are divisible by 2',
          conceptKey: `EVEN_NUMBER_IDENT_${evenVal}`,
        },
        questionText: `From the numbers $\\{${allVals.map(v => `$${v}$`).join(', ')}\\}$, which value is an even number (divisible by $2$)?`,
        correctAnswer: correctAns,
        rawDistractors: oddVals.map(v => `$${v}$`),
        given: `Numbers: ${allVals.map(v => `$${v}$`).join(', ')}.`,
        required: `The even number.`,
        method: `Check the last digit: even numbers end in $0, 2, 4, 6,$ or $8$.`,
        steps: [
          `$${evenVal}$ ends in $${evenVal % 10}$, which is divisible by $2$.`,
          `The other candidates all end in odd digits.`,
        ],
        conclusion: `$${evenVal}$ is the even number.`,
        hint: `Look at the last digit: it must be 0, 2, 4, 6, or 8.`,
      };
    }
  }

  // 2. Odd numbers
  if (nameL.includes('odd number') || nameL.includes('odd-number') || nameL === 'odd numbers') {
    const isAlgebraic = prng.next() > 0.4;
    if (isAlgebraic) {
      const vars = ['k', 'n', 'm', 'p', 'y'];
      const v = prng.pick(vars);
      const oddShift = prng.pick([1, 3, 5]);
      const correctAns = `$2${v} + ${oddShift}$`;
      const distractors = [`$2${v}$`, `$4${v}$`, `$2${v} + 2$`];
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Algebraic definition of odd numbers',
          questionType: 'reasoning', difficulty, mathematicalOperation: '2k + 1 form',
          representation: 'algebraic_form', context: 'Number theory',
          numbersUsed: [2, oddShift], expectedReasoning: 'An odd number is one more than a multiple of 2 (2k + odd)',
          conceptKey: `ODD_NUMBER_ALGEBRAIC_${v}_${oddShift}`,
        },
        questionText: `If $${v}$ represents any integer, which algebraic expression will always evaluate to an odd number?`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, distractors, prng),
        given: `Integer variable $${v}$.`,
        required: `Expression that is always odd.`,
        method: `An odd number leaves remainder $1$ when divided by $2$, having form $2${v} + ${oddShift}$.`,
        steps: [
          `$2${v}$ is always even.`,
          `Adding $${oddShift}$ to an even number gives an odd number: $2${v} + ${oddShift}$.`,
        ],
        conclusion: `$2${v} + ${oddShift}$ is always odd.`,
        hint: `Adding an odd number to any even number ($2${v}$) results in an odd number.`,
      };
    } else {
      const base = prng.int(10, 80) * 2;
      const oddVal = base + prng.pick([1, 3, 5, 7, 9]);
      const evenVals = [oddVal - 1, oddVal + 1, oddVal + 3];
      const allVals = prng.shuffle([oddVal, ...evenVals]);
      const correctAns = `$${oddVal}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Identifying odd numbers',
          questionType: 'identification', difficulty, mathematicalOperation: 'Parity check',
          representation: 'list', context: 'Arithmetic properties',
          numbersUsed: [oddVal, ...evenVals], expectedReasoning: 'Odd numbers end in 1, 3, 5, 7, or 9',
          conceptKey: `ODD_NUMBER_IDENT_${oddVal}`,
        },
        questionText: `From the set of numbers $\\{${allVals.map(v => `$${v}$`).join(', ')}\\}$, which value is an odd number?`,
        correctAnswer: correctAns,
        rawDistractors: evenVals.map(v => `$${v}$`),
        given: `Numbers: ${allVals.map(v => `$${v}$`).join(', ')}.`,
        required: `The odd number.`,
        method: `Check the final digit: odd numbers end in $1, 3, 5, 7,$ or $9$.`,
        steps: [
          `$${oddVal}$ ends in $${oddVal % 10}$, which is an odd digit.`,
          `The other candidates all end in even digits.`,
        ],
        conclusion: `$${oddVal}$ is odd.`,
        hint: `Look at the last digit: it must be 1, 3, 5, 7, or 9.`,
      };
    }
  }

  // 3. Zero
  if (nameL.includes('zero') && !nameL.includes('exponent')) {
    const mode = prng.int(0, 2);
    if (mode === 0) {
      const n = prng.int(7, 85);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Division by zero property',
          questionType: 'reasoning', difficulty, mathematicalOperation: 'n / 0',
          representation: 'definition', context: 'Arithmetic fundamentals',
          numbersUsed: [n, 0], expectedReasoning: 'Division by zero is mathematically undefined',
          conceptKey: `DIVISION_BY_ZERO_${n}`,
        },
        questionText: `Evaluate the mathematical expression $${n} \\div 0$:`,
        correctAnswer: `Undefined`,
        rawDistractors: [`$0$`, `$1$`, `$${n}$`],
        given: `Expression $${n} \\div 0$.`,
        required: `Result of division.`,
        method: `Division asks what number times $0$ equals $${n}$. Since any number $\\times 0 = 0 \\ne ${n}$, the operation is undefined.`,
        steps: [
          `Assume $${n} \\div 0 = x \\implies x \\times 0 = ${n}$.`,
          `Since $x \\times 0 = 0$, no number satisfies this equation.`,
          `Therefore, division by zero is undefined.`,
        ],
        conclusion: `Division by zero is undefined.`,
        hint: `You can never divide by zero in mathematics; the result does not exist (undefined)!`,
      };
    } else if (mode === 1) {
      const d = prng.int(4, 45);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Zero divided by a non-zero integer',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: '0 / n',
          representation: 'equation', context: 'Arithmetic fundamentals',
          numbersUsed: [0, d], expectedReasoning: 'Zero divided by any non-zero number is 0',
          conceptKey: `ZERO_DIVIDED_BY_${d}`,
        },
        questionText: `Evaluate the division expression $0 \\div ${d}$:`,
        correctAnswer: `$0$`,
        rawDistractors: [`$1$`, `$${d}$`, `Undefined`],
        given: `Expression $0 \\div ${d}$.`,
        required: `Value of division.`,
        method: `Zero divided by any non-zero integer equals zero.`,
        steps: [`$0 \\div ${d} = 0$.`],
        conclusion: `The result is $0$.`,
        hint: `If you divide zero items among ${d} people, everyone receives 0 items.`,
      };
    } else {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Sign property of zero',
          questionType: 'reasoning', difficulty, mathematicalOperation: 'Sign of 0',
          representation: 'definition', context: 'Number properties',
          numbersUsed: [0], expectedReasoning: 'Zero is the neutral origin, neither positive nor negative',
          conceptKey: 'ZERO_SIGN_PROPERTY',
        },
        questionText: `On the real number line, which statement correctly classifies the sign of the number $0$?`,
        correctAnswer: `Neutral (neither positive nor negative)`,
        rawDistractors: [
          `Strictly positive`,
          `Strictly negative`,
          `Both positive and negative simultaneously`,
        ],
        given: `The number $0$.`,
        required: `Sign classification.`,
        method: `Positive numbers are $> 0$ and negative numbers are $< 0$. Zero is the boundary separating them.`,
        steps: [`Zero is neither positive nor negative.`],
        conclusion: `Zero is neutral.`,
        hint: `Zero is the center dividing line between positive and negative numbers.`,
      };
    }
  }

  // 4. Natural numbers & Whole numbers & Counting numbers
  if (nameL.includes('natural number') || nameL === 'whole numbers' || nameL === 'whole number' || nameL.includes('counting number')) {
    if (nameL === 'whole numbers' || nameL === 'whole number') {
      const sampleNats = [prng.int(2, 9), prng.int(11, 25), prng.int(30, 75)];
      const candidates = prng.shuffle([0, ...sampleNats]);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Distinguishing whole numbers from natural numbers',
          questionType: 'identification', difficulty, mathematicalOperation: 'Set difference',
          representation: 'list', context: 'Set theory',
          numbersUsed: candidates, expectedReasoning: '0 is in W but not in N',
          conceptKey: `WHOLE_VS_NAT_${candidates.join('_')}`,
        },
        questionText: `From the set $\\{${candidates.map(c => `$${c}$`).join(', ')}\\}$, which value belongs to the whole numbers ($\\mathbb{W}$) but is NOT a natural number ($\\mathbb{N}$)?`,
        correctAnswer: `$0$`,
        rawDistractors: sampleNats.map(n => `$${n}$`),
        given: `Candidates: ${candidates.map(c => `$${c}$`).join(', ')}.`,
        required: `Element in W but not in N.`,
        method: `$\\mathbb{W} = \\{0, 1, 2, \\dots\\}$ and $\\mathbb{N} = \\{1, 2, \\dots\\}$. Zero is the unique element in $\\mathbb{W} \\setminus \\mathbb{N}$.`,
        steps: [`$0 \\in \\mathbb{W}$ and $0 \\notin \\mathbb{N}$.`],
        conclusion: `$0$ is in whole numbers but not natural numbers.`,
        hint: `Which number means none or empty set?`,
      };
    }

    if (nameL.includes('counting number')) {
      const k = prng.int(1, 15);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'First counting number identification',
          questionType: 'identification', difficulty, mathematicalOperation: 'Sequence start',
          representation: 'definition', context: 'Foundational math',
          numbersUsed: [k], expectedReasoning: 'Counting naturally starts with 1 object',
          conceptKey: `COUNTING_NUMBER_POS_${k}`,
        },
        questionText: k === 1
          ? `What is the first (smallest) number in the sequence of counting numbers?`
          : `In the sequence of counting numbers ($1, 2, 3, \\dots$), what is the $${k}\\text{th}$ counting number?`,
        correctAnswer: `$${k}$`,
        rawDistractors: [`$${k - 1}$`, `$${k + 1}$`, `$0$`],
        given: `Sequence of counting numbers.`,
        required: `$${k}\\text{th}$ counting number.`,
        method: `Counting starts at $1$ and increases by $1$ at each step.`,
        steps: [`The sequence is $1, 2, 3, \\dots, ${k}$.`],
        conclusion: `The value is $${k}$.`,
        hint: `Counting begins at 1.`,
      };
    }

    // Natural numbers
    const natVal = prng.int(6, 95);
    const negVal = prng.int(3, 25);
    const fracDenom = prng.pick([3, 4, 5, 7]);
    const fracNum = prng.int(1, fracDenom - 1);
    const candidates = prng.shuffle([
      `$${natVal}$`,
      `$-${negVal}$`,
      `$0$`,
      `$\\dfrac{${fracNum}}{${fracDenom}}$`,
    ]);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Natural numbers membership',
        questionType: 'identification', difficulty, mathematicalOperation: 'Set membership',
        representation: 'list', context: 'Set theory',
        numbersUsed: [natVal, negVal], expectedReasoning: 'Natural numbers N = {1, 2, 3, ...} are positive counting numbers',
        conceptKey: `NATURAL_NUMBER_MEMBERSHIP_${natVal}`,
      },
      questionText: `From the candidates $\\{${candidates.join(', ')}\\}$, select the value belonging to the set of natural numbers ($\\mathbb{N}$):`,
      correctAnswer: `$${natVal}$`,
      rawDistractors: [`$-${negVal}$`, `$0$`, `$\\dfrac{${fracNum}}{${fracDenom}}$`],
      given: `Candidates: ${candidates.join(', ')}.`,
      required: `Natural number.`,
      method: `Natural numbers are strictly positive integers: $1, 2, 3, \\dots$`,
      steps: [
        `$-${negVal}$ is negative.`,
        `$0$ is not a natural number.`,
        `$\\dfrac{${fracNum}}{${fracDenom}}$ is fractional.`,
        `$${natVal} \\in \\mathbb{N}$.`,
      ],
      conclusion: `$${natVal}$ is a natural number.`,
      hint: `Natural numbers are positive whole numbers starting from 1.`,
    };
  }

  // 5. Positive and Negative numbers & Integers
  if (nameL.includes('positive number') || nameL.includes('negative number') || nameL.includes('integers') || nameL.includes('integer properties')) {
    if (nameL.includes('positive number')) {
      const posVal = prng.int(14, 85);
      const negVal1 = prng.int(6, 28);
      const negVal2 = prng.int(30, 75);
      const candidates = prng.shuffle([`$${posVal}$`, `$0$`, `$-${negVal1}$`, `$-${negVal2}$`]);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Identifying positive numbers',
          questionType: 'identification', difficulty, mathematicalOperation: 'Sign identification',
          representation: 'list', context: 'Real numbers',
          numbersUsed: [posVal, negVal1, negVal2], expectedReasoning: 'A positive number is strictly greater than 0 with no negative sign',
          conceptKey: `POSITIVE_NUMBER_IDENT_${posVal}`,
        },
        questionText: `From the values $\\{${candidates.join(', ')}\\}$, which value is a positive number?`,
        correctAnswer: `$${posVal}$`,
        rawDistractors: [`$0$`, `$-${negVal1}$`, `$-${negVal2}$`],
        given: `Values: ${candidates.join(', ')}.`,
        required: `The positive value.`,
        method: `Positive numbers are values strictly greater than zero. Note that zero is neutral.`,
        steps: [
          `$0$ is neutral.`,
          `$-${negVal1}$ and $-${negVal2}$ are negative.`,
          `$${posVal}$ is strictly positive.`,
        ],
        conclusion: `$${posVal}$ is a positive number.`,
        hint: `Positive numbers are greater than zero without a negative sign.`,
      };
    }

    if (nameL.includes('negative number')) {
      const negVal = prng.int(8, 65);
      const pos1 = prng.int(5, 30);
      const pos2 = prng.int(35, 80);
      const candidates = prng.shuffle([`$-${negVal}$`, `$0$`, `$${pos1}$`, `$${pos2}$`]);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Identifying negative numbers',
          questionType: 'identification', difficulty, mathematicalOperation: 'Negative sign identification',
          representation: 'list', context: 'Real numbers',
          numbersUsed: [negVal, pos1, pos2], expectedReasoning: 'Negative numbers are strictly less than 0 and preceded by a minus sign',
          conceptKey: `NEGATIVE_NUMBER_IDENT_${negVal}`,
        },
        questionText: `From the list $\\{${candidates.join(', ')}\\}$, which number is a negative number?`,
        correctAnswer: `$-${negVal}$`,
        rawDistractors: [`$0$`, `$${pos1}$`, `$${pos2}$`],
        given: `Values: ${candidates.join(', ')}.`,
        required: `Negative number.`,
        method: `Values less than zero are negative: $-${negVal} < 0$.`,
        steps: [`$-${negVal}$ has a minus sign and lies to the left of 0.`],
        conclusion: `$-${negVal}$ is negative.`,
        hint: `Negative numbers are strictly less than zero.`,
      };
    }

    // Integers
    const intVal = -prng.int(12, 65);
    const fracDenom = prng.pick([3, 5, 7]);
    const fracNum = prng.int(1, fracDenom - 1);
    const decVal = (prng.int(11, 89) / 10).toFixed(1);
    const candidates = prng.shuffle([
      `$${intVal}$`,
      `$\\dfrac{${fracNum}}{${fracDenom}}$`,
      `$${decVal}$`,
      `$\\sqrt{7}$`,
    ]);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Integer set identification',
        questionType: 'identification', difficulty, mathematicalOperation: 'Integer classification',
        representation: 'list', context: 'Number sets',
        numbersUsed: [intVal], expectedReasoning: 'Integers Z include all positive and negative whole numbers and 0',
        conceptKey: `INTEGER_SET_IDENT_${intVal}`,
      },
      questionText: `From the set $\\{${candidates.join(', ')}\\}$, which number is an integer ($\\mathbb{Z}$)?`,
      correctAnswer: `$${intVal}$`,
      rawDistractors: [`$\\dfrac{${fracNum}}{${fracDenom}}$`, `$${decVal}$`, `$\\sqrt{7}$`],
      given: `Candidates: ${candidates.join(', ')}.`,
      required: `Integer value.`,
      method: `Integers are whole numbers without fractional or decimal parts: $${intVal} \\in \\mathbb{Z}$.`,
      steps: [
        `$\\dfrac{${fracNum}}{${fracDenom}}$ is fractional.`,
        `$${decVal}$ has a decimal portion.`,
        `$\\sqrt{7}$ is irrational.`,
        `$${intVal}$ is a negative whole number.`,
      ],
      conclusion: `$${intVal}$ is an integer.`,
      hint: `An integer is a whole number (positive, negative, or zero) with no fraction or decimal part.`,
    };
  }

  // 6. Prime numbers & Composite numbers
  if (nameL.includes('prime number') || nameL.includes('prime-number')) {
    const primesPool = [17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    const compositesPool = [21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 63, 65, 69, 75, 77, 81, 85, 87, 91, 93, 95];
    const p = prng.pick(primesPool);
    const comps = sample(prng, compositesPool, 3);
    const candidates = prng.shuffle([`$${p}$`, ...comps.map(c => `$${c}$`)]);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Prime number identification',
        questionType: 'identification', difficulty, mathematicalOperation: 'Divisibility check',
        representation: 'list', context: 'Number theory',
        numbersUsed: [p, ...comps], expectedReasoning: 'A prime number has exactly two distinct positive divisors: 1 and itself',
        conceptKey: `PRIME_NUMBER_IDENT_${p}`,
      },
      questionText: `From the list of numbers $\\{${candidates.join(', ')}\\}$, which one is a prime number?`,
      correctAnswer: `$${p}$`,
      rawDistractors: comps.map(c => `$${c}$`),
      given: `Candidates: ${candidates.join(', ')}.`,
      required: `The prime number.`,
      method: `Identify the integer whose only factors are $1$ and itself.`,
      steps: [
        `Check factors: ${comps.map(c => `$${c}$ is composite`).join(', ')}.`,
        `$${p}$ cannot be divided evenly by any integer other than $1$ and $${p}$.`,
      ],
      conclusion: `$${p}$ is prime.`,
      hint: `A prime number cannot be divided evenly by any number other than 1 and itself.`,
    };
  }

  if (nameL.includes('composite')) {
    const composites = [21, 25, 27, 33, 35, 39, 49, 51, 55, 57, 65, 77, 85, 91];
    const primes = [13, 17, 19, 23, 29, 31, 41, 43, 47, 53, 59, 61, 71, 73, 79, 83];
    const c = prng.pick(composites);
    const prs = sample(prng, primes, 3);
    const candidates = prng.shuffle([`$${c}$`, ...prs.map(p => `$${p}$`)]);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Composite number identification',
        questionType: 'identification', difficulty, mathematicalOperation: 'Factorization check',
        representation: 'list', context: 'Number theory',
        numbersUsed: [c, ...prs], expectedReasoning: 'A composite number has more than two distinct positive factors',
        conceptKey: `COMPOSITE_NUMBER_IDENT_${c}`,
      },
      questionText: `From the numbers $\\{${candidates.join(', ')}\\}$, which one is a composite number (having more than two factors)?`,
      correctAnswer: `$${c}$`,
      rawDistractors: prs.map(p => `$${p}$`),
      given: `Numbers: ${candidates.join(', ')}.`,
      required: `Composite number.`,
      method: `A composite number has factors strictly other than 1 and itself.`,
      steps: [
        `$${c}$ has factors other than 1 and $${c}$.`,
        `The other candidates are all primes.`,
      ],
      conclusion: `$${c}$ is composite.`,
      hint: `Look for the number that can be factored into smaller whole numbers.`,
    };
  }

  // =========================================================================
  // STAGE 2: FACTORS, MULTIPLES, PLACE VALUE, EXPANDED FORM (Topics 11 - 20)
  // =========================================================================
  if (nameL.includes('highest common factor') || nameL.includes('hcf') || nameL.includes('gcd') || nameL.includes('common factors')) {
    const g = prng.pick([4, 6, 8, 12, 14, 15, 16, 18]);
    const m1 = prng.pick([2, 3, 5]);
    const m2 = prng.pick([7, 9, 11]);
    const a = g * m1;
    const b = g * m2;
    const ansG = gcd(a, b);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Finding Greatest Common Divisor',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'GCD Euclidean algorithm',
        representation: 'equation', context: 'Divisibility',
        numbersUsed: [a, b, ansG], expectedReasoning: 'Find largest integer that divides both a and b without remainder',
        conceptKey: 'HCF_GCD_CALCULATION',
      },
      questionText: `Find the Highest Common Factor (HCF / GCD) of $${a}$ and $${b}$:`,
      correctAnswer: `$${ansG}$`,
      rawDistractors: makeUniqueDistractors(`$${ansG}$`, [`$${ansG * 2}$`, `$${Math.max(1, Math.floor(ansG / 2))}$`, `$${ansG + 1}$`], prng),
      given: `Numbers $${a}$ and $${b}$.`,
      required: `$\\text{HCF}(${a}, ${b})$.`,
      method: `Find the largest integer that divides both $${a}$ and $${b}$.`,
      steps: [`$\\gcd(${a}, ${b}) = ${ansG}$.`],
      conclusion: `$\\text{HCF} = ${ansG}$.`,
      hint: `What is the largest number that divides evenly into both?`,
    };
  }

  // Multiples (Topic 13)
  if (nameL === 'multiples' || (nameL.includes('multiples') && !nameL.includes('common') && !nameL.includes('least'))) {
    const base = prng.pick([4, 6, 7, 8, 9, 12, 15]);
    const multVariant = prng.int(0, 2);
    if (multVariant === 0) {
      const k = prng.pick([4, 5, 6, 7, 8]);
      const ans = base * k;
      const nonMults = [base * (k - 1) + 2, base * (k + 1) - 3, base * k + 5];
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Identifying a multiple of a number',
          questionType: 'identification', difficulty, mathematicalOperation: 'Multiple check: ans % base === 0',
          representation: 'list', context: 'Divisibility',
          numbersUsed: [base, ans, ...nonMults], expectedReasoning: 'A multiple is obtained by multiplying the number by an integer',
          conceptKey: 'MULTIPLE_OF_NUMBER_IDENTIFICATION',
        },
        questionText: `Which of the following numbers is a multiple of $${base}$?`,
        correctAnswer: `$${ans}$`,
        rawDistractors: nonMults.map(m => `$${m}$`),
        given: `Base number $${base}$.`,
        required: `A multiple of $${base}$.`,
        method: `Check each option: $${ans} = ${base} \\times ${k}$, which has zero remainder.`,
        steps: [`$${base} \\times ${k} = ${ans}$.`],
        conclusion: `$${ans}$ is a multiple of $${base}$.`,
        hint: `Multiply $${base}$ by whole numbers to see which option matches.`,
      };
    } else if (multVariant === 1) {
      const k = prng.pick([4, 5, 6, 7, 8, 9]);
      const ans = base * k;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Finding the k-th multiple',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'k * base',
          representation: 'equation', context: 'Arithmetic progression',
          numbersUsed: [base, k, ans], expectedReasoning: 'The k-th multiple is k times the number',
          conceptKey: 'KTH_MULTIPLE_CALCULATION',
        },
        questionText: `What is the ${k}th multiple of $${base}$?`,
        correctAnswer: `$${ans}$`,
        rawDistractors: makeUniqueDistractors(`$${ans}$`, [`$${ans - base}$`, `$${ans + base}$`, `$${ans + 2}$`], prng),
        given: `Base $${base}$, index $k = ${k}$.`,
        required: `The ${k}th multiple.`,
        method: `Multiply $${base} \\times ${k} = ${ans}$.`,
        steps: [`$${base} \\times ${k} = ${ans}$.`],
        conclusion: `The ${k}th multiple of $${base}$ is $${ans}$.`,
        hint: `Compute $${base} \\times ${k}$.`,
      };
    } else {
      const k = prng.pick([3, 4, 5, 6]);
      const total = base * k;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Applied multiple word problem',
          questionType: 'word_problem', difficulty, mathematicalOperation: 'Total = items_per_box * count',
          representation: 'word_problem', context: 'Packaging',
          numbersUsed: [base, total], expectedReasoning: 'Total count must be divisible by box capacity',
          conceptKey: 'APPLIED_MULTIPLE_WORD_PROBLEM',
        },
        questionText: `A bakery packs rolls into bags of $${base}$. Which total count of rolls can be packaged into full bags with none left over?`,
        correctAnswer: `$${total}$`,
        rawDistractors: [total + 1, total + 2, total + 3].map(t => `$${t}$`),
        given: `Bag capacity: $${base}$ rolls.`,
        required: `Total count divisible by $${base}$.`,
        method: `Divide each option by $${base}$ to find the one with zero remainder.`,
        steps: [`$${total} \\div ${base} = ${k}$ full bags.`],
        conclusion: `$${total}$ rolls can be packed with no remainder.`,
        hint: `Look for a number that divides evenly by $${base}$.`,
      };
    }
  }

  if (nameL.includes('least common multiple') || nameL.includes('lcm') || nameL.includes('common multiples')) {
    const a = prng.pick([4, 6, 8, 9, 10, 12]);
    const b = prng.pick([6, 8, 10, 12, 14, 15]);
    const ansL = lcm(a, b);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Finding Least Common Multiple',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'LCM = (a * b) / GCD',
        representation: 'equation', context: 'Divisibility',
        numbersUsed: [a, b, ansL], expectedReasoning: 'Find smallest positive integer divisible by both a and b',
        conceptKey: 'LCM_CALCULATION',
      },
      questionText: `Find the Least Common Multiple (LCM) of $${a}$ and $${b}$:`,
      correctAnswer: `$${ansL}$`,
      rawDistractors: makeUniqueDistractors(`$${ansL}$`, [`$${a * b}$`, `$${ansL * 2}$`, `$${Math.max(2, Math.floor(ansL / 2))}$`], prng),
      given: `Numbers $${a}$ and $${b}$.`,
      required: `$\\text{LCM}(${a}, ${b})$.`,
      method: `$\\text{LCM} = \\dfrac{${a} \\times ${b}}{\\gcd(${a}, ${b})} = ${ansL}$.`,
      steps: [`$\\text{LCM}(${a}, ${b}) = ${ansL}$.`],
      conclusion: `$\\text{LCM} = ${ansL}$.`,
      hint: `Find the smallest multiple that appears in both times tables.`,
    };
  }

  if (nameL.includes('standard form') && !nameL.includes('exponent')) {
    const th = prng.int(3, 9);
    const hu = prng.int(1, 9);
    const te = prng.int(1, 9);
    const un = prng.int(1, 9);
    const total = th * 1000 + hu * 100 + te * 10 + un;
    const correctAns = `$${total.toLocaleString()}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Converting expanded form to standard form',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Place value composition',
        representation: 'place_value', context: 'Base-10 numbers',
        numbersUsed: [total], expectedReasoning: 'Combine place value addends into standard numeral',
        conceptKey: 'STANDARD_FORM_COMPOSITION',
      },
      questionText: `Write the expanded expression as a single standard number:\n\n$$${th * 1000} + ${hu * 100} + ${te * 10} + ${un}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${(total + 100).toLocaleString()}$`,
        `$${(total - 10).toLocaleString()}$`,
        `$${(th * 100 + hu * 10 + te).toLocaleString()}$`,
      ], prng),
      given: `Expanded form $${th * 1000} + ${hu * 100} + ${te * 10} + ${un}$.`,
      required: `Standard number.`,
      method: `Combine thousands, hundreds, tens, and units into positional notation.`,
      steps: [`$${th * 1000} + ${hu * 100} + ${te * 10} + ${un} = ${total}$.`],
      conclusion: `The standard number is $${total.toLocaleString()}$.`,
      hint: `Combine the digits according to their place values: thousands, hundreds, tens, and units.`,
    };
  }

  if (nameL.includes('place value') || nameL.includes('face value') || nameL.includes('expanded form')) {
    const d4 = prng.int(2, 9);
    const d3 = prng.int(1, 9);
    const d2 = prng.int(0, 9);
    const d1 = prng.int(1, 9);
    const total = d4 * 1000 + d3 * 100 + d2 * 10 + d1;

    if (nameL.includes('face value')) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Face value identification',
          questionType: 'identification', difficulty, mathematicalOperation: 'Digit extraction',
          representation: 'place_value', context: 'Base-10 number system',
          numbersUsed: [total, d3], expectedReasoning: 'Face value is simply the digit itself regardless of position',
          conceptKey: 'FACE_VALUE_IDENTIFICATION',
        },
        questionText: `Identify the face value of the digit $${d3}$ in the numeral $${total.toLocaleString()}$:`,
        correctAnswer: `$${d3}$`,
        rawDistractors: [`$${d3 * 100}$`, `$${d3 * 10}$`, `$${d3 * 1000}$`],
        given: `Number $${total.toLocaleString()}$, target digit $${d3}$.`,
        required: `Face value.`,
        method: `The face value of any digit is the digit itself, irrespective of its position.`,
        steps: [`The face value is $${d3}$.`],
        conclusion: `Face value $= ${d3}$.`,
        hint: `Face value is the actual digit itself, NOT its place value!`,
      };
    }

    if (nameL.includes('expanded form')) {
      const correctAns = `$${d4 * 1000} + ${d3 * 100} + ${d2 * 10} + ${d1}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Expanded form decomposition',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Place value expansion',
          representation: 'place_value', context: 'Base-10 number system',
          numbersUsed: [total], expectedReasoning: 'Break number down into sum of each digit multiplied by its place value',
          conceptKey: 'EXPANDED_FORM_CONVERSION',
        },
        questionText: `Express the number $${total.toLocaleString()}$ in expanded form:`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$${d4 * 100} + ${d3 * 10} + ${d2} + ${d1}$`,
          `$${d4 * 1000} + ${d3 * 10} + ${d2 * 100} + ${d1}$`,
          `$${d4 * 1000} + ${d3 * 100} + ${d1}$`,
        ], prng),
        given: `Standard number $${total.toLocaleString()}$.`,
        required: `Expanded notation.`,
        method: `Multiply each digit by its positional power of 10.`,
        steps: [`$${total} = (${d4} \\times 1000) + (${d3} \\times 100) + (${d2} \\times 10) + (${d1} \\times 1)$.`],
        conclusion: `$${total} = ${correctAns}$.`,
        hint: `Break each digit into its thousands, hundreds, tens, and units parts.`,
      };
    }

    // Default place value
    const pvVariant = prng.int(0, 1);
    const pVal = d3 * 100;
    if (pvVariant === 1) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Place value identification by value',
          questionType: 'identification', difficulty, mathematicalOperation: 'Positional value matching',
          representation: 'place_value', context: 'Base-10 number system',
          numbersUsed: [total, d3, pVal], expectedReasoning: 'Identify which digit corresponds to the specified place value',
          conceptKey: 'PLACE_VALUE_DIGIT_MATCH',
        },
        questionText: `In the number $${total.toLocaleString()}$, which digit holds a place value of $${pVal.toLocaleString()}$?`,
        correctAnswer: `$${d3}$`,
        rawDistractors: [`$${d4}$`, `$${d2}$`, `$${d1}$`],
        given: `Number $${total.toLocaleString()}$, place value target $${pVal.toLocaleString()}$.`,
        required: `The digit holding that place value.`,
        method: `$${pVal} = ${d3} \\times 100$, so the digit is $${d3}$.`,
        steps: [`The digit in the hundreds place with value $${pVal}$ is $${d3}$.`],
        conclusion: `The digit is $${d3}$.`,
        hint: `Divide the place value by its positional multiplier to find the digit.`,
      };
    }

    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Place value calculation',
        questionType: 'identification', difficulty, mathematicalOperation: 'Positional value calculation',
        representation: 'place_value', context: 'Base-10 number system',
        numbersUsed: [total, d3, pVal], expectedReasoning: 'Place value = digit * value of place (hundreds)',
        conceptKey: 'PLACE_VALUE_CALCULATION',
      },
      questionText: `In the number $${total.toLocaleString()}$, what is the place value of the digit $${d3}$?`,
      correctAnswer: `$${pVal.toLocaleString()}$`,
      rawDistractors: [`$${d3}$`, `$${pVal * 10}$`, `$${Math.max(1, Math.floor(pVal / 10))}$`],
      given: `Number $${total.toLocaleString()}$, digit $${d3}$ in hundreds position.`,
      required: `Place value.`,
      method: `$\\text{Place value} = \\text{digit} \\times \\text{place} = ${d3} \\times 100 = ${pVal}$.`,
      steps: [`$${d3} \\times 100 = ${pVal}$.`],
      conclusion: `The place value is $${pVal.toLocaleString()}$.`,
      hint: `Multiply the digit by the column it sits in (units, tens, hundreds, thousands).`,
    };
  }

  // =========================================================================
  // STAGE 3: COMPARING, ORDERING, NUMBER LINES, ROUNDING (Topics 21 - 30)
  // =========================================================================
  // Estimation (Topic 30)
  if (nameL.includes('estimation')) {
    const a = prng.pick([38, 47, 56, 68, 79]);
    const b = prng.pick([21, 32, 43, 51, 62]);
    const roundA = Math.round(a / 10) * 10;
    const roundB = Math.round(b / 10) * 10;
    const estSum = roundA + roundB;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Estimating sum by rounding to tens',
        questionType: 'estimation', difficulty, mathematicalOperation: 'Sum estimation',
        representation: 'equation', context: 'Mental estimation',
        numbersUsed: [a, b, estSum], expectedReasoning: 'Round each addend to the nearest ten and compute the estimated sum',
        conceptKey: 'ESTIMATING_SUM_TO_TENS',
      },
      questionText: `Estimate the sum by rounding each number to the nearest ten before adding:\n\n$$${a} + ${b}$$`,
      correctAnswer: `$${estSum}$`,
      rawDistractors: makeUniqueDistractors(`$${estSum}$`, [`$${estSum + 10}$`, `$${estSum - 10}$`, `$${a + b}$`], prng),
      given: `Addends $${a}$ and $${b}$.`,
      required: `Estimated sum to nearest ten.`,
      method: `$${a} \\approx ${roundA}$, $${b} \\approx ${roundB}$. Sum: $${roundA} + ${roundB} = ${estSum}$.`,
      steps: [`$${a} \\to ${roundA}$ and $${b} \\to ${roundB}$.`, `$${roundA} + ${roundB} = ${estSum}$.`],
      conclusion: `The estimated sum is $${estSum}$.`,
      hint: `Round each number to the nearest ten first, then add them.`,
    };
  }

  // Approximation (Topic 31)
  if (nameL.includes('approximation')) {
    const a = prng.pick([19, 21, 29, 31, 39, 41]);
    const b = prng.pick([4, 5, 6, 8]);
    const roundA = Math.round(a / 10) * 10;
    const approxProd = roundA * b;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Approximating product using rounded factors',
        questionType: 'estimation', difficulty, mathematicalOperation: 'Product approximation',
        representation: 'equation', context: 'Practical estimation',
        numbersUsed: [a, b, approxProd], expectedReasoning: 'Approximate the product by rounding the multi-digit factor',
        conceptKey: 'PRODUCT_APPROXIMATION',
      },
      questionText: `Which value is the closest approximation to the product:\n\n$$${a} \\times ${b}$$`,
      correctAnswer: `$${approxProd}$`,
      rawDistractors: makeUniqueDistractors(`$${approxProd}$`, [`$${approxProd + 20}$`, `$${approxProd - 20}$`, `$${a * b}$`], prng),
      given: `Factors $${a}$ and $${b}$.`,
      required: `Close approximation.`,
      method: `Round $${a}$ to $${roundA}$: $${roundA} \\times ${b} = ${approxProd}$.`,
      steps: [`$${a} \\approx ${roundA}$, so $${roundA} \\times ${b} = ${approxProd}$.`],
      conclusion: `The best approximation is $${approxProd}$.`,
      hint: `Round $${a}$ to the nearest multiple of ten, then multiply.`,
    };
  }

  // Rounding numbers (Topic 29)
  if (nameL.includes('rounding')) {
    const hundreds = prng.int(2, 9);
    const tens = prng.int(1, 9);
    const units = prng.int(1, 9);
    const n = hundreds * 100 + tens * 10 + units;
    const rounded = tens >= 5 ? (hundreds + 1) * 100 : hundreds * 100;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Rounding to nearest hundred',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Rounding rule',
        representation: 'equation', context: 'Estimation',
        numbersUsed: [n, rounded], expectedReasoning: 'Examine tens digit: if >= 5 round up, if < 5 round down',
        conceptKey: 'ROUNDING_TO_NEAREST_HUNDRED',
      },
      questionText: `Round the number $${n}$ to the nearest hundred:`,
      correctAnswer: `$${rounded}$`,
      rawDistractors: makeUniqueDistractors(`$${rounded}$`, [
        `$${hundreds * 100}$`,
        `$${(hundreds + 1) * 100}$`,
        `$${Math.round(n / 10) * 10}$`,
      ], prng),
      given: `Number $${n}$.`,
      required: `Rounded value to nearest hundred.`,
      method: `Look at the tens digit ($${tens}$). If $\\ge 5$, round up; otherwise round down.`,
      steps: [`Tens digit is $${tens}$. Rounded: $${rounded}$.`],
      conclusion: `$${n}$ rounded to nearest hundred is $${rounded}$.`,
      hint: `Look at the tens digit: 5 or higher rounds UP, 4 or lower rounds DOWN.`,
    };
  }

  if (nameL.includes('number line') || nameL.includes('distance between')) {
    const p1 = -prng.int(3, 9);
    const p2 = prng.int(4, 12);
    const dist = p2 - p1;
    const correctAns = `$${dist}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Distance between points on a number line',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: '|p2 - p1| distance',
        representation: 'number_line', context: 'Coordinate number line',
        numbersUsed: [p1, p2, dist], expectedReasoning: 'Distance is the absolute difference between coordinates on a line',
        conceptKey: 'NUMBER_LINE_DISTANCE',
      },
      questionText: `On a number line, what is the distance between the points $${p1}$ and $${p2}$?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${p2 + p1}$`,
        `$${dist + 2}$`,
        `$${Math.max(1, dist - 2)}$`,
      ], prng),
      given: `Points $${p1}$ and $${p2}$.`,
      required: `Distance.`,
      method: `$\\text{Distance} = |${p2} - (${p1})| = ${p2} + ${Math.abs(p1)} = ${dist}$.`,
      steps: [`$${p2} - (${p1}) = ${dist}$.`],
      conclusion: `The distance is $${dist}$.`,
      hint: `Count the units between the negative number and the positive number (or subtract: right minus left).`,
    };
  }

  // =========================================================================
  // STAGE 4: SUCCESSOR, PREDECESSOR, ABSOLUTE VALUE (Topics 31 - 40)
  // =========================================================================
  if (nameL.includes('successor') || nameL.includes('predecessor')) {
    const n = prng.int(199, 999);
    const isSucc = nameL.includes('successor');
    const ans = isSucc ? n + 1 : n - 1;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: `${isSucc ? 'Successor' : 'Predecessor'} of a number`,
        questionType: 'direct_calculation', difficulty, mathematicalOperation: isSucc ? 'n + 1' : 'n - 1',
        representation: 'equation', context: 'Discrete numbers',
        numbersUsed: [n, ans], expectedReasoning: isSucc ? 'Successor is the number immediately following (n + 1)' : 'Predecessor is the number immediately preceding (n - 1)',
        conceptKey: isSucc ? 'SUCCESSOR_CALCULATION' : 'PREDECESSOR_CALCULATION',
      },
      questionText: `What is the ${isSucc ? 'successor' : 'predecessor'} of the number $${n}$?`,
      correctAnswer: `$${ans}$`,
      rawDistractors: makeUniqueDistractors(`$${ans}$`, [
        `$${isSucc ? n - 1 : n + 1}$`,
        `$${n + 10}$`,
        `$${n - 10}$`,
      ], prng),
      given: `Number $${n}$.`,
      required: `${isSucc ? 'Successor' : 'Predecessor'}.`,
      method: isSucc ? `Add 1: $${n} + 1 = ${ans}$.` : `Subtract 1: $${n} - 1 = ${ans}$.`,
      steps: [`$${ans}$ immediately ${isSucc ? 'follows' : 'precedes'} $${n}$.`],
      conclusion: `The answer is $${ans}$.`,
      hint: isSucc ? `Successor means the very next number (+1).` : `Predecessor means the number just before (-1).`,
    };
  }

  if (nameL.includes('absolute value') || nameL.includes('magnitude')) {
    const val = -prng.int(14, 85);
    const absVal = Math.abs(val);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Absolute value evaluation',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: '|x| distance from zero',
        representation: 'equation', context: 'Integers',
        numbersUsed: [val, absVal], expectedReasoning: 'Absolute value represents non-negative distance from origin on number line',
        conceptKey: 'ABSOLUTE_VALUE_EVALUATION',
      },
      questionText: `Evaluate the absolute value expression:\n\n$$|${val}|$$`,
      correctAnswer: `$${absVal}$`,
      rawDistractors: [`$${val}$`, `$0$`, `$${-absVal - 1}$`],
      given: `Expression $|${val}|$.`,
      required: `Evaluated value.`,
      method: `The absolute value $|x|$ represents distance from 0, which is always non-negative.`,
      steps: [`$|${val}| = ${absVal}$.`],
      conclusion: `The absolute value is $${absVal}$.`,
      hint: `Absolute value is always positive or zero; it strips away the negative sign.`,
    };
  }

  // =========================================================================
  // STAGE 6: BODMAS / ORDER OF OPERATIONS & CHECKING (Topics 51 - 60)
  // =========================================================================
  if (nameL.includes('order of operations') || nameL.includes('bodmas') || nameL.includes('bidmas')) {
    const a = prng.int(4, 18);
    const b = prng.int(3, 8);
    const c = prng.int(4, 9);
    const d = prng.int(2, 6);
    const correct = a + b * c - d;
    const naiveLeftToRight = (a + b) * c - d;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Order of operations evaluation',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'BODMAS hierarchy',
        representation: 'equation', context: 'Arithmetic algebra',
        numbersUsed: [a, b, c, d, correct], expectedReasoning: 'Multiplication precedes addition and subtraction',
        conceptKey: 'BODMAS_EVALUATION',
      },
      questionText: `Evaluate the arithmetic expression following the order of operations (BODMAS/BIDMAS):\n\n$$${a} + ${b} \\times ${c} - ${d}$$`,
      correctAnswer: `$${correct}$`,
      rawDistractors: makeUniqueDistractors(`$${correct}$`, [
        `$${naiveLeftToRight}$`,
        `$${correct + b}$`,
        `$${correct - c}$`,
      ], prng),
      given: `Expression $${a} + ${b} \\times ${c} - ${d}$.`,
      required: `Correct numerical evaluation.`,
      method: `Multiplication takes precedence: compute $${b} \\times ${c}$ first.`,
      steps: [
        `Multiply first: $${b} \\times ${c} = ${b * c}$.`,
        `Add and subtract left to right: $${a} + ${b * c} - ${d} = ${correct}$.`,
      ],
      conclusion: `The value is $${correct}$.`,
      hint: `Always perform multiplication before addition or subtraction!`,
    };
  }

  // =========================================================================
  // STAGE 7: PATTERNS, SEQUENCES, CONSECUTIVE NUMBERS (Topics 61 - 70)
  // =========================================================================
  if (nameL.includes('consecutive')) {
    const start = prng.int(11, 35);
    const sum3 = start + (start + 1) + (start + 2);
    const correctAns = `$${start + 1}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Finding middle of consecutive numbers given sum',
        questionType: 'reasoning', difficulty, mathematicalOperation: 'n + (n+1) + (n+2) = 3(n+1)',
        representation: 'word_problem', context: 'Consecutive integers',
        numbersUsed: [sum3, start, start + 1], expectedReasoning: 'The sum of 3 consecutive integers equals 3 times the middle integer',
        conceptKey: 'CONSECUTIVE_INTEGERS_SUM',
      },
      questionText: `The sum of three consecutive integers is $${sum3}$. What is the middle integer?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${start}$`,
        `$${start + 2}$`,
        `$${Math.round(sum3 / 2)}$`,
      ], prng),
      given: `Three consecutive integers summing to $${sum3}$.`,
      required: `Middle integer.`,
      method: `Divide the total sum by $3$: $\\text{Middle integer} = \\dfrac{${sum3}}{3} = ${start + 1}$.`,
      steps: [
        `Let integers be $x - 1, x, x + 1$.`,
        `Sum $= 3x = ${sum3} \\implies x = ${start + 1}$.`,
      ],
      conclusion: `The middle integer is $${start + 1}$.`,
      hint: `Divide the total sum by 3 to find the middle number!`,
    };
  }

  if (nameL.includes('pattern') || nameL.includes('sequence') || nameL.includes('missing number') || nameL.includes('skip counting')) {
    const start = prng.int(3, 15);
    const diff = prng.pick([3, 4, 6, 7, 8, 9]);
    const terms = [start, start + diff, start + 2 * diff, start + 3 * diff, start + 4 * diff];
    const missing = terms[3];
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Finding missing term in arithmetic sequence',
        questionType: 'pattern_recognition', difficulty, mathematicalOperation: 'Common difference addition',
        representation: 'list', context: 'Arithmetic progressions',
        numbersUsed: [start, diff, missing], expectedReasoning: 'Find common difference d and add it to preceding term',
        conceptKey: 'ARITHMETIC_PATTERN_MISSING_TERM',
      },
      questionText: `Find the missing number in the following arithmetic sequence:\n\n$$${terms[0]},\\; ${terms[1]},\\; ${terms[2]},\\; \\underline{\\quad ? \\quad},\\; ${terms[4]}$$`,
      correctAnswer: `$${missing}$`,
      rawDistractors: makeUniqueDistractors(`$${missing}$`, [
        `$${missing + 1}$`,
        `$${missing - 1}$`,
        `$${missing + diff}$`,
      ], prng),
      given: `Terms $${terms[0]}, ${terms[1]}, ${terms[2]}, \\dots, ${terms[4]}$.`,
      required: `Missing 4th term.`,
      method: `Identify common difference $d = ${terms[1]} - ${terms[0]} = ${diff}$.`,
      steps: [
        `Difference: $d = ${diff}$.`,
        `4th term $= ${terms[2]} + ${diff} = ${missing}$.`,
      ],
      conclusion: `The missing term is $${missing}$.`,
      hint: `Find how much is added from one number to the next.`,
    };
  }

  // =========================================================================
  // STAGE 8: NUMBER BONDS, CARDINAL & ORDINAL NUMBERS (Topics 71 - 80)
  // =========================================================================
  if (nameL.includes('ordinal') || nameL.includes('cardinal')) {
    const ordinalPairs = [
      { num: 1, word: 'First', cardinal: 'One' },
      { num: 2, word: 'Second', cardinal: 'Two' },
      { num: 3, word: 'Third', cardinal: 'Three' },
      { num: 4, word: 'Fourth', cardinal: 'Four' },
      { num: 5, word: 'Fifth', cardinal: 'Five' },
      { num: 6, word: 'Sixth', cardinal: 'Six' },
      { num: 7, word: 'Seventh', cardinal: 'Seven' },
      { num: 8, word: 'Eighth', cardinal: 'Eight' },
      { num: 9, word: 'Ninth', cardinal: 'Nine' },
      { num: 10, word: 'Tenth', cardinal: 'Ten' },
      { num: 12, word: 'Twelfth', cardinal: 'Twelve' },
      { num: 20, word: 'Twentieth', cardinal: 'Twenty' },
    ];
    const chosen = prng.pick(ordinalPairs);
    const mode = prng.int(0, 3);

    if (mode === 0) {
      const distractors = prng.shuffle([chosen.cardinal, `$${chosen.num}$`, `Group of ${chosen.num}`, `Multiple of ${chosen.num}`]).slice(0, 3);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Distinguishing cardinal and ordinal numbers',
          questionType: 'identification', difficulty, mathematicalOperation: 'Ordinal linguistic classification',
          representation: 'definition', context: 'Counting theory',
          numbersUsed: [chosen.num], expectedReasoning: 'Ordinal numbers describe position in a sequence (e.g. 1st, 2nd, 3rd)',
          conceptKey: `ORDINAL_NUMBER_${chosen.word.toUpperCase()}`,
        },
        questionText: `Which of the following terms is an ordinal number representing a position in an ordered sequence?`,
        correctAnswer: chosen.word,
        rawDistractors: distractors,
        given: `Words: ${chosen.word}, ${distractors.join(', ')}.`,
        required: `Ordinal number.`,
        method: `Cardinal numbers tell quantity (${chosen.cardinal}), whereas ordinal numbers tell order or position (${chosen.word}).`,
        steps: [`${chosen.word} describes ranking or position in a sequence.`],
        conclusion: `${chosen.word} is an ordinal number.`,
        hint: `Ordinal numbers tell position or rank, like first, second, third.`,
      };
    } else if (mode === 1) {
      const athletes = ['Kwame', 'Ama', 'Kofi', 'Akua', 'Yaw', 'Abena', 'Esi', 'Kojo'];
      const person = prng.pick(athletes);
      const rank = chosen.num;
      const rankWord = chosen.word;
      const otherWords = ordinalPairs.filter(p => p.num !== rank).map(p => p.word);
      const distractors = prng.shuffle(otherWords).slice(0, 3);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Applying ordinal numbers in real-world sequences',
          questionType: 'word_problem', difficulty, mathematicalOperation: 'Position mapping',
          representation: 'word_problem', context: 'Athletics ranking',
          numbersUsed: [rank], expectedReasoning: 'Map finishing position to its ordinal word',
          conceptKey: `ORDINAL_POSITION_${rank}`,
        },
        questionText: `In a school competition, ${person} finished at position $${rank}$ in line. Which ordinal word describes ${person}'s place?`,
        correctAnswer: rankWord,
        rawDistractors: distractors,
        given: `Finishing position $${rank}$.`,
        required: `Ordinal word.`,
        method: `Position $${rank}$ corresponds to the ordinal number '${rankWord}'.`,
        steps: [`$${rank}$ -> ${rankWord}.`],
        conclusion: `${person}'s place is '${rankWord}'.`,
        hint: `Think of how position ${rank} is spoken in English (e.g., 1st -> First, 2nd -> Second).`,
      };
    } else if (mode === 2) {
      const otherOrdinals = prng.shuffle(ordinalPairs.filter(p => p.num !== chosen.num).map(p => p.word)).slice(0, 3);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Identifying cardinal numbers representing count',
          questionType: 'identification', difficulty, mathematicalOperation: 'Cardinal classification',
          representation: 'definition', context: 'Counting theory',
          numbersUsed: [chosen.num], expectedReasoning: 'Cardinal numbers describe total quantity or count rather than ranking',
          conceptKey: `CARDINAL_NUMBER_${chosen.cardinal.toUpperCase()}`,
        },
        questionText: `Which of the following words represents a cardinal number (telling 'how many' rather than order or position)?`,
        correctAnswer: chosen.cardinal,
        rawDistractors: otherOrdinals,
        given: `Words: ${chosen.cardinal}, ${otherOrdinals.join(', ')}.`,
        required: `Cardinal number.`,
        method: `'${chosen.cardinal}' specifies an amount or count, whereas the other options specify positions or rankings.`,
        steps: [`${chosen.cardinal} answers 'how many'.`],
        conclusion: `'${chosen.cardinal}' is a cardinal number.`,
        hint: `Cardinal numbers answer 'how many' (like one, two, three).`,
      };
    } else {
      const words = [
        { word: 'MATHS', len: 5 },
        { word: 'ALGEBRA', len: 7 },
        { word: 'NUMBER', len: 6 },
        { word: 'CIRCLE', len: 6 },
      ];
      const target = prng.pick(words);
      const pos = prng.int(1, target.len);
      const letter = target.word[pos - 1];
      const ordWord = ordinalPairs.find(p => p.num === pos)?.word || `${pos}th`;
      const otherLetters = Array.from(new Set(target.word.split('').filter(ch => ch !== letter)));
      while (otherLetters.length < 3) otherLetters.push(String.fromCharCode(65 + prng.int(0, 25)));
      const distractors = prng.shuffle(otherLetters).slice(0, 3);

      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Identifying elements by ordinal position',
          questionType: 'identification', difficulty, mathematicalOperation: 'Sequence index lookup',
          representation: 'word_problem', context: 'Word sequencing',
          numbersUsed: [pos], expectedReasoning: 'Count letters from left to right to find target position',
          conceptKey: `ORDINAL_SEQUENCE_LOOKUP_${pos}`,
        },
        questionText: `In the word '${target.word}', which letter occupies the ${ordWord.toLowerCase()} position from left to right?`,
        correctAnswer: `'${letter}'`,
        rawDistractors: distractors.map(ch => `'${ch}'`),
        given: `Word '${target.word}', position ${ordWord}.`,
        required: `Letter at position ${pos}.`,
        method: `Count characters starting from the first letter: position ${pos} is '${letter}'.`,
        steps: [`Position ${pos} corresponds to letter '${letter}'.`],
        conclusion: `The ${ordWord.toLowerCase()} letter is '${letter}'.`,
        hint: `Count letters starting with 1 at the beginning of the word.`,
      };
    }
  }

  if (nameL.includes('bond') || nameL.includes('fact families')) {
    const targetBond = nameL.includes('hundred') ? 100 : 10;
    const part = prng.int(targetBond === 100 ? 15 : 2, targetBond === 100 ? 85 : 8);
    const complement = targetBond - part;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: `Number bonds to ${targetBond}`,
        questionType: 'missing_value', difficulty, mathematicalOperation: 'Complement calculation',
        representation: 'equation', context: 'Mental arithmetic',
        numbersUsed: [part, targetBond, complement], expectedReasoning: 'Find the addend needed to reach the target sum',
        conceptKey: `NUMBER_BOND_${targetBond}`,
      },
      questionText: `What number bonds with $${part}$ to make $${targetBond}$?\n\n$$${part} + \\underline{\\quad ? \\quad} = ${targetBond}$$`,
      correctAnswer: `$${complement}$`,
      rawDistractors: generateNumericalDistractors(complement, prng, true, false).map(d => `$${d}$`),
      given: `Known part $${part}$, target sum $${targetBond}$.`,
      required: `Missing complement.`,
      method: `Subtract: $${targetBond} - ${part} = ${complement}$.`,
      steps: [`$${targetBond} - ${part} = ${complement}$.`],
      conclusion: `The number bond complement is $${complement}$.`,
      hint: `Subtract $${part}$ from $${targetBond}$.`,
    };
  }

  // =========================================================================
  // STAGE 9 & 10: COMPARISONS, DECOMPOSITION, MULTIPLICATIVE (Topics 81 - 100)
  // =========================================================================
  if (nameL.includes('multiplicative comparison')) {
    const times = prng.pick([3, 4, 5, 6, 8]);
    const baseVal = prng.int(7, 24);
    const totalVal = baseVal * times;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Multiplicative comparison',
        questionType: 'word_problem', difficulty, mathematicalOperation: 'Total = Factor * Base',
        representation: 'word_problem', context: 'Comparative quantities',
        numbersUsed: [times, baseVal, totalVal], expectedReasoning: 'Multiply the base quantity by the comparison multiplier',
        conceptKey: 'MULTIPLICATIVE_COMPARISON_PROBLEM',
      },
      questionText: `Kwame has $${baseVal}$ marbles. Kofi has $${times}$ times as many marbles as Kwame.\n\nHow many marbles does Kofi have?`,
      correctAnswer: `$${totalVal}$`,
      rawDistractors: makeUniqueDistractors(`$${totalVal}$`, [
        `$${baseVal + times}$`,
        `$${totalVal + baseVal}$`,
        `$${totalVal - times}$`,
      ], prng),
      given: `Kwame has $${baseVal}$, Kofi has $${times}$ times as many.`,
      required: `Kofi's marble count.`,
      method: `Multiply Kwame's count by $${times}$.`,
      steps: [`$${baseVal} \\times ${times} = ${totalVal}$.`],
      conclusion: `Kofi has $${totalVal}$ marbles.`,
      hint: `Multiply Kwame's amount by $${times}$.`,
    };
  }

  // Factors (Topic 12)
  if (nameL === 'factors' || nameL.includes('positive factor')) {
    const composite = prng.pick([24, 28, 30, 36, 42, 48, 54, 60]);
    // find all factors of composite
    const facs: number[] = [];
    for (let f = 1; f <= composite; f++) {
      if (composite % f === 0) facs.push(f);
    }
    const trueFac = prng.pick(facs.filter(f => f > 1 && f < composite));
    // find non-factors
    const nonFacs: number[] = [];
    let testNum = 2;
    while (nonFacs.length < 3 && testNum < composite) {
      if (composite % testNum !== 0) nonFacs.push(testNum);
      testNum++;
    }
    const correctAns = `$${trueFac}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Identifying a factor of a composite number',
        questionType: 'identification', difficulty, mathematicalOperation: 'Divisibility test',
        representation: 'list', context: 'Divisibility',
        numbersUsed: [composite, trueFac, ...nonFacs], expectedReasoning: 'A factor divides the number evenly with zero remainder',
        conceptKey: 'FACTOR_OF_NUMBER_IDENTIFICATION',
      },
      questionText: `Which of the following numbers is a factor of $${composite}$?`,
      correctAnswer: correctAns,
      rawDistractors: nonFacs.map(nf => `$${nf}$`),
      given: `Number $${composite}$. Candidates: $${trueFac}$, ${nonFacs.map(nf => `$${nf}$`).join(', ')}.`,
      required: `The factor of $${composite}$.`,
      method: `Divide $${composite}$ by each candidate. The one that divides with zero remainder is the factor.`,
      steps: [
        `$${composite} \\div ${trueFac} = ${composite / trueFac}$ (remainder $0$).`,
        `The other candidates do not divide $${composite}$ evenly.`,
      ],
      conclusion: `$${trueFac}$ is a factor of $${composite}$.`,
      hint: `Which number divides into $${composite}$ with no remainder leftover?`,
    };
  }

  // Number names (Topic 20)
  if (nameL.includes('number names') || nameL.includes('number name')) {
    const samples = [
      { num: 4500, words: 'Four thousand, five hundred' },
      { num: 3250, words: 'Three thousand, two hundred fifty' },
      { num: 8075, words: 'Eight thousand, seventy-five' },
      { num: 6100, words: 'Six thousand, one hundred' },
      { num: 9020, words: 'Nine thousand, twenty' },
    ];
    const picked = prng.pick(samples);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Writing standard number in words',
        questionType: 'identification', difficulty, mathematicalOperation: 'Numeral to verbal translation',
        representation: 'word_problem', context: 'Number nomenclature',
        numbersUsed: [picked.num], expectedReasoning: 'Translate place values to English number words',
        conceptKey: 'NUMBER_NAMES_WORD_FORM',
      },
      questionText: `What is the correct word name for the number $${picked.num.toLocaleString()}$?`,
      correctAnswer: picked.words,
      rawDistractors: makeUniqueDistractors(picked.words, [
        `${picked.words.replace('thousand', 'hundred')}`,
        `${picked.words.replace('hundred', 'thousand')}`,
        `${picked.words} and five`,
      ], prng),
      given: `Numeral: $${picked.num.toLocaleString()}$.`,
      required: `Word name.`,
      method: `Read thousands place, then hundreds place, then tens and ones.`,
      steps: [`$${picked.num.toLocaleString()}$ is written as "${picked.words}".`],
      conclusion: `The number name is ${picked.words}.`,
      hint: `Read each place value from left to right.`,
    };
  }

  // Comparing numbers & Ordering numbers & Ascending & Descending (Topics 21 - 24)
  if (nameL.includes('ascending order')) {
    const base = prng.pick([15, 30, 50, 75]);
    const nums = [base - 8, base - 2, base + 5, base + 12];
    const correctAns = `$$${nums.join(',\\; ')}$$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Arranging integers in ascending order',
        questionType: 'ordering', difficulty, mathematicalOperation: 'Ascending sort (least to greatest)',
        representation: 'list', context: 'Ordering',
        numbersUsed: nums, expectedReasoning: 'Arrange from smallest to largest value',
        conceptKey: 'ASCENDING_ORDER_INTEGERS',
      },
      questionText: `Which sequence shows the numbers correctly arranged in ascending order (from least to greatest)?`,
      correctAnswer: correctAns,
      rawDistractors: [
        `$$${[...nums].reverse().join(',\\; ')}$$`,
        `$$${[nums[1], nums[0], nums[3], nums[2]].join(',\\; ')}$$`,
        `$$${[nums[2], nums[3], nums[0], nums[1]].join(',\\; ')}$$`,
      ],
      given: `Numbers: ${nums.join(', ')}.`,
      required: `Ascending arrangement.`,
      method: `Ascending means increasing from smallest to largest.`,
      steps: [`Order: $${nums.join(' < ')}$.`],
      conclusion: `The ascending order is ${nums.join(', ')}.`,
      hint: `Ascending means going UP: start with the smallest number.`,
    };
  }

  if (nameL.includes('descending order')) {
    const base = prng.pick([20, 45, 60, 80]);
    const nums = [base + 15, base + 7, base - 3, base - 10];
    const correctAns = `$$${nums.join(',\\; ')}$$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Arranging integers in descending order',
        questionType: 'ordering', difficulty, mathematicalOperation: 'Descending sort (greatest to least)',
        representation: 'list', context: 'Ordering',
        numbersUsed: nums, expectedReasoning: 'Arrange from largest to smallest value',
        conceptKey: 'DESCENDING_ORDER_INTEGERS',
      },
      questionText: `Arrange the numbers $\\{${[nums[2], nums[0], nums[3], nums[1]].join(',\\; ')}\\}$ in descending order (from greatest to least):`,
      correctAnswer: correctAns,
      rawDistractors: [
        `$$${[...nums].reverse().join(',\\; ')}$$`,
        `$$${[nums[1], nums[0], nums[2], nums[3]].join(',\\; ')}$$`,
        `$$${[nums[3], nums[1], nums[0], nums[2]].join(',\\; ')}$$`,
      ],
      given: `Numbers: ${nums.join(', ')}.`,
      required: `Descending arrangement.`,
      method: `Descending means decreasing from greatest to least.`,
      steps: [`Order: $${nums.join(' > ')}$.`],
      conclusion: `The descending order is ${nums.join(', ')}.`,
      hint: `Descending means going DOWN: start with the biggest number.`,
    };
  }

  // Ordering numbers (Topic 22)
  if (nameL.includes('ordering numbers')) {
    const a = prng.int(20, 40);
    const b = a + prng.int(10, 25);
    const c = b + prng.int(10, 25);
    const scrambled = prng.shuffle([a, b, c]);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Ordering a three-number sequence',
        questionType: 'ordering', difficulty, mathematicalOperation: 'Strict ordering',
        representation: 'list', context: 'Sequencing',
        numbersUsed: [a, b, c], expectedReasoning: 'Determine the correct order of the given integers',
        conceptKey: 'ORDERING_THREE_NUMBERS',
      },
      questionText: `Given the values $\\{${scrambled.join(',\\; ')}\\}$, which number lies strictly between the other two?`,
      correctAnswer: `$${b}$`,
      rawDistractors: [`$${a}$`, `$${c}$`, `$${Math.round((a + c) / 2) + 2}$`],
      given: `Numbers $${scrambled.join(', ')}$.`,
      required: `The middle value in sorted order.`,
      method: `Sort values: $${a} < ${b} < ${c}$. The middle number is $${b}$.`,
      steps: [`Sorted order: $${a}$, followed by $${b}$, followed by $${c}$.`],
      conclusion: `The number between the other two is $${b}$.`,
      hint: `Find the smallest and largest values; the remaining one is in the middle.`,
    };
  }

  if (nameL.includes('comparing numbers')) {
    const n1 = prng.int(4100, 4800);
    const diff = prng.pick([15, 25, 50, 85, 120]);
    const n2 = n1 + diff;
    const askGreater = prng.next() > 0.5;
    const correctAns = askGreater ? `$${n2}$` : `$${n1}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Comparing two multi-digit numbers',
        questionType: 'comparison', difficulty, mathematicalOperation: 'Magnitude comparison',
        representation: 'numerical', context: 'Place value comparison',
        numbersUsed: [n1, n2], expectedReasoning: 'Compare digits from highest to lowest place value to find the greater/smaller value',
        conceptKey: 'COMPARING_FOUR_DIGIT_NUMBERS',
      },
      questionText: `Between $${n1}$ and $${n2}$, which number is ${askGreater ? 'greater' : 'smaller'}?`,
      correctAnswer: correctAns,
      rawDistractors: [
        askGreater ? `$${n1}$` : `$${n2}$`,
        `$${n1 - 50}$`,
        `$${n2 + 50}$`,
      ],
      given: `Values $${n1}$ and $${n2}$.`,
      required: `The ${askGreater ? 'greater' : 'smaller'} value.`,
      method: `Compare digits from left to right starting at the highest place value: $${n2}$ is greater than $${n1}$ by $${diff}$.`,
      steps: [`$${n2} - ${n1} = ${diff} > 0$, so $${n2}$ is greater than $${n1}$.`],
      conclusion: `The ${askGreater ? 'greater' : 'smaller'} number is ${correctAns}.`,
      hint: `Compare the place values from left to right (thousands, then hundreds, then tens, then units).`,
    };
  }

  // Counting forward & backward (Topics 26 - 27)
  if (nameL.includes('counting forward')) {
    const step = prng.pick([3, 4, 5, 10]);
    const start = prng.int(20, 50);
    const next1 = start + step;
    const next2 = next1 + step;
    const next3 = next2 + step;
    const correctAns = `$${next3}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Counting forward by constant step',
        questionType: 'pattern_recognition', difficulty, mathematicalOperation: 'Arithmetic sequence forward',
        representation: 'list', context: 'Counting',
        numbersUsed: [start, next1, next2, next3], expectedReasoning: 'Add step size to preceding term',
        conceptKey: 'COUNTING_FORWARD_STEP',
      },
      questionText: `Counting forward by $${step}$s, what is the next number in the sequence:\n\n$$${start},\\; ${next1},\\; ${next2},\\; \\underline{\\quad ? \\quad}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${next3 + step}$`, `$${next3 - 1}$`, `$${next2 + 1}$`], prng),
      given: `Sequence: $${start}, ${next1}, ${next2}$.`,
      required: `Next term.`,
      method: `Add $${step}$ to the last number: $${next2} + ${step} = ${next3}$.`,
      steps: [`$${next2} + ${step} = ${next3}$.`],
      conclusion: `The next number is $${next3}$.`,
      hint: `Add $${step}$ to the last number shown.`,
    };
  }

  if (nameL.includes('counting backward')) {
    const step = prng.pick([2, 5, 10]);
    const start = prng.int(60, 95);
    const prev1 = start - step;
    const prev2 = prev1 - step;
    const prev3 = prev2 - step;
    const correctAns = `$${prev3}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Counting backward by constant step',
        questionType: 'pattern_recognition', difficulty, mathematicalOperation: 'Arithmetic sequence backward',
        representation: 'list', context: 'Counting',
        numbersUsed: [start, prev1, prev2, prev3], expectedReasoning: 'Subtract step size from preceding term',
        conceptKey: 'COUNTING_BACKWARD_STEP',
      },
      questionText: `Counting backward by $${step}$s, what is the next number in the sequence:\n\n$$${start},\\; ${prev1},\\; ${prev2},\\; \\underline{\\quad ? \\quad}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${prev3 - step}$`, `$${prev3 + 1}$`, `$${prev2 - 1}$`], prng),
      given: `Sequence: $${start}, ${prev1}, ${prev2}$.`,
      required: `Next term.`,
      method: `Subtract $${step}$ from the last number: $${prev2} - ${step} = ${prev3}$.`,
      steps: [`$${prev2} - ${step} = ${prev3}$.`],
      conclusion: `The next number is $${prev3}$.`,
      hint: `Subtract $${step}$ from the last number shown.`,
    };
  }

  // Addition, Subtraction, Multiplication, Division (Topics 36 - 39)
  if (nameL === 'addition' || nameL === 'addition of whole numbers') {
    const a = prng.int(245, 680);
    const b = prng.int(135, 420);
    const sum = a + b;
    const correctAns = `$${sum}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Addition of whole numbers',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Whole number addition',
        representation: 'equation', context: 'Arithmetic',
        numbersUsed: [a, b, sum], expectedReasoning: 'Add digits with column regrouping',
        conceptKey: 'ADDITION_WHOLE_NUMBERS',
      },
      questionText: `Evaluate the addition of whole numbers:\n\n$$${a} + ${b}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${sum + 10}$`, `$${sum - 10}$`, `$${sum + 1}$`], prng),
      given: `Numbers $${a}$ and $${b}$.`,
      required: `Sum.`,
      method: `Add the two values column by column.`,
      steps: [`$${a} + ${b} = ${sum}$.`],
      conclusion: `The sum is $${sum}$.`,
      hint: `Add units first, then tens, then hundreds with carrying if needed.`,
    };
  }

  if (nameL === 'subtraction' || nameL === 'subtraction of whole numbers') {
    const a = prng.int(550, 920);
    const b = prng.int(145, 430);
    const diff = a - b;
    const correctAns = `$${diff}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Subtraction of whole numbers',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Whole number subtraction',
        representation: 'equation', context: 'Arithmetic',
        numbersUsed: [a, b, diff], expectedReasoning: 'Subtract digits with column borrowing',
        conceptKey: 'SUBTRACTION_WHOLE_NUMBERS',
      },
      questionText: `Calculate the difference:\n\n$$${a} - ${b}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${diff + 10}$`, `$${diff - 10}$`, `$${diff + 2}$`], prng),
      given: `Minuend $${a}$, Subtrahend $${b}$.`,
      required: `Difference.`,
      method: `Subtract column by column.`,
      steps: [`$${a} - ${b} = ${diff}$.`],
      conclusion: `The difference is $${diff}$.`,
      hint: `Subtract units first, regrouping (borrowing) from the tens if necessary.`,
    };
  }

  if (nameL === 'multiplication' || nameL === 'multiplication of whole numbers') {
    const a = prng.int(14, 38);
    const b = prng.int(12, 25);
    const prod = a * b;
    const correctAns = `$${prod}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Multiplication of whole numbers',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: '2-digit multiplication',
        representation: 'equation', context: 'Arithmetic',
        numbersUsed: [a, b, prod], expectedReasoning: 'Multiply using partial products and sum',
        conceptKey: 'MULTIPLICATION_WHOLE_NUMBERS',
      },
      questionText: `Calculate the product:\n\n$$${a} \\times ${b}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${prod + 10}$`, `$${prod - a}$`, `$${prod + b}$`], prng),
      given: `Factors $${a}$ and $${b}$.`,
      required: `Product.`,
      method: `Multiply $${a}$ by $${b}$.`,
      steps: [`$${a} \\times ${b} = ${prod}$.`],
      conclusion: `The product is $${prod}$.`,
      hint: `Multiply by the ones digit first, then by the tens digit, and add the results.`,
    };
  }

  if (nameL === 'division' || nameL === 'division of whole numbers') {
    const divisor = prng.pick([6, 7, 8, 9, 12]);
    const quotient = prng.int(12, 28);
    const dividend = divisor * quotient;
    const correctAns = `$${quotient}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Division of whole numbers',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Exact division',
        representation: 'equation', context: 'Arithmetic',
        numbersUsed: [dividend, divisor, quotient], expectedReasoning: 'Find the quotient of dividend / divisor',
        conceptKey: 'DIVISION_WHOLE_NUMBERS',
      },
      questionText: `Calculate the exact quotient:\n\n$$${dividend} \\div ${divisor}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${quotient + 1}$`, `$${quotient - 1}$`, `$${quotient + 2}$`], prng),
      given: `Dividend $${dividend}$, Divisor $${divisor}$.`,
      required: `Quotient.`,
      method: `Divide $${dividend}$ by $${divisor}$.`,
      steps: [`$${dividend} \\div ${divisor} = ${quotient}$.`],
      conclusion: `The quotient is $${quotient}$.`,
      hint: `What number multiplied by $${divisor}$ gives $${dividend}$?`,
    };
  }

  // STAGE 5: MENTAL MATH, COLUMN & LONG ARITHMETIC (Topics 44 - 50)
  if (nameL.includes('mental addition')) {
    const a = prng.int(25, 68);
    const b = prng.pick([19, 29, 39, 49, 15, 25, 35]);
    const ans = a + b;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Mental addition using compensation / decomposition',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Mental addition',
        representation: 'equation', context: 'Mental computation',
        numbersUsed: [a, b, ans], expectedReasoning: 'Add mentally using benchmark numbers',
        conceptKey: 'MENTAL_ADDITION_STRATEGY',
      },
      questionText: `Using mental addition strategies, calculate:\n\n$$${a} + ${b}$$`,
      correctAnswer: `$${ans}$`,
      rawDistractors: makeUniqueDistractors(`$${ans}$`, [`$${ans + 10}$`, `$${ans - 1}$`, `$${ans + 2}$`], prng),
      given: `Addends $${a}$ and $${b}$.`,
      required: `Mental sum.`,
      method: `Add tens first, then units: $${a} + ${b} = ${ans}$.`,
      steps: [`$${a} + ${b} = ${ans}$.`],
      conclusion: `The mental sum is $${ans}$.`,
      hint: `Round one number to the nearest ten, add, and then adjust.`,
    };
  }

  if (nameL.includes('mental subtraction')) {
    const a = prng.int(55, 95);
    const b = prng.pick([18, 19, 28, 29, 38, 39]);
    const ans = a - b;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Mental subtraction',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Mental subtraction',
        representation: 'equation', context: 'Mental computation',
        numbersUsed: [a, b, ans], expectedReasoning: 'Subtract mentally by decomposing subtrahend or counting up',
        conceptKey: 'MENTAL_SUBTRACTION_STRATEGY',
      },
      questionText: `Compute mentally:\n\n$$${a} - ${b}$$`,
      correctAnswer: `$${ans}$`,
      rawDistractors: makeUniqueDistractors(`$${ans}$`, [`$${ans + 10}$`, `$${ans - 10}$`, `$${ans + 2}$`], prng),
      given: `Minuend $${a}$, Subtrahend $${b}$.`,
      required: `Difference.`,
      method: `Subtract ${Math.round(b / 10) * 10} and adjust: $${a} - ${b} = ${ans}$.`,
      steps: [`$${a} - ${b} = ${ans}$.`],
      conclusion: `The difference is $${ans}$.`,
      hint: `Count up from $${b}$ to $${a}$ in easy steps.`,
    };
  }

  if (nameL.includes('mental multiplication')) {
    const a = prng.pick([12, 14, 15, 16, 18, 24, 25, 32]);
    const b = prng.pick([4, 5, 6, 8, 20]);
    const ans = a * b;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Mental multiplication',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Mental product',
        representation: 'equation', context: 'Mental arithmetic',
        numbersUsed: [a, b, ans], expectedReasoning: 'Use doubling/halving or place value partitioning',
        conceptKey: 'MENTAL_MULTIPLICATION_STRATEGY',
      },
      questionText: `Mentally evaluate the product:\n\n$$${a} \\times ${b}$$`,
      correctAnswer: `$${ans}$`,
      rawDistractors: makeUniqueDistractors(`$${ans}$`, [`$${ans + b}$`, `$${ans - b}$`, `$${ans + 10}$`], prng),
      given: `Factors $${a}$ and $${b}$.`,
      required: `Product.`,
      method: `Decompose $${a}$ into tens and ones or use doubling: $${a} \\times ${b} = ${ans}$.`,
      steps: [`$${a} \\times ${b} = ${ans}$.`],
      conclusion: `The product is $${ans}$.`,
      hint: `Break $${a}$ into parts, multiply each by $${b}$, and add the results.`,
    };
  }

  if (nameL.includes('mental division')) {
    const divisor = prng.pick([3, 4, 5, 6, 8]);
    const quotient = prng.int(12, 35);
    const dividend = divisor * quotient;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Mental division',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Mental quotient',
        representation: 'equation', context: 'Mental arithmetic',
        numbersUsed: [dividend, divisor, quotient], expectedReasoning: 'Partition dividend into friendly multiples of divisor',
        conceptKey: 'MENTAL_DIVISION_STRATEGY',
      },
      questionText: `Using mental math, evaluate the division:\n\n$$${dividend} \\div ${divisor}$$`,
      correctAnswer: `$${quotient}$`,
      rawDistractors: makeUniqueDistractors(`$${quotient}$`, [`$${quotient + 1}$`, `$${quotient - 1}$`, `$${quotient + 2}$`], prng),
      given: `Dividend $${dividend}$, Divisor $${divisor}$.`,
      required: `Quotient.`,
      method: `Partition $${dividend}$ into friendly parts divisible by $${divisor}$: quotient is $${quotient}$.`,
      steps: [`$${dividend} \\div ${divisor} = ${quotient}$.`],
      conclusion: `The quotient is $${quotient}$.`,
      hint: `Break the dividend into numbers in the times table of $${divisor}$.`,
    };
  }

  if (nameL.includes('column addition')) {
    const a = prng.int(145, 680);
    const b = prng.int(125, 590);
    const ans = a + b;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Column addition with carrying',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Column addition with regrouping',
        representation: 'equation', context: 'Standard written algorithm',
        numbersUsed: [a, b, ans], expectedReasoning: 'Align place values and carry across columns',
        conceptKey: 'COLUMN_ADDITION_ALGORITHM',
      },
      questionText: `Perform the column addition with carrying:\n\n$$\\begin{array}{rr} & ${a} \\\\ + & ${b} \\\\ \\hline \\end{array}$$`,
      correctAnswer: `$${ans}$`,
      rawDistractors: makeUniqueDistractors(`$${ans}$`, [`$${ans - 10}$`, `$${ans + 100}$`, `$${ans + 10}$`], prng),
      given: `Addends $${a}$ and $${b}$.`,
      required: `Sum.`,
      method: `Add units, then tens with carrying, then hundreds: $${a} + ${b} = ${ans}$.`,
      steps: [`$${a} + ${b} = ${ans}$.`],
      conclusion: `The sum is $${ans}$.`,
      hint: `Start with the units column on the right and remember to carry over.`,
    };
  }

  if (nameL.includes('column subtraction')) {
    const a = prng.int(520, 940);
    const b = prng.int(135, a - 50);
    const ans = a - b;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Column subtraction with regrouping',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Column subtraction with borrowing',
        representation: 'equation', context: 'Standard written algorithm',
        numbersUsed: [a, b, ans], expectedReasoning: 'Align digits and borrow/regroup across columns',
        conceptKey: 'COLUMN_SUBTRACTION_ALGORITHM',
      },
      questionText: `Perform the column subtraction with regrouping:\n\n$$\\begin{array}{rr} & ${a} \\\\ - & ${b} \\\\ \\hline \\end{array}$$`,
      correctAnswer: `$${ans}$`,
      rawDistractors: makeUniqueDistractors(`$${ans}$`, [`$${ans + 10}$`, `$${ans - 10}$`, `$${ans + 100}$`], prng),
      given: `Minuend $${a}$, Subtrahend $${b}$.`,
      required: `Difference.`,
      method: `Subtract column by column starting from units, borrowing when needed: $${a} - ${b} = ${ans}$.`,
      steps: [`$${a} - ${b} = ${ans}$.`],
      conclusion: `The difference is $${ans}$.`,
      hint: `If the top digit is smaller than the bottom digit, borrow 1 from the next column to the left.`,
    };
  }

  if (nameL.includes('long multiplication')) {
    const a = prng.int(23, 78);
    const b = prng.int(14, 46);
    const ans = a * b;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Long multiplication with 2-digit factors',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Long multiplication algorithm',
        representation: 'equation', context: 'Written algorithm',
        numbersUsed: [a, b, ans], expectedReasoning: 'Multiply partial products and sum them up',
        conceptKey: 'LONG_MULTIPLICATION_ALGORITHM',
      },
      questionText: `Calculate the product using long multiplication:\n\n$$${a} \\times ${b}$$`,
      correctAnswer: `$${ans.toLocaleString()}$`,
      rawDistractors: makeUniqueDistractors(`$${ans.toLocaleString()}$`, [`$${(ans + a).toLocaleString()}$`, `$${(ans - b).toLocaleString()}$`, `$${(ans + 100).toLocaleString()}$`], prng),
      given: `Factors $${a}$ and $${b}$.`,
      required: `Product.`,
      method: `Multiply $${a}$ by units digit of $${b}$, then by tens digit with a placeholder zero, and add partial products: $${a} \\times ${b} = ${ans}$.`,
      steps: [`$${a} \\times ${b} = ${ans}$.`],
      conclusion: `The product is $${ans.toLocaleString()}$.`,
      hint: `Find the two partial products and add them together.`,
    };
  }

  // Basic Tables and Facts (Topics 68 - 71)
  if (nameL.includes('multiplication tables')) {
    const f1 = prng.pick([6, 7, 8, 9]);
    const f2 = prng.pick([6, 7, 8, 9]);
    const prod = f1 * f2;
    const correctAns = `$${prod}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Multiplication table recall',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Multiplication fact',
        representation: 'equation', context: 'Times tables',
        numbersUsed: [f1, f2, prod], expectedReasoning: 'Recall times table product directly',
        conceptKey: 'MULTIPLICATION_TABLE_RECALL',
      },
      questionText: `From standard multiplication tables, calculate:\n\n$$${f1} \\times ${f2}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${prod + f1}$`, `$${prod - f2}$`, `$${prod + 2}$`], prng),
      given: `Factors $${f1}$ and $${f2}$.`,
      required: `Product.`,
      method: `Multiply $${f1}$ by $${f2}$.`,
      steps: [`$${f1} \\times ${f2} = ${prod}$.`],
      conclusion: `The result is $${prod}$.`,
      hint: `Recall your times tables for $${f1} \\times ${f2}$.`,
    };
  }

  if (nameL.includes('addition tables') || nameL.includes('subtraction facts') || nameL.includes('division facts')) {
    if (nameL.includes('subtraction facts')) {
      const b = prng.int(6, 9);
      const diff = prng.int(5, 9);
      const a = b + diff;
      const correctAns = `$${diff}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Basic subtraction fact fluency',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Subtraction fact',
          representation: 'equation', context: 'Arithmetic facts',
          numbersUsed: [a, b, diff], expectedReasoning: 'Subtract single digit from teen number',
          conceptKey: 'SUBTRACTION_FACTS_FLUENCY',
        },
        questionText: `Evaluate the basic subtraction fact:\n\n$$${a} - ${b}$$`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [`$${diff + 1}$`, `$${diff - 1}$`, `$${diff + 2}$`], prng),
        given: `Expression $${a} - ${b}$.`,
        required: `Difference.`,
        method: `Subtract $${b}$ from $${a}$.`,
        steps: [`$${a} - ${b} = ${diff}$.`],
        conclusion: `The difference is $${diff}$.`,
        hint: `How much do you need to add to $${b}$ to reach $${a}$?`,
      };
    }
    if (nameL.includes('division facts')) {
      const div = prng.int(4, 9);
      const q = prng.int(4, 9);
      const dd = div * q;
      const correctAns = `$${q}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Basic division fact fluency',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Division fact',
          representation: 'equation', context: 'Arithmetic facts',
          numbersUsed: [dd, div, q], expectedReasoning: 'Divide using related multiplication fact',
          conceptKey: 'DIVISION_FACTS_FLUENCY',
        },
        questionText: `Using basic division facts, evaluate:\n\n$$${dd} \\div ${div}$$`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [`$${q + 1}$`, `$${q - 1}$`, `$${q + 2}$`], prng),
        given: `Dividend $${dd}$, Divisor $${div}$.`,
        required: `Quotient.`,
        method: `Divide $${dd}$ by $${div}$.`,
        steps: [`$${dd} \\div ${div} = ${q}$.`],
        conclusion: `The quotient is $${q}$.`,
        hint: `What number times $${div}$ equals $${dd}$?`,
      };
    }
    const a = prng.int(6, 9);
    const b = prng.int(6, 9);
    const sum = a + b;
    const correctAns = `$${sum}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Basic addition fact recall',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Addition fact',
        representation: 'equation', context: 'Arithmetic facts',
        numbersUsed: [a, b, sum], expectedReasoning: 'Add two single digits',
        conceptKey: 'ADDITION_FACTS_FLUENCY',
      },
      questionText: `Recall the basic addition fact:\n\n$$${a} + ${b}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${sum + 1}$`, `$${sum - 1}$`, `$${sum + 2}$`], prng),
      given: `Addends $${a}$ and $${b}$.`,
      required: `Sum.`,
      method: `Add $${a}$ and $${b}$.`,
      steps: [`$${a} + ${b} = ${sum}$.`],
      conclusion: `The sum is $${sum}$.`,
      hint: `Add $${a}$ and $${b}$ together.`,
    };
  }

  // Counting in groups & One-to-one correspondence (Topics 76 - 82)
  if (nameL.includes('one-to-one correspondence')) {
    const mode = prng.int(0, 2);
    if (mode === 0) {
      const nStudents = prng.int(15, 35);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'One-to-one correspondence application',
          questionType: 'word_problem', difficulty, mathematicalOperation: 'Bijection cardinality deduction',
          representation: 'word_problem', context: 'Classroom distribution',
          numbersUsed: [nStudents], expectedReasoning: 'One-to-one correspondence guarantees equal set sizes',
          conceptKey: `ONE_TO_ONE_EQUAL_SETS_${nStudents}`,
        },
        questionText: `A teacher hands out textbooks to a classroom of $${nStudents}$ learners. If every learner receives exactly one textbook with none left over, what is the total number of textbooks?`,
        correctAnswer: `$${nStudents}$`,
        rawDistractors: [`$${nStudents + 1}$`, `$${nStudents - 1}$`, `$${nStudents * 2}$`],
        given: `$${nStudents}$ learners, one textbook per learner with none left over.`,
        required: `Total textbooks.`,
        method: `A one-to-one correspondence means each learner pairs with exactly one textbook, so the count of textbooks equals the count of learners ($${nStudents}$).`,
        steps: [`Count of books = Count of learners = $${nStudents}$.`],
        conclusion: `There are $${nStudents}$ textbooks.`,
        hint: `Each learner gets exactly one book, so the number of books matches the number of learners.`,
      };
    } else if (mode === 1) {
      const k = prng.int(6, 18);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Set cardinality under one-to-one correspondence',
          questionType: 'reasoning', difficulty, mathematicalOperation: 'Set bijection',
          representation: 'set_notation', context: 'Set theory',
          numbersUsed: [k], expectedReasoning: 'If two sets have a bijection, their cardinalities are equal: n(A) = n(B)',
          conceptKey: `ONE_TO_ONE_CARDINALITY_${k}`,
        },
        questionText: `If finite set $A$ contains $${k}$ elements and there is a one-to-one correspondence between set $A$ and set $B$, how many elements are in set $B$?`,
        correctAnswer: `$${k}$ elements`,
        rawDistractors: [`$${k - 1}$ elements`, `$${k + 1}$ elements`, `$2k$ elements`],
        given: `Set $A$ has $${k}$ elements; $A$ has a one-to-one correspondence with $B$.`,
        required: `Number of elements in set $B$.`,
        method: `One-to-one correspondence preserves cardinality: $n(A) = n(B) = ${k}$.`,
        steps: [`$n(B) = n(A) = ${k}$.`],
        conclusion: `Set $B$ contains $${k}$ elements.`,
        hint: `Two sets in one-to-one correspondence always have the exact same number of elements.`,
      };
    } else {
      const correctAns = `Bijective pairing where each element matches exactly one partner`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Definition of one-to-one correspondence',
          questionType: 'reasoning', difficulty, mathematicalOperation: 'Set bijection',
          representation: 'definition', context: 'Foundations of counting',
          numbersUsed: [1], expectedReasoning: 'Each element in set A pairs with exactly one unique element in set B',
          conceptKey: 'ONE_TO_ONE_CORRESPONDENCE_DEF',
        },
        questionText: `In foundational mathematics, what does one-to-one correspondence between two sets mean?`,
        correctAnswer: correctAns,
        rawDistractors: [
          `One element in set A connects to all elements in set B`,
          `Set A must contain only odd numbers`,
          `The sets must have different total numbers of elements`,
        ],
        given: `Two sets with one-to-one correspondence.`,
        required: `Mathematical meaning.`,
        method: `Each member of set A pairs with precisely one unique member of set B, proving equal cardinality.`,
        steps: [`Every element is paired with exactly one counterpart with none left over.`],
        conclusion: `It is a bijective pairing.`,
        hint: `Think of pairing each student with exactly one chair.`,
      };
    }
  }

  if (nameL.includes('counting objects')) {
    const boxes = prng.pick([5, 6, 8, 10]);
    const itemsPerBox = prng.pick([6, 12, 15, 20]);
    const totalItems = boxes * itemsPerBox;
    const correctAns = `$${totalItems}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Counting objects in equal groups',
        questionType: 'word_problem', difficulty, mathematicalOperation: 'Multiplication by grouping',
        representation: 'word_problem', context: 'Object grouping',
        numbersUsed: [boxes, itemsPerBox, totalItems], expectedReasoning: 'Multiply number of groups by items per group',
        conceptKey: 'COUNTING_OBJECTS_GROUPS',
      },
      questionText: `A crate contains $${boxes}$ cartons. Each carton holds $${itemsPerBox}$ cans.\n\nHow many cans are there in total?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${totalItems + itemsPerBox}$`, `$${boxes + itemsPerBox}$`, `$${totalItems - itemsPerBox}$`], prng),
      given: `$${boxes}$ cartons, $${itemsPerBox}$ cans each.`,
      required: `Total cans.`,
      method: `Multiply cartons by cans per carton: $${boxes} \\times ${itemsPerBox} = ${totalItems}$.`,
      steps: [`$${boxes} \\times ${itemsPerBox} = ${totalItems}$.`],
      conclusion: `There are $${totalItems}$ cans in total.`,
      hint: `Multiply the number of cartons by the cans per carton.`,
    };
  }

  if (nameL.includes('counting in tens') || nameL.includes('counting in hundreds') || nameL.includes('counting in thousands')) {
    const stepSize = nameL.includes('tens') ? 10 : nameL.includes('hundreds') ? 100 : 1000;
    const startVal = stepSize * prng.int(4, 9);
    const nextVal = startVal + stepSize;
    const correctAns = `$${nextVal.toLocaleString()}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: `Skip counting by ${stepSize}s`,
        questionType: 'pattern_recognition', difficulty, mathematicalOperation: `Addition by ${stepSize}`,
        representation: 'equation', context: 'Skip counting',
        numbersUsed: [startVal, stepSize, nextVal], expectedReasoning: `Add ${stepSize} to current value`,
        conceptKey: `COUNTING_IN_${stepSize}S`,
      },
      questionText: `Counting in $${stepSize.toLocaleString()}$s, which number immediately follows $${startVal.toLocaleString()}$?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${(nextVal + stepSize).toLocaleString()}$`, `$${(startVal - stepSize).toLocaleString()}$`, `$${(nextVal + 1).toLocaleString()}$`], prng),
      given: `Starting number $${startVal.toLocaleString()}$, step size $${stepSize.toLocaleString()}$.`,
      required: `Next number.`,
      method: `Add $${stepSize}$ to $${startVal}$: $${startVal} + ${stepSize} = ${nextVal}$.`,
      steps: [`$${startVal} + ${stepSize} = ${nextVal}$.`],
      conclusion: `The next number is $${nextVal.toLocaleString()}$.`,
      hint: `Add $${stepSize}$ to $${startVal.toLocaleString()}$.`,
    };
  }

  // Large numbers & Comparisons (Topics 83 - 90)
  if (nameL.includes('reading large numbers') || nameL.includes('writing large numbers')) {
    const millions = prng.pick([2, 3, 5, 7]);
    const thousands = prng.pick([40, 50, 80]);
    const val = millions * 1000000 + thousands * 1000;
    const words = `${millions === 2 ? 'Two' : millions === 3 ? 'Three' : millions === 5 ? 'Five' : 'Seven'} million, ${thousands === 40 ? 'forty' : thousands === 50 ? 'fifty' : 'eighty'} thousand`;
    if (nameL.includes('writing large numbers')) {
      const correctAns = `$${val.toLocaleString()}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Writing word form as standard numeral',
          questionType: 'identification', difficulty, mathematicalOperation: 'Number numeralization',
          representation: 'word_problem', context: 'Large numbers',
          numbersUsed: [val], expectedReasoning: 'Convert spoken period millions and thousands into numeral digits',
          conceptKey: 'WRITING_LARGE_NUMBERS_NUMERAL',
        },
        questionText: `Write the number in standard numeral form:\n\n"${words}"`,
        correctAnswer: correctAns,
        rawDistractors: [
          `$${(val / 10).toLocaleString()}$`,
          `$${(val * 10).toLocaleString()}$`,
          `$${(val + 500).toLocaleString()}$`,
        ],
        given: `Words: "${words}".`,
        required: `Numeral.`,
        method: `Place $${millions}$ in the millions period and $${thousands}$ in the thousands period.`,
        steps: [`Result is $${val.toLocaleString()}$.`],
        conclusion: `The numeral is $${val.toLocaleString()}$.`,
        hint: `Millions have 6 zeros after them.`,
      };
    }
    const correctAns = words;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Reading large number aloud',
        questionType: 'identification', difficulty, mathematicalOperation: 'Numeral to words',
        representation: 'word_problem', context: 'Large numbers',
        numbersUsed: [val], expectedReasoning: 'Read digit groups by standard periods',
        conceptKey: 'READING_LARGE_NUMBERS_WORDS',
      },
      questionText: `How is the numeral $${val.toLocaleString()}$ correctly read in words?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        words.replace('million', 'hundred thousand'),
        words.replace('thousand', 'hundred'),
        `${words} and twenty`,
      ], prng),
      given: `Numeral $${val.toLocaleString()}$.`,
      required: `Word reading.`,
      method: `Read by period: millions, then thousands.`,
      steps: [`$${val.toLocaleString()}$ is "${words}".`],
      conclusion: `It is read as "${words}".`,
      hint: `Separate into groups of 3 digits from the right.`,
    };
  }

  if (nameL.includes('comparing quantities')) {
    const itemNames = [
      { a: 'Package A', b: 'Package B' },
      { a: 'Box X', b: 'Box Y' },
      { a: 'Parcel 1', b: 'Parcel 2' },
      { a: 'Container M', b: 'Container N' },
    ];
    const item = prng.pick(itemNames);
    const kgVal = prng.pick([0.5, 0.75, 1.2, 1.5, 2.5, 3.0]);
    const kgInG = Math.round(kgVal * 1000);
    const diff = prng.pick([-150, -100, -50, 50, 100, 150]);
    const gVal = kgInG + diff;
    const isAHeavier = gVal > kgInG;
    const heavierName = isAHeavier ? item.a : item.b;
    const heavierDetail = isAHeavier ? `${item.a} ($${gVal}\\text{ g}$)` : `${item.b} ($${kgVal}\\text{ kg} = ${kgInG}\\text{ g}$)`;
    const lighterDetail = isAHeavier ? `${item.b} ($${kgVal}\\text{ kg} = ${kgInG}\\text{ g}$)` : `${item.a} ($${gVal}\\text{ g}$)`;

    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Comparing quantities in different units',
        questionType: 'comparison', difficulty, mathematicalOperation: 'Unit conversion and comparison',
        representation: 'word_problem', context: 'Measurement comparison',
        numbersUsed: [gVal, kgInG], expectedReasoning: `Convert kg to g (${kgVal} kg = ${kgInG} g) and compare with ${gVal} g`,
        conceptKey: `COMPARING_QUANTITIES_${Math.round(gVal)}_${Math.round(kgInG)}`,
      },
      questionText: `${item.a} weighs $${gVal}\\text{ g}$, while ${item.b} weighs $${kgVal}\\text{ kg}$.\n\nWhich item has the greater mass?`,
      correctAnswer: heavierDetail,
      rawDistractors: [
        lighterDetail,
        `Both items have the exact same mass`,
        `Cannot be compared without knowing volume`,
      ],
      given: `${item.a}: $${gVal}\\text{ g}$, ${item.b}: $${kgVal}\\text{ kg}$.`,
      required: `Item with greater mass.`,
      method: `Convert kilograms to grams: $${kgVal}\\text{ kg} = ${kgInG}\\text{ g}$. Comparing $${gVal}\\text{ g}$ with $${kgInG}\\text{ g}$, ${heavierName} is heavier.`,
      steps: [
        `$${kgVal}\\text{ kg} = ${kgInG}\\text{ g}$.`,
        `$${Math.max(gVal, kgInG)}\\text{ g} > ${Math.min(gVal, kgInG)}\\text{ g}$.`,
      ],
      conclusion: `${heavierName} has the greater mass.`,
      hint: `Convert kilograms to grams first: $1\\text{ kg} = 1,000\\text{ g}$.`,
    };
  }

  if (nameL.includes('greater than') || nameL.includes('less than') || nameL.includes('equal to') || nameL.includes('not equal to') || nameL.includes('approximately equal to')) {
    if (nameL.includes('greater than')) {
      const b = prng.int(50, 75);
      const a = b + prng.int(8, 24);
      const correctAns = `$${a}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Identifying numbers greater than a reference',
          questionType: 'comparison', difficulty, mathematicalOperation: 'Order comparison',
          representation: 'numerical', context: 'Comparison of whole numbers',
          numbersUsed: [a, b], expectedReasoning: 'A number is greater than b if its value exceeds b',
          conceptKey: 'GREATER_THAN_NUMERICAL',
        },
        questionText: `Which of the following numbers is greater than $${b}$?`,
        correctAnswer: correctAns,
        rawDistractors: [`$${b - 4}$`, `$${b - 11}$`, `$${b - 19}$`],
        given: `Reference value $${b}$.`,
        required: `A number greater than $${b}$.`,
        method: `Compare each option against $${b}$. Since $${a} - ${b} = ${a - b} > 0$, $${a}$ is greater than $${b}$.`,
        steps: [`$${a} > ${b}$ because $${a}$ exceeds $${b}$ by $${a - b}$.`],
        conclusion: `$${a}$ is greater than $${b}$.`,
        hint: `Look for a number with a larger value than $${b}$.`,
      };
    }
    if (nameL.includes('less than')) {
      const b = prng.int(60, 85);
      const a = b - prng.int(8, 24);
      const correctAns = `$${a}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Identifying numbers less than a reference',
          questionType: 'comparison', difficulty, mathematicalOperation: 'Order comparison',
          representation: 'numerical', context: 'Comparison of whole numbers',
          numbersUsed: [a, b], expectedReasoning: 'A number is less than b if its value is smaller than b',
          conceptKey: 'LESS_THAN_NUMERICAL',
        },
        questionText: `Which of the following numbers is less than $${b}$?`,
        correctAnswer: correctAns,
        rawDistractors: [`$${b + 7}$`, `$${b + 14}$`, `$${b + 22}$`],
        given: `Reference value $${b}$.`,
        required: `A number less than $${b}$.`,
        method: `Compare each option against $${b}$. Since $${a} < ${b}$, $${a}$ is less than $${b}$.`,
        steps: [`$${a} < ${b}$ because $${a}$ is smaller than $${b}$ by $${b - a}$.`],
        conclusion: `$${a}$ is less than $${b}$.`,
        hint: `Look for a number with a smaller value than $${b}$.`,
      };
    }
    if (nameL.includes('approximately equal to')) {
      const actual = prng.int(105, 995);
      const rounded = Math.round(actual / 10) * 10;
      const correctAns = `$${actual} \\approx ${rounded}$`;
      const distractors = [
        `$${actual} = ${rounded}$`,
        `$${actual} > ${rounded + 50}$`,
        `$${actual} \\le ${rounded - 50}$`,
      ];
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Using approximately equal symbol approx',
          questionType: 'identification', difficulty, mathematicalOperation: 'Approximation notation',
          representation: 'inequality', context: 'Estimation',
          numbersUsed: [actual, rounded], expectedReasoning: 'Approx symbol denotes values close but not strictly equal',
          conceptKey: `APPROX_EQUAL_${actual}_${rounded}`,
        },
        questionText: `Rounding $${actual}$ to the nearest ten gives $${rounded}$. Which statement correctly writes this using approximation notation?`,
        correctAnswer: correctAns,
        rawDistractors: distractors,
        given: `Number $${actual}$, rounded value $${rounded}$.`,
        required: `Approximation statement.`,
        method: `Since $${actual}$ is close to $${rounded}$ but not identical, we use $\\approx$: $${actual} \\approx ${rounded}$.`,
        steps: [`$${actual} \\approx ${rounded}$.`],
        conclusion: `$${actual} \\approx ${rounded}$ is correct.`,
        hint: `The wavy double line $\\approx$ indicates approximation.`,
      };
    }
    // Equal to / Not equal to
    const a = prng.int(12, 48);
    const b = prng.int(11, 45);
    const sum = a + b;
    const correctAns = `$${a} + ${b} = ${sum}$`;
    const distractors = [
      `$${a} + ${b} \\ne ${sum}$`,
      `$${a} + ${b} > ${sum}$`,
      `$${a} + ${b} < ${sum}$`,
    ];
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Equality vs inequality symbols',
        questionType: 'identification', difficulty, mathematicalOperation: 'Equality verification',
        representation: 'equation', context: 'Symbols',
        numbersUsed: [a, b, sum], expectedReasoning: '= denotes identical quantity; != denotes distinct',
        conceptKey: `EQUALITY_VERIFY_${a}_${b}`,
      },
      questionText: `Which mathematical statement correctly expresses that $${a} + ${b}$ and $${sum}$ evaluate to the exact same value?`,
      correctAnswer: correctAns,
      rawDistractors: distractors,
      given: `Values $${a}$, $${b}$, sum $${sum}$.`,
      required: `True equality statement.`,
      method: `Since $${a} + ${b} = ${sum}$, the equality sign ($=$) represents exact equivalence.`,
      steps: [`$${a} + ${b} = ${sum}$.`],
      conclusion: `$${a} + ${b} = ${sum}$ is correct.`,
      hint: `The equal sign ($=$) means both sides have the exact same value.`,
    };
  }

  // Stage 10: Decomposition, Regrouping, Carrying, Borrowing, Additive comparison (Topics 91 - 100)
  if (nameL.includes('number decomposition') || nameL.includes('decomposition')) {
    const h = prng.int(3, 8);
    const t = prng.int(2, 7);
    const u = prng.int(1, 9);
    const val = h * 100 + t * 10 + u;
    const correctAns = `$$${h}\\text{ hundreds} + ${t}\\text{ tens} + ${u}\\text{ ones}$$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Decomposing 3-digit number into place value components',
        questionType: 'identification', difficulty, mathematicalOperation: 'Number decomposition',
        representation: 'place_value', context: 'Place value',
        numbersUsed: [val, h, t, u], expectedReasoning: 'Break down number into hundreds, tens, and units',
        conceptKey: 'NUMBER_DECOMPOSITION_PLACE_VALUE',
      },
      questionText: `Decompose the number $${val}$ into its place value components:`,
      correctAnswer: correctAns,
      rawDistractors: [
        `$$${t}\\text{ hundreds} + ${h}\\text{ tens} + ${u}\\text{ ones}$$`,
        `$$${h}\\text{ hundreds} + ${u}\\text{ tens} + ${t}\\text{ ones}$$`,
        `$$${h * 10}\\text{ hundreds} + ${t}\\text{ tens} + ${u}\\text{ ones}$$`,
      ],
      given: `Number $${val}$.`,
      required: `Decomposition.`,
      method: `Hundreds digit is $${h}$, tens digit is $${t}$, units digit is $${u}$.`,
      steps: [`$${val} = ${h}\\text{ hundreds} + ${t}\\text{ tens} + ${u}\\text{ ones}$.`],
      conclusion: `Decomposition: $${h}\\text{ hundreds} + ${t}\\text{ tens} + ${u}\\text{ ones}$.`,
      hint: `Look at the hundreds, tens, and ones digits.`,
    };
  }

  if (nameL.includes('number composition') || nameL.includes('composition')) {
    const h = prng.int(4, 9);
    const t = prng.int(1, 8);
    const u = prng.int(2, 9);
    const val = h * 100 + t * 10 + u;
    const correctAns = `$${val}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Composing number from place value components',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Number composition',
        representation: 'place_value', context: 'Place value',
        numbersUsed: [h, t, u, val], expectedReasoning: 'Sum place value values to form single standard numeral',
        conceptKey: 'NUMBER_COMPOSITION_PLACE_VALUE',
      },
      questionText: `What number is composed by combining:\n\n$$${h}\\text{ hundreds} + ${t}\\text{ tens} + ${u}\\text{ ones}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${h * 100 + u * 10 + t}$`, `$${t * 100 + h * 10 + u}$`, `$${val + 10}$`], prng),
      given: `$${h}$ hundreds, $${t}$ tens, $${u}$ ones.`,
      required: `Composed standard numeral.`,
      method: `$${h} \\times 100 + ${t} \\times 10 + ${u} = ${val}$.`,
      steps: [`$${h * 100} + ${t * 10} + ${u} = ${val}$.`],
      conclusion: `The number is $${val}$.`,
      hint: `Multiply hundreds by 100, tens by 10, ones by 1, and add them.`,
    };
  }

  if (nameL.includes('regrouping') || nameL.includes('carrying in addition') || nameL.includes('borrowing in subtraction')) {
    if (nameL.includes('carrying')) {
      const u1 = prng.int(6, 9);
      const u2 = prng.int(5, 9);
      const sumU = u1 + u2;
      const carry = 1;
      const rem = sumU % 10;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Carrying digit in column addition',
          questionType: 'reasoning', difficulty, mathematicalOperation: 'Column addition carry',
          representation: 'equation', context: 'Multi-digit arithmetic',
          numbersUsed: [u1, u2, sumU, carry], expectedReasoning: 'Sum exceeding 9 in ones column carries 1 to tens column',
          conceptKey: 'CARRYING_IN_ADDITION_REASONING',
        },
        questionText: `In the column addition $4${u1} + 3${u2}$, adding the ones column gives $${u1} + ${u2} = ${sumU}$.\n\nWhat value is carried over to the tens column?`,
        correctAnswer: `$1$ (representing $10$)`,
        rawDistractors: [`$0$`, `$${rem}$`, `$${sumU}$`],
        given: `Ones column: $${u1} + ${u2} = ${sumU}$.`,
        required: `Carried value to tens place.`,
        method: `Since $${sumU} \\ge 10$, write $${rem}$ in the ones column and carry $1$ ten ($10$) to the tens column.`,
        steps: [`Carry digit is $1$.`],
        conclusion: `Carry $1$ ten to the tens column.`,
        hint: `In base 10, ten ones are bundled into 1 ten.`,
      };
    }
    if (nameL.includes('borrowing')) {
      const mode = prng.int(0, 1);
      if (mode === 0) {
        const t1 = prng.int(4, 9);
        const u1 = prng.int(1, 4);
        const u2 = prng.int(5, 9);
        const topNum = t1 * 10 + u1;
        const botNum = prng.int(1, t1 - 1) * 10 + u2;
        const diff = topNum - botNum;
        return {
          blueprint: {
            mainTopic: topicArea, subtopic: topicName, skill: 'Multi-digit subtraction with borrowing',
            questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Column subtraction with regrouping',
            representation: 'equation', context: 'Arithmetic',
            numbersUsed: [topNum, botNum, diff], expectedReasoning: 'Regroup 1 ten to calculate units difference',
            conceptKey: `SUBTRACTION_REGROUP_${topNum}_${botNum}`,
          },
          questionText: `Evaluate the multi-digit subtraction requiring regrouping:\n\n$$${topNum} - ${botNum}$$`,
          correctAnswer: `$${diff}$`,
          rawDistractors: [`$${diff + 10}$`, `$${diff - 10}$`, `$${diff + 2}$`],
          given: `Subtraction $${topNum} - ${botNum}$.`,
          required: `Difference.`,
          method: `Since $${u1} < ${u2}$, regroup $1$ ten from the tens place: $10 + ${u1} = ${u1 + 10}$. Then $${u1 + 10} - ${u2} = ${u1 + 10 - u2}$.`,
          steps: [
            `Regroup $1$ ten from $${t1}$ tens, leaving $${t1 - 1}$ tens.`,
            `Calculate ones: $${u1 + 10} - ${u2} = ${u1 + 10 - u2}$.`,
            `Calculate tens: $${t1 - 1} - ${Math.floor(botNum / 10)} = ${Math.floor(diff / 10)}$.`,
            `Total = $${diff}$.`,
          ],
          conclusion: `$${topNum} - ${botNum} = ${diff}$.`,
          hint: `Regroup 1 ten from the tens digit into 10 ones.`,
        };
      } else {
        const placeNames = [
          { from: 'tens column', to: 'ones column', units: 10, name: 'ones' },
          { from: 'hundreds column', to: 'tens column', units: 10, name: 'tens' },
          { from: 'thousands column', to: 'hundreds column', units: 10, name: 'hundreds' },
        ];
        const p = prng.pick(placeNames);
        return {
          blueprint: {
            mainTopic: topicArea, subtopic: topicName, skill: 'Borrowing / regrouping in column subtraction',
            questionType: 'reasoning', difficulty, mathematicalOperation: 'Regrouping in subtraction',
            representation: 'definition', context: 'Multi-digit arithmetic',
            numbersUsed: [1, p.units], expectedReasoning: `Regrouping unbundles 1 unit of ${p.from} into ${p.units} ${p.name}`,
            conceptKey: `BORROWING_PLACE_${p.from.replace(/\s+/g, '_')}`,
          },
          questionText: `In column subtraction, when you borrow (regroup) $1$ unit from the ${p.from} into the ${p.to}, how many ${p.name} are added?`,
          correctAnswer: `$${p.units}$ ${p.name}`,
          rawDistractors: [`$1$ ${p.name.slice(0, -1)}`, `$100$ ${p.name}`, `$5$ ${p.name}`],
          given: `Regrouping 1 unit from ${p.from} to ${p.to}.`,
          required: `Equivalent number of ${p.name}.`,
          method: `In base 10, each place value equals $10$ units of the position immediately to its right.`,
          steps: [`$1$ unit of ${p.from} = $10$ ${p.name}.`],
          conclusion: `$10$ ${p.name} are added to the ${p.to}.`,
          hint: `Base 10 place values increase and decrease by factors of 10.`,
        };
      }
    }
    const placeTrades = [
      { from: 'tens', to: 'hundred', count: 10 },
      { from: 'ones', to: 'ten', count: 10 },
      { from: 'hundreds', to: 'thousand', count: 10 },
    ];
    const trade = prng.pick(placeTrades);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Concept of regrouping across place values',
        questionType: 'reasoning', difficulty, mathematicalOperation: 'Base-10 regrouping',
        representation: 'definition', context: 'Place value',
        numbersUsed: [trade.count], expectedReasoning: 'Regrouping exchanges equivalent quantities between adjacent place values',
        conceptKey: `REGROUPING_BASE_TEN_${trade.from}_${trade.to}`,
      },
      questionText: `In the base-ten number system, how many ${trade.from} are regrouped to make $1$ ${trade.to}?`,
      correctAnswer: `$${trade.count}$ ${trade.from}`,
      rawDistractors: [
        `$5$ ${trade.from}`,
        `$100$ ${trade.from}`,
        `$1$ ${trade.from}`,
      ],
      given: `Base-10 system regrouping into $1$ ${trade.to}.`,
      required: `Number of ${trade.from} needed.`,
      method: `Base-10 place values are based on powers of 10. Exactly $10$ ${trade.from} bundle into $1$ ${trade.to}.`,
      steps: [`$10$ ${trade.from} = $1$ ${trade.to}.`],
      conclusion: `$10$ ${trade.from} are needed.`,
      hint: `Think of bundling units into groups of 10.`,
    };
  }

  if (nameL.includes('additive comparison')) {
    const personA = 'Abena';
    const personB = 'Kojo';
    const baseVal = prng.int(18, 45);
    const diffVal = prng.int(7, 16);
    const totalVal = baseVal + diffVal;
    const correctAns = `$${totalVal}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Solving additive comparison word problem',
        questionType: 'word_problem', difficulty, mathematicalOperation: 'Additive comparison: B = A + d',
        representation: 'word_problem', context: 'Real-world comparison',
        numbersUsed: [baseVal, diffVal, totalVal], expectedReasoning: 'Add comparative difference to base quantity',
        conceptKey: 'ADDITIVE_COMPARISON_WORD_PROBLEM',
      },
      questionText: `${personA} has $${baseVal}$ oranges. ${personB} has $${diffVal}$ more oranges than ${personA}.\n\nHow many oranges does ${personB} have?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${baseVal - diffVal}$`, `$${totalVal + 5}$`, `$${baseVal * 2}$`], prng),
      given: `${personA} has $${baseVal}$, ${personB} has $${diffVal}$ more.`,
      required: `${personB}'s count.`,
      method: `$\\text{Total} = ${baseVal} + ${diffVal} = ${totalVal}$.`,
      steps: [`$${baseVal} + ${diffVal} = ${totalVal}$.`],
      conclusion: `${personB} has $${totalVal}$ oranges.`,
      hint: `Add the difference ($${diffVal}$) to ${personA}'s amount ($${baseVal}$).`,
    };
  }

  if (nameL.includes('arithmetic fluency') || nameL.includes('basic computation')) {
    const a = prng.int(15, 30);
    const b = prng.pick([2, 3, 4]);
    const c = prng.int(10, 25);
    const res = a * b + c;
    const correctAns = `$${res}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Two-step arithmetic computation fluency',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Multiplication then addition',
        representation: 'equation', context: 'Mental math fluency',
        numbersUsed: [a, b, c, res], expectedReasoning: 'Multiply first according to order of operations, then add',
        conceptKey: 'ARITHMETIC_FLUENCY_TWO_STEP',
      },
      questionText: `Evaluate quickly using arithmetic fluency:\n\n$$(${a} \\times ${b}) + ${c}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${res + 10}$`, `$${res - b}$`, `$${a * (b + c)}$`], prng),
      given: `Expression $(${a} \\times ${b}) + ${c}$.`,
      required: `Result.`,
      method: `Evaluate parentheses first: $${a} \\times ${b} = ${a * b}$. Then add $${c}$: $${a * b} + ${c} = ${res}$.`,
      steps: [
        `$${a} \\times ${b} = ${a * b}$.`,
        `$${a * b} + ${c} = ${res}$.`,
      ],
      conclusion: `The result is $${res}$.`,
      hint: `Calculate the multiplication inside the brackets first!`,
    };
  }

  if (nameL.includes('number relationships')) {
    const a = prng.int(12, 25);
    const b = prng.int(4, 11);
    const sum = a + b;
    const diff = a - b;
    const correctAns = `$a = ${a}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Deducing numbers from sum and difference relationships',
        questionType: 'reasoning', difficulty, mathematicalOperation: 'System sum-diff: a = (S + D) / 2',
        representation: 'equation', context: 'Number theory relations',
        numbersUsed: [sum, diff, a, b], expectedReasoning: 'Add sum and difference to get 2a, then divide by 2',
        conceptKey: 'NUMBER_RELATIONSHIPS_SUM_DIFF',
      },
      questionText: `Two positive numbers $a$ and $b$ satisfy the relationships:\n\n$$a + b = ${sum} \\quad \\text{and} \\quad a - b = ${diff}$$\n\nWhat is the value of $a$?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$a = ${b}$`, `$a = ${a + 2}$`, `$a = ${sum}$`], prng),
      given: `$a + b = ${sum}$, $a - b = ${diff}$.`,
      required: `Value of $a$.`,
      method: `Add the two equations: $(a + b) + (a - b) = 2a \\implies 2a = ${sum} + ${diff} = ${sum + diff} \\implies a = ${a}$.`,
      steps: [
        `$2a = ${sum} + ${diff} = ${sum + diff}$.`,
        `$a = ${sum + diff} \\div 2 = ${a}$.`,
      ],
      conclusion: `$a = ${a}$.`,
      hint: `Add the two equations together: $b$ cancels out, leaving $2a$.`,
    };
  }

  // Default Stage-Specific Mathematical Operation (Distinct for each stage)
  if (stageId === 5 || stageId === 6) {
    const divisor = prng.pick([4, 6, 7, 8, 9]);
    const quotient = prng.int(12, 35);
    const remainder = prng.int(1, divisor - 1);
    const dividend = divisor * quotient + remainder;
    const correctAns = `$${quotient}\\text{ R }${remainder}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Division with remainder',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Euclidean division',
        representation: 'equation', context: 'Division algorithm',
        numbersUsed: [dividend, divisor, quotient, remainder], expectedReasoning: 'Dividend = Divisor * Quotient + Remainder',
        conceptKey: 'DIVISION_ALGORITHM_REMAINDER',
      },
      questionText: `Divide and find the quotient and remainder:\n\n$$${dividend} \\div ${divisor}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${quotient + 1}\\text{ R }${remainder}$`,
        `$${quotient}\\text{ R }${remainder + 1}$`,
        `$${quotient - 1}\\text{ R }${divisor - remainder}$`,
      ], prng),
      given: `Dividend $${dividend}$, Divisor $${divisor}$.`,
      required: `Quotient and remainder.`,
      method: `Find largest integer multiple of $${divisor}$ less than $${dividend}$.`,
      steps: [
        `$${divisor} \\times ${quotient} = ${divisor * quotient}$.`,
        `Remainder $= ${dividend} - ${divisor * quotient} = ${remainder}$.`,
      ],
      conclusion: `$${dividend} \\div ${divisor} = ${quotient}\\text{ remainder }${remainder}$.`,
      hint: `How many whole times does $${divisor}$ go into $${dividend}$, and what is leftover?`,
    };
  }

  // Comparing two negative integers (Stage 3, 9)
  const negA = -prng.int(8, 45);
  const negB = negA - prng.int(5, 18);
  const smaller = Math.min(negA, negB);
  const larger = Math.max(negA, negB);
  const correctAns = `$${smaller}$`;

  return {
    blueprint: {
      mainTopic: topicArea, subtopic: topicName, skill: `Comparative value for ${topicName}`,
      questionType: 'comparison', difficulty, mathematicalOperation: 'Order relation on integers',
      representation: 'numerical', context: 'Integers ordering',
      numbersUsed: [smaller, larger], expectedReasoning: 'Numbers further left on number line have smaller value',
      conceptKey: `NUMBER_SENSE_STAGE_${stageId}_COMPARISON`,
    },
    questionText: `Between the two negative integers $${smaller}$ and $${larger}$, which number has the smaller value (further to the left)?`,
    correctAnswer: correctAns,
    rawDistractors: [
      `$${larger}$`,
      `$${Math.abs(smaller)}$`,
      `$0$`,
    ],
    given: `Integers $${smaller}$ and $${larger}$.`,
    required: `Smaller value.`,
    method: `On a number line, values further to the left are smaller: $${smaller}$ is further left than $${larger}$.`,
    steps: [`$${smaller} < ${larger}$, so $${smaller}$ is the smaller value.`],
    conclusion: `$${smaller}$ is the smaller value.`,
    hint: `A number further to the left on a number line is smaller.`,
  };
}
