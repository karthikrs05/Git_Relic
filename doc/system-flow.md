# System Flow

## Authentication Flow

1. User opens `/auth`.
2. User selects `login` or `register` mode.
3. Frontend submits credentials to backend:
- `POST /api/auth/register` or
- `POST /api/auth/login`
4. Backend validates payload.
5. Backend hashes (register) or compares hash (login) using bcrypt.
6. If valid, backend generates JWT.
7. Backend returns `{ token, user }`.
8. Frontend stores token in `localStorage` (`gr_token`).
9. `AuthContext` updates `isAuthenticated` and `user` state.
10. Protected frontend routes become accessible.

## Protected Route Flow (Frontend)

1. Route wrapped by `ProtectedRoute`.
2. `ProtectedRoute` checks auth state from `AuthContext`.
3. If no token/auth -> redirect to `/auth`.
4. If authenticated -> render target page.

## Protected API Flow (Backend)

1. Client calls protected endpoint with bearer token.
2. `authMiddleware` extracts JWT from `Authorization` header.
3. Middleware verifies JWT signature and expiry.
4. On success, decoded user payload is attached to `req.user`.
5. Endpoint returns protected data.
6. On failure, API responds with HTTP 401.

## App Navigation Flow

- Default route redirects to `/landing`.
- Public pages: `/landing`, `/explore`, `/relic_detail`, `/auth`.
- Protected pages: `/dashboard`, `/drop_project`, `/pitch`.
