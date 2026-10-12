import { QuestionType, QuestionBlueprint } from './types';

export interface TrackerContext {
  recentConceptKeys: Set<string>;
  recentQuestionTypes: QuestionType[];
  recentNumbers: Set<string>; // strings like "25_80"
  recentStems: Set<string>;
  recentTopics: Set<string>;
}

export class QuestionDiversityTracker {
  private recentConceptKeys: Set<string>;
  private recentQuestionTypes: QuestionType[];
  private recentNumbers: Set<string>;
  private recentStems: Set<string>;
  private recentTopics: Set<string>;

  constructor(params?: {
    recentConceptKeys?: string[];
    recentQuestionTypes?: string[];
    recentQuestionStems?: string[];
    recentTopics?: string[];
  }) {
    this.recentConceptKeys = new Set(
      (params?.recentConceptKeys || []).map(k => k.trim().toUpperCase())
    );
    this.recentQuestionTypes = (params?.recentQuestionTypes || []).map(
      t => t.trim() as QuestionType
    );
    this.recentNumbers = new Set<string>();
    this.recentStems = new Set(
      (params?.recentQuestionStems || []).map(s => s.trim().toLowerCase())
    );
    this.recentTopics = new Set(
      (params?.recentTopics || []).map(t => t.trim().toLowerCase())
    );
  }

  /**
   * Check whether a proposed blueprint is conceptually duplicated or too similar
   * to recent questions.
   */
  isDuplicate(blueprint: QuestionBlueprint, stemText: string): boolean {
    const cleanStem = stemText.trim().toLowerCase();
    if (this.recentStems.has(cleanStem)) {
      return true;
    }

    const normConcept = blueprint.conceptKey.trim().toUpperCase();
    const numKey = (blueprint.numbersUsed || []).slice(0, 3).sort((a, b) => a - b).join('_');

    // Strict conceptual duplicate check: Same concept key AND same key numbers
    if (numKey && this.recentNumbers.has(`${normConcept}:${numKey}`)) {
      return true;
    }

    return false;
  }

  /**
   * Recommends a preferred question type to maintain rich format rotation.
   */
  pickPreferredQuestionType(
    supportedTypes: QuestionType[],
    prngSeed: number
  ): QuestionType {
    if (supportedTypes.length === 1) return supportedTypes[0];

    // Count recent occurrences
    const last3Types = this.recentQuestionTypes.slice(0, 3);
    const available = supportedTypes.filter(t => !last3Types.includes(t));

    const pool = available.length > 0 ? available : supportedTypes;
    const idx = Math.abs(prngSeed) % pool.length;
    return pool[idx];
  }

  /**
   * Record a successfully selected question into the tracker.
   */
  record(blueprint: QuestionBlueprint, stemText: string) {
    const cleanStem = stemText.trim().toLowerCase();
    this.recentStems.add(cleanStem);

    const normConcept = blueprint.conceptKey.trim().toUpperCase();
    this.recentConceptKeys.add(normConcept);

    const numKey = (blueprint.numbersUsed || []).slice(0, 3).sort((a, b) => a - b).join('_');
    if (numKey) {
      this.recentNumbers.add(`${normConcept}:${numKey}`);
    }

    this.recentQuestionTypes.unshift(blueprint.questionType);
    if (this.recentQuestionTypes.length > 20) {
      this.recentQuestionTypes.pop();
    }

    this.recentTopics.add(blueprint.subtopic.trim().toLowerCase());
  }

  getRecentConcepts(): string[] {
    return Array.from(this.recentConceptKeys);
  }

  getRecentTypes(): string[] {
    return this.recentQuestionTypes;
  }
}
