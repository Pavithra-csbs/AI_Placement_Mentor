import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizAttempt, UserProfile, DailyTechPoster } from '../types/index.ts';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Award, 
  ArrowRight, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  ShieldCheck,
  Loader2,
  AlertCircle,
  Zap
} from 'lucide-react';

interface DailyQuizViewProps {
  user: UserProfile;
  initialPosterId?: string;
  onNavigateToPoster?: (posterId: string) => void;
  onStreakUpdated?: () => void;
}

export const DailyQuizView: React.FC<DailyQuizViewProps> = ({
  user,
  initialPosterId,
  onNavigateToPoster,
  onStreakUpdated,
}) => {
  const [posters, setPosters] = useState<DailyTechPoster[]>([]);
  const [selectedPosterId, setSelectedPosterId] = useState<string>(initialPosterId || '');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedAttempt, setSubmittedAttempt] = useState<QuizAttempt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [pastAttempts, setPastAttempts] = useState<QuizAttempt[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    fetchPostersAndAttempts();
  }, []);

  useEffect(() => {
    if (initialPosterId) {
      setSelectedPosterId(initialPosterId);
    }
  }, [initialPosterId]);

  useEffect(() => {
    if (selectedPosterId) {
      fetchQuestions(selectedPosterId);
      setSelectedAnswers({});
      setSubmittedAttempt(null);
      setErrorMessage(null);
      setValidationError(null);
    }
  }, [selectedPosterId]);

  const fetchPostersAndAttempts = async () => {
    try {
      const pRes = await fetch('/api/posters');
      const pData = await pRes.json();
      if (pData?.success && Array.isArray(pData.posters) && pData.posters.length > 0) {
        setPosters(pData.posters);
        if (!selectedPosterId) {
          setSelectedPosterId(pData.posters[0].id);
        }
      }

      const aRes = await fetch('/api/quiz/attempts');
      const aData = await aRes.json();
      if (aData?.success && Array.isArray(aData.attempts)) {
        setPastAttempts(aData.attempts);
      }
    } catch (e: any) {
      console.error('Failed to fetch posters/attempts:', e);
      setErrorMessage('Could not load quiz archive. Showing active questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestions = async (posterId: string) => {
    if (!posterId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/quiz/${encodeURIComponent(posterId)}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        setQuestions([]);
      }
    } catch (e: any) {
      console.error('Failed to load questions:', e);
      setErrorMessage('Failed to load questions for this concept.');
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAiQuiz = async () => {
    const poster = posters.find(p => p.id === selectedPosterId);
    setIsAiGenerating(true);
    setErrorMessage(null);
    setValidationError(null);

    try {
      const res = await fetch('/api/quiz/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posterId: selectedPosterId || 'poster-custom',
          topic: poster?.title || 'System Design & Computer Science Fundamentals',
          count: 4,
        }),
      });

      const data = await res.json();
      if (data?.success && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setSelectedAnswers({});
        setSubmittedAttempt(null);
      } else {
        setErrorMessage('Could not generate AI questions. Please try again.');
      }
    } catch (e) {
      console.error('AI quiz generation error:', e);
      setErrorMessage('Failed to generate real-time questions.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submittedAttempt) return; // Locked once submitted
    setValidationError(null);
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (questions.length === 0) return;

    if (Object.keys(selectedAnswers).length < questions.length) {
      setValidationError(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(selectedAnswers).map(([qId, sIdx]) => ({
        question_id: qId,
        selected_index: sIdx,
      }));

      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          posterId: selectedPosterId,
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();
      if (data?.success && data.attempt) {
        setSubmittedAttempt(data.attempt);
        setPastAttempts(prev => [data.attempt, ...prev]);
        if (onStreakUpdated) onStreakUpdated();
      } else {
        setValidationError('Failed to record attempt. Please try submitting again.');
      }
    } catch (e) {
      console.error('Submit quiz error:', e);
      setValidationError('Failed to submit quiz attempt. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPoster = posters.find(p => p.id === selectedPosterId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              Module 5
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-600" /> Real-Time Engine
            </span>
            <h1 className="text-xl font-bold text-slate-900">Daily Concept Verification Quiz</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Answer technical questions with real-time distractor explanations and maintain your placement streak.
          </p>
        </div>

        {/* Action Buttons & Concept Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {posters.length > 0 && (
            <select
              value={selectedPosterId}
              onChange={(e) => setSelectedPosterId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 max-w-[200px] truncate"
            >
              {posters.map(p => (
                <option key={p.id} value={p.id}>
                  {p?.title ? p.title.split(':')[0] : 'Concept'} ({p?.date || 'Today'})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleGenerateAiQuiz}
            disabled={isAiGenerating || isLoading}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isAiGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>Generate Fresh AI Quiz</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error / Alert banners */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {validationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Quiz Concept Context Card */}
      {currentPoster && (
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Active Concept</span>
              <h2 className="text-sm font-bold text-slate-900">{currentPoster.title}</h2>
            </div>
          </div>
          {onNavigateToPoster && (
            <button
              onClick={() => onNavigateToPoster(currentPoster.id)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer shrink-0 ml-2"
            >
              Read Poster First <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Score Result Card (when submitted) */}
      {submittedAttempt && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 text-slate-900 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Assessment Result</span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Scored {submittedAttempt.score} out of {submittedAttempt.total} ({submittedAttempt.total > 0 ? Math.round((submittedAttempt.score / submittedAttempt.total) * 100) : 0}%)
                </h3>
              </div>
            </div>

            {/* Streak Badge */}
            <div className="p-3 rounded-xl bg-white/80 border border-emerald-200 text-left sm:text-right">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 sm:justify-end">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>Streak Protected</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Verified placement streak calculation ({submittedAttempt.date || 'Today'})</p>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Review the detailed feedback below to understand why the correct option is optimal and why the other choices are common interview traps.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading || isAiGenerating ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="font-semibold text-slate-700">
            {isAiGenerating ? 'Generating real-time interview questions with Gemini AI...' : 'Loading concept verification questions...'}
          </span>
          <span className="text-slate-400 text-[11px]">Crafting technical scenarios, distractor traps, and in-depth explanations</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-600 text-xs space-y-4">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">No questions found for this concept</h3>
            <p className="text-slate-400 text-xs mt-1">Generate a fresh set of real-time questions customized for this topic with one click.</p>
          </div>
          <button
            onClick={handleGenerateAiQuiz}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Generate Real-Time AI Quiz</span>
          </button>
        </div>
      ) : (
        /* Questions List */
        <div className="space-y-6">
          {questions.map((q, qIndex) => {
            if (!q) return null;
            const qId = q.id || `q-${qIndex}`;
            const selectedOption = selectedAnswers[qId];
            const userResult = submittedAttempt?.answers?.find(a => a.question_id === qId);
            const isCorrect = userResult ? Boolean(userResult.is_correct) : false;

            return (
              <div 
                key={qId}
                className={`p-6 rounded-2xl border transition-all ${
                  submittedAttempt 
                    ? isCorrect 
                      ? 'bg-white border-emerald-300 shadow-xs' 
                      : 'bg-white border-rose-300 shadow-xs'
                    : 'bg-white border-slate-200/90 shadow-xs'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      Q{qIndex + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  {submittedAttempt && (
                    <div className="shrink-0">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Incorrect
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {(q.options || []).map((opt, oIdx) => {
                    const isThisSelected = selectedOption === oIdx;
                    const isThisCorrect = q.correct_index === oIdx;

                    let optionStyle = 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-800';

                    if (submittedAttempt) {
                      if (isThisCorrect) {
                        optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                      } else if (isThisSelected && !isThisCorrect) {
                        optionStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                      } else {
                        optionStyle = 'border-slate-200 opacity-60 bg-slate-50 text-slate-600';
                      }
                    } else if (isThisSelected) {
                      optionStyle = 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold ring-1 ring-blue-600';
                    }

                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOption(qId, oIdx)}
                        className={`p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isThisSelected 
                            ? 'border-blue-600 bg-blue-600 text-white' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanations section (shown after submission) */}
                {submittedAttempt && (
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                    {/* Correct Explanation */}
                    {q.explanation_correct && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-950">
                        <span className="font-bold block mb-1 flex items-center gap-1.5 text-emerald-900">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Explanation of Correct Answer:
                        </span>
                        <p className="leading-relaxed">{q.explanation_correct}</p>
                      </div>
                    )}

                    {/* Distractor Explanation */}
                    {Array.isArray(q.explanation_distractors) && q.explanation_distractors.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <span className="font-bold block mb-1 text-slate-900">
                          Why the other choices are incorrect (Interview Distractors & Traps):
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                          {q.explanation_distractors.map((d, dIdx) => (
                            <li key={dIdx}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit / Retake Action Button */}
      {questions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/60">
          <div className="text-xs text-slate-500">
            {Object.keys(selectedAnswers).length} of {questions.length} questions answered
          </div>

          <div className="flex items-center gap-3">
            {submittedAttempt ? (
              <button
                onClick={() => {
                  setSubmittedAttempt(null);
                  setSelectedAnswers({});
                  setValidationError(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retake Concept Quiz
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting || Object.keys(selectedAnswers).length < questions.length}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating Answers...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answers & Record Streak</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Past Quiz Attempts Table */}
      {pastAttempts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Your Historical Quiz Attempts
          </h3>
          <div className="divide-y divide-slate-100">
            {pastAttempts.slice(0, 5).map((att) => (
              <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">{att.date || 'Past Attempt'}</span>
                  <span className="text-slate-400 ml-2">({(att.poster_id || '').replace('poster-', '')})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{att.score}/{att.total}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    {att.total > 0 ? Math.round((att.score / att.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
