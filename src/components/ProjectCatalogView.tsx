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
  Award
} from 'lucide-react';

interface ProjectCatalogViewProps {
  user: UserProfile;
}

export const ProjectCatalogView: React.FC<ProjectCatalogViewProps> = ({ user }) => {
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [isMlRanking, setIsMlRanking] = useState(false);
  const [mlSource, setMlSource] = useState<string | null>(null);
  const [targetDiff, setTargetDiff] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [user.target_role]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success && data.projects) {
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
      if (data.success && data.data?.ranked_items) {
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
            <h1 className="text-xl font-bold text-slate-900">Industry Placement Project Catalog</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-world resume projects with verified open datasets, milestone roadmaps, and scikit-learn recommendation ranking.
          </p>
        </div>

        {/* ML Rank Action */}
        <button
          onClick={handleApplyMlRanking}
          disabled={isMlRanking}
          className="px-5 py-2.5 bg-gradient-to-r from-teal-600 via-indigo-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isMlRanking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Computing TF-IDF & Cosine Similarities...</span>
            </>
          ) : (
            <>
              <BrainCircuit className="w-4 h-4 text-teal-200" />
              <span>Rank Projects with Scikit-Learn ML</span>
            </>
          )}
        </button>
      </div>

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
                  ? 'bg-teal-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* ML Ranking Status Banner */}
      {mlSource && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200 text-xs text-teal-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="w-4 h-4 text-teal-700" />
            <div>
              <span className="font-bold text-teal-900">Scikit-Learn ML Ranking Active:</span>
              <span className="ml-1 text-slate-700">
                Projects ranked using TF-IDF vectorization and cosine similarity against your target role ({user.target_role}) and skills.
              </span>
            </div>
          </div>
          {targetDiff && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white text-teal-800 border border-teal-300">
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
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all p-6 flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                    proj.difficulty === 'Beginner'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : proj.difficulty === 'Intermediate'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}>
                    {proj.difficulty}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md">
                    {proj.domain}
                  </span>
                </div>

                {/* Match Score Badge */}
                {proj.match_score !== undefined && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold">
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    <span>{Math.round(proj.match_score * 100)}% ML Match</span>
                  </div>
                )}
              </div>

              <h2 className="text-base font-bold text-slate-900">{proj.title}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {proj.problem_statement}
              </p>

              {/* Recommendation Reason if available */}
              {proj.recommendation_reason && (
                <div className="mt-2.5 p-2.5 bg-teal-50/60 rounded-xl border border-teal-200/60 text-[11px] text-teal-900">
                  <span className="font-bold">ML Match Insight: </span>
                  {proj.recommendation_reason}
                </div>
              )}

              {/* Dataset Callout */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Database className="w-3.5 h-3.5 text-blue-600" />
                    <span>Verified Dataset: {proj.dataset.name}</span>
                  </div>
                  <a
                    href={proj.dataset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Open Dataset <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{proj.dataset.description}</p>
              </div>

              {/* Tech Stack & Skills */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {proj.tech_stack.map((ts, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {ts}
                  </span>
                ))}
              </div>

              {/* Milestones Preview */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  3-Week Implementation Milestones:
                </span>
                {proj.milestones.map((m) => (
                  <div key={m.week} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="font-bold text-teal-700 text-[11px] shrink-0">W{m.week}:</span>
                    <span className="font-medium text-slate-800">{m.title}</span>
                    <span className="text-slate-400 text-[11px]">({m.deliverables.join(', ')})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluation Criteria Checklist */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Placement Evaluation Checklist:
              </span>
              <div className="space-y-1 text-[11px] text-slate-600">
                {proj.evaluation_criteria.map((ec, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{ec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
