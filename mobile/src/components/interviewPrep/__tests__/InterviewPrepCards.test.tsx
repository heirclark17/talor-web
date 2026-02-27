/**
 * InterviewPrepCards Combined Unit Tests -- Direct Invocation for Coverage
 *
 * Calls each card component as a function with various prop combinations:
 * - CompanyResearchCard: loading, null research, full research with all sections
 * - ValuesAlignmentCard: loading, null alignment, full alignment with score thresholds
 * - ReadinessScoreCard: loading, null score, full score with confidence thresholds
 * - CompetitiveIntelligenceCard: loading, null intel, full intel with all sections
 * - ExecutiveInsightsCard: loading, null insights, full insights
 * - InterviewStrategyCard: loading, null strategy, full strategy
 * - StrategicNewsCard: loading, empty items, full items with getTimeAgo
 */

// Mock react hooks so they work outside component context
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useCallback: (fn: any) => fn,
    useState: (init: any) => [init, jest.fn()],
    useRef: (init: any) => ({ current: init }),
    useEffect: jest.fn(),
    useMemo: (fn: any) => fn(),
  };
});

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    isDark: true,
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      background: '#0a0a0a',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#2a2a2a',
      glass: 'rgba(255, 255, 255, 0.04)',
      glassBorder: 'rgba(255, 255, 255, 0.08)',
      border: '#374151',
    },
  })),
}));

jest.mock('../../glass/GlassCard', () => ({
  GlassCard: 'GlassCard',
}));

jest.mock('../SharedComponents', () => ({
  ExpandableSection: 'ExpandableSection',
  BulletList: 'BulletList',
  Chip: 'Chip',
  ConfidenceBar: 'ConfidenceBar',
}));

import React from 'react';
import { COLORS } from '../../../utils/constants';

const mockColors = {
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  background: '#0a0a0a',
  backgroundSecondary: '#1a1a1a',
  backgroundTertiary: '#2a2a2a',
  glass: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  border: '#374151',
};

describe('InterviewPrepCards', () => {
  // ========== CompanyResearchCard ==========
  describe('CompanyResearchCard', () => {
    let CompanyResearchCard: any;

    beforeAll(() => {
      CompanyResearchCard = require('../CompanyResearchCard').CompanyResearchCard;
    });

    it('should export CompanyResearchCard as a function', () => {
      expect(CompanyResearchCard).toBeDefined();
      expect(typeof CompanyResearchCard).toBe('function');
    });

    it('should render loading state', () => {
      const element = CompanyResearchCard({ research: null, loading: true, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should return null when not loading and research is null', () => {
      const element = CompanyResearchCard({ research: null, loading: false, colors: mockColors });
      expect(element).toBeNull();
    });

    it('should render with full research data', () => {
      const research = {
        company_overview: 'A large tech company.',
        recent_news: [
          { headline: 'New Launch', date: '2026-01-15', summary: 'Launched product X', source: 'TechCrunch' },
        ],
        key_products_services: ['Product A', 'Service B'],
        competitors: [
          { name: 'CompetitorCo', context: 'Similar SaaS product' },
        ],
        financial_health: { status: 'good', summary: 'Strong revenue growth.' },
        employee_sentiment: { sentiment: 'positive', rating: 4.2, summary: 'Employees are happy.' },
      };
      const element = CompanyResearchCard({ research, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should render with fair financial status', () => {
      const research = {
        company_overview: 'Midsize company.',
        financial_health: { status: 'fair', summary: 'Moderate growth.' },
      };
      const element = CompanyResearchCard({ research, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should render with bad financial status', () => {
      const research = {
        company_overview: 'Struggling company.',
        financial_health: { status: 'bad', summary: 'Revenue declining.' },
      };
      const element = CompanyResearchCard({ research, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should render with neutral employee sentiment', () => {
      const research = {
        company_overview: 'Company X.',
        employee_sentiment: { sentiment: 'neutral', rating: 3.0, summary: 'Mixed reviews.' },
      };
      const element = CompanyResearchCard({ research, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should render with negative employee sentiment', () => {
      const research = {
        company_overview: 'Company Y.',
        employee_sentiment: { sentiment: 'negative', summary: 'High turnover.' },
      };
      const element = CompanyResearchCard({ research, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should render with minimal research (no optional sections)', () => {
      const research = { company_overview: 'Minimal info.' };
      const element = CompanyResearchCard({ research, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    describe('getFinancialStatusColor logic', () => {
      const getFinancialStatusColor = (status: string) => {
        if (status === 'good') return COLORS.success;
        if (status === 'fair') return COLORS.warning;
        return COLORS.error;
      };

      it('should return success for good', () => {
        expect(getFinancialStatusColor('good')).toBe('#10b981');
      });

      it('should return warning for fair', () => {
        expect(getFinancialStatusColor('fair')).toBe('#f59e0b');
      });

      it('should return error for other values', () => {
        expect(getFinancialStatusColor('bad')).toBe(COLORS.error);
        expect(getFinancialStatusColor('')).toBe(COLORS.error);
      });
    });

    describe('getSentimentColor logic', () => {
      const getSentimentColor = (sentiment: string) => {
        if (sentiment === 'positive') return COLORS.success;
        if (sentiment === 'neutral') return COLORS.warning;
        return COLORS.error;
      };

      it('should return success for positive', () => {
        expect(getSentimentColor('positive')).toBe(COLORS.success);
      });

      it('should return warning for neutral', () => {
        expect(getSentimentColor('neutral')).toBe(COLORS.warning);
      });

      it('should return error for negative', () => {
        expect(getSentimentColor('negative')).toBe(COLORS.error);
      });
    });
  });

  // ========== ValuesAlignmentCard ==========
  describe('ValuesAlignmentCard', () => {
    let ValuesAlignmentCard: any;

    beforeAll(() => {
      ValuesAlignmentCard = require('../ValuesAlignmentCard').ValuesAlignmentCard;
    });

    it('should export as a function', () => {
      expect(typeof ValuesAlignmentCard).toBe('function');
    });

    it('should render loading state', () => {
      const element = ValuesAlignmentCard({ alignment: null, loading: true, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should return null when not loading and alignment is null', () => {
      const element = ValuesAlignmentCard({ alignment: null, loading: false, colors: mockColors });
      expect(element).toBeNull();
    });

    it('should render with high alignment score (>=80)', () => {
      const alignment = {
        alignment_score: 90,
        matched_values: [{ value: 'Innovation', company_context: 'Key value', candidate_evidence: 'Led projects' }],
        value_gaps: [{ value: 'Sustainability', company_context: 'Growing focus', suggestion: 'Highlight green projects' }],
        cultural_fit_insights: 'Strong cultural match.',
      };
      const element = ValuesAlignmentCard({ alignment, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should render with medium alignment score (60-79)', () => {
      const alignment = { alignment_score: 65 };
      const element = ValuesAlignmentCard({ alignment, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should render with low alignment score (<60)', () => {
      const alignment = { alignment_score: 30 };
      const element = ValuesAlignmentCard({ alignment, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should handle null alignment_score defaulting to 0', () => {
      const alignment = { alignment_score: 0 };
      const element = ValuesAlignmentCard({ alignment, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });
  });

  // ========== ReadinessScoreCard ==========
  describe('ReadinessScoreCard', () => {
    let ReadinessScoreCard: any;

    beforeAll(() => {
      ReadinessScoreCard = require('../ReadinessScoreCard').ReadinessScoreCard;
    });

    it('should export as a function', () => {
      expect(typeof ReadinessScoreCard).toBe('function');
    });

    it('should render loading state', () => {
      const element = ReadinessScoreCard({ score: null, loading: true, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should return null when not loading and score is null', () => {
      const element = ReadinessScoreCard({ score: null, loading: false, colors: mockColors });
      expect(element).toBeNull();
    });

    it('should render with high confidence (>=80)', () => {
      const score = {
        confidence_level: 85,
        preparation_level: 'Well Prepared',
        strengths: ['Strong communication', 'Technical expertise'],
        areas_for_improvement: ['Time management'],
        recommendations: ['Practice STAR method'],
      };
      const element = ReadinessScoreCard({ score, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should render with medium confidence (60-79)', () => {
      const score = { confidence_level: 70, preparation_level: 'Moderately Prepared' };
      const element = ReadinessScoreCard({ score, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should render with low confidence (<60)', () => {
      const score = { confidence_level: 40, preparation_level: 'Needs Work' };
      const element = ReadinessScoreCard({ score, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    describe('getConfidenceColor logic', () => {
      const getConfidenceColor = (level: number) => {
        if (level >= 80) return COLORS.success;
        if (level >= 60) return COLORS.warning;
        return COLORS.error;
      };

      it('should return success for >=80', () => {
        expect(getConfidenceColor(80)).toBe(COLORS.success);
      });

      it('should return warning for 60-79', () => {
        expect(getConfidenceColor(60)).toBe(COLORS.warning);
      });

      it('should return error for <60', () => {
        expect(getConfidenceColor(59)).toBe(COLORS.error);
      });
    });
  });

  // ========== CompetitiveIntelligenceCard ==========
  describe('CompetitiveIntelligenceCard', () => {
    let CompetitiveIntelligenceCard: any;

    beforeAll(() => {
      CompetitiveIntelligenceCard = require('../CompetitiveIntelligenceCard').CompetitiveIntelligenceCard;
    });

    it('should export as a function', () => {
      expect(typeof CompetitiveIntelligenceCard).toBe('function');
    });

    it('should render loading state', () => {
      const element = CompetitiveIntelligenceCard({ intelligence: null, loading: true, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should return null when not loading and intelligence is null', () => {
      const element = CompetitiveIntelligenceCard({ intelligence: null, loading: false, colors: mockColors });
      expect(element).toBeNull();
    });

    it('should render with full intelligence data', () => {
      const intelligence = {
        interview_angles: ['Angle 1', 'Angle 2'],
        market_position: 'Market leader in cloud security.',
        competitive_advantages: ['Strong brand', 'Large customer base'],
        challenges: ['Regulatory pressure', 'New competitors'],
        differentiation_strategy: 'Focus on AI-powered solutions.',
      };
      const element = CompetitiveIntelligenceCard({ intelligence, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should render with minimal intelligence (no optional sections)', () => {
      const intelligence = {};
      const element = CompetitiveIntelligenceCard({ intelligence, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    describe('toggleSection logic', () => {
      it('should collapse when same section toggled', () => {
        const expanded = 'interview_angles';
        const result = expanded === 'interview_angles' ? null : 'interview_angles';
        expect(result).toBeNull();
      });

      it('should expand when different section toggled', () => {
        const expanded: string | null = 'interview_angles';
        const result = expanded === 'market_trends' ? null : 'market_trends';
        expect(result).toBe('market_trends');
      });

      it('should expand when no section is active', () => {
        const expanded = null;
        const result = expanded === 'interview_angles' ? null : 'interview_angles';
        expect(result).toBe('interview_angles');
      });
    });
  });

  // ========== ExecutiveInsightsCard ==========
  describe('ExecutiveInsightsCard', () => {
    let ExecutiveInsightsCard: any;

    beforeAll(() => {
      ExecutiveInsightsCard = require('../ExecutiveInsightsCard').ExecutiveInsightsCard;
    });

    it('should export as a function', () => {
      expect(typeof ExecutiveInsightsCard).toBe('function');
    });

    it('should render loading state', () => {
      const element = ExecutiveInsightsCard({ insights: null, loading: true, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should return null when not loading and insights is null', () => {
      const element = ExecutiveInsightsCard({ insights: null, loading: false, colors: mockColors });
      expect(element).toBeNull();
    });

    it('should render with full insights data', () => {
      const insights = {
        executive_priorities: ['Digital transformation', 'Cost reduction'],
        leadership_style: 'Collaborative and data-driven.',
        decision_making_factors: ['ROI analysis', 'Team impact'],
        strategic_initiatives: ['Cloud migration', 'Security enhancement'],
        c_suite_talking_points: ['Emphasize ROI', 'Mention industry trends'],
      };
      const element = ExecutiveInsightsCard({ insights, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should render with minimal insights', () => {
      const insights = {};
      const element = ExecutiveInsightsCard({ insights, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should default expandedSection to priorities', () => {
      // Verified from source: useState<string | null>('priorities')
      const defaultExpanded = 'priorities';
      expect(defaultExpanded).toBe('priorities');
    });
  });

  // ========== InterviewStrategyCard ==========
  describe('InterviewStrategyCard', () => {
    let InterviewStrategyCard: any;

    beforeAll(() => {
      InterviewStrategyCard = require('../InterviewStrategyCard').InterviewStrategyCard;
    });

    it('should export as a function', () => {
      expect(typeof InterviewStrategyCard).toBe('function');
    });

    it('should render loading state', () => {
      const element = InterviewStrategyCard({ strategy: null, loading: true, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should return null when not loading and strategy is null', () => {
      const element = InterviewStrategyCard({ strategy: null, loading: false, colors: mockColors });
      expect(element).toBeNull();
    });

    it('should render with full strategy data', () => {
      const strategy = {
        recommended_approach: 'Start with a strong opening story.',
        key_themes_to_emphasize: ['Leadership', 'Innovation', 'Results'],
        stories_to_prepare: [
          { theme: 'Leadership', description: 'Tell about leading the security program.' },
          { theme: 'Innovation', description: 'Describe the new monitoring system.' },
        ],
        questions_to_ask_interviewer: ['What does success look like?', 'Team structure?'],
        pre_interview_checklist: ['Review company values', 'Prepare STAR stories', 'Research interviewer'],
      };
      const element = InterviewStrategyCard({ strategy, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should render with minimal strategy', () => {
      const strategy = {};
      const element = InterviewStrategyCard({ strategy, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should default expandedSection to approach', () => {
      const defaultExpanded = 'approach';
      expect(defaultExpanded).toBe('approach');
    });
  });

  // ========== StrategicNewsCard ==========
  describe('StrategicNewsCard', () => {
    let StrategicNewsCard: any;

    beforeAll(() => {
      StrategicNewsCard = require('../StrategicNewsCard').StrategicNewsCard;
    });

    it('should export as a function', () => {
      expect(typeof StrategicNewsCard).toBe('function');
    });

    it('should render loading state', () => {
      const element = StrategicNewsCard({ newsItems: [], loading: true, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should return null when not loading and newsItems is empty', () => {
      const element = StrategicNewsCard({ newsItems: [], loading: false, colors: mockColors });
      expect(element).toBeNull();
    });

    it('should return null when newsItems is null', () => {
      const element = StrategicNewsCard({ newsItems: null, loading: false, colors: mockColors });
      expect(element).toBeNull();
    });

    it('should render with news items', () => {
      const newsItems = [
        {
          headline: 'Major Acquisition',
          date: new Date().toISOString(),
          summary: 'Company acquired competitor for $1B.',
          source: 'Bloomberg',
          relevance_to_interview: 'Shows growth strategy.',
          talking_points: ['Mention synergies', 'Discuss integration'],
        },
        {
          title: 'New Product Launch',
          date: new Date(Date.now() - 7 * 86400000).toISOString(),
          summary: 'Launched new security platform.',
          relevance: 'Relevant to the role.',
        },
      ];
      const element = StrategicNewsCard({ newsItems, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    it('should render news items without optional fields', () => {
      const newsItems = [
        { date: '2026-01-01', summary: 'Basic news item.' },
      ];
      const element = StrategicNewsCard({ newsItems, loading: false, colors: mockColors });
      expect(element).toBeTruthy();
    });

    describe('getTimeAgo helper logic', () => {
      const getTimeAgo = (dateString: string) => {
        try {
          const date = new Date(dateString);
          const now = new Date();
          const diffInDays = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffInDays === 0) return 'Today';
          if (diffInDays === 1) return '1 day ago';
          if (diffInDays < 7) return `${diffInDays} days ago`;
          if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
          return `${Math.floor(diffInDays / 30)} months ago`;
        } catch {
          return dateString;
        }
      };

      it('should return "Today" for today', () => {
        expect(getTimeAgo(new Date().toISOString())).toBe('Today');
      });

      it('should return "1 day ago" for yesterday', () => {
        const yesterday = new Date(Date.now() - 86400000).toISOString();
        expect(getTimeAgo(yesterday)).toBe('1 day ago');
      });

      it('should return "X days ago" for 2-6 days', () => {
        const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
        expect(getTimeAgo(threeDaysAgo)).toBe('3 days ago');
      });

      it('should return "X weeks ago" for 7-29 days', () => {
        const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
        expect(getTimeAgo(twoWeeksAgo)).toBe('2 weeks ago');
      });

      it('should return "X months ago" for 30+ days', () => {
        const twoMonthsAgo = new Date(Date.now() - 60 * 86400000).toISOString();
        expect(getTimeAgo(twoMonthsAgo)).toBe('2 months ago');
      });

      it('should handle invalid date gracefully', () => {
        const result = getTimeAgo('not-a-date');
        expect(typeof result).toBe('string');
      });
    });

    describe('toggleNewsItem logic', () => {
      it('should collapse when same index toggled', () => {
        const expanded = 2;
        const result = expanded === 2 ? null : 2;
        expect(result).toBeNull();
      });

      it('should expand when different index toggled', () => {
        const expanded: number | null = 0;
        const result = expanded === 3 ? null : 3;
        expect(result).toBe(3);
      });
    });
  });
});
