# README_AGENT.md
# Format: Agent-readable structured project manifest
# Updated: 2026-05-06
# Repo: https://github.com/karthikrs05/Git_Relic

---

## PROJECT_IDENTITY

```
name:        Git Relic (package: git-relic-terminal-ghost)
version:     1.0.0
purpose:     Platform for donating, discovering, and salvaging abandoned GitHub projects.
             Users upload zipped Git repos → system security-scans them → AI analyzes
             failure reason + resurrection roadmap → published for community salvagers.
type:        Full-stack web application
module_type: ESM (type: "module" in package.json)

tech_stack:
  frontend:
    - React 18 (JSX)
    - React Router DOM v6
    - Framer Motion (page transitions, animations)
    - Tailwind CSS v3
    - Vite v5 (bundler / dev server)
  backend:
    - Node.js + Express v4 (ESM)
    - MongoDB + Mongoose v9
    - JWT (jsonwebtoken) — 7d expiry
    - bcryptjs (password hashing)
    - multer (file upload, ZIP only, 500MB max)
    - simple-git (git history parsing)
    - unzipper (ZIP extraction)
    - gitleaks npm wrapper (secret scanning)
    - @google/generative-ai — gemini-3.1-pro-preview (AI analysis)
  dev_tools:
    - concurrently (run client + server together)
    - autoprefixer, postcss
```

---

## ENTRY_POINTS

```
frontend:
  root_html:       index.html
  js_entry:        src/main.jsx
  router_root:     src/App.jsx
  dev_command:     npm run dev           # starts Vite on http://localhost:5173
  build_command:   npm run build

backend:
  server_entry:    server/index.js
  dev_command:     npm run dev:server    # starts Express on http://localhost:8787
  start_command:   npm run start:server

combined:
  full_dev:        npm run dev:full      # concurrently runs client + server

cli_env_setup:
  template_file:   .env.example         # empty — see KNOWN_CONSTRAINTS
```

---

## API_ENDPOINTS

```
base_url: http://localhost:8787

# Health
GET  /api/health                         → { status, service }   [PUBLIC]

# Auth
POST /api/auth/register                  → { token, user }       [PUBLIC]
POST /api/auth/login                     → { token, user }       [PUBLIC]
GET  /api/auth/me                        → { id, username, email, createdAt, bio } [AUTH_REQUIRED]

# Projects
POST /api/projects/upload                → { message, project }  [AUTH_REQUIRED] [MULTIPART: projectZip]
POST /api/projects/:projectId/analyze    → { message, project }  [AUTH_REQUIRED] [donor only]
GET  /api/projects/list                  → [ ...projects ]       [PUBLIC] [status=published only]
GET  /api/projects/:projectId            → project object        [PUBLIC]
GET  /api/projects/:projectId/analysis   → AI analysis object    [PUBLIC]
GET  /api/projects/:projectId/security   → SecurityScanLog       [PUBLIC]
GET  /api/projects/user/:userId          → [ ...projects ]       [AUTH_REQUIRED]
GET  /api/projects/status/pending-review → [ ...projects ]       [AUTH_REQUIRED]

# Pitches
POST /api/pitches                        → { pitch }              [AUTH_REQUIRED]
GET  /api/pitches/user/my                → [ ...pitches ]         [AUTH_REQUIRED]
GET  /api/pitches/project/:projectId     → [ ...pitches ]         [AUTH_REQUIRED]
GET  /api/pitches/:pitchId               → pitch object           [AUTH_REQUIRED]
GET  /api/pitches/:projectId             → alias for project      [AUTH_REQUIRED]
PATCH /api/pitches/:pitchId/respond      → { message, pitch }     [AUTH_REQUIRED] [donor only]
PATCH /api/pitches/:pitchId/accept       → { message, pitch }     [AUTH_REQUIRED] [donor only]
PATCH /api/pitches/:pitchId/reject       → { message, pitch }     [AUTH_REQUIRED] [donor only]

# Lineage
GET  /api/lineage/project/:projectId     → [ ...lineage ]         [PUBLIC]
GET  /api/lineage/:projectId             → alias for project      [PUBLIC]
GET  /api/lineage/:lineageId             → lineage object         [PUBLIC]
```

---

## FRONTEND_ROUTES

```
path: /landing         → pages/Landing.jsx        [PUBLIC]
path: /explore         → pages/Explore.jsx         [PROTECTED]
path: /relic_detail/:projectId → pages/RelicDetail.jsx [PROTECTED]
path: /auth            → pages/Auth.jsx            [PUBLIC]
path: /drop_project    → pages/DropProject.jsx     [PROTECTED]
path: /pitch           → pages/Pitch.jsx           [PROTECTED]
path: /dashboard       → pages/Dashboard.jsx       [PROTECTED]
path: /leaderboard     → pages/Leaderboard.jsx     [PROTECTED]
path: *                → redirect /landing
```

---

## RECENT_CHANGES

```
date: 2026-05-06
  type:   fix+feat
  label:  gitleaks integration, model fix, doc sync
  detail: 3-step binary resolution (npm→project-root→PATH), .gitleaks.toml,
          gemini-2.0-flash-lite→gemini-3.1-pro-preview, all docs updated

date: 2026-05-06
  type:   fix
  label:  String IDs, SecurityScanLog schema, Windows gitleaks error detection,
          pitchRoutes.test.js mock fix — 50 tests passing

date: 2026-05-05
  commit: c7d2c32
  type:   feat
  label:  updates
  files:  (all files — bulk push of entire codebase)

date: 2026-05-05
  commit: 7c05b88
  type:   merge
  label:  merged main to master

date: 2026-05-05
  commit: 815a830
  type:   fix
  label:  Merge branch master — fix repo confusions

date: 2026-05-05
  commit: f45cad3
  type:   fix
  label:  removed test file (test.py renamed to .env.example)

date: 2026-05-05
  commit: 6fd0a53
  type:   feat
  label:  Initial commit: Git Relic frontend + auth backend + docs

date: 2026-05-05
  commit: 22f570b
  type:   chore
  label:  hi (initial empty commit)
```

---

## FEATURE_REGISTRY

```
feature: User Registration & Login
  status:  [STABLE]
  files:
    - server/routes/authRoutes.js
    - server/models/User.js
    - server/middleware/authMiddleware.js
    - src/pages/Auth.jsx
    - src/context/AuthContext.jsx
    - src/services/auth.js
  notes:   JWT stored in localStorage key `gr_token`. Token expiry: 7d.

feature: Project Upload (ZIP ingest)
  status:  [STABLE]
  files:
    - server/routes/projectRoutes.js  (POST /upload)
    - server/utils/fileExtractor.js
    - src/pages/DropProject.jsx
  notes:   Accepts only .zip files. Validates that uploaded zip contains .git directory.
           Uploads stored in uploads/projects/<uuid>/. Temp files in temp/.

feature: Git History Parsing
  status:  [STABLE]
  files:
    - server/utils/gitParser.js
  notes:   Uses simple-git. Reads last 10 commits, total count, last activity date.

feature: Security Scanning (Gitleaks)
  status:  [STABLE]
  files:
    - server/utils/securityScanner.js
    - server/models/SecurityScanLog.js
    - server/routes/projectRoutes.js  (scan triggered inside POST /upload)
  notes:   Runs gitleaks binary via execAsync. Issues capped at 10. Secret values are
           NOT stored — only file, type, line, severity. binary resolved from project root via import.meta.url.

feature: AI Project Analysis (Gemini)
  status:  [STABLE]
  files:
    - server/utils/aiAnalyzer.js
    - server/routes/projectRoutes.js  (POST /:projectId/analyze, also auto-runs on upload)
  notes:   Uses gemini-3.1-pro-preview. Reads README + last 10 commit messages.
           Returns: summary, failureReason, roadmap[], difficulty, estimatedHours.
           Falls back to getDefaultAnalysis() on parse/API failure.

feature: Project Marketplace (Explore)
  status:  [STABLE]
  files:
    - src/pages/Explore.jsx
    - server/routes/projectRoutes.js  (GET /list)
  notes:   Only shows projects with status=published.

feature: Relic Detail View
  status:  [STABLE]
  files:
    - src/pages/RelicDetail.jsx
    - server/routes/projectRoutes.js  (GET /:projectId, GET /:projectId/analysis)

feature: User Dashboard
  status:  [STABLE]
  files:
    - src/pages/Dashboard.jsx
    - server/routes/projectRoutes.js  (GET /user/:userId)

feature: Pitch Page
  status:  [STABLE]
  files:
    - src/pages/Pitch.jsx
    - server/models/Pitch.js
    - server/routes/pitchRoutes.js
  notes:   Full CRUD. POST /api/pitches, GET /project/:id, PATCH /:id/respond.
           Accept triggers ownership transfer, sets status='salvaged', creates Lineage record.
           GET /api/pitches/user/my for Dashboard pitch tracker.

feature: Lineage Tracking
  status:  [STABLE]
  files:
    - server/models/Lineage.js
    - server/routes/lineageRoutes.js
  notes:   GET /api/lineage/project/:id, GET /api/lineage/:id. Created on pitch accept.

feature: Salvage / Ownership Transfer
  status:  [STABLE]
  files:
    - server/models/Project.js (currentOwner field)
    - server/routes/pitchRoutes.js (PATCH /:id/respond)
  notes:   PATCH /:id/respond with action='accept' transfers ownership, sets
           status='salvaged', creates Lineage record, rejects competing pitches.

feature: Project Security Report View
  status:  [STABLE]
  files:
    - server/routes/projectRoutes.js  (GET /:projectId/security)
    - server/models/SecurityScanLog.js

feature: Pending Review Queue (Admin)
  status:  [STABLE]
  files:
    - server/routes/projectRoutes.js  (GET /status/pending-review)
  notes:   Returns all pending_review projects. RBAC guard: only emails in
           ADMIN_EMAILS env var can access. Returns 403 for non-admins.

feature: Page Transitions & Terminal UI
  status:  [STABLE]
  files:
    - src/components/PageTransition.jsx
    - src/components/TerminalCard.jsx
    - src/components/BlinkingCursor.jsx
    - src/components/TypingText.jsx
    - src/components/NeonButton.jsx
    - src/components/StatusBadge.jsx
    - src/components/StatCounter.jsx
    - src/components/MonospaceInput.jsx
    - src/layouts/AppLayout.jsx
    - src/index.css
    - tailwind.config.js

feature: Protected Routes (Frontend Auth Guard)
  status:  [STABLE]
  files:
    - src/components/ProtectedRoute.jsx
    - src/context/AuthContext.jsx

feature: Typewriter Hook
  status:  [STABLE]
  files:
    - src/hooks/useTypewriter.js

feature: Mock Data (Dev / Demo)
  status:  [DEPRECATED]
  files:
    - src/data/mockData.js
  notes:   Static fixture data. Should be replaced with live API calls. Do not expand.
```

---

## KNOWN_CONSTRAINTS

```
constraint: None
  severity: INFO
  detail:   All previously known constraints have been resolved.
```

---

## AGENT_INSTRUCTIONS

```
safe_to_modify:
  - src/pages/*                          # UI pages, no shared state side-effects
  - src/components/*                     # Presentational components
  - src/hooks/useTypewriter.js           # Isolated hook
  - server/utils/gitParser.js            # Pure utility, no DB writes
  - server/utils/fileExtractor.js        # Pure utility (except mkdir side-effects)
  - server/utils/aiAnalyzer.js           # Pure utility, reads env + calls external API
  - doc/*                                # Documentation only
  - tailwind.config.js                   # Styling only

modify_with_care:
  - server/routes/projectRoutes.js       # Core upload pipeline; modifying upload handler
                                         #   affects scan + AI trigger chain
  - server/models/Project.js             # Schema changes require Mongoose migration consideration
  - src/context/AuthContext.jsx          # Auth state; changes break ProtectedRoute + all pages
  - server/middleware/authMiddleware.js  # All protected routes depend on this
  - src/App.jsx                          # Route tree; changes affect all navigation

do_not_modify:
  - package-lock.json                    # Never edit manually; use npm install
  - .git/*                               # Git internals
  - uploads/*  (runtime generated)       # Runtime storage; not source-controlled
  - temp/*     (runtime generated)       # Temporary upload staging; not source-controlled

do_not_add:
  - CommonJS require() calls             # Project is ESM (type:module). Use import/export only.
  - Any hardcoded secrets or API keys    # Must use process.env.*
  - New routes without authMiddleware    # All mutating endpoints must be authenticated

patterns_to_avoid:
  - Expanding src/data/mockData.js       # [DEPRECATED] — wire to real API instead
  - Using /uploads/security hardcoded path (in saveSecurityReport) — path is dead code
  - Adding Pitch or Lineage routes without first reviewing unimplemented model schemas

env_vars_required_before_running:
  - MONGODB_URI
  - JWT_SECRET
  - GEMINI_API_KEY
```

---

## DEPENDENCY_MAP

```
# Format: MODULE → depends on → [MODULES]

server/index.js
  → server/routes/authRoutes.js
  → server/routes/projectRoutes.js
  → server/middleware/authMiddleware.js
  → server/config/db.js

server/routes/authRoutes.js
  → server/models/User.js
  → server/middleware/authMiddleware.js

server/routes/projectRoutes.js
  → server/middleware/authMiddleware.js
  → server/models/Project.js
  → server/models/SecurityScanLog.js
  → server/utils/fileExtractor.js
  → server/utils/gitParser.js
  → server/utils/securityScanner.js
  → server/utils/aiAnalyzer.js

server/utils/aiAnalyzer.js
  → @google/generative-ai  [EXTERNAL]
  → GEMINI_API_KEY         [ENV]

server/utils/securityScanner.js
  → gitleaks (npm binary)  [EXTERNAL]

server/utils/gitParser.js
  → simple-git             [EXTERNAL]

server/utils/fileExtractor.js
  → unzipper               [EXTERNAL]

server/middleware/authMiddleware.js
  → jsonwebtoken           [EXTERNAL]
  → JWT_SECRET             [ENV]

server/config/db.js
  → mongoose               [EXTERNAL]
  → MONGODB_URI            [ENV]

# Frontend

src/main.jsx
  → src/App.jsx
  → src/context/AuthContext.jsx

src/App.jsx
  → src/layouts/AppLayout.jsx
  → src/pages/* (all 7 pages)
  → src/components/ProtectedRoute.jsx

src/context/AuthContext.jsx
  → src/services/auth.js

src/services/auth.js
  → server API [EXTERNAL: http://localhost:8787]

src/components/ProtectedRoute.jsx
  → src/context/AuthContext.jsx

src/pages/Dashboard.jsx
  → src/context/AuthContext.jsx
  → server API /api/projects/user/:userId

src/pages/DropProject.jsx
  → src/context/AuthContext.jsx
  → server API /api/projects/upload

src/pages/Explore.jsx
  → server API /api/projects/list

src/pages/RelicDetail.jsx
  → server API /api/projects/:id
  → server API /api/projects/:id/analysis

src/pages/Auth.jsx
  → src/context/AuthContext.jsx (login/register)
```

---

## FILE_TREE_SUMMARY

```
CodeRelic/
├── index.html                         # Vite HTML shell
├── package.json                       # ESM, v1.0.0, all deps
├── vite.config.js                     # Vite + React plugin
├── tailwind.config.js                 # Tailwind theme + custom tokens
├── postcss.config.js                  # Autoprefixer
├── .env.example                       # [EMPTY — populate before use]
├── .gitignore
│
├── server/
│   ├── index.js                       # Express app entry
│   ├── config/db.js                   # MongoDB connect
│   ├── data/users.json                # [UNKNOWN — possibly seed data]
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT Bearer guard
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── SecurityScanLog.js
│   │   ├── Pitch.js                   # [STABLE]
│   │   └── Lineage.js                 # [STABLE]
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── pitchRoutes.js             # [STABLE]
│   │   └── lineageRoutes.js           # [STABLE]
│   ├── config/
│   │   ├── db.js
│   │   └── jwtConfig.js               # [NEW] crypto-random JWT_SECRET fallback
│   └── utils/
│       ├── aiAnalyzer.js
│       ├── fileExtractor.js
│       ├── gitParser.js
│       └── securityScanner.js
│
├── src/
│   ├── main.jsx                       # React DOM root + AuthProvider
│   ├── App.jsx                        # Router tree
│   ├── index.css                      # Global styles
│   ├── components/
│   │   ├── BlinkingCursor.jsx
│   │   ├── MonospaceInput.jsx
│   │   ├── Navbar.jsx
│   │   ├── NeonButton.jsx
│   │   ├── PageTransition.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── StatCounter.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── TerminalCard.jsx
│   │   └── TypingText.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── data/
│   │   └── mockData.js                # [DEPRECATED]
│   ├── hooks/
│   │   └── useTypewriter.js
│   ├── layouts/
│   │   └── AppLayout.jsx
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Auth.jsx
│   │   ├── Explore.jsx
│   │   ├── RelicDetail.jsx
│   │   ├── DropProject.jsx
│   │   ├── Pitch.jsx
│   │   └── Dashboard.jsx
│   └── services/
│       └── auth.js
│
└── doc/
    ├── README.md
    ├── architecture.md
    ├── system-flow.md
    ├── tech-stack.md
    ├── CHANGELOG.md
    ├── PROJECT_STATUS.md
    ├── TEST_REPORT.md
    ├── PHASE_2_IMPLEMENTATION.md
    ├── PHASE_3_SECURITY_SCANNING.md
    └── PHASE_4_AI_PATHOLOGIST.md

root:
├── .gitleaks.toml                     # [NEW] gitleaks config — suppress false positives
├── gitleaks.exe                       # [NEW] manually installed binary (gitignored)
└── vitest.config.js                   # [NEW] test runner config
```

---
# END README_AGENT.md
