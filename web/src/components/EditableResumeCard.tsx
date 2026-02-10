import React, { useState } from 'react'
import { Edit2, Check, X } from 'lucide-react'

interface EditableResumeCardProps {
  title: string
  content: string
  isEditable?: boolean
  onSave?: (newContent: string) => void
  className?: string
}

export default function EditableResumeCard({
  title,
  content,
  isEditable = false,
  onSave,
  className = ''
}: EditableResumeCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)

  const handleSave = () => {
    if (onSave) {
      onSave(editedContent)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContent(content)
    setIsEditing(false)
  }

  return (
    <div className={`glass rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-theme">{title}</h3>
        {isEditable && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1 text-sm text-theme-secondary hover:text-theme transition-colors rounded-lg hover:bg-theme-glass-10"
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
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full min-h-[150px] bg-theme-glass-5 text-theme rounded-lg p-4 border border-theme-muted focus:border-theme focus:outline-none resize-vertical"
          autoFocus
        />
      ) : (
        <div className="text-theme-secondary whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      )}
    </div>
  )
}
