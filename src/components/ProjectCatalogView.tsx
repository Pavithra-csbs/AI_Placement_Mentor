import React, { useState, useEffect } from 'react';
import { ProjectRecommendation, UserProfile } from '../types/index.ts';
import { 
  FolderKanban, 
  Search, 
  Sparkles, 
  Database, 
  Code, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  BrainCircuit, 
  Loader2,
  Calendar,
  Award,
  Zap,
  X,
  Plus
} from 'lucide-react';

interface ProjectCatalogViewProps {
  user: UserProfile;
}

const PROJECT_DOMAINS = [
  'Distributed Caching & High-Throughput APIs',
  'Real-Time Event-Driven Streaming & PubSub',
  'RAG & Vector Knowledge Retrieval Platform',
  'Automated DevOps & CI/CD Observability Pipeline',
  'Fintech Transaction Ledger & Fraud Detection',
  'Autonomous Multi-Agent AI Task Coordinator',
];

export const ProjectCatalogView: React.FC<ProjectCatalogViewProps> = ({ user }) => {
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [isMlRanking, setIsMlRanking] = useState(false);
  const [mlSource, setMlSource] = useState<string | null>(null);
  const [targetDiff, setTargetDiff] = useState<string | null>(null);

  // Generator State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(PROJECT_DOMAINS[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [user.target_role]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data?.success && data.projects) {
        setProjects(data.projects);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyMlRanking = async () => {
    setIsMlRanking(true);
    try {
      const res = await fetch('/api/ml/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_profile: {
            role: user.target_role,
            skills: user.current_skills,
            interests: user.interests,
            coding_success_rate: 0.75,
            quiz_accuracy: 0.82
          },
          items: projects
        })
      });

      const data = await res.json();
      if (data?.success && data.data?.ranked_items) {
        setProjects(data.data.ranked_items);
        setMlSource(data.source);
        setTargetDiff(data.data.target_difficulty);
      }
    } catch (e) {
      console.error('ML ranking error:', e);
    } finally {
      setIsMlRanking(false);
    }
  };

  const handleGenerateAiProject = async () => {
    setIsGeneratingProject(true);
    setGenError(null);

    try {
      const res = await fetch('/api/projects/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: user.target_role,
          domain: selectedDomain,
          skills: user.current_skills,
        }),
      });

      const data = await res.json();
      if (data?.success && data.project) {
        setProjects(prev => [data.project, ...prev]);
        setIsGeneratorOpen(false);
      } else {
        setGenError('Failed to synthesize capstone project. Please try again.');
      }
    } catch (e) {
      console.error('Project generation error:', e);
      setGenError('Network error while generating AI project.');
    } finally {
      setIsGeneratingProject(false);
    }
  };

  const filtered = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.tech_stack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDiff = difficultyFilter === 'all' || p.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
              Module 9
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-600" /> Real-Time Architectures
            </span>
            <h1 className="text-xl font-bold text-slate-900">Industry Placement Project Catalog</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-world resume projects with verified open datasets, milestone roadmaps, and scikit-learn recommendation ranking.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsGeneratorOpen(prev => !prev)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>{isGeneratorOpen ? 'Close Generator' : 'Generate Real-Time Capstone'}</span>
          </button>

          <button
            onClick={handleApplyMlRanking}
            disabled={isMlRanking}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {isMlRanking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                <span>Computing TF-IDF...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4 text-teal-300" />
                <span>Rank with Scikit-Learn</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-Time Generator Panel */}
      {isGeneratorOpen && (
        <div className="bg-gradient-to-br from-teal-50/80 via-white to-indigo-50/80 rounded-2xl p-6 border border-teal-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Generate Industry Capstone Project Specification</h3>
            </div>
            <button
              onClick={() => setIsGeneratorOpen(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Generate an enterprise-grade project tailored to {user.target_role} hiring criteria with verified public datasets and week-by-week implementation deliverables.
          </p>

          {genError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {genError}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Architecture & Industry Domain:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROJECT_DOMAINS.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDomain(d)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    selectedDomain === d
                      ? 'border-teal-500 bg-teal-50/80 text-teal-900 font-bold ring-1 ring-teal-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ⚡ {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsGeneratorOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateAiProject}
              disabled={isGeneratingProject}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isGeneratingProject ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Architecture & Milestones...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Capstone Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by skill, stack, or title..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Difficulty:</span>
          {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                difficultyFilter === diff
                  ? 'bg-teal-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {diff === 'all' ? 'All' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* ML Rank Banner if Active */}
      {mlSource && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-50 via-emerald-50 to-indigo-50 border border-teal-200 text-xs flex items-center justify-between text-teal-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>
              <strong>Scikit-Learn Recommender Applied:</strong> Ranked {projects.length} projects using TF-IDF feature vectors & Cosine Similarity matching {user.target_role} profile.
            </span>
          </div>
          {targetDiff && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-teal-800 border border-teal-200">
              Target Level: {targetDiff}
            </span>
          )}
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((proj) => (
          <div 
            key={proj.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              {/* Badge & Difficulty */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                  {proj.domain}
                </span>
                <div className="flex items-center gap-2">
                  {proj.match_score !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800">
                      Match: {Math.round(proj.match_score * 100)}%
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    proj.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-800' :
                    proj.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {proj.difficulty}
                  </span>
                </div>
              </div>

              {/* Title & Problem Statement */}
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{proj.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {proj.problem_statement}
                </p>
              </div>

              {/* Recommendation Reason if available */}
              {proj.recommendation_reason && (
                <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100 text-[11px] text-teal-900 italic">
                  💡 {proj.recommendation_reason}
                </div>
              )}

              {/* Tech Stack Pills */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Core Tech Stack:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(proj.tech_stack || []).map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dataset Details */}
              {proj.dataset && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-blue-600" /> Open Dataset Source:
                    </span>
                    {proj.dataset.url && (
                      <a 
                        href={proj.dataset.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] inline-flex items-center gap-0.5"
                      >
                        Dataset Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">{proj.dataset.name} — {proj.dataset.description}</p>
                </div>
              )}

              {/* Implementation Milestones */}
              {Array.isArray(proj.milestones) && proj.milestones.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Implementation Roadmap ({proj.milestones.length} Sprints):
                  </span>
                  <div className="space-y-1.5">
                    {proj.milestones.map((m, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-50/50 border border-slate-100 text-xs flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {m.week}
                        </span>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-800">{m.title}</span>
                          <span className="text-[11px] text-slate-500 block">
                            {Array.isArray(m.deliverables) ? m.deliverables.join(' • ') : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Evaluation Criteria */}
            {Array.isArray(proj.evaluation_criteria) && proj.evaluation_criteria.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Recruiter Screening Criteria:
                </span>
                <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                  {proj.evaluation_criteria.map((c, cIdx) => (
                    <li key={cIdx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
