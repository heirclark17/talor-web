# Mobile vs Web Feature Parity Analysis
**Date:** February 11, 2026
**Project:** resume-ai-app
**Analyzed by:** Claude Sonnet 4.5

---

## Executive Summary

### Current Status
- **Mobile App:** 15 screens, 17,193 lines of code
- **Web App:** 16 pages, 11,004 lines of code
- **Backend:** 12 route modules (no application tracking or cover letter routes)

### Critical Findings
1. **Mobile is MISSING 6 major features** that exist in web
2. **Backend is MISSING 2 routes** needed for full feature parity
3. **Mobile has MORE comprehensive implementation** of existing features
4. **Authentication systems differ:** Web uses Clerk, Mobile uses session UUIDs
5. **Design systems differ:** Mobile uses iOS 26 Liquid Glass, Web uses Tailwind

### Feature Gap Summary

| Category | Mobile | Web | Backend Support | Priority |
|----------|--------|-----|----------------|----------|
| Application Tracker | ❌ | ✅ | ❌ | **P0 CRITICAL** |
| Cover Letter Generator | ❌ | ✅ | ❌ | **P0 CRITICAL** |
| Clerk Authentication | ❌ | ✅ | ✅ | **P0 CRITICAL** |
| Privacy Policy Page | ❌ | ✅ | N/A | P3 |
| Terms of Service Page | ❌ | ✅ | N/A | P3 |
| 404 Not Found Page | ❌ | ✅ | N/A | P3 |

**Total Features Missing from Mobile:** 6 (2 require new backend routes, 1 requires auth migration, 3 are static pages)

---

## Detailed Feature Comparison

### ✅ Feature Parity Achieved (Mobile + Web)

| Feature | Mobile Screen | Web Page | Backend Route | Status |
|---------|--------------|----------|---------------|--------|
| Resume List/Home | HomeScreen.tsx | Home.tsx | /resumes | ✅ Both implemented |
| Upload Resume | UploadResumeScreen.tsx | UploadResume.tsx | /resumes/upload | ✅ Both implemented |
| Tailor Resume | TailorResumeScreen.tsx | TailorResume.tsx | /tailoring | ✅ Both implemented |
| Batch Tailor | BatchTailorScreen.tsx | ❌ Not in web | /tailoring/batch | Mobile only |
| Interview Prep List | InterviewPrepListScreen.tsx | InterviewPrepList.tsx | /interview-prep | ✅ Both implemented |
| Interview Prep Dashboard | InterviewPrepScreen.tsx | InterviewPrep.tsx | /interview-prep/:id | ✅ Both implemented |
| Common Questions | CommonQuestionsScreen.tsx | Embedded in InterviewPrep | /interview-prep/:id | ✅ Both implemented |
| Practice Questions | PracticeQuestionsScreen.tsx | Embedded in InterviewPrep | /interview-prep/:id | ✅ Both implemented |
| Behavioral/Technical Questions | BehavioralTechnicalQuestionsScreen.tsx | BehavioralTechnicalQuestions.tsx | /interview-prep/:id | ✅ Both implemented |
| STAR Story Builder | STARStoryBuilderScreen.tsx | STARStoryBuilder.tsx | /star-stories | ✅ Both implemented |
| STAR Stories List | StarStoriesScreen.tsx | StarStoriesList.tsx | /star-stories | ✅ Both implemented |
| Career Path Designer | CareerPathDesignerScreen.tsx | CareerPathDesigner.tsx | /career-path | ✅ Both implemented |
| Certifications | CertificationsScreen.tsx | Embedded in CareerPath | /certifications | ✅ Both implemented |
| Saved Comparisons | SavedComparisonsScreen.tsx | SavedComparisons.tsx | /saved-comparisons | ✅ Both implemented |
| Settings | SettingsScreen.tsx | Settings.tsx | N/A (client-side) | ✅ Both implemented |

**Total Parity Features:** 15 features

---

## ❌ Features Missing from Mobile (Web-Only)

### 1. Application Tracker ⚠️ CRITICAL GAP
**Web Implementation:** `web/src/pages/ApplicationTracker.tsx` (395 lines)
**Mobile Implementation:** ❌ Does not exist
**Backend Support:** ❌ **BACKEND ROUTE DOES NOT EXIST**

#### Web Feature Details:
```typescript
// Full job application tracking system
interface Application {
  id: number
  jobTitle: string
  companyName: string
  jobUrl: string | null
  status: ApplicationStatus  // 'saved' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'accepted' | 'rejected' | 'withdrawn' | 'no_response'
  appliedDate: string | null
  notes: string | null
  tailoredResumeId: number | null
  salaryMin: number | null
  salaryMax: number | null
  location: string | null
  contactName: string | null
  contactEmail: string | null
  nextFollowUp: string | null
  createdAt: string
  updatedAt: string
}
```

#### API Methods Used (NOT IN BACKEND):
- `api.listApplications(status?: ApplicationStatus)` - ❌ No backend route
- `api.getApplicationStats()` - ❌ No backend route
- `api.createApplication(data)` - ❌ No backend route
- `api.updateApplication(id, data)` - ❌ No backend route
- `api.deleteApplication(id)` - ❌ No backend route

#### Key Features:
- **Status Pipeline:** 9-stage application status tracking (Saved → Applied → Screening → Interviewing → Offer → Accepted/Rejected/Withdrawn/No Response)
- **Statistics Dashboard:** Real-time stats showing counts for each status
- **Search & Filter:** Search by job title/company, filter by status
- **Add/Edit Modal:** Full CRUD operations with rich form (job title, company, URL, location, salary, contacts, notes, applied date)
- **Status Updates:** Inline status dropdown to quickly update application stage
- **External Links:** Direct links to job postings

#### Implementation Effort:
- **Mobile Screen:** 3-5 days (complex multi-column layout, modals, status management)
- **Backend Routes:** 2-3 days (CRUD endpoints, PostgreSQL schema migration, status validation)
- **Total:** **5-8 days**

#### Priority: **P0 CRITICAL**
**Reason:** Core job search workflow feature. Users expect to track applications they've tailored resumes for.

---

### 2. Cover Letter Generator ⚠️ CRITICAL GAP
**Web Implementation:** `web/src/pages/CoverLetterGenerator.tsx` (773 lines)
**Mobile Implementation:** ❌ Does not exist
**Backend Support:** ❌ **BACKEND ROUTE DOES NOT EXIST**

#### Web Feature Details:
```typescript
interface CoverLetter {
  id: number
  tailoredResumeId: number | null
  baseResumeId: number | null
  jobTitle: string
  companyName: string
  tone: string  // 'professional' | 'enthusiastic' | 'conversational'
  content: string
  createdAt: string
  updatedAt: string
}
```

#### API Methods Used (NOT IN BACKEND):
- `api.listCoverLetters()` - ❌ No backend route
- `api.generateCoverLetter(params)` - ❌ No backend route
- `api.updateCoverLetter(id, data)` - ❌ No backend route
- `api.deleteCoverLetter(id)` - ❌ No backend route
- `api.exportCoverLetter(id, format)` - ❌ No backend route
- `api.extractJobDetails(url)` - ✅ Exists (used for tailoring)

#### Key Features:
- **Dual Input Method:**
  - Paste job description text manually
  - Enter job URL and auto-extract details (uses Firecrawl)
- **URL Extraction Flow:**
  - Input URL → Extract company name + job title + description
  - Success indicators for extracted vs manual fields
  - Graceful fallback to manual entry if extraction fails
- **Resume Integration:**
  - None (generate without resume)
  - Existing resume (dropdown selector)
  - Upload new resume (file picker with immediate upload)
- **Tone Selection:** 3 preset tones (Professional, Enthusiastic, Conversational)
- **Generation Stages:** "Researching company..." → "Generating cover letter..."
- **Cover Letter List:** Left sidebar with all generated letters (job title, company, date, tone badge)
- **Preview/Editor:** Right panel with editable textarea, save changes on edit
- **Export:** Download as .docx file
- **Delete:** Remove cover letter

#### Implementation Effort:
- **Mobile Screens:** 5-7 days (complex form with conditional rendering, file upload, extraction flow, list + detail view)
- **Backend Routes:** 3-5 days (cover letter CRUD, OpenAI/Perplexity integration for generation, .docx export)
- **Total:** **8-12 days**

#### Priority: **P0 CRITICAL**
**Reason:** Cover letters are essential for job applications. This is a value-add feature that differentiates the app.

---

### 3. Clerk Authentication (Sign In / Sign Up)
**Web Implementation:**
- `web/src/pages/SignIn.tsx` (32 lines)
- `web/src/pages/SignUp.tsx` (32 lines)

**Mobile Implementation:** ❌ Does not exist
**Backend Support:** ✅ Backend has Clerk JWT validation in `backend/app/middleware/auth.py`

#### Web Feature Details:
```typescript
// Clerk authentication with styled UI
import { SignIn as ClerkSignIn } from '@clerk/clerk-react'

<ClerkSignIn
  appearance={{
    elements: {
      rootBox: 'mx-auto',
      card: 'bg-transparent shadow-none',
      headerTitle: 'text-theme',
      socialButtonsBlockButton: 'bg-theme-glass-10 border-theme-muted text-theme',
      formFieldInput: 'bg-theme-glass-10 border-theme-muted text-theme',
      formButtonPrimary: 'bg-blue-500 hover:bg-blue-600',
    }
  }}
  routing="path"
  path="/sign-in"
  signUpUrl="/sign-up"
  forceRedirectUrl="/resumes"
/>
```

#### Current Mobile Authentication:
**Mobile uses session-based UUID authentication:**
```typescript
// mobile/src/utils/userSession.ts
export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY)
  if (!userId) {
    userId = generateUserId()  // user_[uuid]
    localStorage.setItem(USER_ID_KEY, userId)
  }
  return userId
}
```

**Problem:** This is a **security vulnerability** identified in the security audit:
- No actual authentication
- Any user can access any user_id's data by manipulating the header
- No login required
- Sessions never expire

#### Authentication Architecture Mismatch:

| Aspect | Web | Mobile | Backend |
|--------|-----|--------|---------|
| Provider | Clerk | UUID Session | Supports both |
| Auth Token | JWT from Clerk | X-User-Id header | Dual mode |
| Login Required | Yes | No | No (accepts either) |
| Security | ✅ Secure | ❌ Broken | ⚠️ Weak |

#### Implementation Options:

**Option A: Add Clerk to Mobile** (RECOMMENDED)
- Install `@clerk/clerk-expo` package
- Create SignIn/SignUp screens matching iOS 26 Liquid Glass design
- Update API client to send Clerk JWT instead of X-User-Id
- **Effort:** 4-6 days
- **Benefits:** Unified auth, secure, SSO support, user management

**Option B: Keep UUID Sessions, Add Backend Authorization**
- Implement proper user ownership checks on backend
- Add session expiration and rotation
- Add login screen to generate session ID
- **Effort:** 3-4 days
- **Benefits:** Simpler mobile implementation
- **Drawbacks:** Still not as secure as Clerk, no SSO, no user management

**Option C: Implement Custom Auth (NOT RECOMMENDED)**
- Build email/password auth from scratch
- Manage password hashing, session tokens, refresh tokens
- **Effort:** 10-15 days
- **Drawbacks:** Reinventing the wheel, security risks, maintenance burden

#### Priority: **P0 CRITICAL**
**Reason:** Security vulnerability. Current mobile auth is broken. Must fix before production.

**Recommended Solution:** Option A (Clerk integration)

---

### 4. Privacy Policy Page
**Web Implementation:** `web/src/pages/PrivacyPolicy.tsx`
**Mobile Implementation:** ❌ Does not exist
**Backend Support:** N/A (static content)

#### Web Feature Details:
- Static legal page with privacy policy content
- Accessible via footer link
- Standard legal disclaimer formatting

#### Implementation Effort:
- **Mobile Screen:** 1 day (simple scrollable text view)
- **Content:** Copy from web version
- **Total:** **1 day**

#### Priority: **P3 LOW**
**Reason:** Required for App Store submission and legal compliance, but not a user-facing feature.

---

### 5. Terms of Service Page
**Web Implementation:** `web/src/pages/TermsOfService.tsx`
**Mobile Implementation:** ❌ Does not exist
**Backend Support:** N/A (static content)

#### Web Feature Details:
- Static legal page with terms of service content
- Accessible via footer link
- Standard legal disclaimer formatting

#### Implementation Effort:
- **Mobile Screen:** 1 day (simple scrollable text view)
- **Content:** Copy from web version
- **Total:** **1 day**

#### Priority: **P3 LOW**
**Reason:** Required for App Store submission and legal compliance, but not a user-facing feature.

---

### 6. 404 Not Found Page
**Web Implementation:** `web/src/pages/NotFound.tsx`
**Mobile Implementation:** ❌ Does not exist (React Navigation handles unknown routes differently)
**Backend Support:** N/A

#### Web Feature Details:
- Displays when user navigates to non-existent route
- Shows "Page not found" message
- Link back to home page

#### Implementation Effort:
- **Mobile:** Not applicable (React Navigation doesn't use 404 pages, handles unknown routes differently)
- **Total:** **0 days** (not needed for mobile)

#### Priority: **P4 NOT APPLICABLE**
**Reason:** React Navigation framework handles this differently. Not a feature gap.

---

## 🎯 Features in Mobile but NOT in Web

### 1. Batch Tailor
**Mobile Implementation:** `mobile/src/screens/BatchTailorScreen.tsx`
**Web Implementation:** ❌ Does not exist
**Backend Support:** ✅ `/tailoring/batch` endpoint exists

#### Feature Details:
- Upload multiple resumes at once
- Tailor all resumes to a single job description
- Batch processing with progress indicators
- Download all tailored resumes as zip file

#### Implementation Effort for Web:
- **Web Page:** 3-4 days
- **Total:** **3-4 days**

#### Priority: **P2 MEDIUM**
**Reason:** Nice-to-have feature for power users, but not critical for core workflow.

---

## Backend API Coverage Analysis

### Existing Backend Routes (12 modules)
1. ✅ `auth.py` - Authentication (Clerk JWT validation + 2FA)
2. ✅ `resumes.py` - Resume CRUD and upload
3. ✅ `resume_analysis.py` - Resume analysis and scoring
4. ✅ `tailoring.py` - Resume tailoring with Firecrawl + Perplexity
5. ✅ `jobs.py` - Job URL extraction and parsing
6. ✅ `interview_prep.py` - Interview prep dashboard (2274 lines - most complex)
7. ✅ `star_stories.py` - STAR story CRUD and variations
8. ✅ `career_path.py` - Career path wizard (840 lines)
9. ✅ `certifications.py` - Certification recommendations
10. ✅ `saved_comparisons.py` - Resume comparison storage
11. ✅ `admin.py` - Admin utilities
12. ✅ `__init__.py` - Route registration

### Missing Backend Routes (Required for Web Features)
1. ❌ **`applications.py`** - Application tracking CRUD (CRITICAL)
   - Endpoints needed:
     - `GET /applications` - List applications with optional status filter
     - `GET /applications/stats` - Get application statistics
     - `POST /applications` - Create new application
     - `PUT /applications/:id` - Update application
     - `DELETE /applications/:id` - Delete application
   - Database schema:
     ```sql
     CREATE TABLE applications (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR NOT NULL,
       job_title VARCHAR NOT NULL,
       company_name VARCHAR NOT NULL,
       job_url VARCHAR,
       status VARCHAR NOT NULL,  -- 'saved','applied','screening','interviewing','offer','accepted','rejected','withdrawn','no_response'
       applied_date DATE,
       notes TEXT,
       tailored_resume_id INTEGER REFERENCES resumes(id),
       salary_min INTEGER,
       salary_max INTEGER,
       location VARCHAR,
       contact_name VARCHAR,
       contact_email VARCHAR,
       next_follow_up DATE,
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
     );
     ```

2. ❌ **`cover_letters.py`** - Cover letter generation and management (CRITICAL)
   - Endpoints needed:
     - `GET /cover-letters` - List all cover letters
     - `POST /cover-letters` - Generate new cover letter
       - Parameters: job_title, company_name, tone, job_description OR job_url, base_resume_id (optional)
       - Uses OpenAI GPT-4 for generation
       - Uses Perplexity for company research
     - `PUT /cover-letters/:id` - Update cover letter content
     - `DELETE /cover-letters/:id` - Delete cover letter
     - `GET /cover-letters/:id/export` - Export as .docx file
   - Database schema:
     ```sql
     CREATE TABLE cover_letters (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR NOT NULL,
       tailored_resume_id INTEGER REFERENCES resumes(id),
       base_resume_id INTEGER REFERENCES resumes(id),
       job_title VARCHAR NOT NULL,
       company_name VARCHAR NOT NULL,
       tone VARCHAR NOT NULL,  -- 'professional','enthusiastic','conversational'
       content TEXT NOT NULL,
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
     );
     ```

---

## Implementation Roadmap

### Phase 1: Critical Features (P0) - 17-26 Days
**Goal:** Fix security vulnerability and add core features

1. **Authentication Migration (Clerk)** - 4-6 days
   - Install `@clerk/clerk-expo` package
   - Create SignIn/SignUp screens with iOS 26 Liquid Glass design
   - Update mobile API client to use Clerk JWT
   - Test authentication flow end-to-end
   - **Blocks:** All other mobile features (need auth first)

2. **Application Tracker (Backend)** - 2-3 days
   - Create `backend/app/routes/applications.py`
   - Database migration for applications table
   - Implement CRUD endpoints
   - Add status validation logic
   - Test with Postman/curl

3. **Application Tracker (Mobile)** - 5-8 days
   - Design iOS 26 Liquid Glass UI for application list
   - Create ApplicationTrackerScreen.tsx
   - Create AddEditApplicationModal.tsx
   - Implement status pipeline with visual indicators
   - Add search and filter functionality
   - Test CRUD operations

4. **Cover Letter Generator (Backend)** - 3-5 days
   - Create `backend/app/routes/cover_letters.py`
   - Database migration for cover_letters table
   - Integrate OpenAI GPT-4 for cover letter generation
   - Integrate Perplexity for company research
   - Implement .docx export using python-docx
   - Test generation with various inputs

5. **Cover Letter Generator (Mobile)** - 5-7 days
   - Design iOS 26 Liquid Glass UI for generator form
   - Create CoverLetterGeneratorScreen.tsx
   - Implement dual input method (text vs URL)
   - Add URL extraction flow with Firecrawl
   - Create cover letter list + detail view
   - Add inline editing and export functionality
   - Test generation end-to-end

**Phase 1 Total:** 19-29 days (4-6 weeks)

---

### Phase 2: Legal & Compliance (P3) - 2 Days
**Goal:** App Store submission requirements

1. **Privacy Policy Screen** - 1 day
   - Create PrivacyPolicyScreen.tsx
   - Copy content from web version
   - Style with iOS 26 Liquid Glass scrollable text view

2. **Terms of Service Screen** - 1 day
   - Create TermsOfServiceScreen.tsx
   - Copy content from web version
   - Style with iOS 26 Liquid Glass scrollable text view

**Phase 2 Total:** 2 days (0.5 weeks)

---

### Phase 3: Optional Web Backport (P2) - 3-4 Days
**Goal:** Add mobile-exclusive feature to web

1. **Batch Tailor (Web)** - 3-4 days
   - Create web/src/pages/BatchTailor.tsx
   - Implement multi-file upload UI
   - Add batch processing with progress indicators
   - Add zip file download for bulk tailored resumes
   - Test with multiple file uploads

**Phase 3 Total:** 3-4 days (1 week)

---

## Technology Stack Differences

### Mobile (React Native + Expo)
```json
{
  "framework": "React Native 0.81.5",
  "buildTool": "Expo SDK 54.0.33",
  "navigation": "React Navigation 7.x (bottom tabs + stack)",
  "stateManagement": "Zustand 5.0.10 (not currently used)",
  "storage": "AsyncStorage + SecureStore",
  "designSystem": "iOS 26 Liquid Glass (BlurView, translucency, frosted glass)",
  "authentication": "UUID sessions (BROKEN - needs Clerk migration)",
  "fileHandling": "expo-document-picker + expo-file-system",
  "totalLines": 17193
}
```

### Web (React + Vite)
```json
{
  "framework": "React 19.2.3",
  "buildTool": "Vite 7.3.1",
  "navigation": "React Router DOM 7.12.0",
  "stateManagement": "Local useState (no global store)",
  "styling": "Tailwind CSS 4.1.18",
  "designSystem": "Custom gradient themes",
  "authentication": "Clerk (secure JWT tokens)",
  "fileHandling": "HTML5 File API",
  "totalLines": 11004
}
```

### Backend (FastAPI)
```json
{
  "framework": "FastAPI (async)",
  "language": "Python 3.11+",
  "database": "PostgreSQL (production) + SQLite (dev)",
  "orm": "SQLAlchemy",
  "authentication": "Dual mode: Clerk JWT OR X-User-Id header (BROKEN)",
  "aiIntegration": {
    "openai": "GPT-4 for content generation",
    "perplexity": "Web-grounded company research",
    "firecrawl": "Job URL extraction"
  },
  "deployment": "Railway (https://resume-ai-backend-production-3134.up.railway.app/)",
  "totalRoutes": 12
}
```

---

## Design Consistency Challenges

### iOS 26 Liquid Glass (Mobile)
**Key Characteristics:**
- Frosted glass blur effects (`BlurView` component)
- Translucent backgrounds with vibrancy
- Subtle shadows with soft edges
- Spring physics animations
- Native iOS components (SafeAreaView, ScrollView)
- Haptic feedback on interactions
- Bottom sheet modals
- Swipe gestures

**Example:**
```tsx
<BlurView intensity={20} tint="dark" style={styles.glassContainer}>
  <View style={styles.innerContent}>
    <Text style={styles.heading}>Application Tracker</Text>
  </View>
</BlurView>
```

### Tailwind CSS (Web)
**Key Characteristics:**
- Utility-first CSS classes
- Gradient backgrounds (`bg-gradient-to-br`)
- Hard shadows (`shadow-lg`)
- Hover states and transitions
- Responsive grid layouts
- Dark mode support via theme classes
- Modal overlays with backdrop blur

**Example:**
```tsx
<div className="glass rounded-2xl p-6 border border-theme-subtle hover:border-theme-muted transition-all">
  <h2 className="text-lg font-semibold text-theme">Application Tracker</h2>
</div>
```

### Consistency Strategy
**Principle:** Same features, platform-appropriate design

- ✅ **Mobile:** Use iOS 26 Liquid Glass for all new features
- ✅ **Web:** Use Tailwind CSS with existing design tokens
- ❌ **Don't:** Force iOS design on web or vice versa
- ✅ **Do:** Maintain consistent feature behavior across platforms
- ✅ **Do:** Use same data structures and API contracts
- ❌ **Don't:** Let design differences block feature parity

---

## API Client Analysis

### Mobile API Client
**File:** `mobile/src/api/client.ts`

**Current Methods (Verified):**
- Resume operations: listResumes, uploadResume, analyzeResume, getResumeSuggestions, deleteResume
- Tailoring: tailorResume, batchTailorResumes, getJobDetails, extractJobDetails
- Interview Prep: Full interview prep workflow (all endpoints)
- STAR Stories: Full CRUD + variations
- Career Path: Full wizard workflow
- Saved Comparisons: Full CRUD

**Missing Methods (Needed for P0 features):**
- ❌ `listApplications(status?: ApplicationStatus)` - NOT IN API CLIENT
- ❌ `getApplicationStats()` - NOT IN API CLIENT
- ❌ `createApplication(data)` - NOT IN API CLIENT
- ❌ `updateApplication(id, data)` - NOT IN API CLIENT
- ❌ `deleteApplication(id)` - NOT IN API CLIENT
- ❌ `listCoverLetters()` - NOT IN API CLIENT
- ❌ `generateCoverLetter(params)` - NOT IN API CLIENT
- ❌ `updateCoverLetter(id, data)` - NOT IN API CLIENT
- ❌ `deleteCoverLetter(id)` - NOT IN API CLIENT
- ❌ `exportCoverLetter(id, format)` - NOT IN API CLIENT

**Action Required:**
Once backend routes are created, add these methods to mobile API client (1-2 days of work).

---

## Testing Strategy

### Unit Testing
- ✅ Test mobile screens in isolation with mock data
- ✅ Test web pages with React Testing Library
- ✅ Test backend routes with pytest
- ✅ Test API client methods with mock fetch

### Integration Testing
- ✅ Test mobile → backend flow with real Railway backend
- ✅ Test web → backend flow with real Railway backend
- ✅ Test authentication flow (Clerk JWT) on both platforms
- ✅ Test file upload/download on both platforms

### Cross-Platform Validation
For each implemented feature:
- [ ] Mobile iOS works
- [ ] Web works
- [ ] Same data syncs via backend API
- [ ] No platform-specific bugs
- [ ] Loading states are smooth
- [ ] Success/failure messages are clear
- [ ] Error handling is consistent

### Manual QA Checklist (Per Feature)
- [ ] Feature appears in both mobile and web
- [ ] API calls return same data structure
- [ ] UI is platform-appropriate (Liquid Glass vs Tailwind)
- [ ] Error handling is consistent
- [ ] Loading states are smooth
- [ ] Success/failure messages are clear
- [ ] No console errors or warnings
- [ ] No memory leaks or performance issues
- [ ] Works offline (if applicable)
- [ ] Works with slow network

---

## Security Considerations

### Current Security Issues (from SECURITY_AUDIT_REPORT.md)

**CRITICAL (Score 9-10):**
1. ❌ **Broken Authentication** - Mobile UUID system has no validation
   - Current: `X-User-Id: user_abc123` accepted without verification
   - Risk: Any user can access any user's data
   - Fix: Migrate to Clerk (included in Phase 1)

**HIGH (Score 7-8):**
2. ❌ **Missing Authorization** - Backend doesn't verify user ownership
   - Current: Backend trusts X-User-Id header
   - Risk: Data breach via header manipulation
   - Fix: Add ownership checks on all endpoints

3. ❌ **No Session Expiration** - Mobile sessions never expire
   - Current: UUID stored forever in localStorage
   - Risk: Stolen tokens valid indefinitely
   - Fix: Clerk tokens auto-expire (JWT exp claim)

### Security Requirements for New Features

**Application Tracker:**
- ✅ Verify user owns application before update/delete
- ✅ Sanitize job URL input (prevent XSS)
- ✅ Validate status enum values
- ✅ Prevent SQL injection in search queries

**Cover Letter Generator:**
- ✅ Rate limit generation endpoint (prevent abuse)
- ✅ Sanitize job URL input (prevent SSRF)
- ✅ Validate file uploads (max size, file type)
- ✅ Prevent prompt injection in job descriptions
- ✅ Sanitize exported .docx files (no embedded scripts)

**Authentication (Clerk):**
- ✅ Use HTTPS for all API calls
- ✅ Store JWT in SecureStore (encrypted storage)
- ✅ Never log JWT tokens
- ✅ Validate JWT signature on backend
- ✅ Check JWT expiration on every request
- ✅ Refresh tokens before expiration

---

## Performance Considerations

### Mobile Performance
- **Bundle Size:** Keep under 50MB for App Store
- **Network Requests:** Minimize API calls, use caching where possible
- **Image Loading:** Use progressive loading for resume previews
- **List Rendering:** Use FlatList with proper keyExtractor for long lists
- **Memory:** Avoid storing large files in memory, use file system

### Web Performance
- **Initial Load:** Code split routes to reduce bundle size
- **API Calls:** Debounce search inputs, use SWR for caching
- **Images:** Lazy load resume thumbnails
- **Animations:** Use CSS transforms instead of layout properties
- **Bundle Size:** Keep main bundle under 500KB

### Backend Performance
- **Database Queries:** Add indexes on user_id, status, created_at
- **API Caching:** Cache company research results (Perplexity is slow)
- **Rate Limiting:** 100 requests/minute per user
- **File Storage:** Use cloud storage (S3) for resumes and cover letters
- **Background Jobs:** Generate cover letters asynchronously (Celery/RQ)

---

## Timeline Estimates

### Optimistic (1 developer, no blockers)
- **Phase 1 (P0 Critical):** 17 days = 3.5 weeks
- **Phase 2 (P3 Legal):** 2 days = 0.5 weeks
- **Phase 3 (P2 Web Backport):** 3 days = 0.5 weeks
- **Total:** 22 days = **4.5 weeks (1 month)**

### Realistic (1 developer, some blockers)
- **Phase 1 (P0 Critical):** 26 days = 5 weeks
- **Phase 2 (P3 Legal):** 2 days = 0.5 weeks
- **Phase 3 (P2 Web Backport):** 4 days = 1 week
- **Total:** 32 days = **6.5 weeks (1.5 months)**

### Conservative (including testing, debugging, refactoring)
- **Phase 1 (P0 Critical):** 35 days = 7 weeks
- **Phase 2 (P3 Legal):** 3 days = 0.5 weeks
- **Phase 3 (P2 Web Backport):** 5 days = 1 week
- **Testing & QA:** 5 days = 1 week
- **Total:** 48 days = **9.5 weeks (2.5 months)**

**Recommendation:** Plan for **2 months** (realistic timeline with buffer).

---

## Risk Assessment

### High Risks
1. **Authentication Migration Complexity**
   - Risk: Clerk SDK may have iOS-specific integration challenges
   - Mitigation: Test Clerk integration in isolated branch first
   - Impact: Could delay Phase 1 by 1-2 weeks

2. **Backend Route Development**
   - Risk: Application tracker and cover letter routes are new, complex features
   - Mitigation: Create detailed API design doc before implementation
   - Impact: Could add 5-10 days if schema changes required

3. **iOS 26 Liquid Glass Design Complexity**
   - Risk: Complex UI components may not translate well to mobile
   - Mitigation: Simplify mobile UI, use bottom sheets instead of modals
   - Impact: Could add 2-3 days per complex screen

### Medium Risks
4. **API Client Synchronization**
   - Risk: Web and mobile API clients may diverge
   - Mitigation: Generate TypeScript types from OpenAPI spec
   - Impact: 1-2 days of merge conflicts

5. **File Upload Handling**
   - Risk: Mobile file pickers work differently than web
   - Mitigation: Use expo-document-picker with proper error handling
   - Impact: 1 day of debugging file upload issues

### Low Risks
6. **Testing Coverage**
   - Risk: New features may not have adequate test coverage
   - Mitigation: Write tests concurrently with implementation
   - Impact: 2-3 days at end of project

---

## Success Metrics

### Feature Parity Score
- **Current:** Mobile has 62.5% of web features (15 of 24 total features)
- **Phase 1 Target:** 87.5% (21 of 24 features)
- **Phase 2 Target:** 95.8% (23 of 24 features)
- **Phase 3 Target:** 100% (24 of 24 features)

### User Engagement (if live)
- Track feature usage on mobile vs web
- Measure conversion rate (sign up → generate resume → tailor → apply)
- Monitor application tracker usage (% of users who create applications)
- Monitor cover letter generator usage (% of users who generate cover letters)

### Code Quality
- Maintain consistent API client between mobile and web
- No duplicate business logic (backend handles all computation)
- Platform-appropriate UI patterns (Liquid Glass vs Tailwind)
- Test coverage >80% for new screens
- Zero critical security vulnerabilities

---

## Recommendations

### Immediate Actions (Next 2 Weeks)
1. **Start with Authentication Migration** (P0)
   - Fixes critical security vulnerability
   - Unblocks all other mobile features
   - Test Clerk SDK integration thoroughly

2. **Implement Application Tracker Backend** (P0)
   - Create database schema
   - Implement CRUD endpoints
   - Test with Postman before mobile implementation

3. **Design Mobile UI Mockups** (P0)
   - Create Figma/Sketch mockups for Application Tracker and Cover Letter Generator
   - Get stakeholder approval before implementation
   - Ensure iOS 26 Liquid Glass design consistency

### Short-Term Actions (Next 1 Month)
4. **Implement Application Tracker Mobile** (P0)
   - Follow approved mockups
   - Use iOS native components (SwiftUI-style)
   - Add comprehensive error handling

5. **Implement Cover Letter Generator Backend** (P0)
   - Integrate OpenAI GPT-4 for generation
   - Integrate Perplexity for company research
   - Add .docx export functionality

6. **Implement Cover Letter Generator Mobile** (P0)
   - Dual input method (text vs URL)
   - Resume integration (none/existing/upload)
   - List + detail view with editing

### Long-Term Actions (Next 2-3 Months)
7. **Add Legal Pages** (P3)
   - Privacy Policy and Terms of Service
   - Required for App Store submission

8. **Consider Web Backport** (P2)
   - Add Batch Tailor to web if user demand exists
   - Monitor mobile usage to validate demand

9. **Security Hardening** (P0)
   - Complete remaining items from SECURITY_AUDIT_REPORT.md
   - Add rate limiting, input sanitization, authorization checks
   - Conduct penetration testing before production launch

---

## Appendix: File References

### Mobile App
```
mobile/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx (571 lines)
│   │   ├── UploadResumeScreen.tsx (378 lines)
│   │   ├── TailorResumeScreen.tsx (1047 lines)
│   │   ├── BatchTailorScreen.tsx (456 lines)
│   │   ├── InterviewPrepListScreen.tsx (432 lines)
│   │   ├── InterviewPrepScreen.tsx (2134 lines - MOST COMPLEX)
│   │   ├── CommonQuestionsScreen.tsx (589 lines)
│   │   ├── PracticeQuestionsScreen.tsx (678 lines)
│   │   ├── BehavioralTechnicalQuestionsScreen.tsx (934 lines)
│   │   ├── STARStoryBuilderScreen.tsx (1123 lines)
│   │   ├── StarStoriesScreen.tsx (567 lines)
│   │   ├── CareerPathDesignerScreen.tsx (1834 lines)
│   │   ├── CertificationsScreen.tsx (445 lines)
│   │   ├── SavedComparisonsScreen.tsx (512 lines)
│   │   └── SettingsScreen.tsx (289 lines)
│   ├── navigation/
│   │   └── AppNavigator.tsx (290 lines)
│   ├── api/
│   │   └── client.ts (Full API client with 50+ methods)
│   └── utils/
│       └── userSession.ts (95 lines - SECURITY VULNERABILITY)
```

### Web App
```
web/
├── src/
│   ├── pages/
│   │   ├── Home.tsx (566 lines)
│   │   ├── UploadResume.tsx
│   │   ├── TailorResume.tsx (1087 lines - MOST COMPLEX)
│   │   ├── ApplicationTracker.tsx (395 lines) ⚠️ MOBILE MISSING
│   │   ├── InterviewPrepList.tsx
│   │   ├── InterviewPrep.tsx
│   │   ├── StarStoriesList.tsx
│   │   ├── CoverLetterGenerator.tsx (773 lines) ⚠️ MOBILE MISSING
│   │   ├── SavedComparisons.tsx
│   │   ├── CareerPathDesigner.tsx
│   │   ├── Settings.tsx
│   │   ├── SignIn.tsx (32 lines) ⚠️ MOBILE MISSING
│   │   ├── SignUp.tsx (32 lines) ⚠️ MOBILE MISSING
│   │   ├── PrivacyPolicy.tsx ⚠️ MOBILE MISSING
│   │   ├── TermsOfService.tsx ⚠️ MOBILE MISSING
│   │   └── NotFound.tsx (N/A for mobile)
│   ├── components/
│   │   ├── CommonInterviewQuestions.tsx
│   │   ├── BehavioralTechnicalQuestions.tsx
│   │   └── STARStoryBuilder.tsx
│   ├── api/
│   │   └── client.ts (Same API client as mobile)
│   └── utils/
│       └── userSession.ts (95 lines - session management)
```

### Backend
```
backend/
├── app/
│   ├── routes/
│   │   ├── auth.py (393 lines - Authentication + 2FA)
│   │   ├── resumes.py (Resume CRUD + upload)
│   │   ├── resume_analysis.py (Analysis + scoring)
│   │   ├── tailoring.py (650 lines - Firecrawl + Perplexity)
│   │   ├── jobs.py (Job URL parsing)
│   │   ├── interview_prep.py (2274 lines - MOST COMPLEX)
│   │   ├── star_stories.py (793 lines - CRUD + variations)
│   │   ├── career_path.py (840 lines - Wizard orchestration)
│   │   ├── certifications.py (Certification recommendations)
│   │   ├── saved_comparisons.py (Comparison storage)
│   │   ├── admin.py (Admin utilities)
│   │   ├── applications.py ⚠️ DOES NOT EXIST (NEEDED)
│   │   └── cover_letters.py ⚠️ DOES NOT EXIST (NEEDED)
│   ├── middleware/
│   │   ├── auth.py (108 lines - BROKEN DUAL AUTH)
│   │   ├── security_headers.py (115 lines)
│   │   └── waf.py (119 lines - Weak WAF)
│   └── database.py (SQL injection vulnerability on line 69, 75)
```

---

## Conclusion

The mobile app is **missing 6 major features** that exist in the web app, but more critically, the **backend is missing 2 route modules** required to support the most important features (Application Tracker and Cover Letter Generator).

Additionally, the mobile app has a **critical security vulnerability** in its authentication system that must be fixed before production deployment.

**Priority Actions:**
1. Fix authentication (migrate to Clerk) - **4-6 days**
2. Build Application Tracker backend + mobile - **7-11 days**
3. Build Cover Letter Generator backend + mobile - **8-12 days**
4. Add legal pages (Privacy/Terms) - **2 days**

**Total Effort:** 21-31 days (4-6 weeks) for full feature parity

**Status:** Ready for implementation. Recommend starting with authentication migration immediately.

---

**Last Updated:** February 11, 2026
**Next Review:** After Phase 1 completion
