import { GeneratorContext, GeneratedQuestionDraft, generateNumericalDistractors, generateSequenceDistractors, gcd, lcm } from './shared';

export function generateWorld1(ctx: GeneratorContext): GeneratedQuestionDraft {
  const { stageId, levelId, blockId, questionIndex, prng, tierMultiplier, tier } = ctx;
  const subtopicIndex = ctx.subtopicIndex !== undefined ? ctx.subtopicIndex : (questionIndex + (blockId * 3) + ((levelId - 1) % 4)) % 10;

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
  // STAGE 1: Numbers & Counting (10 Distinct Modalities)
  // ==========================================
  if (stageId === 1) {
    if (subtopicIndex === 0) {
      // 1. Forward Arithmetic Sequence
      const step = prng.pick([2, 3, 4, 5, 10]);
      const base = prng.pick([4, 6, 8, 11, 15, 20]) + (tierMultiplier - 1) * 10;
      const seq = [base, base + step, base + step * 2, base + step * 3];
      const target = base + step * 4;
      questionText = `Find the next number that completes this arithmetic sequence:\n\n$$${seq.join(', \\quad ')}, \\quad \\mathbf{?}$$`;
      correctAnswer = `$${target}$`;
      rawDistractors = generateSequenceDistractors(target, seq, step, prng);
      given = `Sequence: $${seq.join(', \\; ')}$.`;
      required = `Next consecutive term.`;
      method = `Common difference $d = ${seq[1]} - ${seq[0]} = ${step}$. Add $${step}$ to the last term.`;
      steps = [`$${seq[3]} + ${step} = ${target}$.`];
      conclusion = `The next number is $${target}$.`;
      hint = `Subtract consecutive terms to find the jump size, then add it to $${seq[3]}$.`;
    } else if (subtopicIndex === 1) {
      // 2. Decreasing Countdown Sequence
      const step = prng.pick([2, 3, 5, 10]);
      const top = prng.int(40, 90) + (tierMultiplier - 1) * 20;
      const seq = [top, top - step, top - step * 2, top - step * 3];
      const target = top - step * 4;
      questionText = `Find the next number in this decreasing countdown sequence:\n\n$$${seq.join(', \\quad ')}, \\quad \\mathbf{?}$$`;
      correctAnswer = `$${target}$`;
      rawDistractors = generateSequenceDistractors(target, seq, step, prng);
      given = `Decreasing sequence: $${seq.join(', \\; ')}$.`;
      required = `Next term.`;
      method = `Common difference is $-${step}$. Subtract $${step}$ from the last term.`;
      steps = [`$${seq[3]} - ${step} = ${target}$.`];
      conclusion = `The next number is $${target}$.`;
      hint = `The sequence decreases by $${step}$ at each step.`;
    } else if (subtopicIndex === 2) {
      // 3. Missing Middle Term
      const step = prng.pick([3, 4, 5, 6]);
      const base = prng.int(10, 50);
      const t1 = base;
      const t2 = base + step;
      const target = base + step * 2;
      const t4 = base + step * 3;
      const t5 = base + step * 4;
      questionText = `Determine the missing middle number in this sequence:\n\n$$${t1}, \\quad ${t2}, \\quad \\mathbf{?}, \\quad ${t4}, \\quad ${t5}$$`;
      correctAnswer = `$${target}$`;
      rawDistractors = generateSequenceDistractors(target, [t1, t2, t4, t5], step, prng);
      given = `Sequence with gap at term 3: $${t1}, ${t2}, [\\,?], ${t4}, ${t5}$.`;
      required = `The third term.`;
      method = `Step size is $${t2} - ${t1} = ${step}$. Add $${step}$ to the second term.`;
      steps = [`$${t2} + ${step} = ${target}$. Check: $${target} + ${step} = ${t4}$.`];
      conclusion = `The missing number is $${target}$.`;
      hint = `Find the common difference between adjacent terms and add it to $${t2}$.`;
    } else if (subtopicIndex === 3) {
      // 4. Expanded Base-10 to Integer
      const tens = prng.int(2, 9);
      const ones = prng.int(1, 9);
      const val = tens * 10 + ones;
      questionText = `Evaluate the expanded base-$10$ numerical expression:\n\n$$(${tens} \\times 10) + ${ones}$$`;
      correctAnswer = `$${val}$`;
      rawDistractors = [`$${tens * 100 + ones}$`, `$${ones * 10 + tens}$`, `$${tens + ones}$`];
      given = `Expression $(${tens} \\times 10) + ${ones}$.`;
      required = `Standard integer value.`;
      method = `Multiply tens by $10$ and add units.`;
      steps = [`$${tens} \\times 10 = ${tens * 10}$, and $${tens * 10} + ${ones} = ${val}$.`];
      conclusion = `The value is $${val}$.`;
      hint = `Calculate the multiplication first, then add the units digit.`;
    } else if (subtopicIndex === 4) {
      // 5. Decomposition into Base-10
      const tens = prng.int(3, 9);
      const ones = prng.int(1, 9);
      const val = tens * 10 + ones;
      questionText = `Which equation expresses the integer $${val}$ in standard expanded base-$10$ form?`;
      correctAnswer = `$${tens} \\times 10 + ${ones}$`;
      rawDistractors = [
        `$${tens} \\times 100 + ${ones}$`,
        `$${ones} \\times 10 + ${tens}$`,
        `$${tens} + ${ones}$`,
      ];
      given = `Integer $${val}$.`;
      required = `Base-$10$ expansion.`;
      method = `Tens digit has weight $10$, units digit has weight $1$.`;
      steps = [`$${tens}$ tens is $${tens} \\times 10$, plus $${ones}$ units.`];
      conclusion = `$${val} = ${tens} \\times 10 + ${ones}$.`;
      hint = `Separate the tens place from the units place.`;
    } else if (subtopicIndex === 5) {
      // 6. Successor / Predecessor
      const num = prng.int(20, 99) * tierMultiplier;
      const target = num + 1;
      questionText = `If $n = ${num}$, what is the value of the next consecutive integer $n + 1$?`;
      correctAnswer = `$${target}$`;
      rawDistractors = [`$${num - 1}$`, `$${num + 2}$`, `$${num + 10}$`];
      given = `Integer $n = ${num}$.`;
      required = `Consecutive successor $n + 1$.`;
      method = `Add $1$ to $n$.`;
      steps = [`$${num} + 1 = ${target}$.`];
      conclusion = `The consecutive integer is $${target}$.`;
      hint = `Consecutive integers differ by exactly $1$.`;
    } else if (subtopicIndex === 6) {
      // 7. Inequality Comparison
      const n1 = prng.int(30, 85);
      const diff = prng.pick([4, 7, 11, 15]);
      const n2 = n1 + diff;
      questionText = `Determine which inequality statement correctly compares $${n1}$ and $${n2}$:`;
      correctAnswer = `$${n2} > ${n1}$`;
      rawDistractors = [`$${n1} > ${n2}$`, `$${n2} < ${n1}$`, `$${n1} = ${n2}$`];
      given = `Numbers $${n1}$ and $${n2}$.`;
      required = `Valid inequality.`;
      method = `Compare numerical magnitudes: $${n2}$ is strictly greater than $${n1}$.`;
      steps = [`$${n2} - ${n1} = ${diff} > 0 \\implies ${n2} > ${n1}$.`];
      conclusion = `$${n2} > ${n1}$ is valid.`;
      hint = `The open side of the inequality symbol always faces the larger value.`;
    } else if (subtopicIndex === 7) {
      // 8. Ascending Order Set
      const a = prng.int(10, 30);
      const b = a + prng.int(4, 9);
      const c = b + prng.int(5, 11);
      const d = c + prng.int(6, 12);
      questionText = `Which expression arranges the set $\\{${a}, \\; ${c}, \\; ${b}, \\; ${d}\\}$ in strictly ascending order (from least to greatest)?`;
      correctAnswer = `$${a},\\; ${b},\\; ${c},\\; ${d}$`;
      rawDistractors = [
        `$${a},\\; ${c},\\; ${b},\\; ${d}$`,
        `$${d},\\; ${c},\\; ${b},\\; ${a}$`,
        `$${b},\\; ${a},\\; ${d},\\; ${c}$`,
      ];
      given = `Set $\\{${a}, ${c}, ${b}, ${d}\\}$.`;
      required = `Strict ascending order.`;
      method = `Sort values from smallest to largest: $${a} < ${b} < ${c} < ${d}$.`;
      steps = [`Smallest is $${a}$, followed by $${b}$, then $${c}$, and largest is $${d}$.`];
      conclusion = `$${a} < ${b} < ${c} < ${d}$.`;
      hint = `Find the smallest number first and order upwards.`;
    } else if (subtopicIndex === 8) {
      // 9. Applied Grouping / Counting Word Problem
      const groups = prng.int(4, 9);
      const groupSize = 10;
      const loose = prng.int(1, 8);
      const total = groups * groupSize + loose;
      questionText = `A school coordinator organizes $${groups}$ packages of $${groupSize}$ notebooks each, plus $${loose}$ loose notebooks. How many notebooks are there in total?`;
      correctAnswer = `$${total}$`;
      rawDistractors = generateNumericalDistractors(total, prng).map(d => `$${d}$`);
      given = `$${groups}$ packages of $${groupSize}$, plus $${loose}$ loose items.`;
      required = `Total notebook count.`;
      method = `Multiply packages by package size and add loose items: $(${groups} \\times ${groupSize}) + ${loose}$.`;
      steps = [`$${groups} \\times ${groupSize} = ${groups * groupSize}$, and $${groups * groupSize} + ${loose} = ${total}$.`];
      conclusion = `There are $${total}$ notebooks in total.`;
      hint = `Find the items in full packages first, then add the loose items.`;
    } else {
      // 10. Number Riddle
      const tens = prng.int(4, 7);
      const ones = tens + prng.pick([1, 2]);
      const ans = tens * 10 + ones;
      questionText = `I am a two-digit integer between $${tens * 10}$ and $${(tens + 1) * 10}$. My tens digit is $${tens}$, and my units digit is $${ones - tens}$ greater than my tens digit. What number am I?`;
      correctAnswer = `$${ans}$`;
      rawDistractors = [`$${tens * 10 + (ones - 1)}$`, `$${tens * 10 + tens}$`, `$${(tens + 1) * 10 + ones}$`];
      given = `Tens digit $${tens}$, units digit $${tens} + ${ones - tens} = ${ones}$.`;
      required = `Two-digit integer.`;
      method = `Combine tens and units: $(${tens} \\times 10) + ${ones} = ${ans}$.`;
      steps = [`Units digit: $${tens} + ${ones - tens} = ${ones}$. Number: $${tens}${ones} = ${ans}$.`];
      conclusion = `The number is $${ans}$.`;
      hint = `Determine the units digit by adding the difference to the tens digit.`;
    }
  }

  // ==========================================
  // STAGE 2: Place Value (10 Distinct Modalities)
  // ==========================================
  else if (stageId === 2) {
    const d3 = prng.int(2, 9);
    const d2 = prng.int(1, 9);
    const d1 = prng.int(1, 9);
    const d0 = prng.int(1, 9);
    const num = d3 * 1000 + d2 * 100 + d1 * 10 + d0;

    if (subtopicIndex === 0) {
      // 1. Value of Hundreds Digit
      const target = d2 * 100;
      questionText = `In the integer $${num.toLocaleString()}$, what is the numerical place value of the digit $${d2}$?`;
      correctAnswer = `$${target}$`;
      rawDistractors = [`$${d2}$`, `$${d2 * 10}$`, `$${d2 * 1000}$`];
      given = `Number $${num.toLocaleString()}$.`;
      required = `Place value of digit $${d2}$.`;
      method = `The digit $${d2}$ occupies the hundreds column ($10^2 = 100$). Value $= ${d2} \\times 100 = ${target}$.`;
      steps = [`$${d2} \\times 100 = ${target}$.`];
      conclusion = `The place value is $${target}$.`;
      hint = `Determine which column $${d2}$ is in (thousands, hundreds, tens, or units).`;
    } else if (subtopicIndex === 1) {
      // 2. Identify Column Digit
      questionText = `In the integer $${num.toLocaleString()}$, which digit occupies the tens place?`;
      correctAnswer = `$${d1}$`;
      rawDistractors = [`$${d3}$`, `$${d2}$`, `$${d0}$`];
      given = `Number $${num.toLocaleString()}$.`;
      required = `Digit in the tens place.`;
      method = `The tens place is the second column from the right ($10^1$).`;
      steps = [`Units column: $${d0}$, Tens column: $${d1}$.`];
      conclusion = `The digit in the tens place is $${d1}$.`;
      hint = `Count from right to left: units, tens, hundreds, thousands.`;
    } else if (subtopicIndex === 2) {
      // 3. Expanded Sum to Standard Number
      questionText = `What standard integer is formed by the expanded sum:\n\n$$${d3 * 1000} + ${d2 * 100} + ${d1 * 10} + ${d0}$$`;
      correctAnswer = `$${num.toLocaleString()}$`;
      rawDistractors = [
        `$${(d3 * 1000 + d1 * 100 + d2 * 10 + d0).toLocaleString()}$`,
        `$${(d2 * 1000 + d3 * 100 + d1 * 10 + d0).toLocaleString()}$`,
        `$${(num + 10).toLocaleString()}$`,
      ];
      given = `Expanded sum $${d3 * 1000} + ${d2 * 100} + ${d1 * 10} + ${d0}$.`;
      required = `Standard integer.`;
      method = `Combine place value components into standard positional notation.`;
      steps = [`Thousands: $${d3}$, Hundreds: $${d2}$, Tens: $${d1}$, Units: $${d0} \\implies ${num}$.`];
      conclusion = `The standard integer is $${num.toLocaleString()}$.`;
      hint = `Combine the digits according to their positional values.`;
    } else if (subtopicIndex === 3) {
      // 4. Relative Place Value Multiplier
      questionText = `How many times greater is the place value of the thousands digit ($${d3}$) than if it were in the tens place?`;
      correctAnswer = `$100\\text{ times}$`;
      rawDistractors = [`$10\\text{ times}$`, `$1000\\text{ times}$`, `$20\\text{ times}$`];
      given = `Thousands place ($1000$) versus tens place ($10$).`;
      required = `Relative ratio.`;
      method = `Divide the place weights: $\\frac{1000}{10} = 100$.`;
      steps = [`$\\frac{1000}{10} = 100$.`];
      conclusion = `It is $100$ times greater.`;
      hint = `Each step to the left on the place-value chart multiplies the value by $10$. Moving two steps multiplies by $100$.`;
    } else if (subtopicIndex === 4) {
      // 5. Missing Term in Place Value Equation
      questionText = `Find the missing value in this place-value equation:\n\n$$${d3 * 1000} + \\mathbf{?} + ${d1 * 10} + ${d0} = ${num.toLocaleString()}$$`;
      correctAnswer = `$${d2 * 100}$`;
      rawDistractors = [`$${d2 * 10}$`, `$${d2 * 1000}$`, `$${d2}$`];
      given = `Equation $${d3 * 1000} + [\\,?] + ${d1 * 10} + ${d0} = ${num}$.`;
      required = `Missing hundreds component.`;
      method = `Subtract the known parts from the total: $${num} - (${d3 * 1000} + ${d1 * 10} + ${d0}) = ${d2 * 100}$.`;
      steps = [`Missing term is the hundreds place: $${d2} \\times 100 = ${d2 * 100}$.`];
      conclusion = `The missing value is $${d2 * 100}$.`;
      hint = `Identify which place value column is missing from the addition expression.`;
    } else if (subtopicIndex === 5) {
      // 6. Word Form to Standard Form
      const thNames: Record<number, string> = { 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine' };
      const hNames: Record<number, string> = { 1: 'one hundred', 2: 'two hundred', 3: 'three hundred', 4: 'four hundred', 5: 'five hundred', 6: 'six hundred', 7: 'seven hundred', 8: 'eight hundred', 9: 'nine hundred' };
      const wordText = `${thNames[d3]} thousand, ${hNames[d2]} and fifty-four`;
      const ansVal = d3 * 1000 + d2 * 100 + 54;
      questionText = `Which number represents "${wordText}" in standard form?`;
      correctAnswer = `$${ansVal.toLocaleString()}$`;
      rawDistractors = [
        `$${(d3 * 100 + d2 * 10 + 54).toLocaleString()}$`,
        `$${(d3 * 10000 + d2 * 100 + 54).toLocaleString()}$`,
        `$${(ansVal + 100).toLocaleString()}$`,
      ];
      given = `Written name "${wordText}".`;
      required = `Standard numerical representation.`;
      method = `Translate thousands, hundreds, tens, and units into digits.`;
      steps = [`$${d3}$ in thousands, $${d2}$ in hundreds, $5$ in tens, $4$ in units $\\implies ${ansVal}$.`];
      conclusion = `The number is $${ansVal.toLocaleString()}$.`;
      hint = `Write the thousands digit first, then hundreds, tens, and units.`;
    } else if (subtopicIndex === 6) {
      // 7. Currency Place Value Context
      const thousandsBills = d3;
      const hundredsBills = d2;
      const tensBills = d1;
      const totalCash = thousandsBills * 1000 + hundredsBills * 100 + tensBills * 10;
      questionText = `A bank vault contains $${thousandsBills}$ bundles of $\\text{\\$} 1000$, $${hundredsBills}$ bundles of $\\text{\\$} 100$, and $${tensBills}$ notes of $\\text{\\$} 10$. What is the total cash value?`;
      correctAnswer = `$\\text{\\$} ${totalCash.toLocaleString()}$`;
      rawDistractors = [
        `$\\text{\\$} ${(totalCash + 100).toLocaleString()}$`,
        `$\\text{\\$} ${(totalCash - 100).toLocaleString()}$`,
        `$\\text{\\$} ${(thousandsBills * 100 + hundredsBills * 10 + tensBills).toLocaleString()}$`,
      ];
      given = `$${thousandsBills} \\times 1000$, $${hundredsBills} \\times 100$, $${tensBills} \\times 10$.`;
      required = `Total cash sum.`;
      method = `Compute each currency denomination and sum.`;
      steps = [
        `$${thousandsBills} \\times 1000 = ${thousandsBills * 1000}$, $${hundredsBills} \\times 100 = ${hundredsBills * 100}$, $${tensBills} \\times 10 = ${tensBills * 10}$.`,
        `Total: $${thousandsBills * 1000} + ${hundredsBills * 100} + ${tensBills * 10} = ${totalCash}$.`,
      ];
      conclusion = `Total cash is $\\text{\\$} ${totalCash.toLocaleString()}$.`;
      hint = `Multiply each bundle count by its bill value and add them together.`;
    } else if (subtopicIndex === 7) {
      // 8. Regrouping Place Values
      const hCount = prng.int(15, 35);
      const tensCount = prng.int(4, 9);
      const totalVal = hCount * 100 + tensCount * 10;
      questionText = `What integer is equivalent to $${hCount}$ hundreds and $${tensCount}$ tens?`;
      correctAnswer = `$${totalVal.toLocaleString()}$`;
      rawDistractors = [
        `$${(hCount * 10 + tensCount).toLocaleString()}$`,
        `$${(totalVal + 100).toLocaleString()}$`,
        `$${(hCount * 1000 + tensCount * 10).toLocaleString()}$`,
      ];
      given = `$${hCount}$ hundreds ($${hCount} \\times 100$) and $${tensCount}$ tens ($${tensCount} \\times 10$).`;
      required = `Equivalent integer.`;
      method = `Multiply: $${hCount} \\times 100 = ${hCount * 100}$, $${tensCount} \\times 10 = ${tensCount * 10}$, then sum.`;
      steps = [`$${hCount * 100} + ${tensCount * 10} = ${totalVal}$.`];
      conclusion = `The integer is $${totalVal.toLocaleString()}$.`;
      hint = `Remember that $10$ hundreds equal $1,000$. Multiply $${hCount} \\times 100$.`;
    } else if (subtopicIndex === 8) {
      // 9. Digit Swap Effect
      const original = d3 * 1000 + d2 * 100 + d1 * 10 + d0;
      const swapped = d2 * 1000 + d3 * 100 + d1 * 10 + d0;
      questionText = `In the integer $${original.toLocaleString()}$, if the thousands digit ($${d3}$) and the hundreds digit ($${d2}$) are swapped, what is the new number?`;
      correctAnswer = `$${swapped.toLocaleString()}$`;
      rawDistractors = [
        `$${(d3 * 1000 + d1 * 100 + d2 * 10 + d0).toLocaleString()}$`,
        `$${(d0 * 1000 + d2 * 100 + d1 * 10 + d3).toLocaleString()}$`,
        `$${(original + 1000).toLocaleString()}$`,
      ];
      given = `Number $${original.toLocaleString()}$ with thousands digit $${d3}$ and hundreds digit $${d2}$.`;
      required = `Number after swapping thousands and hundreds digits.`;
      method = `Replace thousands place with $${d2}$ and hundreds place with $${d3}$.`;
      steps = [`New number has $${d2}$ thousands and $${d3}$ hundreds $\\implies ${swapped}$.`];
      conclusion = `The new number is $${swapped.toLocaleString()}$.`;
      hint = `Exchange the positions of $${d3}$ and $${d2}$ while keeping the tens and units unchanged.`;
    } else {
      // 10. Place Value Digit Sum Riddle
      const th = prng.int(3, 6);
      const tens = prng.int(2, 5);
      const units = prng.int(1, 4);
      const targetH = prng.int(2, 7);
      const sumDigits = th + targetH + tens + units;
      questionText = `A four-digit integer has a thousands digit of $${th}$, tens digit of $${tens}$, and units digit of $${units}$. If the sum of all four digits is $${sumDigits}$, what is the hundreds digit?`;
      correctAnswer = `$${targetH}$`;
      rawDistractors = generateNumericalDistractors(targetH, prng).map(d => `$${d}$`);
      given = `Thousands: $${th}$, Tens: $${tens}$, Units: $${units}$, Digit sum: $${sumDigits}$.`;
      required = `Hundreds digit $h$.`;
      method = `Set up equation: $${th} + h + ${tens} + ${units} = ${sumDigits} \\implies h = ${sumDigits} - ${th + tens + units}$.`;
      steps = [`$h = ${sumDigits} - ${th + tens + units} = ${targetH}$.`];
      conclusion = `The hundreds digit is $${targetH}$.`;
      hint = `Add the three known digits together, then subtract that sum from the total digit sum ($${sumDigits}$).`;
    }
  }

  // ==========================================
  // STAGE 3: Addition (10 Distinct Modalities)
  // ==========================================
  else if (stageId === 3) {
    const a = prng.int(25, 120) * tierMultiplier;
    const b = prng.int(18, 95) * tierMultiplier;
    const sum = a + b;

    if (subtopicIndex === 0) {
      // 1. Direct Column Addition
      questionText = `Calculate the sum: $$${a} + ${b}$$`;
      correctAnswer = `$${sum}$`;
      rawDistractors = generateNumericalDistractors(sum, prng).map(d => `$${d}$`);
      given = `Addends $${a}$ and $${b}$.`;
      required = `Sum $${a} + ${b}$.`;
      method = `Perform standard column addition with place-value carrying.`;
      steps = [`$${a} + ${b} = ${sum}$.`];
      conclusion = `The sum is $${sum}$.`;
      hint = `Add units first, then carry to the tens column.`;
    } else if (subtopicIndex === 1) {
      // 2. Missing Second Addend
      questionText = `Find the missing value $x$ in the equation: $$${a} + x = ${sum}$$`;
      correctAnswer = `$${b}$`;
      rawDistractors = generateNumericalDistractors(b, prng).map(d => `$${d}$`);
      given = `Equation $${a} + x = ${sum}$.`;
      required = `Value of $x$.`;
      method = `Subtract $${a}$ from both sides: $x = ${sum} - ${a}$.`;
      steps = [`$x = ${sum} - ${a} = ${b}$.`];
      conclusion = `$x = ${b}$.`;
      hint = `Subtract the known addend from the total sum.`;
    } else if (subtopicIndex === 2) {
      // 3. Missing First Addend
      questionText = `Solve for $x$: $$x + ${b} = ${sum}$$`;
      correctAnswer = `$${a}$`;
      rawDistractors = generateNumericalDistractors(a, prng).map(d => `$${d}$`);
      given = `Equation $x + ${b} = ${sum}$.`;
      required = `Value of $x$.`;
      method = `Subtract $${b}$ from both sides: $x = ${sum} - ${b}$.`;
      steps = [`$x = ${sum} - ${b} = ${a}$.`];
      conclusion = `$x = ${a}$.`;
      hint = `Inverse operation: subtract $${b}$ from $${sum}$.`;
    } else if (subtopicIndex === 3) {
      // 4. Three-Term Addition
      const c = prng.int(10, 40) * tierMultiplier;
      const total3 = a + b + c;
      questionText = `Compute the three-term sum: $$${a} + ${b} + ${c}$$`;
      correctAnswer = `$${total3}$`;
      rawDistractors = generateNumericalDistractors(total3, prng).map(d => `$${d}$`);
      given = `Three addends: $${a}$, $${b}$, and $${c}$.`;
      required = `Combined sum.`;
      method = `Group terms: $( ${a} + ${b} ) + ${c} = ${a + b} + ${c} = ${total3}$.`;
      steps = [`$${a} + ${b} = ${a + b}$, and $${a + b} + ${c} = ${total3}$.`];
      conclusion = `The total sum is $${total3}$.`;
      hint = `Add the first two numbers together, then add the third number.`;
    } else if (subtopicIndex === 4) {
      // 5. Applied Context Word Problem
      questionText = `A school library acquired $${a}$ science books and $${b}$ literature books. How many books were acquired in total?`;
      correctAnswer = `$${sum}\\text{ books}$`;
      rawDistractors = generateNumericalDistractors(sum, prng).map(d => `$${d}\\text{ books}$`);
      given = `$${a}$ science books, $${b}$ literature books.`;
      required = `Total books.`;
      method = `Combine the two book quantities: $${a} + ${b} = ${sum}$.`;
      steps = [`$${a} + ${b} = ${sum}$.`];
      conclusion = `There are $${sum}$ books in total.`;
      hint = `Combine both quantities with addition.`;
    } else if (subtopicIndex === 5) {
      // 6. Balanced Addition Equation
      const c = prng.int(15, 60);
      const targetX = sum - c;
      questionText = `Find the value of $x$ that balances the equation: $$${a} + ${b} = ${c} + x$$`;
      correctAnswer = `$${targetX}$`;
      rawDistractors = generateNumericalDistractors(targetX, prng).map(d => `$${d}$`);
      given = `Equation $${a} + ${b} = ${c} + x$.`;
      required = `Value of $x$.`;
      method = `Evaluate the left side: $${a} + ${b} = ${sum}$. Then $x = ${sum} - ${c}$.`;
      steps = [`Left side: $${sum}$. $x = ${sum} - ${c} = ${targetX}$.`];
      conclusion = `$x = ${targetX}$.`;
      hint = `Calculate the sum of the left side first, then subtract $${c}$.`;
    } else if (subtopicIndex === 6) {
      // 7. Place-Value Tens/Units Decomposition
      const aTens = Math.floor(a / 10) * 10;
      const aUnits = a % 10;
      const bTens = Math.floor(b / 10) * 10;
      const bUnits = b % 10;
      questionText = `Which expression correctly decomposes the sum $$${a} + ${b}$$ into tens and units?`;
      correctAnswer = `$(${aTens} + ${bTens}) + (${aUnits} + ${bUnits})$`;
      rawDistractors = [
        `$(${aTens} \\times ${bTens}) + (${aUnits} + ${bUnits})$`,
        `$(${aTens} + ${aUnits}) \\times (${bTens} + ${bUnits})$`,
        `$(${aTens} - ${bTens}) + (${aUnits} - ${bUnits})$`,
      ];
      given = `Sum $${a} + ${b}$.`;
      required = `Decomposed tens and units expression.`;
      method = `Group tens together: $${aTens} + ${bTens}$, and units together: $${aUnits} + ${bUnits}$.`;
      steps = [`$${a} = ${aTens} + ${aUnits}$, $${b} = ${bTens} + ${bUnits} \\implies (${aTens} + ${bTens}) + (${aUnits} + ${bUnits})$.`];
      conclusion = `The decomposed form is $(${aTens} + ${bTens}) + (${aUnits} + ${bUnits})$.`;
      hint = `Separate the tens components and units components.`;
    } else if (subtopicIndex === 7) {
      // 8. Commutative Property of Addition
      questionText = `According to the commutative property of addition, the expression $$${a} + ${b}$$ is mathematically identical to:`;
      correctAnswer = `$${b} + ${a}$`;
      rawDistractors = [`$${a} - ${b}$`, `$${a} \\times ${b}$`, `$(${a} + 1) + (${b} - 1)$`];
      given = `Expression $${a} + ${b}$.`;
      required = `Commutative equivalent.`;
      method = `The commutative property states $x + y = y + x$.`;
      steps = [`Swap the order of the addends: $${b} + ${a}$.`];
      conclusion = `$${a} + ${b} = ${b} + ${a}$.`;
      hint = `The commutative property allows swapping the order of the numbers.`;
    } else if (subtopicIndex === 8) {
      // 9. Rounding Estimation
      const roundA = Math.round(a / 10) * 10;
      const roundB = Math.round(b / 10) * 10;
      const estSum = roundA + roundB;
      questionText = `By rounding both numbers to the nearest ten, what is the estimated sum of: $$${a} + ${b}$$`;
      correctAnswer = `$${estSum}$`;
      rawDistractors = [
        `$${estSum + 10}$`,
        `$${estSum - 10}$`,
        `$${roundA * roundB / 10}$`,
      ];
      given = `Numbers $${a}$ (rounds to $${roundA}$) and $${b}$ (rounds to $${roundB}$).`;
      required = `Estimated sum.`;
      method = `Round each addend to the nearest ten and add: $${roundA} + ${roundB} = ${estSum}$.`;
      steps = [`$${a} \\approx ${roundA}$, $${b} \\approx ${roundB} \\implies ${roundA} + ${roundB} = ${estSum}$.`];
      conclusion = `The estimated sum is $${estSum}$.`;
      hint = `Round each number to the nearest multiple of $10$ first, then sum them.`;
    } else {
      // 10. Reverse Sum Puzzle
      questionText = `Two positive integers sum to $${sum}$. If one integer is $${a}$, what is the other integer?`;
      correctAnswer = `$${b}$`;
      rawDistractors = generateNumericalDistractors(b, prng).map(d => `$${d}$`);
      given = `Sum $= ${sum}$, known integer $= ${a}$.`;
      required = `Other integer.`;
      method = `Subtract: $${sum} - ${a} = ${b}$.`;
      steps = [`$${sum} - ${a} = ${b}$.`];
      conclusion = `The other integer is $${b}$.`;
      hint = `Deduct the known integer from the total sum.`;
    }
  }

  // ==========================================
  // STAGE 4: Subtraction (10 Distinct Modalities)
  // ==========================================
  else if (stageId === 4) {
    const b = prng.int(25, 140) * tierMultiplier;
    const diff = prng.int(15, 80) * tierMultiplier;
    const a = b + diff;

    if (subtopicIndex === 0) {
      // 1. Direct Difference
      questionText = `Evaluate the difference: $$${a} - ${b}$$`;
      correctAnswer = `$${diff}$`;
      rawDistractors = generateNumericalDistractors(diff, prng).map(d => `$${d}$`);
      given = `Minuend $${a}$, subtrahend $${b}$.`;
      required = `Difference $${a} - ${b}$.`;
      method = `Subtract column-wise with borrowing across place values.`;
      steps = [`$${a} - ${b} = ${diff}$.`];
      conclusion = `The difference is $${diff}$.`;
      hint = `Subtract units from units, tens from tens, borrowing when needed.`;
    } else if (subtopicIndex === 1) {
      // 2. Missing Subtrahend
      questionText = `Find $x$ in the subtraction equation: $$${a} - x = ${diff}$$`;
      correctAnswer = `$${b}$`;
      rawDistractors = generateNumericalDistractors(b, prng).map(d => `$${d}$`);
      given = `Equation $${a} - x = ${diff}$.`;
      required = `Value of $x$.`;
      method = `Rearrange: $x = ${a} - ${diff} = ${b}$.`;
      steps = [`$x = ${a} - ${diff} = ${b}$.`];
      conclusion = `$x = ${b}$.`;
      hint = `Subtract the difference ($${diff}$) from $${a}$.`;
    } else if (subtopicIndex === 2) {
      // 3. Missing Minuend
      questionText = `Solve for $x$: $$x - ${b} = ${diff}$$`;
      correctAnswer = `$${a}$`;
      rawDistractors = generateNumericalDistractors(a, prng).map(d => `$${d}$`);
      given = `Equation $x - ${b} = ${diff}$.`;
      required = `Value of $x$.`;
      method = `Inverse addition: $x = ${diff} + ${b} = ${a}$.`;
      steps = [`$x = ${diff} + ${b} = ${a}$.`];
      conclusion = `$x = ${a}$.`;
      hint = `Add $${b}$ to both sides to find $x$.`;
    } else if (subtopicIndex === 3) {
      // 4. Context Word Problem
      questionText = `A delivery warehouse started with $${a}$ boxes. By mid-day, $${b}$ boxes had been dispatched. How many boxes remain in the warehouse?`;
      correctAnswer = `$${diff}\\text{ boxes}$`;
      rawDistractors = generateNumericalDistractors(diff, prng).map(d => `$${d}\\text{ boxes}$`);
      given = `Starting stock $${a}$, dispatched $${b}$.`;
      required = `Remaining boxes.`;
      method = `Subtract dispatched count: $${a} - ${b} = ${diff}$.`;
      steps = [`$${a} - ${b} = ${diff}$.`];
      conclusion = `$${diff}$ boxes remain.`;
      hint = `Subtract the dispatched amount from the initial stock.`;
    } else if (subtopicIndex === 4) {
      // 5. Distance on Number Line
      questionText = `What is the distance on the number line between $${b}$ and $${a}$?`;
      correctAnswer = `$${diff}$`;
      rawDistractors = generateNumericalDistractors(diff, prng).map(d => `$${d}$`);
      given = `Points $${b}$ and $${a}$ on the number line.`;
      required = `Distance $|${a} - ${b}|$.`;
      method = `Distance is the absolute difference: $${a} - ${b} = ${diff}$.`;
      steps = [`$${a} - ${b} = ${diff}$.`];
      conclusion = `The distance is $${diff}$.`;
      hint = `Distance between two positive numbers on a line is larger minus smaller.`;
    } else if (subtopicIndex === 5) {
      // 6. Multi-Step Subtraction
      const c = prng.int(5, 20);
      const finalDiff = diff - c;
      questionText = `Evaluate the multi-step subtraction: $$${a} - ${b} - ${c}$$`;
      correctAnswer = `$${finalDiff}$`;
      rawDistractors = generateNumericalDistractors(finalDiff, prng).map(d => `$${d}$`);
      given = `Expression $${a} - ${b} - ${c}$.`;
      required = `Net result.`;
      method = `Work left to right: $(${a} - ${b}) - ${c} = ${diff} - ${c} = ${finalDiff}$.`;
      steps = [`$${a} - ${b} = ${diff}$, and $${diff} - ${c} = ${finalDiff}$.`];
      conclusion = `The result is $${finalDiff}$.`;
      hint = `Subtract $${b}$ first, then subtract $${c}$ from that answer.`;
    } else if (subtopicIndex === 6) {
      // 7. Balanced Subtraction Equation
      const c = prng.int(10, 40);
      const targetX = b + c;
      questionText = `Find $x$ that balances the equation: $$${a} - ${b} = (${a} + ${c}) - x$$`;
      correctAnswer = `$${targetX}$`;
      rawDistractors = generateNumericalDistractors(targetX, prng).map(d => `$${d}$`);
      given = `Equation $${a} - ${b} = (${a + c}) - x$.`;
      required = `Value of $x$.`;
      method = `Left side is $${diff}$. Thus $x = (${a + c}) - ${diff} = ${targetX}$.`;
      steps = [`$x = ${a + c} - ${diff} = ${targetX}$.`];
      conclusion = `$x = ${targetX}$.`;
      hint = `Calculate the left side difference, then subtract it from $${a + c}$.`;
    } else if (subtopicIndex === 7) {
      // 8. Inverse Relation
      questionText = `If $${a} - ${b} = ${diff}$, which addition identity verifies this result?`;
      correctAnswer = `$${b} + ${diff} = ${a}$`;
      rawDistractors = [
        `$${a} + ${b} = ${diff}$`,
        `$${diff} + ${a} = ${b}$`,
        `$${a} + ${diff} = ${b}$`,
      ];
      given = `Subtraction equality $${a} - ${b} = ${diff}$.`;
      required = `Corresponding addition relation.`;
      method = `Subtraction and addition are inverse operations: $x - y = z \\iff y + z = x$.`;
      steps = [`$${b} + ${diff} = ${a}$.`];
      conclusion = `$${b} + ${diff} = ${a}$.`;
      hint = `Adding the difference back to the subtrahend equals the minuend.`;
    } else if (subtopicIndex === 8) {
      // 9. Comparison Word Problem
      questionText = `How much greater is $${a}$ than $${b}$?`;
      correctAnswer = `$${diff}$`;
      rawDistractors = generateNumericalDistractors(diff, prng).map(d => `$${d}$`);
      given = `Quantities $${a}$ and $${b}$.`;
      required = `Difference in magnitude.`;
      method = `Subtract smaller from larger: $${a} - ${b} = ${diff}$.`;
      steps = [`$${a} - ${b} = ${diff}$.`];
      conclusion = `$${a}$ is greater by $${diff}$.`;
      hint = `Find how much greater by taking the difference.`;
    } else {
      // 10. Subtraction Riddle
      questionText = `I am a number. When $${b}$ is subtracted from me, the remaining result is $${diff}$. What number am I?`;
      correctAnswer = `$${a}$`;
      rawDistractors = generateNumericalDistractors(a, prng).map(d => `$${d}$`);
      given = `Unknown $n$ such that $n - ${b} = ${diff}$.`;
      required = `The number $n$.`;
      method = `Invert the subtraction: $n = ${diff} + ${b} = ${a}$.`;
      steps = [`$n = ${diff} + ${b} = ${a}$.`];
      conclusion = `The number is $${a}$.`;
      hint = `Add the remaining result to the amount that was subtracted.`;
    }
  }

  // ==========================================
  // STAGE 5: Multiplication (10 Distinct Modalities)
  // ==========================================
  else if (stageId === 5) {
    const a = prng.int(6, 16) * (tier === 'mastery' ? 2 : 1);
    const b = prng.int(4, 15) * (tier === 'mastery' ? 2 : 1);
    const prod = a * b;

    if (subtopicIndex === 0) {
      // 1. Direct Product
      questionText = `Calculate the product: $$${a} \\times ${b}$$`;
      correctAnswer = `$${prod}$`;
      rawDistractors = generateNumericalDistractors(prod, prng).map(d => `$${d}$`);
      given = `Factors $${a}$ and $${b}$.`;
      required = `Product $${a} \\times ${b}$.`;
      method = `Multiply factors directly or decompose using distributive property.`;
      steps = [`$${a} \\times ${b} = ${prod}$.`];
      conclusion = `The product is $${prod}$.`;
      hint = `Multiply tens and units, then add the partial products.`;
    } else if (subtopicIndex === 1) {
      // 2. Missing Factor
      questionText = `Find the missing factor $x$ in the equation: $$${a} \\times x = ${prod}$$`;
      correctAnswer = `$${b}$`;
      rawDistractors = generateNumericalDistractors(b, prng).map(d => `$${d}$`);
      given = `Equation $${a} \\times x = ${prod}$.`;
      required = `Value of factor $x$.`;
      method = `Divide both sides by $${a}$: $x = ${prod} \\div ${a} = ${b}$.`;
      steps = [`$x = ${prod} \\div ${a} = ${b}$.`];
      conclusion = `$x = ${b}$.`;
      hint = `Divide the product by the known factor.`;
    } else if (subtopicIndex === 2) {
      // 3. Rectangular Area Model
      questionText = `A rectangular courtyard has a length of $${a}\\text{ m}$ and a width of $${b}\\text{ m}$. What is its area in square meters?`;
      correctAnswer = `$${prod}\\text{ m}^2$`;
      rawDistractors = generateNumericalDistractors(prod, prng).map(d => `$${d}\\text{ m}^2$`);
      given = `Length $= ${a}\\text{ m}$, Width $= ${b}\\text{ m}$.`;
      required = `Area $A = \\text{Length} \\times \\text{Width}$.`;
      method = `Apply area formula: $A = ${a} \\times ${b} = ${prod}\\text{ m}^2$.`;
      steps = [`$A = ${a} \\times ${b} = ${prod}\\text{ m}^2$.`];
      conclusion = `The area is $${prod}\\text{ m}^2$.`;
      hint = `Area of a rectangle is length multiplied by width.`;
    } else if (subtopicIndex === 3) {
      // 4. Repeated Addition Equivalent
      const k = prng.pick([3, 4, 5]);
      const repSum = Array(k).fill(a).join(' + ');
      const repProd = a * k;
      questionText = `Which multiplication expression represents the repeated addition: $$${repSum}$$`;
      correctAnswer = `$${a} \\times ${k}$`;
      rawDistractors = [
        `$${a} + ${k}$`,
        `$${a}^${k}$`,
        `$${k} + ${a}$`,
      ];
      given = `Repeated addition $${repSum}$ ($${k}$ copies of $${a}$).`;
      required = `Multiplication expression.`;
      method = `Adding $${a}$ repeated $${k}$ times is equivalent to $${a} \\times ${k}$.`;
      steps = [`Count copies: $${k}$ groups of $${a} \\implies ${a} \\times ${k} = ${repProd}$.`];
      conclusion = `The expression is $${a} \\times ${k}$.`;
      hint = `Count how many times $${a}$ is being added.`;
    } else if (subtopicIndex === 4) {
      // 5. Seating Array / Grid Word Problem
      questionText = `An auditorium hall has $${a}$ rows of seats, with exactly $${b}$ seats in each row. How many total seats are in the hall?`;
      correctAnswer = `$${prod}\\text{ seats}$`;
      rawDistractors = generateNumericalDistractors(prod, prng).map(d => `$${d}\\text{ seats}$`);
      given = `$${a}$ rows, $${b}$ seats per row.`;
      required = `Total seating capacity.`;
      method = `Multiply rows by seats per row: $${a} \\times ${b} = ${prod}$.`;
      steps = [`$${a} \\times ${b} = ${prod}$.`];
      conclusion = `Total capacity is $${prod}$ seats.`;
      hint = `Multiply the number of rows by the seats in each row.`;
    } else if (subtopicIndex === 5) {
      // 6. Distributive Property Expansion
      const tensB = Math.floor(b / 10) * 10 || 10;
      const onesB = b - tensB;
      questionText = `Using the distributive property, the product $${a} \\times (${tensB} + ${onesB})$ expands to:`;
      correctAnswer = `$(${a} \\times ${tensB}) + (${a} \\times ${onesB})$`;
      rawDistractors = [
        `$(${a} + ${tensB}) \\times (${a} + ${onesB})$`,
        `$(${a} \\times ${tensB}) \\times (${a} \\times ${onesB})$`,
        `$${a} + ${tensB} + ${onesB}$`,
      ];
      given = `Product $${a} \\times (${tensB} + ${onesB})$.`;
      required = `Distributive expansion.`;
      method = `Distribute $${a}$ across the sum: $a(b + c) = ab + ac$.`;
      steps = [`$${a} \\times (${tensB} + ${onesB}) = (${a} \\times ${tensB}) + (${a} \\times ${onesB})$.`];
      conclusion = `$(${a} \\times ${tensB}) + (${a} \\times ${onesB})$.`;
      hint = `Multiply $${a}$ by each term inside the parentheses.`;
    } else if (subtopicIndex === 6) {
      // 7. Commutative Identity
      questionText = `Which property guarantees that $$${a} \\times ${b} = ${b} \\times ${a}$$?`;
      correctAnswer = `$\\text{Commutative Property of Multiplication}$`;
      rawDistractors = [
        `$\\text{Associative Property}$`,
        `$\\text{Distributive Property}$`,
        `$\\text{Identity Property}$`,
      ];
      given = `Identity $${a} \\times ${b} = ${b} \\times ${a}$.`;
      required = `Name of mathematical property.`;
      method = `The commutative property allows changing factor order without changing the product.`;
      steps = [`$xy = yx$ is the commutative property of multiplication.`];
      conclusion = `Commutative Property of Multiplication.`;
      hint = `Commuting means swapping positions or orders.`;
    } else if (subtopicIndex === 7) {
      // 8. Scale Factor / Ratio Packaging
      const costPerKg = a;
      const weight = b;
      questionText = `A premium commodity costs $\\text{\\$} ${costPerKg}$ per kilogram. What is the total cost for $${weight}\\text{ kg}$?`;
      correctAnswer = `$\\text{\\$} ${prod}$`;
      rawDistractors = generateNumericalDistractors(prod, prng).map(d => `$\\text{\\$} ${d}$`);
      given = `Rate: $\\text{\\$} ${costPerKg}/\\text{kg}$, Weight: $${weight}\\text{ kg}$.`;
      required = `Total price.`;
      method = `Multiply rate by quantity: $${costPerKg} \\times ${weight} = ${prod}$.`;
      steps = [`$${costPerKg} \\times ${weight} = ${prod}$.`];
      conclusion = `Total cost is $\\text{\\$} ${prod}$.`;
      hint = `Multiply the price per kg by the total weight.`;
    } else if (subtopicIndex === 8) {
      // 9. Factoring into Factor Pairs
      questionText = `Which pair of integers are both factors of $${prod}$?`;
      correctAnswer = `$\\{${a}, \\; ${b}\\}$`;
      rawDistractors = [
        `$\\{${a + 1}, \\; ${b + 1}\\}$`,
        `$\\{${a - 1}, \\; ${b + 2}\\}$`,
        `$\\{${a + 2}, \\; ${b - 2}\\}$`,
      ];
      given = `Product $${prod}$.`;
      required = `Valid factor pair.`;
      method = `Since $${a} \\times ${b} = ${prod}$, both $${a}$ and $${b}$ are factors.`;
      steps = [`$${a} \\times ${b} = ${prod} \\implies ${a} | ${prod}$ and $${b} | ${prod}$.`];
      conclusion = `$\\{${a}, ${b}\\}$ are factors.`;
      hint = `Check which pair of numbers multiply to give $${prod}$.`;
    } else {
      // 10. Multiplication Puzzle
      questionText = `I am a positive number. When multiplied by $${a}$, the resulting product is $${prod}$. What number am I?`;
      correctAnswer = `$${b}$`;
      rawDistractors = generateNumericalDistractors(b, prng).map(d => `$${d}$`);
      given = `Unknown $n$ where $n \\times ${a} = ${prod}$.`;
      required = `The number $n$.`;
      method = `Divide: $n = ${prod} \\div ${a} = ${b}$.`;
      steps = [`$n = ${prod} \\div ${a} = ${b}$.`];
      conclusion = `The number is $${b}$.`;
      hint = `Divide the final product by $${a}$.`;
    }
  }

  // ==========================================
  // STAGES 6-10: Handled with full 10-modality coverage
  // ==========================================
  else if (stageId === 6) {
    // Division: exact quotients, remainders, word problems, divisibility
    const divisor = prng.int(4, 12);
    const quotient = prng.int(6, 25) * tierMultiplier;
    const remainder = prng.int(1, divisor - 1);
    const exactDividend = divisor * quotient;
    const remDividend = divisor * quotient + remainder;

    if (subtopicIndex % 2 === 0) {
      // Exact division or missing dividend
      if (subtopicIndex === 0) {
        questionText = `Compute the exact quotient: $$${exactDividend} \\div ${divisor}$$`;
        correctAnswer = `$${quotient}$`;
        rawDistractors = generateNumericalDistractors(quotient, prng).map(d => `$${d}$`);
        given = `Dividend $${exactDividend}$, divisor $${divisor}$.`;
        required = `Quotient $${exactDividend} \\div ${divisor}$.`;
        method = `Determine how many times $${divisor}$ divides into $${exactDividend}$.`;
        steps = [`$${exactDividend} \\div ${divisor} = ${quotient}$ because $${divisor} \\times ${quotient} = ${exactDividend}$.`];
        conclusion = `The quotient is $${quotient}$.`;
        hint = `Think of what number multiplied by $${divisor}$ equals $${exactDividend}$.`;
      } else if (subtopicIndex === 2) {
        questionText = `Find $x$ in the division equation: $$x \\div ${divisor} = ${quotient}$$`;
        correctAnswer = `$${exactDividend}$`;
        rawDistractors = generateNumericalDistractors(exactDividend, prng).map(d => `$${d}$`);
        given = `Equation $x \\div ${divisor} = ${quotient}$.`;
        required = `Value of $x$.`;
        method = `Multiply both sides by $${divisor}$: $x = ${quotient} \\times ${divisor} = ${exactDividend}$.`;
        steps = [`$x = ${quotient} \\times ${divisor} = ${exactDividend}$.`];
        conclusion = `$x = ${exactDividend}$.`;
        hint = `Multiply the quotient by the divisor.`;
      } else if (subtopicIndex === 4) {
        questionText = `A teacher divides $${exactDividend}$ counters equally into $${divisor}$ student groups. How many counters are in each group?`;
        correctAnswer = `$${quotient}\\text{ counters}$`;
        rawDistractors = generateNumericalDistractors(quotient, prng).map(d => `$${d}\\text{ counters}$`);
        given = `$${exactDividend}$ counters shared equally among $${divisor}$ groups.`;
        required = `Counters per group.`;
        method = `Divide total by groups: $${exactDividend} \\div ${divisor} = ${quotient}$.`;
        steps = [`$${exactDividend} \\div ${divisor} = ${quotient}$.`];
        conclusion = `Each group receives $${quotient}$ counters.`;
        hint = `Divide the total count by the number of groups.`;
      } else if (subtopicIndex === 6) {
        questionText = `A vehicle travels $${exactDividend}\\text{ km}$ in $${divisor}\\text{ hours}$ at uniform speed. What is the average speed in $\\text{km/h}$?`;
        correctAnswer = `$${quotient}\\text{ km/h}$`;
        rawDistractors = generateNumericalDistractors(quotient, prng).map(d => `$${d}\\text{ km/h}$`);
        given = `Distance $${exactDividend}\\text{ km}$, Time $${divisor}\\text{ h}$.`;
        required = `Speed $S = \\frac{D}{T}$.`;
        method = `$S = ${exactDividend} \\div ${divisor} = ${quotient}\\text{ km/h}$.`;
        steps = [`$${exactDividend} \\div ${divisor} = ${quotient}$.`];
        conclusion = `Speed is $${quotient}\\text{ km/h}$.`;
        hint = `Divide distance by time.`;
      } else {
        questionText = `Which of the following numbers is evenly divisible by $${divisor}$ with zero remainder?`;
        correctAnswer = `$${exactDividend}$`;
        rawDistractors = [
          `$${exactDividend + 1}$`,
          `$${exactDividend + 2}$`,
          `$${exactDividend - 1}$`,
        ];
        given = `Divisor $${divisor}$.`;
        required = `Multiple of $${divisor}$.`;
        method = `Check divisibility: $${exactDividend} \\div ${divisor} = ${quotient}$ with remainder $0$.`;
        steps = [`$${exactDividend} = ${divisor} \\times ${quotient}$.`];
        conclusion = `$${exactDividend}$ is divisible by $${divisor}$.`;
        hint = `Find the number that is a multiple of $${divisor}$.`;
      }
    } else {
      // Division with remainder or remainder puzzles
      if (subtopicIndex === 1) {
        questionText = `When $${remDividend}$ is divided by $${divisor}$, what is the integer remainder?`;
        correctAnswer = `$${remainder}$`;
        const validRems = [0, 1, 2, 3, 4, 5].filter(r => r !== remainder && r < divisor);
        rawDistractors = prng.shuffle(validRems).slice(0, 3).map(r => `$${r}$`);
        given = `Division $${remDividend} \\div ${divisor}$.`;
        required = `Remainder $r$ where $0 \\le r < ${divisor}$.`;
        method = `Find multiple of $${divisor}$: $${divisor} \\times ${quotient} = ${divisor * quotient}$. Remainder $= ${remDividend} - ${divisor * quotient} = ${remainder}$.`;
        steps = [`$${remDividend} - ${divisor * quotient} = ${remainder}$.`];
        conclusion = `The remainder is $${remainder}$.`;
        hint = `Find the largest multiple of $${divisor}$ less than $${remDividend}$, then subtract.`;
      } else if (subtopicIndex === 3) {
        questionText = `A packaging plant packs $${remDividend}$ apples into cartons of $${divisor}$. How many loose apples remain unpacked?`;
        correctAnswer = `$${remainder}\\text{ apples}$`;
        const validRems = [0, 1, 2, 3, 4, 5].filter(r => r !== remainder && r < divisor);
        rawDistractors = prng.shuffle(validRems).slice(0, 3).map(r => `$${r}\\text{ apples}$`);
        given = `$${remDividend}$ items, package capacity $${divisor}$.`;
        required = `Leftover remainder.`;
        method = `Remainder of $${remDividend} \\div ${divisor}$ is $${remainder}$.`;
        steps = [`$${divisor} \\times ${quotient} = ${divisor * quotient}$, remaining: $${remDividend} - ${divisor * quotient} = ${remainder}$.`];
        conclusion = `$${remainder}$ apples remain unpacked.`;
        hint = `Find the leftover remainder after filling complete cartons.`;
      } else if (subtopicIndex === 5) {
        questionText = `Find the quotient $q$ and remainder $r$ when $${remDividend}$ is divided by $${divisor}$:`;
        correctAnswer = `$q = ${quotient}, \\; r = ${remainder}$`;
        rawDistractors = [
          `$q = ${quotient + 1}, \\; r = ${remainder}$`,
          `$q = ${quotient}, \\; r = ${(remainder + 1) % divisor}$`,
          `$q = ${quotient - 1}, \\; r = ${remainder}$`,
        ];
        given = `Division $${remDividend} \\div ${divisor}$.`;
        required = `Quotient $q$ and remainder $r$.`;
        method = `Division algorithm: $a = bq + r$.`;
        steps = [`$${remDividend} = ${divisor} \\times ${quotient} + ${remainder}$.`];
        conclusion = `$q = ${quotient}, r = ${remainder}$.`;
        hint = `Find the number of whole groups and the remaining amount.`;
      } else if (subtopicIndex === 7) {
        questionText = `What is the maximum possible remainder when any integer is divided by $${divisor}$?`;
        correctAnswer = `$${divisor - 1}$`;
        rawDistractors = [`$${divisor}$`, `$${divisor + 1}$`, `$1$`];
        given = `Divisor $${divisor}$.`;
        required = `Maximum possible remainder.`;
        method = `By the Euclidean division theorem, $0 \\le r < d$. The maximum remainder is $d - 1$.`;
        steps = [`$r < ${divisor} \\implies r_{\\max} = ${divisor - 1}$.`];
        conclusion = `The maximum remainder is $${divisor - 1}$.`;
        hint = `The remainder must always be strictly less than the divisor.`;
      } else {
        questionText = `I am a number. When divided by $${divisor}$, my quotient is $${quotient}$ and my remainder is $${remainder}$. What number am I?`;
        correctAnswer = `$${remDividend}$`;
        rawDistractors = generateNumericalDistractors(remDividend, prng).map(d => `$${d}$`);
        given = `Divisor $${divisor}$, quotient $${quotient}$, remainder $${remainder}$.`;
        required = `Dividend.`;
        method = `Reconstruct: $\\text{Dividend} = (${divisor} \\times ${quotient}) + ${remainder} = ${remDividend}$.`;
        steps = [`$${divisor} \\times ${quotient} = ${divisor * quotient}$, and $${divisor * quotient} + ${remainder} = ${remDividend}$.`];
        conclusion = `The number is $${remDividend}$.`;
        hint = `Multiply the divisor by the quotient, then add the remainder.`;
      }
    }
  }

  // Stages 7-10: Diverse Modalities for Primes, Rounding, PEMDAS, and Stage 10 Challenge
  else if (stageId === 7) {
    // Stage 7: Factors, Multiples & Primes (10 Distinct Modalities)
    const primesList = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
    const compositesList = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22];

    if (subtopicIndex === 0) {
      // 1. GCF / GCD
      const g = prng.pick([3, 4, 6, 8]);
      const p1 = prng.pick([2, 3, 5]);
      const p2 = prng.pick([7, 11, 13]);
      const n1 = p1 * g;
      const n2 = p2 * g;
      questionText = `Find the greatest common factor (GCF/GCD) of $${n1}$ and $${n2}$.`;
      correctAnswer = `$${g}$`;
      rawDistractors = generateNumericalDistractors(g, prng).map(d => `$${d}$`);
      given = `Integers $${n1}$ and $${n2}$.`;
      required = `$\\gcd(${n1}, ${n2})$.`;
      method = `Find prime factors common to both: $${n1} = ${g} \\times ${p1}$ and $${n2} = ${g} \\times ${p2}$.`;
      steps = [`$\\gcd(${n1}, ${n2}) = ${g}$.`];
      conclusion = `The GCF is $${g}$.`;
      hint = `Find the largest number that divides both $${n1}$ and $${n2}$ without remainder.`;
    } else if (subtopicIndex === 1) {
      // 2. LCM
      const n1 = prng.pick([4, 6, 8, 10]);
      const n2 = prng.pick([3, 5, 9]);
      const ansLcm = lcm(n1, n2);
      questionText = `Find the least common multiple (LCM) of $${n1}$ and $${n2}$.`;
      correctAnswer = `$${ansLcm}$`;
      rawDistractors = [
        `$${ansLcm * 2}$`,
        `$${gcd(n1, n2)}$`,
        `$${ansLcm + n1}$`,
      ];
      given = `Integers $${n1}$ and $${n2}$.`;
      required = `$\\text{LCM}(${n1}, ${n2})$.`;
      method = `$\\text{LCM}(a, b) = \\frac{a \\times b}{\\gcd(a, b)}$.`;
      steps = [`$\\text{LCM}(${n1}, ${n2}) = ${ansLcm}$.`];
      conclusion = `The LCM is $${ansLcm}$.`;
      hint = `List multiples of the larger number until you find one divisible by the smaller number.`;
    } else if (subtopicIndex === 2) {
      // 3. Prime identification
      const prime = prng.pick(primesList.filter(p => p > 7));
      const comp1 = prng.pick(compositesList);
      const comp2 = prng.pick(compositesList.filter(c => c !== comp1));
      const comp3 = prng.pick(compositesList.filter(c => c !== comp1 && c !== comp2));
      questionText = `Which of the following numbers from the set $\\{${comp1}, \\; ${comp2}, \\; ${prime}, \\; ${comp3}\\}$ is a prime number?`;
      correctAnswer = `$${prime}$`;
      rawDistractors = [`$${comp1}$`, `$${comp2}$`, `$${comp3}$`];
      given = `Candidate set $\\{${prime}, ${comp1}, ${comp2}, ${comp3}\\}$.`;
      required = `Prime integer.`;
      method = `A prime number has exactly two distinct positive divisors: $1$ and itself.`;
      steps = [`$${prime}$ has only $1$ and $${prime}$ as factors.`];
      conclusion = `$${prime}$ is prime.`;
      hint = `A prime number cannot be divided evenly by any number other than 1 and itself.`;
    } else if (subtopicIndex === 3) {
      // 4. Prime Factorization
      const p1 = prng.pick([2, 3]);
      const p2 = prng.pick([3, 5]);
      const p3 = prng.pick([5, 7]);
      const val = p1 * p2 * p3;
      questionText = `What is the prime factorization of $${val}$?`;
      correctAnswer = `$${p1} \\times ${p2} \\times ${p3}$`;
      rawDistractors = [
        `$${p1 * p2} \\times ${p3}$`,
        `$${p1} + ${p2} + ${p3}$`,
        `$${p1 * 2} \\times ${p2}$`,
      ];
      given = `Number $${val}$.`;
      required = `Prime factor decomposition.`;
      method = `Break into prime factors: $${val} = ${p1} \\times ${p2} \\times ${p3}$.`;
      steps = [`$${val} = ${p1} \\times ${p2 * p3} = ${p1} \\times ${p2} \\times ${p3}$.`];
      conclusion = `$${val} = ${p1} \\times ${p2} \\times ${p3}$.`;
      hint = `Factor $${val}$ into numbers that cannot be factored further.`;
    } else if (subtopicIndex === 4) {
      // 5. Divisibility Rule for 3 or 9
      const sumDig = prng.pick([18, 27]);
      const d1 = prng.int(4, 9);
      const d2 = prng.int(3, 8);
      const d3 = sumDig - (d1 + d2);
      const testNum = d1 * 100 + d2 * 10 + d3;
      questionText = `Is the integer $${testNum}$ divisible by $9$?`;
      const isDiv = sumDig % 9 === 0;
      correctAnswer = isDiv ? `$\\text{Yes, sum of digits is } ${sumDig}$` : `$\\text{No, sum of digits is not a multiple of } 9$`;
      rawDistractors = [
        isDiv ? `$\\text{No, it ends in an odd digit}$` : `$\\text{Yes, because it is odd}$`,
        `$\\text{Only if divided by } 3$`,
        `$\\text{Cannot be determined}$`,
      ];
      given = `Number $${testNum}$.`;
      required = `Divisibility by $9$.`;
      method = `A number is divisible by $9$ if and only if the sum of its digits is divisible by $9$. Digits sum: $${d1} + ${d2} + ${d3} = ${sumDig}$.`;
      steps = [`Sum of digits: $${sumDig}$.`, `$${sumDig} \\div 9 = ${sumDig / 9}$ without remainder.`];
      conclusion = `Divisible by 9: Yes.`;
      hint = `Add up all the digits in $${testNum}$ and check if that sum is divisible by 9.`;
    } else if (subtopicIndex === 5) {
      // 6. Parity Rule of Sum
      const sampleOdd = prng.pick([3, 5, 7, 9, 11, 13]);
      const sampleEven = prng.pick([2, 4, 6, 8, 10, 12]);
      questionText = `For any odd integer $a$ (such as $${sampleOdd}$) and even integer $b$ (such as $${sampleEven}$), what is the parity of their sum $a + b$?`;
      correctAnswer = `$\\text{Always Odd}$`;
      rawDistractors = [`$\\text{Always Even}$`, `$\\text{Depends on the numbers}$`, `$\\text{Zero}$`];
      given = `Sum of an odd number $(2k+1)$ and an even number $(2m)$.`;
      required = `Parity of the result.`;
      method = `$(2k+1) + 2m = 2(k+m) + 1$, which is odd by definition.`;
      steps = [`Example: $${sampleOdd} + ${sampleEven} = ${sampleOdd + sampleEven}$ (odd).`];
      conclusion = `The sum is always odd.`;
      hint = `Try adding the given example: $${sampleOdd} + ${sampleEven} = ${sampleOdd + sampleEven}$.`;
    } else if (subtopicIndex === 6) {
      // 7. Parity Rule of Product
      const sampleOdd1 = prng.pick([3, 5, 7, 9, 11]);
      const sampleOdd2 = prng.pick([13, 15, 17, 19, 21]);
      questionText = `For any two odd integers $u$ (such as $${sampleOdd1}$) and $v$ (such as $${sampleOdd2}$), what is the parity of their product $u \\times v$?`;
      correctAnswer = `$\\text{Always Odd}$`;
      rawDistractors = [`$\\text{Always Even}$`, `$\\text{Depends on magnitude}$`, `$\\text{Zero}$`];
      given = `Product of two odd numbers $(2k+1)(2m+1)$.`;
      required = `Parity of product.`;
      method = `$(2k+1)(2m+1) = 4km + 2k + 2m + 1 = 2(2km + k + m) + 1$, which is odd.`;
      steps = [`Example: $${sampleOdd1} \\times ${sampleOdd2} = ${sampleOdd1 * sampleOdd2}$ (odd).`];
      conclusion = `The product is always odd.`;
      hint = `Try multiplying the example: $${sampleOdd1} \\times ${sampleOdd2} = ${sampleOdd1 * sampleOdd2}$.`;
    } else if (subtopicIndex === 7) {
      // 8. Word Problem on LCM (Lighthouses / Bells)
      const t1 = prng.pick([6, 8, 12]);
      const t2 = prng.pick([9, 10, 15]);
      const timeLcm = lcm(t1, t2);
      questionText = `Two lighthouse beacons flash every $${t1}$ seconds and $${t2}$ seconds respectively. If they flash together right now, after how many seconds will they flash together again?`;
      correctAnswer = `$${timeLcm}\\text{ seconds}$`;
      rawDistractors = [`$${t1 * t2}\\text{ seconds}$`, `$${timeLcm / 2}\\text{ seconds}$`, `$${timeLcm + t1}\\text{ seconds}$`];
      given = `Intervals $${t1}\\text{ s}$ and $${t2}\\text{ s}$.`;
      required = `Next synchronous flash time.`;
      method = `The synchronous interval is the Least Common Multiple: $\\text{LCM}(${t1}, ${t2}) = ${timeLcm}$.`;
      steps = [`$\\text{LCM}(${t1}, ${t2}) = ${timeLcm}$.`];
      conclusion = `They will flash together after $${timeLcm}$ seconds.`;
      hint = `Find the Least Common Multiple of $${t1}$ and $${t2}$.`;
    } else if (subtopicIndex === 8) {
      // 9. Word Problem on GCF (Cutting ribbons / tiles)
      const len1 = prng.pick([24, 36, 48]);
      const len2 = prng.pick([18, 30, 42]);
      const gRibbon = gcd(len1, len2);
      questionText = `A carpenter has two pieces of timber of lengths $${len1}\\text{ cm}$ and $${len2}\\text{ cm}$. What is the greatest equal length to which both pieces can be cut without any wood left over?`;
      correctAnswer = `$${gRibbon}\\text{ cm}$`;
      rawDistractors = generateNumericalDistractors(gRibbon, prng).map(x => `$${x}\\text{ cm}$`);
      given = `Timber lengths $${len1}\\text{ cm}$ and $${len2}\\text{ cm}$.`;
      required = `Greatest common divisor length.`;
      method = `The longest identical piece that divides both lengths evenly is $\\gcd(${len1}, ${len2}) = ${gRibbon}$.`;
      steps = [`$\\gcd(${len1}, ${len2}) = ${gRibbon}$.`];
      conclusion = `The greatest equal length is $${gRibbon}\\text{ cm}$.`;
      hint = `Find the greatest common factor of $${len1}$ and $${len2}$.`;
    } else {
      // 10. Divisor Count
      const n = prng.pick([12, 18, 20, 24, 28, 30]);
      let count = 0;
      for (let i = 1; i <= n; i++) {
        if (n % i === 0) count++;
      }
      questionText = `How many positive integer factors (divisors) does the number $${n}$ have?`;
      correctAnswer = `$${count}$`;
      rawDistractors = generateNumericalDistractors(count, prng).map(d => `$${d}$`);
      given = `Integer $${n}$.`;
      required = `Number of positive divisors.`;
      method = `List all positive factors of $${n}$ that divide it without remainder.`;
      steps = [`Count divisors: exactly $${count}$ integers divide $${n}$.`];
      conclusion = `$${n}$ has $${count}$ positive factors.`;
      hint = `List all pairs of numbers that multiply to make $${n}$.`;
    }
  }

  else if (stageId === 8) {
    // Stage 8: Rounding, Estimation, Squares & Roots (10 Distinct Modalities)
    if (subtopicIndex === 0) {
      // 1. Rounding to Nearest Ten
      const n = prng.int(120, 890);
      const rounded = Math.round(n / 10) * 10;
      questionText = `Round $${n}$ to the nearest ten:`;
      correctAnswer = `$${rounded}$`;
      rawDistractors = [
        `$${rounded + 10}$`,
        `$${rounded - 10}$`,
        `$${Math.round(n / 100) * 100}$`,
      ];
      given = `Number $${n}$.`;
      required = `Rounded to nearest ten.`;
      method = `Look at the units digit: if $5$ or more round up, otherwise round down.`;
      steps = [`Units digit is $${n % 10} \\implies ${rounded}$.`];
      conclusion = `$${n}$ rounds to $${rounded}$.`;
      hint = `Check if the units digit is 5 or greater to round up.`;
    } else if (subtopicIndex === 1) {
      // 2. Rounding to Nearest Hundred
      const n = prng.int(230, 980);
      const rounded = Math.round(n / 100) * 100;
      questionText = `Round $${n}$ to the nearest hundred:`;
      correctAnswer = `$${rounded}$`;
      rawDistractors = [
        `$${rounded + 100}$`,
        `$${rounded - 100}$`,
        `$${Math.round(n / 10) * 10}$`,
      ];
      given = `Number $${n}$.`;
      required = `Rounded to nearest hundred.`;
      method = `Look at the tens digit: if $5$ or more round up to next hundred.`;
      steps = [`Tens digit is $${Math.floor((n % 100) / 10)} \\implies ${rounded}$.`];
      conclusion = `$${n}$ rounds to $${rounded}$.`;
      hint = `Look at the tens place to decide whether to round up or down.`;
    } else if (subtopicIndex === 2) {
      // 3. Perfect Squares
      const base = prng.int(7, 20) + (tierMultiplier - 1) * 5;
      const sq = base * base;
      questionText = `Evaluate the square: $$${base}^2$$`;
      correctAnswer = `$${sq}$`;
      rawDistractors = generateNumericalDistractors(sq, prng).map(d => `$${d}$`);
      given = `Base $${base}$.`;
      required = `$${base}^2 = ${base} \\times ${base}$.`;
      method = `Multiply $${base}$ by itself.`;
      steps = [`$${base} \\times ${base} = ${sq}$.`];
      conclusion = `$${base}^2 = ${sq}$.`;
      hint = `Multiply $${base}$ by itself.`;
    } else if (subtopicIndex === 3) {
      // 4. Principal Square Roots
      const root = prng.int(6, 16);
      const sq = root * root;
      questionText = `Evaluate the principal square root: $$\\sqrt{${sq}}$$`;
      correctAnswer = `$${root}$`;
      rawDistractors = generateNumericalDistractors(root, prng).map(d => `$${d}$`);
      given = `Radicand $${sq}$.`;
      required = `$\\sqrt{${sq}}$.`;
      method = `Find the positive number which squared equals $${sq}$.`;
      steps = [`$${root}^2 = ${sq} \\implies \\sqrt{${sq}} = ${root}$.`];
      conclusion = `$\\sqrt{${sq}} = ${root}$.`;
      hint = `What positive number multiplied by itself gives $${sq}$?`;
    } else if (subtopicIndex === 4) {
      // 5. Cubes
      const base = prng.int(2, 6);
      const cube = base * base * base;
      questionText = `Evaluate the cube: $$${base}^3$$`;
      correctAnswer = `$${cube}$`;
      rawDistractors = generateNumericalDistractors(cube, prng).map(d => `$${d}$`);
      given = `Base $${base}$.`;
      required = `$${base}^3 = ${base} \\times ${base} \\times ${base}$.`;
      method = `Multiply $${base}$ by itself three times.`;
      steps = [`$${base} \\times ${base} = ${base * base}$, and $${base * base} \\times ${base} = ${cube}$.`];
      conclusion = `$${base}^3 = ${cube}$.`;
      hint = `Multiply the number by itself, then multiply by the number again.`;
    } else if (subtopicIndex === 5) {
      // 6. Cube Roots
      const root = prng.int(2, 6);
      const cube = root * root * root;
      questionText = `Evaluate the cube root: $$\\sqrt[3]{${cube}}$$`;
      correctAnswer = `$${root}$`;
      rawDistractors = generateNumericalDistractors(root, prng).map(d => `$${d}$`);
      given = `Radicand $${cube}$.`;
      required = `$\\sqrt[3]{${cube}}$.`;
      method = `Find the number whose cube is $${cube}$: $${root}^3 = ${cube}$.`;
      steps = [`$${root} \\times ${root} \\times ${root} = ${cube} \\implies \\sqrt[3]{${cube}} = ${root}$.`];
      conclusion = `$\\sqrt[3]{${cube}} = ${root}$.`;
      hint = `What number multiplied by itself three times gives $${cube}$?`;
    } else if (subtopicIndex === 6) {
      // 7. Rounding Range Riddle
      const targetTen = prng.int(4, 9) * 10;
      const minVal = targetTen - 5;
      questionText = `What is the smallest whole number that rounds to $${targetTen}$ when rounded to the nearest ten?`;
      correctAnswer = `$${minVal}$`;
      rawDistractors = [`$${targetTen - 4}$`, `$${targetTen - 10}$`, `$${targetTen}$`];
      given = `Rounded target $${targetTen}$.`;
      required = `Smallest integer rounding to $${targetTen}$.`;
      method = `Integers from $${targetTen} - 5$ to $${targetTen} + 4$ round to $${targetTen}$. The smallest is $${minVal}$.`;
      steps = [`$${minVal}$ has units digit $5$, rounding up to $${targetTen}$.`];
      conclusion = `The smallest integer is $${minVal}$.`;
      hint = `Any number ending in 5 rounds UP to the next multiple of 10.`;
    } else if (subtopicIndex === 7) {
      // 8. Distributive Property Law
      const a = prng.int(3, 7);
      const b = prng.int(4, 9);
      const c = prng.int(2, 6);
      questionText = `By the distributive property of multiplication over addition, $${a} \\times (${b} + ${c})$ is identically equal to:`;
      correctAnswer = `$(${a} \\times ${b}) + (${a} \\times ${c})$`;
      rawDistractors = [
        `$(${a} + ${b}) \\times (${a} + ${c})$`,
        `$${a} \\times ${b} + ${c}$`,
        `$(${a} \\times ${b}) \\times ${c}$`,
      ];
      given = `Expression $${a} \\times (${b} + ${c})$.`;
      required = `Expanded distributive identity.`;
      method = `The distributive property distributes multiplication over each term in the sum: $a(b + c) = ab + ac$.`;
      steps = [`$${a} \\times (${b} + ${c}) = (${a} \\times ${b}) + (${a} \\times ${c})$.`];
      conclusion = `$(${a} \\times ${b}) + (${a} \\times ${c})$.`;
      hint = `Multiply the outside number by each number inside the parentheses.`;
    } else if (subtopicIndex === 8) {
      // 9. Square Root Interval Estimation
      const rootFloor = prng.int(4, 10);
      const sq1 = rootFloor * rootFloor;
      const sq2 = (rootFloor + 1) * (rootFloor + 1);
      const inside = prng.int(sq1 + 1, sq2 - 1);
      questionText = `Between which two consecutive integers does $\\sqrt{${inside}}$ lie?`;
      correctAnswer = `$${rootFloor} \\text{ and } ${rootFloor + 1}$`;
      rawDistractors = [
        `$${rootFloor - 1} \\text{ and } ${rootFloor}$`,
        `$${rootFloor + 1} \\text{ and } ${rootFloor + 2}$`,
        `$${sq1} \\text{ and } ${sq2}$`,
      ];
      given = `Surd $\\sqrt{${inside}}$.`;
      required = `Consecutive integer bounds.`;
      method = `Since $${sq1} < ${inside} < ${sq2}$, taking square roots gives $${rootFloor} < \\sqrt{${inside}} < ${rootFloor + 1}$.`;
      steps = [`$${rootFloor}^2 = ${sq1}$ and $${rootFloor + 1}^2 = ${sq2}$.`, `$\\sqrt{${sq1}} < \\sqrt{${inside}} < \\sqrt{${sq2}} \\implies ${rootFloor} < \\sqrt{${inside}} < ${rootFloor + 1}$.`];
      conclusion = `It lies between $${rootFloor}$ and $${rootFloor + 1}$.`;
      hint = `Find the perfect squares immediately below and above $${inside}$.`;
    } else {
      // 10. Commutative Property of Addition and Multiplication
      const a = prng.pick([3, 4, 5, 6, 7]);
      const b = prng.pick([8, 9, 11, 12, 13]);
      questionText = `Which equation demonstrates the Commutative Property of Multiplication for the numbers $${a}$ and $${b}$?`;
      correctAnswer = `$${a} \\times ${b} = ${b} \\times ${a}$`;
      rawDistractors = [
        `$(${a} \\times ${b}) \\times 2 = ${a} \\times (${b} \\times 2)$`,
        `$${a} \\times (${b} + 1) = ${a} \\times ${b} + ${a}$`,
        `$${a} \\times 1 = ${a}$`,
      ];
      given = `Operands $${a}$ and $${b}$.`;
      required = `Commutative identity.`;
      method = `The commutative property states that changing the order of operands does not change the result: $a \\times b = b \\times a$.`;
      steps = [`$${a} \\times ${b} = ${a * b}$ and $${b} \\times ${a} = ${a * b}$.`];
      conclusion = `$${a} \\times ${b} = ${b} \\times ${a}$ demonstrates commutativity.`;
      hint = `Commutative means swapping the order of factors: $a \\times b = b \\times a$.`;
    }
  }

  else if (stageId === 9) {
    // Order of Operations (PEMDAS/BODMAS) & Precedence: 10 Distinct Principles
    if (subtopicIndex === 0) {
      // 1. Brackets Priority
      const a = prng.int(3, 8);
      const b = prng.int(2, 6);
      const c = prng.int(3, 7);
      const ans = a * (b + c);
      questionText = `Evaluate using order of operations (brackets first): $$${a} \\times (${b} + ${c})$$`;
      correctAnswer = `$${ans}$`;
      const badAns = a * b + c;
      rawDistractors = [`$${badAns}$`, `$${ans + a}$`, `$${ans - b}$`];
      given = `Expression $${a} \\times (${b} + ${c})$.`;
      required = `Numerical result.`;
      method = `Perform the operation inside parentheses first: $${b} + ${c} = ${b + c}$, then multiply by $${a}$.`;
      steps = [`Inside brackets: $${b} + ${c} = ${b + c}$.`, `Multiply: $${a} \\times ${b + c} = ${ans}$.`];
      conclusion = `The value is $${ans}$.`;
      hint = `Always calculate expressions inside parentheses first!`;
    } else if (subtopicIndex === 1) {
      // 2. Exponents Before Multiplication
      const a = prng.int(2, 5);
      const b = prng.int(2, 4);
      const c = prng.int(2, 3);
      const cSq = c * c;
      const ans = a + b * cSq;
      questionText = `Evaluate the expression: $$${a} + ${b} \\times ${c}^2$$`;
      correctAnswer = `$${ans}$`;
      const badAns = (a + b) * cSq;
      rawDistractors = [`$${badAns}$`, `$${a + (b * c) * (b * c)}$`, `$${ans + 2}$`];
      given = `Expression $${a} + ${b} \\times ${c}^2$.`;
      required = `Calculated value.`;
      method = `Powers take precedence over multiplication and addition: evaluate $${c}^2 = ${cSq}$, then multiply by $${b}$, then add $${a}$.`;
      steps = [
        `Power: $${c}^2 = ${cSq}$.`,
        `Multiplication: $${b} \\times ${cSq} = ${b * cSq}$.`,
        `Addition: $${a} + ${b * cSq} = ${ans}$.`,
      ];
      conclusion = `The value is $${ans}$.`;
      hint = `Evaluate powers before multiplication, and multiplication before addition!`;
    } else if (subtopicIndex === 2) {
      // 3. Multiplication and Division Left-to-Right
      const b = prng.pick([2, 3, 4]);
      const k = prng.int(3, 8);
      const c = prng.int(2, 5);
      const a = b * k;
      const ans = (a / b) * c;
      questionText = `Evaluate from left to right: $$${a} \\div ${b} \\times ${c}$$`;
      correctAnswer = `$${ans}$`;
      const badAns = Math.round(a / (b * c));
      rawDistractors = [`$${badAns}$`, `$${ans + c}$`, `$${Math.max(1, ans - c)}$`];
      given = `Expression $${a} \\div ${b} \\times ${c}$.`;
      required = `Numerical value.`;
      method = `Multiplication and division have equal precedence; evaluate strictly from left to right.`;
      steps = [`Divide first: $${a} \\div ${b} = ${k}$.`, `Multiply: $${k} \\times ${c} = ${ans}$.`];
      conclusion = `The result is $${ans}$.`;
      hint = `When multiplication and division appear together, work strictly from left to right.`;
    } else if (subtopicIndex === 3) {
      // 4. Nested Brackets
      const a = prng.int(2, 4);
      const b = prng.int(5, 9);
      const c = prng.int(2, 4);
      const d = prng.int(2, 3);
      const inner = b - c;
      const ans = (a + inner) * d;
      questionText = `Evaluate the nested expression: $$[${a} + (${b} - ${c})] \\times ${d}$$`;
      correctAnswer = `$${ans}$`;
      rawDistractors = generateNumericalDistractors(ans, prng).map(x => `$${x}$`);
      given = `Expression $[${a} + (${b} - ${c})] \\times ${d}$.`;
      required = `Simplified result.`;
      method = `Innermost parentheses first: $${b} - ${c} = ${inner}$. Outer square brackets: $${a} + ${inner} = ${a + inner}$. Multiply by $${d}$.`;
      steps = [
        `Innermost: $${b} - ${c} = ${inner}$.`,
        `Brackets: $${a} + ${inner} = ${a + inner}$.`,
        `Multiply: $${a + inner} \\times ${d} = ${ans}$.`,
      ];
      conclusion = `The evaluated value is $${ans}$.`;
      hint = `Resolve the innermost parentheses before the outer brackets.`;
    } else if (subtopicIndex === 4) {
      // 5. Absolute Value in Arithmetic
      const x = prng.int(4, 9);
      const y = prng.int(10, 16);
      const diff = Math.abs(x - y);
      const mult = prng.int(2, 4);
      const ans = diff * mult;
      questionText = `Evaluate the expression containing absolute value: $$|${x} - ${y}| \\times ${mult}$$`;
      correctAnswer = `$${ans}$`;
      rawDistractors = [`$${-(ans)}$`, `$${(x - y) * mult}$`, `$${ans + mult}$`];
      given = `Expression $|${x} - ${y}| \\times ${mult}$.`;
      required = `Evaluated value.`;
      method = `Compute inside absolute value bars: $${x} - ${y} = ${x - y}$. The absolute value is $|${x - y}| = ${diff}$. Then multiply by $${mult}$.`;
      steps = [`Inside: $${x} - ${y} = ${x - y}$.`, `Magnitude: $|${x - y}| = ${diff}$.`, `Multiply: $${diff} \\times ${mult} = ${ans}$.`];
      conclusion = `The value is $${ans}$.`;
      hint = `Evaluate inside the bars first, make it positive, then multiply.`;
    } else if (subtopicIndex === 5) {
      // 6. Fractional Fraction Bar Precedence
      const num1 = prng.int(10, 25);
      const num2 = prng.int(5, 15);
      const denom = prng.pick([2, 3, 4, 5]);
      const sum = num1 + num2;
      const roundedSum = Math.ceil(sum / denom) * denom;
      const actualNum1 = roundedSum - num2;
      const ans = roundedSum / denom;
      questionText = `Evaluate the fraction as grouped division: $$\\frac{${actualNum1} + ${num2}}{${denom}}$$`;
      correctAnswer = `$${ans}$`;
      rawDistractors = generateNumericalDistractors(ans, prng).map(x => `$${x}$`);
      given = `Fraction $\\frac{${actualNum1} + ${num2}}{${denom}}$.`;
      required = `Evaluated integer.`;
      method = `The horizontal fraction bar acts as a grouping symbol: evaluate numerator first, then divide.`;
      steps = [`Numerator: $${actualNum1} + ${num2} = ${roundedSum}$.`, `Divide: $${roundedSum} \\div ${denom} = ${ans}$.`];
      conclusion = `The value is $${ans}$.`;
      hint = `Add the entire top numerator before dividing by the bottom denominator.`;
    } else if (subtopicIndex === 6) {
      // 7. Power of Sum vs Sum of Powers
      const a = prng.int(2, 4);
      const b = prng.int(2, 3);
      const ans = Math.pow(a + b, 2);
      questionText = `Evaluate the power of a sum: $$(${a} + ${b})^2$$`;
      correctAnswer = `$${ans}$`;
      const badAns = a * a + b * b;
      rawDistractors = [`$${badAns}$`, `$${ans + 2}$`, `$${2 * (a + b)}$`];
      given = `Expression $(${a} + ${b})^2$.`;
      required = `Evaluated integer.`;
      method = `Parentheses first: $${a} + ${b} = ${a + b}$. Then square the result: $${a + b}^2 = ${ans}$.`;
      steps = [`Brackets: $${a} + ${b} = ${a + b}$.`, `Square: $${a + b} \\times ${a + b} = ${ans}$.`];
      conclusion = `The value is $${ans}$.`;
      hint = `Add the numbers inside the brackets first, then square that sum!`;
    } else if (subtopicIndex === 7) {
      // 8. Multiple Subtractions Left-to-Right
      const a = prng.int(40, 90);
      const b = prng.int(10, 25);
      const c = prng.int(5, 15);
      const ans = a - b - c;
      questionText = `Evaluate the chained subtraction: $$${a} - ${b} - ${c}$$`;
      correctAnswer = `$${ans}$`;
      const badAns = a - (b - c);
      rawDistractors = [`$${badAns}$`, `$${ans + 10}$`, `$${Math.max(1, ans - 5)}$`];
      given = `Expression $${a} - ${b} - ${c}$.`;
      required = `Final difference.`;
      method = `Sequential subtraction proceeds strictly from left to right.`;
      steps = [`First subtraction: $${a} - ${b} = ${a - b}$.`, `Second subtraction: $${a - b} - ${c} = ${ans}$.`];
      conclusion = `The result is $${ans}$.`;
      hint = `Subtract from left to right: do $${a} - ${b}$ first, then subtract $${c}$.`;
    } else if (subtopicIndex === 8) {
      // 9. Mixed Exponent and Product
      const a = prng.int(2, 5);
      const b = prng.int(2, 4);
      const c = prng.int(2, 3);
      const d = prng.int(1, 3);
      const ans = a * a + b * c - d;
      questionText = `Evaluate using full BODMAS precedence: $$${a}^2 + ${b} \\times ${c} - ${d}$$`;
      correctAnswer = `$${ans}$`;
      rawDistractors = generateNumericalDistractors(ans, prng).map(x => `$${x}$`);
      given = `Expression $${a}^2 + ${b} \\times ${c} - ${d}$.`;
      required = `Simplified integer.`;
      method = `Exponent first ($${a}^2 = ${a * a}$), then product ($${b} \\times ${c} = ${b * c}$), then addition and subtraction left-to-right.`;
      steps = [
        `Exponent: $${a}^2 = ${a * a}$.`,
        `Product: $${b} \\times ${c} = ${b * c}$.`,
        `Combine: $${a * a} + ${b * c} - ${d} = ${ans}$.`,
      ];
      conclusion = `The result is $${ans}$.`;
      hint = `Calculate the square first, then the multiplication, then combine left-to-right.`;
    } else {
      // 10. Applied Real-World Order of Operations Invoice
      const n1 = prng.int(3, 6);
      const p1 = prng.int(4, 9);
      const n2 = prng.int(2, 4);
      const p2 = prng.int(5, 12);
      const discount = prng.int(2, 5);
      const ans = n1 * p1 + n2 * p2 - discount;
      questionText = `A student buys $${n1}$ notebooks at $\\text{\\$} ${p1}$ each and $${n2}$ calculators at $\\text{\\$} ${p2}$ each, using a $\\text{\\$} ${discount}$ coupon. What is the total cost?`;
      correctAnswer = `$\\text{\\$} ${ans}$`;
      rawDistractors = [`$\\text{\\$} ${ans + discount * 2}$`, `$\\text{\\$} ${ans - 4}$`, `$\\text{\\$} ${n1 * p1 + n2 * p2}$`];
      given = `$${n1}$ at $\\text{\\$} ${p1}$, $${n2}$ at $\\text{\\$} ${p2}$, minus discount $\\text{\\$} ${discount}$.`;
      required = `Total bill.`;
      method = `Model as expression: $(${n1} \\times ${p1}) + (${n2} \\times ${p2}) - ${discount}$.`;
      steps = [
        `Notebooks: $${n1} \\times ${p1} = ${n1 * p1}$.`,
        `Calculators: $${n2} \\times ${p2} = ${n2 * p2}$.`,
        `Total before coupon: $${n1 * p1} + ${n2 * p2} = ${n1 * p1 + n2 * p2}$.`,
        `After coupon: $${n1 * p1 + n2 * p2} - ${discount} = ${ans}$.`,
      ];
      conclusion = `The total cost is $\\text{\\$} ${ans}$.`;
      hint = `Multiply quantities by unit prices first, sum them, then subtract the discount.`;
    }
  }

  else {
    // Stage 10: Number Foundations Synthesis Challenge: 10 Distinct Principles
    if (subtopicIndex === 0) {
      // 1. Multi-step Operations
      const a = prng.int(3, 8);
      const b = prng.int(2, 4);
      const c = prng.int(2, 4);
      const ans = a * b + c * c;
      questionText = `Evaluate the multi-step expression: $$${a} \\times ${b} + ${c}^2$$`;
      correctAnswer = `$${ans}$`;
      rawDistractors = generateNumericalDistractors(ans, prng).map(d => `$${d}$`);
      given = `Expression $${a} \\times ${b} + ${c}^2$.`;
      required = `Simplified value.`;
      method = `Exponents first ($${c}^2 = ${c * c}$), then multiplication ($${a} \\times ${b} = ${a * b}$), then add.`;
      steps = [
        `$${c}^2 = ${c * c}$.`,
        `$${a} \\times ${b} = ${a * b}$.`,
        `Sum: $${a * b} + ${c * c} = ${ans}$.`,
      ];
      conclusion = `The value is $${ans}$.`;
      hint = `Evaluate powers first, then multiplication, then add.`;
    } else if (subtopicIndex === 1) {
      // 2. LCM + GCF Synthesis
      const a = prng.pick([6, 8, 12]);
      const b = prng.pick([9, 10, 15]);
      const g = gcd(a, b);
      const l = lcm(a, b);
      const ans = l + g;
      questionText = `For the integers $${a}$ and $${b}$, find the sum of their Least Common Multiple (LCM) and Greatest Common Factor (GCF):\n\n$$\\text{LCM}(${a}, ${b}) + \\gcd(${a}, ${b})$$`;
      correctAnswer = `$${ans}$`;
      rawDistractors = [`$${l}$`, `$${ans + g}$`, `$${l - g}$`];
      given = `Integers $${a}$ and $${b}$.`;
      required = `$\\text{LCM} + \\gcd$.`;
      method = `Find $\\gcd(${a}, ${b}) = ${g}$ and $\\text{LCM}(${a}, ${b}) = \\frac{${a} \\times ${b}}{${g}} = ${l}$. Sum: $${l} + ${g} = ${ans}$.`;
      steps = [`$\\gcd(${a}, ${b}) = ${g}$.`, `$\\text{LCM}(${a}, ${b}) = ${l}$.`, `Sum: $${l} + ${g} = ${ans}$.`];
      conclusion = `The sum is $${ans}$.`;
      hint = `Find the greatest common factor and least common multiple separately, then add them.`;
    } else if (subtopicIndex === 2) {
      // 3. Balance Equation Missing Addend
      const a = prng.int(15, 30);
      const b = prng.int(10, 25);
      const c = prng.int(12, 28);
      const x = (a + b) - c;
      questionText = `Find the value of $x$ that balances the arithmetic equation: $$${a} + ${b} = ${c} + x$$`;
      correctAnswer = `$${x}$`;
      rawDistractors = generateNumericalDistractors(x, prng).map(d => `$${d}$`);
      given = `Equation $${a} + ${b} = ${c} + x$.`;
      required = `Value of $x$.`;
      method = `Compute left sum: $${a} + ${b} = ${a + b}$. Subtract $${c}$: $x = ${a + b} - ${c} = ${x}$.`;
      steps = [`Left side sum: $${a + b}$.`, `$x = ${a + b} - ${c} = ${x}$.`];
      conclusion = `$x = ${x}$.`;
      hint = `Add the two numbers on the left, then subtract the number on the right.`;
    } else if (subtopicIndex === 3) {
      // 4. Three-Digit Mystery
      const h = prng.int(2, 8);
      const t = prng.int(1, 9);
      const u = prng.int(0, 9);
      const num = h * 100 + t * 10 + u;
      questionText = `A 3-digit number has hundreds digit $${h}$, tens digit $${t}$, and units digit $${u}$. What is this number?`;
      correctAnswer = `$${num}$`;
      rawDistractors = [`$${t * 100 + h * 10 + u}$`, `$${h * 100 + u * 10 + t}$`, `$${h + t + u}$`];
      given = `Hundreds: $${h}$, Tens: $${t}$, Units: $${u}$.`;
      required = `Complete integer.`;
      method = `Multiply each digit by its positional base-10 weight: $${h} \\times 100 + ${t} \\times 10 + ${u} = ${num}$.`;
      steps = [`$${h}00 + ${t}0 + ${u} = ${num}$.`];
      conclusion = `The integer is $${num}$.`;
      hint = `Write digits in order: hundreds, tens, units.`;
    } else if (subtopicIndex === 4) {
      // 5. Prime Factorization Exponent Sum
      const p1 = 2;
      const p2 = 3;
      const e1 = prng.int(1, 3);
      const e2 = prng.int(1, 2);
      const N = Math.pow(p1, e1) * Math.pow(p2, e2);
      const ans = e1 + e2;
      questionText = `The prime factorization of $${N}$ is $2^a \\times 3^b$. What is the sum of the exponents $a + b$?`;
      correctAnswer = `$${ans}$`;
      rawDistractors = [`$${ans + 1}$`, `$${Math.max(1, ans - 1)}$`, `$${e1 * e2}$`];
      given = `$N = ${N} = 2^a \\times 3^b$.`;
      required = `$a + b$.`;
      method = `Factor $${N}$: $2^{${e1}} \\times 3^{${e2}}$, so $a = ${e1}$ and $b = ${e2}$. Sum is $${e1} + ${e2} = ${ans}$.`;
      steps = [`$${N} = 2^{${e1}} \\times 3^{${e2}}$.`, `$a + b = ${e1} + ${e2} = ${ans}$.`];
      conclusion = `The exponent sum is $${ans}$.`;
      hint = `Break down $${N}$ into prime factors and count how many times 2 and 3 divide it.`;
    } else if (subtopicIndex === 5) {
      // 6. Remainder Theorem
      const d = prng.pick([4, 5, 6, 7, 8]);
      const q = prng.int(5, 12);
      const r = prng.int(1, d - 1);
      const N = d * q + r;
      questionText = `When $${N}$ is divided by $${d}$, what is the remainder?`;
      correctAnswer = `$${r}$`;
      const dist = [0, 1, 2, 3, 4, 5, 6, 7].filter(x => x !== r && x < d).slice(0, 3);
      rawDistractors = dist.map(x => `$${x}$`);
      given = `Dividend $${N}$, divisor $${d}$.`;
      required = `Remainder.`;
      method = `Quotient $${N} = ${d} \\times ${q} + ${r}$, where remainder $0 \\le r < ${d}$.`;
      steps = [`$${d} \\times ${q} = ${d * q}$.`, `$${N} - ${d * q} = ${r}$.`];
      conclusion = `The remainder is $${r}$.`;
      hint = `Find the largest multiple of $${d}$ less than or equal to $${N}$ and subtract it.`;
    } else if (subtopicIndex === 6) {
      // 7. Consecutive Integers Sum Riddle
      const start = prng.int(5, 20);
      const sum = start + (start + 1) + (start + 2);
      questionText = `The sum of three consecutive integers is $${sum}$. What is the smallest of these three integers?`;
      correctAnswer = `$${start}$`;
      rawDistractors = [`$${start + 1}$`, `$${start + 2}$`, `$${start - 1}$`];
      given = `Sum of $n + (n + 1) + (n + 2) = ${sum}$.`;
      required = `Smallest integer $n$.`;
      method = `$3n + 3 = ${sum} \\implies 3n = ${sum - 3} \\implies n = ${start}$.`;
      steps = [`$3n + 3 = ${sum}$.`, `$3n = ${sum - 3}$.`, `$n = ${start}$.`];
      conclusion = `The smallest integer is $${start}$.`;
      hint = `Let the numbers be $n, n+1, n+2$. Set their sum equal to $${sum}$.`;
    } else if (subtopicIndex === 7) {
      // 8. Order of Operations with Negative Result
      const a = prng.int(4, 9);
      const b = prng.int(3, 6);
      const c = prng.int(3, 5);
      const prod = b * c;
      const ans = a - prod; // Negative
      questionText = `Evaluate using proper order of operations: $$${a} - ${b} \\times ${c}$$`;
      correctAnswer = `$${ans}$`;
      const badAns = (a - b) * c;
      rawDistractors = [`$${badAns}$`, `$${ans + 2}$`, `$${-ans}$`];
      given = `Expression $${a} - ${b} \\times ${c}$.`;
      required = `Evaluated integer.`;
      method = `Multiply first: $${b} \\times ${c} = ${prod}$. Then subtract: $${a} - ${prod} = ${ans}$.`;
      steps = [`Multiplication: $${b} \\times ${c} = ${prod}$.`, `Subtraction: $${a} - ${prod} = ${ans}$.`];
      conclusion = `The result is $${ans}$.`;
      hint = `Multiply before subtracting!`;
    } else if (subtopicIndex === 8) {
      // 9. Perfect Square Property
      const base = prng.int(7, 15);
      const sq = base * base;
      const d1 = sq + 2;
      const d2 = sq - 3;
      const d3 = sq + 5;
      questionText = `Which of the following numbers from the set $\\{${d2}, \\; ${sq}, \\; ${d1}, \\; ${d3}\\}$ is a perfect square?`;
      correctAnswer = `$${sq}$`;
      rawDistractors = [`$${d1}$`, `$${d2}$`, `$${d3}$`];
      given = `Four integers.`;
      required = `The unique perfect square.`;
      method = `A perfect square is the product of an integer with itself: $${base} \\times ${base} = ${sq}$.`;
      steps = [`$${base}^2 = ${sq}$, so $${sq}$ is a perfect square.`];
      conclusion = `$${sq}$ is the perfect square.`;
      hint = `Check which option is the square of a whole number ($${base} \\times ${base}$).`;
    } else {
      // 10. Applied Grouping / Division with Remainder Word Problem
      const students = prng.int(35, 60);
      const perTeam = prng.pick([4, 5, 6]);
      const teams = Math.floor(students / perTeam);
      const leftover = students % perTeam;
      questionText = `A school has $${students}$ students forming teams of $${perTeam}$. How many students are left over without a full team?`;
      correctAnswer = `$${leftover}$`;
      const altDist = [0, 1, 2, 3, 4, 5].filter(x => x !== leftover).slice(0, 3);
      rawDistractors = altDist.map(x => `$${x}$`);
      given = `$${students}$ students, $${perTeam}$ per team.`;
      required = `Remaining students.`;
      method = `Divide $${students} \\div ${perTeam} = ${teams}$ with a remainder of $${leftover}$.`;
      steps = [`$${teams} \\times ${perTeam} = ${teams * perTeam}$ students on full teams.`, `$${students} - ${teams * perTeam} = ${leftover}$ left over.`];
      conclusion = `There are $${leftover}$ students left over.`;
      hint = `Divide the total number of students by the team size to find the remainder.`;
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
