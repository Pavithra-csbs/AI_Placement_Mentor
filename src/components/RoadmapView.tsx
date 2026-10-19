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
  Compass
} from 'lucide-react';

interface RoadmapViewProps {
  currentRole: JobRole;
  onRoleChange: (role: JobRole) => void;
}

const ROLES: JobRole[] = [
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
  const [selectedRole, setSelectedRole] = useState<JobRole>(currentRole);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    p1: true,
    p2: true,
    p3: false,
    p4: false,
  });

  useEffect(() => {
    fetchRoadmap(selectedRole);
  }, [selectedRole]);

  const fetchRoadmap = async (role: JobRole) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/roadmap/${encodeURIComponent(role)}`);
      const data = await res.json();
      if (data.success && data.roadmap) {
        setRoadmap(data.roadmap);
      }
    } catch (e) {
      console.error('Failed to load roadmap:', e);
    } finally {
      setIsLoading(false);
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
      if (data.success) {
        // Optimistically update state
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

  // Calculate overall completion
  const allMilestones = roadmap?.phases.flatMap(p => p.milestones) || [];
  const completedCount = allMilestones.filter(m => m.is_completed).length;
  const totalCount = allMilestones.length || 1;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  // Determine next recommended milestone
  const nextMilestone = allMilestones.find(m => !m.is_completed);

  return (
    <div className="space-y-6">
      {/* Header & Role Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                Module 2
              </span>
              <h1 className="text-xl font-bold text-slate-900">Career Placement Roadmap</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Beginner-to-advanced curriculum with verified prerequisites, curated resources, and milestone tracking.
            </p>
          </div>

          {/* Overall Progress Pill */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl">
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Curriculum Mastery</div>
              <div className="text-sm font-bold text-blue-600">{completedCount} of {totalCount} Completed</div>
            </div>
            <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700">{completionPercentage}%</span>
          </div>
        </div>

        {/* Role Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {ROLES.map((role) => (
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
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-sm">
                  Recommended Next Milestone
                </span>
                <span className="text-xs font-semibold text-slate-500">Week {nextMilestone.week_number}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">{nextMilestone.title}</h3>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{nextMilestone.description}</p>
            </div>
          </div>
          <button
            onClick={() => toggleMilestone(nextMilestone.week_number)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
          >
            Mark Complete <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Roadmap Phases List */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
          Loading {selectedRole} roadmap...
        </div>
      ) : (
        <div className="space-y-4">
          {roadmap?.phases.map((phase) => {
            const isExpanded = expandedPhases[phase.phase_id] ?? true;
            const phaseCompleted = phase.milestones.filter(m => m.is_completed).length;
            return (
              <div key={phase.phase_id} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                {/* Phase Header Accordion */}
                <button
                  onClick={() => togglePhase(phase.phase_id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors border-b border-slate-200/60 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{phase.title}</h2>
                      <p className="text-xs text-slate-500">{phase.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
                      {phaseCompleted}/{phase.milestones.length} Done
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {/* Phase Milestones */}
                {isExpanded && (
                  <div className="p-6 divide-y divide-slate-100 space-y-6">
                    {phase.milestones.map((milestone) => (
                      <div key={milestone.week_number} className="pt-6 first:pt-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            {/* Completion Checkmark */}
                            <button
                              onClick={() => toggleMilestone(milestone.week_number)}
                              className="mt-1 transition-transform active:scale-90 cursor-pointer"
                              title={milestone.is_completed ? 'Mark incomplete' : 'Mark completed'}
                            >
                              {milestone.is_completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300 hover:text-blue-500" />
                              )}
                            </button>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                  Week {milestone.week_number}
                                </span>
                                <h3 className={`text-sm font-bold ${
                                  milestone.is_completed ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}>
                                  {milestone.title}
                                </h3>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {milestone.description}
                              </p>

                              {/* Topics & Prerequisites */}
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-semibold text-slate-400">Core Topics:</span>
                                {milestone.topics.map((t, idx) => (
                                  <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                    {t}
                                  </span>
                                ))}
                              </div>

                              {milestone.prerequisites.length > 0 && (
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] font-semibold text-amber-700">Prerequisites:</span>
                                  {milestone.prerequisites.map((p, idx) => (
                                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Curated Resources */}
                              <div className="mt-4">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                                  Curated Learning Resources & Documentation
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {milestone.curated_resources.map((res, idx) => (
                                    <a
                                      key={idx}
                                      href={res.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-300 transition-all flex items-center justify-between text-xs group"
                                    >
                                      <div className="flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                                        <span className="font-semibold text-slate-800 group-hover:text-blue-700 line-clamp-1">
                                          {res.title}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 ml-2">
                                        <span className="text-[10px] text-slate-400">{res.estimated_time}</span>
                                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>

                              {/* Practical Milestone */}
                              <div className="mt-3 p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs text-blue-900">
                                <span className="font-bold">Weekly Deliverable Target: </span>
                                {milestone.practical_milestone}
                              </div>
                            </div>
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
