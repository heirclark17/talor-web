import React, { useState } from 'react'
import { Edit2, Check, X, Plus, Trash2 } from 'lucide-react'

interface EditableSkillsListProps {
  title: string
  skills: string[]
  isEditable?: boolean
  onSave?: (newSkills: string[]) => void
  className?: string
}

export default function EditableSkillsList({
  title,
  skills,
  isEditable = false,
  onSave,
  className = ''
}: EditableSkillsListProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSkills, setEditedSkills] = useState<string[]>([...skills])
  const [newSkill, setNewSkill] = useState('')

  const handleSave = () => {
    if (onSave) {
      onSave(editedSkills.filter(s => s.trim() !== ''))
    }
    setIsEditing(false)
    setNewSkill('')
  }

  const handleCancel = () => {
    setEditedSkills([...skills])
    setNewSkill('')
    setIsEditing(false)
  }

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setEditedSkills([...editedSkills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const handleDeleteSkill = (index: number) => {
    setEditedSkills(editedSkills.filter((_, i) => i !== index))
  }

  const handleEditSkill = (index: number, value: string) => {
    const updated = [...editedSkills]
    updated[index] = value
    setEditedSkills(updated)
  }

  return (
    <div className={`glass rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {isEditable && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
        {isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {editedSkills.map((skill, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => handleEditSkill(index, e.target.value)}
                className="flex-1 bg-white/5 text-white rounded-lg px-3 py-2 border border-white/20 focus:border-white/40 focus:outline-none"
              />
              <button
                onClick={() => handleDeleteSkill(index)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              placeholder="Add new skill..."
              className="flex-1 bg-white/5 text-white rounded-lg px-3 py-2 border border-white/20 focus:border-white/40 focus:outline-none placeholder-gray-500"
            />
            <button
              onClick={handleAddSkill}
              className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-white/10 text-white rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
