/**
 * AI Placement Mentor - Persistent Database Engine
 * Features normalized JSON schema storage with atomic write guarantees (fs.renameSync),
 * relationship integrity, streak calculations, and seeded educational placement datasets.
 */

import fs from 'fs';
import path from 'path';
import {
  UserProfile,
  RoleInfo,
  Roadmap,
  CodingProblem,
  CodingAttempt,
  DailyTechPoster,
  QuizQuestion,
  QuizAttempt,
  ScenarioInterview,
  ScenarioAttempt,
  ProjectRecommendation,
  ResumeData,
  AnalyticsSummary,
  UserCredential,
} from '../types/index.ts';
import { hashPassword } from './authHelper.ts';

import {
  SEED_ROLES,
  SEED_ROADMAPS,
  SEED_CODING_PROBLEMS,
  SEED_POSTERS,
  SEED_QUIZZES,
  SEED_SCENARIOS,
  SEED_PROJECTS,
} from './seedData.ts';

export interface DatabaseSchema {
  users: UserProfile[];
  credentials: UserCredential[];
  roles: RoleInfo[];
  roadmaps: Record<string, Roadmap>;
  problems: CodingProblem[];
  coding_attempts: CodingAttempt[];
  posters: DailyTechPoster[];
  quizzes: QuizQuestion[];
  quiz_attempts: QuizAttempt[];
  scenarios: ScenarioInterview[];
  scenario_attempts: ScenarioAttempt[];
  projects: ProjectRecommendation[];
  resumes: ResumeData[];
  user_milestones: Record<string, string[]>; // userId -> array of milestone keys (e.g. "Software Developer-week-1")
  active_user_id: string;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'app_database.json');

// Default student user seeded for instant evaluation if user has not yet completed onboarding
const DEFAULT_USER: UserProfile = {
  id: 'usr-student-default',
  name: 'Alex Sharma',
  email: 'alex.sharma@campus.edu',
  target_role: 'Software Developer',
  experience_level: 'Intermediate (3rd/4th Year)',
  current_skills: ['Java', 'Data Structures', 'SQL', 'Git', 'OOP'],
  interests: ['System Design', 'Algorithms', 'Distributed Systems'],
  streak_count: 3,
  last_active_date: new Date().toISOString().split('T')[0],
  completed_roadmaps: [],
  created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_RESUME: ResumeData = {
  id: 'res-default',
  user_id: 'usr-student-default',
  full_name: 'Alex Sharma',
  email: 'alex.sharma@campus.edu',
  phone: '+91 98765 43210',
  location: 'Bengaluru, India',
  linkedin: 'https://linkedin.com/in/alexsharma-tech',
  github: 'https://github.com/alexsharma-dev',
  portfolio: 'https://alexsharma.dev',
  summary: 'Aspiring Software Developer with solid foundation in Data Structures, Algorithms, and Object-Oriented Design. Proven project experience in building scalable microservices and REST APIs.',
  education: [
    {
      id: 'edu-1',
      institution: 'National Institute of Technology',
      degree: 'B.Tech in Computer Science and Engineering',
      field: 'Computer Science',
      grad_year: '2026',
      gpa: '8.8 / 10'
    }
  ],
  skills: {
    languages: ['Java', 'Python', 'TypeScript', 'SQL', 'C++'],
    frameworks: ['Spring Boot', 'Express.js', 'React.js', 'FastAPI'],
    tools_databases: ['PostgreSQL', 'Redis', 'Docker', 'Git', 'Kafka'],
    core_concepts: ['Data Structures & Algorithms', 'System Design (LLD/HLD)', 'DBMS', 'Operating Systems', 'OOP']
  },
  projects: [
    {
      id: 'proj-1',
      title: 'Distributed Rate Limiting Gateway',
      tech_stack: 'Node.js, Redis, Docker, Express',
      bullet_points: [
        'Engineered distributed token-bucket rate limiter handling 12,000+ requests/sec with Redis Lua scripts.',
        'Reduced downstream microservice resource contention by 45% during synthetic peak stress tests.',
        'Implemented HTTP standard 429 headers with dynamic Retry-After exponential backoff calculations.'
      ],
      github_link: 'https://github.com/alexsharma-dev/distributed-rate-limiter'
    },
    {
      id: 'proj-2',
      title: 'Campus Placement Prep & Analytics Hub',
      tech_stack: 'React, TypeScript, Tailwind CSS, Python scikit-learn',
      bullet_points: [
        'Designed interactive coding coach with progressive 4-tier hint ladder and real-time test case validation.',
        'Integrated scikit-learn Logistic Regression classifier & TF-IDF similarity to rank practice challenges.',
        'Optimized ATS resume generator with live formatting preview and export capabilities.'
      ]
    }
  ],
  experience: [
    {
      id: 'exp-1',
      role: 'Software Engineering Intern',
      company: 'TechCorp Solutions',
      duration: 'May 2025 - July 2025 (3 mos)',
      bullet_points: [
        'Migrated 14 legacy monolithic REST endpoints to Spring Boot microservices with 99.8% test coverage.',
        'Optimized PostgreSQL database query latency by 32% via index tuning and execution plan analysis.'
      ]
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      year: '2025'
    }
  ],
  achievements: [
    'Ranked in top 4% in Global LeetCode Biweekly Contest 120 (Max Rating: 1845)',
    '1st Runner Up at National Smart India Hackathon among 450+ participating collegiate teams'
  ],
  updated_at: new Date().toISOString()
};

class DatabaseManager {
  private cache: DatabaseSchema | null = null;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const defaultCred = hashPassword('Password123!');
      const initialData: DatabaseSchema = {
        users: [DEFAULT_USER],
        credentials: [
          {
            userId: DEFAULT_USER.id,
            email: DEFAULT_USER.email,
            passwordHash: defaultCred.hash,
            salt: defaultCred.salt,
            securityQuestion: 'What was your first programming language?',
            securityAnswer: 'Java',
          }
        ],
        roles: SEED_ROLES,
        roadmaps: SEED_ROADMAPS,
        problems: SEED_CODING_PROBLEMS,
        coding_attempts: [],
        posters: SEED_POSTERS,
        quizzes: SEED_QUIZZES,
        quiz_attempts: [],
        scenarios: SEED_SCENARIOS,
        scenario_attempts: [],
        projects: SEED_PROJECTS,
        resumes: [DEFAULT_RESUME],
        user_milestones: {
          'usr-student-default': ['Software Developer-1', 'Software Developer-2']
        },
        active_user_id: 'usr-student-default',
      };
      this.writeDb(initialData);
      this.cache = initialData;
    } else {
      this.readDb();
    }
  }

  private readDb(): DatabaseSchema {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw) as DatabaseSchema;
      // Ensure seed data updates are merged if new items added
      if (!data.credentials) {
        const defaultCred = hashPassword('Password123!');
        data.credentials = [
          {
            userId: DEFAULT_USER.id,
            email: DEFAULT_USER.email,
            passwordHash: defaultCred.hash,
            salt: defaultCred.salt,
            securityQuestion: 'What was your first programming language?',
            securityAnswer: 'Java',
          }
        ];
      }
      if (!data.roles || data.roles.length === 0) data.roles = SEED_ROLES;
      if (!data.problems || data.problems.length === 0) data.problems = SEED_CODING_PROBLEMS;
      if (!data.posters || data.posters.length === 0) data.posters = SEED_POSTERS;
      if (!data.quizzes || data.quizzes.length === 0) data.quizzes = SEED_QUIZZES;
      if (!data.scenarios || data.scenarios.length === 0) data.scenarios = SEED_SCENARIOS;
      if (!data.projects || data.projects.length === 0) data.projects = SEED_PROJECTS;
      if (!data.user_milestones) data.user_milestones = {};
      this.cache = data;
      return data;
    } catch (err) {
      console.error('Error reading database file, recreating initial state:', err);
      const defaultCred = hashPassword('Password123!');
      const fallback: DatabaseSchema = {
        users: [DEFAULT_USER],
        credentials: [
          {
            userId: DEFAULT_USER.id,
            email: DEFAULT_USER.email,
            passwordHash: defaultCred.hash,
            salt: defaultCred.salt,
            securityQuestion: 'What was your first programming language?',
            securityAnswer: 'Java',
          }
        ],
        roles: SEED_ROLES,
        roadmaps: SEED_ROADMAPS,
        problems: SEED_CODING_PROBLEMS,
        coding_attempts: [],
        posters: SEED_POSTERS,
        quizzes: SEED_QUIZZES,
        quiz_attempts: [],
        scenarios: SEED_SCENARIOS,
        scenario_attempts: [],
        projects: SEED_PROJECTS,
        resumes: [DEFAULT_RESUME],
        user_milestones: {},
        active_user_id: 'usr-student-default',
      };
      this.writeDb(fallback);
      this.cache = fallback;
      return fallback;
    }
  }

  private writeDb(data: DatabaseSchema): void {
    // Atomic write pattern: write to tmp file first then renameSync
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
    this.cache = data;
  }

  // --- Users & Onboarding ---
  public getUsers(): UserProfile[] {
    return this.readDb().users;
  }

  public getActiveUser(): UserProfile {
    const db = this.readDb();
    const user = db.users.find(u => u.id === db.active_user_id) || db.users[0] || DEFAULT_USER;
    return user;
  }

  public setActiveUserId(userId: string): void {
    const db = this.readDb();
    if (db.users.some(u => u.id === userId)) {
      db.active_user_id = userId;
      this.writeDb(db);
    }
  }

  public saveUser(profile: Partial<UserProfile> & { name: string; email: string; target_role: any }): UserProfile {
    const db = this.readDb();
    const existingIndex = db.users.findIndex(u => u.id === profile.id || u.email.toLowerCase() === profile.email.toLowerCase());

    const now = new Date().toISOString();
    const today = now.split('T')[0];

    if (existingIndex >= 0) {
      const existing = db.users[existingIndex];
      const updated: UserProfile = {
        ...existing,
        ...profile,
        updated_at: now,
      };
      db.users[existingIndex] = updated;
      db.active_user_id = updated.id;
      this.writeDb(db);
      return updated;
    } else {
      const newUser: UserProfile = {
        id: profile.id || `usr-${Date.now()}`,
        name: profile.name,
        email: profile.email,
        target_role: profile.target_role,
        experience_level: profile.experience_level || 'Beginner (1st/2nd Year)',
        current_skills: profile.current_skills || [],
        interests: profile.interests || [],
        streak_count: 1,
        last_active_date: today,
        completed_roadmaps: [],
        created_at: now,
        updated_at: now,
      };
      db.users.push(newUser);
      db.active_user_id = newUser.id;

      // Also create an initial empty resume skeleton for the new user
      if (!db.resumes.some(r => r.user_id === newUser.id)) {
        db.resumes.push({
          id: `res-${newUser.id}`,
          user_id: newUser.id,
          full_name: newUser.name,
          email: newUser.email,
          phone: '',
          location: '',
          linkedin: '',
          github: '',
          portfolio: '',
          summary: `Aspiring ${newUser.target_role} passionate about solving challenging problems.`,
          education: [],
          skills: {
            languages: newUser.current_skills,
            frameworks: [],
            tools_databases: [],
            core_concepts: []
          },
          projects: [],
          experience: [],
          certifications: [],
          achievements: [],
          updated_at: now,
        });
      }

      this.writeDb(db);
      return newUser;
    }
  }

  // --- Credentials & Authentication ---
  public findUserByEmail(email: string): UserProfile | undefined {
    const clean = (email || '').trim().toLowerCase();
    return this.readDb().users.find(u => u.email.toLowerCase() === clean);
  }

  public getCredentialByEmail(email: string): UserCredential | undefined {
    const clean = (email || '').trim().toLowerCase();
    const creds = this.readDb().credentials || [];
    return creds.find(c => c.email.toLowerCase() === clean);
  }

  public getCredentialByUserId(userId: string): UserCredential | undefined {
    const creds = this.readDb().credentials || [];
    return creds.find(c => c.userId === userId);
  }

  public saveCredential(cred: UserCredential): void {
    const db = this.readDb();
    if (!db.credentials) db.credentials = [];
    const idx = db.credentials.findIndex(c => c.email.toLowerCase() === cred.email.toLowerCase() || c.userId === cred.userId);
    if (idx >= 0) {
      db.credentials[idx] = { ...db.credentials[idx], ...cred };
    } else {
      db.credentials.push(cred);
    }
    this.writeDb(db);
  }

  public updatePassword(email: string, passwordHash: string, salt: string): boolean {
    const db = this.readDb();
    if (!db.credentials) db.credentials = [];
    const idx = db.credentials.findIndex(c => c.email.toLowerCase() === email.trim().toLowerCase());
    if (idx >= 0) {
      db.credentials[idx].passwordHash = passwordHash;
      db.credentials[idx].salt = salt;
      db.credentials[idx].resetCode = undefined;
      db.credentials[idx].resetCodeExpires = undefined;
      this.writeDb(db);
      return true;
    }
    return false;
  }

  public setResetCode(email: string, resetCode: string, ttlMinutes = 15): boolean {
    const db = this.readDb();
    if (!db.credentials) db.credentials = [];
    const idx = db.credentials.findIndex(c => c.email.toLowerCase() === email.trim().toLowerCase());
    if (idx >= 0) {
      db.credentials[idx].resetCode = resetCode;
      db.credentials[idx].resetCodeExpires = Date.now() + ttlMinutes * 60 * 1000;
      this.writeDb(db);
      return true;
    }
    return false;
  }

  public verifyResetCode(email: string, code: string): boolean {
    const db = this.readDb();
    if (!db.credentials) return false;
    const cred = db.credentials.find(c => c.email.toLowerCase() === email.trim().toLowerCase());
    if (!cred || !cred.resetCode || !cred.resetCodeExpires) return false;
    if (Date.now() > cred.resetCodeExpires) return false;
    return cred.resetCode.trim() === code.trim();
  }

  public clearResetCode(email: string): void {
    const db = this.readDb();
    if (!db.credentials) return;
    const idx = db.credentials.findIndex(c => c.email.toLowerCase() === email.trim().toLowerCase());
    if (idx >= 0) {
      db.credentials[idx].resetCode = undefined;
      db.credentials[idx].resetCodeExpires = undefined;
      this.writeDb(db);
    }
  }

  public logoutUser(): void {
    const db = this.readDb();
    db.active_user_id = '';
    this.writeDb(db);
  }

  // --- Roadmaps ---
  public getRoadmap(role: string): Roadmap {
    const db = this.readDb();
    const roadmap = db.roadmaps[role] || db.roadmaps['Software Developer'] || SEED_ROADMAPS['Software Developer'];
    const activeUser = this.getActiveUser();
    const userCompleted = db.user_milestones[activeUser.id] || [];

    // Augment with user completion status
    const augmentedPhases = roadmap.phases.map(phase => ({
      ...phase,
      milestones: phase.milestones.map(m => ({
        ...m,
        is_completed: userCompleted.includes(`${roadmap.role_id}-${m.week_number}`)
      }))
    }));

    return { ...roadmap, phases: augmentedPhases };
  }

  public toggleMilestone(userId: string, role: string, weekNumber: number): boolean {
    const db = this.readDb();
    if (!db.user_milestones[userId]) {
      db.user_milestones[userId] = [];
    }
    const key = `${role}-${weekNumber}`;
    const list = db.user_milestones[userId];
    const exists = list.includes(key);
    if (exists) {
      db.user_milestones[userId] = list.filter(k => k !== key);
    } else {
      db.user_milestones[userId].push(key);
    }
    this.updateUserStreak(userId);
    this.writeDb(db);
    return !exists;
  }

  // --- Roles ---
  public getRoles(): RoleInfo[] {
    return this.readDb().roles;
  }

  public addRole(role: RoleInfo): void {
    const db = this.readDb();
    if (!db.roles.some(r => r.id === role.id || r.title.toLowerCase() === role.title.toLowerCase())) {
      db.roles.push(role);
      this.writeDb(db);
    }
  }

  // --- Coding Problems & Attempts ---
  public getProblems(topic?: string, difficulty?: string): CodingProblem[] {
    const db = this.readDb();
    let list = db.problems;
    if (topic && topic !== 'all') {
      list = list.filter(p => p.topic.toLowerCase() === topic.toLowerCase());
    }
    if (difficulty && difficulty !== 'all') {
      list = list.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    return list;
  }

  public getProblemBySlug(slug: string): CodingProblem | undefined {
    return this.readDb().problems.find(p => p.slug === slug || p.id === slug);
  }

  public addProblem(problem: CodingProblem): CodingProblem {
    const db = this.readDb();
    // Prepend so newly generated problems appear at the top
    db.problems.unshift(problem);
    this.writeDb(db);
    return problem;
  }

  public saveCodingAttempt(attempt: Omit<CodingAttempt, 'id' | 'created_at'>): CodingAttempt {
    const db = this.readDb();
    const record: CodingAttempt = {
      ...attempt,
      id: `att-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    db.coding_attempts.push(record);
    if (attempt.status === 'passed') {
      this.updateUserStreak(attempt.user_id);
    }
    this.writeDb(db);
    return record;
  }

  public getCodingAttempts(userId: string): CodingAttempt[] {
    const db = this.readDb();
    return db.coding_attempts.filter(a => a.user_id === userId);
  }

  // --- Daily Posters & Quizzes ---
  public getPosters(): DailyTechPoster[] {
    return this.readDb().posters;
  }

  public getTodayPoster(): DailyTechPoster {
    const db = this.readDb();
    // Return the latest poster or first available
    return db.posters[0] || SEED_POSTERS[0];
  }

  public addPoster(poster: DailyTechPoster): DailyTechPoster {
    const db = this.readDb();
    db.posters.unshift(poster);
    this.writeDb(db);
    return poster;
  }

  public getQuizForPoster(posterId: string): QuizQuestion[] {
    const db = this.readDb();
    return db.quizzes.filter(q => q.poster_id === posterId);
  }

  public addQuizzes(newQuizzes: QuizQuestion[]): void {
    const db = this.readDb();
    db.quizzes.push(...newQuizzes);
    this.writeDb(db);
  }

  public saveQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'created_at'>): QuizAttempt {
    const db = this.readDb();
    const today = new Date().toISOString().split('T')[0];

    // Anti-double-counting daily check:
    // Check if user has already scored a quiz today for streak increment
    const alreadyCompletedToday = db.quiz_attempts.some(
      a => a.user_id === attempt.user_id && a.date === today && a.score > 0
    );

    const record: QuizAttempt = {
      ...attempt,
      id: `qa-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    db.quiz_attempts.push(record);

    if (!alreadyCompletedToday && record.score > 0) {
      this.updateUserStreak(attempt.user_id);
    }

    this.writeDb(db);
    return record;
  }

  public getQuizAttempts(userId: string): QuizAttempt[] {
    return this.readDb().quiz_attempts.filter(q => q.user_id === userId);
  }

  // --- Scenario Interviews ---
  public getScenarios(role?: string): ScenarioInterview[] {
    const db = this.readDb();
    if (role && role !== 'all') {
      return db.scenarios.filter(s => s.role.toLowerCase() === role.toLowerCase());
    }
    return db.scenarios;
  }

  public getScenarioById(id: string): ScenarioInterview | undefined {
    return this.readDb().scenarios.find(s => s.id === id);
  }

  public addScenario(scenario: ScenarioInterview): ScenarioInterview {
    const db = this.readDb();
    db.scenarios.unshift(scenario);
    this.writeDb(db);
    return scenario;
  }

  public saveScenarioAttempt(attempt: Omit<ScenarioAttempt, 'id' | 'created_at'>): ScenarioAttempt {
    const db = this.readDb();
    const record: ScenarioAttempt = {
      ...attempt,
      id: `scen-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    db.scenario_attempts.push(record);
    this.updateUserStreak(attempt.user_id);
    this.writeDb(db);
    return record;
  }

  public getScenarioAttempts(userId: string): ScenarioAttempt[] {
    return this.readDb().scenario_attempts.filter(s => s.user_id === userId);
  }

  // --- Projects ---
  public getProjects(role?: string): ProjectRecommendation[] {
    const db = this.readDb();
    if (role && role !== 'all') {
      return db.projects.filter(p => p.target_role.toLowerCase() === role.toLowerCase());
    }
    return db.projects;
  }

  public addProject(project: ProjectRecommendation): ProjectRecommendation {
    const db = this.readDb();
    db.projects.unshift(project);
    this.writeDb(db);
    return project;
  }

  public saveRoadmap(role: string, roadmap: Roadmap): void {
    const db = this.readDb();
    db.roadmaps[role] = roadmap;
    this.writeDb(db);
  }

  // --- Resumes ---
  public getResume(userId: string): ResumeData {
    const db = this.readDb();
    let resume = db.resumes.find(r => r.user_id === userId);
    if (!resume) {
      const user = db.users.find(u => u.id === userId) || DEFAULT_USER;
      resume = {
        id: `res-${userId}`,
        user_id: userId,
        full_name: user.name,
        email: user.email,
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
        summary: `Dedicated ${user.target_role} graduate ready for challenging technical roles.`,
        education: [],
        skills: {
          languages: user.current_skills,
          frameworks: [],
          tools_databases: [],
          core_concepts: []
        },
        projects: [],
        experience: [],
        certifications: [],
        achievements: [],
        updated_at: new Date().toISOString()
      };
      db.resumes.push(resume);
      this.writeDb(db);
    }
    return resume;
  }

  public saveResume(resume: ResumeData): ResumeData {
    const db = this.readDb();
    const index = db.resumes.findIndex(r => r.user_id === resume.user_id);
    const updated = { ...resume, updated_at: new Date().toISOString() };
    if (index >= 0) {
      db.resumes[index] = updated;
    } else {
      db.resumes.push(updated);
    }
    this.writeDb(db);
    return updated;
  }

  // --- Streak Tracking ---
  private updateUserStreak(userId: string): void {
    const db = this.readDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex < 0) return;

    const user = db.users[userIndex];
    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.last_active_date;

    if (lastActive === today) {
      // Already active today; do not increment multiple times on same day
      return;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastActive === yesterday) {
      user.streak_count += 1;
    } else {
      // Streak broken, reset to 1
      user.streak_count = 1;
    }
    user.last_active_date = today;
    user.updated_at = new Date().toISOString();
    db.users[userIndex] = user;
    this.writeDb(db);
  }

  // --- Analytics & Skill Gap Engine ---
  public getAnalytics(userId: string): AnalyticsSummary {
    const db = this.readDb();
    const user = db.users.find(u => u.id === userId) || DEFAULT_USER;

    const codingAttempts = db.coding_attempts.filter(a => a.user_id === userId);
    const solvedSet = new Set<string>();
    codingAttempts.forEach(a => {
      if (a.status === 'passed') solvedSet.add(a.problem_id);
    });

    const codingSuccessRate = codingAttempts.length > 0 
      ? Number(((solvedSet.size / codingAttempts.length) * 100).toFixed(1))
      : null;

    const quizAttempts = db.quiz_attempts.filter(a => a.user_id === userId);
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;
    quizAttempts.forEach(q => {
      totalQuestionsAnswered += q.total;
      totalCorrectAnswers += q.score;
    });

    const quizAccuracy = totalQuestionsAnswered > 0
      ? Number(((totalCorrectAnswers / totalQuestionsAnswered) * 100).toFixed(1))
      : null;

    const scenarioAttempts = db.scenario_attempts.filter(s => s.user_id === userId);
    const avgInterviewScore = scenarioAttempts.length > 0
      ? Number((scenarioAttempts.reduce((acc, curr) => acc + curr.evaluation.overall_score, 0) / scenarioAttempts.length).toFixed(1))
      : null;

    // Roadmap progress
    const userMilestoneCount = (db.user_milestones[userId] || []).length;
    const roadmap = db.roadmaps[user.target_role] || db.roadmaps['Software Developer'] || SEED_ROADMAPS['Software Developer'];
    const totalMilestones = roadmap.phases.reduce((acc, p) => acc + p.milestones.length, 0) || 16;
    const roadmapPct = Math.min(100, Math.round((userMilestoneCount / totalMilestones) * 100));

    // Topic breakdown
    const topicMap: Record<string, { solved: number; total: number }> = {};
    db.problems.forEach(p => {
      if (!topicMap[p.topic]) {
        topicMap[p.topic] = { solved: 0, total: 0 };
      }
      topicMap[p.topic].total += 1;
      if (solvedSet.has(p.id)) {
        topicMap[p.topic].solved += 1;
      }
    });

    const topicBreakdown = Object.entries(topicMap).map(([topic, stats]) => ({
      topic: topic.replace('_', ' ').toUpperCase(),
      solved: stats.solved,
      total: stats.total,
      accuracy_pct: stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : null
    }));

    // Weekly activity trend (last 7 days)
    const weeklyActivity = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];

      const codingCount = codingAttempts.filter(a => a.created_at.startsWith(dateStr)).length;
      const quizCount = quizAttempts.filter(q => q.date === dateStr || q.created_at.startsWith(dateStr)).length;

      weeklyActivity.push({
        day: dayName,
        date: dateStr,
        coding_count: codingCount,
        quiz_count: quizCount
      });
    }

    // Skill Gap recommendations
    const skillGaps = [];
    if (solvedSet.size < 3) {
      skillGaps.push({
        skill: 'Core Data Structures (Arrays & Hash Maps)',
        priority: 'High' as const,
        reason: 'Essential prerequisite for all technical placement screenings.',
        action_item: 'Solve Two Sum and Longest Substring in the AI Coding Coach.'
      });
    }
    if (quizAttempts.length === 0 || (quizAccuracy !== null && quizAccuracy < 70)) {
      skillGaps.push({
        skill: 'Modern System & API Concepts (RAG, Kafka, Vector DBs)',
        priority: 'High' as const,
        reason: 'Interviewers frequently test real-world architectural reasoning.',
        action_item: 'Read today’s Daily Tech Poster and complete the 3-question quiz.'
      });
    }
    if (scenarioAttempts.length === 0) {
      skillGaps.push({
        skill: 'Scenario-Based Architecture & Trade-off Defense',
        priority: 'Medium' as const,
        reason: 'Senior & product companies focus heavily on communication and problem clarification.',
        action_item: 'Attempt the Flash Sale Race Condition scenario interview.'
      });
    }
    if (userMilestoneCount < 4) {
      skillGaps.push({
        skill: `${user.target_role} Roadmap Progression`,
        priority: 'Medium' as const,
        reason: 'Staying on pace with your weekly milestones improves retention and placement readiness.',
        action_item: 'Complete Week 1 & 2 roadmap deliverables in Career Roadmap.'
      });
    }

    return {
      streak_count: user.streak_count,
      total_active_days: Math.max(user.streak_count, 1),
      coding_total_attempts: codingAttempts.length,
      coding_solved_count: solvedSet.size,
      coding_success_rate: codingSuccessRate,
      quiz_total_attempts: quizAttempts.length,
      quiz_total_questions: totalQuestionsAnswered,
      quiz_correct_count: totalCorrectAnswers,
      quiz_accuracy: quizAccuracy,
      interviews_completed: scenarioAttempts.length,
      average_interview_score: avgInterviewScore,
      roadmap_progress_percentage: roadmapPct,
      topic_breakdown: topicBreakdown,
      weekly_activity: weeklyActivity,
      skill_gaps: skillGaps
    };
  }
}

export const db = new DatabaseManager();
