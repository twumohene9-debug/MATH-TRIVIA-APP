import React, { useState } from 'react';
import { X, Mail, Check, Copy, Sparkles, BookOpen, GraduationCap, Heart, Award } from 'lucide-react';

interface AboutAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBright?: boolean;
}

export const AboutAuthorModal: React.FC<AboutAuthorModalProps> = ({
  isOpen,
  onClose,
  isBright = true,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const email = 'twumbismark90@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-6 transition-all flex flex-col ${
          isBright ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#12173f] border-indigo-900/80 text-white'
        }`}
      >
        {/* Golden Top Accent Header */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 p-5 sm:p-6 text-[#161c4f] relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0b0f2a] text-amber-300 flex items-center justify-center shrink-0 shadow-md">
                <GraduationCap className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#0b0f2a] text-amber-300 mb-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>BIOGRAPHY &amp; PROFILE</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-display leading-tight text-[#0b0f2a]">
                  About Bismark Twum
                </h2>
                <p className="text-xs font-semibold text-[#161c4f]/80 mt-0.5">
                  Mathematics Educator · Researcher · Author (Ghana)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#0b0f2a]/10 hover:bg-[#0b0f2a]/20 text-[#0b0f2a] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Main Biography Section */}
          <div className="space-y-4 text-sm sm:text-base leading-relaxed">
            <p className={isBright ? 'text-slate-700' : 'text-slate-200'}>
              <strong>Bismark Twum</strong> is a dedicated Ghanaian Mathematics Educator, Researcher, Author, and an active member of the body of Christ based in Ghana. Committed to holistic intellectual and spiritual development, Bismark combines academic rigor with a deep devotion to God's Word.
            </p>

            <p className={isBright ? 'text-slate-700' : 'text-slate-200'}>
              Through years of classroom leadership, curriculum development, and educational research, he has mentored and inspired students, educators, and believers to strive for excellence, live purposefully, and ground their lives in the unchanging truths of the Holy Scriptures.
            </p>
          </div>

          {/* Pillars of Ministry & Vision */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div
              className={`p-3.5 rounded-2xl border text-center flex flex-col items-center ${
                isBright ? 'bg-amber-50/60 border-amber-200/80 text-amber-950' : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
              }`}
            >
              <BookOpen className="w-5 h-5 text-amber-600 mb-1.5" />
              <div className="text-xs font-bold font-display">Mathematical Rigor</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Excellence in pedagogy &amp; research</div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-center flex flex-col items-center ${
                isBright ? 'bg-indigo-50/60 border-indigo-200/80 text-indigo-950' : 'bg-indigo-950/20 border-indigo-800/40 text-indigo-200'
              }`}
            >
              <Heart className="w-5 h-5 text-pink-600 mb-1.5" />
              <div className="text-xs font-bold font-display">Faith &amp; Devotion</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Anchored in the Holy Scriptures</div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-center flex flex-col items-center ${
                isBright ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950' : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
              }`}
            >
              <Award className="w-5 h-5 text-emerald-600 mb-1.5" />
              <div className="text-xs font-bold font-display">Holistic Mentorship</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Inspiring purposeful achievement</div>
            </div>
          </div>

          {/* Scripture Anchorage Badge Card */}
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
              isBright
                ? 'bg-gradient-to-r from-amber-50 to-orange-50/70 border-amber-200 text-amber-950'
                : 'bg-gradient-to-r from-amber-950/30 to-indigo-950/40 border-amber-800/50 text-amber-100'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-[#0b0f2a] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              ✝
            </div>
            <div className="text-xs leading-snug">
              <span className="font-bold text-amber-700 dark:text-amber-300 block mb-0.5 font-display text-sm">
                "The joy of the Lord is my strength" — Nehemiah 8:10
              </span>
              <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                Founded upon Christian devotion, intellectual discipline, and a passion for uplifting students worldwide.
              </span>
            </div>
          </div>

          {/* Contact & Support Section */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
              isBright ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-indigo-950 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0b0f2a] text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                <Mail className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  Direct Contact &amp; Support
                </div>
                <a
                  href={`mailto:${email}`}
                  className="text-sm font-bold text-pink-600 hover:text-pink-700 underline font-mono"
                >
                  {email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyEmail}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : isBright
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${email}?subject=Math%20Mastery%20Inquiry%20-%20Bismark%20Twum`}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-700 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 border-t flex items-center justify-end ${
            isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-indigo-950'
          }`}
        >
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#0b0f2a] text-amber-300 hover:bg-[#161c4f] text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Close Biography
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutAuthorModal;
