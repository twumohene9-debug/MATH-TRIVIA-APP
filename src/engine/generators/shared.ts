import { DifficultyTier, Stage } from '../../types';

// Linear Congruential Generator for reproducible pseudo-random numbers
export class PRNG {
  private s: number;

  constructor(seed: number) {
    this.s = Math.abs(Math.floor(seed)) % 2147483647;
    if (this.s <= 0) this.s = 123456789;
  }

  next(): number {
    this.s = (this.s * 16807) % 2147483647;
    if (this.s <= 0) this.s = 123456789;
    return (this.s - 1) / 2147483647;
  }

  int(min: number, max: number): number {
    if (min >= max) return min;
    const v = Math.floor(this.next() * (max - min + 1)) + min;
    return Math.max(min, Math.min(max, v));
  }

  pick<T>(arr: T[]): T {
    if (!arr || arr.length === 0) throw new Error('Cannot pick from empty array');
    const idx = Math.max(0, Math.min(arr.length - 1, this.int(0, arr.length - 1)));
    return arr[idx] !== undefined ? arr[idx] : arr[0];
  }

  shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.max(0, Math.min(i, this.int(0, i)));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

// Greatest common divisor helper
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

// Least common multiple helper
export function lcm(a: number, b: number): number {
  return (Math.abs(a) * Math.abs(b)) / gcd(a, b);
}

// Generate unique, valid distractors around a numerical target
export function generateNumericalDistractors(
  target: number,
  prng: PRNG,
  isInteger = true,
  allowNegative = false,
  stepSize = 1
): [number, number, number] {
  const set = new Set<number>();
  const deltas = [stepSize, -stepSize, stepSize * 2, -stepSize * 2, 1, -1, 2, -2, 5, -5];

  let attempts = 0;
  while (set.size < 3 && attempts < 50) {
    attempts++;
    const choice = prng.pick(['delta', 'offset', 'step']);
    let candidate = target;

    if (choice === 'delta') {
      const d = prng.pick(deltas);
      candidate = target + d;
    } else if (choice === 'step') {
      candidate = target + prng.int(1, 3) * (prng.next() > 0.5 ? 1 : -1) * (stepSize || 1);
    } else {
      const offset = prng.int(1, 4) * (prng.next() > 0.5 ? 1 : -1);
      candidate = target + offset;
    }

    if (isInteger) candidate = Math.round(candidate);
    else candidate = parseFloat(candidate.toFixed(2));

    if (!allowNegative && candidate < 0) {
      candidate = Math.abs(candidate) + 1;
    }

    if (candidate !== target && !isNaN(candidate) && isFinite(candidate)) {
      set.add(candidate);
    }
  }

  let fallbackDelta = stepSize || 2;
  while (set.size < 3) {
    let val = target + fallbackDelta;
    if (!allowNegative && val < 0) val = target + Math.abs(fallbackDelta);
    if (val !== target) set.add(val);
    fallbackDelta += 2;
  }

  const arr = Array.from(set).slice(0, 3);
  return [arr[0], arr[1], arr[2]];
}

// Generates distractors for sequences ensuring NO terms already visible in the sequence are reused
export function generateSequenceDistractors(
  target: number,
  sequenceTerms: number[],
  stepSize: number,
  prng: PRNG
): string[] {
  const forbidden = new Set<number>([target, ...sequenceTerms]);
  const candidates: number[] = [
    target + stepSize,
    target - stepSize,
    target + stepSize * 2,
    target - stepSize * 2,
    target + 1,
    target - 1,
    target + 2,
    target - 2,
    target + (stepSize > 1 ? stepSize - 1 : 3),
    target + stepSize + 1,
    target + 5,
    target - 5,
    target + 10,
    target - 10,
  ];

  const valid: number[] = [];
  for (const c of candidates) {
    if (c > 0 && !forbidden.has(c) && !valid.includes(c)) {
      valid.push(c);
      if (valid.length >= 3) break;
    }
  }

  let fallback = target + (stepSize || 2) + 3;
  while (valid.length < 3) {
    if (fallback > 0 && !forbidden.has(fallback) && !valid.includes(fallback)) {
      valid.push(fallback);
    }
    fallback += 2;
  }

  return valid.slice(0, 3).map(v => `$${v}$`);
}

// Formats options into a randomized array of 3 options (stages 1-50) or 4 options (stages 51-100) while retaining correct answer index
export function buildOptions(
  correctStr: string,
  distractors: string[],
  prng: PRNG,
  optionCount: number = 4
): { options: string[]; correctIndex: number } {
  const neededDistractors = Math.max(1, optionCount - 1);
  // Ensure exactly neededDistractors distinct distractors that do not match the correct string
  const cleanDistractors: string[] = [];
  const seen = new Set<string>([correctStr]);

  for (const d of distractors) {
    if (d && !seen.has(d)) {
      seen.add(d);
      cleanDistractors.push(d);
      if (cleanDistractors.length === neededDistractors) break;
    }
  }

  // Fallback generation if fewer than needed unique distractors were provided
  let count = 1;
  while (cleanDistractors.length < neededDistractors) {
    let fallback = '';
    const intMatch = correctStr.match(/^\$(-?\d+)\$$/);
    const floatMatch = correctStr.match(/^\$(-?\d+\.\d+)\$$/);
    const dollarMatch = correctStr.match(/^\$\\text\{\\\$\}\s*(-?\d+(\.\d+)?)\$$/);
    const varMatch = correctStr.match(/^\$([a-zA-Z])\s*=\s*(-?\d+)\$$/);

    if (intMatch) {
      const baseVal = parseInt(intMatch[1], 10);
      const delta = count % 2 === 1 ? Math.ceil(count / 2) : -Math.ceil(count / 2);
      fallback = `$${baseVal + delta}$`;
    } else if (floatMatch) {
      const baseVal = parseFloat(floatMatch[1]);
      const delta = count % 2 === 1 ? 0.2 * Math.ceil(count / 2) : -0.2 * Math.ceil(count / 2);
      fallback = `$${(baseVal + delta).toFixed(1)}$`;
    } else if (dollarMatch) {
      const baseVal = parseFloat(dollarMatch[1]);
      const delta = count % 2 === 1 ? 5 * Math.ceil(count / 2) : -5 * Math.ceil(count / 2);
      fallback = `$\\text{\\$} ${Math.max(1, Math.round(baseVal + delta))}$`;
    } else if (varMatch) {
      const varName = varMatch[1];
      const baseVal = parseInt(varMatch[2], 10);
      const delta = count % 2 === 1 ? Math.ceil(count / 2) : -Math.ceil(count / 2);
      fallback = `$${varName} = ${baseVal + delta}$`;
    } else if (correctStr.startsWith('$') && correctStr.endsWith('$')) {
      const inner = correctStr.slice(1, -1);
      fallback = `$${inner} + ${count}$`;
    } else {
      fallback = `${correctStr} (${count})`;
    }

    if (fallback !== correctStr && !cleanDistractors.includes(fallback)) {
      cleanDistractors.push(fallback);
    }
    count++;
  }

  // Ensure needed fallback entries if still short
  while (cleanDistractors.length < neededDistractors) {
    cleanDistractors.push(`${correctStr} (${cleanDistractors.length + 1})`);
  }

  const allItems = [{ text: correctStr || '0', isCorrect: true }];
  for (let i = 0; i < neededDistractors; i++) {
    allItems.push({ text: cleanDistractors[i] || `${i + 1}`, isCorrect: false });
  }

  const shuffled = prng.shuffle(allItems);
  const correctIndex = shuffled.findIndex(item => item && item.isCorrect);

  return {
    options: shuffled.map(item => item?.text || '0'),
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  };
}

export interface GeneratorContext {
  stageId: number;
  levelId: number;
  blockId: number;
  questionIndex: number;
  subtopicIndex?: number;
  prng: PRNG;
  tierMultiplier: number;
  tier: DifficultyTier;
  stage: Stage;
}

export interface GeneratedQuestionDraft {
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
  principle?: string;
}
