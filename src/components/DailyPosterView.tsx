import React, { useState, useEffect } from 'react';
import { DailyTechPoster } from '../types/index.ts';
import { 
  Newspaper, 
  BookOpen, 
  ExternalLink, 
  Code, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  Copy, 
  Check, 
  Calendar,
  Sparkles
} from 'lucide-react';

interface DailyPosterViewProps {
  onTakeQuiz: (posterId: string) => void;
}

export const DailyPosterView: React.FC<DailyPosterViewProps> = ({ onTakeQuiz }) => {
  const [posters, setPosters] = useState<DailyTechPoster[]>([]);
  const [selectedPoster, setSelectedPoster] = useState<DailyTechPoster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPosters();
  }, []);

  const fetchPosters = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/posters');
      const data = await res.json();
      if (data.success && data.posters.length > 0) {
        setPosters(data.posters);
        setSelectedPoster(data.posters[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (selectedPoster?.practical_example.code_or_query) {
      navigator.clipboard.writeText(selectedPoster.practical_example.code_or_query);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading || !selectedPoster) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
        Loading today's technical concept poster...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700">
              Module 4
            </span>
            <h1 className="text-xl font-bold text-slate-900">Daily Technical Concept Poster</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Master one high-yield enterprise engineering concept every day, backed by verified production citations.
          </p>
        </div>

        {/* Date Selector / Archive */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Archive:</span>
          {posters.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPoster(p)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedPoster.id === p.id
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.date}
            </button>
          ))}
        </div>
      </div>

      {/* Main Poster Showcase Canvas */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
        {/* Poster Hero Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-400/30">
                {selectedPoster.topic_category}
              </span>
              <span className="text-xs text-slate-400">Published: {selectedPoster.date}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white max-w-3xl">
              {selectedPoster.title}
            </h2>
            <p className="mt-2 text-base text-indigo-200 max-w-2xl font-medium">
              {selectedPoster.tagline}
            </p>
          </div>

          <div className="absolute right-0 bottom-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Poster Body */}
        <div className="p-8 sm:p-10 space-y-8">
          {/* Section 1: Definition */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Formal Architecture Definition
            </h3>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/70 text-slate-800 text-sm leading-relaxed font-serif">
              "{selectedPoster.definition}"
            </div>
          </div>

          {/* Section 2: How It Works */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              How It Works: Step-by-Step Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedPoster.how_it_works.map((step) => (
                <div 
                  key={step.step_number}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-violet-300 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">
                      {step.step_number}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-8">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Real-World Applications */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Production Use Cases & Industry Applications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedPoster.real_world_applications.map((app, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium">{app}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Practical Code / Query Example */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Practical Implementation Example ({selectedPoster.practical_example.language})
              </h3>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Snippet'}</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs font-mono overflow-x-auto text-slate-100 leading-relaxed">
              <pre>{selectedPoster.practical_example.code_or_query}</pre>
            </div>
            <p className="text-xs text-slate-500 mt-2 italic">
              Key takeaway: {selectedPoster.practical_example.explanation}
            </p>
          </div>

          {/* Section 5: Verified Company Case Study & Citation */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Verified Industry Production Citation
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedPoster.verified_company_use.company}: {selectedPoster.verified_company_use.use_case}
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedPoster.verified_company_use.architecture_context}
                </p>
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold">Source Notes:</span> {selectedPoster.verified_company_use.citation_notes}
                </div>
              </div>

              <a
                href={selectedPoster.verified_company_use.source_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0"
              >
                Engineering Source <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Ready to test your retention and reinforce key architectural trade-offs?
            </div>
            <button
              onClick={() => onTakeQuiz(selectedPoster.id)}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              Take Concept Quiz ({selectedPoster.title.split(':')[0]})
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
