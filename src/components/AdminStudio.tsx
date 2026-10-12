import React, { useState, useMemo } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Download,
  Upload,
  FileJson,
  Copy,
  Check,
  RefreshCw,
  BookOpen,
  Search,
  Sparkles,
} from 'lucide-react';
import { Question, DifficultyTier } from '../types';
import { STAGES } from '../data/worldsAndStages';
import { loadCustomQuestions, saveCustomQuestions } from '../engine/storage';
import { validateQuestion } from '../engine/questionBank';
import { CURRICULUM_AREAS, CURRICULUM_1000_NAMES, getCurriculumTopic } from '../data/curriculum1000';
import { generateQuestion } from '../engine/questionGenerators';
import MathText from '../engine/mathRenderer';

interface AdminStudioProps {
  onBack: () => void;
}

export const AdminStudio: React.FC<AdminStudioProps> = ({ onBack }) => {
  const [customQuestions, setCustomQuestions] = useState<Question[]>(loadCustomQuestions());
  const [activeTab, setActiveTab] = useState<'author' | 'list' | 'katex_sandbox' | 'import_export' | 'curriculum'>('author');

  // Curriculum Explorer state
  const [curriculumAreaFilter, setCurriculumAreaFilter] = useState<number>(0); // 0 = all, 1-10 = areas
  const [curriculumSearch, setCurriculumSearch] = useState<string>('');
  const [previewTopicQuestion, setPreviewTopicQuestion] = useState<Question | null>(null);
  const [testingTopicId, setTestingTopicId] = useState<number | null>(null);

  // Form states
  const [stageId, setStageId] = useState<number>(1);
  const [levelId, setLevelId] = useState<number>(1);
  const [blockId, setBlockId] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<DifficultyTier>('foundation');
  const [questionText, setQuestionText] = useState<string>('Solve for $x$: $$3x + 12 = 36$$');
  const [optA, setOptA] = useState<string>('$x = 8$');
  const [optB, setOptB] = useState<string>('$x = 6$');
  const [optC, setOptC] = useState<string>('$x = 10$');
  const [optD, setOptD] = useState<string>('$x = 12$');
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [hint, setHint] = useState<string>('Subtract $12$ from both sides first, then divide by $3$.');
  const [given, setGiven] = useState<string>('Equation $3x + 12 = 36$.');
  const [required, setRequired] = useState<string>('Value of unknown $x$.');
  const [method, setMethod] = useState<string>('Isolate $x$ using inverse operations.');
  const [stepsText, setStepsText] = useState<string>(
    'Subtract 12: $3x = 36 - 12 = 24$.\nDivide by 3: $x = \\frac{24}{3} = 8$.'
  );
  const [conclusion, setConclusion] = useState<string>('Therefore $x = 8$.');

  // Sandbox state
  const [sandboxLatex, setSandboxLatex] = useState<string>(
    '\\int_0^\\pi \\sin(x) \\, dx = [-\\cos(x)]_0^\\pi = 2'
  );

  // Bulk Import/Export state
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [copiedExport, setCopiedExport] = useState<boolean>(false);
  const [showConfirmReplace, setShowConfirmReplace] = useState<boolean>(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const selectedStage = STAGES.find(s => s.id === stageId) || STAGES[0];

  const filteredCurriculumTopics = useMemo(() => {
    return CURRICULUM_1000_NAMES.map((name, index) => {
      const topicId = index + 1;
      const stage = Math.floor(index / 10) + 1;
      const world = Math.min(10, Math.floor((stage - 1) / 10) + 1);
      const subtopicSlot = index % 10;
      const area = CURRICULUM_AREAS[world - 1] || 'General Mathematics';
      return { topicId, name, stageId: stage, worldId: world, subtopicSlot, area };
    }).filter(t => {
      if (curriculumAreaFilter > 0 && t.worldId !== curriculumAreaFilter) return false;
      if (curriculumSearch.trim()) {
        const query = curriculumSearch.toLowerCase();
        return (
          t.name.toLowerCase().includes(query) ||
          t.topicId.toString().includes(query) ||
          t.area.toLowerCase().includes(query) ||
          `stage ${t.stageId}`.includes(query)
        );
      }
      return true;
    });
  }, [curriculumAreaFilter, curriculumSearch]);

  const handleTestGenerateTopic = (t: { stageId: number; subtopicSlot: number; topicId: number; name: string }) => {
    setTestingTopicId(t.topicId);
    const randomSeed = Date.now() + Math.floor(Math.random() * 100000);
    const q = generateQuestion(t.stageId, 1, 1, t.subtopicSlot, randomSeed);
    setPreviewTopicQuestion(q);
  };

  const handleAuthorForTopic = (t: { stageId: number; name: string; topicId: number }) => {
    setStageId(t.stageId);
    setLevelId(1);
    setBlockId(1);
    setQuestionText(`Question on ${t.name}...`);
    setActiveTab('author');
    setFeedbackMsg({
      type: 'success',
      text: `Configured authoring form for Stage ${t.stageId} covering Topic #${t.topicId}: ${t.name}`,
    });
  };

  const handleExportCopy = () => {
    try {
      const exportData = JSON.stringify(customQuestions, null, 2);
      navigator.clipboard.writeText(exportData);
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2000);
      setFeedbackMsg({ type: 'success', text: `Copied ${customQuestions.length} custom questions to clipboard.` });
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to copy to clipboard.' });
    }
  };

  const handleExportDownload = () => {
    try {
      const exportData = JSON.stringify(customQuestions, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `math_mastery_questions_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setFeedbackMsg({ type: 'success', text: `Downloaded ${customQuestions.length} custom questions.` });
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to download JSON file.' });
    }
  };

  const handleImportJson = (overrideMode: boolean = false) => {
    if (!importJsonText.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please paste JSON questions to import.' });
      return;
    }
    try {
      const parsed = JSON.parse(importJsonText);
      const items: any[] = Array.isArray(parsed) ? parsed : [parsed];
      if (items.length === 0) {
        setFeedbackMsg({ type: 'error', text: 'JSON array is empty.' });
        return;
      }
      const validQuestions: Question[] = [];
      const errors: string[] = [];

      items.forEach((item, index) => {
        const candidate: Question = {
          id: item.id || `custom-${Date.now()}-${index}`,
          stageId: Number(item.stageId) || 1,
          levelId: Number(item.levelId) || 1,
          blockId: Number(item.blockId) || 1,
          topic: item.topic || `Stage ${item.stageId || 1}`,
          principle: item.principle || `custom-${item.stageId || 1}`,
          difficulty: item.difficulty || 'developing',
          questionText: String(item.questionText || ''),
          options: Array.isArray(item.options) && item.options.length === 4
            ? [String(item.options[0]), String(item.options[1]), String(item.options[2]), String(item.options[3])]
            : ['A', 'B', 'C', 'D'],
          correctAnswer: String(item.correctAnswer || ''),
          correctIndex: Number(item.correctIndex) || 0,
          solution: item.solution || {
            given: item.given || '',
            required: item.required || '',
            method: item.method || '',
            steps: Array.isArray(item.steps) ? item.steps : [String(item.steps || '')],
            conclusion: item.conclusion || '',
          },
          hint: item.hint || '',
          isCustom: true,
        };

        const val = validateQuestion(candidate);
        if (val.isValid) {
          validQuestions.push(candidate);
        } else {
          errors.push(`Item ${index + 1}: ${val.error}`);
        }
      });

      if (validQuestions.length === 0) {
        setFeedbackMsg({ type: 'error', text: `No valid questions found: ${errors.slice(0, 3).join('; ')}` });
        return;
      }

      const merged = overrideMode ? validQuestions : [...customQuestions, ...validQuestions];
      saveCustomQuestions(merged);
      setCustomQuestions(merged);
      setImportJsonText('');
      setFeedbackMsg({
        type: 'success',
        text: `Successfully imported ${validQuestions.length} questions!${errors.length > 0 ? ` (${errors.length} invalid skipped)` : ''}`,
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: `Invalid JSON format: ${err?.message || 'Syntax error'}` });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      if (content) {
        setImportJsonText(content);
        setFeedbackMsg({ type: 'success', text: `File "${file.name}" loaded into editor. Review and click Import.` });
      }
    };
    reader.readAsText(file);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    const optionsList: [string, string, string, string] = [optA, optB, optC, optD];
    const stepsArray = stepsText.split('\n').filter(s => s.trim().length > 0);

    const newQ: Question = {
      id: `ADMIN-${Date.now().toString(36).toUpperCase()}`,
      stageId,
      levelId,
      blockId,
      topic: selectedStage.title,
      difficulty,
      questionText,
      options: optionsList,
      correctAnswer: optionsList[correctIndex],
      correctIndex,
      solution: {
        given,
        required,
        method,
        steps: stepsArray,
        conclusion,
      },
      hint,
      isCustom: true,
    };

    const validation = validateQuestion(newQ);
    if (!validation.isValid) {
      setFeedbackMsg({ type: 'error', text: validation.error || 'Question validation failed.' });
      return;
    }

    const updated = [newQ, ...customQuestions];
    setCustomQuestions(updated);
    saveCustomQuestions(updated);
    setFeedbackMsg({ type: 'success', text: `Question ${newQ.id} validated and published to Stage ${stageId}!` });
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = customQuestions.filter(q => q.id !== id);
    setCustomQuestions(updated);
    saveCustomQuestions(updated);
  };

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Adventure
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display flex items-center gap-2">
            <Shield className="w-6 h-6 text-rose-400" />
            Administrator Content Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Author and validate questions, test KaTeX mathematical notation, and inspect custom curriculum items
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('author')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'author' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Author Question
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'list' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Question Bank ({customQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('katex_sandbox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'katex_sandbox' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            KaTeX Sandbox
          </button>
          <button
            onClick={() => setActiveTab('import_export')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'import_export' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            Import / Export
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'curriculum' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            1,000 Topics Curriculum
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/60 border border-rose-500/50 text-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Authoring Tab */}
      {activeTab === 'author' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authoring Form */}
          <form onSubmit={handleSaveQuestion} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Question Authoring & Validation
            </h2>

            {/* Target Assignment */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Stage (1–100)
                </label>
                <select
                  value={stageId}
                  onChange={e => setStageId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  {STAGES.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.id}. {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Level (1–20)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={levelId}
                  onChange={e => setLevelId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Difficulty Tier
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as DifficultyTier)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value="foundation">Foundation</option>
                  <option value="developing">Developing</option>
                  <option value="advanced">Advanced</option>
                  <option value="mastery">Mastery</option>
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Question Text (use $...$ for inline LaTeX, $$...$$ for display)
              </label>
              <textarea
                rows={2}
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
              />
            </div>

            {/* 4 Options & Designation of Correct */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Four Alternatives (Select radio for correct answer)
              </label>
              <div className="space-y-2">
                {[
                  { val: optA, set: setOptA, idx: 0, letter: 'A' },
                  { val: optB, set: setOptB, idx: 1, letter: 'B' },
                  { val: optC, set: setOptC, idx: 2, letter: 'C' },
                  { val: optD, set: setOptD, idx: 3, letter: 'D' },
                ].map(item => (
                  <div key={item.idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctIdx"
                      checked={correctIndex === item.idx}
                      onChange={() => setCorrectIndex(item.idx)}
                      className="cursor-pointer"
                      title="Mark as correct"
                    />
                    <span className="text-xs font-bold text-slate-400 w-4">{item.letter}</span>
                    <input
                      type="text"
                      value={item.val}
                      onChange={e => item.set(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Hint */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Helpful Hint (Conceptual guide without giving away answer)
              </label>
              <input
                type="text"
                value={hint}
                onChange={e => setHint(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
              />
            </div>

            {/* Worked Solution Fields */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 block">5-Part Worked Solution</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="1. Given"
                  value={given}
                  onChange={e => setGiven(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="2. Required"
                  value={required}
                  onChange={e => setRequired(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <input
                type="text"
                placeholder="3. Mathematical Method"
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
              />
              <textarea
                rows={2}
                placeholder="4. Calculations (one step per line)"
                value={stepsText}
                onChange={e => setStepsText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
              />
              <input
                type="text"
                placeholder="5. Conclusion"
                value={conclusion}
                onChange={e => setConclusion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Validate & Save Question to Bank
            </button>
          </form>

          {/* Live Preview Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  Live KaTeX Player Preview
                </span>
                <span className="text-xs font-mono-numbers text-amber-400">
                  Stage {stageId} · {selectedStage.title}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
                <div className="text-sm sm:text-base font-medium text-white">
                  <MathText text={questionText} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {[optA, optB, optC, optD].map((opt, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      i === correctIndex
                        ? 'bg-emerald-950/30 border-emerald-600 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-bold text-slate-400">{['A', 'B', 'C', 'D'][i]}</span>
                    <span>
                      <MathText text={opt} inline />
                    </span>
                    {i === correctIndex && (
                      <span className="ml-auto text-[10px] text-emerald-400 font-bold uppercase">
                        (Correct)
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <div className="text-amber-400 font-bold text-[11px]">Hint Preview:</div>
                <MathText text={hint} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
              Questions added here are instantly saved to local storage and dynamically loaded whenever players play Stage {stageId}!
            </div>
          </div>
        </div>
      )}

      {/* Question Bank List Tab */}
      {activeTab === 'list' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4">
            Custom Administrator Questions ({customQuestions.length})
          </h2>
          {customQuestions.length === 0 ? (
            <div className="text-xs text-slate-400 py-8 text-center">
              No custom questions yet. Author new questions above to augment the procedural bank!
            </div>
          ) : (
            <div className="space-y-3">
              {customQuestions.map(q => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-xs font-mono-numbers text-slate-400">
                      <span className="text-amber-400 font-bold">Stage {q.stageId}</span>
                      <span>·</span>
                      <span>{q.topic}</span>
                      <span>·</span>
                      <span className="text-slate-500">{q.id}</span>
                    </div>
                    <div className="text-sm text-white font-medium">
                      <MathText text={q.questionText} />
                    </div>
                    <div className="text-xs text-emerald-400 font-medium">
                      Correct Answer: <MathText text={q.correctAnswer} inline />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* KaTeX Interactive Sandbox */}
      {activeTab === 'katex_sandbox' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Mathematical Notation Sandbox</h2>
          <p className="text-xs text-slate-400">
            Test arbitrary LaTeX formulas to confirm KaTeX compatibility before deploying.
          </p>

          <textarea
            rows={3}
            value={sandboxLatex}
            onChange={e => setSandboxLatex(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
            placeholder="Type LaTeX here..."
          />

          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 min-h-[100px] flex items-center justify-center">
            <MathText text={sandboxLatex} />
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            {[
              '\\frac{a}{b}',
              '\\sqrt{x^2 + y^2}',
              '\\sum_{k=1}^n k = \\frac{n(n+1)}{2}',
              '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1',
              '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
            ].map((snippet, idx) => (
              <button
                key={idx}
                onClick={() => setSandboxLatex(snippet)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition-colors"
              >
                {snippet}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bulk JSON Import / Export Tab */}
      {activeTab === 'import_export' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-bold text-white">Export Custom Questions</h2>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Export your authored custom question curriculum to share with other educators or back up to a JSON file.
                </p>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Total custom questions:</span>
                    <span className="font-bold text-amber-400 text-sm">{customQuestions.length}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Format: JSON array conforming to the Mathematical Curriculum Schema with KaTeX notation, multi-step solutions, and distractors.
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportCopy}
                  disabled={customQuestions.length === 0}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    customQuestions.length === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : copiedExport
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  }`}
                >
                  {copiedExport ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedExport ? 'Copied to Clipboard!' : 'Copy JSON'}
                </button>

                <button
                  type="button"
                  onClick={handleExportDownload}
                  disabled={customQuestions.length === 0}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    customQuestions.length === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Download .json File
                </button>
              </div>
            </div>

            {/* Import Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-base font-bold text-white">Import Questions via JSON</h2>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Paste a JSON array or upload a file. Each question is automatically verified against curriculum integrity and LaTeX standards.
                </p>

                {/* File Upload Trigger */}
                <div className="mb-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 cursor-pointer transition-colors">
                    <FileJson className="w-4 h-4 text-indigo-400" />
                    Load from file (.json)
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <textarea
                  rows={6}
                  value={importJsonText}
                  onChange={e => setImportJsonText(e.target.value)}
                  placeholder={`[\n  {\n    "stageId": 1,\n    "questionText": "What is $2 + 2$?",\n    "options": ["$3$", "$4$", "$5$", "$6$"],\n    "correctAnswer": "$4$",\n    "correctIndex": 1,\n    "hint": "Count up two units."\n  }\n]`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleImportJson(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Import & Append
                </button>

                {!showConfirmReplace ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmReplace(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace All
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-700/60 p-1.5 rounded-xl">
                    <span className="text-[11px] text-rose-200 px-2 font-medium">Overwrite all custom questions?</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleImportJson(true);
                        setShowConfirmReplace(false);
                      }}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Yes, Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmReplace(false)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-lg cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Schema & Example Documentation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Supported Question Schema Format
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Items must provide 4 multiple-choice options with exactly one matching <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">correctAnswer</code> and <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">correctIndex</code> (0-3). Mathematical expressions should be enclosed in dollar signs (<code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">$...$</code>).
            </p>
            <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`{
  "stageId": 48,
  "difficulty": "developing",
  "questionText": "Find the hypotenuse $c$ of a right triangle with legs $a = 3$ and $b = 4$:",
  "options": ["$5$", "$6$", "$7$", "$\\\\sqrt{7}$"],
  "correctAnswer": "$5$",
  "correctIndex": 0,
  "hint": "Apply the Pythagorean theorem: $a^2 + b^2 = c^2$.",
  "solution": {
    "given": "Legs $a = 3, b = 4$.",
    "required": "Hypotenuse $c$.",
    "method": "$c = \\\\sqrt{a^2 + b^2} = \\\\sqrt{9 + 16} = 5$.",
    "steps": ["$c = \\\\sqrt{25} = 5$."],
    "conclusion": "$c = 5$."
  }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* 1,000 Canonical Mathematics Curriculum Explorer */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-bold text-white">1,000 Mathematics Areas & Topics Curriculum</h2>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Every stage from 1 to 100 features 10 dedicated curriculum topics. Within any 10-question block, every question targets a distinct principle, guaranteeing zero repetition across blocks and retries.
                </p>
              </div>

              {/* Quick stats pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300">
                  <strong className="text-amber-400 font-bold">1,000</strong> Topics
                </span>
                <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300">
                  <strong className="text-pink-400 font-bold">10</strong> Areas
                </span>
                <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300">
                  <strong className="text-indigo-400 font-bold">100</strong> Stages
                </span>
              </div>
            </div>

            {/* Search and Area Filter Bar */}
            <div className="mt-5 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={curriculumSearch}
                  onChange={e => setCurriculumSearch(e.target.value)}
                  placeholder="Search among all 1,000 topics by keyword (e.g. Prime numbers, Interest, Hypotenuse, Derivative, Ratio)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Area Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <button
                  type="button"
                  onClick={() => setCurriculumAreaFilter(0)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    curriculumAreaFilter === 0
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  All 1,000 Topics ({filteredCurriculumTopics.length})
                </button>
                {CURRICULUM_AREAS.map((area, idx) => {
                  const areaNum = idx + 1;
                  const isSelected = curriculumAreaFilter === areaNum;
                  return (
                    <button
                      key={areaNum}
                      type="button"
                      onClick={() => setCurriculumAreaFilter(areaNum)}
                      className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-pink-600 text-white font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {areaNum}. {area}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Preview Modal / Card */}
          {previewTopicQuestion && (
            <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <h3 className="text-sm font-bold text-white">
                    Live Procedural Question Test: <span className="text-amber-400">{previewTopicQuestion.topic}</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const matched = filteredCurriculumTopics.find(t => t.topicId === testingTopicId);
                      if (matched) handleTestGenerateTopic(matched);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate Variant (Zero Repetition)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTopicQuestion(null)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-white">
                <MathText text={previewTopicQuestion.questionText} />
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {previewTopicQuestion.options.map((opt, i) => {
                  const isCorrect = i === previewTopicQuestion.correctIndex;
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <MathText text={opt} />
                      </span>
                      {isCorrect && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Solution breakdown */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs space-y-2">
                <div className="text-slate-400">
                  <strong className="text-slate-200">Method:</strong> <MathText text={previewTopicQuestion.solution.method || ''} />
                </div>
                <div className="text-slate-400">
                  <strong className="text-slate-200">Hint:</strong> <MathText text={previewTopicQuestion.hint} />
                </div>
                {previewTopicQuestion.solution.steps?.length > 0 && (
                  <div className="text-slate-400 space-y-1">
                    <strong className="text-slate-200">Steps:</strong>
                    {previewTopicQuestion.solution.steps.map((st, idx) => (
                      <div key={idx} className="pl-2 border-l-2 border-amber-500/40">
                        <MathText text={st} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCurriculumTopics.slice(0, 120).map(t => {
              const isSelected = testingTopicId === t.topicId;
              return (
                <div
                  key={t.topicId}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-lg'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-mono text-amber-400 font-bold">
                      Topic #{t.topicId}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[10px]">
                      Stage {t.stageId} (Slot {t.subtopicSlot + 1}/10)
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1 line-clamp-1">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-3 truncate">
                    {t.area}
                  </p>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleTestGenerateTopic(t)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors flex-1 justify-center"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Test Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAuthorForTopic(t)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      title="Prefill Authoring Form for this topic"
                    >
                      <Plus className="w-3 h-3" />
                      Author
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCurriculumTopics.length > 120 && (
            <div className="text-center py-4 text-xs text-slate-500">
              Showing first 120 of {filteredCurriculumTopics.length} topics. Use the search input or area filter to narrow down results.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminStudio;
