# Code Duplication & Consistency Report

## FINDINGS

### [DUPLICATE_DATA] Hardcoded API Base URL
**Files:** `src/services/auth.js`, `src/pages/RelicDetail.jsx`, `src/pages/Pitch.jsx`, `src/pages/Leaderboard.jsx`, `src/pages/Landing.jsx`, `src/pages/Explore.jsx`, `src/pages/DropProject.jsx`, `src/pages/Dashboard.jsx`
**Description:** The exact assignment `const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';` is hardcoded across 8 different frontend files.
**Risk:** HIGH
**Recommendation:** Extract this constant into a shared `src/config.js` or a central `api.js` client, and import it where needed.

### [DUPLICATE_SCHEMA] Unused Mongoose User Schema
**Files:** `server/models/User.js`, `server/routes/authRoutes.js`
**Description:** `server/models/User.js` defines a Mongoose schema for users, but the backend authentication (`authRoutes.js`) relies entirely on a flat-file JSON system (`users.json`). The `User.js` file is never imported, making its schema dead code.
**Risk:** HIGH
**Recommendation:** Either delete `server/models/User.js` to commit to the flat-file system, or migrate `authRoutes.js` to use the Mongoose `User` model.

### [INCONSISTENCY] API Call Architecture
**Files:** `src/services/auth.js`, `src/pages/*.jsx`
**Description:** Authentication API calls are neatly encapsulated in `src/services/auth.js`, while project and pitch API calls are scattered inline using raw `fetch()` directly inside React UI components. This leads to fragmented error handling and duplicated JSON parsing.
**Risk:** MED
**Recommendation:** Create `src/services/projects.js` and `src/services/pitches.js` to centralize and standardize all data fetching.

### [DUPLICATE_CODE] Manual User Stitching Logic
**Files:** `server/routes/projectRoutes.js`, `server/routes/pitchRoutes.js`
**Description:** The logic to fetch flat-file users (`await readUsers()`) and map their usernames onto MongoDB documents (`users.find(u => u.id === p.donorId)`) is repeated 6 times across various endpoints.
**Risk:** MED
**Recommendation:** Extract this population logic into a shared helper function `populateUsers(documents, userFields)` in a `userUtils.js` module.

### [INCONSISTENCY] User Reference Data Structures in Schemas
**Files:** `server/models/Project.js`, `server/models/Lineage.js`, `server/models/Pitch.js`
**Description:** `Project` and `Pitch` schemas reference users via flat string fields (`donorId`, `salvagerId`), but `Lineage` references them via nested objects (`donor: { userId: String, username: String }`). 
**Risk:** LOW
**Recommendation:** Standardize how user references (which are string UUIDs due to `users.json`) are stored across Mongoose models.

### [DUPLICATE_CODE] Express Error Handling Try/Catch
**Files:** `server/routes/authRoutes.js`, `server/routes/projectRoutes.js`, `server/routes/pitchRoutes.js`, `server/routes/lineageRoutes.js`
**Description:** Almost every single endpoint wraps its logic in a `try/catch` block returning `res.status(500).json({ message: 'Failed to ...' })`.
**Risk:** LOW
**Recommendation:** Implement a centralized async error handler middleware (`asyncHandler`) to catch and format errors consistently without repeating the boilerplate.

---

## SUMMARY

| Type              | Count | Highest Risk |
|-------------------|-------|--------------|
| DUPLICATE_CODE    | 2     | MED          |
| DUPLICATE_DATA    | 1     | HIGH         |
| DUPLICATE_ROUTE   | 0     | N/A          |
| DUPLICATE_SCHEMA  | 1     | HIGH         |
| DEAD_IMPORT       | 0     | N/A          |
| INCONSISTENCY     | 2     | MED          |
| **TOTAL**         | **6** | **HIGH**     |

---

## TOP 5 PRIORITY ITEMS

1. **[FIXED] [HIGH] Hardcoded API Base URL**: Poses an immediate risk to deployment scalability and maintainability if the API path needs to change.
2. **[FIXED] [HIGH] Unused Mongoose User Schema**: Having parallel source-of-truth architectures for users causes confusion for future development.
3. **[FIXED] [MED] API Call Architecture**: Normalizing frontend API calls into a unified service layer is critical as the application grows.
4. **[FIXED] [MED] Manual User Stitching Logic**: Extracting the `users.json` mapping logic will cut down on boilerplate in all future endpoints.
5. **[FIXED] [LOW] Inconsistent User References**: Standardizing schema fields will prevent bugs during user population mapping.
