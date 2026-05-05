# Architecture Overview

Git Relic is a full-stack web application that salvages abandoned open-source projects.

- **Frontend** — React + Vite, Tailwind CSS, Framer Motion
- **Backend** — Node.js + Express (ESM), two data layers (see below)
- **Primary DB** — MongoDB + Mongoose (projects, pitches, lineage)
- **Auth store** — Flat-file JSON (users, accounts) — see note below

---

## High-Level Architecture

```
Browser (React/Vite)
  │  VITE_API_BASE_URL
  ▼
Express API (port 8787)
  ├── /api/auth      → file-based JSON (users.json, accounts.json)
  ├── /api/projects  → MongoDB: Project model
  ├── /api/pitches   → MongoDB: Pitch model
  └── /api/lineage   → MongoDB: Lineage model
         ▼
    MongoDB (MONGODB_URI)
```

### ⚠️ Data Layer Split
Auth routes (`authRoutes.js`) use `server/data/users.json` and `server/data/accounts.json` for persistence — **not** MongoDB. The `User` Mongoose model exists at `server/models/User.js` but is currently unused. All other models (Project, Pitch, Lineage) use MongoDB.

This split is a known architectural inconsistency and is a candidate for future consolidation.

---

## Frontend Structure

| Path | Purpose |
|------|---------|
| `src/pages/` | Route-level screens |
| `src/components/` | Reusable UI + route guards |
| `src/layouts/` | Shared app shell (`AppLayout`) |
| `src/context/` | Auth state (`AuthContext`) |
| `src/hooks/` | Reusable hooks (`useTypewriter`) |
| `src/data/mockData.js` | Decorative data (landing page log feed only) |

### Pages & Routes

| Route | Page | Auth |
|-------|------|------|
| `/landing` | `Landing.jsx` | Public |
| `/auth` | `Auth.jsx` | Public |
| `/explore` | `Explore.jsx` | Protected |
| `/relic_detail/:projectId` | `RelicDetail.jsx` | Protected |
| `/drop_project` | `DropProject.jsx` | Protected |
| `/pitch` | `Pitch.jsx` | Protected |
| `/dashboard` | `Dashboard.jsx` | Protected |
| `/leaderboard` | `Leaderboard.jsx` | Protected |

---

## Backend Structure

```
server/
├── index.js              — entry: CORS, middleware, route mounting, DB connect
├── config/db.js          — MongoDB connection via Mongoose
├── middleware/
│   └── authMiddleware.js — JWT verification
├── routes/
│   ├── authRoutes.js     — register, login, me, PATCH /me (file-based)
│   ├── projectRoutes.js  — upload, analyze, list, get, scan, pending-review
│   ├── pitchRoutes.js    — submit, list by project, user pitches, accept/reject
│   └── lineageRoutes.js  — get lineage chain for a project
├── models/
│   ├── Project.js        — Mongoose schema (status, aiAnalysis, securityScan…)
│   ├── Pitch.js          — Mongoose schema (pitchText, prLink, status…)
│   ├── Lineage.js        — Mongoose schema (donor, salvager, generationNumber…)
│   └── User.js           — Mongoose schema (UNUSED — auth uses flat files)
├── utils/
│   ├── securityScanner.js — gitleaks wrapper (cross-platform binary detection)
│   └── aiAnalyzer.js      — Gemini AI analysis
└── data/
    ├── users.json         — runtime auth store (gitignored)
    └── accounts.json      — runtime account store (gitignored)
```

---

## Key API Endpoints

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Sign in, get JWT |
| GET | `/me` | ✓ | Current user profile |
| PATCH | `/me` | ✓ | Update bio |

### Projects (`/api/projects`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/upload` | ✓ | Upload ZIP, scan, analyze |
| POST | `/:id/analyze` | ✓ | Re-run AI analysis |
| GET | `/list` | — | All published projects |
| GET | `/user/:userId` | ✓ | Projects by user |
| GET | `/status/pending-review` | Admin | Admin queue |
| GET | `/:id` | — | Single project |
| GET | `/:id/analysis` | — | AI analysis result |
| GET | `/:id/security` | ✓ | Security scan result |

### Pitches (`/api/pitches`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | ✓ | Submit a pitch |
| GET | `/project/:id` | — | Pitches for a project |
| GET | `/user/my` | ✓ | Current user's pitches |
| GET | `/:id` | — | Single pitch |
| PATCH | `/:id/respond` | ✓ | Accept/reject (donor only); accept triggers salvage |

### Lineage (`/api/lineage`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/project/:id` | — | Ownership chain for a project |
| GET | `/:id` | — | Single lineage record |

---

## Security Model

- Passwords hashed with bcrypt (10 rounds) before storage
- JWT payload: `{ id, email, username }`, expiry 7 days
- JWT secret from `JWT_SECRET` env var (startup warning if missing)
- Admin endpoints gated by `ADMIN_EMAILS` env var (comma-separated list)
- Security scanning via gitleaks (cross-platform binary detection)
- Projects blocked from publish if secrets detected in scan

---

## Environment Variables

See `.env.example` for the full list. Required vars:

| Variable | Used by |
|----------|--------|
| `MONGODB_URI` | Database connection |
| `JWT_SECRET` | Token signing/verification |
| `GEMINI_API_KEY` | AI project analysis |
| `VITE_API_BASE_URL` | Frontend API base URL |
| `PORT` | Server port (default 8787) |
| `CORS_ORIGIN` | Allowed origin (default localhost:5173) |
| `ADMIN_EMAILS` | Comma-separated admin email addresses |
