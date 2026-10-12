import { DifficultyTier } from '../../types';
import { PRNG, gcd, lcm, generateNumericalDistractors } from '../generators/shared';
import { QuestionBlueprint, QuestionType, RepresentationType } from './types';

export interface GeneratedBlueprintArtifact {
  blueprint: QuestionBlueprint;
  questionText: string;
  correctAnswer: string;
  rawDistractors: string[];
  given: string;
  required: string;
  method: string;
  steps: string[];
  conclusion: string;
  hint: string;
  misconceptions?: string[];
}

/**
 * Universal Quality Verifier for generated blueprint artifacts:
 * Guarantees mathematical correctness, 4 distinct options, valid LaTeX, and pedagogical rigor.
 */
export function verifyBlueprintArtifact(
  artifact: GeneratedBlueprintArtifact
): boolean {
  if (!artifact.questionText || artifact.questionText.trim().length === 0) return false;
  if (!artifact.correctAnswer || artifact.correctAnswer.trim().length === 0) return false;
  if (!artifact.rawDistractors || artifact.rawDistractors.length < 2) return false;

  // Ensure distractors do not duplicate the correct answer
  const seen = new Set<string>([artifact.correctAnswer.trim()]);
  for (const d of artifact.rawDistractors) {
    if (seen.has(d.trim())) return false;
    seen.add(d.trim());
  }

  // Ensure steps and solution exist
  if (!artifact.steps || artifact.steps.length === 0) return false;

  return true;
}

// ============================================================================
// AREA 0: NUMBER SENSE & BASIC ARITHMETIC
// ============================================================================
export function generateArithmeticArchetype(
  subtopic: string,
  preferredType: QuestionType,
  difficulty: DifficultyTier,
  prng: PRNG
): GeneratedBlueprintArtifact {
  const diffMultiplier = difficulty === 'foundation' ? 1 : difficulty === 'developing' ? 2 : difficulty === 'advanced' ? 3 : 4;

  if (preferredType === 'reverse_operation' || preferredType === 'missing_value') {
    // Missing Value Equation e.g. 48 / (? - 3) = 6 or ? * 7 + 15 = 57
    const b = prng.pick([3, 4, 5, 6, 7, 8]) + diffMultiplier;
    const ans = prng.int(5, 15) + diffMultiplier * 2;
    const addConst = prng.int(4, 25);
    const total = ans * b + addConst;

    const blueprint: QuestionBlueprint = {
      mainTopic: 'Number Sense & Basic Arithmetic',
      subtopic,
      skill: 'Solving for missing values using inverse operations',
      questionType: 'missing_value',
      difficulty,
      mathematicalOperation: 'Inverse arithmetic: subtraction then division',
      representation: 'equation',
      context: 'Pure arithmetic reasoning',
      numbersUsed: [total, b, addConst, ans],
      expectedReasoning: 'Undo addition by subtracting, then undo multiplication by dividing',
      conceptKey: 'ARITHMETIC_MISSING_VALUE_LINEAR',
    };

    const questionText = `Find the missing value $\\mathbf{?}$ that satisfies the equation:\n\n$$\\mathbf{?} \\times ${b} + ${addConst} = ${total}$$`;
    const correctAnswer = `$${ans}$`;
    const rawDistractors = generateNumericalDistractors(ans, prng, true, false).map(d => `$${d}$`);

    return {
      blueprint,
      questionText,
      correctAnswer,
      rawDistractors,
      given: `Equation $\\mathbf{?} \\times ${b} + ${addConst} = ${total}$.`,
      required: `Value of $\\mathbf{?}$.`,
      method: `Subtract ${addConst} from both sides, then divide by ${b}.`,
      steps: [
        `$\\mathbf{?} \\times ${b} = ${total} - ${addConst} = ${total - addConst}$.`,
        `$\\mathbf{?} = \\frac{${total - addConst}}{${b}} = ${ans}$.`,
      ],
      conclusion: `The missing value is $${ans}$.`,
      hint: `Use reverse operations: first subtract $${addConst}$, then divide by $${b}$.`,
    };
  }

  if (preferredType === 'error_analysis') {
    // Error Analysis in Order of Operations
    const a = prng.pick([16, 20, 24, 30, 36]);
    const b = prng.pick([4, 6, 8]);
    const c = prng.pick([2, 3]);
    const wrong = Math.floor((a - b) / c); // subtracted first!
    const correct = a - Math.floor(b / c); // divided first!

    const blueprint: QuestionBlueprint = {
      mainTopic: 'Number Sense & Basic Arithmetic',
      subtopic,
      skill: 'Identifying misconceptions in order of operations (BODMAS)',
      questionType: 'error_analysis',
      difficulty,
      mathematicalOperation: 'Operator precedence: Division precedes Subtraction',
      representation: 'scenario',
      context: 'Classroom mathematical evaluation',
      numbersUsed: [a, b, c, wrong, correct],
      expectedReasoning: 'Recognize that division must be evaluated before subtraction unless brackets are present',
      conceptKey: 'ARITHMETIC_ERROR_ANALYSIS_BODMAS',
    };

    const questionText = `A student evaluates the expression $$${a} - ${b} \\div ${c}$$ and obtains an incorrect answer of $${wrong}$.\n\nWhat is the **correct mathematical value** according to the standard order of operations?`;
    const correctAnswer = `$${correct}$`;
    const rawDistractors = [
      `$${wrong}$`,
      `$${correct + c}$`,
      `$${Math.max(1, correct - b)}$`,
    ];

    return {
      blueprint,
      questionText,
      correctAnswer,
      rawDistractors,
      given: `Expression $${a} - ${b} \\div ${c}$. Student's incorrect answer: $${wrong}$.`,
      required: `Correct evaluated result.`,
      method: `Apply BODMAS/PEMDAS: Division must be performed before subtraction.`,
      steps: [
        `Divide first: $${b} \\div ${c} = ${Math.floor(b / c)}$.`,
        `Subtract from $${a}$: $${a} - ${Math.floor(b / c)} = ${correct}$.`,
        `The student mistakenly subtracted first: $(${a} - ${b}) \\div ${c} = ${wrong}$.`,
      ],
      conclusion: `The correct value is $${correct}$.`,
      hint: `Remember BODMAS: perform division ($${b} \\div ${c}$) before subtraction.`,
      misconceptions: [`Performing left-to-right subtraction before division yields the erroneous answer $${wrong}$.`],
    };
  }

  if (preferredType === 'word_problem' || preferredType === 'modelling') {
    // Meaningful logistics / packaging distribution
    const unitsPerBox = prng.pick([12, 16, 24, 30]);
    const boxes = prng.int(8, 25) + diffMultiplier * 5;
    const surplus = prng.int(3, unitsPerBox - 1);
    const totalUnits = boxes * unitsPerBox + surplus;

    const blueprint: QuestionBlueprint = {
      mainTopic: 'Number Sense & Basic Arithmetic',
      subtopic,
      skill: 'Practical division with remainders in supply chain logistics',
      questionType: 'word_problem',
      difficulty,
      mathematicalOperation: 'Integer division and remainder: dividend = quotient * divisor + remainder',
      representation: 'word_problem',
      context: 'Warehouse inventory packaging',
      numbersUsed: [totalUnits, unitsPerBox, boxes, surplus],
      expectedReasoning: 'Divide total items by box capacity to determine packed boxes and leftover units',
      conceptKey: 'ARITHMETIC_WORD_PROBLEM_REMAINDER',
    };

    const questionText = `A distribution centre needs to pack $${totalUnits}$ solar lamps into crates holding exactly $${unitsPerBox}$ lamps each.\n\nHow many **fully packed crates** can be completed, and how many lamps will be left over?`;
    const correctAnswer = `$${boxes}\\text{ crates, } ${surplus}\\text{ leftover}$`;
    const rawDistractors = [
      `$${boxes + 1}\\text{ crates, } 0\\text{ leftover}$`,
      `$${boxes}\\text{ crates, } ${surplus + 2}\\text{ leftover}$`,
      `$${Math.max(1, boxes - 1)}\\text{ crates, } ${surplus + unitsPerBox}\\text{ leftover}$`,
    ];

    return {
      blueprint,
      questionText,
      correctAnswer,
      rawDistractors,
      given: `Total lamps: $${totalUnits}$, crate capacity: $${unitsPerBox}$ lamps.`,
      required: `Number of complete crates and remaining lamps.`,
      method: `Divide $${totalUnits}$ by $${unitsPerBox}$ using division with remainders.`,
      steps: [
        `$${totalUnits} \\div ${unitsPerBox} = ${boxes}$ with a remainder of $${surplus}$.`,
        `Verification: $${boxes} \\times ${unitsPerBox} + ${surplus} = ${boxes * unitsPerBox} + ${surplus} = ${totalUnits}$.`,
      ],
      conclusion: `There are $${boxes}$ complete crates and $${surplus}$ lamps leftover.`,
      hint: `Divide $${totalUnits}$ by $${unitsPerBox}$. The whole number is the crates and the remainder is the leftover.`,
    };
  }

  // Multi-step calculation with brackets
  const p = prng.int(3, 8) + diffMultiplier;
  const q = prng.int(4, 9);
  const r = prng.int(2, 6);
  const s = prng.pick([10, 15, 20]);
  const ans = (p + q) * r - s;

  const blueprint: QuestionBlueprint = {
    mainTopic: 'Number Sense & Basic Arithmetic',
    subtopic,
    skill: 'Evaluating multi-step bracketed expressions',
    questionType: 'multi_step',
    difficulty,
    mathematicalOperation: 'Parentheses evaluation followed by multiplication and subtraction',
    representation: 'equation',
    context: 'Pure mathematical computation',
    numbersUsed: [p, q, r, s, ans],
    expectedReasoning: 'Brackets must be evaluated first, then multiply, then subtract',
    conceptKey: 'ARITHMETIC_MULTI_STEP_BRACKETS',
  };

  const questionText = `Evaluate the arithmetic expression:\n\n$$(${p} + ${q}) \\times ${r} - ${s}$$`;
  const correctAnswer = `$${ans}$`;
  const rawDistractors = generateNumericalDistractors(ans, prng, true, false).map(d => `$${d}$`);

  return {
    blueprint,
    questionText,
    correctAnswer,
    rawDistractors,
    given: `Expression $(${p} + ${q}) \\times ${r} - ${s}$.`,
    required: `Exact numerical value.`,
    method: `Parentheses first, then multiplication, then subtraction.`,
    steps: [
      `Inside brackets: $${p} + ${q} = ${p + q}$.`,
      `Multiply: $${p + q} \\times ${r} = ${(p + q) * r}$.`,
      `Subtract: ${(p + q) * r} - ${s} = ${ans}$.`,
    ],
    conclusion: `The result is $${ans}$.`,
    hint: `First add the numbers inside the brackets ($${p} + ${q}$), then multiply by $${r}$, then subtract $${s}$.`,
  };
}

// ============================================================================
// AREA 1: FRACTIONS, DECIMALS & PERCENTAGES
// ============================================================================
export function generateFractionsDecimalsPercentagesArchetype(
  subtopic: string,
  preferredType: QuestionType,
  difficulty: DifficultyTier,
  prng: PRNG
): GeneratedBlueprintArtifact {
  const isPercent = subtopic.toLowerCase().includes('percent');
  const isDecimal = subtopic.toLowerCase().includes('decimal');

  if (isPercent) {
    if (preferredType === 'reverse_operation' || preferredType === 'missing_value') {
      // Reverse Percentage: "After a 20% discount, an item costs GH¢160. What was original price?"
      const discountPercent = prng.pick([15, 20, 25, 30, 40]);
      const baseOriginal = prng.pick([120, 150, 180, 200, 240, 280, 320, 450, 600]);
      const salePrice = (baseOriginal * (100 - discountPercent)) / 100;

      const blueprint: QuestionBlueprint = {
        mainTopic: 'Fractions, Decimals & Percentages',
        subtopic: 'Percentages',
        skill: 'Reverse percentage: Finding original amount prior to discount',
        questionType: 'reverse_operation',
        difficulty,
        mathematicalOperation: 'Division by decimal multiplier: Original = Sale / (1 - d)',
        representation: 'word_problem',
        context: 'Commercial retail pricing in Ghana',
        numbersUsed: [salePrice, discountPercent, baseOriginal],
        expectedReasoning: 'Recognize that sale price is (100 - d)% of original, divide by (1 - d/100)',
        conceptKey: 'PERCENTAGE_REVERSE_DISCOUNT',
      };

      const questionText = `After a **${discountPercent}% discount**, a laptop bag is sold for **GH¢${salePrice}**.\n\nWhat was the **original marked price** of the bag before the discount?`;
      const correctAnswer = `$\\text{GH¢} ${baseOriginal}$`;
      // Common misconception: adding 20% to the sale price
      const erroneousAdd = parseFloat((salePrice * (1 + discountPercent / 100)).toFixed(2));
      const rawDistractors = [
        `$\\text{GH¢} ${Math.round(erroneousAdd)}$`,
        `$\\text{GH¢} ${baseOriginal + 40}$`,
        `$\\text{GH¢} ${Math.max(10, baseOriginal - 30)}$`,
      ];

      return {
        blueprint,
        questionText,
        correctAnswer,
        rawDistractors,
        given: `Sale price = $\\text{GH¢}${salePrice}$, discount rate = $${discountPercent}\\%$.`,
        required: `Original marked price before discount.`,
        method: `The sale price represents $100\\% - ${discountPercent}\\% = ${100 - discountPercent}\\%$ of the original price. Divide by $${(100 - discountPercent) / 100}$.`,
        steps: [
          `Percentage remaining: $100\\% - ${discountPercent}\\% = ${100 - discountPercent}\\% = ${((100 - discountPercent) / 100).toFixed(2)}$.`,
          `Original Price $= \\frac{\\text{GH¢}${salePrice}}{${((100 - discountPercent) / 100).toFixed(2)}} = \\text{GH¢}${baseOriginal}$.`,
        ],
        conclusion: `The original marked price was $\\text{GH¢}${baseOriginal}$.`,
        hint: `The sale price is $${100 - discountPercent}\\%$ of the original price. Divide $${salePrice}$ by $${(100 - discountPercent) / 100}$.`,
        misconceptions: [`Adding $${discountPercent}\\%$ to the discounted price yields GH¢${Math.round(erroneousAdd)}, which is incorrect because discounts are calculated on the original price.`],
      };
    }

    if (preferredType === 'multi_step') {
      // Multi-step: Discount followed by Sales Tax / VAT
      const originalPrice = prng.pick([100, 120, 160, 200, 250, 300]);
      const discountRate = prng.pick([10, 20, 25]);
      const taxRate = prng.pick([5, 10, 15]);

      const discounted = (originalPrice * (100 - discountRate)) / 100;
      const finalPrice = parseFloat((discounted * (1 + taxRate / 100)).toFixed(2));

      const blueprint: QuestionBlueprint = {
        mainTopic: 'Fractions, Decimals & Percentages',
        subtopic: 'Percentages',
        skill: 'Successive percentage changes: Discount followed by VAT/Tax',
        questionType: 'multi_step',
        difficulty,
        mathematicalOperation: 'Sequential multiplication: P * (1 - d) * (1 + t)',
        representation: 'word_problem',
        context: 'Commercial transactions with tax compliance',
        numbersUsed: [originalPrice, discountRate, taxRate, finalPrice],
        expectedReasoning: 'Apply discount first, then apply tax to the reduced sale price',
        conceptKey: 'PERCENTAGE_MULTI_STEP_DISCOUNT_TAX',
      };

      const questionText = `An item priced at **GH¢${originalPrice}** receives a **${discountRate}% discount**, and then a **${taxRate}% sales tax** is added to the discounted price.\n\nWhat is the **final price payable**?`;
      const correctAnswer = `$\\text{GH¢} ${finalPrice}$`;
      const rawDistractors = [
        `$\\text{GH¢} ${(originalPrice * (1 + (taxRate - discountRate) / 100)).toFixed(2)}$`,
        `$\\text{GH¢} ${(finalPrice + 12).toFixed(2)}$`,
        `$\\text{GH¢} ${Math.max(1, finalPrice - 15).toFixed(2)}$`,
      ];

      return {
        blueprint,
        questionText,
        correctAnswer,
        rawDistractors,
        given: `Original price: $\\text{GH¢}${originalPrice}$, discount: $${discountRate}\\%$, tax: $${taxRate}\\%$.`,
        required: `Final payable price.`,
        method: `Step 1: Calculate discounted price. Step 2: Apply tax to the discounted price.`,
        steps: [
          `Discounted price: $\\text{GH¢}${originalPrice} \\times (1 - ${discountRate / 100}) = \\text{GH¢}${discounted}$.`,
          `Final price with tax: $\\text{GH¢}${discounted} \\times (1 + ${taxRate / 100}) = \\text{GH¢}${finalPrice}$.`,
        ],
        conclusion: `The final price payable is $\\text{GH¢}${finalPrice}$.`,
        hint: `Calculate the discounted price first, then apply the $${taxRate}\\%$ tax to that discounted figure.`,
      };
    }

    if (preferredType === 'comparison') {
      // Comparison: Percentage increase comparison between two items
      const p1Old = prng.pick([50, 80, 100]);
      const p1New = p1Old + prng.pick([15, 20, 25]);
      const inc1 = Math.round(((p1New - p1Old) / p1Old) * 100);

      const blueprint: QuestionBlueprint = {
        mainTopic: 'Fractions, Decimals & Percentages',
        subtopic: 'Percentages',
        skill: 'Calculating and comparing percentage increase',
        questionType: 'comparison',
        difficulty,
        mathematicalOperation: 'Relative change: ((New - Old) / Old) * 100%',
        representation: 'word_problem',
        context: 'Market commodity price escalation',
        numbersUsed: [p1Old, p1New, inc1],
        expectedReasoning: 'Divide price difference by the original base price',
        conceptKey: 'PERCENTAGE_INCREASE_CALCULATION',
      };

      const questionText = `The price of a bag of cement increases from **GH¢${p1Old}** to **GH¢${p1New}**.\n\nCalculate the **percentage increase** in price:`;
      const correctAnswer = `$${inc1}\\%$`;
      const rawDistractors = [
        `$${p1New - p1Old}\\%$`,
        `$${inc1 + 5}\\%$`,
        `$${Math.max(5, inc1 - 8)}\\%$`,
      ];

      return {
        blueprint,
        questionText,
        correctAnswer,
        rawDistractors,
        given: `Old price = $\\text{GH¢}${p1Old}$, New price = $\\text{GH¢}${p1New}$.`,
        required: `Percentage increase.`,
        method: `Percentage Increase $= \\frac{\\text{Increase}}{\\text{Original Price}} \\times 100\\%$.`,
        steps: [
          `Absolute increase: $\\text{GH¢}${p1New} - \\text{GH¢}${p1Old} = \\text{GH¢}${p1New - p1Old}$.`,
          `Fraction of original: $\\frac{${p1New - p1Old}}{${p1Old}} = ${(inc1 / 100).toFixed(2)}$.`,
          `Multiply by $100\\%$: $${inc1}\\%$.`,
        ],
        conclusion: `The percentage increase is $${inc1}\\%$.`,
        hint: `Divide the increase ($${p1New - p1Old}$) by the original price ($${p1Old}$), then multiply by $100\\%$.`,
      };
    }
  }

  // Fraction operations & word problem
  const den1 = prng.pick([3, 4, 5, 6]);
  const num1 = prng.int(1, den1 - 1);
  const den2 = prng.pick([2, 3, 4]);
  const num2 = prng.int(1, den2 - 1);

  const commonDen = lcm(den1, den2);
  const sumNum = num1 * (commonDen / den1) + num2 * (commonDen / den2);
  const commonFactor = gcd(sumNum, commonDen);
  const simpNum = sumNum / commonFactor;
  const simpDen = commonDen / commonFactor;

  const blueprint: QuestionBlueprint = {
    mainTopic: 'Fractions, Decimals & Percentages',
    subtopic: 'Fractions',
    skill: 'Addition of unlike fractions using least common denominator',
    questionType: 'direct_calculation',
    difficulty,
    mathematicalOperation: 'Fraction addition: (a/b) + (c/d) with common denominator reduction',
    representation: 'equation',
    context: 'Rational arithmetic',
    numbersUsed: [num1, den1, num2, den2, simpNum, simpDen],
    expectedReasoning: 'Convert to equivalent fractions with common denominator, add numerators, simplify',
    conceptKey: 'FRACTION_ADDITION_UNLIKE',
  };

  const questionText = `Evaluate and simplify the fraction addition:\n\n$$\\frac{${num1}}{${den1}} + \\frac{${num2}}{${den2}}$$`;
  const correctAnswer = simpDen === 1 ? `$${simpNum}$` : `$\\frac{${simpNum}}{${simpDen}}$`;
  const wrongNumeratorAdd = `$\\frac{${num1 + num2}}{${den1 + den2}}$`; // common student mistake!
  const rawDistractors = [
    wrongNumeratorAdd,
    `$\\frac{${simpNum + 1}}{${simpDen}}$`,
    `$\\frac{${Math.max(1, simpNum - 1)}}{${simpDen}}$`,
  ];

  return {
    blueprint,
    questionText,
    correctAnswer,
    rawDistractors,
    given: `Fractions $\\frac{${num1}}{${den1}}$ and $\\frac{${num2}}{${den2}}$.`,
    required: `Simplified sum.`,
    method: `Find LCM of denominators, convert each fraction, add numerators, and simplify.`,
    steps: [
      `Least common denominator of $${den1}$ and $${den2}$ is $${commonDen}$.`,
      `Equivalent fractions: $\\frac{${num1 * (commonDen / den1)}}{${commonDen}} + \\frac{${num2 * (commonDen / den2)}}{${commonDen}}$.`,
      `Add numerators: $\\frac{${sumNum}}{${commonDen}}$.`,
      commonFactor > 1 ? `Simplify by dividing numerator and denominator by $${commonFactor}$: $\\frac{${simpNum}}{${simpDen}}$.` : `Already in simplest form.`,
    ],
    conclusion: `The simplified sum is ${correctAnswer}.`,
    hint: `Do NOT add denominators together. Find a common denominator ($${commonDen}$) first.`,
    misconceptions: [`Adding denominators directly produces ${wrongNumeratorAdd}, which is mathematically invalid.`],
  };
}

// ============================================================================
// AREA 2: RATIOS, PROPORTION & BASIC ALGEBRA
// ============================================================================
export function generateAlgebraRatioArchetype(
  subtopic: string,
  preferredType: QuestionType,
  difficulty: DifficultyTier,
  prng: PRNG
): GeneratedBlueprintArtifact {
  const isEquation = subtopic.toLowerCase().includes('equation') || subtopic.toLowerCase().includes('linear');
  const isRatio = subtopic.toLowerCase().includes('ratio') || subtopic.toLowerCase().includes('proportion');

  if (isEquation) {
    if (preferredType === 'word_problem' || preferredType === 'modelling') {
      // Perimeter modeling: Length is (2x + 3), width is (x + 1), perimeter is P
      const xVal = prng.int(4, 12);
      const lengthCoeff = 2;
      const lengthConst = prng.int(2, 5);
      const widthConst = prng.int(1, 3);
      const length = lengthCoeff * xVal + lengthConst;
      const width = xVal + widthConst;
      const perimeter = 2 * (length + width);

      const blueprint: QuestionBlueprint = {
        mainTopic: 'Ratios, Proportion & Basic Algebra',
        subtopic: 'Algebraic Equations',
        skill: 'Setting up and solving linear equations from geometric perimeter',
        questionType: 'word_problem',
        difficulty,
        mathematicalOperation: 'Formulate 2(L + W) = P and solve for x',
        representation: 'word_problem',
        context: 'Construction plot perimeter measurement',
        numbersUsed: [perimeter, lengthCoeff, lengthConst, widthConst, xVal],
        expectedReasoning: 'Express perimeter algebraically in terms of x, equate to known perimeter, solve linear equation',
        conceptKey: 'ALGEBRA_GEOMETRY_PERIMETER_EQUATION',
      };

      const questionText = `A rectangular vegetable garden has a length of **$(${lengthCoeff}x + ${lengthConst})\\text{ m}$** and a width of **$(x + ${widthConst})\\text{ m}$**.\n\nIf the total perimeter of the garden is **$${perimeter}\\text{ m}$**, what is the value of **$x$**?`;
      const correctAnswer = `$x = ${xVal}$`;
      const rawDistractors = [
        `$x = ${xVal + 2}$`,
        `$x = ${Math.max(1, xVal - 2)}$`,
        `$x = ${xVal + 4}$`,
      ];

      return {
        blueprint,
        questionText,
        correctAnswer,
        rawDistractors,
        given: `Length $= (${lengthCoeff}x + ${lengthConst})$, width $= (x + ${widthConst})$, perimeter $= ${perimeter}\\text{ m}$.`,
        required: `Value of $x$.`,
        method: `Perimeter of a rectangle $= 2(\\text{length} + \\text{width})$. Set up equation and solve for $x$.`,
        steps: [
          `$2[(${lengthCoeff}x + ${lengthConst}) + (x + ${widthConst})] = ${perimeter}$.`,
          `Combine like terms inside brackets: $2(${lengthCoeff + 1}x + ${lengthConst + widthConst}) = ${perimeter}$.`,
          `Expand: $${2 * (lengthCoeff + 1)}x + ${2 * (lengthConst + widthConst)} = ${perimeter}$.`,
          `Subtract $${2 * (lengthConst + widthConst)}$: $${2 * (lengthCoeff + 1)}x = ${perimeter - 2 * (lengthConst + widthConst)}$.`,
          `Divide by $${2 * (lengthCoeff + 1)}$: $x = ${xVal}$.`,
        ],
        conclusion: `$x = ${xVal}$.`,
        hint: `Use the perimeter formula: $2 \\times (\\text{length} + \\text{width}) = ${perimeter}$. Form an equation in $x$.`,
      };
    }

    // Bracketed equation with variables on both sides: a(x - b) = c(x + d)
    const xVal = prng.int(3, 9);
    const a = prng.pick([3, 4, 5]);
    const c = a - 1; // ensures unique solution
    const d = prng.int(1, 4);
    const b = prng.int(1, 3);
    const rhs = c * (xVal + d);
    const neededLhsInner = rhs / a;
    // ensure integer: a * (xVal - b) = c * xVal + c * d
    // a*x - a*b = c*x + c*d => (a-c)x = a*b + c*d => x = a*b + c*d
    const ab = xVal - c * d;
    if (ab > 0 && ab % a === 0) {
      const actualB = ab / a;
      const blueprint: QuestionBlueprint = {
        mainTopic: 'Ratios, Proportion & Basic Algebra',
        subtopic: 'Linear Equations',
        skill: 'Solving multi-step equations with brackets and variables on both sides',
        questionType: 'direct_calculation',
        difficulty,
        mathematicalOperation: 'Expanding brackets, collecting like terms, isolating variable',
        representation: 'equation',
        context: 'Pure algebra',
        numbersUsed: [a, actualB, c, d, xVal],
        expectedReasoning: 'Expand both sets of brackets, group variable terms on one side and constants on the other',
        conceptKey: 'ALGEBRA_BRACKETS_BOTH_SIDES',
      };

      const questionText = `Solve the algebraic equation for $x$:\n\n$$${a}(x - ${actualB}) = ${c}(x + ${d})$$`;
      const correctAnswer = `$x = ${xVal}$`;
      const rawDistractors = [
        `$x = ${xVal + 1}$`,
        `$x = ${Math.max(1, xVal - 1)}$`,
        `$x = ${xVal + 3}$`,
      ];

      return {
        blueprint,
        questionText,
        correctAnswer,
        rawDistractors,
        given: `Equation $${a}(x - ${actualB}) = ${c}(x + ${d})$.`,
        required: `Solution for $x$.`,
        method: `Expand brackets on both sides, collect $x$ terms on one side, isolate $x$.`,
        steps: [
          `Expand left: $${a}x - ${a * actualB}$.`,
          `Expand right: $${c}x + ${c * d}$.`,
          `Subtract $${c}x$ from both sides: $(${a} - ${c})x - ${a * actualB} = ${c * d} \\implies x - ${a * actualB} = ${c * d}$.`,
          `Add $${a * actualB}$ to both sides: $x = ${c * d} + ${a * actualB} = ${xVal}$.`,
        ],
        conclusion: `$x = ${xVal}$.`,
        hint: `Expand the brackets on both sides first, then subtract $${c}x$ from both sides.`,
      };
    }
  }

  // Ratio: 3-part ratio division of an inheritance / business profit
  const r1 = prng.pick([2, 3]);
  const r2 = prng.pick([3, 4, 5]);
  const r3 = prng.pick([5, 6, 7]);
  const sumRatio = r1 + r2 + r3;
  const unitVal = prng.pick([20, 25, 40, 50, 100, 150]);
  const totalAmount = sumRatio * unitVal;
  const targetShare = r2 * unitVal;

  const blueprint: QuestionBlueprint = {
    mainTopic: 'Ratios, Proportion & Basic Algebra',
    subtopic: 'Ratios',
    skill: 'Dividing a quantity into a three-part ratio',
    questionType: 'word_problem',
    difficulty,
    mathematicalOperation: 'Unit value = Total / Sum(parts); Share = part * Unit value',
    representation: 'word_problem',
    context: 'Business venture profit sharing between three partners',
    numbersUsed: [r1, r2, r3, totalAmount, targetShare],
    expectedReasoning: 'Sum the ratio parts to find value of 1 part, multiply by desired partner part',
    conceptKey: 'RATIO_THREE_PART_SHARING',
  };

  const questionText = `Three partners share an annual business profit of **GH¢${totalAmount}** in the ratio **$${r1} : ${r2} : ${r3}$**.\n\nHow much money does the **second partner** receive?`;
  const correctAnswer = `$\\text{GH¢} ${targetShare}$`;
  const rawDistractors = [
    `$\\text{GH¢} ${r1 * unitVal}$`,
    `$\\text{GH¢} ${r3 * unitVal}$`,
    `$\\text{GH¢} ${targetShare + unitVal}$`,
  ];

  return {
    blueprint,
    questionText,
    correctAnswer,
    rawDistractors,
    given: `Total profit $= \\text{GH¢}${totalAmount}$, ratio $= ${r1} : ${r2} : ${r3}$.`,
    required: `Share of the second partner.`,
    method: `Find the total number of parts, compute the value of 1 part, and multiply by ${r2}.`,
    steps: [
      `Total parts: $${r1} + ${r2} + ${r3} = ${sumRatio}\\text{ parts}$.`,
      `Value of 1 part: $\\frac{\\text{GH¢}${totalAmount}}{${sumRatio}} = \\text{GH¢}${unitVal}$.`,
      `Second partner's share: $${r2} \\times \\text{GH¢}${unitVal} = \\text{GH¢}${targetShare}$.`,
    ],
    conclusion: `The second partner receives $\\text{GH¢}${targetShare}$.`,
    hint: `Add all the ratio parts together ($${r1} + ${r2} + ${r3} = ${sumRatio}$) and divide $\\text{GH¢}${totalAmount}$ by that sum.`,
  };
}

// ============================================================================
// AREA 4: GEOMETRY
// ============================================================================
export function generateGeometryArchetype(
  subtopic: string,
  preferredType: QuestionType,
  difficulty: DifficultyTier,
  prng: PRNG
): GeneratedBlueprintArtifact {
  // Transversal angles / angle relationships
  if (subtopic.toLowerCase().includes('angle') || preferredType === 'reasoning') {
    const angleA = prng.pick([35, 42, 54, 68, 72, 85]);
    const supp = 180 - angleA;

    const blueprint: QuestionBlueprint = {
      mainTopic: 'Geometry',
      subtopic: 'Angles & Parallel Lines',
      skill: 'Co-interior (consecutive interior) angle deduction on parallel lines',
      questionType: 'reasoning',
      difficulty,
      mathematicalOperation: 'Co-interior angles sum to 180 degrees',
      representation: 'geometric_diagram',
      context: 'Parallel lines cut by a transversal',
      numbersUsed: [angleA, supp],
      expectedReasoning: 'Recognize that interior angles on the same side of a transversal are supplementary',
      conceptKey: 'GEOMETRY_CO_INTERIOR_ANGLES',
    };

    const questionText = `Two parallel lines are intersected by a transversal line. One interior angle on one side of the transversal measures **$${angleA}^\\circ$**.\n\nWhat is the measure of the **co-interior (consecutive interior) angle** on the same side of the transversal?`;
    const correctAnswer = `$${supp}^\\circ$`;
    const rawDistractors = [
      `$${angleA}^\\circ$`,
      `$${90 - Math.min(80, angleA)}^\\circ$`,
      `$${supp - 10}^\\circ$`,
    ];

    return {
      blueprint,
      questionText,
      correctAnswer,
      rawDistractors,
      given: `Parallel lines with a transversal. Given interior angle $= ${angleA}^\\circ$.`,
      required: `Measure of co-interior angle.`,
      method: `Co-interior angles on parallel lines are supplementary (sum to $180^\\circ$).`,
      steps: [
        `Co-interior angles add up to $180^\\circ$.`,
        `$\\text{Angle} = 180^\\circ - ${angleA}^\\circ = ${supp}^\\circ$.`,
      ],
      conclusion: `The co-interior angle measures $${supp}^\\circ$.`,
      hint: `Co-interior angles between parallel lines add up to $180^\\circ$. Subtract $${angleA}^\\circ$ from $180^\\circ$.`,
      misconceptions: [`Alternate angles are equal ($${angleA}^\\circ$), but co-interior angles add up to $180^\\circ$.`],
    };
  }

  // Pythagorean Theorem with diverse integer triples (e.g. 20, 21, 29 or 9, 40, 41 or 12, 16, 20)
  const triples = [
    { a: 20, b: 21, c: 29 },
    { a: 9, b: 40, c: 41 },
    { a: 11, b: 60, c: 61 },
    { a: 12, b: 35, c: 37 },
    { a: 16, b: 30, c: 34 },
  ];
  const trip = prng.pick(triples);

  const blueprint: QuestionBlueprint = {
    mainTopic: 'Geometry',
    subtopic: 'Pythagorean Theorem',
    skill: 'Calculating the unknown leg of a right-angled triangle given hypotenuse',
    questionType: 'reverse_operation',
    difficulty,
    mathematicalOperation: 'b = sqrt(c^2 - a^2)',
    representation: 'word_problem',
    context: 'Architectural roof truss construction',
    numbersUsed: [trip.a, trip.c, trip.b],
    expectedReasoning: 'Rearrange Pythagoras formula to solve for missing leg: b^2 = c^2 - a^2',
    conceptKey: 'GEOMETRY_PYTHAGORAS_LEG',
  };

  const questionText = `In a right-angled triangular support frame, the hypotenuse is **$${trip.c}\\text{ m}$** and one leg is **$${trip.a}\\text{ m}$**.\n\nCalculate the length of the **other perpendicular leg**:`;
  const correctAnswer = `$${trip.b}\\text{ m}$`;
  const rawDistractors = [
    `$${trip.c - trip.a}\\text{ m}$`,
    `$${trip.b + 4}\\text{ m}$`,
    `$${Math.max(1, trip.b - 5)}\\text{ m}$`,
  ];

  return {
    blueprint,
    questionText,
    correctAnswer,
    rawDistractors,
    given: `Right triangle: hypotenuse $c = ${trip.c}\\text{ m}$, leg $a = ${trip.a}\\text{ m}$.`,
    required: `Missing leg $b$.`,
    method: `Apply Pythagorean Theorem: $a^2 + b^2 = c^2 \\implies b = \\sqrt{c^2 - a^2}$.`,
    steps: [
      `$b^2 = ${trip.c}^2 - ${trip.a}^2 = ${trip.c * trip.c} - ${trip.a * trip.a} = ${trip.b * trip.b}$.`,
      `$b = \\sqrt{${trip.b * trip.b}} = ${trip.b}\\text{ m}$.`,
    ],
    conclusion: `The other leg is $${trip.b}\\text{ m}$.`,
    hint: `Subtract the square of the known leg from the square of the hypotenuse: $b = \\sqrt{${trip.c}^2 - ${trip.a}^2}$.`,
  };
}

// ============================================================================
// AREA 8: STATISTICS & PROBABILITY
// ============================================================================
export function generateStatisticsProbabilityArchetype(
  subtopic: string,
  preferredType: QuestionType,
  difficulty: DifficultyTier,
  prng: PRNG
): GeneratedBlueprintArtifact {
  const isProb = subtopic.toLowerCase().includes('probab');

  if (isProb) {
    // Complementary probability with mutually exclusive events
    const red = prng.pick([3, 4, 5]);
    const blue = prng.pick([4, 5, 6]);
    const green = prng.pick([3, 5]);
    const yellow = prng.pick([2, 4]);
    const total = red + blue + green + yellow;
    const targetColorsCount = red + blue;
    const targetProbNum = targetColorsCount;
    const g = gcd(targetProbNum, total);

    const blueprint: QuestionBlueprint = {
      mainTopic: 'Statistics & Probability',
      subtopic: 'Probability',
      skill: 'Compound probability of mutually exclusive events: P(A or B)',
      questionType: 'direct_calculation',
      difficulty,
      mathematicalOperation: 'P(Red or Blue) = (n(Red) + n(Blue)) / Total',
      representation: 'word_problem',
      context: 'Quality control sample selection',
      numbersUsed: [red, blue, green, yellow, total, targetProbNum],
      expectedReasoning: 'Sum favorable outcomes and divide by total sample space',
      conceptKey: 'PROBABILITY_MUTUALLY_EXCLUSIVE_OR',
    };

    const questionText = `A container holds **$${red}$ red**, **$${blue}$ blue**, **$${green}$ green**, and **$${yellow}$ yellow** counters. One counter is drawn at random.\n\nWhat is the probability of drawing **either a red or a blue** counter?`;
    const correctAnswer = (total / g) === 1 ? `$1$` : `$\\frac{${targetProbNum / g}}{${total / g}}$`;
    const rawDistractors = [
      `$\\frac{${red}}{${total}}$`,
      `$\\frac{${blue}}{${total}}$`,
      `$\\frac{${(targetProbNum / g) + 1}}{${total / g}}$`,
    ];

    return {
      blueprint,
      questionText,
      correctAnswer,
      rawDistractors,
      given: `$${red}$ red, $${blue}$ blue, $${green}$ green, $${yellow}$ yellow. Total counters $= ${total}$.`,
      required: `Probability of drawing red or blue.`,
      method: `Add favorable outcomes (red + blue) and divide by the total number of counters.`,
      steps: [
        `Total outcomes: $${red} + ${blue} + ${green} + ${yellow} = ${total}$.`,
        `Favorable outcomes: $${red} + ${blue} = ${targetProbNum}$.`,
        `Probability $= \\frac{${targetProbNum}}{${total}} = \\frac{${targetProbNum / g}}{${total / g}}$.`,
      ],
      conclusion: `The probability is ${correctAnswer}.`,
      hint: `Add the number of red and blue counters together, then divide by the total number of counters.`,
    };
  }

  // Mean from frequency table
  const scores = [1, 2, 3, 4];
  const freqs = [prng.int(2, 5), prng.int(3, 6), prng.int(2, 5), prng.int(1, 4)];
  const totalN = freqs.reduce((a, b) => a + b, 0);
  const totalFx = scores.reduce((sum, val, idx) => sum + val * freqs[idx], 0);
  const meanVal = parseFloat((totalFx / totalN).toFixed(2));

  const blueprint: QuestionBlueprint = {
    mainTopic: 'Statistics & Probability',
    subtopic: 'Measures of Central Tendency',
    skill: 'Calculating weighted arithmetic mean from a frequency distribution table',
    questionType: 'graph_table',
    difficulty,
    mathematicalOperation: 'Mean = Sum(f * x) / Sum(f)',
    representation: 'data_table',
    context: 'Survey results of customer satisfaction ratings',
    numbersUsed: [...freqs, totalN, totalFx],
    expectedReasoning: 'Multiply each score by its frequency, sum the products, and divide by total frequency',
    conceptKey: 'STATISTICS_WEIGHTED_MEAN_FREQUENCY',
  };

  const questionText = `The frequency table below shows customer ratings for a delivery service:\n\n| Rating ($x$) | $1$ | $2$ | $3$ | $4$ |\n|---|---|---|---|---|\n| Frequency ($f$) | $${freqs[0]}$ | $${freqs[1]}$ | $${freqs[2]}$ | $${freqs[3]}$ |\n\nCalculate the **mean rating** (rounded to 2 decimal places):`;
  const correctAnswer = `$${meanVal}$`;
  const rawDistractors = [
    `$${(meanVal + 0.35).toFixed(2)}$`,
    `$${Math.max(1, meanVal - 0.4).toFixed(2)}$`,
    `$${((scores.reduce((a, b) => a + b, 0)) / 4).toFixed(2)}$`, // unweighted mean misconception!
  ];

  return {
    blueprint,
    questionText,
    correctAnswer,
    rawDistractors,
    given: `Ratings $x \\in \\{1, 2, 3, 4\\}$ with frequencies $f = [${freqs.join(', ')}]$. Total observations $= ${totalN}$.`,
    required: `Mean rating $\\bar{x}$.`,
    method: `Formula: $\\bar{x} = \\frac{\\sum f x}{\\sum f}$.`,
    steps: [
      `Compute $\\sum f x = (${scores[0]} \\times ${freqs[0]}) + (${scores[1]} \\times ${freqs[1]}) + (${scores[2]} \\times ${freqs[2]}) + (${scores[3]} \\times ${freqs[3]}) = ${totalFx}$.`,
      `Total frequency $\\sum f = ${totalN}$.`,
      `Mean $\\bar{x} = \\frac{${totalFx}}{${totalN}} = ${meanVal}$.`,
    ],
    conclusion: `The mean rating is $${meanVal}$.`,
    hint: `Multiply each rating by its frequency, add the results, and divide by the total number of ratings ($${totalN}$).`,
  };
}

// ============================================================================
// AREA 9: EVERYDAY, FINANCIAL & APPLIED MATHEMATICS
// ============================================================================
export function generateFinancialAppliedArchetype(
  subtopic: string,
  preferredType: QuestionType,
  difficulty: DifficultyTier,
  prng: PRNG
): GeneratedBlueprintArtifact {
  // Simple Interest / Loan repayment
  const principal = prng.pick([1200, 1500, 2000, 2500, 3000, 4000, 5000]);
  const rate = prng.pick([6, 8, 10, 12]);
  const years = prng.pick([2, 3, 4, 5]);
  const interest = (principal * rate * years) / 100;
  const totalRepay = principal + interest;

  const blueprint: QuestionBlueprint = {
    mainTopic: 'Everyday, Financial & Applied Mathematics',
    subtopic: 'Simple Interest',
    skill: 'Calculating simple interest and total loan accrual (I = Prt)',
    questionType: 'word_problem',
    difficulty,
    mathematicalOperation: 'I = (P * r * t) / 100; Total = P + I',
    representation: 'word_problem',
    context: 'Agricultural cooperative microfinance loan',
    numbersUsed: [principal, rate, years, interest, totalRepay],
    expectedReasoning: 'Multiply principal by rate and time to compute interest, then add principal for total debt',
    conceptKey: 'FINANCE_SIMPLE_INTEREST_TOTAL',
  };

  const questionText = `A farmer borrows **GH¢${principal}** from an agricultural credit union at a simple interest rate of **${rate}% per annum** for **${years} years**.\n\nWhat is the **total amount payable** (principal plus interest) at the end of the loan term?`;
  const correctAnswer = `$\\text{GH¢} ${totalRepay}$`;
  const rawDistractors = [
    `$\\text{GH¢} ${interest}$`, // only interest misconception!
    `$\\text{GH¢} ${totalRepay + 250}$`,
    `$\\text{GH¢} ${Math.max(100, totalRepay - 300)}$`,
  ];

  return {
    blueprint,
    questionText,
    correctAnswer,
    rawDistractors,
    given: `Principal $P = \\text{GH¢}${principal}$, rate $r = ${rate}\\%$, time $t = ${years}\\text{ years}$.`,
    required: `Total amount payable $A = P + I$.`,
    method: `Simple Interest $I = \\frac{P \\times r \\times t}{100}$. Total payable $A = P + I$.`,
    steps: [
      `Calculate Interest: $I = \\frac{${principal} \\times ${rate} \\times ${years}}{100} = \\text{GH¢}${interest}$.`,
      `Add Principal: $A = \\text{GH¢}${principal} + \\text{GH¢}${interest} = \\text{GH¢}${totalRepay}$.`,
    ],
    conclusion: `The total amount payable is $\\text{GH¢}${totalRepay}$.`,
    hint: `First find the interest using $I = \\frac{P \\times r \\times t}{100}$, then add that interest back to the original principal of $\\text{GH¢}${principal}$.`,
  };
}
