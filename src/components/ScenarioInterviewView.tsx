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
  RotateCcw,
  X,
  Zap,
  Building2,
  AlertCircle
} from 'lucide-react';

interface ScenarioInterviewViewProps {
  user: UserProfile;
  onAttemptSaved?: () => void;
}

const TARGET_COMPANIES = ['Google', 'Netflix', 'Amazon', 'Stripe', 'Uber', 'Meta', 'Airbnb', 'Coinbase'];
const COMMON_DOMAINS = [
  'High-Concurrency Flash Sale & Inventory Race Conditions',
  'Real-Time WebSocket Video Streaming & Connection Drops',
  'Multi-Region Database Replication Lag & Split-Brain',
  'Payment Gateway Webhook Idempotency & Partial Failures',
  'RAG Vector Search Latency & Index Fragmentation',
];

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
  const [validationError, setValidationError] = useState<string | null>(null);

  // Real-time generator modal state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [targetCompany, setTargetCompany] = useState('Google');
  const [customDomain, setCustomDomain] = useState(COMMON_DOMAINS[0]);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);

  useEffect(() => {
    fetchScenarios();
  }, [user.target_role]);

  const fetchScenarios = async () => {
    try {
      const res = await fetch(`/api/scenarios?role=${encodeURIComponent(user.target_role)}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.scenarios) && data.scenarios.length > 0) {
        setScenarios(data.scenarios);
        setSelectedScenario(data.scenarios[0]);
      } else {
        const allRes = await fetch('/api/scenarios');
        const allData = await allRes.json();
        if (allData?.success && Array.isArray(allData.scenarios) && allData.scenarios.length > 0) {
          setScenarios(allData.scenarios);
          setSelectedScenario(allData.scenarios[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateScenario = async () => {
    setIsGeneratingScenario(true);
    setValidationError(null);

    try {
      const res = await fetch('/api/scenarios/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: user.target_role,
          company: targetCompany,
          focusDomain: customDomain,
        }),
      });

      const data = await res.json();
      if (data?.success && data.scenario) {
        setScenarios(prev => [data.scenario, ...prev]);
        setSelectedScenario(data.scenario);
        setCurrentAttempt(null);
        setStudentResponse('');
        setIsGeneratorOpen(false);
      } else {
        setValidationError('Failed to generate scenario. Please try again.');
      }
    } catch (e) {
      console.error('Failed to generate real-time scenario:', e);
      setValidationError('Network error while generating scenario.');
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedScenario) return;

    if (!studentResponse.trim()) {
      setValidationError('Please type out your architectural analysis and trade-offs before submitting.');
      return;
    }

    setValidationError(null);
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
      if (data?.success && data.attempt) {
        setCurrentAttempt(data.attempt);
        setPastAttempts(prev => [data.attempt, ...prev]);
        if (onAttemptSaved) onAttemptSaved();
      } else {
        setValidationError('Evaluation error. Please submit again.');
      }
    } catch (e) {
      console.error('Failed to evaluate scenario:', e);
      setValidationError('Failed to connect to AI evaluation engine.');
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
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-600" /> Real-Time Scenarios
            </span>
            <h1 className="text-xl font-bold text-slate-900">Scenario-Based Interview Simulator</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tackle ambiguous, high-stakes system problems. Evaluated on clarification, assumptions, trade-offs & correctness.
          </p>
        </div>

        {/* Action & Situation Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {scenarios.length > 0 && (
            <select
              value={selectedScenario?.id || ''}
              onChange={(e) => {
                const s = scenarios.find(item => item.id === e.target.value);
                if (s) {
                  setSelectedScenario(s);
                  setCurrentAttempt(null);
                  setStudentResponse('');
                  setValidationError(null);
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500 max-w-[220px] truncate"
            >
              {scenarios.map(sc => (
                <option key={sc.id} value={sc.id}>
                  {sc.title}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsGeneratorOpen(prev => !prev)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-200" />
            <span>Generate New Scenario</span>
          </button>
        </div>
      </div>

      {/* Real-Time Generator Panel */}
      {isGeneratorOpen && (
        <div className="bg-gradient-to-br from-rose-50/80 via-white to-indigo-50/80 rounded-2xl p-6 border border-rose-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Generate Real-Time Placement Interview Scenario</h3>
            </div>
            <button
              onClick={() => setIsGeneratorOpen(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Hiring Company:</label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                {TARGET_COMPANIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Architecture Failure / Incident Domain:</label>
              <select
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                {COMMON_DOMAINS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
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
              onClick={handleGenerateScenario}
              disabled={isGeneratingScenario}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isGeneratingScenario ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Interview Scenario...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Incident Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

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
          {Array.isArray(selectedScenario.technical_constraints) && selectedScenario.technical_constraints.length > 0 && (
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
          )}

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
            <span>Your Architectural & Technical Proposal</span>
          </h3>
          <span className="text-xs text-slate-400">
            {studentResponse.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Structure your thoughts: 1. State clarifying assumptions • 2. Propose component architecture • 3. Address race conditions, data consistency & failover • 4. Evaluate latency vs cost trade-offs.
        </p>

        <textarea
          rows={7}
          value={studentResponse}
          onChange={(e) => {
            setStudentResponse(e.target.value);
            setValidationError(null);
          }}
          placeholder="E.g., 1. Clarification: I assume peak requests are 50k req/sec with an 80/20 read/write ratio.
2. Architecture: Place an API Gateway with an atomic Token Bucket rate limiter in Redis using Lua scripts...
3. Data Store: Use Redis DECR for inventory with write-behind queue to PostgreSQL for durable persistence...
4. Failure Handling: If payment fails, publish compensating transaction event via Kafka to rollback reservation..."
          className="w-full p-4 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white leading-relaxed resize-y"
        />

        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-slate-400">
            Submissions are scored on a 6-category rubric modeled after top-tier hiring standards.
          </div>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating || !studentResponse.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Bar Raiser Evaluating...</span>
              </>
            ) : (
              <>
                <span>Submit for AI Bar Raiser Evaluation</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Evaluation Results Card */}
      {currentAttempt?.evaluation && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                {currentAttempt.evaluation.overall_score}
              </div>
              <div>
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">AI Hiring Bar Assessment</span>
                <h3 className="text-base font-bold text-slate-900">
                  {currentAttempt.evaluation.overall_score >= 80 ? 'Strong Hire / Above Placement Bar' : currentAttempt.evaluation.overall_score >= 65 ? 'Borderline / Needs Polish' : 'Below Technical Bar'}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Score Range: 0 - 100</span>
              <div className="text-xs font-semibold text-slate-700">Evaluated with Gemini 3.8 Flash</div>
            </div>
          </div>

          {/* Category Scores Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              6-Dimension Rubric Scoring:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(currentAttempt.evaluation.category_scores || {}).map(([cat, score]) => (
                <div key={cat} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block capitalize">
                    {cat.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                    {score} pts
                  </span>
                </div>
              ))}
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
                {(currentAttempt.evaluation.strengths || []).map((s, idx) => (
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
                {(currentAttempt.evaluation.missing_considerations || []).map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Feedback */}
          {currentAttempt.evaluation.actionable_feedback && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-800 space-y-1.5">
              <span className="font-bold text-blue-900 block">Senior Mentor Synthesis:</span>
              <p className="leading-relaxed">{currentAttempt.evaluation.actionable_feedback}</p>
            </div>
          )}

          {/* Suggested Practice Drill */}
          {currentAttempt.evaluation.suggested_practice_exercise && (
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-bold text-violet-900 block">Suggested Practice Exercise:</span>
                <p className="text-[11px] text-violet-800 mt-0.5">{currentAttempt.evaluation.suggested_practice_exercise}</p>
              </div>
              <button
                onClick={() => {
                  setStudentResponse('');
                  setCurrentAttempt(null);
                }}
                className="px-3.5 py-1.5 bg-violet-600 text-white font-semibold rounded-lg text-xs hover:bg-violet-700 transition-colors cursor-pointer shrink-0"
              >
                Try Another Attempt
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
