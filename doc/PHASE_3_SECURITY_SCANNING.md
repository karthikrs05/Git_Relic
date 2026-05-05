# Git Relic - Phase 3: Security Scanning Implementation

## What's Been Built

### Security Scanning System

✅ **Gitleaks Integration**

- Automated secret detection in git history
- Scans for AWS keys, API tokens, private keys, database passwords, etc.
- Runs automatically on every project upload

✅ **Security Scan Pipeline**

- Blocks uploads with leaked credentials
- Logs all scan results in MongoDB
- Sanitizes sensitive information before displaying to users
- Non-blocking UI feedback (users see issue count, not actual secrets)

✅ **New Project Status Workflow**

- `pending_scan` → Upload received, scan in progress
- `scanned` → ✅ Passed security scan, ready for AI analysis
- `pending_review` → ❌ Security issues found, awaiting manual review
- `published` → Ready for salvagers to discover
- `salvaged` → Project claimed by salvager
- `failed` → Upload processing failed

✅ **Security Logging**

- All scan results stored in `SecurityScanLog` collection
- File-level issue details (file path, line number, issue type)
- Raw gitleaks output for debugging
- Timestamp tracking for audit trail

### New Files Created

```
server/
├── models/
│   └── SecurityScanLog.js           # Security scan logging
├── utils/
│   └── securityScanner.js           # Gitleaks integration
└── routes/
    └── projectRoutes.js             # Updated with security endpoints
```

### Dependencies Added

- `gitleaks` - Secret detection CLI tool

## How It Works

### Security Scan Flow

1. **User uploads project zip**

   ```
   POST /api/projects/upload
   - Authentication required
   - File: multipart/form-data
   ```

2. **Backend processes:**
   - Extracts zip file
   - Validates .git directory
   - Parses git history
   - **Runs Gitleaks scan** ← NEW
   - Extracts metadata

3. **Gitleaks detects:**
   - AWS credentials (`AKIA*` patterns)
   - Private keys (RSA, DSA, EC)
   - API tokens (GitHub, Stripe, Slack, etc.)
   - Database connection strings
   - OAuth tokens
   - Firebase keys
   - Any hardcoded passwords

4. **Results stored:**
   - Sanitized issues saved to database
   - Raw output archived for debugging
   - Project status updated based on scan result

5. **User receives:**
   - ✅ If passed: "Ready for AI analysis"
   - ❌ If failed: Issue count + safe descriptions

### Example Response (Passed Scan)

```json
{
  "message": "Project uploaded and passed security scan",
  "project": {
    "id": "507f1f77bcf86cd799439011",
    "status": "scanned",
    "metadata": {
      "languages": ["JavaScript", "Python"],
      "fileCount": 245
    },
    "commitCount": 47,
    "securityScan": {
      "passed": true,
      "issueCount": 0,
      "issues": []
    }
  }
}
```

### Example Response (Failed Scan)

```json
{
  "message": "Project blocked: Security issues detected",
  "project": {
    "id": "507f1f77bcf86cd799439012",
    "status": "pending_review",
    "metadata": { ... },
    "commitCount": 23,
    "securityScan": {
      "passed": false,
      "issueCount": 3,
      "issues": [
        {
          "file": ".env",
          "type": "aws_key",
          "line": "8",
          "severity": "HIGH"
        },
        {
          "file": "config.json",
          "type": "stripe_key",
          "line": "14",
          "severity": "HIGH"
        },
        {
          "file": "src/database.js",
          "type": "database_url",
          "line": "3",
          "severity": "HIGH"
        }
      ]
    }
  }
}
```

## New API Endpoints

### Get Security Scan Results

```
GET /api/projects/:projectId/security

Response:
{
  "projectId": "507f1f77bcf86cd799439011",
  "passed": true,
  "issueCount": 0,
  "issues": [],
  "scannedAt": "2026-05-05T15:25:00.000Z"
}
```

### Get Pending Review Projects

```
GET /api/projects/status/pending-review
Headers: Authorization: Bearer <token>

Response: Array of projects with security issues awaiting review
```

## Security Design Principles

### Never Expose Secrets

- ❌ Actual secrets not stored in database
- ❌ Actual secrets not sent to frontend
- ✅ Only safe metadata (file path, issue type) shown to users
- ✅ Raw output stored for audit but never displayed

### Defense in Depth

1. **Prevention**: Gitleaks scans before storage
2. **Detection**: Log all findings with timestamps
3. **Audit**: Full scan history retained
4. **Review**: Blocked projects flagged for manual verification

### User Privacy

- Donors can see their own scan results
- Non-donors cannot access scan details of other projects
- Admins can review flagged projects

## Testing Phase 3

### 1. Create a Test Project with Secrets

```bash
mkdir -p test_project
cd test_project
git init

# Add a file with secrets (intentionally exposed for testing)
cat > .env << 'EOF'
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
DATABASE_URL=postgres://user:password@db.example.com:5432/app
STRIPE_KEY=sk_test_51234567890abcdefghijklmno
EOF

git add .env
git commit -m "Add environment config"

# Add another file with secrets
cat > config.json << 'EOF'
{
  "github_token": "ghp_1234567890abcdefghijklmnopqrstuvwxyz",
  "api_key": "secret_key_12345"
}
EOF

git add config.json
git commit -m "Add API configuration"

cd ..
zip -r test_project_with_secrets.zip test_project/
```

### 2. Upload and See Scan Results

```bash
UPLOAD_TOKEN="your_jwt_token_here"

curl -X POST http://localhost:8787/api/projects/upload \
  -H "Authorization: Bearer $UPLOAD_TOKEN" \
  -F "projectZip=@test_project_with_secrets.zip"
```

Expected response will show:

```json
{
  "message": "Project blocked: Security issues detected",
  "project": {
    "status": "pending_review",
    "securityScan": {
      "passed": false,
      "issueCount": 3,
      "issues": [...]
    }
  }
}
```

### 3. Check Scan Log

```bash
PROJECT_ID="507f1f77bcf86cd799439011"

curl http://localhost:8787/api/projects/$PROJECT_ID/security
```

## Database Schema Update

### Project Status Flow

```
pending_scan
    ↓
 [GITLEAKS SCAN]
    ↓
passed? ──yes─→ scanned ──[AI Analysis]──→ published ──[Pitch]──→ salvaged
    ↓
   no ──→ pending_review ←─ [Manual Review]
    ↓
 failed (error)
```

### SecurityScanLog Schema

```javascript
{
  projectId: ObjectId,
  passed: Boolean,
  issueCount: Number,
  issues: [
    {
      file: String,
      type: String (aws_key, stripe_key, etc.),
      line: String,
      severity: String
    }
  ],
  rawOutput: String,
  scannedAt: Date
}
```

## Handling Blocked Projects

### For Donors with Secrets

If a project is blocked due to security issues:

1. **Option A**: Remove secrets and re-upload
   - Edit files to remove/redact sensitive data
   - Force push changes to git history
   - Re-zip and upload

2. **Option B**: Contact admin for manual review
   - Admins can whitelist safe false positives
   - Rare cases where Gitleaks flags legitimate code

3. **Option C**: Mark as deliberate test fixture
   - Projects can be marked as "test_with_secrets"
   - For educational purposes
   - Requires admin approval

## Next Steps (Phase 4)

Once security scanning is complete, projects move to Phase 4:

- **AI Pathologist**: Analyze README and commits
- **Resurrection Roadmap**: Generate 3-step recovery plan
- **Auto-categorization**: Determine project type and difficulty
- **Market readiness**: Status → `published`

---

**Phase 3 Complete!** Projects now have enterprise-grade secret detection.
