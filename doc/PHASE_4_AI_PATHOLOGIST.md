# Git Relic - Phase 4: AI Pathologist Implementation

## What's Been Built

### AI-Powered Project Analysis

✅ **Google Gemini Integration**

- Analyzes project README and recent commit messages
- Generates "Resurrection Roadmap" (3 specific, actionable steps)
- Identifies why the project was abandoned
- Auto-categorizes difficulty level
- Estimates hours needed for resurrection

✅ **Automatic Analysis Pipeline**

- Triggered automatically after security scan passes
- Projects automatically published to "Graveyard Feed" upon completion
- Manual analysis endpoint for stuck projects

✅ **AI-Generated Insights**

- **Summary**: What the project does (2-3 sentences)
- **Failure Reason**: Why it was abandoned (e.g., "Dependency Hell", "Scope Creep", "Technical Debt")
- **Roadmap**: 3-step plan to resurrect the project
- **Difficulty**: Beginner/Intermediate/Advanced
- **Estimated Hours**: Time to complete roadmap

### New Files Created

```
server/
├── utils/
│   └── aiAnalyzer.js                # Google Gemini integration
└── routes/
    └── projectRoutes.js             # Updated with AI endpoints
```

### Dependencies Added

- `@google/generative-ai` - Google Generative AI SDK

## Full Upload → Publish Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    USER UPLOADS PROJECT                      │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 1: EXTRACT & VALIDATE                                  │
│ - Unzip project folder                                      │
│ - Check for .git directory                                  │
│ - Parse commit history                                      │
│ - Extract metadata (languages, file count)                  │
│ Status: "pending_scan"                                      │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: SECURITY SCAN (Gitleaks)                           │
│ - Scan for AWS keys, API tokens, passwords                 │
│ - Sanitize results                                          │
│ - Log findings in database                                  │
└────────────────┬──────────────────────────┬────────────────┘
               PASSED                      FAILED
                 ↓                           ↓
        ┌────────────────┐        ┌──────────────────────┐
        │ Step 3: AI     │        │ Status: "pending_    │
        │ ANALYSIS       │        │ review" (BLOCKED)    │
        │ (Gemini)       │        │                      │
        │ - Read README  │        │ Donor gets notified  │
        │ - Analyze      │        │ about secrets        │
        │   commits      │        │                      │
        │ - Generate     │        │ Options:             │
        │   roadmap      │        │ 1. Re-upload clean   │
        │ - Determine    │        │ 2. Manual review     │
        │   difficulty   │        │                      │
        └────────────┬───┘        └──────────────────────┘
                     ↓
        ┌────────────────────────┐
        │ Step 4: PUBLISH        │
        │ Status: "published"    │
        │                        │
        │ → NOW ON GRAVEYARD     │
        │   FEED FOR SALVAGERS   │
        └────────────────────────┘
```

## How AI Analysis Works

### Prompt Engineering

Gemini receives:

1. Project metadata (commit count, last activity)
2. Recent commits (last 10) with messages
3. README file content
4. Context about project abandonment

### Example Analysis Output

```json
{
  "summary": "A real-time collaborative note-taking app built with Vue.js and Firebase. Supports markdown, code blocks, and multi-user editing.",
  "failureReason": "Dependency Hell - Vue 2 to Vue 3 migration was started but blocked by incompatible libraries",
  "roadmap": [
    "Upgrade to Vue 3 and compatible dependency versions",
    "Fix failing tests and resolve TypeScript compilation errors",
    "Deploy to production and gather user feedback"
  ],
  "difficulty": "Intermediate",
  "estimatedHours": "30-40"
}
```

## API Endpoints

### Automatic Analysis (Built into Upload)

```
POST /api/projects/upload
  Headers: Authorization: Bearer <token>
  Body: multipart/form-data with "projectZip"

  Response (if passed security):
  {
    "message": "Project uploaded, scanned, and published successfully",
    "project": {
      "id": "...",
      "status": "published",
      "aiAnalysis": {
        "summary": "...",
        "failureReason": "...",
        "roadmap": [...],
        "difficulty": "Intermediate",
        "estimatedHours": "30-40"
      },
      "securityScan": { ... }
    }
  }
```

### Manual Analysis Trigger

```
POST /api/projects/:projectId/analyze
  Headers: Authorization: Bearer <token>

  Use case: Project stuck in "scanned" status

  Response:
  {
    "message": "Project analyzed and published successfully",
    "project": {
      "id": "...",
      "status": "published",
      "aiAnalysis": { ... }
    }
  }
```

### Get Analysis Details

```
GET /api/projects/:projectId/analysis

  Response:
  {
    "projectId": "...",
    "title": "...",
    "description": "...",
    "aiAnalysis": {
      "summary": "...",
      "failureReason": "...",
      "roadmap": [...],
      "difficulty": "Intermediate",
      "estimatedHours": "30-40",
      "analyzedAt": "2026-05-05T15:30:00.000Z"
    }
  }
```

## Setup

### Environment Variables

```bash
# Add to .env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Get Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Create new API key
3. Add to `.env` file

## Testing Phase 4

### 1. Create a Test Project with README

```bash
mkdir -p test_project_ai
cd test_project_ai
git init

# Create a meaningful README
cat > README.md << 'EOF'
# Chat Analytics Dashboard

Real-time analytics for chat platforms. Track user engagement, sentiment analysis, and topic trends.

## Features
- Live message stream processing
- Sentiment analysis with NLP
- Topic extraction and clustering
- Real-time charts and dashboards

## Tech Stack
- Backend: Node.js + Express
- Frontend: React + D3.js
- ML: Python scikit-learn

## Status
🛑 ABANDONED - Started migration from MongoDB to PostgreSQL but ran into ORM complexity issues
EOF

git add README.md
git commit -m "Initial project setup"

# Create some code files
cat > app.js << 'EOF'
// Main app entry point
const express = require('express');
const app = express();

// TODO: Implement chat stream processing
// TODO: Setup database models
app.listen(3000);
EOF

git add app.js
git commit -m "Add express server skeleton"

# Add more commits
echo "// WIP: sentiment analysis" > nlp.py
git add nlp.py
git commit -m "Start NLP module - need ML library integration"

cd ..
zip -r test_project_ai.zip test_project_ai/
```

### 2. Register and Upload

```bash
# Register
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "aitest",
    "email": "ai@test.com",
    "password": "testpass123"
  }'

# Extract token from response and save as TOKEN

# Upload project
curl -X POST http://localhost:8787/api/projects/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "projectZip=@test_project_ai.zip"
```

### 3. Expected Response

```json
{
  "message": "Project uploaded, scanned, and published successfully",
  "project": {
    "id": "507f1f77bcf86cd799439013",
    "status": "published",
    "aiAnalysis": {
      "summary": "A real-time analytics dashboard for chat platforms with sentiment analysis and topic extraction...",
      "failureReason": "Technical Debt - ORM migration complexity",
      "roadmap": [
        "Choose PostgreSQL ORM (Prisma or Sequelize)",
        "Migrate data models and write migrations",
        "Update API endpoints and run integration tests"
      ],
      "difficulty": "Intermediate",
      "estimatedHours": "25-35"
    }
  }
}
```

## Project Status Flow (Updated)

```
pending_scan
    ↓
[Security Scan]
    ├─ Passed → scanned
    │           ↓
    │        [AI Analysis]
    │           ↓
    │        published ←─── (Ready for salvagers!)
    │
    └─ Failed → pending_review
                (Blocked until secrets removed)
```

## Error Handling

### Common Issues

1. **Gemini API errors**
   - Check GEMINI_API_KEY is set
   - Verify API key has "Generative Language API" enabled
   - Check quota limits

2. **Analysis timeout**
   - Very large projects may take 30+ seconds
   - API has internal timeout, returns default analysis

3. **AI unable to analyze**
   - No README found → generic analysis
   - Unrecognizable project → conservative estimate
   - Returns safe default roadmap

## Database Schema Update

### Project.aiAnalysis

```javascript
aiAnalysis: {
  summary: String,
  failureReason: String,
  roadmap: [String],
  difficulty: String,
  estimatedHours: String,
  analyzedAt: Date
}
```

## What Makes This Powerful

1. **Full Context**: AI reads real git history, not just current state
2. **Actionable**: Roadmap is specific to each project, not generic
3. **Failure Attribution**: Identifies why project was abandoned
4. **Difficulty Assessment**: Helps salvagers choose appropriate projects
5. **Time Estimates**: Sets expectations for resurrection effort
6. **Automatic**: Happens instantly after security scan

## Next Steps (Phase 5)

**Pitch & Lineage System**

- Salvagers submit pitches to claim projects
- Donors review and select best pitch
- Ownership transfer + lineage tracking
- Download link generation for new owner

---

**Phase 4 Complete!** Projects now analyze themselves with AI.
