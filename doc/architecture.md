# Architecture Overview

Git Relic is a full-stack web application with:

- A React + Vite frontend for UI, routing, animations, and auth UX.
- A Node.js + Express backend for authentication and JWT-protected APIs.
- A file-based JSON data store for local user persistence.

## High-Level Architecture

1. Client Layer (Frontend)
- Built with React.
- Routing via `react-router-dom`.
- Styling via Tailwind CSS.
- Motion and transitions via Framer Motion.
- Authentication state managed in `AuthContext`.

2. API Layer (Backend)
- Express server exposes `/api/*` endpoints.
- Auth routes handle register/login/profile.
- JWT middleware protects private routes.

3. Data Layer
- Users stored in `server/data/users.json`.
- Passwords are hashed with bcrypt (`bcryptjs`) before storage.
- JWT tokens are signed and verified with `jsonwebtoken`.

## Frontend Structure

- `src/components`: Reusable UI and route guard components.
- `src/pages`: Route-level screens (`/landing`, `/explore`, `/auth`, etc.).
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

## Security Model

- Passwords are never stored in plain text.
- Registration hashes passwords using bcrypt salt rounds.
- Login compares plaintext password to hash via bcrypt compare.
- JWT token required in `Authorization: Bearer <token>` for protected endpoints.
- Invalid or expired JWT returns HTTP 401.
