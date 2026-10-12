import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Play,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowLeft,
  Award,
  Zap,
  Clock,
  Compass,
  FileText,
  Filter,
  X,
  Target
} from 'lucide-react';
import { UserProgress } from '../types';
import { CURRICULUM_PARTS, CurriculumPart, CurriculumUnit, searchCurriculumParts } from '../data/curriculumParts';
import MathMasteryLogo from './MathMasteryLogo';

interface CurriculumPartsHubProps {
  progress: UserProgress;
  onBackToHome: () => void;
  onStartPartQuiz: (partId: number, unitId?: string, unitName?: string) => void;
  onSwitchToWorlds: () => void;
}

export const CurriculumPartsHub: React.FC<CurriculumPartsHubProps> = ({
  progress,
  onBackToHome,
  onStartPartQuiz,
  onSwitchToWorlds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'jhs' | 'core' | 'elective'>('all');
  const [expandedPartId, setExpandedPartId] = useState<number | null>(null);
  const [activeUnitModal, setActiveUnitModal] = useState<{ part: CurriculumPart; unit: CurriculumUnit } | null>(null);

  const isBright = progress.settings.theme !== 'royal';
  const playerName = progress.playerName || 'Mathematician';

  // Filter parts based on selected group
  const filteredParts = useMemo(() => {
    return CURRICULUM_PARTS.filter(part => {
      // Group filter
      if (selectedFilter === 'jhs' && part.id > 4) return false;
      if (selectedFilter === 'core' && (part.id < 5 || part.id > 7)) return false;
      if (selectedFilter === 'elective' && part.id < 8) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      if (part.title.toLowerCase().includes(q) || part.description.toLowerCase().includes(q) || part.levelBadge.toLowerCase().includes(q)) {
        return true;
      }
      return part.units.some(
        u =>
          u.name.toLowerCase().includes(q) ||
          u.keyConcept.toLowerCase().includes(q) ||
          u.subtopics.some(s => s.toLowerCase().includes(q))
      );
    });
  }, [selectedFilter, searchQuery]);

  // Overall stats for Curriculum Parts
  const partProgressMap = progress.partProgress || {};
  const totalQuizzesCompleted = Object.values(partProgressMap).reduce(
    (acc, p) => acc + (p?.completedQuizzes || 0),
    0
  );
  const totalPartPoints = Object.values(partProgressMap).reduce(
    (acc, p) => acc + (p?.totalPoints || 0),
    0
  );

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Top Header & Navigation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-2 text-xs font-semibold ${
              isBright
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-slate-900 hover:bg-slate-800 border-indigo-900/60 text-slate-200'
            }`}
            title="Return to Home Screen"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <button
            onClick={onSwitchToWorlds}
            className={`px-3 py-2.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-2 text-xs font-semibold ${
              isBright
                ? 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700'
                : 'bg-pink-950/40 hover:bg-pink-900/50 border-pink-900/50 text-pink-300'
            }`}
            title="Switch to 10 Mathematical Worlds (Adventure Mode)"
          >
            <Compass className="w-4 h-4 text-pink-600" />
            <span>10 Worlds Adventure</span>
          </button>
        </div>

        {/* User stats pill */}
        <div className="flex items-center gap-3 text-xs font-mono-numbers">
          <div
            className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 ${
              isBright ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-indigo-900/60 text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Curriculum Quizzes: <strong>{totalQuizzesCompleted}</strong></span>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 ${
              isBright ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-indigo-900/60 text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
            <span>Points: <strong>{totalPartPoints.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Hero Presentation */}
      <section className="text-center flex flex-col items-center pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 mb-3">
          <span>🔓 10 Open Curriculum Parts · Zero Locked Gates</span>
        </div>

        <h1
          className={`text-3xl sm:text-5xl font-extrabold tracking-tight font-display mb-3 ${
            isBright ? 'text-[#161c4f]' : 'text-white'
          }`}
        >
          10-Part Open Curriculum Hub
        </h1>
        <p
          className={`max-w-3xl mx-auto text-sm sm:text-base leading-relaxed ${
            isBright ? 'text-slate-600' : 'text-slate-300'
          }`}
        >
          Unlike sequential adventure stages, <strong>all 10 curriculum parts are completely open and unlocked from day one</strong>. Choose any educational level below from primary foundations to WASSCE Elective & Further Mathematics and quiz freely!
        </p>

        {/* Search Bar & Filter Controls */}
        <div className="w-full max-w-2xl mt-6 flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search topics: surds, modular arithmetic, vectors, harmonic form..."
              className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                isBright
                  ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                  : 'bg-slate-900 border-indigo-900/60 text-white placeholder:text-slate-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All 10' },
              { id: 'jhs', label: 'Basic 1–9' },
              { id: 'core', label: 'SHS Core' },
              { id: 'elective', label: 'Elective & Further' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === f.id
                    ? 'bg-gradient-to-r from-[#161c4f] to-indigo-900 text-white shadow-xs'
                    : isBright
                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-slate-900 border border-indigo-900/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid of 10 Open Parts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredParts.map(part => {
          const stats = partProgressMap[part.id] || { completedQuizzes: 0, totalPoints: 0, bestScore: 0 };
          const isExpanded = expandedPartId === part.id;

          return (
            <div
              key={part.id}
              className={`rounded-3xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl ${
                isBright
                  ? 'bg-white border-slate-200/90 hover:border-slate-300'
                  : 'bg-[#12173f] border-indigo-900/60 hover:border-indigo-700'
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className="h-1.5 w-full bg-gradient-to-r"
                style={{
                  background: `linear-gradient(to right, ${part.accentColor}, #ec4899)`,
                }}
              />

              <div className="p-6 flex flex-col gap-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 shadow-xs">
                      {part.badge}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${part.accentColor}20`,
                            color: part.accentColor,
                          }}
                        >
                          Part {part.id} · {part.levelBadge}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Open
                        </span>
                      </div>
                      <h2
                        className={`text-xl font-bold font-display ${
                          isBright ? 'text-[#161c4f]' : 'text-white'
                        }`}
                      >
                        {part.title}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Subtitle & Description */}
                <p className={`text-xs leading-relaxed ${isBright ? 'text-slate-600' : 'text-slate-300'}`}>
                  {part.description}
                </p>

                {/* Strands badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {part.strands.map(st => (
                    <span
                      key={st}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                        isBright ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {st}
                    </span>
                  ))}
                </div>

                {/* Units & Completed Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono-numbers">
                  <span className={isBright ? 'text-slate-500' : 'text-slate-400'}>
                    <strong>{part.units.length}</strong> Units · <strong>{part.totalTopicsCount}</strong> Subtopics
                  </span>
                  <span className="font-semibold text-pink-600 dark:text-pink-400">
                    {stats.completedQuizzes > 0 ? `${stats.completedQuizzes} Quizzes Solved` : 'Not Attempted Yet'}
                  </span>
                </div>

                {/* Expandable units preview */}
                {isExpanded && (
                  <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2 animate-fadeIn">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Curriculum Units & Dedicated Topics:
                    </div>
                    {part.units.map(unit => (
                      <div
                        key={unit.id}
                        className={`p-3 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                          isBright
                            ? 'bg-slate-50/80 hover:bg-pink-50/50 border-slate-200 hover:border-pink-200'
                            : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 hover:border-indigo-800'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="text-xs font-bold text-[#161c4f] dark:text-white flex items-center gap-1.5">
                            <span>{unit.name}</span>
                            {unit.strand && (
                              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                                ({unit.strand})
                              </span>
                            )}
                          </div>
                          <div className={`text-[11px] mt-0.5 line-clamp-1 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                            {unit.keyConcept}
                          </div>
                        </div>

                        <button
                          onClick={() => onStartPartQuiz(part.id, unit.id, unit.name)}
                          className="px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-bold shrink-0 shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          title={`Launch quiz specifically on ${unit.name}`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Quiz Unit</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div
                className={`p-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2.5 ${
                  isBright ? 'bg-slate-50/50 border-slate-100' : 'bg-slate-950/40 border-slate-900'
                }`}
              >
                <button
                  onClick={() => setExpandedPartId(isExpanded ? null : part.id)}
                  className={`text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    isBright ? 'text-slate-600 hover:text-[#161c4f]' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{isExpanded ? 'Hide Units' : 'View All Units'}</span>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStartPartQuiz(part.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#161c4f] to-indigo-900 text-white hover:opacity-95 text-xs font-bold shadow-md shadow-indigo-950/20 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Part Quiz</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredParts.length === 0 && (
        <div
          className={`text-center py-12 border rounded-3xl p-6 ${
            isBright ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-indigo-900/60 text-slate-300'
          }`}
        >
          <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-base font-bold">No curriculum parts matched your search.</p>
          <p className="text-xs text-slate-500 mt-1">Try searching for keywords like "surds", "matrices", "geometry", or "trig".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CurriculumPartsHub;
