import { DifficultyTier } from '../../types';
import { PRNG } from '../generators/shared';
import { GeneratedTopicArtifact, makeUniqueDistractors, fmtFrac } from './types';

export function generateCoordinatesGraphsTopic(
  topicName: string,
  topicArea: string,
  stageId: number,
  difficulty: DifficultyTier,
  prng: PRNG,
  diffMultiplier: number
): GeneratedTopicArtifact {
  const nameL = topicName.toLowerCase();

  // 1. Distance Formula & Length of Segments
  if (nameL.includes('distance formula') || nameL.includes('distance on coordinate') || nameL.includes('length of line') || nameL.includes('horizontal distance') || nameL.includes('vertical distance')) {
    if (nameL.includes('horizontal distance')) {
      const x1 = prng.int(-6, 2);
      const x2 = x1 + prng.int(4, 12);
      const y = prng.int(-5, 8);
      const d = x2 - x1;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Finding horizontal distance between two points',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'd = |x2 - x1|',
          representation: 'coordinate_pair', context: 'Coordinate geometry',
          numbersUsed: [x1, x2, y, d], expectedReasoning: 'Horizontal distance is the absolute difference between x-coordinates',
          conceptKey: 'HORIZONTAL_DISTANCE_COORDINATES',
        },
        questionText: `Find the horizontal distance between the points $(${x1}, ${y})$ and $(${x2}, ${y})$:`,
        correctAnswer: `$${d}\\text{ units}$`,
        rawDistractors: [`$${d + 2}\\text{ units}$`, `$${Math.max(1, d - 2)}\\text{ units}$`, `$${d * 2}\\text{ units}$`],
        given: `Points $(${x1}, ${y})$ and $(${x2}, ${y})$ with identical $y$-coordinates.`,
        required: `Horizontal distance.`,
        method: `$d = |x_2 - x_1| = |${x2} - (${x1})| = ${d}$.`,
        steps: [`$d = ${x2} - (${x1}) = ${d}$.`],
        conclusion: `The horizontal distance is $${d}\\text{ units}$.`,
        hint: `Since the y-coordinates are identical, subtract the x-coordinates: $x_2 - x_1$.`,
      };
    }
    if (nameL.includes('vertical distance')) {
      const x = prng.int(-5, 7);
      const y1 = prng.int(-8, 1);
      const y2 = y1 + prng.int(5, 14);
      const d = y2 - y1;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Finding vertical distance between two points',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'd = |y2 - y1|',
          representation: 'coordinate_pair', context: 'Coordinate geometry',
          numbersUsed: [x, y1, y2, d], expectedReasoning: 'Vertical distance is the absolute difference between y-coordinates',
          conceptKey: 'VERTICAL_DISTANCE_COORDINATES',
        },
        questionText: `Find the vertical distance between the points $(${x}, ${y1})$ and $(${x}, ${y2})$:`,
        correctAnswer: `$${d}\\text{ units}$`,
        rawDistractors: [`$${d + 3}\\text{ units}$`, `$${Math.max(1, d - 3)}\\text{ units}$`, `$${d + 1}\\text{ units}$`],
        given: `Points $(${x}, ${y1})$ and $(${x}, ${y2})$ with identical $x$-coordinates.`,
        required: `Vertical distance.`,
        method: `$d = |y_2 - y_1| = |${y2} - (${y1})| = ${d}$.`,
        steps: [`$d = ${y2} - (${y1}) = ${d}$.`],
        conclusion: `The vertical distance is $${d}\\text{ units}$.`,
        hint: `Subtract the two y-values: $y_2 - y_1$.`,
      };
    }
    // Pythagorean distance between two points (3-4-5 or 5-12-13 multiple)
    const [dx, dy, d] = prng.pick([
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [8, 15, 17],
    ]);
    const x1 = prng.int(1, 4);
    const y1 = prng.int(1, 4);
    const x2 = x1 + dx;
    const y2 = y1 + dy;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Applying distance formula d = sqrt((x2-x1)^2 + (y2-y1)^2)',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Distance formula',
        representation: 'coordinate_pair', context: 'Coordinate geometry',
        numbersUsed: [x1, y1, x2, y2, d], expectedReasoning: 'Apply distance formula derived from Pythagorean theorem',
        conceptKey: 'DISTANCE_FORMULA_POINTS',
      },
      questionText: `Using the distance formula, find the exact distance between points $(${x1}, ${y1})$ and $(${x2}, ${y2})$:`,
      correctAnswer: `$${d}\\text{ units}$`,
      rawDistractors: [`$${d + 2}\\text{ units}$`, `$${d - 1}\\text{ units}$`, `$${dx + dy}\\text{ units}$`],
      given: `Points $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`,
      required: `Distance $d$.`,
      method: `$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} = \\sqrt{(${x2} - ${x1})^2 + (${y2} - ${y1})^2}$.`,
      steps: [
        `$\\Delta x = ${x2} - ${x1} = ${dx}$, so $(\\Delta x)^2 = ${dx * dx}$.`,
        `$\\Delta y = ${y2} - ${y1} = ${dy}$, so $(\\Delta y)^2 = ${dy * dy}$.`,
        `$d = \\sqrt{${dx * dx} + ${dy * dy}} = \\sqrt{${d * d}} = ${d}$.`,
      ],
      conclusion: `The distance is $${d}\\text{ units}$.`,
      hint: `Recall $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.`,
    };
  }

  // 2. Midpoint Formula
  if (nameL.includes('midpoint')) {
    const x1 = prng.pick([2, 4, 6]);
    const x2 = prng.pick([8, 10, 12]);
    const y1 = prng.pick([1, 3, 5]);
    const y2 = prng.pick([7, 9, 11]);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const correctAns = `$(${mx},\\; ${my})$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Calculating midpoint between two coordinate points',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Midpoint ((x1+x2)/2, (y1+y2)/2)',
        representation: 'coordinate_pair', context: 'Coordinate geometry',
        numbersUsed: [x1, y1, x2, y2, mx, my], expectedReasoning: 'Midpoint is the arithmetic mean of x and y coordinates',
        conceptKey: 'MIDPOINT_FORMULA_CALCULATION',
      },
      questionText: `Find the midpoint of the line segment joining points $(${x1}, ${y1})$ and $(${x2}, ${y2})$:`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$(${x2 - x1},\\; ${y2 - y1})$`,
        `$(${mx + 1},\\; ${my})$`,
        `$(${mx},\\; ${my + 1})$`,
      ], prng),
      given: `Coordinates $(${x1}, ${y1})$ and $(${x2}, ${y2})$.`,
      required: `Midpoint coordinates.`,
      method: `$M = \\left(\\dfrac{x_1 + x_2}{2},\\; \\dfrac{y_1 + y_2}{2}\\right)$.`,
      steps: [
        `$x = \\dfrac{${x1} + ${x2}}{2} = ${mx}$.`,
        `$y = \\dfrac{${y1} + ${y2}}{2} = ${my}$.`,
      ],
      conclusion: `The midpoint is $(${mx},\\; ${my})$.`,
      hint: `Add the x-values and divide by 2, then add the y-values and divide by 2.`,
    };
  }

  // 3. Gradient / Slope of a Line
  if (nameL.includes('gradient') || nameL.includes('slope')) {
    if (nameL.includes('gradient-intercept') || nameL.includes('slope-intercept')) {
      const m = prng.pick([2, 3, 4, 5, -2, -3]);
      const c = prng.int(1, 9);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Identifying gradient from slope-intercept equation y = mx + c',
          questionType: 'identification', difficulty, mathematicalOperation: 'Extract coefficient of x',
          representation: 'equation', context: 'Linear equations',
          numbersUsed: [m, c], expectedReasoning: 'In y = mx + c, the coefficient of x is the slope m',
          conceptKey: 'SLOPE_GRADIENT_FROM_EQUATION',
        },
        questionText: `What is the gradient (slope $m$) of the line with equation $y = ${m}x ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`}$?`,
        correctAnswer: `$m = ${m}$`,
        rawDistractors: [`$m = ${-m}$`, `$m = ${c}$`, `$m = \\dfrac{1}{${Math.abs(m)}}$`],
        given: `Linear equation $y = ${m}x + ${c}$.`,
        required: `Gradient $m$.`,
        method: `Compare with standard slope-intercept form $y = mx + c$.`,
        steps: [`The coefficient of $x$ is $m = ${m}$.`],
        conclusion: `The gradient is $m = ${m}$.`,
        hint: `In the form $y = mx + c$, the coefficient of $x$ is the slope.`,
      };
    }
    const x1 = prng.int(1, 4);
    const dx = prng.pick([2, 3, 4]);
    const x2 = x1 + dx;
    const m = prng.pick([2, 3, 4, -2, -3]);
    const y1 = prng.int(2, 7);
    const y2 = y1 + m * dx;
    const correctAns = `$m = ${m}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Finding gradient between two coordinate points',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'm = (y2 - y1) / (x2 - x1)',
        representation: 'coordinate_pair', context: 'Coordinate geometry',
        numbersUsed: [x1, y1, x2, y2, m], expectedReasoning: 'Slope formula m = (y2 - y1)/(x2 - x1)',
        conceptKey: 'GRADIENT_TWO_POINTS',
      },
      questionText: `Find the gradient (slope $m$) of the line passing through points $(${x1}, ${y1})$ and $(${x2}, ${y2})$:`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$m = ${-m}$`,
        `$m = ${fmtFrac(dx, y2 - y1)}$`,
        `$m = ${m + 1}$`,
      ], prng),
      given: `Points $A(${x1}, ${y1})$ and $B(${x2}, ${y2})$.`,
      required: `Gradient $m$.`,
      method: `$m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{${y2} - ${y1}}{${x2} - ${x1}}$.`,
      steps: [
        `Rise $= ${y2} - ${y1} = ${y2 - y1}$.`,
        `Run $= ${x2} - ${x1} = ${dx}$.`,
        `$m = \\dfrac{${y2 - y1}}{${dx}} = ${m}$.`,
      ],
      conclusion: `The gradient is $m = ${m}$.`,
      hint: `Use the formula: $\\text{slope} = \\dfrac{y_2 - y_1}{x_2 - x_1}$.`,
    };
  }

  // 4. Parallel and Perpendicular Lines
  if (nameL.includes('parallel') || nameL.includes('perpendicular')) {
    const m = prng.pick([2, 3, 4, 5]);
    if (nameL.includes('perpendicular')) {
      const correctAns = `$-\\dfrac{1}{${m}}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Perpendicular line gradient rule (m1 * m2 = -1)',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'm_perp = -1 / m',
          representation: 'equation', context: 'Linear coordinate geometry',
          numbersUsed: [m], expectedReasoning: 'Perpendicular lines have negative reciprocal slopes',
          conceptKey: 'PERPENDICULAR_LINE_GRADIENT',
        },
        questionText: `A line has equation $y = ${m}x + 8$. What is the gradient of any line perpendicular to it?`,
        correctAnswer: correctAns,
        rawDistractors: [`$${m}$`, `$-${m}$`, `$\\dfrac{1}{${m}}$`],
        given: `Original gradient $m_1 = ${m}$.`,
        required: `Perpendicular gradient $m_2$.`,
        method: `$m_1 \\times m_2 = -1 \\implies m_2 = -\\dfrac{1}{m_1} = -\\dfrac{1}{${m}}$.`,
        steps: [`$m_2 = -\\dfrac{1}{${m}}$.`],
        conclusion: `The perpendicular gradient is $-\\dfrac{1}{${m}}$.`,
        hint: `Perpendicular lines have negative reciprocal gradients: flip the fraction and negate.`,
      };
    }
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Parallel lines gradient rule (m1 = m2)',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'm_parallel = m',
        representation: 'equation', context: 'Linear coordinate geometry',
        numbersUsed: [m], expectedReasoning: 'Parallel lines have identical gradients',
        conceptKey: 'PARALLEL_LINE_GRADIENT',
      },
      questionText: `A line has equation $y = ${m}x - 5$. What is the gradient of any line parallel to it?`,
      correctAnswer: `$m = ${m}$`,
      rawDistractors: [`$m = -${m}$`, `$m = -\\dfrac{1}{${m}}$`, `$m = 5$`],
      given: `Original gradient $m_1 = ${m}$.`,
      required: `Parallel gradient $m_2$.`,
      method: `Parallel lines have identical gradients: $m_2 = m_1 = ${m}$.`,
      steps: [`$m_2 = ${m}$.`],
      conclusion: `The gradient of any parallel line is $m = ${m}$.`,
      hint: `Parallel lines never meet because they share the exact same slope.`,
    };
  }

  // 5. Horizontal and Vertical Lines
  if (nameL.includes('horizontal line') || nameL.includes('vertical line')) {
    if (nameL.includes('horizontal')) {
      const k = prng.int(-6, 8);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Horizontal line slope m = 0',
          questionType: 'identification', difficulty, mathematicalOperation: 'Horizontal line slope',
          representation: 'equation', context: 'Coordinate geometry',
          numbersUsed: [k], expectedReasoning: 'Horizontal lines have zero vertical rise, so slope is 0',
          conceptKey: 'HORIZONTAL_LINE_SLOPE',
        },
        questionText: `What is the gradient of the horizontal line with equation $y = ${k}$?`,
        correctAnswer: `$m = 0$`,
        rawDistractors: [`Undefined`, `$m = 1$`, `$m = ${k}$`],
        given: `Horizontal line $y = ${k}$.`,
        required: `Slope $m$.`,
        method: `A horizontal line has zero vertical rise: $m = \\dfrac{0}{\\Delta x} = 0$.`,
        steps: [`Slope $= 0$.`],
        conclusion: `The gradient is $m = 0$.`,
        hint: `A horizontal line is flat; its vertical change is 0.`,
      };
    }
    const k = prng.int(-5, 9);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Vertical line slope is undefined',
        questionType: 'identification', difficulty, mathematicalOperation: 'Division by zero slope',
        representation: 'equation', context: 'Coordinate geometry',
        numbersUsed: [k], expectedReasoning: 'Vertical lines have delta x = 0, causing division by zero',
        conceptKey: 'VERTICAL_LINE_SLOPE',
      },
      questionText: `What is the gradient of the vertical line with equation $x = ${k}$?`,
      correctAnswer: `Undefined (division by zero)`,
      rawDistractors: [`$m = 0$`, `$m = 1$`, `$m = ${k}$`],
      given: `Vertical line $x = ${k}$.`,
      required: `Gradient.`,
      method: `$\\Delta x = 0 \\implies m = \\dfrac{\\Delta y}{0}$, which is mathematically undefined.`,
      steps: [`Division by zero produces an undefined gradient.`],
      conclusion: `The gradient is undefined.`,
      hint: `Vertical lines have $\\Delta x = 0$, leading to division by zero.`,
    };
  }

  // 6. Explicit X-Intercept (ONLY when explicitly requested!)
  if (nameL.includes('x-intercept')) {
    const m = prng.pick([2, 3, 4, 5]);
    const root = prng.int(2, 6);
    const c = -m * root;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Finding x-intercept of a straight line',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Set y = 0 and solve for x',
        representation: 'equation', context: 'Linear graphs',
        numbersUsed: [m, root], expectedReasoning: 'Set y = 0 and solve linear equation for x',
        conceptKey: 'X_INTERCEPT_CALCULATION',
      },
      questionText: `Find the coordinates of the $x$-intercept for the linear equation:\n\n$$y = ${m}x ${c < 0 ? `- ${Math.abs(c)}` : `+ ${c}`}$$`,
      correctAnswer: `$(${root},\\; 0)$`,
      rawDistractors: [`$(0,\\; ${c})$`, `$(${c},\\; 0)$`, `$(-${root},\\; 0)$`],
      given: `Line $y = ${m}x ${c < 0 ? `- ${Math.abs(c)}` : `+ ${c}`}$.`,
      required: `$x$-intercept.`,
      method: `Set $y = 0$: $0 = ${m}x ${c < 0 ? `- ${Math.abs(c)}` : `+ ${c}`} \\implies ${m}x = ${-c} \\implies x = ${root}$. Coordinates are $(${root}, 0)$.`,
      steps: [`$0 = ${m}x ${c < 0 ? `- ${Math.abs(c)}` : `+ ${c}`} \\implies x = ${root}$.`],
      conclusion: `The $x$-intercept is $(${root},\\; 0)$.`,
      hint: `The line crosses the x-axis where $y = 0$.`,
    };
  }

  // 7. Explicit Y-Intercept (ONLY when explicitly topicName is y-intercept!)
  if (nameL === 'y-intercept' || nameL.includes('y-intercept') || nameL.includes('y intercept')) {
    const m = prng.pick([2, 3, 4, 5]);
    const c = prng.int(3, 14);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Finding y-intercept of a linear line',
        questionType: 'identification', difficulty, mathematicalOperation: 'Set x = 0 in y = mx + c',
        representation: 'equation', context: 'Linear graphs',
        numbersUsed: [m, c], expectedReasoning: 'Line crosses y-axis where x = 0, giving point (0, c)',
        conceptKey: 'Y_INTERCEPT_CALCULATION',
      },
      questionText: `What are the coordinates of the $y$-intercept for the linear equation $y = ${m}x + ${c}$?`,
      correctAnswer: `$(0,\\; ${c})$`,
      rawDistractors: [`$(${c},\\; 0)$`, `$(0,\\; ${m})$`, `$(${m},\\; ${c})$`],
      given: `Equation $y = ${m}x + ${c}$.`,
      required: `$y$-intercept coordinates.`,
      method: `Set $x = 0$: $y = ${m}(0) + ${c} = ${c}$. Coordinates are $(0, ${c})$.`,
      steps: [`When $x = 0$, $y = ${c}$.`],
      conclusion: `The $y$-intercept is $(0,\\; ${c})$.`,
      hint: `The line crosses the y-axis where $x = 0$.`,
    };
  }

  // 8. Cartesian Plane, Quadrants, Axes & Origin
  if (nameL.includes('quadrant') || nameL.includes('cartesian plane') || nameL.includes('origin') || nameL.includes('x-axis') || nameL.includes('y-axis') || nameL.includes('reading coordinates') || nameL.includes('ordered pairs')) {
    if (nameL.includes('origin')) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Identifying coordinates of the origin',
          questionType: 'identification', difficulty, mathematicalOperation: 'Origin coordinates',
          representation: 'definition', context: 'Cartesian coordinate plane',
          numbersUsed: [0, 0], expectedReasoning: 'The origin is the intersection of x and y axes at (0, 0)',
          conceptKey: 'ORIGIN_COORDINATES_IDENTIFICATION',
        },
        questionText: `What are the coordinates of the origin on the Cartesian plane?`,
        correctAnswer: `$(0,\\; 0)$`,
        rawDistractors: [`$(1,\\; 1)$`, `$(0,\\; 1)$`, `$(1,\\; 0)$`],
        given: `Origin definition.`,
        required: `Coordinates.`,
        method: `The origin is where the axes intersect: $x = 0, y = 0$.`,
        steps: [`Origin coordinates are $(0, 0)$.`],
        conclusion: `The coordinates are $(0, 0)$.`,
        hint: `The origin is the center point where both $x$ and $y$ are zero.`,
      };
    }
    if (nameL.includes('x-axis') || nameL.includes('y-axis')) {
      const isXAxis = nameL.includes('x-axis');
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Equation of coordinate axes',
          questionType: 'identification', difficulty, mathematicalOperation: 'Axis equation',
          representation: 'equation', context: 'Cartesian coordinate plane',
          numbersUsed: [0], expectedReasoning: 'x-axis is the line y = 0; y-axis is the line x = 0',
          conceptKey: isXAxis ? 'X_AXIS_EQUATION' : 'Y_AXIS_EQUATION',
        },
        questionText: `What is the algebraic equation of the ${isXAxis ? '$x$-axis' : '$y$-axis'} in the Cartesian plane?`,
        correctAnswer: isXAxis ? `$y = 0$` : `$x = 0$`,
        rawDistractors: isXAxis ? [`$x = 0$`, `$y = 1$`, `$x = y$` ] : [`$y = 0$`, `$x = 1$`, `$x = -y$`],
        given: `Coordinate axis ${isXAxis ? 'x-axis' : 'y-axis'}.`,
        required: `Equation.`,
        method: `On the ${isXAxis ? 'x-axis, every point has y = 0' : 'y-axis, every point has x = 0'}.`,
        steps: [`The equation is ${isXAxis ? '$y = 0$' : '$x = 0$'}.`],
        conclusion: `The equation is ${isXAxis ? '$y = 0$' : '$x = 0$'}.`,
        hint: `Think: along the entire ${isXAxis ? 'x-axis, what is the value of y' : 'y-axis, what is the value of x'}?`,
      };
    }
    // Quadrant identification
    const signs = [
      { x: prng.int(2, 7), y: prng.int(2, 7), q: 'Quadrant I ($+x, +y$)' },
      { x: -prng.int(2, 7), y: prng.int(2, 7), q: 'Quadrant II ($-x, +y$)' },
      { x: -prng.int(2, 7), y: -prng.int(2, 7), q: 'Quadrant III ($-x, -y$)' },
      { x: prng.int(2, 7), y: -prng.int(2, 7), q: 'Quadrant IV ($+x, -y$)' },
    ];
    const picked = prng.pick(signs);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Identifying Cartesian coordinate quadrant',
        questionType: 'identification', difficulty, mathematicalOperation: 'Sign analysis of (x, y)',
        representation: 'coordinate_pair', context: 'Cartesian coordinate plane',
        numbersUsed: [picked.x, picked.y], expectedReasoning: 'Examine signs of abscissa and ordinate',
        conceptKey: 'CARTESIAN_QUADRANT_IDENTIFICATION',
      },
      questionText: `In which quadrant of the Cartesian coordinate plane does the point $(${picked.x},\\; ${picked.y})$ lie?`,
      correctAnswer: picked.q,
      rawDistractors: signs.filter(s => s.q !== picked.q).map(s => s.q),
      given: `Point $(${picked.x}, ${picked.y})$.`,
      required: `Quadrant.`,
      method: `$x = ${picked.x}$ (${picked.x > 0 ? 'positive' : 'negative'}), $y = ${picked.y}$ (${picked.y > 0 ? 'positive' : 'negative'}).`,
      steps: [`$(${picked.x}, ${picked.y})$ is in ${picked.q}.`],
      conclusion: `The point lies in ${picked.q}.`,
      hint: `QI is (+, +), QII is (-, +), QIII is (-, -), and QIV is (+, -).`,
    };
  }

  // 9. Tables of Values & Points on Lines
  if (nameL.includes('table of values') || nameL.includes('tables of values') || nameL.includes('linear graphs') || nameL.includes('plotting linear') || nameL.includes('point-slope form')) {
    const m = prng.pick([2, 3, 4]);
    const c = prng.int(1, 6);
    const x = prng.pick([3, 4, 5]);
    const yVal = m * x + c;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Evaluating linear table of values y = mx + c',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Substitution into linear function',
        representation: 'equation', context: 'Linear table of values',
        numbersUsed: [m, c, x, yVal], expectedReasoning: 'Substitute the given x value into y = mx + c',
        conceptKey: 'TABLE_OF_VALUES_EVALUATION',
      },
      questionText: `For the linear equation $y = ${m}x + ${c}$, complete the table of values: what is the value of $y$ when $x = ${x}$?`,
      correctAnswer: `$y = ${yVal}$`,
      rawDistractors: [`$y = ${yVal + m}$`, `$y = ${yVal - c}$`, `$y = ${m * x}$`],
      given: `Function $y = ${m}x + ${c}$, input $x = ${x}$.`,
      required: `Value of $y$.`,
      method: `Substitute $x = ${x}$: $y = ${m}(${x}) + ${c} = ${m * x} + ${c} = ${yVal}$.`,
      steps: [`$y = ${m * x} + ${c} = ${yVal}$.`],
      conclusion: `When $x = ${x}$, $y = ${yVal}$.`,
      hint: `Multiply $x$ by $${m}$ and add $${c}$.`,
    };
  }

  // 10. Kinematics & Rate Graphs
  if (nameL.includes('travel graph') || nameL.includes('distance-time') || nameL.includes('speed-time') || nameL.includes('conversion graph') || nameL.includes('rate of change')) {
    if (nameL.includes('speed-time')) {
      const a = prng.pick([2, 3, 4]);
      const t = prng.pick([3, 5, 6]);
      const deltaV = a * t;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Interpreting acceleration as gradient of speed-time graph',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Acceleration = Delta v / Delta t',
          representation: 'graph_description', context: 'Speed-time graphs',
          numbersUsed: [a, t, deltaV], expectedReasoning: 'The slope of a speed-time graph represents acceleration',
          conceptKey: 'SPEED_TIME_GRAPH_ACCELERATION',
        },
        questionText: `On a speed-time graph, a vehicle accelerates uniformly from rest to a speed of $${deltaV}\\text{ m/s}$ over $${t}\\text{ seconds}$.\n\nWhat is the acceleration (gradient)?`,
        correctAnswer: `$${a}\\text{ m/s}^2$`,
        rawDistractors: [`$${a + 2}\\text{ m/s}^2$`, `$${deltaV * t}\\text{ m/s}^2$`, `$${Math.round(deltaV / 2)}\\text{ m/s}^2$`],
        given: `Change in velocity $= ${deltaV}\\text{ m/s}$, change in time $= ${t}\\text{ s}$.`,
        required: `Acceleration $a$.`,
        method: `$\\text{Acceleration} = \\text{Gradient} = \\dfrac{\\Delta v}{\\Delta t} = \\dfrac{${deltaV}}{${t}} = ${a}\\text{ m/s}^2$.`,
        steps: [`$a = \\dfrac{${deltaV}}{${t}} = ${a}\\text{ m/s}^2$.`],
        conclusion: `The acceleration is $${a}\\text{ m/s}^2$.`,
        hint: `Divide change in speed by time.`,
      };
    }
    const hours = prng.pick([2, 3, 4]);
    const km = prng.pick([120, 150, 180, 240]);
    const speed = km / hours;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Interpreting gradient of distance-time graph as speed',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Speed = Distance / Time',
        representation: 'graph_description', context: 'Distance-time graphs',
        numbersUsed: [hours, km, speed], expectedReasoning: 'Gradient of distance-time graph equals speed',
        conceptKey: 'DISTANCE_TIME_GRAPH_SPEED',
      },
      questionText: `On a distance-time graph, a train covers $${km}\\text{ km}$ in $${hours}\\text{ hours}$ at constant speed.\n\nWhat speed does the gradient of this section represent?`,
      correctAnswer: `$${speed}\\text{ km/h}$`,
      rawDistractors: [`$${speed + 15}\\text{ km/h}$`, `$${Math.max(20, speed - 15)}\\text{ km/h}$`, `$${km}\\text{ km/h}$`],
      given: `Vertical change $= ${km}\\text{ km}$, horizontal change $= ${hours}\\text{ h}$.`,
      required: `Speed.`,
      method: `$\\text{Speed} = \\dfrac{\\Delta d}{\\Delta t} = \\dfrac{${km}}{${hours}} = ${speed}\\text{ km/h}$.`,
      steps: [`$\\text{Speed} = \\dfrac{${km}}{${hours}} = ${speed}\\text{ km/h}$.`],
      conclusion: `The speed represented is $${speed}\\text{ km/h}$.`,
      hint: `Speed equals distance divided by time.`,
    };
  }

  // 11. Statistical & Data Graphs
  if (nameL.includes('pie chart') || nameL.includes('bar graph') || nameL.includes('scatter') || nameL.includes('box plot') || nameL.includes('stem-and-leaf') || nameL.includes('histogram') || nameL.includes('two-way table') || nameL.includes('frequency graph')) {
    if (nameL.includes('pie chart')) {
      const total = prng.pick([120, 180, 240, 360]);
      const slice = prng.pick([30, 45, 60, 90]);
      const angle = (slice / total) * 360;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Calculating pie chart sector angle',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Angle = (frequency / total) * 360',
          representation: 'data_table', context: 'Pie chart sector angles',
          numbersUsed: [slice, total, angle], expectedReasoning: 'Sector angle is proportional to the fraction of 360 degrees',
          conceptKey: 'PIE_CHART_SECTOR_ANGLE',
        },
        questionText: `In a survey of $${total}$ students, $${slice}$ chose Mathematics as their favorite subject.\n\nWhat sector angle represents this group on a pie chart?`,
        correctAnswer: `$${angle}^\\circ$`,
        rawDistractors: [`$${angle + 15}^\\circ$`, `$${angle - 15}^\\circ$`, `$${Math.round((slice / total) * 100)}\\%$`],
        given: `Subgroup $= ${slice}$, Total $= ${total}$.`,
        required: `Sector angle.`,
        method: `$\\text{Angle} = \\dfrac{${slice}}{${total}} \\times 360^\\circ$.`,
        steps: [`$\\text{Angle} = \\dfrac{${slice}}{${total}} \\times 360^\\circ = ${angle}^\\circ$.`],
        conclusion: `The sector angle is $${angle}^\\circ$.`,
        hint: `Multiply the fraction $\\frac{${slice}}{${total}}$ by $360^\\circ$.`,
      };
    }
    if (nameL.includes('box plot')) {
      const q1 = prng.int(15, 25);
      const q3 = q1 + prng.int(12, 22);
      const iqr = q3 - q1;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Calculating interquartile range from box plot quartiles',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'IQR = Q3 - Q1',
          representation: 'data_table', context: 'Box-and-whisker plots',
          numbersUsed: [q1, q3, iqr], expectedReasoning: 'IQR is the difference between upper and lower quartiles',
          conceptKey: 'BOX_PLOT_IQR_CALCULATION',
        },
        questionText: `A box plot displays a lower quartile of $Q_1 = ${q1}$ and an upper quartile of $Q_3 = ${q3}$.\n\nWhat is the Interquartile Range (IQR)?`,
        correctAnswer: `$${iqr}$`,
        rawDistractors: [`$${iqr + 4}$`, `$${Math.round((q1 + q3) / 2)}$`, `$${q1 + q3}$`],
        given: `Quartiles $Q_1 = ${q1}$, $Q_3 = ${q3}$.`,
        required: `$\\text{IQR}$.`,
        method: `$\\text{IQR} = Q_3 - Q_1 = ${q3} - ${q1} = ${iqr}$.`,
        steps: [`$\\text{IQR} = ${q3} - ${q1} = ${iqr}$.`],
        conclusion: `The interquartile range is $${iqr}$.`,
        hint: `Subtract $Q_1$ from $Q_3$.`,
      };
    }
    if (nameL.includes('scatter')) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Interpreting correlation from scatter plot trend',
          questionType: 'identification', difficulty, mathematicalOperation: 'Correlation direction',
          representation: 'graph_description', context: 'Bivariate scatter diagrams',
          numbersUsed: [1], expectedReasoning: 'As x increases and y increases, the relationship has positive correlation',
          conceptKey: 'SCATTER_PLOT_CORRELATION',
        },
        questionText: `On a scatter plot, as the variable on the horizontal axis increases, the variable on the vertical axis also consistently increases.\n\nWhat type of correlation is demonstrated?`,
        correctAnswer: `Positive correlation`,
        rawDistractors: [`Negative correlation`, `Zero correlation`, `Inverse correlation`],
        given: `Trend: Both variables increase together.`,
        required: `Type of correlation.`,
        method: `An upward sloping cloud of points indicates positive correlation.`,
        steps: [`Both variables increase together $\\implies$ positive correlation.`],
        conclusion: `The scatter plot shows positive correlation.`,
        hint: `Upward trend means positive; downward trend means negative.`,
      };
    }
    // Bar graph / two-way table default
    const valA = prng.int(24, 45);
    const valB = prng.int(15, valA - 2);
    const diff = valA - valB;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Interpreting values from graphical data chart',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Difference between categories',
        representation: 'data_table', context: 'Bar chart comparison',
        numbersUsed: [valA, valB, diff], expectedReasoning: 'Subtract frequency of category B from category A',
        conceptKey: 'DATA_CHART_FREQUENCY_DIFFERENCE',
      },
      questionText: `On a frequency bar graph, Category A has a frequency of $${valA}$ and Category B has a frequency of $${valB}$.\n\nBy how much does Category A exceed Category B?`,
      correctAnswer: `$${diff}$`,
      rawDistractors: [`$${diff + 5}$`, `$${valA + valB}$`, `$${diff - 3}$`],
      given: `Category A $= ${valA}$, Category B $= ${valB}$.`,
      required: `Difference.`,
      method: `$\\text{Difference} = ${valA} - ${valB} = ${diff}$.`,
      steps: [`$${valA} - ${valB} = ${diff}$.`],
      conclusion: `Category A exceeds Category B by $${diff}$.`,
      hint: `Subtract the smaller frequency from the larger.`,
    };
  }

  // 12. Non-linear Graphs, Parabolas, Roots & Transformations
  if (nameL.includes('quadratic graph') || nameL.includes('parabolic') || nameL.includes('cubic') || nameL.includes('exponential graph') || nameL.includes('reciprocal graph') || nameL.includes('turning point') || nameL.includes('roots of graph') || nameL.includes('transformation') || nameL.includes('intercepts')) {
    if (nameL.includes('roots') || nameL.includes('intercepts')) {
      const r1 = prng.int(1, 4);
      const r2 = r1 + prng.int(2, 4);
      // y = (x - r1)(x - r2) = x^2 - (r1+r2)x + r1*r2
      const b = -(r1 + r2);
      const c = r1 * r2;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Finding roots of a parabolic graph where y = 0',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Factoring quadratic graph roots',
          representation: 'equation', context: 'Quadratic curves',
          numbersUsed: [r1, r2, b, c], expectedReasoning: 'Roots are x-values where graph intersects the x-axis',
          conceptKey: 'QUADRATIC_GRAPH_ROOTS',
        },
        questionText: `A parabolic graph has equation $y = x^2 - ${r1 + r2}x + ${c}$.\n\nAt what $x$-values does the graph intersect the $x$-axis (the roots)?`,
        correctAnswer: `$x = ${r1}$ and $x = ${r2}$`,
        rawDistractors: [`$x = -${r1}$ and $x = -${r2}$`, `$x = ${r1 + 1}$ and $x = ${r2 + 1}$`, `$x = 0$ and $x = ${c}$`],
        given: `Quadratic equation $y = x^2 - ${r1 + r2}x + ${c}$.`,
        required: `Roots of the graph.`,
        method: `Set $y = 0$: $x^2 - ${r1 + r2}x + ${c} = (x - ${r1})(x - ${r2}) = 0$.`,
        steps: [`$x = ${r1}$ or $x = ${r2}$.`],
        conclusion: `The roots are $x = ${r1}$ and $x = ${r2}$.`,
        hint: `Factor the quadratic expression: $(x - a)(x - b) = 0$.`,
      };
    }
    if (nameL.includes('transformation') || nameL.includes('translation')) {
      const k = prng.pick([3, 4, 5]);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Interpreting vertical translation of function graph y = f(x) + c',
          questionType: 'identification', difficulty, mathematicalOperation: 'Vertical translation vector',
          representation: 'equation', context: 'Graph transformations',
          numbersUsed: [k], expectedReasoning: 'Adding a constant c shifts the graph vertically upward by c units',
          conceptKey: 'VERTICAL_GRAPH_TRANSLATION',
        },
        questionText: `The graph of $y = f(x)$ is transformed into the graph of $y = f(x) + ${k}$.\n\nDescribe the geometric effect of this transformation on the curve:`,
        correctAnswer: `Shifted vertically upward by $${k}$ units`,
        rawDistractors: [
          `Shifted horizontally to the right by $${k}$ units`,
          `Shifted vertically downward by $${k}$ units`,
          `Stretched vertically by a scale factor of $${k}$`,
        ],
        given: `Transformation $y = f(x) + ${k}$.`,
        required: `Geometric effect.`,
        method: `Adding positive constant $k$ to $f(x)$ translates the graph upward by $k$ units.`,
        steps: [`Vertical shift $= +${k}$ units upward.`],
        conclusion: `The graph is shifted vertically upward by $${k}$ units.`,
        hint: `Adding outside the function moves the graph vertically: $+k$ moves up.`,
      };
    }
    // Axis of symmetry / vertex of parabola
    const h = prng.pick([2, 3, 4]);
    const k = prng.int(1, 5);
    // y = (x - h)^2 + k = x^2 - 2hx + (h^2 + k)
    const bCoeff = 2 * h;
    const cCoeff = h * h + k;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Finding axis of symmetry of a parabola x = -b/(2a)',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'x = -b / (2a)',
        representation: 'equation', context: 'Quadratic graphs',
        numbersUsed: [h, bCoeff, cCoeff], expectedReasoning: 'Axis of symmetry is given by x = -b/(2a)',
        conceptKey: 'PARABOLA_AXIS_OF_SYMMETRY',
      },
      questionText: `What is the equation of the axis of symmetry for the parabola with equation $y = x^2 - ${bCoeff}x + ${cCoeff}$?`,
      correctAnswer: `$x = ${h}$`,
      rawDistractors: [`$x = -${h}$`, `$x = ${bCoeff}$`, `$y = ${h}$`],
      given: `Equation $y = x^2 - ${bCoeff}x + ${cCoeff}$ with $a = 1, b = -${bCoeff}$.`,
      required: `Axis of symmetry.`,
      method: `$x = -\\dfrac{b}{2a} = -\\dfrac{-${bCoeff}}{2(1)} = ${h}$.`,
      steps: [`$x = \\dfrac{${bCoeff}}{2} = ${h}$.`],
      conclusion: `The axis of symmetry is $x = ${h}$.`,
      hint: `Use the formula $x = -\\dfrac{b}{2a}$.`,
    };
  }

  // 13. Deterministic Diversified Archetype Fallback for Any Residual Topic
  // NEVER fall back to y-intercept! Use deterministic hash modulo 8 archetypes.
  const hash = topicName.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const archetypeVariant = hash % 8;

  if (archetypeVariant === 0) {
    // Testing if a point lies on a given line
    const m = prng.pick([2, 3, 4]);
    const c = prng.int(1, 5);
    const x = prng.int(2, 5);
    const yOnLine = m * x + c;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: `Verifying point satisfaction on line for ${topicName}`,
        questionType: 'identification', difficulty, mathematicalOperation: 'Point satisfaction y = mx + c',
        representation: 'coordinate_pair', context: 'Coordinate geometry',
        numbersUsed: [x, yOnLine, m, c], expectedReasoning: 'Substitute x into equation to see if it produces y',
        conceptKey: `POINT_ON_LINE_${hash}`,
      },
      questionText: `Which of the following points lies exactly on the straight line $y = ${m}x + ${c}$?`,
      correctAnswer: `$(${x},\\; ${yOnLine})$`,
      rawDistractors: [`$(${x},\\; ${yOnLine + 2})$`, `$(${x + 1},\\; ${yOnLine})$`, `$(${yOnLine},\\; ${x})$`],
      given: `Line $y = ${m}x + ${c}$.`,
      required: `Point on line.`,
      method: `When $x = ${x}$, $y = ${m}(${x}) + ${c} = ${yOnLine}$.`,
      steps: [`$y = ${m * x} + ${c} = ${yOnLine} \\implies (${x}, ${yOnLine})$ lies on the line.`],
      conclusion: `The point $(${x},\\; ${yOnLine})$ lies on the line.`,
      hint: `Substitute the x-coordinate into the equation to see which point produces the correct y-value.`,
    };
  } else if (archetypeVariant === 1) {
    // Distance from point to y-axis
    const px = prng.int(3, 9);
    const py = prng.int(-8, 8);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: `Perpendicular distance to axes for ${topicName}`,
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Distance to y-axis = |x|',
        representation: 'coordinate_pair', context: 'Coordinate geometry',
        numbersUsed: [px, py], expectedReasoning: 'Distance to y-axis is the absolute value of the x-coordinate',
        conceptKey: `DISTANCE_TO_AXIS_${hash}`,
      },
      questionText: `What is the shortest perpendicular distance from the point $(${px},\\; ${py})$ to the $y$-axis?`,
      correctAnswer: `$${px}\\text{ units}$`,
      rawDistractors: [`$${Math.abs(py)}\\text{ units}$`, `$${px + 2}\\text{ units}$`, `$${Math.abs(px + py)}\\text{ units}$`],
      given: `Point $(${px}, ${py})$.`,
      required: `Distance to $y$-axis.`,
      method: `Distance to $y$-axis equals $|x| = |${px}| = ${px}$.`,
      steps: [`Distance $= |x| = ${px}$.`],
      conclusion: `The distance is $${px}\\text{ units}$.`,
      hint: `The distance to the y-axis is simply the horizontal coordinate $|x|$.`,
    };
  } else if (archetypeVariant === 2) {
    // Reflection of point in x-axis
    const px = prng.int(2, 7);
    const py = prng.int(3, 8);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: `Reflecting coordinate in x-axis (x, -y) for ${topicName}`,
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Reflection (x, y) -> (x, -y)',
        representation: 'coordinate_pair', context: 'Coordinate transformations',
        numbersUsed: [px, py], expectedReasoning: 'Reflection across x-axis negates the y-coordinate',
        conceptKey: `REFLECTION_IN_X_AXIS_${hash}`,
      },
      questionText: `What are the coordinates of the image when point $(${px},\\; ${py})$ is reflected across the $x$-axis?`,
      correctAnswer: `$(${px},\\; -${py})$`,
      rawDistractors: [`$(-${px},\\; ${py})$`, `$(-${px},\\; -${py})$`, `$(${py},\\; ${px})$`],
      given: `Point $(${px}, ${py})$, reflection across $x$-axis.`,
      required: `Image point coordinates.`,
      method: `Reflection in the $x$-axis maps $(x, y) \\to (x, -y)$.`,
      steps: [`$(${px}, ${py}) \\to (${px}, -${py})$.`],
      conclusion: `The image point is $(${px},\\; -${py})$.`,
      hint: `Reflecting across the horizontal x-axis flips the sign of the vertical coordinate y.`,
    };
  } else if (archetypeVariant === 3) {
    // Linear function slope from two points
    const x1 = 0;
    const y1 = prng.int(2, 6);
    const x2 = prng.pick([2, 4]);
    const m = prng.pick([3, 4, 5]);
    const y2 = y1 + m * x2;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: `Slope of linear relationship for ${topicName}`,
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'm = (y2 - y1) / (x2 - x1)',
        representation: 'coordinate_pair', context: 'Linear rate analysis',
        numbersUsed: [x1, y1, x2, y2, m], expectedReasoning: 'Rate of change is slope m = delta y / delta x',
        conceptKey: `LINEAR_RATE_CHANGE_${hash}`,
      },
      questionText: `A line passes through $(0,\\; ${y1})$ and $(${x2},\\; ${y2})$. What is its rate of change (slope)?`,
      correctAnswer: `$${m}$`,
      rawDistractors: [`$${-m}$`, `$${m + 1}$`, `$${m * 2}$`],
      given: `Points $(0, ${y1})$ and $(${x2}, ${y2})$.`,
      required: `Rate of change $m$.`,
      method: `$m = \\dfrac{${y2} - ${y1}}{${x2} - 0} = \\dfrac{${y2 - y1}}{${x2}} = ${m}$.`,
      steps: [`$m = \\dfrac{${y2 - y1}}{${x2}} = ${m}$.`],
      conclusion: `The rate of change is $${m}$.`,
      hint: `Compute change in y divided by change in x.`,
    };
  } else if (archetypeVariant === 4) {
    // Standard form equation rearranged to slope form
    const a = prng.pick([2, 3, 4]);
    const b = prng.pick([1, 2]);
    const c = prng.pick([6, 12]);
    const slope = -a / b;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: `Finding gradient from standard equation Ax + By = C for ${topicName}`,
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'm = -A / B',
        representation: 'equation', context: 'Linear equations',
        numbersUsed: [a, b, c, slope], expectedReasoning: 'Rearrange Ax + By = C into y = (-A/B)x + C/B',
        conceptKey: `STANDARD_FORM_GRADIENT_${hash}`,
      },
      questionText: `What is the gradient of the straight line with standard equation $${a}x + ${b === 1 ? '' : b}y = ${c}$?`,
      correctAnswer: `$${slope}$`,
      rawDistractors: [`$${Math.abs(slope)}$`, `$${a}$`, `$${-a}$`],
      given: `Equation $${a}x + ${b === 1 ? '' : b}y = ${c}$.`,
      required: `Gradient.`,
      method: `Rearrange: $${b}y = -${a}x + ${c} \\implies y = ${slope}x + \\dfrac{${c}}{${b}}$.`,
      steps: [`The coefficient of $x$ is $${slope}$.`],
      conclusion: `The gradient is $${slope}$.`,
      hint: `Rearrange the equation into $y = mx + c$ form by isolating $y$.`,
    };
  } else if (archetypeVariant === 5) {
    // Quadrant quadrant signs
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: `Signs of coordinates in Quadrant III for ${topicName}`,
        questionType: 'identification', difficulty, mathematicalOperation: 'Quadrant properties',
        representation: 'definition', context: 'Cartesian coordinate plane',
        numbersUsed: [3], expectedReasoning: 'Quadrant III has negative x and negative y',
        conceptKey: `QUADRANT_III_SIGNS_${hash}`,
      },
      questionText: `In Quadrant III of the Cartesian coordinate plane, what are the signs of the $x$-coordinate and $y$-coordinate?`,
      correctAnswer: `$x < 0$ and $y < 0$ (both negative)`,
      rawDistractors: [
        `$x > 0$ and $y > 0$ (both positive)`,
        `$x < 0$ and $y > 0$ (negative, positive)`,
        `$x > 0$ and $y < 0$ (positive, negative)`,
      ],
      given: `Quadrant III properties.`,
      required: `Signs of coordinates.`,
      method: `Quadrant III lies in the lower-left plane where $x < 0$ and $y < 0$.`,
      steps: [`Both coordinates are negative.`],
      conclusion: `Both $x < 0$ and $y < 0$.`,
      hint: `Quadrant III is the bottom-left quadrant.`,
    };
  } else if (archetypeVariant === 6) {
    // Intersection of line with line y = k
    const m = prng.pick([2, 3]);
    const k = prng.pick([7, 10, 13]);
    const c = prng.pick([1, 2]);
    const xInter = (k - c) / m;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: `Finding intersection of line with horizontal line for ${topicName}`,
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Simultaneous substitution',
        representation: 'equation', context: 'Linear intersections',
        numbersUsed: [m, c, k, xInter], expectedReasoning: 'Substitute y = k into linear equation to find x',
        conceptKey: `LINE_INTERSECTION_EVAL_${hash}`,
      },
      questionText: `Find the $x$-coordinate of the intersection point between the line $y = ${m}x + ${c}$ and the horizontal line $y = ${k}$:`,
      correctAnswer: `$x = ${xInter}$`,
      rawDistractors: [`$x = ${xInter + 1}$`, `$x = ${xInter - 1}$`, `$x = ${k - c}$`],
      given: `Lines $y = ${m}x + ${c}$ and $y = ${k}$.`,
      required: `$x$-coordinate of intersection.`,
      method: `Set equal: $${m}x + ${c} = ${k} \\implies ${m}x = ${k - c} \\implies x = ${xInter}$.`,
      steps: [`$${m}x = ${k - c} \\implies x = ${xInter}$.`],
      conclusion: `The $x$-coordinate is $x = ${xInter}$.`,
      hint: `Set the two equations equal to each other and solve for $x$.`,
    };
  } else {
    // Midpoint between origin and point
    const x = prng.pick([4, 6, 8, 10]);
    const y = prng.pick([2, 4, 6, 8]);
    const mx = x / 2;
    const my = y / 2;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: `Finding midpoint from origin for ${topicName}`,
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Midpoint from origin (x/2, y/2)',
        representation: 'coordinate_pair', context: 'Coordinate geometry',
        numbersUsed: [x, y, mx, my], expectedReasoning: 'Midpoint of segment from (0,0) to (x,y) is (x/2, y/2)',
        conceptKey: `ORIGIN_SEGMENT_MIDPOINT_${hash}`,
      },
      questionText: `What is the midpoint of the line segment connecting the origin $(0,\\; 0)$ to the point $(${x},\\; ${y})$?`,
      correctAnswer: `$(${mx},\\; ${my})$`,
      rawDistractors: [`$(${x},\\; ${my})$`, `$(${mx},\\; ${y})$`, `$(${x - 1},\\; ${y - 1})$`],
      given: `Origin $(0, 0)$ and point $(${x}, ${y})$.`,
      required: `Midpoint.`,
      method: `$M = \\left(\\dfrac{0 + ${x}}{2},\\; \\dfrac{0 + ${y}}{2}\\right) = (${mx}, ${my})$.`,
      steps: [`$M = (${mx}, ${my})$.`],
      conclusion: `The midpoint is $(${mx},\\; ${my})$.`,
      hint: `Divide each coordinate by 2.`,
    };
  }
}
