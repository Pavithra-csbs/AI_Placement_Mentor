import React, { useState, useEffect } from 'react';
import { ScenarioInterview, ScenarioAttempt, UserProfile, JobRole } from '../types/index.ts';
import { 
  Users2, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  BookOpen, 
  Clock, 
  Loader2, 
  ArrowRight,
  ShieldAlert,
  Target,
  RotateCcw
} from 'lucide-react';

interface ScenarioInterviewViewProps {
  user: UserProfile;
  onAttemptSaved?: () => void;
}

export const ScenarioInterviewView: React.FC<ScenarioInterviewViewProps> = ({
  user,
  onAttemptSaved,
}) => {
  const [scenarios, setScenarios] = useState<ScenarioInterview[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioInterview | null>(null);
  const [studentResponse, setStudentResponse] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<ScenarioAttempt | null>(null);
  const [pastAttempts, setPastAttempts] = useState<ScenarioAttempt[]>([]);

  useEffect(() => {
    fetchScenarios();
  }, [user.target_role]);

  const fetchScenarios = async () => {
    try {
      const res = await fetch(`/api/scenarios?role=${encodeURIComponent(user.target_role)}`);
      const data = await res.json();
      if (data.success && data.scenarios.length > 0) {
        setScenarios(data.scenarios);
        setSelectedScenario(data.scenarios[0]);
      } else {
        // Fallback to all scenarios if role filter returns empty
        const allRes = await fetch('/api/scenarios');
        const allData = await allRes.json();
        if (allData.success) {
          setScenarios(allData.scenarios);
          setSelectedScenario(allData.scenarios[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedScenario || !studentResponse.trim()) {
      alert('Please write out your architectural response before submitting.');
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await fetch('/api/scenarios/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          studentResponse: studentResponse.trim(),
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.attempt) {
        setCurrentAttempt(data.attempt);
        setPastAttempts(prev => [data.attempt, ...prev]);
        if (onAttemptSaved) onAttemptSaved();
      }
    } catch (e) {
      console.error('Failed to evaluate scenario:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
              Module 8
            </span>
            <h1 className="text-xl font-bold text-slate-900">Scenario-Based Interview Simulator</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tackle ambiguous, high-stakes system problems. Evaluated on clarification, assumptions, trade-offs & correctness.
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Situation:</span>
          <select
            value={selectedScenario?.id || ''}
            onChange={(e) => {
              const s = scenarios.find(item => item.id === e.target.value);
              if (s) {
                setSelectedScenario(s);
                setCurrentAttempt(null);
                setStudentResponse('');
              }
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500 max-w-xs truncate"
          >
            {scenarios.map(sc => (
              <option key={sc.id} value={sc.id}>
                {sc.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scenario Briefing Card */}
      {selectedScenario && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              Role: {selectedScenario.role}
            </span>
            <span className="text-xs font-semibold text-slate-400">45-Minute Interview Simulation</span>
          </div>

          <h2 className="text-lg font-bold text-slate-900">{selectedScenario.title}</h2>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700 space-y-2">
            <div>
              <span className="font-bold text-slate-900">Company & Product Context: </span>
              {selectedScenario.company_context}
            </div>
            <div>
              <span className="font-bold text-rose-900">Incident / Business Challenge: </span>
              {selectedScenario.business_problem}
            </div>
          </div>

          {/* Constraints */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Production Technical Constraints:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedScenario.technical_constraints.map((c, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-200/60 text-xs text-rose-950 flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interviewer Prompt */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 text-xs text-indigo-950 font-medium leading-relaxed">
            <span className="font-bold text-indigo-900 block mb-1">Interviewer Prompt:</span>
            "{selectedScenario.sample_prompt}"
          </div>
        </div>
      )}

      {/* Response Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-600" /> Your Structured Architectural Response
          </h3>
          <span className="text-xs text-slate-400">
            {studentResponse.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>

        {/* 6 Rubric Tips */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-600 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>✓ 1. Ask clarifying questions</div>
          <div>✓ 2. State key assumptions</div>
          <div>✓ 3. Detail technical architecture</div>
          <div>✓ 4. Provide data & numerical SLA</div>
          <div>✓ 5. Weigh 2 design alternatives</div>
          <div>✓ 6. Propose rollback & monitoring</div>
        </div>

        <textarea
          rows={9}
          value={studentResponse}
          onChange={(e) => setStudentResponse(e.target.value)}
          placeholder="Structure your answer: 
1. Problem Clarification: (e.g., Do we prioritize read availability or strict write consistency?)
2. Assumptions: (e.g., Assuming 90% read to 10% write traffic, 300ms network round-trip SLA)
3. Proposed Architecture & Solution: (e.g., Redis Lua script atomic decrement, Kafka dead-letter queue)
4. Alternatives & Trade-offs: (e.g., SQL pessimistic locking vs Redis token bucket)
5. Disaster Recovery & Fallback: (e.g., Circuit breaker pattern and graceful degradation)..."
          className="w-full p-4 rounded-xl border border-slate-300 text-xs text-slate-800 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-sans"
        />

        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-slate-400">
            Evaluated by Gemini 3.8 Flash against senior engineering bar raiser rubrics
          </div>
          <button
            onClick={handleEvaluate}
            disabled={isEvaluating || !studentResponse.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Rubric Categories...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit to Hiring Bar Raiser</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured Evaluation Feedback Card */}
      {currentAttempt && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-extrabold text-slate-900">Senior Bar Raiser Evaluation Report</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Objective rubric breakdown across 6 core interview dimensions</p>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                {currentAttempt.evaluation.overall_score}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Score</span>
                <div className="text-xs font-bold text-slate-800">
                  {currentAttempt.evaluation.overall_score >= 80 ? 'Strong Hire' : currentAttempt.evaluation.overall_score >= 65 ? 'Lean Hire' : 'Needs Practice'}
                </div>
              </div>
            </div>
          </div>

          {/* 6 Category Scores Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Dimensional Rubric Performance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'Problem Clarification', score: currentAttempt.evaluation.category_scores.problem_clarification, max: 20 },
                { label: 'Stated Assumptions', score: currentAttempt.evaluation.category_scores.assumptions, max: 15 },
                { label: 'Technical Correctness', score: currentAttempt.evaluation.category_scores.technical_correctness, max: 25 },
                { label: 'Evidence & Depth', score: currentAttempt.evaluation.category_scores.evidence_and_depth, max: 15 },
                { label: 'Alternatives & Trade-offs', score: currentAttempt.evaluation.category_scores.alternatives_and_tradeoffs, max: 15 },
                { label: 'Communication & Structure', score: currentAttempt.evaluation.category_scores.communication, max: 10 },
              ].map((cat, i) => {
                const pct = Math.round((cat.score / cat.max) * 100);
                return (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800">{cat.label}</span>
                      <span className="font-bold text-slate-900">{cat.score}/{cat.max}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Missing Considerations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/70 space-y-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths Demonstrated:
              </span>
              <ul className="space-y-1 text-xs text-emerald-950">
                {currentAttempt.evaluation.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Considerations */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Missing Architectural Considerations:
              </span>
              <ul className="space-y-1 text-xs text-amber-950">
                {currentAttempt.evaluation.missing_considerations.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Feedback */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-800 space-y-1.5">
            <span className="font-bold text-blue-900 block">Senior Mentor Synthesis:</span>
            <p className="leading-relaxed">{currentAttempt.evaluation.actionable_feedback}</p>
          </div>

          {/* Suggested Practice Drill */}
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-950 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-violet-900 block">Suggested Practice Exercise:</span>
              <p className="text-[11px] text-violet-800 mt-0.5">{currentAttempt.evaluation.suggested_practice_exercise}</p>
            </div>
            <button
              onClick={() => {
                setStudentResponse('');
                setCurrentAttempt(null);
              }}
              className="px-3 py-1.5 bg-violet-600 text-white font-semibold rounded-lg text-xs hover:bg-violet-700 transition-colors cursor-pointer shrink-0"
            >
              Try Another Attempt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
