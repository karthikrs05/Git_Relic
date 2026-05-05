# Requirements

## System Requirements

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher (comes with Node.js)
- **OS**: macOS, Linux, or Windows

## Prerequisites

### Required
- Node.js runtime (v18+)
- npm package manager

### Optional (for full feature set)
- MongoDB v6+ (optional; app runs with JSON file storage by default)
  - Local install or MongoDB Atlas connection
- Environment variable `MONGODB_URI` (only if using MongoDB)

## Dependencies

### Production
| Package | Purpose |
|---|---|
| `express` | HTTP server and API framework |
| `cors` | Cross-origin resource sharing middleware |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT token signing and verification |
| `mongoose` | MongoDB ODM (optional) |
| `dotenv` | Environment variable loading |
| `multer` | File upload handling |
| `unzipper` | ZIP file extraction |
| `simple-git` | Git operations wrapper |
| `gitleaks` | Secret scanning |
| `@google/generative-ai` | Google AI integration |
| `react` | UI library |
| `react-dom` | React DOM rendering |
| `react-router-dom` | Client-side routing |
| `framer-motion` | Animations |

### Development
| Package | Purpose |
|---|---|
| `vite` | Frontend build tool and dev server |
| `@vitejs/plugin-react` | Vite React plugin |
| `tailwindcss` | Utility-first CSS framework |
| `postcss` | CSS transformation tool |
| `autoprefixer` | Vendor prefix automation |
| `concurrently` | Run multiple npm scripts in parallel |

## Environment Variables

Create a `.env` file in the project root:

```env
# Optional - MongoDB connection string
# App runs with JSON file storage if not provided
MONGODB_URI=mongodb://localhost:27017/git-relic

# Optional - JWT signing secret (defaults to dev secret)
JWT_SECRET=your_secure_secret_here

# Optional - Server port (defaults to 8787)
PORT=8787

# Optional - Frontend dev server proxy
VITE_API_BASE_URL=http://localhost:8787/api

# Optional - Google AI API key
GEMINI_API_KEY=your_gemini_api_key
```

## Installation

```bash
npm install
```

## Running the Project

### Full stack (client + server)
```bash
npm run dev:full
```

### Client only
```bash
npm run dev
```

### Server only
```bash
npm run dev:server
```

### Production build
```bash
npm run build
npm run preview
```

## Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:8787

## Session Management

- Session duration: 5 minutes (auto-logout)
- Token storage: sessionStorage (cleared on tab/browser close)
- JWT expiry: 7 days (server-side validation)
