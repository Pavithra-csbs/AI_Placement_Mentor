import React, { useState, useEffect } from 'react';
import { ResumeData, UserProfile } from '../types/index.ts';
import { 
  FileText, 
  Save, 
  Printer, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Briefcase,
  GraduationCap,
  Award,
  Zap,
  Check
} from 'lucide-react';

interface ResumeBuilderViewProps {
  user: UserProfile;
}

export const ResumeBuilderView: React.FC<ResumeBuilderViewProps> = ({ user }) => {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [atsReview, setAtsReview] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Real-time AI Generation states
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [generatingBulletIdx, setGeneratingBulletIdx] = useState<number | null>(null);

  useEffect(() => {
    fetchResume();
  }, [user.id]);

  const fetchResume = async () => {
    try {
      const res = await fetch('/api/resume');
      const data = await res.json();
      if (data?.success && data.resume) {
        setResume(data.resume);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!resume) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/resume/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume }),
      });
      const data = await res.json();
      if (data?.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiAtsReview = async () => {
    if (!resume) return;
    setIsAiReviewing(true);
    try {
      const res = await fetch('/api/ai/resume-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: { ...resume, target_role: user.target_role } }),
      });
      const data = await res.json();
      if (data?.success && data.review) {
        setAtsReview(data.review);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiReviewing(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!resume) return;
    setIsGeneratingSummary(true);
    try {
      const res = await fetch('/api/resume/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'summary',
          role: user.target_role,
          draft: resume.summary,
        }),
      });
      const data = await res.json();
      if (data?.success && data.summary) {
        setResume({ ...resume, summary: data.summary });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateBullets = async (projIdx: number) => {
    if (!resume || !resume.projects[projIdx]) return;
    setGeneratingBulletIdx(projIdx);
    const proj = resume.projects[projIdx];

    try {
      const res = await fetch('/api/resume/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bullet',
          role: user.target_role,
          projectTitle: proj.title,
          techStack: proj.tech_stack,
        }),
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.bullets)) {
        const copy = [...resume.projects];
        copy[projIdx].bullet_points = [...copy[projIdx].bullet_points, ...data.bullets];
        setResume({ ...resume, projects: copy });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingBulletIdx(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!resume) {
    return (
      <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        <span className="font-semibold text-slate-700">Loading ATS Resume Builder...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              Module 10
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" /> AI XYZ Generator
            </span>
            <h1 className="text-xl font-bold text-slate-900">ATS-Optimized Resume Builder</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build clean, recruiter-screened resumes with verifiable metrics, XYZ achievement bullets, and direct PDF export.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleAiAtsReview}
            disabled={isAiReviewing}
            className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isAiReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-violet-200" />}
            <span>AI ATS Review & Score</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save Resume'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export / Print PDF</span>
          </button>
        </div>
      </div>

      {/* AI ATS Review Results Card */}
      {atsReview && (
        <div className="bg-white rounded-2xl border border-violet-200 shadow-md p-6 space-y-4 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                {atsReview.ats_score}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">ATS Parsing Score</span>
                <h3 className="text-base font-bold text-slate-900">
                  {atsReview.ats_score >= 85 ? 'Excellent ATS Alignment (Top 5% Candidate)' : atsReview.ats_score >= 70 ? 'Good Screening Likelihood' : 'Needs Optimization'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Target Role:</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-violet-50 text-violet-800 border border-violet-200">
                {user.target_role}
              </span>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block text-[10px]">Action Verbs</span>
              <span className="text-base font-bold text-slate-900">{atsReview.score_breakdown?.action_verbs || 22}/25</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block text-[10px]">Quantified Metrics</span>
              <span className="text-base font-bold text-slate-900">{atsReview.score_breakdown?.quantified_metrics || 20}/25</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block text-[10px]">Technical Keywords</span>
              <span className="text-base font-bold text-slate-900">{atsReview.score_breakdown?.technical_keywords || 23}/25</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold block text-[10px]">Formatting Clarity</span>
              <span className="text-base font-bold text-slate-900">{atsReview.score_breakdown?.formatting_clarity || 24}/25</span>
            </div>
          </div>

          {/* Keyword Gaps & Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2">
              <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Detected Keyword Gaps:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(atsReview.keyword_gaps || []).map((k: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-amber-300 text-[11px] text-amber-900 font-medium">
                    + {k}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/70 space-y-2">
              <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Screening Strengths:
              </span>
              <ul className="space-y-1 text-slate-700 text-[11px] list-disc list-inside">
                {(atsReview.top_strengths || []).map((s: string, idx: number) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form Controls (6 Cols) */}
        <div className="lg:col-span-6 space-y-6 no-print">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal & Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={resume.full_name}
                  onChange={(e) => setResume({ ...resume, full_name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Campus Email</label>
                <input
                  type="email"
                  value={resume.email}
                  onChange={(e) => setResume({ ...resume, email: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={resume.phone}
                  onChange={(e) => setResume({ ...resume, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={resume.location}
                  onChange={(e) => setResume({ ...resume, location: e.target.value })}
                  placeholder="Bengaluru, India"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={resume.linkedin}
                  onChange={(e) => setResume({ ...resume, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={resume.github}
                  onChange={(e) => setResume({ ...resume, github: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
            </div>

            {/* Professional Summary with AI Generator */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-700">Professional Summary</label>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Writing Summary...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Generate AI Summary</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={3}
                value={resume.summary}
                onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 font-sans leading-relaxed"
                placeholder="High-yield professional summary highlighting target role and core stacks..."
              />
            </div>
          </div>

          {/* Projects Editor with Real-Time AI XYZ Bullets */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Projects</h3>
                <span className="text-[10px] text-slate-500">Google XYZ formula: Accomplished [X], measured by [Y], by doing [Z]</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newProj = {
                    id: `proj-${Date.now()}`,
                    title: 'New Technical Project',
                    tech_stack: 'Node.js, PostgreSQL, Docker',
                    bullet_points: ['Engineered scalable backend service handling concurrent workloads.'],
                  };
                  setResume({ ...resume, projects: [...resume.projects, newProj] });
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {resume.projects.map((proj, pIdx) => (
              <div key={proj.id || pIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => {
                    const copy = resume.projects.filter((_, idx) => idx !== pIdx);
                    setResume({ ...resume, projects: copy });
                  }}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pr-6">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Project Title</label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const copy = [...resume.projects];
                        copy[pIdx].title = e.target.value;
                        setResume({ ...resume, projects: copy });
                      }}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Technologies Used</label>
                    <input
                      type="text"
                      value={proj.tech_stack}
                      onChange={(e) => {
                        const copy = [...resume.projects];
                        copy[pIdx].tech_stack = e.target.value;
                        setResume({ ...resume, projects: copy });
                      }}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Bullet Points */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Achievement Bullets</label>
                    <button
                      type="button"
                      onClick={() => handleGenerateBullets(pIdx)}
                      disabled={generatingBulletIdx === pIdx}
                      className="text-[10px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {generatingBulletIdx === pIdx ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Generating Bullets...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Generate AI XYZ Bullets</span>
                        </>
                      )}
                    </button>
                  </div>

                  {(proj.bullet_points || []).map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">•</span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const copy = [...resume.projects];
                          copy[pIdx].bullet_points[bIdx] = e.target.value;
                          setResume({ ...resume, projects: copy });
                        }}
                        className="flex-1 px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...resume.projects];
                          copy[pIdx].bullet_points = copy[pIdx].bullet_points.filter((_, idx) => idx !== bIdx);
                          setResume({ ...resume, projects: copy });
                        }}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const copy = [...resume.projects];
                      copy[pIdx].bullet_points.push('');
                      setResume({ ...resume, projects: copy });
                    }}
                    className="text-[11px] text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer mt-1"
                  >
                    + Add bullet point
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Education Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Education Details</h3>
              <button
                type="button"
                onClick={() => {
                  const newEdu = {
                    id: `edu-${Date.now()}`,
                    institution: 'State Technical University',
                    degree: 'B.Tech in Computer Science',
                    field: 'Computer Science',
                    grad_year: '2026',
                    gpa: '8.5 / 10'
                  };
                  setResume({ ...resume, education: [...resume.education, newEdu] });
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Degree
              </button>
            </div>

            {resume.education.map((edu, index) => (
              <div key={edu.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                <button
                  type="button"
                  onClick={() => setResume({
                    ...resume,
                    education: resume.education.filter(e => e.id !== edu.id)
                  })}
                  className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-2 gap-2 text-xs pr-6">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const copy = [...resume.education];
                        copy[index].institution = e.target.value;
                        setResume({ ...resume, education: copy });
                      }}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Degree & Major</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const copy = [...resume.education];
                        copy[index].degree = e.target.value;
                        setResume({ ...resume, education: copy });
                      }}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Graduation Year</label>
                    <input
                      type="text"
                      value={edu.grad_year}
                      onChange={(e) => {
                        const copy = [...resume.education];
                        copy[index].grad_year = e.target.value;
                        setResume({ ...resume, education: copy });
                      }}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">CGPA / Percentage</label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => {
                        const copy = [...resume.education];
                        copy[index].gpa = e.target.value;
                        setResume({ ...resume, education: copy });
                      }}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Categorized Skills */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Skills Categorization</h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Programming Languages</label>
                <input
                  type="text"
                  value={resume.skills.languages.join(', ')}
                  onChange={(e) => setResume({
                    ...resume,
                    skills: { ...resume.skills, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Frameworks & Libraries</label>
                <input
                  type="text"
                  value={resume.skills.frameworks.join(', ')}
                  onChange={(e) => setResume({
                    ...resume,
                    skills: { ...resume.skills, frameworks: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Tools, Cloud & Databases</label>
                <input
                  type="text"
                  value={resume.skills.tools_databases.join(', ')}
                  onChange={(e) => setResume({
                    ...resume,
                    skills: { ...resume.skills, tools_databases: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Core Computer Science Fundamentals</label>
                <input
                  type="text"
                  value={resume.skills.core_concepts.join(', ')}
                  onChange={(e) => setResume({
                    ...resume,
                    skills: { ...resume.skills, core_concepts: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
                  })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: ATS Single-Page Printable Preview Canvas (6 Cols) */}
        <div className="lg:col-span-6">
          <div className="sticky top-20">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between no-print">
              <span>Recruiter ATS Standard Preview</span>
              <span className="text-emerald-600 font-semibold">100% Parsing Safe</span>
            </div>

            {/* Printable Resume Container */}
            <div 
              id="printable-resume" 
              className="bg-white rounded-2xl border border-slate-300 shadow-xl p-8 sm:p-10 font-serif text-slate-900 min-h-[700px] leading-snug space-y-4"
            >
              {/* Header */}
              <div className="text-center border-b border-slate-400 pb-3">
                <h1 className="text-2xl font-bold uppercase tracking-wider font-sans text-slate-900">
                  {resume.full_name || 'STUDENT NAME'}
                </h1>
                <div className="text-[11px] font-sans text-slate-600 mt-1 flex flex-wrap items-center justify-center gap-2">
                  {resume.location && <span>{resume.location}</span>}
                  {resume.phone && <span>• {resume.phone}</span>}
                  {resume.email && <span>• {resume.email}</span>}
                  {resume.linkedin && <span>• LinkedIn</span>}
                  {resume.github && <span>• GitHub</span>}
                </div>
              </div>

              {/* Summary */}
              {resume.summary && (
                <div>
                  <h2 className="text-xs font-bold font-sans uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 text-slate-900">
                    Professional Summary
                  </h2>
                  <p className="text-xs text-slate-800 leading-relaxed font-sans">
                    {resume.summary}
                  </p>
                </div>
              )}

              {/* Education */}
              {resume.education.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold font-sans uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 text-slate-900">
                    Education
                  </h2>
                  <div className="space-y-2">
                    {resume.education.map((edu) => (
                      <div key={edu.id} className="text-xs flex justify-between font-sans">
                        <div>
                          <span className="font-bold text-slate-900">{edu.institution}</span>
                          <span className="text-slate-600 block">{edu.degree} ({edu.gpa})</span>
                        </div>
                        <span className="text-slate-500 font-semibold">{edu.grad_year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              <div>
                <h2 className="text-xs font-bold font-sans uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 text-slate-900">
                  Technical Skills
                </h2>
                <div className="text-xs font-sans space-y-1">
                  {resume.skills.languages.length > 0 && (
                    <div>
                      <span className="font-bold">Languages: </span>
                      <span className="text-slate-800">{resume.skills.languages.join(', ')}</span>
                    </div>
                  )}
                  {resume.skills.frameworks.length > 0 && (
                    <div>
                      <span className="font-bold">Frameworks: </span>
                      <span className="text-slate-800">{resume.skills.frameworks.join(', ')}</span>
                    </div>
                  )}
                  {resume.skills.tools_databases.length > 0 && (
                    <div>
                      <span className="font-bold">Tools & Databases: </span>
                      <span className="text-slate-800">{resume.skills.tools_databases.join(', ')}</span>
                    </div>
                  )}
                  {resume.skills.core_concepts.length > 0 && (
                    <div>
                      <span className="font-bold">Core Concepts: </span>
                      <span className="text-slate-800">{resume.skills.core_concepts.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Projects */}
              {resume.projects.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold font-sans uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 text-slate-900">
                    Key Projects
                  </h2>
                  <div className="space-y-3 font-sans">
                    {resume.projects.map((proj) => (
                      <div key={proj.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-900">{proj.title}</span>
                          <span className="text-slate-500 italic text-[11px]">{proj.tech_stack}</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-800">
                          {(proj.bullet_points || []).map((bp, bIdx) => (
                            <li key={bIdx} className="leading-snug">{bp}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
