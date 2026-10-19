import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Code2, 
  Newspaper, 
  HelpCircle, 
  Users2, 
  FolderKanban, 
  FileText, 
  BarChart3, 
  BrainCircuit,
  Compass
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: '' },
    { id: 'roadmap', label: 'Career Roadmap', icon: Map, badge: '16 Wks' },
    { id: 'coding', label: 'AI Coding Coach', icon: Code2, badge: 'DSA' },
    { id: 'poster', label: 'Daily Tech Poster', icon: Newspaper, badge: 'Daily' },
    { id: 'quiz', label: 'Daily Quiz', icon: HelpCircle, badge: 'Streaks' },
    { id: 'interview', label: 'Scenario Interview', icon: Users2, badge: 'Rubric' },
    { id: 'projects', label: 'Project Catalog', icon: FolderKanban, badge: 'ML Rank' },
    { id: 'resume', label: 'ATS Resume Builder', icon: FileText, badge: 'PDF' },
    { id: 'analytics', label: 'Learning Analytics', icon: BarChart3, badge: '' },
    { id: 'ml-engine', label: 'Scikit-Learn ML Lab', icon: BrainCircuit, badge: 'Trained' },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-2xs"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/90 z-30 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 overflow-y-auto flex-1 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Placement Prep Modules
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span 
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                        isActive 
                          ? 'bg-blue-700/60 text-blue-100' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status Card */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-900">Placement Target</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Complete today's coding exercise & daily concept poster to keep your placement streak alive!
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
