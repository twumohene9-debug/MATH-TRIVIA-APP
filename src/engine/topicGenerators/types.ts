import { DifficultyTier } from '../../types';
import { PRNG } from '../generators/shared';
import { QuestionBlueprint } from '../blueprints/types';

export interface GeneratedTopicArtifact {
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
 * Ensures distractors are strictly unique and never duplicate the correct answer.
 */
export function makeUniqueDistractors(
  correctAnswer: string,
  candidates: string[],
  prng: PRNG
): string[] {
  const seen = new Set<string>([correctAnswer.trim()]);
  const result: string[] = [];

  for (const c of candidates) {
    const trimmed = c.trim();
    if (!seen.has(trimmed) && trimmed.length > 0) {
      seen.add(trimmed);
      result.push(trimmed);
    }
    if (result.length >= 3) break;
  }

  // Fallback if needed
  let counter = 1;
  while (result.length < 3) {
    const dummy = `$${counter}$`;
    if (!seen.has(dummy)) {
      seen.add(dummy);
      result.push(dummy);
    }
    counter++;
  }

  return result.slice(0, 3);
}

export function sample<T>(prng: PRNG, arr: T[], count: number): T[] {
  return prng.shuffle([...arr]).slice(0, count);
}

/**
 * Formats a fraction in standardized KaTeX display format
 */
export function fmtFrac(num: number | string, den: number | string): string {
  return `\\dfrac{${num}}{${den}}`;
}

/**
 * Formats a mixed fraction
 */
export function fmtMixed(whole: number | string, num: number | string, den: number | string): string {
  return `${whole}\\dfrac{${num}}{${den}}`;
}

/**
 * Formats Ghanaian Cedi currency in standard math mode
 */
export function fmtCedis(amount: number | string): string {
  return `\\text{GH¢}${typeof amount === 'number' ? amount.toLocaleString() : amount}`;
}
