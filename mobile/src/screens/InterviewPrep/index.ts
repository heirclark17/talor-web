/**
 * InterviewPrep Screen Module
 *
 * This directory contains the refactored InterviewPrepScreen components.
 *
 * REFACTORING PLAN
 * ================
 *
 * The original InterviewPrepScreen.tsx (4,086 lines) is being split into:
 *
 * 1. HOOKS
 *    - useInterviewPrepData.ts - State management and API calls
 *    - useExpandedSections.ts - Section expand/collapse state
 *    - useQuestionHandling.ts - Question-related actions
 *
 * 2. COMPONENTS (by section)
 *    - CompanyProfileSection.tsx - Company overview display
 *    - ValuesAndCultureSection.tsx - Values alignment display
 *    - StrategyAndNewsSection.tsx - Strategic themes and news
 *    - ReadinessScoreSection.tsx - Interview readiness metrics
 *    - QuickActionsBar.tsx - Bottom action buttons
 *    - PrepHeader.tsx - Screen header with back navigation
 *
 * 3. SHARED COMPONENTS
 *    - ExpandableSection.tsx - Reusable expandable card
 *    - LoadingSkeleton.tsx - Section-specific loading states
 *    - SectionError.tsx - Error display with retry
 *
 * 4. CONTAINER
 *    - InterviewPrepContainer.tsx - Main orchestration component
 *
 * MIGRATION PATH
 * ==============
 *
 * Phase 1 (COMPLETED):
 * - Created useInterviewPrepData hook
 * - Set up directory structure
 *
 * Phase 2 (TODO):
 * - Extract CompanyProfileSection
 * - Extract ValuesAndCultureSection
 * - Extract StrategyAndNewsSection
 *
 * Phase 3 (TODO):
 * - Extract ReadinessScoreSection
 * - Extract QuickActionsBar
 * - Create InterviewPrepContainer
 *
 * Phase 4 (TODO):
 * - Update navigation to use new container
 * - Remove old InterviewPrepScreen.tsx
 * - Add tests for each component
 *
 * CURRENT STATUS
 * ==============
 *
 * The original file remains in use while this refactor is in progress.
 * New development should use the modular components where available.
 */

// Hooks
export { useInterviewPrepData } from './useInterviewPrepData';
export type {
  InterviewPrepData,
  CompanyProfile,
  ValuesAndCulture,
  StrategyAndNews,
  UseInterviewPrepDataReturn,
} from './useInterviewPrepData';

// Re-export the original screen for backwards compatibility
// This will be removed once refactoring is complete
export { default } from '../InterviewPrepScreen';
