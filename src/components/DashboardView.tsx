import React from 'react';
import { 
  UserProfile, 
  AnalyticsSummary, 
  DailyTechPoster,
  JobRole
} from '../types/index.ts';
import { 
  Sparkles, 
  Flame, 
  Code2, 
  BookOpen, 
  HelpCircle, 
  Users2, 
  BrainCircuit, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  FileText,
  Clock,
  Layers,
  Award
} from 'lucide-react';

interface DashboardViewProps {
  user: UserProfile;
  analytics: AnalyticsSummary | null;
  todayPoster: DailyTechPoster | null;
  onNavigate: (tab: string) => void;
  onOpenOnboarding: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  analytics,
  todayPoster,
  onNavigate,
  onOpenOnboarding,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white p-6 sm:p-8 shadow-xl shadow-blue-900/10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Targeting {user.target_role} • {user.experience_level}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.name.split(' ')[0]}! 🚀
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed max-w-2xl">
            Your structured placement preparation hub. Sharpen your DSA coding, explore today's technical architectural concept, simulate scenario-based technical interviews, and build your ATS-ready resume.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('coding')}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs shadow-md hover:bg-blue-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-blue-600" />
              Practice Coding Coach
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="px-4 py-2.5 rounded-xl bg-blue-600/60 hover:bg-blue-600/80 text-white font-semibold text-xs border border-white/25 backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              Take Today's Tech Quiz
            </button>
            <button
              onClick={onOpenOnboarding}
              className="px-3.5 py-2.5 rounded-xl text-blue-200 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Update Placement Goals →
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Core Placement Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Coding Success Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">DSA Success Rate</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {analytics?.coding_success_rate !== null ? `${analytics?.coding_success_rate}%` : 'No attempts'}
            </span>
            <span className="text-xs text-slate-500">
              ({analytics?.coding_solved_count || 0} solved)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {analytics?.coding_total_attempts ? `${analytics.coding_total_attempts} total test submissions` : 'Start with Two Sum or Sliding Window'}
          </p>
        </div>

        {/* Quiz Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Daily Concept Quiz</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {analytics?.quiz_accuracy !== null ? `${analytics?.quiz_accuracy}%` : 'Not attempted'}
            </span>
            <span className="text-xs text-slate-500">
              ({analytics?.quiz_correct_count || 0}/{analytics?.quiz_total_questions || 0})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tested on RAG, Kafka, Vector DBs & SQL
          </p>
        </div>

        {/* Scenario Interview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-violet-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Scenario Interview Score</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {analytics?.average_interview_score !== null ? `${analytics?.average_interview_score}/100` : 'Pending'}
            </span>
            <span className="text-xs text-slate-500">
              ({analytics?.interviews_completed || 0} rounds)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Evaluated by Gemini AI Hiring Bar-Raiser
          </p>
        </div>

        {/* Prep Streak & Roadmap */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Prep Streak & Roadmap</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">
              {user.streak_count} Days
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              ({analytics?.roadmap_progress_percentage || 0}% Roadmap)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Daily anti-double-counting verified
          </p>
        </div>
      </div>

      {/* Main Grid: Today's Tech Poster & Recommended Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tech Poster Card (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800">
                  {todayPoster?.topic_category || 'Featured Concept'}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Concept of the Day
                </span>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {todayPoster?.date || 'Today'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {todayPoster?.title}
            </h2>
            <p className="text-xs font-medium text-blue-600 mt-0.5">
              {todayPoster?.tagline}
            </p>

            <p className="text-sm text-slate-600 mt-3 line-clamp-3 leading-relaxed">
              {todayPoster?.definition}
            </p>

            {/* Architecture Steps preview */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {todayPoster?.how_it_works.slice(0, 4).map((step) => (
                <div key={step.step_number} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Step {step.step_number}</span>
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1 mt-0.5">{step.title}</div>
                </div>
              ))}
            </div>

            {/* Verified Citation Pill */}
            {todayPoster?.verified_company_use && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-900">Industry Citation:</span>
                  <span className="text-emerald-800 font-medium">{todayPoster.verified_company_use.company}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 line-clamp-1">{todayPoster.verified_company_use.use_case}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate('poster')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer"
            >
              Read Full Architectural Breakdown <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Solve 3-Question Quiz
            </button>
          </div>
        </div>

        {/* Skill Gap & ML Engine Status (1 Col) */}
        <div className="space-y-6">
          {/* Skill Gap Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Skill Gap Recommendations
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Module 7
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Automated gap detection based on your quiz attempts, coding progress, and target role:
            </p>

            <div className="space-y-2.5">
              {(analytics?.skill_gaps || []).slice(0, 3).map((gap, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{gap.skill}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                      gap.priority === 'High' 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {gap.priority} Priority
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{gap.reason}</p>
                  <div className="mt-1.5 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                    <span>Action:</span> {gap.action_item}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('analytics')}
              className="mt-4 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer text-center"
            >
              View Full Analytics & Radar →
            </button>
          </div>

          {/* ML Component Health Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-200">Scikit-Learn ML Service</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Real trained Logistic Regression difficulty classifier & TF-IDF Cosine Similarity engine active.
            </p>
            <div className="mt-3 flex items-center justify-between text-xs border-t border-white/10 pt-2.5">
              <span className="text-slate-400">Held-Out Accuracy:</span>
              <span className="font-bold text-emerald-400">60.0% (Real Model)</span>
            </div>
            <button
              onClick={() => onNavigate('ml-engine')}
              className="mt-3 w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-indigo-200 font-semibold text-center transition-colors cursor-pointer"
            >
              Open ML Evaluation Lab & Confusion Matrix →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launchpad to All Modules */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400 mb-3">
          Quick Module Access
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'roadmap', label: '16-Week Roadmap', desc: 'Milestones & Links', icon: Layers, color: 'text-blue-600' },
            { id: 'coding', label: 'AI Coding Coach', desc: 'Progressive Hints', icon: Code2, color: 'text-indigo-600' },
            { id: 'poster', label: 'Daily Posters', desc: 'Tech Architecture', icon: BookOpen, color: 'text-violet-600' },
            { id: 'interview', label: 'Scenario Prep', desc: 'Rubric Evaluator', icon: Users2, color: 'text-rose-600' },
            { id: 'projects', label: 'Project Catalog', desc: 'ML Ranked Datasets', icon: Award, color: 'text-teal-600' },
            { id: 'resume', label: 'ATS Resume', desc: 'Live PDF Builder', icon: FileText, color: 'text-amber-600' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="p-4 bg-white rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
              >
                <Icon className={`w-5 h-5 ${item.color} mb-2 group-hover:scale-110 transition-transform`} />
                <div className="text-xs font-bold text-slate-900">{item.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
