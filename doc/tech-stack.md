# Tech Stack

## Frontend

- React 18
- Vite 5
- React Router DOM 6
- Tailwind CSS 3
- Framer Motion 11

## Backend

- Node.js
- Express 4
- CORS
- bcryptjs (password hashing and comparison)
- jsonwebtoken (JWT creation and verification)

## Tooling and Build

- PostCSS
- Autoprefixer
- @vitejs/plugin-react
- concurrently (run frontend and backend together)

## Data Storage

- Local JSON file (`server/data/users.json`) for user persistence.
- Local JSON file (`server/data/accounts.json`) for authenticated account state.

## Scripts

- `npm run dev`: Start frontend dev server.
- `npm run dev:server`: Start backend auth server.
- `npm run dev:client`: Start frontend client server.
- `npm run dev:full`: Run backend + frontend together.
- `npm run build`: Production frontend build.
- `npm run start:server`: Run backend server.
