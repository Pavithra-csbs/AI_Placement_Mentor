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
  AlertCircle
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
  const [pastAttempts, setPastAttempts] = useState<QuizAttempt[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      // Reset active form on poster switch
      setSelectedAnswers({});
      setSubmittedAttempt(null);
      setErrorMessage(null);
    }
  }, [selectedPosterId]);

  const fetchPostersAndAttempts = async () => {
    try {
      const pRes = await fetch('/api/posters');
      const pData = await pRes.json();
      if (pData.success && Array.isArray(pData.posters) && pData.posters.length > 0) {
        setPosters(pData.posters);
        if (!selectedPosterId) {
          setSelectedPosterId(pData.posters[0].id);
        }
      }

      const aRes = await fetch('/api/quiz/attempts');
      const aData = await aRes.json();
      if (aData.success && Array.isArray(aData.attempts)) {
        setPastAttempts(aData.attempts);
      }
    } catch (e: any) {
      console.error('Failed to fetch posters/attempts:', e);
      setErrorMessage('Could not load quiz questions. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestions = async (posterId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/quiz/${posterId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
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

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submittedAttempt) return; // Locked once submitted
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (questions.length === 0) return;

    if (Object.keys(selectedAnswers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

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
      if (data.success && data.attempt) {
        setSubmittedAttempt(data.attempt);
        setPastAttempts(prev => [data.attempt, ...prev]);
        if (onStreakUpdated) onStreakUpdated();
      }
    } catch (e) {
      console.error('Submit quiz error:', e);
      alert('Failed to submit quiz attempt. Please try again.');
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
            <h1 className="text-xl font-bold text-slate-900">Daily Concept Verification Quiz</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Answer 3-5 technical questions, review deep distractor explanations, and maintain your placement streak.
          </p>
        </div>

        {/* Poster Selector */}
        {posters.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Concept:</span>
            <select
              value={selectedPosterId}
              onChange={(e) => setSelectedPosterId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {posters.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title ? p.title.split(':')[0] : 'Concept'} ({p.date || 'Today'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quiz Concept Context Card */}
      {currentPoster && (
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Concept Context</span>
              <h2 className="text-sm font-bold text-slate-900">{currentPoster.title}</h2>
            </div>
          </div>
          {onNavigateToPoster && (
            <button
              onClick={() => onNavigateToPoster(currentPoster.id)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              Read Poster First <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Score Result Card (when submitted) */}
      {submittedAttempt && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 text-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Assessment Result</span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Scored {submittedAttempt.score} out of {submittedAttempt.total} ({submittedAttempt.total > 0 ? Math.round((submittedAttempt.score / submittedAttempt.total) * 100) : 0}%)
                </h3>
              </div>
            </div>

            {/* Streak Badge with anti-double-counting explanation */}
            <div className="p-3 rounded-xl bg-white/80 border border-emerald-200 text-right">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 justify-end">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>Streak Protected</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Anti-double counting verified for today ({submittedAttempt.date || 'Today'})</p>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Review the detailed feedback below to understand why the correct option is optimal and why the other choices are common interview traps.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading concept verification questions...</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          No questions available for this concept yet. Please select another concept from the archive above.
        </div>
      ) : (
        /* Questions List */
        <div className="space-y-6">
          {questions.map((q, qIndex) => {
            const selectedOption = selectedAnswers[q.id];
            const isAnswered = selectedOption !== undefined;
            const userResult = submittedAttempt?.answers?.find(a => a.question_id === q.id);
            const isCorrect = userResult ? Boolean(userResult.is_correct) : false;

            return (
              <div 
                key={q.id || qIndex}
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
                        onClick={() => handleSelectOption(q.id, oIdx)}
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

                    {/* Distractor Explanation (if user got it wrong or wants deeper knowledge) */}
                    {Array.isArray(q.explanation_distractors) && q.explanation_distractors.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <span className="font-bold block mb-1 text-slate-900">
                          Why the other choices are incorrect (Interview Distractors):
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
        <div className="flex items-center justify-between pt-4">
          <div className="text-xs text-slate-500">
            {Object.keys(selectedAnswers).length} of {questions.length} questions answered
          </div>

          {submittedAttempt ? (
            <button
              onClick={() => {
                setSubmittedAttempt(null);
                setSelectedAnswers({});
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
              {isSubmitting ? 'Evaluating...' : 'Submit Answers & Record Streak'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
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
