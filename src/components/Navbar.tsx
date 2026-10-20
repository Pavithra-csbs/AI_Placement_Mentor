import React from 'react';
import { UserProfile } from '../types/index.ts';
import { 
  GraduationCap, 
  Flame, 
  UserCheck, 
  Sparkles,
  RefreshCw,
  LogOut,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  onOpenOnboarding: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefreshData?: () => void;
  onLogout?: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenOnboarding,
  activeTab,
  setActiveTab,
  onRefreshData,
  onLogout,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">AI Placement Mentor</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  Campus Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Full-Stack Career, DSA, Scenario & ML Platform</p>
            </div>
          </div>

          {/* User Badge & Actions */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <>
                {/* Daily Streak Indicator */}
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold shadow-2xs hover:bg-amber-100 transition-colors cursor-help"
                  title={`${user.streak_count} Day Continuous Prep Streak! Log in and practice daily to maintain.`}
                >
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse fill-amber-500" />
                  <span>{user.streak_count} Day Streak</span>
                </div>

                {/* Target Role Tag */}
                <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium">
                  <span className="text-slate-500">Target:</span>
                  <span className="font-semibold">{user.target_role}</span>
                </div>

                {/* Student Profile Switcher / Button */}
                <button
                  onClick={onOpenOnboarding}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  title="Click to edit profile or change target role"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-semibold text-slate-800 max-w-[110px] truncate">{user.name}</span>
                  <span className="text-slate-400 text-[10px]">Edit</span>
                </button>

                {/* Sign Out Button */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
                    title="Sign out of student account"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Refresh / Sync Button */}
            {onRefreshData && (
              <button
                onClick={onRefreshData}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Refresh application data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
