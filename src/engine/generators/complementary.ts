import { GeneratorContext, GeneratedQuestionDraft, generateNumericalDistractors, gcd, lcm } from './shared';

/**
 * Universal Complementary Archetype Generator.
 * Provides distinct subtopics 5, 6, 7, 8, and 9 for Worlds 2 through 10 (Stages 11-92, 96-99).
 * Ensures that within any 10-question block, every single question tests a
 * completely unique mathematical principle/formula/approach with zero repetition!
 */
export function generateComplementaryQuestion(ctx: GeneratorContext): GeneratedQuestionDraft {
  const { stageId, levelId, blockId, questionIndex, prng, tierMultiplier } = ctx;
  const subtopicIndex = ctx.subtopicIndex !== undefined ? ctx.subtopicIndex : (questionIndex + (blockId % 10)) % 10; // 5, 6, 7, 8, 9

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

  // ==========================================
  // WORLD 2: NUMERICAL MASTERY (Stages 11-20)
  // ==========================================
  if (stageId === 11 || stageId === 12) {
    // Integers & Negative Numbers (Subtopics 5-9)
    if (subtopicIndex === 5) {
      // Signed division
      const b = prng.pick([2, 3, 4, 5, 6]);
      const k = prng.int(3, 9);
      const a = b * k;
      const bothNeg = prng.next() > 0.5;
      if (bothNeg) {
        questionText = `Evaluate the division of two negative integers:\n\n$$\\frac{-${a}}{-${b}}$$`;
        correctAnswer = `$${k}$`;
        rawDistractors = [`$${-k}$`, `$${k + 1}$`, `$${Math.max(1, k - 1)}$`];
        method = `Negative divided by negative yields a positive quotient: $\\frac{-a}{-b} = +\\frac{a}{b}$.`;
        steps = [`$\\frac{-${a}}{-${b}} = ${k}$.`];
      } else {
        questionText = `Evaluate the division of signed integers:\n\n$$\\frac{-${a}}{${b}}$$`;
        correctAnswer = `$${-k}$`;
        rawDistractors = [`$${k}$`, `$${-(k + 1)}$`, `$${-k + 2}$`];
        method = `Negative divided by positive yields a negative quotient: $\\frac{-a}{b} = -\\frac{a}{b}$.`;
        steps = [`$\\frac{-${a}}{${b}} = -${k}$.`];
      }
      given = `Division with negative numbers.`;
      required = `Quotient.`;
      conclusion = `Result is ${correctAnswer}.`;
      hint = `Two negative signs cancel out to make a positive; one negative sign stays negative.`;
    } else if (subtopicIndex === 6) {
      // Solve for missing integer x + (-b) = c
      const b = prng.int(4, 15);
      const c = prng.int(-10, 10);
      const x = c + b;
      questionText = `Find the integer value of $x$ that satisfies the equation: $$x + (-${b}) = ${c}$$`;
      correctAnswer = `$${x}$`;
      rawDistractors = generateNumericalDistractors(x, prng, true, true).map(d => `$${d}$`);
      given = `Equation $x - ${b} = ${c}$.`;
      required = `Value of $x$.`;
      method = `Add $${b}$ to both sides: $x = ${c} + ${b} = ${x}$.`;
      steps = [`$x = ${c} + ${b} = ${x}$.`];
      conclusion = `$x = ${x}$.`;
      hint = `Adding a negative is the same as subtracting. Add $${b}$ to the other side to isolate $x$.`;
    } else if (subtopicIndex === 7) {
      // Powers with negative base: (-k)^2 vs -k^2
      const k = prng.int(3, 9);
      const askParen = prng.next() > 0.5;
      if (askParen) {
        const ans = k * k;
        questionText = `Evaluate the power of the negative integer: $$(-${k})^2$$`;
        correctAnswer = `$${ans}$`;
        rawDistractors = [`$${-ans}$`, `$${2 * k}$`, `$${-2 * k}$`];
        method = `When the base is in parentheses, the negative sign is squared: $(-k)^2 = (-k) \\times (-k) = +k^2$.`;
        steps = [`$(-${k}) \\times (-${k}) = ${ans}$.`];
        conclusion = `$(-${k})^2 = ${ans}$.`;
        hint = `The negative sign is inside the parentheses, so it gets multiplied by itself.`;
      } else {
        const ans = -k * k;
        questionText = `Evaluate the expression: $$-${k}^2$$`;
        correctAnswer = `$${ans}$`;
        rawDistractors = [`$${-ans}$`, `$${2 * k}$`, `$${-2 * k}$`];
        method = `By order of operations, exponents take precedence over negation: $-k^2 = -(k^2) = -${k * k}$.`;
        steps = [`$k^2 = ${k * k}$, then negate: $-${k * k}$.`];
        conclusion = `$-${k}^2 = ${ans}$.`;
        hint = `Exponents come before the minus sign unless there are parentheses!`;
      }
      given = `Power with negative symbol.`;
      required = `Evaluated integer.`;
    } else if (subtopicIndex === 8) {
      // Bank account debt word problem
      const bal = prng.int(20, 80);
      const withdraw = bal + prng.int(15, 60);
      const newBal = bal - withdraw;
      questionText = `A bank balance starts at $\\text{\\$} ${bal}$. After a withdrawal of $\\text{\\$} ${withdraw}$, what is the new balance?`;
      correctAnswer = `$\\text{\\$} ${newBal}$`;
      rawDistractors = [`$\\text{\\$} ${Math.abs(newBal)}$`, `$\\text{\\$} ${newBal - 10}$`, `$\\text{\\$} 0$`];
      given = `Initial balance $\\text{\\$} ${bal}$, withdrawal $\\text{\\$} ${withdraw}$.`;
      required = `New balance.`;
      method = `$\\text{Balance} = ${bal} - ${withdraw} = ${newBal}$.`;
      steps = [`$${bal} - ${withdraw} = ${newBal}$.`];
      conclusion = `The account has an overdraft balance of $\\text{\\$} ${newBal}$.`;
      hint = `Subtract the larger withdrawal from the initial balance to get a negative amount.`;
    } else {
      // Multi-step signed integer expression
      const a = prng.int(5, 12);
      const b = prng.int(2, 5);
      const c = prng.int(2, 6);
      const ans = a - b * (-c);
      questionText = `Evaluate using order of operations: $$${a} - ${b} \\times (-${c})$$`;
      correctAnswer = `$${ans}$`;
      const badAns = a - b * c;
      rawDistractors = [`$${badAns}$`, `$${(a - b) * (-c)}$`, `$${ans - 2}$`];
      given = `Expression $${a} - ${b} \\times (-${c})$.`;
      required = `Evaluated integer.`;
      method = `Multiply first: $${b} \\times (-${c}) = -${b * c}$. Then subtract: $${a} - (-${b * c}) = ${a} + ${b * c} = ${ans}$.`;
      steps = [`$${b} \\times (-${c}) = -${b * c}$.`, `$${a} - (-${b * c}) = ${ans}$.`];
      conclusion = `The value is $${ans}$.`;
      hint = `Multiply first, and remember that subtracting a negative number becomes addition!`;
    }
  } else if (stageId === 13 || stageId === 14) {
    // Fractions & Fraction Operations (Subtopics 5-9)
    if (subtopicIndex === 5) {
      // Fraction division
      const a = prng.pick([1, 2, 3]);
      const b = prng.pick([4, 5, 7]);
      const c = prng.pick([2, 3]);
      const d = prng.pick([3, 5]);
      const num = a * d;
      const den = b * c;
      const g = gcd(num, den);
      const sNum = num / g;
      const sDen = den / g;
      questionText = `Divide the fractions: $$\\frac{${a}}{${b}} \\div \\frac{${c}}{${d}}$$`;
      correctAnswer = sDen === 1 ? `$${sNum}$` : `$\\frac{${sNum}}{${sDen}}$`;
      rawDistractors = [`$\\frac{${a * c}}{${b * d}}$`, `$\\frac{${b * c}}{${a * d}}$`, `$\\frac{${sNum + 1}}{${sDen}}$`];
      given = `Division $\\frac{${a}}{${b}} \\div \\frac{${c}}{${d}}$.`;
      required = `Simplified fraction.`;
      method = `Multiply by the reciprocal of the second fraction: $\\frac{${a}}{${b}} \\times \\frac{${d}}{${c}} = \\frac{${num}}{${den}} = \\frac{${sNum}}{${sDen}}$.`;
      steps = [`Reciprocal: $\\frac{${a}}{${b}} \\times \\frac{${d}}{${c}}$.`, `Simplify: $\\frac{${sNum}}{${sDen}}$.`];
      conclusion = `Result is ${correctAnswer}.`;
      hint = `Keep the first fraction, flip the second fraction, and multiply!`;
    } else if (subtopicIndex === 6) {
      // Mixed number addition
      const w1 = prng.int(1, 3);
      const w2 = prng.int(1, 4);
      const d = prng.pick([3, 4, 5]);
      const n1 = 1;
      const n2 = prng.int(1, d - 2);
      const totalW = w1 + w2;
      const totalN = n1 + n2;
      questionText = `Add the mixed numbers: $$${w1}\\frac{${n1}}{${d}} + ${w2}\\frac{${n2}}{${d}}$$`;
      correctAnswer = `$${totalW}\\frac{${totalN}}{${d}}$`;
      rawDistractors = [`$${totalW + 1}\\frac{${totalN}}{${d}}$`, `$${totalW}\\frac{${totalN + 1}}{${d}}$`, `$${totalW}\\frac{1}{${d}}$`];
      given = `Mixed numbers with common denominator $${d}$.`;
      required = `Combined sum.`;
      method = `Add whole parts ($${w1} + ${w2} = ${totalW}$) and fractional parts ($\\frac{${n1} + ${n2}}{${d}} = \\frac{${totalN}}{${d}}$).`;
      steps = [`Whole: $${totalW}$, Fractions: $\\frac{${totalN}}{${d}}$.`];
      conclusion = `$${totalW}\\frac{${totalN}}{${d}}$.`;
      hint = `Add the whole numbers together, then add the fractions together.`;
    } else if (subtopicIndex === 7) {
      // Fraction of a quantity word problem
      const den = prng.pick([3, 4, 5, 6]);
      const num = prng.int(1, den - 1);
      const k = prng.int(4, 12);
      const total = den * k;
      const ans = num * k;
      questionText = `A library has $${total}$ books. If $\\frac{${num}}{${den}}$ of the books are non-fiction, how many non-fiction books are there?`;
      correctAnswer = `$${ans}$`;
      rawDistractors = generateNumericalDistractors(ans, prng).map(d => `$${d}$`);
      given = `Total $${total}$, fraction $\\frac{${num}}{${den}}$.`;
      required = `Number of non-fiction books.`;
      method = `Divide total by denominator ($${total} \\div ${den} = ${k}$), then multiply by numerator ($${k} \\times ${num} = ${ans}$).`;
      steps = [`$${total} \\times \\frac{${num}}{${den}} = ${ans}$.`];
      conclusion = `There are $${ans}$ non-fiction books.`;
      hint = `Divide the total by the bottom number, then multiply by the top number.`;
    } else if (subtopicIndex === 8) {
      // Solve for unknown fraction x + a/b = c/b
      const b = prng.pick([5, 7, 8, 9]);
      const a = prng.int(1, 3);
      const c = prng.int(a + 2, b - 1);
      const ansNum = c - a;
      questionText = `Solve for $x$ in the fraction equation: $$x + \\frac{${a}}{${b}} = \\frac{${c}}{${b}}$$`;
      correctAnswer = `$\\frac{${ansNum}}{${b}}$`;
      rawDistractors = [`$\\frac{${c + a}}{${b}}$`, `$\\frac{${ansNum + 1}}{${b}}$`, `$\\frac{1}{${b}}$`];
      given = `Equation $x + \\frac{${a}}{${b}} = \\frac{${c}}{${b}}$.`;
      required = `Value of $x$.`;
      method = `Subtract $\\frac{${a}}{${b}}$ from both sides: $x = \\frac{${c} - ${a}}{${b}} = \\frac{${ansNum}}{${b}}$.`;
      steps = [`$x = \\frac{${c}}{${b}} - \\frac{${a}}{${b}} = \\frac{${ansNum}}{${b}}$.`];
      conclusion = `$x = \\frac{${ansNum}}{${b}}$.`;
      hint = `Subtract the fraction on the left from the fraction on the right.`;
    } else {
      // Comparing two fractions with cross-multiplication
      const a = prng.int(2, 4);
      const b = 5;
      const c = prng.int(3, 5);
      const d = 7;
      const leftCross = a * d;
      const rightCross = b * c;
      const sym = leftCross > rightCross ? '>' : leftCross < rightCross ? '<' : '=';
      questionText = `Compare the fractions using the correct symbol: $$\\frac{${a}}{${b}} \\quad \\mathbf{?} \\quad \\frac{${c}}{${d}}$$`;
      correctAnswer = `$\\frac{${a}}{${b}} ${sym} \\frac{${c}}{${d}}$`;
      rawDistractors = [
        `$\\frac{${a}}{${b}} ${sym === '>' ? '<' : '>'} \\frac{${c}}{${d}}$`,
        `$\\frac{${a}}{${b}} = \\frac{${c}}{${d}}$`,
        `$\\text{Cannot be compared}$`,
      ];
      given = `Fractions $\\frac{${a}}{${b}}$ and $\\frac{${c}}{${d}}$.`;
      required = `Inequality comparison.`;
      method = `Cross-multiply: $${a} \\times ${d} = ${leftCross}$ and $${b} \\times ${c} = ${rightCross}$. Since $${leftCross} ${sym} ${rightCross}$, $\\frac{${a}}{${b}} ${sym} \\frac{${c}}{${d}}$.`;
      steps = [`Cross products: $${leftCross}$ and $${rightCross}$.`];
      conclusion = `$\\frac{${a}}{${b}} ${sym} \\frac{${c}}{${d}}$.`;
      hint = `Cross-multiply the numerators and denominators to compare their values!`;
    }
  } else if (stageId >= 15 && stageId <= 20) {
    // Decimals, Percentages, Ratios & Rates (Subtopics 5-9)
    if (subtopicIndex === 5) {
      // Reverse percentage (original price before discount)
      const p = prng.pick([10, 20, 25, 50]);
      const orig = prng.int(40, 160) * 2;
      const sale = orig * (1 - p / 100);
      questionText = `An item is on sale for $\\text{\\$} ${sale}$ after a $${p}\\%$ discount. What was the original price?`;
      correctAnswer = `$\\text{\\$} ${orig}$`;
      rawDistractors = [`$\\text{\\$} ${sale + p}$`, `$\\text{\\$} ${orig + 20}$`, `$\\text{\\$} ${Math.round(sale * 1.1)}$`];
      given = `Sale price $\\text{\\$} ${sale}$, discount $${p}\\%$.`;
      required = `Original price.`;
      method = `Let $P$ be original price: $P \\times (1 - ${p / 100}) = ${sale} \\implies P = \\frac{${sale}}{${1 - p / 100}} = ${orig}$.`;
      steps = [`$P = ${sale} \\div ${(100 - p) / 100} = ${orig}$.`];
      conclusion = `Original price was $\\text{\\$} ${orig}$.`;
      hint = `The sale price represents $${100 - p}\\%$ of the original price. Divide by $${(100 - p) / 100}$.`;
    } else if (subtopicIndex === 6) {
      // Three-part ratio sharing: A : B : C
      const r1 = prng.int(1, 3);
      const r2 = prng.int(2, 4);
      const r3 = prng.int(3, 5);
      const sumR = r1 + r2 + r3;
      const unit = prng.int(5, 15);
      const total = sumR * unit;
      const ans = r2 * unit;
      questionText = `A prize of $\\text{\\$} ${total}$ is shared in the ratio $${r1} : ${r2} : ${r3}$. How much does the second person receive?`;
      correctAnswer = `$\\text{\\$} ${ans}$`;
      rawDistractors = [`$\\text{\\$} ${r1 * unit}$`, `$\\text{\\$} ${r3 * unit}$`, `$\\text{\\$} ${ans + 10}$`];
      given = `Total $\\text{\\$} ${total}$, ratio $${r1} : ${r2} : ${r3}$.`;
      required = `Second share.`;
      method = `Total parts $= ${r1} + ${r2} + ${r3} = ${sumR}$. One part $= \\frac{${total}}{${sumR}} = ${unit}$. Second share $= ${r2} \\times ${unit} = ${ans}$.`;
      steps = [`$1$ part $= \\text{\\$} ${unit}$.`, `$${r2}$ parts $= \\text{\\$} ${ans}$.`];
      conclusion = `The second person receives $\\text{\\$} ${ans}$.`;
      hint = `Add all the ratio parts together to find the value of one part.`;
    } else if (subtopicIndex === 7) {
      // Inverse proportion (workers and days)
      const w1 = prng.pick([3, 4, 6]);
      const d1 = prng.pick([6, 8, 12]);
      const totalManDays = w1 * d1;
      const w2 = prng.pick([2, 4, 8].filter(w => w !== w1 && totalManDays % w === 0));
      const ansDays = totalManDays / w2;
      questionText = `If $${w1}$ workers can complete a landscaping project in $${d1}$ days, how many days would $${w2}$ workers take working at the same pace?`;
      correctAnswer = `$${ansDays}\\text{ days}$`;
      rawDistractors = [`$${d1}\\text{ days}$`, `$${ansDays + 2}\\text{ days}$`, `$${Math.round((d1 * w2) / w1)}\\text{ days}$`];
      given = `$${w1}$ workers in $${d1}$ days.`;
      required = `Days for $${w2}$ workers.`;
      method = `Constant work in person-days: $W = ${w1} \\times ${d1} = ${totalManDays}$. Days for $${w2}$ workers: $\\frac{${totalManDays}}{${w2}} = ${ansDays}$.`;
      steps = [`Total worker-days: $${w1} \\times ${d1} = ${totalManDays}$.`, `Days: $${totalManDays} \\div ${w2} = ${ansDays}$.`];
      conclusion = `It will take $${ansDays}$ days.`;
      hint = `More workers take fewer days! Multiply initial workers by days, then divide by the new worker count.`;
    } else if (subtopicIndex === 8) {
      // Unit rate best value comparison
      const pack1Qty = 2;
      const pack1Price = prng.int(6, 10);
      const pack2Qty = 5;
      const pack2Price = pack1Price * 2 - 1; // cheaper per unit
      const unit1 = (pack1Price / pack1Qty).toFixed(2);
      const unit2 = (pack2Price / pack2Qty).toFixed(2);
      questionText = `Brand A sells $${pack1Qty}\\text{ kg}$ of rice for $\\text{\\$} ${pack1Price}$, while Brand B sells $${pack2Qty}\\text{ kg}$ for $\\text{\\$} ${pack2Price}$. Which brand offers the lower price per kilogram?`;
      correctAnswer = `$\\text{Brand B (\\$} ${unit2}/\\text{kg)}$`;
      rawDistractors = [
        `$\\text{Brand A (\\$} ${unit1}/\\text{kg)}$`,
        `$\\text{Both are identical in value}$`,
        `$\\text{Cannot be determined}$`,
      ];
      given = `Brand A: $${pack1Qty}\\text{ kg}$ for $\\text{\\$} ${pack1Price}$. Brand B: $${pack2Qty}\\text{ kg}$ for $\\text{\\$} ${pack2Price}$.`;
      required = `Best value per kg.`;
      method = `Compute unit price: Brand A $= \\frac{${pack1Price}}{${pack1Qty}} = \\text{\\$} ${unit1}/\\text{kg}$, Brand B $= \\frac{${pack2Price}}{${pack2Qty}} = \\text{\\$} ${unit2}/\\text{kg}$.`;
      steps = [`Brand A: $\\text{\\$} ${unit1}/\\text{kg}$. Brand B: $\\text{\\$} ${unit2}/\\text{kg}$.`];
      conclusion = `Brand B offers better value.`;
      hint = `Divide price by quantity for each brand to find the cost per kilogram.`;
    } else {
      // Percentage chain / compound change
      const pair = prng.pick([
        { up: 20, down: 10, net: 8, kind: 'increase', factor: '1.08' },
        { up: 10, down: 10, net: 1, kind: 'decrease', factor: '0.99' },
        { up: 25, down: 20, net: 0, kind: 'no_change', factor: '1.00' },
        { up: 50, down: 50, net: 25, kind: 'decrease', factor: '0.75' },
        { up: 30, down: 10, net: 17, kind: 'increase', factor: '1.17' },
        { up: 40, down: 20, net: 12, kind: 'increase', factor: '1.12' },
        { up: 20, down: 20, net: 4, kind: 'decrease', factor: '0.96' },
      ]);
      questionText = `A stock price increases by $${pair.up}\\%$ in year one, then decreases by $${pair.down}\\%$ in year two. What is the overall net percentage change from the initial price?`;
      correctAnswer = pair.kind === 'no_change' ? `$0\\% \\text{ (no change)}$` : `$${pair.net}\\% \\text{ net } ${pair.kind}$`;
      rawDistractors = [
        `$${pair.up - pair.down}\\% \\text{ net increase}$`,
        pair.kind === 'no_change' ? `$5\\% \\text{ net decrease}$` : `$${pair.net}\\% \\text{ net } ${pair.kind === 'increase' ? 'decrease' : 'increase'}$`,
        `$${pair.up + pair.down}\\% \\text{ net change}$`,
      ];
      given = `Successive changes $+${pair.up}\\%$, then $-${pair.down}\\%$.`;
      required = `Net percentage change.`;
      method = `Multiplier method: $(1 + ${pair.up / 100})(1 - ${pair.down / 100}) = ${pair.factor}$.`;
      steps = [`Multiplier: ${pair.factor}.`, `Net change: ${correctAnswer}.`];
      conclusion = `Overall net change is ${correctAnswer}.`;
      hint = `Multiply the growth factors together, do not simply add the percentages!`;
    }
  } else if (stageId >= 21 && stageId <= 30) {
    // Applied Mathematics, Kinematics & Finance (Subtopics 5-9)
    if (subtopicIndex === 5) {
      // Unit conversion km/h to m/s
      const kmh = prng.pick([36, 54, 72, 90, 108]);
      const ms = kmh / 3.6;
      questionText = `Convert a speed of $${kmh}\\text{ km/h}$ into meters per second ($\\text{m/s}$):`;
      correctAnswer = `$${ms}\\text{ m/s}$`;
      rawDistractors = [`$${kmh * 3.6}\\text{ m/s}$`, `$${ms + 5}\\text{ m/s}$`, `$${ms - 2}\\text{ m/s}$`];
      given = `Speed $${kmh}\\text{ km/h}$.`;
      required = `Equivalent speed in $\\text{m/s}$.`;
      method = `Multiply by $\\frac{1000}{3600} = \\frac{1}{3.6}$: $${kmh} \\div 3.6 = ${ms}\\text{ m/s}$.`;
      steps = [`$${kmh} \\times \\frac{5}{18} = ${ms}\\text{ m/s}$.`];
      conclusion = `$${kmh}\\text{ km/h} = ${ms}\\text{ m/s}$.`;
      hint = `Divide by 3.6 (or multiply by $\\frac{5}{18}$) to convert from km/h to m/s.`;
    } else if (subtopicIndex === 6) {
      // Kinematics: s = ut + 1/2 at^2
      const u = prng.int(2, 6);
      const a = prng.pick([2, 4]);
      const t = prng.int(3, 5);
      const s = u * t + 0.5 * a * t * t;
      questionText = `An object starts with velocity $u = ${u}\\text{ m/s}$ and accelerates at $a = ${a}\\text{ m/s}^2$ for $t = ${t}\\text{ s}$. Find displacement $s$:`;
      correctAnswer = `$${s}\\text{ m}$`;
      rawDistractors = generateNumericalDistractors(s, prng).map(d => `$${d}\\text{ m}$`);
      given = `$u = ${u}, a = ${a}, t = ${t}$.`;
      required = `Displacement $s$.`;
      method = `Kinematic equation: $s = ut + \\frac{1}{2}at^2 = (${u})(${t}) + \\frac{1}{2}(${a})(${t}^2) = ${u * t} + ${0.5 * a * t * t} = ${s}$.`;
      steps = [`$ut = ${u * t}$.`, `$\\frac{1}{2}at^2 = ${0.5 * a * t * t}$.`, `Sum $= ${s}\\text{ m}$.`];
      conclusion = `Displacement is $${s}\\text{ m}$.`;
      hint = `Use the kinematic formula $s = ut + \\frac{1}{2}at^2$.`;
    } else if (subtopicIndex === 7) {
      // Two vehicles meeting time (relative speed)
      const d = prng.pick([180, 240, 300]);
      const v1 = prng.pick([40, 50]);
      const v2 = prng.pick([50, 60]);
      const relSpeed = v1 + v2;
      const tHours = d / relSpeed;
      questionText = `Two cars $${d}\\text{ km}$ apart travel towards each other at constant speeds of $${v1}\\text{ km/h}$ and $${v2}\\text{ km/h}$. After how many hours will they meet?`;
      correctAnswer = `$${tHours}\\text{ hours}$`;
      rawDistractors = [`$${tHours + 1}\\text{ hours}$`, `$${tHours * 2}\\text{ hours}$`, `$${(d / v1).toFixed(1)}\\text{ hours}$`];
      given = `Distance $${d}\\text{ km}$, speeds $${v1}\\text{ km/h}$ and $${v2}\\text{ km/h}$.`;
      required = `Time until encounter.`;
      method = `Relative approaching speed $= ${v1} + ${v2} = ${relSpeed}\\text{ km/h}$. Time $t = \\frac{d}{v_{\\text{rel}}} = \\frac{${d}}{${relSpeed}} = ${tHours}\\text{ hours}$.`;
      steps = [`$v_{\\text{rel}} = ${relSpeed}\\text{ km/h}$.`, `$t = ${d} \\div ${relSpeed} = ${tHours}\\text{ h}$.`];
      conclusion = `They meet in $${tHours}$ hours.`;
      hint = `Add the two speeds together since they travel towards each other, then divide distance by this total speed.`;
    } else if (subtopicIndex === 8) {
      // Compound interest rule of 72 approximation
      const r = prng.pick([6, 8, 9, 12]);
      const doubleYears = 72 / r;
      questionText = `Using the Rule of 72, approximately how many years will it take for an investment to double at an annual compound interest rate of $${r}\\%$?`;
      correctAnswer = `$${doubleYears}\\text{ years}$`;
      rawDistractors = [`$${doubleYears + 3}\\text{ years}$`, `$${Math.round(100 / r)}\\text{ years}$`, `$${doubleYears - 2}\\text{ years}$`];
      given = `Annual compound rate $r = ${r}\\%$.`;
      required = `Doubling time in years.`;
      method = `Rule of 72 formula: $T \\approx \\frac{72}{r} = \\frac{72}{${r}} = ${doubleYears}\\text{ years}$.`;
      steps = [`$T \\approx 72 \\div ${r} = ${doubleYears}$.`];
      conclusion = `Approx. $${doubleYears}$ years.`;
      hint = `Divide 72 by the annual interest rate percentage.`;
    } else {
      // Mixture dilution word problem with rich randomization
      const vol = prng.pick([10, 15, 20, 25, 30, 40, 50]);
      const initialPct = prng.pick([20, 25, 30, 40, 50, 60]);
      const mult = prng.pick([1, 2, 3, 4]);
      const waterAdded = vol * mult;
      const totalVol = vol + waterAdded;
      const pureAcid = (vol * initialPct) / 100;
      const finalPct = Math.round((pureAcid / totalVol) * 100);
      questionText = `A chemist has $${vol}\\text{ L}$ of a $${initialPct}\\%$ acid solution. If $${waterAdded}\\text{ L}$ of pure water is added, what is the new acid concentration?`;
      correctAnswer = `$${finalPct}\\%$`;
      rawDistractors = [
        `$${Math.round(initialPct / 2)}\\%$`,
        `$${initialPct}\\%$`,
        `$${Math.max(5, finalPct + 5)}\\%$`
      ];
      given = `Initial $${vol}\\text{ L}$ at $${initialPct}\\%$, added $${waterAdded}\\text{ L}$ of water.`;
      required = `New acid concentration percentage.`;
      method = `Amount of pure solute $= ${vol} \\times \\frac{${initialPct}}{100} = ${pureAcid}\\text{ L}$. New total volume $= ${vol} + ${waterAdded} = ${totalVol}\\text{ L}$. New concentration $= \\frac{${pureAcid}}{${totalVol}} \\times 100\\% = ${finalPct}\\%$.`;
      steps = [`Solute: $${pureAcid}\\text{ L}$. Total volume: $${totalVol}\\text{ L}$.`, `$\\frac{${pureAcid}}{${totalVol}} \\times 100\\% = ${finalPct}\\%$.`];
      conclusion = `New concentration is $${finalPct}\\%$.`;
      hint = `Find the amount of pure acid first, then divide by the new total volume.`;
    }
  } else if (stageId >= 31 && stageId <= 40) {
    // Algebra, Quadratics & Systems (Subtopics 5-9)
    if (subtopicIndex === 5) {
      // Variables on both sides: ax + b = cx + d
      const a = prng.int(4, 7);
      const c = prng.int(2, a - 1);
      const x = prng.int(2, 6);
      const diffCoeff = a - c;
      const d = 20;
      const b = d - diffCoeff * x;
      questionText = `Solve the linear equation for $x$:\n\n$$${a}x ${b < 0 ? `- ${Math.abs(b)}` : `+ ${b}`} = ${c}x + ${d}$$`;
      correctAnswer = `$x = ${x}$`;
      rawDistractors = [`$x = ${x + 1}$`, `$x = ${x - 1}$`, `$x = ${-x}$`];
      given = `Equation $${a}x ${b < 0 ? `- ${Math.abs(b)}` : `+ ${b}`} = ${c}x + ${d}$.`;
      required = `Solution $x$.`;
      method = `Subtract $${c}x$ from both sides: $${diffCoeff}x = ${d - b} \\implies x = ${x}$.`;
      steps = [`$${diffCoeff}x = ${d - b}$.`, `$x = ${x}$.`];
      conclusion = `$x = ${x}$.`;
      hint = `Group $x$ terms on one side and constants on the other side.`;
    } else if (subtopicIndex === 6) {
      // Difference of squares factoring
      const k = prng.int(3, 9);
      const kSq = k * k;
      questionText = `Factor completely over the reals:\n\n$$x^2 - ${kSq}$$`;
      correctAnswer = `$(x - ${k})(x + ${k})$`;
      rawDistractors = [`$(x - ${k})^2$`, `$(x + ${k})^2$`, `$(x - ${kSq})(x + 1)$`];
      given = `Binomial $x^2 - ${kSq}$.`;
      required = `Factored form.`;
      method = `Difference of squares formula: $a^2 - b^2 = (a - b)(a + b)$ with $a = x, b = ${k}$.`;
      steps = [`$(x - ${k})(x + ${k})$.`];
      conclusion = `$(x - ${k})(x + ${k})$.`;
      hint = `Recognize the difference of squares: $a^2 - b^2 = (a-b)(a+b)$.`;
    } else if (subtopicIndex === 7) {
      // Sum of roots by Vieta's formulas
      const b = prng.int(3, 9) * (prng.next() > 0.5 ? 1 : -1);
      const c = prng.int(2, 10);
      const sum = -b;
      questionText = `Without solving the quadratic equation $x^2 ${b < 0 ? `- ${Math.abs(b)}` : `+ ${b}`}x + ${c} = 0$, what is the sum of its roots?`;
      correctAnswer = `$${sum}$`;
      rawDistractors = [`$${b}$`, `$${c}$`, `$${-c}$`];
      given = `Equation $x^2 ${b < 0 ? `- ${Math.abs(b)}` : `+ ${b}`}x + ${c} = 0$.`;
      required = `Sum of roots.`;
      method = `By Vieta's formula, the sum of roots for $ax^2 + bx + c = 0$ is $-\\frac{b}{a} = -(${b}) = ${sum}$.`;
      steps = [`Root sum $= -\\frac{b}{a} = ${sum}$.`];
      conclusion = `The sum of the roots is $${sum}$.`;
      hint = `Use Vieta's formula: the sum of the roots is $-b/a$.`;
    } else if (subtopicIndex === 8) {
      // Domain restriction of algebraic fraction
      const k = prng.int(2, 9);
      questionText = `For which real value of $x$ is the algebraic fraction undefined?\n\n$$\\frac{3x + 2}{x - ${k}}$$`;
      correctAnswer = `$x = ${k}$`;
      rawDistractors = [`$x = -${k}$`, `$x = 0$`, `$x = -\\frac{2}{3}$`];
      given = `Fraction $\\frac{3x + 2}{x - ${k}}$.`;
      required = `Value making denominator zero.`;
      method = `Division by zero is undefined: set denominator equal to zero: $x - ${k} = 0 \\implies x = ${k}$.`;
      steps = [`$x - ${k} = 0 \\implies x = ${k}$.`];
      conclusion = `Undefined when $x = ${k}$.`;
      hint = `A fraction is undefined whenever its denominator is equal to zero.`;
    } else {
      // Compound inequality
      const a = prng.int(2, 5);
      const minX = 1;
      const maxX = prng.int(4, 7);
      const low = a * minX + 3;
      const high = a * maxX + 3;
      questionText = `Solve the compound inequality for $x$:\n\n$$${low} < ${a}x + 3 \\le ${high}$$`;
      correctAnswer = `$${minX} < x \\le ${maxX}$`;
      rawDistractors = [
        `$${minX} \\le x < ${maxX}$`,
        `$${minX - 1} < x \\le ${maxX + 1}$`,
        `$x > ${minX}$`,
      ];
      given = `Compound inequality $${low} < ${a}x + 3 \\le ${high}$.`;
      required = `Solution interval.`;
      method = `Subtract $3$ across all parts: $${low - 3} < ${a}x \\le ${high - 3}$. Divide by $${a}$: $${minX} < x \\le ${maxX}$.`;
      steps = [`Subtract 3: $${low - 3} < ${a}x \\le ${high - 3}$.`, `Divide by $${a}$: $${minX} < x \\le ${maxX}$.`];
      conclusion = `$${minX} < x \\le ${maxX}$.`;
      hint = `Subtract 3 from all three sides, then divide all three sides by $${a}$.`;
    }
  } else if (stageId >= 41 && stageId <= 50) {
    // Geometry & Measurement (Subtopics 5-9)
    if (subtopicIndex === 5) {
      // Exterior angle of a regular polygon
      const n = prng.pick([5, 6, 8, 9, 10, 12]);
      const ext = 360 / n;
      questionText = `What is the measure of each exterior angle of a regular polygon with $${n}$ sides?`;
      correctAnswer = `$${ext}^\\circ$`;
      rawDistractors = generateNumericalDistractors(ext, prng).map(d => `$${d}^\\circ$`);
      given = `Regular $${n}$-sided polygon.`;
      required = `Exterior angle measure.`;
      method = `The sum of all exterior angles of any convex polygon is $360^\\circ$. For a regular polygon: $\\frac{360^\\circ}{n} = \\frac{360^\\circ}{${n}} = ${ext}^\\circ$.`;
      steps = [`$\\frac{360^\\circ}{${n}} = ${ext}^\\circ$.`];
      conclusion = `Each exterior angle is $${ext}^\\circ$.`;
      hint = `Divide 360 degrees by the number of sides.`;
    } else if (subtopicIndex === 6) {
      // Area of trapezoid
      const a = prng.int(4, 10);
      const b = a + prng.int(2, 6);
      const h = prng.pick([4, 6, 8]);
      const area = 0.5 * (a + b) * h;
      questionText = `Calculate the area of a trapezoid with parallel bases $a = ${a}\\text{ cm}$, $b = ${b}\\text{ cm}$, and height $h = ${h}\\text{ cm}$:`;
      correctAnswer = `$${area}\\text{ cm}^2$`;
      rawDistractors = generateNumericalDistractors(area, prng).map(d => `$${d}\\text{ cm}^2$`);
      given = `Bases $${a}$ and $${b}$, height $${h}$.`;
      required = `Trapezoid area.`;
      method = `Area formula: $A = \\frac{a + b}{2} \\times h = \\frac{${a} + ${b}}{2} \\times ${h} = ${area}\\text{ cm}^2$.`;
      steps = [`$\\frac{${a + b}}{2} \\times ${h} = ${area}$.`];
      conclusion = `Area is $${area}\\text{ cm}^2$.`;
      hint = `Average the two parallel bases, then multiply by the height.`;
    } else if (subtopicIndex === 7) {
      // Volume of cylinder
      const r = prng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const h = prng.int(3, 15);
      const coeff = r * r * h;
      questionText = `Find the exact volume of a cylinder with radius $r = ${r}\\text{ cm}$ and height $h = ${h}\\text{ cm}$ in terms of $\\pi$:`;
      correctAnswer = `$${coeff}\\pi\\text{ cm}^3$`;
      rawDistractors = [`$${r * h}\\pi\\text{ cm}^3$`, `$${2 * coeff}\\pi\\text{ cm}^3$`, `$${Math.round(coeff * 1.5)}\\pi\\text{ cm}^3$`];
      given = `Radius $r = ${r}$, height $h = ${h}$.`;
      required = `Volume in terms of $\\pi$.`;
      method = `Volume formula: $V = \\pi r^2 h = \\pi (${r})^2 (${h}) = ${coeff}\\pi\\text{ cm}^3$.`;
      steps = [`$r^2 = ${r * r}$.`, `$r^2 h = ${coeff}$.`, `$V = ${coeff}\\pi\\text{ cm}^3$.`];
      conclusion = `Volume is $${coeff}\\pi\\text{ cm}^3$.`;
      hint = `Use $V = \\pi r^2 h$. Square the radius, then multiply by the height!`;
    } else if (subtopicIndex === 8) {
      // Distance between two coordinate points
      const pythTriples = [
        { dx: 3, dy: 4, d: 5 },
        { dx: 4, dy: 3, d: 5 },
        { dx: 6, dy: 8, d: 10 },
        { dx: 8, dy: 6, d: 10 },
        { dx: 5, dy: 12, d: 13 },
        { dx: 12, dy: 5, d: 13 },
        { dx: 9, dy: 12, d: 15 },
        { dx: 12, dy: 9, d: 15 },
        { dx: 8, dy: 15, d: 17 },
        { dx: 15, dy: 8, d: 17 },
        { dx: 7, dy: 24, d: 25 },
        { dx: 24, dy: 7, d: 25 },
        { dx: 10, dy: 24, d: 26 },
        { dx: 20, dy: 21, d: 29 },
      ];
      const pt = prng.pick(pythTriples);
      const x1 = prng.int(-5, 5);
      const y1 = prng.int(-5, 5);
      const sgnX = prng.next() > 0.5 ? 1 : -1;
      const sgnY = prng.next() > 0.5 ? 1 : -1;
      const x2 = x1 + sgnX * pt.dx;
      const y2 = y1 + sgnY * pt.dy;
      const dist = pt.d;
      questionText = `Find the Euclidean distance between points $(${x1}, ${y1})$ and $(${x2}, ${y2})$:`;
      correctAnswer = `$${dist}$`;
      rawDistractors = [`$${pt.dx + pt.dy}$`, `$${dist + 2}$`, `$${Math.max(1, dist - 2)}$`];
      given = `Points $(${x1}, ${y1})$ and $(${x2}, ${y2})$.`;
      required = `Distance between points.`;
      method = `Distance formula: $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} = \\sqrt{(${pt.dx})^2 + (${pt.dy})^2} = ${dist}$.`;
      steps = [`$\\Delta x = |${x2} - (${x1})| = ${pt.dx}$, $\\Delta y = |${y2} - (${y1})| = ${pt.dy}$.`, `$\\sqrt{${pt.dx * pt.dx} + ${pt.dy * pt.dy}} = ${dist}$.`];
      conclusion = `Distance is $${dist}$.`;
      hint = `Use the Pythagorean distance formula $d = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$.`;
    } else {
      // Circle Theorems & Geometry Invariants
      const geomVariant = prng.pick(['semicircle', 'central_angle', 'cyclic_quad', 'tangent_radius', 'tangents_external']);
      if (geomVariant === 'semicircle') {
        questionText = `According to Thales's Circle Theorem, an angle subtended by the diameter of a circle at any point on its circumference is always:`;
        correctAnswer = `$90^\\circ \\text{ (a right angle)}$`;
        rawDistractors = [`$45^\\circ$`, `$60^\\circ$`, `$180^\\circ$`];
        given = `Angle inscribed in a semicircle.`;
        required = `Angle measure.`;
        method = `An inscribed angle is half of the $180^\\circ$ straight angle formed by the diameter: $\\frac{180^\\circ}{2} = 90^\\circ$.`;
        steps = [`$\\frac{180^\\circ}{2} = 90^\\circ$.`];
        conclusion = `The angle is always $90^\\circ$.`;
        hint = `Any angle inscribed in a semicircle is a right angle.`;
      } else if (geomVariant === 'central_angle') {
        const circumAngle = prng.pick([25, 30, 35, 40, 45, 50, 55, 60]);
        const centerAngle = circumAngle * 2;
        questionText = `In a circle with centre $O$, an arc subtends an angle of $${circumAngle}^\\circ$ at the circumference. What angle does this same arc subtend at the centre $O$?`;
        correctAnswer = `$${centerAngle}^\\circ$`;
        rawDistractors = [`$${circumAngle}^\\circ$`, `$${Math.round(circumAngle / 2)}^\\circ$`, `$${180 - circumAngle}^\\circ$`];
        given = `Inscribed angle $= ${circumAngle}^\\circ$.`;
        required = `Central angle on the same arc.`;
        method = `The angle subtended by an arc at the centre is twice the angle subtended by it at any point on the circumference: $\\theta_{\\text{centre}} = 2 \\times ${circumAngle}^\\circ = ${centerAngle}^\\circ$.`;
        steps = [`$2 \\times ${circumAngle}^\\circ = ${centerAngle}^\\circ$.`];
        conclusion = `The central angle is $${centerAngle}^\\circ$.`;
        hint = `The central angle is double the angle at the circumference.`;
      } else if (geomVariant === 'cyclic_quad') {
        const oppAngle = prng.pick([65, 70, 75, 80, 85, 95, 100, 110, 115, 120]);
        const targetAngle = 180 - oppAngle;
        questionText = `In a cyclic quadrilateral (a 4-sided polygon inscribed in a circle), one interior angle measures $${oppAngle}^\\circ$. What is the measure of the opposite interior angle?`;
        correctAnswer = `$${targetAngle}^\\circ$`;
        rawDistractors = [`$${oppAngle}^\\circ$`, `$${360 - oppAngle}^\\circ$`, `$90^\\circ$`];
        given = `Cyclic quadrilateral with one interior angle $${oppAngle}^\\circ$.`;
        required = `Opposite angle.`;
        method = `Opposite angles of a cyclic quadrilateral are supplementary (sum to $180^\\circ$): $180^\\circ - ${oppAngle}^\\circ = ${targetAngle}^\\circ$.`;
        steps = [`$180^\\circ - ${oppAngle}^\\circ = ${targetAngle}^\\circ$.`];
        conclusion = `The opposite angle is $${targetAngle}^\\circ$.`;
        hint = `Opposite angles of a cyclic quadrilateral always add up to $180^\\circ$.`;
      } else if (geomVariant === 'tangent_radius') {
        questionText = `What is the angle between a tangent to a circle and the radius drawn to the point of contact?`;
        correctAnswer = `$90^\\circ$`;
        rawDistractors = [`$45^\\circ$`, `$60^\\circ$`, `$180^\\circ$`];
        given = `Tangent line meeting radius at point of tangency.`;
        required = `Angle between tangent and radius.`;
        method = `A tangent to a circle is strictly perpendicular ($90^\\circ$) to the radius through the point of contact.`;
        steps = [`Perpendicular intersection $\\implies 90^\\circ$.`];
        conclusion = `The angle is $90^\\circ$.`;
        hint = `A tangent line always meets a circle's radius at a right angle.`;
      } else {
        const d = prng.pick([10, 13, 15, 17, 20]);
        questionText = `Two tangents are drawn to a circle from an external point $P$, touching the circle at points $A$ and $B$. If tangent segment $PA$ has length $${d}\\text{ cm}$, what is the length of tangent segment $PB$?`;
        correctAnswer = `$${d}\\text{ cm}$`;
        rawDistractors = [`$${d * 2}\\text{ cm}$`, `$${Math.round(d / 2)}\\text{ cm}$`, `$${d + 5}\\text{ cm}$`];
        given = `Tangents from external point $P$ to points of contact $A$ and $B$, $PA = ${d}\\text{ cm}$.`;
        required = `Length of tangent segment $PB$.`;
        method = `The lengths of two tangents drawn from an external point to a circle are equal: $PB = PA = ${d}\\text{ cm}$.`;
        steps = [`$PB = PA = ${d}\\text{ cm}$.`];
        conclusion = `Length of $PB$ is $${d}\\text{ cm}$.`;
        hint = `Tangents from the same external point to a circle are always equal in length.`;
      }
    }
  } else if (stageId >= 51 && stageId <= 60) {
    // Statistics & Probability (Subtopics 5-9)
    if (subtopicIndex === 5) {
      // Complementary probability
      const num = prng.int(1, 4);
      const den = prng.pick([5, 6, 8, 10]);
      const compNum = den - num;
      questionText = `If the probability of event $A$ occurring is $P(A) = \\frac{${num}}{${den}}$, what is the probability of the complement $P(A')$?`;
      correctAnswer = `$\\frac{${compNum}}{${den}}$`;
      rawDistractors = [`$\\frac{${num}}{${den}}$`, `$\\frac{1}{${den}}$`, `$1$`];
      given = `$P(A) = \\frac{${num}}{${den}}$.`;
      required = `$P(A')$.`;
      method = `Complement rule: $P(A') = 1 - P(A) = 1 - \\frac{${num}}{${den}} = \\frac{${compNum}}{${den}}$.`;
      steps = [`$1 - \\frac{${num}}{${den}} = \\frac{${compNum}}{${den}}$.`];
      conclusion = `$P(A') = \\frac{${compNum}}{${den}}$.`;
      hint = `Subtract the probability of the event from 1.`;
    } else if (subtopicIndex === 6) {
      // Independent events & probability rules
      const mode = prng.pick(['intersection', 'union', 'complement']);
      const pA = prng.pick([0.2, 0.3, 0.4, 0.5, 0.6]);
      const pB = prng.pick([0.2, 0.3, 0.4, 0.5]);
      if (mode === 'intersection') {
        const ans = Math.round(pA * pB * 100) / 100;
        questionText = `If $A$ and $B$ are two independent events with $P(A) = ${pA}$ and $P(B) = ${pB}$, what is $P(A \\cap B)$?`;
        correctAnswer = `$${ans.toFixed(2)}$`;
        rawDistractors = [`$${(pA + pB).toFixed(2)}$`, `$${Math.abs(pA - pB).toFixed(2)}$`, `$0$`];
        given = `Independent events $P(A) = ${pA}, P(B) = ${pB}$.`;
        required = `Intersection probability $P(A \\cap B)$.`;
        method = `For independent events: $P(A \\cap B) = P(A) \\times P(B) = ${pA} \\times ${pB} = ${ans.toFixed(2)}$.`;
        steps = [`$${pA} \\times ${pB} = ${ans.toFixed(2)}$.`];
        conclusion = `$P(A \\cap B) = ${ans.toFixed(2)}$.`;
        hint = `Multiply their individual probabilities together.`;
      } else if (mode === 'union') {
        const pInter = Math.round(pA * pB * 100) / 100;
        const ans = Math.round((pA + pB - pInter) * 100) / 100;
        questionText = `If $A$ and $B$ are independent events with $P(A) = ${pA}$ and $P(B) = ${pB}$, find $P(A \\cup B)$:`;
        correctAnswer = `$${ans.toFixed(2)}$`;
        rawDistractors = [`$${(pA + pB).toFixed(2)}$`, `$${pInter.toFixed(2)}$`, `$1.00$`];
        given = `Independent events $P(A) = ${pA}, P(B) = ${pB}$.`;
        required = `Union probability $P(A \\cup B)$.`;
        method = `$P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = ${pA} + ${pB} - ${pInter.toFixed(2)} = ${ans.toFixed(2)}$.`;
        steps = [`$P(A \\cap B) = ${pInter.toFixed(2)}$.`, `$${pA} + ${pB} - ${pInter.toFixed(2)} = ${ans.toFixed(2)}$.`];
        conclusion = `$P(A \\cup B) = ${ans.toFixed(2)}$.`;
        hint = `Add the probabilities and subtract the intersection ($P(A) \\times P(B)$).`;
      } else {
        const pInter = Math.round(pA * pB * 100) / 100;
        const ans = Math.round((1 - pInter) * 100) / 100;
        questionText = `If $A$ and $B$ are independent events with $P(A) = ${pA}$ and $P(B) = ${pB}$, find the probability that they do NOT both occur, $P((A \\cap B)')$:`;
        correctAnswer = `$${ans.toFixed(2)}$`;
        rawDistractors = [`$${pInter.toFixed(2)}$`, `$${(1 - pA).toFixed(2)}$`, `$${(1 - pB).toFixed(2)}$`];
        given = `Independent events $P(A) = ${pA}, P(B) = ${pB}$.`;
        required = `Complement of intersection $1 - P(A \\cap B)$.`;
        method = `$P((A \\cap B)') = 1 - P(A \\cap B) = 1 - (${pA} \\times ${pB}) = 1 - ${pInter.toFixed(2)} = ${ans.toFixed(2)}$.`;
        steps = [`$1 - ${pInter.toFixed(2)} = ${ans.toFixed(2)}$.`];
        conclusion = `$P((A \\cap B)') = ${ans.toFixed(2)}$.`;
        hint = `Find the probability both occur, then subtract from 1.`;
      }
    } else if (subtopicIndex === 7) {
      // Expected value & discrete distributions
      const expType = prng.pick(['fair_die', 'coin_tosses', 'game_payoff']);
      if (expType === 'fair_die') {
        const sides = prng.pick([4, 6, 8, 10, 12, 20]);
        const ev = (sides + 1) / 2;
        questionText = `What is the expected value $E(X)$ when rolling a single fair $${sides}$-sided die with faces numbered $1$ to $${sides}$?`;
        correctAnswer = `$${ev}$`;
        rawDistractors = [`$${sides / 2}$`, `$${Math.round(ev) + 1}$`, `$${Math.max(1, ev - 1.5)}$`];
        given = `Fair $${sides}$-sided die.`;
        required = `Expected value $E(X)$.`;
        method = `For consecutive integers from $1$ to $n$: $E(X) = \\frac{1 + n}{2} = \\frac{1 + ${sides}}{2} = ${ev}$.`;
        steps = [`$\\frac{1 + ${sides}}{2} = ${ev}$.`];
        conclusion = `Expected value is $${ev}$.`;
        hint = `Average the lowest and highest possible outcomes: $\\frac{1 + n}{2}$.`;
      } else if (expType === 'coin_tosses') {
        const nTosses = prng.pick([6, 8, 10, 12, 16, 20]);
        const ev = nTosses * 0.5;
        questionText = `A fair coin is flipped $${nTosses}$ times. What is the expected number of heads?`;
        correctAnswer = `$${ev}$`;
        rawDistractors = [`$${ev + 2}$`, `$${Math.max(1, ev - 2)}$`, `$${nTosses}$`];
        given = `Binomial trial: $n = ${nTosses}, p = 0.5$.`;
        required = `Expected count $E(X) = n \\times p$.`;
        method = `$E(X) = n \\cdot p = ${nTosses} \\times 0.5 = ${ev}$.`;
        steps = [`$${nTosses} \\times 0.5 = ${ev}$.`];
        conclusion = `Expected number of heads is $${ev}$.`;
        hint = `Multiply the number of coin flips by the probability of landing heads ($0.5$).`;
      } else {
        const prize = prng.pick([10, 20, 50, 100]);
        const winProb = prng.pick([0.1, 0.2, 0.25, 0.5]);
        const ev = Math.round(prize * winProb * 10) / 10;
        questionText = `In a carnival game, a player has a $${Math.round(winProb * 100)}\\%$ chance of winning $\\text{\\$} ${prize}$ and an otherwise $0$ payout. What is the expected payout per play?`;
        correctAnswer = `$\\text{\\$} ${ev}$`;
        rawDistractors = [`$\\text{\\$} ${prize}$`, `$\\text{\\$} ${ev + 5}$`, `$\\text{\\$} ${Math.max(1, Math.round(ev / 2))}$`];
        given = `Prize $\\text{\\$} ${prize}$ with probability $${winProb}$, else $0$.`;
        required = `Expected monetary value.`;
        method = `$E(X) = \\sum x_i P(x_i) = (${prize} \\times ${winProb}) + (0 \\times ${1 - winProb}) = \\text{\\$} ${ev}$.`;
        steps = [`$${prize} \\times ${winProb} = ${ev}$.`];
        conclusion = `Expected payout is $\\text{\\$} ${ev}$.`;
        hint = `Multiply each possible payout by its probability and sum them up.`;
      }
    } else if (subtopicIndex === 8) {
      // Normal Distribution Empirical Rule & Z-scores
      const empType = prng.pick(['one_sd', 'two_sd', 'three_sd', 'half_bell', 'practical']);
      if (empType === 'one_sd') {
        questionText = `According to the Empirical Rule for a normal distribution, approximately what percentage of data falls within one standard deviation of the mean ($\\mu \\pm 1\\sigma$)?`;
        correctAnswer = `$68\\%$`;
        rawDistractors = [`$95\\%$`, `$99.7\\%$`, `$50\\%$`];
        given = `Normal distribution bell curve within $\\pm 1\\sigma$.`;
        required = `Empirical percentage.`;
        method = `The 68-95-99.7 rule states that approximately $68\\%$ of values lie within one standard deviation of the mean.`;
        steps = [`$\\pm 1\\sigma \\implies \\approx 68\\%$.`];
        conclusion = `Approximately $68\\%$.`;
        hint = `Recall the famous empirical rule: 68% within 1 SD, 95% within 2 SD.`;
      } else if (empType === 'two_sd') {
        questionText = `According to the Empirical Rule for a normal distribution, approximately what percentage of data falls within two standard deviations of the mean ($\\mu \\pm 2\\sigma$)?`;
        correctAnswer = `$95\\%$`;
        rawDistractors = [`$68\\%$`, `$99.7\\%$`, `$90\\%$`];
        given = `Normal distribution bell curve within $\\pm 2\\sigma$.`;
        required = `Empirical percentage.`;
        method = `By the Empirical Rule, approximately $95\\%$ of values lie within two standard deviations of the mean.`;
        steps = [`$\\pm 2\\sigma \\implies \\approx 95\\%$.`];
        conclusion = `Approximately $95\\%$.`;
        hint = `Within two standard deviations covers about 95% of data.`;
      } else if (empType === 'three_sd') {
        questionText = `According to the Empirical Rule for a normal distribution, approximately what percentage of data falls within three standard deviations of the mean ($\\mu \\pm 3\\sigma$)?`;
        correctAnswer = `$99.7\\%$`;
        rawDistractors = [`$95\\%$`, `$68\\%$`, `$100\\%$`];
        given = `Normal distribution bell curve within $\\pm 3\\sigma$.`;
        required = `Empirical percentage.`;
        method = `By the Empirical Rule, approximately $99.7\\%$ of values lie within three standard deviations of the mean.`;
        steps = [`$\\pm 3\\sigma \\implies \\approx 99.7\\%$.`];
        conclusion = `Approximately $99.7\\%$.`;
        hint = `Three standard deviations captures almost all data: 99.7%.`;
      } else if (empType === 'half_bell') {
        questionText = `In a standard normal distribution, what percentage of data lies strictly between the mean $\\mu$ and one standard deviation above the mean ($\\mu$ to $\\mu + 1\\sigma$)?`;
        correctAnswer = `$34\\%$`;
        rawDistractors = [`$68\\%$`, `$50\\%$`, `$16\\%$`];
        given = `Symmetric half of the central $\\pm 1\\sigma$ interval.`;
        required = `Percentage between $\\mu$ and $\\mu + 1\\sigma$.`;
        method = `Since the bell curve is symmetric, half of the $68\\%$ within $\\pm 1\\sigma$ lies above the mean: $\\frac{68\\%}{2} = 34\\%$.`;
        steps = [`$\\frac{68\\%}{2} = 34\\%$.`];
        conclusion = `Approximately $34\\%$.`;
        hint = `The curve is symmetric: divide the 68% interval by 2.`;
      } else {
        const mean = prng.pick([500, 100, 70, 80]);
        const sd = prng.pick([10, 15, 20]);
        const low = mean - sd;
        const high = mean + sd;
        questionText = `Exam scores follow a normal distribution with mean $\\mu = ${mean}$ and standard deviation $\\sigma = ${sd}$. Approximately what percentage of students score between $${low}$ and $${high}$?`;
        correctAnswer = `$68\\%$`;
        rawDistractors = [`$95\\%$`, `$50\\%$`, `$34\\%$`];
        given = `Normal distribution with $\\mu = ${mean}, \\sigma = ${sd}$. Range $[${low}, ${high}] = [\\mu - \\sigma, \\mu + \\sigma]$.`;
        required = `Percentage in interval.`;
        method = `The interval $[${low}, ${high}]$ represents $\\mu \\pm 1\\sigma$. By the Empirical Rule, this contains approximately $68\\%$ of data.`;
        steps = [`$[${mean} - ${sd}, ${mean} + ${sd}] = \\mu \\pm 1\\sigma \\implies 68\\%$.`];
        conclusion = `Approximately $68\\%$.`;
        hint = `Check how many standard deviations $${low}$ and $${high}$ are from the mean.`;
      }
    } else {
      // Dynamic Median of datasets
      const nItems = prng.pick([5, 6, 7, 8]);
      const base = prng.int(3, 20);
      const step = prng.int(2, 5);
      const data: number[] = [];
      let cur = base;
      for (let i = 0; i < nItems; i++) {
        data.push(cur);
        cur += prng.int(1, step);
      }
      let median: number;
      if (nItems % 2 === 1) {
        median = data[Math.floor(nItems / 2)];
      } else {
        const m1 = data[nItems / 2 - 1];
        const m2 = data[nItems / 2];
        median = (m1 + m2) / 2;
      }
      questionText = `Find the median of the ordered dataset:\n\n$$\\{ ${data.join(', \\; ')} \\}$$`;
      correctAnswer = `$${median}$`;
      rawDistractors = [
        `$${median + 1}$`,
        `$${Math.max(1, median - 1)}$`,
        `$${data[0]}$`
      ];
      given = `Ordered dataset of $${nItems}$ values: $\\{ ${data.join(', ')} \\}$.`;
      required = `Median.`;
      if (nItems % 2 === 1) {
        method = `For an odd count ($n = ${nItems}$), the median is the exact middle value ($${Math.floor(nItems / 2) + 1}\\text{-th}$ item): $${median}$.`;
        steps = [`Middle element is $${median}$.`];
      } else {
        const m1 = data[nItems / 2 - 1];
        const m2 = data[nItems / 2];
        method = `For an even count ($n = ${nItems}$), average the two middle values ($${m1}$ and $${m2}$): $\\frac{${m1} + ${m2}}{2} = ${median}$.`;
        steps = [`$\\frac{${m1} + ${m2}}{2} = ${median}$.`];
      }
      conclusion = `The median is $${median}$.`;
      hint = nItems % 2 === 1 ? `Pick the exact middle number.` : `Average the two middle numbers.`;
    }
  } else if (stageId >= 61 && stageId <= 70) {
    // Functions, Graphs & Exponentials (Subtopics 5-9)
    if (subtopicIndex === 5) {
      // Composite function: g(f(x))
      const a = prng.int(2, 4);
      const xVal = prng.int(1, 3);
      const fx = a * xVal + 1;
      const gfx = fx * fx;
      questionText = `Given $f(x) = ${a}x + 1$ and $g(x) = x^2$, evaluate the composite function $g(f(${xVal}))$:`;
      correctAnswer = `$${gfx}$`;
      rawDistractors = generateNumericalDistractors(gfx, prng).map(d => `$${d}$`);
      given = `$f(x) = ${a}x + 1, g(x) = x^2, x = ${xVal}$.`;
      required = `$g(f(${xVal}))$.`;
      method = `Evaluate inside function first: $f(${xVal}) = ${a}(${xVal}) + 1 = ${fx}$. Then evaluate $g(${fx}) = (${fx})^2 = ${gfx}$.`;
      steps = [`$f(${xVal}) = ${fx}$.`, `$g(${fx}) = ${gfx}$.`];
      conclusion = `$g(f(${xVal})) = ${gfx}$.`;
      hint = `Work from the inside out: find $f(${xVal})$ first, then square that result.`;
    } else if (subtopicIndex === 6) {
      // Horizontal asymptote of exponential: y = a^x + c
      const c = prng.int(2, 8);
      questionText = `What is the horizontal asymptote of the exponential function: $$f(x) = 2^x + ${c}$$`;
      correctAnswer = `$y = ${c}$`;
      rawDistractors = [`$y = 0$`, `$y = -${c}$`, `$x = ${c}$`];
      given = `Function $f(x) = 2^x + ${c}$.`;
      required = `Horizontal asymptote.`;
      method = `As $x \\to -\\infty$, $2^x \\to 0$. Thus $\\lim_{x\\to-\\infty} f(x) = 0 + ${c} = ${c} \\implies y = ${c}$.`;
      steps = [`$2^x \\to 0 \\implies y \\to ${c}$.`];
      conclusion = `Horizontal asymptote is $y = ${c}$.`;
      hint = `As $x$ becomes a very large negative number, $2^x$ approaches 0.`;
    } else if (subtopicIndex === 7) {
      // Logarithm laws variation
      const logRuleKind = prng.pick(['product', 'quotient', 'power', 'eval']);
      if (logRuleKind === 'product') {
        const base = prng.pick([2, 3, 5, 10]);
        questionText = `By the logarithmic product rule, $\\log_{${base}}(x \\cdot y)$ expands to:`;
        correctAnswer = `$\\log_{${base}}(x) + \\log_{${base}}(y)$`;
        rawDistractors = [
          `$\\log_{${base}}(x) \\cdot \\log_{${base}}(y)$`,
          `$\\log_{${base}}(x + y)$`,
          `$\\frac{\\log_{${base}}(x)}{\\log_{${base}}(y)}$`,
        ];
        method = `The logarithm of a product is the sum of the logarithms: $\\log_b(xy) = \\log_b(x) + \\log_b(y)$.`;
      } else if (logRuleKind === 'quotient') {
        const base = prng.pick([2, 3, 5, 10]);
        questionText = `By the logarithmic quotient rule, $\\log_{${base}}\\left(\\frac{x}{y}\\right)$ expands to:`;
        correctAnswer = `$\\log_{${base}}(x) - \\log_{${base}}(y)$`;
        rawDistractors = [
          `$\\frac{\\log_{${base}}(x)}{\\log_{${base}}(y)}$`,
          `$\\log_{${base}}(x - y)$`,
          `$\\log_{${base}}(x) + \\log_{${base}}(y)$`,
        ];
        method = `The logarithm of a quotient is the difference of logarithms: $\\log_b(x/y) = \\log_b(x) - \\log_b(y)$.`;
      } else if (logRuleKind === 'power') {
        const k = prng.int(2, 6);
        questionText = `Simplify using the logarithmic power rule: $$\\log(x^{${k}})$$`;
        correctAnswer = `$${k}\\log(x)$`;
        rawDistractors = [`$\\log(${k}x)$`, `$(\\log x)^{${k}}$`, `$\\frac{\\log(x)}{${k}}$`];
        method = `The power rule of logarithms brings the exponent to the front: $\\log(x^k) = k \\log(x)$.`;
      } else {
        const b = prng.pick([2, 3, 5]);
        const p = prng.int(2, 4);
        const val = Math.pow(b, p);
        questionText = `Evaluate the logarithm: $$\\log_{${b}}(${val})$$`;
        correctAnswer = `$${p}$`;
        rawDistractors = [`$${p + 1}$`, `$${Math.max(1, p - 1)}$`, `$${b}$`];
        method = `Since $${b}^{${p}} = ${val}$, $\\log_{${b}}(${val}) = ${p}$.`;
      }
      given = `Logarithmic identity or evaluation.`;
      required = `Simplified expression.`;
      steps = [`${method}`];
      conclusion = `${correctAnswer}`;
      hint = `Recall the fundamental logarithm properties.`;
    } else if (subtopicIndex === 8) {
      // Function transformations variation
      const transType = prng.pick(['vert_reflect', 'horiz_reflect', 'vert_shift', 'horiz_shift']);
      if (transType === 'vert_reflect') {
        questionText = `The graph of $y = -f(x)$ is obtained by reflecting the graph of $y = f(x)$ across which axis?`;
        correctAnswer = `$\\text{The } x\\text{-axis}$`;
        rawDistractors = [`$\\text{The } y\\text{-axis}$`, `$\\text{The line } y = x$`, `$\\text{The origin}$`];
      } else if (transType === 'horiz_reflect') {
        questionText = `The graph of $y = f(-x)$ is obtained by reflecting the graph of $y = f(x)$ across which axis?`;
        correctAnswer = `$\\text{The } y\\text{-axis}$`;
        rawDistractors = [`$\\text{The } x\\text{-axis}$`, `$\\text{The line } y = x$`, `$\\text{The origin}$`];
      } else if (transType === 'vert_shift') {
        const c = prng.int(2, 9);
        const isUp = prng.next() > 0.5;
        questionText = `How is the graph of $y = f(x) ${isUp ? `+ ${c}` : `- ${c}`}$ obtained from the graph of $y = f(x)$?`;
        correctAnswer = isUp ? `$\\text{Shifted ${c} units upwards}$` : `$\\text{Shifted ${c} units downwards}$`;
        rawDistractors = [
          isUp ? `$\\text{Shifted ${c} units downwards}$` : `$\\text{Shifted ${c} units upwards}$`,
          `$\\text{Shifted ${c} units to the right}$`,
          `$\\text{Shifted ${c} units to the left}$`,
        ];
      } else {
        const c = prng.int(2, 9);
        const isRight = prng.next() > 0.5;
        questionText = `How is the graph of $y = f(x ${isRight ? `- ${c}` : `+ ${c}`})$ obtained from the graph of $y = f(x)$?`;
        correctAnswer = isRight ? `$\\text{Shifted ${c} units to the right}$` : `$\\text{Shifted ${c} units to the left}$`;
        rawDistractors = [
          isRight ? `$\\text{Shifted ${c} units to the left}$` : `$\\text{Shifted ${c} units to the right}$`,
          `$\\text{Shifted ${c} units upwards}$`,
          `$\\text{Shifted ${c} units downwards}$`,
        ];
      }
      given = `Function transformation rule.`;
      required = `Geometric description.`;
      method = `Examine sign and position of the modification to determine the direction of graph movement.`;
      steps = [`${correctAnswer}`];
      conclusion = `${correctAnswer}`;
      hint = `Changes outside $f(x)$ affect vertical output; changes inside affect horizontal input.`;
    } else {
      // Linear inverse variation
      const m = prng.pick([2, 3, 4, 5]);
      const b = prng.pick([-8, -6, -4, 4, 6, 8, 10]);
      questionText = `Find the inverse function $f^{-1}(x)$ for $f(x) = ${m}x ${b < 0 ? `- ${Math.abs(b)}` : `+ ${b}`}$:`;
      correctAnswer = b < 0 ? `$f^{-1}(x) = \\frac{x + ${Math.abs(b)}}{${m}}$` : `$f^{-1}(x) = \\frac{x - ${b}}{${m}}$`;
      rawDistractors = [
        b < 0 ? `$f^{-1}(x) = \\frac{x - ${Math.abs(b)}}{${m}}$` : `$f^{-1}(x) = \\frac{x + ${b}}{${m}}$`,
        `$f^{-1}(x) = ${m}x - ${b}$`,
        `$f^{-1}(x) = \\frac{1}{${m}x + ${b}}$`,
      ];
      given = `Linear function $f(x) = ${m}x + (${b})$.`;
      required = `Inverse function.`;
      method = `Swap $x$ and $y$ and solve for $y$: $x = ${m}y + (${b}) \\implies y = ${correctAnswer.slice(1, -1)}$.`;
      steps = [`$x = ${m}y + (${b}) \\implies y = ${correctAnswer.slice(1, -1)}$.`];
      conclusion = `${correctAnswer}`;
      hint = `Replace $f(x)$ with $y$, swap $x$ and $y$, then isolate $y$.`;
    }
  } else if (stageId >= 71 && stageId <= 80) {
    // Trigonometry, Sequences & Series (Subtopics 5-9)
    if (subtopicIndex === 5) {
      // Pythagorean trig identity variation
      const pairs = [
        { sin: '0.6', cos: '0.8', sSq: '0.36', cSq: '0.64' },
        { sin: '0.8', cos: '0.6', sSq: '0.64', cSq: '0.36' },
        { sin: '\\frac{5}{13}', cos: '\\frac{12}{13}', sSq: '\\frac{25}{169}', cSq: '\\frac{144}{169}' },
        { sin: '\\frac{12}{13}', cos: '\\frac{5}{13}', sSq: '\\frac{144}{169}', cSq: '\\frac{25}{169}' },
        { sin: '\\frac{8}{17}', cos: '\\frac{15}{17}', sSq: '\\frac{64}{289}', cSq: '\\frac{225}{289}' },
      ];
      const p = prng.pick(pairs);
      questionText = `If $\\sin(\\theta) = ${p.sin}$ for an acute angle $\\theta$, find $\\cos(\\theta)$ using the Pythagorean identity $\\sin^2(\\theta) + \\cos^2(\\theta) = 1$:`;
      correctAnswer = `$${p.cos}$`;
      rawDistractors = [`$${p.sin}$`, `$1.0$`, `$0.5$`];
      given = `$\\sin(\\theta) = ${p.sin}$.`;
      required = `$\\cos(\\theta)$.`;
      method = `$\\cos^2(\\theta) = 1 - \\sin^2(\\theta) = 1 - ${p.sSq} = ${p.cSq} \\implies \\cos(\\theta) = ${p.cos}$.`;
      steps = [`$\\cos(\\theta) = \\sqrt{1 - ${p.sSq}} = ${p.cos}$.`];
      conclusion = `$\\cos(\\theta) = ${p.cos}$.`;
      hint = `Use the identity $\\sin^2(\\theta) + \\cos^2(\\theta) = 1$.`;
    } else if (subtopicIndex === 6) {
      // Area of triangle using 1/2 a b sin(C) with varied angles
      const a = prng.pick([4, 6, 8, 10]);
      const b = prng.pick([5, 7, 9, 12]);
      const angleChoice = prng.pick([
        { deg: 30, sinVal: 0.5, sinStr: '\\frac{1}{2}' },
        { deg: 90, sinVal: 1, sinStr: '1' },
        { deg: 150, sinVal: 0.5, sinStr: '\\frac{1}{2}' },
      ]);
      const area = 0.5 * a * b * angleChoice.sinVal;
      questionText = `Find the area of a triangle with sides $a = ${a}\\text{ cm}$, $b = ${b}\\text{ cm}$, and included angle $C = ${angleChoice.deg}^\\circ$:`;
      correctAnswer = `$${area}\\text{ cm}^2$`;
      rawDistractors = generateNumericalDistractors(area, prng).map(d => `$${d}\\text{ cm}^2$`);
      given = `$a = ${a}, b = ${b}, C = ${angleChoice.deg}^\\circ$.`;
      required = `Triangle area.`;
      method = `$A = \\frac{1}{2}ab\\sin(C) = \\frac{1}{2}(${a})(${b})(${angleChoice.sinStr}) = ${area}\\text{ cm}^2$.`;
      steps = [`$\\sin(${angleChoice.deg}^\\circ) = ${angleChoice.sinStr}$.`, `$A = \\frac{1}{2} \\times ${a} \\times ${b} \\times ${angleChoice.sinStr} = ${area}$.`];
      conclusion = `Area is $${area}\\text{ cm}^2$.`;
      hint = `Use $A = \\frac{1}{2}ab\\sin(C)$.`;
    } else if (subtopicIndex === 7) {
      // Geometric sequence common ratio
      const a1 = prng.pick([2, 3, 4, 5]);
      const r = prng.pick([2, 3, 4, 5]);
      const seq = [a1, a1 * r, a1 * r * r, a1 * r * r * r];
      questionText = `Find the common ratio $r$ of the geometric sequence: $$${seq.join(', \\quad ')}, \\quad \\dots$$`;
      correctAnswer = `$${r}$`;
      rawDistractors = [`$${r + 1}$`, `$${Math.max(1, r - 1)}$`, `$${r * 2}$`];
      given = `Geometric sequence $${seq.join(', ')}$.`;
      required = `Common ratio $r$.`;
      method = `$r = \\frac{a_2}{a_1} = \\frac{${seq[1]}}{${seq[0]}} = ${r}$.`;
      steps = [`$r = ${seq[1]} \\div ${seq[0]} = ${r}$.`];
      conclusion = `The common ratio is $${r}$.`;
      hint = `Divide the second term by the first term.`;
    } else if (subtopicIndex === 8) {
      // Infinite geometric series sum
      const a = prng.pick([4, 6, 8, 9, 12, 15, 18]);
      const rPick = prng.pick([
        { rStr: '\\frac{1}{2}', rNum: 0.5 },
        { rStr: '\\frac{1}{3}', rNum: 1 / 3 },
        { rStr: '\\frac{1}{4}', rNum: 0.25 },
      ]);
      const sum = Math.round(a / (1 - rPick.rNum));
      questionText = `Find the sum of the infinite geometric series with first term $a = ${a}$ and common ratio $r = ${rPick.rStr}$:`;
      correctAnswer = `$${sum}$`;
      rawDistractors = generateNumericalDistractors(sum, prng).map(d => `$${d}$`);
      given = `$a = ${a}, r = ${rPick.rStr}$.`;
      required = `Infinite sum $S_\\infty$.`;
      method = `$S_\\infty = \\frac{a}{1 - r} = \\frac{${a}}{1 - ${rPick.rStr}} = ${sum}$.`;
      steps = [`$S_\\infty = \\frac{${a}}{1 - ${rPick.rStr}} = ${sum}$.`];
      conclusion = `The sum is $${sum}$.`;
      hint = `Use the infinite geometric series sum formula $S = \\frac{a}{1 - r}$.`;
    } else {
      // Radians to degrees conversion
      const radDegPairs = [
        { rad: '\\frac{\\pi}{6}', deg: 30 },
        { rad: '\\frac{\\pi}{4}', deg: 45 },
        { rad: '\\frac{\\pi}{3}', deg: 60 },
        { rad: '\\frac{\\pi}{2}', deg: 90 },
        { rad: '\\frac{2\\pi}{3}', deg: 120 },
        { rad: '\\frac{3\\pi}{4}', deg: 135 },
        { rad: '\\frac{5\\pi}{6}', deg: 150 },
        { rad: '\\pi', deg: 180 },
        { rad: '\\frac{3\\pi}{2}', deg: 270 },
      ];
      const conv = prng.pick(radDegPairs);
      questionText = `Convert $${conv.rad}\\text{ radians}$ into degrees:`;
      correctAnswer = `$${conv.deg}^\\circ$`;
      rawDistractors = [
        `$${conv.deg + 15}^\\circ$`,
        `$${Math.max(15, conv.deg - 15)}^\\circ$`,
        `$${conv.deg + 30}^\\circ$`,
      ];
      given = `Angle $${conv.rad}\\text{ rad}$.`;
      required = `Degrees.`;
      method = `Multiply by $\\frac{180^\\circ}{\\pi}$: $${conv.rad} \\times \\frac{180^\\circ}{\\pi} = ${conv.deg}^\\circ$.`;
      steps = [`$${conv.rad} \\times \\frac{180^\\circ}{\\pi} = ${conv.deg}^\\circ$.`];
      conclusion = `$${conv.deg}^\\circ$.`;
      hint = `Substitute $\\pi = 180^\\circ$ into the radian fraction.`;
    }
  } else if (stageId >= 81 && stageId <= 90) {
    // Higher Mathematics & Calculus (Subtopics 5-9)
    if (subtopicIndex === 5) {
      // Differentiation rules variation
      const ruleKind = prng.pick(['product', 'quotient', 'chain']);
      if (ruleKind === 'product') {
        questionText = `By the Product Rule of calculus, what is $\\frac{d}{dx}[u(x) \\cdot v(x)]$?`;
        correctAnswer = `$u'(x)v(x) + u(x)v'(x)$`;
        rawDistractors = [`$u'(x)v'(x)$`, `$u'(x)v(x) - u(x)v'(x)$`, `$\\frac{u'(x)}{v'(x)}$`];
        method = `Product Rule: $(uv)' = u'v + uv'$.`;
      } else if (ruleKind === 'quotient') {
        questionText = `By the Quotient Rule of calculus, what is $\\frac{d}{dx}\\left[\\frac{u(x)}{v(x)}\\right]$?`;
        correctAnswer = `$\\frac{u'(x)v(x) - u(x)v'(x)}{[v(x)]^2}$`;
        rawDistractors = [
          `$\\frac{u'(x)v(x) + u(x)v'(x)}{[v(x)]^2}$`,
          `$\\frac{u'(x)}{v'(x)}$`,
          `$\\frac{u'(x)v'(x)}{[v(x)]^2}$`,
        ];
        method = `Quotient Rule: $(u/v)' = \\frac{u'v - uv'}{v^2}$.`;
      } else {
        const n = prng.pick([3, 4, 5]);
        questionText = `By the Chain Rule, what is the derivative of $f(x) = [g(x)]^{${n}}$?`;
        correctAnswer = `$${n}[g(x)]^{${n - 1}} \\cdot g'(x)$`;
        rawDistractors = [
          `$${n}[g(x)]^{${n - 1}}$`,
          `$[g'(x)]^{${n}}$`,
          `$${n}g'(x)$`,
        ];
        method = `Chain Rule: $\\frac{d}{dx}[g^n] = n g^{n-1} g'$.`;
      }
      given = `Differentiation theorem.`;
      required = `Derivative formula.`;
      steps = [`${method}`];
      conclusion = `${correctAnswer}`;
      hint = `Recall the standard calculus rules for products, quotients, and composite functions.`;
    } else if (subtopicIndex === 6) {
      // Derivative of transcendental functions
      const funcChoice = prng.pick(['exp', 'sin', 'cos']);
      const k = prng.int(2, 6);
      if (funcChoice === 'exp') {
        questionText = `Find the derivative of the exponential function: $$f(x) = e^{${k}x}$$`;
        correctAnswer = `$${k}e^{${k}x}$`;
        rawDistractors = [`$e^{${k}x}$`, `$\\frac{1}{${k}}e^{${k}x}$`, `$${k}x e^{${k - 1}x}$`];
        method = `$\\frac{d}{dx}[e^{kx}] = k e^{kx}$.`;
      } else if (funcChoice === 'sin') {
        questionText = `Find the derivative of the trigonometric function: $$f(x) = \\sin(${k}x)$$`;
        correctAnswer = `$${k}\\cos(${k}x)$`;
        rawDistractors = [`$\\cos(${k}x)$`, `$-${k}\\cos(${k}x)$`, `$${k}\\sin(${k}x)$`];
        method = `$\\frac{d}{dx}[\\sin(kx)] = k \\cos(kx)$.`;
      } else {
        questionText = `Find the derivative of the trigonometric function: $$f(x) = \\cos(${k}x)$$`;
        correctAnswer = `$-${k}\\sin(${k}x)$`;
        rawDistractors = [`$${k}\\sin(${k}x)$`, `$-\\sin(${k}x)$`, `$-${k}\\cos(${k}x)$`];
        method = `$\\frac{d}{dx}[\\cos(kx)] = -k \\sin(kx)$.`;
      }
      given = `Function to differentiate.`;
      required = `First derivative.`;
      steps = [`${method}`];
      conclusion = `${correctAnswer}`;
      hint = `Use the chain rule, multiplying by the derivative of the inner term $${k}x$.`;
    } else if (subtopicIndex === 7) {
      // Standard integrals
      const intChoice = prng.pick(['inv', 'exp', 'cos']);
      if (intChoice === 'inv') {
        const a = prng.pick([1, 2, 3, 5]);
        questionText = `Evaluate the indefinite integral: $$\\int \\frac{${a}}{x} \\, dx \\quad (x > 0)$$`;
        correctAnswer = a === 1 ? `$\\ln(x) + C$` : `$${a}\\ln(x) + C$`;
        rawDistractors = [
          `$-\\frac{${a}}{x^2} + C$`,
          `$${a}e^x + C$`,
          `$\\frac{x^2}{2} + C$`,
        ];
        method = `$\\int \\frac{a}{x} dx = a \\ln|x| + C$.`;
      } else if (intChoice === 'exp') {
        const k = prng.int(2, 5);
        questionText = `Evaluate the indefinite integral: $$\\int e^{${k}x} \\, dx$$`;
        correctAnswer = `$\\frac{1}{${k}}e^{${k}x} + C$`;
        rawDistractors = [`$${k}e^{${k}x} + C$`, `$e^{${k}x} + C$`, `$\\frac{e^{${k}x + 1}}{${k}x + 1} + C$`];
        method = `$\\int e^{kx} dx = \\frac{1}{k}e^{kx} + C$.`;
      } else {
        const k = prng.int(2, 5);
        questionText = `Evaluate the indefinite integral: $$\\int \\cos(${k}x) \\, dx$$`;
        correctAnswer = `$\\frac{1}{${k}}\\sin(${k}x) + C$`;
        rawDistractors = [`$-\\frac{1}{${k}}\\sin(${k}x) + C$`, `$${k}\\sin(${k}x) + C$`, `$\\sin(${k}x) + C$`];
        method = `$\\int \\cos(kx) dx = \\frac{1}{k}\\sin(kx) + C$.`;
      }
      given = `Indefinite integral.`;
      required = `Antiderivative.`;
      steps = [`${method}`];
      conclusion = `${correctAnswer}`;
      hint = `Remember that integration is the reverse of differentiation; divide by the constant coefficient.`;
    } else if (subtopicIndex === 8) {
      // Magnitude of vector with random components
      const vx = prng.pick([3, 5, 6, 8, 9]);
      const vy = prng.pick([4, 12, 8, 6, 12]);
      const mag = Math.round(Math.hypot(vx, vy) * 10) / 10;
      questionText = `Find the magnitude of the vector $\\vec{v} = \\begin{pmatrix} ${vx} \\\\ ${vy} \\end{pmatrix}$:`;
      correctAnswer = `$${mag}$`;
      rawDistractors = generateNumericalDistractors(mag, prng).map(d => `$${d}$`);
      given = `Vector $\\vec{v} = (${vx}, ${vy})$.`;
      required = `Magnitude $|\\vec{v}|$.`;
      method = `$|\\vec{v}| = \\sqrt{${vx}^2 + ${vy}^2} = \\sqrt{${vx * vx + vy * vy}} = ${mag}$.`;
      steps = [`$|\\vec{v}| = \\sqrt{${vx * vx} + ${vy * vy}} = ${mag}$.`];
      conclusion = `Magnitude is $${mag}$.`;
      hint = `Use the Pythagorean magnitude formula $\\sqrt{v_x^2 + v_y^2}$.`;
    } else {
      // Matrix trace
      const a = prng.int(2, 7);
      const d = prng.int(3, 8);
      const b = prng.int(1, 5);
      const c = prng.int(1, 5);
      const tr = a + d;
      questionText = `What is the trace of the $2 \\times 2$ matrix $M = \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}$?`;
      correctAnswer = `$${tr}$`;
      rawDistractors = [`$${a * d - b * c}$`, `$${a + b}$`, `$${tr + 3}$`];
      given = `Matrix with diagonal entries $${a}$ and $${d}$.`;
      required = `Trace $\\text{tr}(M)$.`;
      method = `$\\text{tr}(M) = a_{11} + a_{22} = ${a} + ${d} = ${tr}$.`;
      steps = [`$\\text{tr}(M) = ${a} + ${d} = ${tr}$.`];
      conclusion = `Trace is $${tr}$.`;
      hint = `Sum the entries on the main diagonal.`;
    }
  } else {
    // Stage 91, 92, 96-99: Advanced Algebra & Modelling Synthesis (Subtopics 5-9)
    if (subtopicIndex === 5) {
      // Determinant of 2x2 matrix and invertibility
      const a = prng.int(2, 5);
      const d = prng.int(2, 5);
      const b = prng.int(1, 4);
      const c = prng.int(1, 4);
      const det = a * d - b * c;
      questionText = `Compute the determinant of the matrix $A = \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}$:`;
      correctAnswer = `$${det}$`;
      rawDistractors = generateNumericalDistractors(det, prng).map(x => `$${x}$`);
      given = `Matrix $A = \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}$.`;
      required = `Determinant $\\det(A)$.`;
      method = `$\\det(A) = ad - bc = (${a})(${d}) - (${b})(${c}) = ${a * d} - ${b * c} = ${det}$.`;
      steps = [`$\\det(A) = ${a * d} - ${b * c} = ${det}$.`];
      conclusion = `$\\det(A) = ${det}$.`;
      hint = `Multiply the main diagonal entries and subtract the off-diagonal product: $ad - bc$.`;
    } else if (subtopicIndex === 6) {
      // De Moivre's theorem
      const n = prng.pick([3, 4, 5, 6]);
      questionText = `By De Moivre's Theorem, for exponent $n = ${n}$, $(\\cos(\\theta) + i\\sin(\\theta))^{${n}}$ equals:`;
      correctAnswer = `$\\cos(${n}\\theta) + i\\sin(${n}\\theta)$`;
      rawDistractors = [
        `$\\cos^${n}(\\theta) + i\\sin^${n}(\\theta)$`,
        `$${n}\\cos(\\theta) + i${n}\\sin(\\theta)$`,
        `$\\cos(${n}\\theta) - i\\sin(${n}\\theta)$`,
      ];
      given = `Complex number in polar form with power $n = ${n}$.`;
      required = `De Moivre expanded form.`;
      method = `De Moivre's theorem states $(\\text{cis}(\\theta))^n = \\text{cis}(n\\theta)$. For $n = ${n}$, it equals $\\cos(${n}\\theta) + i\\sin(${n}\\theta)$.`;
      steps = [`$(\\cos\\theta + i\\sin\\theta)^{${n}} = \\cos(${n}\\theta) + i\\sin(${n}\\theta)$.`];
      conclusion = `$\\cos(${n}\\theta) + i\\sin(${n}\\theta)$.`;
      hint = `Powers on the outside multiply the angle inside: $n\\theta$.`;
    } else if (subtopicIndex === 7) {
      // Radioactive decay rate & half-life
      const decayList = [
        { isotope: 'Carbon-14', hl: 5730, unit: 'years' },
        { isotope: 'Cobalt-60', hl: 5, unit: 'years' },
        { isotope: 'Iodine-131', hl: 8, unit: 'days' },
        { isotope: 'Cesium-137', hl: 30, unit: 'years' },
      ];
      const iso = prng.pick(decayList);
      const halfLives = prng.pick([2, 3]);
      const initial = prng.pick([80, 100, 160, 200]);
      const finalAmt = initial / Math.pow(2, halfLives);
      const totalTime = iso.hl * halfLives;
      questionText = `A sample of $${iso.isotope}$ has a half-life of $${iso.hl}\\text{ ${iso.unit}}$. If an initial sample contains $${initial}\\text{ g}$, how much remains after $${totalTime}\\text{ ${iso.unit}}$?`;
      correctAnswer = `$${finalAmt}\\text{ g}$`;
      rawDistractors = [
        `$${finalAmt * 2}\\text{ g}$`,
        `$${finalAmt / 2}\\text{ g}$`,
        `$${initial / 2}\\text{ g}$`,
      ];
      given = `Initial $${initial}\\text{ g}$, half-life $${iso.hl}$, elapsed time $${totalTime}$.`;
      required = `Remaining mass.`;
      method = `Number of half-lives $= \\frac{${totalTime}}{${iso.hl}} = ${halfLives}$. Remaining mass $= ${initial} \\times (1/2)^{${halfLives}} = ${finalAmt}\\text{ g}$.`;
      steps = [`Half-lives: $${totalTime} \\div ${iso.hl} = ${halfLives}$.`, `$${initial} \\times \\left(\\frac{1}{2}\\right)^{${halfLives}} = ${finalAmt}\\text{ g}$.`];
      conclusion = `$${finalAmt}\\text{ g}$ remains.`;
      hint = `Calculate how many half-lives have passed and divide the initial mass by 2 that many times.`;
    } else if (subtopicIndex === 8) {
      // Bernoulli's Inequality
      const bType = prng.pick(['formula', 'numerical_bound']);
      if (bType === 'formula') {
        const n = prng.pick([3, 4, 5, 6, 7]);
        questionText = `For any real number $x > -1$ and integer $n = ${n}$, Bernoulli's Inequality guarantees that $(1 + x)^{${n}}$ is greater than or equal to:`;
        correctAnswer = `$1 + ${n}x$`;
        rawDistractors = [`$1 + ${n * n}x$`, `$${n} + x$`, `$(1 + x)^2$`];
        given = `Bernoulli's Inequality with power $n = ${n}$.`;
        required = `Linear lower bound.`;
        method = `Bernoulli's Inequality states: $(1 + x)^n \\ge 1 + nx$ for all $x > -1$. For $n = ${n}$, $(1 + x)^{${n}} \\ge 1 + ${n}x$.`;
        steps = [`$(1 + x)^{${n}} \\ge 1 + ${n}x$.`];
        conclusion = `$1 + ${n}x$.`;
        hint = `Drop higher order terms to get $1 + nx$.`;
      } else {
        const xPct = prng.pick([0.02, 0.03, 0.04, 0.05]);
        const nYears = prng.pick([10, 20, 25, 50]);
        const bound = (1 + nYears * xPct).toFixed(2);
        const baseStr = (1 + xPct).toFixed(2);
        questionText = `Using Bernoulli's inequality $(1 + x)^n \\ge 1 + nx$ with $x = ${xPct}$ and $n = ${nYears}$, what linear lower bound is placed on $(${baseStr})^{${nYears}}$?`;
        correctAnswer = `$${bound}$`;
        rawDistractors = [
          `$${(1 + (nYears - 5) * xPct).toFixed(2)}$`,
          `$${(1 + (nYears + 5) * xPct).toFixed(2)}$`,
          `$${(nYears * xPct).toFixed(2)}$`
        ];
        given = `$x = ${xPct}, n = ${nYears}$.`;
        required = `Lower bound $1 + nx$.`;
        method = `Bound $= 1 + (${nYears})(${xPct}) = 1 + ${nYears * xPct} = ${bound}$.`;
        steps = [`$1 + ${nYears} \\times ${xPct} = ${bound}$.`];
        conclusion = `The lower bound is $${bound}$.`;
        hint = `Evaluate $1 + n \\times x$.`;
      }
    } else {
      // AM-GM Inequality
      const amgmType = prng.pick(['statement_2', 'statement_3', 'min_reciprocal', 'max_product']);
      if (amgmType === 'statement_2') {
        questionText = `For positive real numbers $a, b > 0$, the Arithmetic Mean-Geometric Mean (AM-GM) Inequality states:`;
        correctAnswer = `$\\frac{a + b}{2} \\ge \\sqrt{ab}$`;
        rawDistractors = [`$\\frac{a + b}{2} \\le \\sqrt{ab}$`, `$\\frac{a + b}{2} = ab$`, `$a + b \\ge 2(ab)^2$`];
        given = `AM-GM Inequality for 2 positive numbers.`;
        required = `Inequality relation.`;
        method = `Arithmetic mean $\\ge$ geometric mean: $\\frac{a + b}{2} \\ge \\sqrt{ab}$.`;
        steps = [`$\\frac{a + b}{2} \\ge \\sqrt{ab}$.`];
        conclusion = `$\\frac{a + b}{2} \\ge \\sqrt{ab}$.`;
        hint = `The average is always greater than or equal to the square root of the product.`;
      } else if (amgmType === 'statement_3') {
        questionText = `For positive real numbers $a, b, c > 0$, the Arithmetic Mean-Geometric Mean (AM-GM) Inequality states:`;
        correctAnswer = `$\\frac{a + b + c}{3} \\ge \\sqrt[3]{abc}$`;
        rawDistractors = [
          `$\\frac{a + b + c}{3} \\le \\sqrt[3]{abc}$`,
          `$\\frac{a + b + c}{3} \\ge (abc)^3$`,
          `$a + b + c \\ge 3abc$`,
        ];
        given = `AM-GM Inequality for 3 positive numbers.`;
        required = `Inequality statement.`;
        method = `Arithmetic mean $\\ge$ geometric mean: $\\frac{a + b + c}{3} \\ge \\sqrt[3]{abc}$.`;
        steps = [`$\\frac{a + b + c}{3} \\ge \\sqrt[3]{abc}$.`];
        conclusion = `$\\frac{a + b + c}{3} \\ge \\sqrt[3]{abc}$.`;
        hint = `Average is greater than or equal to the cube root of the product.`;
      } else if (amgmType === 'min_reciprocal') {
        const k = prng.pick([4, 9, 16, 25, 36, 49, 64]);
        const sqrtK = Math.sqrt(k);
        const minVal = 2 * sqrtK;
        questionText = `By the AM-GM inequality, what is the minimum value of $f(x) = x + \\frac{${k}}{x}$ for all real $x > 0$?`;
        correctAnswer = `$${minVal}$`;
        rawDistractors = [`$${k}$`, `$${sqrtK}$`, `$${minVal + 2}$`];
        given = `Function $f(x) = x + \\frac{${k}}{x}$ for $x > 0$.`;
        required = `Minimum value.`;
        method = `By AM-GM: $\\frac{x + \\frac{${k}}{x}}{2} \\ge \\sqrt{x \\cdot \\frac{${k}}{x}} = \\sqrt{${k}} = ${sqrtK} \\implies x + \\frac{${k}}{x} \\ge 2(${sqrtK}) = ${minVal}$.`;
        steps = [`$\\frac{x + ${k}/x}{2} \\ge \\sqrt{${k}} = ${sqrtK}$.`, `$x + \\frac{${k}}{x} \\ge ${minVal}$.`];
        conclusion = `Minimum value is $${minVal}$.`;
        hint = `Apply $\\frac{a + b}{2} \\ge \\sqrt{ab}$ with $a = x$ and $b = \\frac{${k}}{x}$.`;
      } else {
        const sumVal = prng.pick([12, 16, 20, 24, 30]);
        const half = sumVal / 2;
        const maxProd = half * half;
        questionText = `If two positive numbers $x, y > 0$ have a fixed sum $x + y = ${sumVal}$, what is the maximum possible value of their product $xy$?`;
        correctAnswer = `$${maxProd}$`;
        rawDistractors = [`$${sumVal}$`, `$${maxProd - 5}$`, `$${sumVal * 2}$`];
        given = `$x + y = ${sumVal}$, $x, y > 0$.`;
        required = `Maximum product $xy$.`;
        method = `By AM-GM: $\\sqrt{xy} \\le \\frac{x + y}{2} = \\frac{${sumVal}}{2} = ${half} \\implies xy \\le (${half})^2 = ${maxProd}$, with equality when $x = y = ${half}$.`;
        steps = [`$xy \\le \\left(\\frac{${sumVal}}{2}\\right)^2 = ${half}^2 = ${maxProd}$.`];
        conclusion = `Maximum product is $${maxProd}$.`;
        hint = `The product is maximized when both numbers are equal to each other ($x = y$).`;
      }
    }
  }

  return {
    principle: `S${stageId}_T${subtopicIndex}`,
    questionText,
    correctAnswer,
    rawDistractors,
    given,
    required,
    method,
    steps,
    conclusion,
    hint,
    misconceptions,
  };
}
