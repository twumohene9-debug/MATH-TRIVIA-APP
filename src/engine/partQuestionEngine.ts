import { Question, WorkedSolution } from '../types';
import { PRNG, buildOptions } from './generators/shared';
import { CURRICULUM_PARTS, getCurriculumPart, CurriculumUnit } from '../data/curriculumParts';
import { generateTopicQuestion } from './topicQuestionEngine';
import { extractMathematicalConcept, getTopicFamily, areQuestionsSimilar } from './questionBank';

export interface PartQuizOptions {
  partId: number; // 1 to 10
  unitId?: string; // Optional specific unit
  questionCount?: number; // default 5 or 10
  seed?: number;
  recentQuestionIds?: string[];
  recentQuestionStems?: string[];
  recentTopics?: string[];
  recentConceptKeys?: string[];
}

/**
 * Generates an authentic, high-quality question for any of the 10 Curriculum Parts.
 * Adheres strictly to the user requirement:
 * - Parts 1–5: exactly 3 alternatives / options
 * - Parts 6–10: exactly 4 alternatives / options
 * - Standardized LaTeX math formatting ($...$ and $$...$$)
 * - Complete step-by-step worked solution
 */
export function generateCurriculumPartQuestion(params: {
  partId: number;
  unit: CurriculumUnit;
  subtopic: string;
  questionIndex: number;
  seed: number;
}): Question {
  const { partId, unit, subtopic, questionIndex, seed } = params;
  const prng = new PRNG(seed);
  const optionCount = partId <= 5 ? 3 : 4;
  const qId = `part_${partId}_${unit.id}_${questionIndex}_${seed}`;

  // Stage mapping approximation for universal topic question generator:
  // Part 1: Stage 1-10
  // Part 2: Stage 11-20
  // Part 3: Stage 21-30
  // Part 4: Stage 31-40
  // Part 5: Stage 41-50
  // Part 6: Stage 51-60
  // Part 7: Stage 61-70
  // Part 8: Stage 71-80
  // Part 9: Stage 81-90
  // Part 10: Stage 91-100
  const representativeStage = Math.min(100, (partId - 1) * 10 + Math.min(10, questionIndex + 1));
  const topicId = (partId - 1) * 100 + prng.int(1, 100);

  // Attempt generation via universal topic generator
  try {
    const artifact = generateTopicQuestion({
      topicName: subtopic,
      topicArea: unit.strand || `Part ${partId}: ${unit.name}`,
      topicId,
      stageId: representativeStage,
      levelId: 10,
      blockId: 1,
      questionIndex,
      difficulty: partId <= 3 ? 'foundation' : partId <= 6 ? 'developing' : partId <= 8 ? 'advanced' : 'mastery',
      prng,
    });

    if (artifact && artifact.correctAnswer && artifact.rawDistractors && artifact.rawDistractors.length >= 2) {
      const { options, correctIndex } = buildOptions(artifact.correctAnswer, artifact.rawDistractors, prng, optionCount);
      return {
        id: qId,
        stageId: representativeStage,
        levelId: partId,
        blockId: questionIndex + 1,
        topic: subtopic,
        area: unit.name,
        principle: `${unit.name} · ${subtopic}`,
        difficulty: partId <= 3 ? 'foundation' : partId <= 6 ? 'developing' : partId <= 8 ? 'advanced' : 'mastery',
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
  } catch (err) {
    // Continue to specialized part generators below
  }

  // Fallback to specialized dedicated Part curriculum generators
  return generateSpecializedPartQuestion(partId, unit, subtopic, questionIndex, prng, optionCount, qId, representativeStage);
}

function generateSpecializedPartQuestion(
  partId: number,
  unit: CurriculumUnit,
  subtopic: string,
  questionIndex: number,
  prng: PRNG,
  optionCount: number,
  qId: string,
  representativeStage: number
): Question {
  let questionText = '';
  let correctAnswer = '';
  let rawDistractors: string[] = [];
  let given = '';
  let required = '';
  let method = '';
  let steps: string[] = [];
  let conclusion = '';
  let hint = '';

  const nameL = subtopic.toLowerCase();

  // Part 10: Further Math / Mastery
  if (partId === 10) {
    if (nameL.includes('harmonic') || nameL.includes('cos') || nameL.includes('sin')) {
      const a = prng.pick([3, 5, 7, 8]);
      const b = prng.pick([4, 12, 24, 15]);
      const r = Math.round(Math.sqrt(a * a + b * b));
      questionText = `Express the linear combination of sinusoidal functions in harmonic form $R\\cos(\\theta - \\alpha)$:\n\n$$f(\\theta) = ${a}\\cos \\theta + ${b}\\sin \\theta$$\n\nWhat is the exact maximum value (amplitude $R$) of $f(\\theta)$?`;
      correctAnswer = `$${r}$`;
      rawDistractors = [`$${a + b}$`, `$${Math.abs(a - b)}$`, `$${r * 2}$`, `$${r - 1}$`];
      given = `Function $f(\\theta) = ${a}\\cos \\theta + ${b}\\sin \\theta$.`;
      required = `Maximum amplitude $R$.`;
      method = `In harmonic form $a\\cos \\theta + b\\sin \\theta = R\\cos(\\theta - \\alpha)$, the amplitude is $R = \\sqrt{a^2 + b^2}$.`;
      steps = [`$R = \\sqrt{${a}^2 + ${b}^2} = \\sqrt{${a * a} + ${b * b}} = \\sqrt{${a * a + b * b}} = ${r}$.`];
      conclusion = `The maximum amplitude $R$ is $${r}$.`;
      hint = `Compute $\\sqrt{a^2 + b^2}$ using the coefficients of $\\cos \\theta$ and $\\sin \\theta$.`;
    } else if (nameL.includes('volume') || nameL.includes('revolution')) {
      const a = prng.pick([2, 3, 4]);
      const vol = Math.round(Math.PI * (Math.pow(a, 3) / 3));
      questionText = `Find the volume of the solid of revolution generated when the curve $y = x$ from $x = 0$ to $x = ${a}$ is rotated completely ($360^\\circ$) about the $x$-axis:`;
      const coeff = Math.round((Math.pow(a, 3) / 3) * 3) / 3;
      correctAnswer = `$\\dfrac{${Math.pow(a, 3)}}{3}\\pi$`;
      rawDistractors = [`$${Math.pow(a, 2)}\\pi$`, `$\\dfrac{${Math.pow(a, 2)}}{2}\\pi$`, `$${Math.pow(a, 3)}\\pi$`];
      given = `Curve $y = x$, interval $[0, ${a}]$, rotation about the $x$-axis.`;
      required = `Volume of revolution $V$.`;
      method = `Use disk method: $V = \\pi \\int_0^a y^2 dx$.`;
      steps = [
        `$V = \\pi \\int_0^{${a}} x^2 dx = \\pi \\left[ \\dfrac{x^3}{3} \\right]_0^{${a}}$,`,
        `$= \\pi \\left( \\dfrac{${a}^3}{3} - 0 \\right) = \\dfrac{${Math.pow(a, 3)}}{3}\\pi$.`,
      ];
      conclusion = `The volume of revolution is $\\dfrac{${Math.pow(a, 3)}}{3}\\pi$.`;
      hint = `Recall $V = \\pi \\int_a^b y^2 dx$. Integrate $x^2$ to get $\\frac{x^3}{3}$.`;
    } else if (nameL.includes('spearman') || nameL.includes('correlation')) {
      const n = 5;
      const d2 = prng.pick([2, 4, 6, 8]);
      const denom = n * (n * n - 1);
      const rs = (1 - (6 * d2) / denom).toFixed(2);
      questionText = `In a bivariate study with $n = ${n}$ paired observations, the sum of squared rank differences is $\\sum d^2 = ${d2}$.\n\nCalculate Spearman's rank correlation coefficient $r_s$:`;
      correctAnswer = `$${rs}$`;
      rawDistractors = [`$${(1 - (4 * d2) / denom).toFixed(2)}$`, `$${(parseFloat(rs) - 0.2).toFixed(2)}$`, `$${(parseFloat(rs) + 0.15).toFixed(2)}$`];
      given = `$n = ${n}$, $\\sum d^2 = ${d2}$.`;
      required = `Spearman's rank correlation $r_s$.`;
      method = `Apply formula: $r_s = 1 - \\dfrac{6\\sum d^2}{n(n^2 - 1)}$.`;
      steps = [
        `Denominator $n(n^2 - 1) = ${n}(${n * n} - 1) = ${n}(${n * n - 1}) = ${denom}$.`,
        `Fraction $\\dfrac{6 \\times ${d2}}{${denom}} = \\dfrac{${6 * d2}}{${denom}} = ${( (6 * d2) / denom ).toFixed(4)}$.`,
        `$r_s = 1 - ${( (6 * d2) / denom ).toFixed(4)} = ${rs}$.`,
      ];
      conclusion = `Spearman's rank correlation coefficient is $${rs}$.`;
      hint = `Recall $r_s = 1 - \\frac{6\\sum d^2}{n(n^2 - 1)}$.`;
    } else {
      // Linear transformation matrix
      const a = prng.pick([2, 3]);
      const b = prng.pick([-1, 1]);
      const c = prng.pick([0, 2]);
      const d = prng.pick([1, 4]);
      const px = prng.pick([2, 3]);
      const py = prng.pick([1, 2]);
      const xPrime = a * px + b * py;
      const yPrime = c * px + d * py;
      questionText = `A plane transformation is represented by the matrix $M = \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}$.\n\nFind the image of point $P(${px}, ${py})$ under transformation $M$:`;
      correctAnswer = `$(${xPrime},\\; ${yPrime})$`;
      rawDistractors = [`$(${xPrime + 2},\\; ${yPrime - 1})$`, `$(${yPrime},\\; ${xPrime})$`, `$(${xPrime - 1},\\; ${yPrime + 2})$`];
      given = `Transformation matrix $M = \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}$, point $P(${px}, ${py})$.`;
      required = `Image point $P'(x', y')$.`;
      method = `Multiply matrix by column vector: $\\begin{pmatrix} x' \\\\ y' \\end{pmatrix} = M \\begin{pmatrix} x \\\\ y \\end{pmatrix}$.`;
      steps = [
        `$x' = (${a})(${px}) + (${b})(${py}) = ${a * px} + ${b * py} = ${xPrime}$.`,
        `$y' = (${c})(${px}) + (${d})(${py}) = ${c * px} + ${d * py} = ${yPrime}$.`,
      ];
      conclusion = `The image point is $(${xPrime},\\; ${yPrime})$.`;
      hint = `Compute $x' = ax + by$ and $y' = cx + dy$.`;
    }
  }
  // Part 8 or 9: Elective Math
  else if (partId === 8 || partId === 9) {
    if (nameL.includes('binary') || nameL.includes('operation')) {
      const k = prng.pick([2, 3, 5]);
      const x = prng.pick([3, 4, 5]);
      const y = prng.pick([2, 3, 6]);
      const ans = x * y + k;
      questionText = `A binary operation $*$ on the set of real numbers is defined by:\n\n$$a * b = ab + ${k}$$\n\nEvaluate **$${x} * ${y}$**:`;
      correctAnswer = `$${ans}$`;
      rawDistractors = [`$${x * y}$`, `$${x + y + k}$`, `$${ans + 2}$`, `$${ans - 3}$`];
      given = `Operation definition: $a * b = ab + ${k}$.`;
      required = `Value of $${x} * ${y}$.`;
      method = `Substitute $a = ${x}$ and $b = ${y}$ into the given algebraic definition.`;
      steps = [`$${x} * ${y} = (${x} \\times ${y}) + ${k} = ${x * y} + ${k} = ${ans}$.`];
      conclusion = `$${x} * ${y} = ${ans}$.`;
      hint = `Multiply the two operands and add ${k}.`;
    } else if (nameL.includes('matrix') || nameL.includes('determinant')) {
      const a = prng.pick([2, 3, 4]);
      const b = prng.pick([1, 2, 5]);
      const c = prng.pick([2, 3]);
      const d = prng.pick([4, 5, 6]);
      const det = a * d - b * c;
      questionText = `Given the $2 \\times 2$ square matrix $A = \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}$, find the determinant $\\det(A)$:`;
      correctAnswer = `$${det}$`;
      rawDistractors = [`$${a * d + b * c}$`, `$${det + 2}$`, `$${det - 4}$`, `$${a + d - b - c}$`];
      given = `Matrix $A = \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}$.`;
      required = `$\\det(A)$.`;
      method = `$\\det(A) = ad - bc$.`;
      steps = [`$\\det(A) = (${a} \\times ${d}) - (${b} \\times ${c}) = ${a * d} - ${b * c} = ${det}$.`];
      conclusion = `$\\det(A) = ${det}$.`;
      hint = `Multiply main diagonal elements and subtract product of off-diagonal elements.`;
    } else if (nameL.includes('differentiat') || nameL.includes('derivative')) {
      const a = prng.pick([2, 3, 4, 5]);
      const n = prng.pick([2, 3, 4]);
      const coeff = a * n;
      const power = n - 1;
      questionText = `Find the first derivative $\\dfrac{dy}{dx}$ of the polynomial function:\n\n$$y = ${a}x^{${n}} + 7x - 4$$`;
      correctAnswer = `$${coeff}x^{${power}} + 7$`;
      rawDistractors = [
        `$${coeff}x^{${n}} + 7$`,
        `$${a}x^{${power}} + 7$`,
        `$${coeff}x^{${power}}$`,
        `$${coeff}x^{${power}} - 4$`,
      ];
      given = `Function $y = ${a}x^{${n}} + 7x - 4$.`;
      required = `$\\dfrac{dy}{dx}$.`;
      method = `Apply the power rule $\\frac{d}{dx}[ax^n] = n \\cdot ax^{n-1}$. The derivative of a constant is 0.`;
      steps = [
        `$\\frac{d}{dx}[${a}x^{${n}}] = (${n})(${a})x^{${n}-1} = ${coeff}x^{${power}}$,`,
        `$\\frac{d}{dx}[7x] = 7$, and $\\frac{d}{dx}[-4] = 0$.`,
        `Sum: $\\dfrac{dy}{dx} = ${coeff}x^{${power}} + 7$.`,
      ];
      conclusion = `$\\dfrac{dy}{dx} = ${coeff}x^{${power}} + 7$.`;
      hint = `Multiply coefficient by exponent and reduce exponent by 1.`;
    } else {
      // Integration
      const k = prng.pick([2, 3, 4]);
      const upper = prng.pick([2, 3]);
      const ans = Math.round((k * Math.pow(upper, 2)) / 2);
      questionText = `Evaluate the definite integral:\n\n$$\\int_{0}^{${upper}} ${k}x \\, dx$$`;
      correctAnswer = `$${ans}$`;
      rawDistractors = [`$${ans + 3}$`, `$${k * upper}$`, `$${Math.round(ans / 2)}$`, `$${ans + k}$`];
      given = `Integral $\\int_{0}^{${upper}} ${k}x \\, dx$.`;
      required = `Evaluated numerical value.`;
      method = `Antiderivative of $kx$ is $\\frac{kx^2}{2}$. Evaluate from $0$ to $${upper}$.`;
      steps = [
        `$\\int ${k}x \\, dx = \\left[ \\dfrac{${k}x^2}{2} \\right]_0^{${upper}}$,`,
        `$= \\dfrac{${k}(${upper}^2)}{2} - 0 = \\dfrac{${k * upper * upper}}{2} = ${ans}$.`,
      ];
      conclusion = `The value of the definite integral is $${ans}$.`;
      hint = `Find the antiderivative $\\frac{kx^2}{2}$ and substitute upper and lower limits.`;
    }
  }
  // Part 6 or 7: Core Math 2 & 3
  else if (partId === 6 || partId === 7) {
    if (nameL.includes('modular') || nameL.includes('mod')) {
      const mod = prng.pick([5, 7, 8, 12]);
      const a = prng.pick([8, 11, 14, 19, 23]);
      const b = prng.pick([6, 9, 13, 17]);
      const sum = a + b;
      const ans = sum % mod;
      questionText = `In modulo $${mod}$ arithmetic, evaluate:\n\n$$(${a} + ${b}) \\pmod{${mod}}$$`;
      correctAnswer = `$${ans}$`;
      rawDistractors = [`$${(ans + 1) % mod}$`, `$${(ans + 2) % mod}$`, `$${(ans + 3) % mod}$`];
      given = `Sum $${a} + ${b}$ evaluated modulo $${mod}$.`;
      required = `Remainder modulo $${mod}$.`;
      method = `Compute $${a} + ${b} = ${sum}$. Divide by $${mod}$ and take the integer remainder.`;
      steps = [
        `$${a} + ${b} = ${sum}$.`,
        `$${sum} \\div ${mod} = ${Math.floor(sum / mod)}$ with a remainder of $${ans}$.`,
      ];
      conclusion = `$$(${a} + ${b}) \\equiv ${ans} \\pmod{${mod}}$$.`;
      hint = `Add the two integers together, then find the remainder when divided by ${mod}.`;
    } else if (nameL.includes('variation') || nameL.includes('proportional')) {
      const k = prng.pick([3, 4, 5, 6]);
      const x1 = prng.pick([2, 4]);
      const y1 = k * x1;
      const x2 = prng.pick([6, 7, 8]);
      const y2 = k * x2;
      questionText = `Given that $y$ varies directly as $x$, and $y = ${y1}$ when $x = ${x1}$.\n\nFind the value of $y$ when $x = ${x2}$:`;
      correctAnswer = `$${y2}$`;
      rawDistractors = [`$${y2 - k}$`, `$${y2 + k}$`, `$${x2 * y1}$`];
      given = `$y \\propto x$, $y = ${y1}$ when $x = ${x1}$.`;
      required = `Value of $y$ when $x = ${x2}$.`;
      method = `Set up direct variation formula $y = kx$. Solve for $k = \\frac{y}{x}$, then compute $y$ at $x = ${x2}$.`;
      steps = [
        `$k = \\dfrac{${y1}}{${x1}} = ${k}$.`,
        `Equation of variation: $y = ${k}x$.`,
        `When $x = ${x2}$: $y = ${k} \\times ${x2} = ${y2}$.`,
      ];
      conclusion = `$y = ${y2}$.`;
      hint = `Find constant of variation $k = y/x$, then multiply by the new $x$.`;
    } else if (nameL.includes('circle') || nameL.includes('theorem')) {
      const angleCirc = prng.pick([32, 40, 48, 55]);
      const angleCenter = angleCirc * 2;
      questionText = `In a circle with center $O$, arc $AB$ subtends an angle of $${angleCirc}^\\circ$ at the circumference at point $C$.\n\nAccording to the circle theorem, what is the measure of the angle subtended by arc $AB$ at the center $O$ ($\\angle AOB$)?`;
      correctAnswer = `$${angleCenter}^\\circ$`;
      rawDistractors = [`$${angleCirc}^\\circ$`, `$${180 - angleCirc}^\\circ$`, `$${Math.round(angleCirc / 2)}^\\circ$`];
      given = `Angle at circumference $\\angle ACB = ${angleCirc}^\\circ$.`;
      required = `Angle at center $\\angle AOB$.`;
      method = `The angle subtended by an arc at the center of a circle is twice the angle subtended by the same arc at the circumference.`;
      steps = [`$\\angle AOB = 2 \\times \\angle ACB = 2 \\times ${angleCirc}^\\circ = ${angleCenter}^\\circ$.`];
      conclusion = `$\\angle AOB = ${angleCenter}^\\circ$.`;
      hint = `Recall the theorem: angle at center $= 2 \\times$ angle at circumference.`;
    } else {
      // AP sequence
      const a = prng.pick([3, 5, 7, 9]);
      const d = prng.pick([3, 4, 6]);
      const n = prng.pick([10, 12, 15]);
      const ans = a + (n - 1) * d;
      questionText = `An Arithmetic Progression (A.P.) has first term $a = ${a}$ and common difference $d = ${d}$.\n\nFind the ${n}th term ($U_{${n}}$) of the progression:`;
      correctAnswer = `$${ans}$`;
      rawDistractors = [`$${ans + d}$`, `$${ans - d}$`, `$${a * n}$`];
      given = `First term $a = ${a}$, common difference $d = ${d}$, term index $n = ${n}$.`;
      required = `$n$-th term $U_{${n}}$.`;
      method = `Formula for A.P. term: $U_n = a + (n - 1)d$.`;
      steps = [
        `$U_{${n}} = ${a} + (${n} - 1)(${d})$,`,
        `$= ${a} + (${n - 1})(${d}) = ${a} + ${ (n - 1) * d } = ${ans}$.`,
      ];
      conclusion = `The ${n}th term is $${ans}$.`;
      hint = `Use $U_n = a + (n-1)d$.`;
    }
  }
  // Parts 1–5: Foundational to Basic 9
  else {
    if (nameL.includes('interest') || nameL.includes('vat')) {
      const p = prng.pick([500, 1000, 2000]);
      const r = prng.pick([5, 8, 10]);
      const t = prng.pick([2, 3]);
      const interest = (p * r * t) / 100;
      questionText = `Calculate the simple interest earned on a principal of GH₵ ${p} invested at $${r}\\%$ per annum for $${t}$ years:`;
      correctAnswer = `$\\text{GH₵ } ${interest}$`;
      rawDistractors = [`$\\text{GH₵ } ${interest + 50}$`, `$\\text{GH₵ } ${interest - 40}$`];
      given = `Principal $P = ${p}$, rate $r = ${r}\\%$, time $t = ${t}$ years.`;
      required = `Simple interest $I$.`;
      method = `Simple Interest formula: $I = \\dfrac{P \\times R \\times T}{100}$.`;
      steps = [`$I = \\dfrac{${p} \\times ${r} \\times ${t}}{100} = \\dfrac{${p * r * t}}{100} = ${interest}$.`];
      conclusion = `Simple interest earned is $\\text{GH₵ } ${interest}$.`;
      hint = `Multiply Principal $\\times$ Rate $\\times$ Time and divide by 100.`;
    } else if (nameL.includes('polygon') || nameL.includes('interior')) {
      const sides = prng.pick([5, 6, 8]);
      const sum = (sides - 2) * 180;
      const polyName = sides === 5 ? 'pentagon' : sides === 6 ? 'hexagon' : 'octagon';
      questionText = `Find the sum of interior angles of a convex ${polyName} ($n = ${sides}$ sides):`;
      correctAnswer = `$${sum}^\\circ$`;
      rawDistractors = [`$${sum - 180}^\\circ$`, `$${sum + 180}^\\circ$`];
      given = `Polygon with $n = ${sides}$ sides.`;
      required = `Sum of interior angles.`;
      method = `Formula: $S = (n - 2) \\times 180^\\circ$.`;
      steps = [`$S = (${sides} - 2) \\times 180^\\circ = ${sides - 2} \\times 180^\\circ = ${sum}^\\circ$.`];
      conclusion = `The sum of interior angles is $${sum}^\\circ$.`;
      hint = `Use formula $(n - 2) \\times 180^\\circ$.`;
    } else {
      // Linear equation
      const a = prng.pick([2, 3, 4, 5]);
      const b = prng.pick([3, 7, 9, 11]);
      const xVal = prng.pick([3, 4, 5]);
      const c = a * xVal + b;
      questionText = `Solve the linear equation for the unknown variable $x$:\n\n$$${a}x + ${b} = ${c}$$`;
      correctAnswer = `$x = ${xVal}$`;
      rawDistractors = [`$x = ${xVal + 1}$`, `$x = ${xVal - 1}$`];
      given = `Equation $${a}x + ${b} = ${c}$.`;
      required = `Value of $x$.`;
      method = `Subtract ${b} from both sides, then divide by ${a}.`;
      steps = [
        `$${a}x = ${c} - ${b} = ${c - b}$,`,
        `$x = \\dfrac{${c - b}}{${a}} = ${xVal}$.`,
      ];
      conclusion = `$x = ${xVal}$.`;
      hint = `Subtract the constant term first, then divide by the coefficient of $x$.`;
    }
  }

  const { options, correctIndex } = buildOptions(correctAnswer, rawDistractors, prng, optionCount);

  return {
    id: qId,
    stageId: representativeStage,
    levelId: partId,
    blockId: questionIndex + 1,
    topic: subtopic,
    area: unit.name,
    principle: `${unit.name} · ${subtopic}`,
    difficulty: partId <= 3 ? 'foundation' : partId <= 6 ? 'developing' : partId <= 8 ? 'advanced' : 'mastery',
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
    },
    hint,
  };
}

/**
 * Retrieves a balanced block of questions for a specific Curriculum Part (1 to 10).
 * Features:
 * - Can target a whole Part (interleaving across its units) or a specific Unit.
 * - STRICT CONSTRAINT: No two concepts have more than 1 question under them within a block!
 * - Questions and concepts from recent blocks/levels do NOT appear in the next block/level!
 * - Enforces zero repetition across question stems, topics, and concept families.
 * - Completely open access with zero locking.
 */
export function getCurriculumPartBlockQuestions(options: PartQuizOptions): Question[] {
  const {
    partId,
    unitId,
    questionCount = 5,
    seed = Date.now(),
    recentQuestionIds = [],
    recentQuestionStems = [],
    recentTopics = [],
    recentConceptKeys = [],
  } = options;
  const part = getCurriculumPart(partId);
  const questions: Question[] = [];
  const usedStems = new Set<string>();
  const usedTopics = new Set<string>();
  const usedFamilies = new Set<string>();
  const usedConcepts = new Set<string>();

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

  // Select target units
  let targetUnits = part.units;
  if (unitId) {
    const matched = part.units.find(u => u.id === unitId);
    if (matched) {
      targetUnits = [matched];
    }
  }

  // Flatten all available subtopics across target units into a candidate pool
  const candidatePool: Array<{ unit: CurriculumUnit; subtopic: string }> = [];
  for (const unit of targetUnits) {
    const subtopics = unit.subtopics && unit.subtopics.length > 0 ? unit.subtopics : [unit.name];
    for (const sub of subtopics) {
      candidatePool.push({ unit, subtopic: sub });
    }
  }

  const poolLen = candidatePool.length;
  const prng = new PRNG(seed + partId * 99991);
  const slotStride = 7;

  for (let slot = 0; slot < questionCount; slot++) {
    let picked: Question | null = null;
    const startIdx = (slot * slotStride + prng.int(0, Math.max(0, poolLen - 1))) % poolLen;

    // Pass 1: Strict avoidance of usedConcepts, usedTopics, usedFamilies in current block,
    // AND avoidance of recentTopicSet, recentConceptsSet from previous blocks/levels
    for (let offset = 0; offset < poolLen; offset++) {
      const { unit, subtopic } = candidatePool[(startIdx + offset) % poolLen];
      const subL = subtopic.trim().toLowerCase();
      const metaConcept = extractMathematicalConcept('', subL);
      const fam = getTopicFamily(subL);

      if (
        !usedTopics.has(subL) &&
        !usedConcepts.has(metaConcept) &&
        !usedFamilies.has(fam) &&
        !recentTopicSet.has(subL) &&
        !recentConceptsSet.has(metaConcept)
      ) {
        const candSeed = seed + slot * 10007 + offset * 313 + partId * 419 + 17;
        const candidate = generateCurriculumPartQuestion({
          partId,
          unit,
          subtopic,
          questionIndex: slot,
          seed: candSeed,
        });

        const stem = candidate.questionText.trim().toLowerCase();
        const candConcept = extractMathematicalConcept(candidate.questionText, candidate.topic, candidate.blueprint?.conceptKey);

        if (
          !usedStems.has(stem) &&
          !usedConcepts.has(candConcept) &&
          !recentConceptsSet.has(candConcept) &&
          !recentStemSet.has(stem) &&
          !areQuestionsSimilar(candidate, questions)
        ) {
          picked = candidate;
          break;
        }
      }
    }

    // Pass 2: If recent history exhausted available pool items for this unit,
    // relax recentConceptsSet BUT NEVER relax usedConcepts in this block!
    if (!picked) {
      for (let offset = 0; offset < poolLen; offset++) {
        const { unit, subtopic } = candidatePool[(startIdx + offset) % poolLen];
        const subL = subtopic.trim().toLowerCase();
        const metaConcept = extractMathematicalConcept('', subL);

        if (!usedTopics.has(subL) && !usedConcepts.has(metaConcept)) {
          const candSeed = seed + slot * 10007 + offset * 313 + partId * 419 + 123;
          const candidate = generateCurriculumPartQuestion({
            partId,
            unit,
            subtopic,
            questionIndex: slot,
            seed: candSeed,
          });

          const stem = candidate.questionText.trim().toLowerCase();
          const candConcept = extractMathematicalConcept(candidate.questionText, candidate.topic, candidate.blueprint?.conceptKey);

          if (
            !usedStems.has(stem) &&
            !usedConcepts.has(candConcept) &&
            !areQuestionsSimilar(candidate, questions)
          ) {
            picked = candidate;
            break;
          }
        }
      }
    }

    // Pass 3: Ultimate guarantee: unique concept within block
    if (!picked) {
      for (let offset = 0; offset < poolLen; offset++) {
        const { unit, subtopic } = candidatePool[(startIdx + offset * 3) % poolLen];
        const candSeed = seed + slot * 10007 + offset * 997 + partId * 419 + 777;
        const candidate = generateCurriculumPartQuestion({
          partId,
          unit,
          subtopic,
          questionIndex: slot,
          seed: candSeed,
        });
        const candConcept = extractMathematicalConcept(candidate.questionText, candidate.topic, candidate.blueprint?.conceptKey);
        const stem = candidate.questionText.trim().toLowerCase();

        if (!usedConcepts.has(candConcept) && !usedStems.has(stem)) {
          picked = candidate;
          break;
        }
      }
    }

    if (picked) {
      const pConcept = extractMathematicalConcept(picked.questionText, picked.topic, picked.blueprint?.conceptKey);
      usedConcepts.add(pConcept);
      usedTopics.add(picked.topic.trim().toLowerCase());
      usedFamilies.add(getTopicFamily(picked.topic));
      usedStems.add(picked.questionText.trim().toLowerCase());
      questions.push(picked);
    }
  }

  return questions;
}
