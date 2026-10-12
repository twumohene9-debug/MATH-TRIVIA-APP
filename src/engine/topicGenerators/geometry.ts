import { DifficultyTier } from '../../types';
import { PRNG } from '../generators/shared';
import { GeneratedTopicArtifact, makeUniqueDistractors } from './types';

export function generateGeometryTopic(
  topicName: string,
  topicArea: string,
  stageId: number,
  difficulty: DifficultyTier,
  prng: PRNG,
  diffMultiplier: number
): GeneratedTopicArtifact {
  const nameL = topicName.toLowerCase();

  // 1. Polygon Interior & Exterior Angles (Stage 47)
  if (nameL.includes('polygon') || nameL.includes('pentagon') || nameL.includes('hexagon') || nameL.includes('octagon') || nameL.includes('decagon')) {
    const sides = nameL.includes('pentagon') ? 5 : nameL.includes('hexagon') ? 6 : nameL.includes('octagon') ? 8 : nameL.includes('decagon') ? 10 : prng.pick([5, 6, 8, 10, 12]);
    const shapeName = sides === 5 ? 'regular pentagon' : sides === 6 ? 'regular hexagon' : sides === 8 ? 'regular octagon' : sides === 10 ? 'regular decagon' : `regular ${sides}-gon`;
    const sumInterior = (sides - 2) * 180;
    const eachInterior = sumInterior / sides;
    const eachExterior = 360 / sides;

    if (nameL.includes('exterior')) {
      const correctAns = `$${eachExterior}^\\circ$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Exterior angle of regular polygon',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: '360 / n',
          representation: 'equation', context: 'Polygonal geometry',
          numbersUsed: [sides, eachExterior], expectedReasoning: 'Sum of exterior angles of any convex polygon is 360 degrees',
          conceptKey: 'EXTERIOR_ANGLE_REGULAR_POLYGON',
        },
        questionText: `What is the measure of each exterior angle of a ${shapeName} ($n = ${sides}$)?`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$${eachExterior + 15}^\\circ$`,
          `$${Math.max(10, eachExterior - 15)}^\\circ$`,
          `$${eachInterior}^\\circ$`,
        ], prng),
        given: `Regular polygon with $n = ${sides}$ sides.`,
        required: `Size of each exterior angle.`,
        method: `$\\text{Exterior angle} = \\dfrac{360^\\circ}{n} = \\dfrac{360^\\circ}{${sides}}$.`,
        steps: [`$\\dfrac{360^\\circ}{${sides}} = ${eachExterior}^\\circ$.`],
        conclusion: `Each exterior angle is $${eachExterior}^\\circ$.`,
        hint: `The exterior angles of any polygon always add up to 360°. Divide by the number of sides.`,
      };
    }

    const correctAns = `$${sumInterior}^\\circ$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Sum of interior angles of polygon',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: '(n - 2) * 180',
        representation: 'equation', context: 'Polygonal geometry',
        numbersUsed: [sides, sumInterior], expectedReasoning: 'Interior angle sum formula is (n - 2) * 180 degrees',
        conceptKey: 'INTERIOR_ANGLE_SUM_POLYGON',
      },
      questionText: `What is the sum of the interior angles of a ${shapeName} ($n = ${sides}$ sides)?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${sides * 180}^\\circ$`, // forgot to subtract 2
        `$${sumInterior + 180}^\\circ$`,
        `$${Math.max(180, sumInterior - 180)}^\\circ$`,
        `$360^\\circ$`,
      ], prng),
      given: `Polygon with $n = ${sides}$ sides.`,
      required: `Sum of interior angles.`,
      method: `$\\text{Sum} = (n - 2) \\times 180^\\circ$.`,
      steps: [
        `$(${sides} - 2) \\times 180^\\circ$.`,
        `$${sides - 2} \\times 180^\\circ = ${sumInterior}^\\circ$.`,
      ],
      conclusion: `The interior angle sum is $${sumInterior}^\\circ$.`,
      hint: `Use the formula: (number of sides - 2) × 180°.`,
    };
  }

  // 2. Complementary & Supplementary Angles (Stage 43)
  if (nameL.includes('complementary') || nameL.includes('supplementary')) {
    const isComp = nameL.includes('complementary');
    const targetSum = isComp ? 90 : 180;
    const givenAng = prng.int(isComp ? 20 : 35, isComp ? 75 : 145);
    const ans = targetSum - givenAng;
    const correctAns = `$${ans}^\\circ$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: `${isComp ? 'Complementary' : 'Supplementary'} angle calculation`,
        questionType: 'direct_calculation', difficulty, mathematicalOperation: `${targetSum} - givenAngle`,
        representation: 'equation', context: 'Angle relationships',
        numbersUsed: [givenAng, targetSum, ans], expectedReasoning: isComp ? 'Complementary angles sum to 90 degrees' : 'Supplementary angles sum to 180 degrees',
        conceptKey: isComp ? 'COMPLEMENTARY_ANGLES' : 'SUPPLEMENTARY_ANGLES',
      },
      questionText: `Two angles are ${isComp ? 'complementary' : 'supplementary'}. If one angle measures $${givenAng}^\\circ$, what is the measure of the other angle?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${isComp ? 180 - givenAng : 90 - givenAng}^\\circ$`, // confused comp and supp
        `$${ans + 10}^\\circ$`,
        `$${Math.max(5, ans - 10)}^\\circ$`,
      ], prng),
      given: `One angle $= ${givenAng}^\\circ$, angles are ${isComp ? 'complementary (sum = 90°)' : 'supplementary (sum = 180°)'}.`,
      required: `Other angle.`,
      method: `Subtract $${givenAng}^\\circ$ from $${targetSum}^\\circ$.`,
      steps: [`$${targetSum}^\\circ - ${givenAng}^\\circ = ${ans}^\\circ$.`],
      conclusion: `The required angle is $${ans}^\\circ$.`,
      hint: isComp ? `Complementary angles add up to 90°.` : `Supplementary angles add up to 180°.`,
    };
  }

  // 3. Parallel Lines & Transversals (Stage 44)
  if (nameL.includes('parallel') || nameL.includes('transversal') || nameL.includes('alternate') || nameL.includes('corresponding') || nameL.includes('co-interior')) {
    const ang = prng.int(45, 135);
    if (nameL.includes('co-interior') || nameL.includes('consecutive interior')) {
      const coInt = 180 - ang;
      const correctAns = `$${coInt}^\\circ$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Co-interior angles on parallel lines',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: '180 - angle',
          representation: 'equation', context: 'Parallel lines transversals',
          numbersUsed: [ang, coInt], expectedReasoning: 'Co-interior (allied) angles between parallel lines are supplementary (sum to 180 degrees)',
          conceptKey: 'CO_INTERIOR_ANGLES_PARALLEL',
        },
        questionText: `Two parallel lines are intersected by a transversal. If one co-interior (consecutive interior) angle is $${ang}^\\circ$, what is the other angle?`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$${ang}^\\circ$`, // assumed equal
          `$${coInt + 10}^\\circ$`,
          `$${Math.max(10, coInt - 10)}^\\circ$`,
        ], prng),
        given: `Co-interior angle $= ${ang}^\\circ$.`,
        required: `Adjacent interior angle.`,
        method: `Co-interior angles are supplementary: $\\text{Angle} = 180^\\circ - ${ang}^\\circ$.`,
        steps: [`$180^\\circ - ${ang}^\\circ = ${coInt}^\\circ$.`],
        conclusion: `The angle is $${coInt}^\\circ$.`,
        hint: `Co-interior angles (inside the 'C' or 'U' shape) add up to 180°.`,
      };
    }

    // Alternate or corresponding angles are equal
    const correctAns = `$${ang}^\\circ$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Alternate/corresponding angles equality',
        questionType: 'identification', difficulty, mathematicalOperation: 'Angle equality theorem',
        representation: 'equation', context: 'Parallel lines',
        numbersUsed: [ang], expectedReasoning: 'Alternate interior angles and corresponding angles on parallel lines are strictly equal',
        conceptKey: 'ALTERNATE_CORRESPONDING_ANGLES',
      },
      questionText: `A transversal intersects two parallel lines forming an angle of $${ang}^\\circ$. What is the measure of its alternate interior angle?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${180 - ang}^\\circ$`,
        `$${ang + 20}^\\circ$`,
        `$${Math.max(10, ang - 20)}^\\circ$`,
      ], prng),
      given: `Interior angle $= ${ang}^\\circ$.`,
      required: `Alternate interior angle.`,
      method: `Alternate interior angles formed by a transversal intersecting parallel lines are equal ('Z' angles).`,
      steps: [`Alternate angles are equal, so the angle is $${ang}^\\circ$.`],
      conclusion: `The alternate angle is $${ang}^\\circ$.`,
      hint: `Alternate angles (forming a 'Z' shape) are always equal!`,
    };
  }

  // 4. Triangles: Angle Sum & Exterior Angle Theorem (Stage 45)
  if (nameL.includes('triangle') || nameL.includes('isosceles') || nameL.includes('equilateral')) {
    const a = prng.int(35, 75);
    const b = prng.int(40, 80);
    const c = 180 - (a + b);
    const correctAns = `$${c}^\\circ$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Triangle interior angle sum theorem',
        questionType: 'missing_value', difficulty, mathematicalOperation: '180 - (a + b)',
        representation: 'equation', context: 'Triangles',
        numbersUsed: [a, b, c], expectedReasoning: 'Sum of interior angles of any triangle is strictly 180 degrees',
        conceptKey: 'TRIANGLE_INTERIOR_ANGLE_SUM',
      },
      questionText: `In a triangle, two of the angles measure $${a}^\\circ$ and $${b}^\\circ$.\n\nFind the measure of the third angle:`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${360 - (a + b)}^\\circ$`,
        `$${c + 10}^\\circ$`,
        `$${Math.max(10, c - 10)}^\\circ$`,
        `$${a + b}^\\circ$`,
      ], prng),
      given: `Angles $${a}^\\circ$ and $${b}^\\circ$ in a triangle.`,
      required: `Third angle.`,
      method: `The sum of angles in any triangle is $180^\\circ$: $\\text{Angle} = 180^\\circ - (${a}^\\circ + ${b}^\\circ)$.`,
      steps: [
        `Sum of known angles: $${a}^\\circ + ${b}^\\circ = ${a + b}^\\circ$.`,
        `Third angle: $180^\\circ - ${a + b}^\\circ = ${c}^\\circ$.`,
      ],
      conclusion: `The third angle is $${c}^\\circ$.`,
      hint: `The three angles inside every triangle always add up to 180°.`,
    };
  }

  // 5. Circle Properties (Stage 48)
  if (nameL.includes('circle') || nameL.includes('radius') || nameL.includes('diameter') || nameL.includes('tangent') || nameL.includes('chord')) {
    const r = prng.int(6, 25);
    const d = 2 * r;
    const correctAns = `$${d}\\text{ cm}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Circle diameter from radius',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'd = 2r',
        representation: 'equation', context: 'Circles',
        numbersUsed: [r, d], expectedReasoning: 'Diameter is twice the length of the radius: d = 2r',
        conceptKey: 'CIRCLE_DIAMETER_RADIUS',
      },
      questionText: `A circle has a radius of $${r}\\text{ cm}$. What is the length of its diameter?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${r}\\text{ cm}$`,
        `$${r * r}\\text{ cm}$`, // squared
        `$${d + 4}\\text{ cm}$`,
      ], prng),
      given: `Radius $r = ${r}\\text{ cm}$.`,
      required: `Diameter $d$.`,
      method: `$d = 2 \\times r = 2 \\times ${r} = ${d}\\text{ cm}$.`,
      steps: [`$d = 2 \\times ${r} = ${d}\\text{ cm}$.`],
      conclusion: `The diameter is $${d}\\text{ cm}$.`,
      hint: `The diameter is double the radius (2 × radius).`,
    };
  }

  // Default Geometry Angle Sum Fallback
  const qA = prng.int(60, 110);
  const qB = prng.int(70, 100);
  const qC = prng.int(65, 95);
  const qD = 360 - (qA + qB + qC);
  const correctAns = `$${qD}^\\circ$`;

  return {
    blueprint: {
      mainTopic: topicArea, subtopic: topicName, skill: `Angle reasoning in ${topicName}`,
      questionType: 'missing_value', difficulty, mathematicalOperation: '360 - (a + b + c)',
      representation: 'equation', context: 'Quadrilaterals',
      numbersUsed: [qA, qB, qC, qD], expectedReasoning: 'Sum of interior angles of a quadrilateral is 360 degrees',
      conceptKey: `GEOMETRY_STAGE_${stageId}_SKILL`,
    },
    questionText: `Three angles of a quadrilateral are $${qA}^\\circ$, $${qB}^\\circ$, and $${qC}^\\circ$.\n\nFind the measure of the fourth angle:`,
    correctAnswer: correctAns,
    rawDistractors: makeUniqueDistractors(correctAns, [
      `$${180 - (qA + qB + qC) + 360}^\\circ$`,
      `$${qD + 15}^\\circ$`,
      `$${Math.max(15, qD - 15)}^\\circ$`,
    ], prng),
    given: `Angles $${qA}^\\circ, ${qB}^\\circ, ${qC}^\\circ$.`,
    required: `Fourth angle.`,
    method: `Sum of quadrilateral angles is $360^\\circ$: $\\text{Angle} = 360^\\circ - (${qA} + ${qB} + ${qC})$.`,
    steps: [
      `Sum of 3 angles: $${qA}^\\circ + ${qB}^\\circ + ${qC}^\\circ = ${qA + qB + qC}^\\circ$.`,
      `Fourth angle: $360^\\circ - ${qA + qB + qC}^\\circ = ${qD}^\\circ$.`,
    ],
    conclusion: `The fourth angle is $${qD}^\\circ$.`,
    hint: `All four angles of any four-sided shape (quadrilateral) add up to 360°.`,
  };
}
