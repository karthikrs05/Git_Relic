# Git Relic Documentation

This folder contains architecture and system documentation for the Git Relic project.

## Documents

- `architecture.md`: High-level architecture, modules, auth backend implementation, and responsibilities.
- `system-flow.md`: End-to-end request and data flow across frontend and backend, including session management.
- `tech-stack.md`: Complete technology stack used in this project.
- `file-map.md`: Reference guide mapping every file to its purpose and responsibility.

## Current Product Areas

- Public landing and exploration screens.
- Protected auth-backed app screens for dashboard, drop flow, and leaderboard.
- File-backed local auth storage for users and account records.
- Fixed-duration session management (5 min) with auto-logout.
- Session data cleared on tab/browser close via sessionStorage.
