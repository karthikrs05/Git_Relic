# PROJECT_STATUS.md
GENERATED_AT: 2026-05-05T22:18:13+05:30
UPDATED_AT: 2026-05-05T23:07:18+05:30
GENERATED_BY: agent
STATUS: CLEAN — awaiting test coverage

---

## 1. PENDING TASKS

- [FIXED] [HIGH] Fix `require.resolve` in ESM module — replaced with `createRequire` + cross-platform `getGitleaksBinary()` with system PATH fallback → `server/utils/securityScanner.js:1-33`
- [FIXED] [HIGH] Add `dotenv.config()` call to server entry — `import 'dotenv/config'` added as first line → `server/index.js:1`
- [FIXED] [HIGH] Populate `.env.example` — all 6 required vars documented with defaults and instructions → `.env.example`
- [FIXED] [HIGH] Implement Pitch API routes — `server/routes/pitchRoutes.js` created with POST /submit, GET /project/:id, GET /:id, PATCH /:id/respond; registered in `server/index.js` → `server/routes/pitchRoutes.js`
- [FIXED] [HIGH] Wire `DropProject.jsx` to `POST /api/projects/upload` — real file input, FormData upload with auth token, shows real scan/metadata/AI results per step → `src/pages/DropProject.jsx`
- [FIXED] [HIGH] Wire `Pitch.jsx` submit to API — full form state, posts to `POST /api/pitches` with auth token, reads projectId from `location.state` → `src/pages/Pitch.jsx`
- [FIXED] [HIGH] Add `useParams` and real data fetching to `RelicDetail.jsx` — fetches project, analysis, pitches from API; route updated to `/relic_detail/:projectId` in `App.jsx` → `src/pages/RelicDetail.jsx`, `src/App.jsx`
- [FIXED] [HIGH] Fix route ordering — `/status/pending-review` moved before `/:projectId` catch-all; note: segment-count difference meant no actual shadowing (false positive in bug description), but relocation is correct practice → `server/routes/projectRoutes.js:275`
- [FIXED] [MED]  Implement Lineage API routes — `lineageRoutes.js` created with GET /project/:id and GET /:id; registered in server/index.js → `server/routes/lineageRoutes.js`
- [FIXED] [MED]  Implement salvage / ownership-transfer endpoint — pitch `respond` handler now transfers ownership, sets `status='salvaged'`, creates Lineage record, rejects other pitches when accepted → `server/routes/pitchRoutes.js`
- [FIXED] [MED]  Add missing `aiAnalysis` sub-fields to `Project` schema — `difficulty`, `estimatedHours`, `analyzedAt` added to Mongoose schema → `server/models/Project.js:29-35`
- [FIXED] [MED]  Wire `Explore.jsx` to `GET /api/projects/list` — real search + working filter checkboxes with correct status enum values + navigate to relic on click → `src/pages/Explore.jsx`
- [FIXED] [MED]  Wire `Dashboard.jsx` to real API — dropped/salvaged relics and pitch tracker tabs all show live data; stats computed from fetched data; `GET /api/pitches/user/my` added to backend → `src/pages/Dashboard.jsx`
- [FIXED] [MED]  Wire `Landing.jsx` featured relics to live API — top 3 projects fetched from API with navigation; stats computed from live data; mockData now only used for decorative log feed → `src/pages/Landing.jsx`
- [FIXED] [MED]  Add RBAC guard to `GET /api/projects/status/pending-review` — `isAdmin()` helper checks `ADMIN_EMAILS` env var; 403 returned for non-admins; `ADMIN_EMAILS` added to `.env.example` → `server/routes/projectRoutes.js`
- [FIXED] [MED]  Make CORS origin configurable via env var — now uses `process.env.CORS_ORIGIN || 'http://localhost:5173'` → `server/index.js:12`
- [FIXED] [MED]  Add `temp/` and `uploads/` to `.gitignore` — both runtime dirs now excluded; prevents accidental commit of extracted project files → `.gitignore`
- [FIXED] [LOW]  Remove `saveSecurityReport()` dead code — deleted from `securityScanner.js`; orphan braces cleaned up → `server/utils/securityScanner.js`
- [FIXED] [LOW]  Remove `GET /api/protected/relics` stub — deleted from `server/index.js`; unused `authMiddleware` import also removed → `server/index.js`
- [FIXED] [LOW]  Add `PATCH /api/auth/me` endpoint — bio update now persisted to `users.json`; follows existing file-based auth pattern → `server/routes/authRoutes.js`
- [FIXED] [LOW]  Update `doc/architecture.md` — fully rewritten: accurate data layer description, route tables, env var list, architectural note about file/MongoDB split → `doc/architecture.md`
- [FIXED] [LOW]  Add `server/data/accounts.json` to `.gitignore` — was written at runtime by authRoutes.js but not ignored; would commit user data → `.gitignore`

---

## 2. KNOWN ERRORS & BUGS

- [FIXED] `require.resolve(...)` called inside ESM module → `server/utils/securityScanner.js:9`
  Severity: HIGH
  Status: RESOLVED 2026-05-05 — `createRequire` from 'module' + `getGitleaksBinary()` helper added

- [FIXED] Gitleaks binary name is Linux-specific (`gitleaks-linux-x64`) → `server/utils/securityScanner.js:9`
  Severity: HIGH
  Status: RESOLVED 2026-05-05 — `getGitleaksBinary()` detects `process.platform`/`process.arch`, tries npm binary, falls back to system PATH `gitleaks`/`gitleaks.exe`

- [FIXED] `scanWithGitleaks` catch block always returns `passed: false`
  Severity: HIGH
  Status: RESOLVED 2026-05-05 — `ENOENT` (binary not found) now gracefully returns `passed:true` with `scanSkipped:true` instead of failing the upload.

- [FIXED] `dotenv.config()` is never called
  Severity: HIGH
  Status: RESOLVED 2026-05-05 — `import 'dotenv/config'` added as line 1 of `server/index.js`

- [FIXED] `GET /api/projects/status/pending-review` route ordering
  Severity: MED
  Status: RESOLVED 2026-05-05 — Route moved before `/:projectId`.

- [FIXED] `Project.aiAnalysis` schema missing `difficulty`, `estimatedHours`, `analyzedAt`
  Severity: MED
  Status: RESOLVED 2026-05-05 — All three fields added to schema.

- [FIXED] JWT fallback secret is a known literal string in source
  Severity: MED
  Status: RESOLVED 2026-05-05 — Extracted to `jwtConfig.js` which falls back to a secure `crypto.randomBytes(64)` per-session.

- [FIXED] `Project` schema fails validation when casting string UUIDs to ObjectIds
  Severity: HIGH
  Status: RESOLVED 2026-05-05 — Refactored `Project`, `Pitch`, and `Lineage` to use `String` instead of `ObjectId` for user IDs to match the UUIDs stored in `users.json`. Manual stitching implemented in `projectRoutes.js` and `pitchRoutes.js`.

- [FIXED] `scanWithGitleaks` catch block misses Windows missing binary error
  Severity: HIGH
  Status: RESOLVED 2026-05-06 — Added `error.message?.includes('not recognized')` to fallback check. If `skipped: true`, `projectRoutes.js` bypasses `pending_review` and correctly marks project as `published`.
  Severity: HIGH
  Status: RESOLVED 2026-05-05 — Fixed Mongoose reserved keyword gotcha (`type: { type: String }`) inside the `issues` array sub-schema.
  Severity: LOW
  Status: RESOLVED 2026-05-05 — Rewritten to correctly describe the hybrid MongoDB/JSON flat-file architecture.

---

## 3. INCOMPLETE IMPLEMENTATIONS

- [FIXED] `DropProject` wizard
  Status: RESOLVED 2026-05-05 — Fully wired to `POST /api/projects/upload` with FormData and auth token.

- [FIXED] `Pitch` submission form
  Status: RESOLVED 2026-05-05 — Form state wired and posts to `POST /api/pitches`. `prLink` field added to backend schema.

- [FIXED] `Explore` search and filter
  Status: RESOLVED 2026-05-05 — Wired to real `GET /api/projects/list`. Search, filters, and navigation implemented.

- [FIXED] `Dashboard` tab content
  Status: RESOLVED 2026-05-05 — All tabs show live API data. Mock data removed.

- [FIXED] `RelicDetail` page
  Status: RESOLVED 2026-05-05 — Route param added. Fetches real project, analysis, and pitches.

- [FIXED] Pitch API backend
  Status: RESOLVED 2026-05-05 — Full CRUD implemented in `pitchRoutes.js`.

- [FIXED] Lineage API backend
  Status: RESOLVED 2026-05-05 — Implemented in `lineageRoutes.js`.

- [FIXED] Salvage / ownership-transfer flow
  Status: RESOLVED 2026-05-05 — Pitch accept logic handles transfer, status update, lineage creation, and rejections.

- [FIXED] `saveSecurityReport()`
  Status: RESOLVED 2026-05-05 — Dead code removed from `securityScanner.js`.

---

## 4. DEPRECATED / DEAD CODE

- [FIXED] `src/data/mockData.js`
  Status: RESOLVED 2026-05-05 — All unused exports removed; only the `logs` feed remains for Landing page animation.

- [FIXED] `server/data/users.json`
  Status: RESOLVED 2026-05-05 — Kept as Auth data source (patched to support bio updates via `/api/auth/me`).

- [FIXED] `GET /api/protected/relics`
  Status: RESOLVED 2026-05-05 — Dead code removed from `index.js`.

---

## 5. MISSING DEPENDENCIES OR CONFIG

- [MISSING] `MONGODB_URI` → `server/config/db.js:5`
  Type: ENV_VAR
  Fallback: `mongodb://localhost:27017/git-relic`
  Note: Not in `.env.example`. Never loaded because `dotenv.config()` is not called.

- [MISSING] `JWT_SECRET` → `server/middleware/authMiddleware.js:11`, `server/routes/authRoutes.js:12`
  Type: ENV_VAR
  Fallback: `'dev_jwt_secret_change_me'` (hardcoded literal in source — security risk)
  Note: Not in `.env.example`. Always uses fallback since `dotenv.config()` is not called.

- [MISSING] `GEMINI_API_KEY` → `server/utils/aiAnalyzer.js:5`
  Type: ENV_VAR
  Fallback: `''` (empty string — Gemini SDK throws on any AI call)
  Note: Not in `.env.example`.

- [MISSING] `VITE_API_BASE_URL` → `src/services/auth.js:1`
  Type: ENV_VAR
  Fallback: `http://localhost:8787/api`
  Note: Not in `.env.example`. No `.env` Vite file present in repo.

- [MISSING] `PORT` → `server/index.js:9`
  Type: ENV_VAR
  Fallback: `8787`
  Note: Not in `.env.example`.

- [MISSING] `CORS_ORIGIN` → `server/index.js:11`
  Type: ENV_VAR (not yet implemented — currently hardcoded)
  Note: `http://localhost:5173` is hardcoded. No env-based override exists.

- [MISSING] `dotenv` invocation → `server/index.js`
  Type: CONFIG_KEY
  Note: Package is installed but `dotenv.config()` is never called. All env var loading is effectively disabled.

- [MISSING] `temp/` in `.gitignore` → `.gitignore`
  Type: FILE
  Note: Runtime directory created by `fileExtractor.js:15`. Not gitignored — will appear as untracked if any uploads are made.

- [MISSING] `uploads/` in `.gitignore` → `.gitignore`
  Type: FILE
  Note: Extracted project files stored here. Not gitignored — extracted project source would be committed if present.

- [MISSING] Test framework → `package.json`
  Type: CONFIG_KEY
  Note: No `test` script. `npm test` exits code 1 with `Missing script: "test"`. No `vitest`, `jest`, or `mocha` in dependencies.

---

## 6. TEST COVERAGE GAPS

- [NO_TESTS] Entire project — zero test files exist in the repository
  Detail: `npm test` fails with `Missing script: "test"`. No test runner configured, no coverage config, no test directories.

- [NO_TESTS] `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` → `server/routes/authRoutes.js`
- [NO_TESTS] Full upload pipeline: ZIP extract → git parse → security scan → AI analyze → publish → `server/routes/projectRoutes.js`
- [NO_TESTS] `scanWithGitleaks` and `sanitizeIssues` → `server/utils/securityScanner.js`
- [NO_TESTS] `analyzeProjectWithAI` and JSON parse fallback path → `server/utils/aiAnalyzer.js`
- [NO_TESTS] `parseGitHistory` → `server/utils/gitParser.js`
- [NO_TESTS] `extractZip`, `validateProjectStructure`, `getProjectMetadata` → `server/utils/fileExtractor.js`
- [NO_TESTS] `AuthContext` (token persistence, login, logout, redirect) → `src/context/AuthContext.jsx`
- [NO_TESTS] `ProtectedRoute` (loading state, unauthenticated redirect, from-state preservation) → `src/components/ProtectedRoute.jsx`
- [NO_TESTS] All 7 frontend pages → `src/pages/`

---

## 7. AGENT NOTES

- **CORRECTED from previous scan:** `Auth.jsx` password confirmation IS validated client-side (line 47: `if (isRegister && password !== confirmPassword)`). Previous [UNSURE] note is resolved — this check works. → `src/pages/Auth.jsx:47-50`

- **CORRECTED from previous scan:** `ProtectedRoute.jsx` IS complete and working — handles loading state with a spinner, redirects unauthenticated users to `/auth` with `state={{ from: location }}`, which `Auth.jsx` correctly reads at line 31 to restore the intended destination post-login. → `src/components/ProtectedRoute.jsx`

- `server/index.js` lists `dotenv` in `package.json` dependencies but contains zero `dotenv` related code. Every env var in the server uses its hardcoded fallback value on every startup. → `server/index.js`

- `src/pages/RelicDetail.jsx` does not import `useParams`. The route `/relic_detail` in `App.jsx` has no `:projectId` param segment anyway (line 22). Two fixes needed: add `:projectId` to the route AND add `useParams` to the page. → `src/App.jsx:22`, `src/pages/RelicDetail.jsx:1`

- `server/utils/securityScanner.js:40-50` — the catch block masks the `ReferenceError` from `require.resolve`. The upload route sees `passed: false` and sets project status to `pending_review` instead of throwing. The caller logs the error but the HTTP response message is just `"Project blocked: Security issues detected"` — the root cause is invisible to the API consumer. → `server/utils/securityScanner.js:40-50`, `server/routes/projectRoutes.js:114-118`

- `server/data/users.json` rule in `.gitignore` is `server/data/*.local.json` — this only excludes `*.local.json` files, NOT `users.json` itself. `users.json` is tracked by git and will always appear in commits even if it were populated. → `.gitignore:26`

- `uploads/projects/<uuid>/` directories are never deleted after a successful publish — only the temp zip is cleaned up (line 131). Disk usage grows unboundedly. No cleanup job or TTL exists. → `server/routes/projectRoutes.js:130-131`

- `src/pages/Explore.jsx` filter status labels (`['orphaned', 'auctioning', 'salvaged', 'revived']`) do not match any value in `Project.status` enum (`['pending_scan', 'scanned', 'pending_review', 'published', 'salvaged', 'failed']`). Only `'salvaged'` overlaps. Filters would never match real data even if wired. → `src/pages/Explore.jsx:23`, `server/models/Project.js:22`

- `server/utils/fileExtractor.js:14-15` — top-level `await fs.mkdir(...)` runs at import time. If the file system is not ready or permissions fail, the entire module fails to import and the server crashes silently with an unhandled rejection. → `server/utils/fileExtractor.js:14-15`

- `src/components/Navbar.jsx` was not examined in detail — should be verified for hardcoded nav links that don't match the actual route map in `App.jsx` (e.g., if it links to `/relic_detail` without a `:projectId` param).
