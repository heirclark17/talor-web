import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EditableSkillsList from './EditableSkillsList'

const mockSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js']

describe('EditableSkillsList Component', () => {
  describe('Display Mode', () => {
    it('should render title', () => {
      render(<EditableSkillsList title="Technical Skills" skills={mockSkills} />)

      expect(screen.getByText('Technical Skills')).toBeInTheDocument()
    })

    it('should render all skills as badges', () => {
      render(<EditableSkillsList title="Skills" skills={mockSkills} />)

      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Node.js')).toBeInTheDocument()
    })

    it('should apply badge styling to skills', () => {
      render(<EditableSkillsList title="Skills" skills={['React']} />)

      const badge = screen.getByText('React')
      expect(badge).toHaveClass('rounded-full')
      expect(badge).toHaveClass('px-3')
      expect(badge).toHaveClass('py-1')
    })

    it('should not show Edit button when not editable', () => {
      render(<EditableSkillsList title="Skills" skills={mockSkills} isEditable={false} />)

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    })

    it('should show Edit button when editable', () => {
      render(<EditableSkillsList title="Skills" skills={mockSkills} isEditable={true} />)

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('should render empty state gracefully', () => {
      render(<EditableSkillsList title="Skills" skills={[]} />)

      expect(screen.getByText('Skills')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <EditableSkillsList title="Skills" skills={mockSkills} className="custom-class" />
      )

      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Edit Mode Activation', () => {
    it('should enter edit mode when Edit button is clicked', () => {
      render(<EditableSkillsList title="Skills" skills={mockSkills} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('should hide Edit button when in edit mode', () => {
      render(<EditableSkillsList title="Skills" skills={mockSkills} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    })

    it('should show input fields for each skill in edit mode', () => {
      render(<EditableSkillsList title="Skills" skills={mockSkills} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const inputs = screen.getAllByRole('textbox')
      // 4 skill inputs + 1 "Add new skill" input
      expect(inputs).toHaveLength(5)
    })

    it('should populate inputs with existing skills', () => {
      render(<EditableSkillsList title="Skills" skills={['React', 'TypeScript']} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveValue('React')
      expect(inputs[1]).toHaveValue('TypeScript')
    })
  })

  describe('Editing Skills', () => {
    it('should update skill value when input changes', () => {
      render(<EditableSkillsList title="Skills" skills={['React']} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const input = screen.getAllByRole('textbox')[0]
      fireEvent.change(input, { target: { value: 'Vue.js' } })

      expect(input).toHaveValue('Vue.js')
    })

    it('should allow editing multiple skills', () => {
      render(<EditableSkillsList title="Skills" skills={['React', 'TypeScript']} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: 'Angular' } })
      fireEvent.change(inputs[1], { target: { value: 'JavaScript' } })

      expect(inputs[0]).toHaveValue('Angular')
      expect(inputs[1]).toHaveValue('JavaScript')
    })
  })

  describe('Deleting Skills', () => {
    it('should show delete button for each skill in edit mode', () => {
      render(<EditableSkillsList title="Skills" skills={mockSkills} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const deleteButtons = screen.getAllByRole('button').filter(btn =>
        btn.querySelector('.lucide-trash-2')
      )
      expect(deleteButtons).toHaveLength(4)
    })

    it('should remove skill when delete button clicked', () => {
      render(<EditableSkillsList title="Skills" skills={['React', 'TypeScript', 'Node.js']} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const deleteButtons = screen.getAllByRole('button').filter(btn =>
        btn.querySelector('.lucide-trash-2')
      )

      // Delete the second skill (TypeScript)
      fireEvent.click(deleteButtons[1])

      const inputs = screen.getAllByRole('textbox')
      // Should have 2 skill inputs + 1 add new input
      expect(inputs).toHaveLength(3)
      expect(inputs[0]).toHaveValue('React')
      expect(inputs[1]).toHaveValue('Node.js')
    })

    it('should allow deleting all skills', () => {
      render(<EditableSkillsList title="Skills" skills={['React']} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const deleteButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('.lucide-trash-2')
      )

      if (deleteButton) {
        fireEvent.click(deleteButton)
      }

      const inputs = screen.getAllByRole('textbox')
      // Should only have the "Add new skill" input left
      expect(inputs).toHaveLength(1)
    })
  })

  describe('Adding Skills', () => {
    it('should show add skill input in edit mode', () => {
      render(<EditableSkillsList title="Skills" skills={mockSkills} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      expect(screen.getByPlaceholderText('Add new skill...')).toBeInTheDocument()
    })

    it('should add new skill when Plus button clicked', () => {
      render(<EditableSkillsList title="Skills" skills={['React']} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const addInput = screen.getByPlaceholderText('Add new skill...')
      fireEvent.change(addInput, { target: { value: 'Vue.js' } })

      const addButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('.lucide-plus')
      )

      if (addButton) {
        fireEvent.click(addButton)
      }

      const inputs = screen.getAllByRole('textbox')
      // Should have 2 skill inputs + 1 add new input
      expect(inputs).toHaveLength(3)
      expect(inputs[1]).toHaveValue('Vue.js')
    })

    it('should clear add input after adding skill', () => {
      render(<EditableSkillsList title="Skills" skills={['React']} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const addInput = screen.getByPlaceholderText('Add new skill...')
      fireEvent.change(addInput, { target: { value: 'Vue.js' } })

      const addButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('.lucide-plus')
      )

      if (addButton) {
        fireEvent.click(addButton)
      }

      expect(screen.getByPlaceholderText('Add new skill...')).toHaveValue('')
    })

    it('should add skill when Enter key pressed', () => {
      render(<EditableSkillsList title="Skills" skills={['React']} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const addInput = screen.getByPlaceholderText('Add new skill...')
      fireEvent.change(addInput, { target: { value: 'Angular' } })
      fireEvent.keyPress(addInput, { key: 'Enter', code: 13, charCode: 13 })

      const inputs = screen.getAllByRole('textbox')
      expect(inputs).toHaveLength(3) // 2 skills + 1 add input
    })

    it('should not add empty skill', () => {
      render(<EditableSkillsList title="Skills" skills={['React']} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const addInput = screen.getByPlaceholderText('Add new skill...')
      fireEvent.change(addInput, { target: { value: '   ' } })

      const addButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('.lucide-plus')
      )

      if (addButton) {
        fireEvent.click(addButton)
      }

      const inputs = screen.getAllByRole('textbox')
      // Should still only have 1 skill input + 1 add input
      expect(inputs).toHaveLength(2)
    })

    it('should trim whitespace when adding skill', () => {
      render(<EditableSkillsList title="Skills" skills={[]} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const addInput = screen.getByPlaceholderText('Add new skill...')
      fireEvent.change(addInput, { target: { value: '  TypeScript  ' } })

      const addButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('.lucide-plus')
      )

      if (addButton) {
        fireEvent.click(addButton)
      }

      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveValue('TypeScript')
    })
  })

  describe('Save Functionality', () => {
    it('should call onSave with edited skills when Save clicked', () => {
      const onSave = vi.fn()
      render(<EditableSkillsList title="Skills" skills={['React']} isEditable={true} onSave={onSave} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const input = screen.getAllByRole('textbox')[0]
      fireEvent.change(input, { target: { value: 'Vue.js' } })

      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      expect(onSave).toHaveBeenCalledWith(['Vue.js'])
    })

    it('should exit edit mode after saving', () => {
      const onSave = vi.fn()
      render(<EditableSkillsList title="Skills" skills={mockSkills} isEditable={true} onSave={onSave} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('should filter out empty skills when saving', () => {
      const onSave = vi.fn()
      render(<EditableSkillsList title="Skills" skills={['React', 'TypeScript']} isEditable={true} onSave={onSave} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[1], { target: { value: '   ' } })

      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      expect(onSave).toHaveBeenCalledWith(['React'])
    })

    it('should handle save without onSave callback', () => {
      render(<EditableSkillsList title="Skills" skills={mockSkills} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const saveButton = screen.getByRole('button', { name: /save/i })

      expect(() => fireEvent.click(saveButton)).not.toThrow()
    })

    it('should clear new skill input on save', () => {
      const onSave = vi.fn()
      render(<EditableSkillsList title="Skills" skills={['React']} isEditable={true} onSave={onSave} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const addInput = screen.getByPlaceholderText('Add new skill...')
      fireEvent.change(addInput, { target: { value: 'Incomplete skill' } })

      const saveButton = screen.getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      // Re-enter edit mode
      const editButtonAgain = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButtonAgain)

      // New skill input should be empty
      expect(screen.getByPlaceholderText('Add new skill...')).toHaveValue('')
    })
  })

  describe('Cancel Functionality', () => {
    it('should revert changes when Cancel clicked', () => {
      render(<EditableSkillsList title="Skills" skills={['React', 'TypeScript']} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: 'Changed' } })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      // Re-enter edit mode to check values
      const editButtonAgain = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButtonAgain)

      const inputsAfter = screen.getAllByRole('textbox')
      expect(inputsAfter[0]).toHaveValue('React')
      expect(inputsAfter[1]).toHaveValue('TypeScript')
    })

    it('should exit edit mode when Cancel clicked', () => {
      render(<EditableSkillsList title="Skills" skills={mockSkills} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('should clear new skill input on cancel', () => {
      render(<EditableSkillsList title="Skills" skills={['React']} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const addInput = screen.getByPlaceholderText('Add new skill...')
      fireEvent.change(addInput, { target: { value: 'Unsaved skill' } })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      // Re-enter edit mode
      const editButtonAgain = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButtonAgain)

      expect(screen.getByPlaceholderText('Add new skill...')).toHaveValue('')
    })

    it('should not call onSave when Cancel clicked', () => {
      const onSave = vi.fn()
      render(<EditableSkillsList title="Skills" skills={mockSkills} isEditable={true} onSave={onSave} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(onSave).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper input types', () => {
      render(<EditableSkillsList title="Skills" skills={['React']} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toHaveAttribute('type', 'text')
      })
    })

    it('should have placeholder on add skill input', () => {
      render(<EditableSkillsList title="Skills" skills={[]} isEditable={true} />)

      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      expect(screen.getByPlaceholderText('Add new skill...')).toBeInTheDocument()
    })
  })
})
