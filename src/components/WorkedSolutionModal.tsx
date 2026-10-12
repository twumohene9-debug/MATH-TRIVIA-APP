import React from 'react';
import { RotateCcw, XCircle, CheckCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { Question } from '../types';
import MathText from '../engine/mathRenderer';

interface WorkedSolutionModalProps {
  question: Question;
  userSelectedOption: string | null;
  isTimeout?: boolean;
  playerName?: string;
  onRetry: () => void;
  onExit: () => void;
}

export const WorkedSolutionModal: React.FC<WorkedSolutionModalProps> = ({
  question,
  userSelectedOption,
  isTimeout = false,
  playerName = 'Mathematician',
  onRetry,
  onExit,
}) => {
  const { solution } = question;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-rose-50 border-b border-rose-100 p-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-rose-950 font-display">
                {isTimeout ? 'Time Expired!' : 'Incorrect Answer'}
              </h3>
              <p className="text-xs text-rose-700">
                Don't worry, <strong>{playerName}</strong> — review the step-by-step worked solution below and retry with fresh questions!
              </p>
            </div>
          </div>
          <span className="text-xs font-mono-numbers bg-white text-slate-600 px-2.5 py-1 rounded-full border border-rose-200 font-semibold">
            {question.id}
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-sm">
          {/* Question Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">
                {question.area ? `${question.area} · ${question.topic}` : `Topic: ${question.topic}`}
              </span>
              {question.blueprint?.skill && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Skill: {question.blueprint.skill}
                </span>
              )}
            </div>
            <div className="text-base text-[#161c4f] font-semibold py-1">
              <MathText text={question.questionText} />
            </div>
          </div>

          {/* Options Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-900">
              <div className="text-xs text-rose-700 font-bold mb-1 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                Your Selection:
              </div>
              <div className="text-sm font-medium">
                {isTimeout ? (
                  <span className="italic text-slate-500">No answer submitted (Time out)</span>
                ) : userSelectedOption ? (
                  <MathText text={userSelectedOption} />
                ) : (
                  'None'
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950">
              <div className="text-xs text-emerald-700 font-bold mb-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Correct Answer:
              </div>
              <div className="text-sm font-bold">
                <MathText text={question.correctAnswer} />
              </div>
            </div>
          </div>

          {/* Step-by-Step Worked Solution */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#161c4f] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-pink-600" />
              Full Step-by-Step Worked Solution
            </h4>

            {solution.given && (
              <div>
                <span className="text-xs font-bold text-slate-600">1. Given: </span>
                <MathText text={solution.given} className="text-slate-800" />
              </div>
            )}

            {solution.required && (
              <div>
                <span className="text-xs font-bold text-slate-600">2. Required: </span>
                <MathText text={solution.required} className="text-slate-800" />
              </div>
            )}

            {solution.method && (
              <div>
                <span className="text-xs font-bold text-slate-600">3. Mathematical Method: </span>
                <MathText text={solution.method} className="text-slate-800" />
              </div>
            )}

            {solution.steps && solution.steps.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-600 mb-1.5">4. Detailed Steps:</div>
                <div className="space-y-1.5 pl-3 border-l-2 border-pink-400">
                  {solution.steps.map((st, i) => (
                    <div key={i} className="text-xs sm:text-sm text-slate-800">
                      <MathText text={st} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {question.blueprint?.expectedReasoning && (
              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 mt-2">
                <span className="font-bold text-amber-800 block mb-0.5">Core Mathematical Reasoning:</span>
                <p>{question.blueprint.expectedReasoning}</p>
              </div>
            )}

            {solution.conclusion && (
              <div className="pt-2 border-t border-slate-200 text-emerald-700 font-bold text-xs sm:text-sm">
                <span>5. Conclusion: </span>
                <MathText text={solution.conclusion} />
              </div>
            )}

            {solution.misconceptions && solution.misconceptions.length > 0 && (
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs text-rose-800 mt-2">
                <span className="font-bold block mb-0.5">Common Misconception:</span>
                {solution.misconceptions.map((m, idx) => (
                  <p key={idx}><MathText text={m} /></p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onExit}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Return to Level
          </button>
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#161c4f] to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-pink-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Block with Fresh Questions
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkedSolutionModal;
