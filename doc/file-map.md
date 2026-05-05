# File Map

Complete reference of every file in the project and its responsibility.

## Root Files

| File | Purpose |
|---|---|
| `index.html` | HTML entry point. Mounts React app. |
| `package.json` | Dependencies, scripts, and project metadata. |
| `package-lock.json` | Locks dependency versions for reproducible installs. |
| `vite.config.js` | Vite bundler configuration (React plugin, server proxy). |
| `tailwind.config.js` | Tailwind CSS config (content paths, theme, custom colors). |
| `postcss.config.js` | PostCSS config enabling Tailwind and Autoprefixer. |
| `.gitignore` | Files/folders excluded from git tracking. |

## Server (`server/`)

### Entry & Config

| File | Purpose |
|---|---|
| `server/index.js` | Express app entry. Registers `cors`, JSON parsing, mounts auth routes (`/api/auth`) and protected sample routes. Starts HTTP listener. |

### Routes

| File | Purpose |
|---|---|
| `server/routes/authRoutes.js` | Auth endpoints: `POST /register`, `POST /login`, `GET /me`. Handles bcrypt hashing/comparison, JWT signing, account provisioning/upserting, and returns sanitized user objects. |

### Middleware

| File | Purpose |
|---|---|
| `server/middleware/authMiddleware.js` | JWT verification. Extracts Bearer token, verifies signature/expiry, attaches decoded user to `req.user`. Returns 401 on failure. |

### Data Store

| File | Purpose |
|---|---|
| `server/data/users.json` | Persistent user records (id, username, email, passwordHash, createdAt). |
| `server/data/accounts.json` | Per-user account state (stats, activity log, lastLoginAt, createdAt). |

## Frontend (`src/`)

### Entry & App Shell

| File | Purpose |
|---|---|
| `src/main.jsx` | React entry point. Renders `<App>` inside `<AuthProvider>` and `<BrowserRouter>`. |
| `src/App.jsx` | Top-level router. Defines public and protected routes. Uses `ProtectedRoute` for guarded pages. |
| `src/index.css` | Global styles. Tailwind directives, custom fonts, scrollbar, and theme overrides. |
| `src/layouts/AppLayout.jsx` | Shared layout shell wrapping pages with `<Navbar>` and content container. |

### Pages

| File | Purpose |
|---|---|
| `src/pages/Landing.jsx` | Public homepage. Hero, features, and call-to-action sections. |
| `src/pages/Auth.jsx` | Login/Register form. Submits to `AuthContext.login`/`register`. Redirects to dashboard on success. |
| `src/pages/Dashboard.jsx` | Authenticated user dashboard. Displays username, email, account stats. |
| `src/pages/Explore.jsx` | Public repo/project exploration interface. |
| `src/pages/DropProject.jsx` | Form for dropping/submitting projects (protected). |
| `src/pages/Leaderboard.jsx` | User rankings and stats display. |
| `src/pages/RelicDetail.jsx` | Detail view for a single relic/project. |

### Components

| File | Purpose |
|---|---|
| `src/components/Navbar.jsx` | Top navigation bar. Shows login/register when unauthenticated, username/logout when authenticated. |
| `src/components/ProtectedRoute.jsx` | Route guard. Redirects to `/auth` if not authenticated. Shows loading state during auth check. |
| `src/components/PageTransition.jsx` | Framer Motion wrapper for page-level enter/exit animations. |
| `src/components/BlinkingCursor.jsx` | Terminal-style blinking cursor animation. |
| `src/components/MonospaceInput.jsx` | Styled terminal-like input field. |
| `src/components/NeonButton.jsx` | Glowing neon-styled button with hover effects. |
| `src/components/TerminalCard.jsx` | Card component with terminal/chalkboard aesthetic. |
| `src/components/StatCounter.jsx` | Animated stat number display. |
| `src/components/StatusBadge.jsx` | Inline status indicator badge. |
| `src/components/TypingText.jsx` | Text component with typewriter animation effect. |

### Context & Services

| File | Purpose |
|---|---|
| `src/context/AuthContext.jsx` | Central auth state. Manages `token`, `user`, `loading`. Provides `login`, `register`, `logout`. Handles 5-min session timer and sessionStorage persistence. |
| `src/services/auth.js` | API client for auth endpoints. Wraps `fetch` calls to `/api/auth/register`, `/api/auth/login`, `/api/auth/me`. |

### Hooks & Data

| File | Purpose |
|---|---|
| `src/hooks/useTypewriter.js` | Custom hook that animates text character-by-character. |
| `src/data/mockData.js` | Static mock data for UI sections, features, and sample content. |

### Config

| File | Purpose |
|---|---|
| `public/` | Static assets served directly by Vite (favicons, etc.). |

## Documentation (`doc/`)

| File | Purpose |
|---|---|
| `doc/README.md` | Documentation index and product area summary. |
| `doc/architecture.md` | High-level architecture, module responsibilities, security model, and backend auth details. |
| `doc/system-flow.md` | End-to-end flows: auth, protected routes, API, navigation, session management. |
| `doc/tech-stack.md` | Full technology stack listing. |
