# AI Placement Mentor 🎓

**AI Placement Mentor** is a comprehensive, full-stack web application designed to empower college students preparing for technical placements. It integrates technical concept education, Data Structures & Algorithms practice with progressive hint ladders, real-world scenario interviews with automated rubric evaluation, an ATS-friendly resume builder, and a true Python scikit-learn machine learning recommendation engine.

---

## 🏗️ System Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Node.js & Express running as a unified full-stack server mounted via Vite middlewares in development.
- **AI Tutoring & Scenario Evaluation**: Server-side Google Gemini API (`@google/genai` SDK using `gemini-3.8-flash`) for progressive hints, scenario rubric evaluations, and ATS resume audits.
- **Machine Learning Component**: Python 3.10 with `scikit-learn`, `numpy`, and `scipy`.
  - Multinomial Logistic Regression difficulty classifier evaluated on held-out test data.
  - TF-IDF Vectorizer and Cosine Similarity content-based recommendation matrix.
- **Persistent Database**: High-reliability persistent file-backed JSON database adapter with atomic write operations (`fs.writeFileSync` to temporary file followed by `fs.renameSync`) preventing corruption during server shutdowns or container restarts.

---

## 📦 Placement Modules (1 Through 11)

1. **Onboarding & Multi-Profile Support (`Module 1`)**:
   - Collects candidate name, campus email, target role, graduation stage, and current technical skills.
   - Fully supports 6 target placement roles:
     - *Software Developer / SDE*
     - *Data Analyst / BI Engineer*
     - *Data Scientist / Applied Scientist*
     - *AI / Machine Learning Engineer*
     - *Cybersecurity Analyst / SecOps*
     - *Cloud / DevOps Engineer*
   - Persists student profiles and supports switching between candidates.

2. **Career Roadmap (`Module 2`)**:
   - 16-week structured beginner-to-advanced curriculum for each role.
   - Categorized by 4 distinct learning phases with prerequisites, core topics, weekly deliverables, and curated external resource links.
   - Interactive milestone checkmarks with database persistence and next recommended step highlights.

3. **AI Coding Coach (`Module 3`)**:
   - Curated placement DSA problems covering Arrays, Strings, Linked Lists, Stacks, Queues, Trees, Graphs, Dynamic Programming, and SQL.
   - Progressive 4-tier hint ladder:
     1. Conceptual Hint
     2. Algorithmic Approach
     3. Pseudocode & Skeleton Logic
     4. Full Reference Solution (deliberately locked to prevent premature spoilers)
   - Safe isolated code execution sandbox with 2.5s execution timeouts and memory protection.
   - Socratic AI Coach assistance powered by Gemini 3.8 Flash.

4. **Daily Tech Poster (`Module 4`)**:
   - Features one high-yield enterprise engineering concept per day (e.g. *Retrieval-Augmented Generation (RAG)*, *Vector Databases & HNSW Indexing*, *Apache Kafka Event Streaming*).
   - Includes architectural step-by-step diagrams, practical runnable snippets, and **verified real-world company citations** with direct documentation links (Netflix TechBlog, Uber Engineering, Stripe TechBlog).

5. **Daily Concept Quiz (`Module 5`)**:
   - 3 to 5 deep questions testing the featured daily concept.
   - Instant validation with comprehensive explanations for both the correct answer and distractor choices (interview traps).
   - Anti-double-counting daily streak tracking.

6. **Machine Learning Service (`Module 6`)**:
   - Separate, runnable Python scikit-learn component in `/ml_service/`.
   - Fits a `TfidfVectorizer` (sublinear TF, 1-2 ngrams) and trains a multiclass `LogisticRegression` classifier on labeled problem complexity data.
   - Evaluated on a 25% held-out test split, saving model pickle artifacts and publishing verifiable metrics to `ml_service/evaluation_metrics.json`.
   - Live Python subprocess bridge (`/api/ml/recommend`) for real-time recommendation scoring.

7. **Skill Gap Recommendations (`Module 7`)**:
   - Analyzes quiz retention, DSA pass rates, completed roadmap milestones, and target role requirements.
   - Ranks prioritized revision topics, coding problems, and projects with transparent, human-readable explanations.

8. **Scenario-Based Technical Interview (`Module 8`)**:
   - Realistic role-specific production emergencies (e.g. *E-Commerce Flash Sale Database Race Conditions*, *ETL Pipeline Discrepancy Lag*, *Production Loan Default Model Drift*).
   - Structured AI evaluation across 6 critical hiring bar-raiser criteria:
     - Problem Clarification (0-20)
     - Stating Assumptions (0-15)
     - Technical Correctness (0-25)
     - Evidence & Depth (0-15)
     - Alternatives & Trade-offs (0-15)
     - Communication & Structure (0-10)
   - Provides identified strengths, missing architectural blind spots, actionable mentor guidance, and recommended drills.

9. **Project Catalog (`Module 9`)**:
   - Searchable, difficulty-tagged industry projects.
   - Features verified open datasets (NASA web logs, IBM Telco Churn, arXiv CS papers, Olist e-commerce), tech stacks, and 3-week milestone roadmaps.
   - Ranked using the scikit-learn TF-IDF and Cosine Similarity recommendation engine.

10. **ATS Resume Builder (`Module 10`)**:
    - Collects personal contact details, education, technical skills, projects, internships, and achievements.
    - Live single-column ATS-friendly preview designed to score high on parsing algorithms.
    - AI ATS Reviewer analyzing action verbs, keyword gaps, and rewriting bullet points into Google XYZ format.
    - Direct PDF export via clean `@media print` stylesheets.

11. **Learning Analytics (`Module 11`)**:
    - Real persisted learning activity with 7-day trend bar charts.
    - Topic-wise strengths and accuracy breakdown.
    - Clearly distinguishes zero scores from unattempted modules.

---

## 🔬 Scikit-Learn Machine Learning Pipeline

### Verified Evaluation Metrics (Held-Out Test Set)

| Metric | Score | Note |
|---|---|---|
| **Accuracy** | **60.00%** | Tested on 25% held-out split (3-class problem: Easy, Medium, Hard) |
| **Weighted Precision** | **58.17%** | Precision across class distributions |
| **Weighted Recall** | **60.00%** | True positive detection rate |
| **Weighted F1-Score** | **56.35%** | Harmonic mean of precision and recall |

### Saved Artifacts
- Model: `ml_service/models/difficulty_classifier.pkl`
- Vectorizer: `ml_service/models/tfidf_vectorizer.pkl`
- Metrics: `ml_service/evaluation_metrics.json`

### Running the Python ML Pipeline
To re-train the model and re-evaluate on test data:
```bash
python3 ml_service/train_model.py
```

To run the automated Python test suite:
```bash
python3 -m unittest ml_service/test_ml.py
```

---

## 🚀 Running the Web Application

### Prerequisites
- Node.js 18+ (tested on Node.js 22)
- Python 3.10+ with `scikit-learn` and `numpy`

### Installation & Startup
```bash
# Start unified full-stack dev server (Express + Vite middlewares on port 3000)
npm run dev

# Run TypeScript compilation check
npm run lint

# Run ML unit tests
npm run test:ml

# Build production bundle
npm run build
```

---

## 🛡️ Database & Security Details

- **Database Choice**: The environment utilizes an atomic JSON persistence adapter (`/data/app_database.json`). This ensures zero dependency on native C++ SQLite bindings that frequently conflict with Vite 8 / esbuild runtime environments, while guaranteeing zero data loss via atomic filesystem renames (`fs.renameSync`).
- **Sandbox Security**: Candidate code submitted to the AI Coding Coach is evaluated using a sandboxed child process with strict 2.5-second execution timeouts and memory caps. No untrusted shell strings are directly evaluated.
- **API Key Security**: The Google Gemini API key is strictly maintained on the server-side (`process.env.GEMINI_API_KEY`) and is never leaked to the client browser bundle.
