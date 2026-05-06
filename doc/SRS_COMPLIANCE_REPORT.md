# SRS Compliance Audit Report

## Audit Summary
This report evaluates the current codebase of **Git Relic** against the Software Requirements Specification (SRS).

| Requirement              | Status | Notes |
|--------------------------|--------|-------|
| FR1 WebSockets           | ❌ MISSING | No WebSocket library or server/client logic found. |
| FR2 Graveyard Filter     | ⚠️ PARTIAL | Frontend has tech stack filters (local), but backend `GET /api/projects/list` ignores query params. |
| FR3 Git Graph            | ❌ MISSING | No graph library installed; `RelicDetail.jsx` lacks a visual graph. |
| FR4 Dev Heatmaps         | ❌ MISSING | `gitParser.js` does not calculate frequency; no heatmap storage or UI. |
| FR5 Project Autopsy      | ✅ IMPLEMENTED | Gemini AI analyzer generates summaries and failure reasons; displayed in UI. |
| FR6 Lineage Schema       | 🔄 DEVIATED | `Lineage` model exists with different fields; records created on transfer but not displayed visually. |
| State Machine            | 🔄 DEVIATED | Uses custom states (`pending_scan`, `published`, etc.) instead of SRS-mandated `ORPHANED` flow. |
| Sanitize Middleware      | ❌ MISSING | No logic to delete `.env` or `node_modules` during extraction. |
| Gitleaks                 | ✅ IMPLEMENTED | `securityScanner.js` runs gitleaks and blocks publishing if secrets are found. |
| File Size Limit          | 🔄 DEVIATED | Multer limit is set to 500MB; SRS requires 50MB. |
| Transaction Integrity    | ❌ MISSING | No MongoDB transactions or rollback logic in ownership transfer. |
| Supabase Storage         | 🔄 DEVIATED | Using MongoDB + local uploads/ directory as a temporary substitute. Supabase integration is pending. |
| Heritage Badge           | ❌ MISSING | `User` schema lacks badge fields; no award logic. |
| Reputation Points        | ⚠️ PARTIAL | Calculated dynamically for leaderboard but not stored in `UserAccount`. |
| Vision Statement Limit   | ❌ MISSING | No character count enforcement (100-200) on pitches. |

## Detailed Findings

### FR1 — Live Feed via WebSockets
- **Library Check:** No `socket.io` or `ws` in `package.json`.
- **Server Check:** `server/index.js` is standard REST only.
- **Client Check:** No socket connections in frontend services or components.

### FR2 — Graveyard / Filter View
- **Frontend:** `Explore.jsx` uses local `.filter()` on the `projects` state.
- **Backend:** `projectRoutes.js` list endpoint does not filter by `techStack`, `minCommits`, or `status`.
- **Schema:** `Project` model includes `techStack` and `commitCount`.

### FR3 & FR4 — Git Visualization
- **Graph:** No visual history representation.
- **Heatmaps:** `gitParser.js` is missing frequency-by-date logic.

### FR5 — Project Autopsy (AI Summary)
- **Analyzer:** `server/utils/aiAnalyzer.js` successfully prompts Gemini with README content.
- **UI:** Integration in `RelicDetail.jsx` is complete.

### FR6 — Lineage Schema
- **Deviation:** Model uses `donorId`/`salvagerId` instead of `transferred_by`.
- **Missing:** Visual lineage tree in the detail view.

### Project Lifecycle States
- **Deviation:** Current states: `pending_scan`, `scanned`, `pending_review`, `published`, `salvaged`, `failed`.
- **Required:** `ORPHANED` → `AUCTIONING` → `ADOPTED` → `RESURRECTED`.

### Security Requirements
- **Sanitize:** ZIP extraction preserves all files.
- **Gitleaks:** Correctly implemented with `gitleaks detect` and status-based blocking.
- **Size Limit:** Over-provisioned (500MB vs 50MB).

### Non-Functional Requirements
- **Transactions:** Multiple document updates in `pitchRoutes.js` are not wrapped in a session.
- **Storage:** Fully local implementation using `multer`.

### User Features
- **Reputation:** The leaderboard calculates `reputation` on the fly, but it doesn't persist to the DB.
- **Pitches:** `pitchText` has no length validation in `Pitch.jsx` or `Pitch` schema.

---

## Final Tally
- **FULLY IMPLEMENTED :** 2 / 15
- **PARTIAL           :** 2 / 15
- **MISSING           :** 7 / 15
- **DEVIATED          :** 4 / 15

---

## PRIORITY GAP LIST
1. **Security - Sanitize Middleware:** Sensitive files (.env) are currently stored on the server after extraction.
2. **Data Integrity - Transaction Support:** Critical for the ownership transfer process to prevent "Ghost Projects".
3. **Core Logic - State Machine Alignment:** The system needs to pivot to the SRS-defined lifecycle for correct business flow.
4. **Interactive Features - WebSockets:** Real-time updates for pitches/bids are a core requirement for a "live feed".
5. **Project Forensics - Git Graph/Heatmaps:** Missing the primary data visualization that defines the "Forensics" aspect of the app.
