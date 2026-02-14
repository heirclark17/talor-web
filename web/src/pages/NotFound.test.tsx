import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NotFound from './NotFound'

describe('NotFound Page', () => {
  const renderNotFound = () => {
    return render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    // Mock window.history.back
    vi.spyOn(window.history, 'back').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Content', () => {
    it('should render 404 heading', () => {
      renderNotFound()
      expect(screen.getByText('404')).toBeInTheDocument()
    })

    it('should render "Page Not Found" message', () => {
      renderNotFound()
      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    })

    it('should render error description', () => {
      renderNotFound()
      expect(screen.getByText(/The page you're looking for doesn't exist/)).toBeInTheDocument()
    })

    it('should render FileQuestion icon', () => {
      const { container } = renderNotFound()
      const icon = container.querySelector('.text-theme-tertiary')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should render "Go to Resumes" link', () => {
      renderNotFound()
      const resumesLink = screen.getByRole('link', { name: /go to resumes/i })
      expect(resumesLink).toBeInTheDocument()
      expect(resumesLink).toHaveAttribute('href', '/resumes')
    })

    it('should render "Go Back" button', () => {
      renderNotFound()
      const backButton = screen.getByRole('button', { name: /go back/i })
      expect(backButton).toBeInTheDocument()
    })

    it('should call window.history.back when "Go Back" clicked', () => {
      renderNotFound()
      const backButton = screen.getByRole('button', { name: /go back/i })
      fireEvent.click(backButton)
      expect(window.history.back).toHaveBeenCalled()
    })

    it('should have Home icon in "Go to Resumes" link', () => {
      renderNotFound()
      const resumesLink = screen.getByRole('link', { name: /go to resumes/i })
      expect(resumesLink).toBeInTheDocument()
    })

    it('should have ArrowLeft icon in "Go Back" button', () => {
      renderNotFound()
      const backButton = screen.getByRole('button', { name: /go back/i })
      expect(backButton).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should center content on screen', () => {
      const { container } = renderNotFound()
      const centerDiv = container.querySelector('.min-h-\\[80vh\\]')
      expect(centerDiv).toBeInTheDocument()
      expect(centerDiv).toHaveClass('flex', 'items-center', 'justify-center')
    })

    it('should have glass container for icon', () => {
      const { container } = renderNotFound()
      const glassDiv = container.querySelector('.glass')
      expect(glassDiv).toBeInTheDocument()
    })

    it('should have primary button styling on "Go to Resumes" link', () => {
      renderNotFound()
      const resumesLink = screen.getByRole('link', { name: /go to resumes/i })
      expect(resumesLink).toHaveClass('btn-primary')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderNotFound()
      const heading = screen.getByRole('heading', { name: '404' })
      expect(heading).toBeInTheDocument()
    })

    it('should have descriptive link text', () => {
      renderNotFound()
      expect(screen.getByRole('link', { name: /go to resumes/i })).toBeInTheDocument()
    })

    it('should have descriptive button text', () => {
      renderNotFound()
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
    })
  })
})
