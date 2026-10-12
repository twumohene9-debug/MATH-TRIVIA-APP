import { DifficultyTier } from '../../types';
import { PRNG } from '../generators/shared';
import { GeneratedTopicArtifact, makeUniqueDistractors, fmtFrac } from './types';

export function generateMensurationTopic(
  topicName: string,
  topicArea: string,
  stageId: number,
  difficulty: DifficultyTier,
  prng: PRNG,
  diffMultiplier: number
): GeneratedTopicArtifact {
  const nameL = topicName.toLowerCase();

  // 1. Trapezium / Trapezoid Area (Stage 53)
  if (nameL.includes('trapez') || nameL.includes('trapezoid')) {
    const a = prng.int(6, 14);
    const b = prng.int(10, 20);
    const h = prng.pick([4, 6, 8, 10]);
    const area = ((a + b) * h) / 2;
    const correctAns = `$${area}\\text{ cm}^2$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Area of a trapezium (trapezoid)',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Area = 1/2 * (a + b) * h',
        representation: 'equation', context: 'Mensuration 2D',
        numbersUsed: [a, b, h, area], expectedReasoning: 'Average the parallel sides and multiply by perpendicular height',
        conceptKey: 'TRAPEZIUM_AREA_CALCULATION',
      },
      questionText: `A trapezium has parallel sides of lengths $${a}\\text{ cm}$ and $${b}\\text{ cm}$, with perpendicular height $${h}\\text{ cm}$.\n\nFind its area:`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${(a + b) * h}\\text{ cm}^2$`, // forgot 1/2
        `$${area + 12}\\text{ cm}^2$`,
        `$${a * h}\\text{ cm}^2$`,
      ], prng),
      given: `Parallel sides $a = ${a}\\text{ cm}$, $b = ${b}\\text{ cm}$, height $h = ${h}\\text{ cm}$.`,
      required: `Area of trapezium.`,
      method: `$\\text{Area} = \\dfrac{1}{2}(a + b)h$.`,
      steps: [
        `Sum of parallel sides: $${a} + ${b} = ${a + b}\\text{ cm}$.`,
        `$\\text{Area} = \\dfrac{1}{2} \\times ${a + b} \\times ${h} = ${area}\\text{ cm}^2$.`,
      ],
      conclusion: `The area is $${area}\\text{ cm}^2$.`,
      hint: `Add the two parallel sides, divide by 2, then multiply by the height!`,
    };
  }

  // 2. Circles Mensuration: Area & Circumference (Stage 54)
  if (nameL.includes('circle') || nameL.includes('circumference') || nameL.includes('sector') || nameL.includes('arc length')) {
    const r = prng.pick([7, 14, 21]); // multiples of 7 for clean 22/7 arithmetic
    const isCirc = nameL.includes('circumference') || nameL.includes('perimeter');

    if (isCirc) {
      const circ = Math.round(2 * (22 / 7) * r);
      const correctAns = `$${circ}\\text{ cm}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Circumference of a circle',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'C = 2 * pi * r',
          representation: 'equation', context: 'Circle mensuration',
          numbersUsed: [r, circ], expectedReasoning: 'Circumference is 2 * pi * r using pi = 22/7',
          conceptKey: 'CIRCLE_CIRCUMFERENCE_CALCULATION',
        },
        questionText: `Find the circumference of a circle with radius $${r}\\text{ cm}$ (taking $\\pi = \\dfrac{22}{7}$):`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$${circ / 2}\\text{ cm}$`, // pi * r instead of 2 * pi * r
          `$${circ + 14}\\text{ cm}$`,
          `$${Math.round((22 / 7) * r * r)}\\text{ cm}$`, // gave area instead of circumference
        ], prng),
        given: `Radius $r = ${r}\\text{ cm}$, $\\pi = \\dfrac{22}{7}$.`,
        required: `Circumference $C$.`,
        method: `$C = 2\\pi r = 2 \\times \\dfrac{22}{7} \\times ${r}$.`,
        steps: [
          `$2 \\times \\dfrac{22}{7} \\times ${r} = 2 \\times 22 \\times ${r / 7} = ${circ}\\text{ cm}$.`,
        ],
        conclusion: `The circumference is $${circ}\\text{ cm}$.`,
        hint: `Use the formula: $C = 2 \\times \\pi \\times r$.`,
      };
    }

    // Area of circle: A = pi * r^2
    const area = Math.round((22 / 7) * r * r);
    const correctAns = `$${area}\\text{ cm}^2$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Area of a circle',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Area = pi * r^2',
        representation: 'equation', context: 'Circle mensuration',
        numbersUsed: [r, area], expectedReasoning: 'Area = pi * r^2 using pi = 22/7',
        conceptKey: 'CIRCLE_AREA_CALCULATION',
      },
      questionText: `Calculate the area of a circle with radius $r = ${r}\\text{ cm}$ (taking $\\pi = \\dfrac{22}{7}$):`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${Math.round(2 * (22 / 7) * r)}\\text{ cm}^2$`, // gave circumference
        `$${area + 44}\\text{ cm}^2$`,
        `$${area / 2}\\text{ cm}^2$`,
      ], prng),
      given: `Radius $r = ${r}\\text{ cm}$, $\\pi = \\dfrac{22}{7}$.`,
      required: `Area $A$.`,
      method: `$A = \\pi r^2 = \\dfrac{22}{7} \\times ${r}^2$.`,
      steps: [
        `$${r}^2 = ${r * r}$.`,
        `$A = \\dfrac{22}{7} \\times ${r * r} = 22 \\times ${Math.round((r * r) / 7)} = ${area}\\text{ cm}^2$.`,
      ],
      conclusion: `The area of the circle is $${area}\\text{ cm}^2$.`,
      hint: `Use the formula: $\\text{Area} = \\pi \\times r^2$.`,
    };
  }

  // 3. 3D Volume & Surface Area: Prisms, Cylinders, Cuboids (Stages 55-57)
  if (nameL.includes('volume') || nameL.includes('prism') || nameL.includes('cylinder') || nameL.includes('surface area') || nameL.includes('cuboid')) {
    if (nameL.includes('cylinder')) {
      const r = 7;
      const h = prng.pick([5, 8, 10, 12]);
      const vol = Math.round((22 / 7) * r * r * h);
      const correctAns = `$${vol}\\text{ cm}^3$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Volume of a cylinder',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'V = pi * r^2 * h',
          representation: 'equation', context: '3D Mensuration',
          numbersUsed: [r, h, vol], expectedReasoning: 'Volume of cylinder is base area * height = pi * r^2 * h',
          conceptKey: 'CYLINDER_VOLUME_CALCULATION',
        },
        questionText: `Calculate the volume of a cylinder with radius $r = 7\\text{ cm}$ and height $h = ${h}\\text{ cm}$ (taking $\\pi = \\dfrac{22}{7}$):`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$${Math.round(2 * (22 / 7) * r * h)}\\text{ cm}^3$`,
          `$${vol + 154}\\text{ cm}^3$`,
          `$${Math.round(vol / 2)}\\text{ cm}^3$`,
        ], prng),
        given: `Radius $r = 7\\text{ cm}$, height $h = ${h}\\text{ cm}$, $\\pi = \\dfrac{22}{7}$.`,
        required: `Volume of cylinder.`,
        method: `$V = \\pi r^2 h = \\dfrac{22}{7} \\times 7^2 \\times ${h}$.`,
        steps: [
          `Base area $= \\dfrac{22}{7} \\times 49 = 154\\text{ cm}^2$.`,
          `Volume $= 154 \\times ${h} = ${vol}\\text{ cm}^3$.`,
        ],
        conclusion: `The cylinder's volume is $${vol}\\text{ cm}^3$.`,
        hint: `Find the area of the circular base ($\\pi r^2$) and multiply by the height.`,
      };
    }

    // Cuboid volume: l * w * h
    const l = prng.int(5, 12);
    const w = prng.int(4, 8);
    const h = prng.int(3, 7);
    const vol = l * w * h;
    const correctAns = `$${vol}\\text{ cm}^3$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Volume of a rectangular cuboid',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'V = l * w * h',
        representation: 'equation', context: '3D Mensuration',
        numbersUsed: [l, w, h, vol], expectedReasoning: 'Multiply length * width * height',
        conceptKey: 'CUBOID_VOLUME_CALCULATION',
      },
      questionText: `A rectangular box (cuboid) measures $${l}\\text{ cm}$ by $${w}\\text{ cm}$ by $${h}\\text{ cm}$.\n\nWhat is its volume?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${2 * (l * w + l * h + w * h)}\\text{ cm}^3$`, // gave surface area instead
        `$${l + w + h}\\text{ cm}^3$`,
        `$${vol + 20}\\text{ cm}^3$`,
      ], prng),
      given: `Dimensions: $l = ${l}\\text{ cm}, w = ${w}\\text{ cm}, h = ${h}\\text{ cm}$.`,
      required: `Volume.`,
      method: `$\\text{Volume} = \\text{length} \\times \\text{width} \\times \\text{height}$.`,
      steps: [
        `$${l} \\times ${w} \\times ${h} = ${l * w} \\times ${h} = ${vol}\\text{ cm}^3$.`,
      ],
      conclusion: `The volume is $${vol}\\text{ cm}^3$.`,
      hint: `Multiply length × width × height!`,
    };
  }

  // 4. Unit Conversions (Length, Area, Capacity, Mass) (Stages 58, 59)
  if (nameL.includes('unit') || nameL.includes('conversion') || nameL.includes('capacity') || nameL.includes('mass') || nameL.includes('gram') || nameL.includes('litre')) {
    if (nameL.includes('litre') || nameL.includes('capacity')) {
      const l = prng.pick([2.5, 3.75, 4.2, 5.5]);
      const ml = Math.round(l * 1000);
      const correctAns = `$${ml.toLocaleString()}\\text{ mL}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Converting litres to millilitres',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'L * 1000 = mL',
          representation: 'equation', context: 'Capacity conversion',
          numbersUsed: [l, ml], expectedReasoning: '1 Litre = 1000 millilitres',
          conceptKey: 'LITRES_TO_MILLILITRES_CONVERSION',
        },
        questionText: `Convert $${l}\\text{ litres}$ into millilitres (mL):`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$${(l * 100).toLocaleString()}\\text{ mL}$`, // multiplied by 100
          `$${(l * 10).toLocaleString()}\\text{ mL}$`,
          `$${(l / 1000).toLocaleString()}\\text{ mL}$`,
        ], prng),
        given: `Capacity $= ${l}\\text{ L}$.`,
        required: `Equivalent in mL.`,
        method: `Multiply by $1000$ because $1\\text{ L} = 1000\\text{ mL}$.`,
        steps: [`$${l} \\times 1000 = ${ml}\\text{ mL}$.`],
        conclusion: `$${l}\\text{ L} = ${ml.toLocaleString()}\\text{ mL}$.`,
        hint: `There are 1,000 millilitres in 1 litre!`,
      };
    }

    // Kilograms to grams
    const kg = prng.pick([3.2, 4.5, 6.8, 7.25]);
    const g = Math.round(kg * 1000);
    const correctAns = `$${g.toLocaleString()}\\text{ g}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Converting kilograms to grams',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'kg * 1000 = g',
        representation: 'equation', context: 'Mass conversion',
        numbersUsed: [kg, g], expectedReasoning: '1 kilogram = 1000 grams',
        conceptKey: 'KG_TO_GRAMS_CONVERSION',
      },
      questionText: `Convert $${kg}\\text{ kg}$ into grams (g):`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${(kg * 100).toLocaleString()}\\text{ g}$`,
        `$${(kg * 10).toLocaleString()}\\text{ g}$`,
        `$${(kg / 1000).toLocaleString()}\\text{ g}$`,
      ], prng),
      given: `Mass $= ${kg}\\text{ kg}$.`,
      required: `Equivalent in grams.`,
      method: `Multiply by $1000$ because $1\\text{ kg} = 1000\\text{ g}$.`,
      steps: [`$${kg} \\times 1000 = ${g}\\text{ g}$.`],
      conclusion: `$${kg}\\text{ kg} = ${g.toLocaleString()}\\text{ g}$.`,
      hint: `There are 1,000 grams in 1 kilogram!`,
    };
  }

  // Density & Mass/Volume relationship (Stage 59)
  if (nameL.includes('density')) {
    const vol = prng.pick([20, 25, 40, 50]);
    const dVal = prng.pick([2, 4, 5, 8]);
    const mass = vol * dVal;
    const correctAns = `$${dVal}\\text{ g/cm}^3$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Calculating physical density (Density = Mass / Volume)',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Density = Mass / Volume',
        representation: 'word_problem', context: 'Applied physics mensuration',
        numbersUsed: [mass, vol, dVal], expectedReasoning: 'Divide mass in grams by volume in cubic centimeters',
        conceptKey: 'DENSITY_MASS_VOLUME_CALC',
      },
      questionText: `A solid mineral block has a mass of $${mass}\\text{ g}$ and occupies a volume of $${vol}\\text{ cm}^3$.\n\nCalculate its density:`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${mass * vol}\\text{ g/cm}^3$`,
        `$${dVal + 2}\\text{ g/cm}^3$`,
        `$${Math.max(1, dVal - 2)}\\text{ g/cm}^3$`,
      ], prng),
      given: `Mass $= ${mass}\\text{ g}$, Volume $= ${vol}\\text{ cm}^3$.`,
      required: `Density.`,
      method: `$\\text{Density} = \\dfrac{\\text{Mass}}{\\text{Volume}} = \\dfrac{${mass}}{${vol}} = ${dVal}\\text{ g/cm}^3$.`,
      steps: [`$${mass} \\div ${vol} = ${dVal}$.`],
      conclusion: `The density is $${dVal}\\text{ g/cm}^3$.`,
      hint: `Use the formula: $\\text{Density} = \\dfrac{\\text{Mass}}{\\text{Volume}}$.`,
    };
  }

  // Temperature conversion Celsius & Fahrenheit (Stage 55, 56)
  if (nameL.includes('temperature') || nameL.includes('celsius') || nameL.includes('fahrenheit')) {
    const c = prng.pick([10, 20, 25, 30, 40, 100]);
    const f = Math.round((c * 9) / 5 + 32);
    const correctAns = `$${f}^\\circ\\text{F}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Converting temperature from Celsius to Fahrenheit',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'F = (9/5)C + 32',
        representation: 'equation', context: 'Temperature scales',
        numbersUsed: [c, f], expectedReasoning: 'Multiply C by 9/5 and add 32 to obtain Fahrenheit',
        conceptKey: 'CELSIUS_TO_FAHRENHEIT_CALC',
      },
      questionText: `Convert a temperature of $${c}^\\circ\\text{C}$ into degrees Fahrenheit ($^\\circ\\text{F}$):\n\n(Use formula: $F = \\dfrac{9}{5}C + 32$)`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${c + 32}^\\circ\\text{F}$`, // forgot 9/5
        `$${f + 10}^\\circ\\text{F}$`,
        `$${Math.round((c * 9) / 5)}^\\circ\\text{F}$`, // forgot + 32
      ], prng),
      given: `Temperature $C = ${c}^\\circ\\text{C}$.`,
      required: `Temperature in $^\\circ\\text{F}$.`,
      method: `$F = \\left(\\dfrac{9}{5} \\times ${c}\\right) + 32 = ${(c * 9) / 5} + 32 = ${f}^\\circ\\text{F}$.`,
      steps: [
        `$\\dfrac{9}{5} \\times ${c} = ${(c * 9) / 5}$.`,
        `${(c * 9) / 5} + 32 = ${f}^\\circ\\text{F}$.`,
      ],
      conclusion: `$${c}^\\circ\\text{C} = ${f}^\\circ\\text{F}$.`,
      hint: `Multiply by 9, divide by 5, then add 32.`,
    };
  }

  // Clocks & Elapsed Time (Stage 56, 57)
  if (nameL.includes('clock') || nameL.includes('time') || nameL.includes('elapsed') || nameL.includes('duration')) {
    const hr12 = prng.pick([2, 4, 6, 8, 9, 11]);
    const min = prng.pick([15, 30, 45, 50]);
    const hr24 = hr12 + 12;
    const minStr = min < 10 ? `0${min}` : `${min}`;
    const correctAns = `$${hr24}:${minStr}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Converting 12-hour clock to 24-hour clock format',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: '24-hour clock = PM hour + 12',
        representation: 'definition', context: 'Time measurement',
        numbersUsed: [hr12, min, hr24], expectedReasoning: 'Add 12 hours for PM times in 24-hour notation',
        conceptKey: 'TWELVE_TO_TWENTY_FOUR_HOUR_CLOCK',
      },
      questionText: `Convert $${hr12}:${minStr}\\text{ PM}$ into $24\\text{-hour clock}$ notation:`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$0${hr12}:${minStr}$`,
        `$${hr24 + 1}:${minStr}$`,
        `$${hr12 + 10}:${minStr}$`,
      ], prng),
      given: `Time: $${hr12}:${minStr}\\text{ PM}$.`,
      required: `24-hour format.`,
      method: `For PM times after noon, add $12$ to the hour: $${hr12} + 12 = ${hr24}$.`,
      steps: [`$${hr12} + 12 = ${hr24} \\implies ${hr24}:${minStr}$.`],
      conclusion: `The time is $${hr24}:${minStr}$.`,
      hint: `Add 12 to the afternoon hour: $${hr12} + 12$.`,
    };
  }

  // Volume of Cylinder (Stage 58)
  if (nameL.includes('volume of cylinders') || nameL.includes('cylinder')) {
    const r = prng.pick([2, 3, 4, 5]);
    const h = prng.pick([7, 10, 14]);
    const volPi = r * r * h;
    const correctAns = `$${volPi}\\pi\\text{ cm}^3$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Volume of a cylinder in terms of pi',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'V = pi * r^2 * h',
        representation: 'equation', context: 'Circular solid volume',
        numbersUsed: [r, h, volPi], expectedReasoning: 'V = pi * r^2 * h',
        conceptKey: 'CYLINDER_VOLUME_PI_CALC',
      },
      questionText: `Find the volume of a cylinder with radius $${r}\\text{ cm}$ and height $${h}\\text{ cm}$ in terms of $\\pi$:`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${2 * r * h}\\pi\\text{ cm}^3$`,
        `$${volPi + 12}\\pi\\text{ cm}^3$`,
        `$${r * h}\\pi\\text{ cm}^3$`,
      ], prng),
      given: `Radius $r = ${r}\\text{ cm}$, Height $h = ${h}\\text{ cm}$.`,
      required: `Volume.`,
      method: `$V = \\pi r^2 h = \\pi \\times ${r}^2 \\times ${h} = ${volPi}\\pi\\text{ cm}^3$.`,
      steps: [
        `$r^2 = ${r}^2 = ${r * r}$.`,
        `$V = ${r * r} \\times ${h} \\times \\pi = ${volPi}\\pi\\text{ cm}^3$.`,
      ],
      conclusion: `The volume is $${volPi}\\pi\\text{ cm}^3$.`,
      hint: `Square the radius ($r^2$), then multiply by the height.`,
    };
  }

  // Default Perimeter / Area of Triangle (Stage 51, 52)
  const b = prng.int(6, 16);
  const h = prng.int(4, 12);
  const triArea = (b * h) / 2;
  const correctAns = `$${triArea}\\text{ cm}^2$`;

  return {
    blueprint: {
      mainTopic: topicArea, subtopic: topicName, skill: `Area computation for ${topicName}`,
      questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Area = 1/2 * base * height',
      representation: 'equation', context: 'Triangles mensuration',
      numbersUsed: [b, h, triArea], expectedReasoning: 'Triangle area is half the product of base and perpendicular height',
      conceptKey: `MENSURATION_STAGE_${stageId}_SKILL`,
    },
    questionText: `Find the area of a triangle with base $${b}\\text{ cm}$ and perpendicular height $${h}\\text{ cm}$:`,
    correctAnswer: correctAns,
    rawDistractors: makeUniqueDistractors(correctAns, [
      `$${b * h}\\text{ cm}^2$`, // forgot 1/2
      `$${triArea + 6}\\text{ cm}^2$`,
      `$${Math.max(4, triArea - 6)}\\text{ cm}^2$`,
    ], prng),
    given: `Base $b = ${b}\\text{ cm}$, height $h = ${h}\\text{ cm}$.`,
    required: `Area.`,
    method: `$\\text{Area} = \\dfrac{1}{2} \\times \\text{base} \\times \\text{height}$.`,
    steps: [
      `$${b} \\times ${h} = ${b * h}$.`,
      `$\\dfrac{${b * h}}{2} = ${triArea}\\text{ cm}^2$.`,
    ],
    conclusion: `The area is $${triArea}\\text{ cm}^2$.`,
    hint: `Multiply base by height, then divide by 2!`,
  };
}
