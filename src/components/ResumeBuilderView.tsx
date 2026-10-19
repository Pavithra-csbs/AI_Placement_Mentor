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
  Download,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Award
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

  useEffect(() => {
    fetchResume();
  }, [user.id]);

  const fetchResume = async () => {
    try {
      const res = await fetch('/api/resume');
      const data = await res.json();
      if (data.success && data.resume) {
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
      if (data.success) {
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
      if (data.success && data.review) {
        setAtsReview(data.review);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiReviewing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!resume) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
        Loading ATS resume builder...
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
            <h1 className="text-xl font-bold text-slate-900">ATS-Optimized Resume Builder</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build clean, recruiter-screened resumes with verifiable metrics, XYZ achievement bullets, and direct PDF export.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAiAtsReview}
            disabled={isAiReviewing}
            className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isAiReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            AI ATS Review & Score
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save Resume'}
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* AI ATS Review Score Banner if triggered */}
      {atsReview && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200 shadow-xs space-y-4 no-print">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
                {atsReview.ats_score}%
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">ATS Screening Index</span>
                <h3 className="text-base font-bold text-slate-900">
                  Resume Match: {atsReview.ats_score >= 85 ? 'Excellent Alignment' : atsReview.ats_score >= 70 ? 'Competitive' : 'Needs Optimization'}
                </h3>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500">
              Target Specialization: <span className="font-bold text-slate-800">{user.target_role}</span>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 bg-white rounded-xl border border-indigo-100">
              <span className="text-slate-400 block text-[10px]">Action Verbs</span>
              <span className="font-bold text-slate-800">{atsReview.score_breakdown?.action_verbs}/25</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-indigo-100">
              <span className="text-slate-400 block text-[10px]">Quantified Impact</span>
              <span className="font-bold text-slate-800">{atsReview.score_breakdown?.quantified_metrics}/25</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-indigo-100">
              <span className="text-slate-400 block text-[10px]">Technical Keywords</span>
              <span className="font-bold text-slate-800">{atsReview.score_breakdown?.technical_keywords}/25</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-indigo-100">
              <span className="text-slate-400 block text-[10px]">ATS Layout Safety</span>
              <span className="font-bold text-slate-800">{atsReview.score_breakdown?.formatting_clarity}/25</span>
            </div>
          </div>

          {/* Suggested Keyword Gaps */}
          {atsReview.keyword_gaps?.length > 0 && (
            <div className="p-3 rounded-xl bg-white border border-indigo-100 text-xs">
              <span className="font-bold text-slate-900 block mb-1">Recommended Keyword Additions for {user.target_role}:</span>
              <div className="flex flex-wrap gap-1.5">
                {atsReview.keyword_gaps.map((kw: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Improved Bullets */}
          {atsReview.improved_bullet_points?.length > 0 && (
            <div className="p-3.5 rounded-xl bg-white border border-indigo-100 text-xs space-y-2">
              <span className="font-bold text-slate-900 block">Google XYZ Format Bullet Recommendations:</span>
              {atsReview.improved_bullet_points.map((bp: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[11px] text-slate-500 line-through">Before: {bp.original}</div>
                  <div className="text-[11px] font-semibold text-emerald-800">After: {bp.improved}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor & Live ATS Preview Split Layout */}
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

            {/* Summary */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Professional Summary</label>
              <textarea
                rows={3}
                value={resume.summary}
                onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 font-sans"
              />
            </div>
          </div>

          {/* Education Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Education Details</h3>
              <button
                onClick={() => {
                  const newEdu = {
                    id: `edu-${Date.now()}`,
                    institution: 'College of Engineering',
                    degree: 'B.Tech in Computer Science',
                    field: 'Computer Science',
                    grad_year: '2026',
                    gpa: '8.5 / 10'
                  };
                  setResume({ ...resume, education: [...resume.education, newEdu] });
                }}
                className="text-xs text-blue-600 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add College
              </button>
            </div>

            {resume.education.map((edu, index) => (
              <div key={edu.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                <button
                  onClick={() => setResume({
                    ...resume,
                    education: resume.education.filter(e => e.id !== edu.id)
                  })}
                  className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="grid grid-cols-2 gap-2 text-xs">
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
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300"
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
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300"
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
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300"
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
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300"
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
                <label className="block text-[11px] font-semibold text-slate-700">Programming Languages (comma-separated)</label>
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
                <label className="block text-[11px] font-semibold text-slate-700">Frameworks & Libraries (comma-separated)</label>
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
                <label className="block text-[11px] font-semibold text-slate-700">Core Computer Science Concepts</label>
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
                      <div key={edu.id} className="text-xs font-sans flex justify-between items-baseline">
                        <div>
                          <div className="font-bold text-slate-900">{edu.institution}</div>
                          <div className="text-slate-700">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-600">{edu.grad_year}</div>
                          {edu.gpa && <div className="text-slate-700 font-semibold">GPA: {edu.gpa}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              <div>
                <h2 className="text-xs font-bold font-sans uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 text-slate-900">
                  Technical Skills
                </h2>
                <div className="text-xs font-sans space-y-1">
                  {resume.skills.languages.length > 0 && (
                    <div><span className="font-bold">Languages:</span> {resume.skills.languages.join(', ')}</div>
                  )}
                  {resume.skills.frameworks.length > 0 && (
                    <div><span className="font-bold">Frameworks:</span> {resume.skills.frameworks.join(', ')}</div>
                  )}
                  {resume.skills.tools_databases.length > 0 && (
                    <div><span className="font-bold">Databases & Tools:</span> {resume.skills.tools_databases.join(', ')}</div>
                  )}
                  {resume.skills.core_concepts.length > 0 && (
                    <div><span className="font-bold">Core Competencies:</span> {resume.skills.core_concepts.join(', ')}</div>
                  )}
                </div>
              </div>

              {/* Projects */}
              {resume.projects.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold font-sans uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 text-slate-900">
                    Key Technical Projects
                  </h2>
                  <div className="space-y-2.5">
                    {resume.projects.map((proj) => (
                      <div key={proj.id} className="text-xs font-sans">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900">{proj.title}</span>
                          <span className="text-[11px] text-slate-600 italic">{proj.tech_stack}</span>
                        </div>
                        <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-800">
                          {proj.bullet_points.map((bp, i) => (
                            <li key={i} className="leading-snug">{bp}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience / Internships */}
              {resume.experience.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold font-sans uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 text-slate-900">
                    Work Experience & Internships
                  </h2>
                  <div className="space-y-2">
                    {resume.experience.map((exp) => (
                      <div key={exp.id} className="text-xs font-sans">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900">{exp.role} • {exp.company}</span>
                          <span className="text-slate-600">{exp.duration}</span>
                        </div>
                        <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-800">
                          {exp.bullet_points.map((bp, i) => (
                            <li key={i} className="leading-snug">{bp}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications & Achievements */}
              {(resume.certifications.length > 0 || resume.achievements.length > 0) && (
                <div>
                  <h2 className="text-xs font-bold font-sans uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5 text-slate-900">
                    Certifications & Achievements
                  </h2>
                  <ul className="list-disc list-inside text-xs font-sans space-y-0.5 text-slate-800">
                    {resume.certifications.map((c) => (
                      <li key={c.id}>
                        <span className="font-semibold">{c.name}</span> — {c.issuer} ({c.year})
                      </li>
                    ))}
                    {resume.achievements.map((ach, idx) => (
                      <li key={idx}>{ach}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
