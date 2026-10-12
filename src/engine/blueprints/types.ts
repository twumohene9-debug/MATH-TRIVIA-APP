import { DifficultyTier } from '../../types';

export type QuestionType =
  | 'direct_calculation'
  | 'reverse_operation'
  | 'missing_value'
  | 'comparison'
  | 'ordering'
  | 'identification'
  | 'pattern_recognition'
  | 'multi_step'
  | 'word_problem'
  | 'error_analysis'
  | 'reasoning'
  | 'interpretation'
  | 'estimation'
  | 'graph_table'
  | 'modelling';

export type RepresentationType =
  | 'equation'
  | 'numerical'
  | 'word_problem'
  | 'data_table'
  | 'coordinate_pair'
  | 'coordinate_plane'
  | 'geometric_diagram'
  | 'diagram_description'
  | 'number_line'
  | 'scenario'
  | 'set_notation'
  | 'list'
  | 'algebraic_form'
  | 'place_value'
  | 'definition'
  | 'inequality'
  | '3D_polyhedron'
  | 'graph_description'
  | 'scatter_plot_description';

export interface QuestionBlueprint {
  mainTopic: string;
  subtopic: string;
  skill: string;
  questionType: QuestionType;
  difficulty: DifficultyTier;
  mathematicalOperation: string;
  representation: RepresentationType;
  context: string;
  numbersUsed: number[];
  expectedReasoning: string;
  conceptKey: string;
}

export interface SkillArchetype {
  id: string;
  skillName: string;
  supportedQuestionTypes: QuestionType[];
  preferredRepresentations: RepresentationType[];
  conceptKey: string;
  generate: (params: {
    difficulty: DifficultyTier;
    questionType: QuestionType;
    seed: number;
    recentNumbers?: number[];
  }) => {
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
  } | null;
}
