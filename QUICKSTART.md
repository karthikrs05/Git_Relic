# Git Relic - Quick Start Guide

## Environment Setup ✅

`.env` file has been configured with:

- ✅ Gemini API Key
- ✅ MongoDB URI (local)
- ✅ JWT Secret (development)
- ✅ Port (8787)

## Prerequisites

### 1. MongoDB

You need MongoDB running locally:

```bash
# Option A: Using Homebrew (macOS)
brew services start mongodb-community

# Option B: Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option C: MongoDB Atlas (Cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

Verify MongoDB is running:

```bash
mongo --version
```

### 2. Node.js

Already installed (you have npm working)

## Installation

```bash
# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

## Running the Application

### Start Backend Server Only

```bash
npm run dev:server
# Runs on http://localhost:8787
```

### Start Frontend Only

```bash
npm run dev:client
# Runs on http://localhost:5173
```

### Start Both (Recommended)

```bash
npm run dev:full
# Backend: http://localhost:8787
# Frontend: http://localhost:5173
```

## Testing the API

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

Save the returned `token` for next steps.

### 2. Create a Test Project

```bash
# Create test project with git history
mkdir -p test_project
cd test_project
git init

# Add README
cat > README.md << 'EOF'
# My Abandoned Project

A cool project I started but never finished.
It was supposed to be a real-time chat app with React and Firebase.

## Features
- Real-time messaging
- User authentication
- Chat rooms

## Why it failed
I hit a wall with Firebase permissions and never got back to it.
EOF

git add README.md
git commit -m "Initial project setup"

# Add some code
echo "console.log('TODO: implement chat')" > app.js
git add app.js
git commit -m "Add basic app structure"

cd ..
zip -r test_project.zip test_project/
```

### 3. Upload Project

```bash
TOKEN="your_token_from_registration"

curl -X POST http://localhost:8787/api/projects/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "projectZip=@test_project.zip"
```

You'll see:

- ✅ Project extracted
- ✅ Security scan passed (no secrets)
- ✅ AI analysis generated
- ✅ Roadmap created
- ✅ Project published!

### 4. View Published Projects

```bash
curl http://localhost:8787/api/projects/list
```

### 5. View Project Details with AI Analysis

```bash
PROJECT_ID="from_upload_response"

curl http://localhost:8787/api/projects/$PROJECT_ID/analysis
```

## Full Feature List (What's Working)

### Authentication ✅

- User registration with password hashing
- User login with JWT tokens
- Protected routes with token validation

### Project Upload & Processing ✅

- File upload (zip with .git)
- Automatic extraction
- Git history parsing (commits, dates, authors)
- Language detection
- File count tracking

### Security Scanning ✅

- Gitleaks integration
- Secret detection (AWS keys, API tokens, passwords)
- Sanitized issue reporting
- Automatic blocking of projects with secrets

### AI Analysis ✅

- Google Gemini integration
- README + commit analysis
- Resurrection roadmap generation
- Failure reason detection
- Difficulty assessment
- Time estimates

### Project Publishing ✅

- Auto-publish to "Graveyard Feed"
- Project listing
- Detailed project views
- Status tracking

## Troubleshooting

### MongoDB Connection Failed

```
Error: MongoDB connection failed
```

**Solution**: Start MongoDB server:

```bash
brew services start mongodb-community
# or use Docker
docker run -d -p 27017:27017 mongo:latest
```

### Gemini API Error

```
Error: GEMINI_API_KEY not set
```

**Solution**: Check .env file has `GEMINI_API_KEY=...`

### Port Already in Use

```
Error: listen EADDRINUSE :::8787
```

**Solution**: Change PORT in .env or kill process:

```bash
lsof -ti:8787 | xargs kill -9
```

### File Upload Size Error

```
Error: File too large
```

**Solution**: Max size is 500MB. Reduce project size or split files.

## Next Steps

1. ✅ Backend working end-to-end (Phases 2-4 complete)
2. 🔜 **Phase 5**: Pitch & Lineage system
3. 🔜 Build frontend Explore page
4. 🔜 Deploy to production

## Documentation

- `PROGRESS_SUMMARY.md` - Overview of all 3 phases
- `doc/PHASE_2_IMPLEMENTATION.md` - Upload & processing
- `doc/PHASE_3_SECURITY_SCANNING.md` - Security details
- `doc/PHASE_4_AI_PATHOLOGIST.md` - AI analysis

## Important Notes

⚠️ **Security**:

- `.env` is NOT committed to git (in .gitignore)
- Never share your Gemini API key
- JWT_SECRET should be unique in production
- Change JWT_SECRET before deploying

⚠️ **Local Development**:

- MongoDB must be running locally
- Gemini API calls count toward your quota
- Project files stored in `/uploads/projects/`

## Questions?

Check the documentation files or review the phase completion summaries!
