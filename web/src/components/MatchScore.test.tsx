import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MatchScore from './MatchScore'

const mockMatchScore = {
  overall_score: 85,
  grade: 'Very Good',
  category_scores: {
    skills_match: 90,
    experience_relevance: 80,
    keyword_optimization: 85,
    role_alignment: 85,
  },
  strengths: [
    'Strong technical skills alignment',
    'Relevant experience in similar roles',
    'Good keyword optimization',
  ],
  gaps: [
    'Limited leadership experience',
    'Missing some specific certifications',
  ],
  improvements: [
    {
      suggestion: 'Add more leadership examples',
      priority: 'high' as const,
      potential_score_gain: 5,
      rationale: 'Leadership experience is highly valued for this role',
    },
    {
      suggestion: 'Include relevant certifications',
      priority: 'medium' as const,
      potential_score_gain: 3,
      rationale: 'Certifications demonstrate commitment to professional development',
    },
  ],
  explanation: 'Your resume shows strong alignment with the job requirements...',
}

describe('MatchScore Component', () => {
  describe('Loading State', () => {
    it('should display loading spinner when loading is true', () => {
      render(<MatchScore matchScore={null} loading={true} />)

      expect(screen.getByText(/calculating match score/i)).toBeInTheDocument()
      expect(screen.getByTestId('match-score')).toBeInTheDocument()
    })
  })

  describe('No Data State', () => {
    it('should display no data message when matchScore is null and not loading', () => {
      render(<MatchScore matchScore={null} loading={false} />)

      expect(screen.getByText(/no match score available/i)).toBeInTheDocument()
    })
  })

  describe('Match Score Display', () => {
    it('should render overall score correctly', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      const scoreValue = screen.getByTestId('match-score-value')
      expect(scoreValue).toHaveTextContent('85')
    })

    it('should display grade text', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      const grade = screen.getByTestId('match-score-grade')
      expect(grade).toHaveTextContent('Very Good')
    })

    it('should render progress bar with correct width', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      const progressBar = screen.getByTestId('match-score-bar')
      expect(progressBar).toHaveStyle({ width: '85%' })
    })

    it('should apply correct color class for high score', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      const scoreValue = screen.getByTestId('match-score-value')
      expect(scoreValue).toHaveClass('text-green-500')
    })

    it('should apply yellow color for medium score (60-79)', () => {
      const mediumScore = { ...mockMatchScore, overall_score: 65 }
      render(<MatchScore matchScore={mediumScore} loading={false} />)

      const scoreValue = screen.getByTestId('match-score-value')
      expect(scoreValue).toHaveClass('text-yellow-500')
    })

    it('should apply red color for low score (<60)', () => {
      const lowScore = { ...mockMatchScore, overall_score: 45 }
      render(<MatchScore matchScore={lowScore} loading={false} />)

      const scoreValue = screen.getByTestId('match-score-value')
      expect(scoreValue).toHaveClass('text-red-500')
    })

    it('should clamp scores to 0-100 range', () => {
      const invalidScore = { ...mockMatchScore, overall_score: 150 }
      render(<MatchScore matchScore={invalidScore} loading={false} />)

      const scoreValue = screen.getByTestId('match-score-value')
      expect(scoreValue).toHaveTextContent('100')
    })
  })

  describe('Category Scores', () => {
    it('should render all category scores', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      expect(screen.getByTestId('category-score-skills_match')).toHaveTextContent('90/100')
      expect(screen.getByTestId('category-score-experience_relevance')).toHaveTextContent('80/100')
      expect(screen.getByTestId('category-score-keyword_optimization')).toHaveTextContent('85/100')
      expect(screen.getByTestId('category-score-role_alignment')).toHaveTextContent('85/100')
    })

    it('should format category labels correctly', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      expect(screen.getByText('Skills Match')).toBeInTheDocument()
      expect(screen.getByText('Experience Relevance')).toBeInTheDocument()
      expect(screen.getByText('Keyword Optimization')).toBeInTheDocument()
      expect(screen.getByText('Role Alignment')).toBeInTheDocument()
    })
  })

  describe('Strengths Section', () => {
    it('should render all strengths', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      expect(screen.getByText('Strong technical skills alignment')).toBeInTheDocument()
      expect(screen.getByText('Relevant experience in similar roles')).toBeInTheDocument()
      expect(screen.getByText('Good keyword optimization')).toBeInTheDocument()
    })

    it('should show all strength items with checkmarks', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      const strengthItems = screen.getAllByTestId('strength-item')
      expect(strengthItems).toHaveLength(3)
    })

    it('should display no strengths message when empty', () => {
      const noStrengths = { ...mockMatchScore, strengths: [] }
      render(<MatchScore matchScore={noStrengths} loading={false} />)

      expect(screen.getByText('No strengths identified.')).toBeInTheDocument()
    })
  })

  describe('Gaps Section', () => {
    it('should render all gaps', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      expect(screen.getByText('Limited leadership experience')).toBeInTheDocument()
      expect(screen.getByText('Missing some specific certifications')).toBeInTheDocument()
    })

    it('should show all gap items with warning icons', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      const gapItems = screen.getAllByTestId('gap-item')
      expect(gapItems).toHaveLength(2)
    })

    it('should not render gaps section when empty', () => {
      const noGaps = { ...mockMatchScore, gaps: [] }
      render(<MatchScore matchScore={noGaps} loading={false} />)

      expect(screen.queryByTestId('match-gaps')).not.toBeInTheDocument()
    })
  })

  describe('Improvement Suggestions', () => {
    it('should render all improvement suggestions', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      expect(screen.getByText('Add more leadership examples')).toBeInTheDocument()
      expect(screen.getByText('Include relevant certifications')).toBeInTheDocument()
    })

    it('should display priority badges correctly', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      const priorityBadges = screen.getAllByTestId('suggestion-priority')
      expect(priorityBadges[0]).toHaveTextContent('high priority')
      expect(priorityBadges[1]).toHaveTextContent('medium priority')
    })

    it('should show potential score gains', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      const gains = screen.getAllByTestId('potential-gain')
      expect(gains[0]).toHaveTextContent('+5 points')
      expect(gains[1]).toHaveTextContent('+3 points')
    })

    it('should display rationale for each suggestion', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      expect(screen.getByText('Leadership experience is highly valued for this role')).toBeInTheDocument()
      expect(screen.getByText('Certifications demonstrate commitment to professional development')).toBeInTheDocument()
    })

    it('should show no recommendations message when empty', () => {
      const noImprovements = { ...mockMatchScore, improvements: [] }
      render(<MatchScore matchScore={noImprovements} loading={false} />)

      expect(screen.getByText('No recommendations at this time.')).toBeInTheDocument()
    })
  })

  describe('Detailed Analysis', () => {
    it('should display the explanation text', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      expect(screen.getByText(/your resume shows strong alignment/i)).toBeInTheDocument()
    })

    it('should render explanation in a dedicated section', () => {
      render(<MatchScore matchScore={mockMatchScore} loading={false} />)

      expect(screen.getByTestId('match-score-explanation')).toBeInTheDocument()
      expect(screen.getByText('Detailed Analysis')).toBeInTheDocument()
    })
  })
})
