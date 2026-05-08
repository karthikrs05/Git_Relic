# CodeRelic — Presentation Study Guide

> **Purpose:** Quick-reference cheat sheet for your final academic presentation.  
> **How to use:** Scan the bold headings during Q&A. Read the bullet points to explain any function on the spot.

---

## 1. High-Level Architecture & Tech Stack

```
┌─────────────────────┐        HTTP/JSON         ┌──────────────────────┐        Mongoose        ┌──────────────┐
│   React Frontend    │  ←───────────────────→   │   Express Backend    │  ←─────────────────→  │   MongoDB    │
│   (Vite @ :5173)    │    JWT in Auth header     │   (Node @ :8787)     │                       │  (git-relic) │
└─────────────────────┘                           └──────────────────────┘                       └──────────────┘
                                                         │       │
                                                         │       └──── Google Gemini API (AI analysis)
                                                         │
                                                         └──── Gitleaks binary (security scanning via child_process)
```

### Stack at a Glance

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 + Vite | Fast HMR, modern JSX |
| **Styling** | TailwindCSS + custom `ghost-*` theme | Dark terminal aesthetic |
| **Animations** | Framer Motion | Smooth page transitions, hover effects |
| **Backend** | Node.js + Express | Lightweight REST API |
| **Database** | MongoDB + Mongoose | Flexible schema for project metadata |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | Stateless authentication, password hashing |
| **File Handling** | Multer + unzipper | Disk-based streaming uploads, zip extraction |
| **Git Parsing** | simple-git | Reads `.git/` history programmatically |
| **Security** | Gitleaks (binary) | Scans for hardcoded secrets/API keys |
| **AI** | Google Gemini 2.5 Flash | Forensic analysis of abandoned projects |

### How They Connect

1. **Frontend → Backend:** Every API call goes through service wrappers (`src/services/projects.js`, `pitches.js`, `auth.js`). These use `fetch()` with `API_BASE` = `http://localhost:8787/api`. Protected routes include a `Bearer <JWT>` header.
2. **Backend → Database:** Mongoose models (`Project`, `Pitch`, `User`, `Lineage`, `SecurityScanLog`) define schemas. Express routes call `Model.find()`, `.save()`, etc.
3. **Backend → External Tools:** The server spawns `gitleaks` as a child process (`child_process.exec`) and calls the Gemini REST API via the `@google/generative-ai` SDK.

---

## 2. Core Workflows

### A. The "Drop" Workflow (Uploading an Abandoned Project)

> **If asked:** "Walk us through what happens when a user uploads a project."

```
User clicks "upload_and_scan" → multer receives .zip → extract to disk → validate .git exists
→ parse git history → run gitleaks security scan → run Gemini AI analysis → save to MongoDB → cleanup files
```

**Step-by-step:**

1. **User fills the form** in `DropProject.jsx` — selects a `.zip` file, enters a **title** (required) and optional **description**.
2. **Frontend sends `FormData`** via `POST /api/projects/upload` with the JWT token in the `Authorization` header.
3. **Multer middleware** saves the `.zip` to a `temp/` directory on disk (NOT in memory — important for large files up to 500MB).
4. **`extractZip()`** (in `fileExtractor.js`) streams the zip into `uploads/projects/<uuid>/` using the `unzipper` library.
5. **`validateProjectStructure()`** checks that a `.git/` directory exists — either at the root or one level deep (handles Windows zip quirks).
6. **`parseGitHistory()`** (in `gitParser.js`) uses the `simple-git` library to read:
   - Total commit count
   - Date of last activity
   - Last 10 commit messages (hash, message, author, date)
7. **`getProjectMetadata()`** scans all files recursively to detect programming languages (by file extension) and count total files.
8. **A `Project` document is created** in MongoDB with status `pending_scan`.
9. **`scanWithGitleaks()`** (in `securityScanner.js`) spawns the gitleaks binary:
   ```bash
   gitleaks detect --source "<path>" --verbose --exit-code 0
   ```
   - **If secrets found →** status becomes `pending_review` (blocked)
   - **If clean →** status becomes `scanned`
   - **If gitleaks not installed →** scan is skipped, status becomes `published` (graceful degradation)
10. **`analyzeProjectWithAI()`** (in `aiAnalyzer.js`) sends commit messages + README content to Google Gemini with a structured prompt requesting JSON output: `summary`, `failureReason`, `roadmap` (3 steps), `difficulty`, `estimatedHours`.
11. **Project status → `published`**, physical files are deleted from disk (all data is now in MongoDB), temp zip is cleaned up.
12. **Response sent** back to frontend with project ID, scan results, and AI analysis.

### B. The "Pitch & Revive" Workflow

> **If asked:** "How does someone adopt an abandoned project?"

```
Browse Explore → Click a relic → Read AI autopsy → Submit pitch → Donor reviews → Accept/Reject
→ If accepted: ownership transfers, Lineage created, competing pitches auto-rejected
```

**Step-by-step:**

1. **Browsing:** `Explore.jsx` calls `GET /api/projects/list` to fetch all `published` projects. Users can filter by tech stack and status, and search by title.
2. **Viewing:** Clicking a card navigates to `RelicDetail.jsx` via `/relic_detail/:projectId`. This calls `GET /api/projects/:projectId` to load full project data (AI roadmap, git history, security scan).
3. **Pitching:** The "submit_pitch" button navigates to `Pitch.jsx` with the `projectId` in React Router's `location.state`. The salvager writes a revival plan (markdown text) and optional PR link.
4. **Backend validation** (`POST /api/pitches`):
   - Project must exist and be `published`
   - Donor **cannot** pitch on their own project (`donorId !== req.user.id`)
   - User cannot submit duplicate pitches for the same project
5. **Donor reviews:** The donor sees incoming pitches in `Dashboard.jsx` under the "incoming requests" tab. Each pitch shows the salvager's username, their pitch text, and accept/reject buttons.
6. **Accepting a pitch** (`PATCH /api/pitches/:pitchId/respond` with `decision: "accepted"`):
   - Pitch status → `accepted`
   - Project's `currentOwner` → salvager's ID
   - Project's `status` → `salvaged`
   - A **`Lineage` record** is created (immutable ownership transfer log)
   - **All other pending pitches** for this project are automatically bulk-rejected via `Pitch.updateMany()`

---

## 3. Backend Breakdown

### 3.1 Authentication (`server/routes/authRoutes.js`)

| Endpoint | Auth? | What it does |
|----------|-------|-------------|
| `POST /api/auth/register` | No | Creates a `User` in MongoDB (bcrypt-hashed password), provisions a flat-file account in `accounts.json`, returns a JWT |
| `POST /api/auth/login` | No | Validates email + password with `bcrypt.compare()`, returns JWT |
| `GET /api/auth/me` | Yes | Returns the current user's profile (looked up from JWT) |
| `PATCH /api/auth/me` | Yes | Updates the user's `bio` field |

**Key functions:**
- **`signToken(user)`** — Creates a JWT containing `{ id, email, username }` with a 7-day expiry using `jwt.sign()`
- **`upsertAccountForUser(user)`** — Creates or updates the user's record in `accounts.json` (a flat-file store for stats like relicPoints, droppedProjects count)
- **`readAccounts()` / `writeAccounts()`** — Read/write helpers for the `accounts.json` file

### 3.2 Auth Middleware (`server/middleware/authMiddleware.js`)

- Extracts the `Bearer <token>` from the `Authorization` header
- Calls `jwt.verify()` to decode the token
- Looks up the real user in MongoDB (first by `decoded.id`, fallback to `decoded.email`)
- Attaches `req.user = { id, email, username, token }` for downstream route handlers

### 3.3 Projects (`server/routes/projectRoutes.js`)

| Endpoint | Auth? | What it does |
|----------|-------|-------------|
| `POST /api/projects/upload` | Yes | The big one — handles the entire Drop workflow (extract → scan → AI → save) |
| `POST /api/projects/:projectId/analyze` | Yes | Re-runs AI analysis on a `scanned` project (donor only) |
| `GET /api/projects/list` | No | Returns all `published` projects with donor usernames stitched in |
| `GET /api/projects/:projectId` | No | Returns a single project with full details |
| `GET /api/projects/:projectId/analysis` | No | Returns just the AI analysis for a project |
| `GET /api/projects/:projectId/security` | No | Returns the full `SecurityScanLog` for a project |
| `GET /api/projects/status/pending-review` | Yes (Admin) | Returns projects blocked by security scan (admin emails checked via `isAdmin()`) |
| `GET /api/projects/user/:userId` | Yes | Returns all projects dropped by a specific user (for Dashboard) |

**Key detail — User stitching:**  
The `donorId` field in MongoDB is an ObjectId. The `/list` endpoint manually joins it with the `User` collection using `populateUsers()` so the frontend gets `{ username: "john" }` instead of a raw ObjectId.

### 3.4 Pitches (`server/routes/pitchRoutes.js`)

| Endpoint | Auth? | What it does |
|----------|-------|-------------|
| `POST /api/pitches` | Yes | Submit a pitch (validates: project exists, is published, not your own project, no duplicates) |
| `GET /api/pitches/project/:projectId` | No | Lists all pitches for a project (with salvager usernames stitched) |
| `GET /api/pitches/user/my` | Yes | Lists pitches submitted by the current user |
| `GET /api/pitches/donor/incoming` | Yes | Lists pending pitches on projects the current user owns |
| `GET /api/pitches/:pitchId` | No | Returns a single pitch |
| `PATCH /api/pitches/:pitchId/respond` | Yes | Accept or reject a pitch (donor only). Accepting triggers the ownership transfer cascade |

### 3.5 Insights (`server/routes/insightRoutes.js`)

| Endpoint | Auth? | What it does |
|----------|-------|-------------|
| `GET /api/insights/overview` | No | Landing page data: total relics, active requests, revived count, activity feed, featured relics |
| `GET /api/insights/me` | Yes | Dashboard stats: dropped/salvaged counts, pending pitches, reputation points |

**Reputation formula:** `reputationPoints = (salvagedCount × 100) + (droppedCount × 10)`

### 3.6 Utility Functions

| File | Function | What it does |
|------|----------|-------------|
| `fileExtractor.js` | `extractZip(zipPath, extractId)` | Streams a zip file to `uploads/projects/<id>/` using `unzipper` |
| `fileExtractor.js` | `validateProjectStructure(dir)` | Checks for `.git/` at root or one level deep; throws if not found |
| `fileExtractor.js` | `getProjectMetadata(dir)` | Recursively scans files, detects languages by extension (`.js`→JavaScript, `.py`→Python, etc.), counts files |
| `fileExtractor.js` | `cleanupTempFile(path)` | Deletes the uploaded zip from `temp/` |
| `fileExtractor.js` | `cleanupProjectDir(dir)` | Recursively deletes the extracted project folder |
| `gitParser.js` | `parseGitHistory(projectPath)` | Uses `simple-git` to extract: commit count, last activity date, last 10 commits (hash/message/author/date) |
| `securityScanner.js` | `getGitleaksBinary()` | 3-step binary resolution: npm package → project root → system PATH |
| `securityScanner.js` | `scanWithGitleaks(projectPath)` | Spawns `gitleaks detect` as a child process; returns `{ passed, issues, rawOutput }` |
| `securityScanner.js` | `sanitizeIssues(issues)` | Strips sensitive data from scan results for safe display (limits to 10 issues) |
| `aiAnalyzer.js` | `analyzeProjectWithAI(projectDir, gitData)` | Reads README + commit messages → sends structured prompt to Gemini → parses JSON response → returns `{ summary, failureReason, roadmap[], difficulty, estimatedHours }` |
| `aiAnalyzer.js` | `getDefaultAnalysis()` | Fallback analysis if Gemini fails |
| `userUtils.js` | `populateUser(userId)` | `User.findById(id).select('username email bio')` — single user lookup |
| `userUtils.js` | `populateUsers(ids)` | `User.find({ _id: { $in: ids } })` — batch user lookup for stitching |

---

## 4. Frontend Breakdown

### 4.1 Pages

| Page | Route | Purpose |
|------|-------|---------|
| **`Landing.jsx`** | `/landing` | Public homepage. Fetches live stats (total relics, active requests, revived count) from `GET /api/insights/overview`. Shows activity feed and featured relics. |
| **`Auth.jsx`** | `/auth` | Login/Register form. Calls `AuthContext.login()` or `AuthContext.register()` which hit `/api/auth/login` and `/api/auth/register`. |
| **`DropProject.jsx`** | `/drop_project` | Multi-step wizard (4 steps): **Step 1** = file picker + title/description inputs → **Step 2** = security scan results → **Step 3** = AI autopsy preview → **Step 4** = published confirmation. |
| **`Explore.jsx`** | `/explore` | Grid of all published relics as clickable `TerminalCard`s. Has a sidebar with tech stack and status checkbox filters + a search bar. Clicking a card → `/relic_detail/:projectId`. |
| **`RelicDetail.jsx`** | `/relic_detail/:projectId` | Full project view. Shows title, description, donor name, status badge, AI analysis (summary, failure reason, roadmap, difficulty), git history (scrollable commit list), and a "submit_pitch" button. |
| **`Pitch.jsx`** | `/pitch` | Textarea for revival plan + optional PR link input. Receives `projectId` via `location.state`. Validates text is non-empty before submitting. |
| **`Dashboard.jsx`** | `/dashboard` | Protected (login required). 4 tabs: **dropped relics** (your uploads), **salvaged relics** (successfully transferred), **incoming requests** (pitches from salvagers — with accept/reject buttons), **pitch tracker** (pitches you've submitted to others). |

### 4.2 Authentication State (`src/context/AuthContext.jsx`)

- Uses React Context + `sessionStorage` (not localStorage — session-scoped)
- **Token key:** `gr_token`
- **Session timer:** 5-minute auto-logout (`SESSION_DURATION_MS = 5 * 60 * 1000`)
- On app load: checks if token exists in sessionStorage → calls `GET /api/auth/me` to validate → sets `user` state
- Exposes: `{ token, user, loading, register, login, logout, isAuthenticated }`
- `useAuth()` hook provides access anywhere in the component tree

### 4.3 Service Layer (`src/services/`)

| File | Functions | What they call |
|------|-----------|---------------|
| `auth.js` | `register()`, `login()`, `fetchMe()` | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| `projects.js` | `uploadProject()`, `listProjects()`, `getProjectById()`, `getUserProjects()`, `getProjectAnalysis()` | Various `/api/projects/*` endpoints |
| `pitches.js` | `submitPitch()`, `getUserPitches()`, `getIncomingPitches()`, `acceptPitch()`, `rejectPitch()`, `getProjectPitches()` | Various `/api/pitches/*` endpoints |
| `insights.js` | `getOverview()`, `getMyInsights()` | `GET /api/insights/overview`, `GET /api/insights/me` |

All services use a shared `request()` helper that:
- Prepends `API_BASE` (`http://localhost:8787/api`) to paths
- Parses JSON responses
- Throws on non-OK status codes

### 4.4 Key Reusable Components

| Component | Purpose |
|-----------|---------|
| `TerminalCard` | Glassmorphic card with dark background + neon border. Accepts `hover` prop for scale effect. Spreads `...rest` props (critical for `onClick`). |
| `StatusBadge` | Renders project status as a colored pill badge (`published` = green, `salvaged` = neon, `pending_review` = orange, `failed` = red) |
| `NeonButton` | Glowing CTA button with `variant="outline"` option |
| `PageTransition` | Framer Motion wrapper for smooth page enter/exit animations |
| `ProtectedRoute` | Wraps routes that require authentication — redirects to `/auth` if not logged in |
| `TypingText` | Typewriter animation effect for hero text |
| `StatCounter` | Animated number counter (counts up from 0) |

---

## 5. Database Models (MongoDB)

### Entity-Relationship Diagram

```
┌─────────┐       donorId        ┌───────────┐      projectId      ┌─────────┐
│  User   │ ←──────────────────  │  Project   │ ←────────────────  │  Pitch  │
│         │       currentOwner   │            │                    │         │
│ _id     │ ←──────────────────  │ _id        │                    │ _id     │
│ username│                      │ title      │                    │ pitchText│
│ email   │                      │ status     │  salvagerId        │ status  │
│ password│                      │ aiAnalysis │ ──────────────→    │ prLink  │
│ Hash    │                      │ techStack  │                    └─────────┘
│ bio     │                      │ commitCount│
└─────────┘                      └────────────┘
     ↑                                ↑
     │ donorId + salvagerId           │ projectId
     │                                │
┌─────────┐                    ┌──────────────────┐
│ Lineage │                    │ SecurityScanLog  │
│         │                    │                  │
│ donorId │                    │ projectId        │
│ salvager│                    │ passed           │
│ Id      │                    │ issues[]         │
│ transfer│                    │ rawOutput        │
│ redAt   │                    └──────────────────┘
└─────────┘
```

### Model Details

| Model | Fields | Purpose |
|-------|--------|---------|
| **User** | `username` (unique), `email` (unique, lowercase), `passwordHash`, `bio`, `createdAt` | Stores registered users. Passwords are bcrypt-hashed (never stored in plaintext). |
| **Project** | `donorId` (→User), `title`, `description`, `techStack[]`, `commitCount`, `lastActivity`, `metadata` {languages, fileCount}, `status` (enum: pending_scan/scanned/pending_review/published/salvaged/failed), `securityScanResult` {passed, issues[]}, `aiAnalysis` {summary, failureReason, roadmap[], difficulty, estimatedHours}, `currentOwner` (→User), `storageLocation` | The central entity. Tracks the full lifecycle from upload → scan → publish → salvage. |
| **Pitch** | `projectId` (→Project), `salvagerId` (→User), `pitchText`, `prLink`, `status` (enum: pending/accepted/rejected), `respondedAt` | A salvager's revival proposal for a project. |
| **Lineage** | `projectId` (→Project), `parentProjectId`, `donorId` (→User), `salvagerId` (→User), `generationNumber`, `transferredAt` | **Immutable audit trail** of ownership transfers. Created when a pitch is accepted. Tracks the "family tree" of a project. |
| **SecurityScanLog** | `projectId` (→Project), `passed`, `issueCount`, `issues[]` {file, type, line, severity}, `rawOutput`, `scannedAt` | Full record of a gitleaks scan. Stored separately from Project to keep the main document lean. |

### Status Lifecycle

```
pending_scan → scanned → published → salvaged
                  ↓
            pending_review (secrets found)
                  ↓
               failed (extraction/scan error)
```

---

## 6. Presentation "Flex Points" — Impressive Talking Points

Use these when a reviewer asks "what was technically challenging?" or "what are you proud of?"

---

### 🔒 1. "We integrated automated DevSecOps into the upload pipeline."

> "When a user uploads a repository, the backend doesn't just store it — it spawns a **child process** (`child_process.exec`) to run **Gitleaks**, an industry-standard secret detection tool. It scans the entire Git history for hardcoded API keys, passwords, and tokens. If any secrets are found, the project is automatically blocked from being published. The binary resolution is smart too — it checks three locations in priority order: the npm package, the project root, and the system PATH."

**Code reference:** `securityScanner.js` → `scanWithGitleaks()` and `getGitleaksBinary()`

---

### 🤖 2. "We use Google Gemini for forensic analysis of abandoned codebases."

> "After the security scan, the backend reads the project's README and last 10 commit messages, constructs a detailed prompt, and sends it to the **Gemini 2.5 Flash API**. The AI returns a structured JSON response with: a summary of what the project does, a probable failure reason (like 'Dependency Hell' or 'Scope Creep'), a 3-step resurrection roadmap, a difficulty rating, and an estimated hours to completion. We parse the JSON safely with fallbacks for truncated or malformed responses."

**Code reference:** `aiAnalyzer.js` → `analyzeProjectWithAI()`

---

### 📁 3. "We stream large files to disk instead of loading them into memory."

> "Multer is configured with **disk storage**, not memory storage. This means even a 500MB zip file is streamed directly to the filesystem without blowing up the Node.js heap. After extraction and processing, we strictly clean up both the temp zip and the extracted directory to keep server storage near zero. All meaningful data is persisted in MongoDB."

**Code reference:** `projectRoutes.js` multer config → `fileExtractor.js` → `cleanupTempFile()` + `cleanupProjectDir()`

---

### 🔄 4. "Accepting a pitch triggers a multi-step database transaction."

> "When a donor accepts a pitch, it's not a simple status toggle. The backend performs **four database operations** in sequence: (1) marks the pitch as `accepted`, (2) transfers the Project's `currentOwner` to the salvager, (3) creates an immutable **Lineage record** that permanently tracks the transfer of ownership — like a blockchain of project history, and (4) bulk-rejects all other pending pitches for that project using `Pitch.updateMany()`. This prevents race conditions where multiple pitches could be accepted."

**Code reference:** `pitchRoutes.js` → `PATCH /:pitchId/respond` (the `if (decision === 'accepted')` block)

---

### 🛡️ 5. "We use session-scoped JWT authentication with automatic expiry."

> "The frontend stores the JWT in `sessionStorage` (not `localStorage`), so it's wiped when the browser tab closes. On top of that, there's a **5-minute idle timeout** implemented with `setTimeout` that automatically calls `logout()`. The backend middleware validates every protected request by decoding the JWT, then performing a **real database lookup** to verify the user still exists — so if an account is deleted, their token immediately becomes invalid."

**Code reference:** `AuthContext.jsx` → `startLogoutTimer()` + `authMiddleware.js`

---

## Quick Q&A Cheat Sheet

| Question | Answer |
|----------|--------|
| "What database do you use?" | MongoDB with Mongoose ODM. Five collections: User, Project, Pitch, Lineage, SecurityScanLog. |
| "How do you handle authentication?" | JWT-based. Passwords hashed with bcrypt (10 salt rounds). Token stored in sessionStorage with 5-min auto-logout. |
| "How do you handle file uploads?" | Multer with disk storage. Max 500MB. Files extracted with `unzipper`, validated for `.git/` directory, then deleted after processing. |
| "What happens if gitleaks isn't installed?" | Graceful degradation — scan is skipped with `skipped: true`, project goes straight to `published`. Logged as a warning. |
| "How is the AI integrated?" | Backend sends a prompt with commit history + README to Google Gemini 2.5 Flash API. Response is parsed as JSON with safe fallbacks. |
| "How do you prevent a user from pitching on their own project?" | Backend checks `project.donorId.toString() === req.user.id` and returns 403 if true. |
| "What is the Lineage model for?" | It's an immutable audit trail. Every time ownership transfers, a Lineage record is created — tracks donor, salvager, project, and timestamp. |
| "How does the frontend talk to the backend?" | Service wrapper functions in `src/services/` that use `fetch()` with the API base URL. Protected routes include `Authorization: Bearer <token>`. |

---

*Good luck with the presentation! 🚀*
