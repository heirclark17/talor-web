# ESLint Fixes Guide

This document provides actionable steps to address the 361 ESLint warnings detected in the codebase.

---

## Quick Fix: Auto-fixable Issues (Estimated: 200+ warnings)

Many unused imports can be automatically removed:

```bash
npx eslint . --ext .ts,.tsx --fix
```

This will automatically:
- Remove unused imports
- Fix code style issues
- Apply safe transformations

---

## Manual Fixes Required

### 1. React Hooks `exhaustive-deps` Warnings (15 issues)

These require careful review as they may cause bugs (stale closures, missing re-renders).

#### Files to Review:

**`src/components/OnboardingTour.tsx:153`**
```typescript
// BEFORE:
useCallback(() => {
  // uses handleComplete but not in deps
}, [currentStep])

// FIX: Add handleComplete to deps OR use ref
useCallback(() => {
  // ...
}, [currentStep, handleComplete])
```

**`src/components/PracticeSession.tsx:78`**
```typescript
// BEFORE:
useEffect(() => {
  // uses sectionTime.situation, task, action
}, [sectionTime.result])

// FIX: Include all used properties
useEffect(() => {
  // ...
}, [sectionTime.result, sectionTime.situation, sectionTime.task, sectionTime.action])

// OR: Use single sectionTime object
useEffect(() => {
  // ...
}, [sectionTime])
```

**`src/components/SkeletonLoader.tsx:38`**
```typescript
// Add shimmer to deps or use useRef for animation value
useEffect(() => {
  // ...
}, [shimmer]) // Add shimmer
```

**`src/screens/PracticeQuestionsScreen.tsx:86,92`**
```typescript
// Add load functions to deps
useEffect(() => {
  loadPracticeQuestions();
}, [interviewPrepId, loadPracticeQuestions])

useEffect(() => {
  loadPracticeHistory();
}, [interviewPrepId, loadPracticeHistory])
```

**`src/screens/STARStoryBuilderScreen.tsx:146,152`**
```typescript
// Add missing deps
useEffect(() => {
  // ...
}, [tailoredResumeId, interviewPrepId, loadExperiences, loadInterviewPrepContext, loadStoriesFromAPI])

useEffect(() => {
  // ...
}, [selectedTheme, /* other deps */])
```

**`src/screens/TailorResumeScreen.tsx:226,255`**
```typescript
// Add analysisData and loadAnalysis
useEffect(() => {
  if (!analysisData) {
    loadAnalysis();
  }
}, [selectedResumeId, analysisData, loadAnalysis])

// Add keywordsData and loadKeywords
useEffect(() => {
  if (!keywordsData) {
    loadKeywords();
  }
}, [selectedResumeId, keywordsData, loadKeywords])
```

---

### 2. Unused Variables (308 issues)

#### Strategy for Cleanup:

1. **Unused Imports** - Safe to remove:
   ```typescript
   // Remove these:
   import { RefreshCw } from 'lucide-react-native'; // Not used
   import { Dimensions } from 'react-native'; // Not used
   ```

2. **Unused Function Parameters** - Prefix with underscore:
   ```typescript
   // BEFORE:
   function Component({ interviewPrepId, jobTitle }) {
     // only uses interviewPrepId
   }

   // AFTER:
   function Component({ interviewPrepId, jobTitle: _jobTitle }) {
     // ESLint allows unused args starting with _
   }
   ```

3. **Unused Variables in Catch Blocks**:
   ```typescript
   // BEFORE:
   } catch (error) {
     console.error('Failed');
   }

   // AFTER:
   } catch (_error) {
     console.error('Failed');
   }
   ```

---

### 3. Unused Styles (32 issues)

**File:** `src/screens/InterviewPrepScreen.tsx`

Large sections of unused styles for strategy and executive cards:
- `styles.strategyText`
- `styles.strategyList`
- `styles.executiveCard`
- (30 more)

**Action:**
- If these styles are for future features, add a comment: `// TODO: Used in upcoming feature`
- If truly unused, remove them to reduce bundle size

**Quick Fix:**
```typescript
// Either use them or remove them:
const styles = StyleSheet.create({
  // Remove unused entries:
  // strategyText: { ... },  // UNUSED - delete
  // strategyList: { ... },  // UNUSED - delete
});
```

---

### 4. Non-null Assertions (6 issues)

These use the `!` operator which bypasses TypeScript null checking.

**Files:**
- `src/components/CareerPathCertifications.tsx:421`
- `src/components/CareerPlanResults.tsx:737,828`
- `src/components/CertificationRecommendations.tsx:504`
- `src/utils/validation.ts:207`

**Example Fix:**
```typescript
// BEFORE (unsafe):
const value = someObject.property!.nestedProperty;

// AFTER (safe):
const value = someObject.property?.nestedProperty;
// OR:
if (someObject.property) {
  const value = someObject.property.nestedProperty;
}
```

---

## Priority Fix Order

### 🔴 High Priority (Fix First):
1. **React Hooks exhaustive-deps** (15 issues)
   - May cause actual bugs
   - Estimated time: 30-45 minutes

### 🟡 Medium Priority (Fix During Refactoring):
2. **Non-null assertions** (6 issues)
   - Potential runtime errors
   - Estimated time: 15 minutes

3. **Unused styles** (32 issues)
   - Bundle size impact
   - Estimated time: 10 minutes

### 🟢 Low Priority (Optional):
4. **Unused imports** (200+ issues)
   - No runtime impact
   - Can be auto-fixed: `npx eslint --fix`
   - Estimated time: 5 minutes (automated)

5. **Unused variables** (100+ issues)
   - No runtime impact
   - Prefix with `_` or remove
   - Estimated time: 30 minutes

---

## Automated Fix Script

Create a script to fix safe issues automatically:

```bash
#!/bin/bash
# fix-eslint.sh

echo "Running ESLint auto-fix..."
npx eslint . --ext .ts,.tsx --fix

echo "Checking for remaining issues..."
npx eslint . --ext .ts,.tsx

echo "Done! Review the changes with git diff"
```

**Usage:**
```bash
chmod +x fix-eslint.sh
./fix-eslint.sh
```

**Then review changes:**
```bash
git diff
```

**If satisfied, commit:**
```bash
git add .
git commit -m "Fix ESLint warnings: remove unused imports and variables"
```

---

## Testing After Fixes

After making changes, always run:

```bash
# 1. TypeScript check
npx tsc --noEmit

# 2. Tests
npm test

# 3. ESLint
npx eslint . --ext .ts,.tsx

# 4. Start app and test manually
npm start
```

---

## ESLint Configuration Notes

The ESLint config (`eslint.config.js`) is configured to:
- Allow `any` types (for gradual typing)
- Allow inline styles (React Native pattern)
- Allow console logs (needed for debugging)
- Warn on unused variables (not error)
- Error on React Hooks violations

**To make ESLint stricter:**
Edit `eslint.config.js` and change:
```javascript
'@typescript-eslint/no-explicit-any': 'off',  // Change to 'warn' or 'error'
'@typescript-eslint/no-unused-vars': 'warn',  // Change to 'error'
```

---

## Summary

- **Total Warnings:** 361
- **Auto-fixable:** ~200 (55%)
- **Manual fixes required:** ~161 (45%)
- **Estimated total fix time:** 1.5 - 2 hours
- **Impact on functionality:** None (all warnings, no errors)

**Recommendation:**
Fix the 15 React Hooks issues first (30 minutes), then run auto-fix for the rest. The application will remain fully functional during and after fixes.
