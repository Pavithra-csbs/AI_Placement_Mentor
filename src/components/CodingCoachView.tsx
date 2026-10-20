import React, { useState, useEffect } from 'react';
import { 
  CodingProblem, 
  ProblemTopic, 
  ProblemDifficulty, 
  CodingAttempt,
  UserProfile 
} from '../types/index.ts';
import { 
  Code2, 
  Play, 
  Sparkles, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Search, 
  Filter, 
  RotateCcw, 
  ChevronRight, 
  Terminal, 
  Send,
  Loader2,
  Building2,
  ArrowRight
} from 'lucide-react';

interface CodingCoachViewProps {
  user: UserProfile;
  onAttemptSaved?: () => void;
}

const TOPICS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Topics' },
  { id: 'arrays', label: 'Arrays' },
  { id: 'strings', label: 'Strings' },
  { id: 'linked_lists', label: 'Linked Lists' },
  { id: 'stacks_queues', label: 'Stacks & Queues' },
  { id: 'trees_graphs', label: 'Trees & Graphs' },
  { id: 'dynamic_programming', label: 'Dynamic Programming' },
  { id: 'sql', label: 'SQL' },
];

export const CodingCoachView: React.FC<CodingCoachViewProps> = ({
  user,
  onAttemptSaved,
}) => {
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [topicFilter, setTopicFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'python' | 'javascript' | 'java' | 'sql'>('python');
  const [code, setCode] = useState('');
  const [revealedHintLevel, setRevealedHintLevel] = useState<number>(0);
  const [activeHintContent, setActiveHintContent] = useState<{ title: string; content: string } | null>(null);
  
  // Execution & AI state
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTutorMessage, setAiTutorMessage] = useState<string | null>(null);
  const [studentQuestion, setStudentQuestion] = useState('');

  // Real-Time Problem Generator State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genTopic, setGenTopic] = useState('arrays');
  const [genDifficulty, setGenDifficulty] = useState('Medium');
  const [genCompany, setGenCompany] = useState('Google');
  const [genConcept, setGenConcept] = useState('Sliding Window & Hash Maps');
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const handleGenerateProblem = async () => {
    setIsGeneratingProblem(true);
    setGenError(null);
    try {
      const res = await fetch('/api/coding/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: genTopic,
          difficulty: genDifficulty,
          company: genCompany,
          concept: genConcept,
        }),
      });
      const data = await res.json();
      if (data?.success && data.problem) {
        setProblems(prev => [data.problem, ...prev]);
        setSelectedProblem(data.problem);
        const starter = data.problem.starter_code[language] || data.problem.starter_code.python || '';
        setCode(starter);
        setRevealedHintLevel(0);
        setActiveHintContent(null);
        setTestResult(null);
        setAiTutorMessage(null);
        setIsGeneratorOpen(false);
      } else {
        setGenError('Failed to generate challenge. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setGenError('Network error while generating challenge.');
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [topicFilter, difficultyFilter]);

  const fetchProblems = async () => {
    try {
      const url = `/api/coding/problems?topic=${topicFilter}&difficulty=${difficultyFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.problems.length > 0) {
        setProblems(data.problems);
        if (!selectedProblem || !data.problems.some((p: CodingProblem) => p.id === selectedProblem.id)) {
          loadProblemDetails(data.problems[0].slug);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadProblemDetails = async (slug: string) => {
    try {
      const res = await fetch(`/api/coding/problem/${slug}`);
      const data = await res.json();
      if (data.success && data.problem) {
        setSelectedProblem(data.problem);
        // Reset code editor to selected language starter
        const starter = data.problem.starter_code[language] || data.problem.starter_code.python || '';
        setCode(starter);
        setRevealedHintLevel(0);
        setActiveHintContent(null);
        setTestResult(null);
        setAiTutorMessage(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLanguageChange = (lang: 'python' | 'javascript' | 'java' | 'sql') => {
    setLanguage(lang);
    if (selectedProblem) {
      const starter = selectedProblem.starter_code[lang] || selectedProblem.starter_code.python || '';
      setCode(starter);
    }
  };

  // Progressive Hint Ladder Fetcher
  const requestHint = async (level: number) => {
    if (!selectedProblem) return;
    try {
      const res = await fetch('/api/coding/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: selectedProblem.id, hintLevel: level }),
      });
      const data = await res.json();
      if (data.success) {
        setRevealedHintLevel(Math.max(revealedHintLevel, level));
        setActiveHintContent({ title: data.title, content: data.content });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Safe Code Sandbox Runner
  const handleRunCode = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          code,
          language,
          userId: user.id,
          hintLevel: revealedHintLevel,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setTestResult(data.result);
        if (onAttemptSaved) onAttemptSaved();
      }
    } catch (e) {
      console.error('Code run failed:', e);
    } finally {
      setIsRunning(false);
    }
  };

  // AI Socratic Tutor Review
  const handleAskAiCoach = async () => {
    if (!selectedProblem) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/coding-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: selectedProblem.title,
          problemDescription: selectedProblem.description,
          userCode: code,
          studentQuestion: studentQuestion.trim() || 'Please review my solution and suggest what algorithmic edge case or time complexity I should look into next.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiTutorMessage(data.explanation);
        setStudentQuestion('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredProblems = problems.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.companies.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
              Module 3
            </span>
            <h1 className="text-xl font-bold text-slate-900">AI Coding Coach & Progressive Hints</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Solve curated placement DSA challenges with sandboxed validation and a progressive 4-step hint ladder.
          </p>
        </div>

        {/* Search & Action Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem or company..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setIsGeneratorOpen(prev => !prev)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>{isGeneratorOpen ? 'Close Generator' : 'Generate Real-Time Challenge'}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Problem Generator Panel */}
      {isGeneratorOpen && (
        <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 rounded-2xl p-6 border border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Generate Real-Time Interview Coding Problem</h3>
            </div>
            <button
              onClick={() => setIsGeneratorOpen(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Create an original, sandboxed coding challenge with multi-language starter code, test suites, and 4-tier hints on demand.
          </p>

          {genError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {genError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Topic:</label>
              <select
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="arrays">Arrays & Hashing</option>
                <option value="strings">Strings & Two Pointers</option>
                <option value="linked_lists">Linked Lists</option>
                <option value="stacks_queues">Stacks & Queues</option>
                <option value="trees_graphs">Trees & Graphs</option>
                <option value="dynamic_programming">Dynamic Programming</option>
                <option value="sql">SQL & Relational Logic</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Difficulty:</label>
              <select
                value={genDifficulty}
                onChange={(e) => setGenDifficulty(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Company:</label>
              <select
                value={genCompany}
                onChange={(e) => setGenCompany(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Google">Google</option>
                <option value="Amazon">Amazon</option>
                <option value="Meta">Meta</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Stripe">Stripe</option>
                <option value="Uber">Uber</option>
                <option value="Bloomberg">Bloomberg</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Focus Pattern / Concept:</label>
              <input
                type="text"
                value={genConcept}
                onChange={(e) => setGenConcept(e.target.value)}
                placeholder="e.g. Monotonic Stack, Sliding Window"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setIsGeneratorOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateProblem}
              disabled={isGeneratingProblem}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isGeneratingProblem ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Coding Challenge...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Challenge with Test Cases</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem List & Problem Statement (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Problem Selector Carousel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-700">Select DSA Challenge:</span>
              <span className="text-[11px] text-slate-400">{filteredProblems.length} available</span>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
              {filteredProblems.map((p) => {
                const isSelected = selectedProblem?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => loadProblemDetails(p.slug)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-2 h-2 rounded-full ${
                        p.difficulty === 'Easy' ? 'bg-emerald-400' : p.difficulty === 'Medium' ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                      <span className="truncate">{p.title}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.difficulty}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem Statement Card */}
          {selectedProblem && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    selectedProblem.difficulty === 'Easy' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : selectedProblem.difficulty === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {selectedProblem.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {selectedProblem.topic.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900">{selectedProblem.title}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] text-slate-400 mr-1">Frequently asked by:</span>
                  {selectedProblem.companies.map((c, idx) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-600 font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-700 leading-relaxed">
                {selectedProblem.description}
              </div>

              {/* Examples */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Example Cases
                </span>
                {selectedProblem.examples.map((ex, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs font-mono">
                    <div><span className="text-slate-400">Input: </span><span className="text-slate-800">{ex.input}</span></div>
                    <div><span className="text-slate-400">Output: </span><span className="text-emerald-700 font-bold">{ex.output}</span></div>
                    {ex.explanation && (
                      <div className="text-[11px] text-slate-500 font-sans mt-1">
                        Explanation: {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Constraints
                </span>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5 font-mono">
                  {selectedProblem.constraints.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Progressive 4-Tier Hint Ladder */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900">Progressive Hint Ladder</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Tier {revealedHintLevel}/4 revealed</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Avoid looking at the full solution immediately! Unlock progressive clues step-by-step:
                </p>

                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {[
                    { lvl: 1, label: '1. Concept' },
                    { lvl: 2, label: '2. Algorithm' },
                    { lvl: 3, label: '3. Pseudocode' },
                    { lvl: 4, label: '4. Solution' },
                  ].map((h) => {
                    const isUnlocked = revealedHintLevel >= h.lvl;
                    return (
                      <button
                        key={h.lvl}
                        onClick={() => requestHint(h.lvl)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isUnlocked
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {isUnlocked ? <Unlock className="w-3 h-3 text-amber-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                        {h.label}
                      </button>
                    );
                  })}
                </div>

                {/* Active Hint Content Card */}
                {activeHintContent && (
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
                    <span className="font-bold text-amber-900 block">{activeHintContent.title}</span>
                    <pre className="font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                      {activeHintContent.content}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Code Editor & Sandboxed Runner (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full">
            {/* Editor Toolbar */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-200">Interactive Code Editor</span>
              </div>

              {/* Language Switcher & Reset */}
              <div className="flex items-center gap-2">
                {(['python', 'javascript', 'java', 'sql'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase transition-all cursor-pointer ${
                      language === lang
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {lang}
                  </button>
                ))}

                <button
                  onClick={() => {
                    if (selectedProblem) {
                      setCode(selectedProblem.starter_code[language] || selectedProblem.starter_code.python);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                  title="Reset starter template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Code Input Area */}
            <div className="p-4 bg-slate-900 font-mono text-xs">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs border border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 leading-relaxed resize-y"
                placeholder="# Write your solution here..."
              />
            </div>

            {/* Action Bar */}
            <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                Safe sandboxed evaluation with 2.5s timeout & automated memory isolation
              </div>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Sandbox...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Test Cases</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Execution Output Console */}
            {testResult && (
              <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {testResult.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className={`text-xs font-bold ${
                      testResult.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {testResult.status === 'passed' ? 'All Test Cases Passed!' : 'Tests Failed'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({testResult.tests_passed}/{testResult.total_tests} passed • {testResult.runtime_ms}ms)
                    </span>
                  </div>
                </div>

                {/* Test details list */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {testResult.test_details?.map((td: any, i: number) => (
                    <div 
                      key={i} 
                      className={`p-2.5 rounded-lg text-xs font-mono border ${
                        td.passed 
                          ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200' 
                          : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>Test #{i + 1}: {td.passed ? '✓ Passed' : '✗ Failed'}</span>
                        <span className="text-[10px] text-slate-400">Input: {td.input}</span>
                      </div>
                      <div className="mt-1 flex gap-4 text-[11px]">
                        <div>Expected: <span className="text-slate-300 font-bold">{td.expected}</span></div>
                        <div>Actual: <span className="font-bold">{td.actual}</span></div>
                      </div>
                      {td.error && <div className="text-[10px] text-rose-300 mt-1">{td.error}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Socratic AI Coding Coach Assistant */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">Ask Socratic AI Mentor</h3>
              </div>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-semibold">
                Powered by Gemini 3.8 Flash
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Stuck on edge cases or time complexity? Ask the AI coach for conceptual hints without revealing code spoilers:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={studentQuestion}
                onChange={(e) => setStudentQuestion(e.target.value)}
                placeholder="e.g. Why is my solution exceeding time limit on large inputs?"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAskAiCoach}
                disabled={isAiLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Ask Mentor
              </button>
            </div>

            {aiTutorMessage && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-800 leading-relaxed space-y-2">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Mentor Feedback:
                </div>
                <div className="whitespace-pre-line text-xs">{aiTutorMessage}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
