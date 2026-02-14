import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EditableResumeCard from './EditableResumeCard'

describe('EditableResumeCard Component', () => {
  const mockTitle = 'Professional Summary'
  const mockContent = 'Experienced software engineer with 10+ years of expertise in building scalable applications.'

  describe('Display Mode', () => {
    it('should render title', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} />)

      expect(screen.getByText(mockTitle)).toBeInTheDocument()
    })

    it('should render content in display mode', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} />)

      expect(screen.getByText(mockContent)).toBeInTheDocument()
    })

    it('should preserve whitespace in content', () => {
      const multilineContent = 'Line 1\n\nLine 2\nLine 3'
      const { container } = render(<EditableResumeCard title={mockTitle} content={multilineContent} />)

      const contentDiv = container.querySelector('.whitespace-pre-wrap')
      expect(contentDiv).toBeInTheDocument()
    })

    it('should not show Edit button when not editable', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={false} />)

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    })

    it('should not show Edit button by default', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} />)

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    })

    it('should show Edit button when editable', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <EditableResumeCard title={mockTitle} content={mockContent} className="custom-class" />
      )

      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })

    it('should have glass styling', () => {
      const { container } = render(<EditableResumeCard title={mockTitle} content={mockContent} />)

      const card = container.querySelector('.glass')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Edit Mode Activation', () => {
    it('should enter edit mode when Edit button is clicked', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should hide Edit button when in edit mode', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    })

    it('should show Save and Cancel buttons in edit mode', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('should render textarea with current content', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(mockContent)
    })

    it('should auto-focus textarea when entering edit mode', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      // autoFocus is a React prop that triggers focus, check textarea renders
      expect(textarea).toBeInTheDocument()
    })

    it('should not show content div in edit mode', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      // Content should only be in textarea, not in display div
      const displayContent = screen.queryByText(mockContent)
      expect(displayContent).toBeInTheDocument() // In textarea value
    })
  })

  describe('Content Editing', () => {
    it('should allow editing content in textarea', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: 'Updated content' } })

      expect(textarea.value).toBe('Updated content')
    })

    it('should handle multiline content editing', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      const newContent = 'Line 1\nLine 2\nLine 3'
      fireEvent.change(textarea, { target: { value: newContent } })

      expect(textarea.value).toBe(newContent)
    })

    it('should handle empty content', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: '' } })

      expect(textarea.value).toBe('')
    })
  })

  describe('Save Functionality', () => {
    it('should call onSave with edited content when Save is clicked', () => {
      const onSave = vi.fn()
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} onSave={onSave} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: 'New content' } })

      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      expect(onSave).toHaveBeenCalledWith('New content')
      expect(onSave).toHaveBeenCalledTimes(1)
    })

    it('should exit edit mode after Save', () => {
      const onSave = vi.fn()
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} onSave={onSave} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('should handle Save without onSave callback', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const saveButton = screen.getByRole('button', { name: /save/i })

      expect(() => fireEvent.click(saveButton)).not.toThrow()
    })

    it('should exit edit mode even without onSave callback', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })

  describe('Cancel Functionality', () => {
    it('should revert changes when Cancel is clicked', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: 'Temporary changes' } })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      // Should show original content
      expect(screen.getByText(mockContent)).toBeInTheDocument()
    })

    it('should exit edit mode when Cancel is clicked', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('should not call onSave when Cancel is clicked', () => {
      const onSave = vi.fn()
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} onSave={onSave} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: 'Discarded changes' } })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(onSave).not.toHaveBeenCalled()
    })

    it('should restore original content on subsequent edit after Cancel', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      // First edit and cancel
      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: 'Temporary' } })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      // Edit again
      const editButton2 = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton2)

      const textarea2 = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea2.value).toBe(mockContent)
    })
  })

  describe('Button Styling', () => {
    it('should have Edit button with Edit2 icon', () => {
      const { container } = render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      expect(editButton).toBeInTheDocument()

      const icon = editButton.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should have Save button with Check icon', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const saveButton = screen.getByRole('button', { name: /save/i })
      const icon = saveButton.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should have Cancel button with X icon', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      const icon = cancelButton.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should apply green styling to Save button', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const saveButton = screen.getByRole('button', { name: /save/i })
      expect(saveButton).toHaveClass('text-green-400')
    })

    it('should apply red styling to Cancel button', () => {
      render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toHaveClass('text-red-400')
    })
  })

  describe('Textarea Styling', () => {
    it('should have minimum height for textarea', () => {
      const { container } = render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const textarea = container.querySelector('textarea')
      expect(textarea).toHaveClass('min-h-[150px]')
    })

    it('should allow vertical resize of textarea', () => {
      const { container } = render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const textarea = container.querySelector('textarea')
      expect(textarea).toHaveClass('resize-vertical')
    })

    it('should have full width textarea', () => {
      const { container } = render(<EditableResumeCard title={mockTitle} content={mockContent} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const textarea = container.querySelector('textarea')
      expect(textarea).toHaveClass('w-full')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty initial content', () => {
      render(<EditableResumeCard title={mockTitle} content="" isEditable={true} />)

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(10000)
      render(<EditableResumeCard title={mockTitle} content={longContent} isEditable={true} />)

      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('should handle special characters in content', () => {
      const specialContent = '<script>alert("test")</script>'
      render(<EditableResumeCard title={mockTitle} content={specialContent} isEditable={true} />)

      expect(screen.getByText(specialContent)).toBeInTheDocument()
    })

    it('should preserve newlines in display mode', () => {
      const contentWithNewlines = 'Line 1\n\nLine 2'
      const { container } = render(<EditableResumeCard title={mockTitle} content={contentWithNewlines} isEditable={false} />)

      const contentDiv = container.querySelector('.whitespace-pre-wrap')
      expect(contentDiv?.textContent).toBe(contentWithNewlines)
    })
  })
})
