# UI Feature Parity Report: Web vs Mobile

**Generated:** February 20, 2026
**Backend Parity:** ✅ 100% (7/7 API modules unified)
**Frontend Parity:** 🔍 Analysis below

---

## Screen/Page Comparison

### ✅ Features Present in BOTH Apps (17)

| Feature | Web Page | Mobile Screen | Status |
|---------|----------|---------------|--------|
| Home/Dashboard | `Home.tsx` | `HomeScreen.tsx` | ✅ Both |
| Upload Resume | `UploadResume.tsx` | `UploadResumeScreen.tsx` | ✅ Both |
| Tailor Resume | `TailorResume.tsx` | `TailorResumeScreen.tsx` | ✅ Both |
| Batch Tailor | `BatchTailor.tsx` | `BatchTailorScreen.tsx` | ✅ Both |
| Interview Prep Detail | `InterviewPrep.tsx` | `InterviewPrepScreen.tsx` | ✅ Both |
| Interview Prep List | `InterviewPrepList.tsx` | `InterviewPrepListScreen.tsx` | ✅ Both |
| Career Path Designer | `CareerPathDesigner.tsx` | `CareerPathDesignerScreen.tsx` | ✅ Both |
| Application Tracker | `ApplicationTracker.tsx` | `ApplicationTrackerScreen.tsx` | ✅ Both |
| Cover Letter Generator | `CoverLetterGenerator.tsx` | `CoverLetterGeneratorScreen.tsx` | ✅ Both |
| STAR Stories | `StarStoriesList.tsx` | `StarStoriesScreen.tsx` | ✅ Both |
| Saved Comparisons | `SavedComparisons.tsx` | `SavedComparisonsScreen.tsx` | ✅ Both |
| Settings | `Settings.tsx` | `SettingsScreen.tsx` | ✅ Both |
| Sign In | `SignIn.tsx` | `SignInScreen.tsx` | ✅ Both |
| Sign Up | `SignUp.tsx` | `SignUpScreen.tsx` | ✅ Both |
| Privacy Policy | `PrivacyPolicy.tsx` | `PrivacyPolicyScreen.tsx` | ✅ Both |
| Terms of Service | `TermsOfService.tsx` | `TermsOfServiceScreen.tsx` | ✅ Both |

---

### ❌ Features MISSING from Mobile (6)

| Feature | Web Page | Mobile Status | Priority | Notes |
|---------|----------|---------------|----------|-------|
| **Job Search** | `JobSearch.tsx` | ❌ Missing | 🔴 HIGH | Job discovery/browsing |
| **Mock Interview** | `MockInterview.tsx` | ❌ Missing | 🔴 HIGH | AI-powered interview practice |
| **Resume Builder** | `ResumeBuilder.tsx` | ❌ Missing | 🟡 MEDIUM | Build resume from scratch |
| **Templates** | `Templates.tsx` | ❌ Missing | 🟡 MEDIUM | Resume templates gallery |
| **Pricing** | `Pricing.tsx` | ❌ Missing | 🟢 LOW | Can link to web |
| **404/Not Found** | `NotFound.tsx` | ❌ Missing | 🟢 LOW | Error handling |

---

### ➕ Features ONLY in Mobile (5)

These screens exist in mobile but not as separate pages in web (may be integrated differently):

| Feature | Mobile Screen | Web Status | Notes |
|---------|---------------|------------|-------|
| **Common Questions** | `CommonQuestionsScreen.tsx` | ⚠️ Part of InterviewPrep | Separated in mobile |
| **Behavioral/Technical Questions** | `BehavioralTechnicalQuestionsScreen.tsx` | ⚠️ Part of InterviewPrep | Separated in mobile |
| **Practice Questions** | `PracticeQuestionsScreen.tsx` | ⚠️ Part of InterviewPrep | Separated in mobile |
| **Certifications** | `CertificationsScreen.tsx` | ⚠️ Part of CareerPath | Separated in mobile |
| **STAR Story Builder** | `STARStoryBuilderScreen.tsx` | ⚠️ Part of StarStoriesList | Separated in mobile |

**Analysis:** Mobile has more granular navigation for interview prep features, while web combines them into fewer pages.

---

## Priority Implementation Plan

### 🔴 HIGH Priority (Must Have for Parity)

#### 1. Job Search Screen
**File:** `src/screens/JobSearchScreen.tsx`

**Features needed:**
- Job search with filters (title, location, remote)
- Integration with job scraping API (Firecrawl)
- Save job postings
- Quick tailor from job listing
- Recent/saved jobs list

**API endpoints (already available):**
```typescript
// Backend supports job extraction
tailorApi.extractJobDetails(url)
```

**Estimated effort:** 8-12 hours

---

#### 2. Mock Interview Screen
**File:** `src/screens/MockInterviewScreen.tsx`

**Features needed:**
- AI-powered mock interview simulation
- Record video/audio responses (React Native Camera/Audio)
- Real-time AI interviewer questions
- Response analysis and feedback
- Session history and progress tracking

**API endpoints needed:**
- `POST /api/v1/mock-interview/start` (may need backend implementation)
- `POST /api/v1/mock-interview/submit-response`
- `GET /api/v1/mock-interview/feedback/:id`

**Estimated effort:** 16-24 hours (includes backend if needed)

---

### 🟡 MEDIUM Priority (Nice to Have)

#### 3. Resume Builder Screen
**File:** `src/screens/ResumeBuilderScreen.tsx`

**Features needed:**
- Build resume from scratch (no upload)
- Section-by-section guided builder
- Real-time preview
- Export to PDF/DOCX
- Template selection

**Estimated effort:** 12-16 hours

---

#### 4. Templates Gallery Screen
**File:** `src/screens/TemplatesScreen.tsx`

**Features needed:**
- Browse resume templates
- Preview template
- Select template for resume builder
- Industry-specific templates

**Estimated effort:** 6-8 hours

---

### 🟢 LOW Priority (Optional)

#### 5. Pricing Screen
**File:** `src/screens/PricingScreen.tsx`

**Features needed:**
- Pricing tiers display
- Feature comparison table
- Subscribe/upgrade button (deep link to web or in-app purchase)

**Alternative:** Link to web pricing page

**Estimated effort:** 4-6 hours

---

#### 6. Not Found Screen
**File:** `src/screens/NotFoundScreen.tsx`

**Features needed:**
- 404 error message
- Navigate back to home
- Helpful suggestions

**Estimated effort:** 2-3 hours

---

## Navigation Updates Needed

After implementing missing screens, update:

**File:** `src/navigation/AppNavigator.tsx`

Add routes for:
```typescript
// Add to stack navigator
<Stack.Screen name="JobSearch" component={JobSearchScreen} />
<Stack.Screen name="MockInterview" component={MockInterviewScreen} />
<Stack.Screen name="ResumeBuilder" component={ResumeBuilderScreen} />
<Stack.Screen name="Templates" component={TemplatesScreen} />
<Stack.Screen name="Pricing" component={PricingScreen} />
<Stack.Screen name="NotFound" component={NotFoundScreen} />
```

Add to bottom tab navigator (if applicable):
```typescript
// Consider adding Job Search to main tabs
<Tab.Screen name="JobSearch" component={JobSearchScreen} />
```

---

## Backend API Gaps (if any)

Most features already have backend support since we unified the API. Potential gaps:

### Mock Interview Feature
**Status:** ⚠️ May need backend implementation

**Required endpoints:**
```typescript
POST   /api/v1/mock-interview/start
POST   /api/v1/mock-interview/submit-response
GET    /api/v1/mock-interview/feedback/:id
GET    /api/v1/mock-interview/sessions
DELETE /api/v1/mock-interview/:id
```

**Backend work:** 8-12 hours if not implemented

---

## Testing Checklist

After implementing missing screens:

### Job Search Screen
- [ ] Search for jobs by title/location
- [ ] Extract job details from URL
- [ ] Save job for later
- [ ] Navigate to tailor resume from job
- [ ] View saved/recent jobs

### Mock Interview Screen
- [ ] Start mock interview session
- [ ] Record video/audio response
- [ ] Receive AI-generated questions
- [ ] Get feedback on responses
- [ ] View session history

### Resume Builder Screen
- [ ] Create new resume from scratch
- [ ] Add/edit sections
- [ ] Preview resume in real-time
- [ ] Export to PDF/DOCX
- [ ] Save progress

### Templates Screen
- [ ] Browse templates gallery
- [ ] Preview template
- [ ] Select template for builder
- [ ] Filter by industry

### Pricing Screen
- [ ] Display pricing tiers
- [ ] Compare features
- [ ] Subscribe/upgrade flow

### Not Found Screen
- [ ] Display 404 error
- [ ] Navigate back to home
- [ ] Show helpful links

---

## Implementation Timeline

### Sprint 1 (Week 1): HIGH Priority
- ✅ Day 1-2: Job Search Screen (8-12 hrs)
- ✅ Day 3-5: Mock Interview Screen (16-24 hrs)

### Sprint 2 (Week 2): MEDIUM Priority
- ✅ Day 1-3: Resume Builder Screen (12-16 hrs)
- ✅ Day 4-5: Templates Screen (6-8 hrs)

### Sprint 3 (Week 3): LOW Priority + Polish
- ✅ Day 1: Pricing Screen (4-6 hrs)
- ✅ Day 1: Not Found Screen (2-3 hrs)
- ✅ Day 2-3: Navigation updates
- ✅ Day 4-5: Testing & bug fixes

**Total estimated effort:** 50-75 hours

---

## Current Parity Status

### Summary
- **Total screens in web:** 22
- **Total screens in mobile:** 21 (with 5 extra granular screens)
- **Screens present in both:** 17
- **Missing from mobile:** 6
- **Mobile-only screens:** 5

### Parity Percentage
- **Core features:** 17/22 = **77% parity**
- **High priority missing:** 2/22 = **9% gap**
- **Medium priority missing:** 2/22 = **9% gap**
- **Low priority missing:** 2/22 = **9% gap**

### After implementing HIGH priority screens:
- **Parity:** 19/22 = **86%**

### After implementing ALL missing screens:
- **Parity:** 22/22 = **100%** ✅

---

## Recommendations

### Quick Wins (1-2 days)
1. **Job Search Screen** - Reuses existing job extraction API
2. **Not Found Screen** - Simple error handling

### Major Features (1 week)
1. **Mock Interview Screen** - May require backend work
2. **Resume Builder Screen** - Complex but high value

### Optional Enhancements
1. **Pricing Screen** - Can link to web version initially
2. **Templates Screen** - Nice to have but not critical

---

## Next Steps

1. **Review this report** - Prioritize which screens to build first
2. **Backend audit** - Verify Mock Interview API exists or needs implementation
3. **Design screens** - Create UI mockups for missing screens
4. **Implement incrementally** - Start with HIGH priority screens
5. **Test thoroughly** - Ensure feature parity and quality

---

**Questions to answer:**
- Do you want 100% UI parity or just core features (HIGH priority)?
- Should we implement Mock Interview backend if missing?
- Do you want mobile-specific optimizations or pixel-perfect web clones?
- Timeline constraints - need this in 1 week, 1 month, or 3 months?

---

**Status:** 📊 Analysis Complete
**Current UI Parity:** 77% (17/22 core screens)
**Backend Parity:** ✅ 100% (API ready)
**Recommended Next Action:** Implement Job Search + Mock Interview screens
