import React, { useState, useEffect } from 'react';
import { UserProfile, JobRole, ExperienceLevel } from '../types/index.ts';
import { 
  X, 
  Sparkles, 
  User, 
  Mail, 
  Briefcase, 
  Layers, 
  CheckCircle2, 
  Plus, 
  UserPlus, 
  Users 
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSaveProfile: (profile: Partial<UserProfile>) => Promise<void>;
  onSwitchUser: (userId: string) => Promise<void>;
}

const ROLES: { id: JobRole; label: string; desc: string; color: string }[] = [
  { id: 'Software Developer', label: 'Software Developer', desc: 'DSA, System Design, Full-Stack, Java/Python, OOP', color: 'border-blue-300 hover:border-blue-500 bg-blue-50/40' },
  { id: 'Data Analyst', label: 'Data Analyst', desc: 'Advanced SQL, BI Dashboards, Data Wrangling, Metrics', color: 'border-teal-300 hover:border-teal-500 bg-teal-50/40' },
  { id: 'Data Scientist', label: 'Data Scientist', desc: 'Predictive ML, Applied Statistics, Experimentation', color: 'border-indigo-300 hover:border-indigo-500 bg-indigo-50/40' },
  { id: 'AI/ML Engineer', label: 'AI / ML Engineer', desc: 'Deep Learning, RAG, Transformers, Vector DBs, PyTorch', color: 'border-violet-300 hover:border-violet-500 bg-violet-50/40' },
  { id: 'Cybersecurity Analyst', label: 'Cybersecurity Analyst', desc: 'SOC, Threat Hunting, Network Security, OWASP', color: 'border-rose-300 hover:border-rose-500 bg-rose-50/40' },
  { id: 'Cloud Engineer', label: 'Cloud / DevOps', desc: 'AWS, Kubernetes, Terraform, Docker, CI/CD Pipelines', color: 'border-amber-300 hover:border-amber-500 bg-amber-50/40' },
];

const SUGGESTED_SKILLS = [
  'Data Structures', 'Algorithms', 'Java', 'Python', 'C++', 'SQL', 'JavaScript', 
  'TypeScript', 'React', 'Node.js', 'Spring Boot', 'Docker', 'Git', 'Linux', 
  'Pandas', 'PyTorch', 'AWS', 'Redis', 'Kafka', 'System Design'
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSaveProfile,
  onSwitchUser,
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [targetRole, setTargetRole] = useState<JobRole>(currentUser.target_role || 'Software Developer');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    currentUser.experience_level || 'Intermediate (3rd/4th Year)'
  );
  const [skills, setSkills] = useState<string[]>(currentUser.current_skills || []);
  const [customSkill, setCustomSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'switch'>('edit');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setTargetRole(currentUser.target_role);
      setExperienceLevel(currentUser.experience_level);
      setSkills(currentUser.current_skills || []);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkill('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveProfile({
        id: currentUser.id,
        name: name.trim(),
        email: email.trim(),
        target_role: targetRole,
        experience_level: experienceLevel,
        current_skills: skills,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitch = async (userId: string) => {
    setIsSubmitting(true);
    try {
      await onSwitchUser(userId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Student Profile & Placement Goals</h2>
              <p className="text-xs text-blue-100">Personalize your AI coding coach, career roadmaps, and ML recommendations</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('edit')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Edit Profile & Skills
          </button>
          <button
            onClick={() => setActiveTab('switch')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'switch'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Switch Profile ({allUsers.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {activeTab === 'switch' ? (
            <div className="space-y-4">
              <div className="text-sm text-slate-600">
                Select an existing candidate profile to view their personalized roadmaps, problem history, and streak:
              </div>
              <div className="space-y-2">
                {allUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSwitch(u.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      u.id === currentUser.id
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{u.name}</span>
                        {u.id === currentUser.id && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white">Active</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">{u.target_role}</span>
                        <span className="text-[11px] text-amber-600 font-semibold">🔥 {u.streak_count} Day Streak</span>
                      </div>
                    </div>
                    <button className="text-xs text-blue-600 font-semibold hover:underline">
                      {u.id === currentUser.id ? 'Current' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Sharma"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" /> Campus Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex@campus.edu"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Target Job Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Target Job Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ROLES.map((role) => {
                    const isSelected = targetRole === role.id;
                    return (
                      <div
                        key={role.id}
                        onClick={() => setTargetRole(role.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${role.color} ${
                          isSelected ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900">{role.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">{role.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" /> College Level / Preparation Stage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner (1st/2nd Year)', 'Intermediate (3rd/4th Year)', 'Job Ready / Graduate'] as ExperienceLevel[]).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setExperienceLevel(lvl)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        experienceLevel === lvl
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lvl.split(' ')[0]}
                      <span className="block text-[10px] text-slate-400 mt-0.5">{lvl.substring(lvl.indexOf('('))}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Skills Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Skills ({skills.length} selected)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5 max-h-36 overflow-y-auto p-1">
                  {SUGGESTED_SKILLS.map((sk) => {
                    const active = skills.includes(sk);
                    return (
                      <button
                        type="button"
                        key={sk}
                        onClick={() => toggleSkill(sk)}
                        className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white font-medium shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                        }`}
                      >
                        {active ? `✓ ${sk}` : `+ ${sk}`}
                      </button>
                    );
                  })}
                </div>

                {/* Custom skill input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                    placeholder="Add custom skill (e.g. GraphQL, Next.js)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Placement Goals'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
