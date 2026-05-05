# PROJECT_STATUS.md
GENERATED_AT: 2026-05-05T21:34:49+05:30
GENERATED_BY: agent
STATUS: CRITICAL

---

## 1. PENDING TASKS

- [ ] [HIGH] Implement Pitch API routes (CRUD) — model schema exists with no backend endpoints → `server/models/Pitch.js`
- [ ] [HIGH] Implement Lineage API routes — model schema exists with no backend endpoints → `server/models/Lineage.js`
- [ ] [HIGH] Implement salvage / ownership-transfer endpoint — `Project.status = 'salvaged'` is in the enum but no route sets it → `server/models/Project.js:22`, `server/routes/projectRoutes.js`
- [ ] [HIGH] Wire `DropProject.jsx` to the real upload API — page is a static multi-step wizard with no `fetch` call or form submission handler → `src/pages/DropProject.jsx`
- [ ] [HIGH] Wire `Pitch.jsx` submit button to API — `NeonButton` has no `onClick`, no API call, `optional_pr_link` input has no state binding → `src/pages/Pitch.jsx:27`
- [ ] [HIGH] Populate `.env.example` — file is completely empty; required vars (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`) are undocumented → `.env.example`
- [ ] [HIGH] Fix `require.resolve` call in ESM module — `require` is not defined in Node ESM context; entire upload/scan pipeline throws `ReferenceError` at runtime → `server/utils/securityScanner.js:9`
- [ ] [MED]  Add RBAC / admin guard to `GET /api/projects/status/pending-review` — any authenticated user can currently fetch all flagged projects → `server/routes/projectRoutes.js:320`
- [ ] [MED]  Replace `Explore.jsx` mock data with live API call to `GET /api/projects/list` — search input and filter checkboxes have no state or handlers → `src/pages/Explore.jsx:5,30`
- [ ] [MED]  Replace `Dashboard.jsx` mock data and hardcoded stats with live API calls — tab content renders only `"active tab: {tab}"` text, stats are static → `src/pages/Dashboard.jsx:4,35`
- [ ] [MED]  Replace `RelicDetail.jsx` mock data with real project data — commits, pitches, file tree, lineage tree, and language bars are all hardcoded → `src/pages/RelicDetail.jsx:4,15,19-21,30-37,44-49`
- [ ] [MED]  Replace `Landing.jsx` mock stats and relics with live API data → `src/pages/Landing.jsx:9`
- [ ] [MED]  Add `difficulty`, `estimatedHours`, and `analyzedAt` fields to `Project.aiAnalysis` subdocument in Mongoose schema — fields are returned by `aiAnalyzer.js` but not typed, causing silent data loss → `server/models/Project.js:29-33`
- [ ] [MED]  Make CORS origin configurable via env var — currently hardcoded to `http://localhost:5173` → `server/index.js:11`
- [ ] [LOW]  Fix `saveSecurityReport` hardcoded absolute path `/uploads/security` — platform-incompatible, dead code → `server/utils/securityScanner.js:67`
- [ ] [LOW]  Add `VITE_API_BASE_URL` to `.env.example` — referenced in `src/services/auth.js:1` but not documented
- [ ] [LOW]  Add `bio` field update endpoint — `User` schema has `bio` field, `GET /auth/me` returns it, but no `PATCH` route exists to set it → `server/routes/authRoutes.js`

---

## 2. KNOWN ERRORS & BUGS

- [BUG] `require.resolve('gitleaks/dist/gitleaks-linux-x64')` called inside ESM module → `server/utils/securityScanner.js:9`
  Severity: HIGH
  Status: UNRESOLVED
  Detail: `require` is undefined in Node ESM (`"type": "module"`). Any call to `POST /api/projects/upload` will throw `ReferenceError: require is not defined` and fail. The entire project ingest pipeline is broken at runtime.

- [BUG] Gitleaks binary path is Linux-only (`gitleaks-linux-x64`) — fails on Windows and macOS → `server/utils/securityScanner.js:9`
  Severity: HIGH
  Status: UNRESOLVED
  Detail: Even if `require` is patched, the binary name is OS-specific. Development environment is Windows (confirmed via `git log` shell output).

- [BUG] `Project.aiAnalysis` schema does not declare `difficulty`, `estimatedHours`, `analyzedAt` → `server/models/Project.js:29-33`
  Severity: MED
  Status: UNRESOLVED
  Detail: `analyzeProjectWithAI` returns these three fields. Mongoose silently drops undeclared fields when saving. The route response includes them (read from the returned object before save), but the data is never persisted to MongoDB.

- [BUG] `doc/architecture.md` states the data layer is `server/data/users.json` — factually incorrect → `doc/architecture.md:7,24-25`
  Severity: LOW
  Status: UNRESOLVED
  Detail: The actual implementation uses MongoDB + Mongoose. `users.json` is empty (`[]`) and is never read or written by any code.

---

## 3. INCOMPLETE IMPLEMENTATIONS

- [STUB] `DropProject` wizard UI → `src/pages/DropProject.jsx`
  Missing: File `<input>` has no `onChange` handler, no state for selected file, no API call to `POST /api/projects/upload`. The "next_step" button only increments a local counter — no real upload or scan occurs.

- [STUB] `Pitch` submission form → `src/pages/Pitch.jsx`
  Missing: `NeonButton` (submit_pitch) has no `onClick`. `MonospaceInput` for PR link has no `value` / `onChange` state. No API call to any pitch endpoint. `shr_reputation_preview: 1260` is a hardcoded literal (line 23).

- [STUB] `Explore` search and filter → `src/pages/Explore.jsx`
  Missing: Search `MonospaceInput` has no state or handler (line 30). Tech-stack and status checkboxes have no `onChange` handlers (lines 17, 23). Data comes from `mockData` not the API.

- [STUB] `Dashboard` tab content → `src/pages/Dashboard.jsx`
  Missing: All three tabs ("dropped relics", "salvaged relics", "pitch tracker") render identical placeholder text `"active tab: {tab}"` (line 35). Stats are hardcoded literals (lines 7-11). Activity feed is from `mockData.logs`.

- [STUB] `RelicDetail` page → `src/pages/RelicDetail.jsx`
  Missing: Commit activity graph (72 divs) is decorative (line 15). Language distribution bars are hardcoded percentages (lines 19-21). File tree is a hardcoded string literal (lines 30-37). Lineage tree is hardcoded text (lines 44-49). Commits list from `mockData.commits`, pitches from `mockData.pitches`. No `projectId` is read from route params — page cannot display real project data.

- [STUB] `saveSecurityReport` function → `server/utils/securityScanner.js:65`
  Missing: Never called anywhere in the codebase. Uses a hardcoded absolute path (`/uploads/security`) incompatible with Windows.

- [STUB] Pitch API (backend) → `server/models/Pitch.js`
  Missing: No routes file. No CRUD endpoints. `Pitch.jsx` frontend form has nowhere to submit to.

- [STUB] Lineage API (backend) → `server/models/Lineage.js`
  Missing: No routes file. `RelicDetail.jsx` lineage_tree is purely hardcoded — no real lineage data is ever created or fetched.

- [STUB] Salvage / ownership transfer flow → `server/routes/projectRoutes.js`
  Missing: No endpoint to transfer `currentOwner`, no endpoint to set `status = 'salvaged'`, no endpoint to create a `Lineage` record on transfer.

---

## 4. DEPRECATED / DEAD CODE

- [DEPRECATED] `src/data/mockData.js` → `src/data/mockData.js`
  Reason: Placeholder fixture data used by Landing, Explore, Dashboard, RelicDetail instead of live API. All five consumers should be replaced with API calls.
  Safe to remove: UNSURE (removing before API wiring breaks UI)

- [DEPRECATED] `server/data/users.json` → `server/data/users.json`
  Reason: Empty array (`[]`). No code reads or writes this file. MongoDB/Mongoose is the actual data store.
  Safe to remove: YES

- [DEPRECATED] `saveSecurityReport()` → `server/utils/securityScanner.js:65-75`
  Reason: Exported but never imported or called anywhere in the project. Uses hardcoded absolute path.
  Safe to remove: YES

- [DEPRECATED] `GET /api/protected/relics` → `server/index.js:21-23`
  Reason: Hardcoded stub returning `['private-relic-1', 'private-relic-2']`. No real use case. Leftover from initial auth testing.
  Safe to remove: YES

---

## 5. MISSING DEPENDENCIES OR CONFIG

- [MISSING] `MONGODB_URI` → referenced in `server/config/db.js:5`
  Type: ENV_VAR
  Detail: Falls back to `mongodb://localhost:27017/git-relic`. Not documented in `.env.example`.

- [MISSING] `JWT_SECRET` → referenced in `server/middleware/authMiddleware.js:11`, `server/routes/authRoutes.js:12`
  Type: ENV_VAR
  Detail: Falls back to hardcoded literal `'dev_jwt_secret_change_me'`. Not documented in `.env.example`. Fallback string is in source code — security risk.

- [MISSING] `GEMINI_API_KEY` → referenced in `server/utils/aiAnalyzer.js:5`
  Type: ENV_VAR
  Detail: Falls back to empty string `''`. Gemini SDK will throw on any AI analysis call. Not documented in `.env.example`.

- [MISSING] `VITE_API_BASE_URL` → referenced in `src/services/auth.js:1`
  Type: ENV_VAR
  Detail: Falls back to `http://localhost:8787/api`. Not documented in `.env.example`. No `.env` Vite file present in repo.

- [MISSING] `PORT` → referenced in `server/index.js:9`
  Type: ENV_VAR
  Detail: Falls back to `8787`. Not documented in `.env.example`.

- [MISSING] `.env` file → required by `server/index.js` (uses `dotenv`)
  Type: FILE
  Detail: `dotenv` is listed as a dependency but there is no `dotenv` import in `server/index.js`. Env vars must be set manually before starting the server.

- [MISSING] `temp/` directory → created at module load in `server/utils/fileExtractor.js:15`
  Type: FILE
  Detail: Created via top-level `await fs.mkdir(..., { recursive: true })` on import. Not in `.gitignore` entry (`.gitignore` has `uploads/` but not `temp/`).

- [MISSING] Test framework → no test runner configured
  Type: CONFIG_KEY
  Detail: `package.json` has no `test` script. Running `npm test` fails with `Missing script: "test"`. No `jest`, `vitest`, or `mocha` listed in dependencies.

---

## 6. TEST COVERAGE GAPS

- [NO_TESTS] Entire project — no test files exist anywhere in the repository
  Detail: `npm test` exits with code 1 (`Missing script: "test"`). No test runner, no test files, no coverage config.

- [NO_TESTS] Auth routes (register, login, /me) → `server/routes/authRoutes.js`
- [NO_TESTS] Project upload pipeline (extract → scan → AI → publish) → `server/routes/projectRoutes.js`
- [NO_TESTS] Security scanner (gitleaks integration) → `server/utils/securityScanner.js`
- [NO_TESTS] AI analyzer (Gemini integration, JSON parse fallback) → `server/utils/aiAnalyzer.js`
- [NO_TESTS] Git parser → `server/utils/gitParser.js`
- [NO_TESTS] File extractor / ZIP validation → `server/utils/fileExtractor.js`
- [NO_TESTS] Auth context (login, logout, token persistence) → `src/context/AuthContext.jsx`
- [NO_TESTS] ProtectedRoute guard behavior → `src/components/ProtectedRoute.jsx`
- [NO_TESTS] All frontend pages (8 pages, 0 tests) → `src/pages/`

---

## 7. AGENT NOTES

- `doc/architecture.md:7` claims data is stored in `server/data/users.json` — this is factually wrong. MongoDB + Mongoose is used. The architecture doc was never updated after the MongoDB migration. → `doc/architecture.md`

- `server/index.js` imports `dotenv` as a dependency but never calls `dotenv.config()`. Env vars will NOT be loaded from a `.env` file automatically when starting the server. → `server/index.js`

- `src/pages/RelicDetail.jsx` accepts no route params (`useParams` is not imported). The page has no way to know which project it is displaying — it will always show hardcoded mock data regardless of navigation. → `src/pages/RelicDetail.jsx`

- `src/pages/Explore.jsx` filter checkboxes use status labels `['orphaned', 'auctioning', 'salvaged', 'revived']` which do not match the actual `Project.status` enum values `['pending_scan', 'scanned', 'pending_review', 'published', 'salvaged', 'failed']`. → `src/pages/Explore.jsx:23`, `server/models/Project.js:22`

- `server/utils/securityScanner.js:46-49` — the `catch` block of `scanWithGitleaks` always returns `passed: false` on any error (including the `ReferenceError` from `require.resolve`). This means all uploads silently fail the security scan and get status `pending_review` rather than throwing a clear error. → `server/utils/securityScanner.js:40-50`

- `server/routes/authRoutes.js:12` — fallback JWT secret `'dev_jwt_secret_change_me'` is a literal string committed to the repository. Tokens signed with this secret in development are cryptographically predictable if the secret leaks. → `server/routes/authRoutes.js:12`

- [UNSURE] `server/data/users.json` is committed to git as an empty array. If MongoDB is the real store, this file should be deleted. If it was intended as a seed file, the seeding logic is missing entirely. → `server/data/users.json`

- [UNSURE] `src/pages/Auth.jsx` references `confirmPassword` state, but the password confirmation is validated client-side only (no check visible in the scanned source). Confirm whether server-side validation exists or if mismatched passwords can be submitted. → `src/pages/Auth.jsx:95`

- [UNSURE] `server/routes/projectRoutes.js:320` route `GET /status/pending-review` is defined AFTER `GET /:projectId` (line 276). Express will try to match the string `"status"` as a `projectId` first. This route may be unreachable in practice due to route ordering. → `server/routes/projectRoutes.js:276,320`

- `uploads/projects/<uuid>/` directories (extracted project files) are never deleted after a successful publish. Disk usage will grow unboundedly. Only the temp zip is cleaned up. → `server/routes/projectRoutes.js:130-131`

- `server/utils/fileExtractor.js` uses top-level `await` at module scope (lines 14-15) to create directories. This runs on every server start and on every import of the module. This is valid ESM but means any import of this utility before the file system is ready will fail silently. → `server/utils/fileExtractor.js:14-15`
