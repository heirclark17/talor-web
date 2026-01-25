# Backend Integration - Complete API Reference

This document shows all backend endpoints integrated into the mobile app.

## Backend Repository
https://github.com/heirclark17/resume-ai-backend

## API Base URL
Production: `https://resume-ai-backend-production-3134.up.railway.app`

## Authentication
All requests include `X-User-ID` header with session user ID from AsyncStorage.

---

## Resume Management

### Upload Resume
```typescript
api.uploadResume(formData: FormData)
```
**Backend:** `POST /api/resumes/upload`
**Response:** `{success, resume_id, filename, parsed_data}`

### List Resumes
```typescript
api.getResumes()
```
**Backend:** `GET /api/resumes/list`
**Response:** `{resumes: [{id, filename, summary, skills_count, uploaded_at}]}`

### Get Resume Details
```typescript
api.getResume(resumeId: number)
```
**Backend:** `GET /api/resumes/{resume_id}`
**Response:** Resume details with skills, experience, education, certifications

### Delete Resume
```typescript
api.deleteResume(resumeId: number)
```
**Backend:** `POST /api/resumes/{resume_id}/delete`
**Response:** `{success, message, deleted_files, audit}`

---

## Job Extraction

### Extract Job Details from URL
```typescript
api.extractJobDetails(jobUrl: string)
```
**Backend:** `POST /api/jobs/extract`
**Request:** `{job_url}`
**Response:** `{success, company, job_title, description, location, salary}`
**Uses:** Firecrawl for scraping job postings

**Note:** LinkedIn and some other sites are blocked by Firecrawl due to Terms of Service restrictions. If extraction fails, users should manually enter company name and job title.

---

## Resume Tailoring

### Tailor Resume
```typescript
api.tailorResume({
  baseResumeId: number,
  jobUrl?: string,
  company?: string,
  jobTitle?: string
})
```
**Backend:** `POST /api/tailor`
**Process:**
1. Fetches base resume
2. Extracts job details with Firecrawl (if URL provided)
3. Researches company with Perplexity
4. Tailors resume with OpenAI Claude
5. Generates DOCX file
6. Returns tailored content

**Response:** `{success, tailored_resume_id, job_id, company, title, docx_path, summary, competencies, experience, alignment_statement}`

### Get Tailored Resume
```typescript
api.getTailoredResume(tailoredResumeId: number)
```
**Backend:** `GET /api/tailored/{tailored_id}`
**Response:** Full tailored resume details

### Update Tailored Resume
```typescript
api.updateTailoredResume(tailoredResumeId, {
  summary?: string,
  competencies?: string[],
  experience?: any[],
  alignment_statement?: string
})
```
**Backend:** `PUT /api/tailored/{tailored_id}`
**Purpose:** Edit tailored resume content

### List Tailored Resumes
```typescript
api.listTailoredResumes()
```
**Backend:** `GET /api/tailor/list`
**Response:** `{tailored_resumes: [...]}`

### Download Tailored Resume
```typescript
api.downloadTailoredResume(tailoredResumeId: number)
```
**Backend:** `GET /api/tailor/download/{tailored_id}`
**Response:** DOCX file download URL

---

## Interview Preparation

### Generate Interview Prep
```typescript
api.generateInterviewPrep(tailoredResumeId: number)
```
**Backend:** `POST /api/interview-prep/generate/{tailored_resume_id}`
**Process:**
1. Fetches tailored resume + job + company research
2. Generates behavioral & technical questions with OpenAI
3. Creates suggested answers
4. Provides interview tips

**Response:** `{success, interview_prep_id, prep_data, created_at}`

### Get Interview Prep
```typescript
api.getInterviewPrep(tailoredResumeId: number)
```
**Backend:** `GET /api/interview-prep/{tailored_resume_id}`
**Response:** Full interview prep data with questions and answers

### List Interview Preps
```typescript
api.listInterviewPreps()
```
**Backend:** `GET /api/interview-prep/list`
**Response:** Array of interview preps with metadata

### Delete Interview Prep
```typescript
api.deleteInterviewPrep(interviewPrepId: number)
```
**Backend:** `DELETE /api/interview-prep/{interview_prep_id}`

---

## Saved Comparisons

### Save Comparison
```typescript
api.saveComparison({
  tailoredResumeId: number,
  title: string,
  notes?: string
})
```
**Backend:** `POST /api/saved-comparisons/save`
**Purpose:** Bookmark a tailored resume for easy access

### List Saved Comparisons
```typescript
api.getSavedComparisons()
```
**Backend:** `GET /api/saved-comparisons/list`
**Response:** Array of saved comparisons with company, position, tags

### Get Saved Comparison
```typescript
api.getSavedComparison(comparisonId: number)
```
**Backend:** `GET /api/saved-comparisons/{comparison_id}`
**Response:** Full comparison data with base and tailored resume

### Update Comparison
```typescript
api.updateComparison(comparisonId, {
  title?: string,
  notes?: string,
  is_pinned?: boolean,
  tags?: string[]
})
```
**Backend:** `PUT /api/saved-comparisons/{comparison_id}`

### Delete Comparison
```typescript
api.deleteComparison(comparisonId: number)
```
**Backend:** `DELETE /api/saved-comparisons/{comparison_id}`

---

## Resume Analysis

### Analyze All
```typescript
api.analyzeAll(tailoredResumeId: number, forceRefresh = false)
```
**Backend:** `POST /api/resume-analysis/analyze-all`
**Returns:** Skills gap, keyword match, changes summary
**Caching:** Results cached unless `forceRefresh = true`

### Analyze Changes
```typescript
api.analyzeChanges(baseResumeId: number, tailoredResumeId: number)
```
**Backend:** `POST /api/resume-analysis/analyze-changes`
**Returns:** Diff between base and tailored resume

### Analyze Keywords
```typescript
api.analyzeKeywords(resumeContent: string, jobDescription: string)
```
**Backend:** `POST /api/resume-analysis/analyze-keywords`
**Returns:** Keyword matches and suggestions

### Calculate Match Score
```typescript
api.calculateMatchScore(tailoredResumeId: number, jobDescription: string)
```
**Backend:** `POST /api/resume-analysis/match-score`
**Returns:** Percentage match score (0-100)

---

## STAR Stories

### Create STAR Story
```typescript
api.createStarStory({
  situation: string,
  task: string,
  action: string,
  result: string,
  tags?: string[]
})
```
**Backend:** `POST /api/star-stories/`
**Purpose:** Save behavioral interview stories

### List STAR Stories
```typescript
api.listStarStories()
```
**Backend:** `GET /api/star-stories/list`

### Get STAR Story
```typescript
api.getStarStory(storyId: number)
```
**Backend:** `GET /api/star-stories/{story_id}`

### Update STAR Story
```typescript
api.updateStarStory(storyId, updates)
```
**Backend:** `PUT /api/star-stories/{story_id}`

### Delete STAR Story
```typescript
api.deleteStarStory(storyId: number)
```
**Backend:** `DELETE /api/star-stories/{story_id}`

---

## Career Path Designer

### Research Career Path
```typescript
api.researchCareerPath({
  currentRole: string,
  targetRole: string,
  industry?: string
})
```
**Backend:** `POST /api/career-path/research`
**Uses:** Perplexity to research career progression

### Generate Career Plan
```typescript
api.generateCareerPlan({
  currentRole: string,
  targetRole: string,
  resumeId?: number
})
```
**Backend:** `POST /api/career-path/generate`
**Process:**
1. Researches skills gap between current and target role
2. Creates timeline with milestones
3. Generates learning resources
4. Provides actionable tasks

### Get Career Plan
```typescript
api.getCareerPlan(planId: number)
```
**Backend:** `GET /api/career-path/{plan_id}`

### List Career Plans
```typescript
api.listCareerPlans()
```
**Backend:** `GET /api/career-path/`

### Delete Career Plan
```typescript
api.deleteCareerPlan(planId: number)
```
**Backend:** `DELETE /api/career-path/{plan_id}`

---

## Backend Technology Stack

### AI Services
- **OpenAI GPT-4**: Resume tailoring, interview prep, career planning
- **Perplexity**: Company research, career path research
- **Firecrawl**: Job posting extraction

### Database
- **PostgreSQL**: Resume storage, user sessions, analysis cache
- **SQLAlchemy**: ORM with async support

### Security
- **Rate Limiting**: slowapi with per-IP limits
- **SSRF Protection**: URL validation for job extraction
- **File Validation**: ClamAV virus scanning
- **Session-based Auth**: No passwords, user IDs in AsyncStorage

### File Processing
- **python-docx**: Resume parsing (DOCX)
- **PyPDF2**: PDF resume parsing
- **docx**: Tailored resume generation

---

## Rate Limits (Backend)

| Endpoint | Limit | Purpose |
|----------|-------|---------|
| Resume Upload | 5/minute | Prevent abuse |
| Resume Tailoring | 10/hour | Expensive AI operations |
| Batch Tailoring | 2/hour | Very expensive (10 jobs each) |
| Job Extraction | 20/minute | Firecrawl API limits |
| Interview Prep | No limit | Cached after first generation |

---

## Mobile App Features Not Yet Used

The mobile app currently implements the core flow:
1. ✅ Upload resume
2. ✅ Tailor for jobs
3. ✅ Generate interview prep
4. ✅ Save comparisons

**Available but not yet integrated in UI:**
- ❌ Resume Analysis (skills gap, keyword matching, match scores)
- ❌ STAR Stories management
- ❌ Career Path Designer
- ❌ Resume editing (update tailored resume)
- ❌ Comparison editing (notes, tags, pinning)

These endpoints are ready to use - just need screens built!

---

## Error Handling

All API functions return:
```typescript
{
  success: boolean,
  data?: any,
  error?: string
}
```

Screens should check `success` before using `data`:
```typescript
const result = await api.getResumes();
if (result.success) {
  setResumes(result.data);
} else {
  console.error('Failed:', result.error);
  Alert.alert('Error', result.error);
}
```

---

## Testing the Backend

**Production API:** https://resume-ai-backend-production-3134.up.railway.app

**Test Endpoint:**
```bash
curl https://resume-ai-backend-production-3134.up.railway.app/health
```

**Test with User ID:**
```bash
curl -H "X-User-ID: test-user-123" \
  https://resume-ai-backend-production-3134.up.railway.app/api/resumes/list
```

---

## Next Steps

### Phase 1: Complete Core Features (Done ✅)
- Resume upload
- Job tailoring
- Interview prep
- Saved comparisons

### Phase 2: Add Analysis Features
- Resume analysis screen
- Match score visualization
- Skills gap display
- Keyword suggestions

### Phase 3: Add Advanced Features
- STAR stories CRUD
- Career path designer
- Resume editing
- Comparison management

### Phase 4: Offline Support
- Cache resumes locally
- Queue uploads for retry
- Sync when online

---

## Contact

**Backend Repo:** https://github.com/heirclark17/resume-ai-backend
**Mobile Repo:** https://github.com/heirclark17/talor-web

**Issues:** Report backend issues in backend repo, mobile issues in talor-web repo
