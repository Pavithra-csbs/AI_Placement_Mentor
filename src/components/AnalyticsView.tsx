import React from 'react';
import { AnalyticsSummary, UserProfile } from '../types/index.ts';
import { 
  BarChart3, 
  Flame, 
  Code2, 
  HelpCircle, 
  Users2, 
  Layers, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface AnalyticsViewProps {
  user: UserProfile;
  analytics: AnalyticsSummary | null;
  onNavigate: (tab: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  user,
  analytics,
  onNavigate,
}) => {
  if (!analytics) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
        Gathering persisted student analytics...
      </div>
    );
  }

  // Find maximum activity count for bar chart scaling
  const maxWeekly = Math.max(
    ...analytics.weekly_activity.map(d => Math.max(d.coding_count, d.quiz_count)),
    4
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Module 11
            </span>
            <h1 className="text-xl font-bold text-slate-900">Placement Preparation Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real persisted learning activity, topic masteries, quiz accuracy, and calibrated skill gap alerts.
          </p>
        </div>

        {/* Streak Verified Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold shadow-2xs">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>{analytics.streak_count} Days Streak (Anti-Double Count Active)</span>
        </div>
      </div>

      {/* 4 Core Performance KPI Cards (Distinguishing zero from unattempted) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Coding Success Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Coding Success Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            {analytics.coding_success_rate !== null ? (
              <>
                <span className="text-2xl font-extrabold text-slate-900">{analytics.coding_success_rate}%</span>
                <span className="text-xs text-slate-500">pass rate</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-400 italic">No attempts yet</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {analytics.coding_solved_count} unique DSA problems solved ({analytics.coding_total_attempts} submissions)
          </p>
        </div>

        {/* Daily Quiz Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Daily Quiz Accuracy</span>
          <div className="mt-2 flex items-baseline gap-2">
            {analytics.quiz_accuracy !== null ? (
              <>
                <span className="text-2xl font-extrabold text-indigo-600">{analytics.quiz_accuracy}%</span>
                <span className="text-xs text-slate-500">retention</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-400 italic">Not attempted</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {analytics.quiz_correct_count} of {analytics.quiz_total_questions} questions correct
          </p>
        </div>

        {/* Scenario Interview Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Scenario Interview Average</span>
          <div className="mt-2 flex items-baseline gap-2">
            {analytics.average_interview_score !== null ? (
              <>
                <span className="text-2xl font-extrabold text-violet-600">{analytics.average_interview_score}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-400 italic">No interview rounds</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {analytics.interviews_completed} scenario evaluations completed
          </p>
        </div>

        {/* Roadmap Completion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">{user.target_role} Roadmap</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-600">{analytics.roadmap_progress_percentage}%</span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${analytics.roadmap_progress_percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Charts: 7-Day Activity Trend & Topic Mastery Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Day Activity Trend (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Weekly Learning Activity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Coding test submissions vs daily quiz completions</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                <span className="text-slate-600">Coding Tests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-400" />
                <span className="text-slate-600">Quiz Questions</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-56 pt-6 flex items-end justify-between gap-3 border-b border-slate-100 pb-2">
            {analytics.weekly_activity.map((item, idx) => {
              const codingHeight = Math.max(8, (item.coding_count / maxWeekly) * 160);
              const quizHeight = Math.max(8, (item.quiz_count / maxWeekly) * 160);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    {/* Coding Bar */}
                    <div 
                      className="w-3 sm:w-4 bg-blue-600 rounded-t-md transition-all group-hover:bg-blue-700 relative"
                      style={{ height: `${codingHeight}px` }}
                      title={`${item.coding_count} coding attempts on ${item.date}`}
                    />
                    {/* Quiz Bar */}
                    <div 
                      className="w-3 sm:w-4 bg-indigo-400 rounded-t-md transition-all group-hover:bg-indigo-500 relative"
                      style={{ height: `${quizHeight}px` }}
                      title={`${item.quiz_count} quiz questions on ${item.date}`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 uppercase">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Consistent daily effort beats cramming prior to placement drives.</span>
            <span className="font-semibold text-blue-600">{analytics.streak_count} consecutive days active</span>
          </div>
        </div>

        {/* Right: Topic-wise Strengths & Mastery (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> Topic Mastery & DSA Strengths
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Problem solve rates categorized by algorithmic domain</p>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {analytics.topic_breakdown.map((t, idx) => {
              const pct = t.accuracy_pct ?? 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{t.topic}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {t.solved}/{t.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onNavigate('coding')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center block"
          >
            Solve More DSA Problems →
          </button>
        </div>
      </div>

      {/* Module 7: Transparent Skill Gap Explanations */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Explainable Skill Gap Recommendations (Module 7)</h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Rules-based fallback + scikit-learn difficulty alignment
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The placement mentor analyzes your past submissions, quiz scores, completed milestones, and {user.target_role} requirements to generate prioritized focus areas with explicit algorithmic reasoning:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.skill_gaps.map((gap, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{gap.skill}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                  gap.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {gap.priority} Priority
                </span>
              </div>
              <p className="text-xs text-slate-600 font-serif leading-snug">
                <span className="font-bold text-slate-700 font-sans">Why recommended: </span>
                {gap.reason}
              </p>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200/60 text-xs text-blue-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">Next Action: </span>
                  <span>{gap.action_item}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
