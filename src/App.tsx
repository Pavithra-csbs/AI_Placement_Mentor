/**
 * AI Placement Mentor - Main Application Container
 * Full-stack college placement preparation platform.
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, AnalyticsSummary, DailyTechPoster, JobRole } from './types/index.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { RoadmapView } from './components/RoadmapView.tsx';
import { CodingCoachView } from './components/CodingCoachView.tsx';
import { DailyPosterView } from './components/DailyPosterView.tsx';
import { DailyQuizView } from './components/DailyQuizView.tsx';
import { ScenarioInterviewView } from './components/ScenarioInterviewView.tsx';
import { ProjectCatalogView } from './components/ProjectCatalogView.tsx';
import { ResumeBuilderView } from './components/ResumeBuilderView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { MLEngineView } from './components/MLEngineView.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Menu, Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [todayPoster, setTodayPoster] = useState<DailyTechPoster | null>(null);
  
  // Navigation & Modal state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [quizPosterId, setQuizPosterId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchActiveUser(),
        fetchAllUsers(),
        fetchAnalytics(),
        fetchTodayPoster()
      ]);
    } catch (e) {
      console.error('App init error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveUser = async () => {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.success && data.user) {
      setUser(data.user);
    }
  };

  const fetchAllUsers = async () => {
    const res = await fetch('/api/auth/users');
    const data = await res.json();
    if (data.success && data.users) {
      setAllUsers(data.users);
    }
  };

  const fetchAnalytics = async () => {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    if (data.success && data.summary) {
      setAnalytics(data.summary);
      if (data.user) setUser(data.user);
    }
  };

  const fetchTodayPoster = async () => {
    const res = await fetch('/api/posters/today');
    const data = await res.json();
    if (data.success && data.poster) {
      setTodayPoster(data.poster);
    }
  };

  const handleSaveProfile = async (profileData: Partial<UserProfile>) => {
    const res = await fetch('/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (data.success && data.user) {
      setUser(data.user);
      fetchAllUsers();
      fetchAnalytics();
    }
  };

  const handleSwitchUser = async (userId: string) => {
    const res = await fetch('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      setUser(data.user);
      fetchAnalytics();
    }
  };

  const handleTakeQuizForPoster = (posterId: string) => {
    setQuizPosterId(posterId);
    setActiveTab('quiz');
  };

  const handleRoleChangeFromRoadmap = (role: JobRole) => {
    if (user && user.target_role !== role) {
      handleSaveProfile({ ...user, target_role: role });
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg animate-bounce">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Booting AI Placement Mentor...</h2>
          <p className="text-xs text-slate-400">Loading student models, persistent database & ML services</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshData={() => {
          fetchAnalytics();
          fetchTodayPoster();
        }}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isOpenMobile}
          setIsOpenMobile={setIsOpenMobile}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {/* Mobile hamburger button */}
          <div className="lg:hidden mb-4 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
            <button
              onClick={() => setIsOpenMobile(true)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700"
            >
              <Menu className="w-4 h-4 text-blue-600" />
              <span>Menu / Modules</span>
            </button>
            <span className="text-xs font-bold text-blue-700 uppercase">
              {activeTab}
            </span>
          </div>

          {/* Module Views */}
          {activeTab === 'dashboard' && (
            <ErrorBoundary fallbackTitle="Dashboard Unavailable" onReset={fetchAnalytics}>
              <DashboardView
                user={user}
                analytics={analytics}
                todayPoster={todayPoster}
                onNavigate={setActiveTab}
                onOpenOnboarding={() => setIsOnboardingOpen(true)}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'roadmap' && (
            <ErrorBoundary fallbackTitle="Roadmap Unavailable">
              <RoadmapView
                currentRole={user.target_role}
                onRoleChange={handleRoleChangeFromRoadmap}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'coding' && (
            <ErrorBoundary fallbackTitle="Coding Coach Unavailable" onReset={fetchAnalytics}>
              <CodingCoachView
                user={user}
                onAttemptSaved={fetchAnalytics}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'poster' && (
            <ErrorBoundary fallbackTitle="Technical Poster Unavailable">
              <DailyPosterView
                onTakeQuiz={handleTakeQuizForPoster}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'quiz' && (
            <ErrorBoundary 
              fallbackTitle="Daily Quiz Unavailable"
              onReset={() => {
                fetchAnalytics();
                fetchTodayPoster();
              }}
            >
              <DailyQuizView
                user={user}
                initialPosterId={quizPosterId || todayPoster?.id}
                onNavigateToPoster={(pId) => {
                  setActiveTab('poster');
                }}
                onStreakUpdated={fetchAnalytics}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'interview' && (
            <ErrorBoundary fallbackTitle="Scenario Interview Unavailable" onReset={fetchAnalytics}>
              <ScenarioInterviewView
                user={user}
                onAttemptSaved={fetchAnalytics}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'projects' && (
            <ErrorBoundary fallbackTitle="Project Recommendations Catalog Unavailable">
              <ProjectCatalogView
                user={user}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'resume' && (
            <ErrorBoundary fallbackTitle="Resume Builder Unavailable">
              <ResumeBuilderView
                user={user}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'analytics' && (
            <ErrorBoundary fallbackTitle="Analytics Dashboard Unavailable" onReset={fetchAnalytics}>
              <AnalyticsView
                user={user}
                analytics={analytics}
                onNavigate={setActiveTab}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'ml-engine' && (
            <ErrorBoundary fallbackTitle="ML Recommendation Engine Unavailable">
              <MLEngineView
                user={user}
              />
            </ErrorBoundary>
          )}
        </main>
      </div>

      {/* Onboarding & Profile Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentUser={user}
        allUsers={allUsers}
        onSaveProfile={handleSaveProfile}
        onSwitchUser={handleSwitchUser}
      />
    </div>
  );
}
