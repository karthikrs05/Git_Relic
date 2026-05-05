# Git Relic - Phase 2: File Upload & Git Parsing Implementation

## What's Been Built

### Backend Infrastructure

✅ **MongoDB Integration**

- Mongoose schemas for Users, Projects, Pitches, Lineage
- MongoDB connection setup in `server/config/db.js`

✅ **Authentication (Migrated to MongoDB)**

- Updated auth routes to use MongoDB instead of JSON files
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

✅ **Project Upload System**

- `POST /api/projects/upload` - Upload .zip project with .git folder
- Multipart form-data handling with multer
- 500MB file size limit

✅ **File Processing Pipeline**

- **Extraction**: Unzips project archives to `/uploads/projects/{id}/`
- **Validation**: Checks for .git directory presence
- **Git Parsing**: Extracts commit history, count, last activity date
- **Metadata Extraction**: Detects programming languages, counts files
- **Cleanup**: Removes temporary files after processing

✅ **Project Listing**

- `GET /api/projects/list` - Public list of published projects
- `GET /api/projects/:projectId` - View project details
- `GET /api/projects/user/:userId` - User's uploaded projects

### File Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   ├── User.js              # User schema
│   ├── Project.js           # Project schema
│   ├── Pitch.js             # Pitch schema
│   └── Lineage.js           # Lineage schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints (updated for MongoDB)
│   └── projectRoutes.js     # Project upload & listing endpoints
├── utils/
│   ├── fileExtractor.js     # Zip extraction & metadata
│   └── gitParser.js         # Git history parsing
├── middleware/
│   └── authMiddleware.js    # JWT authentication middleware
└── index.js                 # Main server entry point
```

## Setup & Running

### Prerequisites

```bash
# Install MongoDB locally or use MongoDB Atlas
# Recommended: Use MongoDB Compass for local development
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env and set:
# - MONGODB_URI (default: mongodb://localhost:27017/git-relic)
# - JWT_SECRET (for production, use a strong secret)
```

### Install Dependencies

```bash
npm install
```

### Run Backend Server

```bash
npm run dev:server
# Server runs on http://localhost:8787
```

### Run Full Stack (Concurrent)

```bash
npm run dev:full
# Runs both server (8787) and client (5173)
```

## API Endpoints

### Authentication

```
POST /api/auth/register
  Body: { username, email, password }
  Response: { token, user }

POST /api/auth/login
  Body: { email, password }
  Response: { token, user }

GET /api/auth/me
  Headers: Authorization: Bearer <token>
  Response: { id, username, email, bio, createdAt }
```

### Projects

```
POST /api/projects/upload
  Headers: Authorization: Bearer <token>
  Body: multipart/form-data with "projectZip" file
  Response: { projectId, status, metadata, commitCount }

GET /api/projects/list
  Response: Array of published projects

GET /api/projects/:projectId
  Response: Full project details with donor info

GET /api/projects/user/:userId
  Headers: Authorization: Bearer <token>
  Response: User's uploaded projects
```

## Testing Phase 2

### 1. Register a User

```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Upload a Project

```bash
# First, create a test project with .git folder
mkdir -p test_project/.git
cd test_project
git init
echo "# Test Project" > README.md
git add .
git commit -m "Initial commit"
cd ..

# Zip it
zip -r test_project.zip test_project/

# Upload
curl -X POST http://localhost:8787/api/projects/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "projectZip=@test_project.zip"
```

### 3. List Projects

```bash
curl http://localhost:8787/api/projects/list
```

## Next Steps (Phase 3-4)

### Phase 3: Security Scanning

- Integrate Gitleaks for secret detection
- Block uploads with leaked credentials
- Log security scan results

### Phase 4: AI Pathologist

- Integrate Google Gemini API
- Analyze project README and commit messages
- Generate "Resurrection Roadmap"
- Detect why project was abandoned

## Database Schema Notes

### Projects Status Flow

- `pending_scan` → Upload received, awaiting security scan
- `scanned` → Security scan passed, awaiting AI analysis
- `published` → Ready for salvagers to view
- `salvaged` → Ownership transferred to salvager

### Important Fields

- `donorId`: Original uploader
- `currentOwner`: Current owner (changes on salvage)
- `storageLocation`: Path to extracted files
- `metadata.languages`: Detected programming languages
- `commitCount`: Total git commits
- `lastActivity`: Date of last commit

## Error Handling

Common errors and solutions:

1. **"Invalid project: missing .git directory"**
   - Ensure the uploaded zip contains a .git folder at the root

2. **"Failed to extract"**
   - Check file permissions in temp/uploads directories
   - Ensure disk space available

3. **MongoDB connection error**
   - Start MongoDB: `mongod` (local) or verify MongoDB Atlas connection
   - Check MONGODB_URI in .env

4. **JWT errors**
   - Ensure Authorization header format: `Bearer <token>`
   - Token may have expired (7-day expiry)

---

**Phase 2 is complete!** Ready to move to Phase 3 (Security Scanning) or Phase 4 (AI Analysis).
