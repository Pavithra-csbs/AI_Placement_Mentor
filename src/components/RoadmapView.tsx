import React, { useState, useEffect } from 'react';
import { JobRole, Roadmap, RoleInfo } from '../types/index.ts';
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  BookOpen, 
  Video, 
  Code, 
  FileText, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight,
  Compass,
  Loader2,
  X,
  Zap,
  Target
} from 'lucide-react';

interface RoadmapViewProps {
  currentRole: JobRole;
  onRoleChange: (role: JobRole) => void;
}

const DEFAULT_ROLES: JobRole[] = [
  'Software Developer',
  'Data Analyst',
  'Data Scientist',
  'AI/ML Engineer',
  'Cybersecurity Analyst',
  'Cloud Engineer'
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  currentRole,
  onRoleChange,
}) => {
  const [availableRoles, setAvailableRoles] = useState<JobRole[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState<JobRole>(currentRole);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    p1: true,
    p2: true,
    p3: false,
    p4: false,
  });

  // Generator State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [customLevel, setCustomLevel] = useState('Intermediate (3rd/4th Year)');
  const [customKeywords, setCustomKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    fetchRolesList();
  }, []);

  useEffect(() => {
    fetchRoadmap(selectedRole);
  }, [selectedRole]);

  const fetchRolesList = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (data?.success && Array.isArray(data.roles)) {
        const titles = data.roles.map((r: any) => r.id || r.title);
        const merged = Array.from(new Set([...DEFAULT_ROLES, ...titles]));
        setAvailableRoles(merged);
      }
    } catch (e) {
      console.error('Failed to fetch roles:', e);
    }
  };

  const fetchRoadmap = async (role: JobRole) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/roadmap/${encodeURIComponent(role)}`);
      const data = await res.json();
      if (data?.success && data.roadmap) {
        setRoadmap(data.roadmap);
      }
    } catch (e) {
      console.error('Failed to load roadmap:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAiRoadmap = async () => {
    if (!customRoleInput.trim()) {
      setGenError('Please specify the target career or engineering specialization.');
      return;
    }

    setIsGenerating(true);
    setGenError(null);

    try {
      const res = await fetch('/api/roadmap/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: customRoleInput.trim(),
          experienceLevel: customLevel,
          durationWeeks: 16,
          focusKeywords: customKeywords.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (data?.success && data.roadmap) {
        const newRoleName = data.roadmap.role_id || customRoleInput.trim();
        setAvailableRoles(prev => Array.from(new Set([newRoleName, ...prev])));
        setSelectedRole(newRoleName);
        onRoleChange(newRoleName);
        setRoadmap(data.roadmap);
        setIsGeneratorOpen(false);
        setCustomRoleInput('');
        setCustomKeywords('');
      } else {
        setGenError('Failed to synthesize custom roadmap. Please try again.');
      }
    } catch (e) {
      console.error('Failed to generate roadmap:', e);
      setGenError('Network error while generating AI roadmap.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMilestone = async (weekNumber: number) => {
    if (!roadmap) return;
    try {
      const res = await fetch('/api/roadmap/milestone/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, weekNumber }),
      });
      const data = await res.json();
      if (data?.success) {
        const updatedPhases = roadmap.phases.map(p => ({
          ...p,
          milestones: p.milestones.map(m => 
            m.week_number === weekNumber ? { ...m, is_completed: data.completed } : m
          )
        }));
        setRoadmap({ ...roadmap, phases: updatedPhases });
      }
    } catch (e) {
      console.error('Failed to toggle milestone:', e);
    }
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const allMilestones = roadmap?.phases?.flatMap(p => p.milestones || []) || [];
  const completedCount = allMilestones.filter(m => m.is_completed).length;
  const totalCount = allMilestones.length || 1;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  const nextMilestone = allMilestones.find(m => !m.is_completed);

  return (
    <div className="space-y-6">
      {/* Header & Role Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                Module 2
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-600" /> Real-Time Curriculums
              </span>
              <h1 className="text-xl font-bold text-slate-900">Career Placement Roadmap</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Beginner-to-advanced curriculum with verified prerequisites, curated resources, and milestone tracking.
            </p>
          </div>

          {/* Actions & Progress Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsGeneratorOpen(prev => !prev)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>{isGeneratorOpen ? 'Close Generator' : 'Generate Custom AI Roadmap'}</span>
            </button>

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl">
              <div>
                <div className="text-[10px] font-semibold text-slate-500">Mastery</div>
                <div className="text-xs font-bold text-blue-600">{completedCount} of {totalCount}</div>
              </div>
              <div className="w-14 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700">{completionPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Real-Time Generator Drawer */}
        {isGeneratorOpen && (
          <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 rounded-2xl p-5 border border-blue-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Generate Real-Time Placement Career Roadmap</h3>
              </div>
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Create a personalized, 16-week structured milestone path tailored to any specialized role or technology stack.
            </p>

            {genError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {genError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Career Role:</label>
                <input
                  type="text"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  placeholder="e.g. Full-Stack AI Engineer, SRE, Quant Developer"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Candidate Level:</label>
                <select
                  value={customLevel}
                  onChange={(e) => setCustomLevel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Beginner (1st/2nd Year)">Beginner (1st/2nd Year)</option>
                  <option value="Intermediate (3rd/4th Year)">Intermediate (3rd/4th Year)</option>
                  <option value="Job Ready / Graduate">Job Ready / Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Focus Tooling & Frameworks:</label>
                <input
                  type="text"
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  placeholder="e.g. Kubernetes, Go, Kafka, Docker, PyTorch"
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
                onClick={handleGenerateAiRoadmap}
                disabled={isGenerating || !customRoleInput.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Architecting 16-Week Curriculum...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Structured Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Role Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {availableRoles.map((role) => (
            <button
              key={role}
              onClick={() => { setSelectedRole(role); onRoleChange(role); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRole === role
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Next Recommended Step Banner */}
      {nextMilestone && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Recommended Immediate Next Step
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 font-bold text-blue-800">
                  Week {nextMilestone.week_number}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">{nextMilestone.title}</h3>
              <p className="text-xs text-slate-600 mt-1">{nextMilestone.description}</p>
            </div>
          </div>

          <button
            onClick={() => toggleMilestone(nextMilestone.week_number)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap self-end sm:self-center"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Complete</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="font-semibold text-slate-700">Loading {selectedRole} Curriculum...</span>
        </div>
      ) : !roadmap ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          No roadmap found for {selectedRole}. Use the generator above to create one.
        </div>
      ) : (
        /* Roadmap Phases */
        <div className="space-y-6">
          {roadmap.phases.map((phase) => {
            const isExpanded = expandedPhases[phase.phase_id] ?? true;
            const phaseCompleted = phase.milestones.filter(m => m.is_completed).length;

            return (
              <div 
                key={phase.phase_id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                {/* Phase Header Accordion Toggle */}
                <div 
                  onClick={() => togglePhase(phase.phase_id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 transition-colors border-b border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{phase.title}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{phase.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500">
                      {phaseCompleted} / {phase.milestones.length} Done
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Phase Milestones */}
                {isExpanded && (
                  <div className="p-5 space-y-4 divide-y divide-slate-100">
                    {phase.milestones.map((m) => (
                      <div key={m.week_number} className="pt-4 first:pt-0">
                        <div className="flex items-start gap-4">
                          {/* Complete Checkbox */}
                          <button
                            onClick={() => toggleMilestone(m.week_number)}
                            className="mt-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
                          >
                            {m.is_completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 hover:text-blue-500" />
                            )}
                          </button>

                          {/* Milestone Details */}
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                                Week {m.week_number}
                              </span>
                              <h3 className={`text-sm font-bold ${m.is_completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {m.title}
                              </h3>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                              {m.description}
                            </p>

                            {/* Topics & Prereqs */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(m.topics || []).map((t, tIdx) => (
                                <span key={tIdx} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/50">
                                  {t}
                                </span>
                              ))}
                            </div>

                            {/* Practical Deliverable */}
                            {m.practical_milestone && (
                              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 flex items-start gap-2">
                                <Code className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-slate-900">Hands-on Milestone: </span>
                                  {m.practical_milestone}
                                </div>
                              </div>
                            )}

                            {/* Curated Resources */}
                            {Array.isArray(m.curated_resources) && m.curated_resources.length > 0 && (
                              <div className="pt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                  Curated Learning Resources:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {m.curated_resources.map((res, rIdx) => (
                                    <a
                                      key={rIdx}
                                      href={res.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs text-slate-700 hover:text-blue-700 font-medium transition-all shadow-2xs"
                                    >
                                      {res.type === 'Course' || res.type === 'Interactive' ? (
                                        <Video className="w-3.5 h-3.5 text-blue-600" />
                                      ) : (
                                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                                      )}
                                      <span>{res.title}</span>
                                      <span className="text-[10px] text-slate-400">({res.estimated_time})</span>
                                      <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
