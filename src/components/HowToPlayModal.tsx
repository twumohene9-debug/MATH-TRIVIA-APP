import React from 'react';
import { X, CheckCircle2, Clock, HelpCircle, Trophy } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 text-slate-800 my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-pink-600" />
            <h2 className="text-lg font-bold font-display text-[#161c4f]">How to Play Math Mastery</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 overflow-y-auto pr-1 text-xs text-slate-600 leading-relaxed">
          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-[#161c4f] mb-1">
              The 100-Stage Odyssey
            </h3>
            <p>
              Ascend through 10 distinct mathematical worlds spanning basic arithmetic, fractions, algebra, geometry, calculus, and competition logic — culminating at Stage 100: Mathematical Mastery.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-[#161c4f] text-xs uppercase tracking-wider">
              Game Structure Hierarchy
            </h4>
            <div className="grid grid-cols-2 gap-2 font-mono-numbers">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">100 Stages</span>
                <span className="text-[#161c4f] font-bold">10 Major Worlds</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">2,000 Levels</span>
                <span className="text-[#161c4f] font-bold">20 Levels per Stage</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">20,000 Blocks</span>
                <span className="text-[#161c4f] font-bold">10 Blocks per Level</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">200,000 Questions</span>
                <span className="text-[#161c4f] font-bold">10 Qs per Block</span>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-[#161c4f] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              The Block Mastery Rule
            </h4>
            <p>
              Each block presents 10 multiple-choice questions. You must solve all 10 questions correctly to conquer that block.
            </p>
            <p>
              If you submit an incorrect answer or let the timer expire, the block ends and reveals the full 5-part worked solution. Previously completed blocks remain safely completed. When you retry, fresh numbers and question variations are generated!
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-[#161c4f] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-pink-600" />
              Timed (120s) & Untimed Modes
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li><strong>Untimed Mode (Default):</strong> Relaxed, pressure-free practice where you can take as long as you need to solve every problem.</li>
              <li><strong>Timed Mode:</strong> Each question provides a generous <strong>120 seconds</strong> to calculate and think through the solution.</li>
              <li>Toggle between Timed and Untimed anytime with 1 click in the top bar!</li>
            </ul>
          </section>

          <section className="bg-pink-50 p-3.5 rounded-2xl border border-pink-200 text-pink-950">
            <div className="font-bold flex items-center gap-1 mb-1 text-pink-700">
              <Trophy className="w-4 h-4 text-pink-600" />
              Supreme Stage 100 Crown
            </div>
            <p className="text-[11px] text-pink-900 leading-relaxed">
              Solve all 100 stages to unlock the legendary Ultimate Mathematical Master badge and record your name in mathematical eternity.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 mt-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-[#161c4f] to-pink-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Understood — Begin Adventure
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
