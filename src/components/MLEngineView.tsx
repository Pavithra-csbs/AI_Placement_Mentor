import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types/index.ts';
import { 
  BrainCircuit, 
  RotateCw, 
  CheckCircle2, 
  Terminal, 
  Sparkles, 
  Layers, 
  Database, 
  FileCode2, 
  Activity,
  Play,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface MLEngineViewProps {
  user: UserProfile;
}

export const MLEngineView: React.FC<MLEngineViewProps> = ({ user }) => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const [trainOutput, setTrainOutput] = useState<string | null>(null);

  // Playground state
  const [testSkills, setTestSkills] = useState(user.current_skills.join(', '));
  const [testInterests, setTestInterests] = useState(user.interests.join(', ') || 'distributed systems algorithms cloud');
  const [playgroundOutput, setPlaygroundOutput] = useState<any | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ml/metrics');
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    setTrainOutput(null);
    try {
      const res = await fetch('/api/ml/train', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTrainOutput(data.output);
        fetchMetrics();
      } else {
        setTrainOutput(data.error || 'Failed to train');
      }
    } catch (e: any) {
      setTrainOutput(e.message);
    } finally {
      setIsRetraining(false);
    }
  };

  const handleRunPlayground = async () => {
    setIsComputing(true);
    try {
      const skillsArray = testSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/ml/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_profile: {
            role: user.target_role,
            skills: skillsArray,
            interests: testInterests,
            coding_success_rate: 0.75,
            quiz_accuracy: 0.8
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setPlaygroundOutput(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsComputing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
              Module 6 & 7
            </span>
            <h1 className="text-xl font-bold text-slate-900">Python Scikit-Learn Machine Learning Engine</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real trained Logistic Regression difficulty classifier, TF-IDF vectorizer, and Cosine Similarity recommendation matrix.
          </p>
        </div>

        {/* Retrain Action */}
        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isRetraining ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Training Model via Python 3...</span>
            </>
          ) : (
            <>
              <RotateCw className="w-3.5 h-3.5" />
              <span>Re-Train Scikit-Learn Pipeline</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Output if re-trained */}
      {trainOutput && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 space-y-1">
          <div className="text-slate-400 font-bold mb-1 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-400" /> Python 3.10 Subprocess Training Log:
          </div>
          <pre className="whitespace-pre-wrap">{trainOutput}</pre>
        </div>
      )}

      {/* Actual Scikit-Learn Evaluation Metrics Grid */}
      {metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Held-Out Accuracy
              </span>
              <div className="mt-2 text-3xl font-extrabold text-blue-600">
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Evaluated on 25% test split ({metrics.test_samples} unseen samples)</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Weighted F1-Score
              </span>
              <div className="mt-2 text-3xl font-extrabold text-indigo-600">
                {(metrics.f1_score_weighted * 100).toFixed(1)}%
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Harmonic mean of precision & recall</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Weighted Precision
              </span>
              <div className="mt-2 text-3xl font-extrabold text-violet-600">
                {(metrics.precision_weighted * 100).toFixed(1)}%
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Correct positive predictions</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Weighted Recall
              </span>
              <div className="mt-2 text-3xl font-extrabold text-teal-600">
                {(metrics.recall_weighted * 100).toFixed(1)}%
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Total actual positives captured</p>
            </div>
          </div>

          {/* Model Architecture & Saved Artifacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model Architecture Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Machine Learning Pipeline Specs</h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block">Classifier Algorithm:</span>
                  <span className="font-mono text-indigo-700">{metrics.model_type}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block">Feature Extraction:</span>
                  <span className="font-mono text-indigo-700">{metrics.vectorizer}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                  <div>
                    <span className="font-bold text-slate-700 block">Training Dataset Size:</span>
                    <span>{metrics.train_samples} samples</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">Held-out Test Size:</span>
                    <span>{metrics.test_samples} samples</span>
                  </div>
                </div>
              </div>

              {/* Saved Artifacts */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Verified Saved Pickle Artifacts:
                </span>
                <div className="space-y-1.5">
                  {(metrics.artifacts_saved || []).map((art: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{art}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confusion Matrix Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Held-Out Confusion Matrix</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">3x3 Multiclass</span>
              </div>

              <p className="text-xs text-slate-500">
                Ground truth rows vs predicted difficulty columns on held-out evaluation test set:
              </p>

              {metrics.confusion_matrix && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="text-slate-400 font-sans font-bold text-[10px]">Actual \ Pred</div>
                    <div className="font-bold text-indigo-700 bg-indigo-50 py-1 rounded-md">Easy</div>
                    <div className="font-bold text-indigo-700 bg-indigo-50 py-1 rounded-md">Medium</div>
                    <div className="font-bold text-indigo-700 bg-indigo-50 py-1 rounded-md">Hard</div>

                    {['Easy', 'Medium', 'Hard'].map((rowLabel, rIdx) => (
                      <React.Fragment key={rIdx}>
                        <div className="font-bold text-slate-700 py-1 text-left">{rowLabel}</div>
                        {metrics.confusion_matrix[rIdx]?.map((val: number, cIdx: number) => (
                          <div 
                            key={cIdx} 
                            className={`py-1 rounded-md font-bold text-xs ${
                              rIdx === cIdx 
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                                : val > 0 
                                ? 'bg-amber-50 text-amber-900' 
                                : 'text-slate-300'
                            }`}
                          >
                            {val}
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400">
                Diagonal elements represent correct predictions. Notice high precision on distinguishing Easy vs Hard problem profiles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive TF-IDF & Cosine Similarity Recommendation Playground */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Scikit-Learn TF-IDF & Cosine Similarity Playground
            </h3>
          </div>
          <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-md">
            Live Python Subprocess Bridge
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Experiment with how student target skills and interest keywords transform through our fitted TF-IDF vectorizer and compute cosine similarity against placement catalog items:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Current Candidate Skills</label>
            <input
              type="text"
              value={testSkills}
              onChange={(e) => setTestSkills(e.target.value)}
              placeholder="e.g. Python, SQL, Docker, Kafka"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Interest Keywords</label>
            <input
              type="text"
              value={testInterests}
              onChange={(e) => setTestInterests(e.target.value)}
              placeholder="e.g. distributed systems, microservices, RAG"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleRunPlayground}
            disabled={isComputing}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isComputing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            Compute TF-IDF & Cosine Similarity
          </button>
        </div>

        {/* Playground Results */}
        {playgroundOutput && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200">
              <span>Classified Mastery Level: {playgroundOutput.target_difficulty}</span>
              <span className="text-indigo-600">Model Predicted: {playgroundOutput.predicted_difficulty}</span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Ranked Recommendations by Cosine Similarity & Domain Match:
              </span>
              {playgroundOutput.ranked_items?.slice(0, 4).map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <span className="text-[11px] text-slate-500 ml-2">({item.domain})</span>
                    <div className="text-[11px] text-teal-800 mt-0.5">{item.recommendation_reason}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-indigo-600 text-sm">{Math.round(item.match_score * 100)}%</span>
                    <span className="block text-[10px] text-slate-400">Cosine: {item.cosine_similarity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
