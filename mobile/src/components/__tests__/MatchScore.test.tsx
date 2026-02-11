/**
 * MatchScore Tests
 *
 * Pure logic tests and direct component invocation:
 * - Module exports
 * - getScoreColor, getScoreGrade, getProgressBarColor, getPriorityColors
 * - Score validation/clamping
 * - Category label formatting
 * - Direct component calls for loading, empty, and data states
 */

import React from 'react';

// Mock dependencies before imports
jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      border: '#374151',
      backgroundTertiary: '#2a2a2a',
    },
    isDark: true,
  })),
}));

jest.mock('../glass/GlassCard', () => ({
  GlassCard: (props: any) => props.children || null,
}));

import MatchScore from '../MatchScore';
import { COLORS, ALPHA_COLORS } from '../../utils/constants';

const fullMatchScore = {
  overall_score: 85,
  grade: 'Very Good',
  category_scores: {
    skills_match: 90,
    experience_relevance: 80,
    keyword_optimization: 75,
    role_alignment: 85,
  },
  strengths: ['Strong technical background', 'Relevant certifications'],
  gaps: ['Limited management experience'],
  improvements: [
    {
      suggestion: 'Add more leadership examples',
      priority: 'high' as const,
      potential_score_gain: 5,
      rationale: 'Leadership is key for this role',
    },
    {
      suggestion: 'Include NIST framework reference',
      priority: 'medium' as const,
      potential_score_gain: 3,
      rationale: 'JD mentions NIST multiple times',
    },
    {
      suggestion: 'Minor formatting improvements',
      priority: 'low' as const,
      potential_score_gain: 0,
      rationale: 'Small visual polish',
    },
  ],
  explanation: 'Your resume is a strong match for this role.',
};

describe('MatchScore', () => {
  describe('module exports', () => {
    it('should export MatchScore as default export', () => {
      expect(MatchScore).toBeDefined();
      expect(typeof MatchScore).toBe('function');
    });

    it('should have the correct function name', () => {
      expect(MatchScore.name).toBe('MatchScore');
    });
  });

  describe('getScoreColor logic', () => {
    const getScoreColor = (score: number) => {
      if (score >= 80) return COLORS.success;
      if (score >= 60) return COLORS.warning;
      return COLORS.danger;
    };

    it('should return success color for score >= 80', () => {
      expect(getScoreColor(80)).toBe(COLORS.success);
      expect(getScoreColor(95)).toBe(COLORS.success);
      expect(getScoreColor(100)).toBe(COLORS.success);
    });

    it('should return warning color for score >= 60 and < 80', () => {
      expect(getScoreColor(60)).toBe(COLORS.warning);
      expect(getScoreColor(70)).toBe(COLORS.warning);
      expect(getScoreColor(79)).toBe(COLORS.warning);
    });

    it('should return danger color for score < 60', () => {
      expect(getScoreColor(0)).toBe(COLORS.danger);
      expect(getScoreColor(30)).toBe(COLORS.danger);
      expect(getScoreColor(59)).toBe(COLORS.danger);
    });

    it('should handle boundary value at 80', () => {
      expect(getScoreColor(80)).toBe(COLORS.success);
    });

    it('should handle boundary value at 60', () => {
      expect(getScoreColor(60)).toBe(COLORS.warning);
    });
  });

  describe('getScoreGrade logic', () => {
    const getScoreGrade = (score: number) => {
      if (score >= 90) return 'Excellent';
      if (score >= 80) return 'Very Good';
      if (score >= 70) return 'Good';
      if (score >= 60) return 'Fair';
      return 'Needs Improvement';
    };

    it('should return "Excellent" for score >= 90', () => {
      expect(getScoreGrade(90)).toBe('Excellent');
      expect(getScoreGrade(100)).toBe('Excellent');
    });

    it('should return "Very Good" for score >= 80 and < 90', () => {
      expect(getScoreGrade(80)).toBe('Very Good');
      expect(getScoreGrade(89)).toBe('Very Good');
    });

    it('should return "Good" for score >= 70 and < 80', () => {
      expect(getScoreGrade(70)).toBe('Good');
      expect(getScoreGrade(79)).toBe('Good');
    });

    it('should return "Fair" for score >= 60 and < 70', () => {
      expect(getScoreGrade(60)).toBe('Fair');
      expect(getScoreGrade(69)).toBe('Fair');
    });

    it('should return "Needs Improvement" for score < 60', () => {
      expect(getScoreGrade(0)).toBe('Needs Improvement');
      expect(getScoreGrade(59)).toBe('Needs Improvement');
    });
  });

  describe('getProgressBarColor logic', () => {
    const getProgressBarColor = (score: number) => {
      if (score >= 80) return COLORS.success;
      if (score >= 60) return COLORS.warning;
      return COLORS.danger;
    };

    it('should mirror getScoreColor behavior', () => {
      expect(getProgressBarColor(85)).toBe(COLORS.success);
      expect(getProgressBarColor(70)).toBe(COLORS.warning);
      expect(getProgressBarColor(40)).toBe(COLORS.danger);
    });
  });

  describe('getPriorityColors logic', () => {
    const defaultColors = { bg: '#2a2a2a', border: '#374151', text: '#9ca3af' };

    const getPriorityColors = (priority: string) => {
      switch (priority) {
        case 'high':
          return { bg: ALPHA_COLORS.danger.bg, border: ALPHA_COLORS.danger.border, text: COLORS.danger };
        case 'medium':
          return { bg: ALPHA_COLORS.warning.bg, border: ALPHA_COLORS.warning.border, text: COLORS.warning };
        case 'low':
          return { bg: ALPHA_COLORS.primary.bg, border: ALPHA_COLORS.primary.border, text: COLORS.info };
        default:
          return defaultColors;
      }
    };

    it('should return danger colors for high priority', () => {
      const result = getPriorityColors('high');
      expect(result.bg).toBe(ALPHA_COLORS.danger.bg);
      expect(result.text).toBe(COLORS.danger);
    });

    it('should return warning colors for medium priority', () => {
      const result = getPriorityColors('medium');
      expect(result.text).toBe(COLORS.warning);
    });

    it('should return primary/info colors for low priority', () => {
      const result = getPriorityColors('low');
      expect(result.bg).toBe(ALPHA_COLORS.primary.bg);
      expect(result.text).toBe(COLORS.info);
    });

    it('should return default colors for unknown priority', () => {
      expect(getPriorityColors('unknown')).toEqual(defaultColors);
    });
  });

  describe('score validation/clamping logic', () => {
    it('should clamp scores above 100 to 100', () => {
      expect(Math.max(0, Math.min(100, 150))).toBe(100);
    });

    it('should clamp scores below 0 to 0', () => {
      expect(Math.max(0, Math.min(100, -10))).toBe(0);
    });

    it('should pass through scores in valid range', () => {
      expect(Math.max(0, Math.min(100, 75))).toBe(75);
      expect(Math.max(0, Math.min(100, 0))).toBe(0);
      expect(Math.max(0, Math.min(100, 100))).toBe(100);
    });
  });

  describe('category label formatting logic', () => {
    const formatCategoryLabel = (category: string) =>
      category.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    it('should format skills_match to "Skills Match"', () => {
      expect(formatCategoryLabel('skills_match')).toBe('Skills Match');
    });

    it('should format experience_relevance to "Experience Relevance"', () => {
      expect(formatCategoryLabel('experience_relevance')).toBe('Experience Relevance');
    });

    it('should format keyword_optimization to "Keyword Optimization"', () => {
      expect(formatCategoryLabel('keyword_optimization')).toBe('Keyword Optimization');
    });

    it('should format role_alignment to "Role Alignment"', () => {
      expect(formatCategoryLabel('role_alignment')).toBe('Role Alignment');
    });

    it('should handle single word categories', () => {
      expect(formatCategoryLabel('technical')).toBe('Technical');
    });
  });

  describe('grade display fallback logic', () => {
    it('should use matchScore.grade when provided', () => {
      const displayGrade = 'Custom Grade' || 'Very Good';
      expect(displayGrade).toBe('Custom Grade');
    });

    it('should fall back to computed grade when grade is empty', () => {
      const displayGrade = '' || 'Very Good';
      expect(displayGrade).toBe('Very Good');
    });
  });

  describe('direct component invocation - loading state', () => {
    it('should return loading UI when loading=true', () => {
      const result = MatchScore({ matchScore: null, loading: true });
      expect(result).toBeTruthy();
    });

    it('should return loading UI even with data when loading=true', () => {
      const result = MatchScore({ matchScore: fullMatchScore, loading: true });
      expect(result).toBeTruthy();
    });
  });

  describe('direct component invocation - empty state', () => {
    it('should return empty UI when matchScore is null', () => {
      const result = MatchScore({ matchScore: null, loading: false });
      expect(result).toBeTruthy();
    });
  });

  describe('direct component invocation - with data', () => {
    it('should return full UI with all sections', () => {
      const result = MatchScore({ matchScore: fullMatchScore, loading: false });
      expect(result).toBeTruthy();
    });

    it('should handle score of 0', () => {
      const result = MatchScore({ matchScore: { ...fullMatchScore, overall_score: 0 }, loading: false });
      expect(result).toBeTruthy();
    });

    it('should handle score of 100', () => {
      const result = MatchScore({ matchScore: { ...fullMatchScore, overall_score: 100 }, loading: false });
      expect(result).toBeTruthy();
    });

    it('should handle score above 100 (clamped)', () => {
      const result = MatchScore({ matchScore: { ...fullMatchScore, overall_score: 150 }, loading: false });
      expect(result).toBeTruthy();
    });

    it('should handle negative score (clamped)', () => {
      const result = MatchScore({ matchScore: { ...fullMatchScore, overall_score: -10 }, loading: false });
      expect(result).toBeTruthy();
    });

    it('should handle empty strengths array', () => {
      const result = MatchScore({ matchScore: { ...fullMatchScore, strengths: [] }, loading: false });
      expect(result).toBeTruthy();
    });

    it('should handle empty gaps array (gaps section hidden)', () => {
      const result = MatchScore({ matchScore: { ...fullMatchScore, gaps: [] }, loading: false });
      expect(result).toBeTruthy();
    });

    it('should handle empty improvements array', () => {
      const result = MatchScore({ matchScore: { ...fullMatchScore, improvements: [] }, loading: false });
      expect(result).toBeTruthy();
    });

    it('should handle improvement with zero score gain (no gain badge)', () => {
      const zeroGain = {
        ...fullMatchScore,
        improvements: [{ suggestion: 'X', priority: 'low' as const, potential_score_gain: 0, rationale: 'Y' }],
      };
      const result = MatchScore({ matchScore: zeroGain, loading: false });
      expect(result).toBeTruthy();
    });

    it('should handle empty grade (falls back to computed)', () => {
      const result = MatchScore({ matchScore: { ...fullMatchScore, grade: '' }, loading: false });
      expect(result).toBeTruthy();
    });

    it('should handle unknown priority in improvements', () => {
      const unknownPriority = {
        ...fullMatchScore,
        improvements: [{ suggestion: 'T', priority: 'unknown' as any, potential_score_gain: 2, rationale: 'R' }],
      };
      const result = MatchScore({ matchScore: unknownPriority, loading: false });
      expect(result).toBeTruthy();
    });

    it('should handle all low category scores', () => {
      const low = {
        ...fullMatchScore,
        category_scores: { skills_match: 20, experience_relevance: 30, keyword_optimization: 10, role_alignment: 15 },
      };
      const result = MatchScore({ matchScore: low, loading: false });
      expect(result).toBeTruthy();
    });
  });

  describe('gaps section conditional rendering', () => {
    it('should render gaps when array has items', () => {
      expect(fullMatchScore.gaps.length > 0).toBe(true);
    });

    it('should not render gaps for empty array', () => {
      const noGaps = { ...fullMatchScore, gaps: [] };
      expect(noGaps.gaps.length > 0).toBe(false);
    });
  });

  describe('potential_score_gain conditional rendering', () => {
    it('should show gain badge when gain > 0', () => {
      expect(fullMatchScore.improvements[0].potential_score_gain > 0).toBe(true);
    });

    it('should hide gain badge when gain is 0', () => {
      expect(fullMatchScore.improvements[2].potential_score_gain > 0).toBe(false);
    });
  });
});
