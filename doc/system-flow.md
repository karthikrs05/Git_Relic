# System Flow

## Authentication Flow

1. User opens `/auth`.
2. User selects `login` or `register` mode.
3. Frontend submits credentials to backend:
- `POST /api/auth/register` or
- `POST /api/auth/login`
4. Backend validates payload.
5. Backend hashes (register) or compares hash (login) using bcrypt.
6. Backend provisions or updates a server-side account record.
7. Backend generates JWT (expires in 7 days).
8. Backend returns `{ token, user }`, where `user.account` contains stats and activity.
9. Frontend stores token in `sessionStorage` under key `gr_token` and records session start time under `gr_session_start`.
10. `AuthContext` updates `isAuthenticated` and `user` state.
11. A 5-minute client-side session timer starts for auto-logout.
12. Protected frontend routes become accessible.

## Session Management

### Fixed Duration
- Sessions expire after 5 minutes (configurable via `SESSION_DURATION_MS` in `AuthContext.jsx`).
- Timer starts on login/register and triggers automatic logout.

### Tab/Browser Close
- Token stored in `sessionStorage` instead of `localStorage`.
- Session data automatically cleared when tab/window closes.

### Session Validation
- On app load, `AuthContext` checks if session has exceeded `SESSION_DURATION_MS`.
- Expired sessions are immediately cleared and user logged out.
- If `/auth/me` fails (invalid/expired token), token is removed and state reset.

## Protected Route Flow (Frontend)

1. Route wrapped by `ProtectedRoute`.
2. `ProtectedRoute` checks auth state from `AuthContext`.
3. If no token/auth -> redirect to `/auth`.
4. If authenticated -> render target page.
5. If a user tries to open a protected route directly, they are redirected back after login.

## Protected API Flow (Backend)

1. Client calls protected endpoint with bearer token.
2. `authMiddleware` extracts JWT from `Authorization` header.
3. Middleware verifies JWT signature and expiry.
4. On success, decoded user payload is attached to `req.user`.
5. Endpoint returns protected data.
6. On failure, API responds with HTTP 401.

## App Navigation Flow

- Default route redirects to `/landing`.
- Public pages: `/landing`, `/auth`.
- Protected pages: `/explore`, `/relic_detail`, `/dashboard`, `/drop_project`, `/leaderboard`.
- Legacy route `/pitch` redirects to `/leaderboard`.
