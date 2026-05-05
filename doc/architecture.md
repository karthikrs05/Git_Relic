# Architecture Overview

Git Relic is a full-stack web application with:

- A React + Vite frontend for UI, routing, animations, and auth UX.
- A Node.js + Express backend for authentication, JWT-protected APIs, and account state.
- A file-based JSON data store for local user persistence and per-user account records.

## High-Level Architecture

1. Client Layer (Frontend)
- Built with React.
- Routing via `react-router-dom`.
- Styling via Tailwind CSS.
- Motion and transitions via Framer Motion.
- Authentication state managed in `AuthContext`.

2. API Layer (Backend)
- Express server exposes `/api/*` endpoints.
- Auth routes handle register/login/profile and account bootstrap.
- JWT middleware protects private routes.

3. Data Layer
- Users stored in `server/data/users.json`.
- Account state stored in `server/data/accounts.json`.
- Passwords are hashed with bcrypt (`bcryptjs`) before storage.
- JWT tokens are signed and verified with `jsonwebtoken`.

## Frontend Structure

- `src/components`: Reusable UI and route guard components.
- `src/pages`: Route-level screens (`/landing`, `/explore`, `/auth`, `/dashboard`, `/drop_project`, `/leaderboard`).
- `src/layouts`: Shared app layout and shell.
- `src/hooks`: Reusable hooks (`useTypewriter`).
- `src/context`: Auth state provider (`AuthContext`).
- `src/services`: API communication (`auth.js`).
- `src/data`: Mock data for UI sections.

## Backend Structure

- `server/index.js`: Express app entry, middleware registration, route mounting.
- `server/routes/authRoutes.js`: Register/login/me endpoints.
- `server/middleware/authMiddleware.js`: JWT verification middleware.
- `server/data/users.json`: Local persistent user data.
- `server/data/accounts.json`: Local persistent account data returned after login.

## Backend Auth Implementation

### Auth Routes (`server/routes/authRoutes.js`)

Three core endpoints:

#### `POST /api/auth/register`
- Validates `username`, `email`, `password` (400 if missing)
- Checks for duplicate email (409 conflict)
- Hashes password via `bcrypt.hash(password, 10)`
- Creates user record with UUID, trimmed fields, ISO timestamp
- Auto-provisions account with stats and activity log
- Signs JWT and returns `{ token, user }` (201)

#### `POST /api/auth/login`
- Validates `email`, `password` (400 if missing)
- Finds user by normalized email (401 if not found)
- Compares password via `bcrypt.compare()` (401 if invalid)
- Updates `lastLoginAt` and logs login activity
- Signs JWT and returns `{ token, user }` (200)

#### `GET /api/auth/me` (Protected)
- Requires `Authorization: Bearer <token>`
- Returns current user with latest account state
- Returns 404 if user deleted, 401 if token invalid

### Account Management

- `createAccount()`: Initializes fresh account with default stats (`relicPoints`, `droppedProjects`, `salvagedProjects`, `activePitches`)
- `upsertAccountForUser()`: Creates or updates account on each login/registration, preserving existing stats and appending activity
- `publicUser()`: Strips sensitive fields (passwordHash) before returning user data

### JWT Configuration
- Payload: `{ id, email, username }`
- Expiry: `7d`
- Secret: `process.env.JWT_SECRET` or fallback `dev_jwt_secret_change_me`

## Security Model

- Passwords are never stored in plain text.
- Registration hashes passwords using bcrypt salt rounds.
- Login compares plaintext password to hash via bcrypt compare.
- JWT token required in `Authorization: Bearer <token>` for protected endpoints.
- Invalid or expired JWT returns HTTP 401.
- Logged-in responses include a server-owned account object with stats and activity.
