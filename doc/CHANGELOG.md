# CHANGELOG.md
> One-line entries per fix. Format: [YYYY-MM-DD] [type] description → file

[2026-05-06] [fix] Fixed Gemini JSON parsing by stripping markdown fences and adding length guards, preventing crashes on truncated AI responses → server/utils/aiAnalyzer.js

[2026-05-05] [fix] Added `import 'dotenv/config'` as line 1 — env vars now load from .env on server start → server/index.js
[2026-05-05] [fix] Replaced `require.resolve` with `createRequire` + cross-platform `getGitleaksBinary()` — fixes ESM crash and Windows/macOS binary mismatch → server/utils/securityScanner.js
[2026-05-05] [fix] Moved `GET /status/pending-review` before `/:projectId` catch-all — correct route declaration order → server/routes/projectRoutes.js
[2026-05-05] [fix] Populated `.env.example` with all 6 required vars (PORT, CORS_ORIGIN, MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, VITE_API_BASE_URL) → .env.example
[2026-05-05] [fix] Added `difficulty`, `estimatedHours`, `analyzedAt` to `Project.aiAnalysis` Mongoose schema — fixes silent data loss on save → server/models/Project.js
[2026-05-05] [fix] Added `temp/` and `uploads/` to .gitignore — prevents accidental commit of runtime server directories → .gitignore
[2026-05-05] [feat] Created Pitch API: POST /api/pitches, GET /project/:id, PATCH /:id/respond — registered in server/index.js → server/routes/pitchRoutes.js
[2026-05-05] [fix] CORS origin now reads from CORS_ORIGIN env var with localhost:5173 fallback → server/index.js
[2026-05-05] [feat] DropProject.jsx fully wired — real file upload, auth token, 4-step wizard shows live scan/metadata/AI results → src/pages/DropProject.jsx
[2026-05-05] [feat] RelicDetail.jsx fully wired — useParams + fetches project/analysis/pitches; route updated to /relic_detail/:projectId → src/pages/RelicDetail.jsx, src/App.jsx
[2026-05-05] [feat] Pitch.jsx fully wired — posts to /api/pitches, reads projectId from location.state, /pitch route restored in App.jsx → src/pages/Pitch.jsx
[2026-05-05] [feat] Added GET /api/pitches/user/my endpoint for Dashboard pitch tracker tab → server/routes/pitchRoutes.js
[2026-05-05] [feat] Explore.jsx wired — real API fetch, search, correct status/tech filters, card navigation → src/pages/Explore.jsx
[2026-05-05] [feat] Dashboard.jsx wired — dropped/salvaged/pitch tabs show live API data, stats computed from fetched data → src/pages/Dashboard.jsx
[2026-05-05] [feat] Landing.jsx wired — featured relics from API with navigation, live counts; mockData kept only for decorative log feed → src/pages/Landing.jsx
[2026-05-05] [fix] Added `prLink: String` to Pitch schema — field was saved by pitchRoutes but missing from schema causing silent data loss → server/models/Pitch.js
[2026-05-05] [feat] Created Lineage API: GET /api/lineage/project/:id, GET /api/lineage/:id → server/routes/lineageRoutes.js
[2026-05-05] [feat] Pitch accept now triggers salvage: ownership transfer, status='salvaged', Lineage record created, other pitches rejected → server/routes/pitchRoutes.js
[2026-05-05] [fix] JWT_SECRET missing now logs a startup warning instead of silently using hardcoded fallback → server/index.js
[2026-05-05] [fix] Removed GET /api/protected/relics dead stub → server/index.js
[2026-05-05] [fix] Removed saveSecurityReport() dead function (hardcoded Linux path, never called) → server/utils/securityScanner.js
[2026-05-05] [feat] Added PATCH /api/auth/me — bio update endpoint, persists to users.json → server/routes/authRoutes.js
[2026-05-05] [fix] Added prLink to Pitch schema → server/models/Pitch.js
[2026-05-05] [security] RBAC guard on GET /api/projects/status/pending-review — isAdmin() checks ADMIN_EMAILS env var; 403 for non-admins → server/routes/projectRoutes.js
[2026-05-05] [fix] Added server/data/accounts.json to .gitignore — runtime file was unignored → .gitignore
[2026-05-05] [docs] Rewrote doc/architecture.md — accurate data layer, full route tables, env var list, notes on file/MongoDB split → doc/architecture.md
[2026-05-05] [security] Created server/config/jwtConfig.js — JWT_SECRET now shared via module; fallback is crypto.randomBytes(64) instead of predictable literal → server/config/jwtConfig.js
[2026-05-05] [security] authRoutes.js + authMiddleware.js now import JWT_SECRET from jwtConfig.js — hardcoded fallback literal removed from both files
[2026-05-05] [fix] scanWithGitleaks catch block: ENOENT (binary not found) now returns passed:true+scanSkipped:true instead of blocking upload as "secrets detected" → server/utils/securityScanner.js
[2026-05-05] [fix] fileExtractor.js top-level await now wrapped in try/catch — FATAL error + process.exit(1) if dirs cannot be created → server/utils/fileExtractor.js
[2026-05-05] [feat] Added cleanupProjectDir() to fileExtractor.js; called after publish in projectRoutes.js — extracted files deleted after AI analysis, storageLocation cleared → server/routes/projectRoutes.js
[2026-05-05] [refactor] mockData.js — stripped dead exports (stats, relics, commits, pitches); only `logs` remains for Landing.jsx decorative feed → src/data/mockData.js
[2026-05-05] [fix] fileExtractor.js `validateProjectStructure` — rewrote logic to correctly resolve nested project paths (one level deep) so standard zips don't fail with ENOENT → server/utils/fileExtractor.js
[2026-05-05] [fix] `main.jsx` — added React Router v7 future flags (`v7_startTransition`, `v7_relativeSplatPath`) to silence console deprecation warnings → src/main.jsx
[2026-05-05] [chore] package.json — switched `dev:server` to use `nodemon` instead of `node` for automatic restarts during development → package.json
[2026-05-06] [fix] Mongoose schema validation crash — refactored `Project`, `Pitch`, and `Lineage` to use `String` instead of `ObjectId` for user IDs to match the UUID strings generated by the flat-file auth system (`users.json`).
[2026-05-06] [fix] Removed Mongoose `.populate()` calls that broke after the String ID migration, and implemented manual user object stitching by exporting and invoking `readUsers()` in `projectRoutes.js` and `pitchRoutes.js`.
[2026-05-06] [fix] `SecurityScanLog` validation bug (`Cast to [string] failed`) — resolved Mongoose reserved keyword conflict by changing `type: String` to `type: { type: String }` inside the `issues` array sub-schema.
[2026-05-06] [fix] `scanWithGitleaks` Windows error fallback — updated catch block to detect "not recognized" as an infrastructure failure rather than a security threat, properly allowing uploads without gitleaks to publish instead of getting stuck in `pending_review`.
[2026-05-06] [test] Test suite — updated `pitchRoutes.test.js` mock behavior to correctly support the newly chained `.lean()` execution path. All 50 backend tests passing.
[2026-05-06] [feat] gitleaks binary resolution — `getGitleaksBinary()` now uses 3-step lookup: (1) npm package, (2) project root `gitleaks.exe`/`gitleaks`, (3) system PATH → server/utils/securityScanner.js
[2026-05-06] [chore] Added `gitleaks` and `gitleaks.exe` to `.gitignore` — prevents committing the 22MB manually-downloaded binary → .gitignore
[2026-05-06] [config] Created `.gitleaks.toml` — suppresses false positives from doc placeholder tokens (YOUR_TOKEN_HERE); excludes temp/, uploads/, scratch/, node_modules/ from scanning → .gitleaks.toml
[2026-05-06] [fix] Gemini model updated from deprecated `gemini-1.5-flash` (404 Not Found) to `gemini-2.0-flash-lite` (active, higher free-tier quota) → server/utils/aiAnalyzer.js
[2026-05-06] [fix] gitleaks binary path resolved via import.meta.url → server/utils/securityScanner.js
[2026-05-06] [fix] missing gitleaks skips gracefully, sets status published → server/routes/projectRoutes.js
[2026-05-06] [feat] .gitleaks.toml baseline config created → .gitleaks.toml
[2026-05-06] [fix] AI model updated to gemini-3.1-pro-preview → server/utils/aiAnalyzer.js
[2026-05-06] [fix] users now saved to MongoDB, removed users.json dependency → server/routes/authRoutes.js
[2026-05-06] [fix] gitHistory array added to Project schema → server/models/Project.js
[2026-05-06] [fix] pitch body field renamed pitchText → message → server/routes/pitchRoutes.js
[2026-05-06] [fix] alias route added GET /api/pitches/:projectId → server/routes/pitchRoutes.js
[2026-05-06] [fix] route ordering fixed, pending-review no longer shadowed → server/routes/projectRoutes.js
[2026-05-06] [test] Added projectRoutes tests covering upload, list, getById, user, and pending-review endpoints → server/routes/projectRoutes.test.js
[2026-05-06] [test] Added util tests for aiAnalyzer and gitParser → server/utils/*.test.js
[2026-05-06] [test] Expanded pitchRoutes tests to fully cover 403 and 404 paths for accepting and rejecting pitches → server/routes/pitchRoutes.test.js
[2026-05-06] [test] Added frontend tests for AuthContext and ProtectedRoute → src/context/*.test.jsx, src/components/*.test.jsx
[2026-05-06] [test] Added frontend smoke tests for all pages → src/pages/__tests__/*.test.jsx
[2026-05-06] [feat] RelicDetail.jsx now renders project.description below the title — was silently omitted despite field existing in API response → src/pages/RelicDetail.jsx
[2026-05-06] [feat] RelicDetail.jsx now renders project.gitHistory (up to 10 commits, hash + message) in a scrollable git_history panel — field was fetched but not displayed → src/pages/RelicDetail.jsx
[2026-05-06] [fix] TerminalCard was swallowing onClick — component only destructured children/className/hover; added `...rest` spread so onClick (and all other props) forward to motion.div. Fixes unclickable Explore cards → src/components/TerminalCard.jsx
[2026-05-06] [fix] "unknown" fields in UI: Project title now populated from zip originalname during upload, status added to select() in /list route so StatusBadge renders correctly, and donorId/salvagerId ObjectId population mismatch fixed using String(p.donorId) → server/routes/projectRoutes.js, server/routes/pitchRoutes.js
[2026-05-06] [feat] Added `GET /api` root endpoint returning 200 OK so manual browser navigation to the API base URL doesn't show "Cannot GET" → server/index.js
[2026-05-06] [feat] Added custom Title and Description inputs to the Drop Project wizard. Project titles are no longer stuck as "unknown project" in the Dashboard. Also ran a one-off database script to fix legacy projects lacking titles to "Untitled Relic" → src/pages/DropProject.jsx, src/services/projects.js, server/routes/projectRoutes.js
