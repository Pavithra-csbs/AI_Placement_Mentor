/**
 * AI Placement Mentor - Shared Data Models & Interfaces
 */

export type JobRole =
  | 'Software Developer'
  | 'Data Analyst'
  | 'Data Scientist'
  | 'AI/ML Engineer'
  | 'Cybersecurity Analyst'
  | 'Cloud Engineer'
  | (string & {});

export type ExperienceLevel = 'Beginner (1st/2nd Year)' | 'Intermediate (3rd/4th Year)' | 'Job Ready / Graduate' | (string & {});

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  target_role: JobRole;
  experience_level: ExperienceLevel;
  current_skills: string[];
  interests: string[];
  streak_count: number;
  last_active_date: string;
  completed_roadmaps: string[];
  created_at: string;
  updated_at: string;
}

export interface RoleInfo {
  id: JobRole;
  title: string;
  tagline: string;
  description: string;
  market_demand: 'Extremely High' | 'High' | 'Very High' | 'Rapidly Growing';
  avg_salary_range: string;
  core_skills: string[];
  tools_frameworks: string[];
  career_paths: string[];
  top_hiring_companies: string[];
}

export interface RoadmapMilestone {
  week_number: number;
  phase_name: string;
  title: string;
  description: string;
  topics: string[];
  prerequisites: string[];
  curated_resources: {
    title: string;
    url: string;
    type: 'Documentation' | 'Course' | 'Interactive' | 'Article';
    estimated_time: string;
  }[];
  practical_milestone: string;
  is_completed?: boolean;
}

export interface Roadmap {
  role_id: JobRole;
  total_weeks: number;
  overview: string;
  phases: {
    phase_id: string;
    title: string;
    description: string;
    milestones: RoadmapMilestone[];
  }[];
}

export type ProblemTopic =
  | 'arrays'
  | 'strings'
  | 'linked_lists'
  | 'stacks_queues'
  | 'recursion'
  | 'searching_sorting'
  | 'trees_graphs'
  | 'dynamic_programming'
  | 'sql';

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
  input: string;
  expected_output: string;
  is_hidden?: boolean;
  explanation?: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  topic: ProblemTopic;
  difficulty: ProblemDifficulty;
  companies: string[];
  description: string;
  input_format: string;
  output_format: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starter_code: {
    python: string;
    java: string;
    javascript: string;
    sql?: string;
  };
  test_cases: TestCase[];
  hints: {
    conceptual: string;
    algorithm: string;
    pseudocode: string;
    solution: string;
  };
}

export interface CodingAttempt {
  id: string;
  user_id: string;
  problem_id: string;
  code: string;
  language: 'python' | 'javascript' | 'java' | 'sql';
  status: 'passed' | 'failed' | 'attempted';
  tests_passed: number;
  total_tests: number;
  hint_level_used: number; // 0 = none, 1 = conceptual, 2 = algo, 3 = pseudocode, 4 = full solution
  runtime_ms: number;
  created_at: string;
}

export interface DailyTechPoster {
  id: string;
  date: string;
  topic_category:
    | 'AI & LLMs'
    | 'Machine Learning'
    | 'Data Science'
    | 'APIs & Microservices'
    | 'SQL & Databases'
    | 'Cloud Architecture'
    | 'Cybersecurity'
    | 'DevOps & SRE'
    | 'RAG & Vector DBs'
    | 'Software Engineering';
  title: string;
  tagline: string;
  definition: string;
  how_it_works: {
    step_number: number;
    title: string;
    detail: string;
  }[];
  real_world_applications: string[];
  practical_example: {
    title: string;
    language: string;
    code_or_query: string;
    explanation: string;
  };
  verified_company_use: {
    company: string;
    use_case: string;
    architecture_context: string;
    source_link: string;
    citation_notes: string;
  };
}

export interface QuizQuestion {
  id: string;
  poster_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation_correct: string;
  explanation_distractors: string[];
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  date: string;
  poster_id: string;
  answers: {
    question_id: string;
    selected_index: number;
    is_correct: boolean;
  }[];
  score: number;
  total: number;
  created_at: string;
}

export interface ScenarioInterview {
  id: string;
  role: JobRole;
  title: string;
  company_context: string;
  business_problem: string;
  technical_constraints: string[];
  sample_prompt: string;
  evaluation_rubric: {
    problem_clarification: string;
    assumptions: string;
    technical_correctness: string;
    evidence_and_depth: string;
    alternatives_and_tradeoffs: string;
    communication: string;
  };
}

export interface ScenarioAttempt {
  id: string;
  user_id: string;
  scenario_id: string;
  student_response: string;
  evaluation: {
    overall_score: number; // out of 100
    category_scores: {
      problem_clarification: number; // 0-20
      assumptions: number; // 0-15
      technical_correctness: number; // 0-25
      evidence_and_depth: number; // 0-15
      alternatives_and_tradeoffs: number; // 0-15
      communication: number; // 0-10
    };
    strengths: string[];
    missing_considerations: string[];
    actionable_feedback: string;
    suggested_practice_exercise: string;
  };
  created_at: string;
}

export interface ProjectRecommendation {
  id: string;
  title: string;
  domain: string;
  target_role: JobRole;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  problem_statement: string;
  skills: string[];
  dataset: {
    name: string;
    url: string;
    description: string;
  };
  tech_stack: string[];
  milestones: {
    week: number;
    title: string;
    deliverables: string[];
  }[];
  evaluation_criteria: string[];
  match_score?: number;
  cosine_similarity?: number;
  recommendation_reason?: string;
}

export interface ResumeData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  education: {
    id: string;
    institution: string;
    degree: string;
    field: string;
    grad_year: string;
    gpa: string;
  }[];
  skills: {
    languages: string[];
    frameworks: string[];
    tools_databases: string[];
    core_concepts: string[];
  };
  projects: {
    id: string;
    title: string;
    tech_stack: string;
    bullet_points: string[];
    live_link?: string;
    github_link?: string;
  }[];
  experience: {
    id: string;
    role: string;
    company: string;
    duration: string;
    bullet_points: string[];
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    year: string;
  }[];
  achievements: string[];
  updated_at: string;
}

export interface AnalyticsSummary {
  streak_count: number;
  total_active_days: number;
  coding_total_attempts: number;
  coding_solved_count: number;
  coding_success_rate: number | null; // null if no attempts
  quiz_total_attempts: number;
  quiz_total_questions: number;
  quiz_correct_count: number;
  quiz_accuracy: number | null; // null if no attempts
  interviews_completed: number;
  average_interview_score: number | null;
  roadmap_progress_percentage: number;
  topic_breakdown: {
    topic: string;
    solved: number;
    total: number;
    accuracy_pct: number | null;
  }[];
  weekly_activity: {
    day: string;
    date: string;
    coding_count: number;
    quiz_count: number;
  }[];
  skill_gaps: {
    skill: string;
    priority: 'High' | 'Medium' | 'Low';
    reason: string;
    action_item: string;
  }[];
}
